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
      @fetched="onFetchedProduct"
    />
    <div class="scoped-layout__mod-area scoped-mod-area">
      <span class="scoped-mod-area__title">
        상품내역
      </span>
      <div
        v-scrollbar
        class="scoped-mod-area__content"
      >
        <kw-list
          class="pr30"
          separator
          item-padding="20px 0"
        >
          <template
            v-for="(item) in step2.dtls"
          >
            <single-pay-price-select
              v-if="item?.sellTpCd === '1'"
              :key="`price-select-${item.tempKey ?? item.cntrSn}`"
              :model-value="item"
              :bas="step2.bas"
              @change:package="onChangeWellsFarmPackage"
              @price-changed="onPriceChanged(item, $event)"
              @delete="onClickDelete(item)"
            />
            <rental-price-select
              v-if="item?.sellTpCd === '2'"
              :key="`price-select-${item.tempKey ?? item.cntrSn}`"
              :model-value="item"
              :bas="step2.bas"
              @select:one-plus-one="onClickOnePlusOne"
              @delete:one-plus-one="onDeleteOnePlusOne"
              @select:device="onClickDeviceChange"
              @delete:device="onClickDeleteDeviceChange"
              @change:package="onChangeWellsFarmPackage"
              @packaging="onPackaging"
              @price-changed="onPriceChanged(item, $event)"
              @delete="onClickDelete(item)"
            />
            <membership-price-select
              v-if="item?.sellTpCd === '3'"
              :key="`price-select-${item.tempKey ?? item.cntrSn}`"
              :model-value="item"
              :bas="step2.bas"
              @price-changed="onPriceChanged(item, $event)"
              @delete="onClickDelete(item)"
            />
            <regular-shipping-price-select
              v-if="item?.sellTpCd === '6'"
              :key="`price-select-${item.tempKey ?? item.cntrSn}`"
              :model-value="item"
              :bas="step2.bas"
              @select:machine="onClickSelectMachine"
              @delete:machine="onDeleteSelectMachine"
              @select:seeding="onClickSelSdingCapsl"
              @select:capsule="onClickSelSdingCapsl"
              @select:precontract="onClickSelectPrecontract"
              @price-changed="onPriceChanged(item, $event)"
              @delete="onClickDelete(item)"
            />
          </template>
        </kw-list>
      </div>
    </div>
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
import { vScrollbar } from '~sms-common/contract/util';
import {
  CNTR_REL_DTL_CD,
  CNTR_TP_CD,
  PD_TP_CD,
  RENTAL_DSC_DV_CD,
  RENTAL_DSC_TP_CD, SELL_TP_CD,
  SELL_TP_DTL_CD,
} from '~sms-wells/contract/constants/ctConst';
import dayjs from 'dayjs';
import { EMPTY_ID } from '~sms-wells/contract/composables/usePriceSelect';

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

const cntrNo = computed(() => props.contract?.cntrNo);
const step2 = toRef(props.contract, 'step2');
const ogStep2 = ref({});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const setTempKey = (pd) => {
  pd.tempKey = uniqueId('new-product');
};

async function fetchPdSellLimit(product) {
  const { data } = await dataService.get('sms/wells/contract/contracts/product-limit', {
    params: {
      cntrNo: cntrNo.value,
      pdCd: product.pdCd,
    },
  });

  product.pdSellLimit = data;
}

function validatePdSellLimit(pdSellLimit) {
  const {
    bznsClHhBas,
    bznsClYn,
    pcntrMndtYn,
    pcntrExistYn,
  } = pdSellLimit;

  const validationObject = {
    valid: true,
    reason: undefined,
    precontractRequired: false,
    bizStartTime: undefined,
    bizEndTime: undefined,
  };

  validationObject.precontractRequired = pcntrMndtYn === 'Y';

  if (pcntrMndtYn === 'Y' && pcntrExistYn === 'N') {
    validationObject.valid = false;
    validationObject.reason = '해당 상품은 기계약 상품의 계약 건이 존재해야만 선택 가능합니다.';
    return validationObject;
  }

  if (bznsClYn === 'Y') {
    validationObject.valid = false;
    validationObject.reason = '영업 시간 내 계약해 주세요.';
    return validationObject;
  }

  if (bznsClHhBas) {
    const bizStartTime = dayjs(`${bznsClHhBas.strtdt}${bznsClHhBas.strtHh}`, 'YYYYMMDDHHmm');
    const bizEndTime = dayjs(`${bznsClHhBas.enddt}${bznsClHhBas.endHh}`, 'YYYYMMDDHHmm');

    validationObject.bizStartTime = bizStartTime;
    validationObject.bizEndTime = bizEndTime;

    const now = dayjs();

    if (now.isBefore(bizStartTime) || now.isAfter(bizEndTime)) {
      validationObject.valid = false;
      validationObject.reason = `영업 시간 내 계약해 주세요. ${bznsClHhBas.strtHh} ~ ${bznsClHhBas.endHh}`;
      return validationObject;
    }
  }

  validationObject.valid = true;
  return validationObject;
}

async function validatePreconditions(product) {
  await fetchPdSellLimit(product);
  return validatePdSellLimit(product.pdSellLimit);
}

async function onSelectProduct(product, wellsFarmMachineCntrDtl) {
  const newProduct = { ...product };
  const newProducts = [];

  const { valid, reason } = await validatePreconditions(newProduct);

  if (!valid) {
    alert(reason);
    return;
  }

  // 웰스팜 기기 선택 시
  const isWellsFarmProduct = newProduct.pdLclsfId === 'PDC000000000120';
  newProduct.lkSdingOjCntrRelRequired = isWellsFarmProduct;

  // 웰스팜 기계약 기기 선택 후, 모종 일시불 선택 시,
  if (wellsFarmMachineCntrDtl) {
    newProduct.cntrRels = [{
      cntrRelId: undefined,
      cntrRelDtlCd: CNTR_REL_DTL_CD.LK_RGLR_SHP_BASE, /* 모종결합 */
      baseDtlCntrNo: cntrNo.value,
      baseDtlCntrSn: undefined,
      ojDtlCntrNo: wellsFarmMachineCntrDtl.cntrNo,
      ojDtlCntrSn: wellsFarmMachineCntrDtl.cntrSn,
      basePdBas: {
        pdCd: newProduct.pdCd,
        pdNm: newProduct.pdNm,
      },
      ojBasePdBas: { ...wellsFarmMachineCntrDtl }, /* 기기 선택 해야함. */
    }];
  }

  // 복합상품
  const isComposition = newProduct.pdTpCd === PD_TP_CD.COMPOSITION;

  // 복합상품의 경우 해당 복함상품이 아닌 복합상품의 구성 기준상품 목록을 추가한다.
  if (isComposition) {
    const alreadyExistComposition = !!step2.value.dtls.find((existed) => existed.hgrPdCd === product.pdCd);

    if (alreadyExistComposition) {
      await alert('동일한 복합상품이 존재합니다.');
      return;
    }

    const { data: containedProducts } = await dataService.get('sms/wells/contract/contracts/reg-cpt-products', {
      params: {
        cntrNo: step2.value.bas.cntrNo,
        hgrPdCd: product.pdCd,
      },
    });

    containedProducts.forEach((containedProduct) => {
      // TODO: fix
      containedProduct.pdClsfNm = '복합상품';
      setTempKey(containedProduct);
      newProducts.push(containedProduct);
    });
  } else {
    setTempKey(newProduct);
    newProducts.push(newProduct);
  }

  step2.value.dtls.push(...newProducts);
  emit('contract-modified');
}

async function onFetchedProduct(products) {
  // 계약유형 : 멤버십
  // 이미 선택된 상품이 없는 경우에만, 상품 자동 선택 처리
  if (step2.value.bas?.cntrTpCd !== CNTR_TP_CD.MEMBERSHIP) {
    return;
  }
  await onSelectProduct(products[0]);
}

function deleteDtlByKey(key) {
  if (!key) {
    warn(`삭제 키 확인 바랍니다. ${key}`);
    return;
  }
  const removeDtlIndex = step2.value.dtls.findIndex((checkDtl) => {
    const dtlKey = checkDtl.tempKey ?? checkDtl.cntrSn;
    return key === dtlKey;
  });
  step2.value.dtls.splice(removeDtlIndex, 1);
}

async function onClickDelete(dtl) {
  const { cntrRels, ojCntrRels, hgrPdCd, tempKey, cntrSn } = dtl;

  if (cntrRels) {
    let parentDeleted = false;
    cntrRels.forEach((cntrRel) => {
      const { ojDtlCntrNo, ojDtlCntrSn, ojTempKey } = cntrRel;
      if (ojDtlCntrNo !== cntrNo.value) {
        return;
      }

      const parentKey = ojTempKey ?? ojDtlCntrSn;
      const parentDtl = step2.value.dtls.find((checkDtl) => {
        const dtlKey = checkDtl.tempKey ?? checkDtl.cntrSn;

        return parentKey === dtlKey;
      });
      if (!parentDtl) {
        warn('계약 내 관계 형성이 상이하게 되어있습니다.');
      }
      parentDeleted = true;
      onClickDelete(parentDtl);
    });

    if (parentDeleted) {
      return;
    }
  }

  let removeKeys;

  if (hgrPdCd) {
    removeKeys = step2.value.dtls
      .filter((product) => product.hgrPdCd === hgrPdCd)
      .map((product) => product.tempKey ?? product.cntrSn);
  } else {
    removeKeys = [tempKey ?? cntrSn];
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

  removeKeys.forEach(deleteDtlByKey);

  emit('contract-modified');
}

async function onClickOnePlusOne(dtl) {
  const { pdCd, basePdCd /* 안전장치 */ } = dtl;

  const { result, payload } = await modal({
    component: 'WwctaOnePlusOneContractListP',
    componentProps: {
      cntrNo: step2.value.bas.cntrNo,
      pdCd: pdCd || basePdCd,
    },
  });
  if (!result) {
    return;
  }

  dtl.cntrRels ??= [];
  dtl.cntrRels.push({
    cntrRelId: undefined,
    cntrRelDtlCd: CNTR_REL_DTL_CD.LK_ONE_PLUS_ONE,
    baseDtlCntrNo: cntrNo.value,
    baseDtlCntrSn: undefined,
    ojDtlCntrNo: payload.cntrNo,
    ojDtlCntrSn: payload.cntrSn,
    basePdBas: {
      pdCd: dtl.pdCd,
      pdNm: dtl.pdNm,
    },
    ojBasePdBas: { ...payload }, /* 기기 선택 해야함. */
  });

  dtl.priceOptionFilter = {
    ...dtl.priceOptionFilter,
    rentalDscDvCd: RENTAL_DSC_DV_CD.GENERAL,
    rentalDscTpCd: RENTAL_DSC_TP_CD.ONE_PLUS_ONE,
  };
}

async function onDeleteOnePlusOne(dtl) {
  const { cntrRels } = dtl;
  if (!cntrRels?.length) {
    warn('계약관계가 상이합니다.');
  }
  const onePlusOneRelIndex = cntrRels.findIndex((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD.LK_ONE_PLUS_ONE);
  if (onePlusOneRelIndex < 0) {
    warn('1+1 관계가 없습니다.');
  }
  cntrRels.splice(onePlusOneRelIndex, 1);

  if (dtl.priceOptionFilter?.rentalDscTpCd) {
    dtl.priceOptionFilter.rentalDscTpCd = undefined;
  }
  if (dtl.priceOptionFilter.rentalDscDvCd) {
    dtl.priceOptionFilter.rentalDscDvCd = undefined;
  }
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

  if (payload.workFlag === '19') {
    dtl.priceOptionFilter = {
      ...dtl.priceOptionFilter,
      rentalDscDvCd: RENTAL_DSC_DV_CD.GENERAL,
      rentalDscTpCd: RENTAL_DSC_TP_CD.STPL_5_YEAR_RE_RENTAL,
    };
  } else {
    dtl.priceOptionFilter = {
      ...dtl.priceOptionFilter,
      rentalDscDvCd: '8',
      rentalDscTpCd: RENTAL_DSC_TP_CD.RE_RENTAL,
    };
  }
}

async function onClickDeleteDeviceChange(dtl) {
  dtl.mchnCh = {};

  if (dtl.priceOptionFilter?.rentalDscTpCd) {
    dtl.priceOptionFilter.rentalDscTpCd = undefined;
  }
  if (dtl.priceOptionFilter.rentalDscDvCd) {
    dtl.priceOptionFilter.rentalDscDvCd = undefined;
  }
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

  const existRelIndex = dtl.cntrRels
    .findIndex((cntrRel) => (cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD.LK_RGLR_SHP_BASE));
  if (existRelIndex > -1) {
    dtl.cntrRels.splice(existRelIndex, 1);
  }

  dtl.cntrRels.push({
    cntrRelId: undefined,
    cntrRelDtlCd: CNTR_REL_DTL_CD.LK_RGLR_SHP_BASE, /* 모종결합 */
    baseDtlCntrNo: cntrNo.value,
    baseDtlCntrSn: undefined,
    ojDtlCntrNo: payload.cntrNo,
    ojDtlCntrSn: payload.cntrSn,
    basePdBas: {
      pdCd: dtl.pdCd,
      pdNm: dtl.pdNm,
    },
    ojBasePdBas: { ...payload }, /* 기기 선택 해야함. */
  });
}

async function onPackaging(dtl, rentalDscTpCd) {
  /*
  if (!rentalDscTpCds?.length) {
    warn('패키지 할인 유형코드가 이상합니다.');
  }

  const dtlsByRentalDscTpCd = rentalDscTpCds.reduce((mappingObj, rentalDscTpCd) => {
    mappingObj[rentalDscTpCd] = [];
    return mappingObj;
  }, {});

  step2.value.dtls.forEach((rentalDtl) => {
    const { packageRentalDscTpCds } = rentalDtl;
    if (!packageRentalDscTpCds?.length) { return; }
    packageRentalDscTpCds.forEach((rentalDscTpCd) => {
      if (rentalDscTpCds.includes(rentalDscTpCd)) {
        dtlsByRentalDscTpCd[rentalDscTpCd].push(dtl);
      }
    });
  }); */

  const packagables = step2.value.dtls.filter((rentalDtl) => {
    if (rentalDtl === dtl) { return false; }
    const { sellTpCd } = rentalDtl;
    return sellTpCd === SELL_TP_CD.RENTAL;
  });

  // eslint-disable no-nested-ternary
  if (rentalDscTpCd === RENTAL_DSC_TP_CD.PACKAGE_2 && packagables.length < 1) {
    alert('렌탈 상품을 적어도 두 건이상 선택해주세요.');
    return;
  } if (rentalDscTpCd === RENTAL_DSC_TP_CD.PACKAGE_3 && packagables.length < 2) {
    alert('렌탈 상품을 적어도 세 건이상 선택해주세요.');
    return;
  } if (rentalDscTpCd === RENTAL_DSC_TP_CD.PACKAGE_OVER_4 && packagables.length < 3) {
    alert('렌탈 상품을 적어도 네 건이상 선택해주세요.');
    return;
  }

  // 모바일과는 다르다!! 우선 냅다 선택하고, 패키징을 한다.
  const { result, payload } = await modal({
    component: 'WwctaRentalMultiCasePrchsDscChoP',
    componentProps: {
      rentalDscTpCd,
      discounted: dtl,
      cntrDtls: packagables,
    },
  });

  if (!result) {
    return;
  }

  const { selectedCntrDtls } = payload;

  const ojCntrRels = [];

  selectedCntrDtls.forEach((cntrDtl) => {
    cntrDtl.priceOptionFilter = {
      rentalDscDvCd: RENTAL_DSC_DV_CD.GENERAL,
      rentalDscTpCd: EMPTY_ID,
    };
    const cntrRel = {
      cntrRelId: undefined,
      cntrRelDtlCd: CNTR_REL_DTL_CD.LK_MLTCS_PRCHS,
      baseDtlCntrNo: cntrNo.value,
      baseDtlCntrSn: undefined,
      ojDtlCntrNo: cntrNo.value,
      ojDtlCntrSn: undefined,
      baseTempKey: cntrDtl.tempKey,
      basePdBas: {
        pdCd: cntrDtl.pdCd,
        pdNm: cntrDtl.pdNm,
      },
      ojTempKey: dtl.tempKey,
      ojBasePdBas: { ...dtl },
    };
    cntrDtl.cntrRels = [cntrRel];
    ojCntrRels.push({ ...cntrRel });
  });

  dtl.priceOptionFilter = {
    rentalDscDvCd: RENTAL_DSC_DV_CD.GENERAL,
    rentalDscTpCd,
  };
  dtl.ojCntrRels = ojCntrRels;
}

function onDeleteSelectMachine(dtl) {
  const { cntrRels } = dtl;
  if (!cntrRels?.length) {
    warn('계약관계가 상이합니다.');
  }
  const rglrShpBaseRelIndex = cntrRels
    .findIndex((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD.LK_RGLR_SHP_BASE);
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
      sellTpDtlCd: dtl.sellTpDtlCd,
    },
  });

  if (!result) {
    return;
  }
  dtl.sdingCapsls = payload;
}

async function onClickSelectPrecontract(dtl) {
  const { pdCd } = dtl;
  const { payload, result } = await modal({
    component: 'WwctaLkCntrDtlChioceP',
    componentProps: {
      cntrNo: cntrNo.value,
      pdCd,
    },
  });

  if (!result) { return; }

  dtl.cntrRels ??= [];

  const existRelIndex = dtl.cntrRels
    .findIndex((cntrRel) => (cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD.LK_ONE_PLUS_ONE));
  if (existRelIndex > -1) {
    dtl.cntrRels.splice(existRelIndex, 1);
  }

  dtl.cntrRels.push({
    cntrRelId: undefined,
    cntrRelDtlCd: CNTR_REL_DTL_CD.LK_ONE_PLUS_ONE, /* 모종결합 */
    baseDtlCntrNo: cntrNo.value,
    baseDtlCntrSn: undefined,
    ojDtlCntrNo: payload.cntrNo,
    ojDtlCntrSn: payload.cntrSn,
    basePdBas: {
      pdCd: dtl.pdCd,
      pdNm: dtl.pdNm,
    },
    ojBasePdBas: { ...payload }, /* 기기 선택 해야함. */
  });
}

async function onChangeWellsFarmPackage(dtl) {
  const { result, payload: newPackageProduct } = await modal({
    component: 'WwctaWellsFarmPackageProductSelectP',
    componentProps: {
      cntrNo: cntrNo.value,
      pdCd: dtl.pdCd,
    },
  });

  if (!result) { return; }

  setTempKey(newPackageProduct);

  if (dtl.ojCntrRels?.length) {
    dtl.ojCntrRels.forEach((cntrRel) => {
      const { baseDtlCntrNo, baseDtlCntrSn, baseTempKey } = cntrRel;
      if (baseDtlCntrNo !== cntrNo.value) {
        return;
      }
      const removeKey = baseTempKey ?? baseDtlCntrSn;
      deleteDtlByKey(removeKey);
    });
  }

  const cntrRel = {
    cntrRelId: undefined,
    cntrRelDtlCd: CNTR_REL_DTL_CD.LK_SDING, /* 모종결합 */
    baseDtlCntrNo: cntrNo.value,
    baseDtlCntrSn: undefined,
    ojDtlCntrNo: cntrNo.value,
    ojDtlCntrSn: undefined,
    basePdBas: {
      pdCd: newPackageProduct.pdCd,
      pdNm: newPackageProduct.pdNm,
    },
    baseTempKey: newPackageProduct.tempKey,
    ojTempKey: dtl.tempKey,
    ojBasePdBas: { ...dtl },
  };

  newPackageProduct.cntrRels = [cntrRel];
  dtl.ojCntrRels ??= [];
  dtl.ojCntrRels.push(cntrRel);
  const dtlIndex = step2.value.dtls.indexOf(dtl);
  step2.value.dtls.splice(dtlIndex + 1, 0, newPackageProduct);

  emit('contract-modified');
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
  const { dtls = [] } = step2.value;
  dtls.forEach((cntrDtl) => {
    const { cntrRels = [] } = cntrDtl;
    cntrRels.forEach((cntrRel) => {
      if (cntrRel.ojDtlCntrNo === cntrNo.value) {
        const ojCntrDtl = dtls.find((ojDtl) => ojDtl.cntrSn === cntrRel.ojDtlCntrSn);
        if (!ojCntrDtl) {
          warn('계약 관계에 문제가 있습니다.');
          return;
        }
        ojCntrDtl.ojCntrRels ??= [];
        ojCntrDtl.ojCntrRels.push(cntrRel);
      }
    });
  });
  step2.value.dtls = dtls;
  ogStep2.value = cloneDeep(step2.value);
}

async function confirmProducts() {
  const { dtls } = step2.value;
  if (dtls.length === 0) {
    await alert('상품을 선택해주세요.');
    return false;
  }

  if (dtls.find((dtl) => !dtl.pdPrcFnlDtlId)) {
    notify('상품 가격을 확인해주세요');
    return false;
  }

  // eslint-disable-next-line no-use-before-define
  const invalid = dtls.find((dtl) => !validateCntrDtl(dtl));
  if (invalid) { return false; }

  dtls.forEach((dtl) => {
    dtl.basePdCd = dtl.pdCd;
  });
  const { data } = await dataService.post(`sms/wells/contract/contracts/confirm-products/${cntrNo.value}`, dtls);
  data.forEach((newDtl, index) => {
    dtls[index].promotions = newDtl.promotions;
  });
  return true;
}

async function isChangedStep() {
  return step2.value.bas.cntrPrgsStatCd < 12 || JSON.stringify(ogStep2.value) !== JSON.stringify(step2.value);
}

function validateCntrDtl(dtl) {
  if (!dtl.pdPrcFnlDtlId) {
    alert('상품 금액을 확인해주세요.');
    return false;
  }

  const {
    sellTpCd,
    sellTpDtlCd,
    cntrRels = [],
    ojCntrRels = [],
    finalPrice,
    pdSellLimit,
    lkSdingOjCntrRelRequired,
    hgrPdCd,
    appliedPromotions,
    alncCntrNms,
    sdingCapsls,
  } = dtl;
  const { alncPmotEuYn } = finalPrice; // 제휴프로모션적용여부

  if (alncPmotEuYn === 'Y' // 제휴프로모션적용여부가 'Y' 인데,
    && !hgrPdCd // 복합상품이 아니고
    && !appliedPromotions?.length // 프로모션도 없고,
    && !alncCntrNms?.length // 라이프(상조)제휴도 없는경우
  ) {
    alert('제휴 프로모션 전용가격입니다.');
    return false;
  }
  if (sellTpDtlCd === SELL_TP_DTL_CD.RGLR_SPP_SDING) { /* 모종의 경우 */
    const lkSdingRel = cntrRels.find((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD.LK_SDING);
    const baseMachineRel = cntrRels.find((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD.LK_RGLR_SHP_BASE);
    if (!lkSdingRel && !baseMachineRel) {
      alert('정기배송 대상 기기를 선택해주세요.');
      return false;
    }

    if (!sdingCapsls?.length) {
      alert('구성 제품을 선택해주세요.');
      return false;
    }
  }

  if (sellTpDtlCd === SELL_TP_DTL_CD.RGLR_SPP_CAPSL) {
    if (!sdingCapsls?.length) {
      alert('구성 제품을 선택해주세요.');
      return false;
    }
  }

  if (pdSellLimit) {
    const { valid, reason, precontractRequired } = validatePdSellLimit(pdSellLimit);

    if (!valid) {
      alert(reason);
      return false;
    }

    if (precontractRequired && sellTpCd === SELL_TP_CD.RGLR_SPP) {
      const onePlusOneRel = cntrRels.find((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD.LK_ONE_PLUS_ONE);
      if (!onePlusOneRel) {
        alert('연계 계약을 선택해주세요.');
        return false;
      }
    }
  }

  if (lkSdingOjCntrRelRequired) {
    const lkSdingOjCntrRel = ojCntrRels.find((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD.LK_SDING);
    if (!lkSdingOjCntrRel) {
      alert('패키지 모종 상품을 선택해주세요.');
      return false;
    }
  }

  return true;
}

async function isValidStep() {
  const { dtls } = step2.value;
  if (dtls.length === 0) {
    await alert('상품을 선택해주세요.');
    return false;
  }
  const invalid = dtls.find((dtl) => !validateCntrDtl(dtl));

  return !invalid;
}

const loaded = ref(false);

async function initStep(forced = false) {
  if (!forced && loaded.value) {
    return;
  }
  if (cntrNo.value) {
    await getCntrInfo();
    loaded.value = true;
  }
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
}

async function saveStep() {
  setAllianceInfo();
  const savedCntr = await dataService.post('sms/wells/contract/contracts/save-cntr-step2', step2.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  ogStep2.value = cloneDeep(step2.value); /* TODO REMOVE... */
  return savedCntr?.data?.key;
}

exposed.getCntrInfo = getCntrInfo;
exposed.isChangedStep = isChangedStep;
exposed.isValidStep = isValidStep;
exposed.initStep = initStep;
exposed.loaded = loaded;
exposed.saveStep = saveStep;
exposed.confirmProducts = confirmProducts;

/* use panals issue, 화면도 그렇고 뭐라도 await 가 있어야 함.
* */
await nextTick();

onActivated(() => {
  initStep();
  emit('activated', 2);
});

function onPriceChanged(item, price) {
  item.finalPrice = price;
  emit('contract-modified');
}

</script>

<style scoped lang="scss">
@import "kw-lib/src/css/mixins";

.scoped-layout {
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  container-type: inline-size;

  &__pick-area {
    flex: 1 0 1px;
    padding-right: 2px; // fixme
    border-right: 1px solid $line-line;
  }

  &__mod-area {
    min-width: 780px;
    flex: 1 0 1px;
    height: 100%;
    padding-left: 30px;
  }

  @container (max-width: 1100px) {
    &__pick-area {
      visibility: hidden;
      width: 30px;
      position: absolute;
      top: 0;
      bottom: 0;
      z-index: 20;
      border-right: unset;

      &::after {
        visibility: visible;
        content: "";
        position: absolute;
        inset: 0;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 8px 30px;
        background-image:
          linear-gradient(
            90deg,
            $line-line,
            transparent,
            $line-line,
          );
      }

      &:hover,
      &:focus-within {
        visibility: visible;
        width: 339px;
        background: $bg-white;
        border-right: 1px solid $line-line;

        &::after {
          content: unset;
        }
      }
    }
  }

  @container (min-width: 1101px) {
    &__pick-area {
      visibility: visible;
      flex: none;
      width: 339px;
      height: 100%;
    }
  }
}

.scoped-mod-area {
  position: relative;

  &__title {
    position: absolute;
    left: 30px;
    right: 40px;
    margin: 0;
    height: 46px;
    background: $bg-white;
    z-index: 1;

    @include typo("subtitle", 500);
  }

  &__content {
    padding-top: 46px;
    height: 100%;
  }
}
</style>
