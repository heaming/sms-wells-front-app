<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 고객 - 조직별통합실적조회
2. 프로그램 ID : WwctaIntegrationPerformanceOrganizationListM.vue - 조직별통합실적조회 (K-W-SS-U-0057M01)
3. 작성자 : jeognheon.Lee
4. 작성일 : 2023.07.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
[K-W-SS-U-0057M01]
- 판매 >> 실적관리 >> 조직별일일접수조회
****************************************************************************************************
#1. 조직별일일접수조회 하는 프로그램
--->
<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['판매관리','실적관리','조직별통합실적조회']" />
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
            :options="[{ codeId: '1', codeName: t('MSG_TXT_TOT_ORD') },
                       { codeId: '2', codeName: t('MSG_TXT_NTOR') }]"
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
      </kw-search-row>

      <!-- 상품군 -->
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_PDGRP')"
          :colspan="2"
        >
          <kw-select
            v-model="fieldParams.pdHclsfId"
            :options="codes.highClass"
            first-option="all"
            first-option-val=""
            @change="onChangeHighClass(fieldParams.pdHclsfId)"
          />
          <kw-select
            v-model="fieldParams.pdMclsfId"
            :options="codes.middleClass"
            first-option="all"
            first-option-val=""
          />
        </kw-search-item>
        <!-- 상품코드 -->
        <kw-search-item :label="t('MSG_TXT_PRDT_CODE')">
          <kw-input
            v-model="fieldParams.basePdCd"
            icon="search"
            :on-click-icon="fetchProduct"
            maxlength="10"
          />
        </kw-search-item>
        <!-- 상품명 -->
        <kw-search-item :label="t('MSG_TXT_PRDT_NM')">
          <kw-input
            v-model="fieldParams.pdNm"
            maxlength="100"
            :on-keydown-no-click="true"
            @keydown.enter="fetchProduct(2)"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="fieldParams.prtnrNo"
            icon="search"
            clearable
            :maxlength="10"
            :on-click-icon="onClickSearchNo"
            :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
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
import { codeUtil, defineGrid, useGlobal, useDataService, useMeta, getComponentType, gridUtil } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

import pdConst from '~sms-common/product/constants/pdConst';

const { modal, alert } = useGlobal();

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
  performanceStandards: '1', // 실적기준
  ogTpCd: '', //  판매조직구분
  pdHclsfId: '', // 상품대분류ID
  pdMclsfId: '', // 상품중분류ID
  basePdCd: '', // 상품코드
  pdNm: '', // 상품명
  prtnrNo: '',
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

async function fetchProduct(gubun) {
  const searchPopupParams = {
    searchType: gubun === 2 ? pdConst.PD_SEARCH_NAME : pdConst.PD_SEARCH_CODE,
    searchValue: gubun === 2 ? fieldParams.value.pdNm : fieldParams.value.basePdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };

  const res = await modal({
    component: 'ZwpdcStandardListP',
    componentProps: searchPopupParams,
  });
  if (res.result && res.payload) {
    fieldParams.value.pdNm = res.payload[0].pdNm;
    fieldParams.value.basePdCd = res.payload[0].pdCd;
  }
}
/*
 *  Event - 번호 검색 아이콘 클릭 이벤트
 */
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: fieldParams.value.perfYm,
      prtnrNo: fieldParams.value.prtnrNo,
      // ogTpCd: 'W03',
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      fieldParams.value.prtnrNo = payload.prtnrNo;
    }
  }
}

function onChangeHighClass(pdId) {
  if (!isEmpty(pdId)) {
    codes.value.middleClass = codes.value.middleClassAll.filter((v) => v.hgrPdClsfId === pdId);
  } else {
    codes.value.middleClass = codes.value.middleClassAll;
  }
  fieldParams.value.pdMclsfId = '';
}

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
  console.log(JSON.stringify(cachedParams));

  res = await dataService.get('/sms/wells/contract/contracts/integration-performance-organization/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: pages, pageInfo: pagingResult } = res.data;
  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }
  // console.log(JSON.stringify(res.data));

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
    '/sms/wells/contract/contracts/integration-performance-organization/excel-download',
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
  console.log('111111= ');
  //

  const columns = [

    { fieldName: 'bzopNm', header: t('MSG_TXT_PTNR_NAME'), width: '100', styleName: 'text-center' }, // 파트너명
    { fieldName: 'orgzCd', header: t('MSG_TXT_BLG_CD'), width: '120', styleName: 'text-center' }, // 소속코드
    { fieldName: 'brncCnt', header: t('MSG_TXT_BRCH_N'), width: '90', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 지점수
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '120', styleName: 'text-center', headerSummary: { text: '합계' } }, // 빌딩명
    { fieldName: 'newCnt', header: t('MSG_TXT_NEW'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, //  신규
    { fieldName: 'reRntlCnt', header: t('MSG_TXT_RE_RENTAL'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, //  재렌탈
    { fieldName: 'intmChngCnt1', header: `${t('MSG_TXT_CHNG')}1`, width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, //  기변1
    { fieldName: 'intmChngCnt2', header: `${t('MSG_TXT_CHNG')}2`, width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, //  기변2
    { fieldName: 'totCnt', header: t('MSG_TXT_TOT_CT'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, //  총건수

    //   지평
    { fieldName: 'totAvgCnt',
      header: t('MSG_TXT_BRNCH_OFFC_AVG'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.0;;;c',
      headerSummary: {
        numberFormat: '#,##0.0;;;c',
        valueCallback: (grid) => Math.floor((grid.getSummary('totCnt', 'sum') / grid.getSummary('brncCnt', 'sum')) * 10) / 10,
      } },

    { fieldName: 'rcgnCnt', header: t('MSG_TXT_PD_ACC_CNT'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, //  인정건수
    //  지평
    { fieldName: 'rcgnAvgCnt',
      header: t('MSG_TXT_BRNCH_OFFC_AVG'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.0;;;c',
      headerSummary: {
        numberFormat: '#,##0.0;;;c',
        valueCallback: (grid) => Math.floor((grid.getSummary('rcgnCnt', 'sum') / grid.getSummary('brncCnt', 'sum')) * 10) / 10,
      } },

    { fieldName: 'rntlRcgnAmt', header: t('MSG_TXT_RENTAL'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 렌탈
    { fieldName: 'lspyRcgnAmt', header: t('MSG_TXT_SNGL_PMNT'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 일시불
    { fieldName: 'totRcgnAmt', header: t('MSG_TXT_ADP'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 합산
    { fieldName: 'rntlAmt', header: t('MSG_TXT_RENTAL'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 렌탈
    { fieldName: 'lspyAmt', header: t('MSG_TXT_SNGL_PMNT'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 일시불
    { fieldName: 'totAmt', header: t('MSG_TXT_ADP'), width: '100', styleName: 'text-right', dataType: 'number', headerSummary: { expression: 'sum', numberFormat: '#,##0' } }, // 합산

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.checkBar.visible = false;

  console.log('111112= ');

  view.setColumnLayout([

    'bzopNm',
    'orgzCd',
    'brncCnt',
    'bldNm',
    {
      header: t('MSG_TXT_COUNT'), // 건수 colspan title
      direction: 'horizontal', // merge type
      items: ['newCnt', 'reRntlCnt', 'intmChngCnt1', 'intmChngCnt2', 'totCnt', 'totAvgCnt', 'rcgnCnt', 'rcgnAvgCnt'],
    },

    {
      header: t('MSG_TXT_PD_ACC_RSLT'), // 인정실적 colspan title
      direction: 'horizontal', // merge type
      items: ['rntlRcgnAmt', 'lspyRcgnAmt', 'totRcgnAmt'],
    },
    {
      header: `${t('MSG_TXT_MCHN_CH_INC')}${t('MSG_TXT_PERF')}`, // 기변포함실적 colspan title
      direction: 'horizontal', // merge type
      items: ['rntlAmt', 'lspyAmt', 'totAmt'],
    },

  ]);

  console.log('111113= ');

  // Header Summary
  view.setHeaderSummaries({ visible: true, items: [{ height: 42 }] });

  view.setFixedOptions({ colCount: 4 });
});

</script>
<style scoped>
</style>
