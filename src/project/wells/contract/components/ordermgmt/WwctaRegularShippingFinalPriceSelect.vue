<template>
  <kw-expansion-item
    expand-icon-class="hidden"
    default-opened
    class="fit"
    header-class="scoped-item scoped-item--header"
    block-inherit-padding
    expand-icon-toggle
  >
    <template #header="{ toggle }">
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
          <kw-btn
            class="transparent absolute fit"
            borderless
            @click="toggle"
          />
          <kw-item-label
            class="scoped-item__product-name"
          >
            {{ dtl.cstBasePdAbbrNm || dtl.pdNm }}
          </kw-item-label>

          <div class="scoped-item__chips">
            <kw-chip
              v-if="labelForSellTpCd"
              :label="labelForSellTpCd"
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
              :class="{'text-strike text-black3': promotionAppliedPrice && promotionAppliedPrice.length}"
            >
              {{ displayedFinalPrice }}
            </kw-item-label>
            <template v-if="promotionAppliedPrice">
              <kw-separator
                vertical
                spaced="8px"
              />
              <kw-item-label
                class="kw-fc--black3 kw-font-pt14"
              >
                할인가
              </kw-item-label>
              <kw-item-label class="kw-fc--black1 text-bold ml8">
                {{ promotionAppliedPrice }}
              </kw-item-label>
            </template>
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
            @click="$emit('select-capsule', modelValue)"
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
          @click="onClickDelete"
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
                  @change="onChangeVariable"
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
      <kw-item
        v-for="(item, idx) in sdingCapsls"
        :key="`sdingCapsl-${idx}`"
        class="scoped-item"
      >
        <kw-item-section>
          {{ `${item.chPdctPdNm ? `${item.chPdctPdNm} (${item.pdNm})` : `${item.pdNm}`}` }}
        </kw-item-section>
        <kw-item-section side>
          {{ `${item.itmQty || 1}개` }}
        </kw-item-section>
      </kw-item>
      <promotion-select
        v-model="appliedPromotions"
        :promotions="promotions"
      />
    </template>
  </kw-expansion-item>
</template>

<script setup>
import { useCtCode } from '~sms-common/contract/composable';
import { alert, useDataService } from 'kw-lib';
import PromotionSelect from '~sms-wells/contract/components/ordermgmt/WwctaPromotionSelect.vue';
import usePriceSelect, { EMPTY_ID } from '~sms-wells/contract/composables/usePriceSelect';
import { getDisplayedPrice, getPromotionAppliedPrice } from '~sms-wells/contract/utils/CtPriceUtil';

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
  'promotion-changed',
  'delete',
]);

const { getCodeName } = await useCtCode(
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'SV_TP_CD',
  'SV_VST_PRD_CD',
  'BFSVC_PRD_CD',
  'CNTR_REL_DTL_CD',
  'CNTR_REL_DTL_CD',
);
const dataService = useDataService();

const dtl = ref(props.modelValue);

/* 직간접적으로 업데이트 할 값들 */
let pdPrcFnlDtlId;
let verSn;
let fnlAmt;
let cntrRels;
let finalPriceOptions;
let promotions;
let appliedPromotions;
let sdingCapsls;

function connectReactivities() {
  pdPrcFnlDtlId = toRef(props.modelValue, 'pdPrcFnlDtlId');
  verSn = toRef(props.modelValue, 'verSn');
  fnlAmt = toRef(props.modelValue, 'fnlAmt');
  cntrRels = toRef(props.modelValue, 'cntrRels');
  finalPriceOptions = toRef(props.modelValue, 'finalPriceOptions', []);
  appliedPromotions = toRef(props.modelValue, 'appliedPromotions', []); /* 적용된 프로모션 */
  promotions = toRef(props.modelValue, 'promotions', []); /* 적용가능한 프로모션 목록 */
  sdingCapsls = toRef(props.modelValue, 'sdingCapsls', []); /* 적용가능한 프로모션 목록 */
  console.log('verSn', verSn.value);
}

connectReactivities();

const isLkSding = computed(() => (cntrRels.value || [])
  .find((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_SDING));
const isSeeding = computed(() => dtl.value?.sellTpDtlCd === '62');
const isCapsule = computed(() => dtl.value?.sellTpDtlCd === '63');
const isFreePackage = computed(() => dtl.value?.pdChoLmYn === 'Y'); // TODO FIX... dtl 에 없음..

/* TODO: FIX */
async function fetchSdingCapsls() {
  if (!isCapsule.value && !isCapsule.value) {
    return;
  }

  if (isFreePackage.value) {
    return;
  }

  const { data } = await dataService.get('sms/wells/contract/seeding/package-materials', {
    params: {
      basePdCd: dtl.value.pdCd,
    },
  });
  sdingCapsls.value = data;
}

fetchSdingCapsls();

const labelForSellTpCd = computed(() => {
  const product = dtl.value;
  if (!product) {
    return undefined;
  }
  if (product.sellTpCd && product.sellTpDtlCd) {
    return `${getCodeName('SELL_TP_CD', product.sellTpCd)}-${getCodeName('SELL_TP_DTL_CD', product.sellTpDtlCd)}`;
  }
  if (product.sellTpCd) {
    return getCodeName('SELL_TP_CD', product.sellTpCd);
  }
});

const priceDefineVariables = ref({
  stplPrdCd: undefined,
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

const {
  setPriceDefineVariablesBy,
  // setVariablesIfUniqueSelectable,
  priceDefineVariableOptions,
  selectedFinalPrice, // computed
} = usePriceSelect(
  priceDefineVariables,
  finalPriceOptions,
  labelGenerator,
  undefined,
);

// region [가격표기]
const displayedFinalPrice = computed(() => (
  getDisplayedPrice(selectedFinalPrice.value)
));

const promotionAppliedPrice = computed(() => (
  getPromotionAppliedPrice(selectedFinalPrice.value, appliedPromotions.value)
));
// endregion [가격표기]

let promiseForFetchFinalPriceOptions;
async function fetchFinalPriceOptions() {
  if (!promiseForFetchFinalPriceOptions) {
    promiseForFetchFinalPriceOptions = dataService.get('sms/wells/contract/final-price', {
      params: {
        cntrNo: props.bas.cntrNo,
        pdCd: dtl.value.pdCd,
        hgrPdCd: dtl.value.hgrPdCd,
      },
      silent: true,
    });
  }
  const { data } = await promiseForFetchFinalPriceOptions;
  promiseForFetchFinalPriceOptions = null;
  if (!data?.length) {
    alert('선택 가능한 가격 조건이 없습니다.');
  }
  finalPriceOptions.value = data || [];
}

function emitPriceChanged() {
  console.log('emitPriceChanged', selectedFinalPrice.value);
  if (!selectedFinalPrice.value) {
    fnlAmt.value = undefined;
    pdPrcFnlDtlId.value = undefined;
    emit('price-changed', undefined);
    return;
  }
  fnlAmt.value = selectedFinalPrice.value.fnlVal;
  pdPrcFnlDtlId.value = selectedFinalPrice.value.pdPrcFnlDtlId;

  emit('price-changed', selectedFinalPrice.value);
}

function initPriceDefineVariables() {
  if (!pdPrcFnlDtlId.value) {
    return;
  }
  setPriceDefineVariablesBy(pdPrcFnlDtlId.value);
}

function clearPromotions() {
  promotions.value = [];
  appliedPromotions.value = [];
  promotionAppliedPrice.value = undefined;
}

async function onChangeModelValue(newDtl) {
  if (dtl.value !== newDtl) {
    /* 불의의 사고로, modelValue 객체를 통으로 들어냈을 경우, key 가 안정적이지 않아서 변경 가능성이 있었으나,
    modelValue 에 따라 종속되는 tempKey-cntrSn 기반으로 인스턴스와 연결되므로, 발생하지 않을 것 으로 추측 중 */
    dtl.value = newDtl;
    connectReactivities();
  }

  if (!finalPriceOptions.value?.length) {
    await fetchFinalPriceOptions();
  }

  initPriceDefineVariables();
}

watch(() => props.modelValue, onChangeModelValue, { immediate: true });

watch(pdPrcFnlDtlId, (value, oldValue) => {
  if (value !== oldValue && !!oldValue) {
    clearPromotions();
  }
});

function onChangeSelectedFinalPrice() {
  emitPriceChanged();
}

watch(selectedFinalPrice, onChangeSelectedFinalPrice, { immediate: true });

function onDeleteCntrRel(cntrRel) {
  if (cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_RGLR_SHP_BASE) {
    emit('delete:select-machine', props.modelValue);
  }
}

function onClickDelete() {
  emit('delete');
}

function onChangeVariable() {
  // if (finalPriceOptions.value.length === 1) {
  //   setVariablesIfUniqueSelectable();
  // }
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
