<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FED
2. 프로그램 ID : WwfedIndividualFeeHomeMasterMgtM - 개인별 수수료 관리(홈마스터)
3. 작성자 : min-kyu bae
4. 작성일 : 2023.03.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 개인별 수수료 관리(홈마스터) 조회 화면
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
            icon="search"
            clearable
            :on-click-icon="onClickSearchNo"
            :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
            rules="required"
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
          <h3 class="mb0">
            {{ t('MSG_TIT_BIZ_INFO') }}
          </h3>
        </template>
      </kw-action-top>

      <kw-form
        class="mt20"
        dense
        align-content="right"
        :cols="4"
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_EMPL_NM')"
            align-content="left"
          >
            <p>{{ info1.emplNm }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BLG')"
            align-content="center"
          >
            <p>{{ info1.blg }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSB')"
            align-content="left"
          >
            <p>{{ info1.rsb }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_NMN')"
            align-content="right"
          >
            <p>{{ info1.akdcha }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_GRCNT')"
            align-content="right"
          >
            <p>{{ info1.prtnrGdCd }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ASET')+ t('MSG_TXT_EDUC')+t('MSG_TXT_PTCP_DC')"
            align-content="right"
          >
            <p>{{ info1.atcnt1 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ACPN')+ t('MSG_TXT_EDUC')+t('MSG_TXT_PTCP_DC')"
            align-content="right"
          >
            <p>{{ info1.atcnt2 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BIZ_RGST_MM')"
            align-content="center"
          >
            <p>{{ info1.akdsym }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator class="mb30" />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_BAS_IZ') }}</h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
      </kw-action-top>
      <kw-form
        class="mt20"
        dense
        align-content="right"
        :cols="4"
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_COM_TOT')+ t('MSG_TXT_SELL')+ t('MSG_TXT_COUNT')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.akdeq0) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_SERVICE')+ t('MSG_TXT_COUNT')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.sercnt) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_SERVICE')+ t('MSG_TXT_PROCS_RT')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.serryl) }}%</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_HCR_MSH')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.akcda19) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_MTRRS')+ t('MSG_TXT_RTLFE')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.akcda10) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_MTRRS')+t('MSG_TXT_EXCP') +t('MSG_TXT_RTLFE')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.akcda12) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ENVR_ELHM') +t('MSG_TXT_SNGL_PMNT')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.akcda13) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ENVR_ELHM')+t('MSG_TXT_EXCP') +t('MSG_TXT_SNGL_PMNT')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.akcda15) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator class="mb30" />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_TOT_SUM') }}</h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
      </kw-action-top>
      <kw-form
        class="mt20"
        dense
        align-content="right"
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_INTBS_SUM')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.intbsSum) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DDTN_SUM')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.ddtnSum) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ACL_DSB_AMT')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.aclDsbAmt) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator class="mb30" />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_FEE_IZ') }}</h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_FEE_CTR')"
          @click="openFeeControlPopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grd2MainRef"
        name="grd2Main"
        :visible-rows="6"
        @init="initGrd2Main"
      />
      <kw-separator class="mb30" />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_DDTN_IZ') }}</h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_BU_DDTN')+t('MSG_BTN_CTR')"
          @click="openZwfedFeeBurdenDeductionRegP"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_PNPYAM')+t('MSG_BTN_CTR')"
          @click="openZwfedFeePnpyamDeductionRegP"
        />
      </kw-action-top>
      <kw-form
        class="mt20"
        dense
        align-content="right"
        :cols="4"
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_ERNTX')"
          >
            <p>{{ stringUtil.getNumberWithComma(info3.erntx) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSDNTX')"
          >
            <p>{{ stringUtil.getNumberWithComma(info3.rsdntx) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RDS')"
          >
            <p>{{ stringUtil.getNumberWithComma(info3.rds) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_HIR_INSR')"
          >
            <p>{{ stringUtil.getNumberWithComma(info3.hirInsr) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_INDD_INSR')"
          >
            <p>{{ stringUtil.getNumberWithComma(info3.inddInsr) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BU_DDTN')"
          >
            <p>{{ stringUtil.getNumberWithComma(info3.buDdtn) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_PNPYAM')"
          >
            <p>{{ stringUtil.getNumberWithComma(info3.pnpyam) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DDTN_SUM')"
          >
            <p>{{ stringUtil.getNumberWithComma(info3.ddtnSum) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator class="mb30" />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_CTR_IZ') }}</h3>
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="3"
        @init="initGrdMain"
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

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const grd2MainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.add(-1, 'month').format('YYYYMM'),
  no: '',
  prtnrKnm: '',

});
const info1 = ref({
  emplNm: '',
  blg: '',
  rsb: '',
  akdcha: '',
  prtnrGdCd: '',
  atcnt1: '',
  atcnt2: '',
  akdsym: '',
  akdeq0: '',
  sercnt: '',
  serryl: '',
  akcda19: '',
  akcda10: '',
  akcda12: '',
  akcda13: '',
  akcda15: '',
  intbsSum: '',
  ddtnSum: '',
  aclDsbAmt: '',
});

const info3 = ref({
  erntx: '',
  rsdntx: '',
  rds: '',
  hirInsr: '',
  inddInsr: '',
  buDdtn: '',
  pnpyam: '',
  ddtnSum: '',
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
      prtnrNo: searchParams.value.no,
      ogTpCd: 'W03',
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
 *  Event - 수수료조정 버튼 클릭  ※현재 팝업화면 없음
 */
async function openFeeControlPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openFeeControlPopup',
    componentProps: param,
  });
}

async function fetchData(type) {
  const response = await dataService.get(`/sms/wells/fee/individual-fee/home-master/${type}`, { params: cachedParams });
  const resData = response.data;
  totalCount.value = resData.length;
  if (type === 'entrepreneurs') {
    info1.value = resData;
  } else if (type === 'fee') {
    const feeView = grd2MainRef.value.getView();
    feeView.getDataSource().setRows(resData);
  } else if (type === 'deduction') {
    info3.value = resData;
  } else if (type === 'control') {
    const controlView = grdMainRef.value.getView();
    controlView.getDataSource().setRows(resData);
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('entrepreneurs');
  await fetchData('fee');
  await fetchData('deduction');
  await fetchData('control');
}

/*
 *  Event - 부담공제조정 버튼 클릭
 */
async function openZwfedFeeBurdenDeductionRegP() {
  const param = {
    dsbYm: dayjs(searchParams.value.perfYm).format('YYYY-MM'),
    ogTpCd: 'W03',
    coCd: '2000',
    prtnrNo: searchParams.value.no,
  };
  const { result: isChanged } = await modal({
    component: 'ZwfedFeeBurdenDeductionRegP',
    componentProps: param,
  });
  if (isChanged) {
    onClickSearch();
  }
}

/*
 *  Event - 가지급금조정 버튼 클릭
 */
async function openZwfedFeePnpyamDeductionRegP() {
  const param = {
    dsbYm: dayjs(searchParams.value.perfYm).format('YYYY-MM'),
    ogTpCd: 'W03',
    coCd: '2000',
    prtnrNo: searchParams.value.no,
  };

  const { result: isChanged } = await modal({
    component: 'ZwfedFeePnpyamDeductionRegP',
    componentProps: param,
  });
  if (isChanged) {
    onClickSearch();
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'div' },
    { fieldName: 'item' },
    { fieldName: 'ctrBf', dataType: 'number' },
    { fieldName: 'ctrAf', dataType: 'number' },
    { fieldName: 'rsn' },
    { fieldName: 'ctrDtm' },
    { fieldName: 'ctrr' },
  ];

  const columns = [
    { fieldName: 'div', header: t('MSG_TXT_DIV'), width: '132', styleName: 'text-left' },
    { fieldName: 'item', header: t('MSG_TXT_ITEM'), width: '247', styleName: 'text-left' },
    { fieldName: 'ctrBf', header: t('MSG_TXT_CTR_BF'), width: '200', styleName: 'text-right' },
    { fieldName: 'ctrAf', header: t('MSG_TXT_CTR_AF'), width: '200', styleName: 'text-right' },
    { fieldName: 'rsn', header: t('MSG_TXT_RSN'), width: '328', styleName: 'text-left' },
    { fieldName: 'ctrDtm', header: t('MSG_TXT_CTR_DTM'), width: '200', styleName: 'text-center' },
    { fieldName: 'ctrr', header: t('MSG_TXT_CTRR'), width: '161', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
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

  view.setFooters({ visible: true, items: [{ height: 30 }] });

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
      header: t('MSG_TXT_ETC'),
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

</script>
