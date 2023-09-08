<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteSiteAuditSellListM - 현장감사 판매리스트
3. 작성자 : joonghyung.kim
4. 작성일 : 2023.05.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- wells 현장감사 판매리스트 기준(고객코드별 판매내역) - 보고서
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      ref="srchMainRef"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OG_DV')"
          :colspan="2"
        >
          <!-- 총괄단 선택 -->
          <kw-select
            v-model="selectedDgr1LevlOgCds"
            class="select_og_cd"
            :placeholder="$t('MSG_TXT_MANAGEMENT_DEPARTMENT') + ' ' + $t('MSG_TXT_SELT')"
            :options="filteredDgr1LevlOgCds"
            option-value="dgr1LevlOgCd"
            option-label="dgr1LevlOgNm"
            first-option="all"
            :first-option-label="$t('MSG_TXT_ALL')"
            first-option-value=""
            @update:model-value="onUpdateDgr1Levl"
          />
          <!-- 지역단 선택 -->
          <kw-select
            v-model="selectedDgr2LevlOgCds"
            class="select_og_cd"
            :placeholder="$t('MSG_TXT_RGNL_GRP') + ' ' + $t('MSG_TXT_SELT')"
            :options="filteredDgr2LevlOgCds"
            option-value="dgr2LevlOgCd"
            option-label="dgr2LevlOgNm"
            first-option="all"
            :first-option-label="$t('MSG_TXT_ALL')"
            first-option-value=""
            @update:model-value="onUpdateDgr2Levl"
          />
          <!-- 지점 선택 -->
          <kw-select
            v-model="selectedDgr3LevlOgCds"
            class="select_og_cd"
            :placeholder="$t('MSG_TXT_BRANCH') + ' ' + $t('MSG_TXT_SELT')"
            :options="filteredDgr3LevlOgCds"
            option-value="dgr3LevlOgCd"
            option-label="dgr3LevlOgNm"
            first-option="all"
            :first-option-label="$t('MSG_TXT_ALL')"
            first-option-value=""
          />
        </kw-search-item>

        <!-- 파트너 검색 -->
        <kw-search-item
          :label="$t('MSG_TIT_PRTNR_SEA')"
        >
          <kw-input
            v-model="searchParams.sellPrtnrNo"
            icon="search"
            clearable
            @click-icon="onClickOpenPartnerListPopup"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PRD')"
          :colspan="2"
          required
        >
          <kw-select
            v-model="searchParams.ptrmDv"
            :options="periodOptions"
            style="max-width: 33%;"
            required
          />
          <kw-date-range-picker
            v-model:from="searchParams.dtStrt"
            v-model:to="searchParams.dtEnd"
            :label="$t('MSG_TXT_PRD')"
            :from-placeholder="$t('MSG_TXT_START_DATE')"
            :to-placeholder="$t('MSG_TXT_END_DATE')"
            rules="date_range_required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_STAT_DV')"
        >
          <kw-select
            v-model="searchParams.cntrStatCd"
            :options="codes.CNTR_DTL_STAT_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SEL_TYPE')"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_SELL_TP_DTL_CD')"
        >
          <kw-select
            v-model="searchParams.sellTpDtlCd"
            :options="codes.SELL_TP_DTL_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('TXT_MSG_PD_MCLSF_ID')"
        >
          <kw-select
            v-model="searchParams.pdMclsfId"
            :placeholder="$t('MSG_TXT_ALL')"
            :options="codesMiddleClasses"
            option-value="refPdClsfVal"
            option-label="pdClsfNm"
            first-option="all"
            :first-option-label="$t('MSG_TXT_ALL')"
            first-option-value=""
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
            @change="fetchData"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_CASES') }}</span>
        </template>

        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount===0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="pageInfo.pageSize - 1"
        @init="initGrid"
      />
      <kw-grid
        v-show="isShow"
        ref="grdExcelRef"
        name="grdExcel"
        @init="initGridExcel"
      />
    </div>
  </kw-page>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useMeta, useGlobal, getComponentType, codeUtil, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { modal } = useGlobal();
const { getConfig } = useMeta();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const srchMainRef = ref(getComponentType('KwSearch'));
const grdMainRef = ref(getComponentType('KwGrid'));
const grdExcelRef = ref(getComponentType('KwGrid'));
const isShow = ref(false);

const codes = await codeUtil.getMultiCodes(
  'CNTR_DTL_STAT_CD',
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

// 조직코드 조회
const codesDgr1Levl = ref([]);
const codesDgr2Levl = ref([]);
const codesDgr3Levl = ref([]);

const filteredDgr1LevlOgCds = ref([]); // 필터링된 총괄단 코드
const filteredDgr2LevlOgCds = ref([]); // 필터링된 지역단 코드
const filteredDgr3LevlOgCds = ref([]); // 필터링된 지점 코드

const selectedDgr1LevlOgCds = ref([]); // 선택한 총괄단 코드
const selectedDgr2LevlOgCds = ref([]); // 선택한 지역단 코드
const selectedDgr3LevlOgCds = ref([]); // 선택한 지점 코드

// 상품 중분류
const codesMiddleClasses = ref([]);

const periodOptions = [
  { codeId: '1', codeName: t('MSG_TXT_RCPDT') },
  { codeId: '2', codeName: t('MSG_TXT_IST_DT') },
];

async function getInitInfos() {
  let res = [];
  res = await dataService.get('/sms/wells/contract/partners/general-divisions'); // 총괄단
  codesDgr1Levl.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/regional-divisions'); // 지역단
  codesDgr2Levl.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/branch-divisions'); // 지점
  codesDgr3Levl.value = res.data;

  // 총괄단 조직코드 초기화
  filteredDgr1LevlOgCds.value = codesDgr1Levl.value;

  // 상품 중분류 초기화
  res = await dataService.get('/sms/wells/contract/product/middle-classes'); // 상품중분류 조회
  codesMiddleClasses.value = res.data;
}
getInitInfos();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 조회 파라미터
let cachedParams;
const searchParams = ref({
  dgr1LevlOgCd: '',
  dgr2LevlOgCd: '',
  dgr3LevlOgCd: '',
  sellPrtnrNo: '',
  ptrmDv: '1',
  dtStrt: '',
  dtEnd: '',
  cntrStatCd: '',
  sellTpCd: '',
  sellTpDtlCd: '',
  pdMclsfId: '',
});

// 조직코드 총괄단 변경 이벤트
async function onUpdateDgr1Levl(selectedValues) {
  // 선택한 지역단, 지점 초기화
  selectedDgr2LevlOgCds.value = [];
  selectedDgr3LevlOgCds.value = [];

  // 지역단 코드 필터링. 선택한 총괄단의 하위 지역단으로 필터링
  filteredDgr2LevlOgCds.value = codesDgr2Levl.value.filter((v) => selectedValues.includes(v.dgr1LevlOgCd));

  // 지점 코드 초기화
  filteredDgr3LevlOgCds.value = [];
}

// 조직코드 지역단 변경 이벤트
async function onUpdateDgr2Levl(selectedValues) {
  // 선택한 지점 초기화
  selectedDgr3LevlOgCds.value = [];

  // 지점 코드 필터링. 선택한 지역단의 하위 지점으로 필터링.
  filteredDgr3LevlOgCds.value = codesDgr3Levl.value.filter((v) => selectedValues.includes(v.dgr2LevlOgCd));
}

// 파트너 조회 팝업
async function onClickOpenPartnerListPopup() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.sellPrtnrNo,
    },
  });
  if (result) {
    searchParams.value.sellPrtnrNo = payload.prtnrNo;
  }
}

// 조회
async function fetchData() {
  // 조회 전 필수체크 (페이징사이즈 변경시 필요함.)
  if (!await srchMainRef.value.validate()) { return; }

  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/contract/site-audit/sells', { params: cachedParams });
  const { list: sellResult, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  view.getDataSource().checkRowStates(false);
  view.getDataSource().addRows(sellResult);
  view.getDataSource().checkRowStates(true);
}

// 조회 버튼 클릭
async function onClickSearch() {
  // 선택한 조직 코드에 해당하는 조직 ID 세팅
  searchParams.value.dgr1LevlOgCd = codesDgr1Levl.value
    .find((v) => selectedDgr1LevlOgCds.value.includes(v.dgr1LevlOgCd))
    ?.dgr1LevlOgCd || ''; // undefined 인 경우, emptry string 로 변경
  searchParams.value.dgr2LevlOgCd = codesDgr2Levl.value
    .find((v) => selectedDgr2LevlOgCds.value.includes(v.dgr2LevlOgCd))
    ?.dgr2LevlOgCd || '';
  searchParams.value.dgr3LevlOgCd = codesDgr3Levl.value
    .find((v) => selectedDgr3LevlOgCds.value.includes(v.dgr3LevlOgCd))
    ?.dgr3LevlOgCd || '';

  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  // 재조회시 초기화
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows([]);

  await fetchData();
}

const { currentRoute } = useRouter();

// 엑셀다운로드 버튼 클릭
async function onClickExcelDownload() {
  const view = grdExcelRef.value.getView();

  const res = await dataService.get('/sms/wells/contract/site-audit/sells/excel-download', { params: cachedParams });

  view.getDataSource().setRows(res.data);
  view.resetCurrent();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName, // 메뉴명으로 다운로드 엑셀 파일명 세팅
    timePostfix: true, // 엑셀 파일명에 _YYYYMMDDHHMISS 붙여줌
    exportData: res.data, // 현재 그리드에 보여지는 데이터가 아닌 전체 데이터 다운로드 시 사용
    searchCondition: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'dgr1LevlOgCd' },
    { fieldName: 'dgr2LevlOgCd' },
    { fieldName: 'dgr3LevlOgCd' },
    { fieldName: 'perfCnt', dataType: 'number', numberFormat: '#,##0' },
  ];

  const columns = [
    { fieldName: 'dgr1LevlOgCd', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '312', styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '300', styleName: 'text-center' },
    { fieldName: 'dgr3LevlOgCd', header: t('MSG_TXT_BRANCH'), width: '299', styleName: 'text-center' },
    { fieldName: 'perfCnt', header: t('MSG_TXT_PERF'), width: '200', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([]);

  view.onScrollToBottom = (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      fetchData();
    }
  };
}

function initGridExcel(data, view) {
  const fields = [
    { fieldName: 'dgr1LevlOgCd' },
    { fieldName: 'dgr1LevlDgPrtnrNo' },
    { fieldName: 'dgr1LevlDgPrtnrNm' },
    { fieldName: 'dgr2LevlOgCd' },
    { fieldName: 'dgr2LevlDgPrtnrNo' },
    { fieldName: 'dgr2LevlDgPrtnrNm' },
    { fieldName: 'bldNm' },
    { fieldName: 'bldCd' },
    { fieldName: 'ogCd' },
    { fieldName: 'sellPrtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'pstnDvCd' },
    { fieldName: 'dgr3LevlDgPrtnrNo' },
    { fieldName: 'dgr3LevlDgPrtnrNm' },
    { fieldName: 'fstCntrDt' },
    { fieldName: 'rcntrDt' },
    { fieldName: 'cltnDt' },
    { fieldName: 'cntrTpCd' },
    { fieldName: 'cntrTpNm' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'sellTpNm' },
    { fieldName: 'mchnChReIstGbn' },
    { fieldName: 'dtlCntrNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'copnDvCd' },
    { fieldName: 'bryyBzrno' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'alncmpCd' },
    { fieldName: 'cntrCnfmDt' },
    { fieldName: 'istDt' },
    { fieldName: 'cntrPdEnddt' },
    { fieldName: 'reqdDt' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'cstRgstDt' },
    { fieldName: 'sellAmt', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'ackmtPerfAmt', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'ackmtPerfRt', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'booSellTpYn' },
    { fieldName: 'dlqMcn' },
    { fieldName: 'eotDlqAmt', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'initDqmYm' },
    { fieldName: 'dpTotAmt', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'eotUcAmt', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'slStpYn' },
    { fieldName: 'rentalTn' },
    { fieldName: 'cntrAmt', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'ramt', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'prchDv' },
    { fieldName: 'sellDscCd' },
    { fieldName: 'pmotCd' },
    { fieldName: 'ojDtlCntrNo' },
    { fieldName: 'ojCstKnm' },
    { fieldName: 'ojPdNm' },
    { fieldName: 'vlStrtDt' },
    { fieldName: 'vlEndDt' },
    { fieldName: 'bnkOwrKnm' },
    { fieldName: 'bnkNo' },
    { fieldName: 'bnkNm' },
    { fieldName: 'bnkMpyBsdt' },
    { fieldName: 'cdcoOwrKnm' },
    { fieldName: 'cdcoNo' },
    { fieldName: 'cdcoNm' },
    { fieldName: 'cdcoMpyBsdt' },
    { fieldName: 'pdHclsfNm' },
    { fieldName: 'pdMclsfNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdqty', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'subscAmt', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'mmIstmAmt', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'istmMcn', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'cashTotAmt', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'cardTotAmt1', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'crcdnoEncr1' },
    { fieldName: 'cdcoNm1' },
    { fieldName: 'cdcoOwrKnm1' },
    { fieldName: 'crdcdIstmMcn1', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'cardTotAmt2', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'crcdnoEncr2' },
    { fieldName: 'cdcoNm2' },
    { fieldName: 'cdcoOwrKnm2' },
    { fieldName: 'crdcdIstmMcn2', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'initBlam', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'nowBlam', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'blam1', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'blam2', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'blam3', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'blam4', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'buNotiDt' },
    { fieldName: 'buPrtnrNo' },
    { fieldName: 'buPrtnrNm' },
    { fieldName: 'buPstnDvCd' },
    { fieldName: 'cntrCltnYn' },
    { fieldName: 'buCltnDt' },
    { fieldName: 'cntrLocaraTno' },
    { fieldName: 'cntrExno' },
    { fieldName: 'cntrIdvTno' },
    { fieldName: 'cntrCralLocaraTno' },
    { fieldName: 'cntrMexnoEncr' },
    { fieldName: 'cntrCralIdvTno' },
    { fieldName: 'locaraTno' },
    { fieldName: 'exnoEncr' },
    { fieldName: 'idvTno' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'cntrAdr' },
    { fieldName: 'cntrDtlAdr' },
    { fieldName: 'adr' },
    { fieldName: 'dtlAdr' },
    { fieldName: 'initAdr' },
    { fieldName: 'initDtlAdr' },
  ];

  const columns = [
    { fieldName: 'dgr1LevlOgCd', header: t('MSG_TXT_GNRDV_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'dgr1LevlDgPrtnrNo', header: t('MSG_TXT_GNLR_LEDR_SBN'), width: '100', styleName: 'text-center' },
    { fieldName: 'dgr1LevlDgPrtnrNm', header: t('MSG_TXT_GEN_MNGT_GRP_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'dgr2LevlDgPrtnrNo', header: t('MSG_TXT_REG_DIR'), width: '100', styleName: 'text-center' },
    { fieldName: 'dgr2LevlDgPrtnrNm', header: t('MSG_TXT_REG_DIR'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_SELLER_ID'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_RSB'), width: '100', styleName: 'text-center' },
    { fieldName: 'dgr3LevlDgPrtnrNo', header: t('MSG_TXT_BRNCH_MNGR_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'dgr3LevlDgPrtnrNm', header: t('MSG_TXT_BRMGR'), width: '100', styleName: 'text-center' },
    {
      fieldName: 'fstCntrDt',
      header: `${t('MSG_TXT_SELLER_PERSON')} ${t('MSG_TXT_FST_RGST')}`,
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'rcntrDt',
      header: `${t('MSG_TXT_SELLER_PERSON')} ${t('MSG_TXT_RETR_D')}`,
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'cltnDt',
      header: `${t('MSG_TXT_SELLER_PERSON')} ${t('MSG_TXT_CLTN_D')}`,
      width: '100',
      styleName: 'text-center',
    },
    { fieldName: 'cntrTpCd', header: t('MSG_TXT_CNTR_TP_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrTpNm', header: t('MSG_TXT_CONTR_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SELL_TP_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'mchnChReIstGbn', header: t('MSG_TXT_CHG_RLS'), width: '100', styleName: 'text-center' },
    { fieldName: 'dtlCntrNo', header: t('MSG_TXT_CST_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_APPL_USER'), width: '100', styleName: 'text-center' },
    { fieldName: 'copnDvCd', header: t('MSG_TXT_INDV_CRP_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'bryyBzrno', header: t('MSG_TXT_BRYY_MMDD_ENTRP_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_INSTR'), width: '100', styleName: 'text-center' },
    { fieldName: 'alncmpCd', header: t('MSG_TXT_ALNC_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrCnfmDt', header: t('MSG_TXT_RCPDT'), width: '100', styleName: 'text-center' },
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrPdEnddt', header: t('MSG_TXT_CANC_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'reqdDt', header: t('MSG_TXT_DEM_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_KWK'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstRgstDt', header: t('MSG_TXT_KWK') + t('MSG_TXT_CRT_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellAmt', header: t('MSG_TXT_SALE_PRICE'), width: '100', styleName: 'text-right' },
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_PD_ACC_RSLT'), width: '100', styleName: 'text-right' },
    { fieldName: 'ackmtPerfRt', header: t('TXT_MSG_ACKMT_PERF_RT'), width: '100', styleName: 'text-right' },
    { fieldName: 'booSellTpYn', header: t('TXT_MSG_BOO_SELL_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '100', styleName: 'text-center' },
    { fieldName: 'eotDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right' },
    { fieldName: 'initDqmYm', header: t('MSG_TXT_FST_DLQ') + t('MSG_TXT_MON'), width: '100', styleName: 'text-center' },
    { fieldName: 'dpTotAmt', header: t('MSG_TXT_DP_AGG_AMT'), width: '100', styleName: 'text-right' },
    { fieldName: 'eotUcAmt', header: t('MSG_TXT_UC_AMT'), width: '100', styleName: 'text-right' },
    { fieldName: 'slStpYn', header: t('MSG_TXT_SL_STP'), width: '100', styleName: 'text-center' },
    { fieldName: 'rentalTn', header: t('MSG_TXT_USE_MCNT'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrAmt', header: t('MSG_TXT_RENT_RGST_FEE'), width: '100', styleName: 'text-right' },
    { fieldName: 'ramt', header: t('MSG_TXT_RTLFE'), width: '100', styleName: 'text-right' },
    { fieldName: 'prchDv', header: t('MSG_TXT_PRCH_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellDscCd', header: t('MSG_TXT_STPL_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pmotCd', header: t('MSG_TXT_PMOT_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'ojDtlCntrNo', header: t('MSG_TXT_CONN') + t('MSG_TXT_CST_CD'), width: '100', styleName: 'text-center' },
    {
      fieldName: 'ojCstKnm',
      header: t('MSG_TXT_CONN') + t('MSG_TXT_CODE_NAME') + t('MSG_TXT_CUSTOMER'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'ojPdNm',
      header: t('MSG_TXT_CONN') + t('MSG_TXT_CODE_NAME') + t('MSG_TXT_GOODS_NM'),
      width: '250',
      styleName: 'text-left',
    },
    {
      fieldName: 'vlStrtDt',
      header: t('MSG_TXT_CONN') + t('MSG_TXT_CODE_NAME') + t('MSG_TXT_KEEP_PTRM'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'vlEndDt',
      header: t('MSG_TXT_CONN') + t('MSG_TXT_CODE_NAME') + t('MSG_TXT_CANCEL') + t('MSG_TXT_PRD'),
      width: '150',
      styleName: 'text-center',
    },
    { fieldName: 'bnkOwrKnm', header: t('MSG_TXT_BNK_AC_OWN'), width: '100', styleName: 'text-center' },
    { fieldName: 'bnkNo', header: t('MSG_TXT_AC_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'bnkNm', header: t('MSG_TXT_BNK_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'bnkMpyBsdt', header: t('MSG_TXT_FNT_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'cdcoOwrKnm', header: t('MSG_TXT_AUTO_FNT') + t('MSG_TXT_CARD_STOCK'), width: '100', styleName: 'text-center' },
    { fieldName: 'cdcoNo', header: t('MSG_TXT_AUTO_FNT') + t('MSG_TXT_CARD_NO'), width: '300', styleName: 'text-center' },
    { fieldName: 'cdcoNm', header: t('MSG_TXT_AUTO_FNT') + t('MSG_TXT_CDCO'), width: '100', styleName: 'text-center' },
    { fieldName: 'cdcoMpyBsdt', header: t('MSG_TXT_FNT_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdHclsfNm', header: t('MSG_TXT_PD_HCLSF'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdMclsfNm', header: t('MSG_TXT_PD_MCLSF'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '300', styleName: 'text-left' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdqty', header: t('MSG_TXT_ENU'), width: '100', styleName: 'text-right' },
    { fieldName: 'subscAmt', header: t('MSG_TXT_SBSCM'), width: '100', styleName: 'text-right' },
    { fieldName: 'mmIstmAmt', header: t('MSG_TXT_MM_PY_AMT'), width: '100', styleName: 'text-right' },
    { fieldName: 'istmMcn', header: t('MSG_TXT_SNGL_PMNT') + t('TXT_MSG_ISTM_MCN'), width: '100', styleName: 'text-right' },
    { fieldName: 'cashTotAmt', header: t('MSG_TXT_CASH') + t('MSG_TXT_DEPOSIT_AMT'), width: '100', styleName: 'text-right' },
    { fieldName: 'cardTotAmt1', header: `${t('MSG_TXT_CARD')}${t('MSG_TXT_STLM_AMT')}1`, width: '100', styleName: 'text-right' },
    { fieldName: 'crcdnoEncr1', header: `${t('MSG_TXT_CARD_NO')}1`, width: '200', styleName: 'text-center' },
    { fieldName: 'cdcoNm1', header: `${t('MSG_TXT_CDCO')}1`, width: '100', styleName: 'text-center' },
    { fieldName: 'cdcoOwrKnm1', header: `${t('MSG_TXT_CARD_STOCK')}1`, width: '100', styleName: 'text-center' },
    { fieldName: 'crdcdIstmMcn1', header: `${t('MSG_TXT_ISTM')}1`, width: '100', styleName: 'text-right' },
    { fieldName: 'cardTotAmt2', header: `${t('MSG_TXT_CARD')}${t('MSG_TXT_STLM_AMT')}2`, width: '100', styleName: 'text-right' },
    { fieldName: 'crcdnoEncr2', header: `${t('MSG_TXT_CARD_NO')}2`, width: '200', styleName: 'text-center' },
    { fieldName: 'cdcoNm2', header: `${t('MSG_TXT_CDCO')}2`, width: '100', styleName: 'text-center' },
    { fieldName: 'cdcoOwrKnm2', header: `${t('MSG_TXT_CARD_STOCK')}2`, width: '100', styleName: 'text-center' },
    { fieldName: 'crdcdIstmMcn2', header: `${t('MSG_TXT_ISTM')}2`, width: '100', styleName: 'text-right' },
    { fieldName: 'initBlam', header: t('MSG_TXT_INIT_BLAM'), width: '100', styleName: 'text-right' },
    { fieldName: 'nowBlam', header: t('MSG_TXT_RES_ISTM_AMT'), width: '100', styleName: 'text-right' },
    { fieldName: 'blam1', header: `${t('MSG_TXT_RES_ISTM_AMT')}-1${t('MSG_TXT_MCNT')}`, width: '100', styleName: 'text-right' },
    { fieldName: 'blam2', header: `${t('MSG_TXT_RES_ISTM_AMT')}-2${t('MSG_TXT_MCNT')}`, width: '100', styleName: 'text-right' },
    { fieldName: 'blam3', header: `${t('MSG_TXT_RES_ISTM_AMT')}-3${t('MSG_TXT_MCNT')}`, width: '100', styleName: 'text-right' },
    { fieldName: 'blam4', header: `${t('MSG_TXT_RES_ISTM_AMT')}-4${t('MSG_TXT_MCNT')}`, width: '100', styleName: 'text-right' },
    { fieldName: 'buNotiDt', header: `${t('MSG_TXT_BU')}${t('MSG_TXT_NTFC')}${t('MSG_TXT_D')}`, width: '100', styleName: 'text-center' },
    { fieldName: 'buPrtnrNo', header: `${t('MSG_TXT_BU')}${t('MSG_TXT_NTFC')}${t('MSG_TXT_EPNO')}`, width: '100', styleName: 'text-center' },
    { fieldName: 'buPrtnrNm', header: `${t('MSG_TXT_BU')}${t('MSG_TXT_NOTI_USR')}`, width: '100', styleName: 'text-center' },
    { fieldName: 'buPstnDvCd', header: `${t('MSG_TXT_BU')}${t('MSG_TXT_NOTI_USR')}${t('MSG_TXT_RSB')}`, width: '100', styleName: 'text-center' },
    { fieldName: 'cntrCltnYn', header: t('MSG_TXT_CLTN_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'buCltnDt', header: `${t('MSG_TXT_BU')}${t('MSG_TXT_NOTI_USR')}${t('MSG_TXT_CLTN_DT')}`, width: '100', styleName: 'text-center' },
    { fieldName: 'cntrLocaraTno', header: `${t('MSG_TXT_APPL_USER')}${t('MSG_TXT_LOCARA_TNO')}`, width: '100', styleName: 'text-center' },
    { fieldName: 'cntrExno', header: `${t('MSG_TXT_APPL_USER')}${t('MSG_TXT_EXNO_ENCR')}`, width: '200', styleName: 'text-center' },
    { fieldName: 'cntrIdvTno', header: `${t('MSG_TXT_APPL_USER')}${t('MSG_TXT_IDV_TNO')}`, width: '100', styleName: 'text-center' },
    { fieldName: 'cntrCralLocaraTno', header: `${t('MSG_TXT_APPL_USER')}${t('MSG_TXT_CRAL_LOCARA_TNO')}`, width: '100', styleName: 'text-center' },
    { fieldName: 'cntrMexnoEncr', header: `${t('MSG_TXT_APPL_USER')}${t('MSG_TXT_MEXNO')}`, width: '200', styleName: 'text-center' },
    { fieldName: 'cntrCralIdvTno', header: `${t('MSG_TXT_APPL_USER')}${t('MSG_TXT_CRAL_IDV_TNO')}`, width: '100', styleName: 'text-center' },
    { fieldName: 'locaraTno', header: `${t('MSG_TXT_INSTR')}${t('MSG_TXT_LOCARA_TNO')}`, width: '100', styleName: 'text-center' },
    { fieldName: 'exnoEncr', header: `${t('MSG_TXT_INSTR')}${t('MSG_TXT_EXNO_ENCR')}`, width: '200', styleName: 'text-center' },
    { fieldName: 'idvTno', header: `${t('MSG_TXT_INSTR')}${t('MSG_TXT_IDV_TNO')}`, width: '100', styleName: 'text-center' },
    { fieldName: 'cralLocaraTno', header: `${t('MSG_TXT_INSTR')}${t('MSG_TXT_CRAL_LOCARA_TNO')}`, width: '100', styleName: 'text-center' },
    { fieldName: 'mexnoEncr', header: `${t('MSG_TXT_INSTR')}${t('MSG_TXT_MEXNO')}`, width: '200', styleName: 'text-center' },
    { fieldName: 'cralIdvTno', header: `${t('MSG_TXT_INSTR')}${t('MSG_TXT_CRAL_IDV_TNO')}`, width: '100', styleName: 'text-center' },
    { fieldName: 'cntrAdr', header: `(${t('MSG_TXT_RCP')})${t('MSG_TXT_APPL_USER')}${t('MSG_TXT_ADDR')}`, width: '200', styleName: 'text-left' },
    { fieldName: 'cntrDtlAdr', header: `(${t('MSG_TXT_RCP')})${t('MSG_TXT_APPL_USER')}${t('MSG_TXT_DETAIL_ADDR')}`, width: '200', styleName: 'text-left' },
    { fieldName: 'adr', header: `(${t('MSG_TXT_RCP')})${t('MSG_TXT_INSTR')}${t('MSG_TXT_ADDR')}`, width: '200', styleName: 'text-left' },
    { fieldName: 'dtlAdr', header: `(${t('MSG_TXT_RCP')})${t('MSG_TXT_INSTR')}${t('MSG_TXT_DETAIL_ADDR')}`, width: '200', styleName: 'text-left' },
    { fieldName: 'initAdr', header: `(${t('MSG_TXT_FST')})${t('MSG_TXT_INSTR')}${t('MSG_TXT_ADDR')}`, width: '200', styleName: 'text-left' },
    { fieldName: 'initDtlAdr', header: `(${t('MSG_TXT_FST')})${t('MSG_TXT_INSTR')}${t('MSG_TXT_DETAIL_ADDR')}`, width: '200', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([]);
}
</script>
<style lang="scss">
.select_og_cd {
  min-width: 185.96px;
  max-width: 33% !important;
}
</style>
