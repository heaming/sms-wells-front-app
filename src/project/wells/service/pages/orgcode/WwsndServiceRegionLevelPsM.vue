<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [K-W-SV-U-0146M01] WwsndServiceRegionLevelPsM - 서비스 급지현황
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.09.05
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
        :options="['홈','정보관리','급지관리', '서비스 급지현황']"
      />
    </template>
    <kw-search
      :cols="2"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 서비스유형 -->
        <kw-search-item :label="t('TXT_MSG_SV_TP_CD')">
          <!-- 서비스 유형 -->
          <kw-select
            v-model="searchParams.svBizHclsfNm"
            :options="selectCodes.SELECT_SERVICE"
            class="w150"
          />
          <!-- 서비스센터 -->
          <kw-select
            v-model="searchParams.ogCd"
            :options="serviceCenters"
            first-option="all"
            option-label="ogNm"
            option-value="ogCd"
          />
          <!-- 담당자 -->
          <kw-select
            v-model="searchParams.prtnrNo"
            :options="engineers"
            class="w150"
            first-option="all"
            option-label="prtnrNoNm"
            option-value="prtnrNo"
          />
        </kw-search-item>
        <!-- 조회기준 -->
        <kw-search-item :label="t('MSG_TXT_INQR_BASE')">
          <kw-select
            v-model="searchParams.searchDateType"
            :options="selectCodes.SELECT_DAY"
          />
          <kw-date-range-picker
            v-model:from="searchParams.fromDate"
            v-model:to="searchParams.toDate"
            rules="date_range_months:1"
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
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="(pageInfo.totalCount === 0)"
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
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
import { useDataService, useMeta, getComponentType, defineGrid, codeUtil, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

/* 공통코드 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

// 사용자 정의코드
const selectCodes = {
  // 서비스유형 : 01.전체, 02.설치, 03.A/S, 04.홈케어
  SELECT_SERVICE: [{ codeId: '01', codeName: t('MSG_TXT_ALL') },
    { codeId: '02', codeName: t('MSG_TXT_INSTALLATION') },
    { codeId: '03', codeName: t('MSG_TXT_AFTER_SERVICE') },
    { codeId: '04', codeName: t('MSG_TXT_HOME_CARE') }],
  // 조회기준 : 01.접수일자, 02.예정일자, 03.처리일자, 04.방문확정일
  SELECT_DAY: [{ codeId: '01', codeName: t('MSG_TXT_RCPDT') },
    { codeId: '02', codeName: t('MSG_TXT_SCHD_DT') },
    { codeId: '03', codeName: t('MSG_TXT_PRCSDT') },
    { codeId: '04', codeName: t('MSG_TXT_VST_CNFM_D') }],
};

let cachedParams;

const searchParams = ref({
  svBizHclsfNm: '', // 서비스유형 : 01.전체, 02.설치, 03.A/S, 04.홈케어
  ogCd: '', // 서비스센터
  prtnrNo: '', // 담당자
  searchDateType: '01', // 조회기준 : 01.접수일자, 02.예정일자, 03.처리일자, 04.방문확정일
  fromDate: dayjs().subtract(0, 'month').startOf('month').format('YYYYMMDD'),
  toDate: dayjs().subtract(0, 'month').endOf('day').format('YYYYMMDD'),
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 서비스센터 조회
const { data: serviceCenters } = await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } });
// 엔지니어 조회
const { data: engineers } = await dataService.get('/sms/wells/service/organizations/engineer', { params: { authYn: 'N' } });

/** ==============================
 * 서비스 급지 현황 엑셀 다운로드
**============================== */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/service-region-level-ps/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
    checkBar: 'hidden',
  });
}

/** ============================
 * 서비스 급지 현황 조회
**============================ */
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/service-region-level-ps/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;
  const resData = list;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(resData);
  view.clearCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  console.log('searchParams.value >>>', searchParams.value);
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pdCd' },
    { fieldName: 'hgrPdCd' },
    { fieldName: 'pdTpCd' },
    { fieldName: 'bzHdqDvCd' },
  ];

  const columns = [
    { fieldName: 'pdCd', header: '서비스센터', width: '150' },
    { fieldName: 'hgrPdCd', header: '지점', width: '150' },
    { fieldName: 'pdTpCd', header: '성명', width: '100' },
    { fieldName: 'bzHdqDvCd', header: '직책', width: '100' },
  ];

  const columnLayout = [
    { direction: 'horizontal', items: ['pdCd'], header: { text: t('MSG_TXT_ASGN_INF') } }, // 배정정보
    { direction: 'horizontal', items: ['hgrPdCd'], header: { text: `${t('MSG_TXT_DFLT')} ${t('출고지')}` } },
    { direction: 'horizontal', items: ['pdTpCd'], header: { text: `${t('출장출고지')}` } },
    { direction: 'horizontal', items: ['bzHdqDvCd'], header: { text: `${t('출발')}` } },
  ];

  view.setColumnLayout(columnLayout);

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  // view.setColumnLayout([
  //   {
  //     header: '배정정보', // colspan title
  //     direction: 'horizontal', // merge type
  //     items: ['pdCd', 'hgrPdCd', 'pdTpCd', 'bzHdqDvCd'],
  //   },
  // ]);
});
</script>
