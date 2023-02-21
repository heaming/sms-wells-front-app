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
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_TF_MM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_TF_MM')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_DIV')"
          required
        >
          <kw-select
            v-model="searchParams.bzHdqDvCd"
            :options="codes.DIV_DV_CD"
            :label="$t('MSG_TXT_DIV')"
            model-value="1000"
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
          :label="$t('MSG_TXT_NW_DV')"
        >
          <!-- TODO: 코드관리 등록 안되어 있어서 생성 후 수정 필요 -->
          <kw-select
            v-model="searchParams.nwYn"
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NM')"
        >
          <kw-input
            v-model="searchParams.cstKnm"
            icon="search"
            clearable
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NO')"
        >
          <!-- TODO: 고객번호 다른 화면에 맞춰서 작업 한 이벤트 명세서 맞춰서 수정 필요한 경우 수정 -->
          <kw-input
            v-model="searchParams.cstNo"
            icon="search"
            :on-click-icon="openSearchUserPopup"
            clearable
            @keydown.enter="isCustomerNo"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MPNO')"
        >
          <kw-input />
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
          <span class="ml8">({{ $t('MSG_TXT_UNIT_WON') }})</span>
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
            :page-index="pageInfo.pageIndex"
            :page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          grid-action
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
        :visible-rows="9"
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

const { t } = useI18n();
const { getConfig } = useMeta();
const { notify, alert, confirm } = useGlobal();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'BND_CLCTN_PRP_DV_CD',
  'BND_CLCTN_PRP_RSON_CD',
  'COD_YN',
  'CLCTAM_DV_CD',
  'DIV_DV_CD',
);
const filteredCodes = ref({ CLCTAM_DV_CD: codes.CLCTAM_DV_CD.filter((obj) => (obj.codeId !== '09' && obj.codeId !== '10')) });

const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const defaultDate = dayjs().format('YYYYMM');

let cachedParams;
const searchParams = ref({
  baseYm: defaultDate,
  bzHdqDvCd: '1000',
  clctamDvCd: '',
  nwYn: '',
  cstNo: '',
  phoneNumber: '',
  cstKnm: '',
});
const searchDetailsParams = ref({
  baseYm: defaultDate,
  clctamDvCd: '',
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/bond/part-transfers', { params: cachedParams });
  const partTransfers = res.data;

  totalCount.value = partTransfers.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(partTransfers);
  view.resetCurrent();
}

async function hasPartTransfer() {
  cachedParams = cloneDeep(searchParams.value);
  const response = await dataService.get('/sms/wells/bond/part-transfers/has-part-transfer', { params: cachedParams });
  if (!response.data) {
    await alert(t('MSG_ALT_PA_TF_NO_CRT'));
    // TODO: 임시 데이터가 없는 상태에서 처리 하는거라 무조건 false가 넘어오기 때문에 메시지 출력하고 true로 return 추후 다시 false로 변경 필요
    return true;
  }
  return true;
}

async function onClickSearch() {
  if (await hasPartTransfer()) {
    pageInfo.value.pageIndex = 1;
    cachedParams = cloneDeep(searchParams.value);
    fetchData();
  }
}

async function fetchDetailsData() {
  const res = await dataService.get('/sms/wells/bond/part-transfers/details/paging', { params: searchDetailsParams.value });
  const { list: partTransferDetails, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdSubRef.value.getView();
  view.getDataSource().setRows(partTransferDetails);
  view.resetCurrent();
}

// TODO: 명세서에 맞춰서 서버 다운로드로 변경 해야 할 수 있음
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: 'partTransferList', // TODO: 파일명 정의되면 변경
    timePostfix: true,
  });
}

async function onClickDetailsExcelDownload() {
  const view = grdSubRef.value.getView();

  const res = await dataService.get('/sms/wells/bond/part-transfers/details/excel-download', { params: searchDetailsParams.value });
  await gridUtil.exportView(view, {
    fileName: 'partTransferDetailsList',
    timePostfix: true,
    exportData: res.data,
  });
}

function openSearchUserPopup() {
  // TODO: 고객정보 조회 팝업 확인 후 추가 작업 예정
  console.log('call openSearchUserPopup');
}

async function isCustomerNo() {
  cachedParams = cloneDeep(searchParams.value);
  const response = await dataService.get('/sms/common/bond/normal-bonds/is-customer-no', { params: cachedParams });
  if (!response.data) {
    searchParams.value.cstNo = '';
    notify(t('MSG_ALT_INQR_OJ_CST_YN'));
  }
}

async function onClickSave() {
  const view = grdSubRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.put('/sms/wells/bond/part-transfers', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchDetailsData();
}

async function onClickCreate() {
  cachedParams = cloneDeep(searchParams.value);
  const response = await dataService.get('/sms/wells/bond/part-transfers/has-part-transfer-detail', { params: cachedParams });
  if (response.data) {
    if (!await confirm(t('MSG_ALT_ASN_DTA_RECRT'))) { return; }
  } else {
    notify(t('MSG_ALT_PA_TF_EXCN'));
  }
  await dataService.post('/sms/wells/bond/part-transfers', cachedParams);
}

onMounted(() => {
  hasPartTransfer();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'bzHdqDvCd', header: t('MSG_TXT_MSG_TXT_DIV2'), width: '75' },
    { fieldName: 'clctamDvCd', header: t('MSG_TXT_CLCTAM_DV'), width: '75' },
    { fieldName: 'totCstCt', header: t('MSG_TXT_CST_N'), width: '65', styleName: 'text-right' },
    { fieldName: 'totCntrCt', header: t('MSG_TXT_ACC_N'), width: '65', styleName: 'text-right' },
    { fieldName: 'woCstCt', header: t('MSG_TXT_CST_N'), width: '65', styleName: 'text-right' },
    { fieldName: 'woCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', styleName: 'text-right' },
    { fieldName: 'woObjAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'woDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'woThmChramAmt', header: t('MSG_TXT_THM_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'woDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'woRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'cocnCstCt', header: t('MSG_TXT_CST_N'), width: '65', styleName: 'text-right' },
    { fieldName: 'cocnCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', styleName: 'text-right' },
    { fieldName: 'cocnObjAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'cocnDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'cocnThmChramAmt', header: t('MSG_TXT_THM_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'cocnDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'cocnRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'hsmtrlCstCt', header: t('MSG_TXT_CST_N'), width: '65', styleName: 'text-right' },
    { fieldName: 'hsmtrlCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', styleName: 'text-right' },
    { fieldName: 'hsmtrlObjAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'hsmtrlDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'hsmtrlThmChramAmt', header: t('MSG_TXT_THM_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'hsmtrlDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'hsmtrlRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'hsmtrlBorCstCt', header: t('MSG_TXT_CST_N'), width: '65', styleName: 'text-right' },
    { fieldName: 'hsmtrlBorCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', styleName: 'text-right' },
    { fieldName: 'hsmtrlBorObjAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'hsmtrlBorDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'hsmtrlBorThmChramAmt', header: t('MSG_TXT_THM_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'hsmtrlBorDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'hsmtrlBorRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'mchnRentalCstCt', header: t('MSG_TXT_CST_N'), width: '65', styleName: 'text-right' },
    { fieldName: 'mchnRentalCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', styleName: 'text-right' },
    { fieldName: 'mchnRentalObjAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'mchnRentalDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'mchnRentalThmChramAmt', header: t('MSG_TXT_THM_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'mchnRentalDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'mchnRentalRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'mchnRentalBorCstCt', header: t('MSG_TXT_CST_N'), width: '65', styleName: 'text-right' },
    { fieldName: 'mchnRentalBorCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', styleName: 'text-right' },
    { fieldName: 'mchnRentalBorObjAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'mchnRentalBorDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'mchnRentalBorThmChramAmt', header: t('MSG_TXT_THM_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'mchnRentalBorDlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'mchnRentalBorRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right' },

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'bzHdqDvCd', 'clctamDvCd', 'totCstCt', 'totCntrCt',
    {
      header: t('MSG_TIT_TOT'),
      direction: 'horizontal',
      items: ['woCstCt', 'woCntrCt', 'woObjAmt', 'woDlqAmt', 'woThmChramAmt', 'woDlqAddAmt', 'woRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_COCN'),
      direction: 'horizontal',
      items: ['cocnCstCt', 'cocnCntrCt', 'cocnObjAmt', 'cocnDlqAmt', 'cocnThmChramAmt', 'cocnDlqAddAmt', 'cocnRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_HSMTRL'),
      direction: 'horizontal',
      items: ['hsmtrlCstCt', 'hsmtrlCntrCt', 'hsmtrlObjAmt', 'hsmtrlDlqAmt', 'hsmtrlThmChramAmt', 'hsmtrlDlqAddAmt', 'hsmtrlRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_HSMTRL_BOR'),
      direction: 'horizontal',
      items: ['hsmtrlBorCstCt', 'hsmtrlBorCntrCt', 'hsmtrlBorObjAmt', 'hsmtrlBorDlqAmt', 'hsmtrlBorThmChramAmt', 'hsmtrlBorDlqAddAmt', 'hsmtrlBorRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_MCHN_RENTAL'),
      direction: 'horizontal',
      items: ['mchnRentalCstCt', 'mchnRentalCntrCt', 'mchnRentalObjAmt', 'mchnRentalDlqAmt', 'mchnRentalThmChramAmt', 'mchnRentalDlqAddAmt', 'mchnRentalRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_MCHN_RENTAL_BOR'),
      direction: 'horizontal',
      items: ['mchnRentalBorCstCt', 'mchnRentalBorCntrCt', 'mchnRentalBorObjAmt', 'mchnRentalBorDlqAmt', 'mchnRentalBorThmChramAmt', 'mchnRentalBorDlqAddAmt', 'mchnRentalBorRsgBorAmt'],
    },
  ]);

  view.onCellDblClicked = async (g, { dataRow }) => {
    // TODO: 명세서에 맞게 컬럼 재정의
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
    { fieldName: 'prtnrKnm' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'cstNo' },
    { fieldName: 'pdDvCd' },
    { fieldName: 'dlqMcn' },
    { fieldName: 'objAmt' },
    { fieldName: 'dlqAmt' },
    { fieldName: 'thmChramAmt' },
    { fieldName: 'dlqAddDpAmt' },
    { fieldName: 'rsgBorAmt' },
    { fieldName: 'lwmTpCd' },
    { fieldName: 'lwmDtlTpCd' },
    { fieldName: 'lwmDt' },
    { fieldName: 'dfltDt' },
    { fieldName: 'addr' },
  ];
  const columns = [
    { fieldName: 'clctamDvCd', header: t('MSG_TXT_CLCTAM_DV'), options: filteredCodes.value.CLCTAM_DV_CD, optionValue: 'codeId', optionLabel: 'codeName', editor: { type: 'list' }, width: '100' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_LSTMM_PSIC'), width: '100', editable: false },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '170', styleName: 'text-center', editable: false },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', editable: false },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '135', styleName: 'text-center', editable: false },
    { fieldName: 'pdDvCd', header: t('MSG_TXT_PRDT_GUBUN'), width: '100', editable: false },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '80', styleName: 'text-right', editable: false },
    { fieldName: 'objAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right', editable: false },
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right', editable: false },
    { fieldName: 'thmChramAmt', header: t('MSG_TXT_THM_AMT'), width: '110', styleName: 'text-right', editable: false },
    { fieldName: 'dlqAddDpAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '110', styleName: 'text-right', editable: false },
    { fieldName: 'rsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right', editable: false },
    { fieldName: 'lwmTpCd', header: t('MSG_TXT_LWM_TP'), width: '110', editable: false },
    { fieldName: 'lwmDtlTpCd', header: t('MSG_TXT_LWM_DTL'), width: '110', editable: false },
    { fieldName: 'lwmDt', header: t('MSG_TXT_LWM_DT'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'dfltDt', header: t('MSG_TXT_DE_RGST_DT'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'addr', header: t('MSG_TXT_ADDR'), width: '200', editable: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;

  view.onCellClicked = () => {
    view.editOptions.editable = true;
  };
});
</script>
