<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCA
2. 프로그램 ID : WwdcaMembershipCheckMBefore - 멤버십 확정 체크리스트 - 체크리스트(전)
3. 작성자 : Kicheol Choi
4. 작성일 : 2023.04.03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 멤버십 확정 체크리스트(전)
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
        :label="$t('MSG_TXT_LOOKUP_PERIOD')"
      >
        <kw-date-picker
          v-model="searchParams.searchPeriod"
          type="month"
          readonly
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
          v-model:total-count="pageInfo.totalCount"
          v-model:page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="fetchData"
        />
      </template>

      <kw-btn
        v-permission:download
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
      :visible-rows="10"
      @init="initGrid"
    />

    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      v-model:total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, codeUtil, useDataService, /* useGlobal, */ useMeta, gridUtil, getComponentType } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const dataService = useDataService();

const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { getters } = useStore();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const now = dayjs();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const { departmentId: ogId } = getters['meta/getUserInfo'];

let cachedParams;

// TODO: 부서코드 확정되면 부서별 조회구분 적용 필요

const searchParams = ref({
  searchPeriod: now.format('YYYYMM'),
  deptCd: ogId,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/closing/membership-check-before/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(pages);
  view.resetCurrent();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/closing/membership-check-before/excel-download', { params: cachedParams });
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_ORD_NO'), width: '146', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_CHECK_DV_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_CHECK_DV_NM'), width: '300', styleName: 'text-left' },
    { fieldName: 'col4', header: t('MSG_TXT_CNTR_DATE'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col5', header: t('MSG_TXT_IST_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col6', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col7', header: t('MSG_TXT_END_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col8', header: t('MSG_TXT_DEM_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col9', header: t('MSG_TXT_RENT_PRD_MN'), width: '100', styleName: 'text-right' },
    { fieldName: 'col10', header: `${t('MSG_TXT_DIV')}02`, width: '100', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_NOTE'), width: '120', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
