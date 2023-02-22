<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwwdaDepositApplyOmissionM - 자동이체결과 체크리스트(매출실적 입금적용 누락건) (W-WD-U-0035M03)
3. 작성자 : donghyun.yoo
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
계좌/카드 자동이체 생성자료 조회 및 오류체크 구분별 조회
****************************************************************************************************
--->
<template>
  <kw-search
    one-row
    :cols="2"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_BASE_YM')"
        required
      >
        <kw-date-picker
          v-model="searchParams.bilYm"
          rules="required"
          :label="t('MSG_TXT_BASE_YM')"
          type="month"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="fetchData"
        />
      </template>

      <kw-btn
        :disable="pageInfo.totalCount === 0"
        icon="download_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      name="grdMain1"
      :visible-rows="10"
      @init="initGrid"
    />

    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useDataService, codeUtil, defineGrid, useMeta, getComponentType } from 'kw-lib';
import dayjs from 'dayjs';

const dataService = useDataService();
const { getConfig } = useMeta();
const { t } = useI18n();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  bilYm: now.format('YYYYMM'), // 기준일자
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/sales-perf-checks', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = { ...searchParams.value };
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellTpCd' },
    { fieldName: 'baseYm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'rentalNmn' },
    { fieldName: 'intamDpAmt' },
    { fieldName: 'intamRfndAmt' },
    { fieldName: 'rveAmt' },
    { fieldName: 'mpyMthdTpCd' },
  ];

  const columns = [
    { fieldName: 'sellTpCd', header: t('MSG_TXT_AUTO_FNT_CLSF'), width: '290' },
    { fieldName: 'baseYm', header: t('MSG_TXT_PERF_YM'), width: '200', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '250', styleName: 'text-center' },
    { fieldName: 'rentalNmn', header: t('MSG_TXT_RENTAL_NMN'), width: '150', styleName: 'text-center' },
    { fieldName: 'intamDpAmt', header: t('MSG_TXT_PRPD_DP'), width: '150', styleName: 'text-right' },
    { fieldName: 'intamRfndAmt', header: t('MSG_TXT_PRPD_RFND'), width: '150', styleName: 'text-right' },
    { fieldName: 'rveAmt', header: t('MSG_TXT_AMT'), width: '150', styleName: 'text-right' },
    { fieldName: 'mpyMthdTpCd', header: t('MSG_TXT_STLM_INF'), width: '117' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
