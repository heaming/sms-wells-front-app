<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA
 2. 프로그램 ID : WwnaBsCsmbDeliveryAggregatePsM - BS소모품 배부집계 현황
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.05.16
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 빌딩별 BS소모품 관리계정 및 배부 현황 조회 화면
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.mngtYmFrom"
            v-model:to="searchParams.mngtYmTo"
            type="month"
            rules="date_range_months:6"
            @change="onChangeMngtYm"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_BLD_NM')"
        >
          <kw-select
            v-model="searchParams.bldCds"
            :options="bldCodes"
            multiple
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_DIV')"
        >
          <kw-select
            v-model="searchParams.bfsvcCsmbDdlvOjCd"
            :options="codes.BFSVC_CSMB_DDLV_OJ_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_NM')"
        >
          <kw-select
            v-model="searchParams.itmCds"
            :options="itmCodes"
            multiple
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SAP_CD')"
        >
          <kw-input
            v-model="searchParams.sapCdFrom"
            :maxlength="30"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.sapCdTo"
            :maxlength="30"
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

import { defineGrid, codeUtil, getComponentType, useMeta, useDataService, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'BFSVC_CSMB_DDLV_OJ_CD',
);

const searchParams = ref({
  mngtYmFrom: dayjs().add(-5, 'month').format('YYYYMM'),
  mngtYmTo: dayjs().format('YYYYMM'),
  bldCds: [],
  itmCds: [],
  bfsvcCsmbDdlvOjCd: '',
  sapCdFrom: '',
  sapCdTo: '',
});

const bldCodes = ref();
const itmCodes = ref();
const itemQtys = ref();
let colItems = [];

async function getItemCode() {
  const res = await dataService.get('/sms/wells/service/delivery-bases/item-information');
  const items = res.data;

  itmCodes.value = items.map((v) => ({ codeId: v.pdNm, codeName: v.pdNm }));
}

async function getBldCode() {
  const res = await dataService.get('/sms/wells/service/manager-bsconsumables/building-code');
  const codeData = res.data;

  bldCodes.value = codeData.map((v) => ({ codeId: v.bldCd, codeName: v.bldNm }));
}

let cachedParams;
async function getItemQtys() {
  // cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/service/delivery-aggregates/item-quantity', { params: { ...cachedParams, ...pageInfo.value, timeout: 300000 } });
  itemQtys.value = res.data;
}

async function fetchData() {
  await getItemQtys();

  const res = await dataService.get('/sms/wells/service/delivery-aggregates/paging', { params: { ...cachedParams, ...pageInfo.value, timeout: 300000 } });
  const { list: bsCsmbDdlvAgrgs, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(bsCsmbDdlvAgrgs);

  const data = view.getDataSource();

  if (bsCsmbDdlvAgrgs.length > 0) {
    for (let i = 0; i < bsCsmbDdlvAgrgs.length; i += 1) {
      for (let j = 0; j < itemQtys.value.length; j += 1) {
        if (bsCsmbDdlvAgrgs[i].aclBldCd === itemQtys.value[j].bldCd
            && bsCsmbDdlvAgrgs[i].csmbPdCd === itemQtys.value[j].csmbPdCd) {
          const yyyy = Number(itemQtys.value[j].mngtYm.substring(0, 4));
          const mm = Number(itemQtys.value[j].mngtYm.substring(4));

          data.setValue(i, `${yyyy}${mm}`, itemQtys.value[j].bfsvcCsmbDdlvQty);
        }
      }
    }
  }

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  // const res = await dataService.get('/sms/wells/service/delivery-aggregates', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// function setGridColumn() {
//   const strtYear = Number(searchParams.value.mngtYmFrom.substring(0, 4));
//   const endYear = Number(searchParams.value.mngtYmTo.substring(0, 4));
//   const strtMonth = Number(searchParams.value.mngtYmFrom.substring(4));
//   const endMonth = Number(searchParams.value.mngtYmTo.substring(4));

//   const monthCount = (endYear - strtYear) * 12 + (endMonth - strtMonth);
//   let yy = Number(searchParams.value.mngtYmFrom.substring(2, 4));
//   let yyyy = strtYear;
//   let mm = strtMonth;

//   for (let i = 1; i <= monthCount + 1; i += 1) {
//     const headerNm = `${yy}년 ${mm}월`;
//     const fieldNm = `${yyyy}${mm}`;

//     fields.push({ fieldName: fieldNm });
//     columns.push({
//       fieldName: fieldNm,
//       header: headerNm,
//       width: '80',
//       styleName: 'text-right',
//     });

//     colItems.push(fieldNm);

//     mm += 1;

//     if (mm > 12) {
//       mm = 1;
//       yy += 1;
//       yyyy += 1;
//     }
//   }
// }

async function onChangeMngtYm() {
  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  colItems = [];
  data.setFields([]);
  view.setColumns(null);
  view.setColumnLayout([]);

  const fields = [
    { fieldName: 'csmbPdCd' },
    { fieldName: 'strWareNo' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'bldNm' },
    { fieldName: 'bldCd' },
    { fieldName: 'aclBldCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'nwcmr' },
    { fieldName: 'indv' },
    { fieldName: 'bld' },
    { fieldName: 'bfsvcCsmbDdlvSum' },
    { fieldName: 'vstAccSum' },
    { fieldName: 'bdtIndv' },
    { fieldName: 'bdtCrp' },
    { fieldName: 'wrfr' },
    { fieldName: 'arcleIndv' },
    { fieldName: 'arcleCrp' },
    { fieldName: 'wtrSftnr' },
    { fieldName: 'msgcr' },
    { fieldName: 'cffMchn' },
    { fieldName: 'dryr' },
    { fieldName: 'wash' },
    { fieldName: 'ardrssr' },
    { fieldName: 'sscling' },
  ];

  const columns = [
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '100', styleName: 'text-left' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '180', styleName: 'text-center' },
    { fieldName: 'csmbPdCd', header: t('TXT_MSG_AS_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '150', styleName: 'text-left' },
    { fieldName: 'nwcmr', header: t('MSG_TXT_NWCMR'), width: '80', styleName: 'text-center' },
    { fieldName: 'indv', header: t('MSG_TXT_INDV'), width: '80', styleName: 'text-center' },
    { fieldName: 'bld', header: t('MSG_TXT_BUILDING'), width: '80', styleName: 'text-center' },
    { fieldName: 'bfsvcCsmbDdlvSum', header: t('MSG_TXT_AGG'), width: '80', styleName: 'text-right' },
    { fieldName: 'vstAccSum', header: t('MSG_TXT_AGG'), width: '80', styleName: 'text-right' },
    { fieldName: 'wrfr', header: t('MSG_TXT_WRFR'), width: '80', styleName: 'text-right' },
    { fieldName: 'bdtIndv', header: t('MSG_TXT_BDT_INDV'), width: '80', styleName: 'text-right' },
    { fieldName: 'bdtCrp', header: t('MSG_TXT_BDT_CRP'), width: '80', styleName: 'text-right' },
    { fieldName: 'arcleIndv', header: t('MSG_TXT_ARCLE_INDV'), width: '120', styleName: 'text-right' },
    { fieldName: 'arcleCrp', header: t('MSG_TXT_ARCLE_CRP'), width: '120', styleName: 'text-right' },
    { fieldName: 'wtrSftnr', header: t('MSG_TXT_WTST'), width: '80', styleName: 'text-right' },
    { fieldName: 'cffMchn', header: t('MSG_TXT_CFF_MCHN'), width: '80', styleName: 'text-right' },
    { fieldName: 'msgcr', header: t('MSG_TXT_MSGCR'), width: '80', styleName: 'text-right' },
    { fieldName: 'dryr', header: t('MSG_TXT_DRYER'), width: '80', styleName: 'text-right' },
    { fieldName: 'wash', header: t('MSG_TXT_WASHER'), width: '80', styleName: 'text-right' },
    { fieldName: 'ardrssr', header: t('MSG_TXT_ARDRSSR'), width: '80', styleName: 'text-right' },
    { fieldName: 'sscling', header: t('MSG_TXT_SS_CLING_MCHN'), width: '80', styleName: 'text-right' },
  ];

  const strtYear = Number(searchParams.value.mngtYmFrom.substring(0, 4));
  const endYear = Number(searchParams.value.mngtYmTo.substring(0, 4));
  const strtMonth = Number(searchParams.value.mngtYmFrom.substring(4));
  const endMonth = Number(searchParams.value.mngtYmTo.substring(4));

  const monthCount = (endYear - strtYear) * 12 + (endMonth - strtMonth);
  let yy = Number(searchParams.value.mngtYmFrom.substring(2, 4));
  let yyyy = strtYear;
  let mm = strtMonth;

  colItems.push('bfsvcCsmbDdlvSum');

  for (let i = 1; i <= monthCount + 1; i += 1) {
    const headerNm = `${yy}년 ${mm}월`;
    const fieldNm = `${yyyy}${mm}`;

    fields.push({ fieldName: fieldNm });
    columns.push({
      fieldName: fieldNm,
      header: headerNm,
      width: '80',
      styleName: 'text-right',
    });

    colItems.push(fieldNm);

    mm += 1;

    if (mm > 12) {
      mm = 1;
      yy += 1;
      yyyy += 1;
    }
  }

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'bldCd', 'bldNm', 'sapMatCd', 'csmbPdCd', 'pdNm',
    {
      header: '배부형태',
      direction: 'horizontal',
      items: ['nwcmr', 'indv', 'bld'],
    },
    {
      header: '배부 수량',
      direction: 'horizontal',
      items: colItems,
    },
    {
      header: '방문계정',
      direction: 'horizontal',
      items: ['vstAccSum', 'wrfr', 'bdtIndv', 'bdtCrp', 'arcleIndv', 'arcleCrp', 'wtrSftnr', 'cffMchn', 'msgcr', 'dryr', 'wash', 'ardrssr', 'sscling'],
    },
  ]);

  await getItemCode();
}

onMounted(async () => {
  await getBldCode();
  await getItemCode();
  // await getItemQtys();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid(async (data, view) => {
  const fields = [
    { fieldName: 'csmbPdCd' },
    { fieldName: 'strWareNo' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'bldNm' },
    { fieldName: 'bldCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'nwcmr' },
    { fieldName: 'indv' },
    { fieldName: 'bld' },
    { fieldName: 'bfsvcCsmbDdlvSum' },
    { fieldName: 'vstAccSum' },
    { fieldName: 'bdtIndv' },
    { fieldName: 'bdtCrp' },
    { fieldName: 'wrfr' },
    { fieldName: 'arcleIndv' },
    { fieldName: 'arcleCrp' },
    { fieldName: 'wtrSftnr' },
    { fieldName: 'msgcr' },
    { fieldName: 'cffMchn' },
    { fieldName: 'dryr' },
    { fieldName: 'wash' },
    { fieldName: 'ardrssr' },
    { fieldName: 'sscling' },
  ];

  const columns = [
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '100', styleName: 'text-left' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '180', styleName: 'text-center' },
    { fieldName: 'csmbPdCd', header: t('TXT_MSG_AS_ITM_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '150', styleName: 'text-left' },
    { fieldName: 'nwcmr', header: t('MSG_TXT_NWCMR'), width: '80', styleName: 'text-center' },
    { fieldName: 'indv', header: t('MSG_TXT_INDV'), width: '80', styleName: 'text-center' },
    { fieldName: 'bld', header: t('MSG_TXT_BUILDING'), width: '80', styleName: 'text-center' },
    { fieldName: 'bfsvcCsmbDdlvSum', header: t('MSG_TXT_AGG'), width: '80', styleName: 'text-right' },
    { fieldName: 'vstAccSum', header: t('MSG_TXT_AGG'), width: '80', styleName: 'text-right' },
    { fieldName: 'wrfr', header: t('MSG_TXT_WRFR'), width: '80', styleName: 'text-right' },
    { fieldName: 'bdtIndv', header: t('MSG_TXT_BDT_INDV'), width: '80', styleName: 'text-right' },
    { fieldName: 'bdtCrp', header: t('MSG_TXT_BDT_CRP'), width: '80', styleName: 'text-right' },
    { fieldName: 'arcleIndv', header: t('MSG_TXT_ARCLE_INDV'), width: '120', styleName: 'text-right' },
    { fieldName: 'arcleCrp', header: t('MSG_TXT_ARCLE_CRP'), width: '120', styleName: 'text-right' },
    { fieldName: 'wtrSftnr', header: t('MSG_TXT_WTST'), width: '80', styleName: 'text-right' },
    { fieldName: 'cffMchn', header: t('MSG_TXT_CFF_MCHN'), width: '80', styleName: 'text-right' },
    { fieldName: 'msgcr', header: t('MSG_TXT_MSGCR'), width: '80', styleName: 'text-right' },
    { fieldName: 'dryr', header: t('MSG_TXT_DRYER'), width: '80', styleName: 'text-right' },
    { fieldName: 'wash', header: t('MSG_TXT_WASHER'), width: '80', styleName: 'text-right' },
    { fieldName: 'ardrssr', header: t('MSG_TXT_ARDRSSR'), width: '80', styleName: 'text-right' },
    { fieldName: 'sscling', header: t('MSG_TXT_SS_CLING_MCHN'), width: '80', styleName: 'text-right' },
  ];

  const strtYear = Number(searchParams.value.mngtYmFrom.substring(0, 4));
  const endYear = Number(searchParams.value.mngtYmTo.substring(0, 4));
  const strtMonth = Number(searchParams.value.mngtYmFrom.substring(4));
  const endMonth = Number(searchParams.value.mngtYmTo.substring(4));

  const monthCount = (endYear - strtYear) * 12 + (endMonth - strtMonth);
  let yy = Number(searchParams.value.mngtYmFrom.substring(2, 4));
  let yyyy = strtYear;
  let mm = strtMonth;

  colItems.push('bfsvcCsmbDdlvSum');

  for (let i = 1; i <= monthCount + 1; i += 1) {
    const headerNm = `${yy}년 ${mm}월`;
    const fieldNm = `${yyyy}${mm}`;

    fields.push({ fieldName: fieldNm });
    columns.push({
      fieldName: fieldNm,
      header: headerNm,
      width: '80',
      styleName: 'text-right',
    });

    colItems.push(fieldNm);

    mm += 1;

    if (mm > 12) {
      mm = 1;
      yy += 1;
      yyyy += 1;
    }
  }

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'bldCd', 'bldNm', 'sapMatCd', 'csmbPdCd', 'pdNm',
    {
      header: '배부형태',
      direction: 'horizontal',
      items: ['nwcmr', 'indv', 'bld'],
    },
    {
      header: '배부 수량',
      direction: 'horizontal',
      items: colItems,
    },
    {
      header: '방문계정',
      direction: 'horizontal',
      items: ['vstAccSum', 'wrfr', 'bdtIndv', 'bdtCrp', 'arcleIndv', 'arcleCrp', 'wtrSftnr', 'cffMchn', 'msgcr', 'dryr', 'wash', 'ardrssr', 'sscling'],
    },
  ]);
});
</script>
