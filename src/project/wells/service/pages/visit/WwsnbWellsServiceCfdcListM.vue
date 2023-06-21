<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [W-SV-U-0081M01] WwsnbWellsServiceCfdcListM - 웰스 서비스 확인서
3. 작성자 : yeongjoong.kim
4. 작성일 : 2023.06.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 웰스 서비스 확인서 발송 기능
- 웰스 서비스 확인서 발송을 위한 주문내역 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_CST_CHO')">
          <!--고객선택-->
          <kw-select
            v-model="searchParams.searchType"
            :options="searchTypes"
            class="w147"
            @change="onChangeSearchType"
          />
          <kw-input v-model="searchParams.searchParam1" />
          <kw-input
            v-show="searchParams.searchType === '7'"
            v-model="searchParams.searchParam2"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PRD')">
          <!--기간-->
          <kw-date-range-picker
            v-model:from="searchParams.fromDate"
            v-model:to="searchParams.toDate"
            rules="date_range_required|date_range_months:3"
            :name="$t('MSG_TXT_PRD')"
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
          icon="print"
          secondary
          dense
          :label="t('MSG_BTN_PRTG')"
        />
        <kw-btn
          icon="download_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_TXT_SERVICE_CONFIRM_SEND')"
          primary
          dense
          @click="onClickSendServiceCfdc"
        /><!--서비스확인서 발송-->
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize"
        @init="initGrdMain"
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
import { useDataService, useMeta, codeUtil, gridUtil, alert } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const now = dayjs();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchTypes = ref([
  { codeId: '1', codeName: '계약상세번호' }, // 계약상세번호
  { codeId: '2', codeName: '고객번호' }, // 고객번호
  { codeId: '3', codeName: '계약자명' }, // 계약자명
  { codeId: '4', codeName: '계약자전화번호' }, // 계약자전화번호
  { codeId: '5', codeName: '계약자사업자번호' }, // 계약자사업자번호
  { codeId: '6', codeName: '판매자사번' }, // 판매자사번
  { codeId: '7', codeName: '조직코드' }, // 조직코드
]);

const grdMainRef = ref();

let cachedParams;
const searchParams = ref({
  fromDate: now.subtract(30, 'day').format('YYYYMMDD'),
  toDate: now.format('YYYYMMDD'),
  searchType: '1',
  searchParam1: '',
  searchParam2: '',
  searchParam3: '',
  searchParam4: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const { data: { list, pageInfo: pageInfoObj } } = await dataService.get('sms/wells/service/wells-service-cfdc/paging', { params: { ...cachedParams, ...pageInfo.value } });

  list.forEach((row) => {
    if (row.cralLocaraTno && row.mexnoEncr && row.cralIdvTno) { row.mobileTno = `${row.cralLocaraTno}-${row.mexnoEncr}-${row.cralIdvTno}`; }
    if (row.locaraTno && row.exnoEncr && row.idvTno) { row.homeTno = `${row.locaraTno}-${row.exnoEncr}-${row.idvTno}`; }
  });

  pageInfo.value = pageInfoObj;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

async function onClickSearch() {
  if (searchParams.value.searchType === '4') {
    const numbers = searchParams.value.searchParam1.split('-');
    searchParams.value.searchParam2 = numbers.length > 0 ? numbers[0] : '';
    searchParams.value.searchParam3 = numbers.length > 1 ? numbers[1] : '';
    searchParams.value.searchParam4 = numbers.length > 2 ? numbers[2] : '';
  }

  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

function onChangeSearchType() {
  searchParams.value.searchParam2 = '';
  searchParams.value.searchParam3 = '';
  searchParams.value.searchParam4 = '';
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

async function onClickSendServiceCfdc() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    alert(t('MSG_ALT_NOT_SEL_ITEM'));
  }

  alert(t('W-SV-U-0081P01 웰스 서비스확인서발송 팝업 호출'));
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

async function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'cntrCstNo' },
    { fieldName: 'asnOjYm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntr' },
    { fieldName: 'sellPrtnrNo' },
    { fieldName: 'ogCd' },
    { fieldName: 'svpdNmAbbr1' },
    { fieldName: 'cntrKnm' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'locaraTno' },
    { fieldName: 'exnoEncr' },
    { fieldName: 'idvTno' },
    { fieldName: 'bzrno' },
    { fieldName: 'installKnm' },
    { fieldName: 'adr' },
    { fieldName: 'wkExcnDt' },
    { fieldName: 'clsfCdSrnPrntCn' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'baseYm' },
    { fieldName: 'nm' },

    { fieldName: 'mobileTno' }, // 휴대전화
    { fieldName: 'homeTno' }, // 전화번호
  ];

  const columns = [
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center', editable: false }, // 고객번호
    { fieldName: 'cntr', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center', editable: false }, // 계약상세번호
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_SELLER_ID'), width: '100', styleName: 'text-center', editable: false }, // 판매자사번
    { fieldName: 'ogCd', header: t('MSG_TXT_SELLER_BLG'), width: '100', styleName: 'text-center', editable: false }, // 판매자소속
    { fieldName: 'svpdNmAbbr1', header: t('MSG_TXT_PRDT_NM'), width: '150', styleName: 'text-left', editable: false }, // 상품명
    { fieldName: 'cntrKnm', header: t('MSG_TXT_CNTOR_NM'), width: '100', styleName: 'text-left', editable: false }, // 계약자명
    { fieldName: 'mobileTno', header: t('MSG_TXT_CNTRT_CPHON_NO'), width: '150', styleName: 'text-center', editable: false }, // 계약자휴대전화번호
    { fieldName: 'homeTno', header: t('MSG_TXT_CNTRT_TNO'), width: '150', styleName: 'text-center', editable: false }, // 계약자전화번호
    { fieldName: 'bzrno', header: t('MSG_TXT_CNTRT_ENTRP_NO'), width: '120', styleName: 'text-center', editable: false }, // 계약자사업자번호
    { fieldName: 'installKnm', header: t('MSG_TXT_IST_NM'), width: '100', styleName: 'text-left', editable: false }, // 설치자명
    { fieldName: 'adr', header: t('MSG_TXT_ISTLC_ADDR'), width: '350', styleName: 'text-left', editable: false }, // 설치처 주소
    { fieldName: 'wkExcnDt', header: t('MSG_TXT_MNGT_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false }, // 관리일자
    { fieldName: 'clsfCdSrnPrntCn', header: t('MSG_TXT_MNGT_IZ'), width: '200', styleName: 'text-left', editable: false }, // 관리내역
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PIC'), width: '70', styleName: 'text-left' }, // 담당자
    { fieldName: 'nm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-left' }, // 성명
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  await onClickSearch();
}

</script>
<style lang="scss" scoped>
</style>
