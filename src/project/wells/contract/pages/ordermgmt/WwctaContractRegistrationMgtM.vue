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
                  <div class="like-vertical-stepper__step-content">
                    <ul class="card-text">
                      <li>
                        <p>계약유형</p>
                        <span>{{ step1?.bas?.cntrTpNm }}</span>
                      </li>
                      <li>
                        <p>계약자</p>
                        <span>{{ step1?.cntrt?.cstKnm }}</span>
                      </li>
                      <li>
                        <p>학습자</p>
                        <span>{{ step1?.lrnr?.cstKnm }}</span>
                      </li>
                    </ul>
                  </div>
                </kw-expansion-item>
              </kw-list>
              <div class="contract-summary">
                <div class="card-text">
                  <ul class="card-text card-text--bigger card-text--between">
                    <li>
                      <p>
                        상품금액
                      </p>
                      <span>0 원</span>
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
      <div class="button-set--bottom">
        <div class="button-set--bottom-left">
          <kw-btn
            v-if="currentStepIndex > 0"
            :label="$t('MSG_BTN_PREV')"
            @click="previous"
          />
        </div>
        <div class="button-set--bottom-right">
          <template v-if="currentStepIndex === 0">
            <kw-btn
              :label="$t('MSG_BTN_TEMP_SAVE')"
              class="ml8"
              @click="onClickStep1TempSave"
            />
            <kw-btn
              v-if="currentStepIndex === 0"
              :label="$t('MSG_BTN_NEXT')"
              class="ml8"
              primary
              @click="onClickStep1Next"
            />
          </template>
          <template v-if="currentStepIndex === 1">
            <kw-btn
              :label="$t('MSG_BTN_TEMP_SAVE')"
              class="ml8"
              @click="onClickStep2TempSave"
            />
            <kw-btn
              v-if="currentStepIndex === 1"
              :label="$t('상품확정')"
              class="ml8"
              primary
              @click="onClickStep2Next"
            />
          </template>
          <template v-if="currentStepIndex === 2">
            <kw-btn
              :label="$t('MSG_BTN_TEMP_SAVE')"
              class="ml8"
              @click="onClickStep3TempSave"
            />
            <kw-btn
              :label="$t('MSG_BTN_NEXT')"
              class="ml8"
              primary
              @click="onClickStep3Next"
            />
          </template>
          <template v-if="currentStepIndex === 3">
            <kw-btn
              :label="$t('MSG_BTN_TEMP_SAVE')"
              class="ml8"
              @click="onClickStep4TempSave"
            />
            <kw-btn
              v-if="currentStepIndex === 3"
              :label="$t('작성완료')"
              class="ml8"
              primary
              @click="onClickStep4Next"
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
import { useGlobal } from 'kw-lib';
import WwctaContractRegistrationMgtMStep1 from './WwctaContractRegistrationMgtMStep1.vue';
import WwctaContractRegistrationMgtMStep2 from './WwctaContractRegistrationMgtMStep2.vue';
import WwctaContractRegistrationMgtMStep3 from './WwctaContractRegistrationMgtMStep3.vue';
import WwctaContractRegistrationMgtMStep4 from './WwctaContractRegistrationMgtMStep4.vue';

const { t } = useI18n();
const { alert } = useGlobal();
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
const contract = ref({
  cntrNo: '',
  selectedProduct: [],
  cntrCstNo: '',
  pdInfo: [],
  step1: {
    bas: {
      cntrNo: '',
    },
  },
  step2: {},
  step3: {},
  step4: {},
});

watch(currentStepName, (value) => {
  console.log(`${currentStepName.value}, value: ${value}`);
  // sideStepRefs[value].show();
});

function next() {
  currentStep.value.done = true;
  if (currentStepIndex.value === steps.length - 1) { return; }
  const nextStep = steps[currentStepIndex.value + 1];
  currentStepName.value = nextStep.name;
  // sideStepRefs[nextStep.name].show(); /* 명시적으로 열어주는 것도 좋을 듯 합니다. */
}

async function previous() {
  if (currentStepIndex.value === 0) { return; }
  await panelsRefs[steps[currentStepIndex.value - 1].name].getCntrInfo?.(contract.value.cntrNo);
  const previousStep = steps[currentStepIndex.value - 1];
  currentStepName.value = previousStep.name;
}

async function onClickStep1TempSave() {
  if (await panelsRefs[currentStepName.value].isChangedStep?.()) {
    if (await panelsRefs[currentStepName.value].isValidStep?.()) {
      await panelsRefs[currentStepName.value].saveStep?.();
    }
  } else {
    await alert(t('MSG_ALT_NO_CHG_CNTN'));
  }
}
async function onClickStep2TempSave() {
  if (await panelsRefs[currentStepName.value].isChangedStep?.()) {
    await panelsRefs[currentStepName.value].saveStep?.();
  } else {
    await alert(t('MSG_ALT_NO_CHG_CNTN'));
  }
}
async function onClickStep3TempSave() {
  if (await panelsRefs[currentStepName.value].isChangedStep?.()) {
    await panelsRefs[currentStepName.value].saveStep?.();
  } else {
    await alert(t('MSG_ALT_NO_CHG_CNTN'));
  }
}
async function onClickStep4TempSave() {
  if (await panelsRefs[currentStepName.value].isChangedStep?.()) {
    await panelsRefs[currentStepName.value].saveStep?.();
  } else {
    await alert(t('MSG_ALT_NO_CHG_CNTN'));
  }
}
async function onClickStep1Next() {
  let { cntrNo } = contract.value.step1.bas;
  if (await panelsRefs[currentStepName.value].isChangedStep?.()) {
    if (await panelsRefs[currentStepName.value].isValidStep?.()) {
      cntrNo = await panelsRefs[currentStepName.value].saveStep?.();
    } else {
      return;
    }
  }
  next();
  await panelsRefs[currentStepName.value].getCntrInfo?.(cntrNo);
  await panelsRefs[currentStepName.value].getProducts?.(cntrNo);
}
async function onClickStep2Next() {
  const { cntrNo } = contract.value.step2.bas;
  if (await panelsRefs[currentStepName.value].isChangedStep?.()) {
    if (await panelsRefs[currentStepName.value].isValidStep?.()) {
      await panelsRefs[currentStepName.value].saveStep?.();
    } else {
      return;
    }
  }
  next();
  await panelsRefs[currentStepName.value].getCntrInfo?.(cntrNo);
}
async function onClickStep3Next() {
  const { cntrNo } = contract.value.step3.bas;
  if (panelsRefs[currentStepName.value].isChangedStep?.()) {
    await panelsRefs[currentStepName.value].saveStep?.();
  }
  next();
  await panelsRefs[currentStepName.value].getCntrInfo?.(cntrNo);
}
async function onClickStep4Next() {
  if (panelsRefs[currentStepName.value].isChangedStep?.()) {
    await panelsRefs[currentStepName.value].saveStep?.();
  }
  // 계약 현황 목록으로 화면 이동
  await router.push({ path: '/contract/wwcta-contract-status-list' });
}
</script>

<style lang="scss" scoped>
.contract-summary {
  padding: 20px;
  background: rgb(47 138 243 / 10%);
}
</style>
