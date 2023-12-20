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
            class="scoped-item__toggle-helper"
            borderless
            @click="toggle"
          />
          <kw-item-label
            class="scoped-item__product-name"
          >
            {{ dtl.cstBasePdAbbrNm || dtl.pdNm }}
            <span class="text-black3 text-caption">
              {{ dtl.pdCd }}
            </span>
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
            v-if="showInitBtn"
            :label="'초기화'"
            dense
            @click="initializePriceDefineVariable"
          />
          <kw-btn
            v-if="showChangeWellsFarmPackageBtn"
            :disable="!!promotions?.length"
            :primary="!lkSdingCntrRel"
            :label="lkSdingCntrRel ? '패키지변경' : '패키지선택'"
            dense
            @click="onClickChangeWellsFarmPackage"
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
      <!-- 가격결정요소 -->
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
              :cols="2"
            >
              <kw-form-item
                :label="'수량변경'"
              >
                <zctz-number-input
                  v-model="pdQty"
                  label="수량변경"
                  :min="1"
                  :max="999"
                  align="right"
                  suffix="건"
                  dense
                  :clearable="false"
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
              v-if="isSelectableSpayDscrCd"
              :cols="2"
            >
              <kw-form-item
                v-if="isSelectableSpayDscrCd"
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
            </kw-form-row>
            <kw-form-row
              v-if="sellDscCtrAmtEditable"
              :cols="2"
            >
              <kw-form-item
                :label="'법인할인율'"
              >
                <kw-select
                  :model-value="priceDefineVariables.rentalCrpDscrCd"
                  :options="priceDefineVariableOptions.rentalCrpDscrCd"
                  first-option="select"
                  :label="'법인할인율'"
                  dense
                  @change="onChangeRentalCrpDscrCd"
                />
              </kw-form-item>
              <kw-form-item
                :label="'법인특별할인금액'"
              >
                <zctz-number-input
                  :model-value="sellDscCtrAmt"
                  :disable="!normalizedCrpDscrPriceOptions?.length"
                  :step="1000"
                  :min="0"
                  :max="maxSellDscCtrAmt"
                  align="right"
                  dense
                  suffix="원"
                  :clearable="false"
                  @update:model-value="onChangeSellDscCtrAmt"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row
              v-if="crpSpcDsprcEditable"
            >
              <kw-form-item
                :label="'B2B법인특별할인가'"
              >
                <zctz-number-input
                  v-model="crpSpcDsprc"
                  :step="1000"
                  :min="0"
                  :max="maxSpayAmt"
                  align="right"
                  dense
                  suffix="원"
                  :clearable="false"
                  @update:model-value="onChangeCrpSpcDsprc"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                v-if="priceDefineVariableOptions.svPdCd"
                :label="'서비스(용도/방문주기)'"
              >
                <kw-select
                  v-model="priceDefineVariables.svPdCd"
                  :options="priceDefineVariableOptions.svPdCd"
                  placeholder="서비스(용도/방문주기)"
                  first-option="select"
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
            <kw-form-row
              v-if="isHcr || sellEvCdsBySellChnlDtlCd"
            >
              <kw-form-item
                v-if="priceDefineVariableOptions.hcrDvCd"
                :label="'홈케어구분코드'"
              >
                <kw-select
                  v-model="priceDefineVariables.hcrDvCd"
                  :options="priceDefineVariableOptions.hcrDvCd"
                  placeholder="서비스(용도/방문주기)"
                  first-option="select"
                  dense
                  @change="onChangeVariable"
                />
              </kw-form-item>
              <kw-form-item
                v-if="sellEvCdsBySellChnlDtlCd?.length"
                label="행사코드"
              >
                <kw-select
                  v-model="wellsDtl.sellEvCd"
                  :options="sellEvCdsBySellChnlDtlCd"
                  placeholder="행사코드"
                  dense
                />
              </kw-form-item>
            </kw-form-row>
          </kw-form>
        </kw-item-section>
      </kw-item>
      <promotion-select
        :key="`promotion-select-${modelValue?.pdCd ?? ''}`"
        v-model="appliedPromotions"
        :promotions="promotions"
      />
    </template>
  </kw-expansion-item>
</template>

<script setup>
import PromotionSelect from '~sms-wells/contract/components/ordermgmt/WwctaPromotionSelect.vue';
import { useCtCode } from '~sms-common/contract/composable';
import { alert, useDataService } from 'kw-lib';
import ZctzNumberInput from '~sms-common/contract/components/ZctzNumberInput.vue';
import usePriceSelect, { EMPTY_ID } from '~sms-wells/contract/composables/usePriceSelect';
import {
  CNTR_REL_DTL_CD,
  SELL_TP_DTL_CD,
  SPAY_DSC_DV_CD,
} from '~sms-wells/contract/constants/ctConst';
import {
  getDisplayedPrice,
  getPromotionAppliedPrice,
  getSpayAmt,
} from '~sms-wells/contract/utils/CtPriceUtil';
import { warn } from 'vue';

const props = defineProps({
  modelValue: { type: Object, default: undefined },
  bas: { type: Object, default: undefined },
});
const emit = defineEmits([
  'change:package',
  'delete',
  'price-changed',
  'promotion-changed',
]);

const { codes, getCodeName } = await useCtCode(
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
  'SELL_EV_CD',
);
const dataService = useDataService();

const sellEvCdsBySellChnlDtlCd = computed(() => {
  const { sellInflwChnlDtlCd } = props.bas;

  if (!sellInflwChnlDtlCd) {
    console.error('판매유입채널이 없음?', props.bas);
    return [];
  }
  if (!codes.SELL_EV_CD.length) {
    return [];
  }
  const codeIds = [];

  if (sellInflwChnlDtlCd === '1010') {
    codeIds.push('5'); /* 라보판매 */
  }
  if (sellInflwChnlDtlCd === '5010') {
    codeIds.push('8'); /* 총판판매 */
    codeIds.push('9'); /* 이지웰페어 */
  }
  if (sellInflwChnlDtlCd === '9020') {
    codeIds.push('H'); /* 해지방어 */
    codeIds.push('I'); /* CAPTIVE */
  }
  return codes.SELL_EV_CD.filter((code) => codeIds.includes(code.codeId));
});

const dtl = ref(props.modelValue);
const isHcr = computed(() => dtl.value.sellTpDtlCd === SELL_TP_DTL_CD.SPAY_HCR);

const multipleQuantityAvailable = computed(() => {
  const { bcMngtPdYn, sellTpDtlCd } = dtl.value;
  return bcMngtPdYn !== 'Y' && sellTpDtlCd === SELL_TP_DTL_CD.SPAY_NOM;
});

let pdPrcFnlDtlId;
// eslint-disable-next-line no-unused-vars
let verSn;
let fnlAmt;
let pdQty;
let ojCntrRels;
let wellsDtl;
let promotions;
let appliedPromotions;
let sellDscCtrAmt;
let crpSpcDsprc; // 법인특별할인가

function connectReactivities() {
  pdPrcFnlDtlId = toRef(props.modelValue, 'pdPrcFnlDtlId');
  verSn = toRef(props.modelValue, 'verSn');
  fnlAmt = toRef(props.modelValue, 'fnlAmt');
  pdQty = toRef(props.modelValue, 'pdQty', 1);
  ojCntrRels = toRef(props.modelValue, 'ojCntrRels');
  promotions = ref(props.modelValue?.promotions, []); /* 적용가능한 프로모션 목록 */
  appliedPromotions = toRef(props.modelValue, 'appliedPromotions', []);
  wellsDtl = toRef(props.modelValue, 'wellsDtl');
  sellDscCtrAmt = toRef(props.modelValue, 'sellDscCtrAmt');
  crpSpcDsprc = toRef(props.modelValue, 'crpSpcDsprc');
  wellsDtl.value ??= {};
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
        hgrPdCd: dtl.value.hgrPdCd === dtl.value.pdCd ? undefined : dtl.value.hgrPdCd,
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
  selectedFinalPrices, // computed
  initializePriceDefineVariable,
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

/* region [일시불할인율] 법인특별할인이 아니다! */
const isSelectableSpayDscrCd = computed(() => {
  if (!priceDefineVariableOptions.value.spayDscrCd?.length) {
    return false;
  }
  return (priceDefineVariables.value.spayDscDvCd === SPAY_DSC_DV_CD.DISCOUNT_PRICE
      || priceDefineVariables.value.spayDscDvCd === SPAY_DSC_DV_CD.COUPON
      || priceDefineVariables.value.spayDscDvCd === SPAY_DSC_DV_CD.COUPON_DISCOUNT
      || priceDefineVariables.value.spayDscDvCd === SPAY_DSC_DV_CD.COUNSEL_DISCOUNT
  );
});
watch(isSelectableSpayDscrCd, (value) => {
  if (!value) {
    priceDefineVariables.value.spayDscrCd = undefined;
  }
});
/* endregion [일시불할인율] */

const showSvPtrms = computed(() => dtl.value.sellTpDtlCd === SELL_TP_DTL_CD.SPAY_ENVR_ELHM && selectedFinalPrice.value);

function initPriceDefineVariables() {
  if (!pdPrcFnlDtlId.value) {
    initializePriceDefineVariable();
    setVariablesIfUniqueSelectable([]);
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

// region [법인특별할인]
const sellDscCtrAmtEditable = computed(() => {
  if (priceDefineVariables.value.spayDscDvCd !== SPAY_DSC_DV_CD.GROUP_BUYING) {
    return false;
  }

  if (selectedFinalPrices.value?.length > priceDefineVariableOptions.value.rentalCrpDscrCd?.length) {
    return false;
  }

  const visit = {};
  return selectedFinalPrices.value.every((price) => {
    const { rentalCrpDscrCd, asctDscBaseAmt, asctDscLstAmt } = price;
    if (visit[rentalCrpDscrCd]) {
      return false;
    }
    visit[rentalCrpDscrCd] = true;
    return !!(rentalCrpDscrCd && asctDscBaseAmt && asctDscLstAmt);
  });
});

const normalizedCrpDscrPriceOptions = computed(() => {
  const filteringObject = {
    svPdCd: (priceDefineVariables.value.svPdCd === EMPTY_ID
      ? undefined : priceDefineVariables.value.svPdCd),
    spayDscDvCd: (priceDefineVariables.value.spayDscDvCd === EMPTY_ID
      ? undefined : priceDefineVariables.value.spayDscDvCd),
    spayDscrCd: (priceDefineVariables.value.spayDscrCd === EMPTY_ID
      ? undefined : priceDefineVariables.value.spayDscrCd),
    spayPmotDvCd: (priceDefineVariables.value.spayPmotDvCd === EMPTY_ID
      ? undefined : priceDefineVariables.value.spayPmotDvCd),
    hcrDvCd: (priceDefineVariables.value.hcrDvCd === EMPTY_ID
      ? undefined : priceDefineVariables.value.hcrDvCd),
  };
  const crpDscrPriceOptions = finalPriceOptions.value.filter((price) => (
    price.svPdCd === filteringObject.svPdCd
      && price.spayDscDvCd === filteringObject.spayDscDvCd
      && price.spayDscrCd === filteringObject.spayDscrCd
      && price.spayPmotDvCd === filteringObject.spayPmotDvCd
      && price.hcrDvCd === filteringObject.hcrDvCd));
  // validate 를 넣을까...
  const normalizedArr = crpDscrPriceOptions.map((price) => {
    const { ccamBasePrc, rentalCrpDscrCd, asctDscBaseAmt, asctDscLstAmt } = price;
    const fnlVal = ccamBasePrc; // TODO: REMOVE THIS AFTER 상품 mig update.
    return {
      rentalCrpDscrCd,
      max: fnlVal - asctDscBaseAmt,
      maxForAll: fnlVal - asctDscLstAmt,
    };
  });
  normalizedArr.sort((a, b) => a.max - b.max);
  // 법인특별할인금액은 음수가 아닌 정수 값임을 가정합니다.
  // 해당 가격 옵션에 대한 가능한 구간은 min < value <= max 로 정의한다.
  let previousMax = -1; // 시작 값은 0을 포함해야한다.
  normalizedArr.forEach((normalized) => {
    normalized.min = previousMax;
    previousMax = normalized.max;
  });
  return normalizedArr;
});

const mapToRentalCrpDscrCdToRangeOfSellDscCtrAmt = computed(() => {
  const normalizedArr = normalizedCrpDscrPriceOptions.value;
  return normalizedArr.reduce((accMapObj, normalized) => {
    const { rentalCrpDscrCd, min, max } = normalized;
    accMapObj[rentalCrpDscrCd] = { min, max };
    return accMapObj;
  }, {});
});

const maxSellDscCtrAmt = computed(() => {
  const normalizedArr = [...normalizedCrpDscrPriceOptions.value];
  if (!Array.isArray(normalizedArr)) { return; }
  const maxOne = normalizedArr.pop();
  if (!maxOne) { return; }
  return maxOne.maxForAll;
});

const maxRentalCrpDscrCd = computed(() => {
  const normalizedArr = [...normalizedCrpDscrPriceOptions.value];
  if (!Array.isArray(normalizedArr)) { return; }
  const maxOne = normalizedArr.pop();
  if (!maxOne) { return; }
  return maxOne.rentalCrpDscrCd;
});

// sellDscCtrAtm 와 rentalCrpDscrCd 는 서로에게 영향을 미칩니다.
function onChangeSellDscCtrAmt(newSellDscCtrAmtStr) {
  const numVal = Number(newSellDscCtrAmtStr?.replaceAll(/,/g, ''));
  sellDscCtrAmt.value = Number.isNaN(numVal) ? undefined : numVal;
  const newSellDscCtrAmt = numVal;
  if (!newSellDscCtrAmt) {
    return;
  }
  if (!mapToRentalCrpDscrCdToRangeOfSellDscCtrAmt.value) {
    warn('The mapToRentalCrpDscrCdToRangeOfSellDscCtrAmt is undefined!!');
    return;
  }
  const newValue = Math.max(newSellDscCtrAmt, 0);
  if (newValue > maxSellDscCtrAmt.value) {
    sellDscCtrAmt.value = 0;
    nextTick().then(() => {
      sellDscCtrAmt.value = maxSellDscCtrAmt.value;
      priceDefineVariables.value.rentalCrpDscrCd = maxRentalCrpDscrCd.value;
    });
    return;
  }

  const rentalCrpDscrCd = Object.keys(mapToRentalCrpDscrCdToRangeOfSellDscCtrAmt.value).find((key) => {
    const range = mapToRentalCrpDscrCdToRangeOfSellDscCtrAmt.value[key];
    if (!range) { return false; }
    const { min, max } = range ?? {};
    return min < newValue && newValue <= max;
  });
  if (!rentalCrpDscrCd) {
    warn('The rentalCrpDscrCd is undefined!!');
    return;
  }
  sellDscCtrAmt.value = newValue; // next tick?
  priceDefineVariables.value.rentalCrpDscrCd = rentalCrpDscrCd;
}

function onChangeRentalCrpDscrCd(newRentalCrpDscrCd) {
  if (!newRentalCrpDscrCd) {
    return;
  }
  if (!mapToRentalCrpDscrCdToRangeOfSellDscCtrAmt.value) {
    warn('The mapToRentalCrpDscrCdToRangeOfSellDscCtrAmt is undefined!!');
    return;
  }
  const rangeForSellDscCtrAmt = mapToRentalCrpDscrCdToRangeOfSellDscCtrAmt.value[newRentalCrpDscrCd];
  if (!rangeForSellDscCtrAmt) {
    warn('The rangeForSellDscCtrAmt is undefined!!');
    return;
  }
  const { min, max } = rangeForSellDscCtrAmt;
  if (sellDscCtrAmt.value === undefined) {
    sellDscCtrAmt.value = max;
  }
  if (sellDscCtrAmt.value <= min) {
    // sellDscCtrAmt.value = Math.min(min + 1, max);
    sellDscCtrAmt.value = max;
  }
  if (sellDscCtrAmt.value > max) {
    sellDscCtrAmt.value = max;
  }
  priceDefineVariables.value.rentalCrpDscrCd = newRentalCrpDscrCd;
}
// endregion [법인특별할인]

// region [계약 관계 버튼]
const showInitBtn = computed(() => {
  if (ojCntrRels.value?.length) {
    return false;
  }
  return !promotions.value?.length;
});

const showChangeWellsFarmPackageBtn = computed(() => {
  const { pdLclsfId } = dtl.value;
  if (!pdLclsfId) {
    return false;
  }
  const isWellsFarmProduct = pdLclsfId === 'PDC000000000120';
  return isWellsFarmProduct;
});

const lkSdingCntrRel = computed(() => (
  ojCntrRels.value?.find((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD.LK_SDING)));
// endregion [계약 관계 버튼]

// region [가격표기]
const displayedFinalPrice = computed(() => (
  getDisplayedPrice(selectedFinalPrice.value, sellDscCtrAmt.value)
));

const promotionAppliedPrice = computed(() => (
  getPromotionAppliedPrice(selectedFinalPrice.value, appliedPromotions.value, sellDscCtrAmt.value)
));

const maxSpayAmt = computed(() => {
  if (!selectedFinalPrice.value) { return; }
  return getSpayAmt({}, selectedFinalPrice.value, appliedPromotions.value, 0);
});
// endregion [가격표기]

// region [B2B법인특별할인]
const crpSpcDsprcEditable = computed(() => (props.bas.sellOgTpCd === 'W04')
  && !sellDscCtrAmtEditable.value && !!selectedFinalPrice.value);

function onChangeCrpSpcDsprc() {
  if (!crpSpcDsprc.value) {
    sellDscCtrAmt.value = 0;
    return;
  }
  sellDscCtrAmt.value = maxSpayAmt.value - crpSpcDsprc.value;
}

watch(crpSpcDsprcEditable, (value) => {
  if (!value) {
    crpSpcDsprc.value = undefined;
  }

  if (crpSpcDsprc.value === undefined) {
    crpSpcDsprc.value = getSpayAmt({}, selectedFinalPrice.value, appliedPromotions.value, sellDscCtrAmt.value);
  }

  onChangeCrpSpcDsprc();
});
// endregion [B2B법인특별할인]

function clearPromotions() {
  promotions.value = [];
  appliedPromotions.value = [];
  promotionAppliedPrice.value = undefined;
}

function onChangeSelectedFinalPrice(newPrice) {
  if (!newPrice) {
    fnlAmt.value = undefined;
    pdPrcFnlDtlId.value = undefined;
    clearPromotions();
    emit('price-changed', newPrice);
    return;
  }
  fnlAmt.value = newPrice.fnlVal;
  pdPrcFnlDtlId.value = newPrice.pdPrcFnlDtlId;

  clearPromotions();
  emit('price-changed', newPrice);
}

watch(selectedFinalPrice, onChangeSelectedFinalPrice);

function onChangeVariable() {
  // if (finalPriceOptions.value.length === 1) {
  //   setVariablesIfUniqueSelectable();
  // }
}

function onClickChangeWellsFarmPackage() {
  emit('change:package', props.modelValue);
}

function onClickDelete() {
  emit('delete', props.modelValue);
}

</script>

<style lang="scss" scoped>
@import "kw-lib/src/css/mixins";
@import "~@css/variables";

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

  &__toggle-helper {
    background: transparent;
    position: absolute;
    height: 52px;
    bottom: 0;
    left: 0;
    right: 0;
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
