<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteBranchOgListM
3. 작성자 : gs.itsm211 / YS.JEON
4. 작성일 : 2023.11.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 지점 조직 조회
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 실적기간 -->
        <kw-search-item
          :colspan="2"
          :label="$t('MSG_TXT_PERF_PRD')"
          required
        >
          <kw-date-range-picker
            v-model:from="fieldParams.perStrDt"
            v-model:to="fieldParams.perEndDt"
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
            v-model="fieldParams.perfDv"
            type="radio"
            :options="[{ codeId: 'T', codeName: t('MSG_TXT_TOT_ORD') },
                       { codeId: 'S', codeName: t('MSG_TXT_NTOR') }]"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 소속구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_AFF_CSS')"
          required
        >
          <kw-select
            v-model="fieldParams.mngerOgAgrgTpCd"
            first-option-value=""
            :options="commonCodes.MNGER_OG_AGRG_TP_CD"
          />
        </kw-search-item>
        <!-- 조직레벨 -->
        <kw-search-item
          :label="t('MSG_TXT_OG_LEVL')"
          :colspan="2"
        >
          <kw-select
            v-model="fieldParams.dgr1LevlOgId"
            :options="codes.codesDgr1Levl"
            first-option="all"
            first-option-val=""
            option-value="dgr1LevlOgId"
            option-label="dgr1LevlOgNm"
            @update:model-value="onUpdateDgr1Levl(fieldParams.dgr1LevlOgId)"
          />
          <kw-select
            v-model="fieldParams.dgr2LevlOgId"
            :options="codes.codesDgr2Levl"
            first-option="all"
            first-option-val=""
            option-value="dgr2LevlOgId"
            option-label="dgr2LevlOgNm"
            @update:model-value="onUpdateDgr2Levl(fieldParams.dgr2LevlOgId)"
          />
          <kw-select
            v-model="fieldParams.dgr3LevlOgId"
            :options="codes.codesDgr3Levl"
            first-option="all"
            first-option-val=""
            option-value="dgr3LevlOgId"
            option-label="dgr3LevlOgNm"
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
        view-classification
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, useDataService, gridUtil, useMeta /* , notify */ } from 'kw-lib';
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
const fieldParams = ref({
  perStrDt: now.startOf('month').format('YYYYMMDD'), // 실적기간-시작일자
  perEndDt: now.format('YYYYMMDD'), // 실적기간-종료일자
  perfDv: 'T', // 실적구분 (default : 총주문)
  mngerOgAgrgTpCd: '04', // 소속구분
  dgr1LevlOgId: '', // 조직코드-총괄단
  dgr2LevlOgId: '', // 조직코드-지역단
  dgr3LevlOgId: '', // 조직코드-지점
});

const commonCodes = await codeUtil.getMultiCodes(
  'MNGER_OG_AGRG_TP_CD', // 매니저조직집계유형코드(소속구분)
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

commonCodes.OPTN_DV = [
  { codeId: 'O', codeName: t('MSG_TXT_OPTN') },
  { codeId: 'N', codeName: t('MSG_TXT_NOPR') },
];
commonCodes.OG_CP_CD = [
  { codeId: 'W01', codeName: `P${t('MSG_TXT_OG')}` },
  { codeId: 'W02', codeName: `M${t('MSG_TXT_OG')}` },
];

const codes = ref({
  highClass: [],
  middleClass: [],
  middleClassAll: [],
  codesDgr1Levl: [],
  codesDgr1LevlAll: [],
  codesDgr2Levl: [],
  codesDgr2LevlAll: [],
  codesDgr3Levl: [],
  codesDgr3LevlAll: [],
});

const levlOgCodes = ref({
  levl1OgCd: '',
  levl2OgCd: '',
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchCodes() {
  const highCodes = await dataService.get('/sms/wells/contract/product/high-classes');
  const middleCodes = await dataService.get('/sms/wells/contract/product/middle-classes');

  const codesDgr1 = await dataService.get('/sms/wells/contract/partners/general-divisions');
  const codesDgr2 = await dataService.get('/sms/wells/contract/partners/regional-divisions');
  const codesDgr3 = await dataService.get('/sms/wells/contract/partners/branch-divisions');

  const initHighCodes = [];
  const initMiddleCodes = [];

  highCodes.data.forEach((v) => {
    if (!isEmpty(v.pdClsfId)) initHighCodes.push({ codeId: v.pdClsfId, codeName: v.pdClsfNm });
  });

  middleCodes.data.forEach((v) => {
    if (!isEmpty(v.pdClsfId)) {
      initMiddleCodes.push({ codeId: v.pdClsfId, codeName: v.pdClsfNm, hgrPdClsfId: v.hgrPdClsfId });
    }
  });

  Object.assign(codes.value.codesDgr1LevlAll, codesDgr1.data);
  Object.assign(codes.value.codesDgr2LevlAll, codesDgr2.data);
  Object.assign(codes.value.codesDgr3LevlAll, codesDgr3.data);

  Object.assign(codes.value.highClass, initHighCodes);
  Object.assign(codes.value.middleClassAll, initMiddleCodes);

  if (!isEmpty(codes.value.middleClassAll)) {
    Object.assign(codes.value.middleClass, codes.value.middleClassAll);
  }
  if (!isEmpty(codes.value.codesDgr1LevlAll)) {
    Object.assign(codes.value.codesDgr1Levl, codes.value.codesDgr1LevlAll);
  }
  if (!isEmpty(codes.value.codesDgr2LevlAll)) {
    Object.assign(codes.value.codesDgr2Levl, codes.value.codesDgr2LevlAll);
  }
  if (!isEmpty(codes.value.codesDgr3LevlAll)) {
    Object.assign(codes.value.codesDgr3Levl, codes.value.codesDgr3LevlAll);
  }
}

async function onUpdateDgr1Levl(ogId) {
  // 선택한 지역단, 지점 초기화
  fieldParams.value.dgr2LevlOgId = '';
  fieldParams.value.dgr3LevlOgId = '';

  if (!isEmpty(ogId)) {
    levlOgCodes.value.levl1OgCd = codes.value.codesDgr1LevlAll.filter(
      (v) => ogId.includes(v.dgr1LevlOgId),
    )[0].dgr1LevlOgCd;

    let dgr1LevlOgCd = '';
    dgr1LevlOgCd = levlOgCodes.value.levl1OgCd;

    // 지역단 코드 필터링. 선택한 총괄단의 하위 지역단으로 필터링
    codes.value.codesDgr2Levl = codes.value.codesDgr2LevlAll.filter(
      (v) => dgr1LevlOgCd.includes(v.dgr1LevlOgCd),
    );

    codes.value.codesDgr3Levl = codes.value.codesDgr3LevlAll.filter(
      (v) => dgr1LevlOgCd.includes(v.dgr1LevlOgCd),
    );
  } else {
    levlOgCodes.value.levl1OgCd = '';
    levlOgCodes.value.levl2OgCd = '';

    codes.value.codesDgr1Levl = codes.value.codesDgr1LevlAll;
    codes.value.codesDgr2Levl = codes.value.codesDgr2LevlAll;
    codes.value.codesDgr3Levl = codes.value.codesDgr3LevlAll;
  }
}

async function onUpdateDgr2Levl(ogId) {
  // 선택한 지점 초기화
  fieldParams.value.dgr3LevlOgId = '';

  if (!isEmpty(ogId)) {
    levlOgCodes.value.levl2OgCd = codes.value.codesDgr2LevlAll.filter(
      (v) => ogId.includes(v.dgr2LevlOgId),
    )[0].dgr2LevlOgCd;

    let dgr2LevlOgCd = '';
    dgr2LevlOgCd = levlOgCodes.value.levl2OgCd;

    // 지역단 코드 필터링. 선택한 총괄단의 하위 지역단으로 필터링
    codes.value.codesDgr3Levl = codes.value.codesDgr3LevlAll.filter(
      (v) => dgr2LevlOgCd.includes(v.dgr2LevlOgCd),
    );
  } else {
    let dgr1LevlOgCd = '';
    dgr1LevlOgCd = levlOgCodes.value.levl1OgCd;

    levlOgCodes.value.levl2OgCd = '';

    if (!isEmpty(dgr1LevlOgCd)) {
      // 선택한 총괄단 코드로 필터링
      codes.value.codesDgr3Levl = codes.value.codesDgr3LevlAll.filter(
        (v) => dgr1LevlOgCd.includes(v.dgr1LevlOgCd),
      );
    } else {
      codes.value.codesDgr3Levl = codes.value.codesDgr3LevlAll;
    }
  }
}

onMounted(async () => {
  fetchCodes();
});

async function fetchData() {
  let res = '';

  if (fieldParams.value.perStrDt.substring(0, 6) !== fieldParams.value.perEndDt.substring(0, 6)) {
    await alert(t('MSG_ALT_SAM_MON')); // 같은 달만 조회 가능합니다.
    return;
  }

  cachedParams = cloneDeep(fieldParams.value);

  if (isEmpty(cachedParams)) return;

  res = await dataService.get('/sms/wells/contract/contracts/branch-organization-list/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pagingResult } = res.data;
  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();
  dataSource.checkRowStates(false);
  dataSource.addRows(pages);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(fieldParams.value);

  await fetchData();
}

// 초기화버튼 클릭 이벤트
async function onClickReset() {
  grdMainRef.value.getData().clearRows();
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
  cachedParams = cloneDeep(fieldParams.value);

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
  cachedParams.srchAcrsBas = perfDv; // 실적구분
  cachedParams.srchDiv = inqrDv; // 조회구분
  // cachedParams.srchOco = srchOco; // 총괄단
  // cachedParams.srchRgnDan = srchRgnDan; // 지역단
  // cachedParams.srchOprtDiv = srchOprtDiv; // 가동구분

  const args = { searchApiUrl: '/api/v1/sms/wells/contract/contracts/new-machine-changes/oz', ...cachedParams };

  // OZ 레포트 팝업호출
  openReportPopup(
    ozParams.ozrPath,
    ozParams.odiPath,
    JSON.stringify(args),
  );
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'prtnrNm' }, // 성명
    { fieldName: 'ogCd' }, // 소속
    { fieldName: 'branchCnt' }, // 지점
    { fieldName: 'optnPerfCnt' }, // 가동실적
    { fieldName: 'optnBrnchAvg' }, // 가동지평
    { fieldName: 'engmPerfCnt' }, // 채용실적 : 채용 건수
    { fieldName: 'engmBrnchAvg' }, // 채용지평 : 채용 지점 평균 건수
    { fieldName: 'welsMngerEnrlCnt' }, // 웰스매니저재적
    { fieldName: 'welsMngerAclActiCnt' }, // 웰스매니저 실활동
  ];

  const columns = [
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '145', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG_CD'), width: '145', styleName: 'text-center' },
    { fieldName: 'branchCnt', header: t('MSG_TXT_BRANCH'), width: '145', styleName: 'text-right' },
    { fieldName: 'optnPerfCnt', header: t('MSG_TXT_OPTN') + t('MSG_TXT_PERF'), width: '145', styleName: 'text-right' }, // 가동실적
    { fieldName: 'optnBrnchAvg', header: t('MSG_TXT_OPTN') + t('MSG_TXT_BRNCH_OFFC_AVG'), width: '145', styleName: 'text-right' }, // 가동지평
    { fieldName: 'engmPerfCnt', header: t('MSG_TXT_ENGM') + t('MSG_TXT_PERF'), width: '145', styleName: 'text-right' }, // 채용실적
    { fieldName: 'engmBrnchAvg', header: t('MSG_TXT_ENGM') + t('MSG_TXT_BRNCH_OFFC_AVG'), width: '145', styleName: 'text-right' }, // 채용지평
    { fieldName: 'welsMngerEnrlCnt', header: t('MSG_TXT_WELS_MNGER') + t('MSG_TXT_ENRL'), width: '240', styleName: 'text-right' }, // 웰스매니저재적
    { fieldName: 'welsMngerAclActiCnt', header: t('MSG_TXT_WELS_MNGER') + t('MSG_TXT_ACL_ACTI'), width: '239', styleName: 'text-right' }, // 웰스매니저 실활동
  ];

  // const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  const layout1 = [
    'prtnrNm', 'ogCd', 'branchCnt', 'optnPerfCnt', 'optnBrnchAvg', 'engmPerfCnt', 'engmBrnchAvg', 'welsMngerEnrlCnt', 'welsMngerAclActiCnt',
  ];
  view.setColumnLayout(layout1);
});

</script>

<style scoped>
</style>
