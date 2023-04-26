<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaReceiptBulkUploadMInstallLocation - 대량 접수자료 업로드(설치처) 화면
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.04.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 대량 접수자료 업로드(설치처) 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
    <kw-tabs
      model-value="3"
    >
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
    <kw-tab-panels
      model-value="3"
    >
      <kw-tab-panel name="3">
        <kw-search :cols="4">
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_LOOKUP_PERIOD')"
              required
              :colspan="2"
            >
              <kw-select
                :label="$t('MSG_TXT_LOOKUP_PERIOD')"
                class="w187"
                :model-value="[]"
                :options="[$t('MSG_TXT_ADDR'), 'B', 'C', 'D']"
                rules="required"
              />
              <kw-date-range-picker
                rules="date_range_required|date_range_months:1"
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_RGR_NM')">
              <kw-input :label="$t('MSG_TXT_RGR_NM')" />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_RGR_EMPNO')">
              <kw-input :label="$t('MSG_TXT_RGR_EMPNO')" />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item :label="$t('MSG_TXT_ISTLC_ADDR')">
              <kw-input
                :label="$t('MSG_TXT_ISTLC_ADDR')"
                icon="search"
                clearable
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>
        <div class="result-area">
          <h3>{{ $t('MSG_TXT_RES_INQ') }}</h3>
          <kw-action-top>
            <template #left>
              <kw-paging-info :total-count="50" />
            </template>
            <kw-btn
              icon="upload_on"
              dense
              secondary
              :label="$t('MSG_TXT_UPL_BLK_APP_DATA')"
            />
          </kw-action-top>

          <kw-grid
            ref="grdMainRef"
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_REG_FILE'), width: '133', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_RGST_DT'), width: '146', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_FST_RGST_USR'), width: '146', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_RGR_EMPNO'), width: '134', styleName: 'text-center' },
    { fieldName: 'col5', header: `${t('MSG_TXT_DIV')} (1:일시불, 2:렌탈, 6:정기배송)`, width: '267', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_CST_Y'), width: '125', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_CST_CD'), width: '125', styleName: 'text-center' },
    { fieldName: 'col8', header: `${t('MSG_TXT_SERIAL_NUMBER')}(렌탈/일시불:0)`, width: '204', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_CST_NM'), width: '125', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_INST_DT'), width: '125', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_ZIP'), width: '128', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_ISTLC_ADDR'), width: '263', styleName: 'text-left' },
    { fieldName: 'col13', header: t('MSG_TXT_MPNO'), width: '128', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_TEL_NO'), width: '128', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '다운로드', col2: '2022-10-10', col3: '김교원', col4: '1602591', col5: '1', col6: '2022', col7: '1234567', col8: '1', col9: '김고객', col10: '2022-10-10', col11: '123-12', col12: '서울시 종로구 을지로 100길 10', col13: '010-0000-0000', col14: '02-000-0000' },
  ]);
});
</script>
