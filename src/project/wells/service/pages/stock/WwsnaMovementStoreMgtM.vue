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
            v-model="searchParams.strOjWareNo"
            :options="warehouses"
          />
        </kw-search-item>

        <!-- 접수유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_RCP_TP')"
        >
          <kw-select
            v-model="searchParams.strTpCd"
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

        <!-- <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        /> -->
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
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const { getConfig } = useMeta();
const { modal, notify } = useGlobal();
const { t } = useI18n();

const dataService = useDataService();
const baseURI = '/sms/wells/service/movement-stores/management';
const excelURI = `${baseURI}/excel-download`;
const grdMainRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// 로그인한 사용자의 창고정보 조회
const { getMonthWarehouse } = useSnCode();

const codes = await codeUtil.getMultiCodes(
  'WARE_DV_CD',
  'STR_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

// 입고상세구분 필터링
const filterCodes = ref({
  filterStrTpCd: [],
});

filterCodes.value.filterStrTpCd = codes.STR_TP_CD.filter((v) => ['121', '122', '123', '162', '161'].includes(v.codeId));

let cachedParams;
// const totalCount = ref(0);

const wharehouseParams = ref({
  apyYm: dayjs().format('YYYYMM'),
  userId: '36680', // TODO: USER_ID로 정리되어야함(임시로 사용)
});

const searchParams = ref({
  baseYm: '',
  wareDvCd: '2',
  strOjWareNo: '',
  strTpCd: '',
  stStrDt: '',
  edStrDt: '',
});

searchParams.value.baseYm = dayjs().format('YYYYMM');
searchParams.value.stStrDt = dayjs().format('YYYYMMDD');
searchParams.value.edStrDt = dayjs().format('YYYYMMDD');

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
  const { userId, apyYm } = wharehouseParams.value;

  warehouses.value = await getMonthWarehouse(userId, apyYm);
  searchParams.value.strOjWareNo = warehouses.value[0].codeId;
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
    { fieldName: 'strRgstDt', header: t('MSG_TXT_STR_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'strTpCd', header: t('MSG_TXT_STR_TP'), width: '150', options: codes.STR_TP_CD, styleName: 'text-center' },
    { fieldName: 'itmStrNo',
      header: t('MSG_TXT_STR_MNGT_NO'),
      width: '250',
      styleName: 'text-center',
      displayCallback: (g, i, v) => {
        const regExp = /^(\d{3})(\d{8})(\d{7}).*/;
        return v.replace(regExp, '$1-$2-$3');
      } },
    { fieldName: 'wareNm', header: t('MSG_TXT_STR_WARE'), width: '150', styleName: 'text-left' },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_STR_ITM'), width: '250', styleName: 'text-left' },
    { fieldName: 'strSn',
      header: t('MSG_TXT_NOTE'),
      width: '145',
      styleName: 'text-center',
      renderer: { type: 'button' },
      displayCallback: () => t('MSG_BTN_STR_RGST'),
    },
  ];

  const gridField = columns.map((v) => ({ fieldName: v.fieldName }));
  const fields = [...gridField,
    { fieldName: 'strWareNo' },
    { fieldName: 'itmPdNo' },
    { fieldName: 'ostrWareNo' },
    { fieldName: 'ostrWareNm' }];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const {
      strRgstDt,
      strTpCd,
      itmStrNo,
      strWareNo,
      wareNm,
      itmPdNo,
      itmPdNm,
      ostrWareNo,
      ostrWareNm,
    } = gridUtil.getRowValue(g, dataRow);
    console.log(g, column, dataRow);

    const { result: isChanged } = await modal({
      component: 'WwsnaMovementStoreRegP',
      componentProps: {
        strRgstDt,
        strTpCd,
        strTpNm: codes.STR_TP_CD.find((atr) => atr.codeId === strTpCd).codeName,
        itmStrNo,
        strWareNo,
        strWareNm: wareNm,
        ostrWareNo,
        ostrWareNm,
        itmPdNo,
        itmPdNm,
        strHopDt: '',
        flagChk: 0,
      },
    });

    if (isChanged) {
      notify(t('MSG_ALT_SAVE_DATA'));
      await fetchData();
    }
  };
});

</script>
<style scoped>
</style>
