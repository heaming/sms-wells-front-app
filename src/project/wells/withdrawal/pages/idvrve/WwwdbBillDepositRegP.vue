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
            rules="required"
            icon="search"
            clearable
            :label="t('MSG_TXT_CLNT_NM')"
            :readonly="true"
            @click-icon="onClickDealingPartner"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <h3>
      {{ t('MSG_TXT_ELC_BILL_DP_OJ_CHO') }}
    </h3>
    <!-- 전자어음 입금대상 선택 -->

    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @change="fetchData"
        />
      </template>

      <kw-btn
        icon="download_on"
        dense
        secondary
        :disable="pageInfo.totalCount === 0"
        :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
        @click="onClickExcelMainDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdPage"
      :page-size="pageInfo.pageSize - 1"
      :total-count="pageInfo.totalCount"
      @init="initGrid1"
    />

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
        <kw-paging-info
          v-model:page-index="pageInfoSecond.pageIndex"
          v-model:page-size="pageInfoSecond.pageSize"
          :total-count="pageInfoSecond.totalCount"
          @change="fetchData"
        />
      </template>

      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="pageInfoSecond.totalCount === 0"
        @click="onClickExcelSubDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef3"
      name="grdMain"
      :page-size="pageInfoSecond.pageSize - 1"
      :total-count="pageInfoSecond.totalCount"
      @init="initGrid3"
    />

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
import { defineGrid, getComponentType, gridUtil, modal, useDataService, useMeta, alert, confirm, notify, useModal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { getConfig } = useMeta();
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
});

const grdMainRef = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));
const grdMainRef3 = ref(getComponentType('KwGrid'));

const popupRef = ref();

const searchParams = ref({
  bzrno: '',
  dlpnrNm: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const pageInfoSecond = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const params = ref({ itgDpNo: '', cntrNo: '', bzrno: '' });

const itgDpNo = ref();
const cntrNo = ref();

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  console.log(pages);
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  const data = view.getDataSource();
  data.checkRowStates(false);
  data.addRows(pages);
  data.checkRowStates(true);
}

// 조회 이벤트
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 상세조회 이벤트
let cachedSubParams;

async function fetchSubData() {
  cachedSubParams = { ...cachedSubParams, ...pageInfoSecond.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic-detail/paging', { params: cachedSubParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  console.log(pages);
  pageInfoSecond.value = pagingResult;

  const view = grdMainRef3.value.getView();

  const data = view.getDataSource();
  data.checkRowStates(false);
  data.addRows(pages);
  data.checkRowStates(true);
}

async function onClickSubSearch() {
  grdMainRef3.value.getData().clearRows();

  pageInfoSecond.value.pageIndex = 1;

  const itgDp = { itgDpNo: itgDpNo.value, cntrNo: cntrNo.value };

  cachedSubParams = cloneDeep(itgDp);

  await fetchSubData();
}

async function onClickReset() {
  searchParams.value.bzrno = '';
  searchParams.value.dlpnrNm = '';
}

// 거래처 팝업
async function onClickDealingPartner() {
  const { result, payload } = await modal({
    component: 'ZwcsaCorporateCustomerRegDlpnrChoListP',
    // componentProps: { param: searchParams.value },
  });

  if (result) {
    console.log(payload);
    searchParams.value.bzrno = payload.crpBzrno;
    searchParams.value.dlpnrNm = payload.crpDlpnrNm;
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
    alert(t('MSG_ALT_CHK_SELECT', [t('MSG_TXT_ELC_BILL_DP_OJ')]));
    return;
  }

  if (!await gridUtil.validate(view2)) { return; }

  console.log(searchParams.value.dlpnrNm);
  console.log(checkItem);

  if (!await confirm(t('MSG_TXT_MTR') + t('MSG_ALT_CREATED'))) { return; }

  await grdMainRef3.value.getData().clearRows();

  checkItem.forEach((data) => {
    gridUtil.insertRowAndFocus(view3, 0, {

      itgDpNo: rowItem.itgDpNo, /* 통합입금번호 */
      rveCd: '', /* 수납구분 */
      billBndNo: rowItem.billBndNo, /* 어음채권번호 */
      billRmkCn: rowItem.billRmkCn, /* 어음비고내용 */
      billRcpDt: rowItem.billRcpDt, /* 어음접수일자 */
      billExprDt: rowItem.billExprDt, /* 어음만기일자 */
      cntrNo: data.cntrNo, /* 계약번호 */
      cntrSn: data.cntrSn, /* 일련번호 */
      cntr: data.cntrNo + data.cntrSn, /* 계약상세번호 */
      billDpAmt: rowItem.billDpAmt, /* 입금금액 */
      billDlpnrNm: checkItem[0].dlpnrNm,
    });
  });
}

// 행추가
async function onGridAdd() {
  const view = grdMainRef2.value.getView();

  console.log(props.sellBzsBzrno);

  if (!isEmpty(props.itgDpNo)) {
    gridUtil.insertRowAndFocus(view, 0, {
      billBndNo: props.billBndNo, // 채권번호
      billRmkCn: props.billRmkCn, // 어음구분
      billRcpDt: props.billRcpDt, // 접수일자
      billExprDt: props.billExprDt, // 만기일
      billDpAmt: props.billDpAmt, // 입금금액
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
  const view = grdMainRef3.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);

  console.log(changedRows);

  if (await gridUtil.alertIfIsNotModified(view)) { return; }

  if (!await gridUtil.validate(view)) { return; }

  if (!itgDpNo.value) {
    const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic');
    console.log(res.data);
    itgDpNo.value = res.data;
    changedRows[0].state = 'created';
  } else {
    changedRows[0].state = 'updated';
  }

  changedRows.forEach((data) => { data.itgDpNo = itgDpNo.value; });

  const cachedParam = {
    saveMainReq: changedRows[0],
    SaveMainDtlReq: changedRows,
  };

  console.log(changedRows);

  await dataService.post('/sms/wells/withdrawal/idvrve/bill-deposits/electronic', cachedParam);

  notify(t('MSG_ALT_SAVE_DATA'));

  ok();
  // await onClickSubSearch();
}

// 엑셀다운로드
async function onClickExcelMainDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic/execl-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: `${popupRef.value.pageCtxTitle}_${t('MSG_TXT_ELC_BILL_DP_OJ_CHO')}`,
    timePostfix: true,
    exportData: res.data,
  });
}

// 엑셀다운로드
async function onClickExcelSubDownload() {
  const view = grdMainRef3.value.getView();
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic-detail/excel-download', { params: cachedSubParams });
  await gridUtil.exportView(view, {
    fileName: `${popupRef.value.pageCtxTitle}_${t('MSG_TXT_ELC_BILL_DP_TRD_DTL_PS')}`,
    timePostfix: true,
    exportData: res.data,
  });
}

async function initProps() {
  console.log(props.itgDpNo);
  console.log(props.cntrNo);
  console.log(props.bzrno);
  if (!isEmpty(props.itgDpNo)) {
    params.value.itgDpNo = props.itgDpNo;
    params.value.cntrNo = props.cntrNo;
    searchParams.value.bzrno = props.bzrno;
    searchParams.value.dlpnrNm = props.mconBzsNm;
    itgDpNo.value = props.itgDpNo;
    cntrNo.value = props.cntrNo;

    await onClickSearch();
    await onClickSubSearch();
    await onGridAdd();
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
  ];

  const columns = [
    { fieldName: 'dlpnrNm',
      header: t('MSG_TXT_CLNT_NM'),
      // , header: '거래처명'
      width: '270',
      styleName: 'text-left' },
    { fieldName: 'bzrno',
      header: t('MSG_TXT_CRNO'),
      // header: '사업자등록번호',
      width: '281',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        return !isEmpty(value) ? `${value.substring(0, 3)}-${value.substring(3, 5)}-${value.substring(5, 10)}` : value;
      } },
    { fieldName: 'cntr',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      // , header: '계약상세번호'
      width: '280',
      styleName: 'text-left' },
    { fieldName: 'sellAmt',
      header: t('MSG_TXT_AMT_WON'),
      // , header: '금액(원)'
      width: '280',
      styleName: 'text-right',
      numberFormat: '#,##0' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  // 체크박스 설정
  view.onCellClicked = (grid, clickData) => {
    if (clickData.cellType === 'data') {
      grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
    }
  };

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };
});

const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'billBndNo' }, // 채권번호
    { fieldName: 'billRmkCn' }, // 어음구분
    { fieldName: 'billRcpDt' }, // 접수일자
    { fieldName: 'billExprDt' }, // 만기일
    { fieldName: 'billDpAmt', dataType: 'number' }, // 입금금액
    { fieldName: 'sellBzsBzrno' },
    { fieldName: 'pblBzsBzrno' },

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
        inputCharacters: ['0-9'],
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
      fieldName: 'billDpAmt',
      header: {
        text: t('MSG_TXT_WON_DP_AMT'),
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

  ];

  const columns = [
    { fieldName: 'itgDpNo',
      header: t('MSG_TXT_ITG_DP_NO'),
      // , header: '통합입금번호'
      width: '126',
      styleName: 'text-left',
      editable: false },
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
      editable: false },
    {
      fieldName: 'billDpAmt',
      header: {
        text: t('MSG_TXT_WON_DP_AMT'),
        // text: '입금액(원)',
        styleName: 'essential',
      },
      editor: {
        type: 'number',
      },
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

  view.onScrollToBottom = async (g) => {
    if (pageInfoSecond.value.pageIndex * pageInfoSecond.value.pageSize <= g.getItemCount()) {
      pageInfoSecond.value.pageIndex += 1;
      await fetchData();
    }
  };
});

</script>
