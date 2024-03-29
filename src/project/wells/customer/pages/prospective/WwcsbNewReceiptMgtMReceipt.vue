<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 고객 - 가망고객관리(CSB)
2. 프로그램 ID : WwcsbNewReceiptMgtMReceipt.vue - 신규접수 배정관리 - 접수조회(TAB) (W-CU-U-0030M01)
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객 >> 가망고객 >> 신규접수 배정관리 - 접수조회(TAB) 프로그램
****************************************************************************************************
--->
<template>
  <kw-search
    :modified-targets="['grdReceipt']"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_APPL_PRD',null,'접수기간')"
        required
      >
        <kw-date-range-picker
          v-model:from="searchParams.assignDtFrom"
          v-model:to="searchParams.assignDtTo"
          class="ml8"
          :label="$t('MSG_TXT_APPL_PRD',null,'접수기간')"
          rules="date_range_required"
        />
      </kw-search-item>

      <kw-search-item :label="t('MSG_TXT_RCP_DV',null,'접수구분')">
        <kw-select
          v-model="searchParams.sellInflwchnlDvCd"
          first-option="all"
          :options="RECEIPT_TYPE_CODE"
        />
      </kw-search-item>

      <kw-search-item :label="t('MSG_TXT_PRDT_GUBUN',null,'상품구분')">
        <kw-select
          v-model="searchParams.prdtType"
          :multiple="true"
          :options="PRDT_TYPE_CODE"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="fetchData"
        />
      </template>

      <kw-btn
        icon="download_on"
        dense
        :disable="pageInfo.totalCount === 0"
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdReceiptRef"
      name="grdReceipt"
      :need-context-menu="false"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initgrdReceipt"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, defineGrid, codeUtil, gridUtil, useMeta, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { getConfig } = useMeta();
const grdReceiptRef = ref(getComponentType('KwGrid'));
const { modal } = useGlobal();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/customer/receipts';
const codes = await codeUtil.getMultiCodes('COD_PAGE_SIZE_OPTIONS');

const RECEIPT_TYPE_CODE = [
  { codeId: '40', codeName: t('MSG_TXT_SERVICE_CENTER', null, '고객센터') },
  { codeId: '20', codeName: t('MSG_TXT_HMPG', null, '홈페이지') },
];

const PRDT_TYPE_CODE = [
  { codeId: '4', codeName: t('MSG_TXT_ENV_ELEC_1', null, '환경가전1') },
  { codeId: '5', codeName: t('MSG_TXT_ENV_ELEC_2', null, '환경가전2') },
  { codeId: '6', codeName: t('MSG_TXT_BEAN', null, '원두') },
  { codeId: '8', codeName: t('MSG_TXT_HOME_CARE', null, '홈케어') },
  { codeId: '7', codeName: t('MSG_TXT_SDING', null, '모종') },
  /* 배송 TODO DB에 코드없음. */
  // { codeId: '06', codeName: t('MSG_TXT_DLVRY') },
];

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
const searchParams = ref({
  assignDtFrom: dayjs().set('date', 1).format('YYYYMMDD'),
  assignDtTo: dayjs().format('YYYYMMDD'),
  sellInflwchnlDvCd: '', // 접수구분
  prdtType: [], // 상품구분
  isAllPrdt: true,
});

async function fetchData() {
  const mainRes = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: receiptList, pageInfo: pagingResult } = mainRes.data;

  console.log('receiptList', receiptList);
  pageInfo.value = pagingResult;
  const mainView = grdReceiptRef.value.getView();
  mainView.getDataSource().setRows(receiptList);
  mainView.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  searchParams.value.isAllPrdt = searchParams.value.prdtType.length === 0
    || PRDT_TYPE_CODE.length === searchParams.value.prdtType.length;
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdReceiptRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TIT_RCPT_ASN_MGT')} ${t('MSG_TXT_RECEIPT_SRCH')}`,
    timePostfix: true,
    exportData: res.data,
  });
}

// eslint-disable-next-line no-unused-vars
function ogAsnStatCdStyleCallback(grid, dataCell) {
  // const ret = {};
  // const ichrPrtnrNo = grid.getValue(dataCell.index.itemIndex, 'ichrPrtnrNo');
  // if (isEmpty(ichrPrtnrNo)) {
  //   ret.renderer = { type: 'button', editable: false };
  //   ret.editable = false;
  //   ret.styleName = 'btnshow';
  // } else {
  //   ret.styleName = 'btnhide';
  // }
  // return ret;

  // 230627 기존 등록된 사용자가 있어도 update 가능.
  // const ret = {};
  // ret.renderer = { type: 'button', editable: false };
  // return ret;

  const ret = {};
  const ichrPrtnrNo = grid.getValue(dataCell.index.itemIndex, 'ichrPrtnrNo');
  if (isEmpty(ichrPrtnrNo)) {
    ret.renderer = { type: 'button', editable: false };
    ret.editable = false;
    ret.styleName = 'btnshow';
  } else {
    // ret.styleName = 'btnhide';
    ret.renderer = { type: 'button', editable: false };
    ret.styleName = 'rg-button-link text-center';
  }
  return ret;
}

onMounted(async () => {
});

watch(() => route.query, async (query) => {
  console.log('RCPT query.isSearch', typeof (query.isSearch), query.fromUi);
  if (query.isSearch === 'true' && query.fromUi === 'RECV') onClickSearch();
}, { immediate: true });
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initgrdReceipt = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'pspcCstInflwDt', header: t('MSG_TXT_RCP_D'), width: '120', styleName: 'text-center' }, /* 접수일 */
    { fieldName: 'aplcSn', header: t('MSG_TXT_RCPT_NO'), width: '76', styleName: 'text-center' }, /* 접수번호 */
    { fieldName: 'recvTpNm', header: t('MSG_TXT_RCP_DV'), width: '120', styleName: 'text-center' }, /* 접수구분 */
    { fieldName: 'inrtPdDvNm', header: t('TXT_MSG_SELL_PD_DV_CD'), width: '198', styleName: 'text-left' }, /* 상품구분 */
    { fieldName: 'pspcCstKnm', header: t('MSG_TXT_CST_NAME'), width: '120', styleName: 'text-center' }, /* 고객이름 */
    { fieldName: 'otsdLkDrmVal', header: t('MSG_TXT_CST_CD'), width: '121', styleName: 'text-center' }, /* 고객코드 */
    { fieldName: 'phNo', header: t('MSG_TXT_MPNO'), width: '128', styleName: 'text-center' }, /* 휴대전화번호 */
    { fieldName: 'wireTelNo', header: t('MSG_TXT_TEL_NO'), width: '128', styleName: 'text-center' }, /* 전화번호 */
    { fieldName: 'contactDate', header: t('MSG_TXT_CONTACT_REQ_DT'), width: '120', styleName: 'text-center' }, /* 컨택요청일 */
    { fieldName: 'contactTime', header: t('MSG_TXT_REQ_TIME'), width: '140', styleName: 'text-center' }, /* 요청시간 */
    { fieldName: 'pspcCstRcpCn', header: t('MSG_TXT_REQ_CN'), width: '198', styleName: 'text-left' }, /* 요청내용 */
    { fieldName: 'ichrAsnFshDt', header: t('MSG_TXT_ASND_ON'), width: '114', styleName: 'text-center' }, /* 배정일 */
    { fieldName: 'ichrPrtnrNm',
      header: t('MSG_TXT_ASSIGN_MANAGER'),
      editable: false,
      styleName: 'text-center',
      displayCallback: (grid, index) => (isEmpty(grid.getValue(index.itemIndex, 'ichrPrtnrNo')) ? t('MSG_BTN_MANUAL_ASSIGN') : grid.getValue(index.itemIndex, 'ichrPrtnrNm')),
      styleCallback: (grid, dataCell) => ogAsnStatCdStyleCallback(grid, dataCell) }, /* 배정담당자 */

    { fieldName: 'ichrPrtnrNo', header: t('MSG_TXT_ASSIGNER_EP_NO'), width: '120', styleName: 'text-center' }, /* 배정담당자 사번 */
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '130', styleName: 'text-center' }, /* 계약번호 */
    { fieldName: 'fstRgstDtmCp', header: t('MSG_TXT_CRT_D'), width: '114', styleName: 'text-center', datetimeFormat: 'date' }, /* 생성일 */
    { fieldName: 'sppDuedt', header: t('MSG_TXT_DUEDT'), width: '114', styleName: 'text-center' }, /* 예정일 */
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_DT_OF_SALE'), width: '114', styleName: 'text-center' }, /* 매출일 */
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '143', styleName: 'text-left' }, /* 제품명 */
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '77', styleName: 'text-center' }, /* 우편번호 */
    { fieldName: 'custAdr', header: t('MSG_TXT_ADDR'), width: '275', styleName: 'text-left' }, /* 주소 */

    // 등록/수정일
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT', null, '등록일'), width: '114', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGST_USR'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'fstRgstUsrId', header: 'RGST_ID', width: '50', visible: false },
    { fieldName: 'fstRgstDeptNm', header: t('MSG_TXT_RGST_DEPT', null, '등록부서'), width: '120', styleName: 'text-center' },

    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '110', styleName: 'text-center', datetimeFormat: 'date', editable: false },
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcUsrId', header: 'MDFC_ID', width: '50', visible: false },
    { fieldName: 'fnlMdfcDeptNm', header: t('MSG_TXT_FNL_MDFC_DEPT', null, '최종수정부서'), width: '120', styleName: 'text-center' },

    /* ------- 내부 사용 변수 선언 (hidden값이므로 다국어처리 열외)  ------- */
    { fieldName: 'pspcCstCnslId', header: 'pspcCstCnslId', width: '50', visible: false },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;
  view.checkBar.visible = false;

  view.onCellDblClicked = async (g, clickData) => {
    if (clickData.cellType === 'data') {
      const pspcCstCnslId = g.getValue(clickData.itemIndex, 'pspcCstCnslId');
      const cntrNo = g.getValue(clickData.itemIndex, 'cntrNo');
      const targetUrl = '/customer/wwcsb-new-receipt-mgt/wwcsb-new-receipt-mgt-m-Receipt-dtl';
      await router.push({ path: targetUrl, query: { pspcCstCnslId, fromUi: 'RECV', cntrNo } });
    }
  };

  // eslint-disable-next-line no-unused-vars
  view.onCellItemClicked = async (g, { column, dataRow, itemIndex }) => {
    const rowData = gridUtil.getRowValue(g, dataRow);
    if (column === 'ichrPrtnrNm') {
      const componentProps = { pspcCstCnslId: rowData?.pspcCstCnslId, jobType: 'RECV', ichrPrtnrNo: rowData?.ichrPrtnrNo };
      const { result, payload } = await modal({ component: 'WwcsbManualAssignModP', componentProps });
      if (result && payload) await fetchData();
    }
  };
});
</script>

<style>
.btnshow div .rg-button-renderer-button {
  visibility: visible !important;
  overflow: visible !important;
}

.btnhide div .rg-button-renderer-button {
  visibility: hidden !important;
  overflow: hidden !important;
}
</style>
