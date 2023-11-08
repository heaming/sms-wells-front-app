<!----
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccSalesBondAnticipationMAdditionalCharges - 매출채권/선수금 현황 - 연체가산금 // W-CL-U-0058M07
3. 작성자 : gs.piit172 kim juhyun -> gugyeongu
4. 작성일 : 2023.03.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매출채권/선수금 현황 - 연체가산금 프로그램
****************************************************************************************************
--->
<template>
  <kw-search @search="onClickSearch">
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_BASE_YM')"
      >
        <kw-date-picker
          v-model="searchParams.slClYm"
          type="month"
          rules="date_range_months:1"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_AGRG_DV')">
        <kw-option-group
          v-model="searchParams.agrgDv"
          type="radio"
          :options="aggregateDivide.filter((v) => ['1', '3'].includes(v.codeId))"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
        <kw-select
          v-model="searchParams.sellTpCd"
          :options="filteredCodes.SELL_TP_CD"
        />
        <kw-select
          v-model="searchParams.sellTpDtlCd"
          :options="dynamicChangeCodes.SELL_TP_DTL_CD"
          first-option="all"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_SEL_CHNL')">
        <kw-select
          v-model="searchParams.sellChnlDtl"
          :options="codes.SELL_CHNL_DTL_CD"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SAP_PD_DV_CD_NM')">
        <kw-select
          v-model="searchParams.sapPdDvCd"
          :options="sapPdDv"
          first-option="all"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        v-permission:download
        icon="download_on"
        :disable="totalCount === 0"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      ref="grdAdditionalChargeRef"
      name="grdAdditionalCharge"
      :total-count="totalCount"
      @init="initAdditionalChargeGrid"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, gridUtil, useDataService, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import { getAggregateDivide, getSellTpCd, getSellTpDtlCd } from '~/modules/sms-common/closing/utils/clUtil';

const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const searchParams = ref({
  slClYm: dayjs().format('YYYYMM'),
  agrgDv: '1', // 집계구분
  sellTpCd: '2', // 판매유형
  sellTpDtlCd: '', // 판매유형 상세
  sellChnlDtlCd: '', // 판매채널
  sapPdDvCd: '', // SAP상품구분코드
});

const sapPdDv = (await dataService.get('/sms/wells/closing/performance/overdue-penalty/code'))
  .data.map((v) => ({ codeId: v.sapPdDvCd, codeName: v.sapPdDvNm }));
const aggregateDivide = await getAggregateDivide();
const codes = await codeUtil.getMultiCodes(
  'SELL_CHNL_DTL_CD', // 판매채널
);
const customCodes = ref({ SELL_TP_CD: await getSellTpCd(), SELL_TP_DTL_CD: await getSellTpDtlCd() });
const filteredCodes = ref({ SELL_TP_CD: customCodes.value.SELL_TP_CD.filter((obj) => ['2', '3', '6', '10'].includes(obj.codeId)) });
const dynamicChangeCodes = ref({ SELL_TP_DTL_CD: customCodes.value.SELL_TP_DTL_CD.filter(
  (obj) => (obj.userDfn02 === searchParams.value.sellTpCd),
) });
const totalCount = ref(0);
const grdAdditionalChargeRef = ref(getComponentType('KwGrid'));

async function setGridColumnLayoutType1(data, view) {
  if (!view) {
    view = grdAdditionalChargeRef.value.getView();
  }
  if (!data) {
    data = view.getDataSource();
  }
  const columns = [
    { fieldName: 'perfYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '130',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    }, // 실적년월
    { fieldName: 'sellTpCdNm', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-center' }, // 판매유형
    { fieldName: 'sellTpDtlCdNm', header: t('MSG_TXT_SELL_TP_DTL'), width: '130', styleName: 'text-center' }, // 판매유형상세
    { fieldName: 'sapPdAtcNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'btdDlqAddAmt', header: t('MSG_TXT_FTRM_CRDOVR'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 전기이월
    { fieldName: 'thmOcDlqAddAmt', header: t('MSG_TXT_THM_OC'), width: '209', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 당월발생
    { fieldName: 'thmCtrDlqAddAmt', header: t('MSG_TXT_THM_DDTN'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 당월발생
    { fieldName: 'thmDlqAddDpSumAmt', header: t('MSG_TXT_THM_DP'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 당월입금
    { fieldName: 'thmDlqAddRfndSumAmt', header: t('MSG_TXT_THM_RFND'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 당월환불
    { fieldName: 'eotDlqAddAmt', header: t('MSG_TXT_EOT_BLAM'), width: '197', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 기말잔액
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 4 }];
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
}

async function setGridColumnLayoutType2(data, view) {
  if (!view) {
    view = grdAdditionalChargeRef.value.getView();
  }
  if (!data) {
    data = view.getDataSource();
  }
  const columns = [
    { fieldName: 'perfYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '130',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    }, // 실적년월
    { fieldName: 'sellTpCdNm', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-center' }, // 판매유형
    { fieldName: 'sellTpDtlCdNm', header: t('MSG_TXT_SELL_TP_DTL'), width: '130', styleName: 'text-center' }, // 판매유형상세
    { fieldName: 'sapPdAtcNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '130',
      styleName: 'text-center',
    }, // 계약상세번호
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'),
      width: '130',
      styleName: 'text-center',
    }, // 고객명
    { fieldName: 'btdDlqAddAmt', header: t('MSG_TXT_FTRM_CRDOVR'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 전기이월
    { fieldName: 'thmOcDlqAddAmt', header: t('MSG_TXT_THM_OC'), width: '209', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 당월발생
    { fieldName: 'thmCtrDlqAddAmt', header: t('MSG_TXT_THM_DDTN'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 당월공제
    { fieldName: 'thmDlqAddDpSumAmt', header: t('MSG_TXT_THM_DP'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 당월입금
    { fieldName: 'thmDlqAddRfndSumAmt', header: t('MSG_TXT_THM_RFND'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 당월환불
    { fieldName: 'eotDlqAddAmt', header: t('MSG_TXT_EOT_BLAM'), width: '197', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 기말잔액
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 6 }];
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
}

async function setGridHeader() {
  if (searchParams.value.agrgDv === '1') { // 전체
    await setGridColumnLayoutType1();
  } else { // 주문별
    await setGridColumnLayoutType2();
  }
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/closing/performance/delinquent-additional-charges', { params: cachedParams, timeout: 240000 });
  const additionalCharges = res.data;

  totalCount.value = additionalCharges.length;

  const view = grdAdditionalChargeRef.value.getView();
  view.getDataSource().setRows(additionalCharges);
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await setGridHeader();
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdAdditionalChargeRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

watch(() => searchParams.value.sellTpCd, async (sellTpCd) => {
  dynamicChangeCodes.value.SELL_TP_DTL_CD = customCodes.value.SELL_TP_DTL_CD.filter(
    (obj) => (obj.userDfn02 === sellTpCd),
  );
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initAdditionalChargeGrid = defineGrid(async (data, view) => {
  await setGridColumnLayoutType1(data, view);
});
</script>
<style scoped>
</style>
