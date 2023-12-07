<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteReceiptBaseInstallationPerformanceListM - 접수기준 설치실적
3. 작성자 : gs.itsm210
4. 작성일 : 2023.11.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- wells 접수기준 설치실적정보 조회(지점장)(W-SS-U-0062M01)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RCP_YM')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.istStartDt"
            v-model:to="searchParams.istEndDt"
            :label="$t('MSG_TXT_RCP_YM')"
            rules="date_range_required"
            type="month"
            @change="onChangePerfDt"
          />
        </kw-search-item>
        <!-- 실적구분 -->
        <kw-search-item
          :label="t('MSG_TXT_PERF_DV')"
        >
          <kw-select
            v-model="searchParams.perfDv"
            :options="[{ codeId: '1', codeName: t('MSG_TIT_TOT') },
                       { codeId: '2', codeName: t('MSG_TXT_CHDVC_ETC_EXCD') }]"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CRLV')"
          required
        >
          <kw-select
            v-model="searchParams.pstnDv"
            :label="$t('MSG_TXT_CRLV')"
            rules="required"
            :options="[{ codeId: '1', codeName: t('MSG_TXT_GENERAL_DIVISION') },
                       { codeId: '2', codeName: t('MSG_TXT_LOCARA') },
                       { codeId: '3', codeName: t('MSG_TXT_BRANCH') },
                       { codeId: '4', codeName: t('MSG_TXT_INDV') }]"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          colspan="2"
          :label="$t('MSG_TXT_OG_CD')"
        >
          <kw-select
            v-model="searchParams.dgr1LevlOgCd"
            :options="codesDgr1Levl"
            option-value="dgr1LevlOgCd"
            option-label="dgr1LevlOgNm"
            first-option="select"
            :first-option-label="$t('MSG_TXT_GNRDV_CHO')"
            @change="onUpdateDgr1Levl"
          />
          <kw-select
            v-model="searchParams.dgr2LevlOgCd"
            :options="filteredDgr2LevlOgCds"
            option-value="dgr2LevlOgCd"
            option-label="dgr2LevlOgNm"
            first-option="select"
            :first-option-label="$t('MSG_TXT_RGNL_GRP')+ ' ' +$t('MSG_TXT_SELT')"
            @change="onUpdateDgr2Levl"
          />
          <kw-select
            v-model="searchParams.dgr3LevlOgCd"
            :options="filteredDgr3LevlOgCds"
            option-value="dgr3LevlOgCd"
            option-label="dgr3LevlOgNm"
            first-option="select"
            :first-option-label="$t('MSG_TXT_SLCT_BRANCH')"
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
          v-permission:download
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          icon="download_on"
          dense
          secondary
          :disable="!totalCount"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageSize"
        :total-count="totalCount"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, useDataService, gridUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { currentRoute } = useRouter();
const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
const pageSize = 10;
const totalCount = ref(0);

const now = dayjs();
const searchParams = ref({
  istStartDt: now.startOf('month').format('YYYYMMDD'),
  istEndDt: now.format('YYYYMMDD'),
  perfDv: '1', // 실적구분
  pstnDv: '1', // 직급
  dgr1LevlOgCd: '', // 조직코드-총괄단
  dgr2LevlOgCd: '', // 조직코드-지역단
  dgr3LevlOgCd: '', // 조직코드-지점
});
// 조직코드 조회
const codesDgr1Levl = ref([]);
const codesDgr2Levl = ref([]);
const codesDgr3Levl = ref([]);
const filteredDgr2LevlOgCds = ref([]);
const filteredDgr3LevlOgCds = ref([]);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/receipt-installation', { params: searchParams.value });
  const aggs = res.data;
  totalCount.value = aggs.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(aggs);
  view.resetCurrent();
}

async function onClickSearch() {
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    exportData: gridUtil.getAllRowValues(view),
    fileName: `${currentRoute.value.meta.menuName}`,
    timePostfix: true,
    indicator: 'hidden',
    checkBar: 'hidden',
  });
}

// 조직 조회
async function searchOrg(paramDt) {
  const searchOgParams = ref({
    baseYm: isEmpty(paramDt) ? searchParams.value.istStartDt : paramDt,
  });

  let res = [];
  res = await dataService.get('/sms/wells/contract/partners/general-divisions', { params: searchOgParams.value }); // 총괄단
  codesDgr1Levl.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/regional-divisions', { params: searchOgParams.value }); // 지역단
  codesDgr2Levl.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/branch-divisions', { params: searchOgParams.value }); // 지점
  codesDgr3Levl.value = res.data;
}

// 시작일 변경 시, 조직 재조회
async function onChangePerfDt(dt) {
  searchOrg(dt[0]);
}

// 조직코드 총괄단 변경 이벤트
async function onUpdateDgr1Levl(selectedValues) {
  // init
  filteredDgr2LevlOgCds.value = [];
  filteredDgr3LevlOgCds.value = [];

  // 지역단 코드 필터링. 선택한 총괄단의 하위 지역단으로 필터링
  filteredDgr2LevlOgCds.value = codesDgr2Levl.value.filter((v) => selectedValues.includes(v.dgr1LevlOgCd));

  // value init
  searchParams.value.dgr2LevlOgCd = '';
  searchParams.value.dgr3LevlOgCd = '';
}

// 조직코드 지역단 변경 이벤트
async function onUpdateDgr2Levl(selectedValues) {
  filteredDgr3LevlOgCds.value = [];

  // 지점 코드 필터링. 선택한 지역단의 하위 지점으로 필터링.
  filteredDgr3LevlOgCds.value = codesDgr3Levl.value.filter((v) => selectedValues.includes(v.dgr2LevlOgCd));

  // value init
  searchParams.value.dgr3LevlOgCd = '';
}

onMounted(async () => {
  await searchOrg();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'baseYm' },
    { fieldName: 'ogCd' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'pstnDvNm' },
    { fieldName: 'sumPdQty2', dataType: 'number' },
    { fieldName: 'sumIstC2', dataType: 'number' },
    { fieldName: 'sumCanCt2', dataType: 'number' },
    { fieldName: 'sumDiffCt', dataType: 'number' },
    { fieldName: 'purIstRat' },
    { fieldName: 'istRat' },
  ];

  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_RCP_YM'), width: 120, styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: 150, styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: 150, styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: 150, styleName: 'text-right' },
    { fieldName: 'pstnDvNm', header: t('MSG_TXT_CRLV'), width: 150, styleName: 'text-center' },
    { fieldName: 'sumPdQty2', header: t('MSG_TXT_RCP_CT'), width: 150, styleName: 'text-right' },
    { fieldName: 'sumIstC2', header: t('MSG_TXT_IST_CT'), width: 150, styleName: 'text-right' },
    { fieldName: 'sumCanCt2', header: t('MSG_TXT_CAN_CT'), width: 150, styleName: 'text-right' },
    { fieldName: 'sumDiffCt', header: t('MSG_TXT_PUR_IST_CT'), width: 150, styleName: 'text-right' },
    { fieldName: 'istRat', header: t('MSG_TXT_IST_RT'), width: 150, styleName: 'text-right', suffix: '%' },
    { fieldName: 'purIstRat', header: t('MSG_TXT_PUR_IST_RT'), width: 150, styleName: 'text-right', suffix: '%' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
}

</script>
