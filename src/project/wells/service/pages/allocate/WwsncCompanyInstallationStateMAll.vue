<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : WwsncCompanyInstallationStateAllM(회사설치(8888코드)현황(전체))
3. 작성자 : heymi.cho
4. 작성일 : 2023.05.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 회사설치 (8888코드) 현황 (전체) (http://localhost:3000/#/service/wwsnc-company-installation-state)
****************************************************************************************************
--->

<template>
  <kw-search
    :cols="2"
    one-row
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
      ref="gridAllRef"
      name="grid_all"
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

// const { t } = useI18n();
const now = dayjs();
const dataService = useDataService();
const { getConfig } = useMeta();
const gridAllRef = ref(getComponentType('KwGrid'));
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
 * 공통 코드
 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'COPN_DV_CD',
  'REFRI',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/company-ist-state/all/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: allState, pageInfo: pagingResult } = res.data;
  pageInfo.value = gridAllRef.value.getView();

  pageInfo.value = pagingResult;

  const view = gridAllRef.value.getView();
  view.getDataSource().setRows(allState);
  view.resetCurrent();
  await gridUtil.reset(view);
}

/*
 *  Search - 전체(tab1), 필터(tab2), 부자재(tab3) 조회
 */
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  console.log(searchParams.value);

  console.log(pageInfo.value);

  await fetchData();
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  const view = gridAllRef.value.getView();

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
    { fieldName: 'deptCd' },
    { fieldName: 'deptNm1' },
    { fieldName: 'csnrCd' },
    // { fieldName: 'hdq' },
    { fieldName: 'custNm' },
    { fieldName: 'copnDvCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'svBizMclsfCd' },
    { fieldName: 'svBizDclsfCd' },
    { fieldName: 'svBizDclsfNm' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'partPdCd' },
    { fieldName: 'partPdNm' },
    { fieldName: 'useQty' },
    { fieldName: 'pdctUprc' },
    { fieldName: 'pdctUprcSum' },
    { fieldName: 'csmrUprcAmt' },
    { fieldName: 'csmrUprcAmtSum' },
    { fieldName: 'refriDvCd' },
    { fieldName: 'wrkPrtnrClsfCd' },
    { fieldName: 'wrkPrtnrNo' },
    { fieldName: 'wrkPrtnrKnm' },
    { fieldName: 'wrkOgNm' },
    { fieldName: 'cstAdr' },
  ];

  const columns = [
    { fieldName: 'cntrNo', header: '계약번호', width: '160', styleName: 'text-center' },
    { fieldName: 'deptCd', header: '부서', width: '90', styleName: 'text-center' },
    { fieldName: 'deptNm1', header: '부서명', width: '130', styleName: 'text-center' },
    { fieldName: 'csnrCd', header: '코스트센터', width: '150', styleName: 'text-center' },
    // { fieldName: 'hdq', header: '본부', width: '200' },
    { fieldName: 'custNm', header: '고객명', width: '110', styleName: 'text-center' },
    { fieldName: 'copnDvCd', header: '관리유형', width: '130', styleName: 'text-center' },
    { fieldName: 'pdCd', header: '상품코드', width: '110', styleName: 'text-right' },
    { fieldName: 'pdNm', header: '상품명', width: '100', styleName: 'text-right' },
    { fieldName: 'svBizMclsfCd', header: '작업유형', width: '110', styleName: 'text-center' },
    { fieldName: 'svBizDclsfCd', header: '작업유형상세', width: '100', styleName: 'text-center' },
    { fieldName: 'svBizDclsfNm', header: '작업유형명', width: '105', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: 'SAP코드', width: '130', styleName: 'text-center' },
    { fieldName: 'partPdCd', header: '품목코드', width: '110', styleName: 'text-right' },
    { fieldName: 'partPdNm', header: '부품명', width: '100', styleName: 'text-right' },
    { fieldName: 'useQty', header: '사용수량', width: '110', styleName: 'text-center' },
    { fieldName: 'pdctUprc', header: '실제원가(원)', width: '100', styleName: 'text-center' },
    { fieldName: 'pdctUprcSum', header: '원가합계금액', width: '105', styleName: 'text-center' },
    { fieldName: 'csmrUprcAmt', header: '소비자가(원)', width: '105', styleName: 'text-center' },
    { fieldName: 'csmrUprcAmtSum', header: '소비자가\n합계금액', width: '130', styleName: 'text-center' },
    { fieldName: 'refriDvCd', header: '유무상', width: '100', styleName: 'text-right' },
    { fieldName: 'wrkPrtnrClsfCd', header: '작업자 구분', width: '110', styleName: 'text-center' },
    { fieldName: 'wrkPrtnrNo', header: '작업자 사번', width: '100', styleName: 'text-center' },
    { fieldName: 'wrkPrtnrKnm', header: '작업자 성명', width: '105', styleName: 'text-center' },
    { fieldName: 'wrkOgNm', header: '작업자 소속', width: '100', styleName: 'text-center' },
    { fieldName: 'cstAdr', header: '고객 주소 상세', width: '105', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
