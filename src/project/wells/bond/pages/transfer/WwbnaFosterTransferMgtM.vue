<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNA
2. 프로그램 ID : WwbnaFosterTransferMgtM ( W-BN-U-0130M01 )- 위탁 이관 관리
3. 작성자 : gilyong.han
4. 작성일 : 2023.05.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 채권 속성 중 "위탁이관(아웃소싱)" 대상 채권을 조회하여 추심사에 채권 데이터를 발송하는 업무를 처리한다.
****************************************************************************************************
---->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      :modified-targets="['grdResult','grdDetail']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_DIV2')">
          <kw-select
            v-model="searchParams.bzHdqDvCd"
            :options="codes.BZ_HDQ_DV_CD"
            disable
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CLCTAM_DV')"
          required
        >
          <kw-select
            v-model="searchParams.clctamDvCd"
            first-option="select"
            rules="required"
            :options="clctamDvOpt"
            :label="t('MSG_TXT_CLCTAM_DV')"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_NW_DV')">
          <kw-select
            v-model="searchParams.bndNwDvCd"
            :options="codes.BND_NW_DV_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_CST_NM')"
        >
          <kw-input
            v-model="searchParams.cstNm"
            icon="search"
            clearable
            maxlength="30"
            @click-icon="onClickCustomer"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CST_NO')"
        >
          <kw-input
            v-model="searchParams.cstNo"
            icon="search"
            clearable
            regex="num"
            :maxlength="10"
            @click-icon="onClickCustomer"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_MPNO')"
        >
          <kw-input
            v-model:telNo0="searchParams.cralLocaraTno"
            v-model:telNo1="searchParams.mexnoEncr"
            v-model:telNo2="searchParams.cralIdvTno"
            mask="telephone"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <h3>
        {{ t('MSG_TXT_AGRG_RS') }}
      </h3>

      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>

        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload('result')"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:update
          :label="$t('MSG_BTN_BND_PRP_CH')"
          primary
          dense
          @click="onClickChangeView"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:update
          :label="$t('MSG_BTN_CONF')"
          primary
          dense
          :disable="isNotActivated"
          @click="onClickConfirm"
        />
      </kw-action-top>

      <kw-grid
        ref="grdResultRef"
        :visible-rows="5"
        name="grdResult"
        @init="initGridResult"
      />
      <h3>
        {{ t('MSG_TXT_AGRG_RS_DTL') }}
      </h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageDetailInfo.pageIndex"
            v-model:page-size="pageDetailInfo.pageSize"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageDetailInfo.totalCount"
            @change="onChangeDetailPageInfo"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          v-permission:update
          :label="$t('MSG_TXT_SAVE')"
          grid-action
          :disable="(cachedParams?.baseYm !== now.format('YYYYMM')) || pageDetailInfo.totalCount === 0"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:update
          icon="upload_on"
          secondary
          dense
          :label="$t('MSG_BTN_EXCEL_UP')"
          :disable="(cachedParams?.baseYm !== now.format('YYYYMM')) || pageDetailInfo.totalCount === 0"
          @click="onClickExcelUpload"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageDetailInfo.totalCount === 0"
          @click="onClickExcelDownload('detail')"
        />
      </kw-action-top>
      <kw-grid
        ref="grdDetailRef"
        :page-size="pageDetailInfo.pageSize"
        :total-count="pageDetailInfo.totalCount"
        name="grdDetail"
        @init="initGridDetail"
      />

      <kw-pagination
        v-model:page-index="pageDetailInfo.pageIndex"
        v-model:page-size="pageDetailInfo.pageSize"
        :total-count="pageDetailInfo.totalCount"
        @change="onChangeDetailPageInfo"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, gridUtil, defineGrid, useMeta, codeUtil, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const router = useRouter();
const { modal, notify, alert } = useGlobal();
const { t } = useI18n();
const { getters } = useStore();
const { getConfig } = useMeta();

const grdResultRef = ref(getComponentType('kw-grid'));
const grdDetailRef = ref(getComponentType('kw-grid'));
const isNotActivated = ref(false);
const pageDetailInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const totalCount = ref(0);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/bond/foster-transfers';
const codes = await codeUtil.getMultiCodes(
  'BZ_HDQ_DV_CD',
  'CLCO_CD',
  'CLCTAM_DV_CD',
  'BND_NW_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'LWM_TP_CD',
  'LWM_DTL_TP_CD',
  'BND_BIZ_DV_CD',
);
const clctamDvOpt = codes.CLCTAM_DV_CD?.filter((v) => ['09', '11']?.includes(v.codeId));
const now = dayjs();
const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  bzHdqDvCd: '',
  clctamDvCd: '',
  bndNwDvCd: '',
  cstNm: '',
  cstNo: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
});
const searchDatail = ref({
  clctamPrtnrNo: '',
});

const { tenantId } = getters['meta/getUserInfo'];
watch(() => tenantId, (val) => {
  if (val === 'TNT_EDU') {
    searchParams.value.bzHdqDvCd = '10';
  }
  if (val === 'TNT_WELLS') {
    searchParams.value.bzHdqDvCd = '20';
  }
}, { immediate: true });

let cachedParams;
async function fetchData() {
  const { data } = await dataService.get(baseUrl, { params: { ...cachedParams } });
  totalCount.value = data?.length;

  const view = grdResultRef.value.getView();
  const detailView = grdDetailRef.value.getView();

  detailView.getDataSource().setRows(null);
  // detailView.resetCurrent();
  pageDetailInfo.value.totalCount = 0;
  pageDetailInfo.value.pageIndex = 1;
  pageDetailInfo.value.pageSize = Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE'));

  view.getDataSource().setRows(data);
  // view.resetCurrent();
}

async function fetchSummaryData() {
  const res = await dataService.get(`${baseUrl}/detail/summary`, { params: { ...cachedParams, ...searchDatail.value } });
  const view = grdDetailRef.value.getView();

  view.columnByName('trgAmt').headerSummary.text = res.data.trgAmt;
  view.columnByName('dlqAmt').headerSummary.text = res.data.dlqAmt;
  view.columnByName('thmChramAmt').headerSummary.text = res.data.thmChramAmt;
  view.columnByName('dlqAddAmt').headerSummary.text = res.data.dlqAddAmt;
  view.columnByName('rsgBorAmt').headerSummary.text = res.data.rsgBorAmt;
}

async function fetchDetailData() {
  const res = await dataService.get(`${baseUrl}/detail/paging`, { params: { ...cachedParams, ...searchDatail.value, ...pageDetailInfo.value } });
  const { list: data, pageInfo: pagingResult } = res.data;
  pageDetailInfo.value = pagingResult;

  await fetchSummaryData();

  const view = grdDetailRef.value.getView();

  view.getDataSource().setRows(data);
  // view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageDetailInfo);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onChangeDetailPageInfo() {
  if (!isEmpty(cachedParams)) {
    await fetchDetailData();
  }
}

const onClickCustomer = async () => {
  const { result, payload } = await modal({
    component: 'ZwbnyDelinquentCustomerP',
    componentProps: {
      baseYm: searchParams.value.baseYm,
      cstNm: searchParams.value.cstNm,
      bndClctnPrpDvCd: '03',
    },
  });
  if (result) {
    searchParams.value.cstNm = payload.cstNm;
    searchParams.value.cstNo = payload.cstNo;
  }
};

// 엑셀다운로드
const { currentRoute } = useRouter();
let excelView;
let downFileName;
let nowDate;
async function onClickExcelDownload(gridType) {
  const { pageId, menuName } = currentRoute.value.meta;
  if (gridType === 'result') {
    excelView = grdResultRef.value.getView();

    await gridUtil.exportView(excelView, {
      fileName: `${menuName}_${t('MSG_TXT_AGRG_RS')}`,
      timePostfix: true,
      exportData: gridUtil.getAllRowValues(excelView),
    });
  }
  if (gridType === 'detail') {
    excelView = grdDetailRef.value.getView();
    nowDate = dayjs().format('YYYYMMDDHHmmss');
    downFileName = `${menuName}_${t('MSG_TXT_AGRG_RS_DTL')}_${nowDate}`;
    const res = await dataService.get(`${baseUrl}/detail/excel-download`, { params: { ...cachedParams, ...searchDatail.value, downFileName, pageId } });

    await gridUtil.exportView(excelView, {
      fileName: `${menuName}_${t('MSG_TXT_AGRG_RS_DTL')}`,
      timePostfix: true,
      exportData: res.data,
    });
  }
}

// 채권속성변경
const onClickChangeView = async () => {
  await router.push({ path: '/bond/zwbna-bond-property-mgt', query: {} });
};

// 확정
const onClickConfirm = async () => {
  const view = grdDetailRef.value.getView();
  const dataRows = gridUtil.getAllRowValues(view);
  if (dataRows.length === 0) {
    notify(t('MSG_ALT_NO_SRCH_DATA'));
  } else if (cachedParams.baseYm !== now.format('YYYYMM')) {
    notify(t('MSG_ALT_THM_DTA_SEND_ONLY'));
  } else {
    await dataService.post(`${baseUrl}/confirm`, cachedParams);
    await alert(t('MSG_ALT_FOSTER_SEND_SUCCESS'));
  }
};

// 저장
const onClickSave = async () => {
  const view = grdDetailRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);

  await dataService.put(baseUrl, changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
};

// 엑셀 업로드
const onClickExcelUpload = async () => {
  const apiUrl = `${baseUrl}/excel-upload`;
  const extraData = {
    baseYm: cachedParams.baseYm,
    bzHdqDvCd: cachedParams.bzHdqDvCd,
    clctamDvCd: cachedParams.clctamDvCd,
    pageId: currentRoute.value.meta.pageId,
  };
  const templateId = 'FOM_BND_FSTR_TF';

  const {
    payload,
  } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: {
      apiUrl,
      templateId,
      extraData,
    },
  });
  if (payload.status === 'S') {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
};

watch(() => searchParams.value.baseYm, async (baseYm) => {
  if (baseYm !== now.format('YYYYMM')) {
    isNotActivated.value = true;
  } else {
    isNotActivated.value = false;
  }
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridResult = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'bzHdqDvCd', header: t('MSG_TXT_DIV2'), width: '75', styleName: 'text-center', headerSummaries: { text: t('MSG_TXT_TOT_SUMMARY'), styleName: 'text-center' }, options: codes.BZ_HDQ_DV_CD },
    { fieldName: 'clctamPrtnrNm', header: t('MSG_TXT_PIC_NM'), width: '98', styleName: 'text-center !important, rg-button-link', renderer: { type: 'button' } },

    { fieldName: 'woCstCt', header: t('MSG_TXT_CST_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    { fieldName: 'woCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    { fieldName: 'woObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'woDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'woThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'woDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'woRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },

    { fieldName: 'rentalCstCt', header: t('MSG_TXT_CST_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    { fieldName: 'rentalCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    { fieldName: 'rentalObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rentalDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rentalThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rentalDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rentalRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },

    { fieldName: 'leaseCstCt', header: t('MSG_TXT_CST_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    { fieldName: 'leaseCntrCt', header: t('MSG_TXT_CNTR_N'), dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    { fieldName: 'leaseObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'leaseDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'leaseThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'leaseDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'leaseRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },

    { fieldName: 'mshCstCt', header: t('MSG_TXT_CST_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    { fieldName: 'mshCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    { fieldName: 'mshObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'mshDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'mshThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'mshDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'mshRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },

    { fieldName: 'rglrSppCstCt', header: t('MSG_TXT_CST_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    { fieldName: 'rglrSppCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    { fieldName: 'rglrSppObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rglrSppDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rglrSppThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rglrSppDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'rglrSppRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },

    { fieldName: 'hcrCstCt', header: t('MSG_TXT_CST_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    { fieldName: 'hcrCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    { fieldName: 'hcrObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'hcrDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'hcrThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'hcrDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'hcrRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },

    { fieldName: 'spayCstCt', header: t('MSG_TXT_CST_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    { fieldName: 'spayCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    { fieldName: 'spayObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'spayDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'spayThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'spayDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    { fieldName: 'spayRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push(
    { fieldName: 'baseYm' },
    { fieldName: 'clctamPrtnrNo' },
    { fieldName: 'fnlMdfcDtm' },
  );
  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout([
    'bzHdqDvCd',
    'clctamPrtnrNm',
    // single
    {
      header: t('MSG_TIT_TOT'), // colspan title
      direction: 'horizontal', // merge type
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
      items: ['spayCstCt', 'spayCntrCt', 'spayObjAmt', 'spayDlqAmt', 'spayThmChramAmt', 'spayDlqAddAmt', 'spayRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_SNGL_PMNT'),
      direction: 'horizontal',
      items: ['rglrSppCstCt', 'rglrSppCntrCt', 'rglrSppObjAmt', 'rglrSppDlqAmt', 'rglrSppThmChramAmt', 'rglrSppDlqAddAmt', 'rglrSppRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_REG_DLVR'),
      direction: 'horizontal',
      items: ['hcrCstCt', 'hcrCntrCt', 'hcrObjAmt', 'hcrDlqAmt', 'hcrThmChramAmt', 'hcrDlqAddAmt', 'hcrRsgBorAmt'],
    },
  ]);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setHeaderSummaries({
    visible: true,
    items: [{ height: 42 }],
  });
  view.layoutByColumn('bzHdqDvCd').summaryUserSpans = [{ colspan: 2 }];

  view.onCellItemClicked = async (grid, { column, itemIndex }) => {
    if (column === 'clctamPrtnrNm') {
      const { clctamPrtnrNo } = grid.getValues(itemIndex);
      searchDatail.value.clctamPrtnrNo = clctamPrtnrNo;
      onChangeDetailPageInfo();
    }
  };
});

const initGridDetail = ((data, view) => {
  const columns = [
    { fieldName: 'fstrCoNm', header: t('MSG_TXT_FSTRCM'), styleName: 'text-center', width: '98', headerSummaries: { text: t('MSG_TXT_SUM'), styleName: 'text-center' }, options: codes.CLCO_CD },
    { fieldName: 'clctamPrtnrNm',
      header: t('MSG_TXT_PIC_NM'),
      width: '98',
      styleName: 'text-center !important, rg-button-icon--search',
      button: 'action',
      rules: 'required',
      editor: {
        type: 'line',
        maxLength: 20,
      },
      editable: true },
    { fieldName: 'clctamDvd', header: t('MSG_TXT_JBF_ICHR_CLCTAM_DV'), styleName: 'text-center', width: '130' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_JBF_PSIC'), styleName: 'text-center', width: '90' },
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_NO'),
      width: '160',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      } },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), width: '90', styleName: 'text-center' },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '130', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_GUBUN'), width: '90', styleName: 'text-center', options: codes.BND_BIZ_DV_CD },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '86', styleName: 'text-center' },
    { fieldName: 'trgAmt', header: t('MSG_TXT_THM_OJ'), width: '110', styleName: 'text-right', dataType: 'number', headerSummaries: { numberFormat: '#,##0' }, numberFormat: '#,##0' },
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right', dataType: 'number', headerSummaries: { numberFormat: '#,##0' }, numberFormat: '#,##0' },
    { fieldName: 'thmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', styleName: 'text-right', dataType: 'number', headerSummaries: { numberFormat: '#,##0' }, numberFormat: '#,##0' },
    { fieldName: 'dlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', styleName: 'text-right', dataType: 'number', headerSummaries: { numberFormat: '#,##0' }, numberFormat: '#,##0' },
    { fieldName: 'rsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right', dataType: 'number', headerSummaries: { numberFormat: '#,##0' }, numberFormat: '#,##0' },
    { fieldName: 'lwmTp', header: t('MSG_TXT_LWM_TP'), width: '110', styleName: 'text-center' },
    { fieldName: 'lwmDtlTpCd', header: t('MSG_TXT_LWM_DTL'), width: '110', styleName: 'text-center' },
    { fieldName: 'lwmDt', header: t('MSG_TXT_LWM_DT'), width: '110', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'dfltDt', header: t('MSG_TXT_DE_RGST_DT'), width: '110', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'addr', header: t('MSG_TXT_ADDR'), width: '200' },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push(
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'clctamPrtnrNo' },
  );
  data.setFields(fields);
  view.setColumns(columns);

  view.setHeaderSummaries({
    visible: true,
    items: [{ height: 42 }],
  });
  view.layoutByColumn('fstrCoNm').summaryUserSpans = [{ colspan: 9 }];

  view.rowIndicator.visible = true;
  view.checkBar.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onCellButtonClicked = async (grid, { dataRow, column, itemIndex }) => {
    if (column === 'clctamPrtnrNm') {
      const { clctamPrtnrNm } = grid.getValues(itemIndex);
      const { result, payload } = await modal({
        component: 'ZwbnyCollectorListP',
        componentProps: {
          clctamPrtnrNm,
        },
      });
      if (result) {
        console.log(payload);
        const { prtnrNo, prtnrKnm, clctamDvCd } = payload;
        if (cachedParams.clctamDvCd !== clctamDvCd) {
          await alert(t('MSG_ALT_CNTR_CLCTAM_DV_PSIC_FIT')); // 해당 계약의 집금구분과 맞는 담당자를 선택해 주세요.
          data.setValue(dataRow, 'clctamPrtnrNm', '');
          data.setValue(dataRow, 'clctamPrtnrNo', '');
          return false;
        }
        data.setValue(dataRow, 'clctamPrtnrNo', prtnrNo);
        data.setValue(dataRow, 'clctamPrtnrNm', prtnrKnm);
      }
    }
  };

  view.onValidate = async (g, index) => {
    if (index.column === 'clctamPrtnrNm') {
      const { clctamPrtnrNo } = g.getValues(index.itemIndex);
      if (!clctamPrtnrNo) {
        return t('MSG_ALT_PLZ_USE_CLCTAM_PSIC_POPUP'); // 집금담당자 팝업을 이용해 주세요.
      }
    }
  };
});

</script>
