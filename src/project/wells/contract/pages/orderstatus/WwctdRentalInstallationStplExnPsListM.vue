<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTD
2. 프로그램 ID : WwctdRentalInstallationStplExnPsListM - 렌탈 약정 만료 및 멤버십 현황
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.01.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈 약정 만료 및 멤버십 현황 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_EXP_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.cntrPdEndDt.startDt"
            v-model:to="searchParams.cntrPdEndDt.endDt"
            rules="date_range_months:1"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_PDGRP')">
          <kw-select
            v-model="searchParams.basePdGrp"
            :options="['대분류 전체','B','C']"
          />
          <span>/</span>
          <kw-select
            :options="['중분류 전체','B','C']"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_PRDT_CODE')">
          <kw-input
            v-model="searchParams.basePdCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_PRDT_NM')">
          <kw-input
            v-model="searchParams.pdNm"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_EXCLD_CANC')">
          <kw-field
            v-model="searchParams.cntrDtlStatCd"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                label=""
                val="1"
              />
            </template>
          </kw-field>
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <span>{{ t('MSG_TXT_COM_TOT') }}</span> <span class="accent pl4">{{ pageInfo.totalCount }}</span>
        </template>
        <kw-btn
          icon="download_on"
          :disable="pageInfo.totalCount === 0"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
// import { gridUtil, defineGrid, getComponentType, useDataService, useMeta, codeUtil, useGlobal } from 'kw-lib';
import { defineGrid, useMeta, getComponentType, useDataService, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { getConfig } = useMeta();
const dataService = useDataService();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchParams = ref({
  cntrPdEndDt: {
    startDt: '',
    endDt: '',
  },
  basePdGrp: '',
  basePdCd: '',
  pdNm: '',
  cntrDtlStatCd: [],
});
function initDate() {
  const today = new Date();
  let date = today.getDate();
  let month = today.getMonth() + 1;
  const year = today.getFullYear();
  if (month < 10) {
    month = `0${month}`;
  }
  if (date < 10) {
    date = `0${date}`;
  }
  searchParams.value.cntrPdEndDt.startDt = `${year}${month}01`;
  searchParams.value.cntrPdEndDt.endDt = year + month + date;
}

let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/contract/expired-retention-contracts/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: 'rentalInstallationStplExpList',
    timePostfix: true,
    exportData: response.data,
  });
}

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get('/sms/wells/contract/expired-retention-contracts', { params: cachedParams });
  const { list: rentalData, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(rentalData);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

onMounted(async () => {
  await initDate();
});

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
    { fieldName: 'col1', header: t('MSG_TXT_CST_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_CST_NM'), width: '120', styleName: 'text-left' },
    { fieldName: 'col3', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_PRDT_NM'), width: '160', styleName: 'text-left' },
    { fieldName: 'col5', header: t('MSG_TXT_RENT_PRD_MN'), width: '120', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_LCK_IN_PRD_MN'), width: '120', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_DT_OF_SALE'), width: '120', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_MAND_DAYS'), width: '120', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_EXP_DT_1'), width: '120', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_CAN_CST_MAND_PRD_EXP_STAT'), width: '200', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_MEM_CNTR_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_MEM_SUBS_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_MEM_CANC_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_MEM_WTD_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_CNTOR_PHN_NUM'), width: '160', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_INST_PHN_NUM'), width: '160', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '60', col6: '36', col7: '20, 170, 707', col8: '20, 170, 707', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
  ]);
});
</script>

<style scoped>
</style>
