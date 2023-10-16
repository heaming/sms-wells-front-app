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
- 결제금액을 결재 방식 별로 게시
- 0201:개별수납(신용카드) 의 결제 관계가 있는 경우, 신용카드 정보 입력 화면 노출 및 승인 요청
- 0102(계좌자동이체) 의 결제 관계가 있는 경우, 계좌자동이체 정보 입력 화면 노출 및 승인 요청?
- 0203(카드자동이체) 의 결제 관계가 있는 경우, 카드자동이체 정보 입력 화면 노출 및 승인 요청?
- 개별수납(가상계좌) 의 결제 관계가 있는 경우, 가상계좌 생성 발급 화면 노
****************************************************************************************************
--->
<template>
  <wwcta-contract-settlement-agree-item
    v-if="stlm"
    ref="topRef"
    :title="'가상계좌발급'"
    default-opened
    hide-expand-icon
  >
    <kw-item-section class="pt20 gap-lg">
      <kw-select
        v-model="selectedBnkCd"
        label="납부은행"
        :options="codes[BANKS]"
        @change="clearIssuedAccountInfo"
      />
      <kw-btn
        stretch
        secondary
        label="가상계좌발급"
        :disable="!!issuedAccountInfo.acnoEncr"
        @click="onClickIssue"
      />
      <kw-item
        v-if="issuedAccountInfo?.acnoEncr"
      >
        <kw-item-section>
          <kw-item-label
            font="body"
            font-weight="500"
          >
            입금 계좌정보
          </kw-item-label>
          <kw-form class="mt20">
            <kw-form-item
              label="은행"
            >
              <p>{{ getCodeName(BANKS, selectedBnkCd) }}</p>
            </kw-form-item>
            <kw-form-item label="가상계좌번호">
              <p>{{ issuedAccountInfo.acnoEncr }}</p>
            </kw-form-item>
            <kw-form-item label="예금주">
              <p>{{ issuedAccountInfo.owrKnm }}</p>
            </kw-form-item>
            <kw-form-item label="입금액">
              <p>{{ stringUtil.getNumberWithComma(issuedAccountInfo.stlmAmt) }}원</p>
            </kw-form-item>
            <kw-form-item label="납부마감일시">
              <p>{{ stringUtil.getDateFormat(issuedAccountInfo.fnitAprFshDtm) }}</p>
            </kw-form-item>
          </kw-form>
        </kw-item-section>
      </kw-item>
    </kw-item-section>
  </wwcta-contract-settlement-agree-item>
</template>

<script setup>
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';
import { alert, notify, useDataService, stringUtil, confirm } from 'kw-lib';
import { scrollIntoView } from '~sms-common/contract/util';
import { useCtCode } from '~sms-common/contract/composable';

const BANKS = 'BANKS';

const props = defineProps({
  stlm: {
    type: Object,
    default: undefined,
  },
});
const emit = defineEmits(['approved']);

const exposed = {};
defineExpose(exposed);

const dataService = useDataService();
const { codes, addCode, getCodeName } = await useCtCode();
const stlmBas = computed(() => (props.stlm ?? {}));

const selectedBnkCd = ref(stlmBas.value.bnkCd);

const issuedAccountInfo = ref({
  bnkCd: stlmBas.value.bnkCd,
  acnoEncr: stlmBas.value.acnoEncr,
  owrKnm: stlmBas.value.owrKnm,
  fnitAprFshDtm: stlmBas.value.fnitAprFshDtm,
  vncoDvCd: stlmBas.value.vncoDvCd,
  stlmAmt: stlmBas.value.stlmAmt,
});

function clearIssuedAccountInfo() {
  issuedAccountInfo.value = {};
}

function getStlmUpdateInfo() {
  const { cntrStlmId, dpTpCd, cntrNo } = stlmBas.value;
  if (!cntrStlmId) { throw Error('데이터가 이상합니다. 관리자에게 연락바랍니다.'); }
  return ({
    cntrStlmId,
    dpTpCd,
    cntrNo,
  });
}

async function onClickIssue() {
  if (!selectedBnkCd.value) {
    alert('납부은행을 선택해주세요.');
    return;
  }
  if (!await confirm('가상계좌 발급 요청을 하시겠습니까?')) { return; }
  const { data } = await dataService.post('/sms/wells/contract/contracts/settlements/virtual-account', {
    cntrStlmId: stlmBas.value.cntrStlmId,
    bnkCd: selectedBnkCd.value,
  });
  issuedAccountInfo.value = data;
  issuedAccountInfo.value.bnkCd = selectedBnkCd.value;
  emit('approved', getStlmUpdateInfo());
}

async function fetchBanks() {
  const { data } = await dataService.get('/sms/common/common/codes/finance-code/bank-codes', {
    params: {
      fnitFeeTpCd: '1', /* 금융기관수수료유형코드(1 - 가상계좌, 2 - 신용카드, 3 - 카드자동이체, 4 - 현금자동이체) */
      vncoDvCd: '003', /* VAN사구분코드(002 - 세틀뱅크, 003 - KICC, 001 - 금결원) */
    },
  });
  await addCode(BANKS, data);
}

await fetchBanks();

/* expose */
const topRef = ref();

async function validate() {
  if (!props.stlm) { return true; }
  const valid = !!issuedAccountInfo.value?.acnoEncr;
  if (!valid) {
    notify('가상계좌를 발급해주세요.');
    scrollIntoView(topRef);
  }
  return valid;
}

exposed.ref = topRef;
exposed.validate = validate;

</script>
