<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNA
2. 프로그램 ID : WwbnaPartTransferListM
3. 작성자 : gugyeongu
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 채권이관 > 파트이관 임시 페이지(프로그램 명세서 작성 후 전체 갱신)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      :modified-targets="['grdSub']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_BASE_YM')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_DIV2')"
        >
          <kw-select
            v-model="searchParams.bzHdqDvCd"
            :options="codes.BZ_HDQ_DV_CD"
            :label="$t('MSG_TXT_DIV2')"
            readonly
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CLCTAM_DV')"
        >
          <kw-select
            v-model="searchParams.clctamDvCd"
            :options="filteredCodes.CLCTAM_DV_CD"
            first-option="all"
            :label="$t('MSG_TXT_CLCTAM_DV')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_NW_DV')"
        >
          <!-- TODO: 코드관리 등록 안되어 있어서 생성 후 수정 필요 -->
          <kw-select
            v-model="searchParams.bndNwDvCd"
            :options="filteredCodes.BND_NW_DV_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NO')"
        >
          <!-- TODO: 고객번호 다른 화면에 맞춰서 작업 한 이벤트 명세서 맞춰서 수정 필요한 경우 수정 -->
          <kw-input
            v-model="searchParams.cstNo"
            regex="num"
            icon="search"
            :on-click-icon="openSearchUserPopup"
            clearable
            :on-keydown-no-click="true"
            maxlength="10"
            :rules="validateSearchCstNo"
            @keydown="isCustomer($event, 'type1')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NM')"
        >
          <!-- TODO: 고객번호 다른 화면에 맞춰서 작업 한 이벤트 명세서 맞춰서 수정 필요한 경우 수정 -->
          <kw-input
            v-model="searchParams.cstNm"
            icon="search"
            :on-click-icon="openSearchUserPopup"
            clearable
            :on-keydown-no-click="true"
            regex="alpha_hangul"
            maxlength="25"
            :rules="validateSearchCstNo"
            @keydown="isCustomer($event, 'type2')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MPNO')"
        >
          <kw-input
            v-model="searchParams.phoneNumber"
            :on-keydown-no-click="true"
            mask="telephone"
            :rules="validateSearchCstNo"
            @keydown="isCustomer($event, 'type3')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ $t('MSG_TXT_AGG_BY_PA') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          secondary
          dense
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          primary
          dense
          :label="$t('MSG_BTN_CNTN_CREATE')"
          :disable="isNotActivated"
          @click="onClickCreate"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="5"
        @init="initGrdMain"
      />
      <h3>{{ $t('MSG_TXT_AGG_DTL_BY_PA') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchDetailsData"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          grid-action
          :disable="isNotActivated"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          secondary
          dense
          :disable="pageInfo.totalCount === 0"
          @click="onClickDetailsExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdSubRef"
        name="grdSub"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdSub"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchDetailsData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal, codeUtil, getComponentType, useMeta, useDataService, defineGrid, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import { getBzHdqDvcd } from '~sms-common/bond/utils/bnUtil';
import { chkInputSearchComplete, openSearchUserCommonPopup, isCustomerCommon, checkAvailabilityCommon } from '~sms-common/bond/pages/transfer/utils/bnaTransferUtils';

const { t } = useI18n();
const { getConfig } = useMeta();
const { notify, alert, confirm } = useGlobal();
const { getters } = useStore();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'BND_CLCTN_PRP_DV_CD',
  'BND_CLCTN_PRP_RSON_CD',
  'COD_YN',
  'CLCTAM_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'BND_NW_DV_CD',
  'BZ_HDQ_DV_CD',
  'BND_BIZ_DV_CD',
  'LWM_TP_CD',
  'LWM_DTL_TP_CD',
);
const filteredCodes = ref({ CLCTAM_DV_CD: codes.CLCTAM_DV_CD.filter((obj) => (obj.codeId !== '09' && obj.codeId !== '10' && obj.codeId !== '11' && obj.codeId !== '90')), BND_NW_DV_CD: codes.BND_NW_DV_CD.filter((obj) => (obj.codeId !== '01')) });

const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const isNotActivated = ref(false);
const totalCount = ref(0);
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const defaultDate = dayjs().format('YYYYMM');
const { tenantId } = getters['meta/getUserInfo'];

let cachedParams;
const searchParams = ref({
  baseYm: defaultDate,
  bzHdqDvCd: getBzHdqDvcd(tenantId),
  clctamDvCd: '',
  bndNwDvCd: '',
  cstNo: '',
  phoneNumber: '',
  cstNm: '',
  workType: '',
});

const searchDetailsParams = ref({
  baseYm: '',
  bzHdqDvCd: searchParams.value.bzHdqDvCd,
  clctamDvCd: '',
  bndNwDvCd: '',
  cstNo: '',
  cstNm: '',
});

const canFeasibleSearch = ref({
  searchCustomerComplate: false,
});

async function fetchData() {
  pageInfo.value.pageIndex = 1;

  const res = await dataService.get('/sms/wells/bond/part-transfers', { params: cachedParams });
  const partTransfers = res.data;

  totalCount.value = partTransfers.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(partTransfers);
  // view.resetCurrent();
}

async function hasPartTransfer() {
  cachedParams = cloneDeep(searchParams.value);
  const response = await dataService.get('/sms/wells/bond/part-transfers/has-part-transfer', { params: cachedParams });
  if (!response.data) {
    await alert(t('MSG_ALT_PA_TF_NO_CRT'));
    return true;
  }
  return true;
}

async function onClickSearch() {
  const notifyMessage = await chkInputSearchComplete(searchParams, canFeasibleSearch);
  if (notifyMessage) {
    await alert(notifyMessage);
    return;
  }
  if (await hasPartTransfer()) {
    cachedParams = cloneDeep(searchParams.value);
    fetchData();
  }
}

async function fetchSummaryData() {
  const res = await dataService.get('/sms/wells/bond/part-transfers/details/summary', { params: searchDetailsParams.value });
  const view = grdSubRef.value.getView();

  view.columnByName('clctamDvCd').headerSummary.text = t('MSG_TXT_SUM');
  view.columnByName('objAmt').headerSummary.text = res.data.objAmt;
  view.columnByName('dlqAmt').headerSummary.text = res.data.dlqAmt;
  view.columnByName('thmChramAmt').headerSummary.text = res.data.thmChramAmt;
  view.columnByName('dlqAddDpAmt').headerSummary.text = res.data.dlqAddDpAmt;
  view.columnByName('rsgBorAmt').headerSummary.text = res.data.rsgBorAmt;
  view.columnByName('clctamDvCd').headerSummary.styleName = 'text-center';
}

async function fetchDetailsData() {
  searchDetailsParams.value.baseYm = searchParams.value.baseYm;
  searchDetailsParams.value.bndNwDvCd = searchParams.value.bndNwDvCd;
  searchDetailsParams.value.cstNo = searchParams.value.cstNo;
  searchDetailsParams.value.cstNm = searchParams.value.cstNm;
  fetchSummaryData();
  const res = await dataService.get('/sms/wells/bond/part-transfers/details/paging', { params: { ...searchDetailsParams.value, ...pageInfo.value } });
  const { list: partTransferDetails, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdSubRef.value.getView();
  view.getDataSource().setRows(partTransferDetails);
  // view.resetCurrent();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// TODO: 명세서에 맞춰서 서버 다운로드로 변경 해야 할 수 있음
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

async function onClickDetailsExcelDownload() {
  const view = grdSubRef.value.getView();

  const res = await dataService.get('/sms/wells/bond/part-transfers/details/excel-download', { params: searchDetailsParams.value });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function openSearchUserPopup() {
  await openSearchUserCommonPopup(searchParams, canFeasibleSearch);
}

async function isCustomer(event, workType = 'type1') {
  if (event.keyCode === 13) {
    if (!event.target.value) {
      await openSearchUserCommonPopup(searchParams, canFeasibleSearch);
      return;
    }
    searchParams.value.workType = workType;
    const notifyMessage = await isCustomerCommon(searchParams, canFeasibleSearch);
    if (notifyMessage) {
      notify(notifyMessage);
    }
  } else {
    canFeasibleSearch.value.searchCustomerComplate = false;
  }
}

async function checkAvailability(originClctamDvCd) {
  const checkAvailabilityParams = { baseYm: cachedParams.baseYm,
    bzHdqDvCd: cachedParams.bzHdqDvCd,
    clctamDvCd: originClctamDvCd || '01',
    tfBizDvCd: '01' };
  return await checkAvailabilityCommon(checkAvailabilityParams);
}

async function onClickSave() {
  const view = grdSubRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  const { originClctamDvCd } = changedRows[0];

  if (!await checkAvailability(originClctamDvCd)) {
    notify('파트이관을 수행 할 수 없습니다.(배정, 이관 확정 상태의 정보는 파트이관 할 수 없습니다.)');
    return;
  }

  await dataService.put('/sms/wells/bond/part-transfers', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickCreate() {
  if (!await checkAvailability()) {
    notify('파트이관을 수행 할 수 없습니다.(배정, 이관 확정 상태의 정보는 파트이관 할 수 없습니다.)');
    return;
  }
  cachedParams = cloneDeep(searchParams.value);
  const response = await dataService.get('/sms/wells/bond/part-transfers/has-part-transfer-detail', { params: cachedParams });
  if (response.data) {
    if (!await confirm(t('MSG_ALT_ASN_DTA_RECRT'))) { return; }
  } else {
    notify(t('MSG_ALT_PA_TF_EXCN'));
  }
  await dataService.post('/sms/wells/bond/part-transfers', cachedParams);

  // TODO: 통테 임시 작업 메시지 정의 필요
  await alert('파트이관이 완료 되었습니다.');
}

const validateSearchCstNo = async () => {
  const validaateMessage = await chkInputSearchComplete(searchParams, canFeasibleSearch);
  if (validaateMessage) {
    return validaateMessage;
  }
  return true;
};

watch(() => searchParams.value.baseYm, async (baseYm) => {
  if (baseYm !== defaultDate) {
    // isNotActivated.value = true;
  } else {
    // isNotActivated.value = false;
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'bzHdqDvCd',
      header: t('MSG_TXT_DIV2'),
      options: codes.BZ_HDQ_DV_CD,
      optionValue: 'codeId',
      optionLabel: 'codeName',
      width: '75',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } },
    { fieldName: 'clctamDvCd', header: t('MSG_TXT_CLCTAM_DV'), options: codes.CLCTAM_DV_CD, width: '75', styleName: 'text-center' },
    { fieldName: 'woCstCt', header: t('MSG_TXT_CST_N'), width: '80', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'woCntrCt', header: t('MSG_TXT_CNTR_N'), width: '80', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'woObjAmt', header: t('MSG_TXT_OJ_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'woDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'woThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'woDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'woRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rentalCstCt', header: t('MSG_TXT_CST_N'), width: '80', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rentalCntrCt', header: t('MSG_TXT_CNTR_N'), width: '80', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rentalObjAmt', header: t('MSG_TXT_OJ_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rentalDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rentalThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rentalDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rentalRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'leaseCstCt', header: t('MSG_TXT_CST_N'), width: '80', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'leaseCntrCt', header: t('MSG_TXT_CNTR_N'), width: '80', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'leaseObjAmt', header: t('MSG_TXT_OJ_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'leaseDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'leaseThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'leaseDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'leaseRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'mshCstCt', header: t('MSG_TXT_CST_N'), width: '80', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'mshCntrCt', header: t('MSG_TXT_CNTR_N'), width: '80', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'mshObjAmt', header: t('MSG_TXT_OJ_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'mshDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'mshThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'mshDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'mshRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rglrSppCstCt', header: t('MSG_TXT_CST_N'), width: '80', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rglrSppCntrCt', header: t('MSG_TXT_CNTR_N'), width: '80', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rglrSppObjAmt', header: t('MSG_TXT_OJ_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rglrSppDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rglrSppThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rglrSppDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rglrSppRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'hcrCstCt', header: t('MSG_TXT_CST_N'), width: '80', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'hcrCntrCt', header: t('MSG_TXT_CNTR_N'), width: '80', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'hcrObjAmt', header: t('MSG_TXT_OJ_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'hcrDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'hcrThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'hcrDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'hcrRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'spayCstCt', header: t('MSG_TXT_CST_N'), width: '80', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'spayCntrCt', header: t('MSG_TXT_CNTR_N'), width: '80', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'spayObjAmt', header: t('MSG_TXT_OJ_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'spayDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'spayThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'spayDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'spayRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '130', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'bzHdqDvCd', 'clctamDvCd',
    {
      header: t('MSG_TIT_TOT'),
      direction: 'horizontal',
      items: ['woCstCt', 'woCntrCt', 'woObjAmt', 'woDlqAmt', 'woThmChramAmt', 'woDlqAddAmt', 'woRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_RENTAL'),
      direction: 'horizontal',
      items: ['rentalCstCt', 'rentalCntrCt', 'rentalObjAmt', 'rentalDlqAmt', 'rentalThmChramAmt', 'rentalDlqAddAmt', 'rentalRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_FNN_LEASE'),
      direction: 'horizontal',
      items: ['leaseCstCt', 'leaseCntrCt', 'leaseObjAmt', 'leaseDlqAmt', 'leaseThmChramAmt', 'leaseDlqAddAmt', 'leaseRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_GE_MSH'),
      direction: 'horizontal',
      items: ['mshCstCt', 'mshCntrCt', 'mshObjAmt', 'mshDlqAmt', 'mshThmChramAmt', 'mshDlqAddAmt', 'mshRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_HCR_MSH'),
      direction: 'horizontal',
      items: ['rglrSppCstCt', 'rglrSppCntrCt', 'rglrSppObjAmt', 'rglrSppDlqAmt', 'rglrSppThmChramAmt', 'rglrSppDlqAddAmt', 'rglrSppRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_SNGL_PMNT'),
      direction: 'horizontal',
      items: ['hcrCstCt', 'hcrCntrCt', 'hcrObjAmt', 'hcrDlqAmt', 'hcrThmChramAmt', 'hcrDlqAddAmt', 'hcrRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_REG_DLVR'),
      direction: 'horizontal',
      items: ['spayCstCt', 'spayCntrCt', 'spayObjAmt', 'spayDlqAmt', 'spayThmChramAmt', 'spayDlqAddAmt', 'spayRsgBorAmt'],
    },
  ]);
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
  view.layoutByColumn('bzHdqDvCd').summaryUserSpans = { colspan: 2 };

  view.onCellDblClicked = async (g, { dataRow }) => {
    const { clctamDvCd } = gridUtil.getRowValue(g, dataRow);
    searchDetailsParams.value.clctamDvCd = clctamDvCd;
    fetchDetailsData();
  };
});
const initGrdSub = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseYm' },
    { fieldName: 'bzHdqDvCd' },
    { fieldName: 'cntrNo' },
    { fieldName: 'clctamDvCd' },
    { fieldName: 'originClctamDvCd' },
    { fieldName: 'bfPrtnrKnm' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstNm' },
    { fieldName: 'cstNo' },
    { fieldName: 'bndBizDvCd' },
    { fieldName: 'dlqMcn' },
    { fieldName: 'objAmt', dataType: 'number' },
    { fieldName: 'dlqAmt', dataType: 'number' },
    { fieldName: 'thmChramAmt', dataType: 'number' },
    { fieldName: 'dlqAddDpAmt', dataType: 'number' },
    { fieldName: 'rsgBorAmt', dataType: 'number' },
    { fieldName: 'lwmTpCd' },
    { fieldName: 'lwmDtlTpCd' },
    { fieldName: 'lwmDt' },
    { fieldName: 'dfltDt' },
    { fieldName: 'addr' },
  ];
  const columns = [
    { fieldName: 'clctamDvCd', header: t('MSG_TXT_CLCTAM_DV'), options: filteredCodes.value.CLCTAM_DV_CD, optionValue: 'codeId', optionLabel: 'codeName', editor: { type: 'list' }, width: '100' },
    { fieldName: 'originClctamDvCd', visible: false },
    { fieldName: 'bfPrtnrKnm', header: t('MSG_TXT_LSTMM_PSIC'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '170',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      } },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '135', styleName: 'text-center', editable: false },
    { fieldName: 'bndBizDvCd', header: t('MSG_TXT_PRDT_GUBUN'), width: '100', options: codes.BND_BIZ_DV_CD, editable: false },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '80', styleName: 'text-right', editable: false },
    { fieldName: 'objAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right', editable: false },
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right', editable: false },
    { fieldName: 'thmChramAmt', header: t('MSG_TXT_THM_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right', editable: false },
    { fieldName: 'dlqAddDpAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right', editable: false },
    { fieldName: 'rsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right', editable: false },
    { fieldName: 'lwmTpCd', header: t('MSG_TXT_LWM_TP'), width: '110', options: codes.LWM_TP_CD, editable: false },
    { fieldName: 'lwmDtlTpCd', header: t('MSG_TXT_LWM_DTL'), width: '110', options: codes.LWM_DTL_TP_CD, editable: false },
    { fieldName: 'lwmDt', header: t('MSG_TXT_LWM_DT'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'dfltDt', header: t('MSG_TXT_DE_RGST_DT'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'addr', header: t('MSG_TXT_ADDR'), width: '200', editable: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
  view.layoutByColumn('clctamDvCd').summaryUserSpans = { colspan: 7 };
  view.layoutByColumn('lwmTpCd').summaryUserSpans = { colspan: 5 };

  view.onCellClicked = () => {
    if (cachedParams.baseYm !== defaultDate) {
      // view.editOptions.editable = false;
    } else {
      // view.editOptions.editable = true;
    }
    view.editOptions.editable = true;
  };
});
</script>
