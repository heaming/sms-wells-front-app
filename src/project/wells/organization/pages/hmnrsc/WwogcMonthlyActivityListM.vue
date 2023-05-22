<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcMonthlyActivityListM - 월별 활동 현황
3. 작성자 : gs.rahul.n
4. 작성일 : 2023-05-08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 월별 활동 현황
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            type="month"
            rules="required"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_OG_TP')"
        >
          <kw-option-group
            :model-value="'M영업조직'"
            type="radio"
            :options="['M영업조직', 'P영업조직']"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_RSB_DV')"
          required
        >
          <kw-option-group
            :model-value="'판매자'"
            rules="required"
            type="radio"
            :options="['판매자', '지구장', '지점장']"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
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
        <kw-search-item :label="$t('MSG_TXT_QLF_DV')">
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
        ref="grdRef"
        :visible-rows="5"
        @init="initGrdMain"
      />
      <kw-pagination
        :model-value="1"
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
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);
const grdMainRef = ref(getComponentType('KwGrid'));

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

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MGT_YNM'), width: '110', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_BLG'), width: '110', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), width: '96', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_CRLV'), width: '78', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_GENDER'), width: '78', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_BLD_CD'), width: '110', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_BLD_NM'), width: '148', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_RCRT_DT'), width: '130', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_APNTMT_DT'), width: '130', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_FNL_CLTN_DT'), width: '136', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_BRN_MGR_NUM'), width: '122', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_QLF'), width: '122', styleName: 'text-center' },

    { fieldName: 'col14', header: t('MSG_TXT_NTOR'), width: '92', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_RCP_WO'), width: '106', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_RCP_IST'), width: '106', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_NTOR'), width: '92', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_RCP_WO'), width: '106', styleName: 'text-center' },

    { fieldName: 'col19', header: t('MSG_TXT_RCP_IST'), width: '106', styleName: 'text-center' },

    { fieldName: 'col20', header: t('MSG_TXT_PD_ACC_CNT'), width: '106', styleName: 'text-center' },
    { fieldName: 'col21', header: t('MSG_TXT_WO_CT'), width: '106', styleName: 'text-center' },
    { fieldName: 'col22', header: t('MSG_TXT_DC'), width: '106', styleName: 'text-center' },
    { fieldName: 'col23', header: t('MSG_TXT_ACKMT_YN'), width: '106', styleName: 'text-center' },
    { fieldName: 'col24', header: t('MSG_TXT_PLANNER_STRTUP'), width: '152', styleName: 'text-center' },
    { fieldName: 'col25', header: t('MSG_TXT_TOPMR_PLAR_PRTIC'), width: '152', styleName: 'text-center' },
    { fieldName: 'col26', header: t('MSG_TXT_BF_SV_ACC'), width: '104', styleName: 'text-center' },
    { fieldName: 'col27', header: `3${t('MSG_TXT_REG_IN_MN')}`, width: '160', styleName: 'text-center' },
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
    {
      header: t('MSG_TXT_BUILDING'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col7', 'col8'],
    },
    'col9',
    'col10',
    'col11',
    'col12',
    'col13',
    {
      header: t('MSG_TXT_PD_ACC_CNT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col14', 'col15', 'col16'],
    },
    {
      header: t('MSG_TXT_WO_CT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col17', 'col18', 'col19'],
    },
    {
      header: t('MSG_TXT_THM_IST'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col20', 'col21'],
    },
    {
      header: t('MSG_TXT_METG_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col22', 'col23'],
    },
    {
      header: t('MSG_TXT_EDUC_CPC_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col24', 'col25'],
    },
    'col26', 'col27',
  ]);

  data.setRows([
    { col1: '2022-09', col2: 'G080000', col3: '홍길동', col4: '1029102', col5: '15', col6: '여자', col7: '745', col8: '은평/대일 5층', col9: '2007-04-01', col10: '2007-04-01', col11: '-', col12: '0000000', col13: '헬스매니저', col14: '0', col15: '23.50', col16: '23.50', col17: '0', col18: '23.50', col19: '23.50', col20: '23.50', col21: '0', col22: '11', col23: 'N', col24: 'N', col25: 'N', col26: 'N', col27: 'N' },
    { col1: '2022-09', col2: 'G080000', col3: '홍길동', col4: '1029102', col5: '15', col6: '여자', col7: '745', col8: '은평/대일 5층', col9: '2007-04-01', col10: '2007-04-01', col11: '-', col12: '0000000', col13: '헬스매니저', col14: '0', col15: '23.50', col16: '23.50', col17: '0', col18: '23.50', col19: '23.50', col20: '23.50', col21: '0', col22: '11', col23: 'N', col24: 'N', col25: 'N', col26: 'N', col27: 'N' },
    { col1: '2022-09', col2: 'G080000', col3: '홍길동', col4: '1029102', col5: '15', col6: '여자', col7: '745', col8: '은평/대일 5층', col9: '2007-04-01', col10: '2007-04-01', col11: '-', col12: '0000000', col13: '헬스매니저', col14: '0', col15: '23.50', col16: '23.50', col17: '0', col18: '23.50', col19: '23.50', col20: '23.50', col21: '0', col22: '11', col23: 'N', col24: 'N', col25: 'N', col26: 'N', col27: 'N' },
    { col1: '2022-09', col2: 'G080000', col3: '홍길동', col4: '1029102', col5: '15', col6: '여자', col7: '745', col8: '은평/대일 5층', col9: '2007-04-01', col10: '2007-04-01', col11: '-', col12: '0000000', col13: '헬스매니저', col14: '0', col15: '23.50', col16: '23.50', col17: '0', col18: '23.50', col19: '23.50', col20: '23.50', col21: '0', col22: '11', col23: 'N', col24: 'N', col25: 'N', col26: 'N', col27: 'N' },
    { col1: '2022-09', col2: 'G080000', col3: '홍길동', col4: '1029102', col5: '15', col6: '여자', col7: '745', col8: '은평/대일 5층', col9: '2007-04-01', col10: '2007-04-01', col11: '-', col12: '0000000', col13: '헬스매니저', col14: '0', col15: '23.50', col16: '23.50', col17: '0', col18: '23.50', col19: '23.50', col20: '23.50', col21: '0', col22: '11', col23: 'N', col24: 'N', col25: 'N', col26: 'N', col27: 'N' },
  ]);
});

</script>

<style scoped>
</style>
