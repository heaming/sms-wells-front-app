<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaOgNetOrderPlannerListM - P조직 수수료 순주문 관리
3. 작성자 : min-kyu bae
4. 작성일 : 2023.02.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- P조직 수수료 순주문 관리 목록 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <div
        v-if="isSelectVisile1"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV')"
          >
            <kw-option-group
              v-model="searchParams.inqrDvCd"
              :label="$t('MSG_TXT_INQR_DV')"
              type="radio"
              :options="customCodes.inqrCd"
              @change="onChangeInqrDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.divCd"
              :label="$t('MSG_TXT_DIV')"
              :options="customCodes.divCd"
              rules="required"
              @change="onChangeInqrDv"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_FEE_PERF')+$t('MSG_TXT_TYPE')"
          >
            <kw-select
              v-model="searchParams.feePerfCd"
              :options="codes.FEE_PERF_TP_CD"
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
              v-model="searchParams.sellTpCd"
              :label="$t('MSG_TXT_SEL_TYPE')"
              :options="customCodes.selTpCd"
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
              @change="onChangeDt"
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
              v-model="searchParams.pdEndCd"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.pkgEndCd"
            />
          </kw-search-item>
          <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
            <zwog-level-select
              v-model:og-levl-dv-cd1="searchParams.og1LevlId"
              v-model:og-levl-dv-cd2="searchParams.og2LevlId"
              v-model:og-levl-dv-cd3="searchParams.og3LevlId"
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
        v-if="isSelectVisile2"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV')"
          >
            <kw-option-group
              v-model="searchParams.inqrDvCd"
              :label="$t('MSG_TXT_INQR_DV')"
              type="radio"
              :options="customCodes.inqrCd"
              @change="onChangeInqrDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.divCd"
              :label="$t('MSG_TXT_DIV')"
              :options="customCodes.divCd"
              rules="required"
              @change="onChangeInqrDv"
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
              v-model:og-levl-dv-cd1="searchParams.og1LevlId"
              v-model:og-levl-dv-cd2="searchParams.og2LevlId"
              v-model:og-levl-dv-cd3="searchParams.og3LevlId"
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
        v-if="isSelectVisile3"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV')"
          >
            <kw-option-group
              v-model="searchParams.inqrDvCd"
              :label="$t('MSG_TXT_INQR_DV')"
              type="radio"
              :options="customCodes.inqrCd"
              @change="onChangeInqrDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_RSB_DV')"
          >
            <kw-option-group
              v-model="searchParams.rsbDvCd"
              :label="$t('MSG_TXT_RSB_DV')"
              type="radio"
              :options="customCodes.rsbDvCd"
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
              v-model:og-levl-dv-cd1="searchParams.og1LevlId"
              v-model:og-levl-dv-cd2="searchParams.og2LevlId"
              v-model:og-levl-dv-cd3="searchParams.og3LevlId"
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
          v-permission:download
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!isExcelDown"
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
          v-permission:create
          :label="$t('MSG_BTN_FEE_PERF_CRT')"
          primary
          dense
          secondary
          @click="openFeePerfCrtPopup"
        />
        <kw-btn
          v-if="isPerfVisile"
          v-permission:update
          :label="$t('MSG_BTN_FEE_PERF_DTRM')"
          primary
          dense
          secondary
          @click="openFeePerfCnfmPopup"
        />
        <kw-btn
          v-if="isPerfVisile"
          v-permission:update
          :label="$t('MSG_BTN_FEE_PERF_DTRM_CAN')"
          primary
          dense
          secondary
          @click="openFeePerfCnfmCanPopup"
        />
      </kw-action-top>

      <kw-grid
        v-if="isSelectVisile1"
        ref="grd1MainRef"
        name="grd1Main"
        :visible-rows="10"
        @init="initGrd1Main"
      />
      <kw-grid
        v-if="isSelectVisile2"
        ref="grd2MainRef"
        name="grd2Main"
        :visible-rows="10"
        @init="initGrd2Main"
      />
      <kw-grid
        v-if="isSelectVisile3"
        ref="grd3MainRef"
        name="grd3Main"
        :visible-rows="10"
        @init="initGrd3Main"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';

import pdConst from '~sms-common/product/constants/pdConst';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import { useDataService, getComponentType, useGlobal, gridUtil, defineGrid, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { modal, confirm } = useGlobal();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grd1MainRef = ref(getComponentType('KwGrid'));
const grd2MainRef = ref(getComponentType('KwGrid'));
const grd3MainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'FEE_PERF_TP_CD',
  'MCHN_CH_TP_CD',
  'FEE_PDCT_TP_CD',
  'PMOT_TP_CD',
  'SELL_DSC_DV_CD',
  'SELL_DSC_TP_CD',
  'SV_PD_TP_CD',
  'FEE_TCNT_DV_CD',
);

const customCodes = {
  inqrCd: [{ codeId: '01', codeName: '상세' }, { codeId: '02', codeName: '집계' }],
  divCd: [{ codeId: '01', codeName: '매출' }, { codeId: '02', codeName: '접수' }, { codeId: '03', codeName: '예약' }, { codeId: '04', codeName: '수수료 실적 집계 대상' }],
  selTpCd: [{ codeId: '0', codeName: '전체' }, { codeId: '2', codeName: '렌탈/리스' }, { codeId: '1', codeName: '일시불' }, { codeId: '6', codeName: '정기배송' }, { codeId: '7', codeName: '재약정' }, { codeId: '3', codeName: '홈케어멤버십' }],
  rsbDvCd: [{ codeId: '00', codeName: '전체' }, { codeId: '15', codeName: '플래너' }, { codeId: '7', codeName: '지점장' }],
};
const isSelectVisile1 = ref(true);
const isSelectVisile2 = ref(false);
const isSelectVisile3 = ref(false);
const isExcelDown = ref(false);
const isPerfVisile = ref(false);

const searchParams = ref({
  inqrDvCd: '01',
  feeTcntDvCd: '01',
  divCd: '02',
  feePerfCd: '',
  pdctTpCd: '',
  sellTpCd: '0',
  strtDt: now.add(-1, 'month').startOf('month').format('YYYYMMDD'),
  endDt: now.add(-1, 'month').endOf('month').format('YYYYMMDD'),
  cancStrtDt: '',
  cancEndDt: '',
  pdStrtCd: '',
  pdEndCd: '',
  pkgStrtCd: '',
  pkgEndCd: '',
  og1LevlId: '',
  og2LevlId: '',
  og3LevlId: '',
  prtnrNo: '',
  perfYm: now.add(-1, 'month').format('YYYYMM'),
  rsbDvCd: '00',
  prtnrKnm: '',
  ogTpCd: 'W01',
  pdCd: '',
  feeBatWkId: 'WSM_FE_OA0003', /* 수수료배치작업ID= 조직별실적집계 */
});

let cachedParams;

/*
 *  Event - 조회조건 선택에 변경 param init
*/
async function initSearchParams() {
  totalCount.value = 0;
  grd1MainRef.value.getData().clearRows();
  grd2MainRef.value.getData().clearRows();
  grd3MainRef.value.getData().clearRows();
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
      ogTpCd: 'W01',
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
 *  Event - 조회조건 선택에 따른 검색조건 및 그리드 변경
 */
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
 *  Event - 일자 선택에 따른 실적년월 적용
 */

async function onChangeDt() {
  const { inqrDvCd, strtDt } = searchParams.value;
  if (inqrDvCd === '01') {
    searchParams.value.perfYm = strtDt.substring(0, 6);
  }
}

/*
 *  Event - 수수료 실적 생성 버튼 클릭 (CR/CO)
 */
async function openFeePerfCrtPopup() {
  const statusParams = {
    baseYm: searchParams.value.perfYm,
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '101',
    ntorCnrfmStatCd: '01',
  };

  const res = await dataService.get('/sms/common/fee/net-order-status/prtnr', { params: statusParams });
  console.log(res);

  if (!isEmpty(res.data)) {
    if (!await confirm(t('MSG_ALT_AGRG_PERF_ALREADY_DATA'))) { return; }
  }

  const params = {
    perfYm: searchParams.value.perfYm,
    ogTp: 'W01',
    dv: 'CR',
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '101',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: params,
  });
}

/*
 *  Event - 수수료 실적 확정 버튼 클릭 (CR/CO)
 */
async function openFeePerfCnfmPopup() {
  const statusParams = {
    baseYm: searchParams.value.perfYm,
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '101',
    ntorCnfmStatCd: '02',
  };

  const res = await dataService.get('/sms/common/fee/net-order-status/prtnr', { params: statusParams });

  if (!isEmpty(res.data)) {
    if (!await confirm(t('MSG_ALT_MSG_ALT_CNFM_PERF_ALREADY_DATA'))) { return; }
  }

  const param = {
    perfYm: searchParams.value.perfYm,
    ogTp: 'W01',
    dv: 'CO',
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '101',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: param,
  });
}

/*
 *  Event - 수수료 실적 확정 취소 버튼 클릭 (CR/CO)
 */
async function openFeePerfCnfmCanPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    ogTp: 'W01',
    dv: 'CC',
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '101',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: param,
  });
}

async function downloadExcelView1(uri) {
  const view = grd1MainRef.value.getView();
  const response = await dataService.get(`/sms/wells/fee/organization-netorders/${uri}`, { params: cachedParams, timeout: 300000 });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function downloadExcelView2(uri) {
  const view = grd2MainRef.value.getView();
  const response = await dataService.get(`/sms/wells/fee/organization-netorders/${uri}`, { params: cachedParams, timeout: 300000 });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function downloadExcelView3(uri) {
  const view = grd3MainRef.value.getView();
  const response = await dataService.get(`/sms/wells/fee/organization-netorders/${uri}`, { params: cachedParams, timeout: 300000 });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickExcelDownload() {
  const { inqrDvCd, divCd } = searchParams.value;
  cachedParams = cloneDeep(searchParams.value);
  if (inqrDvCd === '01') {
    if (divCd === '04') {
      await downloadExcelView2('plar-fees');
    } else {
      await downloadExcelView1('plars');
    }
  } else if (inqrDvCd === '02') {
    await downloadExcelView3('plar-aggregation');
  }
}

async function fetchData(uri) {
  const response = await dataService.get(`/sms/wells/fee/organization-netorders/${uri}`, { params: cachedParams, timeout: 300000 });
  const resData = response.data;
  totalCount.value = resData.length;
  if (totalCount.value > 0) {
    isExcelDown.value = true;
  }
  if (uri === 'plars') {
    const mngerView = grd1MainRef.value.getView();
    mngerView.getDataSource().setRows(resData);
  } else if (uri === 'plar-fees') {
    const feeView = grd2MainRef.value.getView();
    feeView.getDataSource().setRows(resData);
  } else if (uri === 'plar-aggregation') {
    const aggrView = grd3MainRef.value.getView();
    aggrView.getDataSource().setRows(resData);
  }
}

async function onClickSearch() {
  const { inqrDvCd, divCd } = searchParams.value;
  let uri = '';

  if (inqrDvCd === '01') {
    uri = 'plars';
    if (divCd === '04') {
      uri = 'plar-fees';
    }
  } else if (inqrDvCd === '02') {
    uri = 'plar-aggregation';
  }
  cachedParams = cloneDeep(searchParams.value);
  await fetchData(uri);
}

async function onChangeInqrDv() {
  const { inqrDvCd, divCd } = searchParams.value;
  if (inqrDvCd === '01') {
    if (divCd === '04') {
      isSelectVisile1.value = false;
      isSelectVisile2.value = true;
      isSelectVisile3.value = false;
      isPerfVisile.value = true;
    } else {
      isSelectVisile1.value = true;
      isSelectVisile2.value = false;
      isSelectVisile3.value = false;
      isPerfVisile.value = false;
    }
    initSearchParams();
  } else if (inqrDvCd === '02') {
    isSelectVisile1.value = false;
    isSelectVisile2.value = false;
    isSelectVisile3.value = true;
    isPerfVisile.value = true;
    initSearchParams();
  }
  totalCount.value = 0;
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'og1Lv' },
    { fieldName: 'og2Lv' },
    { fieldName: 'og3Lv' },
    { fieldName: 'sequenceNumber' },
    { fieldName: 'emplNm' },
    { fieldName: 'selType' },
    { fieldName: 'fee' },
    { fieldName: 'chdvcTp' },
    { fieldName: 'pdctTp' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cstDv' },
    { fieldName: 'prdtNm' },
    { fieldName: 'prdtCode' },
    { fieldName: 'uswy' },
    { fieldName: 'pdDcClass' },
    { fieldName: 'discCode' },
    { fieldName: 'dscSyst' },
    { fieldName: 'combiDv' },
    { fieldName: 'dpPerf', dataType: 'number' },
    { fieldName: 'istm' },
    { fieldName: 'homeCare' },
    { fieldName: 'hcrMshY3' },
    { fieldName: 'fxamYn' },
    { fieldName: 'fnnLease' },
    { fieldName: 'recommitment' },
    { fieldName: 'cntrDate' },
    { fieldName: 'slDt' },
    { fieldName: 'cancDt' },
    { fieldName: 'brmgrNo' },
    { fieldName: 'brmgrFnm' },
    { fieldName: 'rtlfe', dataType: 'number' },
    { fieldName: 'stplMcnt' },
    { fieldName: 'mngtPrd' },
    { fieldName: 'pdAccRslt', dataType: 'number' },
    { fieldName: 'pmotNo' },
    { fieldName: 'pkgSn' },
    { fieldName: 'pkgNo' },
    { fieldName: 'ntorMm' },
    { fieldName: 'mchnPd' },
    { fieldName: 'perfExcd' },
    { fieldName: 'bizRgstMm' },
    { fieldName: 'bizRgstNm' },
  ];

  const columns = [
    { fieldName: 'og1Lv', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98', styleName: 'text-left' },
    { fieldName: 'og2Lv', header: t('MSG_TXT_RGNL_GRP'), width: '98', styleName: 'text-left' },
    { fieldName: 'og3Lv', header: t('MSG_TXT_BRANCH'), width: '98', styleName: 'text-left' },
    { fieldName: 'sequenceNumber', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '98' },
    { fieldName: 'emplNm', header: t('MSG_TXT_EMPL_NM'), width: '98' },
    { fieldName: 'selType', header: t('MSG_TXT_SEL_TYPE'), width: '111.9', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'fee', header: t('MSG_TXT_PDCT_TP'), width: '72', styleName: 'text-center', options: codes.FEE_PDCT_TP_CD },
    { fieldName: 'chdvcTp', header: t('MSG_TXT_CHDVC_TP'), width: '110', styleName: 'text-center', options: codes.MCHN_CH_TP_CD },
    { fieldName: 'pdctTp', header: t('MSG_TXT_FEE') + t('MSG_TXT_PERF') + t('MSG_TXT_TYPE'), width: '110', styleName: 'text-center', options: codes.FEE_PERF_TP_CD },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '110' },
    { fieldName: 'cstDv', header: t('MSG_TXT_CST_DV'), width: '188', styleName: 'text-center' },
    { fieldName: 'prdtNm', header: t('MSG_TXT_PRDT_NM'), width: '226.5', styleName: 'text-left' },
    { fieldName: 'prdtCode', header: t('MSG_TXT_PRDT_CODE'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'uswy', header: t('MSG_TXT_USWY'), width: '83.5', styleName: 'text-center', options: codes.SV_PD_TP_CD },
    { fieldName: 'pdDcClass', header: t('MSG_TXT_PD_DC_CLASS'), width: '83.5', styleName: 'text-center', options: codes.SELL_DSC_DV_CD },
    { fieldName: 'discCode', header: t('MSG_TXT_DISC_CODE'), width: '83.5', styleName: 'text-center', options: codes.SELL_DSC_TP_CD },
    { fieldName: 'dscSyst', header: t('MSG_TXT_DSC_SYST'), width: '83.5', styleName: 'text-center', options: codes.PMOT_TP_CD },
    { fieldName: 'combiDv', header: t('MSG_TXT_COMBI_DV'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'dpPerf', header: t('MSG_TXT_DP_PERF'), width: '83.5', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'istm', header: t('MSG_TXT_ISTM'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'homeCare', header: t('MSG_TXT_HOME_CARE'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'hcrMshY3', header: t('MSG_TXT_HCR_MSH_Y3'), width: '141.2', styleName: 'text-center' },
    { fieldName: 'fxamYn', header: t('MSG_TXT_FXAM_YN'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'fnnLease', header: t('MSG_TXT_FNN_LEASE'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'recommitment', header: t('MSG_TXT_RECOMMITMENT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'cntrDate', header: t('MSG_TXT_CNTR_DATE'), width: '113.2', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '113.2', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cancDt', header: t('MSG_TXT_CANC_DT'), width: '113.2', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'brmgrNo', header: t('MSG_TXT_BRMGR_NO'), width: '113', styleName: 'text-center' },
    { fieldName: 'brmgrFnm', header: t('MSG_TXT_BRMGR_FNM'), width: '100', styleName: 'text-center' },
    { fieldName: 'rtlfe', header: t('MSG_TXT_RTLFE'), width: '104.3', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'stplMcnt', header: t('MSG_TXT_STPL_MCNT'), width: '84', styleName: 'text-right' },
    { fieldName: 'mngtPrd', header: t('MSG_TXT_MNGT_PRD'), width: '84', styleName: 'text-right' },
    { fieldName: 'pdAccRslt', header: `${t('MSG_TXT_PD_ACC_RSLT')}(P)`, width: '142', numberFormat: '#,###,##0', styleName: 'text-right' },
    { fieldName: 'pmotNo', header: t('MSG_TXT_PMOT_NO'), width: '104.3', styleName: 'text-right' },
    { fieldName: 'pkgSn', header: t('MSG_TXT_PKG_SN'), width: '135.1', styleName: 'text-center' },
    { fieldName: 'pkgNo', header: t('MSG_TXT_PKG') + t('MSG_TXT_SEQUENCE_NUMBER'), width: '113', styleName: 'text-center' },
    { fieldName: 'ntorMm', header: t('MSG_TXT_NTOR_MM'), width: '113', styleName: 'text-center' },
    { fieldName: 'mchnPd', header: t('MSG_TXT_MCHN') + t('MSG_TXT_CODE'), width: '113', styleName: 'text-center' },
    { fieldName: 'perfExcd', header: t('MSG_TXT_PERF_EXCD') + t('MSG_TXT_RGST_YN'), width: '113', styleName: 'text-center' },
    { fieldName: 'bizRgstMm', header: t('MSG_TXT_BIZ_RGST_MM'), width: '113', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'bizRgstNm', header: t('MSG_TXT_BIZ_RGST_NM'), width: '113', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'og1Lv' },
    { fieldName: 'og2Lv' },
    { fieldName: 'og3Lv' },
    { fieldName: 'sequenceNumber' },
    { fieldName: 'emplNm' },
    { fieldName: 'selType' },
    { fieldName: 'fee' },
    { fieldName: 'chdvcTp' },
    { fieldName: 'pdctTp' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cstDv' },
    { fieldName: 'prdtNm' },
    { fieldName: 'prdtCode' },
    { fieldName: 'uswy' },
    { fieldName: 'pdDcClass' },
    { fieldName: 'discCode' },
    { fieldName: 'dscSyst' },
    { fieldName: 'combiDv' },
    { fieldName: 'dpPerf', dataType: 'number' },
    { fieldName: 'istm' },
    { fieldName: 'homeCare' },
    { fieldName: 'hcrMshY3' },
    { fieldName: 'fxamYn' },
    { fieldName: 'fnnLease' },
    { fieldName: 'recommitment' },
    { fieldName: 'cntrDate' },
    { fieldName: 'slDt' },
    { fieldName: 'cancDt' },
    { fieldName: 'brmgrNo' },
    { fieldName: 'brmgrFnm' },
    { fieldName: 'rtlfe', dataType: 'number' },
    { fieldName: 'stplMcnt' },
    { fieldName: 'mngtPrd' },
    { fieldName: 'pdAccRslt', dataType: 'number' },
    { fieldName: 'pmotNo' },
    { fieldName: 'pkgSn' },
    { fieldName: 'pkgNo' },
    { fieldName: 'ntorMm' },
    { fieldName: 'mchnPd' },
    { fieldName: 'perfExcd' },
    { fieldName: 'bizRgstMm' },
    { fieldName: 'bizRgstNm' },
  ];

  const columns = [
    { fieldName: 'og1Lv', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98', styleName: 'text-left' },
    { fieldName: 'og2Lv', header: t('MSG_TXT_RGNL_GRP'), width: '98', styleName: 'text-left' },
    { fieldName: 'og3Lv', header: t('MSG_TXT_BRANCH'), width: '98', styleName: 'text-left' },
    { fieldName: 'sequenceNumber', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '98' },
    { fieldName: 'emplNm', header: t('MSG_TXT_EMPL_NM'), width: '98' },
    { fieldName: 'selType', header: t('MSG_TXT_SEL_TYPE'), width: '111.9', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'fee', header: t('MSG_TXT_PDCT_TP'), width: '72', styleName: 'text-center', options: codes.FEE_PDCT_TP_CD },
    { fieldName: 'chdvcTp', header: t('MSG_TXT_CHDVC_TP'), width: '110', styleName: 'text-center', options: codes.MCHN_CH_TP_CD },
    { fieldName: 'pdctTp', header: t('MSG_TXT_FEE') + t('MSG_TXT_PERF') + t('MSG_TXT_TYPE'), width: '110', styleName: 'text-center', options: codes.FEE_PERF_TP_CD },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '110' },
    { fieldName: 'cstDv', header: t('MSG_TXT_CST_DV'), width: '188', styleName: 'text-center' },
    { fieldName: 'prdtNm', header: t('MSG_TXT_PRDT_NM'), width: '226.5', styleName: 'text-left' },
    { fieldName: 'prdtCode', header: t('MSG_TXT_PRDT_CODE'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'uswy', header: t('MSG_TXT_USWY'), width: '83.5', styleName: 'text-center', options: codes.SV_PD_TP_CD },
    { fieldName: 'pdDcClass', header: t('MSG_TXT_PD_DC_CLASS'), width: '83.5', styleName: 'text-center', options: codes.SELL_DSC_DV_CD },
    { fieldName: 'discCode', header: t('MSG_TXT_DISC_CODE'), width: '83.5', styleName: 'text-center', options: codes.SELL_DSC_TP_CD },
    { fieldName: 'dscSyst', header: t('MSG_TXT_DSC_SYST'), width: '83.5', styleName: 'text-center', options: codes.PMOT_TP_CD },
    { fieldName: 'combiDv', header: t('MSG_TXT_COMBI_DV'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'dpPerf', header: t('MSG_TXT_DP_PERF'), width: '83.5', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'istm', header: t('MSG_TXT_ISTM'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'homeCare', header: t('MSG_TXT_HOME_CARE'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'hcrMshY3', header: t('MSG_TXT_HCR_MSH_Y3'), width: '141.2', styleName: 'text-center' },
    { fieldName: 'fxamYn', header: t('MSG_TXT_FXAM_YN'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'fnnLease', header: t('MSG_TXT_FNN_LEASE'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'recommitment', header: t('MSG_TXT_RECOMMITMENT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'cntrDate', header: t('MSG_TXT_CNTR_DATE'), width: '113.2', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '113.2', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cancDt', header: t('MSG_TXT_CANC_DT'), width: '113.2', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'brmgrNo', header: t('MSG_TXT_BRMGR_NO'), width: '113', styleName: 'text-center' },
    { fieldName: 'brmgrFnm', header: t('MSG_TXT_BRMGR_FNM'), width: '100', styleName: 'text-center' },
    { fieldName: 'rtlfe', header: t('MSG_TXT_RTLFE'), width: '104.3', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'stplMcnt', header: t('MSG_TXT_STPL_MCNT'), width: '84', styleName: 'text-right' },
    { fieldName: 'mngtPrd', header: t('MSG_TXT_MNGT_PRD'), width: '84', styleName: 'text-right' },
    { fieldName: 'pdAccRslt', header: `${t('MSG_TXT_PD_ACC_RSLT')}(P)`, width: '142', numberFormat: '#,###,##0', styleName: 'text-right' },
    { fieldName: 'pmotNo', header: t('MSG_TXT_PMOT_NO'), width: '104.3', styleName: 'text-right' },
    { fieldName: 'pkgSn', header: t('MSG_TXT_PKG_SN'), width: '135.1', styleName: 'text-center' },
    { fieldName: 'pkgNo', header: t('MSG_TXT_PKG') + t('MSG_TXT_SEQUENCE_NUMBER'), width: '113', styleName: 'text-center' },
    { fieldName: 'ntorMm', header: t('MSG_TXT_NTOR_MM'), width: '113', styleName: 'text-center' },
    { fieldName: 'mchnPd', header: t('MSG_TXT_MCHN') + t('MSG_TXT_CODE'), width: '113', styleName: 'text-center' },
    { fieldName: 'perfExcd', header: t('MSG_TXT_PERF_EXCD') + t('MSG_TXT_RGST_YN'), width: '113', styleName: 'text-center' },
    { fieldName: 'bizRgstMm', header: t('MSG_TXT_BIZ_RGST_MM'), width: '113', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'bizRgstNm', header: t('MSG_TXT_BIZ_RGST_NM'), width: '113', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrd3Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogId' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'pstnDvCd' },
    { fieldName: 'ehCnt', dataType: 'number' },
    { fieldName: 'exCnt', dataType: 'number' },
    { fieldName: 'etCnt', dataType: 'number' },
    { fieldName: 'upCnt', dataType: 'number' },
    { fieldName: 'totCnt', dataType: 'number' },
    { fieldName: 'ehAmt', dataType: 'number' },
    { fieldName: 'exAmt', dataType: 'number' },
    { fieldName: 'etAmt', dataType: 'number' },
    { fieldName: 'upAmt', dataType: 'number' },
    { fieldName: 'totAmt', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'ogId', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), width: '120', styleName: 'text-center' },
    { fieldName: 'ehCnt', header: t('MSG_TXT_ELHM'), width: '120', styleName: 'text-center', numberFormat: '#,###,##0' },
    { fieldName: 'exCnt', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '120', styleName: 'text-center', numberFormat: '#,###,##0' },
    { fieldName: 'etCnt', header: t('MSG_TXT_ETC'), width: '120', styleName: 'text-center', numberFormat: '#,###,##0' },
    { fieldName: 'upCnt', header: t('MSG_TXT_NPAID'), width: '120', styleName: 'text-center', numberFormat: '#,###,##0' },
    { fieldName: 'totCnt', header: t('MSG_TXT_AGG'), width: '120', styleName: 'text-center', numberFormat: '#,###,##0' },
    { fieldName: 'ehAmt', header: t('MSG_TXT_ELHM'), width: '120', styleName: 'text-center', numberFormat: '#,###,##0' },
    { fieldName: 'exAmt', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '120', styleName: 'text-center', numberFormat: '#,###,##0' },
    { fieldName: 'etAmt', header: t('MSG_TXT_ETC'), width: '120', styleName: 'text-center', numberFormat: '#,###,##0' },
    { fieldName: 'upAmt', header: t('MSG_TXT_NPAID'), width: '120', styleName: 'text-center', numberFormat: '#,###,##0' },
    { fieldName: 'totAmt', header: t('MSG_TXT_AGG'), width: '120', styleName: 'text-center', numberFormat: '#,###,##0' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'ogId', 'prtnrNo', 'prtnrKnm', 'pstnDvCd',
    {
      header: t('MSG_TXT_FEE') + t('MSG_TXT_PERF_CT'),
      direction: 'horizontal',
      items: ['ehCnt', 'exCnt', 'etCnt', 'upCnt', 'totCnt'],
    },
    {
      header: t('MSG_TXT_PD_ACC_RSLT'),
      direction: 'horizontal',
      items: ['ehAmt', 'exAmt', 'etAmt', 'upAmt', 'totAmt'],
    },
  ]);
});

</script>
