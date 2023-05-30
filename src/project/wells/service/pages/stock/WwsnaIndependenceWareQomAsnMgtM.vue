<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CMA (재고관리)
2. 프로그램 ID : WwsnaIndependenceWareQomAsnMgtM - 독립창고물량배정(W-SV-U-0191M01)
3. 작성자 : inho.choi
4. 작성일 : 2023.05.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
관리자가 물류센터로부터 독립창고로 물량을 일괄배정하는 화면
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
        >
          <kw-date-picker
            v-model="searchParams.apyYm"
            type="month"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_ASN_YM')"
        >
          <kw-date-picker
            v-model="searchParams.asnOjYm"
            type="month"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_ORDERSELECT_TITLE')"
        >
          <kw-input
            v-model="searchParams.cnt"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE')"
        >
          <kw-select
            v-model="searchParams.ostrWare"
            :options="codes.STR_TP_CD"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_STR_WARE')"
        >
          <kw-select
            v-model="searchParams.strWare"
            :options="codes.STR_TP_CD"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
        >
          <kw-input
            v-model="searchParams.itmCd"
          />
          <span>~</span>
          <kw-input />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_STR_WARE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="codes.WARE_DV_CD"
            class="w150"
          />
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="codes.WARE_DTL_DV_CD"
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
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_TXT_WARE_RNW')"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          primary
          dense
          label="확정전저장"
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
import { codeUtil, defineGrid, useDataService, getComponentType, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { getConfig } = useMeta();
const { t } = useI18n();

const dataService = useDataService();
const baseURI = '/sms/wells/service/qom-asn/independence-warehouse';
const grdMainRef = ref(getComponentType('KwGrid'));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'ITM_KND_CD',
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
  'STR_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

let cachedParams;
const searchParams = ref({
  asnOjYm: '',
  apyYm: '',
  cnt: '',
  wareDvCd: '2',
  wareDtlDvCd: '',
  ostrWare: '',
  strWare: '',
  itmCd: '',
  strTpCd: '',
});

searchParams.value.asnOjYm = dayjs().format('YYYYMM');
searchParams.value.apyYm = dayjs().format('YYYYMMDD');

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get(baseURI, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_WARE_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_PIC'), width: '86', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_WARE_NM'), width: '160', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_SAP_CD'), width: '146', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_ITM_CD'), width: '146', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_ITM_NAME'), width: '200', styleName: 'text-left' },
    { fieldName: 'col8', header: t('MSG_TXT_MNGT_UNIT'), width: '106', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_GD'), width: '78', styleName: 'text-center' },
    { fieldName: 'col10', header: 'FULL', width: '94', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_ASGN_QTY'), width: '94', styleName: 'text-right' },
    { fieldName: 'col12', header: t('MSG_TXT_STOC_OG'), width: '118', styleName: 'text-right' },
  ];
  const gridField = columns.map((v) => ({ fieldName: v.fieldName }));
  const fields = [...gridField];
  // const fields = [...gridField,
  //   { fieldName: 'ostrSn' },
  //   { fieldName: 'strHopDt' },
  //   { fieldName: 'strWareNo' },
  //   { fieldName: 'itmPdNo' },
  //   { fieldName: 'ostrWareNo' },
  //   { fieldName: 'ostrWareNm' },
  // ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_STR_WARE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col1', 'col2', 'col3', 'col4'],
    },
    'col5',
    'col6',
    'col7',
    'col8',
    'col9',
    {
      header: t('MSG_TXT_THM_BS_QTY'),
      direction: 'horizontal',
      items: ['col10', 'col11'],
    },
    'col12',

  ]);
});

</script>
<style scoped>
</style>
