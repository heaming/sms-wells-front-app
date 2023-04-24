<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaSinglePaymentContractListM - 주문상세조회/관리(일시불-일반조회)
3. 작성자 : jihoon.kim
4. 작성일 : 2023.04.05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0071] - 일시불 상품에 대한 주문 상세내역 (to-be 에서는 통합 주문 상세 내역으로 구현)
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
                     { codeId: '2', codeName: t('MSG_TXT_DT_OF_SALE') },
                     { codeId: '3', codeName: t('MSG_TXT_CAN_D') }]"
          rules="required"
        />
        <span />
        <kw-date-range-picker
          v-model:from="searchParams.strtDt"
          v-model:to="searchParams.endDt"
          rules="date_range_required|date_range_months:1"
        />
      </kw-search-item>
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
          @keydown="onKeyDownSelectCntrNo"
          @click-icon="onClickSelectCntrNo"
          @clear="onClearSelectCntrNo"
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
          rules="max:10|numeric"
          :maxlength="10"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <!-- 상품분류 -->
      <kw-search-item
        :label="$t('MSG_TXT_PRDT_CATE')"
        :colspan="2"
      >
        <zwpd-product-classification-select
          ref="productSelRef"
          v-model:product1-level="searchParams.hcsfVal"
          v-model:product2-level="searchParams.hcsfMcsfVal"
          product1-first-option="select"
          :product1-first-option-label="$t('TXT_MSG_PD_HCLSF_ID') + ' ' + $t('MSG_TXT_SELT')"
          product2-first-option="select"
          :product2-first-option-label="$t('MSG_TXT_PD_MCLSF_ID') + ' ' + $t('MSG_TXT_SELT')"
          search-lvl="2"
        />
      </kw-search-item>
      <!-- 상품코드 -->
      <kw-search-item
        :label="$t('MSG_TXT_PRDT_CODE')"
      >
        <kw-input
          v-model="searchParams.pdCd"
          clearable
          icon="search"
          :maxlength="10"
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
          icon="search"
          :maxlength="100"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <!-- 제휴코드 -->
      <kw-search-item
        :label="$t('MSG_TXT_ALNC_CD')"
      >
        <kw-select
          v-model="searchParams.alncmpCd"
          :options="codes.ALNCMP_CD"
          first-option="all"
          first-option-value=""
        />
      </kw-search-item>
      <!-- 행사코드 -->
      <kw-search-item
        :label="$t('MSG_TXT_EV_CD')"
      >
        <kw-select
          v-model="searchParams.sellEvCd"
          :options="codes.SELL_EV_CD"
          first-option="all"
          first-option-value=""
        />
      </kw-search-item>
      <!-- 기타 -->
      <kw-search-item
        :label="$t('MSG_TXT_ETC')"
      >
        <kw-select
          v-model="searchParams.etcDv"
          :options="[{ codeId: '0', codeName: '없음' },
                     { codeId: '1', codeName: '계약변경' },
                     { codeId: '2', codeName: '무료체험' },
                     { codeId: '3', codeName: '예약판매' }]"
          :model-value="searchParams.etcDv ? searchParams.etcDv : []"
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
          @click-icon="onClickSearchPrtnrNoPopup()"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <!-- 조직코드 -->
      <kw-search-item
        :label="$t('MSG_TXT_OG_CD')"
        :colspan="2"
      >
        <!-- 총괄단 선택 -->
        <kw-select
          v-model="searchParams.dgr1LevlOgId"
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
          v-model="searchParams.dgr2LevlOgId"
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
          v-model="searchParams.dgr3LevlOgId"
          class="select_og_cd"
          :placeholder="$t('MSG_TXT_BRANCH') + ' ' + $t('MSG_TXT_SELT')"
          :options="filteredDgr3LevlOgCds"
          option-value="dgr3LevlOgCd"
          option-label="dgr3LevlOgNm"
          multiple
        />
      </kw-search-item>
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
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="!pageInfo.totalCount"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdSnglPmntContractList"
      name="grdSnglPmntContractList"
      :visible-rows="pageInfo.pageSize"
      @init="initGridSnglPmntContractList"
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
// import { cloneDeep } from 'lodash-es';
import { cloneDeep, isEmpty, uniqBy } from 'lodash-es';
// import ZpdcStandardProductListP from '~sms-common/product/pages/manage/ZpdcStandardProductListP.vue';
import ZwpdProductClassificationSelect from '~sms-common/product/pages/standard/components/ZwpdProductClassificationSelect.vue';
import pdConst from '~sms-common/product/constants/pdConst';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const { alert, modal } = useGlobal();
// const { getConfig } = useMeta();
const { currentRoute } = useRouter();

let cachedParams;
const now = dayjs();
const searchParams = ref({
  prdEnqry: '1', // 기간조회
  strtDt: now.startOf('month').format('YYYYMMDD'), // 시작일자
  endDt: now.format('YYYYMMDD'), // 종료일자
  hcsfVal: '', // 상품분류-대분류
  hcsfMcsfVal: '', // 상품분류-중분류
  pdCd: '', // 상품코드
  pdNm: '', // 상품명
  alncmpCd: '', // 제휴코드
  sellEvCd: '', // 행사코드
  sellPrtnrNo: '', // 파트너코드
  dgr1LevlOgId: [], // 조직코드-총괄단
  dgr2LevlOgId: [], // 조직코드-지역단
  dgr3LevlOgId: [], // 조직코드-지점
  etcDv: [], // 기타
  sellOgTpCd: [], // 조직구분
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  cntrCstNo: '', // 계약고객번호
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
const grdSnglPmntContractList = ref(getComponentType('KwGrid'));

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  res = await dataService.get('/sms/wells/contract/contracts/order-detail-mngt/singlepayments/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: pages, pageInfo: pagingResult } = res.data;
  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }

  pageInfo.value = pagingResult;
  console.log(res.data);

  const view = grdSnglPmntContractList.value.getView();
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
    componentProps: {
      prtnrNo: searchParams.value.sellPrtnrNo,
    },
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
  searchParams.value.dgr2LevlOgId = [];
  searchParams.value.dgr3LevlOgId = [];

  // 지역단 코드 필터링. 선택한 총괄단의 하위 지역단으로 필터링
  filteredDgr2LevlOgCds.value = codesDgr2Levl.value.filter((v) => selectedValues.includes(v.dgr1LevlOgCd));

  // 지점 코드 초기화
  filteredDgr3LevlOgCds.value = [];
}

// 조직코드 지역단 변경 이벤트
async function onUpdateDgr2Levl(selectedValues) {
  // 선택한 지점 초기화
  searchParams.value.dgr3LevlOgId = [];

  // 지점 코드 필터링. 선택한 지역단의 하위 지점으로 필터링.
  filteredDgr3LevlOgCds.value = codesDgr3Levl.value.filter((v) => selectedValues.includes(v.dgr2LevlOgCd));
}

async function onClickSearch() {
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdSnglPmntContractList.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/order-detail-mngt/singlepayments/excel-download', { params: cachedParams });
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
const initGridSnglPmntContractList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약순번
    { fieldName: 'ordrInfoView' }, // 주문정보 보기
    { fieldName: 'cstKnm' }, // 계약자명
    { fieldName: 'copnDvCd' }, // 계약구분
    { fieldName: 'copnDvNm' }, // 고객구분
    { fieldName: 'bzrno' }, // 사업자번호
    { fieldName: 'bryyMmdd' }, // 계약자 생년월일
    { fieldName: 'sexDvCd' }, // 계약자 성별구분코드
    { fieldName: 'rnmno' }, // 주민/사업자번호
    { fieldName: 'rnmnoDvCd' }, // 실명번호구분코드
    { fieldName: 'rnmnoEncr' }, // 실명번호암호화
    { fieldName: 'basePdCd' }, // 상품코드
    { fieldName: 'basePdNm' }, // 상품명
    { fieldName: 'dscApyTpCd' }, // 할인구분
    { fieldName: 'dscApyTpNm' }, // 할인구분명
    { fieldName: 'dscApyDtlCd' }, // 할인유형
    { fieldName: 'dscApyDtlNm' }, // 할인유형명
    { fieldName: 'cntrRcpFshDtm' }, // 접수일
    { fieldName: 'sppDuedt' }, // 예정일
    { fieldName: 'slDt' }, // 매출일
    { fieldName: 'cntrCanDt' }, // 취소일
    { fieldName: 'cpsDt' }, // 보상일
    { fieldName: 'slPasgDt' }, // 매출경과일
    { fieldName: 'slCnfmYn' }, // 매출확정여부
    { fieldName: 'cntrCanRsonCd' }, // 취소유형
    { fieldName: 'canRsonNm' }, // 취소유형명
    { fieldName: 'cntrChDtlRsonCd' }, //  계약변경코드
    { fieldName: 'cntrChDtlRsonNm' }, // 계약변경명
    { fieldName: 'frisuYn' }, // 무료체험여부
    { fieldName: 'freExpnCnfmDtm' }, // 무료체험확정일
    { fieldName: 'cttTpCd' }, // 컨택코드
    { fieldName: 'cttTpNm' }, // 컨택코드명
    { fieldName: 'iostDtlCd' }, // 출고구분
    { fieldName: 'sppIvcCrtDtm' }, // 사은품택배송장출력일
    { fieldName: 'booSellYn' }, // 예약판매여부
    { fieldName: 'cntrTpCd' }, // 계약유형코드
    { fieldName: 'cntrTpNm' }, // 판매유형
    { fieldName: 'sellPrtnrNo' }, // 판매파트너명
    { fieldName: 'fstRgstUsrId' }, // 업무담당자
    { fieldName: 'fstRgstDeptId' }, // 조직코드
    { fieldName: 'rveCd' }, // 수납코드
    { fieldName: 'uswyDv' }, // 용도구분
    { fieldName: 'svPrd' }, // 관리주기
    { fieldName: 'frisuAsPtrmN' }, // 무상A/S기간
    { fieldName: 'frisuBfsvcPtrmN' }, // 무상멤버십개월

    { fieldName: 'alncmpCd' }, // 제휴코드
    { fieldName: 'alncmpNm' }, // 제휴코드명
    { fieldName: 'sellEvCd' }, // 행사코드
    { fieldName: 'sellEvNm' }, // 행사코드명
    { fieldName: 'fnlAmt', dataType: 'number' }, // 총판매금
    { fieldName: 'sellAmt', dataType: 'number' }, // 공급가
    { fieldName: 'vat', dataType: 'number' }, // 부가세
    { fieldName: 'cntrAmt', dataType: 'number' }, // 확정청약금
    { fieldName: 'istmIntAmt', dataType: 'number' }, // 할부이자금액
    { fieldName: 'feeAckmtBaseAmt', dataType: 'number' }, // 수수료
    { fieldName: 'crpUc' }, // 법인미수
    { fieldName: 'totDscAmt', dataType: 'number' }, // 총할인금
    { fieldName: 'feeAckmtCt' }, // 인정건수
    { fieldName: 'ackmtPerfAmt', dataType: 'number' }, // 총인정금
    { fieldName: 'feeAckmtTotAmt', dataType: 'number' }, // 총기준수수료
    { fieldName: 'feeFxamYn' }, // 수수료정액여부
    { fieldName: 'pdSaleFee', dataType: 'number' }, // 판매수수료
    { fieldName: 'cashBlam', dataType: 'number' }, // 현금잔액
    { fieldName: 'istmMcn' }, // 할부개월수
    { fieldName: 'mmIstmAmt', dataType: 'number' }, // 월할부금
    { fieldName: 'istmPcamAmt', dataType: 'number' }, // 총할부금액

    { fieldName: 'cntrCstNo' }, // 고객번호
    { fieldName: 'cntrMpno' }, // 계약자 휴대전화번호
    { fieldName: 'cralLocaraTno' }, // 계약자-휴대지역전화번호
    { fieldName: 'mexnoEncr' }, // 계약자-휴대전화국번호암호화
    { fieldName: 'cralIdvTno' }, // 계약자-휴대개별전화번호
    { fieldName: 'newAdrZip' }, // 계약자 우편번호
    { fieldName: 'rnadr' }, // 계약자 기준주소
    { fieldName: 'rdadr' }, // 계약자 상세주소

    { fieldName: 'rcgvpKnm' }, // 설치자명
    { fieldName: 'istlcMpno' }, // 설치자 휴대전화번호
    { fieldName: 'istlcCralLocaraTno' }, // 설치자-휴대지역전화번호
    { fieldName: 'istlcMexnoEncr' }, // 설치자-휴대전화국번호암호화
    { fieldName: 'istlcCralIdvTno' }, // 설치자-휴대개별전화번호
    { fieldName: 'istlcAdrZip' }, // 설치자 우편번호
    { fieldName: 'istlcAdr' }, // 설치자 기준주소
    { fieldName: 'istlcDadr' }, // 설치자 상세주소
    { fieldName: 'cntrRelDtlNm' }, // 결합구분
    { fieldName: 'alncmpCntrDrmVal' }, // 제휴사계약식별값
    { fieldName: 'alncPrtnrDrmVal' }, // 제휴판매자코드
    { fieldName: 'spcOrdDv' }, // 특별주문구분
    { fieldName: 'sppOrdIvcNo' }, // 송장정보(송장번호)
    { fieldName: 'basePdInfo' }, // 상품명
    { fieldName: 'basePdCd2' }, // 상품코드
    { fieldName: 'pdQty' }, // 상품수량
    { fieldName: 'connPdView' }, // 연계상품 조회
    { fieldName: 'fgptPdNm1' }, // 사은품1
    { fieldName: 'fgptPdNm2' }, // 사은품2
    { fieldName: 'fgptPdNm3' }, // 사은품3
    { fieldName: 'fgptPdNm4' }, // 사은품4
    { fieldName: 'bfsvcBzsDvCd' }, // BS업체구분코드
    { fieldName: 'bfsvcBzsDvNm' }, // BS업체구분코드명
    { fieldName: 'splyBzsDvCd' }, // 조달업체구분코드
    { fieldName: 'splyBzsDvNm' }, // 조달업체구분코드명
    { fieldName: 'cntrCanDtm' }, // 계약취소일시
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '180', styleName: 'text-center rg-button-link', renderer: { type: 'button' } },
    { fieldName: 'ordrInfoView', header: t('MSG_TXT_ODER_INF_VIEW'), width: '130', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_ODER_INF_VIEW') }, // 주문정보 보기
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '138', styleName: 'text-center' },
    { fieldName: 'copnDvNm', header: t('MSG_TXT_CST_DV'), width: '138' },
    { fieldName: 'rnmno', header: `${t('MSG_TXT_RRNO')}/${t('MSG_TXT_ENTRP_NO')}`, width: '160', styleName: 'text-center' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '138', styleName: 'text-center' },
    { fieldName: 'basePdNm', header: t('MSG_TXT_PRDT_NM'), width: '292' },
    { fieldName: 'dscApyTpCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '138', styleName: 'text-center' },
    { fieldName: 'dscApyTpNm', header: `${t('MSG_TXT_PD_DC_CLASS')} ${t('MSG_TXT_NM')}`, width: '138', styleName: 'text-center' },
    { fieldName: 'dscApyDtlCd', header: t('MSG_TXT_DISC_CODE'), width: '138', styleName: 'text-center' },
    { fieldName: 'dscApyDtlNm', header: `${t('MSG_TXT_DISC_CODE')} ${t('MSG_TXT_NM')}`, width: '138', styleName: 'text-center' },

    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_RCP_D'), width: '136', styleName: 'text-center' },
    { fieldName: 'sppDuedt', header: t('MSG_TXT_DUEDT'), width: '136', styleName: 'text-center' },
    { fieldName: 'slDt', header: t('MSG_TXT_DT_OF_SALE'), width: '136', styleName: 'text-center' },
    { fieldName: 'cntrCanDt', header: t('MSG_TXT_CAN_D'), width: '136', styleName: 'text-center' },
    { fieldName: 'cpsDt', header: t('MSG_TXT_COMP_D'), width: '136', styleName: 'text-center' },
    { fieldName: 'slPasgDt', header: t('MSG_TXT_SL_PASG_DT'), width: '136', styleName: 'text-center' },
    { fieldName: 'slCnfmYn', header: t('MSG_TIT_SL_CNFM'), width: '136', styleName: 'text-center' },
    { fieldName: 'cntrTpCd', header: `${t('MSG_TXT_CANCEL')}${t('MSG_TXT_TYPE')}`, width: '136', styleName: 'text-center' },
    { fieldName: 'cntrTpNm', header: `${t('MSG_TXT_CANCEL')}${t('MSG_TXT_TYPE')}${t('MSG_TXT_NM')}`, width: '270', styleName: 'text-center' },
    { fieldName: 'cntrChDtlRsonCd', header: `${t('MSG_TXT_CNTRCT')}${t('MSG_TXT_CH')} ${t('MSG_TXT_TYPE')}`, width: '136', styleName: 'text-center' },
    { fieldName: 'cntrChDtlRsonNm', header: `${t('MSG_TXT_CNTRCT')}${t('MSG_TXT_CH')}${t('MSG_TXT_NM')}`, width: '136', styleName: 'text-center' },
    { fieldName: 'frisuYn', header: t('MSG_TXT_FRE_EXPN_YN'), width: '136', styleName: 'text-center' },
    { fieldName: 'freExpnCnfmDtm', header: `${t('MSG_TXT_PD_DC_CLASS')} ${t('MSG_TXT_DTRM_DATE')}`, width: '136', styleName: 'text-center' },
    { fieldName: 'cttTpCd', header: t('MSG_TXT_CTT_CD'), width: '136', styleName: 'text-center' },
    { fieldName: 'cttTpNm', header: t('MSG_TXT_CTT_CD_NM'), width: '136', styleName: 'text-center' },

    { fieldName: 'alncmpNm', header: t('MSG_TXT_ALNC_CD_NM'), width: '136', styleName: 'text-center' },
    { fieldName: 'sellEvNm', header: `${t('MSG_TXT_EV_CD')} ${t('MSG_TXT_NM')}`, width: '136', styleName: 'text-center' },
    { fieldName: 'fnlAmt', header: `${t('MSG_TXT_COM_TOT')} ${t('MSG_TXT_SALE_PRICE')}`, width: '136', styleName: 'text-right' },
    { fieldName: 'sellAmt', header: t('MSG_TXT_SUPP_PRC'), width: '136', styleName: 'text-right' },
    { fieldName: 'vat', header: t('MSG_TXT_VAT'), width: '136', styleName: 'text-right' },
    { fieldName: 'cntrAmt', header: `${t('MSG_TXT_DTRM')}${t('MSG_TXT_SBSCM')}`, width: '136', styleName: 'text-center' },
    { fieldName: 'feeAckmtBaseAmt', header: t('MSG_TXT_FEE'), width: '138', styleName: 'text-right' },
    { fieldName: 'crpUc', header: t('MSG_TXT_CRP_UC'), width: '138', styleName: 'text-right' },
    { fieldName: 'totDscAmt', header: t('MSG_TXT_TOT_DSC_AMT'), width: '138', styleName: 'text-right' },
    { fieldName: 'feeAckmtCt', header: t('TXT_MSG_ACKMT_CT'), width: '138', styleName: 'text-right' },
    { fieldName: 'ackmtPerfAmt', header: `${t('MSG_TXT_COM_TOT')} ${t('TXT_MSG_ACKMT_AMT')}`, width: '138', styleName: 'text-right' },
    { fieldName: 'feeAckmtTotAmt', header: `${t('MSG_TXT_COM_TOT')} ${t('MSG_TXT_PD_STD_FEE')}`, width: '138', styleName: 'text-right' },
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_PD_FEE_FIX'), width: '138', styleName: 'text-right' },
    { fieldName: 'pdSaleFee', header: t('MSG_TXT_PD_SALE_FEE'), width: '138', styleName: 'text-right' },
    { fieldName: 'cashBlam', header: `${t('MSG_TXT_CASH')}${t('MSG_TXT_BLAM')}`, width: '138', styleName: 'text-right' },
    { fieldName: 'istmMcn', header: t('MSG_TXT_ISTM_MCN'), width: '138', styleName: 'text-right' },
    { fieldName: 'mmIstmAmt', header: t('MSG_TXT_MM_INTAM'), width: '138', styleName: 'text-right' },
    { fieldName: 'istmPcamAmt', header: `${t('MSG_TXT_COM_TOT')} ${t('MSG_TXT_ISTM_AMT')}`, width: '138', styleName: 'text-right' },

    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '138', styleName: 'text-right' },
    {
      fieldName: 'cntrMpno',
      header: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_MPNO')}`,
      width: '160',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cralLocaraTno, mexnoEncr, cralIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(cralLocaraTno) && !isEmpty(mexnoEncr) && !isEmpty(cralIdvTno) ? `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}` : '';
      },
    },
    { fieldName: 'newAdrZip', header: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_ZIP')}`, width: '144', styleName: 'text-right' },
    { fieldName: 'rnadr', header: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_STD_ADDR')}`, width: '312', styleName: 'text-center' },
    { fieldName: 'rdadr', header: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_DETAIL_ADDR')}`, width: '284', styleName: 'text-right' },

    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_IST_NM'), width: '144', styleName: 'text-center' },
    {
      fieldName: 'istlcMpno',
      header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_MPNO')}`,
      width: '160',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { istlcCralLocaraTno, istlcMexnoEncr, istlcCralIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(istlcCralLocaraTno) && !isEmpty(istlcMexnoEncr) && !isEmpty(istlcCralIdvTno) ? `${istlcCralLocaraTno}-${istlcMexnoEncr}-${istlcCralIdvTno}` : '';
      },
    },
    { fieldName: 'istlcAdrZip', header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_ZIP')}`, width: '144', styleName: 'text-center' },
    { fieldName: 'istlcAdr', header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_STD_ADDR')}`, width: '312' },
    { fieldName: 'istlcDadr', header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_DETAIL_ADDR')}`, width: '284' },
    { fieldName: 'cntrRelDtlNm', header: t('MSG_TXT_COMBI_DV'), width: '138', styleName: 'text-center' },
    { fieldName: 'alncmpCd', header: t('MSG_TXT_ALNC_CD'), width: '138', styleName: 'text-center' },
    { fieldName: 'alncPrtnrDrmVal', header: `${t('MSG_TXT_ALNC')}${t('MSG_TXT_SELL_NO')}`, width: '138', styleName: 'text-center' },
    { fieldName: 'spcOrdDv', header: t('MSG_TXT_SPC_ORD_DV'), width: '157', styleName: 'text-center' },
    { fieldName: 'sppOrdIvcNo', header: t('MSG_TXT_IVC_NO'), width: '157', styleName: 'text-center' },

    { fieldName: 'basePdInfo', header: t('MSG_TXT_PRDT_NM'), width: '197' },
    { fieldName: 'basePdCd2', header: t('MSG_TXT_PRDT_CODE'), width: '197' },
    { fieldName: 'pdQty', header: t('MSG_TXT_PRODUCT_QTY'), width: '197' },
    { fieldName: 'connPdView', header: t('MSG_TXT_CONN_PD_VIEW'), width: '197', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_CONN_PD_VIEW') },
    { fieldName: 'fgptPdNm1', header: t('MSG_TXT_FGPT_NM_1'), width: '197', styleName: 'text-center' },
    { fieldName: 'fgptPdNm2', header: t('MSG_TXT_FGPT_NM_2'), width: '197' },
    { fieldName: 'fgptPdNm3', header: t('MSG_TXT_FGPT_NM_3'), width: '197' },
    { fieldName: 'fgptPdNm4', header: t('MSG_TXT_FGPT_NM_4'), width: '197' },
    { fieldName: 'bfsvcBzsDvNm', header: `${t('MSG_TXT_COMP')}${t('MSG_TXT_BS')}${t('MSG_TXT_DIV')}`, width: '197' },
    { fieldName: 'splyBzsDvNm', header: `${t('MSG_TXT_COMP')}${t('MSG_TXT_DIV')}`, width: '197' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const paramCntrNoFull = gridUtil.getCellValue(g, dataRow, 'cntrDtlNo');
    const paramCntrNo = String(paramCntrNoFull).split('-')[0];
    const paramCntrSn = String(paramCntrNoFull).split('-')[1];

    if (['cntrDtlNo'].includes(column)) { // 계약상세(윈도우팝업)
      await modal({ component: 'WwctaOrderDetailP', componentProps: { cntrNo: paramCntrNo, cntrSn: paramCntrSn } });
    } else if (['ordrInfoView'].includes(column)) { // 렌탈 주문정보 상세
      await modal({ component: 'WwctaOrderRentalDtlP', componentProps: { cntrNo: paramCntrNo, cntrSn: paramCntrSn } });
    } else if (['connPdView'].includes(column)) { // 연계상품 리스트 조회
      await alert('연계상품 리스트 팝업 조회');
    }
  };
});
</script>
<style scoped>
</style>
