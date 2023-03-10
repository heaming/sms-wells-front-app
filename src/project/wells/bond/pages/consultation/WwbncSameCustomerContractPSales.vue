<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncSameCustomerContractPSales - 동일고객 계약내역 매출정보 조회
3. 작성자 : sunghun.choi
4. 작성일 : 2023.03.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 동일고객 계약번호에 대한 매출정보 조회
****************************************************************************************************
--->
<template>
  <kw-action-top class="mt20" />
  <kw-form
    :cols="4"
    dense
    class="kw-form--small"
  >
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_REG_FEE')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.regFee) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_RTLFE1_MM_CHRAM')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.rtlfe1MmChram) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_RTLFE_DUTY_PTRM')"
      >
        <p>
          {{ sales.rtlfeDutyPtrm }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_REQD_RQDT')"
      >
        <p>
          {{ sales.reqdRqdt }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_RGST_COST_DSC')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.rgstCostDsc) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_RTLFE1_DSC')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.rtlfe1Dsc) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_PD_DC_CLASS')"
      >
        <p>
          {{ sales.pdDcClass }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_CANC_DT')"
      >
        <p>
          {{ sales.cancDt }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_RNTL_TOTAL')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.rntlTotal) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_RTLFE1_MCNT')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.rtlfe1Mcnt) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_DISC_CODE')"
      >
        <p>
          {{ sales.discCode }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_LEASE_DV')"
      >
        <p>
          {{ sales.leaseDv }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_RTLFE2_MM_CHRAM')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.rtlfe2MmChram) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_MNGT_PRD_MCNT')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.mngtPrdMcnt) }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_1PLUS1_LK_CNTR')"
      >
        <p>
          {{ sales.onePlusOneLkCntr }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_RTLFE2_DSC')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.rtlfe2Dsc) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_PAR_CNTR')"
      >
        <p>
          {{ sales.parCntr }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_ALNC_LK_CNTR')"
      >
        <p>
          {{ sales.alncLkCntr }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_RTLFE2_MCNT')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.rtlfe2Mcnt) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_SL_DT')"
      >
        <p>
          {{ sales.slDt }}
        </p>
      </kw-form-item>
    </kw-form-row>
  </kw-form>
  <kw-separator />
  <kw-action-top />
  <kw-form
    :cols="4"
    dense
    class="kw-form--small"
  >
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_MM_SSPCS')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.mmSspcs) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_DISC_CODE')"
      >
        <p>
          {{ sales.discCode }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_WDWAL_DT')"
      >
        <p>
          {{ sales.wdwalDt }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_VST_PRD')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.vstPrd) }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_STPL_MCNT')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.stplMcnt) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_DSC_AMT')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.dscAmt) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_VST_DT')"
      >
        <p>
          {{ sales.vstDt }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_MNGT_PRD')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.mngtPrd) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_J_DT')"
      >
        <p>
          {{ sales.jDt }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_VST_NMN')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.vstNmn) }}
        </p>
      </kw-form-item>
    </kw-form-row>
  </kw-form>

  <kw-separator />
  <kw-action-top />
  <kw-form
    :cols="4"
    dense
    class="kw-form--small"
  >
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_FRISU_MSH')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.frisuMsh) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_SALE_PRICE')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.salePrice) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_TK_AMT')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.tkAmt) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_ISTM_MCNT')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.istmMcnt) }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_FRISU_AS')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.frisuAs) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_CNTRCT_AMT')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.cntrctAmt) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_ISTM_AMT')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.istmAmt) }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_RECAP_MSH')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.recapMsh) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_SBSCM')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.sbscm) }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_MM_INTAM')"
      >
        <p>
          {{ stringUtil.getNumberWithComma(sales.mmIntam) }}
        </p>
      </kw-form-item>
    </kw-form-row>
  </kw-form>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil, codeUtil } from 'kw-lib';

const dataService = useDataService();
const hsmtrl = ref();
const cocn = ref();

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
);

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

const sales = ref({
  regFee: '',
  rtlfe1MmChram: '',
  rtlfeDutyPtrm: '',
  reqdRqdt: '',
  rgstCostDsc: '',
  rtlfe1Dsc: '',
  pdDcClass: '',
  cancDt: '',
  rntlTotal: '',
  rtlfe1Mcnt: '',
  discCode: '',
  leaseDv: '',
  rtlfe2MmChram: '',
  mngtPrdMcnt: '',
  onePlusOneLkCntr: '',
  rtlfe2Dsc: '',
  parCntr: '',
  alncLkCntr: '',
  rtlfe2Mcnt: '',
  slDt: '',
  mmSspcs: '',
  discCode2: '',
  wdwalDt: '',
  vstPrd: '',
  stplMcnt: '',
  dscAmt: '',
  vstDt: '',
  mngtPrd: '',
  jDt: '',
  vstNmn: '',
  frisuMsh: '',
  salePrice: '',
  tkAmt: '',
  istmMcnt: '',
  frisuAs: '',
  cntrctAmt: '',
  istmAmt: '',
  recapMsh: '',
  sbscm: '',
  mmIntam: '',
});

function setSellTpCd(sellTpCd) {
  if (sellTpCd === codes.SELL_TP_CD[0].codeId) {
    hsmtrl.value = false;
    cocn.value = true;
  } else {
    hsmtrl.value = true;
    cocn.value = false;
  }
}

async function fetchData() {
  const res = await dataService.get(`/sms/wells/bond/same-customer-contracts/${paramData.value.sellTpCd}/sales`);
  sales.value = res.data;
}

watch(() => props.selectedGridRow, async (obj) => {
  if (obj) {
    setSellTpCd(obj.sellTpCd);
    paramData.value = obj;
    await fetchData();
  }
});

</script>
