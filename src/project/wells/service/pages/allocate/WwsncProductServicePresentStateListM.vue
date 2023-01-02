<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [WSNC] allocate(배정관리)
2. 프로그램 ID : WwsncProductServicePresentStateListM - 제품 서비스 현황 (W-SV-U-0229M01)
3. 작성자 : gs.piit122 김동엽
4. 작성일 : 2023-01-02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 조회조건에 일치하는 상품별, 작업유형별 서비스 처리 정보를 조회한다.
****************************************************************************************************
-->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_BASE_YEAR')">
          <kw-date-picker
            v-model="searchParams.wkExcnDt"
            type="year"
            :label="$t('MSG_TXT_BASE_YEAR')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_LOCARA_MNGT_DV_CD')">
          <kw-select
            v-model="searchParams.mngrDvCd"
            :options="codes.LOCARA_MNGT_DV_CD"
            :label="$t('MSG_TXT_LOCARA_MNGT_DV_CD')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PD_GRP')">
          <kw-select
            v-model="searchParams.pdPrpVal20"
            :options="codes.PD_GRP_CD"
            :label="$t('MSG_TXT_PD_GRP')"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="subCodes"
            first-option="all"
            :label="$t('MSG_TXT_PD_GRP')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ $t('MSG_TXT_SRCH_RSLT') }}</h3>
      <kw-action-top>
        <kw-btn
          :label="$t('MSG_BTN_PRTG')"
          dense
          icon="print"
          secondary
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const { t } = useI18n();
const dataService = useDataService();

const { getLcStockSt101tb } = useSnCode();

const subCodes = ref((await getLcStockSt101tb()).map((v) => ({ codeId: v.cd, codeName: v.cdNm })));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  wkExcnDt: dayjs().format('YYYY'),
  mngrDvCd: '',
  pdPrpVal20: '',
  pdCd: '',
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'LOCARA_MNGT_DV_CD',
  'PD_GRP_CD',
);

async function fetchData() {
  const res = await dataService.get(
    '/sms/wells/service/as-assign-state/product-service-states',
    { params: { ...cachedParams } },
  );
  const view = grdMainRef.value.getView();
  // let tcntTotal = 0;
  let totalSum = 0;
  let rowSum = 0;

  const totalCustomers = res.data;
  totalCustomers.forEach((item) => {
    totalSum += item.acol1;
    totalSum += item.acol2;
    totalSum += item.acol3;
    totalSum += item.acol4;
    totalSum += item.acol5;
    totalSum += item.acol6;
    totalSum += item.acol7;
    totalSum += item.acol8;
    totalSum += item.acol9;
    totalSum += item.acol10;
    totalSum += item.acol11;
    totalSum += item.acol12;
  });
  console.log(totalSum);
  totalCustomers.forEach((item, idx) => {
    rowSum = 0;
    rowSum += item.acol1;
    rowSum += item.acol2;
    rowSum += item.acol3;
    rowSum += item.acol4;
    rowSum += item.acol5;
    rowSum += item.acol6;
    rowSum += item.acol7;
    rowSum += item.acol8;
    rowSum += item.acol9;
    rowSum += item.acol10;
    rowSum += item.acol11;
    rowSum += item.acol12;
    totalCustomers[idx].totalCount = rowSum;
    totalCustomers[idx].per = ((rowSum / totalSum) * 100).toFixed(2);
  });
  view.getDataSource().setRows(totalCustomers);

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
    { fieldName: 'totalCount', dataType: 'number' },
    { fieldName: 'per', dataType: 'number' },
    { fieldName: 'wkExcnDt' },
    { fieldName: 'svBizHclsfNm' },
  ];
  const columns = [
    { fieldName: 'wkExcnDt',
      header: t('MSG_TXT_BASE_YEAR'),
      width: '50',
      styleName: 'text-center',
      mergeRule: {
        criteria: 'value',
      } },
    { fieldName: 'svBizHclsfNm',
      header: t('MSG_TXT_PD_GRP'),
      width: '100',
      styleName: 'text-left',
      footer: {
        text: t('MSG_TXT_SUM'),
      } },
    { fieldName: 'totalCount',
      header: t('MSG_TXT_SUM'),
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'per',
      header: '비율(%)',
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol1',
      header: `1${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol2',
      header: `2${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol3',
      header: `3${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol4',
      header: `4${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol5',
      header: `5${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol6',
      header: `6${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol7',
      header: `7${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol8',
      header: `8${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol9',
      header: `9${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol10',
      header: `10${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol11',
      header: `11${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol12',
      header: `12${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
  ];
  const columnLayout = [
    { direction: 'horizontal', items: ['wkExcnDt', 'svBizHclsfNm', 'totalCount'], header: { text: t('MSG_TXT_SUM') } },
    'per',
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
  ];
  view.setFooters({
    visible: true,
    items: [{ height: 30 }],
  });
  view.setColumnLayout(columnLayout);
  data.setFields(fields);
  view.setColumns(columns);
  view.setOptions({ summaryMode: 'statistical' });
});

</script>
