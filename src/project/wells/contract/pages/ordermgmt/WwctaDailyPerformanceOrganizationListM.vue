<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 고객 - 조직별일일실적조회
2. 프로그램 ID : WwctaDailyPerformanceOrganizationListM.vue - 조직별일일실적조회 (K-W-SS-U-0055M01)
3. 작성자 : jeognheon.Lee
4. 작성일 : 2023.07.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
[K-W-SS-U-0055M01]
- 판매 >> 일일영업활동조회 >> 조직별일일실적조회
****************************************************************************************************
#1. 조직별일일실적조회 하는 프로그램
--->
<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['판매관리','영업실적','판매실적','조직별 일일 실적 조회']" />
    </template>
    <kw-search
      :cols="4"
      @search="onClickSearch"
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
          />
        </kw-search-item>
        <!-- 실적기준 -->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_BASE')"
          required
        >
          <kw-option-group
            v-model="fieldParams.performanceStandards"
            type="radio"
            :options="commonCodes.PERF_INQR_BASE_CD"
            rules="required"
          />
        </kw-search-item>
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
      </kw-search-row>
      <kw-search-row>
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
        <!-- 조회구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_INQR_DV')"
        >
          <kw-select
            v-model="fieldParams.viewClassification"
            :options="commonCodes.PERF_INQR_DV_CD"
          />
          <kw-separator
            vertical
            inset
            spaced
          />
          <!-- 05.건 인정 -->
          <kw-search-item
            :label="$t('MSG_TXT_CAS_ACK')"
          >
            <kw-checkbox
              v-model="fieldParams.casesAcknowledged"
            />
          </kw-search-item>
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 판매조직구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_SAL_ORG_CLASS')"
        >
          <kw-select
            v-model="fieldParams.ogTpCd"
            first-option="all"
            first-option-value=""
            :options="commonCodes.OG_TP_CD"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <!-- 엑셀 다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <!-- 10 전체 -->
      <kw-grid
        v-if="fieldParams.viewClassification === '10'"
        ref="grdMainRef"
        view-classification
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
      <!-- 20 Wells399 -->
      <kw-grid
        v-if="fieldParams.viewClassification === '20'"
        ref="grdMainRef"
        view-classification
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain2"
      />
      <!-- 30 포인트플러스 -->
      <kw-grid
        v-if="fieldParams.viewClassification === '30'"
        ref="grdMainRef"
        view-classification
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain3"
      />
      <!-- 40 : 플래너상조제휴 -->
      <kw-grid
        v-if="fieldParams.viewClassification === '40'"
        ref="grdMainRef"
        view-classification
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain4"
      />
      <!-- 50 : 영업부 -->
      <kw-grid
        v-if="fieldParams.viewClassification === '50'"
        ref="grdMainRef"
        view-classification
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain5"
      />
      <!-- 60 : 영업실적/계정순증 -->
      <kw-grid
        v-if="fieldParams.viewClassification === '60'"
        ref="grdMainRef"
        view-classification
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain6"
      />
      <kw-grid
        v-if="isShow"
        ref="grdTotalRef"
        name="grdTotal"
        :visible-rows="10"
        @init="initGrdTotal"
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
// Import & Declaration   useDataService, useMeta,    confirm, notify ,
// isEqual
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, useDataService, useMeta, getComponentType, gridUtil, alert } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { getConfig } = useMeta();
const now = dayjs();
const dataService = useDataService();
const { t } = useI18n();
let cachedParams;
const grdMainRef = ref(getComponentType('KwGrid'));
const grdTotalRef = ref(getComponentType('KwGrid'));
// const totalCount = ref(0);

const { currentRoute } = useRouter();

const fieldParams = ref({
  perStrDt: now.startOf('month').format('YYYYMMDD'), // 실적기간 - 시작일
  perEndDt: now.format('YYYYMMDD'), // 실적기간 - 종료일
  mngerOgAgrgTpCd: '04', // 소속구분

  dgr1LevlOgId: '', // 총괄ID
  dgr2LevlOgId: '', // 지역단ID
  dgr3LevlOgId: '', // 지점ID
  casesAcknowledged: 'N', // 0.5건 인정
  viewClassification: '10', // 조회구분
  performanceStandards: '01', // 실적기준
  ogTpCd: '', //  판매조직구분
});

const commonCodes = await codeUtil.getMultiCodes(
  'MNGER_OG_AGRG_TP_CD', // 매니저조직집계유형코드(소속구분)
  'COD_PAGE_SIZE_OPTIONS',
  'OG_TP_CD', // 판매조직구분코드
  'PERF_INQR_BASE_CD', // 실적기준
  'PERF_INQR_DV_CD', // 조회구분코드
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

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

// 조회 함수
async function fetchData() {
  let res = '';

  if (fieldParams.value.perStrDt.substring(0, 6) !== fieldParams.value.perEndDt.substring(0, 6)) {
    await alert(t('MSG_ALT_SAM_MON')); // 같은 달만 조회 가능합니다.
    return;
  }

  cachedParams = cloneDeep(fieldParams.value);

  res = await dataService.get('/sms/wells/contract/contracts/daily-performance-organization/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: pages, pageInfo: pagingResult } = res.data;
  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(pages);
  // pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  // console.log('codesDgr1Levl.value', codesDgr1Levl.value);
  // 선택한 조직 코드에 해당하는 조직 ID 세팅
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(fieldParams.value);

  await fetchData();
}

// 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(
    '/sms/wells/contract/contracts/daily-performance-organization/excel-download',
    { params: cachedParams },
  );
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdTotal = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_BASE_YM'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '120', styleName: 'text-center', options: codes.SELL_TP_DTL_CD },
    { fieldName: 'agrgCt1', header: t('MSG_TXT_CRDOVR'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt2', header: t('MSG_TXT_INFLW'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt3', header: t('MSG_TXT_EXPIRED'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt4', header: t('MSG_TXT_EXN'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt5', header: t('MSG_TXT_NINC'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt6', header: t('MSG_TXT_SUM'), width: '120', styleName: 'text-right', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });
  view.columnByName('baseYm').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.columnByName('agrgCt1').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt2').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt3').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt4').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt5').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt6').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });

  const layout1 = [
    'baseYm',
    'sellTpCd',
    'sellTpDtlCd',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'agrgCt1',
        'agrgCt2',
        'agrgCt3',
        'agrgCt4',
        'agrgCt5',
        'agrgCt6',
      ],
      header: {
        text: t('MSG_TXT_ACC_IZ'),
      },
    },
  ];
  view.setColumnLayout(layout1);

  view.layoutByColumn('baseYm').summaryUserSpans = [{ colspan: 3 }];
  view.rowIndicator.visible = true;
});

// 선택한 상품분류 배열로 동적 그리드 필드 생성
// 10.전체
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogCd' }, // 소속
    { fieldName: 'prtnrNm' }, // 성명
    { fieldName: 'grpNo' }, // 사번
    { fieldName: 'col4' }, // 빌딩명
    { fieldName: 'goalCnt' }, // 환경가전_목표
    { fieldName: 'dayCnt' }, // 환경가전_일계
    { fieldName: 'sumCnt' }, // 환경가전_누계
    { fieldName: 'trgAchvRt' }, // 환경가전_목표달성률
    { fieldName: 'corpCnt' }, // 법인판매
    { fieldName: 'branchCnt' }, // 지점
    { fieldName: 'optnTrgTot' }, // 종합_가동묙표
    { fieldName: 'optnPplCnt' }, // 종합_가동인원
    { fieldName: 'optnTrgRtTot' }, // 종합_달성률
    { fieldName: 'optnTrgWm' }, // 매니저_가동묙표
    { fieldName: 'optnPplCntWm' }, // 매니저_가동인원
    { fieldName: 'optnTrgRtWm' }, // 매니저_달성률
    { fieldName: 'optnTrgSp' }, // 수석플래너_가동묙표
    { fieldName: 'optnPplCntSp' }, // 수석플래너_가동인원
    { fieldName: 'optnTrgRtSp' }, // 수석플래너_달성률
    { fieldName: 'optnTrgWp' }, // 플래너_가동묙표
    { fieldName: 'optnPplCntWp' }, // 플래너_가동인원
    { fieldName: 'optnTrgRtWp' }, // 플래너_달성률
    { fieldName: 'optnTrgBsfm' }, // BS프리매니저_ 가동묙표
    { fieldName: 'optnPplCntBsfm' }, // BS프리매니저_가동인원
    { fieldName: 'optnTrgRtBsfm' }, // BS프리매니저_달성률
    { fieldName: 'optnTrgFm' }, // 프리매니저_ 가동묙표
    { fieldName: 'optnPplCntFm' }, // 프리매니저_가동인원
    { fieldName: 'optnTrgRtFm' }, // 프리매니저_달성률
    { fieldName: 'optnTrgBr' }, // 지점장개인_ 가동묙표
    { fieldName: 'optnPplCntBr' }, // 지점장개인_가동인원
    { fieldName: 'optnTrgRtBr' }, // 지점장개인_달성률
    { fieldName: 'col32' }, // 전월 총가동
    { fieldName: 'aclActiPplCntWm' }, // 실동_웰스매니저
    { fieldName: 'aclActiPplCntSp' }, // 실동_수석플래너
    { fieldName: 'aclActiPplCntWp' }, // 실동_플래너
    { fieldName: 'aclActiPplCntBsfm' }, // 실동_BS프리매니저
    { fieldName: 'aclCctiPplCntFm' }, // 실동_프리매니저
    { fieldName: 'aclActiPplCntBr' }, // 실동_지점장개인
    { fieldName: 'aclActiPplCnt' }, // 실동_합계
    { fieldName: 'engmPplCnt' }, // 채용인원
    { fieldName: 'optnPplCnt1nmn' }, // 1차월가동
  ];

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' }, // 소속
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-left' }, // 성명
    { fieldName: 'grpNo', header: t('MSG_TXT_EPNO'), width: '80', styleName: 'text-center' }, // 사번
    { fieldName: 'col4', header: t('MSG_TXT_BLD_NM'), width: '120', styleName: 'text-center' }, // 빌딩명
    { fieldName: 'goalCnt', header: t('MSG_TXT_TRG'), width: '120', styleName: 'text-center' }, // 목표
    { fieldName: 'dayCnt', header: t('MSG_TXT_SUM_DAY'), width: '80', styleName: 'text-right' }, // 일계
    { fieldName: 'sumCnt', header: t('MSG_TXT_AGGS'), width: '200', styleName: 'text-right' }, // 누계
    { fieldName: 'trgAchvRt', header: t('MSG_TXT_GOAL_ACHV_RT'), width: '80', styleName: 'text-right' }, // 목표달성률
    { fieldName: 'corpCnt', header: t('MSG_TXT_CORP_SAL'), width: '80', styleName: 'text-center' }, // 법인판매
    { fieldName: 'branchCnt', header: t('MSG_TXT_BRANCH'), width: '100', styleName: 'text-center' }, // 지점
    { fieldName: 'optnTrgTot', header: t('MSG_TXT_OPER_TGT'), width: '100', styleName: 'text-right' }, // 종합_가동묙표
    { fieldName: 'optnPplCnt', header: t('MSG_TXT_OPTN_PPL'), width: '100', styleName: 'text-right' }, // 종합_가동인원
    { fieldName: 'optnTrgRtTot', header: t('MSG_TXT_ACHV_RATE'), width: '150', styleName: 'text-right' }, // 종합_달성률
    { fieldName: 'optnTrgWm', header: t('MSG_TXT_OPER_TGT'), width: '80', styleName: 'text-right' },
    { fieldName: 'optnPplCntWm', header: t('MSG_TXT_OPTN_PPL'), width: '80', styleName: 'text-right' },
    { fieldName: 'optnTrgRtWm', header: t('MSG_TXT_ACHV_RATE'), width: '150', styleName: 'text-right' },
    { fieldName: 'optnTrgSp', header: t('MSG_TXT_OPER_TGT'), width: '150', styleName: 'text-right' },
    { fieldName: 'optnPplCntSp', header: t('MSG_TXT_OPTN_PPL'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnTrgRtSp', header: t('MSG_TXT_ACHV_RATE'), width: '150', styleName: 'text-right' },
    { fieldName: 'optnTrgWp', header: t('MSG_TXT_OPER_TGT'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnPplCntWp', header: t('MSG_TXT_OPTN_PPL'), width: '150', styleName: 'text-right' },
    { fieldName: 'optnTrgRtWp', header: t('MSG_TXT_ACHV_RATE'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnTrgBsfm', header: t('MSG_TXT_OPER_TGT'), width: '150', styleName: 'text-right' },
    { fieldName: 'optnPplCntBsfm', header: t('MSG_TXT_OPTN_PPL'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnTrgRtBsfm', header: t('MSG_TXT_ACHV_RATE'), width: '150', styleName: 'text-right' },
    { fieldName: 'optnTrgFm', header: t('MSG_TXT_OPER_TGT'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnPplCntFm', header: t('MSG_TXT_OPTN_PPL'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnTrgRtFm', header: t('MSG_TXT_ACHV_RATE'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnTrgBr', header: t('MSG_TXT_OPER_TGT'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnPplCntBr', header: t('MSG_TXT_OPTN_PPL'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnTrgRtBr', header: t('MSG_TXT_ACHV_RATE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col32', header: t('MSG_TXT_TOT_OPER_LST_MON'), width: '100', styleName: 'text-right' }, // 전월 총가동
    { fieldName: 'aclActiPplCntWm', header: t('MSG_TXT_WELLS_MGR'), width: '100', styleName: 'text-right' }, // 실동_웰스매니저
    { fieldName: 'aclActiPplCntSp', header: t('MSG_TXT_TOPMR_PLAR'), width: '100', styleName: 'text-right' }, // 실동_웰스매니저
    { fieldName: 'aclActiPplCntWp', header: t('MSG_TXT_PLAR'), width: '100', styleName: 'text-right' }, // 실동_플래너
    { fieldName: 'aclActiPplCntBsfm', header: t('MSG_TXT_BS_FREE_MGR'), width: '100', styleName: 'text-right' }, // 실동_BS프리매니저
    { fieldName: 'aclCctiPplCntFm', header: t('MSG_TXT_FREE_MGR'), width: '100', styleName: 'text-center' }, // 실동_프리매니저
    { fieldName: 'aclActiPplCntBr', header: t('MSG_TXT_BRCH_MGR_INDIV'), width: '100', styleName: 'text-center' }, // 실동_지점장개인
    { fieldName: 'aclActiPplCnt', header: t('MSG_TXT_SUM'), width: '100', styleName: 'text-right' }, // 실동_합계
    { fieldName: 'engmPplCnt', header: t('MSG_TXT_NUM_PEOP_EMP'), width: '100', styleName: 'text-right' }, // 채용인원
    { fieldName: 'optnPplCnt1nmn', header: t('MSG_TXT_1ST_MON_OPER'), width: '100', styleName: 'text-right' }, // 1차월가동

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;

  view.setColumnLayout([
    // single
    'ogCd', 'prtnrNm', 'grpNo', 'col4',
    {
      header: t('MSG_TXT_ENVR_ELHM'), // 환경가전 colspan title
      direction: 'horizontal', // merge type
      items: ['goalCnt', 'dayCnt', 'sumCnt', 'trgAchvRt'],
    },
    'corpCnt', 'branchCnt',
    {
      header: t('MSG_TXT_OPER_THS_MON'), // 당월가동 colspan title Operation this month
      direction: 'horizontal', // merge type
      items: [
        {
          header: t('MSG_TXT_SYNTH'), // 종합 colspan title
          direction: 'horizontal', // merge type
          items: ['optnTrgTot', 'optnPplCnt', 'optnTrgRtTot'],
        },
        {
          header: t('MSG_TXT_MANAGER'), // 매니저 colspan title
          direction: 'horizontal', // merge type
          items: ['optnTrgWm', 'optnPplCntWm', 'optnTrgRtWm'],
        },
        {
          header: t('MSG_TXT_TOPMR_PLAR'), // 수석플래너 colspan title
          direction: 'horizontal', // merge type
          items: ['optnTrgSp', 'optnPplCntSp', 'optnTrgRtSp'],
        },
        {
          header: t('MSG_TXT_PLAR'), // 플래너 colspan title
          direction: 'horizontal', // merge type
          items: ['optnTrgWp', 'optnPplCntWp', 'optnTrgRtWp'],
        },
        {
          header: t('MSG_TXT_BS_FREE_MGR'), // BS프리매니저 colspan title
          direction: 'horizontal', // merge type
          items: ['optnTrgBsfm', 'optnPplCntBsfm', 'optnTrgRtBsfm'],
        },
        {
          header: t('MSG_TXT_FREE_MGR'), // 프리매니저 colspan title
          direction: 'horizontal', // merge type
          items: ['optnTrgFm', 'optnPplCntFm', 'optnTrgRtFm'],
        },
        {
          header: t('MSG_TXT_BRCH_MGR_INDIV'), // 지점장개인 colspan title
          direction: 'horizontal', // merge type
          items: ['optnTrgBr', 'optnPplCntBr', 'optnTrgRtBr'],
        },
      ],
    },
    'col32',
    {
      header: t('MSG_TXT_SILDONG'), // 실동 colspan title
      direction: 'horizontal', // merge type
      items: ['aclActiPplCntWm', 'aclActiPplCntSp', 'aclActiPplCntWp', 'aclActiPplCntBsfm', 'aclCctiPplCntFm', 'aclActiPplCntBr', 'aclActiPplCnt'],
    },
    'engmPplCnt', 'optnPplCnt1nmn',
  ]);

  view.setFixedOptions({ colCount: 2 });
});

// 20.Wells399
const initGrdMain2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogCd' }, // 소속
    { fieldName: 'prtnrNm' }, // 성명
    { fieldName: 'grpNo' }, // 사번
    { fieldName: 'col4' }, // 빌딩명
    { fieldName: 'w399RntlCnt' }, // 실적
    { fieldName: 'col6' }, // 지평
    { fieldName: 'w399LspyCnt' }, // 실적
    { fieldName: 'col8' }, // 지평
    { fieldName: 'col9' }, // 실적
    { fieldName: 'col10' }, // 지평
  ];

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'grpNo', header: t('MSG_TXT_EPNO'), width: '80', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_BLD_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'w399RntlCnt', header: t('MSG_TXT_PERF'), width: '120', styleName: 'text-right' },
    { fieldName: 'col6', header: t('MSG_TXT_BRNCH_OFFC_AVG'), width: '80', styleName: 'text-right' },
    { fieldName: 'w399LspyCnt', header: t('MSG_TXT_PERF'), width: '200', styleName: 'text-right' },
    { fieldName: 'col8', header: t('MSG_TXT_BRNCH_OFFC_AVG'), width: '80', styleName: 'text-right' },
    { fieldName: 'col9', header: t('MSG_TXT_PERF'), width: '80', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_BRNCH_OFFC_AVG'), width: '100', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;

  view.setColumnLayout([
    // single
    'ogCd', 'prtnrNm', 'grpNo', 'col4',
    {
      header: t('MSG_TXT_CUM_RTL'), // 렌탈누계 colspan title
      direction: 'horizontal', // merge type
      items: ['w399RntlCnt', 'col6'],
    },
    {
      header: t('MSG_TXT_LMP_SUM_PAY'), // 일시불누계 colspan title
      direction: 'horizontal', // merge type
      items: ['w399LspyCnt', 'col8'],
    },
    {
      header: t('MSG_TXT_CUM_TOT'), // 총누계 colspan title
      direction: 'horizontal', // merge type
      items: ['col9', 'col10'],
    },
  ]);

  view.setFixedOptions({ colCount: 2 });
});

// 30.포인트플러스
const initGrdMain3 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogCd' }, // 소속
    { fieldName: 'prtnrNm' }, // 성명
    { fieldName: 'grpNo' }, // 사번
    { fieldName: 'col4' }, // 빌딩명
    { fieldName: 'pp399DayCnt' }, // 399(렌탈)
    { fieldName: 'pp599DayCnt' }, // 599(렌탈)
    { fieldName: 'col7' }, // 합
    { fieldName: 'pp399SumCnt' }, // 399(렌탈)
    { fieldName: 'pp599SumCnt' }, // 599(렌탈)
    { fieldName: 'col10' }, // 합
  ];

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'grpNo', header: t('MSG_TXT_EPNO'), width: '80', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_BLD_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'pp399DayCnt', header: t('MSG_TXT_RTL_399'), width: '120', styleName: 'text-right' },
    { fieldName: 'pp599DayCnt', header: t('MSG_TXT_RTL_599'), width: '80', styleName: 'text-right' },
    { fieldName: 'col7', header: t('MSG_TXT_SUM_TOT'), width: '200', styleName: 'text-right' },
    { fieldName: 'pp399SumCnt', header: t('MSG_TXT_RTL_399'), width: '80', styleName: 'text-right' },
    { fieldName: 'pp599SumCnt', header: t('MSG_TXT_RTL_599'), width: '80', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_SUM_TOT'), width: '100', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;

  view.setColumnLayout([
    // single
    'ogCd', 'prtnrNm', 'grpNo', 'col4',
    {
      header: t('MSG_TXT_POT_PLS_ILG'), // 포인트플러스일계 colspan title
      direction: 'horizontal', // merge type
      items: ['pp399DayCnt', 'pp599DayCnt', 'col7'],
    },
    {
      header: t('MSG_TXT_POT_PLS_CUM'), // 포인트플러스누계 colspan title
      direction: 'horizontal', // merge type
      items: ['pp399SumCnt', 'pp599SumCnt', 'col10'],
    },
  ]);

  view.setFixedOptions({ colCount: 2 });
});

// 40. 플래너상조제휴
const initGrdMain4 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogCd' }, // 소속
    { fieldName: 'prtnrNm' }, // 성명
    { fieldName: 'grpNo' }, // 사번
    { fieldName: 'col4' }, // 빌딩명
    { fieldName: 'pl429DayCnt' }, // 429(렌탈)
    { fieldName: 'pl599DayCnt' }, // 599(렌탈)
    { fieldName: 'col7' }, // 합
    { fieldName: 'pl429SumCnt' }, // 429(렌탈)
    { fieldName: 'pl599SumCnt' }, // 599(렌탈)
    { fieldName: 'col10' }, // 합
  ];

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'grpNo', header: t('MSG_TXT_EPNO'), width: '80', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_BLD_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'pl429DayCnt', header: t('MSG_TXT_RTL_429'), width: '120', styleName: 'text-right' },
    { fieldName: 'pl599DayCnt', header: t('MSG_TXT_RTL_599'), width: '80', styleName: 'text-right' },
    { fieldName: 'col7', header: t('MSG_TXT_SUM_TOT'), width: '200', styleName: 'text-right' },
    { fieldName: 'pl429SumCnt', header: t('MSG_TXT_RTL_429'), width: '80', styleName: 'text-right' },
    { fieldName: 'pl599SumCnt', header: t('MSG_TXT_RTL_599'), width: '80', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_SUM_TOT'), width: '100', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;

  view.setColumnLayout([
    // single
    'ogCd', 'prtnrNm', 'grpNo', 'col4',
    {
      header: t('MSG_TXT_PLN_MTL_AID_HLD_PLN'), // 플래너상조제휴일계 colspan title
      direction: 'horizontal', // merge type
      items: ['pl429DayCnt', 'pl599DayCnt', 'col7'],
    },
    {
      header: t('MSG_TXT_PLN_MTL_AID_PTS_CUM'), // 플래너상조제휴누계 colspan title
      direction: 'horizontal', // merge type
      items: ['pl429SumCnt', 'pl599SumCnt', 'col10'],
    },
  ]);

  view.setFixedOptions({ colCount: 2 });
});

// 50 : 영업부
const initGrdMain5 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogCd' }, // 소속
    { fieldName: 'prtnrNm' }, // 성명
    { fieldName: 'grpNo' }, // 사번
    { fieldName: 'col4' }, // 사번
    { fieldName: 'goalCnt' }, // 환경가전_목표
    { fieldName: 'dayCnt' }, // 환경가전_일계
    { fieldName: 'sumCnt' }, // 환경가전_누계
    { fieldName: 'trgAchvRt' }, // 환경가전_목표달성률
    { fieldName: 'corpCnt' }, // 법인판매
    { fieldName: 'branchCnt' }, // 지점
    { fieldName: 'optnTrgTot' }, // 종합_가동묙표
    { fieldName: 'optnPplCnt' }, // 종합_가동인원
    { fieldName: 'optnTrgRtTot' }, // 종합_달성률
    { fieldName: 'optnTrgWm' }, // 매니저_가동묙표
    { fieldName: 'optnPplCntWm' }, // 매니저_가동인원
    { fieldName: 'optnTrgRtWm' }, // 매니저_달성률
    { fieldName: 'optnTrgSp' }, // 수석플래너_가동묙표
    { fieldName: 'optnPplCntSp' }, // 수석플래너_가동인원
    { fieldName: 'optnTrgRtSp' }, // 수석플래너_달성률
    { fieldName: 'optnTrgWp' }, // 플래너_가동묙표
    { fieldName: 'optnPplCntWp' }, // 플래너_가동인원
    { fieldName: 'optnTrgRtWp' }, // 플래너_달성률
    { fieldName: 'optnTrgBsfm' }, // BS프리매니저_ 가동묙표
    { fieldName: 'optnPplCntBsfm' }, // BS프리매니저_가동인원
    { fieldName: 'optnTrgRtBsfm' }, // BS프리매니저_달성률
    { fieldName: 'optnTrgFm' }, // 프리매니저_ 가동묙표
    { fieldName: 'optnPplCntFm' }, // 프리매니저_가동인원
    { fieldName: 'optnTrgRtFm' }, // 프리매니저_달성률
    { fieldName: 'optnTrgBr' }, // 지점장개인_ 가동묙표
    { fieldName: 'optnPplCntBr' }, // 지점장개인_가동인원
    { fieldName: 'optnTrgRtBr' }, // 지점장개인_달성률
    { fieldName: 'col32' }, // 전월 총가동
    { fieldName: 'aclActiPplCntWm' }, // 실동_웰스매니저
    { fieldName: 'aclActiPplCntSp' }, // 실동_수석플래너
    { fieldName: 'aclActiPplCntWp' }, // 실동_플래너
    { fieldName: 'aclActiPplCntBsfm' }, // 실동_BS프리매니저
    { fieldName: 'aclCctiPplCntFm' }, // 실동_프리매니저
    { fieldName: 'aclActiPplCntBr' }, // 실동_지점장개인
    { fieldName: 'aclActiPplCnt' }, // 실동_합계
    { fieldName: 'engmPplCnt' }, // 채용인원
    { fieldName: 'optnPplCnt1nmn' }, // 1차월가동
  ];

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '120', datetimeFormat: 'date', styleName: 'text-center' }, // 소속
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-left' }, // 성명
    { fieldName: 'grpNo', header: t('MSG_TXT_EPNO'), width: '80', styleName: 'text-center' }, // 사번
    { fieldName: 'col4', header: t('MSG_TXT_BLD_NM'), width: '120', styleName: 'text-center' }, // 빌딩명
    { fieldName: 'goalCnt', header: t('MSG_TXT_TRG'), width: '120', datetimeFormat: 'date', styleName: 'text-right' }, // 목표
    { fieldName: 'dayCnt', header: t('MSG_TXT_SUM_DAY'), width: '80', styleName: 'text-right' }, // 일계
    { fieldName: 'sumCnt', header: t('MSG_TXT_AGGS'), width: '200', styleName: 'text-right' }, // 누계
    { fieldName: 'trgAchvRt', header: t('MSG_TXT_GOAL_ACHV_RT'), width: '80', styleName: 'text-right' }, // 목표달성률
    { fieldName: 'corpCnt', header: t('MSG_TXT_CORP_SAL'), width: '80', styleName: 'text-center' }, // 법인판매
    { fieldName: 'branchCnt', header: t('MSG_TXT_BRANCH'), width: '100', styleName: 'text-center' }, // 지점
    { fieldName: 'optnTrgTot', header: t('MSG_TXT_OPER_TGT'), width: '100', styleName: 'text-right' }, // 종합_가동묙표
    { fieldName: 'optnPplCnt', header: t('MSG_TXT_OPTN_PPL'), width: '100', styleName: 'text-right' }, // 종합_가동인원
    { fieldName: 'optnTrgRtTot', header: t('MSG_TXT_ACHV_RATE'), width: '150', styleName: 'text-left' }, // 종합_달성률
    { fieldName: 'optnTrgWm', header: t('MSG_TXT_OPER_TGT'), width: '80', styleName: 'text-right' },
    { fieldName: 'optnPplCntWm', header: t('MSG_TXT_OPTN_PPL'), width: '80', styleName: 'text-right' },
    { fieldName: 'optnTrgRtWm', header: t('MSG_TXT_ACHV_RATE'), width: '150', styleName: 'text-right' },
    { fieldName: 'optnTrgSp', header: t('MSG_TXT_OPER_TGT'), width: '150', styleName: 'text-right' },
    { fieldName: 'optnPplCntSp', header: t('MSG_TXT_OPTN_PPL'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnTrgRtSp', header: t('MSG_TXT_ACHV_RATE'), width: '150', styleName: 'text-right' },
    { fieldName: 'optnTrgWp', header: t('MSG_TXT_OPER_TGT'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnPplCntWp', header: t('MSG_TXT_OPTN_PPL'), width: '150', styleName: 'text-right' },
    { fieldName: 'optnTrgRtWp', header: t('MSG_TXT_ACHV_RATE'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnTrgBsfm', header: t('MSG_TXT_OPER_TGT'), width: '150', styleName: 'text-right' },
    { fieldName: 'optnPplCntBsfm', header: t('MSG_TXT_OPTN_PPL'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnTrgRtBsfm', header: t('MSG_TXT_ACHV_RATE'), width: '150', styleName: 'text-right' },
    { fieldName: 'optnTrgFm', header: t('MSG_TXT_OPER_TGT'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnPplCntFm', header: t('MSG_TXT_OPTN_PPL'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnTrgRtFm', header: t('MSG_TXT_ACHV_RATE'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnTrgBr', header: t('MSG_TXT_OPER_TGT'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnPplCntBr', header: t('MSG_TXT_OPTN_PPL'), width: '100', styleName: 'text-right' },
    { fieldName: 'optnTrgRtBr', header: t('MSG_TXT_ACHV_RATE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col32', header: t('MSG_TXT_TOT_OPER_LST_MON'), width: '100', styleName: 'text-right' }, // 전월 총가동
    { fieldName: 'aclActiPplCntWm', header: t('MSG_TXT_WELLS_MGR'), width: '100', styleName: 'text-right' }, // 실동_웰스매니저
    { fieldName: 'aclActiPplCntSp', header: t('MSG_TXT_TOPMR_PLAR'), width: '100', styleName: 'text-right' }, // 실동_웰스매니저
    { fieldName: 'aclActiPplCntWp', header: t('MSG_TXT_PLAR'), width: '100', styleName: 'text-right' }, // 실동_플래너
    { fieldName: 'aclActiPplCntBsfm', header: t('MSG_TXT_BS_FREE_MGR'), width: '100', styleName: 'text-right' }, // 실동_BS프리매니저
    { fieldName: 'aclCctiPplCntFm', header: t('MSG_TXT_FREE_MGR'), width: '100', styleName: 'text-right' }, // 실동_프리매니저
    { fieldName: 'aclActiPplCntBr', header: t('MSG_TXT_BRCH_MGR_INDIV'), width: '100', styleName: 'text-right' }, // 실동_지점장개인
    { fieldName: 'aclActiPplCnt', header: t('MSG_TXT_SUM'), width: '100', styleName: 'text-right' }, // 실동_합계
    { fieldName: 'engmPplCnt', header: t('MSG_TXT_NUM_PEOP_EMP'), width: '100', styleName: 'text-right' }, // 채용인원
    { fieldName: 'optnPplCnt1nmn', header: t('MSG_TXT_1ST_MON_OPER'), width: '100', styleName: 'text-right' }, // 1차월가동

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;

  view.setColumnLayout([
    // single
    'ogCd', 'prtnrNm', 'grpNo', 'col4',
    {
      header: t('MSG_TXT_ENVR_ELHM'), // 환경가전 colspan title
      direction: 'horizontal', // merge type
      items: ['goalCnt', 'dayCnt', 'sumCnt', 'trgAchvRt'],
    },
    'corpCnt', 'branchCnt',
    {
      header: t('MSG_TXT_OPER_THS_MON'), // 당월가동 colspan title Operation this month
      direction: 'horizontal', // merge type
      items: [
        {
          header: t('MSG_TXT_SYNTH'), // 종합 colspan title
          direction: 'horizontal', // merge type
          items: ['optnTrgTot', 'optnPplCnt', 'optnTrgRtTot'],
        },
        {
          header: t('MSG_TXT_MANAGER'), // 매니저 colspan title
          direction: 'horizontal', // merge type
          items: ['optnTrgWm', 'optnPplCntWm', 'optnTrgRtWm'],
        },
        {
          header: t('MSG_TXT_TOPMR_PLAR'), // 수석플래너 colspan title
          direction: 'horizontal', // merge type
          items: ['optnTrgSp', 'optnPplCntSp', 'optnTrgRtSp'],
        },
        {
          header: t('MSG_TXT_PLAR'), // 플래너 colspan title
          direction: 'horizontal', // merge type
          items: ['optnTrgWp', 'optnPplCntWp', 'optnTrgRtWp'],
        },
        {
          header: t('MSG_TXT_BS_FREE_MGR'), // BS프리매니저 colspan title
          direction: 'horizontal', // merge type
          items: ['optnTrgBsfm', 'optnPplCntBsfm', 'optnTrgRtBsfm'],
        },
        {
          header: t('MSG_TXT_FREE_MGR'), // 프리매니저 colspan title
          direction: 'horizontal', // merge type
          items: ['optnTrgFm', 'optnPplCntFm', 'optnTrgRtFm'],
        },
        {
          header: t('MSG_TXT_BRCH_MGR_INDIV'), // 지점장개인 colspan title
          direction: 'horizontal', // merge type
          items: ['optnTrgBr', 'optnPplCntBr', 'optnTrgRtBr'],
        },
      ],
    },
    'col32',
    {
      header: t('MSG_TXT_SILDONG'), // 실동 colspan title
      direction: 'horizontal', // merge type
      items: ['aclActiPplCntWm', 'aclActiPplCntSp', 'aclActiPplCntWp', 'aclActiPplCntBsfm', 'aclCctiPplCntFm', 'aclActiPplCntBr', 'aclActiPplCnt'],
    },
    'engmPplCnt', 'optnPplCnt1nmn',
  ]);

  view.setFixedOptions({ colCount: 2 });
});

// 60 : 영업실적/계정순증
const initGrdMain6 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogCd' }, // 소속
    { fieldName: 'prtnrNm' }, // 성명
    { fieldName: 'grpNo' }, // 사번
    { fieldName: 'col4' }, // 사번
    { fieldName: 'goalCnt' }, // 환경가전_목표
    { fieldName: 'dayCnt' }, // 환경가전_일계
    { fieldName: 'sumCnt' }, // 환경가전_누계
    { fieldName: 'trgAchvRt' }, // 환경가전_목표달성률
    { fieldName: 'corpCnt' }, // 법인판매
    { fieldName: 'branchCnt' }, // 지점
    { fieldName: 'col11' }, // 영업실적_운용리스
    { fieldName: 'col12' }, // 영업실적_금융리스
    { fieldName: 'col13' }, // 영업실적_합계
    { fieldName: 'col14' }, // 계정순증_당월신규
    { fieldName: 'col15' }, // 계정순증_전월취소
    { fieldName: 'col16' }, // 계정순증_순증

  ];

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' }, // 소속
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-left' }, // 성명
    { fieldName: 'grpNo', header: t('MSG_TXT_EPNO'), width: '80', styleName: 'text-center' }, // 사번
    { fieldName: 'col4', header: t('MSG_TXT_BLD_NM'), width: '120', styleName: 'text-center' }, // 빌딩명
    { fieldName: 'goalCnt', header: t('MSG_TXT_TRG'), width: '120', styleName: 'text-right' }, // 목표
    { fieldName: 'dayCnt', header: t('MSG_TXT_SUM_DAY'), width: '80', styleName: 'text-right' }, // 일계
    { fieldName: 'sumCnt', header: t('MSG_TXT_AGGS'), width: '200', styleName: 'text-right' }, // 누계
    { fieldName: 'trgAchvRt', header: t('MSG_TXT_GOAL_ACHV_RT'), width: '80', styleName: 'text-right' }, // 목표달성률
    { fieldName: 'corpCnt', header: t('MSG_TXT_CORP_SAL'), width: '80', styleName: 'text-right' }, // 법인판매
    { fieldName: 'branchCnt', header: t('MSG_TXT_BRANCH'), width: '100', styleName: 'text-right' }, // 지점
    { fieldName: 'col11', header: t('MSG_TXT_OP_LEASE'), width: '100', styleName: 'text-right' }, // 운용리스
    { fieldName: 'col12', header: t('MSG_TXT_FNN_LEASE'), width: '100', styleName: 'text-right' }, // 금융리스
    { fieldName: 'col13', header: t('MSG_TXT_SUM'), width: '150', styleName: 'text-right' }, // 합계
    { fieldName: 'col14', header: t('MSG_TXT_NEW_THIS_MON'), width: '80', styleName: 'text-right' }, // 당월신규
    { fieldName: 'col15', header: t('MSG_TXT_CCL_PRE_MON'), width: '80', styleName: 'text-right' }, // 전월취소
    { fieldName: 'col16', header: t('MSG_TXT_NINC'), width: '150', styleName: 'text-right' }, // 순증

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;

  view.setColumnLayout([
    // single
    'ogCd', 'prtnrNm', 'grpNo', 'col4',
    {
      header: t('MSG_TXT_ENVR_ELHM'), // 환경가전 colspan title
      direction: 'horizontal', // merge type
      items: ['goalCnt', 'dayCnt', 'sumCnt', 'trgAchvRt'],
    },
    'corpCnt', 'branchCnt',
    {
      header: t('MSG_TXT_SAL_PERFO'), // 영업실적 colspan title Operation this month
      direction: 'horizontal', // merge type
      items: ['col11', 'col12', 'col13'],
    },
    {
      header: t('MSG_TXT_ACC_NINC'), // 계정순증 colspan title Operation this month
      direction: 'horizontal', // merge type
      items: ['col14', 'col15', 'col16'],
    },
  ]);

  view.setFixedOptions({ colCount: 2 });
});

</script>
<style scoped>
</style>
