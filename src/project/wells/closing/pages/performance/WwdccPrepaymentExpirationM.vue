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
                rules="date_range_required|date_range_months:1"
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
                :options="codes.COD_YN"
                option-label="codeId"
                first-option="all"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_CNCL_YN')"
            >
              <kw-select
                v-model="searchParams.canYn"
                :options="codes.COD_YN"
                option-label="codeId"
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
                :options="codes.COD_YN"
                option-label="codeId"
                first-option="all"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info
                v-model:page-index="pageInfoObjectPresentState.pageIndex"
                v-model:page-size="pageInfoObjectPresentState.pageSize"
                :total-count="pageInfoObjectPresentState.totalCount"
                :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
                @change="fetchObjectPresentState"
              />
              <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
            </template>
            <kw-btn
              icon="download_on"
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              secondary
              dense
              :disable="pageInfoObjectPresentState.totalCount === 0"
              @click="onClickObjectPresentStateExcelDownload"
            />
            <kw-separator
              vertical
              inset
              spaced
            />
            <kw-btn
              :label="$t('MSG_BTN_CHAR_FW_ULD_MMT')"
              primary
              dense
              @click="onClickCharacterFwUld"
            />
          </kw-action-top>

          <kw-grid
            ref="grdObjectPresentStateRef"
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
                v-model:page-index="pageInfoCharacterFwUld.pageIndex"
                v-model:page-size="pageInfoCharacterFwUld.pageSize"
                :total-count="pageInfoCharacterFwUld.totalCount"
                :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
                @change="fetchCharacterFwUld"
              />
              <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
            </template>
            <kw-btn
              dense
              grid-action
              :label="$t('MSG_BTN_DEL')"
            />
            <kw-btn
              dense
              grid-action
              :label="$t('MSG_BTN_SAVE')"
            />
            <kw-separator
              spaced
              vertical
              inset
            />
            <kw-btn
              icon="download_on"
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              secondary
              dense
              :disable="pageInfoCharacterFwUld.totalCount === 0"
              @click="onClickCharacterFwUldExcelDownload"
            />
            <kw-separator
              spaced="16px"
              vertical
              inset
            />
            <kw-date-picker
              class="w170"
              dense
            />
            <kw-time-picker
              class="w170"
              dense
            />
            <kw-btn
              primary
              dense
              :label="$t('MSG_BTN_BOO_FW_PRTC')"
            />
          </kw-action-top>
          <kw-grid
            ref="grdCharacterFwUldRef"
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
import { defineGrid, getComponentType, useDataService, codeUtil, useMeta, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import WwdccPrepaymentExpirationMCharacterFwIz from './WwdccPrepaymentExpirationMCharacterFwIz.vue';

const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { getUserInfo } = useMeta();
const userInfo = getUserInfo();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectedTab = ref('tab1');

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
  dpStDt: `${dayjs().format('YYYYMM')}`,
  dpEdDt: `${dayjs().format('YYYYMM')}`,
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
  ogTpCd: userInfo.ogTpCd, // 조직유형
  baseYm: dayjs().format('YYYYMM'),
});

const pageInfoObjectPresentState = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const pageInfoCharacterFwUld = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function onClickObjectPresentStateExcelDownload() {
  const view = grdObjectPresentStateRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/performance/prepayment-expiration/object-present-state/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickCharacterFwUldExcelDownload() {
  const view = grdCharacterFwUldRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/performance/prepayment-expiration/character-fw-uld/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function fetchObjectPresentState() {
  const res = await dataService.get('/sms/wells/closing/performance/prepayment-expiration/object-present-state/paging', { params: { ...cachedParams, ...pageInfoObjectPresentState.value, timeout: 300000 } });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfoObjectPresentState.value = pagingResult;

  const view = grdObjectPresentStateRef.value.getView();
  view.getDataSource().setRows(pages);
}

async function fetchCharacterFwUld() {
  const res = await dataService.get('/sms/wells/closing/performance/prepayment-expiration/character-fw-uld/paging', { params: { ...cachedParams, ...pageInfoCharacterFwUld.value, timeout: 300000 } });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfoCharacterFwUld.value = pagingResult;

  const view = grdCharacterFwUldRef.value.getView();
  view.getDataSource().setRows(pages);
}

async function onClickObjectPresentStateSearch() {
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
    { fieldName: 'cntrNo' },
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
    { fieldName: 'prmExcpt' },
    { fieldName: 'cntrLocalTno' },
    { fieldName: 'cntrCralTno' },
    { fieldName: 'rcgvpLocalTno' },
    { fieldName: 'rcgvpCralTno' },
    { fieldName: 'dpClDt' },
    { fieldName: 'dpTpCdNm' },
    { fieldName: 'dpAmt', dataType: 'number' },
    { fieldName: 'ogCd' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'sellPrtnrNo' },
    { fieldName: 'cltnDt' },
    { fieldName: 'prtnrLocalTno' },
    { fieldName: 'prtnrCralTno' },
    { fieldName: 'hooPrtnrNm' },
    { fieldName: 'hooPrtnrNo' },
    { fieldName: 'hooPrtnrCltnDt' },
    { fieldName: 'ogLocalTno' },
    { fieldName: 'hooPrtnrCralTno' },
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '140', styleName: 'text-left' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_IST_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '140', styleName: 'text-left' },
    { fieldName: 'rentalTn', header: t('MSG_TXT_RNTL_SN'), width: '100', styleName: 'text-right' },
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FNT_DT'), width: '100', styleName: 'text-right' },
    { fieldName: 'lcsleDt', header: t('MSG_TXT_SL_DT'), width: '140', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrCanDt', header: t('MSG_TXT_CANC_DT'), width: '140', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'prmMcn', header: t('MSG_TXT_PRM_MCNT'), width: '100', styleName: 'text-right' },
    { fieldName: 'prmDscr', header: t('MSG_TXT_PRM_DSC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'prmPeriod', header: t('MSG_TXT_PRM_PTRM'), width: '200', styleName: 'text-center' },
    { fieldName: 'totPrmAmt', header: t('MSG_TXT_PRM_TAM'), width: '100', styleName: 'text-center', numberFormat: '#,##0' },
    { fieldName: 'prmExcpt', header: t('MSG_TXT_PRM_EXCD'), width: '100', styleName: 'text-right' },
    { fieldName: 'cntrLocalTno',
      header: t('MSG_TXT_CNTRT_TNO2'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrLocalTno1: no1, cntrLocalTno2: no2, cntrLocalTno3: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    { fieldName: 'cntrCralTno',
      header: t('MSG_TXT_CNTRT_MPNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrCralTno1: no1, cntrCralTno2: no2, cntrCralTno3: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    { fieldName: 'rcgvpLocalTno',
      header: t('MSG_TXT_ISTLL_TNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { rcgvpLocalTno1: no1, rcgvpLocalTno2: no2, rcgvpLocalTno3: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    { fieldName: 'rcgvpCralTno',
      header: t('MSG_TXT_ISTLL_MPNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { rcgvpCralTno1: no1, rcgvpCralTno2: no2, rcgvpCralTno3: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    { fieldName: 'dpClDt', header: t('MSG_TXT_DP_DT'), width: '140', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'dpTpCdNm', header: t('MSG_TXT_DP_TP'), width: '140', styleName: 'text-left' },
    { fieldName: 'dpAmt', header: t('MSG_TXT_DEPOSIT_AMT'), width: '140', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_PRTNR_NUM'), width: '100', styleName: 'text-center' },
    { fieldName: 'cltnDt', header: t('MSG_TXT_BIZ_CLTN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrLocalTno',
      header: t('MSG_TXT_TEL_NO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { prtnrLocalTno1: no1, prtnrLocalTno2: no2, prtnrLocalTno3: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    { fieldName: 'prtnrCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { prtnrCralTno1: no1, prtnrCralTno2: no2, prtnrCralTno3: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    { fieldName: 'hooPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'hooPrtnrNo', header: t('MSG_TXT_PRTNR_NUM'), width: '100', styleName: 'text-center' },
    { fieldName: 'hooPrtnrCltnDt', header: t('MSG_TXT_BRMGR_CLTN_D'), width: '100', styleName: 'text-left' },
    { fieldName: 'ogLocalTno',
      header: t('MSG_TXT_BRCH_TNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { ogLocalTno1: no1, ogLocalTno2: no2, ogLocalTno3: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    { fieldName: 'hooPrtnrCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { hooPrtnrCralTno1: no1, hooPrtnrCralTno2: no2, hooPrtnrCralTno3: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'cntrNo', 'cstKnm', 'rcgvpKnm', 'pdNm', 'rentalTn',
    'mpyBsdt', 'lcsleDt', 'cntrCanDt', 'prmMcn', 'prmDscr',
    'prmPeriod', 'totPrmAmt', 'prmExcpt', 'cntrLocalTno', 'cntrCralTno',
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
    { fieldName: 'cstKnm' },
    { fieldName: 'cntrCralTno' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrInfo' },
    { fieldName: 'prmEndYm' },
    { fieldName: 'mmpmYm' },
    { fieldName: 'prmReAplcYn' },

  ];

  const columns = [
    { fieldName: 'cstKnm', header: '고객명(계약자)', width: '200', styleName: 'text-left' },
    { fieldName: 'cntrCralTno',
      header: '계약자 휴대전화번호',
      width: '250',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrCralTno1: no1, cntrCralTno2: no2, cntrCralTno3: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    { fieldName: 'cntrNo', header: '계약번호', width: '250', styleName: 'text-center' },
    { fieldName: 'cntrInfo', header: '상품정보', width: '249', styleName: 'text-left' },
    { fieldName: 'prmEndYm', header: '선납만료년월', width: '250', styleName: 'text-center' },
    { fieldName: 'mmpmYm', header: '월납시작년월', width: '250', styleName: 'text-center' },
    { fieldName: 'prmReAplcYn', header: '발송대상', width: '200', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

</script>
