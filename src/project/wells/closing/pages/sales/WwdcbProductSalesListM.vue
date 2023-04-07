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
        name="mainTab"
        :label="$t('MSG_TIT_SL_PS_AGRG')"
      />
      <kw-tab
        name="detailTab"
        :label="$t('MSG_TIT_SL_DTL_INQR')"
      />
    </kw-tabs>
    <kw-tab-panels
      v-model="selectedTab"
    >
      <kw-tab-panel name="mainTab">
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
            <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
              <kw-option-group
                v-model="searchParams.inqrDv"
                :disable="isInqrDv"
                type="radio"
                :options="selectInqrDv.options"
                @change="onSelectInqrDv"
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
              <kw-select
                v-if="searchParams.taskDiv === '3'"
                v-model="searchParams.sellTp"
                :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '1' || v.codeId === '3' )"
                first-option="all"
                first-option-value="ALL"
              />
              <kw-select
                v-else-if="searchParams.taskDiv === '4'"
                v-model="searchParams.sellTp"
                :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '1')"
                first-option="all"
                first-option-value="ALL"
              />
              <kw-select
                v-else-if="searchParams.taskDiv === '5'"
                v-model="searchParams.sellTp"
                :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '5')"
                first-option="all"
                first-option-value="ALL"
              />
              <kw-select
                v-else
                v-model="searchParams.sellTp"
                :options="codes.SELL_TP_DTL_CD"
                first-option="all"
                first-option-value="ALL"
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_SLS_CAT')">
              <kw-select
                v-model="searchParams.sellDv"
                :options="codes.REDF_SELL_DV_CD"
                first-option="all"
                first-option-value="ALL"
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
            ref="grdSinglePaymentRef"
            name="grdSinglePayment"
            :visible-rows="10"
            @init="initGrdSinglePayment"
          />
          <kw-grid
            v-if="isShow2"
            ref="grdRentalRef"
            name="grdRental"
            :visible-rows="10"
            @init="initGrdRental"
          />
          <kw-grid
            v-if="isShow3"
            ref="grdMembershipsRef"
            name="grdMemberships"
            :visible-rows="10"
            @init="initGrdMemberships"
          />
        </div>
      </kw-tab-panel>
      <kw-tab-panel name="detailTab">
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

const selectedTab = ref('mainTab');
const now = dayjs();
const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdSinglePaymentRef = ref(getComponentType('KwGrid'));
const grdRentalRef = ref(getComponentType('KwGrid'));
const grdMembershipsRef = ref(getComponentType('KwGrid'));

const isShow1 = ref(true);
const isShow2 = ref(false);
const isShow3 = ref(false);
const isInqrDv = ref(false);
const totalCount = ref(0);

const selectTaskDiv = { // 업무구분
  options: [{ codeId: '1', codeName: '일시불' }, { codeId: '2', codeName: '렌탈' }, { codeId: '3', codeName: '금융리스' }, { codeId: '4', codeName: '멤버십' }, { codeId: '5', codeName: '정기구매' }],
};

const selectInqrDv = { // 조회구분
  options: [{ codeId: '1', codeName: '집계' }, { codeId: '2', codeName: '상품' }],
};

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'EDI_PD_DV_CD',
  'SELL_TP_DTL_CD', // 판매유형상세코드 (1.일반, 2:공유, 3:환경리스, 4:장기할부)
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

const initGridData = [];
async function onSelectInqrDv() {
  const { taskDiv, inqrDv } = searchParams.value;
  if (taskDiv === '1' || taskDiv === '3' || taskDiv === '5') {
    const view = grdSinglePaymentRef.value.getView();
    view.getDataSource().setRows(initGridData);
    if (inqrDv === '1') {
      view.columnByName('pdDtlCd').visible = false;
      view.columnByName('pdNm').visible = false;
      view.layoutByColumn('slDt').summaryUserSpans = [{ colspan: 3 }];
    } else if (inqrDv === '2') {
      view.columnByName('pdDtlCd').visible = true;
      view.columnByName('pdNm').visible = true;
      view.layoutByColumn('slDt').summaryUserSpans = [{ colspan: 5 }];
    }
  } else if (taskDiv === '2') {
    const view = grdRentalRef.value.getView();
    view.getDataSource().setRows(initGridData);
    if (inqrDv === '1') {
      view.columnByName('pdDtlCd').visible = false;
      view.columnByName('pdNm').visible = false;
      view.layoutByColumn('slDt').summaryUserSpans = [{ colspan: 2 }];
    } else if (inqrDv === '2') {
      view.columnByName('pdDtlCd').visible = true;
      view.columnByName('pdNm').visible = true;
      view.layoutByColumn('slDt').summaryUserSpans = [{ colspan: 4 }];
    }
  } else if (taskDiv === '4') {
    const view = grdMembershipsRef.value.getView();
    view.getDataSource().setRows(initGridData);
  }
}

let cachedParams;
async function fetchData() {
  await onSelectInqrDv();
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);

  const { taskDiv, inqrDv } = searchParams.value;
  let res;
  if (taskDiv === '1' || taskDiv === '3' || taskDiv === '5') { // 일시불, 금융리스, 정기배송
    if (inqrDv === '1') { // 집계
      res = await dataService.get('/sms/wells/closing/product-sales/single-payment-aggregates', { params: cachedParams });
    } else if (inqrDv === '2') { // 상품
      res = await dataService.get('/sms/wells/closing/product-sales/single-payment-products', { params: cachedParams });
    }
  } else if (taskDiv === '2') { // 렌탈
    if (inqrDv === '1') { // 집계
      res = await dataService.get('/sms/wells/closing/product-sales/rental-aggregates', { params: cachedParams });
    } else if (inqrDv === '2') { // 상품
      res = await dataService.get('/sms/wells/closing/product-sales/rental-products', { params: cachedParams });
    }
  } else if (taskDiv === '4') { // 멤버십
    res = await dataService.get('/sms/wells/closing/product-sales/memberships', { params: cachedParams });
  }

  const mainList = res.data;
  totalCount.value = mainList.length;

  let mainView;
  if (isShow1.value === true) {
    mainView = grdSinglePaymentRef.value.getView();
  } else if (isShow2.value === true) {
    mainView = grdRentalRef.value.getView();
  } else if (isShow3.value === true) {
    mainView = grdMembershipsRef.value.getView();
  }

  mainView.getDataSource().setRows(mainList);
  mainView.resetCurrent();
}

async function onClickSearch() {
  await fetchData();
}

// 1. 일시불, 2.렌탈, 3. 금융리스, 4.멤버십, 5.정기구매
async function onSelectTaskDiv() {
  const { taskDiv } = searchParams.value;
  if (taskDiv === '1' || taskDiv === '3') {
    isShow1.value = true;
    isShow2.value = false;
    isShow3.value = false;
    isInqrDv.value = false;
  } else if (taskDiv === '2') {
    isShow1.value = false;
    isShow2.value = true;
    isShow3.value = false;
    isInqrDv.value = false;
  } else if (taskDiv === '4') {
    isShow1.value = false;
    isShow2.value = false;
    isShow3.value = true;
    searchParams.value.inqrDv = '1';
    isInqrDv.value = true;
  } else if (taskDiv === '5') {
    isShow1.value = true;
    isShow2.value = false;
    isShow3.value = false;
    searchParams.value.inqrDv = '1';
    isInqrDv.value = true;
  }
}

async function onClickExportView() {
  let view;
  if (isShow1.value === true) {
    view = grdSinglePaymentRef.value.getView();
  } else if (isShow2.value === true) {
    view = grdRentalRef.value.getView();
  } else if (isShow3.value === true) {
    view = grdMembershipsRef.value.getView();
  }

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdSinglePayment = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slDt',
      header: t('MSG_TXT_SL_DT'),
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'date' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdDtlCd', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'col1', header: t('MSG_TXT_SLS_CAT'), width: '100', styleName: 'text-center' },
    { fieldName: 'normalSellQty', header: t('MSG_TXT_SELL_QTY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'normalMpyAmt', header: t('MSG_TXT_MPY_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'normalMmIstmPcamAmt', header: t('MSG_TXT_PVDA'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'normalVat', header: t('MSG_TXT_VAT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'normalPurSlAmt', header: t('MSG_TXT_PUR_SLPRC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'chgSellQty', header: t('MSG_TXT_SELL_QTY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'chgMpyAmt', header: t('MSG_TXT_MPY_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'chgMmIstmPcamAmt', header: t('MSG_TXT_PVDA'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'chgVat', header: t('MSG_TXT_VAT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'chgPurSlAmt', header: t('MSG_TXT_PUR_SLPRC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'canSellQty', header: t('MSG_TXT_SELL_QTY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'canMpyAmt', header: t('MSG_TXT_MPY_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'canMmIstmPcamAmt', header: t('MSG_TXT_PVDA'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'canVat', header: t('MSG_TXT_VAT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'canPurSlAmt', header: t('MSG_TXT_PUR_SLPRC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'sumSellQty', header: t('MSG_TXT_SELL_QTY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'sumMpyAmt', header: t('MSG_TXT_MPY_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'sumMmIstmPcamAmt', header: t('MSG_TXT_PVDA'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'sumVat', header: t('MSG_TXT_VAT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'sumPurSlAmt', header: t('MSG_TXT_PUR_SLPRC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
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
  view.columnByName('slDt').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.columnByName('normalSellQty').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('normalMpyAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('normalMmIstmPcamAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('normalVat').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('normalPurSlAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('chgSellQty').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum', styleName: 'rg-button-link text-right', renderer: { type: 'button' } });
  view.columnByName('chgMpyAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('chgMmIstmPcamAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('chgVat').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('chgPurSlAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('canSellQty').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('canMpyAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('canMmIstmPcamAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('canVat').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('canPurSlAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('sumSellQty').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('sumMpyAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('sumMmIstmPcamAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('sumVat').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('sumPurSlAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.onCellClicked = async (g, clickData) => {
    console.log('clickData:', clickData);
    if (clickData.cellType === 'summary') {
      if (clickData.column === 'col11' || clickData.column === 'col12') {
        console.log('매출변경 및 매출취소 팝업 호출');
      }
    }
  };

  const layout1 = [
    'slDt',
    'sellTpCd',
    'pdDtlCd',
    'pdNm',
    'col1',
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

  view.layoutByColumn('slDt').summaryUserSpans = [{ colspan: 3 }];
  view.rowIndicator.visible = true;
});

const initGrdRental = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slDt',
      header: t('MSG_TXT_SL_DT'),
      width: '100',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
      datetimeFormat: 'date' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdDtlCd', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rgstQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'rgstCost',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'rgstVat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'rgstSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'rentalQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'rentalCost',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'rentalVat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'rentalSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumCost',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumVat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  const layout1 = [
    'slDt',
    'sellTpCd',
    'pdDtlCd',
    'pdNm',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'rgstQty',
            'rgstCost',
            'rgstVat',
            'rgstSlAmt',
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
            'rentalCost',
            'rentalVat',
            'rentalSlAmt',
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
        'sumQty',
        'sumCost',
        'sumVat',
        'sumSlAmt',
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
  view.layoutByColumn('slDt').summaryUserSpans = [{ colspan: 2 }];
  view.rowIndicator.visible = true;
});

const initGrdMemberships = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slDt',
      header: t('MSG_TXT_SL_DT'),
      width: '100',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
      datetimeFormat: 'date' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' },
    { fieldName: 'sspcsSellQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sspcsMpyAmt',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sspcsVat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sspcsSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'filtSellQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'filtMpyAmt',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'filtVat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'filtSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumSellQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumMpyAmt',
      header: t('MSG_TXT_MPY_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumVat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumSlAmt',
      header: t('MSG_TXT_PUR_SLPRC'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  const layout1 = [
    'slDt',
    'sellTpCd',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'sspcsSellQty',
            'sspcsMpyAmt',
            'sspcsVat',
            'sspcsSlAmt',
          ],
          header: {
            text: t('MSG_TXT_SSPCS'),
          },
        },
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'filtSellQty',
            'filtMpyAmt',
            'filtVat',
            'filtSlAmt',
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
        'sumSellQty',
        'sumMpyAmt',
        'sumVat',
        'sumSlAmt',
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
  view.layoutByColumn('slDt').summaryUserSpans = [{ colspan: 2 }];
  view.rowIndicator.visible = true;
});

</script>
