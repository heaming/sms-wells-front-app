<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcPlannerLicenseListM - 플래너 자격 관리
3. 작성자 : 한용희
4. 작성일 : 2023-03-08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 플래너 자격 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
      @search="onclickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            v-model="searchParams.ogTpCd"
            :label="t('MSG_TXT_OG_TP')"
            :options="codes.SELL_OG_DV_ACD"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_SEQUENCE_NUMBER')">
          <kw-input
            v-model="searchParams.prntrNo"
            clearable
            icon="search"
          />
          <kw-input />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          v-model="searchParams.prntrKnm"
          :label="t('MSG_TXT_EMPL_NM')"
        >
          <kw-input />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_QLF')">
          <kw-select
            v-model="searchParams.olfDvCd"
            :options="codes.QLF_DV_CD"
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
        name="grdMain"
        :visible-rows="pageInfo.pageSize - 1"
        @init="initGrid"
      />
      <!-- <kw-pagination
        :model-value="1"
        :total-count="100"
      /> -->
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, gridUtil, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

// const { getConfig } = useMeta();
const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'SELL_OG_DV_ACD',
  'QLF_DV_CD',
);
const grdMainRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 5,
});

let cachedParams;
const searchParams = ref({
  ogTpCd: 'E01',
  prntrNo: '',
  prntrKnm: '',
  olfDvCd: '',
});

async function fetchData() {
  const res = await dataService.get('sms/wells/organization/partner/planner-license/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().addRows(list);
  view.resetCurrent();
}

async function onclickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/organization/partner/planner-license/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: '플래너 자격 관리',
    timePostfix: true,
    exportData: res.data,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid(async (data, view) => {
  const columns = [
    { fieldName: 'level2Nm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '92', styleName: 'text-center' },
    { fieldName: 'level3Nm', header: t('MSG_TXT_RGNL_GRP'), width: '106', styleName: 'text-center' },
    { fieldName: 'level4Nm', header: t('MSG_TXT_BLG'), width: '106', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_BLD_NM'), width: '160', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '106', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_RSB'), width: '92', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_CP'), width: '156', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_RRNO'), width: '136', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_RCRT_DT'), width: '130', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_FNL_CLTN_DT'), width: '136', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_WELS_MNGER'), width: '122', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_STRT_DT'), width: '168', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_RSG_DT'), width: '168', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_RSG_DT'), width: '122', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_QLF_YN'), width: '122', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_TOPMR_PLAR'), width: '122', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_STRT_DT'), width: '168', styleName: 'text-center' },
    { fieldName: 'col19', header: t('MSG_TXT_RSG_DT'), width: '168', styleName: 'text-center' },
    { fieldName: 'col20', header: t('MSG_TXT_QLF_YN'), width: '122', styleName: 'text-center' },

  ];

  data.setFields(columns.map((item) => ({ fieldName: item.fieldName })));
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    {
      header: t('MSG_TXT_BLG'),
      direction: 'horizontal',
      items: ['level2Nm', 'level3Nm', 'level4Nm', 'col4'],
    },
    {
      header: t('MSG_TXT_HMNRSC'),
      direction: 'horizontal',
      items: ['col5', 'col6', 'col7', 'col8', 'col9', 'col10', 'col11'],
    },
    {
      header: t('MSG_TXT_WELS_MNGER'),
      direction: 'horizontal',
      items: ['col12', 'col13', 'col14', 'col15', 'col16'],
    },
    {
      header: t('MSG_TXT_TOPMR_PLAR'),
      direction: 'horizontal',
      items: ['col17', 'col18', 'col19', 'col20'],
    },
  ]);
});
</script>

<style scoped>
</style>
