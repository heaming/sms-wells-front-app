<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SND
2. 프로그램 ID : [K-W-SV-U-0307M01] WwsndServiceIndicatorListM - 웰스매니저 서비스종합지표
3. 작성자 : heymi.cho
4. 작성일 : 2023.09.06
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 웰스매니저 서비스종합지표
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
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
          auth-yn="N"
        />
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          :colspan="1"
          required
        >
          <kw-date-picker
            v-model="searchParams.mgtYnm"
            :label="$t('MSG_TXT_MGT_YNM')"
            type="month"
            rules="required"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-btn
          icon="download_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';

const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

const searchParams = ref({
  dgr1LevlOg: {},
  dgr2LevlOg: {},
  dgr3LevlOg: {},
  partners: {},
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
  prtnrNo: '',
  mgtYnm: now.format('YYYYMM'),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/service-indicator/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: totalState, pageInfo: pagingResult } = res.data;
  pageInfo.value = grdMainRef.value.getView();

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(totalState);
  view.resetCurrent();
}

/*
 *  Search - 조회
 */
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/service-indicator/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostFix: true,
    exportData: response.data,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
// TODO: 바코드스캔 st166 협의 후 수정
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cstNo',
      header: t('MSG_TXT_CST_NO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cstNo: no1, cntrSn: no2 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}`;
        }
      } },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CST_NO'), width: '130', styleName: 'text-center', visible: false },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center', visible: false },
    { fieldName: 'copnDvCd', header: t('MSG_TXT_DIV'), width: '130', styleName: 'text-center' },
    // { fieldName: 'pdNm', header: t('MSG_TXT_ITM_CD'), width: '130', styleName: 'text-center' },
    // { fieldName: 'col5', header: t('MSG_TXT_SAPCD'), width: '130', styleName: 'text-left' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '180', styleName: 'text-center' },
    { fieldName: 'fstPrtnrNo', header: `${t('MSG_TXT_FST') + t('MSG_TXT_ASND_BY')} ${t('MSG_TXT_EPNO')}`, width: '120', styleName: 'text-center' },
    { fieldName: 'fstPrtnrKnm', header: `${t('MSG_TXT_FST') + t('MSG_TXT_ASND_BY')} ${t('MSG_TXT_NAME')}`, width: '150', styleName: 'text-center' },
    { fieldName: 'bhshdCd', header: t('MSG_TXT_BHSHD_CD'), width: '150', styleName: 'text-left' },
    { fieldName: 'cntcOgNm', header: t('MSG_TXT_BLG'), width: '150', styleName: 'text-left' },
    { fieldName: 'cntcPrtnrNo', header: t('MSG_TXT_EPNO'), width: '150', styleName: 'text-left' },
    { fieldName: 'cntcPrtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '150', styleName: 'text-left' },
    { fieldName: 'absncRsonCd', header: t('MSG_TXT_CTT') + t('MSG_TXT_RSULT'), width: '150', styleName: 'text-left' },
    { fieldName: 'cntcDt',
      header: t('MSG_TXT_CTT_DT'),
      width: '150',
      styleName: 'text-left',
      datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'cntcHh',
      header: t('MSG_TXT_CTT') + t('MSG_TXT_TIME'),
      width: '150',
      styleName: 'text-left',
      datetimeFormat: 'HH:mm:ss' },
    { fieldName: 'callYn', header: t('MSG_TXT_PHONE'), width: '80', styleName: 'text-left' },
    { fieldName: 'msgYn', header: t('MSG_TXT_CHAR'), width: '80', styleName: 'text-left' },
    { fieldName: 'cntcDtBf3', header: `3일전${t('MSG_TXT_CTT')}`, width: '80', styleName: 'text-left' },
    { fieldName: 'vstDuedt',
      header: t('MSG_TXT_PROM_DT'),
      width: '150',
      styleName: 'text-left',
      datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'vstExpHh',
      header: t('MSG_TXT_PROM_HH'),
      width: '150',
      styleName: 'text-left',
      datetimeFormat: 'HH:mm:ss' },
    { fieldName: 'vstInTime', header: t('MSG_TXT_TIME_COMP'), width: '80', styleName: 'text-left' },
    { fieldName: 'scnDtm', header: t('MSG_TXT_SCN') + t('MSG_TXT_DT'), width: '160', styleName: 'text-left', datetimeFormat: 'YYYY-MM-DD HH:mm:ss' },
    { fieldName: 'bsInMthdCd', header: t('MSG_TXT_SCN'), width: '150', styleName: 'text-left' },
    { fieldName: 'vstFshDt',
      header: t('MSG_TXT_VST_DT'),
      width: '150',
      styleName: 'text-left',
      datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'vstFshHh',
      header: t('MSG_TXT_VST_TM'),
      width: '150',
      styleName: 'text-left',
      datetimeFormat: 'HH:mm:ss' },
    { fieldName: 'vstPrgsStatCd', header: t('MSG_TXT_VST_RS'), width: '150', styleName: 'text-left' },
    { fieldName: 'cnfmPsicPrtnrNo', header: t('MSG_TXT_EPNO'), width: '150', styleName: 'text-left' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '150', styleName: 'text-left' },
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '150', styleName: 'text-left' },
    { fieldName: 'hpcallYn', header: t('MSG_TXT_PSH_SEND'), width: '80', styleName: 'text-left' },
    { fieldName: 'hpcallStpcN', header: t('MSG_TXT_RSULT'), width: '150', styleName: 'text-left' },
    { fieldName: 'npVstDt',
      header: t('MSG_TXT_VST_DT'),
      width: '150',
      styleName: 'text-left',
      datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'npVstMth',
      header: t('MSG_TXT_PRD'),
      width: '100',
      styleName: 'text-left',
      datetimeFormat: 'HH:mm:ss' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  const columnLayout = [
    'cstNo', 'copnDvCd', 'pdNm', 'fstPrtnrNo', 'fstPrtnrKnm', 'bhshdCd', // single
    {
      header: t('MSG_TXT_CTT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['cntcOgNm', 'cntcPrtnrNo', 'cntcPrtnrKnm', 'absncRsonCd', 'cntcDt', 'cntcHh', 'callYn', 'msgYn', 'cntcDtBf3'],
    },
    {
      header: t('MSG_TXT_PROM_DT'),
      direction: 'horizontal',
      items: ['vstDuedt', 'vstExpHh', 'vstInTime'],
    },

    {
      header: t('MSG_TXT_CMPLTD'),
      direction: 'horizontal',
      items: ['scnDtm', 'bsInMthdCd', 'vstFshDt', 'vstFshHh', 'vstPrgsStatCd', 'cnfmPsicPrtnrNo', 'prtnrKnm'],
    },
    {
      header: t('MSG_TXT_HPCALL'),
      direction: 'horizontal',
      items: ['hpcallYn', 'hpcallStpcN'],
    },
    {
      header: t('MSG_TXT_NO_PROC'),
      direction: 'horizontal',
      items: ['npVstDt', 'npVstMth'],
    },
  ];

  data.setFields(fields);
  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>
