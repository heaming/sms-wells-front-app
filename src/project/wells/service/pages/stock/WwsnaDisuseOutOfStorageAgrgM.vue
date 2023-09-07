<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaDisuseOutOfStorageAgrgM - 폐기출고집계현황(K-W-SV-U-0111M01)
3. 작성자 : jungheejin
4. 작성일 : 2023-08-14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 폐기출고집계현황 http://localhost:3000/#/service/wwsna-disuse-out-of-storage-agrg
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_CONF_DT')">
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_CONF_DT')"
            rules="date_range_required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          class="w250"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            class="w150"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_ITM_CD')">
          <kw-input
            v-model="searchParams.itmCdFrom"
            :max-length="50"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.itmCdTo"
            :max-length="50"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <wwsn-engineer-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.ogId"
          use-og-level="1"
          dgr1-levl-og-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          :use-partner="false"
        />
        <kw-search-item
          :label="$t('MSG_TXT_RTNGD_PROCS_TP')"
          class="w250"
        >
          <kw-select
            v-model="searchParams.rtngdProcsTpCd"
            :options="codes.RTNGD_PROCS_TP_CD.filter((v) => ['10', '11', '12','20','21','22'].includes(v.codeId))"
            first-option="all"
            class="w150"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_PD_GRD')"
          class="w280"
        >
          <kw-select
            v-model="searchParams.itmGdCd"
            :options="codes.PD_GD_CD.filter((v) => ['E', 'R', 'X'].includes(v.codeId))"
            first-option="all"
            class="w200"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_USE_SEL')">
          <kw-select
            v-model="searchParams.useYn"
            first-option="all"
            :options="codes.USE_YN"
            class="w170"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/disuse-out-of-storage-agrg';

const codes = await codeUtil.getMultiCodes(
  'PD_GD_CD',
  'ITM_KND_CD',
  'RTNGD_PROCS_TP_CD',
  'USE_YN',
);

const searchParams = ref({
  startDt: now.startOf('month').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  ogId: '',
  itmGdCd: '',
  rtngdProcsTpCd: '',
  itmCdFrom: '', // 품목코드 검색(시작)
  itmCdTo: '', // 품목코드 검색(종료)
  itmKndCd: '', // 품목구분
  useYn: '', // 사용여부
});
let cachedParams;
const totalCount = ref(0);
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}
onMounted(async () => {
  // 품목구분 : 상품 기본설정
  searchParams.value.itmKndCd = '4';
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'asMatItmGrpNm' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'asSplUnitAmt', dataType: 'number' },
    { fieldName: 'itemGdESum', dataType: 'number' },
    { fieldName: 'itemGdECostSum', dataType: 'number' },
    { fieldName: 'itemGdRSum', dataType: 'number' },
    { fieldName: 'itemGdRCostSum', dataType: 'number' },
    { fieldName: 'itemGdXSum', dataType: 'number' },
    { fieldName: 'itemGdXCostSum', dataType: 'number' },
    { fieldName: 'itemGdSum', dataType: 'number' },
    { fieldName: 'itemGdCostSum', dataType: 'number' },
    { fieldName: 'etcInstSum', dataType: 'number' },
    { fieldName: 'leaseSum', dataType: 'number' },
    { fieldName: 'etcLeaseSum', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'asMatItmGrpNm', header: t('MSG_TXT_PD_GRP'), width: '150', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '170', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '150' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '260', styleName: 'text-center' },
    { fieldName: 'asSplUnitAmt', header: t('MSG_TXT_DSCD_UPRC'), width: '120', styleName: 'text-right' },
    {
      fieldName: 'itemGdESum',
      header: t('MSG_TXT_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'itemGdECostSum',
      header: t('MSG_TXT_DSCD_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'itemGdRSum',
      header: t('MSG_TXT_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'itemGdRCostSum',
      header: t('MSG_TXT_DSCD_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },

    },
    {
      fieldName: 'itemGdXSum',
      header: t('MSG_TXT_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'itemGdXCostSum',
      header: t('MSG_TXT_DSCD_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'itemGdSum',
      header: t('MSG_TXT_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'itemGdCostSum',
      header: t('MSG_TXT_DSCD_AMT'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'etcInstSum',
      header: t('MSG_TXT_CO_IST'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    {
      fieldName: 'leaseSum',
      header: t('MSG_TXT_FNN_LEASE'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
    {
      fieldName: 'etcLeaseSum',
      header: t('MSG_TXT_COMPANY_FNN'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
    },
  ];
  const columnLayout = [
    'asMatItmGrpNm', 'sapMatCd', 'pdCd', 'pdNm', 'asSplUnitAmt', // single
    {
      header: t('MSG_TXT_EGD'), // colspan title
      direction: 'horizontal', // merge type
      items: ['itemGdESum', 'itemGdECostSum'],
    },
    {
      header: t('MSG_TXT_RGD'),
      direction: 'horizontal',
      items: ['itemGdRSum', 'itemGdRCostSum'],
    },
    {
      header: t('MSG_TXT_XGD'),
      direction: 'horizontal',
      items: ['itemGdXSum', 'itemGdXCostSum'],
    },
    {
      header: t('MSG_TXT_TOT_SUM'),
      direction: 'horizontal',
      items: ['itemGdSum', 'itemGdCostSum'],
    },
    'etcInstSum', 'leaseSum', 'etcLeaseSum',
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.columnByName('pdCd').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-center text-weight-bold' });
  view.setFooters({ visible: true, items: [{ height: 30 }] });
  view.setFixedOptions({ colCount: 5, resizable: true });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.groupBy(['asMatItmGrpNm']);
  view.setRowGroup({ mergeMode: true });
  view.layoutByColumn('sapMatCd').groupFooterUserSpans = [{ colspan: 4 }];
  view.columnByName('sapMatCd').setGroupFooters({ text: t('MSG_TXT_SBSUM'), styleName: 'text-center' });
});
</script>
