<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FED
2. 프로그램 ID : WwfedOutcomeAllowancePsListM - 성과수당 현황 조회(W-CO-U-0044M01)
3. 작성자 : sechun.park
4. 작성일 : 2023.11.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 성과수당 현황 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      v-permission:read
      @search="onClickSearch"
    >
      <kw-search-row cols="4">
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_PERF_YM')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_THM_DV')"
        >
          {{ searchParams.thmInqr ? 'Y' : 'N' }}
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_DV')"
        >
          <kw-option-group
            v-model="searchParams.ogTpCd"
            type="radio"
            :options="ogTpCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB')"
        >
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            type="radio"
            :options="rsbDvCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row cols="4">
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            :maxlength="10"
            :regex="/^[0-9]*$/i"
            clearable
            :on-click-icon="onClickSearchNo"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
        </template>
        <kw-btn
          v-permission:download
          icon="download_on"
          secondary
          dense
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount===0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        v-if="isGrdMOgVisible"
        ref="grdMOgRef"
        name="grdMOg"
        :visible-rows="15"
        @init="initGridMOg"
      />
      <kw-grid
        v-if="isGrdPOgVisible"
        ref="grdPOgRef"
        name="grdPOg"
        :visible-rows="15"
        @init="initGridPOg"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useGlobal, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { modal } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const grdMOgRef = ref(getComponentType('KwGrid'));
const grdPOgRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);

const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
  'OG_TP_CD',
);

const searchParams = ref({
  perfYm: dayjs().subtract(1, 'month').format('YYYYMM'),
  rsbDvCd: 'W0202',
  ogTpCd: 'W02',
  prtnrNo: '',
  thmInqr: false,
});

const isGrdMOgVisible = computed(() => searchParams.value.ogTpCd === 'W02');
const isGrdPOgVisible = computed(() => searchParams.value.ogTpCd === 'W01');

const ogTpCd = codes.OG_TP_CD.filter((v) => ['W02', 'W01'].includes(v.codeId));
const rsbDvCd = computed(() => codes.RSB_DV_CD.filter((v) => (isGrdMOgVisible.value ? ['W0202', 'W0203'] : ['W0102', 'W0103']).includes(v.codeId)));

const outComeAllowancePsManagerUrl = '/sms/wells/fee/outcome-allowances/manager';
const outComeAllowancePsPlannerUrl = '/sms/wells/fee/outcome-allowances/planner';
const requestUrl = computed(() => (searchParams.value.ogTpCd === 'W02' ? outComeAllowancePsManagerUrl : outComeAllowancePsPlannerUrl));

let cachedParams;

watch(() => searchParams.value.perfYm, (newValue) => {
  searchParams.value.thmInqr = (newValue === dayjs().format('YYYYMM'));
});

watch(() => searchParams.value.ogTpCd, (newValue) => {
  searchParams.value.rsbDvCd = newValue === 'W02' ? 'W0202' : 'W0102';
  totalCount.value = 0;
});

async function onClickExcelDownload() {
  const response = await dataService.get(requestUrl.value, { params: cachedParams });

  const view = isGrdMOgVisible.value ? grdMOgRef.value.getView() : grdPOgRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: searchParams.value.perfYm,
      prtnrNo: searchParams.value.prtnrNo,
    },
  });

  if (result && !isEmpty(payload)) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

async function fetchData() {
  const res = await dataService.get(requestUrl.value, { params: cachedParams });
  const outcomeAllowances = res.data;
  totalCount.value = outcomeAllowances.length;

  const view = isGrdMOgVisible.value ? grdMOgRef.value.getView() : grdPOgRef.value.getView();

  view.getDataSource().setRows(outcomeAllowances);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMOg = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogCd',
      header: t('MSG_TXT_BLG'),
      width: '96',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
      } }, // 소속
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG_NM'), width: '96', styleName: 'text-center' }, // 소속명
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '96', styleName: 'text-center' }, // 성명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '106', styleName: 'text-center' }, // 사번
    { fieldName: 'dtrcN',
      header: { template: `${t('MSG_TXT_BRCH_N')}<br>(${t('MSG_TXT_THM')})` },
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 지점수(당월)
    { fieldName: 'trgCt',
      header: t('MSG_TXT_TRG'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 목표
    { fieldName: 'baseDtrcN',
      header: { template: `${t('MSG_TXT_BRCH_N')}<br>(${t('MSG_TXT_FXN')})` },
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 지점수(고정)
    { fieldName: 'perfCt',
      header: { template: `${t('MSG_TXT_PERF')}<br>(${t('MSG_TXT_MCHN_CH_INC')})` },
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 실적(기변포함)
    { fieldName: 'trgAchvRt', header: t('MSG_TXT_ACHV_RT'), width: '106', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' }, // 달성률
    { fieldName: 'nwSellAccCt',
      header: t('MSG_TXT_NW_SELL'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 신규판매
    { fieldName: 'purSprAccCt',
      header: t('MSG_TXT_PUR_SPR'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 순수이탈
    { fieldName: 'accNincCt',
      header: t('MSG_TXT_ACC_NINC'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 계정순증
    { fieldName: 'feeAckmtCt',
      header: t('MSG_TXT_PD_ACC_CNT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 인정건수
    { fieldName: 'elhmExcpPerfAmt',
      header: t('MSG_TXT_PERF'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 실적
    { fieldName: 'elhmExcpCt',
      header: t('MSG_TXT_COUNT'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 건수
    { fieldName: 'redfCt',
      header: t('MSG_TXT_REDF_CT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 되물림 건수
    { fieldName: 'perfAggAmt',
      header: t('MSG_TXT_AGGS'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 누계
    { fieldName: 'mngrDangGd', header: { template: `${t('MSG_TXT_ADMIN')}<br>(${t('MSG_TXT_DANG_GD')})` }, width: '106', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 관리자 위험등급
    { fieldName: 'trgAchvAwAmt',
      header: { template: `${t('MSG_TXT_TRG_ACHV_AW')}<br>(${t('MSG_TXT_PD_ACC_CNT')})` },
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 목표달성 수당(인정건수)
    { fieldName: 'brchNincCt',
      header: t('MSG_TXT_BRCH_NINC'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 지점순증
    { fieldName: 'wmAclActiCt',
      header: 'WM',
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.#',
      headerSummary: {
        numberFormat: '#,##0.#',
        expression: 'sum',
      } }, // WM
    { fieldName: 'bfsvcAclActiCt',
      header: ' Pre-M(BS)',
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.#',
      headerSummary: {
        numberFormat: '#,##0.#',
        expression: 'sum',
      } }, // Pre-M(BS)
    { fieldName: 'aclActiBrchAvCt',
      header: { template: `${t('MSG_TXT_ACL_ACTI')}<br>(${t('MSG_TXT_BRNCH_OFFC_AVG')})` },
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.##',
      headerSummary: {
        numberFormat: '#,##0.##',
        expression: 'sum',
      } }, // 실활동(지평)
    { fieldName: 'actvBrchN',
      header: t('MSG_TXT_ACTV_BRCH'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 활성 지점
    { fieldName: 'ogAwAmt',
      header: t('MSG_TXT_OG_AW'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 조직수당
    { fieldName: 'dsbAmt',
      header: t('MSG_TXT_DSB_SUM'),
      width: '146',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 지급계
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  // 헤더쪽 합계 행고정, summary
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    {
      column: 'ogCd',
      summaryUserSpans: [{ colspan: 4 }],
    },
    'ogNm',
    'prtnrKnm',
    'prtnrNo',
    'dtrcN',
    'trgCt',
    'baseDtrcN',
    'perfCt',
    'trgAchvRt',
    {
      header: t('MSG_TXT_ACC_NINC'), // 계정순증
      direction: 'horizontal', // merge type
      items: ['nwSellAccCt', 'purSprAccCt', 'accNincCt'],
    },
    'feeAckmtCt',
    {
      header: t('MSG_TXT_ELHM_EXCP'), // 가전 외
      direction: 'horizontal', // merge type
      items: ['elhmExcpPerfAmt', 'elhmExcpCt'],
    },
    'redfCt',
    'perfAggAmt',
    'mngrDangGd',
    'trgAchvAwAmt',
    'brchNincCt',
    {
      header: t('MSG_TXT_ACL_ACTI'), // 실활동
      direction: 'horizontal', // merge type
      items: ['wmAclActiCt', 'bfsvcAclActiCt'],
    },
    'aclActiBrchAvCt',
    'actvBrchN',
    'ogAwAmt',
    'dsbAmt',
  ]);
});

const initGridPOg = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG_NM'), width: '96', styleName: 'text-center' }, // 소속명
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '96', styleName: 'text-center' }, // 성명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '106', styleName: 'text-center' }, // 사번
    { fieldName: 'trgCt', header: t('MSG_TXT_TRG_CT'), width: '106', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 목표건수
    { fieldName: 'perfCt', header: t('MSG_TXT_ACHV_CT'), width: '106', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 달성건수
    { fieldName: 'trgAchvRt', header: t('MSG_TXT_ACHV_RT'), width: '106', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' }, // 달성률
    { fieldName: 'trgAchvAwAmt', header: t('MSG_TXT_TRG_ACHV_AW_SUM'), width: '133', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 목표달성 수당 계
    { fieldName: 'thm1OptnTrgCt', header: t('MSG_TXT_1ST_M_OPTN_TRG'), width: '133', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 1차월가동목표
    { fieldName: 'thm1OptnAchvCt', header: t('MSG_TXT_1M_OPTN_ACHV'), width: '133', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 1차월가동달성
    { fieldName: 'thm1OptnAchvRt', header: t('MSG_TXT_1M_OPTN_ACHV_RT'), width: '133', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' }, // 1차월가동달성률
    { fieldName: 'thm1OptnAwAmt', header: t('MSG_TXT_1M_OPTN_ACHV_AW'), width: '133', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 1차월가동수당
    { fieldName: 'aclActiTrgCt', header: t('MSG_TXT_ACL_ACTI_TRG'), width: '133', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 실활동목표
    { fieldName: 'aclActiAchvCt', header: t('MSG_TXT_ACL_ACTI_ACHV'), width: '133', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 실활동달성
    { fieldName: 'aclActiAchvRt', header: t('MSG_TXT_ACL_ACTI_ACHV_RAT'), width: '133', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' }, // 실활동달성률
    { fieldName: 'aclActiAwAmt', header: t('MSG_TXT_ACL_ACTI_AW'), width: '133', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 실활동수당
    { fieldName: 'ogAchvAwSumAmt', header: t('MSG_TXT_OG_ACHV_AW_SUM'), width: '133', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 조직달성 수당 계
    { fieldName: 'ejtAwAmt', header: t('MSG_TXT_EJT_AW'), width: '133', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 배출수당
    { fieldName: 'outcAwSumAmt', header: t('MSG_TXT_OUTC_AW_TOT_SUM'), width: '146', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 성과수당 총계

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'ogNm',
    'prtnrKnm',
    'prtnrNo',
    {
      header: t('MSG_TXT_TRG_ACHV_AW'), // 목표달성수당
      direction: 'horizontal', // merge type
      items: ['trgCt', 'perfCt', 'trgAchvRt'],
    },
    'trgAchvAwAmt',
    {
      header: t('MSG_TXT_OG_ACHV_AW'), // 조직달성수당
      direction: 'horizontal',
      items: ['thm1OptnTrgCt', 'thm1OptnAchvCt', 'thm1OptnAchvRt', 'thm1OptnAwAmt', 'aclActiTrgCt', 'aclActiAchvCt', 'aclActiAchvRt', 'aclActiAwAmt'],
    },
    'ogAchvAwSumAmt',
    'ejtAwAmt',
    'outcAwSumAmt',
  ]);
});
</script>
