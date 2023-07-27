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
    :title="'잔금할부(자동이체)확인/승인'"
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
        <kw-input
          v-model="approvalRequest.crcdnoEncr"
          label="카드번호"
          mask="####-####-####-####"
          unmasked-value
          rules="min:14|required"
        />
        <crdcd-exp-select
          v-model="approvalRequest.cardExpdtYm"
        />
        <kw-input
          v-model="approvalRequest.owrKnm"
          label="카드주"
          rules="required"
          readonly
        />
        <kw-input
          v-model="approvalRequest.copnDvCdDrmVal"
          label="법인격식별값"
          rules="required"
          hint="개인카드의 경우, 생년월일(YYYYMMDD), 법인카드의 경우, 사업자번호 10자리를 입력해주세요."
          readonly
        />
        <kw-input
          :model-value="approvalResponse.aprNo"
          label="승인번호"
          readonly
        />
        <kw-btn
          stretch
          secondary
          border-color="black-btn-line"
          :disable="!!approvalResponse.aprNo"
          label="승인"
          @click="onClickApproval"
        />
      </kw-form>
    </kw-item-section>
  </wwcta-contract-settlement-agree-item>
</template>

<script setup>
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';
import CrdcdExpSelect from '~sms-wells/contract/components/ordermgmt/WctaCrdcdExpSelect.vue';
import { confirm, getComponentType, notify, useDataService } from 'kw-lib';
import { scrollIntoView } from '~sms-common/contract/util';

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

const frmRef = ref(getComponentType('KwForm'));

const isCooperation = computed(() => props.cntrCstInfo.copnDvCd === '2' /* sorry, haha. */);

const stlmBas = computed(() => (props.stlm ?? {}));

const mpyBsdtOptions = ref([]);

async function fetchRegularFundTransferDayOptions() {
  if (!stlmBas.value.dpTpCd) { return; }
  const { data } = await dataService.get(`/sms/wells/contract/contracts/settlements/regular-fund-transfers-day-options/${stlmBas.value.dpTpCd}`);
  mpyBsdtOptions.value = data.map((day) => ({ codeId: day, codeName: `${day}일` }));
}

await fetchRegularFundTransferDayOptions();

const approvalRequest = ref({
  stlmAmt: stlmBas.value.stlmAmt,
  mpyBsdt: mpyBsdtOptions.value[0]?.codeId, /* 납부기준일자
  crcdnoEncr: '', /* 카드번호 */
  cardExpdtYm: '', /* 유효기한 */
  bryyMmdd: props.cntrCstInfo.bryyMmdd || '',
  owrKnm: props.cntrCstInfo.cstKnm, /* 카드주 */
  copnDvCd: props.cntrCstInfo.copnDvCd,
  copnDvCdDrmVal: isCooperation.value ? props.cntrCstInfo.bzrno : props.cntrCstInfo.bryyMmdd,
});

const approvalResponse = ref({
  aprNo: undefined, /* 승인번호, 저장은 안하지만 와야함. */
  cdcoCd: undefined, /* 카드사 코드 */
  fnitAprRsCd: undefined, /* 금융기관승인결과코드 */
  fnitAprFshDtm: undefined, /* 금융기관승인완료일시 */
});

function getStlmUpdateInfo() {
  const { cntrStlmId, dpTpCd, cntrNo } = stlmBas.value;
  if (!cntrStlmId) { throw Error('데이터가 이상합니다. 관리자에게 연락바랍니다.'); }
  const {
    mpyBsdt,
    crcdnoEncr,
    owrKnm,
    cardExpdtYm,
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
    crcdnoEncr,
    owrKnm,
    cardExpdtYm,
    aprNo,
    cdcoCd,
    fnitAprRsCd,
    fnitAprFshDtm,
  });
}

async function requestApproval() {
  return new Promise((resolve) => {
    const testResponse = {
      data: {
        aprNo: 'test123456789',
        cdcoCd: '',
        fnitAprRsCd: 'Y',
      },
    };
    setTimeout(() => resolve(testResponse), 100);
  });
}

async function onClickApproval() {
  if (!await frmRef.value.validate()) { return; }
  if (!await confirm('자동이체를 등록하시겠습니까?')) { return; }
  const response = await requestApproval();
  approvalResponse.value = response.data;
  emit('approved', getStlmUpdateInfo());
}

/* exposed */
const topRef = ref();

async function validate() {
  if (!props.stlm) { return true; }
  const valid = approvalResponse.value?.fnitAprRsCd === 'Y';
  if (!valid) {
    notify('계좌 이체 요청을 해주세요.');
    scrollIntoView(topRef);
  }
  return valid;
}

exposed.ref = topRef;
exposed.validate = validate;

</script>
