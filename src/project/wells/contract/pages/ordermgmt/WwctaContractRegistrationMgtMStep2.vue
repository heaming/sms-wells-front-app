<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [CTA] 통합계약서 작성 Step2
2. 프로그램 ID : EwctaContractRegistrationMgtMStep2
3. 작성자 : gs.piit159
4. 작성일 : 2023.04.05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 통합계약서 작성 Step1
****************************************************************************************************
--->
<template>
  <div class="scoped-layout">
    <div
      class="scoped-layout__pick-area"
    >
      <div class="scoped-layout__search-box scoped-search-box">
        <h3 class="scoped-search-box__title">
          상품검색
        </h3>
        <kw-input
          v-model="pdFilter"
          @keydown.enter="getPds"
        />
        <div class="scoped-search-box__action">
          <kw-btn
            secondary
            label="초기화"
            dense
            class="w60"
            @click="resetFilter"
          />
          <kw-btn
            label="조회"
            class="w60"
            dense
            filled
            color="secondary"
            text-color="bg-white"
            @click="getPds"
          />
        </div>
      </div>
      <kw-scroll-area
        visible
        class="scoped-layout__product-box"
        scroll-width="100%"
        scroll-style="padding-right: 30px;"
      >
        <kw-separator class="mt20 mb0" />
        <kw-list
          class="scoped-product-type-list"
          separator
          item-padding="16px 0"
        >
          <kw-expansion-item
            v-for="clsf in classfiedPds"
            :key="`product-type-${clsf.clsfId}`"
            padding-target="header"
            expansion-icon-align="center"
            expand-icon="arrow_down"
          >
            <template #header>
              <kw-item-section>
                <kw-item-label font="body">
                  {{ clsf.label }}
                </kw-item-label>
              </kw-item-section>
            </template>
            <kw-list
              class="scoped-product-picker-list"
              item-class="scoped-product-picker-list__item"
              :items="clsf.items"
            >
              <template #item="{item}">
                <kw-item-section>
                  <kw-item-label
                    font="dense"
                    font-weight="400"
                    class="flex no-wrap"
                  >
                    <div
                      class="ellipsis grow pr20 cursor-pointer"
                      @click="onClickProduct(item)"
                    >
                      {{ item.pdNm }}
                      <kw-tooltip show-when-ellipsised>
                        {{ item.pdNm }}
                      </kw-tooltip>
                    </div>
                  </kw-item-label>
                  <kw-item-label
                    class="mt6 flex gap-xxs"
                  >
                    <kw-chip
                      :label="item.pdChip1"
                      color="primary"
                      outline
                    />
                    <kw-chip
                      v-if="!isEmpty(item.pdChip2)"
                      :label="item.pdChip2"
                      color="primary"
                      outline
                    />
                  </kw-item-label>
                </kw-item-section>
              </template>
            </kw-list>
          </kw-expansion-item>
        </kw-list>
      </kw-scroll-area>
    </div>
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
        :items="step2.dtls"
        item-key="id"
      >
        <template #item="{item}">
          <kw-expansion-item
            :class="rootClass"
            expand-icon-class="hidden"
            default-opened
            header-class="scoped-item scoped-item--header"
            block-inherit-padding
            expand-icon-toggle
          >
            <template #header>
              <kw-item-section
                class="scoped-item__section-type"
                side
              >
                <kw-item-label
                  class="scoped-item__type"
                >
                  {{ item.pdClsfNm }}
                </kw-item-label>
              </kw-item-section>
              <kw-item-section
                class="scoped-item__section-main"
              >
                <div class="scoped-item__main">
                  <kw-item-label
                    class="scoped-item__product-name"
                  >
                    {{ item.pdNm }}
                  </kw-item-label>
                  <div class="scoped-item__chips">
                    <kw-chip
                      :label="item.pdChip1"
                      color="primary"
                      outline
                    />
                    <kw-chip
                      v-if="!isEmpty(item.pdChip2)"
                      :label="item.pdChip2"
                      color="primary"
                      outline
                    />
                  </div>
                </div>
              </kw-item-section>
              <kw-item-section
                class="scoped-item__section-price"
              >
                <kw-item-label
                  class="scoped-item__price"
                >
                  {{ stringUtil.getNumberWithComma(item.fnlAmt || 0) }}
                </kw-item-label>
              </kw-item-section>
              <kw-item-section
                class="scoped-item__section-action"
                side
              >
                <kw-btn
                  borderless
                  icon="close_24"
                  @click="onClickDelete(item)"
                />
              </kw-item-section>
            </template>
            <template #default>
              <kw-item
                class="scoped-item scoped-item--data-modifier"
              >
                <kw-item-section>
                  <div class="scoped-item__field-row">
                    <zwcm-counter
                      v-if="isItem.quantity(item)"
                      v-model="item.pdQty"
                      label="수량변경"
                      max="999"
                      class="w170"
                    />
                    <kw-date-picker
                      v-if="isItem.suscYmd(item)"
                      v-model="item.lrnnStrtRqdt"
                      placeholder="구독시작년월일"
                      class="w170"
                    />
                    <kw-date-picker
                      v-if="isItem.suscYm(item)"
                      v-model="item.lrnnStrtRqdt"
                      placeholder="구독시작년월"
                      type="month"
                      class="w170"
                    />
                    <kw-date-picker
                      v-if="isItem.sppYmd(item)"
                      v-model="item.sppDuedt"
                      placeholder="배송희망일"
                      class="w170"
                    />
                    <kw-select
                      v-if="isItem.suscMm(item)"
                      v-model="item.suscMm"
                      placeholder="구독개월"
                      class="w170"
                    />
                    <kw-select
                      v-if="isItem.lrnnLv(item)"
                      v-model="item.lrnnStrtLvCd"
                      placeholder="학습단계"
                      class="w170"
                    />
                    <kw-select
                      v-if="isItem.strtLv(item)"
                      v-model="item.lrnnStrtLvCd"
                      placeholder="시작단계"
                      class="w170"
                    />
                    <kw-select
                      v-if="isItem.fvr(item)"
                      placeholder="혜택"
                      class="w170"
                    />
                    <kw-date-picker
                      v-if="isItem.cntsEnddt(item)"
                      v-model="item.lrnnEnddt"
                      placeholder="컨텐츠종료일"
                      class="w170"
                    />
                  </div>
                </kw-item-section>
              </kw-item>
            </template>
          </kw-expansion-item>
        </template>
      </kw-list>
    </kw-scroll-area>
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
// import EctaProductModifyingList from '~sms-wells/contract/components/ordermgmt/EctaProductModifyingList.vue';
import ZwcmCounter from '~common/components/ZwcmCounter.vue';
import { codeUtil, stringUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { getters } = useStore();
const { employeeIDNumber: prtnrNo, ogTpCd, careerLevelCode } = getters['meta/getUserInfo'];
const dataService = useDataService();
const { notify } = useGlobal();

const props = defineProps({
  contract: { type: String, required: true },
});
const { step2 } = toRefs(props.contract);
const ogStep2 = ref({});
const pdFilter = ref('');
const pdClsf = ref([]);
const products = shallowRef([]);
const classfiedPds = computed(() => pdClsf.value.map((clsf) => ({
  clsfId: clsf.pdClsfId,
  label: clsf.pdClsfNm,
  items: products.value.filter((item) => item.pdHclsfId === clsf.pdClsfId),
})).filter((p) => p.items.length > 0));
const codes = await codeUtil.getMultiCodes(
  'CNTR_TP_CD',
  'CNTR_CST_REL_TP_CD',
  'SEX_DV_CD',
);
// TODO 스마트짝꿍, A7, 모계약고정 상품 정의되면 적용
const isItem = {
  quantity: (i) => ['01001'].includes(i.mclsfVal),
  suscYmd: (i) => ['01003', '02001', '02002', '02003', '03001', '03002', '04001', '04002'].includes(i.mclsfVal),
  suscYm: (i) => ['01002'].includes(i.mclsfVal),
  sppYmd: (i) => ['xxx'].includes(i.mclsfVal),
  suscMm: (i) => ['01002', '02001', '02002', '02003', '04001'].includes(i.mclsfVal)
      || ['01003001', '01003002', '03001004', '03001005', '04001001'].includes(i.lclsfVal),
  lrnnLv: (i) => ['01003001', '01003002'].includes(i.lclsfVal),
  strtLv: (i) => ['02001003', '02001004', '03001001', '03001003', '03001004', '03001005', '03002001', '03002003', '03002004', '04001005'].includes(i.lclsfVal),
  fvr: (i) => ['03001', '03002'].includes(i.mclsfVal),
  cntsEnddt: (i) => ['03001002', '03002002'].includes(i.lclsfVal),
};
console.log(prtnrNo + ogTpCd + careerLevelCode + t + codes);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function getProducts(cntrNo) {
  const pds = await dataService.get('sms/wells/contract/contracts/lrnr-products', { params: { cntrNo, pdFilter: pdFilter.value } });
  pdClsf.value = pds.data.pdClsf;
  products.value = pds.data.products;
  console.log(classfiedPds.value);

  // 기존 상품 데이터가 존재하는 경우 추가
  // FIXME v-for로 수정
  /*
  selectedProduct.value = [];
  if (!isEmpty(step2.value.dtls)) {
    step2.value.dtls.forEach((dtl) => {
      const spd = cloneDeep(products.value.find((pd) => pd.pdCd === dtl.basePdCd));
      spd.cntrSn = dtl.cntrSn;
      spd.fnlAmt = dtl.fnlAmt;
      selectedProduct.value.push(spd);
    });
  }
   */
}

async function getPdAmts(pd) {
  const prcs = await dataService.get('sms/wells/contract/contracts/product-prices', {
    params: {
      sellChnlCd: step2.value.bas.sellInflwChnlDtlCd,
      pdCd: pd.pdCd,
      sellTpCd: pd.sellTpCd,
      suscMm: pd.suscMm,
      lrnnStrtLvCd: pd.lrnnStrtLvCd,
    },
  });
  return prcs.data;
}
async function resetFilter() {
  pdFilter.value = '';
  await getProducts();
}

function resetCntrSn() {
  // eslint-disable-next-line no-restricted-syntax
  for (const [idx, item] of step2.value.dtls.entries()) {
    item.cntrSn = idx + 1;
  }
}

async function onClickProduct(pd) {
  pd.pdClsfNm = pdClsf.value.find((clsf) => clsf.pdClsfId === pd.pdHclsfId)?.pdClsfNm;
  const npd = cloneDeep(pd);
  const prc = await getPdAmts(pd);
  ['fnlAmt', 'vat', 'ackmtPerfAmt', 'ackmtPerfRt', 'cvtPerfAmt', 'pdPrcFnlDtlId', 'fxamFxrtDvCd', 'verSn', 'ctrVal', 'pdPrcId'].forEach((col) => {
    npd[col] = prc ? prc[col] : undefined;
  });
  step2.value.dtls.push(npd);
  resetCntrSn();
}

function onClickDelete(pd) {
  step2.value.dtls = step2.value.dtls.filter((spd) => pd.cntrSn !== spd.cntrSn);
  resetCntrSn();
}

async function getCntrInfo(cntrNo) {
  const cntr = await dataService.get('sms/wells/contract/contracts/cntr-info', { params: { cntrNo, step: 2 } });
  step2.value = cntr.data.step2;
  console.log(step2.value);
  ogStep2.value = cloneDeep(step2.value);
}

async function isChangedStep() {
  return JSON.stringify(ogStep2.value) !== JSON.stringify(step2.value);
}

async function isValidStep() {
  if (isEmpty(step2.value.dtls)) {
    console.log('상품을 선택해주세요.');
    return false;
  }
  return true;
}

async function saveStep() {
  const savedCntr = await dataService.post('sms/wells/contract/contracts/save-cntr-step2', step2.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  ogStep2.value = cloneDeep(step2.value);
  return savedCntr?.data?.key;
}
defineExpose({
  getCntrInfo,
  isChangedStep,
  isValidStep,
  saveStep,
  getProducts,
});
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
    $-search-area-height: 130px;

    width: 339px;
    flex: none;
    height: 100%;
    padding-bottom: 30px;

    #{$-root}__search-box {
      padding-right: 30px;
      height: $-search-area-height;
    }

    #{$-root}__product-box {
      height: calc(100% - #{$-search-area-height});
    }
  }

  &__mod-area {
    height: 100%;
    flex: auto;
  }
}

.scoped-search-box {
  &__title {
    margin-top: 0;
  }

  &__action {
    margin-top: $spacing-sm;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-end;
    gap: $spacing-xs;
  }
}

.scoped-product-picker-list {
  background-color: $bg-box;
  padding: $spacing-lg;

  :deep(> .kw-item-type:not(:first-of-type)) {
    margin-top: $spacing-lg;
  }
}

.scoped-item {
  $-root: &;

  & :deep(.kw-item__section) {
    &.q-item__section--side {
      min-width: 68px;
      padding-right: $spacing-xs;
    }

    &.q-item__section--main ~ .q-item__section--side {
      min-width: 44px;
      padding-right: 0;
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
      width: 100%;
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
}
</style>
