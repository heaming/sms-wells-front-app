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
                        {{ getCodeName(DP_TP_CD, dpTpCd) }}
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
                v-if="!alreadyDone"
                v-model="approvalRequest.istmMcn"
                label="할부"
                :options="codes.ISTM_MCNT_CD"
                class="col text-right"
              />
            </div>
            <crdcd-no-input
              v-model="approvalRequest.crcdnoEncr"
              :readonly="approved"
            />
            <crdcd-exp-select
              v-model="approvalRequest.cardExpdtYm"
              :readonly="approved"
            />
            <kw-input
              v-model="approvalRequest.owrKnm"
              label="계약자"
              rules="required"
              readonly
            />
            <kw-input
              v-model="approvalRequest.copnDvCdDrmVal"
              :label="isCooperation ? '사업자번호' : '생년월일'"
              rules="required"
              hint="개인카드의 경우, 생년월일(YYYYMMDD), 법인카드의 경우, 사업자번호 10자리를 입력해주세요."
              readonly
            />
            <kw-input
              v-if="!alreadyDone"
              :model-value="approvalResponse.aprNo"
              label="승인번호"
              readonly
            />
            <kw-btn
              stretch
              secondary
              border-color="black-btn-line"
              :label="approved ? '승인되었습니다' : '승인'"
              :disable="approved"
              @click="onClickApproval"
            />
            <kw-btn
              v-if="approved"
              stretch
              negative
              :label="'승인취소'"
              @click="onClickApprovalCancel"
            />
          </kw-form>
        </kw-item-section>
      </kw-item>
    </kw-item-section>
  </wwcta-contract-settlement-agree-item>
</template>

<script setup>
import { confirm, getComponentType, notify, stringUtil, useDataService } from 'kw-lib';
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';
import CrdcdExpSelect from '~sms-common/contract/components/ZctzCrdcdExpSelect.vue';
import CrdcdNoInput from '~sms-common/contract/components/ZctzCrdcdNoInput.vue';
import { warn } from 'vue';
import { scrollIntoView } from '~sms-common/contract/util';
import { useCtCode } from '~sms-common/contract/composable';

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

const dataService = useDataService();
const emit = defineEmits(['approved', 'approve-canceled']);

const exposed = {};

defineExpose(exposed);

const DP_TP_CD = 'DP_TP_CD';
const ISTM_MCNT_CD = 'ISTM_MCNT_CD';
const MERGED_CREDIT_CARD_SPAY_CD = '02';

const { codes, getCodeName, addCodeItem } = await useCtCode(
  DP_TP_CD,
  ISTM_MCNT_CD,
);

addCodeItem(DP_TP_CD, {
  codeId: MERGED_CREDIT_CARD_SPAY_CD,
  codeName: '신용카드',
});/* sorry for dirty. */

const frmRef = ref(getComponentType('KwForm'));
const isCooperation = computed(() => props.cntrCstInfo.copnDvCd === '2' /* sorry, haha. */);
const stlmBas = computed(() => (props.crdcdStlms?.[0] ?? {}));

const approvalRequest = ref({
  cntrStlmId: stlmBas.value.cntrStlmId,
  stlmAmt: stlmBas.value.stlmAmt,
  istmMcn: '0', /* 할부 개월 수 notify: 일시불 0 임 */
  crcdnoEncr: stlmBas.value.crcdnoEncr || '', /* 카드번호 */
  owrKnm: props.cntrCstInfo.cstKnm, /* 카드주 */
  copnDvCdDrmVal: isCooperation.value ? props.cntrCstInfo.bzrno : props.cntrCstInfo.bryyMmdd,
  cardExpdtYm: stlmBas.value.cardExpdtYm || '', /* 유효기한 */
});
const approvalResponse = ref({
  aprNo: stlmBas.value.fnitAprRsCd === 'Y' ? stlmBas.value.aprNo : undefined,
  fnitAprRsCd: stlmBas.value.fnitAprRsCd, /* 금융기관승인결과코드 */
});

const alreadyDone = (stlmBas.value.fnitAprRsCd === 'Y');
const approved = ref(alreadyDone);

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

function getCrdCdStlmUpdateInfo() {
  const { cntrStlmId, dpTpCd, cntrNo } = stlmBas.value;
  if (!cntrStlmId) { throw Error('데이터가 이상합니다. 관리자에게 연락바랍니다.'); }
  const {
    crcdnoEncr,
    owrKnm,
    cardExpdtYm,
  } = approvalRequest.value;
  const {
    aprNo,
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
    aprNo,
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

let cachedRequestParams;
async function requestApproval() {
  cachedRequestParams = { ...approvalRequest.value };
  const { data } = await dataService.post('/sms/wells/contract/contracts/settlements/credit-card-spay', cachedRequestParams);
  approvalResponse.value = data;
}

let cachedCancelRequestParams;
async function requestApprovalCancel() {
  cachedCancelRequestParams = { ...approvalRequest.value };
  const { data } = await dataService.post('/sms/wells/contract/contracts/settlements/credit-card-cancel', cachedCancelRequestParams);
  approvalResponse.value = data;
}

async function onClickApproval() {
  if (!await frmRef.value.validate()) { return; }
  if (!await confirm('카드승인 요청을 하시겠습니까?')) { return; }
  await requestApproval();
  emit('approved', getStlmsUpdateInfo());
  approved.value = true;
}

async function onClickApprovalCancel() {
  if (!await confirm('카드승인 취소 요청을 하시겠습니까?')) { return; }
  await requestApprovalCancel();
  emit('approve-canceled');
  approved.value = false;
  notify('취소되었습니다.');
}

/* exposed */
const topRef = ref();

async function validate() {
  if (!approvalRequest.value.stlmAmt) {
    return true;
  }
  const valid = approved.value;
  if (!valid) {
    notify('카드 승인 요청을 해주세요.');
    scrollIntoView(topRef);
  }
  return valid;
}

exposed.ref = topRef;
exposed.validate = validate;
</script>
