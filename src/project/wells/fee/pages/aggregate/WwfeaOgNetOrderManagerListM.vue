<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID :  - M조직 수수료 순주문 관리
3. 작성자 : min-kyu bae
4. 작성일 : 2023.02.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- M조직 수수료 순주문 관리 목록 조회 화면
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
            :label="$t('MSG_TXT_FEE_PERF')+$t('MSG_TXT_TYPE')"
          >
            <kw-select
              v-model="searchParams.feePerfTpCd"
              :options="codes.FEE_PERF_TP_CD"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
              @change="onChangedDvcd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
            required
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
              :options="codes.AGRG_SELL_TP_CD"
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
          <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
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
            <kw-input
              v-model="searchParams.prtnrKnm"
              :placeholder="$t('MSG_TXT_EMPL_NM')"
              readonly
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
            :label="$t('MSG_TXT_RSB_DV')"
          >
            <kw-option-group
              v-model="searchParams.rsbDvCd"
              :label="$t('MSG_TXT_RSB_DV')"
              type="radio"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
              :options="rsbDvCd"
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
            :label="$t('MSG_TXT_FEE_YM')"
            required
          >
            <kw-date-picker
              v-model="searchParams.perfYm"
              :label="$t('MSG_TXT_FEE_YM')"
              type="month"
              rules="required"
            />
          </kw-search-item>
          <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
            <zwog-level-select
              v-model:og-levl-dv-cd1="searchParams.ogLevl1"
              v-model:og-levl-dv-cd2="searchParams.ogLevl2"
              v-model:og-levl-dv-cd3="searchParams.ogLevl3"
              :og-tp-cd="searchParams.ogTpCd"
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
            :label="$t('MSG_TXT_FEE_YM')"
            required
          >
            <kw-date-picker
              v-model="searchParams.perfYm"
              :label="$t('MSG_TXT_FEE_YM')"
              type="month"
              rules="required"
            />
          </kw-search-item>
          <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
            <zwog-level-select
              v-model:og-levl-dv-cd1="searchParams.ogLevl1"
              v-model:og-levl-dv-cd2="searchParams.ogLevl2"
              v-model:og-levl-dv-cd3="searchParams.ogLevl3"
              :og-tp-cd="searchParams.ogTpCd"
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
    </kw-search>
    <div
      class="result-area"
    >
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
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
          :label="$t('MSG_BTN_FEE_PERF_CRT')"
          primary
          dense
          secondary
          :disable="!isOrderCreateVisile"
          @click="openFeePerfCrtPopup"
        />
        <kw-btn
          v-if="isPerfBtnVisible"
          v-permission:update
          :label="$t('MSG_BTN_FEE_PERF_DTRM')"
          primary
          dense
          secondary
          :disable="!isOrderModifyVisile"
          @click="openFeePerfCnfmPopup"
        />
        <kw-btn
          v-if="isPerfBtnVisible"
          v-permission:update
          :label="$t('MSG_BTN_FEE_PERF_DTRM_CAN')"
          primary
          dense
          secondary
          :disable="!isOrderDeleteVisile"
          @click="openFeePerfCnfmCanPopup"
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

const { t } = useI18n();
const { modal, alert } = useGlobal();
const dataService = useDataService();
const { currentRoute } = useRouter();
const isDtlExcelDown = ref(false);
const isAggrExcelDown = ref(false);
const isOrderCreateVisile = ref(false);
const isOrderModifyVisile = ref(false);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const isDtlVisible = ref(true);
const isAggrVisible = ref(false);
const isDtlAggrVisible = ref(false);
const isGridDtlVisible = ref(true);
const isGridAggrVisible = ref(false);
const isPerfBtnVisible = ref(false);
const now = dayjs();
const grdDtlRef = ref(getComponentType('KwGrid'));
const grdAggrRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const codes = await codeUtil.getMultiCodes(
  'COPN_DV_CD',
  'FEE_PDCT_TP_CD',
  'RGLR_SPP_PRC_DV_CD',
  'MCHN_CH_TP_CD',
  'FEE_PERF_TP_CD',
  'RSB_DV_CD',
  'FEE_TCNT_DV_CD',
  'SELL_DSCR_CD',
  'SELL_DSC_TP_CD',
  'AGRG_DV_CD',
  'AGRG_INQR_DV_CD',
  'AGRG_OG_DV_CD',
  'AGRG_SELL_TP_CD',
);

const rsbDvCd = ref((await codeUtil.getSubCodes('RSB_DV_CD', 'W02')).filter((v) => ['W0205', 'W0204'].includes(v.codeId)));

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
  feePerfTpCd: '',
  sellTpCd: '',
  prtnrNo: '',
  feePdctTpCd: '',
  prtnrKnm: '',
  rsbDvCd: '',
  ogLevl1: '',
  ogLevl2: '',
  ogLevl3: '',
  ogLevl4: '',
  ogLevl5: '',
  baseYm: now.add(-1, 'month').startOf('month').format('YYYYMM'),
  perfYm: now.add(-1, 'month').startOf('month').format('YYYYMM'),
  feeTcntDvCd: '01',

  // inqrDvCd: '01',
  // feeTcntDvCd: '01',
  // divCd: '02',
  // feePerfCd: '',
  // pdctTpCd: '',
  // sellTpCd: '0',
  // strtDt: now.add(-1, 'month').startOf('month').format('YYYYMMDD'),
  // endDt: now.add(-1, 'month').endOf('month').format('YYYYMMDD'),
  // cancStrtDt: '',
  // cancEndDt: '',
  // pdStrtCd: '',
  // pdEndCd: '',
  // pkgStrtCd: '',
  // pkgEndCd: '',
  // og1LevlId: '',
  // og2LevlId: '',
  // og3LevlId: '',
  // prtnrNo: '',
  // perfYm: now.add(-1, 'month').format('YYYYMM'),
  // rsbDvCd: '00',
  // prtnrKnm: '',
  // ogTpCd: 'W02',
  // pdCd: '',
  // feeBatWkId: 'WSM_FE_OA0003', /* 수수료배치작업ID= 조직별실적집계 */
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
    ogTpCd: searchParams.value.ogTpcd,
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
  };

  const res = await dataService.get('/sms/common/fee/net-order-status/cntr', { params: statusParams });

  if (res.data.ntorCnfmStatCd === '02') { // 주문별 집계가 확정일때 보여준다
    const resStat = await dataService.get('/sms/common/fee/net-order-status/schedule-start', { params: statusParams });

    if (resStat.data.schStartCd === 'NOTSTART') { // 해당 일정이 시작 하였는지 확인
      isOrderCreateVisile.value = true;
      isOrderModifyVisile.value = true;
    } else {
      isOrderCreateVisile.value = false;
      isOrderModifyVisile.value = false;
    }
  } else {
    isOrderCreateVisile.value = false;
    isOrderModifyVisile.value = false;
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
      ogTpCd: 'W02',
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

async function onClickExcelDownload() {
  cachedParams = cloneDeep(searchParams.value);
  if (searchParams.value.inqrDvCd === '01') { /* 상세선택 */
    if (searchParams.value.dvCd === '04') {
      await excelDownload('/sms/wells/fee/organization-netorders/mnger-aggregate-orders');
    } else {
      await excelDownload('/sms/wells/fee/organization-netorders/mnger-detail-orders');
    }
  } else {
    await excelDownload('/sms/wells/fee/organization-netorders/mnger-status-orders');
  }
}

async function fetchData(uri) {
  const response = await dataService.get(`/sms/wells/fee/organization-netorders/${uri}`, { params: { ...cachedParams }, timeout: 5000000 });
  const dataList = response.data;
  if (uri === 'mnger-status-orders') {
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
      await fetchData('mnger-detail-orders');
    } else {
      await fetchData('mnger-aggregate-orders');
    }
  } else {
    await fetchData('mnger-status-orders');
  }
}

/*
 *  Event - 조회구분 선택 시 하단 그리드 변경※
 */
async function onChangedDvcd() {
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

/*
 *  Event - 상품코드 검색 아이콘 클릭 이벤트
 */
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
 *  Event - 수수료 실적 생성 버튼 클릭 (CR/CO)
 */
async function openFeePerfCrtPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    ogTp: 'W02',
    dv: 'CR',
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '201',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: param,
  });

  /*
  cachedParams = cloneDeep(searchParams.value);

  const { perfYm } = searchParams.value;
  const param = {
    perfYm,
    ogTp: 'W02',
    dv: 'CR',
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '201',
  };
  const response = await dataService.get('/sms/wells/fee/monthly-net/end-of-batch', { params: cachedParams });
  const batchMsg = response.data;
  if (batchMsg !== 'Executing') {
    await modal({
      component: 'WwfeaOgNetOrderPerfAgrgRegP',
      componentProps: param,
    });
  } else if (response.data === 'Executing') {
    alert(t('MSG_ALT_ONDEMAND_ALREAY_EXECUTING'));
  }
  */
}

/*
 *  Event - 수수료 실적 확정 버튼 클릭 (CR/CO)
 */
async function openFeePerfCnfmPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    ogTp: 'W02',
    dv: 'CO',
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '201',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: param,
  });

  /*
  cachedParams = cloneDeep(searchParams.value);
  const { perfYm } = searchParams.value;
  const param = {
    perfYm,
    ogTp: 'W02',
    dv: 'CO',
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '201',
  };
  const response = await dataService.get('/sms/wells/fee/monthly-net/end-of-batch', { params: cachedParams });
  const batchMsg = response.data;
  if (batchMsg !== 'Executing') {
    await modal({
      component: 'WwfeaOgNetOrderPerfAgrgRegP',
      componentProps: param,
    });
  } else if (response.data === 'Executing') {
    alert(t('MSG_ALT_ONDEMAND_ALREAY_EXECUTING'));
  }
  */
}

/*
 *  Event - 수수료 실적 확정 취소 버튼 클릭 (CR/CO)
 */
async function openFeePerfCnfmCanPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    ogTp: 'W02',
    dv: 'CC',
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '201',
  };
  await modal({
    component: 'WwfeaNetOrderConfirmP',
    componentProps: param,
  });

  /*
  cachedParams = cloneDeep(searchParams.value);

  const { perfYm } = searchParams.value;
  const param = {
    perfYm,
    ogTp: 'W02',
    dv: 'CC',
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '201',
  };
  const response = await dataService.get('/sms/wells/fee/monthly-net/end-of-batch', { params: cachedParams });
  const batchMsg = response.data;
  if (batchMsg !== 'Executing') {
    await modal({
      component: 'WwfeaOgNetOrderPerfAgrgRegP',
      componentProps: param,
    });
  } else if (response.data === 'Executing') {
    alert(t('MSG_ALT_ONDEMAND_ALREAY_EXECUTING'));
  }
  */
}

onMounted(async () => {
  cachedParams = cloneDeep(searchParams.value);
  await fetchNetOrderStatus();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdDtl = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' }, // 소속
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '120', styleName: 'text-center' }, // 번호
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '120', styleName: 'text-center' }, // 성명
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-center', options: codes.AGRG_SELL_TP_CD }, // 판매유형
    { fieldName: 'feePdctTpCd', header: t('MSG_TXT_PDCT_TP'), width: '120', styleName: 'text-center', options: codes.FEE_PDCT_TP_CD }, // 제품유형
    { fieldName: 'rglrSppPrcDvCd', header: t('MSG_TXT_PRC_TP'), width: '120', styleName: 'text-center', options: codes.RGLR_SPP_PRC_DV_CD }, // 가격유형
    { fieldName: 'mchnChTpCd', header: t('MSG_TXT_CHDVC_TP'), width: '120', styleName: 'text-center', options: codes.MCHN_CH_TP_CD }, // 기변유형
    { fieldName: 'feePerfTpCd', header: t('MSG_TXT_FEE_PERF_TP'), width: '120', styleName: 'text-center', options: codes.FEE_PERF_TP_CD }, // 수수료실적유형
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '200', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'copnDvCd', header: t('MSG_TXT_CST_DV'), width: '120', styleName: 'text-center', options: codes.COPN_DV_CD }, // 고객구분
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '180', styleName: 'text-left' }, // 상품명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '140', styleName: 'text-center' }, // 상품코드
    { fieldName: 'sellDscDvCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '140', styleName: 'text-center' }, // 할인구분
    { fieldName: 'sellDscrCd', header: t('MSG_TXT_DISC_CODE'), width: '140', styleName: 'text-center', options: codes.SELL_DSCR_CD }, // 할인유형
    { fieldName: 'sellDscTpCd', header: t('MSG_TXT_DSC_SYST'), width: '140', styleName: 'text-center', options: codes.SELL_DSC_TP_CD }, // 할인제도
    { fieldName: 'combiDv', header: t('MSG_TXT_COMBI_DV'), width: '100', styleName: 'text-center' }, // 결합구분
    { fieldName: 'cntrPtrm', header: t('MSG_TXT_ISTM'), width: '120', styleName: 'text-right' }, // 할부
    { fieldName: 'stplPtrm', header: t('MSG_TXT_STPL_MCNT'), width: '120', styleName: 'text-right' }, // 약정개월
    { fieldName: 'svPrd', header: t('MSG_TXT_MNGT_PRD'), width: '100', styleName: 'text-right' }, // 관리주기
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_PD_ACC_RSLT'), width: '140', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 인정실적
    { fieldName: 'feeAckmtBaseAmt', header: t('MSG_TXT_BASE_PRC'), width: '140', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 기준가격
    { fieldName: 'hcr', header: t('MSG_TXT_HOME_CARE'), width: '120', styleName: 'text-right' }, // 홈케어
    { fieldName: 'hcrMshY3', header: t('MSG_TXT_HCR_MSH_Y3'), width: '120', styleName: 'text-right' }, // 홈케어멤버십3년
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_FXAM_YN'), width: '120', styleName: 'text-right' }, // 정액여부
    { fieldName: 'fnnLease', header: t('MSG_TXT_FNN_LEASE'), width: '120', styleName: 'text-right' }, // 금융리스
    { fieldName: 'feeAckmtCt', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '120', styleName: 'text-right' }, // 가전인정건수
    { fieldName: 'nwSellCt', header: t('MSG_TXT_NW_SELL_CT'), width: '120', styleName: 'text-right' }, // 신규판매건수
    { fieldName: 'bfsvcOjYn', header: t('MSG_TXT_OBJ'), width: '120', styleName: 'text-right' }, // BS대상
    { fieldName: 'rstlYn', header: t('MSG_TXT_RECOMMITMENT'), width: '120', styleName: 'text-right' }, // 재약정여부
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTR_DATE'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 계약일자
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 매출일자
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 취소일자
    { fieldName: 'reqdDt', header: t('MSG_TXT_DEM_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 철거일자
    { fieldName: 'dgr3LevlDgPrtnrNo', header: t('MSG_TXT_BRMGR_NO'), width: '120', styleName: 'text-center' }, // 지점장번호
    { fieldName: 'dgr3LevlDgPrtnrNm', header: t('MSG_TXT_BRMGR_FNM'), width: '120', styleName: 'text-center' }, // 지점장성명
    { fieldName: 'sellAmt', header: t('MSG_TXT_RTLFE'), width: '140', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 렌탈료
    { fieldName: 'pmotNo', header: t('MSG_TXT_PMOT_NO'), width: '120', styleName: 'text-center' }, // 프로모션번호
    { fieldName: 'pkgCd', header: t('MSG_TXT_PKG_PD_NO'), width: '120', styleName: 'text-center' }, // 패키지상품번호
    { fieldName: 'mchnSstCd', header: t('MSG_TXT_MCHN') + t('MSG_TXT_CST_CD'), width: '120', styleName: 'text-center' }, // 기기 고객코드
    { fieldName: 'mchnPdCd', header: t('MSG_TXT_MCHN') + t('MSG_TXT_PRDT_CODE'), width: '120', styleName: 'text-center' }, // 기기 상품코드
    { fieldName: 'perfExcdRgstYn', header: t('MSG_TXT_PERF_EXCD') + t('MSG_TXT_RGST_YN'), width: '120', styleName: 'text-center' }, // 실적제외 등록여부
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrdAggr = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' }, // 소속
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '120', styleName: 'text-center' }, // 번호
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '120', styleName: 'text-center' }, // 성명
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), width: '120', styleName: 'text-center', numberFormat: '#,##0', dataType: 'number' }, // 직급
    { fieldName: 'ehCnt', header: t('MSG_TXT_ELHM'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 가전
    { fieldName: 'exCnt', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 가전 외
    { fieldName: 'etCnt', header: t('MSG_TXT_ETC'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 기타
    { fieldName: 'upCnt', header: t('MSG_TXT_NPAID'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 미지급
    { fieldName: 'totCnt', header: t('MSG_TXT_AGG'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 계
    { fieldName: 'ehAmt', header: t('MSG_TXT_ELHM'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 가전
    { fieldName: 'exAmt', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 가전 외
    { fieldName: 'etAmt', header: t('MSG_TXT_ETC'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 기타
    { fieldName: 'upAmt', header: t('MSG_TXT_NPAID'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 미지급
    { fieldName: 'totAmt', header: t('MSG_TXT_AGG'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 계
    { fieldName: 'elhmAckmtCt', header: t('MSG_TXT_PD_ACC_CNT'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 인정건수
    { fieldName: 'rentalBasePrc', header: t('MSG_TXT_RENTAL') + t('MSG_TXT_PD_STD_FEE'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 렌탈 기준수수료
    { fieldName: 'snglPmntBasePrc', header: t('MSG_TXT_SNGL_PMNT') + t('MSG_TXT_PD_STD_FEE'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 일시불 기준수수료
    { fieldName: 'elhmExcpAckmtPerf', header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 가전외인정실적
    { fieldName: 'chng', header: t('MSG_TXT_CHNG'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 기변
    { fieldName: 'ninc', header: t('MSG_TXT_NINC'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 순증
    { fieldName: 'fxamCt', header: t('MSG_TXT_FXAM') + t('MSG_TXT_COUNT'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 정액 건수
    { fieldName: 'rstlCt', header: t('MSG_TXT_RSTL') + t('MSG_TXT_COUNT'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 재약정 건수
    { fieldName: 'livePakg', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 라이브팩
    { fieldName: 'mmbr', header: t('MSG_TXT_MMBR'), width: '120', styleName: 'text-right', numberFormat: '#,##0', dataType: 'number' }, // 멤버십
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'ogCd', 'prtnrNo', 'prtnrKnm', 'pstnDvCd',
    {
      header: t('MSG_TXT_FEE') + t('MSG_TXT_PERF_CT'), // 수수료 실적건수
      direction: 'horizontal',
      items: ['ehCnt', 'exCnt', 'etCnt', 'upCnt', 'totCnt'],
    },
    {
      header: t('MSG_TXT_PD_ACC_RSLT'), // 인정실적
      direction: 'horizontal',
      items: ['ehAmt', 'exAmt', 'etAmt', 'upAmt', 'totAmt'],
    },
    {
      header: t('MSG_TXT_ELHM'), // 가전
      direction: 'horizontal',
      items: ['elhmAckmtCt', 'rentalBasePrc', 'snglPmntBasePrc', 'elhmExcpAckmtPerf', 'chng', 'ninc'],
    },
    {
      header: t('MSG_TXT_ETC'), // 기타
      direction: 'horizontal',
      items: ['fxamCt', 'rstlCt', 'livePakg', 'mmbr'],
    },
  ]);
});

</script>
