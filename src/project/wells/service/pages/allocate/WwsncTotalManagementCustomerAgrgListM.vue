<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [WSNC] allocate(배정관리)
2. 프로그램 ID : PGE_SNC_00005 - 총 관리고객 집계 (W-SV-U-0228M01)
3. 작성자 : gs.piit122 김동엽
4. 작성일 : 2022-12-06
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- http://localhost:3000/#/service/wwsnc-total-management-customer-agrg-list
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
          <kw-field-wrap>
            <kw-date-picker
              v-model="searchParams.year"
              rules="required"
              type="year"
            />
          </kw-field-wrap>
        </kw-search-item>

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
            :rules="searchParams.pdGrpCd !== '' ? 'required' : '' "
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info

            :total-count="pageInfo.totalCount"
          />
          <span class="ml8">(단위:명)</span>
        </template>
        <kw-btn
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          dense
          icon="download_on"
          secondary
          :disable="pageInfo.totalCount === 0"
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
import {
  stringUtil,
  codeUtil,
  defineGrid,
  getComponentType,
  useDataService,
  gridUtil,
} from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import smsCommon from '~sms-wells/service/composables/useSnCode';

const { t } = useI18n();
const { currentRoute } = useRouter();
const dataService = useDataService();

// const { getMcbyCstSvOjIz } = smsCommon();
const { getPartMaster } = smsCommon();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageSize: 0,
});
let cachedParams;
const searchParams = ref({
  pdGrpCd: '',
  pdCd: '',
  year: stringUtil.getDateFormat(dayjs().format(), 'yyyyMMdd').substring(0, 4),
});
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
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
// const productCode = ref();
// productCode.value = await getMcbyCstSvOjIz(searchParams.value.year, searchParams.value.pdGrpCd);
// productCode.value = await getPartMaster(undefined, searchParams.value.pdGrpCd);

// watch(() => [searchParams.value.year, searchParams.value.pdGrpCd], async () => {
//   // productCode.value = await getMcbyCstSvOjIz(searchParams.value.year, searchParams.value.pdGrpCd);
//   const tempVal = await getPartMaster(undefined, searchParams.value.pdGrpCd);
//   productCode.value = tempVal.map((v) => ({ codeId: v.cd, codeName: v.codeName }));
// }, { immediate: true });

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-assign-state/total-customers', { params: { ...cachedParams } });
  const view = grdMainRef.value.getView();
  let tcntTotal = 0;

  const totalCustomers = res.data;
  totalCustomers.forEach((item) => {
    tcntTotal += item.tcnt;
  });
  totalCustomers.forEach((item, idx) => {
    totalCustomers[idx].per = ((item.tcnt / tcntTotal) * 100).toFixed(2);
  });

  pageInfo.value.totalCount = tcntTotal;
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
  const response = await dataService.get('/sms/wells/service/as-assign-state/total-customers/excel-download', { params: cachedParams });

  const exportLayout = [
    {
      header: t('MSG_TXT_DIV'), // colspan title
      direction: 'horizontal', // merge type
      hideChildHeaders: true,
      items: ['yyyy', 'typNm'],
    },
    'tcnt',
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

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
    exportLayout,
  });
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
    { fieldName: 'yyyy',
      header: '년도',
      width: '80',
      styleName: 'text-center',
      footer: {
        text: t('MSG_TXT_SUM'),
      } },
    { fieldName: 'typNm',
      header: t('MSG_TXT_DV_NM'),
      width: '80',
      styleName: 'text-center',
    },
    { fieldName: 'acol1',
      header: `1${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol2',
      header: `2${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol3',
      header: `3${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol4',
      header: `4${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol5',
      header: `5${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol6',
      header: `6${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol7',
      header: `7${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol8',
      header: `8${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol9',
      header: `9${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol10',
      header: `10${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'acol11',
      header: `11${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    { fieldName: 'acol12',
      header: `12${t('MSG_TXT_MON')}`,
      width: '50',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'tcnt',
      header: t('MSG_TXT_SUM'),
      width: '100',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'per',
      header: `${t('MSG_TXT_RAT')}(%)`,
      width: '50',
      styleName: 'text-right',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
  ];

  const columnLayout = [
    { direction: 'horizontal', hideChildHeaders: true, items: ['yyyy', 'typNm'], header: { text: t('MSG_TXT_DIV') } },
    'tcnt',
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
