<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [WSNC] allocate(배정관리)
2. 프로그램 ID : wwsncProductServicePresentStateListM  - 제품 서비스 현황 (W-SV-U-0229M01)
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
            :label="$t('MSG_TXT_BASE_YEAR')"
            type="year"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_LOCARA_MNGT_DV_CD')">
          <kw-select
            v-model="searchParams.mngrDvCd"
            :label="$t('MSG_TXT_LOCARA_MNGT_DV_CD')"
            :options="codes.LOCARA_MNGT_DV_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            @change="changePdGrpCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_NM')"
        >
          <!--            rules="required"-->
          <kw-select
            v-model="searchParams.pdCd"
            :options="pds"
            first-option="all"
            option-label="cdNm"
            option-value="cd"
            :disable="searchParams.pdGrpCd === '' "
            :label="$t('MSG_TXT_PRDT_NM')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <kw-btn
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_PRTG')"
          dense
          icon="print"
          secondary
        />
        <kw-btn
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          dense
          icon="download_on"
          secondary
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService,
  // useMeta
} from 'kw-lib';
import { cloneDeep, toInteger } from 'lodash-es';
import dayjs from 'dayjs';
import smsCommon from '~sms-wells/service/composables/useSnCode';

const { t } = useI18n();
const dataService = useDataService();

// const { getConfig } = useMeta();

const { getPartMaster } = smsCommon();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// const subCodes = ref((await getPartMaster()).map((v) => ({ codeId: v.cd, codeName: v.cdNm })));
const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  wkExcnDt: dayjs().format('YYYY'),
  mngrDvCd: '',
  pdGrpCd: '',
  pdCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 0,
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'LOCARA_MNGT_DV_CD',
  'PD_GRP_CD',
);

const pds = ref([]);
async function changePdGrpCd() {
  if (searchParams.value.pdGrpCd) {
    pds.value = await getPartMaster(
      '4',
      searchParams.value.pdGrpCd,
      'M',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      'X', /* 단종여부Y/N, 만약 X로 데이터가 유입되면 단종여부를 조회하지 않음 */
    );
  } else pds.value = [];
  searchParams.value.pdCd = '';
}
changePdGrpCd();

function calcData(data) {
  let totalSum = 0;
  let rowSum = 0;

  data.forEach((item) => {
    totalSum += toInteger(item.acol1);
    totalSum += toInteger(item.acol2);
    totalSum += toInteger(item.acol3);
    totalSum += toInteger(item.acol4);
    totalSum += toInteger(item.acol5);
    totalSum += toInteger(item.acol6);
    totalSum += toInteger(item.acol7);
    totalSum += toInteger(item.acol8);
    totalSum += toInteger(item.acol9);
    totalSum += toInteger(item.acol10);
    totalSum += toInteger(item.acol11);
    totalSum += toInteger(item.acol12);
  });
  data.forEach((item, idx) => {
    rowSum = 0;
    rowSum += toInteger(item.acol1);
    rowSum += toInteger(item.acol2);
    rowSum += toInteger(item.acol3);
    rowSum += toInteger(item.acol4);
    rowSum += toInteger(item.acol5);
    rowSum += toInteger(item.acol6);
    rowSum += toInteger(item.acol7);
    rowSum += toInteger(item.acol8);
    rowSum += toInteger(item.acol9);
    rowSum += toInteger(item.acol10);
    rowSum += toInteger(item.acol11);
    rowSum += toInteger(item.acol12);
    data[idx].totalCount = rowSum;
    data[idx].per = ((rowSum / totalSum) * 100).toFixed(2);
  });
  return data;
}

async function fetchData() {
  const res = await dataService.get(
    '/sms/wells/service/as-assign-state/product-services',
    { params: { ...cachedParams } },
  );

  const view = grdMainRef.value.getView();

  const totalCustomers = calcData(res.data);

  pageInfo.value.totalCount = totalCustomers.length;
  pageInfo.value.pageSize = totalCustomers.length;

  view.getDataSource().setRows(totalCustomers);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/as-assign-state/product-services', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'productServiceStates',
    timePostfix: true,
    exportData: calcData(res.data),
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'wkExcnDt' },
    { fieldName: 'svBizHclsfNm' },
    { fieldName: 'totalCount', dataType: 'number' },
    { fieldName: 'per', dataType: 'number' },
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
  ];

  const columns = [

    { fieldName: 'wkExcnDt',
      header: t('MSG_TXT_BASE_YEAR'),
      width: '40',
      styleName: 'text-center',
      mergeRule: { criteria: 'value' } },

    { fieldName: 'svBizHclsfNm',
      header: t('MSG_TXT_PD_GRP'),
      width: '100',
      styleName: 'text-left',
      footer: { text: t('MSG_TXT_SUM') } },

    { fieldName: 'totalCount',
      header: t('MSG_TXT_SUM'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },

    { fieldName: 'per',
      header: `${t('MSG_TXT_RAT')}(%)`,
      width: '40',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol1',
      header: `1${t('MSG_TXT_MON')}`,
      width: '40',
      numberFormat: '#,##0',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol2',
      header: `2${t('MSG_TXT_MON')}`,
      width: '40',
      numberFormat: '#,##0',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol3',
      header: `3${t('MSG_TXT_MON')}`,
      width: '40',
      numberFormat: '#,##0',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol4',
      header: `4${t('MSG_TXT_MON')}`,
      width: '40',
      numberFormat: '#,##0',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol5',
      header: `5${t('MSG_TXT_MON')}`,
      width: '40',
      numberFormat: '#,##0',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol6',
      header: `6${t('MSG_TXT_MON')}`,
      width: '40',
      numberFormat: '#,##0',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol7',
      header: `7${t('MSG_TXT_MON')}`,
      width: '40',
      numberFormat: '#,##0',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol8',
      header: `8${t('MSG_TXT_MON')}`,
      width: '40',
      numberFormat: '#,##0',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol9',
      header: `9${t('MSG_TXT_MON')}`,
      width: '40',
      numberFormat: '#,##0',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol10',
      header: `10${t('MSG_TXT_MON')}`,
      width: '40',
      numberFormat: '#,##0',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol11',
      header: `11${t('MSG_TXT_MON')}`,
      width: '40',
      numberFormat: '#,##0',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol12',
      header: `12${t('MSG_TXT_MON')}`,
      width: '40',
      numberFormat: '#,##0',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
  ];
  const columnLayout = [
    { direction: 'horizontal', hideChildHeaders: true, items: ['wkExcnDt', 'svBizHclsfNm', 'totalCount'], header: { text: t('MSG_TXT_SUM') } },
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

  view.setColumnLayout(columnLayout);

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.setFooters({
    visible: true,
    items: [{ height: 42 }],
  });
  view.rowIndicator.visible = false; // create number indicator column
  view.editOptions.editable = false; // Grid Editable On
  view.setOptions({ summaryMode: 'statistical' });
});

</script>
