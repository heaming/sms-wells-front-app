<!-- eslint-disable max-len -->
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
          <p>{{ stringUtil.getDateFormat(rentalSalesDetail.slClYm, 'YYYY-MM').substring(0,7) }}</p>
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
          <p>{{ rentalSalesDetail.pdNm }} ( {{ rentalSalesDetail.pdCd }} )</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_RCP_D')">
          <p>{{ stringUtil.getDateFormat(rentalSalesDetail.cntrDt) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DT_OF_SALE')">
          <p>{{ stringUtil.getDateFormat(rentalSalesDetail.lcsleDt) }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRD_MCNT_USWY')">
          <p>{{ rentalSalesDetail.svPrd }}/{{ rentalSalesDetail.svTpCdNm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_REG_FEE')">
          <p>{{ `${stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.rentalRgstCost))}(DC ${stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.dscAmt))})` }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('렌탈총액')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.cntrTam)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_MM_RTLFE1_MCNT_WON')">
          <p>{{ `${rentalSalesDetail.rentalPtrm}/${stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.rentalAmt))}(DC ${stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.rentalDscAmt))})` }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_MM_RTLFE2')">
          <p>{{ `${rentalSalesDetail.rentalPtrm2}/${stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.rentalAmt2))}(DC ${stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.rentalDscAmt2))})` }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_RSTL_DSC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.stplDscAmt)) }}</p>
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
          <p>{{ rentalSalesDetail.prmTn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_MCNT')">
          <p>{{ rentalSalesDetail.prmMcn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSCR_DSC_AMT')">
          <p>
            {{ rentalSalesDetail.prmDscr }}/{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.prmDscAmt)) }}
          </p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRM_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.prmAmt1)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_TAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.totPrmAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_EXN_CTT_ICHR')">
          <p>{{ rentalSalesDetail.cttPsicNm }}</p>
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
          <p>{{ rentalSalesDetail.canDt }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_NOM_SL_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.nomSlAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_NOM_DSC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.nomDscAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FSH_DT')">
          <p>{{ rentalSalesDetail.fshDt }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SPMT_SL_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.spmtSlAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SPMT_DSC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.spmtDscAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_CTR_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.slCtrAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.thmSlSumAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_VAT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.slSumVat)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_AGG_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.slAggAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DSC_AGG')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.sumDscAggAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CTR_AGG')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.sumCtrAggAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_BLAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.ucAmt)) }}</p>
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
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.btdAtam)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.atamDpAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RFND_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.atamRfndAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_RPLC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.atamSlAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.slBndAlrpyAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DP_AGG_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.slDpAggAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RPLC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.ovrCtrDpAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_TAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.atamTotAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_BLAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.prmBlamEotAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PR_BLAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.mlgEotPrpdAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_BLAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.eotAtam)) }}</p>
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
          <p>{{ rentalSalesDetail.btdBorAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CCAM_OC_AMT')">
          <p>{{ rentalSalesDetail.ocBorAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PD_LENT_LOST_LOG')">
          <p>{{ rentalSalesDetail.lsRntf }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CCAM_DP_AMT')">
          <p>{{ rentalSalesDetail.borDpAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CCAM_DDTN_AMT')">
          <p>{{ rentalSalesDetail.borAdjAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CCAM_EOT_AMT')">
          <p>{{ rentalSalesDetail.eotBorAmt }}</p>
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
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.btdDlqAddAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_OC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.thmOcDlqAddAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_DDTN_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.thmCtrDlqAddAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.thmDlqAddDpSumAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_RFND_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.thmDlqAddRfndSumAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_EOT_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.eotDlqAddAmt)) }}</p>
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
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.keepAwAmt)) }} / {{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.keepAwTotAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_MCNT_AGG')">
          <p>{{ rentalSalesDetail.dlqMcn }} / {{ rentalSalesDetail.dlqAcuMcn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.eotDlqAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DFA_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.dfaAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DFA_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(rentalSalesDetail.dfaDpAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_STP')">
          <p>{{ rentalSalesDetail.slStpAmt }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ACTCS_DT')">
          <p>{{ stringUtil.getDateFormat(rentalSalesDetail.actcsDt) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CLCTAM_ICHR')">
          <p>{{ rentalSalesDetail.prtnrKnm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FW_YM')">
          <p>{{ stringUtil.getDateFormat(rentalSalesDetail.lcsndDt) }}</p>
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
