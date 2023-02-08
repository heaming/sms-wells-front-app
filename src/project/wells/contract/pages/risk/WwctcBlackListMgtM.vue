<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwctcBlackListMgtM - 블랙리스트 관리
3. 작성자 : gs.bhavesh.n
4. 작성일 : 2023.01.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-블랙리스트 관리
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-tabs
      model-value="5"
    >
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
    <kw-tab-panels
      model-value="5"
    >
      <kw-tab-panel name="5">
        <kw-search
          :modified-targets="['blackListGrid']"
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item :label="$t('MSG_TXT_KWK')">
              <kw-input
                v-model="searchParams.contractNum"
                icon="search_24"
                @click-icon="openCustomerListPopUp"
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_CST_NO')">
              <kw-input v-model="searchParams.custNum" />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_CST_NM')">
              <kw-input v-model="searchParams.custName" />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item :label="$t('MSG_TXT_ADD_PST_CD')">
              <kw-select
                v-model="searchParams.postCode"
                class="w103"
                :model-value="[]"
                :options="['주소', 'B', 'C', 'D']"
              />
              <kw-input />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_MPNO')">
              <kw-input v-model="searchParams.phNum" />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_SELLER')">
              <kw-input v-model="searchParams.sellerInfo" />
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
              grid-action
              :label="$t('MSG_BTN_MOD')"
              @click="onClickEdit"
            />
            <kw-btn
              grid-action
              :label="$t('MSG_BTN_DEL')"
              @click="onClickDelete"
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
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              :disable="pageInfo.totalCount === 0"
              icon="download_on"
              dense
              secondary
              @click="onClickExcelDownload"
            />
          </kw-action-top>

          <kw-grid
            ref="grdMainRef"
            name="blackListGrid"
            :visible-rows="10"
            @init="initGrid"
          />
          <kw-action-bottom>
            <kw-btn
              label="수정"
              grid-action
              dense
            />
            <kw-btn
              label="삭제"
              grid-action
              dense
            />
            <kw-separator
              vertical
              inset
              spaced
            />
            <kw-btn
              label="해제취소"
              grid-action
            />
          </kw-action-bottom>
        </div>
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, useDataService, defineGrid, gridUtil, useMeta, getComponentType, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { getConfig } = useMeta();
const dataService = useDataService();
const { notify, modal } = useGlobal();
const { t } = useI18n();

const grdMainRef = ref(getComponentType('KwGrid'));

const searchParams = ref({
  custNum: '',
  contractNum: '',
  custName: '',
  postCode: '',
  phNum: '',
  sellerInfo: '',
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function onClickEdit() {
  const view = grdMainRef.value.getView();
  view.editOptions.editable = false;
  const selectedData = await gridUtil.getCheckedRowValues(view);
  if (selectedData.length === 0) {
    notify(t('MSG_ALT_MOD_NO_DATA'));
  } else if (selectedData.length > 1) {
    notify(t('MSG_ALT_SELT_ONE_ITEM'));
  } else {
    const selectedDataRow = selectedData[0].dataRow;
    view.editOptions.editable = true;
    view.onCellEditable = (grid, index) => {
      if (index.itemIndex !== selectedDataRow) { return false; }
    };
  }
}

async function openCustomerListPopUp() {
  const {
    result,
    payload,
  } = await modal({
    component: 'ZwcsaCustomerListP',
  });
  notify(JSON.stringify({
    result,
    payload,
  }));
}

let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/contract/blacklists/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'dataServiceManageList',
    timePostfix: true,
    exportData: response.data,
  });
}

function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {});
  view.editOptions.editable = true;
  view.onCellEditable = (grid, { itemIndex }) => {
    if (itemIndex !== 0) return false;
  };
}

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get('/sms/wells/contract/blacklists', { params: cachedParams });

  const { list: partners, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(partners);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/contract/blacklists', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  // deleteKeys needs to be updated as per API
  const deleteKeys = deletedRows.map((row) => row.dataRow);

  if (deleteKeys.length) {
    await dataService.delete('/sms/wells/contract/blacklists', { data: deleteKeys });
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cont_class' },
    { fieldName: 'custNum' },
    { fieldName: 'reason' },
    { fieldName: 'contractNum' },
    { fieldName: 'custName' },
    { fieldName: 'birthDate' },
    { fieldName: 'phNum' },
    { fieldName: 'telNo' },
    { fieldName: 'postCode' },
    { fieldName: 'address' },
    { fieldName: 'instCustName' },
    { fieldName: 'instPhNum' },
    { fieldName: 'instTelNo' },
    { fieldName: 'instPostCode' },
    { fieldName: 'instAddress' },
    { fieldName: 'sellerBranch' },
    { fieldName: 'sellerName' },
    { fieldName: 'sellerCompany' },
    { fieldName: 'sellerPhNum' },
    { fieldName: 'propDateTime' },
    { fieldName: 'propTyper' },
    { fieldName: 'propModDateTime' },
    { fieldName: 'propModifier' },
    { fieldName: 'propDelDate' },
    { fieldName: 'propDeleter' },

  ];

  const columns = [
    { fieldName: 'cont_class', header: t('MSG_TXT_CONT_CLASS'), width: '142' },
    { fieldName: 'custNum', header: t('MSG_TXT_CST_NO'), width: '180' },
    { fieldName: 'reason', header: t('MSG_TXT_REASON'), width: '239' },
    { fieldName: 'contractNum', header: t('MSG_TXT_KWK'), width: '180' },
    { fieldName: 'custName', header: t('MSG_TXT_CST_NM'), width: '180' },
    { fieldName: 'birthDate', header: t('MSG_TXT_BRYY_MMDD_ENTRP_NO'), width: '180' },
    { fieldName: 'phNum', header: t('MSG_TXT_MPNO'), width: '180' },
    { fieldName: 'telNo', header: t('MSG_TXT_TEL_NO'), width: '180' },
    { fieldName: 'postCode', header: t('MSG_TXT_ZIP'), width: '126' },
    { fieldName: 'address', header: t('MSG_TXT_ADDR'), width: '254', styleName: 'text-center' },
    { fieldName: 'instCustName', header: t('MSG_TXT_CST_NM'), width: '180' },
    { fieldName: 'instPhNum', header: t('MSG_TXT_MPNO'), width: '180' },
    { fieldName: 'instTelNo', header: t('MSG_TXT_TEL_NO'), width: '180' },
    { fieldName: 'instPostCode', header: t('MSG_TXT_ZIP'), width: '126' },
    { fieldName: 'instAddress', header: t('MSG_TXT_ADDR'), width: '254', styleName: 'text-center' },
    { fieldName: 'sellerBranch', header: t('MSG_TXT_SLR_BRCH'), width: '180' },
    { fieldName: 'sellerName', header: t('MSG_TXT_SELL_NM'), width: '180' },
    { fieldName: 'sellerCompany', header: t('MSG_TXT_COMPANY'), width: '180' },
    { fieldName: 'sellerPhNum', header: t('MSG_TXT_MPNO'), width: '180' },
    { fieldName: 'propDateTime', header: t('MSG_TXT_INP_DATE'), width: '169', datetimeFormat: 'datetime' },
    { fieldName: 'propTyper', header: t('MSG_TXT_TYPER'), width: '131', styleName: 'text-center' },
    { fieldName: 'propModDateTime', header: t('MSG_TXT_MDFC_DTM'), width: '169', datetimeFormat: 'datetime' },
    { fieldName: 'propModifier', header: t('MSG_TXT_MDFC_USR'), width: '131', styleName: 'text-center' },
    { fieldName: 'propDelDate', header: t('MSG_TXT_DEL_DATE'), width: '169' },
    { fieldName: 'propDeleter', header: t('MSG_TXT_DLT_USR'), width: '131', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'cont_class', 'custNum', 'reason', 'contractNum', // single
    {
      header: t('MSG_TXT_CNTR_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['custName', 'birthDate', 'phNum', 'telNo', 'postCode', 'address'],
    },
    {
      header: t('MSG_TXT_INST_INF'),
      direction: 'horizontal',
      items: ['instCustName', 'instPhNum', 'instTelNo', 'instPostCode', 'instAddress'],
    },
    {
      header: t('MSG_TXT_SELLER'),
      direction: 'horizontal',
      items: ['sellerBranch', 'sellerName', 'sellerCompany', 'sellerPhNum'],
    },
    {
      header: t('MSG_TXT_CHK_REG_INFO'), // colspan title
      direction: 'horizontal', // merge type
      items: ['propDateTime', 'propTyper', 'propModDateTime', 'propModifier', 'propDelDate', 'propDeleter'],
    },

  ]);

  data.setRows([
    { cont_class: '렌탈', custNum: '1234-1234567', reason: '판매자 불완전 판매 의심건수', contractNum: '123456789', custName: '123456789', birthDate: '123456789', phNum: '010-****-1234', telNo: '010-****-1234', postCode: '12345', address: '서울 중구 을지로 교원빌등...', instCustName: '123456789', instPhNum: '010-****-1234', instTelNo: '010-****-1234', instPostCode: '12345', instAddress: '서울 중구 을지로 교원빌등...', sellerBranch: '123456789', sellerName: '123456789', sellerCompany: '123456789', sellerPhNum: '010-****-1234', propDateTime: '2022-05-20', propTyper: '123456', propModDateTime: '2022-05-20', propModifier: '123456', propDelDate: '2022-05-20', propDeleter: '123456' },
    { cont_class: '렌탈', custNum: '1234-1234567', reason: '판매자 불완전 판매 의심건수', contractNum: '123456789', custName: '123456789', birthDate: '123456789', phNum: '010-****-1234', telNo: '010-****-1234', postCode: '12345', address: '서울 중구 을지로 교원빌등...', instCustName: '123456789', instPhNum: '010-****-1234', instTelNo: '010-****-1234', instPostCode: '12345', instAddress: '서울 중구 을지로 교원빌등...', sellerBranch: '123456789', sellerName: '123456789', sellerCompany: '123456789', sellerPhNum: '010-****-1234', propDateTime: '2022-05-20', propTyper: '123456', propModDateTime: '2022-05-20', propModifier: '123456', propDelDate: '2022-05-20', propDeleter: '123456' },
    { cont_class: '렌탈', custNum: '1234-1234567', reason: '판매자 불완전 판매 의심건수', contractNum: '123456789', custName: '123456789', birthDate: '123456789', phNum: '010-****-1234', telNo: '010-****-1234', postCode: '12345', address: '서울 중구 을지로 교원빌등...', instCustName: '123456789', instPhNum: '010-****-1234', instTelNo: '010-****-1234', instPostCode: '12345', instAddress: '서울 중구 을지로 교원빌등...', sellerBranch: '123456789', sellerName: '123456789', sellerCompany: '123456789', sellerPhNum: '010-****-1234', propDateTime: '2022-05-20', propTyper: '123456', propModDateTime: '2022-05-20', propModifier: '123456', propDelDate: '2022-05-20', propDeleter: '123456' },
    { cont_class: '렌탈', custNum: '1234-1234567', reason: '판매자 불완전 판매 의심건수', contractNum: '123456789', custName: '123456789', birthDate: '123456789', phNum: '010-****-1234', telNo: '010-****-1234', postCode: '12345', address: '서울 중구 을지로 교원빌등...', instCustName: '123456789', instPhNum: '010-****-1234', instTelNo: '010-****-1234', instPostCode: '12345', instAddress: '서울 중구 을지로 교원빌등...', sellerBranch: '123456789', sellerName: '123456789', sellerCompany: '123456789', sellerPhNum: '010-****-1234', propDateTime: '2022-05-20', propTyper: '123456', propModDateTime: '2022-05-20', propModifier: '123456', propDelDate: '2022-05-20', propDeleter: '123456' },
    { cont_class: '렌탈', custNum: '1234-1234567', reason: '판매자 불완전 판매 의심건수', contractNum: '123456789', custName: '123456789', birthDate: '123456789', phNum: '010-****-1234', telNo: '010-****-1234', postCode: '12345', address: '서울 중구 을지로 교원빌등...', instCustName: '123456789', instPhNum: '010-****-1234', instTelNo: '010-****-1234', instPostCode: '12345', instAddress: '서울 중구 을지로 교원빌등...', sellerBranch: '123456789', sellerName: '123456789', sellerCompany: '123456789', sellerPhNum: '010-****-1234', propDateTime: '2022-05-20', propTyper: '123456', propModDateTime: '2022-05-20', propModifier: '123456', propDelDate: '2022-05-20', propDeleter: '123456' },
    { cont_class: '렌탈', custNum: '1234-1234567', reason: '판매자 불완전 판매 의심건수', contractNum: '123456789', custName: '123456789', birthDate: '123456789', phNum: '010-****-1234', telNo: '010-****-1234', postCode: '12345', address: '서울 중구 을지로 교원빌등...', instCustName: '123456789', instPhNum: '010-****-1234', instTelNo: '010-****-1234', instPostCode: '12345', instAddress: '서울 중구 을지로 교원빌등...', sellerBranch: '123456789', sellerName: '123456789', sellerCompany: '123456789', sellerPhNum: '010-****-1234', propDateTime: '2022-05-20', propTyper: '123456', propModDateTime: '2022-05-20', propModifier: '123456', propDelDate: '2022-05-20', propDeleter: '123456' },
    { cont_class: '렌탈', custNum: '1234-1234567', reason: '판매자 불완전 판매 의심건수', contractNum: '123456789', custName: '123456789', birthDate: '123456789', phNum: '010-****-1234', telNo: '010-****-1234', postCode: '12345', address: '서울 중구 을지로 교원빌등...', instCustName: '123456789', instPhNum: '010-****-1234', instTelNo: '010-****-1234', instPostCode: '12345', instAddress: '서울 중구 을지로 교원빌등...', sellerBranch: '123456789', sellerName: '123456789', sellerCompany: '123456789', sellerPhNum: '010-****-1234', propDateTime: '2022-05-20', propTyper: '123456', propModDateTime: '2022-05-20', propModifier: '123456', propDelDate: '2022-05-20', propDeleter: '123456' },
    { cont_class: '렌탈', custNum: '1234-1234567', reason: '판매자 불완전 판매 의심건수', contractNum: '123456789', custName: '123456789', birthDate: '123456789', phNum: '010-****-1234', telNo: '010-****-1234', postCode: '12345', address: '서울 중구 을지로 교원빌등...', instCustName: '123456789', instPhNum: '010-****-1234', instTelNo: '010-****-1234', instPostCode: '12345', instAddress: '서울 중구 을지로 교원빌등...', sellerBranch: '123456789', sellerName: '123456789', sellerCompany: '123456789', sellerPhNum: '010-****-1234', propDateTime: '2022-05-20', propTyper: '123456', propModDateTime: '2022-05-20', propModifier: '123456', propDelDate: '2022-05-20', propDeleter: '123456' },
    { cont_class: '렌탈', custNum: '1234-1234567', reason: '판매자 불완전 판매 의심건수', contractNum: '123456789', custName: '123456789', birthDate: '123456789', phNum: '010-****-1234', telNo: '010-****-1234', postCode: '12345', address: '서울 중구 을지로 교원빌등...', instCustName: '123456789', instPhNum: '010-****-1234', instTelNo: '010-****-1234', instPostCode: '12345', instAddress: '서울 중구 을지로 교원빌등...', sellerBranch: '123456789', sellerName: '123456789', sellerCompany: '123456789', sellerPhNum: '010-****-1234', propDateTime: '2022-05-20', propTyper: '123456', propModDateTime: '2022-05-20', propModifier: '123456', propDelDate: '2022-05-20', propDeleter: '123456' },
  ]);
});

</script>
