<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaEtcOutOfStorageRegM[W-SV-U-0143M01] - 기타출고 등록
 3. 작성자 : songTaeSung
 4. 작성일 : 2023.02.10
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 기타출고등록 관리 (http://localhost:3000/#/service/wwsna-etc-out-of-storage-reg)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="result-area">
      <kw-form
        :cols="3"
        class="mb38 mt20"
      >
        <kw-form-row>
          <!-- 출고창고 -->
          <kw-form-item
            :label="$t('MSG_TXT_OSTR_WARE')"
            required
          >
            <kw-select
              v-model="searchParams.ostrWareNo"
              :options="warehouses"
              :readonly="isPropsNullChk()"
              :label="$t('MSG_TXT_OSTR_WARE')"
              rules="required"
            />
          </kw-form-item>
          <!-- 출고일자 -->
          <kw-form-item
            :label="$t('MSG_TXT_OSTR_DT')"
            required
          >
            <kw-date-picker
              v-model="searchParams.ostrDt"
              :readonly="isPropsNullChk()"
              :label="$t('MSG_TXT_OSTR_DT')"
              rules="required"
            />
          </kw-form-item>
          <!-- //TODO: 청구부서 조직데이터 생성시 변경예정 -->
          <kw-form-item
            :label="$t('MSG_TXT_BIL_DEPARTMENT')"
            required
          >
            <kw-select
              v-model="searchParams.bilDept"
              :options="strDept"
              :readonly="isPropsNullChk()"
              first-option="select"
              :label="$t('MSG_TXT_BIL_DEPARTMENT')"
              rules="required"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row />
      </kw-form>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
        <!-- 삭제버튼 -->
        <kw-btn
          v-permission:delete
          dense
          secondary
          :label="$t('MSG_TXT_DEL')"
          class="w80"
          @click="onClickDelete"
        />

        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 등급선택 -->
        <kw-select
          v-model="etcInfo.pdGdCd"
          dense
          :options="filterCodes.pdGdCd"
          :disable="canEdit()"
          class="w200"
        />
        <!-- 청구사유 선택 -->
        <kw-select
          v-model="etcInfo.bilRsonCd"
          dense
          class="w200"
          :disable="canEdit()"
          :options="codes.BIL_RSON_CD"
        />
        <!-- 출고수량 입력 -->
        <kw-input
          v-model="etcInfo.ostrQty"
          dense
          class="w150"
          :disable="canEdit()"
          :label="$t('MSG_TXT_OSTR_QTY')"
          rules="min_value:1|max_value:999999999999"
          :placeholder="$t('MSG_TXT_OSTR_QUANTITY_INPUT')"
        />
        <!-- 비고입력 -->
        <kw-input
          v-model="etcInfo.rmk"
          dense
          class="w150"
          :disable="canEdit()"
          :placeholder="$t('MSG_TXT_NOTE_INP')"
        />
        <!-- 일괄변경 -->
        <kw-btn
          v-permission:read
          dense
          secondary
          :label="$t('MSG_TXT_BLK_CH')"
          class="w100"
          :disable="canEdit()"

          @click="onClickAllSet"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 품목추가버튼 -->
        <kw-btn
          v-permission:create
          dense
          secondary
          :disable="canEdit()"
          :label="$t('MSG_TXT_ITM_SPMT')"
          @click="onClickItemAdd"
        />
        <kw-separator
          spaced
          vertical
          inset
        />

        <!-- 등록버튼 -->
        <kw-btn
          v-permission:update
          dense
          primary
          :label="$t('MSG_TXT_RGS')"
          class="w70"
          :disable="canEdit()"
          @click="onClickSave"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, useDataService, getComponentType, gridUtil, useGlobal, useMeta } from 'kw-lib';
// import { onMounted } from 'vue';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const { getWarehouseCloseCheck } = useSnCode();

// 로그인한 사용자의 창고정보 조회
const { getMonthWarehouse } = useSnCode();

const { t } = useI18n();
const dataService = useDataService();// const { getConfig } = useMeta();
const grdMainRef = ref(getComponentType('KwGrid'));
const { getUserInfo } = useMeta();
const { alert, notify, modal } = useGlobal();
const store = useStore();
const sessionUserInfo = getUserInfo();
const ROL_ID = 'ROL_W1580';

// TODO: 출고관리(W-SV-U-0141M01) 에서 호출 시 분기처리 현재테스트 진행중
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
  itmOstrNo: {
    type: String,
    required: true,
    default: '',
  },
  bilDept: {
    type: String,
    required: true,
    default: '',
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const codes = await codeUtil.getMultiCodes(
  'PD_GD_CD',
  'BIL_RSON_CD',
  'MNGT_UNIT_CD',
);
// 조회파라미터
const searchParams = ref({
  ostrDt: '',
  ostrWareNo: '',
  bilDept: '',
  itmOstrNo: '',
  wareDvCd: '',
});

const sessionRole = sessionUserInfo.roles.map((x) => x.roleNickName);
const useRole = sessionRole.includes(ROL_ID);

const wharehouseParams = ref({
  apyYm: dayjs().format('YYYYMM'),
  // WM : 1642720
  userId: store.getters['meta/getUserInfo'].employeeIDNumber,
});

const etcInfo = ref({
  ostrQty: '',
  rmk: '',
  pdGdCd: '',
  bilRsonCd: '',
});

const filterCodes = ref({
  pdGdCd: [],
});

// 코드값 필터링
function codeFilter() {
  filterCodes.value.pdGdCd = codes.PD_GD_CD.filter((v) => ['A', 'B', 'E', 'R'].includes(v.codeId));
}

const strDept = ref();

const totalCount = ref(0);

// 출고수량 validate
function validateOstrQty(row, val) {
  const grid = grdMainRef.value.getView();
  const onQty = gridUtil.getCellValue(grid, row, 'onQty');

  if (onQty < val) {
    notify(t('MSG_ALT_OSTR_QTY_EXCEEDS_INVEN_QTY'));
    return false;
  }
  return true;
}

// 파라미터 설정
function setSearchParams() {
  const { ostrTpCd, ostrDt, ostrWareNo, bilDept, itmOstrNo } = props;

  searchParams.value.ostrTpCd = ostrTpCd;
  searchParams.value.ostrDt = ostrDt;
  searchParams.value.ostrWareNo = ostrWareNo;
  searchParams.value.bilDept = bilDept;
  searchParams.value.itmOstrNo = itmOstrNo;
}

// 총건수 설정
function setTotalCount() {
  totalCount.value = grdMainRef.value.getView().getItemCount();
}

searchParams.value.ostrDt = dayjs().format('YYYYMMDD');

// 체크된 내역이 없을시 notify로 메세지 출력
function validateIsApplyRowExists() {
  const view = grdMainRef.value.getView();
  if (view.getCheckedItems().length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return false;
  }
  return true;
}
// 그리드 출고수량 체크
function validateSaveRowData() {
  const reqbilDept = searchParams.value.bilDept;

  if (isEmpty(reqbilDept)) {
    alert(t('MSG_ALT_BIL_DEPT_CHO'));
    return false;
  }
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  for (let i = 0; i < chkRows.length; i += 1) {
    if (chkRows[i].ostrQty === '0') {
      alert(t('MSG_ALT_OSTR_QTY_ZERO_BE_BIG'));
      return false;
    }
    if (isEmpty(chkRows[i].itmPdCd)) {
      // 품목코드 항목에 값이 비어있습니다. 확인하여주십시오.
      alert(t('MSG_ALT_ITM_CD_ATC_NULL_CONF'));
      return false;
    }
    if (isEmpty(chkRows[i].itmGdCd)) {
      // 등급코드 항목에 값이 비어있습니다. 확인하여주십시오.
      alert(t('MSG_ALT_GD_CD_ATC_NULL_CONF'));
      return false;
    }
    if (isEmpty(chkRows[i].ostrRsonCd)) {
      // 청구사유 항목이 비어있습니다. 확인하여주십시오.
      alert(t('MSG_ALT_BIL_RSON_ATC_NULL_CONF'));
      return false;
    }
    if (chkRows[i].ostrQty <= 0) {
      // 출고수량은 0보다 커야합니다.
      alert(t('MSG_ALT_OSTR_QTY_ZERO_BE_BIG'));
      return false;
    }
    if (chkRows[i].onQty < chkRows[i].ostrQty) {
      // 출고수량이 재고수량을 초과합니다.
      alert(t('MSG_ALT_OSTR_QTY_EXCEEDS_INVEN_QTY'));
      return false;
    }
  }
  return true;
}

let cachedParams;

// null 체크
function isNullChk(obj) {
  return (obj !== undefined && obj !== null && obj !== '');
}

// 부모창에서 넘어온 데이터 null 체크
function isPropsNullChk() {
  // eslint-disable-next-line max-len
  return isNullChk(props.ostrTpCd) && isNullChk(props.ostrWareNo) && isNullChk(props.ostrDt) && isNullChk(props.bilDept);
}

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/etc-out-of-storages', { params: cachedParams });

  const baseData = res.data;
  totalCount.value = res.data.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(baseData);
  view.resetCurrent();
}

const warehouses = ref();

// 영업센터 창고 조회
async function fetchBsDefaultData() {
  const { apyYm } = wharehouseParams.value;
  const res = await dataService.get(`/sms/wells/service/etc-out-of-storages/wells-business/${apyYm}`);
  warehouses.value = res.data;
  searchParams.value.ostrWareNo = warehouses.value[0].codeId;
  searchParams.value.wareDvCd = warehouses.value[0].wareDvCd;

  const res2 = await dataService.get('/sms/wells/service/etc-out-of-storages/dept');
  strDept.value = res2.data;
}

// 서비스센터 창고 조회
async function fetchDefaultData() {
  const { apyYm } = wharehouseParams.value;
  const { userId } = wharehouseParams.value;

  warehouses.value = await getMonthWarehouse(userId, apyYm);
  if (!isEmpty(warehouses.value)) {
    searchParams.value.ostrWareNo = warehouses.value[0].codeId;
  }

  const res = await dataService.get('/sms/wells/service/etc-out-of-storages/dept');
  strDept.value = res.data;
}

// 저장
async function onClickSave() {
  if (!validateIsApplyRowExists()) return;

  // 저장시 데이터정합성 체크
  if (!validateSaveRowData()) return;
  const view = grdMainRef.value.getView();
  if (!await gridUtil.validate(view, { isCheckedOnly: true })) return;

  const chkRows = gridUtil.getCheckedRowValues(view);

  const params = searchParams.value;
  await dataService.post('/sms/wells/service/etc-out-of-storages', chkRows.map((v) => ({ ...v, ...params })));

  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

// 삭제
async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return;
  }

  for (let i = 0; i < chkRows.length; i += 1) {
    if (chkRows[i].ostrQty === '0') {
      // 출고수량은 0보다 커야합니다.
      alert(t('MSG_ALT_OSTR_QTY_ZERO_BE_BIG'));
      return;
    }
  }
  const chkOstrDt = searchParams.value.ostrDt;
  const chkOjWareNo = searchParams.value.ostrWareNo;
  // 출고창고마감내역 공통추가 처리
  const checkWarehouse = await getWarehouseCloseCheck(chkOstrDt, chkOjWareNo);

  if (!checkWarehouse) {
    // 해당 출고일자는 이미 마감이 완료되어, 출고수정작업이 불가합니다.
    await alert(t('MSG_ALT_DATE_EDIT_OUT_PUT'));
    return;
  }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  setTotalCount();

  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/service/etc-out-of-storages', { data: deletedRows });
    notify(t('MSG_ALT_DELETED')); // 삭제되었습니다.
    await fetchData();
  }
}

// 그리드 데이터 체크
function setCheckedGridValue(view, row, value, column) {
  view.setValue(row, column, value);
}

// 품목기본정보에서 넘어온 데이터 설정
function getRowData(rowData) {
  // eslint-disable-next-line max-len
  return { ...rowData, sapMatCd: rowData.sapCd, onQty: rowData.myCenterQty || 0, pdabbrNm: rowData.itmPdAbbr1 };
}

// 품목기본정보 팝업 호출
const chk = '1';
async function openItemBasePopup(type, row) {
  const { result, payload } = await modal({
    component: 'WwsnaItemBaseInformationListP',
    componentProps: { chk, wareDvCd: searchParams.value.wareDvCd, wareNo: searchParams.value.ostrWareNo },
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

// 품목추가 버튼클릭 이벤트
async function onClickItemAdd() {
  await openItemBasePopup('C');
}

// 일괄변경 버튼클릭 이벤트
function onClickAllSet() {
  if (!validateIsApplyRowExists()) return;

  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  console.log(checkedRows);
  for (let i = 0; i < checkedRows.length; i += 1) {
    if (!isEmpty(etcInfo.value.ostrQty)) {
      setCheckedGridValue(view, checkedRows[i].dataRow, etcInfo.value.ostrQty, 'ostrQty');
    }
    if (!isEmpty(etcInfo.value.rmk)) {
      setCheckedGridValue(view, checkedRows[i].dataRow, etcInfo.value.rmk, 'rmkCn');
    }
    if (!isEmpty(etcInfo.value.pdGdCd)) {
      setCheckedGridValue(view, checkedRows[i].dataRow, etcInfo.value.pdGdCd, 'itmGdCd');
    }
    if (!isEmpty(etcInfo.value.bilRsonCd)) {
      setCheckedGridValue(view, checkedRows[i].dataRow, etcInfo.value.bilRsonCd, 'ostrRsonCd');
    }
  }
  // setCheckedGridValue
}

function canEdit() {
  return isPropsNullChk();
}

function setCellEditableFalse() {
  if (canEdit()) {
    return { editable: false };
  }
}

onMounted(async () => {
  codeFilter();
  if (useRole) {
    await fetchBsDefaultData();
  } else {
    await fetchDefaultData();
  }
  if (isPropsNullChk()) {
    setSearchParams();
    cachedParams = cloneDeep(searchParams.value);
    await fetchData();
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'itmNm' },
    { fieldName: 'pdAbbrNm' },
    { fieldName: 'itmGdCd' },
    { fieldName: 'onQty', dataType: 'number' },
    { fieldName: 'mngtUnitCd' },
    { fieldName: 'ostrQty', dataType: 'number' },
    { fieldName: 'ostrRsonCd' },
    { fieldName: 'rmkCn' },
    { fieldName: 'wareNm' },
    { fieldName: 'wareMngtPrtnrNo' },
    { fieldName: 'itmOstrNo' },
    { fieldName: 'ostrTpCd' },
    { fieldName: 'ostrWareNo' },
    { fieldName: 'ostrSn' },
    { fieldName: 'itmKndCd' },
    { fieldName: 'ostrDt' },

  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '124', styleName: 'text-center' },
    { fieldName: 'itmPdCd',
      header: t('MSG_TXT_ITM_CD'),
      styleName: 'rg-button-icon--search',
      button: 'action',
      width: '178' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '322', styleName: 'text-left' },
    // { fieldName: 'itmNm', header: t('MSG_TXT_ITM_NM'), width: '322', styleName: 'text-left' },
    { fieldName: 'itmGdCd',
      header: {
        text: t('MSG_TXT_GD'),
        styleName: 'essential',
      },
      options: codes.PD_GD_CD,
      editor: { type: 'list' },
      editable: true,
      width: '90',
      styleName: 'text-center',
      styleCallback: setCellEditableFalse,
    },
    { fieldName: 'onQty', header: t('MSG_TXT_STOC_QTY'), width: '110', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'mngtUnitCd', header: t('MSG_TXT_MNGT_UNIT'), width: '100', styleName: 'text-center', options: codes.MNGT_UNIT_CD },
    // 청구사유
    { fieldName: 'ostrRsonCd',
      header: {
        text: t('MSG_TXT_BIL_RSON'),
        styleName: 'essential',
      },
      editor: { type: 'list' },
      editable: true,
      options: codes.BIL_RSON_CD,
      width: '150',
      styleName: 'text-center',
      styleCallback: setCellEditableFalse,
    },
    { fieldName: 'ostrQty',
      header: t('MSG_TXT_OSTR_QTY'),
      editor: {
        type: 'number',
        editable: true },
      rules: 'required|min_value:1|max_value:999999999999',
      editable: true,
      width: '110',
      styleName: 'text-right',
      styleCallback: setCellEditableFalse,
    },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      rules: 'max:4000',
      editable: true,
      width: '264',
      styleName: 'text-left',
      styleCallback: setCellEditableFalse,
    },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onCellButtonClicked = async (grid, { column, itemIndex }) => {
    if (canEdit()) {
      return { styleName: 'rg-button-hide' };
    }
    console.log(itemIndex);
    if (column === 'itmPdCd') {
      const itmPdCd = grid.getValue(itemIndex, 'itmPdCd');
      const { result, payload } = await modal({
        component: 'WwsnaItemBaseInformationListP',
        componentProps: { chk, itmPdCd },
      });

      if (result) {
        console.log(payload);
        view.getDataSource().updateRows(itemIndex, payload);
      }
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
