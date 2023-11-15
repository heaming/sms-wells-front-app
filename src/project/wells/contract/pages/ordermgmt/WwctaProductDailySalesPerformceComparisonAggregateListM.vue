<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaProductDailySalesPerformceComparisonAggregateM
3. 작성자 : gs.itsm211 / YS.JEON
4. 작성일 : 2023.11.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품별 일일 매출실적 비교 집계 조회
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 출력유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRNT_TYPE')"
        >
          <!-- ['전월포함', '멤버십 접수포함'] -->
          <kw-option-group
            v-model="searchParams.prntTp"
            type="radio"
            :options="[{ codeId: 'PL', codeName: t('MSG_TXT_LSTMM_INC') },
                       { codeId: 'PM', codeName: t('MSG_TXT_MSH_APPL_INC') }]"
          />
        </kw-search-item>

        <!-- 실적기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_PRD')"
          :colspan="2"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.perfStrtDt"
            v-model:to="searchParams.perfEndDt"
            :label="$t('MSG_TXT_PERF_PRD')"
            rules="date_range_required"
            @change="onChangePerfDt"
          />
        </kw-search-item>
        <!-- 판매구분 -->
        <kw-search-item :label="$t('MSG_TXT_SLS_CAT')">
          <kw-select
            v-model="searchParams.sellOgTpCd"
            :options="codes.OG_TP_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!--출력구분-->
        <kw-search-item
          :label="$t('MSG_TXT_PRNT_DV')"
          :colspan="2"
        >
          <!-- ['상품', '상품군'] -->
          <kw-option-group
            v-model="searchParams.prntDv"
            type="radio"
            :options="[{ codeId: 'PC', codeName: t('MSG_TXT_PRDT') },
                       { codeId: 'PG', codeName: t('MSG_TXT_PDGRP') }]"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>

        <kw-btn
          v-permission:download
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          icon="download_on"
          dense
          secondary
          :disable="!pageInfo.totalCount"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        :visible-rows="6"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, useDataService, gridUtil, useMeta /* , notify */ } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const now = dayjs();
const searchParams = ref({
  prntTp: 'PL', // 출력유형 (default : 전월포함)
  perfStrtDt: now.startOf('month').format('YYYYMMDD'), // 실적기간-시작일자
  perfEndDt: now.format('YYYYMMDD'), // 실적기간-종료일자
  sellOgTpCd: '', // 판매구분=조직구분
  prntDv: 'PC', // 출력구분 (default : 상품)
});

const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

codes.OPTN_DV = [
  { codeId: 'O', codeName: t('MSG_TXT_OPTN') },
  { codeId: 'N', codeName: t('MSG_TXT_NOPR') },
];
codes.OG_CP_CD = [
  { codeId: 'W01', codeName: `P${t('MSG_TXT_OG')}` },
  { codeId: 'W02', codeName: `M${t('MSG_TXT_OG')}` },
];

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  if (isEmpty(cachedParams)) return;

  const res = await dataService.get('/sms/wells/contract/contracts/product-daily-sales-performce-comparison-aggregate/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();
  dataSource.checkRowStates(false);
  dataSource.addRows(pages);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/product-daily-sales-performce-comparison-aggregate/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
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
  ];

  const columns = [
    { fieldName: 'col1', header: '상품코드', width: '130', styleName: 'text-center' },
    { fieldName: 'col2', header: '상품명', width: '235', styleName: 'text-left' },
    { fieldName: 'col3', header: '판매유형', width: '130', styleName: 'text-center' },
    { fieldName: 'col4', header: '이월', width: '130', styleName: 'text-right' },
    { fieldName: 'col5', header: '매출', width: '130', styleName: 'text-right' },
    { fieldName: 'col6', header: '취소', width: '130', styleName: 'text-right' },
    { fieldName: 'col7', header: '만료', width: '130', styleName: 'text-right' },
    { fieldName: 'col8', header: '합계', width: '130', styleName: 'text-right' },
    { fieldName: 'col9', header: '순종', width: '130', styleName: 'text-right' },

    { fieldName: 'col10', header: '전월대비 순종증감', width: '178', styleName: 'text-right' },
    { fieldName: 'col11', header: '접수', width: '130', styleName: 'text-right' },
    { fieldName: 'col12', header: '기변', width: '130', styleName: 'text-right' },
    { fieldName: 'col13', header: '이월', width: '130', styleName: 'text-right' },
    { fieldName: 'col14', header: '매출', width: '130', styleName: 'text-right' },
    { fieldName: 'col15', header: '취소', width: '130', styleName: 'text-right' },
    { fieldName: 'col16', header: '만료', width: '130', styleName: 'text-right' },
    { fieldName: 'col17', header: '합계', width: '130', styleName: 'text-right' },
    { fieldName: 'col18', header: '순종', width: '130', styleName: 'text-right' },

    { fieldName: 'col19', header: '기변', width: '130', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.checkBar.visible = false;

  // multi row header setting
  view.setColumnLayout([
    {
      header: '구분',
      direction: 'horizontal',
      items: ['col1', 'col2', 'col3'],
    },
    {
      header: '당월',
      direction: 'horizontal',
      items: ['col4', 'col5', 'col6', 'col7', 'col8', 'col9', 'col10', 'col11', 'col12'],
    },
    {
      header: '전월',
      direction: 'horizontal',
      items: ['col13', 'col14', 'col15', 'col16', 'col17', 'col18', 'col19'],
    },

  ]);

  data.setRows([
    { col1: '4133', col2: '식기세척기', col3: '렌탈', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '-20', col10: '100', col11: '15', col12: '0', col13: '0', col14: '0', col15: '0', col16: '0', col17: '0', col18: '-20', col19: '0' },
    { col1: '4133', col2: '식기세척기', col3: '렌탈', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '-20', col10: '100', col11: '15', col12: '0', col13: '0', col14: '0', col15: '0', col16: '0', col17: '0', col18: '-20', col19: '0' },
    { col1: '4133', col2: '식기세척기', col3: '렌탈', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '-20', col10: '100', col11: '15', col12: '0', col13: '0', col14: '0', col15: '0', col16: '0', col17: '0', col18: '-20', col19: '0' },
    { col1: '4133', col2: '식기세척기', col3: '렌탈', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '-20', col10: '100', col11: '15', col12: '0', col13: '0', col14: '0', col15: '0', col16: '0', col17: '0', col18: '-20', col19: '0' },
    { col1: '4133', col2: '식기세척기', col3: '렌탈', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '-20', col10: '100', col11: '15', col12: '0', col13: '0', col14: '0', col15: '0', col16: '0', col17: '0', col18: '-20', col19: '0' },
    { col1: '4133', col2: '식기세척기', col3: '렌탈', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '-20', col10: '100', col11: '15', col12: '0', col13: '0', col14: '0', col15: '0', col16: '0', col17: '0', col18: '-20', col19: '0' },
  ]);
});

</script>

<style scoped>
</style>
