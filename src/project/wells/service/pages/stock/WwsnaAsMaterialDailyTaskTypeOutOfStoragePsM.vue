<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaAsMaterialDailyTaskTypeOutOfStoragePsM - AS자재 일일 업무유형별출고현황
3. 작성자 : jungheejin
4. 작성일 : 2023-10-13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- AS자재 일일 업무유형별출고현황 (http://localhost:3000/#/service/wwsna-as-material-daily-task-type-out-storage-ps)
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_BASE_YM')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, getComponentType, defineGrid, gridUtil, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { currentRoute } = useRouter();
const { t } = useI18n();
const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/as-material-daily-task-type-out-of-storage-ps';
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  baseYm: now.format('YYYYMM'),
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

let cachedParams;
let gridView;
let gridData;
let fieldsObj;

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: result, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  fieldsObj.setFields(result);
  await nextTick();
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(result);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

fieldsObj = {

  // 그리드 공통컬럼
  defaultFields: [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '124', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '146', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_ITM_NM'), width: '500', styleName: 'text-left' },
  ],

  // 필드 세팅
  setFields(result) {
    const columns = [...fieldsObj.defaultFields];

    // 검색시 (일자별)조회된 데이터가 0 보다 큰 경우 데이터 추출
    const existDays = [];
    result.forEach((data) => {
      Object.keys(data).forEach((keys) => {
        if (keys.match(/day/gi)) {
          if (data[keys] > 0) {
            existDays.push(keys);
          }
        }
      });
    });

    // 검색월 기준의 마지막일자까지 그리드 표시
    const { baseYm } = searchParams.value;
    const lastDay = new Date(baseYm.substring(0, 4), baseYm.substring(4, 6), 0).getDate();
    const columnDailyTotals = [];
    for (let cnt = 1; cnt <= lastDay; cnt += 1) {
      columnDailyTotals.push(
        {
          fieldName: `day${cnt}`,
          header: `${cnt}${t('MSG_TXT_D')}`,
          width: 80,
          styleName: existDays.indexOf(`day${String(cnt)}`) > -1 ? 'text-right text-blue' : 'text-right', // 존재하는 데이터만 색상표시
          dataType: 'number',
          numberFormat: '#,###',
        },
      );
    }
    columns.push(...columnDailyTotals);
    const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

    gridData.setFields(fields);
    gridView.setColumns(columns);
    gridView.setFixedOptions({ colCount: 3, resizable: true });
  },
  // 리스트에 담겨진 항목중 {fieldName : "" }  만  가져옴
  getColumnNameList(objList) {
    return objList.map((obj) => ({ fieldName: obj.fieldName }));
  },
  // 리스트에 담겨진 항목 중 fieldName 배열로 가져옴
  getColumnNameArr(objList) {
    return objList.map((v) => v.fieldName);
  },

};

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    ...fieldsObj.getColumnNameList(fieldsObj.defaultFields),
  ];

  const columns = [
    ...fieldsObj.defaultFields,
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  gridView = view;
  gridData = data;
});

</script>
