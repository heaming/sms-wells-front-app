<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaSeedingSowPlanListM(W-SV-U-0130M01) - 모종 파종 예정리스트 조회
3. 작성자 : SaeRomI.Kim
4. 작성일 : 2023.07.06
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 모종파종예정리스트를 조회하는 화면 (http://localhost:3000/#/service/wwsna-seeding-sow-plan-list)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_VST_EXP_DT')"
          rules="required"
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_VST_EXP_DT')"
            :min-date="minDate"
            rules="required|date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <kw-input
            v-model="searchParams.cntrDtlNo"
            type="text"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
            rules="alpha_dash|max:14"
            :placeholder="`${$t('MSG_TXT_CNTR_NO')}-${t('MSG_TXT_CNTR_SN')}`"
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
            :page-size-options="optionPages"
            @change="fetchData"
          />
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }} : EA)</span>
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

import { codeUtil, useGlobal, useMeta, useDataService, getComponentType, gridUtil, defineGrid, popupUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { alert } = useGlobal();
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
  strtDt: now.format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  cntrDtlNo: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const optionPages = await codeUtil.getCodes('COD_PAGE_SIZE_OPTIONS');

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/seeding-sow-plans/paging', { params: { ...cachedParams, ...pageInfo.value } });
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
  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  cachedParams = cloneDeep(searchParams.value);

  const { cntrDtlNo } = cachedParams;
  // 계약상세번호 유효성 체크
  if (!isEmpty(cntrDtlNo)) {
    const idx = cntrDtlNo.indexOf('-');
    if (idx < 0 || isEmpty(cntrDtlNo.substring(idx + 1))) {
      // 올바른 계약상세번호로 조회 하세요.
      await alert(t('MSG_ALT_CNTR_DTL_NO_CONF'));
      return;
    }
    const cntrNo = cntrDtlNo.substring(0, idx);
    const cntrSn = cntrDtlNo.substring(idx + 1);
    cachedParams.cntrNo = cntrNo;
    cachedParams.cntrSn = cntrSn;
  }

  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/seeding-sow-plans/excel-download', { params: cachedParams });

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
    // 기준상품
    { fieldName: 'baseCntrDtlNo' }, // 계약상세번호
    { fieldName: 'baseCstNm' }, // 고객명
    { fieldName: 'basePdNm' }, // 상품명
    // 연결상품
    { fieldName: 'connCntrDtlNo' }, // 계약상세번호
    { fieldName: 'connSdingPkgNm' }, // 모종패키지
    { fieldName: 'connSdingPdNm' }, // 모종명
    { fieldName: 'connQty', dataType: 'number' }, // 수량
    // 모종정보
    { fieldName: 'vstDueDt' }, // 방문예정일
    { fieldName: 'sowDt' }, // 파종일자
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호

  ];

  const columns = [
    { fieldName: 'baseCntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true },
    { fieldName: 'baseCstNm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'basePdNm', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-left' },
    { fieldName: 'connCntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true },
    { fieldName: 'connSdingPkgNm', header: t('MSG_TXT_SDING_PKG'), width: '150', styleName: 'text-left' },
    { fieldName: 'connSdingPdNm', header: `${t('MSG_TXT_SDING')}${t('MSG_TXT_NM')}`, width: '100', styleName: 'text-left' },
    { fieldName: 'connQty', header: t('MSG_TXT_QTY'), width: '60', styleName: 'text-right' },
    { fieldName: 'vstDueDt', header: t('MSG_TXT_VST_EXP_DT'), width: '70', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'sowDt', header: t('MSG_TXT_SOW_DT'), width: '70', styleName: 'text-center', datetimeFormat: 'date' },
  ];

  // 헤더 부분 merge
  const layoutColumns = [
    {
      header: t('MSG_TXT_STND_PRDT'),
      direction: 'horizontal', // merge type
      items: ['baseCntrDtlNo', 'baseCstNm', 'basePdNm'],
    },
    {
      header: t('MSG_TXT_REL_PRDT'),
      direction: 'horizontal', // merge type
      items: ['connCntrDtlNo', 'connSdingPkgNm', 'connSdingPdNm', 'connQty'],
    },
    'vstDueDt', 'sowDt',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layoutColumns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'baseCntrDtlNo') {
      const cntrNo = g.getValue(itemIndex, 'cntrNo');
      const cntrSn = g.getValue(itemIndex, 'cntrSn');

      await popupUtil.open(`/popup#/service/wwsnb-individual-service-list?cntrNo=${cntrNo}&cntrSn=${cntrSn}`, { width: 2000, height: 1100 }, false);
    } else if (column === 'connCntrDtlNo') {
      const connCntrDtlNo = g.getValue(itemIndex, 'connCntrDtlNo');
      const idx = connCntrDtlNo.indexOf('-');
      const cntrNo = connCntrDtlNo.substr(0, idx);
      const cntrSn = connCntrDtlNo.substr(idx + 1);

      await popupUtil.open(`/popup#/service/wwsnb-individual-service-list?cntrNo=${cntrNo}&cntrSn=${cntrSn}`, { width: 2000, height: 1100 }, false);
    }
  };
});

</script>
