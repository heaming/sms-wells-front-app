<!----
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccSalesBondAnticipationMOverduePenalty - 매출채권/선수금 현황 - 영업선수금 // W-CL-U-0058M01

3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.03.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매출채권/선수금 현황 - 영업선수금 프로그램
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="3"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_BASE_YM')">
        <kw-date-picker
          v-model="searchParams.perfYm"
          type="month"
          rules="date_range_months:1"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_AGRG_DV')">
        <kw-option-group
          v-model="searchParams.agrgDv"
          type="radio"
          :options="selectAgrgDv.options"
          @change="onChangeAgrgDv"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_TASK_DIV')">
        <kw-select
          v-model="searchParams.sellTpCd"
          :options="codes.SELL_TP_CD"
          @change="onChangeBusinessDivide"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row
      cols="4"
    >
      <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
        <kw-select
          v-model="searchParams.sellTpDtlCd"
          :options="filterCds.sellTpDtlCd"
          :disable="isSelectDisable"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SEL_CHNL')">
        <kw-select
          v-model="searchParams.sellChnlDtl"
          :options="codes.SELL_CHNL_DTL_CD"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
        <kw-input
          v-model.trim="searchParams.cntr"
          icon="search_24"
          :disable="isDisable"
          @click-icon="onClickIcon"
        />
      </kw-search-item>
      <kw-search-item
        v-show="isShow"
        :label="$t('MSG_TXT_P_INQR')"
      >
        <kw-option-group
          v-model="searchParams.mlgBtdPrpdAmt"
          type="checkbox"
          :options="[$t('MSG_TXT_P_ATAM_DTL')]"
          @change="onChangePointAnticipation"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalCount" />
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        icon="report"
        dense
        secondary
        :label="$t('MSG_TXT_RPT_BRWS')"
        @click="onClickOpenReport"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        icon="download_on"
        :disable="totalCount === 0"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      v-show="isGridMain"
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="10"
      @init="initGrdMain"
    />
    <kw-grid
      v-show="isGridSub"
      ref="grdSubRef"
      name="grdSub"
      :visible-rows="10"
      @init="initGrdSub"
    />
    <kw-grid
      v-show="isGridThird"
      ref="grdThirdRef"
      name="grdThird"
      :visible-rows="10"
      @init="initGrdThird"
    />
    <kw-grid
      v-show="isGridFourth"
      ref="grdFourthRef"
      name="grdFourth"
      :visible-rows="10"
      @init="initGrdFourth"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, defineGrid, gridUtil, useDataService, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { modal } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const totalCount = ref(0);
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const grdThirdRef = ref(getComponentType('KwGrid'));
const grdFourthRef = ref(getComponentType('KwGrid'));

const isShow = ref(false);
const isDisable = ref(false);
const isSelectDisable = ref(true);
const isGridMain = ref(true);
const isGridSub = ref(false);
const isGridThird = ref(false);
const isGridFourth = ref(false);

const searchParams = ref({
  perfYm: dayjs().add(-1, 'M').format('YYYYMM'),
  agrgDv: '1', // 집계구분
  sellTpCd: '1', // 업무구분
  sellTpDtlCd: '', // 판매유형
  sellChnlDtl: '1',
  mlgBtdPrpdAmt: false,
  cntr: '',
});

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD', // 업무구분
  // 'PD_DTL_CD', 없음
  'SELL_TP_DTL_CD', // 판매유형
  'SELL_CHNL_DTL_CD', // 판매채널
);

let cachedParams;
async function fetchData() {
  const { agrgDv } = searchParams.value;
  let res;
  if (agrgDv === '1') {
    res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/aggregate', { params: cachedParams });
  } else if (agrgDv === '2') {
    res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/dates', { params: cachedParams });
  } else if (agrgDv === '3') {
    res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/orders', { params: cachedParams });
  } else if (agrgDv === '4') {
    res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/members', { params: cachedParams });
  }
  const dataList = res.data;
  totalCount.value = dataList.length;

  let mainView;
  if (isGridMain.value === true) {
    mainView = grdMainRef.value.getView();
  } else if (isGridSub.value === true) {
    mainView = grdSubRef.value.getView();
  } else if (isGridThird.value === true) {
    mainView = grdThirdRef.value.getView();
  } else if (isGridFourth.value === true) {
    mainView = grdFourthRef.value.getView();
  }

  mainView.getDataSource().setRows(dataList);
  mainView.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickIcon() {
  const { dtlCntr } = searchParams.value;
  const res = await modal({
    component: 'WwctaContractNumberListP',
    componentProps: { dtlCntr },
  });

  if (res.result) {
    // res.result
  }
}

async function onChangeChechOption() {
  const { agrgDv } = searchParams.value; // 집계구분
  const { sellTpCd } = searchParams.value; // 업무구분
  // const { mlgBtdPrpdAmt } = searchParams.value; // 포인트 조회

  isGridMain.value = false;
  isGridSub.value = false;
  isGridThird.value = false;
  isGridFourth.value = false;

  if (sellTpCd === '5' || sellTpCd === '6') {
    isShow.value = true;
  } else {
    isShow.value = false;
  }

  if (agrgDv === '3') {
    isDisable.value = false;
  } else {
    isDisable.value = true;
  }

  if (agrgDv === '1' || agrgDv === '2') {
    if (agrgDv === '1' && (sellTpCd === '5' || sellTpCd === '6')) {
      searchParams.value.mlgBtdPrpdAmt = false;
      isGridThird.value = true;
    } else {
      isGridMain.value = true;
    }
  } else if (agrgDv === '3') {
    if (sellTpCd === '1' || sellTpCd === '2' || sellTpCd === '3' || sellTpCd === '4') {
      isGridSub.value = true;
    } else if (sellTpCd === '5' || sellTpCd === '6') {
      searchParams.value.mlgBtdPrpdAmt = true;
      isGridFourth.value = true;
    }
  } else if (agrgDv === '4') {
    isGridSub.value = true;
  }
}

async function onClickExcelDownload() {
  let view;
  if (isGridMain.value === true) {
    view = grdMainRef.value.getView();
  } else if (isGridSub.value === true) {
    view = grdMainRef.value.getView();
  } else if (isGridThird.value === true) {
    view = grdMainRef.value.getView();
  } else if (isGridFourth.value === true) {
    view = grdMainRef.value.getView();
  }

  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TIT_SL_BND_ATAM_PS')} - ${t('MSG_TIT_BZNS_ATAM')}`,
    timePostfix: true,
  });
}

async function onChangeAgrgDv() {
  onChangeChechOption();
}

async function onChangePointAnticipation() {
  // const { agrgDv } = searchParams.value; // 집계구분
  const { mlgBtdPrpdAmt } = searchParams.value;

  if (mlgBtdPrpdAmt === true) {
    searchParams.value.agrgDv = '3';
    isGridFourth.value = true;
  } else {
    searchParams.value.agrgDv = '1';
    isGridThird.value = true;
  }
  onChangeChechOption();
}

const filterCds = ref({
  sellTpDtlCd: [],
});
async function onChangeBusinessDivide() {
  onChangeChechOption();

  const { sellTpCd } = searchParams.value;
  if (sellTpCd === '3' || sellTpCd === '5') {
    isSelectDisable.value = false;
  } else {
    isSelectDisable.value = true;
  }

  codes.SELL_TP_DTL_CD.forEach((e) => {
    if (sellTpCd === '2') {
      if (e.codeId === '1' || e.codeId === '2' || sellTpCd === '3' || sellTpCd === '4') {
        filterCds.value.sellTpDtlCd.push({
          codeId: e.codeId.trim(),
          codeName: e.codeName.trim(),
        });
      }
    } else if (sellTpCd === '5' || sellTpCd === '6') {
      filterCds.value.sellTpDtlCd.push({
        codeId: e.codeId.trim(),
        codeName: e.codeName.trim(),
      });
    }
  });
}

async function onClickOpenReport() {
  // 공통 오즈 팝업 가져오면됨
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
// getSalesBondAtamAggregateList (집계)
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'perfYm' },
    { fieldName: 'perfDt' },
    { fieldName: 'sellChnlCd' },
    { fieldName: 'rveAmt', dataType: 'number' },
    { fieldName: 'thmAtamDpAmt', dataType: 'number' },
    { fieldName: 'thmAtamRfndAmt', dataType: 'number' },
    { fieldName: 'thmAtamSum', dataType: 'number' },
    { fieldName: 'slBndAlrpyAmt', dataType: 'number' },
    { fieldName: 'col11' },
    { fieldName: 'slCtrAmt', dataType: 'number' },
    { fieldName: 'bznsAtamBlam', dataType: 'number' },
    { fieldName: 'eotAtam', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'perfYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '130',
      styleName: 'text-left',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    }, // 실적년월
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), width: '130', styleName: 'text-center' }, // 실적일자
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_CHNL'), width: '130', styleName: 'text-center' }, // 판매채널
    { fieldName: 'rveAmt',
      header: t('MSG_TXT_BTD_BZNS_ATAM'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    }, // 기초 영업선수금
    { fieldName: 'thmAtamDpAmt',
      header: t('MSG_TXT_DP'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 입금
    { fieldName: 'thmAtamRfndAmt',
      header: t('MSG_TXT_RFND'),
      width: '180',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 환불
    { fieldName: 'thmAtamSum',
      header: t('MSG_TXT_SUM'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 합계
    { fieldName: 'slBndAlrpyAmt',
      header: `(-) ${t('MSG_TXT_SL_CPRCNF')}`,
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // (-) 매출대사
    { fieldName: 'col11',
      header: `(-) ${t('MSG_TXT_CCAM')}`,
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // (-) 위약금
    { fieldName: 'slCtrAmt',
      header: `(-) ${t('MSG_TXT_CTR_AMT')}`,
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // (+) 조정금액
    { fieldName: 'bznsAtamBlam',
      header: `(+) ${t('MSG_TXT_PTYPF')}`,
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // (-) 잡이익
    { fieldName: 'eotAtam',
      header: t('MSG_TXT_EOT_BZNS_ATAM'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 기말 영업선수금
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 3 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  view.setColumnLayout([
    'perfYm',
    'perfDt',
    'sellChnlCd',
    'rveAmt',
    {
      header: `(+)${t('MSG_TXT_BZNS_ATAM_DP_IZ')}`, // (+) 영업선수금 입금내역
      direction: 'horizontal',
      items: ['thmAtamDpAmt', 'thmAtamRfndAmt', 'thmAtamSum'],
    },

    'slBndAlrpyAmt',
    'col11',
    'slCtrAmt',
    'bznsAtamBlam',
    'eotAtam',
  ]);
});

// getSalesBondAtamDateList (일자별)
const initGrdSub = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'perfYm' },
    { fieldName: 'sellChnlCd' },
    { fieldName: 'cntr' },
    { fieldName: 'cstKnm' },
    { fieldName: 'pdCd' },
    { fieldName: 'rveAmt', dataType: 'number' },
    { fieldName: 'thmAtamDpAmt', dataType: 'number' },
    { fieldName: 'thmAtamRfndAmt', dataType: 'number' },
    { fieldName: 'thmAtamSum', dataType: 'number' },
    { fieldName: 'slBndAlrpyAmt', dataType: 'number' },
    { fieldName: 'col11' },
    { fieldName: 'slCtrAmt', dataType: 'number' },
    { fieldName: 'bznsAtamBlam', dataType: 'number' },
    { fieldName: 'eotAtam', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'perfYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '150',
      styleName: 'text-left',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    }, // 실적년월
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_CHNL'), width: '130', styleName: 'text-left' }, // 판매채널
    { fieldName: 'cntr', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-left' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center' }, // 고객명
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-center' }, // 상품명
    { fieldName: 'rveAmt',
      header: t('MSG_TXT_BTD_BZNS_ATAM'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 기초 영업선수금
    { fieldName: 'thmAtamDpAmt',
      header: t('MSG_TXT_DP'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 입금
    { fieldName: 'thmAtamRfndAmt',
      header: t('MSG_TXT_RFND'),
      width: '180',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 환불
    { fieldName: 'thmAtamSum',
      header: t('MSG_TXT_SUM'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 합계
    { fieldName: 'slBndAlrpyAmt',
      header: `(-) ${t('MSG_TXT_SL_CPRCNF')}`,
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // (-) 매출대사
    { fieldName: 'col11',
      header: `(-) ${t('MSG_TXT_CCAM')}`,
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // (-) 위약금
    { fieldName: 'slCtrAmt',
      header: `(+) ${t('MSG_TXT_CTR_AMT')}`,
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // (+) 조정금액
    { fieldName: 'bznsAtamBlam',
      header: `(-) ${t('MSG_TXT_PTYPF')}`,
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // (-) 잡이익
    { fieldName: 'eotAtam',
      header: t('MSG_TXT_EOT_BZNS_ATAM'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 기말 영업선수금
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 5 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  view.setColumnLayout([
    'perfYm',
    'sellChnlCd',
    'cntr',
    'cstKnm',
    'pdCd',
    'rveAmt',
    {
      header: `(+)${t('MSG_TXT_BZNS_ATAM_DP_IZ')}`, // (+) 영업선수금 입금내역
      direction: 'horizontal',
      items: ['thmAtamDpAmt', 'thmAtamRfndAmt', 'thmAtamSum'],
    },
    'slBndAlrpyAmt',
    'col11',
    'slCtrAmt',
    'bznsAtamBlam',
    'eotAtam',
  ]);
});

// getSalesBondAtamOrderList (주문별)
const initGrdThird = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'perfYm' },
    { fieldName: 'sellChnlCd' },
    { fieldName: 'mlgBtdPrpdAmt', dataType: 'number' },
    { fieldName: 'mlgDpAmt', dataType: 'number' },
    { fieldName: 'mlgRfndAmt', dataType: 'number' },
    { fieldName: 'mlgAmtSum', dataType: 'number' },
    { fieldName: 'mlgSlAmt', dataType: 'number' },
    { fieldName: 'mlgEotPrpdAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'perfYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '150',
      styleName: 'text-left',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } }, // 실적년월
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_CHNL'), width: '130', styleName: 'text-left' }, // 판매채널
    { fieldName: 'mlgBtdPrpdAmt',
      header: t('MSG_TXT_BTD_AMT'),
      width: '130',
      styleName: 'text-left',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 기초금액
    { fieldName: 'mlgDpAmt',
      header: t('MSG_TXT_PRPD_DP_AMT'),
      width: '130',
      styleName: 'text-center',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 선수입금
    { fieldName: 'mlgRfndAmt',
      header: t('MSG_TXT_PRPD_RFND'),
      width: '130',
      styleName: 'text-center',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 선수환불
    { fieldName: 'mlgAmtSum',
      header: t('MSG_TXT_SUM'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 합계
    { fieldName: 'mlgSlAmt',
      header: t('MSG_TXT_RENTAL_SL'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 렌탈매출
    { fieldName: 'mlgEotPrpdAmt',
      header: t('MSG_TXT_SUM'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 합계
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 2 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  view.setColumnLayout([
    'perfYm',
    'sellChnlCd',
    'mlgBtdPrpdAmt',
    {
      header: t('MSG_TXT_DP_IZ'), // 입금내역
      direction: 'horizontal',
      items: ['mlgDpAmt', 'mlgRfndAmt', 'mlgAmtSum'],
    },
    {
      header: t('MSG_TXT_SL_IZ'), // 매출내역
      direction: 'horizontal',
      items: ['mlgSlAmt'],
    },
    {
      header: t('MSG_TXT_EOT_BLAM'), // 기말잔액
      direction: 'horizontal',
      items: ['mlgEotPrpdAmt'],
    },
  ]);
});

// getSalesBondAtamMemberList (가로계산식 틀린 회원)
const initGrdFourth = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'perfYm' },
    { fieldName: 'sellChnlCd' },
    { fieldName: 'cstKnm' },
    { fieldName: 'cntr' },
    { fieldName: 'slDt' },
    { fieldName: 'mlgBtdPrpdAmt' },
    { fieldName: 'mlgDpAmt1', dataType: 'number' },
    { fieldName: 'mlgDpAmt2', dataType: 'number' },
    { fieldName: 'etcAmt', dataType: 'number' },
    { fieldName: 'mlgSlAmt1', dataType: 'number' },
    { fieldName: 'mlgSlAmt2', dataType: 'number' },
    { fieldName: 'mlgAmt', dataType: 'number' },
    { fieldName: 'mlgEotPrpdAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'perfYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '150',
      styleName: 'text-left',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    }, // 실적년월
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_CHNL'), width: '130', styleName: 'text-left' }, // 판매채널
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center' }, // 고객명
    { fieldName: 'cntr', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '150', styleName: 'text-right' }, // 매출일자
    { fieldName: 'mlgBtdPrpdAmt', header: t('MSG_TXT_BTD_AMT'), width: '150', styleName: 'text-right' }, // 기초금액
    { fieldName: 'mlgDpAmt1',
      header: t('MSG_TXT_RECAP_DP'),
      width: '180',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 유상입금
    { fieldName: 'mlgDpAmt2',
      header: t('MSG_TXT_FRISU_DP'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 무상입금
    { fieldName: 'etcAmt',
      header: t('MSG_TXT_ETC_DP'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 기타입금
    { fieldName: 'mlgSlAmt1',
      header: t('MSG_TXT_RECAP_SL'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 유상매출
    { fieldName: 'mlgSlAmt2',
      header: t('MSG_TXT_FRISU_SL'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 무상매출
    { fieldName: 'mlgAmt',
      header: t('MSG_TXT_ETC_SL'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 기타매출
    { fieldName: 'mlgEotPrpdAmt',
      header: t('MSG_TXT_EOT_BLAM'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 기말잔액
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 6 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  view.setColumnLayout([
    'perfYm',
    'sellChnlCd',
    'cstKnm',
    'cntr',
    'slDt',
    'mlgBtdPrpdAmt',
    {
      header: t('MSG_TXT_DP_IZ'), // 입금내역
      direction: 'horizontal',
      items: ['mlgDpAmt1', 'mlgDpAmt2', 'etcAmt'],
    },
    {
      header: t('MSG_TXT_SL_IZ'), // 매출내역
      direction: 'horizontal',
      items: ['mlgSlAmt1', 'mlgSlAmt2', 'mlgAmt'],
    },
    'mlgEotPrpdAmt',
  ]);
});

const selectAgrgDv = { // 집계구분 -TODO.공통코드가 없는 관계로 임시로
  options: [{ codeId: '1', codeName: '집계' }, { codeId: '2', codeName: '일자별' }, { codeId: '3', codeName: '주문별' }, { codeId: '4', codeName: '가로계산식 틀린 회원' }],
};
</script>
