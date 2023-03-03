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
        :label="$t('MSG_TXT_CLCTAM_NO')"
        required
      >
        <kw-input
          v-model="searchParams.schClctamNo"
          :label="$t('MSG_TXT_CLCTAM_NO')"
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
        <kw-input v-model="searchParams.schCntrMpno" />
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
        <kw-input v-model="searchParams.schIstMpno" />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_DLQ_MCNT')"
      >
        <!-- TODO: 코드관리 등록 안된 임시 소스 -->
        <kw-select
          v-model="searchParams.schDlqMcntStrt"
          :options="[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18
                     ,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,999]"
        />
        <span>-</span>
        <kw-select
          v-model="searchParams.schDlqMcntEnd"
          :options="[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18
                     ,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,999]"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_FNT_DT')"
        :colspan="2"
      >
        <!-- TODO: 코드관리 등록 안된 임시 소스 -->
        <kw-select
          v-model="searchParams.schFntDv"
          :options="['카드', '계좌']"
        />
        <span>-</span>
        <kw-select
          v-model="searchParams.schFntDtStrt"
          :options="[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18
                     ,19,20,21,22,23,24,25,26,27,28,29,30,31]"
        />
        <span>-</span>
        <kw-select
          v-model="searchParams.schFntDtEnd"
          :options="[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18
                     ,19,20,21,22,23,24,25,26,27,28,29,30,31]"
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
        <!-- TODO: 코드관리 등록 안된 임시 소스 -->
        <kw-option-group
          v-model="searchParams.schCstDv"
          type="radio"
          :options="['전체', '개인', '법인']"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_AUTH_RSG_YN')"
      >
        <!-- TODO: 코드관리 등록 안된 임시 소스 -->
        <kw-select
          v-model="searchParams.schCpsnRsgYn"
          :options="['해지', '해지예정']"
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
        <!-- TODO: 코드관리 등록 안된 임시 소스 -->
        <kw-option-group
          v-model="searchParams.schDv"
          :model-value="'연체잔액 0원 제외'"
          dense
          type="radio"
          :options="['연체잔액 0원 제외', '입금액 0원 제외', '대상잔액 0원 제외', '연체개월 0개월 제외']"
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
import { defineGrid, gridUtil, getComponentType, modal, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

// TODO: 고객리스트 검색조건
let cachedParams;
const searchParams = ref({
  schClctamNo: '',
  schCstNo: '',
  schCntrMpno: '',
  schCstNm: '',
  schClctamPsic: '',
  schSfK: '',
  schIstMpno: '',
  schDlqMcntStrt: '',
  schDlqMcntEnd: '',
  schFntDv: '',
  schFntDtStrt: '',
  schFntDtEnd: '',
  seachOjBlamStrt: '',
  seachOjBlamEnd: '',
  schCstDv: '',
  schCpsnRsgYn: '',
  schDv: '',
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

async function onClickSearch() {
  if (searchParams.value.schDv === '입금액 0원 제외') {
    searchParams.value.schDv = '2';
  } else if (searchParams.value.schDv === '대상잔액 0원 제외') {
    searchParams.value.schDv = '3';
  } else if (searchParams.value.schDv === '연체개월 0개월 제외') {
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
    { fieldName: 'clctamIchr', header: t('MSG_TXT_CLCTAM_ICHR'), width: '100' },
    { fieldName: 'cntrMpno', header: t('MSG_TXT_CNTR_MPNO'), width: '130', styleName: 'text-center' },
    { fieldName: 'istMpno', header: t('MSG_TXT_IST_MPNO'), width: '130', styleName: 'text-center' },
    { fieldName: 'vtAcBnk', header: t('MSG_TXT_VT_AC_BNK'), width: '100' },
    { fieldName: 'vtAcNo', header: t('MSG_TXT_VT_AC_NO'), width: '130', styleName: 'text-center' },
    { fieldName: 'sfk', header: t('MSG_TXT_SFK'), width: '100', styleName: 'text-center' },
    { fieldName: 'clnPsbl', header: t('MSG_TXT_CLN_PSBL'), width: '100' },
    { fieldName: 'clnPrcs', header: t('MSG_TXT_CLN_PRCS'), width: '100' },
    { fieldName: 'cstStat', header: t('MSG_TXT_CST_STAT'), width: '100' },
    { fieldName: 'cvcpInf', header: t('MSG_TXT_CVCP_INF'), width: '120' },
    { fieldName: 'unuslArtc', header: t('MSG_TXT_UNUITM'), width: '120' },
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
    if (cstNo) {
      await window.open(`/popup/#/wwbnc-customer-dtl?cstNo=${cstNo}`, 'POPUP', 'width=1540, height=1100, menubar=no, location=no');
    }
  };
});
</script>
