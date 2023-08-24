<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaCustomerFilterMgtM - 고객필터정보관리 화면
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.04.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객필터정보관리 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 조회 조건 구분 (일반 , 계약번호에 따라 visible On/OFF )-->
        <kw-search-item
          :label="$t('MSG_TXT_CLS_QUERY_COND')"
          required
        >
          <kw-select
            v-model="searchParams.qryCond"
            :label="$t('MSG_TXT_CLS_QUERY_COND')"
            :options="codes.QRY_CD"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_FILTER_YR_MN')"
          required
        >
          <!--필터등록년월 -->
          <kw-date-picker
            v-model="searchParams.filterYrMn"
            :label="$t('MSG_TXT_FILTER_YR_MN')"
            :disable="searchParams.qryCond !== '1'"
            type="month"
            :rules="searchParams.qryCond === '1' ? 'required' : '' "
          />
        </kw-search-item>
        <!--용도구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_USWY_DV')"
        >
          <kw-select
            v-model="searchParams.svPdTpCd"
            :options="codes.SV_PD_TP_CD"
            :disable="searchParams.qryCond !== '1'"
            first-option="all"
          />
        </kw-search-item>
        <!--상품코드-->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')"
        >
          <kw-input
            v-model="searchParams.pdCd"
            :label="$t('MSG_TXT_PRDT_CODE')"
            :disable="searchParams.qryCond !== '1'"
            icon="search"
            clearable
            @click-icon="onClickSelectPdCd()"
          />
        </kw-search-item>
      </kw-search-row>
      <!--계약상세번호-->
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
          required
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
            :disable="searchParams.qryCond !== '2'"
            :rules="searchParams.qryCond === '2' ? 'required' : '' "
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
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />

      <div class="grid-horizontal-wrap">
        <div class="grid-horizontal-wrap__section">
          <div>
            <h3>
              {{ $t('MSG_TXT_FILTER_PROD_CUST_INFO') }}
            </h3>
            <kw-action-top>
              <template #left>
                <kw-paging-info
                  v-model:page-index="detailPageInfo.pageIndex"
                  v-model:page-size="detailPageInfo.pageSize"
                  :total-count="detailPageInfo.totalCount"
                  :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
                  @change="fetchDetailData"
                />
              </template>
            </kw-action-top>

            <kw-grid
              ref="grdDetailRef"
              name="grdDetail"
              :page-size="detailPageInfo.pageSize"
              :total-count="detailPageInfo.totalCount.grdDetail"
              @init="initGrdDetail"
            />
            <kw-pagination
              v-model:page-index="detailPageInfo.pageIndex"
              v-model:page-size="detailPageInfo.pageSize"
              :total-count="detailPageInfo.totalCount"
              @change="fetchDetailData"
            />
          </div>
        </div>
      </div>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, defineGrid, useMeta, useGlobal, useDataService, gridUtil } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const { getConfig } = useMeta();
const { modal } = useGlobal();

const dataService = useDataService();
const searchParams = ref({
  qryCond: '1', // 조회조건구분
  filterYrMn: '', // 필터등록년월
  svPdTpCd: '', // 용도구분
  pdCd: '', // 상품코드
  pdNm: '', // 상품명
  cntrNo: '', // 계약상세번호 1
  cntrSn: '', // 계약상세번호 2
});
const searchDetailsParams = ref({
  cntrNo: '', // 계약상세번호 1
  cntrSn: '', // 계약상세번호 2
});

let cachedParams;

const codes = await codeUtil.getMultiCodes(
  'SV_PD_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

// 처리상세구분코드
codes.QRY_CD = [
  {
    codeId: '1',
    codeName: t('MSG_TXT_GE'), // 일반
  },
  {
    codeId: '2',
    codeName: t('MSG_TXT_CNTR_NO'), // 계약번호
  },
];

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const detailPageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const grdMainRef = ref(getComponentType('KwGrid'));
const grdDetailRef = ref(getComponentType('KwGrid'));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// 상품코드 검색아이콘 클릭
async function onClickSelectPdCd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.pdCd,
    selectType: '',
  };

  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });

  if (returnPdInfo.result) {
    searchParams.value.pdCd = returnPdInfo.payload?.[0].pdCd;
    searchParams.value.pdNm = returnPdInfo.payload?.[0].pdNm;
  }
}

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);

  const res = await dataService.get('/sms/wells/contract/filters/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function fetchDetailData() {
  cachedParams = cloneDeep(searchDetailsParams.value);

  const res = await dataService.get('/sms/wells/contract/filter-details/paging', { params: { ...cachedParams, ...detailPageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  detailPageInfo.value = pagingResult;

  console.log(JSON.stringify(res.data, null, '\t'));
  const view = grdDetailRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(detailPageInfo);
}

// 조회버튼 클릭 이벤트
async function onClickSearch() {
  await fetchData();
}

// 초기화버튼 클릭 이벤트
async function onClickReset() {
  searchParams.value.pdCd = '';
  // searchParams.value.pdNm = '' ;
  // searchParams.value.svPdTpCd = '' ;
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'cntrMpNo' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'filterPdCd1' },
    { fieldName: 'filterPdNm1' },
    { fieldName: 'filterPdCd2' },
    { fieldName: 'filterPdNm2' },
    { fieldName: 'filterPdCd3' },
    { fieldName: 'filterPdNm3' },
    { fieldName: 'filterPdCd4' },
    { fieldName: 'filterPdNm4' },
    { fieldName: 'filterPdCd5' },
    { fieldName: 'filterPdNm5' },
    { fieldName: 'svPdTpCd' },
    { fieldName: 'svPdTpNm' },
    { fieldName: 'svPrd' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'sellTpNm' },
    { fieldName: 'mbGbn' },
    { fieldName: 'slDt' },
    { fieldName: 'cttDt' },
    { fieldName: 'istGbn' },
    { fieldName: 'filterAmt' },
    { fieldName: 'filterQty' },
    { fieldName: 'cttRsCd' },
    { fieldName: 'reCttYn' },
    { fieldName: 'cttPsicId' },
    { fieldName: 'sconCn' },
    { fieldName: 'istAkArtcMoCn' },
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '131', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '104', styleName: 'text-center' },
    {
      fieldName: 'cntrMpNo',
      header: t('MSG_TXT_MPNO'),
      styleName: 'text-center',
      width: '100',

      displayCallback(grid, index) {
        const { cralLocaraTno: no1, mexnoEncr: no2, cralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1)) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    { fieldName: 'cralLocaraTno', visible: false },
    { fieldName: 'mexnoEncr', visible: false },
    { fieldName: 'cralIdvTno', visible: false },
    { fieldName: 'filterPdCd1', header: `1.${t('MSG_TXT_FILTER_PROD')}`, width: '104', styleName: 'text-center' },
    { fieldName: 'filterPdNm1', header: `1.${t('MSG_TXT_FILTER_PROD_NM')}`, width: '197' },
    { fieldName: 'filterPdCd2', header: `2.${t('MSG_TXT_FILTER_PROD')}`, width: '104', styleName: 'text-center' },
    { fieldName: 'filterPdNm2', header: `2.${t('MSG_TXT_FILTER_PROD_NM')}`, width: '197' },
    { fieldName: 'filterPdCd3', header: `3.${t('MSG_TXT_FILTER_PROD')}`, width: '104', styleName: 'text-center' },
    { fieldName: 'filterPdNm3', header: `3.${t('MSG_TXT_FILTER_PROD_NM')}`, width: '197' },
    { fieldName: 'filterPdCd4', header: `4.${t('MSG_TXT_FILTER_PROD')}`, width: '104' },
    { fieldName: 'filterPdNm4', header: `4.${t('MSG_TXT_FILTER_PROD_NM')}`, width: '197' },
    { fieldName: 'filterPdCd5', header: `5.${t('MSG_TXT_FILTER_PROD')}`, width: '104' },
    { fieldName: 'filterPdNm5', header: `5.${t('MSG_TXT_FILTER_PROD_NM')}`, width: '197' },
    { fieldName: 'svPdTpNm', header: t('MSG_TXT_USWY_DV'), width: '104', styleName: 'text-center' },
    { fieldName: 'svPrd', header: `BS ${t('MSG_TXT_CYCL')}`, width: '104', styleName: 'text-right' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SEL_TYPE'), width: '104', styleName: 'text-center' },
    { fieldName: 'mbGbn', header: t('MSG_TXT_MSH_DV'), width: '104', styleName: 'text-center' },
    { fieldName: 'slDt', header: t('MSG_TXT_DT_OF_SALE'), width: '119', styleName: 'text-center' },
    { fieldName: 'cttDt', header: t('MSG_TXT_CTT_D'), width: '119', styleName: 'text-center' },
    { fieldName: 'istGbn', header: t('MSG_TXT_INST_CLS'), width: '93' },
    { fieldName: 'filterAmt', header: t('MSG_TXT_FLT_AMT'), width: '93' },
    { fieldName: 'filterQty', header: t('MSG_TXT_FLT_QUANT'), width: '93' },
    { fieldName: 'cttRsCd', header: t('MSG_TXT_CTT_CD'), width: '93' },
    { fieldName: 'reCttYn', header: t('MSG_TXT_RE_CNT'), width: '118' },
    { fieldName: 'cttPsicId', header: t('MSG_TXT_CTT_ICHR'), width: '93', styleName: 'text-center' },
    { fieldName: 'sconCn', header: t('MSG_TXT_SPL_TERMS'), width: '93' },
    { fieldName: 'istAkArtcMoCn', header: t('MSG_TXT_REFER_ARTC'), width: '93' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  // 필터 정보를 클릭하여 하단 상세보기
  view.onCellClicked = async (grid, { itemIndex }) => {
    const { cntrNo } = grid.getValues(itemIndex);
    searchDetailsParams.value.cntrNo = cntrNo;
    fetchDetailData();
  };
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

const initGrdDetail = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'svPdTpCd' },
    { fieldName: 'basePdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'pdQty' },
    { fieldName: 'frisuYn' },
    { fieldName: 'fnlAmt' },
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '131', styleName: 'text-center' },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '104', styleName: 'text-center' },
    { fieldName: 'svPdTpCd', header: t('MSG_TXT_USWY_DV'), width: '104', styleName: 'text-center' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_FILTER_PROD'), width: '104', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_FLT_NM'), width: '197' },
    { fieldName: 'pdQty', header: t('MSG_TXT_QTY'), width: '104', styleName: 'text-right' },
    { fieldName: 'frisuYn', header: t('MSG_TXT_EXPNS'), width: '104', styleName: 'text-right' },
    { fieldName: 'fnlAmt', header: t('MSG_TXT_AMT'), width: '104', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>

<style scoped>
</style>
