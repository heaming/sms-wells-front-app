<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaBranchOrganizationPerformanceM
3. 작성자 : gs.itsm211 / YS.JEON
4. 작성일 : 2023.11.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 지점 조직 조회
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="2"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 실적기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_PRD')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.perfStrtDt"
            v-model:to="searchParams.perfEndDt"
            :label="$t('MSG_TXT_PERF_PRD')"
            rules="date_range_required"
            @change="onChangePerfDt"
          />
        </kw-search-item>

        <!-- 실적기준 -->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_BASE')"
        >
          <kw-option-group
            v-model="searchParams.perfDv"
            type="radio"
            :options="[{ codeId: 'T', codeName: t('MSG_TXT_TOT_ORD') },
                       { codeId: 'S', codeName: t('MSG_TXT_NTOR') }]"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 조직구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_OG_DV')"
          required
        >
          <kw-field-wrap
            rules="required"
            class="equal_division--3"
          >
            <!-- 총괄단 선택 -->
            <kw-select
              v-model="searchParams.dgr1LevlOgCd"
              :options="codesDgr1Levl"
              option-value="dgr1LevlOgCd"
              option-label="dgr1LevlOgNm"
              first-option="select"
              :first-option-label="$t('MSG_TXT_GNRDV_CHO')"
              @change="onUpdateDgr1Levl"
            />
            <!-- 지역단 선택 -->
            <kw-select
              v-model="searchParams.dgr2LevlOgCd"
              :options="filteredDgr2LevlOgCds"
              option-value="dgr2LevlOgCd"
              option-label="dgr2LevlOgNm"
              first-option="select"
              :first-option-label="$t('MSG_TXT_RGNL_GRP')+ ' ' +$t('MSG_TXT_SELT')"
              @change="onUpdateDgr2Levl"
            />
            <!-- 지점 선택 -->
            <kw-select
              v-model="searchParams.dgr3LevlOgCd"
              :options="filteredDgr3LevlOgCds"
              option-value="dgr3LevlOgCd"
              option-label="dgr3LevlOgNm"
              first-option="select"
              :first-option-label="$t('MSG_TXT_SLCT_BRANCH')"
            />
          </kw-field-wrap>
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
        <kw-btn
          v-permission:download
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          icon="download_on"
          dense
          secondary
          :disable="!pageInfo.totalCount"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:print
          :label="$t('MSG_BTN_PRINT')"
          icon="report"
          dense
          :disable="!pageInfo.totalCount"
          @click="onClickPrint"
        />
      </kw-action-top>
      <kw-grid
        :visible-rows="4"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, useDataService, gridUtil, useMeta, stringUtil /* , notify */ } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import { openReportPopup } from '~common/utils/cmPopupUtil';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { getters } = useStore();
const { userName, employeeIDNumber } = getters['meta/getUserInfo'];
const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const now = dayjs();
const searchParams = ref({
  perfStrtDt: now.startOf('month').format('YYYYMMDD'), // 실적기간-시작일자
  perfEndDt: now.format('YYYYMMDD'), // 실적기간-종료일자
  perfDv: 'T', // 실적구분 (default : 총주문)
  optnDv: '', // 가동구분
  inqrDv: '1', // 조회구분 (default : 총괄단)
  dgr1LevlOgCd: '', // 조직코드-총괄단
  dgr2LevlOgCd: '', // 조직코드-지역단
  dgr3LevlOgCd: '', // 조직코드-지점
  ogTpCd: '', // 조직구분
});

const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

codes.OPTN_DV = [
  { codeId: 'O', codeName: t('MSG_TXT_OPTN') },
  { codeId: 'N', codeName: t('MSG_TXT_NOPR') },
];
codes.OG_CP_CD = [
  { codeId: 'W01', codeName: `P${t('MSG_TXT_OG')}` },
  { codeId: 'W02', codeName: `M${t('MSG_TXT_OG')}` },
];

// 조직코드 조회
const codesDgr1Levl = ref([]);
const codesDgr2Levl = ref([]);
const codesDgr3Levl = ref([]);
const filteredDgr2LevlOgCds = ref([]);
const filteredDgr3LevlOgCds = ref([]);

const summaryData = ref({});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// 조직 조회
async function searchOrg(paramDt) {
  const searchOgParams = ref({
    baseYm: isEmpty(paramDt) ? searchParams.value.perfStrtDt : paramDt,
  });

  let res = [];
  res = await dataService.get('/sms/wells/contract/partners/general-divisions', { params: searchOgParams.value }); // 총괄단
  codesDgr1Levl.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/regional-divisions', { params: searchOgParams.value }); // 지역단
  codesDgr2Levl.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/branch-divisions', { params: searchOgParams.value }); // 지점
  codesDgr3Levl.value = res.data;
}

// 시작일 변경 시, 조직 재조회
async function onChangePerfDt(dt) {
  searchOrg(dt[0]);
}

// 조직코드 총괄단 변경 이벤트
async function onUpdateDgr1Levl(selectedValues) {
  // init
  filteredDgr2LevlOgCds.value = [];
  filteredDgr3LevlOgCds.value = [];

  // 지역단 코드 필터링. 선택한 총괄단의 하위 지역단으로 필터링
  filteredDgr2LevlOgCds.value = codesDgr2Levl.value.filter((v) => selectedValues.includes(v.dgr1LevlOgCd));

  // value init
  searchParams.value.dgr2LevlOgCd = '';
  searchParams.value.dgr3LevlOgCd = '';
}

// 조직코드 지역단 변경 이벤트
async function onUpdateDgr2Levl(selectedValues) {
  filteredDgr3LevlOgCds.value = [];

  // 지점 코드 필터링. 선택한 지역단의 하위 지점으로 필터링.
  filteredDgr3LevlOgCds.value = codesDgr3Levl.value.filter((v) => selectedValues.includes(v.dgr2LevlOgCd));

  // value init
  searchParams.value.dgr3LevlOgCd = '';
}

async function fetchData() {
  if (isEmpty(cachedParams)) return;

  const res = await dataService.get('/sms/wells/contract/contracts/branch-organization-performance-list/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();
  dataSource.checkRowStates(false);
  dataSource.addRows(pages);
  dataSource.checkRowStates(true);
}

async function fetchSummaryData() {
  if (isEmpty(cachedParams)) return;

  const res = await dataService.get('/sms/wells/contract/contracts/branch-organization-performance-list/summary', { params: { ...cachedParams } });
  summaryData.value = res.data;
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  // 서버 검색 조건에 ogCd -> ogId 변경(속도개선)
  if (!isEmpty(cachedParams.dgr1LevlOgCd)) {
    const selId = (codesDgr1Levl.value.filter((v) => v.dgr1LevlOgCd === cachedParams.dgr1LevlOgCd))[0].dgr1LevlOgId;
    cachedParams.dgr1LevlOgId = selId;
  }
  if (!isEmpty(cachedParams.dgr2LevlOgCd)) {
    const selId = (codesDgr2Levl.value.filter((v) => v.dgr2LevlOgCd === cachedParams.dgr2LevlOgCd))[0].dgr2LevlOgId;
    cachedParams.dgr2LevlOgId = selId;
  }
  if (!isEmpty(cachedParams.dgr3LevlOgCd)) {
    const selId = (codesDgr3Levl.value.filter((v) => v.dgr3LevlOgCd === cachedParams.dgr3LevlOgCd))[0].dgr3LevlOgId;
    cachedParams.dgr3LevlOgId = selId;
  }

  await fetchSummaryData();
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/branch-organization-performance-list/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickPrint() {
  // OZ 리포트 팝업 파라미터 설정
  const ozParams = {
    ozrPath: '/kstation-w/acrs/newIntmChngAcrsReport.ozr', // 레포트 파일 경로
    odiPath: '',
    args: {},
  };

  // 조회조건 파라미터 추출
  const { perfStrtDt, perfEndDt, dgr1LevlOgCd, dgr2LevlOgCd, optnDv } = cachedParams;
  const dgr1Levl = (codesDgr1Levl.value.filter((v) => v.dgr1LevlOgCd === dgr1LevlOgCd))[0]; // 총괄단
  const dgr2Levl = (codesDgr2Levl.value.filter((v) => v.dgr2LevlOgCd === dgr2LevlOgCd))[0]; // 지역단
  const optnDvFilter = (codes.OPTN_DV.filter((v) => v.codeId === optnDv))[0]; // 가동구분

  const srchOco = isEmpty(dgr1Levl) ? '' : dgr1Levl.dgr1LevlOgNm; // 총괄단
  const srchRgnDan = isEmpty(dgr2Levl) ? '' : dgr2Levl.dgr2LevlOgNm; // 지역단
  const srchOprtDiv = isEmpty(optnDvFilter) ? '' : optnDvFilter.codeName; // 가동구분

  let inqrDv = ''; // 조회구분
  let perfDv = ''; // 실적구분

  switch (cachedParams.inqrDv) { // 조회구분 분기처리
    case '4': // 개인
      ozParams.ozrPath = '/kstation-w/acrs/newIntmChngAcrsPlanerReport.ozr'; // 플래너 레포트 파일
      inqrDv = t('MSG_TXT_INDV');
      break;
    case '3': // 지점
      inqrDv = t('MSG_TXT_BRANCH');
      break;
    case '2': // 지역단
      inqrDv = t('MSG_TXT_RGNL_GRP');
      break;
    default: // 총괄단
      inqrDv = t('MSG_TXT_MANAGEMENT_DEPARTMENT');
      break;
  }

  switch (cachedParams.perfDv) { // 실적구분 분기처리
    case 'T': // 총주문
      perfDv = t('MSG_TXT_TOT_ORD');
      break;
    default: // 순주문
      perfDv = t('MSG_TXT_NTOR');
      break;
  }

  cachedParams.pritChpr = `${userName}(${employeeIDNumber})`; // 출력담당자
  cachedParams.srchAcrsPerd = `${stringUtil.getDateFormat(perfStrtDt)} ~ ${stringUtil.getDateFormat(perfEndDt)}`; // 실적기간
  cachedParams.srchAcrsBas = perfDv; // 실적구분
  cachedParams.srchDiv = inqrDv; // 조회구분
  cachedParams.srchOco = srchOco; // 총괄단
  cachedParams.srchRgnDan = srchRgnDan; // 지역단
  cachedParams.srchOprtDiv = srchOprtDiv; // 가동구분

  // 조회조건 및 리스트 파라미터 설정 (샘플데이터)
  // ozParams.args = { jsondata: {
  //   deptCd: 'B941010', // 소속
  //   bzopNm: 'KimGwonJu', // 성명
  //   bzopNo: '1033699', // 사번
  //   newCnt: 1, // 신규 신규
  //   reRntlCnt: 5, // 신규 재렌탈
  //   rePromLcpCnt: 0, // 신규 팜재렌탈
  //   intmChngCnt1: 0, // 신규 기변1
  //   intmChngCnt2: 5, // 신규 기변2
  //   rcgnCnt: 38, // 신규 인정
  //   lspyTotCnt: 0, // 일시불 총건수
  //   lspyRcgnCnt: 0, // 일시불 인정
  //   sumTotCnt: 0, // 합계 총건수
  //   sumRcgnCnt: 0, // 헙걔 안종
  //   pstnNm: 'asdf', // 직급
  // },

  // pritChpr: `${userName}(${employeeIDNumber})`, // 출력담당자
  // srchAcrsPerd: `${stringUtil.getDateFormat(perfStrtDt)} ~ ${stringUtil.getDateFormat(perfEndDt)}`, // 실적기간
  // srchAcrsBas: perfDv, // 실적구분
  // srchDiv: inqrDv, // 조회구분
  // srchOco, // 총괄단
  // srchRgnDan, // 지역단
  // srchOprtDiv, // 가동구분
  // };

  const args = { searchApiUrl: '/api/v1/sms/wells/contract/contracts/new-machine-changes/oz', ...cachedParams };

  // OZ 레포트 팝업호출
  openReportPopup(
    ozParams.ozrPath,
    ozParams.odiPath,
    JSON.stringify(args),
  );
}

onMounted(async () => {
  await searchOrg();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
  ];

  const columns = [
    { fieldName: 'col1', header: '성명', width: '145', styleName: 'text-center' },
    { fieldName: 'col2', header: '소속코드', width: '145', styleName: 'text-center' },
    { fieldName: 'col3', header: '지점', width: '145', styleName: 'text-right' },
    { fieldName: 'col4', header: '가동실적', width: '145', styleName: 'text-right' },
    { fieldName: 'col5', header: '가동지평', width: '145', styleName: 'text-right' },
    { fieldName: 'col6', header: '채용실적', width: '145', styleName: 'text-right' },
    { fieldName: 'col7', header: '채용자평', width: '145', styleName: 'text-right' },
    { fieldName: 'col8', header: '웰스매니저재적', width: '240', styleName: 'text-right' },
    { fieldName: 'col9', header: '웰스매니저 실활동', width: '239', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '김교원', col2: 'A000000', col3: '11', col4: '67', col5: '60', col6: '17', col7: '1.5', col8: '43', col9: '45' },
    { col1: '김교원', col2: 'A000000', col3: '7', col4: '42', col5: '60', col6: '6', col7: '0.8', col8: '34', col9: '28' },
    { col1: '김교원', col2: 'A000000', col3: '8', col4: '45', col5: '56', col6: '11', col7: '1.3', col8: '38', col9: '31' },
    { col1: '김교원', col2: 'A000000', col3: '7', col4: '47', col5: '67', col6: '12', col7: '1.7', col8: '33', col9: '31' },
  ]);
});

</script>

<style scoped>
</style>
