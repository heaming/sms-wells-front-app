<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY
2. 프로그램 ID : WwpdcAsPartSummaryDtlP - AS부품 관리 -요약조회 (W-PD-U-0042P01)
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 AS부품 관리- 요약조회(팝업) 프로그램
****************************************************************************************************
--->
<template>
  <kw-popup size="lg">
    <h2 class="h2-small">
      {{ pdBas.pdNm }}({{ pdBas.pdCd }})
      <p>
        <span>{{ $t('MSG_TXT_RGST_DT') }} {{ stringUtil.getDateFormat(pdBas.fstRgstDtm) }}
          /  {{ pdBas.fstRgstUsrNm }}</span>
        <span>
          {{ $t('MSG_TXT_L_UPDATED') }} {{ stringUtil.getDateFormat(pdBas.fnlMdfcDtm) }}
          / {{ pdBas.fnlMdfcUsrNm }}
        </span>
      </p>
    </h2>

    <kw-form
      :cols="2"
      class="mt20"
      dense
    >
      <kw-form-row>
        <!-- 제품분류 ex. 대분류 > 중분류-->
        <kw-form-item :label="$t('MSG_TXT_PRDT_CLSF')">
          <p>{{ pdBas.pdClsfNm }} </p>
        </kw-form-item>
        <!-- 자재코드 -->
        <kw-form-item :label="$t('MSG_TXT_MATI_CD')">
          <p>{{ pdBas.sapMatCd }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <!-- 모델NO -->
        <kw-form-item :label="$t('MSG_TXT_PD_MODEL_NO')">
          <p>{{ pdBas.modelNo }}</p>
        </kw-form-item>
        <!-- 품목코드 -->
        <kw-form-item :label="$t('MSG_TXT_ITM_CD')">
          <p>{{ asMatCd }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <!-- AS자재번호 -->
        <kw-form-item :label="$t('TXT_MSG_AS_MAT_CD')">
          <p>{{ asItmCd }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil } from 'kw-lib';
import pdConst from '~sms-common/product/constants/pdConst';

const dataService = useDataService();
const props = defineProps({
  pdCd: { type: String, required: true, default: '' },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/product/as-parts';

const pdBas = ref({}); // 상품기본
const PdEcomPrpDtl = ref([]); // 상품각사속성상세
// const PDCT = ref({}); // 관리속성 - 학습관리
// const pdColoNm = ref(''); // 모델색상

const PART = ref({}); // 관리속성 - 학습관리
const asMatCd = ref(''); // PART- 품목코드
const asItmCd = ref(''); // PART- AS자재번호

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/${props.pdCd}`);
  pdBas.value = res.data[pdConst.TBL_PD_BAS];
  PdEcomPrpDtl.value = res.data[pdConst.TBL_PD_ECOM_PRP_DTL];

  PART.value = PdEcomPrpDtl.value.find((element) => element.pdExtsPrpGrpCd === 'PART');
  asMatCd.value = PART.value?.pdPrpVal31 ?? '';
  asItmCd.value = PART.value?.pdPrpVal01 ?? '';
}

onMounted(async () => {
  await fetchData(props.pdCd);
});
</script>

<style scoped>
</style>
