<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaOutOfStorageAgrgM - 대리점 지역별 필터발주 현황(K-W-SV-U-0148M01)
3. 작성자 : jungheejin
4. 작성일 : 2023-09-11
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 대리점 지역별 필터발주 현황 http://localhost:3000/#/service/wwsna-agency-locara-filter-give-a-order-ps-list
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item :label="$t('기준년월')">
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('기준년월')"
            rules="date_range_months:1"
            type="month"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :total-count="totalCount"
        @init="initGrdMain"
      />
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            v-model:total-count="pageInfo.totalCount"
            v-model:page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData2"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload2"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef2"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain2"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/agency-locara-filter-give-a-order-ps';

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

const searchParams = ref({
  startDt: now.format('YYYYMM'),
  endDt: now.format('YYYYMMDD'),
});
let cachedParams;
const totalCount = ref(0);

// async function fetchData1() {
//   const res = await dataService.get(`${baseUrl}/agrg`, { params: cachedParams });
//   const list = res.data;
//   totalCount.value = list.length;
//
//   const view = grdMainRef.value.getView();
//   view.getDataSource().setRows(list);
//   view.resetCurrent();
// }
async function fetchData2() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  console.log(pages);

  const view = grdMainRef2.value.getView();
  view.getDataSource().setRows(pages);
  view.resetCurrent();
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  // await fetchData1();
  await fetchData2();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}
async function onClickExcelDownload2() {
  const view = grdMainRef2.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

// 필터발주 현황
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'yymm', header: t('년월'), width: '80', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'locaraDvNm', header: t('지역'), width: '80', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('업체명'), width: '80', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('필터명'), width: '200', styleName: 'text-left' },
    {
      fieldName: 'sumPartUseQty',
      header: t('MSG_TXT_SUM'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// 필터발주 상세현황
const initGrdMain2 = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'yymm', header: t('년월'), width: '80', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'cstKnm', header: t('업체명'), width: '80', styleName: 'text-center' },
    { fieldName: 'cntrSn', visible: false },
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('상품명'), width: '120', styleName: 'text-center' },
    { fieldName: 'filtNm', header: t('MSG_TXT_ITM_NM'), width: '120', styleName: 'text-center' },
    {
      fieldName: 'sppBasAdr',
      header: t('배송주소'),
      width: '150',
      styleName: 'text-left',
      displayCallback(grid, index) {
        const { sppBasAdr, sppDtlAdr } = grid.getValues(index.itemIndex);
        if (!isEmpty(sppBasAdr)) {
          return `${sppBasAdr}, ${sppDtlAdr}`;
        }
      },
    },
    { fieldName: 'sppDtlAdr', visible: false },
    { fieldName: 'locaraDvNm', header: t('지역'), width: '120', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
