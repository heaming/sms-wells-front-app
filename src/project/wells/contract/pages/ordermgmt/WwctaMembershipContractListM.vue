<!-- eslint-disable max-len -->
<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaMembershipContractNoListM - 주문상세조회/관리(멤버십-일반조회)
3. 작성자 : jihoon.kim
4. 작성일 : 2023.03.29
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0067] - 멤버십에 대한 주문 상세내역 (to-be 에서는 통합 주문 상세 내역으로 구현)
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- 접수일 -->
      <kw-search-item
        :label="$t('MSG_TXT_RCP_D')"
        required
        :colspan="2"
      >
        <kw-select
          v-model="searchParams.rcpDateDv"
          :options="[{ codeId: '1', codeName: t('MSG_TXT_RCPDT') },
                     { codeId: '2', codeName: t('MSG_TXT_SCHD_DT') },
                     { codeId: '3', codeName: t('MSG_TXT_WDWAL_DT') },
                     { codeId: '4', codeName: t('MSG_TXT_J_DT') },
                     { codeId: '5', codeName: t('MSG_TXT_MAND_EXP_DT_FRISU') },
                     { codeId: '6', codeName: t('MSG_TXT_MAND_EXP_DT_RECAP') }]"
          rules="required"
        />
        <kw-date-range-picker
          v-model:from="searchParams.strtDt"
          v-model:to="searchParams.endDt"
          rules="date_range_required|date_range_months:1"
        />
      </kw-search-item>
      <!-- 일자선택 -->
      <kw-search-item
        :label="$t('MSG_TXT_DT_SELT')"
        :colspan="2"
      >
        <kw-select
          v-model="searchParams.dateSeltDv"
          :options="[{ codeId: '1', codeName: t('MSG_TXT_DUEDT') },
                     { codeId: '2', codeName: t('MSG_TXT_WTDR_DT') },
                     { codeId: '3', codeName: t('MSG_TXT_SUBS_DT') },
                     { codeId: '4', codeName: t('MSG_TXT_MAND_EXP_DT_FRISU') },
                     { codeId: '5', codeName: t('MSG_TXT_MAND_EXP_DT_RECAP') },
                     { codeId: '6', codeName: t('MSG_TXT_DTRM_DATE') },
                     { codeId: '7', codeName: t('MSG_TXT_DT_OF_SALE') },
                     { codeId: '8', codeName: t('MSG_TXT_CAN_D') }]"
          class="w150"
        />
        <kw-date-range-picker
          v-model:from="searchParams.choStrtDt"
          v-model:to="searchParams.choEndDt"
          :label="$t('MSG_TXT_DT_SELT')"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <!-- 계약번호 -->
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_NO')"
      >
        <kw-input
          v-model="searchParams.cntrNo"
          icon="search"
          clearable
          :label="$t('MSG_TXT_CNTR_NO')"
          :maxlength="12"
          :regex="contractNumberRegEx"
          @keydown="onKeyDownSelectCntrNo"
          @click-icon="onClickSelectCntrNo"
          @clear="onClearSelectCntrNo"
        />
      </kw-search-item>
      <!-- 계약구분 -->
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_DV')"
        :colspan="2"
      >
        <kw-option-group
          v-model="searchParams.sellTpDtlCd"
          type="radio"
          :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '31' || v.codeId === '32' || v.codeId === '33')"
          first-option="all"
          first-option-value=""
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <!-- 멤버십구분 -->
      <kw-form-item
        :label="$t('MSG_TXT_MSH_DV')"
      >
        <kw-select
          v-model="searchParams.cntrwTpCd"
          :options="codes.CNTRW_TP_CD.filter((v) => v.codeId === '1' || v.codeId === '2' || v.codeId === '5')"
          first-option="all"
          first-option-value=""
        />
      </kw-form-item>
      <!-- 판매구분 -->
      <kw-form-item
        :label="$t('MSG_TXT_SLS_CAT')"
      >
        <kw-select
          v-model="searchParams.sellInflwChnlDtlCd"
          :options="codes.SELL_CHNL_DTL_CD.filter((v) => v.codeId === '1010'
            || v.codeId === '1080' || v.codeId === '3010' || v.codeId === '1030' || v.codeId === '9040')"
          first-option="all"
          first-option-value=""
        />
      </kw-form-item>
      <!-- 상품분류 -->
      <kw-form-item
        :label="$t('MSG_TXT_PRDT_CATE')"
        :colspan="2"
      >
        <!-- 상품분류(대분류) 선택 -->
        <kw-select
          v-model="selectHighClasses"
          :placeholder="$t('TXT_MSG_PD_HCLSF_ID') + ' ' + $t('MSG_TXT_SELT')"
          :options="filteredHighClasses"
          option-value="pdClsfId"
          option-label="pdClsfNm"
          first-option="all"
          :first-option-label="$t('TXT_MSG_PD_HCLSF_ID') + ' ' + $t('MSG_TXT_SELT')"
          first-option-value=""
          @update:model-value="onUpdateHighClasses"
        />
        <!-- 상품분류(중분류) 선택 -->
        <kw-select
          v-model="selectMiddleClasses"
          :placeholder="$t('MSG_TXT_PD_MCLSF_ID') + ' ' + $t('MSG_TXT_SELT')"
          :options="filteredMiddleClasses"
          option-value="refPdClsfVal"
          option-label="pdClsfNm"
          first-option="all"
          :first-option-label="$t('MSG_TXT_PD_MCLSF_ID') + ' ' + $t('MSG_TXT_SELT')"
          first-option-value=""
        />
      </kw-form-item>
    </kw-search-row>
    <kw-search-row>
      <!-- 상품코드 -->
      <kw-search-item
        :label="$t('MSG_TXT_PRDT_CODE')"
      >
        <kw-input
          v-model="searchParams.pdCd"
          clearable
          icon="search"
          :maxlength="10"
          regex="alpha_num"
          dense
          @click-icon="onClickSelectPdCd()"
        />
      </kw-search-item>
      <!-- 상품명 -->
      <kw-search-item
        :label="$t('MSG_TXT_PRDT_NM')"
      >
        <kw-input
          v-model="searchParams.pdNm"
          clearable
          :maxlength="100"
        />
      </kw-search-item>
      <!-- 파트너코드 -->
      <kw-search-item
        :label="$t('MSG_TXT_PRTNR_CD')"
      >
        <kw-input
          v-model="searchParams.sellPrtnrNo"
          clearable
          icon="search"
          :maxlength="10"
          regex="num"
          @click-icon="onClickSearchPrtnrNoPopup()"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <!-- 미가입자만 조회 -->
      <kw-form-item :label="$t('MSG_TXT_UNSSCB_INQR')">
        <kw-field
          :model-value="[]"
        >
          <template #default="{ field }">
            <!-- 미가입자만보기 -->
            <kw-checkbox
              v-model="checkType"
              v-bind="field"
              :label="$t('MSG_TXT_UNSSCB_VIEW')"
              val=""
            />
          </template>
        </kw-field>
      </kw-form-item>
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
        dense
        secondary
        :label="$t('MSG_TXT_CNFM_MNGT')"
        :disable="!pageInfo.totalCount"
        @click="onClickConfirmManagement"
      />
      <!-- 홈케어관리 -->
      <kw-btn
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
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="!pageInfo.totalCount"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMembershipContractList"
      name="grdMembershipContractList"
      :visible-rows="pageInfo.pageSize"
      @init="initGridMembershipContractList"
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
import { codeUtil, defineGrid, getComponentType, useDataService, gridUtil, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const { alert, modal, notify } = useGlobal();
const { getUserInfo } = useMeta();
const { tenantCd } = getUserInfo();
const availablePrefix = ['E', 'W'].includes(tenantCd) ? tenantCd : '[EW]';
const contractNumberRegEx = RegExp(`^${availablePrefix}\\d{0,11}?$`);
const { currentRoute } = useRouter();

let cachedParams;
const now = dayjs();
const searchParams = ref({
  rcpDateDv: '1', // 접수일
  strtDt: now.startOf('month').format('YYYYMMDD'), // 시작일자
  endDt: now.format('YYYYMMDD'), // 종료일자
  dateSeltDv: '', // 일자선택
  choStrtDt: '', // 일자선택(시작일자)
  choEndDt: '', // 일자선택(종료일자)
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  sellTpDtlCd: '', // 계약구분
  cntrwTpCd: '', // 멤버십구분
  sellInflwChnlDtlCd: '', // 판매구분
  hcsfVal: '', // 상품분류-대분류
  hcsfMcsfVal: '', // 상품분류-중분류
  pdCd: '', // 상품코드
  pdNm: '', // 상품명
  sellPrtnrNo: '', // 파트너코드
  cntrRcpFshDtYn: '', // 미가입자만보기
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SELL_CHNL_DTL_CD', // 판매유입채널상세코드
  'SELL_TP_DTL_CD', // 판매유형상세코드
  'CNTRW_TP_CD', // 멤버십구분
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
const grdMembershipContractList = ref(getComponentType('KwGrid'));
const checkType = ref([undefined]); // 미가입자만 조회

async function fetchData() {
  // console.log(`checkType : ${checkType.value[0]}`);
  searchParams.value.cntrRcpFshDtYn = checkType.value[0] === undefined ? 'N' : 'Y';

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

  const view = grdMembershipContractList.value.getView();
  view.getDataSource().setRows(pages);
  // pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 상품코드 검색아이콘 클릭
async function onClickSelectPdCd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.pdCd,
    selectType: '',
  };

  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });

  if (returnPdInfo.result) {
    searchParams.value.pdCd = returnPdInfo.payload?.[0].pdCd;
    searchParams.value.pdNm = returnPdInfo.payload?.[0].pdNm;
  }
}

// 파트너 검색 팝업 호출
async function onClickSearchPrtnrNoPopup() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {},
  });
  if (result) {
    searchParams.value.sellPrtnrNo = payload.prtnrNo;
  }
}

// 상품분류코드 조회
const codesHighClasses = ref([]);
const codesMiddleClasses = ref([]);

const filteredHighClasses = ref([]); // 필터링된 대분류 코드
const filteredMiddleClasses = ref([]); // 필터링된 중분류 코드

const selectHighClasses = ref([]); // 선택한 대분류 코드
const selectMiddleClasses = ref([]); // 선택한 중분류 코드

async function getPdClassesInfos() {
  let res = [];
  res = await dataService.get('/sms/wells/contract/product/high-classes'); // 상품대분류 조회
  codesHighClasses.value = res.data;
  res = await dataService.get('/sms/wells/contract/product/middle-classes'); // 상품중분류 조회
  codesMiddleClasses.value = res.data;

  // 상품대분류 코드 초기화
  filteredHighClasses.value = codesHighClasses.value;
}
getPdClassesInfos();

// 상품대분류 변경 이벤트
async function onUpdateHighClasses(selectedValues) {
  // 선택한 상품중분류 초기화
  selectMiddleClasses.value = [];

  // 상품중분류 코드 필터링. 선택한 상품대분류의 하위 상품중분류으로 필터링
  filteredMiddleClasses.value = codesMiddleClasses.value.filter((v) => selectedValues.includes(v.hgrPdClsfId));
}

async function onClickSearch() {
  // 선택한 상품분류 코드에 해당하는 참조상품분류값 세팅
  const highClasses = ref();
  highClasses.value = codesHighClasses.value
    .filter((v) => selectHighClasses.value.includes(v.pdClsfId))
    .map((v) => v.refPdClsfVal);
  searchParams.value.hcsfVal = highClasses.value[0];
  searchParams.value.hcsfMcsfVal = selectMiddleClasses.value;

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMembershipContractList.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/order-detail-mngt/membership/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 확정관리 팝업조회
async function onClickConfirmManagement() {
  // await alert('멤버십 확정관리 팝업연계 예정(WwctaMembershipConfirmMgtP)');
  const view = grdMembershipContractList.value.getView();
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
  const view = grdMembershipContractList.value.getView();
  const row = view.getCheckedItems();
  if (row.length === 0) {
    notify(t('MSG_ALT_BEFORE_SELECT_IT', [t('MSG_TXT_ITEM')]));
    return;
  }
  const cntrs = gridUtil.getCheckedRowValues(view);
  const res = await modal({
    component: 'WwctaHomeCareMgtP',
    componentProps: { cntrs },
  });

  // 리턴값을 체크한 후 재조회
  if (res.result) fetchData();
}

// 계약번호 팝업조회
async function onClickSelectCntrNo() {
  const { result, payload } = await modal({ component: 'WwctaContractNumberListP',
    // componentProps: { cntrCstNo: searchParams.value.cntrCstNo, cntrCstKnm: searchParams.value.cntrCstKnm },
  });

  if (result) {
    searchParams.value.cntrNo = payload.cntrNo;
    // searchParams.value.cntrSn = payload.cntrSn;
  }
}

onMounted(async () => {
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMembershipContractList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'ordrInfoView' }, // 주문정보 보기
    { fieldName: 'cntrSn' }, // 순번
    { fieldName: 'sellTpCd' }, // 판매유형코드
    { fieldName: 'copnDvCd' }, // 고객구분코드(1:개인, 2:법인)
    { fieldName: 'cstKnm' }, // 계약자명
    { fieldName: 'cstKnmEncr' }, // 계약자명(암호화)
    { fieldName: 'rcgvpKnm' }, // 설치자명
    { fieldName: 'rcgvpKnmEncr' }, // 설치자명(암호화)
    { fieldName: 'sellTpDtlNm' }, // 계약구분
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
    { fieldName: 'prmPtrmMcn' }, // 선납구분
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
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '180', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true }, // 계약번호
    { fieldName: 'ordrInfoView', header: t('MSG_TXT_ODER_INF_VIEW'), width: '130', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_ODER_INF_VIEW') }, // 주문정보 보기
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '138', styleName: 'text-center' }, // 순번
    { fieldName: 'cstKnmEncr', header: t('MSG_TXT_CNTOR_NM'), width: '138', styleName: 'text-left' }, // 계약자명
    { fieldName: 'rcgvpKnmEncr', header: t('MSG_TXT_IST_NM'), width: '138', styleName: 'text-left' }, // 설치자명
    { fieldName: 'sellTpDtlNm', header: t('MSG_TXT_CNTR_DV'), width: '138' }, // 계약구분
    { fieldName: 'mshDvNm', header: t('MSG_TXT_MSH_DV'), width: '138' }, // 멤버십구분
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_CATE'), width: '138' }, // 상품분류
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '138', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '292' }, // 상품명
    { fieldName: 'pdQty', header: t('MSG_TXT_PRODUCT_QTY'), width: '138', styleName: 'text-right' }, // 상품수량
    { fieldName: 'svTpNm', header: t('MSG_TXT_USWY_DV'), width: '138' }, // 용도구분
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
    { fieldName: 'stlmTpNm', header: t('MSG_TXT_PY_DV'), width: '138' }, // 납입구분
    { fieldName: 'prmPtrmMcn', header: t('MSG_TXT_PRM_DV'), width: '138' }, // 선납구분
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
    { fieldName: 'cttFshDt', header: t('MSG_TXT_CTT_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 컨택일
    { fieldName: 'cntrCanRsonCd', header: t('MSG_TXT_WTDR_TP_CD'), width: '136', styleName: 'text-center' }, // 탈퇴유형코드
    { fieldName: 'cntrCanRsonNm', header: t('MSG_TXT_WTDR_TP_NM'), width: '136', styleName: 'text-center' }, // 탈퇴유형명
    { fieldName: 'hcrOstrDvNm', header: t('MSG_TXT_OSTR_DV'), width: '136', styleName: 'text-center' }, // 홈케어출고구분
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
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FTD'), width: '136', styleName: 'text-right', datetimeFormat: 'date' }, // 이체일
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '136', styleName: 'text-center' }, // 고객번호
    {
      fieldName: 'cntrCralTno',
      header: t('MSG_TXT_CNTRT_CPHON_NO'),
      width: '136',
      styleName: 'text-center',
    }, // 계약자 휴대폰번호
    { fieldName: 'adrZip', header: `${t('MSG_TXT_CNTRT')}${t('MSG_TXT_ZIP')}`, width: '136', styleName: 'text-center' }, // 계약자우편번호
    { fieldName: 'cntrCstRnadr', header: t('MSG_TXT_STD_ADDR'), width: '313' }, // 계약자기준주소
    { fieldName: 'cntrCstRdadrEncr', header: t('MSG_TXT_DETAIL_ADDR'), width: '259' }, // 계약자상세주소
    {
      fieldName: 'istCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
    }, // 설치정보-휴대전화번호
    { fieldName: 'istAdrZip', header: `${t('MSG_TXT_INSTR')}${t('MSG_TXT_ZIP')}`, width: '136', styleName: 'text-center' }, // 설치자우편번호
    { fieldName: 'istRnadr', header: t('MSG_TXT_STD_ADDR'), width: '313' }, // 설치자기준주소
    { fieldName: 'istRdadrEncr', header: t('MSG_TXT_DETAIL_ADDR'), width: '259' }, // 설치자상세주소
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
    { fieldName: 'fnlMdfcDt', header: t('MSG_TXT_CH_DT'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 변경일
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
