<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcMonthlyActivityListM - 월별 활동 현황
3. 작성자 : woong.you
4. 작성일 : 2023-07-03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 월별 활동 현황
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      two-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_BASE_YM')"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_OG_TP')"
        >
          <kw-option-group
            v-model="searchParams.ogTpCd"
            type="radio"
            :options="ogTp"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_RSB_DV')"
          required
        >
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            :label="$t('MSG_TXT_RSB_DV')"
            rules="required"
            type="radio"
            :options="rsbDv"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          colspan="2"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
            v-model:og-levl-dv-cd3="searchParams.ogLevlDvCd3"
            :og-tp-cd="searchParams.ogTpCd"
            :start-level="1"
            :base-ym="searchParams.baseYm"
            :end-level="3"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_QLF_DV')">
          <kw-select
            v-model="searchParams.qlfDvCd"
            :options="codes.QLF_DV_CD"
            first-option="all"
            first-option-value=""
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
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        @init="initGrid"
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
import { useDataService, defineGrid, getComponentType, gridUtil, codeUtil, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { getConfig, getUserInfo } = useMeta();
const { currentRoute } = useRouter();
const { wkOjOgTpCd, ogTpCd } = getUserInfo();
const now = dayjs().format('YYYYMM');
const dataService = useDataService();
let cacheParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes('COD_PAGE_SIZE_OPTIONS', 'QLF_DV_CD');

const rsbDv = ref([
  { codeId: 'S', codeName: '판매자' },
  { codeId: 'E', codeName: '지구장' },
  { codeId: 'A', codeName: '지점장' },
]);

const ogTp = ref([
  { codeId: 'W01', codeName: 'P추진' },
  { codeId: 'W02', codeName: 'M추진' },
]);

const grdMainRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = ref({
  baseYm: now,
  ogTpCd: wkOjOgTpCd === null ? ogTpCd : wkOjOgTpCd,
  rsbDvCd: 'S',
  ogLevlDvCd1: undefined,
  ogLevlDvCd2: undefined,
  ogLevlDvCd3: undefined,
  qlfDvCd: '',
});

function setGrid(response) {
  const data = grdMainRef.value.getData();
  data.setRows(response);
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/activity/monthly/paging', { params: { ...cacheParams, ...pageInfo.value } });

  const { list, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);

  setGrid(list);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cacheParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/activity/monthly/excel-download', { params: { ...cacheParams } });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_MGT_YNM'), width: '110', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '110', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '96', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), width: '78', styleName: 'text-center' },
    { fieldName: 'sexDvCd', header: t('MSG_TXT_GENDER'), width: '78', styleName: 'text-center' },
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '110', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '148', styleName: 'text-center' },
    { fieldName: 'cntrDt', header: t('MSG_TXT_RCRT_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'prfmtDt', header: t('MSG_TXT_APNTMT_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fnlCltnDt', header: t('MSG_TXT_FNL_CLTN_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'hooPrtnrNo', header: t('MSG_TXT_BRN_MGR_NUM'), width: '122', styleName: 'text-center' },
    { fieldName: 'qlfDvCd', header: t('MSG_TXT_QLF'), width: '122', styleName: 'text-center' },
    { fieldName: 'akcdq0Sunju', header: t('MSG_TXT_NTOR'), width: '92', styleName: 'text-center', numberFormat: '#,##0' },
    { fieldName: 'akcdq0', header: t('MSG_TXT_RCP_WO'), width: '106', styleName: 'text-center', numberFormat: '#,##0' },
    { fieldName: 'akcdq0Sulchi', header: t('MSG_TXT_RCP_IST'), width: '106', styleName: 'text-center', numberFormat: '#,##0' },
    { fieldName: 'akcdq1Sunju', header: t('MSG_TXT_NTOR'), width: '92', styleName: 'text-center', numberFormat: '#,##0' },
    { fieldName: 'akcdq1', header: t('MSG_TXT_RCP_WO'), width: '106', styleName: 'text-center', numberFormat: '#,##0' },
    { fieldName: 'akcdq1Sulchi', header: t('MSG_TXT_RCP_IST'), width: '106', styleName: 'text-center', numberFormat: '#,##0' },
    { fieldName: 'lccnt0', header: t('MSG_TXT_PD_ACC_CNT'), width: '106', styleName: 'text-center', numberFormat: '#,##0' },
    { fieldName: 'lccnt1', header: t('MSG_TXT_WO_CT'), width: '106', styleName: 'text-center', numberFormat: '#,##0' }, // 당월설치 전체건수
    { fieldName: 'lccn47', header: t('MSG_TXT_WELSF') + t('MSG_TXT_RSTL'), width: '160', styleName: 'text-center', numberFormat: '#,##0' },
    { fieldName: 'metgPrscDc', header: t('MSG_TXT_DC'), width: '106', styleName: 'text-center', numberFormat: '#,##0' },
    { fieldName: 'metgPrscDcYn', header: t('MSG_TXT_ACKMT_YN'), width: '106', styleName: 'text-center' },
    { fieldName: 'edu11Yn', header: t('MSG_TXT_PLANNER_STRTUP'), width: '152', styleName: 'text-center' },
    { fieldName: 'edu17Yn', header: t('MSG_TXT_TOPMR_PLAR_PRTIC'), width: '152', styleName: 'text-center' },
    { fieldName: 'lcvcnt', header: t('MSG_TXT_BF_SV_ACC'), width: '104', styleName: 'text-center', numberFormat: '#,##0' },
    { fieldName: 'fnlCltnDtYn', header: `3${t('MSG_TXT_REG_IN_MN')}`, width: '160', styleName: 'text-center' },
  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'baseYm',
    'ogCd',
    'prtnrKnm',
    'prtnrNo',
    'pstnDvCd',
    'sexDvCd',
    {
      header: t('MSG_TXT_BUILDING'), // colspan title
      direction: 'horizontal', // merge type
      items: ['bldCd', 'bldNm'],
    },
    'cntrDt',
    'prfmtDt',
    'fnlCltnDt',
    'hooPrtnrNo',
    'qlfDvCd',
    {
      header: t('MSG_TXT_PD_ACC_CNT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['akcdq0Sunju', 'akcdq0', 'akcdq0Sulchi'],
    },
    {
      header: t('MSG_TXT_WO_CT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['akcdq1Sunju', 'akcdq1', 'akcdq1Sulchi'],
    },
    {
      header: t('MSG_TXT_THM_IST'), // colspan title
      direction: 'horizontal', // merge type
      items: ['lccnt0', 'lccnt1'],
    },
    'lccn47',
    {
      header: t('MSG_TXT_METG_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['metgPrscDc', 'metgPrscDcYn'],
    },
    {
      header: t('MSG_TXT_EDUC_CPC_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['edu11Yn', 'edu17Yn'],
    },
    'lcvcnt', 'fnlCltnDtYn',
  ]);
});

</script>

<style scoped>
</style>
