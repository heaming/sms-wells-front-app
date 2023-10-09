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
        v-if="selectedFinalPrice"
        class="scoped-item scoped-item mt12"
      >
        <kw-item-section>
          <kw-form
            class="scoped-price-form"
            :cols="0"
            :label-size="150"
          >
            <kw-form-row>
              <kw-form-item :label="'서비스(용도/방문주기)'">
                {{ labelingForSvPdCd(selectedFinalPrice.svPdCd, selectedFinalPrice) }}
              </kw-form-item>
            </kw-form-row>
          </kw-form>
        </kw-item-section>
      </kw-item>
    </template>
  </kw-expansion-item>
</template>

<script setup>
import { useCtCode } from '~sms-common/contract/composable';
import { stringUtil, useDataService } from 'kw-lib';

const props = defineProps({
  modelValue: { type: Object, default: undefined },
  bas: { type: Object, default: undefined },
  dtl: { type: Object, default: undefined, validator: (obj) => isReactive(obj) },
});
const emit = defineEmits([
  'device-change',
  'one-plus-one',
  'delete-one-plus-one',
  'price-changed',
  'promotion-changed',
  'delete',
]);

const { getCodeName } = await useCtCode(
  'SELl_TP_CD',
  'SV_TP_CD',
  'SV_VST_PRD_CD',
  'BFSVC_PRD_CD',
);
const dataService = useDataService();

const dtl = ref(props.modelValue);

/* 직간접적으로 업데이트 할 값들 */
let pdPrcFnlDtlId = toRef(props.modelValue, 'pdPrcFnlDtlId');
let verSn = toRef(props.modelValue, 'verSn');
let fnlAmt = toRef(props.modelValue, 'fnlAmt');
let pdQty = toRef(props.modelValue, 'pdQty');
let finalPriceOptions = toRef(props.modelValue, 'finalPriceOptions');
// appliedPromotions.value ??= [];

const sellTpNm = computed(() => getCodeName('SELl_TP_CD', '3'));

const selectedFinalPrice = ref();

async function fetchFinalPriceOptions() {
  const { data } = await dataService.get('sms/wells/contract/final-price', {
    params: {
      cntrNo: props.bas.cntrNo,
      pdCd: dtl.value.pdCd,
      hgrPdCd: dtl.value.hgrPdCd,
    },
    silent: true,
  });
  finalPriceOptions.value = data || [];
  selectedFinalPrice.value = finalPriceOptions.value?.[0];
}

if (!finalPriceOptions.value?.length) {
  await fetchFinalPriceOptions();
}

function reconnectReactivities() {
  pdPrcFnlDtlId = toRef(props.modelValue, 'pdPrcFnlDtlId');
  verSn = toRef(props.modelValue, 'verSn');
  fnlAmt = toRef(props.modelValue, 'fnlAmt');
  pdQty = toRef(props.modelValue, 'pdQty');
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

pdQty.value = 1;

function initializePrice() {
  fnlAmt.value = selectedFinalPrice.value?.fnlVal ?? undefined;
  pdPrcFnlDtlId.value = selectedFinalPrice.value?.pdPrcFnlDtlId ?? undefined;
  verSn.value = selectedFinalPrice.value?.verSn ?? undefined;
}

initializePrice();

const displayedFinalPrice = computed(() => (selectedFinalPrice.value
  ? `${stringUtil.getNumberWithComma(selectedFinalPrice.value.fnlVal)}원`
  : '미확정'));

watch(selectedFinalPrice, (newPrice) => {
  fnlAmt.value = newPrice?.fnlVal ?? undefined;
  pdPrcFnlDtlId.value = newPrice?.pdPrcFnlDtlId ?? undefined;
  verSn.value = newPrice?.verSn ?? undefined;
});

function onClickDelete() {
  emit('delete');
}

const labelingForSvPdCd = (val, finalPrice) => {
  const { svTpCd, svVstPrdCd, pcsvPrdCd } = finalPrice;
  const additional = [];
  if (svVstPrdCd) {
    additional.push(`방문(${getCodeName('SV_VST_PRD_CD', svVstPrdCd)})`);
  }
  if (pcsvPrdCd) {
    additional.push(`택배(${getCodeName('BFSVC_PRD_CD', pcsvPrdCd)})`);
  }
  return `${getCodeName('SV_TP_CD', svTpCd)} - ${additional.join('/')}`;
};

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
