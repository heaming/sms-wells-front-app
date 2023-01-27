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
      <wwpdc-standard-mgt-m-rel-prd
        ref="cmpPrdRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :codes="props.codes"
        :readonly="props.readonly"
      />
    </kw-tab-panel>
    <kw-tab-panel name="chg">
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
import { useDataService } from 'kw-lib';
import { pdMergeBy } from '~sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';
import WwpdcStandardMgtMRelPrd from './WwpdcStandardMgtMRelPrd.vue';
import WwpdcStandardMgtMRelChg from './WwpdcStandardMgtMRelChg.vue';

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
const rel = pdConst.TBL_PD_PRC_REL;

const selectedTab = ref('prd');
const currentPdCd = ref();
const currentInitData = ref({});
const cmpPrdRef = ref();
const cmpChgRef = ref();

async function getSaveData() {
  const subList = {};
  subList[rel] = [];
  const prds = await cmpPrdRef.value.getSaveData();
  subList[rel] = pdMergeBy(subList[rel], prds?.[rel]);
  const chgs = await cmpChgRef.value.getSaveData();
  subList[rel] = pdMergeBy(subList[rel], chgs?.[rel]);
  console.log('WwpdcStandardMgtMRel - subList : ', subList);
  return subList;
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
  if (currentPdCd.value) {
    const res = await dataService.get(`/sms/common/product/relations/products/${currentPdCd.value}`, { params: { } });
    currentInitData.value = pdMergeBy(initData, { [pdConst.RELATION_PRODUCTS]: res.data });
    console.log('WwpdcStandardMgtMRel - fetchData - res : ', res);
  } else {
    currentInitData.value = initData;
  }
}

await fetchData();

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; }, { deep: true });
</script>
