<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DEB
2. 프로그램 ID : WwdebMonthlyAdsbMgtM
3. 작성자 : daewon.kim
4. 작성일 : 2023.06.09 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 월별 재지급 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_YEAR_OCCURNCE')"
          required
        >
          <kw-date-picker
            v-model="searchParams.redfAdsbOcYm"
            :label="t('MSG_TXT_YEAR_OCCURNCE')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_PSTN_DV')">
          <kw-select
            v-model="searchParams.pstnDvCd"
            :options="codes.DDTN_RPLC_WELLS_PSTN_DV_CD"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_INQR_BASE')">
          <kw-option-group
            v-model="gridType.type"
            type="radio"
            :options="gridTpCd"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_OG_TP')">
          <kw-select
            v-model="searchParams.ogTpCd"
            :options="filterOgTpCd"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_PRTNR_NUMBER')">
          <kw-input
            v-model="searchParams.prtnrNo"
            regex="num"
            icon="search"
            :label="t('MSG_TXT_PRTNR_NUMBER')"
            rules="max:10|numeric"
            @click-icon="onClickSearchPartner"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_CLTN_YN')">
          <kw-select
            v-model="searchParams.cltnYn"
            :options="codes.DDTN_RPLC_BLNGT_DV_CD"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top
        v-if="gridType.type === 'main'"
      >
        <template #left>
          <kw-paging-info
            v-model:page-index="pageMainInfo.pageIndex"
            v-model:page-size="pageMainInfo.pageSize"
            :total-count="pageMainInfo.totalCount"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>

        <!-- 테스트용 재지급팝업 연결 -->
        <kw-btn
          primary
          dense
          :label="t('재지급(팝업)')"
          @click="onClickTest"
        />

        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="pageMainInfo.totalCount === 0"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickMainExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          primary
          dense
          :label="t('MSG_BTN_ADSB_OJ_AMT_CRT')"
          @click="onClickAdsbObjAndAmtCreate"
        />
      </kw-action-top>

      <kw-action-top
        v-if="gridType.type === 'second'"
      >
        <template #left>
          <kw-paging-info
            v-model:page-index="pageSecondInfo.pageIndex"
            v-model:page-size="pageSecondInfo.pageSize"
            :total-count="pageSecondInfo.totalCount"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>

        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="pageSecondInfo.totalCount === 0"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickSecondExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          primary
          dense
          :label="t('MSG_BTN_ADSB_OJ_AMT_CRT')"
          @click="onClickAdsbObjAndAmtCreate"
        />
      </kw-action-top>

      <kw-grid
        v-if="gridType.type === 'main'"
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        :page-size="pageMainInfo.pageSize-1"
        :total-count="pageMainInfo.totalCount"
        @init="initGrid"
      />

      <kw-grid
        v-if="gridType.type === 'second'"
        ref="grdSecondRef"
        name="grdSecond"
        :visible-rows="10"
        :page-size="pageSecondInfo.pageSize-1"
        :total-count="pageSecondInfo.totalCount"
        @init="initGrid1"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { codeUtil, getComponentType, gridUtil, useDataService, useMeta, modal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const { t } = useI18n();
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSecondRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
const dataService = useDataService();
const { getConfig } = useMeta();
const currentMonth = dayjs().subtract(0, 'month').format('YYYYMM');
const { getUserInfo } = useMeta();
const userInfo = getUserInfo();

const codes = await codeUtil.getMultiCodes(
  'REDF_OG_TP_CD',
  'DDTN_RPLC_BLNGT_DV_CD',
  'DDTN_RPLC_WELLS_PSTN_DV_CD',
);

const gridTpCd = ref([
  {
    codeId: 'main',
    codeName: t('MSG_TXT_SELLER_PERSON_DV'),
  },
  {
    codeId: 'second',
    codeName: t('MSG_TXT_CNTRCT_DV'),
  },
]);

const filterOgTpCd = ref([]);
codes.REDF_OG_TP_CD.forEach((e) => {
  if (e.codeId.includes('W')) {
    filterOgTpCd.value.push({
      codeId: e.codeId.trim(),
      codeName: e.codeName.trim(),
    });
  }
});

const pageMainInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const pageSecondInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

let cachedParams;

const searchParams = ref({
  redfAdsbOcYm: currentMonth, // 발생년월
  pstnDvCd: codes.DDTN_RPLC_WELLS_PSTN_DV_CD[0].codeId,
  ogTpCd: 'ALL', // 조직유형
  prtnrNo: '', // 파트너번호
  cltnYn: 'ALL', // 해약여부
});

const gridType = ref({
  type: 'main',
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/deduction/adsb/prtnr/paging', { params: { ...cachedParams, ...pageMainInfo.value } });
  const { list: adsbes, pageInfo: pagingResult } = res.data;

  pageMainInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(adsbes);
  dataSource.checkRowStates(true);
}

async function fetchData2() {
  const res = await dataService.get('/sms/wells/deduction/adsb/contract/paging', { params: { ...cachedParams, ...pageSecondInfo.value } });
  const { list: adsbes, pageInfo: pagingResult } = res.data;

  pageSecondInfo.value = pagingResult;
  const view = grdSecondRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(adsbes);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  if (gridType.value.type === 'main') {
    grdMainRef.value.getData().clearRows();
    pageMainInfo.value.pageIndex = 1;
    pageMainInfo.value.totalCount = 0;
  } else if (gridType.value.type === 'second') {
    grdSecondRef.value.getData().clearRows();
    pageSecondInfo.value.pageIndex = 1;
    pageSecondInfo.value.totalCount = 0;
  }
  cachedParams = cloneDeep(searchParams.value);

  if (gridType.value.type === 'main') {
    await fetchData();
  } else if (gridType.value.type === 'second') {
    await fetchData2();
  }
}

async function onClickMainExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/deduction/adsb/prtnr/excel-download', { params: cachedParams, timeout: 100000 });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSecondExcelDownload() {
  const view = grdSecondRef.value.getView();
  const res = await dataService.get('/sms/wells/deduction/adsb/contract/excel-download', { params: cachedParams, timeout: 100000 });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

/**
 * 파트너번호 검색 팝업
 */
async function onClickSearchPartner() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: searchParams.value.ogTpCd === 'ALL' ? userInfo.ogTpCd : searchParams.value.ogTpCd,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

async function onClickAdsbObjAndAmtCreate() {
  const result = await modal({
    component: 'ZwdebAdsbObjectAndAmtBulkCreateP',
    componentProps: {
      ogTpCd: userInfo.ogTpCd,
    },
  });
  if (result) {
    await onClickSearch();
  }
}

async function onClickTest() {
  const result = await modal({
    component: 'WwdebAgainDisbursementDetailP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: searchParams.value.ogTpCd,
    },
  });
  if (result) {
    await onClickSearch();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'redfAdsbOcYm' },
    { fieldName: 'perfYm' },
    { fieldName: 'ogCd' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvNm' },
    { fieldName: 'cltnYm' },
    { fieldName: 'redfAdsbDvNm' },
    { fieldName: 'prAdsbAmt', dataType: 'number' },
    { fieldName: 'ogAdsbAmt', dataType: 'number' },
    { fieldName: 'sumAdsbAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'redfAdsbOcYm',
      header: t('MSG_TXT_YEAR_OCCURNCE'),
      width: '120',
      styleName: 'text-center',
      datetimeFormat: 'YYYY-MM',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    },
    { fieldName: 'perfYm', header: t('MSG_TXT_PERF_YM'), width: '120', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUMBER'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '120', styleName: 'text-center' },
    { fieldName: 'cltnYm', header: t('MSG_TXT_CLTN_YM'), width: '120', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'redfAdsbDvNm', header: t('MSG_TXT_DSB_DV'), width: '120', styleName: 'text-center' },
    { fieldName: 'prAdsbAmt',
      header: t('MSG_TXT_INDV'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    { fieldName: 'ogAdsbAmt',
      header: t('MSG_TXT_OG'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    { fieldName: 'sumAdsbAmt',
      header: t('MSG_TXT_ADSB_AMT_SUM'),
      width: '258',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true; // create number indicator column

  view.setColumnLayout([

    'redfAdsbOcYm', 'perfYm', 'ogCd', 'prtnrNo', 'prtnrKnm', 'rsbDvNm', 'cltnYm', 'redfAdsbDvNm',
    {
      header: t('MSG_TXT_ADSB_AMT'),
      direction: 'horizontal',
      items: ['prAdsbAmt', 'ogAdsbAmt'],
    },
    'sumAdsbAmt',
  ]);

  view.onScrollToBottom = async (g) => {
    if (pageMainInfo.value.pageIndex * pageMainInfo.value.pageSize <= g.getItemCount()) {
      pageMainInfo.value.pageIndex += 1;
      await fetchData();
    }
  };

  // 헤더쪽 합계 행고정, summary
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
  view.layoutByColumn('redfAdsbOcYm').summaryUserSpans = [{ colspan: 8 }];
}

function initGrid1(data, view) {
  const fields = [
    { fieldName: 'ocDt' },
    { fieldName: 'perfDt' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrNoSn' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'sellPrtnrAdsbAmt', dataType: 'number' },
    { fieldName: 'brchPrtnrNo' },
    { fieldName: 'brchPrtnrKnm' },
    { fieldName: 'brchAdsbAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'ocDt',
      header: t('MSG_TXT_PRCSDT'),
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'date',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    },
    { fieldName: 'perfDt', header: t('MSG_TXT_BLNG_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '207',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      } },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUMBER'), width: '150', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'sellPrtnrAdsbAmt',
      header: t('MSG_TXT_ADSB_AMT'),
      width: '175',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'brchPrtnrNo', header: t('MSG_TXT_PRTNR_NUMBER'), width: '150', styleName: 'text-center' },
    { fieldName: 'brchPrtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'brchAdsbAmt',
      header: t('MSG_TXT_ADSB_AMT'),
      width: '175',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true; // create number indicator column

  view.setColumnLayout([

    'ocDt', 'perfDt', 'cntrNoSn',
    {
      header: t('MSG_TXT_SELLER_PERSON'),
      direction: 'horizontal',
      items: ['prtnrNo', 'prtnrKnm', 'sellPrtnrAdsbAmt'],
    },
    {
      header: t('MSG_TXT_BRMGR'),
      direction: 'horizontal',
      items: ['brchPrtnrNo', 'brchPrtnrKnm', 'brchAdsbAmt'],
    },

  ]);

  view.onScrollToBottom = async (g) => {
    if (pageSecondInfo.value.pageIndex * pageSecondInfo.value.pageSize <= g.getItemCount()) {
      pageSecondInfo.value.pageIndex += 1;
      await fetchData2();
    }
  };

  // 헤더쪽 합계 행고정, summary
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
  view.layoutByColumn('ocDt').summaryUserSpans = [{ colspan: 5 }];
  view.layoutByColumn('brchPrtnrNo').summaryUserSpans = [{ colspan: 2 }];
}

</script>
