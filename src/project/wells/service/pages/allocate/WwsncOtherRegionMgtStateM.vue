<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : WwsncOtherRegionMgtStateM(타지역단 관리현황)
3. 작성자 : heymi.cho
4. 작성일 : 2023.05.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 타지역단 관리현황 (http://localhost:3000/#/service/wwsnc-other-region-mgt-state)
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 관리년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.mgtYnm"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <!-- 총괄단 -->
        <kw-search-item
          :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
        >
          <kw-select
            v-model="searchParams.mgtDept"
            :options="mgtDeptAll"
            first-option="all"
            option-value="dgr1LevlOgCd"
            option-label="dgr1LelOgNm"
            @update:model-value="onUpdateMgtDept"
          />
        </kw-search-item>
        <!-- 지역단 -->
        <kw-search-item
          :label="$t('MSG_TXT_RGNL_GRP')"
        >
          <kw-select
            v-model="searchParams.rgnlGrp"
            :options="filteredRgnlGrp"
            first-option="all"
            option-value="dgr2LevlOgCd"
            option-label="dgr2LevlOgNm"
            @update:model-value="onUpdateRgnlGrp"
          />
        </kw-search-item>
        <!-- 지점 -->
        <kw-search-item
          :label="$t('MSG_TXT_BRANCH')"
        >
          <kw-select
            v-model="searchParams.branch"
            :options="filteredBranch"
            first-option="all"
            option-value="dgr3LevlOgCd"
            option-label="dgr3LevlOgNm"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ZIP')"
        >
          <kw-input
            v-model="searchParams.zipFrom"
            type="text"
            placeholder="00001"
            mask="#####"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.zipTo"
            type="text"
            placeholder="99999"
            mask="#####"
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
        name="grdMain"
        :page-size="pageInfo.pageSize"
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
  </kw-page>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, gridUtil, useDataService, codeUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

// const { t } = useI18n();
const now = dayjs();
const dataService = useDataService();
// const { getConfig } = useMeta();
const grdMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
let cachedParams;

/*
 *  Search Parameter
 */
const searchParams = ref({
  mgtYnm: now.format('YYYYMM'), // 관리년월
  mgtDept: '', // 총괄단
  rgnlGrp: '', // 지역단
  branch: '', // 지점
  zipFrom: '', // 우편번호
  zipTo: '',
});

/*
 * 공통 코드
 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'GNRDV_ACD',
);

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

/*
 * 조직코드 (총괄단/지역단/지점)
 */
const mgtDeptAll = ref([]);
const rgnlGrpAll = ref([]);
const branchAll = ref([]);
// const filteredMgtDept = ref([]);
const filteredRgnlGrp = ref([]);
const filteredBranch = ref([]);

async function getRgnlGrpsNBranches() {
  let res = [];
  res = await dataService.get('/sms/wells/contract/partners/general-divisions');
  mgtDeptAll.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/regional-divisions');
  rgnlGrpAll.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/branch-divisions');
  branchAll.value = res.data;
}

getRgnlGrpsNBranches();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/other-region-mgt-state/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  console.log(res.data);

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  view.resetCurrent();
  await gridUtil.reset(view);
}

/*
 *  Search - 조회
 */
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;

  const zipFromValue = cloneDeep(searchParams.value.zipFrom);
  const zipToValue = cloneDeep(searchParams.value.zipTo);

  // 우편번호 Validation Check
  // eslint-disable-next-line max-len
  if (zipFromValue !== null && zipFromValue.length > 0 && zipToValue !== null && zipToValue.length > 0 && zipFromValue > zipToValue) {
    searchParams.value.zipFrom = zipToValue;
    searchParams.value.zipTo = zipFromValue;
  }

  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/other-region-mgt-state/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostFix: true,
    exportData: response.data,
  });
}

/*
 * Event - 총괄단 변경
 */
async function onUpdateMgtDept(value) {
  searchParams.value.rgnlGrp = '';
  searchParams.value.branch = '';

  filteredRgnlGrp.value = rgnlGrpAll.value.filter((v) => value.includes(v.dgr1LevlOgCd));
  filteredBranch.value = [];
}

/*
 * Event - 지역단 변경
 */
async function onUpdateRgnlGrp(value) {
  searchParams.value.branch = '';
  filteredBranch.value = branchAll.value.filter((v) => value.includes(v.dgr2LevlOgCd));
}

// // -------------------------------------------------------------------------------------------------
// // Initialize Grid
// // -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'rgnlGrp' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'cstAdr' },
    { fieldName: 'ltnAdr' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'cstCp' },
    { fieldName: 'hgrOgNm' },
    { fieldName: 'ogNm' },
    { fieldName: 'mngtPrtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'bldNm' },
    { fieldName: 'fxnPrtnrYn' },
    { fieldName: 'mngerRglvlDvCd' },
  ];

  const columns = [
    { fieldName: 'rgnlGrp', header: '관리지역단', width: '160', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: '계약번호', width: '160', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: '고객명', width: '90', styleName: 'text-center' },
    { fieldName: 'newAdrZip', header: '우편번호', width: '130', styleName: 'text-center' },
    { fieldName: 'cstAdr', header: '주소', width: '150', styleName: 'text-center' },
    { fieldName: 'ltnAdr', header: '읍면동', width: '200', styleName: 'text-center' },
    // { fieldName: 'cralLocaraTno', header: '폰지역번호', width: '110', styleName: 'text-center' },
    // { fieldName: 'mexnoEncr', header: '폰암호화', width: '110', styleName: 'text-center' },
    // { fieldName: 'cralIdvTno', header: '폰개별', width: '110', styleName: 'text-center' },
    { fieldName: 'cstCp',
      header: '휴대전화',
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        // eslint-disable-next-line max-len
        const { cralLocaraTno: no1, mexnoEncr: no2, cralIdvTno: no3 } = grid.getValues(index.itemIndex);
        return !isEmpty(no1) && !isEmpty(no2) && !isEmpty(no3) ? `${no1}-${no2}-${no3}` : '';
      },
    },
    { fieldName: 'hgrOgNm', header: '방문지역단', width: '130', styleName: 'text-center' },
    { fieldName: 'ogNm', header: '지점', width: '110', styleName: 'text-center' },
    { fieldName: 'mngtPrtnrNo', header: '사번', width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: '매니저명', width: '110', styleName: 'text-center' },
    { fieldName: 'bldNm', header: '빌딩명', width: '100', styleName: 'text-center' },
    { fieldName: 'fxnPrtnrYn', header: '구분(고정)', width: '105', styleName: 'text-center' },
    { fieldName: 'mngerRglvlDvCd', header: '급지', width: '130', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
