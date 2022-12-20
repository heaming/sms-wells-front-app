<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC (배정관리)
2. 프로그램 ID : W-SV-U-0228M01 총 관리고객 집계
3. 작성자 : gs.piit122
4. 작성일 : 2022-12-06
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- AS코드관리 (http://localhost:3000/#/service/wwsnc-total-management-customer-agrg-list)
****************************************************************************************************
-->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_BASE_YM')">
          <kw-field-wrap>
            <kw-date-picker
              v-model="searchParams.year"
              type="year"
              rules="required"
            />
          </kw-field-wrap>
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PD_GRD')">
          <kw-select
            v-model="searchParams.pdGdCd"
            :label="$t('MSG_TXT_PD_GRD')"
            :options="codes.PD_GD_CD"
            option-label="codeName"
            option-value="codeId"
            rules="required"
            @update:model-value="onUpdate"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PRDT')">
          <kw-select
            v-model="searchParams.pdCd"
            :options="productCode"
            first-option="all"
            option-label="codeName"
            option-value="codeId"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ $t('MSG_TXT_SRCH_RSLT') }}</h3>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="5"
        @init="initGrdMain"
      />
      <kw-action-bottom />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  stringUtil,
  codeUtil,
  defineGrid,
  getComponentType,
  useDataService,
} from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty, cloneDeep } from 'lodash-es';
import smsCommon from '~sms-wells/service/composables/useSnCode';

const { t } = useI18n();
const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;
const dataService = useDataService();

const { getMcbyCstSvOjIz } = smsCommon();
const searchParams = ref({
  pdGdCd: 'A',
  pdCd: '',
  year: stringUtil.getDateFormat(dayjs().format(), 'yyyyMMdd').substring(0, 4),
});
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GD_CD',
);
const productCode = ref();
productCode.value = await getMcbyCstSvOjIz(searchParams.value.year, searchParams.value.pdGdCd);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function onUpdate() {
  if (!isEmpty(searchParams.value.year) && !isEmpty(searchParams.value.pdGdCd)) {
    productCode.value = await getMcbyCstSvOjIz(searchParams.value.year, searchParams.value.pdGdCd);
  }
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/total-customers', { params: { ...cachedParams } });
  const view = grdMainRef.value.getView();
  let tcntTotal = 0;
  res.data.forEach((item) => {
    tcntTotal += item.tcnt;
  });
  res.data.forEach((item, idx) => {
    res.data[idx].per = ((item.tcnt / tcntTotal) * 100).toFixed(2);
  });
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'yyyy' },
    { fieldName: 'typNm' },
    { fieldName: 'acol1', dataType: 'number' },
    { fieldName: 'acol2', dataType: 'number' },
    { fieldName: 'acol3', dataType: 'number' },
    { fieldName: 'acol4', dataType: 'number' },
    { fieldName: 'acol5', dataType: 'number' },
    { fieldName: 'acol6', dataType: 'number' },
    { fieldName: 'acol7', dataType: 'number' },
    { fieldName: 'acol8', dataType: 'number' },
    { fieldName: 'acol9', dataType: 'number' },
    { fieldName: 'acol10', dataType: 'number' },
    { fieldName: 'acol11', dataType: 'number' },
    { fieldName: 'acol12', dataType: 'number' },
    { fieldName: 'tcnt', dataType: 'number' },
    { fieldName: 'per', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'yyyy', header: '년도', width: '50', styleName: 'text-center' },
    { fieldName: 'typNm',
      header: '구분명',
      width: '100',
      styleName: 'text-center',
      footer: {
        text: '합계',
      } },
    { fieldName: 'acol1',
      header: '1월',
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'acol2',
      header: '2월',
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol3',
      header: '3월',
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol4',
      header: '4월',
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol5',
      header: '5월',
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol6',
      header: '6월',
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol7',
      header: '7월',
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol8',
      header: '8월',
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol9',
      header: '9월',
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol10',
      header: '10월',
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol11',
      header: '11월',
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'acol12',
      header: '12월',
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'tcnt',
      header: '계',
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'per',
      header: '비율(%)',
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
  ];

  const columnLayout = [
    { direction: 'horizontal', items: ['yyyy', 'typNm'], header: { text: t('MSG_TXT_DIV') } },
    'acol1',
    'acol2',
    'acol3',
    'acol4',
    'acol5',
    'acol6',
    'acol7',
    'acol8',
    'acol9',
    'acol10',
    'acol11',
    'acol12',
    'tcnt',
    'per',
  ];
  view.setColumnLayout(columnLayout);

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.setFooters({
    visible: true,
    items: [{ height: 30 }],
  });
  view.rowIndicator.visible = false; // create number indicator column
  view.editOptions.editable = false; // Grid Editable On
  view.displayOptions.emptyMessage = t('MSG_ALT_NO_INFO_SRCH');
  view.setOptions({ summaryMode: 'statistical' });
});
</script>
