<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaReceiptBulkUploadMRental - 대량 접수자료 업로드
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.04.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 대량 접수자료 업로드
****************************************************************************************************
--->
<template>
  <kw-page>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
    <kw-tabs model-value="1">
      <kw-tab
        name="1"
        :label="$t('MSG_TXT_RECP_RENT')"
      />
      <kw-tab
        name="2"
        :label="$t('MSG_TXT_RECP_LMP_SUM_PMT')"
      />
      <kw-tab
        name="3"
        :label="$t('MSG_TXT_INSTALL')"
      />
    </kw-tabs>
    <kw-tab-panels model-value="1">
      <kw-tab-panel name="1">
        <kw-search :cols="4">
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_LOOKUP_PERIOD')"
              required
              :colspan="2"
            >
              <kw-select
                :label="$t('MSG_TXT_LOOKUP_PERIOD')"
                :model-value="[]"
                :options="['등록일', 'B', 'C', 'D']"
                rules="required"
                class="w187"
              />
              <kw-date-range-picker
                rules="date_range_required|date_range_months:1"
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_RGR_NM')">
              <kw-input />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_RGR_EMPNO')">
              <kw-input />
            </kw-search-item>
          </kw-search-row>

          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_PDGRP')"
              :colspan="2"
            >
              <kw-select
                :model-value="[]"
                :options="['대분류 전체', 'B', 'C', 'D']"
              />
              <kw-select
                :model-value="[]"
                :options="['중분류 전체', 'B', 'C', 'D']"
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_PRDT_CODE')">
              <kw-input />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_PRDT_NM')">
              <kw-input />
            </kw-search-item>
          </kw-search-row>
        </kw-search>
        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="50"
              />
              <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
            </template>

            <kw-btn
              icon="upload_on"
              dense
              secondary
              :label="$t('MSG_TXT_UPL_BLK_APP_DATA')"
            />
          </kw-action-top>

          <kw-grid
            name="grdMain"
            :visible-rows="1"
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
    { fieldName: 'col1', header: t('MSG_TXT_REG_FILE'), width: '133', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_RGST_DT'), width: '146', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col3', header: t('MSG_TXT_FST_RGST_USR'), width: '146', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_RGR_EMPNO'), width: '146', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_PRDT_CODE'), width: '128', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_PRDT_NM'), width: '290', styleName: 'text-left' },

    { fieldName: 'col7', header: t('MSG_TXT_RCP_D'), width: '128', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col8', header: t('MSG_TXT_CNTOR_NM'), width: '128', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_RGST_FEE'), width: '128', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_VAR_MNTHS'), width: '128', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_STL_DV'), width: '128', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_BIRTH_DATE'), width: '128', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col13', header: t('MSG_TXT_GENDER_MF'), width: '128', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_MPNO'), width: '128', styleName: 'text-center' },

    { fieldName: 'col15', header: t('MSG_TXT_ZIP'), width: '128', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_ADDR'), width: '275', styleName: 'text-left' },
    { fieldName: 'col17', header: `${t('MSG_TXT_FGPT')}1`, width: '128', styleName: 'text-center' },
    { fieldName: 'col18', header: `${t('MSG_TXT_FGPT')}2`, width: '128', styleName: 'text-center' },
    { fieldName: 'col19', header: `${t('MSG_TXT_FGPT')}3`, width: '128', styleName: 'text-center' },
    { fieldName: 'col20', header: t('MSG_TXT_SUSC_ORD_NO'), width: '128', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '다운로드', col2: '2022-10-10', col3: '김교원', col4: '1602591', col5: '1234', col6: '정수기 (10월 프로모션)', col7: '2022-10-10', col8: '김고객', col9: '100,000', col10: '60', col11: '3', col12: '1990-01-01', col13: '1', col14: '010-0000-0000', col15: '123-12', col16: '서울시 종로구 을지로 100길 10', col17: '커피캡슐', col18: '-', col19: '-', col20: '12345678' },

  ]);
});

</script>
