<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaRentalProductChangePsListM - 렌탈제품 교체 현황조회
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-05-31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_TASK_DIV')/* 업무구분 */"
          required
        >
          <kw-select
            v-model="searchParams.jobCd"
            :label="$t('MSG_TXT_TASK_DIV')/* 업무구분 */"
            :options="codes.JOB_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_IST_DT')/* 설치일자 */"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtdt"
            v-model:to="searchParams.enddt"
            :label="$t('MSG_TXT_IST_DT')/* 설치일자 */"
            rules="date_range_required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SLS_CAT')/* 판매구분 */"
        >
          <kw-select
            v-model="searchParams.sellOgTpCd"
            :label="$t('MSG_TXT_SLS_CAT')/* 판매구분 */"
            :options="codes.OG_TP_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')/* 상품코드 */"
        >
          <kw-input
            v-model="searchParams.basePdCd"
            :label="$t('MSG_TXT_PRDT_CODE')/* 상품코드 */"
            icon="search"
            maxlength="10"
            :rules="{regex:/^WP[0-9]{1,8}/}"
            :custom-messages="{
              'regex': $t('상품코드 형식에 맞게 입력해주세요.'),
              'is': $t('상품코드를 조회 후 선택해주세요.'),
            }"
            @click-icon="onClickSearchIconOfPdCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RGST_ICHR')/* 등록담당 */"
        >
          <kw-input
            v-model="prtnrNoSearch"
            :label="$t('MSG_TXT_RGST_ICHR')"
            icon="search"
            maxlength="7"
            mask="#######"
            :rules="`is:${prtnrNoSearch ? searchParams.sellPrtnrNo||'' : ''}`"
            :custom-messages="{
              'is': $t('파트너 번호를 조회 후 선택해주세요.')
            }"
            @click-icon="onClickSearchIconOfPrtnrNo"
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
            @change="fetchPage"
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
          :label="$t('MSG_TXT_RPT_BRWS')"
          icon="report"
          dense
          @click="onClickOzReport"
        />
      </kw-action-top>

      <kw-grid
        ref="grdRef"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        name="grd"
        @init="initGrd"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchPage"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import useGridDataModel from '~sms-common/contract/composable/useGridDataModel';
import {
  codeUtil,
  defineGrid,
  getComponentType,
  gridUtil,
  modal,
  useDataService,
  useMeta,
} from 'kw-lib';
import dayjs from 'dayjs';
import pdConst from '~sms-common/product/constants/pdConst';
import { openReportPopup } from '~common/utils/cmPopupUtil';
import { warn } from 'vue';

const { getUserInfo } = useMeta();
const userInfo = getUserInfo();
const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'OG_TP_CD',
  'SELL_TP_DTL_CD',
);
codes.JOB_CD = [
  { codeId: 'rental', codeName: t('MSG_TXT_RENTAL') /* 렌탈' */ },
  { codeId: 'lease', codeName: t('MSG_TXT_LEASE') /* 리스' */ },
];
const SERVER_DATE_FORMAT = 'YYYYMMDD';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
const grdView = computed(() => grdRef.value?.getView());
const grdData = computed(() => grdRef.value?.getData());

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
const searchParams = reactive({
  jobCd: '',
  strtdt: dayjs()
    .subtract(1, 'M')
    .startOf('M')
    .format(SERVER_DATE_FORMAT),
  enddt: dayjs()
    .subtract(1, 'M')
    .endOf('M')
    .format(SERVER_DATE_FORMAT),
  basePdCd: '',
  sellOgTpCd: '',
  sellPrtnrNo: '',
  sellPrtnrKnm: '',
});

const fetchPage = async (pageIndex = pageInfo.value.pageIndex, pageSize = pageInfo.value.pageSize) => {
  const params = {
    ...cachedParams,
    pageIndex,
    pageSize,
  };
  // console.log(JSON.stringify(params, null, '\t'));
  const response = await dataService.get('/sms/wells/contract/rental-change-products/paging', { params });

  pageInfo.value = response.data.pageInfo;
  grdData.value.setRows(response.data.list);
};

async function onClickSearchIconOfPdCd() {
  const { result, payload } = await modal({
    component: 'ZwpdcStandardListP', // ZwpdcServiceListP',
    componentProps: {
      searchType: pdConst.PD_SEARCH_CODE,
      searchValue: searchParams.basePdCd,
      selectType: pdConst.PD_SEARCH_SINGLE,
    },
  });
  if (result) {
    searchParams.basePdCd = payload[0].pdCd;
  } else {
    searchParams.basePdCd = '';
  }
}

const prtnrNoSearch = ref('');

async function onClickSearchIconOfPrtnrNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: prtnrNoSearch.value,
    },
  });
  if (result) {
    // console.log(JSON.stringify(payload, null, '\t'));
    searchParams.sellPrtnrNo = payload.prtnrNo;
    searchParams.sellPrtnrKnm = payload.prtnrKnm;
    prtnrNoSearch.value = payload.prtnrNo;
  } else {
    prtnrNoSearch.value = '';
  }
}

async function onClickExcelDownload() {
  if (!cachedParams) { return; }
  const response = await dataService.get('/sms/wells/contract/rental-change-products/excel-download', { params: cachedParams });
  await gridUtil.exportView(grdView.value, {
    fileName: currentRoute.value.meta?.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickOzReport() {
  const params = {
    ...cachedParams,
    ...pageInfo.value,
  };
  console.log(JSON.stringify(params, null, '\t'));
  const { data } = await dataService.get('/sms/wells/contract/rental-change-products/report', { params });
  if (!data?.list.length) {
    warn('OZ 리포트 정보가 존재하지 않습니다.');
    return;
  }

  const args = {
    jsondata: data.list,
    pritChpr: userInfo.userName, // 출력담당자
    reportHeaderTitle: '렌탈제품 교체 현황',
    srchWellsSetDt: `${params.strtdt}~${params.enddt}`, // 설치일자
    srchProdCd: params.basePdCd, // 상품코드
    wellsSaleCdNm: params.sellOgTpCd, // 판매구분
    srchEmpCd: params.sellOgTpCd, // 등록담당
  };

  const options = {
    displayName: '렌탈제품 교체 현황',
    treeViewTitle: '렌탈제품 교체 현황',
    width: 1100,
    height: 1200,
  };
  console.log(JSON.stringify(args, null, '\t'));
  console.log(JSON.stringify(options, null, '\t'));
  return openReportPopup(
    '/kstation-w/hdof/sls/slsRntlReplaceProdReport.ozr',
    '',
    JSON.stringify(args),
    options,
  );
}

async function onClickSearch() {
  cachedParams = { ...toRaw(searchParams) };
  pageInfo.value.pageIndex = 1;
  await fetchPage();
}
/// ------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd = defineGrid((data, view) => {
  useGridDataModel(view, {
    sellTpDtlCd: { label: t('MSG_TXT_TASK_DIV') /* 업무구분' */, width: 87, options: codes.SELL_TP_DTL_CD },
    sellOgTpCd: { label: t('MSG_TXT_SLS_CAT') /* 판매구분' */, width: 87, options: codes.OG_TP_CD },
    cntrNo: { displaying: false },
    cntrSn: { type: Number, displaying: false },
    cntrNoSn: {
      label: t('MSG_TXT_CNTR_DTL_NO'), /* 계약상세번호 */
      width: 167,
      valueExpression: 'values["cntrNo"] + "-" + values["cntrSn"]',
      classes: 'text-center',
    },
    chSn: { type: Number, label: `${t('MSG_TXT_PDCT')} SEQ` /* 제품SEQ' */, width: 87 },
    cstKnm: { label: t('MSG_TXT_CST_NM') /* 고객명' */, width: 87, styleName: 'text-center' },
    pdctIstDt: { label: t('MSG_TXT_INST_DT') /* 설치일' */, width: 120, datetimeFormat: 'date' },
    reqdSapMatCd: { label: `SAP${t('MSG_TXT_ITM_CD') /* 품목코드 */}`, width: 182, styleName: 'text-center' },
    reqdPcdtPdCd: { label: t('MSG_TXT_RVPY_CD') /* 수불코드' */, width: 96, styleName: 'text-center' },
    reqdPdCd: { label: t('TXT_MSG_PD_CD') /* 상품코드' */, width: 96, styleName: 'text-center' },
    reqdPdNm: { label: t('MSG_TXT_PRDT_NM') /* 상품명' */, width: 182 },
    reqdSapAssetNo: { label: t('MSG_TXT_ASET_NO') /* 자산번호' */, width: 117, styleName: 'text-center' },
    istSapMatCd: { label: `SAP${t('MSG_TXT_ITM_CD') /* 품목코드 */}`, width: 182, styleName: 'text-center' },
    istPcdtPdCd: { label: t('MSG_TXT_RVPY_CD') /* 수불코드' */, width: 96, styleName: 'text-center' },
    istPdCd: { label: t('TXT_MSG_PD_CD') /* 상품코드' */, width: 96, styleName: 'text-center' },
    istPdNm: { label: t('MSG_TXT_PRDT_NM') /* 상품명' */, width: 182 },
    istSapAssetNo: { label: t('MSG_TXT_ASET_NO') /* 자산번호' */, width: 117, styleName: 'text-center' },
    sellPrtnrNo: { label: t('MSG_TXT_CNT_PER') /* 담당자사번' */, width: 106, styleName: 'text-center' },
    prtnrNm: { label: t('MSG_TXT_PIC_NM') /* 담당자명' */, width: 87, styleName: 'text-center' },
  }, [
    'sellTpDtlCd', 'sellOgTpCd', 'cntrNoSn', 'chSn', 'cstKnm', 'pdctIstDt',
    {
      header: t('MSG_TXT_REQD_PDCT'), /* 철거제품 */
      direction: 'horizontal', // merge type
      items: [
        'reqdSapMatCd',
        'reqdPcdtPdCd',
        'reqdPdCd',
        'reqdPdNm',
        'reqdSapAssetNo',
      ],
    },
    {
      header: t('MSG_TXT_IST_PDCT'), /* 설치제품 */
      direction: 'horizontal',
      items: [
        'istSapMatCd',
        'istPcdtPdCd',
        'istPdCd',
        'istPdNm',
        'istSapAssetNo',
      ],
    },
    'sellPrtnrNo', 'prtnrNm',
  ]);

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

</script>
