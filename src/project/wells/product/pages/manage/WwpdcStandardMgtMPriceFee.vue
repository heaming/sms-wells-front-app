<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMPrice - 기준상품 등록/변경 - 가격정보 - 수수료 등록 ( W-PD-U-0010M01 )
3. 작성자 : gs.piit141
4. 작성일 : 2023.06.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 가격정보 - 수수료 등록 프로그램
****************************************************************************************************
--->
<template>
  <div class="result-area">
    <!-- 법인별 현황 -->
    <h3>{{ $t('MSG_TXT_PD_ST_BY_CORP') }}</h3>
    <kw-action-top>
      <template #left>
        <!-- (단위:원) -->
        <span>({{ $t('MSG_TXT_UNIT') }}:{{ $t('MSG_TXT_CUR_WON') }})</span>
      </template>
      <kw-btn
        :label="$t('MSG_BTN_DEL')"
        secondary
        dense
        @click="onClickRemove"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      :visible-rows="10"
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
});

const grdMainRef = ref(getComponentType('KwGrid'));

const prcd = pdConst.TBL_PD_PRC_DTL;
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
