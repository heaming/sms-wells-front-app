<!----
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccDelinquentAdamtListM - 매출채권/선수금 현황 - 연체가산금 // W-CL-U-0058M07
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
          v-model="searchParams.perfYm"
          type="month"
          rules="date_range_months:1"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_AGRG_DV')">
        <kw-option-group
          v-model="searchParams.agrgDv"
          type="radio"
          :options="selectAgrgDv.options"
          @change="onChangeAgrgDv"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_TASK_DIV')">
        <kw-select
          v-model="searchParams.sellTpCd"
          :options="codes.SELL_TP_CD"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
        <kw-select
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SEL_CHNL')">
        <kw-select
          v-model="searchParams.sellChnlDtlCd"
          :options="codes.SELL_CHNL_DTL_CD"
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

const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const totalCount = ref(0);
const grdTenRef = ref(getComponentType('KwGrid'));
const searchParams = ref({
  perfYm: dayjs().add(-1, 'M').format('YYYYMM'),
  agrgDv: '1', // 집계구분
  sellTpCd: '1', // 업무구분
  sellTpDtlCd: '', // 판매유형
  sellChnlDtlCd: '1',
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
  const res = await dataService.get('/sms/wells/closing/performance/delinquent-additional-charges', { params: cachedParams });
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
    view.columnByName('cntrNo').visible = false;
    view.columnByName('col4').visible = false;
    view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 2 }];
  } else if (agrgDv === '2') {
    view.columnByName('cntrNo').visible = true;
    view.columnByName('col4').visible = true;
    view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 4 }];
  }
}

async function onClickOpenReport() {
  // 공통 오즈 팝업 가져오면됨
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdTen = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'perfYm' },
    { fieldName: 'col2' },
    { fieldName: 'cntrNo' },
    { fieldName: 'col4' },
    { fieldName: 'btdDlqAddAmt', dataType: 'number' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'thmOcDlqAddAmt', dataType: 'number' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'thmDlqRfndSumAmt', dataType: 'number' },
    { fieldName: 'eotDlqAddAmt', dataType: 'number' },
  ];
  const columns = [
    { fieldName: 'perfYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '150',
      styleName: 'text-left',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    }, // 실적년월
    { fieldName: 'col2', header: t('MSG_TXT_SEL_CHNL'), width: '130', styleName: 'text-left' }, // 판매채널
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-right' }, // 계약상세번호
    { fieldName: 'col4', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-left' }, // 고객명
    { fieldName: 'btdDlqAddAmt',
      header: t('MSG_TXT_FTRM_CRDOVR'),
      width: '130',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      },
    }, // 전기이월
    { fieldName: 'thmOcDlqAddAmt',
      header: t('MSG_TXT_THM_OC'),
      width: '130',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      } }, // 당월발생
    { fieldName: 'col9',
      header: t('MSG_TXT_THM_DDTN'),
      width: '130',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      } }, // 당월공제
    { fieldName: 'col10',
      header: t('MSG_TXT_THM_DP'),
      width: '130',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      } }, // 당월입금
    { fieldName: 'thmDlqRfndSumAmt',
      header: t('MSG_TXT_THM_RFND'),
      width: '130',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      } }, // 당월환불
    { fieldName: 'eotDlqAddAmt',
      header: t('MSG_TXT_EOT_BLAM'),
      width: '130',
      styleName: 'text-right',
      headerSummary: {
        expression: 'sum',
      } }, // 기말잔액
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 4 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
});

const selectAgrgDv = { // 집계구분 - TODO.공통코드가 없는 관계로 임시로
  options: [{ codeId: '1', codeName: '집계' }, { codeId: '2', codeName: '주문별' }],
};
onMounted(async () => {
  const view = grdTenRef.value.getView();
  view.columnByName('cntrNo').visible = false;
  view.columnByName('col4').visible = false;
  view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 2 }];
});
</script>
<style scoped>
</style>
