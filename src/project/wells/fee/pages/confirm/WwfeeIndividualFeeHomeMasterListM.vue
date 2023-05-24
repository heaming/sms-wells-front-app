<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEE
2. 프로그램 ID : WwfeeIndividualFeeHomeMasterListM - 수수료 개인별 상세조회 (홈마스터)
3. 작성자 : gs.piit150
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 개인별 상세조회 (홈마스터) 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
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
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          required
        >
          <kw-input
            v-model="searchParams.no"
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            icon="search"
            clearable
            :on-click-icon="onClickSearchNo"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_BASIC_INFO') }}</h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="$t('MSG_BTN_DSB_SPCSH_PRNT')"
          @click="openReportPopup"
        />
      </kw-action-top>
      <kw-form
        :cols="3"
        dense
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_PERF_YM')"
            align-content="center"
          >
            <p>{{ info.perfYm }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_SEQUENCE_NUMBER')"
            align-content="center"
          >
            <p>{{ info.prtnrNo }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_FEE_SUM')"
            align-content="right"
          >
            <p>{{ stringUtil.getNumberWithComma(info.frrSum) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_BLG')"
            align-content="center"
          >
            <p>{{ info.blg }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSB')"
            align-content="left"
          >
            <p>{{ info.rsb }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DDTN_SUM')"
            align-content="right"
          >
            <p>{{ stringUtil.getNumberWithComma(info.ddtnSum) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_EMPL_NM')"
            align-content="left"
          >
            <p>{{ info.emplNm }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DSB_BNK')"
            align-content="left"
          >
            <p>{{ info.dsbBnk }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DSB_AC')"
            align-content="right"
          >
            <p>{{ stringUtil.getNumberWithComma(info.dsbAc) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_ACL_DSB')"
            align-content="right"
          >
            <p>{{ stringUtil.getNumberWithComma(info.aclDsb) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />

      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_SELL_ETC_IZ') }}</h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_PERF_DTL')"
          @click="openPerformancePopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grd1MainRef"
        name="grd1Main"
        :visible-rows="2"
        @init="initGrd1Main"
      />
      <kw-action-top class="mt30">
        <template #left>
          <h3>{{ t('MSG_TXT_FEE_IZ') }}</h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_ADSB')"
          @click="openAgainDisbursementPopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grd2MainRef"
        name="grd2Main"
        :visible-rows="5"
        @init="initGrd2Main"
      />
      <kw-action-top class="mt30">
        <template #left>
          <h3>{{ t('MSG_TXT_DDTN_IZ') }}</h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_BU_DDTN')"
          @click="openBurdenDeductionPopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grd3MainRef"
        name="grd3Main"
        :visible-rows="4"
        @init="initGrd3Main"
      />
      <kw-separator />
      <kw-action-top class="mt30">
        <template #left>
          <h3>{{ t('MSG_TXT_PNPYAM_DTLP_IZ') }}</h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_REDF')"
          @click="openRedemptionOfFeePopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grd4MainRef"
        name="grd4Main"
        :visible-rows="4"
        @init="initGrd4Main"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, stringUtil, modal, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';

import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();

const props = defineProps({
  perfYm: {
    type: String,
    required: true,
  },
  partnerNo: {
    type: String,
    required: true,
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grd1MainRef = ref(getComponentType('KwGrid'));
const grd2MainRef = ref(getComponentType('KwGrid'));
const grd3MainRef = ref(getComponentType('KwGrid'));
const grd4MainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.format('YYYYMM'),
  no: '',
  prPerfYm: props.perfYm,
  prpartnerNo: props.partnerNo,

});

const info = ref({
  perfYm: '',
  blg: '',
  prtnrNo: '',
  rsb: '',
  emplNm: '',
  frrSum: '',
  ddtnSum: '',
  aclDsb: '',
  dsbBnk: '',
  dsbAc: '',
});

const { prPerfYm } = searchParams.value;
const { prpartnerNo } = searchParams.value;

let cachedParams;

/*
 *  Event - 번호 검색 아이콘 클릭 이벤트
 */
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.no,
      ogTpCd: 'W03',
    },
  });

  if (result) {
    searchParams.value.no = payload.prtnrNo;
  }
}

/*
 *  Event - 지급명세서 출력 버튼 클릭  ※현재 팝업화면 없음
 */
async function openReportPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openReportPopup',
    componentProps: param,
  });
}
/*
 *  Event - 실적상세 버튼 클릭  ※현재 팝업화면 없음
 */
async function openPerformancePopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openPerformancePopup',
    componentProps: param,
  });
}
/*
 *  Event - 재지급 버튼 클릭  ※현재 팝업화면 없음
 */
async function openAgainDisbursementPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openAgainDisbursementPopup',
    componentProps: param,
  });
}
/*
 *  Event - 부담공제 버튼 클릭  ※현재 팝업화면 없음
 */
async function openBurdenDeductionPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openBurdenDeductionPopup',
    componentProps: param,
  });
}
/*
 *  Event - 되물림 버튼 클릭  ※현재 팝업화면 없음
 */
async function openRedemptionOfFeePopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openRedemptionOfFeePopup',
    componentProps: param,
  });
}

async function fetchData(type) {
  const response = await dataService.get(`/sms/wells/fee/individual-fees/hmst-${type}`, { params: cachedParams });
  const resData = response.data;
  totalCount.value = resData.length;
  if (type === 'informations') {
    info.value = resData;
  } else if (type === 'etcs') {
    const etcView = grd1MainRef.value.getView();
    etcView.getDataSource().setRows(resData);
  } else if (type === 'fees') {
    const feeView = grd2MainRef.value.getView();
    feeView.getDataSource().setRows(resData);
  } else if (type === 'deductions') {
    const deductionView = grd3MainRef.value.getView();
    deductionView.getDataSource().setRows(resData);
  } else if (type === 'pnpyam') {
    const pnpyamView = grd4MainRef.value.getView();
    pnpyamView.getDataSource().setRows(resData);
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('informations');
  await fetchData('etcs');
  await fetchData('fees');
  await fetchData('deductions');
  await fetchData('pnpyam');
}

if (!isEmpty(prPerfYm) && !isEmpty(prpartnerNo)) {
  searchParams.value.perfYm = prPerfYm;
  searchParams.value.no = prpartnerNo;
  onClickSearch();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'div' },
    { fieldName: 'elhmAckmtCt' },
    { fieldName: 'svCnt' },
    { fieldName: 'svRat' },

  ];

  const columns = [
    { fieldName: 'div', header: t('MSG_TXT_DIV'), width: '167', styleName: 'text-center' },
    { fieldName: 'elhmAckmtCt', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '456', styleName: 'text-right' },
    { fieldName: 'svCnt', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_COUNT'), width: '456', styleName: 'text-right' },
    { fieldName: 'svRat', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_PROCS_RT'), width: '458', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'item1' },
    { fieldName: 'amt1', dataType: 'number' },
    { fieldName: 'item2' },
    { fieldName: 'amt2', dataType: 'number' },
    { fieldName: 'item3' },
    { fieldName: 'amt3', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'item1', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'amt1', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item2', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'amt2', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item3', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'amt3', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.setFooters({ visible: true, items: [{ height: 30 }] });

  // multi row header setting
  view.setColumnLayout([

    {
      header: t('MSG_TXT_PD_SALE_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['item1', 'amt1'],
    },
    {
      header: t('MSG_TXT_SERVICE') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['item2', 'amt2'],
    },
    {
      header: t('MSG_TXT_OG') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['item3', 'amt3'],
    },

  ]);
});

const initGrd3Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'item1' },
    { fieldName: 'amt1', dataType: 'number' },
    { fieldName: 'item2' },
    { fieldName: 'amt2', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'item1', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left' },
    { fieldName: 'amt1', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right' },
    { fieldName: 'item2', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left' },
    { fieldName: 'amt2', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

const initGrd4Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'item' },
    { fieldName: 'lstmm', dataType: 'number' },
    { fieldName: 'thmOc', dataType: 'number' },
    { fieldName: 'tmh', dataType: 'number' },
    { fieldName: 'thmDdtn', dataType: 'number' },
    { fieldName: 'thmBlam', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'item', header: t('MSG_TXT_ITEM'), width: '167', styleName: 'text-left', footer: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'lstmm', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_BLAM'), width: '274', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'thmOc', header: t('MSG_TXT_THM_OC'), width: '274', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'tmh', header: t('MSG_TXT_THM') + t('MSG_TXT_SUM'), width: '275', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'thmDdtn', header: t('MSG_TXT_THM_DDTN'), width: '274', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'thmBlam', header: t('MSG_TXT_THM_BLAM'), width: '274', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true, items: [{ height: 30 }] });

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});
</script>
