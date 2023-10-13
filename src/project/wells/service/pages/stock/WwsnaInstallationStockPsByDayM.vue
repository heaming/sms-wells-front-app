<!--
 ***************************************************************************************************
 * 프로그램 개요
 ***************************************************************************************************
 1. 모듈 : 일자별 설치재고 현황
 2. 프로그램 ID : WwsnaInstallationStockPsByDayM
 3. 작성자 : heymi.cho
 4. 작성일 : 2023.07.05
 ***************************************************************************************************
 * 프로그램 설명
 ***************************************************************************************************
 - 일자별 설치재고 현황 (http://localhost:3000/#/service/wwsna-installation-stock-ps-by-day)
 - K-W-SV-U-0116M01
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
          :label="$t('MSG_TXT_BASE_DT')"
          :colspan="1"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseDt"
            :label="$t('MSG_TXT_BASE_DT')"
            rules="required"
            type="date"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.pdGdCd"
            :options="codes.PD_GD_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :label="$t('MSG_TXT_ITM_DV')"
            :options="codes.ITM_KND_CD"
            first-option="all"
            disable
            @change="onChangeItmKnd"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="selectedProductByItmKnd"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="1"
        >
          <kw-input
            v-model="searchParams.pdCd"
            :label="$t('MSG_TXT_ITM_CD')"
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
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          primary
          dense
          :label="$t('MSG_BTN_CNTCT_ASSGNMNT')"
          @click="onClickCntctPopup"
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
import { codeUtil, getComponentType, gridUtil, useDataService, defineGrid, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

const { t } = useI18n();
const now = dayjs();
const { modal } = useGlobal();
// const { getters } = useStore();
const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GD_CD',
  'ITM_KND_CD',
  'PD_GRP_CD',
);

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 30,
  needTotalCount: true,
});

/*
 *  Search Parameter
 */
const searchParams = ref({
  baseDt: now.format('YYYYMMDD'),
  pdGdCd: '',
  itmKndCd: '',
  pdCd: '',
});

/*
 *  Select Component 초기화 - 전체 상품 목록 가져오기
 */
const productList = ref([]);
const selectedProductByItmKnd = ref([]);

async function getProductList() {
  cachedParams = cloneDeep(searchParams);
  const response = await dataService.get('/sms/wells/service/product-list/by-itmkndcd', { params: { itmKndCd: searchParams.value.itmKndCd } });
  productList.value = response.data;
}

onBeforeMount(async () => {
  searchParams.value.itmKndCd = '4';
});

onMounted(async () => {
  await getProductList();
  selectedProductByItmKnd.value = cloneDeep(productList.value);
  selectedProductByItmKnd.value = selectedProductByItmKnd.value.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId} - ${v.codeName}` }));
  console.log(selectedProductByItmKnd.value);
});

const onChangeItmKnd = (val) => {
  if (val.length < 1) {
    selectedProductByItmKnd.value = cloneDeep(productList.value);
  } else {
    selectedProductByItmKnd.value = productList.value.filter((v) => v.itmKndCd === val);
  }
};

let stockDateColumns = [];
let stockDateFields = [];
let stockDateItems = [];
let installDateColumns = [];
let installDateFields = [];
let installDateItems = [];

/*
 * 동적 컬럼, 필드 생성 (일자별)
 */
const getDateColumnsFields = (searchDt) => {
  stockDateColumns = [];
  stockDateFields = [];
  stockDateItems = [];
  installDateColumns = [];
  installDateFields = [];
  installDateItems = [];

  const baseDt = searchDt ? dayjs(searchDt).locale('ko') : now.locale('ko');

  for (let i = 0; i < 15; i += 1) {
    const stockDateColumn = {
      fieldName: `stockdate${i + 1}`,
      header: baseDt.add(i, 'day').format('MM/DD(ddd)'),
      width: '100',
      styleName: 'text-right',
    };

    const stockDateField = {
      fieldName: `stockdate${i + 1}`,
    };

    const installDateColumn = {
      fieldName: `installdate${i + 1}`,
      header: baseDt.add(i, 'day').format('MM/DD(ddd)'),
      width: '100',
      styleName: 'text-right',
    };

    const installDateField = {
      fieldName: `installdate${i + 1}`,
    };

    stockDateColumns.push(stockDateColumn);
    stockDateFields.push(stockDateField);
    stockDateItems.push(`stockdate${i + 1}`);
    installDateColumns.push(installDateColumn);
    installDateFields.push(installDateField);
    installDateItems.push(`installdate${i + 1}`);
  }
};

async function fetchData() {
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/installation-stock-by-day/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  getDateColumnsFields(cachedParams.baseDt);
  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_DIV'), width: '247' },
    { fieldName: 'prvMng', header: t('MSG_TXT_CENTER_DIVISION'), width: '100', styleName: 'text-right' },
    { fieldName: 'engQty', header: t('MSG_TXT_EGER'), width: '100', styleName: 'text-right' },
    { fieldName: 'stockTotal', header: t('MSG_TXT_SUM'), width: '100', styleName: 'text-right' },
    ...stockDateColumns,
    ...installDateColumns,
    { fieldName: 'istTotal', header: t('MSG_TXT_AGG'), width: '100', styleName: 'text-right' },
  ];

  view.setColumns(columns);
  view.getDataSource().setRows(state);
  view.setColumnLayout([
    'ogNm',
    {
      header: t('MSG_TXT_CURRENT') + t('MSG_TXT_STOC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['prvMng', 'engQty', 'stockTotal'],
    },
    {
      header: t('MSG_TXT_STOC') + t('MSG_TXT_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: stockDateItems,
    },

    {
      header: t('MSG_BTN_CNTCT_ASSGNMNT') + t('MSG_TXT_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: installDateItems,
    },
    'istTotal',
  ]);
  view.resetCurrent();
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
  const res = await dataService.get('/sms/wells/service/installation-stock-by-day/excel-download', { params: searchParams.value });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

/*
 *  Event - 설치배정세팅 팝업창 // W-SV-U-0171P01
 */
// TODO: 팝업창 개발하시면 추가 예정
async function onClickCntctPopup() {
  const { result } = await modal({
    component: 'WwsnaInstallationAssignSettingP',
    componentProps: { },
  });

  if (result) {
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  cachedParams = cloneDeep(searchParams.value);
  getDateColumnsFields(cachedParams.baseDt);

  const fields = [
    { fieldName: 'ogId' },
    { fieldName: 'ogNm' },
    { fieldName: 'ogInfo' },
    { fieldName: 'prvMng' },
    { fieldName: 'engQty' },
    { fieldName: 'stockTotal' },
    ...stockDateFields,
    ...installDateFields,
    { fieldName: 'istTotal' },
  ];

  const columns = [
    { fieldName: 'ogId', header: t('MSG_TXT_DIV'), width: '247', display: false },
    { fieldName: 'ogNm', header: t('MSG_TXT_DIV'), width: '247', display: false },
    { fieldName: 'ogInfo',
      header: t('MSG_TXT_DIV'),
      width: '247',
      displayCallback(grid, index) {
        const { ogId: no1, ogNm: no2 } = grid.getValues(index.itemIndex);
        return `${no2} (${no1})`;
      } },
    { fieldName: 'prvMng', header: t('MSG_TXT_CENTER_DIVISION'), width: '100', styleName: 'text-right' },
    { fieldName: 'engQty', header: t('MSG_TXT_EGER'), width: '100', styleName: 'text-right' },
    { fieldName: 'stockTotal', header: t('MSG_TXT_SUM'), width: '100', styleName: 'text-right' },
    ...stockDateColumns,
    ...installDateColumns,
    { fieldName: 'istTotal', header: t('MSG_TXT_AGG'), width: '100', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setColumnLayout([
    'ogNm',
    {
      header: t('MSG_TXT_CURRENT') + t('MSG_TXT_STOC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['prvMng', 'engQty', 'stockTotal'],
    },
    {
      header: t('MSG_TXT_STOC') + t('MSG_TXT_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: stockDateItems,
    },

    {
      header: t('MSG_BTN_CNTCT_ASSGNMNT') + t('MSG_TXT_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: installDateItems,
    },
    'istTotal',
  ]);
  view.setFixedOptions({ colCount: 1 });

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});

</script>
