<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnbTotalAsRateQltyListM(K-W-SV-U-0248M01) - 총 A/S율 현황(품질)
3. 작성자 : jaehunlee
4. 작성일 : 2023.09.01
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- 업무유형별현황 (http://localhost:3000/#/service/wwsnb-total-as-rate-qlty-list)
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YEAR')"
        >
          <kw-date-picker
            v-model="searchParams.baseYear"
            type="year"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PD_MCLSF_ID') + '(' + $t('MSG_TXT_SV_TP') + ')'"
        >
          <kw-select
            v-model="searchParams.taskTypeCd"
            :options="customCodes.TASK_TYPE_CD"
            first-option="all"
            class="w150"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('TXT_MSG_PD_LCLSF_ID') + '(' + $t('MSG_TXT_BAD_DV') + ')'"
        >
          <kw-select
            v-model="searchParams.badDvCd"
            :options="codes.BAD_DV_CD"
            first-option="all"
            class="w150"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="customCodes.PD_GRP_CD"
            first-option="all"
            class="w150"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="products"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_CUR_WON') }}</span>
        </template>
        <kw-btn
          icon="print"
          dense
          secondary
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
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, getComponentType, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty, cloneDeep } from 'lodash-es';
import { printElement } from '~common/utils/common';

const now = dayjs();
const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const searchParams = ref({
  baseYear: now.format('YYYY'),
  taskTypeCd: '',
  badDvCd: '',
  pdGrpCd: '',
  pdCd: '',
});

const codes = await codeUtil.getMultiCodes(
  'BAD_DV_CD',
);

const customCodes = {
  TASK_TYPE_CD: [
    { codeId: '3110', codeName: '제품A/S' },
    { codeId: '3112', codeName: '특별A/S' },
    { codeId: '3210', codeName: '제품원인' },
  ],
  PD_GRP_CD: [
    { codeId: '4', codeName: '연수기' },
    { codeId: '5', codeName: '마사지기' },
    { codeId: '6', codeName: '음식물처리기' },
    { codeId: '7', codeName: '제습기' },
    { codeId: '8', codeName: '제빙기' },
    { codeId: '9', codeName: '아웃소싱' },
    { codeId: '11', codeName: '웰스팜모종' },
    { codeId: '91', codeName: '전기레인지' },
    { codeId: '92', codeName: '웰스팜' },
    { codeId: '93', codeName: '안마의자' },
    { codeId: '95', codeName: '매트리스' },
    { codeId: '96', codeName: '커피머신' },
  ],
};

const products = ref([]);
async function fetchProducts() {
  const res = await dataService.get('/sms/wells/service/service-processing/products', { params: { pdGrpCd: searchParams.value.pdGrpCd } });
  products.value = res.data;
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/total-as-rate-qlty', { params: { ...cachedParams } });
  const view = grdMainRef.value.getView();
  res.data[2].totalCnt = ((res.data[0].totalCnt / res.data[1].totalCnt) * 100).toFixed(2);
  res.data[2].col01 = ((res.data[0].col01 / res.data[1].col01) * 100).toFixed(2);
  res.data[2].col02 = ((res.data[0].col02 / res.data[1].col02) * 100).toFixed(2);
  res.data[2].col03 = ((res.data[0].col03 / res.data[1].col03) * 100).toFixed(2);
  res.data[2].col04 = ((res.data[0].col04 / res.data[1].col04) * 100).toFixed(2);
  res.data[2].col05 = ((res.data[0].col05 / res.data[1].col05) * 100).toFixed(2);
  res.data[2].col06 = ((res.data[0].col06 / res.data[1].col06) * 100).toFixed(2);
  res.data[2].col07 = ((res.data[0].col07 / res.data[1].col07) * 100).toFixed(2);
  res.data[2].col08 = ((res.data[0].col08 / res.data[1].col08) * 100).toFixed(2);
  res.data[2].col09 = ((res.data[0].col09 / res.data[1].col09) * 100).toFixed(2);
  res.data[2].col10 = ((res.data[0].col10 / res.data[1].col10) * 100).toFixed(2);
  res.data[2].col11 = ((res.data[0].col11 / res.data[1].col11) * 100).toFixed(2);
  res.data[2].col12 = ((res.data[0].col12 / res.data[1].col12) * 100).toFixed(2);
  view.getDataSource().setRows(res.data);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/total-as-rate-qlty', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

watch(() => searchParams.value.pdGrpCd, async (val) => {
  if (isEmpty(val)) {
    products.value = [];
    return;
  }
  await fetchProducts();
}, { immediate: true });

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'gbNm' },
    { fieldName: 'totalCnt', dataType: 'number' },
    { fieldName: 'col01', dataType: 'number' },
    { fieldName: 'col02', dataType: 'number' },
    { fieldName: 'col03', dataType: 'number' },
    { fieldName: 'col04', dataType: 'number' },
    { fieldName: 'col05', dataType: 'number' },
    { fieldName: 'col06', dataType: 'number' },
    { fieldName: 'col07', dataType: 'number' },
    { fieldName: 'col08', dataType: 'number' },
    { fieldName: 'col09', dataType: 'number' },
    { fieldName: 'col10', dataType: 'number' },
    { fieldName: 'col11', dataType: 'number' },
    { fieldName: 'col12', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'gbNm',
      header: t('MSG_TXT_DIV'),
      width: '100',
      footer: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-left',
      } },
    { fieldName: 'totalCnt',
      header: t('MSG_TXT_SUM'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'totalCnt')) + Number(prod.getValue(4, 'totalCnt'));
          return sum;
        },
      } },
    { fieldName: 'col01',
      header: t('MSG_TXT_JAN'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'col01')) + Number(prod.getValue(4, 'col01'));
          return sum;
        },
      } },
    { fieldName: 'col02',
      header: t('MSG_TXT_FEB'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'col01')) + Number(prod.getValue(4, 'col01'));
          return sum;
        },
      } },
    { fieldName: 'col03',
      header: t('MSG_TXT_MAR'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'col01')) + Number(prod.getValue(4, 'col01'));
          return sum;
        },
      } },
    { fieldName: 'col04',
      header: t('MSG_TXT_APRI'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'col01')) + Number(prod.getValue(4, 'col01'));
          return sum;
        },
      } },
    { fieldName: 'col05',
      header: t('MSG_TXT_MAY'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'col01')) + Number(prod.getValue(4, 'col01'));
          return sum;
        },
      } },
    { fieldName: 'col06',
      header: t('MSG_TXT_JUN'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'col01')) + Number(prod.getValue(4, 'col01'));
          return sum;
        },
      } },
    { fieldName: 'col07',
      header: t('MSG_TXT_JUL'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'col01')) + Number(prod.getValue(4, 'col01'));
          return sum;
        },
      } },
    { fieldName: 'col08',
      header: t('MSG_TXT_AUG'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'col01')) + Number(prod.getValue(4, 'col01'));
          return sum;
        },
      } },
    { fieldName: 'col09',
      header: t('MSG_TXT_SEPT'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'col01')) + Number(prod.getValue(4, 'col01'));
          return sum;
        },
      } },
    { fieldName: 'col10',
      header: t('MSG_TXT_OCT'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'col01')) + Number(prod.getValue(4, 'col01'));
          return sum;
        },
      } },
    { fieldName: 'col11',
      header: t('MSG_TXT_NOV'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'col01')) + Number(prod.getValue(4, 'col01'));
          return sum;
        },
      } },
    { fieldName: 'col12',
      header: t('MSG_TXT_DECE'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'col01')) + Number(prod.getValue(4, 'col01'));
          return sum;
        },
      } },
  ];

  const columnLayout = [
    'gbNm',
    'totalCnt',
    'col01',
    'col02',
    'col03',
    'col04',
    'col05',
    'col06',
    'col07',
    'col08',
    'col09',
    'col10',
    'col11',
    'col12',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.setFooters({ visible: true });
  view.rowIndicator.visible = true;
}

</script>
