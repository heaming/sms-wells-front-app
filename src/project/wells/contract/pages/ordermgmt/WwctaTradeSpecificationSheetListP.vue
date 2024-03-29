<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaTradeSpecificationSheetListP - wells 거래명세서 목록 조회
3. 작성자 : jihoon.kim
4. 작성일 : 2023.03.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0048] - 고객 요청에 의한 거래명세서 출력 및 발송 기능 화면 (거래명세서 화면 통합)
****************************************************************************************************
--->
<template>
  <kw-popup
    size="4xl"
  >
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 증빙서류 종류 -->
        <kw-search-item :label="$t('MSG_TXT_DCEVDN_KND')">
          <kw-select
            v-model="searchParams.docDvCd"
            :options="[{ codeId: '1', codeName: t('MSG_TXT_DP_IZSH') },
                       { codeId: '2', codeName: t('MSG_TXT_TRD_SPCSH') },
                       { codeId: '3', codeName: t('MSG_TXT_CARD_SL_SLIP') },
                       { codeId: '4', codeName: t('MSG_TXT_CNTR_ARTC') }]"
            @change="onChangeDocDvCd"
          />
        </kw-search-item>
        <!-- 고객번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_CST_NO')"
        >
          <kw-option-group
            v-model="searchParams.cntrDvCd"
            type="radio"
            :options="checkOption"
            @change="onChangeCntrDvCd"
          />
        </kw-search-item>
        <!-- 구분 -->
        <kw-search-item
          v-if="isSearchDivVisible"
          :label="$t('MSG_TXT_DIV')"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="[{ codeId: '1', codeName: '할부' },
                       { codeId: '2', codeName: '렌탈/리스' },
                       { codeId: '3', codeName: '멤버십' },
                       { codeId: '6', codeName: '정기배송' }]"
            :model-value="searchParams.sellTpCd ? searchParams.sellTpCd : []"
            :multiple="true"
            @change="onChangeSellTpCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_PRD')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.cntrCnfmStrtDt"
            v-model:to="searchParams.cntrCnfmEndDt"
            rules="date_range_months:12"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="pageInfo.totalCount1" />
        <span class="ml8"> (단위:원)</span>
      </template>
      <!-- 메일발송 -->
      <kw-btn
        dense
        secondary
        :label="$t('MSG_BTN_EMAIL_SEND')"
        :disable="searchParams.cntrDvCd === '1'"
        @click="onClickEmailSend"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <!-- 발행(출력) -->
      <kw-btn
        primary
        dense
        :label="$t('MSG_BTN_PBL_PRNT')"
        @click="onClickPblPrnt"
      />
    </kw-action-top>
    <!-- 계약목록 -->
    <kw-grid
      v-if="isGrdContractsVisible"
      ref="grdContracts"
      name="grdContracts"
      :visible-rows="5"
      @init="initGrdContracts"
    />
    <kw-separator v-if="isGrdContractsVisible" />
    <kw-action-top v-if="isGrdContractsVisible">
      <template #left>
        <kw-paging-info :total-count="pageInfo.totalCount2" />
        <span class="ml8"> (단위:원)</span>
      </template>
    </kw-action-top>
    <!-- 입금내역서 -->
    <kw-grid
      v-if="isGrdDepositItemizationSheetVisible"
      ref="grdDepositItemizationSheet"
      name="grdDepositItemizationSheet"
      :visible-rows="5"
      @init="initGrdDepositItemizationSheet"
    />
    <!-- 거래명세서 -->
    <kw-grid
      v-if="isGrdTradeSpecificationSheetVisible"
      ref="grdTradeSpecificationSheet"
      name="grdTradeSpecificationSheet"
      :visible-rows="5"
      @init="initGrdTradeSpecificationSheet"
    />
    <!-- 카드매출전표 -->
    <kw-grid
      v-if="isGrdCardSalesSlipVisible"
      ref="grdCardSalesSlipSheet"
      name="grdCardSalesSlipSheet"
      :visible-rows="5"
      @init="initGrdCardSalesSlip"
    />
    <!-- 계약사항 -->
    <kw-grid
      v-if="isGrdContractArticlesVisible"
      ref="grdContractArticlesSheet"
      name="grdContractArticlesSheet"
      :visible-rows="5"
      @init="initGrdContractArticles"
    />
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, useGlobal, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const { alert, modal, notify } = useGlobal();
const props = defineProps({
  cntrNo: { type: String, required: false, default: '' },
  cntrSn: { type: String, required: false, default: '' },
  cntrCstNo: { type: String, required: false, default: '' },
});

let cachedParams;
const now = dayjs();
const searchParams = ref({
  docDvCd: '1', // 증빙서류종류(입금내역서)
  cntrDvCd: '1', // 1:계약번호, 2: 고객번호
  cntrDtlNo: `${props.cntrNo}-${props.cntrSn}`, // 계약번호+계약일련번호
  cntrNo: props.cntrNo, // 계약번호
  cntrSn: props.cntrSn, // 계약일련번호
  cntrCstNo: props.cntrCstNo, // 고객번호
  sellTpCd: [], // 구분(판매유형)
  cntrCnfmStrtDt: now.startOf('year').format('YYYYMMDD'),
  cntrCnfmEndDt: now.endOf('year').format('YYYYMMDD'),
});

const pageInfo = ref({
  totalCount1: 0,
  totalCount2: 0,
  pageIndex: 1,
  // 환경변수에서 기본설정값 받아오는 코드 현재 CFG_CMZ_DEFAULT_PAGE_SIZE 기본값:10
  // pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  pageSize: 10,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdContracts = ref(getComponentType('KwGrid'));
const grdDepositItemizationSheet = ref(getComponentType('KwGrid'));
const grdTradeSpecificationSheet = ref(getComponentType('KwGrid'));
const grdCardSalesSlipSheet = ref(getComponentType('KwGrid'));
const grdContractArticlesSheet = ref(getComponentType('KwGrid'));

const isGrdContractsVisible = ref(false); // 계약목록
const isGrdDepositItemizationSheetVisible = ref(true); // 입금내역서
const isGrdTradeSpecificationSheetVisible = ref(false); // 거래명세서
const isGrdCardSalesSlipVisible = ref(false); // 카드매출전표
const isGrdContractArticlesVisible = ref(false); // 계약사항
const isSearchDivVisible = ref(false); // 조회조건(구분)

// 그리드 Ref : 조회조건 바뀔 때마다 변경
let grdRef = grdDepositItemizationSheet;

const checkOption = ref([
  { codeId: '1', codeName: `${t('MSG_TXT_CNTR_NO')}(${`${props.cntrNo}-${props.cntrSn}`})` }, // 계약번호
  { codeId: '2', codeName: `${t('MSG_TXT_CST_NO')}(${props.cntrCstNo})` }, // 고객번호
]);

const grdContractsItems = ref([]);

async function onChangeDocDvCd() {
  if (searchParams.value.docDvCd === '1') { // 입금내역서
    grdRef = grdDepositItemizationSheet;
    isGrdDepositItemizationSheetVisible.value = true;
    isGrdTradeSpecificationSheetVisible.value = false;
    isGrdCardSalesSlipVisible.value = false;
    isGrdContractArticlesVisible.value = false;
  } else if (searchParams.value.docDvCd === '2') { // 거래명세서
    grdRef = grdTradeSpecificationSheet;
    isGrdDepositItemizationSheetVisible.value = false;
    isGrdTradeSpecificationSheetVisible.value = true;
    isGrdCardSalesSlipVisible.value = false;
    isGrdContractArticlesVisible.value = false;
  } else if (searchParams.value.docDvCd === '3') { // 카드매출전표
    grdRef = grdCardSalesSlipSheet;
    isGrdDepositItemizationSheetVisible.value = false;
    isGrdTradeSpecificationSheetVisible.value = false;
    isGrdCardSalesSlipVisible.value = true;
    isGrdContractArticlesVisible.value = false;
  } else if (searchParams.value.docDvCd === '4') { // 계약사항
    grdRef = grdContractArticlesSheet;
    isGrdDepositItemizationSheetVisible.value = false;
    isGrdTradeSpecificationSheetVisible.value = false;
    isGrdCardSalesSlipVisible.value = false;
    isGrdContractArticlesVisible.value = true;
  }

  if (searchParams.value.cntrDvCd === '1') { // 계약번호
    pageInfo.value.totalCount1 = 0;
    // eslint-disable-next-line no-use-before-define
    await fetchTrdSpcData(); // 증빙서류 종류
  } else if (searchParams.value.cntrDvCd === '2') { // 고객번호
    pageInfo.value.totalCount2 = 0;
    // eslint-disable-next-line no-use-before-define
    await fetchCtnrLstData(); // 계약목록
  }
}

async function onChangeCntrDvCd() {
  // console.log(`cntrDvCd : ${searchParams.value.cntrDvCd}`);
  if (searchParams.value.cntrDvCd === '1') { // 계약번호
    isGrdContractsVisible.value = false;
    isSearchDivVisible.value = false;
    pageInfo.value.totalCount1 = pageInfo.value.totalCount2;

    // eslint-disable-next-line no-use-before-define
    await fetchTrdSpcData(); // 증빙서류 종류
  } else if (searchParams.value.cntrDvCd === '2') { // 고객번호
    isGrdContractsVisible.value = true;
    isSearchDivVisible.value = true;
    pageInfo.value.totalCount2 = pageInfo.value.totalCount1;
    pageInfo.value.totalCount1 = 0;

    // eslint-disable-next-line no-use-before-define
    await fetchCtnrLstData(); // 계약목록
  }
}

async function onChangeSellTpCd() {
  // console.log(`sellTpCd : ${searchParams.value.sellTpCd}`);
  const serviceView = grdContracts.value?.getView();
  // const gridData = gridUtil.getAllRowValues(serviceView, false);
  const gridData = grdContractsItems.value;
  if (serviceView) {
    serviceView.getDataSource().setRows(gridData
      .filter((item) => searchParams.value.sellTpCd.includes(item.sellTpCd)));
    serviceView.resetCurrent();
  }
}

// 증빙서류종류
async function fetchTrdSpcData() {
  // changing api & cacheparams according to search classification
  let res = '';

  if (searchParams.value.cntrDvCd === '1') { // 계약번호
    searchParams.value.cntrNo = props.cntrNo;
    searchParams.value.cntrSn = props.cntrSn;
    searchParams.value.cntrCstNo = '';
  } else if (searchParams.value.cntrDvCd === '2') { // 고객번호
    searchParams.value.cntrNo = '';
    searchParams.value.cntrSn = '';
    searchParams.value.cntrCstNo = props.cntrCstNo;
  }

  cachedParams = cloneDeep(searchParams.value);
  // console.log(cachedParams);

  if (searchParams.value.docDvCd === '1') { // 입금내역서
    res = await dataService.get('/sms/wells/contract/contracts/order-details/specification/deposit-itemizations', { params: { ...cachedParams } });
  } else if (searchParams.value.docDvCd === '2') { // 거래명세서
    res = await dataService.get('/sms/wells/contract/contracts/order-details/specification/trade-specification', { params: { ...cachedParams } });
  } else if (searchParams.value.docDvCd === '3') { // 카드매출전표
    res = await dataService.get('/sms/wells/contract/contracts/order-details/specification/card-sales-slips', { params: { ...cachedParams } });
  } else if (searchParams.value.docDvCd === '4') { // 계약사항
    res = await dataService.get('/sms/wells/contract/contracts/order-details/specification/contract-articles', { params: { ...cachedParams } });
  }

  // const { list: details } = res.data;
  if (res.data.length === 0) {
    await notify(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }

  console.log(res.data);

  const view = grdRef.value.getView();
  view.getDataSource().setRows(res.data);
  if (searchParams.value.cntrDvCd === '1') { // 계약번호
    pageInfo.value.totalCount1 = view.getItemCount();
  } else if (searchParams.value.cntrDvCd === '2') { // 고객번호
    pageInfo.value.totalCount2 = view.getItemCount();
  }
  view.resetCurrent();
}

// 계약목록
async function fetchCtnrLstData() {
  // changing api & cacheparams according to search classification
  let res = '';

  searchParams.value.cntrCstNo = props.cntrCstNo;

  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);

  res = await dataService.get('/sms/wells/contract/contracts/order-details/specification/contracts', { params: { ...cachedParams } });
  if (res.data.length === 0) {
    await notify(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }

  // console.log(res.data);

  const view = grdContracts.value.getView();
  view.getDataSource().setRows(res.data);
  pageInfo.value.totalCount1 = view.getItemCount();
  view.resetCurrent();

  grdContractsItems.value = res.data;

  await fetchTrdSpcData(); // 증빙서류 종류
}

async function onClickSearch() {
  if (searchParams.value.cntrDvCd === '1') {
    await fetchTrdSpcData(); // 증빙서류 종류
  } else if (searchParams.value.cntrDvCd === '2') {
    await fetchCtnrLstData(); // 계약목록
  }
}

// 메일발송
async function onClickEmailSend() {
  if (searchParams.value.cntrDvCd === '1') {
    return;
  }

  const view = grdContracts.value.getView();
  const checkedItems = view.getCheckedItems();
  const cntrList = [];

  if (checkedItems.length === 0) {
    notify(t('MSG_ALT_BEFORE_SELECT_IT', [t('MSG_TXT_ITEM')]));
  } else {
    const cntrs = gridUtil.getCheckedRowValues(view);
    cntrs.forEach((row) => {
      cntrList.push({
        cntrNoFull: row.cntrDtlNo,
      });
    });

    const searchPopupParams = {
      docDvCd: searchParams.value.docDvCd, // 증빙서류종류
      cntrList,
      firstDt: searchParams.value.cntrCnfmStrtDt, // 기간(시작일자)
      lastDt: searchParams.value.cntrCnfmEndDt, // 기간(종료일자)
    };

    await modal({
      component: 'WwctaDocumentaryEvidenceMailForwardingP', // 증빙서류 메일발송
      componentProps: searchPopupParams,
    });
  }
}

// 발행(출력)
async function onClickPblPrnt() {
  await alert('발행(출력) 팝업은 작업예정입니다.');
}

onMounted(async () => {
  await fetchTrdSpcData(); // 증빙서류 종류(입금내역)
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
// 계약목록
const initGrdContracts = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약번호
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'cntrDt' }, // 계약일
    { fieldName: 'canDt' }, // 취소일
    { fieldName: 'sellTpCd' }, // 구분(유형)
    { fieldName: 'sellTpNm' }, // 구분(유형)명
    { fieldName: 'spayAmt', dataType: 'number' }, // 일시불 판매금액
    { fieldName: 'rentalAmt', dataType: 'number' }, // 렌탈료1
    { fieldName: 'rentalAmt2', dataType: 'number' }, // 렌탈료2
    { fieldName: 'mshAmt', dataType: 'number' }, // 멤버십료
    { fieldName: 'rglrSppAmt', dataType: 'number' }, // 정기배송료
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '131', styleName: 'text-center' }, // 계약번호
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-center' }, // 상품명
    { fieldName: 'cntrDt', header: t('MSG_TXT_CNTRCT_DT'), width: '131', styleName: 'text-center', datetimeFormat: 'date' }, // 계약일
    { fieldName: 'canDt', header: t('MSG_TXT_CAN_D'), width: '131', styleName: 'text-center', datetimeFormat: 'date' }, // 취소일
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TYPE'), width: '131', styleName: 'text-left' }, // 구분(유형)
    { fieldName: 'spayAmt', header: `${t('MSG_TXT_SNGL_PMNT')} ${t('MSG_TXT_SALE_PRICE')}`, width: '110', styleName: 'text-right' }, // 일시불 판매금액
    { fieldName: 'rentalAmt', header: t('MSG_TXT_RTLFE1'), width: '100', styleName: 'text-right' }, // 렌탈료1
    { fieldName: 'rentalAmt2', header: t('MSG_TXT_RTLFE2'), width: '110', styleName: 'text-right' }, // 렌탈료2
    { fieldName: 'mshAmt', header: t('MSG_TXT_MSH_AMT'), width: '188', styleName: 'text-right' }, // 멤버십료
    { fieldName: 'rglrSppAmt', header: t('MSG_TXT_REG_DLVR_AMT'), width: '188', styleName: 'text-right' }, // 정기배송료
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.filteringOptions.enabled = true;
});

// 증빙서류종류(입금내역서)
const initGrdDepositItemizationSheet = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약번호
    { fieldName: 'rveNoFull' }, // 입금번호
    { fieldName: 'rveDt' }, // 수납일자
    { fieldName: 'perfDt' }, // 실적일자
    { fieldName: 'pymDt' }, // 환불일자
    { fieldName: 'rveDvNm' }, // 유형
    { fieldName: 'rveAmt', dataType: 'number' }, // 금액
    { fieldName: 'dpTpCd' }, // 입금유형코드
    { fieldName: 'dpTpNm' }, // 구분(입금유형)
    { fieldName: 'cdcoNm' }, // 카드사
    { fieldName: 'crcdno' }, // 카드번호
    { fieldName: 'crdcdAprno' }, // 카드승인번호
    { fieldName: 'crdcdIstmMcn' }, // 할부개월
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '135', styleName: 'text-center' }, // 계약번호
    { fieldName: 'rveNoFull', header: t('MSG_TXT_DP_NO'), width: '131', styleName: 'text-center' }, // 입금번호
    { fieldName: 'rveDt', header: t('MSG_TXT_RVE_DT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 수납일자
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 실적일자
    { fieldName: 'pymDt', header: t('MSG_TXT_RFND_DT'), width: '131', styleName: 'text-center', datetimeFormat: 'date' }, // 환불일자
    { fieldName: 'rveDvNm', header: t('MSG_TXT_TYPE'), width: '100', styleName: 'text-center' }, // 유형
    { fieldName: 'rveAmt', header: t('MSG_TXT_AMT'), width: '100', styleName: 'text-right' }, // 금액
    { fieldName: 'dpTpNm', header: t('MSG_TXT_DIV'), width: '100', styleName: 'text-center' }, // 구분
    { fieldName: 'cdcoNm', header: t('MSG_TXT_CDCO'), width: '110', styleName: 'text-center' }, // 카드사
    {
      fieldName: 'crcdno',
      header: t('MSG_TXT_CARD_NO'),
      width: '188',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { crcdno, dpTpCd } = grid.getValues(index.itemIndex);
        if (dpTpCd === '0201') { // 개별수납(신용카드)
          return !isEmpty(crcdno) ? `${crcdno.substring(0, 4)}-
          ${crcdno.substring(4, 8)}-
          ${crcdno.substring(8, 12)}-
          ${crcdno.substring(12, 16)}` : '';
        }
        if (dpTpCd === '0101') { // 개별수납(가상계좌)
          return !isEmpty(crcdno) ? `${crcdno.substring(0, 6)}-
          ${crcdno.substring(6, 8)}-
          ${crcdno.substring(8, 14)}` : '';
        }
      },
    }, // 카드번호
    { fieldName: 'crdcdAprno', header: t('MSG_TXT_CARD_APR_NO'), width: '165', styleName: 'text-center' }, // 카드승인번호
    { fieldName: 'crdcdIstmMcn', header: t('MSG_TXT_ISTM_MCNT'), width: '110', styleName: 'text-right' }, // 할부개월
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// 증빙서류종류(거래명세서)
const initGrdTradeSpecificationSheet = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약번호
    { fieldName: 'sellTpNm' }, // 유형
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'lcrcnt' }, // 차월
    { fieldName: 'baseYm' }, // 년월
    { fieldName: 'lcsleymd' }, // 일시불매출일
    { fieldName: 'lcam16', dataType: 'number' }, // 매출
    { fieldName: 'w1Iamt', dataType: 'number' }, // 입금
    { fieldName: 'lcam36', dataType: 'number' }, // 선수금액
    { fieldName: 'lcdamt', dataType: 'number' }, // 연체금액
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '131', styleName: 'text-center' }, // 계약번호
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TYPE'), width: '131', styleName: 'text-center' }, // 유형
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-center' }, // 상품명
    { fieldName: 'lcrcnt', header: t('MSG_TXT_NMN'), width: '131', styleName: 'text-center' }, // 차월
    { fieldName: 'baseYm', header: t('MSG_TXT_YM'), width: '131', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 년월
    { fieldName: 'lcsleymd', header: `${t('MSG_TXT_SNGL_PMNT')}${t('MSG_TXT_DT_OF_SALE')}`, width: '110', styleName: 'text-center', datetimeFormat: 'date' }, // 일시불매출일
    { fieldName: 'lcam16', header: t('MSG_TXT_SL'), width: '110', styleName: 'text-right' }, // 매출
    { fieldName: 'w1Iamt', header: t('MSG_TXT_DP'), width: '100', styleName: 'text-right' }, // 입금
    { fieldName: 'lcam36', header: t('MSG_TXT_PRPD_AMT'), width: '110', styleName: 'text-right' }, // 선수금액
    { fieldName: 'lcdamt', header: t('MSG_TXT_DLQ_AMT'), width: '188', styleName: 'text-right' }, // 연체금액
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// 증빙서류종류(카드매출전표)
const initGrdCardSalesSlip = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약번호
    { fieldName: 'istmMcn' }, // 할부개월
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'dpstdt' }, // 거래일
    { fieldName: 'dpcndt' }, // 취소일
    { fieldName: 'cardvndr' }, // 결재카드
    { fieldName: 'dpcdnoFull' }, // 카드번호
    { fieldName: 'crdcdAprno' }, // 카드승인번호
    { fieldName: 'dpAmt', dataType: 'number' }, // 승인금액
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '131', styleName: 'text-center' }, // 계약번호
    { fieldName: 'istmMcn', header: t('MSG_TXT_ISTM_MCNT'), width: '110', styleName: 'text-right' }, // 할부개월
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-center' }, // 상품명
    { fieldName: 'dpstdt', header: t('MSG_TXT_TRD_DT'), width: '131', styleName: 'text-center', datetimeFormat: 'date' }, // 거래일
    { fieldName: 'dpcndt', header: t('MSG_TXT_CAN_D'), width: '131', styleName: 'text-center', datetimeFormat: 'date' }, // 취소일
    { fieldName: 'cardvndr', header: t('MSG_TXT_APRV_CARD'), width: '110', styleName: 'text-center' }, // 결재카드
    {
      fieldName: 'dpcdnoFull',
      header: t('MSG_TXT_CARD_NO'),
      width: '188',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { dpcdnoFull } = grid.getValues(index.itemIndex);
        return !isEmpty(dpcdnoFull) ? `${dpcdnoFull.substring(0, 4)}-
        ${dpcdnoFull.substring(4, 8)}-
        ${dpcdnoFull.substring(8, 12)}-
        ${dpcdnoFull.substring(12, 16)}` : '';
      },
    }, // 카드번호
    { fieldName: 'crdcdAprno', header: t('MSG_TXT_CARD_APR_NO'), width: '188', styleName: 'text-center' }, // 카드승인번호
    { fieldName: 'dpAmt', header: t('MSG_TXT_APRV_AMT'), width: '110', styleName: 'text-right' }, // 승인금액
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// 증빙서류종류(계약사항)
const initGrdContractArticles = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약번호
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'pdMclsfNm' }, // 제품
    { fieldName: 'lcsetymd' }, // 설치일
    { fieldName: 'lcamt1', dataType: 'number' }, // 렌탈료
    { fieldName: 'lcduty' }, // 약정기간(월)
    { fieldName: 'lcrcnt' }, // 사용차월
    { fieldName: 'rcgvpAdr' }, // 설치주소
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '131', styleName: 'text-center' }, // 계약번호
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-center' }, // 상품명
    { fieldName: 'pdMclsfNm', header: t('MSG_TXT_PDCT'), width: '131', styleName: 'text-center' }, // 제품
    { fieldName: 'lcsetymd', header: t('MSG_TXT_INST_DT'), width: '131', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일
    { fieldName: 'lcamt1', header: t('MSG_TXT_RTLFE'), width: '110', styleName: 'text-right' }, // 렌탈료
    { fieldName: 'lcduty', header: t('MSG_TXT_STPL_PTRM_MM'), width: '110', styleName: 'text-right' }, // 약정기간(월)
    { fieldName: 'lcrcnt', header: t('MSG_TXT_USE_NMN'), width: '100', styleName: 'text-right' }, // 사용차월
    { fieldName: 'rcgvpAdr', header: t('MSG_TXT_INST_ADDR'), width: '110', styleName: 'text-center' }, // 설치주소
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
