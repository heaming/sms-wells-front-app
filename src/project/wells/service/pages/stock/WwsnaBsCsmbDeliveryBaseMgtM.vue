<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA
 2. 프로그램 ID : WwsnaBsCsmbDeliveryBaseMgtM - BS소모품 배부기준 관리
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.04.03
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 신입/개인/빌딩 BS소모품 배부를 위한 지급기준을 관리하는 화면
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_MGT_YNM')">
          <kw-date-picker
            v-model="searchParams.mngtYm"
            type="month"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_GO_DV')">
          <kw-select
            v-model="searchParams.goDvCd"
            :options="codes.GO_DV_CD"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_ITM_NM')">
          <kw-select
            v-model="searchParams.itmKnms"
            :multiple="true"
            :options="itmKnms"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_ITM_CD')">
          <kw-input
            v-model="searchParams.csmbPdCdStrt"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.csmbPdCdEnd"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_SAP_CD')">
          <kw-input
            v-model="searchParams.sapMatCdStrt"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.sapMatCdEnd"
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
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-date-range-picker
          v-model:from="carriedOverParams.carriedOverFrom"
          v-model:to="carriedOverParams.carriedOverTo"
          class="w275"
          type="month"
        />
        <kw-btn
          v-permission:create
          dense
          secondary
          :label="$t('MSG_TXT_DDLV_BASE_CRDOVR')"
          @click="onClickDdlvBaseCrdovr"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          primary
          dense
          :label="$t('MSG_BTN_DDLV_BASE_INF_RGST')"
          @click="onClickDdlvBaseInfGrst"
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

import { useGlobal, getComponentType, useMeta, defineGrid, codeUtil, useDataService, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { currentRoute } = useRouter();
const { modal, confirm, alert, notify } = useGlobal();
const { getConfig } = useMeta();
const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const itmKnms = ref();
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'GO_DV_CD',
);

const searchParams = ref({
  mngtYm: dayjs().format('YYYYMM'),
  goDvCd: '',
  csmbPdCdStrt: '',
  csmbPdCdEnd: '',
  sapMatCdStrt: '',
  sapMatCdEnd: '',
  itmKnms: [],
});

const carriedOverParams = ref({
  carriedOverFrom: '',
  carriedOverTo: '',
});

async function fetchAllItems() {
  return await dataService.get('/sms/wells/service/delivery-bases/item-information');
}

async function getAllItems() {
  const res = await fetchAllItems();
  return res.data;
}

const items = (await getAllItems());

itmKnms.value = items.map((v) => ({ codeId: v.pdNm, codeName: v.pdNm }));

let cachedParams;

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/delivery-bases/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: bsCsmbDdlvBases, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(bsCsmbDdlvBases);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/delivery-bases', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickDdlvBaseCrdovr() {
  // if (!await confirm(t('MSG_ALT_DDLV_BASE_CRDOVR'))) { return; }
  if ((isEmpty(carriedOverParams.value.carriedOverFrom) || isEmpty(carriedOverParams.value.carriedOverTo))
      || (Number(carriedOverParams.value.carriedOverFrom) === Number(carriedOverParams.value.carriedOverTo))) {
    await alert('배부기준 이월대상 날짜를 확인해주세요.');
    return;
  }

  const fromYear = dayjs(carriedOverParams.value.carriedOverFrom).format('YYYY');
  const fromMonth = dayjs(carriedOverParams.value.carriedOverFrom).format('MM');
  const toYear = dayjs(carriedOverParams.value.carriedOverTo).format('YYYY');
  const toMonth = dayjs(carriedOverParams.value.carriedOverTo).format('MM');

  if (!await confirm(`${fromYear}년 ${fromMonth}월 배부기준 데이터를\n${toYear}년 ${toMonth}월로 이월하시겠습니까?`)) { return; }

  await dataService.post('/sms/wells/service/delivery-bases/next-month', carriedOverParams.value);
  await fetchData();
  notify('MSG_ALT_CRDOVR_WK_FSH');
}

async function onClickDdlvBaseInfGrst() {
  const { result } = await modal({
    component: 'WwsnaBsCsmbDeliveryBaseRegP',
  });

  if (result) await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'mngtYm' },
    { fieldName: 'csmbPdCd' },
    { fieldName: 'itmKnm' },
    { fieldName: 'mngtUnitCd' },
    { fieldName: 'mngtUnitNm' },
    { fieldName: 'goDvCd' },
    { fieldName: 'goDvNm' },
    { fieldName: 'goUprc' },
    { fieldName: 'boxUnitQty' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'nwcmrOrtYn' },
    { fieldName: 'nwcmrTpCd' },
    { fieldName: 'nwcmrTpNm' },
    { fieldName: 'nwcmrCmptBaseCd' },
    { fieldName: 'nwcmrCmptBaseNm' },
    { fieldName: 'nwcmrPdGrpCd' },
    { fieldName: 'nwcmrPdGrpNm' },
    { fieldName: 'nwcmrAccTpCd' },
    { fieldName: 'nwcmrAccTpNm' },
    { fieldName: 'nwcmrUnitAccN' },
    { fieldName: 'nwcmrUnitQty' },
    { fieldName: 'nwcmrLmQty' },
    { fieldName: 'nwcmrSortOdr' },
    { fieldName: 'indvOrtYn' },
    { fieldName: 'indvTpCd' },
    { fieldName: 'indvTpNm' },
    { fieldName: 'indvCmptBaseCd' },
    { fieldName: 'indvCmptBaseNm' },
    { fieldName: 'indvPdGrpCd' },
    { fieldName: 'indvPdGrpNm' },
    { fieldName: 'indvAccTpCd' },
    { fieldName: 'indvAccTpNm' },
    { fieldName: 'indvUnitAccN' },
    { fieldName: 'indvUnitQty' },
    { fieldName: 'indvLmQty' },
    { fieldName: 'indvSortOdr' },
    { fieldName: 'bldOrtYn' },
    { fieldName: 'bldTpCd' },
    { fieldName: 'bldTpNm' },
    { fieldName: 'bldCmptBaseCd' },
    { fieldName: 'bldCmptBaseNm' },
    { fieldName: 'bldPdGrpCd' },
    { fieldName: 'bldPdGrpNm' },
    { fieldName: 'bldAccTpCd' },
    { fieldName: 'bldAccTpNm' },
    { fieldName: 'bldUnitAccN' },
    { fieldName: 'bldUnitQty' },
    { fieldName: 'bldLmQty' },
    { fieldName: 'bldSortOdr' },
  ];

  const columns = [
    { fieldName: 'csmbPdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'itmKnm', header: t('MSG_TXT_ITM_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'mngtUnitNm', header: t('MSG_TXT_STOC_UNIT'), width: '100', styleName: 'text-center' },
    { fieldName: 'goDvNm', header: t('MSG_TXT_GO_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'goUprc', header: t('MSG_TXT_UPRC'), width: '100', styleName: 'text-center' },
    { fieldName: 'boxUnitQty', header: t('MSG_TXT_BOX_UNIT_QTY'), width: '100', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'nwcmrOrtYn', header: t('MSG_TXT_ORT_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'nwcmrTpNm', header: t('유형1'), width: '100', styleName: 'text-center' },
    { fieldName: 'nwcmrCmptBaseNm', header: t('유형2'), width: '100', styleName: 'text-center' },
    { fieldName: 'nwcmrPdGrpNm', header: t('MSG_TXT_PDGRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'nwcmrAccTpNm', header: t('MSG_TXT_ACC_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'nwcmrUnitAccN', header: t('MSG_TXT_ACC_UNIT'), width: '100', styleName: 'text-center' },
    { fieldName: 'nwcmrUnitQty', header: t('MSG_TXT_QTY_UNIT'), width: '100', styleName: 'text-center' },
    { fieldName: 'nwcmrLmQty', header: t('MSG_TXT_LM_QTY'), width: '100', styleName: 'text-center' },
    { fieldName: 'nwcmrSortOdr', header: t('MSG_TXT_SORT_ORDER'), width: '100', styleName: 'text-center' },
    { fieldName: 'indvOrtYn', header: t('MSG_TXT_ORT_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'indvTpNm', header: t('유형1'), width: '100', styleName: 'text-center' },
    { fieldName: 'indvCmptBaseNm', header: t('유형2'), width: '100', styleName: 'text-center' },
    { fieldName: 'indvPdGrpNm', header: t('MSG_TXT_PDGRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'indvAccTpNm', header: t('MSG_TXT_ACC_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'indvUnitAccN', header: t('MSG_TXT_ACC_UNIT'), width: '100', styleName: 'text-center' },
    { fieldName: 'indvUnitQty', header: t('MSG_TXT_QTY_UNIT'), width: '100', styleName: 'text-center' },
    { fieldName: 'indvLmQty', header: t('MSG_TXT_LM_QTY'), width: '100', styleName: 'text-center' },
    { fieldName: 'indvSortOdr', header: t('MSG_TXT_SORT_ORDER'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldOrtYn', header: t('MSG_TXT_ORT_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldTpNm', header: t('유형1'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldCmptBaseNm', header: t('유형2'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldPdGrpNm', header: t('MSG_TXT_PDGRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldAccTpNm', header: t('MSG_TXT_ACC_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldUnitAccN', header: t('MSG_TXT_ACC_UNIT'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldUnitQty', header: t('MSG_TXT_QTY_UNIT'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldLmQty', header: t('MSG_TXT_LM_QTY'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldSortOdr', header: t('MSG_TXT_SORT_ORDER'), width: '100', styleName: 'text-center' },
  ];

  const columnLayout = [
    'goDvNm',
    'sapMatCd',
    'csmbPdCd',
    'itmKnm',
    'mngtUnitNm',
    'boxUnitQty',
    {
      header: t('MSG_TXT_NWCMR'),
      direction: 'horizontal',
      items: [
        {
          header: t('MSG_TXT_ORT_YN'),
          direction: 'horizontal',
          hideChildHeaders: true,
          items: [
            'nwcmrOrtYn',
          ],
        },
        {
          header: t('MSG_TXT_MSG_TXT_DDLV_BASE'),
          direction: 'horizontal',
          items: [
            'nwcmrTpNm',
            'nwcmrCmptBaseNm',
            'nwcmrLmQty',
            'nwcmrPdGrpNm',
            'nwcmrAccTpNm',
            'nwcmrUnitAccN',
            'nwcmrUnitQty',
            'nwcmrSortOdr',
          ],
        },
      ],
    },
    {
      header: t('MSG_TXT_INDV'),
      direction: 'horizontal',
      items: [
        {
          header: t('MSG_TXT_ORT_YN'),
          direction: 'horizontal',
          hideChildHeaders: true,
          items: [
            'indvOrtYn',
          ],
        },
        {
          header: t('MSG_TXT_MSG_TXT_DDLV_BASE'),
          direction: 'horizontal',
          items: [
            'indvTpNm',
            'indvCmptBaseNm',
            'indvLmQty',
            'indvPdGrpNm',
            'indvAccTpNm',
            'indvUnitAccN',
            'indvUnitQty',
            'indvSortOdr',
          ],
        },
      ],
    },
    {
      header: t('MSG_TXT_BUILDING'),
      direction: 'horizontal',
      items: [
        {
          header: t('MSG_TXT_ORT_YN'),
          direction: 'horizontal',
          hideChildHeaders: true,
          items: [
            'bldOrtYn',
          ],
        },
        {
          header: t('MSG_TXT_MSG_TXT_DDLV_BASE'),
          direction: 'horizontal',
          items: [
            'bldTpNm',
            'bldCmptBaseNm',
            'bldLmQty',
            'bldPdGrpNm',
            'bldAccTpNm',
            'bldUnitAccN',
            'bldUnitQty',
            'bldSortOdr',
          ],
        },
      ],
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellDblClicked = async (grid, clickData) => {
    if (pageInfo.value.totalCount > 0) {
      const { mngtYm, csmbPdCd } = grid.getValues(clickData.itemIndex);

      const { result } = await modal({
        component: 'WwsnaBsCsmbDeliveryBaseRegP',
        componentProps: { mngtYm, csmbPdCd },
      });

      if (result) await fetchData();
    }
  };
});

</script>
