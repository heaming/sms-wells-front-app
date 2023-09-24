<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID : WwwdbBillDepositRegM - 어음입금 등록
3. 작성자 : heungjun.lee
4. 작성일 : 2023.03.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 어음입금 등록 - 발송대상 관리 조회 및 저장 페이지
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain' , 'grdSub']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_RCPDT')"
          required
        >
          <!-- label="접수일자" -->
          <kw-date-range-picker
            v-model:from="searchParams.rcpStartDt"
            v-model:to="searchParams.rcpEndDt"
            :label="t('MSG_TXT_RCPDT')"
            rules="date_range_required"
            required
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CNTR_DTL_NO')"
        >
          <!-- label="계약상세번호" -->
          <kw-input
            v-model="searchParams.cntr"
            icon="search"
            clearable
            @keydown="onKeyDownSelectCntr"
            @click-icon="onClickSelectCntr"
            @clear="onClearSelectCntr"
          />
          <kw-input
            v-model="searchParams.dlpnrNm"
            :readonly="true"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_EXPR_ADVT_YN')"
        >
          <!-- label="만기도래여부" -->
          <kw-select
            v-model="searchParams.billExprDt"
            first-option="all"
            :options="['Y','N']"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <!-- 거래현황 -->
      <h3>
        {{ t('MSG_TXT_TRD_PS') }}
      </h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
          <span class="ml8">
            {{ t('MSG_TXT_UNIT_WON') }}
          </span>
          <!-- (단위:원) -->
        </template>

        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelMainDownload"
        />
        <!-- label="엑셀다운로드" -->
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          dense
          secondary
          :label="t('MSG_BTN_DP_SLIP')"
          @click="onClickDeposit"
        />
        <!-- label="입금전표" -->
        <kw-btn
          v-permission:create
          dense
          secondary
          :label="t('MSG_BTN_RPLC_SLIP')"
          @click="onClickReplacementSlipProcessing"
        />
        <!-- label="대체전표" -->
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          :label="t('MSG_BTN_RGST_NEW')"
          primary
          dense
          @click="onClickCreate"
        />
        <!-- label="신규등록" -->
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdSub"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />

      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />

      <!-- 전자어음거래 상세현황 -->
      <h3>
        {{ t('MSG_TXT_ELC_BILL_TRD_DTL_PS') }}
      </h3>
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
          grid-action
          :label="t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <!-- label="저장" -->
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfoSecond.totalCount === 0"
          @click="onClickExcelSubDownload"
        />
        <!-- label="엑셀다운로드" -->
      </kw-action-top>

      <kw-grid
        ref="grdMainRef2"
        name="grdMain"
        visible-rows="5"
        :page-size="pageInfoSecond.pageSize"
        :total-count="pageInfoSecond.totalCount"
        @init="initGrid2"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, modal, useDataService, useMeta, notify, confirm, alert } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const now = dayjs();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

// async function openDealingPartnerPopup() {
//   await modal({
//     component: 'ZwcsaCorporateCustomerRegDlpnrChoListP',
//   });
// }

const searchParams = ref({
  cntrNo: '',
  cntrSn: '',
  rcpStartDt: now.subtract(1, 'month').format('YYYYMMDD'),
  rcpEndDt: now.format('YYYYMMDD'),
  dlpnrNm: '',
  billExprDt: '',
  cntr: '',
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

let cachedParams;

async function fetchData() {
  grdMainRef2.value.getData().clearRows();

  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  const data = view.getDataSource();
  data.checkRowStates(false);
  data.setRows(pages);

  searchParams.value.isAddChk = true;

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);

  data.checkRowStates(true);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 계약상세번호 조회
async function onClickSelectCntr() {
  const { result, payload } = await modal({ component: 'WwctaContractNumberListP',
    // componentProps: { rveCd: searchParams.value.rveCd, rveNm: searchParams.value.rveNm },
  });
  if (result) {
    searchParams.value.cntrNo = payload.cntrNo;
    searchParams.value.cntrSn = payload.cntrSn;
    searchParams.value.cntr = payload.cntrNo + payload.cntrSn;

    let popupParams = {
      cntrNo: searchParams.value.cntrNo,
      cntrSn: searchParams.value.cntrSn,
    };

    popupParams = { ...popupParams };

    const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic/paging', { params: popupParams });
    if (!isEmpty(res.data.list[0])) {
      const dlpnrNms = res.data;

      searchParams.value.dlpnrNm = dlpnrNms.list[0].dlpnrNm;
    }
  }
}

// 신규등록
async function onClickCreate() {
  const { result } = await modal({
    component: 'WwwdbBillDepositRegP',
  });
  if (result) {
    grdMainRef2.value.getData().clearRows();
    await onClickSearch();
  }
}

async function onClearSelectCntr() {
  searchParams.value.cntr = '';

  searchParams.value.dlpnrNm = '';
}

async function onKeyDownSelectCntr() {
  searchParams.value.dlpnrNm = '';
}

// 상세조회 이벤트
let cachedSubParams;

async function fetchSubData() {
  cachedSubParams = { ...cachedSubParams, ...pageInfoSecond.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic-detail/paging', { params: cachedSubParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfoSecond.value = pagingResult;

  const view = grdMainRef2.value.getView();

  const data = view.getDataSource();

  data.checkRowStates(false);
  data.addRows(pages);
  data.checkRowStates(true);
}

async function removeData(params) {
  const view = grdMainRef2.value.getView();

  const allValues = gridUtil.getAllRowValues(view);
  const data = view.getDataSource();

  allValues.forEach((param) => {
    if ((param.cntrNo === params.cntrNo) && (param.itgDpNo === params.itgDpNo)) {
      data.removeRow(param.dataRow);
    }
  });
}

async function onClickSubSearch(data) {
  pageInfoSecond.value.pageIndex = 1;

  const itgDp = data;

  cachedSubParams = cloneDeep(itgDp);

  await fetchSubData();
}

// async function onClickSubSearch(data) {
//   grdMainRef2.value.getData().clearRows();

//   pageInfoSecond.value.pageIndex = 1;

//   const itgDp = data;

//   cachedSubParams = cloneDeep(itgDp);

//   await fetchSubData();
// }

// 엑셀다운로드
async function onClickExcelMainDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_거래현황`,
    timePostfix: true,
    exportData: res.data,
  });
}

// 엑셀다운로드
async function onClickExcelSubDownload() {
  const view = grdMainRef2.value.getView();
  // eslint-disable-next-line max-len
  // const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic-detail/excel-download', { params: cachedSubParams });
  // console.log(res);
  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_전자어음거래 상세현황`,
    timePostfix: true,
    // exportData: res.data,
  });
}

// 저장버튼
async function onClickSave() {
  const view = grdMainRef2.value.getView();
  const changedRows = gridUtil.getAllRowValues(view);

  if (await gridUtil.alertIfIsNotModified(view)) { return; }

  if (!await gridUtil.validate(view)) { return; }

  changedRows[0].state = 'updated';

  const cachedParam = {
    saveMainReq: changedRows[0],
    SaveMainDtlReq: changedRows,
  };

  await dataService.post('/sms/wells/withdrawal/idvrve/bill-deposits/electronic', cachedParam);

  notify(t('MSG_ALT_SAVE_DATA'));

  await onClickSearch();
  // await onClickSubSearch(changedRows[0]);
}

// 입금전표 생성
async function onClickDeposit() {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getCheckedRowValues(view);

  if (changedRows.length === 0) {
    await alert('데이터를 선택해주세요.');
    return false;
  }

  let errorCount = 0;
  let duplicateCheck = 0;

  changedRows.forEach((p1) => {
    if (changedRows[0].billBndNo !== p1.billBndNo) {
      errorCount += 1;
      return false;
    }

    if (!isEmpty(p1.billDpSapSlpno)) {
      duplicateCheck += 1;
      return false;
    }

    p1.sort = 'deposit';
  });

  if (errorCount > 0) {
    alert('전표 생성의 경우 동일한 채권번호만 가능합니다.');
    return false;
  }

  if (duplicateCheck > 0) {
    alert('이미 전표처리가 된 데이터가 존재합니다.');
    return false;
  }

  if (!await confirm('입금전표 생성 하시겠습니까?')) {
    return false;
  }

  const cachedParam = changedRows;

  await dataService.post('/sms/wells/withdrawal/idvrve/bill-deposits/deposit-processing', cachedParam);

  await fetchData();
}

// 대체전표 생성
async function onClickReplacementSlipProcessing() {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getCheckedRowValues(view);

  if (changedRows.length === 0) {
    await alert('데이터를 선택해주세요.');
    return false;
  }

  let errorCount = 0;
  let duplicateCheck = 0;
  let duplicateCheck2 = 0;
  changedRows.forEach((p1) => {
    if (changedRows[0].billBndNo !== p1.billBndNo) {
      errorCount += 1;
      return false;
    }
    if (isEmpty(p1.billDpSapSlpno)) {
      duplicateCheck += 1;
      return false;
    }
    if (!isEmpty(p1.billRplcSapSlpno)) {
      duplicateCheck2 += 1;
      return false;
    }
  });

  if (errorCount > 0) {
    alert('전표 생성의 경우 동일한 채권번호만 가능합니다.');
    return false;
  }
  if (duplicateCheck > 0) {
    alert('입금전표 생성이 안된 데이터 입니다.');
    return false;
  }
  if (duplicateCheck2 > 0) {
    alert('이미 전표처리가 된 데이터가 존재합니다.');
    return false;
  }

  if (!await confirm('대체전표 생성 하시겠습니까?')) {
    return false;
  }

  const cachedParam = changedRows;

  await dataService.post('/sms/wells/withdrawal/idvrve/bill-deposits/deposit-processing', cachedParam);

  await fetchData();
}

// 대상조회
// async function onClickTest() {
//   notify(t('MSG_ALT_DEVELOPING')); // 기능개발중입니다.
// }

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, /* 계약번호 */
    { fieldName: 'cntrSn' }, /* 계약일련번호 */
    { fieldName: 'cntrCstNo' }, /* 고객번호 */
    { fieldName: 'cntrDtlNo' }, /* 계약상세번호 */
    { fieldName: 'mconBzsNm' }, /* 거래처명 */
    { fieldName: 'billRmkCn' }, /* 어음구분 */
    { fieldName: 'billDpAmt', dataType: 'number' }, /* 입금액 */
    { fieldName: 'billRcpDt' }, /* 접수일자 */
    { fieldName: 'bzrno' }, /* 사업자등록번호 */
    { fieldName: 'billBndNo' }, /* 채권번호 */
    { fieldName: 'billBndAmt', dataType: 'number' }, /* 채권금액 */
    { fieldName: 'billExprDt' }, /* 만기일자 */
    { fieldName: 'cntrCount' }, /* 계약수 */
    { fieldName: 'itgDpNo' }, /* 통합입금번호 */
    { fieldName: 'billDpSapSlpno' },
    { fieldName: 'billRplcSapSlpno' },
    { fieldName: 'sellBzsBzrno' }, /* 판매업체사업자번호 */
    { fieldName: 'pblBzsBzrno' }, /* 발행업체사업자번호 */
    { fieldName: 'sort' }, /* 종류 */

  ];

  const columns = [
    { fieldName: 'billBndNo',
      header: t('MSG_TXT_BND_NO'),
      // , header: '채권번호'
      width: '198',
      styleName: 'rg-button-link text-left',
      renderer: { type: 'button' },
      mergeRule: {
        criteria: 'value',
      },
    },
    { fieldName: 'mconBzsNm',
      header: '거래처명',
      width: '125',
      styleName: 'text-center',
      mergeRule: {
        criteria: 'value',
      },
    },
    { fieldName: 'billRmkCn',
      header: t('MSG_TXT_BILL_DV'),
      // , header: '어음구분'
      width: '150',
      mergeRule: {
        criteria: 'value',
      } },
    { fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      // , header: '계약상세번호'
      width: '150',
      styleName: 'text-center',
      displayCallback(g, index) {
        const { cntrNo, cntrSn } = g.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'billDpAmt',
    // , header: '입금액'
      header: t('MSG_TXT_DP_AMT'),
      width: '130',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'billRcpDt',
      header: t('MSG_TXT_RCPDT'),
      // , header: '접수일자'
      width: '137',
      styleName: 'text-center',
      datetimeFormat: 'date' },
    { fieldName: 'bzrno',
      header: t('MSG_TXT_CRNO'),
      // header: '사업자등록번호',
      width: '134',
      styleName: 'text-left',
      displayCallback(grid, index, value) {
        return !isEmpty(value) ? `${value.substring(0, 3)}-${value.substring(3, 5)}-${value.substring(5, 10)}` : value;
      } },

    { fieldName: 'billBndAmt',
      header: t('MSG_TXT_BND_AMT'),
      // , header: '채권금액'
      width: '117',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'billExprDt',
      header: t('MSG_TXT_EXPR_DT'),
      // , header: '만기일자'
      width: '116',
      styleName: 'text-center',
      datetimeFormat: 'date' },
    { fieldName: 'cntrCount',
      header: t('MSG_TXT_CNTR_N'),
      // , header: '계약수'
      width: '117',
      styleName: 'text-right' },
    { fieldName: 'itgDpNo',
      header: t('MSG_TXT_ITG_DP_NO'),
      // , header: '통합입금번호'
      width: '116',
      styleName: 'text-center' },
    { fieldName: 'billDpSapSlpno',
      header: t('MSG_TXT_DP_SLIP_NO'),
      // , header: '입금전표번호'
      width: '116',
      styleName: 'text-left' },
    { fieldName: 'billRplcSapSlpno',
      header: t('MSG_TXT_RPLC_SLIP_NO'),
      // , header: '대체전표번호'
      width: '116',
      styleName: 'text-left' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.checkBar.showAll = false;

  view.onItemChecked = (grid, itemIndex) => {
    const checkState = grid.isCheckedItem(itemIndex);
    const itgDpNo = grid.getValue(itemIndex, 'itgDpNo');
    const cntrNo = grid.getValue(itemIndex, 'cntrNo');
    const cntrSn = grid.getValue(itemIndex, 'cntrSn');
    const paramData = {
      itgDpNo,
      cntrNo,
      cntrSn,
    };
    if (checkState === true) {
      onClickSubSearch(paramData);
    } else {
      removeData(paramData);
    }
  };

  // 체크박스 설정
  // view.onCellClicked = (grid, clickData) => {
  //   if (clickData.cellType === 'data') {
  //     grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
  //   }
  // };

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'billBndNo') {
      const { itgDpNo, cntrNo, bzrno, mconBzsNm,
        billBndNo, billRmkCn, billRcpDt, billExprDt, billDpAmt, sellBzsBzrno, pblBzsBzrno,
        billBndAmt } = g.getValues(itemIndex);

      const paramData = {
        itgDpNo,
        cntrNo,
        bzrno,
        mconBzsNm,
        sellBzsBzrno,
        pblBzsBzrno,
        billBndNo,
        billRmkCn,
        billRcpDt,
        billExprDt,
        billDpAmt,
        billBndAmt,
      };
      const { result } = await modal({
        component: 'WwwdbBillDepositRegP',
        componentProps: paramData,
      });

      if (result) {
        // await onClickSubSearch(paramData);
        grdMainRef2.value.getData().clearRows();
        await onClickSearch();
      }
    }
  };
});

const initGrid2 = defineGrid((data, view) => {
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
  ];

  const columns = [
    { fieldName: 'itgDpNo',
      header: t('MSG_TXT_ITG_DP_NO'),
      // , header: '통합입금번호'
      width: '126',
      styleName: 'text-center',
      editable: false,
    },
    { fieldName: 'rveCd',
      header: t('MSG_TXT_RVE_CD'),
      // , header: '수납코드'
      width: '80',
      styleName: 'text-center',
      editable: false },
    { fieldName: 'billBndNo',
      header: t('MSG_TXT_BND_NO'),
      // , header: '채권번호'
      width: '200',
      styleName: 'text-left',
      editable: false },
    { fieldName: 'billRmkCn',
      header: t('MSG_TXT_BILL_DV'),
      // , header: '어음구분'
      width: '120',
      styleName: 'text-center',
      editable: false },
    { fieldName: 'billRcpDt',
      header: t('MSG_TXT_RCPDT'),
      // , header: '접수일자'
      width: '120',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editable: false },
    { fieldName: 'billExprDt',
      header: t('MSG_TXT_EXPR_DT'),
      // , header: '만기일자'
      width: '120',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editable: false },
    { fieldName: 'cntr',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      // , header: '계약상세번호'
      width: '120',
      styleName: 'text-center',
      editable: false,
      displayCallback(g, index) {
        const { cntrNo, cntrSn } = g.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      } },
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

      width: '110',
      numberFormat: '#,##0',
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
