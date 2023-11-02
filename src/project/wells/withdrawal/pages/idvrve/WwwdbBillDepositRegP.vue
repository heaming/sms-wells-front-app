<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID : WwwdbBillNewRegistrationRegP - 어음 신규등록
3. 작성자 : heungjun.lee
4. 작성일 : 2023.03.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 어음입금 등록 - 어음입금 등록 조회 및 저장 페이지
****************************************************************************************************
--->

<template>
  <kw-popup
    ref="popupRef"
    :modified-targets="['grdMain']"
    size="2xl"
  >
    <kw-search
      :cols="2"
      one-row
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_CLNT_NM')"
          required
        >
          <!-- label="거래처명" -->
          <kw-input
            v-model="searchParams.dlpnrNm"
            icon="search"
            clearable
            :label="t('MSG_TXT_CLNT_NM')"
            :readonly="isCheckReadonly"
            :rules="validateChk"
            @click-icon="onClickDealingPartner"
            @clear="onClearSelect"
            @keydown="onKeyDownSelect"
          />
          <!-- :custom-messages="{ required:$t('MSG_ALT_USE_DT_SRCH_AF') }" -->
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <h3>
      {{ t('MSG_TXT_ELC_BILL_DP_OJ_CHO') }}
    </h3>
    <!-- 전자어음 입금대상 선택 -->

    <kw-action-top>
      <template #left>
        <!-- v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize" -->
        <kw-paging-info
          :total-count="mainCount"
          @change="fetchData"
        />
      </template>

      <kw-btn
        icon="upload_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_UP')"
        @click="onClickExcelUpload"
      />
      <!-- label="엑셀업로드" -->
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="mainCount === 0"
        @click="onClickExcelMainDownload"
      />
      <!-- 엑셀 다운로드 -->
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdPage"
      :visible-rows="10"
      @init="initGrid1"
    />
    <!-- :page-size="pageInfo.pageSize - 1"
      :total-count="pageInfo.totalCount" -->

    <h3>
      {{ t('MSG_TXT_BILL_DTL_INF') }}
    </h3>
    <!-- 어음 상세정보 -->

    <kw-action-top>
      <template #left />

      <kw-btn
        :label="t('MSG_TXT_MTR_CRT')"
        primary
        dense
        @click="onClickCreate"
      />
      <!-- label="자료생성" -->
    </kw-action-top>
    <kw-grid
      ref="grdMainRef2"
      :visible-rows="1"
      @init="initGrid2"
    />

    <h3>
      {{ t('MSG_TXT_ELC_BILL_DP_TRD_DTL_PS') }}
    </h3>
    <!-- 전자어음 입금거래 상세현황 -->

    <kw-action-top>
      <template #left>
        <!-- v-model:page-index="pageInfoSecond.pageIndex"
        v-model:page-size="pageInfoSecond.pageSize" -->
        <kw-paging-info
          :total-count="subCount"
          @change="fetchData"
        />
      </template>

      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="subCount === 0"
        @click="onClickExcelSubDownload"
      />
      <!-- 엑셀 다운로드 -->
    </kw-action-top>
    <kw-grid
      ref="grdMainRef3"
      name="grdMain"
      @init="initGrid3"
    />
    <!-- :page-size="pageInfoSecond.pageSize - 1"
      :total-count="pageInfoSecond.totalCount" -->

    <template #action>
      <kw-btn
        primary
        :label="t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
      <!-- label="저장" -->
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import dayjs from 'dayjs';
import { defineGrid, getComponentType, gridUtil, modal, useDataService, alert, confirm, notify, useModal, validate } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

// const { getConfig } = useMeta();
const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
const { ok } = useModal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  itgDpNo: {
    type: String,
    default: null,
  },
  cntrNo: {
    type: String,
    default: null,
  },
  bzrno: {
    type: String,
    default: null,
  },
  mconBzsNm: {
    type: String,
    default: null,
  },
  sellBzsBzrno: {
    type: String,
    default: null,
  },
  pblBzsBzrno: {
    type: String,
    default: null,
  },

  billBndNo: {
    type: String,
    default: null,
  }, // 채권번호
  billRmkCn: {
    type: String,
    default: null,
  }, // 어음구분
  billRcpDt: {
    type: String,
    default: null,
  }, // 접수일자
  billExprDt: {
    type: String,
    default: null,
  }, // 만기일
  billDpAmt: {
    type: String,
    default: null,
  }, // 입금금액
  billBndAmt: {
    type: String,
    default: null,
  }, // 입금금액
});

const grdMainRef = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));
const grdMainRef3 = ref(getComponentType('KwGrid'));

const mainCount = ref(0);
const subCount = ref(0);

const popupRef = ref();

// 조회 버튼 클릭 여부
const isUseYn = ref(false);
const isUploadYn = ref(false);

const searchParams = ref({
  bzrno: '',
  dlpnrNm: '',
});

// const pageInfo = ref({
//   totalCount: 0,
//   pageIndex: 1,
//   pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
//   needTotalCount: true,
// });

// const pageInfoSecond = ref({
//   totalCount: 0,
//   pageIndex: 1,
//   pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
//   needTotalCount: true,
// });

const params = ref({ itgDpNo: '', cntrNo: '', bzrno: '' });

const itgDpNo = ref();
const cntrNo = ref();
const billBndNo = ref();
const isCheckReadonly = ref(true);
let cachedParams;

const validateChk = computed(() => async (val, options) => {
  const errors = [];

  errors.push(
    ...(await validate(searchParams.value.bzrno, 'required', options)).errors,
  );

  return errors[0] || true;
});

// 조회
async function fetchData() {
  // cachedParams = { ...cachedParams, ...pageInfo.value };

  // eslint-disable-next-line max-len
  // const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic/paging', { params: cachedParams });
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic/execl-download', { params: cachedParams });
  const pages = res.data;

  mainCount.value = pages.length;
  // pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  const data = view.getDataSource();

  view.setCheckableExpression("value['errorCode'] is empty", true);

  data.checkRowStates(false);
  data.setRows(pages);
  data.checkRowStates(true);
}

// 조회 이벤트
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  // pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  isUseYn.value = true;
  isUploadYn.value = false;

  await fetchData();
}

// 상세조회 이벤트
let cachedSubParams;

async function fetchSubData() {
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic-detail/excel-download', { params: cachedSubParams });

  // cachedSubParams = { ...cachedSubParams, ...pageInfoSecond.value };

  // eslint-disable-next-line max-len
  // const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic-detail/paging', { params: cachedSubParams });
  const pages = res.data;

  subCount.value = pages.length;
  // pageInfoSecond.value = pagingResult;

  const view = grdMainRef3.value.getView();

  const data = view.getDataSource();
  data.checkRowStates(false);
  data.addRows(pages);
  data.checkRowStates(true);
}

// 상세 조회
async function onClickSubSearch() {
  grdMainRef3.value.getData().clearRows();

  // pageInfoSecond.value.pageIndex = 1;

  const itgDp = { itgDpNo: itgDpNo.value, billBndNo: billBndNo.value };

  cachedSubParams = cloneDeep(itgDp);

  await fetchSubData();
}

// 초기화 버튼
async function onClickReset() {
  searchParams.value.bzrno = '';
  searchParams.value.dlpnrNm = '';
}

// 거래처 팝업
async function onClickDealingPartner() {
  const { result, payload } = await modal({
    component: 'ZwcsaCorporateCustomerRegDlpnrChoListP',
    componentProps: { param: searchParams.value },
  });

  if (result) {
    searchParams.value.bzrno = payload.crpBzrno;
    searchParams.value.dlpnrNm = payload.crpDlpnrNm;
    // await grdMainRef.value.getData().clearRows();

    // const view = grdMainRef.value.getView();

    // await gridUtil.insertRowAndFocus(view, 0, {
    //   dlpnrNm: searchParams.value.dlpnrNm,
    //   bzrno: searchParams.value.bzrno,
    // });
  }
}

// 엑셀업로드
async function onClickExcelUpload() {
  if (!isUseYn.value) {
    return notify(t('MSG_ALT_USE_DT_SRCH_AF')); // 데이터 조회 후 사용해주세요.
  }
  const apiUrl = '/sms/wells/withdrawal/idvrve/bill-deposits/electronic/excel-upload';

  const templateId = 'FOM_WDB_0004';

  const { result, payload } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  if (result) {
    isUploadYn.value = true;

    const resData = cloneDeep(payload.excelData);

    // 중복체크
    for (let i = 0; i < resData.length; i += 1) {
      resData[i].bzrno = searchParams.value.bzrno;
      resData[i].dlpnrNm = searchParams.value.dlpnrNm;
      resData[i].cntrNo = resData[i].cntr.substring(0, 12);
      resData[i].cntrSn = resData[i].cntr.substring(12);

      for (let j = 0; j < resData.length; j += 1) {
        if (i !== j) {
          if (resData[i].cntr === resData[j].cntr) {
            resData[i].errorCode = '2';
          }
        }
      }
    }

    // 총 데이터 갯수
    mainCount.value = resData.length;

    const view = grdMainRef.value.getView();
    const data = view.getDataSource();
    data.setRows(resData);

    const changedRows = gridUtil.getAllRowValues(view);

    console.log(changedRows);
    changedRows.forEach((p1) => {
      if (p1.errorCode === '1') {
        view.checkItem(p1.dataRow, true);
      }
    });
    view.setCheckableExpression("values['errorCode'] = '1'", true);
  }
}

// 자료생성 버튼
async function onClickCreate() {
  const view = grdMainRef.value.getView();
  const view2 = grdMainRef2.value.getView();
  const view3 = grdMainRef3.value.getView();

  const checkItem = gridUtil.getCheckedRowValues(view);
  const rowItem = gridUtil.getRowValue(view2, 0);

  if (!checkItem.length) {
    alert(t('MSG_ALT_CHK_SELECT', [t('MSG_TXT_ELC_BILL_DP_OJ')])); // 전자어음 입금대상을(를) 선택하세요.
    return;
  }

  if (!await gridUtil.validate(view2)) { return; }

  // console.log(searchParams.value.dlpnrNm);
  // console.log(checkItem);

  if (!await confirm(t('MSG_TXT_MTR') + t('MSG_ALT_CREATED'))) { return; } // 자료 생성하시겠습니까?

  await grdMainRef3.value.getData().clearRows();

  subCount.value = checkItem.length;

  checkItem.forEach((data) => {
    gridUtil.insertRowAndFocus(view3, 0, {

      itgDpNo: itgDpNo.value, /* 통합입금번호 */
      rveCd: '', /* 수납구분 */
      billBndNo: rowItem.billBndNo, /* 어음채권번호 */
      billRmkCn: rowItem.billRmkCn, /* 어음비고내용 */
      billRcpDt: rowItem.billRcpDt, /* 어음접수일자 */
      billExprDt: rowItem.billExprDt, /* 어음만기일자 */
      cntrNo: data.cntrNo, /* 계약번호 */
      cntrSn: data.cntrSn, /* 일련번호 */
      cntr: data.cntrNo + data.cntrSn, /* 계약상세번호 */
      billDpAmt: data.sellAmt, /* 입금금액 */
      billDlpnrNm: checkItem[0].dlpnrNm,
      sellBzsBzrno: rowItem.sellBzsBzrno,
      pblBzsBzrno: rowItem.pblBzsBzrno,

    });
  });
}

// 행추가
async function onGridAdd() {
  const view = grdMainRef2.value.getView();

  // console.log(props.sellBzsBzrno);

  if (!isEmpty(props.itgDpNo)) {
    gridUtil.insertRowAndFocus(view, 0, {
      billBndNo: props.billBndNo, // 채권번호
      billRmkCn: props.billRmkCn, // 어음구분
      billRcpDt: props.billRcpDt, // 접수일자
      billExprDt: props.billExprDt, // 만기일
      billBndAmt: props.billBndAmt, // 입금금액
      sellBzsBzrno: props.sellBzsBzrno,
      pblBzsBzrno: props.pblBzsBzrno,
    });
  } else {
    gridUtil.insertRowAndFocus(view, 0, {
      billRcpDt: now.format('YYYYMMDD'), // 접수일자
      billExprDt: now.format('99991231'), // 만기일
    });
  }
}

// 저장버튼
async function onClickSave() {
  const view2 = grdMainRef2.value.getView();
  const view = grdMainRef3.value.getView();
  const changedRows2 = gridUtil.getAllRowValues(view2);
  const changedRows = gridUtil.getChangedRowValues(view);

  console.log(changedRows2);
  // console.log(changedRows);

  if (await gridUtil.alertIfIsNotModified(view)) { return; }

  if (!await gridUtil.validate(view)) { return; }

  const dpAmt = Number(changedRows2[0].billBndAmt);
  let dpSubAmt = 0;

  // changedRows.forEach((data) => { data.itgDpNo = itgDpNo.value; });
  changedRows.forEach((data) => {
    // data.itgDpNo = itgDpNo.value;
    dpSubAmt += Number(data.billDpAmt);
    data.billBndAmt = changedRows2[0].billBndAmt;
    data.sellBzsBzrno = changedRows2[0].sellBzsBzrno;
    data.pblBzsBzrno = changedRows2[0].pblBzsBzrno;
  });

  // console.log(dpAmt);
  // console.log(dpSubAmt);

  if (dpAmt !== dpSubAmt) {
    await alert(t('MSG_ALT_DTL_INF_DP_AMT_GAP')); // 상세정보 입금액과 상세현황 입금액이 다릅니다.
    return;
  }

  // 만약 통합입금번호 없으면 채번
  if (!itgDpNo.value) {
    const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic');
    itgDpNo.value = res.data.itgDpNo;
    changedRows[0].state = 'created';
  } else {
    changedRows[0].state = 'updated';
  }

  changedRows.forEach((data) => {
    data.itgDpNo = itgDpNo.value;
  });

  console.log(changedRows2);
  console.log(changedRows[0]);
  console.log(changedRows);

  const cachedParam = {
    saveMainReq: changedRows[0],
    SaveMainDtlReq: changedRows,
  };

  console.log(cachedParam);

  await dataService.post('/sms/wells/withdrawal/idvrve/bill-deposits/electronic', cachedParam);

  notify(t('MSG_ALT_SAVE_DATA')); // 저장되었습니다.

  ok();
  // await onClickSubSearch();
}

// 엑셀다운로드
async function onClickExcelMainDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic/execl-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: `${popupRef.value.pageCtxTitle}_${t('MSG_TXT_ELC_BILL_DP_OJ_CHO')}`, // 전자어음 입금대상 선택
    timePostfix: true,
    exportData: res.data,
  });
}

// 엑셀다운로드
async function onClickExcelSubDownload() {
  const view = grdMainRef3.value.getView();
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic-detail/excel-download', { params: cachedSubParams });
  await gridUtil.exportView(view, {
    fileName: `${popupRef.value.pageCtxTitle}_${t('MSG_TXT_ELC_BILL_DP_TRD_DTL_PS')}`, // 전자어음 입금거래 상세현황
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClearSelect() {
  searchParams.value.bzrno = '';
  searchParams.value.dlpnrNm = '';
  isUseYn.value = false;
}

async function onKeyDownSelect() {
  searchParams.value.bzrno = '';
  isUseYn.value = false;
}

async function initProps() {
  // console.log(props.itgDpNo);
  // console.log(props.cntrNo);
  // console.log(props.bzrno);
  if (!isEmpty(props.itgDpNo)) {
    params.value.itgDpNo = props.itgDpNo;
    params.value.cntrNo = props.cntrNo;
    searchParams.value.bzrno = props.bzrno;
    searchParams.value.dlpnrNm = props.mconBzsNm;
    itgDpNo.value = props.itgDpNo;
    cntrNo.value = props.cntrNo;
    billBndNo.value = props.billBndNo;
    isCheckReadonly.value = true;
    await onClickSearch();
    await onClickSubSearch();
    await onGridAdd();
  } else {
    const view = grdMainRef2.value.getView();
    gridUtil.insertRowAndFocus(view, 0, {
      billRcpDt: now.format('YYYYMMDD'), // 접수일자
      billExprDt: now.format('99991231'), // 만기일
    });
    isCheckReadonly.value = false;
  }
}

onMounted(async () => {
  await initProps();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid1 = defineGrid((data, view) => {
  const fields = [

    { fieldName: 'dlpnrNm' }, /* 거래처명 */
    { fieldName: 'bzrno' }, /* 사업자등록번호 */
    { fieldName: 'cntr' }, /* 계약상세번호 */
    { fieldName: 'cntrNo' }, /* 계약번호 */
    { fieldName: 'cntrSn' }, /* 일련번호 */
    { fieldName: 'sellAmt', dataType: 'number' }, /* 금액 */
    { fieldName: 'errorCode' }, /* 에러코드 1. 정상 2. 오류 */
  ];

  const columns = [
    { fieldName: 'dlpnrNm',
      header: t('MSG_TXT_CLNT_NM'),
      // , header: '거래처명'
      width: '280',
      styleName: 'text-center',
      styleCallback: (grid, dataCell) => {
        const ret = {};
        const { errorCode } = grid.getValues(dataCell.index.itemIndex);
        if (errorCode !== '1' && isUploadYn.value === true) {
          ret.styleName = 'red-column';
        }
        return ret;
      },
    },
    { fieldName: 'bzrno',
      header: t('MSG_TXT_CRNO'),
      // header: '사업자등록번호',
      width: '250',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        return !isEmpty(value) ? `${value.substring(0, 3)}-${value.substring(3, 5)}-${value.substring(5, 10)}` : value;
      },
      styleCallback: (grid, dataCell) => {
        const ret = {};
        const { errorCode } = grid.getValues(dataCell.index.itemIndex);
        if (errorCode !== '1' && isUploadYn.value === true) {
          ret.styleName = 'red-column';
        }
        return ret;
      },
    },
    { fieldName: 'cntr',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      // , header: '계약상세번호'
      width: '250',
      styleName: 'text-center',
      displayCallback(g, index) {
        const param = g.getValues(index.itemIndex);

        if (isEmpty(param.cntrSn)) {
          return `${param.cntrNo}-`;
        }
        return `${param.cntrNo}-${param.cntrSn}`;
      },
      styleCallback: (grid, dataCell) => {
        const ret = {};
        const { errorCode } = grid.getValues(dataCell.index.itemIndex);
        if (errorCode !== '1' && isUploadYn.value === true) {
          ret.styleName = 'red-column';
        }
        return ret;
      },
    },
    { fieldName: 'sellAmt',
      header: t('MSG_TXT_AMT_WON'),
      // , header: '금액(원)'
      width: '200',
      styleName: 'text-right',
      numberFormat: '#,##0',
      styleCallback: (grid, dataCell) => {
        const ret = {};
        const { errorCode } = grid.getValues(dataCell.index.itemIndex);
        if (errorCode !== '1' && isUploadYn.value === true) {
          ret.styleName = 'text-right red-column';
        }
        return ret;
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.checkBar.visible = true;
  view.checkBar.showAll = false; // 헤더 체크바 선택

  // 체크박스 설정
  // view.onCellClicked = (grid, clickData) => {
  //   if (clickData.cellType === 'data') {
  //     grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
  //   }
  // };

  // view.onScrollToBottom = async (g) => {
  //   if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
  //     pageInfo.value.pageIndex += 1;
  //     await fetchData();
  //   }
  // };
});

const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'billBndNo' }, // 채권번호
    { fieldName: 'billRmkCn' }, // 어음구분
    { fieldName: 'billRcpDt' }, // 접수일자
    { fieldName: 'billExprDt' }, // 만기일
    { fieldName: 'billDpAmt', dataType: 'number' }, // 어음입금금액
    { fieldName: 'billBndAmt', dataType: 'number' }, // 어음채권금액
    { fieldName: 'sellBzsBzrno' }, // 판매업체사업자등록번호
    { fieldName: 'pblBzsBzrno' }, // 발행업체사업자등록번호

  ];

  const columns = [
    {
      fieldName: 'billBndNo',
      header: {
        text: t('MSG_TXT_BND_NO'),
        // text: '채권번호',
        styleName: 'essential',
      },
      editor: {
        type: 'line',
        inputCharacters: ['0-9', 'A-Z'],
        maxLength: 25,
      },
      rules: 'required',
      width: '164',
      styleName: 'text-left',
    },
    {
      fieldName: 'billRmkCn',
      header: {
        text: t('MSG_TXT_BILL_DV'),
        // text: '어음구분',
        styleName: 'essential',
      },
      rules: 'required',
      editor: {
        type: 'line',
        maxLength: 1333,
      },
      width: '130',
      styleName: 'text-left',
    },
    {
      fieldName: 'billRcpDt',
      header: {
        text: t('MSG_TXT_RCP_D'),
        // text: '접수일',
        styleName: 'essential',
      },
      rules: 'required',
      width: '133',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editor: {
        type: 'btdate',
      },
    },
    {
      fieldName: 'billExprDt',
      header: {
        text: t('MSG_TXT_EXPR_DT'),
        // text: '만기일자',
        styleName: 'essential',
      },
      rules: 'required',
      width: '133',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editor: {
        type: 'btdate',
      },
    },
    {
      fieldName: 'billBndAmt',
      header: {
        text: t('MSG_TXT_WON_DP_AMT'),
        // text: '입금액(원)',
        styleName: 'essential',
      },
      rules: 'required',
      editor: {
        type: 'number',
        maxLength: 20,
        editFormat: '#,##0',
      },
      width: '148',
      styleName: 'text-right',
    },
    {
      fieldName: 'sellBzsBzrno',
      header: {
        text: t('MSG_TXT_SELL_BZS_ENTRP_RGST_NO'),
        // text: '판매업체사업자등록번호',
        styleName: 'essential',
      },
      rules: 'required|length:10',
      editor: {
        type: 'line',
        inputCharacters: ['0-9'],
        mask: {
          editMask: '999-99-99999',
        },
      },
      displayCallback(grid, index, value) {
        return !isEmpty(value) ? `${value.substring(0, 3)}-${value.substring(3, 5)}-${value.substring(5, 10)}` : value;
      },
      width: '200',
      styleName: 'text-left',
    },
    {
      fieldName: 'pblBzsBzrno',
      header: {
        text: t('MSG_TXT_PBL_BZS_ENTRP_RGST_NO'),
        // text: '발행업체사업자등록번호',
        styleName: 'essential',
      },
      rules: 'required|length:10',
      editor: {
        type: 'line',
        inputCharacters: ['0-9'],
        mask: {
          editMask: '999-99-99999',
        },
      },
      displayCallback(grid, index, value) {
        return !isEmpty(value) ? `${value.substring(0, 3)}-${value.substring(3, 5)}-${value.substring(5, 10)}` : value;
      },
      width: '200',
      styleName: 'text-left',
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  view.editOptions.editable = true;
});

const initGrid3 = defineGrid((data, view) => {
  const fields = [

    { fieldName: 'itgDpNo' }, /* 통합입금번호 */
    { fieldName: 'rveCd' }, /* 수납구분 */
    { fieldName: 'billBndNo' }, /* 어음채권번호 */
    { fieldName: 'billRmkCn' }, /* 어음비고내용 */
    { fieldName: 'billRcpDt' }, /* 어음접수일자 */
    { fieldName: 'billExprDt' }, /* 어음만기일자 */
    { fieldName: 'cntrNo' }, /* 계약번호 */
    { fieldName: 'cntrSn' }, /* 일련번호 */
    { fieldName: 'cntr' }, /* 일련번호 */
    { fieldName: 'billDpAmt', dataType: 'number' }, /* 입금금액 */
    { fieldName: 'billDlpnrNm' }, /* 거래처명 */

    { fieldName: 'sellBzsBzrno' }, /* 판매업체사업자등록번호 */
    { fieldName: 'pblBzsBzrno' }, /* 발행업체사업자등록번호 */

  ];

  const columns = [
    { fieldName: 'itgDpNo',
      header: t('MSG_TXT_ITG_DP_NO'),
      // , header: '통합입금번호'
      width: '126',
      styleName: 'text-left',
      editable: false,
      headerSummary: {
        styleName: 'text-center',
        text: t('MSG_TXT_SUM'),
      } },
    { fieldName: 'rveCd',
      header: t('MSG_TXT_RVE_CD'),
      // , header: '수납코드'
      width: '80',
      styleName: 'text-left',
      editable: false },
    { fieldName: 'billBndNo',
      header: t('MSG_TXT_BND_NO'),
      // header: '채권번호',
      width: '200',
      styleName: 'text-left',
      editable: false },
    { fieldName: 'billRmkCn',
      header: t('MSG_TXT_BILL_DV'),
      // header: '어음구분',
      width: '120',
      styleName: 'text-left',
      editable: false },
    { fieldName: 'billRcpDt',
      header: t('MSG_TXT_RCPDT'),
      // header: '접수일자',
      width: '120',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editable: false },
    { fieldName: 'billExprDt',
      header: t('MSG_TXT_EXPR_DT'),
      // header: '만기일자',
      width: '120',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editable: false },
    { fieldName: 'cntr',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      // header: '계약상세번호',
      width: '120',
      styleName: 'text-right',
      displayCallback(g, index) {
        const param = g.getValues(index.itemIndex);
        return `${param.cntrNo}-${param.cntrSn}`;
      },
      editable: false },
    {
      fieldName: 'billDpAmt',
      header: {
        text: t('MSG_TXT_WON_DP_AMT'),
        // text: '입금액(원)',
        styleName: 'essential',
      },
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      editor: {
        type: 'number',
      },
      rules: 'required|min_value:1',
      numberFormat: '#,##0',
      width: '110',
      styleName: 'text-right',
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.layoutByColumn('itgDpNo').summaryUserSpans = [{ colspan: 7 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        // styleName: 'blue-column', //  개별 css 스타일 적용 필요시
        height: 40,
      },
    ],
  });

  // view.onScrollToBottom = async (g) => {
  //   if (pageInfoSecond.value.pageIndex * pageInfoSecond.value.pageSize <= g.getItemCount()) {
  //     pageInfoSecond.value.pageIndex += 1;
  //     await fetchData();
  //   }
  // };
});

</script>
<style>
.red-column {
  color: red !important;
}
</style>
