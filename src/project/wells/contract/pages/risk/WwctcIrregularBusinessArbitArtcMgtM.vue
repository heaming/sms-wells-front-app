<template>
  <kw-page>
    <kw-search>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ACEPT_PERIOD')"
          :colspan="2"
        >
          <kw-select
            :model-value="[]"
            :options="['등록일자', 'B', 'C', 'D']"
          />
          <kw-date-range-picker
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')">
          <kw-select
            :model-value="[]"
            :options="['등록일자', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_RGNL_GRP')">
          <kw-input />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_BRANCH')">
          <kw-input />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_EMP_SRCH')">
          <kw-input icon="search_24" />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="7"
          />
        </template>
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_MOD')"
        />
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_DEL')"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_ROW_ADD')"
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_SAVE')"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        :visible-rows="10"
        @init="initGrid4"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid4(data, view) {
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
    { fieldName: 'col1', header: t('MSG_TXT_EMP_NO'), width: '180', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_YEAR_OCCURNCE'), width: '165', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'col3', header: t('MSG_TXT_BLG'), width: '129' },
    { fieldName: 'col4', header: t('MSG_TXT_EMPL_NM'), width: '129' },
    { fieldName: 'col5', header: t('MSG_TXT_CRLV'), width: '129' },
    { fieldName: 'col6', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '129' },
    { fieldName: 'col7', header: t('MSG_TXT_RGNL_GRP'), width: '129' },
    { fieldName: 'col8', header: 'BM', width: '129' },
    { fieldName: 'col9', header: t('MSG_TXT_BRANCH'), width: '129' },
    { fieldName: 'col10', header: t('MSG_TXT_CHRGS'), width: '306' },
    { fieldName: 'col11', header: t('MSG_TXT_ACTN_ITM'), width: '306' },
    { fieldName: 'col12', header: t('MSG_TXT_DUE_TRGT_NO'), width: '129' },
    { fieldName: 'col13', header: t('MSG_TXT_ACTN_TM_PNLTY_PNT'), width: '190', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_ACTN_DPT'), width: '306' },
    { fieldName: 'col15', header: t('MSG_TXT_FST_RGST_USR'), width: '146', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_FST_RGST_DT'), width: '165', datetimeFormat: 'yyyy-MM' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    // single
    {
      header: t('MSG_TXT_EMP_NO'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col1', 'col2', 'col3', 'col4', 'col5'],
    },
    {
      header: t('MSG_TXT_BLG'),
      direction: 'horizontal',
      items: ['col6', 'col7', 'col8', 'col9'],
    },
    {
      header: t('MSG_TXT_PNLTY'),
      direction: 'horizontal',
      items: ['col10', 'col11', 'col12', 'col13', 'col14'],
    },
    'col15', 'col16',

  ]);

  data.setRows([{ col1: '사번입력', col2: '2022-05', col3: '', col4: '', col5: '', col6: '', col7: '', col8: '', col9: '', col10: '', col11: '1-개인정보 도용에 의한 판매계약', col12: '', col13: '★★★', col14: '71401-Wells경영지원팀', col15: '', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },

  ]);
}

</script>
