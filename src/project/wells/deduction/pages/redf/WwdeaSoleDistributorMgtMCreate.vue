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
    v-permission:read
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
          v-model:page-index="pageThirdInfo.pageIndex"
          v-model:page-size="pageThirdInfo.pageSize"
          :total-count="pageThirdInfo.totalCount"
        />
        <!-- (단위 : 건) -->
        <span class="ml8">{{ t('MSG_TXT_MSG_TXT_UNIT_CASE') }}</span>
      </template>

      <kw-btn
        v-if="searchType.prtnrAndW05"
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageMainInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
      <kw-btn
        v-if="searchType.contract"
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageSecondInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
      <kw-btn
        v-if="searchType.prtnrAndW04"
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageThirdInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />

      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:create
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
      :visible-rows="10"
      :page-size="pageMainInfo.pageSize-1"
      :total-count="pageMainInfo.totalCount"
      @init="initGrid"
    />
    <kw-grid
      v-show="searchType.contract"
      ref="grdSecondRef"
      name="grdSecond"
      :visible-rows="10"
      :page-size="pageSecondInfo.pageSize-1"
      :total-count="pageSecondInfo.totalCount"
      @init="initGrid2"
    />
    <kw-grid
      v-show="searchType.prtnrAndW04"
      ref="grdThirdRef"
      name="grdThird"
      :visible-rows="10"
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
const defalutMonth = dayjs().subtract(0, 'month').format('YYYYMM');
// const { getUserInfo } = useMeta();
// const userInfo = getUserInfo();

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
  redfAdsbOcYmFrom: defalutMonth,
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

  pageSecondInfo.value = pagingResult;
  const view = grdSecondRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(redfes);
  dataSource.checkRowStates(true);
}

async function fetchData3() {
  const res = await dataService.get('/sms/wells/deduction/sole-distributors/b2b/paging', { params: { ...cachedParams, ...pageThirdInfo.value } });
  const { list: redfes, pageInfo: pagingResult } = res.data;

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
    componentProps: {
      ogTpCd: searchParams.value.ogTpCd,
    },
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
    res = await dataService.get('/sms/wells/deduction/sole-distributors/b2b/excel-download', { params: cachedParams });
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
    { fieldName: 'totOcMmCnt', dataType: 'number' },
    { fieldName: 'totRedfBfCnt', dataType: 'number' },
    { fieldName: 'totHcrCnt', dataType: 'number' },
    { fieldName: 'samOcMmCnt', dataType: 'number' },
    { fieldName: 'samRedfBfCnt', dataType: 'number' },
    { fieldName: 'welOcMmCnt', dataType: 'number' },
    { fieldName: 'welRedfBfCnt', dataType: 'number' },
    { fieldName: 'redfTotCnt', dataType: 'number' },
    { fieldName: 'redfSamCnt', dataType: 'number' },
    { fieldName: 'redfWelCnt', dataType: 'number' },
    { fieldName: 'totRedfAfCnt', dataType: 'number' },
    { fieldName: 'samRedfAfCnt', dataType: 'number' },
    { fieldName: 'welRedfAfCnt', dataType: 'number' },
    { fieldName: 'feeBase', dataType: 'number' },
    { fieldName: 'feeEncrg', dataType: 'number' },
    { fieldName: 'feeSum', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'perfYm', header: t('MSG_TXT_PERF_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_CORP_NAME'), width: '140', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'totOcMmCnt', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'totRedfBfCnt', header: t('MSG_TXT_REDF_BF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'totHcrCnt', header: t('MSG_TXT_HOME_CARE'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'samOcMmCnt', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'samRedfBfCnt', header: t('MSG_TXT_REDF_BF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'welOcMmCnt', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'welRedfBfCnt', header: t('MSG_TXT_REDF_BF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'redfTotCnt', header: t('MSG_TXT_TOT_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'redfSamCnt', header: t('MSG_TXT_SS_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'redfWelCnt', header: t('MSG_TXT_MYCO_PDCT_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'totRedfAfCnt', header: t('MSG_TXT_TOT_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'samRedfAfCnt', header: t('MSG_TXT_SS_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'welRedfAfCnt', header: t('MSG_TXT_MYCO_PDCT_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'feeBase', header: t('MSG_TXT_DFLT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'feeEncrg', header: t('MSG_TXT_ENRG'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'feeSum', header: t('MSG_TXT_SUM'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

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
    { fieldName: 'ogNm', header: t('MSG_TXT_BRCH_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELLER_PERSON'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '140',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      } },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CUST_STMT'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '140', styleName: 'text-center' },
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_NM'), width: '140', styleName: 'text-center' },
    { fieldName: 'modelNo', header: t('MSG_TXT_MDL_NM'), width: '140', styleName: 'text-center' },
    { fieldName: 'sellDscDvCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellDscTpCd', header: t('MSG_TXT_DISC_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pmotCd', header: t('MSG_TXT_DSC_SYST'), width: '100', styleName: 'text-center' },
    { fieldName: 'combiDv', header: t('MSG_TXT_COMBI_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'pmotUswyDvCd', header: t('MSG_TXT_USWY_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'pmotUswyDvNm', header: t('MSG_TXT_MGT_TYP'), width: '100', styleName: 'text-center' },
    { fieldName: 'bfsvcPrdCd', header: t('MSG_TXT_VST_PRD'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdGub1', header: `${t('MSG_TXT_PRDT_GUBUN')}1`, width: '100', styleName: 'text-center' },
    { fieldName: 'pdGub2', header: `${t('MSG_TXT_PRDT_GUBUN')}2`, width: '100', styleName: 'text-center' },
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
    { fieldName: 'ocPerfCn', dataType: 'number' },
    { fieldName: 'redfBfCn', dataType: 'number' },
    { fieldName: 'ackmtPerfCt', dataType: 'number' },
    { fieldName: 'redfAfCn', dataType: 'number' },
    { fieldName: 'feeBase', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'perfYm', header: t('MSG_TXT_PERF_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_CORP_NAME'), width: '140', styleName: 'text-' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'ocPerfCn', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'redfBfCn', header: t('MSG_TXT_REDF_BF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'ackmtPerfCt', header: t('MSG_TXT_THM_REDF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'redfAfCn', header: t('MSG_TXT_REDF_AF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'feeBase', header: t('MSG_TXT_FEE_WON'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

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
