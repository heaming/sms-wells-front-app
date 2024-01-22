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
      :cols="9"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 기준년월 -->
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
        <!-- 사용 여부 -->
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
        <!-- 재고유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_STOC_TYPE')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.stockTpCd"
            :options="codes.MAT_MNGT_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 표시유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_DISP_TYPE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.markTp"
            :options="tempOptions.markTp"
            @change="onChangeMarkTp"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 품목구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="4"
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
            @change="onChangePdCd"
          />
        </kw-search-item>
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="3"
        >
          <kw-input
            v-model="searchParams.itmPdCd"
            upper-case
            type="text"
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num|max:10"
          />
        </kw-search-item>
        <!-- 등급 -->
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmGdCd"
            first-option="all"
            :options="codes.PD_GD_CD"
            :disable="true"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SAPCD')"
          :colspan="4"
        >
          <kw-input
            v-model="searchParams.strtSapCd"
            :label="$t('MSG_TXT_STRT_SAP_CD')"
            rules="numeric|max:18"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endSapCd"
            :label="$t('MSG_TXT_END_SAP_CD')"
            rules="numeric|max:18"
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
import { cloneDeep, isEmpty } from 'lodash-es';
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
  'PD_GD_CD',
  'SV_MAT_GRP_CD',
  'PD_GRP_CD',
);

const tempOptions = {
  useYn: [
    { codeId: 'Y', codeName: t('MSG_TXT_USE') }, // 사용
    { codeId: 'N', codeName: t('MSG_TXT_NUSD') }, // 미사용
  ],
  stockTpCd: [ // 재고유형기준
    { codeId: '1', codeName: t('기준1') }, // 기준1
    { codeId: '2', codeName: t('기준2') }, // 기준2
    { codeId: '3', codeName: t('기준3') }, // 기준3
    { codeId: '4', codeName: t('기준4') }, // 기준4
    { codeId: '5', codeName: t('기준5') }, // 기준5
  ],
  markTp: [
    { codeId: 'Mm', codeName: t('지속월') },
    { codeId: 'notMm', codeName: t('회전율') },
  ],
};

let cachedParams;
const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  itmGdCd: '', // 등급
  useYn: '', // 사용여부
  stockTpCd: '', // 재고유형
  markTp: 'Mm', // 표시유형
  itmPdCd: '', // 품목코드
  strtSapCd: '', // SAP 시작
  endSapCd: '', // SAP 종료
  itmKndCd: '', // 품목구분
  itmGrpCd: '',
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
      items: [`ware${v.wareNo}Pitm`, `ware${v.wareNo}Kepp`],
    })));
    serviceFields.push(...wareServiceFields.map((v) => ({
      fieldName: `ware${v.wareNo}`,
      header: v.wareNm,
      width: fieldsWidth,
      direction: 'horizontal',
      items: [`ware${v.wareNo}Pitm`, `ware${v.wareNo}Kepp`],
    })));
    // 필드 셋팅
    fieldsObj.setFields();
  }
}

// 품목구분 변경
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

// 품목 변경 (pdCd)
const onChangePdCd = (val) => {
  searchParams.value.itmPdCd = val;
};

async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const resList = res.data;
  totalCount.value = resList.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(resList);
  // view.resetCurrent();
}

async function onClickSearch() {
  if (!isEmpty(searchParams.value.strtSapCd) && isEmpty(searchParams.value.endSapCd)) {
    searchParams.value.endSapCd = searchParams.value.strtSapCd;
  }

  if (!isEmpty(searchParams.value.endSapCd) && isEmpty(searchParams.value.strtSapCd)) {
    searchParams.value.strtSapCd = searchParams.value.endSapCd;
  }
  await getWareHouseList();
  searchParams.value.matUtlzDvCd = '';
  console.log('searchParams.value ???', searchParams.value);
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

// 표시유형 변경시 그리드 표시 변경
function onChangeMarkTp() {
  console.log('onChangeMarkTp searchParams.value.markTp >>', searchParams.value.markTp);
  fieldsObj.setFields();
}

await Promise.all([
  getProducts(),
]);

onMounted(async () => {
  // 품목구분 : 상품 기본설정(4)
  searchParams.value.itmKndCd = '4';
  searchParams.value.itmGdCd = 'A';
  searchParams.value.markTp = 'Mm';
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
        const mm = searchParams.value.markTp === 'Mm'
          ? { fieldName: v.items[1], header: t('MSG_TXT_CTN_MM'), styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##', footer: { expression: 'sum', numberFormat: '#,##0.##', styleName: 'text-right text-weight-bold' }, direction: 'horizontal' }
          : { fieldName: v.items[1], header: t('MSG_TXT_TRNOVERRT'), styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##', footer: { expression: 'sum', numberFormat: '#,##0.##', styleName: 'text-right text-weight-bold' }, direction: 'horizontal' };
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
        const mm = searchParams.value.markTp === 'Mm'
          ? { fieldName: v.items[1], header: t('MSG_TXT_CTN_MM'), styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##', footer: { expression: 'sum', numberFormat: '#,##0.##', styleName: 'text-right text-weight-bold' }, direction: 'horizontal' }
          : { fieldName: v.items[1], header: t('MSG_TXT_TRNOVERRT'), styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##', footer: { expression: 'sum', numberFormat: '#,##0.##', styleName: 'text-right text-weight-bold' }, direction: 'horizontal' };
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
