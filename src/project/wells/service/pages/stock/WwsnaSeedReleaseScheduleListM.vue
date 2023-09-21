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
      :modified-targets="['grdMain']"
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
          :label="searchParams.dtTpCd !== '4' ? $t('MSG_TXT_LOOKUP_PERIOD') : $t('MSG_TXT_SRCH_DT')"
          :colspan="searchParams.dtTpCd !== '4' ? 2 : 1"
          required
        >
          <kw-date-range-picker
            v-if="searchParams.dtTpCd !== '4'"
            v-model:from="searchParams.strtDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_LOOKUP_PERIOD')"
            rules="required|date_range_months:1"
          />
          <kw-date-picker
            v-else-if="searchParams.dtTpCd === '4'"
            v-model="searchParams.strtDt"
            rules="required"
            type="date"
            @change="onChangeStrtDt"
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
            :options="filterCodes.fshProcsCd"
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
          v-permission:download
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
          v-permission:update
          secondary
          dense
          :label="`${t('MSG_TXT_DP_DT')}${t('MSG_TXT_CH')}`"
          :disable="pageInfo.totalCount === 0"
          @click="onClickSave"
        />
        <kw-btn
          v-permission:read
          secondary
          dense
          :label="$t('MSG_BTN_AGRG_CHT_PRNT')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickAgrgPrint"
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
          v-permission:update
          primary
          dense
          :label="`${t('MSG_TXT_OSTR_CNFM_DT')} ${t('MSG_TXT_SAVE')}`"
          :disable="pageInfo.totalCount === 0"
          @click="onClickOstrCnfmSave"
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
      <kw-grid
        ref="grdTotalRef"
        name="grdTotal"
        hidden="true"
        @init="initGridTotal"
      />
      <kw-grid
        ref="grdSelectRef"
        name="grdSelect"
        hidden="true"
        @init="initGridSelect"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, useMeta, useGlobal, useDataService, getComponentType, gridUtil, defineGrid, popupUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { notify, alert } = useGlobal();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const grdTotalRef = ref(getComponentType('KwGrid'));
const grdSelectRef = ref(getComponentType('KwGrid'));

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
  fshProcsCd: [],
  dtTpCd: [],
});

function codeFilter() {
  filterCodes.value.svBizHclsfCd = codes.SV_BIZ_HCLSF_CD.filter((v) => ['1', '2', '3'].includes(v.codeId));
  filterCodes.value.fshProcsCd = codes.FSH_PROCS_CD.filter((v) => ['00', '20'].includes(v.codeId));
  filterCodes.value.dtTpCd = codes.DT_TP_CD.filter((v) => ['1', '2', '3', '4'].includes(v.codeId));
}

await Promise.all([
  codeFilter(),
]);

// 일자유형 변경 시
function onChangeDtTpCd() {
  const { dtTpCd, strtDt } = searchParams.value;
  // 일자유형이 출고일자인 경우 시작일자 = 종료일자
  if (dtTpCd === '4' && isEmpty(strtDt)) {
    searchParams.value.endDt = strtDt;
  }
}

// 일자 변경 시
function onChangeStrtDt() {
  const { strtDt } = searchParams.value;
  // 시작일자 = 종료일자
  if (isEmpty(strtDt)) {
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
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

async function onClickSearch() {
  const { strtDt } = searchParams.value;
  searchParams.value.dayOfWeek = dayjs(strtDt).format('d');

  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();

  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const modifedData = gridUtil.getChangedRowValues(view);

  const res = await dataService.put('/sms/wells/service/seed-release-schedules', modifedData);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    pageInfo.value.needTotalCount = true;
    await fetchData();
  }
}

// 출고확정일 저장
async function onClickOstrCnfmSave() {
  const view = grdMainRef.value.getView();
  const checkRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkRows)) {
    // 선택된 데이터가 없습니다.
    alert(t('MSG_ALT_NO_CHECK_DATA'));
    return;
  }

  const ostrCnfmList = checkRows.filter((e) => {
    const { ostrYn } = e;
    return ostrYn === 'Y';
  });

  if (ostrCnfmList.length > 0) {
    // 이미 출고 작업이 완료되어 저장할 수 없습니다.
    await alert(t('MSG_ALT_ARDY_OSTR_WK_FSH_CANT_SAVE'));
    return;
  }

  const dpDtList = checkRows.filter((e) => {
    const { refriDvCd, dpDt } = e;
    return refriDvCd === '2' && isEmpty(dpDt);
  });

  if (dpDtList.length > 0) {
    // 유상서비스의 입금일자를 확인 부탁드립니다.
    await alert(t('MSG_ALT_RECAP_SV_DP_DT_CONF'));
    return;
  }

  checkRows.forEach((item) => {
    item.ostrCnfmDt = ostrCnfmDt.value;
  });

  const res = await dataService.post('/sms/wells/service/seed-release-schedules', checkRows);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    pageInfo.value.needTotalCount = true;
    await fetchData();
  }
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

// 집계표 출력
async function onClickAgrgPrint() {
  const { svBizHclsfCd, strtDt } = cachedParams;
  const res = await dataService.get('/sms/wells/service/seed-release-schedules/aggregations', { params: cachedParams });

  const date = `${strtDt.substring(0, 4)}-${strtDt.substring(4, 6)}-${strtDt.substring(6, 8)}`;
  let fileName = `${t('MSG_TXT_ALL')}_${date}`;

  const view = isEmpty(svBizHclsfCd) ? grdTotalRef.value.getView() : grdSelectRef.value.getView();
  const gridView = grdMainRef.value.getView();

  if (!isEmpty(svBizHclsfCd)) {
    let headerNm = t('MSG_TXT_INSTALLATION');

    if (svBizHclsfCd === '1') {
      fileName = `${t('MSG_TXT_INSTALLATION')}_${date}`;
    } else if (svBizHclsfCd === '2') {
      fileName = `BS_${date}`;
      headerNm = 'BS';
    } else if (svBizHclsfCd === '3') {
      fileName = `AS_${date}`;
      headerNm = 'AS';
    }

    view.__originalLayouts__[1].header.text = headerNm;
  }

  view.__searchConditionText__ = gridView.__searchConditionText__;

  gridUtil.exportView(view, {
    fileName,
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
    { fieldName: 'cntrDtlNo', dataType: 'text' },
    { fieldName: 'cstNm', dataType: 'text' },
    { fieldName: 'sppOrdNo', dataType: 'text' },
    { fieldName: 'mchnModel', dataType: 'text' },
    { fieldName: 'mchnCstDtlNo', dataType: 'text' },
    { fieldName: 'mchnCstNm', dataType: 'text' },
    { fieldName: 'ctrlPkg', dataType: 'text' },
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
    { fieldName: 'sppPlanSn', dataType: 'number' },
    { fieldName: 'sdingPdCd1', dataType: 'text' },
    { fieldName: 'sowDt1', dataType: 'text' },
    { fieldName: 'sdingPdCd2', dataType: 'text' },
    { fieldName: 'sowDt2', dataType: 'text' },
    { fieldName: 'sdingPdCd3', dataType: 'text' },
    { fieldName: 'sowDt3', dataType: 'text' },
    { fieldName: 'sdingPdCd4', dataType: 'text' },
    { fieldName: 'sowDt4', dataType: 'text' },
    { fieldName: 'sdingPdCd5', dataType: 'text' },
    { fieldName: 'sowDt5', dataType: 'text' },
    { fieldName: 'sdingPkgPdCd', dataType: 'text' },
    { fieldName: 'mngrDvCd', dataType: 'text' },
    { fieldName: 'dpEpttNm', dataType: 'text' },
    { fieldName: 'ogTpCd', dataType: 'text' },
    { fieldName: 'prtnrNo', dataType: 'text' },
    { fieldName: 'recapCsAmt', dataType: 'number' },
    { fieldName: 'sppDvCd', dataType: 'text' },
    { fieldName: 'sdingMcnrPdCd', dataType: 'text' },
    { fieldName: 'cstSvAsnNo', dataType: 'text' },
    { fieldName: 'mchnCstNo', dataType: 'text' },
    { fieldName: 'cntrNo', dataType: 'text' },
    { fieldName: 'vstDuedt', dataType: 'text' },
    { fieldName: 'cstCralLocaraTno', dataType: 'text' },
    { fieldName: 'cstMexnoEncr', dataType: 'text' },
    { fieldName: 'cstCralIdvTno', dataType: 'text' },
  ];

  const columns = [
    { fieldName: 'dpYn', header: t('MSG_TXT_DP'), width: '70', styleName: 'text-center' },
    { fieldName: 'ostrYn', header: t('MSG_TXT_OSTR'), styleName: 'text-center', width: '70' },
    { fieldName: 'refriDiv', header: t('MSG_TXT_REFRI'), width: '90', styleName: 'text-center' },
    { fieldName: 'shipDiv', header: t('TXT_MSG_SPP_DV_CD'), width: '90', styleName: 'text-center' },
    { fieldName: 'receiptDiv', header: t('MSG_TXT_RCP_DV'), styleName: 'text-center', width: '90' },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '146', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), styleName: 'text-left', width: '90' },
    { fieldName: 'sppOrdNo', header: `${t('MSG_TXT_DLVRY')}${t('MSG_TXT_SEQUENCE_NUMBER')}`, styleName: 'text-center', width: '154' },
    { fieldName: 'mchnModel', header: `${t('MSG_TXT_MCHN')}${t('MSG_TXT_MODEL')}`, styleName: 'text-left', width: '220' },
    { fieldName: 'mchnCstDtlNo', header: `${t('MSG_TXT_MCHN')}${t('MSG_TXT_CNTR_DTL_NO')}`, width: '150', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true },
    { fieldName: 'mchnCstNm', header: `${t('MSG_TXT_MCHN')}${t('MSG_TXT_CST_NM')}`, styleName: 'text-left', width: '100' },
    { fieldName: 'ctrlPkg', header: `${t('MSG_TXT_CURRENT')}${t('MSG_TXT_PKG')}`, styleName: 'text-left', width: '150' },
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
    { fieldName: 'mchnDemDt', header: `${t('MSG_TXT_MCHN')}${t('MSG_TXT_DEM_DT')}`, styleName: 'text-center', width: '120', datetimeFormat: 'date' },
    { fieldName: 'receiptDt', header: t('MSG_TXT_RCPDT'), styleName: 'text-center', width: '120', datetimeFormat: 'date' },
    { fieldName: 'vstDt', header: t('MSG_TXT_VST_DT'), styleName: 'text-center', width: '120', datetimeFormat: 'date' },
    { fieldName: 'ostrScheDt', header: `${t('MSG_TXT_OSTR')}${t('MSG_TXT_SCHD_DT')}`, styleName: 'text-center', width: '120', datetimeFormat: 'date' },
    { fieldName: 'bsFshDt', header: `${t('MSG_TXT_BS')}${t('MSG_TXT_FSH_DT')}`, styleName: 'text-center', width: '120', datetimeFormat: 'date' },
    { fieldName: 'dpDt',
      header: t('MSG_TXT_DP_DT'),
      styleName: 'text-center',
      width: '130',
      datetimeFormat: 'date',
      rules: 'required',
      editor: {
        type: 'btdate',
      } },
    { fieldName: 'ostrCnfmDt', header: `${t('MSG_TXT_OSTR')}${t('MSG_TXT_CNFM_DT')}`, styleName: 'text-center', width: '120', datetimeFormat: 'date' },
    { fieldName: 'sdingRcgWareNm', header: t('MSG_TXT_SDING_RCG_WARE'), styleName: 'text-left', width: '181' },
    { fieldName: 'vstCenter', header: `${t('MSG_TXT_VST')}${t('MSG_TXT_CENTER_DIVISION')}`, styleName: 'text-center', width: '150' },
    { fieldName: 'vstIchr', header: `${t('MSG_TXT_VST')}${t('MSG_TXT_ICHR')}`, styleName: 'text-center', width: '100' },
    { fieldName: 'ichrCtnt', header: `${t('MSG_TXT_ICHR')}${t('MSG_TXT_CONTACT')}`, styleName: 'text-center', width: '150' },
    { fieldName: 'cstCtnt', header: `${t('MSG_TXT_CUSTOMER')}${t('MSG_TXT_CONTACT')}`, styleName: 'text-center', width: '150' },
    { fieldName: 'cstZip', header: `${t('MSG_TXT_CUSTOMER')}${t('MSG_TXT_ZIP')}`, styleName: 'text-center', width: '100' },
    { fieldName: 'cstAdr', header: t('MSG_TXT_CST_ADR'), styleName: 'text-left', width: '181' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEditable = (grid, index) => {
    const dpYn = gridUtil.getCellValue(view, index.dataRow, 'dpYn');

    // 유/무상 구분이 유상인 경우만 입금일자 입력 가능
    if (dpYn === 'R' && index.column === 'dpDt') {
      return true;
    }

    return false;
  };
  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntrDtlNo') {
      const cntrNo = g.getValue(itemIndex, 'cntrNo');
      const cntrSn = g.getValue(itemIndex, 'cntrSn');

      await popupUtil.open(`/popup#/service/wwsnb-individual-service-list?cntrNo=${cntrNo}&cntrSn=${cntrSn}`, { width: 2000, height: 1100 }, false);
    } else if (column === 'mchnCstDtlNo') {
      const mchnCstDtlNo = g.getValue(itemIndex, 'mchnCstDtlNo');
      const idx = mchnCstDtlNo.indexOf('-');
      const cntrNo = mchnCstDtlNo.substr(0, idx);
      const cntrSn = mchnCstDtlNo.substr(idx + 1);

      await popupUtil.open(`/popup#/service/wwsnb-individual-service-list?cntrNo=${cntrNo}&cntrSn=${cntrSn}`, { width: 2000, height: 1100 }, false);
    }
  };
});

const initGridTotal = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'deptNm' },
    { fieldName: 'pak01', dataType: 'number' },
    { fieldName: 'pak02', dataType: 'number' },
    { fieldName: 'pak03', dataType: 'number' },
    { fieldName: 'pak04', dataType: 'number' },
    { fieldName: 'pak05', dataType: 'number' },
    { fieldName: 'pak13', dataType: 'number' },
    { fieldName: 'pak23', dataType: 'number' },
    { fieldName: 'pak50', dataType: 'number' },
    { fieldName: 'pak24', dataType: 'number' },
    { fieldName: 'pak08', dataType: 'number' },
    { fieldName: 'pak09', dataType: 'number' },
    { fieldName: 'pak12', dataType: 'number' },
    { fieldName: 'pak51', dataType: 'number' },
    { fieldName: 'pak52', dataType: 'number' },
    { fieldName: 'pak53', dataType: 'number' },
    { fieldName: 'pak54', dataType: 'number' },
    { fieldName: 'pak55', dataType: 'number' },
    { fieldName: 'pak56', dataType: 'number' },
    { fieldName: 'pak57', dataType: 'number' },
    { fieldName: 'pak58', dataType: 'number' },
    { fieldName: 'pak61', dataType: 'number' },
    { fieldName: 'pak62', dataType: 'number' },
    { fieldName: 'pak63', dataType: 'number' },
    { fieldName: 'pak64', dataType: 'number' },
    { fieldName: 'pak28', dataType: 'number' },
    { fieldName: 'pak29', dataType: 'number' },
    { fieldName: 'pak30', dataType: 'number' },
    { fieldName: 'pak31', dataType: 'number' },
    { fieldName: 'totSum', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'deptNm', header: t('MSG_TXT_CENTER_DIVISION'), width: '100', styleName: 'text-left', footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } },
    { fieldName: 'pak01',
      header: t('MSG_TXT_SALAD'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak02',
      header: t('MSG_TXT_VGT_DIET'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak03',
      header: t('MSG_TXT_HL_DINING_TBL'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak04',
      header: t('MSG_TXT_CANCER_HL'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak05',
      header: t('MSG_TXT_SLEEP_HEALING'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak13',
      header: t('MSG_TXT_CLD_FOOD'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak23',
      header: t('MSG_TXT_MINI'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak50',
      header: t('MSG_TXT_CLD_GWUP'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak24',
      header: t('MSG_TXT_CHO_SDING'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak08',
      header: t('MSG_TXT_BUTTER_HEAD'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak09',
      header: t('MSG_TXT_KALE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak12',
      header: t('MSG_TXT_VITAMINS'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak51',
      header: t('MSG_TXT_SATIVA'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak52',
      header: t('MSG_TXT_YUREUM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak53',
      header: t('MSG_TXT_BOK_CHOY'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak54',
      header: t('MSG_TXT_SATIVA_YUREUM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak55',
      header: t('MSG_TXT_SATIVA_BOK_CHOY'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak56',
      header: t('MSG_TXT_SATIVA_RED'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak57',
      header: t('MSG_TXT_YUREUM_BOK_CHOY'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak58',
      header: t('MSG_TXT_YEREUM_RED'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak61',
      header: `${t('MSG_TXT_INSTALLATION')}_${t('MSG_TXT_FRDM_WIDE')}`,
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak63',
      header: `${t('MSG_TXT_INSTALLATION')}_${t('MSG_TXT_FRDM_SLIM')}`,
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak62',
      header: `BS/AS_${t('MSG_TXT_FRDM_WIDE')}`,
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak64',
      header: `BS/AS_${t('MSG_TXT_FRDM_SLIM')}`,
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak28',
      header: t('MSG_TXT_EUROP'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak29',
      header: t('MSG_TXT_OU_FML'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak30',
      header: t('MSG_TXT_ASSORT_WRAPS'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak31',
      header: t('MSG_TXT_FNC_VGT'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'totSum',
      header: t('MSG_TXT_SBSUM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
  ];

  const columnLayout = [
    'deptNm',
    { direction: 'horizontal',
      header: { text: t('MSG_TXT_ITG_AGRG_CHT') },
      items: [
        'pak01', 'pak02', 'pak03', 'pak04', 'pak05',
        'pak13', 'pak23', 'pak50', 'pak24', 'pak08',
        'pak09', 'pak12', 'pak51', 'pak52', 'pak53',
        'pak54', 'pak55', 'pak56', 'pak57', 'pak58',
        'pak61', 'pak63', 'pak62', 'pak64', 'pak28',
        'pak29', 'pak30', 'pak31', 'totSum',
      ],
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });

  view.rowIndicator.visible = true;
});

const initGridSelect = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'deptNm' },
    { fieldName: 'pak01001', dataType: 'number' },
    { fieldName: 'pak01002', dataType: 'number' },
    { fieldName: 'pak02001', dataType: 'number' },
    { fieldName: 'pak02002', dataType: 'number' },
    { fieldName: 'pak03001', dataType: 'number' },
    { fieldName: 'pak03002', dataType: 'number' },
    { fieldName: 'pak04001', dataType: 'number' },
    { fieldName: 'pak04002', dataType: 'number' },
    { fieldName: 'pak05001', dataType: 'number' },
    { fieldName: 'pak05002', dataType: 'number' },
    { fieldName: 'pak13001', dataType: 'number' },
    { fieldName: 'pak13002', dataType: 'number' },
    { fieldName: 'pak08003', dataType: 'number' },
    { fieldName: 'pak08004', dataType: 'number' },
    { fieldName: 'pak09003', dataType: 'number' },
    { fieldName: 'pak09004', dataType: 'number' },
    { fieldName: 'pak12003', dataType: 'number' },
    { fieldName: 'pak12004', dataType: 'number' },
    { fieldName: 'pak08002', dataType: 'number' },
    { fieldName: 'pak08001', dataType: 'number' },
    { fieldName: 'pak09002', dataType: 'number' },
    { fieldName: 'pak23001', dataType: 'number' },
    { fieldName: 'pak50001', dataType: 'number' },
    { fieldName: 'pak24001', dataType: 'number' },
    { fieldName: 'pak51001', dataType: 'number' },
    { fieldName: 'pak52001', dataType: 'number' },
    { fieldName: 'pak53001', dataType: 'number' },
    { fieldName: 'pak54001', dataType: 'number' },
    { fieldName: 'pak55001', dataType: 'number' },
    { fieldName: 'pak56001', dataType: 'number' },
    { fieldName: 'pak57001', dataType: 'number' },
    { fieldName: 'pak58001', dataType: 'number' },
    { fieldName: 'pak59001', dataType: 'number' },
    { fieldName: 'pak60001', dataType: 'number' },
    { fieldName: 'pak28001', dataType: 'number' },
    { fieldName: 'pak28002', dataType: 'number' },
    { fieldName: 'pak29001', dataType: 'number' },
    { fieldName: 'pak29002', dataType: 'number' },
    { fieldName: 'pak30002', dataType: 'number' },
    { fieldName: 'pak30001', dataType: 'number' },
    { fieldName: 'pak31002', dataType: 'number' },
    { fieldName: 'pak31001', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'deptNm', header: t('MSG_TXT_CENTER_DIVISION'), width: '100', styleName: 'text-left', footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } },
    { fieldName: 'pak01001',
      header: t('MSG_TXT_HL_SALAD_JUICE_SLIM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak01002',
      header: t('MSG_TXT_HL_SALAD_JUICE_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak02001',
      header: t('MSG_TXT_OU_CLD_VGT_DIET_SLIM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak02002',
      header: t('MSG_TXT_OU_CLD_VGT_DIET_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak03001',
      header: t('MSG_TXT_HL_DINING_TBL_SLIM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak03002',
      header: t('MSG_TXT_HL_DINING_TBL_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak04001',
      header: t('MSG_TXT_CANCER_HL_SLIM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak04002',
      header: t('MSG_TXT_CANCER_HL_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak05001',
      header: t('MSG_TXT_SLEEP_HEALING_SLIM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak05002',
      header: t('MSG_TXT_SLEEP_HEALING_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak13001',
      header: t('MSG_TXT_OU_CLD_FRESH_FOOD_SLIM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak13002',
      header: t('MSG_TXT_OU_CLD_FRESH_FOOD_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak23001',
      header: t('MSG_TXT_WELSF_MINI_VGT'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak50001',
      header: t('MSG_TXT_CLD_GWUP_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak24001',
      header: t('MSG_TXT_CHO_SDING'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak08003',
      header: t('MSG_TXT_BUTTER_HEAD_SLIM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak08004',
      header: t('MSG_TXT_BUTTER_HEAD_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak09003',
      header: t('MSG_TXT_KALE_SLIM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak09004',
      header: t('MSG_TXT_KALE_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak12003',
      header: t('MSG_TXT_VITAMINS_SLIM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak12004',
      header: t('MSG_TXT_VITAMINS_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak08002',
      header: t('MSG_TXT_BUTTER_KALE_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak08001',
      header: t('MSG_TXT_BUTTER_HEAD_VITAMINS_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak09002',
      header: t('MSG_TXT_KALE_VITAMINS_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak51001',
      header: t('MSG_TXT_SATIVA_MINI'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak52001',
      header: t('MSG_TXT_YUREUM_MINI'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak53001',
      header: t('MSG_TXT_BOK_CHOY_MINI'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak54001',
      header: t('MSG_TXT_SATIVA_YUREUM_MINI'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak55001',
      header: t('MSG_TXT_SATIVA_BOK_CHOY_MINI'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak56001',
      header: t('MSG_TXT_SATIVA_RED_MINI'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak57001',
      header: t('MSG_TXT_YUREUM_BOK_CHOY_MINI'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak58001',
      header: t('MSG_TXT_YEREUM_RED_MINI'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak59001',
      header: t('MSG_TXT_CHO_SDING_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak60001',
      header: t('MSG_TXT_CHO_SDING_SLIM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak28001',
      header: t('MSG_TXT_EUROP_SALAD_SLIM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak28002',
      header: t('MSG_TXT_EUROP_SALAD_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak29001',
      header: t('MSG_TXT_OU_FML_HL_VGT_SLIM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak29002',
      header: t('MSG_TXT_OU_FML_HL_VGT_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak30001',
      header: t('MSG_TXT_ASSORT_WRAPS_VGT_SLIM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak30002',
      header: t('MSG_TXT_ASSORT_WRAPS_VGT_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak31001',
      header: t('MSG_TXT_FNC_VGT_SLIM'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'pak31002',
      header: t('MSG_TXT_FNC_VGT_WIDE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
  ];

  // 헤더 부분 merge
  const columnLayout = [
    'deptNm',
    { direction: 'horizontal',
      header: { text: t('MSG_TXT_INSTALLATION') },
      items: [
        'pak01001', 'pak01002', 'pak02001', 'pak02002', 'pak03001', 'pak03002', 'pak04001',
        'pak04002', 'pak05001', 'pak05002', 'pak13001', 'pak13002', 'pak23001', 'pak50001',
        'pak24001', 'pak08003', 'pak08004', 'pak09003', 'pak09004', 'pak12003', 'pak12004',
        'pak08002', 'pak08001', 'pak09002', 'pak51001', 'pak52001', 'pak53001', 'pak54001',
        'pak55001', 'pak56001', 'pak57001', 'pak58001', 'pak59001', 'pak60001', 'pak28001',
        'pak28002', 'pak29001', 'pak29002', 'pak30001', 'pak30002', 'pak31001', 'pak31002',
      ],
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });

  view.rowIndicator.visible = true;
});

</script>
