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
            rules="required"
            type="radio"
            :options="ogTp"
            :label="$t('MSG_TXT_OG_TP')"
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
            :options="searchParams.ogTpCd==='W01'?rsbDvP:rsbDvM"
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
        <kw-search-item
          v-if="searchParams.ogTpCd==='W02'"
          :label="$t('MSG_TXT_QLF_DV')"
        >
          <kw-select
            v-model="searchParams.qlfDvCd"
            :options="codes.QLF_DV_CD"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
        <kw-search-item
          v-if="searchParams.ogTpCd==='W01'"
          :label="$t('MSG_TXT_PERF_BASE')"
        >
          <kw-option-group
            v-model="searchParams.feamFlag"
            :label="$t('MSG_TXT_PERF_BASE')"
            rules="required"
            type="radio"
            :options="feamFlags"
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
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
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
import { cloneDeep, isEmpty } from 'lodash-es';

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

const rsbDvP = ref([
  { codeId: 'S', codeName: '판매자' },
  { codeId: 'A', codeName: '지점장' },
]);

const rsbDvM = ref([
  { codeId: 'S', codeName: '판매자' },
  { codeId: 'E', codeName: '지구장' },
  { codeId: 'A', codeName: '지점장' },
]);

const ogTp = ref([
  { codeId: 'W01', codeName: 'P조직' },
  { codeId: 'W02', codeName: 'M조직' },
]);

const feamFlags = ref([
  { codeId: 'N', codeName: '총주문' },
  { codeId: 'Y', codeName: '순주문' },
]);

const grdMainRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = ref({
  baseYm: now,
  ogTpCd: isEmpty(wkOjOgTpCd) ? ogTpCd : wkOjOgTpCd,
  rsbDvCd: 'S',
  ogLevlDvCd1: undefined,
  ogLevlDvCd2: undefined,
  ogLevlDvCd3: undefined,
  qlfDvCd: '',
  feamFlag: 'N',
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
  if (searchParams.value.ogTpCd === 'W02') {
    const flagCnt = await dataService.get('/sms/wells/activity/monthly/count-feam-cntr', { params: { ...searchParams.value } });
    if (flagCnt.data > 0) {
      searchParams.value.feamFlag = 'Y';
    } else {
      searchParams.value.feamFlag = 'N';
    }
  }

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

watch(() => searchParams.value.ogTpCd, async (newVal) => {
  const view = grdMainRef.value?.getView();
  const data = grdMainRef.value?.getData();
  if (newVal === 'W01') { // P추진의 경우
    view.setColumnProperty('cntrDt', 'header', t('MSG_TXT_RGS') + t('MSG_TXT_BASE_D'));
    // view.setColumnProperty('prfmtDt', 'header', t('MSG_TXT_UPGR_MON'));
    // view.setColumnProperty('prfmtDt', 'datetimeFormat', 'YYYY-MM');
    // view.setColumnProperty('fnlCltnDt', 'header', t('MSG_TXT_FNL_CLTN_MM'));
    // view.setColumnProperty('fnlCltnDt', 'datetimeFormat', 'YYYY-MM');
    const tempCol1 = {
      name: 'prfmtDt',
      datetimeFormat: 'yyyy-MM',
      width: '130',
      styleName: 'text-center',
      header: t('MSG_TXT_UPGR_MON'),
    };
    view.setColumn(tempCol1);
    const tempCol2 = {
      name: 'fnlCltnDt',
      datetimeFormat: 'yyyy-MM',
      width: '130',
      styleName: 'text-center',
      header: t('MSG_TXT_FNL_CLTN_MM'),
    };
    view.setColumn(tempCol2);
    view.setColumnProperty('hooPrtnrNo', 'visible', true);
    view.setColumnProperty('qlfDvCd', 'visible', true);
    view.setColumnProperty('akcdq0Sunju', 'visible', true);
    view.setColumnProperty('akcdq0Sunju', 'header', `${t('MSG_TXT_INDV')} ${t('MSG_TXT_ELHM_PERF')}`);
    view.setColumnProperty('akcdq0', 'visible', true);
    view.setColumnProperty('akcdq0', 'header', `${t('MSG_TXT_INDV')} ${t('MSG_TXT_ELHM_EXCP_PERF')}`);
    view.setColumnProperty('akcdq0Sulchi', 'visible', true);
    view.setColumnProperty('akcdq0Sulchi', 'header', t('MSG_TXT_CHNG'));
    view.setColumnProperty('akcdq0Sub', 'visible', true);
    view.setColumnProperty('akcdq1Sunju', 'visible', false);
    view.setColumnProperty('akcdq1', 'visible', false);
    view.setColumnProperty('akcdq1Sulchi', 'visible', false);
    view.setColumnProperty('lccnt0', 'visible', false);
    view.setColumnProperty('lccnt1', 'visible', false);
    view.setColumnProperty('lccn47', 'visible', false);
    view.setColumnProperty('metgPrscDc', 'visible', false);
    view.setColumnProperty('metgPrscDcYn', 'visible', false);
    view.setColumnProperty('edu11Yn', 'visible', false);
    view.setColumnProperty('edu17Yn', 'visible', false);
    view.setColumnProperty('lcvcnt', 'header', t('MSG_TXT_MNGT_PD') + t('MSG_TXT_COUNT'));
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
        header: t('MSG_TXT_INDV') + t('MSG_TXT_SAL_PERF'), // colspan title
        direction: 'horizontal', // merge type
        items: ['akcdq0Sunju', 'akcdq0', 'akcdq0Sulchi', 'akcdq0Sub'],
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
    view.resetCurrent();
    data.clearRows();
  } else { // M추진의 경우
    view.setColumnProperty('cntrDt', 'header', t('MSG_TXT_RCRT_DT'));
    const tempCol1 = {
      name: 'prfmtDt',
      header: t('MSG_TXT_APNTMT_DT'),
      width: '130',
      styleName: 'text-center',
      datetimeFormat: 'date',
    };
    view.setColumn(tempCol1);
    const tempCol2 = {
      name: 'fnlCltnDt',
      header: t('MSG_TXT_FNL_CLTN_DT'),
      width: '130',
      styleName: 'text-center',
      datetimeFormat: 'date',
    };
    view.setColumn(tempCol2);
    view.setColumnProperty('hooPrtnrNo', 'visible', true);
    view.setColumnProperty('qlfDvCd', 'visible', true);
    view.setColumnProperty('akcdq0Sunju', 'visible', true);
    view.setColumnProperty('akcdq0Sunju', 'header', t('MSG_TXT_NTOR'));
    view.setColumnProperty('akcdq0', 'visible', true);
    view.setColumnProperty('akcdq0', 'header', t('MSG_TXT_RCP_WO'));
    view.setColumnProperty('akcdq0Sulchi', 'visible', true);
    view.setColumnProperty('akcdq0Sulchi', 'header', t('MSG_TXT_RCP_IST'));
    view.setColumnProperty('akcdq0Sub', 'visible', false);
    view.setColumnProperty('akcdq1Sunju', 'visible', true);
    view.setColumnProperty('akcdq1', 'visible', true);
    view.setColumnProperty('akcdq1Sulchi', 'visible', true);
    view.setColumnProperty('lccnt0', 'visible', true);
    view.setColumnProperty('lccnt1', 'visible', true);
    view.setColumnProperty('lccn47', 'visible', true);
    view.setColumnProperty('metgPrscDc', 'visible', true);
    view.setColumnProperty('metgPrscDcYn', 'visible', true);
    view.setColumnProperty('edu11Yn', 'visible', true);
    view.setColumnProperty('edu17Yn', 'visible', true);
    view.setColumnProperty('lcvcnt', 'header', t('MSG_TXT_BF_SV_ACC'));
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
        items: ['akcdq0Sunju', 'akcdq0', 'akcdq0Sulchi', 'akcdq0Sub'],
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
    view.resetCurrent();
    data.clearRows();
  }
});
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
    { fieldName: 'cntrDt',
      header: searchParams.value.ogTpCd === 'W01' ? t('MSG_TXT_RGS') + t('MSG_TXT_BASE_D') : t('MSG_TXT_RCRT_DT'),
      width: '130',
      styleName: 'text-center',
      datetimeFormat: 'date' },
    { fieldName: 'prfmtDt',
      header: searchParams.value.ogTpCd === 'W01' ? t('MSG_TXT_UPGR_MON') : t('MSG_TXT_APNTMT_DT'),
      width: '130',
      styleName: 'text-center',
      datetimeFormat: searchParams.value.ogTpCd === 'W01' ? 'YYYY-MM' : 'date' },
    { fieldName: 'fnlCltnDt',
      header: searchParams.value.ogTpCd === 'W01' ? t('MSG_TXT_FNL_CLTN_MM') : t('MSG_TXT_FNL_CLTN_DT'),
      width: '136',
      styleName: 'text-center',
      datetimeFormat: searchParams.value.ogTpCd === 'W01' ? 'YYYY-MM' : 'date' },
    { fieldName: 'hooPrtnrNo',
      header: t('MSG_TXT_BRN_MGR_NUM'),
      width: '122',
      styleName: 'text-center' },
    { fieldName: 'qlfDvCd',
      header: t('MSG_TXT_QLF'),
      width: '122',
      styleName: 'text-center' },
    { fieldName: 'akcdq0Sunju', // P추진 : 개인판매실적 개인 가전실적, M추진 : 인정건수 순주문
      header: searchParams.value.ogTpCd === 'W01' ? `${t('MSG_TXT_INDV')} ${t('MSG_TXT_ELHM_PERF')}` : t('MSG_TXT_NTOR'),
      width: '110',
      styleName: 'text-center',
      dataType: 'number' },
    { fieldName: 'akcdq0', // P추진 : 개인판매실적 개인 가전외 실적, M추진 : 인정건수 접수전체
      header: searchParams.value.ogTpCd === 'W01' ? `${t('MSG_TXT_INDV')} ${t('MSG_TXT_ELHM_EXCP_PERF')}` : t('MSG_TXT_RCP_WO'),
      width: '110',
      styleName: 'text-center',
      dataType: 'number' },
    { fieldName: 'akcdq0Sulchi', // P추진 : 개인판매실적 기변, M추진 : 인정건수 접수설치
      header: searchParams.value.ogTpCd === 'W01' ? t('MSG_TXT_CHNG') : t('MSG_TXT_RCP_IST'),
      width: '92',
      styleName: 'text-center',
      dataType: 'number' },
    { fieldName: 'akcdq0Sub', // only P추진 : 개인 상조실적
      header: t('MSG_TXT_INDV_MUTU') + t('MSG_TXT_PERF'),
      width: '106',
      styleName: 'text-center',
      visible: searchParams.value.ogTpCd === 'W01',
      dataType: 'number' },
    { fieldName: 'akcdq1Sunju',
      header: t('MSG_TXT_NTOR'),
      width: '92',
      styleName: 'text-center',
      visible: searchParams.value.ogTpCd !== 'W01',
      dataType: 'number' },
    { fieldName: 'akcdq1',
      header: t('MSG_TXT_RCP_WO'),
      width: '106',
      styleName: 'text-center',
      visible: searchParams.value.ogTpCd !== 'W01',
      dataType: 'number' },
    { fieldName: 'akcdq1Sulchi',
      header: t('MSG_TXT_RCP_IST'),
      width: '106',
      styleName: 'text-center',
      visible: searchParams.value.ogTpCd !== 'W01',
      dataType: 'number' },
    { fieldName: 'lccnt0',
      header: t('MSG_TXT_PD_ACC_CNT'),
      width: '106',
      styleName: 'text-center',
      visible: searchParams.value.ogTpCd !== 'W01',
      dataType: 'number' },
    { fieldName: 'lccnt1',
      header: t('MSG_TXT_WO_CT'),
      width: '106',
      styleName: 'text-center',
      visible: searchParams.value.ogTpCd !== 'W01',
      dataType: 'number' }, // 당월설치 전체건수
    { fieldName: 'lccn47',
      header: t('MSG_TXT_WELSF') + t('MSG_TXT_RSTL'),
      width: '160',
      styleName: 'text-center',
      visible: searchParams.value.ogTpCd !== 'W01',
      dataType: 'number' },
    { fieldName: 'metgPrscDc',
      header: t('MSG_TXT_DC'),
      width: '106',
      visible: searchParams.value.ogTpCd !== 'W01',
      styleName: 'text-center',
      dataType: 'number' },
    { fieldName: 'metgPrscDcYn',
      header: t('MSG_TXT_ACKMT_YN'),
      width: '106',
      visible: searchParams.value.ogTpCd !== 'W01',
      styleName: 'text-center' },
    { fieldName: 'edu11Yn',
      header: t('MSG_TXT_PLANNER_STRTUP'),
      width: '152',
      visible: searchParams.value.ogTpCd !== 'W01',
      styleName: 'text-center' },
    { fieldName: 'edu17Yn',
      header: t('MSG_TXT_TOPMR_PLAR_PRTIC'),
      width: '152',
      visible: searchParams.value.ogTpCd !== 'W01',
      styleName: 'text-center' },
    { fieldName: 'lcvcnt', // P조직에서 관리상품건수 , M조직에서 B/S 계정.
      header: searchParams.value.ogTpCd === 'W01' ? t('MSG_TXT_MNGT_PD') + t('MSG_TXT_COUNT') : t('MSG_TXT_BF_SV_ACC'),
      width: '104',
      styleName: 'text-center',
      dataType: 'number' },
    { fieldName: 'fnlCltnDtYn',
      header: `3${t('MSG_TXT_REG_IN_MN')}`,
      width: '160',
      styleName: 'text-center' },
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
      items: ['akcdq0Sunju', 'akcdq0', 'akcdq0Sulchi', 'akcdq0Sub'],
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
