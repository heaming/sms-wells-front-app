<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTD
2. 프로그램 ID : WwctdConfirmMembershipPresentStateListM - 확정 멤버십 현황 조회
3. 작성자 : gs.rahul.n -> joonghyung.kim
4. 작성일 : 2023.03.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 확정 멤버십 현황 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
      @reset="resetFrisuMshCrtYn"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_APPL_PRD')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.rcpStrtDt"
            v-model:to="searchParams.rcpEndDt"
            :label="$t('MSG_TXT_APPL_PRD')"
            :from-placeholder="$t('MSG_TXT_START_DATE')"
            :to-placeholder="$t('MSG_TXT_END_DATE')"
            rules="date_range_required"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_PRDT_CATE')">
          <kw-select
            v-model="searchParams.pdHclsfId"
            :options="codes.PD_HCLSF"
            first-option="all"
            first-option-val=""
            :placeholder="$t('MSG_TXT_ALL_CATG_LV1')"
            @change="onChangeHclsf"
          />
          <kw-select
            v-model="searchParams.pdMclsfId"
            :options="codes.PD_MCLSF"
            first-option="all"
            first-option-val=""
            :placeholder="$t('MSG_TXT_ALL_CATG_LV2')"
          />
        </kw-search-item>

        <!-- 상품코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')"
        >
          <kw-input
            v-model="searchParams.basePdCd"
            clearable
            icon="search"
            :maxlength="10"
            dense
            @click-icon="onClickSelectPdCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_FXD_PRD')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.cnfmStrtDt"
            v-model:to="searchParams.cnfmEndDt"
            :label="$t('MSG_TXT_FXD_PRD')"
            :from-placeholder="$t('MSG_TXT_START_DATE')"
            :to-placeholder="$t('MSG_TXT_END_DATE')"
            rules="date_range_required"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PRDT_NM')">
          <kw-input
            v-model="searchParams.pdNm"
          />
        </kw-search-item>
        <!-- 판매 구분 (판매조직유형코드) -->
        <kw-search-item :label="$t('MSG_TXT_SLS_CAT')">
          <kw-select
            v-model="searchParams.sellOgTpCd"
            :options="codes.OG_TP_CD"
            first-option="all"
            first-option-value=""
          />
          <span>&nbsp;</span>
          <kw-checkbox
            v-model="searchParams.frisuMshCrtYn"
            :label="$t('MSG_TXT_EXL_AUT_GEN')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PRTNR_NUM')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            clearable
            :label="$t('MSG_TXT_PRTNR_NUM')"
            rules="numeric|max:10"
            @click-icon="onClickOpenPartnerListPopup"
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
          <span>{{ t('MSG_TXT_UNIT_MCNT') }}</span> <!-- 단위:개월 -->
        </template>
        <kw-btn
          icon="download_on"
          :disable="pageInfo.totalCount === 0"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
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
import { defineGrid, getComponentType, useMeta, useGlobal, useDataService, gridUtil, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import dayjs from 'dayjs';

const { getConfig } = useMeta();
const { modal } = useGlobal();
const { t } = useI18n();
const now = dayjs();
const dataService = useDataService();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'OG_TP_CD',
);

await Promise.allSettled([
  dataService.get('/sms/common/contract/products/hclsf')
    .then((response) => { codes.PD_HCLSF = response.data; }),
  dataService.get('/sms/common/contract/products/mclsf')
    .then((response) => { codes.PD_MCLSF_ALL = response.data; }),
]);

codes.PD_MCLSF = cloneDeep(codes.PD_MCLSF_ALL);

const searchParams = ref({
  rcpStrtDt: now.format('YYYYMM01'),
  rcpEndDt: now.format('YYYYMMDD'),
  pdHclsfId: '',
  pdMclsfId: '',
  basePdCd: '',
  cnfmStrtDt: now.format('YYYYMM01'),
  cnfmEndDt: now.format('YYYYMMDD'),
  pdNm: '',
  sellOgTpCd: '',
  frisuMshCrtYn: 'N',
  prtnrNo: '',
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function resetFrisuMshCrtYn() {
  searchParams.value.frisuMshCrtYn = 'N';
}
async function onChangeHclsf(hclsf) {
  if (isEmpty(hclsf)) {
    codes.PD_MCLSF = codes.PD_MCLSF_ALL;
  } else {
    codes.PD_MCLSF = codes.PD_MCLSF_ALL.filter((code) => hclsf === code.hgrPdClsfId);
  }
  searchParams.value.pdMclsfId = '';
}
// 상품코드 검색아이콘 클릭
async function onClickSelectPdCd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.basePdCd,
    selectType: '',
  };

  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });

  if (returnPdInfo.result) {
    searchParams.value.basePdCd = returnPdInfo.payload?.[0].pdCd;
  }
}

// 파트너 조회 팝업
async function onClickOpenPartnerListPopup() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

let cachedParams;
async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/memberships/paging', { params: { ...cachedParams, ...pageInfo.value } });

  // console.log(res.status);
  // console.log(res.data);
  const { list: details, pageInfo: pagingResult } = res.data;

  if (pagingResult) {
    pageInfo.value = pagingResult;
  }

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(details);
  view.resetCurrent();
  if (details?.length > 0) {
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);

  await fetchData();
}

const { currentRoute } = useRouter();
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/memberships/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
    searchConditions: true,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'sellTpNm' },
    { fieldName: 'sellOgTpNm' },
    { fieldName: 'pdHclsfNm' },
    { fieldName: 'pdMclsfNm' },
    { fieldName: 'basePdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'frisuBfsvcPtrmN' },
    { fieldName: 'frisuMshCrtYn' },
    { fieldName: 'nationSptYn' },
    { fieldName: 'feeYn' },
    { fieldName: 'prmYn' },
    { fieldName: 'ogCd' },
    { fieldName: 'sellPrtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvNm' },
    { fieldName: 'cntrRcpFshDt' },
    { fieldName: 'cntrCnfmYn' },
    { fieldName: 'cntrCnfmDt' },
    { fieldName: 'cntrPdStrtdt' },
    { fieldName: 'cntrPdEnddt' },
    { fieldName: 'cntrCanDt' },
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '151', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '112', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SEL_TYPE'), width: '112', styleName: 'text-center' },
    { fieldName: 'sellOgTpNm', header: t('MSG_TXT_SLS_CAT'), width: '112', styleName: 'text-center' },
    { fieldName: 'pdHclsfNm', header: t('MSG_TXT_PD_HCLSF'), width: '112', styleName: 'text-center' },
    { fieldName: 'pdMclsfNm', header: t('TXT_MSG_PD_MCLSF_ID'), width: '112', styleName: 'text-center' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '112', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '250' },
    { fieldName: 'frisuBfsvcPtrmN', header: t('MSG_TXT_MEM_FREE_MN'), width: '154', styleName: 'text-right' },
    { fieldName: 'frisuMshCrtYn', header: t('MSG_TXT_FREE_MEM_CRT'), width: '154', styleName: 'text-center' },
    { fieldName: 'nationSptYn', header: t('MSG_TXT_STT_SUB'), width: '154', styleName: 'text-center' },
    { fieldName: 'feeYn', header: t('MSG_TXT_FEE_PD_YN'), width: '154', styleName: 'text-center' },
    { fieldName: 'prmYn', header: t('MSG_TXT_PRE_PAY'), width: '154', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_HDQ'), width: '154' },
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_PRTNR_NO'), width: '154' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PTNR_NAME'), width: '154', styleName: 'text-center' },
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_CRLV'), width: '154', styleName: 'text-center' },
    { fieldName: 'cntrRcpFshDt', header: t('MSG_TXT_RCP_D'), width: '154', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrCnfmYn', header: t('MSG_TXT_DTRM_YN'), width: '154', styleName: 'text-center' },
    { fieldName: 'cntrCnfmDt', header: t('MSG_TXT_DTRM_DATE'), width: '154', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_SUBS_DT'), width: '154', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrPdEnddt', header: t('MSG_TXT_WDWAL_DT'), width: '154', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrCanDt', header: t('MSG_TXT_CAN_D'), width: '154', styleName: 'text-center', datetimeFormat: 'date' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.setColumnLayout([
    {
      header: t('MSG_TXT_MEM_APPL_CONF_STT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['cntrDtlNo', 'cstKnm', 'sellTpNm', 'sellOgTpNm', 'pdHclsfNm',
        'pdMclsfNm', 'basePdCd', 'pdNm'],
    },

    {
      header: t('MSG_TXT_ONE_TIM_PAY_ORD_STT'),
      direction: 'horizontal',
      items: ['frisuBfsvcPtrmN', 'frisuMshCrtYn', 'nationSptYn', 'feeYn'],
    },

    {
      header: t('MSG_TXT_MEM_APPL_CONF_STT'),
      direction: 'horizontal',
      items: ['prmYn', 'ogCd', 'sellPrtnrNo', 'prtnrKnm', 'rsbDvNm', 'cntrRcpFshDt',
        'cntrCnfmYn', 'cntrCnfmDt', 'cntrPdStrtdt', 'cntrPdEnddt', 'cntrCanDt'],
    },
  ]);

  data.setRows([]);
});
</script>

<style scoped>
</style>
