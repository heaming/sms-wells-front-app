<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEF
2. 프로그램 ID : WwfefEstimateFeeMOgListM - 예상수수료 조회(M조직)
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.03.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 23.04.18 퍼블 최신화
****************************************************************************************************
--->
<template>
  <kw-page>
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
          :label="$t('MSG_TXT_PERF_INQR')"
          required
        >
          <kw-option-group
            v-model="searchParams.perType"
            :label="$t('MSG_TXT_PERF_INQR')"
            type="radio"
            rules="required"
            :options="[{ codeId: '00', codeName: $t('MSG_TXT_RCP') },
                       { codeId: '01', codeName: $t('MSG_TXT_SL') }]"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          required
        >
          <kw-input
            v-model="searchParams.sellPrtnrNo"
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            rules="required"
            icon="search"
            clearable
            @click-icon="onClickSearchPrtnrNoPopup"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <!-- 기본정보 -->
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_DEFAULT_INFO') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-form
        dense
      >
        <kw-form-row>
          <!-- 성명 -->
          <kw-form-item :label="$t('MSG_TXT_EMPL_NM')">
            <p>{{ baseInfo.prtnrKnm }}</p>
          </kw-form-item>
          <!-- 소속 -->
          <kw-form-item :label="$t('MSG_TXT_BLG')">
            <p>{{ baseInfo.ogCd }}</p>
          </kw-form-item>
          <!-- 직책 -->
          <kw-form-item :label="$t('MSG_TXT_RSB')">
            <p>{{ codes.RSB_DV_CD.find((code) => code.codeId === baseInfo.rsbDvCd)?.codeName }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 예상판매수수료 -->
          <kw-form-item :label="$t('MSG_TXT_EST_SAL_COMM')">
            <p>{{ stringUtil.getNumberWithComma(baseInfo.amtEstSalFee) }}</p>
          </kw-form-item>
          <!-- 예상bs수수료 -->
          <kw-form-item
            :label="$t('MSG_TXT_EST_BS_FEE')"
            align-content="right"
          >
            <p>{{ stringUtil.getNumberWithComma(baseInfo.amtEstBsFee) }}</p>
          </kw-form-item>
          <!-- 예상수수료합계 -->
          <kw-form-item
            :label="$t('MSG_TXT_TOT_EST_FEE')"
            align-content="right"
          >
            <p>{{ stringUtil.getNumberWithComma(baseInfo.amtFeeSum) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 개시차월 -->
          <kw-form-item
            :label="$t('MSG_TXT_OPNG_NMN')"
            align-content="left"
          >
            <p>{{ stringUtil.getDateFormat(baseInfo.ojDsbYm).substr(0,7) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <!-- 실적내역 -->
      <h3>{{ t('MSG_TXT_PERF_DETAIL') }}</h3>
      <kw-action-top>
        <template #left>
          <span> {{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          :label="$t('MSG_TXT_CALCULATE')"
          dense
          primary
          @click="onClickCalculateDetail"
        />
      </kw-action-top>
      <kw-grid
        ref="grdDetailRef"
        :visible-rows="2"
        @init="initGridDetail"
      />
      <kw-separator />
      <!-- BS내역 -->
      <h3>{{ t('MSG_TXT_BS_IZ') }}</h3>
      <kw-action-top>
        <template #left>
          <span> {{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          :label="$t('MSG_TXT_CALCULATE')"
          dense
          primary
          @click="onClickCalculateBs"
        />
      </kw-action-top>
      <kw-grid
        ref="grdBsRef"
        :visible-rows="3"
        @init="initGridBs"
      />
      <kw-separator />
      <!-- 예상수수료 내역 -->
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_EST_FEE_DTL') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-grid
        ref="grdDstRef"
        :visible-rows="1"
        @init="initGridDstDtl"
      />
      <kw-separator />
      <!-- 판매내역 -->
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_SAL_HIST') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-grid
        ref="grdSalesRef"
        :visible-rows="3"
        @init="initGridSalesHist"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, useDataService, useGlobal, getComponentType, codeUtil, stringUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const now = dayjs();
const { modal, notify } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
  'CNTRW_TP_CD',
  'CNTR_TP_CD',
);

const grdDetailRef = ref(getComponentType('KwGrid'));
const grdBsRef = ref(getComponentType('KwGrid'));
const grdDstRef = ref(getComponentType('KwGrid'));
const grdSalesRef = ref(getComponentType('KwGrid'));
const grdDetailData = computed(() => grdDetailRef.value?.getData());
const grdBsData = computed(() => grdBsRef.value?.getData());
const grdDstData = computed(() => grdDstRef.value?.getData());
const grdSalesData = computed(() => grdSalesRef.value?.getData());

let cachedParams;
const searchParams = ref({
  perfYm: now.format('YYYYMM'),
  perType: '00',
  sellPrtnrNo: '',
});
const baseInfo = ref({
  prtnrKnm: '',
  ogCd: '',
  rsbDvCd: '',
  amtEstSalFee: 0,
  amtEstBsFee: 0,
  amtFeeSum: 0,
  ojDsbYm: '',
});
// 데이터 조회
async function fetchData() {
  const { data } = await dataService.get('/sms/wells/fee/estimate/m-og', { params: { ...cachedParams } });
  baseInfo.value = data.base;
  grdDetailData.value.setRows(data.performances);
  grdBsData.value.setRows(data.bses);
  grdDstData.value.setRows(data.estimates);
  grdSalesData.value.setRows(data.sales);
}
// 조회버튼
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// 파트너 검색 팝업
async function onClickSearchPrtnrNoPopup() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.sellPrtnrNo,
    },
  });
  if (result) {
    searchParams.value.sellPrtnrNo = payload.prtnrNo;
  }
}
// 실적내역 계산버튼 클릭
async function onClickCalculateDetail() {
  notify('수수료 계산 API 개발후 진행');
}

// BS내역 계산버튼 클릭
async function onClickCalculateBs() {
  notify('수수료 계산 API 개발후 진행');
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridDetail = defineGrid((data, view) => {
  const columns = [
    {
      fieldName: 'type',
      header: t('MSG_TXT_DIV'),
      width: '220',
      styleName: 'text-left',
      displayCallback(grid, index, value) {
        const title = { A: t('MSG_TXT_PERF_PS'), B: t('MSG_TXT_PRJTD_PERF') };
        return title[value];
      },
    },
    { fieldName: 'elhmAckmtCt', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '171', dataType: 'number', styleName: 'text-right' },
    { fieldName: 'spayIstm', header: t('MSG_TXT_LUMP_SUM_INST'), width: '172', dataType: 'number', styleName: 'text-right' },
    { fieldName: 'baseRtlfe', header: t('MSG_TXT_BASE_RTLFE'), width: '172', dataType: 'number', styleName: 'text-right' },
    { fieldName: 'bfsvcAckmtCt', header: t('MSG_TXT_BFSVC_ACKMT_CT'), width: '172', dataType: 'number', styleName: 'text-right' },
    {
      fieldName: 'plarSrtup',
      header: t('MSG_TXT_PLAR_SRTUP'),
      width: '172',
      styleName: 'text-center',
      options: ['Y', 'N'].map((v) => ({ codeId: v, codeName: v })),
      styleCallback(grid, dataCell) {
        if (grid.getValue(dataCell.index.itemIndex, 'type') === 'B') {
          return {
            editable: false,
            renderer: { type: 'radio' },
          };
        }
        return { renderer: { type: 'text' } };
      },
    },
    {
      fieldName: 'topmrPlarStmnt',
      header: t('MSG_TXT_TOPMR_PLAR_STMNT'),
      width: '172',
      styleName: 'text-center',
      options: ['Y', 'N'].map((v) => ({ codeId: v, codeName: v })),
      styleCallback(grid, dataCell) {
        if (grid.getValue(dataCell.index.itemIndex, 'type') === 'B') {
          return {
            editable: false,
            renderer: { type: 'radio' },
          };
        }
        return { renderer: { type: 'text' } };
      },
    },
    {
      fieldName: 'plarPrtic',
      header: t('MSG_TXT_PLAR_PRTIC'),
      width: '172',
      styleName: 'text-center',
      options: ['Y', 'N'].map((v) => ({ codeId: v, codeName: v })),
      styleCallback(grid, dataCell) {
        if (grid.getValue(dataCell.index.itemIndex, 'type') === 'B') {
          return {
            editable: false,
            renderer: { type: 'radio' },
          };
        }
        return { renderer: { type: 'text' } };
      },
    },
    {
      fieldName: 'managerSrtup',
      header: t('MSG_TXT_MANAGER_SRTUP'),
      width: '171',
      styleName: 'text-center',
      options: ['Y', 'N'].map((v) => ({ codeId: v, codeName: v })),
      styleCallback(grid, dataCell) {
        if (grid.getValue(dataCell.index.itemIndex, 'type') === 'B') {
          return {
            editable: false,
            renderer: { type: 'radio' },
          };
        }
        return { renderer: { type: 'text' } };
      },
    },
    {
      fieldName: 'managerStmnt',
      header: t('MSG_TXT_MANAGER_STMNT'),
      width: '172',
      styleName: 'text-center',
      options: ['Y', 'N'].map((v) => ({ codeId: v, codeName: v })),
      styleCallback(grid, dataCell) {
        if (grid.getValue(dataCell.index.itemIndex, 'type') === 'B') {
          return {
            editable: false,
            renderer: { type: 'radio' },
          };
        }
        return { renderer: { type: 'text' } };
      },
    },
    {
      fieldName: 'cmpfEduc',
      header: t('MSG_TXT_CMPF_EDUC'),
      width: '172',
      styleName: 'text-center',
      options: ['Y', 'N'].map((v) => ({ codeId: v, codeName: v })),
      styleCallback(grid, dataCell) {
        if (grid.getValue(dataCell.index.itemIndex, 'type') === 'B') {
          return {
            editable: false,
            renderer: { type: 'radio' },
          };
        }
        return { renderer: { type: 'text' } };
      },
    },
    {
      fieldName: 'metgPrscDc',
      header: t('MSG_TXT_METG_PRSC_DC'),
      width: '172',
      styleName: 'text-right',
      options: ['Y', 'N'].map((v) => ({ codeId: v, codeName: v })),
      styleCallback(grid, dataCell) {
        if (grid.getValue(dataCell.index.itemIndex, 'type') === 'B') {
          return {
            editable: false,
            renderer: { type: 'radio' },
          };
        }
        return { renderer: { type: 'text' } };
      },
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  view.editOptions.columnEditableFirst = true;
  view.onCellEditable = (grid, index) => {
    if (grid.getValue(index.itemIndex, 'type') === 'A') {
      return false;
    }
  };
});

const initGridBs = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'type',
      header: t('MSG_TXT_DIV'),
      styleName: 'text-center',
      width: '120',
      displayCallback(grid, index, value) {
        const title = { A: t('MSG_TXT_ASGN_CT'), B: t('MSG_TXT_FHS_CT') };
        return title[value];
      },
    },
    { fieldName: 'wrfr01', header: `${t('MSG_TXT_WRFR')} 1`, styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'wrfr02', header: `${t('MSG_TXT_WRFR')} 2`, styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'wrfr03', header: `${t('MSG_TXT_WRFR')} 3`, styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'wrfr04', header: `${t('MSG_TXT_WRFR')} 4`, styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'unWrfr', header: t('MSG_TXT_UN_WRFR'), styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'puf01', header: `${t('MSG_TXT_PUF')} 1`, styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'puf02', header: `${t('MSG_TXT_PUF')} 2`, styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'otscEtc', header: t('MSG_TXT_ETC_ITEMS_1'), styleName: 'text-right', dataType: 'number', width: '204' },
    { fieldName: 'bdtEtc', header: t('MSG_TXT_ETC_ITEMS_2'), styleName: 'text-right', dataType: 'number', width: '115' },
    { fieldName: 'etcFxamDsb', header: t('MSG_TXT_ETC_FXAM_DSB'), styleName: 'text-right', dataType: 'number', width: '129' },
    { fieldName: 'sum', header: t('MSG_TXT_SUM'), styleName: 'text-right', width: '129', dataType: 'number' },
    { fieldName: 'procRate', header: t('MSG_TXT_BS_PROC_RATE'), styleName: 'text-right', width: '106' },
    { fieldName: 'w1', header: t('W1'), styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'w2', header: t('W2'), styleName: 'text-right', dataType: 'number', width: '109' },
  ];
  const fields = [
    { fieldName: 'type' },
    { fieldName: 'wrfr01', dataType: 'number' },
    { fieldName: 'wrfr02', dataType: 'number' },
    { fieldName: 'wrfr03', dataType: 'number' },
    { fieldName: 'wrfr04', dataType: 'number' },
    { fieldName: 'unWrfr', dataType: 'number' },
    { fieldName: 'puf01', dataType: 'number' },
    { fieldName: 'puf02', dataType: 'number' },
    { fieldName: 'otscEtc', dataType: 'number' },
    { fieldName: 'bdtEtc', dataType: 'number' },
    { fieldName: 'etcFxamDsb', dataType: 'number' },
    { fieldName: 'sum',
      dataType: 'number',
      valueExpression: "values['wrfr01'] + values['wrfr02'] + values['wrfr03'] + values['wrfr04'] + values['unWrfr'] + values['puf01'] + values['puf02'] + values['otscEtc'] + values['bdtEtc'] + values['etcFxamDsb']",
    },
    { fieldName: 'procRate' },
    { fieldName: 'w1' },
    { fieldName: 'w2' },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  view.editOptions.editable = true;
  view.onCellEditable = (grid, index) => {
    if (['A', 'B'].includes(grid.getValue(index.itemIndex, 'type'))) {
      return false;
    }
  };
  view.setColumnLayout([
    'type',
    {
      header: t('MSG_TXT_PRD_GRP'),
      direction: 'horizontal',
      items: ['wrfr01', 'wrfr02', 'wrfr03', 'wrfr04', 'unWrfr', 'puf01', 'puf02', 'otscEtc', 'bdtEtc', 'etcFxamDsb', 'sum'],
    },
    'procRate',
    {
      header: t('MSG_TXT_RGLVL'),
      direction: 'horizontal',
      items: ['w1', 'w2'],
    },
  ]);
});

const initGridDstDtl = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'type',
      header: t('MSG_TXT_DIV'),
      styleName: 'text-center',
      width: '145',
      displayCallback() {
        return t('MSG_TXT_EST_FEE');
      },
      footer: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    },
    { fieldName: 'amtSumElhmPrpn',
      header: t('MSG_TXT_ELHM_PRPN'),
      styleName: 'text-right',
      width: '157',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        valueCallback(grid) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();
          for (let i = 0; i < cnt; i += 1) {
            sum += prod.getValue(i, 'amtSumElhmPrpn');
            sum += prod.getValue(i, 'amtSumElhmMetg');
            sum += prod.getValue(i, 'amtSumElhmExcpPrpn');
            sum += prod.getValue(i, 'amtSumElhmExcpMetg');
            sum += prod.getValue(i, 'amtEdu');
            sum += prod.getValue(i, 'amtSumStmnt');
          }
          return sum;
        },
      },
    },
    { fieldName: 'amtSumElhmMetg', header: t('MSG_TXT_ELHM_METG'), styleName: 'text-right', dataType: 'number', width: '157' },
    { fieldName: 'amtSumElhmExcpPrpn', header: t('MSG_TXT_ELHM_EXCP_PRPN'), styleName: 'text-right', dataType: 'number', width: '157' },
    { fieldName: 'amtSumElhmExcpMetg', header: t('MSG_TXT_ELHM_EXCP_METG'), styleName: 'text-right', dataType: 'number', width: '157' },
    { fieldName: 'amtSumSalIntv', header: t('MSG_TXT_SAL_INTV'), styleName: 'text-right', dataType: 'number', width: '157' },
    { fieldName: 'amtEdu', header: t('MSG_TXT_EDUC'), styleName: 'text-right', dataType: 'number', width: '157' },
    { fieldName: 'amtSumStmnt', header: t('MSG_TXT_STMNT'), styleName: 'text-right', dataType: 'number', width: '160' },
    {
      fieldName: 'amtBsMgmt',
      header: t('MSG_TXT_BS_MGMT'),
      styleName: 'text-right',
      dataType: 'number',
      width: '151',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        valueCallback(grid) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();
          for (let i = 0; i < cnt; i += 1) {
            sum += prod.getValue(i, 'amtBsMgmt');
            sum += prod.getValue(i, 'amtRglvl');
          }
          return sum;
        },
      },
    },
    { fieldName: 'amtRglvl', header: t('MSG_TXT_RGLVL'), styleName: 'text-right', dataType: 'number', width: '151' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  view.setColumnLayout([
    'type',
    {
      header: t('MSG_TXT_EST_SAL_COMM'),
      direction: 'horizontal',
      items: ['amtSumElhmPrpn', 'amtSumElhmMetg', 'amtSumElhmExcpPrpn', 'amtSumElhmExcpMetg', 'amtSumSalIntv', 'amtEdu', 'amtSumStmnt'],
    },
    {
      header: t('MSG_TXT_EST_BS_FEE'),
      direction: 'horizontal',
      items: ['amtBsMgmt', 'amtRglvl'],
    },
  ]);
  view.layoutByColumn('amtSumElhmPrpn').footerUserSpans = [{ colspan: 7 }];
  view.layoutByColumn('amtBsMgmt').footerUserSpans = [{ colspan: 2 }];
  view.setFooters({ visible: true, items: [{ height: 40 }] });
});

const initGridSalesHist = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_RCPDT'), width: '112', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_SL_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '155', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTRT'), width: '93', styleName: 'text-left' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '187', styleName: 'text-left' },
    { fieldName: 'cntrwTpCd', header: t('MSG_TXT_PRDT_GUBUN'), width: '101', styleName: 'text-left', options: codes.CNTRW_TP_CD },
    { fieldName: 'cntrTpCd', header: t('MSG_TXT_CONTR_TYPE'), width: '96', styleName: 'text-left', options: codes.CNTR_TP_CD },
    { fieldName: 'pdAccCnt', header: t('MSG_TXT_PD_ACC_CNT'), width: '91', styleName: 'text-right' },
    { fieldName: 'bfsvcAckmtCt', header: t('MSG_TXT_BFSVC_ACKMT_CT'), width: '107', styleName: 'text-right' },
    { fieldName: 'amtElhmRental', header: t('MSG_TXT_ELHM_RENTAL'), width: '108', styleName: 'text-right' },
    { fieldName: 'amtElhmSpay', header: t('MSG_TXT_ELHM_SPAY'), width: '112', styleName: 'text-right' },
    { fieldName: 'elhmExcpSpay', header: t('MSG_TXT_ELHM_EXCP_SPAY'), width: '118', styleName: 'text-right' },
    { fieldName: 'etc', header: t('MSG_TXT_ETC'), width: '111', styleName: 'text-right' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
