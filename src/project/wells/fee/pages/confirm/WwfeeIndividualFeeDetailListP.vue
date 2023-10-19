<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEE
2. 프로그램 ID : WwfeeIndividualFeeDetailListP - 수수료 개인별 상세조회(공통)-건수확인
3. 작성자 : seoin.jeon
4. 작성일 : 2023.02.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 개인별 상세조회(공통)-건수확인
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
        <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
      </template>

      <kw-btn
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      v-if="searchParams.ogTpCd==='W01'"
      ref="grdPlarRef"
      name="grdPlar"
      :visible-rows="10"
      @init="initGrdPlar"
    />
    <kw-grid
      v-if="searchParams.ogTpCd==='W02'"
      ref="grdMngerRef"
      name="grdMnger"
      :visible-rows="10"
      @init="initGrdMnger"
    />
    <kw-grid
      v-if="searchParams.ogTpCd==='W03'"
      ref="grdHmstRef"
      name="grdHmst"
      :visible-rows="10"
      @init="initGrdHmst"
    />
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, gridUtil } from 'kw-lib';

const dataService = useDataService();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const grdPlarRef = ref(getComponentType('KwGrid'));
const grdMngerRef = ref(getComponentType('KwGrid'));
const grdHmstRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const { currentRoute } = useRouter();

const props = defineProps({
  perfYm: { // 실적년월
    type: String,
    required: true,
  },
  ogTpCd: { // 조직유형코드(W01:P조직, W02:M조직, W03:홈마스터)
    type: String,
    required: true,
  },
  prtnrNo: { // 번호
    type: String,
    required: true,
  },
});

let grdMain;
const searchParams = ref({
  perfYm: props.perfYm,
  ogTpCd: props.ogTpCd,
  prtnrNo: props.prtnrNo,
});

watch(() => searchParams.value.ogTpCd, async (val) => {
  if (val === 'W01') grdMain = grdPlarRef;
  else if (val === 'W02') grdMain = grdMngerRef;
  else if (val === 'W03') grdMain = grdHmstRef;
}, { immediate: true });

// 조회
async function fetchData(type) {
  const res = await dataService.get(`/sms/wells/fee/individual-fees/${type}-details`, { params: searchParams.value });

  totalCount.value = res.data.length;

  const view = grdMain.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  let type;
  if (searchParams.value.ogTpCd === 'W01') type = 'plar';
  else if (searchParams.value.ogTpCd === 'W02') type = 'mnger';
  else if (searchParams.value.ogTpCd === 'W03') type = 'hmst';

  const response = await dataService.get(`/sms/wells/fee/individual-fees/${type}-details`, { params: searchParams.value });
  const view = grdMain.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

onMounted(async () => {
  let type;
  if (searchParams.value.ogTpCd === 'W01') type = 'plar';
  else if (searchParams.value.ogTpCd === 'W02') type = 'mnger';
  else if (searchParams.value.ogTpCd === 'W03') type = 'hmst';

  fetchData(type);
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdPlar = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '121', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '119', styleName: 'text-center' },
    { fieldName: 'rcpdt', header: t('MSG_TXT_RCPDT'), width: '119', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '119', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '119', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '119', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_IZ'), width: '239', styleName: 'text-left' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '119', styleName: 'text-center' },
    { fieldName: 'saleDiv', header: t('MSG_TXT_CHDVC_TP'), width: '119', styleName: 'text-center' },
    { fieldName: 'perfElhm',
      header: t('MSG_TXT_ELHM_ACKMT_PERF'),
      width: '119',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'perfElhmExcd',
      header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'),
      width: '119',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'perfChng',
      header: t('MSG_TXT_CHNG') + t('MSG_TXT_PD_ACC_RSLT'),
      width: '119',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },

    // { fieldName: 'perfAtcNm', header: t('MSG_TXT_PERF_DV'), width: '119', styleName: 'text-center' },
    // { fieldName: 'cntrwTpNm', header: t('MSG_TXT_PRDT_GUBUN'), width: '119', styleName: 'text-center' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.layoutByColumn('prtnrKnm').summaryUserSpans = [
    { colspan: 9 },
  ];
  view.setHeaderSummaries({
    visible: true,
    items: [
      { height: 40 },
    ],
  });
  view.columnByName('prtnrKnm').setHeaderSummaries([
    { text: t('MSG_TXT_SUM'), styleName: 'text-center' },
  ]);
});

const initGrdMnger = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '121', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '119', styleName: 'text-center' },
    { fieldName: 'rcpdt', header: t('MSG_TXT_RCPDT'), width: '119', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '119', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '119', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '119', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_IZ'), width: '239', styleName: 'text-left' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '119', styleName: 'text-center' },
    { fieldName: 'saleDiv', header: t('MSG_TXT_CHDVC_TP'), width: '119', styleName: 'text-center' },
    { fieldName: 'perfRental',
      header: t('MSG_TXT_ELHM_BASE_PRC'),
      width: '119',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'perfBsPdAccCnt',
      header: t('MSG_TXT_ELHM_ACKMT_CT'),
      width: '119',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'perfElhmExcpAckmt',
      header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'),
      width: '119',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // { fieldName: 'perfSnglPmnt', header: t('MSG_TXT_ENVR_ELHM') + t('MSG_TXT_SNGL_PMNT')
    // , width: '119', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    // { fieldName: 'perfFxam', header: t('MSG_TXT_ENVR_ELHM') + t('MSG_TXT_FXAM'), width: '119'
    // , styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.layoutByColumn('prtnrKnm').summaryUserSpans = [
    { colspan: 9 },
  ];
  view.setHeaderSummaries({
    visible: true,
    items: [
      { height: 40 },
    ],
  });
  view.columnByName('prtnrKnm').setHeaderSummaries([
    { text: t('MSG_TXT_SUM'), styleName: 'text-center' },
  ]);
});

const initGrdHmst = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '121', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '119', styleName: 'text-center' },
    { fieldName: 'rcpdt', header: t('MSG_TXT_RCPDT'), width: '119', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '119', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '119', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_IZ'), width: '239', styleName: 'text-left' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '119', styleName: 'text-center' },
    { fieldName: 'saleDiv', header: t('MSG_TXT_SLS_CAT'), width: '119', styleName: 'text-center' },
    { fieldName: 'pdAccCnt',
      header: t('MSG_TXT_PD_ACC_CNT'),
      width: '119',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'perfRental',
      header: t('MSG_TXT_RTLFE'),
      width: '119',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'perfSnglPmnt',
      header: t('MSG_TXT_SNGL_PMNT'),
      width: '119',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.layoutByColumn('prtnrKnm').summaryUserSpans = [
    { colspan: 8 },
  ];
  view.setHeaderSummaries({
    visible: true,
    items: [
      { height: 40 },
    ],
  });
  view.columnByName('prtnrKnm').setHeaderSummaries([
    { text: t('MSG_TXT_SUM'), styleName: 'text-center' },
  ]);
});
</script>
