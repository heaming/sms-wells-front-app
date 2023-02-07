<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMPriceStd - 기준상품 등록/변경- 가격정보 - 기준가 등록 ( W-PD-U-0010M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경- 가격정보 - 기준가 등록 프로그램
****************************************************************************************************
--->
<template>
  <div class="normal-area">
    <!-- 기준가(고정변수) 등록 -->
    <h3>{{ $t('MSG_TXT_PD_STD_PRC_FIX_VAL') }}</h3>
    <!-- v-model:init-data="priceFieldData" -->
    <zwpdc-prop-meta
      ref="priceStdRef"
      v-model:pd-cd="currentPdCd"
      v-model:init-data="priceFieldData"
      :pd-prc-tp-cd="pdConst.PD_PRC_TP_CD_BASIC"
      :readonly-fields="readonlyFields"
      :use-rule="false"
      :codes="currentCodes"
    />
    <kw-separator />
    <kw-action-bottom class="mb30">
      <kw-btn
        v-show="!props.readonly"
        :label="$t('MSG_BTN_ADD')"
        dense
        @click="onClickAdd"
      />
    </kw-action-bottom>

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
import { gridUtil, stringUtil, getComponentType } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdcPropMeta from '~sms-common/product/pages/manage/components/ZwpdcPropMeta.vue';
import { getGridRowsToSavePdProps, getPropInfosToGridRows, getPdMetaToGridInfos, pdMergeBy } from '~sms-common/product/utils/pdUtil';

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

const readonlyFields = ref(['pdCd', 'pdPrcDtlId', 'verSn', 'crncyDvCd', 'sellTpCd']);
const prcd = pdConst.TBL_PD_PRC_DTL;
const priceStdRef = ref();
const currentPdCd = ref();
const currentInitData = ref(null);
const priceFieldData = ref({});
const currentMetaInfos = ref();
const removeObjects = reactive([]);
const currentCodes = ref({});

async function resetInitData() {
  Object.assign(removeObjects, []);
  await initGridRows();
}

async function initGridRows() {
  priceFieldData.value[prcd] = [{
    pdExtsPrpGrpCd: 'PRC',
    // 통화명
    crncyDvCd: currentInitData.value[pdConst.TBL_PD_BAS]?.crncyDvCd,
    // 판매유형
    sellTpCd: currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd,
  }];
  const currentSellTpCd = currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd;
  priceFieldData.value[pdConst.TBL_PD_BAS] = {
    // 판매유형
    sellTpCd: currentSellTpCd,
  };
  if (await currentInitData.value?.[prcd]) {
    const rows = cloneDeep(await getPropInfosToGridRows(currentInitData.value?.[prcd], currentMetaInfos.value, prcd));
    rows?.map((row) => {
      row[pdConst.PRC_STD_ROW_ID] = row.pdPrcDtlId;
      row.sellTpCd = currentSellTpCd;
      return row;
    });
    // console.log('Rows : ', rows);
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(rows);
    view.resetCurrent();
  }
  const products = currentInitData.value?.[pdConst.RELATION_PRODUCTS];
  if (await products) {
    const services = products.filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_S);
    currentCodes.value.SV_PD_CDS = services.map(({ pdNm, pdCd }) => ({
      codeId: pdCd, codeName: pdNm,
    }));
    const view = grdMainRef.value.getView();
    const svPdCds = view.columnByName('svPdCd');
    svPdCds.options = currentCodes.value.SV_PD_CDS;
    svPdCds.labels = currentCodes.value.SV_PD_CDS?.map((item) => (item.codeName));
    svPdCds.values = currentCodes.value.SV_PD_CDS?.map((item) => (item.codeId));
    svPdCds.lookupDisplay = true;
    // console.log('svPdCds.labels : ', svPdCds.labels);
  }
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  // console.log('priceStdRef.value : ', priceStdRef.value);
  const savFields = await priceStdRef.value.getSaveFields();
  const rowItem = cloneDeep(savFields?.reduce((rtn, item) => {
    rtn[item.colNm] = item.initValue;
    return rtn;
  }, {}));
  rowItem[pdConst.PRC_STD_ROW_ID] = stringUtil.getUid('STD');
  // console.log('rowItem : ', rowItem);
  gridUtil.insertRowAndFocus(view, 0, rowItem);
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
      if (item[pdConst.PRC_STD_ROW_ID]) {
        rtn.push({ [pdConst.PRC_STD_ROW_ID]: item[pdConst.PRC_STD_ROW_ID] });
      }
      return rtn;
    }, []));
  }
}

async function getSaveData() {
  const rowValues = gridUtil.getAllRowValues(grdMainRef.value.getView());
  const rtnValues = getGridRowsToSavePdProps(
    rowValues,
    currentMetaInfos.value,
    pdConst.TBL_PD_PRC_DTL,
    [pdConst.PRC_STD_ROW_ID],
  );
  if (removeObjects.length) {
    rtnValues[pdConst.REMOVE_ROWS] = cloneDeep(removeObjects);
  }
  // console.log('WwpdcStandardMgtMPriceStd - getSaveData - rtnValues : ', rtnValues);
  return rtnValues;
}

function isModifiedProps() {
  return true;
}

function validateProps() {
  return true;
}

async function initProps() {
  const { pdCd, initData, metaInfos, codes } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  currentMetaInfos.value = metaInfos;
  currentCodes.value = pdMergeBy(currentCodes.value, codes);
  priceFieldData.value[pdConst.TBL_PD_PRC_DTL] = [];
  priceFieldData.value[pdConst.TBL_PD_PRC_DTL]
    .push({ pdExtsPrpGrpCd: pdConst.PD_PRP_GRP_CD_CMN, pdCd: currentPdCd.value });
  // console.log(`WwpdcStandardMgtMPriceStd - initProps - pdCd : ${currentPdCd.value}
  // , initData : `, currentInitData.value);
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
    [pdConst.PD_PRC_TP_CD_BASIC],
    currentCodes.value,
    readonlyFields.value,
  );
  // console.log('WwpdcStandardMgtMPriceStd - initGr id - columns : ', columns);
  // Grid 내부키 - '신규 Row 추가' 대응
  fields.push({ fieldName: pdConst.PRC_STD_ROW_ID });
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = false;
  view.editOptions.editable = true;
  await initGridRows();
}

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; resetInitData(); }, { deep: true });
</script>
