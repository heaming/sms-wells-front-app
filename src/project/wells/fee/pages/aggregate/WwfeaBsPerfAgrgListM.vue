<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaBsPerfAgrgListM BS실적 집계
3. 작성자 : seoin.jeon
4. 작성일 : 2023.05.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- BS실적 집계
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CHNL_DV')"
        >
          <kw-option-group
            v-model="searchParams.ogTpCd"
            type="radio"
            :options="ogTp"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ORDR')"
        >
          <kw-option-group
            v-model="searchParams.feeTcntDvCd"
            type="radio"
            :options="codes.FEE_TCNT_DV_CD"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')"
        >
          <kw-input v-model="searchParams.strtPdCd" />
          <span>~</span>
          <kw-input v-model="searchParams.endPdCd" />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_VST_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtVstDt"
            v-model:to="searchParams.endVstDt"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_SEQUENCE_NUMBER')">
          <kw-input
            v-model="searchParams.prtnrNo"
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            icon="search"
            clearable
            @click-icon="onClickSearchNo"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          secondary
          dense
          :label="$t('MSG_BTN_BFSVC_PERF_AGRG')"
          @click="onClickBsPerfAgrg"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGridMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, codeUtil, useGlobal, getComponentType, useDataService, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty, cloneDeep } from 'lodash-es';

const { modal } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const codes = await codeUtil.getMultiCodes(
  'FEE_TCNT_DV_CD',
);

// 채널 구분
const ogTp = [
  { codeId: 'W02', codeName: t('MSG_TXT_MNGER_OG') },
  { codeId: 'W03', codeName: t('MSG_TXT_HMST') },
];

// 조회조건
const searchParams = ref({
  perfYm: dayjs().subtract(1, 'month').format('YYYYMM'),
  ogTpCd: 'W02',
  prtnrNo: '',
  feeTcntDvCd: '01',
  strtPdCd: '',
  endPdCd: '',
  strtVstDt: dayjs().subtract(1, 'month').format('YYYYMM01'),
  endVstDt: dayjs().subtract(1, 'month').endOf('month').format('YYYYMMDD'),
});

let cachedParams;

// 조회
async function fetchData() {
  cachedParams = { ...cachedParams };
  const res = await dataService.get('/sms/wells/fee/bs-fees', { params: cachedParams });
  totalCount.value = res.data.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
}

// 조회 버튼 클릭 이벤트
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const response = await dataService.get('/sms/wells/fee/bs-fees', { params: cachedParams });
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

// 번호 팝업 호출
async function openPartnerPopup() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });

  if (result) {
    if (!isEmpty(payload.prtnrNo)) searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

// 번호 검색 아이콘 클릭 이벤트
async function onClickSearchNo() {
  await openPartnerPopup();
}

// BS실적 집계 버튼 클릭 이벤트
async function onClickBsPerfAgrg() {
  const { result: isChanged } = await modal({
    component: 'WwfeaOgNetOrderBsPerfAgrgRegP',
    componentProps: {
      perfYm: searchParams.value.perfYm,
    },
  });

  if (isChanged) {
    console.log('bs실적집계');
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '140', styleName: 'text-center' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-center' },
    { fieldName: 'svFeePdDvNm', header: t('MSG_TXT_BS') + t('MSG_TXT_PDGRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'svFeeBaseAmt', header: t('MSG_TXT_BAS_FEE'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'feeCalcAmt', header: t('MSG_TXT_VST_FEE'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'svBizDclsfCd', header: t('MSG_TXT_WORK_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'vstRglvlGdNm', header: t('MSG_TXT_VST_RGLVL'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SLS_CAT'), width: '100', styleName: 'text-center' },
    { fieldName: 'uswyNm', header: t('MSG_TXT_USWY_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'prrVstYn', header: t('MSG_TXT_PRR_VST_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'vstDuedt', header: t('MSG_TXT_SCHD_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'wkExcnDt', header: t('MSG_TXT_VST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'canYn', header: t('MSG_TXT_CNCL_YN'), width: '100', styleName: 'text-center' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
