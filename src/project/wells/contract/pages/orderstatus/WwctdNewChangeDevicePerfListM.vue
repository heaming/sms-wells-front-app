<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTD
2. 프로그램 ID : WwctdNewChangeDevicePerfListM - 신규 기변 실적 조회
3. 작성자 : younuk.choi
4. 작성일 : 2023.04.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0063M01] 조직별, 개인별 신규 기변 실적을 조회하는 화면
- 특이사항 1. INFINITE SCROLL
- // TODO : 출력 기능 연결
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_PRD')"
          required
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.perfStrtDt"
            v-model:to="searchParams.perfEndDt"
            :label="$t('MSG_TXT_PERF_PRD')"
            rules="date_range_required"
            @change="onChangePerfDt"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PERF_DV')">
          <kw-option-group
            v-model="searchParams.perfDv"
            type="radio"
            :options="[{ codeId: 'T', codeName: t('MSG_TXT_TOT_ORD') },
                       { codeId: 'S', codeName: t('MSG_TXT_NTOR') }]"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_OPTN_DV')">
          <kw-select
            v-model="searchParams.optnDv"
            :options="codes.OPTN_DV"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
          <kw-select
            v-model="searchParams.inqrDv"
            :options="[{ codeId: '1', codeName: t('MSG_TXT_MANAGEMENT_DEPARTMENT') },
                       { codeId: '2', codeName: t('MSG_TXT_RGNL_GRP') },
                       { codeId: '3', codeName: t('MSG_TXT_BRANCH') },
                       { codeId: '4', codeName: t('MSG_TXT_INDV') }]"
          />
        </kw-search-item>
        <kw-search-item
          colspan="2"
          :label="$t('MSG_TXT_OG_CD')"
        >
          <kw-select
            v-model="searchParams.dgr1LevlOgCd"
            :options="codesDgr1Levl"
            option-value="dgr1LevlOgCd"
            option-label="dgr1LevlOgNm"
            first-option="select"
            :first-option-label="$t('MSG_TXT_GNRDV_CHO')"
            @change="onUpdateDgr1Levl"
          />
          <kw-select
            v-model="searchParams.dgr2LevlOgCd"
            :options="filteredDgr2LevlOgCds"
            option-value="dgr2LevlOgCd"
            option-label="dgr2LevlOgNm"
            first-option="select"
            :first-option-label="$t('MSG_TXT_RGNL_GRP')+ ' ' +$t('MSG_TXT_SELT')"
            @change="onUpdateDgr2Levl"
          />
          <kw-select
            v-model="searchParams.dgr3LevlOgCd"
            :options="filteredDgr3LevlOgCds"
            option-value="dgr3LevlOgCd"
            option-label="dgr3LevlOgNm"
            first-option="select"
            :first-option-label="$t('MSG_TXT_SLCT_BRANCH')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_SELL_OG') + ' ' + $t('MSG_TXT_DIV')">
          <kw-select
            v-model="searchParams.ogTpCd"
            :options="codes.OG_CP_CD"
            first-option="all"
            first-option-value=""
          />
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
        ref="grdMainRef"
        name="grdMain"
        class="mt12"
        :visible-rows="pageInfo.pageSize"
        @init="initGrid"
      />
      <!--
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
      -->
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

  const res = await dataService.get('/sms/wells/contract/contracts/new-machine-changes/paging', { params: { ...cachedParams, ...pageInfo.value } });
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

  const res = await dataService.get('/sms/wells/contract/contracts/new-machine-changes/summary', { params: { ...cachedParams } });
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
  const res = await dataService.get('/sms/wells/contract/contracts/new-machine-changes/excel-download', { params: cachedParams });
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
    { fieldName: 'optnDv' }, // 가동구분
    { fieldName: 'prtnrNm' }, // 이름
    { fieldName: 'ogNm' }, // 소속
    { fieldName: 'prtnrNo' }, // 사번
    { fieldName: 'rsbDvCd' }, // 직책
    { fieldName: 'dgr1LevlOgNm' }, // 총괄단
    { fieldName: 'dgr2LevlOgNm' }, // 지역단
    { fieldName: 'dgr3LevlOgNm' }, // 지점
    { fieldName: 'ogTpCd' }, // 판매조직
    { fieldName: 'newCnt', dataType: 'number' }, // 렌달-신규
    { fieldName: 'reRntlCnt', dataType: 'number' }, // 렌탈 - 재렌탈
    { fieldName: 'reformCnt', dataType: 'number' }, //  렌달 - REFORM
    { fieldName: 'mchnCh1Cnt', dataType: 'number' }, // 렌탈 - 기변1
    { fieldName: 'mchnCh2Cnt', dataType: 'number' }, // 렌탈 - 기변2
    { fieldName: 'rntlTotCnt', dataType: 'number' }, // 렌탈 - 총건수
    { fieldName: 'rntlAckmtCnt', dataType: 'number' }, // 렌탈 - 인정
    { fieldName: 'spayTotCnt', dataType: 'number' }, // 일시불 - 총건수
    { fieldName: 'spayAckmtCnt', dataType: 'number' }, // 일시불 - 인정
    { fieldName: 'totCnt', dataType: 'number' }, // 합계 - 총건수
    { fieldName: 'totAckmtCnt', dataType: 'number' }, // 합계 - 인정
  ];

  const columns = [
    { fieldName: 'optnDv',
      header: { text: t('MSG_TXT_OPTN_DV') },
      width: '100',
      styleName: 'text-center',
      options: codes.OPTN_DV,
      headerSummaries: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_NAME'), width: '120', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrNo',
      header: t('MSG_TXT_EPNO'),
      width: '120',
      styleName: 'text-center',
      options: codes.OPTN_DV,
      headerSummaries: { text: '', styleName: 'text-center' } },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_CRLV'), width: '120', styleName: 'text-center', options: codes.RSB_DV_CD },
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '120', styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '120', styleName: 'text-center' },
    { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_BRANCH'), width: '120', styleName: 'text-center' },
    { fieldName: 'ogTpCd', header: t('MSG_TXT_SELL_OG'), width: '120', styleName: 'text-center', options: codes.OG_CP_CD },
    { fieldName: 'newCnt',
      header: t('MSG_TXT_NEW'),
      width: '96',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(summaryData.value.newCnt);
        },
      } },
    { fieldName: 'reRntlCnt',
      header: t('MSG_TXT_RE_RENTAL'),
      width: '96',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(summaryData.value.reRntlCnt);
        },
      } },
    { fieldName: 'reformCnt',
      header: t('MSG_TXT_RSTL'),
      width: '96',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(summaryData.value.reformCnt);
        },
      } },
    { fieldName: 'mchnCh1Cnt',
      header: `${t('MSG_TXT_CHNG')}1`,
      width: '96',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(summaryData.value.mchnCh1Cnt);
        },
      } },
    { fieldName: 'mchnCh2Cnt',
      header: `${t('MSG_TXT_CHNG')}2`,
      width: '96',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(summaryData.value.mchnCh2Cnt);
        },
      } },
    { fieldName: 'rntlTotCnt',
      header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_COUNT'),
      width: '96',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(summaryData.value.rntlTotCnt);
        },
      } },
    { fieldName: 'rntlAckmtCnt',
      header: t('MSG_TXT_ACKMT'),
      width: '96',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(summaryData.value.rntlAckmtCnt);
        },
      } },
    { fieldName: 'spayTotCnt',
      header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_COUNT'),
      width: '96',
      styleName: 'text-right',
      headerSummary: {
        styleName: 'text-right',
        valueCallback() {
          return Number(summaryData.value.spayTotCnt);
        },
      } },
    { fieldName: 'spayAckmtCnt',
      header: t('MSG_TXT_ACKMT'),
      width: '96',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(summaryData.value.spayAckmtCnt);
        },
      } },
    { fieldName: 'totCnt',
      header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_COUNT'),
      width: '96',
      styleName: 'text-right',
      headerSummary: {
        styleName: 'text-right',
        valueCallback() {
          return Number(summaryData.value.totCnt);
        },
      } },
    { fieldName: 'totAckmtCnt',
      header: t('MSG_TXT_ACKMT'),
      width: '96',
      styleName: 'text-right',
      headerSummary: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(summaryData.value.totAckmtCnt);
        },
      } }, // 20
  ];

  const columnLayout = [
    'optnDv',
    'prtnrNm',
    'ogNm',
    'prtnrNo',
    'rsbDvCd',
    'dgr1LevlOgNm',
    'dgr2LevlOgNm',
    'dgr3LevlOgNm',
    'ogTpCd',
    {
      header: t('MSG_TXT_RENTAL'),
      direction: 'horizontal',
      items: ['newCnt', 'reRntlCnt', 'reformCnt', 'mchnCh1Cnt', 'mchnCh2Cnt', 'rntlTotCnt', 'rntlAckmtCnt'],
    },
    {
      header: t('MSG_TXT_SNGL_PMNT'),
      direction: 'horizontal',
      items: ['spayTotCnt', 'spayAckmtCnt'],
    },
    {
      header: t('MSG_TXT_SUM'),
      direction: 'horizontal',
      items: ['totCnt', 'totAckmtCnt'],
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFixedOptions({ colCount: 3 });
  view.rowIndicator.visible = true;

  view.setColumnLayout(columnLayout);
  view.layoutByColumn('optnDv').summaryUserSpans = [{ colspan: 3 }];
  view.layoutByColumn('prtnrNo').summaryUserSpans = [{ colspan: 6 }];
  // 헤더쪽 합계 행고정, summary
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });

  view.onScrollToBottom = (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      fetchData();
    }
  };
});

</script>

<style scoped>
</style>
