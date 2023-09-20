<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbKMoneySalesBondListM - K머니 매출채권 현황 - W-CL-U-0058M08
3. 작성자 : KIM JUHYUN
4. 작성일 : 2023.03.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- K머니 매출채권 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YR')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYr"
            :label="$t('MSG_TXT_BASE_YR')"
            type="year"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <h3>
        {{ $t('MSG_TIT_SL_BND_PS') }}
        <ul class="kw-notification">
          <li>
            {{ $t('MSG_TXT_DBL_CLK_MCBY_DTL_IZ') }}
          </li>
        </ul>
      </h3>
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
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          icon="download_on"
          dense
          @click="onClickExportViewMain"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGridMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
      <div class="grid-horizontal-wrap">
        <div class="grid-horizontal-wrap__section">
          <h3>{{ $t('MSG_TIT_MCBY_DP_DTL_IZ') }}</h3>
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="totalCountDeposit"
              />
              <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
            </template>
            <kw-btn
              v-permission:download
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              :disable="totalCountDeposit === 0"
              icon="download_on"
              dense
              @click="onClickExportViewDetail('deposit')"
            />
          </kw-action-top>
          <kw-grid
            ref="grdDepositRef"
            style="height: 468px;"
            name="grdDeposit"
            @init="initGridDeposit"
          />
        </div>
        <div class="grid-horizontal-wrap__section w543">
          <h3>{{ $t('MSG_TIT_MCBY_RV_CAN_DTL_IZ') }}</h3>
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="totalCountCancel"
              />
            </template>
            <kw-btn
              v-permission:download
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              :disable="totalCountCancel === 0"
              icon="download_on"
              dense
              @click="onClickExportViewDetail('cancel')"
            />
          </kw-action-top>
          <kw-grid
            ref="grdCancelRef"
            style="height: 468px;"
            name="grdCancel"
            @init="initGridCancel"
          />
        </div>
      </div>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const now = dayjs();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdDepositRef = ref(getComponentType('KwGrid'));
const grdCancelRef = ref(getComponentType('KwGrid'));
const totalCountDeposit = ref(0);
const totalCountCancel = ref(0);

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  baseYr: now.format('YYYY'),
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const detailParams = ref({
  baseYm: '',
});

async function fetchCancelData() {
  const resType = await dataService.get('/sms/wells/closing/kmoney-sales-bond/cancel-detail', { params: detailParams.value.baseYm });
  console.log(resType.data);
  const cancelDetail = resType.data;
  totalCountCancel.value = cancelDetail.length;
  const viewType = grdCancelRef.value.getView();
  viewType.getDataSource().setRows(cancelDetail);
}

async function fetchDepositData() {
  const resType = await dataService.get('/sms/wells/closing/kmoney-sales-bond/deposit-detail', { params: detailParams.value.baseYm });
  console.log(resType.data);
  const depositDetail = resType.data;
  totalCountDeposit.value = depositDetail.length;
  const viewType = grdDepositRef.value.getView();
  viewType.getDataSource().setRows(depositDetail);
}

let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/closing/kmoney-sales-bond/sales-bond', { params: { ...cachedParams, ...pageInfo.value } });
  console.log(res.data);
  const { list: mainList, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  console.log('pageInfo:', pageInfo.value);
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(mainList);

  gridUtil.reCreateGrid(grdDepositRef.value.getView());
  gridUtil.reCreateGrid(grdCancelRef.value.getView());
}

async function onClickExportViewMain() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/closing/kmoney-sales-bond/sales-bond/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickExportViewDetail(type) {
  if (type === 'deposit') {
    const view = grdDepositRef.value.getView();
    await gridUtil.exportView(view, {
      fileName: `${t('MSG_TIT_MCBY_DP_DTL_IZ')}`,
      timePostfix: true,
      exportData: gridUtil.getAllRowValues(view),
    });
  } else if (type === 'cancel') {
    const view = grdCancelRef.value.getView();
    await gridUtil.exportView(view, {
      fileName: `${t('MSG_TIT_MCBY_RV_CAN_DTL_IZ')}`,
      timePostfix: true,
      exportData: gridUtil.getAllRowValues(view),
    });
  }
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  await fetchData();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm',
      header: t('MSG_TXT_BASE_YM'),
      width: '180',
      styleName: 'rg-button-link text-center',
      datetimeFormat: 'yyyy-MM',
      renderer: { type: 'button' },
      displayCallback(grid, index, value) {
        return `${value.substring(0, 4)}-${value.substring(4, 6)}`;
      },
    }, // 기준년월
    { fieldName: 'btdAmt', header: t('MSG_TXT_BTD_AMT'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 기초금액
    { fieldName: 'sellAmt', header: t('MSG_TXT_OCCR_AMT'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 발생금액
    { fieldName: 'rveAmt', header: t('MSG_TXT_THM_DP_AMT'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 당월 입금액
    { fieldName: 'acuRveAmt', header: t('MSG_TXT_ACU_DP_AMT'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 누적 입금액
    { fieldName: 'resAmt', header: t('MSG_TXT_BLAM'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 잔액
    { fieldName: 'mlgRvAmt', header: t('MSG_TXT_ITG_RV_AMT'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 통합 적립액
    { fieldName: 'mlgCanAmt', header: t('MSG_TXT_ITG_RV_CAN_AMT'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 통합 적림 취소액

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (grid, { column, dataRow }) => {
    if (column === 'baseYm') {
      detailParams.value.baseYm = gridUtil.getRowValue(grid, dataRow);
      await fetchDepositData();
      await fetchCancelData();
    }
  };
});

const initGridDeposit = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '117', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cntrCstNm', header: t('MSG_TXT_CST_NM'), width: '80', styleName: 'text-left' }, // 고객명
    { fieldName: 'rcpYm', header: t('MSG_TXT_RCP_YM'), width: '70', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 접수년월
    { fieldName: 'istYm', header: t('MSG_TXT_YR_INSTALLATION'), width: '70', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 설치년월
    { fieldName: 'sellAmt', header: t('MSG_TXT_SALE_PRICE'), width: '85', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 판매금
    { fieldName: 'rveAmt', header: t('MSG_TXT_THM_DP_AMT_DFA_INC'), width: '80', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 당월입금액(대손포함)
    { fieldName: 'acuRveAmt', header: t('MSG_TXT_ACU_DP_AMT_DFA_INC'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 누적입금액(대손포함)
    { fieldName: 'resAmt', header: t('MSG_TXT_BLAM_SLAMT_DP_AMT'), width: '120', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 잔액(판매금-입금액)
    { fieldName: 'acuDfaAmt', header: t('MSG_TXT_ACU_DFA_DP_AMT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 누적 대손입금액
    { fieldName: 'dfaYm', header: t('MSG_TXT_DFA_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 대손년월
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.header.height = 60;
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGridCancel = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'rvCanDt', header: t('MSG_TXT_RV_CAN_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 적립취소일
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '153', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'canAmt', header: t('MSG_TXT_CAN_AMT_WON'), width: '133', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 취소금액(원)
    { fieldName: 'ledgCanDt', header: t('MSG_TXT_LEDG_CAN_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 원장취소일자
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.header.height = 60;
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
<style scoped>
</style>
