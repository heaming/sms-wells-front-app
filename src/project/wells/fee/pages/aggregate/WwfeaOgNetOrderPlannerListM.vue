<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaOgNetOrderPlannerListM - P조직 수수료 순주문 관리
3. 작성자 : gs.piit150
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
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_DIV')"
          required
        >
          <kw-select
            v-model="searchParams.schDv"
            :label="$t('MSG_TXT_DIV')"
            :options="customCodes.divCd"
            rules="required"
            @change="onChangeDv"
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
      <div
        v-if="isSelect1Visile"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_DT_OF_SALE')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.schSlDtStrt"
              v-model:to="searchParams.schSlDtEnd"
              :label="$t('MSG_TXT_DT_OF_SALE')"
              rules="date_range_required|date_range_months:1"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelect2Visile"
      >
        <kw-search-row>
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
        v-if="isSelect3Visile"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_RSV_DATE')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.schRsvDtStrt"
              v-model:to="searchParams.schRsvDtEnd"
              :label="$t('MSG_TXT_RSV_DATE')"
              rules="date_range_required|date_range_months:1"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelect4Visile"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_PERF_YM')"
            required
          >
            <kw-date-picker
              v-model="searchParams.perfYm"
              :label="$t('MSG_TXT_PERF_YM')"
              type="month"
              rules="required"
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
          icon="download_on"
          dense
          secondary
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
        v-if="isGrid1Visile"
        ref="grdMainRef"
        name="grd1Main"
        :visible-rows="10"
        @init="initGrd1Main"
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
import dayjs from 'dayjs';

import { useDataService, getComponentType, useGlobal, gridUtil, defineGrid } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { modal } = useGlobal();
const dataService = useDataService();
const isSelect1Visile = ref(true);
const isSelect2Visile = ref(false);
const isSelect3Visile = ref(false);
const isSelect4Visile = ref(false);
const isGrid1Visile = ref(true);
const isGrid2Visile = ref(false);
const { t } = useI18n();
const currentRoute = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const customCodes = {
  divCd: [{ codeId: '01', codeName: '매출' }, { codeId: '02', codeName: '접수' }, { codeId: '03', codeName: '예약' }, { codeId: '04', codeName: '수수료 실적 집계 대상' }],
  pdctTpCd: [{ codeId: '01', codeName: '전체' }, { codeId: '02', codeName: '환경가전' }, { codeId: '03', codeName: '환경가전외' }, { codeId: '04', codeName: '홈케어' }, { codeId: '05', codeName: '정기구매' }],
};
const searchParams = ref({

  schDv: '01',
  schPdctTp: '01',
  schPdCdStrt: '',
  schPdCdEnd: '',
  schSlDtStrt: now.add(-1, 'month').startOf('month').format('YYYYMMDD'),
  schSlDtEnd: now.add(-1, 'month').endOf('month').format('YYYYMMDD'),
  schRcpDtStrt: '',
  schRcpDtEnd: '',
  schRsvDtStrt: '',
  schRsvDtEnd: '',
  perfYm: '',
});
let cachedParams;

/*
 *  Event - 수수료 실적 생성 버튼 클릭 (CR/CO)
 */
async function openFeePerfCrtPopup() {
  const param = {
    perfYm: now.add(-1, 'month').format('YYYYMM'),
    ogTp: 'W01',
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
    ogTp: 'W01',
    dv: 'CO',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: param,
  });
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

/*
 *  Event - 조회조건 선택에 따른 검색조건 및 그리드 변경
 */

async function chSelectOption(bl1, bl2, bl3, bl4, bl5, bl6, dt1, dt2, dt3, dt4, dt5, dt6, dt7) {
  isSelect1Visile.value = bl1;
  isSelect2Visile.value = bl2;
  isSelect3Visile.value = bl3;
  isSelect4Visile.value = bl4;
  isGrid1Visile.value = bl5;
  isGrid2Visile.value = bl6;
  searchParams.value.schSlDtStrt = dt1;
  searchParams.value.schSlDtEnd = dt2;
  searchParams.value.schRcpDtStrt = dt3;
  searchParams.value.schRcpDtEnd = dt4;
  searchParams.value.schRsvDtStrt = dt5;
  searchParams.value.schRsvDtEnd = dt6;
  searchParams.value.perfYm = dt7;
}

/*
 *  Event - 조회조건 선택에 따른 조건변경
 */

async function onChangeDv() {
  const { schDv } = searchParams.value;
  const strtDt = now.add(-1, 'month').startOf('month').format('YYYYMMDD');
  const endSt = now.add(-1, 'month').endOf('month').format('YYYYMMDD');
  const baseYm = now.add(-1, 'month').format('YYYYMM');
  if (schDv === '01') {
    chSelectOption(true, false, false, false, true, false, strtDt, endSt, '', '', '', '', '');
  } else if (schDv === '02') {
    chSelectOption(false, true, false, false, true, false, '', '', strtDt, endSt, '', '', '');
  } else if (schDv === '03') {
    chSelectOption(false, false, true, false, true, false, '', '', '', '', strtDt, endSt, '');
  } else if (schDv === '04') {
    chSelectOption(false, false, false, true, false, true, '', '', '', '', '', '', baseYm);
  }
}

async function fetchData() {
  let uri = 's';
  if (isGrid2Visile.value === true) {
    uri = '-sell-fees';
  }
  const response = await dataService.get(`/sms/wells/fee/organization-netorders/plar${uri}`, { params: cachedParams });
  const plarFees = response.data;
  totalCount.value = plarFees.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(plarFees);
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
    { fieldName: 'og1Nm' },
    { fieldName: 'og2Nm' },
    { fieldName: 'og3Nm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'gubn' },
    { fieldName: 'prdtType' },
    { fieldName: 'lcflg1' },
    { fieldName: 'cntrNo' },
    { fieldName: 'lccgub' },
    { fieldName: 'pdNm' },
    { fieldName: 'pdCd' },
    { fieldName: 'lciuse' },
    { fieldName: 'lcetc3' },
    { fieldName: 'lcetc4' },
    { fieldName: 'lcst11' },
    { fieldName: 'lcst04' },
    { fieldName: 'fnlVal' },
    { fieldName: 'lcmont' },
    { fieldName: 'lcbamt' },
    { fieldName: 'lctamt' },
    { fieldName: 'lcgub1' },
    { fieldName: 'lcst13' },
    { fieldName: 'leaseYn' },
    { fieldName: 'lcpcnt' },
    { fieldName: 'rcntYn' },
    { fieldName: 'lccrtt' },
    { fieldName: 'lcslet' },
    { fieldName: 'lccant' },
    { fieldName: 'akdbon' },
    { fieldName: 'akdbnm' },
    { fieldName: 'lcamt1' },
    { fieldName: 'lcgub3' },
    { fieldName: 'lcvmon' },
    { fieldName: 'lcpamt' },
    { fieldName: 'lcck02' },
    { fieldName: 'lcgseq' },
    { fieldName: 'lcpaym' },

  ];

  const columns = [
    { fieldName: 'og1Nm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98', styleName: 'text-center' },
    { fieldName: 'og2Nm', header: t('MSG_TXT_RGNL_GRP'), width: '98', styleName: 'text-center' },
    { fieldName: 'og3Nm', header: t('MSG_TXT_BRANCH'), width: '98', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '111.9', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '72', styleName: 'text-center' },
    { fieldName: 'gubn', header: t('MSG_TXT_SEL_TYPE'), width: '110', styleName: 'text-center' },
    { fieldName: 'prdtType', header: t('MSG_TXT_PDCT_TP'), width: '110', styleName: 'text-center' },
    { fieldName: 'lcflg1', header: t('MSG_TXT_CHDVC_TP'), width: '110', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '188', styleName: 'text-center' },
    { fieldName: 'lccgub', header: t('MSG_TXT_CST_DV'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '226.5', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'lciuse', header: t('MSG_TXT_USWY'), width: '110.9', styleName: 'text-center' },
    { fieldName: 'lcetc3', header: t('MSG_TXT_PD_DC_CLASS'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'lcetc4', header: t('MSG_TXT_DISC_CODE'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'lcst11', header: t('MSG_TXT_DSC_SYST'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'lcst04', header: t('MSG_TXT_COMBI_DV'), width: '83.5', styleName: 'text-' },
    { fieldName: 'fnlVal', header: t('MSG_TXT_DP_PERF'), width: '141.8', styleName: 'text-right' },
    { fieldName: 'lcmont', header: t('MSG_TXT_ISTM'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'lcbamt', header: t('MSG_TXT_BASE_PRC'), width: '123.8', styleName: 'text-right' },
    { fieldName: 'lctamt', header: t('MSG_TXT_HOME_CARE'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'lcgub1', header: `${t('MSG_TXT_HOME_CARE')}3${t('MSG_TXT_YEAR')}`, width: '141.2', styleName: 'text-center' },
    { fieldName: 'lcst13', header: t('MSG_TXT_FXAM_YN'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'leaseYn', header: t('MSG_TXT_FNN_LEASE'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'lcpcnt', header: t('MSG_TXT_PD_ACC_CNT'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'rcntYn', header: t('MSG_TXT_RECOMMITMENT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'lccrtt', header: t('MSG_TXT_CNTR_DATE'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'lcslet', header: t('MSG_TXT_SL_DT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'lccant', header: t('MSG_TXT_CANC_DT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'akdbon', header: t('MSG_TXT_BRMGR'), width: '113', styleName: 'text-center' },
    { fieldName: 'akdbnm', header: t('MSG_TXT_BRMGR'), width: '100', styleName: 'text-center' },
    { fieldName: 'lcamt1', header: t('MSG_TXT_RTLFE'), width: '104.3', styleName: 'text-right' },
    { fieldName: 'lcgub3', header: t('MSG_TXT_CONTRACT_PERI'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'lcvmon', header: t('MSG_TXT_MNGT_PRD'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'lcpamt', header: `${t('MSG_TXT_PD_ACC_RSLT')}(P)`, width: '141.8', styleName: 'text-right' },
    { fieldName: 'lcck02', header: t('MSG_TXT_PMOT_NO'), width: '104.3', styleName: 'text-right' },
    { fieldName: 'lcgseq', header: t('MSG_TXT_PKG_SN'), width: '135.1', styleName: 'text-center' },
    { fieldName: 'lcpaym', header: t('MSG_TXT_NTOR') + t('MSG_TXT_MON'), width: '113.2', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'og1Nm' },
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
    { fieldName: 'bfsvcPrdCd' },
    { fieldName: 'mchnChTpCd' },

  ];

  const columns = [
    { fieldName: 'og1Nm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98' },
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
    { fieldName: 'bfsvcPrdCd', header: `BS${t('MSG_TXT_CYCL')}`, width: '83.5', styleName: 'text-' },
    { fieldName: 'mchnChTpCd', header: t('MSG_TXT_CHDVC_TP'), width: '83.5', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
});

</script>

<style scoped>
</style>
