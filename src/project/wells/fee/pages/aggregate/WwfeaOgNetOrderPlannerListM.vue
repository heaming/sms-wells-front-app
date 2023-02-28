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
            :options="['매출', '접수', '예약', '수수료 실적 집계 대상']"
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
            :options="['전체', 'B', 'C', 'D']"
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
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
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
        v-if="isSelectVisile1"
        ref="grdMainRef"
        name="grd1Main"
        :visible-rows="10"
        @init="initGrd1Main"
      />
      <kw-grid
        v-if="isSelectVisile2"
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

import { useDataService, getComponentType, useGlobal, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { modal } = useGlobal();
const dataService = useDataService();
const isSelectVisile1 = ref(true);
const isSelectVisile2 = ref(false);
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  schDv: '매출',
  schPdctTp: '전체',
  schPdCdStrt: '',
  schPdCdEnd: '',
  schSlDtStrt: now.add(-1, 'month').startOf('month').format('YYYYMMDD'),
  schSlDtEnd: now.add(-1, 'month').endOf('month').format('YYYYMMDD'),
});
let cachedParams;

/*
 *  Event - 수수료 실적 생성 버튼 클릭 (CR/CO)
 */
async function openFeePerfCrtPopup() {
  const param = {
    perfYm: now.add(-1, 'month').format('YYYYMMDD'),
    ogTp: 'P',
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
    ogTp: 'P',
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
    fileName: t('MSG_TXT_PLAR') + t('MSG_TXT_FEE_IZ'),
    timePostfix: true,
  });
}

/*
 *  Event - 조회조건 선택에 따른 검색조건 및 그리드 변경
 */

async function onChangeDv() {
  const { schDv } = searchParams.value;

  if (schDv === '매출' || schDv === '접수' || schDv === '예약') {
    isSelectVisile1.value = true;
    isSelectVisile2.value = false;
  } else if (schDv === '수수료 실적 집계 대상') {
    isSelectVisile1.value = false;
    isSelectVisile2.value = true;
  }
}

async function fetchData() {
  let uri = 's';
  if (isSelectVisile2.value === true) {
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
function initGrd1Main(data, view) {
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

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98' },
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '98' },
    { fieldName: 'col3', header: t('MSG_TXT_BRANCH'), width: '98' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '111.9', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_EMPL_NM'), width: '72', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_SEL_TYPE'), width: '110' },
    { fieldName: 'col7', header: t('MSG_TXT_PDCT_TP'), width: '110' },
    { fieldName: 'col8', header: t('MSG_TXT_CHDVC_TP'), width: '110' },
    { fieldName: 'col9', header: t('MSG_TXT_CNTR_DTL_NO'), width: '188', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_CST_DV'), width: '83.5' },
    { fieldName: 'col11', header: t('MSG_TXT_PRDT_NM'), width: '226.5', styleName: 'text-' },
    { fieldName: 'col12', header: t('MSG_TXT_PRDT_CODE'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_USWY'), width: '110.9', styleName: 'text-' },
    { fieldName: 'col14', header: t('MSG_TXT_PD_DC_CLASS'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col15', header: t('MSG_TXT_DISC_CODE'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col16', header: t('MSG_TXT_DSC_SYST'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col17', header: t('MSG_TXT_COMBI_DV'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col18', header: t('MSG_TXT_DP_PERF'), width: '141.8', styleName: 'text-right' },
    { fieldName: 'col19', header: t('MSG_TXT_ISTM'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col20', header: t('MSG_TXT_BASE_PRC'), width: '123.8', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_HOME_CARE'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col22', header: `${t('MSG_TXT_HOME_CARE')}3${t('MSG_TXT_YEAR')}`, width: '141.2', styleName: 'text-' },
    { fieldName: 'col23', header: t('MSG_TXT_FXAM_YN'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col24', header: t('MSG_TXT_FNN_LEASE'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col25', header: t('MSG_TXT_PD_ACC_CNT'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col26', header: t('MSG_TXT_RECOMMITMENT'), width: '113.2', styleName: 'text-' },
    { fieldName: 'col27', header: t('MSG_TXT_CNTR_DATE'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col28', header: t('MSG_TXT_SL_DT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col29', header: t('MSG_TXT_CANC_DT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col30', header: t('MSG_TXT_BRMGR'), width: '113', styleName: 'text-center' },
    { fieldName: 'col31', header: t('MSG_TXT_BRMGR'), width: '100', styleName: 'text-' },
    { fieldName: 'col32', header: t('MSG_TXT_RTLFE'), width: '104.3', styleName: 'text-right' },
    { fieldName: 'col33', header: t('MSG_TXT_CONTRACT_PERI'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col34', header: t('MSG_TXT_MNGT_PRD'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col35', header: `${t('MSG_TXT_PD_ACC_RSLT')}(P)`, width: '141.8', styleName: 'text-right' },
    { fieldName: 'col36', header: t('MSG_TXT_PMOT_NO'), width: '104.3', styleName: 'text-right' },
    { fieldName: 'col37', header: t('MSG_TXT_PKG_SN'), width: '135.1', styleName: 'text-' },
    { fieldName: 'col38', header: t('MSG_TXT_NTOR') + t('MSG_TXT_MON'), width: '113.2', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
}
function initGrd2Main(data, view) {
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

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98' },
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '98' },
    { fieldName: 'col3', header: t('MSG_TXT_BRANCH'), width: '98' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '111.9', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_EMPL_NM'), width: '72', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_CNTR_DTL_NO'), width: '110' },
    { fieldName: 'col7', header: t('MSG_TXT_RCPDT'), width: '110' },
    { fieldName: 'col8', header: t('MSG_TXT_SL_DT'), width: '110' },
    { fieldName: 'col9', header: t('MSG_TXT_CANC_DT'), width: '188', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_PDCT_TP'), width: '83.5' },
    { fieldName: 'col11', header: t('MSG_TXT_PRDT_CODE'), width: '226.5', styleName: 'text-' },
    { fieldName: 'col12', header: t('MSG_TXT_PD_GRP'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_PRDT_NM'), width: '110.9', styleName: 'text-' },
    { fieldName: 'col14', header: t('MSG_TXT_PD_ACC_CNT'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col15', header: `BS${t('MSG_TXT_CYCL')}`, width: '83.5', styleName: 'text-' },
    { fieldName: 'col16', header: t('MSG_TXT_CHDVC_TP'), width: '83.5', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
}

</script>

<style scoped>
</style>
