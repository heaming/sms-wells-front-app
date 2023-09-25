<template>
  <div class="scoped-layout__pick-area">
    <div class="scoped-layout__search-box scoped-search-box">
      <h3 class="scoped-search-box__title">
        상품검색
      </h3>
      <kw-input
        v-model="pdFilter"
        @keydown.enter="setFilter"
      />
      <kw-select
        v-model="searchSellTpCd"
        class="mt8"
        :options="codes.SELL_TP_CD"
        first-option="select"
        @change="setFilter"
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
          @click="setFilter"
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
          v-for="clsf in filteredClsfPds"
          :ref="(vm) => clsfItemRefs[clsf.pdClsfId] = vm"
          :key="`product-type-${clsf.pdClsfId}`"
          padding-target="header"
          expansion-icon-align="center"
          expand-icon="arrow_down"
        >
          <template #header>
            <kw-item-section>
              <kw-item-label font="body">
                {{ clsf.pdClsfNm }}
              </kw-item-label>
            </kw-item-section>
          </template>
          <kw-list
            class="scoped-product-picker-list"
            item-class="scoped-product-picker-list__item"
            :items="clsf.products"
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
                    label="pdChip1"
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
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { alert, useDataService, useGlobal } from 'kw-lib';
import { useCtCode } from '~sms-common/contract/composable';

const props = defineProps({
  cntrNo: { type: String, required: true },
});
const emit = defineEmits([
  'select',
]);
const exposed = {};
defineExpose(exposed);

const dataService = useDataService();
const { notify } = useGlobal();
const { codes } = await useCtCode('CNTR_TP_CD', 'SELL_TP_CD');

const cntrNo = ref(props.cntrNo);

const pdFilter = ref('');
const cachedSellTpCd = ref('');
const searchSellTpCd = ref('');
const cachedPdFilter = ref('');
const classfiedPds = ref([]);
const filteredClsfPds = ref([]);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function getProducts() {
  const { data } = await dataService.get('sms/wells/contract/contracts/reg-products', {
    params: {
      cntrNo: cntrNo.value,
      pdFilter: pdFilter.value,
    },
  });
  classfiedPds.value = data.pdClsf;
  pdFilter.value = '';
  cachedPdFilter.value = '';
  cachedSellTpCd.value = '';
  filteredClsfPds.value = classfiedPds.value;
  if (classfiedPds.value.length === 0) {
    await alert('판매 가능한 상품이 없습니다.');
  }
}

async function resetFilter() {
  pdFilter.value = '';
  await getProducts(props.contract.cntrNo);
}

async function addProduct() {
  /* TODO EMIT */
  emit('select');
}

async function onClickProduct(pd) {
  // 상품 추가
  if (pd.pdClsf === '7') {
    // 하위상품 조회 후 추가
    const { data } = await dataService.get('sms/wells/contract/contracts/reg-cpt-products', {
      params: {
        cntrNo: cntrNo.value,
        hgrPdCd: pd.pdCd,
      },
    });
    const promises = data.map(addProduct);
    await Promise.all(promises);
    return;
  }

  await addProduct(pd);
}

const clsfItemRefs = reactive({});

function setFilter() {
  cachedPdFilter.value = pdFilter.value?.trim() || '';
  cachedSellTpCd.value = searchSellTpCd.value;
  Object.values(clsfItemRefs)
    .forEach((vm) => {
      vm?.show();
    });
  if (!Array.isArray(classfiedPds.value)) {
    return [];
  }
  let clsfPds = classfiedPds.value;
  if (!cachedPdFilter.value && !cachedSellTpCd.value) {
    filteredClsfPds.value = clsfPds;
    return;
  }
  clsfPds = clsfPds.reduce((filtered, clsf) => {
    const filteredPds = clsf.products
      .filter((pd) => !cachedPdFilter.value || pd.pdNm.includes(cachedPdFilter.value))
      .filter((pd) => !cachedSellTpCd.value || pd.sellTpCd === cachedSellTpCd.value);
    if (filteredPds.length > 0) {
      filtered.push({
        ...clsf,
        products: filteredPds,
      });
    }
    return filtered;
  }, []);
  if (clsfPds.length === 0) {
    notify('검색 조건에 맞는 상품이 없습니다.');
    filteredClsfPds.value = classfiedPds.value;
  }
  filteredClsfPds.value = clsfPds;
}

</script>
