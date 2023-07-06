<!--
 ***************************************************************************************************
 * 프로그램 개요
 ***************************************************************************************************
 1. 모듈 : 일자별 설치재고 현황
 2. 프로그램 ID : K-W-SV-U-0116M01
 3. 작성자 : heymi.cho
 4. 작성일 : 2023.07.05
 ***************************************************************************************************
 * 프로그램 설명
 ***************************************************************************************************
 - 입고 미승인 현황 (http://localhost:3000/#/service/wwsna-installation-stock-ps-by-day)
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
            :rules="required"
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
import { cloneDeep, isEmpty } from 'lodash-es';
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
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
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
  const response = await dataService.get('/sms/wells/service/product-list/by-itmkndcd', { params: { itmKndCd: '4' } });
  productList.value = response.data;
  selectedProductByItmKnd.value = cloneDeep(productList.value);
}

onMounted(async () => {
  getProductList();
  searchParams.value.itmKndCd = '4';
  // selectedProductByItmKnd.value.map((v) => {
  //   console.log(v.codeName);
  //   v.codeName = `${v.codeId} ${v.codeName}`;
  //   return v;
  // });
});

const onChangeItmKnd = (val) => {
  // console.log(val);
  if (val.length < 1) {
    selectedProductByItmKnd.value = cloneDeep(productList.value);
  } else {
    selectedProductByItmKnd.value = productList.value.filter((v) => v.itmKndCd === val);
  }
};

async function fetchData() {
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/installation-stock-by-day/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  view.resetCurrent();
  await gridUtil.reset(view);
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
    component: '',
    componentProps: {},
  });

  if (result) {
    await fetchData();
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
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
      fieldName: `stockDate${i}`,
      header: baseDt.add(i, 'day').format('MM/DD(ddd)'),
      width: '100',
      styleName: 'text-right',
    };

    const stockDateField = {
      fieldName: `stockDate${i}`,
    };

    const installDateColumn = {
      fieldName: `installDate${i}`,
      header: baseDt.add(i, 'day').format('MM/DD(ddd)'),
      width: '100',
      styleName: 'text-right',
    };

    const installDateField = {
      fieldName: `installDate${i}`,
    };

    stockDateColumns.push(stockDateColumn);
    stockDateFields.push(stockDateField);
    stockDateItems.push(`stockDate${i}`);
    installDateColumns.push(installDateColumn);
    installDateFields.push(installDateField);
    installDateItems.push(`installDate${i}`);
  }
};

const initGrid = defineGrid((data, view) => {
  cachedParams = cloneDeep(searchParams.value);
  getDateColumnsFields(cachedParams.baseDt);

  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    ...stockDateFields,
    { fieldName: 'col5' },
    ...installDateFields,
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), width: '247' },
    { fieldName: 'col2', header: t('MSG_TXT_CENTER_DIVISION'), width: '100', styleName: 'text-right' },
    { fieldName: 'col3', header: t('MSG_TXT_EGER'), width: '100', styleName: 'text-right' },
    { fieldName: 'col4', header: t('MSG_TXT_SUM'), width: '100', styleName: 'text-right' },
    ...stockDateColumns,
    { fieldName: 'col5', header: t('MSG_TXT_AGG'), width: '100', styleName: 'text-right' },
    ...installDateColumns,
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setColumnLayout([
    'col1',
    {
      header: t('MSG_TXT_CURRENT') + t('MSG_TXT_STOC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col2', 'col3', 'col4'],
    },
    {
      header: t('MSG_TXT_STOC') + t('MSG_TXT_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: stockDateItems,
    },
    'col5',
    {
      header: t('MSG_BTN_CNTCT_ASSGNMNT') + t('MSG_TXT_PS'), // colspan title
      direction: 'horizontal', // merge type
      items: installDateItems,
    },
  ]);
  view.setFixedOptions({ colCount: 1 });

  data.setRows([
    { col1: '서대구지점', col2: '0', col3: '0', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0' },
    { col1: '서대구지점', col2: '0', col3: '0', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0' },
    { col1: '서대구지점', col2: '0', col3: '0', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0' },
    { col1: '서대구지점', col2: '0', col3: '0', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0' },
    { col1: '서대구지점', col2: '0', col3: '0', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0' },
    { col1: '서대구지점', col2: '0', col3: '0', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0' },
    { col1: '서대구지점', col2: '0', col3: '0', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0' },
    { col1: '서대구지점', col2: '0', col3: '0', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0' },
    { col1: '서대구지점', col2: '0', col3: '0', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0' },
    { col1: '서대구지점', col2: '0', col3: '0', col4: '0', col5: '0', col6: '0', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0' },

  ]);

  // data.setFields(fields);
  // view.setColumns(columns);
  // view.rowIndicator.visible = true;

  // dbclick row
  view.onCellDblClicked = async (grid, clickData) => {
    if (isEmpty(grid.getValue(clickData.itemIndex, 'strWareNo')) || isEmpty(grid.getValue(clickData.itemIndex, 'itmPdCd'))) {
      return;
    }

    const { result } = await modal({
      component: 'WwsnaStoreNaprvStateDtlP',
      componentProps: { strWareNo: grid.getValue(clickData.itemIndex, 'strWareNo'), itmPdCd: grid.getValue(clickData.itemIndex, 'itmPdCd') },
    });

    if (result) await fetchData();
  };
});

</script>
