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
            required
            @change="calChange"
          />
          <kw-date-range-picker
            v-if="searchParams.srchGbn===1"
            v-model:from="searchParams.dangOcStrtdt"
            v-model:to="searchParams.dangOcEnddt"
            type="date"
            rules="required"
          />
          <kw-date-range-picker
            v-if="searchParams.srchGbn===2"
            v-model:from="searchParams.dangOcStrtMonth"
            v-model:to="searchParams.dangOcEndMonth"
            type="month"
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
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
          grid-action
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
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
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
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { notify, modal } = useGlobal();
const { t } = useI18n();
const { getConfig, getUserInfo } = useMeta();
const now = dayjs();
const userInfo = getUserInfo();
const dataService = useDataService();
const { currentRoute } = useRouter();
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
const searchParams = ref({
  srchGbn: 1,
  dangOcStrtdt: '',
  dangOcStrtMonth: '',
  dangOcEnddt: '',
  dangOcEndMonth: '',
  gnrdv: '',
  rgrp: '',
  brch: '',
  dangOjPrtnrNo: '',
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes(
  'PNTSC_ARBIT_ATC_CD',
  'PNTSC_ARBIT_DEPT_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function calChange() {
  searchParams.value.dangOcStrtdt = '';
  searchParams.value.dangOcEnddt = '';
  searchParams.value.dangOcStrtMonth = '';
  searchParams.value.dangOcEndMonth = '';
}

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  if (cachedParams.srchGbn !== 1) {
    const { dangOcStrtdt, dangOcEnddt, ...restParams } = cachedParams;
    cachedParams = { dangOcStrtMonth: dangOcStrtdt, dangOcEndMonth: dangOcEnddt, ...restParams };
  }

  const res = await dataService.get('/sms/wells/contract/risk-audits/irregular-sales-actions/managerial-tasks', { params: cachedParams });
  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();
  dataSource.setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  if (searchParams.value.srchGbn === 1) {
    if ((isEmpty(searchParams.value.dangOcStrtdt)) && (!isEmpty(searchParams.value.dangOcEnddt))) {
      notify(t('MSG_ALT_CHK_DT_RLT'));
      return;
    }
    if ((!isEmpty(searchParams.value.dangOcStrtdt)) && (isEmpty(searchParams.value.dangOcEnddt))) {
      notify(t('MSG_ALT_CHK_DT_RLT'));
      return;
    }
  }

  if (searchParams.value.srchGbn === 2) {
    if ((isEmpty(searchParams.value.dangOcStrtMonth)) && (!isEmpty(searchParams.value.dangOcEndMonth))) {
      notify(t('MSG_ALT_CHK_DT_RLT'));
      return;
    }
    if ((!isEmpty(searchParams.value.dangOcStrtMonth)) && (isEmpty(searchParams.value.dangOcEndMonth))) {
      notify(t('MSG_ALT_CHK_DT_RLT'));
      return;
    }
  }
  await fetchData();
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  for (let i = 0; i < gridUtil.getCheckedRowValues(view).length; i += 1) {
    if (isEmpty(gridUtil.getCheckedRowValues(view)[i].dangOjOgId)) {
      notify(t('MSG_ALT_EXIST_BEAN_ID'));
      return;
    }
  }

  if (deletedRows.length) {
    await dataService.delete('/sms/wells/contract/risk-audits/irregular-sales-actions/managerial-tasks', { data: deletedRows });
    notify(t('MSG_ALT_DELETED'));
    await onClickSearch();
  }
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/contract/risk-audits/irregular-sales-actions/managerial-tasks', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  const row = view.getCurrent().dataRow < 0 ? '0' : view.getCurrent().dataRow;
  await gridUtil.insertRowAndFocus(view, row, {});
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/contract/risk-audits/irregular-sales-actions/managerial-tasks', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onGroupFind(dataRow) {
  const view = grdMainRef.value.getView();
  if (!isEmpty(view.getValues(dataRow).dangOcStrtmm)
    && !isEmpty(view.getValues(dataRow).dangOjPrtnrNo)) {
    const res = await dataService.get('sms/wells/contract/risk-audits/irregular-sales-actions/organizations', {
      params: {
        baseYm: view.getValues(dataRow).dangOcStrtmm,
        prtnrNo: view.getValues(dataRow).dangOjPrtnrNo,
        ogTpCd: userInfo.ogTpCd,
      },
    });
    view.setValue(dataRow, 'dangOjPrtnrNm', '');
    view.setValue(dataRow, 'dangOjOgId', '');
    view.setValue(dataRow, 'dangOjPstnDvCd', '');
    view.setValue(dataRow, 'dgr1LevlDgPrtnrNo', '');
    view.setValue(dataRow, 'dgr1LevlDgPrtnrNm', '');
    view.setValue(dataRow, 'dgr2LevlDgPrtnrNo', '');
    view.setValue(dataRow, 'dgr2LevlDgPrtnrNm', '');
    view.setValue(dataRow, 'bznsSpptPrtnrNo', '');
    view.setValue(dataRow, 'bznsSpptPrtnrNm', '');
    view.setValue(dataRow, 'dgr3LevlDgPrtnrNo', '');
    view.setValue(dataRow, 'dgr3LevlDgPrtnrNm', '');
    view.setValue(dataRow, 'ogTpCd', '');
    const resData = res.data;

    if ((!isEmpty(res.data))) {
      view.setValue(dataRow, 'dangOjPrtnrNm', resData.prtnrKnm);
      view.setValue(dataRow, 'dangOjOgId', resData.ogCd);
      view.setValue(dataRow, 'dangOjPstnDvCd', resData.pstnDvCd);
      view.setValue(dataRow, 'dgr1LevlDgPrtnrNo', resData.dgr1LevlDgPrtnrNo);
      view.setValue(dataRow, 'dgr1LevlDgPrtnrNm', resData.dgr1LevlDgPrtnrNm);
      view.setValue(dataRow, 'dgr2LevlDgPrtnrNo', resData.dgr2LevlDgPrtnrNo);
      view.setValue(dataRow, 'dgr2LevlDgPrtnrNm', resData.dgr2LevlDgPrtnrNm);
      view.setValue(dataRow, 'bznsSpptPrtnrNo', resData.bizSpptPrtnrNo);
      view.setValue(dataRow, 'bznsSpptPrtnrNm', resData.bizSpptPrtnrNm);
      view.setValue(dataRow, 'dgr3LevlDgPrtnrNo', resData.dgr3LevlDgPrtnrNo);
      view.setValue(dataRow, 'dgr3LevlDgPrtnrNm', resData.dgr3LevlDgPrtnrNm);
      view.setValue(dataRow, 'ogTpCd', resData.ogTpCd);
    }
  }
}

async function onClickOpenPartnerListPopup() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: userInfo.ogTpCd,
    },
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
    { fieldName: 'dangOjPrtnrNm' },
    { fieldName: 'dangOjPstnDvCd' },
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
    { fieldName: 'ogTpCd' },

  ];

  const columns = [
    { fieldName: 'dangOjPrtnrNo',
      header: t('MSG_TXT_EMP_NO'),
      width: '180',
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      rules: 'required',
      styleCallback(grid, dataCell) {
        return { editable: dataCell.item.rowState === 'created' };
      },
    },
    { fieldName: 'dangOcStrtmm',
      header: t('MSG_TXT_YEAR_OCCURNCE'),
      width: '165',
      datetimeFormat: 'yyyy-MM',
      rules: 'required',
      editor: {
        type: 'btdate',
        btOptions: {
          minViewMode: 1,
        },
        datetimeFormat: 'yyyy-MM',
      },
      styleCallback(grid, dataCell) {
        return { editable: dataCell.item.rowState === 'created' };
      },
    },
    { fieldName: 'dangOjOgId', header: t('MSG_TXT_BLG'), width: '129', editable: false },
    { fieldName: 'dangOjPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '129', editable: false },
    { fieldName: 'dangOjPstnDvCd', header: t('MSG_TXT_CRLV'), width: '129', editable: false },
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
      items: ['dangOjPrtnrNo', 'dangOcStrtmm', 'dangOjOgId', 'dangOjPrtnrNm', 'dangOjPstnDvCd'],
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

  view.onCellButtonClicked = async (g, { itemIndex }) => {
    const updateRow = view.getCurrent().dataRow;
    if (!isEmpty(data.getValue(updateRow, 18))) {
      notify(t('MSG_ALT_ACCESS_WHEN_REG_MODE'));
      return;
    }
    const { result, payload } = await modal({
      component: 'ZwogzPartnerListP',
      componentProps: {
        prtnrNo: searchParams.value.prtnrNo,
        ogTpCd: userInfo.ogTpCd,
      },
    });
    data.setValue(updateRow, 'dangOjPrtnrNo', '');
    if (result) {
      data.setValue(updateRow, 'dangOjPrtnrNo', payload.prtnrNo);
      onGroupFind(itemIndex);
    }
  };
  view.onCellEdited = async function cellEdited(grid, itemIndex, dataRow, fieldIndex) {
    const columnName = grid.getColumn(fieldIndex).fieldName;
    if (columnName === 'dangOjPrtnrNo' || columnName === 'dangOcStrtmm') {
      const updateDateRow = view.getCurrent().dataRow;
      const dateParam = grid.getValue(updateDateRow, 1);
      if (isEmpty(dateParam)) {
        grid.commit();
        data.setValue(updateDateRow, 'dangOcStrtmm', now.format('YYYYMM'));
      }
      onGroupFind(itemIndex);
    }
  };
});

</script>
