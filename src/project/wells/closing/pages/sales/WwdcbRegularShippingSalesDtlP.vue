<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbRegularShippingSalesDtlP - 매출실적현황-정기배송매출 상세내역 - W-CL-U-0038P05
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.04.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈매출 상세내역을 보여준다.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="3xl"
  >
    <h3>{{ $t('MSG_TXT_CST_BAS_INF') }}</h3>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CST_NM')">
          <p>{{ regularShippingDetail.cstKnm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <p>{{ regularShippingDetail.cntrDtlNo }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_YM')">
          <p>{{ stringUtil.getDateFormat(regularShippingDetail.slClYm, 'YYYY-MM').substring(0,7) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-action-top class="mb20 mt30">
      <template #left>
        <h3>{{ $t('MSG_TXT_CNTR_PDCT') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>

    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PKG_INF')">
          <p>{{ regularShippingDetail.pdNm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_MCHN_INF')">
          <p>{{ regularShippingDetail.lcJcnam }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SALE_PRICE')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.sellAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SPMT_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.rentalAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.dscAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_MM_BIL_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.fnlBilAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_RCPDT')">
          <p>{{ stringUtil.getDateFormat(regularShippingDetail.cntrDt) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SPP_DT')">
          <p>{{ stringUtil.getDateFormat(regularShippingDetail.sppDtm) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_DT')">
          <p>{{ stringUtil.getDateFormat(regularShippingDetail.slRcogDt) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-action-top class="mt30 mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_SL_ARTC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_OC_MM')">
          <p>{{ regularShippingDetail.lcdflg }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SPP_YN')">
          <p>{{ regularShippingDetail.sppYn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRGS_SPP_NMN')">
          <p>{{ regularShippingDetail.sppTn }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_USE_DC_D')">
          <p>{{ regularShippingDetail.rentalDc }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CANC_DT')">
          <p>{{ stringUtil.getDateFormat(regularShippingDetail.canDt) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_NOM_SL_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.nomSlAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_NOM_DSC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.nomDscAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FSH_DT')">
          <p>{{ stringUtil.getDateFormat(regularShippingDetail.adsbDt) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SPMT_SL_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.spmtSlAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SPMT_DSC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.spmtDscAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_CTR_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.slCtrAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.thmSlSumAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_VAT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.slSumVat)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_AGG_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.slAggAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSC_AGG_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.dscAggAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CTR_AGG_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.ctrAggAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_BLAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.col1)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-action-top class="mt30 mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_PRPD_AMT') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BTD_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.btdAtam)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.thmAtamDpAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RFND_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.thmAtamRfndAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_RPLC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.prpdSlAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.slBndAlrpyAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DP_AGG_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.slDpAggAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RPLC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.ovrCtrDpAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_BLAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.eotAtam)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_UC_TAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.thmUcBlam)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DLQ_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.thmOcDlqAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-action-top class="mt30 mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_BIL_UC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BTD_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.mmIstmPcamAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_THM_EXP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.mmIstmIntAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_THM_SPMT_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.nomBilAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_THM_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.bilCtrAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_THM_CTR_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.bilDscAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_BIL_BLAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.lstFnlBilAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_NMN_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.istmPcamBlam)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_MMS2_AFT_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(regularShippingDetail.istmIntBlam)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-action-top class="mt30 mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_DLQ_ARTC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DLQ_MCNT_AGG')">
          <p>{{ regularShippingDetail.dlqMcn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_STP')">
          <p>{{ regularShippingDetail.slStpYn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ACTCS_DT')">
          <p>{{ stringUtil.getDateFormat(regularShippingDetail.actcsDt) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CLCTAM_ICHR')">
          <p>{{ regularShippingDetail.prtnrKnm }}</p>
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
import { cloneDeep, toInteger } from 'lodash-es';

const dataService = useDataService();
const props = defineProps({
  slClYm: {
    type: String,
    required: false,
    default: '',
  },
  cntrDtlNo: {
    type: String,
    required: false,
    default: '',
  },
});

const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = ref({
  slClYm: props.slClYm,
  cntrDtlNo: props.cntrDtlNo,
});

const regularShippingDetail = ref({});

let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  const res = await dataService.get('/sms/wells/closing/regular-shipping-detail', { params: cachedParams });
  console.log(res.data);
  regularShippingDetail.value = res.data;
}

onMounted(async () => {
  await fetchData();
});
</script>
