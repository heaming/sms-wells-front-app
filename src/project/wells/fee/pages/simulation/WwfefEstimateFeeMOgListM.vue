<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEF
2. 프로그램 ID : WwfefEstimateFeeMOgListM - 예상수수료 조회(M조직)
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.03.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 예상수수료 조회(M조직)
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

            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_INQR')"
          required
        >
          <kw-option-group
            :model-value="'접수'"
            type="radio"
            :options="['접수', '설치']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          required
        >
          <kw-input />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <span class="accent">{{ t('MSG_TIT_DEFAULT_INFO') }}</span>
        </template>
      </kw-action-top>
      <kw-form
        dense
      >
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_EMPL_NM')"
          >
            <p>김교원</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_BLG_CD')"
          >
            <p>Q913123</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_CRLV')"
          >
            <p>플래너</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_EST_SAL_COMM')"
          >
            <p>12,345,670</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_EXP_MUT_AID_FEE')"
          >
            <p>123,450</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_TOT_EST_FEE')"
          >
            <p>12,345,670</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <kw-action-top>
        <template #left>
          <span class="accent">{{ t('MSG_TXT_PERF_DETAIL') }}</span>
        </template>
        <kw-btn
          :label="$t('MSG_TXT_APPL_MEET_ATTND')"
          dense
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_TXT_EDU_COMPL_APPL')"
          dense
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_TXT_BS_PROC_RT_APPL')"
          dense
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          dense
          primary
        />
      </kw-action-top>
      <kw-grid
        :visible-rows="2"
        @init="initGrid2"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <span class="accent">{{ t('MSG_TXT_EST_FEE_DTL') }}</span>
        </template>
      </kw-action-top>
      <kw-grid
        :visible-rows="2"
        @init="initGrid3"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <span class="accent">{{ t('MSG_TXT_SAL_HIST') }}</span>
        </template>
      </kw-action-top>
      <kw-grid
        :visible-rows="5"
        @init="initGrid4"
      />
      <kw-separator />

      <kw-action-top>
        <template #left>
          <span class="accent">{{ t('MSG_TXT_ADVICE') }}</span>
        </template>
      </kw-action-top>
      <kw-form
        :cols="2"
        dense
      >
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_NUM_ADD_SALES')"
          >
            <p>2</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_ADD_EST_FEE')"
          >
            <p>300,000</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_NUM_ADD_SALES')"
          >
            <p>4</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_ADD_EST_FEE')"
          >
            <p>600,000</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_NUM_ADD_SALES')"
          >
            <p>6</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_ADD_EST_FEE')"
          >
            <p>1,000,000</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
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
const initGrid2 = defineGrid((data, view) => {
  const fields = [{ fieldName: 'col1' }, { fieldName: 'col2' }, { fieldName: 'col3' }, { fieldName: 'col4' }, { fieldName: 'col5' }, { fieldName: 'col6' }, { fieldName: 'col7' }, { fieldName: 'col8' }];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), width: '193', styleName: 'text-left' },
    { fieldName: 'col2', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '192', styleName: 'text-right' },
    { fieldName: 'col3', header: t('MSG_TXT_LUMP_SUM_INST'), width: '192', styleName: 'text-right' },
    { fieldName: 'col4', header: t('MSG_TXT_BS_MGT_PROD'), width: '193', styleName: 'text-right' },
    { fieldName: 'col5', header: t('MSG_TXT_BFSVC_ACKMT_CT'), width: '193', styleName: 'text-right' },
    { fieldName: 'col6', header: t('MSG_TXT_BS_PROC_RATE'), width: '192', styleName: 'text-right' },
    { fieldName: 'col7', header: t('MSG_TXT_METG_PRSC_D'), width: '192', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_EDU_CERT'), width: '193', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  data.setRows([
    { col1: '실적 현황', col2: '12', col3: '12,345,670', col4: '12', col5: '12', col6: '12', col7: '12', col8: 'N' },
    { col1: '변경 실적', col2: '12', col3: '12,345,670', col4: '12', col5: '12', col6: '12', col7: '12', col8: 'N' },
  ]);
});

const initGrid3 = defineGrid((data, view) => {
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), styleName: 'text-center', width: '218' },
    { fieldName: 'col2', header: t('MSG_TXT_ELHM_PRPN'), styleName: 'text-right', width: '157' },
    { fieldName: 'col3', header: t('MSG_TXT_ELHM_METG'), styleName: 'text-right', width: '157' },
    { fieldName: 'col4', header: t('MSG_TXT_ELHM_EXCP_PRPN'), styleName: 'text-right', width: '157' },
    { fieldName: 'col5', header: t('MSG_TXT_ELHM_EXCP_METG'), styleName: 'text-right', width: '157' },
    { fieldName: 'col6', header: t('MSG_TXT_SAL_INTV'), styleName: 'text-right', width: '157' },
    { fieldName: 'col7', header: t('MSG_TXT_EDUC'), styleName: 'text-right', width: '157' },
    { fieldName: 'col8', header: t('MSG_TXT_STMNT'), styleName: 'text-right', width: '160' },
    { fieldName: 'col9', header: t('MSG_TXT_BS_MGMT'), styleName: 'text-right', width: '220' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1',
    {
      header: t('MSG_TXT_EST_SAL_COMM'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8'],
    },
    {
      header: t('MSG_TXT_EST_BS_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col9'],
    },
  ]);

  data.setRows([
    { col1: '예상수수료', col2: '1,234,500', col3: '1,234,500', col4: '123,450', col5: '123,450', col6: '123,450', col7: '123,450', col8: '123,450', col9: '123,450' },
    { col1: '합계', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '123,450', col9: '123,450' },
  ]);
});

const initGrid4 = defineGrid((data, view) => {
  const fields = [{ fieldName: 'col1' }, { fieldName: 'col2' }, { fieldName: 'col3' }, { fieldName: 'col4' }, { fieldName: 'col5' }, { fieldName: 'col6' }, { fieldName: 'col7' }, { fieldName: 'col8' }, { fieldName: 'col9' }, { fieldName: 'col10' }];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CONF_COMPL_DT'), width: '155', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col2', header: t('MSG_TXT_INST_COMP_DT'), width: '155', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col3', header: t('MSG_TXT_CST_CD'), width: '155', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_CNTRT'), width: '155', styleName: 'text-left' },
    { fieldName: 'col5', header: t('MSG_TXT_PRDT_NM'), width: '155', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_PRDT_CODE'), width: '155', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_PRDT_GUBUN'), width: '155', styleName: 'text-left' },
    { fieldName: 'col8', header: t('MSG_TXT_CONTR_TYPE'), width: '155', styleName: 'text-left' },
    { fieldName: 'col9', header: t('MSG_TXT_PD_ACC_CNT'), width: '155', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_BFSVC_ACKMT_CT'), width: '155', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-10-24', col2: '-', col3: '2022-1234567', col4: '김교원', col5: '비데', col6: 'BM350', col7: '렌탈', col8: '일반', col9: '1', col10: '1' },
    { col1: '2022-10-21', col2: '2022-10-22', col3: '2022-1234567', col4: '이교원', col5: '청정기', col6: 'AK316', col7: '일시불', col8: '일반', col9: '1', col10: '1' },
    { col1: '2022-10-24', col2: '-', col3: '2022-1234567', col4: '김교원', col5: '비데', col6: 'BM350', col7: '렌탈', col8: '일반', col9: '1', col10: '1' },
  ]);
});

</script>
