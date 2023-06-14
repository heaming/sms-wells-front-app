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
              :done="step.done"
              :prefix="index + 1"
            />
            <kw-step-panel
              v-for="(step, index) in steps"
              :key="`step-panel-${index}`"
              :name="step.name"
            >
              <component
                :is="step.panel"
                :ref="(el) => panelsRefs[step.name] = el"
                :contract="contract"
                :on-child-mounted="onChildMounted"
                @restipulation="eventStipulation"
                @membership="eventMembership"
              />
            </kw-step-panel>
          </kw-stepper>
          <kw-separator
            spaced="0"
            vertical
          />
          <kw-scroll-area
            visible
            class="not-flexible w350"
          >
            <div class="px40">
              <h2 class="pt5 row items-center">
                <span>{{ contract.cntrNo }}</span>
                <kw-chip
                  label="임시저장"
                  color="placeholder"
                  outline
                  class="ml8"
                />
              </h2>
              <kw-list
                class="like-vertical-stepper"
                separator
              >
                <kw-expansion-item
                  v-for="(step, index) in steps"
                  :ref="(el) => sideStepRefs[step.name] = el"
                  :key="`side-item-${index}`"
                  :default-opened="index === 0"
                  class="like-vertical-stepper__step"
                  header-class="h24"
                  :class="{
                    'like-vertical-stepper__step--active': step.name === currentStepName,
                    'like-vertical-stepper__step--checked': step.done,
                  }"
                  expand-icon="none"
                >
                  <template #header>
                    <kw-item-section
                      side
                      class="pr4"
                    >
                      <kw-avatar
                        class="like-vertical-stepper__step-icon"
                        :icon="step.done ? 'checked_stepper' : undefined"
                      >
                        {{ step.done ? undefined : index + 1 }}
                      </kw-avatar>
                    </kw-item-section>
                    <kw-item-section>
                      <kw-item-label>
                        {{ step?.title || '' }}
                      </kw-item-label>
                    </kw-item-section>
                  </template>
                  <template
                    v-if="index === 0 && Object.keys(contract.step1 || {}).length !== 0"
                  >
                    <div class="like-vertical-stepper__step-content">
                      <ul class="card-text">
                        <li>
                          <p>계약유형</p>
                          <span>{{ smr.cntrTpNm }}</span>
                        </li>
                        <li>
                          <p>계약자</p>
                          <span>{{ smr.cntrtKnm }}</span>
                        </li>
                      </ul>
                    </div>
                  </template>
                  <template
                    v-else-if="index === 1 && Object.keys(contract.step2 || {}).length !== 0"
                  >
                    <div class="like-vertical-stepper__step-content">
                      <ul class="card-text">
                        <li
                          v-for="(pd, i) in smr.products"
                          :key="i"
                        >
                          <p>{{ pd.pdNm }}</p>
                        </li>
                      </ul>
                    </div>
                  </template>
                  <template
                    v-else-if="index === 2 && Object.keys(contract.step3 || {}).length !== 0"
                  >
                    <div class="like-vertical-stepper__step-content">
                      <ul class="card-text">
                        <li>
                          <p>결제유형</p>
                          <span>{{ smr.stlmTpNm }}</span>
                        </li>
                        <li>
                          <p>결제방법</p>
                          <span>{{ smr.stlmMthNm }}</span>
                        </li>
                      </ul>
                    </div>
                  </template>
                </kw-expansion-item>
              </kw-list>
              <div class="contract-summary">
                <div class="card-text">
                  <ul class="card-text card-text--bigger card-text--between">
                    <li>
                      <p>
                        상품금액
                      </p>
                      <span>
                        {{ smr.pdAmt }}
                      </span>
                    </li>
                  </ul>
                  <kw-separator class="my16" />
                  <ul class="card-text card-text--bigger card-text--between">
                    <li class="pt0">
                      <p>총 상품금액</p>
                      <span class="text-bold kw-font-pt20">0 원</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </kw-scroll-area>
        </div>
      </div>
      <div
        v-if="!isReadOnly"
        class="button-set--bottom"
      >
        <div class="button-set--bottom-left">
          <kw-btn
            v-if="currentStepIndex > 0"
            :label="$t('MSG_BTN_PREV')"
            @click="onClickPrevious"
          />
        </div>
        <div class="button-set--bottom-right">
          <template v-if="currentStepIndex === 0">
            <kw-btn
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
              :label="$t('MSG_BTN_TEMP_SAVE')"
              class="ml8"
              @click="onClickTempSave"
            />
            <kw-btn
              v-if="currentStepIndex === 1"
              :label="$t('상품확정')"
              class="ml8"
              primary
              @click="onClickNext"
            />
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
              :label="$t('작성완료')"
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
import { codeUtil, stringUtil, useDataService, useGlobal } from 'kw-lib';
import WwctaContractRegistrationMgtMStep1 from './WwctaContractRegistrationMgtMStep1.vue';
import WwctaContractRegistrationMgtMStep2 from './WwctaContractRegistrationMgtMStep2.vue';
import WwctaContractRegistrationMgtMStep3 from './WwctaContractRegistrationMgtMStep3.vue';
import WwctaContractRegistrationMgtMStep4 from './WwctaContractRegistrationMgtMStep4.vue';

const { t } = useI18n();
const { alert } = useGlobal();
const dataService = useDataService();
const router = useRouter();
const sideStepRefs = reactive({});
const panelsRefs = reactive({});
const steps = shallowReactive([
  { name: 'step1', title: '계약자정보입력', done: false, panel: WwctaContractRegistrationMgtMStep1 },
  { name: 'step2', title: '상품선택', done: false, panel: WwctaContractRegistrationMgtMStep2 },
  { name: 'step3', title: '배송 및 결제 정보 등록', done: false, panel: WwctaContractRegistrationMgtMStep3 },
  { name: 'step4', title: '작성정보 확인', done: false, panel: WwctaContractRegistrationMgtMStep4 },
]);
const currentStepName = ref('step1');
const currentStep = computed(() => steps.find((step) => step.name === currentStepName.value));
const currentStepIndex = computed(() => steps.findIndex((step) => step.name === currentStepName.value));
// 계약 현황 목록에서 진입한 경우
const props = defineProps({
  cntrNo: { type: String, required: true },
  cntrPrgsStatCd: { type: String, required: true },
});
const codes = await codeUtil.getMultiCodes(
  'CNTR_TP_CD',
  'STLM_TP_CD',
);
codes.DP_TP_CD = [
  { codeId: '0201', codeName: '카드' },
  { codeId: '0101', codeName: '가상계좌' },
  { codeId: '0203', codeName: '카드자동이체' },
];
const contract = ref({
  cntrNo: '',
  step1: {},
  step2: {},
  step3: {},
  step4: {},
});
const smr = ref({
  cntrTpNm: computed(() => codes.CNTR_TP_CD.find((c) => c.codeId === contract.value.step1.bas?.cntrTpCd)?.codeName),
  cntrtKnm: computed(() => contract.value.step1.cntrt?.cstKnm),
  products: computed(() => contract.value.step2.dtls),
  stlmTpNm: computed(() => codes.STLM_TP_CD.find((c) => c.codeId === contract.value.step3.stlmTpCd)?.codeName),
  stlmMthNm: computed(() => codes.DP_TP_CD.find((c) => c.codeId === contract.value.step3.cntramDpTpCd)?.codeName),
  pdAmt: computed(() => stringUtil.getNumberWithComma(
    Number(contract.value.step2.dtls?.reduce((acc, cur) => Number(acc) + Number(cur.fnlAmt), 0)) || 0,
  )),
});
const isReadOnly = ref(false);
const stepsStatus = reactive([false, false, false, false]);
watch(currentStepName, (value) => {
  console.log(value);
  // sideStepRefs[value].show();
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
function onChildMounted(step) {
  // 하위화면 로딩완료 여부 확인, defineExpose 시점문제로 delay 1 할당
  setTimeout(() => {
    stepsStatus[step - 1] = true;
  }, 1);
}
function showStep(step) {
  [0, 1, 2].forEach((n) => {
    if (n < step - 1) {
      steps[n].done = true;
    } else {
      return false;
    }
  });
  currentStepName.value = `step${step}`;
}
async function getCntrInfo(step, cntrNo) {
  if (step === 2) {
    // step2일 때 상품 조회
    await panelsRefs[currentStepName.value].getProducts(cntrNo);
  }
  await panelsRefs[currentStepName.value].getCntrInfo(cntrNo);
}

async function getExistedCntr() {
  const { cntrNo, cntrPrgsStatCd } = props;
  if (!cntrNo || !cntrPrgsStatCd) return;
  isReadOnly.value = props.cntrPrgsStatCd > 20;
  const step = {
    10: 1,
    12: 2,
    14: 3,
  }[props.cntrPrgsStatCd] || 4;
  showStep(step);
  // 기존계약 조회하는 경우에는 summary 따로 조회 필요
  const smrs = await dataService.get('sms/wells/contract/contracts/summaries', { params: { cntrNo } });
  // contract.value = smrs.data;
  if (step >= 1) contract.value.step1 = smrs.data.step1;
  if (step >= 2) contract.value.step2 = smrs.data.step2;
  if (step >= 3) contract.value.step3 = smrs.data.step3;
  if (step >= 4) contract.value.step4 = smrs.data.step4;
  await getCntrInfo(step, cntrNo);
}

async function onClickPrevious() {
  if (currentStepIndex.value === 0) { return; }
  const previousStep = steps[currentStepIndex.value - 1];
  // contract.value[currentStepName.value] = {};
  currentStepName.value = previousStep.name;
  await getCntrInfo(currentStepIndex.value + 1, contract.value.cntrNo);
}

async function onClickTempSave() {
  if (await panelsRefs[currentStepName.value].isChangedStep()) {
    if (await panelsRefs[currentStepName.value].isValidStep()) {
      await panelsRefs[currentStepName.value].saveStep();
    }
  } else {
    await alert(t('MSG_ALT_NO_CHG_CNTN'));
  }
}

async function onClickNext() {
  let { cntrNo } = contract.value;
  const nextStep = currentStepIndex.value + 2;
  if (await panelsRefs[currentStepName.value].isChangedStep()) {
    if (await panelsRefs[currentStepName.value].isValidStep()) {
      cntrNo = await panelsRefs[currentStepName.value].saveStep();
    } else {
      return;
    }
  }
  if (nextStep > 4) {
    // step4에서 '다음'은 계약 현황 목록으로 화면 이동
    await router.close(0, true);
    await router.push({ path: '/contract/wwcta-contract-status-list' });
  } else {
    currentStep.value.done = true;
    if (currentStepIndex.value === steps.length - 1) { return; }
    const nextStepObj = steps[currentStepIndex.value + 1];
    currentStepName.value = nextStepObj.name;
    // sideStepRefs[nextStep.name].show(); /* 명시적으로 열어주는 것도 좋을 듯 합니다. */
    await getCntrInfo(nextStep, cntrNo);
  }
}

async function eventStipulation(cntrNo, cntrSn) {
  // 재약정계약
  console.log(cntrNo);
  const previousStep = steps[3];
  currentStepName.value = previousStep.name;
  await panelsRefs[currentStepName.value].setRestipulation(true, cntrSn);
  console.log(currentStepName.value);

  await getCntrInfo(3, cntrNo);
}

async function eventMembership() {
  // 멤버십계약
}

watch(stepsStatus, () => {
  // child 화면까지 완료되면 onMounted의 역할을 할 함수 수행
  if (stepsStatus.every((s) => s)) {
    getExistedCntr();
  }
});
</script>

<style lang="scss" scoped>
.contract-summary {
  padding: 20px;
  background: rgb(47 138 243 / 10%);
}
</style>
