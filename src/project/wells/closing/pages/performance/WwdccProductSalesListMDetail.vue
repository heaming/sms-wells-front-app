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
          type="date"
          :label="$t('MSG_TXT_SL_DT')"
          rules="date_range_required"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_SEL_TYPE')"
        required
      >
        <kw-select
          v-model="searchParams.sellTpCd"
          :options="codes.SELL_TP_CD"
          :label="$t('MSG_TXT_SEL_TYPE')"
        />
        <kw-select
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD"
          first-option="all"
          first-option-value="ALL"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_SEL_CHNL')"
      >
        <kw-select
          v-model="searchParams.sellChnlDtl"
          :options="codes.SELL_CHNL_DV_CD"
          first-option="all"
          first-option-value="ALL"
          :label="$t('MSG_TXT_SEL_CHNL')"
        />
      </kw-search-item><!-- 판매 채널 -->
      <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
          :disable="isDisable"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_CST_NO')">
        <kw-input
          v-model="searchParams.cstNo"
          :label="$t('MSG_TXT_CST_NO')"
          icon="search"
          clearable
          :regex="/^[0-9]*$/i"
          maxlength="10"
          @click-icon="onClickCustomer"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_SAP_SLPNO')">
        <kw-input
          v-model="searchParams.sapSlpno"
          regex="alpha_num"
          maxlength="14"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_SAP_PD_DV_CD_NM')"
      >
        <kw-select
          v-model="searchParams.sapPdDvCd"
          :options="sapPdDv"
          option-value="codeId"
          option-label="codeName"
          first-option="all"
        /><!--SAP상품구분코드명-->
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
      v-if="isShow1"
      ref="grdDetailSingleRef"
      name="grdDetailSingle"
      :visible-rows="10"
      @init="initGrdSinglePayment"
    />
    <kw-grid
      v-if="isShow2"
      ref="grdDetailRentalRef"
      name="grdDetailRental"
      :visible-rows="10"
      @init="initGrdRental"
    />
    <kw-grid
      v-if="isShow3"
      ref="grdDetailMembershipsRef"
      name="grdDetailMemberships"
      :visible-rows="10"
      @init="initGrdMemberships"
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
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
// import { getSellTpCd, getSellTpDtlCd } from '~/modules/sms-common/closing/utils/clUtil';

const now = dayjs();
const { t } = useI18n();
const { modal } = useGlobal();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdDetailSingleRef = ref(getComponentType('KwGrid'));
const grdDetailRentalRef = ref(getComponentType('KwGrid'));
const grdDetailMembershipsRef = ref(getComponentType('KwGrid'));

const isShow1 = ref(true);
const isShow2 = ref(false);
const isShow3 = ref(false);
const totalCount = ref(0);

const sapPdDv = (await dataService.get('/sms/wells/closing/performance/overdue-penalty/code'))
  .data.map((v) => ({ codeId: v.sapPdDvCd, codeName: v.sapPdDvNm }));
// const selectSellTpCd = await getSellTpCd();
// const codes.SELL_TP_DTL_CD = await getSellTpDtlCd();

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'SELL_CHNL_DV_CD', // 판매채널
);
const searchParams = ref({
  baseDtmnFrom: now.subtract(30, 'day').format('YYYYMMDD'),
  baseDtmnTo: now.format('YYYYMMDD'),
  sellTpCd: '1', // 판매유형
  sellTpDtlCd: 'ALL', // 판매유형상세
  sellChnlDtl: 'ALL', // 판매채널
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약상세번호
  cstNo: '', // 고객번호
  sapSlpno: '', // SAP전표번호
  sapPdDvCd: '', // SAP상품구분코드
});

let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  console.log('searchParams.value:', searchParams.value);

  const { sellTpCd, sellTpDtlCd } = searchParams.value;
  if (sellTpCd === '2' && (sellTpDtlCd === '21' || sellTpDtlCd === '23')) { // 렌탈
    isShow1.value = false;
    isShow2.value = true;
    isShow3.value = false;
    const res = await dataService.get('/sms/wells/closing/product-sales-detail/rental', { params: cachedParams });
    const mainList = res.data;
    totalCount.value = mainList.length;
    const view = grdDetailRentalRef.value.getView();
    view.getDataSource().setRows(mainList);
  } else if (sellTpCd === '3') { // 멤버십
    isShow1.value = false;
    isShow2.value = false;
    isShow3.value = true;
    const res = await dataService.get('/sms/wells/closing/product-sales-detail/membership', { params: cachedParams });
    const mainList = res.data;
    totalCount.value = mainList.length;
    const view = grdDetailMembershipsRef.value.getView();
    view.getDataSource().setRows(mainList);
  } else { // 일시불, 리스, 정기배송
    isShow1.value = true;
    isShow2.value = false;
    isShow3.value = false;
    const res = await dataService.get('/sms/wells/closing/product-sales-detail/single-payment', { params: cachedParams });
    console.log(res.data);
    const mainList = res.data;
    totalCount.value = mainList.length;
    const view = grdDetailSingleRef.value.getView();
    view.getDataSource().setRows(mainList);
  }
}

async function onClickSearch() {
  await fetchData();
}

async function onClickExportView() {
  const { sellTpCd, sellTpDtlCd } = searchParams.value;
  if (sellTpCd === '2' && (sellTpDtlCd === '21' || sellTpDtlCd === '23')) { // 렌탈
    const view = grdDetailRentalRef.value.getView();
    const response = await dataService.get('/sms/wells/closing/product-sales-detail/rental/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: 'mainList',
      timePostfix: true,
      exportData: response.data,
    });
  } else if (sellTpCd === '3') {
    const view = grdDetailMembershipsRef.value.getView();
    const response = await dataService.get('/sms/wells/closing/product-sales-detail/membership/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: 'mainList',
      timePostfix: true,
      exportData: response.data,
    });
  } else {
    const view = grdDetailSingleRef.value.getView();
    const response = await dataService.get('/sms/wells/closing/product-sales-detail/single-payment/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: 'mainList',
      timePostfix: true,
      exportData: response.data,
    });
  }
}

const onClickCustomer = async () => {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: {
      cstNo: searchParams.value.cstNo,
    },
  });
  if (result) {
    const { cstNo } = payload;
    searchParams.value.cstNo = cstNo;
  }
};
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdSinglePayment = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      width: '100',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT'), width: '200', styleName: 'text-left' },
    { fieldName: 'sellInflwChnlDtlCd', header: t('MSG_TXT_SEL_CHNL'), width: '100', styleName: 'text-center' },
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '100',
      styleName: 'text-center rg-button-link',
      renderer: { type: 'button' } },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'sapPdDvCd', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '180', styleName: 'text-center' },
    { fieldName: 'sellQty',
      header: t('MSG_TXT_SELL_QTY'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sellAmt',
      header: t('MSG_TXT_SL_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sellSplAmt',
      header: t('MSG_TXT_SUPPLY_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sellAmtVat',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'pvdaAmt',
      header: t('MSG_TXT_PVDA_SUB'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'chQty',
      header: t('MSG_TXT_SELL_QTY'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'slChAmt',
      header: t('MSG_TXT_SL_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'chSplAmt',
      header: t('MSG_TXT_SUPPLY_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'chVat',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'chPvdaAmt',
      header: t('MSG_TXT_PVDA_SUB'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'canQty',
      header: t('MSG_TXT_SELL_QTY'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'slCanAmt',
      header: t('MSG_TXT_SL_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'canSplAmt',
      header: t('MSG_TXT_SUPPLY_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'canVat',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'canPvdaAmt',
      header: t('MSG_TXT_PVDA_SUB'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'totQty',
      header: t('MSG_TXT_SELL_QTY'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'totAmt',
      header: t('MSG_TXT_SL_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'totSplAmt',
      header: t('MSG_TXT_SUPPLY_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'totVat',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'totPvdaAmt',
      header: t('MSG_TXT_PVDA_SUB'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    const { cntrNo, cntrSn, slRcogDt } = g.getValues(itemIndex);
    if (column === 'cntrDtlNo') {
      const { sellTpCd } = searchParams.value;
      await modal({
        component: 'WwdcbSalesDtlP',
        componentProps: { cntrNo, cntrSn, slRcogDt, sellTpCd },
      });
    }
  };

  const layout1 = [
    'sellTpCd',
    'sellTpDtlCd',
    'pdCd',
    'pdNm',
    'sellInflwChnlDtlCd',
    'slRcogDt',
    'cntrDtlNo',
    'cstKnm',
    'sapPdDvCd',
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
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });

  view.layoutByColumn('sellTpCd').summaryUserSpans = [{ colspan: 9 }];
  view.rowIndicator.visible = true;
});

const initGrdRental = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      width: '100',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT'), width: '200', styleName: 'text-left' },
    { fieldName: 'sellInflwChnlDtlCd', header: t('MSG_TXT_SEL_CHNL'), width: '100', styleName: 'text-center' },
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '100',
      styleName: 'text-center rg-button-link',
      renderer: { type: 'button' } },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'sapPdDvCd', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '180', styleName: 'text-center' },
    { fieldName: 'rentalRgstCostCnt',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'rentalRgstCost',
      header: t('MSG_TXT_SL_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'rentalRgstCostSpl',
      header: t('MSG_TXT_SUPPLY_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'rentalRgstCostVat',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'slQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'nomSlAmt',
      header: t('MSG_TXT_SL_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'splAmt',
      header: t('MSG_TXT_SUPPLY_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'vat',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'totQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'totSlAmt',
      header: t('MSG_TXT_SL_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'totSplAmt',
      header: t('MSG_TXT_SUPPLY_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'totVat',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    const { cntrNo, cntrSn, slRcogDt } = g.getValues(itemIndex);
    if (column === 'cntrDtlNo') {
      const { sellTpCd } = searchParams.value;
      await modal({
        component: 'WwdcbSalesDtlP',
        componentProps: { cntrNo, cntrSn, slRcogDt, sellTpCd },
      });
    }
  };

  const layout1 = [
    'sellTpCd',
    'sellTpDtlCd',
    'pdCd',
    'pdNm',
    'sellInflwChnlDtlCd',
    'slRcogDt',
    'cntrDtlNo',
    'cstKnm',
    'sapPdDvCd',
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
        text: t('MSG_TXT_NOM_SL'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'totQty',
        'totSlAmt',
        'totSplAmt',
        'totVat',
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
        height: 42,
      },
    ],
  });

  view.layoutByColumn('sellTpCd').summaryUserSpans = [{ colspan: 9 }];
  view.rowIndicator.visible = true;
});

const initGrdMemberships = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      width: '100',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT'), width: '200', styleName: 'text-left' },
    { fieldName: 'sellInflwChnlDtlCd', header: t('MSG_TXT_SEL_CHNL'), width: '100', styleName: 'text-center' },
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '100',
      styleName: 'text-center rg-button-link',
      renderer: { type: 'button' } },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'sapPdDvCd', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '180', styleName: 'text-center' },
    { fieldName: 'sellQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sellAmt',
      header: t('MSG_TXT_SL_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sellSplAmt',
      header: t('MSG_TXT_SUPPLY_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'sellAmtVat',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'filSellQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'filSellAmt',
      header: t('MSG_TXT_SL_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'filSellSplAmt',
      header: t('MSG_TXT_SUPPLY_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'filSellAmtVat',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'totSelQty',
      header: t('MSG_TXT_ACC_QTY'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'totSellAmt',
      header: t('MSG_TXT_SL_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'totSellSplAmt',
      header: t('MSG_TXT_SUPPLY_AMOUNT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'totSellAmtVat',
      header: t('MSG_TXT_VAT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      } },
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    const { cntrNo, cntrSn, slRcogDt } = g.getValues(itemIndex);
    if (column === 'cntrDtlNo') {
      const { sellTpCd } = searchParams.value;
      await modal({
        component: 'WwdcbSalesDtlP',
        componentProps: { cntrNo, cntrSn, slRcogDt, sellTpCd },
      });
    }
  };

  const layout1 = [
    'sellTpCd',
    'sellTpDtlCd',
    'pdCd',
    'pdNm',
    'sellInflwChnlDtlCd',
    'slRcogDt',
    'cntrDtlNo',
    'cstKnm',
    'sapPdDvCd',
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
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });

  view.layoutByColumn('sellTpCd').summaryUserSpans = [{ colspan: 9 }];
  view.rowIndicator.visible = true;
});

</script>
