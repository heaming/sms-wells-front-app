<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNY (기준정보)
2. 프로그램 ID : WwsnyAfterServiceCodeMgtM - AS 코드관리
3. 작성자 : gs.piit122
4. 작성일 : 2022.11.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- AS코드관리 (http://localhost:3000/#/service/wwsny-after-service-code-mgt)
- ZwcmwProductMgtM.vue 참고
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!--상품그룹-->
        <kw-search-item :label="$t('MSG_TXT_PD_GRP')">
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes2.SB01"
            option-label="cdNm"
            option-value="cd"
            first-option="all"
            first-option-label="- 전체 -"
          />
        </kw-search-item>
        <!--상품명-->
        <kw-search-item :label="$t('MSG_TXT_PD_NM')">
          <kw-select
            v-model="searchParams.pdCd"
            :options="pds"
            option-label="cdNm"
            option-value="cd"
            first-option="all"
            first-option-label="- 전체 -"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!--서비스유형-->
        <kw-search-item :label="$t('MSG_TXT_SV_TP')">
          <kw-select
            v-model="searchParams.svTpCd"
            :options="codes2.SB21"
            option-label="cdNm"
            option-value="cd"
            first-option="all"
            first-option-label="- 전체 -"
          />
        </kw-search-item>
        <!--AS위치-->
        <kw-search-item :label="$t('MSG_TXT_AS_LCT')">
          <kw-select
            v-model="searchParams.asLctCd"
            :options="codes2.SB31"
            option-label="cdNm"
            option-value="cd"
            first-option="all"
            first-option-label="- 전체 -"
          />
        </kw-search-item>
        <!--적용일자-->
        <kw-search-item>
          <kw-option-group
            v-model="searchParams.apyChk"
            :options="codesYn"
            option-label="name"
            option-value="code"
            type="toggle"
          />
          <kw-date-picker
            v-model="searchParams.applyDate"
            :disable="searchParams.apyChk[0] !== '1' "
            :label="$t('MSG_TXT_APPLY_DT')"
            :rules="searchParams.apyChk[0] === '1' ? 'required' : '' "
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <h3>{{ $t('MSG_TXT_SRCH_RSLT') }}</h3>
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
import { codeUtil, defineGrid, getComponentType, useDataService, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();

const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  pdGrpCd: '',
  pdCd: '',
  apyChk: [],
  applyDate: '',
  svTpCd: '',
  asLctCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'PD_GRP_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const codesYn = [{ code: '1', name: t('MSG_TXT_APPLY_DT') }];

async function getCodes() {
  const { data } = await dataService.get('/sms/wells/common/common-mngt/lcCommoncodeCo110tb', {
    params: { grpCd: '\'SB01\', \'SB21\', \'SB23\', \'SB31\', \'SB32\', \'SB33\', \'BA04\'' } });
  return data.reduce((result, current) => {
    result[current.grpCd] = result[current.grpCd] || [];
    result[current.grpCd].push(current);
    return result;
  });
}
const codes2 = await getCodes();

async function getPds() {
  const { data } = await dataService.get('/sms/wells/common/common-mngt/lcStockSt101tb', {
    params: { pdctClsf: '4' } });
  return data;
}
const pds = await getPds();

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/after-service-code-mngt/getAfterServiceCodeMngtPages', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'svTpCd' },
    { fieldName: 'asLctCd' },
    { fieldName: 'asPhnCd' },
    { fieldName: 'asCausCd' },
    { fieldName: 'siteAwAtcCd' },
    { fieldName: 'fuleyAwAmt' },
    { fieldName: 'svAnaHclsfCd' },
  ];

  const columns = [
    { fieldName: 'svTpCd', header: t('MSG_TXT_SV_TP'), width: '150' },
    { fieldName: 'asLctCd', header: t('MSG_TXT_AS_LCT'), width: '150' },
    { fieldName: 'asPhnCd', header: t('MSG_TXT_PRDT_TYPE_CD'), width: '120' },
    { fieldName: 'asCausCd', header: t('MSG_TXT_SLE_YN'), width: '60' },
    { fieldName: 'siteAwAtcCd', header: t('MSG_TXT_START_DATE'), width: '80' },
    { fieldName: 'fuleyAwAmt', header: t('MSG_TXT_END_DATE'), width: '80' },
    { fieldName: 'svAnaHclsfCd', header: t('MSG_TXT_PRICE'), width: '60' },
  ];

  const columnLayout = [
    'svTpCd',
    'asLctCd',
    'asPhnCd',
    'asCausCd',
    'siteAwAtcCd',
    'fuleyAwAmt',
    'svAnaHclsfCd',
  ];

  view.setColumnLayout(columnLayout);

  data.setFields(fields);
  view.setColumns(columns);

  view.displayOptions.emptyMessage = t('MSG_ALT_NO_INFO_SRCH');

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    console.log(g, column, itemIndex);
  };
});
</script>
