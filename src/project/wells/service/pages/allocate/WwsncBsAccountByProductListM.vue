<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC (배정관리)
2. 프로그램 ID : [K-W-SV-U-0230M01] WwsncBsAccountByProductListM - 상품별 BS계정 현황
3. 작성자 : heymi.cho
4. 작성일 : 2023.08.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품별 BS계정 현황 (http://localhost:3000/#/service/wwsnc-bs-account-by-product-list)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            :rules="required"
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
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            class="w150"
            first-option="all"
            @change="onChangePdGrpCd"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="selectedProductByPdGrpCd"
            first-option="all"
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
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
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
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, useDataService, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { currentRoute } = useRouter();
const dataService = useDataService();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
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
 *  Search Parameter
 */
const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  pdGrpCd: '',
  pdCd: '',
  mgtDept: '', // 총괄단
  rgnlGrp: '', // 지역단
  branch: '', // 지점
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

/*
 *  Select Component 초기화 - 전체 상품 목록 가져오기
 */
const products = ref([]);
const selectedProductByPdGrpCd = ref([]);

async function getProductList() {
  cachedParams = cloneDeep(searchParams);
  const response = await dataService.get('/sms/wells/service/product-list/by-itmkndcd', { params: { itmKndCd: searchParams.value.itmKndCd } });
  products.value = response.data;
}

onBeforeMount(async () => {
  searchParams.value.itmKndCd = '4';
});

onMounted(async () => {
  await getProductList();
  selectedProductByPdGrpCd.value = cloneDeep(products.value);
  selectedProductByPdGrpCd.value = selectedProductByPdGrpCd.value.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId} - ${v.codeName}` }));
  // console.log(selectedProductByItmKnd.value);
});

const onChangePdGrpCd = (val) => {
  if (val.length < 1) {
    selectedProductByPdGrpCd.value = cloneDeep(products.value);
  } else {
    selectedProductByPdGrpCd.value = products.value.filter((v) => v.pdGrpCd === val);
  }
};

async function fetchData() {
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/bs-account-by-product/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  console.log(state);
  view.resetCurrent();
  await gridUtil.reset(view);
}

/*
 *  Search - 조회
 */
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/customer-ps-by-product/excel-download', { params: searchParams.value });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgr1LevlOgCd', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '124', styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '146', styleName: 'text-center' },
    { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_BRANCH'), width: '146', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '260', styleName: 'text-left' },
    { fieldName: 'pdGrpNm', header: t('MSG_TXT_PD_GRP'), width: '160', styleName: 'text-left' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '440', styleName: 'text-left' },
    { fieldName: 'cnt', header: t('MSG_TXT_ACC_N'), width: '126', styleName: 'text-right', dataType: 'number' },
  ];

  // eslint-disable-next-line max-len
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  // view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

</script>
