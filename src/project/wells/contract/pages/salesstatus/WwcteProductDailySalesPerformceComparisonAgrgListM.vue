<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwcteProductDailySalesPerformceComparisonAgrgM
3. 작성자 : gs.itsm211 / YS.JEON
4. 작성일 : 2023.11.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품별 일일 매출실적 비교 집계 조회
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 출력유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRNT_TYPE')"
        >
          <!-- ['전월포함', '멤버십 접수포함'] -->
          <kw-option-group
            v-model="searchParams.prntTp"
            type="radio"
            :options="[{ codeId: 'PL', codeName: t('MSG_TXT_LSTMM_INC') },
                       { codeId: 'PM', codeName: t('MSG_TXT_MSH_APPL_INC') }]"
          />
        </kw-search-item>

        <!-- 실적기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_PRD')"
          :colspan="2"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.perfStrtDt"
            v-model:to="searchParams.perfEndDt"
            :label="$t('MSG_TXT_PERF_PRD')"
            rules="date_range_required"
          />
        </kw-search-item>
        <!-- 판매구분 -->
        <kw-search-item :label="$t('MSG_TXT_SLS_CAT')">
          <kw-select
            v-model="searchParams.sellOgTpCd"
            :options="codes.OG_TP_CD"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!--출력구분-->
        <kw-search-item
          :label="$t('MSG_TXT_PRNT_DV')"
          :colspan="2"
        >
          <!-- ['상품', '상품군'] -->
          <kw-option-group
            v-model="searchParams.prntDv"
            type="radio"
            :options="[{ codeId: 'PC', codeName: t('MSG_TXT_PRDT') },
                       { codeId: 'PG', codeName: t('MSG_TXT_PDGRP') }]"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
            @change="fetchData"
          />
        </template>

        <kw-btn
          v-permission:download
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          icon="download_on"
          dense
          secondary
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        v-if="searchParams.prntTp === 'PL'"
        ref="grdLstmmRef"
        name="grdLstmm"
        @init="initGridLstmm"
      />
      <kw-grid
        v-if="searchParams.prntTp === 'PM'"
        ref="grdMshRef"
        name="grdMsh"
        @init="initGridMsh"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, useDataService, gridUtil, useMeta /* , notify */ } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const grdLstmmRef = ref(getComponentType('KwGrid'));
const grdMshRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'OG_TP_CD',
);

let cachedParams;
const now = dayjs();

const searchParams = ref({
  prntTp: 'PL', // 출력유형 (default : 전월포함)
  perfStrtDt: now.startOf('month').format('YYYYMMDD'), // 실적기간-시작일자
  perfEndDt: now.format('YYYYMMDD'), // 실적기간-종료일자
  sellOgTpCd: '', // 판매구분=조직구분
  prntDv: 'PC', // 출력구분 (default : 상품)
  lastMonth: '', // 전월
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

codes.OPTN_DV = [
  { codeId: 'O', codeName: t('MSG_TXT_OPTN') },
  { codeId: 'N', codeName: t('MSG_TXT_NOPR') },
];
codes.OG_CP_CD = [
  { codeId: 'W01', codeName: `P${t('MSG_TXT_OG')}` },
  { codeId: 'W02', codeName: `M${t('MSG_TXT_OG')}` },
];

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  if (isEmpty(cachedParams)) return;

  const { prntTp } = searchParams.value;
  let res;
  if (prntTp === 'PL') {
    res = await dataService.get('/sms/wells/contract/contracts/product-daily-sales-performce-comparison-agrg/lstmm', { params: { ...cachedParams } });
  } else if (prntTp === 'PM') {
    res = await dataService.get('/sms/wells/contract/contracts/product-daily-sales-performce-comparison-agrg/msh', { params: { ...cachedParams } });
  }
  console.log(res.data);
  // const productAccountList = res.data.list;
  const productAccountList = res.data;
  totalCount.value = productAccountList.length;
  let mainView;
  if (prntTp === 'PL') {
    mainView = grdLstmmRef.value.getView();
  } else if (prntTp === 'PM') {
    mainView = grdMshRef.value.getView();
  }
  mainView.getDataSource().setRows(productAccountList);
  mainView.resetCurrent();
}

async function onClickSearch() {
  // grdLstmmRef.value.getData().clearRows();
  // grdMshRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  searchParams.value.lastMonth = dayjs(searchParams.value.perfStrtDt).add(-1, 'month').format('YYYYMM');
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 초기화버튼 클릭 이벤트
async function onClickReset() {
  grdLstmmRef.value.getData().clearRows();
}

async function onClickExcelDownload() {
  const { prntTp } = searchParams.value;
  let view;
  if (prntTp === 'PL') {
    view = grdLstmmRef.value.getView();
  } else if (prntTp === 'PM') {
    view = grdMshRef.value.getView();
  }
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridLstmm = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'pdHclsfNm', header: t('MSG_TXT_PD_HCLSF'), width: '116', styleName: 'text-center' }, // 상품대분류
    { fieldName: 'pdMclsfNm', header: t('MSG_TXT_PD_MCLSF'), width: '116', styleName: 'text-center' }, // 상품중분류
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '116', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '239', styleName: 'text-left' }, // 상품명
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '116', styleName: 'text-center', options: codes.SELL_TP_DTL_CD }, // 판매유형상세
    // 당월
    { fieldName: 'crdovrCt', header: t('MSG_TXT_CRDOVR'), width: '120', styleName: 'text-right', dataType: 'number' }, // 이월
    { fieldName: 'inflowCt', header: t('MSG_TXT_INFLW'), width: '120', styleName: 'text-right', dataType: 'number' }, // 유입
    { fieldName: 'resignCt', header: t('MSG_TXT_EXPIRED'), width: '120', styleName: 'text-right', dataType: 'number' }, // 해지
    { fieldName: 'expirationCt', header: t('MSG_TXT_EXN'), width: '120', styleName: 'text-right', dataType: 'number' }, // 만료
    { fieldName: 'nincCt', header: t('MSG_TXT_NINC'), width: '120', styleName: 'text-right', dataType: 'number' }, // 순증
    { fieldName: 'sumCt', header: t('MSG_TXT_SUM'), width: '120', styleName: 'text-right', dataType: 'number' }, // 합계
    { fieldName: 'lstmmCprNincCt', header: `${t('MSG_TXT_LSTMM_CPR')} ${t('MSG_TXT_NINC_ICRDCR')}`, width: '120', styleName: 'text-right', dataType: 'number' }, // 전월대비 순증증감
    { fieldName: 'receiptCt', header: t('MSG_TXT_RCP'), width: '120', styleName: 'text-right', dataType: 'number' }, // 접수
    { fieldName: 'chdvcCt', header: t('MSG_TXT_CHNG'), width: '120', styleName: 'text-right', dataType: 'number' }, // 기변
    // 전월
    { fieldName: 'lstmmCrdovrCt', header: t('MSG_TXT_CRDOVR'), width: '120', styleName: 'text-right', dataType: 'number' }, // 이월
    { fieldName: 'lstmmInflowCt', header: t('MSG_TXT_INFLW'), width: '120', styleName: 'text-right', dataType: 'number' }, // 유입
    { fieldName: 'lstmmResignCt', header: t('MSG_TXT_EXPIRED'), width: '120', styleName: 'text-right', dataType: 'number' }, // 해지
    { fieldName: 'lstmmExpirationCt', header: t('MSG_TXT_EXN'), width: '120', styleName: 'text-right', dataType: 'number' }, // 만료
    { fieldName: 'lstmmNincCt', header: t('MSG_TXT_NINC'), width: '120', styleName: 'text-right', dataType: 'number' }, // 순증
    { fieldName: 'lstmmSumCt', header: t('MSG_TXT_SUM'), width: '120', styleName: 'text-right', dataType: 'number' }, // 합계
    { fieldName: 'lstmmChdvcCt', header: t('MSG_TXT_CHNG'), width: '120', styleName: 'text-right', dataType: 'number' }, // 기변
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });
  view.columnByName('pdNm').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.columnByName('crdovrCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('inflowCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('resignCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('expirationCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('nincCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('sumCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('lstmmCprNincCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('receiptCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('chdvcCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });

  view.columnByName('lstmmCrdovrCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('lstmmInflowCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('lstmmResignCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('lstmmExpirationCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('lstmmNincCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('lstmmSumCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('lstmmChdvcCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });

  // view.rowIndicator.visible = true;
  // view.checkBar.visible = false;

  // multi row header setting
  const layout1 = [
    {
      header: t('MSG_TXT_DIV'), // 구분
      direction: 'horizontal',
      items: ['pdCd', 'pdNm', 'sellTpCd'],
    },
    {
      header: t('MSG_TXT_THM'), // 당월
      direction: 'horizontal',
      items: ['crdovrCt', 'inflowCt', 'resignCt', 'expirationCt', 'nincCt', 'sumCt', 'lstmmCprNincCt', 'receiptCt', 'chdvcCt'],
    },
    {
      header: t('MSG_TXT_LSTMM'), // 전월
      direction: 'horizontal',
      items: ['lstmmCrdovrCt', 'lstmmInflowCt', 'lstmmResignCt', 'lstmmExpirationCt', 'lstmmNincCt', 'lstmmSumCt', 'lstmmChdvcCt'],
    },
  ];
  view.setColumnLayout(layout1);
});

const initGridMsh = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'pdHclsfNm', header: t('MSG_TXT_PD_HCLSF'), width: '116', styleName: 'text-center' }, // 상품대분류
    { fieldName: 'pdMclsfNm', header: t('MSG_TXT_PD_MCLSF'), width: '116', styleName: 'text-center' }, // 상품중분류
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '116', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '239', styleName: 'text-left' }, // 상품명
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '116', styleName: 'text-center', options: codes.SELL_TP_DTL_CD }, // 판매유형상세

    { fieldName: 'crdovrCt', header: t('MSG_TXT_CRDOVR'), width: '120', styleName: 'text-right', dataType: 'number' }, // 이월
    { fieldName: 'inflowCt', header: t('MSG_TXT_INFLW'), width: '120', styleName: 'text-right', dataType: 'number' }, // 유입
    { fieldName: 'resignCt', header: t('MSG_TXT_EXPIRED'), width: '120', styleName: 'text-right', dataType: 'number' }, // 해지
    { fieldName: 'expirationCt', header: t('MSG_TXT_EXN'), width: '120', styleName: 'text-right', dataType: 'number' }, // 만료
    { fieldName: 'nincCt', header: t('MSG_TXT_NINC'), width: '120', styleName: 'text-right', dataType: 'number' }, // 순증
    { fieldName: 'sumCt', header: t('MSG_TXT_SUM'), width: '120', styleName: 'text-right', dataType: 'number' }, // 합계
    { fieldName: 'lstmmCprNincCt', header: t('MSG_TXT_NINC_ICRDCR'), width: '120', styleName: 'text-right', dataType: 'number' }, // 전월대비 순증증감
    { fieldName: 'receiptCt', header: t('MSG_TXT_RCP'), width: '120', styleName: 'text-right', dataType: 'number' }, // 접수
    { fieldName: 'chdvcCt', header: t('MSG_TXT_CHNG'), width: '120', styleName: 'text-right', dataType: 'number' }, // 기변

    { fieldName: 'spayCt', header: t('MSG_TIT_SPAY'), width: '120', styleName: 'text-right', dataType: 'number' }, // 일시불
    { fieldName: 'sellCt', header: t('MSG_TXT_SELL'), width: '120', styleName: 'text-right', dataType: 'number' }, // 판매
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });
  view.columnByName('pdNm').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.columnByName('crdovrCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('inflowCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('resignCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('expirationCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('nincCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('sumCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('lstmmCprNincCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('receiptCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('chdvcCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('spayCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('sellCt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });

  view.rowIndicator.visible = true;
  view.checkBar.visible = false;

  // multi row header setting
  const layout1 = [
    {
      header: t('MSG_TXT_DIV'), // 구분
      direction: 'horizontal',
      items: ['pdCd', 'pdNm', 'sellTpCd'],
    },
    'crdovrCt', 'inflowCt', 'resignCt', // 이월, 유입, 이탈
    {
      header: t('MSG_TXT_RENTAL'), // 렌탈
      direction: 'horizontal',
      items: ['expirationCt'], // 만료
    },
    {
      header: t('MSG_TXT_MMBR'), // 멤버쉽
      direction: 'horizontal',
      items: ['receiptCt'], // 접수
    },
    'spayCt', // 일시불
    'sumCt', // 합계
    'nincCt', // 순증
    {
      header: t('MSG_TXT_LSTMM_CPR'), // 전월대비
      direction: 'horizontal',
      items: ['lstmmCprNincCt'], // 순증증감
    },
    'sellCt', // 판매
    'chdvcCt', // 기변
  ];
  view.setColumnLayout(layout1);
});

</script>

<style scoped>
</style>
