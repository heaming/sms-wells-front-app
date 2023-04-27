<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CMA
2. 프로그램 ID : WwsnaIndependenceWarehouseOstrMgtM - 독립창고출고관리(W-SV-U-0193M01)
3. 작성자 : inho.choi
4. 작성일 : 2023.03.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
관리자가 물류센터로 독립창고에 물량을 일괄요청하는 화면
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
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            @change="onChangeBaseYm"
          />
        </kw-search-item>
        <!-- 배정년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_ASN_YM')"
        >
          <kw-date-picker
            v-model="searchParams.asnOjYm"
            type="month"
          />
        </kw-search-item>
        <!-- 회차 -->
        <kw-search-item
          :label="$t('MSG_TXT_ORDERSELECT_TITLE')"
        >
          <kw-input
            v-model="searchParams.asnTnN"
            type="Number"
          />
        </kw-search-item>
        <!-- 출고창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE')"
        >
          <kw-select
            v-model="searchParams.ostrOjWareNo"
            :options="logistics"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 품목구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="filterCodes.filterItmKndCd"
            first-option="all"
            class="w150"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.itmKndCdD"
            :options="itemKndCdD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 출고일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
        >
          <kw-date-picker
            v-model="searchParams.ostrDt"
            type="month"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 입고창고 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.baseYmd"
          v-model:end-ym="searchParams.baseYmd"
          v-model:options-ware-dv-cd="ostrWareDvCd"
          v-model:ware-dv-cd="searchParams.ostrWareDvCd"
          v-model:ware-no-m="searchParams.ostrWareNoM"
          v-model:ware-no-d="searchParams.ostrWareNoD"
          sub-first-option="all"
          :colspan="2"
          :label1="$t('MSG_TXT_STR_DT')"
          :label2="$t('MSG_TXT_STR_WARE')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
        />
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('TXT_MSG_AS_ITM_CD')"
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
      <kw-search-row>
        <!-- SAP코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_SAP_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.sapMatCdFrom"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.sapMatCdTo"
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
          dense
          grid-action
          :label="$t('MSG_TXT_SAVE')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickSave"
        />
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

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
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
import { codeUtil, useDataService, getComponentType, useMeta, defineGrid, gridUtil, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';

const { getConfig } = useMeta();
const { t } = useI18n();
const { notify } = useGlobal();

const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));

const baseURI = '/sms/wells/service/independence-ware-ostrs';
const individualURI = '/sms/wells/service/individual-ware-ostrs';
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = ref(await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'ITM_KND_CD',
  'WARE_DV_CD',
  'MNGT_UNIT_CD',
));

// 품목구분 필터링
const filterCodes = ref({
  filterItmKndCd: [],
});
filterCodes.value.filterItmKndCd = codes.value.ITM_KND_CD.filter(
  ({ codeId }) => ['4', '5', '6'].includes(codeId),
);

console.log(dayjs().format('YYYYMMDD'));

let cachedParams;
const searchParams = ref({
  baseYm: '',
  baseYmd: '',
  asnOjYm: '',
  itmKndCd: '',
  asnTnN: '1',
  ostrOjWareNo: '',
  ostrWareDvCd: '3',
  ostrWareNoM: '',
  ostrWareNoD: '',
  ostrDt: '',
  itmKndCdD: '',
  sapMatCdFrom: '',
  sapMatCdTo: '',
  itmPdCdFrom: '',
  itmPdCdTo: '',
});

searchParams.value.baseYm = dayjs().format('YYYYMM');
searchParams.value.baseYmd = dayjs().format('YYYYMMDD');
searchParams.value.asnOjYm = dayjs().format('YYYYMM');
searchParams.value.ostrDt = dayjs().format('YYYYMMDD');

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const ostrWareDvCd = { WARE_DV_CD: [
  { codeId: '2', codeName: '서비스센터' },
  { codeId: '3', codeName: '영업센터' },
] };

codes.value.WARE_DV_CD = codes.value.WARE_DV_CD.filter(
  ({ codeId }) => ['2', '3'].includes(codeId),
);

const itemKndCdD = ref();
const onChangeItmKndCd = async () => {
  const res = await dataService.get(`${individualURI}/filter-items`, { params: searchParams.value });
  itemKndCdD.value = res.data;
  searchParams.value.itmKndCdD = itemKndCdD.value[0].codeId;
};

// 기준년월이 변경되었을때
function onChangeBaseYm() {
  searchParams.value.baseYmd = `${searchParams.value.baseYm}01`;
}

const logisticParams = ref({
  apyYm: dayjs().format('YYYYMM'),
});

const logistics = ref();

async function fetchDefaultData() {
  const res = await dataService.get(`${individualURI}/logistic`, { params: logisticParams.value });
  logistics.value = res.data;
  console.log(logistics.value);
  searchParams.value.ostrOjWareNo = logistics.value[0].codeId;
}

async function fetchData() {
  const res = await dataService.get(baseURI, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  console.log(`codes : ${codes}`);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseURI}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'independenceWarehouseOstrMgtM',
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSave() {
  // TODO: 물류서비스 I/F가 완료되면 update/insert check
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);
  console.log(`view : ${view}`);
  console.log(`chkrows : ${chkRows}`);
  if (chkRows.length === 0) {
    notify(t('MSG_ALT_CHK_MIN_SELT', [1, t('MSG_TIT_ROW')]));

    return false;
  }

  const addParams = [];
  addParams.push(chkRows.map((v, i) => {
    const addValueParams = {};
    addValueParams.ostrAkNo = '';
    addValueParams.ostrAkSn = i + 1;
    addValueParams.strWareNo = v.strWareNo;
    addValueParams.ostrWareNo = v.ostrOjWareNo;
    addValueParams.itmPdCd = v.itemCd;
    addValueParams.mngtUnitCd = v.mgtUnt;
    addValueParams.itmGdCd = v.matGdCd;
    addValueParams.ostrAkQty = v.outQty;
    addValueParams.rmkCn = v.rmks;
    return addValueParams;
  }));

  const res = await dataService.post(`${baseURI}`, { params: addParams });
  console.log(`res :  ${res}`);
  notify(t('MSG_ALT_SAVE_DATA'));
}

onMounted(async () => {
  await fetchDefaultData();
  // cachedParams = cloneDeep(searchParams.value);
  // await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'strWareNo', header: t('MSG_TXT_WARE'), width: '100', styleName: 'text-center' },
    { fieldName: 'wareNm', header: t('MSG_TXT_WARE_NM'), width: '210', styleName: 'text-left' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'itemCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '230', styleName: 'text-left' },
    { fieldName: 'mgtUntNm', header: t('MSG_TXT_MNGT_UNIT'), width: '80', styleName: 'text-center' },
    { fieldName: 'matGdCd', header: t('MSG_TXT_GD'), width: '80', styleName: 'text-center' },
    { fieldName: 'pitmStocAGdQty', header: t('MSG_TXT_HGR_STOC'), width: '100', styleName: 'text-right' },
    { fieldName: 'boxQty', header: t('MSG_TXT_UNIT_QTY'), width: '130', styleName: 'text-right' },
    { fieldName: 'crtlStocQty', header: t('MSG_TXT_STOC_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'thwkExpQty', header: t('MSG_TXT_NED_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'cfrmQty', header: t('MSG_TXT_QTY'), width: '84', styleName: 'text-right' },
    { fieldName: 'boxQty1', header: t('MSG_TXT_BOX'), width: '84', styleName: 'text-right' },
    { fieldName: 'accQty', header: t('MSG_TXT_AGGS'), width: '84', styleName: 'text-right' },
    { fieldName: 'accBoxQty', header: t('MSG_TXT_BOX'), width: '84', styleName: 'text-right' },
    { fieldName: 'outBoxQty', header: t('MSG_TXT_FILT_BOX_QTY'), width: '130', styleName: 'text-right' },
    { fieldName: 'outQty',
      header: t('MSG_TXT_OSTR_QTY'),
      editor: {
        type: 'input',
      },
      editable: true,
      width: '110',
      styleName: 'text-right',
    },
    { fieldName: 'rmks',
      header: t('MSG_TXT_NOTE'),
      editor: {
        type: 'input',
      },
      editable: true,
      width: '240',
      styleName: 'text-left' },

    { fieldName: 'rectOstrDt', header: t('MSG_TXT_NOTE'), width: '0', visible: false, styleName: 'text-right' },
    { fieldName: 'rectOstrTpCd', header: t('MSG_TXT_NOTE'), width: '0', visible: false, styleName: 'text-right' },
    { fieldName: 'mgtUnt', header: t('MSG_TXT_NOTE'), width: '0', visible: false, styleName: 'text-right' },
  ];
  const fields = columns.map((v) => ({ fieldName: v.fieldName }));

  view.setColumnLayout([
    'strWareNo', 'wareNm', 'sapMatCd', 'itemCd', 'pdAbbrNm', 'mgtUntNm', 'matGdCd', 'pitmStocAGdQty',
    'boxQty', 'crtlStocQty', 'thwkExpQty',
    {
      header: t('MSG_TXT_QOM_ASN_CNFM'), // 물량배정확정 // colspan title
      direction: 'horizontal', // merge type
      items: ['cfrmQty', 'boxQty1'],
    },
    {
      header: t('MSG_TXT_QOM_ASN_OSTR'), // 물량배정출고
      direction: 'horizontal',
      items: ['accQty', 'accBoxQty'],
    },
    'outBoxQty', 'outQty', 'rmks', 'rectOstrDt', 'rectOstrTpCd',
  ]);

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  const editFields = ['outQty', 'rmks'];
  view.onCellEditable = (grid, clickData) => {
    if (!editFields.includes(clickData.column)) {
      return false;
    }
  };

  view.onCellClicked = (grid, clickData) => {
    if (editFields.includes(clickData.column)) {
      view.editOptions.editable = true;
    } else {
      view.editOptions.editable = false;
    }
  };

  // checkbox auto checked
  view.onEditChange = (grid, index, value) => {
    const oldvalue = gridUtil.getOrigCellValue(grid, index.itemIndex, index.fieldName);

    if (value !== oldvalue) {
      view.checkRow(index.itemIndex, true);
    } else {
      view.checkRow(index.itemIndex, false);
    }
  };
});
</script>
<style scoped>
</style>
