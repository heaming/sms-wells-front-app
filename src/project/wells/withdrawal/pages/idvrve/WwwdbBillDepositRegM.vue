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
            rules="required"
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
          dense
          secondary
          :label="t('MSG_BTN_DP_SLIP')"
          @click="onClickTest"
        />
        <!-- label="입금전표" -->
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_RPLC_SLIP')"
          @click="onClickTest"
        />
        <!-- label="대체전표" -->
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
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
import { codeUtil, defineGrid, getComponentType, gridUtil, modal, useDataService, useMeta, notify } from 'kw-lib';
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
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  console.log(pages);

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  const data = view.getDataSource();
  data.checkRowStates(false);
  data.setRows(pages);

  searchParams.value.isAddChk = true;

  data.checkRowStates(true);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;

  grdMainRef2.value.getData().clearRows();

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 계약상세번호 조회
async function onClickSelectCntr() {
  const { result, payload } = await modal({ component: 'WwctaContractNumberListP',
    // componentProps: { rveCd: searchParams.value.rveCd, rveNm: searchParams.value.rveNm },
  });
  if (result) {
    console.log(payload);
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
  await modal({
    component: 'WwwdbBillDepositRegP',
  });
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

  console.log(pages);
  pageInfoSecond.value = pagingResult;

  const view = grdMainRef2.value.getView();

  const data = view.getDataSource();
  data.checkRowStates(false);
  data.addRows(pages);
  data.checkRowStates(true);
}

async function onClickSubSearch(data) {
  grdMainRef2.value.getData().clearRows();

  pageInfoSecond.value.pageIndex = 1;

  const itgDp = data;

  cachedSubParams = cloneDeep(itgDp);

  await fetchSubData();
}

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
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/bill-deposits/electronic-detail/excel-download', { params: cachedSubParams });
  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_전자어음거래 상세현황`,
    timePostfix: true,
    exportData: res.data,
  });
}

// 저장버튼
async function onClickSave() {
  const view = grdMainRef2.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);

  console.log(changedRows);

  if (await gridUtil.alertIfIsNotModified(view)) { return; }

  if (!await gridUtil.validate(view)) { return; }

  changedRows[0].state = 'updated';

  const cachedParam = {
    saveMainReq: changedRows[0],
    SaveMainDtlReq: changedRows,
  };

  console.log(changedRows);

  await dataService.post('/sms/wells/withdrawal/idvrve/bill-deposits/electronic', cachedParam);

  notify(t('MSG_ALT_SAVE_DATA'));

  await onClickSubSearch(changedRows[0]);
}

// 대상조회
async function onClickTest() {
  notify(t('MSG_ALT_DEVELOPING')); // 기능개발중입니다.
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, /* 계약번호 */
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
    { fieldName: 'col3' },

  ];

  const columns = [
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_NO'),
      // , header: '계약번호'
      width: '125',
      styleName: 'text-left' },
    { fieldName: 'mconBzsNm',
      header: '거래처명',
      width: '125',
      styleName: 'rg-button-link',
      renderer: { type: 'button' } },
    { fieldName: 'billRmkCn',
      header: t('MSG_TXT_BILL_DV'),
      // , header: '어음구분'
      width: '130' },
    { fieldName: 'billDpAmt',
    // , header: '입금액'
      header: t('MSG_TXT_DP_AMT'),
      width: '143',
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
    { fieldName: 'billBndNo',
      header: t('MSG_TXT_BND_NO'),
      // , header: '채권번호'
      width: '198',
      styleName: 'text-left' },
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
      styleName: 'text-left' },
    { fieldName: 'col3',
      header: t('MSG_TXT_DP_SLIP_NO'),
      // , header: '입금전표번호'
      width: '116',
      styleName: 'text-left' },
    { fieldName: 'col3',
      header: t('MSG_TXT_RPLC_SLIP_NO'),
      // , header: '대체전표번호'
      width: '116',
      styleName: 'text-left' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'mconBzsNm') {
      const itgDpNo = g.getValue(itemIndex, 'itgDpNo');
      const cntrNo = g.getValue(itemIndex, 'cntrNo');

      const paramData = {
        itgDpNo,
        cntrNo,
      };

      await onClickSubSearch(paramData);
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
      // , header: '채권번호'
      width: '200',
      styleName: 'text-left',
      editable: false },
    { fieldName: 'billRmkCn',
      header: t('MSG_TXT_BILL_DV'),
      // , header: '어음구분'
      width: '120',
      styleName: 'text-left',
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
      styleName: 'text-left',
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
