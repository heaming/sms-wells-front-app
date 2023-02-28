<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FED
2. 프로그램 ID : WwfedLedrAllowanceListM - 단장 수당 관리
3. 작성자 : seoin.jeon
4. 작성일 : 2023.01.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 단장 수당 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_DIV')"
        >
          <kw-option-group
            v-model="searchParams.dv"
            type="radio"
            :options="[$t('MSG_TXT_ALL'), $t('MSG_TXT_GNLR_LEDR'), $t('MSG_TXT_REG_DIR')]"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
          <kw-option-group
            v-model="searchParams.inqrDv"
            type="radio"
            :options="[$t('MSG_TXT_INDV'), $t('MSG_TXT_SUM')]"
            @change="onChangeInqrDv"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item

          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.no"
            icon="search"
            clearable
            :on-click-icon="onClickSearchNo"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
        </template>

        <kw-btn
          icon="upload_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_UP')"
        />

        <kw-btn
          icon="download_on"
          secondary
          dense
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount===0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        v-if="isGrdIndvVisible"
        ref="grdIndvRef"
        name="grdIndv"
        :visible-rows="10"
        @init="initGridIndv"
      />
      <kw-grid
        v-if="isGrdSumVisible"
        ref="grdSumRef"
        name="grdSum"
        :visible-rows="10"
        @init="initGridSum"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useGlobal, useDataService } from 'kw-lib';
import dayjs from 'dayjs';

const dataService = useDataService();
const { modal } = useGlobal();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const grdIndvRef = ref(getComponentType('KwGrid'));
const grdSumRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const isGrdIndvVisible = ref(true);
const isGrdSumVisible = ref(false);

// TODO: 실적년월은 전월로 세팅해야함. 수정 필요.
const searchParams = ref({
  perfYm: dayjs().format('YYYY-MM'),
  dv: t('MSG_TXT_ALL'),
  inqrDv: t('MSG_TXT_INDV'),
  no: '',
});

async function onChangeInqrDv() {
  totalCount.value = 0;

  if (searchParams.value.inqrDv === t('MSG_TXT_INDV')) {
    isGrdIndvVisible.value = true;
    isGrdSumVisible.value = false;
  } else if (searchParams.value.inqrDv === t('MSG_TXT_SUM')) {
    isGrdIndvVisible.value = false;
    isGrdSumVisible.value = true;
  }
}

async function onClickExcelDownload() {
  const view = grdIndvRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: '관리자 수당 내역',
    timePostfix: true,
  });
}

async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.no,
    },
  });

  if (result) {
    searchParams.value.no = payload.prtnrNo;
  }
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/ledr-allowances', searchParams.value);
  const leaderAllowances = res.data;

  totalCount.value = leaderAllowances.length;

  const view = grdIndvRef.value.getView();
  view.getDataSource().setRows(leaderAllowances);
  view.resetCurrent();
}

async function onClickSearch() {
  await fetchData();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridIndv = defineGrid((data, view) => {
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
    { fieldName: 'col1', header: t('MSG_TXT_PERF_YM'), width: '106', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_RSB_TP'), width: '96', styleName: 'text-left' },
    { fieldName: 'col3', header: t('MSG_TXT_BLG_NM'), width: '96', styleName: 'text-left' },
    { fieldName: 'col4', header: t('MSG_TXT_EMPL_NM'), width: '96', styleName: 'text-left' },
    { fieldName: 'col5', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '106', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_BRCH_N'), width: '106', styleName: 'text-right' },
    { fieldName: 'col7', header: t('MSG_TXT_BAS_SAL'), width: '120', styleName: 'text-right' },
    { fieldName: 'col8', header: t('MSG_TXT_HH_EXCP_AW'), width: '120', styleName: 'text-right' },
    { fieldName: 'col9', header: t('MSG_TXT_RSB') + t('MSG_TXT_AW'), width: '120', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_FXN_SAL_SUM'), width: '120', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_TRG'), width: '133', styleName: 'text-right' },
    { fieldName: 'col12', header: t('MSG_TXT_PERF'), width: '133', styleName: 'text-right' },
    { fieldName: 'col13', header: t('MSG_TXT_ACHV_RT'), width: '133', styleName: 'text-right' },

    { fieldName: 'col14', header: t('MSG_TXT_TRG') + t('MSG_TXT_ACHV') + t('MSG_TXT_AW'), width: '133', styleName: 'text-right' },
    { fieldName: 'col15', header: t('MSG_TXT_EVL') + t('MSG_TXT_AW'), width: '133', styleName: 'text-right' },
    { fieldName: 'col16', header: t('MSG_TXT_ENRG') + t('MSG_TXT_AW'), width: '133', styleName: 'text-right' },
    { fieldName: 'col17', header: t('MSG_TXT_OG') + t('MSG_TXT_AW'), width: '133', styleName: 'text-right' },
    { fieldName: 'col18', header: t('MSG_TXT_OUTC_AW_SUM'), width: '133', styleName: 'text-right' },
    { fieldName: 'col19', header: t('MSG_TXT_EXCL_DIV'), width: '133', styleName: 'text-right' },
    { fieldName: 'col20', header: t('MSG_TXT_ICT'), width: '133', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_LDSTC_ATDC_LVOF'), width: '133', sty기타leName: 'text-right' },
    { fieldName: 'col22', header: t('MSG_TXT_MRNT_SPPT'), width: '133', styleName: 'text-right' },
    { fieldName: 'col23', header: t('MSG_TXT_LECT_CHRAM'), width: '133', styleName: 'text-right' },
    { fieldName: 'col24', header: t('MSG_TXT_ETC'), width: '133', styleName: 'text-right' },

    { fieldName: 'col25', header: t('MSG_TXT_ETC') + t('MSG_TXT_AW_SUM'), width: '133', styleName: 'text-right' },
    { fieldName: 'col26', header: `${t('MSG_TXT_FXN_SAL')}+${t('MSG_TXT_OUTC_AW')}`, width: '146', styleName: 'text-right' },
    { fieldName: 'col27', header: t('MSG_TXT_DSB_SUM'), width: '146', styleName: 'text-right' },
    { fieldName: 'col28', header: t('MSG_TXT_HL_INSR'), width: '133', styleName: 'text-right' },
    { fieldName: 'col29', header: t('MSG_TXT_LTM_NRSN_INSR'), width: '133', styleName: 'text-right' },
    { fieldName: 'col30', header: t('MSG_TXT_NTNL_INSR'), width: '133', styleName: 'text-right' },
    { fieldName: 'col31', header: t('MSG_TXT_HIR_INSR'), width: '133', styleName: 'text-right' },
    { fieldName: 'col32', header: t('MSG_TXT_ERNTX'), width: '133', styleName: 'text-right' },
    { fieldName: 'col33', header: t('MSG_TXT_RSDNTX'), width: '133', styleName: 'text-right' },
    { fieldName: 'col34', header: t('MSG_TXT_IRG_BZNS'), width: '133', styleName: 'text-right' },
    { fieldName: 'col35', header: t('MSG_TXT_ETC'), width: '133', styleName: 'text-right' },

    { fieldName: 'col36', header: t('MSG_TXT_DDTN_SUM'), width: '146', styleName: 'text-right' },
    { fieldName: 'col37', header: t('MSG_TXT_TOT_DSB_AMT'), width: '146', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'col1',
    'col2',
    'col3',
    'col4',
    'col5',
    'col6', // single
    {
      header: t('MSG_TXT_FXN_SAL'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col7', 'col8', 'col9', 'col10'],
    },
    {
      header: t('MSG_TXT_OUTC_AW'),
      direction: 'horizontal',
      items: ['col11', 'col12', 'col13', 'col14', 'col15', 'col16', 'col17', 'col18'],
    },
    {
      header: t('MSG_TXT_ETC') + t('MSG_TXT_AW'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col19', 'col20', 'col21', 'col22', 'col23', 'col24', 'col25'],
    },
    'col26',
    'col27',
    {
      header: t('MSG_TXT_DDTN'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col28', 'col29', 'col30', 'col31', 'col32', 'col33', 'col34', 'col35'],
    },
    'col36',
    'col37',
  ]);
});

const initGridSum = defineGrid((data, view) => {
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_PERF_YM'), width: '106', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_RSB_TP'), width: '106', styleName: 'text-left' },
    { fieldName: 'col3', header: t('MSG_TXT_PPL_N'), width: '106', styleName: 'text-left' },
    { fieldName: 'col4', header: t('MSG_TXT_BAS_SAL'), width: '120', styleName: 'text-right' },
    { fieldName: 'col5', header: t('MSG_TXT_HH_EXCP_AW'), width: '120', styleName: 'text-right' },
    { fieldName: 'col6', header: t('MSG_TXT_RSB') + t('MSG_TXT_AW'), width: '120', styleName: 'text-right' },
    { fieldName: 'col7', header: t('MSG_TXT_FXN_SAL_SUM'), width: '120', styleName: 'text-right' },
    { fieldName: 'col8', header: t('MSG_TXT_TRG'), width: '133', styleName: 'text-right' },
    { fieldName: 'col9', header: t('MSG_TXT_PERF'), width: '133', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_ACHV_RT'), width: '133', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_TRG') + t('MSG_TXT_ACHV') + t('MSG_TXT_AW'), width: '133', styleName: 'text-right' },
    { fieldName: 'col12', header: t('MSG_TXT_EVL') + t('MSG_TXT_AW'), width: '133', styleName: 'text-right' },
    { fieldName: 'col13', header: t('MSG_TXT_OUTC_AW_SUM'), width: '133', styleName: 'text-right' },

    { fieldName: 'col14', header: t('MSG_TXT_EXCL_DIV'), width: '133', styleName: 'text-right' },
    { fieldName: 'col15', header: t('MSG_TXT_ICT'), width: '133', styleName: 'text-right' },
    { fieldName: 'col16', header: t('MSG_TXT_LDSTC_ATDC_LVOF'), width: '133', sty기타leName: 'text-right' },
    { fieldName: 'col17', header: t('MSG_TXT_MRNT_SPPT'), width: '133', styleName: 'text-right' },
    { fieldName: 'col18', header: t('MSG_TXT_LECT_CHRAM'), width: '133', styleName: 'text-right' },
    { fieldName: 'col19', header: t('MSG_TXT_ETC'), width: '133', styleName: 'text-right' },

    { fieldName: 'col20', header: t('MSG_TXT_ETC_SUM'), width: '133', styleName: 'text-right' },
    { fieldName: 'col21', header: `${t('MSG_TXT_FXN_SAL')}+${t('MSG_TXT_OUTC_AW')}`, width: '146', styleName: 'text-right' },
    { fieldName: 'col22', header: t('MSG_TXT_DSB_SUM'), width: '146', styleName: 'text-right' },
    { fieldName: 'col23', header: t('MSG_TXT_HL_INSR'), width: '133', styleName: 'text-right' },
    { fieldName: 'col24', header: t('MSG_TXT_LTM_NRSN_INSR'), width: '133', styleName: 'text-right' },
    { fieldName: 'col25', header: t('MSG_TXT_NTNL_INSR'), width: '133', styleName: 'text-right' },
    { fieldName: 'col26', header: t('MSG_TXT_HIR_INSR'), width: '133', styleName: 'text-right' },
    { fieldName: 'col27', header: t('MSG_TXT_ERNTX'), width: '133', styleName: 'text-right' },
    { fieldName: 'col28', header: t('MSG_TXT_RSDNTX'), width: '133', styleName: 'text-right' },
    { fieldName: 'col29', header: t('MSG_TXT_IRG_BZNS'), width: '133', styleName: 'text-right' },
    { fieldName: 'col30', header: t('MSG_TXT_ETC'), width: '133', styleName: 'text-right' },

    { fieldName: 'col31', header: t('MSG_TXT_DDTN_SUM'), width: '146', styleName: 'text-right' },
    { fieldName: 'col32', header: t('MSG_TXT_TOT_DSB_AMT'), width: '146', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'col1',
    'col2',
    'col3',
    {
      header: t('MSG_TXT_FXN_SAL'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col4', 'col5', 'col6'],
    },
    'col7',
    {
      header: t('MSG_TXT_OUTC_AW'),
      direction: 'horizontal',
      items: ['col8', 'col9', 'col10', 'col11', 'col12'],
    },
    'col13',
    {
      header: t('MSG_TXT_ETC'),
      direction: 'horizontal', // merge type
      items: ['col14', 'col15', 'col16', 'col17', 'col18', 'col19'],
    },
    'col20',
    'col21',
    'col22',

    {
      header: t('MSG_TXT_DDTN'),
      direction: 'horizontal', // merge type
      items: ['col23', 'col24', 'col25', 'col26', 'col27', 'col28', 'col29', 'col30'],
    },
    'col31',
    'col32',
  ]);
});
</script>
