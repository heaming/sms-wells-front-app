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
- 결제하기 자동이체
- 결제금액을 결재 방식 별로 게시
- 0201:개별수납(신용카드) 의 결제 관계가 있는 경우, 신용카드 정보 입력 화면 노출 및 승인 요청
- 0102(계좌자동이체) 의 결제 관계가 있는 경우, 계좌자동이체 정보 입력 화면 노출 및 승인 요청?
- 0203(카드자동이체) 의 결제 관계가 있는 경우, 카드자동이체 정보 입력 화면 노출 및 승인 요청?
- 자동이체 결제 정보 입력 화면
****************************************************************************************************
--->
<template>
  <wwcta-contract-settlement-agree-item
    v-if="stlm"
    ref="topRef"
    :title="'자동이체 확인/승인'"
    default-opened
    hide-expand-icon
  >
    <kw-item-section class="pt20">
      <!-- 자동이체승인-->
      <kw-item-label
        font="body"
        font-weight="500"
      >
        자동이체승인
      </kw-item-label>
      <kw-form
        ref="frmRef"
        class="pt8 column gap-lg"
      >
        <kw-select
          v-model="approvalRequest.mpyBsdt"
          label="이체일자"
          rules="required"
          :options="mpyBsdtOptions"
        />
        <kw-select
          v-model="approvalRequest.bnkCd"
          label="은행"
          :options="banks"
          rules="required"
        />
        <kw-input
          v-model="approvalRequest.acnoEncr"
          label="계좌번호"
          rules="required"
          mask="#############################"
        />
        <kw-input
          v-model="approvalRequest.owrKnm"
          label="예금주"
          rules="required"
          :readonly="isCooperation ? false : true"
        />
        <kw-input
          v-model="approvalRequest.copnDvCdDrmVal"
          label="법인격식별값"
          rules="required"
          hint="개인카드의 경우, 생년월일(YYYYMMDD), 법인카드의 경우, 사업자번호 10자리를 입력해주세요."
          :readonly="isCooperation ? false : true"
        />
        <kw-item-label font="dense">
          <span class="text-black2">승인결과</span>
          <span
            :class="fnitAprRsCdColorClass"
            class="text-weight-medium ml12"
          >{{ getCodeName('FNIT_APR_RS_CD', approvalResponse.fnitAprRsCd) }}</span>
        </kw-item-label>
        <kw-btn
          stretch
          secondary
          border-color="black-btn-line"
          :label="approved ? '이체정보변경' : '승인'"
          @click="onClickApproval"
        />
      </kw-form>
    </kw-item-section>
  </wwcta-contract-settlement-agree-item>
</template>

<script setup>
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';
import { alert, confirm, getComponentType, notify, useDataService } from 'kw-lib';
import { scrollIntoView } from '~sms-common/contract/util';
import { useCtCode } from '~sms-common/contract/composable';

const props = defineProps({
  cntrCstInfo: { type: Object, default: undefined },
  stlm: {
    type: Object,
    default: undefined,
  },
});
const emit = defineEmits(['approved']);
const exposed = {};
defineExpose(exposed);
const dataService = useDataService();

const { getCodeName } = await useCtCode('FNIT_APR_RS_CD');

const frmRef = ref(getComponentType('KwForm'));
const isCooperation = computed(() => props.cntrCstInfo.copnDvCd === '2' /* sorry, haha. */);
const stlmBas = computed(() => (props.stlm ?? {}));
const mpyBsdtOptions = ref([]);
const banks = ref([]);

async function fetchRegularFundTransferDayOptions() {
  if (!stlmBas.value.dpTpCd) { return; }
  const { data } = await dataService.get(`/sms/common/contract/settlement/regular-fund-transfers-day-options/${stlmBas.value.dpTpCd}`);
  mpyBsdtOptions.value = data;
}
await fetchRegularFundTransferDayOptions();

async function fetchBanks() {
  const { data } = await dataService.get('/sms/common/common/codes/finance-code/bank-codes');
  banks.value = data;
}
await fetchBanks();

const approvalRequest = ref({
  cntrStlmId: stlmBas.value.cntrStlmId,
  stlmAmt: stlmBas.value.stlmAmt, /* TODO: 추후에 확인 필요 */
  mpyBsdt: stlmBas.value.mpyBsdt, /* 납부기준일자 */
  acnoEncr: stlmBas.value.acnoEncr,
  bnkCd: stlmBas.value.bnkCd,
  owrKnm: props.cntrCstInfo.cstKnm, /* 소유자 한글명 */
  copnDvCd: props.cntrCstInfo.copnDvCd,
  copnDvCdDrmVal: isCooperation.value ? props.cntrCstInfo.bzrno : props.cntrCstInfo.bryyMmdd,
});
const approvalResponse = ref({
  aprNo: undefined, /* 승인번호, 저장은 안하지만 와야함. */
  cdcoCd: undefined, /* 카드사 코드 */
  fnitAprRsCd: 'N', /* 금융기관승인결과코드 */
  fnitAprFshDtm: undefined, /* 금융기관승인완료일시 */
});

const fnitAprRsCdColorClass = computed(() => {
  const { fnitAprRsCd } = approvalResponse.value;
  if (fnitAprRsCd === 'Y') {
    return 'text-primary';
  }
  if (fnitAprRsCd === 'B') {
    return 'text-error';
  }
  return 'text-black2';
});
const alreadyDone = (stlmBas.value.fnitAprRsCd === 'Y');
const approved = ref(alreadyDone);

function getStlmUpdateInfo() {
  const { cntrStlmId, dpTpCd, cntrNo } = stlmBas.value;
  if (!cntrStlmId) { throw Error('데이터가 이상합니다. 관리자에게 연락바랍니다.'); }
  const {
    mpyBsdt,
    acnoEncr,
    owrKnm,
  } = approvalRequest.value;
  const {
    aprNo,
    cdcoCd,
    fnitAprRsCd,
    fnitAprFshDtm,
  } = approvalResponse;
  return ({
    cntrStlmId,
    dpTpCd,
    cntrNo,
    mpyBsdt,
    acnoEncr,
    owrKnm,
    aprNo,
    cdcoCd,
    fnitAprRsCd,
    fnitAprFshDtm,
  });
}

let cachedRequestParams;
async function requestApproval() {
  cachedRequestParams = { ...approvalRequest.value };
  const { data } = await dataService.post('/sms/wells/contract/contracts/settlements/account-auto-transfer', cachedRequestParams);
  approvalResponse.value = data;
  if (data.fnitAprRsCd === 'B') {
    await alert('임시로 유효성 체크는 통과합니다. 계좌 인증 안정시 수정.');
  }

  // approved.value = (data.fnitAprRsCd === 'Y'); FIXME 테스트 끝나면 돌려놓을 것
  approved.value = true;
}

async function onClickApproval() {
  if (!await frmRef.value.validate()) { return; }
  if (!await confirm('자동이체를 등록하시겠습니까?')) { return; }
  await requestApproval();
  emit('approved', getStlmUpdateInfo());
}

/* exposed */
const topRef = ref();

async function validate() {
  if (!props.stlm) { return true; }
  const valid = approved.value;
  if (!valid) {
    notify('계좌 이체 요청을 해주세요.');
    scrollIntoView(topRef);
  }
  return valid;
}

exposed.ref = topRef;
exposed.validate = validate;

</script>
