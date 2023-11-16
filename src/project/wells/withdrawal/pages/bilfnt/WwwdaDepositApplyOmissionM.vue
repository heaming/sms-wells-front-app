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
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>

      <kw-btn
        v-permission:download
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
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
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

import { useDataService, codeUtil, defineGrid, getComponentType, gridUtil, useMeta } from 'kw-lib';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const now = dayjs();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  itemsChecked: {
    type: Boolean,
    required: true,
  },
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'DP_MES_CD',
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
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/sales-perf-checks', { params: { ...cachedParams, ...pageInfo.value, timeout: 30000000 } });
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

async function onClickExcelDownload() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/sales-perf-checks/excel-download', { params: cachedParams, timeout: 30000000 });
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${props.itemsChecked}`,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellTpNm' },
    { fieldName: 'baseYm' },
    { fieldName: 'cntr' },
    { fieldName: 'rentalNmn' },
    { fieldName: 'thmIntamDpAmt', dataType: 'number' },
    { fieldName: 'thmIstmRfndAmt', dataType: 'number' },
    { fieldName: 'rveAmt', dataType: 'number' },
    { fieldName: 'dpMesCd' },
  ];

  const columns = [
    { fieldName: 'sellTpNm', header: t('MSG_TXT_AUTO_FNT_CLSF'), width: '290' },
    { fieldName: 'baseYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '200',
      styleName: 'text-center',
      datetimeFormat: 'yyyy-MM',

    },
    { fieldName: 'cntr',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '250',
      styleName: 'text-center',
    },
    { fieldName: 'rentalNmn', header: t('MSG_TXT_RENTAL_NMN'), width: '150', styleName: 'text-center' },
    { fieldName: 'thmIntamDpAmt', header: t('MSG_TXT_PRPD_DP'), width: '150', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'thmIstmRfndAmt', header: t('MSG_TXT_PRPD_RFND'), width: '150', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'rveAmt', header: t('MSG_TXT_AMT'), width: '150', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'dpMesCd', header: t('MSG_TXT_STLM_INF'), width: '117', styleName: 'text-center', options: codes.DP_MES_CD },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
