<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNB
 2. 프로그램 ID : WwsnbSeedingPackageQtyPsM - 모종패키지 수량 현황
 3. 작성자 : heymi.cho
 4. 작성일 : 2023.07.17
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 모종패키지 수량 현황
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDate"
            v-model:to="searchParams.endDate"
            rules="date_range_months:1"
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
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
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

import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { currentRoute } = useRouter();
const { t } = useI18n();
const dataService = useDataService();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SV_CNR_CD',
  'RTNGD_PROCS_TP_CD',
);

const searchParams = ref({
  startDate: now.format('YYYYMMDD'),
  endDate: now.format('YYYYMMDD'),
});

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/seeding-package-qty/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  view.resetCurrent();

  console.log(cachedParams);
  await gridUtil.reset(view);
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
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/service/seeding-package-qty/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sdingPkgGrpCdNm', header: t('MSG_TXT_PKG_NM'), width: '130' },
    { fieldName: 'sdingPkgGrpCd', header: t('MSG_TXT_PKG_CD'), width: '110', styleName: 'text-center' },
    { fieldName: 'vstDt', header: t('MSG_TXT_VST_DT'), width: '130', styleName: 'text-center' },
    { fieldName: 'useQty', header: t('MSG_TXT_USE') + t('MSG_TXT_QTY'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'installUpload', header: `${t('MSG_TXT_INSTALLATION')} ${t('MSG_BTN_UPLOAD')}${t('MSG_TXT_QTY')}`, width: '140', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'bsUpload', header: `${t('MSG_TXT_BS')} ${t('MSG_BTN_UPLOAD')}${t('MSG_TXT_QTY')}`, width: '140', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'asUpload', header: `${t('MSG_TXT_AS')} ${t('MSG_BTN_UPLOAD')}${t('MSG_TXT_QTY')}`, width: '140', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'totalUpload', header: `${t('MSG_TXT_COM_TOT')} ${t('MSG_BTN_UPLOAD')}${t('MSG_TXT_QTY')}`, width: '140', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'expInstall', header: `${t('MSG_TXT_INSTALLATION')} ${t('MSG_TXT_USE')}${t('MSG_TXT_EXP')}`, width: '140', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'expAs', header: `${t('MSG_TXT_AS')} ${t('MSG_TXT_USE')}${t('MSG_TXT_EXP')}`, width: '140', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'expBs', header: `${t('MSG_TXT_BS')} ${t('MSG_TXT_USE')}${t('MSG_TXT_EXP')}`, width: '140', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'installCnt', header: `${t('MSG_TXT_INSTALLATION')} ${t('MSG_TXT_COUNT')}`, width: '140', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'asCnt', header: `${t('MSG_TXT_AS')} ${t('MSG_TXT_COUNT')}`, width: '140', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'bsCnt', header: `${t('MSG_TXT_BS')} ${t('MSG_TXT_COUNT')}`, width: '140', styleName: 'text-right', dataType: 'number' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

</script>
<style scoped>
</style>
