<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncSameCustomerContractPBreachOfPromise - 웰스 렌탈 위약정보 탭- W-BN-U-0033P10
3. 작성자 : songmi.in
4. 작성일 : 2023.03.08 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 동일고객 계약번호에 대한 렌탈 위약정보 조회
****************************************************************************************************
--->
<template>
  <kw-action-top class="mt10" />
  <kw-form
    dense
    class="kw-form--small"
  >
    <kw-form-row>
      <kw-form-item :label="$t('MSG_TXT_CCAM_TOT_AMT')">
        <p>{{ stringUtil.getNumberWithComma(breachOfPromise.ccamTam) }}</p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_ACU_DP')">
        <p>{{ stringUtil.getNumberWithComma(breachOfPromise.acuDp) }}</p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_RNTF_AMT')">
        <p>{{ stringUtil.getNumberWithComma(breachOfPromise.rentalRntf) }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item :label="$t('MSG_TXT_BOR_DP')">
        <p>{{ stringUtil.getNumberWithComma(breachOfPromise.borDp) }}</p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_BND_NPD')">
        <p>{{ stringUtil.getNumberWithComma(breachOfPromise.bndNpd) }}</p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_CSMB_CS')">
        <p>{{ stringUtil.getNumberWithComma(breachOfPromise.csmbCs) }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item :label="$t('MSG_TXT_BOR_BLAM')">
        <p>{{ stringUtil.getNumberWithComma(breachOfPromise.borBlam) }}</p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_RGST_COST_DSC')">
        <p>{{ stringUtil.getNumberWithComma(breachOfPromise.rgstCsDsc) }}</p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_REQD_CS')">
        <p>{{ stringUtil.getNumberWithComma(breachOfPromise.reqdCs) }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item :label="$t('MSG_TXT_SL_OC')">
        <p>{{ stringUtil.getNumberWithComma(breachOfPromise.slAmt) }}</p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_UCAM')">
        <p>{{ stringUtil.getNumberWithComma(breachOfPromise.ucAmt) }}</p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_LSFE')">
        <p>{{ stringUtil.getNumberWithComma(breachOfPromise.lsfe) }}</p>
      </kw-form-item>
    </kw-form-row>
  </kw-form>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil } from 'kw-lib';

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
const paramData = ref({
  sellTpNm: '',
  sellTpCd: '',
  pdNm: '',
  bndCntrRefId: '',
  bndCntrRefSn: '',
  cstKnm: '',
  memberNm: '',
  prtnrKnm: '',
  mmIstmAmt: '',
  disAmt: '',
  purMmIntamAmt: '',
  dlqBlam: '',
  thmBlam: '',
  mpyBsdt: '',
  dlqMcn: '',
});

const breachOfPromise = ref({
  ccamTam: '',
  acuDp: '',
  rentalRntf: '',
  borDp: '',
  bndNpd: '',
  csmbCs: '',
  borBlam: '',
  rgstCsDsc: '',
  reqdCs: '',
  slAmt: '',
  ucAmt: '',
  lsfe: '',
});

async function fetchData() {
  const res = await dataService.get(`/sms/wells/bond/same-customer-contracts/${paramData.value.bndCntrRefId}/breach-of-promise`);
  breachOfPromise.value = res.data;
}

watch(() => props.selectedGridRow, async (obj) => {
  if (obj) {
    paramData.value = obj;
    await fetchData();
  }
});
</script>
