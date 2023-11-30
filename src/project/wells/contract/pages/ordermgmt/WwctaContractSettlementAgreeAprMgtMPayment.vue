<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : fragment
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-06-12
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 결제하기
- 0201:개별수납(신용카드) 0202 및 포인트 결제 의 결제 관계가 있는 경우, 일시불 결제 정보 입력 화면 노출 및 승인 요청
- 0102:계좌자동이체 의 결제 관계가 있는 경우, 계좌자동이체 정보 입력 화면 노출 및 승인 요청?
- 0203:카드자동이체 의 결제 관계가 있는 경우, 카드자동이체 정보 입력 화면 노출 및 승인 요청?
- 0101:개별수납(가상계좌) 의 결제 관계가 있는 경우, 가상계좌 생성 발급 화면 노출
- 일시불 결제 정보 입력 화면
- 일시불결제금액을 결재 방식 별로 게시, 포인트, 캐시 등 포함
- 실제 결제해야 하는 금액(0201, 0202)가 있는 경우 신용카드 정보를 받는다.
****************************************************************************************************
--->
<template>
  <single-payment-approval
    ref="spayRef"
    :cntr-cst-info="contractor"
    :crdcd-stlms="crdcdStlms"
    :mileage-stlms="mileageStlms"
    @approved="onApprovedSpayStlms"
    @approve-canceled="onApproveCanceledSpayStlms"
  />
  <card-automatic-transfer-approval
    ref="cardAftnRef"
    :cntr-cst-info="contractor"
    :stlm="crdCdAftnStlm"
    @approved="onApprovedCrdCdAftnStlms"
  />
  <account-automatic-transfer-approval
    ref="acAftnRef"
    :cntr-cst-info="contractor"
    :stlm="acAftnStlm"
    @approved="onApprovedAcAftnStlms"
  />
  <virtual-account-issue
    ref="vacIssueRef"
    :stlm="vacStlm"
    @approved="onIssuedVirtualAccount"
  />
  <cash-sales-receipt
    v-if="cashSalesReceiptInfo"
    ref="cashRef"
    v-model="cashSalesReceiptInfo"
  />
</template>

<script setup>
import { warn } from 'vue';
import { DP_TP_CD, RVE_DV_CD } from '~sms-wells/contract/constants/ctConst';
import SinglePaymentApproval from './WwctaContractSettlementAgreeAprMgtMPaymentSpayAprAk.vue';
import CardAutomaticTransferApproval from './WwctaContractSettlementAgreeAprMgtMPaymentCrdCdAftnAprAk.vue';
import AccountAutomaticTransferApproval from './WwctaContractSettlementAgreeAprMgtMPaymentAcAftnAprAk.vue';
import VirtualAccountIssue from './WwctaContractSettlementAgreeAprMgtMPaymentVacIssue.vue';
import CashSalesReceipt from './WwctaContractSettlementAgreeAprMgtMPaymentCashSalesReceipt.vue';

const props = defineProps({
  contractor: {
    type: Object,
    required: true,
  },
  stlmRels: {
    type: Array,
    required: true,
  },
  stlms: {
    type: Array,
    required: true,
  },
});

const exposed = {};
defineExpose(exposed);

const emit = defineEmits(['activated']);

const CREDIT_CARD_DP_TP_CDS = [
  DP_TP_CD.IDV_RVE_CRDCD, /* 개별수납(신용카드) */
  DP_TP_CD.YMDR_CARD_VCH, /* 여민동락카드(바우처) */
]; /* 아마 06*, 07*, 08* 다 될거 같아. */

const MILEAGE_DP_TP_CDS = [
  DP_TP_CD.SMT_MLG, /* 스마트마일리지 */
  DP_TP_CD.K_MONEY, /* K머니 */
  DP_TP_CD.KMBRS_CASH, /* K멤버스 캐시 */
]; /* 아마 06*, 07*, 08* 다 될거 같아. */

/* rearrange base data */
const stlmRels = computed(() => props.stlmRels || []);

const savedStlmInfo = computed(() => (props.stlms || [])
  .filter((stlm) => stlmRels.value.some((rel) => rel.cntrStlmId === stlm.cntrStlmId))
  .reduce((objTransformed, stlm) => {
    objTransformed[stlm.cntrStlmId] = stlm;
    return objTransformed;
  }, {}));

const stlmInfo = computed(() => stlmRels.value
  .reduce((merged, stlmRel) => {
    const { dpTpCd, stlmAmt, cntrStlmId } = stlmRel;
    const stlm = savedStlmInfo.value[cntrStlmId];
    if (!stlm) {
      warn(`계약 결제 관계가 상이합니다. (${cntrStlmId})`);
      merged[cntrStlmId] = { dpTpCd }; /* 혹시나 추가적인 관계로부터 추가적인 정보가 필요하다면, 추가할 것 */
    }
    merged[cntrStlmId] ??= stlm;
    merged[cntrStlmId].stlmAmt ??= 0;
    merged[cntrStlmId].stlmAmt += stlmAmt || 0;
    merged[cntrStlmId].stlmRels ??= [];
    merged[cntrStlmId].stlmRels.push({ ...stlmRel });
    return merged;
  }, {}));

/* single pay */
const crdcdStlms = computed(() => Object.values(stlmInfo.value)
  .filter((stlm) => CREDIT_CARD_DP_TP_CDS.includes(stlm.dpTpCd)));

const mileageStlms = computed(() => Object.values(stlmInfo.value)
  .filter((stlm) => MILEAGE_DP_TP_CDS.includes(stlm.dpTpCd)));

const spayStlmsUpdateInfo = ref([]);

function onApprovedSpayStlms(stlmsUpdateInfo) {
  spayStlmsUpdateInfo.value = stlmsUpdateInfo;
}

function onApproveCanceledSpayStlms() {
  spayStlmsUpdateInfo.value = [];
}

/* account auto transfer */
const crdCdAftnStlm = computed(() => Object.values(stlmInfo.value)
  .find((stlm) => DP_TP_CD.CRDCD_AFTN === stlm.dpTpCd));

const crdCdAftnStlmsUpdateInfo = ref([]);

function onApprovedCrdCdAftnStlms(stlmUpdateInfo) {
  crdCdAftnStlmsUpdateInfo.value = [stlmUpdateInfo];
}

const acAftnStlm = computed(() => Object.values(stlmInfo.value)
  .find((stlm) => DP_TP_CD.AC_AFTN === stlm.dpTpCd));

const acAftnStlmsUpdateInfo = ref([]);

function onApprovedAcAftnStlms(stlmUpdateInfo) {
  acAftnStlmsUpdateInfo.value = [stlmUpdateInfo];
}

/* virtual account 수납유형이 가상계좌이며, 입금구분이 계약금인 건 */
const vacStlm = computed(() => Object.values(stlmInfo.value)
  .find((stlm) => DP_TP_CD.IDV_RVE_VAC === stlm.dpTpCd
      && stlm.stlmRels.find((stlmRel) => stlmRel.rveDvCd === RVE_DV_CD.CNTRAM)));

const vacStlmsUpdateInfo = ref([]);

function onIssuedVirtualAccount(stlmUpdateInfo) {
  vacStlmsUpdateInfo.value = [stlmUpdateInfo];
}

/* cash sales receipt */
// const cashSalesStlmRels = computed(() => stlmRels.value
//   .filter((rel) => DP_TP_CD.IDV_RVE_VAC === rel.dpTpCd));

function getDefaultReceiptInfo(vacStlmId, cntrCstInfo) {
  if (!vacStlmId) {
    return;
  }
  const normalized = {
    /* 결재 기반으로 생성이 되지 않습니다. 계약 결제 관계 기반으로 생성 될 예정이나, back office 에서 처리할 것입니다. */
    cntrStlmId: vacStlmId,
    cstKnm: '',
    cssrIsDvCd: '',
    cssrIsNo: '',
  };
  if (!cntrCstInfo) { return normalized; }
  normalized.cstKnm = cntrCstInfo.cstKnm;
  const { cralLocaraTno, mexnoEncr, cralIdvTno } = cntrCstInfo;
  if (!cralLocaraTno || !mexnoEncr || !cralIdvTno) { return normalized; }
  const phoneNumber = `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}`;
  if (phoneNumber) {
    normalized.cssrIsDvCd = '4';
    normalized.cssrIsNo = phoneNumber;
  }
  return normalized;
}

const cashSalesReceiptInfo = ref(getDefaultReceiptInfo(vacStlm.value?.cntrStlmId, props.contractor));

/* expose */
const spayRef = ref();
const cardAftnRef = ref();
const acAftnRef = ref();
const vacIssueRef = ref();
const cashRef = ref();

const invalidRef = ref();
async function getInvalidRef() {
  if (spayRef.value.ref && !await spayRef.value.validate()) {
    return spayRef.value.ref;
  }
  if (cardAftnRef.value.ref && !await cardAftnRef.value.validate()) {
    return cardAftnRef.value.ref;
  }
  if (acAftnRef.value.ref && !await acAftnRef.value.validate()) {
    return acAftnRef.value.ref;
  }
  if (vacIssueRef.value.ref && !await vacIssueRef.value.validate()) {
    return vacIssueRef.value.ref;
  }
  if (cashRef.value?.ref && !await cashRef.value.validate()) {
    return cashRef.value.ref;
  }
}

async function validate() {
  invalidRef.value = await getInvalidRef();
  return !invalidRef.value;
}

function getStlmsUpdateInfo() {
  return [
    ...spayStlmsUpdateInfo.value,
    ...crdCdAftnStlmsUpdateInfo.value,
    ...vacStlmsUpdateInfo.value,
  ];
}

exposed.validate = validate;
exposed.invalidRef = invalidRef;
exposed.getStlmsUpdateInfo = getStlmsUpdateInfo;
exposed.cashSalesReceiptInfo = cashSalesReceiptInfo;

onActivated(() => {
  emit('activated', invalidRef.value);
});
</script>
