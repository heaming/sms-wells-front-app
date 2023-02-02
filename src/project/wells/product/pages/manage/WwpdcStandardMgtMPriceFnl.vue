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
    <kw-action-top>
      <kw-btn
        v-show="!props.readonly"
        :label="$t('MSG_BTN_MDFC')"
        dense
        @click="onClickMidify"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
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
import { gridUtil, getComponentType } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { getGridRowsToSavePdProps, getPropInfosToGridRows, getPdMetaToGridInfos } from '~sms-common/product/utils/pdUtil';

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

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;
const priceStdRef = ref();
const currentPdCd = ref();
const currentInitData = ref(null);
const currentMetaInfos = ref();
const removeObjects = reactive([]);

async function resetInitData() {
  Object.assign(removeObjects, []);
  await initGridRows();
}

async function onClickMidify() {
  const view = grdMainRef.value.getView();
  const savFields = await priceStdRef.value.getSaveFields();
  const rowItem = savFields?.reduce((rtn, item) => {
    rtn[item.colNm] = item.initValue;
    return rtn;
  }, {});
  const data = view.getDataSource();
  data.updateRow(view.getSelectedRows()[0], rowItem);
}

async function onClickRemove() {
  const deletedRowValues = gridUtil.deleteCheckedRows(grdMainRef.value.getView());
  if (deletedRowValues && deletedRowValues.length) {
    removeObjects.push(...deletedRowValues.reduce((rtn, item) => {
      if (item[pdConst.PRC_FNL_ROW_ID]) {
        rtn.push({ [pdConst.PRC_FNL_ROW_ID]: item[pdConst.PRC_FNL_ROW_ID] });
      }
      return rtn;
    }, []));
  }
}

async function getSaveData() {
  const rowValues = gridUtil.getAllRowValues(grdMainRef.value.getView());
  const rtnValues = await getGridRowsToSavePdProps(
    rowValues,
    currentMetaInfos.value,
    prcfd,
    [pdConst.PRC_FNL_ROW_ID],
  );
  if (removeObjects.length) {
    rtnValues[pdConst.REMOVE_ROWS] = cloneDeep(removeObjects);
  }
  console.log('WwpdcStandardMgtMPriceFnl - getSaveData - rtnValues : ', rtnValues);
  return rtnValues;
}

function isModifiedProps() {
  return true;
}

function validateProps() {
  return true;
}

async function initProps() {
  const { pdCd, initData, metaInfos } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  currentMetaInfos.value = metaInfos;
}

await initProps();

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrid(data, view) {
  const { metaInfos } = props;
  currentMetaInfos.value = metaInfos;
  const { fields, columns } = await getPdMetaToGridInfos(
    currentMetaInfos.value,
    [pdConst.PD_PRC_TP_CD_BASIC,
      pdConst.PD_PRC_TP_CD_VARIABLE,
      pdConst.PD_PRC_TP_CD_FINAL],
    props.codes,
    pdConst.DEFAULT_READ_ONLY_FIELDS,
  );
  // Grid 내부키 - '신규 Row 추가' 대응
  fields.push({ fieldName: pdConst.PRC_FNL_ROW_ID });
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  await initGridRows();
}

async function initGridRows() {
  removeObjects.value = [];
  if (await currentInitData.value?.[prcfd]) {
    const rows = cloneDeep(await getPropInfosToGridRows(
      currentInitData.value?.[prcfd],
      currentMetaInfos.value,
      '',
      [pdConst.PRC_FNL_ROW_ID],
    ));
    rows?.map((row) => {
      row[pdConst.PRC_FNL_ROW_ID] = row[pdConst.PRC_FNL_ROW_ID] ?? row.pdPrcFnlDtlId;
      row.pdPrcDtlIdRefFp = row.pdPrcDtlId;
      return row;
    });
    // console.log('Rows : ', rows);
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(rows);
    view.resetCurrent();
  }
}

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; resetInitData(); }, { deep: true });
</script>
