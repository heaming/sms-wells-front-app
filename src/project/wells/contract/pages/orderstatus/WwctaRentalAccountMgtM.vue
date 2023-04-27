<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaRentalAccountMgtM - 렌탈 계정 관리 현황
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.01.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈 계정 관리 현황
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_DV')"
          required
        >
          <kw-option-group
            v-model="searchParams.srchGbn"
            type="radio"
            :options="srchOptions"
            @change="onChangeSearch"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_YR_INSTALLATION')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.istStartDt"
            v-model:to="searchParams.istEndDt"
            :label="$t('MSG_TXT_YR_INSTALLATION')"
            rules="date_range_required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          v-if="isProd"
          :label="$t('MSG_TXT_PDGRP')"
        >
          <kw-select
            v-model="searchParams.pdMclsfId"
            first-option="all"
            :label="$t('MSG_TXT_PDGRP')"
            :options="pdMclsfIdOptions"
          />
        </kw-search-item>
        <kw-search-item
          v-else
          :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
          required
        >
          <kw-select
            v-model="searchParams.dgr1LevlOgCd"
            :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
            :options="gnrlDivOptions"
            first-option="all"
            option-value="dgr1LevlOgCd"
            option-label="dgr1LevlOgNm"
            @update:model-value="onUpdateDgr1Levl"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          v-if="isProd"
          :label="$t('MSG_TXT_PRDT_CODE')"
        >
          <kw-input
            v-model="searchParams.basePdCd"
            :label="$t('MSG_TXT_PRDT_CODE')"
            clearable
            icon="search"
            dense
            :maxlength="10"
            @click-icon="onClickSelectPdCd()"
          />
        </kw-search-item>
        <kw-search-item
          v-else
          :label="$t('MSG_TXT_RGNL_GRP')"
        >
          <kw-select
            v-model="searchParams.dgr2LevlOgCd"
            first-option="all"
            :options="rgnlDivOptions"
            option-value="dgr2LevlOgCd"
            option-label="dgr2LevlOgNm"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CST_DV')"
        >
          <kw-select
            v-model="searchParams.copnDvCd"
            first-option="all"
            :label="$t('MSG_TXT_CST_DV')"
            :options="codes.COPN_DV_CD"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
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
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty, uniqBy } from 'lodash-es';
import dayjs from 'dayjs';
import pdConst from '~sms-common/product/constants/pdConst';

const { t } = useI18n();
const dataService = useDataService();
const { modal } = useGlobal();
const now = dayjs();
const { currentRoute } = useRouter();
const totalCount = ref(0);
const srchOptions = ref([{
  codeId: 1,
  codeName: t('MSG_TXT_BY_PRD') },
{
  codeId: 2,
  codeName: t('MSG_TXT_BY_ORG') }]);

let cachedParams;
const searchParams = ref({
  srchGbn: 1,
  istStartDt: now.startOf('month').format('YYYYMM'),
  istEndDt: now.format('YYYYMM'),
  pdMclsfId: '',
  dgr1LevlOgCd: '',
  basePdCd: '',
  dgr2LevlOgCd: '',
  copnDvCd: '',

});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COPN_DV_CD',
);

const pdMclsfIdOptions = ref([]);
const gnrlDivOptions = ref([]);
const rgnlDivOptions = ref([]);

const isProd = computed(() => searchParams.value.srchGbn === 1);

// Updating the col visibility as per search classification
function onChangeSearch() {
  const view = grdMainRef.value.getView();
  const data = view.getDataSource();
  data.clearRows();
  searchParams.value.pdMclsfId = '';
  searchParams.value.basePdCd = '';
  searchParams.value.dgr1LevlOgCd = '';
  searchParams.value.dgr2LevlOgCd = '';
  searchParams.value.copnDvCd = '';
  totalCount.value = 0;
  view.columnsByTag('prod').forEach((col) => { col.visible = isProd.value; });
  view.columnsByTag('org').forEach((col) => { col.visible = !(isProd.value); });
}

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  if (isProd.value) {
    const { dgr1LevlOgNm, dgr2LevlOgNm, ...prodParams } = cachedParams;
    res = await dataService.get('/sms/wells/contract/rental-accounts/products/paging', { params: prodParams });
  } else {
    const { pdMclsfId, basePdCd, ...orgParams } = cachedParams;
    res = await dataService.get('/sms/wells/contract/rental-accounts/organizations/paging', { params: orgParams });
  }

  const { list: accounts } = res.data;
  totalCount.value = accounts.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(accounts);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  let res = '';
  if (isProd.value) {
    res = await dataService.get('/sms/wells/contract/rental-accounts/products/excel-download', { params: cachedParams });
  } else {
    res = await dataService.get('/sms/wells/contract/rental-accounts/organizations/excel-download', { params: cachedParams });
  }
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 상품코드 검색아이콘 클릭
async function onClickSelectPdCd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.basePdCd,
    selectType: '',
  };

  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });

  if (returnPdInfo.result) {
    searchParams.value.basePdCd = returnPdInfo.payload?.[0].pdCd;
  }
}

const responseGnrlDivOptions = ref([]);
const responseRgnlDivOptions = ref([]);

async function fetchDefaultData() {
  let res = [];
  const responseMclsfIdOptions = await dataService.get('sms/wells/contract/product/middle-classes');
  res = await dataService.get('sms/wells/contract/partners/general-divisions');
  responseGnrlDivOptions.value = res.data;
  res = await dataService.get('sms/wells/contract/partners/regional-divisions');
  responseRgnlDivOptions.value = res.data;

  gnrlDivOptions.value = uniqBy(responseGnrlDivOptions.value.filter((v) => ['W01', 'W02'].includes(v.ogTpCd)));

  const initPdMclsfId = []; // 상품분류
  responseMclsfIdOptions.data.forEach((v) => {
    if ((!isEmpty(v)) && (!isEmpty(v.pdClsfId))) {
      initPdMclsfId.push({ codeId: v.pdClsfId, codeName: v.pdClsfNm });
    }
  });

  pdMclsfIdOptions.value = uniqBy(initPdMclsfId, 'codeId'); // 중복제거
}

// 조직코드 총괄단 변경 이벤트
async function onUpdateDgr1Levl(selectedValues) {
  // 선택한 지역단, 지점 초기화
  rgnlDivOptions.value = [];

  // 지역단 코드 필터링. 선택한 총괄단의 하위 지역단으로 필터링
  rgnlDivOptions.value = responseRgnlDivOptions.value.filter((v) => selectedValues.includes(v.dgr1LevlOgCd));
}

onMounted(async () => {
  await fetchDefaultData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pdgrpNm' },
    { fieldName: 'pdNM' },
    { fieldName: 'basePdCd' },
    { fieldName: 'istDt' },
    { fieldName: 'rstlYn' },
    { fieldName: 'jCnt' },
    { fieldName: 'mchnChCnt' },
    { fieldName: 'reRentalCnt' },
    { fieldName: 'mshCnt' },
    { fieldName: 'keepRentalCnt' },
    { fieldName: 'sprExnCnt' },
    { fieldName: 'sprReqdCnt' },
    { fieldName: 'sprRat' },
    { fieldName: 'dgr1LevlOgNm' },
    { fieldName: 'dgr2LevlOgNm' },

  ];

  const columns = [
    { fieldName: 'pdgrpNm', header: t('MSG_TXT_PDGRP'), width: '178', visible: true, tag: 'prod' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '295', visible: true, tag: 'prod' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '125', styleName: 'text-center', visible: true, tag: 'prod' },
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '178', visible: false, tag: 'org' },
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '295', visible: false, tag: 'org' },
    { fieldName: 'istDt', header: t('MSG_TXT_YR_INSTALLATION'), width: '125', styleName: 'text-center' },
    { fieldName: 'rstlYn', header: t('MSG_TXT_RECOMMITMENT'), width: '125', styleName: 'text-center' },
    { fieldName: 'jCnt', header: t('MSG_TXT_SUBSCRPTN_NO'), width: '139', styleName: 'text-right' },
    { fieldName: 'mchnChCnt', header: t('MSG_TXT_CHNG'), width: '139', styleName: 'text-right' },
    { fieldName: 'reRentalCnt', header: t('MSG_TXT_RE_RENTAL'), width: '139', styleName: 'text-right' },
    { fieldName: 'mshCnt', header: t('MSG_TXT_MEMBERSHIP'), width: '139', styleName: 'text-right' },
    { fieldName: 'keepRentalCnt', header: t('MSG_TXT_RNTL_MNTENC'), width: '139', styleName: 'text-right' },
    { fieldName: 'sprExnCnt', header: t('MSG_TXT_WTHDRWL_SLF'), width: '171', styleName: 'text-right' },
    { fieldName: 'sprReqdCnt', header: t('MSG_TXT_WTHDRWL_CNCL'), width: '194', styleName: 'text-right' },
    { fieldName: 'sprRat', header: t('MSG_TXT_WTHDRWL_RT'), width: '139', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});

</script>

<style scoped>
</style>
