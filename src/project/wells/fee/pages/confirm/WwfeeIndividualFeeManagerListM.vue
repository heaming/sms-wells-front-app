<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEE
2. 프로그램 ID : WwfeeIndividualFeeManagerListM - 수수료 개인별 상세조회 (M조직)
3. 작성자 : gs.piit150
4. 작성일 : 2023.02.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 개인별 상세조회 (M조직) 조회 화면
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
            :maxlength="10"
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
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          :label="$t('MSG_BTN_DSB_SPCSH_PRNT')"
          icon="report"
          dense
          @click="openManagerReportPopup"
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
            <p>{{ info.perfYm ? stringUtil.getDateFormat(info.perfYm,'YYYY-MM').substring(0,7) : '' }}</p>
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
            <p>{{ info.dsbAc ? stringUtil.getNumberWithComma(info.dsbAc) : '0' }}</p>
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
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_BS_CONFIRM')"
          @click="openBsConfirmPopup"
        />
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
        :visible-rows="5"
        @init="initGrd1Main"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>
            BS{{ t('MSG_TXT_IZ') }}
          </h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
      </kw-action-top>
      <kw-grid
        ref="grd2MainRef"
        name="grd2Main"
        :visible-rows="8"
        @init="initGrd2Main"
      />
      <ul class="grid-fix-footer">
        <li class="grid-fix-footer__item">
          <span class="grid-fix-footer__label">{{ $t('MSG_TXT_MGT') }}</span>
          <p class="grid-fix-footer__data text-left">
            {{ info.mgtCnt }}
          </p>
        </li>
        <li class="grid-fix-footer__item">
          <span class="grid-fix-footer__label">{{ $t('MSG_TXT_VST') }}</span>
          <p class="grid-fix-footer__data text-left">
            {{ info.vstCnt }}
          </p>
        </li>
        <li class="grid-fix-footer__item">
          <span class="grid-fix-footer__label">{{ $t('MSG_TXT_PROCS_RT') }}</span>
          <p class="grid-fix-footer__data text-left">
            {{ info.procsRt }}%
          </p>
        </li>
      </ul>
      <kw-separator />
      <kw-action-top class="mt30">
        <template #left>
          <h3>{{ t('MSG_TXT_FEE_IZ') }}</h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_ADSB')"
          @click="openAgainDisbursementPopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grd3MainRef"
        name="grd3Main"
        :visible-rows="8"
        @init="initGrd3Main"
      />
      <kw-separator />
      <kw-action-top class="mb20">
        <template #left>
          <h3>
            {{ t('MSG_TXT_DDTN_IZ') }}
          </h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_BU_DDTN')"
          @click="openZwfedFeeBurdenDeductionRegP"
        />
      </kw-action-top>
      <kw-form
        dense
        align-content="right"
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_RDS')"
          >
            <p>{{ info2.rds ? stringUtil.getNumberWithComma(info2.rds) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ERNTX')"
          >
            <p>{{ info2.erntx ? stringUtil.getNumberWithComma(info2.erntx) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSDNTX')"
          >
            <p>{{ info2.rsdntx ? stringUtil.getNumberWithComma(info2.rsdntx) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_HIR_INSR')"
          >
            <p>{{ info2.hirInsr ? stringUtil.getNumberWithComma(info2.hirInsr) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BU_DDTN')"
          >
            <p>{{ info2.buDdtn ? stringUtil.getNumberWithComma(info2.buDdtn) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_PNPYAM')"
          >
            <p>{{ info2.pnpyam ? stringUtil.getNumberWithComma(info2.pnpyam) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_INDD_INSR')"
          >
            <p>{{ info2.inddInsr ? stringUtil.getNumberWithComma(info2.inddInsr) : '0' }}</p>
          </kw-form-item>
          <kw-form-item>
            <p />
          </kw-form-item>
          <kw-form-item>
            <p />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_PNPYAM_DTLP_IZ') }}</h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
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
        :visible-rows="5"
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

const props = defineProps({
  perfYm: {
    type: String,
    required: true,
  },
  prtnrNo: {
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
const router = useRouter();
const searchParams = ref({

  perfYm: now.add(-1, 'month').format('YYYYMM'),
  no: '',
  prtnrKnm: '',
  prPerfYm: props.perfYm,
  prprtnrNo: props.prtnrNo,

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
  mgtCnt: '',
  vstCnt: '',
  procsRt: '',
  rsbDvCd: '',
  ogLv1Id: '',
  ogLv2Id: '',
  ogLv3Id: '',
  pstnDvCd: '',
});

const info2 = ref({
  rds: '',
  erntx: '',
  rsdntx: '',
  hirInsr: '',
  buDdtn: '',
  pnpyam: '',
  inddInsr: '',
});

const { prPerfYm } = searchParams.value;
const { prprtnrNo } = searchParams.value;

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
      ogTpCd: 'W02',
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
 *  Event - 지급명세서 출력 버튼 클릭
 */
async function openManagerReportPopup() {
  const { perfYm, prtnrNo, pstnDvCd } = info.value;
  if (prtnrNo !== '' && prtnrNo !== undefined) {
    const bfPerfYm = dayjs(perfYm).add(-1, 'month').format('YYYYMM');
    openReportPopup(
      '/ksswells/cmms/V5.2/cmmsSpec2023.ozr',
      '/ksswells/cmms/V5.2/cmmsSpec2023.odi',
      JSON.stringify(
        {
          AKSDYM: perfYm,
          AKSDTY: perfYm.substring(0, 4),
          AKSDTM: perfYm.substring(4, 6),
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
 *  Event - BS확인 버튼 클릭
 */
async function openBsConfirmPopup() {
  const url = '/fee/wwfed-manager-visit-fee-list';
  const { rsbDvCd, ogLv1Id, ogLv2Id, ogLv3Id, perfYm, prtnrNo } = info.value;
  if (info.value.prtnrNo !== '' && info.value.prtnrNo !== undefined) {
    router.push({
      path: url,
      query: { rsbDvCd, perfYm, prtnrNo, ogLv1Id, ogLv2Id, ogLv3Id },
    });
  } else {
    alert(t('MSG_ALT_USE_DT_SRCH_AF'));
  }
}

/*
 *  Event - 실적상세 버튼 클릭
 */
async function openPerformancePopup() {
  const { perfYm, no } = searchParams.value;
  if (info.value.prtnrNo !== '' && info.value.prtnrNo !== undefined) {
    const param = {
      perfYm,
      no,
      ogTpCd: 'W02',
    };
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
      prtnrNo: searchParams.value.no,
      ogTpCd: 'W02',
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
 */
async function openZwfedFeeBurdenDeductionRegP() {
  const { perfYm, no } = searchParams.value;
  if (info.value.prtnrNo !== '' && info.value.prtnrNo !== undefined) {
    const param = {
      perfYm,
      ogTpCd: 'W02',
      prtnrNo: no,
    };
    await modal({
      component: 'ZwdeeBurdenDeductionP',
      componentProps: param,
    });
  } else {
    alert(t('MSG_ALT_USE_DT_SRCH_AF'));
  }
}

/*
 *  Event - 되물림 버튼 클릭
 */
async function openRedemptionOfFeePopup() {
  if (info.value.prtnrNo !== '' && info.value.prtnrNo !== undefined) {
    const param = {
      prtnrNo: searchParams.value.no,
      ogTpCd: 'W02',
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
  const response = await dataService.get(`/sms/wells/fee/individual-fees/mnger-${type}`, { params: cachedParams, timeout: 300000 });
  const resData = response.data;
  totalCount.value = resData.length;
  if (type === 'informations') {
    info.value = resData;
  } else if (type === 'etcs') {
    const etcView = grd1MainRef.value.getView();
    etcView.getDataSource().setRows(resData);
  } else if (type === 'before-services') {
    const etcView = grd2MainRef.value.getView();
    etcView.getDataSource().setRows(resData);
  } else if (type === 'fees') {
    const feeView = grd3MainRef.value.getView();
    feeView.getDataSource().setRows(resData);
  } else if (type === 'deductions') {
    info2.value = resData;
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
  await fetchData('before-services');
  await fetchData('fees');
  await fetchData('deductions');
  await fetchData('pnpyam');
}

if (!isEmpty(prPerfYm) && !isEmpty(prprtnrNo)) {
  searchParams.value.perfYm = prPerfYm;
  searchParams.value.no = prprtnrNo;
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
    { fieldName: 'item4' },
    { fieldName: 'fval4', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'item1', width: '132', styleName: 'text-right' },
    { fieldName: 'fval1', width: '132', styleName: 'text-right' },
    { fieldName: 'item2', width: '132', styleName: 'text-right' },
    { fieldName: 'fval2', width: '132', styleName: 'text-right' },
    { fieldName: 'item3', width: '132', styleName: 'text-right' },
    { fieldName: 'fval3', width: '132', styleName: 'text-right' },
    { fieldName: 'item4', width: '132', styleName: 'text-right' },
    { fieldName: 'fval4', width: '132', styleName: 'text-right' },
  ];

  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_INDV_PERF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['item1', 'fval1'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_OG_PERF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['item2', 'fval2'],
      hideChildHeaders: true,
    },
    {
      header: `BS${t('MSG_TXT_PERF')}`, // colspan title
      direction: 'horizontal', // merge type
      items: ['item3', 'fval3'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_ETC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['item4', 'fval4'],
      hideChildHeaders: true,
    },
  ]);

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cdNm' },
    { fieldName: 'cnt1', dataType: 'number' },
    { fieldName: 'cnt2', dataType: 'number' },
    { fieldName: 'amt1', dataType: 'number' },
    { fieldName: 'cnt3', dataType: 'number' },
    { fieldName: 'cnt4', dataType: 'number' },
    { fieldName: 'amt2', dataType: 'number' },
    { fieldName: 'sumAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'cdNm', header: t('MSG_TXT_PRDT'), width: '140', footer: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'cnt1', header: t('MSG_TXT_MGT'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'cnt2', header: t('MSG_TXT_VST'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'amt1', header: t('MSG_TXT_AMT'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'cnt3', header: t('MSG_TXT_MGT'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'cnt4', header: t('MSG_TXT_VST'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'amt2', header: t('MSG_TXT_AMT'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'sumAmt', header: t('MSG_TXT_SUM'), width: '114', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setFooters({ visible: true, items: [{ height: 42 }] });

  // multi row header setting
  view.setColumnLayout([
    'cdNm', // single
    {
      header: t('MSG_TXT_GE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['cnt1', 'cnt2', 'amt1'],
    },
    {
      header: t('MSG_TXT_FXAM'),
      direction: 'horizontal',
      items: ['cnt3', 'cnt4', 'amt2'],
    },
    'sumAmt',
  ]);
});

const initGrd3Main = defineGrid((data, view) => {
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
    { fieldName: 'item1', width: '132', styleName: 'text-right' },
    { fieldName: 'fval1', width: '132', styleName: 'text-right' },
    { fieldName: 'item2', width: '132', styleName: 'text-right' },
    { fieldName: 'fval2', width: '132', styleName: 'text-right' },
    { fieldName: 'item3', width: '132', styleName: 'text-right' },
    { fieldName: 'fval3', width: '132', styleName: 'text-right' },
    { fieldName: 'item4', width: '132', styleName: 'text-right' },
    { fieldName: 'fval4', width: '132', styleName: 'text-right' },
  ];

  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_PRSNL_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['item1', 'fval1'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_ORGNSTN_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['item2', 'fval2'],
      hideChildHeaders: true,
    },
    {
      header: `BS${t('MSG_TXT_FEE')}`, // colspan title
      direction: 'horizontal', // merge type
      items: ['item3', 'fval3'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_ETC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['item4', 'fval4'],
      hideChildHeaders: true,
    },
  ]);

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
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

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column
});
</script>

<style scoped>
</style>
