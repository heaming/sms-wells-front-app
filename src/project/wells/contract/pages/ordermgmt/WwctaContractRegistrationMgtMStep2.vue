<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [CTA] 통합계약서 작성 Step2
2. 프로그램 ID : WwctaContractRegistrationMgtMStep2
3. 작성자 : gs.piit159
4. 작성일 : 2023.05.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 통합계약서 작성 Step2
****************************************************************************************************
--->
<template>
  <div class="scoped-layout">
    <product-select
      class="scoped-layout__pick-area"
      :cntr-no="cntrNo"
      @select="onSelectProduct"
    />
    <kw-separator
      :spaced="false"
      vertical
    />
    <kw-scroll-area
      visible
      class="scoped-layout__mod-area"
      scroll-width="100%"
      scroll-style="padding: 0 40px;"
    >
      <h3 class="mt0">
        상품내역
      </h3>
      <kw-list
        separator
        item-padding="20px 0"
      >
        <template
          v-for="(item, index) in step2.dtls"
        >
          <single-pay-price-select
            v-if="item?.sellTpCd === '1'"
            :key="`${item.pdCd} + ${item.sellChnlDtlCd}`"
            :model-value="item"
            :bas="step2.bas"
            @price-changed="onPriceChanged"
            @delete="onClickDelete(index)"
          />
          <rental-price-select
            v-if="item?.sellTpCd === '2'"
            :key="`${item.pdCd} + ${item.sellChnlDtlCd}`"
            :model-value="item"
            :bas="step2.bas"
            @one-plus-one="onClickOnePlusOne"
            @delete:one-plus-one="onDeleteOnePlusOne"
            @device-change="onClickDeviceChange"
            @price-changed="onPriceChanged"
            @delete="onClickDelete(index)"
          />
          <membership-price-select
            v-if="item?.sellTpCd === '3'"
            :key="`${item.pdCd} + ${item.sellChnlDtlCd}`"
            :model-value="item"
            :bas="step2.bas"
            @delete="onClickDelete(index)"
          />
          <regular-shipping-price-select
            v-if="item?.sellTpCd === '6'"
            :key="`${item.pdCd} + ${item.sellChnlDtlCd}`"
            :model-value="item"
            :bas="step2.bas"
            @select-machine="onClickSelectMachine"
            @delete:select-machine="onDeleteSelectMachine"
            @select-seeding="onClickSelSdingCapsl"
            @select-capsule="onClickSelSdingCapsl"
            @delete="onClickDelete(index)"
          />
        </template>
      </kw-list>
    </kw-scroll-area>
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import ProductSelect from '~sms-wells/contract/pages/ordermgmt/WwctaContractRegistrationMgtMStep2SelectProduct.vue';
import SinglePayPriceSelect from '~sms-wells/contract/components/ordermgmt/WwctaSpayFinalPriceSelect.vue';
import RentalPriceSelect from '~sms-wells/contract/components/ordermgmt/WwctaRentalFinalPriceSelect.vue';
import MembershipPriceSelect from '~sms-wells/contract/components/ordermgmt/WwctaMembershipFinalPriceSelect.vue';
import RegularShippingPriceSelect
  from '~sms-wells/contract/components/ordermgmt/WwctaRegularShippingFinalPriceSelect.vue';
import { alert, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty, uniqueId } from 'lodash-es';
import { warn } from 'vue';

const props = defineProps({
  contract: { type: Object, required: true },
});
const emit = defineEmits([
  'activated',
  'contract-modified',
]);
const exposed = {};
defineExpose(exposed);

const { t } = useI18n();
const dataService = useDataService();
const { notify, modal } = useGlobal();

const CNTR_REL_DTL_CD_LK_RGLR_SHP_BASE = '214';
const CNTR_REL_DTL_CD_LK_ONE_PLUS_ONE = '215';
const CNTR_REL_DTL_CD_LK_SDING = '216';
// const CNTR_REL_DTL_CD_LK_MLTCS_PRCHS = '22M'; // 다건 구매

const cntrNo = toRef(props.contract, 'cntrNo');
const step2 = toRef(props.contract, 'step2');
const ogStep2 = ref({});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// async function getProducts() {
//   if (!cntrNo.value) {
//     await alert('잘못된 접근입니다.');
//     return;
//   }
//   const { data } = await dataService.get('sms/wells/contract/contracts/reg-products', {
//     params: {
//       cntrNo: cntrNo.value,
//       pdFilter: pdFilter.value,
//     },
//   });
//   classfiedPds.value = data.pdClsf;
//   pdFilter.value = '';
//   cachedPdFilter.value = '';
//   cachedSellTpCd.value = '';
//   filteredClsfPds.value = classfiedPds.value;
//   if (classfiedPds.value.length === 0) {
//     await alert('판매 가능한 상품이 없습니다.');
//   }
// }

function resetCntrSn() {
  step2.value.dtls.forEach((dtl, index) => {
    dtl.cntrSn = index + 1;
  });
}

async function onSelectProduct(newProduct) {
  // 상품관계 확인
  // PD_REL_TP_CD '12' 기계약상품여부
  const res = await dataService.get('sms/wells/contract/contracts/product-relations', {
    params: {
      cntrNo: cntrNo.value, // 현재는 사용하지 않음
      pdCd: newProduct.pdCd,
      cstNo: step2.value?.bas.cntrCstNo,
    },
  });

  const { preCntrPdRelCnt, preCntrPdCnt } = res.data;
  if (Number(preCntrPdRelCnt) > 0 && preCntrPdCnt === '0') {
    alert('해당 상품은 기계약상품의 계약건이 존재해야만 선택 가능합니다.');
    return;
  }

  const isWellsFarmProduct = newProduct.pdLclsfId === 'PDC000000000120';

  const isComposition = newProduct.pdTpCd === 'C';

  if (isComposition) {
    // TODO
    // const { data } = await dataService.get('sms/wells/contract/contracts/reg-cpt-products', {
    //   params: {
    //     cntrNo: step2.value.bas.cntrNo,
    //     hgrPdCd: pd.pdCd,
    //   },
    // });
  }

  newProduct.tempKey = uniqueId('new-slide');

  step2.value.dtls.push(newProduct);

  if (isWellsFarmProduct) {
    // 정기배송 상품 조회 CASE1: 웰스팜/홈카페 상품을 선택하여 정기배송 패키지가 자동추가되는 경우
    const { data: packageProducts } = await dataService.get('sms/wells/contract/contracts/welsf-hcf-pkgs', {
      params: {
        cntrNo: cntrNo.value,
        pdCd: newProduct.pdCd,
      },
    });

    if (!packageProducts?.length) {
      return;
    }

    const defaultPackageProduct = packageProducts[0];

    const packageTempKey = uniqueId('new-slide');

    const cntrRel = {
      cntrRelId: undefined,
      cntrRelDtlCd: CNTR_REL_DTL_CD_LK_SDING, /* 모종결합 */
      baseDtlCntrNo: cntrNo.value,
      baseDtlCntrSn: undefined,
      ojDtlCntrNo: cntrNo.value,
      ojDtlCntrSn: undefined,
      basePdBas: {
        pdCd: defaultPackageProduct.pdCd,
        pdNm: defaultPackageProduct.pdNm,
      },
      baseTempKey: packageTempKey,
      ojTempKey: newProduct.tempKey,
      ojBasePdBas: { ...newProduct },
    };

    const packageProduct = {
      ...defaultPackageProduct,
      tempKey: packageTempKey,
      cntrRels: [cntrRel],
      pkgs: packageProducts,
    };

    newProduct.ojCntrRels = [cntrRel];

    step2.value.dtls.push(packageProduct);
  }

  resetCntrSn();
  emit('contract-modified');
}

// async function onClickProduct(pd) {
//   if (isMshCntr.value && step2.value.dtls.length > 0) {
//     // 멤버십인 경우 상품 1개로 제한
//     await alert('멤버십계약은 1개의 상품만 선택 가능합니다.');
//     return;
//   }
//
//   // 상품 추가
//   if (pd.pdClsf === '7') {
//     // 복합상품
//     // 중복 불가
//     if (step2.value.dtls.find((d) => d.hgrPdCd === pd.pdCd)) {
//       await alert('동일한 복합상품이 존재합니다.');
//       return;
//     }
//     // 하위상품 조회 후 추가
//     const { data } = await dataService.get('sms/wells/contract/contracts/reg-cpt-products', {
//       params: {
//         cntrNo: step2.value.bas.cntrNo,
//         hgrPdCd: pd.pdCd,
//       },
//     });
//     const promises = data.map(addProduct);
//     await Promise.all(promises);
//     return;
//   }
//
//   await addProduct(pd);
// }

async function onClickDelete(index) {
  const { dtls } = step2.value;
  const dtl = step2.value.dtls[index];

  const { cntrRels, ojCntrRels, hgrPdCd, tempKey, cntrSn } = dtl;
  const removeKeys = [tempKey ?? cntrSn];

  if (cntrRels) {
    cntrRels.forEach((cntrRel) => {
      const { ojDtlCntrNo, ojDtlCntrSn, ojTempKey } = cntrRel;
      if (ojDtlCntrNo !== cntrNo.value) {
        return;
      }
      const removeKey = ojTempKey ?? ojDtlCntrSn;
      removeKeys.push(removeKey);
    });
  }

  if (ojCntrRels) {
    ojCntrRels.forEach((cntrRel) => {
      const { baseDtlCntrNo, baseDtlCntrSn, baseTempKey } = cntrRel;
      if (baseDtlCntrNo !== cntrNo.value) {
        return;
      }
      const removeKey = baseTempKey ?? baseDtlCntrSn;
      removeKeys.push(removeKey);
    });
  }

  removeKeys.forEach((key) => {
    const removeDtlIndex = dtls.findIndex((checkDtl) => {
      const dtlKey = checkDtl.tempKey ?? checkDtl.cntrSn;
      return key === dtlKey;
    });
    dtls.splice(removeDtlIndex, 1);
  });

  if (hgrPdCd) {
    /* TODO */
  }

  // if (isItem.rglrSpp(dtl) && dtl.sellTpDtlCd === '62') return;
  // if (dtl.hgrPdCd) {
  //   step2.value.dtls = step2.value.dtls.filter((spd) => dtl.hgrPdCd !== spd.hgrPdCd);
  // }
  // if (isItem.welsf(dtl) || isItem.hcf(dtl)) {
  //   step2.value.dtls = step2.value.dtls
  //   .filter((spd) => dtl.cntrSn !== spd.cntrSn && (dtl.cntrSn + 1) !== spd.cntrSn);
  // } else {
  //   step2.value.dtls.splice(index, 1);
  // }
  // if (dtl.packaged) {
  //   step2.value.dtls = step2.value.dtls.filter((spd) => !spd.packaged);
  // }
  // resetCntrSn();
  emit('contract-modified');
}

async function onClickOnePlusOne(dtl) {
  const { result, payload } = await modal({
    component: 'WwctaOnePlusOneContractListP',
    componentProps: { baseDtlCntrNo: step2.value.bas.cntrNo },
  });
  if (!result) {
    return;
  }

  dtl.cntrRels ??= [];
  dtl.cntrRels.push({
    cntrRelId: undefined,
    cntrRelDtlCd: CNTR_REL_DTL_CD_LK_ONE_PLUS_ONE,
    baseDtlCntrNo: cntrNo.value,
    baseDtlCntrSn: undefined,
    ojDtlCntrNo: payload.cntrNo,
    ojDtlCntrSn: payload.cntrSn,
    basePdBas: {
      pdCd: dtl.pdCd,
      pdNm: dtl.pdNm,
    },
    ojBasePdBas: {
      pdNm: payload.pdNm,
      ...payload,
    }, /* 기기 선택 해야함. */
  });

  dtl.sellDscTpCd = '03';
  dtl.rentalDiscountFixed = true;
}

function onDeleteOnePlusOne(dtl) {
  const { cntrRels } = dtl;
  if (!cntrRels?.length) {
    warn('계약관계가 상이합니다.');
  }
  const onePlusOneRelIndex = cntrRels.findIndex((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_ONE_PLUS_ONE);
  if (onePlusOneRelIndex < 0) {
    warn('1+1 관계가 없습니다.');
  }
  cntrRels.splice(onePlusOneRelIndex, 1);
  dtl.rentalDiscountFixed = false;
}

async function onClickDeviceChange(dtl) {
  const { result, payload } = await modal({
    component: 'WwctaMachineChangeCustomerDtlP',
    componentProps: {
      baseCntrNo: dtl.cntrNo,
      baseCntrSn: dtl.cntrSn,
      cstNo: step2.value.bas?.cntrCstNo,
      indvCrpDv: step2.value.bas?.copnDvCd,
      pdCd: dtl.pdCd,
      dscDv: dtl.sellDscDvCd,
      dscTp: dtl.sellDscTpCd,
      sellTpCd: dtl.sellTpCd,
      alncmpCd: dtl.alncmpCntrDrmVal,
      rgstMdfcDv: '1', // FIXME: 등록, 수정 구분 필요
    },
  });

  if (!result) {
    return;
  }

  dtl.mchnCh = {
    mchnChYn: result,
    ojCntrNo: payload.cntrNo,
    ojCntrSn: payload.cntrSn,
    pdNm: payload.pdNm,
    mchnChTpCd: payload.workFlag,
    pasgMcn: payload.rentalNmnN,
    mchnCpsApyr: payload.finalPerfRt,
    mchnClnOjYn: payload.clnYn,
    ojCntrMmBaseDvCd: payload.resultDvCheck,
  };
}

async function onClickSelectMachine(dtl) {
  const { result, payload } = await modal({
    component: 'WwctaSeedingMachineChoiceP',
    componentProps: {
      cntrCstNo: step2.value.bas.cntrCstNo,
      rglrSppMchnTpCd: dtl.rglrSppMchnTpCd,
    },
  });

  if (!result) {
    return;
  }

  dtl.cntrRels ??= [];
  dtl.cntrRels.push({
    cntrRelId: undefined,
    cntrRelDtlCd: CNTR_REL_DTL_CD_LK_RGLR_SHP_BASE, /* 모종결합 */
    baseDtlCntrNo: cntrNo.value,
    baseDtlCntrSn: undefined,
    ojDtlCntrNo: payload.cntrNo,
    ojDtlCntrSn: payload.cntrSn,
    basePdBas: {
      pdCd: dtl.pdCd,
      pdNm: dtl.pdNm,
    },
    ojBasePdBas: payload, /* 기기 선택 해야함. */
  });
}

function onDeleteSelectMachine(dtl) {
  const { cntrRels } = dtl;
  if (!cntrRels?.length) {
    warn('계약관계가 상이합니다.');
  }
  const rglrShpBaseRelIndex = cntrRels
    .findIndex((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_RGLR_SHP_BASE);
  if (rglrShpBaseRelIndex < 0) {
    warn('정기배송-원주문 관계가 없습니다.');
  }
  cntrRels.splice(rglrShpBaseRelIndex, 1);
}

async function onClickSelSdingCapsl(dtl) {
  const { result, payload } = await modal({
    component: 'WwctaCapsuleSeedingChoiceP',
    componentProps: {
      basePdCd: dtl.pdCd,
    },
  });

  if (!result) {
    return;
  }
  dtl.sdingCapsls = payload;
}

async function getCntrInfo() {
  if (!cntrNo.value) {
    return;
  }
  const { data } = await dataService.get('sms/wells/contract/contracts/cntr-info', {
    params: {
      cntrNo: cntrNo.value,
      step: 2,
    },
  });
  step2.value = data.step2;
  ogStep2.value = cloneDeep(step2.value);
}

async function confirmProducts() {
  if (step2.value.dtls.find((dtl) => !dtl.fnlAmt)) {
    notify('상품 가격을 확인해주세요');
    return;
  }

  const res = await dataService.post(`sms/wells/contract/contracts/confirm-products/${cntrNo.value}`, step2.value.dtls);
  res.data.forEach((newDtl, index) => {
    step2.value.dtls[index].promotions = newDtl.promotions;
  });
  return true;
}

async function isChangedStep() {
  return step2.value.bas.cntrPrgsStatCd < 12 || JSON.stringify(ogStep2.value) !== JSON.stringify(step2.value);
}

async function isValidStep() {
  const { dtls } = step2.value;
  if (dtls.length === 0) {
    await alert('상품을 선택해주세요.');
    return false;
  }
  const invalid = dtls.find((dtl) => {
    if (!dtl.pdPrcFnlDtlId) {
      alert('상품 금액을 확인해주세요.');
      return true;
    }

    const { sellTpDtlCd, cntrRels = [] } = dtl;

    if (sellTpDtlCd === '62') { /* 모종의 경우 */
      const lkSdingRel = cntrRels.find((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_SDING);
      const baseMachineRel = cntrRels.find((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_RGLR_SHP_BASE);
      if (!lkSdingRel && !baseMachineRel) {
        alert('정기배송 대상 기기를 선택해주세요.');
        return true;
      }
    }

    const { sellDscTpCd } = dtl;

    if (sellDscTpCd === '03') {
      const onePlusOneRel = cntrRels.find((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_ONE_PLUS_ONE);
      if (!onePlusOneRel) {
        alert('1+1 대상 계약을 선택해주세요.');
        return true;
      }
    }

    return false;
  });

  return !invalid;
}

const loaded = ref(false);

async function initStep() {
  if (loaded.value) { return; }
  await getCntrInfo();
  loaded.value = true;
}

// 제휴계약 관련 설정
function setAllianceInfo() {
  const { dtls } = step2.value;
  dtls.forEach((d, i) => {
    if (!isEmpty(d.alncCntrNms)) { // 제휴계약이 존재하는 경우,
      const cd = d.alncCntrNms[0].split('-')[3] || ''; // 제휴사코드 추출
      dtls[i].alncmpCd = cd;
    }
  });
  // console.log(JSON.stringify(step2.value, null, '\t'));
}

async function saveStep() {
  resetCntrSn();
  setAllianceInfo();
  const savedCntr = await dataService.post('sms/wells/contract/contracts/save-cntr-step2', step2.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  ogStep2.value = cloneDeep(step2.value);
  return savedCntr?.data?.key;
}

exposed.getCntrInfo = getCntrInfo;
exposed.isChangedStep = isChangedStep;
exposed.isValidStep = isValidStep;
exposed.initStep = initStep;
exposed.saveStep = saveStep;
exposed.confirmProducts = confirmProducts;

/* use panals issue, 화면도 그렇고 뭐라도 await 가 있어야 함.
* */
await nextTick();

onActivated(() => {
  initStep();
  emit('activated', 2);
});

function onPriceChanged() {
  emit('contract-modified');
}

</script>

<style scoped lang="scss">
@import "kw-lib/src/css/mixins";

.scoped-layout {
  $-root: &;

  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;

  &__pick-area {
    width: 339px;
    flex: none;
    height: 100%;
  }

  &__mod-area {
    height: 100%;
    flex: auto;
  }
}

.scoped-item {
  $-root: &;
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
    line-height: 24px !important; // quasat 부터 시작한 유구한 역사의 important.
    font-weight: normal;
    letter-spacing: normal;
  }

  &__section-main {
    justify-content: flex-start;
  }

  &__main {
    display: flex;
    flex-flow: row wrap;
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

  &__section-price {
    justify-content: flex-start;
    flex: none;
    padding-left: $spacing-xs;
  }

  &__price {
    @include typo("body");

    font-weight: bold;
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

  &--data-modifier {
    margin-top: 12px;

    :deep(.kw-item__section) {
      &.q-item__section--main:first-of-type {
        margin-left: 68px;
      }

      &.q-item__section--main:last-of-type {
        margin-right: 44px;
      }
    }
  }

  &__field-row {
    display: flex;
    flex-flow: row nowrap;
    gap: $spacing-xs;

    & > :where(.kw-field, .kw-field-wrap) {
      width: 1px;
      flex: 1 1 0;
    }
  }

  &--sub-content {
    margin-top: 16px;

    &.kw-item {
      min-height: unset;
    }

    #{$-root}__product-name {
      font-weight: normal;
    }

    #{$-root}__price {
      font-weight: normal;
    }
  }

  &__addon {
    margin-top: 16px;
    font-size: 14px;
    color: $black1;
    font-weight: normal;

    > .scoped-item__type {
      line-height: 20px !important;
      padding-right: $spacing-xs;
    }

    &::before {
      content: "";
      display: inline-block;
      margin-bottom: 5px;
      margin-right: 4.5px;
      width: 9px;
      height: 8.5px;
      border-left: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
    }
  }

  &-price-list {
    display: flex;
    flex-wrap: wrap;
    max-width: calc(100% - 122px);
    gap: 4px 25px;
  }

  &-price-item {
    display: flex;
    align-items: center;
    position: relative;

    &:last-child::after {
      display: none;
    }

    &::after {
      content: "";
      display: block;
      position: absolute;
      width: 1px;
      height: 16px;
      background-color: #ddd;
      top: 50%;
      right: -12px;
      transform: translateY(-50%);
    }
  }

  &-right-area {
    padding-left: 68px;
    width: 100%;
  }
}

.dashed-line {
  border-top: 1px dashed #ddd;
  height: 0;
  background: none;
}

.scoped-child-select {
  margin-top: 8px !important;
  display: flex;
  column-gap: 8px;
  align-content: center;

  &::before {
    content: "";
    display: inline-block;
    align-self: center;
    margin: 6px 6px 6px 0;
    width: 10px;
    height: 10px;
    border-left: 2px solid #ccc;
    border-bottom: 2px solid #ccc;
  }
}

// //rev:230623 수정 및 추가
</style>
