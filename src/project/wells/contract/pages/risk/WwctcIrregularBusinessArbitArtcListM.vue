<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwctcIrregularBusinessArbitArtcListM - 비정도영업조치사항조회
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.01.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 비정도영업조치사항조회 화면
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-tabs model-value="2">
      <kw-tab
        name="1"
        label="비정도영업조치사항관리"
      />
      <kw-tab
        name="2"
        label="비정도영업조치사항조회"
      />
    </kw-tabs>
    <kw-tab-panels model-value="2">
      <kw-tab-panel name="2">
        <kw-search
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item
              :colspan="2"
              :label="$t('MSG_TXT_ACEPT_PERIOD')"
            >
              <kw-select
                v-model="searchParams.actPrd"
                :options="prdDivOption"
              />
              <kw-date-range-picker
                :key="isRegistration"
                v-model:from="searchParams.dangocstrdt.startDt"
                v-model:to="searchParams.dangocstrdt.endDt"
                :type="isRegistration"
                rules="date_range_months:1"
              />
            </kw-search-item>

            <kw-search-item
              :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
            >
              <kw-select
                v-model="searchParams.mgmtDpt"
                :options="gnrlMngTeamOptions"
              />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_RGNL_GRP')"
            >
              <kw-input
                v-model="searchParams.rgnlGrp"
              />
            </kw-search-item>

            <kw-search-item
              :label="$t('MSG_TXT_BRANCH')"
            >
              <kw-input
                v-model="searchParams.brnch"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_EMP_SRCH')"
            >
              <kw-input
                v-model="searchParams.dangOjPrntrNo"
                icon="search"
                clearable
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
              :label="$t('MSG_BTN_DEL')"
              grid-action
              @click="onClickDelete"
            />
            <kw-btn
              icon="download_on"
              :disable="pageInfo.totalCount === 0"
              dense
              secondary
              :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
              @click="onClickExcelDownload"
            />
          </kw-action-top>
          <kw-grid
            :visible-rows="pageInfo.pageSize"
            @init="initGrdMain"
          />
        </div>
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { gridUtil, defineGrid, getComponentType, useDataService, useMeta, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { getConfig } = useMeta();
const dataService = useDataService();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const searchParams = ref({
  actPrd: '',
  dangocstrdt: {
    startDt: '',
    endDt: '',
  },
  mgmtDpt: '',
  rgnlGrp: '',
  brnch: '',
  dangOjPrntrNo: '',
});
const prdDivOption = ref([{ codeId: 1, codeName: t('MSG_TXT_FST_RGST_DT') },
  { codeId: 2, codeName: t('MSG_TXT_YEAR_OCCURNCE') }]);
const isRegistration = computed(() => (searchParams.value.actPrd === 1 ? 'date' : 'month'));
const gnrlMngTeamOptions = ref([
  { codeId: '', codeName: t('MSG_TXT_ALL') },
  { codeId: 'A', codeName: `A${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'B', codeName: `B${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'C', codeName: `C${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'D', codeName: `D${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'E', codeName: `E${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'F', codeName: `F${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'G', codeName: `G${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'H', codeName: `H${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'P', codeName: `P${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
]);
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/edu/contract/monitor-contracts/detect-risks/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: 'monitorContractRiskList',
    timePostfix: true,
    exportData: response.data,
  });
}

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get('/sms/edu/contract/monitor-contracts/detect-risks', { params: cachedParams });
  const { list: organizations, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(organizations);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    // TODO integrate delete api
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), width: '129', styleName: 'text-left' },
    { fieldName: 'col2', header: t('MSG_TXT_BLG_NM'), width: '129', styleName: 'text-left' },
    { fieldName: 'col3', header: t('MSG_TXT_AFL_CD'), width: '129', styleName: 'text-left' },
    { fieldName: 'col4', header: t('MSG_TXT_EMPL_NM'), width: '129', styleName: 'text-left' },
    { fieldName: 'col5', header: t('MSG_TXT_EPNO'), width: '129', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_EMPL_NM'), width: '129', styleName: 'text-left' },
    { fieldName: 'col7', header: t('MSG_TXT_EPNO'), width: '129' },
    { fieldName: 'col8', header: t('MSG_TXT_GRADE'), width: '129', styleName: 'text-left' },
    { fieldName: 'col9', header: t('MSG_TXT_YEAR_OCCURNCE'), width: '129', styleName: 'text-left' },
    { fieldName: 'col10', header: t('MSG_TXT_ACTN_DPT'), width: '306', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_CHRGS'), width: '306', styleName: 'text-left' },
    { fieldName: 'col12', header: t('MSG_TXT_ACTN_ITM'), width: '306', styleName: 'text-left' },
    { fieldName: 'col13', header: t('MSG_TXT_DUE_TRGT_NO'), width: '129', styleName: 'text-left' },
    { fieldName: 'col14', header: t('MSG_TXT_ACTN_TM_PNLTY_PNT'), width: '190', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_TTL_PT'), width: '129', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_FST_RGST_USR'), width: '146', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_FST_RGST_DT'), width: '165', styleName: 'text-left', datetimeFormat: 'date' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4', 'col5',
    {
      header: t('MSG_TXT_EMP_NO'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col6', 'col7', 'col8'],
    },
    {
      header: t('MSG_TXT_PNLTY'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col9', 'col10', 'col11', 'col12', 'col13', 'col14', 'col15'],
    },
    'col16', 'col17',
  ]);

  data.setRows([
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },

  ]);
});
</script>
<style scoped>
</style>
