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
      :items="packageProducts"
      item-key="pdCd"
      checkbox
      select-align="center"
      hide-select-all
      item-class="scoped-kw-item"
    >
      <template #item="{ item: product }">
        <kw-item-section>
          <kw-item-label>
            {{ product.pdNm ?? '' }}{{ product.prc ? ` (${product.prc}원)` : '' }}
          </kw-item-label>
        </kw-item-section>
        <kw-item-section
          v-if="baseProduct.sellTpDtlCd === PKG_TYPE_CAPSULE"
          side
        >
          <zwcm-counter
            v-model="product.count"
            dense
            :min="0"
            :max="baseProduct.totQty"
          />
        </kw-item-section>
      </template>
    </kw-list>
    <template #action>
      <div
        class="scoped-summary"
        :class="{'bg-red-2': selectedCount > baseProduct.totQty }"
      >
        <p>합계</p>
        <p> {{ selectedCount }} / {{ baseProduct.totQty }}</p>
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
import { alert, codeUtil, useDataService, useModal } from 'kw-lib';

const props = defineProps({
  basePdCd: { type: String, required: true },
  rglrSppMchnTpCd: { type: String, default: undefined },
  rglrSppPrcDvCd: { type: String, default: undefined },
});

const dataService = useDataService();
const { t } = useI18n();

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_DTL_CD',
);
const { ok, cancel } = useModal();

function getCodeName(codeKey, codeId) {
  const codeArr = codes[codeKey];
  if (!codeArr || !codeId) { return ''; }
  return codeArr.find((code) => code.codeId === codeId)?.codeName || '';
}

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseProduct = ref({});
// eslint-disable-next-line no-unused-vars
const PKG_TYPE_SEEDING = '62';
const PKG_TYPE_CAPSULE = '63';

const title = computed(() => {
  if (!baseProduct.sellTpDtlCd) {
    return '모종선택';
  }
  return t('MSG_TXT_ANY_SELT', [getCodeName('SELL_TP_DTL_CD', baseProduct.sellTpDtlCd)]); /* {0} 선택 */
});

const packageProducts = ref([]);
let dict;
const selected = ref([]);
const selectedProducts = computed(() => selected.value.map((pdCd) => dict[pdCd]));
const selectedCount = computed(() => selectedProducts.value.reduce((acc, cur) => acc + cur.count, 0));

async function fetchPackageProductsInfo() {
  const { basePdCd, rglrSppMchnTpCd, rglrSppPrcDvCd } = props;
  if (!basePdCd) { return; }
  const { data } = await dataService.get('/sms/wells/contract/seeding/package-products', {
    params: {
      basePdCd,
      rglrSppMchnTpCd,
      rglrSppPrcDvCd,
    },
  });

  baseProduct.value = data.basePd;

  if (data.pkgPds?.length) {
    packageProducts.value = data.pkgPds;

    dict = {};
    packageProducts.value.forEach((product) => {
      dict[product.pdCd] = product;
      product.count = 1;
      if (baseProduct.value.totKndQty) {
        product.count = baseProduct.value.totQty / baseProduct.value.totKndQty;
        product.disable = computed(() => {
          if (selected.value.includes(product.pdCd)) {
            return false;
          }
          return selected.value.length >= baseProduct.value.totKndQty;
        });
      }
    });
  }
}

async function validateSelected() {
  const { totQty, totKndQty } = baseProduct.value;
  if (totKndQty && selected.value.length !== totKndQty) {
    await alert(`상품 종류를 ${totKndQty} 개 선택해주세요.`);
    return false;
  }
  if (selectedCount.value !== totQty) {
    await alert(`총 상품 갯수는 ${totQty} 개 여야 합니다.`);
    return false;
  }
  return true;
}

async function onClickConfirm() {
  if (!(await validateSelected())) { return; }
  const payload = selectedProducts.value.map((product) => ({
    pdCd: product.pdCd,
    pdNm: product.pdNm,
    count: product.count,
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
