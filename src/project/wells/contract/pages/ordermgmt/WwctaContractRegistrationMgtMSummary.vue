<template>
  <kw-scroll-area
    visible
  >
    <div class="px40">
      <h2 class="pt5 row items-center">
        <span>{{ cntrNo }}</span>
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
            'like-vertical-stepper__step--checked': step.done.value,
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
                :icon="step.done.value ? 'checked_stepper' : undefined"
              >
                {{ step.done.value ? undefined : index + 1 }}
              </kw-avatar>
            </kw-item-section>
            <kw-item-section>
              <kw-item-label>
                {{ step?.title || '' }}
              </kw-item-label>
            </kw-item-section>
          </template>
          <template
            v-if="index === 0"
          >
            <div class="like-vertical-stepper__step-content">
              <ul class="card-text">
                <li>
                  <p>계약유형</p>
                  <span>{{ summary.cntrTpNm }}</span>
                </li>
                <li>
                  <p>계약자</p>
                  <span>{{ summary.cntrtKnm }}</span>
                </li>
              </ul>
            </div>
          </template>
          <template
            v-else-if="index === 1"
          >
            <div class="like-vertical-stepper__step-content">
              <ul class="card-text">
                <li
                  v-for="(pd, i) in summary.products"
                  :key="i"
                >
                  <p>{{ pd }}</p>
                </li>
              </ul>
            </div>
          </template>
          <template
            v-else-if="index === 2"
          >
            <div class="like-vertical-stepper__step-content">
              <ul class="card-text">
                <li>
                  <p>결제유형</p>
                  <span>{{ summary.stlmTpNm }}</span>
                </li>
                <li>
                  <p>결제방법</p>
                  <span>{{ summary.dpTpNm }}</span>
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
                등록금(계약금)
              </p>
              <span class="text-bold kw-font-pt20">
                {{ stringUtil.getNumberWithComma(summary.rcAmt || 0) }}
              </span>
            </li>
          </ul>
          <kw-separator class="my16" />
          <ul class="card-text card-text--bigger card-text--between">
            <li>
              <p>
                월납부금
              </p>
              <span class="text-bold kw-font-pt20">
                {{ stringUtil.getNumberWithComma(summary.mpAmt || 0) }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </kw-scroll-area>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { stringUtil, useDataService } from 'kw-lib';

const props = defineProps({
  cntrNo: { type: String, default: undefined },
  steps: { type: Array, default: () => [] },
  step: { type: String, default: undefined },
});

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const sideStepRefs = reactive({});
const summary = ref({});

const currentStepName = ref('1');

async function fetchSummary() {
  if (!props.cntrNo) { return; }
  const { data } = await dataService.get('sms/wells/contract/contracts/summaries', {
    params: { cntrNo: props.cntrNo },
  });
  summary.value = data;
}

watch(() => props.step, () => {
  fetchSummary();
  if (sideStepRefs[props.step]) {
    sideStepRefs[props.step].show();
  }
});

fetchSummary();

</script>

<style lang="scss" scoped>
.contract-summary {
  padding: 20px;
  background: rgb(47 138 243 / 10%);
}
</style>
