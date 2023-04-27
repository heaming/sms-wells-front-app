<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncBondCounselMCustomer
3. 작성자 : sunghun.choi
4. 작성일 : 2023.02.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 채권상담 고객리스트 탭 화면
- 채권상담 고객리스트를 조회
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_CLCTAM_ICHR_EMPNO')"
        required
      >
        <kw-input
          v-model="searchParams.schClctamNo"
          :label="$t('MSG_TXT_CLCTAM_ICHR_EMPNO')"
          :regex="/^[0-9]*$/i"
          rules="required"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CST_NO')"
      >
        <kw-input
          v-model="searchParams.schCstNo"
          icon="search"
          clearable
          @click-icon="onClickSelectCustomer"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_MPNO')"
      >
        <kw-input
          v-model="searchParams.schCntrMpno"
          :maxlength="11"
          :regex="/^[0-9]*$/i"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CST_NM')"
      >
        <kw-input
          v-model="searchParams.schCstNm"
          icon="search"
          clearable
          @click-icon="onClickSelectCustomer"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_CLCTAM_PSIC')"
      >
        <kw-input
          v-model="searchParams.schClctamPsic"
          icon="search"
          clearable
          @click-icon="onClickClctamPsic"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_SFK')"
      >
        <kw-input v-model="searchParams.schSfK" />
      </kw-search-item>

      <kw-search-item
        :label="$t('MSG_TXT_IST_MPNO')"
      >
        <kw-input
          v-model="searchParams.schIstMpno"
          :maxlength="11"
          :regex="/^[0-9]*$/i"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_DLQ_MCNT')"
      >
        <kw-select
          v-model="searchParams.schDlqMcntStrt"
          :options="selectCodes.DLQ_MCNT"
        />
        <span>-</span>
        <kw-select
          v-model="searchParams.schDlqMcntEnd"
          :options="selectCodes.DLQ_MCNT"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_FNT_DT')"
        :colspan="2"
      >
        <kw-select
          v-model="searchParams.schFntDv"
          :options="selectCodes.FNT_DV"
        />
        <span>-</span>
        <kw-select
          v-model="searchParams.schFntDtStrt"
          :options="selectCodes.FNT_DT"
        />
        <span>-</span>
        <kw-select
          v-model="searchParams.schFntDtEnd"
          :options="selectCodes.FNT_DT"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_OJ_BLAM')"
      >
        <kw-input v-model="searchParams.seachOjBlamStrt" />
        <span>-</span>
        <kw-input v-model="searchParams.seachOjBlamEnd" />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_CST_DV')"
      >
        <kw-option-group
          v-model="searchParams.schCstDv"
          type="radio"
          :options="codes.CST_SE_APY_DV_CD"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_AUTH_RSG_YN')"
      >
        <kw-select
          v-model="searchParams.schCpsnRsgYn"
          :options="selectCodes.AUTH_AUTH_RSG_YN"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalCount" />
        <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        icon="download_on"
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        secondary
        dense
        :disable="totalCount === 0"
        @click="onClickExcelDownload"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        :label="$t('MSG_BTN_IST_CHAR_FW')"
        primary
        dense
      />
      <kw-btn
        :label="$t('MSG_BTN_CNTR_CHAR_FW')"
        primary
        dense
      />
    </kw-action-top>

    <ul class="filter-box mb12">
      <li class="filter-box__item">
        <p class="filter-box__item-label">
          {{ $t('MSG_TXT_DIV') }}
        </p>
        <kw-option-group
          v-model="searchParams.dv"
          dense
          type="radio"
          :options="selectCodes.WELLS_CST_LIST_DV"
        />
      </li>
    </ul>

    <kw-grid
      ref="grdMainRef"
      name="grdMain1"
      :visible-rows="10"
      @init="initGrdMain"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, gridUtil, codeUtil, getComponentType, modal, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import { getDlqMcnt, getFntDt, getWellsCstListDv, getAuthAuthRsgYn, getFntDv } from '~sms-common/bond/utils/bnUtil';

const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'CST_SE_APY_DV_CD',
);

const selectCodes = ref({
  DLQ_MCNT: await getDlqMcnt(),
  FNT_DT: await getFntDt(),
  WELLS_CST_LIST_DV: await getWellsCstListDv(),
  AUTH_AUTH_RSG_YN: await getAuthAuthRsgYn(),
  FNT_DV: await getFntDv(),
});

const grdMainRef = ref(getComponentType('KwGrid'));

// TODO: 고객리스트 검색조건
let cachedParams;
const searchParams = ref({
  schClctamNo: '',
  schCstNo: '',
  schCntrMpno: '',
  schCstNm: '',
  schClctamPsic: '',
  schClctamPsicNo: '',
  schSfK: '',
  schIstMpno: '',
  schDlqMcntStrt: '',
  schDlqMcntEnd: '',
  schFntDv: '',
  schFntDtStrt: '',
  schFntDtEnd: '',
  seachOjBlamStrt: '',
  seachOjBlamEnd: '',
  schCstDv: '01',
  schCpsnRsgYn: '',
  schDv: '',
  dv: '01',
});

const totalCount = ref(0);

/** 고객리스트 조회 */
async function fetchCustomers() {
  const response = await dataService.get('/sms/wells/bond/bond-counsel/customers', { params: cachedParams });
  const customers = response.data;
  totalCount.value = customers.length;

  const gridView = grdMainRef.value.getView();
  gridView.getDataSource().setRows(customers);
}

/** 고객리스트 엑셀다운로드 */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: 'customerList',
    timePostfix: true,

  });
}

/** 고객조회(공통) */
async function onClickSelectCustomer() {
  let returnCustomInfo = await modal({
    component: 'ZwcsaCustomerListP',
  });
  /* 단위 테스트를 위한 코딩 추후 고객조회(공통) 팝업이 완성되면 삭제 예정 */
  returnCustomInfo = {
    cstNo: '015417731',
    cstNm: '김지혜',
  };

  if (returnCustomInfo) {
    searchParams.value.schCstNo = returnCustomInfo.cstNo;
    searchParams.value.schCstNm = returnCustomInfo.cstNm;
  }
}

// TODO: 집금담당자 검색 팝업 호출
const onClickClctamPsic = async () => {
  const { result, payload } = await modal({
    component: 'ZwbnyCollectorListP',
    componentProps: {
      clctamPrtnrNm: searchParams.value.schClctamPsic,
    },
  });
  if (result) {
    const { clctamPrtnrNm, clctamPrtnrNo } = payload;
    searchParams.value.schClctamPsic = clctamPrtnrNm;
    searchParams.value.schClctamPsicNo = clctamPrtnrNo;
  }
};

async function onClickSearch() {
  if (searchParams.value.dv === '02') {
    searchParams.value.schDv = '2';
  } else if (searchParams.value.dv === '03') {
    searchParams.value.schDv = '3';
  } else if (searchParams.value.dv === '04') {
    searchParams.value.schDv = '4';
  } else {
    searchParams.value.schDv = '1';
  }

  cachedParams = cloneDeep(searchParams.value);
  await fetchCustomers();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ctt' },
    { fieldName: 'fnt' },
    { fieldName: 'cstNo' },
    { fieldName: 'cstNm' },
    { fieldName: 'dlqMcnt' },
    { fieldName: 'fnlCnslD' },
    { fieldName: 'ojAmt', dataType: 'number' },
    { fieldName: 'ojDp', dataType: 'number' },
    { fieldName: 'ojBlam', dataType: 'number' },
    { fieldName: 'totDlqAmt', dataType: 'number' },
    { fieldName: 'totDlqDp', dataType: 'number' },
    { fieldName: 'totDlqBlam', dataType: 'number' },
    { fieldName: 'dlqAmt', dataType: 'number' },
    { fieldName: 'dlqDp', dataType: 'number' },
    { fieldName: 'dlqBlam', dataType: 'number' },
    { fieldName: 'mmChramAmt', dataType: 'number' },
    { fieldName: 'mmChramDp', dataType: 'number' },
    { fieldName: 'mmChramBlam', dataType: 'number' },
    { fieldName: 'dlqAddAmt', dataType: 'number' },
    { fieldName: 'dlqAddDp', dataType: 'number' },
    { fieldName: 'dlqAddBlam', dataType: 'number' },
    { fieldName: 'ucAmt', dataType: 'number' },
    { fieldName: 'ucDp', dataType: 'number' },
    { fieldName: 'ucBlam', dataType: 'number' },
    { fieldName: 'totDpAmt', dataType: 'number' },
    { fieldName: 'spmtSl', dataType: 'number' },
    { fieldName: 'ccam', dataType: 'number' },
    { fieldName: 'lsfe', dataType: 'number' },
    { fieldName: 'rtlfe1', dataType: 'number' },
    { fieldName: 'rtlfeIstm1', dataType: 'number' },
    { fieldName: 'rtlfe2', dataType: 'number' },
    { fieldName: 'rtlfeIstm2', dataType: 'number' },
    { fieldName: 'clctamIchr' },
    { fieldName: 'cntrMpno' },
    { fieldName: 'istMpno' },
    { fieldName: 'vtAcBnk' },
    { fieldName: 'vtAcNo' },
    { fieldName: 'sfk' },
    { fieldName: 'clnPsbl' },
    { fieldName: 'clnPrcs' },
    { fieldName: 'cstStat' },
    { fieldName: 'cvcpInf' },
    { fieldName: 'unuslArtc' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
  ];

  const columns = [
    { fieldName: 'ctt', header: t('MSG_TXT_CTT'), width: '52', styleName: 'text-center', headerSummaries: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'fnt', header: t('MSG_TXT_FNT'), width: '52', styleName: 'text-center' },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'dlqMcnt', header: t('MSG_TXT_DLQ_MCNT'), width: '70', styleName: 'text-center' },
    { fieldName: 'fnlCnslD', header: t('MSG_TXT_FNL_CNSL_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'ojAmt', header: t('MSG_TXT_OJ_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'ojDp', header: t('MSG_TXT_OJ_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'ojBlam', header: t('MSG_TXT_OJ_BLAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'totDlqAmt', header: t('MSG_TXT_TOT_DLQ_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'totDlqDp', header: t('MSG_TXT_TOT_DLQ_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'totDlqBlam', header: t('MSG_TXT_TOT_DLQ_BLAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'dlqDp', header: t('MSG_TXT_DLQ_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'dlqBlam', header: t('MSG_TXT_DLQ_BLAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'mmChramAmt', header: t('MSG_TXT_MM_CHRAM_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'mmChramDp', header: t('MSG_TXT_MM_CHRAM_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'mmChramBlam', header: t('MSG_TXT_MM_CHRAM_BLAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'dlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'dlqAddDp', header: t('MSG_TXT_DLQ_ADD_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'dlqAddBlam', header: t('MSG_TXT_DLQ_ADD_BLAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'ucAmt', header: t('MSG_TXT_UC_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'ucDp', header: t('MSG_TXT_UC_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'ucBlam', header: t('MSG_TXT_UC_BLAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'totDpAmt', header: t('MSG_TXT_TOT_DP_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'spmtSl', header: t('MSG_TXT_SPMT_SL'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'ccam', header: t('MSG_TXT_CCAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'lsfe', header: t('MSG_TXT_LSFE'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rtlfe1', header: t('MSG_TXT_RTLFE1'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rtlfeIstm1', header: t('MSG_TXT_RTLFE_1_ISTM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rtlfe2', header: t('MSG_TXT_RTLFE2'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rtlfeIstm2', header: t('MSG_TXT_RTLFE_2_ISTM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'clctamIchr', header: t('MSG_TXT_CLCTAM_PSIC'), width: '100' },
    {
      fieldName: 'cntrMpno',
      header: t('MSG_TXT_CNTR_MPNO'),
      styleName: 'text-center',
      width: '120',

      displayCallback(grid, index) {
        const { cralLocaraTno: no1, mexnoEncr: no2, cralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    {
      fieldName: 'istMpno',
      header: t('MSG_TXT_IST_MPNO'),
      styleName: 'text-center',
      width: '120',

      displayCallback(grid, index) {
        const { istCralLocaraTno: no1, istMexnoEncr: no2, istCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },

    { fieldName: 'vtAcBnk', header: t('MSG_TXT_VT_AC_BNK'), width: '100' },
    { fieldName: 'vtAcNo', header: t('MSG_TXT_VT_AC_NO'), width: '130', styleName: 'text-center' },
    { fieldName: 'sfk', header: t('MSG_TXT_SFK'), width: '100', styleName: 'text-center' },
    { fieldName: 'clnPsbl', header: t('MSG_TXT_CLN_PSBL'), width: '100' },
    { fieldName: 'clnPrcs', header: t('MSG_TXT_CLN_PRCS'), width: '100' },
    { fieldName: 'cstStat', header: t('MSG_TXT_CST_STAT'), width: '100' },
    { fieldName: 'cvcpInf', header: t('MSG_TXT_CVCP_INF'), width: '120' },
    { fieldName: 'unuslArtc', header: t('MSG_TXT_UNUITM'), width: '120' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '100', styleName: 'text-center', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.setHeaderSummaries({
    visible: true,
    items: [{ height: 40 }],
  });
  view.layoutByColumn('ctt').summaryUserSpans = [{ colspan: 6 }];
  view.layoutByColumn('clctamIchr').summaryUserSpans = [{ colspan: 11 }];

  view.onCellDblClicked = async (g, { dataRow }) => {
    const cstNo = g.getValue(dataRow, 'cstNo');
    const cntrNo = g.getValue(dataRow, 'cntrNo');
    const cntrSn = g.getValue(dataRow, 'cntrSn');
    if (cstNo) {
      await window.open(`/popup/#/wwbnc-customer-dtl?cstNo=${cstNo}&cntrNo=${cntrNo}&cntrSn=${cntrSn}`, 'POPUP', 'width=1540, height=1100, menubar=no, location=no');
    }
  };
});
</script>
