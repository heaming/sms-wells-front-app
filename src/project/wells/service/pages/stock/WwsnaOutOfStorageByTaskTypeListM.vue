<!--
 ***************************************************************************************************
 * 프로그램 개요
 ***************************************************************************************************
 1. 모듈 : 품목별 자재출고 현황
 2. 프로그램 ID : WwsnaOutOfStorageByTaskTypeM
 3. 작성자 : heymi.cho
 4. 작성일 : 2023.07.19
 ***************************************************************************************************
 * 프로그램 설명
 ***************************************************************************************************
 - 업무유형별 자재출고 현황 (http://localhost:3000/#/service/wwsna-out-of-storage-by-task-type-list)
 ***************************************************************************************************
-->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
          :colspan="1"
        >
          <kw-date-range-picker
            v-model:from="searchParams.stOstrDt"
            v-model:to="searchParams.edOstrDt"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('TXT_MSG_SAP_MAT_GRP_VAL')"
        >
          <kw-select
            v-model="searchParams.svMatGrpCd"
            :options="codes.SV_MAT_GRP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CST_DV')"
        >
          <kw-select
            v-model="searchParams.cstDvCd"
            :options="codes.COPN_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_STOC_TYPE')"
        >
          <kw-select
            v-model="searchParams.stocTypeCd"
            :options="[...codes.MAT_MNGT_DV_CD, {codeId: 'N', codeName: `(${$t('MSG_TXT_NONE')})`, }]"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.taskTypeCd"
            :options="taskTypes"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_DISP_TYPE')"
          required
        >
          <kw-select
            v-model="searchParams.dispTypeCd"
            :options="dispTypes"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
            @change="onChangeItmDvCd"
          />
          <kw-select
            v-model="searchParams.itmGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            @change="onChangeItmDvCd"
          />
          <kw-select
            v-model="searchParams.itmPdCd"
            :options="optionsItmPdCd"
            option-value="pdCd"
            option-label="pdNm"
            first-option="all"
            required
            @change="onChangeItmPdCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.itmPdCdFrom"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.itmPdCdTo"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
        >
          <kw-select
            v-model="searchParams.pdGdCd"
            :options="codes.PD_GD_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_USE_SEL')"
        >
          <kw-select
            v-model="searchParams.useSel"
            :options="codes.USE_YN"
            first-option="all"
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
            :total-count="pageInfo.totalCount"
            :page-size-options="false"
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
      </kw-action-top>
      <ul class="filter-box mb12">
        <li class="filter-box__item">
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_DIV') }}
          </p>
          <kw-option-group
            dense
            :model-value="matUtlzOptions"
            type="checkbox"
            :options="codes.MAT_UTLZ_DV_CD"
            @change="onChangeMatUtlzDvCd"
          />
        </li>
      </ul>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, gridUtil, useDataService, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
// import { getCodeNames } from '~sms-common/product/utils/pdUtil';

const { t } = useI18n();
const now = dayjs();
const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;
// const { ogTpCd } = getters['meta/getUserInfo'];

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'COPN_DV_CD',
  'MAT_MNGT_DV_CD', // 자재물류유형구분코드
  'MAT_UTLZ_DV_CD', // 자재활용구분코드
  'ITM_KND_CD', // AS자재구분앱코드
  'PD_GD_CD', // 상품등급
  'USE_YN', // 사용유무
  'SV_CNR_CD', // 서비스센터코드
  'PD_GRP_CD',
  'SV_MAT_GRP_CD', // 자재그룹
  // 'TRNOVR_RT_OJ_YN', // 회전율
);

/*
 * kw-select 업무유형
 */
const taskTypes = ref([
  { codeId: '1', codeName: '설치' },
  { codeId: '2', codeName: 'BS' },
  { codeId: '3', codeName: 'AS(유)' },
  { codeId: '4', codeName: 'AS(무)' },
  { codeId: '0', codeName: '기타' },
]);

/*
 * kw-select 표시유형
 */
const dispTypes = ref([
  { codeId: '1', codeName: '수량' },
  { codeId: '2', codeName: '금액' },
]);

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
  stOstrDt: now.set('date', 1).format('YYYYMMDD'),
  edOstrDt: now.format('YYYYMMDD'),
  cstDvCd: '',
  stocTypeCd: '',
  taskTypeCd: '',
  dispTypeCd: '',
  itmKndCd: '',
  itmPdCd: '',
  itmPdCdFrom: '',
  itmPdCdTo: '',
  pdGdCd: '',
  useSel: '',
  itmGrpCd: '',
  svMatGrpCd: '',
});

// const onChangeItmKnd = (val) => {
//   if (val.length < 1) {
//     selectedProductByItmKnd.value = cloneDeep(products.value);
//   } else {
//     selectedProductByItmKnd.value = products.value.filter((v) => v.itmKndCd === val);
//   }
// };

const onChangeItmPdCd = (val) => {
  if (val !== '') {
    searchParams.value.itmPdCdFrom = val;
    searchParams.value.itmPdCdTo = val;
  }
};

// 품목구분 변경
const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();

const getProducts = async () => {
  const result = await dataService.get('/sms/wells/service/monthly-by-stock-state/products');
  const pdCds = result.data.map((v) => v.pdCd);
  optionsItmPdCd.value = result.data.filter((v, i) => pdCds.indexOf(v.pdCd) === i);
  optionsAllItmPdCd.value = result.data;
};

const onChangeItmDvCd = () => {
  searchParams.value.itmPdCds = [];
  const { itmKndCd, itmGrpCd } = searchParams.value;

  if (isEmpty(itmKndCd) && isEmpty(itmGrpCd)) {
    const pdCds = optionsAllItmPdCd.value.map((v) => v.pdCd);
    optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v, i) => pdCds.indexOf(v.pdCd) === i);
    return;
  }

  const filterPdInfos = optionsAllItmPdCd.value.filter(
    (v) => (isEmpty(itmKndCd) || itmKndCd === v.itmKndCd) && (isEmpty(itmGrpCd) || itmGrpCd === v.itmGrpCd),
  );

  if (isEmpty(itmGrpCd)) {
    const pdCds = filterPdInfos.map((v) => v.pdCd);
    optionsItmPdCd.value = filterPdInfos.filter((v, i) => pdCds.indexOf(v.pdCd) === i);
  } else {
    optionsItmPdCd.value = filterPdInfos;
  }
};

const wareColumns = ref([]);

/* 그리드 필드 */
async function getWareFields() {
  const result = await dataService.get('/sms/wells/service/out-of-storage-by-task-type/ware-fields', { params: searchParams.value });
  const resultArr = [];

  result.data.forEach((item) => {
    const column = { fieldName: `typ${item.wareNo}`, header: item.wareNm, width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0', nanText: '0' };
    resultArr.push(column);
  });

  console.log(resultArr);

  wareColumns.value = resultArr;
}

const baseColumns = [
  { fieldName: 'matMngtDvCd', header: t('MSG_TXT_STOC_TYPE'), width: '100', styleName: 'text-center', visible: true },
  { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '120', styleName: 'text-center', visible: true },
  { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '140', styleName: 'text-center', visible: true },
  { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '270', styleName: 'text-center', visible: true },
  { fieldName: 'typ999999', header: t('MSG_TXT_AGG'), width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0', nanText: '0' },
  { fieldName: 'cmnPartDvCd', header: t('MSG_TXT_MDIM_RPR'), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
  { fieldName: 'ordnyHvMatYn', header: t('MSG_TXT_BTD'), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
  { fieldName: 'trnoverRtOjYn', header: t('MSG_TXT_TXT_MSG_TURNR_OJ_YN'), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
];

async function fetchData() {
  await getWareFields();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/out-of-storage-by-task-type/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  pageInfo.value.totalCount = state.length;

  const view = grdMainRef.value.getView();
  const data = grdMainRef.value.getData();
  const columns = [...baseColumns, ...wareColumns.value];
  console.log(columns);

  // eslint-disable-next-line max-len
  const fields = columns.map(({ fieldName, dataType, visible }) => (dataType ? { fieldName, dataType, visible } : { fieldName, visible }));

  data.setFields(fields);
  view.setColumns(columns);

  view.getDataSource().setRows(state);
  console.log(state);
  view.resetCurrent();
  await gridUtil.reset(view);
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
  // await getWareFields();
  const view = grdMainRef.value.getView();
  // const data = grdMainRef.value.getData();
  // const columns = [...baseColumns, ...wareColumns.value];
  // // console.log(columns);

  // eslint-disable-next-line max-len
  // const fields = columns.map(({ fieldName, dataType, visible }) => (dataType ? { fieldName, dataType, visible } : { fieldName, visible }));

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/out-of-storage-by-task-type/excel-download', { params: searchParams.value });
  // data.setFields(fields);
  // view.setColumns(columns);
  // view.getDataSource().setRows(res);

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

/*
 * 그리드 데이터 필터링
 */
const matUtlzOptions = ref([]);
// const filters = [];
const onChangeMatUtlzDvCd = (val) => {
  const view = grdMainRef.value.getView();

  const filter1 = [{
    name: 'cmnPartFilter', // 중수리 01
    criteria: 'value="01"',
  }];
  const filter2 = [{
    name: 'ordnyHvMatFilter', // 기초자재 Y
    criteria: 'value="Y"',
  }];
  const filter3 = [{
    name: 'trnoverFilter', // 회전율
    criteria: 'value="Y"',
  }];

  view.setColumnFilters('cmnPartDvCd', filter1);
  view.setColumnFilters('ordnyHvMatYn', filter2);
  view.setColumnFilters('trnoverRtOjYn', filter3);

  if (val.includes('01')) {
    view.activateColumnFilters('cmnPartDvCd', false);
    view.activateColumnFilters('cmnPartDvCd', ['cmnPartFilter'], true);
  } else {
    view.activateColumnFilters('cmnPartDvCd', ['cmnPartFilter'], false);
  }

  if (val.includes('02')) {
    view.activateAllColumnFilters('ordnyHvMatYn', false);
    view.activateColumnFilters('ordnyHvMatYn', ['ordnyHvMatFilter'], true);
  } else {
    view.activateColumnFilters('ordnyHvMatYn', ['ordnyHvMatFilter'], false);
  }

  if (val.includes('03')) {
    view.activateColumnFilters('trnoverRtOjYn', false);
    view.activateColumnFilters('trnoverRtOjYn', ['trnoverFilter'], true);
  } else {
    view.activateColumnFilters('trnoverRtOjYn', ['trnoverFilter'], false);
  }
};

onMounted(() => {
  searchParams.value.dispTypeCd = '1';
  getProducts();
  getWareFields();
});

Promise.all([
  getProducts(),
  getWareFields(),
]);

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid(async (data, view) => {
  await getWareFields();
  console.log(wareColumns.value);

  const columns = [
    ...baseColumns,
    ...wareColumns.value,
  ];
  // eslint-disable-next-line max-len
  const fields = columns.map(({ fieldName, dataType, visible }) => (dataType ? { fieldName, dataType, visible } : { fieldName, visible }));

  view.rowIndicator.visible = true;
  view.checkBar.visible = true;
  data.setFields(fields);
  view.setColumns(columns);
  view.filteringOptions.enabled = false;
  view.setFixedOptions({ colCount: 5 });
});

</script>
