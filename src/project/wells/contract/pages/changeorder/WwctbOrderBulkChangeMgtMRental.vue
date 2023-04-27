<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbOrderBulkChangeMgtMRental - 렌탈 일괄변경 관리
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.04.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈 일괄변경 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
    <kw-tabs model-value="1">
      <kw-tab
        name="1"
        :label="$t('MSG_TXT_RENTAL')"
      />
      <kw-tab
        name="2"
        :label="$t('MSG_TXT_MEM')"
      />
      <kw-tab
        name="3"
        :label="$t('MSG_TXT_SNGL_PMNT')"
      />
    </kw-tabs>
    <kw-tab-panels model-value="1">
      <kw-tab-panel name="1">
        <kw-search
          one-row
          :cols="2"
        >
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_PROCS_DV')"
              required
            >
              <kw-select
                :model-value="[]"
                :options="['조회', '입력']"
                rules="required"
              />
            </kw-search-item>

            <kw-search-item
              :label="$t('MSG_TXT_CLSF_DET')"
              required
            >
              <kw-select
                :model-value="['']"
                :options="['예정일자', 'B', 'C', 'D']"
                rules="required"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <kw-btn
              :label="$t('MSG_BTN_BK_RGST')"
              primary
              dense
            />
          </kw-action-top>
          <kw-grid
            name="grdMain"
            :visible-rows="10"
            @init="initGrdMain"
          />
        </div>
      </kw-tab-panel>
    </kw-tab-panels>
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
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CNTR_NO'), width: '176', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_CNTOR_NM'), width: '126', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_DUEDT'), width: '154', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_NOTE'), width: '658' },
    { fieldName: 'col5', header: t('MSG_TXT_FST_RGST_USR'), width: '139', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_RGST_DT'), width: '122', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_RGST_HH'), width: '122', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  // view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-0000000', col2: '김교원', col3: '2022-10-31', col4: '-', col5: '김웰스', col6: '2022-08-01', col7: '08:11:22' },
  ]);
});

</script>
<style scoped>
</style>
