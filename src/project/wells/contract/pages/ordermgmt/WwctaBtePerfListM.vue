<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaBtePerfListM
3. 작성자 : gs.itdev240
4. 작성일 : 2023.11.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
[K-W-SS-U-0155M01]
- 판매 >> 개인영업활동관리 >> 기간별실적현황
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 영업조직 -->
        <kw-search-item
          :label="$t('MSG_TXT_BZNS_OG')"
        >
          <kw-option-group
            v-model="searchParams.bznsOg"
            type="radio"
            :options="bznsOptions"
            rules="required"
          />
        </kw-search-item>
        <!-- 관리년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.mngtStartDt"
            v-model:to="searchParams.mngtEndDt"
            :label="$t('MSG_TXT_YR_INSTALLATION')"
            :rules="schDataValidation"
            type="month"
          />
        </kw-search-item>
        <!-- 소속 -->
        <kw-search-item
          :label="$t('MSG_TXT_BLG')"
        >
          <kw-select
            v-model="searchParams.blgCd"
            :options="blgOptions"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            :label="$t('MSG_TXT_INP')"
            icon="search"
            clearable
            rules="numeric"
            @click-icon="onClickSearchPntnrNo"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <!-- 조회건수 -->
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <!-- 판매실적조회 (제품군 분류 AS-IS , TO-BE 달라져서 개발 보류) -->
        <!-- <kw-btn
          v-if="sessionUserInfo.employeeIDNumber === '36559'"
          :label="$t('MSG_TXT_SAL_PERF_INQR')"
          color="secondary"
          border-color="secondary"
          text-color="bg-white"
          dense
          @click="onClickProductFamily"
        /> -->
      </kw-action-top>
      <!-- M조직 그리드 -->
      <kw-grid
        v-if="searchParams.bznsOg === 'W02'"
        ref="grdRef"
        view-classification
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />
      <!-- P조직 그리드 -->
      <kw-grid
        v-if="searchParams.bznsOg === 'W01'"
        ref="grdRef"
        view-classification
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid2"
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
import { useDataService, defineGrid, getComponentType, useGlobal, gridUtil, alert, validate } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { modal } = useGlobal();
// const { getUserInfo } = useMeta(); //(제품군 분류 AS-IS , TO-BE 달라져서 개발 보류)
const dataService = useDataService();
const now = dayjs();
const grdRef = ref(getComponentType('KwGrid'));
// const sessionUserInfo = getUserInfo(); //(제품군 분류 AS-IS , TO-BE 달라져서 개발 보류)
let cachedParams;
const { currentRoute } = useRouter();

const bznsOptions = ref([{
  codeId: 'W02',
  codeName: t('MSG_TXT_M_BZNS_OG') }, // M영업조직
{
  codeId: 'W01',
  codeName: t('MSG_TXT_P_BZNS_OG') }]); // P영업조직

const blgOptions = ref([{
  codeId: '1',
  codeName: t('MSG_TXT_MANAGEMENT_DEPARTMENT') }, // 총괄단
{
  codeId: '2',
  codeName: t('MSG_TXT_RGNL_GRP') }, // 지역단
{
  codeId: '3',
  codeName: t('MSG_TXT_BRANCH') }, // 지점
{
  codeId: '4',
  codeName: t('MSG_TXT_INDV') }]); // 개인

const searchParams = ref({
  bznsOg: 'W02', // 영업조직
  mngtStartDt: now.startOf('month').format('YYYYMM'), // 관리년월 시작일
  mngtEndDt: now.format('YYYYMM'), // 관리년월 종료일
  blgCd: '1', // 소속
  prtnrNo: '', // 플래너번호
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// 조회 함수
async function fetchData() {
  let res = '';
  cachedParams = cloneDeep(searchParams.value);

  res = await dataService.get('/sms/wells/contract/byterm-performance/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: pages, pageInfo: pagingResult } = res.data;
  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }

  pageInfo.value = pagingResult;

  const view = grdRef.value.getView();
  view.getDataSource().setRows(pages);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 판매실적 조회 버튼 클릭 이벤트(파트너 검색 팝업)
async function onClickSearchPntnrNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP', // Z-OG-U-0050P01
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

// 제품군별 개인별 판매실적 조회 팝업 호출(제품군 분류 AS-IS , TO-BE 달라져서 개발 보류)
/*
async function onClickProductFamily() {
  await modal({
    component: 'WwctaPrdfIndvPerfListP', // 제품군별 개인별 판매실적 조회 팝업
    componentProps: {
      cntrNo: searchParams.value.cntrNo,
      cntrSn: searchParams.value.cntrSn,
    },
  });
}
*/

// 날짜 선택 벨리데이션
const schDataValidation = async (val, options) => {
  const errors = [];
  errors.push(
    ...(await validate(val, 'date_range_required', options)).errors,
  );
  const monthDiff = dayjs(searchParams.value.mngtStartDt).startOf('month').diff(dayjs(searchParams.value.mngtEndDt).startOf('month'), 'month');

  if (monthDiff <= -24) {
    errors.push(t('MSG_ALT_SEARCH_UNDER_YR', [t('2')])); // 조회기간은 최대 2년 입니다.
  }
  return errors[0] || true;
};

// 조회 버튼 클릭 이벤트
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 엑셀다운로드 버튼 클릭 이벤트
async function onClickExcelDownload() {
  const view = grdRef.value.getView();
  const res = await dataService.get(
    '/sms/wells/contract/byterm-performance/excel-download',
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
// M조직 그리드
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseYm' }, // 관리월
    { fieldName: 'bznsOg' }, // 영업조직
    { fieldName: 'blgCd' }, // 소속코드
    { fieldName: 'blgNm' }, // 소속
    { fieldName: 'plarNo' }, // 플래너 번호
    { fieldName: 'plarNm' }, // 플래너명
    { fieldName: 'pstnDvCd' }, // 직급
    { fieldName: 'bldNm' }, // 빌딩명
    { fieldName: 'brchCnt', dataType: 'number' }, // 지점수
    { fieldName: 'indvEnvrElhmNw', dataType: 'number' }, // 개인실적_환경가전_신규
    { fieldName: 'indvEnvrElhmRernt', dataType: 'number' }, // 개인실적_환경가전_재렌탈
    { fieldName: 'indvEnvrElhmChdvc', dataType: 'number' }, // 개인실적_환경가전_기변
    { fieldName: 'indvEnvrElhmSum', dataType: 'number' }, // 개인실적_환경가전_계
    { fieldName: 'indvEnvrElhmEtc', dataType: 'number' }, // 개인실적_환경가전 외
    { fieldName: 'ogEnvrElhmNw', dataType: 'number' }, // 조직실적_환경가전_신규
    { fieldName: 'ogEnvrElhmRernt', dataType: 'number' }, // 조직실적_환경가전_재렌탈
    { fieldName: 'ogEnvrElhmChdvc', dataType: 'number' }, // 조직실적_환경가전_기변
    { fieldName: 'ogEnvrElhmSum', dataType: 'number' }, // 조직실적_환경가전_계
    { fieldName: 'ogEnvrElhmEtc', dataType: 'number' }, // 조직실적_환경가전 외
    { fieldName: 'blngtWelsMnger', dataType: 'number' }, // 재직_웰스매니저
    { fieldName: 'blngtWelsPlar', dataType: 'number' }, // 재직_웰스플래너
    { fieldName: 'blngtWelsSum', dataType: 'number' }, // 재직_계
    { fieldName: 'aclActiWelsMnger', dataType: 'number' }, // 실활동_웰스매니저
    { fieldName: 'envrElhmOptnWelsMnger', dataType: 'number' }, // 환경가전 가동_웰스매니저
    { fieldName: 'envrElhmOptnWelsPlar', dataType: 'number' }, // 환경가전 가동_웰스플래너
    { fieldName: 'envrElhmOptnWelsSum', dataType: 'number' }, // 환경가전 가동_계
    { fieldName: 'envrElhmAclActiWelsMnger', dataType: 'number' }, // 환경가전 실동_웰스매니저
    { fieldName: 'envrElhmAclActiWelsPlar', dataType: 'number' }, // 환경가전 실동_웰스플래너
    { fieldName: 'envrElhmAclActiWelsSum', dataType: 'number' }, // 환경가전 실동_계
  ];

  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_MONTH'), width: '100', datetimeFormat: 'YYYY-MM', styleName: 'text-center' }, // 관리월
    { fieldName: 'bznsOg', header: t('MSG_TXT_BZNS_OG'), width: '100', styleName: 'text-center' }, // 영업조직
    { fieldName: 'blgCd', header: t('MSG_TXT_BLG_CD'), width: '100', styleName: 'text-center' }, // 소속코드
    { fieldName: 'blgNm', header: t('MSG_TXT_BLG'), width: '130', styleName: 'text-center' }, // 소속
    { fieldName: 'plarNo', header: t('MSG_TXT_PLAR_NO'), width: '100', styleName: 'text-center' }, // 플래너 번호
    { fieldName: 'plarNm', header: t('MSG_TXT_PLAR_NM'), width: '100', styleName: 'text-center' }, // 플래너명
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), width: '80', styleName: 'text-center' }, // 직급
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '150', styleName: 'text-left' }, // 빌딩명
    { fieldName: 'brchCnt', header: t('MSG_TXT_BRCH_N'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 지점수
    { fieldName: 'indvEnvrElhmNw', header: t('MSG_BTN_NEW'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 개인실적_환경가전_신규
    { fieldName: 'indvEnvrElhmRernt', header: t('MSG_TXT_RE_RENTAL'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 개인실적_환경가전_재렌탈
    { fieldName: 'indvEnvrElhmChdvc', header: t('MSG_TXT_CHNG'), width: '100', numberFormat: '#,##0.##', styleName: 'text-left' }, // 개인실적_환경가전_기변
    { fieldName: 'indvEnvrElhmSum', header: t('MSG_TXT_AGG'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 개인실적_환경가전_계
    { fieldName: 'indvEnvrElhmEtc', header: t('MSG_TXT_ENVR_ELHM_EXCP'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 개인실적_환경가전 외
    { fieldName: 'ogEnvrElhmNw', header: t('MSG_BTN_NEW'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 조직실적_환경가전_신규
    { fieldName: 'ogEnvrElhmRernt', header: t('MSG_TXT_RE_RENTAL'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 조직실적_환경가전_재렌탈
    { fieldName: 'ogEnvrElhmChdvc', header: t('MSG_TXT_CHNG'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 조직실적_환경가전_기변
    { fieldName: 'ogEnvrElhmSum', header: t('MSG_TXT_AGG'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 조직실적_환경가전_계
    { fieldName: 'ogEnvrElhmEtc', header: t('MSG_TXT_ENVR_ELHM_EXCP'), width: '100', numberFormat: '#,##0', styleName: 'text-right' }, // 조직실적_환경가전 외
    { fieldName: 'blngtWelsMnger', header: t('MSG_TXT_WELS_MNGER'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 재직_웰스매니저
    { fieldName: 'blngtWelsPlar', header: t('MSG_TXT_WELLS_PLAR'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 재직_웰스플래너
    { fieldName: 'blngtWelsSum', header: t('MSG_TXT_AGG'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 재직_계
    { fieldName: 'aclActiWelsMnger', header: t('MSG_TXT_WELS_MNGER'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 실활동_웰스매니저
    { fieldName: 'envrElhmOptnWelsMnger', header: t('MSG_TXT_WELS_MNGER'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 환경가전 가동_웰스매니저
    { fieldName: 'envrElhmOptnWelsPlar', header: t('MSG_TXT_WELLS_PLAR'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 환경가전 가동_웰스플래너
    { fieldName: 'envrElhmOptnWelsSum', header: t('MSG_TXT_AGG'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 환경가전 가동_계
    { fieldName: 'envrElhmAclActiWelsMnger', header: t('MSG_TXT_WELS_MNGER'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 환경가전 실동_웰스매니저
    { fieldName: 'envrElhmAclActiWelsPlar', header: t('MSG_TXT_WELLS_PLAR'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 환경가전 실동_웰스플래너
    { fieldName: 'envrElhmAclActiWelsSum', header: t('MSG_TXT_AGG'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 환경가전 실동_계
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  view.setColumnLayout([
    // single
    'baseYm', 'bznsOg', 'blgCd', 'blgNm', 'plarNo', 'plarNm', 'pstnDvCd', 'bldNm', 'brchCnt',
    {
      header: t('MSG_TXT_INDV_PERF'), // 개인실적
      direction: 'horizontal', // merge type
      items: [
        {
          header: t('MSG_TXT_ENVR_ELHM'), // 환경가전 colspan title
          direction: 'horizontal', // merge type
          items: ['indvEnvrElhmNw', 'indvEnvrElhmRernt', 'indvEnvrElhmChdvc', 'indvEnvrElhmSum'],
        },
        'indvEnvrElhmEtc',
      ],
    },
    {
      header: t('MSG_TXT_OG_PERF'), // 조직실적
      direction: 'horizontal', // merge type
      items: [
        {
          header: t('MSG_TXT_ENVR_ELHM'), // 환경가전 colspan title
          direction: 'horizontal', // merge type
          items: ['ogEnvrElhmNw', 'ogEnvrElhmRernt', 'ogEnvrElhmChdvc', 'ogEnvrElhmSum'],
        },
        'ogEnvrElhmEtc',
      ],
    },
    {
      header: t('MSG_TXT_BLNG_TO'), // 재직 colspan title
      direction: 'horizontal', // merge type
      items: ['blngtWelsMnger', 'blngtWelsPlar', 'blngtWelsSum'],
    },
    {
      header: t('MSG_TXT_ACL_ACTI'), // 실활동 colspan title
      direction: 'horizontal', // merge type
      items: ['aclActiWelsMnger'],
    },
    {
      header: t('MSG_TXT_ENVR_ELHM_OPTN'), // 환경가전 가동 colspan title
      direction: 'horizontal', // merge type
      items: ['envrElhmOptnWelsMnger', 'envrElhmOptnWelsPlar', 'envrElhmOptnWelsSum'],
    },
    {
      header: t('MSG_TXT_ENVR_ELHM_ACL_ACTI'), // 환경가전 실동 colspan title
      direction: 'horizontal', // merge type
      items: ['envrElhmAclActiWelsMnger', 'envrElhmAclActiWelsPlar', 'envrElhmAclActiWelsSum'],
    },
  ]);

  view.setFixedOptions({ colCount: 6 });
});

// P조직 그리드
const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseYm' }, // 관리월
    { fieldName: 'bznsOg' }, // 영업조직
    { fieldName: 'blgCd' }, // 소속코드
    { fieldName: 'blgNm' }, // 소속
    { fieldName: 'plarNo' }, // 플래너 번호
    { fieldName: 'plarNm' }, // 플래너명
    { fieldName: 'pstnDvCd' }, // 직급
    { fieldName: 'bldNm' }, // 빌딩명
    { fieldName: 'brchCnt', dataType: 'number' }, // 지점수
    { fieldName: 'indvEnvrElhmNw', dataType: 'number' }, // 개인실적_환경가전_신규 + 재렌탈
    { fieldName: 'indvEnvrElhmChdvc', dataType: 'number' }, // 개인실적_환경가전_기변
    { fieldName: 'indvEnvrElhmSum', dataType: 'number' }, // 개인실적_환경가전_계
    { fieldName: 'indvEnvrElhmEtc', dataType: 'number' }, // 개인실적_환경가전 외
    { fieldName: 'ogEnvrElhmNw', dataType: 'number' }, // 조직실적_환경가전_신규 + 재렌탈
    { fieldName: 'ogEnvrElhmChdvc', dataType: 'number' }, // 조직실적_환경가전_기변
    { fieldName: 'ogEnvrElhmSum', dataType: 'number' }, // 조직실적_환경가전_계
    { fieldName: 'ogEnvrElhmEtc', dataType: 'number' }, // 조직실적_환경가전 외
    { fieldName: 'blngtWelsMnger', dataType: 'number' }, // 재직_웰스매니저
    { fieldName: 'blngtWelsPlar', dataType: 'number' }, // 재직_웰스플래너
    { fieldName: 'blngtWelsSum', dataType: 'number' }, // 재직_계
    { fieldName: 'aclActiWelsMnger', dataType: 'number' }, // 실활동_웰스매니저
    { fieldName: 'envrElhmOptnWelsMnger', dataType: 'number' }, // 환경가전 가동_웰스매니저
    { fieldName: 'envrElhmOptnWelsPlar', dataType: 'number' }, // 환경가전 가동_웰스플래너
    { fieldName: 'envrElhmOptnWelsSum', dataType: 'number' }, // 환경가전 가동_계
    { fieldName: 'envrElhmAclActiWelsMnger', dataType: 'number' }, // 환경가전 실동_웰스매니저
    { fieldName: 'envrElhmAclActiWelsPlar', dataType: 'number' }, // 환경가전 실동_웰스플래너
    { fieldName: 'envrElhmAclActiWelsSum', dataType: 'number' }, // 환경가전 실동_계
  ];

  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_MONTH'), width: '100', datetimeFormat: 'YYYY-MM', styleName: 'text-center' }, // 관리월
    { fieldName: 'bznsOg', header: t('MSG_TXT_BZNS_OG'), width: '100', styleName: 'text-center' }, // 영업조직
    { fieldName: 'blgCd', header: t('MSG_TXT_BLG_CD'), width: '100', styleName: 'text-center' }, // 소속코드
    { fieldName: 'blgNm', header: t('MSG_TXT_BLG'), width: '130', styleName: 'text-center' }, // 소속
    { fieldName: 'plarNo', header: t('MSG_TXT_PLAR_NO'), width: '100', styleName: 'text-center' }, // 플래너 번호
    { fieldName: 'plarNm', header: t('MSG_TXT_PLAR_NM'), width: '100', styleName: 'text-center' }, // 플래너명
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), width: '80', styleName: 'text-center' }, // 직급
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '150', styleName: 'text-left' }, // 빌딩명
    { fieldName: 'brchCnt', header: t('MSG_TXT_BRCH_N'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 지점수
    { fieldName: 'indvEnvrElhmNw', header: t('MSG_TXT_PERF'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 개인실적_환경가전_실적
    { fieldName: 'indvEnvrElhmChdvc', header: t('MSG_TXT_CHNG'), width: '100', numberFormat: '#,##0.##', styleName: 'text-left' }, // 개인실적_환경가전_기변
    { fieldName: 'indvEnvrElhmSum', header: t('MSG_TXT_AGG'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 개인실적_환경가전_계
    { fieldName: 'indvEnvrElhmEtc', header: t('MSG_TXT_ENVR_ELHM_EXCP'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 개인실적_환경가전 외
    { fieldName: 'ogEnvrElhmNw', header: t('MSG_TXT_PERF'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 조직실적_환경가전_실적
    { fieldName: 'ogEnvrElhmChdvc', header: t('MSG_TXT_CHNG'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 조직실적_환경가전_기변
    { fieldName: 'ogEnvrElhmSum', header: t('MSG_TXT_AGG'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 조직실적_환경가전_계
    { fieldName: 'ogEnvrElhmEtc', header: t('MSG_TXT_ENVR_ELHM_EXCP'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 조직실적_환경가전 외
    { fieldName: 'blngtWelsMnger', header: t('MSG_TXT_WELS_MNGER'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 재직_웰스매니저
    { fieldName: 'blngtWelsPlar', header: t('MSG_TXT_WELLS_PLAR'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 재직_웰스플래너
    { fieldName: 'blngtWelsSum', header: t('MSG_TXT_AGG'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 재직_계
    { fieldName: 'aclActiWelsMnger', header: t('MSG_TXT_WELS_MNGER'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 실활동_웰스매니저
    { fieldName: 'envrElhmOptnWelsMnger', header: t('MSG_TXT_WELS_MNGER'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 환경가전 가동_웰스매니저
    { fieldName: 'envrElhmOptnWelsPlar', header: t('MSG_TXT_WELLS_PLAR'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 환경가전 가동_웰스플래너
    { fieldName: 'envrElhmOptnWelsSum', header: t('MSG_TXT_AGG'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 환경가전 가동_계
    { fieldName: 'envrElhmAclActiWelsMnger', header: t('MSG_TXT_WELS_MNGER'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 환경가전 실동_웰스매니저
    { fieldName: 'envrElhmAclActiWelsPlar', header: t('MSG_TXT_WELLS_PLAR'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 환경가전 실동_웰스플래너
    { fieldName: 'envrElhmAclActiWelsSum', header: t('MSG_TXT_AGG'), width: '100', numberFormat: '#,##0.##', styleName: 'text-right' }, // 환경가전 실동_계
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  view.setColumnLayout([
    // single
    'baseYm', 'bznsOg', 'blgCd', 'blgNm', 'plarNo', 'plarNm', 'pstnDvCd', 'bldNm', 'brchCnt',
    {
      header: t('MSG_TXT_INDV_PERF'), // 개인실적
      direction: 'horizontal', // merge type
      items: [
        {
          header: t('MSG_TXT_ENVR_ELHM'), // 환경가전 colspan title
          direction: 'horizontal', // merge type
          items: ['indvEnvrElhmNw', 'indvEnvrElhmChdvc', 'indvEnvrElhmSum'],
        },
        'indvEnvrElhmEtc',
      ],
    },
    {
      header: t('MSG_TXT_OG_PERF'), // 조직실적
      direction: 'horizontal', // merge type
      items: [
        {
          header: t('MSG_TXT_ENVR_ELHM'), // 환경가전 colspan title
          direction: 'horizontal', // merge type
          items: ['ogEnvrElhmNw', 'ogEnvrElhmChdvc', 'ogEnvrElhmSum'],
        },
        'ogEnvrElhmEtc',
      ],
    },
    {
      header: t('MSG_TXT_BLNG_TO'), // 재직 colspan title
      direction: 'horizontal', // merge type
      items: ['blngtWelsMnger', 'blngtWelsPlar', 'blngtWelsSum'],
    },
    {
      header: t('MSG_TXT_ACL_ACTI'), // 실활동 colspan title
      direction: 'horizontal', // merge type
      items: ['aclActiWelsMnger'],
    },
    {
      header: t('MSG_TXT_ENVR_ELHM_OPTN'), // 환경가전 가동 colspan title
      direction: 'horizontal', // merge type
      items: ['envrElhmOptnWelsMnger', 'envrElhmOptnWelsPlar', 'envrElhmOptnWelsSum'],
    },
    {
      header: t('MSG_TXT_ENVR_ELHM_ACL_ACTI'), // 환경가전 실동 colspan title
      direction: 'horizontal', // merge type
      items: ['envrElhmAclActiWelsMnger', 'envrElhmAclActiWelsPlar', 'envrElhmAclActiWelsSum'],
    },
  ]);

  view.setFixedOptions({ colCount: 6 });
});

</script>

<style scoped>
</style>
