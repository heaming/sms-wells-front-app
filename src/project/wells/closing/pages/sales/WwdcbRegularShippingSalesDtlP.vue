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
          <p>{{ regularShippingDetail.slClYm }}</p>
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
          <p>{{ regularShippingDetail.lcpkagT1 }} / {{ regularShippingDetail.lcPknm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_MCHN_INF')">
          <p>{{ regularShippingDetail.lcJcnam }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SALE_PRICE')">
          <p>{{ regularShippingDetail.sellAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SPMT_AMT')">
          <p>{{ regularShippingDetail.rentalAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSC_AMT')">
          <p>{{ regularShippingDetail.dscAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_MM_BIL_AMT')">
          <p>{{ regularShippingDetail.lcTam1 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_RCPDT')">
          <p>{{ regularShippingDetail.cntrPdStrtdt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SPP_DT')">
          <p>{{ regularShippingDetail.lcBatt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_DT')">
          <p>{{ regularShippingDetail.slDt }}</p>
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
          <p>{{ regularShippingDetail.slDtYn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SPP_YN')">
          <p>{{ regularShippingDetail.sppYn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRGS_SPP_NMN')">
          <p>{{ regularShippingDetail.lcrcnt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_USE_DC_D')">
          <p>{{ regularShippingDetail.slDc }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CANC_DT')">
          <p>{{ regularShippingDetail.canDt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_NOM_SL_AMT')">
          <p>{{ regularShippingDetail.nomSlAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_NOM_DSC_AMT')">
          <p>{{ regularShippingDetail.nomDscAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FSH_DT')">
          <p>{{ regularShippingDetail.fshDt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SPMT_SL_AMT')">
          <p>{{ regularShippingDetail.spmtSlAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SPMT_DSC_AMT')">
          <p>{{ regularShippingDetail.spmtDscAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_CTR_AMT')">
          <p>{{ regularShippingDetail.slCtrAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_AMT')">
          <p>{{ regularShippingDetail.thmSlSumAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_VAT')">
          <p>{{ regularShippingDetail.slSumVat }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_AGG_AMT')">
          <p>{{ regularShippingDetail.slAggAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSC_AGG_AMT')">
          <p>{{ regularShippingDetail.lcam18 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CTR_AGG_AMT')">
          <p>{{ regularShippingDetail.lcam19 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_BLAM')">
          <p>{{ regularShippingDetail.spAmt }}</p>
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
          <p>{{ regularShippingDetail.btdAtam }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_DP_AMT')">
          <p>{{ regularShippingDetail.thmAtamDpAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RFND_AMT')">
          <p>{{ regularShippingDetail.thmAtamRfndAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_RPLC_AMT')">
          <p>{{ regularShippingDetail.prpdSlAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_DP_AMT')">
          <p>{{ regularShippingDetail.slBndAlrpyAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DP_AGG_AMT')">
          <p>{{ regularShippingDetail.slDpAggAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RPLC_AMT')">
          <p>{{ regularShippingDetail.lcam34 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_BLAM')">
          <p>{{ regularShippingDetail.lcam35 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_UC_TAM')">
          <p>{{ regularShippingDetail.thmUcBlam }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DLQ_AMT')">
          <p>{{ regularShippingDetail.thmOcDlqAmt }}</p>
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
          <p>{{ regularShippingDetail.btdUcAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_THM_EXP_AMT')">
          <p>{{ regularShippingDetail.lcmam2 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_THM_SPMT_AMT')">
          <p>{{ regularShippingDetail.lcmam6 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_THM_DP_AMT')">
          <p>{{ regularShippingDetail.lcmam3 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_THM_CTR_AMT')">
          <p>{{ regularShippingDetail.lcmam4 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_BIL_BLAM')">
          <p>{{ regularShippingDetail.eotUcAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_NMN_AMT')">
          <p>{{ regularShippingDetail.lcmam8 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_MMS2_AFT_AMT')">
          <p>{{ regularShippingDetail.lcmam9 }}</p>
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
          <p>{{ regularShippingDetail.dlqMcn }} / {{ regularShippingDetail.dlqAcuMcn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_STP')">
          <p>{{ regularShippingDetail.slStpYn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ACTCS_DT')">
          <p>{{ regularShippingDetail.actcsDt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CLCTAM_ICHR')">
          <p>{{ regularShippingDetail.clctamPrtnrNo }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const props = defineProps({
  slDt: {
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
  slDt: props.slDt,
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
