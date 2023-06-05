<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaContractIntegrationListM - 회원 통합 조회
3. 작성자 : jihoon.kim
4. 작성일 : 2023.05.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0045] - 회원 정보 리스트 및 상세 정보(고객싱글뷰) 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 계약일 -->
        <kw-search-item
          :label="$t('MSG_TXT_CNTRCT_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.cntrCnfmStrtDtm"
            v-model:to="searchParams.cntrCnfmFinsDtm"
            rules="date_range_required|date_range_months:1"
          />
        </kw-search-item>
        <!-- 플래너 -->
        <kw-search-item
          :label="$t('MSG_TXT_PLAR')"
          required
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.plarDv"
            :options="[{ codeId: 'A', codeName: t('MSG_TXT_SELLER_PERSON') },
                       { codeId: 'B', codeName: t('MSG_TXT_ADMIN') }]"
            first-option="all"
            first-option-value=""
          />
          <kw-select
            v-model="searchParams.prtnrDv"
            :options="[{ codeId: '1', codeName: t('MSG_TXT_EPNO') },
                       { codeId: '2', codeName: t('MSG_TXT_DEPT_CD') }]"
            @change="onChangePrtnrSeltDv"
          />
          <!-- 인사사원번호(사번) -->
          <kw-input
            v-if="isSearchHmnrscEmpnoVisible"
            v-model="searchParams.hmnrscEmpno"
            clearable
            icon="search"
            :placeholder="t('MSG_TXT_INP')"
            :maxlength="10"
            @click-icon="onClickSearchPrtnrNoPopup()"
          />
          <!-- 부서코드 -->
          <kw-input
            v-if="isSearchOgCdVisible"
            v-model="searchParams.ogCd"
            clearable
            icon="search"
            :placeholder="t('MSG_TXT_INP')"
            :maxlength="10"
            @click-icon="onClickSearchDeptListPopup()"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 고객선택 -->
        <kw-search-item
          :label="$t('MSG_TXT_CST_CHO')"
          required
        >
          <kw-select
            v-model="searchParams.cntrCstSeltDv"
            :options="[{ codeId: '1', codeName: t('MSG_TXT_CST_NM_CNTRT') },
                       { codeId: '2', codeName: t('MSG_TXT_CST_NO') },
                       { codeId: '3', codeName: t('MSG_TXT_MPNO_CNTRT') },
                       { codeId: '4', codeName: t('MSG_TXT_CST_NM_INSTR') },
                       { codeId: '5', codeName: t('MSG_TXT_MPNO_INSTR') },
                       { codeId: '6', codeName: t('MSG_TXT_ENTRP_NO') },
                       { codeId: '7', codeName: t('MSG_TXT_SFK') }]"
            @change="onChangeCntrCstSeltDv"
          />
          <!-- 고객명(계약자/설치자) -->
          <kw-input
            v-if="isSearchCstKnmVisible"
            v-model="searchParams.cntrCstNm"
            :label="$t('MSG_TXT_CST_NM')"
            rules="required"
            :placeholder="t('MSG_TXT_INP')"
            :maxlength="50"
          />
          <!-- 고객번호/세이프키 -->
          <kw-input
            v-if="isSearchCntrCstNoVisible"
            v-model="searchParams.cntrCstNo"
            :label="$t('MSG_TXT_CST_NO')"
            icon="search"
            clearable
            :on-click-icon="onClickSearchCustomer"
            rules="required|max:10|numeric"
            :maxlength="10"
          />
          <!-- 사업자번호 -->
          <kw-input
            v-if="isSearchBzrnoVisible"
            v-model="searchParams.bzrno"
            :placeholder="t('MSG_TXT_INP')"
            rules="required|max:10|numeric"
            :label="$t('MSG_TXT_CBNO')"
            :type="number"
            :regex="/^[0-9]*$/i"
            :maxlength="10"
          />
          <!-- 휴대전화번호(계약자/설치자) -->
          <kw-input
            v-if="isSearchMpnoVisible"
            v-model:model-value="searchParams.cntrCstMpno"
            v-model:telNo0="searchParams.cralLocaraTno"
            v-model:telNo1="searchParams.mexnoEncr"
            v-model:telNo2="searchParams.cralIdvTno"
            :placeholder="t('MSG_TXT_INP')"
            mask="telephone"
          />
        </kw-search-item>
        <!-- 관리구분(판매유형코드) -->
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_DV')"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
            multiple
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMainRef"
        :visible-rows="pageInfo.pageSize"
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
import { codeUtil, defineGrid, getComponentType, useDataService, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const { alert, modal } = useGlobal();
// const { getConfig } = useMeta();
const { currentRoute } = useRouter();

let cachedParams;
const now = dayjs();
const searchParams = ref({
  cntrCnfmStrtDtm: now.startOf('month').format('YYYYMMDD'), // 계약확정시작일시
  cntrCnfmFinsDtm: now.format('YYYYMMDD'), // 계약확정종료일시
  plarDv: '', // 플래너구분(판매자/관리자)
  prtnrDv: '2', // 파트너내역구분(사번/부서코드)
  hmnrscEmpno: '', // 인사사원번호
  ogTpCd: '', // 조직유형코드
  ogCd: '', // 부서코드(조직코드)
  cntrCstSeltDv: '1', // 고객선택구분
  cntrCstNo: '', // 고객번호(세이프키)
  cntrCstNm: '', // 고객명(계약자/설치자)
  cntrCstMpno: '', // 휴대전화번호(계약자/설치자)
  cralLocaraTno: '', // 휴대지역전화번호(계약자/설치자)
  mexnoEncr: '', // 휴대전화국번호암호화(계약자/설치자)
  cralIdvTno: '', // 휴대개별전화번호(계약자/설치자)
  bzrno: '', // 사업자번호
  sellTpCd: [''], // 계약구분(판매유형코드)
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SELL_TP_CD', // 판매유형코드
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  // 환경변수에서 기본설정값 받아오는 코드 현재 CFG_CMZ_DEFAULT_PAGE_SIZE 기본값:10
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const isSearchHmnrscEmpnoVisible = ref(false); // 플래너(인사사원번호)
const isSearchOgCdVisible = ref(true); // 플래너(부서코드)

const isSearchCstKnmVisible = ref(true); // 고객선택(고객명)
const isSearchCntrCstNoVisible = ref(false); // 고객선택(고객번호/세이프키)
const isSearchBzrnoVisible = ref(false); // 고객선택(사업자번호)
const isSearchMpnoVisible = ref(false); // 고객선택(휴대전화번호)

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  res = await dataService.get('/sms/wells/contract/contracts/details/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: pages, pageInfo: pagingResult } = res.data;
  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }

  pageInfo.value = pagingResult;
  console.log(res.data);

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(pages);
  // pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회버튼 클릭 이벤트
async function onClickSearch() {
  await fetchData();
}

// 초기화버튼 클릭 이벤트
async function onClickReset() {
  searchParams.value.hmnrscEmpno = ''; // 인사사원번호
  searchParams.value.ogTpCd = ''; // 조직유형코드
  searchParams.value.prtnrKnm = ''; // 성명
  searchParams.value.ogCd = ''; // 부서코드(조직코드)

  isSearchHmnrscEmpnoVisible.value = false;
  isSearchOgCdVisible.value = true;

  searchParams.value.cntrCstSeltDv = '1'; // 고객선택
  searchParams.value.cntrCstNm = ''; // 고객명(계약자/설치자)
  searchParams.value.cntrCstNo = ''; // 고객번호(세이프키)
  searchParams.value.bzrno = ''; // 사업자번호
  searchParams.value.cntrCstMpno = ''; // 휴대전화번호(계약자/설치자)
  searchParams.value.cralLocaraTno = ''; // 휴대지역전화번호(계약자/설치자)
  searchParams.value.mexnoEncr = ''; // 휴대전화국번호암호화(계약자/설치자)
  searchParams.value.cralIdvTno = ''; // 휴대개별전화번호(계약자/설치자)

  isSearchCstKnmVisible.value = true;
  isSearchCntrCstNoVisible.value = false;
  isSearchBzrnoVisible.value = false;
  isSearchMpnoVisible.value = false;
}

// 고객번호 검색 팝업조회
async function onClickSearchCustomer() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: { cstType: '1', cstNo: searchParams.value.cntrCstNo },
  });

  if (result) {
    searchParams.value.cntrCstNo = payload.cstNo;
  }
}

// 파트너 검색 팝업 호출
async function onClickSearchPrtnrNoPopup() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {},
  });
  if (result) {
    searchParams.value.hmnrscEmpno = payload.prtnrNo;
    searchParams.value.ogTpCd = payload.ogTpCd;
  }
}

// 부서코드 검색 팝업조회
async function onClickSearchDeptListPopup() {
  const { result, payload } = await modal({
    component: 'ZwcmpDeptListP',
    componentProps: {
      departmentId: searchParams.value.ogCd,
    },
  });
  if (result) {
    searchParams.value.ogCd = payload.departmentId;
  }
}

// 플래너구분 변경 시 호출 이벤트
async function onChangePrtnrSeltDv() {
  // console.log(`prtnrDv : ${searchParams.value.prtnrDv}`);
  if (searchParams.value.prtnrDv === '1') { // 인사사원번호
    isSearchHmnrscEmpnoVisible.value = true;
    isSearchOgCdVisible.value = false;

    searchParams.value.prtnrKnm = ''; // 성명
    searchParams.value.ogCd = ''; // 부서코드(조직코드)
  } else if (searchParams.value.prtnrDv === '2') { // 부서코드(조직코드)
    isSearchHmnrscEmpnoVisible.value = false;
    isSearchOgCdVisible.value = true;

    searchParams.value.hmnrscEmpno = ''; // 인사사원번호
    searchParams.value.ogTpCd = ''; // 조직유형코드
    searchParams.value.prtnrKnm = ''; // 성명
  } else {
    isSearchHmnrscEmpnoVisible.value = false;
    isSearchOgCdVisible.value = false;

    searchParams.value.hmnrscEmpno = ''; // 인사사원번호
    searchParams.value.ogTpCd = ''; // 조직유형코드
    searchParams.value.prtnrKnm = ''; // 성명
    searchParams.value.ogCd = ''; // 부서코드(조직코드)
  }
}

// 고객선택구분 변경 시 호출 이벤트
async function onChangeCntrCstSeltDv() {
  // console.log(`cntrCstSeltDv : ${searchParams.value.cntrCstSeltDv}`);
  if (['1', '4'].includes(searchParams.value.cntrCstSeltDv)) { // 고객명(계약자/설치자)
    isSearchCstKnmVisible.value = true;
    isSearchCntrCstNoVisible.value = false;
    isSearchBzrnoVisible.value = false;
    isSearchMpnoVisible.value = false;

    searchParams.value.cntrCstNo = ''; // 고객번호(세이프키)
    searchParams.value.bzrno = ''; // 사업자번호
    searchParams.value.cntrCstMpno = ''; // 휴대전화번호(계약자/설치자)
    searchParams.value.cralLocaraTno = ''; // 휴대지역전화번호(계약자/설치자)
    searchParams.value.mexnoEncr = ''; // 휴대전화국번호암호화(계약자/설치자)
    searchParams.value.cralIdvTno = ''; // 휴대개별전화번호(계약자/설치자)
  } else if (['2', '7'].includes(searchParams.value.cntrCstSeltDv)) { // 고객번호(세이프키)
    isSearchCstKnmVisible.value = false;
    isSearchCntrCstNoVisible.value = true;
    isSearchBzrnoVisible.value = false;
    isSearchMpnoVisible.value = false;

    searchParams.value.cntrCstNm = ''; // 고객명(계약자/설치자)
    searchParams.value.bzrno = ''; // 사업자번호
    searchParams.value.cntrCstMpno = ''; // 휴대전화번호(계약자/설치자)
    searchParams.value.cralLocaraTno = ''; // 휴대지역전화번호(계약자/설치자)
    searchParams.value.mexnoEncr = ''; // 휴대전화국번호암호화(계약자/설치자)
    searchParams.value.cralIdvTno = ''; // 휴대개별전화번호(계약자/설치자)
  } else if (['3', '5'].includes(searchParams.value.cntrCstSeltDv)) { // 휴대전화번호(계약자/설치자)
    isSearchCstKnmVisible.value = false;
    isSearchCntrCstNoVisible.value = false;
    isSearchBzrnoVisible.value = false;
    isSearchMpnoVisible.value = true;

    searchParams.value.cntrCstNm = ''; // 고객명(계약자/설치자)
    searchParams.value.cntrCstNo = ''; // 고객번호(세이프키)
    searchParams.value.bzrno = ''; // 사업자번호
  } else if (searchParams.value.cntrCstSeltDv === '6') { // 사업자번호
    isSearchCstKnmVisible.value = false;
    isSearchCntrCstNoVisible.value = false;
    isSearchBzrnoVisible.value = true;
    isSearchMpnoVisible.value = false;

    searchParams.value.cntrCstNm = ''; // 고객명(계약자/설치자)
    searchParams.value.cntrCstNo = ''; // 고객번호(세이프키)
    searchParams.value.cntrCstMpno = ''; // 휴대전화번호(계약자/설치자)
    searchParams.value.cralLocaraTno = ''; // 휴대지역전화번호(계약자/설치자)
    searchParams.value.mexnoEncr = ''; // 휴대전화국번호암호화(계약자/설치자)
    searchParams.value.cralIdvTno = ''; // 휴대개별전화번호(계약자/설치자)
  }
}

// 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/details/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ojSellTpNm' }, // 계약구분
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'rcgvpKnm' }, // 설치고객
    { fieldName: 'depositDetail' }, // 입금내역
    { fieldName: 'cstGdCd' }, // 고객등급
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'sellTpCd' }, // 판매유형코드
    { fieldName: 'cntrCnfmDtm' }, // 계약일
    { fieldName: 'istDt' }, // 설치일
    { fieldName: 'cntrStat' }, // 사용구분
    { fieldName: 'svPrd' }, // 주기
    { fieldName: 'cancWtdrDt' }, // 취소/탈퇴일
    { fieldName: 'rentalTn' }, // 설치차월
    { fieldName: 'fmmbN' }, // 가구수
    { fieldName: 'cntrTno' }, // 계약자 전화번호
    { fieldName: 'cntrLocaraTno' }, // 계약자 지역전화번호
    { fieldName: 'cntrExnoEncr' }, // 계약자 전화국번호암호화
    { fieldName: 'cntrIdvTno' }, // 계약자 개별전화번호
    { fieldName: 'cntrCralTno' }, // 계약자 휴대전화번호
    { fieldName: 'cntrCralLocaraTno' }, // 계약자 휴대지역전화번호
    { fieldName: 'cntrMexnoEncr' }, // 계약자 휴대전화국번호암호화
    { fieldName: 'cntrCralIdvTno' }, // 계약자 휴대개별전화번호
    { fieldName: 'istTno' }, // 설치자 전화번호
    { fieldName: 'istLocaraTno' }, // 설치자 지역전화번호
    { fieldName: 'istExnoEncr' }, // 설치자 전화국번호암호화
    { fieldName: 'istIdvTno' }, // 설치자 개별전화번호
    { fieldName: 'istCralTno' }, // 설치자 휴대전화번호
    { fieldName: 'istCralLocaraTno' }, // 설치자 휴대지역전화번호
    { fieldName: 'istMexnoEncr' }, // 설치자 휴대전화국번호암호화
    { fieldName: 'istCralIdvTno' }, // 설치자 휴대개별전화번호
    { fieldName: 'copnDvCd' }, // 고객구분코드(1:개인, 2:법인)
    { fieldName: 'dpTpCd' }, // 이체방식 납부방식유형코드
    { fieldName: 'dpTpNm' }, // 이체방식 납부방식유형코드명
    { fieldName: 'mpyBsdt' }, // 이체일
    { fieldName: 'bryyMmdd' }, // 생년월일
    { fieldName: 'bzrno' }, // 사업자번호
    { fieldName: 'txinvPblOjYn' }, // 세금계산서 발행대상여부
    { fieldName: 'txinvPblD' }, // 세금계산서 발행일
    { fieldName: 'sexDvNm' }, // 성별
    { fieldName: 'cntrCstNo' }, // 고객번호
    { fieldName: 'adrZip' }, // 우편번호
    { fieldName: 'instAddr' }, // 설치 주소
    { fieldName: 'sppOrdIvcNo' }, // 송장번호
    { fieldName: 'ogNm' }, // 소속코드
    { fieldName: 'sellPrtnrNo' }, // 판매자 사번
    { fieldName: 'sellPrtnrKnm' }, // 판매자명
    { fieldName: 'sellCralTno' }, // 판매자 휴대전화번호
    { fieldName: 'sellCralLocaraTno' }, // 판매자 휴대지역전화번호
    { fieldName: 'sellMexnoEncr' }, // 판매자 휴대전화국번호암호화
    { fieldName: 'sellCralIdvTno' }, // 판매자 휴대개별전화번호
    { fieldName: 'bsOgNm' }, // 소속코드
    { fieldName: 'bsPrtnrNo' }, // 웰스매니저 사번
    { fieldName: 'bsPrtnrKnm' }, // 웰스매니저명
    { fieldName: 'bsCralTno' }, // 웰스매니저 휴대전화번호
    { fieldName: 'bsCralLocaraTno' }, // 웰스매니저 휴대지역전화번호
    { fieldName: 'bsMexnoEncr' }, // 웰스매니저 휴대전화국번호암호화
    { fieldName: 'bsCralIdvTno' }, // 웰스매니저 휴대개별전화번호
  ];

  const columns = [
    { fieldName: 'ojSellTpNm', header: t('MSG_TXT_CNTR_DV'), width: '130', styleName: 'text-center' }, // 계약구분
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '180', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center' }, // 고객명
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_INST_CST_NM'), width: '130', styleName: 'text-center' }, // 설치고객명
    { fieldName: 'depositDetail', header: t('MSG_TXT_DP_IZ'), width: '130', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_DP_IZ') }, // 입금내역
    { fieldName: 'cstGdCd', header: t('MSG_TXT_CST_GRD'), width: '130', styleName: 'text-center' }, // 고객등급
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '250', styleName: 'text-center' }, // 상품명
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTRCT_DT'), width: '160', styleName: 'text-center', datetimeFormat: 'date' }, // 계약일
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일
    { fieldName: 'cntrStat', header: t('MSG_TXT_USG'), width: '130', styleName: 'text-center' }, // 사용구분
    { fieldName: 'svPrd', header: t('MSG_TXT_CYCL'), width: '130', styleName: 'text-right' }, // 주기
    { fieldName: 'cancWtdrDt', header: t('MSG_TXT_CANC_WTDR_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' }, // 취소/탈퇴일
    { fieldName: 'rentalTn', header: t('MSG_TXT_INST_OVER'), width: '130', styleName: 'text-center' }, // 설치차월
    { fieldName: 'fmmbN', header: t('MSG_TXT_HSHD_N'), width: '130', styleName: 'text-center' }, // 가구수
    {
      fieldName: 'cntrTno',
      header: t('MSG_TXT_TEL_NO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrLocaraTno, cntrExnoEncr, cntrIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(cntrLocaraTno) && !isEmpty(cntrExnoEncr) && !isEmpty(cntrIdvTno) ? `${cntrLocaraTno}-${cntrExnoEncr}-${cntrIdvTno}` : '';
      },
    }, // 계약자 전화번호
    {
      fieldName: 'cntrCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrCralLocaraTno, cntrMexnoEncr, cntrCralIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(cntrCralLocaraTno) && !isEmpty(cntrMexnoEncr) && !isEmpty(cntrCralIdvTno) ? `${cntrCralLocaraTno}-${cntrMexnoEncr}-${cntrCralIdvTno}` : '';
      },
    }, // 계약자 휴대전화번호
    {
      fieldName: 'istTno',
      header: t('MSG_TXT_TEL_NO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { istLocaraTno, istExnoEncr, istIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(istLocaraTno) && !isEmpty(istExnoEncr) && !isEmpty(istIdvTno) ? `${istLocaraTno}-${istExnoEncr}-${istIdvTno}` : '';
      },
    }, // 설치자 전화번호
    {
      fieldName: 'istCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { istCralLocaraTno, istMexnoEncr, istCralIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(istCralLocaraTno) && !isEmpty(istMexnoEncr) && !isEmpty(istCralIdvTno) ? `${istCralLocaraTno}-${istMexnoEncr}-${istCralIdvTno}` : '';
      },
    }, // 설치자 휴대전화번호
    { fieldName: 'dpTpNm', header: t('MSG_TXT_FNT_MTHD'), width: '130', styleName: 'text-center' }, // 이체방식 납부방식유형코드명
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FTD'), width: '130', styleName: 'text-center' }, // 이체일
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_BIRTH_DATE'), width: '130', styleName: 'text-center', datetimeFormat: 'date' }, // 생년월일
    { fieldName: 'bzrno', header: t('MSG_TXT_ENTRP_NO'), width: '130', styleName: 'text-center' }, // 사업자번호
    { fieldName: 'txinvPblOjYn', header: t('MSG_TXT_TXINV'), width: '127', styleName: 'text-center' }, // 세금계산서
    { fieldName: 'sexDvNm', header: t('MSG_TXT_GENDER'), width: '130', styleName: 'text-center' }, // 성별
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '130', styleName: 'text-center' }, // 고객번호
    { fieldName: 'adrZip', header: t('MSG_TXT_ZIP'), width: '130', styleName: 'text-center' }, // 우편번호
    { fieldName: 'instAddr', header: t('MSG_TXT_INST_ADDR'), width: '464', styleName: 'text-left' }, // 설치주소
    { fieldName: 'sppOrdIvcNo', header: t('MSG_TXT_IVC_NO'), width: '130', styleName: 'text-center' }, // 송장번호
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG_CD'), width: '130', styleName: 'text-center' }, // 소속코드
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_PTNR_NO'), width: '130', styleName: 'text-center' }, // 판매자 사번
    { fieldName: 'sellPrtnrKnm', header: t('MSG_TXT_SELL_NM'), width: '130', styleName: 'text-center' }, // 판매자명
    {
      fieldName: 'sellCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { sellCralLocaraTno, sellMexnoEncr, sellCralIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(sellCralLocaraTno) && !isEmpty(sellMexnoEncr) && !isEmpty(sellCralIdvTno) ? `${sellCralLocaraTno}-${sellMexnoEncr}-${sellCralIdvTno}` : '';
      },
    }, // 판매자 휴대전화번호
    { fieldName: 'bsOgNm', header: t('MSG_TXT_BLG_CD'), width: '130', styleName: 'text-center' }, // 소속코드
    { fieldName: 'bsPrtnrNo', header: t('MSG_TXT_MNGER_EPNO'), width: '134', styleName: 'text-center' }, // 웰스매니저 사번
    { fieldName: 'bsPrtnrKnm', header: t('MSG_TXT_MNGER_NM'), width: '135', styleName: 'text-center' }, // 웰스매니저명
    { fieldName: 'bsCralTno', header: t('MSG_TXT_MPNO'), width: '161', styleName: 'text-center' }, // 웰스매니저 휴대전화번호
    {
      fieldName: 'bsCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { bsCralLocaraTno, bsMexnoEncr, bsCralIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(bsCralLocaraTno) && !isEmpty(bsMexnoEncr) && !isEmpty(bsCralIdvTno) ? `${bsCralLocaraTno}-${bsMexnoEncr}-${bsCralIdvTno}` : '';
      },
    }, // 웰스매니저 휴대전화번호
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setFixedOptions({ colCount: 6 });

  // multi row header setting
  view.setColumnLayout([
    'ojSellTpNm',
    'cntrDtlNo',
    'cstKnm',
    'rcgvpKnm',
    'depositDetail',
    'cstGdCd',
    'pdNm',
    'cntrCnfmDtm',
    'istDt',
    'cntrStat',
    'svPrd',
    'cancWtdrDt',
    'rentalTn',
    'fmmbN',
    {
      header: t('MSG_TXT_CNTRT'), // 계약자
      direction: 'horizontal', // merge type
      items: ['cntrTno', 'cntrCralTno'],
    },
    {
      header: t('MSG_TXT_INSTR'), // 설치자
      direction: 'horizontal',
      items: ['istTno', 'istCralTno'],
    },
    'dpTpNm',
    'mpyBsdt',
    'bryyMmdd',
    'bzrno',
    'txinvPblOjYn',
    'sexDvNm',
    'cntrCstNo',
    'adrZip',
    'instAddr',
    'sppOrdIvcNo',
    {
      header: t('MSG_TXT_BLG_CD'), // 소속코드
      direction: 'horizontal',
      items: ['ogNm', 'sellPrtnrNo', 'sellPrtnrKnm', 'sellCralTno'],
    },
    {
      header: t('MSG_TXT_WELS_MNGER'), // 웰스 매니저
      direction: 'horizontal',
      items: ['bsOgNm', 'bsPrtnrNo', 'bsPrtnrKnm', 'bsCralTno'],
    },
  ]);

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const paramCntrDtlNo = gridUtil.getCellValue(g, dataRow, 'cntrDtlNo');
    const paramCntrNo = String(paramCntrDtlNo).split('-')[0];
    const paramCntrSn = String(paramCntrDtlNo).split('-')[1];
    const { sellTpCd } = g.getValues(dataRow);
    const { cntrCstNo } = g.getValues(dataRow);
    const { copnDvCd } = g.getValues(dataRow);
    // const paramSellPrtnrKnm = gridUtil.getCellValue(g, dataRow, 'sellPrtnrKnm');

    if (['cntrDtlNo'].includes(column)) { // 계약상세(윈도우팝업)
      await modal({ component: 'WwctaOrderDetailP', componentProps: { cntrNo: paramCntrNo, cntrSn: paramCntrSn, sellTpCd, cntrCstNo, copnDvCd } });
    } else if (['depositDetail'].includes(column)) { // 입금내역
      await alert('입금내역 팝업은 개발예정입니다.');
    }
  };
});
</script>
<style scoped>
</style>
