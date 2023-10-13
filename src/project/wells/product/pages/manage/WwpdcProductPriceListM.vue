<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcProductPriceListM - 판매상품 관리 - ( W-PD-U-0070M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.09.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 가격 목록 조회 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      ref="searchRef"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 상품구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_GUBUN')"
        >
          <kw-select
            v-model="searchParams.pdTpCd"
            :options="codes.PD_TP_CD"
            @update:model-value="onUpdateProductType"
          />
        </kw-search-item>
        <!-- 상품코드 -->
        <kw-search-item :label="$t('MSG_TXT_PRDT_CODE')">
          <kw-input
            v-model="searchParams.pdCd"
            maxlength="10"
          />
        </kw-search-item>
        <!-- 상품명 -->
        <kw-search-item :label="$t('MSG_TXT_PRDT_NM')">
          <kw-input
            v-model="searchParams.pdNm"
            maxlength="100"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 상품분류 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CATE')"
          :colspan="2"
        >
          <zwpd-product-classification-select
            ref="productSelRef"
            v-model:product1-level="searchParams.prdtCateHigh"
            v-model:product2-level="searchParams.prdtCateMid"
            v-model:product3-level="searchParams.prdtCateLow"
            v-model:product4-level="searchParams.prdtCateLowDtl"
            v-model:pd-tp-cd="searchParams.pdTpCd"
            :search-lvl="prdtCateLevel"
            first-option="all"
            :is-show-keyword="false"
            :readonly="searchParams.pdTpCd === 'C'"
          />
        </kw-search-item>
        <!-- 판매기간 -->
        <kw-search-item :label="$t('MSG_TXT_PRDT_SLE_PRD')">
          <kw-date-range-picker
            v-model:from="searchParams.sellStartDt"
            v-model:to="searchParams.sellEndDt"
          />
          <!-- rules="date_range_months:1" -->
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 판매유형 -->
        <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
          <kw-select
            v-model="searchParams.sellTpCd"
            :model-value="split(trim(searchParams.sellTpCd), ',')?.filter(i => i === 0 || i) ?? []"
            :options="codes.SELL_TP_CD"
            multiple
            :readonly="searchParams.pdTpCd === 'C'"
          />
        </kw-search-item>
        <!-- 사은품 여부 -->
        <kw-search-item
          :label="$t('TXT_MSG_FGPT_YN')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.fgptYn"
            :options="pdConst.YN_CODES"
            first-option="all"
          />
        </kw-search-item>
        <!-- 판매채널 -->
        <kw-search-item :label="$t('MSG_TXT_SEL_CHNL')">
          <kw-select
            v-model="searchParams.channelId"
            :model-value="split(trim(searchParams.channelId), ',')?.filter(i => i === 0 || i) ?? []"
            :options="codes.SELL_CHNL_DTL_CD"
            multiple
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 판매여부 -->
        <kw-search-item
          :label="$t('MSG_TXT_SLE_YN')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.sellYn"
            :options="pdConst.YN_CODES"
            first-option="all"
          />
        </kw-search-item>
        <!-- 계약(약정)개월 -->
        <kw-search-item :label="$t('MSG_TXT_CON_MONTHS')">
          <kw-input
            v-model="searchParams.months"
            type="number"
            maxlength="4"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-btn
          icon="download_on"
          secondary
          dense
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        v-show="searchParams.pdTpCd === pdConst.PD_TP_CD_STANDARD"
        ref="grdStdRef"
        name="grdStandard"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdStd"
      />
      <kw-grid
        v-show="searchParams.pdTpCd === pdConst.PD_TP_CD_COMPOSITION"
        ref="grdCmpRef"
        name="grdComposition"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdCmp"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useMeta, gridUtil, stringUtil, codeUtil, getComponentType } from 'kw-lib';
import { merge, isEmpty, cloneDeep, split, trim } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { getPdMetaToCodeNames, getPdMetaToGridInfos } from '~sms-common/product/utils/pdUtil';
import ZwpdProductClassificationSelect from '~sms-common/product/pages/standard/components/ZwpdyClassification.vue';

const { t } = useI18n();
const dataService = useDataService();
const router = useRouter();
const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchRef = ref(getComponentType('KwSearch'));
const grdStdRef = ref(getComponentType('KwGrid'));
const grdCmpRef = ref(getComponentType('KwGrid'));
const priceStdMetaInfos = ref();
const priceCmpMetaInfos = ref();
const priceCodes = ref({});
const priceVariables = ref();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'PD_TP_CD',
  'SELL_CHNL_DTL_CD',
  'SELL_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'PD_TEMP_SAVE_CD',
);
codes.PD_TP_CD = codes.PD_TP_CD
  ?.filter((item) => [pdConst.PD_TP_CD_STANDARD, pdConst.PD_TP_CD_COMPOSITION].includes(item.codeId));

const prdtCateLevel = ref('4');
let cachedParams;
const searchParams = ref({
  pdTpCd: pdConst.PD_TP_CD_STANDARD,
  pdNm: '',
  pdCd: '',
  pdClsfCd: '',
  prdtCateHigh: '',
  prdtCateMid: '',
  prdtCateLow: '',
  prdtCateLowDtl: '',
  sellYn: '',
  sellStartDt: '',
  sellEndDt: '',
  sellTpCd: '',
  fgptYn: '',
  channelId: '',
  exceptPdCd: '',
  months: '',
});

// 데이터 불러오기
async function fetchData() {
  const res = await dataService.get('/sms/common/product/prices/products/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: prices, pageInfo: pagingResult } = res.data;
  console.log('ZwpdcStandardPriceListP - fetchData : ', prices);
  pageInfo.value = pagingResult;

  const view = searchParams.value.pdTpCd === pdConst.PD_TP_CD_STANDARD
    ? grdStdRef.value.getView() : grdCmpRef.value.getView();
  view.getDataSource().setRows(prices);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 상품 메타 데이터 불러오기
async function fetchMetaData() {
  const res = await dataService.get('/sms/common/product/meta-properties', { params: { pdPrcTpCd: pdConst.PD_PRC_TP_CD_ALL } });
  if (isEmpty(res.data)) {
    return;
  }
  priceStdMetaInfos.value = res.data;

  const res2 = await dataService.get('/sms/common/product/meta-properties', { params: { pdPrcTpCd: pdConst.PD_PRC_TP_CD_COMPOSITION } });
  if (isEmpty(res2.data)) {
    return;
  }
  priceCmpMetaInfos.value = res2.data;

  const codeNames = await getPdMetaToCodeNames(priceStdMetaInfos.value, priceCodes.value);
  codeNames.push(...await getPdMetaToCodeNames(priceCmpMetaInfos.value, priceCodes.value));
  if (codeNames && codeNames.length) {
    try {
      priceCodes.value = merge(priceCodes.value, await codeUtil.getMultiCodes(...codeNames));
    } catch (e) {
      console.log(e);
      // 공통코드 없는 에러 때문에 임시 - 추후 Try catch 삭제
    }
  }
}

// 조회
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  if (!Number(searchParams.value.months)) {
    searchParams.value.months = '';
  }
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = searchParams.value.pdTpCd === pdConst.PD_TP_CD_STANDARD
    ? grdStdRef.value.getView() : grdCmpRef.value.getView();
  const res = await dataService.get('/sms/common/product/prices/products/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: router.currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 변수 데이터 불러오기
async function fetchVariableData() {
  // 변수
  const typeRes = await dataService.get('/sms/common/product/type-variables');
  if (typeRes.data && typeRes.data.length) {
    priceVariables.value = cloneDeep(typeRes.data);
    const view = grdStdRef.value.getView();
    priceVariables.value.forEach((field) => {
      const column = view.columnByName(field.codeId);
      if (column) {
        column.visible = true;
      }
    });
  }
}

// 상품구분 변경
async function onUpdateProductType() {
  grdStdRef.value?.getView().getDataSource().clearRows();
  grdCmpRef.value?.getView().getDataSource().clearRows();
  pageInfo.value.totalCount = 0;
  pageInfo.value.pageIndex = 1;
  if (searchParams.value.pdTpCd !== pdConst.PD_TP_CD_STANDARD) {
    searchParams.valuepdClsfCd = '';
    searchParams.valueprdtCateHigh = '';
    searchParams.valueprdtCateMid = '';
    searchParams.valueprdtCateLow = '';
    searchParams.valueprdtCateLowDtl = '';
    searchParams.value.sellTpCd = '';
  }
  pageInfo.value.pageSize = Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE'));
}

await fetchMetaData();

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrdStd(data, view) {
  priceStdMetaInfos.value.map((item) => {
    if (item.colNm === 'fnlVal') {
      // 최종가격
      item.prpNm = t('MSG_TXT_PD_FNL_PRC');
    }
    return item;
  });
  const prcMetaGroups = [pdConst.PD_PRC_TP_CD_BASIC,
    pdConst.PD_PRC_TP_CD_VARIABLE,
    pdConst.PD_PRC_TP_CD_FINAL,
    pdConst.PD_PRC_TP_CD_FEE];

  const pdColumns = [
    // 판매여부
    { fieldName: 'sellYn', header: t('MSG_TXT_SLE_YN'), width: '80', styleName: 'text-center' },
    // 상품분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_CATE'), width: '240' },
    // 상품명
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '195' },
    // 상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '120', styleName: 'text-center' },
    // 판매기간
    { fieldName: 'sellDurtion', header: t('MSG_TXT_PRDT_SLE_PRD'), width: '180', styleName: 'text-center' },
    // 사은품 여부
    { fieldName: 'fgptYn', header: t('TXT_MSG_FGPT_YN'), width: '80', styleName: 'text-center' },
  ];

  const pdFields = pdColumns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  const { fields, columns } = await getPdMetaToGridInfos(
    priceStdMetaInfos.value,
    prcMetaGroups,
    priceCodes.value,
    [],
    [],
    ['pdPrcDtlId', 'pdPrcFnlDtlId'],
    ['pdCd'],
  );

  // 적용기간
  const applyPeriodCol = { fieldName: 'applyPeriod',
    header: t('MSG_TXT_ACEPT_PERIOD'),
    width: '200',
    styleName: 'text-center',
    displayCallback(grid, index) {
      const vlStrtDtm = grid.getValue(index.itemIndex, 'vlStrtDtm');
      const vlEndDtm = grid.getValue(index.itemIndex, 'vlEndDtm');
      if (vlStrtDtm || vlEndDtm) {
        return `${stringUtil.getDateFormat(vlStrtDtm)} ~ ${stringUtil.getDateFormat(vlEndDtm)}`;
      }
      return '';
    },
  };
  columns.splice(1, 0, applyPeriodCol);
  columns.forEach((item) => {
    if (item.fieldName === 'svPdCd') {
      item.displayCallback = (grid, index) => {
        const { svPdNm } = grid.getValues(index.itemIndex);
        return svPdNm;
      };
    }
  });

  fields.push({ fieldName: 'applyPeriod' });
  fields.push({ fieldName: 'svPdNm' });
  fields.push({ fieldName: 'tempSaveYn' });
  columns.sort((item) => (item.fieldName === 'sellChnlCd' ? -1 : 0))
    .map((item) => {
      // 적용 시작일자, 종료일자 숨김
      if (['vlStrtDtm', 'vlEndDtm'].includes(item.fieldName)) {
        item.visible = false;
      }
      return item;
    });

  pdColumns.push(...columns);
  pdFields.push(...fields);

  pdColumns.forEach((item) => {
    // '렌탈할인구분'과 '렌탈할인유형' 표시
    if (['rentalDscDvCd', 'rentalDscTpCd'].includes(item.fieldName)) {
      item.visible = true;
    }
  });

  // console.log('WwpdcStandardDtlMPrice - initGrid - columns : ', columns);
  data.setFields(pdFields);
  view.setColumns(pdColumns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;
}

async function initGrdCmp(data, view) {
  const pdColumns = [
    // 판매여부
    { fieldName: 'sellYn', header: t('MSG_TXT_SLE_YN'), width: '80', styleName: 'text-center' },
    // 상품명
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '195' },
    // 상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '120', styleName: 'text-center' },

    // 기준상품명
    { fieldName: 'basePdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '126' },
    // 기준상품코드
    { fieldName: 'basePdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '115', styleName: 'text-center', dataType: 'date' },
    // 판매유형
    { fieldName: 'baseSellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '107', styleName: 'text-center', options: codes?.SELL_TP_CD },
    // 판매채널
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_CHNL'), width: '87', styleName: 'text-center', options: codes?.SELL_CHNL_DTL_CD },
    // 적용기간
    { fieldName: 'applyPeriod',
      header: t('MSG_TXT_ACEPT_PERIOD'),
      width: '200',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const vlStrtDtm = grid.getValue(index.itemIndex, 'vlStrtDtm');
        const vlEndDtm = grid.getValue(index.itemIndex, 'vlEndDtm');
        if (vlStrtDtm || vlEndDtm) {
          return `${stringUtil.getDateFormat(vlStrtDtm)} ~ ${stringUtil.getDateFormat(vlEndDtm)}`;
        }
        return '';
      },
    },

  ];

  const pdFields = pdColumns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  pdFields.push({ fieldName: 'vlStrtDtm' });
  pdFields.push({ fieldName: 'vlEndDtm' });
  priceCmpMetaInfos.value.map((item) => { item.readEuYn = 'Y'; return item; });
  const { fields, columns } = await getPdMetaToGridInfos(
    priceCmpMetaInfos.value,
    [pdConst.PD_PRC_TP_CD_COMPOSITION],
    priceCodes.value,
    [],
    [],
    [],
    ['sellYn', 'pdNm', 'pdCd', 'basePdCd', 'sellChnlCd', 'sellTpCd', 'vlStrtDtm', 'vlEndDtm'],
  );

  pdColumns.push(...columns);
  pdFields.push(...fields);

  // console.log('WwpdcStandardDtlMPrice - initGrid - columns : ', columns);
  data.setFields(pdFields);
  view.setColumns(pdColumns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;

  // 변수 Visible 적용 ( 변수값 = Grid Filed명 )
  await fetchVariableData();
}
</script>
<style scoped></style>
