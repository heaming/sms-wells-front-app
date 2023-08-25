<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDCC
2. 프로그램 ID : WwdccPrepaymentExpirationMCharacterFwIz - 선납만료 고객현황 - 문자발송내역 탭 (W-CL-U-0052M03)
3. 작성자 : sunghun choi
4. 작성일 : 2023.08.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 선납만료 고객현황 - 문자발송내역 탭 화면
****************************************************************************************************
--->
<template>
  <kw-search
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_FW_DAY')"
        required
      >
        <kw-date-picker
          v-model="searchParams.sndgDt"
          rules="required"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_SCS_YN')"
      >
        <kw-select
          v-model="searchParams.scsYn"
          :options="codes.COD_YN"
          option-label="codeId"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_MPNO')"
      >
        <kw-input
          v-model="searchParams.cellNo"
          mask="telephone"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
          :label="$t('MSG_TXT_MPNO')"
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
        <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
      </template>

      <kw-btn
        icon="download_on"
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        secondary
        dense
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      :visible-rows="10"
      @init="initGrdMain"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, codeUtil, useMeta, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'COD_YN',
);

let cachedParams;
const searchParams = ref({
  sndgDt: dayjs().format('YYYYMMDD'),
  scsYn: '',
  cellNo: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/performance/prepayment-expiration/character-fw-iz/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/closing/performance/prepayment-expiration/character-fw-iz/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(pages);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dateClientReq' },
    { fieldName: 'cstNm' },
    { fieldName: 'recipientNum' },
    { fieldName: 'cntrNo' },
    { fieldName: 'bndMsgTpVal4' },
    { fieldName: 'bndMsgTpVal2' },
    { fieldName: 'sucYn' },
    { fieldName: 'fnlMdfcDtm' },
    { fieldName: 'usrNm' },
    { fieldName: 'epno' },
  ];

  const columns = [
    { fieldName: 'dateClientReq', header: t('MSG_TXT_BOO_FW_DTM'), width: '191', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM_CNTRT'), width: '150', styleName: 'text-left' },
    { fieldName: 'recipientNum', header: t('MSG_TXT_CNTRT_MPNO'), width: '150', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '174', styleName: 'text-center' },
    { fieldName: 'bndMsgTpVal4', header: t('MSG_TXT_PD_INF'), width: '160', styleName: 'text-left' },
    { fieldName: 'bndMsgTpVal2', header: t('MSG_TXT_PRM_EXN_YM'), width: '127', styleName: 'text-center' },
    { fieldName: 'sucYn', header: t('MSG_TXT_SCS_YN'), width: '122', styleName: 'text-center' },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_IN_DTM'), width: '191', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'usrNm', header: t('MSG_TXT_INP_NM'), width: '115', styleName: 'text-center' },
    { fieldName: 'epno', header: t('MSG_TXT_EPNO'), width: '114', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
