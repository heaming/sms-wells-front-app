<!-- eslint-disable max-len -->
<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbLeaseSalesDetailP - 리스매출 상세내역 - W-CL-U-0038P07
3. 작성자 : WOO SEUNGMIN -> gugyeongu
4. 작성일 : 2023.03.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 리스매출 상세내역을 보여준다.
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
          <p>{{ leaselSalesDetail.cstKnm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <p>{{ leaselSalesDetail.cntrNo }}-{{ leaselSalesDetail.cntrSn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_YM')">
          <p>{{ stringUtil.getDateFormat(leaselSalesDetail.slClYm, 'YYYY-MM').substring(0,7) }}</p>
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
        <kw-form-item :label="$t('MSG_TXT_PRDT')">
          <p v-if="isEmpty(leaselSalesDetail.adnSv)">
            {{ leaselSalesDetail.pdCd }} {{ leaselSalesDetail.pdNm }}
          </p>
          <p v-if="!isEmpty(leaselSalesDetail.adnSv)">
            {{ leaselSalesDetail.pdCd }} {{ leaselSalesDetail.pdNm }} ( {{ leaselSalesDetail.adnSv }} )
          </p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_RCP_D')">
          <p>{{ stringUtil.getDateFormat(leaselSalesDetail.cntrDt, 'YYYY-MM-DD') }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DT_OF_SALE')">
          <p>{{ stringUtil.getDateFormat(leaselSalesDetail.lcsleDt, 'YYYY-MM-DD') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRD_MCNT_USWY')">
          <p>{{ leaselSalesDetail.svPrd }}{{ $t('MSG_TXT_MCNT') }} / {{ leaselSalesDetail.svTpCdNm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_REG_FEE')">
          <p>{{ `${stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.rentalRgstCost))}(DC ${stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.dscAmt))})` }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_LEASE_TAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.cntrTam)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_LEASFE_MCNT_WON')">
          {{ `${leaselSalesDetail.rentalPtrm}/${stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.rentalAmt))}(DC ${stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.rentalDscAmt))})` }}
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PD_SVC_FEE')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.rentalAmtView)) }}</p>
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
        <kw-form-item :label="$t('MSG_TXT_LEASE_NMN')">
          <p>{{ leaselSalesDetail.rentalTn }} / {{ leaselSalesDetail.rentalDc }} - {{ leaselSalesDetail.slDc }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_USE_DC_D')">
          <p>{{ leaselSalesDetail.useDc }}{{ $t('MSG_TXT_D') }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CANC_DT')">
          <p>{{ stringUtil.getDateFormat(leaselSalesDetail.canDt, 'YYYY-MM-DD') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PCAM_SL_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.nomSlAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FSH_DT')">
          <p>{{ stringUtil.getDateFormat(leaselSalesDetail.fshDt, 'YYYY-MM-DD') }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PCAM_AGG_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.slAggAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DSC_AGG_AMOUNT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.sumDscAggAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CTR_AGG_AMT2')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.sumCtrAggAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_BIL_ARTC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BTD_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.bilBtdAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_OCCR_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.bilSlAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.bilDpAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SPMT_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.bilAddAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CTR_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.bilAdjAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_EOT_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.bilEotAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_CAN_ARTC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BOR_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.eotBorAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PD_LENT_LOST_LOG')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.lsRntf)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_PRPD_ARTC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BTD_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.btdAtam)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.atamDpAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RFND_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.atamRfndAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_RPLC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.atamSlAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RPLC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.ovrCtrDpAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_TAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.atamTotAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_P_BLAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.mlgEotPrpdAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_BLAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.eotAtam)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ t('MSG_TXT_DLQ_ADD') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_BTD_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.btdDlqAddAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_OC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.thmOcDlqAddAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_DDTN_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.thmCtrDlqAddAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_DP_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.thmDlqAddDpSumAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_RFND_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.thmDlqAddRfndSumAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_EOT_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.eotDlqAddAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ t('MSG_TXT_DLQ_ARTC') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_KEEP_AW_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.keepAwAmt)) }} / {{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.keepAwTotAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_MCNT_AGG')">
          <p>{{ leaselSalesDetail.dlqMcn }} / {{ leaselSalesDetail.dlqAcuMcn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_AMT')">
          <p v-if="leaselSalesDetail.slStpYn === 'Y'">
            {{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.eotDlqAmt)) }} ({{ $t('MSG_TXT_SL_STP') }})
          </p>
          <p v-if="leaselSalesDetail.slStpYn !== 'Y'">
            {{ stringUtil.getNumberWithComma(toInteger(leaselSalesDetail.eotDlqAmt)) }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ACTCS_DT')">
          <p>{{ stringUtil.getDateFormat(leaselSalesDetail.actcsDt, 'YYYY-MM-DD') }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CLCTAM_ICHR')">
          <p>{{ leaselSalesDetail.clctamPrtnrNm }}({{ leaselSalesDetail.clctamPrtnrNo }})</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FW_YM')">
          <p>{{ stringUtil.getDateFormat(leaselSalesDetail.clcoTfDt, 'YYYY-MM').substring(0,7) }}</p>
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

const leaselSalesDetail = ref({});

let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  const res = await dataService.get('/sms/wells/closing/rental-sales-detail', { params: cachedParams });
  console.log(res.data);
  leaselSalesDetail.value = res.data;
  if (leaselSalesDetail.value.rentalAmt > 0) {
    leaselSalesDetail.value.rentalAmtView = leaselSalesDetail.value.svAmt;
  } else {
    leaselSalesDetail.value.rentalAmtView = 0;
  }
}

onMounted(async () => {
  await fetchData();
});
</script>
