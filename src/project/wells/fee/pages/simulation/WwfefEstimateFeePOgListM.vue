<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEF
2. 프로그램 ID : WwfefEstimateFeePOgListM - 예상수수료 조회(P조직)
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.03.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 예상수수료 조회(P조직)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            :label="$t('MSG_TXT_PERF_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_INQR')"
          required
        >
          <kw-option-group
            :label="$t('MSG_TXT_PERF_INQR')"
            :model-value="'접수'"
            type="radio"
            :options="['접수', '매출']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          required
        >
          <kw-input
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            rules="required"
            icon="search"
            clearable
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_DEFAULT_INFO') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-form dense>
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_EMPL_NM')">
            <p>김교원</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_BLG')">
            <p>Q913123</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_RSB')">
            <p>플래너</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_EST_SAL_COMM')">
            <p>12,345,670</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_EXP_MUT_AID_FEE')">
            <p>123,450</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_TOT_EST_FEE')">
            <p>12,345,670</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_PERF_DETAIL') }}</h3>
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }} </span>
        </template>
        <kw-btn
          :label="$t('MSG_TXT_CALCULATE')"
          dense
          primary
        />
      </kw-action-top>
      <kw-grid
        :visible-rows="4"
        @init="initGrdMain1"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_EST_FEE_DTL') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-grid
        :visible-rows="2"
        @init="initGrdMain2"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_SAL_HIST') }}</h3>
        </template>
      </kw-action-top>
      <kw-grid
        :visible-rows="3"
        @init="initGrdMain3"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid } from 'kw-lib';

const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain1 = defineGrid((data, view) => {
  const fields = [{ fieldName: 'col1' }, { fieldName: 'col2' }, { fieldName: 'col3' }, { fieldName: 'col4' }, { fieldName: 'col5' }, { fieldName: 'col6' }, { fieldName: 'col7' }];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), width: '220', styleName: 'text-left' },
    { fieldName: 'col2', header: t('MSG_TXT_ELHM'), width: '220', styleName: 'text-right' },
    { fieldName: 'col3', header: t('MSG_TXT_EXCEPT_HOUSEHOLD_APPLIANCES'), width: '220', styleName: 'text-right' },
    { fieldName: 'col4', header: '429', width: '220', styleName: 'text-right' },
    { fieldName: 'col5', header: '599', width: '220', styleName: 'text-right' },
    { fieldName: 'col6', header: t('MSG_TXT_PLANNER_STRTUP'), width: '220', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_PLANNER_PRCTC'), width: '220', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  // multi row header setting
  view.setColumnLayout([
    'col1',
    'col2',
    'col3', // single
    {
      header: t('MSG_TXT_MUTU'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col4', 'col5'],
    },
    {
      header: t('MSG_TXT_EDU_CERT'),
      direction: 'horizontal',
      items: ['col6', 'col7'],
    },
  ]);

  data.setRows([
    { col1: '개인 실적 현황', col2: '12,345,670', col3: '12,345,670', col4: '12', col5: '12', col6: '2022-10', col7: 'N' },
    { col1: '개인 실적 현황', col2: '12,345,670', col3: '12,345,670', col4: '12', col5: '12', col6: '2022-10', col7: 'N' },
    { col1: '개인 실적 현황', col2: '12,345,670', col3: '12,345,670', col4: '12', col5: '12', col6: '2022-10', col7: 'N' },
    { col1: '개인 실적 현황', col2: '12,345,670', col3: '12,345,670', col4: '12', col5: '12', col6: '2022-10', col7: 'N' },
  ]);
});

const initGrdMain2 = defineGrid((data, view) => {
  const fields = [{ fieldName: 'col1' }, { fieldName: 'col2' }, { fieldName: 'col3' }, { fieldName: 'col4' }, { fieldName: 'col5' }, { fieldName: 'col6' }, { fieldName: 'col7' }, { fieldName: 'col8' }, { fieldName: 'col9' }, { fieldName: 'col10' }];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), width: '218' },
    { fieldName: 'col2', header: t('MSG_TXT_ELHM_PRPN'), styleName: 'text-right', width: '135' },
    { fieldName: 'col3', header: t('MSG_TXT_ELHM_EXCP_PRPN'), styleName: 'text-right', width: '135' },
    { fieldName: 'col4', header: t('MSG_TXT_SAL_INTV'), styleName: 'text-right', width: '135' },
    { fieldName: 'col5', header: t('MSG_TXT_STMNT'), styleName: 'text-right', width: '135' },
    { fieldName: 'col6', header: t('MSG_TXT_MUTU'), styleName: 'text-right', width: '135' },
    { fieldName: 'col7', header: t('MSG_TXT_ELHM_PRPN'), styleName: 'text-right', width: '165' },
    { fieldName: 'col8', header: t('MSG_TXT_ELHM_EXCP_PRPN'), styleName: 'text-right', width: '165' },
    { fieldName: 'col9', header: t('MSG_TXT_SAL_INTV'), styleName: 'text-right', width: '166' },
    { fieldName: 'col10', header: t('MSG_TXT_MUTU'), styleName: 'text-right', width: '165' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1',
    {
      header: t('MSG_TXT_PRSNL_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col2', 'col3', 'col4', 'col5', 'col6'],
    },
    {
      header: t('MSG_TXT_ORGNSTN_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col7', 'col8', 'col9', 'col10'],
    },
  ]);

  data.setRows([
    { col1: '예상수수료', col2: '123,450', col3: '123,450', col4: '123,450', col5: '123,450', col6: '123,450', col7: '123,450', col8: '123,450', col9: '123,450', col10: '123,450' },
    { col1: '합계', col2: '-', col3: '-', col4: '-', col5: '-', col6: '1,234,500', col7: '123,450', col8: '1,234,500', col9: '123,450', col10: '1,234,500' },
  ]);
});
const initGrdMain3 = defineGrid((data, view) => {
  const fields = [{ fieldName: 'col1' }, { fieldName: 'col2' }, { fieldName: 'col3' }, { fieldName: 'col4' }, { fieldName: 'col5' }, { fieldName: 'col6' }, { fieldName: 'col7' }, { fieldName: 'col8' }, { fieldName: 'col9' }, { fieldName: 'col10' }, { fieldName: 'col11' }, { fieldName: 'col12' }, { fieldName: 'col13' }];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '118', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_EMPL_NM'), width: '120' },
    { fieldName: 'col3', header: t('MSG_TXT_PERF_DV'), width: '118' },
    { fieldName: 'col4', header: t('MSG_TXT_PRDT_GUBUN'), width: '118' },
    { fieldName: 'col5', header: t('MSG_TXT_RCPDT'), width: '118' },
    { fieldName: 'col6', header: t('MSG_TXT_SL_DT'), width: '118' },
    { fieldName: 'col7', header: t('MSG_TXT_CNTR_NO'), width: '118' },
    { fieldName: 'col8', header: t('MSG_TXT_PD_IZ'), width: '287' },
    { fieldName: 'col9', header: t('MSG_TXT_CST_NM'), width: '118' },
    { fieldName: 'col10', header: t('MSG_TXT_SLS_CAT'), width: '118', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_ELHM'), width: '118', styleName: 'text-right' },
    { fieldName: 'col12', header: t('MSG_TXT_EXCEPT_HOUSEHOLD_APPLIANCES'), width: '118', styleName: 'text-right' },
    { fieldName: 'col13', header: t('MSG_TXT_CHNG'), width: '118', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '1234567', col2: '김교원', col3: '가전', col4: 'BH', col5: '2022-10-25', col6: '2022-11-01', col7: '2022-5844568', col8: '공기청정기AK316ESA', col9: '김고객', col10: '신규', col11: '123,450', col12: '1,234,000', col13: '1,234,000' },
    { col1: '1234567', col2: '김교원', col3: '가전', col4: 'BH', col5: '2022-10-25', col6: '2022-11-01', col7: '2022-5844568', col8: '공기청정기AK316ESA', col9: '김고객', col10: '신규', col11: '123,450', col12: '1,234,000', col13: '1,234,000' },
    { col1: '1234567', col2: '김교원', col3: '가전', col4: 'BH', col5: '2022-10-25', col6: '2022-11-01', col7: '2022-5844568', col8: '공기청정기AK316ESA', col9: '김고객', col10: '신규', col11: '123,450', col12: '1,234,000', col13: '1,234,000' },
  ]);
});
</script>
