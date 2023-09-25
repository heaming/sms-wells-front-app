<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaCapsuleSeedingChoiceP - 캡슐/모종 선택 팝업
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-05-30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 정기배송 주문에서 캡슐/모종 선택 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
    :title="title"
  >
    <kw-list
      v-model:selected="selected"
      :items="pdctProducts"
      item-key="pdCd"
      checkbox
      select-align="center"
      hide-select-all
      item-class="scoped-kw-item"
    >
      <template #item="{ item: product }">
        <kw-item-section>
          <kw-item-label>
            {{ product.pdNm ?? '' }}{{ product.sellAmt ? ` (${getNumberWithComma(product.sellAmt)}원)` : '' }}
          </kw-item-label>
        </kw-item-section>
        <kw-item-section
          v-if="packageBaseProduct.sellTpDtlCd === PKG_TYPE_CAPSULE"
          side
        >
          <zwcm-counter
            v-model="product.itmQty"
            dense
            :min="0"
            :max="packageBaseProduct.pdctConsQty"
          />
        </kw-item-section>
      </template>
    </kw-list>
    <template #action>
      <div
        class="scoped-summary"
        :class="{'bg-red-2': selectedCount > packageBaseProduct.pdctConsQty }"
      >
        <p>합계</p>
        <p> {{ selectedCount }} / {{ packageBaseProduct.pdctConsQty }}</p>
      </div>
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        negative
        @click="onClickCancel"
      />
      <kw-btn
        :label="$t('MSG_BTN_CONFIRM')"
        primary
        @click="onClickConfirm"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import ZwcmCounter from '~common/components/ZwcmCounter.vue';
import { alert, useDataService, useModal } from 'kw-lib';
import { getNumberWithComma } from '~sms-common/contract/util';
import { useCtCode } from '~sms-common/contract/composable';

const props = defineProps({
  basePdCd: { type: String, required: true },
});

const dataService = useDataService();
const { t } = useI18n();

const { getCodeName } = await useCtCode(
  'SELL_TP_DTL_CD',
);
const { ok, cancel } = useModal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const packageBaseProduct = ref({});
const PKG_TYPE_SEEDING = '62';
const PKG_TYPE_CAPSULE = '63';
const isSeedingPackage = computed(() => packageBaseProduct.value.sellTpDtlCd === PKG_TYPE_SEEDING);
const isCapsulePackage = computed(() => packageBaseProduct.value.sellTpDtlCd === PKG_TYPE_CAPSULE);

const title = computed(() => {
  if (!packageBaseProduct.sellTpDtlCd) {
    return '모종선택';
  }
  return t('MSG_TXT_ANY_SELT', [getCodeName('SELL_TP_DTL_CD', packageBaseProduct.sellTpDtlCd)]); /* {0} 선택 */
});

const pdctProducts = ref([]);
let dict;
const selected = ref([]);
const selectedProducts = computed(() => selected.value.map((pdCd) => dict[pdCd]));
const selectedCount = computed(() => selectedProducts.value.reduce((acc, cur) => acc
    + (cur.itmQty * (cur.sdingQty || 1)), 0));

function setupPdctProducts() {
  dict = {};
  pdctProducts.value.forEach((product) => {
    const { pdCd } = product;
    if (!pdCd) {
      throw new Error('제품 상품 코드가 없습니다.');
    }

    dict[pdCd] = product;

    if (isCapsulePackage.value) {
      product.itmQty = 1;

      product.disable = computed(() => {
        if (selected.value.includes(pdCd)) {
          return false;
        }
        return packageBaseProduct.value.pdctConsQty < selectedCount.value + product.itmQty;
      });
    }

    if (isSeedingPackage.value) {
      product.itmQty = 1;
      if (!product.sdingQty) {
        if (packageBaseProduct.value.pdChoQty > 1) {
          product.sdingQty = packageBaseProduct.value.pdctConsQty / packageBaseProduct.value.pdChoQty;
        } else {
          product.sdingQty = 1;
        }
      }

      product.disable = computed(() => {
        if (selected.value.includes(pdCd)) {
          return false;
        }
        const isOverConsQty = packageBaseProduct.value.pdctConsQty
            < selectedCount.value + (product.sdingQty * product.itmQty);
        const isOverChoQty = selected.value.length >= (packageBaseProduct.value.pdChoQty || 99999);
        return isOverConsQty || isOverChoQty;
      });
    }
  });
}

async function fetchPackageProductsInfo() {
  const { basePdCd } = props;
  if (!basePdCd) { return; }
  const { data } = await dataService.get('/sms/wells/contract/seeding/package-products', {
    params: {
      basePdCd,
    },
  });
  const { basePd, pkgPds } = data;

  if (!data.pkgPds?.length) {
    await alert('패키지 가능한 대상 제품이 없습니다!');
    cancel();
  }

  packageBaseProduct.value = basePd;
  pdctProducts.value = pkgPds;
  setupPdctProducts();
}

async function validateSelected() {
  const { pdctConsQty, pdChoQty } = packageBaseProduct.value;
  if (pdChoQty && selected.value.length !== pdChoQty) {
    await alert(`상품 종류를 ${pdChoQty} 개 선택해주세요.`);
    return false;
  }
  if (selectedCount.value !== pdctConsQty) {
    await alert(`총 상품 갯수는 ${pdctConsQty} 개 여야 합니다.`);
    return false;
  }
  return true;
}

async function onClickConfirm() {
  if (!(await validateSelected())) { return; }
  const payload = selectedProducts.value.map((product) => ({
    pdCd: product.pdCd,
    pdNm: product.pdNm,
    pdRelId: product.pdRelId,
    pdRelTpCd: product.pdRelTpCd,
    sellAmt: product.sellAmt,
    itmQty: product.itmQty,
  }));
  ok(payload);
}

function onClickCancel() {
  cancel();
}

await fetchPackageProductsInfo();

</script>

<style scoped lang="scss">
:deep(.kw-popup__content) {
  padding-bottom: 182px !important;
  padding-top: 80px !important;
}

:deep(.kw-popup__action) {
  padding-top: 12px !important;
  height: 182px;

  &::after {
    display: none;
  }
}

.scoped-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: 16px;
  margin-right: 16px;
  width: 100%;
  height: 70px;
  padding: 19px 40px;
  background: #eaf3fe;
}

:deep(.scoped-kw-item) {
  padding-bottom: 8px;

  &:last-of-type {
    padding-bottom: 0;
  }

  > .kw-item__section:first-of-type {
    padding-right: $spacing-sm;
  }
}
</style>
