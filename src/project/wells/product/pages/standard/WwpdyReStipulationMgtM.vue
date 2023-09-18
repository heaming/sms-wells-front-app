<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY
2. 프로그램 ID : WwpdyReStipulationMgtM - 재약정 기준정보 관리 (W-PD-U-0045M01)
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
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
        <kw-search-item :label="$t('MSG_TXT_PRDT_NM', null, '상품명')">
          <kw-input
            v-model.trim="searchParams.pdNm"
            :maxlength="100"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PRDT_CODE', null, '상품코드')">
          <kw-input
            v-model.trim="searchParams.pdCd"
            :maxlength="10"
            clearable
            icon="search"
            @click-icon="onClickProduct(pdConst.PD_SEARCH_CODE)"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_ACEPT_PERIOD', null, '적용기간')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDate"
            v-model:to="searchParams.endDate"
            rules="date_range_required"
            :label="t('MSG_TXT_ACEPT_PERIOD', null, '적용기간')"
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
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON', null, '(단위: 원)') }}</span>
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
        :need-context-menu="false"
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
import { isValidGridCodes } from '~sms-common/product/utils/pdUtil';

const dataService = useDataService();
const { t } = useI18n();
const { notify, modal, alert } = useGlobal();
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
  'RSTL_BASE_TP_CD', // 재약정기준유형코드 - [A,B,C,D]
  'RSTL_SELL_CHNL_DV_CD', // 재약정판매채널구분코드 [전체, 영업부, 방문판매, TM, SalesTM]
  'COD_PAGE_SIZE_OPTIONS',
);
codes.COD_YN = [{ codeId: 'Y', codeName: 'Y' }, { codeId: 'N', codeName: 'N' }];

let cachedParams;
const searchParams = ref({
  pdCd: '',
  pdNm: '',
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: '9999-12-31',
});

// 제품코드 조회팝업
async function onClickProduct() {
  const componentProps = {
    selectType: pdConst.PD_SEARCH_SINGLE,
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.pdCd,
    sellTpCd: '2', // 렌탈/리스
  };
  const { result, payload } = await modal({ component: 'ZwpdcStandardListP', componentProps });
  if (result) {
    if (payload[0].sellTpCd !== '2') {
      // 등록 불가한 판매유형 상품입니다.(렌탈/리스만 가능)
      notify(t('MSG_ALT_INVAILD_SELL_TP_ONLY_RENTAL'));
      return false;
    }
    searchParams.value.pdCd = payload[0].pdCd;
  }
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
    ackmtAmt: '',
    ackmtCt: '',
    feeAckmtBaseAmt: '',
    feeFxamYn: 'Y',
  });
  view.setColumnProperty('pdCd', 'styleName', 'btnshow');
  view.setColumnProperty('pdNm', 'styleName', 'btnshow');
  view.commit();
  pageInfo.value.totalCount += 1;
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const checkedRowCount = view.getCheckedRows().length;
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  pageInfo.value.totalCount -= checkedRowCount - deletedRows.length;
  if (deletedRows.length > 0) {
    await dataService.delete(baseUrl, { data: deletedRows });
    await fetchData();
  }
}
async function checkDuplicationByPk() {
  let isInvailVal = false;
  let dupPdNm = '';
  // #1. 신규 입력항목들 사이에 중복값 체크.
  const view = grdMainRef.value.getView();
  // const createdRows = gridUtil.getCreatedRowValues(view);
  const insUpdRows = gridUtil.getChangedRowValues(view, false);

  if (insUpdRows.length === 0) return await false;

  for (let i = 0; i < insUpdRows.length; i += 1) {
    const baseRow = insUpdRows[i];
    for (let j = 1; j < insUpdRows.length; j += 1) {
      const targetRow = insUpdRows[j];
      // console.log(i, j, baseRow, targetRow);

      if (i !== j
      && baseRow.pdCd === targetRow.pdCd
      && baseRow.rstlBaseTpCd === targetRow.rstlBaseTpCd
      && baseRow.rstlMcn === targetRow.rstlMcn
      && baseRow.stplTn === targetRow.stplTn
      && baseRow.rstlSellChnlDvCd === targetRow.rstlSellChnlDvCd) {
        const bs = Number(baseRow.apyStrtdt.replaceAll('-', ''));
        const be = Number(baseRow.apyEnddt.replaceAll('-', ''));
        const ts = Number(targetRow.apyStrtdt.replaceAll('-', ''));
        const te = Number(targetRow.apyEnddt.replaceAll('-', ''));

        // console.log(bs, be, ts, te);
        if (
          (((ts >= bs && ts <= be) || (te <= bs && te <= be)) && (te >= bs))
          || ((ts <= bs) && (te >= bs && te <= be))
          || ((ts >= bs && ts <= be) && (te >= be))
          || ((ts <= bs) && (te >= be))
        ) {
          // console.log('error');
          isInvailVal = true;
          dupPdNm = baseRow.pdNm;
          break;
        } else {
          console.debug('OK');
        }
      }
    }// j - FOR
  } // i - FOR

  // console.log('isInvailVal', isInvailVal);
  if (isInvailVal) {
    notify(t('EXIST_DUP_RANGE_PD', [dupPdNm]));
    return await true;
  }

  // #2. 신규 입력항목들이 DB에 기입력되어 있는지 체크.
  const { data: checkedData } = await dataService.post(`${baseUrl}/duplication-check`, insUpdRows);
  console.debug('checkedData', checkedData);
  if (checkedData.dupliYn === 'Y') {
    // 은(는) 이미 DB에 등록되어 있습니다.
    await alert(t('MSG_ALT_EXIST_IN_DB', [checkedData.pdNm]));
    return await true;
  }
  return await false;
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  if (!await isValidGridCodes(view, ['pdCd'])) { return; } // 상품코드 검사
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
  /*
            3 -------------------6
C1              OOOOOOOOOOOOO
C2  OOOOOOOOOOOOO
C3                            OOOOOOOOOOOOO
C4    OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
  */
  /*
  ------------------------------------------
      1   2   3   4   5   6   7   8
-----------------B--------------------
              3           6
-----------------T------------------------
                  4   5
          2       4
                  4
                              7
          2                   7
 */
  // const bs = 3;
  // const be = 6;
  // ERROR- C1
  // const ts = 4;
  // const te = 5;
  // ERROR- C2
  // const ts = 2;
  // const te = 4;
  // ERROR- C3
  // const ts = 4;
  // const te = 7;
  // ERROR- C4
  // const ts = 2;
  // const te = 7;

  // 정상케이스 1
  // const ts = 1;
  // const te = 2;
  // 정상케이스 1
  // const ts = 6;
  // const te = 7;

  // console.log(bs, be);
  // console.log(ts, te);

  // if (
  //   (((ts >= bs && ts <= be) || (te <= bs && te <= be)) && (te >= bs))
  //   || ((ts <= bs) && (te >= bs && te <= be))
  //   || ((ts >= bs && ts <= be) && (te >= be))
  //   || ((ts <= bs) && (te >= be))
  // ) {
  //   console.log('error');
  // } else {
  //   console.log('OK');
  // }

  // if ((bs <= ts) && (te <= be)) {
  //   console.log('error C1');
  // } else if ((bs >= ts) && (te <= be) && (te >= bs)) {
  //   console.log('error C2');
  // } else if ((bs <= ts) && (te >= be)) {
  //   console.log('error C3');
  // } else if ((bs >= ts) && (te >= be)) {
  //   console.log('error C4');
  // } else {
  //   console.log('OK');
  // }
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const numberEditor3 = { type: 'number', positiveOnly: true, editFormat: '#,##0', maxLength: 3 };
  const numberEditor5 = { type: 'number', positiveOnly: true, editFormat: '#,##0', maxLength: 5 };
  const numberEditor20 = { type: 'number', positiveOnly: true, editFormat: '#,##0', maxLength: 10 };
  const numberForamt = '#,##0';

  const columns = [
    { fieldName: 'pdCd',
      header: { text: t('MSG_TXT_PRDT_CODE', null, '상품코드'), styleName: 'essential' },
      width: '130',
      button: 'action',
      rules: 'required',
      styleCallback(grid, dataCell) {
        return dataCell.item.rowState === 'created'
          ? { editable: true, styleName: 'text-center rg-button-icon--search btnshow', editor: { type: 'text' } }
          : { styleName: 'text-center btnhide', editable: false };
      },
    },
    { fieldName: 'pdNm',
      header: { text: t('MSG_TXT_PRDT_NM', null, '상품명'), styleName: 'essential' },
      width: '180',
      button: 'action',
      rules: 'required',
      styleCallback(grid, dataCell) {
        return dataCell.item.rowState === 'created'
          ? { editable: true, styleName: 'text-left rg-button-icon--search btnshow', editor: { type: 'text' } }
          : { styleName: 'text-left btnhide', editable: false };
      },
    },
    { fieldName: 'rstlBaseTpCd', header: t('MSG_TXT_STPL_TYPE', null, '약정유형'), width: '80', styleName: 'text-center', rules: 'required', options: codes.RSTL_BASE_TP_CD, editor: { type: 'dropdown', rules: 'required' } },
    { fieldName: 'rstlMcn', header: t('MSG_TXT_STPL_MONTHS', null, '약정개월수'), width: '80', styleName: 'text-right', editor: numberEditor3 },
    { fieldName: 'stplTn', header: t('MSG_TXT_STPL_CNTS', null, '약정회차'), width: '80', styleName: 'text-center', rules: 'required|max_value:999', editor: { inputCharacters: '0-9', maxLength: 3 } },
    { fieldName: 'rstlSellChnlDvCd', header: t('MSG_TXT_CHNL_DV', null, '채널구분'), width: '80', styleName: 'text-center', rules: 'required', options: codes.RSTL_SELL_CHNL_DV_CD, editor: { type: 'dropdown', rules: 'required' } },
    { fieldName: 'apyStrtdt', header: t('MSG_TXT_APY_STRT_DAY', null, '적용 시작일'), width: '120', styleName: 'text-center', rules: 'required', dataType: 'date', datetimeFormat: 'date', editor: { type: 'date', datetimeFormat: 'date' } },
    { fieldName: 'apyEnddt', header: t('MSG_TXT_APY_END_DAY', null, '적용 종료일'), width: '120', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editor: { type: 'date', datetimeFormat: 'date' } },
    { fieldName: 'stplDscAmt', header: t('MSG_TXT_STPL_SALE_AMT', null, '약정할인액'), width: '100', styleName: 'text-right', editor: numberEditor20, dataType: 'number', numberFormat: numberForamt },
    { fieldName: 'minRentalAmt', header: t('MSG_TXT_LENTAL_PEE_MIN', null, '렌탈료하한'), width: '100', styleName: 'text-right', editor: numberEditor20, dataType: 'number', numberFormat: numberForamt },
    { fieldName: 'rcpStrtMcn', header: t('MSG_TXT_RCPT_STRT_MONTHS', null, '접수시작차월'), width: '100', styleName: 'text-right', editor: numberEditor3 },
    { fieldName: 'rcpEndMcn', header: t('MSG_TIT_RCPT_END_MONTHS', null, '접수종료차월'), width: '100', styleName: 'text-right', editor: numberEditor3 },
    { fieldName: 'rstlDutyMcn', header: t('MSG_TXT_DUTY_PTRM', null, '의무기간'), width: '80', styleName: 'text-right', editor: numberEditor3 },

    { fieldName: 'ackmtCt', header: t('MSG_TXT_PD_ACC_CNT', null, '인정건수'), width: '100', styleName: 'text-right', editor: numberEditor5, dataType: 'number', numberFormat: numberForamt },
    { fieldName: 'ackmtAmt', header: t('MSG_TXT_PD_ACC_RSLT', null, '인정실적'), width: '100', styleName: 'text-right', editor: numberEditor20, dataType: 'number', numberFormat: numberForamt },
    { fieldName: 'feeAckmtBaseAmt', header: t('MSG_TXT_PD_STD_FEE', null, '기준수수료'), width: '100', styleName: 'text-right', editor: numberEditor20, dataType: 'number', numberFormat: numberForamt },
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_FXAM_YN', null, '정액여부'), width: '90', options: codes.COD_YN, editor: { type: 'dropdown' }, styleName: 'text-center' },
    { fieldName: 'rid', header: 'row식별값', visible: false },

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
