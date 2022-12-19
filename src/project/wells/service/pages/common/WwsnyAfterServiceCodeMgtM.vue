<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNY (기준정보)
2. 프로그램 ID : W-SV-U-0016M01 AS 코드관리
3. 작성자 : gs.piit122
4. 작성일 : 2022.11.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- AS코드관리 (http://localhost:3000/#/service/wwsny-after-service-code-mgt)
****************************************************************************************************
-->
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
            :options="codes.PD_GRP_CD"
            first-option="all"
            option-label="codeName"
            option-value="codeId"
          />
        </kw-search-item>
        <!--상품명-->
        <kw-search-item :label="$t('MSG_TXT_PD_NM')">
          <kw-select
            v-model="searchParams.pdCd"
            :options="pds"
            first-option="all"
            first-option-label="- 전체 -"
            option-label="cdNm"
            option-value="cd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!--서비스유형-->
        <kw-search-item :label="$t('MSG_TXT_SV_TP')">
          <kw-select
            v-model="searchParams.svTpCd"
            :options="codes.SV_TP_CD"
            first-option="all"
            option-label="codeName"
            option-value="codeId"
          />
        </kw-search-item>
        <!--AS위치-->
        <kw-search-item :label="$t('MSG_TXT_AS_LCT')">
          <kw-select
            v-model="searchParams.asLctCd"
            :options="codes.AS_LCT_CD"
            first-option="all"
            option-label="codeName"
            option-value="codeId"
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
      <kw-action-bottom />
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
import {
  codeUtil,
  defineGrid,
  getComponentType,
  useDataService,
  useMeta,
} from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import smsCommon from '~sms-wells/service/composables/useSnCode';
// import { getLcStockSt101tb } from '~sms-wells/service/composables/common';

const { getLcStockSt101tb } = smsCommon();

const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
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
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD', // SB01
  'SV_TP_CD', // SB21
  'AS_LCT_CD', // SB31
  'AS_PHN_CD', // SB32
  'AS_CAUS_CD', // SB33
  'SITE_AW_ATC_CD', // SB23
  'SV_BIZ_DCLSF_CD', // BA04
);
const codesYn = [{ code: '1', name: t('MSG_TXT_APPLY_DT') }];
const pds = await getLcStockSt101tb();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-codes/paging', { params: { ...cachedParams, ...pageInfo.value } });
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
    { fieldName: 'asLctNm' },
    { fieldName: 'asPhnCd' },
    { fieldName: 'asPhnNm' },
    { fieldName: 'asCausCd' },
    { fieldName: 'asCausNm' },
    { fieldName: 'siteAwAtcCd' },
    { fieldName: 'siteAwAtcNm' },
    { fieldName: 'fuleyAwAmt', dataType: 'number' },
    { fieldName: 'svAnaHclsfCd' },
    { fieldName: 'svAnaHclsfNm' },
  ];

  const columns = [
    {
      fieldName: 'svTpCd',
      header: t('MSG_TXT_SV_TP'),
      width: '30',
      lookupDisplay: true,
      lookupData: codes.SV_TP_CD.map((x) => ({ value: x.codeId ? x.codeId : '', label: x.codeName ? x.codeName : '' })),
      styleName: 'text-center',
    },
    { fieldName: 'asLctCd', header: t('MSG_TXT_CODE_ID'), width: '50', styleName: 'text-center' },
    {
      fieldName: 'asLctNm',
      header: t('MSG_TXT_CODE_NAME'),
      width: '100',
      lookupDisplay: true,
      lookupData: codes.AS_LCT_CD.map((x) => ({ value: x.codeId ? x.codeId : '', label: x.codeName ? x.codeName : '' })),
    },
    { fieldName: 'asPhnCd', header: t('MSG_TXT_CODE_ID'), width: '30', styleName: 'text-center' },
    {
      fieldName: 'asPhnNm',
      header: t('MSG_TXT_CODE_NAME'),
      width: '100',
      lookupDisplay: true,
      lookupData: codes.AS_PHN_CD.map((x) => ({ value: x.codeId ? x.codeId : '', label: x.codeName ? x.codeName : '' })),
    },
    { fieldName: 'asCausCd', header: t('MSG_TXT_CODE_ID'), width: '30', styleName: 'text-center' },
    {
      fieldName: 'asCausNm',
      header: t('MSG_TXT_CODE_NAME'),
      width: '100',
      lookupDisplay: true,
      lookupData: codes.AS_CAUS_CD.map((x) => ({ value: x.codeId ? x.codeId : '', label: x.codeName ? x.codeName : '' })),
    },
    {
      fieldName: 'siteAwAtcCd',
      header: t('MSG_TXT_CODE_ID'),
      width: '30',
      styleName: 'text-center',
    },
    {
      fieldName: 'siteAwAtcNm',
      header: t('MSG_TXT_CODE_NAME'),
      width: '50',
      lookupDisplay: true,
      lookupData: codes.SITE_AW_ATC_CD.map((x) => ({ value: x.codeId ? x.codeId : '', label: x.codeName ? x.codeName : '' })),
    },
    { fieldName: 'fuleyAwAmt', header: t('MSG_TXT_FULEY_AW_AMT'), width: '80' },
    {
      fieldName: 'svAnaHclsfCd',
      header: t('MSG_TXT_CODE_ID'),
      width: '30',
      styleName: 'text-center',
    },
    {
      fieldName: 'svAnaHclsfNm',
      header: t('MSG_TXT_CODE_NAME'),
      width: '100',
      lookupDisplay: true,
      lookupData: codes.SV_BIZ_DCLSF_CD.map((x) => ({ value: x.codeId ? x.codeId : '', label: x.codeName ? x.codeName : '' })),
    },
  ];

  const columnLayout = [
    'svTpCd',
    { direction: 'horizontal', items: ['asLctCd', 'asLctNm'], header: { text: t('MSG_TXT_AS_LCT') } },
    { direction: 'horizontal', items: ['asPhnCd', 'asPhnNm'], header: { text: t('MSG_TXT_AS_PHN') } },
    { direction: 'horizontal', items: ['asCausCd', 'asCausNm'], header: { text: t('MSG_TXT_AS_CAUS') } },
    { direction: 'horizontal', items: ['siteAwAtcCd', 'siteAwAtcNm', 'fuleyAwAmt'], header: { text: t('MSG_TXT_SITE_AW') } },
    { direction: 'horizontal', items: ['svAnaHclsfCd', 'svAnaHclsfNm'], header: { text: t('MSG_TXT_SV_ANA_HCLSF_CD') } },
  ];

  view.setColumnLayout(columnLayout);

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;

  view.displayOptions.emptyMessage = t('MSG_ALT_NO_INFO_SRCH');

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    console.log(g, column, itemIndex);
  };
});
</script>
