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
          <p>{{ membershipDetail.slClYm }}</p>
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
          <p>{{ membershipDetail.pdNm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNTR_DATE')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.cntrDt) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNFM_DT')">
          <p>{{ membershipDetail.cntrCnfmDtm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_MM_SSPCS')">
          <p>{{ membershipDetail.sellAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSC_AMT')">
          <p>{{ membershipDetail.dscAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CANC_DT')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.col9) }}</p>
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
          <p>{{ membershipDetail.col10 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_MCNT')">
          <p>{{ membershipDetail.prmMcn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_STRT')">
          <p>{{ membershipDetail.prmStrt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRM_END')">
          <p>{{ membershipDetail.prmEnd }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_DSCR_DSC_AMT')">
          <p>{{ membershipDetail.prmDscr }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_1PRM_AMT')">
          <p>{{ membershipDetail.prmDpAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_2PRM_AMT')">
          <p>{{ membershipDetail.col16 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_TAM')">
          <p>{{ membershipDetail.col17 }}</p>
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
          <p>{{ stringUtil.getDateFormat(membershipDetail.col20) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_NOM_SL_AMT')">
          <p>{{ membershipDetail.nomSlAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_NOM_DSC_AMT')">
          <p>{{ membershipDetail.nomDscAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_WDWAL_DT')">
          <p>{{ membershipDetail.col23 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SPMT_SL_AMT')">
          <p>{{ membershipDetail.spmtSlAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SPMT_DSC_AMT')">
          <p>{{ membershipDetail.spmtDscAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FSH_DT')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.col26) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_AMT')">
          <p>{{ membershipDetail.thmSlSumAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_VAT')">
          <p>{{ membershipDetail.slSumVat }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_CTR_AMT')">
          <p>{{ membershipDetail.slCtrAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DSC_AGG_AMT')">
          <p>{{ membershipDetail.col30 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CTR_AGG_AMT')">
          <p>{{ membershipDetail.col31 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_AGG_AMT')">
          <p>{{ membershipDetail.slAggAmt }}</p>
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
          <p>{{ membershipDetail.prmBlamEotAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_DP_AMT')">
          <p>{{ membershipDetail.prmDpAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_RFND_AMT')">
          <p>{{ membershipDetail.prmRfndAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRM_RPLC_AMT')">
          <p>{{ membershipDetail.prmRplcAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_SL_AMT')">
          <p>{{ membershipDetail.prmSlAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_EXP_AMT')">
          <p>{{ membershipDetail.col38 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRPD_BLAM')">
          <p>{{ membershipDetail.eotAtam }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_DP_AMT')">
          <p>{{ membershipDetail.thmAtamDpAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RFND_AMT')">
          <p>{{ membershipDetail.thmAtamRfndAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RPLC_AMT')">
          <p>{{ membershipDetail.col42 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_SL_AMT')">
          <p>{{ membershipDetail.prpdSlAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_TAM')">
          <p>{{ membershipDetail.btdAtam }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_DP_AMT')">
          <p>{{ membershipDetail.slBndAlrpyAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DP_AGG_AMT')">
          <p>{{ membershipDetail.slDpAggAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_UC_TAM')">
          <p>{{ membershipDetail.thmUcBlam }}</p>
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
          <p>{{ membershipDetail.col48 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSC_DP_AMT')">
          <p>{{ membershipDetail.col49 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSC_UC_AMT')">
          <p>{{ membershipDetail.col50 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_FILT_DDTN_AMT')">
          <p>{{ membershipDetail.col51 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FILT_DP_AMT')">
          <p>{{ membershipDetail.col52 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FILT_UC_AMT')">
          <p>{{ membershipDetail.col53 }}</p>initGrdBondOrder
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
          <p>{{ membershipDetail.btdDlqAddAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_OC_AMT')">
          <p>{{ membershipDetail.dlqAdamtOcAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_DDTN_AMT')">
          <p>{{ membershipDetail.thmCtrDlqAddAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_DP_AMT')">
          <p>{{ membershipDetail.thmDlqDpSumAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_RFND_AMT')">
          <p>{{ membershipDetail.thmDlqRfndSumAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_EOT_AMT')">
          <p>{{ membershipDetail.eotDlqAddAmt }}</p>
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
          <p>{{ membershipDetail.col60 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_MCNT_AGG')">
          <p>{{ membershipDetail.dlqMc }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_AMT')">
          <p>{{ membershipDetail.thmOcDlqAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DFA_AMT')">
          <p>{{ membershipDetail.dfaAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DFA_DP_AMT')">
          <p>{{ membershipDetail.dfaDpAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_INCM_DT')">
          <p>{{ membershipDetail.actcsDt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CLCTAM_ICHR')">
          <p>{{ membershipDetail.clctamPrtnrNo }}</p>
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
