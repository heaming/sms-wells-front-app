<!----
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccSalesBondAnticipationMAdditionalCharges - 매출채권/선수금 현황 - 연체가산금 // W-CL-U-0058M07
3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.03.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매출채권/선수금 현황 - 연체가산금 프로그램
****************************************************************************************************
--->
<template>
  <kw-search
    @search="onClickSearch"
  >
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
          :options="aggregateDivide.filter((v) => ['1', '2'].includes(v.codeId))"
          @change="onChangeAgrgDv"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
        <kw-select
          v-model="searchParams.sellTpCd"
          :options="codes.SELL_TP_CD.filter((v) => ['2', '3', '6'].includes(v.codeId))"
          @change="onChangeBusinessDivide"
        />
        <kw-select
          v-if="searchParams.sellTpCd === '1'"
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '11' || v.codeId === '12' || v.codeId === '13')"
          first-option="all"
          first-option-value="ALL"
        />
        <kw-select
          v-if="searchParams.sellTpCd === '2'"
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '21' || v.codeId === '22' || v.codeId === '23' ||
            v.codeId === '24' || v.codeId === '25'|| v.codeId === '26')"
          @change="onChangeSellTpDtlCd"
        />
        <kw-select
          v-if="searchParams.sellTpCd === '3'"
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '31' || v.codeId === '32'
            || v.codeId === '33' || v.codeId === '34')"
          first-option="all"
          first-option-value="ALL"
        />
        <kw-select
          v-if="searchParams.sellTpCd === '6'"
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '61' || v.codeId === '62' || v.codeId === '63')"
          first-option="all"
          first-option-value="ALL"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_SEL_CHNL')">
        <kw-select
          v-model="searchParams.sellChnlDtlCd"
          :options="codes.SELL_CHNL_DTL_CD"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SAP_PD_DV_CD_NM')">
        <kw-select
          v-model="searchParams.sapPdDvCd"
          :options="sapPdDv"
          option-value="codeId"
          option-label="codeName"
          first-option="all"
          first-option-value="ALL"
        /><!--SAP상품구분코드명-->
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
        icon="report"
        dense
        secondary
        :label="$t('MSG_TXT_RPT_BRWS')"
        @click="onClickOpenReport"
      />

      <kw-separator
        spaced
        vertical
        inset
      />
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
      ref="grdTenRef"
      name="grdTen"
      :visible-rows="10"
      @init="initGrdTen"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, defineGrid, gridUtil, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import { getAggregateDivide } from '~/modules/sms-common/closing/utils/clUtil';

const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// 검색조건 - 판매채널
const sapPdDv = (await dataService.get('/sms/wells/closing/performance/overdue-penalty/code'))
  .data.map((v) => ({ codeId: v.sapPdDvCd, codeName: v.sapPdDvNm }));

const aggregateDivide = await getAggregateDivide();
const totalCount = ref(0);
const grdTenRef = ref(getComponentType('KwGrid'));
const searchParams = ref({
  slClYm: dayjs().add(-1, 'M').format('YYYYMM'),
  agrgDv: '1', // 집계구분
  sellTpCd: '2', // 판매유형
  sellTpDtlCd: '', // 판매유형 상세
  sellChnlDtlCd: 'ALL', // 판매채널
  sapPdDvCd: 'ALL', // SAP상품구분코드
});

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD', // 업무구분
  // 'PD_DTL_CD', 없음
  'SELL_TP_DTL_CD', // 판매유형
  'SELL_CHNL_DTL_CD', // 판매채널
);
let cachedParams;
async function onClickExcelDownload() {
  const view = grdTenRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TIT_SL_BND_ATAM_PS')} - ${t('MSG_TIT_DLQ_ADAMT')}`,
    timePostfix: true,
  });
}

async function fetchData() {
  const { sellTpCd } = searchParams.value;
  const { agrgDv } = searchParams.value;
  const { sellTpDtlCd } = searchParams.value;

  cachedParams.sellTpCd = sellTpCd;
  cachedParams.sellTpDtlCd = sellTpDtlCd;
  let res;
  if (agrgDv === '1') {
    res = await dataService.get('/sms/wells/closing/performance/delinquent-additional-charges/aggregate', { params: cachedParams });
  } else {
    res = await dataService.get('/sms/wells/closing/performance/delinquent-additional-charges/orderUnit', { params: cachedParams });
  }

  const delinquentAdditionalCharges = res.data;

  totalCount.value = delinquentAdditionalCharges.length;

  const view = grdTenRef.value.getView();
  view.getDataSource().setRows(delinquentAdditionalCharges);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onChangeAgrgDv() {
  const { agrgDv } = searchParams.value;
  const view = grdTenRef.value.getView();
  if (agrgDv === '1') {
    view.columnByName('cntrSn').visible = false;
    view.columnByName('cstKnm').visible = false;

    view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 2 }];
  } else if (agrgDv === '2') {
    view.columnByName('cntrSn').visible = true;
    view.columnByName('cstKnm').visible = true;

    view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 4 }];
  }

  onClickSearch();
}

async function onClickOpenReport() {
  // 공통 오즈 팝업 가져오면됨
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdTen = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'perfYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '150',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
      datetimeFormat: 'yyyy-MM',
    }, // 실적년월
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-left' }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '130', styleName: 'text-left' }, // 판매유형상세
    { fieldName: 'sapPdDvCd', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-left' }, // SAP상품구분코드명
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-left' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-left' }, // 고객명
    { fieldName: 'w1Am01',
      header: t('MSG_TXT_FTRM_CRDOVR'),
      width: '130',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      },
    }, // 전기이월
    { fieldName: 'w1Am02',
      header: t('MSG_TXT_THM_OC'),
      width: '130',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      } }, // 당월발생
    { fieldName: 'w1Am03',
      header: t('MSG_TXT_THM_DDTN'),
      width: '130',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      } }, // 당월공제
    { fieldName: 'w1Am04',
      header: t('MSG_TXT_THM_DP'),
      width: '130',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      } }, // 당월입금
    { fieldName: 'w1Am05',
      header: t('MSG_TXT_THM_RFND'),
      width: '130',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      } }, // 당월환불
    { fieldName: 'w1Am06',
      header: t('MSG_TXT_EOT_BLAM'),
      width: '130',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        expression: 'sum',
      } }, // 기말잔액
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 4 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
});

onMounted(async () => {
  const view = grdTenRef.value.getView();
  view.columnByName('cntrSn').visible = false;
  view.columnByName('cstKnm').visible = false;
  view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 2 }];
});
</script>
<style scoped>
</style>
