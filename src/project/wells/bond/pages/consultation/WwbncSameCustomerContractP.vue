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
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="5"
      @init="initMainGrid"
    />

    <kw-tabs
      v-model="selectedTab"
      class="px0"
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
          v-show="lental"
          class="mt20"
        />
        <kw-form
          v-show="lental"
          :cols="4"
          dense
          class="kw-form--small"
        >
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_OJ_AMT')">
              <p>
                {{ stringUtil.getNumberWithComma(deposit.ojAmt) }}
              </p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_CCAM')">
              <p>{{ stringUtil.getNumberWithComma(deposit.rsgBorAmt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_AMT')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dlqAmt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_SL_AGG')">
              <p>{{ stringUtil.getNumberWithComma(deposit.slAggAmt) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_OJ_DP')">
              <p>
                {{ stringUtil.getNumberWithComma(deposit.ojDt) }}
              </p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_LSFE')">
              <p>{{ stringUtil.getNumberWithComma(deposit.lsfe) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_DP')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dlqDpAmt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DP_AGG')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dpAgg) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_OJ_BLAM')">
              <p>
                {{ stringUtil.getNumberWithComma(deposit.ojBlam) }}
              </p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_MCNT')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dlqMcn) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_BLAM')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dlqBlam) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DSC_AGG')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dscAgg) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_UC_AMT')">
              <p>
                {{ stringUtil.getNumberWithComma(deposit.ucAmt) }}
              </p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_MM_CHRAM_AMT')">
              <p>{{ stringUtil.getNumberWithComma(deposit.thmChramAmt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_ADD_AMT')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dlqAddAmt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_CTR_AGG')">
              <p>{{ stringUtil.getNumberWithComma(deposit.ctrAgg) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_UC_DP')">
              <p>
                {{ stringUtil.getNumberWithComma(deposit.ucDp) }}
              </p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_MM_CHRAM_DP')">
              <p>{{ stringUtil.getNumberWithComma(deposit.thmChramDpAmt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_ADD_DP')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dlqAddDpAmt) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_UC_BLAM')">
              <p>
                {{ stringUtil.getNumberWithComma(deposit.ucBlam) }}
              </p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_MM_CHRAM_BLAM')">
              <p>{{ stringUtil.getNumberWithComma(deposit.chramBlam) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_ADD_BLAM')">
              <p>{{ stringUtil.getNumberWithComma(deposit.addBlam) }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
        <kw-action-top
          v-show="lental"
          class="mt20"
        />
        <kw-grid
          v-show="lental"
          ref="grdLentalRef"
          name="grdLental"
          :visible-rows="5"
          @init="initLentalGrid"
        />
        <kw-action-top
          v-show="membership"
          class="mt20"
        />
        <kw-form
          v-show="membership"
          :cols="4"
          dense
          class="kw-form--small"
        >
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_OJ_AMT')">
              <p>{{ stringUtil.getNumberWithComma(deposit.ojAmt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_CCAM')">
              <p>{{ stringUtil.getNumberWithComma(deposit.rsgBorAmt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_AMT')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dlqAmt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_SL_AGG')">
              <p>{{ stringUtil.getNumberWithComma(deposit.slAggAmt) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_OJ_DP')">
              <p>{{ stringUtil.getNumberWithComma(deposit.ojDt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_LSFE')">
              <p>{{ stringUtil.getNumberWithComma(deposit.lsfe) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_DP')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dlqDpAmt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DP_AGG')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dpAgg) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_OJ_BLAM')">
              <p>{{ stringUtil.getNumberWithComma(deposit.ojBlam) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_MCNT')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dlqMcn) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_BLAM')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dlqBlam) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DSC_AGG')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dscAgg) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_UC_AMT')">
              <p>
                {{ stringUtil.getNumberWithComma(deposit.ucAmt) }}
              </p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_MM_CHRAM_AMT')">
              <p>{{ stringUtil.getNumberWithComma(deposit.thmChramAmt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_ADD_AMT')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dlqAddAmt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_CTR_AGG')">
              <p>{{ stringUtil.getNumberWithComma(deposit.ctrAgg) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_UC_DP')">
              <p>
                {{ stringUtil.getNumberWithComma(deposit.ucDp) }}
              </p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_MM_CHRAM_DP')">
              <p>{{ stringUtil.getNumberWithComma(deposit.thmChramDpAmt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_ADD_DP')">
              <p>{{ stringUtil.getNumberWithComma(deposit.dlqAddDpAmt) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_UC_BLAM')">
              <p>
                {{ stringUtil.getNumberWithComma(deposit.ucBlam) }}
              </p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_MM_CHRAM_BLAM')">
              <p>{{ stringUtil.getNumberWithComma(deposit.chramBlam) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DLQ_ADD_BLAM')">
              <p>{{ stringUtil.getNumberWithComma(deposit.addBlam) }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
        <kw-action-top
          v-show="membership"
          class="mt20"
        />
        <kw-grid
          v-show="membership"
          ref="grdMembershipRef"
          name="grdMembership"
          :visible-rows="5"
          @init="initMembershipGrid"
        />
      </kw-tab-panel>
      <kw-tab-panel name="sales" />
      <kw-tab-panel name="depositDetail" />
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
import { useDataService, getComponentType, defineGrid, stringUtil, codeUtil } from 'kw-lib';
import WwbncSameCustomerContractPBreachOfPromise from './WwbncSameCustomerContractPBreachOfPromise.vue';

const dataService = useDataService();
const { t } = useI18n();
const selectedTab = ref('deposit');
const selectedGridRow = ref(null);
const membership = ref();
const lental = ref();

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
);

// TODO: 전달파라미터 수정 필요, 하드코딩 제거 대상
const props = defineProps({
  cstNo: {
    type: String,
    default: () => '12345670',
  },
  safeKey: {
    type: String,
    default: () => '111111111111111',
  },
  clctamPrtnrNo: {
    type: String,
    default: () => '202222457060',
  },
  bndCntrRefId: {
    type: String,
    default: () => '1',
  },
  sellTpCd: {
    type: String,
    default: () => '2',
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdLentalRef = ref(getComponentType('KwGrid'));
const grdMembershipRef = ref(getComponentType('KwGrid'));

watch(selectedGridRow, (newValue) => {
  if (!newValue) {
    const view = grdMainRef.value.getView();
    view.clearCurrent();
  }
});

watch(() => selectedTab.value, () => {
  grdLentalRef.value.getView().refresh();
  grdMembershipRef.value.getView().refresh();
});

const deposit = ref({
  ojAmt: '',
  rsgBorAmt: '',
  dlqAmt: '',
  slAggAmt: '',
  ojDt: '',
  lsfe: '',
  dlqDpAmt: '',
  dpAgg: '',
  ojBlam: '',
  dlqMcn: '',
  dlqBlam: '',
  dscAgg: '',
  ucAmt: '',
  thmChramAmt: '',
  dlqAddAmt: '',
  ctrAgg: '',
  ucDp: '',
  thmChramDpAmt: '',
  dlqAddDpAmt: '',
  ucBlam: '',
  chramBlam: '',
  addBlam: '',
});

function setSellTpCd(sellTpCd) {
  if (sellTpCd === codes.SELL_TP_CD[1].codeId) {
    lental.value = true;
    membership.value = false;
  } else {
    lental.value = false;
    membership.value = true;
  }
}

async function fetchDeposits() {
  const { bndCntrRefId, sellTpCd } = selectedGridRow.value;
  const res = await dataService.get(`/sms/wells/bond/same-customer-contracts/${bndCntrRefId}/deposits`);
  const deposits = res.data;
  let view;
  // TODO: 판매유형코드에 따라 수정 필요
  if (sellTpCd === codes.SELL_TP_CD[1].codeId) {
    view = grdLentalRef.value.getView();
  } else {
    view = grdMembershipRef.value.getView();
  }

  view.getDataSource().setRows(deposits);
  view.resetCurrent();
}

async function fetchDeposit() {
  const { bndCntrRefId } = selectedGridRow.value;
  const res = await dataService.get(`/sms/wells/bond/same-customer-contracts/${bndCntrRefId}/deposit`);
  deposit.value = res.data;

  await fetchDeposits();
}

async function fetchData() {
  setSellTpCd(props.sellTpCd);
  selectedGridRow.value = props;

  const res = await dataService.get(`/sms/wells/bond/same-customer-contracts/${props.cstNo}-${props.safeKey}-${props.clctamPrtnrNo}`);
  const sameCustomers = res.data;
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(sameCustomers);
  view.resetCurrent();

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
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FNT'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellTpCd', header: t('TXT_MSG_SELL_TP_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-left' },
    { fieldName: 'prdGrp', header: t('MSG_TXT_PRD_GRP'), width: '100', styleName: 'text-left' },
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '130', styleName: 'text-left' },
    { fieldName: 'bndCntrRefId', header: t('MSG_TXT_CNTR_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrRsgDt', header: t('MSG_TXT_AUTH_RSG_DT'), width: '152', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'ojAmt', header: t('MSG_TXT_OJ_AMT'), width: '155', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
    { fieldName: 'ojDt', header: t('MSG_TXT_OJ_DP'), width: '155', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
    { fieldName: 'ojBlam', header: t('MSG_TXT_OJ_BLAM'), width: '155', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.header.minRowHeight = 30;
  view.displayOptions.minTableRowHeight = 34;

  view.onCellDblClicked = async (g, clickData) => {
    const clickDatas = g.getValues(clickData.itemIndex);
    setSellTpCd(clickDatas.sellTpCd);
    selectedGridRow.value = null;
    selectedGridRow.value = clickDatas;
    selectedGridRow.value.checkSelectRow = 'Y';

    await fetchDeposit();
  };
});

const initLentalGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_MM'), width: '240', styleName: 'text-center' },
    { fieldName: 'nmn', header: t('MSG_TXT_NMN'), width: '240', styleName: 'text-center' },
    { fieldName: 'slAmt', header: t('MSG_TXT_SL_AMT'), width: '240', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
    { fieldName: 'dpAmt', header: t('MSG_TXT_DP_AMT'), width: '240', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
    { fieldName: 'bznsAtamBlam', header: t('MSG_TXT_BZNS_PRPD_AMT'), width: '240', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '242', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
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
    { fieldName: 'nmn', header: t('MSG_TXT_NMN'), width: '144', styleName: 'text-center' },
    { fieldName: 'slAmt', header: t('MSG_TXT_SL_AMT'), width: '144', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
    { fieldName: 'dpAmt', header: t('MSG_TXT_DP_AMT'), width: '144', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
    { fieldName: 'bznsAtamBlam', header: t('MSG_TXT_BZNS_PRPD_AMT'), width: '144', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '144', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
    { fieldName: 'dlqMcnt', header: t('MSG_TXT_DLQ_MCNT'), width: '144', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0.##' },
    { fieldName: 'dlqAdamt', header: t('MSG_BTN_DLQ_ADAMT'), width: '144', styleName: 'text-right' },
    { fieldName: 'dlqAddDp', header: t('MSG_TXT_DLQ_ADD_DP'), width: '144', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
    { fieldName: 'dlqAddBlam', header: t('MSG_TXT_DLQ_ADD_BLAM'), width: '144', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
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
