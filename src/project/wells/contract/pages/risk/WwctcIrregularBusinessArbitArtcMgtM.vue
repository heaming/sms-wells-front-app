<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwctcIrregularBusinessArbitArtcMgtM - 비정도 영업 조치 사항 관리
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.01.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 비정도 영업 조치 사항 관리
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ACEPT_PERIOD')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.srchGbn"
            :options="prdDivOption"
          />
          <kw-date-range-picker
            :key="isRegistration"
            v-model:from="searchParams.dangOcStrtdt"
            v-model:to="searchParams.dangOcEnddt"
            :type="isRegistration"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')">
          <kw-select
            v-model="searchParams.gnrdv"
            :options="gnrlMngTeamOptions"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_RGNL_GRP')">
          <kw-input
            v-model="searchParams.rgrp"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_BRANCH')">
          <kw-input v-model="searchParams.brch" />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_EMP_SRCH')">
          <kw-input
            v-model="searchParams.dangOjPrtnrNo"
            icon="search_24"
            clearable
            @click-icon="onClickOpenPartnerListPopup"
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
          v-permission:delete
          grid-action
          :label="$t('MSG_BTN_DEL')"
          @click="onClickRemove"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          dense
          secondary
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
          v-permission:update
          dense
          secondary
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :disable="!totalCount"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="pageInfo.pageSize - 1"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { modal, notify } = useGlobal();
const { t } = useI18n();

const dataService = useDataService();

const prdDivOption = ref([{ codeId: 1, codeName: t('MSG_TXT_FST_RGST_DT') },
  { codeId: 2, codeName: t('MSG_TXT_YEAR_OCCURNCE') }]);
const gnrlMngTeamOptions = ref([
  { codeId: '', codeName: t('MSG_TXT_ALL') },
  { codeId: 'A', codeName: `A${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'B', codeName: `B${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'C', codeName: `C${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'D', codeName: `D${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'E', codeName: `E${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'F', codeName: `F${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'G', codeName: `G${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'H', codeName: `H${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'P', codeName: `P${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
]);

let cachedParams;
const totalCount = ref(0);
const searchParams = ref({
  srchGbn: 1,
  dangOcStrtdt: '',
  dangOcEnddt: '',
  gnrdv: '',
  rgrp: '',
  brch: '',
  dangOjPrtnrNo: '',

});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const { getConfig } = useMeta();

const codes = await codeUtil.getMultiCodes(
  'PNTSC_ARBIT_ATC_CD',
  'PNTSC_ARBIT_DEPT_CD',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const isRegistration = computed(() => {
  searchParams.value.dangOcStrtdt = '';
  searchParams.value.dangOcEnddt = '';
  return searchParams.value.srchGbn !== 1 ? 'month' : 'date';
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/risk-audits/irregular-sales-actions/managerial-tasks/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  totalCount.value = res.data.length;
  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  if (pageInfo.value.pageIndex === 1) {
    dataSource.setRows(details);
  } else {
    dataSource.addRows(details);
  }
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  if (cachedParams.srchGbn !== 1) {
    const { dangOcStrtdt, dangOcEnddt, ...restParams } = cachedParams;
    cachedParams = { dangOcStrtMonth: dangOcStrtdt, dangOcEndMonth: dangOcEnddt, ...restParams };
  }

  await fetchData();
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length) {
    await dataService.delete('/sms/wells/contract/risk-audits/irregular-sales-actions/managerial-tasks', { data: deletedRows });
    await onClickSearch();
  }
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/contract/risk-audits/irregular-sales-actions/managerial-tasks', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, {});
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/contract/risk-audits/irregular-sales-actions/managerial-tasks/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'dataServiceManageList',
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickOpenPartnerListPopup() {
  const { result, payload } = await modal({
    component: 'ZwogcPartnerListP',
  });
  if (result) {
    searchParams.value.dangOjPrtnrNo = payload.prtnrNo;
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dangOjPrtnrNo' },
    { fieldName: 'dangOcStrtmm' },
    { fieldName: 'dangOjOgId' },
    { fieldName: 'dangOjPntnrNm' },
    { fieldName: 'dangOjPrtnrPstnDvNm' },
    { fieldName: 'dgr1LevlDgPrtnrNo' },
    { fieldName: 'dgr1LevlDgPrtnrNm' },
    { fieldName: 'dgr2LevlDgPrtnrNo' },
    { fieldName: 'dgr2LevlDgPrtnrNm' },
    { fieldName: 'bznsSpptPrtnrNo' },
    { fieldName: 'bznsSpptPrtnrNm' },
    { fieldName: 'dgr3LevlDgPrtnrNo' },
    { fieldName: 'dgr3LevlDgPrtnrNm' },
    { fieldName: 'dangChkNm' },
    { fieldName: 'dangArbitCd' },
    { fieldName: 'dangUncvrCt' },
    { fieldName: 'dangArbitLvyPc' },
    { fieldName: 'dangArbitOgId' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fstRgstDt' },

  ];

  const columns = [
    { fieldName: 'dangOjPrtnrNo',
      header: t('MSG_TXT_EMP_NO'),
      width: '180',
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      rules: 'required',
    },
    { fieldName: 'dangOcStrtmm',
      header: t('MSG_TXT_YEAR_OCCURNCE'),
      width: '165',
      datetimeFormat: 'yyyy-MM',
      editor: {
        type: 'btdate',
        datetimeFormat: 'yyyy-MM',
      } },
    { fieldName: 'dangOjOgId', header: t('MSG_TXT_BLG'), width: '129', editable: true },
    { fieldName: 'dangOjPntnrNm', header: t('MSG_TXT_EMPL_NM'), width: '129', editable: false },
    { fieldName: 'dangOjPrtnrPstnDvNm', header: t('MSG_TXT_CRLV'), width: '129', editable: false },
    { fieldName: 'dgr1LevlDgPrtnrNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '129', editable: false },
    { fieldName: 'dgr2LevlDgPrtnrNm', header: t('MSG_TXT_RGNL_GRP'), width: '129', editable: false },
    { fieldName: 'bznsSpptPrtnrNm', header: 'BM', width: '129', editable: false },
    { fieldName: 'dgr3LevlDgPrtnrNm', header: t('MSG_TXT_BRANCH'), width: '129', editable: false },
    { fieldName: 'dangChkNm', header: t('MSG_TXT_CHRGS'), width: '306', rules: 'required' },
    { fieldName: 'dangArbitCd',
      header: t('MSG_TXT_ACTN_ITM'),
      width: '306',
      options: codes.PNTSC_ARBIT_ATC_CD,
      editor: { type: 'list' },
      rules: 'required',
    },
    { fieldName: 'dangUncvrCt', header: t('MSG_TXT_DUE_TRGT_NO'), width: '129', rules: 'required' },
    { fieldName: 'dangArbitLvyPc',
      header: t('MSG_TXT_ACTN_TM_PNLTY_PNT'),
      width: '190',
      styleName: 'text-center',
      options: [
        { codeId: '5', codeName: '★' },
        { codeId: '10', codeName: '★★' },
        { codeId: '15', codeName: '★★★' },
        { codeId: '20', codeName: '★★★★' },
        { codeId: '25', codeName: '★★★★★' },
        { codeId: '30', codeName: '★★★★★★' },
        { codeId: '35', codeName: '★★★★★★★' },
        { codeId: '40', codeName: '★★★★★★★★' },
        { codeId: '45', codeName: '★★★★★★★★★' },
        { codeId: '50', codeName: '★★★★★★★★★★' },
      ],
      editor: { type: 'list' },
      rules: 'required' },
    { fieldName: 'dangArbitOgId',
      header: t('MSG_TXT_ACTN_DPT'),
      width: '306',
      options: codes.PNTSC_ARBIT_DEPT_CD,
      editor: { type: 'list' },
      rules: 'required',
    },
    { fieldName: 'fstRgstUsrId',
      header: t('MSG_TXT_FST_RGST_USR'),
      width: '146',
      styleName: 'text-center',
      editable: false },
    { fieldName: 'fstRgstDt',
      header: t('MSG_TXT_FST_RGST_DT'),
      width: '165',
      datetimeFormat: 'date',
      editable: false },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_EMP_NO'),
      direction: 'horizontal',
      items: ['dangOjPrtnrNo', 'dangOcStrtmm', 'dangOjOgId', 'dangOjPntnrNm', 'dangOjPrtnrPstnDvNm'],
    },
    {
      header: t('MSG_TXT_BLG'),
      direction: 'horizontal',
      items: ['dgr1LevlDgPrtnrNm', 'dgr2LevlDgPrtnrNm', 'bznsSpptPrtnrNm', 'dgr3LevlDgPrtnrNm'],
    },
    {
      header: t('MSG_TXT_PNLTY'),
      direction: 'horizontal',
      items: ['dangChkNm', 'dangArbitCd', 'dangUncvrCt', 'dangArbitLvyPc', 'dangArbitOgId'],
    },
    'fstRgstUsrId', 'fstRgstDt',

  ]);

  view.onCellButtonClicked = async (grid, index) => {
    const res = await dataService.get('/sms/wells/contract/risk-audits/irregular-sales-actions/Organizations', {
      params: {
        baseYm: grid.getValues(index.dataRow).dangOcStrtmm,
        pntnrNo: grid.getValues(index.dataRow).dangOjPrtnrNo,
        ogTpCd: '',
      },
    });
    res.data.forEach((v) => {
      if ((!isEmpty(v))) {
        data.setValue(index.dataRow, 'dangOjPrtnrNo', v.prtnrNo);
        data.setValue(index.dataRow, 'dangOjPntnrNm', v.prtnrKnm);
        data.setValue(index.dataRow, 'dangOjOgId', v.ogCd);
        data.setValue(index.dataRow, 'dgr1LevlDgPrtnrNo', v.dgr1LevlOgCd);
        data.setValue(index.dataRow, 'dgr1LevlDgPrtnrNm', v.dgr1LevlOgNm);
        data.setValue(index.dataRow, 'dgr2LevlDgPrtnrNo', v.dgr2LevlOgCd);
        data.setValue(index.dataRow, 'dgr2LevlDgPrtnrNm', v.dgr2LevlOgNm);
        data.setValue(index.dataRow, 'bznsSpptPrtnrNo', v.bizSpptPrtnrCd);
        data.setValue(index.dataRow, 'bznsSpptPrtnrNm', v.bizSpptPrtnrNo);
        data.setValue(index.dataRow, 'dgr3LevlDgPrtnrNo', v.dgr3LevlOgCd);
        data.setValue(index.dataRow, 'dgr3LevlDgPrtnrNm', v.dgr3LevlOgNm);
      }
    });
  };
  view.onScrollToBottom = (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      fetchData();
    }
  };
});

</script>
