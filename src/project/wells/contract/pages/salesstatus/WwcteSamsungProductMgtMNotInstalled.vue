<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteSamsungProductMgtMNotInstalled - 삼성전자 상품관리 (미설치)
3. 작성자 : gs.nidhi.d -> joobro
4. 작성일 : 2023.04.05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 삼성전자 상품관리
****************************************************************************************************
--->
<template>
  <kw-search @search="onClickSearch">
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_APPL_PRD')"
        required
      >
        <kw-date-range-picker
          v-model:from="searchParams.strtdt"
          v-model:to="searchParams.enddt"
          :label="$t('MSG_TXT_APPL_PRD')"
          rules="date_range_required"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_NO')"
      >
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
          :label="$t('MSG_TXT_CNTR_NO')"
          :select-only-validation="false"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CNTOR_NM')"
      >
        <kw-input
          v-model="searchParams.cntrCstKnm"
          :label="$t('MSG_TXT_CNTOR_NM')"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_BLG_CD')"
      >
        <kw-field-wrap
          :label="$t('MSG_TXT_BLG_CD')"
        >
          <kw-input
            v-model="searchParams.strtOgCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endOgCd"
          />
        </kw-field-wrap>
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
          @change="fetchPage"
        />
      </template>
      <kw-btn
        icon="upload_on"
        secondary
        dense
        :label="$t('MSG_BTN_EXCEL_UP')"
        @click="onClickExcelUpload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdRef"
      name="grdNotInstalled"
      @init="initGrid"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchPage"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  defineGrid,
  getComponentType,
  notify,
  modal,
  useDataService,
  useMeta,
  codeUtil,
} from 'kw-lib';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import useGridDataModel from '~sms-common/contract/composable/useGridDataModel';

const dataService = useDataService();
const { t } = useI18n();
const { getConfig } = useMeta();
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const grdRef = ref(getComponentType('KwGrid'));
// const grdView = computed(() => grdRef.value?.getView());
const grdData = computed(() => grdRef.value?.getData());

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
const searchParams = reactive({
  strtdt: dayjs().startOf('M').format('YYYYMMDD'),
  enddt: dayjs().format('YYYYMMDD'),
  cntrNo: undefined,
  cntrSn: undefined,
  strtOgCd: '',
  endOgCd: '',
});

const fetchPage = async (pageIndex = pageInfo.value.pageIndex, pageSize = pageInfo.value.pageSize) => {
  const params = {
    ...cachedParams,
    pageIndex,
    pageSize,
  };
  const response = await dataService.get('/sms/wells/contract/sales-status/sec-product-management/not-installs/paging', { params });

  pageInfo.value = response.data.pageInfo;
  grdData.value.setRows(response.data.list);
};

async function onClickSearch() {
  cachedParams = { ...toRaw(searchParams) };
  pageInfo.value.pageIndex = 1;
  await fetchPage(1);
}

async function onClickExcelUpload() {
  const apiUrl = '/sms/wells/contract/sales-status/sec-product-management/not-installs/excel-upload';
  const templateId = 'FOM_CTE_0001';
  const { result, payload } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  if (result) {
    const { status, errorInfo } = payload;
    if (status === 'S') {
      notify(t('MSG_ALT_SAVE_DATA'));
      await fetchPage();
    } else if (status === 'E' && errorInfo.length > 0) {
      await modal({
        component: 'ZwcmzExcelUploadErrorP',
        componentProps: { errorInfo },
      });
    }
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  useGridDataModel(view, {
    cntrNo: { displaying: false },
    cntrSn: { displaying: false },
    cntrNoSn: {
      label: t('MSG_TXT_CNTR_NO'), /* 계약번호 */
      width: 168,
      valueExpression: 'values["cntrNo"] + "-" + values["cntrSn"]',
      classes: 'text-center',
    },
    cntrCstKnm: { label: t('MSG_TXT_CNTOR_NM'), width: 136, classes: 'text-center' },
    sppBzsOrdId: { label: t('MSG_TXT_SAMSUNG_ORDR_NO'), width: 137, classes: 'text-center' },
    pdHclsfNm: { label: `${t('MSG_TXT_PRDT_NM')}(${t('TXT_MSG_PD_HCLSF_ID')})`, width: 197 },
    pdMclsfNm: { label: `${t('MSG_TXT_PRDT_NM')}(${t('TXT_MSG_PD_MCLSF_ID')})`, width: 198 },
    cntrCnfmDtm: { label: t('MSG_TXT_CNTRCT_DT'), width: 136, datetimeFormat: 'date' },
    duedt: { label: t('MSG_TXT_INSTLATN_RSRVATN_DT'), width: 136, datetimeFormat: 'date' },
    prtnrOgCd: { label: t('MSG_TXT_PRTNR_AFFILITN_CD'), width: 147, classes: 'text-center' },
    prtnrNo: { label: t('MSG_TXT_PARTNER_NO'), width: 149, classes: 'text-center' },
    prtnrKnm: { label: t('MSG_TXT_PTNR_NAME'), width: 148, classes: 'text-center' },
    canRson: { label: t('MSG_TXT_NOTE'), width: 366 },
  });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
