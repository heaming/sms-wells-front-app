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
          <kw-btn-dropdown
            v-if="showPackageBtn"
            :disable="disablePackage"
            label="다건할인"
            dense
          >
            <kw-btn
              v-for="(rentalDscTpCd) in packageRentalDscTpCds"
              :key="`package-btn-${rentalDscTpCd}`"
              v-close-popup
              :label="getCodeName('RENTAL_DSC_TP_CD', rentalDscTpCd)"
              @click.stop="onClickPackage(rentalDscTpCd)"
            />
          </kw-btn-dropdown>
          <!-- 로그인한 사용자의 채널이 5010(온라인총판) 이면 기기변경 버튼 발생하지 않음 -->
          <kw-btn
            v-if="showMachineChangeBtn"
            :disable="notNullRentalDscTpCdSelected"
            label="기기변경"
            dense
            @click.stop="onClickDeviceChange(item)"
          />
          <kw-btn
            v-if="showOnePlusOnePrice"
            :disable="disableOnePlusOne"
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
            <kw-form-row :cols="2">
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
                  @change="forcedChangeValidVariable"
                >
                  <template #append>
                    <kw-btn
                      v-if="notNullRentalDscTpCdSelected"
                      borderless
                      icon="clear"
                      @click="onClickRemoveRentalDscTpCd"
                    />
                  </template>
                </kw-input>
                <kw-select
                  v-else-if="userSelectableRentalDscTpCd.length"
                  v-model="priceDefineVariables.rentalDscTpCd"
                  :options="userSelectableRentalDscTpCd"
                  placeholder="렌탈할인유형"
                  clearable
                  first-option="select"
                  dense
                  @change="forcedChangeValidVariable"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row
              v-if="rentalCrpDscrCdSelectable || selectedFinalPrice"
              :cols="2"
            >
              <kw-form-item
                v-if="rentalCrpDscrCdSelectable"
                :label="'법인할인율'"
              >
                <kw-select
                  v-model="priceDefineVariables.rentalCrpDscrCd"
                  :options="priceDefineVariableOptions.rentalCrpDscrCd"
                  first-option="select"
                  :label="'법인할인율'"
                  dense
                  @change="forcedChangeValidVariable"
                />
              </kw-form-item>
              <kw-form-item
                v-if="selectedFinalPrice"
                :label="'무상개월 AS/BS'"
              >
                {{
                  `${selectedFinalPrice.frisuPtrm || 0}개월 / ${selectedFinalPrice.recapPtrm || 0}개월`
                }}
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
              v-if="alncCntrNms?.length || (filteredAlncCntrPriceCodes.length > 0)"
            >
              <kw-form-item label="제휴 계약">
                <kw-select
                  v-model="alncCntrNms"
                  :options="filteredAlncCntrPriceCodes"
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
          <kw-item-label
            v-if="cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_ONE_PLUS_ONE"
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
            v-if="cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_ONE_PLUS_ONE"
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
import { warn } from 'vue';
import ZwcmCounter from '~common/components/ZwcmCounter.vue';
import { getNumberWithComma } from '~sms-common/contract/util';

const props = defineProps({
  modelValue: { type: Object, default: undefined },
  bas: { type: Object, default: undefined },
  dtl: { type: Object, default: undefined, validator: (obj) => isReactive(obj) },
});
const emit = defineEmits([
  'device-change',
  'one-plus-one',
  'packaging',
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

const EMPTY_SYM = Symbol('__undef__');
const EMPTY_ID = ''; /*  FIXME!!! */

const CNTR_REL_DTL_CD_LK_ONE_PLUS_ONE = '215';
const CNTR_REL_DTL_CD_LK_MLTCS_PRCHS = '22M';
const RENTAL_DSC_TP_CD_ONE_PLUS_ONE = '03';
const RENTAL_DSC_TP_CD_PACKAGE_2 = '14';
const RENTAL_DSC_TP_CD_PACKAGE_3 = '15';
const RENTAL_DSC_TP_CD_PACKAGE_OVER_4 = '16';
const RENTAL_DSC_TP_CD_STCF_SEL = '81';
const RENTAL_DSC_TP_CD_SPC_DSC_SEL_2 = '82';
const RENTAL_DSC_TP_CD_SELF_PURCHASE_DSC = '83';
const RENTAL_DSC_TP_CD_PACKAGE_CODES = [
  RENTAL_DSC_TP_CD_PACKAGE_2,
  RENTAL_DSC_TP_CD_PACKAGE_3,
  RENTAL_DSC_TP_CD_PACKAGE_OVER_4,
];
const RENTAL_DSC_TP_CD_USER_SELECTABLE = [
  RENTAL_DSC_TP_CD_STCF_SEL,
  RENTAL_DSC_TP_CD_SPC_DSC_SEL_2,
  RENTAL_DSC_TP_CD_SELF_PURCHASE_DSC,
];

const dtl = ref(props.modelValue);

/* 직간접적으로 업데이트 할 값들 */
let pdPrcFnlDtlId = toRef(props.modelValue, 'pdPrcFnlDtlId');
let verSn = toRef(props.modelValue, 'verSn');
let fnlAmt = toRef(props.modelValue, 'fnlAmt');
let pdQty = toRef(props.modelValue, 'pdQty');
let mchnCh = toRef(props.modelValue, 'mchnCh');
let cntrRels = toRef(props.modelValue, 'cntrRels');
let bcMngtPdYn = toRef(props.modelValue, 'bcMngtPdYn'); /* 바코드관리상품여부 */
let appliedPromotions = toRef(props.modelValue, 'appliedPromotions', []); /* 적용된 프로모션 */
let promotions = toRef(props.modelValue, 'promotions', []); /* 적용가능한 프로모션 목록 */
let alncCntrNms = toRef(props.modelValue, 'alncCntrNms', []);
const packageRentalDscTpCds = toRef(props.modelValue, 'packageRentalDscTpCds');
let finalPriceOptions = toRef(props.modelValue, 'finalPriceOptions', []);

const filteredFinalPriceOptions = ref([]);

const priceOptionFilter = ref({});
const filteredVariableNames = computed(() => Object.getOwnPropertyNames(priceOptionFilter.value ?? {}));

const sellTpNm = computed(() => getCodeName('SELl_TP_CD', '2'));

const priceDefineVariables = ref({
  svPdCd: undefined,
  stplPrdCd: undefined,
  cntrAmt: undefined,
  cntrPtrm: undefined,
  asMcn: undefined,
  rentalDscDvCd: undefined,
  rentalCrpDscrCd: undefined,
  rentalDscTpCd: undefined,
  rentalCombiDvCd: undefined,
});

const alncCntrs = ref([]);
const filteredAlncCntrPriceCodes = computed(() => alncCntrs.value
  .filter((alncCntr) => alncCntr.svPdCd === priceDefineVariables.value.svPdCd
    && alncCntr.stplPrdCd === priceDefineVariables.value.stplPrdCd)
  .map((v) => ({
    codeId: `${v.klyear}-${v.klcode}-${v.klpont}-${v.alncmpCd}`,
    codeName: `${v.klyear}-${v.klcode} ${v.alncmpNm} ${stringUtil.getNumberWithComma(v.klpont || 0)}원`,
  })) || []);

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
      return '선택안함';
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

const variableNames = Object.getOwnPropertyNames(priceDefineVariables.value);

/* 저장된 값이 있다면 가격 결정요소를 맞추어 줍니다. */
function initPriceDefineVariables() {
  if (!pdPrcFnlDtlId.value) {
    return;
  }
  const selectedFinalPrice = filteredFinalPriceOptions.value
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

  alncCntrs.value = alncCntrNms.value?.map((v) => ({
    codeId: v,
    codeName: `${v.split('-')[0]}-${v.split('-')[1]} ${getCodeName('ALNCMP_CD', v.split('-')[3])} 15,000원`, // TODO 지원금액 임의설정
  })) || [];
}

function filteringFinalPriceOptions() {
  filteredFinalPriceOptions.value = finalPriceOptions.value;

  if (filteredVariableNames.value.length) {
    filteredFinalPriceOptions.value = finalPriceOptions.value
      .filter((finalPriceOption) => !filteredVariableNames.value
        .some((filteredVar) => {
          const optionsVar = finalPriceOption[filteredVar];
          const filterVar = priceOptionFilter.value[filteredVar];
          return (optionsVar || EMPTY_ID) !== (filterVar || EMPTY_ID);
        }));
  }
  if (!filteredFinalPriceOptions.value.length) {
    alert('필터에 해당하는 가격 조건이 없습니다.');
  }

  initPriceDefineVariables();
}

const notNullRentalDscTpCdSelected = computed(() => priceDefineVariables.value.rentalDscTpCd === EMPTY_ID
  || !!priceDefineVariables.value.rentalDscTpCd);

const rentalCrpDscrCdSelectable = computed(() => priceDefineVariables.value.rentalDscDvCd === '5');

watch(rentalCrpDscrCdSelectable, (value) => {
  if (!value) {
    priceDefineVariables.value.rentalCrpDscrCd = undefined;
  }
});

let promiseForFetchAllianceContracts;
let promiseForFetchFinalPriceOptions;

async function fetchAllianceContracts() {
  const params = {
    cstNo: props.bas?.cntrCstNo,
    sellTpCd: dtl.value?.sellTpCd,
    pdCd: dtl.value.pdCd,
    // stplPrdCd: priceDefineVariables.value?.stplPrdCd,
    // svPdCd: priceDefineVariables.value?.svPdCd,
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

  await fetchAllianceContracts();

  filteringFinalPriceOptions();
}

// eslint-disable-next-line no-unused-vars
function clearPriceDefineVariables() {
  variableNames.forEach((variableName) => {
    priceDefineVariables.value[variableName] = undefined;
  });
}

/* 이전에는 key 가 안정적이지 않아서 변경 가능성이 있었으나,
modelValue 에 따라 종속되는 tempKey-cntrSn 기반으로 인스턴스와 연결되므로, 발생하지 않을 것 으로 추측 중 */
function reconnectReactivities() {
  warn('reconnectReactivities called!');
  pdPrcFnlDtlId = toRef(props.modelValue, 'pdPrcFnlDtlId');
  verSn = toRef(props.modelValue, 'verSn');
  fnlAmt = toRef(props.modelValue, 'fnlAmt');
  pdQty = toRef(props.modelValue, 'pdQty');
  mchnCh = toRef(props.modelValue, 'mchnCh');
  cntrRels = toRef(props.modelValue, 'cntrRels');
  bcMngtPdYn = toRef(props.modelValue, 'bcMngtPdYn'); /* 바코드관리상품여부 */
  promotions = toRef(props.modelValue, 'promotions'); /* 적용가능한 프로모션 목록 */
  appliedPromotions = toRef(props.modelValue, 'appliedPromotions'); /* 적용된 프로모션 */
  alncCntrNms = toRef(props.modelValue, 'alncCntrNms');
  finalPriceOptions = toRef(props.modelValue, 'finalPriceOptions', []);
}

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
  options[variableName] = filteredFinalPriceOptions.value
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

const userSelectableRentalDscTpCd = computed(() => (priceDefineVariableOptions.value.rentalDscTpCd || [])
  .filter((code) => RENTAL_DSC_TP_CD_USER_SELECTABLE.includes(code.codeId)));

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

TODO 계약관계 잡히면 가격 수정 못하게 처리. pk 박아버리자.

* */

const showMachineChangeBtn = computed(() => props.bas.sellInflwChnlDtlCd !== '5010');

const showOnePlusOnePrice = computed(() => !!finalPriceOptions.value
  .find((price) => price.rentalDscTpCd === RENTAL_DSC_TP_CD_ONE_PLUS_ONE));

const disableOnePlusOne = computed(() => {
  const machineChanged = !!mchnCh.value?.ojCntrNo;
  const priceIsNotSelectable = !(priceDefineVariableOptions.value.rentalDscTpCd || [])
    .map((code) => code.codeId)
    .includes(RENTAL_DSC_TP_CD_ONE_PLUS_ONE);
  return machineChanged || priceIsNotSelectable || notNullRentalDscTpCdSelected.value;
});

const showPackageBtn = computed(() => !!finalPriceOptions.value
  .find((price) => RENTAL_DSC_TP_CD_PACKAGE_CODES.includes(price.rentalDscTpCd)));

const disablePackage = computed(() => {
  const machineChanged = !!mchnCh.value?.ojCntrNo;
  const priceIsNotSelectable = !(priceDefineVariableOptions.value.rentalDscTpCd || [])
    .map((code) => code.codeId)
    .some((codeId) => RENTAL_DSC_TP_CD_PACKAGE_CODES.includes(codeId));
  return machineChanged
    || priceIsNotSelectable
    || (priceDefineVariables.value.rentalDscTpCd !== EMPTY_ID
      && !!priceDefineVariables.value.rentalDscTpCd)
    // eslint-disable-next-line no-use-before-define
    || !selectedFinalPrice.value
    || cntrRels.value?.some((cntrRel) => [
      CNTR_REL_DTL_CD_LK_ONE_PLUS_ONE,
      CNTR_REL_DTL_CD_LK_MLTCS_PRCHS,
    ].includes(cntrRel.cntrRelDtlCd));
});

function forcedChangeValidVariable(val) {
  if (!val) {
    return;
  }
  variableNames
    .forEach((variableName) => {
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
  const selectedPrice = filteredFinalPriceOptions.value
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
  promotionAppliedPrice.value = `${stringUtil.getNumberWithComma(pmotAplyPrice)}원`;
  emit('promotion-changed', aplyPmots, promotionAppliedPrice.value);
}

function getPackageRentalDscTpCds() {
  packageRentalDscTpCds.value = (priceDefineVariableOptions.value.rentalDscTpCd || [])
    .map((code) => code.codeId)
    .filter((codeId) => RENTAL_DSC_TP_CD_PACKAGE_CODES.includes(codeId));
}

/* 불의의 사고로, modelValue 객체를 통으로 들어냈을 경우 */
async function onChangeModelValue(newDtl) {
  if (newDtl.finalPriceOptions) {
    finalPriceOptions.value ??= newDtl.finalPriceOptions;
  }
  if (!finalPriceOptions.value?.length) {
    await fetchFinalPriceOptions();
  }

  if (dtl.value !== newDtl) {
    dtl.value = newDtl;
    reconnectReactivities();
  }

  if (!pdPrcFnlDtlId.value) {
    initPriceDefineVariables();
  }
}

watch(() => props.modelValue, onChangeModelValue, { immediate: true });

function onChangeSelectedFinalPrice(newPrice) {
  if (!newPrice) {
    fnlAmt.value = undefined;
    pdPrcFnlDtlId.value = undefined;
    emit('price-changed', newPrice);
    clearPromotions();
    return;
  }
  fnlAmt.value = newPrice.fnlVal;
  pdPrcFnlDtlId.value = newPrice.pdPrcFnlDtlId;

  emit('price-changed', newPrice);
  clearPromotions();

  getPackageRentalDscTpCds();
}

async function onChangePriceOptionFilter(newPriceOptionFilter) {
  if (priceOptionFilter.value === newPriceOptionFilter) {
    return;
  }
  priceOptionFilter.value = newPriceOptionFilter;

  if (!finalPriceOptions.value.length) {
    await fetchFinalPriceOptions();
  }

  filteringFinalPriceOptions();

  filteredVariableNames.value.forEach((key) => {
    if (!Object.hasOwn(priceDefineVariables.value, key)) {
      warn(`가격 제한 옵션이 상이합니다. ${key}`);
      return;
    }
    priceDefineVariables.value[key] = priceOptionFilter.value[key] || EMPTY_ID;
  });

  forcedChangeValidVariable(true);
}

watch(selectedFinalPrice, onChangeSelectedFinalPrice, { immediate: true });

watch(() => props.modelValue?.priceOptionFilter, onChangePriceOptionFilter, { immediate: true });

function onClickDeviceChange() {
  emit('device-change', props.modelValue);
}

function onClickOnePlusOne() {
  emit('one-plus-one', props.modelValue);
}

function onClickPackage(rentalDscTpCd) {
  emit('packaging', props.modelValue, rentalDscTpCd);
}

function onClickDelete() {
  emit('delete');
}

function onClickDeleteDeviceChange() {
  mchnCh.value = {};
}

function onDeleteOnePlusOne() {
  priceDefineVariables.value.rentalDscTpCd = undefined;
  emit('delete:one-plus-one', props.modelValue);
}

function onClickRemoveRentalDscTpCd() {
  const { rentalDscTpCd } = priceDefineVariables.value;

  /* TODO: 나머지도 처리 */
  if (rentalDscTpCd === RENTAL_DSC_TP_CD_ONE_PLUS_ONE) {
    onDeleteOnePlusOne();
  }
  priceDefineVariables.value.rentalDscTpCd = undefined;
}

async function onChangeAlncCntr(selected) {
  const tot = selected.reduce((sum, v) => (sum + parseInt(v.split('-')[2], 10)), 0);
  if (tot > selectedFinalPrice.value.fnlVal) {
    alert('제휴 지원금이 렌탈료보다 큽니다.');
    alncCntrNms.value = [];
  }
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
