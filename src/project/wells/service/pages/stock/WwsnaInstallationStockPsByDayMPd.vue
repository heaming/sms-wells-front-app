<!--
 ***************************************************************************************************
 * 프로그램 개요
 ***************************************************************************************************
 1. 모듈 : 일자별 설치재고 현황(제품)
 2. 프로그램 ID : WwsnaInstallationStockPsByDayMPd
 3. 작성자 : heymi.cho
 4. 작성일 : 2023.11.08
 ***************************************************************************************************
 * 프로그램 설명
 ***************************************************************************************************
 - 일자별 설치재고 현황(제품) (http://localhost:3000/#/service/wwsna-installation-stock-ps-by-day-pd)
 - K-W-SV-U-0352M01
 ***************************************************************************************************
-->

<template>
  <kw-search
    :cols="3"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_BASE_DT')"
        required
      >
        <kw-date-picker
          v-model="searchParams.baseDt"
          :label="$t('MSG_TXT_BASE_DT')"
          rules="required"
          type="date"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_GD')"
        :colspan="1"
      >
        <kw-select
          v-model="searchParams.pdGdCd"
          :options="codes.PD_GD_CD"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_SV_CNR')"
      >
        <kw-select
          v-model="searchParams.svCnr"
          :options="codes.SV_CNR_CD"
          first-option="all"
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
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="fetchData"
        />
      </template>
      <kw-btn
        icon="download_on"
        secondary
        dense
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="pageInfo.totalCount === 0"
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
        :label="$t('MSG_BTN_CNTCT_ASSGNMNT')"
        @click="onClickCntctPopup"
      />
    </kw-action-top>
    <kw-grid
      ref="grdPdRef"
      name="grdPd"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrid"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, gridUtil, useDataService, defineGrid, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

const { t } = useI18n();
const now = dayjs();
const { modal } = useGlobal();
const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdPdRef = ref(getComponentType('KwGrid'));
let cachedParams;

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GD_CD',
  'SV_CNR_CD',
);

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 30,
  needTotalCount: true,
});

/*
 *  Search Parameter
 */
const searchParams = ref({
  baseDt: now.format('YYYYMMDD'),
  pdGdCd: '',
  svCnr: '',
});

let stockDateColumns = [];
let stockDateFields = [];
let stockDateItems = [];
let installDateColumns = [];
let installDateFields = [];
let installDateItems = [];

/*
 * 동적 컬럼, 필드 생성 (일자별)
 */
const getDateColumnsFields = (searchDt) => {
  stockDateColumns = [];
  stockDateFields = [];
  stockDateItems = [];
  installDateColumns = [];
  installDateFields = [];
  installDateItems = [];

  const baseDt = searchDt ? dayjs(searchDt).locale('ko') : now.locale('ko');

  for (let i = 0; i < 15; i += 1) {
    const stockDateColumn = {
      fieldName: `stockdate${i + 1}`,
      header: baseDt.add(i, 'day').format('MM/DD(ddd)'),
      width: '100',
      styleName: 'text-right',
    };

    const stockDateField = {
      fieldName: `stockdate${i + 1}`,
    };

    const installDateColumn = {
      fieldName: `installdate${i + 1}`,
      header: baseDt.add(i, 'day').format('MM/DD(ddd)'),
      width: '100',
      styleName: 'text-right',
    };

    const installDateField = {
      fieldName: `installdate${i + 1}`,
    };

    stockDateColumns.push(stockDateColumn);
    stockDateFields.push(stockDateField);
    stockDateItems.push(`stockdate${i + 1}`);
    installDateColumns.push(installDateColumn);
    installDateFields.push(installDateField);
    installDateItems.push(`installdate${i + 1}`);
  }
};

async function fetchData() {
  // eslint-disable-next-line max-len

  const view = grdPdRef.value.getView();

  const res = await dataService.get('/sms/wells/service/installation-stock-by-day/product/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  getDateColumnsFields(cachedParams.baseDt);

  const columns = [
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '200', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '200', styleName: 'text-center' },
    { fieldName: 'pajuQty', header: t('MSG_TXT_LGST'), width: '100', styleName: 'text-right' },
    { fieldName: 'centerQty', header: t('MSG_TXT_CENTER_DIVISION'), width: '100', styleName: 'text-right' },
    { fieldName: 'engQty', header: t('MSG_TXT_EGER'), width: '100', styleName: 'text-right' },
    { fieldName: 'stocQty', header: t('MSG_TXT_SUM'), width: '100', styleName: 'text-right' },
    ...stockDateColumns,
    ...installDateColumns,
    { fieldName: 'istTotal', header: t('MSG_TXT_AGG'), width: '100', styleName: 'text-right' },
  ];

  view.setColumns(columns);
  view.getDataSource().setRows(state);
  view.setColumnLayout([
    'pdCd',
    'pdNm',
    {
      header: t('MSG_TXT_CURRENT') + t('MSG_TXT_STOC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['pajuQty', 'centerQty', 'engQty', 'stocQty'],
    },
    {
      header: t('MSG_TXT_STOC') + t('MSG_TXT_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: stockDateItems,
    },

    {
      header: t('MSG_BTN_CNTCT_ASSGNMNT') + t('MSG_TXT_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: installDateItems,
    },
    'istTotal',
  ]);
  // view.resetCurrent();
}

/*
 *  Search - 조회
 */
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdPdRef.value.getView();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/installation-stock-by-day/product/excel-download', { params: searchParams.value });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

/*
 *  Event - 설치배정세팅 팝업창 // W-SV-U-0171P01
 */
async function onClickCntctPopup() {
  const { result } = await modal({
    component: 'WwsnaInstallationAssignSettingP',
    componentProps: { },
  });

  if (result) {
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  cachedParams = cloneDeep(searchParams.value);
  getDateColumnsFields(cachedParams.baseDt);

  const fields = [
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'pajuQty' },
    { fieldName: 'centerQty' },
    { fieldName: 'engQty' },
    { fieldName: 'stocQty' },
    ...stockDateFields,
    ...installDateFields,
    { fieldName: 'istTotal' },
  ];

  const columns = [
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '160', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '160', styleName: 'text-center' },
    { fieldName: 'pajuQty', header: t('MSG_TXT_LGST'), width: '100', styleName: 'text-right' },
    { fieldName: 'centerQty', header: t('MSG_TXT_CENTER_DIVISION'), width: '100', styleName: 'text-right' },
    { fieldName: 'engQty', header: t('MSG_TXT_EGER'), width: '100', styleName: 'text-right' },
    { fieldName: 'stocQty', header: t('MSG_TXT_SUM'), width: '100', styleName: 'text-right' },
    ...stockDateColumns,
    ...installDateColumns,
    { fieldName: 'istTotal', header: t('MSG_TXT_AGG'), width: '100', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setColumnLayout([
    'pdCd',
    'pdNm',
    {
      header: t('MSG_TXT_CURRENT') + t('MSG_TXT_STOC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['pajuQty', 'centerQty', 'engQty', 'stocQty'],
    },
    {
      header: t('MSG_TXT_STOC') + t('MSG_TXT_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: stockDateItems,
    },

    {
      header: t('MSG_BTN_CNTCT_ASSGNMNT') + t('MSG_TXT_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: installDateItems,
    },
    'istTotal',
  ]);
  view.setFixedOptions({ colCount: 2 });
});

</script>
