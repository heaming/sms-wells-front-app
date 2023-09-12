<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY
2. 프로그램 ID : WwpdcAsPartSummaryDtlP - AS부품 관리 -요약조회 (W-PD-U-0042P01)
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
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
        <kw-form-item :label="$t('MSG_TXT_PRDT_CLSF', null, '제품분류')">
          <p>{{ pdBas.pdClsfNm }} </p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_MATI_CD', null, '자재코드')">
          <p>{{ pdBas.sapMatCd }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PD_MODEL_NO', null, '모델NO')">
          <p>{{ pdBas.modelNo }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ITM_CD', null, '품목코드')">
          <p>{{ asMatCd }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('TXT_MSG_AS_MAT_CD', null, 'AS자재번호')">
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
import { useDataService, stringUtil, useModal } from 'kw-lib';
import pdConst from '~sms-common/product/constants/pdConst';

const dataService = useDataService();
const { cancel } = useModal();

const props = defineProps({
  pdCd: { type: String, required: true, default: '' },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/product/as-parts';

const pdBas = ref({}); // 상품기본
const PdEcomPrpDtl = ref([]); // 상품각사속성상세

const PART = ref({}); // 관리속성 - 학습관리
const asMatCd = ref(''); // PART- 품목코드
const asItmCd = ref(''); // PART- AS자재번호

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/${props.pdCd}`).catch(() => {
    cancel();
  });
  if (!res || !res.data) return;
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
