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
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchMngerAccEnrlPsData"
          />

          <span class="ml8">(단위 : 명)</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickBottomGridExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdBottomRef"
        :visible-rows="10"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initBottomGrid"
      />

      <!-- rev:230420 추가 -->
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchMngerAccEnrlPsData"
      />
      <!-- // rev:230420 추가 -->
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useMeta, codeUtil, useDataService, getComponentType, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdTopRef = ref(getComponentType('KwGrid'));
const grdBottomRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  metgStartDt: dayjs().format('YYYYMM'), // 관리년월
});

const topGridTotalCount = ref(0);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

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
  const res = await dataService.get('/sms/wells/service/manager-acc-enrl-ps-inqr/manager-account-enrl-ps/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdBottomRef.value.getView();
  view.getDataSource().setRows(list);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
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
  cachedParams = cloneDeep(searchParams.value);
  const view = grdBottomRef.value.getView();

  const res = await dataService.get('/sms/wells/service/manager-acc-enrl-ps-inqr/manager-account-enrl-ps/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: '매니저 계정 및 재적 현황',
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid: Fetch initial Data.
// -------------------------------------------------------------------------------------------------
function initTopGrid(data, view) {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'pdctPdCd' },
    { fieldName: 'svPdCd' },
    { fieldName: 'istDt' },
    { fieldName: 'reqdDt' },
    { fieldName: 'cpsDt' },
    { fieldName: 'cntrNmnN' },
    { fieldName: 'updtPsicDvCd' },
    { fieldName: 'bcNo' },
    { fieldName: 'wkPsicDvCd' },
    { fieldName: 'mngtPrtnrOgTpCd' },
    { fieldName: 'mngtPrtnrNo' },
  ];
  const columns = [
    { fieldName: 'cntrNo', header: '총괄단', width: '100', styleName: 'text-left' },
    { fieldName: 'cntrSn', header: '지역단', width: '100', styleName: 'text-center' },
    { fieldName: 'pdctPdCd', header: '총괄단장', width: '100', styleName: 'text-left' },
    { fieldName: 'svPdCd', header: '재적계', width: '100', styleName: 'text-right' },
    { fieldName: 'istDt', header: '실활동 매니저(20계정↑ 완료)', width: '200', styleName: 'text-right' },
    { fieldName: 'reqdDt', header: '실활동 지점장(20계정↑ 완료)', width: '200', styleName: 'text-right' },
    { fieldName: 'cpsDt', header: '활동 매니저(20계정↓ 완료)', width: '200', styleName: 'text-right' },
    { fieldName: 'cntrNmnN', header: '활동 매니저(20계정↓ 완료)', width: '200', styleName: 'text-right' },
    { fieldName: 'updtPsicDvCd', header: '개인별 평균계정(20계정↑)', width: '200', styleName: 'text-right' },
    { fieldName: 'bcNo', header: '채용 필요인원(150계정 기준)', width: '200', styleName: 'text-right' },
    { fieldName: 'wkPsicDvCd', header: '방문계정', width: '100', styleName: 'text-right' },
    { fieldName: 'mngtPrtnrOgTpCd', header: '방문계정', width: '100', styleName: 'text-right' },
    { fieldName: 'mngtPrtnrNo', header: '방문계정', width: '100', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // data.setRows([
  // eslint-disable-next-line max-len
  //   { col1: 'A000000', col2: '5', col3: '김지숙', col4: '164', col5: '1', col6: '1', col7: '1', col8: '1', col9: '1', col10: '1', col11: '1' },
  // eslint-disable-next-line max-len
  //   { col1: 'A000000', col2: '5', col3: '김지숙', col4: '164', col5: '1', col6: '1', col7: '1', col8: '1', col9: '1', col10: '1', col11: '1' },
  // eslint-disable-next-line max-len
  //   { col1: 'A000000', col2: '5', col3: '김지숙', col4: '164', col5: '1', col6: '1', col7: '1', col8: '1', col9: '1', col10: '1', col11: '1' },
  // eslint-disable-next-line max-len
  //   { col1: 'A000000', col2: '5', col3: '김지숙', col4: '164', col5: '1', col6: '1', col7: '1', col8: '1', col9: '1', col10: '1', col11: '1' },
  // eslint-disable-next-line max-len
  //   { col1: 'A000000', col2: '5', col3: '김지숙', col4: '164', col5: '1', col6: '1', col7: '1', col8: '1', col9: '1', col10: '1', col11: '1' },
  // eslint-disable-next-line max-len
  //   { col1: 'A000000', col2: '5', col3: '김지숙', col4: '164', col5: '1', col6: '1', col7: '1', col8: '1', col9: '1', col10: '1', col11: '1' },
  // eslint-disable-next-line max-len
  //   { col1: 'A000000', col2: '5', col3: '김지숙', col4: '164', col5: '1', col6: '1', col7: '1', col8: '1', col9: '1', col10: '1', col11: '1' },
  // eslint-disable-next-line max-len
  //   { col1: 'A000000', col2: '5', col3: '김지숙', col4: '164', col5: '1', col6: '1', col7: '1', col8: '1', col9: '1', col10: '1', col11: '1' },
  // eslint-disable-next-line max-len
  //   { col1: 'A000000', col2: '5', col3: '김지숙', col4: '164', col5: '1', col6: '1', col7: '1', col8: '1', col9: '1', col10: '1', col11: '1' },
  // eslint-disable-next-line max-len
  //   { col1: 'A000000', col2: '5', col3: '김지숙', col4: '164', col5: '1', col6: '1', col7: '1', col8: '1', col9: '1', col10: '1', col11: '1' },
  // ]);
}
function initBottomGrid(data, view) {
  const fields = [
    { fieldName: 'asIstOjNo' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'inChnlDvCd' },
    { fieldName: 'svBizHclsfCd' },
    { fieldName: 'svBizDclsfCd' },
    { fieldName: 'rcpOgTpCd' },
    { fieldName: 'rcpIchrPrtnrNo' },
    { fieldName: 'rcpdt' },
    { fieldName: 'fnlRcpdt' },
  ];

  const columns = [
    { fieldName: 'asIstOjNo', header: '총괄단', width: '100', styleName: 'text-left' },
    { fieldName: 'cntrNo', header: '지역단', width: '100', styleName: 'text-center' },
    { fieldName: 'cntrSn', header: '총괄단장', width: '100', styleName: 'text-left' },
    { fieldName: 'cntrCstNo', header: '재적계', width: '100', styleName: 'text-right' },
    { fieldName: 'inChnlDvCd', header: '실활동 매니저(20계정↑ 완료)', width: '200', styleName: 'text-right' },
    { fieldName: 'svBizHclsfCd', header: '실활동 지점장(20계정↑ 완료)', width: '200', styleName: 'text-right' },
    { fieldName: 'svBizDclsfCd', header: '활동 매니저(20계정↓ 완료)', width: '200', styleName: 'text-right' },
    { fieldName: 'rcpOgTpCd', header: '활동 매니저(20계정↓ 완료)', width: '200', styleName: 'text-right' },
    { fieldName: 'rcpIchrPrtnrNo', header: '개인별 평균계정(20계정↑)', width: '200', styleName: 'text-right' },
    { fieldName: 'rcpdt', header: '채용 필요인원(150계정 기준)', width: '200', styleName: 'text-right' },
    { fieldName: 'fnlRcpdt', header: '방문계정', width: '100', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
}
</script>
