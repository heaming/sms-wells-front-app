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
            <kw-search-item
              :label="t('MSG_TXT_BASE_DT')"
              required
            >
              <kw-date-picker
                v-model="searchParams.standardDt"
                rules="required"
                :name="t('MSG_TXT_BASE_DT')"
                @change="fetchAprCodes"
              />
            </kw-search-item>
            <kw-search-item
              :label="t('MSG_TXT_APR_REQ_CAT')"
              required
            >
              <kw-select
                v-model="searchParams.cntrAprAkDvCd"
                rules="required"
                :name="t('MSG_TXT_APR_REQ_CAT')"
                :options="aprAkDvcodes"
                :placeholder="$t('MSG_TXT_BEFORE_SELECT_IT',[$t('MSG_TXT_APR_REQ_CAT')])"
                option-value="cntrAprAkDvCd"
                option-label="cntrAprAkDvCdNm"
              />
            </kw-search-item>
            <kw-search-item :label="t('MSG_TXT_APR_REQ_CAT')">
              <kw-field>
                <kw-checkbox
                  v-model="searchParams.aprReqCtgValid"
                  :label="t('MSG_TXT_LKUP_VLD_VAL')"
                  :true-value="true"
                  :false-value="false"
                />
              </kw-field>
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
                @change="onClickSearch"
              />
            </template>
            <kw-btn
              v-permission:delete
              grid-action
              dense
              :label="t('MSG_BTN_DEL')"
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
              v-permission:create
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
            :visible-rows="pageInfo.pageSize - 1"
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
import { gridUtil, getComponentType, useGlobal, useMeta, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const now = dayjs();
const dataService = useDataService();
const { t } = useI18n();
const { notify, modal } = useGlobal();

const grdMainRef = ref(getComponentType('KwGrid'));
const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const searchParams = ref({
  standardDt: now.format('YYYYMMDD'),
  cntrAprAkDvCd: '',
  aprReqCtgValid: false,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'CNTR_APR_SELL_DV_CD',
  'CNTR_APR_ICHR_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const cntrYnCodes = ref([
  { codeId: 'Y', codeName: 'Y' },
  { codeId: 'N', codeName: 'N' },
]);

const aprAkDvcodes = ref();

let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/contract/contracts/approval-standards/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: 'confirmApprovalBaseManageList',
    timePostfix: true,
    exportData: response.data,
  });
}

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/contract/contracts/approval-standards/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  // const pages = res.data.list;
  // totalCount.value = res.data.pageInfo.totalCount;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(pages);
  dataSource.checkRowStates(true);
}

async function fetchAprCodes() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/contract/contracts/approval-request-standards', { params: cachedParams });
  aprAkDvcodes.value = res.data;
}

async function onClickConfirmCriteriaMangement() {
  await modal({
    component: 'WwctcConfirmApprovalBaseListP',
    componentProps: { standardDt: searchParams.value.standardDt },
  });
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  // deleteKeys needs to be updated as per API
  const deleteKeys = deletedRows.map((row) => row);

  if (deleteKeys.length) {
    await dataService.delete('/sms/wells/contract/contracts/approval-standards', { data: deleteKeys });
    await fetchData();
  }
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else {
    await dataService.post('/sms/wells/contract/contracts/approval-standards', chkRows);
  }

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

function onClickAdd() {
  if (isEmpty(searchParams.value.cntrAprAkDvCd)) { return; }

  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    cntrAprAkDvCd: searchParams.value.cntrAprAkDvCd,
  });

  view.showEditor();
}

await fetchAprCodes();

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'cntrAprSellDvCd' },
    { fieldName: 'cntrAprChnlDvVal' },
    { fieldName: 'cntrAprIchrDvCd' },
    { fieldName: 'ichrUsrId' },
    { fieldName: 'psicNm' },
    { fieldName: 'vlStrtDtm' },
    { fieldName: 'vlEndDtm' },
    { fieldName: 'notyFwOjYn' },
    { fieldName: 'cntrAprBaseId' },
    { fieldName: 'cntrAprAkDvCd' },
  ];

  const columns = [
    { fieldName: 'cntrAprSellDvCd', header: t('MSG_TXT_APR_REQ_CAT'), width: '142', styleName: 'text-center', editor: { type: 'list' }, options: codes.CNTR_APR_SELL_DV_CD },
    { fieldName: 'cntrAprChnlDvVal', header: t('MSG_TXT_RSPBL_CHNL'), width: '180', editor: { type: 'text' } },
    { fieldName: 'cntrAprIchrDvCd', header: t('MSG_TXT_ICHR_DV'), width: '142', styleName: 'text-center', editor: { type: 'list' }, options: codes.CNTR_APR_ICHR_DV_CD },
    { fieldName: 'ichrUsrId', header: t('MSG_TXT_CNT_PER'), width: '180', styleName: 'text-center rg-button-icon--search', button: 'action', editor: { type: 'text' } },
    { fieldName: 'psicNm', header: t('MSG_TXT_PIC_NM'), width: '180', editor: { type: 'text' }, styleName: 'text-center', editable: false },
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_STRT_DT'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editor: { type: 'btdate' } },
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_END_DT'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editor: { type: 'btdate' } },
    { fieldName: 'notyFwOjYn', header: t('MSG_TXT_K_TLK_MAIL_TAR'), width: '142', styleName: 'text-center', editor: { type: 'list' }, options: cntrYnCodes.value },
    { fieldName: 'cntrAprBaseId', visible: false },
    { fieldName: 'cntrAprAkDvCd', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onScrollToBottom = (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      fetchData();
    }
  };
  view.onCellButtonClicked = async (g, { column }) => {
    if (column === 'ichrUsrId') {
      alert('공통팝업(임직원 조회) 추가 후 수정예정');
      /*
      TODO: 공통팝업(임직원 조회) 추가 후 수정예정
      await modal({
        component: 'WwctaContractNumberListP',
      });
      */
    }
  };
}
</script>
