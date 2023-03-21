<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbLeaseSalesDetailP - 리스매출 상세내역 - W-CL-U-0038P07
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.03.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 리스매출 상세내역을 보여준다.
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
          <p>{{ leaseSalesDetail.col1 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <p>{{ leaseSalesDetail.col2 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_YM')">
          <p>{{ leaseSalesDetail.col3 }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <h3>{{ $t('MSG_TXT_CNTR_PDCT') }}</h3>
    <p class="kw-font--14 kw-fc--black3 text-right mb12">
      <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
    </p>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRDT')">
          <p>{{ leaseSalesDetail.col4 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_RCP_D')">
          <p>{{ stringUtil.getDateFormat(leaseSalesDetail.col5) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DT_OF_SALE')">
          <p>{{ stringUtil.getDateFormat(leaseSalesDetail.col16) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRD_MCNT_USWY')">
          <p>{{ leaseSalesDetail.col7 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_REG_FEE')">
          <p>{{ leaseSalesDetail.col8 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_LEASE_TAM')">
          <p>{{ leaseSalesDetail.col9 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_LEASFE_MCNT_WON')">
          <p>{{ leaseSalesDetail.col10 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PD_SVC_FEE')">
          <p>{{ leaseSalesDetail.col11 }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <h3>{{ $t('MSG_TXT_SL_ARTC') }}</h3>
    <p class="kw-font--14 kw-fc--black3 text-right mb12">
      <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
    </p>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_LEASE_NMN')">
          <p>{{ leaseSalesDetail.col12 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_USE_DC_D')">
          <p>{{ leaseSalesDetail.col13 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CANC_DT')">
          <p>{{ stringUtil.getDateFormat(leaseSalesDetail.col14) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PCAM_SL_AMT')">
          <p>{{ leaseSalesDetail.col15 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FSH_DT')">
          <p>{{ stringUtil.getDateFormat(leaseSalesDetail.col16) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PCAM_AGG_AMT')">
          <p>{{ leaseSalesDetail.col17 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DSC_AGG_AMT')">
          <p>{{ leaseSalesDetail.col18 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CTR_AGG_AMT')">
          <p>{{ leaseSalesDetail.col19 }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <h3>{{ $t('MSG_TXT_BIL_ARTC') }}</h3>
    <p class="kw-font--14 kw-fc--black3 text-right mb12">
      <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
    </p>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BTD_AMT')">
          <p>{{ leaseSalesDetail.col20 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_OCCR_AMT')">
          <p>{{ leaseSalesDetail.col21 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DP_AMT')">
          <p>{{ leaseSalesDetail.col22 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SPMT_AMT')">
          <p>{{ leaseSalesDetail.col23 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CTR_AMT')">
          <p>{{ leaseSalesDetail.col24 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_EOT_AMT')">
          <p>{{ leaseSalesDetail.col25 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BND_CTR_AMT')">
          <p>{{ leaseSalesDetail.col26 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_BND_EOT_AMT')">
          <p>{{ leaseSalesDetail.col27 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_BTD_AMT')">
          <p>{{ leaseSalesDetail.col28 }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <h3>{{ $t('MSG_TXT_CAN_ARTC') }}</h3>
    <p class="kw-font--14 kw-fc--black3 text-right mb12">
      <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
    </p>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BOR_AMT')">
          <p>{{ leaseSalesDetail.col29 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PD_LENT_LOST_LOG')">
          <p>{{ leaseSalesDetail.col30 }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <h3>{{ $t('MSG_TXT_PRPD_ARTC') }}</h3>
    <p class="kw-font--14 kw-fc--black3 text-right mb12">
      <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
    </p>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BTD_AMT')">
          <p>{{ leaseSalesDetail.col31 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_DP_AMT')">
          <p>{{ leaseSalesDetail.col32 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RFND_AMT')">
          <p>{{ leaseSalesDetail.col33 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_RPLC_AMT')">
          <p>{{ leaseSalesDetail.col34 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_RPLC_AMT')">
          <p>{{ leaseSalesDetail.col35 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_TAM')">
          <p>{{ leaseSalesDetail.col36 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_P_BLAM')">
          <p>{{ leaseSalesDetail.col37 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_BLAM')">
          <p>{{ leaseSalesDetail.col38 }}</p>
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
          <p>{{ leaseSalesDetail.col39 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_OC_AMT')">
          <p>{{ leaseSalesDetail.col40 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_DDTN_AMT')">
          <p>{{ leaseSalesDetail.col41 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_DP_AMT')">
          <p>{{ leaseSalesDetail.col42 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_RFND_AMT')">
          <p>{{ leaseSalesDetail.col43 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADAMT_EOT_AMT')">
          <p>{{ leaseSalesDetail.col44 }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <h3>{{ $t('MSG_TXT_DLQ_ARTC') }}</h3>
    <p class="kw-font--14 kw-fc--black3 text-right mb12">
      <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
    </p>
    <kw-form dense>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_KEEP_AW_AMT')">
          <p>{{ leaseSalesDetail.col45 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_MCNT_AGG')">
          <p>{{ leaseSalesDetail.col46 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_AMT')">
          <p>{{ leaseSalesDetail.col47 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ACTCS_DT')">
          <p>{{ leaseSalesDetail.col48 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CLCTAM_ICHR')">
          <p>{{ leaseSalesDetail.col49 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FW_YM')">
          <p>{{ leaseSalesDetail.col50 }}</p>
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

const leaseSalesDetail = ref({});

let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  const res = await dataService.get('/sms/wells/closing/lease-sales-detail', { params: cachedParams });
  console.log(res.data);
  leaseSalesDetail.value = res.data;
}

onMounted(async () => {
  await fetchData();
});
</script>
