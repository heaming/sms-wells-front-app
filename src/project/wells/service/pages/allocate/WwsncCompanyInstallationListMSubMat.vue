<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : WwsncCompanyInstallationListMSubMat(회사설치 현황 (부자재))
3. 작성자 : heymi.cho
4. 작성일 : 2023.05.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 회사설치 현황 (부자재) (http://localhost:3000/#/service/wwsnc-company-installation-state)
****************************************************************************************************
--->
<template>
  <kw-search
    one-row
    :cols="3"
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
          :rules="required"
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
        <span class="ml8">
          {{ t('MSG_TXT_UNIT_WON') }}
        </span>
      </template>
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageInfo.totalCount === 0"
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
import { getCodeNames } from '~/modules/sms-common/product/utils/pdUtil';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const now = dayjs();
const dataService = useDataService();
const { getConfig } = useMeta();
const gridSubMatRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;

/*
 *  Search Parameter
 */
const searchParams = ref({
  mgtYnm: now.format('YYYYMM'), // 관리년월
  itmKndCd: ['6', '7', '8'], // 품목코드
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
  'COD_PAGE_SIZE_OPTIONS',
  'ITM_KND_CD',
);

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/company-ist-state/sub-material/paging', { params: { ...cachedParams, ...pageInfo.value } });
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

  const response = await dataService.get('/sms/wells/service/company-ist-state/sub-material/excel-download', { params: cachedParams });

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
    { fieldName: 'itmKndCd' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'itmPdNm' },
    { fieldName: 'useQtySum' },
    { fieldName: 'pdctUprc' }, // 실제원가
    { fieldName: 'pdctUprcSum' },
    { fieldName: 'csmrUprcAmt' }, // 소비자가
    { fieldName: 'csmrUprcAmtSum' }, // 소비자가합계
  ];

  const columns = [
    { fieldName: 'itmKndCd',
      header: t('MSG_TXT_DIV'),
      width: '100',
      styleName: 'text-center',
      // eslint-disable-next-line max-len
      displayCallback: (grid, index) => getCodeNames(codes.ITM_KND_CD, grid.getValue(index.itemIndex, 'itmKndCd')),
    },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '130', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_ITM_NM'), width: '270', styleName: 'text-center' },
    { fieldName: 'useQtySum', header: t('MSG_TXT_QTY'), width: '90' },
    { fieldName: 'pdctUprc', header: t('MSG_TXT_ACTUAL_COST'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdctUprcSum', header: t('MSG_TXT_COST') + t('MSG_TXT_SUM_AMT'), width: '120', styleName: 'text-center' },
    { fieldName: 'csmrUprcAmt', header: t('MSG_TXT_CSPRC'), width: '120', styleName: 'text-center' },
    { fieldName: 'csmrUprcAmtSum', header: t('MSG_TXT_CSPRC') + t('MSG_TXT_SUM_AMT'), width: '140', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
