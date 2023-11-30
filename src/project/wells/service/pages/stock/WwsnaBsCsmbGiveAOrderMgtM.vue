<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA
 2. 프로그램 ID : WwsnaBsCsmbGiveAOrderMgtM(W-SV-U-0014M01) - BS소모품 발주수량 산출
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.07.06
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - BS소모품 발주 수량을 산출하기 위해 배부수량과 물류센터 재고를 조회한 후 산출식을 통해 발주수량을 계산하고 저장하는 화면
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
            @change="onChangeMngtYm"
          />
        </kw-search-item>
        <!-- 발주구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_GO_DV')"
        >
          <kw-select
            v-model="searchParams.goDvCd"
            first-option="all"
            :options="codes.GO_DV_CD"
          />
        </kw-search-item>
        <!-- 품목종류 -->
        <kw-search-item :label="$t('MSG_TXT_ITM_KND')">
          <kw-select
            v-model="searchParams.itmKndCd"
            first-option="all"
            :options="codes.ITM_KND_CD"
            @change="onChangeItmKndCd"
          />
        </kw-search-item>
        <!-- 품목명 -->
        <kw-search-item :label="$t('MSG_TXT_ITM_NM')">
          <kw-select
            v-model="searchParams.csmbPdCd"
            first-option="all"
            :options="productCodes"
            option-value="svpdPdCd"
            option-label="svpdNmKor"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.csmbPdCdFrom"
            upper-case
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num|max:10"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.csmbPdCdTo"
            upper-case
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num|max:10"
          />
        </kw-search-item>
        <!-- SAP 코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_SAP_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.sapMatCdFrom"
            rules="numeric|max:18"
            :label="$t('MSG_TXT_SAP_CD')"
            @change="onChangeStrtSapCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.sapMatCdTo"
            rules="numeric|max:18"
            :label="$t('MSG_TXT_SAP_CD')"
            @change="onChangeEndSapCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 성수재고 -->
        <kw-search-item
          :label="$t('MSG_TXT_SGSU_STOC')"
        >
          <kw-option-group
            v-model="searchParams.sgsuExcludeYn"
            :model-value="'0'"
            type="radio"
            :options="[
              {codeId: '0', codeName: $t('MSG_TXT_INC')},
              {codeId: '1', codeName: $t('MSG_TXT_EXCD')},
            ]"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>

        <kw-btn
          v-permission:create
          :label="$t('MSG_BTN_SAVE')"
          dense
          grid-action
          :disable="pageInfo.totalCount === 0"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
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

const { notify } = useGlobal();
const { currentRoute } = useRouter();
const dataService = useDataService();
const { getConfig } = useMeta();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const productCodes = ref([]);
const pageInfo = ref({
  totalCount: 0,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const curYm = dayjs().format('YYYYMM');

const searchParams = ref({
  mngtYm: curYm,
  goDvCd: '',
  itmKndCd: '',
  csmbPdCd: '',
  csmbPdCdFrom: '',
  csmbPdCdTo: '',
  sapMatCdFrom: '',
  sapMatCdTo: '',
  sgsuExcludeYn: '0',
});

const ddlvYmNms = ref({
  mms6bDdlvNm: dayjs(curYm).add(-6, 'month').format('YYYY-MM'),
  mms5bDdlvNm: dayjs(curYm).add(-5, 'month').format('YYYY-MM'),
  mms4bDdlvNm: dayjs(curYm).add(-4, 'month').format('YYYY-MM'),
  mms3bDdlvNm: dayjs(curYm).add(-3, 'month').format('YYYY-MM'),
  mms2bDdlvNm: dayjs(curYm).add(-2, 'month').format('YYYY-MM'),
  mms1bDdlvNm: dayjs(curYm).add(-1, 'month').format('YYYY-MM'),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'GO_DV_CD',
  'ITM_KND_CD',
);

const isNowYyMm = computed(() => searchParams.value.mngtYm === curYm);

const baseYmd = computed(() => {
  const { mngtYm } = searchParams.value;
  let returnValue = '';

  if (isNowYyMm.value) {
    returnValue = dayjs().format('YYYYMMDD');
  } else {
    returnValue = `${mngtYm}01`;
  }

  return returnValue;
});

// 관리년월 변경 시 그리드 헤더명 변경
async function onChangeMngtYm() {
  const { mngtYm } = searchParams.value;
  ddlvYmNms.value.mms6bDdlvNm = dayjs(mngtYm).add(-6, 'month').format('YYYY-MM');
  ddlvYmNms.value.mms5bDdlvNm = dayjs(mngtYm).add(-5, 'month').format('YYYY-MM');
  ddlvYmNms.value.mms4bDdlvNm = dayjs(mngtYm).add(-4, 'month').format('YYYY-MM');
  ddlvYmNms.value.mms3bDdlvNm = dayjs(mngtYm).add(-3, 'month').format('YYYY-MM');
  ddlvYmNms.value.mms2bDdlvNm = dayjs(mngtYm).add(-2, 'month').format('YYYY-MM');
  ddlvYmNms.value.mms1bDdlvNm = dayjs(mngtYm).add(-1, 'month').format('YYYY-MM');

  const view = grdMainRef.value.getView();

  view.setColumnLayout([]);

  view.setColumns([
    { fieldName: 'goDvNm', header: t('MSG_TXT_DIV'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'svpdSapCd', header: t('MSG_TXT_SAPCD'), width: '95', styleName: 'text-center', editable: false, footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } },
    { fieldName: 'csmbPdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center', editable: false },
    { fieldName: 'itmKnm', header: t('MSG_TXT_ITM_NM'), width: '190', styleName: 'text-left', editable: false },
    { fieldName: 'mms6bDdlvQty', header: `${ddlvYmNms.value.mms6bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms5bDdlvQty', header: `${ddlvYmNms.value.mms5bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms4bDdlvQty', header: `${ddlvYmNms.value.mms4bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms3bDdlvQty', header: `${ddlvYmNms.value.mms3bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms2bDdlvQty', header: `${ddlvYmNms.value.mms2bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms1bDdlvQty', header: `${ddlvYmNms.value.mms1bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mmAvDdlvQty', header: t('MSG_TXT_MM_AV_DDLV'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'strStnbQty', header: t('MSG_TXT_STR_STNB'), width: '130', rules: 'required|min_value:0|max_value:9999999999', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'pajuLgstCnrStocQty', header: t('MSG_TXT_PAJU_STOC'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'sgsuLgstCnrStocQty', header: t('MSG_TXT_SGSU_STOC'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'woStocQty', header: t('MSG_TXT_FNL_STOC'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'stocPersMmN', header: t('MSG_TXT_STOC_CTN_MM'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'etExsDt', header: t('MSG_TXT_ET_EXS_DT'), width: '130', datetimeFormat: 'yyyy-MM-dd', styleName: 'text-center', editable: false },
    { fieldName: 'goUprc', header: t('MSG_TXT_UPRC'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'ncstQty', header: t('MSG_TXT_NCST_QT'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'goQty', header: t('MSG_TXT_GO_QTY'), width: '130', rules: 'required|min_value:0|max_value:999999999999', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'goAmt', header: t('MSG_TXT_GO_AMT'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'minOrdQty', header: t('MSG_TXT_MOQ'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'pypdDc', header: t('MSG_TXT_LEAD_TIME_SHORT'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'rmkCn', header: t('MSG_TXT_RMK_MO'), width: '130', styleName: 'text-left', editable: false },
  ]);

  view.setColumnLayout([
    'goDvNm', 'svpdSapCd', 'csmbPdCd', 'itmKnm',
    {
      header: t('MSG_TXT_DDLV_QT_EA'),
      direction: 'horizontal',
      items: ['mms6bDdlvQty', 'mms5bDdlvQty', 'mms4bDdlvQty', 'mms3bDdlvQty', 'mms2bDdlvQty', 'mms1bDdlvQty', 'mmAvDdlvQty'],
    },
    {
      header: t('MSG_TXT_STOC_EA'),
      direction: 'horizontal',
      items: ['strStnbQty', 'pajuLgstCnrStocQty', 'sgsuLgstCnrStocQty', 'woStocQty', 'stocPersMmN'],
    },
    'etExsDt', 'goUprc', 'ncstQty', 'goQty', 'goAmt', 'minOrdQty', 'pypdDc', 'rmkCn',
  ]);
}

// 품목 종류에 해당하는 품목명 조회
async function onChangeItmKndCd() {
  productCodes.value = [];
  const { itmKndCd } = searchParams.value;
  if (!isEmpty(itmKndCd)) {
    const res = await dataService.get(`/sms/wells/service/bs-consumables/${itmKndCd}/product-codes`);

    productCodes.value = res.data;
  }
}

// 시작 SAP코드 변경 시
function onChangeStrtSapCd() {
  const { sapMatCdFrom, sapMatCdTo } = searchParams.value;

  if (!isEmpty(sapMatCdFrom) && !isEmpty(sapMatCdTo) && sapMatCdFrom > sapMatCdTo) {
    searchParams.value.sapMatCdFrom = sapMatCdFrom;
    searchParams.value.sapMatCdTo = sapMatCdFrom;
  }
}

// 종료 SAP코드 변경 시
function onChangeEndSapCd() {
  const { sapMatCdFrom, sapMatCdTo } = searchParams.value;

  if (!isEmpty(sapMatCdFrom) && !isEmpty(sapMatCdTo) && sapMatCdFrom > sapMatCdTo) {
    searchParams.value.sapMatCdFrom = sapMatCdTo;
    searchParams.value.sapMatCdTo = sapMatCdTo;
  }
}

let cachedParams;

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/bs-consumables', { params: cachedParams });
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(res.data);
  pageInfo.value.totalCount = res.data.length;
}

// 조회버튼 클릭 시
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/bs-consumables', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const rowValues = gridUtil.getAllRowValues(view);

  if (!await gridUtil.validate(view)) { return; }

  const res = await dataService.post('/sms/wells/service/bs-consumables', rowValues);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// round 처리
function roundExcel(val, position) {
  if (Number(position) >= 0) {
    return parseFloat(val.toFixed(position));
  }

  position = 10 ** position;
  const n = Math.round(val * position);

  return parseFloat(n.toFixed(0));
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'mngtYm' },
    { fieldName: 'goDvCd' },
    { fieldName: 'goDvNm' },
    { fieldName: 'svpdSapCd' },
    { fieldName: 'csmbPdCd' },
    { fieldName: 'itmKnm' },
    { fieldName: 'mngtUnitCd' },
    { fieldName: 'mms6bDdlvQty', dataType: 'number' },
    { fieldName: 'mms5bDdlvQty', dataType: 'number' },
    { fieldName: 'mms4bDdlvQty', dataType: 'number' },
    { fieldName: 'mms3bDdlvQty', dataType: 'number' },
    { fieldName: 'mms2bDdlvQty', dataType: 'number' },
    { fieldName: 'mms1bDdlvQty', dataType: 'number' },
    { fieldName: 'mmAvDdlvQty', dataType: 'number' },
    { fieldName: 'strStnbQty', dataType: 'number' },
    { fieldName: 'pajuLgstCnrStocQty', dataType: 'number' },
    { fieldName: 'sgsuLgstCnrStocQty', dataType: 'number' },
    { fieldName: 'woStocQty', dataType: 'number' },
    { fieldName: 'stocPersMmN', dataType: 'number' },
    { fieldName: 'etExsDt', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'goUprc', dataType: 'number' },
    { fieldName: 'ncstQty', dataType: 'number' },
    { fieldName: 'goQty', dataType: 'number' },
    { fieldName: 'goAmt', dataType: 'number' },
    { fieldName: 'minOrdQty', dataType: 'number' },
    { fieldName: 'pypdDc', dataType: 'number' },
    { fieldName: 'rmkCn' },
  ];

  const columns = [
    { fieldName: 'goDvNm', header: t('MSG_TXT_DIV'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'svpdSapCd', header: t('MSG_TXT_SAPCD'), width: '95', styleName: 'text-center', editable: false, footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } },
    { fieldName: 'csmbPdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center', editable: false },
    { fieldName: 'itmKnm', header: t('MSG_TXT_ITM_NM'), width: '190', styleName: 'text-left', editable: false },
    { fieldName: 'mms6bDdlvQty', header: `${ddlvYmNms.value.mms6bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms5bDdlvQty', header: `${ddlvYmNms.value.mms5bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms4bDdlvQty', header: `${ddlvYmNms.value.mms4bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms3bDdlvQty', header: `${ddlvYmNms.value.mms3bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms2bDdlvQty', header: `${ddlvYmNms.value.mms2bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms1bDdlvQty', header: `${ddlvYmNms.value.mms1bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mmAvDdlvQty', header: t('MSG_TXT_MM_AV_DDLV'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'strStnbQty', header: t('MSG_TXT_STR_STNB'), width: '130', rules: 'required|min_value:0|max_value:9999999999', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'pajuLgstCnrStocQty', header: t('MSG_TXT_PAJU_STOC'), width: '130', styleName: 'text-right', numberFormat: '#,##0', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'sgsuLgstCnrStocQty', header: t('MSG_TXT_SGSU_STOC'), width: '130', styleName: 'text-right', numberFormat: '#,##0', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'woStocQty', header: t('MSG_TXT_FNL_STOC'), width: '130', styleName: 'text-right', numberFormat: '#,##0', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'stocPersMmN', header: t('MSG_TXT_STOC_CTN_MM'), width: '130', styleName: 'text-right', editable: false, numberFormat: '#####' },
    { fieldName: 'etExsDt', header: t('MSG_TXT_ET_EXS_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    { fieldName: 'goUprc', header: t('MSG_TXT_UPRC'), width: '130', styleName: 'text-right', numberFormat: '#,##0', editable: false },
    { fieldName: 'ncstQty', header: t('MSG_TXT_NCST_QT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', editable: false },
    { fieldName: 'goQty', header: t('MSG_TXT_GO_QTY'), width: '130', rules: 'required|min_value:0|max_value:999999999999', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'goAmt', header: t('MSG_TXT_GO_AMT'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'minOrdQty', header: t('MSG_TXT_MOQ'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'pypdDc', header: t('MSG_TXT_LEAD_TIME_SHORT'), width: '130', styleName: 'text-right', editable: false, numberFormat: '#####' },
    { fieldName: 'rmkCn', header: t('MSG_TXT_RMK_MO'), width: '130', styleName: 'text-left', editable: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFixedOptions({ colCount: 4 });
  view.setColumnLayout([
    'goDvNm', 'svpdSapCd', 'csmbPdCd', 'itmKnm',
    {
      header: t('MSG_TXT_DDLV_QT_EA'),
      direction: 'horizontal',
      items: ['mms6bDdlvQty', 'mms5bDdlvQty', 'mms4bDdlvQty', 'mms3bDdlvQty', 'mms2bDdlvQty', 'mms1bDdlvQty', 'mmAvDdlvQty'],
    },
    {
      header: t('MSG_TXT_STOC_EA'),
      direction: 'horizontal',
      items: ['strStnbQty', 'pajuLgstCnrStocQty', 'sgsuLgstCnrStocQty', 'woStocQty', 'stocPersMmN'],
    },
    'etExsDt', 'goUprc', 'ncstQty', 'goQty', 'goAmt', 'minOrdQty', 'pypdDc', 'rmkCn',
  ]);

  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEdited = (grid, itemIndex, row, field) => {
    const filedName = grid.getDataSource().getOrgFieldName(field);

    // 입고대기수량 변경 시
    if (filedName === 'strStnbQty') {
      // 입고대기수량
      const strStnbQty = Number(grid.getValue(itemIndex, 'strStnbQty'));
      // 파주재고수량
      const pajuQty = Number(grid.getValue(itemIndex, 'pajuLgstCnrStocQty'));
      // 성수재고수량
      const sgsuQty = Number(grid.getValue(itemIndex, 'sgsuLgstCnrStocQty'));

      // 전체재고 = 입고대기 + 파주재고 + 성수재고
      grid.setValue(itemIndex, 'woStocQty', strStnbQty + pajuQty + sgsuQty);

      const woStocQty = Number(grid.getValue(itemIndex, 'woStocQty'));
      const mmAvDdlvQty = Number(grid.getValue(itemIndex, 'mmAvDdlvQty'));

      let stocPersMmN = 0;
      if (mmAvDdlvQty > 0) {
        // 재고지속월, 데이터 타입이 소수점 불가 이므로 0으로 변경
        stocPersMmN = roundExcel(woStocQty / mmAvDdlvQty, 0);
      }

      grid.setValue(itemIndex, 'stocPersMmN', stocPersMmN);

      const bfEtExsDt = dayjs(baseYmd.value).add(stocPersMmN, 'month').format('YYYYMMDD');

      grid.setValue(itemIndex, 'etExsDt', bfEtExsDt);

      let ncstQty = (Number(mmAvDdlvQty) * 3) - Number(woStocQty);
      ncstQty = ncstQty < 0 ? 0 : ncstQty;
      grid.setValue(itemIndex, 'ncstQty', ncstQty);

      const moq = Number(grid.getValue(itemIndex, 'minOrdQty'));

      if (moq === 0 || ncstQty === 0) {
        grid.setValue(itemIndex, 'goQty', 0);
      } else if (moq >= ncstQty) {
        grid.setValue(itemIndex, 'goQty', moq);
      } else {
        let i = 1;
        let goQty = 0;

        while (ncstQty >= goQty) {
          goQty = moq * i;
          i += 1;
        }
        grid.setValue(itemIndex, 'goQty', goQty);
      }

      const goQty = Number(grid.getValue(itemIndex, 'goQty'));
      const goUprc = Number(grid.getValue(itemIndex, 'goUprc'));

      if (goQty === 0 || goUprc === 0) {
        grid.setValue(itemIndex, 'goAmt', 0);
      } else {
        grid.setValue(itemIndex, 'goAmt', goQty * goUprc);
      }
    } else if (filedName === 'goQty') {
      if (Number(grid.getValue(itemIndex, 'ncstQty')) === 0) {
        grid.setValue(itemIndex, 'goQty', 0);
        grid.setValue(itemIndex, 'goAmt', 0);
      } else {
        const goQty = Number(grid.getValue(itemIndex, 'goQty'));
        const goAmt = Number(grid.getValue(itemIndex, 'goUprc')) * goQty;

        grid.setValue(itemIndex, 'goAmt', goAmt);
      }
    }
  };
});

</script>
