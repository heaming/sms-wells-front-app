<template>
  <kw-page>
    <kw-tabs
      model-value="1"
    >
      <kw-tab
        name="1"
        :label="t('MSG_TXT_APRV_CRTE_MGT')"
      />
      <kw-tab
        name="2"
        :label="t('MSG_TXT_EXCP_HAND_MGT')"
      />
      <kw-tab
        name="3"
        :label="t('MSG_TXT_BIZ_SUBS_RES_MGT')"
      />
      <kw-tab
        name="4"
        :label="t('MSG_TXT_USR_SLS_RES_MGT')"
      />
      <kw-tab
        name="5"
        :label="t('MSG_TXT_BLKLST_MGT')"
      />
    </kw-tabs>
    <kw-tab-panels
      model-value="1"
    >
      <kw-tab-panel name="1">
        <kw-search
          :modified-targets="['approvalBaseGrid']"
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item :label="t('MSG_TXT_BASE_DT')">
              <kw-date-picker v-model="searchParams.baseDt" />
            </kw-search-item>
            <kw-search-item :label="t('MSG_TXT_APR_REQ_CAT')">
              <kw-select
                v-model="searchParams.approvalRequestCategory"
                :options="['승인요청구분을 선택헤주세요', 'B', 'C', 'D']"
              />
            </kw-search-item>
            <kw-search-item :label="t('MSG_TXT_APR_REQ_CAT')">
              <kw-field
                v-model="searchParams.isApprovalRequestCategoryValid"
              >
                <template #default="{ field }">
                  <kw-checkbox
                    v-bind="field"
                    :label="t('MSG_TXT_LKUP_VLD_VAL')"
                    val=""
                  />
                </template>
              </kw-field>
            </kw-search-item>
          </kw-search-row>
        </kw-search>
        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info total-count="7" />
            </template>
            <kw-btn
              :label="t('MSG_BTN_MOD')"
              grid-action
              dense
              @click="onClickModify()"
            />
            <kw-btn
              :label="t('MSG_BTN_DEL')"
              grid-action
              dense
              @click="onClickRemove()"
            />
            <kw-separator
              spaced
              vertical
              inset
            />
            <kw-btn
              dense
              :label="t('MSG_BTN_ROW_ADD')"
              @click="onClickAdd()"
            />

            <kw-btn
              dense
              :label="t('MSG_BTN_SAVE')"
              @click="onClickSave()"
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
              @click="onClickExcelDownload"
            />
            <kw-separator
              spaced
              vertical
              inset
            />
            <kw-btn
              primary
              dense
              :label="t('MSG_TXT_CNFM_CRTR_MGT')"
            />
          </kw-action-top>

          <kw-grid
            ref="grdMainRef"
            name="approvalBaseGrid"
            :visible-rows="10"
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
import { gridUtil, getComponentType, useGlobal } from 'kw-lib';

const { t } = useI18n();
const { notify } = useGlobal();

const grdMainRef = ref(getComponentType('KwGrid'));

const searchParams = ref({
  baseDt: '',
  approvalRequestCategory: '',
  isApprovalRequestCategoryValid: true,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, {
    col1: '',
    col2: '',
    col3: '',
    col4: '',
    col5: '',
    col6: '2023-01-23',
    col7: '2023-01-23',
    col8: '',
  }, 'col1');
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!gridUtil.validate(view, {})) { return; }
  notify('Data saved');
  const changedRows = gridUtil.getChangedRowValues(view);
  notify(changedRows);
  // TODO integrate save api
}

function onClickExcelDownload() {
  // TODO integrate excel download api
}

function fetchData() {
  const view = grdMainRef.value.getView();
  // TODO integrate Get api call.
  view.getDataSource().setRows([
    { col1: 'A-전체', col2: ' ', col3: '0-담당없음', col4: '사번입력', col5: ' ', col6: '2022-05-03', col7: '2022-05-03', col8: 'Y' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
  ]);
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    // TODO integrate delete api
  }
}

function onClickSearch() {
  fetchData();
}

async function onClickModify() {
  const view = grdMainRef.value.getView();
  view.editOptions.editable = false;
  const selectedData = await gridUtil.getCheckedRowValues(view);
  if (selectedData.length !== 1) {
    notify(t('MSG_ALT_MOD_NO_DATA'));
    return;
  }
  const selectedDataRow = selectedData[0].dataRow;
  view.editOptions.editable = true;
  view.onCellEditable = (grid, index) => {
    if (index.itemIndex !== selectedDataRow) { return false; }
  };
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_APR_REQ_CAT'), width: '142', styleName: 'text-center', editable: false },
    { fieldName: 'col2', header: t('MSG_TXT_RSPBL_CHNL'), width: '180', styleName: 'text-center', editor: { type: 'text' } },
    { fieldName: 'col3', header: t('MSG_TXT_ICHR_DV'), width: '142', styleName: 'text-center', editor: { type: 'text' } },
    { fieldName: 'col4', header: t('MSG_TXT_CNT_PER'), width: '180', styleName: 'text-center', editor: { type: 'text' } },
    { fieldName: 'col5', header: t('MSG_TXT_PIC_NM'), width: '180', styleName: 'text-center', editor: { type: 'text' } },
    { fieldName: 'col6', header: t('MSG_TXT_STRT_DT'), width: '196', styleName: 'text-center', editor: { type: 'date' }, datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col7', header: t('MSG_TXT_END_DT'), width: '196', styleName: 'text-center', editor: { type: 'date' }, datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col8', header: t('MSG_TXT_K_TLK_MAIL_TAR'), width: '142', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
}

</script>
