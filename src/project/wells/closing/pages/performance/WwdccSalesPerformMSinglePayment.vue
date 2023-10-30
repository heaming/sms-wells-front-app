<!-- eslint-disable max-len -->
<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccSalesPerformMSinglePayment - 매출실적 현황_일시불(탭) - W-CL-U-0038M02
3. 작성자 : gilyong.han
4. 작성일 : 2023.09.05
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
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
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
    <div
      v-show="isShow"
    >
      <h3>{{ $t('MSG_TXT_CNTR_ARTC') }}</h3>
      <kw-form
        dense
        :cols="4"
        class="mb20"
      >
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_SEL_TYPE')">
            <p>{{ baseInformation.sellTpCdNm }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
            <p>{{ baseInformation.cntrDtlNo }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_CST_NM')">
            <p>{{ baseInformation.cstKnm }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_INDI_CORP')">
            <p>{{ baseInformation.copnDvCdNm }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_SELLER_INFO')">
            <p>{{ baseInformation.prtnrKnm }} ({{ baseInformation.prtnrNo }})</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_CNTRCT_DT')">
            <p>{{ baseInformation.cntrDt }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_DT_OF_SALE')">
            <p>{{ baseInformation.slDt }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_CAN_D')">
            <p>{{ baseInformation.canDt }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_OG_INF')">
            <p>{{ baseInformation.ogInfo }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_PD_INF')">
            <p>{{ baseInformation.pdInfo }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_DSPRC')">
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.dscAmt)) }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_DISC_CODE')">
            <p>{{ baseInformation.dscTp }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_ALNC_INF')">
            <p>{{ baseInformation.alncmpCdNm }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_EV_INF')">
            <p>{{ baseInformation.sellEvCdNm }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_SLE_PRC')">
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.sellAmt)) }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_ALNC_FEE')">
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.alncFee)) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_CNTR_AMT')">
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.subscAmt)) }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_BLAM')">
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.istmPcamAmt)) }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_ISTM_INF_MCNT_WON')">
            <p>{{ baseInformation.istmMcn }}*{{ stringUtil.getNumberWithComma(toInteger(baseInformation.mmIstmAmt)) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_FEE')">
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.istmFeeLvyAmt)) }}</p>
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
          <kw-form-item :label="$t('MSG_TXT_CHG_DT')">
            <p>{{ baseInformation.cntrChnDt }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_ACC_DV')">
            <p>{{ baseInformation.cwkgubnm }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_STAT_CH_DT')">
            <p>{{ baseInformation.pdChDt }}</p>
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
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.istmTotDpAmt)) }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_CNTRAM_DP_AMT_CRP_UC_DP_AMT')">
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.subscTotDpAmt)) }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_SL_CH_DP_AMT')">
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.slChTotDpAmt)) }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_DP_TAM')">
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.totDpAmt)) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_FNT_DV')">
            <p>{{ baseInformation.dpTpCd }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_FTD')">
            <p>{{ baseInformation.mpyBsdt }}</p>
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
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.thmOcDlqAmt)) }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_UC_AMT')">
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.ucBlam)) }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_UC_PRNT')">
            <p>{{ baseInformation.ucPrt }}</p>
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
            <p>{{ baseInformation.acdbtDt }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_DFA_AMT')">
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.dfaAmt)) }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_DFA_DP_AMT')">
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.dfaDpAmt)) }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_DFA_BLAM')">
            <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformation.dfaBlam)) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_PY_DT')">
            <p>{{ baseInformation.dfaRveDt }}</p>
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
            <p>{{ baseInformation.bndAsnDt }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_CLCTAM_TP')">
            <p>{{ baseInformation.clctamDvCd }}.{{ baseInformation.clctamDvCdNm }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_CLCTAM_ICHR')">
            <p>{{ baseInformation.clctamPrtnrNo }}({{ baseInformation.clctamPrtnrKnm }})</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_DSB_GUR')">
            <p>{{ baseInformation.DsbGurTpCdNm }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_BU_NOTI')">
            <p>{{ baseInformation.buNotiDt }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_REDF_D')">
            <p>{{ baseInformation.redfDt }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_ADSB_D')">
            <p>{{ baseInformation.adsbDt }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_NOTI_CN')">
            <p>{{ baseInformation.buNotiTpCd }}_{{ baseInformation.buNotiTpCdNm }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_BNK_NM')">
            <p>{{ baseInformation.vacBnkCd }}</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_VT_AC')">
            <p>{{ baseInformation.vacNo }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </div>
    <kw-separator />
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
            v-permission:download
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
          :page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
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
            v-permission:download
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
          :page-size="depositPageInfo.pageSize"
          :total-count="depositPageInfo.totalCount"
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
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService, useMeta, stringUtil } from 'kw-lib';
import { cloneDeep, toInteger } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const isShow = ref(false);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/closing/sales-performs/single-payment';
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
  const res = await dataService.get(`${baseUrl}/base`, { params: cachedParams });
  isShow.value = true;
  console.log(res.data);
  baseInformation.value = res.data;
}

async function fetchSalesData() {
  console.log('pageInfo.value1:', pageInfo.value);
  const res = await dataService.get(`${baseUrl}/sales/paging`, { params: { ...cachedParams, ...pageInfo.value } });
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
  const res = await dataService.get(`${baseUrl}/deposits/paging`, { params: { ...cachedParams, ...depositPageInfo.value } });
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

  const response = await dataService.get(`${baseUrl}/sales/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TXT_SL_PERF_MCBY')}Excel`,
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickExportViewDetail() {
  const view = grdDepositRef.value.getView();

  const response = await dataService.get(`${baseUrl}/deposits/excel-download`, { params: cachedParams });
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
    { fieldName: 'slClYm', header: t('MSG_TXT_BASE_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM' }, // 기준년월
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '100', styleName: 'text-right' }, // 연체개월
    { fieldName: 'eotDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 연체금액
    { fieldName: 'clctamDvCdNm', header: t('MSG_TXT_CLCTAM_TP'), width: '100', styleName: 'text-center' }, // 집금유형
    { fieldName: 'clctamPrtnrNo', header: t('MSG_TXT_CLCTAM_TP_ICHR'), width: '100', styleName: 'text-center' }, // 집금유형담당
    { fieldName: 'slDpAggAmt', header: t('MSG_TXT_TOT_MPY_AMT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 총납부액
    { fieldName: 'thmIntamDpAmt', header: t('MSG_TXT_THM_MPY_AMT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 당월납부액
    { fieldName: 'crpUcAmt', header: t('MSG_TXT_THM_CNTRAM_DP_AMT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 당월계약금입금액
    { fieldName: 'sellAmt', header: t('MSG_TXT_SALE_PRICE'), width: '100', styleName: 'text-right', dataType: 'number' }, // 판매금액
    { fieldName: 'istmInfo', header: t('MSG_TXT_DTL'), width: '100', styleName: 'text-center' }, // 상세
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});

const initGridDetail = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'rveGubun', header: t('MSG_TXT_DP_DV'), width: '100', styleName: 'text-center' }, // 입금구분
    { fieldName: 'rveDt', header: t('MSG_TXT_DP_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 입금일자
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 실적일자
    { fieldName: 'dpDvCd', header: t('MSG_TXT_DIV'), width: '100', styleName: 'text-center' }, // 구분
    { fieldName: 'rveDvCd', header: t('MSG_TXT_DP_KND'), width: '100', styleName: 'text-center' }, // 입금종류
    { fieldName: 'dpTpCd', header: t('MSG_TXT_DP_TP'), width: '100', styleName: 'text-center' }, // 입금유형
    { fieldName: 'rveAmt', header: t('MSG_TXT_PROCS_AMT_WON'), width: '100', styleName: 'text-right', dataType: 'number' }, // 처리금액(원)
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});
</script>
