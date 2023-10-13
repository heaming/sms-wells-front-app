<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcMaterialDtlM - 교재/자재 상세조회 ( W-PD-U-0031M07 )
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 교재/자재 상세조회 프로그램 (Outer Frame W-PD-U-0031M07 - M10)
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
      <wwpdc-material-dtl-m-contents
        ref="cmpRef"
        v-model:pd-cd="currentPdCd"
        v-model:init-data="prevStepData"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { pageMove } from '~sms-common/product/utils/pdUtil';
import WwpdcMaterialDtlMContents from './WwpdcMaterialDtlMContents.vue';

const props = defineProps({
  pdCd: { type: String, default: null }, // 상품코드
  tempSaveYn: { type: String, default: 'Y' }, // 임시저장 여부
  reloadYn: { type: String, default: null }, // 새로고침 여부
});

const dataService = useDataService();
const router = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/product/materials';

const cmpRef = ref();
const pdBas = ref({});
const prevStepData = ref({});
const currentPdCd = ref();

// 목록으로 이동
async function goList() {
  await pageMove(pdConst.MATERIAL_LIST_PAGE, true, router, { isSearch: true }, { searchYn: 'Y' });
}

// 상품 데이터 불러오기
async function fetchProduct() {
  if (currentPdCd.value) {
    const res = await dataService.get(`${baseUrl}/${currentPdCd.value}`).catch(() => {
      goList();
    });
    if (!res || !res.data) return;
    pdBas.value = res.data[pdConst.TBL_PD_BAS];
    prevStepData.value = cloneDeep(res.data);
  }
}

// Props 데이터 설정
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
