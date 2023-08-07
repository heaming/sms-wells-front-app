<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : WwsnbBsOgProcsListM(K-W-SV-U-0238M01) - B/S 처리 현황(조직)
3. 작성자 : jaehunlee
4. 작성일 : 2023.07.31
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- B/S 처리 현황(조직) (http://localhost:3000/#/service/wwsnb-bs-og-procs-list)
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            rules="required"
            type="month"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_MNGT_DV')"
        >
          <kw-select
            v-model="searchParams.mngrDvCd"
            rules="required"
            :options="codes.MNGR_DV_CD"
            class="w140"
          />
          <kw-select
            v-model="searchParams.ogId"
            :options="ogCode"
            option-label="ogNm"
            option-value="ogId"
            first-option="all"
            class="w200"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            class="w140"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <h3>{{ $t('MSG_TXT_OG_MNGT') }}</h3>
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
        @init="initGrdMain"
      />
      <h3>{{ $t('MSG_TXT_CRDOVR_STAT') }}</h3>
      <kw-action-top>
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
        @init="initGrdMain2"
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
import { printElement } from '~common/utils/common';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const codes = await codeUtil.getMultiCodes(
  'MNGR_DV_CD',
  'PD_GRP_CD',
);

const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  mngrDvCd: '2',
  ogId: '',
  pdGrpCd: '',
});

const ogCode = ref([]);

const onChageMngrDvCd = async () => {
  const strmngrDvCd = searchParams.value.mngrDvCd;

  if (strmngrDvCd === '1') {
    const res = (await dataService.get('/sms/wells/service/organizations/general-division'));
    ogCode.value = res.data;
  } else if (strmngrDvCd === '2') {
    const res = (await dataService.get('/sms/wells/service/organizations/service-center'));
    ogCode.value = res.data;
  }
};

async function fetchData1() {
  const res = await dataService.get('/sms/wells/service/bs-organization-procs', { params: { ...cachedParams } });
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
}

async function fetchData2() {
  const res2 = await dataService.get('/sms/wells/service/bs-organization-procs/carried-over', { params: { ...cachedParams } });
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
  const res = await dataService.get('/sms/wells/service/bs-organization-procs', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickExcelDownload2() {
  const view = grdMainRef2.value.getView();
  const res = await dataService.get('/sms/wells/service/bs-organization-procs/carried-over', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

watch(() => searchParams.value.mngrDvCd, (val) => {
  if (searchParams.value.mngrDvCd !== val) {
    searchParams.value.mngrDvCd = val;
  }
  onChageMngrDvCd();
});

onMounted(() => {
  onChageMngrDvCd();
});

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'gb' },
    { fieldName: 'asgnCrdovrYCnt', dataType: 'number' },
    { fieldName: 'asgnCrdovrNCnt', dataType: 'number' },
    { fieldName: 'asgnTotalCnt', dataType: 'number' },
    { fieldName: 'compCrdovrYCnt', dataType: 'number' },
    { fieldName: 'compCrdovrNCnt', dataType: 'number' },
    { fieldName: 'compTotalCnt', dataType: 'number' },
    { fieldName: 'compRate' },
    { fieldName: 'comp01', dataType: 'number' },
    { fieldName: 'comp02', dataType: 'number' },
    { fieldName: 'comp03', dataType: 'number' },
    { fieldName: 'comp04', dataType: 'number' },
    { fieldName: 'comp05', dataType: 'number' },
    { fieldName: 'comp06', dataType: 'number' },
    { fieldName: 'comp07', dataType: 'number' },
    { fieldName: 'comp08', dataType: 'number' },
    { fieldName: 'comp09', dataType: 'number' },
    { fieldName: 'comp10', dataType: 'number' },
    { fieldName: 'comp11', dataType: 'number' },
    { fieldName: 'comp12', dataType: 'number' },
    { fieldName: 'comp13', dataType: 'number' },
    { fieldName: 'comp14', dataType: 'number' },
    { fieldName: 'comp15', dataType: 'number' },
    { fieldName: 'comp16', dataType: 'number' },
    { fieldName: 'comp17', dataType: 'number' },
    { fieldName: 'comp18', dataType: 'number' },
    { fieldName: 'comp19', dataType: 'number' },
    { fieldName: 'comp20', dataType: 'number' },
    { fieldName: 'comp21', dataType: 'number' },
    { fieldName: 'comp22', dataType: 'number' },
    { fieldName: 'comp23', dataType: 'number' },
    { fieldName: 'comp24', dataType: 'number' },
    { fieldName: 'comp25', dataType: 'number' },
    { fieldName: 'comp26', dataType: 'number' },
    { fieldName: 'comp27', dataType: 'number' },
    { fieldName: 'comp28', dataType: 'number' },
    { fieldName: 'comp29', dataType: 'number' },
    { fieldName: 'comp30', dataType: 'number' },
    { fieldName: 'comp31', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'ogNm',
      header: t('MSG_TXT_OG_NM'),
      width: '160',
      styleName: 'text-center',
      mergeRule: {
        criteria: 'value',
      } },
    { fieldName: 'gb', header: t('MSG_TXT_DIV'), width: '80', styleName: 'text-center' },
    { fieldName: 'asgnCrdovrYCnt', header: t('MSG_TXT_CRDOVR'), width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'asgnCrdovrNCnt', header: t('MSG_TXT_THM'), width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'asgnTotalCnt', header: t('MSG_TXT_AGG'), width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'compCrdovrYCnt', header: t('MSG_TXT_CRDOVR'), width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'compCrdovrNCnt', header: t('MSG_TXT_THM'), width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'compTotalCnt', header: t('MSG_TXT_AGG'), width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'compRate', header: t('MSG_TXT_PROCS_RT'), width: '110', styleName: 'text-right' },

    { fieldName: 'comp01', header: '1', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp02', header: '2', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp03', header: '3', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp04', header: '4', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp05', header: '5', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp06', header: '6', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp07', header: '7', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp08', header: '8', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp09', header: '9', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp10', header: '10', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp11', header: '11', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp12', header: '12', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp13', header: '13', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp14', header: '14', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp15', header: '15', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp16', header: '16', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp17', header: '17', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp18', header: '18', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp19', header: '19', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp20', header: '20', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp21', header: '21', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp22', header: '22', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp23', header: '23', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp24', header: '24', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp25', header: '25', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp26', header: '26', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp27', header: '27', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp28', header: '28', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp29', header: '29', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp30', header: '30', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'comp31', header: '31', width: '72', styleName: 'text-right', numberFormat: '#,##0' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout([
    'ogNm', // single
    'gb',
    {
      header: t('MSG_TXT_ASGN'),
      direction: 'horizontal',
      items: ['asgnCrdovrYCnt', 'asgnCrdovrNCnt', 'asgnTotalCnt'],
    },
    {
      header: t('MSG_TXT_PROC'),
      direction: 'horizontal',
      items: ['compCrdovrYCnt', 'compCrdovrNCnt', 'compTotalCnt'],
    },
    'compRate',
    {
      header: t('MSG_TXT_PROCS_PS'),
      direction: 'horizontal',
      items: ['comp01', 'comp02', 'comp03', 'comp04', 'comp05', 'comp06', 'comp07', 'comp08', 'comp09', 'comp10',
        'comp11', 'comp12', 'comp13', 'comp14', 'comp15', 'comp16', 'comp17', 'comp18', 'comp19', 'comp20',
        'comp21', 'comp22', 'comp23', 'comp24', 'comp25', 'comp26', 'comp27', 'comp28', 'comp29', 'comp30',
        'comp31'],
    },

  ]);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
}
function initGrdMain2(data, view) {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'gb' },
    { fieldName: 'vstPrgsStat' },
    { fieldName: 'crdovrTotal' },
    { fieldName: 'crdovr01', dataType: 'number' },
    { fieldName: 'crdovr02', dataType: 'number' },
    { fieldName: 'crdovr03', dataType: 'number' },
    { fieldName: 'crdovr04', dataType: 'number' },
    { fieldName: 'crdovr05', dataType: 'number' },
    { fieldName: 'crdovr06', dataType: 'number' },
    { fieldName: 'crdovr07', dataType: 'number' },
    { fieldName: 'crdovr08', dataType: 'number' },
    { fieldName: 'crdovr09', dataType: 'number' },
    { fieldName: 'crdovr10', dataType: 'number' },
    { fieldName: 'crdovr11', dataType: 'number' },
    { fieldName: 'crdovr12', dataType: 'number' },
    { fieldName: 'crdovr13', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'ogNm',
      header: t('MSG_TXT_OG_NM'),
      width: '160',
      styleName: 'text-center',
      mergeRule: {
        criteria: 'value',
      } },
    { fieldName: 'gb',
      header: '-',
      width: '80',
      styleName: 'text-center',
      mergeRule: {
        criteria: "values['ogNm']+value",
      } },
    { fieldName: 'vstPrgsStat', header: t('MSG_TXT_DIV'), width: '80', styleName: 'text-center' },
    { fieldName: 'crdovrTotal', header: t('MSG_TXT_TOT_SUM'), width: '86', styleName: 'text-right' },
    { fieldName: 'crdovr01', header: '1M', width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'crdovr02', header: '2M', width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'crdovr03', header: '3M', width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'crdovr04', header: '4M', width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'crdovr05', header: '5M', width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'crdovr06', header: '6M', width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'crdovr07', header: '7M', width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'crdovr08', header: '8M', width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'crdovr09', header: '9M', width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'crdovr10', header: '10M', width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'crdovr11', header: '11M', width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'crdovr12', header: '12M', width: '86', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'crdovr13', header: '13M↑', width: '86', styleName: 'text-right', numberFormat: '#,##0' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  // view.checkBar.visible = false;
  view.rowIndicator.visible = false;
}

</script>

<style scoped>
</style>
