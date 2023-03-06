<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FED
2. 프로그램 ID : WwfedIndividualFeeManagerMgtM - 개인별 수수료 관리(M조직)
3. 작성자 : min-kyu bae
4. 작성일 : 2023.03.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 개인별 수수료 관리(M조직) 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          required
        >
          <kw-input
            v-model="searchParams.no"
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            icon="search"
            clearable
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <h3>{{ t('MSG_TIT_BIZ_INFO') }}</h3>
      <kw-form
        class="mt20"
        dense
        align-content="right"
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_EMPL_NM')"
            align-content="left"
          >
            <p>{{ info1.col1 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BLG')"
            align-content="center"
          >
            <p>{{ info1.col2 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSB')"
            align-content="left"
          >
            <p>{{ info1.col3 }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_METG')"
            align-content="right"
          >
            <p>{{ info1.col4 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_WELS_MNGER')"
            align-content="center"
          >
            <p>{{ info1.col5 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_QLF')"
            align-content="left"
          >
            <p>{{ info1.col6 }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_BAS_IZ') }}</h3>
        </template>
        <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
      </kw-action-top>
      <kw-form
        dense
        align-content="right"
        :cols="4"
      >
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_ELHM')+t('MSG_TXT_RENTAL')">
            <p>{{ stringUtil.getNumberWithComma(info2.col1) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ELHM')+t('MSG_TXT_SNGL_PMNT')">
            <p>{{ stringUtil.getNumberWithComma(info2.col2) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ELHM')+t('MSG_TXT_FXAM')">
            <p>{{ stringUtil.getNumberWithComma(info2.col3) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ELHM')+t('MSG_TXT_EXCP')+t('MSG_TXT_SNGL_PMNT')">
            <p>{{ stringUtil.getNumberWithComma(info2.col4) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_ELHM')+t('MSG_TXT_EXCP')+t('MSG_TXT_FXAM')">
            <p>{{ stringUtil.getNumberWithComma(info2.col5) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_INDV')+t('MSG_TXT_COUNT')">
            <p>{{ stringUtil.getNumberWithComma(info2.col6) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_ELHM')+t('MSG_TXT_RENTAL')">
            <p>{{ stringUtil.getNumberWithComma(info2.col7) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_ELHM')+t('MSG_TXT_SNGL_PMNT')">
            <p>{{ stringUtil.getNumberWithComma(info2.col8) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_ELHM')+t('MSG_TXT_EXCP')+t('MSG_TXT_SNGL_PMNT')">
            <p>{{ stringUtil.getNumberWithComma(info2.col9) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_COUNT')">
            <p>{{ stringUtil.getNumberWithComma(info2.col10) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_NEW')+t('MSG_TXT_SELL')">
            <p>{{ stringUtil.getNumberWithComma(info2.col11) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_INDV')+t('MSG_TXT_NEW')+t('MSG_TXT_SELL')">
            <p>{{ stringUtil.getNumberWithComma(info2.col12) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="'BS'+t('MSG_TXT_PD_ACC_CNT')">
            <p>{{ stringUtil.getNumberWithComma(info2.col13) }}</p>
          </kw-form-item>
          <kw-form-item :label="'W1'+t('MSG_TXT_COUNT')">
            <p>{{ stringUtil.getNumberWithComma(info2.col14) }}</p>
          </kw-form-item>
          <kw-form-item :label="'W2'+t('MSG_TXT_COUNT')">
            <p>{{ stringUtil.getNumberWithComma(info2.col15) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <kw-action-top>
        <template #left>
          <h3>
            BS{{ t('MSG_TXT_IZ') }}
          </h3>
        </template>
        <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
      </kw-action-top>
      <kw-grid
        ref="grd1MainRef"
        name="grd1Main"
        :visible-rows="10"
        @init="initGrd1Main"
      />
      <kw-action-top class="mb20 mt30">
        <template #left>
          <h3>
            {{ t('MSG_TXT_TOT_SUM') }}
          </h3>
        </template>
        <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
      </kw-action-top>
      <kw-form
        dense
        align-content="right"
      >
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_INTBS_SUM')">
            <p>{{ stringUtil.getNumberWithComma(info3.col1) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_DDTN_SUM')">
            <p>{{ stringUtil.getNumberWithComma(info3.col2) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ACL_DSB_AMT')">
            <p>{{ stringUtil.getNumberWithComma(info3.col3) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <kw-action-top class="mb20">
        <template #left>
          <h3>
            {{ t('MSG_TXT_FEE_IZ') }}
          </h3>
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_FEE_CTR')"
          @click="openFeeControlPopup"
        />
      </kw-action-top>
      <kw-form
        dense
        align-content="right"
        :cols="4"
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_HOME_CARE')"
          >
            <p>{{ stringUtil.getNumberWithComma(info4.col1) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_LIVE_PAKG')"
          >
            <p>{{ stringUtil.getNumberWithComma(info4.col2) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ELHM_PRPN')"
          >
            <p>{{ stringUtil.getNumberWithComma(info4.col3) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ELHM_EXCP_PRPN')"
          >
            <p>{{ stringUtil.getNumberWithComma(info4.col4) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_ELHM_METG')"
          >
            <p>{{ stringUtil.getNumberWithComma(info4.col5) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_SPAY_METG')"
          >
            <p>{{ stringUtil.getNumberWithComma(info4.col6) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ELHM_EXCP_METG')"
          >
            <p>{{ stringUtil.getNumberWithComma(info4.col7) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_SAL_INTV')">
            <p>{{ stringUtil.getNumberWithComma(info4.col8) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_EDUC')">
            <p>{{ stringUtil.getNumberWithComma(info4.col9) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_STMNT')">
            <p>{{ stringUtil.getNumberWithComma(info4.col10) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_MCHN_CH')">
            <p>{{ stringUtil.getNumberWithComma(info4.col11) }}</p>
          </kw-form-item>
          <kw-form-item :label="'BS'+t('MSG_TXT_MGT')">
            <p>{{ stringUtil.getNumberWithComma(info4.col12) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_RGLVL')">
            <p>{{ stringUtil.getNumberWithComma(info4.col13) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_SAL_ICEN_RETR')">
            <p>{{ stringUtil.getNumberWithComma(info4.col14) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ELHM')+t('MSG_TXT_OG')+t('MSG_TXT_PRPN')">
            <p>{{ stringUtil.getNumberWithComma(info4.col15) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ELHM')+t('MSG_TXT_EXCP')+t('MSG_TXT_OG')+t('MSG_TXT_PRPN')">
            <p>{{ stringUtil.getNumberWithComma(info4.col16) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_SELL')+t('MSG_TXT_ENRG')">
            <p>{{ stringUtil.getNumberWithComma(info4.col17) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_NEW')+t('MSG_TXT_SELL')">
            <p>{{ stringUtil.getNumberWithComma(info4.col18) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_MGT')">
            <p>{{ stringUtil.getNumberWithComma(info4.col19) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_EJT')+'1'">
            <p>{{ stringUtil.getNumberWithComma(info4.col20) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_EJT')+'2'">
            <p>{{ stringUtil.getNumberWithComma(info4.col21) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_NB')+t('MSG_TXT_BRANCH')">
            <p>{{ stringUtil.getNumberWithComma(info4.col22) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_MUTU')+t('MSG_TXT_OG')">
            <p>{{ stringUtil.getNumberWithComma(info4.col23) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_MEMBERSHIP')">
            <p>{{ stringUtil.getNumberWithComma(info4.col24) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_ADSB')">
            <p>{{ stringUtil.getNumberWithComma(info4.col25) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ETC_SPPT')">
            <p>{{ stringUtil.getNumberWithComma(info4.col26) }}</p>
          </kw-form-item>
          <kw-form-item :label="'WM'+t('MSG_TXT_CMNC')">
            <p>{{ stringUtil.getNumberWithComma(info4.col27) }}</p>
          </kw-form-item>
          <kw-form-item :label="'WM'+t('MSG_TXT_ETC')">
            <p>{{ stringUtil.getNumberWithComma(info4.col28) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_PRR_VST')">
            <p>{{ stringUtil.getNumberWithComma(info4.col29) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_UNIFORM')">
            <p>{{ stringUtil.getNumberWithComma(info4.col30) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_MAT_HODT')">
            <p>{{ stringUtil.getNumberWithComma(info4.col31) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ADD')+t('MSG_TXT_ENRG')">
            <p>{{ stringUtil.getNumberWithComma(info4.col32) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />
      <kw-action-top class="mb20">
        <template #left>
          <h3>
            {{ t('MSG_TXT_DDTN_IZ') }}
          </h3>
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_BU_DDTN')+t('MSG_BTN_CTR')"
          @click="openBurdenDeductionControlPopup"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_PNPYAM')+t('MSG_BTN_CTR')"
          @click="openPnpyamControlPopup"
        />
      </kw-action-top>
      <kw-form
        dense
        align-content="right"
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_RDS')"
          >
            <p>{{ stringUtil.getNumberWithComma(info5.col1) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ERNTX')"
          >
            <p>{{ stringUtil.getNumberWithComma(info5.col2) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSDNTX')"
          >
            <p>{{ stringUtil.getNumberWithComma(info5.col3) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_HIR_INSR')"
          >
            <p>{{ stringUtil.getNumberWithComma(info5.col4) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BU_DDTN')"
          >
            <p>{{ stringUtil.getNumberWithComma(info5.col5) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_PNPYAM')"
          >
            <p>{{ stringUtil.getNumberWithComma(info5.col6) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>
            {{ t('MSG_TXT_CTR_IZ') }}
          </h3>
        </template>
        <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
      </kw-action-top>
      <kw-grid
        ref="grd2MainRef"
        name="grd2Main"
        :visible-rows="3"
        @init="initGrd2Main"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, stringUtil, modal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grd1MainRef = ref(getComponentType('KwGrid'));
const grd2MainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.format('YYYYMM'),
  no: '',

});

const info1 = ref({
  col1: '',
  col2: '',
  col3: '',
  col4: '',
  col5: '',
  col6: '',
});

const info2 = ref({
  col1: '',
  col2: '',
  col3: '',
  col4: '',
  col5: '',
  col6: '',
  col7: '',
  col8: '',
  col9: '',
  col10: '',
  col11: '',
  col12: '',
  col13: '',
  col14: '',
  col15: '',
});

const info3 = ref({
  col1: '',
  col2: '',
  col3: '',
});

const info4 = ref({
  col1: '',
  col2: '',
  col3: '',
  col4: '',
  col5: '',
  col6: '',
  col7: '',
  col8: '',
  col9: '',
  col10: '',
  col11: '',
  col12: '',
  col13: '',
  col14: '',
  col15: '',
  col16: '',
  col17: '',
  col18: '',
  col19: '',
  col20: '',
  col21: '',
  col22: '',
  col23: '',
  col24: '',
  col25: '',
  col26: '',
  col27: '',
  col28: '',
  col29: '',
  col30: '',
  col31: '',
  col32: '',
});

const info5 = ref({
  col1: '',
  col2: '',
  col3: '',
  col4: '',
  col5: '',
  col6: '',
});

let cachedParams;

/*
 *  Event - 수수료조정 버튼 클릭  ※현재 팝업화면 없음
 */
async function openFeeControlPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openFeeControlPopup',
    componentProps: param,
  });
}

/*
 *  Event - 부담공제조정 버튼 클릭  ※현재 팝업화면 없음
 */
async function openBurdenDeductionControlPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openBurdenDeductionControlPopup',
    componentProps: param,
  });
}

/*
 *  Event - 가지급금조정 버튼 클릭  ※현재 팝업화면 없음
 */
async function openPnpyamControlPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openPnpyamControlPopup',
    componentProps: param,
  });
}
async function fetchData(type) {
  const response = await dataService.get(`/sms/wells/fee/individual-fee-mgts/mnger-${type}`, { params: cachedParams });
  const resData = response.data;
  totalCount.value = resData.length;
  if (type === 'entrepreneur') {
    info1.value = resData;
  } else if (type === 'basic') {
    info2.value = resData;
  } else if (type === 'total-sum') {
    info3.value = resData;
  } else if (type === 'before-services') {
    const bsView = grd1MainRef.value.getView();
    bsView.getDataSource().setRows(resData);
    bsView.resetCurrent();
  } else if (type === 'fee') {
    info4.value = resData;
  } else if (type === 'deduction') {
    info5.value = resData;
  } else if (type === 'control') {
    const controlView = grd2MainRef.value.getView();
    controlView.getDataSource().setRows(resData);
    controlView.resetCurrent();
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('entrepreneur');
  await fetchData('basic');
  await fetchData('before-services');
  await fetchData('total-sum');
  await fetchData('fee');
  await fetchData('deduction');
  await fetchData('control');
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrd1Main(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2', dataType: 'number' },
    { fieldName: 'col3', dataType: 'number' },
    { fieldName: 'col4', dataType: 'number' },
    { fieldName: 'col5', dataType: 'number' },
    { fieldName: 'col6', dataType: 'number' },
    { fieldName: 'col7', dataType: 'number' },
    { fieldName: 'col8', dataType: 'number' },
    { fieldName: 'col9', dataType: 'number' },
  ];
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_PDGRP'), styleName: 'text-center', width: '232', footer: { text: '계', styleName: 'text-center' } },
    { fieldName: 'col2', header: t('MSG_TXT_MGT'), styleName: 'text-right', width: '172', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col3', header: t('MSG_TXT_VST'), styleName: 'text-right', width: '172', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col4', header: t('MSG_TXT_AMT'), styleName: 'text-right', width: '172', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col5', header: t('MSG_TXT_MGT'), styleName: 'text-right', width: '172', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col6', header: t('MSG_TXT_VST'), styleName: 'text-right', width: '172', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col7', header: t('MSG_TXT_AMT'), styleName: 'text-right', width: '172', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col8', header: t('MSG_TXT_SUM'), styleName: 'text-right', width: '172', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col9',
      header: t('MSG_TXT_PROCS_RT'),
      styleName: 'text-right',
      width: '109',
      suffix: '%',
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(grid) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();

          for (let i = 0; i < cnt; i += 1) {
            sum += prod.getValue(i, 'col9');
          }

          return `${sum / cnt}%`;
        },
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true, items: [{ height: 30 }] });

  // multi row header setting
  view.setColumnLayout([
    'col1', // single
    {
      header: t('MSG_TXT_GE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col2', 'col3', 'col4'],
    },
    {
      header: t('MSG_TXT_FXAM'),
      direction: 'horizontal',
      items: ['col5', 'col6', 'col7'],
    },
    'col8',
    'col9',
  ]);
}
function initGrd2Main(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3', dataType: 'number' },
    { fieldName: 'col4', dataType: 'number' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), width: '132', styleName: 'text-left' },
    { fieldName: 'col2', header: t('MSG_TXT_ITEM'), width: '247', styleName: 'text-left' },
    { fieldName: 'col3', header: t('MSG_TXT_CTR_BF'), width: '200', styleName: 'text-right' },
    { fieldName: 'col4', header: t('MSG_TXT_CTR_AF'), width: '200', styleName: 'text-right' },
    { fieldName: 'col5', header: t('MSG_TXT_RSN'), width: '328', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_CTR_DTM'), width: '200', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_CTRR'), width: '161', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  totalCount.value = 10;
}
</script>
