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
            <kw-form-row
              v-if="multipleQuantityAvailable"
            >
              <kw-form-item
                :label="'수량변경'"
              >
                <zwcm-counter
                  v-model="pdQty"
                  label="수량변경"
                  :min="1"
                  :max="999"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row :cols="2">
              <kw-form-item
                v-if="priceDefineVariableOptions.spayDscDvCd"
                :label="'일시불할인구분'"
              >
                <kw-select
                  v-model="priceDefineVariables.spayDscDvCd"
                  :options="priceDefineVariableOptions.spayDscDvCd"
                  placeholder="일시불할인구분"
                  first-option="select"
                  dense
                  @change="onChangeVariable"
                />
              </kw-form-item>
              <kw-form-item
                v-if="priceDefineVariableOptions.spayPmotDvCd"
                :label="'일시불프로모션구분'"
              >
                <kw-select
                  v-model="priceDefineVariables.spayPmotDvCd"
                  :options="priceDefineVariableOptions.spayPmotDvCd"
                  placeholder="일시불프로모션구분"
                  first-option="select"
                  dense
                  @change="onChangeVariable"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row
              v-if="spayDscrCdSelectable || rentalCrpDscrCdSelectable || showSvPtrms"
              :cols="2"
            >
              <kw-form-item
                v-if="spayDscrCdSelectable"
                :label="'일시불할인율'"
              >
                <kw-select
                  v-if="priceDefineVariableOptions.spayDscrCd"
                  v-model="priceDefineVariables.spayDscrCd"
                  :options="priceDefineVariableOptions.spayDscrCd"
                  label="일시불할인율"
                  first-option="select"
                  dense
                  @change="onChangeVariable"
                />
              </kw-form-item>
              <kw-form-item
                v-else-if="rentalCrpDscrCdSelectable"
                :label="'법인할인율'"
              >
                <kw-select
                  v-model="priceDefineVariables.rentalCrpDscrCd"
                  :options="priceDefineVariableOptions.rentalCrpDscrCd"
                  first-option="select"
                  :label="'법인할인율'"
                  dense
                  @change="onChangeVariable"
                />
              </kw-form-item>
              <kw-form-item
                v-if="showSvPtrms"
                :label="'무상개월 AS/BS'"
              >
                {{ `${selectedFinalPrice.frisuAsPtrm || 0}개월 / ${selectedFinalPrice.frisuPtrm || 0}개월` }}
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item :label="'서비스(용도/방문주기)'">
                <kw-select
                  v-if="priceDefineVariableOptions.svPdCd"
                  v-model="priceDefineVariables.svPdCd"
                  :options="priceDefineVariableOptions.svPdCd"
                  placeholder="서비스(용도/방문주기)"
                  first-option="select"
                  dense
                  @change="onChangeVariable"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row
              v-if="isHcr"
            >
              <kw-form-item :label="'홈케어구분코드'">
                <kw-select
                  v-if="priceDefineVariableOptions.hcrDvCd"
                  v-model="priceDefineVariables.hcrDvCd"
                  :options="priceDefineVariableOptions.hcrDvCd"
                  placeholder="서비스(용도/방문주기)"
                  first-option="select"
                  dense
                  @change="onChangeVariable"
                />
              </kw-form-item>
            </kw-form-row>
          </kw-form>
        </kw-item-section>
      </kw-item>
      <promotion-select
        v-model="appliedPromotions"
        :promotions="promotions"
        @update:model-value="calcPromotionAppliedPrice"
      />
    </template>
  </kw-expansion-item>
</template>

<script setup>
import PromotionSelect from '~sms-wells/contract/components/ordermgmt/WwctaPromotionSelect.vue';
import { useCtCode } from '~sms-common/contract/composable';
import { alert, useDataService } from 'kw-lib';
import ZwcmCounter from '~common/components/ZwcmCounter.vue';
import { getNumberWithComma } from '~sms-common/contract/util';
import usePriceSelect, { EMPTY_ID } from '~sms-wells/contract/composables/usePriceSelect';

const props = defineProps({
  modelValue: { type: Object, default: undefined },
  bas: { type: Object, default: undefined },
});
const emit = defineEmits([
  'delete',
  'price-changed',
  'promotion-changed',
]);

const { getCodeName } = await useCtCode(
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'SPAY_DSC_DV_CD',
  'SPAY_DSCR_CD',
  'SPAY_PMOT_DV_CD',
  'HCR_DV_CD',
  'RENTAL_CRP_DSCR_CD',
  'SV_TP_CD',
  'SV_VST_PRD_CD',
  'BFSVC_PRD_CD',
);
const dataService = useDataService();

const SELL_TP_DTL_CD_SPAY_NOM = '11';
const SELL_TP_DTL_CD_SPAY_HCR = '12';
const SELL_TP_DTL_CD_SPAY_ENVR_ELHM = '13';

const dtl = ref(props.modelValue);
const isHcr = computed(() => dtl.value.sellTpDtlCd === SELL_TP_DTL_CD_SPAY_HCR);

const multipleQuantityAvailable = computed(() => {
  const { bcMngtPdYn, sellTpDtlCd } = dtl.value;
  return bcMngtPdYn !== 'Y' && sellTpDtlCd === SELL_TP_DTL_CD_SPAY_NOM;
});

let pdPrcFnlDtlId;
let verSn;
let fnlAmt;
let pdQty;
let promotions;
let appliedPromotions;

function connectReactivities() {
  pdPrcFnlDtlId = toRef(props.modelValue, 'pdPrcFnlDtlId');
  verSn = toRef(props.modelValue, 'verSn');
  fnlAmt = toRef(props.modelValue, 'fnlAmt');
  pdQty = toRef(props.modelValue, 'pdQty', 1);
  promotions = ref(props.modelValue?.promotions, []); /* 적용가능한 프로모션 목록 */
  appliedPromotions = toRef(props.modelValue, 'appliedPromotions', []);
  console.log('verSn', verSn.value);
}

connectReactivities();

const finalPriceOptions = ref([]);

let promiseForFetchFinalPriceOptions;

async function fetchFinalPriceOptions() {
  if (!promiseForFetchFinalPriceOptions) {
    promiseForFetchFinalPriceOptions = dataService.get('sms/wells/contract/final-price', {
      params: {
        cntrNo: props.bas.cntrNo,
        pdCd: dtl.value.pdCd,
        hgrPdCd: dtl.value.hgrPdCd,
      },
    });
  }
  const { data } = await promiseForFetchFinalPriceOptions;
  promiseForFetchFinalPriceOptions = null;
  if (!data?.length) {
    alert('선택 가능한 가격 조건이 없습니다.');
  }
  finalPriceOptions.value = data || [];
}

await fetchFinalPriceOptions();

const priceDefineVariables = ref({
  svPdCd: undefined,
  spayDscDvCd: undefined,
  spayDscrCd: undefined,
  spayPmotDvCd: undefined,
  rentalCrpDscrCd: undefined,
  hcrDvCd: undefined,
});

const labelGenerator = {
  svPdCd: (val, finalPrice) => {
    if (val === EMPTY_ID) {
      return '선택안함';
    }
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
  spayDscDvCd: (val) => {
    if (val === EMPTY_ID) {
      return '선택안함';
    }
    return getCodeName('SPAY_DSC_DV_CD', val);
  },
  spayDscrCd: (val) => {
    if (val === EMPTY_ID) {
      return '선택안함';
    }
    getCodeName('SPAY_DSCR_CD', val);
  },
  spayPmotDvCd: (val) => {
    if (val === EMPTY_ID) {
      return '미가입';
    }
    return getCodeName('SPAY_PMOT_DV_CD', val);
  },
  rentalCrpDscrCd: (val) => {
    if (val === EMPTY_ID) {
      return '선택안함';
    }
    return getCodeName('RENTAL_CRP_DSCR_CD', val);
  },
  hcrDvCd: (val) => {
    if (val === EMPTY_ID) {
      return '선택안함';
    }
    return getCodeName('HCR_DV_CD', val);
  },
};

const {
  priceDefineVariableOptions,
  setPriceDefineVariablesBy,
  setVariablesIfUniqueSelectable,
  selectedFinalPrice, // computed
  // eslint-disable-next-line no-unused-vars
  selectedFinalPrices, // computed
} = usePriceSelect(
  priceDefineVariables,
  finalPriceOptions,
  labelGenerator,
);

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

const spayDscrCdSelectable = computed(() => priceDefineVariables.value.spayDscDvCd === '4'
    || priceDefineVariables.value.spayDscDvCd === 'C'
    || priceDefineVariables.value.spayDscDvCd === 'D');

watch(spayDscrCdSelectable, (value) => {
  if (!value) {
    priceDefineVariables.value.spayDscrCd = EMPTY_ID;
  }
});

const rentalCrpDscrCdSelectable = computed(() => priceDefineVariables.value.spayDscDvCd === '5');

watch(rentalCrpDscrCdSelectable, (value) => {
  if (!value) {
    priceDefineVariables.value.rentalCrpDscrCd = EMPTY_ID;
  }
});

const showSvPtrms = computed(() => dtl.value.sellTpDtlCd === SELL_TP_DTL_CD_SPAY_ENVR_ELHM && selectedFinalPrice.value);

function initPriceDefineVariables() {
  if (!pdPrcFnlDtlId.value) {
    return;
  }
  setPriceDefineVariablesBy(pdPrcFnlDtlId.value);
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

// region [가격표기]
const displayedFinalPrice = ref('미확정');

const promotionAppliedPrice = ref();

function calcDisplayedFinalPrice() {
  displayedFinalPrice.value = selectedFinalPrice.value
    ? `${getNumberWithComma(selectedFinalPrice.value.fnlVal)}원`
    : '미확정';
  promotionAppliedPrice.value = undefined;
}

function calcPromotionAppliedPrice(aplyPmots) {
  promotionAppliedPrice.value = undefined;
  if (!aplyPmots?.length) {
    return;
  }
  const fnlVal = selectedFinalPrice.value?.fnlVal;
  if (!fnlVal) {
    return;
  }
  const minRentalFxam = aplyPmots
    .reduce(
      (minVal, promotion) => {
        if (!promotion.rentalFxam || Number.isNaN(Number(promotion.rentalFxam))) {
          return minVal;
        }
        return Math.min(minVal, Number(promotion.rentalFxam));
      },
      fnlVal,
    );
  /* TODO: '할인개월과 같이 표기할것'
  const totalDscApyAmt = aplyPmots
    .reduce((acc, promotion) => {
      if (Number.isNaN(Number(promotion.dscApyAmt))) {
        return acc;
      }
      return acc + Number(promotion.dscApyAmt);
    }, 0);
   */
  const pmotAplyPrice = Math.max(minRentalFxam, 0);
  if (selectedFinalPrice.value?.fnlVal === pmotAplyPrice) {
    return;
  }
  promotionAppliedPrice.value = `${getNumberWithComma(pmotAplyPrice)}원`;
  emit('promotion-changed', aplyPmots, promotionAppliedPrice.value);
}

// endregion [가격표기]

function clearPromotions() {
  promotions.value = [];
  appliedPromotions.value = [];
  promotionAppliedPrice.value = undefined;
}

function onChangeSelectedFinalPrice(newPrice) {
  if (!newPrice) {
    fnlAmt.value = undefined;
    pdPrcFnlDtlId.value = undefined;
    emit('price-changed', newPrice);
    clearPromotions();
    calcDisplayedFinalPrice();
    return;
  }
  fnlAmt.value = newPrice.fnlVal;
  pdPrcFnlDtlId.value = newPrice.pdPrcFnlDtlId;

  emit('price-changed', newPrice);
  clearPromotions();
  calcDisplayedFinalPrice();
}

watch(selectedFinalPrice, onChangeSelectedFinalPrice);

function onChangeVariable() {
  // FIXME! 가격 안정화 되면 조건 추가할 것..
  setVariablesIfUniqueSelectable();
  // if (finalPriceOptions.value.length === 1) {
  //   setVariablesIfUniqueSelectable();
  // }
}

function onClickDelete() {
  emit('delete', props.modelValue);
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
