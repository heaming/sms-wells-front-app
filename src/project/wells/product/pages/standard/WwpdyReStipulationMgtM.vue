<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY
2. 프로그램 ID : WwpdyReStipulationMgtM - 재약정 기준정보 관리 (W-PD-U-0045M01)
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 재약정 기준정보 관리 프로그램
****************************************************************************************************
#1. RealGrid Rendering에 bug가 있어 CSS로 핸들링 처리.
--TODO LIST
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      :modified-targets="['grdMain']"
      :default-visible-rows="1"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 상품명 -->
        <kw-search-item :label="$t('MSG_TXT_PRDT_NM')">
          <kw-input
            v-model.trim="searchParams.pdNm"
            :maxlength="100"
          />
        </kw-search-item>
        <!-- 상품코드 -->
        <kw-search-item :label="$t('MSG_TXT_PRDT_CODE')">
          <kw-input
            v-model.trim="searchParams.pdCd"
            :maxlength="10"
            clearable
            icon="search"
            @click-icon="onClickProduct(pdConst.PD_SEARCH_CODE)"
          />
        </kw-search-item>

        <kw-search-item
          :label="t('MSG_TXT_ACEPT_PERIOD')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDate"
            v-model:to="searchParams.endDate"
            rules="date_range_required"
            :label="t('MSG_TXT_ACEPT_PERIOD')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <h3>{{ $t('MSG_TXT_SRCH_RSLT') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span><!-- (단위:원) -->
        </template>

        <kw-btn
          v-permission:delete
          grid-action
          :label="$t('MSG_BTN_DEL')"
          @click="onClickRemove"
        />
        <kw-separator
          vertical
          inset
          spaced
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
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:download
          dense
          icon="excel"
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
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
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import pdConst from '~sms-common/product/constants/pdConst';

const dataService = useDataService();
const { t } = useI18n();
const { notify, modal } = useGlobal();
const { getConfig } = useMeta();
const grdMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/product/restipulations';

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'RSTL_BASE_TP_CD', // WELLS 대상 직급 A,B,C,D
  'RSTL_SELL_CHNL_DV_CD', // (상품구분)
  'COD_PAGE_SIZE_OPTIONS', // 전체, 영업부, SalesTM
);

let cachedParams;
const searchParams = ref({
  pdCd: '',
  pdNm: '',
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: '9999-12-31',
});

// 제품코드 조회팝업
async function onClickProduct() {
  const { result, payload } = await modal({
    component: 'ZwpdcMaterialsSelectListP',
    componentProps: {
      searchType: pdConst.PD_SEARCH_CODE,
      searchValue: searchParams.value.pdCd,
      selectType: pdConst.PD_SEARCH_SINGLE,
      searchLvl: 3,
    },
  });
  if (result) searchParams.value.pdCd = Array.isArray(payload.checkedRows) ? payload.checkedRows[0].pdCd : payload.pdCd;
}

async function fetchData() {
  const res = await dataService.get(baseUrl, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: restipulations, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(restipulations);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    apyStrtdt: dayjs().format('YYYY-MM-DD'),
    apyEnddt: '9999-12-31',
  });
  view.setColumnProperty('pdCd', 'styleName', 'btnshow');
  view.setColumnProperty('pdNm', 'styleName', 'btnshow');
  view.commit();
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  console.log('deletedRows', deletedRows);
  if (deletedRows.length > 0) {
    await dataService.delete(baseUrl, { data: deletedRows });
    await fetchData();
  }
}
async function checkDuplicationByPk() {
  // #1. 신규 입력항목들 사이에 중복값 체크.
  const view = grdMainRef.value.getView();
  const createdRows = gridUtil.getCreatedRowValues(view);
  if (createdRows.length === 0) return await false;

  const result = createdRows.filter((item1, idx1) => createdRows.findIndex((item2) => item1.pdCd === item2.pdCd
          && item1.rstlBaseTpCd === item2.rstlBaseTpCd
          && item1.stplTn === item2.stplTn
          && item1.rstlSellChnlDvCd === item2.rstlSellChnlDvCd
          && item1.apyStrtdt === item2.apyStrtdt) === idx1);

  if (createdRows.length !== result.length) {
    notify(t('MSG_ALT_EXIST_IN_NEW_INPUT_DATAS'));
    return await true;
  }

  // #2. 신규 입력항목들이 DB에 기입력되어 있는지 체크.
  const { data: checkedData } = await dataService.post(`${baseUrl}/duplication-check`, createdRows);
  console.debug('checkedData', checkedData);
  if (checkedData.dupliYn === 'Y') {
    // 은(는) 이미 DB에 등록되어 있습니다.
    notify(t('MSG_ALT_EXIST_IN_DB', [checkedData.prpNm]));
    return await true;
  }
  return await false;
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  if (await checkDuplicationByPk()) { return; } // Pk Dupli-Check

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post(baseUrl, changedRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    /* 상품코드 */
    { fieldName: 'pdCd',
      header: { text: t('MSG_TXT_PRDT_CODE'), styleName: 'essential' },
      width: '130',
      button: 'action',
      rules: 'required',
      styleCallback(grid, dataCell) {
        return dataCell.item.rowState === 'created'
          ? { editable: true, styleName: 'text-left rg-button-icon--search btnshow', editor: { type: 'text' } }
          : { styleName: 'text-left btnhide', editable: false };
      },
    },
    /* 상품명 */
    { fieldName: 'pdNm',
      header: { text: t('MSG_TXT_PRDT_NM'), styleName: 'essential' },
      width: '180',
      button: 'action',
      rules: 'required',
      styleCallback(grid, dataCell) {
        return dataCell.item.rowState === 'created'
          ? { editable: true, styleName: 'text-left rg-button-icon--search btnshow', editor: { type: 'text' } }
          : { styleName: 'text-left btnhide', editable: false };
      },
    },
    { fieldName: 'rstlBaseTpCd', header: t('MSG_TXT_STPL_TYPE'), width: '80', styleName: 'text-center', rules: 'required', options: codes.RSTL_BASE_TP_CD, editor: { type: 'dropdown', rules: 'required' } }, /* 약정유형 */
    { fieldName: 'rstlMcn', header: t('MSG_TXT_STPL_MONTHS'), width: '80', styleName: 'text-right', rules: 'max_value:999', editor: { inputCharacters: '0-9', maxLength: 3 } }, /* 약정개월수 */
    { fieldName: 'stplTn', header: t('MSG_TXT_STPL_CNTS'), width: '80', styleName: 'text-center', rules: 'required|max_value:999', editor: { inputCharacters: '0-9', maxLength: 3 } }, /* 약정회차 */
    { fieldName: 'rstlSellChnlDvCd', header: t('MSG_TXT_CHNL_DV'), width: '80', styleName: 'text-center', rules: 'required', options: codes.RSTL_SELL_CHNL_DV_CD, editor: { type: 'dropdown', rules: 'required' } }, /* 채널구분 */
    { fieldName: 'apyStrtdt', header: t('MSG_TXT_APY_STRT_DAY'), width: '120', styleName: 'text-center', rules: 'required', dataType: 'date', datetimeFormat: 'date', editor: { type: 'date', datetimeFormat: 'date' } }, /* 적용 시작일 */
    { fieldName: 'apyEnddt', header: t('MSG_TXT_APY_END_DAY'), width: '120', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editor: { type: 'date', datetimeFormat: 'date' } }, /* 적용 종료일 */
    { fieldName: 'stplDscAmt', header: t('MSG_TXT_STPL_SALE_AMT'), width: '100', styleName: 'text-right', rules: 'max_value:9999999999999999999', editor: { inputCharacters: '0-9', maxLength: 20 } }, /* 약정할인액 */
    { fieldName: 'minRentalAmt', header: t('MSG_TXT_LENTAL_PEE_MIN'), width: '100', styleName: 'text-right', rules: 'max_value:9999999999999999999', editor: { inputCharacters: '0-9', maxLength: 20 } }, /* 렌탈료하한 */
    { fieldName: 'rcpStrtMcn', header: t('MSG_TXT_RCPT_STRT_MONTHS'), width: '100', styleName: 'text-right', rules: 'max_value:999', editor: { inputCharacters: '0-9', maxLength: 3 } }, /* 접수시작차월 */
    { fieldName: 'rcpEndMcn', header: t('MSG_TIT_RCPT_END_MONTHS'), width: '100', styleName: 'text-right', rules: 'max_value:999', editor: { inputCharacters: '0-9', maxLength: 3 } }, /* 접수종료차월 */
    { fieldName: 'rstlDutyMcn', header: t('MSG_TXT_DUTY_PTRM'), width: '80', styleName: 'text-right', rules: 'max_value:999', editor: { inputCharacters: '0-9', maxLength: 3 } }, /* 의무기간 */
    // 등록/수정일
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '110', styleName: 'text-center', datetimeFormat: 'date', editable: false },
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGST_USR'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'fstRgstUsrId', header: 'RGST_ID', width: '50', visible: false },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '110', styleName: 'text-center', datetimeFormat: 'date', editable: false },
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcUsrId', header: 'MDFC_ID', width: '50', visible: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);

  data.setFields(fields);
  view.setColumns(columns);
  view.editOptions.editable = true;
  view.rowIndicator.visible = true;
  view.checkBar.visible = true;
  view.filteringOptions.enabled = true;
  view.setFixedOptions({ colCount: 2 });

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const { fstRgstUsrId, fnlMdfcUsrId } = gridUtil.getRowValue(g, dataRow);
    const userId = column === 'fstRgstUsrNm' ? fstRgstUsrId : fnlMdfcUsrId;
    if (column === 'fstRgstUsrNm' || column === 'fnlMdfcUsrNm') {
      await modal({ component: 'ZwcmzUserDtlP', componentProps: { userId } });
    }
  };

  view.onCellButtonClicked = async (g, { column, dataRow, itemIndex }) => {
    if (column === 'pdCd' || column === 'pdNm') {
      if (!gridUtil.isCreatedRow(g, dataRow)) {
        notify(t('MSG_ALT_NOT_MODIFY_IT', [t('MSG_TXT_PD_ATC')]));
        return;
      }
      const componentProps = {
        selectType: pdConst.PD_SEARCH_SINGLE,
        searchType: column === 'pdCd' ? pdConst.PD_SEARCH_CODE : pdConst.PD_SEARCH_NAME,
        searchValue: g.getValue(itemIndex, column),
        sellTpCd: '2', // 렌탈/리스
      };
      const { result, payload } = await modal({ component: 'ZwpdcStandardListP', componentProps });
      if (result) {
        if (payload[0].sellTpCd !== '2') {
          // 등록 불가한 판매유형 상품입니다.(렌탈/리스만 가능)
          notify(t('MSG_ALT_INVAILD_SELL_TP_ONLY_RENTAL'));
          return false;
        }

        g.setValue(itemIndex, 'pdCd', payload[0].pdCd);
        g.setValue(itemIndex, 'pdNm', payload[0].pdNm);
      }
    }
  };

  view.onEditRowChanged = (grid, itemIndex, dataRow, field, oldValue, newValue) => {
    const compareColumn = data.getFieldName(field);
    // 적용[시작|종료]일
    if (compareColumn === 'APYSTRTDT') {
      const apyEnddt = grid.getValue(itemIndex, 'apyEnddt').replaceAll('-', '');
      if (!isEmpty(apyEnddt) && (Number(newValue) > Number(apyEnddt))) {
        // 적용시작일은 적용종료일보다 작은 값이어야 합니다.
        notify(t('MSG_ALT_INVAILD_RANGE_STRT_DT'));
        grid.setValue(itemIndex, field, oldValue);
        return false;
      }
    }
    if (compareColumn === 'APYENDDT') {
      const apyStrtdt = grid.getValue(itemIndex, 'apyStrtdt').replaceAll('-', '');
      if (!isEmpty(apyStrtdt) && (Number(newValue) < Number(apyStrtdt))) {
        // 적용종료일은 적용시작일보다 큰 값이어야 합니다.
        notify(t('MSG_ALT_INVAILD_RANGE_END_DT'));
        grid.setValue(itemIndex, field, oldValue);
        return false;
      }
    }

    // 접수[시작|종료]차월
    if (compareColumn === 'RCPSTRTMCN') {
      const rcpEndMcn = grid.getValue(itemIndex, 'rcpEndMcn');
      if (!isEmpty(rcpEndMcn) && (Number(newValue) > Number(rcpEndMcn))) {
        // 접수시작차월은 접수종료차월보다 작은 값이어야 합니다.
        notify(t('MSG_ALT_INVAILD_RANGE_STRT_MONTH_CNT'));
        grid.setValue(itemIndex, field, oldValue);
        return false;
      }
    }
    if (compareColumn === 'RCPENDMCN') {
      const rcpStrtMcn = grid.getValue(itemIndex, 'rcpStrtMcn');
      if (!isEmpty(rcpStrtMcn) && (Number(newValue) < Number(rcpStrtMcn))) {
        // 접수종료차월은 접수시작차월보다 큰 값이어야 합니다.
        notify(t('MSG_ALT_INVAILD_RANGE_END_MONTH_CNT'));
        grid.setValue(itemIndex, field, oldValue);
        return false;
      }
    }
  };

  const readOnlyArr = ['pdCd', 'pdNm', 'rstlBaseTpCd', 'stplTn', 'rstlSellChnlDvCd', 'apyStrtdt'];
  view.onCellEditable = (grid, index) => {
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && readOnlyArr.includes(index.column)) {
      return false;
    }
  };
});

</script>

<style>
.btnshow div .rg-button-action {
  visibility: visible !important;
  overflow: visible !important;
}

.btnhide div .rg-button-action {
  visibility: hidden !important;
  overflow: hidden !important;
}

</style>
