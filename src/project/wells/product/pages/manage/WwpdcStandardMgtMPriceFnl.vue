<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMPriceFnl - 기준상품 등록/변경 - 가격정보 - 최종가격 조정 (  )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 가격정보 - 최종가격 조정 프로그램
****************************************************************************************************
--->
<template>
  <div class="normal-area">
    <!-- 최종가격 조정 -->
    <h3>{{ $t('MSG_TXT_PD_FNL_PRC_ADJ') }}</h3>
    <kw-action-top>
      <kw-btn
        v-show="!props.readonly"
        :label="$t('MSG_BTN_DEL')"
        grid-action
        dense
        :disable="gridRowCount === 0"
        @click="onClickRemove"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMgtPrcFnlMain"
      :visible-rows="5"
      @init="initGrid"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { gridUtil, getComponentType, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { resetVisibleGridColumns, getGridRowCount, setPdGridRows, pdMergeBy, getGridRowsToSavePdProps, getPropInfosToGridRows, getPdMetaToGridInfos } from '~sms-common/product/utils/pdUtil';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData, init, getSaveData, isModifiedProps, validateProps,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  metaInfos: { type: Object, default: null },
  codes: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
});

const { t } = useI18n();
const { notify } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const prcd = pdConst.TBL_PD_PRC_DTL;
const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;
const prumd = pdConst.TBL_PD_DSC_PRUM_DTL;
const defaultFields = ref([pdConst.PRC_STD_ROW_ID, pdConst.PRC_FNL_ROW_ID,
  pdConst.PRC_DETAIL_ID, pdConst.PRC_DETAIL_FNL_ID]);
const currentPdCd = ref();
const currentInitData = ref(null);
const currentMetaInfos = ref();
const removeObjects = ref([]);
const gridRowCount = ref(0);

async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  removeObjects.value = [];
  gridRowCount.value = 0;
  grdMainRef.value?.getView().getDataSource().clearRows();
  if (grdMainRef.value?.getView()) gridUtil.reset(grdMainRef.value.getView());
}

async function init() {
  if (grdMainRef.value?.getView()) gridUtil.init(grdMainRef.value.getView());
}

async function getSaveData() {
  const view = grdMainRef.value.getView();
  /* 그리드에서 수정항목이 아닌 경우 제외 */
  const outKeys = view.getColumns().filter((item) => !item.editable).reduce((rtn, item) => {
    rtn.push(item.fieldName);
    return rtn;
  }, []);
  // console.log('outKeys : ', outKeys);
  const rowValues = gridUtil.getAllRowValues(view);
  const rtnValues = await getGridRowsToSavePdProps(
    rowValues,
    currentMetaInfos.value,
    prcfd,
    ['fnlVal', 'sellTpCd', ...defaultFields.value],
    outKeys,
  );

  if (removeObjects.value.length) {
    rtnValues[pdConst.REMOVE_ROWS] = cloneDeep(removeObjects.value);
  }
  // console.log('WwpdcStandardMgtMPriceFnl - getSaveData - rtnValues : ', rtnValues);
  return rtnValues;
}

async function isModifiedProps() {
  return gridUtil.isModified(grdMainRef.value.getView());
}

async function validateProps() {
  const rtn = gridUtil.validate(grdMainRef.value.getView(), {
    isChangedOnly: false,
  });
  return rtn;
}

async function setFinalVal(view, grid, itemIndex) {
  const prcBefAdj = Number(grid.getValue(itemIndex, 'prcBefAdj') ?? 0);
  let ctrVal = Number(grid.getValue(itemIndex, 'ctrVal') ?? 0);
  let fnlVal = 0;
  // 조정 전 가격 ( 01: 정액, 02: 정률)
  if (ctrVal < 0 && Math.abs(ctrVal) > prcBefAdj) {
    /* {0}값이 {1}보다 작습니다. */
    notify(t('MSG_ALT_A_IS_LESS_THEN_B', [
      `${grid.columnByName('ctrVal').header.text}(${ctrVal})`,
      `${grid.columnByName('prcBefAdj').header.text}(${prcBefAdj})`]));
    ctrVal = 0;
    view.setValue(itemIndex, 'ctrVal', ctrVal);
  }
  // 조정 전 가격 = 조정전가격 - 조정가
  fnlVal = prcBefAdj + ctrVal;
  view.setValue(itemIndex, 'fnlVal', fnlVal);
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  const deletedRowValues = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRowValues && deletedRowValues.length) {
    removeObjects.value.push(...deletedRowValues.reduce((rtn, item) => {
      if (item[pdConst.PRC_FNL_ROW_ID]) {
        rtn.push({ [pdConst.PRC_FNL_ROW_ID]: item[pdConst.PRC_FNL_ROW_ID] });
      }
      return rtn;
    }, []));
  }
  gridRowCount.value = getGridRowCount(view);
}

async function initGridRows() {
  removeObjects.value = [];
  const view = grdMainRef.value?.getView();
  if (isEmpty(view)) {
    return;
  }

  // 선택변수
  const checkedVals = currentInitData.value?.[prumd]?.reduce((rtn, item) => {
    if (item.pdDscPrumPrpVal01) {
      rtn.push(item.pdDscPrumPrpVal01);
    }
    return rtn;
  }, []);
  resetVisibleGridColumns(currentMetaInfos.value, pdConst.PD_PRC_TP_CD_FINAL, view);
  if (checkedVals && checkedVals.length) {
    checkedVals.forEach((fieldName) => {
    // 선택변수 표시
      const column = view.columnByName(fieldName);
      if (column) {
        column.visible = true;
      }
    });
  }

  if (await currentInitData.value?.[prcfd]) {
    // 기준가 정보
    const stdRows = cloneDeep(
      await getPropInfosToGridRows(
        currentInitData.value?.[prcd],
        currentMetaInfos.value,
        prcd,
        [pdConst.PRC_STD_ROW_ID],
      ),
    );
    // console.log('WwpdcStandardMgtMPriceFnl - initGridRows - ?.[prcfd]', currentInitData.value?.[prcfd]);
    const rows = cloneDeep(await getPropInfosToGridRows(
      currentInitData.value?.[prcfd],
      currentMetaInfos.value,
      prcfd,
      [...defaultFields.value, 'prcBefAdj'],
    ));
    rows?.map((row) => {
      row[pdConst.PRC_FNL_ROW_ID] = row[pdConst.PRC_FNL_ROW_ID] ?? row.pdPrcFnlDtlId;
      row[pdConst.PRC_STD_ROW_ID] = row[pdConst.PRC_STD_ROW_ID] ?? row.pdPrcDtlId;
      const stdRow = stdRows?.find((item) => (row[pdConst.PRC_STD_ROW_ID]
                                                && item[pdConst.PRC_STD_ROW_ID] === row[pdConst.PRC_STD_ROW_ID])
                                            || (row.pdPrcDtlId && item.pdPrcDtlId === row.pdPrcDtlId));
      row = pdMergeBy(row, stdRow);
      if (isEmpty(row[pdConst.PRC_STD_ROW_ID])) row[pdConst.PRC_STD_ROW_ID] = row.pdPrcDtlId;
      // console.log('WwpdcStandardMgtMPriceFnl - initGridRows - row : ', row);
      row.sellTpCd = currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd;
      return row;
    });
    // console.log('WwpdcStandardMgtMPriceFnl - initGridRows - Rows : ', rows);
    await setPdGridRows(view, rows, pdConst.PRC_FNL_ROW_ID, defaultFields.value, true);
  }
  gridRowCount.value = getGridRowCount(view);
}

async function initProps() {
  const { pdCd, initData, metaInfos } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  currentMetaInfos.value = metaInfos;
}

await initProps();

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; initGridRows(); }, { deep: true });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrid(data, view) {
  const { metaInfos } = props;
  currentMetaInfos.value = metaInfos;
  currentMetaInfos.value.map((item) => {
    if (item.colNm === 'fnlVal') {
      // 최종가격
      item.prpNm = t('MSG_TXT_PD_FNL_PRC');
    }
    return item;
  });
  const basicColNms = currentMetaInfos.value
    ?.filter((item) => item.pdPrcMetaTpCd === pdConst.PD_PRC_TP_CD_BASIC)
    ?.reduce((rtn, item) => { rtn.push(item.colNm); return rtn; }, []);
  const valColNms = currentMetaInfos.value
    ?.filter((item) => item.pdPrcMetaTpCd === pdConst.PD_PRC_TP_CD_VARIABLE)
    ?.reduce((rtn, item) => { rtn.push(item.colNm); return rtn; }, []);
  const readonlyFields = ['sellChnlCd', 'fnlVal', ...basicColNms, ...valColNms];

  const { fields, columns } = await getPdMetaToGridInfos(
    currentMetaInfos.value,
    [pdConst.PD_PRC_TP_CD_BASIC,
      pdConst.PD_PRC_TP_CD_VARIABLE,
      pdConst.PD_PRC_TP_CD_FINAL],
    props.codes,
    readonlyFields,
    ['cndtFxamFxrtDvCd', 'cndtDscPrumVal'],
    defaultFields.value,
  );
  // 할인적용가격
  const prcBeforAdj = { fieldName: 'prcBefAdj',
    header: t('MSG_TXT_DIS_APP_PRC'),
    width: '120',
    styleName: 'text-right',
    dataType: 'number',
    numberFormat: '#,##0.##',
    editable: false,
  };
  columns.splice(columns.length - 3, 0, prcBeforAdj);
  fields.push({ fieldName: 'prcBefAdj', dataType: 'number' });

  columns.map((item) => {
    if (item.fieldName === 'svPdCd') {
      item.styleName = 'text-left';
      item.options = props.codes.svPdCd;
    }
    return item;
  });
  data.setFields(fields);
  view.setColumns(columns.sort((item) => (item.fieldName === 'sellChnlCd' ? -1 : 0)));
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;

  view.setFixedOptions({ colCount: 6 });

  // 조정 값 초기화
  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    const changedFieldName = grid.getDataSource().getFieldName(fieldIndex);
    if (changedFieldName === 'CTRVAL') {
      await setFinalVal(view, grid, itemIndex);
    }
  };
  await initGridRows();
  await init();
}
</script>
