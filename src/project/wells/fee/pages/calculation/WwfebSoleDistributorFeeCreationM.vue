<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebSoleDistributorFeeCreationM - 총판 수수료 생성관리
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.03.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 총판 수수료 생성관리
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
            :label="$t('MSG_TXT_TASK_DIV')"
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
          :title="$t('MSG_TXT_FEE_GNRTD')"
          :done="stepInitNum > 2"
          prefix="2"
          :active-icon="'write'"
          :tooltip="'클릭하여 $수수료생성$를(을) 진행하세요.'"
        />
        <kw-step
          :name="3"
          :title="$t('MSG_TXT_GRNT_DEP_ERN')"
          :done="stepInitNum > 3"
          prefix="3"
        />

        <kw-step-panel :name="2">
          <kw-action-top class="mt40">
            <template #left>
              <kw-paging-info
                :total-count="123456"
              />
            </template>
            <kw-btn
              icon="download_on"
              dense
              secondary
              :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
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
    { fieldName: 'col1', header: t('MSG_TXT_BLG_CD'), width: '127', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_CORP_NAME'), width: '127', styleName: 'text-left ' },
    { fieldName: 'col3', header: t('MSG_TXT_SELLER_PERSON'), width: '98', styleName: 'text-left' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '127', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_CST_CD'), width: '127', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_CUST_STMT'), width: '98', styleName: 'text-left' },
    { fieldName: 'col7', header: t('MSG_TXT_PRDT_CODE'), width: '127', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_PRDT_NM'), width: '179', styleName: 'text-left' },
    { fieldName: 'col9', header: t('MSG_TXT_PD_DC_CLASS'), width: '98', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_DISC_CODE'), width: '98', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_DSC_SYST'), width: '98', styleName: 'text-right' },
    { fieldName: 'col12', header: t('MSG_TXT_COMBI_DV'), width: '98', styleName: 'text-right' },
    { fieldName: 'col13', header: t('MSG_TXT_USWY_DV'), width: '98', styleName: 'text-right' },
    { fieldName: 'col14', header: t('MSG_TXT_MGT_TYP'), width: '98', styleName: 'text-left' },
    { fieldName: 'col15', header: t('MSG_TXT_VST_PRD'), width: '98', styleName: 'text-right' },
    { fieldName: 'col16', header: t('MSG_TXT_RCPDT'), width: '127', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_SL_DT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col18', header: t('MSG_TXT_CANC_DT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col19', header: t('MSG_TXT_FEE'), width: '127', styleName: 'text-right' },
    { fieldName: 'col20', header: t('MSG_TXT_NUM_OF_NEW_CASES'), width: '92', styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450', col20: '1' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450', col20: '1' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450', col20: '1' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450', col20: '1' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450', col20: '1' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450', col20: '1' },
  ]);
});

</script>

<style>

</style>
