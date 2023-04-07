<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteSecProductMgtMUninstall - 삼성전자 상품관리
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.04.05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 삼성전자 상품관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
    <kw-tabs model-value="1">
      <kw-tab
        name="1"
        :label="$t('MSG_TXT_NOT_INSTL')"
      />
      <kw-tab
        name="2"
        :label="$t('MSG_TXT_DLVRY')"
      />
      <kw-tab
        name="3"
        :label="$t('MSG_TXT_DTRM_DATE')"
      />
      <kw-tab
        name="4"
        :label="$t('MSG_TXT_RSV_DATE')"
      />
      <kw-tab
        name="5"
        :label="$t('MSG_TXT_FRISU_AS')"
      />
    </kw-tabs>
    <kw-tab-panels model-value="1">
      <kw-tab-panel name="1">
        <kw-search>
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_APPL_PRD')"
            >
              <kw-date-range-picker rules="date_range_months:1" />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_CNTR_NO')"
            >
              <kw-input />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_CNTOR_NM')"
            >
              <kw-input />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_BLG_CD')"
            >
              <kw-input />
              <span>~</span>
              <kw-input />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info :total-count="100" />
            </template>
            <kw-btn
              icon="download_off"
              secondary
              dense
              class="mr8"
              :label="$t('MSG_BTN_TEMP_DOWN')"
            />
            <kw-btn
              icon="upload_on"
              secondary
              dense
              class="mr8"
              :label="$t('MSG_BTN_EXCEL_UP')"
            />
          </kw-action-top>
          <kw-grid
            :visible-rows="10"
            @init="initGrid"
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
const initGrid = defineGrid((data, view) => {
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CNTR_NO'), width: '136', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_CNTOR_NM'), width: '136', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_ORD_NO'), width: '137', styleName: 'text-center' },
    { fieldName: 'col4', header: `${t('MSG_TXT_PRDT_NM')}(${t('MSG_TXT_TXT_MSG_PD_HCLSF_ID')})`, width: '197' },
    { fieldName: 'col5', header: `${t('MSG_TXT_PRDT_NM')}(${t('MSG_TXT_TXT_MSG_PD_LCLSF_ID')})`, width: '198' },
    { fieldName: 'col6', header: t('MSG_TXT_CNTRCT_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col7', header: t('MSG_TXT_INSTLATN_RSRVATN_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col8', header: t('MSG_TXT_PRTNR_AFFILITN_CD'), width: '147', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_PARTNER_NO'), width: '149', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_PTNR_NAME'), width: '148', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_NOTE'), width: '366' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '1234-1234567', col2: '김고객', col3: '1234567890', col4: '환경가전', col5: '건조기', col6: '20221001', col7: '20221005', col8: 'A123456', col9: 'A123456', col10: '김판매', col11: '미설치 된 사유 내용이 들어갑니다.' },
  ]);
});
</script>
<style scoped>
</style>
