<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcTopPlannerMgtM - 수석플래너 관리 화면
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.05.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수석플래너 관리 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      :cols="4"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            :label="$t('MSG_TXT_MGT_YNM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          :colspan="2"
        >
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
        <kw-search-item :label="$t('MSG_TXT_SEQUENCE_NUMBER')">
          <kw-input
            clearable
            icon="search"
          />
          <kw-input />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-tabs
        model-value="1"
        class="mt30 mb26"
      >
        <kw-tab
          name="1"
          :label="$t('MSG_TXT_ADVMNT')"
        />
        <kw-tab
          name="2"
          :label="$t('MSG_TXT_DMTN')"
        />
      </kw-tabs>
      <kw-tab-panels model-value="1">
        <kw-tab-panel name="1">
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
            <kw-separator
              vertical
              inset
              spaced
            />
            <kw-btn
              dense
              secondary
              :label="$t('MSG_TXT_SEN_UPLD')"
            />
            <kw-separator
              vertical
              inset
              spaced
            />
            <kw-btn
              dense
              primary
              :label="$t('MSG_TXT_SEN_CONF')"
            />
          </kw-action-top>

          <kw-grid
            ref="grdMainRef"
            name="grdMain"
            :visible-rows="10"
            @init="initGrid"
          />
          <kw-pagination
            :model-value="1"
            :total-count="100"
          />
        </kw-tab-panel>
      </kw-tab-panels>
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

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '92', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '106', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_BLG'), width: '106', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_BLD_NM'), width: '160', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_RSB'), width: '92', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_FST_OPNG'), width: '130', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_FNL_CLTN'), width: '130', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_DMTN'), width: '130', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_CLTN'), width: '130', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_STRT_MNTH_REG_CUM'), width: '180', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_ACU_CT'), width: '106', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_THM_ACKMT_CT'), width: '136', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_PLANNER_STRTUP'), width: '152', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_WM_CLTN_YN'), width: '152', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '경남', col2: '창원센터', col3: 'A000000', col4: '센트럴시티', col5: '0000000', col6: '홍길순', col7: '플래너', col8: '2019-09-25', col9: '2019-09-25', col10: '2019-09-25', col11: '2019-09-25', col12: '2019-09', col13: '000000', col14: '000000', col15: '2019-09-25', col16: 'Y' },

  ]);
  view.setColumnLayout([

    {
      header: t('MSG_TXT_BLG'),
      direction: 'horizontal',
      items: ['col1', 'col2', 'col3', 'col4'],
    },
    'col5',
    'col6',
    'col7',
    {
      header: t('MSG_TXT_TOPMR_PLAR_PS'),
      direction: 'horizontal',
      items: ['col8', 'col9', 'col10', 'col11'],
    },
    {
      header: t('MSG_TXT_ENVR_ELHM_PERF'),
      direction: 'horizontal',
      items: ['col12', 'col13', 'col14'],
    },
    {
      header: t('MSG_TXT_EDUC_PS'),
      direction: 'horizontal',
      items: ['col15'],
    },
    'col16',
  ]);
});
</script>

<style scoped>
</style>
