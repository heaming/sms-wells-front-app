<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : WwsncCompanyInstallationStateM(회사설치(8888코드)현황)
3. 작성자 : heymi.cho
4. 작성일 : 2023.05.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 회사설치 (8888코드) 현황 (http://localhost:3000/#/service/wwsnc-as-charge-transfer-mgt)
****************************************************************************************************
--->
<template>
  <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
  <kw-search
    :cols="3"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        label="관리년월"
      >
        <kw-date-picker
          type="month"
        />
      </kw-search-item>
      <kw-search-item label="관리유형">
        <kw-select
          v-model="searchParams.mgtTyp"
          :options="codes.PRD_MNGT_TP_CD"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item label="설치일자">
        <kw-date-range-picker
          v-model:from="searchParams.istDtFrom"
          v-model:to="searchParams.istDtTo"
          rules="date_range_months:1"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="156" />
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
      ref="gridPsRef"
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
import { codeUtil, defineGrid, gridUtil, useDataService, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

// const { t } = useI18n();
const now = dayjs();
const dataService = useDataService();
const { getConfig } = useMeta();
const gridPsRef = ref(`${this}.KwGrid`);
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
 *  공통코드 조회
 */
const codes = await codeUtil.getMultiCodes(
  'PRD_MNGT_TP_CD', // 관리유형
);

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  const res = await dataService.get('', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: totalState, pageInfo: pagingResult } = res.data;
  pageInfo.value = gridPsRef.value.getView();

  pageInfo.value = pagingResult;

  const view = gridPsRef.value.getView();
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
  const view = gridPsRef.value.getView();

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
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
  ];

  const columns = [
    { fieldName: 'cntrNo', header: '계약번호', width: '160', styleName: 'text-center' },
    { fieldName: 'dept', header: '고객명', width: '90', styleName: 'text-center' },
    { fieldName: 'deptNm', header: 'SAP코드', width: '130', styleName: 'text-center' },
    { fieldName: 'costCnr', header: '품목코드', width: '150', styleName: 'text-center' },
    { fieldName: 'hdq', header: '상품명', width: '200' },
    { fieldName: 'col6', header: '서비스유형', width: '110', styleName: 'text-center' },
    { fieldName: 'col7', header: '설치일자', width: '130', styleName: 'text-center' },
    { fieldName: 'col8', header: '설치개월수', width: '110', styleName: 'text-right' },
    { fieldName: 'col9', header: '무상BS', width: '100', styleName: 'text-right' },
    { fieldName: 'col10', header: 'BS처리상태', width: '110', styleName: 'text-center' },
    { fieldName: 'col11', header: '우편번호', width: '100', styleName: 'text-center' },
    { fieldName: 'col12', header: '집전화번호', width: '105', styleName: 'text-center' },
    { fieldName: 'col13', header: '휴대전화번호', width: '130', styleName: 'text-center' },
    { fieldName: 'col14', header: '주소', width: '110', styleName: 'text-right' },
    { fieldName: 'col15', header: '관리팀코드', width: '100', styleName: 'text-right' },
    { fieldName: 'col16', header: '관리팀명', width: '110', styleName: 'text-center' },
    { fieldName: 'col17', header: '상위관리팀', width: '100', styleName: 'text-center' },
    { fieldName: 'col18', header: '상위관리팀명', width: '105', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
