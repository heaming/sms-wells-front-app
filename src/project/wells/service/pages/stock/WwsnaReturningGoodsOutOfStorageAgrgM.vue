<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaReturningGoodsOutOfStorageAgrgM - 반품출고 집계
 3. 작성자 : heymi.cho
 4. 작성일 : 2023.06.27
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 반품출고 집계 (http://localhost:3000/#/service/wwsna-returning-goods-out-of-storages-agrg)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CONF_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDate"
            v-model:to="searchParams.endDate"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SV_CNR')"
        >
          <kw-select
            v-model="searchParams.svCnrCd"
            :options="codes.SV_CNR_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RTNGD_PROCS_TP')"
        >
          <kw-select
            v-model="searchParams.rtngdProcsTpCd"
            :options="codes.RTNGD_PROCS_TP_CD"
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
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
        />
        <kw-btn
          icon="print"
          secondary
          dense
          :label="$t('MSG_TXT_RTNGD_OSTR')+$t('MSG_TXT_SLIP')+$t('MSG_BTN_PRINT')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickPrintSlipPopup"
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
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { currentRoute } = useRouter();
const { t } = useI18n();
const dataService = useDataService();
const now = dayjs();
const { modal } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SV_CNR_CD',
  'RTNGD_PROCS_TP_CD',
);

const searchParams = ref({
  startDate: `${now.format('YYYYMM')}01`,
  endDate: now.format('YYYYMMDD'),
  svCnrCd: '',
  rtngdProcsTpCd: '',
});

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/returning-goods-out-of-storages-agrg/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  view.resetCurrent();

  console.log(cachedParams);
  await gridUtil.reset(view);
}

/*
 *  Search - 조회
 */
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/service/returning-goods-out-of-storages-agrg/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

/*
 *  Event - 반품출고전표출력 팝업창
 */
async function onClickPrintSlipPopup() {
  console.log(codes.SV_CNR_CD);
  const { result } = await modal({
    component: 'WwsnaReturningGoodsOstrSlipPrintP',
    componentProps: {
      mgtStrNo: cachedParams.svCnrCd, // 관리창고
      rtngdProcsTpCd: cachedParams.rtngdProcsTpCd, // 반품처리유형
      startDate: cachedParams.startDate, // 확인일자 from
      endDate: cachedParams.endDate, // 확인일자 to
    },
  });

  if (result) {
    await fetchData();
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Gri
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    { name: 'pdClsfNm',
      fieldName: 'pdClsfNm',
      header: t('MSG_TXT_PD_GRP'),
      width: '190',
      styleName: 'text-center',
    },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '160', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '160', styleName: 'text-center' },
    { fieldName: 'pdNm',
      header: t('MSG_TXT_PRDT_NM'),
      width: '360',
      styleName: 'text-left',
      groupFooter: {
        text: t('MSG_TXT_SBSUM'),
      },
    },
    { fieldName: 'fnlESum',
      header: t('MSG_TXT_EGD'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    { fieldName: 'fnlRSum',
      header: t('MSG_TXT_RGD'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    { fieldName: 'fnlXSum',
      header: t('MSG_TXT_XGD'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.groupBy(['pdClsfNm']);
  view.setRowGroup({ mergeMode: true, expandedAdornments: 'footer', collapsedAdornments: 'footer' });

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});
</script>
