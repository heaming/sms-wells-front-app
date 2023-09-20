<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaASConsumablesStoreMgtM(W-SV-U-0013M01) - AS소모품 입고관리(엑셀업로드)
 3. 작성자 : songTaeSung
 4. 작성일 : 2023.06.11
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - AS소모품 입고관리(엑셀업로드) (http://localhost:3000/#/service/wwsna-as-consumables-store-mgt)
 ****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="2"
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 등록년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_RGST_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.strRgstDt"
            type="month"
            :label="$t('MSG_TXT_RGST_YM')"
            rules="required"
          />
        </kw-search-item>
        <!-- 품목그룹 -->
        <kw-search-item :label="$t('MSG_TXT_ITM_GRP')">
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            :disable="true"
            first-option="all"
            class="w150"
          />

          <kw-select
            v-model="searchParams.itmPdCd"
            :options="itemKndCdD"
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
        <!-- 삭제 -->
        <kw-btn
          v-permission:delete
          grid-action
          :label="$t('MSG_BTN_DEL')"
          @click="onClickDeleteRow"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 저장 -->
        <kw-btn
          v-permission:update
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <!-- 행추가 -->
        <kw-btn
          v-permission:create
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAddRow"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 엑셀업로드 -->
        <kw-btn
          v-permission:create
          icon="upload_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
          @click="onClickExcelUpload"
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
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
import { codeUtil, useMeta, defineGrid, useDataService, getComponentType, useGlobal, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { getConfig } = useMeta();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { modal, notify } = useGlobal();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'ITM_KND_CD', // 품목종류코드
  'PD_GD_CD',
);

const searchParams = ref({
  strRgstDt: dayjs().format('YYYYMM'), // 입고등록일자,
  itmKndCd: '7',
  itmPdCd: '',

});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const itemKndCdD = ref();

async function fetchItmData() {
  const res = await dataService.get('/sms/wells/service/as-consumables-stores/filter-items', { params: searchParams.value });
  itemKndCdD.value = res.data;
}

let cachedParams;
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-consumables-stores/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: asStores, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(asStores);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 체크된 내역이 없을시 notify로 메세지 출력
function validateIsApplyRowExists() {
  const view = grdMainRef.value.getView();
  if (view.getCheckedItems().length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return false;
  }
  return true;
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (!validateIsApplyRowExists()) return;

  if (!(await gridUtil.validate(view, { isCheckedOnly: true }))) { return; }

  await dataService.post('/sms/wells/service/as-consumables-stores', checkedRows);

  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

async function onClickDeleteRow() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
  }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length > 0) {
    const result = await dataService.delete('/sms/wells/service/as-consumables-stores', { data: deletedRows });
    if (result.data > 0) {
      notify(t('MSG_ALT_SAVE_COMP'));
      await fetchData();
    } else {
      notify(t('MSG_ALT_PROC_FAIL'));
    }
  }
}

async function onClickAddRow() {
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, {
    strRgstDt: dayjs().format('YYYYMMDD'),
  });
}

const onClickExcelUpload = async () => {
  const apiUrl = '/sms/wells/service/as-consumables-stores/excel-upload';
  const templateId = 'FOM_AS_CSMB_UPLOAD';
  console.log(cachedParams);
  const extraData = cachedParams;
  const { result, payload } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId, extraData },
  });
  if (result && payload.status === 'S') {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
};

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/as-consumables-stores/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    checkBar: 'hidden',
    exportData: res.data,
  });
}

onMounted(async () => {
  await fetchItmData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'strWareNo' },
    { fieldName: 'wareNm' },
    { fieldName: 'strRgstDt' },
    { fieldName: 'sapCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'itmPdNm' },
    { fieldName: 'itmGdCd' },
    { fieldName: 'strQty' },
    { fieldName: 'rmkCn' },
    { fieldName: 'itmStrNo' },
    { fieldName: 'itmStrSn' },
    { fieldName: 'mngtUnitCd' },

  ];

  const columns = [
    // 입고창고번호
    {
      fieldName: 'strWareNo',
      header: {
        text: t('MSG_TXT_STR_WARE_MNGT_NO'),
        styleName: 'essential',
      },
      editable: true,
      width: '200',
      styleName: 'text-center',
    },
    // 창고명
    {
      fieldName: 'wareNm',
      header: {
        text: t('MSG_TXT_WARE_NM'),
        styleName: 'essential',
      },
      width: '200',
      styleName: 'text-left',
      editable: true,
    },
    // 입고등록일자
    {
      fieldName: 'strRgstDt',
      header: {
        text: t('MSG_TXT_STR_RGST_DT'),
        styleName: 'essential',
      },
      width: '150',
      styleName: 'text-center',
      editor: { type: 'btdate' },
      datetimeFormat: 'date',
      editable: true,
    },
    // sap코드
    {
      fieldName: 'sapCd',
      header: {
        text: t('MSG_TXT_SAP_CD'),
        styleName: 'essential',
      },
      width: '150',
      styleName: 'text-center',
      editable: true,
    },
    // 품목코드
    {
      fieldName: 'itmPdCd',
      header: {
        text: t('MSG_TXT_ITM_CD'),
        styleName: 'essential',
      },
      width: '150',
      styleName: 'text-center',
      editable: true,
    },
    // 품목명
    {
      fieldName: 'itmPdNm',
      header: {
        text: t('MSG_TXT_ITM_NM'),
        styleName: 'essential',
      },
      width: '250',
      styleName: 'text-left',
      editable: true,
    },
    // 등급
    {
      fieldName: 'itmGdCd',
      header: {
        text: t('MSG_TXT_GD'),
        styleName: 'essential',
      },
      width: '100',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: codes.PD_GD_CD,
      editable: true,
    },
    // 입고수량
    {
      fieldName: 'strQty',
      header: {
        text: t('MSG_TXT_STR_QTY'),
        styleName: 'essential',
      },
      editor: {
        type: 'number',
      },
      numberFormat: '###,###,###,##0',
      width: '100',
      styleName: 'text-right',
      editable: true,
    },
    // 입고사유
    {
      fieldName: 'rmkCn',
      header: {
        text: t('MSG_TXT_STR_RSON'),
        styleName: 'essential',
      },
      width: '148',
      styleName: 'text-left',
      editable: true,
    },
    { fieldName: 'itmStrNo', header: t('MSG_TXT_STR_NO'), width: '170', styleName: 'text-left', visible: false },
    { fieldName: 'mngtUnitCd', header: t('MSG_TXT_MNGT_UNIT'), width: '170', styleName: 'text-left', visible: false },
    { fieldName: 'itmStrSn',
      header: t('MSG_TXT_STR_SEQN'),
      width: '170',
      styleName: 'text-left',
      visible: false,
      editor: {
        type: 'number',
      },

    },

  ];

  const columnLayout = [
    'strWareNo',
    'wareNm',
    'strRgstDt',
    'sapCd',
    'itmPdCd',
    'itmPdNm',
    'itmGdCd',
    'strQty',
    'rmkCn',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onCellEditable = (grid, index) => {
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['strWareNo', 'wareNm', 'strRgstDt', 'sapCd', 'itmPdCd', 'itmPdNm', 'itmGdCd', 'strQty'].includes(index.column)) {
      return false;
    }
  };
});
</script>

<style scoped>
</style>
