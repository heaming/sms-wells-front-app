<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcCompositionDtlM - (판매) 상품목록 - 복합상품 상세조회
                ( Z-PD-U-0021M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.04.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 복합상품 상세조회 프로그램
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
              /  {{ pdBas.fstRgstUsrNm }}</span><span>
              <!-- 최종수정일  -->
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
      />
    </div>
  </kw-page>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, stringUtil } from 'kw-lib';
import pdConst from '~sms-common/product/constants/pdConst';
import WwpdcCompositionDtlMContents from './WwpdcCompositionDtlMContents.vue';

const props = defineProps({
  pdCd: { type: String, default: null }, // 상품코드
  reloadYn: { type: String, default: null }, // 새로고침 여부
});

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const cmpRef = ref();
const currentPdCd = ref();
const pdBas = ref({});
const prevStepData = ref({});
const router = useRouter();

const codes = await codeUtil.getMultiCodes(
  'PD_TP_CD',
  'SELL_CHNL_DTL_CD',
  'SELL_TP_CD',
  'COD_YN',
  'COD_PAGE_SIZE_OPTIONS',
  'PD_REL_TP_CD',
  'PD_TEMP_SAVE_CD',
);

// 목록으로 이동
async function goList() {
  await router.push({ path: '/product/zwpdc-sale-product-list', state: { stateParam: { searchYn: 'Y', pdTpCd: pdConst.PD_TP_CD_COMPOSITION } } });
}

// 상품 데이터 불러오기
async function fetchProduct() {
  if (currentPdCd.value) {
    const res = await dataService.get(`/sms/wells/product/compositions/${currentPdCd.value}`).catch(() => {
      goList();
    });
    if (!res || !res.data) return;
    pdBas.value = res.data[pdConst.TBL_PD_BAS];
    prevStepData.value = res.data;
  }
}

// Props 데이터 설정
async function initProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  await fetchProduct();
}

await initProps();

watch(() => props, async ({ pdCd, reloadYn }) => {
  console.log(` WwpdcCompositionDtlM - watch - pdCd: ${pdCd} reloadYn: ${reloadYn}`);
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
