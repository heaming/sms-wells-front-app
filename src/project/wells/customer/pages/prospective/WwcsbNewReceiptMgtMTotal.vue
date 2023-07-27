<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 고객 - 가망고객관리(CSB)
2. 프로그램 ID : WwcsbNewReceiptMgtMTotal.vue - 신규접수 배정관리 - 집계(TAB) (W-CU-U-0030M03)
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객 >> 가망고객 >> 신규접수 배정관리 - 집계(TAB) 프로그램
****************************************************************************************************
--->
<template>
  <kw-search
    one-row
    :modified-targets="['grdTotal']"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TIT_RECPETN_DT',null,'접수일')"
        required
      >
        <kw-date-range-picker
          v-model:from="searchParams.recvDtFrom"
          v-model:to="searchParams.recvDtTo"
          class="ml8"
          :label="$t('MSG_TIT_RECPETN_DT',null,'접수일')"
          rules="date_range_required"
        />
      </kw-search-item>
      <kw-search-item :label="t('MSG_TXT_PRDT_GUBUN',null,'상품구분')">
        <kw-select
          v-model="searchParams.prdtType"
          :multiple="true"
          :options="PRDT_TYPE_CODE"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area">
    <kw-action-top>
      <template #left />
      <kw-btn
        v-permission:download
        icon="download_on"
        dense
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="totalRowCnt === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdTotalRef"
      name="grdTotal"
      :need-context-menu="false"
      total-count="100"
      @init="initgrdTotal"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, defineGrid, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const grdTotalRef = ref(getComponentType('KwGrid'));
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/customer/receipts';

const PRDT_TYPE_CODE = [
  { codeId: '4', codeName: t('MSG_TXT_ENV_ELEC_1') }, /* 환경가전1 */
  { codeId: '5', codeName: t('MSG_TXT_ENV_ELEC_2') }, /* 환경가전2 */
  { codeId: '6', codeName: t('MSG_TXT_BEAN') }, /* 원두 */
  { codeId: '8', codeName: t('MSG_TXT_HOME_CARE') }, /* 홈케어 */
  { codeId: '7', codeName: t('MSG_TXT_SDING') }, /* 모종 */
  /* 배송 TODO DB에 코드없음. */
  // { codeId: '06', codeName: t('MSG_TXT_DLVRY') },
];

const totalRowCnt = ref(0);
const calculateSum1 = ref(0);
const calculateSum2 = ref(0);

let cachedParams;
const searchParams = ref({
  recvDtFrom: dayjs().set('date', 1).format('YYYYMMDD'), /* 접수기간 -Start */
  recvDtTo: dayjs().format('YYYYMMDD'), /* 접수기간 -End */
  prdtType: [], // 상품구분
  isAllPrdt: true,
});

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/summary`, { params: { ...cachedParams } });
  const summaryList = res.data;
  totalRowCnt.value = summaryList.length;
  const mainView = grdTotalRef.value.getView();
  mainView.getDataSource().setRows(summaryList);

  calculateSum1.value = summaryList.reduce((total, v) => total + v.recvCount, 0);
  calculateSum2.value = summaryList.reduce((total, v) => total + v.cntrCount, 0);
  console.log('calculateSum', calculateSum1.value, calculateSum2.value);
}

async function onClickSearch() {
  searchParams.value.isAllPrdt = searchParams.value.prdtType.length === 0
    || PRDT_TYPE_CODE.length === searchParams.value.prdtType.length;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdTotalRef.value.getView();
  const res = await dataService.get(`${baseUrl}/summary`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TIT_RCPT_ASN_MGT')} ${t('MSG_TXT_AGRG')}`,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => { });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initgrdTotal = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'inrtPdDvNm',
      header: t('MSG_TXT_PRDT_GUBUN', null, '상품구분'),
      width: '130',
      styleName: 'text-left',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    },
    { fieldName: 'recvCount',
      header: t('MSG_TXT_RCP', null, '접수'),
      width: '130',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        valueCallback() {
          return calculateSum1.value;
        },
      },
    },
    { fieldName: 'cntrCount',
      header: t('MSG_TXT_CONTRACT_CONCLUSION', null, '계약체결'),
      width: '130',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        valueCallback() {
          return calculateSum2.value;
        },
      },
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;
  view.checkBar.visible = false;
  view.headerSummaries.visible = true;
});
</script>
