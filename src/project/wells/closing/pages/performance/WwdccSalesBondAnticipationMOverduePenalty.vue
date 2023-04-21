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
          v-model="searchParams.slClYm"
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
    </kw-search-row>
    <kw-search-row
      cols="3"
    >
      <kw-search-item :label="$t('MSG_TXT_SAP_PD_DV_CD_NM')">
        <kw-select
          v-model="searchParams.sapPdDvCd"
          :options="sapPdDv"
          option-value="sapPdDvCd"
          option-label="sapPdDvNm"
        /><!--판매유형-->
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
        <kw-select
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_CD.filter((v) => codeId === '1' || codeId === '2'
            || codeId === '3' || codeId === '6')"
          first-option="all"
        />
        <kw-select
          v-if="searchParams.sellTpDtlCd === '1'"
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => codeId === '11' || codeId === '12' || codeId === '13')"
        />
        <kw-select
          v-if="searchParams.sellTpDtlCd === '2'"
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => codeId === '21' || codeId === '22' ||
            codeId === '24' || codeId === '25')"
        />
        <kw-select
          v-if="searchParams.sellTpDtlCd === '3'"
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => codeId === '31' || codeId === '32'
            || codeId === '33' || codeId === '34')"
        />
        <kw-select
          v-if="searchParams.sellTpDtlCd === '6'"
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => codeId === '61' || codeId === '62' || codeId === '63')"
        />
      </kw-search-item><!--판매유형상세-->
      <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
        <kw-option-group
          v-model="searchParams.inquiryDivide"
          :options="inquiryDivideCode"
          type="radio"
          @change="onChangeInquiryDivide"
        /><!--조회구분-->
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
        <kw-input
          v-model.trim="searchParams.cntr"
          icon="search_24"
          :disable="isDisable"
          @click-icon="onClickIcon"
        /><!-- 계약 상세 -->
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SEL_CHNL')">
        <kw-select
          v-model="searchParams.sellChnlDtl"
          :options="codes.SELL_CHNL_DTL_CD"
        />
      </kw-search-item><!-- 판매 채널 -->
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
import { getInquiryDivide } from '~/modules/sms-common/closing/utils/clUtil';

const dataService = useDataService();
const { t } = useI18n();
const { modal } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// 검색조건 - 판매채널
const sapPdDv = (await dataService.get('/sms/wells/closing/performance/overdue-penalty/code'))
  .data.map((v) => ({ codeId: v.sapPdDvCd, codeName: v.sapPdDvNm }));
const inquiryDivideCode = await getInquiryDivide();
const totalCount = ref(0);
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const grdThirdRef = ref(getComponentType('KwGrid'));
const grdFourthRef = ref(getComponentType('KwGrid'));

const isShow = ref(false);
const isDisable = ref(false);
const isGridMain = ref(true);
const isGridSub = ref(false);
const isGridThird = ref(false);
const isGridFourth = ref(false);

const searchParams = ref({
  slClYm: dayjs().add(-1, 'M').format('YYYYMM'),
  agrgDv: '1', // 집계구분
  sellTpCd: '1', // 업무구분
  sellTpDtlCd: '', // 판매유형
  sellChnlDtl: '1',
  cntr: '',
  inquiryDivide: '1', // 조회구분
  sapBzReryCd: '', // SAP상품구분코드
});

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD', // 판매유형
  // 'PD_DTL_CD', 없음
  'SELL_TP_DTL_CD', // 판매유형상세코드
  'SELL_CHNL_DTL_CD', // 판매채널
);

let cachedParams;
async function fetchData() {
  const { agrgDv } = searchParams.value;
  let res;
  let mainView;

  if (isGridMain.value === true) {
    mainView = grdMainRef.value.getView();
    if (agrgDv === '1') {
      res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/mainAggregate', { params: cachedParams });
    } else {
      res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/mainDates', { params: cachedParams });
    }
  } else if (isGridSub.value === true) {
    mainView = grdSubRef.value.getView();
    res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/subOrder', { params: cachedParams });
  } else if (isGridThird.value === true) {
    mainView = grdThirdRef.value.getView();
    res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/thirdAggregate', { params: cachedParams });
  } else if (isGridFourth.value === true) {
    mainView = grdFourthRef.value.getView();
    res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/fourthOrder', { params: cachedParams });
  }

  const overduePenalty = res.data;
  totalCount.value = overduePenalty.length;

  mainView.getDataSource().setRows(overduePenalty);
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
  const { inquiryDivide } = searchParams.value; // 포인트 조회
  const mainView = grdMainRef.value.getView();

  isGridMain.value = false;
  isGridSub.value = false;
  isGridThird.value = false;
  isGridFourth.value = false;
  debugger;
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
    if (agrgDv === '1' && inquiryDivide === '2') {
      isGridThird.value = true;
    } else {
      isGridMain.value = true;
      if (agrgDv === '1') {
        mainView.columnByName('perfDt').visible = false;
        mainView.columnByName('slClYm').visible = true;
      } else if (agrgDv === '2') {
        mainView.columnByName('slClYm').visible = false;
        mainView.columnByName('perfDt').visible = true;
      }
    }
  } else if (agrgDv === '3') {
    if (sellTpCd === '1' || sellTpCd === '2' || sellTpCd === '3' || sellTpCd === '4') {
      isGridSub.value = true;
    } else if (inquiryDivide === '2') {
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

async function onChangeInquiryDivide() {
  onChangeChechOption();
}

async function onClickOpenReport() {
  // 공통 오즈 팝업 가져오면됨
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
// getSalesBondAtamAggregateList (첫번째 그리드 집계, 일자별)
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slClYm',
      width: '130',
      header: t('MSG_TXT_PERF_YM'),
      headerSummary: {
        styleName: 'text-center',
      },
      datetimeFormat: 'datetime',
    }, // 실적년월
    { fieldName: 'perfDt',
      header: t('MSG_TXT_PERF_DT'),
      styleName: 'text-center',
      width: '130',
      headerSummary: {
        text: t('MSG_TXT_PERF_DT'),
        styleName: 'text-center',
      },
      datetimeFormat: 'datetime',
    }, // 실적일자
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      width: '130',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SEL_CHNL'),
        styleName: 'text-center',
      },
    }, // 판매유형
    { fieldName: 'sellTpDtlCd',
      header: t('MSG_TXT_SELL_TP_DTL'),
      width: '130',
      styleName: 'text-left',
      headerSummary: {
        text: t('MSG_TXT_SELL_TP_DTL'),
        styleName: 'text-center',
      },
    }, // 판매유형상세
    { fieldName: 'sapPdDvCd',
      header: t('MSG_TXT_SAP_PD_DV_CD_NM'),
      styleName: 'text-left',
      width: '130',
      headerSummary: {
        text: t('MSG_TXT_SAP_PD_DV_CD_NM'),
        styleName: 'text-center',
      },
    }, // SAP상품구분코드명
    { fieldName: 'w1Am01',
      header: t('MSG_TXT_BTD_BZNS_ATAM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      },
    }, // 기초 영업선수금
    { fieldName: 'w1Am02',
      header: t('MSG_TXT_DP'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      },
    }, // 입금
    { fieldName: 'w1Am03',
      header: t('MSG_TXT_RFND'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      },
    }, // 환불
    { fieldName: 'w1Am04',
      header: t('MSG_TXT_SUM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      },
    }, // 합계
    { fieldName: 'w1Am05',
      header: `(-) ${t('MSG_TXT_SL_CPRCNF')}`,
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      },
    }, // (-) 매출대사
    { fieldName: 'w1Am06',
      header: `(-) ${t('MSG_TXT_CCAM')}`,
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      },
      hint: t(''),
    }, // (-) 위약금
    { fieldName: 'w1Am07',
      header: `(-) ${t('MSG_TXT_CTR_AMT')}`,
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      },
    }, // (+) 조정금액
    { fieldName: 'w1Am08',
      header: `(+) ${t('MSG_TXT_PTYPF')}`,
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      },
    }, // (-) 잡이익
    { fieldName: 'w1Am09',
      header: t('MSG_TXT_EOT_BZNS_ATAM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      },
    }, // 기말 영업선수금
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 5 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  view.setColumnLayout([
    'slClYm',
    'perfDt',
    'sellTpCd',
    'sellTpDtlCd',
    'sapPdDvCd',
    'w1Am01',
    {
      header: `(+)${t('MSG_TXT_BZNS_ATAM_DP_IZ')}`, // (+) 영업선수금 입금내역
      direction: 'horizontal',
      items: ['w1Am02', 'w1Am03', 'w1Am04'],
    },

    'w1Am05',
    'w1Am06',
    'w1Am07',
    'w1Am08',
    'w1Am09',
  ]);
  onChangeChechOption();
});

// getSalesBondAtamDateList (두번째 그리드)
const initGrdSub = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slClYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '150',
      styleName: 'text-left',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    }, // 실적년월
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      width: '150',
      styleName: 'text-left',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '130', styleName: 'text-left' }, // 판매유형상세
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-left' }, // 계약상세번호
    { fieldName: 'sapPdDvCd', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-left' }, // SAP상품구분코드명
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'),
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      },
      dataType: 'number',
    }, // 고객명
    { fieldName: 'pdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      },
      dataType: 'number',
    }, // 상품코드
    { fieldName: 'pdNm',
      header: t('MSG_TXT_PRDT_NM'),
      width: '180',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      },
      dataType: 'number',
    }, // 상품명
    { fieldName: 'w1Am01',
      header: t('MSG_TXT_BTD_BZNS_ATAM'),
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      },
      dataType: 'number',
    }, // 기초영업선수금
    { fieldName: 'w1Am02',
      header: t('MSG_TXT_DP'),
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      },
      dataType: 'number',
    }, // 입금
    { fieldName: 'w1Am03',
      header: t('MSG_TXT_RFND'),
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      },
      dataType: 'number',
    }, // 환불
    { fieldName: 'w1Am04',
      header: t('MSG_TXT_SUM'),
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      },
      dataType: 'number',
    }, // 합계
    { fieldName: 'w1Am05',
      header: `(-) ${t('MSG_TXT_SL_CPRCNF')}`,
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      },
      dataType: 'number',
    }, // (-) 매출대사
    { fieldName: 'w1Am06',
      header: `(-) ${t('MSG_TXT_CCAM')}`,
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      },
      dataType: 'number',
    }, // (-) 위약금
    { fieldName: 'w1Am07',
      header: `(+) ${t('MSG_TXT_CTR_AMT')}`,
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      },
      dataType: 'number',
    }, // (+) 조정금액
    { fieldName: 'w1Am08',
      header: `(-) ${t('MSG_TXT_PTYPF')}`,
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      },
      dataType: 'number',
    }, // (-) 잡이익
    { fieldName: 'w1Am09',
      header: t('MSG_TXT_EOT_BZNS_ATAM'),
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      },
      dataType: 'number',
    }, // 기말 영업선수금
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 9 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  view.setColumnLayout([
    'slClYm',
    'sellTpCd',
    'sellTpDtlCd',
    'cntrNo',
    'sapPdDvCd',
    'cstKnm',
    'pdCd',
    'w1Am01',
    {
      header: `(+)${t('MSG_TXT_BZNS_ATAM_DP_IZ')}`, // (+) 영업선수금 입금내역
      direction: 'horizontal',
      items: ['w1Am02', 'w1Am03', 'w1Am04'],
    },
    'w1Am05',
    'w1Am06',
    'w1Am07',
    'w1Am08',
    'w1Am09',
  ]);
});

// getSalesBondAtamOrderList (세번째 그리드)
const initGrdThird = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slClYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '150',
      styleName: 'text-left',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    }, // 실적년월
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-left' }, // 판매유형
    { fieldName: 'sellTpDtlCd',
      header: t('MSG_TXT_SELL_TP_DTL'),
      width: '130',
      styleName: 'text-left',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      } }, // 판매유형상세
    { fieldName: 'sappddvcd',
      header: t('MSG_TXT_SAP_PD_DV_CD_NM'),
      width: '130',
      styleName: 'text-center',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // SAP상품구분코드명
    { fieldName: 'wpAm01',
      header: t('MSG_TXT_BTD_AMT'),
      width: '130',
      styleName: 'text-center',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 기초금액
    { fieldName: 'wpAm02',
      header: t('MSG_TXT_PRPD_DP'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 선수입금
    { fieldName: 'wpAm03',
      header: t('MSG_TXT_PRPD_RFND'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 선수환불
    { fieldName: 'wpAm04',
      header: t('MSG_TXT_SUM'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    }, // 합계
    { fieldName: 'wpAm05',
      header: t('MSG_TXT_RENTAL_SL'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    }, // 렌탈매출 / header - 매출내역
    { fieldName: 'wpAm06',
      header: t('MSG_TXT_SUM'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    }, // 합계 / header - 기말잔액
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 5 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  view.setColumnLayout([
    'slClYm',
    'sellChnlCd',
    'sellTpDtlCd',
    'sappddvcd',
    'wpAm01',
    {
      header: t('MSG_TXT_DP_IZ'), // 입금내역
      direction: 'horizontal',
      items: ['wpAm02', 'wpAm03', 'wpAm04'],
    },
    {
      header: t('MSG_TXT_SL_IZ'), // 매출내역
      direction: 'horizontal',
      items: ['wpAm05'],
    },
    {
      header: t('MSG_TXT_EOT_BLAM'), // 기말잔액
      direction: 'horizontal',
      items: ['wpAm06'],
    },
  ]);
});

// getSalesBondAtamMemberList (네번째 그리드)
const initGrdFourth = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slClYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '150',
      styleName: 'text-left',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    }, // 실적년월
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_CHNL'), width: '130', styleName: 'text-left' }, // 판매유형
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center' }, // 고객명
    { fieldName: 'cntr', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '150', styleName: 'text-right' }, // 매출일자
    { fieldName: 'mlgBtdPrpdAmt', header: t('MSG_TXT_BTD_AMT'), width: '150', styleName: 'text-right' }, // 기초금액
    { fieldName: 'lciam1',
      header: t('MSG_TXT_RECAP_DP'),
      width: '180',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 유상입금
    { fieldName: 'lciam2',
      header: t('MSG_TXT_FRISU_DP'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 무상입금
    { fieldName: 'lciam3',
      header: t('MSG_TXT_ETC_DP'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 기타입금
    { fieldName: 'lcsam1',
      header: t('MSG_TXT_RECAP_SL'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 유상매출
    { fieldName: 'lcsam2',
      header: t('MSG_TXT_FRISU_SL'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 무상매출
    { fieldName: 'lcsam3',
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

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 8 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  view.setColumnLayout([
    'slClYm',
    'sellTpCd',
    'sellTpDtlCd',
    'cntr',
    'cstKnm',
    'sapPdDvCd',
    'slRcogDt',
    'mlgBtdPrpdAmt',
    {
      header: t('MSG_TXT_DP_IZ'), // 입금내역
      direction: 'horizontal',
      items: ['lciam1', 'lciam2', 'lciam3'],
    },
    {
      header: t('MSG_TXT_SL_IZ'), // 매출내역
      direction: 'horizontal',
      items: ['lcsam1', 'lcsam2', 'lcsam3'],
    },
    'mlgEotPrpdAmt',
  ]);
});

const selectAgrgDv = { // 집계구분 -TODO.공통코드가 없는 관계로 임시로
  options: [{ codeId: '1', codeName: '집계' }, { codeId: '2', codeName: '일자별' }, { codeId: '3', codeName: '주문별' }, { codeId: '4', codeName: '가로계산식 틀린 회원' }],
};
</script>
