<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : fragment
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-06-19
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 주문 결제하기
- 계약의 총 금액 및 계약번호를 노출 하고, 주문 상품을 선택함.
****************************************************************************************************
--->
<template>
  <kw-item>
    <kw-item-section>
      <kw-carousel
        ref="carouselRef"
        v-model="currSlideName"
        class="scoped-carousel"
        infinite
        keep-alive
        swipeable
        height="auto"
        navigation-position="top"
      >
        <template #control>
          <kw-carousel-control
            position="top-right"
            :offset="[10, 10]"
            class="text-black1"
          >
            <kw-btn
              borderless
              class="h16"
              icon="arrow_left"
              style="font-size: 16px;"
              @click="carouselRef.previous()"
            />
            <kw-btn
              v-if="true"
              :label="controlLabel"
              borderless
              disable
              @click="onClickCounter"
            />
            <kw-select
              v-show="false"
              ref="nightElfSelect"
              v-model="currSlideName"
              class="hidden"
              :options="slides"
              option-label="pdNm"
              option-value="name"
            /><!--TODO: 메뉴를 쓰라는데 어째쓰까-->
            <kw-btn
              borderless
              class="h16"
              icon="arrow_right"
              style="font-size: 16px;"
              @click="carouselRef.next()"
            />
          </kw-carousel-control>
        </template>
        <kw-carousel-slide
          v-for="( {name, index, data: dtl} ) in slides"
          :key="`slide-${index}`"
          class="scoped-carousel-slide"
          :name="name"
        >
          <kw-list
            class="scoped-divider-list"
          >
            <product-info
              :product="dtl"
            />
            <shipping-address-update
              :ref="(vm) => addressUpdateRefs[`${ADDRESS_REF_PREFIX}${dtl.cntrSn}`] = vm"
              :adrpc="dtl.adrpc"
              :contractor="contractor"
              @activated="onChildActivated"
            />
            <payments-info-update
              :ref="(vm) => paymentsInfoUpdateRefs[`${PAYMENT_REF_PREFIX}${dtl.cntrSn}`] = vm"
              :stlm-rels="dtl.stlmRels"
              :stlms="contract.stlms"
              :contractor="contractor"
              @activated="onChildActivated"
            />
          </kw-list>
        </kw-carousel-slide>
      </kw-carousel>
    </kw-item-section>
  </kw-item>
</template>

<script setup>
import { warn } from 'vue';
import { notify } from 'kw-lib';
import ShippingAddressUpdate from './WwctaContractSettlementAgreeAprMgtMShippingAddress.vue';
import ProductInfo from './WwctaContractSettlementAgreeAprMgtMProductInfo.vue';
import PaymentsInfoUpdate from './WwctaContractSettlementAgreeAprMgtMPayment.vue';

const props = defineProps({
  contract: {
    type: Object,
    required: true,
  },
});

const exposed = {};
defineExpose(exposed);

const ADDRESS_REF_PREFIX = 'address-';
const PAYMENT_REF_PREFIX = 'payments-';

const contractor = computed(() => props.contract.cntrCstInfo);
const carouselRef = ref();

function getSlideName(dtl) {
  if (!dtl) {
    return 'empty-slide';
  }
  return `slide-${dtl.cntrNo}-${dtl.cntrSn}`;
}

const dtls = ref(props.contract?.dtls ?? []);
const slides = computed(() => dtls.value.map((dtl, index) => ({
  name: getSlideName(dtl),
  index,
  pdNm: dtl.pdNm,
  data: dtl,
})));

const currSlideName = ref(slides.value[0]?.name);
const currSlide = computed(() => slides.value.find((slide) => slide.name === currSlideName.value));
const controlLabel = computed(() => `${currSlide.value.index + 1}/${slides.value.length}`);

function setSlideOf(dtl) {
  currSlideName.value = slides.value.find((slide) => slide.data.cntrSn === dtl.cntrSn)?.name;
}
function isCurrSlideOf(dtl) {
  const { data: currDtl } = currSlide.value;
  return currDtl.cntrSn === dtl.cntrSn;
}

watch(() => props.contract, (value) => {
  dtls.value = value.dtls;
  setSlideOf(dtls.value[0]);
});

const addressUpdateRefs = ref({});
const paymentsInfoUpdateRefs = ref({});

const scrollRef = ref();

function scrollTo(ref) {
  const el = unref(ref)?.$el;
  if (el) {
    el.scrollIntoView(true);
  }
}

async function validateDtl(dtl) {
  const { cntrSn } = dtl;
  const adrRef = addressUpdateRefs.value[`${ADDRESS_REF_PREFIX}${cntrSn}`];
  if (!adrRef) {
    notify('확인하지 않은 계약 상품이 있습니다.');
    setSlideOf(dtl);
    scrollTo(carouselRef.value);
    return false;
  }

  if (typeof adrRef.validate !== 'function') {
    warn('배송주소 입력 컴포넌트 validate 가 없습니다.');
    return false;
  }

  const adrValid = await adrRef.validate();
  if (!adrValid) {
    if (isCurrSlideOf(dtl)) {
      setSlideOf(dtl);
      scrollRef.value = adrRef.invalidRef;
    } else {
      scrollTo(adrRef.invalidRef);
    }
    return false;
  }

  const paymentRef = paymentsInfoUpdateRefs.value[`${PAYMENT_REF_PREFIX}${cntrSn}`];
  if (!paymentRef) {
    notify('확인하지 않은 계약 결제 상품이 있습니다.');
    return false;
  }
  if (typeof paymentRef.validate !== 'function') {
    warn('계약정보 입력 컴포넌트에 문제가 있습니다.');
    return false;
  }

  const paymentValid = await paymentRef.validate();
  if (!paymentValid) {
    if (isCurrSlideOf(dtl)) {
      setSlideOf(dtl);
      scrollRef.value = paymentRef.invalidRef;
    } else {
      scrollTo(adrRef.invalidRef);
    }
    return false;
  }
  return true;
}

async function validate() {
  if (!Array.isArray(dtls.value) || dtls.value.length === 0) {
    warn('계약상세가 하나도 없네요. 확인해보세요.');
    return false;
  }

  let valid = true;

  for (let i = 0; i < dtls.value.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const isValidDtl = await validateDtl(dtls.value[i]);
    if (!isValidDtl) {
      valid = false;
      break;
    }
  }

  return valid;
}

function onChildActivated(invalidRef) {
  if (invalidRef && scrollRef.value === invalidRef) {
    scrollTo(scrollRef.value);
    scrollRef.value = undefined;
  }
}

async function getRequestData() {
  const valid = await validate();
  if (!valid) {
    return;
  }
  const stlmBases = Object.values(paymentsInfoUpdateRefs.value)
    .flatMap((paymentRef) => {
      if (!paymentRef || typeof paymentRef.getStlmsUpdateInfo !== 'function') {
        warn('계약정보 입력 컴포넌트에 문제가 있습니다.');
      }
      return paymentRef.getStlmsUpdateInfo();
    });
  const adrpcs = Object.values(addressUpdateRefs.value)
    .map((adrRef) => {
      if (!adrRef || typeof adrRef.getUpdateShippingAddressInfo !== 'function') {
        warn('주소 입력 컴포넌트에 문제가 있습니다.');
      }
      return adrRef.getUpdateShippingAddressInfo();
    });
  const cssrIss = Object.values(paymentsInfoUpdateRefs.value)
    .filter((paymentRef) => (paymentRef && paymentRef.cashSalesReceiptInfo))
    .map((paymentRef) => paymentRef.cashSalesReceiptInfo);
  return {
    stlmBases,
    adrpcs,
    cssrIss,
  };
}

exposed.validate = validate;
exposed.getRequestData = getRequestData;

const nightElfSelect = ref(null);
function onClickCounter() {
  console.log('tset', nightElfSelect.value);
  nightElfSelect.value.onPopup(true); /* todo does not work... */
}

</script>

<style lang="scss" scoped>
:deep(.scoped-divider-list) {
  > .kw-item-type + .kw-item-type {
    border-top: 8px solid $bg-box;
  }
}

:deep(.scoped-carousel) {
  outline: 1px solid transparent;
}

.scoped-carousel-slide {
  padding: 0;
}

</style>
