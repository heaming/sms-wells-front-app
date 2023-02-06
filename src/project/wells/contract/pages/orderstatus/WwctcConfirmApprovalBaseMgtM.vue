<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwctcConfirmApprovalBaseMgtM - 웰스 확인 승인 표준 관리
3. 작성자 : gs.anil.rawat
4. 작성일 : 2023.01.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 웰스 확인 승인 표준 관리
****************************************************************************************************
--->

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
                :options="approvalClassificationList"
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
              <kw-paging-info :total-count="pageInfo.totalCount " />
            </template>
            <kw-btn
              :label="t('MSG_BTN_DEL')"
              grid-action
              dense
              @click="onClickRemove"
            />
            <kw-separator
              spaced
              vertical
              inset
            />
            <kw-btn
              dense
              :label="t('MSG_BTN_ROW_ADD')"
              @click="onClickAdd"
            />

            <kw-btn
              dense
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
              :disable="pageInfo.totalCount === 0"
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
              :label="t('MSG_BTN_CNFM_CRTR_MGT')"
              @click="onClickConfirmCriteriaMangement"
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
import { gridUtil, useDataService, getComponentType, useGlobal, useMeta } from 'kw-lib';

const { t } = useI18n();
const { notify, modal } = useGlobal();
const dataService = useDataService();

const grdMainRef = ref(getComponentType('KwGrid'));
const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const searchParams = ref({
  baseDt: '',
  approvalRequestCategory: '',
  isApprovalRequestCategoryValid: true,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const approvalClassificationList = ref([]);

// TODO Uncomment when Api starts working
// onMounted(async () => {
//   approvalClassificationList.value = await dataService.get('/sms/wells/contract/contracts/approval-requests');
// });

function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {});
  view.showEditor();
}

async function fetchData() {
  const view = grdMainRef.value.getView();
  // TODO uncomment api and replace dummy data by res.data.
  // const res = await dataService.get('sms/wells/contract/cnfm-apr-base-mngts/paging');
  view.getDataSource().setRows([
    { col1: 'A-전체', col2: ' ', col3: '0-담당없음', col4: '사번입력', col5: ' ', col6: '2022-05-03', col7: '2022-05-03', col8: 'Y' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '20220520', col7: '20220520', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '20220520', col7: '20220520', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '20220520', col7: '20220520', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '20220520', col7: '20220520', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '20220520', col7: '20220520', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '20220520', col7: '20220520', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '20220520', col7: '20220520', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '20220520', col7: '20220520', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '20220520', col7: '20220520', col8: 'N' },
  ]);
  pageInfo.value.totalCount = 10;
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!gridUtil.validate(view, {})) { return; }
  notify('Data saved');
  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('sms/wells/contract/cnfm-apr-base-mngts', changedRows);
  fetchData();
}

async function onClickExcelDownload() {
  const view = await dataService.get('sms/wells/contract/cnfm-apr-base-mngts/excel-download');

  await gridUtil.exportView(view, {
    fileName: 'postApprovalList',
    timePostfix: true,
  });
}

async function onClickConfirmCriteriaMangement() {
  const {
    result,
    payload,
  } = await modal({
    component: 'WwctcConfirmApprovalBaseListP',
  });
  notify(JSON.stringify({
    result,
    payload,
  }));
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    await dataService.delete('sms/wells/contract/cnfm-apr-base-mngts', deletedRows);
    fetchData();
  }
}

function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  fetchData();
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
    { fieldName: 'col2', header: t('MSG_TXT_RSPBL_CHNL'), width: '180', styleName: 'text-center', editor: { type: 'text' }, editable: true },
    { fieldName: 'col3', header: t('MSG_TXT_ICHR_DV'), width: '142', styleName: 'text-center', editor: { type: 'text' } },
    { fieldName: 'col4', header: t('MSG_TXT_CNT_PER'), width: '180', styleName: 'text-center', editor: { type: 'text' } },
    { fieldName: 'col5', header: t('MSG_TXT_PIC_NM'), width: '180', styleName: 'text-center', editor: { type: 'text' } },
    { fieldName: 'col6', header: t('MSG_TXT_STRT_DT'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editor: { type: 'btdate' } },
    { fieldName: 'col7', header: t('MSG_TXT_END_DT'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editor: { type: 'btdate' } },
    { fieldName: 'col8', header: t('MSG_TXT_K_TLK_MAIL_TAR'), width: '142', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
}
</script>
