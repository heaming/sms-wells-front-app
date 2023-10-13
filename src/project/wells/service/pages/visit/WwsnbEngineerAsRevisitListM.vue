<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnbEngineerAsRevisitListM(K-W-SV-U-0233M01) - A/S 재방문현황(엔지니어)
3. 작성자 : jaehunlee
4. 작성일 : 2023.10.11
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- A/S 처리 현황 (http://localhost:3000/#/service/wwsnb-engineer-as-revisit-list)
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SRCH_DT')"
          colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.baseDateFrom"
            v-model:to="searchParams.baseDateTo"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ACU_BCK')"
        >
          <kw-select
            v-model="searchParams.acuBck"
            :options="customCodes.ACU_BCK"
            class="w100"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SV_CNR')"
        >
          <kw-select
            v-model="searchParams.ogId"
            :options="svcCode"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
            class="w180"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <kw-btn
          icon="print"
          secondary
          dense
          :label="$t('MSG_BTN_PRTG')"
          @click="onClickPrintEl"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        @init="initGrid"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useMeta, useDataService, getComponentType, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import { printElement } from '~common/utils/common';

const now = dayjs();
const { getConfig } = useMeta();
const dataService = useDataService();
const router = useRouter();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = ref({
  baseDateFrom: now.date(1).format('YYYYMMDD'),
  baseDateTo: now.format('YYYYMMDD'),
  acuBck: '30',
  ogId: '',
});

const svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data;
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const customCodes = ref({
  ACU_BCK: [{ codeId: '30', codeName: '30일' }],
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
const grdMainRef = ref(getComponentType('KwGrid'));
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/engineer-as-revisit-list/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: itemizations, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(itemizations);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/engineer-as-revisit-list/excel-download', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

function getCntrNo(cntrNo, cntrSn) {
  if (isEmpty(cntrNo) || isEmpty(cntrSn)) return '';
  return `${cntrNo}-${cntrSn}`;
}

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'rcgvpKnmA' },
    { fieldName: 'copnDv' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'vstFshDtB' },
    { fieldName: 'nextDt' },
    { fieldName: 'betweenDt' },
    { fieldName: 'ogNmB' },
    { fieldName: 'prtnrNoB' },
    { fieldName: 'prtnrKnmB' },
    { fieldName: 'asLctB' },
    { fieldName: 'asPhnB' },
    { fieldName: 'asCausB' },
    { fieldName: 'svBizHclsfB' },
    { fieldName: 'ogNmA' },
    { fieldName: 'prtnrNoA' },
    { fieldName: 'prtnrKnmA' },
    { fieldName: 'asLctA' },
    { fieldName: 'asPhnA' },
    { fieldName: 'asCausA' },
    { fieldName: 'itmPdCd1' },
    { fieldName: 'itmPdCd2' },
    { fieldName: 'itmPdCd3' },
    { fieldName: 'itmPdCd4' },
    { fieldName: 'itmPdCd5' },
    { fieldName: 'itmPdCd6' },
    { fieldName: 'itmPdCd7' },
    { fieldName: 'itmPdCd8' },
    { fieldName: 'itmPdCd9' },
    { fieldName: 'itmPdCd10' },
    { fieldName: 'nextItmPdCd1' },
    { fieldName: 'nextItmPdCd2' },
    { fieldName: 'nextItmPdCd3' },
    { fieldName: 'nextItmPdCd4' },
    { fieldName: 'nextItmPdCd5' },
    { fieldName: 'nextItmPdCd6' },
    { fieldName: 'nextItmPdCd7' },
    { fieldName: 'nextItmPdCd8' },
    { fieldName: 'nextItmPdCd9' },
    { fieldName: 'nextItmPdCd10' },
  ];

  const columns = [
    { fieldName: 'cntrNo',
      header: '계약번호',
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: {
        type: 'button',
      },
      displayCallback: (grid, index) => {
        const { cntrNo, cntrSn } = grid.getValues(index.dataRow);
        return getCntrNo(cntrNo, cntrSn);
      } },
    { fieldName: 'rcgvpKnmA', header: '고객명', width: '110', styleName: 'text-center' },
    { fieldName: 'copnDv', header: '구분', width: '80', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: 'SAP코드', width: '200', styleName: 'text-center' },
    { fieldName: 'pdCd', header: '품목코드', width: '120', styleName: 'text-center' },
    { fieldName: 'pdNm', header: '상품명', width: '200' },
    { fieldName: 'betweenDt', header: '방문간격', width: '80', styleName: 'text-right' },
    { fieldName: 'vstFshDtB', header: '1차', width: '120', styleName: 'text-center' },
    { fieldName: 'nextDt', header: '2차', width: '120', styleName: 'text-center' },
    { fieldName: 'ogNmB', header: '센터명', width: '110', styleName: 'text-center' },
    { fieldName: 'prtnrNoB', header: '사번', width: '90', styleName: 'text-center' },
    { fieldName: 'prtnrKnmB', header: '성명', width: '76', styleName: 'text-center' },
    { fieldName: 'asLctB', header: '위치', width: '76', styleName: 'text-center' },
    { fieldName: 'asPhnB', header: '현상', width: '76', styleName: 'text-center' },
    { fieldName: 'asCausB', header: '원인', width: '76', styleName: 'text-center' },
    { fieldName: 'svBizHclsfB', header: '유형', width: '80', styleName: 'text-center' },
    { fieldName: 'ogNmA', header: '센터명', width: '110', styleName: 'text-center' },
    { fieldName: 'prtnrNoA', header: '사번', width: '90', styleName: 'text-center' },
    { fieldName: 'prtnrKnmA', header: '성명', width: '76', styleName: 'text-center' },
    { fieldName: 'asLctA', header: '위치', width: '76', styleName: 'text-center' },
    { fieldName: 'asPhnA', header: '현상', width: '76', styleName: 'text-center' },
    { fieldName: 'asCausA', header: '원인', width: '76', styleName: 'text-center' },
    { fieldName: 'itmPdCd1', header: '부품1', width: '76', styleName: 'text-center' },
    { fieldName: 'itmPdCd2', header: '부품2', width: '76', styleName: 'text-center' },
    { fieldName: 'itmPdCd3', header: '부품3', width: '76', styleName: 'text-center' },
    { fieldName: 'itmPdCd4', header: '부품4', width: '76', styleName: 'text-center' },
    { fieldName: 'itmPdCd5', header: '부품5', width: '76', styleName: 'text-center' },
    { fieldName: 'itmPdCd6', header: '부품6', width: '76', styleName: 'text-center' },
    { fieldName: 'itmPdCd7', header: '부품7', width: '76', styleName: 'text-center' },
    { fieldName: 'itmPdCd8', header: '부품8', width: '76', styleName: 'text-center' },
    { fieldName: 'itmPdCd9', header: '부품9', width: '76', styleName: 'text-center' },
    { fieldName: 'itmPdCd10', header: '부품10', width: '76', styleName: 'text-center' },
    { fieldName: 'nextItmPdCd1', header: '부품1', width: '76', styleName: 'text-center' },
    { fieldName: 'nextItmPdCd2', header: '부품2', width: '76', styleName: 'text-center' },
    { fieldName: 'nextItmPdCd3', header: '부품3', width: '76', styleName: 'text-center' },
    { fieldName: 'nextItmPdCd4', header: '부품4', width: '76', styleName: 'text-center' },
    { fieldName: 'nextItmPdCd5', header: '부품5', width: '76', styleName: 'text-center' },
    { fieldName: 'nextItmPdCd6', header: '부품6', width: '76', styleName: 'text-center' },
    { fieldName: 'nextItmPdCd7', header: '부품7', width: '76', styleName: 'text-center' },
    { fieldName: 'nextItmPdCd8', header: '부품8', width: '76', styleName: 'text-center' },
    { fieldName: 'nextItmPdCd9', header: '부품9', width: '76', styleName: 'text-center' },
    { fieldName: 'nextItmPdCd10', header: '부품10', width: '76', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFixedOptions({ colCount: 3 });
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'cntrNo', 'rcgvpKnmA', 'copnDv', 'sapMatCd', 'pdCd', 'pdNm', 'betweenDt',
    {
      header: '방문일', // colspan title
      direction: 'horizontal', // merge type
      items: ['vstFshDtB', 'nextDt'],
    },
    {
      header: '1차내역', // colspan title
      direction: 'horizontal', // merge type
      items: ['ogNmB', 'prtnrNoB', 'prtnrKnmB', 'asLctB', 'asPhnB', 'asCausB'],
    },
    {
      header: '2차내역', // colspan title
      direction: 'horizontal', // merge type
      items: ['svBizHclsfB', 'ogNmA', 'prtnrNoA', 'prtnrKnmA', 'asLctA', 'asPhnA', 'asCausA'],
    },
    {
      header: '1차투입부품', // colspan title
      direction: 'horizontal', // merge type
      items: ['itmPdCd1', 'itmPdCd2', 'itmPdCd3', 'itmPdCd4', 'itmPdCd5', 'itmPdCd6', 'itmPdCd7', 'itmPdCd8', 'itmPdCd9', 'itmPdCd10'],
    },
    {
      header: '2차투입부품', // colspan title
      direction: 'horizontal', // merge type
      items: ['nextItmPdCd1', 'nextItmPdCd2', 'nextItmPdCd3', 'nextItmPdCd4', 'nextItmPdCd5', 'nextItmPdCd6', 'nextItmPdCd7', 'nextItmPdCd8', 'nextItmPdCd9', 'nextItmPdCd10'],
    },
  ]);

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntrNo') {
      const cntrNo = g.getValue(itemIndex, 'cntrNo');
      const cntrSn = g.getValue(itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
}
</script>
