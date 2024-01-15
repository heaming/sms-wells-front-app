<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaStockStateIndividualWareM - 재고현황-개인창고(창고별 재고 현황)(K-W-SV-U-0113M01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-08-16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 창고별 재고 현황 http://localhost:3000/#/service/stock-state-individual-ware
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_STOCK_BASE_DT')"
          :colspan="1"
          required
        >
          <kw-date-picker
            v-model="searchParams.stockDt"
            :label="$t('MSG_TXT_STOCK_BASE_DT')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SV_CNR')"
        >
          <kw-select
            v-model="searchParams.wareNo"
            :options="servierCenterOrg"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_WARE_USE_YN')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.wareUseYn"
            :options="tempOptions.wareUseYn"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.itmGdCd"
            :options="tempOptions.itmGdCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_USE_YN')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.useYn"
            :options="tempOptions.useYn"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :colspan="1"
        >
          <kw-checkbox
            v-model="searchParams.stndUnuseYn"
            :options="tempOptions.stndUnuseYn"
            class="ml20"
            :label="$t('MSG_TXT_STD_NO_APY')"
            @update:model-value="onCheckedStckNoStdGb"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_SAPCD')">
          <kw-input
            v-model="searchParams.fromSapCd"
            :max-length="50"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.toSapCd"
            :max-length="50"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_ITM_CD')">
          <kw-input
            v-model="searchParams.pdCdFrom"
            :max-length="50"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.pdCdTo"
            :max-length="50"
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
            :options="tempOptions.localMatUtlzDvCd"
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

import { getComponentType, defineGrid, gridUtil, useDataService, useGlobal, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { notify } = useGlobal();
const { alert } = useGlobal();

const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

const stdWareUri = '/sms/wells/service/normal-out-of-storages/standard-ware';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/stock-state-individual-ware';

const codes = await codeUtil.getMultiCodes(
  'ITM_KND_CD',
  'SV_CNR_CD',
  'MAT_UTLZ_DV_CD',
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
  wareUseYn: [
    { codeId: 'Y', codeName: t('MSG_TXT_USE') }, // 사용
    { codeId: 'N', codeName: t('MSG_TXT_NUSD') }, // 미사용
  ],
  stndUnuseYn: [
    { codeId: 'Y', codeName: t('MSG_TXT_USE') }, // 사용
    { codeId: 'N', codeName: t('MSG_TXT_NUSD') }, // 미사용
  ],
  localMatUtlzDvCd: [
    { codeId: '01', codeName: t('MSG_TXT_MDIM_RPR') }, // 중수리
    { codeId: '02', codeName: t('MSG_TXT_BTD_MAT') }, // 기초자재
  ],
};

let cachedParams;
const searchParams = ref({
  stockDt: now.format('YYYYMMDD'),
  baseYm: now.format('YYYYMM'),
  wareNo: '', // 서비스센타 성수 세팅
  itmGdCd: '', // 등급
  useYn: '', // 사용여부
  wareUseYn: '', // 창고사용여부
  stndUnuseYn: '', // 표준미사용여부
  itmKndCd: '', // 품목구분 - 디폴트 4 상품
  fromSapCd: '', // sap 코드
  toSapCd: '', // sap 코드
  pdCdFrom: '',
  pdCdTo: '',
});

let gridView;
let gridData;
let serviceFields;
let fieldsObj;
let fieldsWidth;

const servierCenterOrg = ref();

async function fetchServiceCenters() {
  const res = await dataService.get(`${baseUrl}/service-center`, { params: searchParams.value });
  const resList = res.data;
  servierCenterOrg.value = resList.map((v) => ({ codeId: v.wareNo, codeName: v.wareNm }));
}

await fetchServiceCenters();

async function fetchMyServiceCenters() {
  const res = await dataService.get(`${baseUrl}/my-service-center`, { params: searchParams.value });
  if (res.data !== '') {
    searchParams.value.wareNo = res.data.toString();
  } else {
    searchParams.value.wareNo = '200001';
  }
}

await fetchMyServiceCenters();

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

  view.setColumnFilters('cmnPartDvCd', filter1);
  view.setColumnFilters('ordnyHvMatYn', filter2);

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
};

// 창고조회
async function getWareHouseList() {
  const result = await dataService.get(`${baseUrl}/ware-houses`, { params: searchParams.value });
  if (result.data.length > 0) {
    const wareHouses = result.data;
    const wareServiceFields = wareHouses.filter((v) => v.wareNo.substring(0, 1) === '2'); // 서비스센터
    fieldsWidth = 130; // 창고 그리드 가로폭 사이즈 설정

    serviceFields = [];

    serviceFields.push(...wareServiceFields.map((v) => ({
      fieldName: `ware${v.wareNo}agrgQty`,
      header: v.wareNm,
      width: fieldsWidth,
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
      visible: true,
    })));
    // 필드 셋팅
    fieldsObj.setFields();
  } else {
    // 디폴트 필드 셋팅
    fieldsObj.setDefaultFields();
  }
}

async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams, timeout: 180000 });
  const resList = res.data;
  totalCount.value = resList.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(resList);
  view.resetCurrent();
}

async function stckStdGbFetchData() {
  const apyYm = searchParams.value.baseYm;
  const { wareNo } = searchParams.value;

  if (wareNo === '') {
    await alert(t('MSG_ALT_SV_CNR_SELCT'));
  } else {
    const res = await dataService.get(stdWareUri, { params: { apyYm, wareNo } });
    const { stckStdGb } = res.data;
    searchParams.value.stndUnuseYn = stckStdGb === 'Y' ? 'N' : 'Y';
    if (res.data > 0) {
      notify(t('MSG_ALT_CHG_DATA'));
    }
  }
}

async function onCheckedStckNoStdGb() {
  const stckStdGb = searchParams.value.stndUnuseYn === 'N' ? 'Y' : 'N';
  const apyYm = searchParams.value.baseYm;
  const { wareNo } = searchParams.value;

  if (wareNo === '') {
    await alert(t('MSG_ALT_SV_CNR_SELCT'));
  } else {
    const res = await dataService.put(stdWareUri, { apyYm, stckStdGb, wareNo });
    if (res.data > 0) {
      notify(t('MSG_ALT_CHG_DATA'));
    }
  }
}

async function onClickSearch() {
  searchParams.value.baseYm = searchParams.value.stockDt.substring(0, 6);
  console.log('searchParams.value >>>>>', searchParams.value);

  await getWareHouseList();
  searchParams.value.matUtlzDvCd = '';
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

onMounted(async () => {
  // 품목구분 : 상품 기본설정(4)
  searchParams.value.itmGdCd = 'A';
  searchParams.value.baseYm = searchParams.value.stockDt.substring(0, 6);
  searchParams.value.stndUnuseYn = 'Y';
  // 창고조회
  // await getWareHouseList();
  await stckStdGbFetchData();
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
    { fieldName: 'kiwiPdCd', // 품목코드
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
    { fieldName: 'lctNm', // 품목위치
      header: t('품목위치'),
      width: '230',
      footer: {
        styleName: 'text-left',
      } },
    {
      fieldName: 'wareNoAgrgQtySumFields',
      header: t('MSG_TXT_AGG'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    { fieldName: 'cmnPartDvCd', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'ordnyHvMatYn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
  ],

  // 필드 세팅
  setFields() {
    const columns = [...fieldsObj.defaultFields,
      ...serviceFields];

    const layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
      ...fieldsObj.getColumnNameArr(serviceFields)];
    const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

    gridData.setFields(fields);
    gridView.setColumns(columns);
    gridView.setColumnLayout([...layoutColumns]);
    gridView.setFixedOptions({ colCount: 4, resizable: true });
    gridView.columnByName('kiwiPdCd').setFooters({ text: t('MSG_TXT_TOT_SUM'), styleName: 'text-left text-weight-bold' });
    gridView.setFooters({ visible: true, items: [{ height: 30 }] });
  },

  // 디폴트 필드 세팅
  setDefaultFields() {
    const columns = [...fieldsObj.defaultFields];
    const layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields)];
    const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

    gridData.setFields(fields);
    gridView.setColumns(columns);
    gridView.setColumnLayout([...layoutColumns]);
    gridView.setFixedOptions({ colCount: 4, resizable: true });
    gridView.columnByName('kiwiPdCd').setFooters({ text: t('MSG_TXT_TOT_SUM'), styleName: 'text-left text-weight-bold' });
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
  const fields = [...fieldsObj.defaultFields];
  const columns = [...fieldsObj.defaultFields];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  gridView = view;
  gridData = data;
});
</script>
