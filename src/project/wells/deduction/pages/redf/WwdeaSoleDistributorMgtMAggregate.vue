<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DEA
2. 프로그램 ID : WwdeaSoleDistributorMgtMAggregate
3. 작성자 : daewon.kim
4. 작성일 : 2023.05.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 총판/B2B 되물림 관리 탭
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="2"
    one-row
    :modified-targets="['grdMgtMain']"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_MGT_YNM')"
        required
      >
        <kw-date-range-picker
          v-model:from="searchParams.redfAdsbOcYmFrom"
          v-model:to="searchParams.redfAdsbOcYmTo"
          :label="t('MSG_TXT_MGT_YNM')"
          rules="date_range_required"
          type="month"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_OG_TP')"
      >
        <kw-option-group
          v-model="searchParams.ogTpCd"
          type="radio"
          :options="filterOgTpCd"
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
        />
        <!-- (단위 : 건) -->
        <span class="ml8">{{ t('MSG_TXT_MSG_TXT_UNIT_CASE') }}</span>
      </template>
      <kw-btn
        grid-action
        :label="t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />

      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMgtMainRef"
      name="grdMgtMain"
      :visible-rows="10"
      :page-size="pageInfo.pageSize-1"
      :total-count="pageInfo.totalCount"
      @init="initGrid"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { codeUtil, getComponentType, gridUtil, notify, useDataService, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const { t } = useI18n();
const grdMgtMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
const dataService = useDataService();
const { getConfig } = useMeta();
const defalutMonth = dayjs().subtract(0, 'month').format('YYYYMM');

const codes = await codeUtil.getMultiCodes(
  'DDTN_RPLC_OG_TP_CD',
);

const filterOgTpCd = ref([]);
codes.DDTN_RPLC_OG_TP_CD.sort(() => -1);
codes.DDTN_RPLC_OG_TP_CD.forEach((e) => {
  if (e.codeId === 'W04' || e.codeId === 'W05') {
    filterOgTpCd.value.push({
      codeId: e.codeId.trim(),
      codeName: e.codeName.trim(),
    });
  }
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

let cachedParams;

const searchParams = ref({
  ogTpCd: filterOgTpCd.value[0].codeId,
  redfAdsbOcYmFrom: defalutMonth,
  redfAdsbOcYmTo: defalutMonth,
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/deduction/sole-distributors/management/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: redfes, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMgtMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(redfes);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  grdMgtMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMgtMainRef.value.getView();
  const res = await dataService.get('/sms/wells/deduction/sole-distributors/management/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSave() {
  const view = grdMgtMainRef.value.getView();

  // const rows = gridUtil.getChangedRowValues(view, true);
  const rows = gridUtil.getCheckedRowValues(view);
  if (rows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  await dataService.post('/sms/wells/deduction/sole-distributors/management', rows);

  notify(t('MSG_ALT_SAVE_DATA'));
  grdMgtMainRef.value.getData().clearRows();

  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'ogCd' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'redfAdsbOcYm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'redfDdtnBlamCrdovrAmt', dataType: 'number' },
    { fieldName: 'redfOcAmt', dataType: 'number' },
    { fieldName: 'redfOcSum', dataType: 'number' },
    { fieldName: 'redfDdctam', dataType: 'number' },
    { fieldName: 'redfDdtnBlam', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_CORP_NAME'), width: '217', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUMBER'), width: '120', styleName: 'text-center' },
    { fieldName: 'redfDdtnBlamCrdovrAmt', header: t('MSG_TXT_LSTMM_BLAM'), width: '200', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'redfOcAmt', header: t('MSG_TXT_THM_OC'), width: '200', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'redfOcSum', header: t('MSG_TXT_THM_SUM'), width: '200', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'redfDdctam', header: t('MSG_TXT_THM_DDTN'), width: '200', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'redfDdtnBlam', header: t('MSG_TXT_THM_BLAM'), width: '200', styleName: 'text-right', numberFormat: '#,##0' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.setColumnLayout([
    'ogNm',
    'ogCd',
    'prtnrNo', // single
    {
      header: t('MSG_TXT_REDF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['redfDdtnBlamCrdovrAmt', 'redfOcAmt', 'redfOcSum', 'redfDdctam', 'redfDdtnBlam'],
    },

  ]);
  view.onCellEditable = (grid, index) => {
    if (index.column === 'redfDdctam') {
      return true;
    }
    return false;
  };

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };
}
</script>
