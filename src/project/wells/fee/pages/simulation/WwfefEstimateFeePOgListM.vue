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
- 2023.07.11 스케치 및 로직 변경
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
          <zwog-partner-search
            v-model:prtnr-no="searchParams.sellPrtnrNo"
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            required
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
            <p>{{ baseInfo?.prtnrKnm }}</p>
          </kw-form-item>
          <!-- 소속 -->
          <kw-form-item :label="$t('MSG_TXT_BLG')">
            <p>{{ baseInfo?.ogCd }}</p>
          </kw-form-item>
          <!-- 직책 -->
          <kw-form-item :label="$t('MSG_TXT_RSB')">
            <p>{{ codes.RSB_DV_CD.find((code) => code.codeId === baseInfo?.rsbDvCd)?.codeName }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 미팅일수 -->
          <kw-form-item
            :label="$t('MSG_TXT_METG_DC')"
            align-content="right"
          >
            <p>미팅일수</p>
          </kw-form-item>
          <!-- 개시차월 -->
          <kw-form-item
            :label="$t('MSG_TXT_OPNG_NMN')"
            align-content="right"
          >
            <p>{{ baseInfo?.startYm }}</p>
          </kw-form-item>
          <!-- 승진차월 -->
          <kw-form-item
            :label="$t('MSG_TXT_PRFMT_NMN')"
            align-content="right"
          >
            <p>{{ baseInfo?.prfmtYm }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 예상판매수수료 -->
          <kw-form-item
            :label="$t('MSG_TXT_EST_SAL_COMM')"
            align-content="right"
          >
            <p>{{ baseInfo?.amtEstSalFee ? stringUtil.getNumberWithComma(baseInfo?.amtEstSalFee) : '' }}</p>
          </kw-form-item>
          <!-- 예상상조수수료 -->
          <kw-form-item
            :label="$t('MSG_TXT_EXP_MUT_AID_FEE')"
            align-content="right"
          >
            <p>{{ baseInfo?.amtMutAidFee ? stringUtil.getNumberWithComma(baseInfo?.amtEsamtMutAidFeetSalFee) : '' }}</p>
          </kw-form-item>
          <!-- 예상수수료합계 -->
          <kw-form-item
            :label="$t('MSG_TXT_TOT_EST_FEE')"
            align-content="right"
          >
            <p>{{ baseInfo?.amtFeeSum ? stringUtil.getNumberWithComma(baseInfo?.amtFeeSum) : '' }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row
          v-if="userDvCd === 'OG'"
        >
          <!-- 예상조직수수료 -->
          <kw-form-item
            :label="$t('MSG_TXT_EST_OG_FEE')"
            align-content="right"
          >
            <p>{{ baseInfo?.amtEstOgFee ? stringUtil.getNumberWithComma(baseInfo?.amtEstOgFee) : '' }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <!-- 미팅 및 교육내역 -->
      <h3>{{ t('MSG_TXT_METG_EDUC_IZ') }}</h3>
      <kw-grid
        ref="grdMtRef"
        :visible-rows="1"
        @init="initGridMt"
      />
      <!-- 실적내역 -->
      <kw-action-top class="mt30">
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
        :visible-rows="userDvCd === 'OG' ? 4 : 2"
        @init="initGrdPerformanceDtl"
      />
      <!-- 예상수수료 내역 -->
      <kw-action-top class="mt30">
        <template #left>
          <h3>{{ t('MSG_TXT_EST_FEE_DTL') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <table class="kw-table--normal">
        <colgroup>
          <col style="width: 12%;">
          <col style="width: 11%;">
          <col style="width: 11%;">
          <col style="width: 11%;">
          <col style="width: 11%;">
          <col style="width: 11%;">
          <col style="width: 11%;">
          <col style="width: 11%;">
          <col style="width: 11%;">
        </colgroup>
        <tbody>
          <!-- 개인수수료 -->
          <tr>
            <th rowspan="2">
              {{ t('MSG_TXT_PRSNL_FEE') }}
            </th>
            <th>{{ t('MSG_TXT_ELHM_PRPN') }}</th>
            <th>{{ t('MSG_TXT_ELHM_EXCP_PRPN') }}</th>
            <th>{{ t('MSG_TXT_SAL_INTV') }}</th>
            <th>{{ t('MSG_TXT_METG') }}</th>
            <th>{{ t('MSG_TXT_STMNT') }}</th>
            <th>{{ t('MSG_TXT_MUTU') }}</th>
            <th />
            <th>{{ t('MSG_TXT_AGG') }}</th>
          </tr>
          <tr>
            <td class="text-right">
              0
            </td>
            <td class="text-right">
              0
            </td>
            <td class="text-right">
              0
            </td>
            <td class="text-right">
              0
            </td>
            <td class="text-right">
              0
            </td>
            <td class="text-right">
              0
            </td>
            <td />
            <td class="text-right">
              0
            </td>
          </tr>
          <!-- 조직수수료 -->
          <template
            v-if="userDvCd === 'OG'"
          >
            <tr>
              <th rowspan="2">
                {{ t('MSG_TXT_ORGNSTN_FEE') }}
              </th>
              <th>{{ t('MSG_TXT_ELHM_OG_PRPN') }}</th>
              <th>{{ t('MSG_TXT_ELHM_OG_EXCP_PRPN') }}</th>
              <th>{{ t('MSG_TXT_OG_SELL_ENCRG') }}</th>
              <th>{{ t('MSG_TXT_OG_EJT') }}1</th>
              <th>{{ t('MSG_TXT_OG_EJT') }}2</th>
              <th>{{ t('MSG_TXT_NB_BRCH') }}</th>
              <th>{{ t('MSG_TXT_PRFMT_FEE') }}</th>
              <th>{{ t('MSG_TXT_AGG') }}</th>
            </tr>
            <tr>
              <td class="text-right">
                0
              </td>
              <td class="text-right">
                0
              </td>
              <td class="text-right">
                0
              </td>
              <td class="text-right">
                0
              </td>
              <td class="text-right">
                0
              </td>
              <td class="text-right">
                0
              </td>
              <td class="text-right">
                0
              </td>
              <td class="text-right">
                0
              </td>
            </tr>
          </template>
          <tr>
            <td class="sum-head">
              {{ t('MSG_TXT_SUM') }}
            </td>
            <td class="sum-head">
              0
            </td>
          </tr>
        </tbody>
      </table>
      <!-- 판매내역 -->
      <kw-action-top class="mt30">
        <template #left>
          <h3>{{ t('MSG_TXT_SAL_HIST') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
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
import { defineGrid, useDataService, getComponentType, codeUtil, stringUtil, useGlobal } from 'kw-lib';
import { cloneDeep, reduce } from 'lodash-es';
import dayjs from 'dayjs';
import ZwogPartnerSearch from '~sms-common/organization/components/ZwogPartnerSearch.vue';

const now = dayjs();
const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const userDvCd = ref('OG');
const grdMtRef = ref(getComponentType('KwGrid'));
const grdPerformanceRef = ref(getComponentType('KwGrid'));
const grdSalesRef = ref(getComponentType('KwGrid'));

const grdMtData = computed(() => grdMtRef.value?.getData());
const grdPerformanceData = computed(() => grdPerformanceRef.value?.getData());
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
  startYm: '',
  prfmtYm: '',
  amtEstSalFee: 0,
  amtMutAidFee: 0,
  amtFeeSum: 0,
  amtEstOgFee: 0,
});

// 예상수수료 @todo 2차
const estimate = ref({
  prsnlFeeElhmPrpn: 0,
  prsnlFeeElhmExcpPrpn: 0,
  prsnlFeeSalIntv: 0,
  prsnlFeeMetg: 0,
  prsnlFeeStmnt: 0,
  prsnlFeeMutu: 0,
  prsnlFeeAgg: 0,
  orgnstnFeeElhmOgPrpn: 0,
  orgnstnFeeElhmOgExcpPrpn: 0,
  orgnstnFeeOgSellEncrg: 0,
  orgnstnFeeOgEjt1: 0,
  orgnstnFeeOgEjt2: 0,
  orgnstnFeeNbBrch: 0,
  orgnstnFeePrfmtFee: 0,
  orgnstnFeeAgg: 0,
  allSum: 0,
});

// 데이터 조회
async function fetchData() {
  const { data } = await dataService.get('/sms/wells/fee/estimate/p-og', { params: { ...cachedParams } });
  userDvCd.value = data.userDvCd;
  await nextTick();
  baseInfo.value = data.base;
  grdMtData.value.setRows([data.meeting]);
  grdPerformanceData.value.setRows(data.performances);
  grdSalesData.value.setRows(data.sales);

  // @todo 예상수수료 계산로직 정의후 아래항목도 변경되야됨
  estimate.value = data.estimate;
  estimate.value.allSum = reduce(data.estimate, (acc, n) => acc + n, 0);
}
// 조회버튼
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// 계산버튼 클릭
async function onClickCalculate() {
  notify('수수료 계산 API 개발후 진행[2차예정]');
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMt = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'plarSrtup', header: t('MSG_TXT_PLAR_SRTUP'), width: '112', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'plannerPrctc', header: t('MSG_TXT_PLANNER_PRCTC'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'metgPrscD', header: t('MSG_TXT_METG_PRSC_D'), width: '107', styleName: 'text-right', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  view.sortingOptions.enabled = false;
});

const initGrdPerformanceDtl = defineGrid((data, view) => {
  const columns = [
    {
      fieldName: 'type',
      header: t('MSG_TXT_DIV'),
      width: '220',
      styleName: 'text-left',
      displayCallback(grid, index, value) {
        const title = { A: t('MSG_TXT_INDV_PERF_PS'), B: t('MSG_TXT_INDV_PRJTD_PERF'), C: t('MSG_TXT_OG_PERF_PS'), D: t('MSG_TXT_OG_PRJTD_PERF') };
        return title[value];
      },
    },
    { fieldName: 'amtElhm', header: t('MSG_TXT_ELHM'), width: '220', styleName: 'text-right', dataType: 'number', editable: true },
    { fieldName: 'amtExceptElhm', header: t('MSG_TXT_EXCEPT_HOUSEHOLD_APPLIANCES'), width: '220', styleName: 'text-right', dataType: 'number', editable: true },
    { fieldName: 'amtMutu429', header: '429', width: '220', styleName: 'text-right', dataType: 'number', editable: true },
    { fieldName: 'amtMutu599', header: '599', width: '220', styleName: 'text-right', dataType: 'number', editable: true },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  view.editOptions.columnEditableFirst = true;
  view.sortingOptions.enabled = false;
  view.onCellEditable = (grid, index) => {
    if (['A', 'C'].includes(grid.getValue(index.itemIndex, 'type'))) {
      return false;
    }
  };
  view.setColumnLayout([
    'type',
    'amtElhm',
    'amtExceptElhm',
    {
      header: t('MSG_TXT_MUTU'),
      direction: 'horizontal',
      items: ['amtMutu429', 'amtMutu599'],
    },
  ]);
});

const initGrdSalesHist = defineGrid((data, view) => {
  const columns = [
    {
      fieldName: 'prtnrKnm',
      header: t('MSG_TXT_EMPL_NM'),
      width: '93',
      styleName: 'text-center',
      headerSummary: {
        styleName: 'text-center',
        text: t('MSG_TXT_SUM'),
      },
    },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NO'), width: '93', styleName: 'text-center' },
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_RCPDT'), width: '112', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_SL_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'cntrCanDtm', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '155', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_IZ'), width: '187', styleName: 'text-left' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '155', styleName: 'text-center' },
    { fieldName: 'mchnChTpCd', header: t('MSG_TXT_CHDVC_TP'), width: '91', styleName: 'text-right' },
    {
      fieldName: 'amtSumElhm',
      header: t('MSG_TXT_ELHM_ACKMT_PERF'),
      width: '118',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'amtSumChng',
      header: t('MSG_TXT_MCHN_CH_PERF'),
      width: '118',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'amtSumExceptElhm',
      header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'),
      width: '118',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setHeaderSummaries({
    visible: true,
    items: [
      { height: 40 },
    ],
  });
  view.layoutByColumn('prtnrKnm').summaryUserSpans = [{ colspan: 9 }];
});
</script>

<style scoped lang="scss">
.sum-head {
  background: antiquewhite;
}
</style>
