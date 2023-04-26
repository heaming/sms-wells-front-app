<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbOutsourcingpdAsReceiptBzsMgtM - 외주상품 A/S 관리
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2023.04.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 제품 AS할 수 있는 외주 업체를 관리하는 화면이다.
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_GOODS_NM')"
          required
        >
          <kw-input
            v-model="searchParams.pdNm"
            :label="$t('MSG_TXT_GOODS_NM')"
            :maxlength="50"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_AS_RCP_BZS')"
          required
        >
          <kw-input
            v-model="searchParams.cnrNm"
            :label="$t('MSG_TXT_AS_RCP_BZS')"
            :maxlength="50"
            rules="required"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <kw-btn
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
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAddRow"
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
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="(pageInfo.totalCount === 0)"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          dense
          primary
          :label="$t('MSG_BTN_BIZTALK_SEND')"
          @click="onClicBiztalkSend"
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
    </div>
  </kw-page>
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
} from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const {
  // modal,
  notify,
  alert,
} = useGlobal();
const { t } = useI18n();
const { getConfig } = useMeta();
const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
/* 공통코드 가져오기 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

/* 조회조건 */
const searchParams = ref({
  cnrNm: '',
  pdNm: '',
});

let cachedParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/outsourcedpd-as-receipts/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: receipts, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(receipts);
  view.clearCurrent();
}

async function onClickSearch() {
  // debugger;
  // if (!await obsMainRef.value.validate()) { debugger; return; }
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

function onClickAddRow() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {});
  view.checkItem(0, true);
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    // 삭제 controller
    // TODO : DB2 테이블 확인 후 저장, 삭제로직 수정.
    await alert('개발 중입니다.');
  }
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/outsourcedpd-as-receipts/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
    checkBar: 'hidden',
  });
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else if (await gridUtil.validate(view, { isCheckedOnly: true })) {
    // TODO: DB2테이블 확인 필요.
    await alert('개발 중입니다.');
    // const response = await dataService.post('/sms/wells/service/outsourcedpd-as-receipts', chkRows);
    // if (response.data.processCount !== 0) {
    //   notify(t('MSG_ALT_SAVE_DATA'));
    //   await fetchData();
    // }
  }
}

async function onClicBiztalkSend() {
  await alert('연결 페이지 개발 전 입니다.');
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pdNm' },
    { fieldName: 'cnrNm' },
    { fieldName: 'cnrTno' },
    { fieldName: 'psicNm' },
    { fieldName: 'cnrAddr' },
  ];

  const columns = [
    {
      fieldName: 'pdNm',
      header: {
        text: t('MSG_TXT_GOODS_NM'),
        styleName: 'essential',
      },
      editable: true,
      editor: { maxLength: 50 },
      rules: 'required',
      width: '350',
      styleName: 'text-left',
    },
    {
      fieldName: 'cnrNm',
      header: {
        text: t('MSG_TXT_AS_RCP_BZS'),
        styleName: 'essential',
      },
      width: '250',
      styleName: 'text-left rg-button-icon--search',
      button: 'action',
    },

    {
      fieldName: 'cnrTno',
      header: t('MSG_TXT_CONTACT'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'psicNm',
      header: t('MSG_TXT_PIC'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'cnrAddr',
      header: t('MSG_TXT_ADDR'),
      width: '444',
    },
  ];

  const columnLayout = [
    'pdNm',
    'cnrNm',
    'cnrTno',
    'psicNm',
    'cnrAddr',
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onCellButtonClicked = async (grid, index) => {
    console.log(grid, index);
    alert('연결 페이지 개발 전 입니다.');
  };
});
</script>
