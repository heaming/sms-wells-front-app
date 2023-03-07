<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEE
2. 프로그램 ID : WwfedIndividualFeePlannerMgtM - 수수료 개인별 상세조회 (P조직 수수료 생성관리)
3. 작성자 : gs.piit150
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 개인별 상세조회 (P조직 수수료 생성관리) 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
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
            :on-click-icon="onClickSearchNo"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_BASIC_INFO') }}</h3>
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="$t('MSG_BTN_DSB_SPCSH_PRNT')"
          @click="openReportPopup"
        />
      </kw-action-top>
      <kw-form
        :cols="5"
        dense
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_PERF_YM')"
            align-content="center"
          >
            <p>{{ info.col1 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BLG')"
            align-content="center"
          >
            <p>{{ info.col2 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_SEQUENCE_NUMBER')"
            align-content="right"
          >
            <p>{{ info.col3 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSB')"
            align-content="center"
          >
            <p>{{ info.col4 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_EMPL_NM')"
            align-content="left"
          >
            <p>{{ info.col5 }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_FEE_SUM')"
            align-content="right"
          >
            <p>{{ stringUtil.getNumberWithComma(info.col6) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DDTN_SUM')"
            align-content="left"
          >
            <p>{{ stringUtil.getNumberWithComma(info.col7) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ACL_DSB')"
            align-content="left"
          >
            <p>{{ stringUtil.getNumberWithComma(info.col8) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DSB_BNK')"
            align-content="right"
          >
            <p>{{ info.col9 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DSB_AC')"
            align-content="right"
          >
            <p>{{ info.col10 }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_SELL_ETC_IZ') }}</h3>
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_PERF_DTL')"
          @click="openPerformancePopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grd1MainRef"
        name="grd1Main"
        :visible-rows="2"
        @init="initGrd1Main"
      />
      <kw-action-top class="mt30">
        <template #left>
          <h3>{{ t('MSG_TXT_FEE_IZ') }}</h3>
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_ADSB')"
          @click="openAgainDisbursementPopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grd2MainRef"
        name="grd2Main"
        :visible-rows="5"
        @init="initGrd2Main"
      />
      <kw-action-top class="mt30">
        <template #left>
          <h3>{{ t('MSG_TXT_DDTN_IZ') }}</h3>
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_BU_DDTN')"
          @click="openBurdenDeductionPopup"
        />
      </kw-action-top>
      <kw-form
        :cols="4"
        align-content="left"
        dense
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_ERNTX')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.col1) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSDNTX')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.col2) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RDS')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.col3) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_HIR_INSR')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.col4) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_INDD_INSR')">
            <p>{{ stringUtil.getNumberWithComma(info2.col5) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BU_DDTN')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.col6) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_REDF')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.col7) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DLQ')+t('MSG_TXT_REDF')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.col8) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_PNPYAM_DTLP_IZ') }}</h3>
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_REDF')"
          @click="openRedemptionOfFeePopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grd3MainRef"
        name="grd3Main"
        :visible-rows="2"
        @init="initGrd3Main"
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

import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();

const props = defineProps({
  perfYm: {
    type: String,
    required: true,
  },
  partnerNo: {
    type: String,
    required: true,
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grd1MainRef = ref(getComponentType('KwGrid'));
const grd2MainRef = ref(getComponentType('KwGrid'));
const grd3MainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.format('YYYYMM'),
  no: '',
  prPerfYm: props.perfYm,
  prpartnerNo: props.partnerNo,

});

const info = ref({
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
});
const { prPerfYm } = searchParams.value;
const { prpartnerNo } = searchParams.value;

let cachedParams;

/*
 *  Event - 번호 검색 아이콘 클릭 이벤트 ※현재 팝업화면 없음
 */
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogcPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.no,
    },
  });

  if (result) {
    searchParams.value.no = payload.prtnrNo;
  }
}

/*
 *  Event - 지급명세서 출력 버튼 클릭  ※현재 팝업화면 없음
 */
async function openReportPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openReportPopup',
    componentProps: param,
  });
}

/*
 *  Event - 실적상세 버튼 클릭  ※현재 팝업화면 없음
 */
async function openPerformancePopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openPerformancePopup',
    componentProps: param,
  });
}
/*
 *  Event - 재지급 버튼 클릭  ※현재 팝업화면 없음
 */
async function openAgainDisbursementPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openAgainDisbursementPopup',
    componentProps: param,
  });
}
/*
 *  Event - 부담공제 버튼 클릭  ※현재 팝업화면 없음
 */
async function openBurdenDeductionPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openBurdenDeductionPopup',
    componentProps: param,
  });
}
/*
 *  Event - 되물림 버튼 클릭  ※현재 팝업화면 없음
 */
async function openRedemptionOfFeePopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openRedemptionOfFeePopup',
    componentProps: param,
  });
}

async function fetchData(type) {
  const response = await dataService.get(`/sms/wells/fee/individual-fees/plar-${type}`, { params: cachedParams });
  const resData = response.data;
  totalCount.value = resData.length;
  if (type === 'informations') {
    info.value = resData;
  } else if (type === 'etcs') {
    const etcView = grd1MainRef.value.getView();
    etcView.getDataSource().setRows(resData);
    etcView.resetCurrent();
  } else if (type === 'fees') {
    const feeView = grd2MainRef.value.getView();
    feeView.getDataSource().setRows(resData);
    feeView.resetCurrent();
  } else if (type === 'deductions') {
    info2.value = resData;
  } else if (type === 'pnpyam') {
    const pnpyamView = grd3MainRef.value.getView();
    pnpyamView.getDataSource().setRows(resData);
    pnpyamView.resetCurrent();
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('informations');
  await fetchData('etcs');
  await fetchData('fees');
  await fetchData('deductions');
  await fetchData('pnpyam');
}

if (!isEmpty(prPerfYm) && !isEmpty(prpartnerNo)) {
  searchParams.value.perfYm = prPerfYm;
  searchParams.value.no = prpartnerNo;
  onClickSearch();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrd1Main(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), width: '167', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '456', styleName: 'text-right' },
    { fieldName: 'col3', header: t('MSG_TXT_BFSVC_ACKMT_CT'), width: '456', styleName: 'text-right' },
    { fieldName: 'col4', header: `${t('MSG_TXT_CHNG')}1`, width: '458', styleName: 'text-right' },
    { fieldName: 'col5', header: `BS${t('MSG_TXT_FHS_CT')}`, width: '458', styleName: 'text-right' },
    { fieldName: 'col6', header: t('MSG_TXT_METG_PRSC_D'), width: '458', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  // multi row header setting
  view.setColumnLayout([
    'col1',
    {
      header: t('MSG_TXT_SELL'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col2', 'col3', 'col4', 'col5'],
    },
    {
      header: t('MSG_TXT_ETC'),
      direction: 'horizontal',
      items: ['col6'],
    },

  ]);
}
function initGrd2Main(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2', dataType: 'number' },
    { fieldName: 'col3' },
    { fieldName: 'col4', dataType: 'number' },
    { fieldName: 'col5' },
    { fieldName: 'col6', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'col2', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col3', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'col4', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col5', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'col6', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.setFooters({ visible: true, items: [{ height: 30 }] });

  // multi row header setting
  view.setColumnLayout([

    {
      header: t('MSG_TXT_WELS_MNGER') + t('MSG_TXT_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col1', 'col2'],
    },
    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['col3', 'col4'],
    },
    {
      header: t('MSG_TXT_OG') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['col5', 'col6'],
    },

  ]);
}

function initGrd3Main(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2', dataType: 'number' },
    { fieldName: 'col3', dataType: 'number' },
    { fieldName: 'col4', dataType: 'number' },
    { fieldName: 'col5', dataType: 'number' },
    { fieldName: 'col6', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_ITEM'), width: '167', styleName: 'text-left', footer: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'col2', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_BLAM'), width: '274', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col3', header: t('MSG_TXT_THM_OC'), width: '274', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col4', header: t('MSG_TXT_THM') + t('MSG_TXT_SUM'), width: '275', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col5', header: t('MSG_TXT_THM_DDTN'), width: '274', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col6', header: t('MSG_TXT_THM_BLAM'), width: '274', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true, items: [{ height: 30 }] });

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column
}
</script>

<style scoped>
</style>
