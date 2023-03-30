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
          :from="searchParams.baseDtmnFrom"
          :to="searchParams.baseDtmnTo"
          type="date"
          :label="$t('MSG_TXT_SL_DT')"
          rules="date_range_required"
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
          v-if="searchParams.taskDiv === '3'"
          v-model="searchParams.sellTp"
          :readonly="false"
          :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '1' || v.codeId === '3' )"
          first-option
          first-option-value="ALL"
          :first-option-label="$t('MSG_TXT_ALL')"
        />
        <kw-select
          v-else-if="searchParams.taskDiv === '4'"
          v-model="searchParams.sellTp"
          :readonly="false"
          :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '1' || v.codeId === '2' )"
          first-option
          first-option-value="ALL"
          :first-option-label="$t('MSG_TXT_ALL')"
        />
        <kw-select
          v-else-if="searchParams.taskDiv === '5'"
          v-model="searchParams.sellTp"
          :readonly="false"
          :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '3' || v.codeId === '4')"
          first-option
          first-option-value="ALL"
          :first-option-label="$t('MSG_TXT_ALL')"
        />
        <kw-select
          v-else
          v-model="searchParams.sellTp"
          :readonly="true"
          :options="codes.SELL_TP_DTL_CD"
          first-option
          first-option-value="ALL"
          :first-option-label="$t('MSG_TXT_ALL')"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SLS_CAT')">
        <kw-select
          v-model="searchParams.sellDv"
          :options="codes.RGLR_SPP_SELL_DV_ACD"
          first-option
          first-option-value="ALL"
          :first-option-label="$t('MSG_TXT_ALL')"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
        <kw-input
          v-model="searchParams.cntrDtlNo"
          icon="search"
          clearable
          :on-click-icon="onClickCntrDtlNo"
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_CST_NO')">
        <kw-input
          v-model="searchParams.cstNo"
          icon="search"
          clearable
          :on-click-icon="onClickCstNo"
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
  'SELL_TP_DTL_CD',
  'RGLR_SPP_SELL_DV_ACD',
);
codes.RGLR_SPP_SELL_DV_ACD = codes.RGLR_SPP_SELL_DV_ACD.filter((v) => ['04', '07', '09', '10'].includes(v.codeId));

const searchParams = ref({
  baseDtmnFrom: now.subtract(30, 'day').format('YYYYMMDD'),
  baseDtmnTo: now.format('YYYYMMDD'),
  taskDiv: '1', // 업무구분
  sellTp: 'ALL', // 판매유형
  sellDv: 'ALL', // 판매구분
  cntrDtlNo: '', // 계약상세번호
  cstNo: '', // 고객번호
  sapSlpno: '', // SAP전표번호
});

const initGridData = [];
async function onSelectTaskDiv() {
  const { taskDiv } = searchParams.value;
  if (taskDiv === '1') {
    isShow1.value = true;
    isShow2.value = false;
    isShow3.value = false;
    const view = grdDetailRef1.value.getView();
    view.getDataSource().setRows(initGridData);
  } else if (taskDiv === '3') {
    isShow1.value = true;
    isShow2.value = false;
    isShow3.value = false;
    const view = grdDetailRef1.value.getView();
    view.getDataSource().setRows(initGridData);
  } else if (taskDiv === '5') {
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
  console.log('searchParams.value:', searchParams.value);

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

async function onClickCntrDtlNo() {
  const { cntrDtlNo } = searchParams.value;
  console.log('cntrDtlNo:', cntrDtlNo);
  const res = await dataService.get('/sms/common/closing/slip-base-inf/person-information', { params: cntrDtlNo });
  console.log(res.data);
  if (res.data.length === 0) {
    console.log('계약번호가 존재하지 않습니다.');
  } else if (res.data.length === 1) {
    console.log('계약상세번호 하나');
    searchParams.value.cntrDtlNo = res.data.cntrDtlNo;
  } else {
    console.log('계약번호 조회 팝업');
    // await modal({
    // component: 'WwctaContractNumberListP',
    // componentProps: { cntrDtlNo },
    // });
  }
}

let cstNoParam;
const searchCstNoParams = ref({
  cstNo: '', // 고객번호
});
async function onClickCstNo() {
  searchCstNoParams.value.cstNo = searchParams.value.cstNo;
  cstNoParam = cloneDeep(searchCstNoParams.value);
  console.log('cstNoParam:', cstNoParam);
  const res = await dataService.get('/sms/common/customer/reg/indv-customers', { params: cstNoParam });
  console.log(res.data);
  if (res.data.length === 0) {
    console.log('고객이 존재하지 않습니다.');
  } else if (res.data.length === 1) {
    console.log('고객이 하나');
    searchParams.value.cntrDtlNo = res.data.cntrDtlNo;
  } else {
    console.log('고객 조회 팝업');
    // await modal({
    // component: 'WwctaContractNumberListP',
    // componentProps: { cntrDtlNo },
    // });
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridDetail1 = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'taskDiv',
      header: t('MSG_TXT_TASK_DIV'),
      width: '100',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdDtlCd', header: t('MSG_TXT_PRDT'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellDv', header: t('MSG_TXT_SLS_CAT'), width: '100', styleName: 'text-center' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '100', styleName: 'rg-button-link text-center', renderer: { type: 'button' } },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-right' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-right' },
    { fieldName: 'normalSellQty',
      header: t('MSG_TXT_SELL_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'normalMpyAmt',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'normalMmIstmPcamAmt',
      header: t('MSG_TXT_PVDA'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'normalVat',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'normalPurSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'chgSellQty',
      header: t('MSG_TXT_SELL_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'chgMpyAmt',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'chgMmIstmPcamAmt',
      header: t('MSG_TXT_PVDA'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'chgVat',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'chgPurSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'canSellQty',
      header: t('MSG_TXT_SELL_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'canMpyAmt',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'canMmIstmPcamAmt',
      header: t('MSG_TXT_PVDA'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'canVat',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'canPurSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sumSellQty',
      header: t('MSG_TXT_SELL_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sumMpyAmt',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sumMmIstmPcamAmt',
      header: t('MSG_TXT_PVDA'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sumVat',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sumPurSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (grid, { column }) => {
    const current = view.getCurrent();
    const dataProvider = view.getDataSource();
    const cntrDtlNo = dataProvider.getValue(current.dataRow, 'cntrDtlNo');
    if (column === 'cntrDtlNo') {
      const { taskDiv } = searchParams.value;
      await modal({
        component: 'WwdcbSalesDtlP',
        componentProps: { cntrDtlNo, taskDiv },
      });
    }
  };

  const layout1 = [
    'taskDiv',
    'sellTpCd',
    'pdDtlCd',
    'sellDv',
    'slDt',
    'cntrDtlNo',
    'cstNo',
    'cstKnm',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'normalSellQty',
        'normalMpyAmt',
        'normalMmIstmPcamAmt',
        'normalVat',
        'normalPurSlAmt',
      ],
      header: {
        text: t('MSG_TXT_NOM_SL'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [

        'chgSellQty',
        'chgMpyAmt',
        'chgMmIstmPcamAmt',
        'chgVat',
        'chgPurSlAmt',
      ],
      header: {
        text: t('MSG_TXT_SL_CH'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'canSellQty',
        'canMpyAmt',
        'canMmIstmPcamAmt',
        'canVat',
        'canPurSlAmt',
      ],
      header: {
        text: t('MSG_TXT_SL_CAN'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'sumSellQty',
        'sumMpyAmt',
        'sumMmIstmPcamAmt',
        'sumVat',
        'sumPurSlAmt',
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

  view.layoutByColumn('taskDiv').summaryUserSpans = [{ colspan: 8 }];
  view.rowIndicator.visible = true;
});

const initGridDetail2 = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'taskDiv',
      header: t('MSG_TXT_TASK_DIV'),
      width: '100',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdDtlCd', header: t('MSG_TXT_PRDT'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellDiv', header: t('MSG_TXT_SLS_CAT'), width: '100', styleName: 'text-center' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '100', styleName: 'rg-button-link text-center', renderer: { type: 'button' } },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-right' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-right' },
    { fieldName: 'rgstQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'rgstMpyAmt',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'rgstVat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'rgstPurSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'rentalQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'rentalMpyAmt',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'rentalVat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'rentalPurSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sumQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sumMpyAmt',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sumVat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sumPurSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (grid, { column }) => {
    const current = view.getCurrent();
    const dataProvider = view.getDataSource();
    const cntrDtlNo = dataProvider.getValue(current.dataRow, 'cntrDtlNo');
    if (column === 'cntrDtlNo') {
      const { taskDiv } = searchParams.value;
      await modal({
        component: 'WwdcbSalesDtlP',
        componentProps: { cntrDtlNo, taskDiv },
      });
    }
  };

  const layout1 = [
    'taskDiv',
    'sellTpCd',
    'pdDtlCd',
    'sellDiv',
    'slDt',
    'cntrDtlNo',
    'cstNo',
    'cstKnm',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'rgstQty',
            'rgstMpyAmt',
            'rgstVat',
            'rgstPurSlAmt',
          ],
          header: {
            text: t('MSG_TXT_RGST_FEE'),
          },
        },
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'rentalQty',
            'rentalMpyAmt',
            'rentalVat',
            'rentalPurSlAmt',
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
        'sumQty',
        'sumMpyAmt',
        'sumVat',
        'sumPurSlAmt',
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

  view.layoutByColumn('taskDiv').summaryUserSpans = [{ colspan: 8 }];
  view.rowIndicator.visible = true;
});

const initGridDetail3 = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'taskDiv',
      header: t('MSG_TXT_TASK_DIV'),
      width: '100',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdDtlCd', header: t('MSG_TXT_PRDT'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellDiv', header: t('MSG_TXT_SLS_CAT'), width: '100', styleName: 'text-center' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '100', styleName: 'rg-button-link text-center', renderer: { type: 'button' } },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-right' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-right' },
    { fieldName: 'sspcsQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sspcsMpyAmt',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sspcsVat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sspcsPurSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'filtQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'filtMpyAmt',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'filtVat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'filtPurSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sumQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sumMpyAmt',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sumVat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sumPurSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (grid, { column }) => {
    const current = view.getCurrent();
    const dataProvider = view.getDataSource();
    const cntrDtlNo = dataProvider.getValue(current.dataRow, 'cntrDtlNo');
    if (column === 'cntrDtlNo') {
      const { taskDiv } = searchParams.value;
      await modal({
        component: 'WwdcbSalesDtlP',
        componentProps: { cntrDtlNo, taskDiv },
      });
    }
  };

  const layout1 = [
    'taskDiv',
    'sellTpCd',
    'pdDtlCd',
    'sellDiv',
    'slDt',
    'cntrDtlNo',
    'cstNo',
    'cstKnm',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'sspcsQty',
            'sspcsMpyAmt',
            'sspcsVat',
            'sspcsPurSlAmt',
          ],
          header: {
            text: t('MSG_TXT_SSPCS'),
          },
        },
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'filtQty',
            'filtMpyAmt',
            'filtVat',
            'filtPurSlAmt',
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
        'sumQty',
        'sumMpyAmt',
        'sumVat',
        'sumPurSlAmt',
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

  view.layoutByColumn('taskDiv').summaryUserSpans = [{ colspan: 8 }];
  view.rowIndicator.visible = true;
});

const selectTaskDiv = { // 업무구분
  options: [{ codeId: '1', codeName: '일시불' }, { codeId: '2', codeName: '렌탈' }, { codeId: '3', codeName: '금융리스' }, { codeId: '4', codeName: '멤버십' }, { codeId: '5', codeName: '정기구매' }],
};

</script>
