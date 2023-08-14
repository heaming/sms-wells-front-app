<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfActivityGoodsSizeMgtP - 활동물품관리-사이즈관리
3. 작성자 : jisung you
4. 작성일 : 2023.07.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-활동물품관리-사이즈관리
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <div class="grid-horizontal-wrap">
      <div class="grid-horizontal-wrap__section">
        <h3 class="mt0">
          {{ $t('MSG_TIT_SIZE_DV_MNGT') }}
        </h3>
        <kw-action-top>
          <template #left>
            <kw-paging-info
              :total-count="totalCount"
            />
            <kw-separator
              spaced
              vertical
              inset
            />
            <kw-btn
              min-width="32px"
              grid-action
              label="⇈"
              @click="onClickGridMove('top')"
            >
              <kw-tooltip>Top</kw-tooltip>
            </kw-btn>
            <kw-btn
              min-width="32px"
              grid-action
              label="↑"
              @click="onClickGridMove('up')"
            >
              <kw-tooltip>Up</kw-tooltip>
            </kw-btn>
            <kw-btn
              min-width="32px"
              grid-action
              label="↓"
              @click="onClickGridMove('down')"
            >
              <kw-tooltip>Down</kw-tooltip>
            </kw-btn>
            <kw-btn
              min-width="32px"
              grid-action
              label="⇊"
              @click="onClickGridMove('bottom')"
            />
          </template>
          <kw-btn
            :label="$t('MSG_BTN_DEL')"
            dense
            grid-action
            @click="onClickDelete"
          />
          <kw-separator
            vertical
            inset
            spaced
          />
          <kw-btn
            dense
            grid-action
            :label="$t('MSG_BTN_ROW_ADD')"
            @click="onClickAdd"
          />
          <kw-btn
            grid-action
            dense
            :label="$t('MSG_BTN_SAVE')"
            @click="onClickSave"
          />
        </kw-action-top>
        <kw-grid
          ref="gridPopupRef"
          :visible-rows="10"
          @init="initGrdPopup"
        />
      </div>
      <div class="grid-horizontal-wrap__section">
        <h3 class="mt0">
          {{ $t('MSG_TIT_SIZE_DTL_MNGT') }}
        </h3>
        <kw-action-top>
          <template #left>
            <kw-paging-info
              :total-count="totalDetailCount"
            />
            <kw-separator
              spaced
              vertical
              inset
            />
            <kw-btn
              min-width="32px"
              grid-action
              label="⇈"
              @click="onClickGridMoveDetail('top')"
            >
              <kw-tooltip>Top</kw-tooltip>
            </kw-btn>
            <kw-btn
              min-width="32px"
              grid-action
              label="↑"
              @click="onClickGridMoveDetail('up')"
            >
              <kw-tooltip>Up</kw-tooltip>
            </kw-btn>
            <kw-btn
              min-width="32px"
              grid-action
              label="↓"
              @click="onClickGridMoveDetail('down')"
            >
              <kw-tooltip>Down</kw-tooltip>
            </kw-btn>
            <kw-btn
              min-width="32px"
              grid-action
              label="⇊"
              @click="onClickGridMoveDetail('bottom')"
            />
          </template>
          <kw-btn
            :label="$t('MSG_BTN_DEL')"
            dense
            grid-action
            @click="onClickDetailDelete"
          />
          <kw-separator
            vertical
            inset
            spaced
          />
          <kw-btn
            dense
            grid-action
            :label="$t('MSG_BTN_ROW_ADD')"
            @click="onClickDetailAdd"
          />
          <kw-btn
            grid-action
            dense
            :label="$t('MSG_BTN_SAVE')"
            @click="onClickDetailSave"
          />
        </kw-action-top>
        <kw-grid
          ref="gridDetailRef"
          :visible-rows="10"
          @init="initGridDetail"
        />
      </div>
    </div>
  </kw-popup>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid, gridUtil, useDataService, useGlobal } from 'kw-lib';
import { RowState } from 'realgrid';

const dataService = useDataService();
const { t } = useI18n();
const { notify, confirm, alert } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const gridPopupRef = ref(getComponentType('KwGrid'));
const gridDetailRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const totalDetailCount = ref(0);
const ckActiGdsStddDvId = ref();

// grid move
async function onClickGridMove(type) {
  const gridView = gridPopupRef.value.getView();
  const currentDataRow = gridView.getCurrent().dataRow;
  if (currentDataRow === -1) {
    return;
  }
  const dataProvider = gridView.getDataSource();
  const endDataRow = dataProvider.getRowCount() - 1;
  let nextDataRow = -1;

  switch (type) {
    case 'top':
      nextDataRow = 0;
      break;
    case 'up':
      if (currentDataRow > 0) {
        nextDataRow = currentDataRow - 1;
      }
      break;
    case 'down':
      if (endDataRow > currentDataRow) {
        nextDataRow = currentDataRow + 1;
      }
      break;
    case 'bottom':
      nextDataRow = endDataRow;
      break;
    default:
      break;
  }
  if (nextDataRow >= 0 && nextDataRow <= endDataRow) {
    dataProvider.moveRow(currentDataRow, nextDataRow);
    gridView.setCurrent({ dataRow: nextDataRow });
    dataProvider.setValue(nextDataRow, 'sortOdr', nextDataRow);
  }
}

async function onClickGridMoveDetail(type) {
  const gridView = gridDetailRef.value.getView();
  const currentDataRow = gridView.getCurrent().dataRow;
  if (currentDataRow === -1) {
    return;
  }
  const dataProvider = gridView.getDataSource();
  const endDataRow = dataProvider.getRowCount() - 1;
  let nextDataRow = -1;

  switch (type) {
    case 'top':
      nextDataRow = 0;
      break;
    case 'up':
      if (currentDataRow > 0) {
        nextDataRow = currentDataRow - 1;
      }
      break;
    case 'down':
      if (endDataRow > currentDataRow) {
        nextDataRow = currentDataRow + 1;
      }
      break;
    case 'bottom':
      nextDataRow = endDataRow;
      break;
    default:
      break;
  }
  if (nextDataRow >= 0 && nextDataRow <= endDataRow) {
    dataProvider.moveRow(currentDataRow, nextDataRow);
    gridView.setCurrent({ dataRow: nextDataRow });
    dataProvider.setValue(nextDataRow, 'sortOdr', nextDataRow);
  }
}

async function onClickAdd() {
  const view = gridPopupRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    actiGdsStddDvId: '',
    actiGdsStddDvNm: '',
    useYn: 'Y',
    sortOdr: 0,
  });
}

async function fetchData() {
  const cachedParams = {};
  const res = await dataService.get('/sms/wells/competence/business/activity/size-base', { params: cachedParams });
  const view = gridPopupRef.value.getView();
  console.log('res.data', res.data);
  totalCount.value = res.data.length;
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSave() {
  const view = gridPopupRef.value.getView();
  if (!await gridUtil.validate(view)) { return; }

  if (await confirm(t('MSG_ALT_CFRM_CHG_ORD'))) {
    const rows = gridUtil.getAllRowValues(view, false);
    const reqParams = rows.map((data, index) => ({
      actiGdsStddDvId: data.actiGdsStddDvId,
      actiGdsStddDvNm: data.actiGdsStddDvNm,
      useYn: data.useYn,
      sortOdr: (index) + 1,
    }));
    await dataService.post('sms/wells/competence/business/activity/size-base', reqParams);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

async function onClickDelete() {
  const view = gridPopupRef.value.getView();
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  console.log('deletedRows', deletedRows);
  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/competence/business/activity/size-base', { data: [...deletedRows] });
    await fetchData();
  }
}

async function fetchDetailData(obj) {
  ckActiGdsStddDvId.value = obj;
  console.log('ckActiGdsStddDvId.value', ckActiGdsStddDvId.value);
  const cachedParams = {
    actiGdsStddDvId: obj,
  };
  const res = await dataService.get('/sms/wells/competence/business/activity/size-detail', { params: cachedParams });
  const view = gridDetailRef.value.getView();
  console.log('res.data', res.data);
  totalDetailCount.value = res.data.length;
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickDetailAdd() {
  console.log('ckActiGdsStddDvId.value ', ckActiGdsStddDvId.value);
  if (totalCount.value === 0) {
    alert(t('사이즈 구분을 저장후 등록 가능 합니다.'));
    return;
  }
  if (ckActiGdsStddDvId.value === undefined) {
    alert(t('저장된 사이즈 구분을 선택해 주세요.'));
    return;
  }
  const view = gridDetailRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    actiGdsStddDvId: ckActiGdsStddDvId.value,
    actiGdsStddCd: '',
    actiGdsStddNm: '',
    sortOdr: 0,
    useYn: 'Y',
  });
}

async function onClickDetailDelete() {
  const view = gridDetailRef.value.getView();
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/competence/business/activity/size-detail', { data: [...deletedRows] });
    await fetchData();
  }
}

async function onClickDetailSave() {
  if (totalCount.value === 0) {
    alert(t('사이즈 구분을 저장후 등록 가능 합니다.'));
    return;
  }
  const view = gridDetailRef.value.getView();
  if (!await gridUtil.validate(view)) { return; }

  if (await confirm(t('MSG_ALT_CFRM_CHG_ORD'))) {
    const rows = gridUtil.getAllRowValues(view, false);
    const reqParams = rows.map((data, index) => ({
      actiGdsStddDvId: data.actiGdsStddDvId,
      actiGdsStddCd: data.actiGdsStddCd,
      actiGdsStddNm: data.actiGdsStddNm,
      sortOdr: (index) + 1,
      useYn: data.useYn,
    }));
    console.log('reqParams', reqParams);
    await dataService.post('sms/wells/competence/business/activity/size-detail', reqParams);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

onMounted(async () => {
  await fetchData();
  const view = gridPopupRef.value.getView();
  const actiGdsStddDvId = gridUtil.getCellValue(view, 0, 'actiGdsStddDvId');
  await fetchDetailData(actiGdsStddDvId);
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdPopup = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'actiGdsStddDvId' },
    { fieldName: 'actiGdsStddDvNm' },
    { fieldName: 'useYn' },
    { fieldName: 'sortOdr', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'actiGdsStddDvNm', header: t('MSG_TXT_SZ_DV'), width: '150', styleName: 'text-left', rules: 'required', editor: { type: 'text' } },
    { fieldName: 'useYn', header: t('MSG_TXT_USE_SEL'), width: '80', renderer: { type: 'check', trueValues: 'Y', falseValues: 'N' } },
    { fieldName: 'sortOdr', visible: false },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.setRowStyleCallback((g, { dataRow }) => {
    const rowState = data.getRowState(dataRow);
    if (rowState !== RowState.NONE) return 'bg-amber-1';
  });

  view.onCellClicked = async (g, clickData) => {
    const { actiGdsStddDvId } = g.getValues(clickData.itemIndex);
    await fetchDetailData(actiGdsStddDvId);
  };

  view.onCellItemClicked = async (g, itemIndex) => {
    const actiGdsStddDvId = g.getValue(itemIndex, 'actiGdsStddDvId');
    await fetchDetailData(actiGdsStddDvId);
  };
});

const initGridDetail = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'actiGdsStddDvId' },
    { fieldName: 'actiGdsStddCd' },
    { fieldName: 'actiGdsStddNm' },
    { fieldName: 'useYn' },
    { fieldName: 'sortOdr', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'actiGdsStddCd', header: t('MSG_TXT_CODE'), width: '80', styleName: 'text-center', rules: 'required', editor: { type: 'text' } },
    { fieldName: 'actiGdsStddNm', header: t('MSG_TXT_ALTN'), width: '150', styleName: 'text-center', rules: 'required', editor: { type: 'text' } },
    { fieldName: 'useYn', header: t('MSG_TXT_USE_SEL'), width: '80', renderer: { type: 'check', trueValues: 'Y', falseValues: 'N' } },
    { fieldName: 'sortOdr', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.setRowStyleCallback((g, { dataRow }) => {
    const rowState = data.getRowState(dataRow);
    if (rowState !== RowState.NONE) return 'bg-amber-1';
  });
});

</script>
