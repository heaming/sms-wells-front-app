<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteExpirationRstlCstCttAsnMngtM - 만료/재약정 고객대상 컨택 배정관리
3. 작성자 : hyeonjong.ra
4. 작성일 : 2023.04.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 만료/재약정 고객대상 컨택 배정관리(W-SS-U-0010M01)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      ref="srchMainRef"
      cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 처리상세 -->
        <kw-search-item
          :label="$t('MSG_TXT_PROC') + $t('MSG_TXT_DTL')"
        >
          <kw-select
            v-model="searchParams.asnDvCd"
            :options="codes.ASN_DV_CD"
            @change="onChangeAsnDvCd"
          />
        </kw-search-item>
        <!-- 연체개월 -->
        <kw-search-item
          :label="$t('MSG_TXT_DLQ_MCNT')"
        >
          <kw-select
            v-model="searchParams.dlqMcn"
            :options="codes.DLQ_MCN"
            first-option="select"
            :disable="searchParams.asnDvCd === '1'"
          />
          <p>&nbsp;</p>
          <!-- 연체제외 -->
          <kw-checkbox
            v-model="searchParams.dlqYn"
            :label="$t('MSG_TXT_DLQ') + $t('MSG_BTN_EXLD')"
            :disable="searchParams.asnDvCd === '1'"
          />
        </kw-search-item>
        <!-- 조회기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          :colspan="2"
          required
        >
          <kw-select
            v-model="searchParams.srchPeriodGbn"
            :options="codes.SRCH_PERIOD_GBN"
            first-option="select"
            :label="$t('MSG_TXT_LOOKUP_PERIOD')"
            rules="required"
            class="w200"
          />
          <!-- 만료기간 -->
          <kw-date-range-picker
            v-if="searchParams.srchPeriodGbn < 2"
            v-model:from="searchParams.cntrPdEnddtFrom"
            v-model:to="searchParams.cntrPdEnddtTo"
            :label="$t('MSG_TXT_EXN') + $t('MSG_TXT_PRD')"
            rules="date_range_required"
            type="date"
          />
          <!-- 렌탈차월 -->
          <kw-input
            v-else
            v-model="searchParams.istNmnN"
            :label="$t('MSG_TXT_RENTAL_NMN')"
            rules="required"
            type="number"
            maxlength="3"
            class="w240"
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
            v-model:product2-level="searchParams.mcsfVal"
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
            icon="search"
            maxlength="10"
            @click-icon="onClickSelectPdCd"
          />
        </kw-search-item>
        <!-- 상품명 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_NM')"
        >
          <kw-input
            v-model="searchParams.pdNm"
            maxlength="100"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 조직코드 -->
        <kw-search-item
          label="조직코드"
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
        <!-- 자료구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_MTR_DV')"
        >
          <kw-select
            v-model="searchParams.copnDvCd"
            :options="codes.COPN_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 마케팅동의여부 -->
        <kw-search-item
          :label="$t('MSG_TXT_MARKETING') + $t('MSG_TXT_AG_YN')"
        >
          <kw-select
            v-model="searchParams.cstAgYn"
            :options="codes.CST_AG_YN"
            first-option="all"
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
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          :disable="pageInfo.totalCount === 0"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
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
import { useDataService, useGlobal, codeUtil, useMeta, getComponentType, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import ZwpdProductClassificationSelect from '~sms-common/product/pages/standard/components/ZwpdProductClassificationSelect.vue';
import pdConst from '~sms-common/product/constants/pdConst';

const dataService = useDataService();
const { t } = useI18n();
const { getConfig } = useMeta();
const { modal } = useGlobal();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const srchMainRef = ref(getComponentType('KwSearch'));
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 페이징사이즈옵션
  'COPN_DV_CD', // 법인격구분코드
);

// 처리상세구분코드
codes.ASN_DV_CD = [
  {
    codeId: '1',
    codeName: t('MSG_TXT_RENTAL') + t('MSG_TXT_EXN'), // 렌탈만료
  },
  {
    codeId: '2',
    codeName: t('MSG_TXT_RSTL'), // 재약정
  },
];

// 연체개월리스트 (1개월 ~ 6개월, 7개월 이상)
let dlqMcnList = ['1', '2', '3', '4', '5', '6', '7'];
dlqMcnList = dlqMcnList.map((v) => ({ codeId: v, codeName: v === '7' ? `${v}${t('MSG_TXT_MCNT')} ${t('MSG_TXT_MRTN')}` : `${v}${t('MSG_TXT_MCNT')}` }));
codes.DLQ_MCN = dlqMcnList;

// 조회기간구분코드
codes.SRCH_PERIOD_GBN = [
  {
    codeId: '1',
    codeName: t('MSG_TXT_EXP_DT_1'), // 만료일자
  },
  {
    codeId: '2',
    codeName: t('MSG_TXT_RENTAL_NMN'), // 렌탈차월
  },
];

// 마케팅동의여부
codes.CST_AG_YN = [
  {
    codeId: 'Y',
    codeName: t('MSG_TXT_AGREEMENT'), // 동의
  },
  {
    codeId: 'N',
    codeName: t('MSG_TXT_NO_AGRT'), // 동의안함
  },
];

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
  filteredDgr1LevlOgCds.value = codesDgr1Levl.value;
}
getDgrOgInfos();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 조회 파라미터
let cachedParams;
const searchParams = ref({
  asnDvCd: '1',
  dlqMcn: '',
  dlqYn: 'N',
  srchPeriodGbn: '',
  cntrPdEnddtFrom: now.startOf('month').format('YYYYMMDD'),
  cntrPdEnddtTo: now.format('YYYYMMDD'),
  istNmnN: '0',
  hcsfVal: '',
  mcsfVal: '',
  pdCd: '',
  pdNm: '',
  dgr1LevlOgIds: [],
  dgr2LevlOgIds: [],
  dgr3LevlOgIds: [],
  copnDvCd: '',
  cstAgYn: '',
});

// 처리상세 변경 이벤트
async function onChangeAsnDvCd() {
  if (searchParams.value.asnDvCd === '1') {
    searchParams.value.dlqMcn = '';
    searchParams.value.dlqYn = 'N';
  }
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
    // searchParams.value.pdNm = returnPdInfo.payload?.[0].pdNm;
  }
}

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

// 조회
async function fetchData() {
  // 조회 전 필수체크 (페이징사이즈 변경시 필요함.)
  if (!await srchMainRef.value.validate()) { return; }

  const res = await dataService.get('/sms/wells/contract/contracts/renewal-customers/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회 버튼 클릭
async function onClickSearch() {
  // 선택한 조직 코드에 해당하는 조직 ID 세팅
  searchParams.value.dgr1LevlOgIds = codesDgr1Levl.value
    .filter((v) => selectedDgr1LevlOgCds.value.includes(v.dgr1LevlOgCd))
    .map((v) => v.dgr1LevlOgId);
  searchParams.value.dgr2LevlOgIds = codesDgr2Levl.value
    .filter((v) => selectedDgr2LevlOgCds.value.includes(v.dgr2LevlOgCd))
    .map((v) => v.dgr2LevlOgId);
  searchParams.value.dgr3LevlOgIds = codesDgr3Levl.value
    .filter((v) => selectedDgr3LevlOgCds.value.includes(v.dgr3LevlOgCd))
    .map((v) => v.dgr3LevlOgId);

  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

const { currentRoute } = useRouter();

// 엑셀다운로드 버튼 클릭
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/contract/contracts/renewal-customers/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName, // 메뉴명으로 다운로드 엑셀 파일명 세팅
    timePostfix: true, // 엑셀 파일명에 _YYYYMMDDHHMISS 붙여줌
    exportData: res.data, // 현재 그리드에 보여지는 데이터가 아닌 전체 데이터 다운로드 시 사용
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cntrNoSn' }, // [계약상세번호]
    { fieldName: 'cstKnm' }, // [계약자명] 계약자정보
    { fieldName: 'rcgvpKnm' }, // [설치자명] 설치자명
    { fieldName: 'cntrTno' }, // [휴대전화번호] 계약자 휴대폰번호 마스킹
    { fieldName: 'cntrCralLocaraTno' }, // [휴대전화번호1] 계약자 휴대폰번호1
    { fieldName: 'cntrMexnoEncr' }, // [휴대전화번호2] 계약자 휴대폰번호2
    { fieldName: 'cntrCralIdvTno' }, // [휴대전화번호3] 계약자 휴대폰번호3
    { fieldName: 'pdClsfNm' }, // [상품분류] 상품분류(대분류 > 중분류)
    { fieldName: 'pdCd' }, // [상품코드] 상품코드
    { fieldName: 'pdNm' }, // [상품명] 상품명
    { fieldName: 'ogCd' }, // [조직코드] 조직코드(판매자의조직코드)
    { fieldName: 'cstAgYn' }, // [마케팅동의여부] 마케팅동의여부
    { fieldName: 'slRcogDt' }, // [매출일] 매출인식일자
    { fieldName: 'asnDvCd' }, // [배정구분] 배정구분
    { fieldName: 'asnDvNm' }, // [배정구분명] 배정구분명
    { fieldName: 'asnDt' }, // [배정일] 배정일자
    { fieldName: 'canDt' }, // [취소일] 이력시작일시
    { fieldName: 'reqdDt' }, // [철거일] 철거일자
    { fieldName: 'taskNm' }, // [테스크명] 테스크명
    { fieldName: 'psicNo' }, // [담당자사번] 담당자 사번
    { fieldName: 'psicNm' }, // [담당자명] 담당자 명
    { fieldName: 'cttCd' }, // [컨택코드] 컨택코드
    { fieldName: 'cttNm' }, // [컨택명] 컨택명
    { fieldName: 'dgr1LevlOgId' }, // 조회조건: 총괄단 - 조직(1차레벨조직ID)
    { fieldName: 'dgr2LevlOgId' }, // 조회조건: 지역단 - 조직(2차레벨조직ID)
    { fieldName: 'dgr3LevlOgId' }, // 조회조건: 지점 - 조직(3차레벨조직ID)
    { fieldName: 'refPdClsfVal' }, // 상품분류코드 참조키(대분류+중분류가 포함되어 있음 EX) 02001
    { fieldName: 'copnDvCd' }, // 개인법인 구분
    { fieldName: 'cntrPdEnddt' }, // 계약상품종료일자 : 만료일자
    { fieldName: 'istNmnN' }, // 설치차월 : INLTNOMNT
    { fieldName: 'eotDlqAmt' }, // 연체금액-기말연체금액
    { fieldName: 'dlqAcuMcn' }, // 연체개월-연체누적개월수
  ];

  const columns = [
    { fieldName: 'cntrNoSn', header: t('MSG_TXT_CNTR_DTL_NO'), width: '168', styleName: 'text-center' }, // [계약상세번호]
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '120', styleName: 'text-center' }, // [계약자명] 계약자정보
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_IST_NM'), width: '120', styleName: 'text-center' }, // [설치자명] 설치자명
    { fieldName: 'cntrTno', header: t('MSG_TXT_MPNO'), width: '140', styleName: 'text-center' }, // [휴대전화번호] 계약자 휴대폰번호 마스킹
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_CATE'), width: '220' }, // [상품분류] 상품분류(대분류 > 중분류)
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '124', styleName: 'text-center' }, // [상품코드] 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '220' }, // [상품명] 상품명
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '100', styleName: 'text-center' }, // [조직코드] 조직코드(판매자의조직코드)
    { fieldName: 'cstAgYn', header: `${t('MSG_TXT_MARKETING')} ${t('MSG_TXT_AG_YN')}`, width: '120', styleName: 'text-center' }, // [마케팅동의여부] 마케팅동의여부
    { fieldName: 'slRcogDt', header: t('MSG_TXT_DT_OF_SALE'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // [매출일] 매출인식일자
    { fieldName: 'asnDvCd', header: t('MSG_TXT_ASN_DV'), width: '80', styleName: 'text-center' }, // [배정구분] 배정구분
    { fieldName: 'asnDvNm', header: t('MSG_TXT_ASN_DV') + t('MSG_TXT_NM'), width: '120', styleName: 'text-center' }, // [배정구분명] 배정구분명
    { fieldName: 'asnDt', header: t('MSG_TXT_ASND_ON'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // [배정일] 배정일자
    { fieldName: 'canDt', header: t('MSG_TXT_CAN_D'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // [취소일] 이력시작일시
    { fieldName: 'reqdDt', header: t('MSG_TXT_REQD_D'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // [철거일] 철거일자
    { fieldName: 'taskNm', header: t('MSG_TXT_TASK_EN') + t('MSG_TXT_NM'), width: '220' }, // [테스크명] 테스크명
    { fieldName: 'psicNo', header: t('MSG_TXT_CNT_PER'), width: '120', styleName: 'text-center' }, // [담당자사번] 담당자 사번
    { fieldName: 'psicNm', header: t('MSG_TXT_PIC_NM'), width: '120', styleName: 'text-center' }, // [담당자명] 담당자 명
    { fieldName: 'cttCd', header: t('MSG_TXT_CTT_CD'), width: '120', styleName: 'text-center' }, // [컨택코드] 컨택코드
    { fieldName: 'cttNm', header: t('MSG_TXT_CTT') + t('MSG_TXT_NM'), width: '220' }, // [컨택명] 컨택명

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}
</script>

<style lang="scss">
.select_og_cd {
  min-width: 185.96px;
  max-width: 33% !important;
}

</style>
