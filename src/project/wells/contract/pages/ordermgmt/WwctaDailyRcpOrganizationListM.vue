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
- 판매 >> 개인영업활동관리 >> 조직별일일접수조회
****************************************************************************************************
#1. 조직별일일접수조회 하는 프로그램
--->
<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['판매관리','개인영업활동관리','조직별일일접수조회']" />
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
        <!-- 조회기준 -->
        <kw-search-item
          :label="$t('MSG_TXT_INQR_BASE')"
        >
          <kw-option-group
            v-model="fieldParams.performanceStandards"
            type="radio"
            :options="[{ codeId: '', codeName: 'None' },
                       { codeId: '2', codeName: t('MSG_TXT_SLS') }]"
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

        <!--
          <kw-search-item :label="$t('MSG_TXT_SELL_OG') + ' ' + $t('MSG_TXT_DIV')">
          <kw-select
            v-model="fieldParams.ogTpCd"
            :options="commonCodes.OG_CP_CD"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item> -->

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

        <!-- 조회구분 -->
        <!-- <kw-search-item
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
          /> -->
        <!-- 05.건 인정 -->
        <!-- <kw-search-item
            :label="$t('MSG_TXT_CAS_ACK')"
          >
            <kw-checkbox
              v-model="fieldParams.casesAcknowledged"
            />
          </kw-search-item>
        </kw-search-item> -->
      </kw-search-row>

      <!-- <kw-search-row>
          판매조직구분
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
      </kw-search-row> -->
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
        ref="grdMainRef"
        view-classification
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
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
  performanceStandards: '', // 실적기준
  ogTpCd: '', //  판매조직구분
});

const commonCodes = await codeUtil.getMultiCodes(
  'MNGER_OG_AGRG_TP_CD', // 매니저조직집계유형코드(소속구분)
  'COD_PAGE_SIZE_OPTIONS',
  'OG_TP_CD', // 판매조직구분코드
  'PERF_INQR_BASE_CD', // 실적기준
  'PERF_INQR_DV_CD', // 조회구분코드
);

commonCodes.OG_CP_CD = [
  { codeId: 'W01', codeName: `P${t('MSG_TXT_OG')}` },
  { codeId: 'W02', codeName: `M${t('MSG_TXT_OG')}` },
];

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
  console.log('20002= ');
  if (fieldParams.value.perStrDt.substring(0, 6) !== fieldParams.value.perEndDt.substring(0, 6)) {
    await alert(t('MSG_ALT_SAM_MON')); // 같은 달만 조회 가능합니다.
    return;
  }

  cachedParams = cloneDeep(fieldParams.value);
  console.log('20003= ');
  res = await dataService.get('/sms/wells/contract/contracts/daily-rcp-organization/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: pages, pageInfo: pagingResult } = res.data;
  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }
  console.log(JSON.stringify(res.data));

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
  console.log('20001= ');
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(fieldParams.value);

  await fetchData();
}

// 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(
    '/sms/wells/contract/contracts/daily-rcp-organization/excel-download',
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
  console.log('111111= ');

  // const fields = [
  //   { fieldName: 'bzopNo' }, // 파트너 사번
  //   { fieldName: 'bzopNm' }, // 파트너명
  //   { fieldName: 'orgzCd' }, // 소속코드
  //   { fieldName: 'brncCnt' }, // 지점수
  //   { fieldName: 'envrDayCnt' }, //  일계
  //   { fieldName: 'envrDayAvgCnt' }, //  일계평균
  //   { fieldName: 'envrTotCnt' }, //  누계
  //   { fieldName: 'envrAvgCnt' }, //  누계평균
  //   { fieldName: 'envrRntlEndSumCnt' }, //  접수 총 건수
  //   { fieldName: 'envrRntlEndHrznCnt' }, //  접수총건수(지평)
  //   { fieldName: 'notAsgnCnt' }, //  미배정 건수
  //   { fieldName: 'akcntRntAgtlAutoCnt' }, //  미배정 삭제(5일경과)
  //   { fieldName: 'akcntRntAgtlReqCnt' }, //  요청삭제
  //   { fieldName: 'envrRntlEndDalyCnt' }, //  접수취소(일계)
  //   { fieldName: 'acptCancAgtlCnt' }, //  접수취소(누계)
  //   { fieldName: 'cancHrznCnt' }, //  취소 지평
  //   { fieldName: 'cancAckdWaitCnt' }, //  취소승인대기건
  // ];

  const columns = [
    { fieldName: 'bzopNo', header: t('MSG_TXT_PRTNR_EMP_NO'), width: '80', styleName: 'text-center' }, // 파트너 사번
    { fieldName: 'bzopNm', header: t('MSG_TXT_PTNR_NAME'), width: '100', styleName: 'text-center' }, // 파트너명
    { fieldName: 'orgzCd', header: t('MSG_TXT_BLG_CD'), width: '120', styleName: 'text-center', headerSummary: { text: '합계' } }, // 소속코드
    { fieldName: 'brncCnt', header: t('MSG_TXT_BRCH_N'), width: '120', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 지점수
    { fieldName: 'envrDayCnt', header: t('MSG_TXT_SUM_DAY'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, //  일계

    //  일계평균
    { fieldName: 'envrDayAvgCnt',
      header: t('MSG_TXT_D_AV'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.0;;;c',
      headerSummary: {
        numberFormat: '#,##0.0;;;c',
        valueCallback: (grid) => Math.floor((grid.getSummary('envrDayCnt', 'sum') / grid.getSummary('brncCnt', 'sum')) * 10) / 10,
      } },
    { fieldName: 'envrTotCnt', header: t('MSG_TXT_AGGS'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, //  누계
    //  누계평균
    { fieldName: 'envrAvgCnt',
      header: t('MSG_TXT_AGGS_AV'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.0;;;c',
      headerSummary: {
        numberFormat: '#,##0.0;;;c',
        valueCallback: (grid) => Math.floor((grid.getSummary('envrTotCnt', 'sum') / grid.getSummary('brncCnt', 'sum')) * 10) / 10,
      } },
    { fieldName: 'envrRntlEndSumCnt', header: `${t('MSG_TXT_RCP')} ${t('MSG_TXT_TOT_CT')}`, width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, //  접수 총 건수
    // 접수총건수(지평)
    { fieldName: 'envrRntlEndHrznCnt',
      header: `${t('MSG_TXT_RCP')} ${t('MSG_TXT_TOT_CT')}   \n    ( ${t('MSG_TXT_BRNCH_OFFC_AVG')} )`,
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.0;;;c',
      headerSummary: {
        numberFormat: '#,##0.0;;;c',
        valueCallback: (grid) => Math.floor((grid.getSummary('envrRntlEndSumCnt', 'sum') / grid.getSummary('brncCnt', 'sum')) * 10) / 10,
      } },

    { fieldName: 'notAsgnCnt', header: `${t('MSG_TXT_NOT_ASN')} ${t('MSG_TXT_COUNT')} `, width: '150', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 미배정 건수
    { fieldName: 'akcntRntAgtlAutoCnt', header: `${t('MSG_TXT_NOT_ASN')} ${t('MSG_TXT_DEL')} \n ( ${t('MSG_TXT_5_DT_PASG')} )`, width: '150', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 미배정 삭제(5일경과)
    { fieldName: 'akcntRntAgtlReqCnt', header: `${t('MSG_TXT_AK')} ${t('MSG_TXT_DEL')}`, width: '150', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 요청삭제
    { fieldName: 'envrRntlEndDalyCnt', header: `${t('MSG_TXT_RCP')} ${t('MSG_TXT_CANCEL')} \n ( ${t('MSG_TXT_SUM_DAY')} )`, width: '150', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 접수취소(일계)
    { fieldName: 'acptCancAgtlCnt', header: `${t('MSG_TXT_RCP')} ${t('MSG_TXT_CANCEL')}  \n ( ${t('MSG_TXT_AGGS')} )`, width: '150', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 접수취소(누계)

    // 취소 지평
    { fieldName: 'cancHrznCnt',
      header: `${t('MSG_TXT_CANCEL')} ${t('MSG_TXT_BRNCH_OFFC_AVG')}`,
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.0;;;c',
      headerSummary: {
        numberFormat: '#,##0.0;;;c',
        valueCallback: (grid) => Math.floor((grid.getSummary('acptCancAgtlCnt', 'sum') / grid.getSummary('brncCnt', 'sum')) * 10) / 10,
      } },

    { fieldName: 'cancAckdWaitCnt', header: `${t('MSG_TXT_CANCEL')} ${t('MSG_TXT_APPR')}  ${t('MSG_TXT_PENDING')}  ${t('MSG_TXT_CNT')}`, width: '150', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 취소승인대기건

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.checkBar.visible = false;

  console.log('111112= ');

  view.setColumnLayout([
    'bzopNo',
    'bzopNm',
    'orgzCd',
    'brncCnt',
    {
      header: t('MSG_TXT_ENVR_ELHM'), // 환경가전 colspan title
      direction: 'horizontal', // merge type
      items: ['envrDayCnt', 'envrDayAvgCnt', 'envrTotCnt', 'envrAvgCnt'],
    },

    'envrRntlEndSumCnt',
    'envrRntlEndHrznCnt',
    'notAsgnCnt',
    'akcntRntAgtlAutoCnt',
    'akcntRntAgtlReqCnt',
    'envrRntlEndDalyCnt',
    'acptCancAgtlCnt',
    'cancHrznCnt',
    'cancAckdWaitCnt',
  ]);

  console.log('111113= ');

  // Header Summary
  view.setHeaderSummaries({ visible: true, items: [{ height: 42 }] });

  view.setFixedOptions({ colCount: 3 });
});

</script>
<style scoped>
</style>
