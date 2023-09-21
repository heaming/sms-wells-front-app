<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbProductSalesListMAggregate - 상품별 매출현황 - W-CL-U-0028M03
3. 작성자 : Kicheol Choi
4. 작성일 : 2023.09.11
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품별 매출현황 조회 - 집계 탭
****************************************************************************************************
---->
<template>
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
          v-model:from="searchParams.baseDtFrom"
          v-model:to="searchParams.baseDtTo"
          type="date"
          :label="$t('MSG_TXT_SL_DT')"
          rules="date_range_required"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_SEL_TYPE')"
        :colspan="1"
      >
        <kw-select
          v-model="searchParams.sellTpCd"
          :options="codes.SELL_TP_CD"
        />
        <kw-select
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter(v => v.userDfn02 === searchParams.sellTpCd)"
          first-option="all"
          first-option-value="ALL"
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
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SEL_CHNL')">
        <kw-select
          v-model="searchParams.sellChnlDvCd"
          :options="codes.SELL_CHNL_DTL_CD"
          first-option="all"
          first-option-value="ALL"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SAP_PD_DV_CD_NM')">
        <kw-select
          v-model="searchParams.sapPdDvCd"
          :options="dynamicChangeCodes.PRD_DV_CD"
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
        v-permission:download
        icon="download_on"
        :disable="totalCount === 0"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExportView"
      />
    </kw-action-top>

    <kw-grid
      v-if="gridControl.gubun === '1'"
      ref="grdMainRef"
      name="grdBasic"
      :visible-rows="10"
      @init="initGrdBasic"
    />
    <kw-grid
      v-else-if="gridControl.gubun === '2'"
      ref="grdMainRef"
      name="grdRental"
      :visible-rows="10"
      @init="initGrdRental"
    />
    <kw-grid
      v-else-if="gridControl.gubun === '3'"
      ref="grdMainRef"
      name="grdMembership"
      :visible-rows="10"
      @init="initGrdMembership"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, defineGrid, getComponentType, useGlobal, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const now = dayjs();
const { t } = useI18n();
const { modal } = useGlobal();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const isInqrDv = ref(false);
const totalCount = ref(0);

const dynamicChangeCodes = ref({ PRD_DV_CD: [] });

const selectInqrDv = { // 조회구분
  options: [{ codeId: '1', codeName: '집계' }, { codeId: '2', codeName: '상품' }],
};

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'SELL_TP_DTL_CD', // 판매유형상세코드 (1.일반, 2:공유, 3:환경리스, 4:장기할부)
  'SELL_CHNL_DTL_CD',
);

const gridControl = ref({
  gubun: '1',
});

const searchParams = ref({
  baseDtFrom: now.format('YYYYMMDD'),
  baseDtTo: now.format('YYYYMMDD'),
  sellTpCd: '1', // 판매유형
  sellTpDtlCd: 'ALL', // 판매유형상세
  inqrDv: '1', // 판매구분
  sellChnlDvCd: 'ALL',
  sapPdDvCd: 'ALL',
});

let cachedParams;

async function getCodes() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/common/closing/income-slip/product-divide-code', { params: { ...cachedParams } });
  return res.data;
}

async function onSelectInqrDv() {
  const { sellTpCd, inqrDv } = searchParams.value;
  const view = grdMainRef.value.getView();

  if (sellTpCd !== '3') {
    view.columnByName('pdCd').visible = inqrDv === '2';
    view.columnByName('pdNm').visible = inqrDv === '2';
  }

  view.layoutByColumn('slRcogDt').summaryUserSpans = [
    { colspan: inqrDv === '1' ? 4 : 6 },
  ];
}

async function fetchSummaryData(apiParam) {
  const res = await dataService.get(`/sms/wells/closing/product-sales/${apiParam}/summary`, { params: cachedParams });
  const view = grdMainRef.value.getView();

  view.setHeaderSummaries({
    visible: true,
    items: [
      { height: 40 },
    ],
  });

  const { inqrDv } = searchParams.value;

  const cellCnt = inqrDv === '1' ? 4 : 6;
  const cellCnt2 = inqrDv === '1' ? 7 : 6;

  if (apiParam === 'basic') {
    view.getColumnNames().forEach((val, idx) => (
      idx < cellCnt || val === 'normalGroup' ? null : view.columnByName(val).setHeaderSummaries({ text: res.data[val],
        styleCallback() { return res.data[val] !== '0' && idx > cellCnt + cellCnt2 ? { styleName: 'text-right text-underline cursor-pointer' } : { styleName: 'text-right' }; } })
    ));
  } else {
    view.getColumnNames().forEach((val, idx) => (
      idx < cellCnt || val === 'normalGroup' ? null : view.columnByName(val).setHeaderSummaries({ text: res.data[val], styleName: 'text-right' })));
  }

  view.columnByName('slRcogDt').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
}

async function fetchData() {
  const { sellTpCd, sellTpDtlCd } = searchParams.value;

  let apiParam;

  if (sellTpDtlCd === '21' || sellTpDtlCd === '23') { // 렌탈
    apiParam = 'rental';
    gridControl.value.gubun = '2';
  } else if (sellTpCd === '3') { // 멤버십
    apiParam = 'membership';
    gridControl.value.gubun = '3';
  } else {
    apiParam = 'basic';
    gridControl.value.gubun = '1';
  }

  fetchSummaryData(apiParam);
  const res = await dataService.get(`/sms/wells/closing/product-sales/${apiParam}/lists`, { params: cachedParams });

  const mainList = res.data;
  totalCount.value = mainList.length;

  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(mainList);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
  await onSelectInqrDv();
}

async function onClickExportView() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

watch(() => searchParams.value.sellTpCd, async (val) => {
  searchParams.value.inqrDv = '1';
  isInqrDv.value = val === '3';
});

watch(() => searchParams.value.sellTpCd, async () => {
  searchParams.value.sellTpDtlCd = 'ALL';
});

onMounted(async () => {
  dynamicChangeCodes.value.PRD_DV_CD = await getCodes();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdBasic = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '100', styleName: 'text-center', options: codes.SELL_TP_DTL_CD },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '130', styleName: 'text-center', visible: false },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '250', styleName: 'text-center', visible: false },
    { fieldName: 'sapPdDvCd', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center', visible: false },
    { fieldName: 'sapPdDvNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' },

    // 정상매출
    { fieldName: 'sellQty', header: t('MSG_TXT_SELL_QTY'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'sellAmt', header: t('MSG_TXT_SL_AMT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'sellSplAmt', header: t('MSG_TXT_SUPPLY_AMOUNT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'sellAmtVat', header: t('MSG_TXT_VAT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'pvdaAmt', header: t('MSG_TXT_PVDA_SUB'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },

    // 매출변경
    { fieldName: 'chQty', header: t('MSG_TXT_SELL_QTY'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'slChAmt', header: t('MSG_TXT_SL_AMT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'chSplAmt', header: t('MSG_TXT_SUPPLY_AMOUNT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'chVat', header: t('MSG_TXT_VAT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'chPvdaAmt', header: t('MSG_TXT_PVDA_SUB'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },

    // 매출취소
    { fieldName: 'canQty', header: t('MSG_TXT_SELL_QTY'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'slCanAmt', header: t('MSG_TXT_SL_AMT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'canSplAmt', header: t('MSG_TXT_SUPPLY_AMOUNT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'canVat', header: t('MSG_TXT_VAT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'canPvdaAmt', header: t('MSG_TXT_PVDA_SUB'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },

    // 매출합계
    { fieldName: 'totQty', header: t('MSG_TXT_SELL_QTY'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'totAmt', header: t('MSG_TXT_SL_AMT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'totSplAmt', header: t('MSG_TXT_SUPPLY_AMOUNT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'totVat', header: t('MSG_TXT_VAT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'totPvdaAmt', header: t('MSG_TXT_PVDA_SUB'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.onCellClicked = async (g, clickData) => {
    const { column, cellType } = clickData;
    if (cellType === 'summary') {
      if (column === 'chQty' || column === 'slChAmt' || column === 'chSplAmt' || column === 'chVat' || column === 'chPvdaAmt'
       || column === 'canQty' || column === 'slCanAmt' || column === 'canSplAmt' || column === 'canVat' || column === 'canPvdaAmt'
       || column === 'totQty' || column === 'totAmt' || column === 'totSplAmt' || column === 'totVat' || column === 'totPvdaAmt') {
        await modal({
          component: 'ZwdccProductSalesChangeCancelP',
          componentProps: {
            sellTpCd: searchParams.value.sellTpCd,
            baseDtFrom: searchParams.value.baseDtFrom,
            baseDtTo: searchParams.value.baseDtTo,
          },
        });
      }
    }
  };

  const layout1 = [
    'slRcogDt',
    'sellTpCd',
    'sellTpDtlCd',
    'pdCd',
    'pdNm',
    'sapPdDvNm',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'sellQty',
        'sellAmt',
        'sellSplAmt',
        'sellAmtVat',
        'pvdaAmt',
      ],
      header: {
        text: t('MSG_TXT_NOM_SL'),
        hint: 'test',
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'chQty',
        'slChAmt',
        'chSplAmt',
        'chVat',
        'chPvdaAmt',
      ],
      header: {
        text: t('MSG_TXT_SL_CH'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'canQty',
        'slCanAmt',
        'canSplAmt',
        'canVat',
        'canPvdaAmt',
      ],
      header: {
        text: t('MSG_TXT_SL_CAN'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'totQty',
        'totAmt',
        'totSplAmt',
        'totVat',
        'totPvdaAmt',
      ],
      header: {
        text: t('MSG_TXT_SL_SUM'),
      },
    },
  ];
  view.setColumnLayout(layout1);
  view.rowIndicator.visible = true;
});

const initGrdRental = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '100', styleName: 'text-center', options: codes.SELL_TP_DTL_CD },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '130', styleName: 'text-center', visible: false },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '250', styleName: 'text-center', visible: false },
    { fieldName: 'sapPdDvCd', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center', visible: false },
    { fieldName: 'sapPdDvNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' },

    { fieldName: 'rentalRgstCostCnt', header: t('MSG_TXT_ACC_QTY'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'rentalRgstCost', header: t('MSG_TXT_SL_AMT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'rentalRgstCostSpl', header: t('MSG_TXT_SUPPLY_AMOUNT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'rentalRgstCostVat', header: t('MSG_TXT_VAT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },

    { fieldName: 'slQty', header: t('MSG_TXT_ACC_QTY'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'nomSlAmt', header: t('MSG_TXT_SL_AMT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'splAmt', header: t('MSG_TXT_SUPPLY_AMOUNT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'vat', header: t('MSG_TXT_VAT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },

    { fieldName: 'totQty', header: t('MSG_TXT_ACC_QTY'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'totSlAmt', header: t('MSG_TXT_SL_AMT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'totSpl', header: t('MSG_TXT_SUPPLY_AMOUNT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'totVat', header: t('MSG_TXT_VAT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  const layout1 = [
    'slRcogDt',
    'sellTpCd',
    'sellTpDtlCd',
    'pdCd',
    'pdNm',
    'sapPdDvNm',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'rentalRgstCostCnt',
            'rentalRgstCost',
            'rentalRgstCostSpl',
            'rentalRgstCostVat',
          ],
          header: {
            text: t('MSG_TXT_RGST_FEE'),
          },
        },
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'slQty',
            'nomSlAmt',
            'splAmt',
            'vat',
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
        'totQty',
        'totSlAmt',
        'totSpl',
        'totVat',
      ],
      header: {
        text: t('MSG_TXT_SL_SUM'),
      },
    },
  ];
  view.setColumnLayout(layout1);
  view.rowIndicator.visible = true;
});

const initGrdMembership = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '100', styleName: 'text-center', options: codes.SELL_TP_DTL_CD },
    { fieldName: 'sapPdDvCd', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center', visible: false },
    { fieldName: 'sapPdDvNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' },

    { fieldName: 'sellQty', header: t('MSG_TXT_ACC_QTY'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'sellAmt', header: t('MSG_TXT_SL_AMT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'sellSplAmt', header: t('MSG_TXT_SUPPLY_AMOUNT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'sellAmtVat', header: t('MSG_TXT_VAT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },

    { fieldName: 'filSellQty', header: t('MSG_TXT_ACC_QTY'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'filSellAmt', header: t('MSG_TXT_SL_AMT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'filSellSplAmt', header: t('MSG_TXT_SUPPLY_AMOUNT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'filSellAmtVat', header: t('MSG_TXT_VAT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },

    { fieldName: 'totSelQty', header: t('MSG_TXT_ACC_QTY'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'totSellAmt', header: t('MSG_TXT_SL_AMT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'totSellSplAmt', header: t('MSG_TXT_SUPPLY_AMOUNT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'totSellAmtVat', header: t('MSG_TXT_VAT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  const layout1 = [
    'slRcogDt',
    'sellTpCd',
    'sellTpDtlCd',
    'sapPdDvCd',
    'sapPdDvNm',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'sellQty',
            'sellAmt',
            'sellSplAmt',
            'sellAmtVat',
          ],
          header: {
            text: t('MSG_TXT_SSPCS'),
          },
        },
        {
          name: 'normalGroup',
          direction: 'horizontal',
          items: [
            'filSellQty',
            'filSellAmt',
            'filSellSplAmt',
            'filSellAmtVat',
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
        'totSelQty',
        'totSellAmt',
        'totSellSplAmt',
        'totSellAmtVat',
      ],
      header: {
        text: t('MSG_TXT_SL_SUM'),
      },
    },
  ];
  view.setColumnLayout(layout1);
  view.rowIndicator.visible = true;
});

</script>
