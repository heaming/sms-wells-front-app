<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈', '판매', '영업활동관리', '상품별 판매 통계 조회']"
      />
    </template>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 판매유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_SEL_TYPE')"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            first-option="all"
            first-option-value=""
            :options="codes.SELL_TP_CD.filter((v) => ['1', '2', '3', '6'].includes(v.codeId) )"
            :label="$t('MSG_TXT_SEL_TYPE')"
            판매유형코드
          />
        </kw-search-item>
        <!-- 판매유형 상세-->
        <kw-search-item
          :label="$t('MSG_TXT_SELL_TP_DTL')"
        >
          <kw-select
            v-model="searchParams.cndtSellTpCd"
            :options="codes.SELL_TP_DTL_CD.filter((v)=> ['21', '22', '23', '24','25','26'].includes(v.codeId) )"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
        <!-- 조회년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_INQR_YM')"
          :colspan="2"
          required
        >
          <kw-select
            v-model="searchParams.inqrBaseTpCd"
            :options="codes.INQR_BASE_TP_CD"
          />
          <kw-date-range-picker
            v-model:from="searchParams.receiptStrtDt"
            v-model:to="searchParams.receiptEndDt"
            :label="$t('MSG_TXT_INQR_YM')"
            rules="date_range_required"
            type="month"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 현재 취소건 제외 -->
        <kw-search-item
          v-model="searchParams.currentCancelExcd"
          :label="$t('MSG_TXT_CURRENT_CANCEL_EXCD')"
        >
          <kw-checkbox
            v-model="searchParams.currentCancelExcd"
          />
        </kw-search-item>
        <!-- 조직구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_OG_DV')"
        >
          <kw-select
            v-model="searchParams.sellOgTpCd"
            :options="codes.OG_TP_CD"
            :model-value="searchParams.sellOgTpCd ? searchParams.sellOgTpCd : []"
            :multiple="true"
          />
        </kw-search-item>
        <!-- 상품분류 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CATE')"
          :colspan="2"
        >
          <!-- 상품분류(대분류) 선택 -->
          <kw-select
            v-model="selectHighClasses"
            :placeholder="$t('TXT_MSG_PD_HCLSF_ID') + ' ' + $t('MSG_TXT_SELT')"
            :options="filteredHighClasses"
            option-value="pdClsfId"
            option-label="pdClsfNm"
            first-option="all"
            :first-option-label="$t('TXT_MSG_PD_HCLSF_ID') + ' ' + $t('MSG_TXT_SELT')"
            first-option-value=""
            @update:model-value="onUpdateHighClasses"
          />
          <!-- 상품분류(중분류) 선택 -->
          <kw-select
            v-model="selectMiddleClasses"
            :placeholder="$t('MSG_TXT_PD_MCLSF_ID') + ' ' + $t('MSG_TXT_SELT')"
            :options="filteredMiddleClasses"
            option-value="pdClsfId"
            option-label="pdClsfNm"
            first-option="all"
            :first-option-label="$t('MSG_TXT_PD_MCLSF_ID') + ' ' + $t('MSG_TXT_SELT')"
            first-option-value=""
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 상품코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')"
        >
          <kw-input
            v-model="searchParams.pdCd"
            clearable
            icon="search"
            dense
            :maxlength="10"
            @click-icon="onClickSelectPdCd()"
          />
        </kw-search-item>
        <!-- 파트너코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRTNR_CD')"
        >
          <kw-input
            v-model="searchParams.sellPrtnrNo"
            clearable
            icon="search"
            :maxlength="10"
            @click-icon="onClickSearchPrtnrNoPopup()"
          />
        </kw-search-item>

        <!-- 제휴코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_ALNC_CD')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.alncmpCd"
            :options="codes.ALNCMP_CD"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 조직코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_OG_CD')"
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
            multiple
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
            multiple
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
            multiple
          />
        </kw-search-item>
        <!-- 행사코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_EV_CD')"
        >
          <kw-select
            v-model="searchParams.sellEvCd"
            :options="codes.SELL_EV_CD"
            first-option="all"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
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
        :visible-rows="10"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
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
// Import & Declaration  alert   , router ,
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { defineGrid, modal, useDataService, gridUtil, useMeta, getComponentType, codeUtil, alert } from 'kw-lib';
import { cloneDeep, uniqBy } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';

const { currentRoute } = useRouter();
const now = dayjs();
const { getConfig } = useMeta();
const { t } = useI18n();
const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

let cachedParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchParams = ref({
  receiptStrtDt: now.format('YYYYMM'), // 조회년월 - 시작월
  receiptEndDt: now.format('YYYYMM'), // 조회년월 - 종료월
  sellTpCd: '', // 판매유형코드
  currentCancelExcd: 'N', // 현재 취소건 제외
  inqrBaseTpCd: '01', // 조회년월
  sellOgTpCd: '', // 조직구분
  cndtSellTpCd: '', // 판매유형상세
  pdCd: '', // 상품코드
  alncmpCd: '', // 제휴코드
  sellEvCd: '', // 행사코드
  dgr1LevlOgId: [], // 조직코드-총괄단
  dgr2LevlOgId: [], // 조직코드-지역단
  dgr3LevlOgId: [], // 조직코드-지점
  hcsfVal: '', // 상품분류-대분류
  hcsfMcsfVal: '', // 상품분류-중분류
  sellPrtnrNo: '', // 파트너코드
  incentiveYn: false, // 인센티브 여부
});

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'basYm' },
    { fieldName: 'dgr1LevlOgNm' },
    { fieldName: 'dgr2LevlOgNm' },
    { fieldName: 'dgr2LevlOgCd' },
    { fieldName: 'sellTpNm' },
    { fieldName: 'sellTpDtlNm' },
    { fieldName: 'ogTpNm' },
    { fieldName: 'pdHclsfNm' },
    { fieldName: 'pdMclsfNm' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'alncmpNm' },
    { fieldName: 'sellEvNm' },
    { fieldName: 'pdQty' },

  ];

  const columns = [
    { fieldName: 'basYm', header: '기준년월', width: '142', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'dgr1LevlOgNm', header: '총괄단', width: '142', styleName: 'text-left' },
    { fieldName: 'dgr2LevlOgNm', header: '지역단', width: '142', styleName: 'text-left' },
    { fieldName: 'dgr2LevlOgCd', header: '지역단코드', width: '142', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: '판매유형', width: '142', styleName: 'text-left' },
    { fieldName: 'sellTpDtlNm', header: '판매유형상세', width: '142', styleName: 'text-left' },
    { fieldName: 'ogTpNm', header: '조직구분', width: '142', styleName: 'text-center' },
    { fieldName: 'pdHclsfNm', header: '상품대분류', width: '112', styleName: 'text-left' },
    { fieldName: 'pdMclsfNm', header: '상품중분류', width: '112', styleName: 'text-left' },
    { fieldName: 'pdCd', header: '상품코드', width: '112', styleName: 'text-center' },
    { fieldName: 'pdNm', header: '상품명', width: '257', styleName: 'text-left' },
    { fieldName: 'alncmpNm', header: '제휴명', width: '122', styleName: 'text-center' },
    { fieldName: 'sellEvNm', header: '행사명', width: '122', styleName: 'text-center' },
    { fieldName: 'pdQty', header: '총수량', width: '83', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
});

// 상품코드 검색아이콘 클릭
async function onClickSelectPdCd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.pdCd,
    selectType: '',
  };

  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });

  if (returnPdInfo.result) {
    searchParams.value.pdCd = returnPdInfo.payload?.[0].pdCd;
    searchParams.value.pdNm = returnPdInfo.payload?.[0].pdNm;
  }
}
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes('SELL_TP_CD', 'ALNCMP_CD', 'SELL_EV_CD', 'COD_PAGE_SIZE_OPTIONS', 'CNTR_DTL_STAT_CD', 'INQR_BASE_TP_CD', 'SELL_TP_DTL_CD', 'OG_TP_CD');

// 상품분류코드 조회
const codesHighClasses = ref([]);
const codesMiddleClasses = ref([]);

const filteredHighClasses = ref([]); // 필터링된 대분류 코드
const filteredMiddleClasses = ref([]); // 필터링된 중분류 코드

const selectHighClasses = ref([]); // 선택한 대분류 코드
const selectMiddleClasses = ref([]); // 선택한 중분류 코드

async function getPdClassesInfos() {
  let res = [];
  res = await dataService.get('/sms/wells/contract/product/high-classes'); // 상품대분류 조회
  console.log(`res.data>>>${JSON.stringify(res.data)}`);
  codesHighClasses.value = res.data;
  res = await dataService.get('/sms/wells/contract/product/middle-classes'); // 상품중분류 조회
  codesMiddleClasses.value = res.data;

  console.log(`codesMiddleClasses.data>>>${JSON.stringify(res.data)}`);

  // 상품대분류 코드 초기화
  filteredHighClasses.value = codesHighClasses.value;
}
getPdClassesInfos();

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

async function getDgrOgInfos() {
  let res = [];
  res = await dataService.get('/sms/wells/contract/partners/general-divisions'); // 총괄단
  codesDgr1Levl.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/regional-divisions'); // 지역단
  codesDgr2Levl.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/branch-divisions'); // 지점
  codesDgr3Levl.value = res.data;

  // 총괄단 조직코드 초기화
  // filteredDgr1LevlOgCds.value = codesDgr1Levl.value;
  filteredDgr1LevlOgCds.value = uniqBy(codesDgr1Levl.value.filter((v) => ['W01', 'W02'].includes(v.ogTpCd)));
}

// 조회 함수
async function fetchData() {
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  res = await dataService.get('/sms/wells/contract/contracts/sales-statistics-sells-product/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: pages, pageInfo: pagingResult } = res.data;
  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }

  pageInfo.value = pagingResult;
  console.log(res.data);

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(pages);
  // pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  // 선택한 조직 코드에 해당하는 조직 ID 세팅
  searchParams.value.dgr1LevlOgId = codesDgr1Levl.value
    .filter((v) => selectedDgr1LevlOgCds.value.includes(v.dgr1LevlOgCd))
    .map((v) => v.dgr1LevlOgId);
  searchParams.value.dgr2LevlOgId = codesDgr2Levl.value
    .filter((v) => selectedDgr2LevlOgCds.value.includes(v.dgr2LevlOgCd))
    .map((v) => v.dgr2LevlOgId);
  searchParams.value.dgr3LevlOgId = codesDgr3Levl.value
    .filter((v) => selectedDgr3LevlOgCds.value.includes(v.dgr3LevlOgCd))
    .map((v) => v.dgr3LevlOgId);

  // 선택한 상품분류 코드에 해당하는 참조상품분류값 세팅
  const highClasses = ref();
  highClasses.value = codesHighClasses.value
    .filter((v) => selectHighClasses.value.includes(v.pdClsfId))
    .map((v) => v.pdClsfId);
  searchParams.value.hcsfVal = highClasses.value[0];
  searchParams.value.hcsfMcsfVal = selectMiddleClasses.value;

  await fetchData();

  // cachedParams = cloneDeep(searchParams.value);
  // await fetchData();
}

// 상품대분류 변경 이벤트
async function onUpdateHighClasses(selectedValues) {
  // 선택한 상품중분류 초기화
  selectMiddleClasses.value = [];

  // 상품중분류 코드 필터링. 선택한 상품대분류의 하위 상품중분류으로 필터링
  filteredMiddleClasses.value = codesMiddleClasses.value.filter((v) => selectedValues.includes(v.hgrPdClsfId));
}

getDgrOgInfos();

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

// 파트너 검색 팝업 호출
async function onClickSearchPrtnrNoPopup() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {},
  });
  if (result) {
    searchParams.value.sellPrtnrNo = payload.prtnrNo;
  }
}

// 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/sales-statistics-sells-product/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
});

</script>

<style scoped>
</style>
