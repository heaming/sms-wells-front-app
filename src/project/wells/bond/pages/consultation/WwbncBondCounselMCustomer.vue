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
    ref="frmMainRef"
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
          regex="num"
          :maxlength="10"
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
          :maxlength="10"
          regex="num"
          @click-icon="onClickSelectCustomer"
          @change="onChangeCstNo"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_MPNO')"
      >
        <kw-input
          v-model:tel-no0="searchParams.schCralLocaraTno"
          v-model:tel-no1="searchParams.schMexnoEncr"
          v-model:tel-no2="searchParams.schCralIdvTno"
          mask="telephone"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CST_NM')"
      >
        <kw-input
          v-model="searchParams.schCstNm"
          icon="search"
          :maxlength="30"
          clearable
          @click-icon="onClickSelectCustomer"
          @change="onChangeCstNo"
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
          :maxlength="30"
          clearable
          @click-icon="onClickClctamPsic"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_SFK')"
      >
        <kw-input
          v-model="searchParams.schSfK"
          icon="search"
          regex="num"
          :maxlength="13"
          @click-icon="onClickSelectCustomer"
        />
      </kw-search-item>

      <kw-search-item
        :label="$t('MSG_TXT_IST_MPNO')"
      >
        <kw-input
          v-model:tel-no0="searchParams.schIstCralLocaraTno"
          v-model:tel-no1="searchParams.schIstMexnoEncr"
          v-model:tel-no2="searchParams.schIstCralIdvTno"
          mask="telephone"
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
          first-option="all"
        />
        <span>-</span>
        <kw-select
          v-model="searchParams.schDlqMcntEnd"
          :options="selectCodes.DLQ_MCNT"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_FNT_DT')"
        :colspan="2"
      >
        <kw-select
          v-model="searchParams.schFntDv"
          :options="selectCodes.FNT_DV"
          first-option="all"
        />
        <span>-</span>
        <kw-select
          v-model="searchParams.schFntDtStrt"
          :options="selectCodes.FNT_DT"
          first-option="all"
        />
        <span>-</span>
        <kw-select
          v-model="searchParams.schFntDtEnd"
          :options="selectCodes.FNT_DT"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_OJ_BLAM')"
      >
        <kw-input v-model="searchParams.schOjBlamStrt" />
        <span>-</span>
        <kw-input v-model="searchParams.schOjBlamEnd" />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_CST_DV')"
      >
        <kw-option-group
          v-model="searchParams.schCstDv"
          type="radio"
          :options="codes.CST_SE_APY_DV_CD.filter((v) => ['01', '02'].includes(v.codeId))"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_AUTH_RSG_YN')"
      >
        <kw-select
          v-model="searchParams.schCpsnRsgYn"
          :options="selectCodes.AUTH_AUTH_RSG_YN"
          first-option="all"
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
        :disable="totalCount === 0"
        @click="onClickIstMessageSend"
      />
      <kw-btn
        :label="$t('MSG_BTN_CNTR_CHAR_FW')"
        primary
        dense
        :disable="totalCount === 0"
        @click="onClickCntrMessageSend"
      />
    </kw-action-top>

    <ul class="filter-box mb12">
      <li class="filter-box__item">
        <p class="filter-box__item-label">
          {{ $t('MSG_TXT_DIV') }}
        </p>
        <kw-option-group
          v-model="searchParams.schDv"
          dense
          type="radio"
          :options="[
            { codeId: '99', codeName:t('MSG_TXT_ALL') },
            { codeId: '01', codeName:t('MSG_TXT_DLQ_BLAM_EXCD') , disable:isRadioDisable },
            { codeId: '02', codeName:t('MSG_TXT_TOT_DP_AMT_EXCD') , disable:isRadioDisable },
            { codeId: '03', codeName:t('MSG_TXT_OJ_BLAM_EXCD'), disable:isRadioDisable },
            { codeId: '04', codeName:t('MSG_TXT_DLQ_MCNT_EXCD') , disable:isRadioDisable }
          ]"
          @change="onChangeDv"
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
import { defineGrid, gridUtil, codeUtil, getComponentType, modal, useDataService, notify, popupUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import { getDlqMcnt, getFntDt, getWellsCstListDv, getAuthAuthRsgYn, getFntDv } from '~sms-common/bond/utils/bnUtil';

const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const isRadioDisable = ref(true);

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
  schCralLocaraTno: '',
  schMexnoEncr: '',
  schCralIdvTno: '',
  schCstNm: '',
  schClctamPsic: '',
  schSfK: '',
  schIstCralLocaraTno: '',
  schIstMexnoEncr: '',
  schIstCralIdvTno: '',
  schDlqMcntStrt: '',
  schDlqMcntEnd: '',
  schFntDv: '',
  schFntDtStrt: '',
  schFntDtEnd: '',
  schOjBlamStrt: '',
  schOjBlamEnd: '',
  schCstDv: '',
  schCpsnRsgYn: '',
  schDv: '99',
  schCstNoYn: 'N',
  dv1: '',
  dv2: '',
});

const frmMainRef = ref(getComponentType('KwForm'));
const customerParams = ref({});
const totalCount = ref(0);
const windowKey = ref('');

/** 고객리스트 조회 */
async function fetchCustomers() {
  const response = await dataService.get('/sms/wells/bond/bond-counsel/customers', { params: cachedParams, timeout: 200000 });
  const customers = response.data;
  totalCount.value = customers.length;

  const gridView = grdMainRef.value.getView();
  gridView.getDataSource().setRows(customers);

  isRadioDisable.value = false;
}

/** 고객리스트 엑셀다운로드 */
async function onClickExcelDownload() {
  const res = await dataService.get('/sms/wells/bond/bond-counsel/customers', { params: cachedParams });
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    checkBar: 'hidden',
    exportData: res.data,
  });
}

// TODO: 고객번호/고객명 변경
async function onChangeCstNo() {
  searchParams.value.schCstNoYn = 'N';
}

// TODO: 고객조회(공통)
async function onClickSelectCustomer() {
  const { result, payload } = await modal({
    component: 'ZwbnyDelinquentCustomerP',
    componentProps: {
      baseYm: customerParams.value.baseYm,
      cstNo: searchParams.value.schCstNo,
      cstNm: searchParams.value.schCstNm,
      sfkVal: searchParams.value.schSfK,

    },
  });
  if (result) {
    const { cstNo, cstNm, sfkVal } = payload;
    searchParams.value.schCstNo = cstNo;
    searchParams.value.schCstNm = cstNm;
    searchParams.value.schSfK = sfkVal;
    searchParams.value.schCstNoYn = 'Y';
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
    searchParams.value.schClctamPsic = payload.prtnrKnm;
    searchParams.value.schClctamNo = payload.prtnrNo;
  }
};

// TODO: 설치문자발송
const onClickIstMessageSend = async () => {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  await modal({
    component: 'ZwbncMessageSendP',
    componentProps: {
      listType: 'customer',
      dataList: checkedRows,
      cntrType: 'i',
    },
  });
};

// TODO: 계약문자발송
const onClickCntrMessageSend = async () => {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  await modal({
    component: 'ZwbncMessageSendP',
    componentProps: {
      listType: 'customer',
      dataList: checkedRows,
      cntrType: 'c',
    },
  });
};

async function onClickSearch() {
  const cstNo = searchParams.value.schCstNo;
  const cstNm = searchParams.value.schCstNm;
  const sfkVal = searchParams.value.schSfK;
  const cstNoYn = searchParams.value.schCstNoYn;

  if (cstNo !== '' || cstNm !== '') {
    if (cstNoYn === 'N') {
      notify(t('MSG_ALT_NAME_NO_IN'));
      return;
    }
  }
  if (sfkVal !== '') {
    if (cstNoYn === 'N') {
      notify(t('MSG_ALT_SFK_IN'));
      return;
    }
  }

  const dlqMcntStrt = searchParams.value.schDlqMcntStrt;
  const dlqMcntEnd = searchParams.value.schDlqMcntEnd;
  const fntDtStrt = searchParams.value.schFntDtStrt;
  const fntDtEnd = searchParams.value.schFntDtEnd;
  const ojBlamStrt = searchParams.value.schOjBlamStrt;
  const ojBlamEnd = searchParams.value.schOjBlamEnd;

  if (dlqMcntStrt > dlqMcntEnd) {
    await notify(t('MSG_ALT_STRT_YM_END_YM_BIG', [t('MSG_TXT_DLQ_MCNT') + t('MSG_TXT_RSV_STRT_DTM'), t('MSG_TXT_RSV_END_DTM')]));
    return false;
  }

  if (fntDtStrt > fntDtEnd) {
    await notify(t('MSG_ALT_STRT_YM_END_YM_BIG', [t('MSG_TXT_FNT_DT') + t('MSG_TXT_RSV_STRT_DTM'), t('MSG_TXT_RSV_END_DTM')]));
    return false;
  }

  if (Number(ojBlamStrt) > Number(ojBlamEnd)) {
    await notify(t('MSG_ALT_STRT_YM_END_YM_BIG', [t('MSG_TXT_OJ_BLAM') + t('MSG_TXT_RSV_STRT_DTM'), t('MSG_TXT_RSV_END_DTM')]));
    return false;
  }

  cachedParams = cloneDeep(searchParams.value);
  await fetchCustomers();
}

// TODO: 구분 라디오 선택
async function onChangeDv() {
  if (searchParams.value.schClctamNo === '') {
    searchParams.value.dv1 = searchParams.value.schDv;
    if (searchParams.value.dv1 !== searchParams.value.dv2) {
      if (!await frmMainRef.value.validate()) {
        searchParams.value.schDv = '99';
        searchParams.value.dv2 = '99';
      } else {
        await onClickSearch();
      }
    }
  } else {
    await onClickSearch();
  }
}

async function fetchBaseYmData() {
  const response = await dataService.get('/sms/wells/bond/bond-counsel/base-ym');
  customerParams.value = response.data;
}

onMounted(async () => {
  await fetchBaseYmData();
});

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
    { fieldName: 'fnt', header: t('MSG_TXT_FNT'), width: '120', styleName: 'text-center' },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'dlqMcnt', header: t('MSG_TXT_DLQ_MCNT'), width: '70', styleName: 'text-center' },
    { fieldName: 'fnlCnslD', header: t('MSG_TXT_FNL_CNSL_D'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
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
    { fieldName: 'clctamIchr', header: t('MSG_TXT_CLCTAM_PSIC'), width: '100', styleName: 'text-center' },
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

    { fieldName: 'vtAcBnk', header: t('MSG_TXT_VT_AC_BNK'), width: '100', styleName: 'text-center' },
    { fieldName: 'vtAcNo', header: t('MSG_TXT_VT_AC_NO'), width: '130', styleName: 'text-center' },
    { fieldName: 'sfk', header: t('MSG_TXT_SFK'), width: '120', styleName: 'text-center' },
    { fieldName: 'clnPsbl', header: t('MSG_TXT_CLN_PSBL'), width: '100', styleName: 'text-center' },
    { fieldName: 'clnPrcs', header: t('MSG_TXT_CLN_PRCS'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstStat', header: t('MSG_TXT_CST_STAT'), width: '100', styleName: 'text-center' },
    { fieldName: 'cvcpInf', header: t('MSG_TXT_CVCP_INF'), width: '120', styleName: 'text-center' },
    { fieldName: 'unuslArtc', header: t('MSG_TXT_UNUITM'), width: '120', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '100', styleName: 'text-center', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.setFixedOptions({
    colCount: 4,
  });

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
    windowKey.value = `WwbncBondCounselMCustomer_${cstNo}`;
    if (cstNo) {
      await popupUtil.open(`/popup/#/wwbnc-customer-dtl?cstNo=${cstNo}&cntrNo=${cntrNo}&cntrSn=${cntrSn}`, { width: 2000, height: 1100 }, { cstNo, cntrNo, cntrSn }, windowKey.value);
    }
  };
});
</script>
