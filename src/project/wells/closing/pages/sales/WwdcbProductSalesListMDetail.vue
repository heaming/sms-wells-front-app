<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbProductSalesListMDetail - 매출상세조회 - W-CL-U-0028M04
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.03.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매출상세조회
****************************************************************************************************
---->
<template>
  <kw-search
    :cols="3"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_SL_DT')"
        required
      >
        <kw-date-range-picker
          v-model:from="searchParams.baseDtmnFrom"
          v-model:to="searchParams.baseDtmnTo"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_TASK_DIV')"
        :colspan="2"
      >
        <kw-option-group
          v-model="searchParams.taskDiv"
          type="radio"
          :options="selectTaskDiv.options"
          @change="onSelectTaskDiv"
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
        <kw-select
          v-model="searchParams.sellType"
          :options="codes.SELL_TP_CD"
          first-option
          first-option-value="ALL"
          :first-option-label="$t('MSG_TXT_ALL')"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SLS_CAT')">
        <kw-select
          v-model="searchParams.sellDv"
          :options="codes.WELS_CL_SELL_DV_CD"
          first-option
          first-option-value="ALL"
          :first-option-label="$t('MSG_TXT_ALL')"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
        <kw-input
          v-model="searchParams.rveCd"
          icon="search"
          clearable
          :click-icon="onClickIcon"
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_CST_NO')">
        <kw-input
          v-model="searchParams.cstNo"
          icon="search"
          clearable
          :click-icon="onClickIcon"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SAP_SLPNO')">
        <kw-input
          v-model="searchParams.sapSlpno"
          icon="search"
          clearable
          :click-icon="onClickIcon"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalCount" />
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        icon="download_on"
        :disable="totalCount === 0"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExportView"
      />
    </kw-action-top>
    <kw-grid
      v-if="isShow1"
      ref="grdDetailRef1"
      name="grdDetail1"
      :visible-rows="10"
      @init="initGridDetail1"
    />
    <kw-grid
      v-if="isShow2"
      ref="grdDetailRef2"
      name="grdDetail2"
      :visible-rows="10"
      @init="initGridDetail2"
    />
    <kw-grid
      v-if="isShow3"
      ref="grdDetailRef3"
      name="grdDetail3"
      :visible-rows="10"
      @init="initGridDetail3"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, gridUtil, getComponentType, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const now = dayjs();
const { t } = useI18n();
const { modal } = useGlobal();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdDetailRef1 = ref(getComponentType('KwGrid'));
const grdDetailRef2 = ref(getComponentType('KwGrid'));
const grdDetailRef3 = ref(getComponentType('KwGrid'));

const isShow1 = ref(true);
const isShow2 = ref(false);
const isShow3 = ref(false);
const totalCount = ref(0);

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SELL_TP_CD',
  'WELS_CL_SELL_DV_CD',
);
const searchParams = ref({
  baseDtmnFrom: now.subtract(30, 'day').format('YYYYMMDD'),
  baseDtmnTo: now.format('YYYYMMDD'),
  taskDiv: '1', // 업무구분
  sellType: 'ALL', // 판매유형
  sellDv: 'ALL', // 판매구분
  cntrDtlNo: '', // 계약상세번호
  cstNo: '', // 고객번호
  sapSlpno: '', // SAP전표번호
});

const initGridData = [];
async function onSelectTaskDiv() {
  const { taskDiv } = searchParams.value;
  if (taskDiv === '1' || taskDiv === '3' || taskDiv === '5') {
    isShow1.value = true;
    isShow2.value = false;
    isShow3.value = false;
    const view = grdDetailRef1.value.getView();
    view.getDataSource().setRows(initGridData);
  } else if (taskDiv === '2') {
    isShow1.value = false;
    isShow2.value = true;
    isShow3.value = false;
    const view = grdDetailRef2.value.getView();
    view.getDataSource().setRows(initGridData);
  } else if (taskDiv === '4') {
    isShow1.value = false;
    isShow2.value = false;
    isShow3.value = true;
    const view = grdDetailRef3.value.getView();
    view.getDataSource().setRows(initGridData);
  }
}
let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);

  const { taskDiv } = searchParams.value;
  if (taskDiv === '1' || taskDiv === '3' || taskDiv === '5') {
    const res = await dataService.get('/sms/wells/closing/product-sales-detail/single-payment', { params: cachedParams });
    console.log(res.data);
    const mainList = res.data;
    totalCount.value = mainList.length;
    const view = grdDetailRef1.value.getView();
    view.getDataSource().setRows(mainList);
    view.resetCurrent();
  } else if (taskDiv === '2') {
    const res = await dataService.get('/sms/wells/closing/product-sales-detail/rental', { params: cachedParams });
    const mainList = res.data;
    totalCount.value = mainList.length;
    const view = grdDetailRef2.value.getView();
    view.getDataSource().setRows(mainList);
    view.resetCurrent();
  } else if (taskDiv === '4') {
    const res = await dataService.get('/sms/wells/closing/product-sales-detail/membership', { params: cachedParams });
    const mainList = res.data;
    totalCount.value = mainList.length;
    const view = grdDetailRef3.value.getView();
    view.getDataSource().setRows(mainList);
    view.resetCurrent();
  }
}

async function onClickSearch() {
  await fetchData();
}

async function onClickExportView() {
  const { taskDiv } = searchParams.value;
  if (taskDiv === '1' || taskDiv === '3' || taskDiv === '5') {
    const view = grdDetailRef1.value.getView();
    const response = await dataService.get('/sms/wells/closing/product-sales-detail/single-payment/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: 'mainList',
      timePostfix: true,
      exportData: response.data,
    });
  } else if (taskDiv === '2') {
    const view = grdDetailRef2.value.getView();
    const response = await dataService.get('/sms/wells/closing/product-sales-detail/rental/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: 'mainList',
      timePostfix: true,
      exportData: response.data,
    });
  } else if (taskDiv === '4') {
    const view = grdDetailRef3.value.getView();
    const response = await dataService.get('/sms/wells/closing/product-sales-detail/membership/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: 'mainList',
      timePostfix: true,
      exportData: response.data,
    });
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridDetail1 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9', dataType: 'number' },
    { fieldName: 'col10', dataType: 'number' },
    { fieldName: 'col11', dataType: 'number' },
    { fieldName: 'col12', dataType: 'number' },
    { fieldName: 'col13', dataType: 'number' },
    { fieldName: 'col14', dataType: 'number' },
    { fieldName: 'col15', dataType: 'number' },
    { fieldName: 'col16', dataType: 'number' },
    { fieldName: 'col17', dataType: 'number' },
    { fieldName: 'col18', dataType: 'number' },
    { fieldName: 'col19', dataType: 'number' },
    { fieldName: 'col20', dataType: 'number' },
    { fieldName: 'col21', dataType: 'number' },
    { fieldName: 'col22', dataType: 'number' },
    { fieldName: 'col23', dataType: 'number' },
    { fieldName: 'col24', dataType: 'number' },
    { fieldName: 'col25', dataType: 'number' },
    { fieldName: 'col26', dataType: 'number' },
    { fieldName: 'col27', dataType: 'number' },
    { fieldName: 'col28', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'col1',
      header: t('MSG_TXT_TASK_DIV'),
      width: '100',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } },
    { fieldName: 'col2', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_PRDT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_SLS_CAT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_CNTR_DTL_NO'), width: '100', styleName: 'rg-button-link text-center', renderer: { type: 'button' } },
    { fieldName: 'col7', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-right' },
    { fieldName: 'col8', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-right' },
    { fieldName: 'col9',
      header: t('MSG_TXT_SELL_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col10',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col11',
      header: t('MSG_TXT_PVDA'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col12',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col13',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col14',
      header: t('MSG_TXT_SELL_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col15',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col16',
      header: t('MSG_TXT_PVDA'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col17',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col18',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col19',
      header: t('MSG_TXT_SELL_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col20',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col21',
      header: t('MSG_TXT_PVDA'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col22',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col23',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col24',
      header: t('MSG_TXT_SELL_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col25',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col26',
      header: t('MSG_TXT_PVDA'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col27',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col28',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (grid, { column }) => {
    const current = view.getCurrent();
    const dataProvider = view.getDataSource();
    const cntrDtlNo = dataProvider.getValue(current.dataRow, 'col6');
    if (column === 'col6') {
      const { taskDiv } = searchParams.value;
      await modal({
        component: 'WwdcbSalesDtlP',
        componentProps: { cntrDtlNo, taskDiv },
      });
    }
  };

  const layout1 = [
    'col1',
    'col2',
    'col3',
    'col4',
    'col5',
    'col6',
    'col7',
    'col8',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'col9',
        'col10',
        'col11',
        'col12',
        'col13',
      ],
      header: {
        text: t('MSG_TXT_NOM_SL'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [

        'col14',
        'col15',
        'col16',
        'col17',
        'col18',
      ],
      header: {
        text: t('MSG_TXT_SL_CH'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'col19',
        'col20',
        'col21',
        'col22',
        'col23',
      ],
      header: {
        text: t('MSG_TXT_SL_CAN'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'col24',
        'col25',
        'col26',
        'col27',
        'col28',
      ],
      header: {
        text: t('MSG_TXT_SL_SUM'),
      },
    },
  ];
  view.setColumnLayout(layout1);
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  view.layoutByColumn('col1').summaryUserSpans = [{ colspan: 8 }];
  view.rowIndicator.visible = true;
});

const initGridDetail2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9', dataType: 'number' },
    { fieldName: 'col10', dataType: 'number' },
    { fieldName: 'col11', dataType: 'number' },
    { fieldName: 'col12', dataType: 'number' },
    { fieldName: 'col13', dataType: 'number' },
    { fieldName: 'col14', dataType: 'number' },
    { fieldName: 'col15', dataType: 'number' },
    { fieldName: 'col16', dataType: 'number' },
    { fieldName: 'col17', dataType: 'number' },
    { fieldName: 'col18', dataType: 'number' },
    { fieldName: 'col19', dataType: 'number' },
    { fieldName: 'col20', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'col1',
      header: t('MSG_TXT_TASK_DIV'),
      width: '100',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } },
    { fieldName: 'col2', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_PRDT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_SLS_CAT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_CNTR_DTL_NO'), width: '100', styleName: 'rg-button-link text-center', renderer: { type: 'button' } },
    { fieldName: 'col7', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-right' },
    { fieldName: 'col8', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-right' },
    { fieldName: 'col9',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col10',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col11',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col12',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col13',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col14',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col15',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col16',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col17',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col18',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col19',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col20',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (grid, { column }) => {
    const current = view.getCurrent();
    const dataProvider = view.getDataSource();
    const cntrDtlNo = dataProvider.getValue(current.dataRow, 'col6');
    if (column === 'col6') {
      const { taskDiv } = searchParams.value;
      await modal({
        component: 'WwdcbSalesDtlP',
        componentProps: { cntrDtlNo, taskDiv },
      });
    }
  };

  const layout1 = [
    'col1',
    'col2',
    'col3',
    'col4',
    'col5',
    'col6',
    'col7',
    'col8',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'col9',
            'col10',
            'col11',
            'col12',
          ],
          header: {
            text: t('MSG_TXT_RGST_FEE'),
          },
        },
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'col13',
            'col14',
            'col15',
            'col16',
          ],
          header: {
            text: t('MSG_TXT_RTLFE'),
          },
        },
      ],
      header: {
        text: t('MSG_TXT_NOM_SL'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'col17',
        'col18',
        'col19',
        'col20',
      ],
      header: {
        text: t('MSG_TXT_SL_SUM'),
      },
    },
  ];
  view.setColumnLayout(layout1);
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  view.layoutByColumn('col1').summaryUserSpans = [{ colspan: 8 }];
  view.rowIndicator.visible = true;
});

const initGridDetail3 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9', dataType: 'number' },
    { fieldName: 'col10', dataType: 'number' },
    { fieldName: 'col11', dataType: 'number' },
    { fieldName: 'col12', dataType: 'number' },
    { fieldName: 'col13', dataType: 'number' },
    { fieldName: 'col14', dataType: 'number' },
    { fieldName: 'col15', dataType: 'number' },
    { fieldName: 'col16', dataType: 'number' },
    { fieldName: 'col17', dataType: 'number' },
    { fieldName: 'col18', dataType: 'number' },
    { fieldName: 'col19', dataType: 'number' },
    { fieldName: 'col20', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'col1',
      header: t('MSG_TXT_TASK_DIV'),
      width: '100',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } },
    { fieldName: 'col2', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_PRDT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_SLS_CAT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_CNTR_DTL_NO'), width: '100', styleName: 'rg-button-link text-center', renderer: { type: 'button' } },
    { fieldName: 'col7', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-right' },
    { fieldName: 'col8', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-right' },
    { fieldName: 'col9',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col10',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col11',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col12',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col13',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col14',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col15',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col16',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col17',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col18',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col19',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'col20',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (grid, { column }) => {
    const current = view.getCurrent();
    const dataProvider = view.getDataSource();
    const cntrDtlNo = dataProvider.getValue(current.dataRow, 'col6');
    if (column === 'col6') {
      const { taskDiv } = searchParams.value;
      await modal({
        component: 'WwdcbSalesDtlP',
        componentProps: { cntrDtlNo, taskDiv },
      });
    }
  };

  const layout1 = [
    'col1',
    'col2',
    'col3',
    'col4',
    'col5',
    'col6',
    'col7',
    'col8',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'col9',
            'col10',
            'col11',
            'col12',
          ],
          header: {
            text: t('MSG_TXT_SSPCS'),
          },
        },
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'col13',
            'col14',
            'col15',
            'col16',
          ],
          header: {
            text: t('MSG_TXT_FLTR'),
          },
        },
      ],
      header: {
        text: t('MSG_TXT_SL_IZ'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'col17',
        'col18',
        'col19',
        'col20',
      ],
      header: {
        text: t('MSG_TXT_SL_SUM'),
      },
    },
  ];
  view.setColumnLayout(layout1);
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  view.layoutByColumn('col1').summaryUserSpans = [{ colspan: 8 }];
  view.rowIndicator.visible = true;
});

const selectTaskDiv = { // 업무구분
  options: [{ codeId: '1', codeName: '일시불' }, { codeId: '2', codeName: '렌탈' }, { codeId: '3', codeName: '금융리스' }, { codeId: '4', codeName: '멤버십' }, { codeId: '5', codeName: '정기구매' }],
};

</script>
