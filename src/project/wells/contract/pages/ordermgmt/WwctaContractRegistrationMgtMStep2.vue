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
              @price-changed="onPriceChanged(item, $event)"
              @delete="onClickDelete(item)"
            />
            <rental-price-select
              v-if="item?.sellTpCd === '2'"
              :key="`price-select-${item.tempKey ?? item.cntrSn}`"
              :model-value="item"
              :bas="step2.bas"
              @one-plus-one="onClickOnePlusOne"
              @delete:one-plus-one="onDeleteOnePlusOne"
              @device-change="onClickDeviceChange"
              @price-changed="onPriceChanged(item, $event)"
              @packaging="onPackaging"
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
              @price-changed="onPriceChanged(item, $event)"
              @select-machine="onClickSelectMachine"
              @delete:select-machine="onDeleteSelectMachine"
              @select-seeding="onClickSelSdingCapsl"
              @select-capsule="onClickSelSdingCapsl"
              @select-precontract="onClickSelectPrecontract"
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
import ProductSelect
  from '~sms-wells/contract/pages/ordermgmt/WwctaContractRegistrationMgtMStep2SelectProduct.vue';
import SinglePayPriceSelect
  from '~sms-wells/contract/components/ordermgmt/WwctaSpayFinalPriceSelect.vue';
import RentalPriceSelect
  from '~sms-wells/contract/components/ordermgmt/WwctaRentalFinalPriceSelect.vue';
import MembershipPriceSelect
  from '~sms-wells/contract/components/ordermgmt/WwctaMembershipFinalPriceSelect.vue';
import RegularShippingPriceSelect
  from '~sms-wells/contract/components/ordermgmt/WwctaRegularShippingFinalPriceSelect.vue';
import { alert, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty, uniqueId } from 'lodash-es';
import { warn } from 'vue';
import { vScrollbar } from '~sms-common/contract/util';

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
const CNTR_REL_DTL_CD_LK_MLTCS_PRCHS = '22M'; // 다건 구매

const cntrNo = computed(() => props.contract?.cntrNo);
const step2 = toRef(props.contract, 'step2');
const ogStep2 = ref({});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function onSelectProduct(product) {
  const newProduct = { ...product };
  const newProducts = [];

  console.log('onSelectProduct', product);

  // 상품관계 확인
  // PD_REL_TP_CD '12' 기계약상품여부
  const res = await dataService.get('sms/wells/contract/contracts/product-relations', {
    params: {
      cntrNo: cntrNo.value, // 현재는 사용하지 않음
      pdCd: newProduct.pdCd,
      cstNo: step2.value?.bas.cntrCstNo || '0', // 견적서 등 고객번호 없을수 있음. 더미 고객번호로 처리
    },
  });

  const { preCntrPdRelCnt, preCntrPdCnt } = res.data;
  if (Number(preCntrPdRelCnt) > 0 && preCntrPdCnt === '0') {
    alert('해당 상품은 기계약상품의 계약건이 존재해야만 선택 가능합니다.');
    return;
  }

  if (Number(preCntrPdRelCnt) > 0 && newProduct.sellTpCd === '6') {
    newProduct.precontractRequired = true; // sorrrrrrryyyyy... this is shit.
  }

  const setTempKey = (pd) => {
    pd.tempKey = uniqueId('new-product');
  };

  const isWellsFarmProduct = newProduct.pdLclsfId === 'PDC000000000120';

  const isComposition = newProduct.pdTpCd === 'C';

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

    packageProducts.forEach(setTempKey);

    const defaultPackageProduct = packageProducts[0];

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
      baseTempKey: defaultPackageProduct.tempKey,
      ojTempKey: newProduct.tempKey,
      ojBasePdBas: { ...newProduct },
    };

    const packageProduct = {
      ...defaultPackageProduct,
      cntrRels: [cntrRel],
      pkgs: packageProducts,
    };

    newProduct.ojCntrRels = [cntrRel];

    newProducts.push(packageProduct);
  }

  step2.value.dtls.push(...newProducts);
  emit('contract-modified');
}

async function onFetchedProduct(products) {
  // 계약유형 : 멤버십
  // 이미 선택된 상품이 없는 경우에만, 상품 자동 선택 처리
  if (step2.value.bas?.cntrTpCd !== '07') {
    return;
  }
  await onSelectProduct(products[0]);
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

  removeKeys.forEach((key) => {
    if (!key) {
      warn(`삭제 키 확인 바랍니다. ${key}`);
      return;
    }
    const removeDtlIndex = step2.value.dtls.findIndex((checkDtl) => {
      const dtlKey = checkDtl.tempKey ?? checkDtl.cntrSn;
      return key === dtlKey;
    });
    step2.value.dtls.splice(removeDtlIndex, 1);
  });

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
    ojBasePdBas: { ...payload }, /* 기기 선택 해야함. */
  });

  dtl.priceOptionFilter = {
    ...dtl.priceOptionFilter,
    rentalDscDvCd: '8',
    rentalDscTpCd: '03',
  };
}

async function onDeleteOnePlusOne(dtl) {
  const { cntrRels } = dtl;
  if (!cntrRels?.length) {
    warn('계약관계가 상이합니다.');
  }
  const onePlusOneRelIndex = cntrRels.findIndex((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_ONE_PLUS_ONE);
  if (onePlusOneRelIndex < 0) {
    warn('1+1 관계가 없습니다.');
  }
  cntrRels.splice(onePlusOneRelIndex, 1);
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
      rentalDscDvCd: '8',
      rentalDscTpCd: '24',
    };
  } else {
    dtl.priceOptionFilter = {
      ...dtl.priceOptionFilter,
      rentalDscDvCd: '8',
      rentalDscTpCd: '02',
    };
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
    .findIndex((cntrRel) => (cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_RGLR_SHP_BASE));
  if (existRelIndex > -1) {
    dtl.cntrRels.splice(existRelIndex, 1);
  }

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
    const { packageRentalDscTpCds } = rentalDtl;
    if (!packageRentalDscTpCds?.length) {
      return false;
    }
    return packageRentalDscTpCds.includes(rentalDscTpCd);
  });

  // 모바일과는 다르다!! 우선 냅다 선택하고, 패키징을 한다.
  const { result, payload } = await modal({
    component: 'WwctaRentalMultiCasePrchsDscChoP',
    componentProps: {
      rentalDscTpCd,
      cntrDtls: packagables,
    },
  });

  if (!result) {
    return;
  }

  const { selectedCntrDtls, discountedCntrDtl } = payload;

  const ojCntrRels = [];

  selectedCntrDtls.forEach((cntrDtl) => {
    if (cntrDtl !== discountedCntrDtl) {
      cntrDtl.priceOptionFilter = {
        rentalDscDvCd: '8', /* 일반 SORRY FOR HARD CODING. */
        rentalDscTpCd: undefined,
      };
      const cntrRel = {
        cntrRelId: undefined,
        cntrRelDtlCd: CNTR_REL_DTL_CD_LK_MLTCS_PRCHS,
        baseDtlCntrNo: cntrNo.value,
        baseDtlCntrSn: undefined,
        ojDtlCntrNo: cntrNo.value,
        ojDtlCntrSn: undefined,
        baseTempKey: cntrDtl.tempKey,
        basePdBas: {
          pdCd: cntrDtl.pdCd,
          pdNm: cntrDtl.pdNm,
        },
        ojTempKey: discountedCntrDtl.tempKey,
        ojBasePdBas: { ...discountedCntrDtl },
      };
      cntrDtl.cntrRels = [cntrRel];
      ojCntrRels.push({ ...cntrRel });
    }
  });

  discountedCntrDtl.priceOptionFilter = {
    rentalDscDvCd: '8', /* 일반 SORRY FOR HARD CODING. */
    rentalDscTpCd,
  };
  discountedCntrDtl.ojCntrRels = ojCntrRels;
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
    .findIndex((cntrRel) => (cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD_LK_ONE_PLUS_ONE));
  if (existRelIndex > -1) {
    dtl.cntrRels.splice(existRelIndex, 1);
  }

  dtl.cntrRels.push({
    cntrRelId: undefined,
    cntrRelDtlCd: CNTR_REL_DTL_CD_LK_ONE_PLUS_ONE, /* 모종결합 */
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
  if (step2.value.dtls.find((dtl) => !dtl.pdPrcFnlDtlId)) {
    notify('상품 가격을 확인해주세요');
    return;
  }

  step2.value.dtls.forEach((dtl) => {
    dtl.basePdCd = dtl.pdCd;
  });
  const { data } = await dataService.post(`sms/wells/contract/contracts/confirm-products/${cntrNo.value}`, step2.value.dtls);
  data.forEach((newDtl, index) => {
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
