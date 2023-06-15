<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FED
2. 프로그램 ID : WwfedIndividualFeePlannerMgtM - 개인별 수수료 관리(P조직)
3. 작성자 : min-kyu bae
4. 작성일 : 2023.03.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 개인별 수수료 관리(P조직) 조회 화면
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
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <h3>{{ t('MSG_TIT_BIZ_INFO') }}</h3>
      <kw-form
        class="mt20"
        dense
        align-content="left"
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
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_METG')"
            align-content="right"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.metg) }}</p>
          </kw-form-item>
          <kw-form-item />
          <kw-form-item
            :label="t('MSG_TXT_QLF')"
            align-content="left"
          >
            <p>{{ info1.qlf }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_BAS_IZ') }}</h3>
        </template>
        <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
      </kw-action-top>
      <kw-form
        dense
        align-content="right"
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_INDV')+t('MSG_TXT_ELHM')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.indvElhm) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_INDV')+t('MSG_TXT_ELHM')+t('MSG_TXT_EXCP')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.indvElhmExcp) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_INDV')+t('MSG_TXT_ADP')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.indvAdp) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_OG')+t('MSG_TXT_ELHM')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.ogElhm) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_OG')+t('MSG_TXT_ELHM')+t('MSG_TXT_EXCP')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.ogElhmExcp) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_OG')+t('MSG_TXT_ADP')"
          >
            <p>{{ stringUtil.getNumberWithComma( info1.ogAdp) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_INDV')+t('MSG_TXT_CHNG')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.indvChng) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_INDV')+t('MSG_TXT_MUTU')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.indvMutu) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_OG')+t('MSG_TXT_MUTU')"
          >
            <p>{{ stringUtil.getNumberWithComma(info1.ogMutu) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_TOT_SUM') }}</h3>
        </template>
        <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
      </kw-action-top>

      <kw-form
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
      <kw-separator />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_FEE_IZ') }}</h3>
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_FEE_CTR')"
          @click="openFeeControlPopup"
        />
      </kw-action-top>
      <kw-form
        dense
        :cols="4"
        align-content="right"
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_INDV')+t('MSG_TXT_ELHM')+t('MSG_TXT_PRPN')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w01) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_INDV')+t('MSG_TXT_ELHM')+t('MSG_TXT_EXCP')+t('MSG_TXT_PRPN')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w02) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_SAL_INTV')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w03) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_METG')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w04) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_STMNT')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w05) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_MUTU')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w21) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_FXAM')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w23) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_LIVE_PAKG')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w24) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_HOME_CARE')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w25) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_OG')+t('MSG_TXT_ELHM')+t('MSG_TXT_PRPN')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w11) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_OG')+t('MSG_TXT_ELHM')+t('MSG_TXT_EXCP')+t('MSG_TXT_PRPN')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w12) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_OG')+t('MSG_TXT_SAL_INTV')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w13) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_NB')+t('MSG_TXT_BRANCH')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w15) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_OG')+t('MSG_TXT_EJT')+'1'"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w16) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_OG')+t('MSG_TXT_EJT')+'2'"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w17) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_OG')+t('MSG_TXT_MUTU')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w22) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_ADSB')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w20) }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ETC_SPPT')"
          >
            <p>{{ stringUtil.getNumberWithComma(info2.w30) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_DDTN_IZ') }}</h3>
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_BU_DDTN')+t('MSG_BTN_CTR')"
          @click="openBurdenDeductionControlPopup"
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
          @click="openPnpyamControlPopup"
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
            <p>{{ stringUtil.getNumberWithComma(info3.rds) }}</p>
          </kw-form-item>
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
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_HIR_INSR')"
          >
            <p>{{ stringUtil.getNumberWithComma(info3.hirInsr) }}</p>
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
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_CTR_IZ') }}</h3>
        </template>
        <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
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
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.format('YYYYMM'),
  no: '',

});

const info1 = ref({
  emplNm: '',
  blg: '',
  rsb: '',
  metg: '',
  qlf: '',
  indvElhm: '',
  indvElhmExcp: '',
  indvAdp: '',
  ogElhm: '',
  ogElhmExcp: '',
  ogAdp: '',
  indvChng: '',
  indvMutu: '',
  ogMutu: '',
  intbsSum: '',
  ddtnSum: '',
  aclDsbAmt: '',
});

const info2 = ref({
  w01: '',
  w02: '',
  w03: '',
  w04: '',
  w05: '',
  w21: '',
  w23: '',
  w24: '',
  w25: '',
  w11: '',
  w12: '',
  w13: '',
  w15: '',
  w16: '',
  w17: '',
  w22: '',
  w20: '',
  w30: '',
});

const info3 = ref({
  rds: '',
  erntx: '',
  rsdntx: '',
  hirInsr: '',
  buDdtn: '',
  pnpyam: '',
});

let cachedParams;

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

/*
 *  Event - 부담공제조정 버튼 클릭  ※현재 팝업화면 없음
 */
async function openBurdenDeductionControlPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openBurdenDeductionControlPopup',
    componentProps: param,
  });
}

/*
 *  Event - 가지급금조정 버튼 클릭  ※현재 팝업화면 없음
 */
async function openPnpyamControlPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openPnpyamControlPopup',
    componentProps: param,
  });
}

/* 번호 검색 아이콘 클릭 이벤트 */
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.no,
      ogTpCd: 'W01',
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.no = payload.prtnrNo;
    }
  }
}

async function fetchData(type) {
  const response = await dataService.get(`/sms/wells/fee/individual-fee/plar-${type}`, { params: cachedParams });
  const resData = response.data;
  totalCount.value = resData.length;
  if (type === 'entrepreneur') {
    info1.value = resData;
  } else if (type === 'fee') {
    info2.value = resData;
  } else if (type === 'deduction') {
    info3.value = resData;
  } else if (type === 'control') {
    const controlView = grdMainRef.value.getView();
    controlView.getDataSource().setRows(resData);
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('entrepreneur');
  await fetchData('fee');
  await fetchData('deduction');
  await fetchData('control');
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

</script>
