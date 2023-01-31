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
    <kw-tabs model-value="2">
      <kw-tab
        name="1"
        :label="$t('MSG_TXT_APRV_CRTE_MGT')"
      />
      <kw-tab
        name="2"
        :label="$t('MSG_TXT_EXCP_HAND_MGT')"
      />
      <kw-tab
        name="3"
        :label="$t('MSG_TXT_BIZ_SUBS_RES_MGT')"
      />
      <kw-tab
        name="4"
        :label="$t('MSG_TXT_USR_SLS_RES_MGT')"
      />
      <kw-tab
        name="5"
        :label="$t('MSG_TXT_BLKLST_MGT')"
      />
    </kw-tabs>
    <kw-tab-panels model-value="2">
      <kw-tab-panel name="2">
        <kw-search
          :cols="2"
          :modified-targets="['grdMain']"
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item :label="$t('MSG_TXT_ACEPT_PERIOD')">
              <kw-date-range-picker
                v-model:from="searchParams.startDt"
                v-model:to="searchParams.endDt"
                rules="date_range_months:1"
              />
            </kw-search-item>

            <kw-search-item :label="$t('MSG_TXT_PTNR_NO')">
              <kw-input
                icon="search"
                clearable
                @click-icon="openEmployeeSearchPopup"
              />
            </kw-search-item>
          </kw-search-row>

          <kw-search-row>
            <kw-search-item :label="$t('MSG_TXT_CST_NO')">
              <kw-input
                icon="search"
                clearable
                @click-icon="openCustomerSearchPopup"
              />
            </kw-search-item>

            <kw-search-item :label="$t('MSG_TXT_CNTR_NO')">
              <kw-input />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info :total-count="pageInfo.totalCount" />
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
        </div>
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import dayjs from 'dayjs';

const dataService = useDataService();
console.log(dataService);

const { getConfig } = useMeta();
const { t } = useI18n();
const { modal } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const now = dayjs();

const searchParams = ref({
  startDt: now.startOf('month').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
});

const pageInfo = ref({
  totalCount: 0,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function openEmployeeSearchPopup() {
  await modal({
    component: 'ZwogaOrganizationListP',
  });

  // if (isChanged) {
  //   notify(t('MSG_ALT_REGISTERED'));
  //   await fetchData();
  // }
}

async function openCustomerSearchPopup() {
  await modal({
    component: 'ZwcsaCustomerListP',
  });

  // if (isChanged) {
  //   notify(t('MSG_ALT_REGISTERED'));
  //   await fetchData();
  // }
}

async function fetchData() {
  // to implement after getting api
}

async function onClickSearch() {
  // to implement after getting api

  await fetchData();
}

// async function onClickModify() {
//   // to implement after getting api
// }

async function onClickRemove() {
  // to implement after getting api

  // const view = grdMainRef.value.getView();
  // if (!await gridUtil.confirmIfIsModified(view)) { return; }

  // const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  // const storeUids = deletedRows.map((row) => row.storeUid);

  // if (storeUids.length > 0) {
  //   await dataService.delete('/sflex/common/common/stores', { params: { storeUids } });
  await fetchData();
  // }
}

async function onClickAdd() {
  // to implement after getting api

  // const view = grdMainRef.value.getView();
  // if (!await gridUtil.confirmIfIsModified(view)) { return; }

  // const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  // const storeUids = deletedRows.map((row) => row.storeUid);

  // if (storeUids.length > 0) {
  //   await dataService.delete('/sflex/common/common/stores', { params: { storeUids } });
  await fetchData();
  // }
}

async function onClickSave() {
  // to implement after getting api

  // const view = grdMainRef.value.getView();
  // if (await gridUtil.alertIfIsNotModified(view)) { return; }
  // if (!await gridUtil.validate(view)) { return; }

  // const changedRows = gridUtil.getChangedRowValues(view);
  // await dataService.post('/sflex/common/common/stores', changedRows);

  // await notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: 'exceptionProcessingList',
    timePostfix: true,
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
    { fieldName: 'col1', header: t('MSG_TXT_SLS_CAT'), width: '289' },
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
    { fieldName: 'col5', header: t('MSG_TXT_RESTRICTION_CLASSIFICATION'), width: '142', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_MEMO'), width: '404', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_STRT_DT'), width: '196', styleName: 'text-center', editor: { type: 'btdate' } },
    { fieldName: 'col8', header: t('MSG_TXT_END_DT'), width: '196', styleName: 'text-center', editor: { type: 'btdate' } },
    { fieldName: 'col9', header: t('MSG_TXT_FST_RGST_USR'), width: '180', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_MDFC_USR'), width: '180', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  // Will update the fields when api available
  view.onCellButtonClicked = async (g, { column }) => {
    if (column === 'col2') {
      openEmployeeSearchPopup();
    }
    if (column === 'col3') {
      openCustomerSearchPopup();
    }
  };

  data.setRows([
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },

  ]);
});
</script>

<style scoped>
</style>
