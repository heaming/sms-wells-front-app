<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : W-SS-U-0022PM02 - 법인고객계약 비대면 URL 화면(결제/배송/서명)
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-06-05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- case1) 미 인증 세션으로 작업 된다. case2) 그러나 세션이 있을 수도 있다.
- 미인증 세션으로 작업 될 수 있으므로 가능한 한 요청 내 parameter 는 암호화 한다.
- 미인증세션에서는, 통합계약 로그인 화면을 통해서만 접근하며, 해당 화면의 사용자는 해당 계약의 고객임을 가정한다.
- > 아니, Hmac key 를 로그인 시 발급받아서 해당 키를 헤더에 박고, 해당 페이지 내에서 사용하는 모든 api 에서
- 복호화 후 유효 시간 및 및 계약 번호, 생년월일을 체크한다.
- 서버 저장은 전략은 All OR Nothing 각 fragment 에서 마지막 최종 확인 버튼을 눌렀을 때 정보 싹 긁어와서,
- 결재 정보를 통째로 업데이트 합니다.
****************************************************************************************************
--->
<template>
  <kw-page no-header>
    <kw-list class="scoped-divider-list">
      <agrees
        :agrees="contract.agIzs"
        @confirm="onConfirmAgrees"
      />
      <!--  캐로셀 안에 divider-list 넣어서 만들 예정  -->
      <template v-if="agreed">
        <product-carousel-item
          ref="productCarouselRef"
          :contract="contract"
        />
        <partner-info
          :prtnr="contract.prtnr"
        />
      </template>
      <template v-if="agreed">
        <wwcta-contract-settlement-sign-item
          :description="'계좌 자동이체 서명을 해주세요.'"
          empty-alert
          confirm-label="확인 서명"
          @confirm="onCheckAutoTransfer"
        />
      </template>
      <template v-if="agreed && (!includeAutoTransfer || (includeAutoTransfer && signs.autoTransferChecked))">
        <wwcta-contract-settlement-sign-item
          :description="'계약 확정 서명을 해주세요.'"
          empty-alert
          confirm-label="계약사항과 계약 약관을 모두 확인하였습니다."
          @confirm="onSettlementConfirmed"
        />
      </template>
    </kw-list>
  </kw-page>
</template>

<script setup>
import WwctaContractSettlementSignItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementSignItem.vue';
import { alert, useDataService } from 'kw-lib';
import { decryptEncryptedParam, postMessage } from '~sms-common/contract/util';
import Agrees from './WwctaContractSettlementAgreeAprMgtMAgrees.vue';
import PartnerInfo from './WwctaContractSettlementAgreeAprMgtMPartnerInfo.vue';
import ProductCarouselItem from './WwctaContractSettlementAgreeAprMgtMProductCarouselItem.vue';

const dataService = useDataService();

const props = defineProps({
  cntrNo: { type: String, default: undefined },
  encryptedParam: { type: String, default: undefined },
});

const params = decryptEncryptedParam(props.encryptedParam, {
  cntrNo: props.cntrNo,
});

if (!params.cntrNo) {
  await alert('주소에 문제가 있습니다.');
  window.close();
}

const contract = ref({}); /* in */
const stlmsUpdateRequestBody = reactive({
  cntrNo: params.cntrNo,
  agIzs: undefined,
  stlmBases: undefined,
  cssrInfos: undefined,
  adrpcs: undefined,
}); /* out */
const productCarouselRef = ref();
const agreed = ref(false);
const includeAutoTransfer = ref(false);
const signs = reactive({
  autoTransferChecked: undefined,
  settlementConfirmed: undefined,
});

async function fetchContract() {
  try {
    const response = await dataService.post('/sms/wells/contract/contracts/settlements/contract', {
      cntrNo: params.cntrNo,
    });
    contract.value = response.data;
    includeAutoTransfer.value = contract.value.stlms.some((s) => s.dpTpCd === '0102');
  } catch (e) {
    postMessage('cancelled');
    window.close();
  }
}

function onConfirmAgrees(agreedInfos) {
  agreed.value = true;
  stlmsUpdateRequestBody.agIzs = agreedInfos;
}

function onCheckAutoTransfer(sign) {
  signs.autoTransferChecked = sign;
}

async function onSettlementConfirmed(sign) {
  const reqData = await productCarouselRef.value.getRequestData();
  if (!reqData) { return; }
  signs.settlementConfirmed = sign;
  stlmsUpdateRequestBody.stlmBases = reqData.stlmBases;
  stlmsUpdateRequestBody.adrpcs = reqData.adrpcs;
  stlmsUpdateRequestBody.cssrIss = reqData.cssrIss;
  stlmsUpdateRequestBody.signs = signs;

  const res = await dataService.post('/sms/wells/contract/contracts/settlements/confirm', stlmsUpdateRequestBody);

  if (res.data.result === true) {
    await alert('계약이 확정되었습니다');

    postMessage('confirmed');

    window.close();
  }
}

await fetchContract();

onMounted(() => {
  window.addEventListener('beforeunload', () => postMessage('forceClosed', false));
});
</script>

<style scoped lang="scss">
:deep(.scoped-divider-list) {
  > .kw-item-type + .kw-item-type {
    border-top: 8px solid $bg-box;
  }
}

:deep(.kw-item__section.q-item__section:has(.q-expansion-item__toggle-icon)) {
  padding-right: 0 !important; /* 고쳐줘 */
  padding-left: 0 !important;
}

</style>
