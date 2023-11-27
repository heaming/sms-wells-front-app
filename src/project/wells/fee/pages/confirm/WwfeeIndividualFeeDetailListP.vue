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

      <kw-option-group
        v-if="searchParams.rsbDvCd === 'W0104' || searchParams.rsbDvCd === 'W0204' || searchParams.rsbDvCd === 'W0301'"
        v-model="searchParams.feeSellPerfDvCd"
        type="radio"
        :options="codes.FEE_SELL_PERF_DV_CD"
      />

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
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="10"
      @init="initGrdMain"
    />
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, gridUtil, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const { currentRoute } = useRouter();
const codes = await codeUtil.getMultiCodes(
  'FEE_SELL_PERF_DV_CD', // 수수료판매실적구분코드
);

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

const searchParams = ref({
  perfYm: props.perfYm,
  ogTpCd: props.ogTpCd,
  prtnrNo: props.prtnrNo,
  feeSellPerfDvCd: '01', // 개인실적
  rsbDvCd: '',
});

let type;
let cachedParams;

// 파트너 직급 조회
async function fetchDataRsbDvCd() {
  const response = await dataService.get('/sms/wells/fee/individual-fees/prtnr-rsb', { params: searchParams.value });
  searchParams.value.rsbDvCd = response.data.rsbDvCd;
}

// 조회
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get(`/sms/wells/fee/individual-fees/${type}-details`, { params: searchParams.value });

  totalCount.value = res.data.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
}

// 엑셀다운로드
async function onClickExcelDownload() {
  cachedParams = cloneDeep(searchParams.value);
  const view = grdMainRef.value.getView();
  const exportLayout = view.getColumns();
  const response = await dataService.get(`/sms/wells/fee/individual-fees/${type}-details`, { params: cachedParams });
  console.log(response.data);
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
    exportLayout,
  });
}

// 그리드 컬럼 세팅
function getGridColumns() {
  const { ogTpCd, feeSellPerfDvCd } = searchParams.value;
  const columns = [];

  if (feeSellPerfDvCd === '01') { // 개인실적
    columns.push(
      { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '121', styleName: 'text-center' }, // 성명
      { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '119', styleName: 'text-center' }, // 파트너번호
      { fieldName: 'rcpdt', header: t('MSG_TXT_RCPDT'), width: '119', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 접수일자
      { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '119', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 매출일자
    );
  } else { // 조직실적
    columns.push(
      { fieldName: 'dgr3LevlDgPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '121', styleName: 'text-center' }, // 성명
      { fieldName: 'dgr3LevlDgPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '119', styleName: 'text-center' }, // 파트너번호
      { fieldName: 'prtnrKnm', header: t('MSG_TXT_RCST'), width: '121', styleName: 'text-center' }, // 접수자
      { fieldName: 'rcpdt', header: t('MSG_TXT_RCPDT'), width: '119', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 접수일자
      { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '119', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 매출일자
    );
  }

  if (ogTpCd === 'W01') { // P조직
    columns.push(
      { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '119', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 취소일자
      { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '129', styleName: 'text-center' }, // 계약상세번호
      { fieldName: 'pdNm', header: t('MSG_TXT_PD_IZ'), width: '239', styleName: 'text-left' }, // 상품명
      { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '119', styleName: 'text-center' }, // 고객명
      { fieldName: 'saleDiv', header: t('MSG_TXT_CHDVC_TP'), width: '119', styleName: 'text-center' }, // 기변유형
      { fieldName: 'perfElhm',
        header: t('MSG_TXT_ELHM_ACKMT_PERF'),
        width: '119',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 가전인정실적
      { fieldName: 'perfElhmExcd',
        header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'),
        width: '119',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 가전외인정실적
      { fieldName: 'perfChng',
        header: t('MSG_TXT_CHNG') + t('MSG_TXT_PD_ACC_RSLT'),
        width: '119',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 기변인정실적
    );
  } else if (ogTpCd === 'W02') { // M조직
    columns.push(
      { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '119', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 취소일자
      { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '129', styleName: 'text-center' }, // 계약상세번호
      { fieldName: 'pdNm', header: t('MSG_TXT_PD_IZ'), width: '239', styleName: 'text-left' }, // 상품명
      { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '119', styleName: 'text-center' }, // 고객명
      { fieldName: 'saleDiv', header: t('MSG_TXT_CHDVC_TP'), width: '119', styleName: 'text-center' }, // 기변유형
      { fieldName: 'perfRental',
        header: t('MSG_TXT_ELHM_BASE_PRC'),
        width: '119',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 가전기준가
      { fieldName: 'perfBsPdAccCnt',
        header: t('MSG_TXT_ELHM_ACKMT_CT'),
        width: '119',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 가전인정건수
      { fieldName: 'perfElhmExcpAckmt',
        header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'),
        width: '119',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 가전외인정실적
    );
  } else if (ogTpCd === 'W03') { // 홈마스터
    columns.push(
      { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '129', styleName: 'text-center' }, // 계약상세번호
      { fieldName: 'pdNm', header: t('MSG_TXT_PD_IZ'), width: '239', styleName: 'text-left' }, // 상품명
      { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '119', styleName: 'text-center' }, // 고객명
      { fieldName: 'saleDiv', header: t('MSG_TXT_SLS_CAT'), width: '119', styleName: 'text-center' }, // 판매구분
      { fieldName: 'pdAccCnt',
        header: t('MSG_TXT_PD_ACC_CNT'),
        width: '119',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 인정건수
      { fieldName: 'perfRental',
        header: t('MSG_TXT_RTLFE'),
        width: '119',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 렌탈료
      { fieldName: 'perfSnglPmnt',
        header: t('MSG_TXT_SNGL_PMNT'),
        width: '119',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 일시불
    );
  }

  return columns;
}

// 그리드 헤더
async function fetchDataHeader() {
  const data = grdMainRef.value.getData();
  const view = grdMainRef.value.getView();

  // 그리드 세팅
  const columns = getGridColumns();
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
}

watch(() => searchParams.value.feeSellPerfDvCd, async () => {
  // 그리드 헤더 세팅
  await fetchDataHeader();

  await fetchData();
});

onMounted(async () => {
  // 파트너의 직급을 가져옴
  await fetchDataRsbDvCd();

  if (searchParams.value.ogTpCd === 'W01') type = 'plar';
  else if (searchParams.value.ogTpCd === 'W02') type = 'mnger';
  else if (searchParams.value.ogTpCd === 'W03') type = 'hmst';

  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = getGridColumns();
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // 헤더쪽 합계 행고정, summary
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });
});
</script>
