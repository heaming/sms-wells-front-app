<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (방문관리)
2. 프로그램 ID : WwsnaReturningGoodsUseMcntAgrgM - 반품 사용개월별 집계(K-W-SV-U-0002M01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-07-21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 출고집계현황 http://localhost:3000/#/service/wsna-returning-goods-use-mcnt-agrg
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!--상품등급-->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRD')"
        >
          <kw-select
            v-model="searchParams.itmGdCd"
            :options="codes.LGST_ITM_GD_CD"
            first-option
            first-option-value
            :first-option-label="$t('MSG_TXT_ALL')"
          />
        </kw-search-item>
        <!--작업일자-->
        <kw-search-item
          :colspan="1"
          :label="$t('MSG_TXT_WK_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_AK_DT')"
            rules="date_range_required"
          />
        </kw-search-item>
        <!--업무유형-->
        <kw-search-item
          :label="$t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.svBizDclsfCd"
            :options="customCodes.svBizDclsfCd"
            first-option
            first-option-value
            :first-option-label="$t('MSG_TXT_ALL')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!--서비스센터-->
        <wwsn-engineer-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.serviceCenter"
          v-model:prtnr-no="searchParams.engineerCd"
          use-og-level="1"
          use-partner
          dgr1-levl-og-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          partner-first-option="all"
          partner-label="prtnrNoNm"
          auth-yn="N"
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
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
          @click="onClickPrint"
        />
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

import { getComponentType, defineGrid, gridUtil, useDataService, useGlobal, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { notify } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/returning-goods-use-mcnt-agrg';

const codes = await codeUtil.getMultiCodes(
  'LGST_ITM_GD_CD',
);

const customCodes = {
  svBizDclsfCd: [
    { codeId: '3420', codeName: t('MSG_TXT_SL_CAN') },
    { codeId: '3410', codeName: t('MSG_TXT_PD_CAN') },
    { codeId: '32XX', codeName: t('MSG_TXT_PDCT_CHNG_CAUS') },
  ],
};

const searchParams = ref({
  itmGdCd: '', /* 상품등급 */
  startDt: now.format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  serviceCenter: '', /* 서비스센터 */
  svBizDclsfCd: '', /* 업무유형 */
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
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}
async function onClickPrint() {
  // TODO : 출력 기능 연결
  notify(t('TODO : 출력기능?'));
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'useMcn1', dataType: 'number' },
    { fieldName: 'useMcn2', dataType: 'number' },
    { fieldName: 'useMcn36', dataType: 'number' },
    { fieldName: 'useMcn712', dataType: 'number' },
    { fieldName: 'useMcn1324', dataType: 'number' },
    { fieldName: 'useMcn2536', dataType: 'number' },
    { fieldName: 'useMcn3748', dataType: 'number' },
    { fieldName: 'useMcn4960', dataType: 'number' },
    { fieldName: 'useMcn6172', dataType: 'number' },
    { fieldName: 'useMcn7384', dataType: 'number' },
    { fieldName: 'useMcn85', dataType: 'number' },
    { fieldName: 'useMcnT', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'sapMatCd',
      header: t('MSG_TXT_SAPCD'),
      width: '130',
      footer: {
        styleName: 'text-center',
      } },
    { fieldName: 'pdCd',
      header: t('MSG_TXT_ITM_CD'),
      width: '90',
      footer: {
        styleName: 'text-center',
      } },
    { fieldName: 'pdNm',
      header: t('MSG_TXT_ITM_NM'),
      width: '200',
      footer: {
        styleName: 'text-left',
      } },
    { fieldName: 'useMcn1',
      header: '1',
      width: '50',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'useMcn2',
      header: '2',
      width: '50',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'useMcn36',
      header: '3~6',
      width: '50',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'useMcn712',
      header: '7~12',
      width: '50',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'useMcn1324',
      header: '13~24',
      width: '50',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'useMcn2536',
      header: '25~36',
      width: '50',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'useMcn3748',
      header: '37~48',
      width: '50',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'useMcn4960',
      header: '49~60',
      width: '50',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'useMcn6172',
      header: '61~72',
      width: '50',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'useMcn7384',
      header: '73~84',
      width: '50',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'useMcn85',
      header: '85~',
      width: '50',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'useMcnT',
      header: t('MSG_TXT_SUM'),
      width: '50',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true, items: [{ height: 30 }] });
  view.columnByName('pdCd').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
