<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbBsContactVisitPsAgrgM (K-W-SV-U-0288M01)- B/S 컨택방문현황 집계
3. 작성자 : jungheejin
4. 작성일 : 2023-09-26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- B/S 컨택방문현황 집계  http://localhost:3000/#/service/wwsnb-bs-contact-visit-ps-agrg
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_PERF_YM')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_MNGT_DV')">
          <kw-select
            v-model="searchParams.mngrDvCd"
            :label="$t('MSG_TXT_MNGT_DV')"
            :options="codes.MNGR_DV_CD.filter((v) => ['1'].includes(v.codeId))"
            readonly
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <wwsn-manager-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
          v-model:dgr2-levl-og-id="searchParams.dgr2LevlOgId"
          v-model:dgr3-levl-og-id="searchParams.dgr3LevlOgId"
          v-model:prtnr-no="searchParams.prtnrNo"
          use-og-level="3"
          use-partner
          dgr1-levl-og-first-option="all"
          dgr2-levl-og-first-option="all"
          dgr3-levl-og-first-option="all"
          partner-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          dgr2-levl-og-label="ogCdNm"
          dgr3-levl-og-label="ogCdNm"
          partner-label="prtnrNoNm"
        />
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
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/bs-contact-visit-ps-agrg';

const codes = await codeUtil.getMultiCodes(
  'MNGR_DV_CD',
);

const searchParams = ref({
  perfYm: now.format('YYYYMM'),
  mngrDvCd: '1',
  prtnrNo: '',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
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
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '140', styleName: 'text-center' }, // 총괄단
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '140', styleName: 'text-center' }, // 지역단
    {
      fieldName: 'npPtrmTcnt',
      header: t('MSG_TXT_CRDOVR'), // 이월
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'thmAsnTcnt',
      header: t('MSG_TXT_THM'), // 당월
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'asnTcnt',
      header: t('MSG_TXT_SUM'), // 합계
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'ncttTcnt',
      header: t('MSG_TXT_NOT_CTT'), // 미컨택
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'cttFshTcnt',
      header: t('MSG_TXT_CTT_FSH'), // 컨택완료
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'cttFshRat',
      header: `${t('MSG_TXT_CTT_RAT')}(%)`, // 컨택율
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.#',
      footer: {
        numberFormat: '#,##0.#',
        styleName: 'text-right',
        valueCallback(grid) {
          const itemCount = grid.getItemCount();
          if (itemCount === 0) { return; }
          // ROUND( ( (서비스 컨택 완료) / 배정 총합계 )* 100,2)
          const cttFshTcntSum = grid.getSummary('cttFshTcnt', 'sum'); // 서비스 컨택 완료 합계
          const asnTcntSum = grid.getSummary('asnTcnt', 'sum'); // 배정 총합계
          const totalSum = (cttFshTcntSum / asnTcntSum) * 100;
          const cttFshRat = (Math.round(totalSum * 100) / 100);
          return Number.isNaN(cttFshRat) ? 0 : cttFshRat;
        },
      },
      groupFooter: {
        numberFormat: '#,##0.#',
        styleName: 'text-right',
        valueCallback(grid, column, groupFooterIndex, group) {
          const itemCount = grid.getItemCount();
          if (itemCount === 0) { return; }
          const cttFshTcntSum = grid.getGroupSummary(group, 'cttFshTcnt').sum; // 서비스 컨택 완료 합계
          const asnTcntSum = grid.getGroupSummary(group, 'asnTcnt').sum; // 배정 총합계
          const totalSum = (cttFshTcntSum / asnTcntSum) * 100;
          const cttFshRat = (Math.round(totalSum * 100) / 100);
          return Number.isNaN(cttFshRat) ? 0 : cttFshRat;
        },
      },
    },
    {
      fieldName: 'npPtrmWrkTcnt',
      header: t('MSG_TXT_CRDOVR'), // 이월
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'thmAsnWrkTcnt',
      header: t('MSG_TXT_THM'), // 당월
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'asnFshTcnt',
      header: t('MSG_TXT_SUM'), // 합계
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'asnFshRat',
      header: `${t('MSG_TXT_PROCS_RT')}(%)`, // 처리율
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.#',
      footer: {
        numberFormat: '#,##0.#',
        styleName: 'text-right',
        valueCallback(grid) {
          const itemCount = grid.getItemCount();
          if (itemCount === 0) { return; }
          // ROUND( ( (방문완료) / 배정 총합계 )* 100,2)
          const asnFshTcntSum = grid.getSummary('asnFshTcnt', 'sum'); // 방문완료 합계
          const asnTcntSum = grid.getSummary('asnTcnt', 'sum'); // 배정 총합계
          const totalSum = (asnFshTcntSum / asnTcntSum) * 100;
          const asnFshRt = (Math.round(totalSum * 100) / 100);
          return Number.isNaN(asnFshRt) ? 0 : asnFshRt;
        },
      },
      groupFooter: {
        numberFormat: '#,##0.#',
        styleName: 'text-right',
        valueCallback(grid, column, groupFooterIndex, group) {
          const itemCount = grid.getItemCount();
          if (itemCount === 0) { return; }
          const asnFshTcntSum = grid.getGroupSummary(group, 'asnFshTcnt').sum; // 방문완료 합계
          const asnTcntSum = grid.getGroupSummary(group, 'asnTcnt').sum; // 배정 총합계
          const totalSum = (asnFshTcntSum / asnTcntSum) * 100;
          const asnFshRt = (Math.round(totalSum * 100) / 100);
          return Number.isNaN(asnFshRt) ? 0 : asnFshRt;
        },
      },
    },
    {
      fieldName: 'npPtrm1Tcnt',
      header: `1${t('MSG_TXT_MCNT')}`, // 이월기간 1개월
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'npPtrm2Tcnt',
      header: `2${t('MSG_TXT_MCNT')}`, // 이월기간 2개월
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
  ];
  const columnLayout = [
    'dgr1LevlOgNm', 'dgr2LevlOgNm',
    {
      header: t('MSG_BTN_ASGN'), // 배정
      direction: 'horizontal',
      items: ['npPtrmTcnt', 'thmAsnTcnt', 'asnTcnt'],
    },
    {
      header: t('MSG_TXT_CTT'), // 컨택
      direction: 'horizontal',
      items: ['ncttTcnt', 'cttFshTcnt', 'cttFshRat'],
    },
    {
      header: t('MSG_TXT_CMPLTD'), // 방문완료
      direction: 'horizontal',
      items: ['npPtrmWrkTcnt', 'thmAsnWrkTcnt', 'asnFshTcnt', 'asnFshRat'],
    },
    {
      header: t('MSG_TXT_CRDOVR_PRD'), // 이월기간
      direction: 'horizontal',
      items: ['npPtrm1Tcnt', 'npPtrm2Tcnt'],
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.setFooters({ visible: true, items: [{ height: 30 }] });
  view.columnByName('dgr1LevlOgNm').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-right text-weight-bold' }); // 합계
  view.groupBy(['dgr1LevlOgNm']); // 그룹키
  view.columnByName('dgr1LevlOgNm').setGroupFooters({ text: t('MSG_TXT_SBSUM'), styleName: 'text-right' }); // 그룹 소계
  view.layoutByColumn('dgr1LevlOgNm').groupFooterUserSpans = [{ colspan: 1 }];
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
