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
          <kw-date-picker
            v-model="searchParams.slClYmFrom"
            type="month"
            :label="$t('MSG_TXT_SL_YM')"
            rules="required"
          />
          <kw-date-picker
            v-model="searchParams.slClYmTo"
            type="date"
            :label="$t('MSG_TXT_SL_YM')"
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
          <!-- 렌탈차월 -->
          <p>{{ prepaidDepositRental.rentalTn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRDPT_MCNT')">
          <!-- 선입금개월(개월) -->
          <p>{{ searchParams.prmMcn }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRDPT_AMT')">
          <!-- 선입금금액 -->
          <p>{{ stringUtil.getNumberWithComma(toInteger(prepaidDepositRental.prmDpAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRDPT_PTRM')">
          <!-- 선입금기간 -->
          <p>{{ searchParams.prmPrd }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_MM_RTLFE')">
          <!-- 월렌탈료 -->
          <p>{{ stringUtil.getNumberWithComma(toInteger(prepaidDepositRental.rentalAmt)) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRPD_AMT')">
          <!-- 선수금액 -->
          <p>{{ stringUtil.getNumberWithComma(toInteger(prepaidDepositRental.thmAtamDpAmt)) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRDPT_TAM')">
          <!-- 선입금총액 -->
          <p>
            {{ stringUtil.getNumberWithComma(toInteger(prepaidDepositRental.prmDpAmt -
              toInteger(prepaidDepositRental.thmAtamDpAmt) + toInteger(prepaidDepositRental.prmBlamEotAmt))) }}
          </p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_UC_AMT')">
          <!-- 미수금액 -->
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
  slClYmTo: now.format('YYYYMMDD'),
  prmMcn: '',
  prmPrd: '',
});

const prepaidDepositRental = ref({});

let cachedParams;
async function fetchData() {
  const res = await dataService.get('/sms/wells/closing/prepaid-deposit-rental', { params: cachedParams });
  prepaidDepositRental.value = res.data;
}

function countMonth() {
  const { slClYmFrom, slClYmTo } = searchParams.value;
  const fromDt = new Date(slClYmFrom.substring(0, 4), slClYmFrom.substring(4, 6) - 1, '01');
  const toDt = new Date(slClYmTo.substring(0, 4), slClYmTo.substring(4, 6) - 1, slClYmTo.substring(6, 8));

  const interval = toDt - fromDt;
  const day = 1000 * 60 * 60 * 24;
  const month = day * 30;
  const intervalMonth = parseInt(interval / month, 10);
  searchParams.value.prmMcn = intervalMonth;
  searchParams.value.prmPrd = `${slClYmFrom.substring(0, 4)}-${slClYmFrom.substring(4, 6)} ~ ${slClYmTo.substring(0, 4)}-${slClYmTo.substring(4, 6)}`;
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
  countMonth();
}

</script>
