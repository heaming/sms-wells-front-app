<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbPrepaidDepositRentalP - 매출실적현황-선입금렌탈조회 - W-CL-U-0038P03
3. 작성자 : WOO SEUNGMIN -> Kicheol Choi
4. 작성일 : 2023.03.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 선입금렌탈조회 내역을 보여준다.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="3xl"
  >
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <kw-input
            v-model:model-value="searchParams.cntrDtlNo"
            :readonly="true"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SL_YM')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.slClYmFrom"
            v-model:to="searchParams.slClYmTo"
            :label="$t('MSG_TXT_SL_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-action-top>
      <template #left>
        <h3>{{ $t('MSG_TXT_RENTAL_DTL') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_RENTAL_NMN')">
          <p>{{ prepaidDepositRental.rentalTn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRDPT_MCNT')">
          <p>{{ prepaidDepositRental.prmMcn }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRDPT_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(prepaidDepositRental.prmDpAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRDPT_PTRM')">
          <p>{{ prepaidDepositRental.prmPrd }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_MM_RTLFE')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(prepaidDepositRental.rentalAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(prepaidDepositRental.thmAtamDpAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRDPT_TAM')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(prepaidDepositRental.col7)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_UC_AMT')">
          <p>{{ stringUtil.getNumberWithComma(toInteger(prepaidDepositRental.prmBlamEotAmt)) }}</p>
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
import dayjs from 'dayjs';

const dataService = useDataService();
const now = dayjs();
const props = defineProps({
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
const cntr = props.cntrDtlNo.split('-');

const searchParams = ref({
  cntrDtlNo: props.cntrDtlNo,
  cntrNo: cntr[0],
  cntrSn: cntr[1],
  slClYmFrom: now.format('YYYYMM'),
  slClYmTo: now.format('YYYYMM'),
});

const prepaidDepositRental = ref({});

let cachedParams;
async function fetchData() {
  console.log(searchParams.value);
  const res = await dataService.get('/sms/wells/closing/prepaid-deposit-rental', { params: cachedParams });
  console.log(res.data);
  prepaidDepositRental.value = res.data;
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

</script>
