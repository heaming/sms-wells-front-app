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
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_EXP_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.cntrPdEnddtStrtdt"
            v-model:to="searchParams.cntrPdEnddtEnddt"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_PDGRP')">
          <kw-select
            v-model="searchParams.pdMclsfId"
            :options="['대분류 전체','B','C']"
          />
          <span>/</span>
          <kw-select
            v-model="searchParams.pdHclsfId"
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
            v-model="searchParams.isExcdCan"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                label=""
                val="Y"
              />
            </template>
          </kw-field>
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="pageInfo.totalCount" />
          <span class="ml8">(단위:개월)</span>
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
        name="grdMain"
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
import { defineGrid, getComponentType, gridUtil, useDataService, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { getConfig } = useMeta();
const dataService = useDataService();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const now = dayjs();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchParams = ref({
  basePdCd: '',
  cntrPdEnddtStrtdt: now.startOf('month').format('YYYYMMDD'),
  cntrPdEnddtEnddt: now.format('YYYYMMDD'),
  pdMclsfId: '',
  pdHclsfId: '',
  pdNm: '',
  isExcdCan: 'N',
});
let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/contract/rental-renewals/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: 'rentalInstallationStplExpList',
    timePostfix: true,
    exportData: response.data,
  });
}

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get('/sms/wells/contract/expired-retention-contracts/paging', { params: cachedParams });
  const { list: rentalData, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(rentalData);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  const view = grdMainRef.value.getView();
  const col1 = view.columnByName('canDt');
  const col2 = view.columnByName('canCstDutyUseExprYn');
  if (cachedParams.isExcdCan.length) {
    view.setColumnProperty(col1, 'visible', false);
    view.setColumnProperty(col2, 'visible', false);
  } else {
    view.setColumnProperty(col1, 'visible', true);
    view.setColumnProperty(col2, 'visible', true);
  }
  console.log(cachedParams);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'basePdCd' },
    { fieldName: 'canCstDutyUseExprYn' },
    { fieldName: 'canDt' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrtCralIdvTno' },
    { fieldName: 'cntrtCralLocaraTno' },
    { fieldName: 'cntrtMexnoEncr' },
    { fieldName: 'cstKnm' },
    { fieldName: 'dutyUseDt' },
    { fieldName: 'exnDt' },
    { fieldName: 'istllCralIdvTno' },
    { fieldName: 'istllCralLocaraTno' },
    { fieldName: 'istllMexnoEncr' },
    { fieldName: 'istmMcn' },
    { fieldName: 'mshCanDt' },
    { fieldName: 'mshCntrDt' },
    { fieldName: 'mshCntrNo' },
    { fieldName: 'mshCntrSn' },
    { fieldName: 'mshWdwalDt' },
    { fieldName: 'pdNm' },
    { fieldName: 'recapDutyPtrmN' },
    { fieldName: 'slDt' },
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_RNT_CNTR_NO'), width: '135', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '101', styleName: 'text-center' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '127', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '284', styleName: 'text-left' },
    { fieldName: 'istmMcn', header: t('MSG_TXT_RENT_PRD_MN'), width: '143', styleName: 'text-right' },
    { fieldName: 'recapDutyPtrmN', header: t('MSG_TXT_LCK_IN_PRD_MN'), width: '161', styleName: 'text-right' },
    { fieldName: 'slDt', header: t('MSG_TXT_DT_OF_SALE'), width: '127', styleName: 'text-center' },
    { fieldName: 'dutyUseDt', header: t('MSG_TXT_MAND_DAYS'), width: '127', styleName: 'text-center' },
    { fieldName: 'exnDt', header: t('MSG_TXT_EXP_DT'), width: '127', styleName: 'text-center' },
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_D'), width: '127', styleName: 'text-left' },
    { fieldName: 'canCstDutyUseExprYn', header: t('MSG_TXT_CAN_CST_MAND_PRD_EXP_STAT'), width: '230' },
    { fieldName: 'mshCntrNo', header: t('MSG_TXT_MEM_CNTR_NO'), width: '135', styleName: 'text-center' },
    { fieldName: 'mshCntrDt', header: t('MSG_TXT_MEM_CNTR_DT_1'), width: '127', styleName: 'text-center' },
    { fieldName: 'mshCntrSn', header: t('MSG_TXT_MEM_SIGNUP'), width: '127', styleName: 'text-center' },
    { fieldName: 'mshCanDt', header: t('MSG_TXT_MEM_CANC_DT_1'), width: '127', styleName: 'text-center' },
    { fieldName: 'mshWdwalDt', header: t('MSG_TXT_MEM_WTDR_DT'), width: '127', styleName: 'text-center' },
    { fieldName: 'istllCralIdvTno', header: t('MSG_TXT_CNTRR_VAC_PH_NO'), width: '193', styleName: 'text-center' },
    { fieldName: 'istllCralLocaraTno', header: t('MSG_TXT_INSTR_PH_NO'), width: '176', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
});
</script>

<style scoped>
</style>
