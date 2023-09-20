<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEY
2. 프로그램 ID : WwfeySellProductTypeMgtM - 판매상품별 제품유형
3. 작성자 : MJ
4. 작성일 : 2023.07.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 판매상품별 제품유형 W-CO-U-0166M01
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      v-permission:read
      one-row
      :cols="2"
      :modified-targets="['grdRef']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 상품코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')"
        >
          <kw-input
            v-model="searchParams.basePdCd"
            :label="$t('MSG_TXT_PRDT_CODE')"
            clearable
            icon="search"
            dense
            :maxlength="10"
            @click-icon="onClickSelectPdCd()"
            @update:model-value="onUpdatePdCd()"
          />
          <kw-input
            v-model="searchParams.basePdNm"
            placeholder=""
            readonly
          />
        </kw-search-item>
        <!-- 적용기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_ACEPT_PERIOD')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.apyStrtYm"
            v-model:to="searchParams.apyEndYm"
            type="month"
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
            @change="fetchPage"
          />
        </template>
        <kw-btn
          v-permission:delete
          :label="$t('MSG_BTN_DEL')"
          grid-action
          @click="onClickRowDelete"
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
          @click="onClickRowAdd"
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
        <kw-btn
          v-permission:create
          icon="upload_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdRef"
        name="grdRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrd"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchPage"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, useGlobal, useDataService, useMeta, getComponentType, codeUtil, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';

const { t } = useI18n();
const { modal, notify } = useGlobal();
const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
const grdData = computed(() => grdRef.value?.getData());
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'FEE_PDCT_TP_CD',
);
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

let cachedParams;
const searchParams = ref({
  basePdCd: '',
  basePdNm: '',
  apyStrtYm: '',
  apyEndYm: '',
});

// 상품코드 검색아이콘 클릭
async function onClickSelectPdCd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.basePdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };
  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });
  if (returnPdInfo.result) {
    searchParams.value.basePdCd = returnPdInfo.payload?.[0].pdCd;
    searchParams.value.basePdNm = returnPdInfo.payload?.[0].pdNm;
  }
}
async function onUpdatePdCd() {
  searchParams.value.basePdNm = '';
}
// 데이터 조회
async function fetchPage() {
  // @todo
  const res = await dataService.get('/sms/wells/fee/sell-product-type/pages', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pagingResult } = res.data;
  grdData.value.setRows(pages);
  pageInfo.value = pagingResult;
  const view = grdRef.value.getView();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}
// 조회 버튼
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchPage();
}

// 그리드행삭제
async function onClickRowDelete() {
  const view = grdRef.value.getView();
  const deleteRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deleteRows.length > 0) {
    const allRows = gridUtil.getDeletedRowValues(view);
    await dataService.post('/sms/wells/fee/sell-product-type', allRows);
    notify(t('MSG_ALT_DELETED'));
    await fetchPage();
  }
}

// 그리드행추가
async function onClickRowAdd() {
  const view = grdRef.value.getView();
  const defaultRow = {
    basePdCd: '',
    feePdctTpCd1: '',
    feePdctTpCd2: '',
    apyStrtYm: '',
    apyEndYm: '',
  };
  const dataRow = view.getDataSource().insertRow(0, defaultRow);
  gridUtil.focusCellInput(view, dataRow, 'basePdCd');
}

// 저장
async function onClickSave() {
  const view = grdRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) return;
  if (!await gridUtil.validate(view)) { return; }

  const allRows = gridUtil.getChangedRowValues(view, true);
  await dataService.post('/sms/wells/fee/sell-product-type', allRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchPage();
}

// 엑셀업로드
async function onClickExcelUpload() {
  // @todo
  const apiUrl = '/sms/wells/fee/sell-product-type/excel-upload';
  const templateId = 'FOM_FEY_0166';
  const { result, payload } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  if (result) {
    const { status, errorInfo } = payload;
    if (status === 'S') {
      notify(t('MSG_ALT_SAVE_DATA'));
      await fetchPage();
    } else if (status === 'E' && errorInfo.length > 0) {
      await modal({
        component: 'ZwcmzExcelUploadErrorP',
        componentProps: { errorInfo },
      });
    }
  }
}

// 엑셀 다운로드 버튼
async function onClickExcelDownload() {
  // @todo
  const res = await dataService.get('/sms/wells/fee/sell-product-type', { params: cachedParams });
  const view = grdRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data, // 현재 그리드에 보여지는 데이터가 아닌 전체 데이터 다운로드 시 사용
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd = defineGrid((data, view) => {
  const btOpt = {
    startView: 1,
    minViewMode: 1,
    language: 'ko',
    todayHighlight: true,
  };

  const columns = [
    {
      fieldName: 'basePdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      width: '140',
      styleName: 'text-center rg-button-icon--search boxed-icon',
      button: 'action',
      rules: 'required',
      buttonVisibleCallback(g, index) {
        return g.getDataSource().getRowState(index.dataRow) === 'created';
      },
    },
    { fieldName: 'basePdNm', header: t('MSG_TXT_PRDT_NM'), width: '180', rules: 'required' },
    { fieldName: 'feePdctTpCd1', header: `${t('MSG_TXT_PDCT_TP')}(M)`, width: '120', styleName: 'text-center', editor: { type: 'list' }, options: codes.FEE_PDCT_TP_CD, rules: 'required', editable: true },
    { fieldName: 'feePdctTpCd2', header: `${t('MSG_TXT_PDCT_TP')}(P)`, width: '120', styleName: 'text-center', editor: { type: 'list' }, options: codes.FEE_PDCT_TP_CD, rules: 'required', editable: true },
    { fieldName: 'apyStrtYm', header: t('MSG_TXT_APY_STRT_YM'), width: '130', styleName: 'text-center', editor: { type: 'btdate', datetimeFormat: 'yyyy-MM', btOptions: btOpt }, datetimeFormat: 'yyyy-MM', rules: 'required', editable: true },
    { fieldName: 'apyEndYm', header: t('MSG_TXT_APY_END_YM'), width: '130', styleName: 'text-center', editor: { type: 'btdate', datetimeFormat: 'yyyy-MM', btOptions: btOpt }, datetimeFormat: 'yyyy-MM', rules: 'required', editable: true },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR'), width: '130', styleName: 'text-center' },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_MDFC_USR'), width: '130', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;
  view.onCellEditable = (grid, index) => {
    if (gridUtil.isCreatedRow(grid, index.dataRow) && ['basePdCd', 'feePdctTpCd1', 'feePdctTpCd2', 'apyStrtYm', 'apyEndYm'].includes(index.column)) {
      return true;
    }
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['apyEndYm', 'feePdctTpCd1', 'feePdctTpCd2'].includes(index.column)) {
      return true;
    }
    return false;
  };
  view.onCellButtonClicked = async (g, { column, itemIndex }) => {
    // 상품코드 팝업호출
    if (column === 'basePdCd') {
      const { result, payload } = await modal({
        component: 'ZwpdcStandardListP',
        componentProps: {
          searchType: pdConst.PD_SEARCH_CODE,
          searchValue: '',
          selectType: pdConst.PD_SEARCH_SINGLE,
        },
      });
      if (result) {
        g.setValue(itemIndex, 'basePdcd', payload?.[0].pdCd);
        g.setValue(itemIndex, 'basePdNm', payload?.[0].pdNm);
      }
    }
  };
  // 시작월 종료월 체크
  view.onValidate = async (g, index) => {
    const { apyStrtYm, apyEndYm } = gridUtil.getRowValue(view, index.dataRow);
    if (!isEmpty(apyStrtYm) && !isEmpty(apyEndYm)) {
      if (apyStrtYm > apyEndYm) {
        gridUtil.focusCellInput(view, index.dataRow, 'apyStrtYm');
        return t('MSG_ALT_STRT_MM_CHK');
      }
    }
  };
});

</script>
