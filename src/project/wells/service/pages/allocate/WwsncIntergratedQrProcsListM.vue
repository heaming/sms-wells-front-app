<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : WwsncIntergratedQrProcsListM(K-W-SV-U-0239M01) - 통합QR 처리현황
3. 작성자 : jaehunlee
4. 작성일 : 2023.08.23
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- 통합QR 처리현황 (http://localhost:3000/#/service/wwsnc-intergrated-qr-procs-list
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_DV')"
        >
          <kw-select
            v-model="searchParams.mngrDvCd"
            rules="required"
            :options="codes.MNGR_DV_CD"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_PRCSDT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.baseDateFrom"
            v-model:to="searchParams.baseDateTo"
            rules="date_range_months:1"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row
        v-if="searchCase1"
      >
        <wwsn-manager-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
          v-model:dgr2-levl-og-id="searchParams.dgr2LevlOgId"
          use-og-level="2"
          :use-partner="false"
          dgr1-levl-og-label="ogCdNm"
          dgr2-levl-og-label="ogCdNm"
          dgr1-levl-og-first-option="all"
          dgr2-levl-og-first-option="all"
        />
      </kw-search-row>
      <kw-search-row
        v-if="searchCase2"
      >
        <kw-search-item
          :label="$t('MSG_TXT_SV_CNR')"
        >
          <kw-select
            v-model="searchParams.svOgId"
            :options="ogCode"
            :disable="searchParams.mngrDvCd === '1'"
            option-label="ogNm"
            option-value="ogId"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ $t('MSG_TXT_BY_ORG_AGG') }}</h3>
      <kw-action-top>
        <kw-btn
          icon="print"
          dense
          secondary
          :label="t('MSG_BTN_PRTG')"
          @click="onClickPrintEl"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload1"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        @init="initGrid"
      />
      <h3>{{ $t('MSG_TXT_ORG_DTL_AGG') }}</h3>
      <kw-action-top>
        <kw-btn
          icon="print"
          dense
          secondary
          :label="t('MSG_BTN_PRTG')"
          @click="onClickPrintEl"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload2"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef2"
        @init="initGrid2"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, getComponentType, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';
import { cloneDeep } from 'lodash-es';
import { printElement } from '~common/utils/common';

const now = dayjs();
const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));
const { t } = useI18n();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const codes = await codeUtil.getMultiCodes(
  'MNGR_DV_CD',
);

const searchParams = ref({
  mngrDvCd: '1',
  baseDateFrom: `${now.format('YYYYMM')}01`,
  baseDateTo: now.format('YYYYMMDD'),
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  svOgId: '',
});

const searchCase1 = computed(() => searchParams.value.mngrDvCd === '1'); // 매니저
const searchCase2 = computed(() => searchParams.value.mngrDvCd === '2'); // 엔지니어

const ogCode = ref([]);

async function fetchServiceCenterOgId() {
  const res = (await dataService.get('/sms/wells/service/organizations/service-center'));
  ogCode.value = res.data;
}

async function fetchData1() {
  const res = await dataService.get('/sms/wells/service/intergrated-qr-procs', { params: { ...cachedParams } });
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
}

async function fetchData2() {
  const res2 = await dataService.get('/sms/wells/service/intergrated-qr-procs/organization-detail', { params: { ...cachedParams } });
  const view2 = grdMainRef2.value.getView();
  view2.getDataSource().setRows(res2.data);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData1();
  await fetchData2();
}

async function onClickExcelDownload1() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/intergrated-qr-procs', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickExcelDownload2() {
  const view = grdMainRef2.value.getView();
  const res = await dataService.get('/sms/wells/service/intergrated-qr-procs/organization-detail', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}

const onChageMngrDvCd = async () => {
  const strmngrDvCd = searchParams.value.mngrDvCd;

  if (strmngrDvCd === '1') {
    searchParams.value.svOgId = '';
    return '1';
  }

  if (strmngrDvCd === '2') {
    searchParams.value.dgr1LevlOgId = '';
    searchParams.value.dgr2LevlOgId = '';
    return '2';
  }
};

onMounted(() => {
  fetchServiceCenterOgId();
});

watch(() => searchParams.value.mngrDvCd, (val) => {
  if (searchParams.value.mngrDvCd !== val) {
    searchParams.value.mngrDvCd = val;
  }
  onChageMngrDvCd();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'dgr1LevlOgNm' },
    { fieldName: 'dgr2LevlOgNm' },
    { fieldName: 'dgr2LevlDgPrtnrNm' },
    { fieldName: 'bmNm' },
    { fieldName: 'bsCmpltd', dataType: 'number' },
    { fieldName: 'itgQrTrgt', dataType: 'number' },
    { fieldName: 'itgQrCmpltd', dataType: 'number' },
    { fieldName: 'nrmQrTrgt', dataType: 'number' },
    { fieldName: 'nrmQrCmpltd', dataType: 'number' },
    { fieldName: 'qrTrgt', dataType: 'number' },
    { fieldName: 'qrCmpltd', dataType: 'number' },
    { fieldName: 'attachRate', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '100', styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgNm',
      header: t('MSG_TXT_RGNL_GRP'),
      width: '100',
      styleName: 'text-center',
      footer: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-right',
      } },
    { fieldName: 'dgr2LevlDgPrtnrNm', header: t('MSG_TXT_REG_DIR'), width: '100', styleName: 'text-center' },
    { fieldName: 'bmNm', header: t('MSG_TXT_BM') + t('MSG_TXT_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'bsCmpltd',
      header: t('MSG_TXT_BS_FSH'),
      width: '150',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'itgQrTrgt',
      header: t('MSG_TXT_UNIFY_QR_TARGET'),
      width: '150',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'itgQrCmpltd',
      header: t('MSG_TXT_UNIFY_QR_CMPLTD'),
      width: '150',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'nrmQrTrgt',
      header: t('MSG_TXT_NRM_QR_TARGET'),
      width: '150',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'nrmQrCmpltd',
      header: t('MSG_TXT_NRM_QR_CMPLTD'),
      width: '150',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'qrTrgt',
      header: t('MSG_TXT_QR_TARGET'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'qrCmpltd',
      header: t('MSG_TXT_QR_CMPLTD'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'attachRate',
      header: t('MSG_TXT_STICK_RT'),
      width: '145',
      styleName: 'text-right',
      numberFormat: '#,##0.00;;;f',
      footer: {
        expression: 'avg',
        styleName: 'text-right',
        numberFormat: '#,##0.00;;;f',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          let sum2 = 0;

          sum = grid.getSummary('qrCmpltd', 'sum');
          sum2 = grid.getSummary('bsCmpltd', 'sum');

          return (sum / sum2) * 100;
        },
      } },
  ];

  view.setColumnLayout([
    'dgr1LevlOgNm',
    'dgr2LevlOgNm',
    'dgr2LevlDgPrtnrNm',
    'bmNm',
    'bsCmpltd',
    'itgQrTrgt',
    'itgQrCmpltd',
    'nrmQrTrgt',
    'nrmQrCmpltd',
    'qrTrgt',
    'qrCmpltd',
    'attachRate',
  ]);
  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.setOptions({ summaryMode: 'aggregate' });
  view.setFooters({ visible: true });
}

function initGrid2(data, view) {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrNm' },
    { fieldName: 'bldNm' },
    { fieldName: 'bsCmpltd', dataType: 'number' },
    { fieldName: 'itgQrTrgt', dataType: 'number' },
    { fieldName: 'itgQrCmpltd', dataType: 'number' },
    { fieldName: 'nrmQrTrgt', dataType: 'number' },
    { fieldName: 'nrmQrCmpltd', dataType: 'number' },
    { fieldName: 'qrTrgt', dataType: 'number' },
    { fieldName: 'qrCmpltd', dataType: 'number' },
    { fieldName: 'attachRate', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_CNT_PER'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNm',
      header: t('MSG_TXT_PIC_NM'),
      width: '100',
      styleName: 'text-center',
      footer: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-left',
      } },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'bsCmpltd',
      header: t('MSG_TXT_BS_FSH'),
      width: '150',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'itgQrTrgt',
      header: t('MSG_TXT_UNIFY_QR_TARGET'),
      width: '150',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'itgQrCmpltd',
      header: t('MSG_TXT_UNIFY_QR_CMPLTD'),
      width: '150',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'nrmQrTrgt',
      header: t('MSG_TXT_NRM_QR_TARGET'),
      width: '150',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'nrmQrCmpltd',
      header: t('MSG_TXT_NRM_QR_CMPLTD'),
      width: '150',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'qrTrgt',
      header: t('MSG_TXT_QR_TARGET'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'qrCmpltd',
      header: t('MSG_TXT_QR_CMPLTD'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        styleName: 'text-right',
        numberFormat: '#,##0',
      } },
    { fieldName: 'attachRate',
      header: t('MSG_TXT_STICK_RT'),
      width: '145',
      styleName: 'text-right',
      numberFormat: '#,##0.00;;;f',
      footer: {
        expression: 'avg',
        styleName: 'text-right',
        numberFormat: '#,##0.00;;;f',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          let sum2 = 0;

          sum = grid.getSummary('qrCmpltd', 'sum');
          sum2 = grid.getSummary('bsCmpltd', 'sum');

          return (sum / sum2) * 100;
        },
      } },
  ];

  view.setColumnLayout([
    'ogNm',
    'prtnrNo',
    'prtnrNm',
    'bldNm',
    'bsCmpltd',
    'itgQrTrgt',
    'itgQrCmpltd',
    'nrmQrTrgt',
    'nrmQrCmpltd',
    'qrTrgt',
    'qrCmpltd',
    'attachRate',
  ]);

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.setOptions({ summaryMode: 'aggregate' });
  view.setFooters({ visible: true });
}
</script>

<style scoped>
</style>
