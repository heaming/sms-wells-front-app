<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
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
            v-model="searchParams.strWareNo"
            :options="warehouses"
          />
        </kw-search-item>

        <!-- 접수유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_RCP_TP')"
        >
          <kw-select
            v-model="searchParams.ostrTpCd"
            :options="filterCodes.filterStrTpCd"
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
            v-model:from="searchParams.stOstrDt"
            v-model:to="searchParams.edOstrDt"
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
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="pageInfo.pageSize"
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

const { getConfig } = useMeta();
const { modal, notify } = useGlobal();
const { t } = useI18n();

const dataService = useDataService();
const baseURI = '/sms/wells/service/movement-stores/management';
const excelURI = `${baseURI} + /excel-download`;
const wareURI = '/sms/wells/service/out-of-storage-asks/warehouses';
const grdMainRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const codes = await codeUtil.getMultiCodes(
  'WARE_DV_CD',
  'OSTR_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

// 입고상세구분 필터링
const filterCodes = ref({
  filterOstrTpCd: [],
});

filterCodes.value.filterOstrTpCd = codes.OSTR_TP_CD.filter((v) => ['221', '222', '223', '261', '262'].includes(v.codeId));

let cachedParams;
const totalCount = ref(0);

const searchParams = ref({
  baseYm: '',
  wareDvCd: '2',
  strWareNo: '',
  strTpCd: '',
  stOstrDt: '',
  edOstrDt: '',
});

searchParams.value.baseYm = dayjs().format('YYYYMM');
searchParams.value.stOstrDt = dayjs().format('YYYYMMDD');
searchParams.value.edOstrDt = dayjs().format('YYYYMMDD');

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get(baseURI, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.resetCurrent();
}

const warehouses = ref();
async function fetchDefaultData() {
  const res = await dataService.get(wareURI, { params: { apyYm: searchParams.value.baseYm } });
  warehouses.value = res.data;
  searchParams.value.strWareNo = warehouses.value[0].codeId;
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(excelURI, { params: cachedParams });
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
    { fieldName: 'ostrDt', header: t('MSG_TXT_OSTR_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'ostrTpCd', header: t('MSG_TXT_OSTR_TP'), width: '150', options: codes.OSTR_TP_CD, styleName: 'text-center' },
    { fieldName: 'itmOstrNo',
      header: t('MSG_TXT_OSTR_MNGT_NO'),
      width: '250',
      styleName: 'text-center',
      displayCallback: (g, i, v) => {
        const regExp = /^(\d{3})(\d{8})(\d{7}).*/;
        return v.replace(regExp, '$1-$2-$3');
      } },
    { fieldName: 'ostrWareNm', header: t('MSG_TXT_OSTR_WARE'), width: '150', styleName: 'text-left' },
    { fieldName: 'pdNm', header: t('MSG_TXT_OSTR_ITM'), width: '250', styleName: 'text-left' },
    { fieldName: 'itmStrNo',
      header: t('MSG_TXT_NOTE'),
      width: '145',
      styleName: 'text-center',
      renderer: { type: 'button' },
      displayCallback: () => t('MSG_BTN_STR_RGST'),
    },
    { fieldName: 'strWareNo', header: t('MSG_TXT_STR_WARE'), width: '0', styleName: 'text-left', visible: false },
    { fieldName: 'ostrWareNo', header: t('MSG_TXT_OSTR_WARE'), width: '0', styleName: 'text-left', visible: false },
    { fieldName: 'strHopDt', header: t('MSG_TXT_OSTR_WARE'), width: '0', styleName: 'text-left', visible: false },
    { fieldName: 'strWareNm', header: t('MSG_TXT_STR_WARE'), width: '0', styleName: 'text-left', visible: false },
  ];
  const fields = columns.map((v) => ({ fieldName: v.fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellClicked = async (g, { column, dataRow }, v) => {
    const {
      ostrDt,
      ostrTpCd,
      itmOstrNo,
      itmStrNo,
      strWareNo,
      ostrWareNo,
      strWareNm,
      ostrWareNm,
      strHopDt,
    } = gridUtil.getRowValue(g, dataRow);
    console.log(g, column, dataRow, v);
    // WwsnaTransferStoreRgstMgtP
    if (column === 'itmStrNo') {
      const { result: isChanged } = await modal({
        component: 'WwsnaMovementStoreRegP',
        componentProps: {
          ostrDt,
          ostrTpCd,
          ostrTpNm: codes.OSTR_TP_CD.find((atr) => atr.codeId === ostrTpCd).codeName,
          itmOstrNo,
          itmStrNo,
          strWareNo,
          ostrWareNo,
          strWareNm,
          ostrWareNm,
          strHopDt,
        },
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
