<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDCC
2. 프로그램 ID : WwdccPrepaymentExpirationM - 선납만료 고객현황 - 대상현황 (W-CL-U-0052M01)
                                           - 선납만료 고객현황 - 문자발송업로드현황 (W-CL-U-0052M02)
3. 작성자 : sunghun choi
4. 작성일 : 2023.08.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 선납만료 고객현황 - 대상현황 탭 화면
- 선납만료 고객현황 - 문자발송업로드현황 탭 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs
      v-model="selectedTab"
    >
      <kw-tab
        name="tab1"
        :label="$t('MSG_TXT_OJ_PS')"
      />
      <kw-tab
        name="tab2"
        :label="$t('MSG_TXT_CHAR_FW_ULD_PS')"
      />
      <kw-tab
        name="tab3"
        :label="$t('MSG_TXT_CHAR_FW_IZ2')"
      />
    </kw-tabs>
    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="tab1">
        <kw-search
          ref="frmMainRef"
          :cols="4"
          @search="onClickObjectPresentStateSearch"
        >
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_MGT_YNM')"
              required
            >
              <kw-date-picker
                v-model="searchParams.slClYm"
                type="month"
                rules="required"
                @change="onChangeSlClYm"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_PDGRP_CD')"
              :colspan="2"
            >
              <kw-select
                v-model="searchParams.pdHclsfId"
                :options="codes.PD_HCLSF"
                first-option="all"
                first-option-val=""
                :placeholder="$t('MSG_TXT_ALL_CATG_LV1')"
                @change="onChangeHclsf"
              />
              <kw-select
                v-model="searchParams.pdMclsfId"
                :options="codes.PD_MCLSF"
                first-option="all"
                first-option-val=""
                :placeholder="$t('MSG_TXT_ALL_CATG_LV2')"
              />
              <kw-input
                v-model="searchParams.pdCd"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_PRDT_NM')"
            >
              <kw-input
                v-model="searchParams.pdNm"
              />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_DP_PTRM')"
              :colspan="2"
              required
            >
              <kw-date-range-picker
                v-model:from="searchParams.dpStDt"
                v-model:to="searchParams.dpEdDt"
                rules="date_range_required|date_range_months:3"
                type="month"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_OG_LEVL')"
              :colspan="2"
            >
              <zwog-level-select
                v-model:og-levl-dv-cd1="searchParams.ogcd1"
                v-model:og-levl-dv-cd2="searchParams.ogcd2"
                v-model:og-levl-dv-cd3="searchParams.ogcd3"
                :og-tp-cd="searchParams.ogTpCd"
                :base-ym="searchParams.baseYm"
                :start-level="1"
                :end-level="3"
              />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_CRNO')"
            >
              <kw-input
                v-model="searchParams.bzrNo"
                maxlength="10"
                regex="num"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_TASK_DIV')"
            >
              <kw-select
                :model-value="'렌탈'"
                :options="['렌탈']"
                :disable="true"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_DP_YN2')"
            >
              <kw-select
                v-model="searchParams.dpYn"
                :options="['Y', 'N']"
                first-option="all"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_CNCL_YN')"
            >
              <kw-select
                v-model="searchParams.canYn"
                :options="['Y', 'N']"
                first-option="all"
              />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_RNTL_SN')"
              :colspan="2"
            >
              <kw-input
                v-model="searchParams.rentalStn"
                regex="num"
              />
              <span>~</span>
              <kw-input
                v-model="searchParams.rentalEtn"
                regex="num"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_INQR_DV')"
            >
              <kw-select
                v-model="searchParams.upYn"
                :options="[{codeId:'N', codeName:t('MSG_TXT_BIZD_NOT_ASN')}]"
                first-option="all"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="totalObjectPresentStateCount"
              />
              <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
            </template>
            <kw-btn
              v-permission:download
              icon="download_on"
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              secondary
              dense
              :disable="totalObjectPresentStateCount === 0"
              @click="onClickObjectPresentStateExcelDownload"
            />
            <kw-separator
              vertical
              inset
              spaced
            />
            <kw-btn
              v-permission:create
              :label="$t('MSG_BTN_CHAR_FW_ULD_MMT')"
              primary
              dense
              @click="onClickCharacterFwUld"
            />
          </kw-action-top>

          <kw-grid
            ref="grdObjectPresentStateRef"
            name="objectPresentState"
            :visible-rows="10"
            @init="initGrdObjectPresentState"
          />
        </div>
      </kw-tab-panel>
      <kw-tab-panel name="tab2">
        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="totalCharacterFwUldCount"
              />
              <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
            </template>
            <kw-separator
              spaced
              vertical
              inset
            />
            <kw-btn
              v-permission:download
              icon="download_on"
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              secondary
              dense
              :disable="totalCharacterFwUldCount === 0"
              @click="onClickCharacterFwUldExcelDownload"
            />
            <kw-separator
              spaced="16px"
              vertical
              inset
            />
            <kw-date-picker
              v-model="sendParams.fwbooDate"
              class="w170"
              dense
              :label="t('MSG_TXT_FW_DATE')"
            />
            <kw-time-picker
              v-model="sendParams.fwbooTime"
              class="w170"
              dense
              :label="t('MSG_TXT_FW_HH')"
            />
            <kw-btn
              v-permission:create
              :disable="totalCharacterFwUldCount === 0"
              primary
              dense
              :label="$t('MSG_BTN_BOO_FW_PRTC')"
              @click="onClickSendMessage"
            />
          </kw-action-top>
          <kw-grid
            ref="grdCharacterFwUldRef"
            name="characterFwUld"
            :visible-rows="10"
            @init="initGrdCharacterFwUld"
          />
        </div>
      </kw-tab-panel>
      <kw-tab-panel name="tab3">
        <wwdcc-prepayment-expiration-m-character-fw-iz />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, codeUtil, useMeta, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import WwdccPrepaymentExpirationMCharacterFwIz from './WwdccPrepaymentExpirationMCharacterFwIz.vue';

const { notify, alert } = useGlobal();
const dataService = useDataService();
const { currentRoute } = useRouter();
const userInfo = useMeta().getUserInfo();

const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectedTab = ref('tab1');
const totalObjectPresentStateCount = ref(0);
const totalCharacterFwUldCount = ref(0);

const grdObjectPresentStateRef = ref(getComponentType('KwGrid'));
const grdCharacterFwUldRef = ref(getComponentType('KwGrid'));

// const inqrDvs = ref([]);

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'COD_YN',
);

await Promise.allSettled([
  dataService.get('/sms/common/contract/products/hclsf')
    .then((response) => { codes.PD_HCLSF = response.data; }),
  dataService.get('/sms/common/contract/products/mclsf')
    .then((response) => { codes.PD_MCLSF_ALL = response.data; }),
]);

codes.PD_MCLSF = cloneDeep(codes.PD_MCLSF_ALL);

let cachedParams;
const searchParams = ref({
  slClYm: dayjs().format('YYYYMM'),
  pdHclsfId: '',
  pdMclsfId: '',
  pdCd: '',
  pdNm: '',
  dpStDt: dayjs().add(-2, 'month').format('YYYYMM'),
  dpEdDt: dayjs().format('YYYYMM'),
  ogcd1: '',
  ogcd2: '',
  ogcd3: '',
  bzrNo: '',
  dpYn: '',
  canYn: '',
  rentalStn: '',
  rentalEtn: '',
  upYn: '',
  upNo: userInfo.pdCd,
  ogTpCd: userInfo.wkOjOgTpCd === null ? userInfo.ogTpCd : userInfo.wkOjOgTpCd, // 조직유형
  baseYm: dayjs().format('YYYYMM'),
});

const sendParams = ref({
  fwbooDate: dayjs().format('YYYYMMDD'),
  fwbooTime: '0900',
});

function onChangeSlClYm() {
  searchParams.value.dpStDt = dayjs(searchParams.value.slClYm).add(-2, 'month').format('YYYYMM');
  searchParams.value.dpEdDt = searchParams.value.slClYm;
}

async function onClickObjectPresentStateExcelDownload() {
  const view = grdObjectPresentStateRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/performance/prepayment-expiration/object-present-state', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickCharacterFwUldExcelDownload() {
  const view = grdCharacterFwUldRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/performance/prepayment-expiration/character-fw-uld', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function fetchObjectPresentState() {
  const res = await dataService.get('/sms/wells/closing/performance/prepayment-expiration/object-present-state', { params: { ...cachedParams } });
  const objectPresentState = res.data;
  totalObjectPresentStateCount.value = objectPresentState.length;

  const gridView = grdObjectPresentStateRef.value.getView();
  gridView.getDataSource().setRows(objectPresentState);
}

async function fetchCharacterFwUld() {
  const res = await dataService.get('/sms/wells/closing/performance/prepayment-expiration/character-fw-uld', { params: { ...cachedParams } });
  const characterFwUld = res.data;
  totalCharacterFwUldCount.value = characterFwUld.length;

  const gridView = grdCharacterFwUldRef.value.getView();
  gridView.getDataSource().setRows(characterFwUld);
}

async function onClickObjectPresentStateSearch() {
  const { rentalStn } = searchParams.value;
  const { rentalEtn } = searchParams.value;

  if (Number(rentalStn) > Number(rentalEtn)) {
    notify(t('MSG_ALT_STRT_YM_END_YM_BIG', [t('MSG_TXT_RNTL_SN') + t('MSG_TXT_RSV_STRT_DTM'), t('MSG_TXT_RSV_END_DTM')]));
    return false;
  }

  cachedParams = cloneDeep(searchParams.value);
  await fetchObjectPresentState();
}

async function onClickCharacterFwUldSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchCharacterFwUld();
}

async function onClickCharacterFwUld() {
  selectedTab.value = 'tab2';
  await onClickCharacterFwUldSearch();
}

async function onChangeHclsf(hclsf) {
  if (isEmpty(hclsf)) {
    codes.PD_MCLSF = codes.PD_MCLSF_ALL;
  } else {
    codes.PD_MCLSF = codes.PD_MCLSF_ALL.filter((code) => hclsf === code.hgrPdClsfId);
  }
  searchParams.value.pdMclsfId = '';
}

async function onClickSendMessage() {
  const view = grdCharacterFwUldRef.value.getView();
  const allRows = gridUtil.getAllRowValues(view);

  let cnt = 0;
  gridUtil.forEach(view, (rowValue) => {
    if (rowValue.prmReAplcYn === 'N') {
      if (isEmpty(rowValue.cntrCralTno1) || isEmpty(rowValue.cntrCralTno2) || isEmpty(rowValue.cntrCralTno3)) {
        cnt += 1;
      }
    }
  });

  if (cnt > 0) {
    alert(t('MSG_ALT_CNTRT_MPNO'));
    return;
  }

  const sendRows = allRows.filter((v) => v.prmReAplcYn === 'N').map((row) => ({
    cntrCralTno1: row.cntrCralTno1,
    cntrCralTno2: row.cntrCralTno2,
    cntrCralTno3: row.cntrCralTno3,
    cstKnm: row.cstKnm,
    cstNo: row.cstNo,
    cntrNo: row.cntrNo,
    cntrSn: row.cntrSn,
    cntrInfo: row.cntrInfo,
    prmEndYm: row.prmEndYm,
    mmpmYm: row.mmpmYm,
    prmEndMm: row.prmEndMm,
    pdCd: row.pdCd,
    pdNm: row.pdNm,
    cnt: row.cnt,
    currMm: row.currMm,
    postYy: row.postYy,
    postMm: row.postMm,
    fwbooDate: sendParams.value.fwbooDate,
    fwbooTime: sendParams.value.fwbooTime,
  }));

  const yymmdd = sendParams.value.fwbooDate + sendParams.value.fwbooTime;
  const lastDate = dayjs(yymmdd);

  const currDate = dayjs();

  if (lastDate.diff(currDate, 'hour') <= 0) {
    alert(t('MSG_ALT_FW_CRTL_HH'));
    return;
  }

  if (sendRows.length > 2000) {
    alert(t('MSG_ALT_ULD_OVR'));
    return;
  }

  if (sendRows.length === 0) { notify(t('MSG_ALT_NO_FW_OBJ')); return; }
  await dataService.post('/sms/wells/closing/performance/prepayment-expiration', sendRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickCharacterFwUldSearch();
}

function isEditable(grid, dataCell) {
  const ret = {};
  const orgPrmReAplcYn = grid.getValue(dataCell.index.itemIndex, 'orgPrmReAplcYn');
  if (orgPrmReAplcYn === 'Y') {
    ret.styleName = 'rg-button-toggle rg-button-disabled';
  } else {
    ret.styleName = 'rg-button-toggle';
  }
  return ret;
}

/*
async function fetchinqrDvs() {
  const response = await dataService.get('/sms/wells/closing/performance/prepayment-expiration/inqrDvs');
  inqrDvs.value = response.data;

  // searchParams.value.portalId = inqrDvs.value[0].portalId;
}

onMounted(async () => {
  await fetchinqrDvs();
}); */

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdObjectPresentState = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'pdNm' },
    { fieldName: 'rentalTn' },
    { fieldName: 'mpyBsdt' },
    { fieldName: 'lcsleDt' },
    { fieldName: 'cntrCanDt' },
    { fieldName: 'prmMcn' },
    { fieldName: 'prmDscr', dataType: 'number' },
    { fieldName: 'prmPeriod' },
    { fieldName: 'totPrmAmt', dataType: 'number' },
    { fieldName: 'prmReAplcYn' },
    { fieldName: 'prmExcpt' },
    { fieldName: 'cntrLocalTno' },
    { fieldName: 'cntrLocalTno1' },
    { fieldName: 'cntrLocalTno2' },
    { fieldName: 'cntrLocalTno3' },
    { fieldName: 'cntrCralTno' },
    { fieldName: 'cntrCralTno1' },
    { fieldName: 'cntrCralTno2' },
    { fieldName: 'cntrCralTno3' },
    { fieldName: 'rcgvpLocalTno' },
    { fieldName: 'rcgvpLocalTno1' },
    { fieldName: 'rcgvpLocalTno2' },
    { fieldName: 'rcgvpLocalTno3' },
    { fieldName: 'rcgvpCralTno' },
    { fieldName: 'rcgvpCralTno1' },
    { fieldName: 'rcgvpCralTno2' },
    { fieldName: 'rcgvpCralTno3' },
    { fieldName: 'dpClDt' },
    { fieldName: 'dpTpCdNm' },
    { fieldName: 'dpAmt', dataType: 'number' },
    { fieldName: 'ogCd' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'sellPrtnrNo' },
    { fieldName: 'cltnDt' },
    { fieldName: 'prtnrLocalTno' },
    { fieldName: 'prtnrLocalTno1' },
    { fieldName: 'prtnrLocalTno2' },
    { fieldName: 'prtnrLocalTno3' },
    { fieldName: 'prtnrCralTno' },
    { fieldName: 'prtnrCralTno1' },
    { fieldName: 'prtnrCralTno2' },
    { fieldName: 'prtnrCralTno3' },
    { fieldName: 'hooPrtnrNm' },
    { fieldName: 'hooPrtnrNo' },
    { fieldName: 'hooPrtnrCltnDt' },
    { fieldName: 'ogLocalTno' },
    { fieldName: 'ogLocalTno1' },
    { fieldName: 'ogLocalTno2' },
    { fieldName: 'ogLocalTno3' },
    { fieldName: 'hooPrtnrCralTno' },
    { fieldName: 'hooPrtnrCralTno1' },
    { fieldName: 'hooPrtnrCralTno2' },
    { fieldName: 'hooPrtnrCralTno3' },
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_NO'), width: '140', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_IST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '250', styleName: 'text-left' },
    { fieldName: 'rentalTn', header: t('MSG_TXT_RNTL_SN'), width: '100', styleName: 'text-right' },
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FNT_DT'), width: '100', styleName: 'text-right' },
    { fieldName: 'lcsleDt', header: t('MSG_TXT_SL_DT'), width: '140', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrCanDt', header: t('MSG_TXT_CANC_DT'), width: '140', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'prmMcn', header: t('MSG_TXT_PRM_MCNT'), width: '100', styleName: 'text-right' },
    { fieldName: 'prmDscr', header: t('MSG_TXT_PRM_DSC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'prmPeriod', header: t('MSG_TXT_PRM_PTRM'), width: '200', styleName: 'text-center' },
    { fieldName: 'totPrmAmt', header: t('MSG_TXT_PRM_TAM'), width: '100', styleName: 'text-center', numberFormat: '#,##0' },
    { fieldName: 'prmReAplcYn', header: t('MSG_TXT_PRM_RE_APLC_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'prmExcpt', header: t('MSG_TXT_PRM_EXCD'), width: '100', styleName: 'text-right' },
    { fieldName: 'cntrLocalTno',
      header: t('MSG_TXT_CNTRT_TNO2'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrLocalTno1, cntrLocalTno2, cntrLocalTno3 } = grid.getValues(index.itemIndex);
        if (cntrLocalTno1 != null) {
          return `${cntrLocalTno1}-${cntrLocalTno2}-${cntrLocalTno3}`;
        }
      },
    },
    { fieldName: 'cntrCralTno',
      header: t('MSG_TXT_CNTRT_MPNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrCralTno1, cntrCralTno2, cntrCralTno3 } = grid.getValues(index.itemIndex);
        if (cntrCralTno1 != null) {
          return `${cntrCralTno1}-${cntrCralTno2}-${cntrCralTno3}`;
        }
      },
    },
    { fieldName: 'cntrCralTno3', width: '100', styleName: 'text-right', visible: false },
    { fieldName: 'rcgvpLocalTno',
      header: t('MSG_TXT_ISTLL_TNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { rcgvpLocalTno1, rcgvpLocalTno2 } = grid.getValues(index.itemIndex);
        if (rcgvpLocalTno1 != null) {
          return `${rcgvpLocalTno1}-${rcgvpLocalTno2}-****`;
        }
      },
    },
    { fieldName: 'rcgvpLocalTno3', width: '100', styleName: 'text-right', visible: false },
    { fieldName: 'rcgvpCralTno',
      header: t('MSG_TXT_ISTLL_MPNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { rcgvpCralTno1, rcgvpCralTno2 } = grid.getValues(index.itemIndex);
        if (rcgvpCralTno1 != null) {
          return `${rcgvpCralTno1}-${rcgvpCralTno2}-****`;
        }
      },
    },
    { fieldName: 'rcgvpCralTno3', width: '100', styleName: 'text-right', visible: false },
    { fieldName: 'dpClDt', header: t('MSG_TXT_DP_DT'), width: '140', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'dpTpCdNm', header: t('MSG_TXT_DP_TP'), width: '140', styleName: 'text-center' },
    { fieldName: 'dpAmt', header: t('MSG_TXT_DEPOSIT_AMT'), width: '140', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_PRTNR_NUM'), width: '100', styleName: 'text-center' },
    { fieldName: 'cltnDt', header: t('MSG_TXT_BIZ_CLTN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrLocalTno',
      header: t('MSG_TXT_TEL_NO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { prtnrLocalTno1, prtnrLocalTno2 } = grid.getValues(index.itemIndex);
        if (prtnrLocalTno1 != null) {
          return `${prtnrLocalTno1}-${prtnrLocalTno2}-****`;
        }
      },
    },
    { fieldName: 'prtnrLocalTno3', width: '100', styleName: 'text-right', visible: false },
    { fieldName: 'prtnrCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { prtnrCralTno1, prtnrCralTno2 } = grid.getValues(index.itemIndex);
        if (prtnrCralTno1 != null) {
          return `${prtnrCralTno1}-${prtnrCralTno2}-****`;
        }
      },
    },
    { fieldName: 'prtnrCralTno3', width: '100', styleName: 'text-right', visible: false },
    { fieldName: 'hooPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'hooPrtnrNo', header: t('MSG_TXT_PRTNR_NUM'), width: '100', styleName: 'text-center' },
    { fieldName: 'hooPrtnrCltnDt', header: t('MSG_TXT_BRMGR_CLTN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogLocalTno',
      header: t('MSG_TXT_BRCH_TNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { ogLocalTno1, ogLocalTno2 } = grid.getValues(index.itemIndex);
        if (ogLocalTno1 != null) {
          return `${ogLocalTno1}-${ogLocalTno2}-****`;
        }
      },
    },
    { fieldName: 'ogLocalTno3', width: '100', styleName: 'text-right', visible: false },
    { fieldName: 'hooPrtnrCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { hooPrtnrCralTno1, hooPrtnrCralTno2 } = grid.getValues(index.itemIndex);
        if (hooPrtnrCralTno1 != null) {
          return `${hooPrtnrCralTno1}-${hooPrtnrCralTno2}-****`;
        }
      },
    },
    { fieldName: 'hooPrtnrCralTno3', width: '100', styleName: 'text-right', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'cntrDtlNo', 'cstKnm', 'rcgvpKnm', 'pdNm', 'rentalTn',
    'mpyBsdt', 'lcsleDt', 'cntrCanDt', 'prmMcn', 'prmDscr',
    'prmPeriod', 'totPrmAmt', 'prmReAplcYn', 'prmExcpt', 'cntrLocalTno', 'cntrCralTno',
    'rcgvpLocalTno', 'rcgvpCralTno', 'dpClDt', 'dpTpCdNm', 'dpAmt', // single
    {
      header: t('MSG_TXT_PRTNR_INF2'),
      direction: 'horizontal',
      items: ['ogCd', 'prtnrKnm', 'sellPrtnrNo', 'cltnDt', 'prtnrLocalTno', 'prtnrCralTno'],
    },
    {
      header: t('MSG_TXT_BRMGR_INF'),
      direction: 'horizontal',
      items: ['hooPrtnrNm', 'hooPrtnrNo', 'hooPrtnrCltnDt', 'ogLocalTno', 'hooPrtnrCralTno'],
    },
  ]);
});

const initGrdCharacterFwUld = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cstNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'cntrCralTno' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cntrInfo' },
    { fieldName: 'prmEndYm' },
    { fieldName: 'mmpmYm' },
    { fieldName: 'orgPrmReAplcYn' },
    { fieldName: 'prmReAplcYn' },
    { fieldName: 'prmEndMm' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'cnt' },
    { fieldName: 'currMm' },
    { fieldName: 'postYy' },
    { fieldName: 'postMm' },
    { fieldName: 'cntrCralTno1' },
    { fieldName: 'cntrCralTno2' },
    { fieldName: 'cntrCralTno3' },

  ];

  const columns = [
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '80', styleName: 'text-center', visible: false, editable: false },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM_CNTRT'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'cntrCralTno',
      header: t('MSG_TXT_CNTRR_VAC_PH_NO'),
      width: '140',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index) {
        const { cntrCralTno1, cntrCralTno2, cntrCralTno3 } = grid.getValues(index.itemIndex);
        if (cntrCralTno1 != null) {
          return `${cntrCralTno1}-${cntrCralTno2}-${cntrCralTno3}`;
        }
      },
    },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '160', styleName: 'text-center', visible: false, editable: false },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_NO'), width: '160', styleName: 'text-center', visible: false, editable: false },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_NO'), width: '160', styleName: 'text-center', editable: false },
    { fieldName: 'cntrInfo', header: t('MSG_TXT_PD_INF'), width: '300', styleName: 'text-left', editable: false },
    { fieldName: 'prmEndYm', header: t('MSG_TXT_PRM_EXN_YM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'mmpmYm', header: t('MSG_TXT_MM_PY_STRT_YM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'orgPrmReAplcYn', header: t('MSG_TXT_PRM_RE_APLC_YN'), width: '100', styleName: 'text-center', editable: false },
    {
      fieldName: 'prmReAplcYn',
      header: t('MSG_TXT_FW_OJ'),
      renderer: { type: 'radio' },
      width: '100',
      options: [{ codeId: 'Y', codeName: t('MSG_TXT_EXCD') }, { codeId: 'N', codeName: t('MSG_TXT_INC') }],
      styleCallback(grid, dataCell) { return isEditable(grid, dataCell); },
    },
    { fieldName: 'prmEndMm', width: '250', styleName: 'text-center', visible: false, editable: false },
    { fieldName: 'pdCd', width: '250', styleName: 'text-center', visible: false, editable: false },
    { fieldName: 'pdNm', width: '250', styleName: 'text-center', visible: false, editable: false },
    { fieldName: 'cnt', width: '250', styleName: 'text-center', visible: false, editable: false },
    { fieldName: 'currMm', width: '250', styleName: 'text-center', visible: false, editable: false },
    { fieldName: 'postYy', width: '250', styleName: 'text-center', visible: false, editable: false },
    { fieldName: 'postMm', width: '250', styleName: 'text-center', visible: false, editable: false },
    { fieldName: 'cntrCralTno1', width: '250', styleName: 'text-center', visible: false, editable: false },
    { fieldName: 'cntrCralTno2', width: '250', styleName: 'text-center', visible: false, editable: false },
    { fieldName: 'cntrCralTno3', width: '250', styleName: 'text-center', visible: false, editable: false },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.editOptions.editable = true;

  view.onCellEditable = (g, cell) => {
    const orgPrmReAplcYn = g.getValue(cell.itemIndex, 'orgPrmReAplcYn');
    if (orgPrmReAplcYn === 'N') {
      return true;
    }
    return false;
  };
});

</script>
