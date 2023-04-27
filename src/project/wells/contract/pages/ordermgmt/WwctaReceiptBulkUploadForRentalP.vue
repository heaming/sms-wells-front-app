<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaReceiptBulkUploadForRentalP - 렌탈 대량 접수자료 업로드(팝업)
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.04.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈 대량 접수자료 업로드(팝업)
****************************************************************************************************
--->
<template>
  <kw-popup
    size="lg"
  >
    <kw-search
      :cols="2"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CTT_BZS')"
        >
          <kw-select
            model-value="[선택]"
            :options="['선택', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CMPNY_CD')"
        >
          <kw-select
            model-value="[선택]"
            :options="['선택', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-action-top class="mt30">
      <template #left>
        <kw-paging-info
          :total-count="128"
        />
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>

      <kw-btn
        icon="download_off"
        dense
        :label="$t('MSG_BTN_TEMP_DOWN')"
        @click="onClickExcelDownload"
      />
      <kw-btn
        icon="download_on"
        dense
        :label="$t('MSG_BTN_EXCEL_UP')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      name="grdMain"
      :visible-rows="3"
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_PROD_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_RCP_D'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col3', header: t('MSG_TXT_IST_NM'), width: '100' },
    { fieldName: 'col4', header: t('MSG_TXT_RGST_FEE'), width: '100', styleName: 'text-right' },
    { fieldName: 'col5', header: t('MSG_TXT_VAR_MNTHS'), width: '100', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_STL_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_DSC_SYST'), width: '100', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_BIRTH_DATE'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col9', header: t('MSG_TXT_GENDER_MF'), width: '140', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_MPNO'), width: '140', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_TEL_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_ZIP'), width: '120', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_ADDR'), width: '240', styleName: 'text-center' },
    { fieldName: 'col14', header: `${t('MSG_TXT_FGPT')}1`, width: '120', styleName: 'text-center' },
    { fieldName: 'col15', header: `${t('MSG_TXT_FGPT')}2`, width: '120', styleName: 'text-center' },
    { fieldName: 'col16', header: `${t('MSG_TXT_FGPT')}3`, width: '120', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_SUSC_ORD_NO'), width: '120', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '4725', col2: '2022-10-01', col3: '김고객', col4: '100,000', col5: '60', col6: '3', col7: '-', col8: '1990-01-01', col9: '1990-01-01', col10: '010-0000-0000', col11: '02-000-0000', col12: '123-12', col13: '서울시 종로구 을지로 100길 10', col14: '-', col15: '-', col16: '-', col17: '12345678' },
    { col1: '4725', col2: '2022-10-01', col3: '김고객', col4: '100,000', col5: '60', col6: '3', col7: '-', col8: '1990-01-01', col9: '1990-01-01', col10: '010-0000-0000', col11: '02-000-0000', col12: '123-12', col13: '서울시 종로구 을지로 100길 10', col14: '-', col15: '-', col16: '-', col17: '12345678' },
    { col1: '4725', col2: '2022-10-01', col3: '김고객', col4: '100,000', col5: '60', col6: '3', col7: '-', col8: '1990-01-01', col9: '1990-01-01', col10: '010-0000-0000', col11: '02-000-0000', col12: '123-12', col13: '서울시 종로구 을지로 100길 10', col14: '-', col15: '-', col16: '-', col17: '12345678' },
  ]);
});
</script>
