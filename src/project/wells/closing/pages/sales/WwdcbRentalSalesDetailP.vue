<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbRentalSalesDetailP - 렌탈매출 상세내역 - W-CL-U-0038P01
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.03.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈매출 상세내역을 보여준다.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <h3 class="mt0">
      {{ $t('MSG_TXT_CST_BAS_INF') }}
    </h3>
    <kw-form
      :cols="3"
      dense
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CST_NM')">
          <p>{{ rentalSalesDetail.cstKnm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <p>{{ rentalSalesDetail.cntrDtlNo }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_YM')">
          <p>{{ rentalSalesDetail.slClYm }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <kw-action-top>
      <template #left>
        <h3>{{ $t('MSG_TXT_CNTR_PDCT') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form
      :cols="3"
      dense
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRDT')">
          <p>{{ rentalSalesDetail.pdNm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_RCP_D')">
          <p>{{ rentalSalesDetail.col1 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DT_OF_SALE')">
          <p>{{ rentalSalesDetail.slDt }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRD_MCNT_USWY')">
          <p>{{ rentalSalesDetail.svPrd }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_REG_FEE')">
          <p>{{ rentalSalesDetail.rentalRgstCost }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_LEASE_TAM')">
          <p>{{ rentalSalesDetail.istmAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_MM_RTLFE1_MCNT_WON')">
          <p>{{ rentalSalesDetail.rentalPtrm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_MM_RTLFE2')">
          <p>{{ rentalSalesDetail.rentalPtrm2 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_RSTL_DSC_AMT')">
          <p>{{ rentalSalesDetail.rstlYn }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />

    <kw-action-top>
      <template #left>
        <h3 class="mb0">
          {{ $t('MSG_TXT_PRM_ARTC') }}
        </h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form
      :cols="3"
      dense
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ORDERSELECT_TITLE')">
          <p>{{ rentalSalesDetail.col2 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_MCNT')">
          <p>{{ rentalSalesDetail.prmMcn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSCR_DSC_AMT')">
          <p>{{ rentalSalesDetail.prmDscr }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRM_AMT')">
          <p>{{ rentalSalesDetail.prmDpAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_TAM')">
          <p>{{ rentalSalesDetail.prmSlAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_EXN_CTT_ICHR')">
          <p>{{ rentalSalesDetail.col3 }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />

    <kw-action-top>
      <template #left>
        <h3>{{ $t('MSG_TXT_SL_ARTC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form
      :cols="3"
      dense
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_RENTAL_NMN')">
          <p>{{ rentalSalesDetail.rentalTn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_USE_DC_MCNT')">
          <p>{{ rentalSalesDetail.rentalDc }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CANC_DT')">
          <p>{{ rentalSalesDetail.col4 }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_NOM_SL_AMT')">
          <p>{{ rentalSalesDetail.nomSlAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_NOM_DSC_AMT')">
          <p>{{ rentalSalesDetail.nomDscAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FSH_DT')">
          <p>{{ rentalSalesDetail.col5 }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SPMT_SL_AMT')">
          <p>{{ rentalSalesDetail.spmtSlAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SPMT_DSC_AMT')">
          <p>{{ rentalSalesDetail.spmtDscAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_CTR_AMT')">
          <p>{{ rentalSalesDetail.slCtrAmt }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_AMT')">
          <p>{{ rentalSalesDetail.thmSlSumAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_VAT')">
          <p>{{ rentalSalesDetail.slSumVat }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_AGG_AMT')">
          <p>{{ rentalSalesDetail.slAggAmt }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DSC_AGG')">
          <p>{{ rentalSalesDetail.col6 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CTR_AGG')">
          <p>{{ rentalSalesDetail.col7 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_BLAM')">
          <p>{{ rentalSalesDetail.col8 }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />

    <kw-action-top>
      <template #left>
        <h3>{{ $t('MSG_TXT_PRM_PRPD') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form
      :cols="3"
      dense
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BTD_AMT')">
          <p>{{ rentalSalesDetail.btdAtam }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_DP_AMT')">
          <p>{{ rentalSalesDetail.thmAtamDpAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RFND_AMT')">
          <p>{{ rentalSalesDetail.thmAtamRfndAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_RPLC_AMT')">
          <p>{{ rentalSalesDetail.col9 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_DP_AMT')">
          <p>{{ rentalSalesDetail.slBndAlrpyAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DP_AGG_AMT')">
          <p>{{ rentalSalesDetail.slDpAggAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RPLC_AMT')">
          <p>{{ rentalSalesDetail.col10 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_TAM')">
          <p>{{ rentalSalesDetail.eotTotalAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_BLAM')">
          <p>{{ rentalSalesDetail.eotAtam }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PR_BLAM')">
          <p>{{ rentalSalesDetail.mlgEotPrpdAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_BLAM')">
          <p>{{ rentalSalesDetail.col11 }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />

    <kw-action-top>
      <template #left>
        <h3>{{ $t('MSG_TXT_CCAM') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form
      :cols="3"
      dense
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CCAM_BTD_AMT')">
          <p>{{ rentalSalesDetail.col12 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CCAM_OC_AMT')">
          <p>{{ rentalSalesDetail.col13 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PD_LENT_LOST_LOG')">
          <p>{{ rentalSalesDetail.col14 }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CCAM_DP_AMT')">
          <p>{{ rentalSalesDetail.col15 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CCAM_DDTN_AMT')">
          <p>{{ rentalSalesDetail.col16 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CCAM_EOT_AMT')">
          <p>{{ rentalSalesDetail.col17 }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />

    <kw-action-top>
      <template #left>
        <h3>{{ $t('MSG_TXT_DLQ_ADD') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form
      :cols="3"
      dense
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_BTD_AMT')">
          <p>{{ rentalSalesDetail.btdDlqAddAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_OC_AMT')">
          <p>{{ rentalSalesDetail.dlqAdamtOcAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_DDTN_AMT')">
          <p>{{ rentalSalesDetail.thmCtrDlqAddAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_DP_AMT')">
          <p>{{ rentalSalesDetail.thmDlqDpSumAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_RFND_AMT')">
          <p>{{ rentalSalesDetail.thmDlqRfndSumAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_EOT_AMT')">
          <p>{{ rentalSalesDetail.eotDlqAddAmt }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />

    <kw-action-top>
      <template #left>
        <h3>{{ $t('MSG_TXT_DLQ_ARTC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form
      :cols="3"
      dense
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_KEEP_AW_AGG_AMT')">
          <p>{{ rentalSalesDetail.col18 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_MCNT_AGG')">
          <p>{{ rentalSalesDetail.dlqMcn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_AMT')">
          <p>{{ rentalSalesDetail.thmOcDlqAmt }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DFA_AMT')">
          <p>{{ rentalSalesDetail.dfaAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DFA_DP_AMT')">
          <p>{{ rentalSalesDetail.dfaDpAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_STP')">
          <p>{{ rentalSalesDetail.col19 }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ACTCS_DT')">
          <p>{{ rentalSalesDetail.actcsDt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CLCTAM_ICHR')">
          <p>{{ rentalSalesDetail.clctamPrtnrNo }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FW_YM')">
          <p>{{ rentalSalesDetail.col20 }}</p>
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

const rentalSalesDetail = ref({});

let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  const res = await dataService.get('/sms/wells/closing/rental-sales-detail', { params: cachedParams });
  console.log(res.data);
  rentalSalesDetail.value = res.data;
}

onMounted(async () => {
  await fetchData();
});
</script>
