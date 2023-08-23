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
          @click="onClickSave"
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
  ];

  const columns = [
    { fieldName: 'dpYn', header: t('MSG_TXT_DP'), width: '70', styleName: 'text-center' },
    { fieldName: 'ostrYn', header: t('MSG_TXT_OSTR'), styleName: 'text-center', width: '70' },
    { fieldName: 'refriDiv', header: t('MSG_TXT_REFRI'), width: '90', styleName: 'text-center' },
    { fieldName: 'shipDiv', header: t('TXT_MSG_SPP_DV_CD'), width: '90', styleName: 'text-center' },
    { fieldName: 'receiptDiv', header: t('MSG_TXT_RCP_DV'), styleName: 'text-center', width: '90' },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '146', styleName: 'text-center' },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), styleName: 'text-left', width: '90' },
    { fieldName: 'sppOrdNo', header: `${t('MSG_TXT_DLVRY')}${t('MSG_TXT_SEQUENCE_NUMBER')}`, styleName: 'text-center', width: '154' },
    { fieldName: 'mchnModel', header: `${t('MSG_TXT_MCHN')}${t('MSG_TXT_MODEL')}`, styleName: 'text-left', width: '220' },
    { fieldName: 'mchnCstDtlNo', header: `${t('MSG_TXT_MCHN')}${t('MSG_TXT_CNTR_DTL_NO')}`, width: '150', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true },
    { fieldName: 'mchnCstNm', header: `${t('MSG_TXT_MCHN')}${t('MSG_TXT_CST_NM')}`, styleName: 'text-center', width: '100' },
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
    { fieldName: 'vstCenter', header: `${t('MSG_TXT_VST')}${t('MSG_TXT_CENTER_DIVISION')}`, styleName: 'text-left', width: '150' },
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
    if (column === 'mchnCstDtlNo') {
      const mchnCstDtlNo = g.getValue(itemIndex, 'mchnCstDtlNo');
      const idx = mchnCstDtlNo.indexOf('-');
      const cntrNo = mchnCstDtlNo.substr(0, idx);
      const cntrSn = mchnCstDtlNo.substr(idx + 1);
      await popupUtil.open(`/popup#/service/wwsnb-individual-service-list?cntrNo=${cntrNo}&cntrSn=${cntrSn}`, { width: 2000, height: 1100 }, false);
    }
  };
});

</script>
