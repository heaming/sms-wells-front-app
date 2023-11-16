<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwfefFeeDeductionPresentStateListM - 수수료공제현황 (K-W-CO-U-0117M01)
3. 작성자 : jungsu.kim
4. 작성일 : 2023.05.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
수수료공제현황
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 실적년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <!--조직유형-->
        <kw-search-item
          :label="$t('MSG_TXT_OG_TP')"
        >
          <kw-option-group
            v-model="searchParams.ogTpCd"
            type="radio"
            :options="codes.OG_TP_CD.filter(
              (v) => v.codeId === 'W01' || v.codeId === 'W02' || v.codeId === 'W03'
            )"
          />
        </kw-search-item>
        <!-- 직책유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
        >
          <kw-select
            v-model="searchParams.rsbDvCd"
            :options="codes.RSB_DV_CD.filter(
              (v) => v.prtsCodeId === searchParams.ogTpCd
                && v.codeId != 'W0101'
                && v.codeId != 'W0102'
                && v.codeId != 'W0201'
                && v.codeId != 'W0202'
                && v.codeId != 'W0203'
            )"
            first-option="all"
            :label="$t('MSG_TXT_RSB_TP')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            clearable
            :on-click-icon="onClickSearchNo"
            :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevl1"
            v-model:og-levl-dv-cd2="searchParams.ogLevl2"
            v-model:og-levl-dv-cd3="searchParams.ogLevl3"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.perfYm"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          icon="download_on"
          secondary
          dense
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :page-size="20"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useMeta, modal, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

const { t } = useI18n();
const { currentRoute } = useRouter();
const dataService = useDataService();
const { getConfig } = useMeta();
const { getUserInfo } = useMeta();

// eslint-disable-next-line no-unused-vars
const userInfo = getUserInfo();
// eslint-disable-next-line no-unused-vars
const store = useStore();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'RSB_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchParams = ref({
  perfYm: now.format('YYYYMM'),
  ogTpCd: 'W02',
  rsbDvCd: '',
  ogLevl1: '',
  ogLevl2: '',
  ogLevl3: '',
  prtnrNo: '',
  prtnrKnm: '',
});

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
    }
  }
}

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const url = '/sms/wells/fee/fee-deduction-present-state/paging';

  const res = await dataService.get(url, { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.addRows(pages);
  data.checkRowStates(true);
}

async function onClickSearch() {
  const gridView = grdMainRef.value.getView();
  const level3NmHeader = gridView.columnByName('level3Nm').header;
  if (searchParams.value.ogTpCd === 'W01') {
    level3NmHeader.text = t('MSG_TXT_BUSINESS_DIVISION');
    gridView.columnByName('level2Nm').visible = true;
  } else if (searchParams.value.ogTpCd === 'W02') {
    level3NmHeader.text = t('MSG_TXT_RGNL_GRP');
    gridView.columnByName('level2Nm').visible = true;
  } else if (searchParams.value.ogTpCd === 'W03') {
    level3NmHeader.text = t('MSG_TXT_RGNL_GRP');
    gridView.columnByName('level2Nm').visible = false;
  }

  pageInfo.value.pageIndex = 1;
  grdMainRef.value.getData().clearRows();

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickExcelDownload() {
  const view2 = grdMainRef.value.getView();

  /* 백단(서비스) 엑셀 다운로드 */
  const res = await dataService.get('/sms/wells/fee/fee-deduction-present-state/excel-download', { params: cachedParams });

  await gridUtil.exportView(view2, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

function initGrid(data, view) {
  const fields = [
    { fieldName: 'level2Nm' },
    { fieldName: 'level3Nm' },
    { fieldName: 'level4Nm' },
    { fieldName: 'prtnrNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'rsbDvNm' },
    { fieldName: 'intbsAmt', dataType: 'number' },
    { fieldName: 'dsbOjAmt', dataType: 'number' },
    { fieldName: 'ddctam', dataType: 'number' },
    { fieldName: 'rdsTax', dataType: 'number' },

    { fieldName: 'einsr', dataType: 'number' },
    { fieldName: 'telPc', dataType: 'number' },
    { fieldName: 'redf', dataType: 'number' },
    { fieldName: 'dlqRedf', dataType: 'number' },
    { fieldName: 'pnpyam', dataType: 'number' },
    { fieldName: 'buDdtn', dataType: 'number' },
    { fieldName: 'mutuRedf', dataType: 'number' },
    { fieldName: 'inddInsr', dataType: 'number' },
    { fieldName: 'rdsBlam', dataType: 'number' },
    { fieldName: 'pnpyamBlam', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'level2Nm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '120', styleName: 'text-center' },
    { fieldName: 'level3Nm', header: t('MSG_TXT_RGNL_GRP'), width: '120', styleName: 'text-center' },
    { fieldName: 'level4Nm', header: t('MSG_TXT_BRANCH'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '100', styleName: 'text-center' },
    { fieldName: 'intbsAmt', header: t('MSG_TXT_DDTN_BF'), width: '120', styleName: 'text-right' },
    { fieldName: 'dsbOjAmt', header: t('MSG_TXT_DDTN_AFT'), width: '120', styleName: 'text-right' },
    { fieldName: 'ddctam', header: t('MSG_TXT_DDTN_SUM2'), width: '120', styleName: 'text-right' },
    { fieldName: 'rdsTax', header: t('MSG_TXT_RDS_TAX'), width: '120', styleName: 'text-right' },

    { fieldName: 'einsr', header: t('MSG_TXT_HIR_INSR'), width: '120', styleName: 'text-right' },
    { fieldName: 'telPc', header: t('MSG_TXT_TEL_PC'), width: '120', styleName: 'text-right' },
    { fieldName: 'redf', header: t('MSG_TXT_REDF'), width: '120', styleName: 'text-right' },
    { fieldName: 'dlqRedf', header: t('MSG_TXT_DLQ_REDF'), width: '120', styleName: 'text-right' },
    { fieldName: 'pnpyam', header: t('MSG_TXT_ETC_PNPYAM'), width: '120', styleName: 'text-right' },
    { fieldName: 'buDdtn', header: t('MSG_TXT_BU_DDTN'), width: '120', styleName: 'text-right' },
    { fieldName: 'mutuRedf', header: t('MSG_TXT_COEXT'), width: '120', styleName: 'text-right' },
    { fieldName: 'inddInsr', header: t('MSG_TXT_INDD_INSR'), width: '120', styleName: 'text-right' },
    { fieldName: 'rdsBlam', header: t('MSG_TXT_RDS_BLAM_THM'), width: '120', styleName: 'text-right' },
    { fieldName: 'pnpyamBlam', header: t('MSG_TXT_PNPYAM_BLAM_LSTMM'), width: '120', styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.setColumnLayout([
    'level2Nm',
    'level3Nm',
    'level4Nm',
    'prtnrNm',
    'prtnrNo',
    'rsbDvNm',
    {
      header: t('MSG_TXT_FEE_AMT'),
      direction: 'horizontal',
      items: ['intbsAmt', 'dsbOjAmt'],
    },
    'ddctam',
    {
      header: t('MSG_TXT_DDTN_DTLP_IZ'),
      direction: 'horizontal',
      items: ['rdsTax', 'einsr', 'telPc', 'redf', 'dlqRedf', 'pnpyam', 'buDdtn', 'mutuRedf', 'inddInsr'],
    },
    'rdsBlam',
    'pnpyamBlam',
  ]);

  /* 스크롤 페이징 */
  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };
}
</script>
<style scoped>
</style>
