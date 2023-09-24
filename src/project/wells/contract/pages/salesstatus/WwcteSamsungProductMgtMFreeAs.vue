<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteSamsungProductMgtM - 삼성전자 상품관리(무상A/S)
3. 작성자 : gs.rahul.n -> joobro
4. 작성일 : 2023.03.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 삼성전자 상품관리(무상A/S)
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_LOOKUP_PERIOD')"
        required
        :colspan="2"
      >
        <kw-select
          v-model="searchParams.searchDateRangeType"
          class="w200"
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          :options="codes.searchDateRangeOptions"
          rules="required"
          @change="onChangeSearchDateRangeType"
        />
        <kw-date-range-picker
          v-if="searchParams.searchDateRangeType === SEARCH_DATE_TYPE_CNTR_CNFM_DT"
          v-model:from="searchParams.cntrCnfmStrtdt"
          v-model:to="searchParams.cntrCnfmEnddt"
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          :disable="!searchParams.searchDateRangeType"
        />
        <kw-date-range-picker
          v-else
          v-model:from="searchParams.istStrtdt"
          v-model:to="searchParams.istEnddt"
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          :disable="!searchParams.searchDateRangeType"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_CNTR_STAT')">
        <kw-select
          v-model="searchParams.cntrDtlStatCd"
          :label="$t('MSG_TXT_CNTR_STAT')"
          :options="codes.CNTR_DTL_STAT_CD"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_CNTOR_NM')">
        <kw-input
          v-model="searchParams.cntrCstKnm"
          :label="$t('MSG_TXT_CNTOR_NM')"
          maxlength="50"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_PRDT_CODE')">
        <kw-input
          v-model="searchParams.pdCd"
          :label="$t('MSG_TXT_PRDT_CODE')"
          icon="search"
          clearable
          @click-icon="onClickSelectPdCd"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_PRDT_NM')">
        <kw-input
          v-model="searchParams.pdNm"
          :label="$t('MSG_TXT_PRDT_NM')"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_MNFT_NO')">
        <kw-input
          v-model="searchParams.pdctIdno"
          :label="$t('MSG_TXT_MNFT_NO')"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_SUS_OF_SALES')">
        <kw-select
          v-model="searchParams.slStpYn"
          :label="$t('MSG_TXT_SUS_OF_SALES')"
          :options="codes.COD_YN"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_POST_STLMNT')">
        <kw-select
          v-model="searchParams.afterTgYn"
          :label="$t('MSG_TXT_POST_STLMNT')"
          :options="codes.COD_YN"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_BASE_MN_POST_STLMNT')">
        <kw-date-picker
          v-model="searchParams.afterTgBaseYm"
          :label="$t('MSG_TXT_BASE_MN_POST_STLMNT')"
          type="month"
          :disable="searchParams.afterTgYn !== 'Y'"
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
          @change="fetchPage"
        />
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON_MCN') }}</span>
      </template>
      <kw-btn
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="pageInfo.totalCount===0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdRef"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      name="grdFreeAS"
      @init="initGrd"
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
import { getComponentType, defineGrid, useMeta, codeUtil, useDataService, useGlobal, gridUtil } from 'kw-lib';
import useGridDataModel from '~sms-common/contract/composable/useGridDataModel';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import pdConst from '~sms-common/product/constants/pdConst';

const SERVER_DATE_FORMAT = 'YYYYMMDD';
const SEARCH_DATE_TYPE_CNTR_CNFM_DT = 'cntrCnfmDt';
const SEARCH_DATE_TYPE_IST_DT = 'istDt';
const { getConfig } = useMeta();
const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();
const { modal } = useGlobal();

const codes = await codeUtil.getMultiCodes(
  'COD_YN',
  'COD_PAGE_SIZE_OPTIONS',
  'CNTR_DTL_STAT_CD',
);

codes.searchDateRangeOptions = [
  { codeId: SEARCH_DATE_TYPE_CNTR_CNFM_DT, codeName: t('MSG_TXT_CNTRCT_DT') /* 계약일' */ },
  { codeId: SEARCH_DATE_TYPE_IST_DT, codeName: t('MSG_TXT_INST_DT') /* 설치일' */ },
];

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdRef = ref(getComponentType('KwGrid'));
const grdView = computed(() => grdRef.value?.getView());
const grdData = computed(() => grdRef.value?.getData());

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
const searchParams = reactive({
  searchDateRangeType: undefined,
  cntrCnfmStrtdt: '',
  cntrCnfmEnddt: '',
  istStrtdt: '',
  istEnddt: '',
  cntrDtlStatCd: '',
  cntrNo: '',
  cntrSn: undefined,
  cntrCstKnm: '',
  pdCd: '',
  pdNm: '',
  pdctIdno: '', /* 제조번호 */
  slStpYn: undefined,
  afterTgYn: '', /* 사후 정산 여부 */
  afterTgBaseYm: '',
  afterTgStDt: '',
  afterTgEndDt: '',
});

const fetchPage = async (pageIndex = pageInfo.value.pageIndex, pageSize = pageInfo.value.pageSize) => {
  const params = {
    ...cachedParams,
    pageIndex,
    pageSize,
  };
  const response = await dataService.get('/sms/wells/contract/sales-status/sec-product-management/free-after-services/paging', { params });

  pageInfo.value = response.data.pageInfo;
  grdData.value.setRows(response.data.list);
};

async function onClickSearch() {
  cachedParams = { ...toRaw(searchParams) };
  pageInfo.value.pageIndex = 1;
  await fetchPage(1);
}

async function onClickExcelDownload() {
  if (!cachedParams) { return; }
  const response = await dataService.get('/sms/wells/contract/sales-status/sec-product-management/free-after-services', { params: cachedParams });
  await gridUtil.exportView(grdView.value, {
    fileName: `${currentRoute?.value.meta?.menuName}(${t('MSG_TXT_FREE')})`,
    timePostfix: true,
    exportData: response.data,
  });
}

function onChangeSearchDateRangeType(searchDateRangeType) {
  if (searchDateRangeType === SEARCH_DATE_TYPE_CNTR_CNFM_DT) {
    searchParams.cntrCnfmStrtdt = dayjs().format(SERVER_DATE_FORMAT);
    searchParams.cntrCnfmEnddt = dayjs().format(SERVER_DATE_FORMAT);
    searchParams.istStrtdt = undefined;
    searchParams.istEnddt = undefined;
  }

  if (searchDateRangeType === SEARCH_DATE_TYPE_IST_DT) {
    searchParams.cntrCnfmStrtdt = undefined;
    searchParams.cntrCnfmEnddt = undefined;
    searchParams.istStrtdt = dayjs().format(SERVER_DATE_FORMAT);
    searchParams.istEnddt = dayjs().format(SERVER_DATE_FORMAT);
  }
}

// 상품코드 검색아이콘 클릭
async function onClickSelectPdCd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.pdCd,
    selectType: '',
  };

  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });

  if (returnPdInfo.result) {
    searchParams.pdCd = returnPdInfo.payload?.[0].pdCd;
    searchParams.pdNm = returnPdInfo.payload?.[0].pdNm;
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrd = defineGrid((data, view) => {
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
    pdCd: { label: t('MSG_TXT_PRDT_CODE'), width: 136, classes: 'text-center' },
    pdNm: { label: t('MSG_TXT_PRDT_NM'), width: 253 },
    pdctIdno: { label: t('MSG_TXT_MNFT_NO'), width: 168, classes: 'text-center' },
    pdctIdno14: {
      label: `${t('MSG_TXT_MNFT_NO')} 14${t('MSG_TXT_DIGITS')}`,
      width: 168,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const trimedPdctIdno = values[fields.indexOf('pdctIdno')]?.trim();
        if (!trimedPdctIdno || trimedPdctIdno.length < '14') { return ''; }
        return trimedPdctIdno.substring(0, 14);
      },
      classes: 'text-center',
    },
    cntrCnfmDtm: { label: t('MSG_TXT_CNTRCT_DT'), width: 136, datetimeFormat: 'date' },
    istDt: { label: t('MSG_TXT_INST_DT'), width: 136, datetimeFormat: 'date' },
    cntrPdEnddt: { label: t('MSG_TXT_RENT_EXP_DT'), width: 136, datetimeFormat: 'date' },
    canPdEnddt: { label: t('MSG_TXT_CAN_D'), width: 136, datetimeFormat: 'date' },
    cntrDtlStatCd: { label: t('MSG_TXT_CNTR_STAT'), width: 136, options: codes.CNTR_DTL_STAT_CD },
    frisuAsMcn: {
      type: Number,
      label: `${t('MSG_TXT_FREE')} ${t('MSG_TXT_AS_PERIOD')}`,
      width: 136,
    },
    ssFrisuAsMcn: {
      type: Number,
      label: `${t('MSG_TXT_SS')} ${t('MSG_TXT_BU')} ${t('MSG_TXT_FREE')} ${t('MSG_TXT_AS_PERIOD')}`,
      width: 204,
      classes: 'text-right',
    },
    kwFrisuAsMcn: {
      type: Number,
      label: `${t('MSG_TXT_KW')} ${t('MSG_TXT_BU')} ${t('MSG_TXT_FREE')} ${t('MSG_TXT_AS_PERIOD')}`,
      width: 204,
      classes: 'text-right',
    },
    frisuEndDt: { label: t('MSG_TXT_FREE_END_DT'), width: 136, datetimeFormat: 'date' },
    afterTgYn: {
      label: `${t('MSG_TXT_POST_STLMNT')} ${t('MSG_TXT_OJ_YN')}`,
      width: 161,
      classes: 'text-center',
    },
    afterTgStDt: {
      label: `${t('MSG_TXT_POST_STLMNT')} ${t('MSG_TXT_START_DATE')}`,
      width: 161,
      datetimeFormat: 'date',
    },
    afterTgEdDt: {
      label: `${t('MSG_TXT_POST_STLMNT')} ${t('MSG_TXT_END_DATE')}`,
      width: 161,
      datetimeFormat: 'date',
    },
    dlqYn: { label: t('MSG_TXT_OVERDUE'), width: 139, classes: 'text-center' },
    eotDlqAmt: { type: Number, label: t('MSG_TXT_DLQ_AMT'), width: 161 },
  });

  view.rowIndicator.visible = true;
});

</script>
