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
  <kw-search
    :cols="8"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_BASE_DT')"
        :colspan="2"
        required
      >
        <kw-date-picker
          v-model="searchParams.baseDt"
          :label="$t('MSG_TXT_BASE_DT')"
          rules="required"
          type="date"
          :disable="true"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_GD')"
        :colspan="2"
      >
        <kw-select
          v-model="searchParams.pdGdCd"
          :options="codes.PD_GD_CD"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_ITM_DV')"
        :colspan="4"
      >
        <kw-select
          v-model="searchParams.itmKndCd"
          :options="codes.ITM_KND_CD"
          first-option="all"
          :disable="true"
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
          first-option="select"
          required
          @change="onChangePdCd"
        />
      </kw-search-item>
      <!-- <WwsnProductSearchItemGroup
        :colspan="2"
        :use-pd-cd-list="false"
        :use-div-levl="3"
      /> -->
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_ITM_CD')"
        :colspan="2"
      >
        <kw-input
          v-model="searchParams.itmPdCd"
          :label="$t('MSG_TXT_ITM_CD')"
          @change="onChangePdCd"
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
      ref="grdCenterRef"
      name="grdCenter"
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
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, gridUtil, useDataService, defineGrid, useGlobal, alert } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
// import WwsnProductSearchItemGroup from '~sms-wells/service/components/WwsnProductSearchItemGroup.vue';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

const { t } = useI18n();
const now = dayjs();
const { modal } = useGlobal();
const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdCenterRef = ref(getComponentType('KwGrid'));
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
  itmKndCd: '4',
  itmPdCd: '',
  itmGrpCd: '',
});

// async function getProductList() {
//   cachedParams = cloneDeep(searchParams);
// eslint-disable-next-line max-len
//   const response = await dataService.get('/sms/wells/service/product-list/by-itmkndcd', { params: { itmKndCd: '4' } });
//   productList.value = response.data;
// }

// const onChangeItmKnd = (val) => {
//   if (val.length < 1) {
//     selectedProductByItmKnd.value = cloneDeep(productList.value);
//   } else {
//     selectedProductByItmKnd.value = productList.value.filter((v) => v.itmKndCd === val);
//   }
// };

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
      nanText: '0',
    };

    const stockDateField = {
      fieldName: `stockdate${i + 1}`,
      dataType: 'number',
    };

    const installDateColumn = {
      fieldName: `installdate${i + 1}`,
      header: baseDt.add(i, 'day').format('MM/DD(ddd)'),
      width: '100',
      styleName: 'text-right',
      nanText: '0',
    };

    const installDateField = {
      fieldName: `installdate${i + 1}`,
      dataType: 'number',
    };

    stockDateColumns.push(stockDateColumn);
    stockDateFields.push(stockDateField);
    stockDateItems.push(`stockdate${i + 1}`);
    installDateColumns.push(installDateColumn);
    installDateFields.push(installDateField);
    installDateItems.push(`installdate${i + 1}`);
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

onMounted(() => {
  getProducts();
});

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

// 품목 변경 (pdCd)
const onChangePdCd = (val) => {
  if (!isEmpty(val)) {
    searchParams.value.itmPdCd = val;
  } else {
    searchParams.value.itmPdCd = '';
  }

  searchParams.value.itmGrpCd = '';
};

async function fetchData() {
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/installation-stock-by-day/center/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdCenterRef.value.getView();

  getDateColumnsFields(cachedParams.baseDt);
  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_DIV'), width: '247', display: false },
    { fieldName: 'ogNm', header: t('MSG_TXT_DIV'), width: '247', display: false },
    { fieldName: 'ogInfo',
      header: t('MSG_TXT_DIV'),
      width: '247',
      displayCallback(grid, index) {
        const { ogCd: no1, ogNm: no2 } = grid.getValues(index.itemIndex);
        return `${no2} (${no1})`;
      } },
    { fieldName: 'sumQtyCenter', header: t('MSG_TXT_CENTER_DIVISION'), width: '100', styleName: 'text-right', nanText: '0' },
    { fieldName: 'sumQtyEng', header: t('MSG_TXT_EGER'), width: '100', styleName: 'text-right', nanText: '0' },
    { fieldName: 'sumQtyTot', header: t('MSG_TXT_SUM'), width: '100', styleName: 'text-right', nanText: '0' },
    ...stockDateColumns,
    ...installDateColumns,
    { fieldName: 'aggAsnCnt', header: t('MSG_TXT_AGG'), width: '100', styleName: 'text-right', nanText: '0' },
  ];

  view.setColumns(columns);
  view.getDataSource().setRows(state);
  view.setColumnLayout([
    'ogInfo',
    {
      header: t('MSG_TXT_CURRENT') + t('MSG_TXT_STOC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['sumQtyCenter', 'sumQtyEng', 'sumQtyTot'],
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
    'aggAsnCnt',
  ]);
  view.resetCurrent();
}

/*
 *  Search - 조회
 */
async function onClickSearch() {
  if (isEmpty(searchParams.value.itmPdCd)) {
    alert(t('MSG_ALT_PD_CD_CHO'));
    return;
  }

  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdCenterRef.value.getView();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/installation-stock-by-day/center/excel-download', { params: searchParams.value });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

/*
 *  Event - 설치배정세팅 팝업창 // W-SV-U-0171P01
 */
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

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_DIV'), width: '247', display: false },
    { fieldName: 'ogNm', header: t('MSG_TXT_DIV'), width: '247', display: false },
    { fieldName: 'ogInfo',
      header: t('MSG_TXT_DIV'),
      width: '247',
      displayCallback(grid, index) {
        const { ogCd: no1, ogNm: no2 } = grid.getValues(index.itemIndex);
        return `${no2} (${no1})`;
      } },
    { fieldName: 'sumQtyCenter', header: t('MSG_TXT_CENTER_DIVISION'), width: '100', styleName: 'text-right', nanText: '0' },
    { fieldName: 'sumQtyEng', header: t('MSG_TXT_EGER'), width: '100', styleName: 'text-right', nanText: '0' },
    { fieldName: 'sumQtyTot', header: t('MSG_TXT_SUM'), width: '100', styleName: 'text-right', nanText: '0' },
    ...stockDateColumns,
    ...installDateColumns,
    { fieldName: 'aggAsnCnt', header: t('MSG_TXT_AGG'), width: '100', styleName: 'text-right', nanText: '0' },
  ];
  const fields = [
    { fieldName: 'ogCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'ogInfo' },
    { fieldName: 'sumQtyCenter', dataType: 'number' },
    { fieldName: 'sumQtyEng', dataType: 'number' },
    { fieldName: 'sumQtyTot', dataType: 'number' },
    ...stockDateFields,
    ...installDateFields,
    { fieldName: 'aggAsnCnt', dataType: 'number' },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setColumnLayout([
    'ogInfo',
    {
      header: t('MSG_TXT_CURRENT') + t('MSG_TXT_STOC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['sumQtyCenter', 'sumQtyEng', 'sumQtyTot'],
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
    'aggAsnCnt',
  ]);
  view.setFixedOptions({ colCount: 1 });

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});

</script>
