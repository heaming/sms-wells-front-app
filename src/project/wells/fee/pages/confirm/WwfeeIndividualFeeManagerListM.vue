<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEE
2. 프로그램 ID : WwfeeIndividualFeeManagerListM - 수수료 개인별 상세조회 (M조직)
3. 작성자 : kyungmin.lim
4. 작성일 : 2023.10.13
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
            v-model="searchParams.prtnrNo"
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
          v-permission:print
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
            <p>{{ basicInfo.perfYm ? stringUtil.getDateFormat(basicInfo.perfYm,'YYYY-MM').substring(0,7) : '' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_SEQUENCE_NUMBER')"
            align-content="center"
          >
            <p>{{ basicInfo.prtnrNo ? basicInfo.prtnrNo : '' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_FEE_SUM')"
            align-content="right"
          >
            <p>{{ basicInfo.intbsAmt ? stringUtil.getNumberWithComma(basicInfo.intbsAmt) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_BLG')"
            align-content="center"
          >
            <p>{{ basicInfo.ogCd ? basicInfo.ogCd : '' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSB')"
            align-content="left"
          >
            <p>{{ basicInfo.rsbDvCd ? codes.RSB_DV_CD.find((v) => v.codeId === basicInfo.rsbDvCd).codeName : '' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DDTN_SUM')"
            align-content="right"
          >
            <p>{{ basicInfo.ddctam ? stringUtil.getNumberWithComma(basicInfo.ddctam) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_EMPL_NM')"
            align-content="left"
          >
            <p>{{ basicInfo.prtnrKnm ? basicInfo.prtnrKnm : '' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DSB_BNK')"
            align-content="left"
          >
            <p>{{ basicInfo.bnkNm ? basicInfo.bnkNm : '' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ACL_DSB')"
            align-content="right"
          >
            <p>{{ basicInfo.dsbOjAmt ? stringUtil.getNumberWithComma(basicInfo.dsbOjAmt) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_DSB_AC')"
            align-content="left"
          >
            <p>{{ basicInfo.acnoEncr ? basicInfo.acnoEncr : '' }}</p>
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
        ref="grdSellEtcRef"
        name="grdSellEtc"
        :visible-rows="6"
        @init="initGrdSellEtc"
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
        ref="grdBsRef"
        name="grdBs"
        :visible-rows="8"
        @init="initGrdBs"
      />
      <ul class="grid-fix-footer">
        <li class="grid-fix-footer__item">
          <span class="grid-fix-footer__label">{{ $t('MSG_TXT_MGT') }}</span>
          <p class="grid-fix-footer__data text-left">
            {{ basicInfo.mngtCt ? stringUtil.getNumberWithComma(basicInfo.mngtCt) : '0' }}
          </p>
        </li>
        <li class="grid-fix-footer__item">
          <span class="grid-fix-footer__label">{{ $t('MSG_TXT_VST') }}</span>
          <p class="grid-fix-footer__data text-left">
            {{ basicInfo.vstCt ? stringUtil.getNumberWithComma(basicInfo.vstCt) : '0' }}
          </p>
        </li>
        <li class="grid-fix-footer__item">
          <span class="grid-fix-footer__label">{{ $t('MSG_TXT_PROCS_RT') }}</span>
          <p class="grid-fix-footer__data text-left">
            {{ basicInfo.procsRt ? stringUtil.getNumberWithComma(basicInfo.procsRt): '0' }}%
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
        ref="grdFeeRef"
        name="grdFee"
        :visible-rows="8"
        @init="initGrdFee"
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
        :cols="3"
      >
        <kw-form-row
          v-for="row in deductionRowCnt"
          :key="row"
        >
          <template
            v-for="(item, inex) in deductionList"
            :key="inex"
          >
            <kw-form-item
              v-if="inex >= row*3-3 && inex <= row*3-1"
              :label="item.feeAtcItem"
            >
              <p>{{ stringUtil.getNumberWithComma(item.feeAtcVal) }}</p>
            </kw-form-item>
          </template>
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
        ref="grdPnpyamRef"
        name="grdPnpyam"
        :visible-rows="5"
        @init="initGrdPnpyam"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, getComponentType, stringUtil, modal, defineGrid, alert } from 'kw-lib';
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

const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
);

// 실적구분
// const rsbDvCdCodes = codes.RSB_DV_CD;
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdSellEtcRef = ref(getComponentType('KwGrid'));
const grdBsRef = ref(getComponentType('KwGrid'));
const grdFeeRef = ref(getComponentType('KwGrid'));
const grdPnpyamRef = ref(getComponentType('KwGrid'));
const deductionRowCnt = ref(0);
const router = useRouter();

const searchParams = ref({
  perfYm: now.add(-1, 'month').format('YYYYMM'),
  prtnrNo: '',
  prtnrKnm: '',
  prPerfYm: props.perfYm,
  prprtnrNo: props.prtnrNo,
});

const basicInfo = ref({
  perfYm: '',
  ogCd: '',
  prtnrNo: '',
  prtnrKnm: '',
  rsbDvCd: '',
  intbsAmt: '0',
  ddctam: '0',
  dsbOjAmt: '0',
  bnkNm: '',
  acnoEncr: '',
  mngtCt: '0',
  vstCt: '0',
  procsRt: '0',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
});

const deductionList = ref([]);
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
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: 'W02',
      prtnrKnm: undefined,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.prtnrNo = payload.prtnrNo;
      searchParams.value.prtnrKnm = payload.prtnrKnm;
    }
  }
}

/*
 *  Event - 지급명세서 출력 버튼 클릭
 */
async function openManagerReportPopup() {
  const { perfYm, prtnrNo } = basicInfo.value;
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
  const { rsbDvCd, dgr1LevlOgId, dgr2LevlOgId, dgr3LevlOgId, perfYm, prtnrNo } = basicInfo.value;
  if (basicInfo.value.prtnrNo !== '' && basicInfo.value.prtnrNo !== undefined) {
    router.push({
      path: url,
      query: { rsbDvCd, perfYm, prtnrNo, ogLv1Id: dgr1LevlOgId, ogLv2Id: dgr2LevlOgId, ogLv3Id: dgr3LevlOgId },
    });
  } else {
    alert(t('MSG_ALT_USE_DT_SRCH_AF'));
  }
}

/*
 *  Event - 실적상세 버튼 클릭
 */
async function openPerformancePopup() {
  const { perfYm, prtnrNo } = searchParams.value;
  if (basicInfo.value.prtnrNo !== '' && basicInfo.value.prtnrNo !== undefined) {
    const param = {
      perfYm,
      prtnrNo,
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
  if (basicInfo.value.prtnrNo !== '' && basicInfo.value.prtnrNo !== undefined) {
    const param = {
      prtnrNo: searchParams.value.prtnrNo,
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
 *  Event - 부담공제상세 버튼 클릭
 */
async function openZwfedFeeBurdenDeductionRegP() {
  const { perfYm, prtnrNo } = searchParams.value;
  if (basicInfo.value.prtnrNo !== '' && basicInfo.value.prtnrNo !== undefined) {
    const param = {
      perfYm,
      ogTpCd: 'W02',
      prtnrNo,
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
  if (basicInfo.value.prtnrNo !== '' && basicInfo.value.prtnrNo !== undefined) {
    const param = {
      prtnrNo: searchParams.value.prtnrNo,
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
  if (type === 'basic') {
    basicInfo.value = resData;
  } else if (type === 'selletcs') {
    const sellEtcView = grdSellEtcRef.value.getView();
    sellEtcView.getDataSource().setRows(resData);
  } else if (type === 'before-services') {
    const bsView = grdBsRef.value.getView();
    bsView.getDataSource().setRows(resData);
  } else if (type === 'fees') {
    const feeView = grdFeeRef.value.getView();
    feeView.getDataSource().setRows(resData);
  } else if (type === 'deductions') {
    deductionList.value = resData;
    deductionRowCnt.value = Math.ceil(resData.length / 3);
  } else if (type === 'pnpyam') {
    const pnpyamView = grdPnpyamRef.value.getView();
    pnpyamView.getDataSource().setRows(resData);
  }
}

async function onClickSearch() {
  basicInfo.value = {};
  grdSellEtcRef.value.getData().clearRows();
  grdBsRef.value.getData().clearRows();
  grdFeeRef.value.getData().clearRows();
  grdPnpyamRef.value.getData().clearRows();
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('basic');
  await fetchData('selletcs');
  await fetchData('before-services');
  await fetchData('fees');
  await fetchData('deductions');
  await fetchData('pnpyam');
}

if (!isEmpty(prPerfYm) && !isEmpty(prprtnrNo)) {
  searchParams.value.perfYm = prPerfYm;
  searchParams.value.prtnrNo = prprtnrNo;
  onClickSearch();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdSellEtc = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'perfItem1', width: '132', styleName: 'text-center' },
    { fieldName: 'perfVal1', width: '132', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'perfItem2', width: '132', styleName: 'text-center' },
    { fieldName: 'perfVal2', width: '132', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'perfItem3', width: '132', styleName: 'text-center' },
    { fieldName: 'perfVal3', width: '132', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'perfItem4', width: '132', styleName: 'text-center' },
    { fieldName: 'perfVal4', width: '132', styleName: 'text-right', dataType: 'number' },
  ];

  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_INDV_PERF'), // 개인실적
      direction: 'horizontal',
      items: ['perfItem1', 'perfVal1'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_OG_PERF'), // 조직실적
      direction: 'horizontal',
      items: ['perfItem2', 'perfVal2'],
      hideChildHeaders: true,
    },
    {
      header: `BS${t('MSG_TXT_PERF')}`, // BS실적
      direction: 'horizontal',
      items: ['perfItem3', 'perfVal3'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_ETC'), // 기타
      direction: 'horizontal',
      items: ['perfItem4', 'perfVal4'],
      hideChildHeaders: true,
    },
  ]);

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrdBs = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cdNm', header: t('MSG_TXT_PRDT'), width: '140', styleName: 'text-center', footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } }, // 상품, 합계
    { fieldName: 'geMngtCt', header: t('MSG_TXT_MGT'), width: '90', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 관리
    { fieldName: 'geVstCt', header: t('MSG_TXT_VST'), width: '90', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 방문
    { fieldName: 'geAmt', header: t('MSG_TXT_AMT'), width: '90', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 금액
    { fieldName: 'fxamMngtCt', header: t('MSG_TXT_MGT'), width: '90', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 관리
    { fieldName: 'fxamVstCt', header: t('MSG_TXT_VST'), width: '90', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 방문
    { fieldName: 'fxamAmt', header: t('MSG_TXT_AMT'), width: '90', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 금액
    { fieldName: 'sumAmt', header: t('MSG_TXT_SUM'), width: '114', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 합계
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setFooters({ visible: true, items: [{ height: 42 }] });

  view.setColumnLayout([
    'cdNm', // single
    {
      header: t('MSG_TXT_GE'), // 일반
      direction: 'horizontal',
      items: ['geMngtCt', 'geVstCt', 'geAmt'],
    },
    {
      header: t('MSG_TXT_FXAM'), // 정액
      direction: 'horizontal',
      items: ['fxamMngtCt', 'fxamVstCt', 'fxamAmt'],
    },
    'sumAmt',
  ]);
});

const initGrdFee = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'feeNm1', width: '132', styleName: 'text-center' },
    { fieldName: 'feeAtcVal1', width: '132', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'feeNm2', width: '132', styleName: 'text-center' },
    { fieldName: 'feeAtcVal2', width: '132', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'feeNm3', width: '132', styleName: 'text-center' },
    { fieldName: 'feeAtcVal3', width: '132', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'feeNm4', width: '132', styleName: 'text-center' },
    { fieldName: 'feeAtcVal4', width: '132', styleName: 'text-right', dataType: 'number' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  view.setColumnLayout([
    {
      header: t('MSG_TXT_PRSNL_FEE'), // 개인수수료
      direction: 'horizontal',
      items: ['feeNm1', 'feeAtcVal1'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_ORGNSTN_FEE'), // 조직수수료
      direction: 'horizontal',
      items: ['feeNm2', 'feeAtcVal2'],
      hideChildHeaders: true,
    },
    {
      header: `BS${t('MSG_TXT_FEE')}`, // 수수료
      direction: 'horizontal',
      items: ['feeNm3', 'feeAtcVal3'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_ETC'), // 기타
      direction: 'horizontal',
      items: ['feeNm4', 'feeAtcVal4'],
      hideChildHeaders: true,
    },
  ]);

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrdPnpyam = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'pnpyamAtcCdNm', header: t('MSG_TXT_ITEM'), width: '200', styleName: 'text-center', footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } }, // 항목, 합계
    { fieldName: 'bfmnBlnc', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_BLAM'), width: '150', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 전월 잔액
    { fieldName: 'thmnOccr', header: t('MSG_TXT_THM_OC'), width: '150', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 당월발생
    { fieldName: 'thmnSum', header: t('MSG_TXT_THM') + t('MSG_TXT_SUM'), width: '150', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 당월 합계
    { fieldName: 'thmnDctn', header: t('MSG_TXT_THM_DDTN'), width: '150', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 당월공제
    { fieldName: 'thmnBlnc', header: t('MSG_TXT_THM_BLAM'), width: '150', styleName: 'text-right', dataType: 'number', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } }, // 당월잔액
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true, items: [{ height: 42 }] });

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});
</script>

<style scoped>
</style>
