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
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_DT')"
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
      <h3>{{ $t('MSG_TIT_SDING_TRUCK_AGRG_BY_PCK') }}</h3>
      <kw-grid
        ref="grdSubRef"
        name="grdSub"
        :visible-rows="1"
        class="mb5"
        @init="initGrid1"
      />
      <h3>{{ t('MSG_TIT_SDING_TRUCK_AGRG_BY_CNTER') }}</h3>
      <kw-action-top>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount===0"
          @click="onClickExcelDownload"
        />
        <kw-btn
          dense
          primary
          :label="$t('MSG_BTN_PRINT_LABEL')"
          :disable="totalCount===0"
          @click="onClickLabelDownload"
        />
      </kw-action-top>
      <!-- <ul class="filter-box mb12">
        <li class="filter-box__item">
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_DG_GG_LCT') }}
          </p>
          <kw-option-group
            dense
            type="checkbox"
            :options="codes.GG_LCT_CD"
            :model-value="filterCenters"
            @change="onChangeDgLct"
          />
        </li>
      </ul> -->
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :total-count="totalCount"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, gridUtil, useDataService, defineGrid } from 'kw-lib';
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
const totalCount = ref(0);

// const codes = await codeUtil.getMultiCodes(
//   'COD_PAGE_SIZE_OPTIONS',
//   'SDING_PKG_GRP_CD', // 모종패키지
//   'GG_LCT_CD', // 집하위치
// );

/*
 *  Search Parameter
 */
const searchParams = ref({
  fshProcsCd: '00', // 작업대기
  dtTpCd: '3', // 확정일자
  sppDvCd: '1', // 방문
  pkgDvCd: '1', // 모종
  baseDt: now.format('YYYYMMDD'),
});

/*
 * 필터링 - 보류
 */
// const filterCenters = ref([]);
// const onChangeDgLct = (val) => {
//   const view = grdMainRef.value.getView();
//   const dgLctCdFilterCond = codes.GG_LCT_CD.map((v) => ({ name: v.codeId, criteria: `value="${v.codeId}"` }));
//   view.setColumnFilters('dgLctCd', dgLctCdFilterCond);
//   console.log(dgLctCdFilterCond);
//   view.activateAllColumnFilters('dgLctCd', true);
//   if (dgLctCdFilterCond) {
//     const f = view.getActiveColumnFilters('dgLctCd');
//     console.log(f);
//   }

//   view.activateAllColumnFilters('dgLctCd', false);
//   console.log(view.getColumnFilters('dgLctCd'));

//   if (val) {
//     const f = view.getActiveColumnFilters('dgLctCd');
//     console.log(f);
//     view.activateColumnFilters('dgLctCd', 'dgLctCdFilterCond', true);
//   }
// };

/*
 *  Main Grid
 */
async function fetchData() {
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/seeding-truck-arrangement-map/map', { params: { ...cachedParams } });
  const viewMain = grdMainRef.value.getView();
  viewMain.getDataSource().setRows(res.data.seedAgrgRes);
  viewMain.resetCurrent();
  totalCount.value = res.data.seedAgrgRes.length;
  // await gridUtil.reset(viewMain);

  const viewSub = grdSubRef.value.getView();
  const temp = [];
  temp.push(res.data.seedTotalRes);
  viewSub.getDataSource().setRows(temp);

  // console.log(res.data.seedTotalRes);
  viewSub.resetCurrent();
  // await gridUtil.reset(viewSub);
}

/*
 *  Search - 조회
 */

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/seeding-truck-arrangement-map/map', { params: searchParams.value });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data.seedAgrgRes,
  });
}

async function onClickLabelDownload() {
  const view = grdMainRef.value.getView();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/seeding-truck-arrangement-map/map', { params: searchParams.value });
  const exportLayout = [
    'dgLctNm',
    'truckNo',
    'cart1F',
    'cart1B',
    'cart2F',
    'cart2B',
    'cart3F',
    'cart3B',
    'cart4F',
    'cart4B',
    'cart5F',
    'cart5B',
    'cart6F',
    'cart6B',
    'cart7F',
    'cart7B',
    'cart8F',
    'cart8B',
    'cart9F',
    'cart9B',
  ];

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data.seedAgrgRes,
    exportLayout,
  });
}
/*
 * 필터 만들기
 */
// async function initGridRows() {
//   const view = grdMainRef.value?.getView();
//   if (view) {
//     const dgLctCdFilterCond = codes.GG_LCT_CD.map((v) => ({ name: v.codeId, criteria: `value='${v.codeId}'` }));

//     if (dgLctCdFilterCond) {
//       view.setColumnFilters('dgLctCd', dgLctCdFilterCond, true);
//     }

//     // view.getDataSource().setRows();
//   }
// }

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgLctCd', header: 'NO', width: '50', styleName: 'text-center kw-bc--bg-grid text-weight-medium' },
    { fieldName: 'dgLctNm', header: t('MSG_TXT_DG_GG_LCT'), width: '70', styleName: 'text-center kw-bc--bg-grid text-weight-medium' },
    { fieldName: 'truckNo', header: t(''), width: '70', styleName: 'text-center' },
    { fieldName: 'cart1', header: 'cart1', width: '150', styleName: 'text-left' },
    { fieldName: 'cart1F', header: 'cart1F', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart1B', header: 'cart1B', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart2', header: 'cart2', width: '150', styleName: 'text-left ' },
    { fieldName: 'cart2F', header: 'cart2F', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart2B', header: 'cart2B', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart3', header: 'cart3', width: '150', styleName: 'text-left' },
    { fieldName: 'cart3F', header: 'cart3F', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart3B', header: 'cart3B', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart4', header: 'cart4', width: '150', styleName: 'text-left' },
    { fieldName: 'cart4F', header: 'cart4F', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart4B', header: 'cart4B', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart5', header: 'cart5', width: '150', styleName: 'text-left' },
    { fieldName: 'cart5F', header: 'cart5F', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart5B', header: 'cart5B', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart6', header: 'cart6', width: '150', styleName: 'text-left' },
    { fieldName: 'cart6F', header: 'cart6F', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart6B', header: 'cart6B', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart7', header: 'cart7', width: '150', styleName: 'text-left' },
    { fieldName: 'cart7F', header: 'cart7F', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart7B', header: 'cart7B', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart8', header: 'cart8', width: '150', styleName: 'text-left' },
    { fieldName: 'cart8F', header: 'cart8F', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart8B', header: 'cart8B', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart9', header: 'cart9', width: '150', styleName: 'text-left' },
    { fieldName: 'cart9F', header: 'cart9F', width: '150', styleName: 'text-left multiline' },
    { fieldName: 'cart9B', header: 'cart9B', width: '150', styleName: 'text-left multiline' },
  ];

  const fields = columns.map(({ fieldName }) => ({ fieldName }));
  // eslint-disable-next-line max-len
  // const fields = columns.map(({ fieldName, nanText }) => (nanText ? { fieldName, dataType: 'number' } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout([
    'dgLctCd',
    'dgLctNm',
    'truckNo',
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

  view.displayOptions.rowHeight = -1;
  view.fixedOptions.colCount = 2;
  view.filteringOptions.enabled = false;

  // initGridRows();
  // view.groupBy(['dgLctNm']);
  // view.rowIndicator.visible = true;
  // view.setRowGroup({ mergeMode: true });
});

const initGrid1 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pak01', dataType: 'number' },
    { fieldName: 'pak02', dataType: 'number' },
    { fieldName: 'pak03', dataType: 'number' },
    { fieldName: 'pak04', dataType: 'number' },
    { fieldName: 'pak05', dataType: 'number' },
    { fieldName: 'pak13', dataType: 'number' },
    { fieldName: 'pak23', dataType: 'number' },
    { fieldName: 'pak50', dataType: 'number' },
    { fieldName: 'pak24', dataType: 'number' },
    { fieldName: 'pak08', dataType: 'number' },
    { fieldName: 'pak09', dataType: 'number' },
    { fieldName: 'pak12', dataType: 'number' },
    { fieldName: 'pak51', dataType: 'number' },
    { fieldName: 'pak52', dataType: 'number' },
    { fieldName: 'pak53', dataType: 'number' },
    { fieldName: 'pak54', dataType: 'number' },
    { fieldName: 'pak55', dataType: 'number' },
    { fieldName: 'pak56', dataType: 'number' },
    { fieldName: 'pak57', dataType: 'number' },
    { fieldName: 'pak58', dataType: 'number' },
    { fieldName: 'pak60', dataType: 'number' },
    { fieldName: 'pak28', dataType: 'number' },
    { fieldName: 'pak29', dataType: 'number' },
    { fieldName: 'pak30', dataType: 'number' },
    { fieldName: 'pak31', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'pak01',
      header: t('MSG_TXT_SALAD'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak02',
      header: t('MSG_TXT_VGT_DIET'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak03',
      header: t('MSG_TXT_HL_DINING_TBL'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak04',
      header: t('MSG_TXT_CANCER_HL'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak05',
      header: t('MSG_TXT_SLEEP_HEALING'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak13',
      header: t('MSG_TXT_CLD_FOOD'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak23',
      header: t('MSG_TXT_MINI'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak50',
      header: t('MSG_TXT_CLD_GWUP'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak24',
      header: t('MSG_TXT_CHO_SDING'),
      width: '100',
      styleName: 'text-right' },
    { fieldName: 'pak08',
      header: t('MSG_TXT_BUTTER_HEAD'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak09',
      header: t('MSG_TXT_KALE'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak12',
      header: t('MSG_TXT_VITAMINS'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak51',
      header: t('MSG_TXT_SATIVA'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak52',
      header: t('MSG_TXT_YUREUM'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak53',
      header: t('MSG_TXT_BOK_CHOY'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak54',
      header: t('MSG_TXT_SATIVA_YUREUM'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak55',
      header: t('MSG_TXT_SATIVA_BOK_CHOY'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak56',
      header: t('MSG_TXT_SATIVA_RED'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak57',
      header: t('MSG_TXT_YUREUM_BOK_CHOY'),
      width: '100',
      styleName: 'text-right m',
    },
    { fieldName: 'pak58',
      header: t('MSG_TXT_YEREUM_RED'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak60',
      header: `${t('MSG_TXT_FRDM_WIDE')}`,
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak28',
      header: t('MSG_TXT_EUROP'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak29',
      header: t('MSG_TXT_OU_FML'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak30',
      header: t('MSG_TXT_ASSORT_WRAPS'),
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'pak31',
      header: t('MSG_TXT_FNC_VGT'),
      width: '100',
      styleName: 'text-right',
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.header.height += view.header.height + 50;
  // data.setRows([
  //   { pak01: 13 },
  // ]);
});

</script>
