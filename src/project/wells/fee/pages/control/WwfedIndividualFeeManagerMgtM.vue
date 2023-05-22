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
            :on-click-icon="onClickSearchNo"
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
            <p>{{ info1.emplNm }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BLG')"
            align-content="center"
          >
            <p>{{ info1.blg }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSB')"
            align-content="left"
          >
            <p>{{ info1.rsb }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_METG')"
            align-content="right"
          >
            <p>{{ info1.metg }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_WELS_MNGER')"
            align-content="center"
          >
            <p>{{ info1.welsMnger }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_QLF')"
            align-content="left"
          >
            <p>{{ info1.qlf }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_BAS_IZ') }}</h3>
        </template>
        <span class="ml8">({{ $t('MSG_TXT_UNIT_COLON_WON') }})</span>
      </kw-action-top>
      <kw-form
        dense
        align-content="right"
        :cols="4"
      >
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_ELHM')+t('MSG_TXT_RENTAL')">
            <p>{{ stringUtil.getNumberWithComma(info1.elhmRental) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ELHM')+t('MSG_TXT_SNGL_PMNT')">
            <p>{{ stringUtil.getNumberWithComma(info1.elhmSnglPmnt) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ELHM')+t('MSG_TXT_FXAM')">
            <p>{{ stringUtil.getNumberWithComma(info1.elhmFxam) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ELHM')+t('MSG_TXT_EXCP')+t('MSG_TXT_SNGL_PMNT')">
            <p>{{ stringUtil.getNumberWithComma(info1.elhmExcpSnglPmnt) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_ELHM')+t('MSG_TXT_EXCP')+t('MSG_TXT_FXAM')">
            <p>{{ stringUtil.getNumberWithComma(info1.elhmExcpFxam) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_INDV')+t('MSG_TXT_COUNT')">
            <p>{{ stringUtil.getNumberWithComma(info1.indvCount) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_ELHM')+t('MSG_TXT_RENTAL')">
            <p>{{ stringUtil.getNumberWithComma(info1.ogElhmRental) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_ELHM')+t('MSG_TXT_SNGL_PMNT')">
            <p>{{ stringUtil.getNumberWithComma(info1.ogElhmSnglPmnt) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_ELHM')+t('MSG_TXT_EXCP')+t('MSG_TXT_SNGL_PMNT')">
            <p>{{ stringUtil.getNumberWithComma(info1.ogElhmExcpSnglPmnt) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_COUNT')">
            <p>{{ stringUtil.getNumberWithComma(info1.ogCount) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_NEW')+t('MSG_TXT_SELL')">
            <p>{{ stringUtil.getNumberWithComma(info1.ogNewSell) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_INDV')+t('MSG_TXT_NEW')+t('MSG_TXT_SELL')">
            <p>{{ stringUtil.getNumberWithComma(info1.indvNewSell) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="'BS'+t('MSG_TXT_PD_ACC_CNT')">
            <p>{{ stringUtil.getNumberWithComma(info1.bsPdAccCnt) }}</p>
          </kw-form-item>
          <kw-form-item :label="'W1'+t('MSG_TXT_COUNT')">
            <p>{{ stringUtil.getNumberWithComma(info1.w1Count) }}</p>
          </kw-form-item>
          <kw-form-item :label="'W2'+t('MSG_TXT_COUNT')">
            <p>{{ stringUtil.getNumberWithComma(info1.w2Count) }}</p>
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
            <p>{{ stringUtil.getNumberWithComma(info1.intbsSum) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_DDTN_SUM')">
            <p>{{ stringUtil.getNumberWithComma(info1.ddtnSum) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ACL_DSB_AMT')">
            <p>{{ stringUtil.getNumberWithComma(info1.aclDsbAmt) }}</p>
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
            <p>{{ stringUtil.getNumberWithComma(info4.sd49) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_LIVE_PAKG')"
          >
            <p>{{ stringUtil.getNumberWithComma(info4.sd43) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ELHM_PRPN')"
          >
            <p>{{ stringUtil.getNumberWithComma(info4.sd26) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ELHM_EXCP_PRPN')"
          >
            <p>{{ stringUtil.getNumberWithComma(info4.sd29) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_ELHM_METG')"
          >
            <p>{{ stringUtil.getNumberWithComma(info4.md62) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_SPAY_METG')"
          >
            <p>{{ stringUtil.getNumberWithComma(info4.md63) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ELHM_EXCP_METG')"
          >
            <p>{{ stringUtil.getNumberWithComma(info4.md95) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_SAL_INTV')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd17) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_EDUC')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd50) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_STMNT')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd48) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_MCHN_CH')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd04) }}</p>
          </kw-form-item>
          <kw-form-item :label="'BS'+t('MSG_TXT_MGT')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd15) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_RGLVL')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd23) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_SAL_ICEN_RETR')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd42) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ELHM')+t('MSG_TXT_OG')+t('MSG_TXT_PRPN')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd31) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ELHM')+t('MSG_TXT_EXCP')+t('MSG_TXT_OG')+t('MSG_TXT_PRPN')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd34) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_SELL')+t('MSG_TXT_ENRG')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd11) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_NEW')+t('MSG_TXT_SELL')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd08) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_MGT')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd22) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_EJT')+'1'">
            <p>{{ stringUtil.getNumberWithComma(info4.sd13) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_OG')+t('MSG_TXT_EJT')+'2'">
            <p>{{ stringUtil.getNumberWithComma(info4.sd09) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_NB')+t('MSG_TXT_BRANCH')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd36) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_MUTU')+t('MSG_TXT_OG')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd12) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_MEMBERSHIP')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd05) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_ADSB')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd14) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ETC_SPPT')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd39) }}</p>
          </kw-form-item>
          <kw-form-item :label="'WM'+t('MSG_TXT_CMNC')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd18) }}</p>
          </kw-form-item>
          <kw-form-item :label="'WM'+t('MSG_TXT_ETC')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd19) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_PRR_VST')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd40) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_UNIFORM')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd16) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_MAT_HODT')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd10) }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ADD')+t('MSG_TXT_ENRG')">
            <p>{{ stringUtil.getNumberWithComma(info4.sd06) }}</p>
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
            <p>{{ stringUtil.getNumberWithComma(info5.rds) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ERNTX')"
          >
            <p>{{ stringUtil.getNumberWithComma(info5.erntx) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSDNTX')"
          >
            <p>{{ stringUtil.getNumberWithComma(info5.rsdntx) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_HIR_INSR')"
          >
            <p>{{ stringUtil.getNumberWithComma(info5.hirInsr) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BU_DDTN')"
          >
            <p>{{ stringUtil.getNumberWithComma(info5.buDdtn) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_PNPYAM')"
          >
            <p>{{ stringUtil.getNumberWithComma(info5.pnpyam) }}</p>
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
import { useDataService, getComponentType, stringUtil, modal, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

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
  emplNm: '',
  blg: '',
  rsb: '',
  metg: '',
  welsMnger: '',
  qlf: '',
  elhmRental: '',
  elhmSnglPmnt: '',
  elhmFxam: '',
  elhmExcpSnglPmnt: '',
  elhmExcpFxam: '',
  indvCount: '',
  ogElhmRental: '',
  ogElhmSnglPmnt: '',
  ogElhmExcpSnglPmnt: '',
  ogCount: '',
  ogNewSell: '',
  indvNewSell: '',
  bsPdAccCnt: '',
  w1Count: '',
  w2Count: '',
  intbsSum: '',
  ddtnSum: '',
  aclDsbAmt: '',
});

const info4 = ref({
  sd04: '',
  sd05: '',
  sd06: '',
  sd08: '',
  sd09: '',
  sd10: '',
  sd11: '',
  sd12: '',
  sd13: '',
  sd14: '',
  sd15: '',
  sd16: '',
  sd17: '',
  sd18: '',
  sd19: '',
  sd22: '',
  sd23: '',
  sd26: '',
  sd29: '',
  sd31: '',
  sd34: '',
  sd36: '',
  sd39: '',
  sd40: '',
  sd42: '',
  sd43: '',
  sd48: '',
  sd49: '',
  sd50: '',
  md62: '',
  md63: '',
  md95: '',
});

const info5 = ref({
  rds: '',
  erntx: '',
  rsdntx: '',
  hirInsr: '',
  buDdtn: '',
  pnpyam: '',
});

let cachedParams;

/*
 *  Event - 번호 검색 아이콘 클릭 이벤트
 */
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.no,
      ogTpCd: 'W02',
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.no = payload.prtnrNo;
    }
  }
}

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
  const response = await dataService.get(`/sms/wells/fee/individual-fee/mnger-${type}`, { params: cachedParams });
  const resData = response.data;
  totalCount.value = resData.length;
  if (type === 'entrepreneur') {
    info1.value = resData;
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
  await fetchData('before-services');
  await fetchData('fee');
  await fetchData('deduction');
  await fetchData('control');
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cdNm' },
    { fieldName: 'cnt1', dataType: 'number' },
    { fieldName: 'cnt2', dataType: 'number' },
    { fieldName: 'amt1', dataType: 'number' },
    { fieldName: 'cnt3', dataType: 'number' },
    { fieldName: 'cnt4', dataType: 'number' },
    { fieldName: 'amt2', dataType: 'number' },
    { fieldName: 'sumAmt', dataType: 'number' },
    { fieldName: 'cntRat', dataType: 'number' },
  ];
  const columns = [
    { fieldName: 'cdNm', header: t('MSG_TXT_PDGRP'), styleName: 'text-center', width: '232', footer: { text: '계', styleName: 'text-center' } },
    { fieldName: 'cnt1', header: t('MSG_TXT_MGT'), styleName: 'text-right', width: '172', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'cnt2', header: t('MSG_TXT_VST'), styleName: 'text-right', width: '172', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'amt1', header: t('MSG_TXT_AMT'), styleName: 'text-right', width: '172', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'cnt3', header: t('MSG_TXT_MGT'), styleName: 'text-right', width: '172', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'cnt4', header: t('MSG_TXT_VST'), styleName: 'text-right', width: '172', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'amt2', header: t('MSG_TXT_AMT'), styleName: 'text-right', width: '172', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'sumAmt', header: t('MSG_TXT_SUM'), styleName: 'text-right', width: '172', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'cntRat',
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
            sum += prod.getValue(i, 'cntRat');
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
    'cdNm', // single
    {
      header: t('MSG_TXT_GE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['cnt1', 'cnt2', 'amt1'],
    },
    {
      header: t('MSG_TXT_FXAM'),
      direction: 'horizontal',
      items: ['cnt3', 'cnt4', 'amt2'],
    },
    'sumAmt',
    'cntRat',
  ]);
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'div' },
    { fieldName: 'item' },
    { fieldName: 'ctrBf', dataType: 'number' },
    { fieldName: 'ctrAf', dataType: 'number' },
    { fieldName: 'rsn' },
    { fieldName: 'ctrDtm' },
    { fieldName: 'ctrr' },
  ];

  const columns = [
    { fieldName: 'div', header: t('MSG_TXT_DIV'), width: '132', styleName: 'text-left' },
    { fieldName: 'item', header: t('MSG_TXT_ITEM'), width: '247', styleName: 'text-left' },
    { fieldName: 'ctrBf', header: t('MSG_TXT_CTR_BF'), width: '200', styleName: 'text-right' },
    { fieldName: 'ctrAf', header: t('MSG_TXT_CTR_AF'), width: '200', styleName: 'text-right' },
    { fieldName: 'rsn', header: t('MSG_TXT_RSN'), width: '328', styleName: 'text-left' },
    { fieldName: 'ctrDtm', header: t('MSG_TXT_CTR_DTM'), width: '200', styleName: 'text-center' },
    { fieldName: 'ctrr', header: t('MSG_TXT_CTRR'), width: '161', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
