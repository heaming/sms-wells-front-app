<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [PMA] 상품 - 프로모션 - 프로모션 대상고객 일괄등록 관리
2. 프로그램 ID : WwpmbPromotionObjectCustomerListM - 프로모션 대상고객 일괄등록 관리
3. 작성자 : domin.pyun
4. 작성일 : 2023.06.05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 프로모션 대상고객 일괄등록 리스트 조회 및 등록
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
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ACEPT_PERIOD')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.vlStrtDtm"
            v-model:to="searchParams.vlEndDtm"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SPC_DSC_CD')"
        >
          <kw-select
            v-model="searchParams.pmotOjSpcDscDvCd"
            :options="codes.PMOT_OJ_SPC_DSC_DV_CD"
            first-option="all"
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
          v-permission:delete
          primary
          dense
          grid-action
          :label="$t('MSG_BTN_DEL')"
          @click="onClickDelete"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          dense
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
          v-permission:update
          dense
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickEdit"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="upload_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
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
import { useMeta, useGlobal, useDataService, getComponentType, defineGrid, codeUtil, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const { notify, modal } = useGlobal();
const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'PMOT_OJ_SPC_DSC_DV_CD',
  'SELL_TP_CD',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();

let cachedParams;

const searchParams = ref({
  cntrNo: '',
  cntrSn: null,
  vlStrtDtm: '',
  vlEndDtm: now.format('YYYYMMDD'),
  pmotOjSpcDscDvCd: '',
});

async function fetchData() {
  const res = await dataService.get('/sms/common/promotion/object-customers/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: data, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(data);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickEdit() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view, { includeUneditable: true })) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);

  await dataService.put('/sms/common/promotion/object-customers', changedRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {});
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length > 0) {
    await dataService.delete('/sms/common/promotion/object-customers', { data: [...deletedRows] });
    await fetchData();
  }
}

async function onClickExcelDownload() {
  const res = await dataService.get('/sms/common/promotion/object-customers/excel-download', { params: { ...cachedParams } });
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 엑셀업로드
async function onClickExcelUpload() {
  const apiUrl = '/sms/common/promotion/object-customers/excel-upload';
  const templateId = 'FOM_PMOT_OJ_CST_BLK_RGST';
  const {
    payload,
  } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  if (payload) {
    if (payload.status === 'S') {
      notify(t('MSG_ALT_SAVE_DATA'));
      await onClickSearch();
    } else {
      await modal({
        component: 'ZwcmzExcelUploadErrorP',
        componentProps: { errorInfo: payload.errorInfo }, // errorInfo 는 서버에서 받은 List<ExcelUploadErrorDvo> 정보
      });
    }
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pmotOjRelId' },
    { fieldName: 'histStrtDtm' },
    { fieldName: 'histEndDtm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn', dataType: 'number' },
    { fieldName: 'vlStrtDtm' },
    { fieldName: 'vlEndDtm' },
    { fieldName: 'pmotOjSpcDscDvCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'dtaDlYn' },
    { fieldName: 'fstRgstDtm' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fstRgstUsrNm' },
    { fieldName: 'fnlMdfcDtm' },
    { fieldName: 'fnlMdfcUsrId' },
    { fieldName: 'fnlMdfcUsrNm' },
  ];

  const columns = [
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_NO'),
      width: 150,
      rules: 'required',
      button: 'action',
      styleName: 'rg-button-icon--search',
      buttonVisibleCallback: (grid, index) => {
        const rowState = gridUtil.getRowState(grid, index.dataRow);
        return (rowState === 'created');
      },
      styleCallback(grid, dataCell) {
        if (gridUtil.isCreatedRow(grid, dataCell.index.dataRow)) {
          return { styleName: 'rg-button-icon--search' };
        }
        return { styleName: 'text-center' };
      },
      editor: { maxLength: 12 },
    },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: 90, rules: 'required', styleName: 'text-center', editor: { type: 'number', maxLength: 5 } },
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_START_DATE'), width: '135', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editable: true, editor: { type: 'btdate' } },
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_END_DATE'), width: '135', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editable: true, editor: { type: 'btdate' } },
    { fieldName: 'pmotOjSpcDscDvCd', header: t('MSG_TXT_SPC_DSC_CD'), width: '200', styleName: 'text-left', rules: 'required', options: codes.PMOT_OJ_SPC_DSC_DV_CD, editor: { type: 'dropdown' } },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_APY_BIZ'), width: '135', rules: 'required', styleName: 'text-center', editable: false, options: codes.SELL_TP_CD },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '120', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editable: false },
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '87', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '120', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editable: false },
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '87', styleName: 'text-center', editable: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  view.onCellButtonClicked = async (grid, { column, itemIndex }) => {
    const current = view.getCurrent();
    if (column === 'cntrNo') {
      if (gridUtil.isCreatedRow(grid, current.dataRow)) {
        const { cntrNo, cntrSn } = grid.getValues(itemIndex);
        const { result, payload } = await modal({
          component: 'WwctaContractNumberListP',
          componentProps: { cntrNo, cntrSn },
        });
        if (result) {
          grid.setValue(itemIndex, 'cntrNo', payload.cntrNo);
          grid.setValue(itemIndex, 'cntrSn', payload.cntrSn);
          const response = await dataService.get('/sms/common/promotion/object-customers/contracts', { params: payload });
          grid.setValue(itemIndex, 'sellTpCd', response.data?.sellTpCd);
        }
      }
    }
    grid.commit();
    grid.commitEditor();
  };

  // 셀 수정 commit callBack
  view.onCellEdited = (grid, itemIndex) => {
    const { fieldName } = grid.getCurrent();
    if (fieldName === 'cntrNo' || fieldName === 'cntrSn') {
      grid.setValue(itemIndex, 'sellTpCd', '');
    }
    if (fieldName === 'vlStrtDtm') {
      if (grid.getValue(itemIndex, 'vlEndDtm') < grid.getValue(itemIndex, 'vlStrtDtm')) {
        grid.setValue(itemIndex, 'vlEndDtm', grid.getValue(itemIndex, 'vlStrtDtm'));
      }
    }
    if (fieldName === 'vlEndDtm') {
      if (grid.getValue(itemIndex, 'vlStrtDtm') > grid.getValue(itemIndex, 'vlEndDtm')) {
        grid.setValue(itemIndex, 'vlStrtDtm', grid.getValue(itemIndex, 'vlEndDtm'));
      }
    }
  };

  view.onCellEditable = (grid, index) => {
    if (index.column === 'cntrNo' || index.column === 'cntrSn') {
      if (!gridUtil.isCreatedRow(grid, index.dataRow)) {
        return false;
      }
    }
  };
});

</script>
