<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMRel - 기준상품 등록/변경 - 연결상품 선택 ( W-PD-U-0010M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 연결상품 선택 프로그램
****************************************************************************************************
--->
<template>
  <kw-tabs
    v-model="selectedTab"
    class="mt20"
  >
    <!-- 판매상품 -->
    <kw-tab
      :name="selectedTabs[0]"
      :label="$t('MSG_TXT_SALE_PROD')"
    />
    <!-- 대체품 -->
    <kw-tab
      :name="selectedTabs[1]"
      :label="$t('MSG_TXT_REP_PROD')"
    />
  </kw-tabs>
  <kw-tab-panels :model-value="selectedTab">
    <kw-tab-panel :name="selectedTabs[0]">
      <wwpdc-standard-mgt-m-rel-prd
        ref="cmpPrdRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :codes="props.codes"
        :readonly="props.readonly"
      />
    </kw-tab-panel>
    <kw-tab-panel :name="selectedTabs[1]">
      <wwpdc-standard-mgt-m-rel-chg
        ref="cmpChgRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :codes="props.codes"
        :readonly="props.readonly"
      />
    </kw-tab-panel>
  </kw-tab-panels>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { cloneDeep } from 'lodash-es';
import { pdMergeBy } from '~sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';
import WwpdcStandardMgtMRelPrd from './WwpdcStandardMgtMRelPrd.vue';
import WwpdcStandardMgtMRelChg from './WwpdcStandardMgtMRelChg.vue';

/* eslint-disable no-use-before-define */
defineExpose({
  getSaveData, isModifiedProps, validateProps, moveNextStep, movePrevStep, resetFirstStep,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  codes: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const rel = pdConst.TBL_PD_REL;

const selectedTabs = ref(['prd', 'chg']);
const selectedTab = ref(selectedTabs.value[0]);
const currentPdCd = ref();
const currentInitData = ref();
const cmpPrdRef = ref();
const cmpChgRef = ref();

async function getSaveData() {
  const subList = {};
  subList[rel] = [];
  const prds = await cmpPrdRef.value.getSaveData();
  subList[rel] = pdMergeBy(subList[rel], prds?.[rel]);
  const chgs = await cmpChgRef.value.getSaveData();
  subList[rel] = pdMergeBy(subList[rel], chgs?.[rel]);
  if (subList[rel]) {
    subList[pdConst.RELATION_PRODUCTS] = cloneDeep(subList[rel]);
  }

  // console.log('WwpdcStandardMgtMRel - subList : ', subList);
  return subList;
}

function isModifiedProps() {
  return true;
}

function validateProps() {
  return true;
}

async function moveNextStep() {
  const currentTabIndex = selectedTabs.value.indexOf(selectedTab.value);
  if (currentTabIndex < (selectedTabs.value.length - 1)) {
    selectedTab.value = selectedTabs.value[currentTabIndex + 1];
    return true;
  }
  return false;
}

async function movePrevStep() {
  const currentTabIndex = selectedTabs.value.indexOf(selectedTab.value);
  if (currentTabIndex > 0) {
    selectedTab.value = selectedTabs.value[currentTabIndex - 1];
    return true;
  }
  return false;
}

async function resetFirstStep() {
  selectedTab.value = selectedTabs.value[0];
}

async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = cloneDeep(initData);
}

await initProps();

watch(() => props.pdCd, (pdCd) => { currentPdCd.value = pdCd; });
watch(() => props.initData, (initData) => { currentInitData.value = cloneDeep(initData); }, { deep: true });
</script>
