<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaMembershipContractNoListM - 주문상세조회/관리(멤버십-주문번호 조회)
3. 작성자 : jihoon.kim
4. 작성일 : 2023.03.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 계약번호기준으로 멤버십 주문상세내역을 조회한다.
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
      <!-- 확정관리 -->
      <kw-btn
        v-permission:update
        dense
        secondary
        :label="$t('MSG_TXT_CNFM_MNGT')"
        :disable="!pageInfo.totalCount"
        @click="onClickConfirmManagement"
      />
      <!-- 홈케어관리 -->
      <kw-btn
        v-permission:update
        dense
        secondary
        :label="$t('MSG_TXT_HCR_MNGT')"
        :disable="!pageInfo.totalCount"
        @click="onClickHomeCareManagement"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <!-- 엑셀다운로드 -->
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
      ref="grdMembershipContractNoList"
      name="grdMembershipContractNoList"
      :visible-rows="pageInfo.pageSize"
      @init="initGridMembershipContractNoList"
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
import { codeUtil, defineGrid, getComponentType, useDataService, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const dataService = useDataService();
const { t } = useI18n();
const { alert, modal, notify } = useGlobal();
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
const grdMembershipContractNoList = ref(getComponentType('KwGrid'));

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  res = await dataService.get('/sms/wells/contract/contracts/order-detail-mngt/membership/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: pages, pageInfo: pagingResult } = res.data;
  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }

  pageInfo.value = pagingResult;
  console.log(res.data);

  const view = grdMembershipContractNoList.value.getView();
  view.getDataSource().setRows(pages);
  // pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMembershipContractNoList.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/order-detail-mngt/membership/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 확정관리 팝업조회
async function onClickConfirmManagement() {
  const view = grdMembershipContractNoList.value.getView();
  const row = view.getCheckedItems();
  if (row.length === 0) {
    notify(t('MSG_ALT_BEFORE_SELECT_IT', [t('MSG_TXT_ITEM')]));
    return;
  }

  const cntrs = gridUtil.getCheckedRowValues(view);
  const res = await modal({
    component: 'WwctaMembershipConfirmMgtP',
    componentProps: { cntrs },
  });

  // 리턴값을 체크한 후 재조회
  if (res.result) fetchData();
}

// 홈케어관리 팝업조회
async function onClickHomeCareManagement() {
  let isHcrMgntPopupOpen = true; // 홈케어관리 팝업 오픈 여부
  const view = grdMembershipContractNoList.value.getView();
  const row = view.getCheckedItems();
  if (row.length === 0) {
    notify(t('MSG_ALT_BEFORE_SELECT_IT', [t('MSG_TXT_ITEM')]));
    return;
  }

  const cntrs = gridUtil.getCheckedRowValues(view);
  cntrs.forEach(async (item) => {
    // console.log(item.sellTpDtlCd);
    if (item.sellTpDtlCd !== '33') { // 판매유형상세코드(홈케어 멤버십)
      isHcrMgntPopupOpen = false;
      // 계약상세번호 : {0} 는 멤버십 구분이 홈케어가 아닙니다.
      // 멤버십 구분이 홈케어만 변경 가능합니다.
      await alert(t('MSG_ALT_MSH_DV_ONLY_HCR_CHG_IMP', [item.cntrDtlNo]));
    }
  });

  // console.log(`isHcrMgntPopupOpen : ${isHcrMgntPopupOpen}`);
  if (isHcrMgntPopupOpen) {
    const res = await modal({
      component: 'WwctaHomeCareMgtP',
      componentProps: { cntrs },
    });

    // 리턴값을 체크한 후 재조회
    if (res.result) fetchData();
  }
}

onMounted(async () => {
  // await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMembershipContractNoList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'ordrInfoView' }, // 주문정보 보기
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'sellTpCd' }, // 판매유형코드
    { fieldName: 'copnDvCd' }, // 고객구분코드(1:개인, 2:법인)
    { fieldName: 'cstKnm' }, // 계약자명
    { fieldName: 'cstKnmEncr' }, // 계약자명(암호화)
    { fieldName: 'rcgvpKnm' }, // 설치자명
    { fieldName: 'rcgvpKnmEncr' }, // 설치자명(암호화)
    { fieldName: 'sellTpDtlCd' }, // 계약구분(판매유형상세코드)
    { fieldName: 'sellTpDtlNm' }, // 계약구분명
    { fieldName: 'mshDvNm' }, // 멤버십구분
    { fieldName: 'pdClsfNm' }, // 상품분류
    { fieldName: 'pdCd' }, // 상품코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'pdQty' }, // 상품수량
    { fieldName: 'svTpNm' }, // 용도구분
    { fieldName: 'stplPtrm' }, // 약정개월
    { fieldName: 'svPrd' }, // 관리주기
    { fieldName: 'frisuBfsvcPtrmN' }, // 멤버십/무상멤버십
    { fieldName: 'spayFrisuBfsvcPtrmN' }, // 일시불/무상멤버십
    { fieldName: 'pdLclsfNm' }, // 상품구분1
    { fieldName: 'pdDclsfNm' }, // 상품구분2
    { fieldName: 'cntrDtlStatNm' }, // 멤버십상태
    { fieldName: 'sellDscDvNm' }, // 할인적용유형명
    { fieldName: 'sellDscTpNm' }, // 할인적용상세명
    { fieldName: 'feeAckmtCt' }, // 인정건수
    { fieldName: 'ackmtPerfAmt' }, // 인정금액
    { fieldName: 'cntrCtrAmt' }, // 할인금액
    { fieldName: 'stlmTpNm' }, // 납입구분
    { fieldName: 'prmPtrmMcn' }, // 선납구분(선납기간개월수)
    { fieldName: 'adjDvNm' }, // 정상구분
    { fieldName: 'sellEvNm' }, // 약정구분
    { fieldName: 'frisuMshCrtYn' }, // 무상M자동생성
    { fieldName: 'cntrRcpFshDt' }, // 접수일
    { fieldName: 'cntrCnfmYn' }, // 확정여부
    { fieldName: 'cntrCnfmDt' }, // 확정일
    { fieldName: 'cntrPdStrtdt' }, // 가입일
    { fieldName: 'hcrDuedt' }, // 홈케어예정일
    { fieldName: 'istDt' }, // 설치일
    { fieldName: 'dutyExnDtFrisu' }, // 의무만료일(무상)
    { fieldName: 'dutyExnDtRecap' }, // 의무만료일자(유상)
    { fieldName: 'cntrPdEnddt' }, // 탈퇴일
    { fieldName: 'canDt' }, // 취소일
    { fieldName: 'vstDuedt' }, // 방문일
    { fieldName: 'cttFshDt' }, // 컨택일
    { fieldName: 'cntrCanRsonCd' }, // 탈퇴유형코드
    { fieldName: 'cntrCanRsonNm' }, // 탈퇴유형명
    { fieldName: 'hcrOstrDvNm' }, // 홈케어출고구분
    { fieldName: 'ojIstDt' }, // 원주문매출일
    { fieldName: 'ojCanDt' }, // 원주문취소일
    { fieldName: 'ojEnddt' }, // 원주문보상/종료일
    { fieldName: 'cttRsCd' }, // 컨택코드
    { fieldName: 'cttRsNm' }, // 컨택코드명
    { fieldName: 'cttRsNmUsrId' }, // 컨택사번
    { fieldName: 'sellInflwChnlDtlNm' }, // 판매유형
    { fieldName: 'sellPrtnrNo' }, // 파트너코드
    { fieldName: 'prtnrKnm' }, // 파트너명
    { fieldName: 'prtnrKnmEncr' }, // 파트너명(암호화)
    { fieldName: 'ogCd' }, // 조직코드
    { fieldName: 'rveCd' }, // 수납코드
    { fieldName: 'ichrUsrId' }, // 업무담당사번
    { fieldName: 'aftnInf' }, // 이체계좌/카드
    { fieldName: 'mpyBsdt' }, // 이체일
    { fieldName: 'cntrCstNo' }, // 고객번호
    { fieldName: 'cntrCralTno' }, // 계약자 휴대폰번호
    { fieldName: 'cntrCralLocaraTno' }, // 계약자 휴대지역전화번호
    { fieldName: 'cntrMexnoEncr' }, // 계약자 휴대전화국번호암호화
    { fieldName: 'cntrCralIdvTno' }, // 계약자 휴대개별전화번호
    { fieldName: 'adrZip' }, // 계약자우편번호
    { fieldName: 'cntrCstRnadr' }, // 계약자기준주소
    { fieldName: 'cntrCstRdadr' }, // 계약자상세주소
    { fieldName: 'cntrCstRdadrEncr' }, // 계약자상세주소(암호화)
    { fieldName: 'istCralTno' }, // 설치정보-휴대전화번호
    { fieldName: 'istCralLocaraTno' }, // 설치정보-휴대지역전화번호
    { fieldName: 'istMexnoEncr' }, // 설치정보-휴대전화국번호암호화
    { fieldName: 'istCralIdvTno' }, // 설치정보-휴대개별전화번호
    { fieldName: 'istAdrZip' }, // 설치자우편번호
    { fieldName: 'istRnadr' }, // 설치자기준주소
    { fieldName: 'istRdadr' }, // 설치자상세주소
    { fieldName: 'istRdadrEncr' }, // 설치자상세주소(암호화)
    { fieldName: 'lcck05' }, // 일시불즉시유상M여부
    { fieldName: 'combiDv' }, // 렌탈,일시불결합구분
    { fieldName: 'sdingCntrNo' }, // 웰스팜 계약번호
    { fieldName: 'feeFxamYn' }, // 수당제외여부
    { fieldName: 'sconCn' }, // 특약내용
    { fieldName: 'ordCnfp' }, // 주문확인구분
    { fieldName: 'fstRgstDt' }, // 등록일
    { fieldName: 'fstRgstTm' }, // 등록시간
    { fieldName: 'fstRgstUsrId' }, // 업무담당사번
    { fieldName: 'fstRgstPrgId' }, // 등록프로그램
    { fieldName: 'fnlMdfcDt' }, // 변경일
    { fieldName: 'fnlMdfcTm' }, // 변경시간
    { fieldName: 'fnlMdfcUsrId' }, // 변경자사번
    { fieldName: 'fnlMdfcPrgId' }, // 변경프로그램
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '180', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true }, // 계약상세번호
    { fieldName: 'ordrInfoView', header: t('MSG_TXT_ODER_INF_VIEW'), width: '130', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_ODER_INF_VIEW') }, // 주문정보 보기
    { fieldName: 'cntrSn', header: t('MSG_TXT_SN'), width: '130', styleName: 'text-center' }, // 순번
    { fieldName: 'cstKnmEncr', header: t('MSG_TXT_CNTOR_NM'), width: '138', styleName: 'text-left' }, // 계약자명
    { fieldName: 'rcgvpKnmEncr', header: t('MSG_TXT_IST_NM'), width: '138', styleName: 'text-left' }, // 설치자명
    { fieldName: 'sellTpDtlNm', header: t('MSG_TXT_CNTR_DV'), width: '138' }, // 계약구분
    { fieldName: 'mshDvNm', header: t('MSG_TXT_MSH_DV'), width: '138' }, // 멤버십구분
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_CATE'), width: '138' }, // 상품분류
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '138', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '292' }, // 상품명
    { fieldName: 'pdQty', header: t('MSG_TXT_PRODUCT_QTY'), width: '138', styleName: 'text-right' }, // 상품수량
    { fieldName: 'svTpNm', header: t('MSG_TXT_USWY_DV'), width: '138', styleName: 'text-center' }, // 용도구분
    { fieldName: 'stplPtrm', header: t('MSG_TXT_STPL_MCNT'), width: '138', styleName: 'text-right' }, // 약정개월
    { fieldName: 'svPrd', header: t('MSG_TXT_MNGT_PRD'), width: '138', styleName: 'text-right' }, // 관리주기
    { fieldName: 'frisuBfsvcPtrmN', header: `${t('MSG_TXT_MMBR')}/${t('MSG_TXT_FRISU_MSH')}`, width: '138', styleName: 'text-right' }, // 멤버십/무상멤버십
    { fieldName: 'spayFrisuBfsvcPtrmN', header: `${t('MSG_TXT_SNGL_PMNT')}/${t('MSG_TXT_FRISU_MSH')}`, width: '138', styleName: 'text-right' }, // 일시불/무상멤버십
    { fieldName: 'pdLclsfNm', header: t('MSG_TXT_PRDT_GUBUN') + 1, width: '138' }, // 상품구분1
    { fieldName: 'pdDclsfNm', header: t('MSG_TXT_PRDT_GUBUN') + 2, width: '138' }, // 상품구분2
    { fieldName: 'cntrDtlStatNm', header: t('MSG_TXT_MSH_STAT'), width: '138', styleName: 'text-center' }, // 멤버십상태
    { fieldName: 'sellDscDvNm', header: `${t('MSG_TXT_SSPCS')}/${t('MSG_TXT_MTR_DV')}`, width: '138' }, // 할인적용구분명
    { fieldName: 'feeAckmtCt', header: t('MSG_TXT_PD_ACC_CNT'), width: '138', styleName: 'text-right' }, // 인정건수
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_RECOG_AMT'), width: '138', styleName: 'text-right' }, // 인정금액
    { fieldName: 'cntrCtrAmt', header: t('MSG_TXT_DSC_AMT'), width: '138', styleName: 'text-right' }, // 할인금액
    { fieldName: 'stlmTpNm', header: t('MSG_TXT_PY_DV'), width: '138', styleName: 'text-center' }, // 납입구분
    { fieldName: 'prmPtrmMcn', header: t('MSG_TXT_PRM_DV'), width: '138', styleName: 'text-right' }, // 선납구분(선납기간개월수)
    { fieldName: 'adjDvNm', header: t('MSG_TXT_NOM_DV'), width: '138', styleName: 'text-center' }, // 정상구분
    { fieldName: 'sellEvNm', header: t('MSG_TXT_STL_DV'), width: '138', styleName: 'text-center' }, // 약정구분
    { fieldName: 'frisuMshCrtYn', header: t('MSG_TXT_FRISU_M_AUTO_CRT'), width: '138', styleName: 'text-center' }, // 무상M자동생성
    { fieldName: 'cntrRcpFshDt', header: t('MSG_TXT_RCP_D'), width: '138', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일
    { fieldName: 'cntrCnfmYn', header: t('MSG_TXT_DTRM_YN'), width: '136', styleName: 'text-center' }, // 확정여부
    { fieldName: 'cntrCnfmDt', header: t('MSG_TXT_DTRM_DATE'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 확정일
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_SUBS_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 가입일
    { fieldName: 'hcrDuedt', header: t('MSG_TXT_HCR_DUEDT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 홈케어예정일
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일
    { fieldName: 'dutyExnDtFrisu', header: t('MSG_TXT_MAND_EXP_DT_FRISU'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 의무만료일(무상)
    { fieldName: 'dutyExnDtRecap', header: t('MSG_TXT_MAND_EXP_DT_RECAP'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 의무만료일자(유상)
    { fieldName: 'cntrPdEnddt', header: t('MSG_TXT_WTDR_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 탈퇴일
    { fieldName: 'canDt', header: t('MSG_TXT_CAN_D'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 취소일
    { fieldName: 'vstDuedt', header: t('MSG_TXT_VISIT_DATE'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 방문일
    { fieldName: 'cttFshDt', header: t('MSG_TXT_CTT_D'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 컨택일
    { fieldName: 'cntrCanRsonCd', header: t('MSG_TXT_WTDR_TP_CD'), width: '136', styleName: 'text-center' }, // 탈퇴유형코드
    { fieldName: 'cntrCanRsonNm', header: t('MSG_TXT_WTDR_TP_NM'), width: '136', styleName: 'text-center' }, // 탈퇴유형명
    { fieldName: 'hcrOstrDvNm', header: `${t('MSG_TXT_HOME_CARE')}${t('MSG_TXT_OSTR_DV')}`, width: '136', styleName: 'text-center' }, // 홈케어출고구분
    { fieldName: 'ojIstDt', header: t('MSG_TXT_ORG_ORDR_SL_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 원주문매출일
    { fieldName: 'ojCanDt', header: t('MSG_TXT_ORG_ORDR_CNCL_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 원주문취소일
    { fieldName: 'ojEnddt', header: t('MSG_TXT_ORG_ORDR_COMP_END_DT'), width: '136', styleName: 'text-center' }, // 원주문보상/종료일
    { fieldName: 'cttRsCd', header: t('MSG_TXT_CTT_CD'), width: '136', styleName: 'text-center' }, // 컨택코드
    { fieldName: 'cttRsNm', header: t('MSG_TXT_CTT_CD_NM'), width: '230' }, // 컨택코드명
    { fieldName: 'cttRsNmUsrId', header: t('MSG_TXT_CTT_EPNO'), width: '136', styleName: 'text-center' }, // 컨택사번
    { fieldName: 'sellInflwChnlDtlNm', header: t('MSG_TXT_SEL_TYPE'), width: '136' }, // 판매유형
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_PRTNR_CD'), width: '136', styleName: 'text-center' }, // 파트너코드
    { fieldName: 'prtnrKnmEncr', header: t('MSG_TXT_PTNR_NAME'), width: '136', styleName: 'text-center' }, // 파트너명
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '136', styleName: 'text-center' }, // 조직코드
    { fieldName: 'rveCd', header: t('MSG_TXT_RVE_CD'), width: '136', styleName: 'text-center' }, // 수납코드
    { fieldName: 'ichrUsrId', header: `${t('MSG_TXT_BIZ_ICHR')}${t('MSG_TXT_EPNO')}`, width: '136', styleName: 'text-center' }, // 업무담당사번
    { fieldName: 'aftnInf', header: t('MSG_TXT_FNT_AC_CARD'), width: '136', styleName: 'text-center' }, // 이체계좌/카드
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FTD'), width: '136', styleName: 'text-center' }, // 이체일
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '136', styleName: 'text-center' }, // 고객번호
    {
      fieldName: 'cntrCralTno',
      header: t('MSG_TXT_CNTRR_VAC_PH_NO'),
      width: '138',
      styleName: 'text-center',
    }, // 계약자 휴대전화번호
    { fieldName: 'adrZip', header: `${t('MSG_TXT_CNTRT')}${t('MSG_TXT_ZIP')}`, width: '136', styleName: 'text-center' }, // 계약자우편번호
    { fieldName: 'cntrCstRnadr', header: t('MSG_TXT_STD_ADDR'), width: '270', styleName: 'text-left' }, // 계약자기준주소
    { fieldName: 'cntrCstRdadrEncr', header: t('MSG_TXT_DETAIL_ADDR'), width: '230', styleName: 'text-left' }, // 계약자상세주소
    {
      fieldName: 'istCralTno',
      header: t('MSG_TXT_INSTR_PH_NO'),
      width: '138',
      styleName: 'text-center',
    }, // 설치자 휴대전화번호
    { fieldName: 'istAdrZip', header: `${t('MSG_TXT_INSTR')}${t('MSG_TXT_ZIP')}`, width: '136', styleName: 'text-center' }, // 설치자우편번호
    { fieldName: 'istRnadr', header: t('MSG_TXT_STD_ADDR'), width: '270', styleName: 'text-left' }, // 설치자기준주소
    { fieldName: 'istRdadrEncr', header: t('MSG_TXT_DETAIL_ADDR'), width: '230', styleName: 'text-left' }, // 설치자상세주소
    { fieldName: 'lcck05', header: t('MSG_TXT_SPAY_IMMDT_RECAP_YN'), width: '170', styleName: 'text-center' }, // 일시불즉시유상M여부
    { fieldName: 'combiDv', header: t('MSG_TXT_RNTL_SPAY_COMBI_DV'), width: '191', styleName: 'text-center' }, // 렌탈,일시불결합구분
    { fieldName: 'sdingCntrNo', header: t('MSG_TXT_WELLS_FARM_CNTR_NO'), width: '136', styleName: 'text-center' }, // 웰스팜 계약번호
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_AW_EXCD_YN'), width: '136', styleName: 'text-center' }, // 수당제외여부
    { fieldName: 'sconCn', header: t('MSG_TXT_SPEC_CNTR_CNTN'), width: '280', styleName: 'text-center' }, // 특약내용
    { fieldName: 'ordCnfp', header: t('MSG_TXT_ORDR_CNFM_DV'), width: '136', styleName: 'text-center' }, // 주문확인구분
    { fieldName: 'fstRgstDt', header: t('MSG_TXT_RGST_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 등록일
    { fieldName: 'fstRgstTm', header: t('MSG_TXT_RGST_HH'), width: '136', styleName: 'text-center', datetimeFormat: 'hh:mm:ss' }, // 등록시간
    { fieldName: 'fstRgstUsrId', header: `${t('MSG_TXT_BIZ_ICHR')}${t('MSG_TXT_EPNO')}`, width: '136', styleName: 'text-center' }, // 업무담당사번
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG'), width: '136', styleName: 'text-center' }, // 등록프로그램
    { fieldName: 'fnlMdfcDt', header: t('MSG_TXT_CH_DT2'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 변경일
    { fieldName: 'fnlMdfcTm', header: t('MSG_TXT_CHG_HH'), width: '136', styleName: 'text-center', datetimeFormat: 'hh:mm:ss' }, // 변경시간
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_MDFR_EPNO'), width: '136', styleName: 'text-center' }, // 변경자사번
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_FST_RGST_PRG'), width: '136', styleName: 'text-center' }, // 변경프로그램
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.setFixedOptions({ colCount: 5 }); // 열고정(설치자명)

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
    } else if (['ordrInfoView'].includes(column)) { // 멤버쉽 주문정보 상세
      await modal({ component: 'WwctaOrderMembershipDtlP', componentProps: { cntrNo: paramCntrNo, cntrSn: paramCntrSn } });
    }
  };
});
</script>
<style scoped>
</style>
