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
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_DIV2')"
          required
        >
          <kw-select
            v-model="searchParams.bzHdqDvCd"
            :options="codes.DIV_DV_CD"
            :label="$t('MSG_TXT_DIV2')"
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
          :label="$t('MSG_TXT_CLCTAM_PSIC_NM')"
        >
          <!-- TODO: 집금담당자 번호 입력시 정상 번호인지 확인 하는 작업 필요(집금담당자 조회 화면 개발 후 추가 작업 필요) -->
          <kw-input
            v-model="showInfo.clctamPrtnrKnm"
            icon="search"
            clearable
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_NW_DV')"
        >
          <!-- TODO: 코드 정의 안되어 있음 정의 되면 코드보게 수정필요 -->
          <kw-select
            v-model="searchParams.nwYn"
            :model-value="[]"
            :options="['신규', '기존']"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NM')"
        >
          <kw-input
            v-model="showInfo.cstKnm"
            icon="search"
            clearable
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NO')"
        >
          <kw-input
            v-model="searchParams.cstNo"
            icon="search"
            clearable
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MPNO')"
        >
          <kw-input v-model="showInfo.phoneNumber" />
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
          icon="upload_on"
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
          secondary
          dense
          @click="onClickExcelUpload"
        />
        <kw-btn
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          secondary
          dense
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_DTRM')"
          secondary
          dense
          @click="onClickConfirm"
        />
        <kw-btn
          :label="$t('MSG_BTN_ASN_WEIT_MDFC')"
          secondary
          dense
          @click="onClickUpdate"
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
      <h3>{{ $t('MSG_TXT_AGRG_RS_DTL') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="upload_on"
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
          secondary
          dense
          @click="onClickExcelUpload"
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
        :visible-rows="10"
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
const { modal, notify } = useGlobal();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
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

// TODO: 기준년월을 여기에서 보낼지... 서비스에서 만들지 관련 화면들 전부 정리 되면 확인 필요 현재는 화면에서 보내는 걸로 작업
const defaultDate = dayjs().format('YYYYMM');

let cachedParams;
let cachedDetailsParams;
const searchParams = ref({
  baseYm: defaultDate,
  bzHdqDvCd: '1000',
  clctamDvCd: '',
  nwYn: '',
  cstNo: '',
  clctamPrtnrNo: '',
});
const showInfo = ref({
  phoneNumber: '',
  clctamPrtnrKnm: '',
  cstKnm: '',
});
const searchDetailsParams = ref({
  baseYm: defaultDate,
  bzHdqDvCd: '',
  clctamDvCd: '',
  clctamPrtnrNo: '',
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/bond/collector-assigns', { params: cachedParams });
  const partTransfers = res.data;

  totalCount.value = partTransfers.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(partTransfers);
  view.resetCurrent();
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  fetchData();
}

async function fetchDetailsData() {
  searchDetailsParams.value.bzHdqDvCd = searchParams.value.bzHdqDvCd;
  searchDetailsParams.value.clctamDvCd = searchParams.value.clctamDvCd;
  cachedDetailsParams = cloneDeep(searchDetailsParams.value);
  const res = await dataService.get('/sms/wells/bond/collector-assigns/details/paging', { params: cachedDetailsParams });
  const { list: collectorAssigns, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdSubRef.value.getView();
  view.getDataSource().setRows(collectorAssigns);
  view.resetCurrent();
}

// TODO: 명세서에 맞춰서 서버 다운로드로 변경 해야 할 수 있음
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: 'collectorAssignsList', // TODO: 파일명 정의되면 변경
    timePostfix: true,
  });
}

async function onClickExcelUpload() {
  // TODO: 엑셀 업로드 문서 양식이 없어 구현 하지 않음 화면은 나와야 한다고 해서 샘플 소스 추가
  const apiUrl = '/sflex/common/common/excel-read/upload-test';
  const templateId = 'FOM_MSG_RESO_XLS_UP';
  const {
    result,
  } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  if (result.status === 'S') {
    notify(t('MSG_ALT_SAVE_DATA'));
  }
}

async function onClickDetailsExcelDownload() {
  const res = await dataService.get('/sms/wells/bond/collector-assigns/details/excel-download', { params: cachedDetailsParams });

  const view = grdSubRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: 'collectorAssignDetailsList',
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSave() {
  // TODO: 미완료 구현 필요
  const view = grdSubRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.put('/sms/wells/bond/collector-assigns', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchDetailsData();
}

function onClickCreate() {
  // TODO: 미완료 구현 필요
  notify(t('MSG_ALT_ALLO_OF_COLL_EXCN'));
}

function onClickUpdate() {
  // TODO: 미완료 구현 필요(Z-BN-U-0066M01 화면으로 연결 필요)
  notify(t('MSG_ALT_MODIFIED'));
}

async function onClickConfirm() {
  // TODO: 미완료 구현 필요
  cachedParams = cloneDeep(searchParams.value);
  await dataService.put('/sms/wells/bond/collector-assigns/confirm', cachedParams);
  notify(t('MSG_ALT_MODIFIED'));
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'clctamPrtnrNo' },
    { fieldName: 'clctamPrtnrKnm' },
    { fieldName: 'asnRat' },
    { fieldName: 'woCstn' },
    { fieldName: 'woCntrCt' },
    { fieldName: 'rwoTrgAmt' },
    { fieldName: 'woDlqAmt' },
    { fieldName: 'woThmChramAmt' },
    { fieldName: 'woDlqAddAmt' },
    { fieldName: 'woRsgBorAmt' },
    { fieldName: 'rentalCstn' },
    { fieldName: 'rentalCntrCt' },
    { fieldName: 'rentalTrgAmt' },
    { fieldName: 'rentalDlqAmt' },
    { fieldName: 'rentalThmChramAmt' },
    { fieldName: 'rentalDlqAddAmt' },
    { fieldName: 'rentalRsgBorAmt' },
    { fieldName: 'leaseCstn' },
    { fieldName: 'leaseCntrCt' },
    { fieldName: 'leaseTrgAmt' },
    { fieldName: 'leaseDlqAmt' },
    { fieldName: 'leaseThmChramAmt' },
    { fieldName: 'leaseDlqAddAmt' },
    { fieldName: 'leaseRsgBorAmt' },
    { fieldName: 'geMshCstn' },
    { fieldName: 'geMshCntrCt' },
    { fieldName: 'geMshTrgAmt' },
    { fieldName: 'geMshDlqAmt' },
    { fieldName: 'geMshThmChramAmt' },
    { fieldName: 'geMshDlqAddAmt' },
    { fieldName: 'geMshRsgBorAmt' },
    { fieldName: 'hcrMshCstn' },
    { fieldName: 'hcrMshCntrCt' },
    { fieldName: 'hcrMshTrgAmt' },
    { fieldName: 'hcrMshDlqAmt' },
    { fieldName: 'hcrMshThmChramAmt' },
    { fieldName: 'hcrMshDlqAddAmt' },
    { fieldName: 'hcrMshRsgBorAmt' },
    { fieldName: 'spayCstn' },
    { fieldName: 'spayCntrCt' },
    { fieldName: 'spayTrgAmt' },
    { fieldName: 'spayDlqAmt' },
    { fieldName: 'spayThmChramAmt' },
    { fieldName: 'spayDlqAddAmt' },
    { fieldName: 'spayRsgBorAmt' },
    { fieldName: 'rglrSppCstn' },
    { fieldName: 'rglrSppCntrCt' },
    { fieldName: 'rglrSppTrgAmt' },
    { fieldName: 'rglrSppDlqAmt' },
    { fieldName: 'rglrSppThmChramAmt' },
    { fieldName: 'rglrSppDlqAddAmt' },
    { fieldName: 'rglrSppRsgBorAmt' },
  ];
  const columns = [
    { fieldName: 'clctamPrtnrKnm', header: t('MSG_TXT_PIC_NM'), width: '98', styleName: 'text-left' },
    { fieldName: 'asnRat', header: t('MSG_TXT_ASN_WEIT'), width: '98', styleName: 'text-center' },

    { fieldName: 'woCstn', header: t('MSG_TXT_CST_N'), width: '65', styleName: 'text-center' },
    { fieldName: 'woCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', styleName: 'text-center' },
    { fieldName: 'rwoTrgAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'woDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'woThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', styleName: 'text-right' },
    { fieldName: 'woDlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'woRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-center' },

    { fieldName: 'rentalCstn', header: t('MSG_TXT_CST_N'), width: '65', styleName: 'text-center' },
    { fieldName: 'rentalCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', styleName: 'text-center' },
    { fieldName: 'rentalTrgAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'rentalDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '111', styleName: 'text-right' },
    { fieldName: 'rentalThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', styleName: 'text-right' },
    { fieldName: 'rentalDlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'rentalRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right' },

    { fieldName: 'leaseCstn', header: t('MSG_TXT_CST_N'), width: '65', styleName: 'text-center' },
    { fieldName: 'leaseCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', styleName: 'text-center' },
    { fieldName: 'leaseTrgAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'leaseDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'leaseThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', styleName: 'text-right' },
    { fieldName: 'leaseDlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'leaseRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right' },

    { fieldName: 'geMshCstn', header: t('MSG_TXT_CST_N'), width: '65', styleName: 'text-center' },
    { fieldName: 'geMshCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', styleName: 'text-center' },
    { fieldName: 'geMshTrgAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'geMshDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'geMshThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', styleName: 'text-right' },
    { fieldName: 'geMshDlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'geMshRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right' },

    { fieldName: 'hcrMshCstn', header: t('MSG_TXT_CST_N'), width: '65', styleName: 'text-center' },
    { fieldName: 'hcrMshCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', styleName: 'text-center' },
    { fieldName: 'hcrMshTrgAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'hcrMshDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'hcrMshThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', styleName: 'text-right' },
    { fieldName: 'hcrMshDlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'hcrMshRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right' },

    { fieldName: 'spayCstn', header: t('MSG_TXT_CST_N'), width: '65', styleName: 'text-center' },
    { fieldName: 'spayCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', styleName: 'text-center' },
    { fieldName: 'spayTrgAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'spayDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'spayThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', styleName: 'text-right' },
    { fieldName: 'spayDlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'spayRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right' },

    { fieldName: 'rglrSppCstn', header: t('MSG_TXT_CST_N'), width: '65', styleName: 'text-center' },
    { fieldName: 'rglrSppCntrCt', header: t('MSG_TXT_CNTR_N'), width: '65', styleName: 'text-center' },
    { fieldName: 'rglrSppTrgAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'rglrSppDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'rglrSppThmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', styleName: 'text-right' },
    { fieldName: 'rglrSppDlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'rglrSppRsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = false;

  view.setColumnLayout([
    'clctamPrtnrKnm', 'asnRat',
    {
      header: t('MSG_TXT_ALL'),
      direction: 'horizontal',
      items: ['woCstn', 'woCntrCt', 'rwoTrgAmt', 'woDlqAmt', 'woThmChramAmt', 'woDlqAddAmt', 'woRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_RENTAL'),
      direction: 'horizontal',
      items: ['rentalCstn', 'rentalCntrCt', 'rentalTrgAmt', 'rentalDlqAmt', 'rentalThmChramAmt', 'rentalDlqAddAmt', 'rentalRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_FNN_LEASE'),
      direction: 'horizontal',
      items: ['leaseCstn', 'leaseCntrCt', 'leaseTrgAmt', 'leaseDlqAmt', 'leaseThmChramAmt', 'leaseDlqAddAmt', 'leaseRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_GE_MSH'),
      direction: 'horizontal',
      items: ['geMshCstn', 'geMshCntrCt', 'geMshTrgAmt', 'geMshDlqAmt', 'geMshThmChramAmt', 'geMshDlqAddAmt', 'geMshRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_HCR_MSH'),
      direction: 'horizontal',
      items: ['hcrMshCstn', 'hcrMshCntrCt', 'hcrMshTrgAmt', 'hcrMshDlqAmt', 'hcrMshThmChramAmt', 'hcrMshDlqAddAmt', 'hcrMshRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_SNGL_PMNT'),
      direction: 'horizontal',
      items: ['spayCstn', 'spayCntrCt', 'spayTrgAmt', 'spayDlqAmt', 'spayThmChramAmt', 'spayDlqAddAmt', 'spayRsgBorAmt'],
    },
    {
      header: t('MSG_TXT_REG_DLVR'),
      direction: 'horizontal',
      items: ['rglrSppCstn', 'rglrSppCntrCt', 'rglrSppTrgAmt', 'rglrSppDlqAmt', 'rglrSppThmChramAmt', 'rglrSppDlqAddAmt', 'rglrSppRsgBorAmt'],
    },
  ]);
  view.onCellDblClicked = async (g, { dataRow }) => {
    // TODO: 명세서에 맞게 항목 재정의 필요 화면 구현을 위해 임시 소스
    const { clctamPrtnrNo } = gridUtil.getRowValue(g, dataRow);
    searchDetailsParams.value.clctamPrtnrNo = clctamPrtnrNo;
    fetchDetailsData();
  };
});
const initGrdSub = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseYm' },
    { fieldName: 'bzHdqDvCd' },
    { fieldName: 'cntrSn' },
    { fieldName: 'clctamPrtnrNo' },
    { fieldName: 'clctamPrtnrKnm' },
    { fieldName: 'lstmmClctamDvCd' },
    { fieldName: 'lstmmClctamPrtnrNo' },
    { fieldName: 'lstmmClctamPrtnrKnm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'cstNo' },
    { fieldName: 'pdNm' },
    { fieldName: 'dlqMcn' },
    { fieldName: 'trgAmt' },
    { fieldName: 'dlqAmt' },
    { fieldName: 'thmChramAmt' },
    { fieldName: 'dlqAddAmt' },
    { fieldName: 'rsgBorAmt' },
    { fieldName: 'lwmDtlTpCd' },
    { fieldName: 'lwmDt' },
    { fieldName: 'dfltDt' },
    { fieldName: 'addr' },
  ];
  const columns = [
    { fieldName: 'clctamPrtnrKnm', header: t('MSG_TXT_PIC_NM'), width: '98', styleName: 'text-left' },
    { fieldName: 'lstmmClctamDvCd', header: t('MSG_TXT_LSTMM_ICHR_CLCTAM_DV'), width: '130', styleName: 'text-left', editable: false },
    { fieldName: 'lstmmClctamPrtnrKnm', header: t('MSG_TXT_LSTMM_PSIC'), width: '90', styleName: 'text-left', editable: false },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '160', styleName: 'text-center', editable: false },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '90', styleName: 'text-left', editable: false },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_GUBUN'), width: '90', styleName: 'text-left', editable: false },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '86', styleName: 'text-center', editable: false },
    { fieldName: 'trgAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right', editable: false },
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right', editable: false },
    { fieldName: 'thmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', styleName: 'text-right', editable: false },
    { fieldName: 'dlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '116', styleName: 'text-right', editable: false },
    { fieldName: 'rsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right', editable: false },
    { fieldName: 'lwmDtlTpCd', header: t('MSG_TXT_LWM_PS'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'lwmDt', header: t('MSG_TXT_LWM_PS_DT'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'dfltDt', header: t('MSG_TXT_DE_RGST_DT'), width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'addr', header: t('MSG_TXT_ADDR'), width: '200', styleName: 'text-left', editable: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellClicked = () => {
    view.editOptions.editable = true;
  };
});
</script>
