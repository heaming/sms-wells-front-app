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
        dense
        @click="onClickRemove"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
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
import { cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { setPdGridRows, pdMergeBy, getGridRowsToSavePdProps, getPropInfosToGridRows, getPdMetaToGridInfos } from '~sms-common/product/utils/pdUtil';

/* eslint-disable no-use-before-define */
defineExpose({
  getSaveData, isModifiedProps, validateProps,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  metaInfos: { type: Object, default: null },
  codes: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
});

const { t } = useI18n();
const { alert } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const prcd = pdConst.TBL_PD_PRC_DTL;
const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;
const defaultFields = ref([pdConst.PRC_STD_ROW_ID, pdConst.PRC_FNL_ROW_ID,
  pdConst.PRC_DETAIL_ID, pdConst.PRC_DETAIL_FNL_ID]);
const currentPdCd = ref();
const currentInitData = ref(null);
const currentMetaInfos = ref();
const removeObjects = ref([]);

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
    ['fnlVal', ...defaultFields.value],
    outKeys,
  );
  if (removeObjects.value.length) {
    rtnValues[pdConst.REMOVE_ROWS] = cloneDeep(removeObjects.value);
  }
  // console.log('WwpdcStandardMgtMPriceFnl - getSaveData - rtnValues : ', rtnValues);
  return rtnValues;
}

function isModifiedProps() {
  return true;
}

function validateProps() {
  return true;
}

async function resetInitData() {
  Object.assign(removeObjects.value, []);
  await initGridRows();
}

async function onClickRemove() {
  const deletedRowValues = gridUtil.deleteCheckedRows(grdMainRef.value.getView());
  if (deletedRowValues && deletedRowValues.length) {
    removeObjects.value.push(...deletedRowValues.reduce((rtn, item) => {
      if (item[pdConst.PRC_FNL_ROW_ID]) {
        rtn.push({ [pdConst.PRC_FNL_ROW_ID]: item[pdConst.PRC_FNL_ROW_ID] });
      }
      return rtn;
    }, []));
  }
}

async function initGridRows() {
  removeObjects.value = [];
  const view = grdMainRef.value.getView();
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
      defaultFields.value,
    ));
    rows?.map((row) => {
      row[pdConst.PRC_FNL_ROW_ID] = row[pdConst.PRC_FNL_ROW_ID] ?? row.pdPrcFnlDtlId;
      row[pdConst.PRC_STD_ROW_ID] = row[pdConst.PRC_STD_ROW_ID] ?? row.pdPrcDtlId;
      const stdRow = stdRows?.find((item) => item[pdConst.PRC_STD_ROW_ID] === row[pdConst.PRC_STD_ROW_ID]
                                            || item.pdPrcDtlId === row.pdPrcDtlId);
      row = pdMergeBy(row, stdRow);
      // console.log('WwpdcStandardMgtMPriceFnl - initGridRows - row : ', row);
      row.sellTpCd = currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd;
      // 조정 전 가격 ( 01: 정액, 02: 정률)
      if (row.cndtFxamFxrtDvCd === '01') {
        // 조정 전 가격 = 기준가 + 조정가
        row.prcBefAdj = Number(row.ccamBasePrc) - Number(row.cndtDscPrumVal);
      } else if (row.cndtFxamFxrtDvCd === '02') {
        // 조정 전 가격 = 기준가 + 조정률
        const calPrc = Math.round((Number(row.ccamBasePrc) * Number(row.cndtDscPrumVal)) / 100, 2);
        row.prcBefAdj = Number(row.ccamBasePrc) - calPrc;
      }
      row.fnlVal = Number(row.prcBefAdj) - Number(row.ctrVal);

      return row;
    });
    // console.log('WwpdcStandardMgtMPriceFnl - initGridRows - Rows : ', rows);
    setPdGridRows(view, rows, pdConst.PRC_FNL_ROW_ID, defaultFields.value, true);
  } else {
    view.getDataSource().clearRows();
  }
}

async function initProps() {
  const { pdCd, initData, metaInfos } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  currentMetaInfos.value = metaInfos;
}

await initProps();

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; resetInitData(); }, { deep: true });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function setFinalVal(view, grid, itemIndex) {
  const prcBefAdj = Number(grid.getValue(itemIndex, 'prcBefAdj'));
  let ctrVal = Number(grid.getValue(itemIndex, 'ctrVal'));
  let fnlVal = 0;
  // 조정 전 가격 ( 01: 정액, 02: 정률)23
  if (ctrVal > prcBefAdj) {
    /* {0}값이 {1}보다 큽니다. */
    await alert(t('MSG_ALT_A_IS_GREAT_THEN_B', [
      `${grid.columnByName('ctrVal').header.text}(${ctrVal})`,
      `${grid.columnByName('prcBefAdj').header.text}(${prcBefAdj})`]));
    ctrVal = 0;
    view.setValue(itemIndex, 'ctrVal', ctrVal);
  }
  // 조정 전 가격 = 조정전가격 - 조정가
  fnlVal = prcBefAdj - ctrVal;
  view.setValue(itemIndex, 'fnlVal', fnlVal);
  view.resetCurrent();
}

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
    [pdConst.PRC_STD_ROW_ID, pdConst.PRC_FNL_ROW_ID, pdConst.PRC_DETAIL_ID, pdConst.PRC_DETAIL_FNL_ID], // 조정 전 가격
  );
  // 할인적용가격
  const prcBeforAdj = { fieldName: 'prcBefAdj',
    header: t('MSG_TXT_DIS_APP_PRC'),
    width: '120',
    styleName: 'text-right',
    dataType: 'number',
    numberFormat: '#,##0.##' };
  prcBeforAdj.editable = false;
  columns.splice(columns.length - 3, 0, prcBeforAdj);
  fields.push({ fieldName: 'prcBefAdj', dataType: 'number' });
  columns.map((item) => {
    if (item.fieldName === 'svPdCd') {
      item.options = props.codes.svPdCd;
    }
    return item;
  });
  /* columns.map((item) => {
    if (item.fieldName === 'ctrVal') {
      item.styleName = 'rg-number-step';
      item.sortable = false;
      item.editButtonVisibility = 'always';
      item.editor.showStepButton = true;
      item.editor.positiveOnly = true;
      item.editor.direction = 'horizontal';
      item.editor.step = 1;
      item.width = 140;
    }
    return item;
  }); */
  data.setFields(fields);
  view.setColumns(columns.sort((item) => (item.fieldName === 'sellChnlCd' ? -1 : 0)));
  view.checkBar.visible = true;
  view.rowIndicator.visible = false;
  view.editOptions.editable = true;
  view.setFixedOptions({ colCount: 6 });

  // 조정 값 초기화
  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    // fieldIndex 값 이상함 +1해줘야 맞게 나옴
    const changedFieldName = grid.getColumn((fieldIndex + 1)).fieldName;
    if (changedFieldName === 'ctrVal') {
      await setFinalVal(view, grid, itemIndex);
    }
  };

  /* view.onCellClicked = async (grid, clickData) => {
    if (clickData.column === 'ctrVal') {
      await setFinalVal(view, grid, clickData.itemIndex);
    }
  }; */
  // 그리드 마운트 시점과 컴포넌트 마운트 시점 불일지로 아래 로직 추가
  await initGridRows();
}
</script>
