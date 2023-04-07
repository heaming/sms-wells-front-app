<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteSecProductMgtMReserveDate - 삼성전자 상품관리
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
    <kw-tabs model-value="4">
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
    <kw-tab-panels model-value="4">
      <kw-tab-panel name="4">
        <kw-search
          one-row
          :cols="2"
        >
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_RSV_DATE')"
              required
            >
              <kw-date-range-picker
                :label="$t('MSG_TXT_RSV_DATE')"
                rules="date_range_required|date_range_months:1"
              />
            </kw-search-item>

            <kw-search-item :label="$t('MSG_TXT_ORD_TYP')">
              <kw-option-group
                :model-value="'전체'"
                type="radio"
                :options="['전체', '렌탈', '일시불']"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <template #left>
              <span>총</span>
              <span class="accent pl4">100건</span>
            </template>
            <kw-btn
              icon="download_on"
              dense
              secondary
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              @click="onClickExcelDownload"
            />
          </kw-action-top>
          <kw-grid
            :visible-rows="1"
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
    { fieldName: 'col12' },
    { fieldName: 'col13' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_OG_CD'), width: '137', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_BRNCH_MNGR_NO'), width: '136', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_PRTNR_EMP_NO'), width: '136', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_PTNR_NAME'), width: '136', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_CNTR_NO'), width: '168', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_CNTOR_NM'), width: '136', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_PRDT_NM'), width: '260.4' },
    { fieldName: 'col8', header: t('MSG_TXT_PRDT_CODE'), width: '136', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_SAMSUNG_ORDR_NO'), width: '168', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_ORD_TYP'), width: '168', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_RSV_DATE'), width: '138', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col12', header: t('MSG_TXT_STOCK_DT'), width: '138', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col13', header: t('MSG_TXT_UPDATE_DT'), width: '212.7', styleName: 'text-center', datetimeFormat: 'datetime' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: 'X910080', col2: '1653226', col3: '1653227', col4: 'K멤버스', col5: '1234-1234567', col6: '김계약', col7: '비스포크 세탁기 실버', col8: '1234', col9: '1234567890', col10: '렌탈', col11: '2022-10-01', col12: '2022-10-20', col13: '2022-10-01 09:23:10' },
  ]);
});

</script>

<style scoped>
</style>
