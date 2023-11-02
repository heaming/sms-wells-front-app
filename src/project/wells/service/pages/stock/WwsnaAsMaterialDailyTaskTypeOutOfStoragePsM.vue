<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaAsMaterialDailyTaskTypeOutOfStoragePsM - AS자재 일일 업무유형별출고현황
3. 작성자 : jungheejin
4. 작성일 : 2023-10-13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- AS자재 일일 업무유형별출고현황 (http://localhost:3000/#/service/wwsna-as-material-daily-task-type-out-storage-ps)
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 기준년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_BASE_YM')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 창고구분 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.baseYm"
          v-model:end-ym="searchParams.baseYm"
          v-model:ware-dv-cd="searchParams.wareDvCd"
          v-model:ware-no-m="searchParams.wareNoM"
          v-model:ware-no-d="searchParams.wareNoD"
          v-model:options-ware-dv-cd="customwareDvCd.wareDvCd"
          :label1="$t('MSG_TXT_WARE')"
          :label2="$t('MSG_TXT_WARE_DV')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          sub-first-option="all"
          :colspan="3"
        />
        <kw-search-item :label="$t('MSG_TXT_WARE_DTL_DV')">
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterWareDtlDvCd"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 업무유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.svBizHclsfCd"
            :options="customCodes.svBizHclsfCd"
            first-option="all"
          />
        </kw-search-item>
        <!-- 사용여부 -->
        <kw-search-item
          :label="$t('MSG_TXT_USE_SEL')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.useYn"
            first-option="all"
            :options="codes.USE_YN"
          />
        </kw-search-item>
        <!-- 품목구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :colspan="2"
            first-option="all"
            :options="codes.ITM_KND_CD.filter((v) => ['4', '5', '6','7','9'].includes(v.codeId))"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.itmPdCd"
            :options="productCodes"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.itmPdCdFrom"
            maxlength="10"
            clearable
            icon="search"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.itmPdCdTo"
            maxlength="10"
            clearable
            icon="search"
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
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
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
            :model-value="filteringOptions"
            type="checkbox"
            :options="customCodes.filteringCd"
            @change="onChangefilteringCd"
          />
        </li>
        <li class="filter-box__item">
          <p class="filter-box__item-label">
            {{ $t('일별 필터링') }}
          </p>
          <kw-input
            v-model="searchParams.schOjBlamStrt"
            mask="number"
          />
        </li>
      </ul>
      <kw-grid
        ref="grdMainRef"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
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

import { codeUtil, getComponentType, defineGrid, gridUtil, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { currentRoute } = useRouter();
const { t } = useI18n();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/as-material-daily-task-type-out-of-storage-ps';
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'ITM_KND_CD',
  'WARE_DTL_DV_CD',
  'USE_YN',
  'SV_BIZ_HCLSF_CD',
  'WARE_DV_CD',
);
const customCodes = {
  svBizHclsfCd: [
    { codeId: '1', codeName: t('MSG_TXT_INSTALLATION') },
    { codeId: '2', codeName: t('MSG_TXT_BEFORE_SERVICE') },
    { codeId: '3', codeName: t('MSG_TXT_AS_PAY') },
    { codeId: '4', codeName: t('MSG_TXT_FRISU_AFTER_SERVICE') },
    { codeId: '5', codeName: t('MSG_TXT_ETC') },
  ],
  filteringCd: [
    { codeId: '01', codeName: t('MSG_TXT_BTD_MAT') },
    { codeId: '02', codeName: t('MSG_TXT_MDIM_RPR_MAT') },
    { codeId: '03', codeName: t('MSG_TXT_TURNOVER_TRGT') },
    { codeId: '04', codeName: t('MSG_TXT_BASE_MM') },
    { codeId: '05', codeName: t('MSG_TXT_BY_DAY') + t('MSG_TXT_FLTRING') },
  ],
};

let cachedParams;
const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  baseYear: now.format('YYYY'),
  baseMonth: now.format('MM'),
  wareDtlDvCd: '',
  wareNoM: '',
  wareNoD: '',
  itmKndCd: '',
  svBizHclsfCd: '',
  useYn: '',
  itmPdCdFrom: '',
  itmPdCdTo: '',
  wareDvCd: '2',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
});

let gridView;
let gridData;
let fieldsObj;

/* 서비스센터 조회 고정 */
const customwareDvCd = {
  wareDvCd: {
    WARE_DV_CD: [
      { codeId: '2', codeName: t('MSG_TXT_SV_CNR') },
    ],
  },
};
const productCodes = ref();
const filteringOptions = ref([]);
const filterWareDtlDvCd = [
  // { codeId: '10', codeName: '물류센터창고', wareDvCd: '1' },
  { codeId: '20', codeName: '조직창고(서비스센터)', wareDvCd: '2' },
  { codeId: '21', codeName: '개인창고(서비스센터)', wareDvCd: '2' },
  // { codeId: '30', codeName: '조직창고(영업센터)', wareDvCd: '3' },
  // { codeId: '31', codeName: '개인창고(영업센터)', wareDvCd: '3' },
  // { codeId: '32', codeName: '독립창고(영업센터)', wareDvCd: '3' },
];
// const filterWareDtlDvCd = ref([]);
// const onChangeWareDvCd = () => {
//   filterWareDtlDvCd.value = wareDtlDvCd;
//   filterWareDtlDvCd.value = wareDtlDvCd.filter((v) => v.wareDvCd === searchParams.value.wareDvCd);
// };

// 품목구분 변경시, 품목 목록 조회 셋팅
async function onChangeItmKndCd() {
  const res = await dataService.get(`/sms/wells/service/bs-consumables/${searchParams.value.itmKndCd}/product-codes`);
  productCodes.value = res.data.map((v) => ({ codeId: v.svpdPdCd, codeName: v.svpdNmKor }));
}

// 필터링 처리
async function onChangefilteringCd(val) {
  // console.log(val);

  const view = grdMainRef.value.getView();

  // 기초자재, 중수리자재, 기준월 필터링, 일별 필터링)필터 처리
  const filter1 = [{ name: 'cmnPartFilter', criteria: "value = '01'" }]; // 중수리 자재
  const filter2 = [{ name: 'ordnyHvMatFilter', criteria: "value = 'Y'" }]; // 기초 자재
  const filter3 = [{ name: 'trnoverFilter', criteria: 'value="Y"' }]; // 회전율
  const filter4 = [{ name: 'qtyMmFilter', criteria: 'value > mmAgrg' }]; // 기준월 필터링
  // const filter5 = [{ name: 'baseMonthFilter', criteria: "value = 'Y'" }]; // 기준월 필터링

  // 필터 등록
  view.setColumnFilters('cmnPartDvCd', filter1); // 중수리 자재
  view.setColumnFilters('ordnyHvMatYn', filter2); // 기초자재
  view.setColumnFilters('trnovrRtOjYn', filter3); // 회전율
  view.setColumnFilters('qtyMm', filter4); // 기준월 필터링
  // 필터 초기화
  // view.activateAllColumnFilters('asMatCmnClsfCd', false);
  // view.activateAllColumnFilters('ordnyHvMatYn', false);
  // view.activateAllColumnFilters('qtyMm', false);

  // 필터 처리
  if (val.includes('01')) {
    view.activateAllColumnFilters('cmnPartDvCd', false);
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
    view.activateAllColumnFilters('trnoverYn', false);
    view.activateColumnFilters('trnoverYn', ['trnoverFilter'], true);
  } else {
    view.activateColumnFilters('trnoverYn', ['trnoverFilter'], false);
  }

  if (val.includes('04')) {
    view.activateAllColumnFilters('qtyMm', false);
    view.activateColumnFilters('qtyMm', ['qtyMmFilter'], true);
  } else {
    view.activateColumnFilters('qtyMm', ['qtyMmFilter'], false);
  }
}

async function fetchData() {
  console.log(searchParams.filteringCd);
  // wareDtlDvCd : 창고구분
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: result, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  fieldsObj.setFields(result);
  await nextTick();
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(result);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);

  filteringOptions.value = []; // (중수리자재,기초자재) 체크박스 초기화
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;

  searchParams.value.baseYear = searchParams.value.baseYm.substring(0, 4);
  searchParams.value.baseMonth = searchParams.value.baseYm.substring(4, 6);

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

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

fieldsObj = {
  // 그리드 공통컬럼
  defaultFields: [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '124', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'asLdtm', header: t('TXT_MSG_AS_LDTM'), width: '100', styleName: 'text-left' },
    { fieldName: 'minGoQty', header: t('MSG_TXT_MOQ'), width: '100', styleName: 'text-left' },
    { fieldName: 'last1yPrev3m', header: t('MSG_TXT_PVO_Y') + t('MSG_TXT_JBF_MMS3_OSTR_SUM'), dataType: 'number', width: '100', styleName: 'text-left' },
    { fieldName: 'last1y', header: t('MSG_TXT_PVO_Y') + t('MSG_TXT_BASE_MM') + t('MSG_TXT_SUM'), dataType: 'number', width: '100', styleName: 'text-left' },
    { fieldName: 'last1yNext2m', header: t('MSG_TXT_PVO_Y') + t('MSG_TXT_BASMM_S2M_OSTR_SUM'), dataType: 'number', width: '100', styleName: 'text-left' },
    { fieldName: 'last3m', header: t('MSG_TXT_BEFORE') + t('MSG_TXT_JBF_MMS3_OSTR_SUM'), dataType: 'number', width: '100', styleName: 'text-left' },
    { fieldName: 'mmAgrg', header: t('MSG_TXT_MM_AV'), width: '100', dataType: 'number', styleName: 'text-left' },
    { fieldName: 'ddAgrg', header: t('MSG_TXT_D_AV'), width: '100', dataType: 'number', styleName: 'text-left' },
    { fieldName: 'lastPrev1m', header: t('MSG_TXT_LSTMM_OSTR'), width: '100', dataType: 'number', styleName: 'text-left' },
    { fieldName: 'qtyPajuSum', header: `${t('MSG_TXT_PAJU_LGST')}\n${t('MSG_TXT_STOC')}`, width: '100', dataType: 'number', styleName: 'text-left' },
    { fieldName: 'qtyCenterSum', header: `${t('MSG_TXT_CENTER_DIVISION')} ${t('MSG_TXT_OG')}\n${t('MSG_TXT_STOC')}`, width: '100', dataType: 'number', styleName: 'text-left' },
    { fieldName: 'qtyEngSum', header: `${t('MSG_TXT_EGER')}\n${t('MSG_TXT_STOC')}`, width: '100', dataType: 'number', styleName: 'text-left' },
    { fieldName: 'qtyMm',
      header: t('MSG_TXT_BASE_MM') + t('MSG_TXT_SUM'),
      width: '100',
      dataType: 'number',
      styleName: 'text-left',
      autoFilter: false,
    },
    {
      fieldName: 'trnoverYn',
      header: t(''),
      width: '150',
      styleName: 'text-center',
      visible: false,
      autoFilter: false,
    },
    {
      fieldName: 'cmnPartDvCd',
      header: t(''),
      width: '150',
      styleName: 'text-center',
      visible: false,
      autoFilter: false,
    },
    {
      fieldName: 'ordnyHvMatYn',
      header: t(''),
      width: '150',
      styleName: 'text-center',
      visible: false,
      autoFilter: false,
    },
  ],

  // 필드 세팅
  setFields(result) {
    const columns = [...fieldsObj.defaultFields];

    // 검색시 (일자별)조회된 데이터가 0 보다 큰 경우 데이터 추출
    const existDays = [];
    result.forEach((data) => {
      Object.keys(data).forEach((keys) => {
        if (keys.match(/day/gi)) {
          if (data[keys] > 0) {
            existDays.push(keys);
          }
        }
      });
    });

    // 검색월 기준의 마지막일자까지 그리드 표시
    const { baseYm } = searchParams.value;
    const lastDay = new Date(baseYm.substring(0, 4), baseYm.substring(4, 6), 0).getDate();
    const columnDailyTotals = [];
    for (let cnt = 1; cnt <= lastDay; cnt += 1) {
      columnDailyTotals.push(
        {
          fieldName: `qty${cnt}`,
          header: `${cnt}${t('MSG_TXT_D')}`,
          width: 80,
          styleName: existDays.indexOf(`day${String(cnt)}`) > -1 ? 'text-right text-blue' : 'text-right', // 존재하는 데이터만 색상표시
          dataType: 'number',
          numberFormat: '#,###',
        },
      );
    }
    columns.push(...columnDailyTotals);
    const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

    gridData.setFields(fields);
    gridView.setColumns(columns);
    gridView.setFixedOptions({ colCount: 3, resizable: true });
  },
  // 리스트에 담겨진 항목중 {fieldName : "" }  만  가져옴
  getColumnNameList(objList) {
    return objList.map((obj) => ({ fieldName: obj.fieldName }));
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
  view.header.height += view.header.height + 50;

  gridView = view;
  gridData = data;
});

</script>
