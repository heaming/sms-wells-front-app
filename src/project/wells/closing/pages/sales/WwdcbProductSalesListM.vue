<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbProductSalesListM - 상품별 매출현황 - W-CL-U-0028M03
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.03.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품별 매출현황 조회
****************************************************************************************************
---->
<template>
  <kw-page>
    <kw-tabs
      v-model="selectedTab"
    >
      <kw-tab
        name="slPsAgrg"
        :label="$t('MSG_TIT_SL_PS_AGRG')"
      />
      <kw-tab
        name="slDtlInqr"
        :label="$t('MSG_TIT_SL_DTL_INQR')"
      />
    </kw-tabs>
    <kw-tab-panels
      v-model="selectedTab"
    >
      <kw-tab-panel name="slPsAgrg">
        <kw-search
          :cols="3"
          two-row
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
                :label="$t('MSG_TXT_SL_DT')"
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
            <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
              <kw-option-group
                v-model="searchParams.inqrDv"
                type="radio"
                :options="selectInqrDv.options"
                @change="onSelectInqrDv"
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
              <kw-select
                v-if="searchParams.taskDiv === '3'"
                v-model="searchParams.sellTp"
                :options="codes.SELL_TP_CD.filter((v) => v.codeId === '1' || v.codeId === '2' )"
                first-option
                first-option-value="ALL"
                :first-option-label="$t('MSG_TXT_ALL')"
              />
              <kw-select
                v-else-if="searchParams.taskDiv === '4'"
                v-model="searchParams.sellTp"
                :options="codes.SELL_TP_CD.filter((v) => v.codeId === '3')"
                first-option
                first-option-value="ALL"
                :first-option-label="$t('MSG_TXT_ALL')"
              />
              <kw-select
                v-else-if="searchParams.taskDiv === '5'"
                v-model="searchParams.sellTp"
                :options="codes.SELL_TP_CD.filter((v) => v.codeId === '4')"
                first-option
                first-option-value="ALL"
                :first-option-label="$t('MSG_TXT_ALL')"
              />
              <kw-select
                v-else
                v-model="searchParams.sellTp"
                :options="codes.SELL_TP_CD"
                first-option
                first-option-value="ALL"
                :first-option-label="$t('MSG_TXT_ALL')"
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_SLS_CAT')">
              <kw-select
                v-model="searchParams.sellDv"
                :options="codes.REDF_SELL_DV_CD"
                first-option
                first-option-value="ALL"
                :first-option-label="$t('MSG_TXT_ALL')"
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
            ref="grdMainRef1"
            name="grdMain1"
            :visible-rows="10"
            @init="initGridMain1"
          />
          <kw-grid
            v-if="isShow2"
            ref="grdMainRef2"
            name="grdMain2"
            :visible-rows="10"
            @init="initGridMain2"
          />
          <kw-grid
            v-if="isShow3"
            ref="grdMainRef3"
            name="grdMain3"
            :visible-rows="10"
            @init="initGridMain3"
          />
        </div>
      </kw-tab-panel>
      <kw-tab-panel name="slDtlInqr">
        <WwdcbProductSalesListMDetail
          v-model:selected-link-id="selectedLinkId"
        />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import WwdcbProductSalesListMDetail from './WwdcbProductSalesListMDetail.vue';

const selectedTab = ref('slPsAgrg');
const now = dayjs();
const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef1 = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));
const grdMainRef3 = ref(getComponentType('KwGrid'));

const isShow1 = ref(true);
const isShow2 = ref(false);
const isShow3 = ref(false);
const totalCount = ref(0);

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'EDI_PD_DV_CD',
  'SELL_TP_CD',
  'REDF_SELL_DV_CD',
);
const searchParams = ref({
  baseDtmnFrom: now.subtract(30, 'day').format('YYYYMMDD'),
  baseDtmnTo: now.format('YYYYMMDD'),
  taskDiv: '1', // 업무구분
  inqrDv: '1', // 조회구분
  sellTp: 'ALL', // 판매유형
  sellDv: 'ALL', // 판매구분
});

async function onSelectInqrDv() {
  const { inqrDv } = searchParams.value;
  const { taskDiv } = searchParams.value;
  if (taskDiv === '1' || taskDiv === '3' || taskDiv === '5') {
    const view = grdMainRef1.value.getView();
    if (inqrDv === '1') {
      view.columnByName('col3').visible = false;
      view.columnByName('col4').visible = false;
      view.layoutByColumn('col1').summaryUserSpans = [{ colspan: 3 }];
    } else if (inqrDv === '2') {
      view.columnByName('col3').visible = true;
      view.columnByName('col4').visible = true;
      view.layoutByColumn('col1').summaryUserSpans = [{ colspan: 5 }];
    }
  } else if (taskDiv === '2') {
    const view = grdMainRef2.value.getView();
    if (inqrDv === '1') {
      view.columnByName('col3').visible = false;
      view.columnByName('col4').visible = false;
      view.layoutByColumn('col1').summaryUserSpans = [{ colspan: 2 }];
    } else if (inqrDv === '2') {
      view.columnByName('col3').visible = true;
      view.columnByName('col4').visible = true;
      view.layoutByColumn('col1').summaryUserSpans = [{ colspan: 4 }];
    }
  }
}

let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);

  const { taskDiv } = searchParams.value;
  if (taskDiv === '1' || taskDiv === '3' || taskDiv === '5') {
    const res = await dataService.get('/sms/wells/closing/product-sales/single-payment', { params: cachedParams });
    const mainList = res.data;
    totalCount.value = mainList.length;
    const view = grdMainRef1.value.getView();
    view.getDataSource().setRows(mainList);
    view.resetCurrent();
  } else if (taskDiv === '2') {
    const res = await dataService.get('/sms/wells/closing/product-sales/rental', { params: cachedParams });
    const mainList = res.data;
    totalCount.value = mainList.length;
    const view = grdMainRef2.value.getView();
    view.getDataSource().setRows(mainList);
    view.resetCurrent();
  } else if (taskDiv === '4') {
    const res = await dataService.get('/sms/wells/closing/product-sales/membership', { params: cachedParams });
    const mainList = res.data;
    totalCount.value = mainList.length;
    const view = grdMainRef3.value.getView();
    view.getDataSource().setRows(mainList);
    view.resetCurrent();
  }
  await onSelectInqrDv();
}

async function onClickSearch() {
  await fetchData();
}

async function onSelectTaskDiv() {
  const { taskDiv } = searchParams.value;
  if (taskDiv === '1' || taskDiv === '3' || taskDiv === '5') {
    isShow1.value = true;
    isShow2.value = false;
    isShow3.value = false;
  } else if (taskDiv === '2') {
    isShow1.value = false;
    isShow2.value = true;
    isShow3.value = false;
  } else if (taskDiv === '4') {
    isShow1.value = false;
    isShow2.value = false;
    isShow3.value = true;
  }
}

async function onClickExportView() {
  const { taskDiv } = searchParams.value;
  if (taskDiv === '1' || taskDiv === '3' || taskDiv === '5') {
    const view = grdMainRef1.value.getView();
    const response = await dataService.get('/sms/wells/closing/product-sales/single-payment/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: 'mainList',
      timePostfix: true,
      exportData: response.data,
    });
  } else if (taskDiv === '2') {
    const view = grdMainRef2.value.getView();
    const response = await dataService.get('/sms/wells/closing/product-sales/rental/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: 'mainList',
      timePostfix: true,
      exportData: response.data,
    });
  } else if (taskDiv === '4') {
    const view = grdMainRef3.value.getView();
    const response = await dataService.get('/sms/wells/closing/product-sales/membership/excel-download', { params: cachedParams });
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
const initGridMain1 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6', dataType: 'number' },
    { fieldName: 'col7', dataType: 'number' },
    { fieldName: 'col8', dataType: 'number' },
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
  ];

  const columns = [
    { fieldName: 'col1',
      header: t('MSG_TXT_SL_DT'),
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'date' },
    { fieldName: 'col2', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'col4', header: t('MSG_TXT_PRDT_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'col5', header: t('MSG_TXT_SLS_CAT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_SELL_QTY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col7', header: t('MSG_TXT_MPY_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col8', header: t('MSG_TXT_PVDA'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col9', header: t('MSG_TXT_VAT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col10', header: t('MSG_TXT_PUR_SLPRC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col11', header: t('MSG_TXT_SELL_QTY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col12', header: t('MSG_TXT_MPY_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col13', header: t('MSG_TXT_PVDA'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col14', header: t('MSG_TXT_VAT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col15', header: t('MSG_TXT_PUR_SLPRC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col16', header: t('MSG_TXT_SELL_QTY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col17', header: t('MSG_TXT_MPY_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col18', header: t('MSG_TXT_PVDA'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col19', header: t('MSG_TXT_VAT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col20', header: t('MSG_TXT_PUR_SLPRC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col21', header: t('MSG_TXT_SELL_QTY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col22', header: t('MSG_TXT_MPY_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col23', header: t('MSG_TXT_PVDA'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col24', header: t('MSG_TXT_VAT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col25', header: t('MSG_TXT_PUR_SLPRC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
  view.columnByName('col1').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.columnByName('col6').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum', styleName: 'rg-button-link text-right', renderer: { type: 'button' } });
  view.columnByName('col7').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col8').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col9').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col10').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col11').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col12').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col13').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col14').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col15').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col16').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col17').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col18').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col19').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col20').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col21').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col22').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col23').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col24').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('col25').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });

  view.onCellClicked = async (g, clickData) => {
    console.log('clickData:', clickData);
    if (clickData.cellType === 'summary') {
      if (clickData.column === 'col11' || clickData.column === 'col12') {
        console.log('매출변경 및 매출취소 팝업 호출');
      }
    }
  };

  const layout1 = [
    'col1',
    'col2',
    'col3',
    'col4',
    'col5',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'col6',
        'col7',
        'col8',
        'col9',
        'col10',
      ],
      header: {
        text: t('MSG_TXT_NOM_SL'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'col11',
        'col12',
        'col13',
        'col14',
        'col15',
      ],
      header: {
        text: t('MSG_TXT_SL_CH'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'col16',
        'col17',
        'col18',
        'col19',
        'col20',
      ],
      header: {
        text: t('MSG_TXT_SL_CAN'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'col21',
        'col22',
        'col23',
        'col24',
        'col25',
      ],
      header: {
        text: t('MSG_TXT_SL_SUM'),
      },
    },
  ];
  view.setColumnLayout(layout1);

  view.layoutByColumn('col1').summaryUserSpans = [{ colspan: 3 }];
  view.rowIndicator.visible = true;
});

const initGridMain2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5', dataType: 'number' },
    { fieldName: 'col6', dataType: 'number' },
    { fieldName: 'col7', dataType: 'number' },
    { fieldName: 'col8', dataType: 'number' },
    { fieldName: 'col9', dataType: 'number' },
    { fieldName: 'col10', dataType: 'number' },
    { fieldName: 'col11', dataType: 'number' },
    { fieldName: 'col12', dataType: 'number' },
    { fieldName: 'col13', dataType: 'number' },
    { fieldName: 'col14', dataType: 'number' },
    { fieldName: 'col15', dataType: 'number' },
    { fieldName: 'col16', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'col1',
      header: t('MSG_TXT_SL_DT'),
      width: '100',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
      datetimeFormat: 'date' },
    { fieldName: 'col2', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'col4', header: t('MSG_TXT_PRDT_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'col5',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col6',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col7',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col8',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col9',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col10',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col11',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col12',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col13',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col14',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col15',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col16',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  const layout1 = [
    'col1',
    'col2',
    'col3',
    'col4',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'col5',
            'col6',
            'col7',
            'col8',
          ],
          header: {
            text: t('TXT_MSG_RGST_FEE'),
          },
        },
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
            text: t('MSG_TXT_RTLFE'),
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
        'col13',
        'col14',
        'col15',
        'col16',
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
  view.layoutByColumn('col1').summaryUserSpans = [{ colspan: 2 }];
  view.rowIndicator.visible = true;
});

const initGridMain3 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3', dataType: 'number' },
    { fieldName: 'col4', dataType: 'number' },
    { fieldName: 'col5', dataType: 'number' },
    { fieldName: 'col6', dataType: 'number' },
    { fieldName: 'col7', dataType: 'number' },
    { fieldName: 'col8', dataType: 'number' },
    { fieldName: 'col9', dataType: 'number' },
    { fieldName: 'col10', dataType: 'number' },
    { fieldName: 'col11', dataType: 'number' },
    { fieldName: 'col12', dataType: 'number' },
    { fieldName: 'col13', dataType: 'number' },
    { fieldName: 'col14', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'col1',
      header: t('MSG_TXT_SL_DT'),
      width: '100',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
      datetimeFormat: 'date' },
    { fieldName: 'col2', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' },
    { fieldName: 'col3',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col4',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col5',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col6',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col7',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col8',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col9',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col10',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col11',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col12',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col13',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'col14',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  const layout1 = [
    'col1',
    'col2',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'col3',
            'col4',
            'col5',
            'col6',
          ],
          header: {
            text: t('MSG_TXT_SSPCS'),
          },
        },
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'col7',
            'col8',
            'col9',
            'col10',
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
        'col11',
        'col12',
        'col13',
        'col14',
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
  view.layoutByColumn('col1').summaryUserSpans = [{ colspan: 2 }];
  view.rowIndicator.visible = true;
});

const selectTaskDiv = { // 업무구분
  options: [{ codeId: '1', codeName: '일시불' }, { codeId: '2', codeName: '렌탈' }, { codeId: '3', codeName: '금융리스' }, { codeId: '4', codeName: '멤버십' }, { codeId: '5', codeName: '정기구매' }],
};

const selectInqrDv = { // 조회구분
  options: [{ codeId: '1', codeName: '집계' }, { codeId: '2', codeName: '상품' }],
};
</script>
