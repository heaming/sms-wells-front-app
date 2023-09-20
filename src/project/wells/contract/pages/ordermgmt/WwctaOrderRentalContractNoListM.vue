<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaOrderRentalContractNoListM - 주문상세조회/관리(렌탈-주문번호 조회)
3. 작성자 : jihoon.kim
4. 작성일 : 2023.03.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0047] - 계약번호기준으로 렌탈 주문상세내역을 조회한다.
****************************************************************************************************
--->
<template>
  <kw-search
    one-row
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- 계약상세번호 -->
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_DTL_NO')"
        colspan="2"
        required
      >
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
          icon="search"
          class="w300"
          rules="required"
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
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
        <span class="ml8">(단위:원, 개월:건)</span>
      </template>
      <kw-btn
        v-if="isCsvDownloadVisible"
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_BTN_CSV_DOWN')"
        :disable="!pageInfo.totalCount"
        @click="onClickCsvDownload"
      />
      <kw-btn
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="!pageInfo.totalCount"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdRentalContractorNoList"
      name="grdRentalContractorNoList"
      :visible-rows="pageInfo.pageSize"
      @init="initGridRentalContractorNoList"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, useDataService, gridUtil, useGlobal, defineGrid } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const dataService = useDataService();
const { t } = useI18n();
const { alert, modal } = useGlobal();
// const { getConfig } = useMeta();
const { currentRoute } = useRouter();

let cachedParams;
const searchParams = ref({
  cntrNo: '',
  cntrSn: '',
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
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
const grdRentalContractorNoList = ref(getComponentType('KwGrid'));
const isCsvDownloadVisible = ref(true); // CSV Download Button

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/contracts/order-detail-mngt/rentals/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: pages, pageInfo: pagingResult } = res.data;
  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }

  pageInfo.value = pagingResult;
  console.log(res.data);

  const view = grdRentalContractorNoList.value.getView();
  view.getDataSource().setRows(pages);
  // pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  await fetchData();
}

// CSV다운로드버튼 클릭 이벤트
async function onClickCsvDownload() {
  const view = grdRentalContractorNoList.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/order-detail-mngt/rentals/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
    exportType: 'csv',
  });
}

// 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload() {
  const view = grdRentalContractorNoList.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/order-detail-mngt/rentals/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  // await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridRentalContractorNoList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약번호
    { fieldName: 'ordrInfoView' }, // 주문정보 보기
    { fieldName: 'sellTpCd' }, // 판매유형코드
    { fieldName: 'sellTpDtlNm' }, // 판매유형
    { fieldName: 'dgr3LevlDgPrtnrNo' }, // 파트너정보-지점장 사번
    { fieldName: 'dgr3LevlDgPrtnrNm' }, // 파트너정보-지점장명
    { fieldName: 'dgr3LevlDgPrtnrNmEncr' }, // 파트너정보-지점장명(암호화)
    { fieldName: 'dgr3LevlOgCd' }, // 파트너정보-지점코드
    { fieldName: 'sellPrtnrNo' }, // 파트너정보-파트너사번
    { fieldName: 'prtnrKnm' }, // 파트너정보-파트너명
    { fieldName: 'prtnrKnmEncr' }, // 파트너정보-파트너명(암호화)
    { fieldName: 'sellPrtnrCralTno' }, // 파트너정보-휴대전화번호
    { fieldName: 'cralLocaraTno' }, // 파트너정보-휴대지역전화번호
    { fieldName: 'mexnoEncr' }, // 파트너정보-휴대전화국번호암호화
    { fieldName: 'cralIdvTno' }, // 파트너정보-휴대개별전화번호
    { fieldName: 'cntrDt' }, // 파트너정보-업무개시일
    { fieldName: 'cltnDt' }, // 파트너정보-업무해약일
    { fieldName: 'cstKnm' }, // 계약자 정보-계약자명
    { fieldName: 'cstKnmEncr' }, // 계약자 정보-계약자명(암호화)
    { fieldName: 'bryy' }, // 계약자 정보-생년(YY)
    { fieldName: 'bzrNo' }, // 계약자 정보-사업자번호
    { fieldName: 'sexDvNm' }, // 계약자 정보-성별
    { fieldName: 'cntrCstNo' }, // 계약자 정보-고객번호
    { fieldName: 'adrZip' }, // 계약자 정보-우편번호
    { fieldName: 'cntrCstRnadr' }, // 계약자 정보-기준주소
    { fieldName: 'cntrCstRdadr' }, // 계약자 정보-상세주소
    { fieldName: 'cntrCstRdadrEncr' }, // 계약자 정보-상세주소(암호화)
    { fieldName: 'rcgvpKnm' }, // 설치정보-설치자명
    { fieldName: 'rcgvpKnmEncr' }, // 설치정보-설치자명(암호화)
    { fieldName: 'istCralTno' }, // 설치정보-휴대전화번호
    { fieldName: 'istCralLocaraTno' }, // 설치정보-휴대지역전화번호
    { fieldName: 'istMexnoEncr' }, // 설치정보-휴대전화국번호암호화
    { fieldName: 'istCralIdvTno' }, // 설치정보-휴대개별전화번호
    { fieldName: 'istAdrZip' }, // 설치정보-우편번호
    { fieldName: 'istRnadr' }, // 설치정보-기준주소
    { fieldName: 'istRdadr' }, // 설치정보-상세주소
    { fieldName: 'istRdadrEncr' }, // 설치정보-상세주소(암호화)
    { fieldName: 'sppOrdNo' }, // 설치정보-운송장 번호
    { fieldName: 'pdctIdno' }, // 설치정보-S N 번호
    { fieldName: 'istAkDt' }, // 설치요청일
    { fieldName: 'sellInflwChnlDtlNm' }, // 판매구분
    { fieldName: 'copnDvCd' }, // 고객구분코드(1:개인, 2:법인)
    { fieldName: 'copnDvNm' }, // 고객구분명
    { fieldName: 'pdClsfNm' }, // 상품 정보-상품분류
    { fieldName: 'pdNm' }, // 상품 정보-상품명
    { fieldName: 'basePdCd' }, // 상품 정보-상품코드
    { fieldName: 'pdTpNm' }, // 상품 정보-상품유형
    { fieldName: 'svPrd' }, // 상품 정보-주기
    { fieldName: 'svTpCd' }, // 상품 정보-용도구분
    { fieldName: 'svTpNm' }, // 상품 정보-용도구분 명
    { fieldName: 'cntrRcpFshDt' }, // 접수일
    { fieldName: 'sppDuedt' }, // 예정일
    { fieldName: 'istDt' }, // 설치일
    { fieldName: 'slDt' }, // 매출일
    { fieldName: 'cntrPtrm' }, // 계약기간
    { fieldName: 'cntrPdEnddt' }, // 만료일
    { fieldName: 'canDt' }, // 취소일
    { fieldName: 'reqdDt' }, // 철거일
    { fieldName: 'exnReqdDt' }, // 회수일
    { fieldName: 'recapDutyPtrmN' }, // 의무기간
    { fieldName: 'cntrAmt', dataType: 'number' }, // 등록비
    { fieldName: 'cntrCtrAmt', dataType: 'number' }, // 등록할인
    { fieldName: 'rentalAmt1', dataType: 'number' }, // 렌탈료1
    { fieldName: 'rentalDscAmt1', dataType: 'number' }, // 렌탈할인1
    { fieldName: 'rentalAmt2', dataType: 'number' }, // 렌탈료2
    { fieldName: 'rentalDscAmt2', dataType: 'number' }, // 렌탈할인2
    { fieldName: 'rentalDscDfam', dataType: 'number' }, // 할인차액
    { fieldName: 'booSellYn' }, // 예약
    { fieldName: 'mchnChYn' }, // 기변
    { fieldName: 'mchnCpsApyr' }, // 기변실적율
    { fieldName: 'ackmtPerfAmt', dataType: 'number' }, // 인정실적액
    { fieldName: 'ackmtPerfRt' }, // 인정실적률(%)
    { fieldName: 'feeAckmtBaseAmt', dataType: 'number' }, // 수수료기준금액
    { fieldName: 'feeFxamYn' }, // 수수료정액여부
    { fieldName: 'sellDscDvCd' }, // 할인구분
    { fieldName: 'sellDscDvNm' }, // 할인구분명
    { fieldName: 'sellDscTpCd' }, // 할인유형
    { fieldName: 'sellDscTpNm' }, // 할인유형명
    { fieldName: 'dscPmotCd' }, // 할인제도
    { fieldName: 'mchnChTpCd' }, // 기변유형
    { fieldName: 'ojCntrDtlNo' }, // 기변상대코드
    { fieldName: 'ojBasePdCd' }, // 기변이전상품
    { fieldName: 'ojPdNm' }, // 기변이전상품명
    { fieldName: 'bogoCd' }, // １＋１연계코드
    { fieldName: 'bogoPdCd' }, // １＋１이전상품
    { fieldName: 'bogoPdNm' }, // １＋１이전상품명
    { fieldName: 'mpyMthdTpNm' }, // 계좌정보-자동이체
    { fieldName: 'aftnInf' }, // 계좌정보-카드／계좌번호
    { fieldName: 'dpTpCd' }, // 계좌정보-납부방식유형코드
    { fieldName: 'acnoEncr' }, // 계좌정보-계좌번호
    { fieldName: 'crcdnoEncr' }, // 계좌정보-카드번호
    { fieldName: 'aftnOwrKnm' }, // 계좌정보-예금／카드주명
    { fieldName: 'aftnOwrKnmEncr' }, // 계좌정보-예금／카드주명(암호화)
    { fieldName: 'sellEvCd' }, // 행사코드
    { fieldName: 'alncmpCd' }, // 제휴코드
    { fieldName: 'alncmpNm' }, // 제휴코드명
    { fieldName: 'alncStatTpNm' }, // 제휴상태
    { fieldName: 'alncmpCstCd' }, // 제휴고객코드
    { fieldName: 'alncmpPrtnrNo' }, // 제휴파트너
    { fieldName: 'cttRsCd' }, // 컨택코드
    { fieldName: 'cttRsNm' }, // 컨택내용
    { fieldName: 'fstRgstPrgId' }, // 등록프로그램
    { fieldName: 'fstRgstUsrId' }, // 업무담당
    { fieldName: 'fstRgstUsrNm' }, // 업무담당명
    { fieldName: 'fstPerfYm' }, // 최초연체
    { fieldName: 'fnlPerfYm' }, // 최종연체
    { fieldName: 'fstMngtYm' }, // 최초매출중지
    { fieldName: 'fnlMngtYm' }, // 최종매출중지
    { fieldName: 'pmotCd' }, // 프로모션 정보-프로모션 번호
    { fieldName: 'pmotFvrMcn' }, // 프로모션 정보-할인개월
    { fieldName: 'pmotFvrAmt' }, // 프로모션 정보-할인금액
    { fieldName: 'frisuBfsvcPtrmN' }, // 프로모션 정보-무료개월
    { fieldName: 'connPdView' }, // 연계상품 조회
    { fieldName: 'canPdGdCd' }, // 취소등급
    { fieldName: 'freExpnYn' }, // 무료체험여부
    { fieldName: 'freExpnCnfmStrtdt' }, // 무료체험시작일
    { fieldName: 'freExpnCnfmYn' }, // 체험확정여부
    { fieldName: 'freExpnCnfmDt' }, // 체험확정일
    { fieldName: 'combiNm' }, // 결합구분
    { fieldName: 'fstRgstDt' }, // 주문 등록일
    { fieldName: 'fstRgstTm' }, // 주문 등록시간
    { fieldName: 'z11Yn' }, // 정보수집 동의
    { fieldName: 'z13Yn' }, // 마케팅 동의
    { fieldName: 'z15Yn' }, // 제３자동의
    { fieldName: 'w22Yn' }, // 제３자동의(피버)
    { fieldName: 'cntrCralTno' }, // 계약자 휴대폰번호
    { fieldName: 'cntrCralLocaraTno' }, // 계약자 휴대지역전화번호
    { fieldName: 'cntrMexnoEncr' }, // 계약자 휴대전화국번호암호화
    { fieldName: 'cntrCralIdvTno' }, // 계약자 휴대개별전화번호
    { fieldName: 'dntcYn' }, // 두낫콜 여부
    { fieldName: 'baseCntrInfo' }, // 이후 기변정보
    { fieldName: 'basePdNm' }, // 이후 기변정보-제품명
    { fieldName: 'baseRentalAmt', dataType: 'number' }, // 이후 기변정보-사용렌탈료
    { fieldName: 'baseSvPrd' }, // 이후 기변정보-관리주기
    { fieldName: 'stplDscAmt', dataType: 'number' }, // 재약정 가입정보-할인금액
    { fieldName: 'stplStrtdt' }, // 재약정 가입정보-시작일
    { fieldName: 'stplCanDt' }, // 재약정 가입정보-취소일
    { fieldName: 'stplRcpDt' }, // 재약정 가입정보-접수일
    { fieldName: 'stplRentalTn' }, // 재약정 가입정보-재약정 가입차월
    { fieldName: 'mshCntrRcpFshDt' }, // 멤버십 정보접수일
    { fieldName: 'mshCntrTempSaveDt' }, // 멤버십 정보가입일
    { fieldName: 'mshReqdDt' }, // 멤버십 정보취소일
    { fieldName: 'mshCntrPdEnddt' }, // 멤버십 정보탈퇴일
    { fieldName: 'ocoCpsBzsDvNm' }, // 타사보상업체
    { fieldName: 'svAmt' }, // 서비스료
    { fieldName: 'rentalTn' }, // 렌탈차월
    { fieldName: 'fgpt1PdNm' }, // 사은품정보-사은품명1
    { fieldName: 'fgpt1PdCd' }, // 사은품정보-사은품코드1
    { fieldName: 'fgpt1Qty' }, // 사은품정보-사은품수량1
    { fieldName: 'fgpt2PdNm' }, // 사은품정보-사은품명2
    { fieldName: 'fgpt2PdCd' }, // 사은품정보-사은품코드2
    { fieldName: 'fgpt2Qty' }, // 사은품정보-사은품수량2
    { fieldName: 'fgpt3PdNm' }, // 사은품정보-사은품명3
    { fieldName: 'fgpt3PdCd' }, // 사은품정보-사은품코드3
    { fieldName: 'fgpt3Qty' }, // 사은품정보-사은품수량3
    { fieldName: 'fgpt4PdNm' }, // 사은품정보-사은품명4
    { fieldName: 'fgpt4PdCd' }, // 사은품정보-사은품코드4
    { fieldName: 'fgpt4Qty' }, // 사은품정보-사은품수량4
    { fieldName: 'fgpt5PdNm' }, // 사은품정보-사은품명5
    { fieldName: 'fgpt5PdCd' }, // 사은품정보-사은품코드5
    { fieldName: 'fgpt5Qty' }, // 사은품정보-사은품수량5
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '180', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true }, // 계약번호
    { fieldName: 'ordrInfoView', header: t('MSG_TXT_ODER_INF_VIEW'), width: '130', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_ODER_INF_VIEW') }, // 주문정보 보기
    { fieldName: 'sellTpDtlNm', header: t('MSG_TXT_SEL_TYPE'), width: '138', styleName: 'text-center' }, // 판매유형
    { fieldName: 'dgr3LevlDgPrtnrNo', header: t('MSG_TXT_BRMGR_EPNO'), width: '138', styleName: 'text-center' }, // 파트너정보-지점장 사번
    { fieldName: 'dgr3LevlDgPrtnrNmEncr', header: t('MSG_TXT_BRMGR_FNM'), width: '138', styleName: 'text-center' }, // 파트너정보-지점장명
    { fieldName: 'dgr3LevlOgCd', header: t('MSG_TXT_BRCH_CD'), width: '138', styleName: 'text-center' }, // 파트너정보-지점코드
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_EPNO'), width: '138', styleName: 'text-center' }, // 파트너정보-파트너사번
    { fieldName: 'prtnrKnmEncr', header: t('MSG_TXT_PTNR_NAME'), width: '138', styleName: 'text-center' }, // 파트너정보-파트너명
    {
      fieldName: 'sellPrtnrCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
    }, // 파트너정보-휴대전화번호
    { fieldName: 'cntrDt', header: t('MSG_TXT_TASK_OPNG_DT'), width: '138', styleName: 'text-center', datetimeFormat: 'date' }, // 파트너정보-업무개시일
    { fieldName: 'cltnDt', header: t('MSG_TXT_BIZ_CLTN_D'), width: '166', styleName: 'text-center', datetimeFormat: 'date' }, // 파트너정보-업무해약일
    { fieldName: 'cstKnmEncr', header: t('MSG_TXT_CNTOR_NM'), width: '138', styleName: 'text-center' }, // 계약자 정보-계약자명
    { fieldName: 'bryy', header: t('MSG_TXT_BRYY'), width: '138', styleName: 'text-center' }, // 계약자 정보-생년(YY)
    { fieldName: 'bzrNo', header: t('MSG_TXT_ENTRP_NO'), width: '138', styleName: 'text-center' }, // 계약자 정보-사업자번호
    { fieldName: 'sexDvNm', header: t('MSG_TXT_GENDER'), width: '138', styleName: 'text-center' }, // 계약자 정보-성별
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '138', styleName: 'text-center' }, // 계약자 정보-고객번호
    { fieldName: 'adrZip', header: t('MSG_TXT_ZIP'), width: '138', styleName: 'text-center' }, // 계약자 정보-우편번호
    { fieldName: 'cntrCstRnadr', header: t('MSG_TXT_STD_ADDR'), width: '388', styleName: 'text-left' }, // 계약자 정보-기준주소
    { fieldName: 'cntrCstRdadrEncr', header: t('MSG_TXT_DETAIL_ADDR'), width: '231', styleName: 'text-left' }, // 계약자 정보-상세주소
    { fieldName: 'rcgvpKnmEncr', header: t('MSG_TXT_IST_NM'), width: '138', styleName: 'text-center' }, // 설치정보-설치자명
    {
      fieldName: 'istCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
    }, // 설치정보-휴대전화번호
    { fieldName: 'istAdrZip', header: t('MSG_TXT_ZIP'), width: '138', styleName: 'text-center' }, // 설치정보-우편번호
    { fieldName: 'istRnadr', header: t('MSG_TXT_STD_ADDR'), width: '599', styleName: 'text-left' }, // 설치정보-기준주소
    { fieldName: 'istRdadrEncr', header: t('MSG_TXT_DETAIL_ADDR'), width: '231', styleName: 'text-left' }, // 설치정보-상세주소
    { fieldName: 'sppOrdNo', header: t('MSG_TXT_WAYBILL_NO'), width: '138', styleName: 'text-center' }, // 설치정보-운송장 번호
    { fieldName: 'pdctIdno', header: t('MSG_TXT_SN_NO'), width: '138', styleName: 'text-center' }, // 설치정보-S N 번호
    { fieldName: 'istAkDt', header: `${t('MSG_TXT_INSTALLATION')} ${t('MSG_TXT_REQ_DATE')}`, width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 설치요청일
    { fieldName: 'sellInflwChnlDtlNm', header: t('MSG_TXT_SLS_CAT'), width: '136', styleName: 'text-center' }, // 판매구분
    { fieldName: 'copnDvNm', header: t('MSG_TXT_CST_DV'), width: '136', styleName: 'text-center' }, // 고객구분
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_CATE'), width: '275', styleName: 'text-left' }, // 상품 정보-상품분류
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '275', styleName: 'text-left' }, // 상품 정보-상품명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '138', styleName: 'text-center' }, // 상품 정보-상품코드
    { fieldName: 'pdTpNm', header: t('MSG_TXT_PRDT_TYPE'), width: '138', styleName: 'text-center' }, // 상품 정보-상품유형
    { fieldName: 'svPrd', header: t('MSG_TXT_CYCL'), width: '138', styleName: 'text-right' }, // 상품 정보-주기
    { fieldName: 'svTpCd', header: t('MSG_TXT_USWY_DV'), width: '138', styleName: 'text-center' }, // 상품 정보-용도구분
    { fieldName: 'svTpNm', header: t('MSG_TXT_USWY_DV_NM'), width: '138', styleName: 'text-center' }, // 상품 정보-용도구분 명
    { fieldName: 'cntrRcpFshDt', header: t('MSG_TXT_RCP_D'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일
    { fieldName: 'sppDuedt', header: t('MSG_TXT_DUEDT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 예정일
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일
    { fieldName: 'slDt', header: t('MSG_TXT_DT_OF_SALE'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 매출일
    { fieldName: 'cntrPtrm', header: t('MSG_TXT_CNTR_PTRM'), width: '136', styleName: 'text-right' }, // 계약기간
    { fieldName: 'cntrPdEnddt', header: t('MSG_TXT_EXP_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 만료일
    { fieldName: 'canDt', header: t('MSG_TXT_CAN_D'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 취소일
    { fieldName: 'reqdDt', header: t('MSG_TXT_REQD_D'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 철거일
    { fieldName: 'exnReqdDt', header: t('MSG_TXT_CLN_D'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 회수일
    { fieldName: 'recapDutyPtrmN', header: t('MSG_TXT_DUTY_PTRM'), width: '136', styleName: 'text-right' }, // 의무기간
    { fieldName: 'cntrAmt', header: t('MSG_TXT_RGST_FEE'), width: '136', styleName: 'text-right' }, // 등록비
    { fieldName: 'cntrCtrAmt', header: t('MSG_TXT_RGST_DSC'), width: '136', styleName: 'text-right' }, // 등록할인
    { fieldName: 'rentalAmt1', header: t('MSG_TXT_RTLFE1'), width: '136', styleName: 'text-right' }, // 렌탈료1
    { fieldName: 'rentalDscAmt1', header: t('MSG_TXT_RNTL_DSC_1'), width: '136', styleName: 'text-right' }, // 렌탈할인1
    { fieldName: 'rentalAmt2', header: t('MSG_TXT_RTLFE2'), width: '136', styleName: 'text-right' }, // 렌탈료2
    { fieldName: 'rentalDscAmt2', header: t('MSG_TXT_RNTL_DSC_2'), width: '136', styleName: 'text-right' }, // 렌탈할인2
    { fieldName: 'rentalDscDfam', header: t('MSG_TXT_DSC_DIFF'), width: '136', styleName: 'text-right' }, // 할인차액
    { fieldName: 'booSellYn', header: t('MSG_TXT_RSV'), width: '136', styleName: 'text-center' }, // 예약
    { fieldName: 'mchnChYn', header: t('MSG_TXT_CHNG'), width: '136', styleName: 'text-center' }, // 기변
    { fieldName: 'mchnCpsApyr', header: t('MSG_TXT_CHNG_PFR_RAT'), width: '136', styleName: 'text-right' }, // 기변실적율
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_ACKMT_PERF_AMT'), width: '136', styleName: 'text-right' }, // 인정실적액
    { fieldName: 'ackmtPerfRt', header: t('MSG_TXT_ACKMT_PERF_RAT'), width: '136', styleName: 'text-right' }, // 인정실적률(%)
    { fieldName: 'feeAckmtBaseAmt', header: t('MSG_TXT_FEE_BASE_AMT'), width: '136', styleName: 'text-right' }, // 수수료기준금액
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_PD_FEE_FIX'), width: '136', styleName: 'text-center' }, // 수수료정액여부
    { fieldName: 'sellDscDvNm', header: t('MSG_TXT_PD_DC_CLASS'), width: '136', styleName: 'text-right' }, // 할인구분명
    { fieldName: 'sellDscTpNm', header: t('MSG_TXT_DISC_CODE'), width: '136', styleName: 'text-right' }, // 할인유형명
    { fieldName: 'dscPmotCd', header: t('MSG_TXT_DSC_SYST'), width: '136', styleName: 'text-center' }, // 할인제도
    { fieldName: 'mchnChTpCd', header: t('MSG_TXT_CHDVC_TP'), width: '136', styleName: 'text-right' }, // 기변유형
    { fieldName: 'ojCntrDtlNo', header: t('MSG_TXT_CHNG_PTY_CD'), width: '136', styleName: 'text-center' }, // 기변상대코드
    { fieldName: 'ojBasePdCd', header: t('MSG_TXT_CHNG_PREV_PRDT'), width: '136', styleName: 'text-center' }, // 기변이전상품
    { fieldName: 'ojPdNm', header: t('MSG_TXT_CHNG_PREV_PRDT_NM'), width: '136', styleName: 'text-center' }, // 기변이전상품명
    { fieldName: 'bogoCd', header: t('MSG_TXT_1PLUS1_LK_CD'), width: '136', styleName: 'text-center' }, // １＋１연계코드
    { fieldName: 'bogoPdCd', header: t('MSG_TXT_1PLUS1_CHNG_PREV_PRDT'), width: '136', styleName: 'text-center' }, // １＋１이전상품
    { fieldName: 'bogoPdNm', header: t('MSG_TXT_1PLUS1_CHNG_PREV_PRDT_NM'), width: '136', styleName: 'text-left' }, // １＋１이전상품명
    { fieldName: 'mpyMthdTpNm', header: t('MSG_TXT_AUTO_FNT'), width: '138', styleName: 'text-center' }, // 계좌정보-자동이체
    { fieldName: 'aftnInf',
      header: t('MSG_TXT_CARD_ACNO'),
      width: '138',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { dpTpCd } = grid.getValues(index.itemIndex);
        const { acnoEncr } = grid.getValues(index.itemIndex);
        const { crcdnoEncr } = grid.getValues(index.itemIndex);
        if (dpTpCd === '0102') {
          return acnoEncr;
        }
        if (dpTpCd === '0203') {
          return crcdnoEncr;
        }
      },
    }, // 계좌정보-카드／계좌번호
    { fieldName: 'aftnOwrKnmEncr', header: t('MSG_TXT_DPO_CDONR'), width: '138', styleName: 'text-center' }, // 계좌정보-예금／카드주명
    { fieldName: 'sellEvCd', header: t('MSG_TXT_EV_CD'), width: '136', styleName: 'text-center' }, // 행사코드
    { fieldName: 'alncmpCd', header: t('MSG_TXT_ALNC_CD'), width: '136', styleName: 'text-center' }, // 제휴코드
    { fieldName: 'alncmpNm', header: t('MSG_TXT_ALNC_CD_NM'), width: '136', styleName: 'text-center' }, // 제휴코드명
    { fieldName: 'alncStatTpNm', header: t('MSG_TXT_ALNC_STAT'), width: '136', styleName: 'text-center' }, // 제휴상태
    { fieldName: 'alncmpCstCd', header: t('MSG_TXT_ALNC_CST_CD'), width: '136', styleName: 'text-center' }, // 제휴고객코드
    { fieldName: 'alncmpPrtnrNo', header: t('MSG_TXT_ALNC_PRTNR'), width: '136', styleName: 'text-center' }, // 제휴파트너
    { fieldName: 'cttRsCd', header: t('MSG_TXT_CTT_CD'), width: '136', styleName: 'text-center' }, // 컨택코드
    { fieldName: 'cttRsNm', header: t('MSG_TXT_CTT_CNTN'), width: '270', styleName: 'text-left' }, // 컨택내용
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG'), width: '136', styleName: 'text-center' }, // 등록프로그램
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_BIZ_ICHR'), width: '136', styleName: 'text-center' }, // 업무담당
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_BIZ_ICHR_NM'), width: '136', styleName: 'text-center' }, // 업무담당명
    { fieldName: 'fstPerfYm', header: t('MSG_TXT_FST_DLQ'), width: '136', styleName: 'text-center' }, // 최초연체
    { fieldName: 'fnlPerfYm', header: t('MSG_TXT_FNL_DLQ'), width: '136', styleName: 'text-center' }, // 최종연체
    { fieldName: 'fstMngtYm', header: t('MSG_TXT_FST_SL_STP'), width: '136', styleName: 'text-center' }, // 최초매출중지
    { fieldName: 'fnlMngtYm', header: t('MSG_TXT_FNL_SL_STP'), width: '136', styleName: 'text-center' }, // 최종매출중지
    { fieldName: 'pmotCd', header: t('MSG_TXT_PMOT_NO'), width: '138', styleName: 'text-center' }, // 프로모션 정보-프로모션 번호
    { fieldName: 'pmotFvrMcn', header: t('MSG_TXT_DSC_MCNT'), width: '138', styleName: 'text-center' }, // 프로모션 정보-할인개월
    { fieldName: 'pmotFvrAmt', header: t('MSG_TXT_DSC_AMT'), width: '138', styleName: 'text-right' }, // 프로모션 정보-할인금액
    { fieldName: 'frisuBfsvcPtrmN', header: t('MSG_TXT_FRE_MCNT'), width: '136', styleName: 'text-center' }, // 프로모션 정보-무료개월
    { fieldName: 'connPdView', header: t('MSG_TXT_CONN_PD_VIEW'), width: '197', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_CONN_PD_VIEW') },
    { fieldName: 'canPdGdCd', header: t('MSG_TXT_CNCL_GD'), width: '136', styleName: 'text-center' }, // 취소등급
    { fieldName: 'freExpnYn', header: t('MSG_TXT_FRE_EXPN_YN'), width: '136', styleName: 'text-center' }, // 무료체험여부
    { fieldName: 'freExpnCnfmStrtdt', header: t('MSG_TXT_EXPN_STRT_DT'), width: '136', styleName: 'text-center' }, // 무료체험시작일
    { fieldName: 'freExpnCnfmYn', header: t('MSG_TXT_EXPN_DTRM_YN'), width: '136', styleName: 'text-center' }, // 체험확정여부
    { fieldName: 'freExpnCnfmDt', header: t('MSG_TXT_EXPN_DTRM_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 체험확정일
    { fieldName: 'combiNm', header: t('MSG_TXT_COMBI_DV'), width: '136', styleName: 'text-center' }, // 결합구분
    { fieldName: 'fstRgstDt', header: t('MSG_TXT_ORD_RGST_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 주문 등록일
    { fieldName: 'fstRgstTm', header: t('MSG_TXT_ORD_RGST_HH'), width: '136', styleName: 'text-center', datetimeFormat: 'hh:mm:ss' }, // 주문 등록시간
    { fieldName: 'z11Yn', header: t('MSG_TXT_INF_CLCT_AG'), width: '136', styleName: 'text-center' }, // 정보수집 동의
    { fieldName: 'z13Yn', header: t('MSG_TXT_MAKT_AG'), width: '136', styleName: 'text-center' }, // 마케팅 동의
    { fieldName: 'z15Yn', header: t('MSG_TXT_THP_AG'), width: '136', styleName: 'text-center' }, // 제３자동의
    { fieldName: 'w22Yn', header: t('MSG_TXT_THP_AG_FEV'), width: '136', styleName: 'text-center' }, // 제３자동의(피버)
    {
      fieldName: 'cntrCralTno',
      header: t('MSG_TXT_CNTRT_CPHON_NO'),
      width: '136',
      styleName: 'text-center',
    }, // 계약자 휴대폰번호
    { fieldName: 'dntcYn', header: t('MSG_TXT_DNC_YN'), width: '136', styleName: 'text-center' }, // 두낫콜 여부
    { fieldName: 'baseCntrInfo', header: t('MSG_TXT_AF_MCHN_CH_INFO'), width: '136', styleName: 'text-center' }, // 이후 기변정보
    { fieldName: 'basePdNm', header: t('MSG_TXT_GOODS_NM'), width: '136', styleName: 'text-left' }, // 이후 기변정보-제품명
    { fieldName: 'baseRentalAmt', header: t('MSG_TXT_USE_RTLFE'), width: '136', styleName: 'text-right' }, // 이후 기변정보-사용렌탈료
    { fieldName: 'baseSvPrd', header: t('MSG_TXT_MNGT_PRD'), width: '136', styleName: 'text-right' }, // 이후 기변정보-관리주기
    { fieldName: 'stplDscAmt', header: t('MSG_TXT_DSC_AMT'), width: '138', styleName: 'text-right' }, // 재약정 가입정보-할인금액
    { fieldName: 'stplStrtdt', header: t('MSG_TXT_STRT_DT'), width: '138', styleName: 'text-center', datetimeFormat: 'date' }, // 재약정 가입정보-시작일
    { fieldName: 'stplCanDt', header: t('MSG_TXT_CAN_D'), width: '138', styleName: 'text-center', datetimeFormat: 'date' }, // 재약정 가입정보-취소일
    { fieldName: 'stplRcpDt', header: t('MSG_TXT_RCP_D'), width: '138', styleName: 'text-center', datetimeFormat: 'date' }, // 재약정 가입정보-접수일
    { fieldName: 'stplRentalTn', header: t('MSG_TXT_RSTL_J_NMN'), width: '138', styleName: 'text-right' }, // 재약정 가입정보-재약정 가입차월
    { fieldName: 'mshCntrRcpFshDt', header: t('MSG_TXT_RCP_D'), width: '138', styleName: 'text-center', datetimeFormat: 'date' }, // 멤버십 정보접수일
    { fieldName: 'mshCntrTempSaveDt', header: t('MSG_TXT_SUBS_DT'), width: '138', styleName: 'text-center', datetimeFormat: 'date' }, // 멤버십 정보가입일
    { fieldName: 'mshReqdDt', header: t('MSG_TXT_CAN_D'), width: '138', styleName: 'text-center', datetimeFormat: 'date' }, // 멤버십 정보취소일
    { fieldName: 'mshCntrPdEnddt', header: t('MSG_TXT_PRDT_NM'), width: '138', styleName: 'text-center', datetimeFormat: 'date' }, // 멤버십 정보탈퇴일
    { fieldName: 'ocoCpsBzsDvNm', header: t('MSG_TXT_OCO_COMP_CMPNY'), width: '136', styleName: 'text-center' }, // 타사보상업체
    { fieldName: 'svAmt', header: t('MSG_TXT_PD_SVC_FEE'), width: '136', styleName: 'text-right' }, // 서비스료
    { fieldName: 'rentalTn', header: t('MSG_TXT_RENTAL_NMN'), width: '136', styleName: 'text-right' }, // 렌탈차월
    { fieldName: 'fgpt1PdNm', header: t('MSG_TXT_FGPT_NM_1'), width: '138', styleName: 'text-center' }, // 사은품정보-사은품명1
    { fieldName: 'fgpt1PdCd', header: t('MSG_TXT_FGPT_CD_1'), width: '138', styleName: 'text-center' }, // 사은품정보-사은품코드1
    { fieldName: 'fgpt1Qty', header: t('MSG_TXT_FGPT_QTY_1'), width: '138', styleName: 'text-right' }, // 사은품정보-사은품수량1
    { fieldName: 'fgpt2PdNm', header: t('MSG_TXT_FGPT_NM_2'), width: '138', styleName: 'text-center' }, // 사은품정보-사은품명2
    { fieldName: 'fgpt2PdCd', header: t('MSG_TXT_FGPT_CD_2'), width: '138', styleName: 'text-center' }, // 사은품정보-사은품코드2
    { fieldName: 'fgpt2Qty', header: t('MSG_TXT_FGPT_QTY_2'), width: '138', styleName: 'text-right' }, // 사은품정보-사은품수량2
    { fieldName: 'fgpt3PdNm', header: t('MSG_TXT_FGPT_NM_3'), width: '138', styleName: 'text-center' }, // 사은품정보-사은품명3
    { fieldName: 'fgpt3PdCd', header: t('MSG_TXT_FGPT_CD_3'), width: '138', styleName: 'text-center' }, // 사은품정보-사은품코드3
    { fieldName: 'fgpt3Qty', header: t('MSG_TXT_FGPT_QTY_3'), width: '138', styleName: 'text-right' }, // 사은품정보-사은품수량3
    { fieldName: 'fgpt4PdNm', header: t('MSG_TXT_FGPT_NM_4'), width: '138', styleName: 'text-center' }, // 사은품정보-사은품명4
    { fieldName: 'fgpt4PdCd', header: t('MSG_TXT_FGPT_CD_4'), width: '138', styleName: 'text-center' }, // 사은품정보-사은품코드4
    { fieldName: 'fgpt4Qty', header: t('MSG_TXT_FGPT_QTY_4'), width: '138', styleName: 'text-right' }, // 사은품정보-사은품수량4
    { fieldName: 'fgpt5PdNm', header: t('MSG_TXT_FGPT_NM_5'), width: '138', styleName: 'text-center' }, // 사은품정보-사은품명5
    { fieldName: 'fgpt5PdCd', header: t('MSG_TXT_FGPT_CD_5'), width: '138', styleName: 'text-center' }, // 사은품정보-사은품코드5
    { fieldName: 'fgpt5Qty', header: t('MSG_TXT_FGPT_QTY_5'), width: '138', styleName: 'text-right' }, // 사은품정보-사은품수량5
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'cntrDtlNo', 'ordrInfoView', 'sellTpDtlNm',
    {
      header: `${t('MSG_TXT_PRTNR')} ${t('MSG_TXT_INF')}`, // 파트너 정보
      direction: 'horizontal', // merge type
      items: ['dgr3LevlDgPrtnrNo', 'dgr3LevlDgPrtnrNmEncr', 'dgr3LevlOgCd', 'sellPrtnrNo', 'prtnrKnmEncr', 'sellPrtnrCralTno', 'cntrDt', 'cltnDt'],
    },
    {
      header: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_INF')}`, // 계약자 정보
      direction: 'horizontal', // merge type
      items: ['cstKnmEncr', 'bryy', 'bzrNo', 'sexDvNm', 'cntrCstNo', 'adrZip', 'cntrCstRnadr', 'cntrCstRdadrEncr'],
    },
    {
      header: `${t('MSG_TXT_INSTALLATION')} ${t('MSG_TXT_INF')}`, // 설치 정보
      direction: 'horizontal', // merge type
      items: ['rcgvpKnmEncr', 'istCralTno', 'istAdrZip', 'istRnadr', 'istRdadrEncr', 'sppOrdNo', 'pdctIdno', 'istAkDt', 'sellInflwChnlDtlNm', 'copnDvNm'],
    },
    {
      header: `${t('MSG_TXT_PRDT')} ${t('MSG_TXT_INF')}`, // 상품 정보
      direction: 'horizontal', // merge type
      items: ['pdClsfNm', 'pdNm', 'basePdCd', 'pdTpNm', 'svPrd', 'svTpCd', 'svTpNm'],
    },
    'cntrRcpFshDt', 'sppDuedt', 'istDt', 'slDt', 'cntrPtrm', 'cntrPdEnddt', 'canDt', 'reqdDt', 'exnReqdDt', 'recapDutyPtrmN', 'cntrAmt', 'cntrCtrAmt', 'rentalAmt1', 'rentalDscAmt1', 'rentalAmt2', 'rentalDscAmt2', 'rentalDscDfam', 'booSellYn', 'mchnChYn', 'mchnCpsApyr', 'ackmtPerfAmt', 'ackmtPerfRt', 'feeAckmtBaseAmt', 'feeFxamYn', 'sellDscDvNm', 'sellDscTpNm', 'dscPmotCd', 'mchnChTpCd', 'ojCntrDtlNo', 'ojBasePdCd', 'ojPdNm', 'bogoCd', 'bogoPdCd', 'bogoPdNm',
    {
      header: `${t('MSG_TXT_AC')}${t('MSG_TXT_INF')}`, // 계좌정보
      direction: 'horizontal', // merge type
      items: ['mpyMthdTpNm', 'aftnInf', 'aftnOwrKnmEncr'],
    },
    'sellEvCd', 'alncmpCd', 'alncmpNm', 'alncStatTpNm', 'alncmpCstCd', 'alncmpPrtnrNo', 'cttRsCd', 'cttRsNm', 'fstRgstPrgId', 'fstRgstUsrId', 'fstRgstUsrNm', 'fstPerfYm', 'fnlPerfYm', 'fstMngtYm', 'fnlMngtYm',
    {
      header: t('MSG_TXT_DSC_MCNT'), // 프로모션 정보
      direction: 'horizontal', // merge type
      items: ['pmotCd', 'pmotFvrMcn', 'pmotFvrAmt', 'frisuBfsvcPtrmN'],
    },
    'connPdView', 'canPdGdCd', 'freExpnYn', 'freExpnCnfmStrtdt', 'freExpnCnfmYn', 'freExpnCnfmDt', 'combiNm', 'fstRgstDt', 'fstRgstTm', 'z11Yn', 'z13Yn', 'z15Yn', 'w22Yn', 'cntrCralTno', 'dntcYn',
    {
      header: t('MSG_TXT_AF_MCHN_CH_INFO'), // 이후 기변정보
      direction: 'horizontal', // merge type
      items: ['baseCntrInfo', 'basePdNm', 'baseRentalAmt', 'baseSvPrd'],
    },
    {
      header: `${t('MSG_TXT_RSTL')} ${t('MSG_TXT_JOIN')} ${t('MSG_TXT_INF')}`, // 재약정 가입 정보
      direction: 'horizontal', // merge type
      items: ['stplDscAmt', 'stplStrtdt', 'stplCanDt', 'stplRcpDt', 'stplRentalTn'],
    },
    {
      header: `${t('MSG_TXT_MMBR')} ${t('MSG_TXT_INF')}`, // 멤버십 정보
      direction: 'horizontal', // merge type
      items: ['mshCntrRcpFshDt', 'mshCntrTempSaveDt', 'mshReqdDt', 'mshCntrPdEnddt'],
    },
    'ocoCpsBzsDvNm', 'svAmt', 'rentalTn',
    {
      header: `${t('MSG_TXT_GIFT')} ${t('MSG_TXT_INF')}`, // 사은품정보
      direction: 'horizontal', // merge type
      items: ['fgpt1PdNm', 'fgpt1PdCd', 'fgpt1Qty', 'fgpt2PdNm', 'fgpt2PdCd', 'fgpt2Qty', 'fgpt3PdNm', 'fgpt3PdCd', 'fgpt3Qty', 'fgpt4PdNm', 'fgpt4PdCd', 'fgpt4Qty', 'fgpt5PdNm', 'fgpt5PdCd', 'fgpt5Qty'],
    },
  ]);

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const paramCntrDtlNo = gridUtil.getCellValue(g, dataRow, 'cntrDtlNo');
    const paramCntrNo = String(paramCntrDtlNo).split('-')[0];
    const paramCntrSn = String(paramCntrDtlNo).split('-')[1];
    const { sellTpCd } = g.getValues(dataRow);
    const { cntrCstNo } = g.getValues(dataRow);
    const { copnDvCd } = g.getValues(dataRow);

    if (['cntrDtlNo'].includes(column)) { // 계약상세(윈도우팝업)
      await modal({
        component: 'WwctaOrderDetailP',
        componentProps: { cntrNo: paramCntrNo, cntrSn: paramCntrSn, sellTpCd, cntrCstNo, copnDvCd },
        draggable: true,
        window: true,
        windowFeatures: { width: 1300, height: 1080 },
      });
    } else if (['ordrInfoView'].includes(column)) { // 렌탈 주문정보 상세
      await modal({ component: 'WwctaOrderRentalDtlP', componentProps: { cntrNo: paramCntrNo, cntrSn: paramCntrSn } });
    } else if (['connPdView'].includes(column)) { // 연계상품 리스트 조회
      await modal({
        component: 'WwctaLinkProductListP',
        componentProps: { cntrNo: paramCntrNo, cntrSn: paramCntrSn },
      });
    }
  };
});
</script>
<style scoped>
</style>
