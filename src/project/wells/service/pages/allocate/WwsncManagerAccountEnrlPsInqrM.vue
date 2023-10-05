<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [K-W-SV-U-0300M01] WwsncManagerAccountEnrlPsInqrM - 매니저 계정 및 재적현황 조회
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.09.08
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
  -
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈', '정보관리', '메뉴구조 확인필요', '매니저 계정 및 재적현황 조회']"
      />
    </template>
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 관리년월 -->
        <kw-search-item :label="t('MSG_TXT_METG')">
          <kw-date-picker
            v-model="searchParams.metgStartDt"
            rules="required"
            :label="t('MSG_TXT_METG')"
            type="month"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>총괄단 집계</h3>
      <kw-action-top>
        <template #left>
          <!-- rev:230420 page-size 제거 -->
          <kw-paging-info :total-count="topGridTotalCount" />
          <!-- rev:230420 page-size 제거 // -->
          <!-- (단위 : 명) -->
          <span class="ml8">({{ t('MSG_TXT_UNIT') }} : {{ t('MSG_TIT_CNT') }})</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="topGridTotalCount === 0"
          @click="onClickTopGridExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdTopRef"
        :visible-rows="10"
        @init="initTopGrid"
      />

      <h3>매니저 계정 및 재적 현황</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="bottomGridTotalCount" />

          <span class="ml8">(단위 : 명)</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="bottomGridTotalCount === 0"
          @click="onClickBottomGridExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdBottomRef"
        :visible-rows="10"
        @init="initBottomGrid"
      />

      <!-- rev:230420 추가 -->
      <!-- rev:231004 집계화면이기에 페이징 처리 삭제 -->
      <!-- <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchMngerAccEnrlPsData"
        /> -->
      <!-- // rev:230420 추가 -->
      <!-- // rev:231004 집계화면이기에 페이징 처리 삭제 -->
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdTopRef = ref(getComponentType('KwGrid'));
const grdBottomRef = ref(getComponentType('KwGrid'));

// const codes = await codeUtil.getMultiCodes(
//   'COD_PAGE_SIZE_OPTIONS',
// );

const searchParams = ref({
  metgStartDt: dayjs().format('YYYYMM'), // 관리년월
});

const topGridTotalCount = ref(0);
const bottomGridTotalCount = ref(0);

let cachedParams;

/** =========================================
 * 총괄단 집계..top grid
**========================================= */
async function fetchGnrdvAgrgData() {
  console.log('fetchGnrdvAgrgData START');
  const res = await dataService.get('/sms/wells/service/manager-acc-enrl-ps-inqr/general-division-agrg', { params: { ...cachedParams } });
  console.log('fetchGnrdvAgrgData res.data >>>', res.data);

  topGridTotalCount.value = res.data.length;

  const view = grdTopRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

/** =========================================
 * 매니저 계정 및 재적 현황..bottom grid
**========================================= */
async function fetchMngerAccEnrlPsData() {
  console.log('fetchMngerAccEnrlPsData START');
  const res = await dataService.get('/sms/wells/service/manager-acc-enrl-ps-inqr/manager-account-enrl-ps', { params: { ...cachedParams } });

  bottomGridTotalCount.value = res.data.length;

  const view = grdBottomRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchGnrdvAgrgData(); // 총괄단 집계
  await fetchMngerAccEnrlPsData(); // 매니저 계정 및 재적 현황
}

/** =========================================
 * 총괄단 집계 엑셀 다운로드
**========================================= */
async function onClickTopGridExcelDownload() {
  console.log('onClickTopGridExcelDownload START');
  const view = grdTopRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: '총괄단 집계',
    timePostfix: true,
  });
}

/** =========================================
 * 매니저 계정 및 재적 현황 엑셀 다운로드
**========================================= */
async function onClickBottomGridExcelDownload() {
  console.log('onClickBottomGridExcelDownload START');
  const view = grdBottomRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: '매니저 계정 및 재적 현황',
    timePostfix: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid: Fetch initial Data.
// -------------------------------------------------------------------------------------------------
// 총괄단 집계
function initTopGrid(data, view) {
  const fields = [
    { fieldName: 'dgr1LevlOgCd' },
    { fieldName: 'dgr2LevlCnt' },
    { fieldName: 'hooPrtnrNm' },
    { fieldName: 'mngCnt' },
    { fieldName: 'realActMngCnt' },
    { fieldName: 'realActJijumCnt' },
    { fieldName: 'actMngCnt' },
    { fieldName: 'noActMngCnt' },
    { fieldName: 'cntAverage' },
    { fieldName: 'recruitCnt' },
    { fieldName: 'allVisitCnt' },
    { fieldName: 'visitCompleteCnt' },
    { fieldName: 'avgAge' },
  ];
  const columns = [
    { fieldName: 'dgr1LevlOgCd', header: '총괄단', width: '100', styleName: 'text-left' }, // 총괄단
    { fieldName: 'dgr2LevlCnt', header: '지역단', width: '100', styleName: 'text-center' }, // 지역단
    { fieldName: 'hooPrtnrNm', header: '총괄단장', width: '100', styleName: 'text-left' }, // 총괄단장
    { fieldName: 'mngCnt', header: '재적계', width: '100', styleName: 'text-right' }, // 재적계
    { fieldName: 'realActMngCnt', header: '실활동 매니저(20계정↑ 완료)', width: '200', styleName: 'text-right' }, // 실활동 매니저(20계정↑ 완료)
    { fieldName: 'realActJijumCnt', header: '실활동 지점장(20계정↑ 완료)', width: '200', styleName: 'text-right' }, // 실활동 지점장(20계정↑ 완료)
    { fieldName: 'actMngCnt', header: '활동 매니저(20계정↓ 완료)', width: '200', styleName: 'text-right' }, // 활동 매니저(20계정↓ 완료)
    { fieldName: 'noActMngCnt', header: '미활동(완료계정 無)', width: '200', styleName: 'text-right' }, // 미활동(완료계정 無)
    { fieldName: 'cntAverage', header: '개인별 평균계정(20계정↑)', width: '200', styleName: 'text-right' }, // 개인별 평균계정(20계정↑)
    { fieldName: 'recruitCnt', header: '채용 필요인원(150계정 기준)', width: '200', styleName: 'text-right' }, // 채용 필요인원(150계정 기준)
    { fieldName: 'allVisitCnt', header: '방문계정', width: '100', styleName: 'text-right' }, // 방문계정
    { fieldName: 'visitCompleteCnt', header: '완료계정', width: '100', styleName: 'text-right' }, // 완료계정
    { fieldName: 'avgAge', header: '웰스매니저 평균연령', width: '100', styleName: 'text-right' }, // 웰스매니저 평균연령
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.header.height += view.header.height + 50;
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
}

// 매니저 계정 및 재적 현황
function initBottomGrid(data, view) {
  const fields = [
    { fieldName: 'dgr1LevlOgCd' },
    { fieldName: 'dgr2LevlOgCd' },
    { fieldName: 'hooPrtnrNm' },
    { fieldName: 'bldNm' },
    { fieldName: 'mngCnt' },
    { fieldName: 'realActMngCnt' },
    { fieldName: 'realActJijumCnt' },
    { fieldName: 'actMngCnt' },
    { fieldName: 'noActMngCnt' },
    { fieldName: 'cntAverage' },
    { fieldName: 'recruitCnt' },
    { fieldName: 'allVisitCnt' },
    { fieldName: 'visitCompleteCnt' },
    { fieldName: 'avgAge' },
  ];

  const columns = [
    { fieldName: 'dgr1LevlOgCd', header: '총괄단', width: '100', styleName: 'text-left' }, // 총괄단
    { fieldName: 'dgr2LevlOgCd', header: '지역단', width: '100', styleName: 'text-center' }, // 지역단
    { fieldName: 'hooPrtnrNm', header: '지역단장', width: '100', styleName: 'text-left' }, // 지역단장
    { fieldName: 'bldNm', header: '사업장', width: '200', styleName: 'text-right' }, //  사업장
    { fieldName: 'mngCnt', header: '재적계', width: '100', styleName: 'text-right' }, // 재적계
    { fieldName: 'realActMngCnt', header: '실활동 매니저(20계정↑ 완료)', width: '200', styleName: 'text-right' }, // 실활동 매니저(20계정↑ 완료)
    { fieldName: 'realActJijumCnt', header: '실활동 지점장(20계정↓ 완료)', width: '200', styleName: 'text-right' }, // 실활동 지점장(20계정↓ 완료)
    { fieldName: 'actMngCnt', header: '활동 매니저(20계정↓ 완료)', width: '200', styleName: 'text-right' }, // 활동 매니저(20계정↓ 완료)
    { fieldName: 'noActMngCnt', header: '미활동(완료계정 無)', width: '200', styleName: 'text-right' }, // 미활동(완료계정 無)
    { fieldName: 'cntAverage', header: '개인별 평균계정(20계정↑)', width: '200', styleName: 'text-right' }, // 개인별 평균계정(20계정↑)
    { fieldName: 'recruitCnt', header: '채용 필요인원(150계정 기준)', width: '100', styleName: 'text-right' }, // 채용 필요인원(150계정 기준)
    { fieldName: 'allVisitCnt', header: '방문계정', width: '100', styleName: 'text-right' }, // 방문계정
    { fieldName: 'visitCompleteCnt', header: '완료계정', width: '100', styleName: 'text-right' }, // 완료계정
    { fieldName: 'avgAge', header: '웰스매니저 평균연령', width: '100', styleName: 'text-right' }, // 웰스매니저 평균연령
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.header.height += view.header.height + 50;
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
}
</script>
