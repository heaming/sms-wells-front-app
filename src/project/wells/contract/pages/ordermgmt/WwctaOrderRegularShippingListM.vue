<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaOrderRegularShippingListM - wells 정기배송 상세 조회
3. 작성자 : jihoon.kim
4. 작성일 : 2023.03.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0074] - 정기 배송에 대한 주문 상세내역 (to-be 에서는 통합 주문 상세 내역으로 구현)
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- 기간조회 -->
      <kw-search-item
        :label="$t('MSG_TXT_PRD_ENQRY')"
        required
        :colspan="2"
      >
        <kw-select
          v-model="searchParams.prdEnqry"
          :options="[{ codeId: '1', codeName: t('MSG_TXT_RCP_D') },
                     { codeId: '2', codeName: t('MSG_TXT_CAN_D') },
                     { codeId: '3', codeName: t('MSG_TXT_DT_OF_SALE') },
                     { codeId: '4', codeName: t('MSG_TXT_EXP_DT') }]"
          class="w166"
          rules="required"
        />
        <span />
        <kw-date-range-picker
          v-model:from="searchParams.strtDt"
          v-model:to="searchParams.endDt"
          rules="date_range_required|date_range_months:1"
          :label="searchParams.prdEnqry === '1' ? $t('MSG_TXT_RCP_D'):
            searchParams.prdEnqry === '2' ? $t('MSG_TXT_CAN_D'):
            searchParams.prdEnqry === '3' ? $t('MSG_TXT_DT_OF_SALE'):
            searchParams.prdEnqry === '4' ? $t('MSG_TXT_EXP_DT'):$t('MSG_TXT_RCP_D')"
        />
      </kw-search-item>
      <!-- 고객번호 -->
      <kw-search-item
        :label="$t('MSG_TXT_CST_NO')"
      >
        <kw-input
          v-model="searchParams.cntrCstNo"
          :label="$t('MSG_TXT_CST_NO')"
          icon="search"
          clearable
          :on-click-icon="onClickSearchCntrCst"
          :maxlength="10"
          regex="num"
        />
      </kw-search-item>
      <!-- 자료구분 -->
      <kw-search-item
        :label="$t('MSG_TXT_MTR_DV')"
      >
        <kw-option-group
          v-model="checkType"
          :options="checkOption"
          type="checkbox"
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <!-- 조직구분 -->
      <kw-search-item
        :label="$t('MSG_TXT_OG_DV')"
      >
        <kw-select
          v-model="searchParams.sellOgTpCd"
          :options="[{ codeId: 'W01', codeName: 'P추진단' },
                     { codeId: 'W02', codeName: 'M추진단' }]"
          :model-value="searchParams.sellOgTpCd ? searchParams.sellOgTpCd : []"
          :multiple="true"
        />
      </kw-search-item>
      <!-- 조직코드 -->
      <kw-search-item
        :label="$t('MSG_TXT_OG_CD')"
        :colspan="2"
      >
        <!-- 총괄단 선택 -->
        <kw-select
          v-model="selectedDgr1LevlOgCds"
          class="select_og_cd"
          :placeholder="$t('MSG_TXT_MANAGEMENT_DEPARTMENT') + ' ' + $t('MSG_TXT_SELT')"
          :options="filteredDgr1LevlOgCds"
          option-value="dgr1LevlOgCd"
          option-label="dgr1LevlOgNm"
          multiple
          @update:model-value="onUpdateDgr1Levl"
        />
        <!-- 지역단 선택 -->
        <kw-select
          v-model="selectedDgr2LevlOgCds"
          class="select_og_cd"
          :placeholder="$t('MSG_TXT_RGNL_GRP') + ' ' + $t('MSG_TXT_SELT')"
          :options="filteredDgr2LevlOgCds"
          option-value="dgr2LevlOgCd"
          option-label="dgr2LevlOgNm"
          multiple
          @update:model-value="onUpdateDgr2Levl"
        />
        <!-- 지점 선택 -->
        <kw-select
          v-model="selectedDgr3LevlOgCds"
          class="select_og_cd"
          :placeholder="$t('MSG_TXT_BRANCH') + ' ' + $t('MSG_TXT_SELT')"
          :options="filteredDgr3LevlOgCds"
          option-value="dgr3LevlOgCd"
          option-label="dgr3LevlOgNm"
          multiple
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <!-- 기기종류 -->
      <kw-search-item
        :label="$t('MSG_TXT_MCHN_KND')"
      >
        <kw-select
          v-model="searchParams.mchnDv"
          :options="[{ codeId: '61', codeName: '해당없음' },
                     { codeId: '62', codeName: '모종' },
                     { codeId: '63', codeName: '캡슐' }]"
          :model-value="searchParams.mchnDv ? searchParams.mchnDv : []"
          :multiple="true"
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
      ref="grdRglrDlvrContractList"
      name="grdRglrDlvrContractList"
      :visible-rows="pageInfo.pageSize"
      @init="initGridRglrDlvrContractList"
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
import { codeUtil, getComponentType, useDataService, gridUtil, stringUtil, useGlobal, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty, uniqBy } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const { alert, modal } = useGlobal();
const { currentRoute } = useRouter();

let cachedParams;
const now = dayjs();
const searchParams = ref({
  prdEnqry: '1', // 기간조회
  strtDt: now.startOf('month').format('YYYYMMDD'), // 시작일자
  endDt: now.format('YYYYMMDD'), // 종료일자
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  cntrCstNo: '', // 계약고객번호
  canYn: '', // 자료구분-취소제외
  slYn: '', // 자료구분-매출생성
  sellOgTpCd: [], // 조직구분
  dgr1LevlOgId: [], // 조직코드-총괄단
  dgr2LevlOgId: [], // 조직코드-지역단
  dgr3LevlOgId: [], // 조직코드-지점
  sellPrtnrNo: '', // 파트너코드
  mchnDv: [], // 기기종류
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'ALNCMP_CD',
  'SELL_EV_CD',
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
const grdRglrDlvrContractList = ref(getComponentType('KwGrid'));
const isCsvDownloadVisible = ref(false); // CSV Download Button
const checkType = ref([]); // 자료구분
const checkOption = ref([
  { codeId: 1, codeName: t('MSG_TXT_EXCLD_CANC') }, // 취소제외
  { codeId: 2, codeName: t('MSG_TXT_SL_CRT') }, // 매출생성
]);

async function fetchData() {
  // changing api & cacheparams according to search classification
  searchParams.value.canYn = '';
  searchParams.value.slYn = '';

  if (checkType.value[0] === 1 || checkType.value[1] === 1) {
    searchParams.value.canYn = 'Y';
  }
  if (checkType.value[0] === 2 || checkType.value[1] === 2) {
    searchParams.value.slYn = 'Y';
  }

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

  const view = grdRglrDlvrContractList.value.getView();
  view.getDataSource().setRows(pages);
  // pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 고객번호 팝업 호출
async function onClickSearchCntrCst() {
  const res = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: {
      cstNo: searchParams.value.cntrCstNo,
    },
  });
  if (res.result && res.payload) {
    // searchParams.value.cntrCstKnm = res.payload.name;
    searchParams.value.cntrCstNo = res.payload.cstNo;
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

// 조직코드 조회
const codesDgr1Levl = ref([]);
const codesDgr2Levl = ref([]);
const codesDgr3Levl = ref([]);

const filteredDgr1LevlOgCds = ref([]); // 필터링된 총괄단 코드
const filteredDgr2LevlOgCds = ref([]); // 필터링된 지역단 코드
const filteredDgr3LevlOgCds = ref([]); // 필터링된 지점 코드

const selectedDgr1LevlOgCds = ref([]); // 선택한 총괄단 코드
const selectedDgr2LevlOgCds = ref([]); // 선택한 지역단 코드
const selectedDgr3LevlOgCds = ref([]); // 선택한 지점 코드

async function getDgrOgInfos() {
  let res = [];
  res = await dataService.get('/sms/wells/contract/partners/general-divisions'); // 총괄단
  codesDgr1Levl.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/regional-divisions'); // 지역단
  codesDgr2Levl.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/branch-divisions'); // 지점
  codesDgr3Levl.value = res.data;

  // 총괄단 조직코드 초기화
  // filteredDgr1LevlOgCds.value = codesDgr1Levl.value;
  filteredDgr1LevlOgCds.value = uniqBy(codesDgr1Levl.value.filter((v) => ['W01', 'W02'].includes(v.ogTpCd)));
}
getDgrOgInfos();

// 조직코드 총괄단 변경 이벤트
async function onUpdateDgr1Levl(selectedValues) {
  // 선택한 지역단, 지점 초기화
  selectedDgr2LevlOgCds.value = [];
  selectedDgr3LevlOgCds.value = [];

  // 지역단 코드 필터링. 선택한 총괄단의 하위 지역단으로 필터링
  filteredDgr2LevlOgCds.value = codesDgr2Levl.value.filter((v) => selectedValues.includes(v.dgr1LevlOgCd));

  // 지점 코드 초기화
  filteredDgr3LevlOgCds.value = [];
}

// 조직코드 지역단 변경 이벤트
async function onUpdateDgr2Levl(selectedValues) {
  // 선택한 지점 초기화
  selectedDgr3LevlOgCds.value = [];

  // 지점 코드 필터링. 선택한 지역단의 하위 지점으로 필터링.
  filteredDgr3LevlOgCds.value = codesDgr3Levl.value.filter((v) => selectedValues.includes(v.dgr2LevlOgCd));
}

// 조회버튼 클릭 이벤트
async function onClickSearch() {
  // 선택한 조직 코드에 해당하는 조직 ID 세팅
  searchParams.value.dgr1LevlOgId = codesDgr1Levl.value
    .filter((v) => selectedDgr1LevlOgCds.value.includes(v.dgr1LevlOgCd))
    .map((v) => v.dgr1LevlOgId);
  searchParams.value.dgr2LevlOgId = codesDgr2Levl.value
    .filter((v) => selectedDgr2LevlOgCds.value.includes(v.dgr2LevlOgCd))
    .map((v) => v.dgr2LevlOgId);
  searchParams.value.dgr3LevlOgId = codesDgr3Levl.value
    .filter((v) => selectedDgr3LevlOgCds.value.includes(v.dgr3LevlOgCd))
    .map((v) => v.dgr3LevlOgId);

  await fetchData();
}

// CSV다운로드버튼 클릭 이벤트
async function onClickCsvDownload() {
  const view = grdRglrDlvrContractList.value.getView();
  const res = await dataService.post('/sms/wells/contract/contracts/order-detail-mngt/regular-shippings/excel-download', cachedParams);
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
    exportType: 'csv',
  });
}

// 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload() {
  const view = grdRglrDlvrContractList.value.getView();
  const res = await dataService.post('/sms/wells/contract/contracts/order-detail-mngt/regular-shippings/excel-download', cachedParams);
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
const initGridRglrDlvrContractList = defineGrid((data, view) => {
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
    { fieldName: 'cstNo' }, // 계약자 정보-사업/주민번호
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
    { fieldName: 'svTpNm' }, // 용도구분
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
    { fieldName: 'alncStatTpCd' }, // 제휴상태유형명 제휴상태
    { fieldName: 'alncStatTpNm' }, // 제휴상태유형명 제휴상태명
    { fieldName: 'alncmpCd' }, // 제휴상태유형명 제휴업체
    { fieldName: 'alncmpNm' }, // 제휴상태유형명 제휴업체명
    { fieldName: 'cltnCntrDtlStatNm' }, // 계약상세상태코드(해약)
    { fieldName: 'cttRsCd' }, // 컨택코드
    { fieldName: 'cttRsNm' }, // 컨택내용
    { fieldName: 'sconCn' }, // 특약내용
    { fieldName: 'cntrCstNo' }, // 고객번호
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '180', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true }, // 계약상세번호
    { fieldName: 'ordrInfoView', header: t('MSG_TXT_ODER_INF_VIEW'), width: '130', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_ODER_INF_VIEW') }, // 주문정보 보기
    { fieldName: 'dgr3LevlDgPrtnrNo', header: t('MSG_TXT_BRMGR_EPNO'), width: '138', styleName: 'text-center' }, // 파트너정보-지점장 사번
    { fieldName: 'dgr3LevlDgPrtnrNmEncr', header: t('MSG_TXT_BRMGR_FNM'), width: '138', styleName: 'text-center' }, // 파트너정보-지점장명
    { fieldName: 'dgr3LevlOgCd', header: t('MSG_TXT_BRCH_CD'), width: '138', styleName: 'text-center' }, // 파트너정보-지점코드
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_PRTNR_EMP_NO'), width: '138', styleName: 'text-center' }, // 파트너정보-파트너사번
    { fieldName: 'prtnrKnmEncr', header: t('MSG_TXT_PTNR_NAME'), width: '138', styleName: 'text-center' }, // 파트너정보-파트너명
    {
      fieldName: 'sellPrtnrCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
    }, // 파트너정보-휴대전화번호
    { fieldName: 'cstKnmEncr', header: t('MSG_TXT_CNTOR_NM'), width: '138', styleName: 'text-center' }, // 계약자 정보-계약자명
    { fieldName: 'cstNo',
      header: t('MSG_TXT_BZ_RRNO'),
      width: '160',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        // 사업자번호 3-2-5 형식으로 표시
        if (!isEmpty(value) && value.length === 10) {
          return `${value.substr(0, 3)}-${value.substr(3, 2)}-${value.substr(5, 5)}`;
        }
        if (!isEmpty(value) && value.length === 8) {
          return stringUtil.getDateFormat(value);
        }
      },
    }, // 계약자 정보-사업/주민번호
    { fieldName: 'adrZip', header: t('MSG_TXT_ZIP'), width: '138', styleName: 'text-center' }, // 계약자 정보-우편번호
    { fieldName: 'cntrCstRnadr', header: t('MSG_TXT_STD_ADDR'), width: '270', styleName: 'text-left' }, // 계약자 정보-기준주소
    { fieldName: 'cntrCstRdadrEncr', header: t('MSG_TXT_DETAIL_ADDR'), width: '230', styleName: 'text-left' }, // 계약자 정보-상세주소
    { fieldName: 'rcgvpKnmEncr', header: t('MSG_TXT_IST_NM'), width: '138', styleName: 'text-center' }, // 설치정보-설치자명
    {
      fieldName: 'shpadrCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
    }, // 설치정보-휴대전화번호
    { fieldName: 'shpadrAdrZip', header: t('MSG_TXT_ZIP'), width: '138', styleName: 'text-center' }, // 설치정보-우편번호
    { fieldName: 'shpadrRnadr', header: t('MSG_TXT_STD_ADDR'), width: '270', styleName: 'text-left' }, // 설치정보-기준주소
    { fieldName: 'shpadrRdadrEncr', header: t('MSG_TXT_DETAIL_ADDR'), width: '230', styleName: 'text-left' }, // 설치정보-상세주소
    { fieldName: 'sellInflwChnlDtlNm', header: t('MSG_TXT_SLS_CAT'), width: '136', styleName: 'text-center' }, // 판매구분
    { fieldName: 'empDvVal', header: t('MSG_TXT_EMPL_DV'), width: '138', styleName: 'text-center' }, // 직원구분
    { fieldName: 'copnDvNm', header: t('MSG_TXT_CNTRT_GBN'), width: '136', styleName: 'text-center' }, // 계약자구분
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
    { fieldName: 'sellAmt', header: t('MSG_TXT_SPLPRC'), width: '134', styleName: 'text-right' }, // 공급가
    { fieldName: 'vat', header: t('MSG_TXT_VAT'), width: '134', styleName: 'text-right' }, // 부가세
    { fieldName: 'cntrAmt', header: t('MSG_TXT_CNTRCT_AMT'), width: '134', styleName: 'text-right' }, // 계약총액
    { fieldName: 'mmBilAmt', header: t('MSG_TXT_MM_BIL_AMT'), width: '134', styleName: 'text-right' }, // 월청구액
    { fieldName: 'pdBaseAmt', header: t('MSG_TXT_PD_NOM_PRC'), width: '134', styleName: 'text-right' }, // 상품정상가격
    { fieldName: 'ackmtPerfRt', header: t('MSG_TXT_ACKMT_PERF_RAT'), width: '136', styleName: 'text-right' }, // 인정실적률(%)
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_ACKMT_PERF_AMT'), width: '136', styleName: 'text-right' }, // 인정실적액
    { fieldName: 'dscMcn', header: t('MSG_TXT_DSC_MCNT'), width: '138', styleName: 'text-center' }, // 할인개월
    { fieldName: 'ctrAmt', header: t('MSG_TXT_DSC_AMT'), width: '138', styleName: 'text-right' }, // 할인금액
    { fieldName: 'svTpNm', header: t('MSG_TXT_USWY_DV'), width: '138', styleName: 'text-center' }, // 용도구분
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
    { fieldName: 'rcpPkgCd', header: t('MSG_TXT_PRDT_CODE'), width: '134', styleName: 'text-center' }, // 패키지코드(상품코드)
    { fieldName: 'rcpPkgNm', header: t('MSG_TXT_PRDT_NM'), width: '274', styleName: 'text-left' }, // 패키지명(상품명)
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
    { fieldName: 'slDtm', header: `${t('MSG_TXT_DY_SL')}${t('MSG_TXT_CNFM_DTM')}`, width: '160', styleName: 'text-center', datetimeFormat: 'datetime' }, // 일매줄확정일시
    { fieldName: 'freSppFshD', header: t('MSG_TXT_EXPN_SPP_D'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 체험배송일
    { fieldName: 'lkCntrDtlNo', header: t('MSG_TXT_CNTR_NO'), width: '180', styleName: 'text-center' }, // 연계정보-계약번호
    { fieldName: 'lkCstKnmEncr', header: t('MSG_TXT_CNTOR_NM'), width: '134', styleName: 'text-center' }, // 연계정보-계약자명
    { fieldName: 'lkPdCd', header: t('MSG_TXT_PRDT_CODE'), width: '134', styleName: 'text-center' }, // 연계정보-상품코드
    { fieldName: 'lkPdNm', header: t('MSG_TXT_PRDT_NM'), width: '274', styleName: 'text-center' }, // 연계정보-상품명
    { fieldName: 'lkIstDt', header: t('MSG_TXT_INST_DT'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 연계정보-설치일
    { fieldName: 'lkIstNmnN', header: t('MSG_TXT_INST_OVER'), width: '134', styleName: 'text-center' }, // 연계정보-설치차월
    { fieldName: 'lkReqdDt', header: t('MSG_TXT_DEM_DT'), width: '134', styleName: 'text-center', datetimeFormat: 'date' }, // 연계정보-철거일자
    { fieldName: 'connPdView', header: t('MSG_TXT_CONN_PD_VIEW'), width: '197', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_CONN_PD_VIEW') },
    { fieldName: 'pmotNm', header: t('MSG_TXT_PMOT_NM'), width: '295', styleName: 'text-left' }, // 프로모션명
    { fieldName: 'pmotTpCd', header: t('MSG_TXT_PMOT_TP'), width: '174', styleName: 'text-left' }, // 프로모션유형
    { fieldName: 'pmotCd', header: t('MSG_TXT_PMOT_CD'), width: '134', styleName: 'text-left' }, // 프로모션 코드
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
<style lang="scss">
.select_og_cd {
  min-width: 185.96px;
  max-width: 33% !important;
}
</style>
