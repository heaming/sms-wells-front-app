<!----
    ****************************************************************************************************
    * 프로그램 개요
    ****************************************************************************************************
    1. 모듈 : CTC
    2. 프로그램 ID : WwctcEntrepreneurJoinLimitOjMgtM - 사업자가입제한관리 관리
    3. 작성자 : gs.ritvik.m
    4. 작성일 : 2023.01.26
    ****************************************************************************************************
    * 프로그램 설명
    ****************************************************************************************************
    - 사업자가입제한관리 화면
    ****************************************************************************************************
    --->
<template>
  <kw-page>
    <kw-tabs
      model-value="3"
    >
      <kw-tab
        name="1"
        label="확정승인기준관리"
      />
      <kw-tab
        name="2"
        label="예외처리관리"
      />
      <kw-tab
        name="3"
        label="사업자가입제한관리"
      />
      <kw-tab
        name="4"
        label="사용자판매제한관리"
      />
      <kw-tab
        name="5"
        label="블랙리스트관리"
      />
    </kw-tabs>
    <kw-tab-panels
      model-value="3"
    >
      <kw-tab-panel name="3">
        <kw-search
          :modified-targets="['grdMain']"
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item :label="$t('MSG_TXT_OCCUR_DATE')">
              <kw-date-range-picker
                v-model:from="searchParams.sellLmOcStm"
                v-model:to="searchParams.sellLmOcDtm"
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_ENTRP_NO')">
              <kw-input
                v-model="searchParams.sellLmBzrno"
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_BSN_NM')">
              <kw-input
                v-model="searchParams.dlpnrNm"
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
                @change="onClickSearch"
              />
            </template>
            <kw-btn
              v-permission:delete
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
              v-permission:create
              grid-action
              :label="$t('MSG_BTN_ROW_ADD')"
              @click="onClickAdd"
            />
            <kw-btn
              v-permission:update
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
              secondary
              dense
              :label="$t('MSG_BTN_FILE_UPLOAD_FORM')"
            />
            <kw-file
              v-show="false"
              ref="excelFileRef"
              v-model="excelUploadfiles"
              :updatable="false"
              @update:model-value="onClickExcelUpload2"
            />
            <kw-btn
              v-permission:create
              icon="upload_on"
              secondary
              dense
              :label="$t('MSG_BTN_FILE_UPLOAD')"
              @click="onClickExcelUpload"
            />
            <kw-btn
              icon="download_on"
              dense
              secondary
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              :disable="(pageInfo.totalCount === 0)"
              @click="onClickExcelDownload"
            />
          </kw-action-top>

          <kw-grid
            ref="grdMainRef"
            name="grdMain"
            :visible-rows="pageInfo.pageSize - 1"
            @init="initGrdMain"
          />
          <kw-action-bottom>
            <kw-btn
              :label="$t('MSG_BTN_DEL')"
              grid-action
              dense
              @click="onClickDelete"
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
import { getComponentType, gridUtil, defineGrid, codeUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const now = dayjs();
const dataService = useDataService();
const { t } = useI18n();
const { notify } = useGlobal();
const { getConfig } = useMeta();
const { hasRoleNickName } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const excelFileRef = ref(getComponentType('KwFile'));

const codes = await codeUtil.getMultiCodes(
  'SELL_LM_RSON_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchParams = ref({
  sellLmOcDtm: now.format('YYYYMMDD'),
  sellLmOcStm: now.format('YYYYMMDD'),
  sellLmBzrno: '',
  dlpnrNm: '',
  dlpnrCd: '',
});

let excelUploadfiles;
let cachedParams;

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, {});
}

console.log(hasRoleNickName);

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/contract/sales-limits/business-partners/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;
  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  pageInfo.value = pagingResult;

  dataSource.checkRowStates(false);
  dataSource.addRows(pages);
  dataSource.checkRowStates(true);
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  const deleteKeys = deletedRows.map((row) => row.sellLmId);

  if (deleteKeys.length) {
    await dataService.delete('/sms/wells/contract/sales-limits/business-partners', { data: deleteKeys });
    await fetchData();
  }
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/contract/sales-limits/business-partners/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: 'EntrepreneurJoinLimitOjMgmt',
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickExcelUpload() {
  excelFileRef.value.pickFiles();
}

async function onClickExcelUpload2() {
  const formData = new FormData();
  formData.append('file', excelFileRef.value.nativeFile);
  // ToDo API URL FOR EXCEL UPLOAD
  await dataService.post('', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post(
    '/sms/wells/contract/sales-limits/business-partners',
    changedRows,
  );
  notify(t('MSG_ALT_SAVE_DATA'));
  onClickSearch();
}

/*
onMounted(async () => {
  await fetchData();
});
*/
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellLmDv' },
    { fieldName: 'sellLmBzrno' },
    { fieldName: 'dlpnrNm' },
    { fieldName: 'dlgpsNm' },
    { fieldName: 'bryyMmdd' },
    { fieldName: 'sellLmRsonCd' },
    { fieldName: 'sellLmOcDtm' },
    { fieldName: 'sellLmRlsDtm' },
    { fieldName: 'sellLmRson' },
    { fieldName: 'sellLmPsicNm' },
    { fieldName: 'sellLmRlsPsicNm' },
    { fieldName: 'sellLmId' },
  ];

  const columns = [
    { fieldName: 'sellLmDv', header: t('MSG_TXT_INF_CLS'), width: '142', styleName: 'text-center', editable: true, editor: { type: 'list' }, options: [{ codeId: '3', codeName: t('MSG_TXT_RGS') }, { codeId: '4', codeName: t('MSG_TXT_RSTRCT') }] }, /* 공통코드 미존재로 하드코딩 설정 */
    { fieldName: 'sellLmBzrno', header: t('MSG_TXT_ENTRP_NO'), width: '127', styleName: 'text-center', editable: true },
    { fieldName: 'dlpnrNm', header: t('MSG_TXT_BSN_NM'), width: '127', styleName: 'text-center', editable: false },
    { fieldName: 'dlgpsNm', header: t('MSG_TXT_RPRS_NM'), width: '127', styleName: 'text-center', editable: false },
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_BIRTH_DATE'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editable: false, editor: { type: 'btdate' } },
    { fieldName: 'sellLmRsonCd', header: t('MSG_TXT_DFT_CD'), width: '211', editable: true, editor: { type: 'list' }, options: codes.SELL_LM_RSON_CD },
    { fieldName: 'sellLmOcDtm', header: t('MSG_TXT_OCCUR_DATE'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editable: true, editor: { type: 'btdate' } },
    { fieldName: 'sellLmRlsDtm', header: t('MSG_TXT_CNC_DT'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editable: true, editor: { type: 'btdate' } },
    { fieldName: 'sellLmRson', header: t('MSG_TXT_OCC_RSN'), width: '376', styleName: 'text-center', editable: true },
    { fieldName: 'sellLmPsicNm', header: t('MSG_TXT_RGST_ICHR'), width: '180', styleName: 'text-center', editable: false },
    { fieldName: 'sellLmRlsPsicNm', header: t('MSG_TXT_CNC_INCHR'), width: '180', styleName: 'text-center', editable: false },
    { fieldName: 'sellLmId', visible: false },
  ];

  view.onScrollToBottom = (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      fetchData();
    }
  };

  data.setFields(fields);
  view.setColumns(columns);
  view.editOptions.editable = true;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onShowEditor = async (grid, index) => {
    if (index.column === 'sellLmBzrno') {
      view.setValue(index.itemIndex, 'dlpnrNm', '');
      view.setValue(index.itemIndex, 'dlgpsNm', '');
      view.setValue(index.itemIndex, 'bryyMmdd', '');
    }
  };

  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    const { fieldName } = grid.getColumn(fieldIndex);
    if (fieldName === 'sellLmBzrno') {
      const searchOgParams = ref({
        dlpnrCd: grid.getValue(itemIndex, fieldIndex),
      });

      const res = await dataService.get('/sms/wells/contract/partners', { params: searchOgParams.value });
      const dlgpr = res.data;

      view.setValue(itemIndex, 'dlpnrNm', dlgpr[0].dlpnrNm);
      view.setValue(itemIndex, 'dlgpsNm', dlgpr[0].dlgpsNm);
      view.setValue(itemIndex, 'bryyMmdd', dlgpr[0].bryyMmdd);
    } else if (fieldName === 'sellLmRlsDtm') {
      if (grid.getValue(itemIndex, fieldIndex).length === 0) {
        grid.setValue(itemIndex, 'sellLmRlsDtm', null);
      }
    }
  };
});

</script>
