  <!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 고객 - 가망고객관리(CSB)
2. 프로그램 ID : WwcsbNewReceiptMgtMAssign.vue - 신규접수 배정관리 - 배정조회(TAB) (W-CU-U-0030M02)
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객 >> 가망고객 >> 신규접수 배정관리 - 배정조회(TAB) 프로그램
****************************************************************************************************
--->
<template>
  <kw-search
    :modified-targets="['grdAssign']"
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- 배정일  -->
      <kw-search-item
        :label="t('MSG_TXT_ASND_ON')"
        required
      >
        <kw-date-range-picker
          v-model:from="searchParams.assignDtFrom"
          v-model:to="searchParams.assignDtTo"
          :label="t('MSG_TXT_ASND_ON')"
          class="ml8"
          rules="date_range_required"
        />
      </kw-search-item>

      <!-- 배정담당자 사번 -->
      <kw-search-item :label="$t('MSG_TXT_ASSIGNER_EP_NO')">
        <kw-input
          v-model.trim="searchParams.ichrPrtnrNo"
          maxlength="10"
        />
      </kw-search-item>

      <!-- 상품구분 -->
      <kw-search-item :label="t('MSG_TXT_PRDT_GUBUN')">
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
        v-permission:download
        icon="download_on"
        dense
        :disable="pageInfo.totalCount === 0"
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExcelDownload"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <!-- 배정컨텍 -->
      <kw-btn
        v-permission:update
        grid-action
        dense
        :label="$t('MSG_TXT_ASSIGN_CONTACT')"
        @click="onClickAssignContact"
      />
    </kw-action-top>
    <kw-grid
      ref="grdAssignRef"
      name="grdAssign"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initgrdAssign"
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
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { getConfig } = useMeta();
const grdAssignRef = ref(getComponentType('KwGrid'));
const { notify, modal } = useGlobal();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// 접수/배정 조회 하나로 조회할지 분기칠지 고민!!!!
const baseUrl = '/sms/wells/customer/receipts/assign';
const codes = await codeUtil.getMultiCodes('COD_PAGE_SIZE_OPTIONS');

const PRDT_TYPE_CODE = [
  { codeId: '4', codeName: t('MSG_TXT_ENV_ELEC_1') }, /* 환경가전1 */
  { codeId: '5', codeName: t('MSG_TXT_ENV_ELEC_2') }, /* 환경가전2 */
  { codeId: '6', codeName: t('MSG_TXT_BEAN') }, /* 원두 */
  { codeId: '8', codeName: t('MSG_TXT_HOME_CARE') }, /* 홈케어 */
  { codeId: '7', codeName: t('MSG_TXT_SDING') }, /* 모종 */
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
  ichrPrtnrNo: '',
});

async function fetchData() {
  console.log(cachedParams);
  const mainRes = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: assignList, pageInfo: pagingResult } = mainRes.data;
  pageInfo.value = pagingResult;
  const mainView = grdAssignRef.value.getView();
  mainView.getDataSource().setRows(assignList);
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
  const view = grdAssignRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TIT_RCPT_ASN_MGT')} ${t('MSG_TIT_ASSIGN_SRCH')}`,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickAssignContact() {
  const view = grdAssignRef.value.getView();
  if (view.getCheckedRows().length === 0) {
    notify(t('MSG_ALT_SELECT_ONE_ROW', [t('MSG_TXT_ASSIGN_CONTACT')]));
    return false;
  }
  const checkedRow = gridUtil.getCheckedRowValues(view);
  const pspcCstCnslIds = checkedRow.map(({ pspcCstCnslId }) => pspcCstCnslId);

  const { result, payload } = await modal({
    component: 'WwcsbAssignContactModP', /* 배정컨텍 팝업 */
    componentProps: { jobType: 'ASGN', pspcCstCnslIds },
  });

  if (result && payload === 'T') await fetchData();
}

watch(() => route.query, async (query) => {
  console.log('ASGN query.isSearch', typeof (query.isSearch), query.fromUi);
  if (query.isSearch === 'true' && query.fromUi === 'ASGN') onClickSearch();
}, { immediate: true });

onMounted(async () => { });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initgrdAssign = defineGrid((data, view) => {
  const columns = [

    { fieldName: 'ichrAsnFshDt', header: t('MSG_TXT_ASND_ON'), width: '114', styleName: 'text-center' }, /* 배정일 */
    { fieldName: 'ichrPrtnrNm', header: t('MSG_TXT_ASSIGN_MANAGER'), width: '114', styleName: 'text-center' }, /* 배정담당자 */
    { fieldName: 'ichrPrtnrNo', header: t('MSG_TXT_ASSIGNER_EP_NO'), width: '120', styleName: 'text-center' }, /* 배정담당자 사번 */
    { fieldName: 'pspcCstCnslRsNm', header: t('MSG_TXT_ASSIGN_CONTACT'), width: '120', styleName: 'text-center' }, /* 배정컨택 */
    { fieldName: 'cnslMoCn', header: t('MSG_TXT_NOTE'), width: '177', styleName: 'text-left' }, /* 비고 */
    { fieldName: 'pspcCstInflwDt', header: t('MSG_TIT_RECPETN_DT'), width: '120', styleName: 'text-center' }, /* 접수일 */
    { fieldName: 'aplcSn', header: t('MSG_TXT_RCPT_NO'), width: '76', styleName: 'text-center' }, /* 접수번호 */
    { fieldName: 'recvTpNm', header: t('MSG_TXT_RCP_DV'), width: '120', styleName: 'text-center' }, /* 접수구분 */
    { fieldName: 'inrtPdDvNm', header: t('TXT_MSG_SELL_PD_DV_CD'), width: '198', styleName: 'text-left' }, /* 상품구분 */
    { fieldName: 'contactDate', header: t('MSG_TXT_CONTACT_REQ_DT'), width: '120', styleName: 'text-center' }, /* 컨택요청일 */

    { fieldName: 'contactTime', header: t('MSG_TXT_REQ_TIME'), width: '100', styleName: 'text-center' }, /* 요청시간 */
    { fieldName: 'pspcCstRcpCn', header: t('MSG_TXT_REQ_CN'), width: '198', styleName: 'text-left' }, /* 요청내용 */
    { fieldName: 'pspcCstKnm', header: t('MSG_TXT_CST_NAME'), width: '120', styleName: 'text-center' }, /* 고객이름 */
    { fieldName: 'otsdLkDrmVal', header: t('MSG_TXT_CST_CD'), width: '121', styleName: 'text-center' }, /* 고객코드 */
    { fieldName: 'phNo', header: t('MSG_TXT_MPNO'), width: '128', styleName: 'text-center' }, /* 휴대전화번호 */
    { fieldName: 'wireTelNo', header: t('MSG_TXT_TEL_NO'), width: '128', styleName: 'text-center' }, /* 전화번호 */

    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '121', styleName: 'text-center' }, /* 계약번호 */
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_CRT_D'), width: '114', styleName: 'text-center', datetimeFormat: 'date' }, /* 생성일 */
    { fieldName: 'sppDuedt', header: t('MSG_TXT_DUEDT'), width: '114', styleName: 'text-center' }, /* 예정일 */
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_DT_OF_SALE'), width: '114', styleName: 'text-center' }, /* 매출일 */

    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '143', styleName: 'text-center' }, /* 제품명 */
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '77', styleName: 'text-center' }, /* 우편번호 */
    { fieldName: 'custAdr', header: t('MSG_TXT_ADDR'), width: '275', styleName: 'text-left' }, /* 주소 */
    // 등록/수정일
    // { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '110', datetimeFormat: 'date', editable: false },
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGST_USR'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'fstRgstUsrId', header: 'RGST_ID', width: '50', visible: false },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '110', styleName: 'text-center', datetimeFormat: 'date', editable: false },
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcUsrId', header: 'MDFC_ID', width: '50', visible: false },

    /* ------- 내부 사용 변수 선언 (hidden값이므로 다국어처리 열외)  ------- */
    { fieldName: 'pspcCstCnslId', header: 'pspcCstCnslId', width: '130', visible: false }, /* 가망고객상담ID - PK */

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;
  view.checkBar.visible = true;

  // view.onCellItemClicked = async (g, { column, dataRow }) => {
  //   if (['fstRgstUsrNm', 'fnlMdfcUsrNm'].includes(column)) {
  //     const { fstRgstUsrId, fnlMdfcUsrId } = gridUtil.getRowValue(g, dataRow);
  //     const userId = column === 'fstRgstUsrNm' ? fstRgstUsrId : fnlMdfcUsrId;
  //     await modal({ component: 'ZwcmzUserDtlP', componentProps: { userId } });
  //   }
  // };

  view.onCellDblClicked = async (g, clickData) => {
    if (clickData.cellType === 'data') {
      const pspcCstCnslId = g.getValue(clickData.itemIndex, 'pspcCstCnslId');
      const targetUrl = '/customer/wwcsb-new-receipt-mgt/wwcsb-new-receipt-mgt-m-Receipt-dtl';
      await router.push({ path: targetUrl, query: { pspcCstCnslId, jobType: 'ASGN', fromUi: 'ASGN' } });
    }
  };
});
</script>
