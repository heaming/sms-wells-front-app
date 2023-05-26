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
    <template #header>
      <kw-page-header :options="['홈','판매관리', '리스크관리', '현장감사 판매리스트']" />
    </template>
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
            first-option-value="ALL"
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
            first-option-value="ALL"
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
            first-option-value="ALL"
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
            :model-value="searchParams.ptrmDv"
            :options="periodOptions"
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
            :model-value="searchParams.cntrStatCd"
            :options="codes.CNTR_STAT_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SLS_CAT')"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_SEL_TYPE')"
        >
          <kw-select
            v-model="searchParams.sellTpDtlCd"
            :options="codes.SELL_TP_DTL_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdMclsfId"
            :placeholder="$t('MSG_TXT_ALL')"
            :options="codesMiddleClasses"
            option-value="refPdClsfVal"
            option-label="pdClsfNm"
            first-option="all"
            :first-option-label="$t('MSG_TXT_ALL')"
            first-option-value="ALL"
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
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>

        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
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

const codes = await codeUtil.getMultiCodes(
  'CNTR_STAT_CD',
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
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

// 조회 파라미터  now.startOf('month').format('YYYYMMDD')
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
  console.log(cachedParams);

  const res = await dataService.get('/sms/wells/contract/site-audit/sells', { params: cachedParams });
  const { list: sellResult, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(sellResult);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회 버튼 클릭
async function onClickSearch() {
  // 선택한 조직 코드에 해당하는 조직 ID 세팅
  searchParams.value.dgr1LevlOgCd = codesDgr1Levl.value
    .find((v) => selectedDgr1LevlOgCds.value.includes(v.dgr1LevlOgCd))
    ?.dgr1LevlOgCd;
  searchParams.value.dgr2LevlOgCd = codesDgr2Levl.value
    .find((v) => selectedDgr2LevlOgCds.value.includes(v.dgr2LevlOgCd))
    ?.dgr2LevlOgCd;
  searchParams.value.dgr3LevlOgCd = codesDgr3Levl.value
    .find((v) => selectedDgr3LevlOgCds.value.includes(v.dgr3LevlOgCd))
    ?.dgr3LevlOgCd;

  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

const { currentRoute } = useRouter();

// 엑셀다운로드 버튼 클릭
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  // TODO 대용량 엑셀다운로드
  // const res =
  // await dataService.post('/sms/wells/contract/site-audit/sells/ers/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName, // 메뉴명으로 다운로드 엑셀 파일명 세팅
    timePostfix: true, // 엑셀 파일명에 _YYYYMMDDHHMISS 붙여줌
    // exportData: res.data, // 현재 그리드에 보여지는 데이터가 아닌 전체 데이터 다운로드 시 사용
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
    { fieldName: 'perfCnt' },
  ];

  const columns = [
    { fieldName: 'dgr1LevlOgCd', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '312', styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '300', styleName: 'text-center' },
    { fieldName: 'dgr3LevlOgCd', header: t('MSG_TXT_BRANCH'), width: '299', styleName: 'text-center' },
    { fieldName: 'perfCnt', header: t('MSG_TXT_PERF'), width: '305', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([]);
}
</script>
