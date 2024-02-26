<!--
 ***************************************************************************************************
 * 프로그램 개요
 ***************************************************************************************************
 1. 모듈 : 품목별 자재출고금액 현황
 2. 프로그램 ID : WwsnaOutOfStorageCostByTaskTypeListM
 3. 작성자 : heymi.cho
 4. 작성일 : 2023.07.27
 ***************************************************************************************************
 * 프로그램 설명
 ***************************************************************************************************
 - 품목별 자재출고금액 현황 (http://localhost:3000/#/service/wwsna-out-of-storage-cost-by-task-type)
 ***************************************************************************************************
-->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.stOstrDt"
            v-model:to="searchParams.edOstrDt"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.stOstrDt"
          v-model:end-ym="searchParams.edOstrDt"
          v-model:options-ware-dv-cd="strWareDvCd"
          v-model:ware-dv-cd="searchParams.strWareDvCd"
          v-model:ware-no-m="searchParams.strWareNoM"
          v-model:ware-no-d="searchParams.strWareNoD"
          sub-first-option="all"
          :colspan="2"
          :label1="$t('MSG_TXT_OSTR_PTRM')"
          :label2="$t('MSG_TXT_STR_WARE')"
          :label3="$t('MSG_TXT_WARE')"
          :label4="$t('MSG_TXT_WARE')"
        />
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
        >
          <kw-select
            v-model="searchParams.pdGdCd"
            :options="codes.PD_GD_CD"
            disable
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_USE_SEL')"
        >
          <kw-select
            v-model="searchParams.useSel"
            :options="codes.USE_YN"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
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
          :label="$t('MSG_TXT_STOC_TYPE')"
        >
          <kw-select
            v-model="searchParams.stocTypeCd"
            :options="[...codes.MAT_MNGT_DV_CD, {codeId: 'N', codeName: `(${$t('MSG_TXT_NONE')})`, }]"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.itmPdCdFrom"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.itmPdCdTo"
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
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
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
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
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
import { codeUtil, getComponentType, gridUtil, useDataService, defineGrid } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
// import { getCodeNames } from '~sms-common/product/utils/pdUtil';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';

const { t } = useI18n();
const now = dayjs();
const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;
// const { ogTpCd } = getters['meta/getUserInfo'];

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'COPN_DV_CD',
  'MAT_MNGT_DV_CD',
  'MAT_UTLZ_DV_CD', // 자재활용구분코드
  'ITM_KND_CD', // AS자재구분앱코드
  'PD_GD_CD', // 상품등급
  'USE_YN', // 사용유무
);

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

/*
 *  Search Parameter
 */
const searchParams = ref({
  stOstrDt: now.set('date', 1).format('YYYYMMDD'),
  edOstrDt: now.format('YYYYMMDD'),
  strWareDvCd: '',
  strWareNoM: '',
  strWareNoD: '',
  itmKndCd: '',
  itmPdCdFrom: '',
  itmPdCdTo: '',
  pdGdCd: 'A',
  useSel: '',
  stocTypeCd: '',
});

async function fetchData() {
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/out-of-storage-cost-by-task-type/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  pageInfo.value.pageSize = pagingResult.totalCount;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  console.log(state);
  view.resetCurrent();
  await gridUtil.reset(view);
}

/*
 *  Search - 조회
 */
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/out-of-storage-cost-by-task-type/excel-download', { params: searchParams.value });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

/*
 * 그리드 데이터 필터링
 */
const matUtlzOptions = ref([]);
// const filters = [];
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
    name: 'trnoverFilter', // 회전율
    criteria: 'value="Y"',
  }];

  view.setColumnFilters('cmnPartDvCd', filter1);
  view.setColumnFilters('ordnyHvMatYn', filter2);
  view.setColumnFilters('trnoverRtOjYn', filter3);

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
    view.activateColumnFilters('trnoverRtOjYn', false);
    view.activateColumnFilters('trnoverRtOjYn', ['trnoverFilter'], true);
  } else {
    view.activateColumnFilters('trnoverRtOjYn', ['trnoverFilter'], false);
  }
};

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '140', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '270', styleName: 'text-left' },
    { fieldName: 'ordnyHvMatYn', header: t('MSG_TXT_BTD_MAT'), width: '120', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'cmnPartDvCd', header: t('MSG_TXT_ITM_CD'), width: '140', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'trnovrRtOjYn', header: t('MSG_TXT_TURNOVER_TRGT'), width: '270', styleName: 'text-left', visible: false, autoFilter: false },
    { fieldName: 'istQty',
      header: t('MSG_TXT_INSTALLATION') + t('MSG_TXT_QTY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '###,###,##0',
      footer: {
        expression: 'sum',
        numberFormat: '###,###,##0',
      },
    },
    { fieldName: 'istPdctUprcSum',
      header: t('MSG_TXT_OSTR') + t('MSG_TXT_AMT'),
      width: '130',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '###,###,##0',
      footer: {
        expression: 'sum',
        numberFormat: '###,###,##0',
      },
    },
    { fieldName: 'bsQty',
      header: t('MSG_TXT_BS'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '###,###,##0',
      footer: {
        expression: 'sum',
        numberFormat: '###,###,##0',
      },
    },
    { fieldName: 'bsPdctUprcSum',
      header: t('MSG_TXT_OSTR') + t('MSG_TXT_AMT'),
      width: '130',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '###,###,##0',
      footer: {
        expression: 'sum',
        numberFormat: '###,###,##0',
      },
    },
    { fieldName: 'asFreeQty',
      header: t('MSG_TXT_AS_PAY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '###,###,##0',
      footer: {
        expression: 'sum',
        numberFormat: '###,###,##0',
      },
    },
    { fieldName: 'asFreePdctUprcSum',
      header: t('MSG_TXT_OSTR') + t('MSG_TXT_AMT'),
      width: '130',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '###,###,##0',
      footer: {
        expression: 'sum',
        numberFormat: '###,###,##0',
      },
    },
    { fieldName: 'asPayQty',
      header: t('MSG_TXT_AS_FREE'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '###,###,##0',
      footer: {
        expression: 'sum',
        numberFormat: '###,###,##0',
      },
    },
    { fieldName: 'asPayPdctUprcSum',
      header: t('MSG_TXT_OSTR') + t('MSG_TXT_AMT'),
      width: '130',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '###,###,##0',
      display: true,
      footer: {
        expression: 'sum',
        numberFormat: '###,###,##0',
      },
    },
  ];
  // eslint-disable-next-line max-len
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.fixedOptions.colCount = 3;
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });
  view.filteringOptions.enabled = false;
});

</script>
