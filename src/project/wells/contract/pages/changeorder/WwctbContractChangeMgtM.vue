<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbContractChangeMgtM - 계약변경
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.04.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 계약변경
****************************************************************************************************
--->
<template>
  <kw-page>
    <div
      class="normal-area normal-area--button-set-bottom"
    >
      <div class="stepper-layout-tweak-wrapper">
        <kw-stepper
          v-model="currentStepName"
          heading-text
        >
          <kw-step
            v-for="(step, index) in steps"
            :key="`step-${index}`"
            v-bind="step"
            :prefix="index + 1"
          />
          <kw-step-panel :name="steps[0].name">
            <kw-scroll-area visible>
              <div class="pr40">
                <!-- 이쯤에서 컴포넌트 분리하면 됩니다.-->
                <kw-search :cols="3">
                  <kw-search-row>
                    <kw-search-item
                      :label="$t('MSG_TXT_CONTR_TYPE')"
                      required
                    >
                      <kw-select
                        :model-value="[]"
                        :options="['A', 'B', 'C', 'D']"
                        rules="required"
                      />
                    </kw-search-item>
                    <kw-search-item
                      :label="$t('MSG_TXT_CONTRACTOR_TYPE')"
                      required
                    >
                      <kw-select
                        :model-value="[]"
                        :options="['A', 'B', 'C', 'D']"
                        rules="required"
                      />
                    </kw-search-item>
                    <kw-search-item :label="$t('MSG_TXT_NAME')">
                      <kw-input />
                    </kw-search-item>
                  </kw-search-row>
                  <kw-search-row>
                    <kw-search-item
                      :label="$t('MSG_TXT_MPNO')"
                      required
                    >
                      <zwcm-telephone-number rules="required" />
                    </kw-search-item>
                    <kw-search-item
                      :label="$t('MSG_TXT_BIRTH_DATE')"
                      required
                    >
                      <kw-date-picker rule="required" />
                    </kw-search-item>
                    <kw-search-item
                      :label="$t('MSG_TXT_GEND_DIV')"
                      required
                    >
                      <kw-option-group
                        :model-value="'남'"
                        type="radio"
                        :options="['남', '여']"
                        rules="required"
                      />
                    </kw-search-item>
                  </kw-search-row>
                  <kw-search-row>
                    <kw-search-item :label="$t('MSG_TXT_CNTR_DV')">
                      <kw-field :model-value="[]">
                        <template #default="{ field }">
                          <kw-checkbox
                            v-bind="field"
                            :label="$t('MSG_TXT_SEA_ONLY_PEXT_CNTR')"
                            val=""
                          />
                        </template>
                      </kw-field>
                    </kw-search-item>
                  </kw-search-row>
                </kw-search>
                <h3>
                  {{ t('MSG_TXT_CONTR_INFO_INDIV') }}
                </h3>
                <kw-form
                  :cols="2"
                  dense
                >
                  <kw-form-row>
                    <kw-form-item :label="$t('MSG_TXT_CNTRT')">
                      <p>김엄마 / 1988-03-03 / 여</p>
                    </kw-form-item>
                    <kw-form-item
                      :label="$t('MSG_TXT_IDENT_VERF')"
                      hint="s"
                    >
                      <p>{{ t('MSG_TXT_IDENT_VERF_COMPL') }}</p>
                    </kw-form-item>
                  </kw-form-row>
                  <kw-form-row>
                    <kw-form-item :label="$t('MSG_TXT_CST_NO')">
                      <p>123456789</p>
                    </kw-form-item>
                    <kw-form-item
                      :label="$t('MSG_TXT_REF_MIL')"
                      hint="a"
                    >
                      <p>1,000,000</p>
                    </kw-form-item>
                  </kw-form-row>
                  <kw-form-row>
                    <kw-form-item
                      :label="$t('MSG_TXT_K_MON')"
                      hint="a"
                    >
                      <p>1,000,000</p>
                    </kw-form-item>
                    <kw-form-item
                      :label="$t('MSG_TXT_K_MALL_CASH')"
                      hint="a"
                    >
                      <p>1,000,000</p>
                    </kw-form-item>
                  </kw-form-row>
                  <kw-form-row>
                    <kw-form-item :label="$t('MSG_TXT_MPNO')">
                      <p>
                        010-1234-1234
                      </p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_ADDR')">
                      <p>
                        06617 (주소코드 : 23456789)<br>
                        서울 서초구 서초대로 385 진흥 아파트 D동 1301
                      </p>
                    </kw-form-item>
                  </kw-form-row>
                </kw-form>
                <kw-separator />
                <h3>학습자</h3>
                <kw-action-top>
                  <template #left>
                    <kw-paging-info :total-count="1" />
                  </template>
                  <kw-btn
                    :label="$t('MSG_BTN_MOD')"
                    secondary
                    dense
                  />
                  <kw-btn
                    :label="$t('MSG_BTN_ADD_LEARNER')"
                    secondary
                    dense
                  />
                </kw-action-top>
                <kw-list
                  separator
                  item-padding="20px 0"
                >
                  <kw-expansion-item
                    group="list-group"
                    padding-target="header"
                    expansion-icon-align="center"
                    expand-icon-class="kw-font-pt24"
                  >
                    <template #header>
                      <kw-item-section>
                        <kw-item-label class="row items-center">
                          <kw-radio
                            label="김첫째 / 1988-03-03 / 여"
                            val=""
                          />
                          <kw-chip
                            :label="$t('MSG_TXT_CHILD')"
                            square
                            color="primary"
                            text-color="primary"
                            class="ml8"
                          />
                        </kw-item-label>
                      </kw-item-section>
                    </template>
                    <div class="kw-bc--bg-box px40 py20">
                      <kw-form
                        :cols="2"
                      >
                        <kw-form-row>
                          <kw-form-item :label="$t('MSG_TXT_GENDER')">
                            <p class="text-bold">
                              여
                            </p>
                          </kw-form-item>
                          <kw-form-item :label="$t('MSG_TXT_AGE_YR')">
                            <p class="text-bold">
                              10
                            </p>
                          </kw-form-item>
                        </kw-form-row>
                        <kw-form-row>
                          <kw-form-item :label="$t('MSG_TXT_CST_NO')">
                            <p class="text-bold">
                              123456789
                            </p>
                          </kw-form-item>
                          <kw-form-item :label="$t('MSG_TXT_CLASS')">
                            <p class="text-bold">
                              3
                            </p>
                          </kw-form-item>
                        </kw-form-row>
                        <kw-form-row>
                          <kw-form-item :label="$t('MSG_TXT_HUND_PT_MEM_INFO')">
                            <kw-input />
                          </kw-form-item>
                          <kw-form-item :label="$t('MSG_TXT_MPNO')">
                            <p class="text-bold">
                              010-1234-1234
                            </p>
                          </kw-form-item>
                        </kw-form-row>
                        <kw-form-row>
                          <kw-form-item :label="$t('MSG_TXT_ADDR')">
                            <p class="text-bold">
                              06617 (주소코드 : 23456789)<br>
                              서울 서초구 서초대로 385 진흥 아파트 D동1301
                            </p>
                          </kw-form-item>
                        </kw-form-row>
                      </kw-form>
                    </div>
                  </kw-expansion-item>
                  <kw-expansion-item
                    group="list-group"
                    padding-target="header"
                    expansion-icon-align="center"
                    expand-icon-class="kw-font-pt24"
                  >
                    <template #header>
                      <kw-item-section>
                        <kw-item-label class="row items-center">
                          <kw-radio
                            label="김둘째 / 1988-03-03 / 여"
                            val=""
                          />
                          <kw-chip
                            :label="$t('MSG_TXT_CHILD')"
                            square
                            color="primary"
                            text-color="primary"
                            class="ml8"
                          />
                        </kw-item-label>
                      </kw-item-section>
                    </template>
                    <div class="kw-bc--bg-box px40 py20">
                      <kw-form
                        :cols="2"
                      >
                        <kw-form-row>
                          <kw-form-item :label="$t('MSG_TXT_GENDER')">
                            <p class="text-bold">
                              여
                            </p>
                          </kw-form-item>
                          <kw-form-item :label="$t('MSG_TXT_AGE_YR')">
                            <p class="text-bold">
                              10
                            </p>
                          </kw-form-item>
                        </kw-form-row>
                        <kw-form-row>
                          <kw-form-item :label="$t('MSG_TXT_CST_NO')">
                            <p class="text-bold">
                              123456789
                            </p>
                          </kw-form-item>
                          <kw-form-item :label="$t('MSG_TXT_CLASS')">
                            <p class="text-bold">
                              3
                            </p>
                          </kw-form-item>
                        </kw-form-row>
                        <kw-form-row>
                          <kw-form-item :label="$t('MSG_TXT_HUND_PT_MEM_INFO')">
                            <kw-input />
                          </kw-form-item>
                          <kw-form-item :label="$t('MSG_TXT_MPNO')">
                            <p class="text-bold">
                              010-1234-1234
                            </p>
                          </kw-form-item>
                        </kw-form-row>
                        <kw-form-row>
                          <kw-form-item :label="$t('MSG_TXT_ADDR')">
                            <p class="text-bold">
                              06617 (주소코드 : 23456789)<br>
                              서울 서초구 서초대로 385 진흥 아파트 D동1301
                            </p>
                          </kw-form-item>
                        </kw-form-row>
                      </kw-form>
                    </div>
                  </kw-expansion-item>
                </kw-list>
              </div>
            </kw-scroll-area>
          </kw-step-panel>
          <kw-step-panel :name="steps[1].name">
            <kw-scroll-area visible>
              <div class="pr40">
                <kw-search :cols="3">
                  <kw-search-row>
                    <kw-search-item
                      :label="$t('MSG_TXT_CONTR_TYPE')"
                      required
                    >
                      <kw-select
                        :model-value="[]"
                        :options="['A', 'B', 'C', 'D']"
                        rules="required"
                      />
                    </kw-search-item>
                    <kw-search-item
                      :label="$t('MSG_TXT_CONTRACTOR_TYPE')"
                      required
                    >
                      <kw-select
                        :model-value="[]"
                        :options="['A', 'B', 'C', 'D']"
                        rules="required"
                      />
                    </kw-search-item>
                    <kw-search-item :label="$t('MSG_TXT_NAME')">
                      <kw-input />
                    </kw-search-item>
                  </kw-search-row>
                  <kw-search-row>
                    <kw-search-item
                      :label="$t('MSG_TXT_MPNO')"
                      required
                    >
                      <zwcm-telephone-number rules="required" />
                    </kw-search-item>
                    <kw-search-item
                      :label="$t('MSG_TXT_BIRTH_DATE')"
                      required
                    >
                      <kw-date-picker rule="required" />
                    </kw-search-item>
                    <kw-search-item
                      :label="$t('MSG_TXT_GEND_DIV')"
                      required
                    >
                      <kw-option-group
                        :model-value="'남'"
                        type="radio"
                        :options="['남', '여']"
                        rules="required"
                      />
                    </kw-search-item>
                  </kw-search-row>
                  <kw-search-row>
                    <kw-search-item :label="$t('MSG_TXT_CNTR_DV')">
                      <kw-field :model-value="[]">
                        <template #default="{ field }">
                          <kw-checkbox
                            v-bind="field"
                            :label="$t('MSG_TXT_SEA_ONLY_PEXT_CNTR')"
                            val=""
                          />
                        </template>
                      </kw-field>
                    </kw-search-item>
                  </kw-search-row>
                </kw-search>
                <h3>{{ t('MSG_TXT_CONTR_INFO_INDIV') }}</h3>
                <kw-form
                  :cols="2"
                  dense
                >
                  <kw-form-row>
                    <kw-form-item :label="$t('MSG_TXT_CNTRT')">
                      <p>김엄마 / 1988-03-03 / 여</p>
                    </kw-form-item>
                    <kw-form-item
                      :label="$t('MSG_TXT_IDENT_VERF')"
                      hint="s"
                    >
                      <p>본인인증완료</p>
                    </kw-form-item>
                  </kw-form-row>
                  <kw-form-row>
                    <kw-form-item :label="$t('MSG_TXT_CST_NO')">
                      <p>123456789</p>
                    </kw-form-item>
                    <kw-form-item
                      :label="$t('MSG_TXT_REF_MIL')"
                      hint="a"
                    >
                      <p>1,000,000</p>
                    </kw-form-item>
                  </kw-form-row>
                  <kw-form-row>
                    <kw-form-item
                      :label="$t('MSG_TXT_K_MON')"
                      hint="a"
                    >
                      <p>1,000,000</p>
                    </kw-form-item>
                    <kw-form-item
                      :label="$t('MSG_TXT_K_MALL_CASH')"
                      hint="a"
                    >
                      <p>1,000,000</p>
                    </kw-form-item>
                  </kw-form-row>
                  <kw-form-row>
                    <kw-form-item :label="$t('MSG_TXT_MPNO')">
                      <p>
                        010-1234-1234
                      </p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_ADDR')">
                      <p>
                        06617 (주소코드 : 23456789)<br>
                        서울 서초구 서초대로 385 진흥 아파트 D동 1301
                      </p>
                    </kw-form-item>
                  </kw-form-row>
                </kw-form>
                <kw-separator />
                <h3>{{ t('MSG_TXT_LRNR') }}</h3>
                <kw-action-top>
                  <template #left>
                    <kw-paging-info :total-count="1" />
                  </template>
                  <kw-btn
                    :label="$t('MSG_BTN_MOD')"
                    secondary
                    dense
                  />
                  <kw-btn
                    :label="$t('MSG_BTN_ADD_LEARNER')"
                    secondary
                    dense
                  />
                </kw-action-top>
                <kw-list
                  v-model:selected="selectedStudent"
                  class="student-list"
                  :items="students"
                  item-key="cstNo"
                  radio
                  separator
                  expansion
                  item-padding="20px 0"
                  padding-target="header"
                >
                  <template #item="{ item }">
                    <kw-item-section>
                      <kw-item-label
                        class="row items-center text-black2"
                        font-weight="400"
                      >
                        {{ `${item.name} / ${item.birth} / ${item.gender}` }}
                        <kw-chip
                          :label="$t('MSG_TXT_CHILD')"
                          square
                          color="primary"
                          text-color="primary"
                          class="ml8"
                        />
                      </kw-item-label>
                    </kw-item-section>
                  </template>
                  <template #expansion>
                    <div class="kw-bc--bg-box px40 py20">
                      <kw-form
                        :cols="2"
                      >
                        <kw-form-row>
                          <kw-form-item :label="$t('MSG_TXT_GENDER')">
                            <p class="text-bold">
                              여
                            </p>
                          </kw-form-item>
                          <kw-form-item :label="$t('MSG_TXT_AGE_YR')">
                            <p class="text-bold">
                              10
                            </p>
                          </kw-form-item>
                        </kw-form-row>
                        <kw-form-row>
                          <kw-form-item :label="$t('MSG_TXT_CST_NO')">
                            <p class="text-bold">
                              123456789
                            </p>
                          </kw-form-item>
                          <kw-form-item :label="$t('MSG_TXT_CLASS')">
                            <p class="text-bold">
                              3
                            </p>
                          </kw-form-item>
                        </kw-form-row>
                        <kw-form-row>
                          <kw-form-item :label="$t('MSG_TXT_HUND_PT_MEM_INFO')">
                            <kw-input />
                          </kw-form-item>
                          <kw-form-item :label="$t('MSG_TXT_MPNO')">
                            <p class="text-bold">
                              010-1234-1234
                            </p>
                          </kw-form-item>
                        </kw-form-row>
                        <kw-form-row>
                          <kw-form-item :label="$t('MSG_TXT_ADDR')">
                            <p class="text-bold">
                              06617 (주소코드 : 23456789)<br>
                              서울 서초구 서초대로 385 진흥 아파트 D동1301
                            </p>
                          </kw-form-item>
                        </kw-form-row>
                      </kw-form>
                    </div>
                  </template>
                </kw-list>
              </div>
            </kw-scroll-area>
          </kw-step-panel>
        </kw-stepper>
        <kw-separator
          spaced="0"
          vertical
        />
        <div class="not-flexible">
          <kw-scroll-area
            visible
            width="350px"
          >
            <div class="px40">
              <h2 class="pt5">
                <div class="row items-center">
                  E2022-1234567
                  <kw-chip
                    :label="$t('MSG_TXT_TEMP_SAVE')"
                    color="placeholder"
                    outline
                    class="ml8"
                  />
                </div>
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
                        size="20px"
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
                        <p>{{ t('MSG_TXT_CONTR_TYPE') }}</p>
                        <span>
                          {{ t('MSG_TXT_INDV') }}
                        </span>
                      </li>
                      <li>
                        <p>{{ t('MSG_TXT_CNTRT') }}</p>
                        <span>김엄마</span>
                      </li>
                      <li>
                        <p>{{ t('MSG_TXT_LRNR') }}</p>
                        <span>이둘째</span>
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
                        {{ t('MSG_TXT_PRDT_AMT') }}
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
        <div class="button-set--bottom-right">
          <kw-btn
            :label="$t('MSG_BTN_TEMP_SAVE')"
            class="ml8"
            @click="currentStepName = steps[0].name"
          />
          <kw-btn
            :label="$t('MSG_BTN_NEXT')"
            class="ml8"
            primary
            @click="next"
          />
        </div>
      </div>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
const { t } = useI18n();
const sideStepRefs = reactive({});

const steps = ref([
  { name: 'contractor', title: '계약자정보입력', done: false },
  { name: 'selectProduct', title: '상품선택', done: false },
  { name: 'delivery', title: '배송 및 결재 정보 등록', done: false },
  { name: 'confirm', title: '작성정보 확인', done: false },
]);
const currentStepName = ref('contractor');
const currentStep = computed(() => steps.value.find((step) => step.name === currentStepName.value));
watch(currentStepName, (value) => {
  sideStepRefs[value].show();
});

/* 패널 내로 분리해주세요. */
const selectedStudent = ref(null);
const students = ref([
  { cstNo: 1234856789, name: '김첫째', gender: '여', birth: '1988-03-03', grade: 3 },
  { cstNo: 1234856790, name: '김둘째', gender: '남', birth: '1988-03-03', grade: 3 },
]);

function next() {
  currentStep.value.done = true;
  const currentStepIndex = steps.value.findIndex((step) => step.name === currentStepName.value);
  if (currentStepIndex === steps.value.length - 1) { return; }
  const nextStep = steps.value[currentStepIndex + 1];
  currentStepName.value = nextStep.name;
  sideStepRefs[nextStep.name].show(); /* 명시적으로 열어주는 것도 좋을 듯 합니다. */
}
</script>

<style lang="scss" scoped>
@import "kw-lib/src/css/mixins";

.normal-area--button-set-bottom {
  max-height: calc(100vh - 222px);
  min-height: 715px;
}

.stepper-layout-tweak-wrapper {
  position: relative;
  padding-top: calc(74px + 30px);
  display: flex;
  flex-flow: row nowrap;
  height: calc(74px + 30px + 520px);

  :deep(.kw-stepper) {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  :deep(.kw-stepper__panels) {
    flex: auto;
  }
}

.like-vertical-stepper {
  $block: &;

  padding-top: 8px;

  &.kw-list.q-list--separator {
    // :deep(> .q-expansion-item:last-child.q-item-type) {
    //   border-bottom: none; // remove last separator
    // }
  }

  &__step {
    color: $black3;
    padding: 12px 0;

    &--active {
      @include typo("body");

      color: $secondary;

      #{$block}__step-icon.kw-avatar {
        &::after {
          display: none;
        }

        background: $secondary;
        color: $bg-white;
      }
    }

    // checked is stronger then active
    &--checked {
      #{$block}__step-icon.kw-avatar {
        &::after {
          display: none;
        }

        background: $line-bg;
        color: $black3;
      }
    }

    &--summary {
      border-top: none !important; /* remove separator */
      padding: 20px;
      background: rgb(47 138 243 / 10%);
    }
  }

  &__step-icon.kw-avatar {
    &::after {
      content: "";
      border: 1px solid $line-stroke;
      position: absolute;
      inset: 0;
      border-radius: 50%;
    }

    :deep(.q-avatar__content) {
      @include typo("dense");

      line-height: 1.4;
    }
  }

  &__step-content {
    background: $bg-box;
    margin-top: 12px;
    padding: 12px 20px;
  }
}

.contract-summary {
  padding: 20px;
  background: rgb(47 138 243 / 10%);
}

.student-list.kw-list {
  // :deep(.kw-item__section.q-item__section--side) {
  //   padding-right: 8px;
  // }
}
</style>
