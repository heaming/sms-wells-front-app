<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY
2. 프로그램 ID : WwpdcMaterialsSummaryDtlP - 교재/자재 관리 -요약조회 (W-PD-U-0032P01)
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 교재/자재 관리- 요약조회(팝업) 프로그램
****************************************************************************************************
--->

<template>
  <kw-popup class="lg">
    <kw-chip
      :label="pdBas.sellYn === 'Y' ? $t('MSG_TXT_PD_SELLING') : $t('MSG_TXT_PD_NOT_SELLING') "
      color="primary"
      outline
    />
    <h2 class="h2-small mb30">
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
      dense
      :cols="2"
    >
      <kw-form-row>
        <!-- 제품분류 ex.) 대분류 > 중분류-->
        <kw-form-item :label="$t('MSG_TXT_PRDT_CLSF')">
          <p>{{ pdBas.pdHclsfNm }} > {{ pdBas.pdMclsfNm }}</p>
        </kw-form-item>
        <!-- 자재코드 -->
        <kw-form-item :label="$t('MSG_TXT_MATI_CODE')">
          <p>{{ pdBas.sapMatCd }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <!-- 모델NO -->
        <kw-form-item :label="$t('MSG_TXT_PD_MODEL_NO')">
          <p>{{ pdBas.modelNo }}</p>
        </kw-form-item>
        <!-- 모델색상 -->
        <kw-form-item :label="$t('MSG_TXT_MODEL_COLOR')">
          <p>TODO : 대상 DB값 확인필요</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_CONFIRM')"
        @click="onClickConfirm"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil, useModal } from 'kw-lib';
import pdConst from '~sms-common/product/constants/pdConst';

const { ok } = useModal();
const dataService = useDataService();

const props = defineProps({
  pdCd: { type: String, required: true, default: '' },
});

const baseUrl = '/sms/common/product/materials';
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const pdBas = ref({}); // 상품기본
const PdEcomPrpDtl = ref([]); // 상품각사속성상세

async function onClickConfirm() {
  ok();
}

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/${props.pdCd}`);
  pdBas.value = res.data[pdConst.TBL_PD_BAS];
  PdEcomPrpDtl.value = res.data[pdConst.TBL_PD_ECOM_PRP_DTL];
}

onMounted(async () => {
  await fetchData(props.pdCd);
});
</script>
<style>
</style>
