<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctaContractChgMgtListM - 계약자 명의변경 현황
3. 작성자 : jeongheon lee
4. 작성일 : 2023.12.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [K-W-SS-U-0160M01] 계약자 명의변경 현황
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="3"
    @search="onClickSearch"
    @reset="onClickReset"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_CH_DT', null, '변경일자')"
      >
        <kw-date-range-picker
          v-model:from="searchParams.conStrtDt"
          v-model:to="searchParams.conEndDt"
          :label="t('MSG_TXT_CH_DT')"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CLSS_CHG', null, '변경구분')"
      >
        <kw-select
          v-model="searchParams.cstRelTpCd"
          :options="codes.CNTR_CH_TP_CD.filter((v) => ['103' ].includes(v.codeId))"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CH_RSON', null, '변경사유')"
      >
        <kw-select
          v-model="searchParams.cntrChRsonCd"
          :options="codes.CMN_STAT_CH_RSON_CD.filter((v) => ['32','36','51' ].includes(v.codeId))"
          :label="t('MSG_TXT_CH_RSON')"
          first-option="all"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        label="변경고객번호"
      >
        <kw-input
          v-model="searchParams.cstNo"
          icon="search"
          clearable
          :regex="/^[0-9]*$/i"
          maxlength="10"
          :label="t('MSG_TXT_CST_NO')"
          @click-icon="onClickCustomer()"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_DTL', null, '계약상세')"
      >
        <kw-input
          v-model="searchParams.cntrNo"
          :label="$t('MSG_TXT_CNTR_NO')"
          maxlength="13"
          icon="search"
          clearable
          @click-icon="onClickSearchContractNumber"
        />
      </kw-search-item>
      <!-- <kw-search-item
        label="변경담당자"
      >
        <kw-select
          v-model="searchParams.cstNo"
          icon="search"
          clearable
          :regex="/^[0-9]*$/i"
          maxlength="10"
          @click-icon="onClickCustomer('search')"
        />
      </kw-search-item> -->
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
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>

      <kw-btn
        v-permission:download
        icon="download_on"
        secondary
        dense
        :label="t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="10"
      :total-count="pageInfo.totalCount"
      @init="initGrid"
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
import { codeUtil, useGlobal, useDataService, gridUtil, getComponentType, useMeta } from 'kw-lib'; //   ,  defineGrid
import { cloneDeep } from 'lodash-es'; // , isEmpty

import dayjs from 'dayjs';

const { getConfig } = useMeta();
const {
  modal,
} = useGlobal();
const sessionMeta = useMeta();
const { t } = useI18n();
let cachedParams;

const dataService = useDataService();
const { currentRoute } = useRouter();

const userInfo = sessionMeta.getUserInfo();
const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});
const codes = await codeUtil.getMultiCodes(
  'CNTR_CH_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'CMN_STAT_CH_RSON_CD',
);

const searchParams = ref({
  conStrtDt: `${now.format('YYYYMM')}01`, /* 변경일자(시작일자) */
  conEndDt: now.format('YYYYMMDD'), /* 변경일자(종료일자) */
  cstRelTpCd: '103', /* 변경대상자구분 */
  cstNo: '', /* 변경고객번호 */
  cntrNo: '', /* 계약번호 */
  cntrSn: '', /* 계약일련번호 */
  cntrChRsonCd: '', /* 계약변경사유코드 */

});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// TODO: 변경고객조회(공통)
async function onClickCustomer() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: {
      cstNo: searchParams.value.cstNo,
    },
  });
  if (result) {
    searchParams.value.cstNo = payload.cstNo;
  }
}

/**
 * 조회 함수
 */
async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const response = await dataService.get('sms/wells/contract/contract/mng/paging', { params: cachedParams });
  const { list, pageInfo: pageResult } = response.data;
  pageInfo.value = pageResult;

  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(list);
  view.resetCurrent();
}

/**
 * '조회'버튼을 클릭하는 경우
 */
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 초기화버튼 클릭 이벤트
async function onClickReset() {
  searchParams.value.conStrtDt = `${now.format('YYYYMM')}01`; /* 변경일자(시작일자) */
  searchParams.value.conEndDt = now.format('YYYYMMDD'); /* 변경일자(종료일자) */
  searchParams.value.cstRelTpCd = '103'; /* 변경대상자구분 */
  searchParams.value.cntrChRsonCd = ''; /* 계약상세 */
  searchParams.value.cstNo = ''; /* 고객번호 */
  searchParams.value.cntrNo = ''; /* 계약번호 */
  searchParams.value.cntrSn = ''; /* 계약일련번호 */

  cachedParams = cloneDeep(searchParams.value);
}

/**
 * 계약번호 검색 팝업
 *
 * 계약번호 검색 Z 가 아니라 E,W 나뉘어져 있음.
 * E-SS-U-0011P01 = EwctaContractNumberListP
 * W-SS-U-0157P01 = WwctaContractNumberListP
 */
// eslint-disable-next-line no-unused-vars
async function onClickSearchContractNumber() {
  if (userInfo.tenantCd === 'E') {
    const { result, payload } = await modal({
      component: 'EwctaContractNumberListP',
      componentProps: {
        cntrNo: searchParams.value.cntrNo,
        // cntrSn: '1',
      },
    });
    if (result) {
      searchParams.value.cntrNo = payload.cntrNo;
      searchParams.value.cntrSn = payload.cntrSn;
    }
  } else if (userInfo.tenantCd === 'W') {
  // eslint-disable-next-line no-unused-vars
    const { result, payload } = await modal({
      component: 'WwctaContractNumberListP',
      componentProps: {
        cntrNo: searchParams.value.cntrNo,
        // cntrSn: '1',
      },
    });
    if (result) {
      searchParams.value.cntrNo = payload.cntrNo;
      searchParams.value.cntrSn = payload.cntrSn;
    }
  }
}

/**
 * 엑셀다운로드
 */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('sms/wells/contract/contract/mng/excel-down', { params: cachedParams, timeout: 420000 });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

function initGrid(data, view) {
  const fields = [
    { fieldName: 'procsFshDtm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrCstRelTpNm' },
    { fieldName: 'bfchCn' },
    { fieldName: 'bfchCnNm' },
    { fieldName: 'cntrChAkCn' },
    { fieldName: 'cntrChAkNm' },
    { fieldName: 'cntrChRsonNm' },
  ];

  const columns = [
    { fieldName: 'procsFshDtm', header: t('MSG_TXT_CH_DT', null, '변경일자'), width: '100', datetimeFormat: 'date', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO', null, '계약번호'), width: '150', styleName: 'text-center' },
    { fieldName: 'cntrCstRelTpNm', header: t('MSG_TXT_CLSS_PEO_SUBJ_CHNG', null, '변경대상자구분'), width: '100', styleName: 'text-center' },
    { fieldName: 'bfchCn', header: t('MSG_TXT_CST_NO', null, '고객번호'), width: '100', styleName: 'text-center' },
    { fieldName: 'bfchCnNm', header: t('MSG_TXT_CST_NM', null, '고객명'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrChAkCn', header: t('MSG_TXT_CHG_CUS_NUM', null, '변경 고객번호'), width: '120', styleName: 'text-center' },
    { fieldName: 'cntrChAkNm', header: t('MSG_TXT_CHG_CUS_NM', null, '변경 고객명'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrChRsonNm', header: t('MSG_TXT_CH_RSON', null, '변경사유'), width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}

</script>
