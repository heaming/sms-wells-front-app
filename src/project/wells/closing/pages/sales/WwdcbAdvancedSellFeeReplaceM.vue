<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbAdvancedSellFeeReplaceM - 선급판매수수료 비용 대체 관리
3. 작성자 : Kicheol Choi
4. 작성일 : 2023.06.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 선급판매수수료 비용 대체 관리
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
          :colspan="2"
          :label="$t('MSG_TXT_INQR_DV')"
        >
          <kw-option-group
            v-model="searchParams.searchGubun"
            :options="searchGubunCode"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-if="searchParams.searchGubun === '3'"
            v-model="searchParams.baseYm"
            type="year"
            rules="required"
            :label="$t('MSG_TXT_BASE_YEAR')"
          />
          <kw-date-picker
            v-else
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_BASE_YM')"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OG_TP')"
        >
          <kw-select
            v-model="searchParams.ogTpCd"
            first-option="all"
            first-option-value="ALL"
            :options="codes.OG_TP_CD"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEL_TYPE')"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            first-option="all"
            first-option-value="ALL"
            :options="codes.SELL_TP_CD"
          />
          <kw-select
            v-model="searchParams.sellTpDtlCd"
            first-option="all"
            first-option-value="ALL"
            :options="codes.SELL_TP_DTL_CD"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CATE')"
        >
          <zwpd-product-classification-select
            v-model:product1-level="searchParams.pdHclsfId"
            v-model:product2-level="searchParams.pdMclsfId"
            v-model:pd-tp-cd="searchParams.pdTpCd"
            :search-lvl="'2'"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PIA_TARGET_YN')"
        >
          <kw-select
            v-model="searchParams.piaCsYn"
            first-option="all"
            first-option-value="ALL"
            :options="['Y','N']"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
          />
        </kw-search-item>
        <kw-search-item
          v-if="searchParams.searchGubun === '2'"
          :label="$t('MSG_TXT_FEE_DV')"
        >
          <kw-checkbox
            v-model="searchParams.feeChk"
            :label="$t('MSG_TXT_DTL')"
            :false-value="'N'"
            :true-value="'Y'"
            @update:model-value="onClickChkboxDetail"
          />
          <kw-separator
            v-if="searchParams.feeChk === 'Y'"
            spaced
            vertical
            inset
          />
          <kw-select
            v-if="searchParams.feeChk === 'Y'"
            v-model="searchParams.feeCd"
            first-option="all"
            first-option-value="ALL"
            :options="dynamicChangeCodes.FEE_GBN_CD"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
            @change="fetchData"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>

        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          primary
          dense
          :label="$t('MSG_BTN_SLP_CRE')"
          :disable="totalCount === 0 || searchParams.baseYm !== lastMonth"
          @click="onClickSlipCreate"
        />
      </kw-action-top>

      <kw-grid
        v-if="gridControl.gubun === '1'"
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrid"
      />
      <kw-grid
        v-else-if="gridControl.gubun === '2'"
        ref="grdMainRef"
        name="grdDtl"
        :visible-rows="10"
        @init="initGridDtl"
      />
      <kw-grid
        v-else-if="gridControl.gubun === '3'"
        ref="grdMainRef"
        name="grdRtDtl"
        :visible-rows="10"
        @init="initGridRtDtl"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, codeUtil, useDataService, defineGrid, gridUtil, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import ZwpdProductClassificationSelect from '~sms-common/product/pages/standard/components/ZwpdProductClassificationSelect.vue';
import { getFeeSearchGubunCodes, textToNumberFormatter, getPiaCsYnCodes } from '~sms-common/closing/utils/clUtil';

const { t } = useI18n();
const dataService = useDataService();

const { modal } = useGlobal();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const now = dayjs();
const totalCount = ref(0);
const dynamicChangeCodes = ref({ FEE_GBN_CD: [] });

const lastMonth = ref(now.subtract(1, 'month').format('YYYYMM'));

const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
);

const searchGubunCode = await getFeeSearchGubunCodes();
const piaCsYnCode = await getPiaCsYnCodes();

async function getCodes() {
  const res = await dataService.get('/sms/wells/closing/advanced-fee-replace/fee-gubun-code');
  return res.data;
}

let cachedParams;

const searchParams = ref({
  searchGubun: '1',
  baseYm: now.subtract(1, 'month').format('YYYYMM'),
  ogTpCd: 'ALL',
  sellTpCd: 'ALL',
  sellTpDtlCd: 'ALL',
  pdHclsfId: 'ALL',
  pdMclsfId: 'ALL',
  piaCsYn: 'ALL',
  cntrNo: '',
  cntrSn: '',
  feeChk: 'N',
  feeCd: 'ALL',
});

const gridControl = ref({
  gubun: searchGubunCode[0].codeId,
});

async function setSummaryData(column, res) {
  const view = grdMainRef.value.getView();
  const valueY = res.data[0];
  const valueN = res.data[1];

  if (column !== 'piaCsYn') {
    const valueSum = `${valueY[column] * 1 + valueN[column] * 1}`;
    const strSum = textToNumberFormatter(valueSum);
    const strY = textToNumberFormatter(valueY[column]);
    const strN = textToNumberFormatter(valueN[column]);

    view.columnByName(column).setHeaderSummaries([
      { text: strSum, styleName: 'text-right' },
      { text: strY, styleName: 'text-right' },
      { text: strN, styleName: 'text-right' },
    ]);
  } else {
    view.columnByName(column).setHeaderSummaries([
      {},
      { text: t('MSG_TXT_OBJ'), styleName: 'text-center' },
      { text: t('MSG_TXT_NO_OBJ'), styleName: 'text-center' },
    ]);
  }
}

async function fetchSummaryData(apiParam) {
  const res = await dataService.get(`/sms/wells/closing/advanced-fee-replace/${apiParam}/summary`, { params: { ...cachedParams } });

  if (apiParam === 'aggregates') {
    setSummaryData('slAmt', res);
    setSummaryData('feeOcAmt', res);
    setSummaryData('piaFeeOcAmt', res);
    setSummaryData('piaSellFeeCrdovrResAmt', res);
    setSummaryData('piaCsYn', res);
    setSummaryData('csRplcAmt', res);
    setSummaryData('csRplcAmtCancBlam', res);
    setSummaryData('ttrmCsAmt', res);
    setSummaryData('piaFeeEotBlam', res);
  } else if (apiParam === 'details') {
    setSummaryData('slAmt', res);
    setSummaryData('feeOcAmt', res);
    setSummaryData('piaFeeOcAmt', res);
    setSummaryData('piaCsYn', res);
    setSummaryData('csRplcAggAmt', res);
    setSummaryData('ttrmCsAmt', res);
    setSummaryData('piaFeeEotBlam', res);
  }
}

async function fetchData() {
  let apiParam;
  if (searchParams.value.searchGubun === '1') {
    apiParam = 'aggregates';
  } else if (searchParams.value.searchGubun === '2') {
    apiParam = 'details';
  } else {
    apiParam = 'divides';
  }

  const res = await dataService.get(`/sms/wells/closing/advanced-fee-replace/${apiParam}/list`, { params: { ...cachedParams } });
  const lists = res.data;

  totalCount.value = lists.length;

  if (apiParam !== 'divides' && totalCount.value !== 0) { fetchSummaryData(apiParam); }

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(lists);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  gridControl.value.gubun = searchParams.value.searchGubun;

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

async function onClickSlipCreate() {
  await modal({
    component: 'WwdcbAdvancedSellFeeReplaceP',
  });
}

async function onClickChkboxDetail() {
  const val = searchParams.value.feeChk;
  searchParams.value.feeCd = 'ALL';
  if (searchParams.value.searchGubun !== '2' || gridControl.value.gubun !== '2') return;

  const view = grdMainRef.value.getView();
  if (val === 'Y') {
    view.columnByName('feeNm').visible = true;
  } else {
    view.columnByName('feeNm').visible = false;
  }
}

watch(() => searchParams.value.searchGubun, async (val) => {
  if (val === '3') {
    searchParams.value.baseYm = now.format('YYYY');
  } else {
    searchParams.value.baseYm = now.subtract(1, 'month').format('YYYYMM');
  }
}, { immediate: true });

watch(() => searchParams.value.sellTpCd, async (val) => {
  if (!isEmpty(val)) {
    searchParams.value.sellTpDtlCd = 'ALL';
  }
});

onMounted(async () => {
  dynamicChangeCodes.value.FEE_GBN_CD = await getCodes();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogTpCd', header: t('MSG_TXT_OG_TP'), width: '140', styleName: 'text-center', options: codes.OG_TP_CD },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '150', styleName: 'text-center', options: codes.SELL_TP_DTL_CD },
    { fieldName: 'pdHclsfNm', header: t('MSG_TXT_PD_HCLSF_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdMclsfNm', header: t('MSG_TXT_PD_MCLSF_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'baseYm', header: t('MSG_TXT_BASE_YM'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'slAmt', header: t('MSG_TXT_SL_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'feeOcAmt', header: `①${t('MSG_TXT_FEE_OC_AMT')}`, width: '140', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'feeOcYm', header: t('MSG_TXT_FEE_OC_YM'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'piaCsYn', header: t('MSG_TXT_PIA_TARGET_YN'), width: '120', styleName: 'text-center', options: piaCsYnCode },
    { fieldName: 'piaSellFeeCrdovrResAmt', header: `②${t('MSG_TXT_PIA_SELL_FEE_CRDOVR_BLAM')}`, width: '180', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'piaFeeOcAmt', header: `③${t('MSG_TXT_FEE_OC_AMT_THIS_MONTH')}`, width: '180', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmt', header: `④${t('MSG_TXT_CS_RPLC_AMT2')}`, width: '140', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmtCancBlam', header: `⑤${t('MSG_TXT_CS_RPLC_AMT_CANC_BLAM')}`, width: '180', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'ttrmCsAmt', header: `⑥${t('MSG_TXT_TTRM_CS_AMT')}`, width: '210', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'piaFeeEotBlam', header: `${t('MSG_TXT_PIA_FEE_EOT_BLAM')}(②+③-⑥)`, width: '220', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.setHeaderSummaries({
    visible: true,
    items: [
      { height: 40 },
      { height: 40 },
      { height: 40 },
    ],
  });

  view.layoutByColumn('ogTpCd').summaryUserSpans = [
    { colspan: 6 },
    { colspan: 6 },
    { colspan: 6 },
  ];

  view.columnByName('ogTpCd').setHeaderSummaries([
    { text: t('MSG_TXT_SUM'), styleName: 'text-center' },
    { text: t('MSG_TXT_PIA_TARGET_SUM'), styleName: 'text-center' },
    { text: t('MSG_TXT_PIA_NON_TARGET_SUM'), styleName: 'text-center' },
  ]);
});

const initGridDtl = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogTpCd', header: t('MSG_TXT_OG_TP'), width: '120', styleName: 'text-center', options: codes.OG_TP_CD },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '150', styleName: 'text-center', options: codes.SELL_TP_DTL_CD },
    { fieldName: 'pdHclsfNm', header: t('MSG_TXT_PD_HCLSF_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdMclsfNm', header: t('MSG_TXT_PD_MCLSF_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'baseYm', header: t('MSG_TXT_BASE_YM'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'feeOcAmt', header: t('MSG_TXT_FEE_OC_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'piaCsYn', header: t('MSG_TXT_PIA_TARGET_YN'), width: '120', styleName: 'text-center', options: piaCsYnCode },
    { fieldName: 'feeOcYm', header: t('MSG_TXT_FEE_OC_YM'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'piaFeeOcAmt', header: t('MSG_TXT_PIA_FEE_OC_AMT'), width: '180', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'stplTn', header: t('MSG_TXT_STPL_CNTS'), width: '120', styleName: 'text-center' },
    { fieldName: 'slAmt', header: t('MSG_TXT_SL_AMT'), width: '140', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'cntrPdEnddt', header: t('MSG_TXT_CNTR_PD_ENDDT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'csRplcYm', header: t('MSG_TXT_CS_RPLC_YM'), width: '120', styleName: 'text-center' },
    { fieldName: 'csRplcAmt', header: t('MSG_TXT_CS_RPLC_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'feeNm', header: t('MSG_TXT_FEE_DV'), width: '180', styleName: 'text-center', visible: false },
    { fieldName: 'dpSlipTrsNo', header: t('MSG_TXT_DP_SLIP_TRS_NO'), width: '180', styleName: 'text-center' },
    { fieldName: 'sapSlpno', header: t('MSG_TXT_FEE_SLPNO'), width: '180', styleName: 'text-center' },
    { fieldName: 'ttrmCsAmt', header: t('MSG_TXT_TTRM_CS_AMT'), width: '200', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAggAmt', header: t('MSG_TXT_CS_RPLC_AGG_AMT'), width: '180', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'piaFeeEotBlam', header: t('MSG_TXT_PIA_FEE_EOT_BLAM'), width: '180', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_PRCSDT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'usrNm', header: t('MSG_TXT_PCP'), width: '120', styleName: 'text-center' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setHeaderSummaries({
    visible: true,
    items: [
      { height: 40 },
      { height: 40 },
      { height: 40 },
    ],
  });

  view.layoutByColumn('ogTpCd').summaryUserSpans = [
    { colspan: 6 },
    { colspan: 6 },
    { colspan: 6 },
  ];

  view.columnByName('ogTpCd').setHeaderSummaries([
    { text: t('MSG_TXT_SUM'), styleName: 'text-center' },
    { text: t('MSG_TXT_PIA_TARGET_SUM'), styleName: 'text-center' },
    { text: t('MSG_TXT_PIA_NON_TARGET_SUM'), styleName: 'text-center' },
  ]);

  view.layoutByColumn('feeOcYm').summaryUserSpans = [
    { colspan: 4 },
    { colspan: 4 },
    { colspan: 4 },
  ];

  view.layoutByColumn('cntrPdEnddt').summaryUserSpans = [
    { colspan: 2 },
    { colspan: 2 },
    { colspan: 2 },
  ];

  view.layoutByColumn('feeNm').summaryUserSpans = [
    { colspan: 3 },
    { colspan: 3 },
    { colspan: 3 },
  ];

  view.layoutByColumn('fnlMdfcDtm').summaryUserSpans = [
    { colspan: 2 },
    { colspan: 2 },
    { colspan: 2 },
  ];
});

const initGridRtDtl = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '150', styleName: 'text-center', options: codes.SELL_TP_DTL_CD },
    { fieldName: 'pdHclsfNm', header: t('MSG_TXT_PD_HCLSF_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdMclsfNm', header: t('MSG_TXT_PD_MCLSF_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'baseYm', header: t('MSG_TXT_BASE_YM'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'piaSellFeeCrdovrResAmt', header: t('MSG_TXT_PIA_SELL_FEE_CRDOVR_BLAM'), width: '170', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'piaFeeOcAmt', header: t('MSG_TXT_PIA_FEE_OC_AMT'), width: '170', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmt1', header: `1${t('MSG_TXT_MON')}`, width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmt2', header: `2${t('MSG_TXT_MON')}`, width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmt3', header: `3${t('MSG_TXT_MON')}`, width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmt4', header: `4${t('MSG_TXT_MON')}`, width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmt5', header: `5${t('MSG_TXT_MON')}`, width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmt6', header: `6${t('MSG_TXT_MON')}`, width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmt7', header: `7${t('MSG_TXT_MON')}`, width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmt8', header: `8${t('MSG_TXT_MON')}`, width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmt9', header: `9${t('MSG_TXT_MON')}`, width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmt10', header: `10${t('MSG_TXT_MON')}`, width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmt11', header: `11${t('MSG_TXT_MON')}`, width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmt12', header: `12${t('MSG_TXT_MON')}`, width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'csRplcAmtTot', header: t('MSG_TXT_CS_RPLC_AMT_SUM'), width: '170', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
    { fieldName: 'piaFeeEotBlam', header: t('MSG_TXT_PIA_FEE_EOT_BLAM'), width: '170', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setFooters({ visible: true, items: [{ height: 40 }] });
  view.layoutByColumn('sellTpCd').footerUserSpans = [{ colspan: 5 }];
  view.columnByName('sellTpCd').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });

  view.columnByName('piaSellFeeCrdovrResAmt').setFooters({ numberFormat: '#,##0', expression: 'sum', styleName: 'text-right' });
  view.columnByName('piaFeeOcAmt').setFooters({ numberFormat: '#,##0', expression: 'sum', styleName: 'text-right' });
  view.columnByName('csRplcAmtTot').setFooters({ numberFormat: '#,##0', expression: 'sum', styleName: 'text-right' });
  view.columnByName('piaFeeEotBlam').setFooters({ numberFormat: '#,##0', expression: 'sum', styleName: 'text-right' });

  for (let i = 1; i < 13; i += 1) {
    view.columnByName(`csRplcAmt${i}`).setFooters({ numberFormat: '#,##0', expression: 'sum', styleName: 'text-right' });
  }

  view.setColumnLayout([
    'sellTpCd',
    'sellTpDtlCd',
    'pdHclsfNm',
    'pdMclsfNm',
    'baseYm',
    'piaSellFeeCrdovrResAmt',
    'piaFeeOcAmt',
    {
      header: t('MSG_TXT_CS_RPLC_AMT'),
      direction: 'horizontal',
      items: [
        'csRplcAmt1',
        'csRplcAmt2',
        'csRplcAmt3',
        'csRplcAmt4',
        'csRplcAmt5',
        'csRplcAmt6',
        'csRplcAmt7',
        'csRplcAmt8',
        'csRplcAmt9',
        'csRplcAmt10',
        'csRplcAmt11',
        'csRplcAmt12',
      ],
    },
    'csRplcAmtTot',
    'piaFeeEotBlam',
  ]);
});
</script>
