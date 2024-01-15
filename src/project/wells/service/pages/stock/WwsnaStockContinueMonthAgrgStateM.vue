<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC (재고관리)
2. 프로그램 ID : WwsnaStockContinueMonthAgrgStateM - 재고지속월 집계 현황(K-W-SV-U-0251M01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-08-03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 재고지속월 집계 현황 http://localhost:3000/#/service/wsna-stock-continue-month-agrg-state
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="6"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          :colspan="2"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_USE_YN')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.useYn"
            :options="tempOptions.useYn"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_STOC_TYPE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.stockTpCd"
            :options="codes.MAT_MNGT_DV_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmGdCd"
            :options="tempOptions.itmGdCd"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
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
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/stock-continue-month-agrg-state';

const codes = await codeUtil.getMultiCodes(
  'ITM_KND_CD',
  'MAT_UTLZ_DV_CD',
  'MAT_MNGT_DV_CD',
);

const tempOptions = {
  itmGdCd: [
    { codeId: 'A', codeName: t('MSG_TXT_A_GD') }, // A급
    { codeId: 'B', codeName: t('MSG_TXT_B_GD') }, // B급
    { codeId: 'E', codeName: t('MSG_TXT_EGD') }, // E급
    { codeId: 'R', codeName: t('MSG_TXT_RGD') }, // R급
    { codeId: 'X', codeName: t('MSG_TXT_XGD') }, // X급
  ],
  useYn: [
    { codeId: 'Y', codeName: t('MSG_TXT_USE') }, // 사용
    { codeId: 'N', codeName: t('MSG_TXT_NUSD') }, // 미사용
  ],
  // stockTpCd: [ // 재고유형기준
  //   { codeId: '1', codeName: t('기준1') }, // 기준1
  //   { codeId: '2', codeName: t('기준2') }, // 기준2
  //   { codeId: '3', codeName: t('기준3') }, // 기준3
  //   { codeId: '4', codeName: t('기준4') }, // 기준4
  //   { codeId: '5', codeName: t('기준5') }, // 기준5
  // ],
};

let cachedParams;
const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  itmGdCd: '', // 등급
  useYn: '', // 사용여부
  stockTpCd: '', // 재고유형
  itmKndCd: '', // 품목구분 - 디폴트 4 상품
});

let gridView;
let gridData;
let logisticsFields;
let serviceFields;
let fieldsObj;
let fieldsWidth;

const totalCount = ref(0);

const matUtlzOptions = ref([]);

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
    name: 'trnoverFilter', // 회전율 Y
    criteria: 'value="Y"',
  }];

  view.setColumnFilters('cmnPartDvCd', filter1);
  view.setColumnFilters('ordnyHvMatYn', filter2);
  view.setColumnFilters('trnovrRtOjYn', filter3);

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
    view.activateColumnFilters('trnovrRtOjYn', false);
    view.activateColumnFilters('trnovrRtOjYn', ['trnoverFilter'], true);
  } else {
    view.activateColumnFilters('trnovrRtOjYn', ['trnoverFilter'], false);
  }
};
// 창고조회
async function getWareHouseList() {
  const result = await dataService.get(`${baseUrl}/ware-houses`, { params: searchParams.value });
  if (result.data.length > 0) {
    const wareHouses = result.data;
    const wareLogisticsFields = wareHouses.filter((v) => v.wareNo.substring(0, 1) === '1'); // 물류센터
    const wareServiceFields = wareHouses.filter((v) => v.wareNo.substring(0, 1) === '2'); // 서비스센터
    fieldsWidth = 150; // 창고 그리드 가로폭 사이즈 설정

    logisticsFields = [];
    serviceFields = [];

    logisticsFields.push(...wareLogisticsFields.map((v) => ({
      header: v.wareNm,
      fieldName: `ware${v.wareNo}`,
      width: fieldsWidth,
      direction: 'horizontal',
      items: [`ware${v.wareNo}PitmStocGdQty`, `ware${v.wareNo}KeppMm`],
    })));
    serviceFields.push(...wareServiceFields.map((v) => ({
      fieldName: `ware${v.wareNo}`,
      header: v.wareNm,
      width: fieldsWidth,
      direction: 'horizontal',
      items: [`ware${v.wareNo}PitmStocGdQty`, `ware${v.wareNo}KeppMm`],
    })));
    // 필드 셋팅
    fieldsObj.setFields();
  }
}

async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const resList = res.data;
  totalCount.value = resList.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(resList);
  view.resetCurrent();
}

async function onClickSearch() {
  await getWareHouseList();
  searchParams.value.matUtlzDvCd = '';
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  // 품목구분 : 상품 기본설정(4)
  searchParams.value.itmKndCd = '4';
  searchParams.value.itmGdCd = 'A';
  // 창고조회
  await getWareHouseList();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

fieldsObj = {
  // 그리드 공통컬럼
  defaultFields: [
    { fieldName: 'sapMatCd', // SAP코드
      header: t('MSG_TXT_SAPCD'),
      width: '170',
      footer: {
        styleName: 'text-center',
      } },
    { fieldName: 'pdCd', // 품목코드
      header: t('MSG_TXT_ITM_CD'),
      width: '110',
      footer: {
        styleName: 'text-center',
      } },
    { fieldName: 'pdNm', // 품목명
      header: t('MSG_TXT_ITM_NM'),
      width: '230',
      footer: {
        styleName: 'text-left',
      } },
    { fieldName: 'cmnPartDvCd', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'ordnyHvMatYn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'trnovrRtOjYn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
  ],
  totalFields: [
    {
      fieldName: 'wareNoPitmSumFields',
      header: t('MSG_TXT_AGG'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
  ],
  // 필드 세팅
  setFields() {
    // 물류센터
    const logisticsTotalFields = [];
    logisticsFields.forEach((v) => {
      if (v.items.length > 0) {
        const qty = { fieldName: v.items[0], header: t('MSG_TXT_STOC'), styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' }, direction: 'horizontal' };
        const mm = { fieldName: v.items[1], header: t('MSG_TXT_CTN_MM'), styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##', footer: { expression: 'sum', numberFormat: '#,##0.##', styleName: 'text-right text-weight-bold' }, direction: 'horizontal' };
        logisticsTotalFields.push(qty);
        logisticsTotalFields.push(mm);
      }
      logisticsTotalFields.push(v);
    });

    // 서비스센터
    const serviceTotalFields = [];
    serviceFields.forEach((v) => {
      if (v.items.length > 0) {
        const qty = { fieldName: v.items[0], header: t('MSG_TXT_STOC'), styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' }, direction: 'horizontal' };
        const mm = { fieldName: v.items[1], header: t('MSG_TXT_CTN_MM'), styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##', footer: { expression: 'sum', numberFormat: '#,##0.##', styleName: 'text-right text-weight-bold' }, direction: 'horizontal' };
        serviceTotalFields.push(qty);
        serviceTotalFields.push(mm);
      }
      serviceTotalFields.push(v);
    });

    const columns = [...fieldsObj.defaultFields,
      ...logisticsTotalFields,
      ...serviceTotalFields,
      ...fieldsObj.totalFields];

    // 헤더 부분 merge
    const layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
      {
        direction: 'horizontal',
        header: { text: t('MSG_TXT_LGST_CNR') }, /* 물류센터 */
        width: fieldsWidth,
        items: [...fieldsObj.getColumnNameList(logisticsFields)],
      },
      {
        direction: 'horizontal',
        header: { text: t('MSG_TXT_SV_CNR') }, /* 서비스센터 */
        width: fieldsWidth,
        items: [...fieldsObj.getColumnNameList(serviceFields)],
      },
      ...fieldsObj.getColumnNameArr(fieldsObj.totalFields),
    ];

    const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
    gridData.setFields(fields);
    gridView.setColumns(columns);
    gridView.setFixedOptions({ colCount: 3, resizable: true });
    gridView.columnByName('pdCd').setFooters({ text: t('MSG_TXT_TOT_SUM'), styleName: 'text-left text-weight-bold' });
    gridView.setColumnLayout([...layoutColumns]);
    gridView.setFooters({ visible: true, items: [{ height: 30 }] });
  },
  // 리스트에 담겨진 항목중 {fieldName : "" }  만  가져옴
  getColumnNameList(objList) {
    return objList.map((obj) => ({ header: obj.header, items: obj.items, fieldName: obj.fieldName }));
  },
  // 리스트에 담겨진 항목 중 fieldName 배열로 가져옴
  getColumnNameArr(objList) {
    return objList.map((v) => v.fieldName);
  },
};

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    ...fieldsObj.getColumnNameList(fieldsObj.defaultFields),
  ];

  const columns = [
    ...fieldsObj.defaultFields,
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  gridView = view;
  gridData = data;
});
</script>
