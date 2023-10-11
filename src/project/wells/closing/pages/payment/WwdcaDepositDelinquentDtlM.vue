<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcaDepositDelinquentDtlM - 입금 연체 상세 - W-CL-U-0017M02
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.05.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 입금 연체 상세
****************************************************************************************************
---->
<template>
  <kw-page>
    <kw-tabs
      v-model="selectedTab"
    >
      <kw-tab
        name="mainTab"
        :label="$t('MSG_TIT_PS_INQR')"
      />
      <kw-tab
        name="detailTab"
        :label="$t('MSG_TIT_CNTR_DTL_INQR')"
      />
    </kw-tabs>
    <kw-tab-panels
      v-model="selectedTab"
    >
      <kw-tab-panel name="mainTab">
        <kw-search @search="onClickSearch">
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
            <kw-search-item
              :label="$t('MSG_TXT_SEL_TYPE')"
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
            <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
              <kw-option-group
                v-model="searchParams.inqrDv"
                type="radio"
                :options="selectInqrDv.options"
              />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item :label="$t('MSG_TXT_DLQ_DV') + '(' + $t('MSG_TXT_LSTMM') + ')'">
              <kw-select
                v-model="searchParams.dlqDv"
                :options="selectDlqDv.options"
                first-option="all"
                first-option-value="ALL"
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_DLQ_MCNT') + '(' + $t('MSG_TXT_LSTMM') + ')'">
              <kw-option-group
                v-model="searchParams.dlqMcnt"
                :disable="searchParams.dlqDv === 'ALL' || searchParams.dlqDv === '1'"
                :options="selectDlqMcnt.options"
                type="checkbox"
              />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item :label="$t('MSG_TXT_OG_TP')">
              <kw-select
                v-model="searchParams.ogTp"
                first-option="all"
                first-option-value="ALL"
                :options="ogTpCd"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_OG_LEVL')"
              :colspan="2"
            >
              <zwogz-level-select
                v-model:og-levl-dv-cd1="searchParams.dgr1LevlOgCd"
                v-model:og-levl-dv-cd2="searchParams.dgr2LevlOgCd"
                v-model:og-levl-dv-cd3="searchParams.dgr3LevlOgCd"
                :og-tp-cd="searchParams.ogTp"
                :start-level="1"
                :end-level="3"
                :base-ym="searchParams.perfYm"
              />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-form-item :label="$t('MSG_TXT_SEQUENCE_NUMBER')">
              <kw-input
                v-model="searchParams.prtnrNo"
                :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
                icon="search"
                clearable
                rules="numeric"
                @click-icon="onClickSearchPntnrNo"
              />
            </kw-form-item>
            <kw-search-item :label="$t('MSG_TXT_INDV_CRP_DV')">
              <kw-select
                v-model="searchParams.copnDvCd"
                :options="codes.COPN_DV_CD"
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
          <kw-search-row>
            <kw-search-item :label="$t('MSG_TXT_CST_NO')">
              <kw-input
                v-model="searchParams.cntrCstNo"
                :label="$t('MSG_TXT_CST_NO')"
                icon="search"
                clearable
                rules="numeric"
                @click-icon="onClickSearchCustomer"
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
      </kw-tab-panel>
      <kw-tab-panel name="detailTab">
        <wwdca-deposit-delinquent-dtl-m-contract>
          v-model:selected-link-id="selectedLinkId"
          />
        </wwdca-deposit-delinquent-dtl-m-contract>
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, useDataService, useGlobal, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZwogzLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import WwdcaDepositDelinquentDtlMContract from './WwdcaDepositDelinquentDtlMContract.vue';

const now = dayjs();
const { t } = useI18n();
const { modal } = useGlobal();
const selectedTab = ref('mainTab');
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'OG_TP_CD',
  'COPN_DV_CD',
);

const selectDlqDv = { // 연체구분
  options: [{ codeId: '1', codeName: t('MSG_TXT_NOM') }, { codeId: '2', codeName: t('MSG_TXT_DLQ') }],
};

const selectDlqMcnt = { // 연체개월
  options: [{ codeId: '0', codeName: '0개월' }, { codeId: '1', codeName: '1개월' }, { codeId: '2', codeName: '2개월' },
    { codeId: '3', codeName: '3개월' }, { codeId: '4', codeName: '4개월' }, { codeId: '5', codeName: '5개월' },
    { codeId: '6', codeName: '6개월' }, { codeId: '7', codeName: '7개월이상' }],
};

const selectInqrDv = { // 조회구분
  options: [{ codeId: '1', codeName: t('MSG_TXT_MANAGEMENT_DEPARTMENT') }, { codeId: '2', codeName: t('MSG_TXT_RGNL_GRP') }, { codeId: '3', codeName: t('MSG_TXT_BRANCH') }],
};

const ogTpCd = codes.OG_TP_CD.filter((v) => ['W01', 'W02'].includes(v.codeId));

const searchParams = ref({
  perfYm: now.format('YYYYMM'), // 실적년월
  dlqDv: 'ALL', // 연체구분
  dlqMcnt: [], // 연체개월
  sellTpCd: 'ALL', // 판매유형
  sellTpDtlCd: 'ALL', // 판매유형상세
  ogTp: 'ALL', // 조직유형
  inqrDv: '1', // 조회구분
  dgr1LevlOgCd: '',
  dgr2LevlOgCd: '',
  dgr3LevlOgCd: '',
  prtnrNo: '', // 파트너번호
  copnDvCd: 'ALL', // 개인/법인구분
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약상세번호
  cntrCstNo: '', // 고객번호
});

// 조회
let cachedParams;
async function fetchData() {
  const res = await dataService.get('/sms/wells/closing/deposit-delinquent-details', { params: cachedParams });
  console.log(res.data);
  const mainList = res.data;
  totalCount.value = mainList.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(mainList);
  if (searchParams.value.inqrDv === '1') {
    view.groupBy(['ogNm']);
    view.setFooters({ visible: true, items: [{ height: 42 }] });
    view.layoutByColumn('ogCd').groupFooterUserSpans = [{ colspan: 6 }];
    view.layoutByColumn('ogCd').footerUserSpans = [{ colspan: 6 }];
  } else if (searchParams.value.inqrDv === '2') {
    view.groupBy(['dgr1LevlOgNm', 'dgr2LevlOgNm']);
    view.setFooters({ visible: true, items: [{ height: 42 }] });
    view.layoutByColumn('ogCd').groupFooterUserSpans = [{ colspan: 6 }];
    view.layoutByColumn('ogCd').footerUserSpans = [{ colspan: 6 }];
  } else if (searchParams.value.inqrDv === '3') {
    view.groupBy(['dgr1LevlOgNm', 'dgr2LevlOgNm', 'dgr3LevlOgNm']);
    view.setFooters({ visible: true, items: [{ height: 42 }] });
    view.layoutByColumn('ogCd').groupFooterUserSpans = [{ colspan: 6 }];
    view.layoutByColumn('ogCd').footerUserSpans = [{ colspan: 6 }];
  }
}

// 조회 버튼 클릭 이벤트
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  await fetchData();
}

/**
 * 파트너 검색 팝업
 */
async function onClickSearchPntnrNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP', // Z-OG-U-0050P01
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
      // ogTpCd: searchParams.value.ogTp,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

/**
 * 고객조회 팝업(고객번호)
 */
async function onClickSearchCustomer() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: {
      cstNo: searchParams.value.cntrCstNo,
      cstType: '1',
    },
  });
  if (result) {
    searchParams.value.cntrCstNo = payload.cstNo;
  }
}

async function onClickExportView() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

watch(() => searchParams.value.sellTpCd, () => {
  searchParams.value.sellTpDtlCd = 'ALL';
}, { immediate: true });
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogCd',
      header: t('MSG_TXT_OG_CD'),
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
      } },
    { fieldName: 'ogNm', header: t('MSG_TXT_OG_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'dgr1LevlOgCd', width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'dgr1LevlOgNm', width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'dgr2LevlOgCd', width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'dgr2LevlOgNm', width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'dgr3LevlOgCd', width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'dgr3LevlOgNm', width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center' },
    { fieldName: 'sellTpDtlNm', header: t('MSG_TXT_SELL_TP_DTL'), width: '120', styleName: 'text-center' },
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
    { fieldName: 'thmNwUcAmt',
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
        valueCallback(grid, column, groupFooterIndex, group) {
          const thmNwDpRtSum = grid.getGroupSummary(group, 'thmNwUcAmt').sum === 0 ? 0
            : (grid.getGroupSummary(group, 'thmNwDpAmt').sum / grid.getGroupSummary(group, 'thmNwUcAmt').sum) * 100;
          return thmNwDpRtSum;
        },
        numberFormat: '#,##0.##',
      },
      footer: { expression: 'sum',
        numberFormat: '#,##0.##',
        styleName: 'text-right',
        valueCallback(grid) {
          const rtSum = grid.getSummary('thmNwUcAmt', 'sum') === 0 ? 0
            : (grid.getSummary('thmNwDpAmt', 'sum') / grid.getSummary('thmNwUcAmt', 'sum')) * 100;

          return rtSum;
        } } },
    { fieldName: 'nomUcAmt',
      header: t('MSG_TXT_UC_AMT'),
      width: '110',
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
        valueCallback(grid, column, groupFooterIndex, group) {
          const nomDpAmtRtSum = grid.getGroupSummary(group, 'nomUcAmt').sum === 0 ? 0
            : (grid.getGroupSummary(group, 'nomDpAmt').sum / grid.getGroupSummary(group, 'nomUcAmt').sum) * 100;

          return nomDpAmtRtSum;
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
        } } },
    { fieldName: 'dlqAmt',
      header: t('MSG_TXT_DLQ_AMT'),
      width: '110',
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
      width: '80',
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
      width: '170',
      styleName: 'text-right',
      hint: t('MSG_TXT_DLQ_AMT_DP_UCAM_TAM'),
      dataType: 'number',
      numberFormat: '#,##0.##',
      groupFooter: {
        valueCallback(grid, column, groupFooterIndex, group) {
          const rtSum = (grid.getGroupSummary(group, 'thmNwUcAmt').sum + grid.getGroupSummary(group, 'nomUcAmt').sum) === 0 ? 0
            : ((grid.getGroupSummary(group, 'dlqAmt').sum - grid.getGroupSummary(group, 'dlqDpAmt').sum) / (grid.getGroupSummary(group, 'thmNwUcAmt').sum + grid.getGroupSummary(group, 'nomUcAmt').sum)) * 100;

          return rtSum;
        },
        numberFormat: '#,##0.##',
      },
      footer: { expression: 'sum',
        numberFormat: '#,##0.##',
        styleName: 'text-right',
        valueCallback(grid) {
          const rtTotSum = (grid.getSummary('thmNwUcAmt', 'sum') + grid.getSummary('nomUcAmt', 'sum')) === 0 ? 0
            : ((grid.getSummary('dlqAmt', 'sum') - grid.getSummary('dlqDpAmt', 'sum')) / (grid.getSummary('thmNwUcAmt', 'sum') + grid.getSummary('nomUcAmt', 'sum'))) * 100;

          return rtTotSum;
        } } },
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
        valueCallback(grid, column, groupFooterIndex, group) {
          const totDpSum = grid.getGroupSummary(group, 'nomUcAmt').sum + grid.getGroupSummary(group, 'thmNwUcAmt').sum === 0 ? 0
            : ((grid.getGroupSummary(group, 'nomDpAmt').sum + grid.getGroupSummary(group, 'thmNwDpAmt').sum) / (grid.getGroupSummary(group, 'nomUcAmt').sum + grid.getGroupSummary(group, 'thmNwUcAmt').sum)) * 100;

          return Number.isNaN(totDpSum) ? 0 : totDpSum;
        },
        numberFormat: '#,##0.##',
      },
      footer: { expression: 'sum',
        numberFormat: '#,##0.##',
        styleName: 'text-right',
        valueCallback(grid) {
          const rtSum = grid.getSummary('nomUcAmt', 'sum') + grid.getSummary('thmNwUcAmt', 'sum') === 0 ? 0
            : ((grid.getSummary('nomDpAmt', 'sum') + grid.getSummary('thmNwDpAmt', 'sum')) / (grid.getSummary('nomUcAmt', 'sum') + grid.getSummary('thmNwUcAmt', 'sum'))) * 100;

          return Number.isNaN(rtSum) ? 0 : rtSum;
        } } },
    { fieldName: 'bilAgg',
      header: t('MSG_TXT_SL_AGG'),
      width: '140',
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
      numberFormat: '#,##0.##',
      groupFooter: {
        valueCallback(grid, column, groupFooterIndex, group) {
          const totDpSum = grid.getGroupSummary(group, 'bilAgg').sum === 0 ? 0
            : ((grid.getGroupSummary(group, 'thmNwDpAmt').sum + grid.getGroupSummary(group, 'nomDpAmt').sum + grid.getGroupSummary(group, 'dlqDpAmt').sum) / (grid.getGroupSummary(group, 'bilAgg').sum)) * 100;

          return Number.isNaN(totDpSum) ? 0 : totDpSum;
        },
        numberFormat: '#,##0.##',
      },
      footer: { expression: 'sum',
        numberFormat: '#,##0.##',
        styleName: 'text-right',
        valueCallback(grid) {
          const rtSum = grid.getSummary('bilAgg', 'sum') === 0 ? 0
            : ((grid.getSummary('thmNwDpAmt', 'sum') + grid.getSummary('nomDpAmt', 'sum') + grid.getSummary('dlqDpAmt', 'sum')) / (grid.getSummary('bilAgg', 'sum'))) * 100;

          return Number.isNaN(rtSum) ? 0 : rtSum;
        } } },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setRowGroup({ expandedAdornments: 'footer', collapsedAdornments: 'footer' });
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'ogCd', 'ogNm', 'dgr1LevlOgCd', 'dgr1LevlOgNm', 'dgr2LevlOgCd', 'dgr2LevlOgNm', 'dgr3LevlOgCd', 'dgr3LevlOgNm',
    'prtnrNo', 'prtnrKnm', 'sellTpNm', 'sellTpDtlNm', 'totAccN', 'ucamTam', // single
    {
      header: t('MSG_TXT_THM_NW'), // colspan title
      direction: 'horizontal', // merge type
      items: ['thmNwUcAmt', 'thmNwAccN', 'thmNwDpAmt', 'thmNwDpRt'],
    },
    {
      header: t('MSG_TXT_NOM_LSTMM_CL'), // colspan title
      direction: 'horizontal', // merge type
      items: ['nomUcAmt', 'nomAccN', 'nomDpAmt', 'nomDpRt'],
    },
    {
      header: t('MSG_TXT_DLQ_LSTMM_CL'), // colspan title
      direction: 'horizontal', // merge type
      items: ['dlqAmt', 'dlqAccN', 'dlqDpAmt', 'ucCprDlqRt'],
    },
    {
      header: t('MSG_TXT_THM_DP_SUM'), // colspan title
      direction: 'horizontal', // merge type
      items: ['totDpAmt', 'dpRt'],
    },
    'bilAgg', 'dpAgg', 'dlqRtSum',
  ]);
});
</script>
