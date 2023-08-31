<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSC
2. 프로그램 ID : WwpscLectureSupportApplicaionListM
3. 작성자 : Park Yesol
4. 작성일 : 2023.08.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 강의지원 신청현황
****************************************************************************************************
-->

<template>
  <kw-page>
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 조직유형 -->
        <kw-search-item
          :label="t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            v-model="searchParams.lectrSpptOgTpCd"
            :label="t('MSG_TXT_OG_TP')"
            :options="ogTpCd"
            rules="required"
            first-option="select"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_EDUC_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.lectrYm"
            :label="t('MSG_TXT_EDUC_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_DIV')">
          <kw-option-group
            v-model="searchParams.gubun"
            type="radio"
            :options="[{codeId: '1', codeName:$t('MSG_TXT_OG')},{codeId:'2',codeName:$t('MSG_TXT_LECT')}]"
          />
        </kw-search-item>
        <kw-search-item
          v-if="searchParams.gubun === '2'"
          :label="t('MSG_TXT_LECT_NM')"
        >
          <kw-input
            v-model="searchParams.lectNm"
            :placeholder="t('MSG_TXT_INP')"
          />
        </kw-search-item>
        <kw-search-item
          v-if="searchParams.gubun === '1'"
          :label="t('MSG_TXT_OG_LEVL')"
          required
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
            :og-tp-cd="searchParams.lectrSpptOgTpCd"
            :start-level="1"
            :end-level="2"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div
      v-if="searchParams.gubun === '1'"
      class="result-area"
    >
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="ogPageInfo.pageIndex"
            v-model:page-size="ogPageInfo.pageSize"
            :total-count="ogPageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          />
        </template>
        <kw-btn
          v-permission:read
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          secondary
          dense
          :disable="ogPageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="ogGrdMainRef"
        name="ogGrdMain"
        :page-size="ogPageInfo.pageSize"
        :total-count="ogPageInfo.totalCount"
        :visible-rows="ogPageInfo.pageSize - 1"
        @init="initOgGrdMain"
      />
      <kw-pagination
        v-model:page-index="ogPageInfo.pageIndex"
        v-model:page-size="ogPageInfo.pageSize"
        :total-count="ogPageInfo.totalCount"
      />
    </div>

    <div
      v-if="searchParams.gubun === '2'"
      class="result-area"
    >
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="lectPageInfo.pageIndex"
            v-model:page-size="lectPageInfo.pageSize"
            :total-count="lectPageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          />
        </template>
        <kw-btn
          v-permission:read
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          secondary
          dense
          :disable="lectPageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="lectGrdMainRef"
        name="lectGrdMain"
        :page-size="lectPageInfo.pageSize"
        :total-count="lectPageInfo.totalCount"
        :visible-rows="lectPageInfo.pageSize - 1"
        @init="initLectGrdMain"
      />
      <kw-pagination
        v-model:page-index="lectPageInfo.pageIndex"
        v-model:page-size="lectPageInfo.pageSize"
        :total-count="lectPageInfo.totalCount"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useDataService, getComponentType, gridUtil, codeUtil, useMeta, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

const { t } = useI18n();
const { getConfig, getUserInfo } = useMeta();
const dataService = useDataService();
const userInfo = getUserInfo();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const ogTpCd = ref();
const ogGrdMainRef = ref(getComponentType('KwGrid'));
const lectGrdMainRef = ref(getComponentType('KwGrid'));

// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'COD_YN',
  'LECTR_TCNT_CD',
);
ogTpCd.value = codes.OG_TP_CD.filter((v) => ['W01', 'W02'].includes(v.codeId));

let cachedParams;
// 검색조건 Parameter
const searchParams = ref({
  lectrSpptOgTpCd: userInfo.ogTpCd,
  lectrYm: dayjs(now).add(1, 'month').format('YYYYMM'),
  lectNm: '',
  ogLevlDvCd1: '', // 사업단
  ogLevlDvCd2: '', // 총괄
  gubun: '1',
});

const ogPageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const lectPageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const fetchData = async () => {
  if (searchParams.value.gubun === '1') {
    const res = await dataService.get('/sms/wells/competence/lecture-sppt-application/og-type/paging', { params: { ...cachedParams, ...ogPageInfo.value } });
    const { list, pageInfo: pagingResult } = res.data;
    ogPageInfo.value = pagingResult;
    const view = ogGrdMainRef.value.getView();

    view.getDataSource().setRows(list);
    view.resetCurrent();
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(ogPageInfo);
  }
  if (searchParams.value.gubun === '2') {
    const res = await dataService.get('/sms/wells/competence/lecture-sppt-application/paging', { params: { ...cachedParams, ...lectPageInfo.value } });
    const { list, pageInfo: pagingResult } = res.data;
    lectPageInfo.value = pagingResult;
    const view = lectGrdMainRef.value.getView();

    view.getDataSource().setRows(list);
    view.resetCurrent();
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(lectPageInfo);
  }
};

const onClickSearch = async () => {
  if (searchParams.value.gubun === '1') {
    ogPageInfo.value.pageIndex = 1;
  }
  if (searchParams.value.gubun === '2') {
    searchParams.value.ogLevlDvCd1 = '';
    searchParams.value.ogLevlDvCd2 = '';
    lectPageInfo.value.pageIndex = 1;
  }
  // 자동완성 검색조건 설정
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
};

const onClickExcelDownload = async () => {
  if (searchParams.value.gubun === '1') {
    const view = ogGrdMainRef.value.getView();
    const response = await dataService.get('/sms/wells/competence/lecture-sppt-application/og-type/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
      exportData: response.data,
    });
  }
  if (searchParams.value.gubun === '2') {
    const view = lectGrdMainRef.value.getView();
    const response = await dataService.get('/sms/wells/competence/lecture-sppt-application/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
      exportData: response.data,
    });
  }
};

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initOgGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dgr1LevlOgNm' },
    { fieldName: 'dgr2LevlOgNm' },
    { fieldName: 'lectrTCnt1BldNm' },
    { fieldName: 'lectrTCnt1lectNm' },
    { fieldName: 'lectrTCnt1LectrNm' },
    { fieldName: 'lectrTCnt1LectrDt' },
    { fieldName: 'lectrTCnt2BldNm' },
    { fieldName: 'lectrTCnt2LectNm' },
    { fieldName: 'lectrTCnt2LectrNm' },
    { fieldName: 'lectrTCnt2LectrDt' },
    { fieldName: 'lectrTCnt3BldNm' },
    { fieldName: 'lectrTCnt3LectNm' },
    { fieldName: 'lectrTCnt3LectrNm' },
    { fieldName: 'lectrTCnt3LectrDt' },
  ];
  const columns = [
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '100', styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'lectrTCnt1BldNm', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'lectrTCnt1LectNm', header: t('MSG_TXT_LECT_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'lectrTCnt1LectrNm', header: t('MSG_TXT_LECTR_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'lectrTCnt1LectrDt', header: t('MSG_TXT_LECTR_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'lectrTCnt2BldNm', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'lectrTCnt2LectNm', header: t('MSG_TXT_LECT_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'lectrTCnt2LectrNm', header: t('MSG_TXT_LECTR_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'lectrTCnt2LectrDt', header: t('MSG_TXT_LECTR_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'lectrTCnt3BldNm', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'lectrTCnt3LectNm', header: t('MSG_TXT_LECT_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'lectrTCnt3LectrNm', header: t('MSG_TXT_LECTR_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'lectrTCnt3LectrDt', header: t('MSG_TXT_LECTR_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'dgr1LevlOgNm', 'dgr2LevlOgNm',
    {
      header: t('MSG_TXT_LECTR_TCNT', ['1']), // colspan title
      direction: 'horizontal', // merge type
      items: ['lectrTCnt1BldNm', 'lectrTCnt1LectNm', 'lectrTCnt1LectrNm', 'lectrTCnt1LectrDt'],
    },
    {
      header: t('MSG_TXT_LECTR_TCNT', ['2']), // colspan title
      direction: 'horizontal', // merge type
      items: ['lectrTCnt2BldNm', 'lectrTCnt2LectNm', 'lectrTCnt2LectrNm', 'lectrTCnt2LectrDt'],
    },
    {
      header: t('MSG_TXT_LECTR_TCNT', ['3']), // colspan title
      direction: 'horizontal', // merge type
      items: ['lectrTCnt3BldNm', 'lectrTCnt3LectNm', 'lectrTCnt3LectrNm', 'lectrTCnt3LectrDt'],
    },
  ]);
});

const initLectGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dgr1LevlOgNm' },
    { fieldName: 'dgr2LevlOgNm' },
    { fieldName: 'lectrTCnt' },
    { fieldName: 'bldNm' },
    { fieldName: 'lectNm' },
    { fieldName: 'lectrNm' },
    { fieldName: 'lectrDt' },
    { fieldName: 'lectrSpptOgTpCd' },
    { fieldName: 'lectrSpptAplcId' },
    { fieldName: 'lectrYm' },
  ];
  const columns = [
    { fieldName: 'lectNm', header: t('MSG_TXT_LECT_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'lectrDt', header: t('MSG_TXT_LECTR_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '100', styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'lectrNm', header: t('MSG_TXT_LECTR_NM'), width: '300', styleName: 'text-left' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'lectrTCnt', header: t('MSG_TXT_JOB_PROT_CD'), width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
