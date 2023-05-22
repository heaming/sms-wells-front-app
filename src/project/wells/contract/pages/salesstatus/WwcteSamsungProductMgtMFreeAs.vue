<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteSamsungProductMgtM - 삼성전자 상품관리(무상A/S)
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.03.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 삼성전자 상품관리(무상A/S)
****************************************************************************************************
--->
<template>
  <kw-search :cols="4">
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_LOOKUP_PERIOD')"
        required
        :colspan="2"
      >
        <kw-select
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          :model-value="[]"
          :options="['A', 'B', 'C']"
          rules="required"
        />
        <kw-date-range-picker
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          rules="date_range_required|date_range_months:1"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_CNTR_STAT')">
        <kw-select
          :label="$t('MSG_TXT_CNTR_STAT')"
          :model-value="[]"
          :options="['A', 'B', 'C']"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_CNTR_NO')">
        <kw-input />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_CNTOR_NM')">
        <kw-input />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_PRDT_CODE')">
        <kw-input />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_PRDT_NM')">
        <kw-input />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_MNFT_NO')">
        <kw-input />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_SUS_OF_SALES')">
        <kw-select
          :model-value="[]"
          :options="['A', 'B', 'C']"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_POST_STLMNT')">
        <kw-select
          :model-value="[]"
          :options="['A', 'B', 'C']"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_BASE_MN_POST_STLMNT')">
        <kw-date-picker />
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
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON_MCN') }}</span>
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
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrdMain"
    />
  </div>
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CNTR_NO'), width: '137', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_CNTOR_NM'), width: '136', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_PRDT_CODE'), width: '136', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_PRDT_NM'), width: '253' },
    { fieldName: 'col5', header: t('MSG_TXT_MNFT_NO'), width: '168', styleName: 'text-center' },
    { fieldName: 'col6', header: `${t('MSG_TXT_MNFT_NO')} 14${t('MSG_TXT_DIGITS')}`, width: '168', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_CNTRCT_DT'), width: '136', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_INST_DT'), width: '136', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_RENT_EXP_DT'), width: '136', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_CAN_D'), width: '136', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_CNTR_STAT'), width: '136', styleName: 'text-center' },
    { fieldName: 'col12', header: `${t('MSG_TXT_FREE')} ${t('MSG_TXT_AS_PERIOD')}`, width: '136', styleName: 'text-right' },
    { fieldName: 'col13', header: `${t('MSG_TXT_SS')} ${t('MSG_TXT_BU')} ${t('MSG_TXT_FREE')} ${t('MSG_TXT_AS_PERIOD')}`, width: '204', styleName: 'text-right' },
    { fieldName: 'col14', header: `${t('MSG_TXT_KW')} ${t('MSG_TXT_BU')} ${t('MSG_TXT_FREE')} ${t('MSG_TXT_AS_PERIOD')}`, width: '204', styleName: 'text-right' },
    { fieldName: 'col15', header: t('MSG_TXT_FREE_END_DT'), width: '136', styleName: 'text-center' },
    { fieldName: 'col16', header: `${t('MSG_TXT_POST_STLMNT')} ${t('MSG_TXT_OJ_YN')}`, width: '161', styleName: 'text-center' },
    { fieldName: 'col17', header: `${t('MSG_TXT_POST_STLMNT')} ${t('MSG_TXT_START_DATE')}`, width: '161', styleName: 'text-center' },
    { fieldName: 'col18', header: `${t('MSG_TXT_POST_STLMNT')} ${t('MSG_TXT_END_DATE')}`, width: '161', styleName: 'text-center' },
    { fieldName: 'col19', header: t('MSG_TXT_OVERDUE'), width: '139', styleName: 'text-center' },
    { fieldName: 'col20', header: t('MSG_TXT_DLQ_AMT'), width: '161', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '1234-1234567', col2: '김고객', col3: '1234', col4: '비스포크냉장고코타화이트', col5: '1J2843AT900088', col6: '1J2843AT900088', col7: '2022-10-01', col8: '2022-10-05', col9: '2027-10-05', col10: '-', col11: '유지', col12: '60', col13: '60', col14: '0', col15: '2027-10-05', col16: 'N', col17: 'N', col18: 'N', col19: 'N', col20: '100,000' },
  ]);
});

</script>
