<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaOgNetOrderHomeMasterListM - 홈마스터 수수료 순주문 관리
3. 작성자 : gs.piit150
4. 작성일 : 2023.02.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 홈마스터 수수료 순주문 관리 목록 조회 화면
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
            :label="$t('MSG_TXT_ORDR')"
            required
          >
            <kw-option-group
              v-model="searchParams.schTcnt"
              :label="$t('MSG_TXT_ORDR')"
              rules="required"
              type="radio"
              :options="[$t('MSG_TXT_1ST'), $t('MSG_TXT_2ND')]"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.schDv"
              :label="$t('MSG_TXT_DIV')"
              :options="customCodes.divCd"
              rules="required"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
            required
          >
            <kw-select
              v-model="searchParams.schPdctTp"
              :label="$t('MSG_TXT_PDCT_TP')"
              :options="customCodes.pdctTpCd"
              rules="required"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
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
          <kw-search-item
            :label="$t('MSG_TXT_SL_DT')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.schSlDtStrt"
              v-model:to="searchParams.schSlDtEnd"
              :label="$t('MSG_TXT_SL_DT')"
              rules="date_range_required|date_range_months:1"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_RCPDT')"
          >
            <kw-date-range-picker
              v-model:from="searchParams.schRcpDtStrt"
              v-model:to="searchParams.schRcpDtEnd"
              :label="$t('MSG_TXT_RCPDT')"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelectVisile1"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_ORDR')"
            required
          >
            <kw-option-group
              v-model="searchParams.schTcnt"
              :label="$t('MSG_TXT_ORDR')"
              rules="required"
              type="radio"
              :options="[$t('MSG_TXT_1ST'), $t('MSG_TXT_2ND')]"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.schDv"
              :label="$t('MSG_TXT_DIV')"
              :options="customCodes.divCd"
              rules="required"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
            required
          >
            <kw-select
              v-model="searchParams.schPdctTp"
              :label="$t('MSG_TXT_PDCT_TP')"
              :options="customCodes.pdctTpCd"
              rules="required"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
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
          <kw-search-item
            :label="$t('MSG_TXT_RCPDT')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.schRcpDtStrt"
              v-model:to="searchParams.schRcpDtEnd"
              :label="$t('MSG_TXT_RCPDT')"
              rules="date_range_required|date_range_months:1"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_SL_DT')"
          >
            <kw-date-range-picker
              v-model:from="searchParams.schSlDtStrt"
              v-model:to="searchParams.schSlDtEnd"
              :label="$t('MSG_TXT_SL_DT')"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelectVisile2"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_ORDR')"
            required
          >
            <kw-option-group
              v-model="searchParams.schTcnt"
              :label="$t('MSG_TXT_ORDR')"
              rules="required"
              type="radio"
              :options="[$t('MSG_TXT_1ST'), $t('MSG_TXT_2ND')]"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.schDv"
              :label="$t('MSG_TXT_DIV')"
              :options="customCodes.divCd"
              rules="required"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
            required
          >
            <kw-select
              v-model="searchParams.schPdctTp"
              :label="$t('MSG_TXT_PDCT_TP')"
              :options="customCodes.pdctTpCd"
              rules="required"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
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
          <kw-search-item
            :label="$t('MSG_TXT_RCPDT')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.schRcpDtStrt"
              v-model:to="searchParams.schRcpDtEnd"
              :label="$t('MSG_TXT_RCPDT')"
              rules="date_range_required|date_range_months:1"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelectVisile3"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_ORDR')"
            required
          >
            <kw-option-group
              v-model="searchParams.schTcnt"
              :label="$t('MSG_TXT_ORDR')"
              rules="required"
              type="radio"
              :options="[$t('MSG_TXT_1ST'), $t('MSG_TXT_2ND')]"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.schDv"
              :label="$t('MSG_TXT_DIV')"
              :options="customCodes.divCd"
              rules="required"
              @change="onChangeBizDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
            required
          >
            <kw-select
              v-model="searchParams.schPdctTp"
              :label="$t('MSG_TXT_PDCT_TP')"
              :options="customCodes.pdctTpCd"
              rules="required"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
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
          <kw-search-item
            :label="$t('MSG_TXT_RCPDT')"
          >
            <kw-date-range-picker
              v-model:from="searchParams.schRcpDtStrt"
              v-model:to="searchParams.schRcpDtEnd"
              :label="$t('MSG_TXT_RCPDT')"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_SL_DT')"
          >
            <kw-date-range-picker
              v-model:from="searchParams.schSlDtStrt"
              v-model:to="searchParams.schSlDtEnd"
              :label="$t('MSG_TXT_SL_DT')"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
    </kw-search>
    <div class="result-area">
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
        v-if="isGridVisile"
        ref="grdMainRef"
        name="grd1Main"
        :visible-rows="10"
        @init="initGrdMain"
      />
      <kw-grid
        v-if="isGrid2Visile"
        ref="grdMainRef"
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
import { useGlobal, getComponentType, gridUtil, useDataService, defineGrid } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { modal } = useGlobal();

const dataService = useDataService();

const { t } = useI18n();
const currentRoute = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const isSelectVisile = ref(true);
const isSelectVisile1 = ref(false);
const isSelectVisile2 = ref(false);
const isSelectVisile3 = ref(false);
const isGridVisile = ref(true);
const isGrid2Visile = ref(false);
const customCodes = {
  divCd: [{ codeId: '01', codeName: '매출' }, { codeId: '02', codeName: '접수' }, { codeId: '03', codeName: '예약' }, { codeId: '04', codeName: '수수료 실적 집계 대상' }],
  pdctTpCd: [{ codeId: '01', codeName: '전체' }, { codeId: '02', codeName: '환경가전' }, { codeId: '03', codeName: '환경가전외' }, { codeId: '04', codeName: '홈케어' }, { codeId: '05', codeName: '정기구매' }],
  tcntCd: [{ codeId: '01', codeName: '1차' }, { codeId: '02', codeName: '2차' }],
};
const searchParams = ref({

  schTcnt: t('MSG_TXT_1ST'),
  schDv: '01',
  schPdctTp: '01',
  schPdCdStrt: '',
  schPdCdEnd: '',
  schSlDtStrt: now.add(-1, 'month').startOf('month').format('YYYYMMDD'),
  schSlDtEnd: now.add(-1, 'month').endOf('month').format('YYYYMMDD'),
  schRcpDtStrt: '',
  schRcpDtEnd: '',
  schPerfYm: '',
});
let cachedParams;

/*
 *  Event - 조회조건 선택에 변경 param init
 */
async function initSearchParams(b1, b2, b3, b4, b5, b6, dt1, dt2, dt3, dt4, dt5) {
  isSelectVisile.value = b1;
  isSelectVisile1.value = b2;
  isSelectVisile2.value = b3;
  isSelectVisile3.value = b4;
  isGridVisile.value = b5;
  isGrid2Visile.value = b6;
  searchParams.value.schSlDtStrt = dt1;
  searchParams.value.schSlDtEnd = dt2;
  searchParams.value.schRcpDtStrt = dt3;
  searchParams.value.schRcpDtEnd = dt4;
  searchParams.value.schPerfYm = dt5;
  searchParams.value.schPdCdStrt = '';
  searchParams.value.schPdCdEnd = '';
  searchParams.value.schPdctTp = '01';
}

/*
 *  Event - 조회조건 선택에 따른 검색조건 및 그리드 변경
 */

async function onChangeBizDv() {
  const { schDv } = searchParams.value;
  const strtDt = now.add(-1, 'month').startOf('month').format('YYYYMMDD');
  const endDt = now.add(-1, 'month').endOf('month').format('YYYYMMDD');
  const baseYm = now.add(-1, 'month').format('YYYYMM');

  if (schDv === '01') {
    initSearchParams(true, false, false, false, true, false, strtDt, endDt, '', '', '');
  } else if (schDv === '02') {
    await initSearchParams(false, true, false, false, true, false, '', '', strtDt, endDt, '');
  } else if (schDv === '03') {
    await initSearchParams(false, false, true, false, true, false, '', '', strtDt, endDt, '');
  } else if (schDv === '04') {
    initSearchParams(false, false, false, true, false, true, '', '', '', '', baseYm);
  }
}

/*
 *  Event - 수수료 실적 생성 버튼 클릭 (CR/CO)
 */
async function openFeePerfCrtPopup() {
  const param = {
    perfYm: now.add(-1, 'month').format('YYYYMM'),
    ogTp: 'W03',
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
    perfYm: now.add(-1, 'month').format('YYYYMM'),
    ogTp: 'W03',
    dv: 'CO',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: param,
  });
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

async function fetchData() {
  const { schDv } = searchParams.value;
  let uri = '';
  if (schDv === '01' || schDv === '02' || schDv === '03') {
    uri = 's';
  } else if (schDv === '04') {
    uri = '-sell-fees';
  }
  const response = await dataService.get(`/sms/wells/fee/organization-netorders/hmst${uri}`, { params: cachedParams });
  const hmstFees = response.data;
  totalCount.value = hmstFees.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(hmstFees);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_RGNL_GRP'), width: '98' },
    { fieldName: 'col2', header: t('MSG_TXT_BRANCH'), width: '98', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '112', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_EMPL_NM'), width: '72' },
    { fieldName: 'col5', header: t('MSG_TXT_SEL_TYPE'), width: '110' },
    { fieldName: 'col6', header: t('MSG_TXT_PDCT_TP'), width: '110' },
    { fieldName: 'col7', header: t('MSG_TXT_PRC_TP'), width: '110', styleName: 'text-right' },
    { fieldName: 'col8', header: t('MSG_TXT_CHDVC_TP'), width: '110', styleName: 'text-right' },
    { fieldName: 'col9', header: t('MSG_TXT_CNTR_DTL_NO'), width: '188', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_CST_DV'), width: '83' },
    { fieldName: 'col11', header: t('MSG_TXT_PRDT_NM'), width: '226' },
    { fieldName: 'col12', header: t('MSG_TXT_PRDT_CODE'), width: '83', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_USWY'), width: '83', styleName: 'text-right' },
    { fieldName: 'col14', header: t('MSG_TXT_PD_DC_CLASS'), width: '83', styleName: 'text-right' },
    { fieldName: 'col15', header: t('MSG_TXT_DISC_CODE'), width: '83', styleName: 'text-right' },
    { fieldName: 'col16', header: t('MSG_TXT_DSC_SYST '), width: '83', styleName: 'text-right' },
    { fieldName: 'col17', header: t('MSG_TXT_COMBI_DV'), width: '83', styleName: 'text-right' },
    { fieldName: 'col18', header: t('MSG_TXT_DP_PERF'), width: '141', styleName: 'text-right' },
    { fieldName: 'col19', header: t('MSG_TXT_ISTM'), width: '83', styleName: 'text-right' },
    { fieldName: 'col20', header: t('MSG_TXT_DSC'), width: '83', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_STPL_MCNT'), width: '83', styleName: 'text-right' },
    { fieldName: 'col22', header: t('MSG_TXT_MNGT_PRD'), width: '83', styleName: 'text-right' },
    { fieldName: 'col23', header: t('MSG_TXT_PD_ACC_RSLT'), width: '141', styleName: 'text-right' },
    { fieldName: 'col24', header: t('MSG_TXT_BASE_PRC'), width: '123', styleName: 'text-right' },
    { fieldName: 'col25', header: t('MSG_TXT_HOME_CARE'), width: '83', styleName: 'text-right' },
    { fieldName: 'col26', header: `${t('MSG_TXT_HOME_CARE')}3${t('MSG_TXT_YEAR')}`, width: '141' },
    { fieldName: 'col27', header: t('MSG_TXT_FXAM_YN'), width: '83' },
    { fieldName: 'col28', header: t('MSG_TXT_FNN_LEASE'), width: '83' },
    { fieldName: 'col29', header: t('MSG_TXT_PD_ACC_CNT'), width: '83', styleName: 'text-right' },
    { fieldName: 'col30', header: t('MSG_TXT_RECOMMITMENT'), width: '113' },
    { fieldName: 'col31', header: t('MSG_TXT_CNTR_DATE'), width: '113', styleName: 'text-center' },
    { fieldName: 'col32', header: t('MSG_TXT_SL_DT'), width: '113', styleName: 'text-center' },
    { fieldName: 'col33', header: t('MSG_TXT_CANC_DT'), width: '113', styleName: 'text-center' },
    { fieldName: 'col34', header: t('MSG_TXT_BRMGR'), width: '113', styleName: 'text-center' },
    { fieldName: 'col35', header: t('MSG_TXT_BRMGR'), width: '100' },
    { fieldName: 'col36', header: t('MSG_TXT_RTLFE'), width: '104', styleName: 'text-right' },
    { fieldName: 'col37', header: t('MSG_TXT_PMOT_NO'), width: '104', styleName: 'text-right' },
    { fieldName: 'col38', header: t('MSG_TXT_PKG_SN'), width: '135' },
    { fieldName: 'col39', header: t('MSG_TXT_FEE_PERF_MM'), width: '113', styleName: 'text-center' },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'og2Nm' },
    { fieldName: 'og3Nm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'rcpDt' },
    { fieldName: 'slDt' },
    { fieldName: 'canDt' },
    { fieldName: 'prdtyp' },
    { fieldName: 'pdCd' },
    { fieldName: 'prdgrp' },
    { fieldName: 'pdNm' },
    { fieldName: 'ackmtPerfCt' },
    { fieldName: 'mchnChTpCd' },
  ];

  const columns = [
    { fieldName: 'og2Nm', header: t('MSG_TXT_RGNL_GRP'), width: '98' },
    { fieldName: 'og3Nm', header: t('MSG_TXT_BRANCH'), width: '98' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '111.9', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '72', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '110' },
    { fieldName: 'rcpDt', header: t('MSG_TXT_RCPDT'), width: '110' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '110' },
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '188', styleName: 'text-center' },
    { fieldName: 'prdtyp', header: t('MSG_TXT_PDCT_TP'), width: '83.5' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '226.5', styleName: 'text-' },
    { fieldName: 'prdgrp', header: t('MSG_TXT_PD_GRP'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '110.9', styleName: 'text-' },
    { fieldName: 'ackmtPerfCt', header: t('MSG_TXT_PD_ACC_CNT'), width: '83.5', styleName: 'text-' },
    { fieldName: 'mchnChTpCd', header: t('MSG_TXT_CHDVC_TP'), width: '83.5', styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
