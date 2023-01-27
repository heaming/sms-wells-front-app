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
  <!-- 가격정보 -->
  <h2>{{ $t('MSG_TXT_PRICE_INFO') }}</h2>
  <kw-tabs
    v-model="selectedTab"
    class="mt20"
    @update:model-value="initCurrentData"
  >
    <!-- 기준가 등록 -->
    <kw-tab
      name="std"
      :label="$t('MSG_TXT_PD_STD_PRICE_REG')"
    />
    <!-- 선택변수 등록 -->
    <kw-tab
      name="val"
      :label="$t('MSG_TXT_PD_REG_SEL_VAR')"
    />
    <!-- 최종가격 조정 -->
    <kw-tab
      name="fnl"
      :label="$t('MSG_TXT_PD_FNL_PRC_ADJ')"
    />
    <!-- 수수료 등록 -->
    <kw-tab
      name="fee"
      :label="$t('MSG_TXT_PD_REG_FEE')"
    />
  </kw-tabs>
  <kw-tab-panels :model-value="selectedTab">
    <kw-tab-panel name="std">
      <wwpdc-standard-mgt-m-price-std
        ref="cmpStdRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :meta-infos="metaInfos"
        :codes="currentCodes"
        :readonly="props.readonly"
      />
    </kw-tab-panel>
    <kw-tab-panel name="val">
      <wwpdc-standard-mgt-m-price-val
        ref="cmpValRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :meta-infos="metaInfos"
        :codes="currentCodes"
        :readonly="props.readonly"
      />
    </kw-tab-panel>
    <kw-tab-panel name="fnl">
      <wwpdc-standard-mgt-m-price-fnl
        ref="cmpFnlRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :meta-infos="metaInfos"
        :codes="currentCodes"
        :readonly="props.readonly"
      />
    </kw-tab-panel>
    <kw-tab-panel name="fee">
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
import { isEmpty, merge } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { pdMergeBy, getPdMetaToCodeNames } from '~sms-common/product/utils/pdUtil';
import WwpdcStandardMgtMPriceStd from './WwpdcStandardMgtMPriceStd.vue';
import WwpdcStandardMgtMPriceVal from './WwpdcStandardMgtMPriceVal.vue';
import WwpdcStandardMgtMPriceFnl from './WwpdcStandardMgtMPriceFnl.vue';
import WwpdcStandardMgtMPriceFee from './WwpdcStandardMgtMPriceFee.vue';

/* eslint-disable no-use-before-define */
defineExpose({
  getSaveData, isModifiedProps, validateProps,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  codes: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
});

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
const currentPdCd = ref();
const metaInfos = ref({});
const currentInitData = ref({});
const selectedTab = ref('std');
const currentCodes = ref({});

async function getSaveData() {
  const subList = {};
  subList[prcd] = [];
  subList[prcfd] = [];
  subList[pdConst.REMOVE_ROWS] = [];
  const stds = await cmpStdRef.value.getSaveData();
  subList[pdConst.REMOVE_ROWS] = pdMergeBy(subList[pdConst.REMOVE_ROWS], stds[pdConst.REMOVE_ROWS]);
  subList[prcd] = pdMergeBy(subList[prcd], stds?.[prcd], pdConst.PRC_STD_ROW_ID);
  const vals = await cmpValRef.value.getSaveData();
  subList[pdConst.REMOVE_ROWS] = pdMergeBy(subList[pdConst.REMOVE_ROWS], vals[pdConst.REMOVE_ROWS]);
  subList[prcfd] = pdMergeBy(subList[prcfd], vals?.[prcfd], pdConst.PRC_FNL_ROW_ID);
  const fnls = await cmpFnlRef.value.getSaveData();
  subList[pdConst.REMOVE_ROWS] = pdMergeBy(subList[pdConst.REMOVE_ROWS], fnls[pdConst.REMOVE_ROWS]);
  subList[prcfd] = pdMergeBy(subList[prcfd], fnls?.[prcfd], pdConst.PRC_FNL_ROW_ID, pdConst.PRC_STD_ROW_ID);
  const fees = await cmpFeeRef.value.getSaveData();
  subList[pdConst.REMOVE_ROWS] = pdMergeBy(subList[pdConst.REMOVE_ROWS], fees[pdConst.REMOVE_ROWS]);
  subList[prcfd] = pdMergeBy(subList[prcfd], fees?.[prcfd], pdConst.PRC_FNL_ROW_ID, pdConst.PRC_STD_ROW_ID);
  console.log('WwpdcStandardMgtMPrice - subList : ', subList);
  return subList;
}

async function initCurrentData() {
  const saveData = await getSaveData();
  currentInitData.value[prcd] = saveData[prcd];
  currentInitData.value[prcfd] = saveData[prcfd];
  console.log('WwpdcStandardMgtMPrice - initCurrentData - : ', currentInitData.value);
}

function isModifiedProps() {
  return true;
}

function validateProps() {
  return true;
}

async function fetchData() {
  const { pdCd, initData, codes } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  const res = await dataService.get('/sms/common/product/meta-properties', { params: { pdPrcTpCd: pdConst.PD_PRC_TP_CD_ALL } });
  if (isEmpty(res.data)) {
    return;
  }
  metaInfos.value = res.data;
  console.log('WwpdcStandardMgtMPrice - fetchData - metaInfos.value : ', metaInfos.value);
  const codeNames = await getPdMetaToCodeNames(metaInfos.value, props.codes);
  if (!isEmpty(codeNames)) {
    currentCodes.value = merge(codes, await codeUtil.getMultiCodes(...codeNames));
  }
}

await fetchData();

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; }, { deep: true });
</script>
