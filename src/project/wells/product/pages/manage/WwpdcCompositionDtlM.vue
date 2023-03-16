<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcCompositionDtlM - (판매) 상품목록 - 상세조회 ( Z-PD-U-0011M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 상세조회 프로그램
****************************************************************************************************
--->
<template>
  <kw-page ignore-on-modified>
    <div class="normal-area normal-area--button-set-bottom">
      <div class="kw-stepper-headingtext">
        <h2 class="h2-small">
          {{ pdBas.pdNm }}({{ pdBas.pdCd }})
          <p>
            <span>{{ $t('MSG_TXT_RGST_DT') }} {{ stringUtil.getDateFormat(pdBas.fstRgstDtm) }}
              /  {{ pdBas.fstRgstUsrNm }}</span><span>
              {{ $t('MSG_TXT_L_UPDATED') }} {{ stringUtil.getDateFormat(pdBas.fnlMdfcDtm) }}
              / {{ pdBas.fnlMdfcUsrNm }}</span>
          </p>
        </h2>
      </div>
      <wwpdc-composition-dtl-m-contents
        ref="cmpRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="prevStepData"
        :codes="codes"
        :temp-save-yn="props.tempSaveYn"
      />
    </div>
  </kw-page>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, stringUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import WwpdcCompositionDtlMContents from './WwpdcCompositionDtlMContents.vue';

const props = defineProps({
  pdCd: { type: String, default: null },
  tempSaveYn: { type: String, default: 'Y' },
});

const route = useRoute();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const cmpRef = ref();
const currentPdCd = ref();
const prdPropGroups = ref({});
const pdBas = ref({});
const prevStepData = ref({});

const codes = await codeUtil.getMultiCodes(
  'PD_TP_CD',
  'SELL_CHNL_DTL_CD',
  'SELL_TP_CD',
  'COD_YN',
  'COD_PAGE_SIZE_OPTIONS',
  'PD_REL_TP_CD',
  'PD_TEMP_SAVE_CD',
);
codes.COD_YN.map((item) => {
  item.codeName = item.codeId;
  item.changed = true;
  return item;
});

async function fetchProduct() {
  if (currentPdCd.value) {
    const res = await dataService.get(`/sms/wells/product/compositions/${currentPdCd.value}`);
    pdBas.value = res.data[pdConst.TBL_PD_BAS];
    console.log('WwpdcCompositionDtlM - fetchProduct - res.data', res.data);
    // console.log('res.data : ', res.data);
    prevStepData.value = cloneDeep(res.data);
    prdPropGroups.value = res.data.groupCodes;
  }
}

async function initProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  await fetchProduct();
}

await initProps();

watch(() => route.params.pdCd, async (pdCd) => {
  console.log(`WwpdcCompositionDtlM - currentPdCd.value : ${currentPdCd.value}, route.params.pdCd : ${pdCd}`);
  if (pdCd) {
    if (cmpRef.value?.resetData) await cmpRef.value?.resetData();
    currentPdCd.value = pdCd;
    fetchProduct();
  }
}, { immediate: true });

</script>
<style scoped></style>
