<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccSalesPerformPenaltyP - 매출실적현황 - 위약금 예상
3. 작성자 : Kicheol Choi
4. 작성일 : 2023.07.11
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 위약금 예상 조회를 위한 팝업화면.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.slClYm"
            :label="$t('MSG_TXT_BASE_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>

        <kw-search-row />
      </kw-search-row>
    </kw-search>
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_PRM_ARTC')+'('+$t('MSG_TXT_ORDERSELECT_TITLE')+')' }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
    </kw-action-top>
    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRM_MCNT')+'('+ $t('MSG_TXT_MCNT') +'/(%))'">
          <p>{{ info.prmMcn }}/({{ info.prmDscr }})</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRM_PTRM')">
          <p>{{ info.prmStrtYm }} ~ {{ info.prmEndYm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_MM_RTLFE')+'/'+$t('MSG_TXT_DSC_AMT')"
          :hint="$t('MSG_TXT_MM_RTLFE_MCNT_AMT')"
        >
          <p>{{ info.rentalAmt }}/{{ info.rentalDscAmt }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_DSC_TOT_AMT')+'('+$t('MSG_TXT_PRM_PTRM_BASE')+')'"
        >
          <p>{{ info.prmDscAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRM_ET_TOT_AMT')">
          <p>{{ info.totPrmAmt }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_SL_ARTC') }}({{ $t('MSG_TXT_NMN') }})</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
    </kw-action-top>
    <kw-form
      :cols="3"
      dense
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_NOM_SL_AMT')">
          <p>{{ info.nomSlAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_RENTAL_DC')">
          <p>{{ info.rentalDc }}/{{ info.slDc }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CHNG_DT')">
          <p>{{ info.chngDt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SPMT_SL_AMT')">
          <p>{{ info.spmtSlAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_NOM_DSC_AMT')">
          <p>{{ info.nomDscAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CAN_CTR_AMT')">
          <p>{{ info.canCtrAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ADN_SV')">
          <p>{{ info.adnSv }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SPMT_DSC_AMT')">
          <p>{{ info.spmtDscAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_CTR_AMT')">
          <p>{{ info.slCtrAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SL_AMT')">
          <p>{{ info.thmSlSumAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_VAT')">
          <p>{{ info.slSumVat }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_AGG_AMT')">
          <p>{{ info.slAggAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DSC_AGG_AMOUNT')">
          <p>{{ info.dscAggAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CTR_AGG_AMT2')">
          <p>{{ info.ctrAggAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_BLAM')">
          <p>{{ info.ucAmt }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>{{ $t('MSG_TXT_DLQ_ADAMT') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
    </kw-action-top>
    <kw-form
      :cols="3"
      dense
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DLQ_ADAMT')">
          <p>{{ info.btdDlqAddAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DEPOSIT_AMT')">
          <p>{{ info.thmDlqAddDpSumAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_WDRAM')">
          <p>{{ info.thmDlqAddRfndSumAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CTR_AMT')">
          <p>{{ info.thmCtrDlqAddAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_UCAM_FLPYM_AMT')">
          <p>{{ info.eotDlqAddAmt }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>
          {{ $t('MSG_TXT_CCAM_ET') }}
          <ul class="kw-notification">
            <li>
              <span class="kw-fc--primary">{{ $t('MSG_TXT_SIMP_CCAM_ET_INQR') }}</span>
              {{ $t('MSG_TXT_CAN_D_RTLFE_SPMT_DSC_AMT_EXCD') }}
              <span class="kw-fc--primary">{{ $t('MSG_TXT_ACL_CAN_ADJ_AMT_GAP_EXST') }}</span>
            </li>
          </ul>
        </h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
    </kw-action-top>
    <kw-form
      cols="3"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CAN_EXP_DT')"
          colspan="2"
        >
          <kw-date-picker
            v-model="searchEstimatedParams.duedt"
            dense
          />
          <kw-btn
            v-permission:read
            secondary
            dense
            :label="$t('MSG_BTN_INQR')"
            padding="12px"
            @click="onClickEstimatedSearch()"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_RES_RENTAL_AMT')">
          <p>{{ estimatedInfo.resRtlfeBorAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_RGST_COST_DSC_AMT')">
          <p>{{ estimatedInfo.rgstCostDscBorAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSC_AMT')">
          <p>{{ estimatedInfo.rentalDscBorAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CSMB_CS')">
          <p>{{ estimatedInfo.csmbCostBorAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_RSTL_AMT')">
          <p>{{ estimatedInfo.rstlBorAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_USE_P')">
          <p>{{ estimatedInfo.pBorAmt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CCAM_REQD_CS')">
          <p>{{ estimatedInfo.reqdCsBorAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CCAM_TOT_AMT')">
          <p>{{ estimatedInfo.borAmt }}</p>
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
import dayjs from 'dayjs';

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const info = ref({});
const estimatedInfo = ref({});
let cachedParams;
let cachedEstimatedParams;

const props = defineProps({
  cntrNo: {
    type: String,
    required: true,
  },
  cntrSn: {
    type: String,
    required: true,
  },
});

const searchParams = ref({
  slClYm: now.format('YYYYMM'),
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
});

const searchEstimatedParams = ref({
  duedt: now.format('YYYYMMDD'),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/closing/sales-perf', { params: { ...cachedParams } });
  info.value = res.data;
}

async function fetchEstimatedData() {
  const res = await dataService.get('/sms/wells/closing/sales-perf/estimated-penalty', { params: { ...cachedEstimatedParams } });
  estimatedInfo.value = res.data;
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickEstimatedSearch() {
  cachedEstimatedParams = cloneDeep(searchEstimatedParams.value);
  await fetchEstimatedData();
}

onMounted(async () => {
  await onClickSearch();
});

</script>
