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
 - 업무유형별 자재출고 현황 (http://localhost:3000/#/service/wwsna-out-of-storage-by-task-type)
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
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.stOstrDt"
            v-model:to="searchParams.edOstrDt"
            rules="date_range_months:1"
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
            :options="taskTypeInfo"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_DISP_TYPE')"
          required
        >
          <kw-select
            v-model="searchParams.dispTypeCd"
            :options="dispTypeInfo"
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
            class="w150"
            first-option="all"
            @change="onChangeItmKnd"
          />
          <kw-select
            v-model="searchParams.itmPdCd"
            :options="selectedProductByItmKnd"
            first-option="all"
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
import { getCodeNames } from '~sms-common/product/utils/pdUtil';

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
  // 'TRNOVR_RT_OJ_YN', // 회전율
);

/*
 * kw-select 업무유형
 */
const taskTypeInfo = ref([
  { codeId: '1', codeName: '설치' },
  { codeId: '2', codeName: 'BS' },
  { codeId: '3', codeName: 'AS(유)' },
  { codeId: '4', codeName: 'AS(무)' },
  { codeId: '0', codeName: '기타' },
]);

/*
 * kw-select 표시유형
 */
const dispTypeInfo = ref([
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
});

/*
 *  Select Component 초기화 - 전체 상품 목록 가져오기
 */
const productList = ref([]);
const selectedProductByItmKnd = ref([]);

async function getProductList() {
  // cachedParams = cloneDeep(searchParams);
  const response = await dataService.get('/sms/wells/service/product-list/by-itmkndcd', { params: { itmKndCd: searchParams.value.itmKndCd } });
  productList.value = response.data;
}

onMounted(async () => {
  await getProductList();
  selectedProductByItmKnd.value = cloneDeep(productList.value);
  searchParams.value.dispTypeCd = '1';
});

const onChangeItmKnd = (val) => {
  if (val.length < 1) {
    selectedProductByItmKnd.value = cloneDeep(productList.value);
  } else {
    selectedProductByItmKnd.value = productList.value.filter((v) => v.itmKndCd === val);
  }
};

const onChangeItmPdCd = (val) => {
  if (val !== '') {
    searchParams.value.itmPdCdFrom = val;
    searchParams.value.itmPdCdTo = val;
  }
};

/*
 * 서비스센터 컬럼 세팅 - (보류) 서비스센터 공통코드 데이터 추가 필요
 */
// const svcCntrCdColumn = codes.SV_CNR_CD.map((v) => ({
//   fieldName: `typ${v.codeId}`,
//   header: v.codeName,
//   width: '80',
//   styleName: 'text-right',
//   dataType: 'number',
//   groupFooter: {
//     numberFormat: '#,##0',
//     expression: 'sum',
//   },
//   visible: true,
// }));

async function fetchData() {
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/out-of-storage-by-task-type/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
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
  const view = grdMainRef.value.getView();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/out-of-storage-by-task-type/excel-download', { params: searchParams.value });

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
  // view.activateAllColumnFilters('ordnyHvMatYn', false);
  // view.activateAllColumnFilters('cmnPartDvCd', false);
  // view.activateAllColumnFilters('trnoverRtOjYn', false);

  if (val.length === 0) {
    return;
  }

  view.setColumnFilters('cmnPartDvCd', [{
    name: 'cmnPartFilter', // 중수리 01
    criteria: 'value="Y"',
  }]);

  view.setColumnFilters('ordnyHvMatYn', [{
    name: 'ordnyHvMatFilter', // 기초자재 Y
    criteria: 'value="Y"',
  }]);

  view.setColumnFilters('trnoverRtOjYn', [{
    name: 'trnoverFilter', // 회전율 Y
    criteria: 'value="Y"',
  }]);

  if (val.includes('01')) {
    view.activateColumnFilters('cmnPartDvCd', ['01'], true);
  } else {
    view.activateColumnFilters('cmnPartDvCd', ['cmnPartFilter'], false);
  }

  if (val.includes('02')) {
    view.activateColumnFilters('ordnyHvMatYn', ['ordnyHvMatFilter'], true);
  } else {
    view.activateColumnFilters('ordnyHvMatYn', ['ordnyHvMatFilter'], false);
  }

  if (val.includes('03')) {
    view.activateColumnFilters('cmnPartDvCd', ['trnoverFilter'], true);
  } else {
    view.activateColumnFilters('cmnPartDvCd', ['trnoverFilter'], false);
  }
};

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'matMngtDvCd',
      header: t('MSG_TXT_STOC_TYPE'),
      width: '100',
      styleName: 'text-center',
      visible: true,
      displayCallback: (grid, index) => getCodeNames(codes.MAT_MNGT_DV_CD, grid.getValue(index.itemIndex, 'matMngtDvCd')),
    },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '120', styleName: 'text-center', visible: true },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '140', styleName: 'text-center', visible: true },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '270', styleName: 'text-center', visible: true },
    { fieldName: 'typ200001', header: '성수', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200002', header: '의정부', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200465', header: '남양주', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200009', header: '원주', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200006', header: '수원', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200024', header: '안양', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200017', header: '광명', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200005', header: '인천', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200003', header: '일산', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200010', header: '청주', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200012', header: '대전', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200466', header: '천안', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200014', header: '전주', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200013', header: '광주', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200609', header: '순천', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200127', header: '서대구', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200467', header: '동대구', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200007', header: '부산', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200371', header: '김해', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200008', header: '창원', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200015', header: '제주', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200608', header: '포항', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200672', header: '진주', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ200934', header: '강서', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ201064', header: '인천공장', width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'typ999999', header: t('MSG_TXT_AGG'), width: '80', styleName: 'text-center', visible: true, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'ordnyHvMatYn', header: t('MSG_TXT_BTD'), width: '150', styleName: 'text-center', visible: false },
    { fieldName: 'cmnPartDvCd', header: t('MSG_TXT_MDIM_RPR'), width: '150', styleName: 'text-center', visible: false },
    { fieldName: 'trnoverRtOjYn', header: t('MSG_TXT_TXT_MSG_TURNR_OJ_YN'), width: '150', styleName: 'text-center', visible: false },
  ];
  // eslint-disable-next-line max-len
  const fields = columns.map(({ fieldName, dataType, visible }) => (dataType ? { fieldName, dataType, visible } : { fieldName, visible }));

  view.rowIndicator.visible = true;
  view.checkBar.visible = true;
  data.setFields(fields);
  view.setColumns(columns);
});

</script>
