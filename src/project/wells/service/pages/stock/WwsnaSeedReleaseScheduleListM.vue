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
- 모종출고예정리스트를 조회하고 확정하는 화면 (http://localhost:3000/#/service/wwsna-seed-release-schedule-list)
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
        <!-- 조회구분 -->
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
        <!-- 조회기간, 조회일자 -->
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
        <!-- 유/무상구분 -->
        <kw-search-item
          :label="`${t('MSG_TXT_REFRI')}${t('MSG_TXT_DIV')}`"
        >
          <kw-select
            v-model="searchParams.refriDivCd"
            :options="codes.REFRI_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 배송기간 -->
        <kw-search-item
          :label="t('TXT_MSG_SPP_DV_CD')"
        >
          <kw-select
            v-model="searchParams.sppDvCd"
            :options="codes.ITM_IOST_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 완료처리 -->
        <kw-search-item
          :label="t('MSG_TXT_FSH_PROCS')"
        >
          <kw-select
            v-model="searchParams.fshProcsCd"
            :options="filterCodes.fshProcsCd"
            first-option="all"
          />
        </kw-search-item>
        <!-- 패키지구분 -->
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
        <!-- 출고여부 -->
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
        <!-- 엑셀다운로드 -->
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
        <!-- 입금일자변경 -->
        <kw-btn
          v-permission:update
          secondary
          dense
          :label="`${t('MSG_TXT_DP_DT')}${t('MSG_TXT_CH')}`"
          :disable="pageInfo.totalCount === 0"
          @click="onClickSave"
        />
        <!-- 집계표출력 -->
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
        <!-- 출고확정일저장 -->
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

import { codeUtil, useMeta, useGlobal, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { notify, alert } = useGlobal();
const { currentRoute } = useRouter();
const router = useRouter();

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

// 조회조건 공통코드 필터링
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

// 조회버튼 클릭
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

  // 출고확정일 셋팅
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
  // 데이터 조회
  const res = await dataService.get('/sms/wells/service/seed-release-schedules/aggregations', { params: cachedParams });

  const date = `${strtDt.substring(0, 4)}-${strtDt.substring(4, 6)}-${strtDt.substring(6, 8)}`;
  // 엑셀파일명
  let fileName = `${t('MSG_TXT_ALL')}_${date}`;

  const view = isEmpty(svBizHclsfCd) ? grdTotalRef.value.getView() : grdSelectRef.value.getView();
  const gridView = grdMainRef.value.getView();

  // 조회구분이 전체가 아닌 경우
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

    // 이중헤더명 지정
    view.__originalLayouts__[1].header.text = headerNm;
  }

  // 엑셀파일 조회조건 셋팅
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
    { fieldName: 'dpYn', dataType: 'text' }, // 입금여부
    { fieldName: 'ostrYn', dataType: 'text' }, // 출고여부
    { fieldName: 'refriDiv', dataType: 'text' }, // 유/무상
    { fieldName: 'shipDiv', dataType: 'text' }, // 배송구분
    { fieldName: 'receiptDiv', dataType: 'text' }, // 접수구분
    { fieldName: 'cntrDtlNo', dataType: 'text' }, // 계약상세번호
    { fieldName: 'cstNm', dataType: 'text' }, // 고객명
    { fieldName: 'sppOrdNo', dataType: 'text' }, // 배송번호
    { fieldName: 'mchnModel', dataType: 'text' }, // 기기모델
    { fieldName: 'mchnCstDtlNo', dataType: 'text' }, // 기기계약상세번호
    { fieldName: 'mchnCstNm', dataType: 'text' }, // 기기고객명
    { fieldName: 'ctrlPkg', dataType: 'text' }, // 현재패키지
    { fieldName: 'shipPkg', dataType: 'text' }, // 배송패키지
    { fieldName: 'sding1', dataType: 'text' }, // 모종1
    { fieldName: 'qty1', dataType: 'number' }, // 수량1
    { fieldName: 'sding2', dataType: 'text' }, // 모종2
    { fieldName: 'qty2', dataType: 'number' }, // 수량2
    { fieldName: 'sding3', dataType: 'text' }, // 모종3
    { fieldName: 'qty3', dataType: 'number' }, // 수량3
    { fieldName: 'sding4', dataType: 'text' }, // 모종4
    { fieldName: 'qty4', dataType: 'number' }, // 수량4
    { fieldName: 'sding5', dataType: 'text' }, // 모종5
    { fieldName: 'qty5', dataType: 'number' }, // 수량5
    { fieldName: 'todayCnl', dataType: 'text' }, // 당일취소
    { fieldName: 'mchnDemDt', dataType: 'text' }, // 기기철거일자
    { fieldName: 'receiptDt', dataType: 'text' }, // 접수일자
    { fieldName: 'vstDt', dataType: 'text' }, // 방문일자
    { fieldName: 'ostrScheDt', dataType: 'text' }, // 출고예정일자
    { fieldName: 'bsFshDt', dataType: 'text' }, // BS완료일자
    { fieldName: 'dpDt', dataType: 'text' }, // 입금일자
    { fieldName: 'ostrCnfmDt', dataType: 'text' }, // 출고확정일자
    { fieldName: 'sdingRcgWareNm', dataType: 'text' }, // 모종수령창고
    { fieldName: 'vstCenter', dataType: 'text' }, // 방문센터
    { fieldName: 'vstIchr', dataType: 'text' }, // 방문담당
    { fieldName: 'ichrCtnt', dataType: 'text' }, // 담당연락처
    { fieldName: 'cstCtnt', dataType: 'text' }, // 고객연락처
    { fieldName: 'cstZip', dataType: 'text' }, // 고객우편번호
    { fieldName: 'cstAdr', dataType: 'text' }, // 고객주소
    { fieldName: 'refriDvCd', dataType: 'text' }, // 유무상코드
    { fieldName: 'cntrSn', dataType: 'text' }, // 계약순번
    { fieldName: 'svBizHclsfCd', dataType: 'text' }, // 서비스업무대분류코드
    { fieldName: 'svBizDclsfCd', dataType: 'text' }, // 서비스업무세분류코드
    { fieldName: 'sppPlanSn', dataType: 'number' }, // 모종배송일련번호
    { fieldName: 'sdingPdCd1', dataType: 'text' }, // 모종1 상품코드
    { fieldName: 'sowDt1', dataType: 'text' }, // 모종2 파종일자
    { fieldName: 'sdingPdCd2', dataType: 'text' }, // 모종2 상품코드
    { fieldName: 'sowDt2', dataType: 'text' }, // 모종2 파종일자
    { fieldName: 'sdingPdCd3', dataType: 'text' }, // 모종3 상품코드
    { fieldName: 'sowDt3', dataType: 'text' }, // 모종3 파종일자
    { fieldName: 'sdingPdCd4', dataType: 'text' }, // 모종4 상품코드
    { fieldName: 'sowDt4', dataType: 'text' }, // 모종4 파종일자
    { fieldName: 'sdingPdCd5', dataType: 'text' }, // 모종5 상품코드
    { fieldName: 'sowDt5', dataType: 'text' }, // 모종5 파종일자
    { fieldName: 'sdingPkgPdCd', dataType: 'text' }, // 모종패키지상품코드
    { fieldName: 'mngrDvCd', dataType: 'text' }, // 관리구분코드
    { fieldName: 'dpEpttNm', dataType: 'text' }, // 입금예정자명
    { fieldName: 'ogTpCd', dataType: 'text' }, // 조직유형코드
    { fieldName: 'prtnrNo', dataType: 'text' }, // 파트너번호
    { fieldName: 'recapCsAmt', dataType: 'number' }, // 유상비용금액
    { fieldName: 'sppDvCd', dataType: 'text' }, // 배송구분코드
    { fieldName: 'sdingMcnrPdCd', dataType: 'text' }, // 모종기계상품코드
    { fieldName: 'cstSvAsnNo', dataType: 'text' }, // 고객서비스배정번호
    { fieldName: 'mchnCstNo', dataType: 'text' }, // 기기고객번호
    { fieldName: 'cntrNo', dataType: 'text' }, // 계약번호
    { fieldName: 'vstDuedt', dataType: 'text' }, // 방문예정일자
    { fieldName: 'cstCralLocaraTno', dataType: 'text' }, // 고객휴대지역전화번호
    { fieldName: 'cstMexnoEncr', dataType: 'text' }, // 고객전화국번호
    { fieldName: 'cstCralIdvTno', dataType: 'text' }, // 고객휴대개별전화번호
    { fieldName: 'svPdCd', dataType: 'text' }, // 서비스상품코드
  ];

  const columns = [
    { fieldName: 'dpYn', header: t('MSG_TXT_DP'), width: '70', styleName: 'text-center' },
    { fieldName: 'ostrYn', header: t('MSG_TXT_OSTR'), styleName: 'text-center', width: '70' },
    { fieldName: 'refriDiv', header: t('MSG_TXT_REFRI'), width: '90', styleName: 'text-center' },
    { fieldName: 'shipDiv', header: t('TXT_MSG_SPP_DV_CD'), width: '90', styleName: 'text-center' },
    { fieldName: 'receiptDiv', header: t('MSG_TXT_RCP_DV'), styleName: 'text-center', width: '90' },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '146', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: false },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), styleName: 'text-left', width: '90' },
    { fieldName: 'sppOrdNo', header: `${t('MSG_TXT_DLVRY')}${t('MSG_TXT_SEQUENCE_NUMBER')}`, styleName: 'text-center', width: '154' },
    { fieldName: 'mchnModel', header: `${t('MSG_TXT_MCHN')}${t('MSG_TXT_MODEL')}`, styleName: 'text-left', width: '220' },
    { fieldName: 'mchnCstDtlNo', header: `${t('MSG_TXT_MCHN')}${t('MSG_TXT_CNTR_DTL_NO')}`, width: '150', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: false },
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

      // 개인별서비스현황 연결
      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    } else if (column === 'mchnCstDtlNo') {
      const mchnCstDtlNo = g.getValue(itemIndex, 'mchnCstDtlNo');
      const idx = mchnCstDtlNo.indexOf('-');
      const cntrNo = mchnCstDtlNo.substr(0, idx);
      const cntrSn = mchnCstDtlNo.substr(idx + 1);

      // 개인별서비스현황 연결
      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
});

const initGridTotal = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'deptNm' }, // 센터명
    { fieldName: 'pak01', dataType: 'number' }, // 샐러드
    { fieldName: 'pak02', dataType: 'number' }, // 채소식단
    { fieldName: 'pak03', dataType: 'number' }, // 건강밥상
    { fieldName: 'pak04', dataType: 'number' }, // 항암건강
    { fieldName: 'pak05', dataType: 'number' }, // 숙면힐링
    { fieldName: 'pak13', dataType: 'number' }, // 이유식
    { fieldName: 'pak23', dataType: 'number' }, // 미니
    { fieldName: 'pak50', dataType: 'number' }, // 아이쑥쑥유엔젤
    { fieldName: 'pak24', dataType: 'number' }, // 선택모종
    { fieldName: 'pak08', dataType: 'number' }, // 버터헤드
    { fieldName: 'pak09', dataType: 'number' }, // 케일
    { fieldName: 'pak12', dataType: 'number' }, // 비타민다채
    { fieldName: 'pak51', dataType: 'number' }, // 먹치마
    { fieldName: 'pak52', dataType: 'number' }, // 여름청치마
    { fieldName: 'pak53', dataType: 'number' }, // 청경채
    { fieldName: 'pak54', dataType: 'number' }, // 먹치마+여름청치마
    { fieldName: 'pak55', dataType: 'number' }, // 먹치마+청경채
    { fieldName: 'pak56', dataType: 'number' }, // 먹치마+적소렐
    { fieldName: 'pak57', dataType: 'number' }, // 여름청치마+청경채
    { fieldName: 'pak58', dataType: 'number' }, // 여름청치마+적소렐
    { fieldName: 'pak61', dataType: 'number' }, // 설치_자유WIDE
    { fieldName: 'pak62', dataType: 'number' }, // BS/AS_자유WIDE
    { fieldName: 'pak63', dataType: 'number' }, // 설치_자유SLIM
    { fieldName: 'pak64', dataType: 'number' }, // BS/AS_자유SLIM
    { fieldName: 'pak28', dataType: 'number' }, // 유러피안
    { fieldName: 'pak29', dataType: 'number' }, // 우리가족
    { fieldName: 'pak30', dataType: 'number' }, // 모둠쌈
    { fieldName: 'pak31', dataType: 'number' }, // 기능청채소
    { fieldName: 'totSum', dataType: 'number' }, // 소계
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
    { fieldName: 'deptNm' }, // 센터명
    { fieldName: 'pak01001', dataType: 'number' }, // 건강샐러드/주스SLIM
    { fieldName: 'pak01002', dataType: 'number' }, // 건강샐러드/주스WIDE
    { fieldName: 'pak02001', dataType: 'number' }, // 우리아이채소식단SLIM
    { fieldName: 'pak02002', dataType: 'number' }, // 우리아이채소식단WIDE
    { fieldName: 'pak03001', dataType: 'number' }, // 건강밥상SLIM
    { fieldName: 'pak03002', dataType: 'number' }, // 건강밥상WIDE
    { fieldName: 'pak04001', dataType: 'number' }, // 항암건강SLIM
    { fieldName: 'pak04002', dataType: 'number' }, // 항암건강WIDE
    { fieldName: 'pak05001', dataType: 'number' }, // 숙면힐링SLIM
    { fieldName: 'pak05002', dataType: 'number' }, // 숙면힐링WIDE
    { fieldName: 'pak13001', dataType: 'number' }, // 우리아이신선이유식SLIM
    { fieldName: 'pak13002', dataType: 'number' }, // 우리아이신선이유식WIDE
    { fieldName: 'pak08003', dataType: 'number' }, // 버터헤드SLIME
    { fieldName: 'pak08004', dataType: 'number' }, // 버터헤드WIDE
    { fieldName: 'pak09003', dataType: 'number' }, // 케일SLIM
    { fieldName: 'pak09004', dataType: 'number' }, // 케일WIDE
    { fieldName: 'pak12003', dataType: 'number' }, // 비타민다채SLIM
    { fieldName: 'pak12004', dataType: 'number' }, // 비타민다채WIDE
    { fieldName: 'pak08002', dataType: 'number' }, // 버터헤드+케일WIDE
    { fieldName: 'pak08001', dataType: 'number' }, // 버터헤드+비타민다채WIDE
    { fieldName: 'pak09002', dataType: 'number' }, // 케일+비타민다채WIDE
    { fieldName: 'pak23001', dataType: 'number' }, // 웰스팜미니채소
    { fieldName: 'pak50001', dataType: 'number' }, // 아이쑥쑥유엔젤WIDE
    { fieldName: 'pak24001', dataType: 'number' }, // 선택모종
    { fieldName: 'pak51001', dataType: 'number' }, // 먹치마_미니
    { fieldName: 'pak52001', dataType: 'number' }, // 여름청치마_미니
    { fieldName: 'pak53001', dataType: 'number' }, // 청경채_미니
    { fieldName: 'pak54001', dataType: 'number' }, // 먹치마+여름청치마_미니
    { fieldName: 'pak55001', dataType: 'number' }, // 먹치마+청경채_미니
    { fieldName: 'pak56001', dataType: 'number' }, // 먹치마+적소렐_미니
    { fieldName: 'pak57001', dataType: 'number' }, // 여름청치마+청경채_미니
    { fieldName: 'pak58001', dataType: 'number' }, // 여름청치마+적소렐_미니
    { fieldName: 'pak59001', dataType: 'number' }, // 선택모종WIDE
    { fieldName: 'pak60001', dataType: 'number' }, // 선택모종SLIM
    { fieldName: 'pak28001', dataType: 'number' }, // 유러피안샐러드SLIM
    { fieldName: 'pak28002', dataType: 'number' }, // 유러피안샐러드WIDE
    { fieldName: 'pak29001', dataType: 'number' }, // 우리가족건강채소SLIM
    { fieldName: 'pak29002', dataType: 'number' }, // 우리가족건강채소WIDE
    { fieldName: 'pak30002', dataType: 'number' }, // 모둠쌈채소WIDE
    { fieldName: 'pak30001', dataType: 'number' }, // 모둠쌈채소SLIM
    { fieldName: 'pak31002', dataType: 'number' }, // 기능성채소WIDE
    { fieldName: 'pak31001', dataType: 'number' }, // 기능성채소SLIM
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
