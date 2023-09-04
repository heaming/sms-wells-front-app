<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : WwsncCompanyInstallationListMPs(회사설치 현황 (현황))
3. 작성자 : heymi.cho
4. 작성일 : 2023.05.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 회사설치 현황 (http://localhost:3000/#/service/wwsnc-company-ist-state)
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="2"
    one-row
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_MGT_TYP')"
      >
        <kw-select
          v-model="searchParams.mgtTyps"
          :options="codes.PRD_MNGT_TP_CD"
          multiple
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_IST_DT')"
      >
        <kw-date-range-picker
          v-model:from="searchParams.istDtFrom"
          v-model:to="searchParams.istDtTo"
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
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const now = dayjs();
const dataService = useDataService();
const { getConfig } = useMeta();
const gridPsRef = ref('KwGrid');
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
  mgtTyps: [], // 관리유형
  istDtFrom: `${now.format('YYYYMM')}01`,
  istDtTo: now.format('YYYYMMDD'),
});

/*
 *  공통코드 조회
 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
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

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/company-ist-state/state/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: totalState, pageInfo: pagingResult } = res.data;
  pageInfo.value = gridPsRef.value.getView();

  pageInfo.value = pagingResult;

  const view = gridPsRef.value.getView();
  view.getDataSource().setRows(totalState);
  view.resetCurrent();
}

/*
 *  Search - 조회
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

  const response = await dataService.get('/sms/wells/service/company-ist-state/state/excel-download', { params: cachedParams });

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
    { fieldName: 'cntrNoSn' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    // { fieldName: 'sapMatCd' },
    { fieldName: 'basePdCd' },
    { fieldName: 'basePdNm' },
    { fieldName: 'svcTpNm' },
    { fieldName: 'istDt' },
    { fieldName: 'useMcn' },
    { fieldName: 'frisuBfsvcPtrmN' },
    // { fieldName: 'nmClProCsStat' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'locaraTno' },
    { fieldName: 'exnoEncr' },
    { fieldName: 'idvTno' },
    { fieldName: 'rnadr' },
    { fieldName: 'rdadr' },
    { fieldName: 'homePhone' },
    { fieldName: 'mPno' },
    { fieldName: 'addr' },
    { fieldName: 'ogId' },
    { fieldName: 'ogNm' },
    { fieldName: 'hgrOgId' },
    { fieldName: 'hgrOgNm' },
  ];

  const columns = [
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '160',
      styleName: 'text-center',
      // eslint-disable-next-line max-len
      displayCallback: (grid, index) => (`${gridUtil.getCellValue(grid, index.dataRow, 'cntrNo')}-${gridUtil.getCellValue(grid, index.dataRow, 'cntrSn')}`),
    },
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
    // { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '120', styleName: 'text-center' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'basePdNm', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-center' },
    { fieldName: 'svcTpNm', header: t('MSG_TXT_SV_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '100' },
    { fieldName: 'useMcn', header: t('MSG_TXT_INST_MONTH_CNT'), width: '100', styleName: 'text-center' },
    { fieldName: 'frisuBfsvcPtrmN', header: t('MSG_TXT_FRISU_BFSVC_PTRM_N'), width: '130', styleName: 'text-center' },
    // { fieldName: 'nmClProCsStat', header: t('MSG_TXT_MM_CL_PROCS_STAT'), width: '110', styleName: 'text-center' },
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'cralLocaraTno', visible: false },
    { fieldName: 'mexnoEncr', visible: false },
    { fieldName: 'cralIdvTno', visible: false },
    { fieldName: 'locaraTno', visible: false },
    { fieldName: 'exnoEncr', visible: false },
    { fieldName: 'idvTno', visible: false },
    { fieldName: 'rnadr', visible: false },
    { fieldName: 'rdadr', visible: false },
    { fieldName: 'homePhone',
      header: t('MSG_TXT_HOME_PHONE'),
      width: '110',
      styleName: 'text-center',
      // eslint-disable-next-line max-len
      displayCallback: (grid, index) => (!isEmpty(gridUtil.getCellValue(grid, index.dataRow, 'locaraTno'))
        ? `${gridUtil.getCellValue(grid, index.dataRow, 'locaraTno')}-${gridUtil.getCellValue(grid, index.dataRow, 'exnoEncr')}-${gridUtil.getCellValue(grid, index.dataRow, 'idvTno')}`
        : ''),
    },
    { fieldName: 'mPno',
      header: t('MSG_TXT_MPNO'),
      width: '100',
      styleName: 'text-center',
      // eslint-disable-next-line max-len
      displayCallback: (grid, index) => (`${gridUtil.getCellValue(grid, index.dataRow, 'cralLocaraTno')}-${gridUtil.getCellValue(grid, index.dataRow, 'mexnoEncr')}-${gridUtil.getCellValue(grid, index.dataRow, 'cralIdvTno')}`),
    },
    { fieldName: 'addr',
      header: t('MSG_TXT_ADDR'),
      width: '130',
      styleName: 'text-center',
      // eslint-disable-next-line max-len
      displayCallback: (grid, index) => (`${gridUtil.getCellValue(grid, index.dataRow, 'rnadr')} ${gridUtil.getCellValue(grid, index.dataRow, 'rdadr')}`),
    },
    { fieldName: 'ogId', header: t('MSG_TXT_MGT_TEAM') + t('MSG_TXT_CODE'), width: '130', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_MGT_TEAM') + t('MSG_TXT_NM'), width: '110', styleName: 'text-center' },
    { fieldName: 'hgrOgId', header: t('MSG_TXT_HGR') + t('MSG_TXT_MGT_TEAM') + t('MSG_TXT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'hgrOgNm', header: t('MSG_TXT_HGR') + t('MSG_TXT_MGT_TEAM'), width: '110', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
