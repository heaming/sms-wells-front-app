<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbMembershipSalesDetailP - 멤버십매출 상세내역 - W-CL-U-0038P06
3. 작성자 : WOO SEUNGMIN -> gugyeongu
4. 작성일 : 2023.03.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 멤버십매출 상세내역을 보여준다.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <h3>{{ $t('MSG_TXT_CST_BAS_INF') }}</h3>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CST_NM')">
          <p>{{ membershipDetail.cstKnm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <p>{{ membershipDetail.cntrNo }}-{{ membershipDetail.cntrSn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_YM')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.slClYm, 'YYYY-MM') }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_CNTR_PDCT') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRDT_CODE')">
          <p>{{ membershipDetail.pdCd }} {{ membershipDetail.pdNm }} {{ membershipDetail.svTpCdNm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNTR_DATE')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.cntrDt) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNFM_DT')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.cntrCnfmDt) }}</p>
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
          <p>{{ stringUtil.getDateFormat(membershipDetail.cntrCanDt) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_PRM_ARTC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>

    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRM_TN')">
          <p>{{ membershipDetail.prmTn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_MCNT')">
          <p>{{ membershipDetail.prmMcn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_STRT')">
          <p>{{ membershipDetail.prmStrtYm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRM_END')">
          <p>{{ membershipDetail.prmEndYm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_DSCR_DSC_AMT')">
          <p>{{ membershipDetail.prmDscr }}% / {{ membershipDetail.prmDscAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_1PRM_AMT')">
          <p>{{ membershipDetail.prmMcn1 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_2PRM_AMT')">
          <p>{{ membershipDetail.prmMcn2 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_TAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.totPrmAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_SL_ARTC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>

    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_J_NMN')">
          <p>{{ membershipDetail.rentalTn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_J_DC')">
          <p>{{ membershipDetail.rentalDc }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_J_DT')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.jDt) }}</p>
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
          <p>{{ stringUtil.getDateFormat(membershipDetail.mshWdwalDt) }}</p>
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
          <p>{{ stringUtil.getDateFormat(membershipDetail.fshDt) }}</p>
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

    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_DP_ARTC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>

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

    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ t('MSG_TXT_BOR_ARTC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BOR_DDTN_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.dscSlAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_BOR_DP_AMT2')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.dscDpAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_BOR_UC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.dscUcAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_DLQ_ADD') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_BTD_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.btdDlqAddAmt)) }}</p>
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

    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_DLQ_ARTC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_VST_PRD_VST_DT')">
          <p>
            {{ membershipDetail.svPrd }}{{ $t('MSG_TXT_MCNT') }}/
            {{ stringUtil.getDateFormat(membershipDetail.vstDt) }}
          </p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_MCNT_AGG')">
          <p>{{ membershipDetail.dlqMcn }} / {{ membershipDetail.dlqAcuMcn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.eotDlqAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DFA_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.dfaAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DFA_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(membershipDetail.dfaDpAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_INCM_DT')">
          <p>{{ stringUtil.getDateFormat(membershipDetail.actcsDt) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CLCTAM_ICHR')">
          <p>{{ membershipDetail.clctamDvCd }}{{ membershipDetail.clctamPrtnrNo }}</p>
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
import { cloneDeep, toInteger, isEmpty } from 'lodash-es';

const dataService = useDataService();
const props = defineProps({
  slClYm: {
    type: String,
    required: false,
    default: '',
  },
  cntrNo: {
    type: String,
    required: false,
    default: '',
  },
  cntrSn: {
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
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
});

const membershipDetail = ref({});

let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  const res = await dataService.get('/sms/wells/closing/membership-sales-detail', { params: cachedParams });
  console.log(res.data);
  membershipDetail.value = res.data;
  membershipDetail.value.svTpCdNm = !isEmpty(membershipDetail.value.svTpCdNm) ? ` (${membershipDetail.value.svTpCdNm})` : '';
  membershipDetail.value.prmMcn = Number(membershipDetail.value.prmMcn) > 0 ? ` ${membershipDetail.value.prmMcn}${t('MSG_TXT_MCNT')}` : '';
  membershipDetail.value.prmMcn1 = Number(membershipDetail.value.prmMcn1) > 0 ? `${membershipDetail.value.prmMcn1}${t('MSG_TXT_MCNT')} ${stringUtil.getNumberWithComma(toInteger(membershipDetail.prmAmt1))}` : '';
  membershipDetail.value.prmMcn2 = Number(membershipDetail.value.prmMcn2) > 0 ? ` ${membershipDetail.value.prmMcn2}${t('MSG_TXT_MCNT')} ${stringUtil.getNumberWithComma(toInteger(membershipDetail.prmAmt2))}` : '';
  membershipDetail.value.clctamDvCd = membershipDetail.value.clctamDvCd ? `${membershipDetail.value.rcpAoffceCdNm}/${membershipDetail.value.clctamDvCdNm}(${membershipDetail.value.clctamDvCd})` : '';
  membershipDetail.value.clctamPrtnrNo = membershipDetail.value.clctamPrtnrNo ? `${membershipDetail.value.clctamPrtnrNm}(${membershipDetail.value.clctamPrtnrNo})` : '';
}

onMounted(async () => {
  await fetchData();
});

</script>
