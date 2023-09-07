<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcAsPartListM - 교재/자재 목록 (W-PD-U-0040M01)
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
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
        <kw-search-item :label="$t('MSG_TXT_PRDT_GUBUN', null, '상품구분')">
          <kw-select
            v-model="searchParams.pdTpCd"
            :options="codes.PD_TP_CD"
            :readonly="true"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TIT_AS_PART_NM', null, 'AS부품명')">
          <kw-input
            v-model.trim="searchParams.pdNm"
            :maxlength="100"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TIT_AS_PART_CD', null, 'AS부품코드')">
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
        <kw-search-item :label="t('MSG_TXT_CLSF', null, '분류')">
          <zwpd-product-classification-select
            ref="classfySelRef"
            v-model:product1-level="searchParams.prdtCateHigh"
            v-model:product2-level="searchParams.prdtCateMid"
            v-model:product3-level="searchParams.prdtCateLow"
            v-model:pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
            first-option="all"
            search-lvl="3"
          />
        </kw-search-item>
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
        <kw-search-item :label="$t('TXT_MSG_AS_ITM_CD')">
          <kw-input
            v-model.trim="searchParams.sapItemCdFrom"
            mask="#####-######"
            :rules="sapItemCdFromValidation"
            class="mr8"
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

      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_ITM_KND', null, '품목종류')">
          <!-- :multiple="true" -->
          <kw-select
            v-model="searchParams.asMatItmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_ITM_GRP', null, '품목그룹')">
          <kw-select
            v-model="searchParams.asMatItmGrpCd"
            :options="codes.AS_MAT_ITM_GRP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item :label="t('TXT_MSG_SAP_MAT_GRP_VAL', null, '자재그룹')">
          <kw-select
            v-model="searchParams.svMatGrpCd"
            :options="codes.SV_MAT_GRP_CD"
            first-option="all"
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
          v-permission:create
          icon="upload_on"
          secondary
          dense
          :label="$t('MSG_BTN_EXCEL_UP')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          icon="download_on"
          secondary
          dense
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
          :label="$t('MSG_BTN_CNTN_COPY')"
          secondary
          dense
          :disable="pageInfo.totalCount === 0"
          @click="onClickCopy"
        />
        <kw-btn
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_SUMMARY_SRCH')"
          @click="onClickSummaryDtl"
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
        :need-context-menu="false"
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
import { useDataService, useMeta, gridUtil, codeUtil, useGlobal, getComponentType, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdProductClassificationSelect from '~sms-common/product/pages/standard/components/ZwpdyClassification.vue';

const props = defineProps({
  searchYn: { type: String, default: null },
});

const { notify, modal } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
const router = useRouter();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/product/as-parts';
const grdMainRef = ref(getComponentType('KwGrid'));
const classfySelRef = ref();
const currentSearchYn = ref();

const page = ref({
  reg: '/product/wwpdc-as-part-list/wwpdc-as-part-mgt',
  detail: '/product/wwpdc-as-part-list/wwpdc-as-part-dtl',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
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
  sapItemCdFrom: '',
  sapItemCdTo: '',
  asMatItmKndCd: '',
  asMatItmGrpCd: '',
  svMatGrpCd: '',
});

const codes = await codeUtil.getMultiCodes('PD_TP_CD', 'PD_TEMP_SAVE_CD', 'COD_YN', 'COD_PAGE_SIZE_OPTIONS', 'ITM_KND_CD', 'AS_MAT_ITM_GRP_CD', 'SV_MAT_GRP_CD');

// 자재코드 조회팝업(sapMatCd)
async function onClickSapMaterial() {
  const { result, payload } = await modal({
    component: 'ZwpdcMaterialsCodeListP',
    componentProps: {
      searchType: pdConst.PD_SEARCH_CODE,
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
  console.log('material', material);

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(material);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
  currentSearchYn.value = 'N';
}

async function onClickExcelUpload() {
  const { payload } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: {
      apiUrl: `${baseUrl}/excel-upload`,
      templateId: 'FOM_PD_ASPART_BLK_RGST',
    },
  });

  if (payload) {
    if (payload.status === pdConst.EXCEL_UPLOAD_SUCCESS) {
      notify(t('MSG_ALT_COMPLETE_EXCEL_UPLOAD'));
      await onClickSearch();
    } else {
      await modal({
        component: 'ZwcmzExcelUploadErrorP',
        componentProps: { errorInfo: payload.errorInfo },
      });
    }
  }
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickAdd() {
  const regStateParams = { pdCd: '', newRegYn: 'Y', reloadYn: 'N', copyPdCd: '' };
  await router.push({ path: page.value.reg, query: { fromUi: 'Reg' }, state: { stateParam: regStateParams } });
}

async function openProductPopup(pdCd, tempSaveYn) {
  if ((tempSaveYn ?? 'Y') === 'Y') {
    const updateStateParams = { newRegYn: 'N', reloadYn: 'N', copyPdCd: '' };
    await router.push({ path: page.value.reg, query: { pdCd, tempSaveYn, fromUi: 'ASPART' }, state: { stateParam: updateStateParams } });
  } else {
    await router.push({ path: page.value.detail, query: { pdCd, tempSaveYn, fromUi: 'ASPART' }, state: { reloadYn: 'Y' } });
  }
}

async function onClickCopy() {
  const view = grdMainRef.value.getView();
  const checkedRows = cloneDeep(gridUtil.getCheckedRowValues(view));
  if (checkedRows.length < 1) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  if (checkedRows.length !== 1) {
    notify(t('MSG_ALT_SELT_ONE_ITEM'));
    return;
  }
  const targetPdCd = checkedRows[0].pdCd;
  const regStateParams = { pdCd: '', newRegYn: 'Y', reloadYn: 'N', copyPdCd: targetPdCd };
  await router.push({ path: page.value.reg, query: { copyPdCd: targetPdCd }, state: { stateParam: regStateParams } });
}

async function onClickSummaryDtl() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkedRows) || checkedRows.length < 1) {
    notify(t('MSG_ALT_SELECT_ONE_ROW', [t('MSG_BTN_SUMMARY_SRCH')]));
    return;
  }
  if (checkedRows.length > 1) {
    notify(t('MSG_ALT_SELT_ONE_ITEM'));
    return;
  }
  await modal({
    component: 'WwpdcAsPartSummaryDtlP',
    componentProps: { pdCd: checkedRows[0].pdCd },
  });
}

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

onActivated(async () => {
  if (props.searchYn === 'Y') await onClickSearch();
});

watch(() => props, ({ searchYn }) => {
  if (searchYn === 'Y') onClickSearch();
}, { deep: true });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT', null, '상태'), width: '90', styleName: 'text-center', options: codes.PD_TEMP_SAVE_CD },
    { fieldName: 'pdTpCd', header: t('MSG_TXT_DIV', null, '구분'), width: '90', styleName: 'text-center', options: codes.PD_TP_CD },
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_CLSF', null, '분류'), width: '176' },
    { fieldName: 'pdNm', header: t('MSG_TIT_AS_PART_NM', null, 'AS부품명'), width: '195' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_PD_ABBREVIATION_1', null, '약어1'), width: '195' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD', null, '자재코드'), width: '180', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TIT_AS_PART_CD', null, 'AS부품코드'), width: '130', styleName: 'text-center' },
    { fieldName: 'asItmCd', header: t('TXT_MSG_AS_ITM_CD', null, '품목코드'), width: '200', styleName: 'text-center' },
    { fieldName: 'asMatCd', header: t('TXT_MSG_AS_MAT_CD', null, 'AS자재번호'), width: '130', styleName: 'text-center', visible: false }, /* 품목코드에 병합. */
    { fieldName: 'asMatItmGrpCd', header: t('MSG_TXT_ITM_GRP', null, '품목그룹'), width: '90', styleName: 'text-center', options: codes.AS_MAT_ITM_GRP_CD },
    { fieldName: 'asMatItmKndCd', header: t('MSG_TXT_ITM_KND', null, '품목종류'), width: '90', styleName: 'text-center', options: codes.ITM_KND_CD },
    { fieldName: 'svMatGrpCd', header: t('TXT_MSG_SAP_MAT_GRP_VAL', null, '자재그룹'), width: '90', styleName: 'text-center', options: codes.SV_MAT_GRP_CD },
    // 사용자 관련 공통 컬럼
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGST_USR'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'fstRgstUsrId', header: 'RGST_ID', width: '50', visible: false },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcUsrId', header: 'MDFC_ID', width: '50', visible: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.checkBar.visible = true;

  view.onCellDblClicked = async (g, clickData) => {
    if (clickData.cellType === 'data') {
      // [reg & detail] Link
      const pdCd = g.getValue(clickData.dataRow, 'pdCd');
      const tempSaveYn = g.getValue(clickData.dataRow, 'tempSaveYn');
      openProductPopup(pdCd, tempSaveYn);
    }
  };
});

</script>
<style scoped></style>
