<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnbSnProcessingAgrgM(K-W-SV-U-0079M01) - S/N 처리 집계
3. 작성자 : heymi.cho
4. 작성일 : 2023.08.24
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- S/N 처리 집계 (http://localhost:3000/#/service/wwsnb-sn-processing-agrg)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseDt"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <!-- 총괄단 / 지역단 -->
        <wwsn-manager-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
          v-model:dgr2-levl-og-id="searchParams.dgr2LevlOgId"
          v-model:dgr1-levl-og="searchParams.dgr1LevlOg"
          v-model:dgr2-levl-og="searchParams.dgr2LevlOg"
          use-og-level="2"
          :use-partner="false"
          dgr1-levl-og-first-option="all"
          dgr2-levl-og-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          dgr2-levl-og-label="ogCdNm"
        />
      </kw-search-row>
    </kw-search>

    <div
      v-if="isShowRgrp"
      class="result-area"
    >
      <!-- 지역단별집계표 -->
      <h3>{{ $t('MSG_TXT_SN_PROCESS_AGRG_RGRP') }}</h3>

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
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdRgrpRef"
        name="grdRgrp"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initRgrpGrid"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
    <div
      v-if="isShowSn"
      class="result-area"
    >
      <!-- S/N처리집계표 -->
      <h3>{{ $t('MSG_TXT_SN_PROCESSING_AGRG') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdSnRef"
        name="grdSn"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initSnGrid"
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
import { codeUtil, useDataService, getComponentType, defineGrid, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';

const { t } = useI18n();
const now = dayjs();
const dataService = useDataService();
const grdRgrpRef = ref(getComponentType('KwGrid'));
const grdSnRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  baseDt: now.startOf('month').format('YYYYMMDD'),
  dgr1LevlOg: {},
  dgr2LevlOg: {},
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
});

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

const isDgr2 = computed(() => !isEmpty(searchParams.value.dgr2LevlOgId));
// const curView = isDgr2.value === false ? grdRgrgRef.value : grdSnRef.value;

const isShowRgrp = ref(false);
const isShowSn = ref(false);

function getSearchUrl() {
  return isDgr2.value === false ? '/sms/wells/service/sn-processing-agrg/by-rgrp/paging' : '/sms/wells/service/sn-processing-agrg/by-sn/paging';
}

function getCurrentViewRef() {
  return isDgr2.value === false ? grdRgrpRef.value.getView() : grdSnRef.value.getView();
}

async function fetchData() {
  const searchUrl = getSearchUrl();
  const res = await dataService.get(searchUrl, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = getCurrentViewRef();
  view.getDataSource().setRows(state);
  console.log(state);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const searchUrl = getSearchUrl();
  const res = await dataService.get(searchUrl, { params: { ...cachedParams } });

  const view = getCurrentViewRef();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  isDgr2.value = computed(() => searchParams.value.dgr2LevlOgId.length > 0);
  if (isEmpty(searchParams.value.dgr2LevlOgId)) {
    isShowRgrp.value = true;
    isShowSn.value = false;
  } else {
    isShowRgrp.value = false;
    isShowSn.value = true;
  }
});
watch(() => searchParams.value.dgr2LevlOgId, async (val) => {
  isDgr2.value = computed(() => val.length > 0);
  if (isEmpty(searchParams.value.dgr2LevlOgId)) {
    isShowRgrp.value = true;
    isShowSn.value = false;
  } else {
    isShowRgrp.value = false;
    isShowSn.value = true;
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initRgrpGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'rgrpNm', header: t('MSG_TXT_RGNL_GRP'), width: '106', styleName: 'text-center' },
    { fieldName: 'bmKnm', header: t('MSG_TXT_HODT'), width: '106', styleName: 'text-center' },
    { fieldName: 'bsCntrTotal', header: t('MSG_TXT_THM') + t('MSG_TXT_BS'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'bsCntrObj',
      header: t('MSG_TXT_OBJ'),
      width: '86',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,###',
    },
    { fieldName: 'procsTotal', header: t('MSG_TXT_PROC'), width: '86', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'reReqTotal', header: t('MSG_TXT_APLC'), width: '86', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'stickTotal', header: t('MSG_TXT_STICK'), width: '86', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'ratStickTotal', header: t('MSG_TXT_STICK_RT'), width: '61', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'scanTotal', header: t('MSG_TXT_SCN'), width: '94', styleName: 'text-right', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'handTotal', header: t('MSG_BTN_HDWR_IN'), width: '94', styleName: 'text-right', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'ratScanTotal', header: t('MSG_TXT_SCAN_RT'), width: '94', styleName: 'text-right', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'curMmRe', header: t('MSG_TXT_OBJ'), width: '86', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'curMmReProcs', header: t('MSG_TXT_PROC'), wiwidth: '86', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'curMmReReq', header: t('MSG_TXT_APLC'), width: '94', styleName: 'text-right', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'curMmReStick', header: t('MSG_TXT_STICK'), width: '86', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'ratReStick', header: t('MSG_TXT_STICK_RT'), width: '61', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'curMmReScan', header: t('MSG_TXT_SCN'), width: '94', styleName: 'text-right', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'curMmReHand', header: t('MSG_BTN_HDWR_IN'), width: '94', styleName: 'text-right', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'ratReScan', header: t('MSG_TXT_SCAN_RT'), width: '94', styleName: 'text-right', dataType: 'number', numberFormat: '#,###.##%' },
  ];

  // eslint-disable-next-line max-len
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'rgrpNm', // single
    'bmKnm',
    'bsCntrTotal',
    {
      header: t('MSG_TXT_THM') + t('MSG_TXT_BS') + t('MSG_TXT_BARCODE') + t('MSG_TXT_STICK') + t('MSG_TXT_PS'),
      direction: 'horizontal', // merge type
      items: ['bsCntrObj', 'procsTotal', 'reReqTotal', 'stickTotal', 'ratStickTotal'],
    },
    {
      header: t('MSG_TXT_THM') + t('MSG_TXT_BS') + t('MSG_TXT_STICK') + t('MSG_TXT_DET') + t('MSG_TXT_PS'),
      direction: 'horizontal',
      items: ['scanTotal', 'handTotal', 'ratScanTotal'],
    },
    {
      header: t('MSG_TXT_RPBL') + t('MSG_TXT_BARCODE') + t('MSG_TXT_STICK') + t('MSG_TXT_PS'),
      direction: 'horizontal',
      items: ['curMmRe', 'curMmReProcs', 'curMmReReq', 'curMmReStick', 'ratReStick'],
    },
    {
      header: t('MSG_TXT_RPBL') + t('MSG_TXT_STICK') + t('MSG_TXT_DET') + t('MSG_TXT_PS'),
      direction: 'horizontal',
      items: ['curMmReScan', 'curMmReHand', 'ratReScan'],
    },
  ]);
});

const initSnGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '106', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '130', styleName: 'text-left' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '86', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), width: '86', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '140', styleName: 'text-center' },
    { fieldName: 'bsCntrTotal', header: t('MSG_TXT_THM') + t('MSG_TXT_BS'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'bsCntrObj',
      header: t('MSG_TXT_OBJ'),
      width: '86',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,###',
      displayCallback: (grid, index) => {
        const { bsCntrTotal } = grid.getValues(index.dataRow);
        return bsCntrTotal;
      },
    },
    { fieldName: 'procsTotal', header: t('MSG_TXT_PROC'), width: '86', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'reReqTotal', header: t('MSG_TXT_APLC'), width: '86', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'stickTotal', header: t('MSG_TXT_STICK'), width: '86', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'ratStickTotal', header: t('MSG_TXT_STICK_RT'), width: '61', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'scanTotal', header: t('MSG_TXT_SCN'), width: '94', styleName: 'text-right', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'handTotal', header: t('MSG_BTN_HDWR_IN'), width: '94', styleName: 'text-right', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'ratScanTotal', header: t('MSG_TXT_SCAN_RT'), width: '94', styleName: 'text-right', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'curMmRe', header: t('MSG_TXT_OBJ'), width: '86', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'curMmReProcs', header: t('MSG_TXT_PROC'), wiwidth: '86', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'curMmReReq', header: t('MSG_TXT_APLC'), width: '94', styleName: 'text-right', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'curMmReStick', header: t('MSG_TXT_STICK'), width: '86', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'ratReStick', header: t('MSG_TXT_STICK_RT'), width: '61', styleName: 'text-right', dataType: 'number', numberFormat: '#,###' },
    { fieldName: 'curMmReScan', header: t('MSG_TXT_SCN'), width: '94', styleName: 'text-right', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'curMmReHand', header: t('MSG_BTN_HDWR_IN'), width: '94', styleName: 'text-right', dataType: 'number', numberFormat: '#,###.##%' },
    { fieldName: 'ratReScan', header: t('MSG_TXT_SCAN_RT'), width: '94', styleName: 'text-right', dataType: 'number', numberFormat: '#,###.##%' },
  ];
  // eslint-disable-next-line max-len
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'prtnrNo', // single
    {
      header: t('MSG_TXT_BLG'), // colspan title
      direction: 'horizontal', // merge type
      items: ['ogNm', 'prtnrKnm', 'pstnDvCd'],
    },
    'bldNm',
    'bsCntrTotal',
    {
      header: t('MSG_TXT_THM') + t('MSG_TXT_BS') + t('MSG_TXT_BARCODE') + t('MSG_TXT_STICK') + t('MSG_TXT_PS'),
      direction: 'horizontal',
      items: ['bsCntrObj', 'procsTotal', 'reReqTotal', 'stickTotal', 'ratStickTotal'],
    },
    {
      header: t('MSG_TXT_THM') + t('MSG_TXT_BS') + t('MSG_TXT_STICK') + t('MSG_TXT_DET') + t('MSG_TXT_PS'),
      direction: 'horizontal',
      items: ['scanTotal', 'handTotal', 'ratScanTotal'],
    },
    {
      header: t('MSG_TXT_RPBL') + t('MSG_TXT_BARCODE') + t('MSG_TXT_STICK') + t('MSG_TXT_PS'),
      direction: 'horizontal',
      items: ['curMmRe', 'curMmReProcs', 'curMmReReq', 'curMmReStick', 'ratReStick'],
    },
    {
      header: t('MSG_TXT_RPBL') + t('MSG_TXT_STICK') + t('MSG_TXT_DET') + t('MSG_TXT_PS'),
      direction: 'horizontal',
      items: ['curMmReScan', 'curMmReHand', 'ratReScan'],
    },
  ]);
});

</script>
