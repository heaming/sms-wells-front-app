<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaMonthlyOutOfStorageAgrgM - 월별출고집계현황(K-W-SV-U-0266M01)
3. 작성자 : jungheejin
4. 작성일 : 2023-08-29
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 월별출고집계현황 http://localhost:3000/#/service/wwsna-monthly-out-of-storage-agrg
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="9"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :colspan="3"
          :label="$t('MSG_TXT_OSTR_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_OSTR_DT')"
            :rules="onValidateDate"
          />
        </kw-search-item>
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.startDt"
          v-model:end-ym="searchParams.endDt"
          v-model:ware-dv-cd="searchParams.wareDvCd"
          v-model:ware-no-m="searchParams.wareNoM"
          v-model:ware-no-d="searchParams.wareNoD"
          :label1="$t('MSG_TXT_WARE')"
          :label2="$t('MSG_TXT_WARE_DV')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          first-option-value=""
          first-option="all"
          sub-first-option-value=""
          sub-first-option="all"
          :colspan="4"
          @update:ware-dv-cd="onChangeStdWareDvCd"
          @update:ware-no-m="onChagneHgrWareNo"
        />
        <!-- 창고상세구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_WARE_DTL_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterCodes.wareDtlDvCd"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmGdCd"
            first-option="all"
            :options="codes.PD_GD_CD.filter((v) => ['A', 'B', 'E', 'R', 'X'].includes(v.codeId))"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_USE_SEL')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.useYn"
            first-option="all"
            :options="codes.USE_YN"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :colspan="3"
            :options="codes.ITM_KND_CD.filter((v) => ['4', '5', '6','7','9'].includes(v.codeId))"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.itmPdCd"
            :options="productCodes"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_WARE_USE_YN')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.wareUseYn"
            :options="customCodes.wareUseYn"
            first-option="all"
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
            :options="codes.MAT_UTLZ_DV_CD.filter((v) => ['01','02'].includes(v.codeId))"
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

import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil, validate } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/monthly-out-of-storage-agrg';

const codes = await codeUtil.getMultiCodes(
  'PD_GD_CD',
  'ITM_KND_CD',
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
  'MAT_UTLZ_DV_CD',
  'USE_YN',
);
const customCodes = {
  wareUseYn: [
    { codeId: 'Y', codeName: t('MSG_TXT_USE') }, // 사용
    { codeId: 'N', codeName: t('MSG_TXT_NUSD') }, // 미사용
  ],
};
const filterCodes = ref({
  wareDtlDvCd: [],
});

let cachedParams;
const searchParams = ref({
  startDt: now.add(-3, 'month').startOf('M').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  wareDvCd: '', // 창고구분
  wareDtlDvCd: '', // 창고상세구분
  wareNoM: '', // 조직창고
  wareNoD: '', // 개인창고
  wareUseYn: '', // 창고 사용여부
  itmGdCd: 'A', // 등급
  itmKndCd: '4', // 품목구분
  itmPdCd: '', // 품목
  useYn: '', // 사용여부
});

let gridView;
let gridData;
let fieldsObj;

const totalCount = ref(0);
const initTotalCount = ref(0);
const productCodes = ref();
const matUtlzOptions = ref([]);

// 창고구분 변경 시, 창고상세구분 세팅
const onChangeWareDvCd = async () => {
  searchParams.value.wareDtlDvCd = '';
  filterCodes.value.wareDtlDvCd = '';
  const filterWareDvCd = searchParams.value.wareDvCd;
  if (filterWareDvCd === '1') { // 물류센터
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['10'].includes(v.codeId));
  } else if (filterWareDvCd === '2') { // 서비스센터
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21'].includes(v.codeId));
  } else if (filterWareDvCd === '3') { // 영업센터
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31'].includes(v.codeId));
  } else {
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['10', '20', '21', '30', '31'].includes(v.codeId));
  }
};

function onChangeStdWareDvCd() {
  searchParams.value.wareNoM = '';
  searchParams.value.wareNoD = '';
}

function onChagneHgrWareNo() {
  searchParams.value.wareNoD = '';
}

watch(() => searchParams.value.wareDvCd, (val) => {
  if (searchParams.value.wareDvCd !== val) {
    searchParams.value.wareDvCd = val;
  }
  onChangeWareDvCd();
});
// 창고구분 변경시, 창고상세구분 세팅 END

// 품목구분 변경시, 품목 목록 조회 셋팅
async function onChangeItmKndCd() {
  const res = await dataService.get(`/sms/wells/service/bs-consumables/${searchParams.value.itmKndCd}/product-codes`);
  productCodes.value = res.data.map((v) => ({ codeId: v.svpdPdCd, codeName: v.svpdNmKor }));
}

// 출고시작일자 및 출고종료일자 validation 체크 (12개월 미만으로만 선택가능)
const onValidateDate = async (val, options) => {
  const errors = [];
  errors.push(
    ...(await validate(val, 'date_range_required', options)).errors,
  );

  const monthDiff = dayjs(searchParams.value.startDt).startOf('month').diff(dayjs(searchParams.value.endDt).startOf('month'), 'month');
  if (monthDiff <= -12) {
    errors.push(t('MSG_ALT_SEARCH_UNDER_MN', [t('12')]));
  }
  return errors[0] || true;
};

// 중수리 자재, 기초자재 필터 처리
const filter1 = [{ name: 'cmnPartFilter', criteria: "value = '01'" }]; // 중수리 자재
const filter2 = [{ name: 'ordnyHvMatFilter', criteria: "value = 'Y'" }]; // 기초 자재
async function onChangeMatUtlzDvCd(val) {
  const view = grdMainRef.value.getView();
  // 필터 등록
  view.setColumnFilters('asMatCmnClsfCd', filter1);
  view.setColumnFilters('ordnyHvMatYn', filter2);
  // 필터 초기화
  view.activateAllColumnFilters('asMatCmnClsfCd', false);
  view.activateAllColumnFilters('ordnyHvMatYn', false);

  // 필터 처리
  if (val.includes('01')) {
    view.activateColumnFilters('asMatCmnClsfCd', 'cmnPartFilter', true);
    totalCount.value = view.getItemCount(); // 필터된 데이터 건수 표시
  } else if (val.includes('02')) {
    view.activateColumnFilters('ordnyHvMatYn', 'ordnyHvMatFilter', true);
    totalCount.value = view.getItemCount(); // 필터된 데이터 건수 표시
  } else {
    totalCount.value = initTotalCount.value; // 필터 해제시 초기 데이터 건수 노출
  }
}
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;

  totalCount.value = list.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();

  initTotalCount.value = totalCount.value; // 초기 데이터 건수
  matUtlzOptions.value = []; // (중수리자재,기초자재) 체크박스 초기화
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  fieldsObj.setFields();
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
  await onChangeWareDvCd();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

fieldsObj = {
  // 그리드 공통컬럼
  defaultFields: [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '170', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '240', styleName: 'text-left' },
    { fieldName: 'asMatCmnClsfCd', width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'ordnyHvMatYn', width: '150', styleName: 'text-center', visible: false, autoFilter: false },
  ],
  asFields: [
    {
      fieldName: 'asLdtm',
      header: t('TXT_MSG_AS_LDTM'), // 리드타임
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'minGoQty',
      header: t('MSG_TXT_MOQ'), // MOQ
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
  ],
  totalFields: [
    {
      fieldName: 'totIstQty',
      header: t('MSG_TXT_SL'), // 매출
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'totCoIstQty',
      header: t('MSG_TXT_ETC'), // 기타
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'totChngQty',
      header: t('MSG_TXT_CHANGE'), // 교체
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'totBfsvcQty',
      header: t('MSG_TXT_BEFORE_SERVICE'), // B/S
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'totAsQty',
      header: t('MSG_TXT_AFTER_SERVICE'), // A/S
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'totRecapAsQty',
      header: t('MSG_TXT_RECAP_AFTER_SERVICE'), // A/S(유)
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'totFrisuAsQty',
      header: t('MSG_TXT_FRISU_AFTER_SERVICE'), // A/S(무)
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'totEtcQty',
      header: t('MSG_TXT_ETC'), // 기타
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'totSumQty',
      header: t('MSG_TXT_AGG'), // 계
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
  ],
  monthlyFields: [
    {
      fieldName: 'istQty',
      header: t('MSG_TXT_SL'), // 매출
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'chngQty',
      header: t('MSG_TXT_CHANGE'), // 교체
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'coIstQty',
      header: t('MSG_TXT_ETC'), // 기타
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'bfsvcQty',
      header: t('MSG_TXT_BEFORE_SERVICE'), // B/S
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'asQty',
      header: t('MSG_TXT_AFTER_SERVICE'), // A/S
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'recapAsQty',
      header: t('MSG_TXT_RECAP_AFTER_SERVICE'), // A/S(유)
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'frisuAsQty',
      header: t('MSG_TXT_FRISU_AFTER_SERVICE'), // A/S(무)
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'etcQty',
      header: t('MSG_TXT_ETC'), // 기타
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'sumQty',
      header: t('MSG_TXT_AGG'), // 계
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
  ],
  setFields() {
    let columns = [...fieldsObj.defaultFields,
      ...fieldsObj.totalFields];

    // 총계및 월별 필드(품목별로 노출 변경)
    const layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields)];
    let totalItemFields = [];
    let monthlyItemFields = [];
    if (searchParams.value.itmKndCd === '4') {
      // 총계 필드(상품)
      totalItemFields = ['totIstQty', 'totChngQty', 'totCoIstQty', 'totSumQty'];
      // 월별 필드(상품)
      monthlyItemFields = [...fieldsObj.monthlyFields].filter((v) => ['istQty', 'chngQty', 'coIstQty', 'sumQty'].includes(v.fieldName));
    } else if (searchParams.value.itmKndCd === '5' || searchParams.value.itmKndCd === '9') {
      // 총계 필드(필터,판매소모품)
      totalItemFields = ['totIstQty', 'totBfsvcQty', 'totAsQty', 'totSumQty'];
      // 월별 필드(필터,판매소모품)
      monthlyItemFields = [...fieldsObj.monthlyFields].filter((v) => ['istQty', 'bfsvcQty', 'asQty', 'sumQty'].includes(v.fieldName));
    } else if (searchParams.value.itmKndCd === '6' || searchParams.value.itmKndCd === '7') {
      // 총계 필드(A/S자재, A/S 소모품)
      totalItemFields = ['totIstQty', 'totBfsvcQty', 'totRecapAsQty', 'totFrisuAsQty', 'totEtcQty', 'totSumQty'];
      // 월별 필드(A/S자재, AS 소모품)
      monthlyItemFields = [...fieldsObj.monthlyFields].filter((v) => ['istQty', 'bfsvcQty', 'recapAsQty', 'frisuAsQty', 'etcQty', 'sumQty'].includes(v.fieldName));
      // AS 필드(리드타임,MOQ) 컬럼 표시
      columns = [...fieldsObj.defaultFields, ...fieldsObj.asFields, ...fieldsObj.totalFields];
      layoutColumns.push(...fieldsObj.getColumnNameArr(fieldsObj.asFields));
    }
    layoutColumns.push(
      {
        header: t('MSG_TXT_SUM'),
        items: totalItemFields,
      },
    );
    // 월별 필드(품목별로 노출 변경)
    const columnMonthlyTotals = [];
    // monthlyFields 필드에 정의된 필드를 기준으로 동적 필드 생성
    for (let mm = 1; mm <= 12; mm += 1) {
      const columnMonthlyItems = [];
      const columnMonthlyFields = [...monthlyItemFields];
      columnMonthlyFields.forEach((row) => {
        // 월 전체 필드
        columnMonthlyTotals.push(
          {
            fieldName: `monthly${mm}${row.fieldName}`,
            header: row.header,
            width: row.width,
            styleName: row.styleName,
            dataType: row.dataType,
            numberFormat: row.numberFormat,
            footer: row.footer,
          },
        );
        // 월별 items
        columnMonthlyItems.push(
          {
            hideChildHeaders: true,
            header: `${row.header}`,
            items: [`monthly${mm}${row.fieldName}`],
          },
        );
      });
      // 월별 레이아웃 필드
      const layoutColumnsMonthly = [];
      layoutColumnsMonthly.push(
        {
          direction: 'horizontal',
          header: `${mm}${t('MSG_TXT_MON')}`,
          items: columnMonthlyItems,
        },
      );
      layoutColumns.push(layoutColumnsMonthly[0]);
    }
    columns.push(...columnMonthlyTotals);
    const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
    gridData.setFields(fields);
    gridView.setColumns(columns);
    gridView.setFixedOptions({ colCount: 3, resizable: true });
    gridView.columnByName('pdNm').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-left text-weight-bold' });
    gridView.setColumnLayout([...layoutColumns]);
    gridView.setFooters({ visible: true, items: [{ height: 30 }] });
    gridView.filteringOptions.enabled = false;
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
  gridView = view;
  gridData = data;
});

</script>
