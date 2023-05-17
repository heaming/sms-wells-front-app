<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbOrderBulkChangeMgtMSinlePayment - 일시불 일괄변경 관리
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.04.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 일시불 일괄변경 관리
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="2"
    one-row
  >
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_ORD_NO')">
        <kw-input />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_RFLCTN_DT')">
        <kw-date-picker />
      </kw-search-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="pageInfo.totalCount" />
        <span class="ml8">{{ t('MSG_TXT_UNIT_CASES') }}</span>
      </template>
      <kw-btn
        :label="$t('MSG_TXT_BTCH_CHNG_REG')"
        primary
        dense
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRefPayment"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      name="grdPayment"
      @init="initGrdPayment"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useMeta } from 'kw-lib';

const { t } = useI18n();

const { getConfig } = useMeta();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRefPayment = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdPayment = defineGrid((data, view) => {
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_ORD_NO'), width: '152', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_CST_NM'), width: '117', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_RVE_CD'), width: '117', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_PRDT_CODE'), width: '117', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_SELLER_PERSON'), width: '117', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_RVE_CD'), width: '117', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_PRDT_NM'), width: '264' },
    { fieldName: 'col8', header: t('MSG_TXT_RCP_D'), width: '117', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col9', header: t('MSG_TXT_INST_DT'), width: '117', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col10', header: t('MSG_TXT_CAN_D'), width: '117', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_COMP_D'), width: '117', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_DUEDT'), width: '117', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col13', header: t('MSG_TXT_PRFMC_CNCL_DT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col14', header: `KIWI${t('MSG_TXT_REQD_D')}`, width: '117', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_CNTCT_NM'), width: '264' },
    { fieldName: 'col16', header: t('MSG_TXT_RSV_YN'), width: '117', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_PD_ACC_CNT'), width: '117', styleName: 'text-right' },
    { fieldName: 'col18', header: t('MSG_TXT_RECOG_AMT_KRW'), width: '117', styleName: 'text-right' },
    { fieldName: 'col19', header: `${t('MSG_TXT_RECOG_RT')}(%)`, width: '117', styleName: 'text-right' },
    { fieldName: 'col20', header: `${t('MSG_TXT_PD_STD_FEE')}(${t('MSG_TXT_CUR_WON')})`, width: '131', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_FXAM_YN'), width: '117', styleName: 'text-center' },
    { fieldName: 'col22', header: t('MSG_TXT_ISTM_FNT'), width: '117', styleName: 'text-right' },
    { fieldName: 'col23', header: t('MSG_TXT_INSTLMNT_PYMNT'), width: '117', styleName: 'text-right' },
    { fieldName: 'col24', header: t('MSG_TXT_MEMBRSHP_TRSFR'), width: '117', styleName: 'text-right' },
    { fieldName: 'col25', header: t('MSG_TXT_MEMBRSHP_LGDR'), width: '117', styleName: 'text-center' },
    { fieldName: 'col26', header: t('MSG_TXT_FRISU_MSH'), width: '117', styleName: 'text-right' },
    { fieldName: 'col27', header: t('MSG_TXT_FRISU_AS'), width: '117', styleName: 'text-right' },
    { fieldName: 'col28', header: t('MSG_TXT_EV_CD'), width: '117', styleName: 'text-center' },
    { fieldName: 'col29', header: t('MSG_TXT_RGST_DT'), width: '117', styleName: 'text-center' },
    { fieldName: 'col30', header: t('MSG_TXT_FST_RGST_USR'), width: '117', styleName: 'text-center' },
    { fieldName: 'col31', header: t('MSG_TXT_FNL_MDFC_D'), width: '117', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col32', header: t('MSG_TXT_FNL_MDFC_USR'), width: '117', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-1234567', col2: '김고객', col3: '12345', col4: '1234', col5: '김판매', col6: '12345', col7: '웰스(KWW-5100)', col8: '2022-10-10', col9: '2020-10-01', col10: '-', col11: '-', col12: '2020-10-01', col13: '-', col14: '-', col15: '고객접촉OK! 컨택완료!', col16: 'Y', col17: '0', col18: '1,600,000', col19: '100', col20: '0', col21: 'N', col22: '1', col23: '2', col24: '50', col25: 'Y', col26: '50', col27: '50', col28: 'F', col29: '2022-10-21', col30: '김교원', col31: '2022-10-21', col32: '김교원' },

  ]);
});
</script>
<style scoped>
</style>
