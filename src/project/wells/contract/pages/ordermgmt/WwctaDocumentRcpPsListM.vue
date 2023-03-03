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
    <template #header>
      <kw-page-header :options="['홈', '판매', '계약관리', '서류접수현황']" />
    </template>
    <kw-search @search="onClickSearch">
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
            :options="codes.CNTR_CH_PRGS_STAT_CD"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
        <!-- 접수유형 -->
        <kw-search-item :label="$t('MSG_TXT_RCP_TP')">
          <kw-select
            v-model="searchParams.cntrChTpCd"
            :options="[{ codeId: '1', codeName: '개명신청' },
                       { codeId: '2', codeName: '자동이체 변경' },
                       { codeId: '3', codeName: '명의 변경' },
                       { codeId: '4', codeName: '해지/철회신청' }]"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 접수번호 -->
        <kw-search-item :label="$t('MSG_TXT_RCPT_NO')">
          <kw-input
            v-model="searchParams.cntrChRcpId"
            :maxlength="15"
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
          <kw-select
            v-model="searchParams.cralLocapaTno"
            :model-value="[]"
            :options="['선택', '010', '011', '017']"
            class="w120"
          />
          <kw-input
            v-model="searchParams.cralMexnoIdvTno"
            :maxlength="8"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="pageInfo.totalCount" />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!totalCount"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, gridUtil, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();

// @todo: update to 0 on api integration
let cachedParams;
const now = dayjs();
const searchParams = ref({
  cntrChRcpStrtDtm: now.subtract(7, 'day').format('YYYYMMDD'),
  cntrChRcpFinsDtm: now.format('YYYYMMDD'),
  cntrChPrgsStatCd: 'ALL',
  cntrChTpCd: 'ALL',
  cntrChRcpId: '',
  cstKnm: '',
  cralLocapaMexnoIdvTno: '',
  cralLocapaTno: '010',
  cralMexnoIdvTno: '',
});
const pageInfo = ref({
  totalCount: 0,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes(
  'CNTR_CH_PRGS_STAT_CD', // 계약변경진행상태코드
);

async function fetchData() {
  // changing api & cacheparams according to search classification
  searchParams.value.cralLocapaMexnoIdvTno = searchParams.value.cralLocapaTno + searchParams.value.cralMexnoIdvTno;
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/document-receipts', { params: cachedParams });

  // const { list: accounts } = res.data;
  // console.log(res.data);

  const view = grdMainRef.value.getView();
  // view.getDataSource().setRows(accounts);
  view.getDataSource().setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: 'documentRcpPsList',
    timePostfix: true,
  });
}

onMounted(async () => {
  // await fetchData();
});

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrChRcpId' },
    { fieldName: 'cntrChRcpD' },
    { fieldName: 'cntrChRcpTm' },
    { fieldName: 'cntrChPrgsStatCd' },
    { fieldName: 'cntrChPrgsStatCdEnd' },
    { fieldName: 'cstKnm' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'cntrChTypeCd' },
    { fieldName: 'fnlMdfcDtm' },
  ];

  const columns = [
    { fieldName: 'cntrChRcpId', header: t('MSG_TXT_RCPT_NO'), width: '166', styleName: 'text-center' }, // 접수번호
    { fieldName: 'cntrChRcpD', header: t('MSG_TXT_RCP_D'), width: '166', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일
    { fieldName: 'cntrChRcpTm', header: t('MSG_TXT_RCPT_HH'), width: '166', styleName: 'text-center', datetimeFormat: 'hh:mm' }, // 접수시간
    { fieldName: 'cntrChPrgsStatCd', header: t('MSG_TXT_RCP_PS'), width: '166', styleName: 'text-left' }, // 접수현황
    { fieldName: 'cntrChPrgsStatCdEnd', header: t('MSG_TXT_ETC_END'), width: '166', styleName: 'text-center' }, // 기타종료
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '166', styleName: 'text-left' }, // 고객명
    {
      fieldName: 'cralLocaraTno',
      name: 'mpno',
      header: t('MSG_TXT_MPNO'),
      styleName: 'text-center',
      width: '128',

      displayCallback(grid, index, value) {
        const mpno1 = value;
        const mpno2 = grid.getValue(index.itemIndex, 'mexnoEncr');
        const mpno3 = grid.getValue(index.itemIndex, 'cralIdvTno');

        if (!isEmpty(mpno1) && !Number.isNaN(mpno1)
            && !isEmpty(mpno2) && !Number.isNaN(mpno2)
            && !isEmpty(mpno3) && !Number.isNaN(mpno3)) {
          return `${mpno1}-${mpno2}-${mpno3}`;
        }
        return '';
      },
    }, // 휴대전화번호
    { fieldName: 'cntrChTypeCd', header: t('MSG_TXT_RCP_TP_1'), width: '166', styleName: 'text-left' }, // 접수유형1
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_RCP_TP_2'), width: '166', styleName: 'text-center' }, // 접수유형2
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});
</script>
<style>
</style>
