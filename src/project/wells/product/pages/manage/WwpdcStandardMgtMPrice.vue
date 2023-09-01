<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMPrice - 기준상품 등록/변경 - 가격정보 ( W-PD-U-0010M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 가격정보 프로그램
****************************************************************************************************
--->
<template>
  <kw-tabs
    v-model="selectedTab"
    class="mt20"
    @update:model-value="onClickTab(selectedTab)"
  >
    <!-- 기준가 등록 -->
    <kw-tab
      :name="selectedTabs[0]"
      :label="$t('MSG_TXT_PD_STD_PRICE_REG')"
    />
    <!-- 선택변수 등록 -->
    <kw-tab
      :name="selectedTabs[1]"
      :label="$t('MSG_TXT_PD_REG_SEL_VAR')"
    />
    <!-- 최종가격 조정 -->
    <kw-tab
      :name="selectedTabs[2]"
      :label="$t('MSG_TXT_PD_FNL_PRC_ADJ')"
    />
    <!-- 수수료 등록 -->
    <kw-tab
      :name="selectedTabs[3]"
      :label="$t('MSG_TXT_PD_REG_FEE')"
    />
  </kw-tabs>
  <kw-tab-panels :model-value="selectedTab">
    <kw-tab-panel :name="selectedTabs[0]">
      <wwpdc-standard-mgt-m-price-std
        ref="cmpStdRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :meta-infos="metaInfos"
        :codes="currentCodes"
        :readonly="props.readonly"
      />
    </kw-tab-panel>
    <kw-tab-panel :name="selectedTabs[1]">
      <wwpdc-standard-mgt-m-price-val
        ref="cmpValRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :meta-infos="metaInfos"
        :codes="currentCodes"
        :readonly="props.readonly"
      />
    </kw-tab-panel>
    <kw-tab-panel :name="selectedTabs[2]">
      <wwpdc-standard-mgt-m-price-fnl
        ref="cmpFnlRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :meta-infos="metaInfos"
        :codes="currentCodes"
        :readonly="props.readonly"
      />
    </kw-tab-panel>
    <kw-tab-panel :name="selectedTabs[3]">
      <wwpdc-standard-mgt-m-price-fee
        ref="cmpFeeRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :meta-infos="metaInfos"
        :codes="currentCodes"
        :readonly="props.readonly"
      />
    </kw-tab-panel>
  </kw-tab-panels>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil } from 'kw-lib';
import { isEmpty, merge, cloneDeep, isEqual } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { pdMergeBy, getPdMetaToCodeNames } from '~sms-common/product/utils/pdUtil';
import WwpdcStandardMgtMPriceStd from './WwpdcStandardMgtMPriceStd.vue';
import WwpdcStandardMgtMPriceVal from './WwpdcStandardMgtMPriceVal.vue';
import WwpdcStandardMgtMPriceFnl from './WwpdcStandardMgtMPriceFnl.vue';
import WwpdcStandardMgtMPriceFee from './WwpdcStandardMgtMPriceFee.vue';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData,
  init,
  getSaveData,
  isModifiedProps,
  validateProps,
  validateStepProps,
  moveNextStep,
  movePrevStep,
  resetFirstStep,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  codes: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
});

const emits = defineEmits([
  'clickTab', 'applyData',
]);

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const prcd = pdConst.TBL_PD_PRC_DTL;
const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;

const cmpStdRef = ref();
const cmpValRef = ref();
const cmpFnlRef = ref();
const cmpFeeRef = ref();
// const cmpCopyRef = ref();
const currentPdCd = ref();
const metaInfos = ref({});
const currentInitData = ref({});
// const selectedTabs = ref(['std', 'val', 'fnl', 'fee', 'copy']);
const selectedTabs = ref(['std', 'val', 'fnl', 'fee']);
const selectedTab = ref(selectedTabs.value[0]);
const currentCodes = ref({});

async function resetData() {
  selectedTab.value = selectedTabs.value[0];
  if (cmpStdRef.value?.resetData) await cmpStdRef.value.resetData();
  if (cmpValRef.value?.resetData) await cmpValRef.value.resetData();
  if (cmpFnlRef.value?.resetData) await cmpFnlRef.value.resetData();
  if (cmpFeeRef.value?.resetData) await cmpFeeRef.value.resetData();
  // if (cmpCopyRef.value?.resetData) await cmpCopyRef.value.resetData();
}

async function init() {
  if (cmpStdRef.value?.init) await cmpStdRef.value.init();
  if (cmpValRef.value?.init) await cmpValRef.value.init();
  if (cmpFnlRef.value?.init) await cmpFnlRef.value.init();
  if (cmpFeeRef.value?.init) await cmpFeeRef.value.init();
  // if (cmpCopyRef.value?.init) await cmpCopyRef.value.init();
}

function getInitPriceDefault(prcds, prcfds) {
  if (!prcds || !prcds.length || !prcfds || !prcfds.length) {
    return prcfds;
  }
  // 저장전 할인적용가격, 최종가 재계산
  prcfds?.forEach((prcRow) => {
    // 기본가
    const basVal = Number(prcds
      .find((stdRow) => stdRow[pdConst.PRC_STD_ROW_ID] === prcRow[pdConst.PRC_STD_ROW_ID])?.basVal ?? 0);
      // 조정 전 가격 ( 01: 정액, 02: 정률)
    if (isEmpty(prcRow.cndtFxamFxrtDvCd) || prcRow.cndtFxamFxrtDvCd === '01') {
      // 할인적용가격 = 기본가 + 조정가
      prcRow.prcBefAdj = basVal + Number(prcRow.cndtDscPrumVal ?? 0);
    } else if (prcRow.cndtFxamFxrtDvCd === '02') {
      // 할인적용가격 = 기본가 + 조정률
      const calPrc = Math.round((basVal * Number(prcRow.cndtDscPrumVal ?? 0)) / 100, 2);
      prcRow.prcBefAdj = Number(basVal) + calPrc;
    }
    // 최종가
    prcRow.fnlVal = Number(prcRow.prcBefAdj ?? 0) + Number(prcRow.ctrVal ?? 0);
  });
  return prcfds;
}

async function getSaveData(isBatchCopy) {
  // console.log('isBatchCopy : ', isBatchCopy);
  // 미수정시 초기값 그대로 반환.
  // isBatchCopy -일괄복사 탭 사용 여부
  if (!(await isModifiedProps()) && !isBatchCopy) {
    return {
      [prcd]: currentInitData.value[prcd],
      [prcfd]: currentInitData.value[prcfd],
    };
  }

  const subList = {};
  subList[prcd] = [];
  subList[prcfd] = [];
  subList[pdConst.REMOVE_ROWS] = [];
  const stds = await cmpStdRef.value?.getSaveData();
  subList[pdConst.REMOVE_ROWS] = pdMergeBy(subList[pdConst.REMOVE_ROWS], stds[pdConst.REMOVE_ROWS]);
  subList[prcd] = pdMergeBy(subList[prcd], stds?.[prcd], pdConst.PRC_STD_ROW_ID);
  // console.log('WwpdcStandardMgtMPrice - getSaveData - 1 - subList[prcd] : ', subList[prcd]);

  const vals = await cmpValRef.value?.getSaveData();
  subList[pdConst.REMOVE_ROWS] = pdMergeBy(subList[pdConst.REMOVE_ROWS], vals[pdConst.REMOVE_ROWS]);
  subList[prcfd] = pdMergeBy(subList[prcfd], vals?.[prcfd], pdConst.PRC_FNL_ROW_ID);
  subList[pdConst.TBL_PD_DSC_PRUM_DTL] = vals?.[pdConst.TBL_PD_DSC_PRUM_DTL];
  // console.log('WwpdcStandardMgtMPrice - getSaveData - 2 - subList[prcfd] : ', subList[prcfd]);

  const fnls = await cmpFnlRef.value?.getSaveData();
  subList[pdConst.REMOVE_ROWS] = pdMergeBy(subList[pdConst.REMOVE_ROWS], fnls[pdConst.REMOVE_ROWS]);
  subList[prcfd] = pdMergeBy(subList[prcfd], fnls?.[prcfd], pdConst.PRC_FNL_ROW_ID);
  // console.log('WwpdcStandardMgtMPrice - getSaveData - subList[prcfd] : ', subList[prcfd]);
  // 저장전 할인적용가격, 최종가 재계산
  subList[prcfd] = getInitPriceDefault(subList[prcd], subList[prcfd]);

  // console.log('WwpdcStandardMgtMPrice - getSaveData - 3 - subList[prcfd] : ', subList[prcfd]);
  const fees = await cmpFeeRef.value?.getSaveData();
  subList[pdConst.REMOVE_ROWS] = pdMergeBy(subList[pdConst.REMOVE_ROWS], fees[pdConst.REMOVE_ROWS]);
  subList[prcfd] = pdMergeBy(subList[prcfd], fees?.[prcfd], pdConst.PRC_FNL_ROW_ID);
  // console.log('WwpdcStandardMgtMPrice - getSaveData - 4 - subList[prcfd] : ', subList[prcfd]);
  // console.log('WwpdcStandardMgtMPrice - getSaveData - REMOVE_ROWS : ', subList[pdConst.REMOVE_ROWS]);
  // console.log('WwpdcStandardMgtMPrice - getSaveData - subList : ', subList);

  // 일괄복사
  // if (isBatchCopy) {
  //   const copies = await cmpCopyRef.value?.getSaveData();
  //   subList[prcfd] = pdMergeBy(subList[prcfd], copies?.[prcfd], pdConst.PRC_FNL_ROW_ID);
  // }

  return subList;
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

async function onClickTab(clickedTab) {
  emits('clickTab', clickedTab);
}

/* async function applyData() {
  emits('applyData');
} */

async function isModifiedProps() {
  if (await cmpStdRef.value.isModifiedProps()) {
    return true;
  }
  if (await cmpValRef.value.isModifiedProps()) {
    return true;
  }
  if (await cmpFnlRef.value.isModifiedProps()) {
    return true;
  }
  if (await cmpFeeRef.value.isModifiedProps()) {
    return true;
  }
  // if (await cmpCopyRef.value.isModifiedProps()) {
  //   return true;
  // }
  return false;
}

async function validateStepProps() {
  if (selectedTab.value === selectedTabs.value[0]) {
    return await cmpStdRef.value.validateProps();
  }
  if (selectedTab.value === selectedTabs.value[1]) {
    return await cmpValRef.value.validateProps();
  }
  if (selectedTab.value === selectedTabs.value[2]) {
    return await cmpFnlRef.value.validateProps();
  }
  if (selectedTab.value === selectedTabs.value[3]) {
    return await cmpFeeRef.value.validateProps();
  }
  return true;
}

async function validateProps() {
  let isValidOk = true;
  isValidOk = await cmpStdRef.value.validateProps();
  if (!isValidOk) {
    selectedTab.value = selectedTabs.value[0];
    return isValidOk;
  }
  isValidOk = await cmpValRef.value.validateProps();
  if (!isValidOk) {
    selectedTab.value = selectedTabs.value[1];
    return isValidOk;
  }
  isValidOk = await cmpFnlRef.value.validateProps();
  if (!isValidOk) {
    selectedTab.value = selectedTabs.value[2];
    return isValidOk;
  }
  isValidOk = await cmpFeeRef.value.validateProps();
  if (!isValidOk) {
    selectedTab.value = selectedTabs.value[3];
    return isValidOk;
  }
  return isValidOk;
}

async function initProps() {
  const { pdCd, initData, codes } = props;
  currentPdCd.value = pdCd;
  const priceDatas = cloneDeep(initData);
  priceDatas[prcfd] = await getInitPriceDefault(priceDatas[prcd], priceDatas[prcfd]);
  currentInitData.value = priceDatas;
  currentCodes.value = cloneDeep(codes);
  await fetchData();
}

async function fetchData() {
  if (isEmpty(metaInfos.value)) {
    const res = await dataService.get('/sms/common/product/meta-properties', { params: { pdPrcTpCd: pdConst.PD_PRC_TP_CD_ALL } });
    if (isEmpty(res.data)) {
      return;
    }
    metaInfos.value = res.data;
    // console.log('WwpdcStandardMgtMPrice - fetchData - metaInfos.value : ', metaInfos.value);
    const codeNames = await getPdMetaToCodeNames(metaInfos.value, currentCodes.value);
    if (!isEmpty(codeNames)) {
      try {
        currentCodes.value = merge(currentCodes.value, await codeUtil.getMultiCodes(...codeNames));
      } catch (e) {
        console.log(e);
      // 공통코드 없는 에러 때문에 임시 - 추후 Try catch 삭제
      }
    }
  }
}

await initProps();

watch(() => props.pdCd, (pdCd) => { currentPdCd.value = pdCd; });
watch(() => props.initData, (initData) => {
  if (!isEqual(currentInitData.value, initData)) {
    const priceDatas = cloneDeep(initData);
    priceDatas[prcfd] = getInitPriceDefault(priceDatas[prcd], priceDatas[prcfd]);
    currentInitData.value = priceDatas;
  }
}, { deep: true });
watch(() => props.codes, (codes) => { currentCodes.value = cloneDeep(codes); }, { deep: true });
</script>
