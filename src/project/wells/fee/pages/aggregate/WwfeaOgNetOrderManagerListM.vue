<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaOgNetOrderManagerListM - M조직 수수료 순주문 관리
3. 작성자 : gs.piit150
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
        v-if="isSelectVisile1"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV')"
            required
          >
            <kw-option-group
              v-model="searchParams.schInqrDv"
              :label="$t('MSG_TXT_INQR_DV')"
              rules="required"
              type="radio"
              :options="['상세','집계']"
              @change="onChangeInqrDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_ORDR')"
            required
          >
            <kw-option-group
              v-model="searchParams.schOrdr"
              :label="$t('MSG_TXT_ORDR')"
              rules="required"
              type="radio"
              :options="['1차','2차']"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.schDiv"
              :label="$t('MSG_TXT_DIV')"
              :options="['접수','예약','매출','수수료실적 집계대상']"
              rules="required"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_FEE_PERF')+$t('MSG_TXT_TYPE')"
          >
            <kw-select
              v-model="searchParams.schFeePerf"
              :options="['전체','가전','가전외','기타','미지급']"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
            required
          >
            <kw-select
              v-model="searchParams.schPdctTp"
              :label="$t('MSG_TXT_PDCT_TP')"
              :options="['전체','환경','환경외','웰스팜','홈케어','캡슐','기타']"
              rules="required"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_SEL_TYPE')"
          >
            <kw-select
              v-model="searchParams.schSelType"
              :label="$t('MSG_TXT_SEL_TYPE')"
              :options="['전체','렌탈','정기구매','할부','홈케어','재약정','멤버십']"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_DT')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.schDtStrt"
              v-model:to="searchParams.schDtEnd"
              :label="$t('MSG_TXT_DT')"
              rules="date_range_required|date_range_months:1"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_CANC_DT')"
          >
            <kw-date-range-picker
              v-model:from="searchParams.schCancDtStrt"
              v-model:to="searchParams.schCancDtEnd"
              :label="$t('MSG_TXT_CANC_DT')"
              rules="date_range_months:1"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PRDT_CODE')"
          >
            <kw-input
              v-model="searchParams.schPdCdStrt"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.schPdCdEnd"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_PKG_CD')"
          >
            <kw-input
              v-model="searchParams.schPkgCdStrt"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.schPkgCdEnd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_BLG')"
          >
            <kw-input
              v-model="searchParams.schBlgStrt"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.schBlgEnd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          >
            <kw-input
              v-model="searchParams.schPrtnrNo"
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
            required
          >
            <kw-option-group
              v-model="searchParams.schInqrDv"
              :label="$t('MSG_TXT_INQR_DV')"
              rules="required"
              type="radio"
              :options="['상세','집계']"
              @change="onChangeInqrDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_ORDR')"
            required
          >
            <kw-option-group
              v-model="searchParams.schOrdr"
              :label="$t('MSG_TXT_ORDR')"
              rules="required"
              type="radio"
              :options="['1차','2차']"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PERF_YM')"
            required
          >
            <kw-date-picker
              v-model="searchParams.schPerfYm"
              :label="$t('MSG_TXT_PERF_YM')"
              type="month"
              rules="required"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_RSB_DV')"
            required
          >
            <kw-option-group
              v-model="searchParams.schRsbDv"
              :label="$t('MSG_TXT_RSB_DV')"
              rules="required"
              type="radio"
              :options="['전체','지구장이하','지점장이상']"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_BLG')"
          >
            <kw-input
              v-model="searchParams.schBlgStrt"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.schBlgEnd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          >
            <kw-input
              v-model="searchParams.schPrtnrNo"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
    </kw-search>
    <div
      v-if="isSelectVisile1"
      class="result-area"
    >
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">({{ $t('MSG_TXT_UNIT_COLON_WON') }})</span>
        </template>
        <kw-btn
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount.value === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="'BS'+$t('MSG_BTN_PERF_AGRG')"
          secondary
          dense
          @click="openBfsvcPerfAgrgPopup"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_FEE_PERF_CRT')"
          primary
          dense
          @click="openFeePerfCrtPopup"
        />
        <kw-btn
          :label="$t('MSG_BTN_FEE_PERF_DTRM')"
          primary
          dense
          @click="openFeePerfCnfmPopup"
        />
      </kw-action-top>

      <kw-grid
        ref="grd1MainRef"
        name="grd1Main"
        :visible-rows="10"
        @init="initGrd1Main"
      />
    </div>
    <div
      v-if="isSelectVisile2"
      class="result-area"
    >
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">({{ $t('MSG_TXT_UNIT_COLON_WON') }})</span>
        </template>
        <kw-btn
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount.value === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="'BS'+$t('MSG_BTN_PERF_AGRG')"
          secondary
          dense
          @click="openBfsvcPerfAgrgPopup"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_FEE_PERF_CRT')"
          primary
          dense
          @click="openFeePerfCrtPopup"
        />
        <kw-btn
          :label="$t('MSG_BTN_FEE_PERF_DTRM')"
          primary
          dense
          @click="openFeePerfCnfmPopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grd2MainRef"
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

import { useDataService, getComponentType, useGlobal, gridUtil, defineGrid } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { modal, notify } = useGlobal();
const dataService = useDataService();
const currentRoute = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grd1MainRef = ref(getComponentType('KwGrid'));
const grd2MainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const isSelectVisile1 = ref(true);
const isSelectVisile2 = ref(false);
const isGrid1Visile = ref(true);
const isGrid2Visile = ref(false);

const searchParams = ref({
  schInqrDv: '상세',
  schOrdr: '1차',
  schDiv: '접수',
  schFeePerf: '전체',
  schPdctTp: '전체',
  schSelType: '전체',
  schDtStrt: now.add(-1, 'month').startOf('month').format('YYYYMMDD'),
  schDtEnd: now.add(-1, 'month').endOf('month').format('YYYYMMDD'),
  schCancDtStrt: '',
  schCancDtEnd: '',
  schPdCdStrt: '',
  schPdCdEnd: '',
  schPkgCdStrt: '',
  schPkgCdEnd: '',
  schBlgStrt: '',
  schBlgEnd: '',
  schPrtnrNo: '',
  schPerfYm: '',
  schRsbDv: '',
});

let cachedParams;

/*
 *  Event - 조회조건 선택에 변경 param init
 */
async function initSearchParams() {
  searchParams.value.schOrdr = '1차';
  searchParams.value.schDiv = '접수';
  searchParams.value.schFeePerf = '전체';
  searchParams.value.schPdctTp = '전체';
  searchParams.value.schSelType = '전체';
  searchParams.value.schDtStrt = now.add(-1, 'month').startOf('month').format('YYYYMMDD');
  searchParams.value.schDtEnd = now.add(-1, 'month').endOf('month').format('YYYYMMDD');
  searchParams.value.schCancDtStrt = '';
  searchParams.value.schCancDtEnd = '';
  searchParams.value.schPdCdStrt = '';
  searchParams.value.schPdCdEnd = '';
  searchParams.value.schPkgCdStrt = '';
  searchParams.value.schPkgCdEnd = '';
  searchParams.value.schBlgStrt = '';
  searchParams.value.schBlgEnd = '';
  searchParams.value.schPrtnrNo = '';
  searchParams.value.schPerfYm = now.add(-1, 'month').format('YYYYMM');
  searchParams.value.schRsbDv = '전체';
}

/*
 *  Event - 조회조건 선택에 따른 검색조건 및 그리드 변경
 */

async function onChangeInqrDv() {
  const { schInqrDv } = searchParams.value;

  if (schInqrDv === '상세') {
    isSelectVisile1.value = true;
    isSelectVisile2.value = false;
    isGrid1Visile.value = true;
    isGrid2Visile.value = false;
    initSearchParams();
  } else if (schInqrDv === '집계') {
    isSelectVisile1.value = false;
    isSelectVisile2.value = true;
    isGrid1Visile.value = false;
    isGrid2Visile.value = true;
    initSearchParams();
  }
}

/*
 *  Event - 수수료 실적 생성 버튼 클릭 (CR/CO)
 */
async function openFeePerfCrtPopup() {
  const param = {
    perfYm: now.add(-1, 'month').format('YYYYMMDD'),
    ogTp: 'M',
    dv: 'CR',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: param,
  });
}

/*
 *  Event - 수수료 실적 확정 버튼 클릭 (CR/CO)
 */
async function openFeePerfCnfmPopup() {
  const param = {
    perfYm: now.add(-1, 'month').format('YYYYMMDD'),
    ogTp: 'M',
    dv: 'CO',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: param,
  });
}
/*
 *  Event - BS실적집계 버튼 클릭
 */
async function openBfsvcPerfAgrgPopup() {
  const { result: isChanged } = await modal({
    component: 'WwfeaOgNetOrderBsPerfAgrgRegP',
  });

  if (isChanged) {
    await notify(t('MSG_ALT_CREATED'));
  }
}

async function onClickExcelDownload() {
  const view = grd1MainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

async function fetchData() {
  const { schOrdr } = searchParams.value;
  const { schInqrDv } = searchParams.value;
  let uri = '';
  if (schInqrDv === '판매' && (schOrdr === '접수' || schOrdr === '예약' || schOrdr === '매출')) {
    uri = 's';
  } else if (schInqrDv === '판매' && schOrdr === '수수료 실적 집계 대상') {
    uri = '-sell-fees';
  } else if (schInqrDv === 'BS') {
    uri = '-before-services';
  }
  const response = await dataService.get(`/sms/wells/fee/organization-netorders/mnger${uri}`, { params: cachedParams });
  const mngerFees = response.data;
  totalCount.value = mngerFees.length;

  const view = grd1MainRef.value.getView();
  view.getDataSource().setRows(mngerFees);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },
    { fieldName: 'col22' },
    { fieldName: 'col23' },
    { fieldName: 'col24' },
    { fieldName: 'col25' },
    { fieldName: 'col26' },
    { fieldName: 'col27' },
    { fieldName: 'col28' },
    { fieldName: 'col29' },
    { fieldName: 'col30' },
    { fieldName: 'col31' },
    { fieldName: 'col32' },
    { fieldName: 'col33' },
    { fieldName: 'col34' },
    { fieldName: 'col35' },
    { fieldName: 'col36' },
    { fieldName: 'col37' },
    { fieldName: 'col38' },
    { fieldName: 'col39' },
    { fieldName: 'col40' },
    { fieldName: 'col41' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98' },
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '98' },
    { fieldName: 'col3', header: t('MSG_TXT_BRANCH'), width: '98' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '111.9', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_EMPL_NM'), width: '72', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_SEL_TYPE'), width: '110' },
    { fieldName: 'col7', header: t('MSG_TXT_PDCT_TP'), width: '110' },
    { fieldName: 'col8', header: t('MSG_TXT_PRC_TP'), width: '110' },
    { fieldName: 'col9', header: t('MSG_TXT_CHDVC_TP'), width: '110' },
    { fieldName: 'col10', header: t('MSG_TXT_CNTR_DTL_NO'), width: '188', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_CST_DV'), width: '83.5' },
    { fieldName: 'col12', header: t('MSG_TXT_PRDT_NM'), width: '226.5', styleName: 'text-' },
    { fieldName: 'col13', header: t('MSG_TXT_PRDT_CODE'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_USWY'), width: '110.9', styleName: 'text-' },
    { fieldName: 'col15', header: t('MSG_TXT_PD_DC_CLASS'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col16', header: t('MSG_TXT_DISC_CODE'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col17', header: t('MSG_TXT_DSC_SYST'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col18', header: t('MSG_TXT_COMBI_DV'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col19', header: t('MSG_TXT_DP_PERF'), width: '141.8', styleName: 'text-right' },
    { fieldName: 'col20', header: t('MSG_TXT_ISTM'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_DSC'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col22', header: t('MSG_TXT_STPL_MCNT'), width: '84', styleName: 'text-right' },
    { fieldName: 'col23', header: t('MSG_TXT_MNGT_PRD'), width: '84', styleName: 'text-right' },
    { fieldName: 'col24', header: t('MSG_TXT_PD_ACC_RSLT'), width: '142', styleName: 'text-right' },
    { fieldName: 'col25', header: t('MSG_TXT_BASE_PRC'), width: '123.8', styleName: 'text-right' },
    { fieldName: 'col26', header: t('MSG_TXT_HOME_CARE'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col27', header: `${t('MSG_TXT_HOME_CARE')}3${t('MSG_TXT_YEAR')}`, width: '141.2', styleName: 'text-' },
    { fieldName: 'col28', header: t('MSG_TXT_FXAM_YN'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col29', header: t('MSG_TXT_FNN_LEASE'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col30', header: t('MSG_TXT_PD_ACC_CNT'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col31', header: t('MSG_TXT_RECOMMITMENT'), width: '113.2', styleName: 'text-' },
    { fieldName: 'col32', header: t('MSG_TXT_CNTR_DATE'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col33', header: t('MSG_TXT_SL_DT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col34', header: t('MSG_TXT_CANC_DT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col35', header: t('MSG_TXT_BRMGR'), width: '113', styleName: 'text-center' },
    { fieldName: 'col36', header: t('MSG_TXT_BRMGR'), width: '100', styleName: 'text-' },
    { fieldName: 'col37', header: t('MSG_TXT_RTLFE'), width: '104.3', styleName: 'text-right' },
    { fieldName: 'col38', header: t('MSG_TXT_PMOT_NO'), width: '104.3', styleName: 'text-right' },
    { fieldName: 'col39', header: t('MSG_TXT_PKG_SN'), width: '135.1', styleName: 'text-' },
    { fieldName: 'col40', header: t('MSG_TXT_MCHN') + t('MSG_TXT_CST_CD'), width: '113' },
    { fieldName: 'col41', header: t('MSG_TXT_MCHN') + t('MSG_TXT_PRDT_CODE'), width: '113' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },
  ];

  const columns = [

    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98' },
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '98' },
    { fieldName: 'col3', header: t('MSG_TXT_BRANCH'), width: '98' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '111.9', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_EMPL_NM'), width: '72', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_CNTR_DTL_NO'), width: '188', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_PRDT_CODE'), width: '83.5' },
    { fieldName: 'col8', header: t('MSG_TXT_PRDT_NM'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'col9', header: `BS${t('MSG_TXT_PDGRP')}`, width: '110' },
    { fieldName: 'col10', header: t('MSG_TXT_BAS_FEE'), width: '188', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_VST') + t('MSG_TXT_FEE'), width: '83.5' },
    { fieldName: 'col12', header: t('MSG_TXT_WORK_TYPE'), width: '226.5', styleName: 'text-' },
    { fieldName: 'col13', header: t('MSG_TXT_VST') + t('MSG_TXT_RGLVL'), width: '83.5' },
    { fieldName: 'col14', header: t('MSG_TXT_FER'), width: '110.9', styleName: 'text-' },
    { fieldName: 'col15', header: t('MSG_TXT_SLS_CAT'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col16', header: t('MSG_TXT_HSHD') + t('MSG_TXT_CODE'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col17', header: t('MSG_TXT_HSHD_N'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col18', header: t('MSG_TXT_USWY') + t('MSG_TXT_DIV'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col19', header: t('MSG_TXT_EXP') + t('MSG_TXT_DT'), width: '141.8', styleName: 'text-right' },
    { fieldName: 'col20', header: t('MSG_TXT_VST') + t('MSG_TXT_DT'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_CNCL_YN'), width: '83.5', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
