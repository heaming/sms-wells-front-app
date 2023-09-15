<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaAgencyLocaraFilterGiveAOrderPsListM - 대리점 지역별 필터발주 현황(K-W-SV-U-0148M01)
3. 작성자 : jungheejin
4. 작성일 : 2023-09-11
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 대리점 지역별 필터발주 현황 http://localhost:3000/#/service/wwsna-agency-locara-filter-give-a-order-ps-list
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_BASE_YM')">
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="date_range_months:1"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_DV')"
        >
          <kw-select
            v-model="searchParams.bfsvcBzsDvCd"
            :options="codes.BFSVC_BZS_DV_CD.filter((code) => ['1', '2'].includes(code.codeId))"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ $t('MSG_TXT_FILT_GO_PS') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
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
        :total-count="totalCount"
        @init="initGrdMain"
      />
      <h3>{{ $t('MSG_TXT_DTL_PS') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData2"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload2"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef2"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain2"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData2"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const router = useRouter();
const { currentRoute } = useRouter();
const { t } = useI18n();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/agency-locara-filter-give-a-order-ps';

const codes = await codeUtil.getMultiCodes(
  'BFSVC_BZS_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);
const searchParams = ref({
  startDt: now.format('YYYYMM'),
  endDt: now.format('YYYYMM'),
  bfsvcBzsDvCd: '2',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

const totalCount = ref(0);

let cachedParams;

async function fetchData1() {
  const res = await dataService.get(`${baseUrl}/agrg`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function fetchData2() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: result, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef2.value.getView();
  view.getDataSource().setRows(result);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await Promise.all([
    fetchData1(),
    fetchData2(),
  ]);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}
async function onClickExcelDownload2() {
  const view = grdMainRef2.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

// 필터발주 현황
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'yymm', header: t('MSG_TXT_YM'), width: '80', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'locaraDvNm', header: t('MSG_TXT_LOCARA'), width: '80', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CORP_NAME'), width: '80', styleName: 'text-center' },
    { fieldName: 'filtNm', header: t('MSG_TXT_FLTR_NM'), width: '200', styleName: 'text-left' },
    {
      fieldName: 'sumPartUseQty',
      header: t('MSG_TXT_SUM'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.groupBy(['yymm', 'locaraDvNm', 'cstKnm']);
  view.rowGroup.expandedAdornments = 'none';
  view.setRowGroup({ mergeMode: true });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// 필터발주 상세현황
const initGrdMain2 = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'yymm', header: t('MSG_TXT_YM'), width: '80', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CORP_NAME'), width: '140', styleName: 'text-left' },
    { fieldName: 'cntrSn', visible: false },
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      renderer: { type: 'button' },
      styleName: 'text-center rg-button-link',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '170', styleName: 'text-center' },
    { fieldName: 'partPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '170', styleName: 'text-left' },
    { fieldName: 'filtNm', header: t('MSG_TXT_FLTR_NM'), width: '230', styleName: 'text-left' },
    { fieldName: 'tn', header: t('MSG_TXT_GO_TN'), width: '80', styleName: 'text-center' },
    { fieldName: 'locaraTno', visible: false }, // [전화번호1]
    { fieldName: 'exnoEncr', visible: false }, // [전화번호2]
    {
      fieldName: 'idvTno', // [전화번호3]
      header: t('MSG_TXT_INST_TNO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        // 휴대전화번호 3-4-4 형식으로 표시
        if (!isEmpty(value) && value.length === 4) {
          const values = grid.getValues(index.itemIndex);
          return `${values.locaraTno}-${values.exnoEncr}-${value}`;
        }
      },
    },
    { fieldName: 'cralLocaraTno', visible: false }, // [휴대전화번호1]
    { fieldName: 'mexnoEncr', visible: false }, // [휴대전화번호2]
    { fieldName: 'cralIdvTno', // [휴대전화번호3]
      header: t('MSG_TXT_PHONE'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        // 휴대전화번호 3-4-4 형식으로 표시
        if (!isEmpty(value) && value.length === 4) {
          const values = grid.getValues(index.itemIndex);
          return `${values.cralLocaraTno}-${values.mexnoEncr}-${value}`;
        }
      },
    }, // [휴대전화번호]
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '80', styleName: 'text-center' },
    {
      fieldName: 'rnadr',
      header: t('MSG_TXT_INST_ADDR'),
      width: '200',
      styleName: 'text-left',
      displayCallback(grid, index) {
        const { rnadr, rdadr } = grid.getValues(index.itemIndex);
        if (!isEmpty(rnadr)) {
          return `${rnadr}, ${rdadr}`;
        }
      },
    },
    { fieldName: 'rdadr', visible: false },
    {
      fieldName: 'sppBasAdr',
      header: t('MSG_TXT_DEL_ADDR'),
      width: '200',
      styleName: 'text-left',
      displayCallback(grid, index) {
        const { sppBasAdr, sppDtlAdr } = grid.getValues(index.itemIndex);
        if (!isEmpty(sppBasAdr)) {
          return `${sppBasAdr}, ${sppDtlAdr}`;
        }
      },
    },
    { fieldName: 'sppDtlAdr', visible: false },
    { fieldName: 'locaraDvNm', header: t('MSG_TXT_LOCARA'), width: '120', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellItemClicked = async (grid, { column, itemIndex }) => {
    if (column === 'cntrNo') {
      const cntrNo = grid.getValue(itemIndex, 'cntrNo');
      const cntrSn = grid.getValue(itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
});
</script>
