<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEE
2. 프로그램 ID : WwfeeIndividualFeePlannerMgtM - 수수료 개인별 상세조회 (P조직 수수료 생성관리)
3. 작성자 : gs.piit150
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 개인별 상세조회 (P조직 수수료 생성관리) 조회 화면
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
            type="month"
            rules="required"
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
            rules="required"
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
    </kw-search>
    <div class="result-area">
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_BASIC_INFO') }}</h3>
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="$t('MSG_BTN_DSB_SPCSH_PRNT')"
          @click="openReportPopup"
        />
      </kw-action-top>
      <kw-form
        :cols="5"
        dense
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_PERF_YM')"
            align-content="center"
          >
            <p>{{ stringUtil.getDateFormat(info.perfYm,'YYYY-MM').substring(0,7) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BLG')"
            align-content="center"
          >
            <p>{{ info.blg }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_SEQUENCE_NUMBER')"
            align-content="right"
          >
            <p>{{ info.prtnrNo }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSB')"
            align-content="center"
          >
            <p>{{ info.rsb }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_EMPL_NM')"
            align-content="left"
          >
            <p>{{ info.emplNm }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_FEE_SUM')"
            align-content="right"
          >
            <p>{{ stringUtil.getNumberWithComma(info.frrSum) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DDTN_SUM')"
            align-content="right"
          >
            <p>
              {{ stringUtil.getNumberWithComma(info.ddtnSum) }}
            </p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ACL_DSB')"
            align-content="right"
          >
            <p>{{ stringUtil.getNumberWithComma(info.aclDsb) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DSB_BNK')"
            align-content="center"
          >
            <p>{{ info.dsbBnk }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DSB_AC')"
            align-content="center"
          >
            <p>{{ info.dsbAc }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_SELL_ETC_IZ') }}</h3>
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-separator
          vertical
          inset
          spaced
        />
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
      <kw-separator />
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
        :visible-rows="7"
        @init="initGrd2Main"
      />
      <kw-separator />
      <kw-action-top class="mt30">
        <template #left>
          <h3>{{ t('MSG_TXT_DDTN_IZ') }}</h3>
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_BU_DDTN')"
          @click="openZwfedFeeBurdenDeductionRegP"
        />
      </kw-action-top>
      <kw-form
        :cols="4"
        dense
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_RDS')"
            align-content="center"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.rds) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ERNTX')"
            align-content="center"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.erntx) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSDNTX')"
            align-content="center"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.rsdntx) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_PNPYAM')"
            align-content="center"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.pnpyam) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_HIR_INSR')"
            align-content="center"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.hirInsr) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_INDD_INSR')"
            align-content="center"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.inddInsr) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BU_DDTN')"
            align-content="center"
          >
            <p>
              {{ stringUtil.getNumberWithComma(info2.buDdtn) }}
            </p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DDTN_SUM')"
            align-content="center"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.ddtnSum) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_PNPYAM_DTLP_IZ') }}</h3>
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_REDF')"
          @click="openRedemptionOfFeePopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grd3MainRef"
        name="grd3Main"
        :visible-rows="4"
        @init="initGrd3Main"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, modal, defineGrid, stringUtil } from 'kw-lib';
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
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.add(-1, 'month').format('YYYYMM'),
  no: '',
  prtnrKnm: '',
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

const info2 = ref({
  rds: '',
  erntx: '',
  rsdntx: '',
  pnpyam: '',
  hirInsr: '',
  inddInsr: '',
  buDdtn: '',
  ddtnSum: '',
});

const { prPerfYm } = searchParams.value;
const { prpartnerNo } = searchParams.value;

let cachedParams;

/*
 *  Event - 번호 검색 아이콘 클릭 이벤트
 */
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: searchParams.value.perfYm,
      prtnrNo: searchParams.value.no,
      ogTpCd: 'W01',
      prtnrKnm: undefined,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.no = payload.prtnrNo;
      searchParams.value.prtnrKnm = payload.prtnrKnm;
    }
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
 *  Event - 실적상세 버튼 클릭
 */
async function openPerformancePopup() {
  const { perfYm, no } = searchParams.value;
  const param = {
    perfYm,
    no,
    ogTpCd: 'W01',
  };
  if (no !== '') {
    await modal({
      component: 'WwfeeIndividualFeeDetailListP',
      componentProps: param,
    });
  }
}

/*
 *  Event - 재지급 버튼 클릭
 */
async function openAgainDisbursementPopup() {
  const param = {
    prtnrNo: searchParams.value.no,
    ogTpCd: 'W01',
  };

  await modal({
    component: 'WwdebAgainDisbursementDetailP',
    componentProps: param,
  });
}

/*
 *  Event - 부담공제조정 버튼 클릭
 */
async function openZwfedFeeBurdenDeductionRegP() {
  const param = {
    dsbYm: dayjs(searchParams.value.perfYm).format('YYYY-MM'),
    ogTpCd: 'W01',
    ogTpCdTxt: 'P조직',
    coCd: '2000',
    coCdTxt: 'WELLS',
    prtnrNo: searchParams.value.no,
  };
  await modal({
    component: 'ZwfedFeeBurdenDeductionRegP',
    componentProps: param,
  });
}

/*
 *  Event - 되물림 버튼 클릭
 */
async function openRedemptionOfFeePopup() {
  const param = {
    prtnrNo: searchParams.value.no,
    ogTpCd: 'W01',
  };

  await modal({
    component: 'WwdeaAllowanceDelinquentRedemptionFeeListP',
    componentProps: param,
  });
}

async function fetchData(type) {
  const response = await dataService.get(`/sms/wells/fee/individual-fees/plar-${type}`, { params: cachedParams });
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
    info2.value = resData;
  } else if (type === 'pnpyam') {
    const pnpyamView = grd3MainRef.value.getView();
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
    { fieldName: 'item1' },
    { fieldName: 'fval1', dataType: 'number' },
    { fieldName: 'item2' },
    { fieldName: 'fval2', dataType: 'number' },
    { fieldName: 'item3' },
    { fieldName: 'fval3', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'item1', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '개인합계', styleName: 'text-left' } },
    { fieldName: 'fval1', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item2', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '조직합계', styleName: 'text-left' } },
    { fieldName: 'fval2', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item3', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '기타합계', styleName: 'text-left' } },
    { fieldName: 'fval3', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.setFooters({ visible: true, items: [{ height: 30 }] });

  // multi row header setting
  view.setColumnLayout([

    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['item1', 'fval1'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_OG') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['item2', 'fval2'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_ETC') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['item3', 'fval3'],
      hideChildHeaders: true,
    },

  ]);
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'item1' },
    { fieldName: 'fval1', dataType: 'number' },
    { fieldName: 'item2' },
    { fieldName: 'fval2', dataType: 'number' },
    { fieldName: 'item3' },
    { fieldName: 'fval3', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'item1', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '개인합계', styleName: 'text-left' } },
    { fieldName: 'fval1', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item2', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '조직합계', styleName: 'text-left' } },
    { fieldName: 'fval2', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item3', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '기타합계', styleName: 'text-left' } },
    { fieldName: 'fval3', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.setFooters({ visible: true, items: [{ height: 30 }] });

  // multi row header setting
  view.setColumnLayout([

    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['item1', 'fval1'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_OG') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['item2', 'fval2'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_ETC') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['item3', 'fval3'],
      hideChildHeaders: true,
    },

  ]);
});

const initGrd3Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'item' },
    { fieldName: 'lstmm', dataType: 'number' },
    { fieldName: 'thmOc', dataType: 'number' },
    { fieldName: 'tmh', dataType: 'number' },
    { fieldName: 'thmDdtn', dataType: 'number' },
    { fieldName: 'thmBlam', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'item', header: t('MSG_TXT_DIV'), width: '167', styleName: 'text-left', footer: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'lstmm', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_BLAM'), width: '254', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'thmOc', header: t('MSG_TXT_THM_OC'), width: '254', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'tmh', header: t('MSG_TXT_THM') + t('MSG_TXT_SUM'), width: '254', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'thmDdtn', header: t('MSG_TXT_THM_DDTN'), width: '254', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'thmBlam', header: t('MSG_TXT_THM_BLAM'), width: '254', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true, items: [{ height: 30 }] });

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column
});

</script>

<style scoped>
</style>
