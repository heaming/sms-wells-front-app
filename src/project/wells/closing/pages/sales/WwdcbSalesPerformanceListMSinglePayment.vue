<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbSalesPerformanceListMSinglePayment - 매출실적 현황_일시불(탭) - W-CL-U-0038M02
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.03.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매출실적 현황_일시불(탭) 화면
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
        :label="$t('MSG_TXT_CNTR_DTL_NO')"
        required
      >
        <kw-input
          v-model="searchParams.cntrDtlNo"
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
          icon="search"
          clearable
          rules="required"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area">
    <h3 class="mb0">
      {{ $t('MSG_TIT_DEFAULT_INFO') }}
    </h3>
    <p class="kw-font--14 kw-fc--black3 text-right mb12">
      <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
    </p>
    <h3>{{ $t('MSG_TXT_CNTR_ARTC') }}</h3>
    <kw-form
      dense
      :cols="4"
      class="mb20"
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_TASK_DIV')">
          <p>{{ baseInformation.taskDiv }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <p>{{ baseInformation.cntrDtlNo }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CST_NM')">
          <p>{{ baseInformation.cstKnm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_INDI_CORP')">
          <p>{{ baseInformation.copnDvCd }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SELLER_INFO')">
          <p>{{ baseInformation.sellPrtnrNo }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CNTRCT_DT')">
          <p>{{ baseInformation.cntrCnfmDtm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DT_OF_SALE')">
          <p>{{ baseInformation.slDt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CAN_D')">
          <p>{{ baseInformation.slCanDt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_OG_INF')">
          <p>{{ baseInformation.sellOgTpCd }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PD_INF')">
          <p>{{ baseInformation.basePdCd }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSPRC')">
          <p>{{ baseInformation.dscAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DISC_CODE')">
          <p>{{ baseInformation.dscApyTpCd }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ALNC_INF')">
          <p>{{ baseInformation.alncmpCd }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_EV_INF')">
          <p>{{ baseInformation.evInf }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SLE_PRC')">
          <p>{{ baseInformation.sellAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ALNC_FEE')">
          <p>{{ baseInformation.alncFee }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SUBSC_AMT')">
          <p>{{ baseInformation.subscAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_TK_AMT')">
          <p>{{ baseInformation.tkAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CRP_UC_AMT')">
          <p>{{ baseInformation.crpUcAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_BLAM')">
          <p>{{ baseInformation.blam }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ISTM_INF_MCNT_WON')">
          <p>{{ baseInformation.istmMcn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FEE')">
          <p>{{ baseInformation.feeAckmtBaseAmt }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />

    <h3>{{ $t('MSG_TXT_CH_ARTC') }}</h3>
    <kw-form
      dense
      :cols="4"
      class="mb20"
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_FULPY_DT')">
          <p>{{ baseInformation.fulpyDt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FST_FULPY_D')">
          <p>{{ baseInformation.fstFulpyDt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CHG_DT')">
          <p>{{ baseInformation.chgDt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ACC_DV')">
          <p>{{ baseInformation.accDv }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_STAT_CH_DT')">
          <p>{{ baseInformation.statChDt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_CH_DT')">
          <p>{{ baseInformation.slChDt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_CH_SN')">
          <p>{{ baseInformation.slChSn }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <h3>{{ $t('MSG_TXT_DP_ARTC') }}</h3>
    <kw-form
      dense
      :cols="4"
      class="mb20"
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ISTM_DP_AMT')">
          <p>{{ baseInformation.dpAmt1 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SUBSC_DP_AMT')">
          <p>{{ baseInformation.dpAmt2 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SL_CH_DP_AMT')">
          <p>{{ baseInformation.dpAmt3 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_TK_DP_AMT')">
          <p>{{ baseInformation.dpAmt4 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CRP_UC_AMT')">
          <p>{{ baseInformation.dpAmt5 }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DP_TAM')">
          <p>{{ baseInformation.dpTam }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FNT_DV')">
          <p>{{ baseInformation.fntDvCd }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FTD')">
          <p>{{ baseInformation.rglFntD }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <h3>{{ $t('MSG_TXT_DLQ_ARTC') }}</h3>
    <kw-form
      dense
      :cols="4"
      class="mb20"
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DLQ_MCNT')">
          <p>{{ baseInformation.dlqMcn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DLQ_AMT')">
          <p>{{ baseInformation.eotDlqAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_UC_AMT')">
          <p>{{ baseInformation.ucAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_UC_PRNT')">
          <p>{{ baseInformation.ucPrnt }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <h3>{{ $t('MSG_TXT_DFA_ARTC') }}</h3>
    <kw-form
      dense
      :cols="4"
      class="mb20"
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DFA_DT')">
          <p>{{ baseInformation.dfaBsdt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DFA_AMT')">
          <p>{{ baseInformation.dfaProcsAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DFA_DP_AMT')">
          <p>{{ baseInformation.dfaDpAmt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DFA_BLAM')">
          <p>{{ baseInformation.dfaBlam }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PY_DT')">
          <p>{{ baseInformation.dfaPrcsdt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DFA_FULPY_AMT')">
          <p>{{ baseInformation.dfaFulpyAmt }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <h3>{{ $t('MSG_TXT_CLCTAM_INF') }}</h3>
    <kw-form
      dense
      :cols="4"
      class="mb30"
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ACTCS_DT')">
          <p>{{ baseInformation.actcsDt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CLCTAM_TP')">
          <p>{{ baseInformation.clctamDvCd }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CLCTAM_ICHR')">
          <p>{{ baseInformation.clctamPrtnrNo }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DSB_GUR')">
          <p>{{ baseInformation.dsbGur }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BU_NOTI')">
          <p>{{ baseInformation.buNoti }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_REDF_D')">
          <p>{{ baseInformation.redfDt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADSB_D')">
          <p>{{ baseInformation.adsbDt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_NOTI_CN')">
          <p>{{ baseInformation.notiCn }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BNK_NM')">
          <p>{{ baseInformation.bnkCd }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_VT_AC')">
          <p>{{ baseInformation.vtAc }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <div class="grid-horizontal-wrap">
      <div class="grid-horizontal-wrap__section">
        <h3>{{ $t('MSG_TIT_SL_PERF_MCBY') }}</h3>

        <kw-action-top>
          <template #left>
            <kw-paging-info
              v-model:page-index="pageInfo.pageIndex"
              v-model:page-size="pageInfo.pageSize"
              :total-count="pageInfo.totalCount"
              :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
              @change="fetchSalesData"
            />
          </template>
          <kw-btn
            icon="download_on"
            :disable="pageInfo.totalCount === 0"
            dense
            secondary
            :label="$t('MSG_BTN_EXCEL_DOWN')"
            @click="onClickExportViewMain"
          />
        </kw-action-top>
        <kw-grid
          ref="grdSalesRef"
          name="grdSales"
          :visible-rows="pageInfo.pageSize - 1"
          @init="initGridMain"
        />

        <kw-pagination
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @change="fetchSalesData"
        />
      </div>
      <div class="grid-horizontal-wrap__section">
        <h3>{{ $t('MSG_TIT_DP_IZ') }}</h3>

        <kw-action-top>
          <template #left>
            <kw-paging-info
              v-model:page-index="depositPageInfo.pageIndex"
              v-model:page-size="depositPageInfo.pageSize"
              :total-count="depositPageInfo.totalCount"
              :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
              @change="fetchDepositData"
            />
          </template>
          <kw-btn
            icon="download_on"
            :disable="depositPageInfo.totalCount === 0"
            dense
            secondary
            :label="$t('MSG_BTN_EXCEL_DOWN')"
            @click="onClickExportViewDetail"
          />
        </kw-action-top>
        <kw-grid
          ref="grdDepositRef"
          name="grdDeposit"
          :visible-rows="pageInfo.pageSize - 1"
          @init="initGridDetail"
        />
        <kw-pagination
          v-model:page-index="depositPageInfo.pageIndex"
          v-model:page-size="depositPageInfo.pageSize"
          :total-count="depositPageInfo.totalCount"
          @change="fetchDepositData"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdSalesRef = ref(getComponentType('KwGrid'));
const grdDepositRef = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  cntrDtlNo: '',
});

const baseInformation = ref({});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const depositPageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
async function fetchBaseData() {
  const res = await dataService.get('/sms/wells/closing/single-payment/base', { params: cachedParams });
  console.log(res.data);
  baseInformation.value = res.data;
}

async function fetchSalesData() {
  console.log('pageInfo.value1:', pageInfo.value);
  const res = await dataService.get('/sms/wells/closing/single-payment/sales', { params: { ...cachedParams, ...pageInfo.value } });
  console.log(res.data);
  const { list: mainList, pageInfo: pagingResult } = res.data;
  console.log('pagingResult:', pagingResult);
  pageInfo.value = pagingResult;
  console.log('pageInfo:', pageInfo.value);
  const view = grdSalesRef.value.getView();
  view.getDataSource().setRows(mainList);
  view.resetCurrent();
}

async function fetchDepositData() {
  const res = await dataService.get('/sms/wells/closing/single-payment/deposits', { params: { ...cachedParams, ...depositPageInfo.value } });
  console.log(res.data);
  const { list: mainList, pageInfo: pagingResult } = res.data;

  console.log('pagingResult:', pagingResult);
  depositPageInfo.value = pagingResult;
  console.log('depositPageInfo:', depositPageInfo.value);
  const view = grdDepositRef.value.getView();
  view.getDataSource().setRows(mainList);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchBaseData();
  await fetchSalesData();
  await fetchDepositData();
}

async function onClickExportViewMain() {
  const view = grdSalesRef.value.getView();

  const response = await dataService.get('/sms/wells/closing/single-payment/sales/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TXT_SL_PERF_MCBY')}Excel`,
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickExportViewDetail() {
  const view = grdDepositRef.value.getView();

  const response = await dataService.get('/sms/wells/closing/single-payment/deposits/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TIT_DP_IZ')}Excel`,
    timePostfix: true,
    exportData: response.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slClYm', header: t('MSG_TXT_BASE_YM'), width: '100', styleName: 'text-center' },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'eotDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'clctamDvCd', header: t('MSG_TXT_CLCTAM_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'clctamPrtnrNo', header: t('MSG_TXT_CLCTAM_TP_ICHR'), width: '100', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_TOT_MPY_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col7', header: t('MSG_TXT_THM_MPY_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col8', header: t('MSG_TXT_THM_CRP_UC_DP_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'sellAmt', header: t('MSG_TXT_SALE_PRICE'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'istmMcn', header: t('MSG_TXT_DTL'), width: '100', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});

const initGridDetail = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'rveDvCd', header: t('MSG_TXT_DP_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'rveDt', header: t('MSG_TXT_DP_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'dpDvCd', header: t('MSG_TXT_DIV'), width: '100', styleName: 'text-center' },
    { fieldName: 'dpKndCd', header: t('MSG_TXT_DP_KND'), width: '100', styleName: 'text-center' },
    { fieldName: 'dpTpCd', header: t('MSG_TXT_DP_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'rveAmt', header: t('MSG_TXT_PROCS_AMT_WON'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});
</script>
