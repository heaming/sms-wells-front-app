<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebB2bFeeCreationM - B2B 수수료 생성관리
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.03.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- B2B 수수료 생성관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            :label="$t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_TASK_DIV')"
          required
        >
          <kw-option-group
            :model-value="'순주문'"
            :label="$t('MSG_TXT_TASK_DIV')"
            type="radio"
            :options="['순주문', '수수료']"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <h3>$22년 10월$ 총판 수수료 생성 진행상황</h3>
          <kw-btn
            secondary
            dense
            :label="$t('MSG_TXT_RERUN_PROC')"
            class="ml8"
          />
        </template>
      </kw-action-top>
      <kw-stepper
        v-model="stepInitNum"
        alternative-labels
      >
        <kw-step
          :name="1"
          :title="$t('MSG_TXT_PERF_AGRG')"
          :done="stepInitNum > 1"
          prefix="1"
        />
        <kw-step
          :name="2"
          :title="`${t('MSG_TXT_FEE')}\n${t('MSG_TXT_CRT')}`"
          :done="stepInitNum > 2"
          prefix="2"
          :active-icon="'write'"
          :tooltip="'클릭하여 $수수료생성$를(을) 진행하세요.'"
        />
        <kw-step
          :name="3"
          :title="`${t('MSG_TXT_RDS')}\n${t('MSG_TXT_RV')}`"
          :done="stepInitNum > 7"
          prefix="3"
        />

        <kw-step-panel :name="2">
          <kw-action-top class="mt40">
            <template #left>
              <kw-paging-info :total-count="123456" />
            </template>
            <kw-btn
              dense
              secondary
              :label="$t('MSG_BTN_HIS_MGT')"
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
            :visible-rows="6"
            @init="initGrdMain"
          />
        </kw-step-panel>
      </kw-stepper>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid } from 'kw-lib';

const { t } = useI18n();

const stepInitNum = ref(2);

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [{ fieldName: 'col1' }, { fieldName: 'col2' }, { fieldName: 'col3' }, { fieldName: 'col4' }, { fieldName: 'col5' }, { fieldName: 'col6' }, { fieldName: 'col7' }, { fieldName: 'col8' }, { fieldName: 'col9' }, { fieldName: 'col10' }, { fieldName: 'col11' }, { fieldName: 'col12' }, { fieldName: 'col13' }, { fieldName: 'col14' }, { fieldName: 'col15' }, { fieldName: 'col16' }, { fieldName: 'col17' }, { fieldName: 'col18' }];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_BLG'), width: '127', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_SELLER_PERSON'), width: '98', styleName: 'text-left ' },
    { fieldName: 'col3', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '127', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_CNTR_DTL_NO'), width: '127', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_CUST_STMT'), width: '98', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_PRDT_CODE'), width: '127', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_PRDT_NM'), width: '179', styleName: 'text-left' },
    { fieldName: 'col8', header: t('MSG_TXT_PD_DC_CLASS'), width: '98', styleName: 'text-right' },
    { fieldName: 'col9', header: t('MSG_TXT_DISC_CODE'), width: '98', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_DSC_SYST'), width: '98', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_COMBI_DV'), width: '98', styleName: 'text-right' },
    { fieldName: 'col12', header: t('MSG_TXT_USWY_DV'), width: '98', styleName: 'text-right' },
    { fieldName: 'col13', header: t('MSG_TXT_MGT_TYP'), width: '98', styleName: 'text-left' },
    { fieldName: 'col14', header: t('MSG_TXT_VST_PRD'), width: '98', styleName: 'text-right' },
    { fieldName: 'col15', header: t('MSG_TXT_RCPDT'), width: '127', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_SL_DT'), width: '127', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_CANC_DT'), width: '127', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_NUM_OF_NEW_CASES'), width: '127', styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: 'Z950010', col2: '총판10', col3: '1607624', col4: '2022-4640868', col5: '홍길동', col6: '4512', col7: 'WN652NWR', col8: '3', col9: '6', col10: '3', col11: '18', col12: '2', col13: '2-업소', col14: '3', col15: '22-10-24', col16: '22-10-24', col17: '22-10-25', col18: '123,450' },
    { col1: 'Z950010', col2: '총판10', col3: '1607624', col4: '2022-4640868', col5: '홍길동', col6: '4512', col7: 'WN652NWR', col8: '3', col9: '6', col10: '3', col11: '18', col12: '2', col13: '2-업소', col14: '3', col15: '22-10-24', col16: '22-10-24', col17: '22-10-25', col18: '123,450' },
    { col1: 'Z950010', col2: '총판10', col3: '1607624', col4: '2022-4640868', col5: '홍길동', col6: '4512', col7: 'WN652NWR', col8: '3', col9: '6', col10: '3', col11: '18', col12: '2', col13: '2-업소', col14: '3', col15: '22-10-24', col16: '22-10-24', col17: '22-10-25', col18: '123,450' },
    { col1: 'Z950010', col2: '총판10', col3: '1607624', col4: '2022-4640868', col5: '홍길동', col6: '4512', col7: 'WN652NWR', col8: '3', col9: '6', col10: '3', col11: '18', col12: '2', col13: '2-업소', col14: '3', col15: '22-10-24', col16: '22-10-24', col17: '22-10-25', col18: '123,450' },
    { col1: 'Z950010', col2: '총판10', col3: '1607624', col4: '2022-4640868', col5: '홍길동', col6: '4512', col7: 'WN652NWR', col8: '3', col9: '6', col10: '3', col11: '18', col12: '2', col13: '2-업소', col14: '3', col15: '22-10-24', col16: '22-10-24', col17: '22-10-25', col18: '123,450' },
    { col1: 'Z950010', col2: '총판10', col3: '1607624', col4: '2022-4640868', col5: '홍길동', col6: '4512', col7: 'WN652NWR', col8: '3', col9: '6', col10: '3', col11: '18', col12: '2', col13: '2-업소', col14: '3', col15: '22-10-24', col16: '22-10-24', col17: '22-10-25', col18: '123,450' },
  ]);
});
</script>
