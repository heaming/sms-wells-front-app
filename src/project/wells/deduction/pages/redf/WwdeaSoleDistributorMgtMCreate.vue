<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DEA
2. 프로그램 ID : WwdeaSoleDistributorMgtMCreate
3. 작성자 : daewon.kim
4. 작성일 : 2023.05.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 총판/B2B 되물림 생성 탭
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="3"
    :modified-targets="['grdMain']"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_YEAR_OCCURNCE')"
        required
      >
        <kw-date-range-picker
          v-model:from="searchParams.redfAdsbOcYmFrom"
          v-model:to="searchParams.redfAdsbOcYmTo"
          :label="t('MSG_TXT_YEAR_OCCURNCE')"
          rules="date_range_required"
          type="month"
        />
      </kw-search-item>
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
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="t('MSG_TXT_BLG_CD')">
        <kw-input
          v-model="searchParams.ogCdFrom"
          regex="alpha_num"
        />
        <span>~</span>
        <kw-input
          v-model="searchParams.ogCdTo"
        />
      </kw-search-item>
      <kw-search-item :label="t('MSG_TXT_INQR_BASE')">
        <kw-option-group
          v-model="conditionParam.type"
          type="radio"
          :options="selectedCondition"
        />
      </kw-search-item>
      <kw-search-item :label="t('MSG_TXT_OG_TP')">
        <kw-option-group
          v-model="searchParams.ogTpCd"
          type="radio"
          :options="filterOgTpCd"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-if="searchType.prtnrAndW05"
          v-model:page-index="pageMainInfo.pageIndex"
          v-model:page-size="pageMainInfo.pageSize"
          :total-count="pageMainInfo.totalCount"
        />
        <kw-paging-info
          v-if="searchType.contract"
          v-model:page-index="pageSecondInfo.pageIndex"
          v-model:page-size="pageSecondInfo.pageSize"
          :total-count="pageSecondInfo.totalCount"
        />
        <kw-paging-info
          v-if="searchType.prtnrAndW04"
          v-model:page-index="pageThirdnfo.pageIndex"
          v-model:page-size="pageThirdnfo.pageSize"
          :total-count="pageThirdnfo.totalCount"
        />
        <!-- (단위 : 건) -->
        <span class="ml8">{{ t('MSG_TXT_MSG_TXT_UNIT_CASE') }}</span>
      </template>

      <kw-btn
        v-if="searchType.prtnrAndW05"
        icon="download_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageMainInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
      <kw-btn
        v-if="searchType.contract"
        icon="download_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageSecondInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
      <kw-btn
        v-if="searchType.prtnrAndW04"
        icon="download_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageThirdnfo.totalCount === 0"
        @click="onClickExcelDownload"
      />

      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        primary
        dense
        :label="t('MSG_BTN_REDF_AMT_CRT')"
        @click="onClickRedfAmountCreate"
      />
    </kw-action-top>
    <kw-grid
      v-show="searchType.prtnrAndW05"
      ref="grdCrtMainRef"
      name="grdMain"
      :page-size="pageMainInfo.pageSize-1"
      :total-count="pageMainInfo.totalCount"
      @init="initGrid"
    />
    <kw-grid
      v-show="searchType.contract"
      ref="grdSecondRef"
      name="grdSecond"
      :page-size="pageSecondInfo.pageSize-1"
      :total-count="pageSecondInfo.totalCount"
      @init="initGrid2"
    />
    <kw-grid
      v-show="searchType.prtnrAndW04"
      ref="grdThirdRef"
      name="grdThird"
      :page-size="pageThirdInfo.pageSize-1"
      :total-count="pageThirdInfo.totalCount"
      @init="initGrid3"
    />
  </div>
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
const grdCrtMainRef = ref(getComponentType('KwGrid'));
const grdSecondRef = ref(getComponentType('KwGrid'));
const grdThirdRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
const dataService = useDataService();
const { getConfig } = useMeta();
const monthFrom = dayjs().subtract(1, 'month').format('YYYYMM');
const monthTo = dayjs().subtract(0, 'month').format('YYYYMM');

const codes = await codeUtil.getMultiCodes(
  'DDTN_RPLC_OG_TP_CD',
);

const searchType = ref({
  prtnrAndW05: true,
  prtnrAndW04: false,
  contract: false,
});

const filterOgTpCd = ref([]);
codes.DDTN_RPLC_OG_TP_CD.sort(() => -1);
codes.DDTN_RPLC_OG_TP_CD.forEach((e) => {
  if (e.codeId === 'W04' || e.codeId === 'W05') {
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
const pageThirdInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

let cachedParams;

const searchParams = ref({
  ogTpCd: filterOgTpCd.value[0].codeId,
  redfAdsbOcYmFrom: monthFrom,
  redfAdsbOcYmTo: monthTo,
  perfYmFrom: monthFrom,
  perfYmTo: monthTo,
  ogCdFrom: 'A000000',
  ogCdTo: 'Z999999',
});

const conditionParam = ref({
  type: 'prtnr',
});

const selectedCondition = ref([
  {
    codeId: 'prtnr',
    codeName: t('MSG_TXT_SELLER_PERSON_DV'),
  },
  {
    codeId: 'contract',
    codeName: t('MSG_TXT_CNTRCT_DV'),
  },
]);

async function fetchData() {
  const res = await dataService.get('/sms/wells/deduction/sole-distributors/partner/paging', { params: { ...cachedParams, ...pageMainInfo.value } });
  const { list: redfes, pageInfo: pagingResult } = res.data;
  console.log(res.data);
  pageMainInfo.value = pagingResult;
  const view = grdCrtMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(redfes);
  dataSource.checkRowStates(true);
}

async function fetchData2() {
  const res = await dataService.get('/sms/wells/deduction/sole-distributors/contract/paging', { params: { ...cachedParams, ...pageSecondInfo.value } });
  const { list: redfes, pageInfo: pagingResult } = res.data;
  console.log(res.data);
  pageSecondInfo.value = pagingResult;
  const view = grdSecondRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(redfes);
  dataSource.checkRowStates(true);
}

async function fetchData3() {
  const res = await dataService.get('/sms/wells/deduction/sole-distributors/management/paging', { params: { ...cachedParams, ...pageThirdInfo.value } });
  const { list: redfes, pageInfo: pagingResult } = res.data;
  console.log(res.data);
  pageThirdInfo.value = pagingResult;
  const view = grdThirdRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(redfes);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  grdCrtMainRef.value.getData().clearRows();
  grdThirdRef.value.getData().clearRows();
  grdSecondRef.value.getData().clearRows();

  if (conditionParam.value.type === 'prtnr' && searchParams.value.ogTpCd === 'W05') {
    pageMainInfo.value.pageIndex = 1;
    cachedParams = cloneDeep(searchParams.value);
    await fetchData();
  } else if (conditionParam.value.type === 'prtnr' && searchParams.value.ogTpCd === 'W04') {
    pageThirdInfo.value.pageIndex = 1;
    cachedParams = cloneDeep(searchParams.value);
    await fetchData3();
  } else {
    pageSecondInfo.value.pageIndex = 1;
    cachedParams = cloneDeep(searchParams.value);
    await fetchData2();
  }
}

/* 되물림 금액 생성 */
async function onClickRedfAmountCreate() {
  await modal({
    component: 'ZwdeaRedfAmountCreateP',
  });
}

async function onClickExcelDownload() {
  let view;
  let res;

  if (conditionParam.value.type === 'prtnr' && searchParams.value.ogTpCd === 'W05') {
    view = grdCrtMainRef.value.getView();
    res = await dataService.get('/sms/wells/deduction/sole-distributors/partner/excel-download', { params: cachedParams });
  } else if (conditionParam.value.type === 'prtnr' && searchParams.value.ogTpCd === 'W04') {
    view = grdThirdRef.value.getView();
    res = await dataService.get('/sms/wells/deduction/sole-distributors/management/excel-download', { params: cachedParams });
  } else {
    view = grdSecondRef.value.getView();
    res = await dataService.get('/sms/wells/deduction/sole-distributors/contract/excel-download', { params: cachedParams });
  }

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

watch(() => conditionParam.value.type, (newVal) => {
  if (newVal === 'prtnr' && searchParams.value.ogTpCd === 'W05') {
    grdCrtMainRef.value.getData().clearRows();
    grdThirdRef.value.getData().clearRows();
    grdSecondRef.value.getData().clearRows();
    searchType.value.prtnrAndW05 = true;
    searchType.value.prtnrAndW04 = false;
    searchType.value.contract = false;
  } else if (newVal === 'prtnr' && searchParams.value.ogTpCd === 'W04') {
    grdCrtMainRef.value.getData().clearRows();
    grdThirdRef.value.getData().clearRows();
    grdSecondRef.value.getData().clearRows();
    searchType.value.prtnrAndW05 = false;
    searchType.value.prtnrAndW04 = true;
    searchType.value.contract = false;
  } else {
    grdCrtMainRef.value.getData().clearRows();
    grdThirdRef.value.getData().clearRows();
    grdSecondRef.value.getData().clearRows();
    searchType.value.prtnrAndW05 = false;
    searchType.value.prtnrAndW04 = false;
    searchType.value.contract = true;
  }
});

watch(() => searchParams.value.ogTpCd, (newVal) => {
  if (conditionParam.value.type === 'prtnr' && newVal === 'W05') {
    grdCrtMainRef.value.getData().clearRows();
    grdThirdRef.value.getData().clearRows();
    grdSecondRef.value.getData().clearRows();
    searchType.value.prtnrAndW05 = true;
    searchType.value.prtnrAndW04 = false;
    searchType.value.contract = false;
  } else if (conditionParam.value.type === 'prtnr' && newVal === 'W04') {
    grdCrtMainRef.value.getData().clearRows();
    grdThirdRef.value.getData().clearRows();
    grdSecondRef.value.getData().clearRows();
    searchType.value.prtnrAndW05 = false;
    searchType.value.prtnrAndW04 = true;
    searchType.value.contract = false;
  } else {
    grdCrtMainRef.value.getData().clearRows();
    grdThirdRef.value.getData().clearRows();
    grdSecondRef.value.getData().clearRows();
    searchType.value.prtnrAndW05 = false;
    searchType.value.prtnrAndW04 = false;
    searchType.value.contract = true;
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'perfYm' },
    { fieldName: 'ogCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'totOcMmCnt' },
    { fieldName: 'totRedfBfCnt' },
    { fieldName: 'totHcrCnt' },
    { fieldName: 'samOcMmCnt' },
    { fieldName: 'samRedfBfCnt' },
    { fieldName: 'welOcMmCnt' },
    { fieldName: 'welRedfBfCnt' },
    { fieldName: 'redfTotCnt' },
    { fieldName: 'redfSamCnt' },
    { fieldName: 'redfWelCnt' },
    { fieldName: 'totRedfAfCnt' },
    { fieldName: 'samRedfAfCnt' },
    { fieldName: 'welRedfAfCnt' },
    { fieldName: 'feeBase' },
    { fieldName: 'feeEncrg' },
    { fieldName: 'feeSum' },
  ];

  const columns = [
    { fieldName: 'perfYm', header: t('MSG_TXT_PERF_YM'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_CORP_NAME'), width: '100', styleName: 'text-' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUM'), width: '100', styleName: 'text-center' },
    { fieldName: 'totOcMmCnt', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '100', styleName: 'text-right' },
    { fieldName: 'totRedfBfCnt', header: t('MSG_TXT_REDF_BF'), width: '100', styleName: 'text-right' },
    { fieldName: 'totHcrCnt', header: t('MSG_TXT_HOME_CARE'), width: '100', styleName: 'text-right' },
    { fieldName: 'samOcMmCnt', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '100', styleName: 'text-right' },
    { fieldName: 'samRedfBfCnt', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '100', styleName: 'text-right' },
    { fieldName: 'welOcMmCnt', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '100', styleName: 'text-right' },
    { fieldName: 'welRedfBfCnt', header: t('MSG_TXT_REDF_BF'), width: '100', styleName: 'text-right' },
    { fieldName: 'redfTotCnt', header: t('MSG_TXT_TOT_PERF'), width: '100', styleName: 'text-right' },
    { fieldName: 'redfSamCnt', header: t('MSG_TXT_SS_PERF'), width: '100', styleName: 'text-right' },
    { fieldName: 'redfWelCnt', header: t('MSG_TXT_MYCO_PDCT_PERF'), width: '100', styleName: 'text-right' },
    { fieldName: 'totRedfAfCnt', header: t('MSG_TXT_TOT_PERF'), width: '100', styleName: 'text-right' },
    { fieldName: 'samRedfAfCnt', header: t('MSG_TXT_SS_PERF'), width: '100', styleName: 'text-right' },
    { fieldName: 'welRedfAfCnt', header: t('MSG_TXT_MYCO_PDCT_PERF'), width: '100', styleName: 'text-right' },
    { fieldName: 'feeBase', header: t('MSG_TXT_DFLT'), width: '100', styleName: 'text-right' },
    { fieldName: 'feeEncrg', header: t('MSG_TXT_ENRG'), width: '100', styleName: 'text-right' },
    { fieldName: 'feeSum', header: t('MSG_TXT_SUM'), width: '100', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'perfYm', 'ogCd', 'ogNm', 'prtnrNo', // single
    {
      header: t('MSG_TXT_TOT_PERF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['totOcMmCnt', 'totRedfBfCnt', 'totHcrCnt'],
    },
    {
      header: t('MSG_TXT_SS_PDCT'),
      direction: 'horizontal',
      items: ['samOcMmCnt', 'samRedfBfCnt'],
    },
    {
      header: t('MSG_TXT_MYCO_PDCT'),
      direction: 'horizontal',
      items: ['welOcMmCnt', 'welRedfBfCnt'],
    },
    {
      header: t('MSG_TXT_REDF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['redfTotCnt', 'redfSamCnt', 'redfWelCnt'],
    },
    {
      header: t('MSG_TXT_REDF_AF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['totRedfAfCnt', 'samRedfAfCnt', 'welRedfAfCnt'],
    },
    {
      header: t('MSG_TXT_FEE_WON'), // colspan title
      direction: 'horizontal', // merge type
      items: ['feeBase', 'feeEncrg', 'feeSum'],
    },
  ]);

  view.onScrollToBottom = async (g) => {
    if (pageMainInfo.value.pageIndex * pageMainInfo.value.pageSize <= g.getItemCount()) {
      pageMainInfo.value.pageIndex += 1;
      await fetchData();
    }
  };
}

function initGrid2(data, view) {
  const fields = [
    { fieldName: 'ogCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrNoSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdClsfNm' },
    { fieldName: 'modelNo' },
    { fieldName: 'sellDscDvCd' },
    { fieldName: 'sellDscTpCd' },
    { fieldName: 'pmotCd' },
    { fieldName: 'combiDv' },
    { fieldName: 'pmotUswyDvCd' },
    { fieldName: 'pmotUswyDvNm' },
    { fieldName: 'bfsvcPrdCd' },
    { fieldName: 'pdGub1' },
    { fieldName: 'pdGub2' },
    { fieldName: 'rcpdt' },
    { fieldName: 'slDt' },
    { fieldName: 'canDt' },
    { fieldName: 'ackmtPerfAmt', dataType: 'number' },
    { fieldName: 'ackmtPerfCt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BRCH_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_BRCH_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELLER_PERSON'), width: '100', styleName: 'text-left' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUM'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrNoSn', header: t('MSG_TXT_CNTR_DTL_NO'), width: '140', styleName: 'text-left' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CUST_STMT'), width: '100', styleName: 'text-left' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '140', styleName: 'text-left' },
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_NM'), width: '140', styleName: 'text-left' },
    { fieldName: 'modelNo', header: t('MSG_TXT_MDL_NM'), width: '140', styleName: 'text-left' },
    { fieldName: 'sellDscDvCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '100', styleName: 'text-right' },
    { fieldName: 'sellDscTpCd', header: t('MSG_TXT_DISC_CODE'), width: '100', styleName: 'text-right' },
    { fieldName: 'pmotCd', header: t('MSG_TXT_DSC_SYST'), width: '100', styleName: 'text-right' },
    { fieldName: 'combiDv', header: t('MSG_TXT_COMBI_DV'), width: '100', styleName: 'text-right' },
    { fieldName: 'pmotUswyDvCd', header: t('MSG_TXT_USWY_DV'), width: '100', styleName: 'text-right' },
    { fieldName: 'pmotUswyDvNm', header: t('MSG_TXT_MGT_TYP'), width: '100', styleName: 'text-left' },
    { fieldName: 'bfsvcPrdCd', header: t('MSG_TXT_VST_PRD'), width: '100', styleName: 'text-right' },
    { fieldName: 'pdGub1', header: `${t('MSG_TXT_PRDT_GUBUN')}1`, width: '100', styleName: 'text-right' },
    { fieldName: 'pdGub2', header: `${t('MSG_TXT_PRDT_GUBUN')}2`, width: '100', styleName: 'text-right' },
    { fieldName: 'rcpdt', header: t('MSG_TXT_RCPDT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_FEE_WON'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'ackmtPerfCt', header: t('MSG_TXT_NUM_OF_NEW_CASES'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onScrollToBottom = async (g) => {
    if (pageSecondInfo.value.pageIndex * pageSecondInfo.value.pageSize <= g.getItemCount()) {
      pageSecondInfo.value.pageIndex += 1;
      await fetchData2();
    }
  };
}

function initGrid3(data, view) {
  const fields = [
    { fieldName: 'perfYm' },
    { fieldName: 'ogCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'ocPerfCn' },
    { fieldName: 'redfBfCn' },
    { fieldName: 'ackmtPerfCt' },
    { fieldName: 'redfAfCn' },
    { fieldName: 'feeBase' },
  ];

  const columns = [
    { fieldName: 'perfYm', header: t('MSG_TXT_PERF_YM'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_CORP_NAME'), width: '100', styleName: 'text-' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUM'), width: '100', styleName: 'text-center' },
    { fieldName: 'ocPerfCn', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '100', styleName: 'text-right' },
    { fieldName: 'redfBfCn', header: t('MSG_TXT_REDF_BF'), width: '100', styleName: 'text-right' },
    { fieldName: 'ackmtPerfCt', header: t('MSG_TXT_THM_REDF'), width: '100', styleName: 'text-right' },
    { fieldName: 'redfAfCn', header: t('MSG_TXT_REDF_AF'), width: '100', styleName: 'text-right' },
    { fieldName: 'feeBase', header: t('MSG_TXT_FEE_WON'), width: '100', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onScrollToBottom = async (g) => {
    if (pageThirdInfo.value.pageIndex * pageThirdInfo.value.pageSize <= g.getItemCount()) {
      pageThirdInfo.value.pageIndex += 1;
      await fetchData3();
    }
  };
}

</script>
