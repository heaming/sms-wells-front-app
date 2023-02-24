<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaCorporationCustomerPsListM - wells 법인(사업자) 고객현황(일시불 및 렌탈)
3. 작성자 : JSY
4. 작성일 : 2023.02.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- wells 법인(사업자) 고객현황(일시불 및 렌탈) 화면
****************************************************************************************************
--->
<template>
  <kw-page
    @load="onLoad"
  >
    <kw-search
      :modified-targets="['grdMain']"
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            :v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PERF_DV')"
        >
          <kw-option-group
            v-model="searchParams.perfGbn"
            type="radio"
            :options="[{codeId: '1', codeName:$t('MSG_TXT_DP_PERF')},{codeId:'2',codeName:$t('MSG_TXT_PD_ACC_RSLT')}]"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_EMPL_DV')"
        >
          <kw-option-group
            v-model="searchParams.empGbn"
            type="radio"
            :options="[{codeId: '', codeName:$t('MSG_TXT_ALL')},{codeId:'1',codeName:$t('MSG_TXT_EMP_PRCH')}]"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CNCL_DV')"
        >
          <kw-option-group
            v-model="searchParams.canGbn"
            type="radio"
            :options="[{codeId: '', codeName:$t('MSG_TXT_ALL')},{codeId:'N',codeName:$t('MSG_TXT_EXCLD_CANC')}]"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_LOOKUP_PERIOD')"
          required
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.dateGbn"
            :options="[
              {codeId: '1', codeName:$t('MSG_TIT_RECPETN_DT')},
              {codeId:'2',codeName:$t('MSG_TXT_INST_DT')},
              {codeId:'3',codeName:$t('MSG_TXT_RENTAL_NMN')},
            ]"
            rules="required"
          />
          <kw-date-range-picker
            v-if="searchParams.dateGbn!=3"
            v-model:from="searchParams.fromDate"
            v-model:to="searchParams.toDate"
            rules="date_range_required|date_range_months:1"
          />
          <kw-input
            v-if="searchParams.dateGbn==3"
            v-model="searchParams.fromRental"
            rules="required"
          />
          <span>~</span>
          <kw-input
            v-if="searchParams.dateGbn==3"
            v-model="searchParams.toRental"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PRDT_CATE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.pdHclsf"
            :options="hclsfList"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
            @change="onHclsfChanged"
          />
          <kw-select
            v-model="searchParams.pdMclsf"
            :options="mclsfList"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('TXT_MSG_PD_CD')"
        >
          <kw-input
            v-model="searchParams.pdCd"
            :placeholder="t('1234')"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PRDT_NM')"
          :placeholder="t('MSG_TXT_INP')"
        >
          <kw-input
            v-model="searchParams.pdNm"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CST_DV')"
        >
          <kw-option-group
            v-model="searchParams.cstrGbn"
            type="radio"
            :options="[
              {codeId: '', codeName:$t('MSG_TXT_ALL')},
              {codeId:'1',codeName:$t('MSG_TXT_INDV')},
              {codeId:'2',codeName:$t('MSG_TXT_CRP')},
            ]"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_FNT_DV')"
        >
          <kw-select
            v-model="searchParams.fntGbn"
            :options="codes.FNT_DV_CD"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_OG_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.fromogCd"
            :placeholder="t('A000000')"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.toOgCd"
            :placeholder="t('9999999')"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PRTNR_NO')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            :placeholder="t('MSG_TXT_INP')"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('TXT_MSG_FEE_ICT_OJ_YN')"
        >
          <kw-option-group
            v-model="searchParams.incentiveGbn"
            type="radio"
            :options="[{codeId: '', codeName:$t('MSG_TXT_ALL')},{codeId:'Y',codeName:$t('MSG_TXT_ICT_OJ')}]"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_BZ_ITM')"
        >
          <kw-input
            v-model="searchParams.dlpnrItemNm"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_BZCL')"
        >
          <kw-input
            v-model="searchParams.dlpnrBzclNm"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>

        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondry
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="1"
        @init="initGrid"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useMeta, getComponentType, gridUtil, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty, uniqBy } from 'lodash-es';

const dataService = useDataService();

const { getConfig } = useMeta();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'FNT_DV_CD',
);

const hclsfList = ref([]);
const mclsfList = ref([]);

const now = dayjs();

let cachedParams;
const searchParams = ref({
  sellTpCd: '',
  perfGbn: '1',
  empGbn: '',
  canGbn: '',
  dateGbn: '',
  fromDate: now.startOf('month').format('YYYYMMDD'),
  toDate: now.format('YYYYMMDD'),
  fromRental: '',
  toRental: '',
  pdHclsf: '',
  pdMclsf: '',
  pdCd: '',
  pdNm: '',
  cstrGbn: '2',
  fntGbn: '',
  fromogCd: '',
  toOgCd: '',
  prtnrNo: '',
  incentiveGbn: '',
  dlpnrItemNm: '',
  dlpnrBzclNm: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function onLoad() {
  const response = await dataService.get('/sms/wells/contract/product-standards/high-levels');

  const initHclsfList = [];

  response.data.forEach((v) => {
    if (!isEmpty(v.gnrCd)) initHclsfList.push({ codeId: v.pdClsfId, codeName: v.pdClsfNm });
  });
  hclsfList.value = uniqBy(initHclsfList, 'codeId');
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/corporates/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(details);
  view.resetCurrent();
}

async function onClickSearch() {
  if (searchParams.value.dateGbn === '3') {
    if (parseInt(searchParams.value.toRental, 10) - parseInt(searchParams.value.fromRental, 10) > 3) {
      alert(t('MSG_ALT_INP_RENTAL_3_MONTH'));
      return false;
    }
  }

  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/contract/contracts/corporates/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'corporationCustomerPsList',
    timePostfix: true,
    exportData: res.data,
  });
}

async function onHclsfChanged() {
  const response = await dataService.get('/sms/wells/contract/product-standards/mid-levels', { params: {
    pdHclsf: searchParams.value.pdHclsf,
  } });

  const initMclsfList = [];

  response.data.forEach((v) => {
    if (!isEmpty(v.gnrCd)) initMclsfList.push({ codeId: v.pdClsfId, codeName: v.pdClsfNm });
  });
  mclsfList.value = uniqBy(initMclsfList, 'codeId');
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'sellTpNm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'copnDvCd' },
    { fieldName: 'bzrno' },
    { fieldName: 'bryy' },
    { fieldName: 'txnTpCd' },
    { fieldName: 'adrZip' },
    { fieldName: 'adr' },
    { fieldName: 'dtlAdr' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'cntrTpCd' },
    { fieldName: 'basePdCd' },
    { fieldName: 'pdAbbrNm' },
    { fieldName: 'pdMclsfNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'svPrd' },
    { fieldName: 'fnlPdUswyCd' },
    { fieldName: 'bznsSpptOgCd' },
    { fieldName: 'ogUpbrngPrtnrNo' },
    { fieldName: 'bznsSpptPrtnrKnm' },
    { fieldName: 'ackmtPerfAmt' },
    { fieldName: 'cntrAmt' },
    { fieldName: 'fnlAmt' },
    { fieldName: 'discountAmt' },
    { fieldName: 'pdBaseAmt' },
    { fieldName: 'recapDutyPtrmN' },
    { fieldName: 'etrcnt' },
    { fieldName: 'txinvPblYn' },
    { fieldName: 'txinvPblTpCd' },
    { fieldName: 'emadr' },
    { fieldName: 'mpyMthdTpCd' },
    { fieldName: 'mpyMthdTpNm' },
    { fieldName: 'mpyBsdt' },
    { fieldName: 'slDt' },
    { fieldName: 'canDt' },
    { fieldName: 'fulpyDt' },
    { fieldName: 'cntrPdStrtdt' },
    { fieldName: 'cntrPdEnddt' },
    { fieldName: 'prmEndMm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'dgr1LevlOgCd' },
    { fieldName: 'dgr2LevlOgCd' },
    { fieldName: 'ogCd' },
    { fieldName: 'dgr3LevlDgPrtnrNo' },
    { fieldName: 'dgr3LevlDgPrtnrNm' },
    { fieldName: 'bldNm' },
    { fieldName: 'dscApyTpCd' },
    { fieldName: 'dscApyDtlCd' },
    { fieldName: 'chdvcYn' },
    { fieldName: 'rernt' },
    { fieldName: 'nw' },
    { fieldName: 'discSys' },
    { fieldName: 'dlpnrBzclNm' },
    { fieldName: 'dlpnrItemNm' },
    { fieldName: 'reqdDt' },
    { fieldName: 'chdvcCntrNo' },
    { fieldName: 'chdvcCntrStlmFshDtm' },
    { fieldName: 'chdvcCntrCanDtm' },
    { fieldName: 'chdvcBasePdCd' },
    { fieldName: 'chdvcPdNm' },
    { fieldName: 'chdvcSellRate' },
    { fieldName: 'chdvcSellAmt' },
    { fieldName: 'pointDt' },
    { fieldName: 'pointAmt' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'pkgPdCd' },
    { fieldName: 'pkgPdNm' },
    { fieldName: 'pmotCd' },
    { fieldName: 'pmotDesc' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fstRgstUsrNm' },
    { fieldName: 'fstRgstDt' },
    { fieldName: 'fstRgstTm' },
    { fieldName: 'fnlMdfcUsrId' },
    { fieldName: 'fnlMdfcDt' },
    { fieldName: 'fnlMdfcTm' },
  ];

  const columns = [
    { fieldName: 'sellTpNm', header: '업무유형', width: '112', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: '계약번호', width: '145', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: '계약자', width: '112', styleName: 'text-center' },
    { fieldName: 'copnDvCd', header: '계약자구분', width: '112', styleName: 'text-center' },
    { fieldName: 'bzrno', header: '사업자등록번호', width: '145', styleName: 'text-center' },
    { fieldName: 'bryy', header: '고객생년(YY)', width: '112', styleName: 'text-center' },
    { fieldName: 'txnTpCd', header: '과세유형', width: '112', styleName: 'text-center' },
    { fieldName: 'adrZip', header: '우편번호', width: '112', styleName: 'text-center' },
    { fieldName: 'adr', header: '주소', width: '281', styleName: 'text-left' },
    { fieldName: 'dtlAdr', header: '상세주소', width: '281', styleName: 'text-left' },
    { fieldName: 'sellTpCd', header: '판매유형', width: '112', styleName: 'text-center' },
    { fieldName: 'cntrTpCd', header: '판매구분', width: '112', styleName: 'text-center' },
    { fieldName: 'basePdCd', header: '상품코드', width: '145', styleName: 'text-left' },
    { fieldName: 'pdAbbrNm', header: '약어', width: '112', styleName: 'text-center' },
    { fieldName: 'pdMclsfNm', header: '상품분류', width: '112', styleName: 'text-center' },
    { fieldName: 'pdNm', header: '상품명', width: '281', styleName: 'text-left' },
    { fieldName: 'svPrd', header: '관리주기', width: '112', styleName: 'text-right' },
    { fieldName: 'fnlPdUswyCd', header: '용도구분', width: '112', styleName: 'text-right' },
    { fieldName: 'bznsSpptOgCd', header: '조직코드', width: '121', styleName: 'text-center' },
    { fieldName: 'ogUpbrngPrtnrNo', header: '사번', width: '121', styleName: 'text-center' },
    { fieldName: 'bznsSpptPrtnrKnm', header: '담당자', width: '120', styleName: 'text-center' },

    { fieldName: 'ackmtPerfAmt', header: '인정실적금액', width: '125', styleName: 'text-right' },
    { fieldName: 'cntrAmt', header: '렌탈등록비', width: '125', styleName: 'text-right' },
    { fieldName: 'fnlAmt', header: '총렌탈료', width: '125', styleName: 'text-right' },
    { fieldName: 'discountAmt', header: '렌탈할인료', width: '125', styleName: 'text-right' },
    { fieldName: 'pdBaseAmt', header: '렌탈료', width: '125', styleName: 'text-right' },
    { fieldName: 'recapDutyPtrmN', header: '의무사용', width: '125', styleName: 'text-right' },
    { fieldName: 'etrcnt', header: '렌탈차월', width: '125', styleName: 'text-right' },

    { fieldName: 'txinvPblYn', header: '발행여부', width: '121', styleName: 'text-center' },
    { fieldName: 'txinvPblTpCd', header: '발행구분', width: '121', styleName: 'text-center' },
    { fieldName: 'emadr', header: '이메일', width: '227', styleName: 'text-left' },
    { fieldName: 'mpyMthdTpCd', header: '이체구분', width: '121', styleName: 'text-center' },
    { fieldName: 'mpyMthdTpNm', header: '이체구분명', width: '121', styleName: 'text-center' },
    { fieldName: 'mpyBsdt', header: '이체일', width: '120', styleName: 'text-right' },
    { fieldName: 'slDt', header: '매출일', width: '125', styleName: 'text-center' },
    { fieldName: 'canDt', header: '취소일', width: '125', styleName: 'text-center' },
    { fieldName: 'fulpyDt', header: '만료일', width: '125', styleName: 'text-center' },
    { fieldName: 'cntrPdStrtdt', header: '가입일', width: '121', styleName: 'text-center' },
    { fieldName: 'cntrPdEnddt', header: '탈퇴일', width: '121', styleName: 'text-center' },
    { fieldName: 'prmEndMm', header: '선납종료일', width: '120', styleName: 'text-center' },

    { fieldName: 'prtnrNo', header: '파트너사번', width: '121', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: '파트너명', width: '121', styleName: 'text-center' },
    { fieldName: 'dgr1LevlOgCd', header: '총괄단', width: '120', styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgCd', header: '지역단', width: '120', styleName: 'text-center' },
    { fieldName: 'ogCd', header: '조직코드', width: '120', styleName: 'text-center' },
    { fieldName: 'dgr3LevlDgPrtnrNo', header: '지점장사번', width: '120', styleName: 'text-center' },
    { fieldName: 'dgr3LevlDgPrtnrNm', header: '지점장명', width: '120', styleName: 'text-center' },
    { fieldName: 'bldNm', header: '빌딩명', width: '159', styleName: 'text-left' },
    { fieldName: 'dscApyTpCd', header: '할인구분', width: '125', styleName: 'text-center' },
    { fieldName: 'dscApyDtlCd', header: '행사유형', width: '125', styleName: 'text-center' },
    { fieldName: 'chdvcYn', header: '기기변경', width: '125', styleName: 'text-center' },

    { fieldName: 'rernt', header: '재렌탈여부', width: '121', styleName: 'text-center' },
    { fieldName: 'nw', header: '신규여부', width: '121', styleName: 'text-center' },
    { fieldName: 'discSys', header: '할인제도', width: '125', styleName: 'text-center' },
    { fieldName: 'dlpnrBzclNm', header: '업태', width: '159', styleName: 'text-left' },
    { fieldName: 'dlpnrItemNm', header: '종목', width: '159', styleName: 'text-left ' },
    { fieldName: 'reqdDt', header: '철거일', width: '125', styleName: 'text-center' },
    { fieldName: 'chdvcCntrNo', header: '계약번호', width: '145', styleName: 'text-center' },
    { fieldName: 'chdvcCntrStlmFshDtm', header: '매출일', width: '121', styleName: 'text-center' },
    { fieldName: 'chdvcCntrCanDtm', header: '취소일', width: '121', styleName: 'text-center' },
    { fieldName: 'chdvcBasePdCd', header: '상품코드', width: '112', styleName: 'text-center' },
    { fieldName: 'chdvcPdNm', header: '상품명', width: '281', styleName: 'text-left' },
    { fieldName: 'chdvcSellRate', header: '적용률', width: '121', styleName: 'text-center' },
    { fieldName: 'chdvcSellAmt', header: '렌탈료', width: '112', styleName: 'text-center' },

    { fieldName: 'pointDt', header: '포인트적용일', width: '125', styleName: 'text-center' },
    { fieldName: 'pointAmt', header: '포인트입금', width: '125', styleName: 'text-right' },
    { fieldName: 'cntrCstNo', header: '고객번호', width: '125', styleName: 'text-center' },
    { fieldName: 'pkgPdCd', header: '패키지상품번호', width: '125', styleName: 'text-center' },
    { fieldName: 'pkgPdNm', header: '패키지상품명', width: '125', styleName: 'text-center' },
    { fieldName: 'pmotCd', header: '프로모션코드', width: '125', styleName: 'text-center' },
    { fieldName: 'pmotDesc', header: '프로모션내용', width: '200', styleName: 'text-left' },
    { fieldName: 'fstRgstUsrId', header: '입력담당', width: '125', styleName: 'text-center' },
    { fieldName: 'fstRgstUsrNm', header: '입력담당명', width: '125', styleName: 'text-center' },
    { fieldName: 'fstRgstDt', header: '등록일', width: '125', styleName: 'text-center' },
    { fieldName: 'fstRgstTm', header: '등록시간', width: '125', styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrId', header: '수정담당', width: '125', styleName: 'text-center' },
    { fieldName: 'fnlMdfcDt', header: '수정일', width: '125', styleName: 'text-center' },
    { fieldName: 'fnlMdfcTm', header: '수정시간', width: '125', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.checkBar.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'sellTpNm', 'cntrNo',
    {
      header: '계약자정보',
      direction: 'horizontal',
      items: ['cstKnm', 'copnDvCd', 'bzrno', 'bryy', 'txnTpCd', 'adrZip', 'adr', 'dtlAdr', 'sellTpCd', 'cntrTpCd', 'basePdCd', 'pdAbbrNm', 'pdMclsfNm', 'pdNm', 'svPrd', 'fnlPdUswyCd'],
    },
    {
      header: '웰스 매니저 정보',
      direction: 'horizontal',
      items: ['bznsSpptOgCd', 'ogUpbrngPrtnrNo', 'bznsSpptPrtnrKnm'],
    },
    'ackmtPerfAmt', 'cntrAmt', 'fnlAmt', 'discountAmt', 'pdBaseAmt', 'recapDutyPtrmN', 'etrcnt',
    {
      header: '세금계산서 정보',
      direction: 'horizontal',
      items: ['txinvPblYn', 'txinvPblTpCd', 'emadr'],
    },
    {
      header: '이체정보',
      direction: 'horizontal',
      items: ['mpyMthdTpCd', 'mpyMthdTpNm', 'mpyBsdt'],

    },
    'slDt', 'canDt', 'fulpyDt',
    {
      header: '멤버십 정보',
      direction: 'horizontal',
      items: ['cntrPdStrtdt', 'cntrPdEnddt', 'prmEndMm'],

    },
    {
      header: '파트너 정보',
      direction: 'horizontal',
      items: ['prtnrNo', 'prtnrKnm', 'dgr1LevlOgCd', 'dgr2LevlOgCd', 'ogCd', 'dgr3LevlDgPrtnrNo', 'dgr3LevlDgPrtnrNm'],

    },
    'bldNm', 'dscApyTpCd', 'dscApyDtlCd', 'chdvcYn',
    {
      header: '계약자정보',
      direction: 'horizontal',
      items: ['rernt', 'nw'],

    },
    'discSys', 'dlpnrBzclNm', 'dlpnrItemNm', 'reqdDt',
    {
      header: '기변이전 정보',
      direction: 'horizontal',
      items: ['chdvcCntrNo', 'chdvcCntrStlmFshDtm', 'chdvcCntrCanDtm', 'chdvcBasePdCd', 'chdvcPdNm', 'chdvcSellRate', 'chdvcSellAmt'],

    },
    'pointDt', 'pointAmt', 'cntrCstNo', 'pkgPdCd', 'pkgPdNm', 'pmotCd', 'pmotDesc', 'fstRgstUsrId', 'fstRgstUsrNm', 'fstRgstDt', 'fstRgstTm', 'fnlMdfcUsrId', 'fnlMdfcDt', 'fnlMdfcTm',

  ]);
}
</script>
<style scoped>
</style>
