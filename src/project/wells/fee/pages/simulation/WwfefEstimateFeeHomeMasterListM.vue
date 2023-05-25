<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEF
2. 프로그램 ID : WwfefEstimateFeeHomeMasterListM - 예상수수료 조회(홈마스터) 조회
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.03.15
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 예상수수료 조회(홈마스터) 화면
- 2023.04.18 퍼블수정됨
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
            rules="required"
            type="month"
            :label="$t('MSG_TXT_PERF_YM')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_INQR')"
          required
        >
          <kw-option-group
            v-model="searchParams.perType"
            type="radio"
            :label="$t('MSG_TXT_PERF_INQR')"
            :options="[{ codeId: '00', codeName: $t('MSG_TXT_RCP') },
                       { codeId: '01', codeName: $t('MSG_TXT_INSTALLATION') }]"
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
      <!-- 기본 정보 -->
      <kw-action-top>
        <template #left>
          <span class="accent">{{ t('MSG_TXT_DEFAULT_INFO') }}</span>
        </template>
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
          <kw-form-item
            :label="$t('MSG_TXT_EST_SAL_COMM')"
            align-content="right"
          >
            <p>{{ stringUtil.getNumberWithComma(baseInfo.amtEstSalFee) }}</p>
          </kw-form-item>
          <!-- 예상 서비스 수수료 -->
          <kw-form-item
            :label="$t('MSG_TXT_EST_SVC_FEE')"
            align-content="right"
          >
            <p>{{ stringUtil.getNumberWithComma(baseInfo.amtEstSerFee) }}</p>
          </kw-form-item>
          <!-- 예상수수료 합계 -->
          <kw-form-item
            :label="$t('MSG_TXT_TOT_EST_FEE')"
            align-content="right"
          >
            <p>{{ stringUtil.getNumberWithComma(baseInfo.amtEstSalFee + baseInfo.amtEstSerFee) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <!-- 실적내역 -->
      <kw-action-top>
        <template #left>
          <span class="accent">{{ $t('MSG_TXT_PERF_DETAIL') }}</span>
        </template>
        <kw-btn
          :label="$t('MSG_BTN_PRJTD_PERF_CALCULATE')"
          dense
          primary
          @click="onClickCalculateDetail"
        />
      </kw-action-top>
      <kw-grid
        ref="grdPerfDtlRef"
        name="grdPerfDtl"
        :visible-rows="2"
        @init="initGrdPerfDtl"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <span class="accent">{{ $t('MSG_TXT_EST_FEE_DTL') }}</span>
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdEstFeeDtlRef"
        name="grdEstFeeDtl"
        :visible-rows="1"
        @init="initGrdEstFeeDtl"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <span class="accent">{{ $t('MSG_TXT_SAL_HIST') }}</span>
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdSaleHistRef"
        name="grdSaleHist"
        @init="initGrdSaleHist"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid, useGlobal, useDataService, codeUtil, stringUtil } from 'kw-lib';
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
const grdPerfDtlRef = ref(getComponentType('KwGrid'));
const grdEstFeeDtlRef = ref(getComponentType('KwGrid'));
const grdSaleHistRef = ref(getComponentType('KwGrid'));
const grdPerfDtlData = computed(() => grdPerfDtlRef.value?.getData());
const grdEstFeeDtlData = computed(() => grdEstFeeDtlRef.value?.getData());
const grdSaleHistData = computed(() => grdSaleHistRef.value?.getData());

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
  amtEstSerFee: 0,
});

// 데이터 조회
async function fetchData() {
  const { data } = await dataService.get('/sms/wells/fee/estimate/home', { params: { ...cachedParams } });
  baseInfo.value = data.base;
  grdPerfDtlData.value.setRows(data.performances);
  grdEstFeeDtlData.value.setRows(data.estimates);
  grdSaleHistData.value.setRows(data.sales);
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

// 실적내역 예상실적 계산버튼 클릭
async function onClickCalculateDetail() {
  notify('수수료 계산 API 개발후 진행');
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdPerfDtl = defineGrid((data, view) => {
  const columns = [
    {
      fieldName: 'type',
      header: t('MSG_TXT_DIV'),
      width: '193',
      styleName: 'text-left',
      displayCallback(grid, index, value) {
        const title = { A: t('MSG_TXT_PERF_PS'), B: t('MSG_TXT_PRJTD_PERF') };
        return title[value];
      },
    },
    { fieldName: 'elhmAckmtCt', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '169', styleName: 'text-right', dataType: 'number', editable: true },
    { fieldName: 'amtSpayHcr', header: t('MSG_TXT_SNGL_PMNT'), width: '168', styleName: 'text-right', dataType: 'number', editable: true },
    { fieldName: 'allProcCt', header: t('MSG_TXT_ALL_CASES_PROC'), width: '171', styleName: 'text-right', dataType: 'number', editable: true },
    { fieldName: 'elhmProcCt', header: t('MSG_TXT_APL_HNDL_CASE'), width: '170', styleName: 'text-right', dataType: 'number', editable: true },
    {
      fieldName: 'nwcmrEducYn',
      header: `${t('MSG_TXT_NWCMR')} ${t('MSG_TXT_EDU_CERT')}`,
      width: '170',
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
      fieldName: 'acpnEducYn',
      header: `${t('MSG_TXT_ACPN')} ${t('MSG_TXT_EDU_CERT')}`,
      width: '170',
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
  // data.setRows([
  //   {
  //     type: 'A',
  //     elhmAckmtCt: 12,
  //     amtSpayHcr: 12345670,
  //     allProcCt: 12,
  //     elhmProcCt: 12,
  //     nwcmrEducYn: 'N',
  //     acpnEducYn: 'N',
  //   },
  //   {
  //     type: 'B',
  //     elhmAckmtCt: 12,
  //     amtSpayHcr: 12345670,
  //     allProcCt: 12,
  //     elhmProcCt: 12,
  //     nwcmrEducYn: 'N',
  //     acpnEducYn: 'N',
  //   },
  // ]);
});

const initGrdEstFeeDtl = defineGrid((data, view) => {
  const columns = [
    {
      fieldName: 'type',
      header: t('MSG_TXT_DIV'),
      styleName: 'text-center',
      width: '218',
      displayCallback() {
        return t('MSG_TXT_EST_FEE');
      },
      footer: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    },
    {
      fieldName: 'amtEstSalPrpn',
      header: t('MSG_TXT_PRPN'),
      styleName: 'text-right',
      width: '165',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        valueCallback(grid) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();
          for (let i = 0; i < cnt; i += 1) {
            sum += prod.getValue(i, 'amtEstSalPrpn');
            sum += prod.getValue(i, 'amtEstSalEarlySttlmnt');
            sum += prod.getValue(i, 'amtEstSalEnrg');
          }
          return sum;
        },
      },
    },
    { fieldName: 'amtEstSalEarlySttlmnt', header: t('MSG_TXT_EARLY_STTLMNT'), styleName: 'text-right', dataType: 'number', width: '165' },
    { fieldName: 'amtEstSalEnrg', header: t('MSG_TXT_ENRG'), styleName: 'text-right', dataType: 'number', width: '165' },
    {
      fieldName: 'amtEstSvcScene',
      header: t('MSG_TXT_SCENE'),
      styleName: 'text-right',
      dataType: 'number',
      width: '132',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
        valueCallback(grid) {
          let sum = 0;
          const prod = grid.getDataSource();
          const cnt = prod.getRowCount();
          for (let i = 0; i < cnt; i += 1) {
            sum += prod.getValue(i, 'amtEstSvcScene');
            sum += prod.getValue(i, 'amtEstSvcActi1');
            sum += prod.getValue(i, 'amtEstSvcActi2');
            sum += prod.getValue(i, 'amtEstSvcAcml');
            sum += prod.getValue(i, 'amtEstSvcEdu');
          }
          return sum;
        },
      } },
    { fieldName: 'amtEstSvcActi1', header: `${t('MSG_TXT_ACTI')} 1`, styleName: 'text-right', dataType: 'number', width: '132' },
    { fieldName: 'amtEstSvcActi2', header: `${t('MSG_TXT_ACTI')} 2`, styleName: 'text-right', dataType: 'number', width: '132' },
    { fieldName: 'amtEstSvcAcml', header: t('MSG_TXT_ACML'), styleName: 'text-right', dataType: 'number', width: '132' },
    { fieldName: 'amtEstSvcEdu', header: t('MSG_TXT_EDUC'), styleName: 'text-right', dataType: 'number', width: '132' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'type',
    {
      header: t('MSG_TXT_EST_SAL_COMM'), // colspan title
      direction: 'horizontal', // merge type
      items: ['amtEstSalPrpn', 'amtEstSalEarlySttlmnt', 'amtEstSalEnrg'],
    },
    {
      header: t('MSG_TXT_EST_SVC_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['amtEstSvcScene', 'amtEstSvcActi1', 'amtEstSvcActi2', 'amtEstSvcAcml', 'amtEstSvcEdu'],
    },
  ]);
  view.layoutByColumn('amtEstSalPrpn').footerUserSpans = [{ colspan: 3 }];
  view.layoutByColumn('amtEstSvcScene').footerUserSpans = [{ colspan: 5 }];
  view.setFooters({ visible: true, items: [{ height: 40 }] });
  // data.setRows([
  //   {
  //     type: null,
  //     amtEstSalPrpn: 1222,
  //     amtEstSalEarlySttlmnt: 1222,
  //     amtEstSalEnrg: 1222,
  //     amtEstSvcScene: 1222,
  //     amtEstSvcActi1: 1222,
  //     amtEstSvcActi2: 1222,
  //     amtEstSvcAcml: 1222,
  //     amtEstSvcEdu: 1222,
  //   },
  // ]);
});

const initGrdSaleHist = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_CONF_COMPL_DT'), width: '155', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_INST_COMP_DT'), width: '155', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '155', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTRT'), width: '155', styleName: 'text-left' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '155', styleName: 'text-left' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '155', styleName: 'text-center' },
    { fieldName: 'cntrwTpCd', header: t('MSG_TXT_PRDT_GUBUN'), width: '155', styleName: 'text-left', options: codes.CNTRW_TP_CD },
    { fieldName: 'cntrTpCd', header: t('MSG_TXT_CONTR_TYPE'), width: '155', styleName: 'text-left', options: codes.CNTR_TP_CD },
    { fieldName: 'sumAckmtCt', header: t('MSG_TXT_PD_ACC_CNT'), width: '155', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'sumRentalAmt', header: t('MSG_TXT_RENTAL'), width: '155', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'sumHomeCare', header: t('MSG_TXT_SNGL_PMNT'), width: '155', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'sumEtc', header: t('MSG_TXT_ETC'), width: '155', styleName: 'text-right', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
