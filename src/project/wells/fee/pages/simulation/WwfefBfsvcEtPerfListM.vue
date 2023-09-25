<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEF
2. 프로그램 ID : WwfefBfsvcEtPerfListM BS예상실적 조회
3. 작성자 : seoin.jeon
4. 작성일 : 2023.09.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- BS예상실적 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      v-permission:read
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_PRD')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtPerfDt"
            v-model:to="searchParams.endPerfDt"
            :label="$t('MSG_TXT_PERF_PRD')"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <zwog-partner-search
            v-model:prtnrNo="searchParams.prtnrNo"
            v-model:ogTpCd="searchParams.ogTpCd"
            clearable
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_RSB_DV')">
          <kw-select
            v-model="searchParams.rsbDvCd"
            :label="$t('MSG_TXT_RSB_DV')"
            :options="codes.WELS_MNGER_INQR_DV_CD"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          colspan="2"
        >
          <kw-field-wrap class="equal_division--3">
            <zwog-level-select
              v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
              v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
              v-model:og-levl-dv-cd3="searchParams.ogLevlDvCd3"
              :og-tp-cd="searchParams.ogTpCd"
              :base-ym="searchParams.baseYm"
              :start-level="1"
              :end-level="3"
            />
          </kw-field-wrap>
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <ul class="kw-notification">
        <li>조회된 실적은 수수료 계산을 위한 영업부 현장 참고용입니다. 당월 실적은 접수기준입니다.</li>
      </ul>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">(단위 : 건, %, 원)</span>
        </template>
        <kw-btn
          v-permission:download
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
        name="grdMain"
        :visible-rows="10"
        @init="initGridMain"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, gridUtil, codeUtil, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZwogPartnerSearch from '~sms-common/organization/components/ZwogPartnerSearch.vue';

const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { alert } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const codes = await codeUtil.getMultiCodes(
  'WELS_MNGER_INQR_DV_CD',
);

const searchParams = ref({
  ogTpCd: 'W02',
  baseYm: dayjs().format('YYYYMM'),
  strtPerfDt: dayjs().format('YYYYMM01'),
  endPerfDt: dayjs().format('YYYYMMDD'),
  prtnrNo: '',
  rsbDvCd: '01',
  ogLevlDvCd1: undefined,
  ogLevlDvCd2: undefined,
  ogLevlDvCd3: undefined,
});

watch(() => searchParams.value.strtPerfDt, async (val) => {
  searchParams.value.baseYm = dayjs(val).format('YYYYMM');
}, { immediate: true });

let cachedParams;

// 조회
async function fetchData() {
  const response = await dataService.get('/sms/wells/fee/bs-estimate-performance', { params: cachedParams });
  totalCount.value = response.data.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(response.data);
}

// 조회 버튼 클릭 이벤트
async function onClickSearch() {
  if (searchParams.value.strtPerfDt.substring(0, 6) !== searchParams.value.endPerfDt.substring(0, 6)) {
    alert(t('MSG_ALT_SAME_PERF_STRT_YM_END_YM')); // 실적기간의 시작년월과 종료년월은 같아야 합니다.
    return;
  }
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const response = await dataService.get('/sms/wells/fee/bs-estimate-performance', { params: cachedParams });
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

watch(() => searchParams.value.rsbDvCd, async (val) => {
  const view = grdMainRef.value.getView();
  if (val === '04') { // 개인일 때만 개시월, 정착교육 컬럼 보여줌
    view.columnByName('opngMm').visible = true;
    view.columnByName('educCpcAckmtYn').visible = true;
  } else {
    view.columnByName('opngMm').visible = false;
    view.columnByName('educCpcAckmtYn').visible = false;
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'opngMm', header: t('MSG_TXT_OPNG_MM'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'educCpcAckmtYn', header: t('MSG_TXT_STMNT') + t('MSG_TXT_EDUC'), width: '150', styleName: 'text-center' },
    { fieldName: 'bfsvcAckmtCnt', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'wrfr1MgtCnt', header: t('MSG_TXT_WRFR_1'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'wrfr2MgtCnt', header: t('MSG_TXT_WRFR_2'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'wrfr3MgtCnt', header: t('MSG_TXT_WRFR_3'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'wrfr4MgtCnt', header: t('MSG_TXT_WRFR_4'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'unWrfrMgtCnt', header: t('MSG_TXT_UN_WRFR'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'puf1MgtCnt', header: t('MSG_TXT_PUF_1'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'puf2MgtCnt', header: t('MSG_TXT_PUF_2'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'otscMgtCnt', header: t('MSG_TXT_ETC_ITEMS_1'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'bdtMgtCnt', header: t('MSG_TXT_ETC_ITEMS_2'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'etcMgtCnt', header: t('MSG_TXT_ETC'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'sumMgtCnt', header: t('MSG_TXT_AGG'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'wrfr1FhsCnt', header: t('MSG_TXT_WRFR_1'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'wrfr2FhsCnt', header: t('MSG_TXT_WRFR_2'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'wrfr3FhsCnt', header: t('MSG_TXT_WRFR_3'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'wrfr4FhsCnt', header: t('MSG_TXT_WRFR_4'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'unWrfrFhsCnt', header: t('MSG_TXT_UN_WRFR'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'puf1FhsCnt', header: t('MSG_TXT_PUF_1'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'puf2FhsCnt', header: t('MSG_TXT_PUF_2'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'otscFhsCnt', header: t('MSG_TXT_ETC_ITEMS_1'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'bdtFhsCnt', header: t('MSG_TXT_ETC_ITEMS_2'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'etcFhsCnt', header: t('MSG_TXT_ETC'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'sumFhsCnt', header: t('MSG_TXT_AGG'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'procsRt', header: t('MSG_TXT_PROCS_RT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
    // 추후 관리수수료 추가 예정
    /* { fieldName: 'bsFee', header: t('MSG_TXT_MNGT_FEE'), width: '100',
    styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, */
    { fieldName: 'w1ProcCnt', header: 'W1', width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'w2ProcCnt', header: 'W2', width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.checkBar.visible = false;

  if (searchParams.value.rsbDvCd === '04') { // 개인일 때만 개시월, 정착교육 컬럼 보여줌
    view.columnByName('opngMm').visible = true;
    view.columnByName('educCpcAckmtYn').visible = true;
  } else {
    view.columnByName('opngMm').visible = false;
    view.columnByName('educCpcAckmtYn').visible = false;
  }

  // multi row header setting
  view.setColumnLayout([
    'ogCd', 'prtnrKnm', 'prtnrNo', 'opngMm', 'educCpcAckmtYn', 'bfsvcAckmtCnt',
    {
      header: t('MSG_TXT_ASGN') + t('MSG_TXT_ACC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['wrfr1MgtCnt', 'wrfr2MgtCnt', 'wrfr3MgtCnt', 'wrfr4MgtCnt', 'unWrfrMgtCnt', 'puf1MgtCnt', 'puf2MgtCnt', 'otscMgtCnt', 'bdtMgtCnt', 'etcMgtCnt'],
    },
    {
      header: t('MSG_TXT_COMPLETE') + t('MSG_TXT_ACC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['wrfr1FhsCnt', 'wrfr2FhsCnt', 'wrfr3FhsCnt', 'wrfr4FhsCnt', 'unWrfrFhsCnt', 'puf1FhsCnt', 'puf2FhsCnt', 'otscFhsCnt', 'bdtFhsCnt', 'etcFhsCnt', 'sumFhsCnt'],
    },
    'procsRt',
    // 'bsFee',
    {
      header: t('MSG_TXT_RGLVL') + t('MSG_TXT_PROC') + t('MSG_TXT_COUNT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['w1ProcCnt', 'w2ProcCnt'],
    },

  ]);
});

</script>
