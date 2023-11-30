<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA
 2. 프로그램 ID : WwsnaBsCsmbDeliveryBaseMgtM - BS소모품 배부기준 관리(W-SV-U-0295M01)
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.04.03
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 신입/개인/빌딩 BS소모품 배부를 위한 지급기준을 관리하는 화면
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 관리년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.mngtYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_MGT_YNM')"
          />
        </kw-search-item>
        <!-- 발주구분 -->
        <kw-search-item :label="$t('MSG_TXT_GO_DV')">
          <kw-select
            v-model="searchParams.goDvCd"
            first-option="all"
            :options="codes.GO_DV_CD"
          />
        </kw-search-item>
        <!-- 품목명 -->
        <kw-search-item :label="$t('MSG_TXT_ITM_NM')">
          <kw-select
            v-model="searchParams.csmbPdCd"
            first-option="all"
            :options="itmKnms"
            option-value="pdCd"
            option-label="pdNm"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 품목코드 -->
        <kw-search-item :label="$t('MSG_TXT_ITM_CD')">
          <kw-input
            v-model="searchParams.csmbPdCdStrt"
            upper-case
            type="text"
            rules="alpha_num|max:10"
            :label="$t('MSG_TXT_ITM_CD')"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.csmbPdCdEnd"
            upper-case
            type="text"
            rules="alpha_num|max:10"
            :label="$t('MSG_TXT_ITM_CD')"
          />
        </kw-search-item>
        <!-- SAP코드 -->
        <kw-search-item :label="$t('MSG_TXT_SAP_CD')">
          <kw-input
            v-model="searchParams.sapMatCdStrt"
            :label="$t('MSG_TXT_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeStrtSapCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.sapMatCdEnd"
            :label="$t('MSG_TXT_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeEndSapCd"
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
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-date-picker
          v-model="carriedOverParams.carriedOverFrom"
          class="w125"
          dense
          type="month"
        />
        <p>▶</p>
        <kw-date-picker
          v-model="carriedOverParams.carriedOverTo"
          class="w125"
          dense
          type="month"
        />
        <!-- 배부기준 이월 -->
        <kw-btn
          v-permission:create
          dense
          secondary
          :label="$t('MSG_TXT_DDLV_BASE_CRDOVR')"
          @click="onClickDdlvBaseCrdovr"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 배부기준 정보등록 -->
        <kw-btn
          v-permission:create
          primary
          dense
          :label="$t('MSG_BTN_DDLV_BASE_INF_RGST')"
          @click="onClickDdlvBaseInfGrst"
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

import { useGlobal, getComponentType, useMeta, defineGrid, codeUtil, useDataService, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { currentRoute } = useRouter();
const { modal, confirm, alert, notify } = useGlobal();
const { getConfig } = useMeta();
const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const itmKnms = ref();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'GO_DV_CD',
);

const searchParams = ref({
  mngtYm: dayjs().format('YYYYMM'),
  goDvCd: '',
  csmbPdCd: '',
  csmbPdCdStrt: '',
  csmbPdCdEnd: '',
  sapMatCdStrt: '',
  sapMatCdEnd: '',
  itmKnms: [],
});

// 배부기준 이월 정보
const carriedOverParams = ref({
  carriedOverFrom: '',
  carriedOverTo: '',
});

// SAP 시작코드 변경 시
function onChangeStrtSapCd() {
  const { sapMatCdStrt, sapMatCdEnd } = searchParams.value;

  if (!isEmpty(sapMatCdStrt) && !isEmpty(sapMatCdEnd) && sapMatCdStrt > sapMatCdEnd) {
    searchParams.value.sapMatCdStrt = sapMatCdStrt;
    searchParams.value.sapMatCdEnd = sapMatCdStrt;
  }
}

// SAP 종료코드 변경 시
function onChangeEndSapCd() {
  const { sapMatCdStrt, sapMatCdEnd } = searchParams.value;

  if (!isEmpty(sapMatCdStrt) && !isEmpty(sapMatCdEnd) && sapMatCdStrt > sapMatCdEnd) {
    searchParams.value.sapMatCdStrt = sapMatCdEnd;
    searchParams.value.sapMatCdEnd = sapMatCdEnd;
  }
}

// 품목명 조회
async function getAllItems() {
  const res = await dataService.get('/sms/wells/service/delivery-bases/item-information');
  itmKnms.value = res.data;
}

let cachedParams;

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/delivery-bases/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: bsCsmbDdlvBases, pageInfo: pagingResult } = res.data;
  pagingResult.needTotalCount = false;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(bsCsmbDdlvBases);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회버튼 클릭 시
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  pageInfo.value.needTotalCount = true;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/delivery-bases/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 배부기준 이월
async function onClickDdlvBaseCrdovr() {
  const { carriedOverFrom, carriedOverTo } = carriedOverParams.value;
  if (isEmpty(carriedOverFrom) || isEmpty(carriedOverTo)) {
    // {0}은(는) 필수 항목입니다. - 배부기준 이월대상 날짜
    await alert(`${t('MSG_TXT_MSG_TXT_DDLV_BASE')} ${t('MSG_TXT_CRDOVR')}${t('MSG_TXT_OBJ')} ${t('MSG_TXT__DT')} ${t('MSG_ALT_NCELL_REQUIRED_ITEM')}`);
    return;
  }

  if (carriedOverFrom === carriedOverTo) {
    // 배부기준 이월대상 날짜를 확인해주세요.
    await alert(t('MSG_ALT_DDLV_BASE_CRDOVR_OJ_DT_CONF'));
    return;
  }

  const fromYear = dayjs(carriedOverFrom).format('YYYY');
  const fromMonth = dayjs(carriedOverFrom).format('MM');
  const toYear = dayjs(carriedOverTo).format('YYYY');
  const toMonth = dayjs(carriedOverTo).format('MM');

  if (!await confirm(`${fromYear}-${fromMonth} ${t('MSG_TXT_DDLV_BASE_DTA')}\n${toYear}-${toMonth}${t('MSG_TXT_CRDOVR_DDLV_BASE')}`)) return;

  const res = await dataService.post('/sms/wells/service/delivery-bases/next-month', { carriedOverFrom, carriedOverTo });
  const { processCount } = res.data;
  if (processCount > 0) {
    // 이월작업이 완료되었습니다.
    notify(t('MSG_ALT_CRDOVR_WK_FSH'));
    pageInfo.value.needTotalCount = true;
    await fetchData();
  }
}

// 배부기준 정보 등록 팝업 호출
async function onClickDdlvBaseInfGrst() {
  const props = isEmpty(cachedParams) ? searchParams.value : cachedParams;
  const { result } = await modal({
    component: 'WwsnaBsCsmbDeliveryBaseRegP',
    componentProps: { ...props },
  });

  if (result) {
    if (isEmpty(cachedParams)) {
      await onClickSearch();
    } else {
      pageInfo.value.needTotalCount = true;
      await fetchData();
    }
  }
}

onMounted(async () => {
  // 품목조회
  await getAllItems();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'mngtYm' },
    { fieldName: 'csmbPdCd' },
    { fieldName: 'itmKnm' },
    { fieldName: 'mngtUnitCd' },
    { fieldName: 'mngtUnitNm' },
    { fieldName: 'goDvCd' },
    { fieldName: 'goDvNm' },
    { fieldName: 'goUprc', dataType: 'number' },
    { fieldName: 'boxUnitQty', dataType: 'number' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'nwcmrOrtYn' },
    { fieldName: 'nwcmrTpCd' },
    { fieldName: 'nwcmrTpNm' },
    { fieldName: 'nwcmrCmptBaseCd' },
    { fieldName: 'nwcmrCmptBaseNm' },
    { fieldName: 'nwcmrPdGrpCd' },
    { fieldName: 'nwcmrPdGrpNm' },
    { fieldName: 'nwcmrAccTpCd' },
    { fieldName: 'nwcmrAccTpNm' },
    { fieldName: 'nwcmrUnitAccN', dataType: 'number' },
    { fieldName: 'nwcmrUnitQty', dataType: 'number' },
    { fieldName: 'nwcmrLmQty', dataType: 'number' },
    { fieldName: 'nwcmrSortOdr', dataType: 'number' },
    { fieldName: 'indvOrtYn' },
    { fieldName: 'indvTpCd' },
    { fieldName: 'indvTpNm' },
    { fieldName: 'indvCmptBaseCd' },
    { fieldName: 'indvCmptBaseNm' },
    { fieldName: 'indvPdGrpCd' },
    { fieldName: 'indvPdGrpNm' },
    { fieldName: 'indvAccTpCd' },
    { fieldName: 'indvAccTpNm' },
    { fieldName: 'indvUnitAccN', dataType: 'number' },
    { fieldName: 'indvUnitQty', dataType: 'number' },
    { fieldName: 'indvLmQty', dataType: 'number' },
    { fieldName: 'indvSortOdr', dataType: 'number' },
    { fieldName: 'bldOrtYn' },
    { fieldName: 'bldTpCd' },
    { fieldName: 'bldTpNm' },
    { fieldName: 'bldCmptBaseCd' },
    { fieldName: 'bldCmptBaseNm' },
    { fieldName: 'bldPdGrpCd' },
    { fieldName: 'bldPdGrpNm' },
    { fieldName: 'bldAccTpCd' },
    { fieldName: 'bldAccTpNm' },
    { fieldName: 'bldUnitAccN', dataType: 'number' },
    { fieldName: 'bldUnitQty', dataType: 'number' },
    { fieldName: 'bldLmQty', dataType: 'number' },
    { fieldName: 'bldSortOdr', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'csmbPdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'itmKnm', header: t('MSG_TXT_ITM_NM'), width: '150', styleName: 'text-left' },
    { fieldName: 'mngtUnitNm', header: t('MSG_TXT_STOC_UNIT'), width: '80', styleName: 'text-center' },
    { fieldName: 'goDvNm', header: t('MSG_TXT_GO_DV'), width: '80', styleName: 'text-center' },
    { fieldName: 'goUprc', header: t('MSG_TXT_UPRC'), width: '100', styleName: 'text-center' },
    { fieldName: 'boxUnitQty', header: t('MSG_TXT_BOX_UNIT_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '95', styleName: 'text-center' },
    { fieldName: 'nwcmrOrtYn', header: t('MSG_TXT_ORT_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'nwcmrTpNm', header: `${t('MSG_TXT_TYPE')}1`, width: '100', styleName: 'text-center' },
    { fieldName: 'nwcmrCmptBaseNm', header: `${t('MSG_TXT_TYPE')}2`, width: '100', styleName: 'text-center' },
    { fieldName: 'nwcmrPdGrpNm', header: t('MSG_TXT_PDGRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'nwcmrAccTpNm', header: t('MSG_TXT_ACC_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'nwcmrUnitAccN', header: t('MSG_TXT_ACC_UNIT'), width: '100', styleName: 'text-right' },
    { fieldName: 'nwcmrUnitQty', header: t('MSG_TXT_QTY_UNIT'), width: '100', styleName: 'text-right' },
    { fieldName: 'nwcmrLmQty', header: t('MSG_TXT_LM_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'nwcmrSortOdr', header: t('MSG_TXT_SORT_ORDER'), width: '100', styleName: 'text-right', numberFormat: '######' },
    { fieldName: 'indvOrtYn', header: t('MSG_TXT_ORT_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'indvTpNm', header: `${t('MSG_TXT_TYPE')}1`, width: '100', styleName: 'text-center' },
    { fieldName: 'indvCmptBaseNm', header: `${t('MSG_TXT_TYPE')}2`, width: '100', styleName: 'text-center' },
    { fieldName: 'indvPdGrpNm', header: t('MSG_TXT_PDGRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'indvAccTpNm', header: t('MSG_TXT_ACC_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'indvUnitAccN', header: t('MSG_TXT_ACC_UNIT'), width: '100', styleName: 'text-right' },
    { fieldName: 'indvUnitQty', header: t('MSG_TXT_QTY_UNIT'), width: '100', styleName: 'text-right' },
    { fieldName: 'indvLmQty', header: t('MSG_TXT_LM_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'indvSortOdr', header: t('MSG_TXT_SORT_ORDER'), width: '100', styleName: 'text-right', numberFormat: '######' },
    { fieldName: 'bldOrtYn', header: t('MSG_TXT_ORT_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldTpNm', header: `${t('MSG_TXT_TYPE')}1`, width: '100', styleName: 'text-center' },
    { fieldName: 'bldCmptBaseNm', header: `${t('MSG_TXT_TYPE')}2`, width: '100', styleName: 'text-center' },
    { fieldName: 'bldPdGrpNm', header: t('MSG_TXT_PDGRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldAccTpNm', header: t('MSG_TXT_ACC_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldUnitAccN', header: t('MSG_TXT_ACC_UNIT'), width: '100', styleName: 'text-right' },
    { fieldName: 'bldUnitQty', header: t('MSG_TXT_QTY_UNIT'), width: '100', styleName: 'text-right' },
    { fieldName: 'bldLmQty', header: t('MSG_TXT_LM_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'bldSortOdr', header: t('MSG_TXT_SORT_ORDER'), width: '100', styleName: 'text-right', numberFormat: '######' },
  ];

  const columnLayout = [
    'goDvNm', 'sapMatCd', 'csmbPdCd', 'itmKnm', 'mngtUnitNm', 'boxUnitQty',
    { header: t('MSG_TXT_NWCMR'),
      direction: 'horizontal',
      items: [
        { header: t('MSG_TXT_ORT_YN'), direction: 'horizontal', hideChildHeaders: true, items: ['nwcmrOrtYn'] },
        { header: t('MSG_TXT_MSG_TXT_DDLV_BASE'),
          direction: 'horizontal',
          items: ['nwcmrTpNm', 'nwcmrCmptBaseNm', 'nwcmrLmQty', 'nwcmrPdGrpNm', 'nwcmrAccTpNm', 'nwcmrUnitAccN', 'nwcmrUnitQty', 'nwcmrSortOdr'],
        },
      ],
    },
    {
      header: t('MSG_TXT_INDV'),
      direction: 'horizontal',
      items: [
        { header: t('MSG_TXT_ORT_YN'), direction: 'horizontal', hideChildHeaders: true, items: ['indvOrtYn'] },
        { header: t('MSG_TXT_MSG_TXT_DDLV_BASE'),
          direction: 'horizontal',
          items: ['indvTpNm', 'indvCmptBaseNm', 'indvLmQty', 'indvPdGrpNm', 'indvAccTpNm', 'indvUnitAccN', 'indvUnitQty', 'indvSortOdr'],
        },
      ],
    },
    {
      header: t('MSG_TXT_BUILDING'),
      direction: 'horizontal',
      items: [
        { header: t('MSG_TXT_ORT_YN'), direction: 'horizontal', hideChildHeaders: true, items: ['bldOrtYn'] },
        { header: t('MSG_TXT_MSG_TXT_DDLV_BASE'),
          direction: 'horizontal',
          items: ['bldTpNm', 'bldCmptBaseNm', 'bldLmQty', 'bldPdGrpNm', 'bldAccTpNm', 'bldUnitAccN', 'bldUnitQty', 'bldSortOdr'],
        },
      ],
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellDblClicked = async (grid, clickData) => {
    const { mngtYm, csmbPdCd } = grid.getValues(clickData.itemIndex);

    if (!isEmpty(mngtYm) && !isEmpty(csmbPdCd)) {
      const { result } = await modal({
        component: 'WwsnaBsCsmbDeliveryBaseRegP',
        componentProps: { mngtYm, csmbPdCd },
      });

      if (result) {
        pageInfo.value.needTotalCount = true;
        await fetchData();
      }
    }
  };
});

</script>
