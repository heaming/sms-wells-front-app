<!--
 ***************************************************************************************************
 * 프로그램 개요
 ***************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaWarehouseOrganizationListM - 창고조직 관리
 3. 작성자 : taesung.Song
 4. 작성일 : 2022.12.01
 ***************************************************************************************************
 * 프로그램 설명
 ***************************************************************************************************
 - 창고조직 관리 (http://localhost:3000/#/service/wwsna-warehouse-organization-list)
 ***************************************************************************************************
-->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_BASE_YM')">
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            @change="onChangeBaseYm"
          />
        </kw-search-item>
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.baseYmd"
          v-model:end-ym="searchParams.baseYmd"
          v-model:options-ware-dv-cd="wareDvCd"
          v-model:ware-dv-cd="searchParams.wareDvCd"
          v-model:ware-no-m="searchParams.wareNoM"
          v-model:ware-no-d="searchParams.wareNoD"
          sub-first-option="all"
          :colspan="2"
          :label1="$t('MSG_TXT_OSTR_PTRM')"
          :label2="$t('MSG_TXT_WARE')"
          :label3="$t('MSG_TXT_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          @update:ware-dv-cd="onChangeStdWareDvCd"
          @update:ware-no-m="onChagneHgrWareNo"
        />
      </kw-search-row>

      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_WARE_DTL_DV')">
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterCodes.filterWareDtlDvCd"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_USE_YN')">
          <kw-select
            v-model="searchParams.codeUseYn"
            :options="codes.USE_YN"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_EPNO')">
          <kw-input
            v-model="searchParams.wareMngtPrtnrNo"
            type="text"
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
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          secondary
          dense
          :label="$t('MSG_BTN_WARE_OG_CRDOVR')"
          class="mr4"
          @click="onClickCarriedOver"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          dense
          primary
          :label="$t('MSG_BTN_WARE_INF_RGST')"
          class="mr8"
          @click="onClickWareOgCrdovr"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
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
import { codeUtil, useGlobal, useDataService, getComponentType, gridUtil, defineGrid, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';

const { t } = useI18n();

const { modal, alert, notify } = useGlobal();
const { getConfig } = useMeta();
const emit = defineEmits([
  'reloadPages',
]);

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'WARE_DTL_DV_CD',
  'WARE_DV_CD',
  'DIDY_DV_CD',
  'USE_YN',
  'ADM_ZN_CLSF_CD',
  'DIDY_DV_CD',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 창고상세구분 필터링
const filterCodes = ref({
  filterWareDtlDvCd: [],
});

let cachedParams;
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'), // 기준년월
  baseYmd: dayjs().format('YYYYMMDD'),
  wareDvCd: '2',
  wareDtlDvCd: '',
  codeUseYn: '',
  wareMngtPrtnrNo: '',
  wareNoM: '',
  wareNoD: '',
});

const wareDvCd = { WARE_DV_CD: [
  { codeId: '2', codeName: '서비스센터' },
  { codeId: '3', codeName: '영업센터' },
] };

// 기준년월이 변경되었을때
function onChangeBaseYm() {
  searchParams.value.baseYmd = `${searchParams.value.baseYm}01`;
}

// 창고구분이 변경되었을때
const onChangeWareDvCd = async () => {
  const strWareDvCd = searchParams.value.wareDvCd;

  if (strWareDvCd === '2') {
    filterCodes.value.filterWareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21'].includes(v.codeId));
  } else {
    filterCodes.value.filterWareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31', '32'].includes(v.codeId));
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

async function onClickCarriedOver() {
  const res = await dataService.get('/sms/wells/service/warehouse-organizations/carried-over', { params: { baseYm: searchParams.value.baseYm } });

  console.log(res);
  console.log(res.data);

  if (res.data > 0) {
    await alert(t('MSG_ALT_CRDOVR_WARE_INFO', [res.data]));
    return;
  }

  console.log(searchParams.value.baseYm);

  await dataService.post('/sms/wells/service/warehouse-organizations/carried-over', { baseYm: searchParams.value.baseYm });
  await notify(t('MSG_ALT_CRDOVR_WK_FSH'));
  emit('reloadPages');
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/warehouse-organizations/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: wareOg, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(wareOg);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/warehouse-organizations/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'warehouseOgList',
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickWareOgCrdovr(apyYm, wareNo) {
  const today = dayjs().format('YYYYMM');

  if (apyYm >= today) {
    const { result: isChanged } = await modal({
      component: 'WwsnaWarehouseOrganizationRegP',
      componentProps: { apyYm, wareNo },
    });

    if (isChanged) {
      notify(t('MSG_ALT_SAVE_DATA'));
      await fetchData();
    }
  } else {
    await alert(t('MSG_ALT_THM_BF_WAREINF_MDFC_IMP'));
  }
}

onMounted(async () => {
  await onChangeWareDvCd();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'wareDvCd' },
    { fieldName: 'wareDtlDvCd' },
    { fieldName: 'wareNo' },
    { fieldName: 'wareCd' },
    { fieldName: 'wareNm' },
    { fieldName: 'adrNm' },
    { fieldName: 'wareMngtPrtnrNo' },
    { fieldName: 'wareStocMgr' },
    { fieldName: 'hgrWare' },
    { fieldName: 'hgrWareNo' },
    { fieldName: 'hgrWareNm' },
    { fieldName: 'wareUseYn' },
    { fieldName: 'adrUseYn' },
    { fieldName: 'dsnBldNm' },
    { fieldName: 'bldCd' },
    { fieldName: 'didyDvCd' },
    { fieldName: 'wareAdrId' },
    { fieldName: 'ogCd' },
    { fieldName: 'bldNm' },
    { fieldName: 'apyYm' },
  ];

  const columns = [
    { fieldName: 'wareDvCd', header: t('MSG_TXT_WARE_DV'), options: codes.WARE_DV_CD, width: '120', styleName: 'text-center' },
    { fieldName: 'wareDtlDvCd', header: t('MSG_TXT_WARE_DTL_DV'), options: codes.WARE_DTL_DV_CD, width: '180', styleName: 'text-center' },
    { fieldName: 'wareUseYn', header: t('MSG_TXT_USE_EYN'), options: codes.USE_YN, width: '100', styleName: 'text-center' },
    { fieldName: 'wareCd', header: t('MSG_TXT_WARE_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'wareNo', header: t('MSG_TXT_WARE_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'wareNm', header: t('MSG_TXT_WARE_NM'), width: '280' },
    { fieldName: 'wareMngtPrtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'wareStocMgr', header: t('MSG_TXT_EMPL_NM'), width: '170' },
    { fieldName: 'hgrWare', header: t('MSG_TXT_WARE_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'hgrWareNo', header: t('MSG_TXT_HGR_WARE_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'hgrWareNm', header: t('MSG_TXT_HGR_WARE_NM'), width: '280' },
    { fieldName: 'adrNm', header: t('MSG_TXT_ADDR'), width: '280', styleName: 'text-left' },
    { fieldName: 'adrUseYn', header: t('MSG_TXT_USE_EYN'), options: codes.USE_YN, width: '100', styleName: 'text-center' },
    { fieldName: 'dsnBldNm', header: t('MSG_TXT_BLD_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'didyDvCd', header: t('MSG_TXT_DIDY_DV'), options: codes.DIDY_DV_CD, width: '100', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '150', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout([
    'wareDvCd',
    'wareDtlDvCd',
    'wareUseYn',
    'wareCd',
    'wareNo',
    'wareNm',
    'wareMngtPrtnrNo',
    'wareStocMgr',
    {
      header: t('MSG_TXT_HGR_WARE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['hgrWare', 'hgrWareNo', 'hgrWareNm', 'adrNm'],
    },
    {
      header: t('MSG_TXT_DSN_ADR'),
      direction: 'horizontal',
      items: ['adrUseYn', 'dsnBldNm', 'bldCd'],
    },
    'ogCd', 'bldNm',
  ]);

  view.rowIndicator.visible = true;
  // eslint-disable-next-line no-unused-vars
  view.onCellDblClicked = (grid, clickData) => {
    const currentDataRow = view.getCurrent().dataRow;
    const rowData = gridUtil.getRowValue(view, currentDataRow);

    const { apyYm, wareNo } = rowData;
    onClickWareOgCrdovr(apyYm, wareNo);
  };
});

</script>

<style scoped>
</style>
