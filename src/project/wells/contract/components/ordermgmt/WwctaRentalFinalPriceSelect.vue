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
          <!--가격 표기-->
          <div class="scoped-item__price row items-center">
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
        v-if="!readonly"
        side
        top
      >
        <kw-item-label class="scoped-item__header-btns flex gap-xs">
          <kw-btn
            v-if="showInitBtn"
            :label="'초기화'"
            dense
            @click="initializePriceDefineVariable"
          />
          <kw-btn-dropdown
            v-if="showPackageBtn"
            :disable="disablePackage"
            label="다건할인"
            dense
            auto-close
          >
            <kw-btn
              v-for="(rentalDscTpCd) in packageRentalDscTpCds"
              :key="`package-btn-${rentalDscTpCd}`"
              v-close-popup
              :label="getCodeName('RENTAL_DSC_TP_CD', rentalDscTpCd)"
              @click="onClickPackage(rentalDscTpCd)"
            />
          </kw-btn-dropdown>
          <!-- 로그인한 사용자의 채널이 5010(온라인총판) 이면 기기변경 버튼 발생하지 않음 -->
          <kw-btn
            v-if="showMachineChangeBtn"
            :disable="disableMachineChange"
            label="기기변경"
            dense
            @click="onClickDeviceChange"
          />
          <kw-btn
            v-if="showOnePlusOnePrice"
            :disable="disableOnePlusOne"
            label="1+1"
            dense
            @click="onClickOnePlusOne"
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
          v-if="!modify"
          borderless
          icon="close_24"
          class="scoped-item__delete-btn w24 kw-font-pt24"
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
            <kw-form-row :cols="2">
              <kw-form-item
                v-if="multiplePossible && !readonly"
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
              <kw-form-item
                v-if="priceDefineVariableOptions.cntrAmt"
                :label="'등록비'"
              >
                <kw-select
                  v-model="priceDefineVariables.cntrAmt"
                  :options="priceDefineVariableOptions.cntrAmt"
                  :readonly="readonly"
                  placeholder="등록비"
                  first-option="select"
                  dense
                  @change="onChangeVariable"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                v-if="priceDefineVariableOptions.stplPrdCd"
                :label="'약정기간'"
              >
                <kw-select
                  v-model="priceDefineVariables.stplPrdCd"
                  :options="priceDefineVariableOptions.stplPrdCd"
                  :readonly="readonly"
                  dense
                  placeholder="약정기간"
                  first-option="select"
                  @change="onChangeVariable"
                />
              </kw-form-item>
              <kw-form-item
                v-if="priceDefineVariableOptions.cntrPtrm"
                :label="'계약기간'"
              >
                <kw-select
                  v-model="priceDefineVariables.cntrPtrm"
                  :options="priceDefineVariableOptions.cntrPtrm"
                  :readonly="readonly"
                  placeholder="계약기간"
                  first-option="select"
                  dense
                  @change="onChangeVariable"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row :cols="2">
              <kw-form-item
                v-if="priceDefineVariableOptions.rentalDscDvCd"
                :label="'렌탈할인구분'"
              >
                <kw-select
                  v-model="priceDefineVariables.rentalDscDvCd"
                  :options="priceDefineVariableOptions.rentalDscDvCd"
                  :readonly="readonly"
                  placeholder="렌탈할인구분"
                  first-option="select"
                  dense
                  @change="onChangeVariable"
                />
              </kw-form-item>
              <kw-form-item
                v-if="notNullRentalDscTpCdSelected || userSelectableRentalDscTpCd.length"
                :label="'렌탈할인유형'"
              >
                <kw-input
                  v-if="notNullRentalDscTpCdSelected"
                  bg-color="bg-white"
                  :model-value="labelGenerator.rentalDscTpCd(priceDefineVariables.rentalDscTpCd)"
                  borderless
                  placeholder=""
                  first-option="select"
                  dense
                  readonly
                  :clearable="false"
                  @change="onChangeVariable"
                >
                  <template #append>
                    <kw-btn
                      v-if="!readonly
                        && RENTAL_DSC_TP_CD_USER_SELECTABLE.includes(priceDefineVariables.rentalDscTpCd)
                        && !cntrRels?.length"
                      borderless
                      icon="clear"
                      @click="onClickRemoveRentalDscTpCd"
                    />
                  </template>
                </kw-input>
                <kw-select
                  v-if="!notNullRentalDscTpCdSelected && userSelectableRentalDscTpCd?.length"
                  v-model="priceDefineVariables.rentalDscTpCd"
                  :options="userSelectableRentalDscTpCd"
                  :readonly="readonly"
                  placeholder="렌탈할인유형"
                  clearable
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
                  :readonly="readonly"
                  :disable="!normalizedCrpDscrPriceOptions?.length"
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
                  :readonly="readonly"
                  :disable="!normalizedCrpDscrPriceOptions?.length"
                  :step="100"
                  :min="0"
                  :max="maxSellDscCtrAmt"
                  align="right"
                  dense
                  suffix="원"
                  :clearable="false"
                  @update:model-value="onChangeSellDscCtrAmt"
                />
                <!--                <kw-input
                  v-if="false"
                  :model-value="sellDscCtrAmtStr"
                  :readonly="readonly"
                  align="right"
                  dense
                  suffix="원"
                  :clearable="false"
                  @update:model-value="onChangeSellDscCtrAmtStr"
                />-->
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
                  :readonly="readonly"
                  :step="100"
                  :min="0"
                  :max="maxAftnAmt"
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
                  :readonly="readonly"
                  placeholder="서비스(용도/방문주기)"
                  first-option="select"
                  dense
                  @change="onChangeVariable"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                v-if="priceDefineVariableOptions.asMcn"
                :label="'AS기간'"
              >
                <kw-select
                  v-model="priceDefineVariables.asMcn"
                  :options="priceDefineVariableOptions.asMcn"
                  :readonly="readonly"
                  first-option="select"
                  :label="'AS기간'"
                  dense
                  @change="onChangeVariable"
                />
              </kw-form-item>
              <kw-form-item
                v-if="sellEvCdsBySellChnlDtlCd.length"
                label="행사코드"
              >
                <kw-select
                  v-model="wellsDtl.sellEvCd"
                  :options="sellEvCdsBySellChnlDtlCd"
                  :readonly="readonly"
                  placeholder="행사코드"
                  dense
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row
              v-if="filteredAlncCntrPriceCodes.length"
            >
              <kw-form-item
                v-if="filteredAlncCntrPriceCodes.length"
                label="제휴 계약"
              >
                <kw-select
                  v-model="alncCntrNms"
                  :options="filteredAlncCntrPriceCodes"
                  :model-value="alncCntrNms ? alncCntrNms : []"
                  multiple
                  :readonly="readonly"
                  placeholder="제휴 계약"
                  dense
                  @change="onChangeAlncCntr"
                />
              </kw-form-item>
            </kw-form-row>
          </kw-form>
        </kw-item-section>
      </kw-item>
      <!-- 계약관계 -->
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
              {{ labelForCntrRel(cntrRel) }}
              <kw-tooltip show-when-ellipsised>
                {{ labelForCntrRel(cntrRel) }}
              </kw-tooltip>
            </div>
          </kw-item-label>
          <kw-item-label
            v-if="cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD.LK_ONE_PLUS_ONE"
            class="hp-like-kw-notification-item"
            lines="2"
          >
            (1+1)기존제품 12개월 유지, 미유지 시 할인금액 반환 및 렌탈료 원복
          </kw-item-label>
        </kw-item-section>
        <kw-item-section
          side
          top
        >
          <kw-btn
            v-if="cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD.LK_ONE_PLUS_ONE && !readonly"
            borderless
            icon="close_24"
            class="w24 kw-font-pt24"
            @click="onDeleteOnePlusOne"
          />
        </kw-item-section>
      </kw-item>
      <!-- 기기변경 -->
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
            v-if="!readonly"
            borderless
            icon="close_24"
            class="w24 kw-font-pt24"
            @click="onClickDeleteDeviceChange"
          />
        </kw-item-section>
      </kw-item>
      <promotion-select
        :key="`promotion-select-${modelValue?.pdCd ?? ''}`"
        v-model="appliedPromotions"
        :readonly="readonly"
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
import { getNumberWithComma } from '~sms-common/contract/util';
import usePriceSelect, { EMPTY_ID } from '~sms-wells/contract/composables/usePriceSelect';
import {
  getAftnAmt,
  getDisplayedPrice,
  getPromotionAppliedPrice,
} from '~sms-wells/contract/utils/CtPriceUtil';
import {
  CNTR_REL_DTL_CD,
  CNTR_TP_CD,
  RENTAL_DSC_DV_CD,
  RENTAL_DSC_TP_CD,
} from '~sms-wells/contract/constants/ctConst';
import { warn } from 'vue';

const props = defineProps({
  modelValue: { type: Object, default: undefined },
  bas: { type: Object, default: undefined },
  modify: Boolean,
  readonly: Boolean, // 변경시 요청에 의해 모든 수정을 막고 조회만 해야하는 경우가 있다고 합니다. - 한상일 부장님 요청 사항.
});
const emit = defineEmits([
  'select:device',
  'delete:device',
  'select:one-plus-one',
  'delete:one-plus-one',
  'change:package',
  'packaging',
  'price-changed',
  'promotion-changed',
  'delete',
]);

const { codes, getCodeName } = await useCtCode(
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'RENTAL_DSC_DV_CD',
  'RENTAL_CRP_DSCR_CD',
  'RENTAL_DSC_TP_CD',
  'RENTAL_COMBI_DV_CD',
  'SV_TP_CD',
  'SV_VST_PRD_CD',
  'BFSVC_PRD_CD',
  'ALNCMP_CD',
  'CNTR_REL_DTL_CD',
  'SELL_EV_CD',
);

const dataService = useDataService();

const RENTAL_DSC_TP_CD_PACKAGE_CODES = [
  RENTAL_DSC_TP_CD.PACKAGE_2,
  RENTAL_DSC_TP_CD.PACKAGE_3,
  RENTAL_DSC_TP_CD.PACKAGE_OVER_4,
];
const RENTAL_DSC_TP_CD_USER_SELECTABLE = [
  EMPTY_ID,
  RENTAL_DSC_TP_CD.STCF_SEL,
  RENTAL_DSC_TP_CD.SPC_DSC_SEL_2,
  RENTAL_DSC_TP_CD.SELF_PURCHASE_DSC,
];

const sellEvCdsBySellChnlDtlCd = computed(() => {
  const { sellInflwChnlDtlCd } = props.bas;

  if (!sellInflwChnlDtlCd) {
    console.error('판매유입채널이 없음?', props.bas);
    return [];
  }
  if (!codes.SELL_EV_CD?.length) {
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

/* 직간접적으로 업데이트 할 값들 */
let pdPrcFnlDtlId;
// eslint-disable-next-line no-unused-vars
let verSn;
let fnlAmt;
let pdQty;
let mchnCh;
let cntrRels;
let ojCntrRels;
let appliedPromotions;
let promotions;
let alncCntrNms;
let finalPriceOptions;
let priceOptionFilter;
let wellsDtl;
let sellDscCtrAmt;
let crpSpcDsprc; // 법인특별할인가

function connectReactivities() {
  pdPrcFnlDtlId = toRef(props.modelValue, 'pdPrcFnlDtlId');
  verSn = toRef(props.modelValue, 'verSn');
  fnlAmt = toRef(props.modelValue, 'fnlAmt');
  pdQty = toRef(props.modelValue, 'pdQty', 1);
  mchnCh = toRef(props.modelValue, 'mchnCh');
  cntrRels = toRef(props.modelValue, 'cntrRels');
  ojCntrRels = toRef(props.modelValue, 'ojCntrRels');
  promotions = toRef(props.modelValue, 'promotions'); /* 적용가능한 프로모션 목록 */
  appliedPromotions = toRef(props.modelValue, 'appliedPromotions'); /* 적용된 프로모션 */
  alncCntrNms = toRef(props.modelValue, 'alncCntrNms');
  finalPriceOptions = toRef(props.modelValue, 'finalPriceOptions', []);
  priceOptionFilter = toRef(props.modelValue, 'priceOptionFilter', {});
  wellsDtl = toRef(props.modelValue, 'wellsDtl');
  wellsDtl.value ??= {};
  sellDscCtrAmt = toRef(props.modelValue, 'sellDscCtrAmt');
  crpSpcDsprc = toRef(props.modelValue, 'crpSpcDsprc');
}

const machineChanged = computed(() => !!dtl.value.mchnCh?.ojCntrNo);

const multiplePossible = computed(() => (!cntrRels.value?.length
    && !ojCntrRels.value?.length
    && !machineChanged.value
    && !props.modify));

connectReactivities();

const priceDefineVariables = ref({
  svPdCd: undefined,
  stplPrdCd: undefined,
  cntrAmt: undefined,
  cntrPtrm: undefined,
  asMcn: undefined,
  rentalDscDvCd: undefined,
  rentalCrpDscrCd: undefined,
  rentalDscTpCd: undefined,
  // rentalCombiDvCd: undefined, TODO
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
  stplPrdCd: (val) => {
    if (val === EMPTY_ID) {
      return '선택안함';
    }
    return `${val}개월`;
  },
  cntrAmt: (val, finalPrice) => {
    if (val === EMPTY_ID) {
      return '선택안함';
    }
    const { cntrAmt, cntrAmtDscYn } = finalPrice;
    if (cntrAmtDscYn === 'Y') {
      return '0원';
    }
    return `${getNumberWithComma(cntrAmt || 0)}원`;
  },
  cntrPtrm: (val) => {
    if (val === EMPTY_ID) {
      return '선택안함';
    }
    return `${val}개월`;
  },
  asMcn: (val) => {
    if (val === EMPTY_ID) {
      return '선택안함';
    }
    return `${val}개월`;
  },
  rentalDscDvCd: (val) => {
    if (val === EMPTY_ID) {
      return '선택안함';
    }
    return getCodeName('RENTAL_DSC_DV_CD', val);
  },
  rentalCrpDscrCd: (val) => {
    if (val === EMPTY_ID) {
      return '선택안함';
    }
    return getCodeName('RENTAL_CRP_DSCR_CD', val);
  },
  rentalDscTpCd: (val) => {
    if (val === EMPTY_ID) {
      return '미적용';
    }
    return getCodeName('RENTAL_DSC_TP_CD', val);
  },
  rentalCombiDvCd: (val) => {
    if (val === EMPTY_ID) {
      return '선택안함';
    }
    return getCodeName('RENTAL_COMBI_DV_CD', val);
  },
};

const {
  priceDefineVariableOptions,
  setPriceDefineVariablesBy,
  setVariablesIfUniqueSelectable,
  selectedFinalPrice, // computed
  // eslint-disable-next-line no-unused-vars
  selectedFinalPrices, // computed
  initializePriceDefineVariable,
} = usePriceSelect(
  priceDefineVariables,
  finalPriceOptions,
  labelGenerator,
  priceOptionFilter,
);

const labelForSellTpCd = computed(() => {
  const product = dtl.value;
  if (!product) {
    return undefined;
  }
  if (product.sellTpCd && product.sellTpDtlCd) {
    return `${getCodeName('SELL_TP_CD', product.sellTpCd)}-${getCodeName('SELL_TP_DTL_CD', product.sellTpDtlCd)}`;
  }
});

// region [제휴계약]
const alncCntrs = ref([]);
const filteredAlncCntrPriceCodes = computed(() => alncCntrs.value
  .filter((alncCntr) => alncCntr.svPdCd === priceDefineVariables.value.svPdCd
        && alncCntr.stplPrdCd === priceDefineVariables.value.stplPrdCd)
  .map((v) => ({
    codeId: `${v.klyear}-${v.klcode}-${v.klpont}-${v.alncmpCd}`,
    codeName: `${v.klyear}-${v.klcode} ${v.alncmpNm} ${getNumberWithComma(v.klpont || 0)}원`,
  })) || []);

function initializeAlncCntrs() {
  alncCntrs.value = alncCntrNms.value?.map((v) => ({
    codeId: v,
    codeName: `${v.split('-')[0]}-${v.split('-')[1]} ${getCodeName('ALNCMP_CD', v.split('-')[3])} 15,000원`, // TODO 지원금액 임의설정
  })) || [];
}

let promiseForFetchAllianceContracts; // 여러번 요청 방지용...
async function fetchAllianceContracts() {
  const params = {
    cstNo: props.bas?.cntrCstNo,
    sellTpCd: dtl.value?.sellTpCd,
    pdCd: dtl.value.pdCd,
  };

  if (!promiseForFetchAllianceContracts) {
    promiseForFetchAllianceContracts = dataService
      .get('sms/wells/contract/final-price/alliance-contracts', { params });
  }
  const { data } = await promiseForFetchAllianceContracts;
  promiseForFetchAllianceContracts = null;

  // klpont 가 0인 경우 제외
  alncCntrs.value = data.filter((v) => (v.klpont > 0));
}

// endregion [제휴계약]

// region [법인특별할인]
const sellDscCtrAmtEditable = computed(() => {
  if (priceDefineVariables.value.rentalDscDvCd !== RENTAL_DSC_DV_CD.CRP_GROUP_BUYING) {
    return false;
  }

  if (selectedFinalPrices.value?.length > priceDefineVariableOptions.value.rentalCrpDscrCd?.length) {
    return false;
  }

  const visit = {};
  // 현재 선택 가능한 모든 가격이 법인특별할인 대상가격인 경우
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
    stplPrdCd: (priceDefineVariables.value.stplPrdCd === EMPTY_ID
      ? undefined : priceDefineVariables.value.stplPrdCd),
    cntrAmt: (priceDefineVariables.value.cntrAmt === EMPTY_ID
      ? undefined : priceDefineVariables.value.cntrAmt),
    cntrPtrm: (priceDefineVariables.value.cntrPtrm === EMPTY_ID
      ? undefined : priceDefineVariables.value.cntrPtrm),
    asMcn: (priceDefineVariables.value.asMcn === EMPTY_ID
      ? undefined : priceDefineVariables.value.asMcn),
    rentalDscDvCd: (priceDefineVariables.value.rentalDscDvCd === EMPTY_ID
      ? undefined : priceDefineVariables.value.rentalDscDvCd),
    rentalDscTpCd: (priceDefineVariables.value.rentalDscTpCd === EMPTY_ID
      ? undefined : priceDefineVariables.value.rentalDscTpCd),
  };
  const crpDscrPriceOptions = finalPriceOptions.value.filter((price) => (
    price.svPdCd === filteringObject.svPdCd
      && price.stplPrdCd === filteringObject.stplPrdCd
      && price.cntrAmt === filteringObject.cntrAmt
      && price.cntrPtrm === filteringObject.cntrPtrm
      && price.asMcn === filteringObject.asMcn
      && price.rentalDscDvCd === filteringObject.rentalDscDvCd
      && price.rentalDscTpCd === filteringObject.rentalDscTpCd));
  const normalizedArr = crpDscrPriceOptions.map((price) => {
    const { fnlVal, rentalCrpDscrCd, asctDscBaseAmt, asctDscLstAmt } = price;
    return {
      rentalCrpDscrCd,
      max: fnlVal - asctDscBaseAmt,
      maxForAll: fnlVal - asctDscLstAmt,
    };
  });
  normalizedArr.sort((a, b) => a.max - b.max);
  // 법인특별할인금액은 음수가 아닌 정수 값임을 가정합니다.
  // 해당 가격 옵션에 대한 가능한 구간은 min < value <= max 로 정의한다.
  // 반개구간이어야지 겹치는 구간이 없기 때문이다.
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

watch(sellDscCtrAmtEditable, (value) => {
  if (!value) {
    sellDscCtrAmt.value = undefined;
    priceDefineVariables.value.rentalCrpDscrCd = undefined;
  }
});

// sellDscCtrAtm 와 rentalCrpDscrCd 는 서로에게 영향을 미칩니다.
// eslint-disable-next-line no-unused-vars
function onChangeSellDscCtrAmt(newSellDscCtrAmt) {
  if (!newSellDscCtrAmt) {
    return;
  }
  if (!mapToRentalCrpDscrCdToRangeOfSellDscCtrAmt.value) {
    warn('The mapToRentalCrpDscrCdToRangeOfSellDscCtrAmt is empty.');
    return;
  }
  const newValue = Math.max(newSellDscCtrAmt, 0);
  // region ->  컴포넌트 변경하면서 발생 안할 예정
  if (newValue > maxSellDscCtrAmt.value) {
    sellDscCtrAmt.value = 0;
    nextTick().then(() => {
      sellDscCtrAmt.value = maxSellDscCtrAmt.value;
      priceDefineVariables.value.rentalCrpDscrCd = maxRentalCrpDscrCd.value;
    });
    return;
  }
  // regionend -> 컴포넌트 변경하면서 발생 안할 예정

  const rentalCrpDscrCd = Object.keys(mapToRentalCrpDscrCdToRangeOfSellDscCtrAmt.value).find((key) => {
    const range = mapToRentalCrpDscrCdToRangeOfSellDscCtrAmt.value[key];
    if (!range) { return false; }
    const { min, max } = range ?? {};
    return min < newValue && newValue <= max;
  });
  if (!rentalCrpDscrCd) {
    warn('The rentalCrpDscrCd is empty.');
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
    warn('The mapToRentalCrpDscrCdToRangeOfSellDscCtrAmt is empty.');
    return;
  }

  const rangeForSellDscCtrAmt = mapToRentalCrpDscrCdToRangeOfSellDscCtrAmt.value[newRentalCrpDscrCd];
  if (!rangeForSellDscCtrAmt) {
    warn('The rangeForSellDscCtrAmt is empty.');
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

// region [패키지 다건 할인 유형 적용]
const notNullRentalDscTpCdSelected = computed(() => priceDefineVariables.value.rentalDscTpCd === EMPTY_ID
    || !!priceDefineVariables.value.rentalDscTpCd);

const userSelectableRentalDscTpCd = computed(() => (priceDefineVariableOptions.value.rentalDscTpCd || [])
  .filter((code) => RENTAL_DSC_TP_CD_USER_SELECTABLE.includes(code.codeId)));
// endregion [패키지 다건 할인 유형 적용]

// region [계약 관계 버튼]
/*
계약 관계 버튼 컨트롤

판매유입채널코드가 온라인 총판(5010)일 경우를 제외하고, 기기 변경 버튼은 기본적으로 항상 노출된다.

기기 변경시 할인 유형 재렌탈 혹은 5년약정재렌탈이 걸릴 수 있다.
할인유형이 선택 되었으면,  기기 변경 버튼을 비활성화 하도록 한다.
('선택안함' 역시 선택이다. 다건할인 시, 할인 대상 상품이 아닌 경우 '선택안함'으로 강제한다.)
재렌탈 5년 약정 재렌탈이 아닌, 다른 할인 유형을 적용하면서,
기기 변경을 하기 위해서는 기기변경을 먼저 지정하고, 할인 유형을 지정한다.

다건 할인과 1+1 버튼의 노출 여부는 해당 할인유형을 가지고 있는 가격 옵션이 존재하는지에 따라 바뀐다.

다건할인(14,15,16), 1+1(03) 과 기기변경(재렌탈 할인 아님)은 상호 배타적이다.
해당 버튼들은 기기변경건이 있다면 비활성화 된다.
또한 현재 선택할 수 있는 할인유형에 해당 옵션이 존재하지 않으면 비활성화된다.
할인유형이 선택 되었으면, 비활성화한다. 재 활성화 하려면 할인유형을 제거하고 진행한다.
또한 계약 관계에 있어 배타적 할인유형에 따른 계약 관계가 존재하면 비활성화 한다.
-> '선택안함' 도 선택으로 치면 불필요.

추가로 다건할인의 경의 '팝업' 이 미적용 가를 요구하므로 가격이 정해져야 한다.
고로 반대로 미선택 혹은 '선택안함' 상태일 때 버튼을 활성화 한다.
정말이지 복잡하다.
또한 계약 관계에 있어 배타적 할인유형에 따른 계약 관계가 존재하면 비활성화 한다.

점심은 나가서 먹자.

* */
const showInitBtn = computed(() => {
  if (machineChanged.value) {
    return false;
  }
  if (ojCntrRels.value?.length || cntrRels.value?.length) {
    return false;
  }
  return !promotions.value?.length;
});

const showMachineChangeBtn = computed(() => props.bas.sellInflwChnlDtlCd !== '5010');

const disableMachineChange = computed(() => (notNullRentalDscTpCdSelected.value
  || pdQty.value > 1));

const showOnePlusOnePrice = computed(() => !!finalPriceOptions.value
  .find((price) => price.rentalDscTpCd === RENTAL_DSC_TP_CD.ONE_PLUS_ONE));

const disableOnePlusOne = computed(() => {
  const priceIsNotSelectable = !(priceDefineVariableOptions.value.rentalDscTpCd || [])
    .map((code) => code.codeId)
    .includes(RENTAL_DSC_TP_CD.ONE_PLUS_ONE);
  return machineChanged.value
    || priceIsNotSelectable
    || notNullRentalDscTpCdSelected.value
    || pdQty.value > 1;
});

const showPackageBtn = computed(() => !!finalPriceOptions.value
  .find((price) => RENTAL_DSC_TP_CD_PACKAGE_CODES.includes(price.rentalDscTpCd)));

const disablePackage = computed(() => {
  const priceIsNotSelectable = !(priceDefineVariableOptions.value.rentalDscTpCd || [])
    .map((code) => code.codeId)
    .some((codeId) => RENTAL_DSC_TP_CD_PACKAGE_CODES.includes(codeId));
  return machineChanged.value
    || priceIsNotSelectable
    || (priceDefineVariables.value.rentalDscTpCd !== EMPTY_ID
          && !!priceDefineVariables.value.rentalDscTpCd)
    || cntrRels.value?.some((cntrRel) => [
      CNTR_REL_DTL_CD.LK_ONE_PLUS_ONE,
      CNTR_REL_DTL_CD.LK_MLTCS_PRCHS,
    ].includes(cntrRel.cntrRelDtlCd))
    || pdQty.value > 1;
});

const lkSdingCntrRel = computed(() => (
  ojCntrRels.value?.find((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD.LK_SDING)));

const showChangeWellsFarmPackageBtn = computed(() => {
  const { pdLclsfId } = dtl.value;
  if (!pdLclsfId) {
    return false;
  }
  const isWellsFarmProduct = pdLclsfId === 'PDC000000000120';
  return isWellsFarmProduct;
});

// endregion [계약 관계 버튼]

// region [가격표기]
const displayedFinalPrice = computed(() => (
  getDisplayedPrice(selectedFinalPrice.value, props.modelValue?.sellDscCtrAmt || 0)
));

const promotionAppliedPrice = computed(() => (
  getPromotionAppliedPrice(selectedFinalPrice.value, appliedPromotions.value, props.modelValue?.sellDscCtrAmt || 0)
));

const maxAftnAmt = computed(() => {
  if (!selectedFinalPrice.value) { return; }
  return getAftnAmt(selectedFinalPrice.value, appliedPromotions.value, 0);
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
  sellDscCtrAmt.value = maxAftnAmt.value - crpSpcDsprc.value;
}

watch(crpSpcDsprcEditable, (value) => {
  if (!value) {
    crpSpcDsprc.value = undefined;
  }

  if (crpSpcDsprc.value === undefined) {
    crpSpcDsprc.value = getAftnAmt(selectedFinalPrice.value, appliedPromotions.value, sellDscCtrAmt.value);
  }

  onChangeCrpSpcDsprc();
});
// endregion [B2B법인특별할인]

let promiseForFetchFinalPriceOptions;

async function fetchFinalPriceOptions() {
  if (!promiseForFetchFinalPriceOptions) {
    promiseForFetchFinalPriceOptions = dataService.get('sms/wells/contract/final-price', {
      params: {
        cntrNo: props.bas.cntrNo,
        pdCd: dtl.value.pdCd,
        hgrPdCd: dtl.value.hgrPdCd === dtl.value.pdCd ? undefined : dtl.value.hgrPdCd,
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

  if (props.bas?.cntrTpCd !== CNTR_TP_CD.QUOTE) { // 견적서 아닐 때
    await fetchAllianceContracts();
  }
}

function initPriceDefineVariables() {
  if (!pdPrcFnlDtlId.value) {
    initializePriceDefineVariable();
    setVariablesIfUniqueSelectable(['rentalDscTpCd']);
    return;
  }
  setPriceDefineVariablesBy(pdPrcFnlDtlId.value);
  initializeAlncCntrs();
}

function clearPromotions() {
  promotions.value = [];
  appliedPromotions.value = [];
}

const packageRentalDscTpCds = computed(() => (priceDefineVariableOptions.value.rentalDscTpCd || [])
  .map((code) => code.codeId)
  .filter((codeId) => RENTAL_DSC_TP_CD_PACKAGE_CODES.includes(codeId)));

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

function onClickDeviceChange() {
  emit('select:device', props.modelValue);
}

function onClickDeleteDeviceChange() {
  emit('delete:device', props.modelValue);
}

function onClickOnePlusOne() {
  emit('select:one-plus-one', props.modelValue);
}

function onClickPackage(rentalDscTpCd) {
  emit('packaging', props.modelValue, rentalDscTpCd);
}

function onClickDelete() {
  emit('delete');
}

function onDeleteOnePlusOne() {
  priceDefineVariables.value.rentalDscTpCd = EMPTY_ID;
  emit('delete:one-plus-one', props.modelValue);
}

function onClickRemoveRentalDscTpCd() {
  const { rentalDscTpCd } = priceDefineVariables.value;

  /* TODO: 나머지도 처리 */
  if (rentalDscTpCd === RENTAL_DSC_TP_CD.ONE_PLUS_ONE) {
    onDeleteOnePlusOne();
  }
  priceDefineVariables.value.rentalDscTpCd = undefined;
}

function onChangeAlncCntr(selected) {
  const tot = selected.reduce((sum, v) => (sum + parseInt(v.split('-')[2], 10)), 0);
  if (tot > selectedFinalPrice.value.fnlVal) {
    alert('제휴 지원금이 렌탈료보다 큽니다.');
    alncCntrNms.value = [];
  }
}

function onClickChangeWellsFarmPackage() {
  emit('change:package', props.modelValue);
}

function labelForCntrRel(cntrRel) {
  if (!cntrRel) {
    return '';
  }

  const { ojBasePdBas, ojDtlCntrNo, ojDtlCntrSn } = cntrRel;
  const { cstBasePdAbbrNm, pdNm } = ojBasePdBas ?? {};

  return `${cstBasePdAbbrNm || pdNm || ''} ${ojDtlCntrSn ? `${ojDtlCntrNo}-${ojDtlCntrSn}` : ''}`;
}

</script>

<style lang="scss" scoped>
@import "~@css/variables";
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
    position: relative;
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
