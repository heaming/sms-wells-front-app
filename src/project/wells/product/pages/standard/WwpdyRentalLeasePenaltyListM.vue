<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY (기준정보관리)
2. 프로그램 ID : WwpdyRentalLeasePenaltyListM - 렌탈/리스 위약금 관리
                ( W-PD-U-0021M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.05.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 - 기준정보관리 - 렌탈/리스 위약금 관리 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 상품분류 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CATE')"
          :colspan="2"
        >
          <zwpd-product-classification-select
            v-model:product1-level="searchParams.prdtCateHigh"
            v-model:product2-level="searchParams.prdtCateMid"
            v-model:product3-level="searchParams.prdtCateLow"
            v-model:product4-level="searchParams.prdtCateLowDtl"
            v-model:pd-tp-cd="searchParams.pdTpCd"
            :search-lvl="prdtCateLevel"
            first-option="all"
            :is-show-keyword="false"
          />
        </kw-search-item>
        <!-- 적용기간 -->
        <kw-search-item :label="$t('MSG_TXT_ACEPT_PERIOD')">
          <kw-date-range-picker
            v-model:from="searchParams.svcStartDt"
            v-model:to="searchParams.svcEndDt"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 상품코드 -->
        <kw-search-item :label="$t('MSG_TXT_PRDT_CODE')">
          <kw-input
            v-model="searchParams.pdCd"
            maxlength="10"
            clearable
            icon="search"
            @click-icon="onClickSearchPdCdPopup()"
          />
        </kw-search-item>
        <!-- 상품명 -->
        <kw-search-item :label="$t('MSG_TXT_PRDT_NM')">
          <kw-input
            v-model="searchParams.pdNm"
            maxlength="100"
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
          v-permission:delete
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
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
          v-permission:update
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
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdProductClassificationSelect from '~sms-common/product/pages/standard/components/ZwpdyClassification.vue';
import { setGridDateFromTo, getAlreadyItems, isValidGridCodes } from '~sms-common/product/utils/pdUtil';

const { alert, notify, modal } = useGlobal();
const router = useRouter();
const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const currentSearchYn = ref();

let cachedParams;
const searchParams = ref({
  prdtCateHigh: '',
  prdtCateMid: '',
  prdtCateLow: '',
  prdtCateLowDtl: '',
  pdNm: '',
  pdCd: '',
  svcStartDt: '',
  svcEndDt: '',
});
const searchedProduct = ref();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes('PD_TP_CD', 'COD_PAGE_SIZE_OPTIONS', 'PD_TEMP_SAVE_CD');

async function fetchData() {
  const res = await dataService.get('/sms/wells/product/cancel-charges/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: services, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(services);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearchPdCdPopup() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.pdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };
  const rtn = await modal({
    component: 'ZwpdcStandardListP',
    componentProps: searchPopupParams,
  });
  searchParams.value.pdCd = rtn.payload?.[0]?.pdCd;
  searchedProduct.value = rtn.payload?.[0];
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
  const checkedRowCount = view.getCheckedRows().length;
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  pageInfo.value.totalCount -= checkedRowCount - deletedRows.length;
  if (deletedRows.length) {
    // console.log('deletedRows : ', deletedRows);
    await dataService.delete('/sms/wells/product/cancel-charges', { data: deletedRows });
    gridUtil.reset(view);
    await fetchData();
  }
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  if (searchedProduct.value?.pdCd && searchedProduct.value.pdCd !== searchParams.value.pdCd) {
    searchedProduct.value = null;
  }
  await gridUtil.insertRowAndFocus(view, 0, {
    pdCd: searchedProduct.value?.pdCd,
    pdNm: searchedProduct.value?.pdNm,
    vlStrtDtm: now.format('YYYYMMDD'),
    vlEndDtm: '99991231',
  });
  pageInfo.value.totalCount += 1;
}

async function checkDuplication() {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);

  if (changedRows.length === 0) {
    return false;
  }

  const { data: dupData } = await dataService.post('/sms/wells/product/cancel-charges/duplication-check', changedRows);
  if (dupData.data) {
    const dupCodes = dupData.data.split(',', -1);
    const { pdNm } = changedRows.find((item) => item.pdCd === dupCodes[0]);
    // 은(는) 이미 DB에 등록되어 있습니다.
    await alert(t('MSG_ALT_EXIST_IN_DB', [pdNm]));
    return true;
  }
  return false;
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; } // 수정된 행 없음
  if (!await gridUtil.validate(view)) { return; } // 유효성 검사
  if (!await isValidGridCodes(view, ['pdCd'])) { return; } // 상품코드 검사
  if (await checkDuplication()) { return; } // 중복 검사

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/product/cancel-charges', { bases: changedRows });
  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/product/cancel-charges', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: router.currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    // 상품코드
    {
      fieldName: 'pdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      width: '138',
      styleName: 'text-center',
      editable: false,
    },
    // 상품명
    {
      fieldName: 'pdNm',
      header: t('MSG_TXT_PRDT_NM'),
      width: '203',
      styleName: 'text-left rg-button-icon--search',
      button: 'action',
      rules: 'required',
      editor: { maxLength: 100 },
    },
    // 시작일
    {
      fieldName: 'vlStrtDtm',
      header: t('MSG_TXT_START_DATE'),
      width: '133',
      styleName: 'text-center',
      editor: { type: 'date' },
      dataType: 'date',
    },
    // 종료일
    {
      fieldName: 'vlEndDtm',
      header: t('MSG_TXT_END_DATE'),
      width: '129',
      styleName: 'text-center',
      editor: { type: 'date' },
      dataType: 'date',
    },
    // 소모품비
    {
      fieldName: 'csmbCs',
      header: t('MSG_TXT_CSMB_CS'),
      width: '141',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0.##', maxLength: 12, positiveOnly: true },
      dataType: 'number',
    },
    // 철거비
    {
      fieldName: 'reqdCs',
      header: t('MSG_TXT_REQD_CS'),
      width: '141',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0.##', maxLength: 12, positiveOnly: true },
      dataType: 'number',
    },
    // 렌탈손료
    {
      fieldName: 'rentalRntf',
      header: t('MSG_TXT_LENT_LOSS_COST'),
      width: '141',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0.##', maxLength: 12, positiveOnly: true },
      dataType: 'number',
    },
    // 잔여위약금(%)
    {
      fieldName: 'resCcamRat',
      header: `${t('MSG_TXT_REMAIN_PENALTY')}(%)`,
      width: '141',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '999', maxLength: 3, positiveOnly: true },
      dataType: 'number',
    },
    // 일시분손료
    {
      fieldName: 'spayRntf',
      header: t('MSG_TXT_ONET_LOSS_COST'),
      width: '141',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0.##', maxLength: 12, positiveOnly: true },
      dataType: 'number',
    },
    // 등록일
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editable: false },
    // 등록자
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '100', styleName: 'text-center', editable: false },
    // 최종수정일
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editable: false },
    // 최종수정자
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '100', styleName: 'text-center', editable: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: 'ccamId' });
  fields.push({ fieldName: 'histStrtDtm' });
  fields.push({ fieldName: 'histEndDtm' });
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;

  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    // 날짜값 조정
    await setGridDateFromTo(view, grid, itemIndex, fieldIndex, 'vlStrtDtm', 'vlEndDtm');
    if (grid.getColumn(fieldIndex).fieldName === 'pdNm' && isEmpty(grid.getValue(itemIndex, 'pdNm'))) {
      data.setValue(itemIndex, 'pdCd', null);
    }
  };

  view.onCellButtonClicked = async (grid, { column, itemIndex }) => {
    if (column === 'pdNm') {
      const svPdNm = grid.getValue(itemIndex, 'pdNm');
      const { payload } = await modal({
        component: 'ZwpdcStandardListP',
        componentProps: { searchType: pdConst.PD_SEARCH_NAME, searchValue: svPdNm },
      });
      if (payload) {
        const row = Array.isArray(payload) ? payload[0] : payload;
        const alreadyItems = getAlreadyItems(view, [row], 'pdCd');
        if (alreadyItems.length) {
          // 이미 등록된 {상품} 입니다.
          notify(t('MSG_ALT_ALREADY_RGST', [t('MSG_TXT_PRDT')]));
          return;
        }
        data.setValue(itemIndex, 'pdNm', row.pdNm);
        data.setValue(itemIndex, 'pdCd', row.pdCd);
      }
    }
  };
});
</script>
<style scoped></style>
