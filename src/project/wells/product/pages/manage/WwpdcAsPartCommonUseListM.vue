<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcAsPartCommonUseListM - AS부품 공용관리 (W-PD-U-0050M01)
3. 작성자 : domin.pyun
4. 작성일 : 2023.06.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- AS부품 목록 조회 및 연결된 제품 목록 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      ref="searchRef"
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 조회조건 -->
        <kw-search-item :label="$t('MSG_TIT_SEARCH')">
          <kw-option-group
            v-model="searchParams.type"
            type="radio"
            :label="$t('MSG_TIT_SEARCH')"
            :options="codes.SEARCH_PD_TYPE_GUBUN"
            @update:model-value="() => {
              if (searchParams.type === '2') {
                searchParams.gubun = '1';
                searchParams.sapItemCdFrom = '';
                searchParams.sapItemCdTo = '';
                setPrdtCate('default');
              } else {
                if (searchParams.gubun === '2') {
                  setPrdtCate('init');
                } else {
                  setPrdtCate('default');
                }
              }
              initGridData();
            }"
          />
        </kw-search-item>
        <!-- 제품명 -->
        <kw-search-item :label="$t('MSG_TXT_GOODS_NM')">
          <kw-input
            v-model.trim="searchParams.pdNm"
            :maxlength="100"
          />
        </kw-search-item>
        <!-- 제품코드 -->
        <kw-search-item :label="$t('MSG_TXT_PROD_CD')">
          <kw-input
            v-model.trim="searchParams.pdCd"
            :maxlength="10"
            clearable
            icon="search"
            @click-icon="onClickProduct()"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 조회구분 -->
        <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
          <kw-option-group
            v-model="searchParams.gubun"
            type="radio"
            :label="$t('MSG_TIT_SEARCH')"
            :options="searchParams.type === '1' ? codes.SEARCH_COND_GUBUN : codes.SEARCH_COND_GUBUN_2"
            @update:model-value="() => {
              if (searchParams.gubun === '2') {
                setPrdtCate('init');
              } else {
                setPrdtCate('default');
              }
            }"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CATE')"
          :colspan="2"
        >
          <zwpd-product-classification-select
            ref="productSelRef"
            v-model:product1-level="searchParams.prdtCateHigh"
            v-model:product2-level="searchParams.prdtCateMid"
            v-model:product3-level="searchParams.prdtCateLow"
            v-model:pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
            first-option="all"
            search-lvl="3"
            :disable="searchParams.gubun === '2'"
            :readonly1="searchParams.type === '1'"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row
        v-if="searchParams.gubun === '2'"
      >
        <kw-search-item
          :label="$t('MSG_TXT_ITM_KND')"
        >
          <kw-select
            v-model="searchParams.asMatItmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_GRP')"
        >
          <kw-select
            v-model="searchParams.asMatItmGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('TXT_MSG_SAP_MAT_GRP_VAL')"
        >
          <kw-select
            v-model="searchParams.svMatGrpCd"
            :options="codes.SV_MAT_GRP_CD"
            :disable="searchParams.gubun === '1'"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 자재코드 -->
        <kw-search-item :label="$t('MSG_TXT_MATI_CD')">
          <kw-input
            v-model.trim="searchParams.sapMatCd"
            :maxlength="20"
            clearable
            icon="search"
            @click-icon="onClickSapMaterial()"
          />
        </kw-search-item>
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('TXT_MSG_AS_ITM_CD')"
          :colspan="2"
        >
          <kw-input
            v-model.trim="searchParams.sapItemCdFrom"
            class="mr8"
            mask="#####-######"
            :rules="sapItemCdFromValidation"
            :disable="searchParams.type === '2'"
            clearable
          />
          ~
          <kw-input
            v-model.trim="searchParams.sapItemCdTo"
            mask="#####-######"
            :rules="sapItemCdToValidation"
            :disable="searchParams.type === '2'"
            clearable
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <div class="grid-horizontal-wrap">
        <template
          v-if="searchParams.type === '1'"
        >
          <div class="grid-horizontal-wrap__section">
            <h3>{{ $t('MSG_TXT_PART_LIST') }}</h3>
            <kw-action-top>
              <template #left>
                <kw-paging-info
                  :total-count="totalCount.asParts"
                />
              </template>
              <kw-btn
                v-permission:download
                icon="download_on"
                dense
                secondary
                :label="$t('MSG_BTN_EXCEL_DOWN')"
                :disable="totalCount.asParts === 0"
                @click="onClickExcelDownloadForAsParts"
              />
            </kw-action-top>
            <kw-grid
              ref="grdMainRef"
              name="grdMain"
              :page-size="Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE'))"
              :total-count="totalCount.asParts"
              @init="initGridMain"
            />
          </div>
          <div class="grid-horizontal-wrap__section">
            <h3>{{ $t('MSG_TXT_PDCT_LIST') }}</h3>
            <kw-action-top>
              <template #left>
                <kw-paging-info
                  :total-count="totalCount.products"
                />
              </template>
              <kw-btn
                v-permission:download
                icon="download_on"
                dense
                secondary
                :label="$t('MSG_BTN_EXCEL_DOWN')"
                :disable="totalCount.products === 0"
                @click="onClickExcelDownloadForProducts"
              />
            </kw-action-top>
            <kw-grid
              ref="grdDetailRef"
              name="grdDetail"
              :page-size="Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE'))"
              :total-count="totalCount.products"
              @init="initGridDetail"
            />
          </div>
        </template>
        <template
          v-else
        >
          <div class="grid-horizontal-wrap__section">
            <h3>{{ $t('MSG_TXT_PDCT_LIST') }}</h3>
            <kw-action-top>
              <template #left>
                <kw-paging-info
                  :total-count="totalCount.products"
                />
              </template>
              <kw-btn
                v-permission:download
                icon="download_on"
                dense
                secondary
                :label="$t('MSG_BTN_EXCEL_DOWN')"
                :disable="totalCount.products === 0"
                @click="onClickExcelDownloadForProducts"
              />
            </kw-action-top>
            <kw-grid
              ref="grdDetailRef"
              name="grdDetail"
              :page-size="Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE'))"
              :total-count="totalCount.products"
              @init="initGridDetail"
            />
          </div>
          <div class="grid-horizontal-wrap__section">
            <h3>{{ $t('MSG_TXT_PART_LIST') }}</h3>
            <kw-action-top>
              <template #left>
                <kw-paging-info
                  :total-count="totalCount.asParts"
                />
              </template>
              <kw-btn
                v-permission:download
                icon="download_on"
                dense
                secondary
                :label="$t('MSG_BTN_EXCEL_DOWN')"
                :disable="totalCount.asParts === 0"
                @click="onClickExcelDownloadForAsParts"
              />
            </kw-action-top>
            <kw-grid
              ref="grdMainRef"
              name="grdMain"
              :page-size="Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE'))"
              :total-count="totalCount.asParts"
              @init="initGridMain"
            />
          </div>
        </template>
      </div>
    </div>
  </kw-page>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useMeta, useDataService, gridUtil, codeUtil, useGlobal, getComponentType, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwpdProductClassificationSelect from '~sms-common/product/pages/standard/components/ZwpdyClassification.vue';
import pdConst from '~sms-common/product/constants/pdConst';

const { modal } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdDetailRef = ref(getComponentType('KwGrid'));
const productSelRef = ref(null);
const paramDetailKey = ref('');
const searchRef = ref();

const codes = await codeUtil.getMultiCodes(
  'MAT_MNGT_DV_CD',
  'ITM_KND_CD',
  'PD_GRP_CD',
  'SV_MAT_GRP_CD',
  'CMN_PART_DV_CD',
);
codes.SEARCH_COND_GUBUN = [
  { codeId: '1', codeName: t('MSG_TXT_PRDT_CATE') },
  { codeId: '2', codeName: t('MSG_TXT_AS_PRP') },
];
codes.SEARCH_COND_GUBUN_2 = [
  { codeId: '1', codeName: t('MSG_TXT_PRDT_CATE') },
];
codes.SEARCH_PD_TYPE_GUBUN = [
  { codeId: '1', codeName: t('MSG_TXT_PART_PRODUCT') },
  { codeId: '2', codeName: t('MSG_TXT_PDCT') },
];

let cachedParams;
const searchParams = ref({
  type: '1', // 조회조건
  gubun: '1', // 상품구분
  prdtCateHigh: '',
  prdtCateMid: '',
  prdtCateLow: '',
  asMatItmKndCd: '',
  asMatItmGrpCd: '',
  svMatGrpCd: '',
  pdCd: '',
  sapMatCd: '',
  sapItemCdFrom: '',
  sapItemCdTo: '',
  partPdCdForExcel: '',
  partPdNmForExcel: '',
});

const totalCount = ref({
  asParts: 0,
  products: 0,
});

const isSearchInit = ref(false);

// 자재코드 조회팝업(sapMatCd)
async function onClickSapMaterial() {
  const { result, payload } = await modal({
    component: 'ZwpdcMaterialsCodeListP',
    componentProps: {
      searchType: pdConst.PD_SEARCH_PRODUCT,
      selectType: pdConst.PD_SEARCH_SINGLE,
      searchValue: searchParams.value.sapMatCd,
    },
  });

  if (result) searchParams.value.sapMatCd = payload.sapMatCd;
}

// 제품코드 조회팝업
async function onClickProduct() {
  const { result, payload } = await modal({
    component: 'ZwpdcMaterialsSelectListP',
    componentProps: {
      searchType: pdConst.PD_SEARCH_CODE,
      searchValue: searchParams.value.pdCd,
      selectType: pdConst.PD_SEARCH_SINGLE,
      searchLvl: 3,
    },
  });

  // if (result) searchParams.value.pdCd = payload.checkedRows[0]?.pdCd;
  if (result) searchParams.value.pdCd = payload.pdCd || payload.checkedRows[0]?.pdCd;
}

// AS부품 관련 제품 목록 조회
async function fetchProductDataByPart(partPdCd, partPdNm) {
  paramDetailKey.value = partPdCd;
  const res = await dataService.get(`/sms/wells/product/as-common-uses/product/${partPdCd}`);
  const result = res.data;
  totalCount.value.products = result.length;

  const view = grdDetailRef.value.getView();
  view.getDataSource().setRows(result);

  // 엑셀다운로드용 검색조건 설정
  view.__searchConditionText__ = `[${t('MSG_TXT_SEARCH_COND')}]\n${t('MSG_TXT_PART_CD')} : ${partPdCd}\n${t('MSG_TXT_PART_NM')} : ${partPdNm}\n`;
}

// AS부품 목록 조회
async function fetchAsPartData() {
  const res = await dataService.get('/sms/wells/product/as-common-uses/parts', { params: cachedParams });
  const result = res.data;
  totalCount.value.asParts = result.length;

  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(result);

  if (result.length > 0) {
    view.setCurrent(0);
    fetchProductDataByPart(result[0].partPdCd, result[0].partPdNm);
  }
}

// 제품 관련 AS부품 목록 조회
async function fetchAsPartDataByProduct(pdCd, pdNm) {
  paramDetailKey.value = pdCd;
  const res = await dataService.get(`/sms/wells/product/as-common-uses/part/${pdCd}`);
  const result = res.data;
  totalCount.value.asParts = result.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(result);

  // 엑셀다운로드용 검색조건 설정
  view.__searchConditionText__ = `[${t('MSG_TXT_SEARCH_COND')}]\n${t('MSG_TXT_PROD_CD')} : ${pdCd}\n${t('MSG_TXT_GOODS_NM')} : ${pdNm}\n`;
}

// 제품 목록 조회
async function fetchProductData() {
  const res = await dataService.get('/sms/wells/product/as-common-uses/products', { params: cachedParams });
  const result = res.data;
  totalCount.value.products = result.length;

  const view = grdDetailRef.value.getView();

  view.getDataSource().setRows(result);

  if (result.length > 0) {
    view.setCurrent(0);
    fetchAsPartDataByProduct(result[0].pdCd, result[0].pdNm);
  }
}

// 조회 버튼 이벤트
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  grdMainRef.value.getView().getDataSource().clearRows();
  grdDetailRef.value.getView().getDataSource().clearRows();
  if (searchParams.value.type === '1') {
    await fetchAsPartData();
  } else {
    await fetchProductData();
  }
}

// AS부품 목록 엑셀 다운로드
async function onClickExcelDownloadForAsParts() {
  const view = grdMainRef.value.getView();
  const res = ref({});
  if (searchParams.value.type === '1') {
    res.value = await dataService.get('/sms/wells/product/as-common-uses/parts', { params: cachedParams });
  } else {
    res.value = await dataService.get(`/sms/wells/product/as-common-uses/part/${paramDetailKey.value}`);
  }

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_PART_LIST')}`,
    timePostfix: true,
    exportData: res.value.data,
  });
}

// 제품 목록 엑셀 다운로드
async function onClickExcelDownloadForProducts() {
  const view = grdDetailRef.value.getView();
  const res = ref({});
  if (searchParams.value.type === '1') {
    res.value = await dataService.get(`/sms/wells/product/as-common-uses/product/${paramDetailKey.value}`);
  } else {
    res.value = await dataService.get('/sms/wells/product/as-common-uses/products', { params: cachedParams });
  }

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_PDCT_LIST')}`,
    timePostfix: true,
    exportData: res.value.data,
  });
}

// 자재코드(시작) Validation
const sapItemCdFromValidation = async (val) => {
  const errors = [];
  if (!(isEmpty(val) || val.length === 11)) {
    errors.push(t('MSG_ALT_CHECK_DIGIT_1ST_COND'));
  }
  if (!isEmpty(val) && isEmpty(searchParams.value.sapItemCdTo)) {
    errors.push(t('MSG_ALT_KEY_IN_ALL_RANGE'));
  }
  return errors[0] || true;
};

// 자재코드(종료) Validation
const sapItemCdToValidation = async (val) => {
  const errors = [];
  if (!(isEmpty(val) || val.length === 11)) {
    errors.push(t('MSG_ALT_CHECK_DIGIT_2ND_COND'));
  }
  if (!isEmpty(val) && isEmpty(searchParams.value.sapItemCdFrom)) {
    errors.push(t('MSG_ALT_KEY_IN_ALL_RANGE'));
  }
  return errors[0] || true;
};

// AS부품분류 default 설정
function setPrdtCate(type) {
  if (type === 'init') {
    searchParams.value.prdtCateHigh = '';
    searchParams.value.prdtCateMid = '';
    searchParams.value.prdtCateLow = '';
  } else if (type === 'default') {
    searchParams.value.asMatItmKndCd = '';
    searchParams.value.asMatItmGrpCd = '';
    searchParams.value.svMatGrpCd = '';
    setTimeout(() => {
      searchParams.value.prdtCateHigh = '';
      if (searchParams.value.type === '1') {
        searchParams.value.prdtCateHigh = pdConst.ASPART_COMMON_USE_PD_CATE_HIGH; // 대분류 default : 고객지원
        if (!isSearchInit.value) {
          searchRef.value.init();
          isSearchInit.value = true;
        }
      }
    }, 100);
  }
}

// 그리드 초기화
function initGridData() {
  grdMainRef.value.getView().getDataSource().clearRows();
  grdDetailRef.value.getView().getDataSource().clearRows();
  totalCount.value.asParts = 0;
  totalCount.value.products = 0;
}

// Html 예외문자 대체
function replaceHtmlExceptChar(oldChar) {
  return String(oldChar)?.replaceAll('<', '&lt;').replace('>', '&gt;');
}

onMounted(async () => {
  await setPrdtCate('default'); // 대분류 default 설정
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'partPdCd' }, /* 부품코드 */
    { fieldName: 'partPdNm' }, /* 부품명 */
    { fieldName: 'partPdAbbrNm' }, /* 부품약어명 */
    { fieldName: 'asMatMngTpCd' }, /* 관리유형코드 */
    { fieldName: 'asMatMngTpNm' }, /* 관리유형명 */
    { fieldName: 'sapMatCd' }, /* 자재코드 */
    { fieldName: 'asItemCd' }, /* 품목코드 */
    { fieldName: 'asMatItmKndCd' }, /* 품목종류 */
    { fieldName: 'asMatItmKndNm' }, /* 품목종류명 */
    { fieldName: 'asMatItmGrpCd' }, /* 품목그룹 */
    { fieldName: 'asMatItmGrpNm' }, /* 품목그룹명 */
    { fieldName: 'svMatGrpCd' }, /* 자재그룹코드 */
    { fieldName: 'svMatGrpNm' }, /* 자재그룹명 */
    { fieldName: 'asMatCmnClsfCd' }, /* AS자재 공통분류코드 */
    { fieldName: 'asMatCmnClsfNm' }, /* AS자재 공통분류명 */
    { fieldName: 'ordnyHvMatYn' }, /* 상시보유자재여부 */
    { fieldName: 'trnovrRtOjYn' }, /* 회전율 대상여부 */
  ];
  const columns = [
    { fieldName: 'asMatMngTpCd', header: t('MSG_TXT_MGT_TYP'), width: '100', styleName: 'text-center', options: codes.MAT_MNGT_DV_CD, visible: false }, /* 관리유형 */
    { fieldName: 'partPdCd', header: t('MSG_TXT_PROD_CD'), width: '120', styleName: 'text-center' }, /* 제품코드 */
    { fieldName: 'partPdNm', header: t('TXT_MSG_MAT_PD_NM'), width: '300' }, /* 제품명 */
    { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '170', styleName: 'text-center' }, /* 자재코드 */
    { fieldName: 'asItemCd', header: t('TXT_MSG_AS_ITM_CD'), width: '130', styleName: 'text-center' }, /* 품목코드 */
    { fieldName: 'asMatItmKndCd', header: t('MSG_TXT_ITM_KND'), width: '90', styleName: 'text-center', options: codes.ITM_KND_CD }, /* 품목종류 */
    { fieldName: 'asMatItmGrpCd', header: t('MSG_TXT_ITM_GRP'), width: '130', styleName: 'text-center', options: codes.PD_GRP_CD }, /* 품목그룹 */
    { fieldName: 'svMatGrpCd', header: t('TXT_MSG_SAP_MAT_GRP_VAL'), width: '130', styleName: 'text-center', options: codes.SV_MAT_GRP_CD, visible: false }, /* 자재그룹 */
    { fieldName: 'asMatCmnClsfCd', header: t('MSG_TXT_CMN_PART'), width: '130', styleName: 'text-center', options: codes.CMN_PART_DV_CD, visible: false }, /* 공통부품 */
    { fieldName: 'ordnyHvMatYn', header: t('TXT_MSG_ORDNY_HV_MAT_YN'), width: '120', styleName: 'text-center', visible: false }, /* 상시보유자재여부 */
    { fieldName: 'trnovrRtOjYn', header: t('TXT_MSG_TURNR_OJ_YN'), width: '120', styleName: 'text-center', visible: false }, /* 회전율 대상여부 */
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.onCellClicked = async (grid, clickData) => {
    if (totalCount.value.asParts > 0 && searchParams.value.type === '1') {
      const partPdCd = grid.getValue(clickData.itemIndex, 'partPdCd');
      const partPdNm = grid.getValue(clickData.itemIndex, 'partPdNm');
      fetchProductDataByPart(partPdCd, partPdNm);
    }
  };
  view.onShowTooltip = (grid, index, value) => {
    const { column } = index;
    const { itemIndex } = index;
    let tooltip = value;
    if (column === 'partPdNm') {
      tooltip = replaceHtmlExceptChar(`${grid.getValue(itemIndex, 'partPdNm')} ( ${grid.getValue(itemIndex, 'partPdAbbrNm')} )`);
    }
    return tooltip;
  };
});

const initGridDetail = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pdCd' }, /* 제품코드 */
    { fieldName: 'pdNm' }, /* 제품명 */
    { fieldName: 'pdAbbrNm' }, /* 제품약어명 */
    { fieldName: 'sapMatCd' }, /* 자재코드 */
    { fieldName: 'asItemCd' }, /* 품목코드 */
    { fieldName: 'asMatItmKndCd' }, /* 품목종류 */
    { fieldName: 'asMatItmKndNm' }, /* 품목종류명 */
    { fieldName: 'asMatItmGrpCd' }, /* 품목그룹 */
    { fieldName: 'asMatItmGrpNm' }, /* 품목그룹명 */
  ];
  const columns = [
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '120', styleName: 'text-center' }, /* 제품코드 */
    { fieldName: 'pdNm', header: t('TXT_MSG_MAT_PD_NM'), width: '200' }, /* 제품명 */
    { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '170', styleName: 'text-center' }, /* 자재코드 */
    { fieldName: 'asItemCd', header: t('TXT_MSG_AS_ITM_CD'), width: '130', styleName: 'text-center' }, /* 품목코드 */
    { fieldName: 'asMatItmKndCd', header: t('MSG_TXT_ITM_KND'), width: '90', styleName: 'text-center', options: codes.ITM_KND_CD }, /* 품목종류 */
    { fieldName: 'asMatItmGrpCd', header: t('MSG_TXT_ITM_GRP'), width: '130', styleName: 'text-center', options: codes.PD_GRP_CD }, /* 품목그룹 */
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.onCellClicked = async (grid, clickData) => {
    if (totalCount.value.products > 0 && searchParams.value.type === '2') {
      const pdCd = grid.getValue(clickData.itemIndex, 'pdCd');
      const pdNm = grid.getValue(clickData.itemIndex, 'pdNm');
      fetchAsPartDataByProduct(pdCd, pdNm);
    }
  };
  view.onShowTooltip = (grid, index, value) => {
    const { column } = index;
    const { itemIndex } = index;
    let tooltip = value;
    if (column === 'pdNm') {
      tooltip = replaceHtmlExceptChar(`${grid.getValue(itemIndex, 'pdNm')} ( ${grid.getValue(itemIndex, 'pdAbbrNm')} )`);
    }
    return tooltip;
  };
});

</script>
<style scoped></style>
