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
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_DIV')"
          required
        >
          <kw-select
            v-model="searchParams.dv"
            :label="$t('MSG_TXT_DIV')"
            :options="['매출', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PDCT_TP')"
          required
        >
          <kw-select
            v-model="searchParams.pdctTp"
            :label="$t('MSG_TXT_PDCT_TP')"
            :options="['전체', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')"
        >
          <kw-input
            v-model="searchParams.pdCdStrt"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.pdCdEnd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_DT_OF_SALE')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.slDtStrt"
            v-model:to="searchParams.slDtEnd"
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
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_NTOR_AGRG')"
          secondary
          dense
          @click="openNtorAgrgPopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrdMain"
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

// const { t } = useI18n();
const { modal } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  dv: '',
  pdctTp: '',
  pdCdStrt: '',
  pdCdEnd: '',
  slDtStrt: now.startOf('month').format('YYYYMMDD'),
  slDtEnd: now.endOf('month').format('YYYYMMDD'),

});
let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: '순주문내역',
    timePostfix: true,
  });
}

async function fetchData() {
  const response = await dataService.get('/sms/wells/fee//monthly-net-order', { params: cachedParams });
  const categories = response.data;
  totalCount.value = categories.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(categories);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

/*
 *  Event - 순주문 집계 버튼 클릭
 */
async function openNtorAgrgPopup() {
  const param = {
    perfYm: now.add(-1, 'month').format('YYYY-MM'),
  };

  const { result: isChanged } = await modal({
    component: 'WwfeaNetOrderRegP',
    componentProps: param,
  });

  if (isChanged) {
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrdMain(data, view) {
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98', styleName: 'text-left' },
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '98', styleName: 'text-left' },
    { fieldName: 'col3', header: t('MSG_TXT_BRANCH'), width: '98', styleName: 'text-left' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '112', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_EMPL_NM'), width: '72', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_SEL_TYPE'), width: '110', styleName: 'text-left' },
    { fieldName: 'col7', header: t('MSG_TXT_PDCT_TP'), width: '110', styleName: 'text-left' },
    { fieldName: 'col8', header: t('MSG_TXT_CHDVC_TP'), width: '110', styleName: 'text-left' },
    { fieldName: 'col9', header: t('MSG_TXT_CNTR_DTL_NO'), width: '188', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_CST_DV'), width: '83.5', styleName: 'text-left' },
    { fieldName: 'col11', header: t('MSG_TXT_PRDT_NM'), width: '226.5', styleName: 'text-left' },
    { fieldName: 'col12', header: t('MSG_TXT_PRDT_CODE'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_USWY'), width: '108.8', styleName: 'text-left' },
    { fieldName: 'col14', header: t('MSG_TXT_PD_DC_CLASS'), width: '83.5' },
    { fieldName: 'col15', header: t('MSG_TXT_DISC_CODE'), width: '83.5' },
    { fieldName: 'col16', header: t('MSG_TXT_DSC_SYST'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col17', header: t('MSG_TXT_COMBI_DV'), width: '83.5', styleName: 'text-left' },
    { fieldName: 'col18', header: t('MSG_TXT_ISTM'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col19', header: t('MSG_TXT_BASE_PRC'), width: '141.8', styleName: 'text-right' },
    { fieldName: 'col20', header: t('MSG_TXT_HOME_CARE'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_HCR_MSH_Y3'), width: '141.2', styleName: 'text-left' },
    { fieldName: 'col22', header: t('MSG_TXT_FXAM_YN'), width: '83.5', styleName: 'text-left' },
    { fieldName: 'col23', header: t('MSG_TXT_FNN_LEASE'), width: '83.5', styleName: 'text-left' },
    { fieldName: 'col24', header: t('MSG_TXT_PD_ACC_CNT'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col25', header: t('MSG_TXT_RECOMMITMENT'), width: '113.2', styleName: 'text-left' },
    { fieldName: 'col26', header: t('MSG_TXT_CNTR_DATE'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col27', header: t('MSG_TXT_SL_DT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col28', header: t('MSG_TXT_CANC_DT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col29', header: t('MSG_TXT_BRMGR_NO'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col30', header: t('MSG_TXT_BRMGR') + t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'col31', header: t('MSG_TXT_RTLFE'), width: '104.3', styleName: 'text-right' },
    { fieldName: 'col32', header: t('MSG_TXT_CONTRACT_PERI'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col33', header: t('MSG_TXT_MNGT_PRD'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col34', header: t('MSG_TXT_PD_ACC_RSLT'), width: '141.8', styleName: 'text-right' },
    { fieldName: 'col35', header: t('MSG_TXT_PMOT_NO'), width: '104.3', styleName: 'text-right' },
    { fieldName: 'col36', header: t('MSG_TXT_PKG_SN'), width: '135.1', styleName: 'text-left' },
    { fieldName: 'col37', header: t('MSG_TXT_NTOR') + t('MSG_TXT_MON'), width: '113.2', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}
</script>
