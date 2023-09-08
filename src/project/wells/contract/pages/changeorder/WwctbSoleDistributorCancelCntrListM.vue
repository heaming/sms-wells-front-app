<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbSoleDistributorCancelCntrListM - 총판 취소고객 현황 조회
3. 작성자 : JSY
4. 작성일 : 2023.03.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 총판 취소고객 현황 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CANC_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.canStrtDt"
            v-model:to="searchParams.canEndDt"
            rules="date_range_required|date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_DIV')">
          <kw-select
            v-model="searchParams.pdGbn"
            first-option="all"
            :options="codes.PDGRP_ACD"
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
        </template>
        <kw-btn
          v-permission:print
          :label="$t('MSG_BTN_RPT_BRWS')"
          icon="report"
          dense
          @click="ozPrint"
        />
      </kw-action-top>
      <kw-grid
        ref="grdGridSoleDistributorCanCntr"
        name=""
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGridSoleDistributorCanCntrList"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useMeta, useDataService, getComponentType, useGlobal, defineGrid, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { getConfig } = useMeta();
const { t } = useI18n();
const dataService = useDataService();
const { notify } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdGridSoleDistributorCanCntr = ref(getComponentType('KwGrid'));
const now = dayjs();

const searchParams = ref({
  canStrtDt: `${now.format('YYYYMM')}01`, // 취소시작일자
  canEndDt: now.format('YYYYMMDD'), // 취소끝일자
  pdGbn: '', // 구분
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PDGRP_ACD',
);

let cachedParams;

async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/soledistributor-cancel-contracts/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdGridSoleDistributorCanCntr.value.getView();
  const dataSource = view.getDataSource();
  dataSource.setRows(pages);

  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function ozPrint() {
  notify(t('리포트작업은 예정입니다.'));
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridSoleDistributorCanCntrList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogCd' }, // 소속
    { fieldName: 'hooPrtnrNm' }, // 본부장명
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약 일련번호
    { fieldName: 'cstKnm' }, // 계약자 한글명
    { fieldName: 'telNo' }, // 설치자 휴대전화번호
    { fieldName: 'istCralLocaraTno' }, // 설치자 휴대전화번호1
    { fieldName: 'istMexnoEncr' }, // 설치자 휴대전화번호2
    { fieldName: 'istCralIdvTno' }, // 설치자 휴대전화번호3
    { fieldName: 'istAdrZip' }, // 설치자정보 우편번호
    { fieldName: 'istRnadr' }, // 설치자정보 기준주소
    { fieldName: 'istRdadr' }, // 설치자정보 상세주소
    { fieldName: 'pdClsfNm' }, // 구분 - 중분류
    { fieldName: 'pdMclsfRnm' }, // 구분
    { fieldName: 'pdAbbrNm' }, // 상품약어명
    { fieldName: 'istDt' }, // 설치일자
    { fieldName: 'canDt' }, // 취소일자
    { fieldName: 'canCn' }, // 취소 내용
    { fieldName: 'sellInflwChnlDtlCd' }, // 판매유입채널상세코드
  ];

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '109', styleName: 'text-center' },
    { fieldName: 'hooPrtnrNm', styleName: 'text-center', header: t('MSG_TXT_GNR_MNG'), width: '96' }, // 본부장
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '132', styleName: 'text-center' },
    { fieldName: 'cstKnm', styleName: 'text-center', header: t('MSG_TXT_CST_NM'), width: '96' }, // 고객병
    {
      fieldName: 'telNo',
      header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_MPNO')}`,
      width: '178',
      styleName: 'text-center',
    },
    { fieldName: 'istRnadr', header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_ADDR')}`, width: '432' },
    { fieldName: 'pdMclsfRnm', header: t('MSG_TXT_DIV'), width: '96', styleName: 'text-center', options: codes.PDGRP_ACD },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_PRDT_NM'), width: '202' },
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '132', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '132', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    { fieldName: 'canCn', header: `${t('MSG_TXT_CANCEL')}${t('MSG_TXT_CNTN')}`, width: '321' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
