<!----
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccSalesBondAnticipationMOverduePenalty - 매출채권/선수금 현황 - 영업선수금 // W-CL-U-0058M01

3. 작성자 : gs.piit172 kim juhyun -> WOO SEUNGMIN
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
      <kw-search-item
        :label="$t('MSG_TXT_BASE_YM')"
        required
      >
        <kw-date-picker
          v-model="searchParams.slClYm"
          type="month"
          rules="required"
          :label="$t('MSG_TXT_BASE_YM')"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_AGRG_DV')"
        :colspan="2"
        required
      >
        <kw-option-group
          v-model="searchParams.agrgDv"
          type="radio"
          :options="selectAggregateDivide"
          @change="onChangeAgrgDv"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row
      cols="3"
    >
      <kw-search-item
        :label="$t('MSG_TXT_SAP_PD_DV_CD_NM')"
      >
        <kw-select
          v-model="searchParams.sapPdDvCd"
          :options="sapPdDv"
          option-value="codeId"
          option-label="codeName"
          first-option="all"
        /><!--SAP상품구분코드명-->
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_SEL_TYPE')"
        required
      >
        <kw-select
          v-model="searchParams.sellTpCd"
          :options="selectSellTpCd"
          :label="$t('MSG_TXT_SEL_TYPE')"
          @change="onChangeSellTpCd"
        /><!--판매유형-->
        <kw-select
          v-if="searchParams.sellTpCd === '1'"
          v-model="searchParams.sellTpDtlCd"
          :options="selectSellTpDtlCd.filter(v => v.userDfn02 === '1')"
          first-option="all"
          first-option-value="ALL"
        />
        <kw-select
          v-else-if="searchParams.sellTpCd === '2'"
          v-model="searchParams.sellTpDtlCd"
          :options="selectSellTpDtlCd.filter(v => v.userDfn02 === '2')"
          first-option="all"
          first-option-value="ALL"
        />
        <kw-select
          v-else-if="searchParams.sellTpCd === '10'"
          v-model="searchParams.sellTpDtlCd"
          :options="selectSellTpDtlCd.filter(v => v.userDfn02 === '10')"
          first-option="all"
          first-option-value="ALL"
        />
        <kw-select
          v-else-if="searchParams.sellTpCd === '3'"
          v-model="searchParams.sellTpDtlCd"
          :options="selectSellTpDtlCd.filter(v => v.userDfn02 === '3')"
          first-option="all"
          first-option-value="ALL"
        />
        <kw-select
          v-else-if="searchParams.sellTpCd === '6'"
          v-model="searchParams.sellTpDtlCd"
          :options="selectSellTpDtlCd.filter(v => v.userDfn02 === '6')"
          first-option="all"
          first-option-value="ALL"
        />
      </kw-search-item><!--판매유형상세-->
      <kw-search-item
        v-if="searchParams.sellTpCd === '2' || searchParams.sellTpCd === '10'"
        :label="$t('MSG_TXT_INQR_DV')"
      >
        <kw-option-group
          v-show="isInquiryDivide"
          v-if="searchParams.agrgDv === '1' || searchParams.agrgDv === '3'"
          v-model="searchParams.inquiryDivide"
          :options="selectInquiryDivide.options"
          type="radio"
          @change="onChangeInquiryDivide"
        />
        <kw-option-group
          v-show="isInquiryDivide"
          v-if="searchParams.agrgDv === '2' || searchParams.agrgDv === '4'"
          v-model="searchParams.inquiryDivide"
          :options="selectInquiryDivideDis.options"
          type="radio"
          @change="onChangeInquiryDivide"
        />
        <!--조회구분-->
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
          :disable="isDisable"
        />
        <!-- 계약 상세 -->
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_SEL_CHNL')"
      >
        <kw-select
          v-model="searchParams.sellChnlDtl"
          :options="codes.SELL_CHNL_DTL_CD"
          first-option="all"
          first-option-value="ALL"
          :label="$t('MSG_TXT_SEL_CHNL')"
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
      :visible-rows="totalCount > 30 ? 30 : 10"
      @init="initGrdMain"
    />
    <kw-grid
      v-show="isGridSub"
      ref="grdSubRef"
      name="grdSub"
      :visible-rows="totalCount > 30 ? 30 : 10"
      @init="initGrdSub"
    />
    <kw-grid
      v-show="isGridThird"
      ref="grdThirdRef"
      name="grdThird"
      :visible-rows="totalCount > 30 ? 30 : 10"
      @init="initGrdThird"
    />
    <kw-grid
      v-show="isGridFourth"
      ref="grdFourthRef"
      name="grdFourth"
      :visible-rows="totalCount > 30 ? 30 : 10"
      @init="initGrdFourth"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, defineGrid, gridUtil, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import { getAggregateDivide, getSellTpCd, getSellTpDtlCd } from '~/modules/sms-common/closing/utils/clUtil';

const dataService = useDataService();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// 검색조건 - 판매채널
const sapPdDv = (await dataService.get('/sms/wells/closing/performance/overdue-penalty/code'))
  .data.map((v) => ({ codeId: v.sapPdDvCd, codeName: v.sapPdDvNm }));
const selectAggregateDivide = await getAggregateDivide();
const selectSellTpCd = await getSellTpCd();
const selectSellTpDtlCd = await getSellTpDtlCd();
const totalCount = ref(0);
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const grdThirdRef = ref(getComponentType('KwGrid'));
const grdFourthRef = ref(getComponentType('KwGrid'));

const isDisable = ref(true);
const isGridMain = ref(true);
const isGridSub = ref(false);
const isGridThird = ref(false);
const isGridFourth = ref(false);
const isInquiryDivide = ref(false);

const searchParams = ref({
  slClYm: dayjs().add(-1, 'M').format('YYYYMM'),
  agrgDv: '1', // 집계구분
  sapPdDvCd: '', // SAP상품구분코드
  sellTpCd: '1', // 판매유형
  sellTpDtlCd: 'ALL', // 판매유형상세
  sellChnlDtl: 'ALL', // 판매채널
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약상세번호
  inquiryDivide: '1', // 조회구분
});

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD', // 판매유형
  'SELL_TP_DTL_CD', // 판매유형상세코드
  'SELL_CHNL_DTL_CD', // 판매채널
);

let cachedParams;
async function fetchData() {
  const { agrgDv, inquiryDivide, sellTpCd } = searchParams.value;
  let res;
  let mainView;

  console.log('agrgDv:', agrgDv);
  console.log('inquiryDivide:', inquiryDivide);
  console.log('sellTpCd:', sellTpCd);

  if (agrgDv === '2') { // 일자별
    mainView = grdMainRef.value.getView();
    res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/anticipationDates', { params: cachedParams, timeout: 180000 });
  } else if (agrgDv === '4') { // 가로계산식
    mainView = grdSubRef.value.getView();
    if (sellTpCd === '1') { // 일시불 선택시
      res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/anticipationSinglePayments', { params: cachedParams, timeout: 180000 });
    } else if (sellTpCd === '2') { // 렌탈 선택시
      res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/anticipationRentals', { params: cachedParams, timeout: 180000 });
    } else if (sellTpCd === '10') { // 리스 선택시
      res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/anticipationLeases', { params: cachedParams, timeout: 180000 });
    } else if (sellTpCd === '3') { // 멤버십 선택시
      res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/anticipationMemberships', { params: cachedParams, timeout: 180000 });
    } else if (sellTpCd === '6') { // 정기배송 선택시
      res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/anticipationRegularShippings', { params: cachedParams, timeout: 180000 });
    }
  } else if (agrgDv === '1' || agrgDv === '3') { // 집계, 주문별
    if (inquiryDivide === '2' && (sellTpCd === '2' || sellTpCd === '10')) { // 포인트 선택시
      if (agrgDv === '1') { // 집계
        mainView = grdThirdRef.value.getView();
        res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/pointAggregates', { params: cachedParams, timeout: 180000 });
      } else if (agrgDv === '3') { // 주문별
        mainView = grdFourthRef.value.getView();
        res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/pointOrders', { params: cachedParams, timeout: 180000 });
      }
    } else {
      mainView = grdSubRef.value.getView();
      if (sellTpCd === '1') { // 일시불 선택시
        res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/anticipationSinglePayments', { params: cachedParams, timeout: 180000 });
      } else if (sellTpCd === '2') { // 렌탈 선택시
        res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/anticipationRentals', { params: cachedParams, timeout: 180000 });
      } else if (sellTpCd === '10') { // 리스 선택시
        res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/anticipationLeases', { params: cachedParams, timeout: 180000 });
      } else if (sellTpCd === '3') { // 멤버십 선택시
        res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/anticipationMemberships', { params: cachedParams, timeout: 180000 });
      } else if (sellTpCd === '6') { // 정기배송 선택시
        res = await dataService.get('/sms/wells/closing/performance/overdue-penalty/anticipationRegularShippings', { params: cachedParams, timeout: 180000 });
      }
    }
  }

  const overduePenalty = res.data;
  totalCount.value = overduePenalty.length;

  mainView.getDataSource().setRows(overduePenalty);

  isGridMain.value = false;
  isGridSub.value = false;
  isGridThird.value = false;
  isGridFourth.value = false;

  if (agrgDv === '2') { // 일자별
    isGridMain.value = true;
  } else if (agrgDv === '4') { // 가로계산식
    isGridSub.value = true;
    mainView.columnByName('cntrNo').visible = true;
    mainView.columnByName('cstKnm').visible = true;
    mainView.columnByName('pdCd').visible = true;
    mainView.columnByName('pdNm').visible = true;
    mainView.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 8 }];
  } else if (agrgDv === '1' || agrgDv === '3') { // 집계, 주문별
    if (inquiryDivide === '2' && (sellTpCd === '2' || sellTpCd === '10')) { // 포인트 선택시
      if (agrgDv === '1') { // 집계
        isGridThird.value = true;
      } else if (agrgDv === '3') { // 주문별
        isGridFourth.value = true;
      }
    } else { // 포인트 미선택시
      isGridSub.value = true;
      if (agrgDv === '1') { // 집계
        mainView.columnByName('cntrNo').visible = false;
        mainView.columnByName('cstKnm').visible = false;
        mainView.columnByName('pdCd').visible = false;
        mainView.columnByName('pdNm').visible = false;
        mainView.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 4 }];
      } else if (agrgDv === '3') { // 주문별
        mainView.columnByName('cntrNo').visible = true;
        mainView.columnByName('cstKnm').visible = true;
        mainView.columnByName('pdCd').visible = true;
        mainView.columnByName('pdNm').visible = true;
        mainView.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 8 }];
      }
    }
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  let view;
  if (isGridMain.value === true) {
    view = grdMainRef.value.getView();
  } else if (isGridSub.value === true) {
    view = grdSubRef.value.getView();
  } else if (isGridThird.value === true) {
    view = grdThirdRef.value.getView();
  } else if (isGridFourth.value === true) {
    view = grdFourthRef.value.getView();
  }

  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TIT_SL_BND_ATAM_PS')} - ${t('MSG_TIT_BZNS_ATAM')}`,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

async function onChangeAgrgDv() {
  const { agrgDv } = searchParams.value;
  if (agrgDv === '3') {
    isDisable.value = false;
  } else {
    isDisable.value = true;
  }
}

async function onChangeSellTpCd() {
  const { sellTpCd } = searchParams.value; // 판매유형
  if (sellTpCd === '2' || sellTpCd === '10') {
    isInquiryDivide.value = true;
  } else {
    isInquiryDivide.value = false;
  }
  searchParams.value.sellTpDtlCd = 'ALL';
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
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
      datetimeFormat: 'YYYY-MM',
    }, // 실적년월
    { fieldName: 'slClDt',
      header: t('MSG_TXT_PERF_DT'),
      styleName: 'text-center',
      width: '130',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
      datetimeFormat: 'date',
    }, // 실적일자
    { fieldName: 'sellTpCdNm',
      header: t('MSG_TXT_SEL_TYPE'),
      width: '130',
      styleName: 'text-center',
    }, // 판매유형
    { fieldName: 'sellTpDtlCdNm',
      header: t('MSG_TXT_SELL_TP_DTL'),
      width: '130',
      styleName: 'text-center',
    }, // 판매유형상세
    { fieldName: 'sapPdAtcNm',
      header: t('MSG_TXT_SAP_PD_DV_CD_NM'),
      styleName: 'text-center',
      width: '130',
    }, // SAP상품구분코드명
    { fieldName: 'btdAtam',
      header: t('MSG_TXT_BTD_BZNS_ATAM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    }, // 기초 영업선수금
    { fieldName: 'atamDpAmt',
      header: t('MSG_TXT_DP'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    }, // 입금
    { fieldName: 'thmAtamRfndAmt',
      header: t('MSG_TXT_RFND'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    }, // 환불
    { fieldName: 'dpTotAmt',
      header: t('MSG_TXT_SUM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    }, // 합계
    { fieldName: 'slBndAlrpyAmt',
      header: `(-) ${t('MSG_TXT_SL_CPRCNF')}`,
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    }, // (-) 매출대사
    { fieldName: 'borAmt',
      header: `(-) ${t('MSG_TXT_CCAM')}`,
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
      hint: t(''),
    }, // (-) 위약금
    { fieldName: 'adjAmt',
      header: `(-) ${t('MSG_TXT_CTR_AMT')}`,
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    }, // (+) 조정금액
    { fieldName: 'etcProfit',
      header: `(+) ${t('MSG_TXT_PTYPF')}`,
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    }, // (-) 잡이익
    { fieldName: 'eotAtam',
      header: t('MSG_TXT_EOT_BZNS_ATAM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    }, // 기말 영업선수금
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'slClYm',
    'slClDt',
    'sellTpCdNm',
    'sellTpDtlCdNm',
    'sapPdAtcNm',
    'btdAtam',
    {
      header: `(+)${t('MSG_TXT_BZNS_ATAM_DP_IZ')}`, // (+) 영업선수금 입금내역
      direction: 'horizontal',
      items: ['atamDpAmt', 'thmAtamRfndAmt', 'dpTotAmt'],
    },

    'slBndAlrpyAmt',
    'borAmt',
    'adjAmt',
    'etcProfit',
    'eotAtam',
  ]);

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });
  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 5 }];
});

// getSalesBondAtamDateList (두번째 그리드)
const initGrdSub = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slClYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '150',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
      datetimeFormat: 'YYYY-MM',
    }, // 실적년월
    { fieldName: 'sellTpCdNm',
      header: t('MSG_TXT_SEL_TYPE'),
      width: '150',
      styleName: 'text-center',
    }, // 판매유형
    { fieldName: 'sellTpDtlCdNm', header: t('MSG_TXT_SELL_TP_DTL'), width: '130', styleName: 'text-center' }, // 판매유형상세
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'sapPdAtcNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'),
      width: '150',
      styleName: 'text-center',
    }, // 고객명
    { fieldName: 'pdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      width: '150',
      styleName: 'text-center',
    }, // 상품코드
    { fieldName: 'pdNm',
      header: t('MSG_TXT_PRDT_NM'),
      width: '180',
      styleName: 'text-left',
    }, // 상품명
    { fieldName: 'btdAtam',
      header: t('MSG_TXT_BTD_BZNS_ATAM'),
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
      dataType: 'number',
    }, // 기초영업선수금
    { fieldName: 'atamDpAmt',
      header: t('MSG_TXT_DP'),
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
      dataType: 'number',
    }, // 입금
    { fieldName: 'thmAtamRfndAmt',
      header: t('MSG_TXT_RFND'),
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
      dataType: 'number',
    }, // 환불
    { fieldName: 'dpTotAmt',
      header: t('MSG_TXT_SUM'),
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
      dataType: 'number',
    }, // 합계
    { fieldName: 'slBndAlrpyAmt',
      header: `(-) ${t('MSG_TXT_SL_CPRCNF')}`,
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
      dataType: 'number',
    }, // (-) 매출대사
    { fieldName: 'borAmt',
      header: `(-) ${t('MSG_TXT_CCAM')}`,
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
      dataType: 'number',
    }, // (-) 위약금
    { fieldName: 'adjAmt',
      header: `(+) ${t('MSG_TXT_CTR_AMT')}`,
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
      dataType: 'number',
    }, // (+) 조정금액
    { fieldName: 'etcProfit',
      header: `(-) ${t('MSG_TXT_PTYPF')}`,
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
      dataType: 'number',
    }, // (-) 잡이익
    { fieldName: 'eotAtam',
      header: t('MSG_TXT_EOT_BZNS_ATAM'),
      width: '150',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
      dataType: 'number',
    }, // 기말 영업선수금
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'slClYm',
    'sellTpCdNm',
    'sellTpDtlCdNm',
    'cntrNo',
    'sapPdAtcNm',
    'cstKnm',
    'pdCd',
    'pdNm',
    'btdAtam',
    {
      header: `(+)${t('MSG_TXT_BZNS_ATAM_DP_IZ')}`, // (+) 영업선수금 입금내역
      direction: 'horizontal',
      items: ['atamDpAmt', 'thmAtamRfndAmt', 'dpTotAmt'],
    },
    'slBndAlrpyAmt',
    'borAmt',
    'adjAmt',
    'etcProfit',
    'eotAtam',
  ]);

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });
  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 8 }];
});

// getSalesBondAtamOrderList (세번째 그리드)
const initGrdThird = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slClYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '150',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
      datetimeFormat: 'YYYY-MM',
    }, // 실적년월
    { fieldName: 'sellTpCdNm', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-center' }, // 판매유형
    { fieldName: 'sellTpDtlCdNm',
      header: t('MSG_TXT_SELL_TP_DTL'),
      width: '130',
      styleName: 'text-center',
    }, // 판매유형상세
    { fieldName: 'sapPdAtcNm',
      header: t('MSG_TXT_SAP_PD_DV_CD_NM'),
      width: '130',
      styleName: 'text-center',
    }, // SAP상품구분코드명
    { fieldName: 'mlgBtdPrpdAmt',
      header: t('MSG_TXT_BTD_AMT'),
      width: '130',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 기초금액
    { fieldName: 'mlgDpAmt',
      header: t('MSG_TXT_PRPD_DP'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 선수입금
    { fieldName: 'mlgRfndAmt',
      header: t('MSG_TXT_PRPD_RFND'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 선수환불
    { fieldName: 'mlgTotAmt',
      header: t('MSG_TXT_SUM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    }, // 합계
    { fieldName: 'mlgSlAmt',
      header: t('MSG_TXT_RENTAL_SL'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    }, // 렌탈매출 / header - 매출내역
    { fieldName: 'mlgEotPrpdAmt',
      header: t('MSG_TXT_SUM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
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

  view.setColumnLayout([
    'slClYm',
    'sellTpCdNm',
    'sellTpDtlCdNm',
    'sapPdAtcNm',
    'mlgBtdPrpdAmt',
    {
      header: t('MSG_TXT_DP_IZ'), // 입금내역
      direction: 'horizontal',
      items: ['mlgDpAmt', 'mlgRfndAmt', 'mlgTotAmt'],
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

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });
  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 4 }];
});

// getSalesBondAtamMemberList (네번째 그리드)
const initGrdFourth = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slClYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '150',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
      datetimeFormat: 'YYYY-MM',
    }, // 실적년월
    { fieldName: 'sellTpCdNm', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-center' }, // 판매유형
    { fieldName: 'sellTpDtlCdNm',
      header: t('MSG_TXT_SELL_TP_DTL'),
      width: '130',
      styleName: 'text-center',
    }, // 판매유형상세
    { fieldName: 'sapPdAtcNm',
      header: t('MSG_TXT_SAP_PD_DV_CD_NM'),
      width: '130',
      styleName: 'text-center',
    }, // SAP상품구분코드명
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center' }, // 고객명
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' }, // 매출일자
    { fieldName: 'mlgBtdPrpdAmt',
      header: t('MSG_TXT_BTD_AMT'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 기초금액
    { fieldName: 'chargedDpAmt',
      header: t('MSG_TXT_RECAP_DP'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 유상입금
    { fieldName: 'freeDpAmt',
      header: t('MSG_TXT_FRISU_DP'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 무상입금
    { fieldName: 'etcDpAmt',
      header: t('MSG_TXT_ETC_DP'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 기타입금
    { fieldName: 'chargedSlAmt',
      header: t('MSG_TXT_RECAP_SL'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 유상매출
    { fieldName: 'freeSlAmt',
      header: t('MSG_TXT_FRISU_SL'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 무상매출
    { fieldName: 'etcSlAmt',
      header: t('MSG_TXT_ETC_SL'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } }, // 기타매출
    { fieldName: 'mlgEotPrpdAmt',
      header: t('MSG_TXT_EOT_BLAM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
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

  view.setColumnLayout([
    'slClYm',
    'sellTpCdNm',
    'sellTpDtlCdNm',
    'sapPdAtcNm',
    'cstKnm',
    'cntrNo',
    'slRcogDt',
    'mlgBtdPrpdAmt',
    {
      header: t('MSG_TXT_DP_IZ'), // 입금내역
      direction: 'horizontal',
      items: ['chargedDpAmt', 'freeDpAmt', 'etcDpAmt'],
    },
    {
      header: t('MSG_TXT_SL_IZ'), // 매출내역
      direction: 'horizontal',
      items: ['chargedSlAmt', 'freeSlAmt', 'etcSlAmt'],
    },
    'mlgEotPrpdAmt',
  ]);

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });
  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 7 }];
});

const selectInquiryDivide = { // 조회구분
  options: [{ codeId: '1', codeName: t('MSG_TXT_ATAM'), disable: false }, { codeId: '2', codeName: t('MSG_TXT_P_ATAM'), disable: false }],
};

const selectInquiryDivideDis = { // 조회구분
  options: [{ codeId: '1', codeName: t('MSG_TXT_ATAM'), disable: true }, { codeId: '2', codeName: t('MSG_TXT_P_ATAM'), disable: true }],
};
</script>
