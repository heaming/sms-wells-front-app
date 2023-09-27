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
            {{ dtl.pdNm }}
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
          <!-- 로그인한 사용자의 채널이 5010(온라인총판) 이면 기기변경 버튼 발생하지 않음 -->
          <kw-btn
            v-if="bas?.sellInflwChnlDtlCd !== '5010'"
            :disable="existOnePlusOneRel"
            label="기기변경"
            dense
            @click.stop="onClickDeviceChange(item)"
          />
          <kw-btn
            v-if="existOnePlusOnePriceOption"
            :disable="onePlusOneDisable"
            label="1+1"
            dense
            @click.stop="onClickOnePlusOne(item)"
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
            <kw-form-row>
              <kw-form-item
                v-if="bcMngtPdYn !== 'Y'"
                :label="'수량변경'"
              >
                <zwcm-counter
                  v-model="pdQty"
                  label="수량변경"
                  :min="1"
                  :max="999"
                />
              </kw-form-item>
              <kw-form-item :label="'등록비'">
                <kw-select
                  v-if="priceDefineVariableOptions.cntrAmt"
                  v-model="priceDefineVariables.cntrAmt"
                  :options="priceDefineVariableOptions.cntrAmt"
                  placeholder="등록비"
                  first-option="select"
                  dense
                  @change="forcedChangeValidVariable"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
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
              <kw-form-item :label="'계약기간'">
                <kw-select
                  v-if="priceDefineVariableOptions.cntrPtrm"
                  v-model="priceDefineVariables.cntrPtrm"
                  :options="priceDefineVariableOptions.cntrPtrm"
                  placeholder="계약기간"
                  first-option="select"
                  dense
                  @change="forcedChangeValidVariable"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item :label="'렌탈할인구분'">
                <kw-select
                  v-if="priceDefineVariableOptions.rentalDscDvCd"
                  v-model="priceDefineVariables.rentalDscDvCd"
                  :options="priceDefineVariableOptions.rentalDscDvCd"
                  placeholder="렌탈할인구분"
                  first-option="select"
                  dense
                  @change="forcedChangeValidVariable"
                />
              </kw-form-item>
              <kw-form-item :label="'렌탈할인유형'">
                <kw-select
                  v-if="priceDefineVariableOptions.rentalDscTpCd"
                  v-model="priceDefineVariables.rentalDscTpCd"
                  :options="priceDefineVariableOptions.rentalDscTpCd"
                  placeholder="렌탈할인유형"
                  :disable="!!rentalDiscountFixed"
                  first-option="select"
                  dense
                  @change="forcedChangeValidVariable"
                />
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
                  @change="forcedChangeValidVariable"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row
              v-if="alncCntrNms || (isExistAlncPd && alncCntrPriceCodes.length > 0)"
            >
              <kw-form-item label="제휴 계약">
                <kw-select
                  v-model="alncCntrNms"
                  :options="alncCntrPriceCodes"
                  :model-value="alncCntrNms ? alncCntrNms : []"
                  :multiple="true"
                  placeholder="제휴 계약"
                  dense
                  @change="onChangeAlncCntr"
                />
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
            borderless
            icon="close_24"
            class="w24 kw-font-pt24"
            @click="onDeleteOnePlusOne"
          />
        </kw-item-section>
      </kw-item>
      <kw-item
        v-if="mchnCh?.mchnChYn"
        class="scoped-item"
      >
        <kw-item-section>
          <kw-item-label class="row no-wrap items-center">
            <kw-chip
              label="변경"
              color="primary"
              outline
            />
            <div
              class="grow ellipsis pl8 kw-fc--black1 hp-w1"
            >
              {{ mchnCh.pdNm }}
              <kw-tooltip show-when-ellipsised>
                {{ mchnCh.pdNm }}
              </kw-tooltip>
            </div>
            <div class="row">
              <kw-item-label
                font="dense"
                font-weight="normal"
                class="kw-fc--black3"
              >
                계약번호
              </kw-item-label>
              <kw-item-label
                font="dense"
                font-weight="normal"
                class="kw-fc--black1 ml8"
              >
                {{ mchnCh.ojCntrNo }}-{{ mchnCh.ojCntrSn }}
              </kw-item-label>
            </div>
          </kw-item-label>
        </kw-item-section>
        <kw-item-section side>
          <kw-btn
            borderless
            icon="close_24"
            class="w24 kw-font-pt24"
            @click="onClickDeleteDeviceChange"
          />
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
import { alert, stringUtil, useDataService } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import { warn } from 'vue';
import ZwcmCounter from '~common/components/ZwcmCounter.vue';

const props = defineProps({
  modelValue: { type: Object, default: undefined },
  bas: { type: Object, default: undefined },
  dtl: { type: Object, default: undefined, validator: (obj) => isReactive(obj) },
});
const emit = defineEmits([
  'device-change',
  'one-plus-one',
  'delete:one-plus-one',
  'price-changed',
  'promotion-changed',
  'delete',
]);

const { getCodeName } = await useCtCode(
  'SELl_TP_CD',
  'RENTAL_DSC_DV_CD',
  'RENTAL_CRP_DSCR_CD',
  'RENTAL_DSC_TP_CD',
  'RENTAL_COMBI_DV_CD',
  'SV_TP_CD',
  'SV_VST_PRD_CD',
  'BFSVC_PRD_CD',
  'ALNCMP_CD',
  'CNTR_REL_DTL_CD',
);
const dataService = useDataService();
const alncCntrPriceCodes = ref([]);

const EMPTY_SYM = Symbol('__undef__');
const EMPTY_ID = ' '; /*  FIXME!!! */

const CNTR_REL_DTL_CD_LK_ONE_PLUS_ONE = '215';
const RENTAL_DSC_TP_CD_ONE_PLUS_ONE = '03';

const dtl = ref(props.modelValue);

/* 직간접적으로 업데이트 할 값들 */
let pdPrcFnlDtlId = toRef(props.modelValue, 'pdPrcFnlDtlId');
let verSn = toRef(props.modelValue, 'verSn');
let fnlAmt = toRef(props.modelValue, 'fnlAmt');
let rentalDiscountFixed = toRef(props.modelValue, 'rentalDiscountFixed');
let pdQty = toRef(props.modelValue, 'pdQty');
let mchnCh = toRef(props.modelValue, 'mchnCh');
let cntrRels = toRef(props.modelValue, 'cntrRels');
let bcMngtPdYn = toRef(props.modelValue, 'bcMngtPdYn'); /* 바코드관리상품여부 */
let appliedPromotions = toRef(props.modelValue, 'appliedPromotions', []); /* 적용된 프로모션 */
let promotions = toRef(props.modelValue, 'promotions', []); /* 적용가능한 프로모션 목록 */
let finalPriceOptions = toRef(props.modelValue, 'finalPriceOptions', []);
let alncCntrNms = toRef(props.modelValue, 'alncCntrNms', []);
// appliedPromotions.value ??= [];

const existOnePlusOneRel = computed(() => !!(cntrRels.value ?? [])
  .find((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_ONE_PLUS_ONE));

const existOnePlusOnePriceOption = computed(() => !!finalPriceOptions.value
  .find((price) => price.rentalDscTpCd === RENTAL_DSC_TP_CD_ONE_PLUS_ONE));

const sellTpNm = computed(() => getCodeName('SELl_TP_CD', '2'));

const priceDefineVariables = ref({
  svPdCd: toRef(props.modelValue, 'svPdCd'),
  stplPrdCd: toRef(props.modelValue, 'stplPtrm'),
  cntrAmt: toRef(props.modelValue, 'cntrAmt'),
  cntrPtrm: toRef(props.modelValue, 'cntrPtrm'),
  asMcn: toRef(props.modelValue, 'asMcn'),
  rentalDscDvCd: toRef(props.modelValue, 'sellDscDvCd'),
  rentalCrpDscrCd: toRef(props.modelValue, 'rentalCrpDscrCd'),
  rentalDscTpCd: toRef(props.modelValue, 'sellDscTpCd'),
  rentalCombiDvCd: toRef(props.modelValue, 'rentalCombiDvCd'),
});

const isExistAlncPd = computed(() => !isEmpty(priceDefineVariables.value?.svPdCd)
  && !isEmpty(priceDefineVariables.value?.stplPrdCd)
  && finalPriceOptions.value?.findIndex((v) => (
    v.svPdCd === priceDefineVariables.value?.svPdCd
    && v.stplPrdCd === priceDefineVariables.value?.stplPrdCd
    && v.alncPdCnt !== EMPTY_ID
  )) > -1);

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

async function fetchAllianceContracts() {
  const params = {
    cstNo: props.bas?.cntrCstNo,
    sellTpCd: dtl.value?.sellTpCd,
    pdCd: dtl.value.pdCd,
    stplPrdCd: priceDefineVariables.value?.stplPrdCd,
    svPdCd: priceDefineVariables.value?.svPdCd,
  };

  const { data } = await dataService
    .get('sms/wells/contract/final-price/alliance-contracts', { params });

  // klpont 가 0인 경우 제외
  alncCntrPriceCodes.value = data.filter((v) => (v.klpont > 0))
    .map((v) => ({
      codeId: `${v.klyear}-${v.klcode}-${v.klpont}-${v.alncmpCd}`,
      codeName: `${v.klyear}-${v.klcode} ${v.alncmpNm} ${stringUtil.getNumberWithComma(v.klpont || 0)}원`,
    })) || [];
  // console.log(JSON.stringify(data, null, '\t'));
}

if (!finalPriceOptions.value?.length) {
  await fetchFinalPriceOptions();
}

const labelGenerator = {
  svPdCd: (val, finalPrice) => {
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
  stplPrdCd: (val) => `${val}개월`,
  cntrAmt: (val) => `${stringUtil.getNumberWithComma(val || 0)}원`,
  cntrPtrm: (val) => `${val}개월`,
  asMcn: (val) => `${val}개월`,
  rentalDscDvCd: (val) => getCodeName('RENTAL_DSC_DV_CD', val),
  rentalCrpDscrCd: (val) => getCodeName('RENTAL_CRP_DSCR_CD', val),
  rentalDscTpCd: (val) => getCodeName('RENTAL_DSC_TP_CD', val),
  rentalCombiDvCd: (val) => getCodeName('RENTAL_COMBI_DV_CD', val),
};

const variableNames = Object.getOwnPropertyNames(priceDefineVariables.value);

// eslint-disable-next-line no-unused-vars
function clearPriceDefineVariables() {
  variableNames.forEach((variableName) => {
    priceDefineVariables.value[variableName] = undefined;
  });
}

/* 저장된 값이 있다면 가격 결정요소를 맞추어 줍니다. */
function initPriceDefineVariables() {
  if (!pdPrcFnlDtlId.value) {
    return;
  }
  const selectedFinalPrice = finalPriceOptions.value
    ?.find((finalPrice) => (finalPrice.pdPrcFnlDtlId === pdPrcFnlDtlId.value));

  if (!selectedFinalPrice) {
    warn('저장된 가격이 상이합니다.');
    return;
  }

  if (selectedFinalPrice.verSn !== verSn.value) {
    warn(`${props.modelValue?.pdNm} 상품의 가격이 변경되었습니다.`);
    // clearPriceDefineVariables();
    // return;
  }

  variableNames.forEach((variableName) => {
    priceDefineVariables.value[variableName] = selectedFinalPrice[variableName] ?? EMPTY_ID;
  });

  alncCntrPriceCodes.value = alncCntrNms.value.map((v) => ({
    codeId: v,
    codeName: `${v.split('-')[0]}-${v.split('-')[1]} ${getCodeName('ALNCMP_CD', v.split('-')[3])} 15,000원`, // TODO 지원금액 임의설정
  })) || [];
}

function reconnectReactivities() {
  pdPrcFnlDtlId = toRef(props.modelValue, 'pdPrcFnlDtlId');
  verSn = toRef(props.modelValue, 'verSn');
  fnlAmt = toRef(props.modelValue, 'fnlAmt');
  rentalDiscountFixed = toRef(props.modelValue, 'rentalDiscountFixed');
  pdQty = toRef(props.modelValue, 'pdQty');
  mchnCh = toRef(props.modelValue, 'mchnCh');
  cntrRels = toRef(props.modelValue, 'cntrRels');
  bcMngtPdYn = toRef(props.modelValue, 'bcMngtPdYn'); /* 바코드관리상품여부 */
  promotions = toRef(props.modelValue, 'promotions'); /* 적용가능한 프로모션 목록 */
  appliedPromotions = toRef(props.modelValue, 'appliedPromotions'); /* 적용된 프로모션 */
  finalPriceOptions = toRef(props.modelValue, 'finalPriceOptions'); /* 적용된 프로모션 */
  alncCntrNms = toRef(props.modelValue, 'alncCntrNms');
}

async function onChangeModelValue(newDtl) {
  if (newDtl.finalPriceOptions) {
    finalPriceOptions.value = newDtl.finalPriceOptions;
  }
  if (!finalPriceOptions.value?.length) {
    await fetchFinalPriceOptions();
  }
  reconnectReactivities();
  initPriceDefineVariables();
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
      codeName: '선택안함',
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

const onePlusOneDisable = computed(() => {
  const machineChanged = mchnCh.value?.mchnChYn;
  const priceIsNotSelectable = !(priceDefineVariableOptions.value.rentalDscTpCd || [])
    .map((code) => code.codeId)
    .includes(RENTAL_DSC_TP_CD_ONE_PLUS_ONE);
  return machineChanged || priceIsNotSelectable;
});

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

pdQty.value = 1;

function filterFinalPriceByVariables(finalPrice) {
  // variableNames.forEach((variableName) => {
  //   if (!!priceDefineVariables.value[variableName]
  //     && finalPrice[variableName] !== priceDefineVariables.value[variableName]) {
  //     return false;
  //   }
  // });
  return variableNames.every((variableName) => {
    if (!priceDefineVariableOptions.value[variableName]?.length) {
      return true;
    }
    const selected = priceDefineVariables.value[variableName] === EMPTY_ID ? undefined
      : priceDefineVariables.value[variableName];
    // if (finalPrice[variableName] !== selected) {
    //   console.log(variableName, ', finalPrice: ', finalPrice[variableName], ', selected: ', selected);
    // }

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
}

initializePrice();

const promotionAppliedPrice = ref();

const displayedFinalPrice = computed(() => (selectedFinalPrice.value
  ? `${stringUtil.getNumberWithComma(selectedFinalPrice.value.fnlVal)}원`
  : '미확정'));

function clearPromotions() {
  promotions.value = [];
  appliedPromotions.value = [];
  promotionAppliedPrice.value = undefined;
}

function calcPromotionAppliedPrice(aplyPmots) {
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
  const totalDscApyAmt = aplyPmots
    .reduce((acc, promotion) => {
      if (Number.isNaN(Number(promotion.dscApyAmt))) {
        return acc;
      }
      return acc + Number(promotion.dscApyAmt);
    }, 0);
  const pmotAplyPrice = Math.max(minRentalFxam - totalDscApyAmt, 0);
  if (selectedFinalPrice.value?.fnlVal === pmotAplyPrice) {
    return;
  }
  promotionAppliedPrice.value = `${stringUtil.getNumberWithComma(pmotAplyPrice)}원`;
  emit('promotion-changed', aplyPmots, promotionAppliedPrice.value);
}

watch(selectedFinalPrice, (newPrice) => {
  fnlAmt.value = newPrice?.fnlVal ?? undefined;
  pdPrcFnlDtlId.value = newPrice?.pdPrcFnlDtlId ?? undefined;
  emit('price-changed', newPrice);
  clearPromotions();

  if (isExistAlncPd.value) {
    fetchAllianceContracts(); // 제휴 계약 정보 가져오기
  }
});

function onClickDeviceChange() {
  emit('device-change', props.modelValue);
}

function onClickOnePlusOne() {
  console.log('onePlusOneDisable', onePlusOneDisable.value);
  emit('one-plus-one', props.modelValue);
}

function onClickDelete() {
  emit('delete');
}

function onClickDeleteDeviceChange() {
  mchnCh.value = {};
}

function onDeleteOnePlusOne() {
  priceDefineVariables.value.sellDscTpCd = undefined;
  rentalDiscountFixed.value = false;
  emit('delete:one-plus-one', props.modelValue);
}

async function onChangeAlncCntr(selected) {
  const tot = selected.reduce((sum, v) => (sum + parseInt(v.split('-')[2], 10)), 0);
  if (tot > selectedFinalPrice.value.fnlVal) {
    alert('제휴 지원금이 렌탈료보다 큽니다.');
    alncCntrNms.value = [];
    return;
  }
  console.log(tot, selectedFinalPrice.value.fnlVal);
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
