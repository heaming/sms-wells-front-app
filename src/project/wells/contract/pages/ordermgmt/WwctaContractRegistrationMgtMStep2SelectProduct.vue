<template>
  <div class="scoped-product-select">
    <div class="scoped-product-select__search-box scoped-search-box">
      <h3 class="scoped-search-box__title">
        상품검색
      </h3>
      <kw-input
        v-model="searchParams.filterText"
        @keydown.enter="onClickSearch"
      />
      <kw-select
        v-model="searchParams.sellTpCd"
        class="mt8"
        :options="codes.SELL_TP_CD"
        first-option="select"
        @change="onClickSearch"
      />
      <div class="scoped-search-box__action">
        <kw-btn
          secondary
          label="초기화"
          dense
          class="w60"
          @click="onClickReset"
        />
        <kw-btn
          label="조회"
          class="w60"
          dense
          filled
          color="secondary"
          text-color="bg-white"
          @click="onClickSearch"
        />
      </div>
    </div>
    <div
      v-scrollbar
      class="scoped-product-select__product-box"
    >
      <div class="pr30 pb20">
        <kw-list
          class="scoped-product-type-list"
          separator
          item-padding="16px 0"
        >
          <kw-expansion-item
            v-for="(pdClsfCd) in filteredPdClsfCds"
            :key="`product-type-${pdClsfCd}`"
            :ref="(vm) => expansionItemRef[pdClsfCd] = vm"
            padding-target="header"
            expansion-icon-align="center"
            expand-icon="arrow_down"
          >
            <template #header>
              <kw-item-section>
                <kw-item-label font="body">
                  {{ getCodeName('PD_CLSF_CD', pdClsfCd) }}
                </kw-item-label>
              </kw-item-section>
            </template>
            <kw-list
              class="scoped-product-picker-list"
            >
              <!-- 업보려니...합시다. -->
              <kw-item
                v-for="(product, idx) in filteredClassifyingProducts[pdClsfCd]"
                :key="`product-${idx}`"
                class="scoped-product-picker-list__item"
              >
                <kw-item-section>
                  <kw-item-label
                    font="dense"
                    font-weight="400"
                    class="flex no-wrap"
                  >
                    <div
                      class="ellipsis grow pr20 cursor-pointer"
                      @click="onClickProduct(product)"
                    >
                      {{ product.cstBasePdAbbrNm || product.pdNm }}
                      <kw-tooltip show-when-ellipsised>
                        {{ product.cstBasePdAbbrNm || product.pdNm }}
                      </kw-tooltip>
                    </div>
                  </kw-item-label>
                  <kw-item-label
                    class="mt6 flex gap-xxs"
                  >
                    <kw-chip
                      v-if="labelForSellTpCd(product)"
                      :label="labelForSellTpCd(product)"
                      color="primary"
                      outline
                    />
                  </kw-item-label>
                </kw-item-section>
              </kw-item>
            </kw-list>
          </kw-expansion-item>
        </kw-list>
      </div>
    </div>
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { alert, useDataService } from 'kw-lib';
import { useCtCode } from '~sms-common/contract/composable';
import { vScrollbar } from '~sms-common/contract/util';
import { PD_TP_CD, SELL_TP_CD } from '~sms-wells/contract/constants/ctConst';

const props = defineProps({
  cntrNo: { type: String, required: true },
});
const emit = defineEmits([
  'select',
  'fetched',
]);
const exposed = {};
defineExpose(exposed);

const dataService = useDataService();
const { codes, addCode, getCodeName } = await useCtCode(
  'SELL_TP_DTL_CD',
  'PD_TP_CD',
);
await addCode('SELL_TP_CD', (code) => ([
  SELL_TP_CD.SPAY,
  SELL_TP_CD.RENTAL,
  SELL_TP_CD.MSH,
  SELL_TP_CD.RGLR_SPP,
].includes(code.codeId) && code));
await addCode('PD_CLSF_CD', [
  { codeId: '1', codeName: '정수기' },
  { codeId: '2', codeName: '청정기' },
  { codeId: '3', codeName: '비데' },
  { codeId: '4', codeName: '삼성가전' },
  { codeId: '5', codeName: '정기배송' },
  { codeId: '6', codeName: '기타' },
  { codeId: '7', codeName: '복합상품' },
]);

const cntrNo = ref(props.cntrNo);

const expansionItemRef = ref({});
const products = ref([]);
const classifyingProducts = ref({});
const selectedProductCode = ref();

const cachedParams = ref({});
const searchParams = ref({
  filterText: '',
  sellTpCd: undefined,
  rentalDscTpCd: undefined,
});

function getPdClsfCd(product) {
  if (!product) {
    return;
  }
  if (product.pdTpCd === PD_TP_CD.COMPOSITION) {
    return '7';
  }
  if (product.istBzsCd === 'S') {
    return '4';
  }
  if (product.sellTpCd === SELL_TP_CD.RGLR_SPP) {
    return '5';
  }
  if (product.pdMclsfId === 'PDC000000000002') {
    return '1';
  }
  if (product.pdMclsfId === 'PDC000000000026') {
    return '2';
  }
  if (product.pdMclsfId === 'PDC000000000056') {
    return '3';
  }
  return '6';
}

function labelForSellTpCd(product) {
  if (!product) {
    return undefined;
  }
  if (product.sellTpCd && product.sellTpDtlCd) {
    return `${getCodeName('SELL_TP_CD', product.sellTpCd)}-${getCodeName('SELL_TP_DTL_CD', product.sellTpDtlCd)}`;
  }
  if (product.sellTpCd) {
    return getCodeName('SELL_TP_CD', product.sellTpCd);
  }
  if (product.pdTpCd === 'C') {
    return getCodeName('PD_TP_CD', product.pdTpCd);
  }
}

function classifying() {
  if (!products.value?.length) {
    classifyingProducts.value = {};
  }

  const mappingObj = {
    1: undefined,
    2: undefined,
    3: undefined,
    4: undefined,
    5: undefined,
    6: undefined,
    7: undefined,
  };

  const addPdToMapping = (product) => {
    const pdClsfCd = getPdClsfCd(product);
    product.pdClsfNm = getCodeName('PD_CLSF_CD', pdClsfCd);
    if (pdClsfCd) {
      mappingObj[pdClsfCd] ??= [];
      mappingObj[pdClsfCd].push(product);
    }
  };
  products.value
    .forEach(addPdToMapping);
  Object.getOwnPropertyNames(mappingObj)
    .forEach((pdClsfCd) => {
      if (!mappingObj[pdClsfCd]) {
        delete mappingObj[pdClsfCd];
      }
    });

  classifyingProducts.value = mappingObj;
}

const filteredClassifyingProducts = computed(() => {
  if (!cachedParams.value) {
    return classifyingProducts.value;
  }
  const pdClsfCds = Object.keys(classifyingProducts.value);
  return pdClsfCds.reduce((filtered, pdClsfCd) => {
    const classified = classifyingProducts.value[pdClsfCd];
    if (!classified?.length) {
      return filtered;
    }
    const filterText = cachedParams.value.filterText?.toUpperCase() || '';
    const { sellTpCd } = cachedParams.value;
    const filteredProducts = classified
      .filter((product) => (!filterText
        || product.pdCd?.includes(filterText)
        || product.pdNm?.toUpperCase().includes(filterText)
        || product.cstBasePdAbbrNm?.toUpperCase().includes(filterText)
      ))
      .filter((product) => (!sellTpCd || product.sellTpCd === sellTpCd));
    if (filteredProducts.length) {
      filtered[pdClsfCd] = filteredProducts;
    }
    return filtered;
  }, {});
});

const filteredPdClsfCds = computed(() => Object.keys(filteredClassifyingProducts.value));

async function fetchProducts() {
  cntrNo.value = props.cntrNo;

  if (!cntrNo.value) {
    return;
  }

  const { data } = await dataService.get('sms/wells/contract/contracts/products', {
    params: {
      cntrNo: cntrNo.value,
      rentalDscTpCd: cachedParams.value.rentalDscTpCd,
    },
  });
  products.value = data;
  if (!data?.length) {
    await alert('판매 가능한 상품이 없습니다.');
  }
  classifying();

  // 멤버십 계약 등 1개 상품만 있는 경우, 자동 선택 처리
  // 세부적인 판단은 Step2.vue 에서
  // emit 성능이 문제된다면, length=1 인 경우에만 전달 등 추후 정리
  await emit('fetched', products.value);
}

watch(() => props.cntrNo, fetchProducts);

async function onClickSearch() {
  const shouldFetchProduct = cachedParams.value.rentalDscTpCd !== searchParams.value.rentalDscTpCd;

  cachedParams.value = searchParams.value;
  if (shouldFetchProduct) {
    await fetchProducts();
  } else {
    await nextTick();
  }
  const filteredClassifiedGroup = Object.keys(filteredClassifyingProducts.value);
  if (filteredClassifiedGroup.length) {
    expansionItemRef[filteredClassifiedGroup[0]]?.show();
  }
}

function onClickReset() {
  searchParams.value.filterText = '';
  searchParams.value.sellTpCd = undefined;
  searchParams.value.rentalDscTpCd = undefined;
  selectedProductCode.value = undefined;
  onClickSearch();
}

async function onClickProduct(product) {
  await emit('select', product);
}

onMounted(() => {
  // step2 로 바로 접근하는 경우...
  if (!products.value?.length) {
    fetchProducts();
  }
});

onActivated(() => {
  if (!products.value?.length) {
    fetchProducts();
  }
});
</script>

<style lang="scss" scoped>
@import "~@css/variables";

.scoped-product-select {
  display: flex;
  flex-flow: column nowrap;

  &__search-box {
    flex: none;
  }

  &__product-box {
    flex: auto;
  }
}

.scoped-search-box {
  padding-bottom: $spacing-lg;
  border-bottom: 1px solid $line-line;
  margin-right: 30px;

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

</style>
