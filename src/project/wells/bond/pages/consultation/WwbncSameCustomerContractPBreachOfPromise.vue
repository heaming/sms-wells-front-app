<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncSameCustomerContractPBreachOfPromise - 웰스 렌탈 위약정보 탭- W-BN-U-0033P10
3. 작성자 : songmi.in
4. 작성일 : 2023.03.08 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 동일고객 계약번호에 대한 렌탈 위약정보 조회
****************************************************************************************************
--->
<template>
  <kw-action-top class="mt20">
    <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
  </kw-action-top>
  <kw-form
    dense
    class="kw-form--small"
  >
    <kw-form-row>
      <kw-form-item :label="$t('MSG_TXT_CCAM_TOT_AMT')">
        <p>
          {{ breachOfPromise.eotBorAmt }}
        </p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_BOR_DP')">
        <p>
          {{ breachOfPromise.dpCcamSumAmt }}
        </p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_BOR_BLAM')">
        <p>
          {{ breachOfPromise.borBlam }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item :label="$t('MSG_TXT_SL_OC')">
        <p>
          {{ breachOfPromise.thmSlSumAmt }}
        </p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_ACU_DP')">
        <p>
          {{ breachOfPromise.acuDpAmt }}
        </p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_BND_NPD')">
        <p>
          {{ breachOfPromise.ucAmt }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item :label="$t('MSG_TXT_RSG_CCAM')">
        <p>
          {{ breachOfPromise.rsgBorAmt }}
        </p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_RGST_COST_DSC')">
        <p>
          {{ breachOfPromise.rgstCostDscBorAmt }}
        </p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_RENTAL_DSC')">
        <p>
          {{ breachOfPromise.rentalDscBorAmt }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item :label="$t('MSG_TXT_CSMB_CS')">
        <p>
          {{ breachOfPromise.csmbCostBorAmt }}
        </p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_P_USE')">
        <p>
          {{ breachOfPromise.pBorAmt }}
        </p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_REQD_CS_AMT')">
        <p>
          {{ breachOfPromise.reqdCsBorAmt }}
        </p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <kw-form-item :label="$t('TXT_MSG_LOST_RNTF')">
        <p>
          {{ breachOfPromise.lsRntf }}
        </p>
      </kw-form-item>
      <kw-form-item :label="$t('MSG_TXT_RSTL_CCAM')">
        <p>
          {{ breachOfPromise.rstlBorAmt }}
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

const dataService = useDataService();
const { t } = useI18n();

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
const breachOfPromise = ref({});

async function fetchData() {
  const res = await dataService.get('/sms/wells/bond/same-customer-contracts/breach-of-promise', { params: paramData.value });
  breachOfPromise.value = res.data;

  breachOfPromise.value.eotBorAmt = stringUtil.getNumberWithComma(breachOfPromise.value.eotBorAmt);
  breachOfPromise.value.dpCcamSumAmt = stringUtil.getNumberWithComma(breachOfPromise.value.dpCcamSumAmt);
  breachOfPromise.value.borBlam = stringUtil.getNumberWithComma(breachOfPromise.value.borBlam);
  breachOfPromise.value.thmSlSumAmt = stringUtil.getNumberWithComma(breachOfPromise.value.thmSlSumAmt);
  breachOfPromise.value.ucAmt = stringUtil.getNumberWithComma(breachOfPromise.value.ucAmt);
  breachOfPromise.value.rsgBorAmt = stringUtil.getNumberWithComma(breachOfPromise.value.rsgBorAmt);
  breachOfPromise.value.rgstCostDscBorAmt = stringUtil.getNumberWithComma(breachOfPromise.value.rgstCostDscBorAmt);
  breachOfPromise.value.rentalDscBorAmt = stringUtil.getNumberWithComma(breachOfPromise.value.rentalDscBorAmt);
  breachOfPromise.value.csmbCostBorAmt = stringUtil.getNumberWithComma(breachOfPromise.value.csmbCostBorAmt);
  breachOfPromise.value.pBorAmt = stringUtil.getNumberWithComma(breachOfPromise.value.pBorAmt);
  breachOfPromise.value.reqdCsBorAmt = stringUtil.getNumberWithComma(breachOfPromise.value.reqdCsBorAmt);
  breachOfPromise.value.lsRntf = stringUtil.getNumberWithComma(breachOfPromise.value.lsRntf);
  breachOfPromise.value.rstlBorAmt = stringUtil.getNumberWithComma(breachOfPromise.value.rstlBorAmt);
  breachOfPromise.value.acuDpAmt = stringUtil.getNumberWithComma(breachOfPromise.value.acuDpAmt);
}

watch(() => props.selectedGridRow, async (obj) => {
  if (obj) {
    paramData.value = obj;
    await fetchData();
  }
});

</script>
