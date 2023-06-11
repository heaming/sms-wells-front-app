<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : WwsncCompanyInstallationStateSubMatM(회사설치(8888코드)현황 (부자재))
3. 작성자 : heymi.cho
4. 작성일 : 2023.05.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 회사설치 (8888코드) 현황 (부자재) (http://localhost:3000/#/service/wwsnc-as-charge-transfer-mgt)
****************************************************************************************************
--->
<template>
  <kw-search
    one-row
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- 관리년월 -->
      <kw-search-item
        :label="$t('MSG_TXT_MGT_YNM')"
        required
      >
        <kw-date-picker
          v-model="searchParams.mgtYnm"
          type="month"
          rules="required"
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
        <span class="ml8">(단위:원)</span>
      </template>
      <kw-btn
        icon="download_on"
        dense
        secondary
        label="엑셀다운로드"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="gridSubMatRef"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrid"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </div>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService, useMeta, codeUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

console.log(getComponentType('KwGrid'));
// const { t } = useI18n();
const now = dayjs();
const dataService = useDataService();
const { getConfig } = useMeta();
const gridSubMatRef = ref(getComponentType(`${this}.KwGrid`));
const { currentRoute } = useRouter();
let cachedParams;

/*
 *  Search Parameter
 */
const searchParams = ref({
  mgtYnm: now.format('YYYYMM'), // 관리년월
  mgtTyp: '', // 관리유형
  istDtFrom: `${now.format('YYYYMM')}01`,
  istDtTo: now.format('YYYYMMDD'),
});

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

/*
 *  공통코드 조회
 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 관리유형
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  const res = await dataService.get('', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: totalState, pageInfo: pagingResult } = res.data;
  pageInfo.value = gridSubMatRef.value.getView();

  pageInfo.value = pagingResult;

  const view = gridSubMatRef.value.getView();
  view.getDataSource().setRows(totalState);
  view.resetCurrent();
}

/*
 *  Search - 전체(tab1), 필터(tab2), 부자재(tab3) 조회
 */
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  const view = gridSubMatRef.value.getView();

  const response = await dataService.get('', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostFix: true,
    exportData: response.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'dept' },
    { fieldName: 'deptNm' },
    { fieldName: 'costCnr' },
    { fieldName: 'hdq' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
  ];

  const columns = [
    { fieldName: 'cntrNo', header: '계약번호', width: '160', styleName: 'text-center' },
    { fieldName: 'dept', header: '부서', width: '90', styleName: 'text-center' },
    { fieldName: 'deptNm', header: '부서명', width: '130', styleName: 'text-center' },
    { fieldName: 'costCnr', header: '코스트센터', width: '150', styleName: 'text-center' },
    { fieldName: 'hdq', header: '본부', width: '200' },
    { fieldName: 'col6', header: '고객명', width: '110', styleName: 'text-center' },
    { fieldName: 'col7', header: '관리유형', width: '130', styleName: 'text-center' },
    { fieldName: 'col8', header: '상품코드', width: '110', styleName: 'text-right' },
    { fieldName: 'col9', header: '상품명', width: '100', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
