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
            :options="codes.PD_GRP_CD"
            first-option="all"
            first-option-label="- 전체 -"
          />
        </kw-search-item>
        <!--상품명-->
        <kw-search-item :label="$t('MSG_TXT_PD_NM')">
          <kw-select
            v-model="searchParams.pdCd"
            :options="codes.PD_GRP_CD"
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
            :options="codes.PD_GRP_CD"
            first-option="all"
            first-option-label="- 전체 -"
          />
        </kw-search-item>
        <!--AS위치-->
        <kw-search-item :label="$t('MSG_TXT_AS_LCT')">
          <kw-select
            v-model="searchParams.asLctCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            first-option-label="- 전체 -"
          />
        </kw-search-item>
        <!--적용일자-->
        <kw-search-item>
          <kw-option-group
            v-model="searchParams.apyChk"
            :options="codes2"
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
          />
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize"
        @init="initGrdMain"
      />

      <kw-action-bottom>
        <kw-btn
          v-permission:delete
          :label="$t('MSG_BTN_DEL')"
          primary
        />
        <kw-btn
          v-permission:update
          :label="$t('MSG_BTN_MDFC')"
        />
      </kw-action-bottom>

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

let cachedParams;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

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

const codes2 = [{ code: '1', name: t('MSG_TXT_APPLY_DT') }];

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/after-service-code-mngt/getAfterServiceCodeMngtPages', {
    params: { ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
  view.resetCurrent();
}

async function onClickSearch() {
  console.log(`pdGrpCd = ${searchParams.value.pdGrpCd}`);
  console.log(`apyChk = ${searchParams.value.apyChk[0]}`);
  console.log(`applyDate = ${searchParams.value.applyDate}`);
  console.log(`svTpCd = ${searchParams.value.svTpCd}`);
  console.log(`asLctCd = ${searchParams.value.asLctCd}`);

  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'prdtUid' },
    { fieldName: 'prdtNm' },
    { fieldName: 'storeUid' },
    { fieldName: 'storeNm' },
    { fieldName: 'prdtCntn' },
    { fieldName: 'prdtTypeCd' },
    { fieldName: 'prdtTypeNm' },
    { fieldName: 'sleYn' },
    { fieldName: 'sleYnNm' },
    { fieldName: 'sleStartDt' },
    { fieldName: 'sleFinsDt' },
    { fieldName: 'prdtPrc', dataType: 'number' },
    { fieldName: 'fnlMdfcUsrId' },
    { fieldName: 'fnlMdfcUsrNm' },
    { fieldName: 'fnlMdfcDtm' },
  ];

  const columns = [
    { fieldName: 'prdtNm', header: t('MSG_TXT_PRDT_NM'), width: '150', styleName: 'rg-button-link', renderer: { type: 'button' } },
    { fieldName: 'storeNm', header: t('MSG_TXT_STORE_NM'), width: '150' },
    { fieldName: 'prdtTypeNm', header: t('MSG_TXT_PRDT_TYPE_CD'), width: '120' },
    { fieldName: 'sleYnNm', header: t('MSG_TXT_SLE_YN'), width: '60' },
    { fieldName: 'sleStartDt', header: t('MSG_TXT_START_DATE'), width: '80', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'sleFinsDt', header: t('MSG_TXT_END_DATE'), width: '80', datetimeFormat: 'date' },
    { fieldName: 'prdtPrc', header: t('MSG_TXT_PRICE'), width: '60', styleName: 'text-right' },
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_MDFC_USR'), width: '120', styleName: 'rg-button-link', renderer: { type: 'button' }, preventCellItemFocus: true },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DTM'), width: '120', styleName: 'text-center', datetimeFormat: 'datetime' },
  ];

  const columnLayout = [
    'prdtNm',
    'storeNm',
    'prdtTypeNm',
    'sleYnNm',
    {
      direction: 'horizontal',
      items: [
        'sleStartDt',
        'sleFinsDt',
      ],
      header: {
        text: t('MSG_TXT_PRDT_SLE_PRD'),
      },
    },
    'prdtPrc',
    'fnlMdfcUsrNm',
    'fnlMdfcDtm',
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
