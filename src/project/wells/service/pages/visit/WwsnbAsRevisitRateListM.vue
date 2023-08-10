<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : WwsnbAsRevisitRateListM(K-W-SV-U-0100M01) - A/S재방문율
3. 작성자 : jaehunlee
4. 작성일 : 2023.07.26
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- A/S재방문율 (http://localhost:3000/#/service/wwsnb-as-revisit-rate-list)
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
          :label="$t('MSG_TXT_SRCH_DT')"
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.baseDateFrom"
            v-model:to="searchParams.baseDateTo"
            rules="date_range_months:1"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SV_CNR')"
        >
          <kw-select
            v-model="searchParams.ogId"
            :options="serviceCenter"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
          @click="onClickPrintEl"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, useDataService, defineGrid, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import { printElement } from '~common/utils/common';

const dataService = useDataService();
const { currentRoute } = useRouter();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;

const grdMainRef = ref(getComponentType('KwGrid'));

const searchParams = ref({
  baseDateFrom: dayjs().set('date', 1).format('YYYYMMDD'),
  baseDateTo: dayjs().format('YYYYMMDD'),
  ogId: '',
});

const serviceCenter = (await dataService.get('/sms/wells/service/organizations/service-center')).data;

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-revisit-rate', { params: { ...cachedParams } });
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/as-revisit-rate', { params: { ...cachedParams } });

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
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrNm' },
    { fieldName: 'dupCnt' },
    { fieldName: 'asCnt' },
    { fieldName: 'dupPer' },
    { fieldName: 'score' },

  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_CENTER_DIVISION'), width: '160', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '130', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '110', styleName: 'text-center' },
    { fieldName: 'dupCnt', header: t('MSG_TXT_DUP_CNT'), width: '140', styleName: 'text-right' },
    { fieldName: 'asCnt', header: t('MSG_TXT_AS_TOTAL_CNT'), width: '140', styleName: 'text-right' },
    { fieldName: 'dupPer', header: t('MSG_TXT_REVISIT_RATE'), width: '140', styleName: 'text-right' },
    { fieldName: 'score', header: t('MSG_TXT_PC'), width: '140', styleName: 'text-right' },

  ];

  const columnLayout = [
    'ogNm',
    'prtnrNo',
    'prtnrNm',
    'dupCnt',
    'asCnt',
    'dupPer',
    'score',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>

<style scoped>
</style>
