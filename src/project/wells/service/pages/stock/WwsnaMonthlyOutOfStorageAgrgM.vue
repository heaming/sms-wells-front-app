<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaOutOfStorageAgrgM - 월별출고집계현황(K-W-SV-U-0266M01)
3. 작성자 : jungheejin
4. 작성일 : 2023-07-13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 월별출고집계현황 http://localhost:3000/#/service/wwsna-monthly-out-of-storage-agrg
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_OSTR_DT')">
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_OSTR_DT')"
            :rules="onValidateDate"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            class="w166"
            :options="codes.ITM_KND_CD"
          />
          <kw-select
            v-model="searchParams.itmPdCd"
            :options="itmPdCds"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_GD')">
          <kw-select
            v-model="searchParams.itmGdCd"
            first-option="all"
            :options="codes.PD_GD_CD.filter((v) => ['A', 'B', 'E', 'R', 'X'].includes(v.codeId))"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_USE_SEL')">
          <kw-select
            v-model="searchParams.useYn"
            first-option="all"
            :options="codes.USE_YN"
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
const baseUrl = '/sms/wells/service/monthly-out-of-storage-agrg';

const codes = await codeUtil.getMultiCodes(
  'OSTR_TP_CD',
  'PD_GD_CD',
  'ITM_KND_CD',
  'MAT_UTLZ_DV_CD',
  'USE_YN',
);

let cachedParams;
const searchParams = ref({
  startDt: now.add(-3, 'month').startOf('M').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  wareDvCd: '', // 창고구분
  itmGdCd: 'A', // 등급
  itmKndCd: '', // 품목구분
  itmPdCd: '', // 품목
  useYn: '', // 사용여부
});

let gridView;
let gridData;
let fieldsObj;

const totalCount = ref(0);
const initTotalCount = ref(0);
const itmPdCds = ref();

const onValidateDate = async () => {
  const errors = [];
  const monthDiff = dayjs(searchParams.value.startDt).startOf('month').diff(dayjs(searchParams.value.endDt).startOf('month'), 'month');
  if (monthDiff <= -12) {
    errors.push(t('MSG_ALT_SEARCH_UNDER_MN', [t('12')]));
  }
  return errors[0] || true;
};

const svpdCommGbFilter = [{ name: 'svpdCommGbFilter', criteria: "value = '01'" }];
// async function onChangeMatUtlzDvCd() {
//   const view = grdMainRef.value.getView();
//   view.activateAllColumnFilters('svpdBaseColorGb', false);
//   view.activateAllColumnFilters('svpdCommGb', false);
//
//   if (searchParams.value.matUtlzDvCd === '01') {
//     view.activateColumnFilters('svpdBaseColorGb', 'svpdBaseColorGbFilter', true);
//     totalCount.value = view.getItemCount(); // 필터된 데이터 건수 표시
//   } else if (searchParams.value.matUtlzDvCd === '02') {
//     view.activateColumnFilters('svpdCommGb', 'svpdCommGbFilter', true);
//     totalCount.value = view.getItemCount(); // 필터된 데이터 건수 표시
//   } else {
//     totalCount.value = initTotalCount.value; // 필터 해제시 초기 데이터 건수 노출
//   }
// }
onMounted(async () => {
  // 품목구분 : 상품 기본설정
  searchParams.value.itmKndCd = '4';
  // 필드 셋팅
  fieldsObj.setFields();
});
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  console.log(list);
  totalCount.value = list.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();

  view.activateAllColumnFilters('svpdCommGb', false); // 필터 해제 처리

  initTotalCount.value = totalCount.value; // 초기 데이터 건수
}

async function onClickSearch() {
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

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

fieldsObj = {
  // 그리드 공통컬럼
  defaultFields: [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '170', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '240', styleName: 'text-left' },
    { fieldName: 'asMatMngTpCd', styleName: 'text-center', visible: false, autoFilter: false }, /* 필터시 사용 */
    { fieldName: 'asMatCmnClsfCd', styleName: 'text-center', visible: false, autoFilter: false }, /* 필터시 사용 */
    {
      fieldName: 'asLdtm',
      header: t('리드타임'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'minGoQty',
      header: t('MOQ'),
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
      header: t('매출'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'totBfsvcQty',
      header: t('B/S'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'totRecapAsQty',
      header: t('A/S(유)'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'totFrisuAsQty',
      header: t('A/S(무)'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'totEtcQty',
      header: t('기타'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'totSumQty',
      header: t('계'),
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
      header: t('매출'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'bfsvcQty',
      header: t('B/S'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'recapAsQty',
      header: t('유상'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'frisuAsQty',
      header: t('무상'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
    {
      fieldName: 'sumQty',
      header: t('계'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
    },
  ],
  setFields() {
    const columnMonthlyTotals = [];
    const columnMonthlys = [];
    for (let mm = 1; mm <= 12; mm += 1) {
      const columnMonthly = [];
      const columnMonthlyItems = [];
      // monthlyFields 필드에 정의된 필드를 기준으로 동적 필드 생성
      const columnMonthlyFields = [...fieldsObj.monthlyFields];
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
      // 월별 헤더
      columnMonthly.push(
        {
          direction: 'horizontal',
          header: `${mm}${t('MSG_TXT_MON')}`,
          items: columnMonthlyItems,
        },
      );
      columnMonthlys.push(columnMonthly);
    }
    const columns = [...fieldsObj.defaultFields,
      ...fieldsObj.totalFields,
      ...columnMonthlyTotals];
    const layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
      {
        header: t('MSG_TXT_SUM'),
        items: ['totIstQty', 'totBfsvcQty', 'totRecapAsQty', 'totFrisuAsQty', 'totEtcQty', 'totSumQty'],
      },
    ];
    columnMonthlys.forEach((item) => {
      layoutColumns.push(item[0]);
    });
    const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
    gridData.setFields(fields);
    gridView.setColumns(columns);
    gridView.setFixedOptions({ colCount: 3, resizable: true });
    gridView.columnByName('pdNm').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-left text-weight-bold' });
    gridView.setColumnFilters('svpdCommGb', svpdCommGbFilter); // 필터 적용
    gridView.setColumnLayout([...layoutColumns]);
    gridView.setFooters({ visible: true, items: [{ height: 30 }] });
  },
  // 리스트에 담겨진 항목 중 fieldName 배열로 가져옴
  getColumnNameArr(objList) {
    return objList.map((v) => v.fieldName);
  },

};

const initGrdMain = defineGrid((data, view) => {
  const fields = [];
  const columns = [];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  gridView = view;
  gridData = data;
});

</script>
