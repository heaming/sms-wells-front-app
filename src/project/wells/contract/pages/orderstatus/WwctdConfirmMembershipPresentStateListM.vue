<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTD
2. 프로그램 ID : WwctdConfirmMembershipPresentStateListM - 확정 멤버십 현황 조회
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.03.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 확정 멤버십 현황 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search :cols="3">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_APPL_PRD')"
          required
        >
          <kw-date-range-picker
            :label="$t('MSG_TXT_APPL_PRD')"
            rules="date_range_required|date_range_months:1"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_PRDT_CATE')">
          <kw-select
            :model-value="['']"
            :options="['대분류 전체','B','C']"
          />
          <kw-select
            :model-value="['']"
            :options="['중분류 전체','B','C']"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_PRDT_CODE')">
          <kw-input />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_FXD_PRD')"
          required
        >
          <kw-date-range-picker
            :label="$t('MSG_TXT_FXD_PRD')"
            rules="date_range_required|date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PRDT_NM')">
          <kw-input />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_SLS_CAT')">
          <kw-select
            :model-value="[]"
            :options="['전체','1. EDU','4. TM','7. 영업부','10. 회사']"
          />
          <kw-field
            :model-value="[]"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_EXL_AUT_GEN')"
                :val="$t('MSG_TXT_EXL_AUT_GEN')"
              />
            </template>
          </kw-field>
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PRTNR_CD')"
        >
          <kw-input />
          <span>~</span>
          <kw-input />
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
          :disable="pageInfo.totalCount === 0"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
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
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useMeta, useDataService, gridUtil, codeUtil } from 'kw-lib';

const { getConfig } = useMeta();

const { t } = useI18n();
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { currentRoute } = useRouter();
let cachedParams;
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/edu/contract/high-risk-partners/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
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

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CNTR_NO'), width: '151', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_CNTOR_NM'), width: '112', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_SEL_TYPE'), width: '112', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_SLS_CAT'), width: '112', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_PRDT_CLSF'), width: '112', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_TXT_MSG_PD_MCLSF_ID'), width: '112', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_PRDT_CODE'), width: '112', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_PRDT_NM'), width: '159' },
    { fieldName: 'col9', header: t('MSG_TXT_MEM_FREE_MN'), width: '154', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_FREE_MEM_CRT'), width: '154', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_STT_SUB'), width: '154', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_FEE_PD_YN'), width: '154', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_PRE_PAY'), width: '154', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_HDQ'), width: '154' },
    { fieldName: 'col15', header: t('MSG_TXT_PRTNR_CD'), width: '154' },
    { fieldName: 'col16', header: t('MSG_TXT_PTNR_NAME'), width: '154', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_CRLV'), width: '154', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_RECPETN_DT'), width: '154', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col19', header: t('MSG_TXT_DTRM_YN'), width: '154', styleName: 'text-center' },
    { fieldName: 'col20', header: t('MSG_TXT_DTRM_DATE'), width: '154', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col21', header: t('MSG_TXT_SUBS_DT'), width: '154', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col22', header: t('MSG_TXT_RSGN_D'), width: '154', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col23', header: t('MSG_TXT_CAN_D'), width: '154', styleName: 'text-center', datetimeFormat: 'date' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.setColumnLayout([

    {
      header: t('MSG_TXT_MEM_APPL_CONF_STT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8'],
    },

    {
      header: t('MSG_TXT_ONE_TIM_PAY_ORD_STT'),
      direction: 'horizontal',
      items: ['col9', 'col10', 'col11', 'col12'],
    },

    {
      header: t('MSG_TXT_MEM_APPL_CONF_STT'),
      direction: 'horizontal',
      items: ['col13', 'col14', 'col15', 'col16', 'col17', 'col18', 'col19', 'col20', 'col21', 'col22', 'col23'],
    },

  ]);

  data.setRows([
    { col1: 'W2022-1234567-1', col2: '김교원', col3: '렌탈', col4: '웰스', col5: '환경가전', col6: '정수기', col7: '1234', col8: 'KW-PN5W1', col9: '-', col10: '-', col11: '-', col12: '-', col13: 'Y', col14: 'D949330', col15: '1490318', col16: '김웰스', col17: '웰스매니저', col18: '2022-06-08', col19: 'Y', col20: '2022-06-30', col21: '2022-07-01', col22: '-', col23: '-' },
    { col1: 'W2022-1234567-1', col2: '김교원', col3: '렌탈', col4: '웰스', col5: '환경가전', col6: '정수기', col7: '1234', col8: 'KW-PN5W1', col9: '-', col10: '-', col11: '-', col12: '-', col13: 'Y', col14: 'D949330', col15: '1490318', col16: '김웰스', col17: '웰스매니저', col18: '2022-06-08', col19: 'Y', col20: '2022-06-30', col21: '2022-07-01', col22: '-', col23: '-' },
  ]);
});
</script>

<style scoped>
</style>
