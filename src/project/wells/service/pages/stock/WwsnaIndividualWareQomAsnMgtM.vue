<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CMA (재고관리)
2. 프로그램 ID : WwsnaIndividualWareQomAsnMgtM - 개인창고물량배정(W-SV-U-0190M01)
3. 작성자 : inho.choi
4. 작성일 : 2023.05.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
관리자가 물류센터로부터 개인창고로 물량을 일괄배정하는 화면
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
      <kw-search-row :colspan="2">
        <kw-search-item
          :label="$t('MSG_TXT_ITM_KND')"
        >
          <kw-select
            v-model="searchParams.itmKnd"
            :options="codes.ITM_KND"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
        >
          <kw-input
            v-model="searchParams.itmCdStart"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.itmCdEnd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE')"
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
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_TXT_WARE_RNW')"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          dense
          primary
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
import { codeUtil, defineGrid, gridUtil, useDataService, getComponentType, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { getConfig } = useMeta();
const { t } = useI18n();
const { currentRoute } = useRouter();

const dataService = useDataService();
const baseURI = '/sms/wells/service/qom-asn/individual-warehouse';
const excelURI = `${baseURI}/excel-download`;
const grdMainRef = ref(getComponentType('KwGrid'));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'ITM_KND_CD',
  'ITM_TP_CD',
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
  wareDvCd: '',
  wareDtlDvCd: '',
  ostrWare: '',
  strWare: '',
  itmCdStart: '',
  itmCdEnd: '',
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

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(excelURI, { params: cachedParams });
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
    { fieldName: 'sapCd', header: t('MSG_TXT_SAP_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'itmCd', header: t('MSG_TXT_ITM_CD'), width: '146', styleName: 'text-center' },
    { fieldName: 'itmNm', header: t('MSG_TXT_ITM_NAME'), width: '200', styleName: 'text-left' },
    { fieldName: 'wareNo', header: t('MSG_TXT_WARE_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'seqNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'mngtPrtnrNo', header: t('MSG_TXT_PIC'), width: '86', styleName: 'text-center' },
    { fieldName: 'wareNm', header: t('MSG_TXT_WARE_NM'), width: '140', styleName: 'text-left' },
    { fieldName: 'centerQty', header: t('MSG_TXT_CENTER_WARE_QTY'), width: '140', styleName: 'text-right' },
    { fieldName: 'nomalQty', header: t('MSG_TXT_GE'), width: '86', styleName: 'text-right' },
    { fieldName: 'crpQty', header: t('MSG_TXT_CRP'), width: '86', styleName: 'text-right' },
    { fieldName: 'totalQty', header: t('MSG_TXT_TOTAL_ASGN'), width: '86', styleName: 'text-right' },
    { fieldName: 'wtcfQty', header: t('MSG_TXT_WTCF_APPLY'), width: '126', styleName: 'text-right' },
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
    'sapCd', 'itmCd', 'itmNm',
    {
      header: t('MSG_TXT_STR_WARE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['wareNo', 'seqNo', 'mngtPrtnrNo', 'wareNm'],
    },
    'centerQty',
    {
      header: t('MSG_TXT_STR_WARE'),
      direction: 'horizontal',
      items: ['nomalQty', 'crpQty', 'totalQty'],
    },
    'wtcfQty',
  ]);
});

</script>
<style scoped>
</style>
