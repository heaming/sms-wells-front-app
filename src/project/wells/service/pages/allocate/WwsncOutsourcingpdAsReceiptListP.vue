<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsncOutsourcingpdAsReceiptListP - 외주상품 A/S 접수처 조회
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2023.05.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 제품 AS할 수 있는 외주 업체를 관리하는 화면이다.
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="3xl"
  >
    <kw-search
      :cols="2"
      one-row
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_AS_RCP_BZS')"
        >
          <kw-input
            v-model="searchParams.cnrNm"
            :label="$t('MSG_TXT_AS_RCP_BZS')"
            :maxlength="50"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          :total-count="pageInfo.totalCount"
          @change="fetchData"
        />
      </template>
      <kw-btn
        v-permission:delete
        :label="$t('MSG_BTN_DEL')"
        grid-action
        @click="onClickDelete"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:create
        :label="$t('MSG_BTN_ROW_ADD')"
        grid-action
        @click="onClickAddRow"
      />
      <kw-btn
        v-permission:update
        :label="$t('MSG_BTN_SAVE')"
        grid-action
        @click="onClickSave"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <!-- <kw-btn
        icon="print"
        dense
        secondary
        :label="$t('MSG_BTN_PRTG')"
      /> -->
      <kw-btn
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="(pageInfo.totalCount === 0)"
        @click="onClickExcelDownload"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        :label="$t('MSG_TXT_AS_RCP_BZS_SEL')"
        primary
        dense
        @click="onClickBzSelect"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrdMain"
    />

    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  codeUtil,
  defineGrid,
  getComponentType,
  useDataService,
  useMeta,
  gridUtil,
  useGlobal,
  useModal,
} from 'kw-lib';
import { cloneDeep, replace } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
const { modal, notify } = useGlobal();
const { ok } = useModal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

/* 조회조건 */
const searchParams = ref({
  cnrNm: '',
});

let cachedParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const popupRef = ref();
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/outsourcedpd-as-receipts/business/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: receipts, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(receipts);
  view.clearCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/outsourcedpd-as-receipts/business/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: popupRef.value.pageCtxTitle,
    timePostfix: true,
    exportData: response.data,
    checkBar: 'hidden',
  });
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length > 0) {
    // 삭제 controller
    await dataService.delete('/sms/wells/service/outsourcedpd-as-receipts/business', { data: [...deletedRows] });

    notify(t('MSG_ALT_DELETED'));
    await fetchData();
  }
}

function onClickAddRow() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {});
  view.checkItem(0, true);
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else if (await gridUtil.validate(view, { isCheckedOnly: true })) {
    await dataService.post('/sms/wells/service/outsourcedpd-as-receipts/business', chkRows);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

async function onClickBzSelect() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);
  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  if (chkRows.length > 1) {
    notify(t('MSG_ALT_SELT_ONE_ITEM'));
    return;
  }
  const payload = {
    svCnrSn: chkRows[0].svCnrSn,
    svCnrNm: chkRows[0].svCnrNm,
    svCnrTno: chkRows[0].svCnrTno,
    svCnrIchrPrtnrNm: chkRows[0].svCnrIchrPrtnrNm,
    svCnrAdr: chkRows[0].svCnrAdr,
    svCnrDtlAdr: chkRows[0].svCnrDtlAdr,
  };
  ok(payload);
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'svCnrSn' },
    { fieldName: 'svCnrNm' },
    { fieldName: 'svCnrLocaraTno' },
    { fieldName: 'svCnrExnoEncr' },
    { fieldName: 'svCnrIdvTno' },
    { fieldName: 'svCnrTno' },
    { fieldName: 'svCnrZip' },
    { fieldName: 'button' },
    { fieldName: 'svCnrAdr' },
    { fieldName: 'svCnrDtlAdr' },
    { fieldName: 'totAdr' },
    { fieldName: 'svCnrIchrPrtnrNm' },
  ];

  const columns = [

    {
      fieldName: 'svCnrNm',
      header: {
        text: t('MSG_TXT_AS_RCP_BZS'),
        styleName: 'essential',
      },
      width: '300',
      editable: true,
      editor: { maxLength: 50 },
      rules: 'required',
    },
    {
      fieldName: 'svCnrTno',
      header: {
        text: t('MSG_TXT_CONTACT'),
        styleName: 'essential',
      },
      width: '200',
      editable: true,
      editor: {
        type: 'telephone',
      },
      rules: 'required',
    },
    {
      fieldName: 'svCnrIchrPrtnrNm',
      header: {
        text: t('MSG_TXT_PIC'),
        styleName: 'essential',
      },
      width: '150',
      editable: true,
      editor: { maxLength: 25 },
      rules: 'required',
    },
    {
      fieldName: 'svCnrZip',
      width: '100',
      styleName: 'text-center',
      rules: 'required',
      header: {
        text: t('MSG_TXT_ADDR'),
      },
    },
    {
      fieldName: 'button',
      styleName: 'text-center',
      renderer: {
        type: 'button',
        hideWhenEmpty: false,
      },
      width: '150',
      displayCallback: () => '우편번호검색',
    },
    {
      fieldName: 'totAdr',
      width: '350',
      displayCallback: (g, i) => {
        const { svCnrAdr, svCnrDtlAdr } = gridUtil.getRowValue(g, i.dataRow);
        const tot = `${replace(svCnrAdr, null, ' ')} ${replace(svCnrDtlAdr, null, ' ')}`;

        return tot;
      },
    },
  ];

  const columnLayout = [
    'svCnrNm',
    'svCnrTno',
    'svCnrIchrPrtnrNm',
    {
      header: {
        text: t('MSG_TXT_ADDR'),
        styleName: 'essential',
      },
      direction: 'horizontal',
      hideChildHeaders: true, // 자식 header 숨기기
      items: [
        'svCnrZip',
        'button',
        'totAdr',
      ],
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    if (column === 'button') {
      const { result, payload } = await modal({
        component: 'ZwcmzAddressInfoP',
        componentProps: { ...dataRow },
      });

      if (result) {
        const { address } = payload;
        data.setValue(dataRow, 'svCnrZip', address.zipCode);
        data.setValue(dataRow, 'svCnrAdr', address.add1);
        data.setValue(dataRow, 'svCnrDtlAdr', address.add2);
      }
    }
  };

  view.onCellEdited = async (grid, itemIndex) => {
    grid.checkItem(itemIndex, true);
  };
});

</script>
