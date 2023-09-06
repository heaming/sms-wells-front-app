<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEY
2. 프로그램 ID : WwfeyProductBsFeeMgtM - 상품별 BS 수수료 기준정보
3. 작성자 : MJ
4. 작성일 : 2023.07.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품별 BS 수수료 기준정보 W-CO-U-0001M01
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      :modified-targets="['grdRef']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 제품코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_PROD_CD')"
        >
          <kw-input
            v-model="searchParams.basePdCd"
            :label="$t('MSG_TXT_PRDT_CODE')"
            clearable
            icon="search"
            dense
            :maxlength="10"
            @click-icon="onClickSelectPdCd()"
            @update:model-value="onUpdatePdCd()"
          />
          <kw-input
            v-model="searchParams.basePdNm"
            placeholder=""
            readonly
          />
        </kw-search-item>
        <!-- 방문개월 -->
        <kw-search-item
          :label="$t('MSG_TXT_VISIT_MN')"
        >
          <kw-input
            v-model.trim="searchParams.vstMcn"
            rules="numeric"
            :maxlength="10"
            type="number"
            :label="$t('MSG_TXT_VISIT_MN')"
          />
        </kw-search-item>
        <!-- 서비스구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_SV_DV')"
        >
          <kw-select
            v-model="searchParams.svFeeDvCd"
            :options="codes.SV_FEE_DV_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 적용기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_ACEPT_PERIOD')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.apyStrtYm"
            v-model:to="searchParams.apyEndYm"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_BS_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.svFeePdDvCd"
            :options="codes.SV_FEE_PD_DV_CD"
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
            @change="fetchPage"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <kw-btn
          :label="$t('MSG_BTN_DEL')"
          grid-action
          @click="onClickRowDelete"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          :label="$t('MSG_BTN_ROW_ADD')"
          grid-action
          @click="onClickRowAdd"
        />
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          grid-action
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdRef"
        name="grdRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrd"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchPage"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, useGlobal, useDataService, useMeta, getComponentType, codeUtil, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';

const { t } = useI18n();
const { modal, notify } = useGlobal();
const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
const grdData = computed(() => grdRef.value?.getData());
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'FEE_PDCT_TP_CD',
  'SV_FEE_DV_CD',
  'SV_FEE_PD_DV_CD',
  'HCR_DV_CD',
  'COD_YN',
  'YN_CD',
);
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

let cachedParams;
const searchParams = ref({
  basePdCd: '',
  basePdNm: '',
  vstMcn: '',
  svFeeDvCd: '',
  apyStrtYm: '',
  apyEndYm: '',
  svFeePdDvCd: '',
});

// 상품코드 검색아이콘 클릭
async function onClickSelectPdCd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.basePdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };
  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });
  if (returnPdInfo.result) {
    searchParams.value.basePdCd = returnPdInfo.payload?.[0].pdCd;
    searchParams.value.basePdNm = returnPdInfo.payload?.[0].pdNm;
  }
}

async function onUpdatePdCd() {
  searchParams.value.basePdNm = '';
}

// 데이터 조회
async function fetchPage() {
  // @todo
  const res = await dataService.get('/sms/wells/fee/product-bs-fee/pages', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pagingResult } = res.data;
  grdData.value.setRows(pages);
  pageInfo.value = pagingResult;
  const view = grdRef.value.getView();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}
// 조회 버튼
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchPage();
}

// 그리드행삭제
async function onClickRowDelete() {
  const view = grdRef.value.getView();
  const deleteRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deleteRows.length > 0) {
    const allRows = gridUtil.getDeletedRowValues(view);
    await dataService.post('/sms/wells/fee/product-bs-fee', allRows);
    notify(t('MSG_ALT_DELETED'));
    await fetchPage();
  }
}

// 그리드행추가
async function onClickRowAdd() {
  const view = grdRef.value.getView();
  const defaultRow = {
    basePdCd: '',
    basePdNm: '',
    vstMcn: 0,
    svFeeDvCd: '',
    hcrDvCd1: '',
    hcrDvCd2: '',
    baseChTcnt: 1,
    svFeePdDvCd: '00',
    svFeeBaseAmt: 0,
    feeFxamYn: 'N',
    hcrFeeBaseAmt: 0,
    apyStrtYm: '',
    apyEndYm: '999912',
    dtaDlYn: 'N',
  };
  const dataRow = view.getDataSource().insertRow(0, defaultRow);
  gridUtil.focusCellInput(view, dataRow, 'basePdCd');
}

// 저장
async function onClickSave() {
  const view = grdRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) return;
  if (!await gridUtil.validate(view)) { return; }

  const allRows = gridUtil.getChangedRowValues(view, true);
  await dataService.post('/sms/wells/fee/product-bs-fee', allRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchPage();
}

// 엑셀 다운로드 버튼
async function onClickExcelDownload() {
  // @todo
  const res = await dataService.get('/sms/wells/fee/product-bs-fee', { params: cachedParams });
  const view = grdRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data, // 현재 그리드에 보여지는 데이터가 아닌 전체 데이터 다운로드 시 사용
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd = defineGrid((data, view) => {
  const btOpt = {
    startView: 1,
    minViewMode: 1,
    language: 'ko',
    todayHighlight: true,
  };
  // @todo BS상품그룹컬럼 맵핑
  const columns = [
    {
      fieldName: 'basePdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      width: '140',
      styleName: 'text-center rg-button-icon--search boxed-icon',
      button: 'action',
      rules: 'required',
      buttonVisibleCallback(g, index) {
        return g.getDataSource().getRowState(index.dataRow) === 'created';
      },
    },
    { fieldName: 'basePdNm', header: t('TXT_MSG_MAT_PD_NM'), width: '150', styleName: 'text-left' },
    { fieldName: 'vstMcn', header: t('MSG_TXT_VISIT_MN'), width: '100', styleName: 'text-right', dataType: 'number', rules: 'required', editable: true, editor: { type: 'number', numberFormat: '#,##0', maxLength: 22 } },
    { fieldName: 'svFeeDvCd', header: t('MSG_TXT_SV_DV'), width: '120', styleName: 'text-center', options: codes.SV_FEE_DV_CD, editor: { type: 'list' }, editable: true, rules: 'required' },
    { fieldName: 'hcrDvCd1', header: `${t('MSG_TXT_PRDT_GUBUN')}1`, width: '100', styleName: 'text-center', editable: true, editor: { maxLength: 2, textCase: 'upper' } }, /* 홈케어구분코드1 */
    { fieldName: 'hcrDvCd2', header: `${t('MSG_TXT_PRDT_GUBUN')}2`, width: '100', styleName: 'text-center', editable: true, editor: { maxLength: 2, textCase: 'upper' } }, /* 홈케어구분코드2 */
    { fieldName: 'svFeePdDvCd', header: t('MSG_TXT_BS_PD_GRP'), width: '180', styleName: 'text-center', options: codes.SV_FEE_PD_DV_CD, editor: { type: 'list' }, editable: true, rules: 'required' }, /* 서비스수수료상품구분코드 */
    { fieldName: 'baseChTcnt', header: t('MSG_TXT_ORDR'), width: '100', styleName: 'text-right', dataType: 'number', editable: true, rules: 'required', editor: { type: 'number', numberFormat: '#,##0', maxLength: 22 } },
    { fieldName: 'svFeeBaseAmt', header: `${t('TXT_MSG_FEE_AMT')} (${t('MSG_TXT_FXAM')}/${t('MSG_TXT_HMST')})`, width: '250', styleName: 'text-right', dataType: 'number', editable: true, editor: { type: 'number', numberFormat: '#,##0', maxLength: 22 } }, /* 서비스수수료기준금액 */
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_FXAM_YN'), width: '100', styleName: 'text-center', options: codes.YN_CD, editor: { type: 'list' }, editable: true },
    { fieldName: 'hcrFeeBaseAmt', header: `${t('MSG_TXT_FXAM_FEE')} (${t('MSG_TXT_HMST')})`, width: '150', styleName: 'text-right', dataType: 'number', editable: true, editor: { type: 'number', numberFormat: '#,##0', maxLength: 22 } }, /* 홈케어수수료기준금액 */
    { fieldName: 'apyStrtYm', header: t('MSG_TXT_APY_STRT_YM'), width: '120', styleName: 'text-center', editable: true, editor: { type: 'btdate', datetimeFormat: 'yyyy-MM', btOptions: btOpt }, datetimeFormat: 'yyyy-MM' },
    { fieldName: 'apyEndYm', header: t('MSG_TXT_APY_END_YM'), width: '120', styleName: 'text-center', editable: true, editor: { type: 'btdate', datetimeFormat: 'yyyy-MM', btOptions: btOpt }, datetimeFormat: 'yyyy-MM' },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR'), width: '100', styleName: 'text-center' },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_MDFC_USR'), width: '100', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;
  view.onCellEditable = (grid, index) => {
    if (gridUtil.isCreatedRow(grid, index.dataRow) && ['basePdCd', 'vstMcn', 'svFeeDvCd', 'hcrDvCd1', 'hcrDvCd2', 'svFeePdDvCd', 'baseChTcnt', 'svFeeBaseAmt', 'feeFxamYn', 'hcrFeeBaseAmt', 'apyStrtYm', 'apyEndYm', 'dtaDlYn'].includes(index.column)) {
      return true;
    }
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['svFeePdDvCd', 'svFeeBaseAmt', 'feeFxamYn', 'hcrFeeBaseAmt', 'apyStrtYm', 'apyEndYm'].includes(index.column)) {
      return true;
    }
    return false;
  };
  view.onCellButtonClicked = async (g, { column, itemIndex }) => {
    // 상품코드 팝업호출
    if (column === 'basePdCd') {
      const { result, payload } = await modal({
        component: 'ZwpdcStandardListP',
        componentProps: {
          searchType: pdConst.PD_SEARCH_CODE,
          searchValue: '',
          selectType: pdConst.PD_SEARCH_SINGLE,
        },
      });
      if (result) {
        g.setValue(itemIndex, 'basePdcd', payload?.[0].pdCd);
        g.setValue(itemIndex, 'basePdNm', payload?.[0].pdNm);
      }
    }
  };
  // 시작월 종료월 체크
  view.onValidate = async (g, index) => {
    const { apyStrtYm, apyEndYm } = gridUtil.getRowValue(view, index.dataRow);
    if (!isEmpty(apyStrtYm) && !isEmpty(apyEndYm)) {
      if (apyStrtYm > apyEndYm) {
        gridUtil.focusCellInput(view, index.dataRow, 'apyStrtYm');
        return t('MSG_ALT_STRT_MM_CHK');
      }
    }
  };
});

</script>
