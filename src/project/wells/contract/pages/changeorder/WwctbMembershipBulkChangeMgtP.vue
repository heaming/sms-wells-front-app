<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbMembershipBulkChangeMgtP - 멤버십 일괄변경 등록 화면
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.04.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 멤버십 일괄변경 등록 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
    title="$t('MSG_TXT_MEM_BLK_CHNG')"
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
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CTT_CD')"
          required
        >
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
            multiple
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="0" />
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
      ref="grdMainRef"
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
import { getComponentType, defineGrid } from 'kw-lib';

const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

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
    { fieldName: 'col28' },
    { fieldName: 'col29' },
    { fieldName: 'col30' },
    { fieldName: 'col31' },
    { fieldName: 'col32' },
    { fieldName: 'col33' },
    { fieldName: 'col34' },
    { fieldName: 'col35' },
    { fieldName: 'col36' },
    { fieldName: 'col37' },
    { fieldName: 'col38' },
    { fieldName: 'col39' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CNTR_NO'), width: '152', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_SERIAL_NUMBER'), width: '117.8', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_CNTOR_NM'), width: '117', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_SLS_CAT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_SEL_TYPE'), width: '117', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_SELLER_PERSON'), width: '117', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_RVE_CD'), width: '117', styleName: 'text-center' },
    { fieldName: 'col8', header: `KIWI${t('MSG_TXT_REQD_D')}`, width: '117', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_RECPETN_DT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_INST_DT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_DT_OF_SALE'), width: '117', styleName: 'text-center' },
    { fieldName: 'col12', header: `BS ${t('MSG_TXT_CYCL')}`, width: '117', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_USWY_DV'), width: '117', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_PRDT_CODE'), width: '117', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_PRDT_NM'), width: '224', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_MEM_DUES'), width: '117', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_PY_MTHD'), width: '117', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_MEM_FEE'), width: '117', styleName: 'text-center' },
    { fieldName: 'col19', header: t('MSG_TXT_MSH_DV'), width: '117', styleName: 'text-center' },
    { fieldName: 'col20', header: t('MSG_TXT_MEM_PRD'), width: '117', styleName: 'text-center' },
    { fieldName: 'col21', header: t('MSG_TXT_DTRM_DATE'), width: '117', styleName: 'text-center' },
    { fieldName: 'col22', header: t('MSG_TXT_CAN_D'), width: '117', styleName: 'text-center' },
    { fieldName: 'col23', header: t('MSG_TXT_DUEDT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col24', header: t('MSG_TXT_SUBS_DT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col25', header: t('MSG_TXT_WTDR_DT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col26', header: t('MSG_TXT_VST_PRD'), width: '117', styleName: 'text-center' },
    { fieldName: 'col27', header: t('MSG_TXT_CTT_CD_NM'), width: '117', styleName: 'text-center' },
    { fieldName: 'col28', header: t('MSG_TXT_CTT_ICHR'), width: '117', styleName: 'text-center' },
    { fieldName: 'col29', header: `${t('MSG_TXT_PRDT_GUBUN')}1`, width: '117', styleName: 'text-center' },
    { fieldName: 'col30', header: `${t('MSG_TXT_PRDT_GUBUN')}2`, width: '117', styleName: 'text-center' },
    { fieldName: 'col31', header: t('MSG_TXT_FXAM_YN'), width: '117', styleName: 'text-center' },
    { fieldName: 'col32', header: t('MSG_TXT_PD_STD_FEE'), width: '117', styleName: 'text-center' },
    { fieldName: 'col33', header: t('MSG_TXT_PD_DC_CLASS'), width: '117', styleName: 'text-center' },
    { fieldName: 'col34', header: t('MSG_TXT_DISC_CODE'), width: '117', styleName: 'text-center' },
    { fieldName: 'col35', header: t('MSG_TXT_GRP_DV'), width: '117', styleName: 'text-center' },
    { fieldName: 'col36', header: t('MSG_TXT_RGST_DT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col37', header: t('MSG_TXT_FST_RGST_USR'), width: '117', styleName: 'text-center' },
    { fieldName: 'col38', header: t('MSG_TXT_FNL_MDFC_D'), width: '117', styleName: 'text-center' },
    { fieldName: 'col39', header: t('MSG_TXT_FNL_MDFC_USR'), width: '117', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-6637881', col2: '1', col3: '김고객', col4: '2', col5: '7', col6: '김판매', col7: '12345', col8: '-', col9: '2022-10-10', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '', col17: '', col18: '', col19: '', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '', col26: '', col27: '', col28: '', col29: '', col30: '', col31: '', col32: '', col33: '', col34: '', col35: '', col36: '', col37: '', col38: '', col39: '김교원' },
  ]);
});
</script>
