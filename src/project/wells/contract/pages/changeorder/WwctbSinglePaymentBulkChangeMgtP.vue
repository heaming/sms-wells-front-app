<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbSinglePaymentBulkChangeMgtP - 주문일괄변경 관리
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.04.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 주문일괄변경 관리
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <kw-form
      :cols="3"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PROCS_DV')"
          required
        >
          <kw-select
            :label="$t('MSG_TXT_PROCS_DV')"
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
            multiple
            rules="required"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_CH_RSON')"
          required
          :colspan="2"
        >
          <kw-input
            :label="$t('MSG_TXT_CH_RSON')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_COMP_D')"
          required
          hint="KIWI철거일자와 같은날짜로 변경가능합니다."
        >
          <kw-date-picker
            :label="$t('MSG_TXT_COMP_D')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="0" />
        <ul class="kw-notification ml10">
          <li>
            주문번호 뒷번호, 7자리가 아니여도 앞에 0을 입력하지 않습니다.
          </li>
        </ul>
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
    </kw-action-top>

    <kw-grid
      name="grdMain"
      :visible-rows="2"
      @init="initGrdMain"
    />
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
      />
      <kw-btn
        primary
        :label="$t('MSG_BTN_RGST')"
      />
    </template>
  </kw-popup>
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CNTR_NO'), width: '152', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_CNTOR_NM'), width: '117', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_PRDT_CODE'), width: '117', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_PRDT_NM'), width: '229.8', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_INST_DT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col6', header: `KIWI${t('MSG_TXT_REQD_D')}`, width: '117', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_CAN_D'), width: '117', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_COMP_D'), width: '117', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_DUEDT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_CNTCT_NM'), width: '165', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_PD_ACC_CNT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_RECOG_AMT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_RECOG_RT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_ISTM_FNT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_MEMBRSHP_TRSFR'), width: '117', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_FRISU_MSH'), width: '117', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_FRISU_AS'), width: '117', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_EV_CD'), width: '117', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-6637881', col2: '김고객', col3: '1234', col4: '1234', col5: '', col6: '', col7: '', col8: '', col9: '', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '', col17: '', col18: '', col19: '', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '', col26: '', col27: '' },
  ]);
});
</script>
