<template>
  <kw-item
    v-if="promotions?.length"
    class="scoped-item scoped-item--data-modifier"
  >
    <kw-item-section>
      <div class="row no-wrap items-center gap-xs">
        <kw-item-label
          font="body"
          class="kw-fc--black1 grow"
        >
          {{ `프로모션` }}
        </kw-item-label>
      </div>
    </kw-item-section>
    <kw-item-section side />
  </kw-item>
  <promotion
    v-for="(promotion) in singlePromotions"
    :key="`promotion-${promotion.pmotCd}-${promotion.pmotCndtFvrRelId}`"
    :promotion="promotion"
    @change-applied="((applied) => {promotion.applied = applied})"
  />
  <template
    v-for="(grouped) in groupingPromotions"
    :key="`grouped-${grouped.pmotApyGrpCd}`"
  >
    <kw-item
      class="scoped-item scoped-item--data-modifier"
    >
      <kw-item-section>
        <div class="row no-wrap items-center gap-xs">
          <kw-item-label
            font="dense"
            class="kw-fc--black1 grow"
          >
            {{ getCodeName('PMOT_APY_GRP_CD', grouped.pmotApyGrpCd) }}
          </kw-item-label>
          <kw-btn-toggle
            v-if="grouped.pmotApyOptCds"
            v-model="grouped.pmotApyOptCd"
            dense
            :options="grouped.pmotApyOptCds"
            @change="onChangePmotApyOptCd"
          />
        </div>
      </kw-item-section>
      <kw-item-section side />
    </kw-item>
    <promotion
      v-for="(promotion) in groupingPromotionDict[grouped.pmotApyGrpCd][grouped.pmotApyOptCd]"
      :key="`promotion-${promotion.pmotCd}-${promotion.pmotCndtFvrRelId}`"
      :promotion="promotion"
    />
  </template>
</template>

<script setup>
import UseCtCode from '~sms-common/contract/composable/useCtCode';
import Promotion from './WwctaPromotion.vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  promotions: { type: Array, default: () => [] },
});

const emit = defineEmits([
  'update:model-value',
]);

const { getCodeName, addCode } = await UseCtCode();

addCode('PMOT_APY_GRP_CD', Array.from({ length: 5 })
  .map((_, index) => ({ codeId: `${index + 1}`, codeName: `선택 프로모션 ${index + 1}` })));
addCode('PMOT_APY_OPT_CD', Array.from({ length: 5 })
  .map((_, index) => ({ codeId: `${index + 1}`, codeName: `옵션${index + 1}` })));

const appliedPromotions = ref(props.modelValue);

const promotions = ref([]);
const singlePromotions = ref([]);
const groupingPromotionDict = ref({});
const groupingPromotions = ref([]);

function getApplyPromotions() {
  if (!promotions.value?.length) {
    return [];
  }
  const appliedSinglePmots = singlePromotions.value.filter((promotion) => (promotion.applied !== false));
  const appliedGroupPmots = groupingPromotions.value
    .flatMap(({ pmotApyGrpCd, pmotApyOptCd }) => groupingPromotionDict.value[pmotApyGrpCd][pmotApyOptCd]);
  appliedPromotions.value = [...appliedSinglePmots, ...appliedGroupPmots];
  return appliedPromotions.value;
}

function onChangePmotApyOptCd() {
  getApplyPromotions();
  emit('update:model-value', appliedPromotions.value);
}

function clearPromotions() {
  promotions.value = [];
  singlePromotions.value = [];
  groupingPromotionDict.value = {};
  groupingPromotions.value = [];
}

function initializePromotions(pmots) {
  clearPromotions();
  if (!pmots?.length) {
    return;
  }
  const singlePmots = [];
  const groupingDict = {};
  pmots.forEach((pmot) => {
    if (!pmot.pmotApyGrpCd) {
      singlePmots.push(pmot);
    } else {
      groupingDict[pmot.pmotApyGrpCd] ??= {};
      groupingDict[pmot.pmotApyGrpCd][pmot.pmotApyOptCd] ??= [];
      groupingDict[pmot.pmotApyGrpCd][pmot.pmotApyOptCd].push(pmot);
    }
  });

  promotions.value = pmots;
  singlePromotions.value = singlePmots;
  groupingPromotionDict.value = groupingDict;
  groupingPromotions.value = Object.getOwnPropertyNames(groupingDict)
    .map((pmotApyGrpCd) => {
      const pmotApyOpts = groupingPromotionDict.value[pmotApyGrpCd];
      const pmotApyOptCds = Object.getOwnPropertyNames(pmotApyOpts)
        .map((cd) => ({
          codeId: cd,
          codeName: getCodeName('PMOT_APY_OPT_CD', cd),
        }));

      return {
        pmotApyGrpCd,
        pmotApyOptCds,
        pmotApyOptCd: pmotApyOptCds?.[0].codeId,
      };
    });
  getApplyPromotions();
  emit('update:model-value', appliedPromotions.value);
}

watch(() => props.promotions, initializePromotions, { immediate: true });

</script>

<style lang="scss" scoped>
@import "kw-lib/src/css/mixins";

.scoped-item {
  $-root: &;

  & :deep(.kw-item__section) {
    &.q-item__section:first-of-type:not(.q-item__section--side) {
      margin-left: 68px;
    }

    &.q-item__section--main ~ .q-item__section--side {
      min-width: 44px;
      padding-right: 0;
    }
  }

  &--data-modifier {
    margin-top: 12px;

    :deep(.kw-item__section) {
      &.q-item__section--main:first-child {
        margin-left: 68px;
      }

      &.q-item__section--main:last-child {
        margin-right: 44px;
      }
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
    $-custom-form-row-height: 40px;
    $-custom-form-row-gap: 16px;
    $-custom-form-row-padding: 10px;
    $-custom-form-item-min-height: 40px;

    .kw-form-row {
      @include kw-row($-custom-form-row-height, $-custom-form-row-gap, $-custom-form-row-padding);
    }

    .kw-form-item {
      @include kw-item($-custom-form-item-min-height);
    }
  }
}
</style>
