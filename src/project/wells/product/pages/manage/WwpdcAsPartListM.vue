<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcAsPartListM - 교재/자재 목록 (W-PD-U-0040M01)
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 교재/자재 목록 조회 및 선택 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 상품구분 -->
        <kw-search-item :label="$t('MSG_TXT_PRDT_GUBUN')">
          <kw-select
            v-model="searchParams.pdTpCd"
            :options="codes.PD_TP_CD"
            :readonly="true"
          />
        </kw-search-item>
        <!-- 교재/자재명 -->
        <kw-search-item :label="$t('MSG_TIT_MATERIAL_NM')">
          <kw-input
            v-model.trim="searchParams.pdNm"
          />
        </kw-search-item>
        <!-- 제품코드 -->
        <kw-search-item :label="$t('MSG_TXT_PROD_CD')">
          <kw-input
            v-model.trim="searchParams.pdCd"
            clearable
            icon="search"
            @click-icon="onClickProduct()"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- AS부품 분류 -->
        <kw-search-item
          :label="$t('MSG_TIT_AS_PART_CLASSIFICATION')"
        >
          <zwpd-product-classification-select
            ref="productSelRef"
            v-model:product1-level="searchParams.prdtCateHigh"
            v-model:product2-level="searchParams.prdtCateMid"
            v-model:product3-level="searchParams.prdtCateLow"
            v-model:pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
            first-option="all"
            search-lvl="3"
          />
        </kw-search-item>
        <!-- AS자재번호 -->
        <!--
        <kw-search-item :label="$t('TXT_MSG_AS_MAT_CD')">
          <kw-input
            v-model.trim="searchParams.asMatCd"
          />
        </kw-search-item>
         -->
        <!-- 자재코드 -->
        <kw-search-item :label="$t('MSG_TXT_MATI_CD')">
          <kw-input
            v-model.trim="searchParams.sapMatCd"
            clearable
            icon="search"
            @click-icon="onClickSapMaterial()"
          />
        </kw-search-item>
        <!-- 품목코드 -->
        <kw-search-item :label="$t('TXT_MSG_AS_ITM_CD')">
          <kw-input
            v-model.trim="searchParams.sapItemCdFrom"
            mask="#####-######"
            :rules="sapItemCdFromValidation"
            clearable
          />
          ~
          <kw-input
            v-model.trim="searchParams.sapItemCdTo"
            mask="#####-######"
            :rules="sapItemCdToValidation"
            clearable
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

        <kw-file
          v-show="false"
          ref="attachFileRef"
          v-model="file"
          accept=".xlsx, .xls, .csv"
          @update:model-value="doUpload"
        />
        <kw-btn
          v-permission:create
          icon="upload_on"
          grid-action
          :label="$t('MSG_BTN_EXCEL_UP')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          grid-action
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          grid-action
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_SUMMARY_SRCH')"
          @click="onClickSummarySearch"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          dense
          primary
          :label="$t('MSG_BTN_AS_PART_REG')"
          @click="onClickAdd"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
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
import { useDataService, useMeta, gridUtil, codeUtil, useGlobal, getComponentType, defineGrid, http } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwpdProductClassificationSelect from '~sms-common/product/pages/standard/components/ZwpdProductClassificationSelect.vue';
import pdConst from '~sms-common/product/constants/pdConst';

const { notify, modal } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
const route = useRoute();
const router = useRouter();

const attachFileRef = ref();
const file = ref(null);

const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/product/as-parts';
const codes = await codeUtil.getMultiCodes('PD_TP_CD', 'PD_TEMP_SAVE_CD', 'COD_YN', 'COD_PAGE_SIZE_OPTIONS');
const page = ref({
  reg: '/product/wwpdc-as-part-list/wwpdc-as-part-mgt', // 교재/자재 등록 UI
  detail: '/product/wwpdc-as-part-list/wwpdc-as-part-dtl', // 교재/자재 상세보기 UI
});

const props = defineProps({
  test: { type: String, default: '' },
  state: { type: String, default: '' },
});

let cachedParams;
const searchParams = ref({
  pdTpCd: pdConst.PD_TP_CD_MATERIAL,
  pdNm: '',
  pdCd: '',
  prdtCateHigh: '',
  prdtCateMid: '',
  prdtCateLow: '',
  asMatCd: '',
  sapMatCd: '',
  sapItemCdFrom: '', // 품목코드
  sapItemCdTo: '', // 품목코드
});

// 자재코드 조회팝업(sapMatCd)
async function onClickSapMaterial() {
  const { result, payload } = await modal({
    component: 'ZwpdcMaterialsCodeListP',
    componentProps: {
      searchType: 'sapMatCd',
      selectType: 'SINGLE',
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
      searchType: 'prodCd',
      searchValue: searchParams.value.pdCd,
      selectType: pdConst.PD_SEARCH_SINGLE,
      searchLvl: 3,
    },
  });

  if (result) searchParams.value.pdCd = payload.checkedRows[0].pdCd;
}

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: material, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(material);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelUpload() {
  notify('기능 확인 중... TBD');
  file.value = null;
  attachFileRef.value.reset();
  attachFileRef.value.pickFiles();
}

// Excel Upload 관련 Mehotd 시작
async function doUpload() {
  if (file.value === null || file.value === undefined) {
    return;
  }

  // WAS단으로 넘겨 DRM 해제 및 유효성 체크 후 저장.
  const formData = new FormData();
  formData.append('file', file.value.nativeFile);

  const response = await http.post(`${baseUrl}/excel-upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const { status, errorInfo } = response.data;
  console.debug(status, errorInfo);
  console.table(errorInfo);

  if (pdConst.EXCEL_UPLOAD_SUCCESS !== status && errorInfo.length > 0) {
    await modal({
      component: 'ZwcmzExcelUploadErrorP',
      componentProps: { errorInfo },
    });
  } else {
    notify(t('MSG_ALT_COMPLETE_EXCEL_UPLOAD'));
    await onClickSearch();
  }
}
// Excel Upload 관련 Mehotd 종료

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: router.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickAdd() {
  await router.push({ path: page.value.reg, query: { fromUi: 'Reg' } });
}

async function onClickSummarySearch() {
  const view = grdMainRef.value.getView();

  if (view.getCheckedRows().length === 0) {
    notify(t('MSG_ALT_SELECT_ONE_ROW', [t('MSG_BTN_SUMMARY_SRCH')]));
  } else if (view.getCheckedRows().length > 1) {
    notify(t('MSG_ALT_SELT_ONE_ITEM'));
  } else {
    const checkedRow = gridUtil.getCheckedRowValues(view);

    await modal({
      component: 'WwpdcAsPartSummaryDtlP',
      componentProps: { pdCd: checkedRow[0].pdCd },
    });
  }
}

async function oprenRegDetailPopup(pdCd, tempSaveYn) {
  const targetUrl = tempSaveYn === 'Y' ? page.value.reg : page.value.detail;
  await router.push({ path: targetUrl, query: { pdCd, tempSaveYn } });
}

const sapItemCdFromValidation = async (val) => {
  const errors = [];
  if (!(isEmpty(val) || val.length === 11)) {
    errors.push('MSG_ALT_CHECK_DIGIT_1ST_COND');
  }
  if (!isEmpty(val) && isEmpty(searchParams.value.sapItemCdTo)) {
    errors.push(t('MSG_ALT_KEY_IN_ALL_RANGE'));
  }
  return errors[0] || true;
};

const sapItemCdToValidation = async (val) => {
  const errors = [];
  if (!(isEmpty(val) || val.length === 11)) {
    errors.push('MSG_ALT_CHECK_DIGIT_2ND_COND');
  }
  if (!isEmpty(val) && isEmpty(searchParams.value.sapItemCdFrom)) {
    errors.push(t('MSG_ALT_KEY_IN_ALL_RANGE'));
  }
  return errors[0] || true;
};

watch(() => props.state, async (state) => {
  console.log('props state', state);
}, { immediate: true });

watch(() => props.test, async (newValue) => {
  console.log('props test', newValue);
}, { immediate: true });

watch(() => route.state, async (state) => {
  console.log('route state', state);
}, { immediate: true });

watch(() => route.query, async (query) => {
  console.log('route query', query);
  // eslint-disable-next-line no-use-before-define
  if (query.isSearch) onClickSearch();
}, { immediate: true });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '90', styleName: 'text-center', options: codes.PD_TEMP_SAVE_CD }, /* 상태 */
    { fieldName: 'pdTpCd', header: t('MSG_TXT_DIV'), width: '90', styleName: 'text-center', options: codes.PD_TP_CD }, /* 구분 */
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_CLSF'), width: '176' }, /* 분류 */
    { fieldName: 'pdNm', header: t('MSG_TIT_MATERIAL_NM'), width: '195' }, /* 교재/자재명 */
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '140' }, /* 제품코드 */
    { fieldName: 'asItmCd', header: t('TXT_MSG_AS_ITM_CD'), width: '130' }, /* 품목코드 */
    { fieldName: 'asMatCd', header: t('TXT_MSG_AS_MAT_CD'), width: '130' }, /* AS자재번호 */
    // 사용자 관련 공통 컬럼
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, /* 등록일 */
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGST_USR'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'fstRgstUsrId', header: 'RGST_ID', width: '50', visible: false },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, /* 최종수정일 */
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcUsrId', header: 'MDFC_ID', width: '50', visible: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.checkBar.visible = true;
  view.checkBar.showAll = false;
  view.checkBar.exclusive = false;
  view.displayOptions.selectionStyle = 'singleRow';

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (['fstRgstUsrNm', 'fnlMdfcUsrNm'].includes(column)) {
      // NameTag Link
      const { fstRgstUsrId, fnlMdfcUsrId } = gridUtil.getRowValue(g, itemIndex);
      const userId = column === 'fstRgstUsrNm' ? fstRgstUsrId : fnlMdfcUsrId;
      await modal({ component: 'ZwcmzUserDtlP', componentProps: { userId } });
    }
  };

  view.onCellDblClicked = async (g, clickData) => {
    if (clickData.cellType === 'data') {
      // [reg & detail] Link
      const pdCd = g.getValue(clickData.dataRow, 'pdCd');
      const tempSaveYn = g.getValue(clickData.dataRow, 'tempSaveYn');
      oprenRegDetailPopup(pdCd, tempSaveYn);
    }
  };
});

</script>
<style scoped></style>
