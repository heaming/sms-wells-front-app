<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMPrice - 기준상품 등록/변경 - 가격정보 ( W-PD-U-0010M01 )
3. 작성자 : gs.piit141
4. 작성일 : 2023.06.30
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
        :codes="codes"
      />
    </kw-tab-panel>
    <kw-tab-panel name="val">
      <wwpdc-standard-mgt-m-price-val
        ref="cmpValRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :meta-infos="metaInfos"
        :codes="codes"
      />
    </kw-tab-panel>
    <kw-tab-panel name="fnl">
      <wwpdc-standard-mgt-m-price-fnl
        ref="cmpFnlRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :meta-infos="metaInfos"
        :codes="codes"
      />
    </kw-tab-panel>
    <kw-tab-panel name="fee">
      <wwpdc-standard-mgt-m-price-fee
        ref="cmpFeeRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :meta-infos="metaInfos"
        :codes="codes"
      />
    </kw-tab-panel>
  </kw-tab-panels>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil } from 'kw-lib';
import { isEmpty, merge, unionBy } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { getPdMetaToCodeNames } from '~sms-common/product/utils/pdUtil';
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
});

const dataService = useDataService();

const prcd = pdConst.TBL_PD_PRC_DTL;

const cmpStdRef = ref();
const cmpValRef = ref();
const cmpFnlRef = ref();
const cmpFeeRef = ref();
const currentPdCd = ref();
const metaInfos = ref({});
const currentInitData = ref({});
const selectedTab = ref('std');
const codes = ref({});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function getSaveData() {
  const subList = {};
  subList[prcd] = [];
  const stds = await cmpStdRef.value.getSaveData();
  subList[prcd] = unionBy(stds?.[prcd], subList[prcd], 'pdPrcDtlId');
  const vals = await cmpValRef.value.getSaveData();
  subList[prcd] = unionBy(vals?.[prcd], subList[prcd], 'pdPrcDtlId');
  const fnls = await cmpFnlRef.value.getSaveData();
  subList[prcd] = unionBy(fnls?.[prcd], subList[prcd], 'pdPrcDtlId');
  const fees = await cmpFnlRef.value.getSaveData();
  subList[prcd] = unionBy(fees?.[prcd], subList[prcd], 'pdPrcDtlId');
  return subList;
}

async function initCurrentData() {
  currentInitData.value[prcd] = await getSaveData()[prcd];
  console.log('WwpdcStandardMgtMPrice - initCurrentData - : ', currentInitData.value);
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
  const res = await dataService.get('/sms/common/product/meta-properties', { params: { pdPrcTpCd: pdConst.PD_PRC_TP_CD_BASIC } });
  if (isEmpty(res.data)) {
    return;
  }
  metaInfos.value = res.data;
  console.log('WwpdcStandardMgtMPrice - fetchData - metaInfos.value : ', metaInfos.value);
  const codeNames = await getPdMetaToCodeNames(metaInfos.value);
  codeNames.push('SELL_CHNL_DV_CD');
  codes.value = merge(codes.value, await codeUtil.getMultiCodes(...codeNames));
}

await fetchData();

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; }, { deep: true });
</script>
