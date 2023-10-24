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
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            icon="search"
            clearable
            :maxlength="10"
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
            <p>{{ info1.cwMm }}</p>
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
            <p>{{ info1.asetEducPtcpDc }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ACPN')+ t('MSG_TXT_EDUC')+t('MSG_TXT_PTCP_DC')"
            align-content="right"
          >
            <p>{{ info1.acpnEducPtcpDc }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BIZ_RGST_MM')"
            align-content="center"
          >
            <p>{{ info1.cntrYm }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator class="mb30" />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_BAS_IZ') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
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
            <p>{{ info1.sellAckmtCt ? stringUtil.getNumberWithComma(info1.sellAckmtCt) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_SERVICE')+ t('MSG_TXT_COUNT')"
          >
            <p>{{ info1.svCt ? stringUtil.getNumberWithComma(info1.svCt) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_SERVICE')+ t('MSG_TXT_PROCS_RT')"
          >
            <p>{{ info1.svProcRt ? stringUtil.getNumberWithComma(info1.svProcRt) : '0' }}%</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_HCR_MSH')"
          >
            <p>{{ info1.hcrMsh ? stringUtil.getNumberWithComma(info1.hcrMsh) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_MTRRS')+ t('MSG_TXT_RTLFE')"
          >
            <p>{{ info1.mattRtlfe ? stringUtil.getNumberWithComma(info1.mattRtlfe) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_MTRRS')+t('MSG_TXT_EXCP') +t('MSG_TXT_RTLFE')"
          >
            <p>{{ info1.mattExcpRtlfe ? stringUtil.getNumberWithComma(info1.mattExcpRtlfe) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ENVR_ELHM') +t('MSG_TXT_SNGL_PMNT')"
          >
            <p>{{ info1.envrElhmPerfAmt ? stringUtil.getNumberWithComma(info1.envrElhmPerfAmt) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ENVR_ELHM')+t('MSG_TXT_EXCP') +t('MSG_TXT_SNGL_PMNT')"
          >
            <p>{{ info1.envrElhmExcpPerfAmt ? stringUtil.getNumberWithComma(info1.envrElhmExcpPerfAmt) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator class="mb30" />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_TOT_SUM') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-form
        class="mt20"
        dense
        align-content="right"
      >
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_INTBS_SUM')">
            <p>{{ info1.intbsAmt ? stringUtil.getNumberWithComma(info1.intbsAmt) : '0' }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_DDTN_SUM')">
            <p>{{ info1.ddctam ? stringUtil.getNumberWithComma(info1.ddctam) : '0' }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ACL_DSB_AMT')">
            <p>{{ info1.dsbOjAmt ? stringUtil.getNumberWithComma(info1.dsbOjAmt) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator class="mb30" />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_FEE_IZ') }}</h3>
          <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_FEE_CTR')"
          :disable="!isBtnClick"
          @click="openFeeControlPopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grd2MainRef"
        name="grd2Main"
        :visible-rows="7"
        @init="initGrd2Main"
      />
      <kw-separator class="mb30" />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_DDTN_IZ') }}</h3>
          <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_BU_DDTN')+t('MSG_BTN_CTR')"
          :disable="!isBtnClick"
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
          :disable="!isBtnClick"
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
            <p>{{ info3.erntx ? stringUtil.getNumberWithComma(info3.erntx) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSDNTX')"
          >
            <p>{{ info3.rsdntx ? stringUtil.getNumberWithComma(info3.rsdntx) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RDS')"
          >
            <p>{{ info3.rds ? stringUtil.getNumberWithComma(info3.rds) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_HIR_INSR')"
          >
            <p>{{ info3.hirInsr ? stringUtil.getNumberWithComma(info3.hirInsr) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_INDD_INSR')"
          >
            <p>{{ info3.inddInsr ? stringUtil.getNumberWithComma(info3.inddInsr) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BU_DDTN')"
          >
            <p>{{ info3.buDdtn ? stringUtil.getNumberWithComma(info3.buDdtn) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_PNPYAM')"
          >
            <p>{{ info3.pnpyam ? stringUtil.getNumberWithComma(info3.pnpyam) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DDTN_SUM')"
          >
            <p>{{ info3.ddtnSum ? stringUtil.getNumberWithComma(info3.ddtnSum) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator class="mb30" />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_CTR_IZ') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
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
const isBtnClick = ref(false);

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
 *  Event - 수수료조정 버튼 클릭
 */
async function openFeeControlPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    prtnrNo: searchParams.value.no,
    ogTpCd: 'W03',
  };

  await modal({
    component: 'ZwfedFeeControlP',
    componentProps: param,
  });
}

/*
 *  Event - 이체자료 생성 후 조정 못하게 막음
 */
async function getUseYn(perfYm, ogTpCd, prtnrNo) {
  const type = 'DML';
  const res = await dataService.get(`sms/common/fee/schedules/use-control/${perfYm}-${ogTpCd}-${prtnrNo}-${type}`);

  if (res.data === 'Y') {
    isBtnClick.value = true;
  } else {
    isBtnClick.value = false;
  }
}

async function fetchData(type) {
  const response = await dataService.get(`/sms/wells/fee/individual-fee/home-master/${type}`, { params: cachedParams, timeout: 300000 });
  const resData = response.data;
  totalCount.value = resData.length;
  if (type === 'entrepreneurs') {
    info1.value = resData;
    if (info1.value.emplNm !== undefined) {
      isBtnClick.value = true;
    } else {
      isBtnClick.value = false;
      searchParams.value.prtnrKnm = '';
    }
  } else if (type === 'fees') {
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
  if (isBtnClick.value === true) {
    await fetchData('fees');
    await fetchData('deduction');
    await fetchData('control');
    await getUseYn(searchParams.value.perfYm, 'W03', searchParams.value.no);
  }
}

/*
 *  Event - 부담공제조정 버튼 클릭
 */
async function openZwfedFeeBurdenDeductionRegP() {
  const { perfYm, no } = searchParams.value;
  const param = {
    ddtnYm: perfYm,
    coCd: '2000',
    ogTpCd: 'W03',
    prtnrNo: no,
  };
  await modal({
    component: 'ZwfedFeeBurdenDeductionRegP',
    componentProps: param,
  });
}

/*
 *  Event - 가지급금조정 버튼 클릭
 */
async function openZwfedFeePnpyamDeductionRegP() {
  const param = {
    ddtnYm: searchParams.value.perfYm,
    coCd: '2000',
    ogTpCd: 'W03',
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
    { fieldName: 'item1', header: t('MSG_TXT_ITEM'), width: '170', styleName: 'text-left', footer: { text: '판매합계', styleName: 'text-left' } },
    { fieldName: 'fval1', header: t('MSG_TXT_AMT'), width: '170', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item2', header: t('MSG_TXT_ITEM'), width: '170', styleName: 'text-left', footer: { text: '서비스합계', styleName: 'text-left' } },
    { fieldName: 'fval2', header: t('MSG_TXT_AMT'), width: '170', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item3', header: t('MSG_TXT_ITEM'), width: '170', styleName: 'text-left', footer: { text: '교육합계', styleName: 'text-left' } },
    { fieldName: 'fval3', header: t('MSG_TXT_AMT'), width: '170', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item4', header: t('MSG_TXT_ITEM'), width: '170', styleName: 'text-left', footer: { text: '조직합계', styleName: 'text-left' } },
    { fieldName: 'fval4', header: t('MSG_TXT_AMT'), width: '170', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },

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
