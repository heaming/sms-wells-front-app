<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaNetOrderListM - 월 순주문 집계
3. 작성자 : gs.piit150
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 월 순주문 집계 목록 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <div
        v-if="isSelectVisile"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV')"
          >
            <kw-option-group
              v-model="searchParams.dvCd"
              :label="$t('MSG_TXT_INQR_DV')"
              type="radio"
              :options="customCodes.div2Cd"
              @change="onChangedDvcd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
          >
            <kw-select
              v-model="searchParams.divCd"
              :label="$t('MSG_TXT_DIV')"
              :options="customCodes.div4Cd"
              @change="onChangedDvcd"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_OG_DV')"
          >
            <kw-select
              v-model="searchParams.ogDvCd"
              :label="$t('MSG_TXT_OG_DV')"
              :options="customCodes.div3Cd"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
            required
          >
            <kw-select
              v-model="searchParams.pdctTpCd"
              :label="$t('MSG_TXT_PDCT_TP')"
              :options="codes.FEE_PDCT_TP_CD"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_SEL_TYPE')"
          >
            <kw-select
              v-model="searchParams.selTpCd"
              :label="$t('MSG_TXT_SEL_TYPE')"
              :options="customCodes.div6Cd"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_DT')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.strtDt"
              v-model:to="searchParams.endDt"
              :label="$t('MSG_TXT_DT')"
              rules="date_range_required|date_range_months:1"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_CANC_DT')"
          >
            <kw-date-range-picker
              v-model:from="searchParams.cancStrtDt"
              v-model:to="searchParams.cancEndDt"
              :label="$t('MSG_TXT_CANC_DT')"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PRDT_CODE')"
          >
            <kw-input
              v-model="searchParams.pdStrtCd"
              maxlength="10"
              clearable
              icon="search"
              @click-icon="onClickSearchPdCdPopup('S')"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.pdEndCd"
              maxlength="10"
              clearable
              icon="search"
              @click-icon="onClickSearchPdCdPopup('E')"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_PKG_CD')"
          >
            <kw-input
              v-model="searchParams.pkgStrtCd"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.pkgEndCd"
            />
          </kw-search-item>
          <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
            <zwog-level-select
              v-model:og-levl-dv-cd1="searchParams.ogLevl1Id"
              v-model:og-levl-dv-cd2="searchParams.ogLevl2Id"
              v-model:og-levl-dv-cd3="searchParams.ogLevl3Id"
              :og-tp-cd="searchParams.ogDvCd"
              :base-ym="searchParams.perfYm"
              :start-level="1"
              :end-level="3"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          >
            <kw-input
              v-model="searchParams.prtnrNo"
              icon="search"
              clearable
              :maxlength="10"
              :on-click-icon="onClickSearchNo"
              :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
            />
            <kw-input
              v-model="searchParams.prtnrKnm"
              :placeholder="$t('MSG_TXT_EMPL_NM')"
              readonly
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelectVisile2"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV')"
          >
            <kw-option-group
              v-model="searchParams.dvCd"
              :label="$t('MSG_TXT_INQR_DV')"
              type="radio"
              :options="customCodes.div2Cd"
              @change="onChangedDvcd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_ORDR')"
          >
            <kw-option-group
              v-model="searchParams.feeTcntDvCd"
              :label="$t('MSG_TXT_ORDR')"
              type="radio"
              :options="codes.FEE_TCNT_DV_CD"
              @change="onChangedOrdr"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_FEE_YM')"
            required
          >
            <kw-date-picker
              v-model="searchParams.perfYm"
              rules="required"
              type="month"
              :label="$t('MSG_TXT_FEE_YM')"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_OG_DV')"
          >
            <kw-select
              v-model="searchParams.ogDvCd"
              :label="$t('MSG_TXT_OG_DV')"
              :options="customCodes.div3Cd"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
              @change="onChangedDvcd"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelectVisile3"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV')"
          >
            <kw-option-group
              v-model="searchParams.dvCd"
              :label="$t('MSG_TXT_INQR_DV')"
              type="radio"
              :options="customCodes.div2Cd"
              @change="onChangedDvcd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
          >
            <kw-select
              v-model="searchParams.divCd"
              :label="$t('MSG_TXT_DIV')"
              :options="customCodes.div4Cd"
              @change="onChangedDvcd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_ORDR')"
          >
            <kw-option-group
              v-model="searchParams.feeTcntDvCd"
              :label="$t('MSG_TXT_ORDR')"
              type="radio"
              :options="codes.FEE_TCNT_DV_CD"
              @change="onChangedOrdr"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_OG_DV')"
          >
            <kw-select
              v-model="searchParams.ogDvCd"
              :label="$t('MSG_TXT_OG_DV')"
              :options="customCodes.div3Cd"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_FEE_YM')"
            required
          >
            <kw-date-picker
              v-model="searchParams.perfYm"
              rules="required"
              type="month"
              :label="$t('MSG_TXT_FEE_YM')"
              @change="onChangedOrdr"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-if="isSelectVisile4"
            :total-count="totalCount1"
          />
          <kw-paging-info
            v-if="isSelectVisile2"
            :total-count="totalCount2"
          />
          <span
            v-if="isSelectVisile4"
            class="ml8"
          >{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
          <span
            v-if="isSelectVisile2"
            class="ml8"
          >{{ $t('MSG_TXT_MSG_TXT_UNIT_CASE') }}</span>
        </template>
        <kw-btn
          v-if="isSelectVisile4"
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!isExcelDown1"
          @click="onClickExcelDownload"
        />
        <kw-btn
          v-if="isSelectVisile2"
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!isExcelDown2"
          @click="onClickExcelDownload"
        />
        <kw-separator
          v-if="isPerfVisile"
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="isPerfVisile"
          :label="$t('MSG_BTN_HDQ_PERF')+$t('MSG_BTN_AGRG')"
          secondary
          dense
          :disable="!isReg"
          @click="openNtorAgrgPopup"
        />
        <kw-separator
          v-if="isPerfVisile"
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="isPerfVisile"
          :label="$t('MSG_BTN_HDQ_PERF')+$t('MSG_BTN_DTRM')"
          secondary
          dense
          :disable="!isConfirm"
          @click="openNtorConfirmPopup"
        />
      </kw-action-top>
      <kw-grid
        v-if="isGrid1Visile"
        ref="grdMain1Ref"
        name="grd1Main"
        :visible-rows="10"
        @init="initGrd1Main"
      />
      <kw-grid
        v-if="isGrid2Visile"
        ref="grdMain2Ref"
        name="grd2Main"
        :visible-rows="10"
        @init="initGrd2Main"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';

import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import pdConst from '~sms-common/product/constants/pdConst';
import { useDataService, getComponentType, useGlobal, gridUtil, defineGrid, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

// const { t } = useI18n();
const { modal, alert } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
const isExcelDown1 = ref(false);
const isExcelDown2 = ref(false);
const isReg = ref(false);
const isConfirm = ref(false);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const isSelectVisile = ref(true);
const isSelectVisile2 = ref(false);
const isSelectVisile3 = ref(false);
const isSelectVisile4 = ref(true);
const isGrid1Visile = ref(true);
const isGrid2Visile = ref(false);
const isPerfVisile = ref(false);
const now = dayjs();
const grdMain1Ref = ref(getComponentType('KwGrid'));
const grdMain2Ref = ref(getComponentType('KwGrid'));
const totalCount1 = ref(0);
const totalCount2 = ref(0);
const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'COPN_DV_CD',
  'OG_TP_CD',
  'FEE_PDCT_TP_CD',
  'FEE_TCNT_DV_CD',
);

const customCodes = {
  div2Cd: [{ codeId: '01', codeName: '상세' }, { codeId: '02', codeName: '집계' }],
  div3Cd: [{ codeId: 'W02', codeName: 'M추진' }, { codeId: 'W01', codeName: 'P추진' }, { codeId: 'W03', codeName: '홈마스터' }, { codeId: 'W04', codeName: 'B2B' }, { codeId: 'W05', codeName: '총판' }, { codeId: 'W06', codeName: '기타' }],
  div4Cd: [{ codeId: '01', codeName: '접수' }, { codeId: '02', codeName: '예약' }, { codeId: '03', codeName: '매출' }, { codeId: '04', codeName: '수수료 실적 집계 대상' }],
  div6Cd: [{ codeId: '2', codeName: '렌탈/리스' }, { codeId: '1', codeName: '일시불' }, { codeId: '6', codeName: '정기배송' }, { codeId: '7', codeName: '재약정' }, { codeId: '3', codeName: '홈케어멤버십' }],
};

const searchParams = ref({
  dvCd: '01',
  feeTcntDvCd: '01',
  ogDvCd: '',
  divCd: '01',
  pdctTpCd: '',
  selTpCd: '',
  strtDt: now.add(-1, 'month').startOf('month').format('YYYYMMDD'),
  endDt: now.add(-1, 'month').endOf('month').format('YYYYMMDD'),
  cancStrtDt: '',
  cancEndDt: '',
  pdStrtCd: '',
  pdEndCd: '',
  pkgStrtCd: '',
  pkgEndCd: '',
  ogLevl1Id: '',
  ogLevl2Id: '',
  ogLevl3Id: '',
  prtnrNo: '',
  prtnrKnm: '',
  perfYm: now.add(-1, 'month').format('YYYYMM'),
  pdCd: '',
  tcntDvTxt: '1차',
  ogTpCd: 'W01', /* 조직유형코드= 배치 조회를 위함 의미X (본부영업실적집계 = 전체집계) */
  feeBatWkId: 'WSM_FE_OA0005', /* 수수료배치작업ID= 본부영업실적집계 */
});
/*
const info = ref({
  cnfmChk: '',
});
*/
let cachedParams;

async function excelDownload(url) {
  const view = grdMain1Ref.value.getView();
  const response = await dataService.get(url, { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function excel2Download(url) {
  const view = grdMain2Ref.value.getView();
  const response = await dataService.get(url, { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickExcelDownload() {
  const { dvCd, divCd } = searchParams.value;
  cachedParams = cloneDeep(searchParams.value);
  if (dvCd === '01') { /* 상세선택 */
    if (divCd === '04') {
      await excelDownload('/sms/wells/fee/monthly-net/aggreateOrders');
    } else {
      await excelDownload('/sms/wells/fee/monthly-net/orders');
    }
  } else {
    await excel2Download('/sms/wells/fee/monthly-net/fees');
  }
}

async function fetchData(apiUrl) {
  const response = await dataService.get(`/sms/wells/fee/monthly-net/${apiUrl}`, { params: { ...cachedParams }, timeout: 5000000 });
  const netOrders = response.data;
  if (apiUrl === 'fees') {
    const view = grdMain2Ref.value.getView();
    view.getDataSource().setRows(netOrders);
    totalCount2.value = netOrders.length;
    if (totalCount2.value > 0) {
      isExcelDown2.value = true;
    } else {
      isExcelDown2.value = false;
    }
  } else if (apiUrl === 'confirmChk') {
    /* test를 위해 버튼 조정 임시처리
    info.value = netOrders;
    if (info.value.cnfmChk === 'Y') {
      isReg.value = false;
      isConfirm.value = false;
    } else if (info.value.cnfmChk === 'N') {
      isReg.value = true;
      isConfirm.value = true;
    } else {
      isReg.value = true;
      isConfirm.value = false;
    }
    */
    isReg.value = true;
    isConfirm.value = true;
  } else {
    const view = grdMain1Ref.value.getView();
    view.getDataSource().setRows(netOrders);
    totalCount1.value = netOrders.length;
    if (totalCount1.value > 0) {
      isExcelDown1.value = true;
    } else {
      isExcelDown1.value = false;
    }
  }
}

async function onClickSearch() {
  const { dvCd, divCd } = searchParams.value;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('confirmChk');
  if (dvCd === '01') { /* 상세선택 */
    if (divCd === '04') {
      await fetchData('aggreateOrders');
    } else {
      await fetchData('orders');
    }
  } else {
    await fetchData('fees');
  }
}

/*
 *  Event - 조회구분 선택 시 하단 그리드 변경※
 */
async function onChangedDvcd() {
  const { dvCd, divCd } = searchParams.value;
  if (dvCd === '01') { /* 상세선택 */
    if (divCd === '04') {
      isSelectVisile.value = false;
      isSelectVisile3.value = true;
      isPerfVisile.value = true;
    } else {
      isSelectVisile.value = true;
      isSelectVisile3.value = false;
      isPerfVisile.value = false;
    }
    isSelectVisile4.value = true;
    isSelectVisile2.value = false;
    isGrid1Visile.value = true;
    isGrid2Visile.value = false;
  } else if (dvCd === '02') { /* 집계선택 */
    isGrid1Visile.value = false;
    isGrid2Visile.value = true;
    isSelectVisile.value = false;
    isSelectVisile2.value = true;
    isSelectVisile3.value = false;
    isSelectVisile4.value = false;
    isPerfVisile.value = false;
    isExcelDown1.value = false;
    isExcelDown2.value = false;
  }
}

/*
 *  Event - 회차 선택시 집계버튼 사용여부 조회※
 */
async function onChangedOrdr() {
  // const { feeTcntDvCd, perfYm } = searchParams.value;
  // const nowMonth = now.add(-1, 'month').format('YYYYMM');
  const { feeTcntDvCd } = searchParams.value;
  if (feeTcntDvCd === '01') {
    searchParams.value.tcntDvTxt = '1차';
  } else if (feeTcntDvCd === '02') {
    searchParams.value.tcntDvTxt = '2차';
  }
  /* 테스트를 위해 버튼 활성화 임시처리
  if (perfYm !== nowMonth) {
    isReg.value = false;
    isConfirm.value = false;
  } else {
    cachedParams = cloneDeep(searchParams.value);
    await fetchData('confirmChk');
  }
  */
}

// 상품코드 검색 아이콘 클릭 이벤트
async function onClickSearchPdCdPopup(arg) {
  if (arg === 'S') {
    searchParams.value.pdCd = searchParams.value.pdStrtCd;
  } else {
    searchParams.value.pdCd = searchParams.value.pdEndCd;
  }
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.pdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };
  const rtn = await modal({
    component: 'ZwpdcStandardListP',
    componentProps: searchPopupParams,
  });
  if (arg === 'S') {
    searchParams.value.pdStrtCd = rtn.payload?.[0]?.pdCd;
  } else {
    searchParams.value.pdEndCd = rtn.payload?.[0]?.pdCd;
  }
}

/*
 *  Event - 번호 검색 아이콘 클릭 이벤트
 */
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: searchParams.value.perfYm,
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: searchParams.value.ogDvCd,
      prtnrKnm: undefined,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.prtnrNo = payload.prtnrNo;
      searchParams.value.prtnrKnm = payload.prtnrKnm;
    }
  }
}

/*
 *  Event - 순주문 집계 버튼 클릭
 */
async function openNtorAgrgPopup() {
  const { feeTcntDvCd, perfYm, tcntDvTxt } = searchParams.value;
  cachedParams = cloneDeep(searchParams.value);
  const param = {
    // perfYm: now.add(-1, 'month').format('YYYY-MM'),
    perfYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
    feeTcntDvCd,
    tcntDvTxt,
  };

  const response = await dataService.get('/sms/wells/fee/monthly-net/end-of-batch', { params: cachedParams }); /* 이전 배치가 진행중인지 확인 */
  const batchMsg = response.data;
  if (batchMsg !== 'Executing') {
    const { result: isChanged } = await modal({
      component: 'WwfeaNetOrderRegP',
      componentProps: param,
    });
    if (isChanged) {
      await onClickSearch();
    }
  } else if (response.data === 'Executing') {
    alert(t('MSG_ALT_ONDEMAND_ALREAY_EXECUTING'));
  }
}

/*
 *  Event - 순주문 확정 버튼 클릭
 */
async function openNtorConfirmPopup() {
  const { feeTcntDvCd, perfYm, tcntDvTxt } = searchParams.value;
  cachedParams = cloneDeep(searchParams.value);
  const param = {
    // perfYm: now.add(-1, 'month').format('YYYY-MM'),
    perfYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
    feeTcntDvCd,
    tcntDvTxt,
  };
  const response = await dataService.get('/sms/wells/fee/monthly-net/end-of-batch', { params: cachedParams }); /* 이전 배치가 진행중인지 확인 */
  const batchMsg = response.data;
  if (batchMsg !== 'Executing') {
    const { result: isChanged } = await modal({
      component: 'WwfeaNetOrderConfirmP',
      componentProps: param,
    });
    if (isChanged) {
      await onClickSearch();
    }
  } else if (response.data === 'Executing') {
    alert(t('MSG_ALT_ONDEMAND_ALREAY_EXECUTING'));
  }
}

/*
 *  Event - 미등록 상품 조회 팝업
 */
async function openNoPdPopup() {
  const { perfYm, feeTcntDvCd } = searchParams.value;
  const param = {
    perfYm,
    feeTcntDvCd,
  };

  await modal({
    component: 'WwfeaNetOrderProductListP',
    componentProps: param,
  });
}

onMounted(async () => {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('confirmChk');
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellOg' },
    { fieldName: 'blg' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'pdctTp' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cstDv' },
    { fieldName: 'prdtNm' },
    { fieldName: 'prdtCd' },
    { fieldName: 'pkgCd' },
    { fieldName: 'istm' },
    { fieldName: 'stplMcnt' },
    { fieldName: 'cntrDate' },
    { fieldName: 'slDt' },
    { fieldName: 'canDt' },
    { fieldName: 'demDt' },
    { fieldName: 'rtlfe', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'sellOg', header: t('MSG_TXT_SELL_OG'), width: '120', styleName: 'text-center', options: codes.OG_TP_CD },
    { fieldName: 'blg', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'pdctTp', header: t('MSG_TXT_PDCT_TP'), width: '120', styleName: 'text-center', options: codes.FEE_PDCT_TP_CD },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'cstDv', header: t('MSG_TXT_CST_DV'), width: '120', styleName: 'text-center', options: codes.COPN_DV_CD },
    { fieldName: 'prdtNm', header: t('MSG_TXT_PRDT_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'prdtCd', header: t('MSG_TXT_PRDT_CODE'), width: '120', styleName: 'text-center' },
    { fieldName: 'pkgCd', header: t('MSG_TXT_PKG_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'istm', header: t('MSG_TXT_ISTM'), width: '120', styleName: 'text-right' },
    { fieldName: 'stplMcnt', header: t('MSG_TXT_STPL_MCNT'), width: '120', styleName: 'text-right' },
    { fieldName: 'cntrDate', header: t('MSG_TXT_CNTR_DATE'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'demDt', header: t('MSG_TXT_DEM_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'rtlfe', header: t('MSG_TXT_RTLFE'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellOg' },
    { fieldName: 'totCt', dataType: 'number' },
    { fieldName: 'rental', dataType: 'number' },
    { fieldName: 'snglPmnt', dataType: 'number' },
    { fieldName: 'regDlvr', dataType: 'number' },
    { fieldName: 'rstl', dataType: 'number' },
    { fieldName: 'hcrMsh', dataType: 'number' },
    { fieldName: 'envr', dataType: 'number' },
    { fieldName: 'welsf', dataType: 'number' },
    { fieldName: 'bh', dataType: 'number' },
    { fieldName: 'capsl', dataType: 'number' },
    { fieldName: 'homeCare', dataType: 'number' },
    { fieldName: 'csmb', dataType: 'number' },
    { fieldName: 'acsr', dataType: 'number' },
    { fieldName: 'nopd', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'sellOg',
      header: t('MSG_TXT_SELL_OG'),
      width: '120',
      styleName: 'text-center',
      headerSummary: {
        styleName: 'text-center',
        text: t('MSG_TXT_SUM'), // 합계
      },
    },
    { fieldName: 'totCt',
      header: t('MSG_TXT_TOT_CT'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'rental',
      header: `${t('MSG_TXT_RENTAL')}/${t('MSG_TXT_LEASE')}`,
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'snglPmnt',
      header: t('MSG_TXT_SNGL_PMNT'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'regDlvr',
      header: t('MSG_TXT_REG_DLVR'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'rstl',
      header: t('MSG_TXT_RSTL'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'hcrMsh',
      header: t('MSG_TXT_HCR_MSH'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'envr',
      header: t('MSG_TXT_ENVR'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'welsf',
      header: t('MSG_TXT_WELSF'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'bh',
      header: 'BH',
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'capsl',
      header: t('MSG_TXT_CAPSL'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'homeCare',
      header: t('MSG_TXT_HOME_CARE'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'csmb',
      header: t('MSG_TXT_CSMB'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'acsr',
      header: t('MSG_TXT_ACCESSORIES'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'nopd',
      header: t('MSG_TXT_UNREG_TP'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
  ];

  // multi row header setting
  view.setColumnLayout([
    'sellOg', 'totCt',
    {
      header: t('MSG_TXT_SEL_TYPE'),
      direction: 'horizontal',
      items: ['rental', 'snglPmnt', 'regDlvr', 'rstl', 'hcrMsh'],
    },
    {
      header: t('MSG_TXT_PDCT_TP'),
      direction: 'horizontal',
      items: ['envr', 'welsf', 'bh', 'capsl', 'homeCare', 'csmb', 'acsr', 'nopd'],
    },
  ]);

  // 헤더쪽 합계 행고정, summary
  view.headerSummaries.visible = true;
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  data.setFields(fields);
  view.setColumns(columns);
  view.onCellClicked = (grid, clickData) => {
    const { nopd } = gridUtil.getRowValue(grid, clickData.itemIndex);
    if (clickData.column === 'nopd') {
      if (nopd > 0) {
        openNoPdPopup();
      }
    }
  };

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
