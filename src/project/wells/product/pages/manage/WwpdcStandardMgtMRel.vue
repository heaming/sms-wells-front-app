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
    @update:model-value="onClickTab(selectedTab)"
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
      />
    </kw-tab-panel>
    <kw-tab-panel :name="selectedTabs[1]">
      <wwpdc-standard-mgt-m-rel-chg
        ref="cmpChgRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :codes="props.codes"
      />
    </kw-tab-panel>
  </kw-tab-panels>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { cloneDeep, isEqual } from 'lodash-es';
import { pdMergeBy } from '~sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';
import WwpdcStandardMgtMRelPrd from './WwpdcStandardMgtMRelPrd.vue';
import WwpdcStandardMgtMRelChg from './WwpdcStandardMgtMRelChg.vue';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData, init, getSaveData, isModifiedProps, validateProps, moveNextStep, movePrevStep, resetFirstStep,
});

const props = defineProps({
  pdCd: { type: String, default: null }, // 상품코드
  initData: { type: Object, default: null }, // 초기데이터
  codes: { type: Object, default: null }, // 공통코드
});

const emits = defineEmits([
  'clickTab',
]);

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

// 데이터 초기화
async function resetData() {
  selectedTab.value = selectedTabs.value[0];
  if (cmpPrdRef.value.resetData) await cmpPrdRef.value.resetData();
  if (cmpChgRef.value.resetData) await cmpChgRef.value.resetData();
}

// 컴포넌트 초기화
async function init() {
  if (cmpPrdRef.value.init) await cmpPrdRef.value.init();
  if (cmpChgRef.value.init) await cmpChgRef.value.init();
}

// 저장 데이터
async function getSaveData() {
  // 미수정시 초기값 그대로 반환.
  if (!(await isModifiedProps())) {
    return {
      [pdConst.RELATION_PRODUCTS]: currentInitData.value[pdConst.RELATION_PRODUCTS],
      [pdConst.TBL_PD_REL]: currentInitData.value[pdConst.RELATION_PRODUCTS],
    };
  }
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

// 수정 여부
async function isModifiedProps() {
  if (await cmpPrdRef.value.isModifiedProps()) {
    return true;
  }
  if (await cmpChgRef.value.isModifiedProps()) {
    return true;
  }
  return false;
}

// 검증
async function validateProps() {
  let isValidOk = await cmpPrdRef.value.validateProps();
  if (isValidOk) isValidOk = await cmpChgRef.value.validateProps();
  return isValidOk;
}

// 다음 탭 이동
async function moveNextStep() {
  const currentTabIndex = selectedTabs.value.indexOf(selectedTab.value);
  if (currentTabIndex < (selectedTabs.value.length - 1)) {
    selectedTab.value = selectedTabs.value[currentTabIndex + 1];
    return true;
  }
  return false;
}

// 이전 탭 이동
async function movePrevStep() {
  const currentTabIndex = selectedTabs.value.indexOf(selectedTab.value);
  if (currentTabIndex > 0) {
    selectedTab.value = selectedTabs.value[currentTabIndex - 1];
    return true;
  }
  return false;
}

// 탭 선택
async function onClickTab(clickedTab) {
  emits('clickTab', clickedTab);
}

// 초기 탭으로 이동
async function resetFirstStep() {
  selectedTab.value = selectedTabs.value[0];
}

// Props 데이터 설정
async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = cloneDeep({
    [pdConst.TBL_PD_REL]: initData[pdConst.TBL_PD_REL],
    [pdConst.RELATION_PRODUCTS]: initData[pdConst.RELATION_PRODUCTS],
  });
}

await initProps();

watch(() => props.pdCd, (pdCd) => { currentPdCd.value = pdCd; });
watch(() => props.initData, (initData) => {
  const usedData = {
    [pdConst.TBL_PD_REL]: initData[pdConst.TBL_PD_REL],
    [pdConst.RELATION_PRODUCTS]: initData[pdConst.RELATION_PRODUCTS],
  };
  if (!isEqual(currentInitData.value, usedData)) {
    currentInitData.value = cloneDeep(usedData);
  }
}, { deep: true });
</script>
