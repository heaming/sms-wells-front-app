<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNB (방문관리)
 2. 프로그램 ID : WwsnbByProductServiceProcsAgrgPsListM - 상품별 서비스 처리 집계 현황
 3. 작성자 : hyewon.kim
 4. 작성일 : 2022.12.30
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 상품별 서비스 처리 집계 현황 (http://localhost:3000/#/service/wwsnb-by-product-service-procs-agrg-ps-list)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 서비스센터 -->
        <kw-search-item :label="$t('MSG_TXT_SV_CNR')">
          <kw-select
            v-model="searchParams.ogId"
            :options="serviceCenters"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
          />
        </kw-search-item>

        <!-- 처리일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRCSDT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.wkExcnDtFrom"
            v-model:to="searchParams.wkExcnDtTo"
            rules="date_range_required"
            :label="$t('MSG_TXT_PRCSDT')"
          />
        </kw-search-item>

        <!-- 유/무상 구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_RECAP_FRISU_DV')"
        >
          <kw-select
            v-model="searchParams.refriDvCd"
            first-option="all"
            :options="codes.REFRI_DV_CD"
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
      </kw-action-top>

      <ul class="filter-box">
        <li class="filter-box__item">
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_PDGRP') }}
          </p>
          <kw-select
            v-model="searchParams.pdGrpCd"
            dense
            first-option="all"
            :options="codes.PD_GRP_CD"
            @update:model-value="onUpdateProductGroupCode"
          />
        </li>
      </ul>

      <kw-grid
        ref="grdMainRef"
        class="mt12"
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
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { currentRoute } = useRouter();
const dataService = useDataService();

const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const searchParams = ref({
  ogId: '',
  wkExcnDtFrom: dayjs().format('YYYYMM').concat('01'),
  wkExcnDtTo: dayjs().format('YYYYMMDD'),
  refriDvCd: '',
  pdGrpCd: '',
});
let cachedParams = cloneDeep(searchParams.value);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'REFRI_DV_CD',
  'PD_GRP_CD',
);

const { data: serviceCenters } = await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } });
const filters = codes.PD_GRP_CD.map((v) => ({ name: v.codeId, criteria: `value = '${v.codeId}'` }));

function onUpdateProductGroupCode(val) {
  const view = grdMainRef.value.getView();
  view.activateAllColumnFilters('svpdItemGr', false);

  // if (val === '') {
  //   pageInfo.value.totalCount = view.getItemCount();
  //   return;
  // }

  view.activateColumnFilters('svpdItemGr', [val], true);
  // pageInfo.value.totalCount = view.getItemCount(); // 상품군에 따른 총건수 필터링
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-visit-state/product-services/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: services, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(services);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);

  searchParams.value.pdGrpCd = '';

  view.autoFiltersRefresh('svpdItemGr', false);
  view.setColumnFilters('svpdItemGr', filters, true);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/as-visit-state/product-services/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'cntt', dataType: 'number' },
    { fieldName: 'svpdItemGr' },
    { fieldName: 'cnt1110', dataType: 'number' },
    { fieldName: 'cnt1111', dataType: 'number' },
    { fieldName: 'cnt1122', dataType: 'number' },
    { fieldName: 'cnt1121', dataType: 'number' },
    { fieldName: 'cnt1124', dataType: 'number' },
    { fieldName: 'cnt1123', dataType: 'number' },
    { fieldName: 'cnt1125', dataType: 'number' },
    { fieldName: 'cnt1100', dataType: 'number' },
    { fieldName: 'cnt3420', dataType: 'number' },
    { fieldName: 'cnt3410', dataType: 'number' },
    { fieldName: 'cnt3310', dataType: 'number' },
    { fieldName: 'cnt3320', dataType: 'number' },
    { fieldName: 'cnt3210', dataType: 'number' },
    { fieldName: 'cnt3230', dataType: 'number' },
    { fieldName: 'cnt3110', dataType: 'number' },
    { fieldName: 'cnt3112', dataType: 'number' },
    { fieldName: 'cnt3121', dataType: 'number' },
    { fieldName: 'cnt3122', dataType: 'number' },
    { fieldName: 'cnt3130', dataType: 'number' },
    { fieldName: 'cnt3460', dataType: 'number' },
    { fieldName: 'cnt3440', dataType: 'number' },
    { fieldName: 'cnt3199', dataType: 'number' },
    { fieldName: 'cnt3100', dataType: 'number' },
    { fieldName: 'cnt1390', dataType: 'number' },
    { fieldName: 'cnt2100', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '170', styleName: 'text-center', footer: { text: t('MSG_TXT_SUM') } },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '140', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200' },
    { fieldName: 'cntt', header: t('MSG_TXT_TOT_SUM'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'svpdItemGr', header: t('MSG_TXT_PD_DV_CD'), width: '50', visible: false, autoFilter: false },
    { fieldName: 'cnt1110', header: t('MSG_TXT_NW_IST'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt1111', header: t('MSG_TXT_IST_REQD'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt1122', header: t('MSG_TXT_MYCO_NCLT'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt1121', header: t('MSG_TXT_MYCO_CLN'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt1124', header: t('MSG_TXT_OCO_NCLT'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt1123', header: t('MSG_TXT_OCO_CLN'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt1125', header: t('MSG_TXT_MYCO_SEP'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt1100', header: t('MSG_TXT_SBSUM'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3420', header: t('MSG_TXT_SL_CAN'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3410', header: t('MSG_TXT_PD_CAN'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3310', header: t('MSG_TXT_RELO_SEP'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3320', header: t('MSG_TXT_RELO_REIST'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3210', header: t('MSG_TXT_PDCT_CAUS'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3230', header: t('MSG_TXT_CST_CAUS'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3110', header: t('MSG_TXT_PDCT_AS'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3112', header: t('MSG_TXT_SPC_AS'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3121', header: t('MSG_TXT_FILT_BFSVC'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3122', header: t('MSG_TXT_FILT_VST_SELL'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3130', header: t('MSG_TXT_ENVR_CHK'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3460', header: t('MSG_TXT_PCSV_RTNGD'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3440', header: t('MSG_TXT_CO_IST'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3199', header: t('MSG_TXT_ETC'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt3100', header: t('MSG_TXT_SBSUM'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt1390', header: t('MSG_TXT_SBSUM'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
    { fieldName: 'cnt2100', header: t('MSG_TXT_SBSUM'), width: '96', styleName: 'text-right', footer: { text: t('MSG_TXT_SUM'), expression: 'sum' } },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout([
    {
      header: t('MSG_TXT_DIV'), // 구분
      direction: 'horizontal',
      items: [{ column: 'sapMatCd', footerUserSpans: [{ colspan: 3 }] }, 'pdCd', 'pdNm', 'svpdItemGr'],
    },
    'cntt',
    {
      header: t('MSG_TXT_INSTALLATION'), // 설치
      direction: 'horizontal',
      items: ['cnt1110', 'cnt1111', 'cnt1122', 'cnt1121', 'cnt1124', 'cnt1123', 'cnt1125', 'cnt1100'],
    },
    {
      header: t('MSG_TXT_AFTER_SERVICE'), // A/S
      direction: 'horizontal',
      items: ['cnt3420', 'cnt3410', 'cnt3310', 'cnt3320', 'cnt3210', 'cnt3230', 'cnt3110', 'cnt3112', 'cnt3121', 'cnt3122', 'cnt3130', 'cnt3460', 'cnt3440', 'cnt3199', 'cnt3100'],
    },
    {
      header: t('MSG_TXT_FILT_SELL_BFSVC'), // 필터판매 B/S
      direction: 'horizontal',
      items: ['cnt1390', 'cnt2100'],
    },
  ]);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setFixedOptions({ colCount: 2 });
  view.setFooters({ visible: true, items: [{ height: 42 }] });
  view.filteringOptions.enabled = false;
});
</script>
