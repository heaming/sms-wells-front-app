<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEF
2. 프로그램 ID : WwfefSellFeeEtPerfListM - 수수료 예상실적 조회 (판매)
3. 작성자 : 이선호
4. 작성일 : 2023.10.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 예상실적(판매)을 조회한다.
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_PRD')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.inqrStrtDt"
            v-model:to="searchParams.inqrEndDt"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_BASE')"
        >
          <kw-option-group
            v-model="searchParams.perfBaseDv"
            type="radio"
            :options="customCodes.perfBaseDv"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_DV')"
        >
          <kw-option-group
            v-model="searchParams.inqrDv"
            type="radio"
            :options="customCodes.inqrDv"
            rules="required"
          />
        </kw-search-item>
        <!--  Variation # 2 : 조회구분 - 순증상세 -- > 순증구분 항목 노출 -->
        <kw-search-item
          v-if="searchParams.inqrDv === '4'"
          :label="`${$t('MSG_TXT_NINC')}${$t('MSG_TXT_DIV')}`"
        >
          <kw-option-group
            v-model="searchParams.nincDv"
            type="radio"
            :options="customCodes.nincDv"
            rules="required"
          />
        </kw-search-item>
        <!-- //  Variation # 2 : 조회구분 - 순증상세 -- > 순증구분 항목 노출 -->
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_DV')"
        >
          <kw-select
            v-model="searchParams.pstnDvCd"
            :options="ojPstnRankCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.dgr1LevlOgCd"
            v-model:og-levl-dv-cd2="searchParams.dgr2LevlOgCd"
            v-model:og-levl-dv-cd3="searchParams.dgr3LevlOgCd"
            og-tp-cd="W02"
            :base-ym="baseYm"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_PRTNR_NO')">
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            @click-icon="onClickIcon"
          />
          <kw-input
            v-model="searchParams.prtnrNm"
            :disable="true"
            placeholder=""
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">(단위 : 원, 건, %)</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        v-if="searchParams.inqrDv === '1'"
        ref="grdMain1Ref"
        @init="initGrid1"
      />
      <kw-grid
        v-if="searchParams.inqrDv === '2'"
        ref="grdMain2Ref"
        @init="initGrid2"
      />
      <kw-grid
        v-if="searchParams.inqrDv === '3'"
        ref="grdMain3Ref"
        @init="initGrid3"
      />
      <kw-grid
        v-if="searchParams.inqrDv === '4'"
        ref="grdMain4Ref"
        @init="initGrid4"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
// import dayjs from 'dayjs';
import { codeUtil, getComponentType, gridUtil, modal, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

const dataService = useDataService();
const { currentRoute } = useRouter();
const { t } = useI18n();

const codes = await codeUtil.getMultiCodes(
  'MNGER_OG_ACC_NINC_MNGT_INQR_DV_CD',
  'WELS_MNGER_INQR_DV_CD',
  'PMOT_MCHN_CH_TP_CD',
  'CMN_STAT_CH_RSON_CD',
);

const ojPstnRankCd = ref([...codes.WELS_MNGER_INQR_DV_CD]);
const customCodes = {
  perfBaseDv: [
    { codeId: '1', codeName: t('MSG_TXT_RCP') },
    { codeId: '2', codeName: t('MSG_TXT_SL') },
  ],
  inqrDv: [
    { codeId: '1', codeName: `${t('MSG_TXT_COUNT')}&${t('MSG_TXT_PERF')}` },
    { codeId: '2', codeName: t('MSG_TXT_ACC_NINC') },
    { codeId: '3', codeName: `${t('MSG_TXT_SELL')}${t('MSG_TXT_DTL')}` },
    { codeId: '4', codeName: `${t('MSG_TXT_NINC')}${t('MSG_TXT_DTL')}` },
  ],
  nincDv: codes.MNGER_OG_ACC_NINC_MNGT_INQR_DV_CD.filter((v) => ['01', '02'].includes(v.codeId)),
  mchnChTpCd: codes.PMOT_MCHN_CH_TP_CD.filter((v) => v.codeId !== '0'),
};

const searchParams = ref({
  inqrStrtDt: dayjs().startOf('month').format('YYYYMMDD'),
  inqrEndDt: dayjs().format('YYYYMMDD'),
  perfBaseDv: '1',
  inqrDv: '1',
  nincDv: '01',
  pstnDvCd: '01',
  dgr1LevlOgCd: undefined,
  dgr2LevlOgCd: undefined,
  dgr3LevlOgCd: undefined,
  prtnrNo: '',
  prtnrNm: '',
});

const baseYm = computed(() => searchParams.value.inqrStrtDt.substring(0, 6));

const totalCount = ref(0);
const grdMain1Ref = ref(getComponentType('KwGrid'));
const grdMain2Ref = ref(getComponentType('KwGrid'));
const grdMain3Ref = ref(getComponentType('KwGrid'));
const grdMain4Ref = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
/* 조회구분 변경시 처리 */
watch(
  () => searchParams.value.inqrDv,
  (newInqrDv) => {
    totalCount.value = 0;
    if (newInqrDv === '3' || newInqrDv === '4') {
      ojPstnRankCd.value = codes.WELS_MNGER_INQR_DV_CD.filter((v) => ['04'].includes(v.codeId));
      searchParams.value.pstnDvCd = '04';
    } else {
      ojPstnRankCd.value = codes.WELS_MNGER_INQR_DV_CD;
      searchParams.value.pstnDvCd = '01';
    }
  },
);

/* 사원번호 변경시 처리 */
watch(
  () => searchParams.value.prtnrNo,
  (prtnrNo) => {
    if (prtnrNo === '') {
      searchParams.value.prtnrNm = '';
    }
  },
);

let cachedParams;

async function fetchData() {
  let dataList; let
    view;
  if (cachedParams.inqrDv === '1') {
    const res = await dataService.get('/sms/wells/fee/sell-fee-et-perf/cts', { params: cachedParams, timeout: 300000 });

    dataList = res.data.map((row) => ({
      ...row,
      nwSellCt: row.spayNincNwCt + row.rentalNincNwCt,
      accNincSum: row.spayNincNwCt + row.rentalNincNwCt - row.rentalCanCt
        - row.rentalExnCt - row.mshSprCt - row.spayRsgCt,
    }));

    view = grdMain1Ref.value.getView();
  } else if (cachedParams.inqrDv === '2') {
    const res = await dataService.get('/sms/wells/fee/sell-fee-et-perf/cts', { params: cachedParams, timeout: 300000 });
    dataList = res.data.map((row) => ({
      ...row,
      nwSellCt: row.spayNincNwCt + row.rentalNincNwCt,
      canCt: row.rentalCanCt + row.rentalExnCt + row.mshSprCt + row.spayRsgCt,
      accNincSum: row.spayNincNwCt + row.rentalNincNwCt - row.rentalCanCt
        - row.rentalExnCt - row.mshSprCt - row.spayRsgCt,
    }));
    view = grdMain2Ref.value.getView();
  } else if (cachedParams.inqrDv === '3') {
    const res = await dataService.get('/sms/wells/fee/sell-fee-et-perf/details', { params: cachedParams, timeout: 300000 });
    dataList = res.data;
    view = grdMain3Ref.value.getView();
  } else if (cachedParams.inqrDv === '4') {
    const res = await dataService.get('/sms/wells/fee/sell-fee-et-perf/can-nincs', { params: cachedParams, timeout: 300000 });
    dataList = res.data;
    view = grdMain4Ref.value.getView();
  }

  view.getDataSource().setRows(dataList);
  totalCount.value = dataList.length;
}

/**
 * 조회버튼 클릭 이벤트
 */
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

/**
 * 파트너 검색 이벤트
 */
async function onClickIcon() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });

  if (result) {
    const { prtnrNo, prtnrKnm } = payload;
    searchParams.value.prtnrNo = prtnrNo;
    searchParams.value.prtnrNm = prtnrKnm;
  }
}

/**
 * 엑셀 다운로드 이벤트
 */
function onClickExcelDownload() {
  let view;
  if (cachedParams.inqrDv === '1') {
    view = grdMain1Ref.value.getView();
  } else if (cachedParams.inqrDv === '2') {
    view = grdMain2Ref.value.getView();
  } else if (cachedParams.inqrDv === '3') {
    view = grdMain3Ref.value.getView();
  } else if (cachedParams.inqrDv === '4') {
    view = grdMain4Ref.value.getView();
  }

  if (view) {
    gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
    });
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

// 건수&실적 그리드
function initGrid1(data, view) {
  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '90', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), width: '70', styleName: 'text-center', headerSummary: { text: '합계' } },
    { fieldName: 'brchCt', header: t('MSG_TXT_BRCH_N'), width: '90', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rentalElhmCt', header: t('MSG_TXT_RENTAL'), width: '100', styleName: 'text-right', dataType: 'number', summaries: [{ expression: 'sum', numberFormat: '#,##0' }] },
    { fieldName: 'spayElhmCt', header: t('MSG_TXT_SNGL_PMNT'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rentalElhmBaseAmt', header: t('MSG_TXT_RENTAL'), width: '110', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'spayElhmBaseAmt', header: t('MSG_TXT_ISTM'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'notElhmAmt', header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'), width: '110', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'vstAsnCt', header: t('MSG_TXT_ASN_ACC'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'vstFshCt', header: t('MSG_TXT_FSH_ACC'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'vstProcsRt',
      header: t('MSG_TXT_PROCS_RT'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.0;;;c',
      headerSummary: {
        numberFormat: '#,##0.0;;;c',
        valueCallback: (grid) => (grid.getSummary('vstFshCt', 'sum') / grid.getSummary('vstAsnCt', 'sum')) * 100,
      } },
    { fieldName: 'nwSellCt', header: t('MSG_TXT_NW_SELL'), width: '90', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'accNincSum', header: t('MSG_TXT_ACC_NINC'), width: '90', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'ogCd', 'prtnrNm', 'prtnrNo', 'pstnDvCd', 'brchCt',
    {
      header: `${t('MSG_TXT_ELHM')}${t('MSG_TXT_COUNT')}`,
      direction: 'horizontal',
      items: ['rentalElhmCt', 'spayElhmCt'],
    },
    {
      header: `${t('MSG_TXT_ELHM')}${t('TXT_MSG_BAS_VAL')}`,
      direction: 'horizontal',
      items: ['rentalElhmBaseAmt', 'spayElhmBaseAmt'],
    },
    'notElhmAmt', 'vstAsnCt', 'vstFshCt', 'vstProcsRt', 'nwSellCt', 'accNincSum',
  ]);
  // Header Summary
  view.setHeaderSummaries({ visible: true, items: [{ height: 42 }] });
}

// 계정순증 그리드
function initGrid2(data, view) {
  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '90', styleName: 'text-center', headerSummary: { text: '합계' } },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), width: '70', styleName: 'text-center' },
    { fieldName: 'brchCt', header: t('MSG_TXT_BRCH_N'), width: '90', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rentalNincNwCt', header: t('MSG_TXT_RENTAL'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'spayNincNwCt', header: t('MSG_TXT_SNGL_PMNT'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'nwSellCt', header: t('MSG_TXT_AGG'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rentalCanCt', header: `${t('MSG_TXT_PUR_RSG')}(${t('MSG_TXT_RENTAL')})`, width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'spayRsgCt', header: `${t('MSG_TXT_PUR_RSG')}(${t('MSG_TXT_SNGL_PMNT')})`, width: '110', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rentalExnCt', header: t('MSG_TXT_EXN'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'mshSprCt', header: `${t('MSG_TXT_MMBR')}${t('MSG_TXT_WDWAL')}`, width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'canCt', header: t('MSG_TXT_AGG'), width: '90', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'accNincSum', header: t('MSG_TXT_ACC_NINC'), width: '90', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'ogCd', 'prtnrNm', 'prtnrNo', 'pstnDvCd', 'brchCt',
    {
      header: t('MSG_TXT_NEW'),
      direction: 'horizontal',
      items: ['rentalNincNwCt', 'spayNincNwCt', 'nwSellCt'],
    },
    {
      header: t('MSG_TXT_CANCEL'),
      direction: 'horizontal',
      items: ['rentalCanCt', 'spayRsgCt', 'rentalExnCt', 'mshSprCt', 'canCt'],
    },
    'accNincSum',
  ]);
  // Header Summary
  view.setHeaderSummaries({ visible: true, items: [{ height: 42 }] });
}

// 판매상세 그리드
function initGrid3(data, view) {
  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '85', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NO'), width: '100', styleName: 'text-center', dataType: 'number' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), width: '70', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CST_CD'), width: '125', styleName: 'text-center' },
    { fieldName: 'cntrCstNm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrCnfmDt', header: t('MSG_TXT_RCPDT'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'cntrCanDt', header: t('MSG_TXT_CANC_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_GUBUN'), width: '110', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'mchnChTpCd', header: t('MSG_TXT_CHDVC_TP'), width: '90', styleName: 'text-center', options: customCodes.mchnChTpCd },
    { fieldName: 'elhmBaseAmt', header: `${t('MSG_TXT_ELHM')}${t('TXT_MSG_BAS_VAL')}(${t('MSG_TXT_RENTAL')}/${t('MSG_TXT_ISTM')})`, width: '150', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'notElhmAmt', header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'), width: '110', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'elhmPerfCt', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '90', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.setHeaderSummaries({ visible: true, items: [{ height: 42 }] });
}

// 순증상세 그리드
function initGrid4(data, view) {
  const fields = [
    { fieldName: 'ogCd' },
    { fieldName: 'prtnrNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'pstnDvCd' },
    { fieldName: 'canTpNm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrCstNm' },
    { fieldName: 'pdClsfNm' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'cntrPdStrtdt' },
    { fieldName: 'cntrCanDt' },
    { fieldName: 'cntrStatChRsonCd' },
    { fieldName: 'origOgCd' },
    { fieldName: 'origPrtnrNm' },
    { fieldName: 'origSellPrtnrNo' },
  ];

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '90', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), width: '70', styleName: 'text-center' },
    { fieldName: 'canTpNm', header: t('MSG_TXT_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CST_CD'), width: '140', styleName: 'text-center' },
    { fieldName: 'cntrCstNm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_GUBUN'), width: '110', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'cntrCanDt', header: t('MSG_TXT_CANC_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'cntrStatChRsonCd', header: t('MSG_TXT_CAN_CD'), width: '90', styleName: 'text-center' },
    { name: 'cntrStatChRsonNm', fieldName: 'cntrStatChRsonCd', header: t('MSG_TXT_CAN_RSON'), width: '250', options: codes.CMN_STAT_CH_RSON_CD },
    { fieldName: 'origOgCd', header: t('MSG_TXT_BLG'), width: '110', styleName: 'text-center' },
    { fieldName: 'origPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '90', styleName: 'text-center' },
    { fieldName: 'origSellPrtnrNo', header: t('MSG_TXT_PRTNR_NO'), width: '90', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    {
      header: `${t('MSG_TXT_MGT')}${t('MSG_TXT_MANAGER')}`,
      direction: 'horizontal',
      items: ['ogCd', 'prtnrNm', 'prtnrNo', 'pstnDvCd'],
    },
    {
      header: t('MSG_TXT_CST_ARTC'),
      direction: 'horizontal',
      items: ['canTpNm', 'cntrNo', 'cntrCstNm', 'pdClsfNm', 'pdCd', 'pdNm', 'cntrPdStrtdt', 'cntrCanDt', 'cntrStatChRsonCd', 'cntrStatChRsonNm'],
    },
    {
      header: t('MSG_TXT_SELLER_PERSON'),
      direction: 'horizontal',
      items: ['origOgCd', 'origPrtnrNm', 'origSellPrtnrNo'],
    },
  ]);
}
</script>

<style scoped>
</style>
