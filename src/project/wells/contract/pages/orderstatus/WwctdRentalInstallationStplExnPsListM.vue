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
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.cntrPdEnddtStrtdt"
            v-model:to="searchParams.cntrPdEnddtEnddt"
            :label="$t('MSG_TXT_EXP_DT')"
            rules="date_range_required"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_PDGRP')">
          <kw-select
            v-model="searchParams.pdHclsfId"
            :options="['대분류 전체','B','C']"
          />
          <span>/</span>
          <kw-select
            v-model="searchParams.pdMclsfId"
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
          <kw-checkbox
            v-model="searchParams.isExcdCan"
            val="Y"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <span>{{ $t('MSG_TXT_COM_TOT') }}</span>
          <span class="accent pl4">{{ totalCount }}{{ $t('MSG_TXT_CNT') }}</span>
          <span class="ml8">(단위:개월)</span>
        </template>
        <kw-btn
          icon="download_on"
          :disable="totalCount === 0"
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

const grdMainRef = ref(getComponentType('KwGrid'));
const now = dayjs();
const totalCount = ref(0);
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
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
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
  const res = await dataService.get('/sms/wells/contract/expired-retention-contracts', { params: searchParams.value });
  const rentals = res.data;
  totalCount.value = rentals.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(rentals);
  view.resetCurrent();
}

async function onClickSearch() {
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'exnDt' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'pdClsf' },
    { fieldName: 'basePdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'istmMcn', dataType: 'number' },
    { fieldName: 'recapDutyPtrmN', dataType: 'number' },
    { fieldName: 'canDt' },
    { fieldName: 'canCstDutyUseExprYn' },
    { fieldName: 'slDt' },
    { fieldName: 'dutyUseDt' },
    { fieldName: 'mshCntrNo' },
    { fieldName: 'mshCntrSn' },
    { fieldName: 'mshCntrDt' },
    { fieldName: 'mshCanDt' },
    { fieldName: 'mshWdwalDt' },
    { fieldName: 'cntrtMpno' },
    { fieldName: 'istllMpno' },
  ];

  const columns = [
    { fieldName: 'exnDt', header: t('MSG_TXT_EXP_DT'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: 120 },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: 100, styleName: 'text-right' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: 100 },
    { fieldName: 'pdClsf', header: t('MSG_TXT_PRDT_CATE'), width: 100 },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: 100, styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: 250 },
    { fieldName: 'istmMcn', header: t('MSG_TXT_RENT_PRD_MN'), width: 100, styleName: 'text-right' },
    { fieldName: 'recapDutyPtrmN', header: t('MSG_TXT_LCK_IN_PRD_MN'), width: 100, styleName: 'text-right' },
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_D'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'canCstDutyUseExprYn', header: t('MSG_TXT_CAN_CST_MAND_PRD_EXP_STAT'), width: 250 },
    { fieldName: 'slDt', header: t('MSG_TXT_DT_OF_SALE'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'dutyUseDt', header: t('MSG_TXT_MAND_DAYS'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'mshCntrNo', header: t('MSG_TXT_CNTR_NO'), width: 120, styleName: 'text-center' },
    { fieldName: 'mshCntrSn', header: t('MSG_TXT_CNTR_SN'), width: 100, styleName: 'text-right' },
    { fieldName: 'mshCntrDt', header: t('MSG_TXT_MEM_CNTR_DT_1'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'mshCanDt', header: t('MSG_TXT_MEM_CANC_DT_1'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'mshWdwalDt', header: t('MSG_TXT_MEM_WTDR_DT'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrtMpno', header: t('MSG_TXT_CNTRR_VAC_PH_NO'), width: 150, styleName: 'text-center' },
    { fieldName: 'istllMpno', header: t('MSG_TXT_INSTR_PH_NO'), width: 150, styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});
</script>
