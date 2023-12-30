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
      <kw-search-row cols="3">
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
          :label="$t('MSG_TXT_OG_DV')"
        >
          <kw-option-group
            v-model="searchParams.ogTpCd"
            type="radio"
            :options="ogTpCds"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB')"
        >
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            type="radio"
            :options="rsbDvCds"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row cols="3">
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
        <kw-separator
          vertical
          spaced
          inset
        />
        <kw-btn
          v-show="!editable"
          v-permission:create
          dense
          primary
          :label="$t('MSG_BTN_MOD')"
          :disable="totalCount===0"
          @click="onClickModify"
        />
        <kw-btn
          v-show="editable"
          v-permission:create
          dense
          primary
          :label="$t('MSG_BTN_SAVE')"
          :disable="totalCount===0"
          @click="onClickSave"
        />
        <kw-btn
          v-show="editable"
          v-permission:create
          dense
          secondary
          :label="$t('MSG_BTN_CANCEL')"
          :disable="totalCount===0"
          @click="onClickCancel"
        />
        <kw-btn
          v-show="editable"
          v-permission:create
          dense
          secondary
          :label="$t('MSG_TXT_CALCULATE')"
          :disable="totalCount===0"
          @click="onClickCalculate"
        />
        <kw-btn
          v-show="editable"
          v-permission:create
          dense
          secondary
          :label="$t('MSG_TXT_RTM')+' '+$t('MSG_BTN_INQR')"
          :disable="totalCount===0"
          @click="onClickRtmSearch"
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
const editable = ref(false);
const originalDataSource = ref([]);
const allowanceBaseInfo = ref([]);

const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
  'OG_TP_CD',
);

const searchParams = ref({
  perfYm: dayjs().subtract(1, 'month').format('YYYYMM'),
  rsbDvCd: 'W0202',
  ogTpCd: 'W02',
  prtnrNo: '',
  rtmInqr: false,
});

const isGrdMOgVisible = computed(() => searchParams.value.ogTpCd === 'W02');
const isGrdPOgVisible = computed(() => searchParams.value.ogTpCd === 'W01');

const ogTpCds = codes.OG_TP_CD.filter((v) => ['W02', 'W01'].includes(v.codeId));
const rsbDvCds = computed(() => codes.RSB_DV_CD.filter((v) => (isGrdMOgVisible.value ? ['W0202', 'W0203'] : ['W0102', 'W0103']).includes(v.codeId)));

const outComeAllowancePsManagerUrl = '/sms/wells/fee/outcome-allowances/manager';
const outComeAllowancePsPlannerUrl = '/sms/wells/fee/outcome-allowances/planner';
const requestUrl = computed(() => (searchParams.value.ogTpCd === 'W02' ? outComeAllowancePsManagerUrl : outComeAllowancePsPlannerUrl));

let cachedParams;

async function getAllowanceBaseInfo(perfYm) {
  const response = await dataService.get('/sms/wells/fee/outcome-allowances/base-info', { params: { perfYm } });
  return response.data;
}

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

async function fetchData(params) {
  allowanceBaseInfo.value = await getAllowanceBaseInfo(params.perfYm);
  const res = await dataService.get(requestUrl.value, { params });
  const outcomeAllowances = res.data;
  totalCount.value = outcomeAllowances.length;

  const view = isGrdMOgVisible.value ? grdMOgRef.value.getView() : grdPOgRef.value.getView();

  view.getDataSource().setRows(outcomeAllowances);
  view.resetCurrent();
}

function getManagerAwBase(ogTpCd, rsbDvCd, mngrOutcDvCd, orgAchvRt, ogrNincCt = 0) {
  const achvRt = orgAchvRt < 0 ? 0 : orgAchvRt;
  let nincCt = ogrNincCt < 0 ? 0 : ogrNincCt;
  nincCt = (nincCt > 998 ? 998 : nincCt);
  const { awAmt = 0 } = allowanceBaseInfo.value.find((baseInfo) => {
    const checkCondition = ogTpCd === baseInfo.ogTpCd
        && rsbDvCd === baseInfo.rsbDvCd
        && mngrOutcDvCd === baseInfo.mngrOutcDvCd
        && baseInfo.achvStrtRat <= achvRt
        && achvRt < baseInfo.achvEndRat;
    if (ogTpCd === 'W01') {
      return checkCondition;
    }
    return checkCondition
      && baseInfo.nincStrtCt <= nincCt
      && nincCt < baseInfo.nincEndCt;
  });
  return awAmt;
}

async function calculateOutcomeAllowance(view) {
  const changedRows = gridUtil.getChangedRowValues(view);
  const { ogTpCd, rsbDvCd } = searchParams.value;
  const rsbDv = rsbDvCd.substring(3, 5);
  if (isGrdMOgVisible.value) {
    changedRows.forEach((row) => {
      const { dataRow: index, dtrcN, baseDtrcN,
        trgCt, perfCt, nwSellAccCt, purSprAccCt,
        feeAckmtCt, elhmExcpPerfAmt, redfCt, mngrDangGd, wmAclActiCt, bfsvcAclActiCt, actvBrchN } = row;
      const newTrgAchvRt = trgCt > 0 ? (Math.round((perfCt / trgCt) * 10000) / 100) : 0;
      const newAccNincCt = nwSellAccCt - purSprAccCt;
      const newElhmExcpCt = Math.ceil(elhmExcpPerfAmt / 500000);
      const newPerfAggAmt = feeAckmtCt + newElhmExcpCt - redfCt;
      const newBrchNincCt = dtrcN - baseDtrcN;
      const newAclActiBrchAvCt = baseDtrcN > 0
        ? (Math.round((100 * (wmAclActiCt + bfsvcAclActiCt)) / baseDtrcN) / 100) : 0;
      const newTrgAchvAwAmt = getManagerAwBase(ogTpCd, rsbDv, 'TAR', newTrgAchvRt, newAccNincCt) * newPerfAggAmt - mngrDangGd;
      const newOgAwAmt = getManagerAwBase(ogTpCd, rsbDv, 'ORG', newAclActiBrchAvCt, newBrchNincCt) * actvBrchN;
      const newDsbAmt = newTrgAchvAwAmt + newOgAwAmt;
      view.setValue(index, 'trgAchvRt', newTrgAchvRt);
      view.setValue(index, 'accNincCt', newAccNincCt);
      view.setValue(index, 'elhmExcpCt', newElhmExcpCt);
      view.setValue(index, 'perfAggAmt', newPerfAggAmt);
      view.setValue(index, 'trgAchvAwAmt', newTrgAchvAwAmt);
      view.setValue(index, 'brchNincCt', newBrchNincCt);
      view.setValue(index, 'aclActiBrchAvCt', newAclActiBrchAvCt);
      view.setValue(index, 'ogAwAmt', newOgAwAmt);
      view.setValue(index, 'dsbAmt', newDsbAmt);
    });
  } else {
    changedRows.forEach((row) => {
      const { dataRow: index, trgCt, perfCt, aclActiTrgCt, aclActiAchvCt, thm1OptnAchvCt, thm1OptnTrgCt } = row;
      const newTrgAchvRt = trgCt > 0 ? (Math.round((perfCt / trgCt) * 10000) / 100) : 0;
      const newAclActiAchvRt = aclActiTrgCt > 0 ? (Math.round((aclActiAchvCt / aclActiTrgCt) * 1000) / 10) : 0;
      const newThm1OptnAchvRt = thm1OptnAchvCt > 0 ? (Math.round((thm1OptnAchvCt / thm1OptnTrgCt) * 1000) / 10) : 0;
      const newTrgAchvAwAmt = getManagerAwBase(ogTpCd, rsbDv, 'TAR', newTrgAchvRt) * perfCt;
      const newAclActiAwAmt = getManagerAwBase(ogTpCd, rsbDv, 'ACT', newAclActiAchvRt) * aclActiAchvCt;
      const newThm1OptnAwAmt = getManagerAwBase(ogTpCd, rsbDv, 'OPT', newThm1OptnAchvRt) * thm1OptnTrgCt;
      const newOgAchvAwSumAmt = newAclActiAwAmt + newThm1OptnAwAmt;
      const newOutcAwSumAmt = newTrgAchvAwAmt + newOgAchvAwSumAmt;
      view.setValue(index, 'trgAchvRt', newTrgAchvRt);
      view.setValue(index, 'aclActiAchvRt', newAclActiAchvRt);
      view.setValue(index, 'thm1OptnAchvRt', newThm1OptnAchvRt);
      view.setValue(index, 'trgAchvAwAmt', newTrgAchvAwAmt);
      view.setValue(index, 'thm1OptnAwAmt', newThm1OptnAwAmt);
      view.setValue(index, 'aclActiAwAmt', newAclActiAwAmt);
      view.setValue(index, 'ogAchvAwSumAmt', newOgAchvAwSumAmt);
      view.setValue(index, 'outcAwSumAmt', newOutcAwSumAmt);
    });
  }
}

async function onClickCalculate() {
  const view = isGrdMOgVisible.value ? grdMOgRef.value.getView() : grdPOgRef.value.getView();
  if (await gridUtil.validate(view)) {
    calculateOutcomeAllowance(view);
  }
}

async function onClickModify() {
  const view = isGrdMOgVisible.value ? grdMOgRef.value.getView() : grdPOgRef.value.getView();
  view.editOptions.editable = true;
  editable.value = true;
  originalDataSource.value = gridUtil.getAllRowValues(view);
}

async function onClickSave() {
  const view = isGrdMOgVisible.value ? grdMOgRef.value.getView() : grdPOgRef.value.getView();
  if (await gridUtil.validate(view)) {
  /* 데이터 업데이트 후 재조회 */
    view.editOptions.editable = false;
    editable.value = false;
    calculateOutcomeAllowance(view);
    const { perfYm, ogTpCd, rsbDvCd } = cachedParams;
    const newRows = gridUtil.getAllRowValues(view).map((row) => ({ ...row, baseYm: perfYm, ogTpCd, rsbDvCd }));
    await dataService.post(requestUrl.value, newRows);
    await fetchData({ ...cachedParams, rtmInqr: false });
  }
}

async function onClickCancel() {
  const view = isGrdMOgVisible.value ? grdMOgRef.value.getView() : grdPOgRef.value.getView();
  view.getDataSource().setRows(originalDataSource.value);
  view.editOptions.editable = false;
  editable.value = false;
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

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  editable.value = false;
  await fetchData(cachedParams);
}

async function onClickRtmSearch() {
  await fetchData({ ...cachedParams, rtmInqr: true });
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
      editable: false,
      headerSummary: {
        text: t('MSG_TXT_SUM'),
      } }, // 소속
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG_NM'), width: '96', editable: false, styleName: 'text-center' }, // 소속명
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '96', editable: false, styleName: 'text-center' }, // 성명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '106', editable: false, styleName: 'text-center' }, // 사번
    { fieldName: 'dtrcN',
      header: `${t('MSG_TXT_BRCH_N')}(${t('MSG_TXT_THM')})`,
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      rules: 'required|max_value:999',
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
      rules: 'required|max_value:9999999',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 목표
    { fieldName: 'baseDtrcN',
      header: `${t('MSG_TXT_BRCH_N')}(${t('MSG_TXT_FXN')})`,
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      rules: 'required|max_value:999',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 지점수(고정)
    { fieldName: 'perfCt',
      header: `${t('MSG_TXT_PERF')}(${t('MSG_TXT_MCHN_CH_INC')})`,
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      rules: 'required|max_value:9999999',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 실적(기변포함)
    { fieldName: 'trgAchvRt',
      header: t('MSG_TXT_ACHV_RT'),
      width: '106',
      editable: false,
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.##' }, // 달성률
    { fieldName: 'nwSellAccCt',
      header: t('MSG_TXT_NW_SELL'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      rules: 'required|max_value:9999999',
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
      rules: 'required|max_value:9999999',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 순수이탈
    { fieldName: 'accNincCt',
      header: t('MSG_TXT_ACC_NINC'),
      width: '106',
      editable: false,
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
      rules: 'required|max_value:9999999',
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
      rules: 'required|max_value:9999999999',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 실적
    { fieldName: 'elhmExcpCt',
      header: t('MSG_TXT_COUNT'),
      width: '106',
      editable: false,
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
      rules: 'required|max_value:9999999',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 되물림 건수
    { fieldName: 'perfAggAmt',
      header: t('MSG_TXT_AGGS'),
      width: '120',
      editable: false,
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 누계
    { fieldName: 'mngrDangGd',
      header: `${t('MSG_TXT_ADMIN')}(${t('MSG_TXT_DANG_GD')})`,
      width: '146',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      rules: 'required|max_value:9999999' }, // 관리자 위험등급
    { fieldName: 'trgAchvAwAmt',
      header: `${t('MSG_TXT_TRG_ACHV_AW')}(${t('MSG_TXT_PD_ACC_CNT')})`,
      width: '153',
      editable: false,
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
      editable: false,
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
      rules: 'required|max_value:9999999',
      headerSummary: {
        numberFormat: '#,##0.#',
        expression: 'sum',
      } }, // WM
    { fieldName: 'bfsvcAclActiCt',
      header: 'Pre-M(BS)',
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.#',
      rules: 'required|max_value:9999999',
      headerSummary: {
        numberFormat: '#,##0.#',
        expression: 'sum',
      } }, // Pre-M(BS)
    { fieldName: 'aclActiBrchAvCt',
      header: `${t('MSG_TXT_ACL_ACTI')}(${t('MSG_TXT_BRNCH_OFFC_AVG')})`,
      width: '106',
      editable: false,
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
      rules: 'required|max_value:9999999',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 활성 지점
    { fieldName: 'ogAwAmt',
      header: t('MSG_TXT_OG_AW'),
      width: '133',
      editable: false,
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
      editable: false,
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
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG_NM'), width: '96', editable: false, styleName: 'text-center' }, // 소속명
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '96', editable: false, styleName: 'text-center' }, // 성명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '106', editable: false, styleName: 'text-center' }, // 사번
    { fieldName: 'trgCt',
      header: t('MSG_TXT_TRG_CT'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      rules: 'required|max_value:9999999',
      numberFormat: '#,##0' }, // 목표건수
    { fieldName: 'perfCt',
      header: t('MSG_TXT_ACHV_CT'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      rules: 'required|max_value:9999999',
      numberFormat: '#,##0' }, // 달성건수
    { fieldName: 'trgAchvRt',
      header: t('MSG_TXT_ACHV_RT'),
      width: '106',
      editable: false,
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.##',
    }, // 달성률
    { fieldName: 'trgAchvAwAmt', header: t('MSG_TXT_TRG_ACHV_AW_SUM'), width: '133', editable: false, styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 목표달성 수당 계
    { fieldName: 'thm1OptnTrgCt',
      header: t('MSG_TXT_1ST_M_OPTN_TRG'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      rules: 'required|max_value:9999999',
      numberFormat: '#,##0' }, // 1차월가동목표
    { fieldName: 'thm1OptnAchvCt',
      header: t('MSG_TXT_1M_OPTN_ACHV'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      rules: 'required|max_value:9999999',
      numberFormat: '#,##0' }, // 1차월가동달성
    { fieldName: 'thm1OptnAchvRt', header: t('MSG_TXT_1M_OPTN_ACHV_RT'), width: '133', editable: false, styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' }, // 1차월가동달성률
    { fieldName: 'thm1OptnAwAmt', header: t('MSG_TXT_1M_OPTN_ACHV_AW'), width: '133', editable: false, styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 1차월가동수당
    { fieldName: 'aclActiTrgCt',
      header: t('MSG_TXT_ACL_ACTI_TRG'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      rules: 'required|max_value:9999999',
      numberFormat: '#,##0' }, // 실활동목표
    { fieldName: 'aclActiAchvCt',
      header: t('MSG_TXT_ACL_ACTI_ACHV'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      rules: 'required|max_value:9999999',
      numberFormat: '#,##0' }, // 실활동달성
    { fieldName: 'aclActiAchvRt', header: t('MSG_TXT_ACL_ACTI_ACHV_RAT'), width: '133', editable: false, styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' }, // 실활동달성률
    { fieldName: 'aclActiAwAmt', header: t('MSG_TXT_ACL_ACTI_AW'), width: '133', editable: false, styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 실활동수당
    { fieldName: 'ogAchvAwSumAmt', header: t('MSG_TXT_OG_ACHV_AW_SUM'), width: '133', editable: false, styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 조직달성 수당 계
    { fieldName: 'ejtAwAmt',
      header: t('MSG_TXT_EJT_AW'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      rules: 'required|max_value:9999999999',
      numberFormat: '#,##0' }, // 배출수당
    { fieldName: 'outcAwSumAmt', header: t('MSG_TXT_OUTC_AW_TOT_SUM'), width: '146', editable: false, styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 성과수당 총계

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
