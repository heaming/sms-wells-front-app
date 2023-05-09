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
    <kw-search :modified-targets="['grdMain']">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            :label="$t('MSG_TXT_MGT_YNM')"
            rules="required"
            type="month"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_OG_TP')">
          <kw-option-group
            :model-value="'M영업조직'"
            type="radio"
            :options="['M영업조직', 'P영업조직']"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_QLF_DV')"
          required
        >
          <kw-select
            :label="$t('MSG_TXT_QLF_DV')"
            :model-value="''"
            :options="['전체', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_PERF_DV')">
          <kw-option-group
            :model-value="'전체'"
            type="radio"
            :options="['전체', '수당건수', '설치기준']"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_SEQUENCE_NUMBER')">
          <kw-input
            icon="search"
            clearable
          />

          <kw-input />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_OG_LEVL')">
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
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
        :visible-rows="4"
        @init="initGrid"
      />
      <kw-pagination
        :model-value="1"
        :total-count="100"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useMeta } from 'kw-lib';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
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
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },
    { fieldName: 'col22' },
    { fieldName: 'col23' },
    { fieldName: 'col24' },
    { fieldName: 'col25' },
    { fieldName: 'col26' },
    { fieldName: 'col27' },
    { fieldName: 'col28' },
    { fieldName: 'col29' },

  ];

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

  data.setFields(fields);
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

  data.setRows([
    { col1: '서부', col2: '마포지역', col3: 'A029102', col4: '은평/대일 5층', col5: '홍길동', col6: '0000000', col7: '웰스매니저', col8: '2011-05-11', col9: '2011-05-11', col10: '2011-05-11', col11: '2011-05-11', col12: '2011-05-11', col13: '2011-05-11', col14: '2011-05-11', col15: '2011-05-11', col16: '2011-05-11', col17: '2011-05-11', col18: '0000000', col19: '홍길순', col20: '0', col21: '0', col22: '0', col23: '0', col24: '0', col25: '2021-01', col26: '2021-01', col27: '0', col28: '0', col29: '0' },
    { col1: '서부', col2: '마포지역', col3: 'A029102', col4: '은평/대일 5층', col5: '홍길동', col6: '0000000', col7: '웰스매니저', col8: '2011-05-11', col9: '2011-05-11', col10: '2011-05-11', col11: '2011-05-11', col12: '2011-05-11', col13: '2011-05-11', col14: '2011-05-11', col15: '2011-05-11', col16: '2011-05-11', col17: '2011-05-11', col18: '0000000', col19: '홍길순', col20: '0', col21: '0', col22: '0', col23: '0', col24: '0', col25: '2021-01', col26: '2021-01', col27: '0', col28: '0', col29: '0' },
    { col1: '서부', col2: '마포지역', col3: 'A029102', col4: '은평/대일 5층', col5: '홍길동', col6: '0000000', col7: '웰스매니저', col8: '2011-05-11', col9: '2011-05-11', col10: '2011-05-11', col11: '2011-05-11', col12: '2011-05-11', col13: '2011-05-11', col14: '2011-05-11', col15: '2011-05-11', col16: '2011-05-11', col17: '2011-05-11', col18: '0000000', col19: '홍길순', col20: '0', col21: '0', col22: '0', col23: '0', col24: '0', col25: '2021-01', col26: '2021-01', col27: '0', col28: '0', col29: '0' },
    { col1: '서부', col2: '마포지역', col3: 'A029102', col4: '은평/대일 5층', col5: '홍길동', col6: '0000000', col7: '웰스매니저', col8: '2011-05-11', col9: '2011-05-11', col10: '2011-05-11', col11: '2011-05-11', col12: '2011-05-11', col13: '2011-05-11', col14: '2011-05-11', col15: '2011-05-11', col16: '2011-05-11', col17: '2011-05-11', col18: '0000000', col19: '홍길순', col20: '0', col21: '0', col22: '0', col23: '0', col24: '0', col25: '2021-01', col26: '2021-01', col27: '0', col28: '0', col29: '0' },
  ]);
});

</script>

<style scoped>
</style>
