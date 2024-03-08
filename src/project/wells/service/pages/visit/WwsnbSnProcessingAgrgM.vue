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
        <kw-search-item :label="$t('MSG_TXT_DIV')">
          <kw-select
            v-model="searchParams.div"
            :options="divOption"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div
      v-show="isShowRgrp"
      class="result-area"
    >
      <!-- 지역단별집계표 -->
      <h3>{{ $t('MSG_TXT_SN_PROCESS_AGRG_RGRP') }}</h3>

      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="rgrpTotalCount"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="rgrpTotalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdRgrpRef"
        name="grdRgrp"
        :total-count="rgrpTotalCount"
        @init="initRgrpGrid"
      />
    </div>
    <div
      v-show="isShowSn"
      class="result-area"
    >
      <!-- S/N처리집계표 -->
      <h3>{{ $t('MSG_TXT_SN_PROCESSING_AGRG') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="snTotalCount"
            @change="fetchData"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="snTotalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdSnRef"
        name="grdSn"
        :total-count="snTotalCount"
        @init="initSnGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, defineGrid, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
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

// const codes = await codeUtil.getMultiCodes(
//   'COD_PAGE_SIZE_OPTIONS',
// );

const divOption = [
  { codeId: 'dgr1', codeName: '지역단별 집계표' },
  { codeId: 'dgr2', codeName: 'S/N처리집계표' },
];

const searchParams = ref({
  baseDt: now.startOf('month').format('YYYYMMDD'),
  dgr1LevlOg: {},
  dgr2LevlOg: {},
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  div: 'dgr1',
});

const rgrpTotalCount = ref(0);
const snTotalCount = ref(0);

const isDgr2 = computed(() => searchParams.value.div === 'dgr1');
// const curView = isDgr2.value === false ? grdRgrgRef.value : grdSnRef.value;

const isShowRgrp = ref(false);
const isShowSn = ref(false);

const byRgrpUrl = '/sms/wells/service/sn-processing-agrg/by-rgrp/excel-download';
const bySnUrl = '/sms/wells/service/sn-processing-agrg/by-sn/excel-download';

function getSearchUrl() {
  return isDgr2.value === false
    ? '/sms/wells/service/sn-processing-agrg/by-rgrp/excel-download'
    : '/sms/wells/service/sn-processing-agrg/by-sn/excel-download';
}

function getCurrentViewRef() {
  return isDgr2.value === false ? grdRgrpRef.value.getView() : grdSnRef.value.getView();
}

async function getDataBySeq(url, view, totalCount) {
  const res = await dataService.get(url, { params: { ...cachedParams } });
  const state = res.data;

  view.getDataSource().setRows(state);
  totalCount.value = state.length;

  view.resetCurrent();
}

async function fetchData() {
  const firstUrl = isDgr2.value === false ? byRgrpUrl : bySnUrl;
  const secondUrl = isDgr2.value === false ? bySnUrl : byRgrpUrl;
  const firstView = isDgr2.value === false ? grdRgrpRef.value.getView() : grdSnRef.value.getView();
  const secondView = isDgr2.value === false ? grdSnRef.value.getView() : grdRgrpRef.value.getView();
  const firstTotalCount = isDgr2.value === false ? rgrpTotalCount : snTotalCount;
  const secondTotalCount = isDgr2.value === false ? snTotalCount : rgrpTotalCount;

  await getDataBySeq(firstUrl, firstView, firstTotalCount);
  await getDataBySeq(secondUrl, secondView, secondTotalCount);
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
  isDgr2.value = computed(() => searchParams.value.div === 'dgr1');
  if (searchParams.value.div === 'dgr1') {
    isShowRgrp.value = true;
    isShowSn.value = false;
  } else {
    isShowRgrp.value = false;
    isShowSn.value = true;
  }
});
watch(() => searchParams.value.div, async (val) => {
  isDgr2.value = computed(() => val === 'dgr1');
  if (searchParams.value.div === 'dgr1') {
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
