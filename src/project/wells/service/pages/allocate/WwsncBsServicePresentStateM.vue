<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNB (방문관리)
 2. 프로그램 ID : [K-W-SV-U-0290M01] WwsncBsServicePresentStateM - B/S 서비스 현황
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.09.22
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
  -
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <template #header>
      <kw-page-header
        :options="['홈' , '메뉴구조 업데이트 필요' , 'B/S 서비스 현황']"
      />
    </template>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 관리년월 -->
        <kw-search-item :label="t('MSG_TXT_MGT_YNM')">
          <kw-date-picker
            v-model="searchParams.mgtYnm"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <wwsn-manager-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.mgtDept"
          v-model:dgr2-levl-og-id="searchParams.rgnlGrp"
          v-model:dgr3-levl-og-id="searchParams.branch"
          v-model:dgr1-levl-og="searchParams.dgr1LevlOg"
          v-model:dgr2-levl-og="searchParams.dgr2LevlOg"
          v-model:dgr3-levl-og="searchParams.dgr3LevlOg"
          use-og-level="3"
          :use-partner="false"
          dgr1-levl-og-first-option="all"
          dgr2-levl-og-first-option="all"
          dgr3-levl-og-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          dgr2-levl-og-label="ogCdNm"
          dgr3-levl-og-label="ogCdNm"
        />
      </kw-search-row>
      <kw-search-row>
        <!-- 직급 -->
        <kw-search-item :label="t('MSG_TXT_CRLV')">
          <kw-select
            v-model="searchParams.pstnDvCd"
            :options="codes.PSTN_DV_CD"
            first-option="all"
            first-option-value="ALL"
            placeholder="전체"
          />
        </kw-search-item>
        <!-- 사번 -->
        <kw-search-item :label="t('MSG_TXT_EPNO')">
          <kw-input
            v-model="searchParams.prtnrNo"
            :maxlength="50"
          />
        </kw-search-item>
        <!-- 성명 -->
        <kw-search-item :label="t('MSG_TXT_EMPL_NM')">
          <kw-input
            v-model="searchParams.prtnrNm"
            :maxlength="50"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-grid
        ref="grdInfoRef"
        :visible-rows="1"
        class="mb30"
        @init="initInfoGrid"
      />
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchListData"
          />
        </template>
        <!-- 인쇄 -->
        <kw-btn
          icon="print"
          dense
          secondary
          :label="t('MSG_BTN_PRTG')"
          :disable="!pageInfo.totalCount"
          @click="onClickPrintEl"
        />
        <!-- 엑셀 다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdListRef"
        name="grdListRef"
        :visible-rows="10"
        @init="initListGrid"
      />

      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchListData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import { printElement } from '~common/utils/common';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';

const { t } = useI18n();
const { currentRoute } = useRouter();

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PSTN_DV_CD', // 직급구분코드
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const searchParams = ref({
  mgtYnm: dayjs().format('YYYYMM'), // 관리년월
  mgtDept: '', // 총괄단
  rgnlGrp: '', // 지역단
  branch: '', // 지점
  dgr1LevlOg: {},
  dgr2LevlOg: {},
  dgr3LevlOg: {},
  prtnrNo: '', // 사번
  prtnrNm: '', // 성명
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
});

const grdInfoRef = ref(getComponentType('KwGrid'));
const grdListRef = ref(getComponentType('KwGrid'));

/** =========================================
 * initInfoGrid 영역 조회
**========================================= */
async function fetchInfoData() {
  const res = await dataService.get('/sms/wells/service/bs-service-present-state/info', { params: cachedParams });
  console.log('fetchInfoData res.data >>>', res.data);

  const view = grdInfoRef.value.getView();
  const dataSource = view.getDataSource();
  dataSource.setRows(res.data);
}

/** =========================================
 * initListGrid 영역 조회
**========================================= */
async function fetchListData() {
  const res = await dataService.get('/sms/wells/service/bs-service-present-state/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdListRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.setRows(list);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log('cachedParams >>>', cachedParams);

  await fetchInfoData();
  await fetchListData();
}

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}

async function onClickExcelDownload() {
  const view = grdListRef.value.getView();
  const res = await dataService.get('/sms/wells/service/bs-service-present-state/excel-download', { params: cachedParams });

  gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initInfoGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'sapDlpnrCd' },
  ];

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_MNGT_ACC'), width: '385', styleName: 'text-right' }, // 관리계정
    { fieldName: 'ogNm', header: t('MSG_TXT_VST_ACC'), width: '385', styleName: 'text-right' }, // 방문계정
    { fieldName: 'prtnrNo', header: t('MSG_TXT_FSH_ACC'), width: '385', styleName: 'text-right' }, // 완료계정
    { fieldName: 'sapDlpnrCd', header: `${t('MSG_TXT_SVC_PROC')}(%)`, width: '385', styleName: 'text-right' }, // 서비스처리율
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

const initListGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'asnOjYm' },
    { fieldName: 'dgr3LevlOgCd' },
    { fieldName: 'dgr3LevlOgNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'qlfDvCd' },
    { fieldName: 'pdctPdCd' },
    { fieldName: 'vstDuedt' },
    { fieldName: 'cntcDt' },
    { fieldName: 'compRate' },
    { fieldName: 'npPtrm' },
  ];

  const columns = [
    { fieldName: 'asnOjYm', header: t('MSG_TXT_MGT_YNM'), width: '100', styleName: 'text-center' }, // 관리년월
    { fieldName: 'dgr3LevlOgCd', header: t('MSG_TXT_BLG'), width: '100', styleName: 'text-center' }, // 소속
    { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_CFMNR_BLD'), width: '200' }, // 상주빌딩
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' }, // 사번
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' }, // 성명
    { fieldName: 'qlfDvCd', header: t('MSG_TXT_CRLV'), width: '100' }, // 직급
    { fieldName: 'pdctPdCd', header: t('MSG_TXT_MGT'), width: '100', styleName: 'text-right' }, // 관리
    { fieldName: 'vstDuedt', header: t('MSG_TXT_VST'), width: '100', styleName: 'text-right' }, // 방문
    { fieldName: 'cntcDt', header: t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-right' }, // 완료
    { fieldName: 'compRate', header: `${t('MSG_TXT_PROCS_RT')}(%)`, width: '100', styleName: 'text-center' }, // 처리율(%)
    { fieldName: 'npPtrm', header: t('B/S 관리일정'), width: '150', styleName: 'text-center' }, // B/S 관리일정
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
