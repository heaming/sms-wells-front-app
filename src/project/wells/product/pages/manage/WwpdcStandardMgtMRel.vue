<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMPrice - 기준상품 등록/변경 - 연결상품 선택 ( W-PD-U-0010M01 )
3. 작성자 : gs.piit141
4. 작성일 : 2023.06.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 연결상품 선택 프로그램
****************************************************************************************************
--->
<template>
  <h2>{{ $t('MSG_TXT_REL_PRDT_SEL') }}</h2>
  <kw-tabs
    v-model="selectedTab"
    class="mt20"
  >
    <!-- 판매상품 -->
    <kw-tab
      name="prd"
      :label="$t('MSG_TXT_SALE_PROD')"
    />
    <!-- 대체품 -->
    <kw-tab
      name="chg"
      :label="$t('MSG_TXT_REP_PROD')"
    />
  </kw-tabs>
  <kw-tab-panels :model-value="selectedTab">
    <kw-tab-panel name="prd">
      <wwpdc-standard-mgt-m-rel-prd />
    </kw-tab-panel>
    <kw-tab-panel name="chg">
      <wwpdc-standard-mgt-m-rel-chg />
    </kw-tab-panel>
  </kw-tab-panels>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import WwpdcStandardMgtMRelPrd from './WwpdcStandardMgtMRelPrd.vue';
import WwpdcStandardMgtMRelChg from './WwpdcStandardMgtMRelChg.vue';

/* eslint-disable no-use-before-define */
defineExpose({
  getSaveData, isModifiedProps, validateProps,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
});

const selectedTab = ref('prd');
const currentPdCd = ref();
const currentInitData = ref({});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
function getSaveData() {
  return {};
}

function isModifiedProps() {
  return true;
}

function validateProps() {
  return true;
}

async function fetchData() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
}

await fetchData();

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; }, { deep: true });
</script>
