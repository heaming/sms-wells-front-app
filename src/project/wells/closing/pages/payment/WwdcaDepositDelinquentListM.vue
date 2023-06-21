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
            @change="onChangeInqrDv"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_SEL_CHNL')">
          <kw-select
            v-if="searchParams.inqrDv === '1'"
            v-model="searchParams.sellChnl"
            :disable="false"
            :options="codes.SELL_CHNL_DTL_CD"
            multiple
          />
          <kw-select
            v-if="searchParams.inqrDv === '2'"
            v-model="searchParams.sellChnl"
            :model-value="'ALL'"
            :disable="true"
            :options="codes.SELL_CHNL_DTL_CD"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SEL_TYPE')"
          :colspan="2"
          required
        >
          <kw-option-group
            v-model="searchParams.sellTpCd"
            type="checkbox"
            rules="required"
            :options="selectSellTpCd.options"
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
  options: [{ codeId: '1', codeName: '판매채널별' }, { codeId: '2', codeName: '상품군별' }],
};

const selectSellTpCd = { // 판매유형
  options: [{ codeId: '1', codeName: '일시불' }, { codeId: '2', codeName: '렌탈' }, { codeId: '3', codeName: '멤버십' }, { codeId: '4', codeName: '금융리스' },
    { codeId: '5', codeName: '홈케어' }, { codeId: '6', codeName: '정기배송(모종)' }],
};

const searchParams = ref({
  perfYm: now.format('YYYYMM'), // 실적년월
  copnDvCd: 'ALL', // 개인/법인구분
  inqrDv: '1', // 조회구분
  sellChnl: [], // 판매채널
  sellTpCd: ['1'], // 판매유형
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
  view.getDataSource().setRows(mainList);
}

// 조회 버튼 클릭 이벤트
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  await fetchData();
}

async function onChangeInqrDv() {
  const grid = [];
  const view = grdMainRef.value.getView();
  if (searchParams.value.inqrDv === '1') {
    view.columnByName('sellInflwChnlDtlCd').visible = true;
    view.columnByName('pdClsfNm').visible = false;
    grdMainRef.value.getData().setRows(grid);
  } else {
    view.columnByName('sellInflwChnlDtlCd').visible = false;
    view.columnByName('pdClsfNm').visible = true;
    grdMainRef.value.getData().setRows(grid);
  }
}

async function onClickExportView() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      width: '100',
      styleName: 'text-left',
      groupFooter: {
        valueCallback(grid, column, groupFooterIndex, group) {
          return `${group.groupValue} ${t('MSG_TXT_SBSUM')}`;
        },
        styleName: 'text-center',
      },
      footer: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '100', styleName: 'text-left' },
    { fieldName: 'sellInflwChnlDtlCd', header: t('MSG_TXT_SEL_CHNL'), width: '80', styleName: 'text-left' },
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PDGRP'), width: '100', styleName: 'text-left', visible: false },
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
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
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
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'fnlAmt',
      header: t('MSG_TXT_UC_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
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
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
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
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'thmNwDpRt',
      header: t('MSG_TXT_DP_RT'),
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.##',
      groupFooter: {
        numberFormat: '#,##0.##',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0.##', styleName: 'text-right' } },
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
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
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
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
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
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'nomDpRt',
      header: t('MSG_TXT_DP_RT'),
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.##',
      groupFooter: {
        numberFormat: '#,##0.##',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0.##', styleName: 'text-right' } },
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
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
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
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
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
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'ucCprDlqRt',
      header: t('MSG_TXT_UC_CPR_DLQR'),
      width: '159',
      styleName: 'text-right',
      hint: t('MSG_TXT_DLQ_AMT_DP_UCAM_TAM'),
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
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
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'dpRt',
      header: t('MSG_TXT_DP_RT'),
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.##',
      groupFooter: {
        numberFormat: '#,##0.##',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0.##', styleName: 'text-right' } },
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
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
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
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'dlqRtSum',
      header: t('MSG_TXT_DLQR_SUM'),
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'sellTpCd', 'sellTpDtlCd', 'sellInflwChnlDtlCd', 'pdClsfNm', 'totAccN', 'ucamTam', // single
    {
      header: t('MSG_TXT_THM_NW'), // colspan title
      direction: 'horizontal', // merge type
      items: ['fnlAmt', 'thmNwAccN', 'thmNwDpAmt', 'thmNwDpRt'],
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
  view.setFooters({ visible: true, items: [{ height: 40 }] });
  view.layoutByColumn('sellTpCd').groupFooterUserSpans = [{ colspan: 3 }];
  view.layoutByColumn('sellTpCd').footerUserSpans = [{ colspan: 3 }];
});
</script>
