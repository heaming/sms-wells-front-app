<template>
  <kw-page>
    <div
      class="normal-area normal-area--button-set-bottom"
    >
      <div class="normal-area__content">
        <div class="stepper-layout-tweak-wrapper">
          <kw-stepper
            v-model="currentStepName"
            heading-text
          >
            <kw-step
              v-for="(step, index) in steps"
              :key="`step-${index}`"
              :name="step.name"
              :title="step.title"
              :done="step.done.value"
              :prefix="index + 1"
            />
            <kw-step-panel
              v-for="(step, index) in steps"
              :key="`step-panel-${index}`"
              :name="step.name"
            >
              <wwcta-contract-registration-mgt-m-step1
                v-if="step.name === 'step1'"
                :ref="(el) => step.ref.value = el"
                :contract="contract"
                :cntr-cst-no="cntrCstNo"
                @activated="onChildActivated"
              />
              <wwcta-contract-registration-mgt-m-step2
                v-if="step.name === 'step2'"
                :ref="(el) => step.ref.value = el"
                :contract="contract"
                @activated="onChildActivated"
                @contract-modified="onContractModified"
              />
              <wwcta-contract-registration-mgt-m-step3
                v-if="step.name === 'step3'"
                :ref="(el) => step.ref.value = el"
                :contract="contract"
                @activated="onChildActivated"
              />
              <wwcta-contract-registration-mgt-m-step4
                v-if="step.name === 'step4'"
                :ref="(el) => step.ref.value = el"
                :contract="contract"
                @activated="onChildActivated"
              />
            </kw-step-panel>
          </kw-stepper>
          <kw-separator
            spaced="0"
            vertical
          />
          <wwcta-contract-registration-mgt-m-summary
            class="not-flexible w350"
            :cntr-no="contract?.cntrNo ?? contract?.rstlCntrNo"
            :summary="summary"
            :steps="steps"
            :step="currentStepName"
          />
        </div>
      </div>
      <!-- 하단 버튼 영역 -->
      <div
        v-if="!isCnfmCntr"
        class="button-set--bottom"
      >
        <div class="button-set--bottom-left">
          <kw-btn
            v-if="currentStepIndex > 0 && !contract.step4?.isRestipulation"
            :label="$t('MSG_BTN_PREV')"
            @click="onClickPrevious"
          />
        </div>
        <div class="button-set--bottom-right">
          <template v-if="currentStepIndex === 0">
            <kw-btn
              v-if="currentStepIndex === 0 && contract?.cntrTpCd !== '09'"
              :label="$t('MSG_BTN_TEMP_SAVE')"
              class="ml8"
              @click="onClickTempSave"
            />
            <kw-btn
              v-if="currentStepIndex === 0"
              :label="$t('MSG_BTN_NEXT')"
              class="ml8"
              primary
              @click="onClickNext"
            />
          </template>
          <template v-if="currentStepIndex === 1">
            <kw-btn
              v-if="summary?.cntrBas?.cntrTpCd !== CNTR_TP_CD.QUOTE"
              :label="$t('MSG_BTN_TEMP_SAVE')"
              class="ml8"
              @click="onClickTempSave"
            />
            <kw-btn
              v-if="!isCnfmPds"
              :label="$t('MSG_BTN_PD_CNFM')"
              class="ml8"
              primary
              @click="onClickPdCnfm"
            />
            <template v-else>
              <kw-btn
                v-if="summary?.cntrBas?.cntrTpCd === CNTR_TP_CD.QUOTE"
                :label="$t('MSG_BTN_QUOT_CMPL')"
                class="ml8"
                primary
                @click="onClickConfirmQuote"
              />
              <kw-btn
                v-else
                :label="$t('MSG_BTN_NEXT')"
                class="ml8"
                primary
                @click="onClickNext"
              />
            </template>
          </template>
          <template v-if="currentStepIndex === 2">
            <kw-btn
              :label="$t('MSG_BTN_TEMP_SAVE')"
              class="ml8"
              @click="onClickTempSave"
            />
            <kw-btn
              :label="$t('MSG_BTN_NEXT')"
              class="ml8"
              primary
              @click="onClickNext"
            />
          </template>
          <template v-if="currentStepIndex === 3">
            <kw-btn
              :label="$t('MSG_BTN_TEMP_SAVE')"
              class="ml8"
              @click="onClickTempSave"
            />
            <kw-btn
              v-if="currentStepIndex === 3"
              :label="$t('MSG_BTN_WRTE_FSH')"
              class="ml8"
              primary
              @click="onClickNext"
            />
          </template>
        </div>
      </div>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal } from 'kw-lib';
import { warn } from 'vue';
import { CNTR_TP_CD } from '~sms-wells/contract/constants/ctConst';
import WwctaContractRegistrationMgtMStep1 from './WwctaContractRegistrationMgtMStep1.vue';
import WwctaContractRegistrationMgtMStep2 from './WwctaContractRegistrationMgtMStep2.vue';
import WwctaContractRegistrationMgtMStep3 from './WwctaContractRegistrationMgtMStep3.vue';
import WwctaContractRegistrationMgtMStep4 from './WwctaContractRegistrationMgtMStep4.vue';
import WwctaContractRegistrationMgtMSummary from './WwctaContractRegistrationMgtMSummary.vue';

const props = defineProps({
  resultDiv: { type: String, default: undefined },
  cntrNo: { type: String, default: undefined },
  cntrSn: { type: String, default: undefined },
  cntrPrgsStatCd: { type: String, default: undefined },
  pspcCstId: { type: String, default: undefined },
  cntrCstNo: { type: String, default: '030819137' },
});

const { t } = useI18n();
const { alert } = useGlobal();
const dataService = useDataService();
const router = useRouter();

async function validateProps() {
  const { cntrNo, cntrPrgsStatCd, pspcCstId, resultDiv, cntrSn } = props;
  if (pspcCstId && (cntrNo || cntrPrgsStatCd)) {
    await alert('가망고객 대상 계약은 계약번호를 먼저 가질 수 없습니다.');
    return false;
  }
  if (resultDiv === '2' && !cntrSn) {
    await alert('재계약 대상 계약은 계약일련번호가 필요합니다.');
    return false;
  }
  return true;
}

if (!await validateProps()) {
  throw Error('비정상 접근입니다.');
}

const steps = [
  { name: 'step1', title: '계약자정보입력', done: ref(false), panel: WwctaContractRegistrationMgtMStep1, ref: ref() },
  { name: 'step2', title: '상품선택', done: ref(false), panel: WwctaContractRegistrationMgtMStep2, ref: ref() },
  { name: 'step3', title: '배송 및 결제 정보 등록', done: ref(false), panel: WwctaContractRegistrationMgtMStep3, ref: ref() },
  { name: 'step4', title: '작성정보 확인', done: ref(false), panel: WwctaContractRegistrationMgtMStep4, ref: ref() },
];
const currentStepName = ref('step1');
const currentStep = computed(() => steps.find((step) => step.name === currentStepName.value));
const currentStepRef = computed(() => currentStep.value?.ref.value);
const currentStepIndex = computed(() => steps.findIndex((step) => step.name === currentStepName.value));
const prevStep = computed(() => (currentStepIndex.value > 0
  ? steps[currentStepIndex.value - 1]
  : undefined));
const nextStep = computed(() => (currentStepIndex.value < steps.length
  ? steps[currentStepIndex.value + 1]
  : undefined));

const contract = ref({});
const summary = ref({});

const updateSummary = () => {
  console.log('updateSummary');
  const { step1, step2, step3, step4 } = contract.value;
  const smr = {};
  smr.cntrBas = {
    ...step1?.bas,
    ...step2?.bas,
    ...step3?.bas,
    ...step4?.bas,
  };
  if (props.cntrTpCd === '09') {
    smr.cntrBas.cntrTpCd = '09'; // 이전계약정보 확인 이후 재설정
  }
  if (step2?.dtls?.length) {
    smr.cntrDtls = step2.dtls;
  }
  if (step3?.dtls?.length) {
    smr.cntrDtls = step3.dtls;
  }
  if (step4?.dtls?.length) {
    smr.cntrDtls = step4.dtls;
  }
  smr.customer = {
    ...step1?.cntrt,
    ...step2?.cntrt,
    ...step3?.cntrt,
    ...step4?.cntrt,
  };
  smr.partner = {
    ...step1?.prtnr,
    ...step2?.prtnr,
    ...step3?.prtnr,
    ...step4?.prtnr,
  };
  smr.branchManager = {
    ...step1?.prtnr7,
    ...step4?.prtnr7,
  };
  smr.cntrtAdrpc = step3?.basAdrpc;
  smr.stlmDtls = step4?.stlmDtls;
  summary.value = smr;
  console.log('updateSummary', smr);
};
watch(currentStepName, updateSummary);
watch(() => contract.value?.step2?.dtls?.length, updateSummary);

function setupContract() {
  contract.value = {
    cntrNo: props.cntrNo ?? '', /* 기존 계약을 불러오는 경우 이를 바탕으로 갑니다. */
    rstlCntrNo: props.cntrNo ?? '', /* 재계약의 경우 이를 사용하여 기 계약을 불러옵니다. */
    rstlCntrSn: props.cntrSn ?? '', /* 재계약의 경우 이를 사용하여 기 계약을 불러옵니다. */
    cntrTpCd: '',
    step1: {},
    step2: {},
    step3: {},
    step4: {},
    smr: {},
  };
  updateSummary();
}

setupContract();

const isCnfmCntr = ref(false);
const isRstlCntr = ref(props.resultDiv === '2');
const isCnfmPds = ref(false); // step2 상품확정여부
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

function showStep(step) {
  [0, 1, 2].forEach((n) => {
    if (n < step - 1) {
      steps[n].done.value = true;
    }
  });
  currentStepName.value = `step${step}`;
}

async function fetchProspectContract() {
  const { pspcCstId } = props;
  const { data } = await dataService.get('sms/wells/contract/contracts/prospect-contract', { params: { pspcCstId } });
  const { pspcCstBas, cntrt, prtnr } = data;
  contract.value.step1.pspcCstBas = pspcCstBas;
  contract.value.step1.bas.pspcCstId = pspcCstId;
  if (cntrt) { contract.value.step1.cntrt = cntrt; }
  contract.value.step1.prtnr = prtnr;
  contract.value.step1.bas.sellInflwChnlDtlCd = prtnr?.sellInflwChnlDtlCd;
}

async function getExistedCntr() {
  const { cntrNo, cntrPrgsStatCd } = props;
  if (!cntrNo || !cntrPrgsStatCd) {
    await currentStepRef.value?.initStep?.();
    updateSummary();
    return;
  }
  isCnfmCntr.value = props.cntrPrgsStatCd > 20;
  let step = {
    10: 1,
    12: 2,
    14: 3,
  }[props.cntrPrgsStatCd] || 4;
  if (isRstlCntr.value) {
    step = 4;
  }
  showStep(step);
  await currentStepRef.value?.initStep?.(true);

  updateSummary();
  isCnfmPds.value = false;
}

async function onClickPrevious() {
  if (!prevStep.value) {
    return;
  }
  if (currentStepRef.value?.loaded) {
    currentStepRef.value.loaded = false;
    if (contract.value[currentStepName.value]) {
      contract.value[currentStepName.value] = {};
    }
  }

  currentStepName.value = prevStep.value.name;
}

async function onClickTempSave() {
  console.log(currentStepRef.value);
  if (!currentStepRef.value) {
    return;
  }
  if (!await currentStepRef.value.isChangedStep()) {
    await alert(t('MSG_ALT_NO_CHG_CNTN'));
    return;
  }

  if (await currentStepRef.value.isValidStep()) {
    await currentStepRef.value.saveStep(true);
  }
}

function onContractModified() {
  if (currentStepName.value === 'step2') {
    isCnfmPds.value = false;
  }
}

async function onClickPdCnfm() {
  if (currentStep.value.name !== 'step2') {
    warn('잘못된 상품확정 호출입니다.');
    return;
  }
  if (await currentStepRef.value.confirmProducts()) {
    isCnfmPds.value = true;
  }
}

async function onClickConfirmQuote() {
  if (currentStepName.value !== 'step2' || summary.value?.cntrBas?.cntrTpCd !== CNTR_TP_CD.QUOTE) {
    warn('견적서 확인 버튼 등장 조건을 확인하세요.');
    return;
  }

  if (currentStepRef.value.isValidStep && !await currentStepRef.value.isValidStep()) {
    return;
  }
  await currentStepRef.value.saveStep();

  await router.close(0, true);
  await router.push({ path: '/contract/wwcta-estimate-order-write-list' });
}

async function onClickNext() {
  if (currentStepRef.value.isValidStep && !await currentStepRef.value.isValidStep()) {
    return;
  }
  await currentStepRef.value.saveStep();
  if (!nextStep.value) {
    // step4에서 '다음'은 계약 현황 목록으로 화면 이동
    await router.close(0, true);
    await router.push({ path: '/contract/wwcta-contract-status-list' });
    return;
  }
  if (contract.value.cntrTpCd === '08') {
    steps[0].done.value = true;
    steps[1].done.value = true;
    steps[2].done.value = true;
    currentStepName.value = 'step4';
    return;
  }
  currentStep.value.done.value = true;
  currentStepName.value = nextStep.value.name;
}

async function onChildActivated(step) {
  console.log('activated', step);
}

watch(() => props.cntrNo, (newValue, oldValue) => {
  console.log('props.cntrNo watched', newValue, oldValue);
  if (newValue !== oldValue) {
    setupContract();
    updateSummary();
    getExistedCntr();
  }
});

onMounted(() => {
  const { cntrNo, cntrPrgsStatCd, pspcCstId } = props;
  if (cntrNo && cntrPrgsStatCd) {
    getExistedCntr();
  } else {
    currentStepRef.value?.initStep?.();
    if (pspcCstId) {
      fetchProspectContract().then(updateSummary);
    } else {
      updateSummary();
    }
  }
});
</script>
