<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaComputationExcludeItemRegP - 산출 제외품목 등록(W-SV-U-0296P01)
3. 작성자 : SaeRomI.Kim
4. 작성일 : 2023.06.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 산출에 제외되는 품목을 등록 하는 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="2xl"
    :modified-targets="['grdMain']"
  >
    <kw-search
      :cols="2"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 관리년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.inqrYm"
            type="month"
            :label="$t('MSG_TXT_MGT_YNM')"
            rules="required"
            :disable="isInqrYm"
          />
        </kw-search-item>
        <!-- 품목구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="filterCodes.itmKndCd"
            :label="$t('MSG_TXT_ITM_DV')"
            first-option="all"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.itmPdCds"
            :options="optionsItmPdCd"
            :label="$t('MSG_TXT_ITM_DV')"
            option-value="pdCd"
            option-label="pdNm"
            :multiple="true"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- SAP코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_SAPCD')"
        >
          <kw-input
            v-model="searchParams.strtSapCd"
            :label="$t('MSG_TXT_STRT_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeStrtSapCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endSapCd"
            :label="$t('MSG_TXT_END_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeEndSapCd"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
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
        :label="$t('MSG_BTN_DEL')"
        grid-action
        :disable="isSearch"
        @click="onClickDelete"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <!-- 행추가 -->
      <kw-btn
        v-permission:create
        :label="$t('MSG_BTN_ROW_ADD')"
        grid-action
        :disable="isSearch"
        @click="onClickAdd"
      />
      <!-- 저장 -->
      <kw-btn
        v-permission:update
        :label="$t('MSG_BTN_SAVE')"
        grid-action
        :disable="isSearch"
        @click="onClickSave"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <!-- 엑셀다운로드 -->
      <kw-btn
        v-permission:download
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="pageInfo.totalCount === 0"
        icon="download_on"
        secondary
        dense
        @click="onClickExcelDownload"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <!-- 전월데이터이관 -->
      <kw-btn
        v-permission:update
        :label="$t('MSG_BTN_LSTMM_DTA_TF')"
        primary
        dense
        :disable="isSearch"
        @click="onClickTransfer"
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

import { codeUtil, useMeta, useGlobal, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { getters } = useStore();
const { notify, modal, alert, confirm } = useGlobal();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const popupRef = ref();
const grdMainRef = ref(getComponentType('KwGrid'));

const props = defineProps({
  inqrYm: {
    type: String,
    default: '',
  },
  products: {
    type: Array,
    default: () => [],
  },
});

let cachedParams;
const searchParams = ref({
  inqrYm: isEmpty(props.inqrYm) ? dayjs().format('YYYYMM') : props.inqrYm, // 기준년월
  itmKndCd: '',
  itmPdCds: [],
  strtSapCd: '',
  endSapCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'ITM_KND_CD',
);

const filterCodes = ref({
  itmKndCd: [],
});

// 품목종류 필터링
function itmKndCdFilter() {
  filterCodes.value.itmKndCd = codes.ITM_KND_CD.filter((v) => ['5', '6'].includes(v.codeId));
}

const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();
const isInqrYm = ref(true);

// 팝업 오픈 시 기본데이터 셋팅
async function initData() {
  if (isEmpty(props.inqrYm)) {
    isInqrYm.value = false;
  }
  if (!isEmpty(props.products)) {
    optionsAllItmPdCd.value = props.products;
    optionsItmPdCd.value = optionsAllItmPdCd.value;
    return;
  }
  const result = await dataService.get('/sms/wells/service/computation-exclude-items/products');
  optionsAllItmPdCd.value = result.data;
  optionsItmPdCd.value = optionsAllItmPdCd.value;
}

await Promise.all([
  itmKndCdFilter(),
  initData(),
]);

const userInfo = getters['meta/getUserInfo'];
const { userName, departmentName } = userInfo;

// 품목종류 변경 시 품목 필터링
function onChangeItmKndCd() {
  // 품목코드 클리어
  searchParams.value.itmPdCds = [];
  const { itmKndCd } = searchParams.value;

  if (isEmpty(itmKndCd)) {
    optionsItmPdCd.value = optionsAllItmPdCd.value;
    return;
  }

  optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v) => itmKndCd === v.itmKndCd);
}

// SAP 시작코드 변경 시
function onChangeStrtSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = strtSapCd;
    searchParams.value.endSapCd = strtSapCd;
  }
}

// SAP 종료코드 변경 시
function onChangeEndSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = endSapCd;
    searchParams.value.endSapCd = endSapCd;
  }
}

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/computation-exclude-items/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: excludeItem, pageInfo: pagingResult } = res.data;
  // fetch시에는 총 건수 조회하지 않도록 변경
  pagingResult.needTotalCount = false;
  pageInfo.value = pagingResult;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(excludeItem);
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

const isSearch = ref(true);
// 조회버튼 클릭
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  cachedParams = cloneDeep(searchParams.value);
  isSearch.value = false;
  await fetchData();
}

// 삭제
async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkedRows)) {
    notify(t('MSG_ALT_DEL_NO_DATA'));
    return;
  }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (!isEmpty(deletedRows)) {
    const res = await dataService.delete('/sms/wells/service/computation-exclude-items', { data: [...deletedRows] });
    const { processCount } = res.data;
    if (processCount > 0) {
      notify(t('MSG_ALT_DELETED'));
      pageInfo.value.needTotalCount = true;
      await fetchData();
    }
  }
}

// 행추가
async function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, { mngtYm: cachedParams.inqrYm,
    itmKndCd: cachedParams.itmKndCd,
    fstRgstDt: dayjs().format('YYYY-MM-DD'),
    deptNm: departmentName,
    usrNm: userName });
}

// 품목기본정보 팝업 데이터 가져오기
function getRowData(rowData) {
  return { ...rowData,
    sapCd: rowData.sapCd,
    itmPdCd: rowData.itmPdCd || 0,
    itmPdNm: rowData.itmPdAbbr1,
    itmKndCd: rowData.itmKnd };
}

// 중복 체크
async function checkDuplication(itmPdCd) {
  const view = grdMainRef.value.getView();
  const gridList = gridUtil.getAllRowValues(view, false);
  const duplicates = gridList.filter((item) => {
    if (itmPdCd === item.itmPdCd) {
      return true;
    }
    return false;
  });

  if (!isEmpty(duplicates)) {
    return 'Y';
  }
  if (pageInfo.value.totalCount > 0) {
    const validRes = await dataService.get('/sms/wells/service/computation-exclude-items/duplication-check', {
      params: { mngtYm: cachedParams.inqrYm, itmPdCd } });
    return validRes.data;
  }

  return 'N';
}

// 품목기본정보 팝업 호출
async function openItemBasePopup(row) {
  const searchItmKndCd = isEmpty(cachedParams.itmKndCd) ? '6' : cachedParams.itmKndCd;
  const { result, payload } = await modal({
    component: 'WwsnaItemBaseInformationListP',
    componentProps: { chk: '1', lpGbYn: 'Y', itmKndCd: searchItmKndCd },
  });

  if (result) {
    const view = grdMainRef.value.getView();
    const rowData = payload?.[0] || {};
    const { itmPdCd, itmKnd } = rowData;
    if (itmKnd !== '5' && itmKnd !== '6') {
      // 품목 종류가 필터, A/S자재인 품목만 선택 가능 합니다.
      await alert(t('MSG_ALT_CHO_ITM_KND_FILT_AS_MAT'));
      return;
    }

    // 제외 품목 중복체크
    const validYn = await checkDuplication(itmPdCd);
    if (validYn === 'Y') {
      // {0} 은(는) 이미 등록된 제외 품목입니다.
      await alert(`${itmPdCd} ${t('MSG_ALT_EXIST_RGST_EXCD_ITM')}`);
      return;
    }

    view.setValues(row, getRowData(rowData), true);
  }
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view, {
    isChangedOnly: true,
    isCheckedOnly: false,
    isAlertMessage: true,
    includeUneditable: true,
    bails: true,
  })) { return; }
  const changedData = gridUtil.getChangedRowValues(view);

  const res = await dataService.post('/sms/wells/service/computation-exclude-items', changedData);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    pageInfo.value.needTotalCount = true;
    await fetchData();
  }
}

// 전월 데이터 이관
async function onClickTransfer() {
  const view = grdMainRef.value.getView();
  if (gridUtil.isModified(view)) {
    if (!await confirm(t('MSG_ALT_CHG_CNTN'))) { return; }
  }

  // 전월 데이터 건수 체크
  let res = await dataService.get('/sms/wells/service/computation-exclude-items/last-month-check', { params: cachedParams });
  let validYn = res.data;
  if (validYn === 'N') {
    // 전월 데이터가 없습니다. 전월 데이터가 있는 경우에만 이관 가능합니다.
    notify(t('MSG_ALT_LSTMM_NO_DATA'));
    return;
  }

  // 당월 데이터 건수 체크
  res = await dataService.get('/sms/wells/service/computation-exclude-items/this-month-check', { params: cachedParams });
  validYn = res.data;
  if (validYn === 'Y') {
    // 당월 데이터가 있는 경우 이관이 불가능합니다.
    notify(t('MSG_ALT_THM_DTA_EXST'));
    return;
  }

  res = await dataService.post('/sms/wells/service/computation-exclude-items/item-transfers', cachedParams);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_TRNS_FIN'));
    pageInfo.value.needTotalCount = true;
    await fetchData();
  }
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/computation-exclude-items/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: popupRef.value.pageCtxTitle,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목코드
    { fieldName: 'itmPdNm' }, // 상품명
    { fieldName: 'rmkCn' }, // 비고
    { fieldName: 'fstRgstDt' }, // 등록일자
    { fieldName: 'deptNm' }, // 소속
    { fieldName: 'usrNm' }, // 등록자
    { fieldName: 'mngtYm' }, // 관리년월
    { fieldName: 'cmptExcdSn', dataType: 'number' }, // 산출제외순번
    { fieldName: 'itmKndCd' }, // 품목종류코드

  ];

  const columns = [
    { fieldName: 'sapCd', header: t('MSG_TXT_SAPCD'), width: '100', styleName: 'text-center' },
    { fieldName: 'itmPdCd',
      header: t('MSG_TXT_ITM_CD'),
      width: '120',
      rules: 'required',
      button: 'action',
      styleName: 'text-center rg-button-icon--search',
      styleCallback: (grid, dataCell) => {
        const rowState = gridUtil.getCellValue(view, dataCell.index.itemIndex, 'rowState');
        if (rowState !== 'created') {
          return { styleName: 'rg-button-hide' };
        }
      } },
    { fieldName: 'itmPdNm',
      header: t('MSG_TXT_PRDT_NM'),
      width: '140',
      styleName: 'text-left' },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      width: '250',
      styleName: 'text-left',
      rules: 'max:4000',
      editor: {
        type: 'text',
        editable: true } },
    { fieldName: 'fstRgstDt', header: t('MSG_TXT_FST_RGST_DT'), width: '110', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'deptNm', header: t('MSG_TXT_BLG'), width: '130', styleName: 'text-left' },
    { fieldName: 'usrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '80', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEditable = (grid, index) => {
    // 비고내용만 입력 가능
    if (index.column === 'rmkCn') {
      return true;
    }

    return false;
  };

  view.onCellButtonClicked = async (grid, { column, dataRow }) => {
    if (column === 'itmPdCd') {
      await openItemBasePopup(dataRow);
    }
  };
});
</script>
<style>
.kw-search-style .kw-search__action {
  display: none;
}

.rg-button-hide .rg-button-action {
  display: none !important;
}
</style>
