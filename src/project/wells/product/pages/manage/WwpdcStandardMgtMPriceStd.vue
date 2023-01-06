<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMPrice - 기준상품 등록/변경- 가격정보 - 기준가 등록 ( W-PD-U-0010M01 )
3. 작성자 : gs.piit141
4. 작성일 : 2023.06.30
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
    <zwpdc-prop-meta
      ref="priceStdRef"
      v-model:pd-cd="currentPdCd"
      v-model:init-data="priceFieldData"
      :pd-prc-tp-cd="pdConst.PD_PRC_TP_CD_BASIC"
      :readonly-fields="['pdCd', 'pdPrcDtlId', 'verSn']"
    />
    <kw-separator />
    <kw-action-bottom class="mb30">
      <kw-btn
        :label="$t('MSG_BTN_ADD')"
        dense
        @click="onClickAdd"
      />
    </kw-action-bottom>

    <kw-action-top>
      <kw-btn
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
import { gridUtil, getComponentType } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdcPropMeta from '~sms-common/product/pages/manage/components/ZwpdcPropMeta.vue';
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
});

const grdMainRef = ref(getComponentType('KwGrid'));

const prcd = pdConst.TBL_PD_PRC_DTL;
const priceStdRef = ref();
const currentPdCd = ref();
const currentInitData = ref(null);
const priceFieldData = ref({});
const currentMetaInfos = ref();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function initGrid(data, view) {
  const { metaInfos } = props;
  currentMetaInfos.value = metaInfos;
  const { fields, columns } = await getPdMetaToGridInfos(
    currentMetaInfos.value,
    props.codes,
    ['pdCd', 'pdPrcDtlId', 'verSn'],
  );
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  await initDataToGridRow();
}

async function initDataToGridRow() {
  if (await currentInitData.value?.[prcd]) {
    const rows = cloneDeep(await getPropInfosToGridRows(currentInitData.value?.[prcd], currentMetaInfos.value, prcd));
    console.log('Rows : ', rows);
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(rows);
    view.resetCurrent();
  }
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  // console.log('priceStdRef.value : ', priceStdRef.value);
  const savFields = await priceStdRef.value.getSaveFields();
  const rowItem = savFields?.reduce((rtn, item) => {
    rtn[item.colNm] = item.initValue;
    return rtn;
  }, {});
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
  gridUtil.deleteSelectedRows(grdMainRef.value.getView());
}

async function getSaveData() {
  const rowValues = gridUtil.getAllRowValues(grdMainRef.value.getView());
  const rtnValues = getGridRowsToSavePdProps(rowValues, currentMetaInfos.value, pdConst.TBL_PD_PRC_DTL);
  console.log('WwpdcStandardMgtMPriceStd - getSaveData - rtnValues : ', rtnValues);
  return rtnValues;
}

function isModifiedProps() {
  return true;
}

function validateProps() {
  return true;
}

async function fetchData() {
  const { pdCd, initData, metaInfos } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  currentMetaInfos.value = metaInfos;
  priceFieldData.value[pdConst.TBL_PD_PRC_DTL] = [];
  priceFieldData.value[pdConst.TBL_PD_PRC_DTL]
    .push({ pdExtsPrpGrpCd: pdConst.PD_PRP_GRP_CD_CMN, pdCd: currentPdCd.value });
  console.log(`WwpdcStandardMgtMPriceStd - fetchData - pdCd : ${currentPdCd.value}, initData : `, currentInitData.value);
}

await fetchData();

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; initDataToGridRow(); }, { deep: true });
</script>
