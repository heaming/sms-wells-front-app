<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaSeedingSowPlanListM(W-SV-U-0130M01) - 모종 파종 예정리스트 조회
 3. 작성자 : SaeRomI.Kim
 4. 작성일 : 2023.07.06
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 모종 파종 예정리스트 (http://localhost:3000/#/service/wwsna-seeding-sow-plan-list)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_VST_EXP_DT')"
          rules="required"
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_VST_EXP_DT')"
            :min-date="minDate"
            rules="required|date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <kw-input
            v-model="searchParams.cntrDtlNo"
            type="text"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
            rules="alpha_num|max:12"
            :placeholder="$t('MSG_TXT_CNTR_NO')"
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
            :page-size-options="optionPages"
            @change="fetchData"
          />
        </template>

        <kw-btn
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          icon="download_on"
          secondary
          dense
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

import { codeUtil, useMeta, useDataService, getComponentType, gridUtil, defineGrid, popupUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const now = dayjs();
const minDate = now.format('YYYY-MM-DD');

let cachedParams;
const searchParams = ref({
  strtDt: now.format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  cntrDtlNo: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const optionPages = await codeUtil.getCodes('COD_PAGE_SIZE_OPTIONS');

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/seeding-sow-plans/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;
  // fetch시에는 총 건수 조회하지 않도록 변경
  pagingResult.needTotalCount = false;
  pageInfo.value = pagingResult;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(list);
  }
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/seeding-sow-plans/excel-download', { params: cachedParams });

  gridUtil.exportView(view, {
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
    { fieldName: 'baseCntrDtlNo' },
    { fieldName: 'baseCstNm' },
    { fieldName: 'basePdNm' },
    { fieldName: 'connCntrDtlNo' },
    { fieldName: 'connSdingPkgNm' },
    { fieldName: 'connSdingPdNm' },
    { fieldName: 'connQty', dataType: 'number' },
    { fieldName: 'vstDueDt' },
    { fieldName: 'sowDt' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },

  ];

  const columns = [
    { fieldName: 'baseCntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true },
    { fieldName: 'baseCstNm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'basePdNm', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-left' },
    { fieldName: 'connCntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' },
    { fieldName: 'connSdingPkgNm', header: t('MSG_TXT_SDING_PKG'), width: '150', styleName: 'text-left' },
    { fieldName: 'connSdingPdNm', header: `${t('MSG_TXT_SDING')}${t('MSG_TXT_NM')}`, width: '100', styleName: 'text-left' },
    { fieldName: 'connQty', header: t('MSG_TXT_QTY'), width: '60', styleName: 'text-right' },
    { fieldName: 'vstDueDt', header: t('MSG_TXT_VST_EXP_DT'), width: '70', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'sowDt', header: t('MSG_TXT_SOW_DT'), width: '70', styleName: 'text-center', datetimeFormat: 'date' },
  ];

  // 헤더 부분 merge
  const layoutColumns = [
    {
      header: t('MSG_TXT_STND_PRDT'),
      direction: 'horizontal', // merge type
      items: ['baseCntrDtlNo', 'baseCstNm', 'basePdNm'],
    },
    {
      header: t('MSG_TXT_REL_PRDT'),
      direction: 'horizontal', // merge type
      items: ['connCntrDtlNo', 'connSdingPkgNm', 'connSdingPdNm', 'connQty'],
    },
    'vstDueDt', 'sowDt',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layoutColumns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'baseCntrDtlNo') {
      const cntrNo = g.getValue(itemIndex, 'cntrNo');
      const cntrSn = g.getValue(itemIndex, 'cntrSn');
      await popupUtil.open(`/popup#/service/wwsnb-individual-service-list?cntrNo=${cntrNo}&cntrSn=${cntrSn}`, { width: 2000, height: 1100 }, false);
    }
  };
});

</script>
