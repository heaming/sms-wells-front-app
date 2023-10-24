<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncSameCustomerContractPDeposit - 웰스 입금내역 탭- W-BN-U-0033P09
3. 작성자 : songmi.in
4. 작성일 : 2023.05.11 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 동일고객 계약번호에 대한 입금내역 조회
****************************************************************************************************
--->
<template>
  <kw-action-top class="mt20">
    <template #left>
      <kw-paging-info :total-count="totalCount" />
    </template>
  </kw-action-top>
  <kw-grid
    v-show="isSell"
    ref="grdSellRef"
    name="grdSell"
    :visible-rows="5"
    @init="initGrid"
  />
  <kw-grid
    v-show="isSingle"
    ref="grdSingleRef"
    name="grdSingle"
    :visible-rows="5"
    @init="initSingleGrid"
  />
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, defineGrid, getComponentType } from 'kw-lib';

const { t } = useI18n();
const dataService = useDataService();

const props = defineProps({
  selectedGridRow: {
    type: Object,
    default: null,
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdSellRef = ref(getComponentType('KwGrid'));
const grdSingleRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const isSell = ref(false);
const isSingle = ref(false);
const paramData = ref({});

function setBndBizDvCd(bndBizDvCd) {
  if (bndBizDvCd === 'L10') {
    isSingle.value = true;
    isSell.value = false;
  } else {
    isSingle.value = false;
    isSell.value = true;
  }
}

function refresh() {
  grdSingleRef.value.getView().refresh();
  grdSellRef.value.getView().refresh();
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/bond/same-customer-contracts/deposit-details', { params: paramData.value });
  const deposits = res.data;
  const view = paramData.value.bndBizDvCd === 'L10' ? grdSingleRef.value.getView() : grdSellRef.value.getView();
  totalCount.value = deposits.length;
  view.getDataSource().setRows(deposits);
}

watch(() => props.selectedGridRow, async (obj) => {
  if (obj) {
    paramData.value = obj;
    setBndBizDvCd(paramData.value.bndBizDvCd);

    await fetchData();
  }
});

defineExpose({
  refresh,
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'rveNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '65', styleName: 'text-center' }, // 번호
    { fieldName: 'rveDt', header: t('MSG_TXT_RVE_DT'), width: '171', styleName: 'text-center', datetimeFormat: 'date' }, // 수납일자
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), width: '171', styleName: 'text-center', datetimeFormat: 'date' }, // 실적일자
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TASK_DIV'), width: '171', styleName: 'text-center' }, // 업무구분
    { fieldName: 'rveNm', header: t('MSG_TXT_RVE_NM'), width: '171', styleName: 'text-center' }, // 수납명
    { fieldName: 'dpDvNm', header: t('MSG_TXT_DP_DV'), width: '171', styleName: 'text-center' }, // 입금구분
    { fieldName: 'dpTpNm', header: t('MSG_TXT_DP_TP'), width: '171', styleName: 'text-center' }, // 입금유형
    { fieldName: 'rveAmt', header: t('MSG_TXT_PROCS_AMT_WON'), width: '182', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 처리금액(원)
    { fieldName: 'dpMesNm', header: t('MSG_TXT_CARD_DV'), width: '171', styleName: 'text-center' }, // 카드구분
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.header.minRowHeight = 30;
  view.displayOptions.minTableRowHeight = 34;
});

const initSingleGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TASK_DIV'), width: '200', styleName: 'text-center' }, // 업무구분
    { fieldName: 'rveDt', header: t('MSG_TXT_RVE_DT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 수납일자
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 실적일자
    { fieldName: 'dpDvNm', header: t('MSG_TXT_DP_DV'), width: '200', styleName: 'text-center' }, // 입금구분
    { fieldName: 'rveDvNm', header: t('MSG_TXT_DP_KND'), width: '200', styleName: 'text-center' }, // 입금종류
    { fieldName: 'dpTpNm', header: t('MSG_TXT_DP_TP'), width: '200', styleName: 'text-center' }, // 입금유형
    { fieldName: 'rveAmt', header: t('MSG_TXT_PROCS_AMT_WON'), width: '242', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 처리금액(원)
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
