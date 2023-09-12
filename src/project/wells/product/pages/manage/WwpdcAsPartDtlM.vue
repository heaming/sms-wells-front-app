<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcAsPartDtlM - AS부품 상세조회 (W-PD-U-0041M02)
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 AS부품 상세조회 프로그램
****************************************************************************************************
--->
<template>
  <kw-page ignore-on-modified>
    <div class="normal-area normal-area--button-set-bottom">
      <div class="kw-stepper-headingtext">
        <h2 class="h2-small">
          {{ pdBas.pdNm }}({{ pdBas.pdCd }})
          <p>
            <!-- 등록일 -->
            <span>{{ $t('MSG_TXT_RGST_DT') }} {{ stringUtil.getDateFormat(pdBas.fstRgstDtm) }}
              /  {{ pdBas.fstRgstUsrNm }}</span>
            <!-- 최종수정일  -->
            <span>
              {{ $t('MSG_TXT_L_UPDATED') }} {{ stringUtil.getDateFormat(pdBas.fnlMdfcDtm) }}
              / {{ pdBas.fnlMdfcUsrNm }}</span>
          </p>
        </h2>
      </div>
      <wwpdc-as-part-dtl-m-contents
        ref="cmpRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="currentInitData"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil } from 'kw-lib'; // codeUtil
import { cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { pageMove } from '~sms-common/product/utils/pdUtil';
import WwpdcAsPartDtlMContents from './WwpdcAsPartDtlMContents.vue';

const props = defineProps({
  pdCd: { type: String, default: null },
  reloadYn: { type: String, default: null },
});

const dataService = useDataService();
const router = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/product/as-parts';

const cmpRef = ref();
const currentPdCd = ref();
const pdBas = ref({});
const currentInitData = ref({});

async function goList() {
  await pageMove(pdConst.ASPART_LIST_PAGE, true, router, { isSearch: true }, { searchYn: 'Y' });
}

async function fetchProduct() {
  if (currentPdCd.value) {
    const res = await dataService.get(`${baseUrl}/${currentPdCd.value}`).catch(() => {
      goList();
    });
    if (!res || !res.data) return;
    pdBas.value = res.data[pdConst.TBL_PD_BAS];
    currentInitData.value = cloneDeep(res.data);
  }
}

async function initProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  await fetchProduct();
}

onMounted(async () => {
  await initProps();
});

watch(() => props, async ({ pdCd, reloadYn }) => {
  console.log(` WwpdcServiceDtlM - watch - pdCd: ${pdCd} reloadYn: ${reloadYn}`);
  if (pdCd && currentPdCd.value !== pdCd) {
    currentPdCd.value = pdCd;
    await cmpRef.value?.resetData();
    await fetchProduct();
  } else if (reloadYn && reloadYn === 'Y') {
    // Reload
    await cmpRef.value?.resetData();
    await fetchProduct();
  }
}, { deep: true });

</script>
<style scoped></style>
