<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaNetOrderListM - 월 순주문 집계
3. 작성자 : kyungmin.lim
4. 작성일 : 2023.10.20
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
        v-if="isDtlVisible"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV')"
          >
            <kw-option-group
              v-model="searchParams.inqrDvCd"
              :label="$t('MSG_TXT_INQR_DV')"
              type="radio"
              :options="codes.AGRG_INQR_DV_CD"
              @change="onChangedDvcd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
          >
            <kw-select
              v-model="searchParams.dvCd"
              :label="$t('MSG_TXT_DIV')"
              :options="codes.AGRG_DV_CD"
              @change="onChangedDvcd"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_OG_DV')"
          >
            <kw-select
              v-model="searchParams.ogTpCd"
              :label="$t('MSG_TXT_OG_DV')"
              :options="codes.AGRG_OG_DV_CD"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
              @change="onChangedDvcd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
          >
            <kw-select
              v-model="searchParams.feePdctTpCd"
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
              v-model="searchParams.sellTpCd"
              :label="$t('MSG_TXT_SEL_TYPE')"
              :options="codes.AGRG_SELL_TP_CD.filter((v) => ['01', '02', '04', '05', '06'].includes(v.codeId))"
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
              v-model:from="searchParams.rcpDtFrom"
              v-model:to="searchParams.rcpDtTo"
              :label="$t('MSG_TXT_DT')"
              rules="date_range_required|date_range_months:1"
              @change="onChangeDt"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_CANC_DT')"
          >
            <kw-date-range-picker
              v-model:from="searchParams.cancDtFrom"
              v-model:to="searchParams.cancDtTo"
              :label="$t('MSG_TXT_CANC_DT')"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PRDT_CODE')"
          >
            <kw-input
              v-model="searchParams.pdCdFrom"
              maxlength="10"
              clearable
              icon="search"
              @click-icon="onClickSearchPdCdPopup('S')"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.pdCdTo"
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
              v-model="searchParams.pkgCdFrom"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.pkgCdTo"
            />
          </kw-search-item>
          <kw-search-item
            v-if="isOgLevlVisible"
            :label="t('MSG_TXT_OG_LEVL')"
          >
            <zwog-level-select
              v-model:og-levl-dv-cd1="searchParams.ogLevl1"
              v-model:og-levl-dv-cd2="searchParams.ogLevl2"
              v-model:og-levl-dv-cd3="searchParams.ogLevl3"
              :og-tp-cd="searchParams.ogTpCd"
              :base-ym="searchParams.baseYm"
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
          </kw-search-item>
        </kw-search-row>
      </div>

      <div
        v-if="isAggrVisible"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV')"
          >
            <kw-option-group
              v-model="searchParams.inqrDvCd"
              :label="$t('MSG_TXT_INQR_DV')"
              type="radio"
              :options="codes.AGRG_INQR_DV_CD"
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
              v-model="searchParams.ogTpCd"
              :label="$t('MSG_TXT_OG_DV')"
              :options="codes.AGRG_OG_DV_CD"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
              @change="onChangedDvcd"
            />
          </kw-search-item>
        </kw-search-row>
      </div>

      <div
        v-if="isDtlAggrVisible"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV')"
          >
            <kw-option-group
              v-model="searchParams.inqrDvCd"
              :label="$t('MSG_TXT_INQR_DV')"
              type="radio"
              :options="codes.AGRG_INQR_DV_CD"
              @change="onChangedDvcd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
          >
            <kw-select
              v-model="searchParams.dvCd"
              :label="$t('MSG_TXT_DIV')"
              :options="codes.AGRG_DV_CD"
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
              @change="onChangedDvcd"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_OG_DV')"
          >
            <kw-select
              v-model="searchParams.ogTpCd"
              :label="$t('MSG_TXT_OG_DV')"
              :options="codes.AGRG_OG_DV_CD"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
              @change="onChangedDvcd"
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
              @change="onChangedDvcd"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-if="isGridDtlVisible"
            :total-count="totalCount"
          />
          <kw-paging-info
            v-if="isAggrVisible"
            :total-count="totalCount"
          />
          <span
            v-if="isGridDtlVisible"
            class="ml8"
          >{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
          <span
            v-if="isAggrVisible"
            class="ml8"
          >{{ $t('MSG_TXT_MSG_TXT_UNIT_CASE') }}</span>
        </template>
        <kw-btn
          v-if="isGridDtlVisible"
          v-permission:download
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!isDtlExcelDown"
          @click="onClickExcelDownload"
        />
        <kw-btn
          v-if="isAggrVisible"
          v-permission:download
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!isAggrExcelDown"
          @click="onClickExcelDownload"
        />
        <kw-separator
          v-if="isPerfBtnVisible"
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="isPerfBtnVisible"
          v-permission:create
          :label="$t('MSG_BTN_HDQ_PERF')+$t('MSG_BTN_AGRG')"
          secondary
          dense
          :disable="!isOrderCreateVisile"
          @click="openNtorAgrgPopup"
        />
        <kw-separator
          v-if="isPerfBtnVisible"
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="isPerfBtnVisible"
          v-permission:update
          :label="$t('MSG_BTN_HDQ_PERF')+$t('MSG_BTN_DTRM')"
          secondary
          dense
          :disable="!isOrderModifyVisile"
          @click="openNtorConfirmPopup"
        />
        <kw-btn
          v-if="isTestVisile"
          dense
          label="세금공제"
          @click="TEST1()"
        />
      </kw-action-top>
      <kw-grid
        v-if="isGridDtlVisible"
        ref="grdDtlRef"
        name="grdDtl"
        :visible-rows="10"
        @init="initGrdDtl"
      />
      <kw-grid
        v-if="isGridAggrVisible"
        ref="grdAggrRef"
        name="grdAggr"
        :visible-rows="10"
        @init="initGrdAggr"
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

const { modal, alert } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
const isDtlExcelDown = ref(false);
const isAggrExcelDown = ref(false);
const isOrderCreateVisile = ref(false);
const isOrderModifyVisile = ref(false);
const isTestVisile = ref(false);
const { confirm } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const isDtlVisible = ref(true);
const isAggrVisible = ref(false);
const isDtlAggrVisible = ref(false);
const isGridDtlVisible = ref(true);
const isGridAggrVisible = ref(false);
const isPerfBtnVisible = ref(false);
const isOgLevlVisible = ref(false);
const now = dayjs();
const grdDtlRef = ref(getComponentType('KwGrid'));
const grdAggrRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const codes = await codeUtil.getMultiCodes(
  'COPN_DV_CD',
  'FEE_PDCT_TP_CD',
  'FEE_TCNT_DV_CD',
  'AGRG_DV_CD',
  'AGRG_INQR_DV_CD',
  'AGRG_OG_DV_CD',
  'AGRG_SELL_TP_CD',
);

const searchParams = ref({
  inqrDvCd: '01',
  dvCd: '01',
  rcpDtFrom: now.add(-1, 'month').startOf('month').format('YYYYMMDD'),
  rcpDtTo: now.add(-1, 'month').endOf('month').format('YYYYMMDD'),
  cancDtFrom: '',
  cancDtTo: '',
  pdCdFrom: '',
  pdCdTo: '',
  pkgCdFrom: '',
  pkgCdTo: '',
  ogTpCd: '',
  sellTpCd: '',
  prtnrNo: '',
  feePdctTpCd: '',
  ogLevl1: '',
  ogLevl2: '',
  ogLevl3: '',
  ogLevl4: '',
  ogLevl5: '',
  baseYm: now.add(-1, 'month').startOf('month').format('YYYYMM'),
  perfYm: now.add(-1, 'month').startOf('month').format('YYYYMM'),
  feeTcntDvCd: '01',
  // feeBatWkId: 'WSM_FE_OA0005', /* 수수료배치작업ID= 본부영업실적집계 */
});

let cachedParams;

async function excelDownload(url) {
  let view;

  if (cachedParams.inqrDvCd === '01') {
    view = grdDtlRef.value.getView();
  } else if (cachedParams.inqrDvCd === '02') {
    view = grdAggrRef.value.getView();
  }

  const response = await dataService.get(url, { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function fetchNetOrderStatus() {
  if (searchParams.value.perfYm === '') {
    await alert(t('MSG_ALT_PERF_YM')); // 실적년월은 필수사항입니다.
    return false;
  }

  const statusParams = {
    baseYm: searchParams.value.baseYm,
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
  };

  const res = await dataService.get('/sms/common/fee/net-order-status/cntr', { params: statusParams });

  if (res.data.ntorCnfmStatCd === '02') {
    isOrderCreateVisile.value = false;
    isOrderModifyVisile.value = false;
  } else if (res.data.ntorCnfmStatCd === '01') {
    isOrderCreateVisile.value = true;
    isOrderModifyVisile.value = true;
  } else {
    isOrderCreateVisile.value = true;
    isOrderModifyVisile.value = false;
  }
}

async function onClickExcelDownload() {
  cachedParams = cloneDeep(searchParams.value);
  if (searchParams.value.inqrDvCd === '01') { /* 상세선택 */
    if (searchParams.value.dvCd === '04') {
      await excelDownload('/sms/wells/fee/monthly-net/aggregate-orders');
    } else {
      await excelDownload('/sms/wells/fee/monthly-net/detail-orders');
    }
  } else {
    await excelDownload('/sms/wells/fee/monthly-net/status-orders');
  }
}

async function fetchData(uri) {
  const response = await dataService.get(`/sms/wells/fee/monthly-net/${uri}`, { params: { ...cachedParams }, timeout: 5000000 });
  const dataList = response.data;
  if (uri === 'status-orders') {
    const view = grdAggrRef.value.getView();
    view.getDataSource().setRows(dataList);
    totalCount.value = dataList.length;
    if (totalCount.value > 0) {
      isAggrExcelDown.value = true;
    } else {
      isAggrExcelDown.value = false;
    }
  } else {
    const view = grdDtlRef.value.getView();
    view.getDataSource().setRows(dataList);
    totalCount.value = dataList.length;
    if (totalCount.value > 0) {
      isDtlExcelDown.value = true;
    } else {
      isDtlExcelDown.value = false;
    }
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  if (searchParams.value.inqrDvCd === '01') { /* 상세선택 */
    if (cachedParams.rcpDtFrom.substring(0, 6) !== cachedParams.rcpDtTo.substring(0, 6)) {
      await alert(t('MSG_ALT_STRT_YM_END_YM_SMD')); // 시작년월과 종료년월의 월은 동일해야합니다.
      return false;
    }

    if (searchParams.value.dvCd !== '04') {
      await fetchData('detail-orders');
    } else {
      await fetchData('aggregate-orders');
    }
  } else {
    await fetchData('status-orders');
  }
}

/*
 *  Event - 조회구분 선택 시 하단 그리드 변경※
 */
async function onChangedDvcd() {
  if (searchParams.value.ogTpCd !== '') {
    isOgLevlVisible.value = true;
  } else {
    isOgLevlVisible.value = false;
  }

  if (searchParams.value.inqrDvCd === '01') { /* 상세선택 */
    if (searchParams.value.dvCd === '04') { // 수수료 실적 집계 대상
      isDtlVisible.value = false;
      isDtlAggrVisible.value = true;
      isPerfBtnVisible.value = true;
    } else {
      isDtlVisible.value = true;
      isDtlAggrVisible.value = false;
      isPerfBtnVisible.value = false;
    }
    isAggrVisible.value = false;
    isGridDtlVisible.value = true;
    isGridAggrVisible.value = false;
  } else if (searchParams.value.inqrDvCd === '02') { /* 집계선택 */
    isGridDtlVisible.value = false;
    isGridAggrVisible.value = true;
    isDtlVisible.value = false;
    isAggrVisible.value = true;
    isDtlAggrVisible.value = false;
    isPerfBtnVisible.value = false;
    isDtlExcelDown.value = false;
    isAggrExcelDown.value = false;
  }

  totalCount.value = 0;

  cachedParams = cloneDeep(searchParams.value);
  fetchNetOrderStatus();
}

async function onChangeDt() {
  if (!isEmpty(searchParams.value.rcpDtFrom)) {
    searchParams.value.baseYm = searchParams.value.rcpDtFrom.substring(0, 6);
  }
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
      baseYm: searchParams.value.baseYm,
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: searchParams.value.ogDvCd,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.prtnrNo = payload.prtnrNo;
    }
  }
}

/*
 *  Event - 순주문 집계 버튼 클릭
 */
async function openNtorAgrgPopup() {
  const statusParams = {
    baseYm: searchParams.value.baseYm,
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    ntorCnfmStatCd: '01',
  };

  const res = await dataService.get('/sms/common/fee/net-order-status/cntr', { params: statusParams });

  if (!isEmpty(res)) {
    if (!await confirm(t('MSG_ALT_AGRG_PERF_ALREADY_DATA'))) { return; }
  }

  const param = {
    perfYm: searchParams.value.perfYm,
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
  };
  await modal({
    component: 'WwfeaNetOrderRegP',
    componentProps: param,
  });

  /*
  cachedParams = cloneDeep(searchParams.value);
  const param = {
    perfYm: cachedParams.perfYm,
    feeTcntDvCd: cachedParams.feeTcntDvCd,
  };

  const response = await dataService.get('/sms/wells/fee/monthly-net/end-of-batch', { params: cachedParams });
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
  */
}

/*
 *  Event - 순주문 확정 버튼 클릭
 */
async function openNtorConfirmPopup() {
  const statusParams = {
    baseYm: searchParams.value.baseYm,
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    ntorCnfmStatCd: '02',
  };

  const res = await dataService.get('/sms/common/fee/net-order-status/cntr', { params: statusParams });

  if (!isEmpty(res)) {
    if (!await confirm(t('MSG_ALT_MSG_ALT_CNFM_PERF_ALREADY_DATA'))) { return; }
  }

  const param = {
    perfYm: searchParams.value.perfYm,
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
  };
  await modal({
    component: 'WwfeaNetOrderConfirmP',
    componentProps: param,
  });

  /*
  cachedParams = cloneDeep(searchParams.value);
  const param = {
    perfYm: cachedParams.perfYm,
    feeTcntDvCd: cachedParams.feeTcntDvCd,
  };
  const response = await dataService.get('/sms/wells/fee/monthly-net/end-of-batch', { params: cachedParams });
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
  */
}

/*
 *  Event - 미등록 상품 조회 팝업
 */
async function openNoPdPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
  };

  await modal({
    component: 'WwfeaNetOrderProductListP',
    componentProps: param,
  });
}

onMounted(async () => {
  cachedParams = cloneDeep(searchParams.value);
  await fetchNetOrderStatus();
});

async function TEST1() {
  const param = {
    ogTpCd: 'W01',
    ddtnYm: '202307',
    feeTcntDvCd: '02',
    rsbDvCd: 'W0105',
  };
  await modal({
    component: 'ZwfecFeeTaxDeductionRegP',
    componentProps: param,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdDtl = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogTpCd', header: t('MSG_TXT_SELL_OG'), width: '120', styleName: 'text-center', options: codes.AGRG_OG_DV_CD }, // 판매조직
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' }, // 소속
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '120', styleName: 'text-center' }, // 번호
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '120', styleName: 'text-center' }, // 성명
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-center', options: codes.AGRG_SELL_TP_CD.filter((v) => ['01', '02', '04', '05', '06'].includes(v.codeId)) }, // 판매유형
    { fieldName: 'feePdctTpCd', header: t('MSG_TXT_PDCT_TP'), width: '120', styleName: 'text-center', options: codes.FEE_PDCT_TP_CD }, // 제품유형
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '200', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'copnDvCd', header: t('MSG_TXT_CST_DV'), width: '120', styleName: 'text-center', options: codes.COPN_DV_CD }, // 고객구분
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '180', styleName: 'text-left' }, // 상품명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '140', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pkgCd', header: t('MSG_TXT_PKG_CD'), width: '120', styleName: 'text-center' }, // 패키지상품번호
    { fieldName: 'cntrPtrm', header: t('MSG_TXT_ISTM'), width: '120', styleName: 'text-right' }, // 할부
    { fieldName: 'stplPtrm', header: t('MSG_TXT_STPL_MCNT'), width: '120', styleName: 'text-right' }, // 약정개월
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTR_DATE'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 계약일자
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 매출일자
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 취소일자
    { fieldName: 'reqdDt', header: t('MSG_TXT_DEM_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 철거일자
    { fieldName: 'sellAmt', header: t('MSG_TXT_RTLFE'), width: '140', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 렌탈료
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrdAggr = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogTpCd',
      header: t('MSG_TXT_SELL_OG'), // 판매조직
      width: '120',
      styleName: 'text-center',
      options: codes.AGRG_OG_DV_CD,
      headerSummary: {
        styleName: 'text-center',
        text: t('MSG_TXT_SUM'), // 합계
      },
    },
    { fieldName: 'totCt',
      header: t('MSG_TXT_TOT_CT'), // 총 건수
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'rentCnt',
      header: `${t('MSG_TXT_RENTAL')}/${t('MSG_TXT_LEASE')}`, // 렌탈/리스
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'spayCnt',
      header: t('MSG_TXT_SNGL_PMNT'), // 일시불
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'rglrCnt',
      header: t('MSG_TXT_REG_DLVR'), // 정기배송
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'rstlCnt',
      header: t('MSG_TXT_RSTL'), // 재약정
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'mshCnt',
      header: t('MSG_TXT_HCR_MSH'), // 홈케어멤버십
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'envrCnt',
      header: t('MSG_TXT_ENVR'), // 환경
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'welsfCnt',
      header: t('MSG_TXT_WELSF'), // 웰스팜
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'bhCnt',
      header: 'BH', // BH
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'capslCnt',
      header: t('MSG_TXT_CAPSL'), // 캡슐
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'homeCareCnt',
      header: t('MSG_TXT_HOME_CARE'), // 홈케어
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'csmbCnt',
      header: t('MSG_TXT_CSMB'), // 소모품
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'acsrCnt',
      header: t('MSG_TXT_ACCESSORIES'), // 부속품
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'nopdCnt',
      header: t('MSG_TXT_UNREG_TP'), // 미등록 유형
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
  ];

  // multi row header setting
  view.setColumnLayout([
    'ogTpCd', 'totCt',
    {
      header: t('MSG_TXT_SEL_TYPE'),
      direction: 'horizontal',
      items: ['rentCnt', 'spayCnt', 'rglrCnt', 'rstlCnt', 'mshCnt'],
    },
    {
      header: t('MSG_TXT_PDCT_TP'),
      direction: 'horizontal',
      items: ['envrCnt', 'welsfCnt', 'bhCnt', 'capslCnt', 'homeCareCnt', 'csmbCnt', 'acsrCnt', 'nopdCnt'],
    },
  ]);

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

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

  view.onCellClicked = (grid, clickData) => {
    if (clickData.column === 'nopdCnt') {
      const gridData = gridUtil.getRowValue(grid, clickData.itemIndex);
      if (!isEmpty(gridData) && gridData.nopdCnt > 0) {
        openNoPdPopup();
      }
    }
  };

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
