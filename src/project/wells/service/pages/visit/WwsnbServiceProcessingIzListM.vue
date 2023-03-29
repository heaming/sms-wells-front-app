<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNB (방문관리)
 2. 프로그램 ID : WwsnbServiceProcessingIzListM - 서비스처리 내역
 3. 작성자 : hyewon.kim
 4. 작성일 : 2023.03.14
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 서비스처리 내역 (http://localhost:3000/#/service/wwsnb-service-processing-iz-list)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 서비스유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_SV_TP')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.serviceType"
            :options="serviceTypes"
            first-option="all"
          />
          <kw-select
            v-model="searchParams.serviceCenter"
            :options="services.G_ONLY_SVC"
            first-option="all"
            option-label="ogNm"
            option-value="ogCd"
          />
          <kw-select
            v-model="searchParams.engineer"
            :options="engineers"
            first-option="all"
            option-label="codeNm"
          />
        </kw-search-item>

        <!-- 유/무상구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_REFRI_DV')"
        >
          <kw-select
            v-model="searchParams.refriType"
            :options="refriTypes"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 상품그룹 -->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            class="w233"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="products"
            first-option="all"
          />
        </kw-search-item>

        <!-- 조회기준 -->
        <kw-search-item
          :label="$t('MSG_TXT_INQR_BASE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.inquiryBase"
            :options="inquiryBases"
            class="w198"
          />
          <kw-date-range-picker
            v-model:from="searchParams.baseDateFrom"
            v-model:to="searchParams.baseDateTo"
            rules="date_range_months:1"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 업무유형 -->
        <kw-search-item :label="$t('MSG_TXT_TASK_TYPE')">
          <kw-select
            v-model="searchParams.svBizDclsfCd"
            :options="codes.SV_BIZ_DCLSF_CD"
            first-option="all"
            class="w233"
          />
        </kw-search-item>

        <!-- 작업상태 -->
        <kw-search-item :label="$t('MSG_TXT_WK_STS')">
          <kw-select
            v-model="searchParams.wkPrgsStatCd"
            :options="codes.WK_PRGS_STAT_CD"
            first-option="all"
          />
        </kw-search-item>

        <!-- 설치기준 -->
        <kw-search-item
          :label="$t('MSG_TXT_IST_BASE')"
        >
          <kw-select
            v-model="searchParams.installBase"
            :options="installBases"
            first-option="all"
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
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <ul class="filter-box">
        <li class="filter-box__item">
          <!-- 상품군 -->
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_PDGRP') }}
          </p>
          <kw-select
            v-model="searchParams.pdGb"
            dense
            first-option="all"
            :options="codes.PD_GRP_CD"
            @update:model-value="onUpdateProductGroupCode"
          />
        </li>
      </ul>

      <kw-grid
        ref="grdMainRef"
        class="mt12"
        :visible-rows="pageInfo.pageSize"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import useSnCode from '~sms-wells/service/composables/useSnCode';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { getAllEngineers } = useSnCode();

const router = useRouter();
const dataService = useDataService();

const serviceTypes = [
  { codeId: '1', codeName: '설치' },
  { codeId: '2', codeName: 'A/S' },
  { codeId: '3', codeName: '홈케어' },
  { codeId: '9', codeName: '홈쇼핑설치만' },
  { codeId: '10', codeName: '리콜' },
];

const refriTypes = [
  { codeId: '1', codeName: '유상서비스' },
  { codeId: '2', codeName: '무상서비스' },
  { codeId: '3', codeName: '유상(아웃소싱제외)' },
  { codeId: '4', codeName: '유상(아웃소싱)' },
];

const inquiryBases = [
  { codeId: '1', codeName: '접수일자' },
  { codeId: '2', codeName: '처리일자' },
  { codeId: '3', codeName: '방문확정일' },
  { codeId: '4', codeName: '예정일자' },
];

const installBases = [
  { codeId: '1', codeName: '1년 이내' },
];

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  serviceType: '',
  serviceCenter: '',
  engineer: '',
  refriType: '',
  pdGrpCd: '',
  pdCd: '',
  svBizDclsfCd: '',
  inquiryBase: '2',
  baseDateFrom: dayjs().format('YYYYMMDD'),
  baseDateTo: dayjs().format('YYYYMMDD'),
  wkPrgsStatCd: '',
  installBase: '',
  pdGb: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
  'SV_BIZ_HCLSF_CD',
  'SV_BIZ_DCLSF_CD',
  'WK_PRGS_STAT_CD',
  'COPN_DV_CD', // 법인격구분코드
  'SELL_TP_CD', // 판매유형코드
  'SV_VST_PRD_CD', // 서비스방문주기코드
  'WK_PRGS_STAT_CD', // 작업진행상태코드
  'RCP_CAN_RSON_CD', // 접수취소사유코드
  'AS_LCT_CD', // AS위치코드
  'AS_PHN_CD', // AS현상코드
  'AS_CAUS_CD', // AS원인코드
  'PROCS_FOM_CD', // 처리형태
  'WK_DTM_CH_RSON_CD', // 작업일시변경사유코드
);

const services = await getAllEngineers();
const engineers = ref(services.G_ONLY_ENG);
const filters = codes.PD_GRP_CD.map((v) => ({ name: v.codeId, criteria: `value = '${v.codeId}'` }));

watch(() => searchParams.value.serviceCenter, async (val) => {
  if (val !== '') {
    engineers.value = services.G_ONLY_ENG.filter((v) => v.ogCd === val);
  } else {
    engineers.value = services.G_ONLY_ENG;
  }
}, { immediate: true });

const products = ref([]);
async function fetchProducts() {
  const res = await dataService.get('/sms/wells/service/service-processing-itemizations/products', { params: { pdGrpCd: searchParams.value.pdGrpCd } });
  products.value = res.data;
}

watch(() => searchParams.value.pdGrpCd, async (val) => {
  if (val === '') {
    products.value = [];
    return;
  }
  await fetchProducts();
}, { immediate: true });

function onUpdateProductGroupCode(val) {
  const view = grdMainRef.value.getView();
  view.activateAllColumnFilters('pdGrpCd', false);

  if (val === '') {
    pageInfo.value.totalCount = view.getItemCount();
    return;
  }

  view.activateColumnFilters('pdGrpCd', [val], true);
  pageInfo.value.totalCount = view.getItemCount();
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/service-processing-itemizations/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: itemizations, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(itemizations);
  view.resetCurrent();

  searchParams.value.pdGb = '';

  view.autoFiltersRefresh('pdGrpCd', false);
  view.setColumnFilters('pdGrpCd', filters, true);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/service-processing-itemizations/paging', { params: { ...cachedParams, ...pageInfo.value } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data.list,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'copnDvCd' },
    { fieldName: 'alncmpCd' },
    { fieldName: 'sellPrpNuval' },
    { fieldName: 'alncBzsCd' },
    { fieldName: 'frisuYn' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'wtholIstYn' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'radr' },
    { fieldName: 'svPrd' },
    { fieldName: 'cntrCnfmDtm', dataType: 'datetime' },
    { fieldName: 'pdNm' },
    { fieldName: 'pdGrpCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'modelNm' },
    { fieldName: 'scnYn' },
    { fieldName: 'bfMnftCoId' },
    { fieldName: 'bcNo' },
    { fieldName: 'prdtYm' },
    { fieldName: 'channelNm' },
    { fieldName: 'gnrdv' },
    { fieldName: 'rgrp' },
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'cnslDtlpTpCd' },
    { fieldName: 'istDt', dataType: 'datetime' },
    { fieldName: 'useMcn' },
    { fieldName: 'svBizHclsfCd' },
    { fieldName: 'svBizDclsfCd' },
    { fieldName: 'ptyCstNo' },
    { fieldName: 'cstmwFiltPdCd' },
    { fieldName: 'asRefriDvNm' },
    { fieldName: 'bfsvcRefriDvNm' },
    { fieldName: 'refriDvNm' },
    { fieldName: 'egerCnrNm' },
    { fieldName: 'rpbLocaraCd' },
    { fieldName: 'ichrCnrSdingDidy' },
    { fieldName: 'prtnr' },
    { fieldName: 'prtnrPstnDv' },
    { fieldName: 'siteAwDvNm' },
    { fieldName: 'siteAwAmt', dateType: 'number' },
    { fieldName: 'rglvlGdCd', dateType: 'number' },
    { fieldName: 'awAmt', dateType: 'number' },
    { fieldName: 'locaraChaosYn', dateType: 'number' },
    { fieldName: 'locaraChaosAwAmt', dateType: 'number' },
    { fieldName: 'siteAwTot', dateType: 'number' },
    { fieldName: 'contactCralLocaraTno' },
    { fieldName: 'rcpdt', dataType: 'datetime' },
    { fieldName: 'rcpHh' },
    { fieldName: 'vstDuedt', dataType: 'datetime' },
    { fieldName: 'vstExpHh' },
    { fieldName: 'vstRqdt' },
    { fieldName: 'vstCnfmdt', dataType: 'datetime' },
    { fieldName: 'vstCnfmHh' },
    { fieldName: 'dtmChCausCd' },
    { fieldName: 'dtmChRsonCd' },
    { fieldName: 'dtmChRsonDtlCn' },
    { fieldName: 'mmsYn' },
    { fieldName: 'istCtfMtmsFwYn' },
    { fieldName: 'promHh' },
    { fieldName: 'arvDtm', dateType: 'datetime' },
    { fieldName: 'vstFshDtm' },
    { fieldName: 'instDelay' },
    { fieldName: 'wkLdtm' },
    { fieldName: 'wkPrgsStatCd' },
    { fieldName: 'wkCanRsonCd' },
    { fieldName: 'wkCanMoCn' },
    { fieldName: 'pmotDvVal' },
    { fieldName: 'badDvCd' },
    { fieldName: 'asLctCdNm' },
    { fieldName: 'asPhnCdNm' },
    { fieldName: 'asCausCd' },
    { fieldName: 'svProcsFomCd' },
    { fieldName: 'imptaRsonCd' },
    { fieldName: 'asCdEyn' },
    { fieldName: 'sftAcdnYn' },
    { fieldName: 'plsSvYn' },
    { fieldName: 'peslArtcDfrnYn' },
    { fieldName: 'cwtrWprsVal' },
    { fieldName: 'wwtWprsVal' },
    { fieldName: 'per1mOlqVal' },
    { fieldName: 'istPlcTpCd' },
    { fieldName: 'rcvryOpt' },
    { fieldName: 'resultDtl' },
    { fieldName: 'svProcsCn' },
    { fieldName: 'pu1Part' },
    { fieldName: 'pu2Part' },
    { fieldName: 'pu3Part' },
    { fieldName: 'pu4Part' },
    { fieldName: 'pu5Part' },
    { fieldName: 'pu6Part' },
    { fieldName: 'pu7Part' },
    { fieldName: 'pu8Part' },
    { fieldName: 'pu9Part' },
    { fieldName: 'pu10Part' },
    { fieldName: 'partCs', dateType: 'number' },
    { fieldName: 'tcfee', dateType: 'number' },
    { fieldName: 'bstrCs', dateType: 'number' },
    { fieldName: 'etcCs', dateType: 'number' },
    { fieldName: 'rveCsTot', dateType: 'number' },
    { fieldName: 'cashStlm', dateType: 'number' },
    { fieldName: 'cardStlm', dateType: 'number' },
    { fieldName: 'elcStlm', dateType: 'number' },
    { fieldName: 'crcdcoCd', dateType: 'number' },
    { fieldName: 'cstSignHsYn' },
    { fieldName: 'istEnvrPhoPhCn' },
    { fieldName: 'acpnPrtnr' },
    { fieldName: 'pstnNm' },
    { fieldName: 'cmpaSiteAwAtcNm' },
    { fieldName: 'cmpaSiteAwAmt', dateType: 'number' },
  ];

  const columns = [
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      footer: { text: t('MSG_TXT_SUM') },
      renderer: {
        type: 'button',
      } }, // 계약번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100' }, // 고객명
    { fieldName: 'copnDvCd',
      header: t('MSG_TXT_INDV_CRP_DV'),
      width: '150',
      styleName: 'text-center',
      options: codes.COPN_DV_CD }, // 개인법인구분
    { fieldName: 'alncmpCd', header: t('MSG_TXT_CTT_ICHR'), width: '100', styleName: 'text-center' }, // 컨택담당
    { fieldName: 'sellPrpNuval', header: t('MSG_TXT_HSP'), width: '150', styleName: 'text-center' }, // 홈쇼핑
    { fieldName: 'alncBzsCd', header: t('MSG_TXT_ALNC'), width: '150', styleName: 'text-center' }, // 제휴
    { fieldName: 'frisuYn', header: t('MSG_TXT_FRE_EXPN'), width: '100', styleName: 'text-center' }, // 무료체험
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_CST_TYPE'),
      width: '100',
      styleName: 'text-center',
      options: codes.SELL_TP_CD }, // 고객유형
    { fieldName: 'wtholIstYn', header: t('MSG_TXT_WTHOL_IST'), width: '100', styleName: 'text-center' }, // 조리수설치
    { fieldName: 'cralLocaraTno', header: t('MSG_TXT_MPNO'), width: '150', styleName: 'text-center' }, // 휴대전화번호
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' }, // 우편번호
    { fieldName: 'radr', header: t('MSG_TXT_ADDR'), width: '145', styleName: 'text-center' }, // 주소
    { fieldName: 'svPrd',
      header: t('MSG_TXT_VST_PRD_TYPE'),
      width: '145',
      styleName: 'text-center',
      options: codes.SV_VST_PRD_CD }, // 방문주기타입
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTR_DATE'), width: '145', styleName: 'text-center', datetimeFormat: 'date' }, // 계약일자
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '145' }, // 상품명
    { fieldName: 'pdGrpCd',
      header: t('MSG_TXT_PDGRP'),
      width: '145',
      styleName: 'text-center',
      options: codes.PD_GRP_CD,
      autoFilter: false }, // 상품군
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '145', styleName: 'text-center' }, // 품목코드
    { fieldName: 'modelNm', header: t('MSG_TXT_MDL_NM'), width: '145' }, // 모델명
    { fieldName: 'scnYn', header: t('MSG_TXT_SCN'), width: '145', styleName: 'text-center' }, // 스캔
    { fieldName: 'bfMnftCoId', header: t('MSG_TXT_BF_MNFT_NO'), width: '145' }, // 이전제조번호
    { fieldName: 'bcNo', header: t('MSG_TXT_MNFT_NO'), width: '145' }, // 제조번호
    { fieldName: 'prdtYm', header: t('MSG_TXT_MNFT_YM'), width: '145' }, // 제조년월
    { fieldName: 'channelNm', header: t('MSG_TXT_RCP_DV'), width: '145' }, // 접수구분
    { fieldName: 'gnrdv', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '145' }, // 총괄단
    { fieldName: 'rgrp', header: t('MSG_TXT_RGNL_GRP'), width: '145' }, // 지역단
    { fieldName: 'ogNm', header: t('MSG_TXT_RCST_BLG'), width: '145' }, // 접수자소속
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_RCST_MARK'), width: '145' }, // 접수자표시
    { fieldName: 'cnslDtlpTpCd', header: t('MSG_TXT_RCP_IZ'), width: '145' }, // 접수내역
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '145', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일자
    { fieldName: 'useMcn', header: t('MSG_TXT_USE_MCNT'), width: '145', styleName: 'text-right' }, // 사용개월
    { fieldName: 'svBizHclsfCd',
      header: t('MSG_TXT_SV_TP'),
      width: '145',
      styleName: 'text-center',
      options: codes.SV_BIZ_HCLSF_CD }, // 서비스유형
    { fieldName: 'svBizDclsfCd',
      header: t('MSG_TXT_SV_TP_DTL'),
      width: '145',
      styleName: 'text-center',
      options: codes.SV_BIZ_DCLSF_CD }, // 서비스유형상세
    { fieldName: 'ptyCstNo', header: t('MSG_TXT_PTY_CST_NO'), width: '145', styleName: 'text-center' }, // 상대고객번호
    { fieldName: 'cstmwFiltPdCd', header: t('MSG_TXT_NX_BFSVC_CSTMW_FILT'), width: '145', styleName: 'text-center' }, // 차기 BS 맞춤형 필터
    { fieldName: 'asRefriDvNm', header: t('MSG_TXT_AS_CST_DV'), width: '145', styleName: 'text-center' }, // A/S고객구분
    { fieldName: 'bfsvcRefriDvNm', header: t('MSG_TXT_BFSVC_CST_DV'), width: '145', styleName: 'text-center' }, // B/S고객구분
    { fieldName: 'refriDvNm', header: t('MSG_TXT_REFRI_DV'), width: '145', styleName: 'text-center' }, // 유/무상구분
    { fieldName: 'egerCnrNm', header: t('MSG_TXT_ICHR_CNR'), width: '145', styleName: 'text-center' }, // 담당센터
    { fieldName: 'rpbLocaraCd', header: t('MSG_TXT_RPB_LOCARA'), width: '145', styleName: 'text-center' }, // 책임지역
    { fieldName: 'ichrCnrSdingDidy', header: t('MSG_TXT_ICHR_CNR_SDING_DIDY'), width: '145', styleName: 'text-center' }, // 담당센터(모종직배)
    { fieldName: 'prtnr', header: t('MSG_TXT_ICHR_EGER'), width: '145', styleName: 'text-center' }, // 담당엔지니어
    { fieldName: 'prtnrPstnDv', header: t('MSG_TXT_PSTN_DV'), width: '145', styleName: 'text-center' }, // 직급구분
    { fieldName: 'siteAwDvNm', header: t('MSG_TXT_ITEM_NM'), width: '145', styleName: 'text-center' }, // 현장수당(항목명)
    { fieldName: 'siteAwAmt', header: t('MSG_TXT_AMT'), width: '145', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 현장수당(금액)
    { fieldName: 'rglvlGdCd', header: t('MSG_TXT_RGLVL'), width: '145', styleName: 'text-center', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 현장수당(급지)
    { fieldName: 'awAmt', header: t('MSG_TXT_AMT'), width: '145', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 현장수당(금액)
    { fieldName: 'locaraChaosYn', header: t('MSG_TXT_CHAOS_LOCARA'), width: '145', styleName: 'text-center', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 현장수당(혼잡지역)
    { fieldName: 'locaraChaosAwAmt', header: t('MSG_TXT_AMT'), width: '145', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 현장수당(금액)
    { fieldName: 'siteAwTot', header: t('MSG_TXT_TOT_SUM'), width: '145', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 현장수당(총계)
    { fieldName: 'contactCralLocaraTno', header: t('MSG_TXT_CTPLC_CPHON'), width: '145', styleName: 'text-center' }, // 연락처(핸드폰)
    { fieldName: 'rcpdt', header: t('MSG_TXT_RCPDT'), width: '145', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일자
    { fieldName: 'rcpHh', header: t('MSG_TXT_RCP_DTM'), width: '145', styleName: 'text-center' }, // 접수일시
    { fieldName: 'vstDuedt', header: t('MSG_TXT_SCHD_DT'), width: '145', styleName: 'text-center', datetimeFormat: 'date' }, // 예정일자
    { fieldName: 'vstExpHh', header: t('MSG_TXT_EXP_DTM'), width: '145', styleName: 'text-center', datetimeFormat: 'time' }, // 예정일시
    { fieldName: 'vstRqdt', header: t('MSG_TXT_CH'), width: '145', styleName: 'text-center' }, // 변경
    { fieldName: 'vstCnfmdt', header: t('MSG_TXT_CNFM_DT'), width: '145', styleName: 'text-center', datetimeFormat: 'date' }, // 확정일자
    { fieldName: 'vstCnfmHh', header: t('MSG_TXT_CNFM_DTM'), width: '145', styleName: 'text-center', datetimeFormat: 'time' }, // 확정일시
    { fieldName: 'dtmChCausCd',
      header: t('MSG_TXT_CH_CAUS'),
      width: '145',
      options: codes.WK_DTM_CH_RSON_CD }, // 변경원인
    { fieldName: 'dtmChRsonCd',
      header: t('MSG_TXT_CH_RSON'),
      width: '145',
      options: codes.WK_DTM_CH_RSON_DTL_CD }, // 변경사유
    { fieldName: 'dtmChRsonDtlCn', header: t('MSG_TXT_CH_RSON_DTL'), width: '145' }, // 변경사유상세
    { fieldName: 'mmsYn', header: t('MSG_TXT_MMS'), width: '145', styleName: 'text-center' }, // MMS
    { fieldName: 'promHh', header: t('MSG_TXT_PROM_HH'), width: '145', styleName: 'text-center' }, // 약속시간
    { fieldName: 'arvDtm', header: t('MSG_TXT_ARV'), width: '145', styleName: 'text-center', datetimeFormat: 'datetime' }, // 작업시간(도착)
    { fieldName: 'vstFshDtm', header: t('MSG_TXT_COMPLETE'), width: '145', styleName: 'text-center', datetimeFormat: 'datetime' }, // 작업시간(완료)
    { fieldName: 'instDelay', header: t('MSG_TXT_IST_PSP_D'), width: '145', styleName: 'text-right', datetimeFormat: 'date' }, // 설치지연일
    { fieldName: 'wkLdtm', header: t('MSG_TXT_LDTM'), width: '145', styleName: 'text-right' }, // 소요시간
    { fieldName: 'wkPrgsStatCd',
      header: t('MSG_TXT_WK_STS'),
      width: '145',
      styleName: 'text-center',
      options: codes.WK_PRGS_STAT_CD }, // 작업상태
    { fieldName: 'wkCanRsonCd',
      header: t('MSG_TXT_CAN_RSON'),
      width: '145',
      options: codes.RCP_CAN_RSON_CD }, // 취소사유
    { fieldName: 'wkCanMoCn', header: t('MSG_TXT_DTL_IZ'), width: '145' }, // 상세내역
    { fieldName: 'pmotDvVal', header: t('MSG_TXT_FGPT'), width: '145', styleName: 'text-center' }, // 사은품
    { fieldName: 'badDvCd', header: t('MSG_TXT_BAD_DV'), width: '145' }, // 결과입력(불량구분)
    { fieldName: 'asLctCdNm',
      header: t('MSG_TXT_FLT_LCT'),
      width: '145',
      options: codes.AS_LCT_CD }, // 결과입력(고장위치)
    { fieldName: 'asPhnCdNm',
      header: t('MSG_TXT_FLT_PHN'),
      width: '145',
      options: codes.AS_PHN_CD }, // 결과입력(고장현상)
    { fieldName: 'asCausCd',
      header: t('MSG_TXT_LCT_DTL'),
      width: '145',
      options: codes.AS_CAUS_CD }, // 결과입력(위치상세)
    { fieldName: 'svProcsFomCd',
      header: t('MSG_TXT_PROCS_FOM'),
      width: '145',
      options: codes.PROCS_FOM_CD }, // 결과입력(처리형태)
    { fieldName: 'imptaRsonCd', header: t('MSG_TXT_IMPT'), width: '145' }, // 결과입력(귀책)
    { fieldName: 'asCdEyn', header: t('MSG_TXT_AS_CD_NTHNG'), width: '145', styleName: 'text-center' }, // AS코드없음
    { fieldName: 'sftAcdnYn', header: t('MSG_TXT_SFT_ACDN'), width: '145', styleName: 'text-center' }, // 안전사고
    { fieldName: 'plsSvYn', header: t('MSG_TXT_PLS_SV'), width: '145', styleName: 'text-center' }, // 플러스서비스
    { fieldName: 'peslArtcDfrnYn', header: t('MSG_TXT_PESL_ARTC_DIFF'), width: '145', styleName: 'text-center' }, // 인적사항다름
    { fieldName: 'cwtrWprsVal', header: t('MSG_TXT_WPRS_COLD'), width: '145', styleName: 'text-center' }, // 수압(냉)
    { fieldName: 'wwtWprsVal', header: t('MSG_TXT_WPRS_HOT'), width: '145', styleName: 'text-center' }, // 수압(온)
    { fieldName: 'per1mOlqVal', header: t('MSG_TXT_OLQ'), width: '145', styleName: 'text-center' }, // 유량
    { fieldName: 'istPlcTpCd', header: t('MSG_TXT_IST_TP'), width: '145', styleName: 'text-center' }, // 설치유형
    { fieldName: 'rcvryOpt', header: t('MSG_TXT_RCVRY_OPT'), width: '145', styleName: 'text-center' }, // 복구옵션
    { fieldName: 'resultDtl', header: t('MSG_TXT_DTL'), width: '145' }, // 상세
    { fieldName: 'svProcsCn', header: t('MSG_TXT_DTL_IZ'), width: '145' }, // 상세내역
    { fieldName: 'pu1Part', header: t('MSG_TXT_PART01'), width: '145', styleName: 'text-center' }, // 투입부품(부품01)
    { fieldName: 'pu2Part', header: t('MSG_TXT_PART02'), width: '145', styleName: 'text-center' }, // 투입부품(부품02)
    { fieldName: 'pu3Part', header: t('MSG_TXT_PART03'), width: '145', styleName: 'text-center' }, // 투입부품(부품03)
    { fieldName: 'pu4Part', header: t('MSG_TXT_PART04'), width: '145', styleName: 'text-center' }, // 투입부품(부품04)
    { fieldName: 'pu5Part', header: t('MSG_TXT_PART05'), width: '145', styleName: 'text-center' }, // 투입부품(부품05)
    { fieldName: 'pu6Part', header: t('MSG_TXT_PART06'), width: '145', styleName: 'text-center' }, // 투입부품(부품06)
    { fieldName: 'pu7Part', header: t('MSG_TXT_PART07'), width: '145', styleName: 'text-center' }, // 투입부품(부품07)
    { fieldName: 'pu8Part', header: t('MSG_TXT_PART08'), width: '145', styleName: 'text-center' }, // 투입부품(부품08)
    { fieldName: 'pu9Part', header: t('MSG_TXT_PART09'), width: '145', styleName: 'text-center' }, // 투입부품(부품09)
    { fieldName: 'pu10Part', header: t('MSG_TXT_PART10'), width: '145', styleName: 'text-center' }, // 투입부품(부품10)
    { fieldName: 'partCs', header: t('MSG_TXT_PART_COST'), width: '145', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 수납(부품비)
    { fieldName: 'tcfee', header: t('MSG_TXT_TCFEE'), width: '145', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 수납(기술료)
    { fieldName: 'bstrCs', header: t('MSG_TXT_BSTR_CS'), width: '145', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 수납(출장료)
    { fieldName: 'etcCs', header: t('MSG_TXT_ETC_CS'), width: '145', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 수납(기타비용)
    { fieldName: 'rveCsTot', header: t('MSG_TXT_AGG'), width: '145', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 수납(계)
    { fieldName: 'cashStlm', header: t('MSG_TXT_CASH'), width: '145', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 결제(현금)
    { fieldName: 'cardStlm', header: t('MSG_TXT_CARD'), width: '145', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 결제(카드)
    { fieldName: 'elcStlm', header: t('MSG_TXT_ELC_STLM'), width: '145', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 결제(전자결제)
    { fieldName: 'crcdcoCd', header: t('MSG_TXT_CDCO'), width: '145', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 결제(카드사)
    { fieldName: 'cstSignHsYn', header: t('MSG_BTN_CST_SIGN'), width: '145', styleName: 'text-center' }, // 고객서명
    { fieldName: 'istEnvrPhoPhCn', header: t('MSG_TXT_PHO'), width: '145', styleName: 'text-center' }, // 사진
    { fieldName: 'acpnPrtnr', header: t('MSG_TXT_CMPA_NM'), width: '145', styleName: 'text-center' }, // 동행작업자(동행자명)
    { fieldName: 'pstnNm', header: t('MSG_TXT_PSTN_DV'), width: '145', styleName: 'text-center' }, // 동행작업자(직급구분)
    { fieldName: 'cmpaSiteAwAtcNm', header: t('MSG_TXT_ITEM_NM'), width: '145', styleName: 'text-center' }, // 현장수당(항목명)
    { fieldName: 'cmpaSiteAwAmt', header: t('MSG_TXT_AMT'), width: '145', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0' } }, // 현장수당(금액)
  ];

  data.setFields(fields);
  view.setColumns(columns);

  const columnLayout = [
    { column: 'cntrNo', footerUserSpans: [{ colspan: 2 }] },
    'cstKnm',
    'copnDvCd',
    'alncmpCd',
    'sellPrpNuval',
    'alncBzsCd',
    'frisuYn',
    'sellTpCd',
    'wtholIstYn',
    'cralLocaraTno',
    'newAdrZip',
    'radr',
    'svPrd',
    'cntrCnfmDtm',
    'pdNm',
    'pdGrpCd',
    'pdCd',
    'modelNm',
    'scnYn',
    'bfMnftCoId',
    'bcNo',
    'prdtYm',
    'channelNm',
    'gnrdv',
    'rgrp',
    'ogNm',
    'prtnrKnm',
    'cnslDtlpTpCd',
    'istDt',
    'useMcn',
    'svBizHclsfCd',
    'svBizDclsfCd',
    'ptyCstNo',
    'cstmwFiltPdCd',
    'asRefriDvNm',
    'bfsvcRefriDvNm',
    'refriDvNm',
    'egerCnrNm',
    'rpbLocaraCd',
    'ichrCnrSdingDidy',
    'prtnr',
    'prtnrPstnDv',
    {
      header: t('MSG_TXT_SITE_AW'), // 현장수당
      direction: 'horizontal',
      items: ['siteAwDvNm', 'siteAwAmt', 'rglvlGdCd', 'awAmt', 'locaraChaosYn', 'locaraChaosAwAmt', 'siteAwTot'],
    },
    'contactCralLocaraTno',
    'rcpdt',
    'rcpHh',
    'vstDuedt',
    'vstExpHh',
    'vstRqdt',
    'vstCnfmdt',
    'vstCnfmHh',
    'dtmChCausCd',
    'dtmChRsonCd',
    'dtmChRsonDtlCn',
    'mmsYn',
    'promHh',
    {
      header: t('MSG_TXT_WK_HH'), // 작업시간
      direction: 'horizontal',
      items: ['arvDtm', 'vstFshDtm'],
    },
    'instDelay',
    'wkLdtm',
    'wkPrgsStatCd',
    'wkCanRsonCd',
    'wkCanMoCn',
    'pmotDvVal',
    {
      header: t('MSG_TXT_RS_IN'), // 결과입력
      direction: 'horizontal',
      items: ['badDvCd', 'asLctCdNm', 'asPhnCdNm', 'asCausCd', 'svProcsFomCd', 'imptaRsonCd', 'asCdEyn', 'sftAcdnYn',
        'plsSvYn', 'peslArtcDfrnYn', 'cwtrWprsVal', 'wwtWprsVal', 'per1mOlqVal', 'istPlcTpCd', 'rcvryOpt', 'resultDtl', 'svProcsCn'],
    },
    {
      header: t('MSG_TXT_PU_PART'), // 투입부품
      direction: 'horizontal',
      items: ['pu1Part', 'pu2Part', 'pu3Part', 'pu4Part', 'pu5Part', 'pu6Part', 'pu7Part', 'pu8Part', 'pu9Part', 'pu10Part'],
    },
    {
      header: t('MSG_TXT_RVE'), // 수납
      direction: 'horizontal',
      items: ['partCs', 'tcfee', 'bstrCs', 'etcCs', 'rveCsTot'],
    },
    {
      header: t('MSG_TXT_STLM'), // 결제
      direction: 'horizontal',
      items: ['cashStlm', 'cardStlm', 'elcStlm', 'crcdcoCd'],
    },
    'cstSignHsYn',
    'istEnvrPhoPhCn',
    {
      header: t('MSG_TXT_ACPN_WKP'), // 동행작업자
      direction: 'horizontal',
      items: ['acpnPrtnr', 'pstnNm'],
    },
    {
      header: t('MSG_TXT_SITE_AW'), // 현장수당
      direction: 'horizontal',
      items: ['cmpaSiteAwAtcNm', 'cmpaSiteAwAmt'],
    },
  ];

  view.setColumnLayout(columnLayout);
  view.setFixedOptions({ colCount: 2 });
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'statistical' });
  view.rowIndicator.visible = true;
  view.filteringOptions.enabled = false;

  view.onCellItemClicked = async (grid, { column, itemIndex }) => {
    const cntrNo = grid.getValue(itemIndex, 'cntrNo');

    if (column === 'cntrNo') {
      // TODO: W-SV-U-0072M01 개인별 서비스 현황 화면 새 탭으로 호출
      router.push({
        path: '/service/wwsnc-responsible-area-code-mgt',
        query: {
          cntrNo,
        },
      });
    }
  };
});
</script>

<style scoped>
</style>
