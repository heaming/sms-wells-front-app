<!--
 ***************************************************************************************************
 * 프로그램 개요
 ***************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : W-SV-U-0138M01 - 창고조직 관리
 3. 작성자 : gs.piit58/송태성
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
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_WARE_DV')">
          <kw-select
            v-model="searchParams.wareDv"
            :options="codes.WARE_DV_CD"
            first-option="all"
            first-option-label="전체"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_WARE_LOCARA')">
          <kw-select
            v-model="searchParams.wareLocaraCd"
            :options="codes.ADM_ZN_CLSF_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_USE_YN')">
          <kw-select
            v-model="searchParams.codeUseYn"
            :options="codes.COD_YN"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_EPNO')">
          <kw-input
            v-model="searchParams.epNo"
            type="text"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>

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
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          secondary
          dense
          :label="$t('MSG_BTN_WARE_INF_RGST')"
          class="mr8"
          @click="onClickWareOgCrdovr"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useMeta, codeUtil, useGlobal, useDataService, getComponentType, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();

const { getConfig } = useMeta();
const { modal, alert, notify, confirm } = useGlobal();
// const store = useStore();

const emit = defineEmits([
  'reloadPages',
]);

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'WARE_DV_CD',
  'COD_YN',
  'ADM_ZN_CLSF_CD',
);

let cachedParams;
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'), // 기준년월
  wareDv: '',
  codeUseYn: '',
  wareLocaraCd: '', // 창고지역코드
  epNo: '',
});

const totalCount = ref(0);

// const carriedParams = ref({
//   baseYm: dayjs().format('YYYYMM'), // 기준년월
//   userId: store.getters['meta/getUserInfo'].userName,
// });

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function onClickCarriedOver() {
  const res = await dataService.get('/sms/wells/service/warehouse-og/carried-over', { params: { baseYm: searchParams.value.baseYm } });

  console.log(res);
  console.log(res.data);

  if (res.data > 0) {
    await alert(t('MSG_ALT_CRDOVR_WARE_INFO', [res.data]));
    return;
  }

  console.log(searchParams.value.baseYm);

  if (await confirm(t('MSG_ALT_IS_SAV_DATA'))) {
    await dataService.post('/sms/wells/service/warehouse-og', { baseYm: searchParams.value.baseYm });
    await notify(t('MSG_ALT_CRDOVR_WK_FSH'));
    emit('reloadPages');
  }
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/warehouse-og', { params: cachedParams });
  const wareOg = res.data;
  totalCount.value = wareOg.length;
  console.log(res);
  console.log(wareOg);

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(wareOg);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickWareOgCrdovr() {
  debugger;
  const view = grdMainRef.value.getView();
  const currentDataRow = view.getCurrent().dataRow;
  const rowData = gridUtil.getRowValue(view, currentDataRow);
  const today = dayjs().format('YYYYMM');

  if (rowData.apyYm >= today) {
    const { result: isChanged } = await modal({
      component: 'WwsnaWarehouseOrganizationRegP',
    });

    if (isChanged) {
      notify(t('MSG_ALT_SAVE_DATA'));
      await fetchData();
    }
  } else {
    await alert(t('MSG_ALT_THM_BF_WAREINF_MDFC_IMP'));
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

function initGrid(data, view) {
  const fields = [
    { fieldName: 'wareDvCd' },
    { fieldName: 'wareCd' },
    { fieldName: 'wareNo' },
    { fieldName: 'wareNm' },
    { fieldName: 'wareMngtPrtnrNo' },
    { fieldName: 'wareMngtPrtnrNm' },
    { fieldName: 'hgrWare' },
    { fieldName: 'hgrWareNo' },
    { fieldName: 'hgrWareNm' },
    { fieldName: 'wareUseYn' },
    { fieldName: 'didyDvCd' },
    { fieldName: 'wareAdrId' },
    { fieldName: 'ogCd' },
    { fieldName: 'bldNm' },
    { fieldName: 'apyYm' },
  ];

  const columns = [
    { fieldName: 'wareDvCd', header: t('MSG_TXT_WARE_DV'), options: codes.WARE_DV_CD, width: '120', styleName: 'text-center' },
    { fieldName: 'wareCd', header: t('MSG_TXT_WARE_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'wareNo', header: t('MSG_TXT_WARE_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'wareNm', header: t('MSG_TXT_WARE_NM'), width: '280' },
    { fieldName: 'wareMngtPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'wareMngtPrtnrNm', header: t('MSG_TXT_ADMIN'), width: '170' },
    { fieldName: 'hgrWare', header: t('MSG_TXT_HGR_WARE'), width: '100', styleName: 'text-center' },
    { fieldName: 'hgrWareNo', header: t('MSG_TXT_HGR_WARE_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'hgrWareNm', header: t('MSG_TXT_HGR_WARE_NM'), width: '280' },
    { fieldName: 'wareUseYn', header: t('MSG_TXT_USE_EYN'), options: codes.COD_YN, width: '100', styleName: 'text-center' },
    { fieldName: 'didyDvCd', header: t('MSG_TXT_DIDY_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'wareAdrId', header: t('MSG_TXT_ADDR'), width: '280', styleName: 'text-left' },
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-center' },
  ];

  const columnLayout = [
    'wareDvCd',
    'wareCd',
    'wareNo',
    'wareNm',
    'wareMngtPrtnrNo',
    'wareMngtPrtnrNm',
    'hgrWare',
    'hgrWareNo',
    'hgrWareNm',
    'wareUseYn',
    'didyDvCd',
    'wareAdrId',
    'ogCd',
    'bldNm',
  ];

  view.setColumnLayout(columnLayout);

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.setCheckableCallback(() => false);
  view.oncellEdited = (grid, itemIndex) => {
    grid.checkItem(itemIndex, true);
  };

  // eslint-disable-next-line no-unused-vars
  view.onCellDblClicked = (grid, clickData) => {
    onClickWareOgCrdovr();
  };
}

</script>

<style scoped>
</style>
