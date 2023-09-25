<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaOrderRentalContractNoListM - 주문상세조회/관리(정기배송-주문번호 조회)
3. 작성자 : jihoon.kim
4. 작성일 : 2023.03.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0074] - 계약번호기준으로 정기배송 주문상세내역을 조회한다.
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
          class="w300"
          icon="search"
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
        :visible="false"
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
      ref="grdRglrDlvrContractNoList"
      name="grdRglrDlvrContractNoList"
      :visible-rows="pageInfo.pageSize"
      @init="initGridRglrDlvrContractNoList"
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
const { currentRoute } = useRouter();

let cachedParams;
const searchParams = ref({
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
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
const grdRglrDlvrContractNoList = ref(getComponentType('KwGrid'));
const isCsvDownloadVisible = ref(false); // CSV Download Button

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  res = await dataService.post('/sms/wells/contract/contracts/order-detail-mngt/regular-shippings/paging', { ...cachedParams, ...pageInfo.value });

  const { list: pages, pageInfo: pagingResult } = res.data;
  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }

  pageInfo.value = pagingResult;
  console.log(res.data);

  const view = grdRglrDlvrContractNoList.value.getView();
  view.getDataSource().setRows(pages);
  // pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회버튼 클릭 이벤트
async function onClickSearch() {
  await fetchData();
}

// CSV다운로드버튼 클릭 이벤트
async function onClickCsvDownload() {
  const view = grdRglrDlvrContractNoList.value.getView();
  const res = await dataService.post('/sms/wells/contract/contracts/order-detail-mngt/regular-shippings/excel-download', searchParams.value);
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
    exportType: 'csv',
  });
}

// 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload() {
  const view = grdRglrDlvrContractNoList.value.getView();
  const res = await dataService.post('/sms/wells/contract/contracts/order-detail-mngt/regular-shippings/excel-download', searchParams.value);
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
const initGridRglrDlvrContractNoList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약번호
    { fieldName: 'ordrInfoView' }, // 주문정보 보기
    { fieldName: 'sellTpCd' }, // 판매유형코드
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
    { fieldName: 'cstKnm' }, // 계약자 정보-계약자명
    { fieldName: 'cstKnmEncr' }, // 계약자 정보-계약자명(암호화)
    { fieldName: 'cstNo' }, // 계약자 정보-사업자번호
    { fieldName: 'adrZip' }, // 계약자 정보-우편번호
    { fieldName: 'cntrCstRnadr' }, // 계약자 정보-기준주소
    { fieldName: 'cntrCstRdadr' }, // 계약자 정보-상세주소
    { fieldName: 'cntrCstRdadrEncr' }, // 계약자 정보-상세주소(암호화)
    { fieldName: 'rcgvpKnm' }, // 설치정보-설치자명
    { fieldName: 'rcgvpKnmEncr' }, // 설치정보-설치자명(암호화)
    { fieldName: 'shpadrCralTno' }, // 설치정보-휴대전화번호
    { fieldName: 'shpadrCralLocaraTno' }, // 설치정보-휴대지역전화번호
    { fieldName: 'shpadrMexnoEncr' }, // 설치정보-휴대전화국번호암호화
    { fieldName: 'shpadrCralIdvTno' }, // 설치정보-휴대개별전화번호
    { fieldName: 'shpadrAdrZip' }, // 설치정보-우편번호
    { fieldName: 'shpadrRnadr' }, // 설치정보-기준주소
    { fieldName: 'shpadrRdadr' }, // 설치정보-상세주소
    { fieldName: 'shpadrRdadrEncr' }, // 설치정보-상세주소(암호화)
    { fieldName: 'sellInflwChnlDtlNm' }, // 판매구분
    { fieldName: 'empDvVal' }, // 직원구분
    { fieldName: 'copnDvCd' }, // 고객구분코드(1:개인, 2:법인)
    { fieldName: 'copnDvNm' }, // 고객구분명
    { fieldName: 'mchnSellTpNm' }, // 기기정보-판매유형(원주문)
    { fieldName: 'mchnCntrNo' }, // 기기계약번호
    { fieldName: 'mchnRcgvpKnm' }, // 기기주문자명
    { fieldName: 'mchnRcgvpKnmEncr' }, // 기기주문자명(암호화)
    { fieldName: 'mchnPdCd' }, // 기기상품
    { fieldName: 'mchnPdNm' }, // 기기상품명
    { fieldName: 'mchnSvTpNm' }, // 기기용도
    { fieldName: 'mchnSvPrd' }, // 기기주기
    { fieldName: 'mchnPdMclsfNm' }, // 기기종류
    { fieldName: 'mchnPdLclsfNm' }, // 기기구분
    { fieldName: 'pdTpCm' }, // 상품선택유형
    { fieldName: 'stplPtrm' }, // 의무기간
    { fieldName: 'cntrPtrm' }, // 계약기간
    { fieldName: 'fnlAmt', dataType: 'number' }, // 판매가격
    { fieldName: 'sellAmt', dataType: 'number' }, // 공급가
    { fieldName: 'vat', dataType: 'number' }, // 부가세
    { fieldName: 'cntrAmt', dataType: 'number' }, // 계약총액
    { fieldName: 'mmBilAmt', dataType: 'number' }, // 월청구액
    { fieldName: 'pdBaseAmt', dataType: 'number' }, // 상품정상가격
    { fieldName: 'ackmtPerfRt' }, // 인정실적률(%)
    { fieldName: 'ackmtPerfAmt', dataType: 'number' }, // 인정실적액
    { fieldName: 'dscMcn' }, // 할인개월
    { fieldName: 'ctrAmt', dataType: 'number' }, // 할인금액
    { fieldName: 'svTpNm' }, // 용도구분명
    { fieldName: 'spcYn' }, // 스페셜구분
    { fieldName: 'svPrd' }, // 배송주기
    { fieldName: 'sppFshDt' }, // 배송일(배송완료일시)
    { fieldName: 'sppMthdTpNm' }, // 배송구분
    { fieldName: 'lctjobNm' }, // 배송부서
    { fieldName: 'rglrSppBilDvNm' }, // 청구구분
    { fieldName: 'mpyMthdTpNm' }, // 계좌정보-자동이체
    { fieldName: 'txinvPblOjYn' }, // 세금계산서 발행
    { fieldName: 'frisuBfsvcPtrmN' }, // 프로모션 정보-무료개월
    { fieldName: 'lcmcnt' }, // 무료회수
    { fieldName: 'lcck05Nm' }, // 가격유형
    { fieldName: 'rcpPkgYn' }, // 패키지여부
    { fieldName: 'rcpPkgCd' }, // 패키지코드
    { fieldName: 'rcpPkgNm' }, // 패키지명
    { fieldName: 'pkgYn' }, // 패키지여부
    { fieldName: 'pkgPrcApy' }, // 패키지가격적용
    { fieldName: 'pkgclsfNm' }, // 패키지군
    { fieldName: 'pkgCd' }, // 패키지코드
    { fieldName: 'pkgNm' }, // 패키지명
    { fieldName: 'lcscnt' }, // 배송기준횟수
    { fieldName: 'freCnfmYn' }, // 확정유무
    { fieldName: 'ordCnfmYn' }, // 주문확정유무
    { fieldName: 'dCnfmYn' }, // 일매출 확정
    { fieldName: 'frisuYn' }, // 체험유무
    { fieldName: 'lcecdd' }, // 체험센터배송
    { fieldName: 'cntrRcpFshDt' }, // 접수일
    { fieldName: 'sppDuedt' }, // 예정일
    { fieldName: 'fshSppFshDt' }, // 최초배송일
    { fieldName: 'istDt' }, // 매출일
    { fieldName: 'cntrPdEnddt' }, // 만료일
    { fieldName: 'cltnRqdt' }, // 해약요청일
    { fieldName: 'reqdDt' }, // 해약일
    { fieldName: 'sppFshM' }, // 배송기준년월
    { fieldName: 'cntrCnfmDtm' }, // 주문확정일시
    { fieldName: 'slDtm' }, // 일매줄확정일시
    { fieldName: 'freSppFshD' }, // 체험배송일
    { fieldName: 'lkCntrDtlNo' }, // 연계정보-계약번호
    { fieldName: 'lkCstKnm' }, // 연계정보-계약자명
    { fieldName: 'lkCstKnmEncr' }, // 연계정보-계약자명
    { fieldName: 'lkPdCd' }, // 연계정보-상품코드
    { fieldName: 'lkPdNm' }, // 연계정보-상품명
    { fieldName: 'lkIstDt' }, // 연계정보-설치일
    { fieldName: 'lkIstNmnN' }, // 연계정보-설치차월
    { fieldName: 'lkReqdDt' }, //  연계정보-철거일자
    { fieldName: 'connPdView' }, // 연계상품 조회
    { fieldName: 'pmotNm' }, // 프로모션명
    { fieldName: 'pmotTpCd' }, // 프로모션유형
    { fieldName: 'pmotCd' }, // 프로모션 코드
    { fieldName: 'pmotSn' }, // 프로모션 순번
    { fieldName: 'fstRgstDt' }, // 등록일
    { fieldName: 'fstRgstTm' }, // 등록시간
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '180', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true }, // 계약상세번호
    { fieldName: 'ordrInfoView', header: t('MSG_TXT_ODER_INF_VIEW'), width: '130', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_ODER_INF_VIEW') }, // 주문정보 보기
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
    { fieldName: 'cstKnmEncr', header: t('MSG_TXT_CNTOR_NM'), width: '138', styleName: 'text-center' }, // 계약자 정보-계약자명
    { fieldName: 'cstNo', header: t('MSG_TXT_ENTRP_NO'), width: '138', styleName: 'text-center' }, // 계약자 정보-사업자번호
    { fieldName: 'adrZip', header: t('MSG_TXT_ZIP'), width: '138', styleName: 'text-center' }, // 계약자 정보-우편번호
    { fieldName: 'cntrCstRnadr', header: t('MSG_TXT_STD_ADDR'), width: '388', styleName: 'text-left' }, // 계약자 정보-기준주소
    { fieldName: 'cntrCstRdadrEncr', header: t('MSG_TXT_DETAIL_ADDR'), width: '231', styleName: 'text-left' }, // 계약자 정보-상세주소
    { fieldName: 'rcgvpKnmEncr', header: t('MSG_TXT_IST_NM'), width: '138', styleName: 'text-center' }, // 설치정보-설치자명
    {
      fieldName: 'shpadrCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
    }, // 설치정보-휴대전화번호
    { fieldName: 'shpadrAdrZip', header: t('MSG_TXT_ZIP'), width: '138', styleName: 'text-center' }, // 설치정보-우편번호
    { fieldName: 'shpadrRnadr', header: t('MSG_TXT_STD_ADDR'), width: '599', styleName: 'text-left' }, // 설치정보-기준주소
    { fieldName: 'shpadrRdadrEncr', header: t('MSG_TXT_DETAIL_ADDR'), width: '231', styleName: 'text-left' }, // 설치정보-상세주소
    { fieldName: 'sellInflwChnlDtlNm', header: t('MSG_TXT_SLS_CAT'), width: '136', styleName: 'text-center' }, // 판매구분
    { fieldName: 'empDvVal', header: t('MSG_TXT_EMPL_DV'), width: '138', styleName: 'text-center' }, // 직원구분
    { fieldName: 'copnDvNm', header: t('MSG_TXT_CST_DV'), width: '136', styleName: 'text-center' }, // 계약자구분
    { fieldName: 'mchnSellTpNm', header: t('MSG_TXT_MCHN_INF'), width: '138', styleName: 'text-center' }, // 기기정보-판매유형(원주문)
    { fieldName: 'mchnCntrNo', header: t('MSG_TXT_MCHN_CNTR_NO'), width: '138', styleName: 'text-center' }, // 기기계약번호
    { fieldName: 'mchnRcgvpKnmEncr', header: t('MSG_TXT_MCHN_ORDR_NM'), width: '134', styleName: 'text-center' }, // 기기주문자명
    { fieldName: 'mchnPdCd', header: t('MSG_TXT_MCHN_PRDT'), width: '134', styleName: 'text-center' }, // 기기상품
    { fieldName: 'mchnPdNm', header: t('MSG_TXT_MCHN_PRDT_NM'), width: '134', styleName: 'text-left' }, // 기기상품명
    { fieldName: 'mchnSvTpNm', header: t('MSG_TXT_MCHN_USWY'), width: '134', styleName: 'text-center' }, // 기기용도
    { fieldName: 'mchnSvPrd', header: t('MSG_TXT_MCHN_PRD'), width: '134', styleName: 'text-center' }, // 기기주기
    { fieldName: 'mchnPdMclsfNm', header: t('MSG_TXT_MCHN_KND'), width: '134', styleName: 'text-center' }, // 기기종류
    { fieldName: 'mchnPdLclsfNm', header: t('MSG_TXT_MCHN_DV'), width: '134', styleName: 'text-center' }, // 기기구분
    { fieldName: 'pdTpCm', header: t('MSG_TXT_PRDT_SELT_TP'), width: '138', styleName: 'text-center' }, // 상품선택유형
    { fieldName: 'stplPtrm', header: t('MSG_TXT_DUTY_PTRM'), width: '136', styleName: 'text-right' }, // 의무기간
    { fieldName: 'cntrPtrm', header: t('MSG_TXT_CNTR_PTRM'), width: '136', styleName: 'text-right' }, // 계약기간
    { fieldName: 'fnlAmt', header: t('MSG_TXT_SLE_PRC'), width: '134', styleName: 'text-right' }, // 판매가격
    { fieldName: 'sellAmt', header: t('MSG_TXT_SUPPLY_AMOUNT'), width: '134', styleName: 'text-right' }, // 공급가액
    { fieldName: 'vat', header: t('MSG_TXT_VAT'), width: '134', styleName: 'text-right' }, // 부가세
    { fieldName: 'cntrAmt', header: t('MSG_TXT_CNTRCT_AMT'), width: '134', styleName: 'text-right' }, // 계약총액
    { fieldName: 'mmBilAmt', header: t('MSG_TXT_MM_BIL_AMT'), width: '134', styleName: 'text-right' }, // 월청구액
    { fieldName: 'pdBaseAmt', header: t('MSG_TXT_PD_NOM_PRC'), width: '134', styleName: 'text-right' }, // 상품정상가격
    { fieldName: 'ackmtPerfRt', header: t('MSG_TXT_ACKMT_PERF_RAT'), width: '136', styleName: 'text-right' }, // 인정실적률(%)
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_ACKMT_PERF_AMT'), width: '136', styleName: 'text-right' }, // 인정실적액
    { fieldName: 'dscMcn', header: t('MSG_TXT_DSC_MCNT'), width: '138', styleName: 'text-center' }, // 할인개월
    { fieldName: 'ctrAmt', header: t('MSG_TXT_DSC_AMT'), width: '138', styleName: 'text-right' }, // 할인금액
    { fieldName: 'svTpNm', header: t('MSG_TXT_USWY_DV_NM'), width: '138', styleName: 'text-center' }, // 용도구분 명
    { fieldName: 'spcYn', header: t('MSG_TXT_SPEC_DV'), width: '134', styleName: 'text-center' }, // 스페셜구분
    { fieldName: 'svPrd', header: t('MSG_TXT_SPP_PRD'), width: '134', styleName: 'text-center' }, // 배송주기
    { fieldName: 'sppFshDt', header: t('MSG_TXT_SPP_D'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 배송일(배송완료일시)
    { fieldName: 'sppMthdTpNm', header: t('TXT_MSG_SPP_DV_CD'), width: '134', styleName: 'text-center' }, // 배송구분
    { fieldName: 'lctjobNm', header: t('MSG_TXT_SPP_DEPT'), width: '134', styleName: 'text-center' }, // 배송부서
    { fieldName: 'rglrSppBilDvNm', header: t('MSG_TXT_BIL_DV'), width: '134', styleName: 'text-center' }, // 청구구분
    { fieldName: 'mpyMthdTpNm', header: t('MSG_TXT_AUTO_FNT'), width: '138', styleName: 'text-center' }, // 계좌정보-자동이체
    { fieldName: 'txinvPblOjYn', header: t('MSG_TXT_TXINV_PBL'), width: '134', styleName: 'text-center' }, // 세금계산서 발행
    { fieldName: 'frisuBfsvcPtrmN', header: t('MSG_TXT_FRE_MCNT'), width: '136', styleName: 'text-center' }, // 프로모션 정보-무료개월
    { fieldName: 'lcmcnt', header: t('MSG_TXT_FRE_CLN'), width: '134', styleName: 'text-center' }, // 무료회수
    { fieldName: 'lcck05Nm', header: t('MSG_TXT_PRC_TP'), width: '134', styleName: 'text-center' }, // 가격유형
    { fieldName: 'rcpPkgYn', header: t('MSG_TXT_PKG_YN'), width: '134', styleName: 'text-center' }, // 패키지여부
    { fieldName: 'rcpPkgCd', header: t('MSG_TXT_PKG_CD'), width: '134', styleName: 'text-center' }, // 패키지코드
    { fieldName: 'rcpPkgNm', header: t('MSG_TXT_PKG_NM'), width: '274', styleName: 'text-left' }, // 패키지명
    { fieldName: 'pkgYn', header: t('MSG_TXT_PKG_YN'), width: '134', styleName: 'text-center' }, // 패키지여부
    { fieldName: 'pkgPrcApy', header: `${t('MSG_TXT_PKG_PRC')} ${t('MSG_TXT_APPLY')}`, width: '134', styleName: 'text-center' }, // 패키지가격 적용
    { fieldName: 'pkgclsfNm', header: t('MSG_TXT_PKG_GRP'), width: '134', styleName: 'text-center' }, // 패키지군
    { fieldName: 'pkgCd', header: t('MSG_TXT_PKG_CD'), width: '134', styleName: 'text-center' }, // 패키지코드
    { fieldName: 'pkgNm', header: t('MSG_TXT_PKG_NM'), width: '274', styleName: 'text-left' }, // 패키지명
    { fieldName: 'lcscnt', header: t('MSG_TXT_SPP_STD_TMS'), width: '134', styleName: 'text-right' }, // 배송기준횟수
    { fieldName: 'freCnfmYn', header: t('MSG_TXT_CNFM_EYN'), width: '134', styleName: 'text-center' }, // 확정유무
    { fieldName: 'ordCnfmYn', header: `${t('MSG_TXT_ODER')}${t('MSG_TXT_CNFM_EYN')}`, width: '134', styleName: 'text-center' }, // 주문확정유무
    { fieldName: 'dCnfmYn', header: `${t('MSG_TXT_DY_SL')}${t('MSG_TXT_DTRM')}`, width: '134', styleName: 'text-center' }, // 일매출 확정
    { fieldName: 'frisuYn', header: t('MSG_TXT_EXPN_EYN'), width: '134', styleName: 'text-center' }, // 체험유무
    { fieldName: 'lcecdd', header: t('MSG_TXT_EXPN_CNR_DLVR'), width: '134', styleName: 'text-center' }, // 체험센터배송
    { fieldName: 'cntrRcpFshDt', header: t('MSG_TXT_RCP_D'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일
    { fieldName: 'sppDuedt', header: t('MSG_TXT_DUEDT'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 예정일
    { fieldName: 'fshSppFshDt', header: t('MSG_TXT_FST_SPP_D'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 최초배송일
    { fieldName: 'istDt', header: t('MSG_TXT_DT_OF_SALE'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 매출일
    { fieldName: 'cntrPdEnddt', header: t('MSG_TXT_EXP_DT'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 만료일
    { fieldName: 'cltnRqdt', header: t('MSG_TXT_CLTN_AK_D'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 해약요청일
    { fieldName: 'reqdDt', header: t('MSG_TXT_CLTN_D'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 해약일
    { fieldName: 'sppFshM', header: t('MSG_TXT_SPP_BASE_YM'), width: '134', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 배송기준년월
    { fieldName: 'cntrCnfmDtm', header: `${t('MSG_TXT_ODER')}${t('MSG_TXT_CNFM_DTM')}`, width: '160', styleName: 'text-center', datetimeFormat: 'datetime' }, // 주문확정일시
    { fieldName: 'slDtm', header: `${t('MSG_TXT_DY_SL')}${t('MSG_TXT_CNFM_DTM')}`, width: '134', styleName: 'text-center', datetimeFormat: 'datetime' }, // 일매줄확정일시
    { fieldName: 'freSppFshD', header: t('MSG_TXT_EXPN_SPP_D'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 체험배송일
    { fieldName: 'lkCntrDtlNo', header: t('MSG_TXT_CNTR_NO'), width: '134', styleName: 'text-center' }, // 연계정보-계약번호
    { fieldName: 'lkCstKnmEncr', header: t('MSG_TXT_CNTOR_NM'), width: '134', styleName: 'text-center' }, // 연계정보-계약자명
    { fieldName: 'lkPdCd', header: t('MSG_TXT_PRDT_CODE'), width: '134', styleName: 'text-center' }, // 연계정보-상품코드
    { fieldName: 'lkPdNm', header: t('MSG_TXT_PRDT_NM'), width: '274', styleName: 'text-center' }, // 연계정보-상품명
    { fieldName: 'lkIstDt', header: t('MSG_TXT_INST_DT'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 연계정보-설치일
    { fieldName: 'lkIstNmnN', header: t('MSG_TXT_INST_OVER'), width: '134', styleName: 'text-center' }, // 연계정보-설치차월
    { fieldName: 'lkReqdDt', header: t('MSG_TXT_DEM_DT'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 연계정보-철거일자
    { fieldName: 'connPdView', header: t('MSG_TXT_CONN_PD_VIEW'), width: '197', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_CONN_PD_VIEW') },
    { fieldName: 'pmotNm', header: t('MSG_TXT_PMOT_NM'), width: '395', styleName: 'text-left' }, // 프로모션명
    { fieldName: 'pmotTpCd', header: t('MSG_TXT_PMOT_TP'), width: '274', styleName: 'text-center' }, // 프로모션유형
    { fieldName: 'pmotCd', header: t('MSG_TXT_PMOT_CD'), width: '134', styleName: 'text-center' }, // 프로모션 코드
    { fieldName: 'pmotSn', header: t('MSG_TXT_PMOT_SEQN'), width: '134', styleName: 'text-center' }, // 프로모션 순번
    { fieldName: 'fstRgstDt', header: t('MSG_TXT_RGST_DT'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 등록일
    { fieldName: 'fstRgstTm', header: t('MSG_TXT_RGST_HH'), width: '134', styleName: 'text-center', datetimeFormat: 'hh:mm:ss' }, // 등록시간
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'cntrDtlNo', 'ordrInfoView',
    {
      header: `${t('MSG_TXT_PRTNR')} ${t('MSG_TXT_INF')}`, // 파트너 정보
      direction: 'horizontal', // merge type
      items: ['dgr3LevlDgPrtnrNo', 'dgr3LevlDgPrtnrNmEncr', 'dgr3LevlOgCd', 'sellPrtnrNo', 'prtnrKnmEncr', 'sellPrtnrCralTno'],
    },
    {
      header: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_INF')}`, // 계약자 정보
      direction: 'horizontal', // merge type
      items: ['cstKnmEncr', 'cstNo', 'adrZip', 'cntrCstRnadr', 'cntrCstRdadrEncr'],
    },
    {
      header: t('MSG_TXT_INSTR_INFO'), // 설치자 정보
      direction: 'horizontal', // merge type
      items: ['rcgvpKnmEncr', 'shpadrCralTno', 'shpadrAdrZip', 'shpadrRnadr', 'shpadrRdadrEncr'],
    },
    {
      header: t('MSG_TXT_SLS_CAT'), // 판매구분
      direction: 'horizontal', // merge type
      items: ['sellInflwChnlDtlNm', 'empDvVal'],
    },
    'copnDvNm',
    {
      header: t('MSG_TXT_MCHN_INF'), // 기기정보
      direction: 'horizontal', // merge type
      items: ['mchnSellTpNm', 'mchnCntrNo', 'mchnRcgvpKnmEncr', 'mchnPdCd', 'mchnPdNm', 'mchnSvTpNm', 'mchnSvPrd', 'mchnPdMclsfNm', 'mchnPdLclsfNm'],
    },
    {
      header: t('MSG_TXT_PD_INF'), // 상품정보
      direction: 'horizontal', // merge type
      items: ['pdTpCm', 'stplPtrm', 'cntrPtrm', 'fnlAmt', 'sellAmt', 'vat', 'cntrAmt', 'mmBilAmt', 'pdBaseAmt', 'ackmtPerfRt', 'ackmtPerfAmt', 'dscMcn', 'ctrAmt', 'svTpNm', 'spcYn', 'svPrd', 'sppFshDt', 'sppMthdTpNm', 'lctjobNm', 'rglrSppBilDvNm', 'mpyMthdTpNm', 'txinvPblOjYn', 'frisuBfsvcPtrmN', 'lcmcnt', 'lcck05Nm'],
    },
    {
      header: t('MSG_TXT_RCPT_BASE'), // 접수기준
      direction: 'horizontal', // merge type
      items: ['rcpPkgYn', 'rcpPkgCd', 'rcpPkgNm'],
    },
    {
      header: t('MSG_TXT_CRNT_BASE'), // 현재기준
      direction: 'horizontal', // merge type
      items: ['pkgYn', 'pkgPrcApy', 'pkgclsfNm', 'pkgCd', 'pkgNm'],
    },
    'lcscnt',
    'freCnfmYn',
    'ordCnfmYn',
    'dCnfmYn',
    'frisuYn',
    'lcecdd',
    {
      header: t('MSG_TXT_PROCS_DT'), // 처리일
      direction: 'horizontal', // merge type
      items: ['cntrRcpFshDt', 'sppDuedt', 'fshSppFshDt', 'istDt', 'cntrPdEnddt', 'cltnRqdt', 'reqdDt', 'sppFshM', 'cntrCnfmDtm', 'slDtm', 'freSppFshD'],
    },
    {
      header: `${t('MSG_TXT_CONN')}${t('MSG_TXT_INF')}`, // 연계정보
      direction: 'horizontal', // merge type
      items: ['lkCntrDtlNo', 'lkCstKnmEncr', 'lkPdCd', 'lkPdNm', 'lkIstDt', 'lkIstNmnN', 'lkReqdDt', 'connPdView'],
    },
    {
      header: t('MSG_TXT_DSC_MCNT'), // 프로모션정보
      direction: 'horizontal', // merge type
      items: ['pmotNm', 'pmotTpCd', 'pmotCd', 'pmotSn'],
    },
    'fstRgstDt',
    'fstRgstTm',
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
    } else if (['ordrInfoView'].includes(column)) { // 정기배송 주문정보 상세
      await modal({ component: 'WwctaOrderRegularShippingDtlP', componentProps: { cntrNo: paramCntrNo, cntrSn: paramCntrSn } });
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
