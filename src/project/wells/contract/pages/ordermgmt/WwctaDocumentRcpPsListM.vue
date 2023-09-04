<!-- eslint-disable max-len -->
<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaDocumentRcpPsListM - 서류접수현황(추가)
3. 작성자 : jihoon.kim
4. 작성일 : 2023.02.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 업무요청시 증빙서류가 필요한 건에 대한 관리화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 접수일자 -->
        <kw-search-item :label="$t('MSG_TXT_RCP_D')">
          <kw-date-range-picker
            v-model:from="searchParams.cntrChRcpStrtDtm"
            v-model:to="searchParams.cntrChRcpFinsDtm"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <!-- 접수현황 -->
        <kw-search-item :label="$t('MSG_TXT_RCP_PS')">
          <kw-select
            v-model="searchParams.cntrChPrgsStatCd"
            :options="[{ codeId: '10', codeName: t('MSG_TXT_RCP_STNB') },
                       { codeId: '20', codeName: t('MSG_TXT_RCP_CPLT') },
                       { codeId: '40', codeName: t('MSG_TXT_BIZ_IN_PRGS') },
                       { codeId: '19', codeName: t('MSG_TXT_RE_REG') },
                       { codeId: '29', codeName: t('MSG_TXT_RE_REG_CPLT') },
                       { codeId: '50', codeName: t('MSG_TXT_PROCS_FSH') },
                       { codeId: '99', codeName: t('MSG_TXT_ETC_END') }]"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
        <!-- 접수유형 -->
        <kw-search-item :label="$t('MSG_TXT_RCP_TP')">
          <kw-select
            v-model="searchParams.cntrChTpCd"
            :options="codes.CNTR_CH_TP_CD.filter((v)=> v.codeId === '104' || v.codeId === '301' || v.codeId === '103' || v.codeId === '401')"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 접수번호 -->
        <kw-search-item :label="$t('MSG_TXT_RCPT_NO')">
          <kw-input
            v-model="searchParams.cntrChRcpId"
            :maxlength="15"
            regex="num"
          />
        </kw-search-item>
        <!-- 고객명 -->
        <kw-search-item :label="$t('MSG_TXT_CST_NM')">
          <kw-input
            v-model="searchParams.cstKnm"
            :maxlength="50"
          />
        </kw-search-item>
        <!-- 휴대전화번호 -->
        <kw-search-item :label="$t('MSG_TXT_MPNO')">
          <kw-input
            v-model:model-value="searchParams.cntrCralTno"
            v-model:telNo0="searchParams.cralLocaraTno"
            v-model:telNo1="searchParams.mexnoEncr"
            v-model:telNo2="searchParams.cralIdvTno"
            :placeholder="t('MSG_TXT_INP')"
            mask="telephone"
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
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMainRef"
        :visible-rows="pageInfo.pageSize"
        @init="initGrid"
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
import { defineGrid, getComponentType, useDataService, useGlobal, gridUtil, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const { modal } = useGlobal();
const { currentRoute } = useRouter();

let cachedParams;
const now = dayjs();
const searchParams = ref({
  cntrChRcpStrtDtm: now.subtract(7, 'day').format('YYYYMMDD'),
  cntrChRcpFinsDtm: now.format('YYYYMMDD'),
  cntrChPrgsStatCd: '',
  cntrChTpCd: '',
  cntrChRcpId: '',
  cstKnm: '',
  cntrCralTno: '', // 계약자 휴대전화번호
  cralLocaraTno: '', // 계약자 휴대지역전화번호
  mexnoEncr: '', // 계약자 휴대전화국번호암호화
  cralIdvTno: '', // 계약자 휴대개별전화번호
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'CNTR_CH_TP_CD', // 계약변경유형코드
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  // 환경변수에서 기본설정값 받아오는 코드 현재 CFG_CMZ_DEFAULT_PAGE_SIZE 기본값:10
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  // console.log(cachedParams);
  res = await dataService.get('/sms/wells/contract/document-receipts/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  console.log(res.data);

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(pages);
  // pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 초기화버튼 클릭 이벤트
async function onClickReset() {
  searchParams.value.cntrCralTno = ''; // 계약자 휴대전화번호
  searchParams.value.cralLocaraTno = ''; // 계약자 휴대지역전화번호
  searchParams.value.mexnoEncr = ''; // 계약자 휴대전화국번호암호화
  searchParams.value.cralIdvTno = ''; // 계약자 휴대개별전화번호
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/contract/document-receipts/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrChRcpId' }, // 접수번호
    { fieldName: 'reCntrChRcpId' }, // 재접수번호
    { fieldName: 'cntrChRcpD' }, // 접수일
    { fieldName: 'cntrChRcpTm' }, // 접수시간
    { fieldName: 'cntrChPrgsStatCd' }, // 접수현황코드
    { fieldName: 'cntrChPrgsStatNm' }, // 접수현황코드명
    { fieldName: 'cntrChPrgsStatCdEnd' }, // 기타종료코드
    { fieldName: 'cntrChPrgsStatNmEnd' }, // 기타종료코드명
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'cralLocaraTno' }, // 휴대지역전화번호
    { fieldName: 'mexnoEncr' }, // 휴대전화국번호암호화
    { fieldName: 'cralIdvTno' }, // 휴대개별전화번호
    { fieldName: 'cralTno' }, // 휴대전화번호
    { fieldName: 'cntrChTpCd' }, // 접수유형
    { fieldName: 'cntrChTpNm' }, // 접수유형명
  ];

  const columns = [
    { fieldName: 'reCntrChRcpId', header: t('MSG_TXT_RCPT_NO'), width: '166', styleName: 'text-center' }, // 접수번호
    { fieldName: 'cntrChRcpD', header: t('MSG_TXT_RCP_D'), width: '166', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일
    { fieldName: 'cntrChRcpTm', header: t('MSG_TXT_RCPT_HH'), width: '166', styleName: 'text-center', datetimeFormat: 'hh:mm:ss' }, // 접수시간
    { fieldName: 'cntrChPrgsStatNm', header: t('MSG_TXT_RCP_PS'), width: '166', styleName: 'text-center' }, // 접수현황
    { fieldName: 'cntrChPrgsStatNmEnd', header: t('MSG_TXT_ETC_END'), width: '166', styleName: 'text-left' }, // 기타종료
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '166', styleName: 'text-center' }, // 고객명
    {
      fieldName: 'cralTno',
      name: 'mpno',
      header: t('MSG_TXT_MPNO'),
      styleName: 'text-center',
      width: '128',
    }, // 휴대전화번호
    { fieldName: 'cntrChTpNm', header: t('MSG_TXT_RCP_TP'), width: '166', styleName: 'text-center' }, // 접수유형
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.onCellDblClicked = async (g, { dataRow }) => {
    const paramCntrChRcpId = gridUtil.getCellValue(g, dataRow, 'cntrChRcpId'); // 접수번호
    const paramCntrChTpCd = gridUtil.getCellValue(g, dataRow, 'cntrChTpCd'); // 접수유형

    const res = await modal({
      component: 'WwctaDocumentRcpDtlMgtP',
      componentProps: { cntrChRcpId: paramCntrChRcpId,
        cntrChTpCd: paramCntrChTpCd },
    });
    if (res.result) fetchData();
  };
});
</script>
<style>
</style>
