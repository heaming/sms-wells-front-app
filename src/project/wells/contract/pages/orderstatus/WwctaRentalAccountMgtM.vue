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
        <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
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
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          v-if="isProd"
          :label="$t('MSG_TXT_PDGRP')"
        >
          <kw-select
            v-model="searchParams.pdMclsfId"
            :options="pdMclsfIdOptions"
          />
        </kw-search-item>
        <kw-search-item
          v-else
          :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
        >
          <kw-select
            v-model="searchParams.dgr1LevlOgNm"
            :options="gnrlDivOptions"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          v-if="isProd"
          :label="$t('MSG_TXT_PRDT_CODE')"
        >
          <kw-input v-model="searchParams.basePdCd" />
        </kw-search-item>
        <kw-search-item
          v-else
          :label="$t('MSG_TXT_RGNL_GRP')"
        >
          <kw-select
            v-model="searchParams.dgr2LevlOgNm"
            :options="rgnlDivOptions"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_CST_DV')">
          <kw-select
            v-model="searchParams.copnDvCd"
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
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const dataService = useDataService();

const now = dayjs();

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
  dgr1LevlOgNm: '',
  basePdCd: '',
  dgr2LevlOgNm: '',
  copnDvCd: '',

});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COPN_DV_CD',
);

const pdMclsfIdOptions = await dataService.get('sms/wells/contract/product/middle-classes');
const gnrlDivOptions = await dataService.get('sms/wells/contract/partners/general-divisions');
const rgnlDivOptions = await dataService.get('sms/wells/contract/partners/regional-divisions');

const isProd = computed(() => searchParams.value.srchGbn === 1);

// Updating the col visibility as per search classification
function onChangeSearch() {
  const view = grdMainRef.value.getView();
  view.columnsByTag('prod').forEach((col) => { col.visible = isProd.value; });
  view.columnsByTag('org').forEach((col) => { col.visible = !(isProd.value); });
}

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  if (isProd.value) {
    const { dgr1LevlOgNm, dgr2LevlOgNm, ...prodParams } = cachedParams;
    res = await dataService.get('/sms/wells/contract/rental-accounts/rental-accounts/products', { params: prodParams });
  } else {
    const { pdMclsfId, basePdCd, ...orgParams } = cachedParams;
    res = await dataService.get('/sms/wells/contract/rental-accounts/rental-accounts/organizations', { params: orgParams });
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
  await gridUtil.exportView(view, {
    fileName: 'dataServiceManageList',
    timePostfix: true,
  });
}

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
