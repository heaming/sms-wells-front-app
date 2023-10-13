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
            :options="codes.RGLR_SPP_MCHN_TP_CD"
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
        <!-- 삭제 -->
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
        <!-- 행추가 -->
        <kw-btn
          v-permission:create
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <!-- 저장 -->
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
        <!-- 엑셀다운로드 -->
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
import { useDataService, useMeta, gridUtil, stringUtil, useGlobal, codeUtil, getComponentType, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { getCodeNames, getDuplicatedItems, setGridDateFromTo, isValidGridCodes } from '~sms-common/product/utils/pdUtil';

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

const codes = await codeUtil.getMultiCodes(
  'RGLR_SPP_PRC_DV_CD',
  'RGLR_SPP_MCHN_KND_CD',
  'RGLR_SPP_MCHN_TP_CD',
  'COD_YN',
  'PD_TP_DTL_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

// 데이터 불러오기
async function fetchData() {
  const res = await dataService.get('/sms/wells/product/seedling-price/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: services, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(services);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 교재/자재 상품 검색 팝업
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
  searchParams.value.pdctPdCd = rtn.payload?.checkedRows?.[0]?.pdCd;
}

// 조회
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
  currentSearchYn.value = 'N';
}

// 행 삭제
async function onClickRemoveRows() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const checkedRowCount = view.getCheckedRows().length;
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  pageInfo.value.totalCount -= checkedRowCount - deletedRows.length;
  if (deletedRows.length) {
    // console.log('deletedRows : ', deletedRows);
    await dataService.delete('/sms/wells/product/seedling-price', { data: deletedRows });
    gridUtil.reset(view);
    await fetchData();
  }
}

// 행 추가
async function onClickAdd() {
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, {
    apyStrtdt: now.format('YYYYMMDD'),
    apyEnddt: '99991231',
    pdPrcTcnt: null,
    useYn: 'Y',
    sellAmt: 0,
    splAmt: 0,
    vat: 0,
    asSellAmt: 0,
  });
  pageInfo.value.totalCount += 1;
}

// 중복 검사
async function checkDuplication() {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);
  if (changedRows.length === 0) {
    return false;
  }

  let isOverDuration = false;
  changedRows.forEach((item1) => {
    if (!isOverDuration) {
      const duplicatedItems = getDuplicatedItems(view, item1, 'pdctPdCd', 'rglrSppMchnKndCd', 'rglrSppMchnTpCd', 'rglrSppPrcDvCd', 'basePdCd');
      duplicatedItems.forEach((item2) => {
        const sourceStartDt = item1.apyStrtdt;
        const sourceEnddt = item1.apyEnddt;
        const targetStartDt = item2.apyStrtdt;
        const targetEnddt = item2.apyEnddt;
        if (targetEnddt >= sourceStartDt && targetStartDt <= sourceEnddt) {
          console.log(`${sourceStartDt}-${sourceEnddt} : ${targetStartDt}-${targetEnddt}`);
          isOverDuration = true;
          // {제품명/기기종류/기기유형/가격구분/[2021.01.01 ~ 2021.12.31]}이(가) 중복됩니다.
          let dupItem = item1.pdctPdNm;
          if (item1.rglrSppMchnKndCd) {
            dupItem += `/${getCodeNames(codes, item1.rglrSppMchnKndCd, 'RGLR_SPP_MCHN_KND_CD')}`;
          }
          if (item1.rglrSppMchnTpCd) {
            dupItem += `/${getCodeNames(codes, item1.rglrSppMchnTpCd, 'RGLR_SPP_MCHN_TP_CD')}`;
          }
          if (item1.rglrSppPrcDvCd) {
            dupItem += `/${getCodeNames(codes, item1.rglrSppPrcDvCd, 'RGLR_SPP_PRC_DV_CD')}`;
          }
          if (item1.basePdCd) {
            dupItem += `/${item1.basePdNm}`;
          }
          dupItem += `/[${stringUtil.getDateFormat(sourceStartDt)} ~ ${stringUtil.getDateFormat(sourceEnddt)}]`;
          // {0}이(가) 중복됩니다.
          notify(t('MSG_ALT_DUP_NCELL', [dupItem]));
        }
      });
    }
  });

  if (isOverDuration) {
    return true;
  }

  const { data: dupData } = await dataService.post('/sms/wells/product/seedling-price/duplication-check', changedRows);
  if (dupData.data) {
    const dupCodes = dupData.data.split(',', -1);
    const { pdctPdNm, rglrSppMchnKndCd, rglrSppMchnTpCd, rglrSppPrcDvCd, apyStrtdt, apyEnddt, basePdNm } = changedRows
      .find((item) => item.pdctPdCd === dupCodes[0]
        && item.rglrSppMchnKndCd === dupCodes[1]
        && item.rglrSppMchnTpCd === dupCodes[2]
        && item.rglrSppPrcDvCd === dupCodes[3]
        && item.apyStrtdt === dupCodes[4]
        && item.apyEnddt === dupCodes[5]
        && ((isEmpty(item.basePdCd) && isEmpty(dupCodes[6])) || item.basePdCd === dupCodes[6]));
    let dupItem = pdctPdNm;
    if (rglrSppMchnKndCd) {
      dupItem += `/${getCodeNames(codes, rglrSppMchnKndCd, 'RGLR_SPP_MCHN_KND_CD')}`;
    }
    if (rglrSppMchnTpCd) {
      dupItem += `/${getCodeNames(codes, rglrSppMchnTpCd, 'RGLR_SPP_MCHN_TP_CD')}`;
    }
    if (rglrSppPrcDvCd) {
      dupItem += `/${getCodeNames(codes, rglrSppPrcDvCd, 'RGLR_SPP_PRC_DV_CD')}`;
    }
    if (basePdNm) {
      dupItem += `/${basePdNm}`;
    }
    dupItem += `/[${stringUtil.getDateFormat(apyStrtdt)} ~ ${stringUtil.getDateFormat(apyEnddt)}]`;
    // {제품명/기기종류/기기유형/가격구분/[2023.01.01~2023.12.31]} 은(는) 이미 DB에 등록되어 있습니다.
    await alert(t('MSG_ALT_EXIST_IN_DB', [dupItem]));
    return true;
  }
  return false;
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; } // 수정된 행 없음
  if (!await gridUtil.validate(view)) { return; } // 유효성 검사
  if (!await isValidGridCodes(view, ['pdctPdCd'])) { return; } // 상품코드 검사
  if (await checkDuplication()) { return; } // 중복 검사

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/product/seedling-price', { bases: changedRows });
  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/product/seedling-price', { params: cachedParams });
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
    // 제품코드
    { fieldName: 'pdctPdCd',
      header: t('MSG_TXT_PROD_CD'),
      width: '120',
      styleName: 'text-center',
      editable: false,
    },
    // 제품명
    { fieldName: 'pdctPdNm',
      header: t('MSG_TXT_GOODS_NM'),
      width: '200',
      editor: { maxLength: 100 },
      rules: 'required',
      button: 'action',
      styleName: 'rg-button-icon--search',
      styleCallback(grid, dataCell) {
        return dataCell.item.rowState === 'created'
          ? { editable: true }
          : { editable: false, styleName: 'text-left rg-button-hide' };
      },
    },

    // 기기종류
    { fieldName: 'rglrSppMchnKndCd',
      header: t('MSG_TXT_MCHN_KND'),
      width: '110',
      styleName: 'text-center',
      placeHolder: t('MSG_TXT_SELT'),
      editor: { type: 'list' },
      rules: 'required',
      styleCallback(grid, dataCell) {
        return { editable: dataCell.item.rowState === 'created' };
      },
      options: codes.RGLR_SPP_MCHN_KND_CD,
    },
    // 기기유형
    { fieldName: 'rglrSppMchnTpCd',
      header: t('MSG_TXT_UNIT_TYPE'),
      width: '110',
      styleName: 'text-center',
      placeHolder: t('MSG_TXT_SELT'),
      editor: { type: 'list' },
      rules: 'required',
      styleCallback(grid, dataCell) {
        return { editable: dataCell.item.rowState === 'created' };
      },
      options: codes.RGLR_SPP_MCHN_TP_CD,
    },
    // 가격구분
    { fieldName: 'rglrSppPrcDvCd',
      header: t('MSG_TXT_PRC_TYPE'),
      width: '110',
      styleName: 'text-center',
      placeHolder: t('MSG_TXT_SELT'),
      editor: { type: 'list' },
      rules: 'required',
      styleCallback(grid, dataCell) {
        return { editable: dataCell.item.rowState === 'created' };
      },
      options: codes.RGLR_SPP_PRC_DV_CD,
    },
    // 상품코드
    {
      fieldName: 'basePdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      width: '120',
      styleName: 'text-center',
      editable: false,
    },
    // 상품명
    {
      fieldName: 'basePdNm',
      header: t('MSG_TXT_PRDT_NM'),
      width: '200',
      styleName: 'text-left rg-button-icon--search',
      button: 'action',
      editor: { maxLength: 100 },
    },
    // 수량
    { fieldName: 'sdingQty',
      header: t('MSG_TXT_WK_QTY'),
      width: '80',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0', maxLength: 12, positiveOnly: true },
      dataType: 'number',
      rules: 'required',
    },
    // 가격차수
    { fieldName: 'pdPrcTcnt',
      header: t('MSG_TXT_PRC_SEQ'),
      width: '79',
      dataType: 'number',
      styleName: 'text-center',
      editable: false },
    // 판매금액
    { fieldName: 'sellAmt',
      header: t('MSG_TXT_SALE_PRICE'),
      width: '80',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0', maxLength: 12, positiveOnly: true },
      dataType: 'number' },
    // 공급가액
    { fieldName: 'splAmt',
      header: t('MSG_TXT_SUPPLY_AMOUNT'),
      width: '80',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0', maxLength: 12, positiveOnly: true },
      dataType: 'number' },
    // 부가세액
    { fieldName: 'vat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '80',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0', maxLength: 12, positiveOnly: true },
      dataType: 'number' },
    // A/S금액
    { fieldName: 'asSellAmt',
      header: t('MSG_TXT_AS_PRICE'),
      width: '80',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0', maxLength: 12, positiveOnly: true },
      dataType: 'number' },
    // 사용유무
    { fieldName: 'useYn',
      header: t('MSG_TXT_USE_EYN'),
      width: '80',
      styleName: 'text-center',
      placeHolder: t('MSG_TXT_SELT'),
      editor: { type: 'list', labels: pdConst.YN_CODE, values: pdConst.YN_CODE },
    },
    // 시작일
    { fieldName: 'apyStrtdt',
      header: t('MSG_TXT_START_DATE'),
      width: '133',
      editor: { type: 'date' },
      dataType: 'date',
      styleName: 'text-center',
      rules: 'required',
    },
    // 종료일
    { fieldName: 'apyEnddt',
      header: t('MSG_TXT_END_DATE'),
      width: '129',
      editor: { type: 'date' },
      dataType: 'date',
      styleName: 'text-center',
      rules: 'required',
    },
    // 상품분류
    { fieldName: 'pdClsfNm',
      header: t('MSG_TXT_PRDT_CATE'),
      width: '250',
      editable: false,
    },
    // 상품유형
    { fieldName: 'pdTpDtlCd',
      header: t('MSG_TXT_PRDT_TYPE'),
      width: '130',
      styleName: 'text-center',
      editable: false,
      options: codes.PD_TP_DTL_CD,
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
      data.setValue(itemIndex, 'pdClsfNm', null);
      data.setValue(itemIndex, 'pdTpDtlCd', null);
    }

    // 상품 초기화
    if (grid.getColumn(fieldIndex).fieldName === 'basePdNm' && isEmpty(grid.getValue(itemIndex, 'basePdNm'))) {
      data.setValue(itemIndex, 'basePdCd', null);
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
        const row = Array.isArray(payload?.checkedRows) ? payload.checkedRows[0] : payload;
        data.setValue(itemIndex, 'pdctPdNm', row.pdNm);
        data.setValue(itemIndex, 'pdctPdCd', row.pdCd);
        data.setValue(itemIndex, 'pdClsfNm', row.pdClsfNm);
        data.setValue(itemIndex, 'pdTpDtlCd', row.pdTpDtlCd);
      }
    }
    if (column === 'basePdNm') {
      const pdNm = grid.getValue(itemIndex, 'basePdNm');
      const { payload } = await modal({
        component: 'ZwpdcStandardListP',
        componentProps: { searchType: pdConst.PD_SEARCH_NAME,
          searchValue: pdNm,
          selectType: pdConst.PD_SEARCH_SINGLE,
          sellTpCd: '6' },
      });
      if (payload) {
        const row = Array.isArray(payload) ? payload[0] : payload;
        data.setValue(itemIndex, 'basePdNm', row.pdNm);
        data.setValue(itemIndex, 'basePdCd', row.pdCd);
      }
    }
  };
});
</script>
<style>
.rg-button-hide .rg-button-action {
  display: none !important;
}
</style>
