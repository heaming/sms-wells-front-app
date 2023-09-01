<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNA
2. 프로그램 ID : WwbnaCollectorAssignM - 집금자배정
3. 작성자 : gu.gyeongu
4. 작성일 : 2023.02.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 집금자배정 화면
- 채권별 집금자 집계, 변경
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      ref="kwSearchRef"
      :cols="4"
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
          required
        >
          <kw-select
            v-model="searchParams.bzHdqDvCd"
            :options="codes.BZ_HDQ_DV_CD"
            :label="$t('MSG_TXT_DIV2')"
            rules="required"
            readonly
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CLCTAM_DV')"
          required
        >
          <kw-select
            v-model="searchParams.clctamDvCd"
            :options="filteredCodes.CLCTAM_DV_CD"
            :label="$t('MSG_TXT_CLCTAM_DV')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CLCTAM_PSIC')"
        >
          <!-- TODO: 집금담당자 번호 입력시 정상 번호인지 확인 하는 작업 필요(집금담당자 조회 화면 개발 후 추가 작업 필요) -->
          <kw-input
            v-model="searchParams.clctamPrtnrNm"
            icon="search"
            clearable
            :label="$t('MSG_TXT_CLCTAM_PSIC')"
            :on-click-icon="openSearchClctamPsicPopup"
            :on-keydown-no-click="true"
            regex="alpha_hangul"
            maxlength="25"
            :rules="validateSearchClctamPrtnr"
            @keydown.enter="fetchPartnerNo"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_NW_DV')"
        >
          <!-- TODO: 코드 정의 안되어 있음 정의 되면 코드보게 수정필요 -->
          <kw-select
            v-model="searchParams.bndNwDvCd"
            :options="filteredCodes.BND_NW_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NO')"
        >
          <kw-input
            v-model="searchParams.cstNo"
            regex="num"
            icon="search"
            :on-click-icon="openSearchUserPopup"
            :on-keydown-no-click="true"
            maxlength="10"
            :rules="validateSearchCstNo"
            @keydown="isCustomer($event, 'type1')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NM')"
        >
          <kw-input
            v-model="searchParams.cstNm"
            icon="search"
            clearable
            :on-click-icon="openSearchUserPopup"
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
            mask="telephone"
            :on-keydown-no-click="true"
            :rules="validateSearchCstNo"
            @keydown="isCustomer($event, 'type3')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ $t('MSG_TXT_AGRG_RS') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          v-permission:download
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
          v-permission:create
          :label="$t('MSG_BTN_DTRM')"
          secondary
          dense
          :disable="isNotActivated || assignConfirmed"
          @click="onClickConfirm"
        />
        <kw-btn
          :label="$t('MSG_BTN_ASN_WEIT_MDFC')"
          secondary
          dense
          :disable="!isCollectionManager"
          @click="onClickPageMove"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          primary
          dense
          :label="$t('MSG_BTN_CNTN_CREATE')"
          :disable="isNotActivated || assignConfirmed"
          @click="onClickCreate"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="5"
        @init="initGrdMain"
      />
      <h3>{{ $t('MSG_TXT_AGRG_RS_DTL') }}</h3>
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
          v-permission:create
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          :disable="isNotActivated || assignConfirmed"
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
        <kw-btn
          v-permission:create
          icon="upload_on"
          secondary
          dense
          :label="$t('MSG_BTN_EXCEL_UP')"
          :disable="isNotActivated || assignConfirmed"
          @click="onClickExcelUpload"
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
import { useGlobal, codeUtil, getComponentType, router, useMeta, useDataService, defineGrid, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import { getBzHdqDvcd } from '~sms-common/bond/utils/bnUtil';
import { chkInputSearchComplete, chkClctamPrtnrSearchComplete, openSearchUserCommonPopup, isCustomerCommon, openSearchClctamPsicCommonPopup, fetchPartnerNoCommon, checkAvailabilityCommon } from '~sms-common/bond/pages/transfer/utils/bnaTransferUtils';

const { t } = useI18n();
const { getConfig, hasRoleNickName } = useMeta();
const { modal, notify, confirm } = useGlobal();
const { getters } = useStore();
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'CLCTAM_DV_CD',
  'DIV_DV_CD',
  'LWM_TP_CD',
  'LWM_DTL_TP_CD',
  'BZ_HDQ_DV_CD',
  'BND_NW_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);
const filteredCodes = ref({ CLCTAM_DV_CD: codes.CLCTAM_DV_CD.filter((obj) => (obj.codeId !== '09' && obj.codeId !== '10' && obj.codeId !== '11' && obj.codeId !== '90' && obj.codeId !== '99')),
  BND_NW_DV_CD: codes.BND_NW_DV_CD.filter((obj) => (obj.codeId !== '01')) });

const kwSearchRef = ref(getComponentType('KwSearch'));
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const isNotActivated = ref(false);
const assignConfirmed = ref(false);
// const isCollectionManager = true;
const isCollectionManager = hasRoleNickName('CLCTAM_MNGT');
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
  clctamPrtnrNo: '',
  clctamPrtnrNm: '',
  cstNm: '',
  tfBizDvCd: '02',
  phoneNumber: '',
});

const searchDetailsParams = ref({
  baseYm: '',
  bzHdqDvCd: getBzHdqDvcd(tenantId),
  clctamDvCd: '',
  bndNwDvCd: '',
  cstNo: '',
  clctamPrtnrNo: '',
  tfBizDvCd: '',
});
const canFeasibleSearch = ref({
  searchCustomerComplate: false,
});

const pageMove = ref({
  url: '/bond/zwbny-assign-weight-mgt',
});

async function checkAvailability(tfBizDvCd) {
  const checkAvailabilityParams = { baseYm: cachedParams.baseYm,
    bzHdqDvCd: cachedParams.bzHdqDvCd,
    clctamDvCd: cachedParams.clctamDvCd,
    tfBizDvCd };
  return await checkAvailabilityCommon(checkAvailabilityParams);
}

async function fetchData() {
  const subView = grdSubRef.value.getView();
  subView.getDataSource().setRows();

  const res = await dataService.get('/sms/wells/bond/collector-assigns', { params: cachedParams });
  const partTransfers = res.data;

  totalCount.value = partTransfers.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(partTransfers);

  grdSubRef.value?.getView().getDataSource().clearRows();
  pageInfo.value.totalCount = 0;

  // 작업 가능, 불가능 여부를 넘겨주게 되어 있어 disabled에 넣기 위해 ! 으로 변경
  assignConfirmed.value = !await checkAvailability('02');
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  fetchData();
}

async function fetchSummaryData() {
  const res = await dataService.get('/sms/wells/bond/collector-assigns/details/summary', { params: searchDetailsParams.value });
  const view = grdSubRef.value.getView();

  view.columnByName('clctamPrtnrKnm').headerSummary.text = t('MSG_TXT_TOT_SUMMARY');
  view.columnByName('objAmt').headerSummary.text = res.data.objAmt;
  view.columnByName('dlqAmt').headerSummary.text = res.data.dlqAmt;
  view.columnByName('thmChramAmt').headerSummary.text = res.data.thmChramAmt;
  view.columnByName('dlqAddDpAmt').headerSummary.text = res.data.dlqAddDpAmt;
  view.columnByName('rsgBorAmt').headerSummary.text = res.data.rsgBorAmt;
  view.columnByName('clctamPrtnrKnm').headerSummary.styleName = 'text-center';
}

async function fetchDetailsData() {
  fetchSummaryData();
  const res = await dataService.get('/sms/wells/bond/collector-assigns/details/paging', { params: { ...searchDetailsParams.value, ...pageInfo.value } });
  const { list: collectorAssigns, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdSubRef.value.getView();
  view.getDataSource().setRows(collectorAssigns);
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
  const res = await dataService.get('/sms/wells/bond/collector-assigns/details/excel-download', { params: searchDetailsParams.value });
  const view = grdSubRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickExcelUpload() {
  const apiUrl = '/sms/wells/bond/collector-assigns/details/excel-upload';
  const templateId = 'FOM_BND_ASN';
  const extraData = {
    baseYm: cachedParams.baseYm,
  };
  const {
    payload,
  } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId, extraData },
  });
  if (payload.status === 'S') {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchDetailsData();
  }
}

async function checkRquest(changedRows) {
  let isRequest = true;
  let rowNum = 0;
  changedRows.forEach((obj) => {
    const { changeClctamPrtnrKnm } = obj;
    rowNum += 1;
    if (changeClctamPrtnrKnm === 'Y') { // 수정 후 검증된 정보 이거나 팝업을 통해 넘어온 값이 아닌 경우 처리 되지 않음
      isRequest = false;
      return isRequest;
    }
  });
  if (!isRequest) {
    notify(t('MSG_ALT_USE_NOT_PROC', [`(${rowNum})${t('MSG_TXT_DTA')}`]));
  }
  return isRequest;
}

async function onClickSave() {
  const view = grdSubRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  if (!await checkRquest(changedRows)) {
    return;
  }
  changedRows.forEach((obj) => {
    obj.clctamDvCd = cachedParams.clctamDvCd;
  });
  await dataService.put('/sms/wells/bond/collector-assigns', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchDetailsData();
}

async function onClickCreate() {
  // TODO: 구현된 로직에 대한 테스트 지속적으로 필요, 완벽하다고 생각 되면 이 주석 제거 그 전까지 생각나면 내용 확인/갱신/테스트
  if (!await kwSearchRef.value.validate()) { return; }
  if (!await confirm(t('MSG_ALT_CLCTAM_PSIC_ASN_CONF', [codes.CLCTAM_DV_CD.filter((obj) => (obj.codeId === searchParams.value.clctamDvCd))[0].codeName]))) { return; }
  cachedParams = cloneDeep(searchParams.value);
  const response = await dataService.get('/sms/common/bond/collector-changes/has-collector-assing', { params: cachedParams });
  if (response.data) {
    notify(t('MSG_ALT_ASN_DTA_RECRT_SECOND'));
  } else {
    notify(t('MSG_ALT_ALLO_OF_COLL_EXCN'));
  }

  const responseBatchJob = await dataService.post('/sms/wells/bond/collector-assigns', cachedParams);
  const { result } = await modal({
    component: 'ZwbnaCollectorAssignP',
    componentProps: {
      jobId: responseBatchJob.data,
    },
  });
  if (result) {
    await fetchData();
  }
}

async function onClickPageMove() {
  router.push({
    path: pageMove.value.url,
  });
}

async function onClickConfirm() {
  // TODO: 명세서 다시 변경될 예정 맞춰서 수정 필요 search영역의 정보를 가지고 가고 필수 부분이 동일해 우선 kwSearchRef 기준으로 작업
  if (!await kwSearchRef.value.validate()) { return; }
  cachedParams = cloneDeep(searchParams.value);
  const response = await dataService.get('/sms/common/bond/collector-changes/has-collector-assing', { params: cachedParams });
  if (response.data) {
    await dataService.put('/sms/wells/bond/collector-assigns/confirm', cachedParams);
    notify(t('MSG_ALT_MODIFIED'));

    await fetchData();
  } else {
    notify('집금자배정을 먼저 수행해야 합니다'); // TODO: toast관련 내용 한번더 확인, 확정 후 수정
  }
}

async function openSearchClctamPsicPopup() {
  await openSearchClctamPsicCommonPopup(searchParams);
}

async function fetchPartnerNo() {
  const notifyMessage = await fetchPartnerNoCommon(searchParams);
  if (notifyMessage) {
    notify(notifyMessage);
  }
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

async function openSearchUserPopup() {
  await openSearchUserCommonPopup(searchParams, canFeasibleSearch.value);
}

const validateSearchCstNo = async () => {
  const validaateMessage = await chkInputSearchComplete(searchParams, canFeasibleSearch);
  if (validaateMessage) {
    return validaateMessage;
  }
  return true;
};

const validateSearchClctamPrtnr = async () => {
  const validaateMessage = await chkClctamPrtnrSearchComplete(searchParams);
  if (validaateMessage) {
    return validaateMessage;
  }
  return true;
};

watch(() => searchParams.value.clctamPrtnrNm, async (clctamPrtnrNm) => {
  if (!clctamPrtnrNm) {
    searchParams.value.clctamPrtnrNo = '';
  }
});
watch(() => searchParams.value.baseYm, async (baseYm) => {
  const view = grdSubRef.value.getView();
  if (baseYm !== defaultDate) {
    view.editOptions.editable = false;
    isNotActivated.value = true;
  } else {
    view.editOptions.editable = isCollectionManager;
    isNotActivated.value = false;
  }
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseYm' },
    { fieldName: 'clctamPrtnrNo' },
    { fieldName: 'clctamPrtnrKnm' },
    { fieldName: 'asnRat' },
    { fieldName: 'woCstCt', dataType: 'number' },
    { fieldName: 'woCntrCt', dataType: 'number' },
    { fieldName: 'woObjAmt', dataType: 'number' },
    { fieldName: 'woDlqAmt', dataType: 'number' },
    { fieldName: 'woThmChramAmt', dataType: 'number' },
    { fieldName: 'woDlqAddAmt', dataType: 'number' },
    { fieldName: 'woRsgBorAmt', dataType: 'number' },
    { fieldName: 'rentalCstCt', dataType: 'number' },
    { fieldName: 'rentalCntrCt', dataType: 'number' },
    { fieldName: 'rentalObjAmt', dataType: 'number' },
    { fieldName: 'rentalDlqAmt', dataType: 'number' },
    { fieldName: 'rentalThmChramAmt', dataType: 'number' },
    { fieldName: 'rentalDlqAddAmt', dataType: 'number' },
    { fieldName: 'rentalRsgBorAmt', dataType: 'number' },
    { fieldName: 'leaseCstCt', dataType: 'number' },
    { fieldName: 'leaseCntrCt', dataType: 'number' },
    { fieldName: 'leaseObjAmt', dataType: 'number' },
    { fieldName: 'leaseDlqAmt', dataType: 'number' },
    { fieldName: 'leaseThmChramAmt', dataType: 'number' },
    { fieldName: 'leaseDlqAddAmt', dataType: 'number' },
    { fieldName: 'leaseRsgBorAmt', dataType: 'number' },
    { fieldName: 'geMshCstCt', dataType: 'number' },
    { fieldName: 'geMshCntrCt', dataType: 'number' },
    { fieldName: 'geMshObjAmt', dataType: 'number' },
    { fieldName: 'geMshDlqAmt', dataType: 'number' },
    { fieldName: 'geMshThmChramAmt', dataType: 'number' },
    { fieldName: 'geMshDlqAddAmt', dataType: 'number' },
    { fieldName: 'geMshRsgBorAmt', dataType: 'number' },
    { fieldName: 'hcrMshCstCt', dataType: 'number' },
    { fieldName: 'hcrMshCntrCt', dataType: 'number' },
    { fieldName: 'hcrMshObjAmt', dataType: 'number' },
    { fieldName: 'hcrMshDlqAmt', dataType: 'number' },
    { fieldName: 'hcrMshThmChramAmt', dataType: 'number' },
    { fieldName: 'hcrMshDlqAddAmt', dataType: 'number' },
    { fieldName: 'hcrMshRsgBorAmt', dataType: 'number' },
    { fieldName: 'spayCstCt', dataType: 'number' },
    { fieldName: 'spayCntrCt', dataType: 'number' },
    { fieldName: 'spayObjAmt', dataType: 'number' },
    { fieldName: 'spayDlqAmt', dataType: 'number' },
    { fieldName: 'spayThmChramAmt', dataType: 'number' },
    { fieldName: 'spayDlqAddAmt', dataType: 'number' },
    { fieldName: 'spayRsgBorAmt', dataType: 'number' },
    { fieldName: 'rglrSppCstCt', dataType: 'number' },
    { fieldName: 'rglrSppCntrCt', dataType: 'number' },
    { fieldName: 'rglrSppObjAmt', dataType: 'number' },
    { fieldName: 'rglrSppDlqAmt', dataType: 'number' },
    { fieldName: 'rglrSppThmChramAmt', dataType: 'number' },
    { fieldName: 'rglrSppDlqAddAmt', dataType: 'number' },
    { fieldName: 'rglrSppRsgBorAmt', dataType: 'number' },
  ];
  const columns = [
    { fieldName: 'clctamPrtnrKnm', header: t('MSG_TXT_PIC_NM'), width: '98', styleName: 'text-center' },
    { fieldName: 'asnRat', header: t('MSG_TXT_ASN_WEIT'), width: '98', styleName: 'text-right' },

    { fieldName: 'woCstCt', header: t('MSG_TXT_CST_N'), width: '65', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'woCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'woObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'woDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'woThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'woDlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'woRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-center' },

    { fieldName: 'rentalCstCt', header: t('MSG_TXT_CST_N'), width: '65', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'rentalCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'rentalObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'rentalDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '111', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'rentalThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'rentalDlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'rentalRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },

    { fieldName: 'leaseCstCt', header: t('MSG_TXT_CST_N'), width: '65', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'leaseCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'leaseObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'leaseDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'leaseThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'leaseDlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'leaseRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },

    { fieldName: 'geMshCstCt', header: t('MSG_TXT_CST_N'), width: '65', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'geMshCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'geMshObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'geMshDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'geMshThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'geMshDlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'geMshRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },

    { fieldName: 'hcrMshCstCt', header: t('MSG_TXT_CST_N'), width: '65', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'hcrMshCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'hcrMshObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'hcrMshDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'hcrMshThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'hcrMshDlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'hcrMshRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },

    { fieldName: 'spayCstCt', header: t('MSG_TXT_CST_N'), width: '65', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'spayCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'spayObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'spayDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'spayThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'spayDlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'spayRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },

    { fieldName: 'rglrSppCstCt', header: t('MSG_TXT_CST_N'), width: '65', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'rglrSppCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'rglrSppObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'rglrSppDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'rglrSppThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'rglrSppDlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },
    { fieldName: 'rglrSppRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout([
    'clctamPrtnrKnm', 'asnRat',
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
      items: ['geMshCstCt', 'geMshCntrCt', 'geMshObjAmt', 'geMshDlqAmt', 'geMshThmChramAmt', 'geMshDlqAddAmt', 'geMshRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_HCR_MSH'),
      direction: 'horizontal',
      items: ['hcrMshCstCt', 'hcrMshCntrCt', 'hcrMshObjAmt', 'hcrMshDlqAmt', 'hcrMshThmChramAmt', 'hcrMshDlqAddAmt', 'hcrMshRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_SNGL_PMNT'),
      direction: 'horizontal',
      items: ['spayCstCt', 'spayCntrCt', 'spayObjAmt', 'spayDlqAmt', 'spayThmChramAmt', 'spayDlqAddAmt', 'spayRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_REG_DLVR'),
      direction: 'horizontal',
      items: ['rglrSppCstCt', 'rglrSppCntrCt', 'rglrSppObjAmt', 'rglrSppDlqAmt', 'rglrSppThmChramAmt', 'rglrSppDlqAddAmt', 'rglrSppRsgBorAmt'],
    },
  ]);
  view.checkBar.visible = true;
  // TODO: 선택해서 하는게 없음 확정은 조회조건 기준, 배정비중 수정도 팝업 호출 임 이 부분 확인 필요
  view.rowIndicator.visible = true;

  view.onCellDblClicked = async (g, { dataRow }) => {
    // TODO: 명세서 변경 예정 현재는 임시 소스
    searchDetailsParams.value = cloneDeep(searchParams.value);
    const { clctamPrtnrNo } = gridUtil.getRowValue(g, dataRow);
    searchDetailsParams.value.clctamPrtnrNo = clctamPrtnrNo;
    fetchDetailsData();
  };
});
const initGrdSub = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'bndCntrId' },
    { fieldName: 'baseYm' },
    { fieldName: 'bzHdqDvCd' },
    { fieldName: 'cntrSn' },
    { fieldName: 'clctamPrtnrNo' },
    { fieldName: 'clctamPrtnrKnm' },
    { fieldName: 'lstmmClctamDvCd' },
    { fieldName: 'bfClctamPrtnrNo' },
    { fieldName: 'bfClctamPrtnrKnm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cstNm' },
    { fieldName: 'cstNo' },
    { fieldName: 'pdDvKnm' },
    { fieldName: 'pdDvCd' },
    { fieldName: 'dlqMcn' },
    { fieldName: 'objAmt', dataType: 'number' },
    { fieldName: 'dlqAmt', dataType: 'number' },
    { fieldName: 'thmChramAmt', dataType: 'number' },
    { fieldName: 'dlqAddDpAmt', dataType: 'number' },
    { fieldName: 'rsgBorAmt', dataType: 'number' },
    { fieldName: 'lwmTpCd' },
    { fieldName: 'cujNm' },
    { fieldName: 'indno' },
    { fieldName: 'lwmDtlTpCd' },
    { fieldName: 'lwmDt' },
    { fieldName: 'dfltDt' },
    { fieldName: 'addr' },
    { fieldName: 'clctamDvCd' },
    { fieldName: 'changeClctamPrtnrKnm' }, // 항목 수정여부 해당 값이 true라면 저장 할 수 없음
  ];
  const columns = [
    { fieldName: 'clctamPrtnrKnm',
      header: t('MSG_TXT_PIC_NM'),
      width: '98',
      styleName: 'text-center, rg-button-icon--search',
      button: 'action',
      buttonVisibleCallback() {
        return (cachedParams.baseYm === defaultDate && isCollectionManager);
      },
    },
    { fieldName: 'lstmmClctamDvCd', header: t('MSG_TXT_LSTMM_ICHR_CLCTAM_DV'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'bfClctamPrtnrKnm', header: t('MSG_TXT_LSTMM_PSIC'), width: '90', styleName: 'text-center', editable: false },
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '160',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      } },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), width: '90', styleName: 'text-center', editable: false },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'pdDvKnm', header: t('MSG_TXT_PRDT_GUBUN'), width: '90', styleName: 'text-center', editable: false },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '86', styleName: 'text-right', editable: false },
    { fieldName: 'objAmt', header: t('MSG_TXT_THM_OJ'), width: '110', numberFormat: '#,##0', styleName: 'text-right', editable: false },
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right', editable: false },
    { fieldName: 'thmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', numberFormat: '#,##0', styleName: 'text-right', editable: false },
    { fieldName: 'dlqAddDpAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '116', numberFormat: '#,##0', styleName: 'text-right', editable: false },
    { fieldName: 'rsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', numberFormat: '#,##0', styleName: 'text-right', editable: false },
    { fieldName: 'cujNm', header: t('MSG_TXT_CUJ_NM'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'indno', header: t('MSG_TXT_IND_NO'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'lwmTpCd', header: t('MSG_TXT_LWM_TP'), options: codes.LWM_TP_CD, width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'lwmDtlTpCd', header: t('MSG_TXT_LWM_DTL'), options: codes.LWM_DTL_TP_CD, width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'lwmDt', header: t('MSG_TXT_LWM_DT'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'dfltDt', header: t('MSG_TXT_DE_RGST_DT'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'addr', header: t('MSG_TXT_ADDR'), width: '200', styleName: 'text-left', editable: false },
    { fieldName: 'clctamDvCd', visible: false },
    { fieldName: 'changeClctamPrtnrKnm', default: 'N', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setHeaderSummaries({
    visible: true,
    items: [{ height: 42 }],
  });
  view.layoutByColumn('clctamPrtnrKnm').summaryUserSpans = { colspan: 8 };
  view.layoutByColumn('lwmDtlTpCd').summaryUserSpans = { colspan: 4 };

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = isCollectionManager;

  view.onCellButtonClicked = async (grid, { dataRow, column }) => {
    if (column === 'clctamPrtnrKnm') {
      const { result, payload } = await modal({
        component: 'ZwbnyCollectorListP',
        componentProps: {
          clctamPrtnrNm: '',
        },
      });
      if (result) {
        const { prtnrNo, prtnrKnm } = payload;
        data.setValue(dataRow, 'clctamPrtnrNo', prtnrNo);
        data.setValue(dataRow, 'clctamPrtnrKnm', prtnrKnm);
        data.setValue(dataRow, 'changeClctamPrtnrKnm', 'N');
      }
    }
  };
  view.onCellEdited = (grid, itemIndex) => {
    const { fieldName } = grid.getCurrent();
    if (fieldName === 'clctamPrtnrKnm') {
      grid.setValue(itemIndex, 'changeClctamPrtnrKnm', 'Y');
    }
  };
  // TODO: 정리 필요한 소스는 정리(결함건이라 정리 하지 않고 구현만 되게 작업 정리 필요)
  view.onKeyDown = async (grid, event) => {
    const current = view.getCurrent();
    const dataProvider = view.getDataSource();
    const currentColumn = current.column;
    let currentValue = '';
    const key = event.key || event.keyCode;
    if (currentColumn === 'clctamPrtnrKnm' && (key === 'Enter' || key === 13)) {
      grid.commit();
      currentValue = dataProvider.getValue(current.dataRow, 'clctamPrtnrKnm');
    }
    if (currentColumn === 'clctamPrtnrKnm' && (key === 'Enter' || key === 13)) {
      const res = await dataService.get('/sms/common/bond/now-collectors', { params: { prtnrKnm: currentValue, bzHdqDvCd: searchParams.value.bzHdqDvCd, clctamDvCd: searchParams.value.clctamDvCd, clctamMngtYn: 'Y' } });
      const partners = res.data;
      if (partners.length > 1) {
        const { result, payload } = await modal({
          component: 'ZwbnyCollectorListP',
          componentProps: {
            clctamPrtnrNm: currentValue,
          },
        });
        if (result) {
          const { prtnrNo } = payload;
          grid.setValue(current.itemIndex, 'clctamPrtnrNo', prtnrNo);
        }
      } else if (partners.length !== 0) {
        grid.setValue(current.itemIndex, 'clctamPrtnrNo', partners[0].prtnrNo);
        grid.setValue(current.itemIndex, 'changeClctamPrtnrKnm', 'N');
      } else {
        grid.setValue(current.itemIndex, 'changeClctamPrtnrKnm', 'Y');
        notify(t('MSG_ALT_NO_INFO_SRCH')); // TODO: 메시지 정의 되지 않음 이런 부분 한번에 설계 요청 후 갱신 예정
      }
    }
  };
});
</script>
