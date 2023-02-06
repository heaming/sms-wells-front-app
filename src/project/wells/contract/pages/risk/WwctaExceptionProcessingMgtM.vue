<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaExceptionProcessingMgtM - 예외처리관리
3. 작성자 : gs.sahil.s6
4. 작성일 : 2023.01.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 예외처리관리 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs model-value="exceptionHandling">
      <kw-tab
        name="confirmCriteria"
        :label="$t('MSG_TXT_APRV_CRTE_MGT')"
      />
      <kw-tab
        name="exceptionHandling"
        :label="$t('MSG_TXT_EXCP_HAND_MGT')"
      />
      <kw-tab
        name="businessRestriction"
        :label="$t('MSG_TXT_BIZ_SUBS_RES_MGT')"
      />
      <kw-tab
        name="userRestriction"
        :label="$t('MSG_TXT_USR_SLS_RES_MGT')"
      />
      <kw-tab
        name="blackList"
        :label="$t('MSG_TXT_BLKLST_MGT')"
      />
    </kw-tabs>
    <kw-tab-panels model-value="exceptionHandling">
      <kw-tab-panel name="exceptionHandling">
        <kw-search
          :cols="2"
          :modified-targets="['grdMain']"
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_ACEPT_PERIOD')"
              required
            >
              <kw-date-range-picker
                v-model:from="searchParams.startDt"
                v-model:to="searchParams.endDt"
                rules="date_range_required|date_range_months:1"
              />
            </kw-search-item>

            <kw-search-item
              :label="$t('MSG_TXT_PTNR_NO')"
              required
            >
              <kw-input
                v-model="searchParams.prtnrNo"
                icon="search"
                rules="required"
                clearable
                @click-icon="onClickOpenEmployeeSearchPopup"
              />
            </kw-search-item>
          </kw-search-row>

          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_CST_NO')"
              required
            >
              <kw-input
                v-model="searchParams.cstmrNo"
                icon="search"
                rules="required"
                clearable
                @click-icon="onClickOpenCustomerSearchPopup"
              />
            </kw-search-item>

            <kw-search-item
              :label="$t('MSG_TXT_CNTR_NO')"
              required
            >
              <kw-input
                v-model="searchParams.cntrNo"
                rules="required"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :page-size="pageInfo.pageSize"
                :total-count="pageInfo.totalCount"
              />
            </template>
            <kw-btn
              dense
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
              dense
              grid-action
              :label="$t('MSG_BTN_ROW_ADD')"
              @click="onClickAdd"
            />
            <kw-btn
              dense
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
              :disable="pageInfo.totalCount===0"
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              @click="onClickExcelDownload"
            />
          </kw-action-top>

          <kw-grid
            ref="grdMainRef"
            name="grdMain"
            :visible-rows="pageInfo.pageSize"
            @init="initGrid"
          />

          <kw-pagination
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </div>
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import dayjs from 'dayjs';

const dataService = useDataService();
// console.log(dataService);

const { getConfig } = useMeta();
const { t } = useI18n();
const { modal, notify } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const now = dayjs();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'EX_PROCS_CD',
  // 'DTA_DL_YN',
);

const searchParams = ref({
  startDt: now.startOf('month').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  prtnrNo: '',
  cstmrNo: '',
  cntrNo: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function onClickOpenEmployeeSearchPopup() {
  const { result: isChanged, payload: employeeDetails } = await modal({
    component: 'ZwogcPartnerListP',
  });

  if (isChanged) {
    console.log(employeeDetails);
  }
}

async function onClickOpenCustomerSearchPopup() {
  const { result: isChanged, payload: customerDetails } = await modal({
    component: 'ZwcsaCustomerListP',
  });

  if (isChanged) {
    console.log(customerDetails);
  }
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/exception-handling', { params: searchParams.value });
  const exceptionHandling = res.data;

  pageInfo.value.totalCount = exceptionHandling.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(exceptionHandling);
  view.resetCurrent();
}

async function onClickSearch() {
  await fetchData();
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  const storeUids = deletedRows.map((row) => row.storeUid);

  if (storeUids.length > 0) {
    await dataService.delete('/sms/wells/contract/exception-handling', { params: { storeUids } });
    await fetchData();
  }
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    col1: codes.EX_PROCS_CD,
    col5: codes.DTA_DL_YN,
  });
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/contract/exception-handling', changedRows);

  await notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickExcelDownload() {
  const res = await dataService.get('/sms/wells/contract/exception-handling/excel-download');

  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: 'exceptionProcessingList',
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_SLS_CAT'), width: '289', options: codes.EX_PROCS_CD, editor: { type: 'list' } },
    { fieldName: 'col2',
      header: t('MSG_TXT_CST_NO'),
      width: '180',
      styleName: 'text-center rg-button-icon--search',
      button: 'action' },
    { fieldName: 'col3',
      header: t('MSG_TXT_PTNR_NO'),
      width: '180',
      styleName: 'text-center rg-button-icon--search',
      button: 'action' },
    { fieldName: 'col4', header: t('MSG_TXT_CNTR_NO'), width: '180', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_RESTRICTION_CLASSIFICATION'), width: '142', styleName: 'text-left', options: codes.DTA_DL_YN, editor: { type: 'list' } },
    { fieldName: 'col6', header: t('MSG_TXT_MEMO'), width: '404', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_STRT_DT'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editor: { type: 'btdate' } },
    { fieldName: 'col8', header: t('MSG_TXT_END_DT'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editor: { type: 'btdate' } },
    { fieldName: 'col9', header: t('MSG_TXT_FST_RGST_USR'), width: '180', styleName: 'text-center', editable: false },
    { fieldName: 'col10', header: t('MSG_TXT_MDFC_USR'), width: '180', styleName: 'text-center', editable: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  view.onCellButtonClicked = async (g, { column }) => {
    if (column === 'col2') {
      onClickOpenEmployeeSearchPopup();
    }
    if (column === 'col3') {
      onClickOpenCustomerSearchPopup();
    }
  };

  data.setRows([
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '20220503', col8: '20220503', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '20220503', col8: '20220503', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '20220503', col8: '20220503', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '20220503', col8: '20220503', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '20220503', col8: '20220503', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '20220503', col8: '20220503', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '20220503', col8: '20220503', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '20220503', col8: '20220503', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '20220503', col8: '20220503', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '20220503', col8: '20220503', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '20220503', col8: '20220503', col9: '김직원', col10: '김직원' },

  ]);
});
</script>

<style scoped>
</style>
