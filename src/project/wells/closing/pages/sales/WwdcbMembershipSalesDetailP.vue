<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbMembershipSalesDetailP - 멤버십매출 상세내역 - W-CL-U-0038P06
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.03.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 멤버십매출 상세내역을 보여준다.
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
          <p>{{ membershipDetail.cstKnm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <p>{{ membershipDetail.cntrDtlNo }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_YM')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.slClYm, 'YYYY-MM').substring(0,7) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <h3>{{ $t('MSG_TXT_CNTR_PDCT') }}</h3>
    <p class="kw-font--14 kw-fc--black3 text-right mb12">
      <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
    </p>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRDT_CODE')">
          <p>{{ membershipDetail.pdNm }} / {{ membershipDetail.pdCd }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNTR_DATE')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.cntrDt) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNFM_DT')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.slRcogDt) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_MM_SSPCS')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.rentalRgstCost)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.dscAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CANC_DT')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.canDt) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <h3>{{ $t('MSG_TXT_PRM_ARTC') }}</h3>
    <p class="kw-font--14 kw-fc--black3 text-right mb12">
      <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
    </p>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRM_TN')">
          <p>{{ membershipDetail.prmTn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_MCNT')">
          <p>{{ membershipDetail.prmMcn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_STRT')">
          <p>{{ membershipDetail.lcpsYrmn }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRM_END')">
          <p>{{ membershipDetail.lcpeYrmn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_DSCR_DSC_AMT')">
          <p>{{ membershipDetail.prmDscr }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_1PRM_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.lcpmo1)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_2PRM_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.lcpmo2)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_TAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.totPrmAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <h3>{{ $t('MSG_TXT_SL_ARTC') }}</h3>
    <p class="kw-font--14 kw-fc--black3 text-right mb12">
      <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
    </p>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_J_NMN')">
          <p>{{ membershipDetail.rentalTn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_J_DC')">
          <p>{{ membershipDetail.rentalDc }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_J_DT')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.lcentDt) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_NOM_SL_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.nomSlAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_NOM_DSC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.nomDscAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_WDWAL_DT')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.lcoutDt) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SPMT_SL_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.spmtSlAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SPMT_DSC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.spmtDscAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FSH_DT')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.lcwanDt) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.thmSlSumAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_VAT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.slSumVat)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_CTR_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.slCtrAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DSC_AGG_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.dscAggAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CTR_AGG_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.ctrAggAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_AGG_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.slAggAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <h3>{{ $t('MSG_TXT_DP_ARTC') }}</h3>
    <p class="kw-font--14 kw-fc--black3 text-right mb12">
      <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
    </p>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRM_BLAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.prmBlamBtdAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.prmDpAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_RFND_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.prmRfndAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRM_RPLC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.prmRplcAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_SL_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.prmSlAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_EXP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.prmExpAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRPD_BLAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.btdAtam)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.thmAtamDpAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RFND_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.thmAtamRfndAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RPLC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.ovrCtrDpAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_SL_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.prpdSlAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_TAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.eotAtam)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.slBndAlrpyAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DP_AGG_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.slDpAggAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_UC_TAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.thmUcBlam)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <h3>{{ $t('MSG_TXT_DDTN_ARTC') }}</h3>
    <p class="kw-font--14 kw-fc--black3 text-right mb12">
      <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
    </p>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DSC_DDTN_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.lcam51)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSC_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.lcam53)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSC_UC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.lcam55)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_FILT_DDTN_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.lcam61)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FILT_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.lcam63)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FILT_UC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.lcam65)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <h3>{{ $t('MSG_TXT_DLQ_ADD') }}</h3>
    <p class="kw-font--14 kw-fc--black3 text-right mb12">
      <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
    </p>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_BTD_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.btdDlqAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_OC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.thmOcDlqAddAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_DDTN_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.thmCtrDlqAddAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.thmDlqAddDpSumAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_RFND_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.thmDlqAddRfndSumAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_EOT_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.eotDlqAddAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <h3>{{ $t('MSG_TXT_DLQ_ARTC') }}</h3>
    <p class="kw-font--14 kw-fc--black3 text-right mb12">
      <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
    </p>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_VST_PRD_VST_DT')">
          <p>{{ membershipDetail.lcvisDt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_MCNT_AGG')">
          <p>{{ membershipDetail.dlqMcn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.eotDlqAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DFA_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.lcam67)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DFA_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.lcam68)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_INCM_DT')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.actcsDt) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CLCTAM_ICHR')">
          <p>{{ membershipDetail.prtnrKnm }}</p>
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

const membershipDetail = ref({});

let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  const res = await dataService.get('/sms/wells/closing/membership-sales-detail', { params: cachedParams });
  console.log(res.data);
  membershipDetail.value = res.data;
}

onMounted(async () => {
  await fetchData();
});

</script>
