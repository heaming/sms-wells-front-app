<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnbTaskTypeListM(K-W-SV-U-0075M01) - 업무유형별현황
3. 작성자 : jaehunlee
4. 작성일 : 2023.08.09
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- 업무유형별현황 (http://localhost:3000/#/service/wwsnb-as-procs-agrg-list)
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.taskType"
            :options="customCodes.TASK_TYPE_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_BASE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.inqrBase"
            :options="customCodes.INQR_BASE_CD"
            rules="required"
            class="w100"
          />
          <kw-date-range-picker
            v-model:from="searchParams.baseDateFrom"
            v-model:to="searchParams.baseDateTo"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_WK_STS')"
        >
          <kw-select
            v-model="searchParams.wkSts"
            :options="customCodes.WK_STS_CD"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_IST_BASE')"
        >
          <kw-select
            v-model="searchParams.istBase"
            :options="customCodes.IST_BASE_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item label="사용여부">
          <kw-select
            v-model="searchParams.useYn"
            :options="codes.USE_YN"
            first-option="all"
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
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, useDataService, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import { printElement } from '~common/utils/common';

const now = dayjs();
const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const customCodes = {
  TASK_TYPE_CD: [
    { codeId: '1', codeName: '설치(필터판매 제외)' },
    { codeId: '2', codeName: '제품교체(제품+고객)' },
    { codeId: '3', codeName: 'AS(제품교체 건 제외)' },
    { codeId: '4', codeName: 'BS' },
  ],
  INQR_BASE_CD: [
    { codeId: '1', codeName: '접수일자' },
    { codeId: '2', codeName: '처리일자' },
    { codeId: '3', codeName: '방문확정일자' },
  ],
  WK_STS_CD: [
    { codeId: '00', codeName: '작업대기' },
    { codeId: '10', codeName: '진행중' },
    { codeId: '20', codeName: '작업완료' },
  ],
  IST_BASE_CD: [
    { codeId: '1', codeName: '1년이내' },
    { codeId: '2', codeName: '1년이후' },
  ],
};

const codes = await codeUtil.getMultiCodes(
  'USE_YN',
);

const searchParams = ref({
  taskType: '',
  inqrBase: '1',
  baseDateFrom: now.format('YYYYMMDD'),
  baseDateTo: now.format('YYYYMMDD'),
  wkSts: '00',
  istBase: '',
  useYn: '',
});

let cachedParams;

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/task-type-item', { params: { ...cachedParams } });
  const view = grdMainRef.value.getView();
  console.log(res.data);
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/task-type-item', { params: { ...cachedParams } });

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
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'saleCd' },
    { fieldName: 'qty100002', dataType: 'number' },
    { fieldName: 'qty200000', dataType: 'number' },
    { fieldName: 'qty299999', dataType: 'number' },
    { fieldName: 'qty999999', dataType: 'number' },
    { fieldName: 'assignPerQty', dataType: 'number' },
    { fieldName: 'totalCount', dataType: 'number' },
    { fieldName: 's71350', dataType: 'number' },
    { fieldName: 's71352', dataType: 'number' },
    { fieldName: 's71355', dataType: 'number' },
    { fieldName: 's71356', dataType: 'number' },
    { fieldName: 's71357', dataType: 'number' },
    { fieldName: 's71360', dataType: 'number' },
    { fieldName: 's71361', dataType: 'number' },
    { fieldName: 's71363', dataType: 'number' },
    { fieldName: 's71364', dataType: 'number' },
    { fieldName: 's71365', dataType: 'number' },
    { fieldName: 's71367', dataType: 'number' },
    { fieldName: 's71359', dataType: 'number' },
    { fieldName: 's71366', dataType: 'number' },
    { fieldName: 's71387', dataType: 'number' },
    { fieldName: 's71784', dataType: 'number' },
    { fieldName: 's71917', dataType: 'number' },
    { fieldName: 's71918', dataType: 'number' },
    { fieldName: 's71919', dataType: 'number' },
    { fieldName: 's71937', dataType: 'number' },
    { fieldName: 's99020', dataType: 'number' },
    { fieldName: 's99010', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '180', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdNm',
      header: t('MSG_TXT_ITM_NM'),
      width: '200',
      styleName: 'text-left',
      footer: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-left',
      } },
    { fieldName: 'saleCd', header: t('MSG_TXT_SELL_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'qty100002',
      header: t('MSG_TXT_PAJU_LGST'),
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'qty200000',
      header: t('MSG_TXT_SV_CNR'),
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'qty299999',
      header: t('MSG_TXT_EGER'),
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'qty999999',
      header: t('MSG_TXT_AGG'),
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'assignPerQty',
      header: '재고比배정',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'totalCount',
      header: t('MSG_TXT_SUM'),
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71350',
      header: '의정부',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71352',
      header: '일산',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71355',
      header: '인천',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71356',
      header: '화성',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71357',
      header: '부산',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71360',
      header: '청주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71361',
      header: '대구',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71363',
      header: '광주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71364',
      header: '전주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71365',
      header: '제주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71367',
      header: '하남',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71359',
      header: '원주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71366',
      header: '김해',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71387',
      header: '포항',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71784',
      header: '광양',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71917',
      header: '아산',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71918',
      header: '목포',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71919',
      header: '강릉',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's71937',
      header: '칠곡',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's99020',
      header: '성우메디텍',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 's99010',
      header: 'BMB',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setFixedOptions({ colCount: 4 });
  view.setOptions({ summaryMode: 'aggregate' });
  view.setFooters({ visible: true });

  // multi row header setting
  view.setColumnLayout([
    'sapMatCd', 'pdCd', 'pdNm', 'saleCd', // single
    {
      header: t('MSG_TXT_STOC_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['qty100002', 'qty200000', 'qty299999', 'qty999999', 'assignPerQty'],
    },
    {
      header: t('MSG_TXT_SV_CNR'), // colspan title
      direction: 'horizontal', // merge type
      items: ['totalCount', 's71350', 's71352', 's71355', 's71356', 's71357', 's71360', 's71361', 's71363', 's71364', 's71365', 's71367', 's71359', 's71366', 's71387', 's71784', 's71917', 's71918', 's71919', 's71937', 's99020', 's99010'],
    },

  ]);
}
</script>
<style scoped>
</style>
