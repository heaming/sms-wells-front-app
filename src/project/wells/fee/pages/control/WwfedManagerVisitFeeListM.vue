<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FED
2. 프로그램 ID : WwfedManagerVisitFeeListM - 웰스매니저 방문수수료 현황
3. 작성자 : seoin.jeon
4. 작성일 : 2023.03.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 웰스매니저 방문수수료 현황
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
          :colspan="2"
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_DV')"
          required
        >
          <kw-select
            v-model="searchParams.inqrDv"
            :options="[t('MSG_TXT_MANAGEMENT_DEPARTMENT'), t('MSG_TXT_RGNL_GRP')
                       , t('MSG_TXT_BRANCH'), t('MSG_TXT_INDV')]"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          colspan="2"
        >
          <kw-select
            v-model="searchParams.ogLevl1"
            :options="['A', 'B', 'C', 'D']"
          />
          <kw-select
            v-model="searchParams.ogLevl2"
            :options="['A', 'B', 'C', 'D']"
          />
          <kw-select
            v-model="searchParams.ogLevl3"
            :options="['A', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item
          v-model="searchParams.no"
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
          <span class="kw-fc--error ml8">* 엑셀 다운로드는 조회내역 전체를 내려받습니다.</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount===0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdVisitFeeRef"
        name="grdVisitFee"
        :visible-rows="10"
        @init="initGridMain"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService } from 'kw-lib';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const totalCount = ref(0);
const grdVisitFeeRef = ref(getComponentType('KwGrid'));
const searchParams = ref({
  baseYm: dayjs().subtract(1, 'month').format('YYYY-MM'),
  inqrDv: t('MSG_TXT_MANAGEMENT_DEPARTMENT'),
  ogLevl1: 'A',
  ogLevl2: 'A',
  ogLevl3: 'A',
  no: '',
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/manager-visit-fees', searchParams.value);

  totalCount.value = res.data.length;

  const view = grdVisitFeeRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdVisitFeeRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '154', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_CST_CD'), width: '106', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_PRDT_CODE'), width: '106', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_PRDT_NM'), width: '300', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_BS') + t('MSG_TXT_PDGRP'), width: '112', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_BAS_FEE'), width: '122', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col8', header: t('MSG_TXT_VST_FEE'), width: '122', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col9', header: t('MSG_TXT_VST_RGLVL'), width: '106', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_VST_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col11', header: t('MSG_TXT_CNCL_YN'), width: '106', styleName: 'text-center' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.checkBar.visible = false;
});

</script>
