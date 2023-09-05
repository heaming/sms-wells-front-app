<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DED
2. 프로그램 ID : WwdeaHomeMasterRedfCreateM
3. 작성자 : daewon.kim
4. 작성일 : 2023.06.01 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 홈마스터 되물림 생성
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.perfYmFrom"
            v-model:to="searchParams.perfYmTo"
            :label="t('MSG_TXT_PERF_YM')"
            rules="date_range_required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_RSB_DV')">
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            type="radio"
            :options="codes.HMST_REDF_RSB_DV_CD"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_PROCS_TP')">
          <kw-select
            v-model="searchParams.redfAdsbTpCd"
            :options="filterRedfAdsbTpCd"
          />
        </kw-search-item>
      </kw-search-row>
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
        <kw-search-item :label="t('MSG_TXT_OG_CD')">
          <kw-input
            v-model="searchParams.ogCd"
            icon="search"
            :label="t('MSG_TXT_OG_CD')"
            rules="max:7|alpha_num"
            @click-icon="onClickSearchOgCd"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_PRTNR_NUM')">
          <kw-input
            v-model="searchParams.prtnrNo"
            regex="num"
            icon="search"
            :label="t('MSG_TXT_PRTNR_NUM')"
            rules="max:10|numeric"
            @click-icon="onClickSearchPartner"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-if="searchParams.redfAdsbTpCd === '0202' "
            v-model:page-index="pageMainInfo.pageIndex"
            v-model:page-size="pageMainInfo.pageSize"
            :total-count="pageMainInfo.totalCount"
          />
          <kw-paging-info
            v-if="searchParams.redfAdsbTpCd === '0203' "
            v-model:page-index="pageSecondInfo.pageIndex"
            v-model:page-size="pageSecondInfo.pageSize"
            :total-count="pageSecondInfo.totalCount"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          v-if="searchParams.redfAdsbTpCd === '0202' "
          icon="download_on"
          dense
          secondary
          :disable="pageMainInfo.totalCount === 0"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-btn
          v-if="searchParams.redfAdsbTpCd === '0203' "
          icon="download_on"
          dense
          secondary
          :disable="pageSecondInfo.totalCount === 0"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          :label="t('MSG_BTN_REDF_AMT_CRT')"
          dense
          primary
          @click="onClickRedfAmountCreate"
        />
      </kw-action-top>
      <kw-grid
        v-show="searchParams.redfAdsbTpCd === '0202' "
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        :page-size="pageMainInfo.pageSize-1"
        :total-count="pageMainInfo.totalCount"
        @init="initGrid"
      />
      <kw-grid
        v-show="searchParams.redfAdsbTpCd === '0203' "
        ref="grdSecondRef"
        name="grdSecond"
        :visible-rows="10"
        :page-size="pageSecondInfo.pageSize-1"
        :total-count="pageSecondInfo.totalCount"
        @init="initGrid2"
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
const lastMonth = dayjs().subtract(1, 'month').format('YYYYMM');
const currentMonth = dayjs().subtract(0, 'month').format('YYYYMM');
const { getUserInfo } = useMeta();
const userInfo = getUserInfo();

const codes = await codeUtil.getMultiCodes(
  'REDF_OG_TP_CD',
  'HMST_REDF_RSB_DV_CD',
  'REDF_ADSB_TP_CD',
);

const filterRedfAdsbTpCd = ref([]);
codes.REDF_ADSB_TP_CD.forEach((e) => {
  if (e.codeId === '0202' || e.codeId === '0203') {
    filterRedfAdsbTpCd.value.push({
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
  perfYmFrom: lastMonth, // 실적년월 from
  perfYmTo: currentMonth, // 실적년월 to
  redfAdsbTpCd: '0202', // 처리유형
  // rsbDvCd: '',
  rsbDvCd: codes.HMST_REDF_RSB_DV_CD[0].codeId, // 직책구분코드
  prtnrNo: '', // 파트너번호
  ogCd: '', // 조직코드
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/deduction/redf/home-master/paging', { params: { ...cachedParams, ...pageMainInfo.value }, timeout: 60000 });
  const { list: redfes, pageInfo: pagingResult } = res.data;

  pageMainInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(redfes);
  dataSource.checkRowStates(true);
}

async function fetchData2() {
  const res = await dataService.get('/sms/wells/deduction/redf/home-master/delinquent/paging', { params: { ...cachedParams, ...pageSecondInfo.value }, timeout: 60000 });
  const { list: redfes, pageInfo: pagingResult } = res.data;

  pageSecondInfo.value = pagingResult;
  const view = grdSecondRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(redfes);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  if (searchParams.value.redfAdsbTpCd === '0202') {
    grdMainRef.value.getData().clearRows();
    pageMainInfo.value.pageIndex = 1;
    cachedParams = cloneDeep(searchParams.value);
    await fetchData();
  } else if (searchParams.value.redfAdsbTpCd === '0203') {
    grdSecondRef.value.getData().clearRows();
    pageSecondInfo.value.pageIndex = 1;
    cachedParams = cloneDeep(searchParams.value);
    await fetchData2();
  }
}

async function onClickExcelDownload() {
  let view;
  let res;
  if (searchParams.value.redfAdsbTpCd === '0202') {
    /* 취소 세팅 */
    view = grdMainRef.value.getView();
    res = await dataService.get('/sms/wells/deduction/redf/home-master/excel-download', { params: cachedParams, timeout: 60000 });
  } else if (searchParams.value.redfAdsbTpCd === '0203') {
    /* 연체 세팅 */
    view = grdSecondRef.value.getView();
    res = await dataService.get('/sms/wells/deduction/redf/home-master/delinquent/excel-download', { params: cachedParams, timeout: 60000 });
  }

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
      ogTpCd: userInfo.ogTpCd,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

/**
 * 조직코드 검색 팝업
 */
async function onClickSearchOgCd() {
  const { result, payload } = await modal({
    component: 'ZwogzOrganizationListP',
    componentProps: {
      ogNm: searchParams.value.ogCd,
      ogTpCd: userInfo.ogTpCd,
      baseYm: dayjs().format('YYYYMM'),
    },
  });
  if (result) {
    searchParams.value.ogCd = payload.ogCd;
  }
}

/* 직책구분: 개인사업자 columnLayout set */
const rsbDvCdPersonColumnLayout = [
  {
    header: t('MSG_TXT_BASE_INF'),
    direction: 'horizontal',
    items: ['perfYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM'),
    direction: 'horizontal',
    items: ['tEnvrElhmCntPr', 'aEnvrElhmCntPr', 'bEnvrElhmCntPr', 'envrElhmCntPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_RENTAL_MATT'),
    direction: 'horizontal',
    items: ['tEnvrElhmRentalMattPr', 'aEnvrElhmRentalMattPr', 'bEnvrElhmRentalMattPr', 'envrElhmRentalMattPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_RENTAL_MATT_EXCP'),
    direction: 'horizontal',
    items: ['tEnvrElhmRentalMattExcpPr', 'aEnvrElhmRentalMattExcpPr', 'bEnvrElhmRentalMattExcpPr', 'envrElhmRentalMattExcpPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_SPAY'),
    direction: 'horizontal',
    items: ['tEnvrElhmSpayPr', 'aEnvrElhmSpayPr', 'bEnvrElhmSpayPr', 'envrElhmSpayPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP_SPAY'),
    direction: 'horizontal',
    items: ['tEnvrElhmExcpSpayPr', 'aEnvrElhmExcpSpayPr', 'bEnvrElhmExcpSpayPr', 'envrElhmExcpSpayPr'],
  },
  {
    header: t('MSG_TXT_REDF_FEE'),
    direction: 'horizontal',
    items: ['envrBznsRedfPr', 'encrgRedf1', 'encrgRedf2Pr', 'spayRedfPr', 'sumRedfAmtPr'],
  },
];

/* 직책구분: 사업자지점장 columnLayout set */
const rsbDvCdBranchManagerColumnLayout = [
  {
    header: t('MSG_TXT_BASE_INF'),
    direction: 'horizontal',
    items: ['perfYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM'),
    direction: 'horizontal',
    items: ['tEnvrElhmCntPr', 'aEnvrElhmCntPr', 'bEnvrElhmCntPr', 'envrElhmCntPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_RENTAL_MATT'),
    direction: 'horizontal',
    items: ['tEnvrElhmRentalMattPr', 'aEnvrElhmRentalMattPr', 'bEnvrElhmRentalMattPr', 'envrElhmRentalMattPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_RENTAL_MATT_EXCP'),
    direction: 'horizontal',
    items: ['tEnvrElhmRentalMattExcpPr', 'aEnvrElhmRentalMattExcpPr', 'bEnvrElhmRentalMattExcpPr', 'envrElhmRentalMattExcpPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_SPAY'),
    direction: 'horizontal',
    items: ['tEnvrElhmSpayPr', 'aEnvrElhmSpayPr', 'bEnvrElhmSpayPr', 'envrElhmSpayPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP_SPAY'),
    direction: 'horizontal',
    items: ['tEnvrElhmExcpSpayPr', 'aEnvrElhmExcpSpayPr', 'bEnvrElhmExcpSpayPr', 'envrElhmExcpSpayPr'],
  },
  {
    header: t('MSG_TXT_OG_ENVR_ELHM'),
    direction: 'horizontal',
    items: ['tEnvrElhmCntJo', 'aEnvrElhmCntJo', 'bEnvrElhmCntJo', 'envrElhmCntJo'],
  },
  {
    header: t('MSG_TXT_OG_ENVR_ELHM_RENTAL_MATT'),
    direction: 'horizontal',
    items: ['tEnvrElhmRentalMattJo', 'aEnvrElhmRentalMattJo', 'bEnvrElhmRentalMattJo', 'envrElhmRentalMattJo'],
  },
  {
    header: t('MSG_TXT_OG_ENVR_ELHM_RENTAL_MATT_EXCP'),
    direction: 'horizontal',
    items: ['tEnvrElhmRentalMattExcpJo', 'aEnvrElhmRentalMattExcpJo', 'bEnvrElhmRentalMattExcpJo', 'envrElhmRentalMattExcpJo'],
  },
  {
    header: t('MSG_TXT_OG_ENVR_ELHM_SPAY'),
    direction: 'horizontal',
    items: ['tEnvrElhmSpayJo', 'aEnvrElhmSpayJo', 'bEnvrElhmSpayJo', 'envrElhmSpayJo'],
  },
  {
    header: t('MSG_TXT_OG_ENVR_ELHM_EXCP_SPAY'),
    direction: 'horizontal',
    items: ['tEnvrElhmExcpSpayJo', 'aEnvrElhmExcpSpayJo', 'bEnvrElhmExcpSpayJo', 'envrElhmExcpSpayJo'],
  },
  {
    header: t('MSG_TXT_REDF_FEE'),
    direction: 'horizontal',
    items: ['envrBznsRedfJo', 'encrgRedf1', 'encrgRedf2Jo', 'spayRedfJo', 'ogSellPrpn', 'ogSellLkRedf', 'ogMgtRedf', 'nwSellRedf', 'ogSellPrpnRedf', 'sumRedfAmtJo'],
  },
];

/* 처리유형: 연체(0203) columnLayout set */
const delinquentColumnLayout = [
  'baseYm', 'perfYm', 'prtnrNo', 'prtnrKnm', 'ogTpNm', 'perfDvNm',
  {
    header: t('MSG_TXT_REDF_PERF'),
    direction: 'horizontal',
    items: ['rentalRedfPerf', 'envrElhmExcpSpayRedfPerf'],
  },
  {
    header: t('MSG_TXT_DLQ_REDF_PERF'),
    direction: 'horizontal',
    items: ['rentalDlqRedfPerf', 'envrElhmExcpSpayDlqRedfPerf', 'dlqSum'],
  },
];

watch(() => [searchParams.value.redfAdsbTpCd, searchParams.value.rsbDvCd], async () => {
  grdMainRef.value.getData().clearRows();
  grdSecondRef.value.getData().clearRows();
  const view = grdMainRef.value.getView();
  const view2 = grdSecondRef.value.getView();

  if (searchParams.value.rsbDvCd === '01') {
    /* 개인사업자 columnLayout set */
    view.setColumnLayout(rsbDvCdPersonColumnLayout);
    return;
  }

  if (searchParams.value.rsbDvCd === '02') {
    /* 사업자지점장 columnLayout set */
    view.setColumnLayout(rsbDvCdBranchManagerColumnLayout);
    return;
  }

  if (searchParams.value.redfAdsbTpCd === '0203') {
    /* 연체 columnLayout set */
    view2.setColumnLayout(delinquentColumnLayout);
  }
});

/* 되물림 금액 생성 */
async function onClickRedfAmountCreate() {
  await modal({
    component: 'ZwdeaRedfAmountCreateP',
    componentProps: {
      ogTpCd: 'W03',
    },
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'perfYm' },
    { fieldName: 'ogCd' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'pstnDvCd' },
    // { fieldName: 'rsbDvNm' },
    { fieldName: 'tEnvrElhmCntPr', dataType: 'number' },
    { fieldName: 'aEnvrElhmCntPr', dataType: 'number' },
    { fieldName: 'bEnvrElhmCntPr', dataType: 'number' },
    { fieldName: 'envrElhmCntPr', dataType: 'number' },
    { fieldName: 'tEnvrElhmRentalMattPr', dataType: 'number' },
    { fieldName: 'aEnvrElhmRentalMattPr', dataType: 'number' },
    { fieldName: 'bEnvrElhmRentalMattPr', dataType: 'number' },
    { fieldName: 'envrElhmRentalMattPr', dataType: 'number' },
    { fieldName: 'tEnvrElhmRentalMattExcpPr', dataType: 'number' },
    { fieldName: 'aEnvrElhmRentalMattExcpPr', dataType: 'number' },
    { fieldName: 'bEnvrElhmRentalMattExcpPr', dataType: 'number' },
    { fieldName: 'envrElhmRentalMattExcpPr', dataType: 'number' },
    { fieldName: 'tEnvrElhmSpayPr', dataType: 'number' },
    { fieldName: 'aEnvrElhmSpayPr', dataType: 'number' },
    { fieldName: 'bEnvrElhmSpayPr', dataType: 'number' },
    { fieldName: 'envrElhmSpayPr', dataType: 'number' },
    { fieldName: 'tEnvrElhmExcpSpayPr', dataType: 'number' },
    { fieldName: 'aEnvrElhmExcpSpayPr', dataType: 'number' },
    { fieldName: 'bEnvrElhmExcpSpayPr', dataType: 'number' },
    { fieldName: 'envrElhmExcpSpayPr', dataType: 'number' },
    { fieldName: 'tEnvrElhmCntJo', dataType: 'number' },
    { fieldName: 'aEnvrElhmCntJo', dataType: 'number' },
    { fieldName: 'bEnvrElhmCntJo', dataType: 'number' },
    { fieldName: 'envrElhmCntJo', dataType: 'number' },
    { fieldName: 'tEnvrElhmRentalMattJo', dataType: 'number' },
    { fieldName: 'aEnvrElhmRentalMattJo', dataType: 'number' },
    { fieldName: 'bEnvrElhmRentalMattJo', dataType: 'number' },
    { fieldName: 'envrElhmRentalMattJo', dataType: 'number' },
    { fieldName: 'tEnvrElhmRentalMattExcpJo', dataType: 'number' },
    { fieldName: 'aEnvrElhmRentalMattExcpJo', dataType: 'number' },
    { fieldName: 'bEnvrElhmRentalMattExcpJo', dataType: 'number' },
    { fieldName: 'envrElhmRentalMattExcpJo', dataType: 'number' },
    { fieldName: 'tEnvrElhmSpayJo', dataType: 'number' },
    { fieldName: 'aEnvrElhmSpayJo', dataType: 'number' },
    { fieldName: 'bEnvrElhmSpayJo', dataType: 'number' },
    { fieldName: 'envrElhmSpayJo', dataType: 'number' },
    { fieldName: 'tEnvrElhmExcpSpayJo', dataType: 'number' },
    { fieldName: 'aEnvrElhmExcpSpayJo', dataType: 'number' },
    { fieldName: 'bEnvrElhmExcpSpayJo', dataType: 'number' },
    { fieldName: 'envrElhmExcpSpayJo', dataType: 'number' },
    { fieldName: 'envrBznsRedfPr', dataType: 'number' },
    { fieldName: 'encrgRedf1', dataType: 'number' },
    { fieldName: 'encrgRedf2Pr', dataType: 'number' },
    { fieldName: 'spayRedfPr', dataType: 'number' },
    { fieldName: 'ogSellPrpn', dataType: 'number' },
    { fieldName: 'ogSellLkRedf', dataType: 'number' },
    { fieldName: 'ogMgtRedf', dataType: 'number' },
    { fieldName: 'nwSellRedf', dataType: 'number' },
    { fieldName: 'ogSellPrpnRedf', dataType: 'number' },
    { fieldName: 'sumRedfAmtPr', dataType: 'number' },
    { fieldName: 'envrBznsRedfJo', dataType: 'number' },
    { fieldName: 'encrgRedf2Jo', dataType: 'number' },
    { fieldName: 'spayRedfJo', dataType: 'number' },
    { fieldName: 'sumRedfAmtJo', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'perfYm', header: t('MSG_TXT_BLNG_YM'), width: '80', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '80', styleName: 'text-center  ' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELL_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUM'), width: '80', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), width: '80', styleName: 'text-center' },

    /* 환경가전 - 개인 */
    { fieldName: 'tEnvrElhmCntPr', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmCntPr', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmCntPr', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmCntPr', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    /* 환경가전 렌탈(매트리스) - 개인 */
    { fieldName: 'tEnvrElhmRentalMattPr', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmRentalMattPr', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmRentalMattPr', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmRentalMattPr', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    /* 환경가전 렌탈(매트리스 외) - 개인 */
    { fieldName: 'tEnvrElhmRentalMattExcpPr', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmRentalMattExcpPr', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmRentalMattExcpPr', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmRentalMattExcpPr', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    /* 환경가전 일시불 - 개인 */
    { fieldName: 'tEnvrElhmSpayPr', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right  ', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmSpayPr', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmSpayPr', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmSpayPr', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    /* 환경가전 외 일시불 - 개인 */
    { fieldName: 'tEnvrElhmExcpSpayPr', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmExcpSpayPr', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmExcpSpayPr', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmExcpSpayPr', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    /* 조직 환경가전 */
    { fieldName: 'tEnvrElhmCntJo', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmCntJo', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmCntJo', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmCntJo', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    /* 조직 환경가전 렌탈(매트리스) */
    { fieldName: 'tEnvrElhmRentalMattJo', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmRentalMattJo', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmRentalMattJo', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmRentalMattJo', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    /* 조직 환경가전 렌탈(매트리스 외) */
    { fieldName: 'tEnvrElhmRentalMattExcpJo', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmRentalMattExcpJo', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmRentalMattExcpJo', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmRentalMattExcpJo', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    /* 조직 환경가전 일시불 */
    { fieldName: 'tEnvrElhmSpayJo', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmSpayJo', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmSpayJo', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmSpayJo', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    /* 조직 환경가전 외 일시불 */
    { fieldName: 'tEnvrElhmExcpSpayJo', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmExcpSpayJo', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmExcpSpayJo', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmExcpSpayJo', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    /* 되물림 수수료 - 개인 */
    { fieldName: 'envrBznsRedfPr', header: t('MSG_TXT_ENVR_ELHM_PRPN'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'encrgRedf2Pr', header: t('MSG_TXT_ENRG2'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'spayRedfPr', header: t('MSG_TXT_SNGL_PMNT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'sumRedfAmtPr', header: t('MSG_TXT_REDF_SUM_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },

    /* 되물림 수수료 - 조직 */
    { fieldName: 'envrBznsRedfJo', header: t('MSG_TXT_ENVR_ELHM_PRPN'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'encrgRedf2Jo', header: t('MSG_TXT_ENRG2'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'spayRedfJo', header: t('MSG_TXT_SNGL_PMNT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'ogSellPrpn', header: t('MSG_TXT_OG_SELL_PRPN'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'ogSellLkRedf', header: t('MSG_TXT_OG_SELL_CONN'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'ogMgtRedf', header: t('MSG_TXT_OG_MNGT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'nwSellRedf', header: t('MSG_TXT_NW_SELL'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'ogSellPrpnRedf', header: t('MSG_TXT_OG_SELL_SPAY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'sumRedfAmtJo', header: t('MSG_TXT_REDF_SUM_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },

    /* 되물림 수수료 - 개인/조직 공통 */
    { fieldName: 'encrgRedf1', header: t('MSG_TXT_ENRG1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout(rsbDvCdPersonColumnLayout);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onScrollToBottom = async (g) => {
    if (pageMainInfo.value.pageIndex * pageMainInfo.value.pageSize <= g.getItemCount()) {
      pageMainInfo.value.pageIndex += 1;
      await fetchData();
    }
  };
}

function initGrid2(data, view) {
  const fields = [
    { fieldName: 'baseYm' },
    { fieldName: 'perfYm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'ogTpNm' },
    { fieldName: 'perfDvNm' },
    { fieldName: 'rentalRedfPerf', dataType: 'number' },
    { fieldName: 'envrElhmExcpSpayRedfPerf', dataType: 'number' },
    { fieldName: 'rentalDlqRedfPerf', dataType: 'number' },
    { fieldName: 'envrElhmExcpSpayDlqRedfPerf', dataType: 'number' },
    { fieldName: 'dlqSum', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_YEAR_OCCURNCE'), width: '80', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'perfYm', header: t('MSG_TXT_PERF_YM'), width: '80', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUM'), width: '80', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'ogTpNm', header: t('MSG_TXT_OG_TP'), width: '80', styleName: 'text-center' },
    { fieldName: 'perfDvNm', header: t('MSG_TXT_PERF_DV'), width: '80', styleName: 'text-center' },
    { fieldName: 'rentalRedfPerf', header: t('MSG_TXT_RENTAL'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmExcpSpayRedfPerf', header: t('MSG_TXT_ELHM_EXCP_SPAY_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'rentalDlqRedfPerf', header: t('MSG_TXT_RENTAL'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmExcpSpayDlqRedfPerf', header: t('MSG_TXT_ELHM_EXCP_SPAY_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'dlqSum', header: t('MSG_TXT_AGG'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout([
    'baseYm', 'perfYm', 'prtnrNo', 'prtnrKnm', 'ogTpNm', 'perfDvNm',
    {
      header: t('MSG_TXT_REDF_PERF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['rentalRedfPerf', 'envrElhmExcpSpayRedfPerf'],
    },
    {
      header: t('MSG_TXT_DLQ_REDF_PERF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['rentalDlqRedfPerf', 'envrElhmExcpSpayDlqRedfPerf', 'dlqSum'],
    },
  ]);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onScrollToBottom = async (g) => {
    if (pageSecondInfo.value.pageIndex * pageSecondInfo.value.pageSize <= g.getItemCount()) {
      pageSecondInfo.value.pageIndex += 1;
      await fetchData2();
    }
  };
}

</script>

  <style scoped>
  </style>
