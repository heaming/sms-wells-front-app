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
          :cols="3"
          :modified-targets="['grdMain']"
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_ACEPT_PERIOD')"
              required
            >
              <kw-date-range-picker
                v-model:from="searchParams.strtDt"
                v-model:to="searchParams.endDt"
                :label="$t('MSG_TXT_ACEPT_PERIOD')"
                rules="date_range_required"
              />
            </kw-search-item>

            <kw-search-item
              :label="$t('MSG_TXT_EX_PROCS_CD')"
            >
              <kw-select
                v-model="searchParams.exProcsCd"
                :options="codes.EX_PROCS_CD"
                first-option="all"
              />
            </kw-search-item>

            <kw-search-item
              :label="$t('MSG_TXT_PRTNR_NO')"
            >
              <kw-input
                v-model="searchParams.prtnrNo"
                :label="$t('MSG_TXT_PRTNR_NO')"
                icon="search"
                rules="max:10|numeric"
                clearable
                @click-icon="onClickOpenEmployeeSearchPopup"
              />
            </kw-search-item>
          </kw-search-row>

          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_CST_NO')"
            >
              <kw-input
                v-model="searchParams.cstNo"
                :label="$t('MSG_TXT_CST_NO')"
                icon="search"
                rules="max:10|numeric"
                clearable
                @click-icon="onClickOpenCustomerSearchPopup"
              />
            </kw-search-item>

            <kw-search-item
              :label="$t('MSG_TXT_CNTR_NO')"
            >
              <kw-input
                v-model="searchParams.cntrNo"
                rules="max:15"
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
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();

const { getConfig } = useMeta();
const { t } = useI18n();
const { modal, notify } = useGlobal();

const grdMainRef = ref(getComponentType('KwGrid'));

const now = dayjs();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'EX_PROCS_CD',
);
codes.STATUS = [{ codeId: 'N', codeName: t('MSG_TXT_LIMIT') }, { codeId: 'Y', codeName: t('MSG_TXT_PRMSN') }];

let cachedParams;
const searchParams = ref({
  strtDt: now.startOf('month').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  exProcsCd: '',
  prtnrNo: '',
  cstNo: '',
  cntrNo: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function onClickOpenEmployeeSearchPopup() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
  });
  if (result) {
    searchParams.prtnrNo(payload.prtnrNo);
  }
}

async function onClickOpenCustomerSearchPopup() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
  });
  if (result) {
    searchParams.cstNo(payload.cstNo);
  }
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contract-exceptions/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: exceptions, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(exceptions);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  const exProcsIds = deletedRows.map((row) => row.exProcsId);

  if (exProcsIds.length > 0) {
    await dataService.delete('/sms/wells/contract/contract-exceptions', { data: exProcsIds });
    await fetchData();
  }
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    dtaDlYn: 'N',
    vlStrtDtm: now.format('YYYYMMDD'),
  });
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/contract/contract-exceptions', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickExcelDownload() {
  const res = await dataService.get('/sms/wells/contract/contract-exceptions/excel-download');

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
    { fieldName: 'exProcsId' },
    { fieldName: 'exProcsCd' },
    { fieldName: 'cstNo' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'cntrNo' },
    { fieldName: 'dtaDlYn' },
    { fieldName: 'exProcsDtlCn' },
    { fieldName: 'vlStrtDtm' },
    { fieldName: 'vlEndDtm' },
    { fieldName: 'fstRgstUsrNm' },
    { fieldName: 'fnlMdfcUsrNm' },
    { fieldName: 'fnlMdfcDtm' },
  ];

  const columns = [
    { fieldName: 'exProcsCd',
      header: t('MSG_TXT_SLS_CAT'),
      width: 250,
      options: codes.EX_PROCS_CD,
      required: true,
      rules: 'required',
      editor: {
        type: 'list',
      },
    },
    {
      fieldName: 'cstNo',
      header: t('MSG_TXT_CST_NO'),
      width: 150,
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      editor: {
        maxLength: 10,
      },
    },
    {
      fieldName: 'prtnrNo',
      header: t('MSG_TXT_PRTNR_NO'),
      width: 150,
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      editable: false,
    },
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_NO'),
      width: 150,
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      editor: {
        maxLength: 12,
      },
    },
    {
      fieldName: 'dtaDlYn',
      header: t('MSG_TXT_RESTRICTION_CLASSIFICATION'),
      width: 80,
      styleName: 'text-center',
      options: codes.STATUS,
      editor: {
        type: 'list',
      },
    },
    { fieldName: 'exProcsDtlCn', header: t('MSG_TXT_MEMO'), width: 300 },
    {
      fieldName: 'vlStrtDtm',
      header: t('MSG_TXT_STRT_DT'),
      width: 130,
      styleName: 'text-center',
      datetimeFormat: 'date',
      editor: { type: 'btdate' },
      required: true,
      rules: 'required',
    },
    {
      fieldName: 'vlEndDtm',
      header: t('MSG_TXT_END_DT'),
      width: 130,
      styleName: 'text-center',
      datetimeFormat: 'date',
      editor: { type: 'btdate' },
      required: true,
      rules: 'required',
    },
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: 120, styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_MDFC_USR'), width: 120, styleName: 'text-center', editable: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  view.onCellButtonClicked = async (g, { column, itemIndex }) => {
    if (column === 'cstNo') {
      const { result: isChanged, payload: employeeDetails } = await modal({
        component: 'ZwogcPartnerListP',
      });

      if (isChanged) {
        data.setValue(itemIndex, 'cstNo', employeeDetails.prtnrNo);
      }
    }
    if (column === 'prtnrNo') {
      const { result, payload } = await modal({
        component: 'ZwcsaCustomerListP',
      });
      if (result) {
        data.setValue(itemIndex, 'prtnrNo', payload.cstNo);
      }
    }
  };
});
</script>
