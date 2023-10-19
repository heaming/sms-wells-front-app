<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID :  WmwdbRefundListMCurrentState - 웰스환불현황(통합) W-WD-U-0130M01
3. 작성자 : sonkiseok
4. 작성일 : 2023.05.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- PGE_WDB_00095
- 웰스 환불 현황(통합)을 조회 합니다.
****************************************************************************************************
--->
<template>
  <kw-tab-panel name="1">
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 환불일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_RFND_DT')"
          required
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.rveDtStart"
            v-model:to="searchParams.rveDtFinish"
            rules="date_range_required|date_range_months:1"
            :label="$t('MSG_TXT_RFND_DT')"
          />
        </kw-search-item>
        <!-- 실적일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_DT')"
          :colspan="2"
          >
          <!-- required -->
          <kw-date-range-picker
            v-model:from="searchParams.perfDtStart"
            v-model:to="searchParams.perfDtFinish"
            rules="date_range_months:1"
            :label="t('MSG_TXT_PERF_DT')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 일괄생성구분 -->
        <kw-search-item
          :label="t('MSG_TXT_BLK_CRT_DV')"
          first-option="all"
          first-option-value="ALL"
        >
          <kw-select
            v-model="searchParams.blkCrtDv"
            first-option="all"
            first-option-value="ALL"
            :options="customCodes.BLK_CRT_DV"
          />
          <!-- :model-value="['01','02','03']" -->
          <!-- :options="['일괄생성제외', '멤버십환불', '기변자동전금']" -->
        </kw-search-item>
        <!-- 귀속환불구분 -->
        <kw-search-item
          :label="t('MSG_TXT_BLNG_RFND_DV')"
        >
          <!-- 전체, 귀속환불만, 귀속환불제외 따로 만들어야할듯..-->
          <kw-select
            v-model="searchParams.rfndDsbDvCd"
            first-option="all"
            first-option-value="ALL"
            :options="codes.RFND_DSB_DV_CD.filter((v) => v.codeId === '01' || v.codeId === '02')"
          />
        </kw-search-item>
        <!-- 판매유형 -->
        <kw-search-item
          :label="t('MSG_TXT_SEL_TYPE')"
        >
          <!-- 렌탈, 멤버십, 정기배송 -->
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD.filter((v) => v.codeId === '2' || v.codeId === '3' || v.codeId === '6')"
            @change="onChangeSellTpCd"
          />
        </kw-search-item>
        <!-- 판매유형상세 -->
        <!-- 23.07.21 일반, 금융리스, '장기할부'-->
        <kw-search-item :label="t('MSG_TXT_SELL_TP_DTL')">
          <kw-select
            v-model="searchParams.sellTpDtlCd"
            first-option="all"
            first-option-value="ALL"
            :options="optionsCodes"
          />
          <!-- :model-value="[]" -->
          <!-- :options="['일반', '금융리스', '장기할부']" -->
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 대손구분 -->
        <kw-search-item
          :label="t('MSG_TXT_DFA_DV')"
        >
          <kw-option-group
            v-model="searchParams.rveDvCd"
            type="radio"
            :options="customCodes.RVE_DV_CD"
          />
        </kw-search-item>
        <!-- 포인트구분 -->
        <kw-search-item
          :label="t('MSG_TXT_P_DV')"
        >
          <kw-select
            v-model="searchParams.dpMesCd"
            first-option="all"
            first-option-value="ALL"
            :options="customCodes.DP_MES_CD"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <!-- 환불내역 -->
      <h3>{{ $t('MSG_TXT_RFND_IZ') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
          <!-- (단위:원) -->
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <!-- 리포트 보기 -->
        <kw-btn
          v-permission:print
          icon="report"
          dense
          secondary
          :label="$t('MSG_BTN_RPT_BRWS')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickReportView"
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="excel"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload1"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef1"
        name="grdMain1"
        :visible-rows="pageInfo.pageSize - 1"
        @init="initGrdMain1"
      />
      <!-- 카드사별 환불내역 -->
      <h3 class="mt30">
        {{ t('MSG_TXT_CDCO_RFND_IZ') }}
      </h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo2.pageIndex"
            v-model:page-size="pageInfo2.pageSize"
            :total-count="pageInfo2.totalCount"
            @change="fetchData2"
          />
          <!-- 단위:원 -->
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo2.totalCount === 0"
          @click="onClickExcelDownload2"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef12"
        name="grdMain12"
        :visible-rows="pageInfo2.pageSize - 1"
        @init="initGrdMain12"
      />
      <!-- 전금내역 -->
      <h3 class="mt30">
        {{ t('MSG_TXT_BLTF_IZ') }}
      </h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo3.pageIndex"
            v-model:page-size="pageInfo3.pageSize"
            :total-count="pageInfo3.totalCount"
            @change="fetchData3"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo3.totalCount === 0"
          @click="onClickExcelDownload3"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef13"
        name="grdMain13"
        :visible-rows="pageInfo3.pageSize - 1"
        @init="initGrdMain13"
      />
    </div>
  </kw-tab-panel>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();

const { currentRoute } = useRouter();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10, // Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const pageInfo2 = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 6, // Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const pageInfo3 = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 6, // Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef1 = ref(getComponentType('KwGrid'));
const grdMainRef12 = ref(getComponentType('KwGrid'));
const grdMainRef13 = ref(getComponentType('KwGrid'));
const now = dayjs();

const codes = await codeUtil.getMultiCodes(
  'RFND_DSB_DV_CD', // 귀속환불구분
  'SELL_TP_CD', // 판매유형
  'RVE_DV_CD', // 입금유형
  'SELL_TP_DTL_CD', // 판매유형상세
  'DP_TP_CD',
);

const optionsCodes = ref(codes.SELL_TP_DTL_CD.filter((p1) => ['21', '22', '24', '25', '26'].includes(p1.codeId)));

const customCodes = {
  BLK_CRT_DV: [{ codeId: '-', codeName: '일괄생성제외' }, { codeId: '-', codeName: '멤버쉽환불' }, { codeId: '-', codeName: '기변자동전금' }],
  RVE_DV_CD: [{ codeId: '-', codeName: '일반' }, { codeId: '09', codeName: '대손이관' }],
  DP_MES_CD: [{ codeId: '06', codeName: '포인트만' }, { codeId: '-', codeName: '포인트 제외' }],
};

const searchParams = ref({
  rveDtStart: now.format('YYYYMM01'), // 환불일자 시작일
  rveDtFinish: now.format('YYYYMMDD'), // 환불일자 종료일
  perfDtStart: now.format('YYYYMM01'), // 실적일자.시작일
  perfDtFinish: now.format('YYYYMMDD'), // 실적일자.종료일
  // 일괄생성구분 은 설계자가 테이블 컬럼 매핑하지 못함. 알 수 없음이라고 작성되어 있음.
  rfndDsbDvCd: 'ALL', // 귀속환불구분
  sellTpCd: '2', // 판매유형
  sellTpDtlCd: 'ALL', // 판매유형상세
  // 판매유형상세 은 설계자가 테이블 컬럼 매핑하지 못함. 알 수 없음이라고 작성되어 있음.
  rveDvCd: '-', // 대손구분
  dpMesCd: 'ALL', // 포인트구분
  blkCrtDv: 'ALL', // 일괄생성구분
});

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const response = await dataService.get('/sms/wells/withdrawal/idvrve/refund-status/paging', { params: cachedParams });
  const { list: refunds, pageInfo: pagingResult } = response.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef1.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(refunds);
  dataSource.checkRowStates(true);
}

async function fetchData2() {
  cachedParams = { ...cachedParams, ...pageInfo2.value };

  const response = await dataService.get('/sms/wells/withdrawal/idvrve/refund-status/card/paging', { params: cachedParams });
  const { list: cardRefunds, pageInfo: pagingResult } = response.data;
  pageInfo2.value = pagingResult;

  const view = grdMainRef12.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(cardRefunds);
  dataSource.checkRowStates(true);
}

async function fetchData3() {
  cachedParams = { ...cachedParams, ...pageInfo3.value };

  const response = await dataService.get('/sms/wells/withdrawal/idvrve/refund-status/balance-transfer/paging', { params: cachedParams });
  const { list: balanceTransfer, pageInfo: pagingResult } = response.data;
  pageInfo3.value = pagingResult;

  const view = grdMainRef13.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(balanceTransfer);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  grdMainRef1.value.getData().clearRows();
  grdMainRef12.value.getData().clearRows();
  grdMainRef13.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  pageInfo2.value.pageIndex = 1;
  pageInfo3.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
  await fetchData2();
  await fetchData3();
}

async function onClickReportView() {
  // TODO: OZ REPORT 개발중..
  notify('개발중');
  // await openReportPopup('/eformsample.ozr', '/eformsample.odi', JSON.stringify({ param1: 'test1', param2: 'test2'}));
}

async function onClickExcelDownload1() {
  const response = await dataService.get('/sms/wells/withdrawal/idvrve/refund-status/excel-download', { params: cachedParams });
  const view = grdMainRef1.value.getView();

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_RFND_IZ')}`,
    timePostfix: true,
    exportData: response.data,
  });
}

async function onChangeSellTpCd(param) {
  let options;

  if (param === '1') {
    options = codes.SELL_TP_DTL_CD.filter((p1) => ['11', '12', '13'].includes(p1.codeId));
  } else if (param === '2') {
    options = codes.SELL_TP_DTL_CD.filter((p1) => ['21', '22', '24', '25', '26'].includes(p1.codeId));
    // options = codes.SELL_TP_DTL_CD.filter((p1) => ['21', '22', '23', '24', '25', '26'].includes(p1.codeId));
  } else if (param === '3') {
    options = codes.SELL_TP_DTL_CD.filter((p1) => ['31', '32', '33'].includes(p1.codeId));
    // options = codes.SELL_TP_DTL_CD.filter((p1) => ['31', '32', '33', '34'].includes(p1.codeId));
  } else if (param === '6') {
    // options = codes.SELL_TP_DTL_CD.filter((p1) => ['61', '62', '63'].includes(p1.codeId));
    options = codes.SELL_TP_DTL_CD.filter((p1) => ['61'].includes(p1.codeId));
  } else {
    options = [];
  }
  optionsCodes.value = options;
}

async function onClickExcelDownload2() {
  const response = await dataService.get('/sms/wells/withdrawal/idvrve/refund-status/card/excel-download', { params: cachedParams });
  const view = grdMainRef12.value.getView();

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_CDCO_RFND_IZ')}`,
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickExcelDownload3() {
  const response = await dataService.get('/sms/wells/withdrawal/idvrve/refund-status/balance-transfer/excel-download', { params: cachedParams });
  const view = grdMainRef13.value.getView();

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_BLTF_IZ')}`,
    timePostfix: true,
    exportData: response.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain1 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약상세번호
    { fieldName: 'cntrSn' },
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'sellTpCd' }, // 판매유형
    { fieldName: 'dpAmt', dataType: 'number' }, // 입금총액
    { fieldName: 'rveAmt', dataType: 'number' }, // 지급총액
    { fieldName: 'rfndDsbAmt', dataType: 'number' }, // 환불금액
    { fieldName: 'rfndDsbPspInt', dataType: 'number' }, // 지연이자
    { fieldName: 'rfndDdtnAmt', dataType: 'number' }, // 카드공제
    { fieldName: 'cshRfndFnitCd' }, // 은행사 코드
    { fieldName: 'cshFnitNm' }, // 은행/카드사, 은행명
    { fieldName: 'cardRfndFnitCd' }, // 카드사 코드
    { fieldName: 'cardFnitNm' }, // 카드사명
    { fieldName: 'cshRfndAcnoEncr' }, // 계좌/카드번호
    { fieldName: 'cardRfndCrcdnoEncr' }, // 카드번호
    { fieldName: 'cshRfndAcownNm' }, // 예금주, 현금 예금주
    // { fieldName: 'cardRfndCrdcdAprno' }, // 카드 결제자
    { fieldName: 'sellTpDtlCd' }, // 판매유형상세
    { fieldName: 'rveDvCd' }, // 입금유형
    { fieldName: 'cstNo' }, // 전금고객번호
    { fieldName: 'tmp2' }, // 전금고객명
  ];

  const columns = [
    { // 계약상세번호
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '153',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '80' }, // 고객명
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center', options: codes.SELL_TP_CD }, // 판매유형
    { fieldName: 'dpAmt', header: t('MSG_TXT_DP_TAM'), width: '100', styleName: 'text-right' }, // 입금총액
    { fieldName: 'rveAmt', header: t('MSG_TXT_DSB_AMT'), width: '100', styleName: 'text-right' }, // 지급금액
    { fieldName: 'rfndDsbAmt', header: t('MSG_TXT_RFND_AMT'), width: '100', styleName: 'text-right' }, // 환불금액
    { fieldName: 'rfndDsbPspInt', header: t('MSG_TXT_PSP_INT'), width: '100', styleName: 'text-right' }, // 지연이자
    { fieldName: 'rfndDdtnAmt', header: t('MSG_TXT_CARD_DDTN'), width: '100', styleName: 'text-right' }, // 카드공제
    {
      fieldName: 'cshFnitNm',
      header: t('MSG_TXT_BNK_CDCO'),
      width: '100',
      displayCallback(grid, index) {
        const { cshFnitNm, cardFnitNm } = grid.getValues(index.itemIndex);
        if (isEmpty(cardFnitNm) && isEmpty(cshFnitNm)) {
          return '';
        }
        if (isEmpty(cshFnitNm)) {
          return `${cardFnitNm}`;
        }
        if (isEmpty(cardFnitNm)) {
          return `${cshFnitNm}`;
        }
      },
    },
    {
      fieldName: 'cshRfndAcnoEncr',
      header: t('MSG_TXT_AC_CDNO'),
      width: '180',
      displayCallback(grid, index) {
        const { cshRfndAcnoEncr, cardRfndCrcdnoEncr } = grid.getValues(index.itemIndex);
        if (isEmpty(cshRfndAcnoEncr)) {
          return !isEmpty(cardRfndCrcdnoEncr) ? `${cardRfndCrcdnoEncr.substring(0, 4)}-
          ${cardRfndCrcdnoEncr.substring(4, 8)}-
          ${cardRfndCrcdnoEncr.substring(8, 12)}-
          ${cardRfndCrcdnoEncr.substring(12, 16)}` : '';
        }
        if (isEmpty(cardRfndCrcdnoEncr)) {
          return !isEmpty(cshRfndAcnoEncr) ? `${cshRfndAcnoEncr.substring(0, 6)}-
          ${cshRfndAcnoEncr.substring(6, 8)}-
          ${cshRfndAcnoEncr.substring(8, 14)}` : '';
        }
      },
    },
    {
      fieldName: 'cshRfndAcownNm',
      header: t('MSG_TXT_ACHLDR'),
      width: '100',
    },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'rveDvCd', header: t('MSG_TXT_DP_TP'), width: '100', options: codes.DP_TP_CD },
    { fieldName: 'cstNo', header: t('MSG_TXT_BLTF_CST_NO'), width: '180' },
    { fieldName: 'tmp2', header: t('MSG_TXT_BLTF_CST_NM'), width: '150' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'cntrNo', // 계약상세번호
    'cstKnm', // 고객명
    'sellTpCd', // 판매유형
    'dpAmt', // 입금총액
    { // 환불내역 : 지급총액, 환불금액, 지연이자, 카드공제, 은행/카드사, 계좌/카드번호, 예금주
      header: t('MSG_TXT_RFND_IZ'),
      direction: 'horizontal',
      items: ['rveAmt', 'rfndDsbAmt', 'rfndDsbPspInt', 'rfndDdtnAmt', 'cshFnitNm', 'cshRfndAcnoEncr', 'cshRfndAcownNm'],
    },
    { // 전금내역 : 판매유형, 입금유형, 전금고객번호, 전금고객명
      header: t('MSG_TXT_BLTF_IZ'),
      direction: 'horizontal',
      items: ['sellTpDtlCd', 'rveDvCd', 'cstNo', 'tmp2'],
    },

  ]);

  view.setHeaderSummaries({
    visible: true,
    items: [{ height: 40 }],
  });
  view.columnByName('cntrNo').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.columnByName('dpAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('rveAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('rfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('rfndDsbPspInt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('rfndDdtnAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('cshFnitNm').setHeaderSummaries({ styleName: 'text-center' });
  view.layoutByColumn('cntrNo').summaryUserSpans = [{ colspan: 3 }];
  view.layoutByColumn('cshFnitNm').summaryUserSpans = [{ colspan: 5 }];

  // view.onCellClicked = (grid, clickData) => {
  //   if (clickData.cellType === 'data') {
  //     grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
  //   }
  // };

  view.onScrollToBottom = (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      fetchData();
    }
  };
});

const initGrdMain12 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'refundDivision' }, // 환불구분
    { fieldName: 'rfndDsbAmt', dataType: 'number' }, // 현금
    { fieldName: 'rfndDdtnAmt', dataType: 'number' }, // 카드공제
    { fieldName: 'bcRfndDsbAmt', dataType: 'number' }, // 비씨
    { fieldName: 'kbRfndDsbAmt', dataType: 'number' }, // 국민
    { fieldName: 'hnRfndDsbAmt', dataType: 'number' }, // 외환
    { fieldName: 'shRfndDsbAmt', dataType: 'number' }, // 신한
    { fieldName: 'ssRfndDsbAmt', dataType: 'number' }, // 삼성
    { fieldName: 'hdRfndDsbAmt', dataType: 'number' }, // 현대
    { fieldName: 'ltRfndDsbAmt', dataType: 'number' }, // 롯데
    { fieldName: 'nhRfndDsbAmt', dataType: 'number' }, // 농협
    { fieldName: 'sumRfndDsbDdtnAmt', dataType: 'number' }, // 환불총계
    { fieldName: 'sumRfndDsbPspInt', dataType: 'number' }, // 지연이자
  ];

  const columns = [
    { fieldName: 'refundDivision', header: t('MSG_TXT_CLSF_REFUND'), width: '111', options: codes.SELL_TP_CD },
    { fieldName: 'rfndDsbAmt', header: t('MSG_TXT_CASH'), width: '111', styleName: 'text-right' },
    { fieldName: 'rfndDdtnAmt', header: t('MSG_TXT_CARD_DDTN'), width: '111', styleName: 'text-right' },
    { fieldName: 'bcRfndDsbAmt', header: t('MSG_TXT_BC2'), width: '111', styleName: 'text-right' },
    { fieldName: 'kbRfndDsbAmt', header: t('MSG_TXT_KB'), width: '111', styleName: 'text-right' },
    { fieldName: 'hnRfndDsbAmt', header: t('MSG_TXT_FREX'), width: '111', styleName: 'text-right' },
    { fieldName: 'shRfndDsbAmt', header: t('MSG_TXT_SH'), width: '111', styleName: 'text-right' },
    { fieldName: 'ssRfndDsbAmt', header: t('MSG_TXT_SS'), width: '111', styleName: 'text-right' },
    { fieldName: 'hdRfndDsbAmt', header: t('MSG_TXT_HD'), width: '111', styleName: 'text-right' },
    { fieldName: 'ltRfndDsbAmt', header: t('MSG_TXT_LT'), width: '111', styleName: 'text-right' },
    { fieldName: 'nhRfndDsbAmt', header: t('MSG_TXT_NH'), width: '111', styleName: 'text-right' },
    { fieldName: 'sumRfndDsbDdtnAmt', header: t('MSG_TXT_RFND_TOT'), width: '119', styleName: 'text-right' },
    { fieldName: 'sumRfndDsbPspInt', header: t('MSG_TXT_PSP_INT'), width: '160', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setHeaderSummaries({
    visible: true,
    items: [{ height: 40 }],
  });
  view.columnByName('refundDivision').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.columnByName('rfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('rfndDdtnAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('bcRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('kbRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('hnRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('shRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('ssRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('hdRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('ltRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('nhRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('sumRfndDsbDdtnAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('sumRfndDsbPspInt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });

  view.onScrollToBottom = (g) => {
    if (pageInfo2.value.pageIndex * pageInfo2.value.pageSize <= g.getItemCount()) {
      pageInfo2.value.pageIndex += 1;
      fetchData2();
    }
  };
});

const initGrdMain13 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'refundDivision' }, // 전금구분
    { fieldName: 'rtRfndDsbAmt', dataType: 'number' }, // 렌탈
    { fieldName: 'lsRfndDsbAmt', dataType: 'number' }, // 리스
    { fieldName: 'elRfndDsbAmt', dataType: 'number' }, // 환경리스
    { fieldName: 'mbRfndDsbAmt', dataType: 'number' }, // 멤버십
    { fieldName: 'hcRfndDsbAmt', dataType: 'number' }, // 홈케어멤버십
    { fieldName: 'lnRfndDsbAmt', dataType: 'number' }, // 장기할부
    { fieldName: 'lmRfndDsbAmt', dataType: 'number' }, // 할부금
    { fieldName: 'kmRfndDsbAmt', dataType: 'number' }, // K머니
    { fieldName: 'rgRfndDsbAmt', dataType: 'number' }, // 정기배송
    { fieldName: 'sumRfndDsbAmt', dataType: 'number' }, // 전금합계
  ];

  const columns = [
    { fieldName: 'refundDivision', header: t('MSG_TXT_BLTF_DV'), width: '176', options: codes.SELL_TP_DTL_CD },
    { fieldName: 'rtRfndDsbAmt', header: t('MSG_TXT_RENTAL'), width: '111', styleName: 'text-right' },
    { fieldName: 'lsRfndDsbAmt', header: t('MSG_TXT_LEASE'), width: '111', styleName: 'text-right' },
    { fieldName: 'elRfndDsbAmt', header: t('MSG_TXT_ENVR_LEASE'), width: '111', styleName: 'text-right' },
    { fieldName: 'mbRfndDsbAmt', header: t('MSG_TXT_MEMBERSHIP'), width: '111', styleName: 'text-right' },
    { fieldName: 'hcRfndDsbAmt', header: t('MSG_TXT_HCR_MSH'), width: '150', styleName: 'text-right' },
    { fieldName: 'lnRfndDsbAmt', header: t('MSG_TXT_LTM_ISTM'), width: '111', styleName: 'text-right' },
    { fieldName: 'lmRfndDsbAmt', header: t('MSG_TXT_INTAM'), width: '111', styleName: 'text-right' },
    { fieldName: 'kmRfndDsbAmt', header: t('MSG_TXT_K_MON'), width: '111', styleName: 'text-right' },
    { fieldName: 'rgRfndDsbAmt', header: t('MSG_TXT_REG_DLVR'), width: '176', styleName: 'text-right' },
    { fieldName: 'sumRfndDsbAmt', header: t('MSG_TXT_BLTF_SUM'), width: '213', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setHeaderSummaries({
    visible: true,
    items: [{ height: 40 }],
  });
  view.columnByName('refundDivision').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.columnByName('rtRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('lsRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('elRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('mbRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('hcRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('lnRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('lmRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('kmRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('rgRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('sumRfndDsbAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });

  view.onScrollToBottom = (g) => {
    if (pageInfo3.value.pageIndex * pageInfo3.value.pageSize <= g.getItemCount()) {
      pageInfo3.value.pageIndex += 1;
      fetchData3();
    }
  };
});
</script>
