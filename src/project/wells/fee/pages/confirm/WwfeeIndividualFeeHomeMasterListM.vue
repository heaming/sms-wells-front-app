<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEE
2. 프로그램 ID : WwfeeIndividualFeeHomeMasterListM - 수수료 개인별 상세조회 (홈마스터)
3. 작성자 : min-kyu bae
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
            v-model="searchParams.prtnrNo"
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            icon="search"
            clearable
            :maxlength="10"
            rules="required"
            :on-click-icon="onClickSearchNo"
            :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
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
          v-permission:print
          :label="$t('MSG_BTN_DSB_SPCSH_PRNT')"
          icon="report"
          dense
          @click="openHmstReportPopup"
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
            <p>{{ info.frrSum ? stringUtil.getNumberWithComma(info.frrSum) : '0' }}</p>
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
            <p>{{ info.ddtnSum ? stringUtil.getNumberWithComma(info.ddtnSum) : '0' }}</p>
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
            <p>{{ info.dsbAc }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_ACL_DSB')"
            align-content="right"
          >
            <p>{{ info.aclDsb ? stringUtil.getNumberWithComma(info.aclDsb) : '0' }}</p>
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
        :visible-rows="7"
        @init="initGrd2Main"
      />
      <kw-action-top class="mt30">
        <template #left>
          <h3>{{ t('MSG_TXT_DDTN_IZ') }}</h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <!-- 부담공제 버튼 미사용 처리
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_BU_DDTN')"
          @click="openZwfedFeeBurdenDeductionRegP"
        />
        -->
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
import { useDataService, getComponentType, stringUtil, modal, defineGrid, alert } from 'kw-lib';
import dayjs from 'dayjs';
import { openReportPopup } from '~common/utils/cmPopupUtil';

import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grd1MainRef = ref(getComponentType('KwGrid'));
const grd2MainRef = ref(getComponentType('KwGrid'));
const grd3MainRef = ref(getComponentType('KwGrid'));
const grd4MainRef = ref(getComponentType('KwGrid'));
const route = useRoute();
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.add(-1, 'month').format('YYYYMM'),
  prtnrNo: '',
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
  pstnDvCd: '',
});

let cachedParams;

/*
 *  Event - 번호 검색 아이콘 클릭 이벤트
 */
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: searchParams.value.perfYm,
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: 'W03',
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.prtnrNo = payload.prtnrNo;
    }
  }
}

/*
 *  Event - 지급명세서 출력 버튼 클릭
 */
async function openHmstReportPopup() {
  const { perfYm, prtnrNo, pstnDvCd } = info.value;
  const bfPerfYm = dayjs(perfYm).add(-1, 'month').format('YYYYMM');
  if (prtnrNo !== '' && prtnrNo !== undefined) {
    openReportPopup(
      '/ksswells/hmCmms/V3.0/cmmsSpec2022.ozr',
      '/ksswells/hmCmms/V3.0/cmmsSpec2022.odi',
      JSON.stringify(
        {
          AKSDYM: perfYm.replaceAll('-', ''),
          AKSDTY: perfYm.replaceAll('-', '').substring(0, 4),
          AKSDTM: perfYm.replaceAll('-', '').substring(4, 6),
          AKDDTY: bfPerfYm.substring(0, 4),
          AKDDTM: bfPerfYm.substring(4, 6),
          AKDRNK: pstnDvCd,
          AKDCDE: prtnrNo,
        },
      ),
    );
  } else {
    alert(t('MSG_ALT_USE_DT_SRCH_AF'));
  }
}

/*
 *  Event - 실적상세 버튼 클릭
 */
async function openPerformancePopup() {
  const { perfYm, prtnrNo } = cachedParams;
  if (info.value.prtnrNo !== '' && info.value.prtnrNo !== undefined) {
    const param = {
      perfYm,
      prtnrNo,
      ogTpCd: 'W03',
    };
    console.log(param);
    await modal({
      component: 'WwfeeIndividualFeeDetailListP',
      componentProps: param,
    });
  } else {
    alert(t('MSG_ALT_USE_DT_SRCH_AF'));
  }
}

/*
 *  Event - 재지급 버튼 클릭
 */
async function openAgainDisbursementPopup() {
  if (info.value.prtnrNo !== '' && info.value.prtnrNo !== undefined) {
    const param = {
      prtnrNo: cachedParams.prtnrNo,
      ogTpCd: 'W03',
    };

    await modal({
      component: 'WwdebAgainDisbursementDetailP',
      componentProps: param,
    });
  } else {
    alert(t('MSG_ALT_USE_DT_SRCH_AF'));
  }
}

/*
 *  Event - 부담공제조정 버튼 클릭
 * 부담공제 버튼 미사용 처리
 */
// async function openZwfedFeeBurdenDeductionRegP() {
//   const { perfYm, prtnrNo } = cachedParams;
//   if (info.value.prtnrNo !== '' && info.value.prtnrNo !== undefined) {
//     const param = {
//       perfYm,
//       ogTpCd: 'W03',
//       prtnrNo,
//     };
//     await modal({
//       component: 'ZwdeeBurdenDeductionP',
//       componentProps: param,
//     });
//   } else {
//     alert(t('MSG_ALT_USE_DT_SRCH_AF'));
//   }
// }

/*
 *  Event - 되물림 버튼 클릭
 */
async function openRedemptionOfFeePopup() {
  if (info.value.prtnrNo !== '' && info.value.prtnrNo !== undefined) {
    const param = {
      prtnrNo: cachedParams.prtnrNo,
      ogTpCd: 'W03',
    };

    await modal({
      component: 'WwdeaAllowanceDelinquentRedemptionFeeListP',
      componentProps: param,
    });
  } else {
    alert(t('MSG_ALT_USE_DT_SRCH_AF'));
  }
}

async function fetchData(type) {
  const response = await dataService.get(`/sms/wells/fee/individual-fees/hmst-${type}`, { params: cachedParams, timeout: 300000 });
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
    // make two columns
    const half = Math.ceil(resData.length / 2);
    const data = [];
    for (let i = 0; i < half; i += 1) {
      data.push({
        item1: resData[i].item,
        amt1: resData[i].amt,
        item2: resData[i + half]?.item,
        amt2: resData[i + half]?.amt,
      });
    }

    const deductionView = grd3MainRef.value.getView();
    deductionView.getDataSource().setRows(data);
  } else if (type === 'pnpyam') {
    const pnpyamView = grd4MainRef.value.getView();
    pnpyamView.getDataSource().setRows(resData);
  }
}

async function onClickSearch() {
  info.value = {};
  grd1MainRef.value.getData().clearRows();
  grd2MainRef.value.getData().clearRows();
  grd3MainRef.value.getData().clearRows();
  grd4MainRef.value.getData().clearRows();
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('informations');
  await fetchData('etcs');
  await fetchData('fees');
  await fetchData('deductions');
  await fetchData('pnpyam');
}

function setParams() {
  if (!isEmpty(route.params)) {
    searchParams.value.perfYm = route.params.perfYm;
    searchParams.value.prtnrNo = route.params.prtnrNo;

    onClickSearch();
  }
}

onBeforeMount(() => {
  if (!isEmpty(route.params)) {
    searchParams.value.perfYm = route.params.perfYm;
    searchParams.value.prtnrNo = route.params.prtnrNo;
  }
});

onMounted(() => {
  nextTick(() => {
    setParams();
  });
});

onActivated(() => {
  if (!isEmpty(route.params)) {
    searchParams.value.perfYm = route.params.perfYm;
    searchParams.value.prtnrNo = route.params.prtnrNo;

    nextTick(() => {
      setParams();
    });
  }
});

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
    { fieldName: 'elhmAckmtCt', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '300', styleName: 'text-right' },
    { fieldName: 'svCnt', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_COUNT'), width: '300', styleName: 'text-right' },
    { fieldName: 'svRat', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_PROCS_RT'), width: '300', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'item1' },
    { fieldName: 'fval1', dataType: 'number' },
    { fieldName: 'item2' },
    { fieldName: 'fval2', dataType: 'number' },
    { fieldName: 'item3' },
    { fieldName: 'fval3', dataType: 'number' },
    { fieldName: 'item4' },
    { fieldName: 'fval4', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'item1', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '판매합계', styleName: 'text-left' } },
    { fieldName: 'fval1', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item2', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '서비스합계', styleName: 'text-left' } },
    { fieldName: 'fval2', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item3', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '기타합계', styleName: 'text-left' } },
    { fieldName: 'fval3', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item4', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '조직합계', styleName: 'text-left' } },
    { fieldName: 'fval4', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.setFooters({ visible: true, items: [{ height: 42 }] });

  // multi row header setting
  view.setColumnLayout([

    {
      header: t('MSG_TXT_SELL'), // colspan title
      direction: 'horizontal', // merge type
      items: ['item1', 'fval1'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_SERVICE'),
      direction: 'horizontal',
      items: ['item2', 'fval2'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_EDUC'),
      direction: 'horizontal',
      items: ['item3', 'fval3'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_OG') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['item4', 'fval4'],
      hideChildHeaders: true,
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
  view.setFooters({ visible: true, items: [{ height: 42 }] });

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});
</script>
