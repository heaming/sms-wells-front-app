<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcTopPlannerReqMgtM - 수석플래너 신청관리
3. 작성자 : 이한울
4. 작성일 : 2023-05-08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수석플래너 신청관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_APL_DATE')"
          required
        >
          <kw-date-picker
            :label="$t('MSG_TXT_APL_DATE')"
            rules="required"
            type="month"
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
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount===0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_TXT_REG_TM_CTRL')"
          primary
          dense
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grMain"
        :visible-rows="10"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
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
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

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

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '92', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '106', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_BLG'), width: '106', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_BLD_NM'), width: '160', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '134', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_WM_QLF_YN'), width: '136', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_STRT_MNTH_REG_CUM'), width: '180', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_ACU_CT'), width: '106', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_RCRT_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col11', header: t('MSG_TXT_FNL_CLTN_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col12', header: t('MSG_TXT_STRT_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col13', header: t('MSG_TXT_DMTN_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col14', header: t('MSG_TXT_REC_CHIEF_PLNR'), width: '130', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_APLC_YN'), width: '106', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '경남', col2: '창원센터', col3: 'A000000', col4: '센트럴시티', col5: '0000000', col6: '홍길순', col7: 'Y', col8: '2019-09', col9: '000000', col10: '2019-09-25', col11: '2019-09-25', col12: '2019-09-25', col13: '2019-09-25', col14: 'Y', col15: '신청' },

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
      header: t('MSG_TXT_ENVR_ELHM_PERF'),
      direction: 'horizontal',
      items: ['col8', 'col9'],
    },
    {
      header: t('MSG_TXT_TOPMR_PLAR_PS'),
      direction: 'horizontal',
      items: ['col10', 'col11', 'col12'],
    },
    {
      header: t('MSG_TXT_TOPMR_PLAR_PS'),
      direction: 'horizontal',
      items: ['col13'],
    },
    'col14',
    'col15',
  ]);
});
</script>

<style scoped>
</style>
