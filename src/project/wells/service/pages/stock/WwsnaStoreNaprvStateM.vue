<!--
 ***************************************************************************************************
 * 프로그램 개요
 ***************************************************************************************************
 1. 모듈 : 입고 미승인 현황
 2. 프로그램 ID : K-W-SV-U-0126M01
 3. 작성자 : heymi.cho
 4. 작성일 : 2023.06.09
 ***************************************************************************************************
 * 프로그램 설명
 ***************************************************************************************************
 - 입고 미승인 현황 (http://localhost:3000/#/service/wwsna-store-naprv-state)
 ***************************************************************************************************
-->

<template>
  <kw-page>
    <kw-search
      one-row
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.stStartYm"
          v-model:end-ym="searchParams.stEndYm"
          v-model:options-ware-dv-cd="strWareDvCd"
          v-model:ware-dv-cd="searchParams.strWareDvCd"
          v-model:ware-no-m="searchParams.strWareNoM"
          v-model:ware-no-d="searchParams.strWareNoD"
          sub-first-option="all"
          :colspan="4"
          :label1="$t('MSG_TXT_OSTR_PTRM')"
          :label2="$t('MSG_TXT_STR_WARE')"
          :label3="$t('MSG_TXT_WARE')"
          :label4="$t('MSG_TXT_WARE')"
        />
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
      </kw-action-top>
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
import { codeUtil, getComponentType, gridUtil, useDataService, defineGrid, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';

const { t } = useI18n();
const now = dayjs();
const { modal } = useGlobal();
const { getters } = useStore();
const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;
const { ogTpCd } = getters['meta/getUserInfo'];

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'STR_TP_CD',
  'WARE_DV_CD',
);

/*
 *  Select Setting - 입고창고
 */
let userWareDvCd = codes.WARE_DV_CD;
if (ogTpCd === 'W01') {
  userWareDvCd = codes.WARE_DV_CD.filter((v) => v.codeId === '2');
} else if (ogTpCd === 'W06') {
  userWareDvCd = codes.WARE_DV_CD.filter((v) => v.codeId === '3');
}
const strWareDvCd = { WARE_DV_CD: userWareDvCd };

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
  strWareNo: '',
  itmPdCd: '',
  stStartYm: now.set('date', 1).format('YYYYMMDD'),
  stEndYm: now.format('YYYYMMDD'),
  strWareDvCd: '',
  strWareNoM: '',
  strWareNoD: '',
});

async function fetchData() {
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/store-not-approve/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  view.resetCurrent();
  await gridUtil.reset(view);
}

/*
 *  Search - 조회
 */
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/store-not-approve/excel-download', { params: searchParams.value });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'wareNm' },
    { fieldName: 'strWareNo' },
    { fieldName: 'pdNm' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'naprvQty' },
  ];

  const columns = [
    { fieldName: 'wareNm', header: t('MSG_TXT_WARE_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'strWareNo', header: t('MSG_TXT_WARE_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_MATI_NM'), width: '400', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_MATI_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'naprvQty', header: t('MSG_TXT_UNAPPR') + t('MSG_TXT_QTY'), width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;

  // dbclick row
  view.onCellDblClicked = async (grid, clickData) => {
    if (isEmpty(grid.getValue(clickData.itemIndex, 'strWareNo')) || isEmpty(grid.getValue(clickData.itemIndex, 'itmPdCd'))) {
      return;
    }

    const { result } = await modal({
      component: 'WwsnaStoreNaprvStateDtlP',
      componentProps: { strWareNo: grid.getValue(clickData.itemIndex, 'strWareNo'), itmPdCd: grid.getValue(clickData.itemIndex, 'itmPdCd') },
    });

    if (result) await fetchData();
  };
});

</script>
