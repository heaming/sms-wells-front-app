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
            v-model="searchParams.prtnrNo"
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
            <p>{{ basicInfo.prtnrKnm }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
            align-content="left"
          >
            <p>{{ basicInfo.dgr1LevlOgNm }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RGNL_GRP')"
            align-content="left"
          >
            <p>{{ basicInfo.dgr2LevlOgNm }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BRANCH')"
            align-content="left"
          >
            <p>{{ basicInfo.ogCd }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_RSB')"
            align-content="left"
          >
            <p>{{ basicInfo.rsbDvCd ? codes.RSB_DV_CD.find((v) => v.codeId === basicInfo.rsbDvCd).codeName : '' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RGS')+t('MSG_TXT_BASE_MM')"
            align-content="center"
          >
            <p>{{ basicInfo.cntrDt ? stringUtil.getDateFormat(basicInfo.cntrDt) : '' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_PRFMT_MON')"
            align-content="center"
          >
            <p>{{ basicInfo.prfmtDt ? stringUtil.getDateFormat(basicInfo.prfmtDt) : '' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BIZ_CLTN_MON')"
            align-content="center"
          >
            <p>{{ basicInfo.cltnDt ? stringUtil.getDateFormat(basicInfo.cltnDt) : '' }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_QLF')"
            align-content="left"
          >
            <p
              v-if="basicInfo.rsbDvCd === 'W0205'"
            >
              {{ basicInfo.qlfDvCd ? codes.QLF_DV_CD.find((v) => v.codeId === basicInfo.qlfDvCd).codeName : '' }}
            </p>
            <p
              v-if="basicInfo.rsbDvCd !== 'W0205'"
            >
              {{ basicInfo.brmgrDvCd ? basicInfo.brmgrDvCd : '' }}
            </p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_OPNG_MM')"
            align-content="center"
          >
            <p>{{ basicInfo.mngerOpngMm ? stringUtil.getDateFormat(basicInfo.mngerOpngMm) : '' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_OPNG_NMN')"
            align-content="center"
          >
            <p>{{ basicInfo.mngerBltnNmn ? basicInfo.mngerBltnNmn : '' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_MANAGER')+t('MSG_TXT_CLTN_MM')"
            align-content="center"
          >
            <p>{{ basicInfo.mngerBizCltnMm ? stringUtil.getDateFormat(basicInfo.mngerBizCltnMm) : '' }}</p>
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
        ref="grdSellEtcRef"
        name="grdSellEtc"
        :visible-rows="6"
        @init="initgrdSellEtc"
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
        ref="grdBsRef"
        name="grdBs"
        :visible-rows="8"
        @init="initGrdBs"
      />
      <ul class="grid-fix-footer">
        <li class="grid-fix-footer__item">
          <span class="grid-fix-footer__label">{{ $t('MSG_TXT_MGT') }}</span>
          <p class="grid-fix-footer__data text-left">
            {{ basicInfo.mngtCt }}
          </p>
        </li>
        <li class="grid-fix-footer__item">
          <span class="grid-fix-footer__label">{{ $t('MSG_TXT_VST') }}</span>
          <p class="grid-fix-footer__data text-left">
            {{ basicInfo.vstCt }}
          </p>
        </li>
        <li class="grid-fix-footer__item">
          <span class="grid-fix-footer__label">{{ $t('MSG_TXT_PROCS_RT') }}</span>
          <p class="grid-fix-footer__data text-left">
            {{ basicInfo.procsRt }}%
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
            <p>{{ basicInfo.intbsAmt ? stringUtil.getNumberWithComma(basicInfo.intbsAmt) : '0' }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_DDTN_SUM')">
            <p>{{ basicInfo.ddctam ? stringUtil.getNumberWithComma(basicInfo.ddctam) : '0' }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ACL_DSB_AMT')">
            <p>{{ basicInfo.dsbOjAmt ? stringUtil.getNumberWithComma(basicInfo.dsbOjAmt) : '0' }}</p>
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
          <h3>
            {{ t('MSG_TXT_CTR_IZ') }}
          </h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-grid
        ref="grdControlRef"
        name="grdControl"
        :visible-rows="10"
        @init="initControlMain"
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
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const isBtnClick = ref(false);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdSellEtcRef = ref(getComponentType('KwGrid'));
const grdBsRef = ref(getComponentType('KwGrid'));
const grdFeeRef = ref(getComponentType('KwGrid'));
const grdControlRef = ref(getComponentType('KwGrid'));
const deductionRowCnt = ref(0);

const searchParams = ref({
  perfYm: now.add(-1, 'month').format('YYYYMM'),
  prtnrNo: '',
  prtnrKnm: '',
});

const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
  'QLF_DV_CD',
);

const basicInfo = ref({
  ogCd: '',
  dgr1LevlOgNm: '',
  dgr2LevlOgNm: '',
  prtnrKnm: '',
  rsbDvCd: '',
  qlfDvCd: '',
  brmgrDvCd: '',
  cntrDt: '',
  prfmtDt: '',
  cltnDt: '',
  intbsAmt: '0',
  ddctam: '0',
  dsbOjAmt: '0',
  mngtCt: '0',
  vstCt: '0',
  procsRt: '0',
  mngerOpngMm: '',
  mngerBizCltnMm: '',
  mngerBltnNmn: '',
});

const deductionList = ref([]);

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
 *  Event - 수수료조정 버튼 클릭
 */
async function openFeeControlPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    prtnrNo: searchParams.value.prtnrNo,
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
  if (type === 'basic') {
    if (isEmpty(resData)) {
      await alert(t('MSG_ALT_CRSP_MM_PRTNR_NO_INF_NEX')); // 해당 월에 파트너 정보가 없습니다.
      return false;
    }
    basicInfo.value = resData;
    if (basicInfo.value.prtnrKnm !== undefined) {
      isBtnClick.value = true;
    } else {
      isBtnClick.value = false;
      searchParams.value.prtnrKnm = '';
    }
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
  } else if (type === 'control') {
    const controlView = grdControlRef.value.getView();
    controlView.getDataSource().setRows(resData);
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('basic');
  if (!isEmpty(basicInfo.value)) {
    if (isBtnClick.value === true) {
      await fetchData('selletcs');
      await fetchData('before-services');
      await fetchData('fees');
      await fetchData('deductions');
      await fetchData('control');
      await getUseYn(searchParams.value.perfYm, 'W02', searchParams.value.prtnrNo);
    }
  }
}

/*
 *  Event - 부담공제조정 버튼 클릭
 */
async function openZwfedFeeBurdenDeductionRegP() {
  const { perfYm, prtnrNo } = searchParams.value;
  const param = {
    ddtnYm: perfYm,
    coCd: '2000',
    ogTpCd: 'W02',
    prtnrNo,
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
    prtnrNo: searchParams.value.prtnrNo,
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
const initgrdSellEtc = defineGrid((data, view) => {
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

const initControlMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'div', header: t('MSG_TXT_DIV'), width: '120', styleName: 'text-center' }, // 구분
    { fieldName: 'item', header: t('MSG_TXT_ITEM'), width: '150', styleName: 'text-center' }, // 항목
    { fieldName: 'ctrBf', header: t('MSG_TXT_CTR_BF'), width: '180', styleName: 'text-right', dataType: 'number' }, // 조정 전
    { fieldName: 'ctrAf', header: t('MSG_TXT_CTR_AF'), width: '180', styleName: 'text-right', dataType: 'number' }, // 조정 후
    { fieldName: 'rsn', header: t('MSG_TXT_RSN'), width: '350', styleName: 'text-left' }, // 사유
    { fieldName: 'ctrDtm', header: t('MSG_TXT_CTR_DTM'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 조정일시
    { fieldName: 'ctrr', header: t('MSG_TXT_CTRR'), width: '120', styleName: 'text-center' }, // 조정자
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
