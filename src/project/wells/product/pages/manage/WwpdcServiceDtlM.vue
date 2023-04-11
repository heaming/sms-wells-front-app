<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcServiceDtlM - 서비스 관리 - 서비스 상세조회 ( Z-PD-U-0042M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 서비스 등록/변경 프로그램
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
      <wwpdc-service-dtl-m-contents
        ref="cmpRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
        :codes="codes"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import WwpdcServiceDtlMContents from './WwpdcServiceDtlMContents.vue';

const props = defineProps({
  pdCd: { type: String, default: null },
});

const route = useRoute();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const cmpRef = ref();
const currentPdCd = ref();
const pdBas = ref({});
const currentInitData = ref({});
const codes = await codeUtil.getMultiCodes('PD_TEMP_SAVE_CD');

async function fetchData() {
  if (currentPdCd.value) {
    const res = await dataService.get(`/sms/wells/product/services/${currentPdCd.value}`);
    pdBas.value = res.data[pdConst.TBL_PD_BAS];
    currentInitData.value = cloneDeep(res.data);
  }
}

async function initProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  await fetchData();
}

await initProps();

watch(() => route.params.pdCd, async (pdCd) => {
  if (!route.path.includes('zwpdc-service-list')) return;
  console.log(`WwpdcServiceDtlM - watch - currentPdCd.value: ${currentPdCd.value} route.params.pdCd: ${pdCd}`);
  if (pdCd) {
    cmpRef.value?.resetData();
    currentPdCd.value = pdCd;
    // selectedTab.value = 'attribute';
    await fetchData();
  }
}, { immediate: true });

watch(() => route.params.reloadYn, async (reloadYn) => {
  if (!route.path.includes('zwpdc-service-list')) return;
  console.log(`WwpdcServiceDtlM - watch - route.params.reloadYn: ${reloadYn}`);
  if (reloadYn === 'Y') {
    currentPdCd.value = null;
    cmpRef.value?.resetData();
    currentPdCd.value = props.pdCd;
    // selectedTab.value = 'attribute';
    await fetchData();
  }
});

</script>
<style scoped></style>
