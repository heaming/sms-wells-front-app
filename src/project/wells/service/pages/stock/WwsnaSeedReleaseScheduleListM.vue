<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaSeedReleaseScheduleListM(W-SV-U-0128M01) - 모종 출고 예정리스트 조회
 3. 작성자 : SaeRomI.Kim
 4. 작성일 : 2023.07.03
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 모종 출고 예정리스트 조회 (http://localhost:3000/#/service/wwsna-seed-release-schedule-list)
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
          :label="t('MSG_TXT_INQR_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.svBizHclsfCd"
            :label="t('MSG_TXT_INQR_DV')"
            :options="filterCodes.svBizHclsfCd"
            first-option="all"
          />
          <kw-select
            v-model="searchParams.dtTpCd"
            :options="filterCodes.dtTpCd"
            rules="required"
            :label="`${t('MSG_TXT_DT')} ${t('MSG_TXT_TYPE')}`"
            @change="onChangeDtTpCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_LOOKUP_PERIOD')"
          :colspan="2"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_LOOKUP_PERIOD')"
            rules="required|date_range_months:1"
            :to-disable="isOstrDt"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="`${t('MSG_TXT_REFRI')}${t('MSG_TXT_DIV')}`"
        >
          <kw-select
            v-model="searchParams.refriDivCd"
            :options="codes.REFRI_DV_CD"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item
          :label="t('TXT_MSG_SPP_DV_CD')"
        >
          <kw-select
            v-model="searchParams.sppDvCd"
            :options="codes.ITM_IOST_DV_CD"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item
          :label="t('MSG_TXT_FSH_PROCS')"
        >
          <kw-select
            v-model="searchParams.fshProcsCd"
            :options="codes.FSH_PROCS_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PKG_DV')"
        >
          <kw-select
            v-model="searchParams.pkgDvCd"
            :options="codes.PKG_MNGT_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="`${t('MSG_TXT_OSTR')}${t('MSG_TXT_YN')}`"
        >
          <kw-select
            v-model="searchParams.ostrYn"
            :options="codes.COD_YN"
            first-option="all"
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
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          icon="download_on"
          secondary
          dense
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          secondary
          dense
          :label="`${t('MSG_TXT_DP_DT')}${t('MSG_TXT_CH')}`"
          :disable="pageInfo.totalCount === 0"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-date-picker
          v-model="ostrCnfmDt"
          dense
          class="w140"
          :min-date="minDate"
          :disable="pageInfo.totalCount === 0"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          primary
          dense
          :label="`${t('MSG_TXT_OSTR_CNFM_DT')} ${t('MSG_TXT_SAVE')}`"
          :disable="pageInfo.totalCount === 0"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
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

import { codeUtil, useMeta, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const now = dayjs();
const minDate = now.format('YYYY-MM-DD');

let cachedParams;
const searchParams = ref({
  svBizHclsfCd: '',
  dtTpCd: '4',
  strtDt: now.format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  refriDivCd: '',
  sppDvCd: '1',
  fshProcsCd: '00',
  pkgDvCd: '',
  ostrYn: '',
  dayOfWeek: now.format('d'),
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const ostrCnfmDt = ref(now.format('YYYYMMDD'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SV_BIZ_HCLSF_CD',
  'DT_TP_CD',
  'REFRI_DV_CD',
  'ITM_IOST_DV_CD',
  'FSH_PROCS_CD',
  'PKG_MNGT_CD',
  'COD_YN',
);

const filterCodes = ref({
  svBizHclsfCd: [],
  dtTpCd: [],
});

function codeFilter() {
  filterCodes.value.svBizHclsfCd = codes.SV_BIZ_HCLSF_CD.filter((v) => ['1', '2', '3'].includes(v.codeId));
  filterCodes.value.dtTpCd = codes.DT_TP_CD.filter((v) => ['1', '2', '3', '4'].includes(v.codeId));
}

await Promise.all([
  codeFilter(),
]);

const isOstrDt = computed(() => searchParams.value?.dtTpCd === '4');

// 일자유형 변경 시
function onChangeDtTpCd() {
  const { dtTpCd, strtDt } = searchParams.value;
  // 일자유형이 출고일자인 경우 시작일자 = 종료일자
  if (dtTpCd === '4') {
    searchParams.value.endDt = strtDt;
  }
}

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/seed-release-schedules/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;
  // fetch시에는 총 건수 조회하지 않도록 변경
  pagingResult.needTotalCount = false;
  pageInfo.value = pagingResult;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(list);
  }
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/seed-release-schedules/excel-download', { params: cachedParams });

  gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dpYn', dataType: 'text' },
    { fieldName: 'ostrYn', dataType: 'text' },
    { fieldName: 'refriDiv', dataType: 'text' },
    { fieldName: 'shipDiv', dataType: 'text' },
    { fieldName: 'receiptDiv', dataType: 'text' },
    { fieldName: 'cntrNo', dataType: 'text' },
    { fieldName: 'cstNm', dataType: 'text' },
    { fieldName: 'sppOrdNo', dataType: 'text' },
    { fieldName: 'mchnModel', dataType: 'text' },
    { fieldName: 'mchnCstNo', dataType: 'text' },
    { fieldName: 'mchnCstNm', dataType: 'text' },
    { fieldName: 'crtlPkg', dataType: 'text' },
    { fieldName: 'shipPkg', dataType: 'text' },
    { fieldName: 'sding1', dataType: 'text' },
    { fieldName: 'qty1', dataType: 'number' },
    { fieldName: 'sding2', dataType: 'text' },
    { fieldName: 'qty2', dataType: 'number' },
    { fieldName: 'sding3', dataType: 'text' },
    { fieldName: 'qty3', dataType: 'number' },
    { fieldName: 'sding4', dataType: 'text' },
    { fieldName: 'qty4', dataType: 'number' },
    { fieldName: 'sding5', dataType: 'text' },
    { fieldName: 'qty5', dataType: 'number' },
    { fieldName: 'todayCnl', dataType: 'text' },
    { fieldName: 'mchnDemDt', dataType: 'text' },
    { fieldName: 'receiptDt', dataType: 'text' },
    { fieldName: 'vstDt', dataType: 'text' },
    { fieldName: 'ostrScheDt', dataType: 'text' },
    { fieldName: 'bsFshDt', dataType: 'text' },
    { fieldName: 'dpDt', dataType: 'text' },
    { fieldName: 'ostrCnfmDt', dataType: 'text' },
    { fieldName: 'sdingRcgWareNm', dataType: 'text' },
    { fieldName: 'vstCenter', dataType: 'text' },
    { fieldName: 'vstIchr', dataType: 'text' },
    { fieldName: 'ichrCtnt', dataType: 'text' },
    { fieldName: 'cstCtnt', dataType: 'text' },
    { fieldName: 'cstZip', dataType: 'text' },
    { fieldName: 'cstAdr', dataType: 'text' },
    { fieldName: 'refriDvCd', dataType: 'text' },
    { fieldName: 'cntrSn', dataType: 'text' },
    { fieldName: 'svBizHclsfCd', dataType: 'text' },
    { fieldName: 'svBizDclsfCd', dataType: 'text' },
    { fieldName: 'sppPlanSn', dataType: 'text' },
  ];

  const columns = [
    { fieldName: 'dpYn', header: t('MSG_TXT_DP'), width: '70', styleName: 'text-center' },
    { fieldName: 'ostrYn', header: t('MSG_TXT_OSTR'), styleName: 'text-center', width: '70' },
    { fieldName: 'refriDiv', header: t('MSG_TXT_REFRI'), width: '90', styleName: 'text-center' },
    { fieldName: 'shipDiv', header: t('TXT_MSG_SPP_DV_CD'), width: '90', styleName: 'text-center' },
    { fieldName: 'receiptDiv', header: t('MSG_TXT_RCP_DV'), styleName: 'text-center', width: '90' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), styleName: 'text-center', width: '146' },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), styleName: 'text-center', width: '90' },
    { fieldName: 'sppOrdNo', header: `${t('MSG_TXT_DLVRY')}${t('MSG_TXT_SEQUENCE_NUMBER')}`, styleName: 'text-center', width: '154' },
    { fieldName: 'mchnModel', header: `${t('MSG_TXT_MCHN')}${t('MSG_TXT_MODEL')}`, styleName: 'text-left', width: '220' },
    { fieldName: 'mchnCstNo', header: `${t('MSG_TXT_MCHN')}${t('MSG_TXT_CST_NO')}`, styleName: 'text-center', width: '150' },
    { fieldName: 'mchnCstNm', header: `${t('MSG_TXT_MCHN')}${t('MSG_TXT_CST_NM')}`, styleName: 'text-center', width: '100' },
    { fieldName: 'crtlPkg', header: `${t('MSG_TXT_CURRENT')}${t('MSG_TXT_PKG')}`, styleName: 'text-left', width: '150' },
    { fieldName: 'shipPkg', header: `${t('MSG_TXT_DLVRY')}${t('MSG_TXT_PKG')}`, width: '150', styleName: 'text-left' },
    { fieldName: 'sding1', header: `${t('MSG_TXT_SDING')}1`, styleName: 'text-left', width: '120' },
    { fieldName: 'qty1', header: `${t('MSG_TXT_QTY')}1`, width: '50', styleName: 'text-right' },
    { fieldName: 'sding2', header: `${t('MSG_TXT_SDING')}2`, styleName: 'text-left', width: '120' },
    { fieldName: 'qty2', header: `${t('MSG_TXT_QTY')}2`, width: '50', styleName: 'text-right' },
    { fieldName: 'sding3', header: `${t('MSG_TXT_SDING')}3`, styleName: 'text-left', width: '120' },
    { fieldName: 'qty3', header: `${t('MSG_TXT_QTY')}3`, width: '50', styleName: 'text-right' },
    { fieldName: 'sding4', header: `${t('MSG_TXT_SDING')}4`, styleName: 'text-left', width: '120' },
    { fieldName: 'qty4', header: `${t('MSG_TXT_QTY')}4`, width: '50', styleName: 'text-right' },
    { fieldName: 'sding5', header: `${t('MSG_TXT_SDING')}5`, styleName: 'text-left', width: '120' },
    { fieldName: 'qty5', header: `${t('MSG_TXT_QTY')}5`, width: '50', styleName: 'text-right' },
    { fieldName: 'todayCnl', header: t('MSG_TXT_TOD_CAN'), width: '90', styleName: 'text-center' },
    { fieldName: 'mchnDemDt', header: `${t('MSG_TXT_MCHN')}${t('MSG_TXT_DEM_DT')}`, styleName: 'text-center', width: '90', datetimeFormat: 'date' },
    { fieldName: 'receiptDt', header: t('MSG_TXT_RCPDT'), styleName: 'text-center', width: '100', datetimeFormat: 'date' },
    { fieldName: 'vstDt', header: t('MSG_TXT_VST_DT'), styleName: 'text-center', width: '100', datetimeFormat: 'date' },
    { fieldName: 'ostrScheDt', header: `${t('MSG_TXT_OSTR')}${t('MSG_TXT_SCHD_DT')}`, styleName: 'text-center', width: '100', datetimeFormat: 'date' },
    { fieldName: 'bsFshDt', header: `${t('MSG_TXT_BS')}${t('MSG_TXT_FSH_DT')}`, styleName: 'text-center', width: '100', datetimeFormat: 'date' },
    { fieldName: 'dpDt', header: t('MSG_TXT_DP_DT'), styleName: 'text-center', width: '100', datetimeFormat: 'date' },
    { fieldName: 'ostrCnfmDt', header: `${t('MSG_TXT_OSTR')}${t('MSG_TXT_CNFM_DT')}`, styleName: 'text-center', width: '100', datetimeFormat: 'date' },
    { fieldName: 'sdingRcgWareNm', header: t('MSG_TXT_SDING_RCG_WARE'), styleName: 'text-left', width: '181' },
    { fieldName: 'vstCenter', header: `${t('MSG_TXT_VST')}${t('MSG_TXT_CENTER_DIVISION')}`, styleName: 'text-left', width: '150' },
    { fieldName: 'vstIchr', header: `${t('MSG_TXT_VST')}${t('MSG_TXT_ICHR')}`, styleName: 'text-center', width: '100' },
    { fieldName: 'ichrCtnt', header: `${t('MSG_TXT_ICHR')}${t('MSG_TXT_CONTACT')}`, styleName: 'text-center', width: '150' },
    { fieldName: 'cstCtnt', header: `${t('MSG_TXT_CUSTOMER')}${t('MSG_TXT_CONTACT')}`, styleName: 'text-center', width: '150' },
    { fieldName: 'cstZip', header: `${t('MSG_TXT_CUSTOMER')}${t('MSG_TXT_ZIP')}`, styleName: 'text-center', width: '100' },
    { fieldName: 'cstAdr', header: t('MSG_TXT_CST_ADR'), styleName: 'text-left', width: '181' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEditable = (grid, index) => {
    // 유/무상 구분이 유상인 경우만 입금일자 입력 가능
    // index.row
    if (index.column === 'dpDt') {
      return true;
    }

    return false;
  };
});

</script>

<style scoped>
</style>
