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
import { gridUtil, useDataService, getComponentType, useGlobal, useMeta, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { notify, modal } = useGlobal();

const dataService = useDataService();

const grdMainRef = ref(getComponentType('KwGrid'));
const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const codes = await codeUtil.getMultiCodes(
  'USE_YN',
);

let cachedParams;

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
const purchaseClassificationList = ref([
  { codeName: t('MSG_TXT_ALL'), codeId: 'A' },
  { codeName: t('MSG_TXT_SLS'), codeId: '7' },
  { codeName: t('MSG_TXT_EMP_SLS'), codeId: '8' },
  { codeName: t('MSG_TXT_EMP_PRCH'), codeId: '9' },
]);

const picClassificationList = ref([
  { codeName: t('MSG_TXT_ICHR_DV'), codeId: '0' },
  { codeName: t('MSG_TXT_DSGNTD_CMPNY_NUM'), codeId: '1' },
  { codeName: t('MSG_TXT_BM'), codeId: '2' },
  { codeName: t('MSG_TXT_BIZ_ICHR'), codeId: '3' },
  { codeName: t('MSG_TXT_REG_DIR'), codeId: '4' },
]);

// TODO uncomment this.
// onMounted(async () => {
//   approvalClassificationList.value = await dataService.get('/sms/wells/contract/contracts/approval-requests');
// });

function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {});
  view.showEditor();
}

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  console.log(cachedParams, pageInfo.value);
  const res = await dataService.get('sms/wells/contract/contracts/approval-standards/paging', { params: cachedParams });
  const { list: approvals, pageInfo: pagingResult } = res.data;
  const view = grdMainRef.value.getView();
  pageInfo.value = pagingResult;
  view.getDataSource().setRows(approvals);
  view.resetCurrent();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!gridUtil.validate(view, {})) { return; }
  notify('Data saved');
  const changedRows = gridUtil.getChangedRowValues(view);
  changedRows.map((ele) => {
    ele.dtaDlYn = 'N';
    ele.checkType = 'A';
    return ele;
  });
  await dataService.post('sms/wells/contract/contracts/approval-standards', changedRows);
  fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('sms/wells/contract/contracts/approval-standards/excel-download');

  await gridUtil.exportView(view, {
    fileName: 'approvalConfirmationList',
    timePostfix: true,
    exportData: res.data,
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
  console.log(deletedRows);
  if (deletedRows.length > 0) {
    await dataService.delete('sms/wells/contract/contracts/approval-standards', { data: deletedRows });
    fetchData();
  }
}

function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'cntrAprBaseId' },
    { fieldName: 'cntrAprAkDvCd' },
    { fieldName: 'cntrAprSellDvCd' },
    { fieldName: 'cntrAprChnlDvVal' },
    { fieldName: 'cntrAprIchrDvCd' },
    { fieldName: 'ichrUsrId' },
    { fieldName: 'psicNm' },
    { fieldName: 'vlStrtDtm' },
    { fieldName: 'vlEndDtm' },
    { fieldName: 'notyFwOjYn' },
  ];

  const columns = [
    { fieldName: 'cntrAprAkDvCd', header: t('MSG_TXT_APR_REQ_CAT'), width: '142', styleName: 'text-center', editable: false },
    { fieldName: 'cntrAprSellDvCd', header: t('MSG_TXT_SLS_CAT'), width: '142', styleName: 'text-center', editor: { type: 'list' }, options: purchaseClassificationList.value },
    { fieldName: 'cntrAprChnlDvVal', header: t('MSG_TXT_RSPBL_CHNL'), width: '180', styleName: 'text-center', editor: { type: 'text' }, editable: true },
    { fieldName: 'cntrAprIchrDvCd', header: t('MSG_TXT_ICHR_DV'), width: '142', styleName: 'text-center', editor: { type: 'list' }, options: picClassificationList.value },
    { fieldName: 'ichrUsrId', header: t('MSG_TXT_CNT_PER'), width: '180', styleName: 'text-center', editor: { type: 'text' } },
    { fieldName: 'psicNm', header: t('MSG_TXT_PIC_NM'), width: '180', styleName: 'text-center', editor: { type: 'text' } },
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_STRT_DT'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editor: { type: 'btdate' } },
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_END_DT'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editor: { type: 'btdate' } },
    { fieldName: 'notyFwOjYn', header: t('MSG_TXT_K_TLK_MAIL_TAR'), width: '142', styleName: 'text-center', editor: { type: 'list' }, options: codes.USE_YN },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
}
</script>
