<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNF
2. 프로그램 ID : [W-SV-U-0198M01] WwsnfAsEncourageMaterialsMngtListM - AS유형별 권장자재 관리
3. 작성자 : gs.piit122
4. 작성일 : 2023.07.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-
****************************************************************************************************
--->
<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈', '정보관리','기준정보관리','AS유형별 필요자재 관리']"
      />
    </template>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            @change="changePdGrpCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_NM')"
        >
          <!--            rules="required"-->
          <kw-select
            v-model="searchParams.pdCd"
            :options="pds"
            first-option="all"
            option-label="cdNm"
            option-value="cd"
            :disable="searchParams.pdGrpCd === '' "
            :label="$t('MSG_TXT_PRDT_NM')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          label="접수증상"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.classA"
            :options="classARef"
            first-option="all"
            @change="searchCustomerCenterClassA"
          />
          <kw-select
            v-model="searchParams.classB"
            :disable="searchParams.classA === '' "
            :options="classBRef"
            @change="searchCustomerCenterClassB"
          />
          <kw-select
            v-model="searchParams.classC"
            :disable="searchParams.classB === '' "
            :options="classCRef"
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
          dense
          icon="print"
          label="인쇄"
          secondary
        />
        <kw-btn
          dense
          icon="download_on"
          label="엑셀 다운로드"
          secondary
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        name="grdMain"
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
import { codeUtil, defineGrid, getComponentType, useDataService, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const { /* getServiceCenterOrgs, */ /* getServiceCenterPrtnr, */
  getPartMaster, getSearchCustomerCenterClass } = useSnCode();
const dataService = useDataService();
const { t } = useI18n();
// eslint-disable-next-line no-unused-vars
const { getConfig } = useMeta();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  // 'SV_DV_CD',
  'PD_GRP_CD',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  // pageSize: 10,
});
let cachedParams;
const searchParams = ref({
  // svTpCd: '',
  pdGrpCd: '',
  // ogId: '',
  pdCd: '',
  classA: '',
  classB: '',
  classC: '',
  // dateType: '',
  // dateValueFromDt: '',
  // dateValueToDt: '',
  // prtnrNo: '',
});
const classARef = ref([]);
const classBRef = ref([]);
const classCRef = ref([]);
// const productCode = ref();
// const prtNrs = ref();
// watch(() => [searchParams.value.pdGrpCd], async () => {
//   const tempVal = await getPartMaster(undefined, searchParams.value.pdGrpCd);
//   productCode.value = tempVal.map((v) => ({ codeId: v.cd, codeName: v.codeName }));
// }, { immediate: true });

// const servierCenterOrg = await getServiceCenterOrgs();

// watch(() => [searchParams.value.ogId], async () => {
//   prtNrs.value = await getServiceCenterPrtnr(searchParams.value.ogId);
//   searchParams.value.prtnrNo = '';
// }, { immediate: true });

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-encourage-materials-mngt', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: items, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(items);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function searchCustomerCenterClassA() {
  classBRef.value = [];
  classCRef.value = [];
  searchParams.value.classB = '';
  searchParams.value.classC = '';
  classBRef.value = await getSearchCustomerCenterClass(searchParams.value.classA, null);
}

async function searchCustomerCenterClassB() {
  searchParams.value.classC = '';
  classCRef.value = [];
  classCRef.value = await getSearchCustomerCenterClass(searchParams.value.classA, searchParams.value.classB);
}

const pds = ref([]);// = await getPartMaster('4', '1', 'M');
async function changePdGrpCd() {
  if (searchParams.value.pdGrpCd) {
    pds.value = await getPartMaster(
      '4',
      searchParams.value.pdGrpCd,
      'M',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      'X', /* 단종여부Y/N, 만약 X로 데이터가 유입되면 단종여부를 조회하지 않음 */
    );
  } else pds.value = [];
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'itmPdNm' },
    { fieldName: 'cnslTpLcsfCdNm' },
    { fieldName: 'cnslCn' },
    { fieldName: 'itmRcmdRnk', dataType: 'number' },
    { fieldName: 'itmRcmdQty', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: 'SAP코드', width: '170', styleName: 'text-center' },
    { fieldName: 'pdCd', header: '품목코드', width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: '상품명', width: '200', styleName: 'text-left' },
    { fieldName: 'itmPdCd', header: '추천자재코드', width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: '추천자재', width: '300', styleName: 'text-left' },
    { fieldName: 'cnslTpLcsfCdNm', header: '접수증상', width: '120', styleName: 'text-left' },
    { fieldName: 'cnslCn', header: '접수증상상세', width: '400', styleName: 'text-left' },
    { fieldName: 'itmRcmdRnk', header: '추천순위', width: '100', styleName: 'text-center', dataType: 'number' },
    { fieldName: 'itmRcmdQty', header: '수량', width: '100', styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.displayOptions.emptyMessage = t('MSG_ALT_NO_INFO_SRCH');
  view.checkBar.visible = false;
  view.rowIndicator.visible = false; // create number indicator column
  view.editOptions.editable = false; // Grid Editable On
  view.rowIndicator.visible = true;
  view.displayOptions.selectionStyle = 'singleRow';
});
onMounted(async () => {
  if (window.location.href.includes('localhost')) {
    // searchParams.value.svTpCd = '3';
    // searchParams.value.pdGrpCd = '1';
    // searchParams.value.pdCd = 'WM03100205';
    // searchParams.value.dateType = 'vstCnfmdt';
    // searchParams.value.dateValueFromDt = '20230701';
    // searchParams.value.dateValueToDt = '20230725';
    searchParams.value.classB = '';
    searchParams.value.classC = '';
    classBRef.value = [];
    classCRef.value = [];
    classARef.value = await getSearchCustomerCenterClass();
  }
});
</script>

<style scoped>
</style>
