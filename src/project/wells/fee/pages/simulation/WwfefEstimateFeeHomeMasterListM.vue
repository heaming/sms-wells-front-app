<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEF
2. 프로그램 ID : WwfefEstimateFeeHomeMasterListM - 예상수수료 조회(홈마스터) 조회
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.03.15
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 예상수수료 조회(홈마스터) 화면
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
            rules="required"
            type="month"
            :label="$t('MSG_TXT_PERF_YM')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_INQR')"
          required
        >
          <kw-option-group
            type="radio"
            :label="$t('MSG_TXT_PERF_INQR')"
            :options="[$t('MSG_TXT_RCP'), $t('MSG_TXT_INSTALLATION')]"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          required
        >
          <kw-input
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <span class="accent">기본 정보</span>
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
            :label="$t('MSG_TXT_EST_SVC_FEE')"
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
          <span class="accent">{{$t('MSG_TXT_PERF_DETAIL')}}</span>
        </template>

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
          :label="$t('MSG_BTN_SAVE')"
          dense
          primary
        />
      </kw-action-top>
      <kw-grid
        ref="grdPerfDtlRef"
        :visible-rows="2"
        @init="initGrdPerfDtl"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <span class="accent">{{ $t('MSG_TXT_EST_FEE_DTL') }}</span>
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdEstFeeDtlRef"
        :visible-rows="2"
        @init="initGrdEstFeeDtl"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <span class="accent">{{ $t('MSG_TXT_SAL_HIST') }}</span>
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdSaleHistRef"
        :visible-rows="5"
        @init="initGrdSaleHist"
      />
      <kw-separator />

      <kw-action-top>
        <template #left>
          <span class="accent">{{ $t('MSG_TXT_ADVICE') }}</span>
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
import { getComponentType, defineGrid } from 'kw-lib';

const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdPerfDtlRef = ref(getComponentType('KwGrid'));
const grdEstFeeDtlRef = ref(getComponentType('KwGrid'));
const grdSaleHistRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdPerfDtl = defineGrid((data, view) => {
  const fields = [{ fieldName: 'col1' }, { fieldName: 'col2' }, { fieldName: 'col3' }, { fieldName: 'col4' }, { fieldName: 'col5' }, { fieldName: 'col6' }];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), width: '193', styleName: 'text-left' },
    { fieldName: 'col2', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '269', styleName: 'text-right' },
    { fieldName: 'col3', header: t('MSG_TXT_SNGL_PMNT'), width: '268', styleName: 'text-right' },
    { fieldName: 'col4', header: t('MSG_TXT_ALL_CASES_PROC'), width: '271', styleName: 'text-right' },
    { fieldName: 'col5', header: t('MSG_TXT_APL_HNDL_CASE'), width: '270', styleName: 'text-right' },
    { fieldName: 'col6', header: t('MSG_TXT_EDU_CERT'), width: '270', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  data.setRows([
    { col1: '실적 현황', col2: '12', col3: '12,345,670', col4: '12', col5: '12', col6: 'N' },
    { col1: '변경 실적', col2: '12', col3: '12,345,670', col4: '12', col5: '12', col6: 'N' },
  ]);
});

const initGrdEstFeeDtl = defineGrid((data, view) => {
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), styleName: 'text-left', width: '218' },
    { fieldName: 'col2', header: t('MSG_TXT_PRPN'), styleName: 'text-right', width: '165' },
    { fieldName: 'col3', header: t('MSG_TXT_EARLY_STTLMNT'), styleName: 'text-right', width: '165' },
    { fieldName: 'col4', header: `${t('MSG_TXT_ENRG')} 1`, styleName: 'text-right', width: '165' },
    { fieldName: 'col5', header: `${t('MSG_TXT_ENRG')} 2`, styleName: 'text-right', width: '165' },
    { fieldName: 'col6', header: t('MSG_TXT_SCENE'), styleName: 'text-right', width: '132' },
    { fieldName: 'col7', header: `${t('MSG_TXT_ACTI')} 1`, styleName: 'text-right', width: '132' },
    { fieldName: 'col8', header: `${t('MSG_TXT_ACTI')} 2`, styleName: 'text-right', width: '132' },
    { fieldName: 'col9', header: t('MSG_TXT_ACML'), styleName: 'text-right', width: '132' },
    { fieldName: 'col10', header: t('MSG_TXT_EDUC'), styleName: 'text-right', width: '132' },
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
      items: ['col2', 'col3', 'col4', 'col5'],
    },
    {
      header: t('MSG_TXT_EST_SVC_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col6', 'col7', 'col8', 'col9', 'col10'],
    },
  ]);

  data.setRows([
    { col1: '예상수수료', col2: '1,234,500', col3: '1,234,500', col4: '123,450', col5: '123,450', col6: '123,450', col7: '123,450', col8: '123,450', col9: '123,450', col10: '123,450' },
    { col1: '합계', col2: '-', col3: '-', col4: '-', col5: '1,234,500', col6: '-', col7: '-', col8: '-', col9: '-', col10: '1,234,500' },
  ]);
});

const initGrdSaleHist = defineGrid((data, view) => {
  const fields = [{ fieldName: 'col1' }, { fieldName: 'col2' }, { fieldName: 'col3' }, { fieldName: 'col4' }, { fieldName: 'col5' }, { fieldName: 'col6' }, { fieldName: 'col7' }, { fieldName: 'col8' }, { fieldName: 'col9' }, { fieldName: 'col10' }];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CONF_COMPL_DT'), width: '155', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col2', header: t('MSG_TXT_NST_COMP_DT'), width: '155', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col3', header: t('MSG_TXT_CST_CD'), width: '155', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_CNTRT'), width: '155', styleName: 'text-left' },
    { fieldName: 'col5', header: t('MSG_TXT_PRDT_NM'), width: '155', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_PRDT_CODE'), width: '155', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_PRDT_GUBUN'), width: '155', styleName: 'text-left' },
    { fieldName: 'col8', header: t('MSG_TXT_CONTR_TYPE'), width: '155', styleName: 'text-left' },
    { fieldName: 'col9', header: t('MSG_TXT_PD_ACC_CNT'), width: '155', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_PD_ACC_CNT'), width: '155', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-10-24', col2: '-', col3: '2022-1234567', col4: '김교원', col5: '비데', col6: 'BM350', col7: '렌탈', col8: '일반', col9: '1', col10: '1' },
    { col1: '2022-10-21', col2: '2022-10-22', col3: '2022-1234567', col4: '이교원', col5: '청정기', col6: 'AK316', col7: '일시불', col8: '일반', col9: '1', col10: '1' },
    { col1: '2022-10-24', col2: '-', col3: '2022-1234567', col4: '김교원', col5: '비데', col6: 'BM350', col7: '렌탈', col8: '일반', col9: '1', col10: '1' },
    { col1: '2022-10-21', col2: '2022-10-22', col3: '2022-1234567', col4: '이교원', col5: '청정기', col6: 'AK316', col7: '일시불', col8: '일반', col9: '1', col10: '1' },
    { col1: '2022-10-21', col2: '2022-10-22', col3: '2022-1234567', col4: '이교원', col5: '청정기', col6: 'AK316', col7: '일시불', col8: '일반', col9: '1', col10: '1' },
  ]);
});
</script>
