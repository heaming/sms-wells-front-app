<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwcteReceiptIstInfListM - wells 접수 및 설치 정보 조회
3. 작성자 : Myoungbin Joo
4. 작성일 : 2023.06.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- wells 접수 및 설치 정보 조회
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      ref="srchMainRef"
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 조회기간 -->
        <kw-search-item
          :label="t('MSG_TXT_LOOKUP_PERIOD')"
          required
          :colspan="2"
        >
          <kw-select
            v-model="fieldParams.inqrDv"
            :label="t('MSG_TXT_LOOKUP_PERIOD')"
            :options="codes.inqrDv"
            rules="required"
          />
          <kw-date-range-picker
            v-model:from="fieldParams.cntrCnfmDtFr"
            v-model:to="fieldParams.cntrCnfmDtTo"
            rules="date_range_required|date_range_months:2"
            :label="t('MSG_TXT_LOOKUP_PERIOD')"
          />
        </kw-search-item>
        <!-- 제품구분 -->
        <kw-search-item
          :label="`${t('MSG_TXT_PDCT')} ${t('MSG_TXT_DIV')}`"
          required
        >
          <kw-select
            v-model="fieldParams.pdDvs"
            rules="required"
            :options="codes.pdDvs"
            :multiple="true"
            :label="`${t('MSG_TXT_PDCT')} ${t('MSG_TXT_DIV')}`"
          />
        </kw-search-item>
        <!-- 고객구분 -->
        <kw-search-item
          :label="t('MSG_TXT_CST_DV')"
        >
          <kw-option-group
            v-model="fieldParams.cstDvCd"
            :options="codes.cstDvCd"
            first-option="all"
            first-option-val=""
            type="radio"
            :label="t('MSG_TXT_CST_DV')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 조직구분 -->
        <kw-search-item
          :label="t('MSG_TXT_OG_DV')"
        >
          <kw-option-group
            v-model="fieldParams.sellInflwChnlDtlCd"
            type="radio"
            first-option="all"
            first-option-val=""
            :options="codes.sellInflwChnlDtlCd"
          />
          <!-- if essential case please add 'date_range_required' ex.rules="date_range_required|date_range_months:1" -->
        </kw-search-item>
        <!-- 조직레벨 -->
        <kw-search-item
          :label="t('MSG_TXT_OG_LEVL')"
          :colspan="2"
        >
          <kw-select
            v-model="fieldParams.dgr1LevlOgId"
            :options="codes.codesDgr1Levl"
            first-option="all"
            first-option-val=""
            option-value="dgr1LevlOgId"
            option-label="dgr1LevlOgNm"
            @update:model-value="onUpdateDgr1Levl(fieldParams.dgr1LevlOgId)"
          />
          <kw-select
            v-model="fieldParams.dgr2LevlOgId"
            :options="codes.codesDgr2Levl"
            first-option="all"
            first-option-val=""
            option-value="dgr2LevlOgId"
            option-label="dgr2LevlOgNm"
            @update:model-value="onUpdateDgr2Levl(fieldParams.dgr2LevlOgId)"
          />
          <kw-select
            v-model="fieldParams.dgr3LevlOgId"
            :options="codes.codesDgr3Levl"
            first-option="all"
            first-option-val=""
            option-value="dgr3LevlOgId"
            option-label="dgr3LevlOgNm"
          />
        </kw-search-item>
        <!-- 인센티브 대상 -->
        <kw-search-item :label="`${t('MSG_TXT_ICT_OJ')}`">
          <kw-option-group
            v-model="fieldParams.incentiveYn"
            type="checkbox"
            :options="codes.incentiveYn"
          />
        </kw-search-item>
      </kw-search-row>
      <!-- 상품군 -->
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_PDGRP')"
          :colspan="2"
        >
          <kw-select
            v-model="fieldParams.pdHclsfId"
            :options="codes.highClass"
            first-option="all"
            first-option-val=""
            @change="onChangeHighClass(fieldParams.pdHclsfId)"
          />
          <kw-select
            v-model="fieldParams.pdMclsfId"
            :options="codes.middleClass"
            first-option="all"
            first-option-val=""
          />
        </kw-search-item>
        <!-- 상품코드 -->
        <kw-search-item :label="t('MSG_TXT_PRDT_CODE')">
          <kw-input
            v-model="fieldParams.basePdCd"
            icon="search"
            :on-click-icon="fetchProduct"
            maxlength="10"
          />
        </kw-search-item>
        <!-- 상품명 -->
        <kw-search-item :label="t('MSG_TXT_PRDT_NM')">
          <kw-input
            v-model="fieldParams.pdNm"
            maxlength="100"
            :on-keydown-no-click="true"
            @keydown.enter="fetchProduct(2)"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 예정일 -->
        <kw-search-item :label="t('MSG_TXT_DUEDT')">
          <kw-date-picker
            v-model="fieldParams.sppDuedt"
            :label="t('MSG_TXT_DUEDT')"
            :disable="isSppDuedtYn"
          />
        </kw-search-item>
        <!-- 예정일미등록 -->
        <kw-search-item :label="`${t('MSG_TXT_DUEDT')} ${t('MSG_TXT_NO_RGS')}`">
          <kw-option-group
            v-model="fieldParams.sppDuedtYn"
            type="checkbox"
            :options="codes.sppDuedtYn"
          />
        </kw-search-item>
        <!-- 판매유형 -->
        <kw-search-item :label="t('MSG_TXT_SEL_TYPE')">
          <kw-select
            v-model="fieldParams.sellTpCds"
            :options="codes.sellTpCd"
            :multiple="true"
          />
        </kw-search-item>
        <!-- 관리서비스 -->
        <kw-search-item :label="`${t('MSG_TXT_MGT')} ${t('MSG_TXT_SERVICE')}`">
          <kw-option-group
            v-model="fieldParams.mngSv"
            :options="codes.careSvc"
            first-option="all"
            first-option-val=""
            type="radio"
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
            :page-size-options="commonCodes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_MCNT_WON_CASE') }}</span>
        </template>
        <!-- 엑셀 다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="t('MSG_BTN_EXCEL_DOWN')"
          :disable="(pageInfo.totalCount === 0)"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
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
import { useDataService, codeUtil, defineGrid, useGlobal, getComponentType, gridUtil } from 'kw-lib';
import { isEmpty, isEqual, cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import pdConst from '~sms-common/product/constants/pdConst';

const { t } = useI18n();
const dataService = useDataService();
const now = dayjs();
const { modal } = useGlobal();
const { currentRoute } = useRouter();

const fieldParams = ref({
  cntrCnfmDtFr: now.format('YYYYMM01'), // 조회시작일자
  cntrCnfmDtTo: now.format('YYYYMMDD'), // 조회종료일자
  sppDuedt: '', // 예정일자
  pdHclsfId: '', // 상품대분류ID
  pdMclsfId: '', // 상품중분류ID
  basePdCd: '', // 상품코드
  sellTpCds: ['1', '2', '7', '6'], // 판매유형코드
  inqrDv: '1', // 조회구분
  dgr1LevlOgId: '', // 총괄ID
  dgr2LevlOgId: '', // 지역단ID
  dgr3LevlOgId: '', // 지점ID
  cstDvCd: '', // 고객구분
  sellInflwChnlDtlCd: '', // 조직구분
  incentiveYn: false, // 인센티브 여부
  sppDuedtYn: false, // 예정일 미등록
  mngSv: '', // 관리서비스
  pdNm: '', // 상품명
  pdDvs: ['1', '2', '3'], // 제품구분
});

const srchMainRef = ref(getComponentType('KwSearch'));
const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const isSppDuedtYn = ref(false);

const commonCodes = await codeUtil.getMultiCodes(
  'COPN_DV_CD', // 법인격구분코드
  'SELL_TP_CD', // 판매유형코드
  'SELL_CHNL_DTL_CD', // 판매채널상세코드
  'COD_PAGE_SIZE_OPTIONS',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(commonCodes.COD_PAGE_SIZE_OPTIONS[0].codeName),
});

const codes = ref({
  highClass: [],
  middleClass: [],
  middleClassAll: [],
  codesDgr1Levl: [],
  codesDgr1LevlAll: [],
  codesDgr2Levl: [],
  codesDgr2LevlAll: [],
  codesDgr3Levl: [],
  codesDgr3LevlAll: [],
  cstDvCd: commonCodes.COPN_DV_CD,
  careSvc: [{ codeId: '1', codeName: t('MSG_TXT_GREENCROSS') }],
  sellTpCd: [{ codeId: '7', codeName: t('MSG_TXT_LEASE'), num: 2 }],
  sellInflwChnlDtlCd: commonCodes.SELL_CHNL_DTL_CD.filter((v) => v.codeId === '1010' || v.codeId === '3010'),
  incentiveYn: [{ codeId: 1, codeName: t('MSG_TXT_ICT_OJ') }],
  sppDuedtYn: [{ codeId: 1, codeName: `${t('MSG_TXT_DUEDT')} ${t('MSG_TXT_NO_RGS')}` }],
  pdDvs: [
    { codeId: '1', codeName: t('MSG_TXT_IST_PDCT') },
    { codeId: '2', codeName: t('MSG_TXT_SPP_PDCT') },
    { codeId: '3', codeName: t('MSG_TXT_HOME_CARE') },
  ],
  inqrDv: [
    { codeId: '1', codeName: t('MSG_TXT_RCPDT') },
    { codeId: '2', codeName: t('MSG_TXT_IST_DT') },
    { codeId: '3', codeName: t('MSG_TXT_SCHD_DT') },
  ],
});

const levlOgCodes = ref({
  levl1OgCd: '',
  levl2OgCd: '',
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchCodes() {
  const highCodes = await dataService.get('/sms/wells/contract/product/high-classes');
  const middleCodes = await dataService.get('/sms/wells/contract/product/middle-classes');

  const codesDgr1 = await dataService.get('/sms/wells/contract/partners/general-divisions');
  const codesDgr2 = await dataService.get('/sms/wells/contract/partners/regional-divisions');
  const codesDgr3 = await dataService.get('/sms/wells/contract/partners/branch-divisions');

  const initHighCodes = [];
  const initMiddleCodes = [];

  highCodes.data.forEach((v) => {
    if (!isEmpty(v.pdClsfId)) initHighCodes.push({ codeId: v.pdClsfId, codeName: v.pdClsfNm });
  });

  middleCodes.data.forEach((v) => {
    if (!isEmpty(v.pdClsfId)) {
      initMiddleCodes.push({ codeId: v.pdClsfId, codeName: v.pdClsfNm, hgrPdClsfId: v.hgrPdClsfId });
    }
  });

  Object.assign(codes.value.codesDgr1LevlAll, codesDgr1.data);
  Object.assign(codes.value.codesDgr2LevlAll, codesDgr2.data);
  Object.assign(codes.value.codesDgr3LevlAll, codesDgr3.data);

  Object.assign(codes.value.highClass, initHighCodes);
  Object.assign(codes.value.middleClassAll, initMiddleCodes);

  if (!isEmpty(codes.value.middleClassAll)) {
    Object.assign(codes.value.middleClass, codes.value.middleClassAll);
  }
  if (!isEmpty(codes.value.codesDgr1LevlAll)) {
    Object.assign(codes.value.codesDgr1Levl, codes.value.codesDgr1LevlAll);
  }
  if (!isEmpty(codes.value.codesDgr2LevlAll)) {
    Object.assign(codes.value.codesDgr2Levl, codes.value.codesDgr2LevlAll);
  }
  if (!isEmpty(codes.value.codesDgr3LevlAll)) {
    Object.assign(codes.value.codesDgr3Levl, codes.value.codesDgr3LevlAll);
  }
}

function onChangeHighClass(pdId) {
  if (!isEmpty(pdId)) {
    codes.value.middleClass = codes.value.middleClassAll.filter((v) => v.hgrPdClsfId === pdId);
  } else {
    codes.value.middleClass = codes.value.middleClassAll;
  }
  fieldParams.value.pdMclsfId = '';
}

async function onUpdateDgr1Levl(ogId) {
  // 선택한 지역단, 지점 초기화
  fieldParams.value.dgr2LevlOgId = '';
  fieldParams.value.dgr3LevlOgId = '';

  if (!isEmpty(ogId)) {
    levlOgCodes.value.levl1OgCd = codes.value.codesDgr1LevlAll.filter(
      (v) => ogId.includes(v.dgr1LevlOgId),
    )[0].dgr1LevlOgCd;

    let dgr1LevlOgCd = '';
    dgr1LevlOgCd = levlOgCodes.value.levl1OgCd;

    // 지역단 코드 필터링. 선택한 총괄단의 하위 지역단으로 필터링
    codes.value.codesDgr2Levl = codes.value.codesDgr2LevlAll.filter(
      (v) => dgr1LevlOgCd.includes(v.dgr1LevlOgCd),
    );

    codes.value.codesDgr3Levl = codes.value.codesDgr3LevlAll.filter(
      (v) => dgr1LevlOgCd.includes(v.dgr1LevlOgCd),
    );
  } else {
    levlOgCodes.value.levl1OgCd = '';
    levlOgCodes.value.levl2OgCd = '';

    codes.value.codesDgr1Levl = codes.value.codesDgr1LevlAll;
    codes.value.codesDgr2Levl = codes.value.codesDgr2LevlAll;
    codes.value.codesDgr3Levl = codes.value.codesDgr3LevlAll;
  }
}

async function onUpdateDgr2Levl(ogId) {
  // 선택한 지점 초기화
  fieldParams.value.dgr3LevlOgId = '';

  if (!isEmpty(ogId)) {
    levlOgCodes.value.levl2OgCd = codes.value.codesDgr2LevlAll.filter(
      (v) => ogId.includes(v.dgr2LevlOgId),
    )[0].dgr2LevlOgCd;

    let dgr2LevlOgCd = '';
    dgr2LevlOgCd = levlOgCodes.value.levl2OgCd;

    // 지역단 코드 필터링. 선택한 총괄단의 하위 지역단으로 필터링
    codes.value.codesDgr3Levl = codes.value.codesDgr3LevlAll.filter(
      (v) => dgr2LevlOgCd.includes(v.dgr2LevlOgCd),
    );
  } else {
    let dgr1LevlOgCd = '';
    dgr1LevlOgCd = levlOgCodes.value.levl1OgCd;

    levlOgCodes.value.levl2OgCd = '';

    if (!isEmpty(dgr1LevlOgCd)) {
      // 선택한 총괄단 코드로 필터링
      codes.value.codesDgr3Levl = codes.value.codesDgr3LevlAll.filter(
        (v) => dgr1LevlOgCd.includes(v.dgr1LevlOgCd),
      );
    } else {
      codes.value.codesDgr3Levl = codes.value.codesDgr3LevlAll;
    }
  }
}

async function fetchProduct(gubun) {
  const searchPopupParams = {
    searchType: gubun === 2 ? pdConst.PD_SEARCH_NAME : pdConst.PD_SEARCH_CODE,
    searchValue: gubun === 2 ? fieldParams.value.pdNm : fieldParams.value.basePdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };

  const res = await modal({
    component: 'ZwpdcStandardListP',
    componentProps: searchPopupParams,
  });
  if (res.result && res.payload) {
    fieldParams.value.pdNm = res.payload[0].pdNm;
    fieldParams.value.basePdCd = res.payload[0].pdCd;
  }
}

async function fetchData() {
  if (!await srchMainRef.value.validate()) { return; }
  const res = await dataService.get('/sms/wells/contract/sales-status/receipt-installations/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  grdMainRef.value.getData().clearRows();
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(fieldParams.value);
  await fetchData();
}

// onClickExcelDownload: 엑셀 다운로드 이벤트
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/contract/sales-status/receipt-installations/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

onMounted(async () => {
  // 판매 유형 코드 추가
  let i = 0;
  commonCodes.SELL_TP_CD.forEach((v) => {
    if (isEqual(v.codeId, '2')) { v.codeName = t('MSG_TXT_RENTAL'); }
    codes.value.sellTpCd.push({
      codeId: v.codeId,
      codeName: v.codeName,
      num: i,
    });
    i += 1;
    if (i === 2) { i = 3; }
  });
  // codeId 기준으로 오름차순 정렬
  codes.value.sellTpCd.sort((a, b) => {
    if (a.num < b.num) return -1;
    if (a.num > b.num) return 1;
    return 0;
  });
  fetchCodes();
});

watch(() => fieldParams.value.sppDuedtYn, async (val) => {
  isSppDuedtYn.value = val;
}, { immediate: true });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellDvNm' }, /* 접수구분 1 */
    { fieldName: 'dpTpNm' }, /* 입금유형명 - 이체구분 - F_CMZ_CD_NM 사용 1 */
    { fieldName: 'dpTpCd' }, /* 입금유형코드 - 이체구분 */
    { fieldName: 'mpyBsdt' }, /* 납부기준일자 - 이체약정일 1 */
    { fieldName: 'newCstYn' }, /* 고객번호 신규 1 */
    { fieldName: 'mchnCh' }, /* 기변 1 */
    { fieldName: 'rentalYn' }, /* 재렌탈 1 */
    { fieldName: 'lkCntrNo' }, /* 상대코드 1 */
    { fieldName: 'useTn' }, /* 사용차월 - 기변 상대코드 렌탈차월 1 */
    { fieldName: 'lkPdNm' }, /* 상대상품명 1 */
    { fieldName: 'sellTpNm' }, /* 판매유형 1 */
    { fieldName: 'cntrSno' }, /* 계약(상세)번호 1-컬럼명 수정 */
    { fieldName: 'cstKnm' }, /* 계약자명 1 */
    { fieldName: 'emadr' }, /* 이메일 1 */
    { fieldName: 'bzrno' }, /* 사업자등록번호 1 */
    { fieldName: 'bryyMmdd' }, /* 고객생년(YY) 1 */
    { fieldName: 'sfkVal' }, /* 공통 세이프키 1 */
    { fieldName: 'pdHclsfId' }, /* 상품대분류ID */
    { fieldName: 'pdHclsfNm' }, /* 상품대분류명 */
    { fieldName: 'pdMclsfId' }, /* 상품중분류ID */
    { fieldName: 'pdMclsfNm' }, /* 상품중분류명 */
    { fieldName: 'basePdCd' }, /* 상품코드 1 */
    { fieldName: 'pdNm' }, /* 상품명 1 */
    { fieldName: 'pdClsfDv' }, /* 상품분류 1 */
    { fieldName: 'mmIstmAmt', dataType: 'number' }, /* 렌탈료 - 월 할부 금액 1 */
    { fieldName: 'stplPtrm' }, /* 의무기간 - 약정기간 1 */
    { fieldName: 'sdingCd' }, /* 모종 T9.BASE_PD_CD */
    { fieldName: 'sdingNm' }, /* 모종명 T9.PD_NM 1 */
    { fieldName: 'sdingCntrNo' }, /* 모종계약번호 T9.OJ_DTL_CNTR_NO */
    { fieldName: 'sdingCntrSn' }, /* 모종계약일련번호 T9.OJ_DTL_CNTR_SN */
    { fieldName: 'sdingCntrSno' }, /* 모종계약상세번호 T9.OJ_DTL_CNTR_SN */
    { fieldName: 'sdingIstmAmt', dataType: 'number' }, /* 모종월청구액 1 T9.MM_ISTM_AMT */
    { fieldName: 'mngSv' }, /* 관리서비스 1 */
    { fieldName: 'dgr1LevlOgCd' }, /* 1차레벨조직코드 - 총괄단 1 */
    { fieldName: 'dgr2LevlOgCd' }, /* 2차레벨조직코드 - 지역단 1 */
    { fieldName: 'rcpOgNm' }, /* 접수당시지점 1 */
    { fieldName: 'istOgNm' }, /* 설치당시지점 1 */
    { fieldName: 'dgr3LevlDgPrtnrNo' }, /* 3차레벨대표파트너번호 - 지점장 1 */
    { fieldName: 'dgr3LevlDgPrtnrNm' }, /* 3차레벨대표파트너명 - 지점장 1 */
    { fieldName: 'pstnDvCd' }, /* 직급구분코드 1 */
    { fieldName: 'sellPrtnrNo' }, /* 판매자번호 */
    { fieldName: 'prtnrKnm' }, /* 판매자한글명 */
    { fieldName: 'a3' }, /* 업무차월 (추후추가) 1 */
    { fieldName: 'cntrDt' }, /* 계약일-업무등록일 1 */
    { fieldName: 'prtnrSexDv' }, /* 성별 1 */
    { fieldName: 'prtnrGdYn' }, /* 수석파트너 1 */
    { fieldName: 'prtnrMngYn' }, /* 웰스매니저 1 */
    { fieldName: 'cntrCnfmDt' }, /* 계약확정일시 - 접수일 1 */
    { fieldName: 'cntrCnfmTm' }, /* 계약확정일시 - 접수시간 1 */
    { fieldName: 'fnlMdfcDt' }, /* 최종수정일시-최종변경일 1 */
    { fieldName: 'fnlMdfcTm' }, /* 최종수정일시-최종변경일 1 */
    { fieldName: 'sppDuedt' }, /* 배송예정일자-예정일 1 */
    { fieldName: 'istDt' }, /* 설치일 1 */
    { fieldName: 'reqdDt' }, /* 철거일 1 */
    { fieldName: 'ssBooDt' }, /* 삼성예약일 1 */
    { fieldName: 'ssStocStrDt' }, /* 삼성재고입고일 1 */
    { fieldName: 'pkgCd' }, /* 패키지상품번호 1 */
    { fieldName: 'pkgSn' }, /* 패키지일련번호 (추가예정) 1 */
    { fieldName: 'dc1' }, /* 할인구분-판매할인구분코드 1 */
    { fieldName: 'dc2' }, /* 할인유형-판매할인율코드 1 */
    { fieldName: 'dc3' }, /* 보상유무-판매할인유형코드 1 */
    { fieldName: 'ackmtPerfAmt', dataType: 'number' }, /* 인정실적금액 1 */
    { fieldName: 'ackmtPerfRt' }, /* 인정실적율 1 */
    { fieldName: 'booSellTpCd' }, /* 예약 1 */
    { fieldName: 'e2' }, /* 제휴 (추후추가) 1 */
    { fieldName: 'cttRsCd' }, /* 컨택코드 1 */
    { fieldName: 'sellEvCd' }, /* 행사코드 1 */
    { fieldName: 'feeAckmtBaseAmt', dataType: 'number' }, /* 수수료인정기준금액 - 기준수수료 1 */
    { fieldName: 'feeAckmtRstlBaseAmt', dataType: 'number' }, /* 수수료인정기준금액 - 재약정기준수수료 T12.FEE_ACKMT_BASE_AMT 1 */
    { fieldName: 'feeFxamYn' }, /* 수수료정액여부 1 */
    { fieldName: 'ocoCpsBzsDvCd' }, /* 타사보상업체구분코드 */
    { fieldName: 'ocoCpsBzsDvNm' }, /* 타사보상업체구분명 1 */
    { fieldName: 'zip' }, /* 계약자우편번호 1 */
    { fieldName: 'fmmbN' }, /* 가구원수 1 */
    { fieldName: 'feeAckmtCt' }, /* 수수료인정건수 - 인정건수 1 */
    { fieldName: 'f2' }, /* 내부구매 (추후추가) 1 */
    { fieldName: 'sapMatCd' }, /* SAP자재코드 1 */
    { fieldName: 'bfsvcBzsDvCd' }, /* 업체BS구분 1 */
    { fieldName: 'splyBzsDvCd' }, /* 업체구분 1 */
    { fieldName: 'rentalTn' }, /* 렌탈차월 RENTAL_TN 1 */
    { fieldName: 'cntrDv' }, /* 계약구분 RENTAL_TN 1 */
  ];

  const columns = [
    { fieldName: 'sellDvNm', header: t('MSG_TXT_RCP_DV'), width: '129', styleName: 'text-center' }, // 접수구분
    { fieldName: 'dpTpNm', header: t('MSG_TXT_FNT_DV'), width: '129', styleName: 'text-center' }, // 이체구분
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FNT_STPL_D'), width: '129', styleName: 'text-center' }, // 이체약정일
    { fieldName: 'newCstYn', header: `${t('MSG_TXT_KWK')} ${t('MSG_TXT_NEW')}`, width: '129', styleName: 'text-center' }, // 교원키 신규
    { fieldName: 'mchnCh', header: t('MSG_TXT_CHNG'), width: '129', styleName: 'text-center' }, // 기변
    { fieldName: 'rentalYn', header: t('MSG_TXT_RE_RENTAL'), width: '129', styleName: 'text-center' }, // 재렌탈
    { fieldName: 'lkCntrNo', header: t('MSG_TXT_PTY_CD'), width: '129', styleName: 'text-center' }, // 상대코드
    { fieldName: 'useTn', header: t('MSG_TXT_USE_NMN'), width: '129', styleName: 'text-center' }, // 사용차월
    { fieldName: 'lkPdNm', header: t('MSG_TXT_PTY_PD_NM'), width: '462', styleName: 'text-left' }, // 상대상품명

    { fieldName: 'sellTpNm', header: t('MSG_TXT_CNTR_DV'), width: '129', styleName: 'text-center' }, // 계약구분
    { fieldName: 'cntrSno', header: t('MSG_TXT_CNTR_NO'), width: '129', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '129', styleName: 'text-center' }, // 계약자명
    { fieldName: 'emadr', header: t('MSG_TXT_EMAIL'), width: '257', styleName: 'text-left' }, // 이메일
    { fieldName: 'bzrno', header: t('MSG_TXT_ENTRP_NO'), width: '129', styleName: 'text-center' }, // 사업자번호
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_CST_BRYY'), width: '129', styleName: 'text-center' }, // 고객생년
    { fieldName: 'sfkVal', header: t('MSG_TXT_SFK'), width: '129', styleName: 'text-center' }, // 세이프키

    { fieldName: 'pdClsfDv', header: t('MSG_TXT_PRDT_CATE'), width: '129', styleName: 'text-left' }, // 상품분류
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '129', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '129', styleName: 'text-center' }, // 상품명
    { fieldName: 'mmIstmAmt', header: t('MSG_TXT_RTLFE'), width: '129', styleName: 'text-right' }, // 렌탈료
    { fieldName: 'stplPtrm', header: t('MSG_TXT_DUTY_PTRM'), width: '129', styleName: 'text-right' }, // 의무기간
    { fieldName: 'sdingNm', header: t('MSG_TXT_SDING'), width: '129', styleName: 'text-center' }, // 모종
    { fieldName: 'sdingCntrSno', header: `${t('MSG_TXT_SDING')}${t('MSG_TXT_ORD_NO')}`, width: '129', styleName: 'text-center' }, // 모종주문번호
    { fieldName: 'sdingIstmAmt', header: `${t('MSG_TXT_SDING')}${t('MSG_TXT_MM_BIL_AMT')}`, width: '129', styleName: 'text-right' }, // 모종월청구액
    { fieldName: 'mngSv', header: t('MSG_TXT_MGMT_SVC'), width: '129', styleName: 'text-left' }, // 관리서비스

    { fieldName: 'dgr1LevlOgCd', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '129', styleName: 'text-center' }, // 총괄단
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '129', styleName: 'text-center' }, // 지역단
    { fieldName: 'rcpOgNm', header: t('MSG_TXT_RCP_THTM_BLG'), width: '129', styleName: 'text-center' }, // 접수당시소속
    { fieldName: 'istOgNm', header: t('MSG_TXT_INSTL_THTM_BL'), width: '129', styleName: 'text-center' }, // 설치당시소속
    { fieldName: 'dgr3LevlDgPrtnrNm', header: t('MSG_TXT_BRMGR'), width: '129', styleName: 'text-center' }, // 지점장
    { fieldName: 'dgr3LevlDgPrtnrNo', header: t('MSG_TXT_BRMGR_EPNO'), width: '129', styleName: 'text-center' }, // 지점장 사번
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), width: '129', styleName: 'text-center' }, // 직급
    { fieldName: 'a3', header: t('MSG_TXT_TASK_NMN'), width: '129', styleName: 'text-center' }, // 업무차월
    { fieldName: 'cntrDt', header: t('MSG_TXT_BIZ_RGST_D'), width: '129', styleName: 'text-center', datetimeFormat: 'date' }, // 업무등록일
    { fieldName: 'prtnrSexDv', header: t('MSG_TXT_GENDER'), width: '129', styleName: 'text-center' }, // 성별
    { fieldName: 'prtnrGdYn', header: t('MSG_TXT_TOPMR_PLAR'), width: '129', styleName: 'text-center' }, // 수석플래너
    { fieldName: 'prtnrMngYn', header: t('MSG_TXT_WELS_MNGER'), width: '129', styleName: 'text-center' }, // 웰스매니저

    { fieldName: 'cntrCnfmDt', header: t('MSG_TXT_RCPDT'), width: '129', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일
    { fieldName: 'cntrCnfmTm', header: t('MSG_TXT_RCPT_HH'), width: '129', styleName: 'text-center', datetimeFormat: 'time' }, // 접수시간
    { fieldName: 'fnlMdfcDt', header: `${t('MSG_TXT_FNL')}${t('MSG_TXT_CH_DT')}`, width: '129', styleName: 'text-center', datetimeFormat: 'date' }, // 최종변경일
    { fieldName: 'fnlMdfcTm', header: `${t('MSG_TXT_FNL')}${t('MSG_TXT_RCPT_HH')}`, width: '129', styleName: 'text-center', datetimeFormat: 'time' }, // 최종변경시간
    { fieldName: 'sppDuedt', header: t('MSG_TXT_DUEDT'), width: '129', styleName: 'text-center', datetimeFormat: 'date' }, // 예정일
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '129', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일
    { fieldName: 'reqdDt', header: t('MSG_TXT_DEM_DT'), width: '129', styleName: 'text-center', datetimeFormat: 'date' }, // 철거일
    { fieldName: 'ssBooDt', header: `${t('MSG_TXT_SS')} ${t('MSG_TXT_RSVN_DT')}`, width: '129', styleName: 'text-center', datetimeFormat: 'date' }, // 삼성예약일
    { fieldName: 'ssStocStrDt', header: `${t('MSG_TXT_SS')} ${t('MSG_TXT_STOC')} ${t('MSG_TXT_STR_DT')}`, width: '129', styleName: 'text-center', datetimeFormat: 'date' }, // 삼성재고 입고일

    { fieldName: 'pkgCd', header: t('MSG_TXT_PKG_PD_NO'), width: '129', styleName: 'text-center' }, // 패키지상품번호
    { fieldName: 'pkgSn', header: t('MSG_TXT_PKG_SN'), width: '129', styleName: 'text-center' }, // 패키지일련번호
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_PD_ACC_RSLT'), width: '129', styleName: 'text-right' }, // 인정실적
    { fieldName: 'ackmtPerfRt', header: `${t('MSG_TXT_ACKMT_PERF_RAT')}(%)`, width: '129', styleName: 'text-right' }, // 인정실적률(%)
    { fieldName: 'booSellTpCd', header: t('MSG_TXT_RSV'), width: '129', styleName: 'text-center' }, // 예약
    { fieldName: 'e2', header: t('MSG_TXT_ALNC'), width: '129', styleName: 'text-center' }, // 제휴
    { fieldName: 'cttRsCd', header: t('MSG_TXT_CTT_CD'), width: '257', styleName: 'text-center' }, // 컨택코드
    { fieldName: 'sellEvCd', header: t('MSG_TXT_EV_CD'), width: '129', styleName: 'text-center' }, // 행사코드
    { fieldName: 'dc1', header: t('MSG_TXT_SELL_DSC_DV_CD'), width: '129', styleName: 'text-center' }, // 판매할인구분코드
    { fieldName: 'dc2', header: t('MSG_TXT_SELL_DSC_RT_CD'), width: '129', styleName: 'text-center' }, // 판매할인율코드
    { fieldName: 'dc3', header: t('MSG_TXT_SELL_DSC_TP_CD'), width: '129', styleName: 'text-center' }, // 판매할인유형코드

    { fieldName: 'feeAckmtBaseAmt', header: t('MSG_TXT_PD_STD_FEE'), width: '155', styleName: 'text-right' }, // 기준수수료
    { fieldName: 'feeAckmtRstlBaseAmt', header: t('MSG_TXT_RSTL_PD_STD_FEE'), width: '129', styleName: 'text-right' }, // 재약정기준수수료
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_FXAM_YN'), width: '129', styleName: 'text-center' }, // 정액여부
    { fieldName: 'ocoCpsBzsDvNm', header: t('MSG_TXT_OCO_COMP_CMPNY'), width: '177', styleName: 'text-center' }, // 타사보상업체
    { fieldName: 'zip', header: t('MSG_TXT_CNTRT_ZIP'), width: '129', styleName: 'text-center' }, // 계약자 우편번호
    { fieldName: 'fmmbN', header: t('MSG_TXT_HHLD_MBR_N'), width: '128', styleName: 'text-center' }, // 세대구성원수
    { fieldName: 'feeAckmtCt', header: t('MSG_TXT_PD_ACC_CNT'), width: '129', styleName: 'text-right' }, // 인정건수
    { fieldName: 'rentalTn', header: t('MSG_TXT_RENTAL_NMN'), width: '129', styleName: 'text-right' }, // 렌탈차월
    { fieldName: 'f2', header: t('MSG_TXT_INSI_PRCHS'), width: '146', styleName: 'text-center' }, // 내부구매
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_PD_CD'), width: '129', styleName: 'text-center' }, // SAP상품코드
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_BRMGR_EPNO'), width: '129', styleName: 'text-center' }, // 지점장 사번
    { fieldName: 'bfsvcBzsDvCd', header: t('MSG_TXT_CLSF_BS'), width: '129', styleName: 'text-center' }, // 업체BS구분
    { fieldName: 'splyBzsDvCd', header: t('MSG_TXT_CLSF_BUS'), width: '129', styleName: 'text-center' }, // 업체구분
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  const columnLayout = [
    {
      header: t('MSG_TXT_SELL_INF'), // 판매정보
      direction: 'horizontal', // merge type
      items: ['sellDvNm', 'dpTpNm', 'mpyBsdt', 'newCstYn', 'mchnCh', 'rentalYn', 'lkCntrNo', 'useTn', 'lkPdNm'],
    },
    {
      header: t('MSG_TXT_CNTRT_INF'), // 계약자 정보
      direction: 'horizontal', // merge type
      items: ['sellTpNm', 'cntrSno', 'cstKnm', 'emadr', 'bzrno', 'bryyMmdd', 'sfkVal'],
    },
    {
      header: t('MSG_TXT_PD_INF'), // 상품정보
      direction: 'horizontal', // merge type
      items: ['pdClsfDv', 'basePdCd', 'pdNm', 'mmIstmAmt', 'stplPtrm', 'sdingNm', 'sdingCntrSno', 'sdingIstmAmt', 'mngSv'],
    },
    {
      header: t('MSG_TXT_PRTNR_INF'), // 파트너 정보
      direction: 'horizontal', // merge type
      items: ['dgr1LevlOgCd', 'dgr2LevlOgCd', 'rcpOgNm', 'istOgNm', 'dgr3LevlDgPrtnrNo', 'dgr3LevlDgPrtnrNm', 'pstnDvCd', 'a3', 'cntrDt', 'prtnrSexDv', 'prtnrGdYn', 'prtnrMngYn'],
    },
    {
      header: t('MSG_TXT_RCP_AND_INST_INF'), // 접수 및 설치 정보
      direction: 'horizontal', // merge type
      items: ['cntrCnfmDt', 'cntrCnfmTm', 'fnlMdfcDt', 'fnlMdfcTm', 'sppDuedt', 'istDt', 'reqdDt', 'ssBooDt', 'ssStocStrDt'],
    },
    {
      header: t('MSG_TXT_ETC'), // 기타
      direction: 'horizontal', // merge type
      items: ['pkgCd', 'pkgSn', { header: 'DC', direction: 'horizontal', items: ['dc1', 'dc2', 'dc3'] }, 'ackmtPerfAmt', 'ackmtPerfRt', 'booSellTpCd', 'e2', 'cttRsCd', 'sellEvCd'],
    },
    {
      header: t('MSG_TXT_ETC'), // 기타
      direction: 'horizontal', // merge type
      items: ['feeAckmtBaseAmt', 'feeAckmtRstlBaseAmt', 'feeFxamYn', 'ocoCpsBzsDvNm', 'zip', 'fmmbN', 'feeAckmtCt', 'rentalTn', 'f2', 'sapMatCd', 'sellPrtnrNo', 'bfsvcBzsDvCd', 'splyBzsDvCd'],
    },
  ];

  // multi row header setting
  view.setColumnLayout(columnLayout);
});

</script>

<style scoped>
</style>
