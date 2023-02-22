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
        >
          <kw-select
            v-model="searchParams.clctamDvCd"
            :options="codes.CLCTAM_DV_CD"
            :label="$t('MSG_TXT_CLCTAM_DV')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CLCTAM_PSIC_NM')"
        >
          <kw-input
            icon="search"
            clearable
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_NW_DV')"
        >
          <kw-select
            :model-value="[]"
            :options="['Y', 'N']"
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
          <kw-input
            v-model="searchParams.cstNo"
            icon="search"
            clearable
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
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { notify } = useGlobal();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'CLCTAM_DV_CD',
  'DIV_DV_CD',
);
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});
let cachedParams;
const searchParams = ref({
  bzHdqDvCd: '1000',
  clctamDvCd: '',
  nwYn: '',
  cstNo: '',
  clctamPrtnrNo: '',
  cstKnm: '',
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
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/bond/collector-assigns/details/paging', { params: cachedParams });
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

async function onClickDetailsExcelDownload() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/bond/collector-assigns/details/excel-download', { params: cachedParams });

  const view = grdSubRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: 'collectorAssignDetailsList',
    timePostfix: true,
    exportData: res.data,
  });
}

function onClickSave() {
  // TODO: 미완료 구현 필요
  notify(t('MSG_ALT_SAVE_DATA'));
}

function onClickCreate() {
  // TODO: 미완료 구현 필요
  notify(t('MSG_ALT_CRT_FSH'));
}

function onClickUpdate() {
  // TODO: 미완료 구현 필요
  notify(t('MSG_ALT_MODIFIED'));
}

function onClickConfirm() {
  // TODO: 미완료 구현 필요
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
  view.onCellDblClicked = async () => {
    // TODO: 명세서에 맞게 항목 재정의 필요 화면 구현을 위해 임시 소스
    fetchDetailsData();
  };
});
const initGrdSub = defineGrid((data, view) => {
  const fields = [
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
    { fieldName: 'lstmmClctamDvCd', header: t('MSG_TXT_LSTMM_ICHR_CLCTAM_DV'), width: '130', styleName: 'text-left' },
    { fieldName: 'lstmmClctamPrtnrKnm', header: t('MSG_TXT_LSTMM_PSIC'), width: '90', styleName: 'text-left' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '160', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '90', styleName: 'text-left' },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '130', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_GUBUN'), width: '90', styleName: 'text-left' },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '86', styleName: 'text-center' },
    { fieldName: 'trgAmt', header: t('MSG_TXT_OJ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'thmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', styleName: 'text-right' },
    { fieldName: 'dlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '116', styleName: 'text-right' },
    { fieldName: 'rsgBorAmt', header: t('MSG_TXT_BOR_AMT'), width: '110', styleName: 'text-right' },
    { fieldName: 'lwmDtlTpCd', header: t('MSG_TXT_LWM_PS'), width: '110', styleName: 'text-center' },
    { fieldName: 'lwmDt', header: t('MSG_TXT_LWM_PS_DT'), width: '110', styleName: 'text-center' },
    { fieldName: 'dfltDt', header: t('MSG_TXT_DE_RGST_DT'), width: '110', styleName: 'text-center' },
    { fieldName: 'addr', header: t('MSG_TXT_ADDR'), width: '200', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>
