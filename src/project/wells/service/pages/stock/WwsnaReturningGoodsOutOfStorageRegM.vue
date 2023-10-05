<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaReturningGoodsOutOfStorageRegM - 반품출고 등록
 3. 작성자 : hyewon.kim
 4. 작성일 : 2023.02.13
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 반품출고 등록 (http://localhost:3000/#/service/wwsna-returning-goods-out-of-storage-reg)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      class="kw-search-style"
      :cols="2"
      default-visible-rows="3"
      no-reset-btn
    >
      <kw-search-row>
        <!-- 출고유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_TP')"
          required
        >
          <!-- :readonly="hasProps()" -->
          <kw-select
            v-model="searchParams.ostrTpCd"
            :label="$t('MSG_TXT_OSTR_TP')"
            :options="ostrTpCds"
            rules="required"
            :readonly="true"
            @change="onChangeOstrTp"
          />
        </kw-search-item>
        <!-- 출고창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE')"
          required
        >
          <kw-select
            v-model="searchParams.ostrWareNo"
            :label="$t('MSG_TXT_OSTR_WARE')"
            :options="warehouses"
            rules="required"
            :readonly="hasProps()"
            @change="onChangeOstrWareNo"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 출고일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.ostrDt"
            :label="$t('MSG_TXT_OSTR_DT')"
            rules="required"
            :readonly="hasProps()"
          />
        </kw-search-item>
        <!-- 입고창고 -->
        <kw-search-item :label="$t('MSG_TXT_STR_WARE')">
          <kw-input
            v-model="searchParams.strWareNm"
            icon="search"
            :disable="searchParams.ostrTpCd !== RETURN_INSIDE"
            readonly
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 운송코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_TRNSPN_CD')"
        >
          <kw-select
            v-model="searchParams.trnspnCd"
            :label="$t('MSG_TXT_TRNSPN_CD')"
            :options="trnspnCds"
            :readonly="hasProps()"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_EA') }}</span>
        </template>
        <!-- 삭제 -->
        <kw-btn
          v-permission:delete
          dense
          secondary
          :label="$t('MSG_BTN_DEL')"
          @click="onClickDelete"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 품목 추가 -->
        <kw-btn
          v-permission:create
          dense
          secondary
          :label="$t('MSG_BTN_ITM_SPMT')"
          :disable="canEdit()"
          @click="onClickAddItems"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 상품등급 -->
        <kw-select
          v-model="baseInfo.pdGdCd"
          dense
          class="w150"
          :options="pdGdCds"
          :disable="canEdit()"
        />
        <!-- 등급 일괄변경 -->
        <kw-btn
          v-permission:read
          dense
          secondary
          :label="$t('MSG_BTN_GD_BLK_CH')"
          :disable="canEdit()"
          @click="onClickGridBulkChange(baseInfo.pdGdCd, 'itmGdCd')"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 사유 -->
        <kw-select
          v-model="baseInfo.ostrRsonCd"
          dense
          class="w150"
          :options="ostrRsonCds"
          :disable="canEdit()"
        />
        <!-- 사유 일괄변경 -->
        <kw-btn
          v-permission:read
          dense
          secondary
          :label="$t('MSG_BTN_RSON_BLK_CH')"
          :disable="canEdit()"
          @click="onClickGridBulkChange(baseInfo.ostrRsonCd, 'ostrRsonCd')"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 반품출고 등록 -->
        <kw-btn
          v-permission:update
          primary
          dense
          :label="$t('MSG_BTN_RTNGD_OSTR_RGST')"
          :disable="canEdit()"
          @click="onClickSave"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import useSnCode from '~sms-wells/service/composables/useSnCode';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getters } = useStore();
const dataService = useDataService();

const { getConfig } = useMeta();
const { modal, notify } = useGlobal();

const { getWarehouseCloseCheck } = useSnCode();
const { employeeIDNumber } = getters['meta/getUserInfo'];

// TODO: 출고관리(W-SV-U-0141M01) 그리드 내부 버튼으로 호출된 경우 사용
const props = defineProps({
  ostrTpCd: {
    type: String,
    required: true,
    default: '',
  },
  ostrWareNo: {
    type: String,
    required: true,
    default: '',
  },
  ostrDt: {
    type: String,
    required: true,
    default: '',
  },
  strWareNo: {
    type: String,
    default: '',
  },
  strWareDvCd: { // 입고창고구분코드가 '1' (물류센터) 일 경우 수정 가능
    type: String,
    default: '',
  },
  itmOstrNo: {
    type: String,
    default: '',
  },
});

const DISUSE = '212'; // 폐기출고
const RETURN_INSIDE = '261'; // 반품출고(내부)
const RETURN_OUTSIDE = '262'; // 반품출고(외부)

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'OSTR_TP_CD',
  'WARE_DV_CD',
  'MNGT_UNIT_CD', // 관리단위코드
  'PD_GD_CD', // 상품등급코드
  'RTNGD_RSON_CD', // 반품사유 (출고사유코드)
  'DSU_RSON_CD', // 폐기사유 (출고사유코드)
  'SPP_MTHD_TP_CD', // 배송방식유형코드
);

const pdGdCds = codes.PD_GD_CD.filter((v) => ['A', 'B', 'E', 'R', 'X'].includes(v.codeId));

const trnspnCds = codes.SPP_MTHD_TP_CD.filter((v) => ['6', '5', '0'].includes(v.codeId));

function isReturingCode(codeId) {
  return codeId === RETURN_INSIDE;
}
const ostrTpCds = codes.OSTR_TP_CD.filter((v) => isReturingCode(v.codeId));

const baseInfo = ref({
  pdGdCd: '',
  ostrRsonCd: '',
});

const searchParams = ref({
  ostrTpCd: ostrTpCds[0].codeId, // 출고유형
  ostrWareNo: '', // 출고창고
  ostrDt: dayjs().format('YYYYMMDD'), // 출고일자
  strWareNo: '', // 입고창고
  strWareNm: '', // 입고창고명
  itmOstrNo: '', // 품목출고번호
  strWareDvCd: '',
  trnspnCd: '', // 운송코드
});

const pageInfo = ref({
  totalCount: 0,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const warehouses = ref([]);
const ostrRsonCds = ref(codes.DSU_RSON_CD);

function setTotalCount() {
  pageInfo.value.totalCount = grdMainRef.value.getView().getItemCount();
}

function validateOstrQty(row, val) {
  const grid = grdMainRef.value.getView();
  const onQty = gridUtil.getCellValue(grid, row, 'onQty');

  if (onQty < val) {
    notify(t('MSG_ALT_OSTR_QTY_EXCEEDS_INVEN_QTY'));
    return false;
  }
  return true;
}

function validateInputValueExists(input, inputType) {
  if (input === '') {
    notify(t('MSG_ALT_SELECT_VAL', [inputType]));
    return false;
  }
  return true;
}

function validateIsApplyRowExists() {
  const view = grdMainRef.value.getView();
  if (view.getItemCount() === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return false;
  }
  return true;
}

function onClickGridBulkChange(val, type) {
  const inputType = type === 'itmGdCd' ? '등급' : '사유';

  if (!validateInputValueExists(val, inputType)) return;
  if (!validateIsApplyRowExists()) return;

  const view = grdMainRef.value.getView();
  const rowCount = view.getItemCount();

  for (let dataRow = 0; dataRow < rowCount; dataRow += 1) {
    view.setValue(dataRow, type, val);
  }
  notify(t('MSG_ALT_BULK_APPLY_SUCCESS', [inputType]));
}

function getRowData(rowData) {
  return { ...rowData, sapMatCd: rowData.sapCd, onQty: rowData.myCenterQty || 0, mngtUnitCd: rowData.delUntNm };
}

async function openItemBasePopup(type, row) {
  const { result, payload } = await modal({
    component: 'WwsnaItemBaseInformationListP',
    componentProps: { chk: '1', lpGbYn: type === 'U' ? 'Y' : '' },
  });

  if (result) {
    const view = grdMainRef.value.getView();
    if (type === 'C') {
      view.getDataSource().addRows(payload.map((v) => getRowData(v)));
      view.checkAll(false);
      view.resetCurrent();
    } else if (type === 'U') {
      const rowData = payload?.[0] || {};
      view.setValues(row, getRowData(rowData), true);
    }
    setTotalCount();
  }
}

async function onClickAddItems() {
  await openItemBasePopup('C');
}

function setReasonCellStyle() {
  const ostrRsonCd = grdMainRef.value.getView().columnByField('ostrRsonCd');

  ostrRsonCd.editable = true;
  ostrRsonCd.editor = { type: 'list' };
  ostrRsonCd.labels = ostrRsonCds.value.map((v) => v.codeName);
  ostrRsonCd.values = ostrRsonCds.value.map((v) => v.codeId);
}

function setStrWareNo() {
  const { codeIdUp, codeNameUp, wareDvCdUp } = warehouses.value.find((v) => v.codeId === searchParams.value.ostrWareNo);
  searchParams.value.strWareNo = codeIdUp;
  searchParams.value.strWareNm = codeNameUp;
  searchParams.value.strWareDvCd = wareDvCdUp;
}

function onChangeOstrWareNo() {
  if (searchParams.value.ostrTpCd === RETURN_INSIDE) {
    setStrWareNo();
  }
}

function onChangeOstrTp() {
  const { ostrTpCd } = searchParams.value;

  if (ostrTpCd === DISUSE) {
    ostrRsonCds.value = codes.DSU_RSON_CD;
    searchParams.value.strWareNm = '';
  } else if (ostrTpCd === RETURN_INSIDE) {
    ostrRsonCds.value = codes.RTNGD_RSON_CD;
    setStrWareNo();
  } else if (ostrTpCd === RETURN_OUTSIDE) {
    searchParams.value.strWareNm = '';
  }

  setReasonCellStyle();
}

function setSearchParams() {
  const { ostrTpCd, ostrWareNo, ostrDt, strWareNo, itmOstrNo } = props;
  searchParams.value.ostrTpCd = ostrTpCd;
  searchParams.value.ostrWareNo = ostrWareNo;
  searchParams.value.ostrDt = ostrDt;
  searchParams.value.strWareNo = strWareNo;
  searchParams.value.itmOstrNo = itmOstrNo;
}

const itemOutOfStorage = ref();
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/returning-goods-out-of-storages', { params: searchParams.value });
  const { itemOutOfStorage: itemOstr, returningGoods } = res.data;

  itemOutOfStorage.value = itemOstr;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(returningGoods);
}

async function fetchDefaultData() {
  const res = await dataService.get('/sms/wells/service/returning-goods-out-of-storages/warehouses', { params: { userId: employeeIDNumber, apyYm: dayjs().format('YYYYMM') } });
  warehouses.value = res.data;
  if (!res.data[0]) return;

  const { codeId } = res.data[0];
  searchParams.value.ostrWareNo = codeId;
}

function isNotEmpty(obj) {
  return (obj !== undefined && obj !== null && obj !== '');
}

function hasProps() {
  return isNotEmpty(props.ostrTpCd) && isNotEmpty(props.ostrWareNo) && isNotEmpty(props.ostrDt);
}

// 출고창고마감 여부 체크
async function isWarehouseClosed() {
  if (!await getWarehouseCloseCheck(searchParams.value.ostrDt, searchParams.value.ostrWareNo)) {
    notify(t('MSG_ALT_DATE_EDIT_OUT_PUT'));
    return true;
  }
  return false;
}

async function onClickDelete() {
  if (await isWarehouseClosed()) return;

  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return;
  }

  // 반품출고 여부 체크
  const returnedGoods = checkedRows.filter((v) => (v.strConfDt !== '' && v.strConfDt !== null && v.strConfDt !== undefined));
  if (returnedGoods.length > 0) {
    notify(t('MSG_ALT_RTNGD_OSTR_FINISH_DEL_IMPSB'));
    return;
  }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  setTotalCount();

  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/service/returning-goods-out-of-storages', { data: deletedRows.map((v) => ({ ...searchParams.value, ...v })) });
  }
}

// 입고마감 체크
async function validateClosed(itmOstrNo) {
  const { data: isClosed } = await dataService.get('/sms/wells/service/returning-goods-out-of-storages/deadline-check', { params: { itmOstrNo } });
  if (isClosed) {
    notify(t('MSG_ALT_ALREADY_CLOSED_MOD_NOT_POSSIBLE'));
    return false;
  }
  return true;
}

async function onClickSave() {
  const view = grdMainRef.value.getView();

  if (gridUtil.getCheckedRowValues(view).length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return;
  }
  if (!(await gridUtil.validate(view, { isCheckedOnly: true }))) { return; }

  const rowCount = view.getItemCount();

  for (let dataRow = 0; dataRow < rowCount; dataRow += 1) {
    const ostrQty = gridUtil.getCellValue(view, dataRow, 'ostrQty');
    if (!validateOstrQty(dataRow, ostrQty)) return;
  }

  // 파주물류센터일 경우 운송코드 필수체크 추가
  if (searchParams.value.strWareNo === '100002' && searchParams.value.trnspnCd === '') {
    notify(t('MSG_ALT_TRNSPN_CD_ATC_VAL_OMSSN_CONF_NCST'));
    return;
  }

  // searchParams 값 체크
  if (searchParams.value.ostrTpCd === '' || searchParams.value.ostrWareNo === '' || searchParams.value.ostrDt === ''
    || ((searchParams.value.ostrTpCd === RETURN_INSIDE || searchParams.value.ostrTpCd === RETURN_OUTSIDE) && searchParams.value.strWareNo === '')) {
    notify(t('MSG_ALT_MISSING_VALUE_PLEASE_CHECK'));
    return;
  }

  if (await isWarehouseClosed()) return;

  const checkedRows = gridUtil.getCheckedRowValues(view);
  const itmOstrNo = checkedRows.map((v) => v.itmOstrNo)[0];

  // 신규 등록이 아닌 수정 건인 경우 입고마감 여부 체크
  if (hasProps() && !await validateClosed(itmOstrNo)) return;

  let params = searchParams.value;
  // 수정 건의 경우 (창고구분코드 = '1' 물류센터)
  if (hasProps() && props.strWareDvCd === '1') {
    params = itemOutOfStorage.value;
  }

  await dataService.post('/sms/wells/service/returning-goods-out-of-storages', checkedRows.map((v) => ({ ...v, ...params })));

  notify(t('MSG_ALT_SAVE_DATA'));

  view.getDataSource().clearRows();
  view.setAllCheck(false);
}

onMounted(async () => {
  await fetchDefaultData();
  onChangeOstrTp();
  if (hasProps()) {
    setSearchParams();
    await fetchData();
  }
});

function canEdit() {
  return hasProps() && props.strWareDvCd !== '1';
}

function setCellEditableFalse() {
  if (canEdit()) {
    return { editable: false };
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'itmPdNm' },
    { fieldName: 'itmGdCd' },
    { fieldName: 'onQty', dataType: 'number' },
    { fieldName: 'mngtUnitCd' },
    { fieldName: 'ostrRsonCd' },
    { fieldName: 'ostrQty', dataType: 'number' },
    { fieldName: 'rmkCn' },
    { fieldName: 'strConfDt' },
    { fieldName: 'itmOstrNo' },
    { fieldName: 'ostrSn' },
    { fieldName: 'itmStrNo' },
    { fieldName: 'strSn' },
    { fieldName: 'itmKndCd' },
    { fieldName: 'acbDt' },
    { fieldName: 'evidDvCd' },
    { fieldName: 'strTpCd' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '170', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '140', styleName: 'text-center' },
    { fieldName: 'itmPdNm',
      header: t('MSG_TXT_ITM_NM'),
      width: '200',
      button: 'action',
      styleName: 'rg-button-icon--search',
      styleCallback: () => {
        if (canEdit()) {
          return { styleName: 'rg-button-hide' };
        }
      },
    },
    { fieldName: 'itmGdCd',
      header: t('MSG_TXT_GD'),
      width: '100',
      styleName: 'text-center',
      editable: true,
      editor: { type: 'list' },
      options: pdGdCds,
      rules: 'required',
      styleCallback: setCellEditableFalse,
    },
    { fieldName: 'onQty', header: t('MSG_TXT_STOC_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'mngtUnitCd',
      header: t('MSG_TXT_MNGT_UNIT'),
      width: '100',
      styleName: 'text-center',
      options: codes.MNGT_UNIT_CD,
    },
    { fieldName: 'ostrRsonCd',
      header: t('MSG_TXT_RSN'),
      width: '150',
      styleName: 'text-center',
      editable: true,
      editor: {
        type: 'list',
      },
      options: ostrRsonCds.value,
      rules: `required|one_of:${ostrRsonCds.value.map((v) => v.codeId)}`,
      styleCallback: setCellEditableFalse,
    },
    { fieldName: 'ostrQty',
      header: t('MSG_TXT_OSTR_QTY'),
      width: '100',
      styleName: 'text-right',
      editable: true,
      rules: 'required|min_value:1',
      numberFormat: '###,###,###,##0',
      editor: {
        type: 'number',
      },
      styleCallback: setCellEditableFalse,
    },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      width: '397',
      editable: true,
      styleCallback: setCellEditableFalse,
    },
    { fieldName: 'strConfDt' },
    { fieldName: 'itmOstrNo' },
    { fieldName: 'ostrSn' },
    { fieldName: 'itmStrNo' },
    { fieldName: 'strSn' },
    { fieldName: 'itmKndCd' },
    { fieldName: 'acbDt' },
    { fieldName: 'evidDvCd' },
    { fieldName: 'strTpCd' },
  ];

  const columnLayout = [
    'sapMatCd',
    'itmPdCd',
    'itmPdNm',
    'itmGdCd',
    'onQty',
    'mngtUnitCd',
    'ostrRsonCd',
    'ostrQty',
    'rmkCn',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onCellClicked = async (grid, { column, dataRow }) => {
    if (canEdit()) return;
    if (column === 'itmPdNm') {
      await openItemBasePopup('U', dataRow);
    }
  };

  view.onGetEditValue = async (grid, index, editResult) => {
    grid.checkItem(index.itemIndex, true);

    if (index.fieldName === 'ostrQty') {
      validateOstrQty(index.dataRow, editResult.value);
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
