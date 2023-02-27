<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaFeeBaseAmountListM - 수수료 기준금액 체크리스트
3. 작성자 : gs.piit150
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 기준금액 체크리스트 목록 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          required
          :label="$t('MSG_TXT_OG_TP')"
          :colspan="2"
        >
          <kw-option-group
            v-model="searchParams.ogtp"
            rules="required"
            type="radio"
            :label="$t('MSG_TXT_OG_TP')"
            :options="['M추진단', 'P추진단', '홈마스터']"
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

import { useDataService, getComponentType, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.format('YYYYMM'),
  ogtp: '',

});
let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: '수수료_체크리스트내역',
    timePostfix: true,
  });
}

async function fetchData() {
  const response = await dataService.get('/sms/wells/fee/fee-base-amounts', { params: cachedParams });
  const feeAmounts = response.data;
  totalCount.value = feeAmounts.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(feeAmounts);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
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

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CNTR_NO'), width: '130', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_RCPDT'), width: '104', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col3', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_INDV_DV'), width: '89', styleName: 'text-center ' },
    { fieldName: 'col5', header: t('MSG_TXT_SELL_OG'), width: '104', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_SELLER_NO'), width: '104', styleName: 'text-right' },
    { fieldName: 'col7', header: t('MSG_TXT_SALE_PROD'), width: '91', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_SELL_PD_NM'), width: '159', styleName: 'text-left' },
    { fieldName: 'col9', header: t('MSG_TXT_ACKMT_PFR'), width: '104', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_ACKMT_PERF_AMT'), width: '131', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_BASE_FEE_ORD_MST'), width: '160', styleName: 'text-right' },
    { fieldName: 'col12', header: t('MSG_TXT_BASE_FEE_PRC_BASE'), width: '160', styleName: 'text-right' },
    { fieldName: 'col13', header: t('MSG_TXT_BASE_FEE_PMOT'), width: '160', styleName: 'text-right' },
    { fieldName: 'col14', header: t('MSG_TXT_RTLFE_DSC_RFLT'), width: '160', styleName: 'text-right' },
    { fieldName: 'col15', header: t('MSG_TXT_DISC_CODE'), width: '83', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_PRD_USWY'), width: '83', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_RE_RENTAL') + 1 + 1, width: '98', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_CHDVC_YN'), width: '88', styleName: 'text-center' },
    { fieldName: 'col19', header: t('MSG_TXT_INDV_DV'), width: '119', styleName: 'text-center' },
    { fieldName: 'col20', header: t('MSG_TXT_TYPE'), width: '83', styleName: 'text-center' },
    { fieldName: 'col21', header: t('MSG_TXT_PFR'), width: '103', styleName: 'text-right' },
    { fieldName: 'col22', header: t('MSG_TXT_PFR') + 1 + t('MSG_TXT_Y'), width: '130', styleName: 'text-center' },
    { fieldName: 'col23', header: t('MSG_TXT_PFR') + 2 + t('MSG_TXT_Y'), width: '130', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8', 'col9', 'col10', 'col11', 'col12', 'col13', 'col14', 'col15', 'col16', 'col17', 'col18',
    {
      header: t('MSG_TXT_CHNG'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col19', 'col20', 'col21'],
    },
    'col22', 'col23',
  ]);
}
</script>
