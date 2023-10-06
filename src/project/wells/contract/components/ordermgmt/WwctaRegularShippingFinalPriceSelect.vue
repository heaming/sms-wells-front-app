<template>
  <kw-expansion-item
    expand-icon-class="hidden"
    default-opened
    class="fit"
    header-class="scoped-item scoped-item--header"
    block-inherit-padding
  >
    <template #header>
      <kw-item-section
        class="scoped-item__section-type"
        side
      >
        <kw-item-label
          class="scoped-item__type"
        >
          {{ dtl.pdClsfNm }}
        </kw-item-label>
      </kw-item-section>
      <kw-item-section
        class="scoped-item__section-main"
      >
        <div class="scoped-item__main">
          <kw-item-label
            class="scoped-item__product-name"
          >
            {{ dtl.cstBasePdAbbrNm || dtl.pdNm }}
          </kw-item-label>

          <div class="scoped-item__chips">
            <kw-chip
              v-if="sellTpNm"
              :label="sellTpNm"
              color="primary"
              outline
            />
          </div>
          <div class="row items-center">
            <kw-item-label class="kw-fc--black3 kw-font-pt14">
              금액
            </kw-item-label>
            <kw-item-label
              class="text-black1 text-bold ml8"
            >
              {{ displayedFinalPrice }}
            </kw-item-label>
          </div>
        </div>
      </kw-item-section>
      <kw-item-section
        side
        top
      >
        <kw-item-label class="flex gap-xs">
          <kw-btn
            v-if="!isLkSding && isSeeding"
            label="기기선택"
            dense
            @click="$emit('select-machine', modelValue)"
          />
          <kw-btn
            v-if="isSeeding"
            :disable="dtl?.pdChoLmYn === 'N'"
            label="모종선택"
            dense
            @click="$emit('select-seeding', modelValue)"
          />
          <kw-btn
            v-if="isCapsule"
            :disable="dtl?.pdChoLmYn === 'N'"
            label="캡슐선택"
            dense
            @click="$emit('select-seeding', modelValue)"
          />
        </kw-item-label>
      </kw-item-section>
      <kw-item-section
        class="scoped-item__section-action"
        side
      >
        <kw-btn
          borderless
          icon="close_24"
          class="w24 kw-font-pt24"
          @click.stop="onClickDelete"
        />
      </kw-item-section>
    </template>
    <template #default>
      <kw-item
        class="scoped-item scoped-item mt12"
      >
        <kw-item-section>
          <kw-form
            class="scoped-price-form"
            :cols="0"
            :label-size="150"
          >
            <kw-form-row :cols="2">
              <kw-form-item :label="'약정기간'">
                <kw-select
                  v-if="priceDefineVariableOptions.stplPrdCd"
                  v-model="priceDefineVariables.stplPrdCd"
                  :options="priceDefineVariableOptions.stplPrdCd"
                  dense
                  placeholder="약정기간"
                  first-option="select"
                  @change="forcedChangeValidVariable"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row v-if="selectedFinalPrice">
              <kw-form-item :label="'서비스(용도/방문주기)'">
                {{ labelGenerator.svPdCd(selectedFinalPrice.svPdCd, selectedFinalPrice) }}
              </kw-form-item>
            </kw-form-row>
          </kw-form>
        </kw-item-section>
      </kw-item>
      <kw-item
        v-for="(cntrRel) in cntrRels"
        :key="cntrRel.cntrRelId"
        class="scoped-item"
      >
        <kw-item-section>
          <kw-item-label class="row no-wrap items-center">
            <kw-chip
              :label="getCodeName('CNTR_REL_DTL_CD', cntrRel.cntrRelDtlCd)"
              outline
              color="primary"
            />
            <div
              class="grow ellipsis pl8 hp-w1"
            >
              {{ cntrRel.ojBasePdBas?.pdNm }}
              <kw-tooltip show-when-ellipsised>
                {{ cntrRel.ojBasePdBas?.pdNm }}
              </kw-tooltip>
            </div>
          </kw-item-label>
        </kw-item-section>
        <kw-item-section side>
          <kw-btn
            v-if="cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_RGLR_SHP_BASE"
            borderless
            icon="close_24"
            class="w24 kw-font-pt24"
            @click="onDeleteCntrRel(cntrRel)"
          />
        </kw-item-section>
      </kw-item>
    </template>
  </kw-expansion-item>
</template>

<script setup>
import { useCtCode } from '~sms-common/contract/composable';
import { alert, useDataService } from 'kw-lib';
import { warn } from 'vue';
import { getNumberWithComma } from '~sms-common/contract/util';

const EMPTY_SYM = Symbol('__undef__');
const EMPTY_ID = ' '; /*  FIXME!!! */

const CNTR_REL_DTL_CD_LK_RGLR_SHP_BASE = '214';
const CNTR_REL_DTL_CD_LK_SDING = '216';

const props = defineProps({
  modelValue: { type: Object, default: undefined },
  bas: { type: Object, default: undefined },
});
const emit = defineEmits([
  'select-machine',
  'delete:select-machine',
  'select-seeding',
  'select-capsule',
  'one-plus-one',
  'price-changed',
  'delete',
]);

const { getCodeName } = await useCtCode(
  'SELl_TP_CD',
  'SV_TP_CD',
  'SV_VST_PRD_CD',
  'BFSVC_PRD_CD',
  'CNTR_REL_DTL_CD',
  'CNTR_REL_DTL_CD',
);
const dataService = useDataService();

const dtl = ref(props.modelValue);

/* 직간접적으로 업데이트 할 값들 */
let pdPrcFnlDtlId = toRef(props.modelValue, 'pdPrcFnlDtlId');
let verSn = toRef(props.modelValue, 'verSn');
let fnlAmt = toRef(props.modelValue, 'fnlAmt');
let cntrRels = toRef(props.modelValue, 'cntrRels');
let finalPriceOptions = toRef(props.modelValue, 'finalPriceOptions');

const isLkSding = computed(() => (cntrRels.value || [])
  .find((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_SDING));
const isSeeding = computed(() => dtl.value?.sellTpDtlCd === '62');
const isCapsule = computed(() => dtl.value?.sellTpDtlCd === '63');

const sellTpNm = computed(() => getCodeName('SELl_TP_CD', '6'));

const priceDefineVariables = ref({
  stplPrdCd: toRef(props.modelValue, 'stplPtrm'),
});

const labelGenerator = {
  svPdCd: (val, finalPrice) => {
    if (val === EMPTY_ID) { return '선택안함'; }
    const { svTpCd, svVstPrdCd, pcsvPrdCd } = finalPrice;
    const additional = [];
    if (svVstPrdCd) {
      additional.push(`방문(${getCodeName('SV_VST_PRD_CD', svVstPrdCd)})`);
    }
    if (pcsvPrdCd) {
      additional.push(`택배(${getCodeName('BFSVC_PRD_CD', pcsvPrdCd)})`);
    }
    return `${getCodeName('SV_TP_CD', svTpCd)} - ${additional.join('/')}`;
  },
  stplPrdCd: (val) => {
    if (val === EMPTY_ID) { return '선택안함'; }
    if (Number(val) === 0) {
      return '1회분';
    }
    if (Number(val) === 999) {
      return '무제한';
    }
    return `${val}개월`;
  },
};

const variableNames = Object.getOwnPropertyNames(priceDefineVariables.value);

function onDeleteCntrRel(cntrRel) {
  if (cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_RGLR_SHP_BASE) {
    emit('delete:select-machine', props.modelValue);
  }
}

async function fetchFinalPriceOptions() {
  const { data } = await dataService.get('sms/wells/contract/final-price', {
    params: {
      cntrNo: props.bas.cntrNo,
      pdCd: dtl.value.pdCd,
    },
    silent: true,
  });
  if (!data?.length) {
    alert('선택 가능한 가격 조건이 없습니다.');
  }
  finalPriceOptions.value = data || [];
}

if (!finalPriceOptions.value?.length) {
  await fetchFinalPriceOptions();
}

function reconnectReactivities() {
  pdPrcFnlDtlId = toRef(props.modelValue, 'pdPrcFnlDtlId');
  verSn = toRef(props.modelValue, 'verSn');
  fnlAmt = toRef(props.modelValue, 'fnlAmt');
  cntrRels = toRef(props.modelValue, 'cntrRels');
  finalPriceOptions = toRef(props.modelValue, 'finalPriceOptions'); /* 적용된 프로모션 */
}

async function onChangeModelValue(newDtl) {
  if (newDtl.finalPriceOptions) {
    finalPriceOptions.value = newDtl.finalPriceOptions;
  }
  if (!finalPriceOptions.value?.length) {
    await fetchFinalPriceOptions();
  }
  reconnectReactivities();
}

watch(() => props.modelValue, onChangeModelValue, { immediate: true });

function reducerFinalPriceToSelectVarDict(varDict, finalPrice, variable) {
  /*  해당 변수를 선택할 수 없으면 제한다.  */
  // if (!finalPrice[variable]) {
  //   return varSet;
  // }

  const exceptIdx = variableNames.indexOf(variable);
  if (exceptIdx < 0) {
    warn('상품가격 결정요소를 확인해보세요.');
    return false;
  }
  const anotherVariableNames = variableNames.toSpliced(exceptIdx, 1);

  const existUnmatchedOtherVar = anotherVariableNames.some((variableName) => {
    const selectedAnotherVar = priceDefineVariables.value[variableName];
    const curPriceAnotherVar = finalPrice[variableName];
    if (!selectedAnotherVar || selectedAnotherVar === EMPTY_ID) {
      return false;
    }
    return curPriceAnotherVar !== selectedAnotherVar;
  });

  if (existUnmatchedOtherVar) {
    return varDict;
  }

  const key = finalPrice[variable] ? String(finalPrice[variable]) : EMPTY_SYM;
  varDict[key] = finalPrice;

  return varDict;
}

const priceDefineVariableOptionDicts = computed(() => variableNames.reduce((options, variableName) => {
  options[variableName] = finalPriceOptions.value
    ?.reduce((varDict, finalPrice) => reducerFinalPriceToSelectVarDict(varDict, finalPrice, variableName), {});
  return options;
}, {}));

const priceDefineVariableOptions = computed(() => variableNames.reduce((mappingObj, variableName) => {
  const dict = priceDefineVariableOptionDicts.value[variableName];
  const options = [];
  if (dict[EMPTY_SYM]) {
    options.push({
      codeId: EMPTY_ID,
      codeName: labelGenerator[variableName](EMPTY_ID),
    });
  }
  Object.getOwnPropertyNames(dict)
    .forEach((key) => {
      const finalPrice = dict[key];
      options.push({
        codeId: finalPrice[variableName],
        codeName: labelGenerator[variableName]?.(finalPrice[variableName], finalPrice) || finalPrice[variableName],
      });
    });

  mappingObj[variableName] = options;
  return mappingObj;
}, {}));

function forcedChangeValidVariable(val) {
  if (!val) {
    return;
  }
  variableNames.forEach((variableName) => {
    const selectable = priceDefineVariableOptions.value[variableName]?.map((code) => code.codeId) ?? [];

    const curValue = priceDefineVariables.value[variableName];
    if (selectable.length === 1 && curValue === undefined) {
      priceDefineVariables.value[variableName] = selectable[0];
    } else if (!selectable.includes(curValue)) {
      priceDefineVariables.value[variableName] = undefined;
    }
  });
}

function filterFinalPriceByVariables(finalPrice) {
  return variableNames.every((variableName) => {
    if (!priceDefineVariableOptions.value[variableName]?.length) {
      return true;
    }
    const selected = priceDefineVariables.value[variableName] === EMPTY_ID ? undefined
      : priceDefineVariables.value[variableName];
    return finalPrice[variableName] === selected;
  });
}

const selectedFinalPrice = computed(() => {
  const selectedPrice = finalPriceOptions.value
    ?.filter(filterFinalPriceByVariables);
  if (selectedPrice.length > 1) {
    return undefined;
  }
  if (selectedPrice.length < 1) {
    return undefined;
  }
  return selectedPrice[0];
});

function initializePrice() {
  fnlAmt.value = selectedFinalPrice.value?.fnlVal ?? undefined;
  pdPrcFnlDtlId.value = selectedFinalPrice.value?.pdPrcFnlDtlId ?? undefined;
  verSn.value = selectedFinalPrice.value?.verSn ?? undefined;
}

initializePrice();

const displayedFinalPrice = computed(() => {
  if (!selectedFinalPrice.value) {
    return '미확정';
  }
  const { fnlVal, svVstPrdCd, pcsvPrdCd } = selectedFinalPrice.value ?? {};
  if (!fnlVal) {
    return '미확정';
  }
  const svPrd = Math.max(Number(svVstPrdCd) || 0, Number(pcsvPrdCd) || 0);
  if (svPrd > 1) {
    return `${getNumberWithComma(fnlVal)}원 (월 ${getNumberWithComma(fnlVal
        / svPrd)}원)`;
  }
  return `${getNumberWithComma(fnlVal)}원`;
});

watch(selectedFinalPrice, (newPrice) => {
  fnlAmt.value = newPrice?.fnlVal ?? undefined;
  pdPrcFnlDtlId.value = newPrice?.pdPrcFnlDtlId ?? undefined;
  verSn.value = newPrice?.verSn ?? undefined;
});

function onClickDelete() {
  emit('delete');
}

</script>

<style lang="scss" scoped>
@import "kw-lib/src/css/mixins";

.scoped-item {
  $-left-side-width: 68px;
  $-right-side-width: 44px;

  & :deep(> .kw-item__section) {
    &.q-item__section--side {
      min-width: $-left-side-width;
      padding-right: $spacing-xs;
    }

    &.q-item__section--main ~ .q-item__section--side {
      min-width: $-right-side-width;
      padding-right: 0;
    }

    &.q-item__section:first-of-type {
      &.q-item__section--main {
        margin-left: $-left-side-width;
      }
    }

    &.q-item__section:last-of-type {
      &.q-item__section--main {
        margin-right: $-right-side-width;
      }
    }
  }

  &__section-type {
    justify-content: flex-start;
    width: 68px;
    padding-right: $spacing-xs;
  }

  &__type {
    color: $black3;
    font-size: 14px;
    line-height: 24px !important; // quasar 부터 시작한 유구한 역사의 important.
    font-weight: normal;
    letter-spacing: normal;
  }

  &__section-main {
    justify-content: flex-start;
  }

  &__main {
    display: flex;
    flex-flow: column wrap;
    align-items: flex-start;
    gap: $spacing-xs;
  }

  &__product-name {
    @include typo("body");
  }

  &__chips {
    display: flex;
    gap: $spacing-xxs;
  }

  &__price-prev {
    @include typo("dense");

    color: $black3;
    text-decoration: line-through;
    text-align: right;
  }

  &__section-action {
    min-width: 44px;
    justify-content: flex-start;

    > .kw-btn {
      font-size: 24px;
    }
  }
}

.scoped-price-form {
  &__no-labels {
    display: flex;
    flex-flow: row wrap;

    > :is(.kw-field, .kw-field-wrap) {
      flex-grow: 1;
      width: 30%;
    }
  }

  &.kw-form {
    $-custom-form-row-height: 32px;
    $-custom-form-row-gap: 16px;
    $-custom-form-row-padding: 4px 0;
    $-custom-form-item-min-height: 32px;

    .kw-form-row {
      @include kw-row($-custom-form-row-height, $-custom-form-row-gap, $-custom-form-row-padding);
    }

    .kw-form-item {
      @include kw-item($-custom-form-item-min-height);
    }
  }
}
</style>
