<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : W-SV-U-0143M01 - 기타출고 등록
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
        class="mb68 mt20"
      >
        <kw-form-row>
          <!-- 출고창고 -->
          <kw-form-item
            :label="$t('MSG_TXT_OSTR_WARE')"
            required
          >
            <kw-select
              v-model="searchParams.strOjWareNo"
              :options="warehouses"
            />
          </kw-form-item>
          <!-- 출고일자 -->
          <kw-form-item
            :label="$t('MSG_TXT_OSTR_DT')"
            required
          >
            <kw-date-picker
              v-model="searchParams.ostrDt"
            />
          </kw-form-item>
          <!-- //TODO: 청구부서 조직데이터 생성시 변경예정 -->
          <kw-form-item
            :label="$t('MSG_TXT_BIL_DEPARTMENT')"
          >
            <kw-select
              v-model="searchParams.bilDept"
              :options="['물류지원팀성수파트(1116)', 'B', 'C', 'D']"
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
        <!-- 인쇄버튼 -->
        <kw-btn
          icon="print"
          dense
          secondary
          label="인쇄"
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
          :options="codes.PD_GD_CD"
          class="w200"
        />
        <!-- 청구사유 선택 -->
        <kw-select
          v-model="etcInfo.bilRsonCd"
          dense
          class="w200"
          :options="codes.BIL_RSON_CD"
        />
        <!-- 출고수량 입력 -->
        <kw-input
          v-model="etcInfo.ostrQty"
          dense
          class="w150"
          :placeholder="$t('MSG_TXT_OSTR_QUANTITY_INPUT')"
        />
        <!-- 비고입력 -->
        <kw-input
          v-model="etcInfo.rmk"
          dense
          class="w150"
          :placeholder="$t('MSG_TXT_NOTE_INP')"
        />
        <!-- 일괄변경 -->
        <kw-btn
          dense
          secondary
          :label="$t('MSG_TXT_BLK_CH')"
          class="w100"
          :disable="totalCount===0"
          @click="onClickAllSet"
        />
        <!-- 품목추가버튼 -->
        <kw-btn
          dense
          secondary
          :label="$t('MSG_TXT_ITM_SPMT')"
          @click="onClickItemAdd"
        />
        <kw-separator
          spaced
          vertical
          inset
        />

        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 등록버튼 -->
        <kw-btn
          dense
          primary
          :label="$t('MSG_TXT_RGS')"
          class="w70"
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
import { codeUtil, defineGrid, useDataService, getComponentType, gridUtil, useGlobal } from 'kw-lib';
// import { onMounted } from 'vue';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const { getWarehouseCloseCheck } = useSnCode();

const { t } = useI18n();
const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
const { alert, notify, modal } = useGlobal();

// TODO: 출고관리(W-SV-U-0141M01) 에서 호출 시 분기처리 현재테스트 진행중
const props = defineProps({
  ostrTpCd: {
    type: String,
    required: true,
    default: '217',
  },
  ostrWareNo: {
    type: String,
    required: true,
    default: '200371',
  },
  ostrDt: {
    type: String,
    required: true,
    default: '20230221',
  },
  itmOstrNo: {
    type: String,
    required: true,
    default: '217202102040000006',
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
const searchParams = ref({
  ostrDt: '',
  pdgdCd: '',
  ostrSn: '',
  ostrWareNo: '',
  strOjWareNo: '',
  bilDept: '',
});

const etcInfo = ref({
  ostrQty: '',
  rmk: '',
  pdGdCd: '',
  bilRsonCd: '',
});

const wharehouseParams = ref({
  apyYm: dayjs().format('YYYYMM'),
});

const totalCount = ref(0);
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
  const reqOstrDt = searchParams.value.ostrDt;
  const reqOjWareNo = searchParams.value.strOjWareNo;
  const reqbilDept = searchParams.value.bilDept;
  console.log(reqOstrDt);
  console.log(reqOjWareNo);
  console.log(reqbilDept);
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
    if (chkRows[i].onQty < chkRows[i].ostrQty) {
      // 출고수량이 재고수량을 초과합니다.
      alert(t('MSG_ALT_OSTR_QTY_EXCEEDS_INVEN_QTY'));
      return false;
    }
  }
  return true;
}

let cachedParams;

function isNullChk(obj) {
  return (obj !== undefined && obj !== null && obj !== '');
}

function isPropsNullChk() {
  return isNullChk(props.ostrTpCd) && isNullChk(props.ostrWareNo) && isNullChk(props.ostrDt);
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/etc-out-of-storages', { params: cachedParams });
  console.log(res);
  const baseData = res.data;
  totalCount.value = baseData.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(baseData);
  view.resetCurrent();
}

const warehouses = ref();

async function fetchDefaultData() {
  const res = await dataService.get('/sms/wells/service/out-of-storage-asks/warehouses', { params: wharehouseParams.value });
  warehouses.value = res.data;
  searchParams.value.strOjWareNo = warehouses.value[0].codeId;
}

// TODO: 저장로직 개발진행중
async function onClickSave() {
  if (!validateIsApplyRowExists()) return;

  // 저장시 데이터정합성 체크
  if (!validateSaveRowData()) return;

  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  console.log(chkRows);

  const { strOjWareNo, ostrDt } = cachedParams;

  console.log(strOjWareNo);
  console.log(ostrDt);
  console.log(cachedParams);

  // await dataService.post(`/sms/wells/service/etc-out-of-storages/${strOjWareNo}/${ostrDt}/out-of`, chkRows);
}
async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const chkRows = gridUtil.getCheckedRowValues(view);
  for (let i = 0; i < chkRows.length; i += 1) {
    if (chkRows[i].ostrQty === '0') {
      alert(t('MSG_ALT_OSTR_QTY_ZERO_BE_BIG'));
      return;
    }
  }
  const chkOstrDt = searchParams.value.ostrDt;
  const chkOjWareNo = searchParams.value.strOjWareNo;
  // 출고창고마감내역 공통추가 처리
  const checkWarehouse = await getWarehouseCloseCheck(chkOstrDt, chkOjWareNo);
  console.log(checkWarehouse);

  if (!checkWarehouse) {
    alert(t('MSG_ALT_DATE_EDIT_OUT_PUT'));
    return;
  }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  console.log(deletedRows);

  if (deletedRows.length > 0) {
    await dataService.post('/sms/wells/service/etc-out-of-storages/returning-goods-ostr', deletedRows);
    await fetchData();
  }
}

function setCheckedGridValue(view, row, value, column) {
  view.setValue(row, column, value);
}

const chk = '1';
async function onClickItemAdd() {
  const { result, payload } = await modal({
    component: 'WwsnaItemBaseInformationListP',
    componentProps: { chk },
  });

  if (result) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(payload);
    view.checkAll(false);
    view.resetCurrent();
    console.log(payload);
  }
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

onMounted(async () => {
  await fetchDefaultData();
  if (isPropsNullChk()) {
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
    { fieldName: 'onQty' },
    { fieldName: 'mngtUnitCd' },
    { fieldName: 'ostrQty' },
    { fieldName: 'ostrRsonCd' },
    { fieldName: 'rmkCn' },
    { fieldName: 'wareNm' },
    { fieldName: 'wareMngtPrtnrNo' },
    { fieldName: 'itmOstrNo' },
    { fieldName: 'ostrTpCd' },
    { fieldName: 'ostrWareNo' },
    { fieldName: 'ostrSn' },

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
      styleName: 'text-center' },
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
      styleName: 'text-center' },
    { fieldName: 'ostrQty',
      header: {
        text: t('MSG_TXT_OSTR_QTY'),
        styleName: 'essential',
        editor: {
          type: 'input',
        },
      },
      editable: true,
      width: '110',
      styleName: 'text-center' },
    { fieldName: 'rmkCn',
      header: {
        text: t('MSG_TXT_NOTE'),
      },
      editable: true,
      width: '264',
      styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onCellButtonClicked = async (grid, { column, itemIndex }) => {
    console.log(itemIndex);
    if (column === 'itmPdCd') {
      const itmPdCd = grid.getValue(itemIndex, 'itmPdCd');
      const { result, payload } = await modal({
        component: 'WwsnaItemBaseInformationListP',
        componentProps: { chk, itmPdCd },
      });

      if (result) {
        debugger;
        console.log(payload);
        view.getDataSource().updateRows(itemIndex, payload);
      }
    }
  };
});

</script>
