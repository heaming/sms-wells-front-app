<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcaDepositDelinquentListM - 입금 연체 현황 - W-CL-U-0016M01
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.05.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 입금 연체 현황
****************************************************************************************************
---->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
      @reset="onClickResetSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_INDV_CRP_DV')">
          <kw-select
            v-model="searchParams.copnDvCd"
            :options="codes.COPN_DV_CD"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
          <kw-option-group
            v-model="searchParams.inqrDv"
            type="radio"
            :options="selectInqrDv.options"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEL_CHNL')"
          required
        >
          <kw-select
            v-if="searchParams.inqrDv === '1'"
            v-model="searchParams.sellChnl"
            :label="$t('MSG_TXT_SEL_CHNL')"
            :disable="false"
            :options="codes.SELL_CHNL_DTL_CD"
            multiple
            rules="required"
          />
          <kw-select
            v-if="searchParams.inqrDv === '2'"
            v-model="searchParams.sellChnl"
            :label="$t('MSG_TXT_SEL_CHNL')"
            :model-value="'ALL'"
            :disable="true"
            :options="codes.SELL_CHNL_DTL_CD"
            first-option="all"
            first-option-value="ALL"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SEL_TYPE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :label="$t('MSG_TXT_SEL_TYPE')"
            :options="codes.SELL_TP_CD"
            first-option="all"
            first-option-value="ALL"
          />

          <kw-select
            v-if="searchParams.sellTpCd === '1' || searchParams.sellTpCd === '2'
              || searchParams.sellTpCd === '3' || searchParams.sellTpCd === '6'"
            v-model="searchParams.sellTpDtlCd"
            :options="codes.SELL_TP_DTL_CD.filter(v => v.userDfn02 === searchParams.sellTpCd)"
            first-option="all"
            first-option-value="ALL"
          />
          <kw-select
            v-else
            v-model="searchParams.sellTpDtlCd"
            :readonly="true"
            :options="codes.SELL_TP_DTL_CD"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
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
          @click="onClickExportView"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, useDataService, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const now = dayjs();
const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const codes = await codeUtil.getMultiCodes(
  'COPN_DV_CD',
  'SELL_CHNL_DTL_CD',
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
);

const selectInqrDv = { // 조회구분
  options: [{ codeId: '1', codeName: t('MSG_TXT_BY_SELL_CHNL') }, { codeId: '2', codeName: t('MSG_TXT_BY_PDGRP') }],
};

const searchParams = ref({
  perfYm: now.format('YYYYMM'), // 실적년월
  copnDvCd: 'ALL', // 개인/법인구분
  inqrDv: '1', // 조회구분
  sellChnl: [], // 판매채널
  sellTpCd: 'ALL', // 판매유형
  sellTpDtlCd: 'ALL', // 판매유형상세
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약상세번호
});

// 조회
let cachedParams;
async function fetchData() {
  const res = await dataService.get('/sms/wells/closing/deposit-delinquents', { params: cachedParams });
  console.log(res.data);
  const mainList = res.data;
  totalCount.value = mainList.length;
  const view = grdMainRef.value.getView();
  if (searchParams.value.inqrDv === '1') {
    view.columnByName('sellInflwChnlDtlCd').visible = true;
    view.columnByName('pdClsfNm').visible = false;
  } else {
    view.columnByName('sellInflwChnlDtlCd').visible = false;
    view.columnByName('pdClsfNm').visible = true;
  }
  view.getDataSource().setRows(mainList);
}

// 조회 버튼 클릭 이벤트
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  await fetchData();
}

// 엑셀 다운로드 버튼 클릭
async function onClickExportView() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

let sellChnlDtlCdList = ref([]);
const initRes = codes.SELL_CHNL_DTL_CD;
// 초기화 버튼 클릭
async function onClickResetSearch() {
  searchParams.value.sellChnl = [];
  sellChnlDtlCdList = [];
  initRes?.forEach((item) => {
    const objKey = item.codeId;
    sellChnlDtlCdList.push(
      {
        codeId: objKey,
        codeName: item.codeName,
      },
    );
    searchParams.value.sellChnl.push(objKey);
  });
}
onMounted(async () => {
  await onClickResetSearch();
});

watch(() => searchParams.value.sellTpCd, () => {
  searchParams.value.sellTpDtlCd = 'ALL';
}, { immediate: true });
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      width: '100',
      styleName: 'text-center',
      groupFooter: {
        valueCallback(grid, column, groupFooterIndex, group) {
          return `${group.groupValue} ${t('MSG_TXT_SBSUM')}`;
        },
        styleName: 'text-center',
      },
      footer: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '100', styleName: 'text-center' }, // 판매유형상세
    { fieldName: 'sellInflwChnlDtlCd', header: t('MSG_TXT_SEL_CHNL'), width: '80', styleName: 'text-center' }, // 판매유입채널상세코드
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PDGRP'), width: '100', styleName: 'text-left', visible: false }, // 상품명
    { fieldName: 'totAccN',
      header: t('MSG_TXT_TOT_ACC_N'),
      width: '120',
      styleName: 'text-right',
      hint: t('MSG_TXT_THM_NW_NOM_DLQ_ACC_N_SUM'),
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 총 계정수
    { fieldName: 'ucamTam',
      header: t('MSG_TXT_UCAM_TAM'),
      width: '120',
      styleName: 'text-right',
      hint: t('MSG_TXT_THM_NW_NOM_UC_DLQ_SUM'),
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 미수금 총액
    { fieldName: 'thmNwAccN',
      header: t('MSG_TXT_ACC_N'),
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 계정수
    { fieldName: 'thmNwDpAmt',
      header: t('MSG_TXT_DP_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 입금금액
    { fieldName: 'nomUcAmt',
      header: t('MSG_TXT_UC_AMT'),
      width: '120',
      styleName: 'text-right',
      hint: t('MSG_TXT_DLQ_AMT_EXCD_NOM_BIL_INC'),
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 미수금액
    { fieldName: 'nomAccN',
      header: t('MSG_TXT_ACC_N'),
      width: '90',
      styleName: 'text-right',
      hint: t('MSG_TXT_NOM_ACC_N_DLQ_ACC_EXCD'),
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 계정수
    { fieldName: 'nomDpAmt',
      header: t('MSG_TXT_DP_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 입금금액
    { fieldName: 'nomDpRt',
      header: t('MSG_TXT_DP_RT'),
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.##',
      groupFooter: {
        valueCallback(grid, column, groupFooterIndex, group) {
          const dpRt = grid.getGroupSummary(group, 'nomUcAmt').sum === 0 ? 0
            : (grid.getGroupSummary(group, 'nomDpAmt').sum / grid.getGroupSummary(group, 'nomUcAmt').sum) * 100;
          return dpRt;
        },
        numberFormat: '#,##0.##',
      },
      footer: { expression: 'sum',
        numberFormat: '#,##0.##',
        styleName: 'text-right',
        valueCallback(grid) {
          const rtSum = grid.getSummary('nomUcAmt', 'sum') === 0 ? 0
            : (grid.getSummary('nomDpAmt', 'sum') / grid.getSummary('nomUcAmt', 'sum')) * 100;

          return rtSum;
        } } }, // 입금률
    { fieldName: 'dlqAmt',
      header: t('MSG_TXT_DLQ_AMT'),
      width: '100',
      styleName: 'text-right',
      hint: t('MSG_TXT_DLQ_ADAMT_EXCD_AMT'),
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 연체금액
    { fieldName: 'dlqAccN',
      header: t('MSG_TXT_ACC_N'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 계정수
    { fieldName: 'dlqDpAmt',
      header: t('MSG_TXT_DP_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 입금금액
    { fieldName: 'ucCprDlqRt',
      header: t('MSG_TXT_UC_CPR_DLQR'),
      width: '159',
      styleName: 'text-right',
      hint: t('MSG_TXT_DLQ_AMT_DP_UCAM_TAM'),
      dataType: 'number',
      groupFooter: {
        valueCallback(grid, column, groupFooterIndex, group) {
          const rtSum = grid.getGroupSummary(group, 'ucamTam').sum === 0 ? 0
            : ((grid.getGroupSummary(group, 'dlqAmt').sum - grid.getGroupSummary(group, 'dlqDpAmt').sum) / (grid.getGroupSummary(group, 'ucamTam').sum)) * 100;

          return rtSum;
        },
        numberFormat: '#,##0.##',
      },
      footer: { expression: 'sum',
        numberFormat: '#,##0.##',
        styleName: 'text-right',
        valueCallback(grid) {
          const rtTotSum = grid.getSummary('ucamTam', 'sum') === 0 ? 0
            : ((grid.getSummary('dlqAmt', 'sum') - grid.getSummary('dlqDpAmt', 'sum')) / (grid.getSummary('ucamTam', 'sum'))) * 100;

          return rtTotSum;
        } } }, // 미수대비연체율
    { fieldName: 'totDpAmt',
      header: t('MSG_TXT_TOT_DP_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 총입금액
    { fieldName: 'dpRt',
      header: t('MSG_TXT_DP_RT'),
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.##',
      groupFooter: {
        valueCallback(grid, column, groupFooterIndex, group) {
          const rtSum = (grid.getGroupSummary(group, 'ucamTam').sum) === 0 ? 100
            : (grid.getGroupSummary(group, 'totDpAmt').sum / (grid.getGroupSummary(group, 'ucamTam').sum)) * 100;

          return rtSum;
        },
        numberFormat: '#,##0.##',
      },
      footer: { expression: 'sum',
        numberFormat: '#,##0.##',
        styleName: 'text-right',
        valueCallback(grid) {
          const rtTotSum = grid.getSummary('ucamTam', 'sum') === 0 ? 100
            : (grid.getSummary('totDpAmt', 'sum') / (grid.getSummary('ucamTam', 'sum'))) * 100;

          return rtTotSum;
        } } }, // 입금률
    { fieldName: 'bilAgg',
      header: t('MSG_TXT_SL_AGG'),
      width: '130',
      styleName: 'text-right',
      hint: t('MSG_TXT_ACU_BIL_AMT'),
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 청구누계
    { fieldName: 'dpAgg',
      header: t('MSG_TXT_DP_AGG'),
      width: '130',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 입금누계
    { fieldName: 'dlqRtSum',
      header: t('MSG_TXT_DLQR_SUM'),
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        valueCallback(grid, column, groupFooterIndex, group) {
          const totDpSum = grid.getGroupSummary(group, 'bilAgg').sum === 0 ? 0
            : ((grid.getGroupSummary(group, 'bilAgg').sum - grid.getGroupSummary(group, 'dpAgg').sum) / (grid.getGroupSummary(group, 'bilAgg').sum)) * 100;

          return Number.isNaN(totDpSum) ? 0 : totDpSum;
        },
        numberFormat: '#,##0.##',
      },
      footer: { expression: 'sum',
        numberFormat: '#,##0.##',
        styleName: 'text-right',
        valueCallback(grid) {
          const rtSum = grid.getSummary('bilAgg', 'sum') === 0 ? 0
            : ((grid.getSummary('bilAgg', 'sum') - grid.getSummary('dpAgg', 'sum')) / (grid.getSummary('bilAgg', 'sum'))) * 100;

          return Number.isNaN(rtSum) ? 0 : rtSum;
        } } }, // 연체율계
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setRowGroup({ expandedAdornments: 'footer', collapsedAdornments: 'footer' });
  // view.setOptions({ summaryMode: 'aggregate' });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'sellTpCd', 'sellTpDtlCd', 'sellInflwChnlDtlCd', 'pdClsfNm', 'totAccN', 'ucamTam', // single
    {
      header: t('MSG_TXT_THM_NW'), // colspan title
      direction: 'horizontal', // merge type
      items: ['thmNwAccN', 'thmNwDpAmt'],
    },
    {
      header: t('MSG_TXT_NOM_LSTMM_CL'), // colspan title
      direction: 'horizontal', // merge type
      items: ['nomUcAmt', 'nomAccN', 'nomDpAmt', 'nomDpRt'],
    },
    {
      header: t('MSG_TXT_DLQ_LSTMM_CL'),
      direction: 'horizontal',
      items: ['dlqAmt', 'dlqAccN', 'dlqDpAmt', 'ucCprDlqRt'],
    },
    {
      header: t('MSG_TXT_THM_DP_SUM'),
      direction: 'horizontal',
      items: ['totDpAmt', 'dpRt'],
    },
    'bilAgg', 'dpAgg', 'dlqRtSum',
  ]);

  view.groupBy(['sellTpCd']);
  view.setFooters({ visible: true, items: [{ height: 42 }] });
  view.layoutByColumn('sellTpCd').groupFooterUserSpans = [{ colspan: 3 }];
  view.layoutByColumn('sellTpCd').footerUserSpans = [{ colspan: 3 }];
});
</script>
