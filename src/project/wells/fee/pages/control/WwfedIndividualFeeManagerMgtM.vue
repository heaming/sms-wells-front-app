<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FED
2. 프로그램 ID : WwfedIndividualFeeManagerMgtM - 개인별 수수료 관리(M조직)
3. 작성자 : min-kyu bae
4. 작성일 : 2023.03.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 개인별 수수료 관리(M조직) 조회 화면
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
      <h3>{{ t('MSG_TIT_BIZ_INFO') }}</h3>
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
            :label="t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
            align-content="left"
          >
            <p>{{ info1.mngDpt }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RGNL_GRP')"
            align-content="left"
          >
            <p>{{ info1.rgnlGrp }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BRANCH')"
            align-content="left"
          >
            <p>{{ info1.branch }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_RSB')"
            align-content="left"
          >
            <p>{{ info1.rsb }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RGS')+t('MSG_TXT_BASE_MM')"
            align-content="center"
          >
            <p>{{ info1.rgsBaseMm ? stringUtil.getDateFormat(info1.rgsBaseMm) : '-' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_PRFMT_MON')"
            align-content="center"
          >
            <p>{{ info1.prfmtMon ? stringUtil.getDateFormat(info1.prfmtMon) : '-' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BIZ_CLTN_MON')"
            align-content="center"
          >
            <p>{{ info1.bizCltnMon ? stringUtil.getDateFormat(info1.bizCltnMon) : '-' }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_QLF')"
            align-content="left"
          >
            <p>{{ info1.qlf }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_OPNG_MM')"
            align-content="center"
          >
            <p>{{ info1.opngMm ? stringUtil.getDateFormat(info1.opngMm) : '-' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_OPNG_NMN')"
            align-content="center"
          >
            <p>{{ info1.opngNmm }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_MANAGER')+t('MSG_TXT_CLTN_MM')"
            align-content="center"
          >
            <p>{{ info1.mngCltnMm ? stringUtil.getDateFormat(info1.mngCltnMm) : '-' }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_BAS_IZ') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
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
        </template>
        <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-grid
        ref="grd2MainRef"
        name="grd2Main"
        :visible-rows="totalCount === 0 ? 1 : totalCount"
        @init="initGrd2Main"
      />
      <ul class="grid-fix-footer">
        <li class="grid-fix-footer__item">
          <span class="grid-fix-footer__label">{{ $t('MSG_TXT_MGT') }}</span>
          <p class="grid-fix-footer__data text-left">
            {{ info1.mgtCnt }}
          </p>
        </li>
        <li class="grid-fix-footer__item">
          <span class="grid-fix-footer__label">{{ $t('MSG_TXT_VST') }}</span>
          <p class="grid-fix-footer__data text-left">
            {{ info1.vstCnt }}
          </p>
        </li>
        <li class="grid-fix-footer__item">
          <span class="grid-fix-footer__label">{{ $t('MSG_TXT_PROCS_RT') }}</span>
          <p class="grid-fix-footer__data text-left">
            {{ info1.procsRt }}%
          </p>
        </li>
      </ul>
      <kw-action-top class="mb20 mt30">
        <template #left>
          <h3>
            {{ t('MSG_TXT_TOT_SUM') }}
          </h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-form
        dense
        align-content="right"
      >
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_INTBS_SUM')">
            <p>{{ info1.intbsSum ? stringUtil.getNumberWithComma(info1.intbsSum) : '0' }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_DDTN_SUM')">
            <p>{{ info1.ddtnSum ? stringUtil.getNumberWithComma(info1.ddtnSum) : '0' }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ACL_DSB_AMT')">
            <p>{{ info1.aclDsbAmt ? stringUtil.getNumberWithComma(info1.aclDsbAmt) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <kw-action-top class="mb20">
        <template #left>
          <h3>
            {{ t('MSG_TXT_FEE_IZ') }}
          </h3>
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
        ref="grd3MainRef"
        name="grd3Main"
        :visible-rows="9"
        @init="initGrd3Main"
      />
      <kw-separator />
      <kw-action-top class="mb20">
        <template #left>
          <h3>
            {{ t('MSG_TXT_DDTN_IZ') }}
          </h3>
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
          <h3>
            {{ t('MSG_TXT_CTR_IZ') }}
          </h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-grid
        ref="grd4MainRef"
        name="grd4Main"
        :visible-rows="3"
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
const isBtnClick = ref(false);

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

  perfYm: now.add(-1, 'month').format('YYYYMM'),
  no: '',
  prtnrKnm: '',

});

const info1 = ref({
  emplNm: '',
  mngDpt: '',
  rgnlGrp: '',
  branch: '',
  rsb: '',
  rgsBaseMm: '',
  prfmtMon: '',
  bizCltnMon: '',
  qlf: '',
  opngMm: '',
  opngNmm: '',
  mngCltnMm: '',
  mgtCnt: '',
  vstCnt: '',
  procsRt: '',
  intbsSum: '',
  ddtnSum: '',
  aclDsbAmt: '',
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
 *  Event - 수수료조정 버튼 클릭
 */
async function openFeeControlPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    prtnrNo: searchParams.value.no,
    ogTpCd: 'W02',
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
  const response = await dataService.get(`/sms/wells/fee/individual-fee/mnger-${type}`, { params: cachedParams, timeout: 300000 });
  const resData = response.data;
  if (type === 'entrepreneur') {
    info1.value = resData;
    if (info1.value.emplNm !== undefined) {
      isBtnClick.value = true;
    } else {
      isBtnClick.value = false;
      searchParams.value.prtnrKnm = '';
    }
  } else if (type === 'base-info') {
    const baseView = grd1MainRef.value.getView();
    baseView.getDataSource().setRows(resData);
  } else if (type === 'before-services') {
    const bsView = grd2MainRef.value.getView();
    totalCount.value = resData.length;
    bsView.getDataSource().setRows(resData);
  } else if (type === 'fee') {
    const feeView = grd3MainRef.value.getView();
    feeView.getDataSource().setRows(resData);
  } else if (type === 'deduction') {
    info2.value = resData;
  } else if (type === 'control') {
    const controlView = grd4MainRef.value.getView();
    controlView.getDataSource().setRows(resData);
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('entrepreneur');
  if (isBtnClick.value === true) {
    await fetchData('base-info');
    await fetchData('before-services');
    await fetchData('fee');
    await fetchData('deduction');
    await fetchData('control');
    await getUseYn(searchParams.value.perfYm, 'W02', searchParams.value.no);
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
    ogTpCd: 'W02',
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
    ogTpCd: 'W02',
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

</script>
