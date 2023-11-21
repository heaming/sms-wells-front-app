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
        <!-- 기준년월 -->
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
        <!-- 사업부 -->
        <kw-search-item :label="t('MSG_TXT_DIV2')">
          <kw-select
            v-model="searchParams.bzHdqDvCd"
            :options="codes.BZ_HDQ_DV_CD"
            disable
          />
        </kw-search-item>
        <!-- 집금구분 -->
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
        <!-- 신규구분 -->
        <kw-search-item :label="t('MSG_TXT_NW_DV')">
          <kw-select
            v-model="searchParams.bndNwDvCd"
            :options="filteredCodes.BND_NW_DV_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 고객명 -->
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
        <!-- 고객번호 -->
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
        <!-- 휴대전화번호 -->
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
      <!-- 집계 결과 -->
      <h3>
        {{ t('MSG_TXT_AGRG_RS') }}
      </h3>

      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
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
        <!-- 채권속성변경 -->
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
        <!-- 확정 -->
        <kw-btn
          v-permission:update
          :label="$t('MSG_BTN_CONF')"
          primary
          dense
          :disable="isNotActivated
            || totalCount === 0"
          @click="onClickConfirm"
        />
      </kw-action-top>

      <kw-grid
        ref="grdResultRef"
        :visible-rows="5"
        name="grdResult"
        @init="initGridResult"
      />
      <!-- 집계 결과 상세 -->
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
        <!-- 저장 -->
        <kw-btn
          v-permission:update
          :label="$t('MSG_TXT_SAVE')"
          grid-action
          :disable="(cachedParams?.baseYm !== now.format('YYYYMM'))
            || pageDetailInfo.totalCount === 0"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 엑셀 업로드 -->
        <kw-btn
          v-permission:update
          icon="upload_on"
          secondary
          dense
          :label="$t('MSG_BTN_EXCEL_UP')"
          :disable="(cachedParams?.baseYm !== now.format('YYYYMM'))
            || pageDetailInfo.totalCount === 0"
          @click="onClickExcelUpload"
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
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
  'BZ_HDQ_DV_CD', // 사업본부구분코드
  'CLCO_CD', // 추심사코드
  'CLCTAM_DV_CD', // 집금구분코드
  'BND_NW_DV_CD', // 채권신규구분코드
  'COD_PAGE_SIZE_OPTIONS',
  'LWM_TP_CD', // 법조치유형코드
  'LWM_DTL_TP_CD', // 법조치상세유형코드
  'BND_BIZ_DV_CD', // 채권업무구분코드
);
const filteredCodes = ref({ BND_NW_DV_CD: codes.BND_NW_DV_CD.filter((obj) => (obj.codeId !== '01')) });
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

// 집계 결과 조회
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
}

// 집계 결과 상세 조회
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

// 고객팝업 오픈
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

// 현재년월 제외 수정 불가
watch(() => cachedParams?.baseYm, async (baseYm) => {
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
    // 사업부
    { fieldName: 'bzHdqDvCd', header: t('MSG_TXT_DIV2'), width: '75', styleName: 'text-center', headerSummaries: { text: t('MSG_TXT_TOT_SUMMARY'), styleName: 'text-center' }, options: codes.BZ_HDQ_DV_CD },
    // 담당자명
    { fieldName: 'clctamPrtnrNm', header: t('MSG_TXT_PIC_NM'), width: '98', styleName: 'text-center' },

    // 전체 - 고객수
    { fieldName: 'woCstCt', header: t('MSG_TXT_CST_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    // 전체 - 계약수
    { fieldName: 'woCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    // 전체 - 당월대상
    { fieldName: 'woObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 전체 - 연체금액
    { fieldName: 'woDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 전체 - 당월요금
    { fieldName: 'woThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 전체 - 연체가산금액
    { fieldName: 'woDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 전체 - 위약금액
    { fieldName: 'woRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },

    // 렌탈 - 고객수
    { fieldName: 'rentalCstCt', header: t('MSG_TXT_CST_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    // 렌탈 - 계약수
    { fieldName: 'rentalCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    // 렌탈 - 당월대상
    { fieldName: 'rentalObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 렌탈 - 연체금액
    { fieldName: 'rentalDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 렌탈 - 당월요금
    { fieldName: 'rentalThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 렌탈 - 연체가산금액
    { fieldName: 'rentalDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 렌탈 - 위약금액
    { fieldName: 'rentalRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },

    // 금융리스 - 고객수
    { fieldName: 'leaseCstCt', header: t('MSG_TXT_CST_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    // 금융리스 - 계약수
    { fieldName: 'leaseCntrCt', header: t('MSG_TXT_CNTR_N'), dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    // 금융리스 - 당월대상
    { fieldName: 'leaseObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 금융리스 - 연체금액
    { fieldName: 'leaseDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 금융리스 - 당월요금
    { fieldName: 'leaseThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 금융리스 - 연체가산금액
    { fieldName: 'leaseDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 금융리스 - 위약금액
    { fieldName: 'leaseRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },

    // 일반멤버십 - 고객수
    { fieldName: 'mshCstCt', header: t('MSG_TXT_CST_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    // 일반멤버십 - 계약수
    { fieldName: 'mshCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    // 일반멤버십 - 당월대상
    { fieldName: 'mshObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 일반멤버십 - 연체금액
    { fieldName: 'mshDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 일반멤버십 - 당월요금
    { fieldName: 'mshThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 일반멤버십 - 연체가산금액
    { fieldName: 'mshDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 일반멤버십 - 위약금액
    { fieldName: 'mshRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },

    // 홈케어멤버십 - 고객수
    { fieldName: 'rglrSppCstCt', header: t('MSG_TXT_CST_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    // 홈케어멤버십 - 계약수
    { fieldName: 'rglrSppCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    // 홈케어멤버십 - 당월대상
    { fieldName: 'rglrSppObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 홈케어멤버십 - 연체금액
    { fieldName: 'rglrSppDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 홈케어멤버십 - 당월요금
    { fieldName: 'rglrSppThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 홈케어멤버십 - 연체가산금액
    { fieldName: 'rglrSppDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 홈케어멤버십 - 위약금액
    { fieldName: 'rglrSppRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },

    // 일시불 - 고객수
    { fieldName: 'hcrCstCt', header: t('MSG_TXT_CST_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    // 일시불 - 계약수
    { fieldName: 'hcrCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    // 일시불 - 당월대상
    { fieldName: 'hcrObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 일시불 - 연체금액
    { fieldName: 'hcrDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 일시불 - 당월요금
    { fieldName: 'hcrThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 일시불 - 연체가산금액
    { fieldName: 'hcrDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 일시불 - 위약금액
    { fieldName: 'hcrRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },

    // 정기배송 - 고객수
    { fieldName: 'spayCstCt', header: t('MSG_TXT_CST_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    // 정기배송 - 계약수
    { fieldName: 'spayCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' }, styleName: 'text-right' },
    // 정기배송 - 당월대상
    { fieldName: 'spayObjAmt', header: t('MSG_TXT_THM_OJ'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 정기배송 - 연체금액
    { fieldName: 'spayDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 정기배송 - 당월요금
    { fieldName: 'spayThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 정기배송 - 연체가산금액
    { fieldName: 'spayDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },
    // 정기배송 - 위약금액
    { fieldName: 'spayRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', dataType: 'number', numberFormat: '#,##0', headerSummary: { expression: 'sum', numberFormat: '#,##0' }, styleName: 'text-right' },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push(
    // 기준년월
    { fieldName: 'baseYm' },
    // 집금담당자번호
    { fieldName: 'clctamPrtnrNo' },
    // 최종수정일시
    { fieldName: 'fnlMdfcDtm' },
  );
  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout([
    'bzHdqDvCd',
    'clctamPrtnrNm',
    // single
    {
      header: t('MSG_TXT_ALL'), // colspan title
      direction: 'horizontal', // merge type
      items: ['woCstCt', 'woCntrCt', 'woObjAmt', 'woDlqAmt', 'woThmChramAmt', 'woDlqAddAmt', 'woRsgBorAmt'],
    }, // 전체
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

  // 셀 클릭 시 집계 결과 상세 function 호출
  view.onCellClicked = (grid, { cellType, itemIndex }) => {
    if (cellType === 'data' || cellType === 'indicator') {
      const { clctamPrtnrNo } = grid.getValues(itemIndex);
      searchDatail.value.clctamPrtnrNo = clctamPrtnrNo;
      onChangeDetailPageInfo();
    }
  };
});

const initGridDetail = ((data, view) => {
  const columns = [
    // 위탁사
    { fieldName: 'fstrCoNm', header: t('MSG_TXT_FSTRCM'), styleName: 'text-center', width: '98', headerSummaries: { text: t('MSG_TXT_SUM'), styleName: 'text-center' }, options: codes.CLCO_CD },
    // 담당자명
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
      buttonVisibleCallback: () => { if (cachedParams?.baseYm === dayjs().format('YYYYMM')) { return true; } } },
    // 직전담당집금구분
    { fieldName: 'clctamDvd', header: t('MSG_TXT_JBF_ICHR_CLCTAM_DV'), styleName: 'text-center', width: '130' },
    // 직전담당자
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_JBF_PSIC'), styleName: 'text-center', width: '90' },
    // 계약번호
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_NO'),
      width: '160',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      } },
    // 고객명
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), width: '90', styleName: 'text-center' },
    // 고객번호
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '130', styleName: 'text-center' },
    // 상품구분
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_GUBUN'), width: '90', styleName: 'text-center', options: codes.BND_BIZ_DV_CD },
    // 연체개월
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '86', styleName: 'text-center' },
    // 당월대상
    { fieldName: 'trgAmt', header: t('MSG_TXT_THM_OJ'), width: '110', styleName: 'text-right', dataType: 'number', headerSummaries: { numberFormat: '#,##0' }, numberFormat: '#,##0' },
    // 연체금액
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right', dataType: 'number', headerSummaries: { numberFormat: '#,##0' }, numberFormat: '#,##0' },
    // 당월요금
    { fieldName: 'thmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', styleName: 'text-right', dataType: 'number', headerSummaries: { numberFormat: '#,##0' }, numberFormat: '#,##0' },
    // 연체가산금액
    { fieldName: 'dlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', styleName: 'text-right', dataType: 'number', headerSummaries: { numberFormat: '#,##0' }, numberFormat: '#,##0' },
    // 위약금액
    { fieldName: 'rsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right', dataType: 'number', headerSummaries: { numberFormat: '#,##0' }, numberFormat: '#,##0' },
    // 법조치유형
    { fieldName: 'lwmTp', header: t('MSG_TXT_LWM_TP'), width: '110', styleName: 'text-center' },
    // 법조치상세
    { fieldName: 'lwmDtlTpCd', header: t('MSG_TXT_LWM_DTL'), width: '110', styleName: 'text-center' },
    // 법조치일자
    { fieldName: 'lwmDt', header: t('MSG_TXT_LWM_DT'), width: '110', styleName: 'text-center', datetimeFormat: 'date' },
    // 채불등록일자
    { fieldName: 'dfltDt', header: t('MSG_TXT_DE_RGST_DT'), width: '110', styleName: 'text-center', datetimeFormat: 'date' },
    // 주소
    { fieldName: 'addr', header: t('MSG_TXT_ADDR'), width: '200' },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push(
    // 계약번호
    { fieldName: 'cntrNo' },
    // 계약일련번호
    { fieldName: 'cntrSn' },
    // 집금담당자번호
    { fieldName: 'clctamPrtnrNo' },
    // 기준년월
    { fieldName: 'baseYm' },
    // 집금구분코드
    { fieldName: 'clctamDvCd' },
    // 최종수정일시
    { fieldName: 'fnlMdfcDtm' },
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
  view.editOptions.editable = true;

  // 집금담당자 팝업 오픈
  view.onCellButtonClicked = async (grid, { dataRow, column, itemIndex }) => {
    if (column === 'clctamPrtnrNm') {
      const { clctamPrtnrNm } = grid.getValues(itemIndex);
      const { result, payload } = await modal({
        component: 'ZwbnyCollectorListP',
        componentProps: {
          clctamPrtnrNm,
          is1RowClose: false,
        },
      });
      if (result) {
        const { prtnrNo, prtnrKnm, clctamDvCd } = payload;
        if (cachedParams.clctamDvCd !== clctamDvCd && !isEmpty(prtnrNo)) {
          await alert(t('MSG_ALT_CNTR_CLCTAM_DV_PSIC_FIT')); // 해당 계약의 집금구분과 맞는 담당자를 선택해 주세요.
          return false;
        }
        data.setValue(dataRow, 'clctamPrtnrNo', prtnrNo);
        data.setValue(dataRow, 'clctamPrtnrNm', prtnrKnm);
      }
    }
  };

  // 저장 시 validate
  view.onValidate = async (g, index) => {
    if (index.column === 'clctamPrtnrNm') {
      const { clctamPrtnrNo } = g.getValues(index.itemIndex);
      if (!clctamPrtnrNo) {
        return t('MSG_ALT_PLZ_USE_CLCTAM_PSIC_POPUP'); // 집금담당자 팝업을 이용해 주세요.
      }
    }
  };

  // 현재년월 제외 수정 불가
  view.onCellEditable = (grid, index) => {
    if (cachedParams?.baseYm === dayjs().format('YYYYMM') && ['clctamPrtnrNm'].includes(index.column)) {
      return true;
    }
    return false;
  };

  view.onEditCommit = async (grid, index, oldValue, newValue) => {
    if (index.column === 'clctamPrtnrNm' && oldValue !== newValue) {
      grid.setValue(index.itemIndex, 'clctamPrtnrNo', '');
    }
  };

  // 집금담당자 enter 키 => 팝업 open
  view.onKeyDown = async (grid, event) => {
    const current = view.getCurrent();
    const dataProvider = view.getDataSource();
    const currentColumn = current.column;
    let currentValue = '';
    const key = event.key || event.keyCode;
    if (currentColumn === 'clctamPrtnrNm' && (key === 'Enter' || key === 13)) {
      grid.commit();
      currentValue = dataProvider.getValue(current.dataRow, 'clctamPrtnrNm');
    }
    if (currentColumn === 'clctamPrtnrNm' && (key === 'Enter' || key === 13)) {
      const { result, payload } = await modal({
        component: 'ZwbnyCollectorListP',
        componentProps: {
          clctamPrtnrNm: currentValue,
          is1RowClose: false,
        },
      });
      if (result) {
        const { prtnrNo, prtnrKnm, clctamDvCd } = payload;
        if (cachedParams.clctamDvCd !== clctamDvCd && !isEmpty(prtnrNo)) {
          await alert(t('MSG_ALT_CNTR_CLCTAM_DV_PSIC_FIT')); // 해당 계약의 집금구분과 맞는 담당자를 선택해 주세요.
          return false;
        }
        grid.setValue(current.itemIndex, 'clctamPrtnrNo', prtnrNo);
        grid.setValue(current.itemIndex, 'clctamPrtnrNm', prtnrKnm);
      }
    }
  };
});

</script>
