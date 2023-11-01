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
import { codeUtil, defineGrid, gridUtil, getComponentType, stringUtil, useMeta, useDataService, useGlobal } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import { openReportPopup } from '~common/utils/cmPopupUtil';

const { getters } = useStore();
const { getConfig } = useMeta();
const { t } = useI18n();
const dataService = useDataService();
const { notify } = useGlobal();
const userInfo = getters['meta/getUserInfo'];

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
  if (isEmpty(cachedParams)) { // 조회 조건이 없다 (조회없이 누를경우)
    notify('검색 결과가 없습니다.');
    return;
  }

  const res = await dataService.get('/sms/wells/contract/contracts/soledistributor-cancel-contracts/ozReporting', { params: { ...cachedParams, ...pageInfo.value } });
  // console.log(res.data);

  const mapRes = res.data.map((v) => ({ // data naming 수정(ozReport(AS-IS)기준으로)
    hdqr: v.ogCd, // 소속
    hqldNm: v.hooPrtnrNm, // 본부장명
    custCd: v.cntrNo, // 계약번호
    LCCNAM: v.cstKnm, // 고객명
    LCW_HPNO: !isEmpty(v.telNo) ? `${v.istCralLocaraTno}${v.istMexnoEncr}${v.istCralIdvTno}` : '', // 설치자 휴대번호
    LCW_ADDR: `${v.istRnadr} ${v.istRdadr}`, // 설치자 주소
    prdtNm: v.pdAbbrNm, // 상품명
    setDt: !isEmpty(v.canDt) ? stringUtil.getDateFormat(v.istDt, '-') : '', // 설치일자
    cancelDt: !isEmpty(v.canDt) ? stringUtil.getDateFormat(v.canDt, '-') : '', // 취소일자
    contDesc: !isEmpty(v.canCn) ? v.canCn : '', // 취소내용
  }));

  // console.log(cachedParams);
  const pritChpr = `${userInfo.userName}(${userInfo.employeeIDNumber})`; // 조회계정정보
  const srchPerd = `${stringUtil.getDateFormat(cachedParams.canStrtDt, 'YYYY.MM.DD')}  ~ ${stringUtil.getDateFormat(cachedParams.canEndDt, 'YYYY.MM.DD')}`; // 취소일자
  const codeNm = codes.PDGRP_ACD.filter((x) => cachedParams.pdGbn.includes(x.codeId)); // 조회상품구분
  const srchDiv = !isEmpty(codeNm) ? codeNm[0].codeName : t('MSG_TXT_ALL');

  console.log(codeNm);
  console.log(srchDiv);
  await openReportPopup(
    '/kstation-w/acrs/cancelCust.ozr',
    null,
    JSON.stringify(
      {
        jsondata: JSON.stringify(mapRes),
        pritChpr,
        srchPerd,
        srchDiv,
      },
    ),
  );
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridSoleDistributorCanCntrList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogCd' }, // 소속
    { fieldName: 'hooPrtnrNm' }, // 본부장명
    { fieldName: 'hooPrtnrNmMsk' }, // 본부장명 마스킹
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약 일련번호
    { fieldName: 'cstKnm' }, // 계약자 한글명
    { fieldName: 'cstKnmMsk' }, // 계약자 한글명 마스킹
    { fieldName: 'telNo' }, // 설치자 휴대전화번호
    { fieldName: 'telNoMsk' }, // 설치자 휴대전화번호 마스킹
    { fieldName: 'istCralLocaraTno' }, // 설치자 휴대전화번호1
    { fieldName: 'istMexnoEncr' }, // 설치자 휴대전화번호2
    { fieldName: 'istCralIdvTno' }, // 설치자 휴대전화번호3
    { fieldName: 'istAdrZip' }, // 설치자정보 우편번호
    { fieldName: 'istaddr' }, // 설치자정보 주소
    { fieldName: 'istRnadr' }, // 설치자정보 기준주소
    { fieldName: 'istRdadr' }, // 설치자정보 상세주소
    { fieldName: 'istRdadrMsk' }, // 설치자정보 상세주소 마스킹
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
    { fieldName: 'hooPrtnrNmMsk', styleName: 'text-center', header: t('MSG_TXT_GNR_MNG'), width: '96' }, // 본부장
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '132', styleName: 'text-center' },
    { fieldName: 'cstKnmMsk', styleName: 'text-center', header: t('MSG_TXT_CST_NM'), width: '96' }, // 고객
    {
      fieldName: 'telNoMsk',
      header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_MPNO')}`,
      width: '178',
      styleName: 'text-center',
    },
    {
      fieldName: 'istaddr',
      header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_ADDR')}`,
      width: '432',
      displayCallback(grid, index) {
        const { istRnadr, istRdadrMsk } = grid.getValues(index.itemIndex);
        return `${istRnadr} ${istRdadrMsk}`; // 기준주소 + 상세주소 마스킹
      },
    },
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
