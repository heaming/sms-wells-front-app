<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncSameCustomerContractP - 동일고객 계약내역 상세 - W-BN-U-0033P06
3. 작성자 : songmi.in
4. 작성일 : 2023.02.15 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 동일고객 계약내역 조회 및 입금상세정보 조회
****************************************************************************************************
--->
<template>
  <kw-popup
    size="3xl"
    class="kw-popup--window-consult--style"
    no-action
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalMainCount"
        />
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="5"
      @init="initMainGrid"
    />

    <kw-tabs
      v-model="selectedTab"
      class="px0 pt16"
    >
      <kw-tab
        name="deposit"
        :label="$t('MSG_TXT_DP_INF')"
      />
      <kw-tab
        name="sales"
        :label="$t('MSG_TXT_SL_INF')"
      />
      <kw-tab
        name="depositDetail"
        :label="$t('MSG_TXT_DP_IZ')"
      />
      <kw-tab
        name="breachOfPromise"
        :label="$t('MSG_TXT_BOR_INF')"
      />
    </kw-tabs>
    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="deposit">
        <kw-action-top
          class="mt20"
        >
          <template #left>
            <kw-paging-info
              :total-count="totalCount"
            />
          </template>
          <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </kw-action-top>
        <kw-grid
          v-show="lental"
          ref="grdLentalRef"
          name="grdLental"
          :visible-rows="5"
          @init="initLentalGrid"
        />
        <kw-grid
          v-show="membership"
          ref="grdMembershipRef"
          name="grdMembership"
          :visible-rows="5"
          @init="initMembershipGrid"
        />
        <kw-action-top
          class="mt20"
        >
          <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </kw-action-top>
        <kw-form
          :cols="4"
          dense
          class="kw-form--small"
        >
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_OJ_AMT')">
              <p>{{ deposit.ojAmt }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_CCAM')">
              <p>{{ deposit.rsgBorAmt }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_AMT')">
              <p>{{ deposit.dlqAmt }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_SL_AGG')">
              <p>{{ deposit.slAggAmt }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_OJ_DP')">
              <p>{{ deposit.ojDpAmt }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_LSFE')">
              <p>{{ deposit.lsRntf }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_DP')">
              <p>{{ deposit.dlqDpAmt }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DP_AGG')">
              <p>{{ deposit.dpAggAmt }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_OJ_BLAM')">
              <p>{{ deposit.ojBlam }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_MCNT')">
              <p>{{ deposit.dlqMcn }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_BLAM')">
              <p>{{ deposit.dlqBlam }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DSC_AGG')">
              <p>{{ deposit.dscAggAmt }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_UC_AMT')">
              <p> {{ deposit.ucAmt }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_MM_CHRAM_AMT')">
              <p>{{ deposit.thmChramAmt }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_ADD_AMT')">
              <p>{{ deposit.dlqAddAmt }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_CTR_AGG')">
              <p>{{ deposit.ctrAggAmt }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_UC_DP')">
              <p>  {{ deposit.ucDpAmt }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_MM_CHRAM_DP')">
              <p>{{ deposit.mmChramDpAmt }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_ADD_DP')">
              <p>{{ deposit.dlqAddDpAmt }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_UC_BLAM')">
              <p> {{ deposit.ucBlam }}              </p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_MM_CHRAM_BLAM')">
              <p>{{ deposit.mmChramBlam }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_ADD_BLAM')">
              <p>{{ deposit.dlqAddBlam }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </kw-tab-panel>
      <kw-tab-panel name="sales">
        <wwbnc-same-customer-contract-p-sales
          v-model:selected-grid-row="selectedGridRow"
        />
      </kw-tab-panel>
      <kw-tab-panel name="depositDetail">
        <wwbnc-same-customer-contract-p-deposit
          ref="depositRef"
          v-model:selected-grid-row="selectedGridRow"
        />
      </kw-tab-panel>
      <kw-tab-panel name="breachOfPromise">
        <wwbnc-same-customer-contract-p-breach-of-promise
          v-model:selected-grid-row="selectedGridRow"
        />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, defineGrid, stringUtil } from 'kw-lib';
import WwbncSameCustomerContractPBreachOfPromise from './WwbncSameCustomerContractPBreachOfPromise.vue';
import WwbncSameCustomerContractPSales from './WwbncSameCustomerContractPSales.vue';
import WwbncSameCustomerContractPDeposit from './WwbncSameCustomerContractPDeposit.vue';

const dataService = useDataService();
const { t } = useI18n();

const props = defineProps({
  cstNo: {
    type: String,
    default: () => '',
  },
  cntrNo: {
    type: String,
    default: () => '',
  },
  cntrSn: {
    type: String,
    default: () => '',
  },
  bndBizDvCd: {
    type: String,
    default: () => '',
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdLentalRef = ref(getComponentType('KwGrid'));
const grdMembershipRef = ref(getComponentType('KwGrid'));

const selectedTab = ref('deposit');
const selectedGridRow = ref(null);
const membership = ref(false);
const lental = ref(false);
const totalMainCount = ref(0);
const totalCount = ref(0);
const depositRef = ref();
const deposit = ref({});

watch(selectedGridRow, (newValue) => {
  if (!newValue) {
    const view = grdMainRef.value.getView();
    view.clearCurrent();
  }
});

watch(() => selectedTab.value, () => {
  grdLentalRef.value.getView().refresh();
  grdMembershipRef.value.getView().refresh();
  depositRef.value.refresh();
});

let grdView;
function setBndBizDvCd(bndBizDvCd) {
  if (['L30', 'L31', 'L32'].includes(bndBizDvCd)) {
    lental.value = false;
    membership.value = true;
    grdView = grdMembershipRef.value.getView();
  } else {
    lental.value = true;
    membership.value = false;
    grdView = grdLentalRef.value.getView();
  }
}

// 동일고객 계약 입금정보 조회
async function fetchDeposits() {
  const res = await dataService.get('/sms/wells/bond/same-customer-contracts/deposits', { params: selectedGridRow.value });
  const deposits = res.data;
  totalCount.value = deposits.length;
  grdView.getDataSource().setRows(deposits);
}

// 동일고객 계약 입금정보 상세조회
async function fetchDeposit() {
  const res = await dataService.get('/sms/wells/bond/same-customer-contracts/deposit', { params: selectedGridRow.value });
  deposit.value = res.data;

  deposit.value.ojAmt = stringUtil.getNumberWithComma(deposit.value.ojAmt);
  deposit.value.rsgBorAmt = stringUtil.getNumberWithComma(deposit.value.rsgBorAmt);
  deposit.value.dlqAmt = stringUtil.getNumberWithComma(deposit.value.dlqAmt);
  deposit.value.slAggAmt = stringUtil.getNumberWithComma(deposit.value.slAggAmt);
  deposit.value.ojDpAmt = stringUtil.getNumberWithComma(deposit.value.ojDpAmt);
  deposit.value.lsRntf = stringUtil.getNumberWithComma(deposit.value.lsRntf);
  deposit.value.dlqDpAmt = stringUtil.getNumberWithComma(deposit.value.dlqDpAmt);
  deposit.value.dpAggAmt = stringUtil.getNumberWithComma(deposit.value.dpAggAmt);
  deposit.value.ojBlam = stringUtil.getNumberWithComma(deposit.value.ojBlam);
  deposit.value.dlqBlam = stringUtil.getNumberWithComma(deposit.value.dlqBlam);
  deposit.value.dscAggAmt = stringUtil.getNumberWithComma(deposit.value.dscAggAmt);
  deposit.value.ucAmt = stringUtil.getNumberWithComma(deposit.value.ucAmt);
  deposit.value.thmChramAmt = stringUtil.getNumberWithComma(deposit.value.thmChramAmt);
  deposit.value.dlqAddAmt = stringUtil.getNumberWithComma(deposit.value.dlqAddAmt);
  deposit.value.ctrAggAmt = stringUtil.getNumberWithComma(deposit.value.ctrAggAmt);
  deposit.value.ucDpAmt = stringUtil.getNumberWithComma(deposit.value.ucDpAmt);
  deposit.value.mmChramDpAmt = stringUtil.getNumberWithComma(deposit.value.mmChramDpAmt);
  deposit.value.dlqAddDpAmt = stringUtil.getNumberWithComma(deposit.value.dlqAddDpAmt);
  deposit.value.ucBlam = stringUtil.getNumberWithComma(deposit.value.ucBlam);
  deposit.value.mmChramBlam = stringUtil.getNumberWithComma(deposit.value.mmChramBlam);
  deposit.value.dlqAddBlam = stringUtil.getNumberWithComma(deposit.value.dlqAddBlam);

  await fetchDeposits();
}

// 동일고객 계약내역 조회
async function fetchData() {
  setBndBizDvCd(props.bndBizDvCd);
  selectedGridRow.value = props;

  const res = await dataService.get('/sms/wells/bond/same-customer-contracts', { params: selectedGridRow.value });
  const sameCustomers = res.data;
  totalMainCount.value = sameCustomers.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(sameCustomers);

  const startFieldIndex = ['cntrDtlNo'].indexOf(view.getCurrent().fieldName) + 1;
  const options = {
    fields: ['cntrDtlNo'],
    value: `${selectedGridRow.value.cntrNo}-${selectedGridRow.value.cntrSn}`,
    startIndex: view.getCurrent().itemIndex,
    startFieldIndex,
    wrap: true,
    caseSensitive: false,
    partialMatch: true,
  };
  const index = view.searchCell(options);
  view.setCurrent(index);

  await fetchDeposit();
}

onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initMainGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FNT'), width: '100', styleName: 'text-center', headerSummaries: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } }, // 이체
    { fieldName: 'bndBizDvCd', header: t('TXT_MSG_SELL_TP_CD'), width: '100', styleName: 'text-left', visible: false }, // 판매유형
    { fieldName: 'bndBizDvNm', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' }, // 업무구분
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRD_GRP'), width: '100', styleName: 'text-center' }, // 제품군
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '130', styleName: 'text-left' }, // 제품명
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), styleName: 'text-center', width: '200' }, // 계약상세번호
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '150', styleName: 'text-center', visible: false }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '50', styleName: 'text-center', visible: false }, // 계약일련번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '100', styleName: 'text-center' }, // 연체개월
    { fieldName: 'authRsgCnfmdt', header: t('MSG_TXT_AUTH_RSG_DT'), width: '152', styleName: 'text-center', datetimeFormat: 'date' }, // 직권해지일자
    { fieldName: 'ojAmt', header: t('MSG_TXT_OJ_AMT'), width: '155', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 대상금액
    { fieldName: 'ojDpAmt', header: t('MSG_TXT_OJ_DP'), width: '155', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 대상입금
    { fieldName: 'ojBlam', header: t('MSG_TXT_OJ_BLAM'), width: '155', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 대상잔액
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.header.minRowHeight = 30;
  view.displayOptions.minTableRowHeight = 34;

  view.onCellDblClicked = async (g, clickData) => {
    if (clickData.cellType === 'data') {
      const clickDatas = g.getValues(clickData.itemIndex);
      setBndBizDvCd(clickDatas.bndBizDvCd);
      selectedGridRow.value = null;
      selectedGridRow.value = clickDatas;
      selectedGridRow.value.checkSelectRow = 'Y';

      await fetchDeposit();
    }
  };

  view.setHeaderSummaries({
    visible: true,
    items: [
      { height: 42 },
    ],
  });
  view.layoutByColumn('mpyBsdt').summaryUserSpans = [{ colspan: 8 }];
});

const initLentalGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'perfYm', header: t('MSG_TXT_PERF_MM'), width: '160', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 실적월
    { fieldName: 'rentalTn', header: t('MSG_TXT_NMN'), width: '130', styleName: 'text-center' }, // 차월
    { fieldName: 'thmSlSumAmt', header: t('MSG_TXT_SL_AMT'), width: '240', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 매출금액
    { fieldName: 'dpAmt', header: t('MSG_TXT_DP_AMT'), width: '240', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 입금금액
    { fieldName: 'atamCvAmt', header: t('MSG_TXT_BZNS_PRPD_AMT'), width: '240', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 영업선수금액
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '242', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 연체금액
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.header.minRowHeight = 30;
  view.displayOptions.minTableRowHeight = 34;
});

const initMembershipGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'rentalTn', header: t('MSG_TXT_NMN'), width: '110', styleName: 'text-center' }, // 차월
    { fieldName: 'thmSlSumAmt', header: t('MSG_TXT_SL_AMT'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 매출금액
    { fieldName: 'dpAmt', header: t('MSG_TXT_DP_AMT'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 입금금액
    { fieldName: 'atamCvAmt', header: t('MSG_TXT_BZNS_PRPD_AMT'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 영업선수금액
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 연체금액
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '130', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0' }, // 연체개월
    { fieldName: 'dlqAddAmt', header: t('MSG_BTN_DLQ_ADAMT'), width: '130', styleName: 'text-right' }, // 연체가산금
    { fieldName: 'dlqAddDpAmt', header: t('MSG_TXT_DLQ_ADD_DP'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 연체가산입금
    { fieldName: 'dlqAddBlam', header: t('MSG_TXT_DLQ_ADD_BLAM'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 연체가산잔액
    { fieldName: 'ucAmt', header: t('MSG_TXT_UCAM'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 미수금
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.header.minRowHeight = 30;
  view.displayOptions.minTableRowHeight = 34;
});
</script>
