<!--
 ***************************************************************************************************
 * 프로그램 개요
 ***************************************************************************************************
 1. 모듈 : 모종 출하대차MAP
 2. 프로그램 ID : K-W-SV-U-0302M01
 3. 작성자 : heymi.cho
 4. 작성일 : 2023.08.03
 ***************************************************************************************************
 * 프로그램 설명
 ***************************************************************************************************
 - 모종 출하대차MAP (http://localhost:3000/#/service/wwsna-seeding-truck-arrangement-map)
 ***************************************************************************************************
-->

<template>
  <kw-page>
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_BASE_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseDt"
            :label="$t('MSG_TXT_BASE_DT')"
            type="date"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <h3>{{ $t('SDING_TRUCK_AGRG_BY_PCK') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdSubRef"
        name="grdSub"
        :visible-rows="1"
        @init="initGrid1"
      />
      <h3>{{ t('MSG_TIT_SDING_TRUCK_AGRG_BY_CNTER') }}</h3>
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
          @click="onClickExcelDownload"
        />
        <kw-btn
          dense
          primary
          :label="$t('MSG_BTN_PRINT_LABEL')"
          @click="onClickLabelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
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
import { codeUtil, getComponentType, gridUtil, useDataService, defineGrid } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const now = dayjs();
// const { modal } = useGlobal();
const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
let cachedParams;

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SDING_PKG_GRP_CD', // 모종패키지
  'GG_LCT_CD', // 집하위치
);

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

/*
 *  Search Parameter
 */
const searchParams = ref({
  baseDt: now.format('YYYYMMDD'),
});

/*
 *  Sub Grid
 */
async function fetchSubData() {
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/seeding-truck-arrangement-map/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdSubRef.value.getView();
  view.getDataSource().setRows(state);
  view.resetCurrent();
  await gridUtil.reset(view);
}

/*
 *  Main Grid
 */
async function fetchData() {
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/seeding-truck-arrangement-map/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  view.resetCurrent();
  await gridUtil.reset(view);
  await fetchSubData();
}

/*
 *  Search - 조회
 */
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/store-not-approve/excel-download', { params: searchParams.value });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 모종 패키지
// eslint-disable-next-line max-len
// const columns = codes.SDING_PKG_GRP_CD.map((v, i) => ({ fieldName: v.codeId, header: v.codeName, width: '70', styleName: 'text-center', nanText: 0, }));
// columns.unshift({
// })

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'aa', header: '집하센터', width: '50', styleName: 'text-center kw-bc--bg-grid text-weight-medium' },
    { fieldName: 'col2', header: '대차수량', width: '50', styleName: 'text-center' },
    { fieldName: 'fb', header: '대차구분', width: '70', styleName: 'text-center' },
    { fieldName: 'cart1', header: 'cart1', width: '70', styleName: 'text-right' },
    { fieldName: 'cart1F', header: 'cart1F', width: '70', styleName: 'text-right' },
    { fieldName: 'cart1B', header: 'cart1B', width: '70', styleName: 'text-right' },
    { fieldName: 'cart2', header: 'cart2', width: '70', styleName: 'text-right' },
    { fieldName: 'cart2F', header: 'cart2F', width: '70', styleName: 'text-right' },
    { fieldName: 'cart2B', header: 'cart2B', width: '70', styleName: 'text-right' },
    { fieldName: 'cart3', header: 'cart3', width: '70', styleName: 'text-right' },
    { fieldName: 'cart3F', header: 'cart3F', width: '70', styleName: 'text-right' },
    { fieldName: 'cart3B', header: 'cart3B', width: '70', styleName: 'text-right' },
    { fieldName: 'cart4', header: 'cart4', width: '70', styleName: 'text-right' },
    { fieldName: 'cart4F', header: 'cart4F', width: '70', styleName: 'text-right' },
    { fieldName: 'cart4B', header: 'cart4B', width: '70', styleName: 'text-right' },
    { fieldName: 'cart5', header: 'cart5', width: '70', styleName: 'text-right' },
    { fieldName: 'cart5F', header: 'cart5F', width: '70', styleName: 'text-right' },
    { fieldName: 'cart5B', header: 'cart5B', width: '70', styleName: 'text-right' },
    { fieldName: 'cart6', header: 'cart6', width: '70', styleName: 'text-right' },
    { fieldName: 'cart6F', header: 'cart6F', width: '70', styleName: 'text-right' },
    { fieldName: 'cart6B', header: 'cart6B', width: '70', styleName: 'text-right' },
    { fieldName: 'cart7', header: 'cart7', width: '70', styleName: 'text-right' },
    { fieldName: 'cart7F', header: 'cart7F', width: '70', styleName: 'text-right' },
    { fieldName: 'cart7B', header: 'cart7B', width: '70', styleName: 'text-right' },
    { fieldName: 'cart8', header: 'cart8', width: '70', styleName: 'text-right' },
    { fieldName: 'cart8F', header: 'cart8F', width: '70', styleName: 'text-right' },
    { fieldName: 'cart8B', header: 'cart8B', width: '70', styleName: 'text-right' },
    { fieldName: 'cart9', header: 'cart9', width: '70', styleName: 'text-right' },
    { fieldName: 'cart9F', header: 'cart9F', width: '70', styleName: 'text-right' },
    { fieldName: 'cart9B', header: 'cart9B', width: '70', styleName: 'text-right' },
  ];

  const fields = columns.map(({ fieldName }) => ({ fieldName }));
  // eslint-disable-next-line max-len
  // const fields = columns.map(({ fieldName, nanText }) => (nanText ? { fieldName, dataType: 'number' } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout([
    'col1',
    'col2',
    'col3',
    {
      name: 'cart1',
      direction: 'horizontal',
      // hideChildHeaders: true,
      items: [
        'cart1F',
        'cart1B',
      ],
      header: {
        text: 'cart1',
      },
    },
    {
      name: 'cart2',
      direction: 'horizontal',
      // hideChildHeaders: true,
      items: [
        'cart2F',
        'cart2B',
      ],
      header: {
        text: 'cart2',
      },
    },
    {
      name: 'cart3',
      direction: 'horizontal',
      // hideChildHeaders: true,
      items: [
        'cart3F',
        'cart3B',
      ],
      header: {
        text: 'cart3',
      },
    },
    {
      name: 'cart4',
      direction: 'horizontal',
      // hideChildHeaders: true,
      items: [
        'cart4F',
        'cart4B',
      ],
      header: {
        text: 'cart4',
      },
    },
    {
      name: 'cart5',
      direction: 'horizontal',
      // hideChildHeaders: true,
      items: [
        'cart5F',
        'cart5B',
      ],
      header: {
        text: 'cart5',
      },
    },
    {
      name: 'cart6',
      direction: 'horizontal',
      // hideChildHeaders: true,
      items: [
        'cart6F',
        'cart6B',
      ],
      header: {
        text: 'cart6',
      },
    },
    {
      name: 'cart7',
      direction: 'horizontal',
      // hideChildHeaders: true,
      items: [
        'cart7F',
        'cart7B',
      ],
      header: {
        text: 'cart7',
      },
    },
    {
      name: 'cart8',
      direction: 'horizontal',
      // hideChildHeaders: true,
      items: [
        'cart8F',
        'cart8B',
      ],
      header: {
        text: 'cart8',
      },
    },
    {
      name: 'cart9',
      direction: 'horizontal',
      // hideChildHeaders: true,
      items: [
        'cart9F',
        'cart9B',
      ],
      header: {
        text: 'cart9',
      },
    },
  ]);

  view.groupBy(['col1', 'col2', 'fb']);
  view.rowIndicator.visible = true;
  view.setRowGroup({ mergeMode: true });
});

</script>
