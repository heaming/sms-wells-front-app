<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : [W-SS-U-0022P06] WwctaRentalMultiCasePrchsDscChoP - 렌탈 다건구매 할인 선택
3. 작성자 : yeongjoong.kim
4. 작성일 : 2023-08-16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈 다건 구매 시 렌탈 제품을 가져와 패키지 할인을 결정하다.(패키지 2, 3, 4 할인)
- 판매유형상세코드 21, 23 인 건이 2건, 3건, 4건 일때 상품, 상품명, 가격을 해당 화면에 리스트로 던져 준다.
****************************************************************************************************
-->
<template>
  <kw-popup
    size="lg"
    :title="title"
  >
    <ul class="kw-notification">
      <li>{{ $t('MSG_TXT_RENTAL_MULTI_PRCHS_DSC') }}</li>
      <!--렌탈 다건 구매 시 월 렌탈료 할인 : 2건 5,000원 할인, 3건 10,000원 할인, 4건이상 15,000원 할인-->
      <li>{{ $t('MSG_TXT_CLICK_MULTI_RENTAL_DSC') }}</li>
      <!--다건구매 선택을 하고자 하는 상품을 아래의 표에서 선택한 후 '렌탈 할인 선택'을 클릭하세요.-->
    </ul>
    <kw-item class="pt20">
      <kw-item-section side>
        <kw-chip
          outline
          primary
          label="할인대상"
        />
      </kw-item-section>
      <kw-item-section>
        <kw-item-label>
          {{ discounted.cstBasePdAbbrNm || discounted.pdNm }}
        </kw-item-label>
      </kw-item-section>
    </kw-item>

    <kw-list
      class="scoped-product-list"
    >
      <kw-item-label font="body">
        다건 할인 대상 상품 선택
      </kw-item-label>
      <kw-item
        v-for="(dtl) in innerDtls"
        :key="`${dtl.cntrNo}-${dtl.tempKey || dtl.cntrSn}`"
        clickable
        tag="label"
      >
        <kw-item-section side>
          <kw-checkbox
            v-model="selectedRentals"
            :val="dtl"
          />
        </kw-item-section>
        <kw-item-section>
          <kw-item-label>
            {{ dtl.cstBasePdAbbrNm || dtl.pdNm }}
          </kw-item-label>
        </kw-item-section>
      </kw-item>
    </kw-list>
    <!-- popup action button -->
    <template #action>
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        negative
        @click="onClickCancel"
      /><!--취소-->
      <kw-btn
        :label="$t('MSG_BTN_RENTAL_DSC_SELT')"
        primary
        @click="onClickSave"
      /><!--저장-->
    </template>
    <!--// popup action button -->
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal, useModal } from 'kw-lib';
import { useCtCode } from '~sms-common/contract/composable';
import { RENTAL_DSC_TP_CD } from '~sms-wells/contract/constants/ctConst';

/* 주의: 그대로 가져가서 선택만 해서 그대로 넘길 것. 그리드에 때려 넣으면 새 객체 됨. ㅎ. 시간나면 뜯어 고치자. */
const props = defineProps({
  rentalDscTpCd: {
    type: String,
    required: true,
  },
  discounted: { type: Object, required: true },
  cntrDtls: {
    type: Array,
    required: true,
  },
});

const { notify } = useGlobal();
const { t } = useI18n();
const { cancel: onClickCancel, ok } = useModal();

const { getCodeName } = await useCtCode('RENTAL_DSC_TP_CD');

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectedRentals = ref([]);
const title = computed(() => `렌탈 다건 할인 구매 (${getCodeName('RENTAL_DSC_TP_CD', props.rentalDscTpCd)})`);

const innerDtls = ref(props.cntrDtls || []);

function onClickSave() {
  if (!selectedRentals.value.length) {
    notify(t('MSG_ALT_RENTAL_MULTI_PRCHS_SELT_NOT')); // 렌탈 다건구매 할인 대상이 선택되지 않았습니다.
    return;
  }

  if (selectedRentals.value.length === 0) {
    notify(t('MSG_ALT_RENTAL_MULTI_DSC_PRCHS_SELT')); // 렌탈 다건구매 할인 대상건을 선택해 주세요.
    return;
  }
  if (props.rentalDscTpCd === RENTAL_DSC_TP_CD.PACKAGE_2 && selectedRentals.value.length !== 1) {
    notify(t('TODO', [1], '{0} 건 이상 선택해 주세요.')); // 2건 이상만 렌탈 다건 할인이 가능합니다.
    return;
  }
  if (props.rentalDscTpCd === RENTAL_DSC_TP_CD.PACKAGE_3 && selectedRentals.value.length !== 2) {
    notify(t('TODO', [2], '{0} 건 이상 선택해 주세요.')); // 3건 이상만 렌탈 다건 할인이 가능합니다.`
    return;
  }
  if (props.rentalDscTpCd === RENTAL_DSC_TP_CD.PACKAGE_OVER_4 && selectedRentals.value.length < 3) {
    notify(t('TODO', [3], '{0} 건 이상 선택해 주세요.')); // 4건 이상만 렌탈 다건 할인이 가능합니다.
    return;
  }

  ok({
    selectedCntrDtls: selectedRentals.value,
    discountedCntrDtl: props.discounted,
  });
}
</script>

<style lang="scss" scoped>
.scoped-product-list.kw-list {
  margin-top: 20px;

  $self: ".scoped-product-list";

  :deep(.kw-item-type) {
    &:first-of-type {
      padding-top: 0 !important;
    }

    &:last-of-type {
      padding-bottom: 0 !important;
    }
  }

  :deep(.kw-item__section.q-item__section--side) {
    padding-right: 8px;
  }

  .q-item__section--main {
    font-weight: 400;
    color: $black2;
  }

  .kw-list__item--selected {
    .q-item__section--main {
      font-weight: 500;
      color: $black1;
    }
  }
}

.scoped-filler {
  position: relative;
  padding: 30px;
  height: 180px;

  &__placeholder {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    text-align: center;
    line-height: 1.43;
    color: $disabled;
  }
}
</style>
