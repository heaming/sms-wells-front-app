<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CMA
2. 프로그램 ID : WwsnaMovementStoreMgtM - 이동입고 관리(W-SV-U-0132M01)
3. 작성자 : inho.choi
4. 작성일 : 2023.03.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
자재 입고를 확인 하고 입고 확정을 처리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 입고창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_WARE')"
        >
          <kw-select
            v-model="searchParams.strOjWareNo"
            :options="codes.WARE_HOUSE"
          />
        </kw-search-item>

        <!-- 접수유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_RCP_TP')"
        >
          <kw-select
            v-model="searchParams.strTpCd"
            :options="codes.OSTR_TP_CD"
            first-option="all"
          />
        </kw-search-item>

        <!-- 출고기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_PTRM')"
          :colspan="2"
        >
          <!-- if essential case please add "required" -->
          <kw-date-range-picker
            v-model:from="searchParams.stStrDt"
            v-model:to="searchParams.edStrDt"
            rules="date_range_months:1"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 창고구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_WARE_DV')"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="codes.WARE_DV_CD"
            first-option="all"
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
// import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { modal, notify } = useGlobal();
const { getConfig } = useMeta();
const { t } = useI18n();

const dataService = useDataService();
const baseURI = '/sms/wells/service/movement-stores';
const wareURI = '/sms/wells/service/out-of-storage-asks/warehouses';
const grdMainRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = ref(await codeUtil.getMultiCodes(
  'WARE_DV_CD',
  'OSTR_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'COD_YN',
));

codes.value.OSTR_TP_CD = codes.value.OSTR_TP_CD.filter(
  ({ codeId }) => ['221', '222', '223', '261', '262'].includes(codeId),
);

let cachedParams;
console.log(dayjs().format('YYYYMMDD'));

const searchParams = ref({
  baseYm: '',
  wareDvCd: '2',
  strOjWareNo: '',
  strTpCd: '',
  stStrDt: '',
  edStrDt: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

searchParams.value.baseYm = dayjs().format('YYYYMM');
searchParams.value.stStrDt = dayjs().format('YYYYMMDD');
searchParams.value.edStrDt = dayjs().format('YYYYMMDD');

async function fetchData() {
  const res = await dataService.get(baseURI, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.resetCurrent();
}

async function fetchDefaultData() {
  const res = await dataService.get(wareURI, { params: { apyYm: searchParams.value.baseYm } });
  codes.value.WARE_HOUSE = res.data.map((v) => ({ codeId: v.codeId, codeName: v.codeName }));
  searchParams.value.strOjWareNo = codes.value.WARE_HOUSE[0].codeId;
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseURI}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'movementStoreMgtM',
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  await fetchDefaultData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ostrDt', header: t('MSG_TXT_OSTR_DT'), width: '150', styleName: 'text-center' },
    { fieldName: 'ostrTp', header: t('MSG_TXT_OSTR_TP'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmOstrNo', header: t('MSG_TXT_OSTR_MNGT_NO'), width: '250', styleName: 'text-center' },
    { fieldName: 'wareNm', header: t('MSG_TXT_OSTR_WARE'), width: '150', styleName: 'text-left' },
    { fieldName: 'pdNm', header: t('MSG_TXT_OSTR_ITM'), width: '250', styleName: 'text-left' },
    { fieldName: 'strNoteButn',
      header: t('MSG_TXT_NOTE'),
      width: '145',
      styleName: 'text-center',
      renderer: { tyep: 'button' },
      displayCallback: () => t('MSG_TXT_NOTE'),
    },
  ];
  const fields = columns.map((v) => ({ fieldName: v.fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellClick = async (e, v) => {
    if (v.column === 'strNoteButn') {
      const { result: isChanged } = await modal({
        component: 'WwsnaTransferStoreRegP',
      });

      if (isChanged) {
        notify(t('MSG_ALT_SAVE_DATA'));
        await fetchData();
      }
    }
  };
});

</script>
<style scoped>
</style>
