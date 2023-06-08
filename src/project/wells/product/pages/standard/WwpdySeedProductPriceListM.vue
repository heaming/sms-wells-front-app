<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY (기준정보관리)
2. 프로그램 ID : WwpdySeedProductPriceListM - 모종제품가격 관리
                ( W-PD-U-0024M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.06.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 - 기준정보관리 - 모종제품가격 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 적용기간 -->
        <kw-search-item :label="$t('MSG_TXT_ACEPT_PERIOD')">
          <kw-date-range-picker
            v-model:from="searchParams.apyStrtdt"
            v-model:to="searchParams.apyEnddt"
          />
        </kw-search-item>
        <!-- 제품명 -->
        <kw-search-item :label="$t('MSG_TXT_GOODS_NM')">
          <kw-input
            v-model="searchParams.pdctPdNm"
            maxlength="100"
          />
        </kw-search-item>
        <!-- 제품코드 -->
        <kw-search-item :label="$t('MSG_TXT_PROD_CD')">
          <kw-input
            v-model.trim="searchParams.pdctPdCd"
            :maxlength="10"
            clearable
            icon="search"
            @click-icon="onClickSearchPdCdPopup()"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 기기유형 -->
        <kw-search-item :label="$t('MSG_TXT_UNIT_TYPE')">
          <kw-select
            v-model="searchParams.rglrSppMchnTpCd"
            :options="codes.SAP_MAT_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 가격구분 -->
        <kw-search-item :label="$t('MSG_TXT_PRC_TYPE')">
          <kw-select
            v-model="searchParams.rglrSppPrcDvCd"
            :options="codes.RGLR_SPP_PRC_DV_CD"
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
          <!-- (단위:원) -->
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>

        <kw-btn
          v-permission:delete
          primary
          dense
          grid-action
          :label="$t('MSG_BTN_DEL')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickRemoveRows"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          dense
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
          v-permission:update
          dense
          grid-action
          :label="$t('MSG_BTN_SAVE')"
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
import { useDataService, useMeta, gridUtil, useGlobal, codeUtil, getComponentType, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { setGridDateFromTo } from '~sms-common/product/utils/pdUtil';

const { notify, modal } = useGlobal();
const router = useRouter();
const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const currentSearchYn = ref();

let cachedParams;
const searchParams = ref({
  apyStrtdt: '',
  apyEnddt: '',
  pdctPdNm: '',
  pdctPdCd: '',
  rglrSppMchnTpCd: '',
  rglrSppPrcDvCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes('SAP_MAT_TP_CD', 'RGLR_SPP_PRC_DV_CD', 'SELL_TP_CD', 'COD_YN', 'PD_TP_DTL_CD', 'COD_PAGE_SIZE_OPTIONS');

async function fetchData() {
  const res = await dataService.get('/sms/wells/product/seedling-price/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: services, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(services);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearchPdCdPopup() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.pdctPdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
    searchLvl: 3,
  };
  const rtn = await modal({
    component: 'ZwpdcMaterialsSelectListP',
    componentProps: searchPopupParams,
  });
  searchParams.value.pdctPdCd = rtn.payload?.[0]?.pdCd;
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
  currentSearchYn.value = 'N';
}

async function onClickRemoveRows() {
  const view = grdMainRef.value.getView();

  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length) {
    // console.log('deletedRows : ', deletedRows);
    await dataService.delete('/sms/wells/product/seedling-price', { data: deletedRows });
    gridUtil.reset(view);
    await fetchData();
  }
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, {
    apyEnddt: '99991231',
  });
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; } // 수정된 행 없음
  if (!await gridUtil.validate(view)) { return; } // 유효성 검사
  // if (await checkDuplication()) { return; } // 중복 검사

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/product/seedling-price', { bases: changedRows });
  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/product/seedling-price', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: router.currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  console.log('Start');
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    // 제품코드
    {
      fieldName: 'pdctPdCd',
      header: t('MSG_TXT_PROD_CD'),
      width: '160',
      styleName: 'text-center',
      editable: false,
      rules: 'required',
    },
    // 제품명
    {
      fieldName: 'pdctPdNm',
      header: t('MSG_TXT_GOODS_NM'),
      width: '207',
      styleName: 'text-left rg-button-icon--search',
      button: 'action',
      editor: { maxLength: 100 },
      rules: 'required',
    },

    // 기기종류
    {
      fieldName: 'rglrSppMchnKndCd',
      header: t('MSG_TXT_MCHN_KND'),
      width: '130',
      styleName: 'text-center',
      placeHolder: t('MSG_TXT_SELT'),
      editor: { type: 'list' },
      rules: 'required',
      options: codes.SELL_TP_CD,
    },
    // 기기유형
    {
      fieldName: 'rglrSppMchnTpCd',
      header: t('MSG_TXT_UNIT_TYPE'),
      width: '130',
      styleName: 'text-center',
      placeHolder: t('MSG_TXT_SELT'),
      editor: { type: 'list' },
      rules: 'required',
      options: codes.SELL_TP_CD,
    },
    // 가격구분
    {
      fieldName: 'rglrSppPrcDvCd',
      header: t('MSG_TXT_PRC_TYPE'),
      width: '130',
      styleName: 'text-center',
      placeHolder: t('MSG_TXT_SELT'),
      editor: { type: 'list' },
      rules: 'required',
      options: codes.SELL_TP_CD,
    },
    // 수량
    { fieldName: 'sdingQty',
      header: t('MSG_TXT_WK_QTY'),
      width: '80',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0', maxLength: 12, positiveOnly: true },
      dataType: 'number' },
    // 가격차수
    {
      fieldName: 'pdPrcTcnt',
      header: t('MSG_TXT_PRC_SEQ'),
      width: '79',
      dataType: 'number',
      styleName: 'text-center',
      editable: false },
    // 판매금액
    {
      fieldName: 'sellAmt',
      header: t('MSG_TXT_SALE_PRICE'),
      width: '80',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0', maxLength: 12, positiveOnly: true },
      dataType: 'number' },
    // 공급가액
    {
      fieldName: 'splAmt',
      header: t('MSG_TXT_SUPPLY_AMOUNT'),
      width: '80',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0', maxLength: 12, positiveOnly: true },
      dataType: 'number' },
    // 부가세액
    {
      fieldName: 'vat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '80',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0', maxLength: 12, positiveOnly: true },
      dataType: 'number' },
    // A/S금액
    {
      fieldName: 'asSellAmt',
      header: t('MSG_TXT_AS_PRICE'),
      width: '80',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0', maxLength: 12, positiveOnly: true },
      dataType: 'number' },
    // 사용유무
    {
      fieldName: 'useYn',
      header: t('MSG_TXT_USE_EYN'),
      width: '80',
      styleName: 'text-center',
      placeHolder: t('MSG_TXT_SELT'),
      editor: { type: 'list' },
      options: codes.COD_YN,
    },
    // 시작일
    {
      fieldName: 'apyStrtdt',
      header: t('MSG_TXT_START_DATE'),
      width: '133',
      editor: { type: 'date' },
      dataType: 'date',
      styleName: 'text-center',
    },
    // 종료일
    {
      fieldName: 'apyEnddt',
      header: t('MSG_TXT_END_DATE'),
      width: '129',
      editor: { type: 'date' },
      dataType: 'date',
      styleName: 'text-center',
    },

    // 상품분류
    {
      fieldName: 'pdClsfNm',
      header: t('MSG_TXT_PRDT_CATE'),
      width: '130',
      editable: false,
    },
    // 상품유형
    {
      fieldName: 'pdTpDtlCd',
      header: t('MSG_TXT_PRDT_TYPE'),
      width: '130',
      styleName: 'text-center',
      editable: false,
      options: codes.PD_TP_DTL_CD,
    },
    // 최종수정일
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editable: false },
    // 최종수정자
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '100', styleName: 'text-center', editable: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: 'rglrSppSdingPrcId' });
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;

  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    // 날짜값 조정
    await setGridDateFromTo(view, grid, itemIndex, fieldIndex, 'apyStrtdt', 'apyEnddt');
    // 상품 초기화
    if (grid.getColumn(fieldIndex).fieldName === 'pdctPdNm' && isEmpty(grid.getValue(itemIndex, 'pdctPdNm'))) {
      data.setValue(itemIndex, 'pdctPdCd', null);
    }
  };

  view.onCellButtonClicked = async (grid, { column, itemIndex }) => {
    if (column === 'pdctPdNm') {
      const pdctPdNm = grid.getValue(itemIndex, 'pdctPdNm');
      const { payload } = await modal({
        component: 'ZwpdcMaterialsSelectListP',
        componentProps: { searchType: pdConst.PD_SEARCH_NAME,
          searchValue: pdctPdNm,
          selectType: pdConst.PD_SEARCH_SINGLE,
          searchLvl: 3 },
      });
      if (payload) {
        const row = Array.isArray(payload) ? payload[0] : payload;
        data.setValue(itemIndex, 'pdctPdNm', row.pdNm);
        data.setValue(itemIndex, 'pdctPdCd', row.pdCd);
      }
    }
  };
});
</script>
<style scoped></style>
