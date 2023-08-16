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
  >
    <ul class="kw-notification">
      <li>{{ $t('MSG_TXT_RENTAL_MULTI_PRCHS_DSC') }}</li>
      <!--렌탈 다건 구매 시 월 렌탈료 할인 : 2건 5,000원 할인, 3건 10,000원 할인, 4건이상 15,000원 할인-->
      <li>{{ $t('MSG_TXT_CLICK_MULTI_RENTAL_DSC') }}</li>
      <!--다건구매 선택을 하고자 하는 상품을 아래의 표에서 선택한 후 '렌탈 할인 선택'을 클릭하세요.-->
    </ul>
    <kw-action-top class="mt20">
      <template #left>
        <kw-paging-info :total-count="5" />
        <span class="ml8">({{ $t('MSG_TXT_UNIT_CUR_WON') }})</span><!--(단위:원)-->
      </template>
      <kw-btn
        dense
        primary
        :label="$t('MSG_BTN_INTL')"
        :disable="!isSelectRental"
        @click="onClickClear"
      /><!--초기화-->
      <kw-btn
        dense
        primary
        :label="$t('MSG_BTN_RENTAL_DSC_SELT')"
        :disable="isSelectRental"
        @click="onClickRentalSelect"
      /><!--렌탈 할인 선택-->
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      :visible-rows="5"
      @init="initGrid"
    />
    <kw-scroll-area
      visible
      min-height="180px"
      max-height="180px"
      class="border-box pa0 mt20"
    >
      <div class="pa30 relative-position">
        <div
          v-if="selectedRentals.length === 0"
          class="scoped-placeholder"
        >
          <p>{{ $t('MSG_TXT_NO_MULTI_RENTAL_DSC_IZ') }}</p><!--선택된 렌탈 다건 구매 할인 내역이 없습니다.-->
          <p>{{ $t('MSG_TXT_RENTAL_MULTI_DSC_SELT') }}</p><!--상단에 표에서 할인 받고자할 상품을 선택하십시오.-->
        </div>
        <template v-else-if="selectedRentals.length >= 2">
          <div>
            <h3>
              {{ $t('MSG_TXT_RENTAL_MULTI_DSC_SELT_INFO',
                    [selectedRentals.length, stringUtil.getNumberWithComma(discount)]) }}
            </h3><!--할인선택 ) 렌탈 {0}건 구매 ({1}원 할인) : 할인 받을 상품을 선택하세요.-->
            <kw-list
              v-model:selected="selectedRentalDiscount"
              :items="selectedRentals"
              radio
              hide-select-all
              clickable
              item-key="id"
              item-padding="8px 0"
              class="no-spacing scoped-product-list"
              select-align="center"
            >
              <template #item="{ item }">
                <kw-item-section>
                  <kw-item-label>
                    {{ item.pdNm }}
                  </kw-item-label>
                </kw-item-section>
                <kw-item-section side>
                  <kw-item-label
                    font="body"
                    font-weight="regular"
                  >
                    {{ $t('MSG_TXT_MON') }}<!--월-->
                    <span class="text-weight-medium">{{ stringUtil.getNumberWithComma(item.fnlAmt) }}
                      {{ $t('MSG_TXT_CUR_WON') }}</span><!--원-->
                  </kw-item-label>
                </kw-item-section>
              </template>
            </kw-list>
          </div>
        </template>
      </div>
    </kw-scroll-area>
    <!-- popup action button -->
    <template #action>
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        negative
        @click="onClickCancel"
      /><!--취소-->
      <kw-btn
        :label="$t('MSG_BTN_SAVE')"
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
import { getComponentType, gridUtil, useGlobal, useModal, stringUtil } from 'kw-lib';

const { notify, alert } = useGlobal();
const { t } = useI18n();
const { cancel: onClickCancel, ok } = useModal();

const props = defineProps({
  rentals: {
    type: Array,
    required: true,
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const isSelectRental = ref(false);
const selectedRentals = ref([]);
const grdMainRef = ref(getComponentType('KwGrid'));

function onClickRentalSelect() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_RENTAL_MULTI_DSC_PRCHS_SELT')); // 렌탈 다건구매 할인 대상건을 선택해 주세요.
    return;
  } if (checkedRows.length === 1) {
    notify(t('MSG_ALT_MULTI_RENTAL_DSC_PSB', [2])); // 2건 이상만 렌탈 다건 할인이 가능합니다.
    return;
  }

  selectedRentals.value = checkedRows;

  view.disabled = true;
  isSelectRental.value = true;
}

const selectedRentalDiscount = ref(null);

const discount = computed(() => {
  if (selectedRentals.value.length === 2) return 5000;
  if (selectedRentals.value.length === 3) return 10000;
  if (selectedRentals.value.length >= 4) return 15000;
  return 'ERROR';
});

function onClickClear() {
  selectedRentals.value = [];
  selectedRentalDiscount.value = null;

  const view = grdMainRef.value.getView();
  view.disabled = false;
  const data = grdMainRef.value.getData();
  data.setRows(props.rentals);

  isSelectRental.value = false;
}

function getDiscountTypeCode(selectedRentalsLength) {
  if (selectedRentalsLength === 2) return '14';
  if (selectedRentalsLength === 3) return '15';
  if (selectedRentalsLength >= 4) return '16';
  return 'ERROR';
}

function onClickSave() {
  if (!selectedRentals.value.length || !selectedRentalDiscount.value) {
    alert(t('MSG_ALT_RENTAL_MULTI_PRCHS_SELT_NOT')); // 렌탈 다건구매 할인 대상이 선택되지 않았습니다.
    return;
  }

  const { pdCd, pdNm, fnlAmt } = selectedRentalDiscount.value;
  const dscTpCd = getDiscountTypeCode(selectedRentals.value.length);
  ok({
    pdCd,
    pdNm,
    fnlAmt,
    dscTpCd,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'fnlAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '480', styleName: 'text-left' }, // 상품명
    { fieldName: 'fnlAmt', header: t('MSG_TXT_PRICE_CUR_WON'), width: '200' }, // 가격(원)
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows(props.rentals);
}
</script>

<style lang="scss" scoped>
.scoped-product-list.kw-list {
  margin-top: 20px;

  $self: ".scoped-product-list";

  ::v-deep(.kw-item-type) {
    &:first-of-type {
      padding-top: 0 !important;
    }

    &:last-of-type {
      padding-bottom: 0 !important;
    }
  }

  ::v-deep(.kw-item__section.q-item__section--side) {
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

.pa30.relative-position {
  min-height: 180px;

  .scoped-placeholder {
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
