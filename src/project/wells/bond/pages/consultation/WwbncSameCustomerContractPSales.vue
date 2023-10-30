<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncSameCustomerContractPSales - 동일고객 계약내역 매출정보 조회
3. 작성자 : sunghun.choi
4. 작성일 : 2023.03.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 동일고객 계약번호에 대한 매출정보 조회
****************************************************************************************************
--->
<template>
  <kw-action-top
    v-show="rental||msh||spay"
    class="mt20"
  />
  <kw-form
    v-show="rental"
    :cols="4"
    dense
    class="kw-form--small"
  >
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_REG_FEE')"
      >
        <p>
          {{ sales.rentalRgstCost }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_RTLFE1_MM_CHRAM')"
      >
        <p>
          {{ sales.rentalAmt }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_RTLFE_DUTY_PTRM')"
      >
        <p>
          {{ sales.dutyUseMcn }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_REQD_RQDT')"
      >
        <p>
          {{ sales.reqdDtm }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_RGST_COST_DSC')"
      >
        <p>
          {{ sales.rgstDsc }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_RTLFE1_DSC')"
      >
        <p>
          {{ sales.rentalDscAmt }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_PD_DC_CLASS')"
      >
        <p>
          {{ sales.sellDscDvNm }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_CANC_DT')"
      >
        <p>
          {{ sales.canDt }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_RNTL_TOTAL')"
      >
        <p>
          {{ sales.cntrTam }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_RTLFE1_MCNT')"
      >
        <p>
          {{ sales.rentalAmt }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_DISC_CODE')"
      >
        <p>
          {{ sales.sellDscTpNm }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_LEASE_DV')"
      >
        <p>
          {{ sales.sellTpNm }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_RTLFE2_MM_CHRAM')"
      >
        <p>
          {{ sales.rentalAmt2 }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_MNGT_PRD_MCNT')"
      >
        <p>
          {{ sales.svPrd }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_1PLUS1_LK_CNTR')"
      >
        <p>
          {{ sales.linkDtlCntrNo }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_RTLFE2_DSC')"
      >
        <p>
          {{ sales.rentalDscAmt2 }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_PAR_CNTR')"
      >
        <p>
          {{ sales.sdingDtlCntrNo }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_ALNC_LK_CNTR')"
      >
        <p>
          {{ sales.alncLinkDtlCntrNo }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_RTLFE2_MCNT')"
      >
        <p>
          {{ sales.rentalPtrm2 }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_SL_DT')"
      >
        <p>
          {{ sales.slRcogDt }}
        </p>
      </kw-form-item>
    </kw-form-row>
  </kw-form>

  <kw-action-top />
  <kw-form
    v-show="msh"
    :cols="4"
    dense
    class="kw-form--small"
  >
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_MM_SSPCS')"
      >
        <p>
          {{ sales.sellAmt }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_DISC_CODE')"
      >
        <p>
          {{ sales.sellDscTpNm }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_WDWAL_DT')"
      >
        <p>
          {{ sales.wdwalDt }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_SVC_BETWEEN')"
      >
        <p>
          {{ sales.svPrd2 }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_STPL_MCNT')"
      >
        <p>
          {{ sales.stplPtrm }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_DSC_AMT')"
      >
        <p>
          {{ sales.dscAmt }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_VST_DT')"
      >
        <p>
          {{ sales.sppDuedt }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_MNGT_PRD')"
      >
        <p>
          {{ sales.svPrd2 }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_J_DT')"
      >
        <p>
          {{ sales.cntrDt }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_VST_NMN')"
      >
        <p>
          {{ sales.vstNmnN }}
        </p>
      </kw-form-item>
    </kw-form-row>
  </kw-form>

  <kw-action-top />
  <kw-form
    v-show="spay"
    :cols="4"
    dense
    class="kw-form--small"
  >
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_FRISU_MSH')"
      >
        <p>
          {{ sales.frisuBfsvcPtrmN }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_SALE_PRICE')"
      >
        <p>
          {{ sales.sellAmt }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_TK_AMT')"
      >
        <p>
          {{ sales.cntrAmt }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_ISTM_MCNT')"
      >
        <p>
          {{ sales.istmMcn }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_FRISU_AS')"
      >
        <p>
          {{ sales.frisuAsPtrmN }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_CNTRCT_AMT')"
      >
        <p>
          {{ sales.fnlAmt }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_ISTM_AMT')"
      >
        <p>
          {{ sales.istmPcamAmt }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_RECAP_MSH')"
      >
        <p>
          {{ sales.frisuAsPtrmN }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_SBSCM')"
      >
        <p>
          {{ sales.cntrAmt }}
        </p>
      </kw-form-item>
      <kw-form-item
        :label="$t('MSG_TXT_MM_INTAM')"
      >
        <p>
          {{ sales.mmIstmAmt }}
        </p>
      </kw-form-item>
    </kw-form-row>
  </kw-form>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const rental = ref();
const msh = ref();
const spay = ref();

const props = defineProps({
  selectedGridRow: {
    type: Object,
    default: null,
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const paramData = ref({});
const sales = ref({});

function setBndBizDvCd(bndBizDvCd) {
  if (bndBizDvCd === 'L20' || bndBizDvCd === 'L21') {
    rental.value = true;
    msh.value = false;
    spay.value = false;
  } else if (bndBizDvCd === 'L30') {
    rental.value = false;
    msh.value = true;
    spay.value = false;
  } else {
    rental.value = false;
    msh.value = false;
    spay.value = true;
  }
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/bond/same-customer-contracts/sales', { params: paramData.value });
  sales.value = res.data;

  sales.value.rentalRgstCost = stringUtil.getNumberWithComma(sales.value.rentalRgstCost);
  sales.value.rentalAmt = stringUtil.getNumberWithComma(sales.value.rentalAmt);
  sales.value.reqdDtm = !isEmpty(sales.value.reqdDtm) ? dayjs(sales.value.reqdDtm).format('YYYY-MM-DD') : '';
  sales.value.rgstDsc = stringUtil.getNumberWithComma(sales.value.rgstDsc);
  sales.value.rentalDscAmt = stringUtil.getNumberWithComma(sales.value.rentalDscAmt);
  sales.value.canDt = !isEmpty(sales.value.canDt) ? dayjs(sales.value.canDt).format('YYYY-MM-DD') : '';
  sales.value.cntrTam = stringUtil.getNumberWithComma(sales.value.cntrTam);
  sales.value.rentalAmt = stringUtil.getNumberWithComma(sales.value.rentalAmt);
  sales.value.rentalAmt2 = stringUtil.getNumberWithComma(sales.value.rentalAmt2);
  sales.value.rentalDscAmt2 = stringUtil.getNumberWithComma(sales.value.rentalDscAmt2);
  sales.value.rentalPtrm2 = stringUtil.getNumberWithComma(sales.value.rentalPtrm2);
  sales.value.slRcogDt = !isEmpty(sales.value.slRcogDt) ? dayjs(sales.value.slRcogDt).format('YYYY-MM-DD') : '';

  sales.value.sellAmt = stringUtil.getNumberWithComma(sales.value.sellAmt);
  sales.value.dscAmt = stringUtil.getNumberWithComma(sales.value.dscAmt);
  sales.value.sppDuedt = !isEmpty(sales.value.sppDuedt) ? dayjs(sales.value.sppDuedt).format('YYYY-MM-DD') : '';
  sales.value.cntrDt = !isEmpty(sales.value.cntrDt) ? dayjs(sales.value.cntrDt).format('YYYY-MM-DD') : '';

  sales.value.cntrAmt = stringUtil.getNumberWithComma(sales.value.cntrAmt);
  sales.value.fnlAmt = stringUtil.getNumberWithComma(sales.value.fnlAmt);
  sales.value.istmPcamAmt = stringUtil.getNumberWithComma(sales.value.istmPcamAmt);
  sales.value.mmIstmAmt = stringUtil.getNumberWithComma(sales.value.mmIstmAmt);
}

watch(() => props.selectedGridRow, async (obj) => {
  if (obj) {
    setBndBizDvCd(obj.bndBizDvCd);
    paramData.value = obj;
    await fetchData();
  }
});

</script>
