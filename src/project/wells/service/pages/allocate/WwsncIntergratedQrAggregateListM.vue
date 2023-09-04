<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : WwsncIntergratedQrAggregateListM(K-W-SV-U-0222M01) - 통합QR 집계표
3. 작성자 : jaehunlee
4. 작성일 : 2023.08.29
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- 통합QR 처리현황 (http://localhost:3000/#/service/wwsnc-intergrated-qr-procs-list)
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_BASE_YEAR')"
        >
          <kw-date-picker
            v-model="searchParams.baseYear"
            type="year"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <kw-btn
          icon="print"
          dense
          secondary
          :label="t('MSG_BTN_PRTG')"
          @click="onClickPrintEl"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload1"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import { printElement } from '~common/utils/common';

const now = dayjs();
const { t } = useI18n();
const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const searchParams = ref({
  baseYear: now.format('YYYY'),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/intergrated-qr-aggregate', { params: { ...cachedParams } });
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload1() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/intergrated-qr-aggregate', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
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
    { fieldName: 'grpNm' },
    { fieldName: 'newQr01', dataType: 'number' },
    { fieldName: 'sumQr01', dataType: 'number' },
    { fieldName: 'wellsAccount01', dataType: 'number' },
    { fieldName: 'accountRate01', dataType: 'number' },
    { fieldName: 'newQr02', dataType: 'number' },
    { fieldName: 'sumQr02', dataType: 'number' },
    { fieldName: 'wellsAccount02', dataType: 'number' },
    { fieldName: 'accountRate02', dataType: 'number' },
    { fieldName: 'newQr03', dataType: 'number' },
    { fieldName: 'sumQr03', dataType: 'number' },
    { fieldName: 'wellsAccount03', dataType: 'number' },
    { fieldName: 'accountRate03', dataType: 'number' },
    { fieldName: 'newQr04', dataType: 'number' },
    { fieldName: 'sumQr04', dataType: 'number' },
    { fieldName: 'wellsAccount04', dataType: 'number' },
    { fieldName: 'accountRate04', dataType: 'number' },
    { fieldName: 'newQr05', dataType: 'number' },
    { fieldName: 'sumQr05', dataType: 'number' },
    { fieldName: 'wellsAccount05', dataType: 'number' },
    { fieldName: 'accountRate05', dataType: 'number' },
    { fieldName: 'newQr06', dataType: 'number' },
    { fieldName: 'sumQr06', dataType: 'number' },
    { fieldName: 'wellsAccount06', dataType: 'number' },
    { fieldName: 'accountRate06', dataType: 'number' },
    { fieldName: 'newQr07', dataType: 'number' },
    { fieldName: 'sumQr07', dataType: 'number' },
    { fieldName: 'wellsAccount07', dataType: 'number' },
    { fieldName: 'accountRate07', dataType: 'number' },
    { fieldName: 'newQr08', dataType: 'number' },
    { fieldName: 'sumQr08', dataType: 'number' },
    { fieldName: 'wellsAccount08', dataType: 'number' },
    { fieldName: 'accountRate08', dataType: 'number' },
    { fieldName: 'newQr09', dataType: 'number' },
    { fieldName: 'sumQr09', dataType: 'number' },
    { fieldName: 'wellsAccount09', dataType: 'number' },
    { fieldName: 'accountRate09', dataType: 'number' },
    { fieldName: 'newQr10', dataType: 'number' },
    { fieldName: 'sumQr10', dataType: 'number' },
    { fieldName: 'wellsAccount10', dataType: 'number' },
    { fieldName: 'accountRate10', dataType: 'number' },
    { fieldName: 'newQr11', dataType: 'number' },
    { fieldName: 'sumQr11', dataType: 'number' },
    { fieldName: 'wellsAccount11', dataType: 'number' },
    { fieldName: 'accountRate11', dataType: 'number' },
    { fieldName: 'newQr12', dataType: 'number' },
    { fieldName: 'sumQr12', dataType: 'number' },
    { fieldName: 'wellsAccount12', dataType: 'number' },
    { fieldName: 'accountRate12', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'grpNm',
      header: t('MSG_TXT_PD_GRP'),
      width: '120',
      styleName: 'text-left',
      footer: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-right',
      } },
    { fieldName: 'newQr01',
      header: t('MSG_TXT_NEW_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'newQr02',
      header: t('MSG_TXT_NEW_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'newQr03',
      header: t('MSG_TXT_NEW_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'newQr04',
      header: t('MSG_TXT_NEW_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'newQr05',
      header: t('MSG_TXT_NEW_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'newQr06',
      header: t('MSG_TXT_NEW_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'newQr07',
      header: t('MSG_TXT_NEW_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'newQr08',
      header: t('MSG_TXT_NEW_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'newQr09',
      header: t('MSG_TXT_NEW_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'newQr10',
      header: t('MSG_TXT_NEW_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'newQr11',
      header: t('MSG_TXT_NEW_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'newQr12',
      header: t('MSG_TXT_NEW_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },

    { fieldName: 'sumQr01',
      header: t('MSG_TXT_SUM_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumQr02',
      header: t('MSG_TXT_SUM_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumQr03',
      header: t('MSG_TXT_SUM_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumQr04',
      header: t('MSG_TXT_SUM_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumQr05',
      header: t('MSG_TXT_SUM_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumQr06',
      header: t('MSG_TXT_SUM_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumQr07',
      header: t('MSG_TXT_SUM_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumQr08',
      header: t('MSG_TXT_SUM_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumQr09',
      header: t('MSG_TXT_SUM_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumQr10',
      header: t('MSG_TXT_SUM_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumQr11',
      header: t('MSG_TXT_SUM_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sumQr12',
      header: t('MSG_TXT_SUM_QR') + t('MSG_TXT_RGS_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },

    { fieldName: 'wellsAccount01',
      header: t('MSG_TXT_WELLS') + t('MSG_TXT_ACML') + t('MSG_TXT_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'wellsAccount02',
      header: t('MSG_TXT_WELLS') + t('MSG_TXT_ACML') + t('MSG_TXT_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'wellsAccount03',
      header: t('MSG_TXT_WELLS') + t('MSG_TXT_ACML') + t('MSG_TXT_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'wellsAccount04',
      header: t('MSG_TXT_WELLS') + t('MSG_TXT_ACML') + t('MSG_TXT_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'wellsAccount05',
      header: t('MSG_TXT_WELLS') + t('MSG_TXT_ACML') + t('MSG_TXT_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'wellsAccount06',
      header: t('MSG_TXT_WELLS') + t('MSG_TXT_ACML') + t('MSG_TXT_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'wellsAccount07',
      header: t('MSG_TXT_WELLS') + t('MSG_TXT_ACML') + t('MSG_TXT_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'wellsAccount08',
      header: t('MSG_TXT_WELLS') + t('MSG_TXT_ACML') + t('MSG_TXT_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'wellsAccount09',
      header: t('MSG_TXT_WELLS') + t('MSG_TXT_ACML') + t('MSG_TXT_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'wellsAccount10',
      header: t('MSG_TXT_WELLS') + t('MSG_TXT_ACML') + t('MSG_TXT_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'wellsAccount11',
      header: t('MSG_TXT_WELLS') + t('MSG_TXT_ACML') + t('MSG_TXT_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'wellsAccount12',
      header: t('MSG_TXT_WELLS') + t('MSG_TXT_ACML') + t('MSG_TXT_ACC'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },

    { fieldName: 'accountRate01',
      header: t('MSG_TXT_ACC') + t('MSG_TXT_RAT'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.00;;;f',
      footer: {
        styleName: 'text-right',
        numberFormat: '#,##0.00;;;f',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          let sum2 = 0;

          sum = grid.getSummary('sumQr01', 'sum');
          sum2 = grid.getSummary('wellsAccount01', 'sum');

          return (sum / sum2) * 100;
        },
      } },
    { fieldName: 'accountRate02',
      header: t('MSG_TXT_ACC') + t('MSG_TXT_RAT'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.00;;;f',
      footer: {
        styleName: 'text-right',
        numberFormat: '#,##0.00;;;f',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          let sum2 = 0;

          sum = grid.getSummary('sumQr02', 'sum');
          sum2 = grid.getSummary('wellsAccount02', 'sum');

          return (sum / sum2) * 100;
        },
      } },
    { fieldName: 'accountRate03',
      header: t('MSG_TXT_ACC') + t('MSG_TXT_RAT'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.00;;;f',
      footer: {
        styleName: 'text-right',
        numberFormat: '#,##0.00;;;f',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          let sum2 = 0;

          sum = grid.getSummary('sumQr03', 'sum');
          sum2 = grid.getSummary('wellsAccount03', 'sum');

          return (sum / sum2) * 100;
        },
      } },
    { fieldName: 'accountRate04',
      header: t('MSG_TXT_ACC') + t('MSG_TXT_RAT'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.00;;;f',
      footer: {
        styleName: 'text-right',
        numberFormat: '#,##0.00;;;f',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          let sum2 = 0;

          sum = grid.getSummary('sumQr04', 'sum');
          sum2 = grid.getSummary('wellsAccount04', 'sum');

          return (sum / sum2) * 100;
        },
      } },
    { fieldName: 'accountRate05',
      header: t('MSG_TXT_ACC') + t('MSG_TXT_RAT'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.00;;;f',
      footer: {
        styleName: 'text-right',
        numberFormat: '#,##0.00;;;f',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          let sum2 = 0;

          sum = grid.getSummary('sumQr05', 'sum');
          sum2 = grid.getSummary('wellsAccount05', 'sum');

          return (sum / sum2) * 100;
        },
      } },
    { fieldName: 'accountRate06',
      header: t('MSG_TXT_ACC') + t('MSG_TXT_RAT'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.00;;;f',
      footer: {
        styleName: 'text-right',
        numberFormat: '#,##0.00;;;f',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          let sum2 = 0;

          sum = grid.getSummary('sumQr06', 'sum');
          sum2 = grid.getSummary('wellsAccount06', 'sum');

          return (sum / sum2) * 100;
        },
      } },
    { fieldName: 'accountRate07',
      header: t('MSG_TXT_ACC') + t('MSG_TXT_RAT'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.00;;;f',
      footer: {
        styleName: 'text-right',
        numberFormat: '#,##0.00;;;f',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          let sum2 = 0;

          sum = grid.getSummary('sumQr07', 'sum');
          sum2 = grid.getSummary('wellsAccount07', 'sum');

          return (sum / sum2) * 100;
        },
      } },
    { fieldName: 'accountRate08',
      header: t('MSG_TXT_ACC') + t('MSG_TXT_RAT'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.00;;;f',
      footer: {
        styleName: 'text-right',
        numberFormat: '#,##0.00;;;f',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          let sum2 = 0;

          sum = grid.getSummary('sumQr08', 'sum');
          sum2 = grid.getSummary('wellsAccount08', 'sum');

          return (sum / sum2) * 100;
        },
      } },
    { fieldName: 'accountRate09',
      header: t('MSG_TXT_ACC') + t('MSG_TXT_RAT'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.00;;;f',
      footer: {
        styleName: 'text-right',
        numberFormat: '#,##0.00;;;f',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          let sum2 = 0;

          sum = grid.getSummary('sumQr09', 'sum');
          sum2 = grid.getSummary('wellsAccount09', 'sum');

          return (sum / sum2) * 100;
        },
      } },
    { fieldName: 'accountRate10',
      header: t('MSG_TXT_ACC') + t('MSG_TXT_RAT'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.00;;;f',
      footer: {
        styleName: 'text-right',
        numberFormat: '#,##0.00;;;f',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          let sum2 = 0;

          sum = grid.getSummary('sumQr10', 'sum');
          sum2 = grid.getSummary('wellsAccount10', 'sum');

          return (sum / sum2) * 100;
        },
      } },
    { fieldName: 'accountRate11',
      header: t('MSG_TXT_ACC') + t('MSG_TXT_RAT'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.00;;;f',
      footer: {
        styleName: 'text-right',
        numberFormat: '#,##0.00;;;f',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          let sum2 = 0;

          sum = grid.getSummary('sumQr11', 'sum');
          sum2 = grid.getSummary('wellsAccount11', 'sum');

          return (sum / sum2) * 100;
        },
      } },
    { fieldName: 'accountRate12',
      header: t('MSG_TXT_ACC') + t('MSG_TXT_RAT'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.00;;;f',
      footer: {
        styleName: 'text-right',
        numberFormat: '#,##0.00;;;f',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          let sum2 = 0;

          sum = grid.getSummary('sumQr12', 'sum');
          sum2 = grid.getSummary('wellsAccount12', 'sum');

          return (sum / sum2) * 100;
        },
      } },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout([
    'grpNm',
    {
      header: t('MSG_TXT_JAN'),
      direction: 'horizontal',
      items: ['newQr01', 'sumQr01', 'wellsAccount01', 'accountRate01'],
    },
    {
      header: t('MSG_TXT_FEB'),
      direction: 'horizontal',
      items: ['newQr02', 'sumQr02', 'wellsAccount02', 'accountRate02'],
    },
    {
      header: t('MSG_TXT_MAR'),
      direction: 'horizontal',
      items: ['newQr03', 'sumQr03', 'wellsAccount03', 'accountRate03'],
    },
    {
      header: t('MSG_TXT_APRI'),
      direction: 'horizontal',
      items: ['newQr04', 'sumQr04', 'wellsAccount04', 'accountRate04'],
    },
    {
      header: t('MSG_TXT_MAY'),
      direction: 'horizontal',
      items: ['newQr05', 'sumQr05', 'wellsAccount05', 'accountRate05'],
    },
    {
      header: t('MSG_TXT_JUN'),
      direction: 'horizontal',
      items: ['newQr06', 'sumQr06', 'wellsAccount06', 'accountRate06'],
    },
    {
      header: t('MSG_TXT_JUL'),
      direction: 'horizontal',
      items: ['newQr07', 'sumQr07', 'wellsAccount07', 'accountRate07'],
    },
    {
      header: t('MSG_TXT_AUG'),
      direction: 'horizontal',
      items: ['newQr08', 'sumQr08', 'wellsAccount08', 'accountRate08'],
    },
    {
      header: t('MSG_TXT_SEPT'),
      direction: 'horizontal',
      items: ['newQr09', 'sumQr09', 'wellsAccount09', 'accountRate09'],
    },
    {
      header: t('MSG_TXT_OCT'),
      direction: 'horizontal',
      items: ['newQr10', 'sumQr10', 'wellsAccount10', 'accountRate10'],
    },
    {
      header: t('MSG_TXT_NOV'),
      direction: 'horizontal',
      items: ['newQr11', 'sumQr11', 'wellsAccount11', 'accountRate11'],
    },
    {
      header: t('MSG_TXT_DECE'),
      direction: 'horizontal',
      items: ['newQr12', 'sumQr12', 'wellsAccount12', 'accountRate12'],
    },
  ]);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  view.setOptions({ summaryMode: 'aggregate' });
  view.setFooters({ visible: true });
}
</script>

<style scoped>
</style>
