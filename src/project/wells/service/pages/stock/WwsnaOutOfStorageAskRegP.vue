<!--
 ***************************************************************************************************
 * 프로그램 개요
 ***************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : W-SV-U-0172P01 - 출고요청등록
 3. 작성자 : songtaesung
 4. 작성일 : 2023.01.02
 ***************************************************************************************************
 * 프로그램 설명
 ***************************************************************************************************
 - 출고요청등록 (http://localhost:3000/#/service/wwsna-out-of-Storage-Ask)
 ***************************************************************************************************
-->

<template>
  <kw-popup
    ref="popupRef"
    size="3xl"
  >
    <kw-form
      ignore-on-modified
      :cols="4"
      :label-size="120"
    >
      <kw-form-row>
        <!-- 출고요청창고 -->
        <kw-form-item :label="$t('MSG_TXT_OSTR_AK_WARE')">
          <kw-select
            v-model="searchParams.strOjWareNo"
            :options="warehouses"
            :readonly="isAkWare"
            @update:model-value="onChangeOjWare"
          />
        </kw-form-item>
        <!-- 출고요청관리번호 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_AK_MNGT_NO')"
        >
          <kw-input
            v-model="searchParams.ostrAkNo"
            readonly
            placeholder=""
          />
        </kw-form-item>
        <!-- 배차형태 -->
        <kw-form-item :label="$t('MSG_TXT_OVIV_FOM')">
          <kw-select
            v-model="searchParams.ovivTpCd"
            :options="codes.OVIV_TP_CD"
            :readonly="isOviv"
          />
        </kw-form-item>
        <!-- 출고품목 -->
        <kw-form-item :label="$t('MSG_TXT_OSTR_ITM')">
          <kw-select
            v-model="searchParams.ostrItmNo"
            :options="codes.ITM_KND_CD"
            :readonly="isOstrItm"
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <!-- 출고요청유형 -->
        <kw-form-item :label="$t('MSG_TXT_OSTR_AK_TP')">
          <kw-select
            v-model="searchParams.ostrAkTpCd"
            :options="filterCodes.filterOstrTpCd"
            :readonly="isAkTp"
            @update:model-value="onChangeCode"
          />
        </kw-form-item>
        <!-- 입고희망일 -->
        <kw-form-item :label="$t('MSG_TXT_STR_HOP_D')">
          <kw-date-picker
            v-model="searchParams.strHopDt"
            :readonly="isHopDt"
            @change="onChangeStrHopDt"
          />
        </kw-form-item>
        <!-- 출고대상창고 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_OJ_WARE')"
        >
          <kw-select
            v-model="searchParams.ostrOjWareNo"
            :readonly="isSojWare"
            :options="ostrOjWares"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-action-top class="mt30" />
    </kw-form>

    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
      </template>
      <kw-btn
        :label="$t('MSG_TXT_DEL')"
        :disable="searchParams.ostrItmNo.length === 0"
        dense
        @click="onClickDelete"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        :label="$t('MSG_BTN_SAVE')"
        :disable="searchParams.ostrItmNo.length === 0"
        dense
        @click="onClickSave"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="totalCount === 0"
        @click="onClickExcelDownload"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        :label="$t('MSG_BTN_ITM_SPMT')"
        :disable="searchParams.ostrItmNo.length === 0"
        primary
        dense
        @click="onClickItem"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      @init="initGrdMain"
    />
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, gridUtil, useDataService, useGlobal, defineGrid, useModal } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const { t } = useI18n();
const dataService = useDataService();
const { ok } = useModal();

const { modal, notify } = useGlobal();
const { getMonthWarehouse } = useSnCode();
const store = useStore();

const props = defineProps({
  ostrAkNo: {
    type: String,
    default: '',
  },
  ostrAkTpCd: {
    type: String,
    default: '',
  },
  ostrAkRgstDt: {
    type: String,
    default: '',
  },
  strOjWareNo: {
    type: String,
    default: '',
  },

});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const popupRef = ref();
const grdMainRef = ref(getComponentType('KwGrid'));

const isAkWare = ref(false); // 출고요청창고
const isOviv = ref(false); // 배차형태
const isAkTp = ref(false); // 출고요청유형
const isOstrItm = ref(false); // 출고품목
const isSojWare = ref(true); // 출고대상창고
const isHopDt = ref(false); // 입고희망일자

const warehouses = ref([]);
const ostrOjWares = ref([]);
const totalCount = ref(0);

const searchParams = ref({
  strOjWareNo: '', // 출고요청창고번호
  wareNm: '', // 창고명
  ostrAkNo: '', // 출고요청관리번호
  ovivTpCd: '00', // 배차유형코드
  ostrAkTpCd: '', // 출고요청유형코드
  ostrItmNo: '', // 품목종류
  ostrOjWareNo: '',
  strHopDt: dayjs().format('YYYYMMDD'), // 입고희망일자
  ostrAkRgstDt: '',
});

const loginUserParams = ref({
  apyYm: dayjs().format('YYYYMM'),
  userId: store.getters['meta/getUserInfo'].employeeIDNumber,

});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'OVIV_TP_CD',
  'OSTR_AK_TP_CD', // check: 출고요청유형코드 공통코드에서 가져오는데 갯수가 많음.
  'ITM_KND_CD',

);

// 출고유형코드 필터링
const filterCodes = ref({
  filterOstrTpCd: [],
});

filterCodes.value.filterOstrTpCd = codes.OSTR_AK_TP_CD.filter((v) => ['310', '320', '330'].includes(v.codeId));

function changeOstrAkQty(row, val) {
  console.log(val);
  const view = grdMainRef.value.getView();
  view.setValue(row, 'ostrCnfmQty', val);
}

function getRowData(rowData) {
  return { ...rowData, sapCd: rowData.sapCd, warehouseQty: rowData.warehouseQty || 0 };
}

async function onClickItemPop(type, row) {
  // TODO: 품목코드 던져줘야 됨. 팝업 props 맞게 던져주면됨.
  if (isEmpty(searchParams.value.ostrAkTpCd)) {
    // 출고요청유형 항목이 비어있습니다.
    notify(t('MSG_ALT_OSTR_AK_TP_ATC_IS_NULL'));
    return;
  }
  // 출고대상창고 항목이 비어있습니다.
  if (isEmpty(searchParams.value.ostrOjWareNo)) {
    notify(t('MSG_ALT_OSTR_OJ_WARE_ATC_IS_NULL'));
    return;
  }
  const { result, payload } = await modal({
    component: 'WwsnaItemBaseInformationListP',
    componentProps: { chk: '2',
      itmKndCd: searchParams.value.ostrItmNo,
      wareNo: searchParams.value.strOjWareNo,
      ostrWareNo: searchParams.value.ostrOjWareNo,
      multiple: true,

    },
  });
  const target = [];
  // TODO: 연결화면 개발진행중이라, 받아와서 처리하는 로직은 임시값으로 테스트한 코드임. 팝업화면에서 넘어오는 형식따라 수정가능성있음.
  if (result) {
    const view = grdMainRef.value.getView();
    const list = gridUtil.getAllRowValues(view, false);
    if (type === 'C') {
      payload.forEach((obj) => {
        if (list.find((i) => i.itmPdCd === obj.itmPdCd)) {
          return true;
        }
        target.push(obj);
        return false;
      });
      // view.getDataSource().addRows(payload.map((v) => getRowData(v)));
      view.getDataSource().addRows(target);

      // view.resetCurrent();
    } else if (type === 'U') {
      const rowData = payload?.[0] || {};
      view.setValues(row, getRowData(rowData), true);
    }
  }
}

async function onClickItem() {
  await onClickItemPop('C');
}
async function fetchOstrOjWare() {
  if (!isEmpty(props.ostrAkNo)) { return; }

  searchParams.value.ostrOjWareNo = '';
  const ostReqWare = warehouses.value.filter((v) => v.codeId === searchParams.value.strOjWareNo);
  const searchOstOjWareParam = {
    apyYm: searchParams.value.strHopDt,
    wareDvCd: ostReqWare[0].wareDvCd,
    wareIchrNo: ostReqWare[0].wareIchrNo,
  };

  ostrOjWares.value = (await dataService.get('/sms/wells/service/out-of-storage-asks/ostr-object-warehouses', { params: searchOstOjWareParam })).data;
}

// 출고요청유형 변경 이벤트
async function onChangeCode() {
  if (!isEmpty(props.ostrAkNo)) { return; }
  // OSTR_AK_TP_CD 코드가 310 : 정상출고
  if (searchParams.value.ostrAkTpCd === '310' || searchParams.value.ostrAkTpCd === '330') {
    const filterWare = warehouses.value.filter((v) => v.codeId === searchParams.value.strOjWareNo);
    ostrOjWares.value = [{ codeId: filterWare[0].hgrWareNo, codeName: filterWare[0].parentWarNm }];
    searchParams.value.ostrOjWareNo = filterWare[0].hgrWareNo;
    isSojWare.value = true;
  } else if (searchParams.value.ostrAkTpCd === '320') {
    isSojWare.value = false;
    await fetchOstrOjWare();
  }
}

function onChangeOjWare() {
  onChangeCode();
}

// 최초화면 등록인지, 변경인지에 따라 검색조건 disable 처리.
function validateChangeCode() {
  if (!isEmpty(props.ostrAkNo)) {
    isAkWare.value = true;
    isOviv.value = true;
    isOstrItm.value = true;
    isAkTp.value = true;
    isHopDt.value = true;

    // onChangeCode(searchParams.value.ostrAkTpCd);
  }
}

async function fetchDefaultData() {
  // TODO: 알맞는 값 없어서 하드코딩. session값 맞아지면 userInfo.employeeIDNumber 로 변경. WM: 1642720

  const { apyYm } = loginUserParams.value;
  const { userId } = loginUserParams.value;
  warehouses.value = await getMonthWarehouse(userId, apyYm);

  searchParams.value.strOjWareNo = warehouses.value[0].codeId;
  validateChangeCode();
}

async function fetchOstrAkDataItem() {
  await fetchDefaultData();

  const res = await dataService.get('/sms/wells/service/out-of-storage-asks/out-of-storage-ask-items', { params: searchParams.value });
  ostrOjWares.value = [{ codeId: res.data.ostrOjWareNo, codeName: res.data.ostrOjWareNm }];
  searchParams.value = res.data;

  const res1 = await dataService.get('/sms/wells/service/out-of-storage-asks/out-of-storage-items', { params: searchParams.value });
  const outOfStorages = res1.data;

  totalCount.value = res1.data.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(outOfStorages);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/out-of-storage-asks/out-of-storage-items/excel-download', { params: searchParams.value });

  await gridUtil.exportView(view, {
    fileName: popupRef.value.pageCtxTitle,
    timePostfix: true,
    exportData: res.data,
  });
}

// TODO: 데이터 생기면 확인해볼것
async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  for (let i = 0; i < checkedRows.length; i += 1) {
    const chkRectOstrDt = checkedRows[i].rectOstrDt;
    if (!isEmpty(chkRectOstrDt)) {
      notify(t('MSG_ALT_ARDY_OSTR', [t('MSG_TXT_DEL')]));
      return;
    }
  }

  // if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  // TODO: 출고완료 전 삭제해야 테스트가능할듯. 저장테스트 미실시로 확인 불가.
  if (deletedRows.length > 0) {
    const result = await dataService.delete('/sms/wells/service/out-of-storage-asks', { data: checkedRows });
    if (result.data > 0) {
      notify(t('MSG_ALT_SAVE_COMP'));
    } else {
      notify(t('MSG_ALT_PROC_FAIL'));
    }
    await fetchOstrAkDataItem();
  }
}

let params;
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SELECT_OSTR'));
    return;
  }

  if (!(await gridUtil.validate(view, { isCheckedOnly: true }))) { return; }

  const chkOstrAkTpCd = searchParams.value.ostrAkTpCd;

  for (let i = 0; i < checkedRows.length; i += 1) {
    const chkWarehouseQty = checkedRows[i].warehouseQty;
    const chkOstrAkQty = checkedRows[i].ostrAkQty;
    const chkRectOstrDt = checkedRows[i].rectOstrDt;
    const chkOstrAkNo = searchParams.value.ostrAkNo;

    if (chkOstrAkTpCd === '310' && searchParams.value.ostrOjWareNo.substring(0, 1) === '3' && chkWarehouseQty === 0) {
      notify(t('MSG_ALT_NO_OSTR_WARE_STOC'));
      return;
    }
    if (chkOstrAkQty <= 0) {
      notify(t('MSG_ALT_OSTR_QTY_ZERO_BE_BIG'));
      return;
    }

    if (!isEmpty(chkRectOstrDt)) {
      notify(t('MSG_ALT_ARDY_OSTR', [t('MSG_TXT_MOD')]));
      return;
    }

    if (!isEmpty(chkOstrAkNo)) {
      checkedRows[i].ostrAkNo = chkOstrAkNo;
    }
  }
  // const params = searchParams.value;
  params = searchParams.value;

  params.ostrAkRgstDt = dayjs().format('YYYYMMDD');
  // eslint-disable-next-line max-len
  const result = await dataService.post('/sms/wells/service/out-of-storage-asks', checkedRows.map((v) => ({ ...v, ...params })));
  if (result > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
  }
  await fetchOstrAkDataItem();
  ok();
}

async function onChangeStrHopDt() {
  if (!searchParams.value.strHopDt) {
    notify(t('MSG_ALT_NCELL_REQUIRED_VAL', [t('MSG_TXT_STR_HOP_D')]));
    searchParams.value.strHopDt = dayjs().format('YYYYMMDD');
    fetchOstrOjWare();
    return;
  }
  fetchOstrOjWare();
}

onMounted(async () => {
  let searchFlag = false;

  if (!isEmpty(props.ostrAkNo)) {
    searchParams.value.ostrAkNo = props.ostrAkNo;
    searchFlag = true;
  } else {
    await fetchDefaultData();
  }

  if (searchFlag) await fetchOstrAkDataItem();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목코드
    { fieldName: 'itmPdNm' }, // 품목상품명
    { fieldName: 'ostrAkNo' }, // 출고요청일련번호
    { fieldName: 'ostrAkSn' }, // 출고요청순번
    { fieldName: 'ostrAkTpCd' }, /* 출고요청유형코드 */
    { fieldName: 'strHopDt' }, /* 입고희망일자 */
    { fieldName: 'mngtUnitCd' }, // 관리단위코드
    { fieldName: 'boxUnitQty', dataType: 'number' }, // 박스단위수량
    { fieldName: 'delUnt' },
    { fieldName: 'itmGdCd' }, // 품목등급코드
    { fieldName: 'ostrAkQty', dataType: 'number' }, /* 출고요청수량 */
    { fieldName: 'ostrCnfmQty', dataType: 'number' }, /* 출고확정수량 */
    { fieldName: 'rmkCn' }, /* 비고 */
    { fieldName: 'rectOstrDt' }, /* 최근출고일자 */
    { fieldName: 'ostrWareMngtPrtnrNo' }, /* 출고창고관리파트너번호 */
    { fieldName: 'ostrOjWareNo' }, /* 출고대상창고번호 */
    { fieldName: 'strOjWareNo' }, /* 입고대상창고번호 */
    { fieldName: 'itmKnd' }, /* 품목종류 */
    { fieldName: 'itmKndNm' }, /* 품목종류명 */
    { fieldName: 'imgUrl' }, /* imgUrl */
    { fieldName: 'ovivTpCd' }, /* 배차형태 */
    { fieldName: 'ostrAkWareDvCd' }, /* 출고요청창고구분코드 */
    { fieldName: 'wareMngtPrtnrNo' }, /* 창고관리파트너번호 */
    { fieldName: 'warehouseQty', dataType: 'number' }, /* 재고 */
    { fieldName: 'centerQty', dataType: 'number' }, /* 센터수량 */
    { fieldName: 'indiQty', dataType: 'number' }, /* 개인수량 */
    { fieldName: 'useQty', dataType: 'number' }, /* 당월수량 */
    { fieldName: 'baseStocQty', dataType: 'number' }, /* 기준재고수량 */
    { fieldName: 'sftStocQty', dataType: 'number' }, /* 안전재고수량 */

    // { fieldName: 'ostrAkWareDvCd' }, // 출고요청창고구분코드
    // { fieldName: 'wareMngtPrtnrNo' }, // 창고관리파트너번호
    // { fieldName: 'ostrOjWareDvCd' }, // 출고대상창고구분코드
    // { fieldName: 'ostrOjWareNo' }, // 출고대상창고번호
    // { fieldName: 'ostrWareMngtPrtnrNo' }, // 출고창고관리파트너번호
    // { fieldName: 'mngtUnitCd' },
    // { fieldName: 'boxUnitQty', dataType: 'number' },
    // { fieldName: 'itmGdCd' },
    // { fieldName: 'onQty', dataType: 'number' },
    // { fieldName: 'ostrAkQty', dataType: 'number' }, // 출고요청수량
    // { fieldName: 'ostrCnfmQty', dataType: 'number' }, // 출고확정수량
    // { fieldName: 'rmkCn' }, // 비고
    // { fieldName: 'rectOstrDt' }, // 최근출고일자
    // { fieldName: 'ostrAggQty' }, // 출고누계수량
    // { fieldName: 'warehouseQty', dataType: 'number' }, // 재고
    // { fieldName: 'baseStocQty', dataType: 'number' }, // 기준재고수량
    // { fieldName: 'sftStocQty', dataType: 'number' }, // 안전재고수량
    // { fieldName: 'useQty', dataType: 'number' }, // 당월수량
    // { fieldName: 'centerQty', dataType: 'number' }, // 센터수량
    // { fieldName: 'indiQty', dataType: 'number' }, // 개인수량
    // { fieldName: 'imgApnFileId' }, // 이미지첨부파일ID
    // { fieldName: 'cfrmCnt', dataType: 'number' }, // 방문확정수량
  ];

  const columns = [
    {
      fieldName: 'sapCd',
      header: t('MSG_TXT_SAP_CD'),
      width: '150',
      styleName: 'text-center',
      footer: { text: t('MSG_TXT_SUM') },
    },
    {
      fieldName: 'itmPdCd',
      header: t('MSG_TXT_ITM_CD'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'itmPdNm',
      header: t('MSG_TXT_ITM_NM'),
      width: '250',
      styleName: 'text-center',
    },
    {
      fieldName: 'itmGdCd',
      header: t('MSG_TXT_GD'),
      width: '100',
      options: codes.PD_GD_CD,
      styleName: 'text-center',
    },
    {
      fieldName: 'warehouseQty',
      header: t('MSG_TXT_STOC'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    {
      fieldName: 'baseStocQty',
      header: t('MSG_TXT_BASE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    {
      fieldName: 'sftStocQty',
      header: t('MSG_TXT_SFT'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    {
      fieldName: 'useQty',
      header: t('MSG_TXT_THM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    {
      fieldName: 'centerQty',
      header: t('MSG_TXT_CENTER_DIVISION'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    {
      fieldName: 'indiQty',
      header: t('MSG_TXT_INDV'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    {
      fieldName: 'ostrCnfmQty',
      header: t('MSG_TXT_VST_CNFM_QTY'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    {
      fieldName: 'ostrAkQty',
      header: t('MSG_TXT_OSTR_AK_QTY'),
      width: '100',
      styleName: 'text-right',
      editable: true,
      rules: 'required|min_value:1',
      editor: {
        type: 'number',
      },
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    {
      fieldName: 'imgUrl',
      header: t('MSG_TXT_PHO'),
      width: '130',
      styleName: 'text-center',
      renderer: {
        type: 'button',
        hideWhenEmpty: false,
      },
      displayCallback: () => t('MSG_TXT_IMG_BRWS'),
    },
    {
      fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      width: '250',
      styleName: 'text-left',
      editable: true,
    },
  ];

  const columnLayout = [
    {
      column: 'sapCd', footerUserSpans: [{ colspan: 4 }],
    }, // SAP코드
    'itmPdCd', // 품목코드
    'itmPdNm', // 품목명
    'itmGdCd', // 등급
    'warehouseQty', // 재고
    'baseStocQty', // 기준
    'sftStocQty', // 안전
    'useQty', // 당월
    'centerQty', // 센터
    'indiQty', // 개인
    'ostrCnfmQty', // 방문확정수량
    'ostrAkQty', // 출고요청수량
    'imgUrl', // 사진
    'rmkCn', // 비고
  ];

  view.setColumnLayout(columnLayout);

  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  // view.onCellClicked = async (grid, { column, dataRow }) => {
  //   if (column === 'itmPdCd') {
  //     await onClickItemPop('U', dataRow);
  //   }
  // };

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    const { imgUrl } = g.getValues(itemIndex);
    if (column === 'imgUrl') {
      await modal({
        component: 'ZwcmzImagePreviewP',
        componentProps: { files: [imgUrl] }, // fileUid만 주면 됨
        // componentProps: { files: ['FIL-E9E84666-BFC3-44E2-9EC1-D3AFD05BF77B'] }, // fileUid만 주면 됨
      });
    }
  };

  view.onGetEditValue = async (grid, index, editResult) => {
    grid.checkItem(index.itemIndex, true);
    if (index.fieldName === 'ostrAkQty') {
      changeOstrAkQty(index.dataRow, editResult.value);
    }
  };
});

</script>
