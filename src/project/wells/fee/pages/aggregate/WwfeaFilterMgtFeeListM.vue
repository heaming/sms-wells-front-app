<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FED
2. 프로그램 ID : WwfeaFilterMgtFeeListM - 필터관리수수료 현황
3. 작성자 : haejin.lee
4. 작성일 : 2023.03.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 필터관리수수료 현황
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 실적년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>

        <!-- 번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.param1"
            icon="search"
            clearable
            rules="numeric"
            :on-click-icon="onClickSearchNo"
          />
        </kw-search-item>

        <!-- 업무구분 -->
        <kw-search-item
          required
          :label="$t('MSG_TXT_TASK_DIV')"
          :colspan="2"
        >
          <kw-option-group
            v-model="searchParams.param2"
            :label="$t('MSG_TXT_TASK_DIV')"
            type="radio"
            :options="['집계', '수수료']"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount===0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="3"
        @init="initMainGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useGlobal, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { modal } = useGlobal();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);

const searchParams = ref({
  perfYm: dayjs().add(-1, 'month').format('YYYYMM'),
  param1: '',
  param2: '',

});

let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: '필터관리수수료 현황',
    timePostfix: true,
  });
}

async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.param1,
    },
  });

  if (result) {
    searchParams.value.param1 = payload.prtnrNo;
  }
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/filter-mgt-fees', { params: cachedParams });
  const leaderAllowances = res.data;

  totalCount.value = leaderAllowances.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(leaderAllowances);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initMainGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110', styleName: 'text-left' }, // 번호
    { fieldName: 'col2', header: t('MSG_TXT_EMPL_NM'), width: '110', styleName: 'text-left' }, // 성명
    { fieldName: 'col3', header: t('MSG_TXT_CFMNR_BLD'), width: '110', styleName: 'text-left' }, // 상주빌딩
    { fieldName: 'col4', header: t('MSG_TXT_BLG'), width: '110', styleName: 'text-center ' }, // 소속
    { fieldName: 'col5', header: t('MSG_TXT_RSB'), width: '110', styleName: 'text-left' }, // 직책
    { fieldName: 'col6', header: t('MSG_TXT_CNTR_DATE'), width: '110', styleName: 'text-left' }, // 계약일자
    { fieldName: 'col7', header: t('MSG_TIT_CLTN_DT'), width: '110', styleName: 'text-left' }, // 혜약일자
    { fieldName: 'col8', header: t('MSG_TXT_THM'), width: '110', styleName: 'text-center' }, // 당월
    { fieldName: 'col9', header: t('MSG_TXT_LSTMM'), width: '110', styleName: 'text-left' }, // 전월
    { fieldName: 'col10', header: t('MSG_TXT_THM'), width: '70', styleName: 'text-right' }, // 당월
    { fieldName: 'col11', header: t('MSG_TXT_LSTMM'), width: '70', styleName: 'text-right' }, // 전월
    { fieldName: 'col12', header: t('MSG_TXT_THM'), width: '70', styleName: 'text-right' }, // 당월
    { fieldName: 'col13', header: t('MSG_TXT_LSTMM'), width: '70', styleName: 'text-right' }, // 전월
    { fieldName: 'col14', header: t('MSG_TXT_THM'), width: '70', styleName: 'text-right' }, // 당월
    { fieldName: 'col15', header: t('MSG_TXT_LSTMM'), width: '70', styleName: 'text-right' }, // 전월
    { fieldName: 'col16', header: t('MSG_TXT_THM'), width: '70', styleName: 'text-right' }, // 당월
    { fieldName: 'col17', header: t('MSG_TXT_LSTMM'), width: '70', styleName: 'text-right' }, // 전월
    { fieldName: 'col18', header: t('MSG_TXT_THM'), width: '70', styleName: 'text-right' }, // 당월
    { fieldName: 'col19', header: t('MSG_TXT_LSTMM'), width: '70', styleName: 'text-right' }, // 전월
    { fieldName: 'col20', header: t('MSG_TXT_AGG'), width: '70', styleName: 'text-right' }, // 계
    { fieldName: 'col21', header: '전월', width: '70', styleName: 'text-right' }, // 자재실장수수료
  ];

  data.setFields(fields);
  view.setColumns(columns);

  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_MAT_HODT'), // 자재실장
      direction: 'horizontal', // merge type
      items: ['col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7'],
    },
    {
      header: t('MSG_TXT_WRFR'), // 정수기
      direction: 'horizontal',
      items: ['col8', 'col9'],
    },
    {
      header: t('MSG_TXT_MINI'), // 미니
      direction: 'horizontal',
      items: ['col10', 'col11'],
    },
    {
      header: t('MSG_TXT_BDT'), // 비데
      direction: 'horizontal',
      items: ['col12', 'col13'],
    },
    {
      header: t('MSG_TXT_PUF'), // 청정기
      direction: 'horizontal',
      items: ['col14', 'col15'],
    },
    {
      header: t('MSG_TXT_WTST'), // 연수기
      direction: 'horizontal',
      items: ['col16', 'col17'],
    },
    {
      header: t('MSG_TXT_VST') + t('MSG_TXT_AGG'), // 방문계
      direction: 'horizontal',
      items: ['col18', 'col19', 'col20'],
    },
    'col21',
  ]);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
