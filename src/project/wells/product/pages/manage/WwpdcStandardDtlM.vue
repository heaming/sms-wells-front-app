<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardDtlM - (판매) 상품목록 - 상세조회 ( Z-PD-U-0011M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 상세조회 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <wwpdc-standard-dtl-m-contents
      v-model:pd-cd="currentPdCd"
      v-model:init-data="initData"
      :codes="codes"
      :temp-save-yn="props.tempSaveYn"
    />
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil } from 'kw-lib';
import pdConst from '~sms-common/product/constants/pdConst';
import WwpdcStandardDtlMContents from './WwpdcStandardDtlMContents.vue';

const props = defineProps({
  pdCd: { type: String, default: null },
  tempSaveYn: { type: String, default: 'Y' },
});

const route = useRoute();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const bas = pdConst.TBL_PD_BAS;
const dtl = pdConst.TBL_PD_DTL;
const ecom = pdConst.TBL_PD_ECOM_PRP_DTL;
const prcd = pdConst.TBL_PD_PRC_DTL;
const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;
const prumd = pdConst.TBL_PD_DSC_PRUM_DTL;

const currentPdCd = ref();
const prdPropGroups = ref({});
const pdBas = ref({});
const initData = ref({});

const codes = await codeUtil.getMultiCodes(
  'PD_TP_CD',
  'COD_PRDT_STT',
  'SELL_CHNL_DTL_CD',
  'SELL_TP_CD',
  'COD_YN',
  'COD_PAGE_SIZE_OPTIONS',
  'PD_REL_TP_CD',
  'PD_TEMP_SAVE_CD',
  'SV_PRD_UNIT_CD',
  'SV_VST_PRD_CD',
  'PD_TEMP_SAVE_CD',
);
codes.COD_YN.map((item) => {
  item.codeName = item.codeId;
  return item;
});

async function fetchProduct() {
  initData.value = {};
  const res = await dataService.get(`/sms/common/product/standards/${currentPdCd.value}`);
  // console.log('WwpdcStandardDtlM - fetchProduct - res.data', res.data);
  pdBas.value = res.data[pdConst.TBL_PD_BAS];
  initData.value[bas] = res.data[bas];
  initData.value[dtl] = res.data[dtl];
  initData.value[ecom] = res.data[ecom];
  initData.value[prcd] = res.data[prcd];
  initData.value[prcfd] = res.data[prcfd];
  initData.value[prumd] = res.data[prumd];
  initData.value[pdConst.RELATION_PRODUCTS] = res.data[pdConst.RELATION_PRODUCTS];
  console.log('WwpdcStandardDtlM - fetchProduct - initData.value : ', initData.value);
  prdPropGroups.value = res.data.groupCodes;
}

async function initProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  await fetchProduct();
}

await initProps();

watch(() => route.params.pdCd, async (pdCd) => {
  console.log(`currentPdCd.value : ${currentPdCd.value}, route.params.pdCd : ${pdCd}`);
  if (currentPdCd.value !== pdCd && pdCd) {
    currentPdCd.value = pdCd;
    fetchProduct();
  }
}, { immediate: true });

</script>
<style scoped></style>
