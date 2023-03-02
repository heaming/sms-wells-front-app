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
 - 반품출고 등록 (http://localhost:3000/#/service/wwsnc-responsible-area-charge-mgt)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      class="kw-search-style"
      :cols="2"
      no-reset-btn
    >
      <kw-search-row>
        <!-- 출고유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_TP')"
          required
        >
          <kw-select
            v-model="searchParams.ostrTpCd"
            :label="$t('MSG_TXT_OSTR_TP')"
            :options="ostrTpCds"
            rules="required"
            :readonly="hasProps()"
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
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
        <!-- 삭제 -->
        <kw-btn
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
          dense
          secondary
          :label="$t('MSG_BTN_ITM_SPMT')"
          :disable="hasProps() && props.strWareDvCd !== '1'"
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
          :options="codes.PD_GD_CD"
          :disable="hasProps() && props.strWareDvCd !== '1'"
        />
        <!-- 등급 일괄변경 -->
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_GD_BLK_CH')"
          :disable="hasProps() && props.strWareDvCd !== '1'"
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
          :disable="hasProps() && props.strWareDvCd !== '1'"
        />
        <!-- 사유 일괄변경 -->
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_RSON_BLK_CH')"
          :disable="hasProps() && props.strWareDvCd !== '1'"
          @click="onClickGridBulkChange(baseInfo.ostrRsonCd, 'ostrRsonCd')"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 반품출고 등록 -->
        <kw-btn
          primary
          dense
          :label="$t('MSG_BTN_RTNGD_OSTR_RGST')"
          :disable="hasProps() && props.strWareDvCd !== '1'"
          @click="onClickSave"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
// import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import useSnCode from '~sms-wells/service/composables/useSnCode';
import dayjs from 'dayjs';

const { t } = useI18n();
const dataService = useDataService();

const { getConfig } = useMeta();
const { modal, notify } = useGlobal();

const { getWarehouseCloseCheck } = useSnCode();

// TODO: 출고관리(W-SV-U-0141M01) 그리드 내부 버튼으로 호출된 경우 사용
const props = defineProps({
  ostrTpCd: {
    type: String,
    required: true,
    default: '212',
  },
  ostrWareNo: {
    type: String,
    required: true,
    default: '200005',
  },
  ostrDt: {
    type: String,
    required: true,
    default: '20230221',
  },
  strWareNo: {
    type: String,
    default: '',
  },
  strWareDvCd: { // TODO: 입고창고구분코드가 '1' (물류센터) 일 경우 수정 가능
    type: String,
    default: '1',
  },
  itmOstrNo: {
    type: String,
    default: '212202302210000001',
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
);

console.log(codes.DSU_RSON_CD);

function isReturingCode(codeId) {
  return codeId === DISUSE || codeId === RETURN_INSIDE || codeId === RETURN_OUTSIDE;
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
});

const pageInfo = ref({
  totalCount: 0,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const warehouses = ref([]);
const ostrRsonCds = ref(codes.DSU_RSON_CD);

function validateOstrQty(row, val) {
  const grid = grdMainRef.value.getView();
  const onQty = gridUtil.getCellValue(grid, row, 'onQty');
  if (typeof onQty !== 'number') return false;
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
  console.log(`${val} - ${type}`);
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

async function openItemBasePopup(itmCd) {
  const result = await modal({
    // component: 'WwsnaItemBaseInformationListP', // 품목기본정보 팝업 호출
    component: 'WwsndWorkNoticeRegP', // TODO: 테스트용
    componentProps: { itmCd },
  });

  console.log(result);
}

async function onClickAddItems() {
  await openItemBasePopup();
}

function setReasonCellStyle() {
  const ostrRsonCd = grdMainRef.value.getView().columnByField('ostrRsonCd');

  ostrRsonCd.editable = true;
  ostrRsonCd.editor = { type: 'list' };
  ostrRsonCd.labels = ostrRsonCds.value.map((v) => v.codeName);
  ostrRsonCd.values = ostrRsonCds.value.map((v) => v.codeId);
}

function onChangeOstrTp(ostrTpCd) {
  console.log(ostrTpCd);

  if (ostrTpCd === DISUSE) {
    ostrRsonCds.value = codes.DSU_RSON_CD;
    searchParams.value.strWareNm = '';
  } else {
    ostrRsonCds.value = codes.RTNGD_RSON_CD;

    const { codeIdUp, codeNameUp } = warehouses.value.find((v) => v.codeId === searchParams.value.ostrWareNo);
    searchParams.value.strWareNo = codeIdUp;
    searchParams.value.strWareNm = codeNameUp;
  }

  setReasonCellStyle();
}

// TODO: 수정 필요
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
  const res = await dataService.get(`/sms/wells/service/returning-goods-out-of-storages/${props.itmOstrNo}`);
  const { itemOutOfStorage: itemOstr, returningGoods } = res.data;
  console.log(res.data);
  itemOutOfStorage.value = itemOstr;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(returningGoods);
  view.resetCurrent();
}

async function fetchDefaultData() {
  const testUserId = '36631'; // TODO: 수정 필요
  const res = await dataService.get('/sms/wells/service/returning-goods-out-of-storages/warehouses', { params: { userId: testUserId, apyYm: dayjs().format('YYYYMM') } });
  warehouses.value = res.data;
  const { codeId } = res.data[0];
  searchParams.value.ostrWareNo = codeId;
  console.log(res.data);
}

async function onClickDelete() {
  // 출고창고마감 여부 체크
  if (await getWarehouseCloseCheck(props.ostrDt, props.ostrWareNo)) {
    notify(t('MSG_ALT_DATE_EDIT_OUT_PUT'));
    return;
  }

  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return;
  }

  // 반품출고 여부 체크
  const returnedGoods = checkedRows.filter((v) => (v.strConfDt !== '' || v.strConfDt !== null));
  if (returnedGoods.length > 0) {
    notify(t('MSG_ALT_RTNGD_OSTR_FINISH_DEL_IMPSB'));
    return;
  }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  await dataService.delete('/sms/wells/service/returning-goods-out-of-storages', { data: deletedRows });
  await fetchData();
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

function isNotEmpty(obj) {
  return (obj !== undefined && obj !== null && obj !== '');
}

function hasProps() {
  return isNotEmpty(props.ostrTpCd) && isNotEmpty(props.ostrWareNo) && isNotEmpty(props.ostrDt);
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

  // searchParams 값 체크
  if (searchParams.value.ostrTpCd === '' || searchParams.value.ostrWareNo === '' || searchParams.value.ostrDt === ''
    || ((searchParams.value.ostrTpCd === RETURN_INSIDE || searchParams.value.ostrTpCd === RETURN_OUTSIDE) && searchParams.value.strWareNo === '')) {
    notify(t('MSG_ALT_MISSING_VALUE_PLEASE_CHECK'));
    return;
  }

  // 출고창고마감 여부 체크
  if (await getWarehouseCloseCheck(props.ostrDt, props.ostrWareNo)) {
    notify(t('MSG_ALT_DATE_EDIT_OUT_PUT'));
    return;
  }

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
  await fetchData();
}

onMounted(async () => {
  await fetchDefaultData();
  if (hasProps()) {
    setSearchParams();
    await fetchData();
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'itmPdCd' },
    { fieldName: 'itmCd' },
    { fieldName: 'itmNm' },
    { fieldName: 'itmGdCd' },
    { fieldName: 'onQty', dataType: 'number' },
    { fieldName: 'mngtUnitCd' },
    { fieldName: 'ostrRsonCd' },
    { fieldName: 'ostrQty', dataType: 'number' },
    { fieldName: 'rmkCn' },
    { fieldName: 'strConfDt' },
    { fieldName: 'itmOstrNo' },
    { fieldName: 'ostrSn' },
    { fieldName: 'itmKndCd' },
    { fieldName: 'acbDt' },
    { fieldName: 'evidDvCd' },
    { fieldName: 'strTpCd' },
  ];

  // TODO: 다른 화면에서 호출한 경우(입고창고 물류센터인 경우 제외) 조회, 삭제만 가능. 추가, 수정 불가능.
  const columns = [
    { fieldName: 'itmPdCd', header: t('MSG_TXT_SAP_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmNm',
      header: t('MSG_TXT_ITM_NM'),
      width: '160',
      styleName: 'rg-button-icon--search',
      button: 'action',
    },
    { fieldName: 'itmGdCd',
      header: t('MSG_TXT_GD'),
      width: '100',
      styleName: 'text-center',
      editable: true,
      editor: { type: 'list' },
      options: codes.PD_GD_CD,
      rules: 'required' },
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
    },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      width: '397',
      editable: true },
    { fieldName: 'strConfDt' },
    { fieldName: 'itmOstrNo' },
    { fieldName: 'ostrSn' },
    { fieldName: 'itmKndCd' },
    { fieldName: 'acbDt' },
    { fieldName: 'evidDvCd' },
    { fieldName: 'strTpCd' },
  ];

  const columnLayout = [
    'itmPdCd',
    'itmCd',
    'itmNm',
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

  view.onCellClicked = async (grid, { column, itemIndex }) => {
    if (column === 'itmNm') {
      const itmCd = grid.getValue(itemIndex, 'itmCd');
      console.log(itmCd);

      await openItemBasePopup(itmCd);
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
</style>
