<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbSalesDtlP - 매출 상세정보 - W-CL-U-0028P02
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.03.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 계약상세번호 별 매출상세정보를 보여준다.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-form
      v-if="isShow1"
      :cols="4"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_REG_FEE')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesRentalInf.rentalRgstCost)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RTLFE1_MM_CHRAM')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesRentalInf.rentalAmt)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RTLFE_DUTY_PTRM')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesRentalInf.dutyUseMcn)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_REQD_RQDT')"
        >
          <p>{{ stringUtil.getDateFormat(salesRentalInf.reqdDtm) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_RGST_COST_DSC')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesRentalInf.dscAmt)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RTLFE1_DSC')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesRentalInf.rentalDscAmt)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_PD_DC_CLASS')"
        >
          <p>{{ salesRentalInf.sellDscDvCd }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_CANC_DT')"
        >
          <p>{{ stringUtil.getDateFormat(salesRentalInf.canDt) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_RNTL_TOTAL')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesRentalInf.cntrTam)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RTLFE1_MCNT')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesRentalInf.cntrPtrm)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_DISC_CODE')"
        >
          <p>{{ salesRentalInf.sellDscTpCd }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_LEASE_DV')"
        >
          <p>{{ salesRentalInf.sellTpDtlCd }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RTLFE2_MM_CHRAM')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesRentalInf.rentalAmt2)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_MNGT_PRD_MCNT')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesRentalInf.svPrd)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_1PLUS1_LK_CNTR')"
        >
          <p>{{ salesRentalInf.ojDtlCntr1 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RTLFE2_DSC')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesRentalInf.rentalDscAmt2)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_PAR_CNTR')"
        >
          <p>{{ salesRentalInf.ojDtlCntr3 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ALNC_LK_CNTR')"
        >
          <p>{{ salesRentalInf.ojDtlCntr2 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RTLFE2_MCNT')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesRentalInf.rentalPtrm2)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_SL_DT')"
        >
          <p>{{ stringUtil.getDateFormat(salesRentalInf.slRcogDt) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-form
      v-if="isShow2"
      :cols="4"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_MM_SSPCS')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesMembershipInf.sellAmt)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_DISC_CODE')"
        >
          <p>{{ salesMembershipInf.sellDscTpCd }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_WDWAL_DT')"
        >
          <p>{{ stringUtil.getDateFormat(salesMembershipInf.canDt) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_VST_PRD')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesMembershipInf.svPrd2)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_STPL_MCNT')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesMembershipInf.stplPtrm)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_DSC_AMT')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesMembershipInf.dscAmt)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_VST_DT')"
        >
          <p>{{ stringUtil.getDateFormat(salesMembershipInf.sppDuedt) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_MNGT_PRD')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesMembershipInf.svPrd1)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_J_DT')"
        >
          <p>{{ stringUtil.getDateFormat(salesMembershipInf.cntrPdStrtdt) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_VST_NMN')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesMembershipInf.vstNmnN)) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-form
      v-if="isShow3"
      :cols="4"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_FRISU_MSH')"
        >
          <p>{{ salesSingleInf.frisuBfsvcPtrmN }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_SALE_PRICE')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesSingleInf.sellAmt)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_TK_AMT')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesSingleInf.cntrAmt2)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_ISTM_MCNT')"
        >
          <p>{{ salesSingleInf.istmMcn }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_FRISU_AS')"
        >
          <p>{{ salesSingleInf.frisuAsPtrmN1 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_CNTRCT_AMT')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesSingleInf.fnlAmt)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_ISTM_AMT')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesSingleInf.istmPcamAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_RECAP_MSH')"
        >
          <p>{{ salesSingleInf.frisuAsPtrmN2 }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_SBSCM')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesSingleInf.cntrAmt1)) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_MM_INTAM')"
        >
          <p>{{ stringUtil.getNumberWithComma(toInteger(salesSingleInf.mmIstmAmt)) }}</p>
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
  slRcogDt: {
    type: String,
    required: false,
    default: '',
  },
  sellTpCd: {
    type: String,
    required: false,
    default: '',
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const isShow1 = ref(true);
const isShow2 = ref(true);
const isShow3 = ref(true);

const searchParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  slRcogDt: props.slRcogDt,
  sellTpCd: props.sellTpCd,
});

const salesRentalInf = ref({});
const salesMembershipInf = ref({});
const salesSingleInf = ref({});

let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);

  const { sellTpCd } = searchParams.value;
  if (sellTpCd === '2' || sellTpCd === '10') { // 렌탈, 리스
    const res = await dataService.get('/sms/wells/closing/sales-detail/rental', { params: cachedParams });
    console.log(res.data);
    salesRentalInf.value = res.data;
  } else if (sellTpCd === '3') { // 멤버십
    const res = await dataService.get('/sms/wells/closing/sales-detail/membership', { params: cachedParams });
    salesMembershipInf.value = res.data;
  } else if (sellTpCd === '1') { // 일시불
    const res = await dataService.get('/sms/wells/closing/sales-detail/single-payment', { params: cachedParams });
    salesSingleInf.value = res.data;
  }
}

onMounted(async () => {
  console.log('props.sellTpCd:', props.sellTpCd);
  if (props.sellTpCd === '2' || props.sellTpCd === '10') { // 렌탈, 금융리스
    isShow1.value = true;
    isShow2.value = false;
    isShow3.value = false;
  } else if (props.sellTpCd === '3') { // 멤버십
    isShow1.value = false;
    isShow2.value = true;
    isShow3.value = false;
  } else if (props.sellTpCd === '1') { // 일시불
    isShow1.value = false;
    isShow2.value = false;
    isShow3.value = true;
  }
  await fetchData();
});
</script>
