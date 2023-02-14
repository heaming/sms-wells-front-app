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
                @click-icon="onClickIconOpenCustomerListPopup"
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
                :options="postCodeOptions"
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
          <kw-pagination
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :model-value="1"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
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

const postCodeOptions = ref([{ codeId: 1, codeName: '주소' }, { codeId: 2, codeName: '우편번호' }]);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function onClickIconOpenCustomerListPopup() {
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
  const res = await dataService.get('/sms/wells/contract/sales-limits/blacklists/paging', { params: cachedParams });

  const { list: partners, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(partners);
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
  changedRows[0].sellLmCntrSn = 1;
  await dataService.post('/sms/wells/contract/sales-limits/blacklists', changedRows);

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

const initGrid = defineGrid(async (data, view) => {
  const fields = [
    { fieldName: 'sellTpCd' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'sellLmRsonCn' },
    { fieldName: 'sellLmCntrNo' },
    { fieldName: 'dtaDlYn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'bryyMmdd' },
    { fieldName: 'cntrCralLocaraTno' },
    { fieldName: 'cntrLocaraTno' },
    { fieldName: 'cntrZip' },
    { fieldName: 'cntrAdr' },
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
  ];

  const columns = [
    { fieldName: 'sellTpCd', header: t('MSG_TXT_CONT_CLASS'), width: '142' },
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '180' },
    { fieldName: 'sellLmRsonCn', header: t('MSG_TXT_REASON'), width: '239' },
    { fieldName: 'sellLmCntrNo', header: t('MSG_TXT_KWK'), width: '180' },
    { fieldName: 'dtaDlYn', header: t('MSG_TXT_ACC_STATUS'), width: '126', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '180' },
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_BRYY_MMDD_ENTRP_NO'), width: '180' },
    { fieldName: 'cntrCralLocaraTno', header: t('MSG_TXT_MPNO'), width: '180' },
    { fieldName: 'cntrLocaraTno', header: t('MSG_TXT_TEL_NO'), width: '180' },
    { fieldName: 'cntrZip', header: t('MSG_TXT_ZIP'), width: '126' },
    { fieldName: 'cntrAdr', header: t('MSG_TXT_ADDR'), width: '254', styleName: 'text-center' },
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
  ];

  data.setFields(fields);
  await view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.editOptions.editable = true;
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  await view.setColumnLayout([
    'sellTpCd', 'cntrCstNo', 'sellLmRsonCn', 'sellLmCntrNo', 'dtaDlYn', // single
    {
      header: t('MSG_TXT_CNTR_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['cstKnm', 'bryyMmdd', 'cntrCralLocaraTno', 'cntrLocaraTno', 'cntrZip', 'cntrAdr'],
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
      items: ['propDateTime', 'propTyper', 'propModDateTime', 'propModifier'],
    },

  ]);
});

</script>
