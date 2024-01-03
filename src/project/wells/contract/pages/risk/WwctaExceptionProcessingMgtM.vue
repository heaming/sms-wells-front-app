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
    <kw-search
      :cols="3"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ACEPT_PERIOD', undefined, '!적용기간')"
        >
          <template #label>
            <kw-select
              v-model="searchDtType"
              borderless
              :options="codes.SEARCH_DT_TYPE"
              @update:model-value="onUpdateSearchDtType"
            />
          </template>
          <kw-date-range-picker
            v-if="searchDtType === PERIOD"
            v-model:from="searchParams.strtDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_ACEPT_PERIOD')"
            rules="date_range_required"
          />
          <kw-date-picker
            v-if="searchDtType === BASE_DT"
            v-model="searchParams.baseDt"
            :label="$t('기준일자', undefined, '!기준일자')"
            rules="date_range_required"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_EX_PROCS_CD', undefined, '!예외 처리 구분')"
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
            maxlength="10"
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
            maxlength="10"
            rules="max:10|numeric"
            clearable
            @click-icon="onClickOpenCustomerSearchPopup"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_CNTR_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            disable-popup="true"
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
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />

      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import { defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import { useCtCode } from '~sms-common/contract/composable';

const dataService = useDataService();
const { getConfig } = useMeta();
const { t } = useI18n();
const { modal, notify } = useGlobal();
const { currentRoute } = useRouter();
const grdMainRef = ref(getComponentType('KwGrid'));
const now = dayjs();
const { codes, addCode } = await useCtCode(
  'COD_PAGE_SIZE_OPTIONS',
  'EX_PROCS_CD',
);

await addCode('STATUS', [{ codeId: 'N', codeName: t('MSG_TXT_LIMIT') }, { codeId: 'Y', codeName: t('MSG_TXT_PRMSN') }]);
const BASE_DT = 'baseDt';
const PERIOD = 'period';
await addCode('SEARCH_DT_TYPE', [
  { codeId: BASE_DT, codeName: t('기준일자') },
  { codeId: PERIOD, codeName: t('MSG_TXT_ACEPT_PERIOD', undefined, '!!적용기간') },
]);
const searchDtType = ref(BASE_DT);
let cachedParams;
const searchParams = ref({
  baseDt: now.format('YYYYMMDD'),
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
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

async function onClickOpenCustomerSearchPopup() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: {
      cstNo: searchParams.value.cstNo,
    },
  });
  if (result) {
    searchParams.value.cstNo = payload.cstNo;
  }
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contract-exceptions/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: exceptions, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(exceptions);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
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
  await gridUtil.insertRowAndFocus(view, 0, {
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
  const res = await dataService.get('/sms/wells/contract/contract-exceptions/excel-download', { params: cachedParams });

  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

function onUpdateSearchDtType(value) {
  if (value === BASE_DT) {
    searchParams.value.strtDt = undefined;
    searchParams.value.endDt = undefined;
    searchParams.value.baseDt = cachedParams?.baseDt || now.format('YYYYMMDD');
  }
  if (value === PERIOD) {
    searchParams.value.strtDt = cachedParams?.strtDt || now.startOf('month').format('YYYYMMDD');
    searchParams.value.endDt = cachedParams?.endDt || now.format('YYYYMMDD');
    searchParams.value.baseDt = undefined;
  }
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
      header: t('MSG_TXT_EX_PROCS_CD', undefined, '!예외 처리 구분'),
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
    {
      fieldName: 'exProcsDtlCn',
      header: t('MSG_TXT_MEMO'),
      width: 300,
      editor: {
        maxLength: 500,
      },
    },
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
    const { cstNo, prtnrNo, cntrNo } = g.getValues(itemIndex);
    if (column === 'cstNo') {
      const { result, payload } = await modal({
        component: 'ZwcsaCustomerListP',
        componentProps: {
          cstNo,
        },
      });
      if (result) {
        data.setValue(itemIndex, 'cstNo', payload.cstNo);
      }
    } else if (column === 'prtnrNo') {
      const { result, payload } = await modal({
        component: 'ZwogzPartnerListP',
        componentProps: {
          prtnrNo,
        },
      });
      if (result) {
        data.setValue(itemIndex, 'prtnrNo', payload.prtnrNo);
      }
    } else if (column === 'cntrNo') {
      const { result, payload } = await modal({
        component: 'WwctaContractNumberListP',
        componentProps: {
          cntrNo,
          // cntrSn: '1',
        },
      });
      if (result) {
        data.setValue(itemIndex, 'cntrNo', payload.cntrNo);
      }
    }
  };
});
</script>
