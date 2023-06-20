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
  <wwcta-contract-settlement-agree-item
    v-if="spayStlmTotalAmt"
    ref="topRef"
    :title="'결제하기'"
    default-opened
    hide-expand-icon
    expand-icon-toggle
  >
    <kw-item-section class="pt20 gap-lg">
      <!-- 결제금액 확인-->
      <kw-item>
        <kw-item-section>
          <kw-item-label
            font="body"
            font-weight="500"
          >
            결제금액확인
          </kw-item-label>
          <kw-expansion-item
            class="pa0"
            header-class="scoped-hp-unset-min-height py12"
          >
            <template #header>
              <kw-item-section>
                <kw-item-label class="flex justify-between">
                  <span class="text-black2">
                    결제금액
                  </span>
                  <span class="pr8">
                    {{ `${stringUtil.getNumberWithComma(spayStlmTotalAmt || 0)}원` }}
                  </span>
                </kw-item-label>
              </kw-item-section>
            </template>
            <template #default>
              <kw-list
                class="bg-bg-box pa16"
                :items="spayStlmAmts"
                item-key="dpTpCd"
                item-class="h24 py2"
              >
                <template #item="{item: {dpTpCd, stlmAmt}}">
                  <kw-item-section>
                    <kw-item-label
                      class="flex no-wrap justify-between"
                      font="dense"
                      font-weight="400"
                    >
                      <div class="ellipsis">
                        {{ getCodeName(codes.DP_TP_CD, dpTpCd) }}
                      </div>
                      <div
                        class="not-flexible"
                        style="word-break: keep-all;"
                      >
                        {{ `${stringUtil.getNumberWithComma(stlmAmt || 0)}원` }}
                      </div>
                    </kw-item-label>
                  </kw-item-section>
                </template>
              </kw-list>
              <kw-separator
                class="my12"
                color="black2"
              />
              <div class="row item-center justify-between">
                <p class="kw-font-pt14">
                  총 입금액
                </p>
                <p class="text-weight-bold">
                  {{ `${stringUtil.getNumberWithComma(spayStlmTotalAmt || 0)}원` }}
                </p>
              </div>
            </template>
          </kw-expansion-item>
        </kw-item-section>
      </kw-item>
      <!-- 신용카드 승인-->
      <kw-item
        v-if="stlmBas.stlmAmt"
      >
        <kw-item-section>
          <kw-item-label
            font="body"
            font-weight="500"
          >
            신용카드 승인
          </kw-item-label>
          <kw-form
            ref="frmRef"
            class="pt8 column gap-lg"
          >
            <div class="row gap-xs">
              <kw-input
                label="결제금액/할부"
                class="col"
                :model-value="approvalRequest.stlmAmt"
                mask="number"
                readonly
              />
              <kw-select
                v-model="approvalRequest.istmMcn"
                label="할부"
                :options="codes.ISTM_MCT_CD"
                class="col text-right"
              />
            </div>
            <kw-input
              v-model="approvalRequest.crcdnoEncr"
              label="카드번호"
              mask="####-####-####-####"
              unmasked-value
              rules="required|min:14"
            />
            <kw-input
              v-model="approvalRequest.owrKnm"
              label="카드주"
              rules="required"
            />
            <crdcd-exp-select
              v-model="approvalRequest.cardExpdtYm"
            />
            <kw-input
              v-if="isCooperation"
              :model-value="cntrCstInfo.bzrno"
              label="사업자번호"
              readonly
            />
            <kw-input
              v-else
              :model-value="cntrCstInfo.bryyMmdd"
              label="계약자 생년월일"
              readonly
            />
            <kw-input
              :model-value="approvalResponse.aprno"
              label="승인번호"
              readonly
            />
            <kw-btn
              stretch
              secondary
              border-color="black-btn-line"
              label="승인"
              @click="onClickApproval"
            />
          </kw-form>
        </kw-item-section>
      </kw-item>
    </kw-item-section>
  </wwcta-contract-settlement-agree-item>
</template>

<script setup>
import { codeUtil, confirm, getComponentType, notify, stringUtil } from 'kw-lib';
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';
import CrdcdExpSelect
  from '~sms-wells/contract/components/ordermgmt/WctaCrdcdExpSelect.vue';
import { warn } from 'vue';

const props = defineProps({
  cntrCstInfo: { type: Object, default: undefined },
  crdcdStlms: {
    type: Array,
    default: () => [],
    validator(val) {
      const valid = (val?.length || 0) < 2;
      if (!valid) { warn('일시불 결제 건이 두 건 이상 있습니다.'); }
      return true;
    },
  },
  mileageStlms: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['approved']);

const exposed = {};
defineExpose(exposed);

const codes = await codeUtil.getMultiCodes(
  'DP_TP_CD',
);
const MERGED_CREDIT_CARD_SPAY_CD = '02';
codes.DP_TP_CD.push({
  codeId: MERGED_CREDIT_CARD_SPAY_CD,
  codeName: '신용카드',
}); /* sorry for dirty. */
codes.ISTM_MCT_CD = [
  { codeId: 1, codeName: '일시불' },
  { codeId: 2, codeName: '2개월' },
  { codeId: 3, codeName: '3개월' },
  { codeId: 12, codeName: '12개월' },
  { codeId: 24, codeName: '24개월' },
  { codeId: 36, codeName: '36개월' },
]; /* TODO: 할부 개월 수 어디서 가져올 지 확인 후 수정 */

const frmRef = ref(getComponentType('KwForm'));

const isCooperation = computed(() => props.cntrCstInfo.copnDvCd === '2' /* sorry, haha. */);

/* 여러건이면....? */
const stlmBas = computed(() => (props.crdcdStlms?.[0] ?? {}));

const approvalRequest = ref({
  stlmAmt: stlmBas.value.stlmAmt,
  istmMcn: 1, /* 할부 개월 수 */
  crcdnoEncr: '', /* 카드번호 */
  owrKnm: '', /* 카드주 */
  cardExpdtYm: '', /* 유효기한 */
});

const approvalResponse = ref({
  aprno: undefined, /* 승인번호, 저장은 안하지만 와야함. */
  cdcoCd: undefined, /* 카드사 코드 */
  fnitAprRsCd: undefined, /* 금융기관승인결과코드 */
  fnitAprFshDtm: undefined, /* 금융기관승인완료일시 */
});

/* 결제 금액 계산 */
const crdcdStlmAmt = computed(() => {
  const { crdcdStlms } = props;
  if (!crdcdStlms) { return 0; }
  return crdcdStlms.reduce((acc, stlm) => acc + (stlm.stlmAmt || 0), 0);
});

const spayStlmAmts = computed(() => {
  const spayArr = [];
  if (crdcdStlmAmt.value) { /* 신용카드 결재는 하나로 보여달라고 함. */
    spayArr.push({
      dpTpCd: MERGED_CREDIT_CARD_SPAY_CD,
      stlmAmt: crdcdStlmAmt.value,
    });
  }
  const { mileageStlms } = props;
  if (mileageStlms) {
    mileageStlms.forEach((stlm) => {
      spayArr.push({
        dpTpCd: stlm.dpTpCd,
        stlmAmt: stlm.stlmAmt,
      });
    });
  }
  return spayArr;
});

const spayStlmTotalAmt = computed(() => spayStlmAmts.value.reduce((acc, { stlmAmt }) => (acc + stlmAmt), 0));

/* 결제 금액 계산 end */

function getCodeName(codeArr, codeId) {
  if (!Array.isArray(codeArr)) { return ''; }
  return codeArr.find((code) => code.codeId === codeId)?.codeName ?? '';
}

function getCrdCdStlmUpdateInfo() {
  const { cntrStlmId, dpTpCd, cntrNo } = stlmBas.value;
  if (!cntrStlmId) { throw Error('데이터가 이상합니다. 관리자에게 연락바랍니다.'); }
  const {
    crcdnoEncr,
    owrKnm,
    cardExpdtYm,
  } = approvalRequest.value;
  const {
    aprno,
    cdcoCd,
    fnitAprRsCd,
    fnitAprFshDtm,
  } = approvalResponse.value;
  return ({
    cntrStlmId,
    dpTpCd,
    cntrNo,
    crcdnoEncr,
    owrKnm,
    cardExpdtYm,
    aprno,
    cdcoCd,
    fnitAprRsCd,
    fnitAprFshDtm,
  });
}

function getMileageStlmsUpdateInfo() {
  return props.mileageStlms.map((stlm) => ({
    cntrStlmId: stlm.cntrStlmId,
    dpTpCd: stlm.cntrStlmId,
    stlmAmt: stlm.stlmAmt,
  }));
}

function getStlmsUpdateInfo() {
  return [
    getCrdCdStlmUpdateInfo(),
    ...getMileageStlmsUpdateInfo(),
  ];
}

async function requestApproval() {
  return new Promise((resolve) => {
    const testResponse = {
      data: {
        aprno: 'test123456789', /* 승인번호, 저장은 안하지만 와야함. */
        cdcoCd: '02', /* 카드사 코드 */
        fnitAprRsCd: 'Y', /* 금융기관승인결과코드 */
        fnitAprFshDtm: undefined, /* 금융기관승인완료일시 */
      },
    };
    setTimeout(() => resolve(testResponse), 100);
  });
}

async function onClickApproval() {
  if (!await frmRef.value.validate()) { return; }
  if (!await confirm('카드승인 요청을 하시겠습니까?')) { return; }
  const response = await requestApproval();
  approvalResponse.value = response.data;
  emit('approved', getStlmsUpdateInfo());
}

/* exposed */
const topRef = ref();

function scrollTo(ref) {
  const el = ref.value.$el;
  if (el) { el.scrollIntoView(true); }
}

async function validate() {
  if (!approvalRequest.value.stlmAmt) {
    return true;
  }
  const valid = approvalResponse.value?.fnitAprRsCd === 'Y';
  if (!valid) {
    notify('카드 승인 요청을 해주세요.');
    scrollTo(topRef);
  }
  return valid;
}

exposed.ref = topRef;
exposed.validate = validate;
</script>
