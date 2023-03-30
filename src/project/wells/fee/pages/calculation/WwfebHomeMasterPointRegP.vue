<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebHomeMasterPointRegP - 홈마스터 포인트 상세 화면
3. 작성자 : minkyu.bae
4. 작성일 : 2023.03.15
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 홈마스터 등급 포인트 등록화면
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="2xl"
    :title="t('MSG_TXT_HMST')+t('MSG_TXT_P')+t('MSG_TXT_DTL')"
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
      </template>
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="totalCount.value === 0"
        @click="onClickExcelDownload"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:delete
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
        v-permission:create
        grid-action
        :label="$t('MSG_BTN_ROW_ADD')"
        @click="onClickAdd"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        dense
        primary
        :label="t('MSG_BTN_P')+t('MSG_BTN_SAVE')"
        @click="onClickListSave"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="10"
      @init="initGrdMain"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useDataService, getComponentType, defineGrid, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { confirm, notify } = useGlobal();

const dataService = useDataService();
const { t } = useI18n();
const popupRef = ref();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
let cachedParams;

const props = defineProps({
  mngtYm: {
    type: String,
    default: null,
  },
  emplNm: {
    type: String,
    default: null,
  },
  prtnrNo: {
    type: String,
    default: null,
  },
});

const saveData = ref({
  prtnrNo: '',
  mngtYm: '',
  sellPVal: '',
  svPVal: '',
  educPVal: '',
  etcPVal1: '',
  etcPVal2: '',
  etcPVal3: '',
  clDvCd: '',
});

const removeData = ref({
  prtnrNo: '',
  mngtYm: '',
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  cachedParams = cloneDeep(props);
  const response = await dataService.get('/sms/wells/fee/home-master-grades/details', { params: cachedParams });
  const hmstPoints = response.data;
  totalCount.value = hmstPoints.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(hmstPoints);
  view.resetCurrent();
}

/*
 *  Event - 리스트 저장 버튼 클릭
 *  저장 후 재조회
 */
async function onClickListSave() {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);

  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  await dataService.post('/sms/wells/fee/home-master-grades/points', changedRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

/*
 *  Event - 그리드 개별 row 저장 버튼 클릭
 *  저장은 하지 않았으나 수정중인 row의 데이터가 존재할 수 있으므로 재조회X
 */
async function onClickSave() {
  const dataProvider = grdMainRef.value.getView().getDataSource();
  const scRow = grdMainRef.value.getView().getCurrent().dataRow;

  await dataService.post('/sms/wells/fee/home-master-grades/point', saveData.value);

  notify(t('MSG_ALT_SAVE_DATA'));
  dataProvider.setRowState(scRow, 'none');
  dataProvider.setValue(scRow, 'newYn', 'N');
}

/*
 *  Event - Excel 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: popupRef.value.pageCtxTitle,
    timePostfix: true,
  });
}

/*
 *  Event - 행추가 버튼 클릭
 *  현재 생성된 마지막 관리년월의 +1 개월 row 생성
 *  마지막 관리년월이 없을경우 년도만 set (※수정가능)
 */
async function onClickAdd() {
  const view = grdMainRef.value.getView();
  const gridSize = view.getDataSource().getRowCount();
  const bfRow = gridSize - 1;
  const mngtVal = view.getValue(bfRow, 'mngtYm');
  const diff = dayjs(mngtVal).add(1, 'month').format('YYYYMM');

  if (mngtVal !== null) {
    gridUtil.insertRowAndFocus(view, gridSize, {
      emplNm: props.emplNm,
      prtnrNo: props.prtnrNo,
      mngtYm: diff,
      sellPVal: '0',
      svPVal: '0',
      educPVal: '0',
      etcPVal1: '0',
      etcPVal2: '0',
      etcPVal3: '0',
      totSum: '0',
      clDvCd: '',
      save: '저장',
    });
  } else {
    gridUtil.insertRowAndFocus(view, gridSize, {
      emplNm: props.emplNm,
      prtnrNo: props.prtnrNo,
      mngtYm: `${props.mngtYm.substring(0, 4)}00`,
      sellPVal: '0',
      svPVal: '0',
      educPVal: '0',
      etcPVal1: '0',
      etcPVal2: '0',
      etcPVal3: '0',
      totSum: '0',
      clDvCd: '',
      save: '저장',
    });
  }
}

/*
 *  Event - 행삭제 버튼 클릭
 *  저장 전 신규생성 row는 단순 그리드 삭제
 */
async function onClickRemove() {
  const dataProvider = grdMainRef.value.getView().getDataSource();
  const scRow = grdMainRef.value.getView().getCurrent().dataRow;
  const scRowState = dataProvider.getRowState(scRow);
  const newRow = dataProvider.getValue(scRow, 'newYn');
  if (!await confirm(t('MSG_ALT_WANT_DEL_WCC'))) { return; }

  if (scRowState === 'created' || newRow === 'Y') {
    dataProvider.removeRow(scRow);
  } else {
    removeData.value.prtnrNo = dataProvider.getValue(scRow, 'prtnrNo');
    removeData.value.mngtYm = dataProvider.getValue(scRow, 'mngtYm');
    const response = await dataService.delete('/sms/wells/fee/home-master-grades', { data: removeData.value });
    if (response.data.processCount > 0) {
      dataProvider.removeRow(scRow);
    }
  }
}

onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'emplNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'mngtYm' },
    { fieldName: 'sellPVal' },
    { fieldName: 'svPVal' },
    { fieldName: 'educPVal' },
    { fieldName: 'etcPVal1' },
    { fieldName: 'etcPVal2' },
    { fieldName: 'etcPVal3' },
    { fieldName: 'totSum' },
    { fieldName: 'clDvCd' },
    { fieldName: 'save' },
    { fieldName: 'newYn' },
  ];

  const columns = [
    { fieldName: 'emplNm', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-left', editable: false },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'mngtYm', header: t('MSG_TXT_MON'), width: '106', styleName: 'text-center', dataType: 'datetime', datetimeFormat: 'yyyy-MM', editor: { type: 'number', textAlignment: 'far', maxIntegerLength: 6 } },
    { fieldName: 'sellPVal', header: t('MSG_TXT_SELL'), width: '92', styleName: 'text-right', editor: { type: 'number', textAlignment: 'far', editFormat: '#,##0.##', maxIntegerLength: 2 } },
    { fieldName: 'svPVal', header: t('MSG_TXT_SERVICE'), width: '92', styleName: 'text-right', editor: { type: 'number', textAlignment: 'far', editFormat: '#,##0.##', maxIntegerLength: 2 } },
    { fieldName: 'educPVal', header: t('MSG_TXT_EDUC'), width: '92', styleName: 'text-right', editor: { type: 'number', textAlignment: 'far', editFormat: '#,##0.##', maxIntegerLength: 2 } },
    { fieldName: 'etcPVal1', header: t('MSG_TXT_PERSONS') + t('MSG_TXT_ACQS'), width: '92', styleName: 'text-right', editor: { type: 'number', textAlignment: 'far', editFormat: '#,##0.##', maxIntegerLength: 2 } },
    { fieldName: 'etcPVal2', header: 'VOC', width: '92', styleName: 'text-right', editor: { type: 'number', textAlignment: 'far', editFormat: '#,##0.##', maxIntegerLength: 2 } },
    { fieldName: 'etcPVal3', header: t('MSG_TXT_SFT') + t('MSG_TXT_ACDN'), width: '92', styleName: 'text-right', editor: { type: 'number', textAlignment: 'far', editFormat: '#,##0.##', maxIntegerLength: 2 } },
    { fieldName: 'totSum', header: t('MSG_TXT_SUM'), width: '92', styleName: 'text-right', editable: false },
    { fieldName: 'clDvCd', header: t('MSG_TXT_GD'), width: '92', styleName: 'text-right', editable: false },
    { fieldName: 'save', header: t('MSG_BTN_SAVE'), width: '106', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true },
    { fieldName: 'newYn', header: 'NEW_YN', width: '50', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.columnByName('newYn').visible = false;
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  // multi row header setting
  view.setColumnLayout([
    // single
    {
      header: t('MSG_TXT_HMNRSC_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['emplNm', 'prtnrNo'],
    },
    {
      header: t('MSG_TXT_P'),
      direction: 'horizontal',
      items: ['mngtYm', 'sellPVal', 'svPVal', 'educPVal', 'etcPVal1', 'etcPVal2', 'etcPVal3', 'totSum'],
    },
    'clDvCd', 'save',
  ]);

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'save') {
      saveData.value.prtnrNo = g.getValue(itemIndex, 'prtnrNo');
      saveData.value.mngtYm = g.getValue(itemIndex, 'mngtYm');
      saveData.value.sellPVal = g.getValue(itemIndex, 'sellPVal');
      saveData.value.svPVal = g.getValue(itemIndex, 'svPVal');
      saveData.value.educPVal = g.getValue(itemIndex, 'educPVal');
      saveData.value.etcPVal1 = g.getValue(itemIndex, 'etcPVal1');
      saveData.value.etcPVal2 = g.getValue(itemIndex, 'etcPVal2');
      saveData.value.etcPVal3 = g.getValue(itemIndex, 'etcPVal3');
      saveData.value.clDvCd = g.getValue(itemIndex, 'clDvCd');
      onClickSave();
    }
  };

  view.onCellEdited = async function summary(grid, index, dataRow) {
    const totSum = Number(grid.getValues(dataRow).sellPVal) + Number(grid.getValues(dataRow).svPVal)
                   + Number(grid.getValues(dataRow).educPVal) + Number(grid.getValues(dataRow).etcPVal1)
                   + Number(grid.getValues(dataRow).etcPVal2) + Number(grid.getValues(dataRow).etcPVal3);
    grid.setValue(dataRow, 'totSum', totSum);
  };
});
</script>
