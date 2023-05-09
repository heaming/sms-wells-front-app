<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEF
2. 프로그램 ID : WwfefEstimateFeePOgListM - 예상수수료 조회(P조직)
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.03.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 예상수수료 조회(P조직)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_INQR')"
          required
        >
          <kw-option-group
            v-model="searchParams.perType"
            :label="$t('MSG_TXT_PERF_INQR')"
            type="radio"
            rules="required"
            :options="[{ codeId: '00', codeName: $t('MSG_TXT_RCP') },
                       { codeId: '01', codeName: $t('MSG_TXT_SL') }]"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          required
        >
          <kw-input
            v-model="searchParams.sellPrtnrNo"
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            rules="required"
            icon="search"
            clearable
            @click-icon="onClickSearchPrtnrNoPopup"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_DEFAULT_INFO') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-form dense>
        <kw-form-row>
          <!-- 성명 -->
          <kw-form-item :label="$t('MSG_TXT_EMPL_NM')">
            <kw-input
              v-model="baseInfo.prtnrKnm"
              readonly
              underline
              placeholder=""
            />
          </kw-form-item>
          <!-- 소속 -->
          <kw-form-item :label="$t('MSG_TXT_BLG')">
            <kw-input
              v-model="baseInfo.ogCd"
              readonly
              underline
              placeholder=""
            />
          </kw-form-item>
          <!-- 직책 -->
          <kw-form-item :label="$t('MSG_TXT_RSB')">
            <kw-select
              v-model="baseInfo.rsbDvCd"
              :options="codes.RSB_DV_CD"
              readonly
              underline
              placeholder=""
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 예상판매수수료 -->
          <kw-form-item :label="$t('MSG_TXT_EST_SAL_COMM')">
            <kw-input
              v-model="baseInfo.amtEstSalFee"
              readonly
              underline
              placeholder=""
              mask="###,###,###,###,###"
            />
          </kw-form-item>
          <!-- 예상상조수수료 -->
          <kw-form-item :label="$t('MSG_TXT_EXP_MUT_AID_FEE')">
            <kw-input
              v-model="baseInfo.amtMutAidFee"
              readonly
              underline
              placeholder=""
              mask="###,###,###,###,###"
            />
          </kw-form-item>
          <!-- 예상수수료합계 -->
          <kw-form-item :label="$t('MSG_TXT_TOT_EST_FEE')">
            <kw-input
              v-model="baseInfo.amtFeeSum"
              readonly
              underline
              placeholder=""
              mask="###,###,###,###,###"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_PERF_DETAIL') }}</h3>
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }} </span>
        </template>
        <kw-btn
          :label="$t('MSG_TXT_CALCULATE')"
          dense
          primary
          @click="onClickCalculate"
        />
      </kw-action-top>
      <kw-grid
        ref="grdPerformanceRef"
        :visible-rows="4"
        @init="initGrdPerformanceDtl"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_EST_FEE_DTL') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-grid
        ref="grdEstimatedRef"
        :visible-rows="2"
        @init="initGrdEstimatedFeeDtl"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_SAL_HIST') }}</h3>
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdSalesRef"
        :visible-rows="3"
        @init="initGrdSalesHist"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, useDataService, useGlobal, getComponentType, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const now = dayjs();
const { modal } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdPerformanceRef = ref(getComponentType('KwGrid'));
const grdEstimatedRef = ref(getComponentType('KwGrid'));
const grdSalesRef = ref(getComponentType('KwGrid'));
const grdPerformanceData = computed(() => grdPerformanceRef.value?.getData());
const grdEstimatedData = computed(() => grdEstimatedRef.value?.getData());
const grdSalesData = computed(() => grdSalesRef.value?.getData());
const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
  'PERF_DV_CD',
  'CNTRW_TP_CD',
  'WELS_SELL_DV_CD',
);
let cachedParams;
const searchParams = ref({
  perfYm: now.format('YYYYMM'),
  perType: '00',
  sellPrtnrNo: '',
});
const baseInfo = ref({
  prtnrKnm: '',
  ogCd: '',
  rsbDvCd: '',
  amtEstSalFee: null,
  amtMutAidFee: null,
  amtFeeSum: null,
});

// 데이터 조회
async function fetchData() {
  const { data } = await dataService.get('/sms/wells/fee/estimate/p-og', { params: { ...cachedParams } });
  baseInfo.value = data.base;
  grdPerformanceData.value.setRows(data.performances);
  grdEstimatedData.value.setRows(data.estimates);
  grdSalesData.value.setRows(data.sales);
}
// 조회버튼
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// 계산버튼 클릭
async function onClickCalculate() {
  // 진건프로님 api 호출
}
// 파트너 검색 팝업
async function onClickSearchPrtnrNoPopup() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.sellPrtnrNo,
    },
  });
  if (result) {
    searchParams.value.sellPrtnrNo = payload.prtnrNo;
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdPerformanceDtl = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'type', header: t('MSG_TXT_DIV'), width: '220', styleName: 'text-left' },
    { fieldName: 'amtElhm', header: t('MSG_TXT_ELHM'), width: '220', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'amtExceptElhm', header: t('MSG_TXT_EXCEPT_HOUSEHOLD_APPLIANCES'), width: '220', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'amtMutu429', header: '429', width: '220', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'amtMutu599', header: '599', width: '220', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'eduCertSrtupYn', header: t('MSG_TXT_PLANNER_STRTUP'), width: '220', styleName: 'text-center' },
    { fieldName: 'eduCertPlarPriticYn ', header: t('MSG_TXT_PLANNER_PRCTC'), width: '220', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  // multi row header setting
  view.setColumnLayout([
    'type',
    'amtElhm',
    'amtExceptElhm',
    {
      header: t('MSG_TXT_MUTU'), // colspan title
      direction: 'horizontal', // merge type
      items: ['amtMutu429', 'amtMutu599'],
    },
    {
      header: t('MSG_TXT_EDU_CERT'),
      direction: 'horizontal',
      items: ['eduCertSrtupYn', 'eduCertPlarPriticYn'],
    },
  ]);
});

const initGrdEstimatedFeeDtl = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'div', header: t('MSG_TXT_DIV'), width: '218' },
    { fieldName: 'amtSumElhmPrpn', header: t('MSG_TXT_ELHM_PRPN'), styleName: 'text-right', width: '135', dataType: 'number' },
    { fieldName: 'amtSumElhmExcpPrpn', header: t('MSG_TXT_ELHM_EXCP_PRPN'), styleName: 'text-right', width: '135', dataType: 'number' },
    { fieldName: 'amtSumSalIntv', header: t('MSG_TXT_SAL_INTV'), styleName: 'text-right', width: '135', dataType: 'number' },
    { fieldName: 'amtSumStmnt', header: t('MSG_TXT_STMNT'), styleName: 'text-right', width: '135', dataType: 'number' },
    { fieldName: 'amtSumMutu', header: t('MSG_TXT_MUTU'), styleName: 'text-right', width: '135', dataType: 'number' },
    { fieldName: 'amtSumOgElhmPrpn', header: t('MSG_TXT_ELHM_PRPN'), styleName: 'text-right', width: '165', dataType: 'number' },
    { fieldName: 'amtSumOgElhmExcpPrpn', header: t('MSG_TXT_ELHM_EXCP_PRPN'), styleName: 'text-right', width: '165', dataType: 'number' },
    { fieldName: 'amtSumOgSalIntv', header: t('MSG_TXT_SAL_INTV'), styleName: 'text-right', width: '166', dataType: 'number' },
    { fieldName: 'amtSumOgMutu ', header: t('MSG_TXT_MUTU'), styleName: 'text-right', width: '165', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'div',
    {
      header: t('MSG_TXT_PRSNL_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['amtSumElhmPrpn', 'amtSumElhmExcpPrpn', 'amtSumSalIntv', 'amtSumStmnt', 'amtSumMutu'],
    },
    {
      header: t('MSG_TXT_ORGNSTN_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['amtSumOgElhmPrpn', 'amtSumOgElhmExcpPrpn', 'amtSumOgSalIntv', 'amtSumOgMutu'],
    },
  ]);
});
const initGrdSalesHist = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '118', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '120' },
    { fieldName: 'perfDvCd', header: t('MSG_TXT_PERF_DV'), width: '118', options: codes.PERF_DV_CD },
    { fieldName: 'cntrwTpCd', header: t('MSG_TXT_PRDT_GUBUN'), width: '118', options: codes.CNTRW_TP_CD },
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_RCPDT'), width: '118', dataType: 'date', datetimeFormat: 'datetime' },
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_SL_DT'), width: '118', dataType: 'date', datetimeFormat: 'datetime' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '118' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_IZ'), width: '287' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '118' },
    { fieldName: 'sellDvCd', header: t('MSG_TXT_SLS_CAT'), width: '118', styleName: 'text-center', options: codes.WELS_SELL_DV_CD },
    { fieldName: 'amtSumElhm', header: t('MSG_TXT_ELHM'), width: '118', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'amtSumExceptElhm', header: t('MSG_TXT_EXCEPT_HOUSEHOLD_APPLIANCES'), width: '118', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'amtSumChng', header: t('MSG_TXT_CHNG'), width: '118', styleName: 'text-right', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
