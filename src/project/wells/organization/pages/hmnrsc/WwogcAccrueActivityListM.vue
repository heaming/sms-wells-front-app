<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcAccrueActivityListM - 누적할동 현황 화면
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.05.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 누적할동 현황 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
      :default-visible-rows="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="$t('MSG_TXT_MGT_YNM')"
            rules="required"
            type="month"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_OG_TP')">
          <kw-option-group
            v-model="searchParams.ogTpCd"
            type="radio"
            :options="ogTp"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_QLF_DV')"
          required
        >
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            :label="$t('MSG_TXT_QLF_DV')"
            rules="required"
            type="radio"
            :options="codes.QLF_DV_CD"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PERF_DV')">
          <kw-option-group
            v-model="searchParams.perfDv"
            type="radio"
            :options="perfDv"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_PRTNR_NUM_EMPL_NM')">
          <zwog-partner-search
            v-model:prtnrNo="searchParams.prtnrNo"
            v-model:og-tp-cd="searchParams.ogTpCd"
            clearable
            :label="$t('MSG_TXT_PRTNR_NUM_EMPL_NM')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_OG_LEVL')">
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
            v-model:og-levl-dv-cd3="searchParams.ogLevlDvCd3"
            :og-tp-cd="searchParams.ogTpCd"
            :start-level="1"
            :base-ym="searchParams.baseYm"
            :end-level="3"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-size="pageInfo.pageSize"
            v-model:page-index="pageInfo.pageIndex"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount===0"
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
import { useDataService, codeUtil, defineGrid, getComponentType, gridUtil, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import ZwogPartnerSearch from '~sms-common/organization/components/ZwogPartnerSearch.vue';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { getConfig, getUserInfo } = useMeta();
const { currentRoute } = useRouter();
const { wkOjOgTpCd, ogTpCd } = getUserInfo();
const now = dayjs().format('YYYYMM');
const dataService = useDataService();
let cacheParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'QLF_DV_CD',
);

const ogTp = ref([
  { codeId: 'W01', codeName: 'P추진' },
  { codeId: 'W02', codeName: 'M추진' },
]);

const perfDv = ref([
  { codeId: '', codeName: '전체' },
  { codeId: 'A', codeName: '수당건수' },
  { codeId: 'I', codeName: '설치기준' },
]);

const grdMainRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = ref({
  baseYm: now,
  ogTpCd: wkOjOgTpCd === null ? ogTpCd : wkOjOgTpCd,
  ogLevlDvCd1: undefined,
  ogLevlDvCd2: undefined,
  ogLevlDvCd3: undefined,
  rsbDvCd: '2',
  prtnrNo: undefined,
  perfDv: '',
});

function setGrid(response) {
  const data = grdMainRef.value.getData();
  data.setRows(response);
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/activity/accrue/paging', { params: { ...cacheParams, ...pageInfo.value } });

  const { list, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);

  setGrid(list);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cacheParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/activity/accrue/excel-download', { params: { ...cacheParams } });
  view.__originalLayouts__ = view.saveColumnLayout();
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
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '92', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '106', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_BLG'), width: '110', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_BLD_NM'), width: '148', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_EMPL_NM'), width: '96', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '122', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_QLF'), width: '122', styleName: 'text-center' },

    { fieldName: 'col8', header: t('MSG_TXT_INIT_REG'), width: '136', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_FNL_CLTN'), width: '136', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_RETR'), width: '136', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_FST_OPNG'), width: '136', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_FNL_CLTN'), width: '134', styleName: 'text-center' },

    { fieldName: 'col13', header: t('MSG_TXT_RE_OPNG'), width: '136', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_FST_OPNG'), width: '136', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_FNL_CLTN'), width: '136', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_DMTN'), width: '136', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_CLTN'), width: '136', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110', styleName: 'text-center' },
    { fieldName: 'col19', header: t('MSG_TXT_EMPL_NM'), width: '96', styleName: 'text-center' },
    { fieldName: 'col20', header: t('MSG_TXT_ACU_CT'), width: '128', styleName: 'text-center' },
    { fieldName: 'col21', header: t('MSG_TXT_JBF_MMS3_AV'), width: '158', styleName: 'text-center' },
    { fieldName: 'col22', header: t('MSG_TXT_JBF_MMS3'), width: '120', styleName: 'text-center' },
    { fieldName: 'col23', header: t('MSG_TXT_THM'), width: '128', styleName: 'text-center' },
    { fieldName: 'col24', header: t('MSG_TXT_UPGR_CT'), width: '120', styleName: 'text-center' },

    { fieldName: 'col25', header: t('MSG_TXT_SRTUP'), width: '136', styleName: 'text-center' },
    { fieldName: 'col26', header: t('MSG_TXT_PLAR_SRTUP'), width: '154', styleName: 'text-center' },
    { fieldName: 'col27', header: t('MSG_TXT_PERSONS'), width: '78', styleName: 'text-center' },
    { fieldName: 'col28', header: t('MSG_TXT_LSTMM_ACL_ACTI'), width: '106', styleName: 'text-center' },
    { fieldName: 'col29', header: t('MSG_TXT_THM_ACL_ACTI'), width: '106', styleName: 'text-center' },
  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([

    'col1',
    'col2',
    'col3',
    'col4',
    'col5',
    'col6',
    'col7',
    {
      header: t('MSG_TXT_BIZ_RGST_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col8', 'col9', 'col10'],
    },
    {
      header: t('MSG_TXT_WELS_MNGER_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col11', 'col12'],
    },
    {
      header: t('MSG_TXT_WELS_MNGER_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col13'],
    },
    {
      header: t('MSG_TXT_TOPMR_PLAR_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col14', 'col15', 'col16', 'col17'],
    },
    {
      header: t('MSG_TXT_TOPMR_PLAR_APLCNS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col18', 'col19'],
    },
    {
      header: t('MSG_TXT_ENVR_ELHM_PERF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col20', 'col21', 'col22', 'col23', 'col24'],
    },
    {
      header: t('MSG_TXT_EDUC_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col25', 'col26'],
    },
    {
      header: t('MSG_TXT_ENGM_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col27', 'col28', 'col29'],
    },
  ]);
});

</script>

<style scoped>
</style>
