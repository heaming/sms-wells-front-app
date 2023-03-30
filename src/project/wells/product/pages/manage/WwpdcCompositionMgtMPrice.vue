<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcCompositionMgtMPrice - 기준상품 등록/변경 - 가격정보 ( W-PD-U-0010M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 가격정보 프로그램
****************************************************************************************************
--->
<template>
  <div class="normal-area">
    <!-- 가격 -->
    <h3>{{ $t('MSG_TXT_PRICE') }}</h3>
    <zwpdc-prop-meta
      ref="pricePrcRef"
      v-model:pd-cd="currentPdCd"
      v-model:init-data="priceFieldData"
      v-model:codes="currentCodes"
      :pd-prc-tp-cd="pdConst.PD_PRC_TP_CD_COMPOSITION"
      pd-grp-cd="PRC"
      :readonly-fields="readonlyFields"
      :use-rule="false"
      ignore-on-modified
    />
    <kw-action-top class="mt30">
      <kw-btn
        v-show="!props.readonly"
        :label="$t('MSG_BTN_ROW_ADD')"
        dense
        @click="onClickAdd"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        :label="$t('MSG_BTN_DEL')"
        dense
        :disable="gridRowCount === 0"
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
import { codeUtil, useGlobal, getComponentType, gridUtil, stringUtil, useDataService } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdcPropMeta from '~sms-common/product/pages/manage/components/ZwpdcPropMeta.vue';
import { getGridRowCount, setGridDateFromTo, getGridRowsToSavePdProps, getPdMetaToCodeNames, getPdMetaToGridInfos, getPropInfosToGridRows, pdMergeBy, setPdGridRows } from '~sms-common/product/utils/pdUtil';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData, init, getSaveData, isModifiedProps, validateProps,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  codes: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
});

const { t } = useI18n();
const dataService = useDataService();
const { notify } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const defaultFields = ref(['verSn', pdConst.PRC_STD_ROW_ID, pdConst.PRC_FNL_ROW_ID,
  pdConst.PRC_DETAIL_ID, pdConst.PRC_DETAIL_FNL_ID]);
const readonlyFields = ref(['pdCd', pdConst.PRC_DETAIL_ID, 'verSn', 'crncyDvCd']);
const prcd = pdConst.TBL_PD_PRC_DTL;
const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;
const pricePrcRef = ref();
const currentPdCd = ref();
const currentInitData = ref(null);
const priceFieldData = ref({});
const metaInfos = ref();
const removeObjects = ref([]);
const currentCodes = ref({});
const gridRowCount = ref(0);

async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  removeObjects.value = [];
  gridRowCount.value = 0;
  const view = grdMainRef.value?.getView();
  if (view) gridUtil.reset(view);
}

async function init() {
  const view = grdMainRef.value?.getView();
  if (view) gridUtil.init(view);
}

async function getSaveData() {
  const view = grdMainRef.value?.getView();
  const rowValues = gridUtil.getAllRowValues(view);
  const stdValues = await getGridRowsToSavePdProps(
    rowValues,
    metaInfos.value,
    prcd,
    [pdConst.PRC_STD_ROW_ID, pdConst.PRC_DETAIL_ID],
  );
  const fnlValues = await getGridRowsToSavePdProps(
    rowValues,
    metaInfos.value,
    prcfd,
    defaultFields.value,
  );
  // console.log('WwpdcCompositionMgtMPriceStd - getSaveData - stdValues : ', stdValues);
  // console.log('WwpdcCompositionMgtMPriceStd - getSaveData - fnlValues : ', fnlValues);
  const rtnValues = pdMergeBy(stdValues, fnlValues);
  // console.log('WwpdcCompositionMgtMPriceStd - getSaveData - rtnValues : ', rtnValues);
  if (removeObjects.value.length) {
    rtnValues[pdConst.REMOVE_ROWS] = cloneDeep(removeObjects.value);
  }
  // console.log('WwpdcCompositionMgtMPriceStd - getSaveData - rtnValues : ', rtnValues);
  return rtnValues;
}

async function isModifiedProps() {
  return gridUtil.isModified(grdMainRef.value.getView());
}

async function validateProps() {
  const rtn = gridUtil.validate(grdMainRef.value.getView(), {
    isChangedOnly: false,
  });
  if (rtn && !gridRowCount.value) {
    notify(t('MSG_ALT_ADD_SOME_ITEM', [t('MSG_TXT_PRICE_INFO')]));
    return false;
  }
  return rtn;
}

async function resetInitData() {
  Object.assign(removeObjects.value, []);
  priceFieldData.value[prcd] = {
    pdExtsPrpGrpCd: 'PRC',
    // 통화명
    crncyDvCd: currentInitData.value[pdConst.TBL_PD_BAS]?.crncyDvCd,
  };
  await setChannels();
  await initGridRows();
}

async function setChannels() {
  // console.log('WwpdcCompositionMgtMPrice - setChannels - currentInitData.value: ', currentInitData.value);
  const channels = currentInitData.value?.[pdConst.TBL_PD_DTL]
    ?.reduce((rtn, item) => {
      if (item.avlChnlId && item.pdDtlDvCd === pdConst.PD_DTL_DV_CD_CHANNEL) {
        rtn = item.avlChnlId.split(',').map((chnnelCd) => chnnelCd?.trim());
      }
      return rtn;
    }, []);
  // console.log('channels : ', channels);
  if (channels) {
    currentCodes.value.SELL_CHNL_DTL_CD = props.codes.SELL_CHNL_DTL_CD
      ?.filter((item) => channels.includes(item.codeId));
    const nameFields = await pricePrcRef.value?.getNameFields();
    // console.log(nameFields);
    if (nameFields && nameFields.sellChnlCd) {
      nameFields.sellChnlCd.codes = currentCodes.value.SELL_CHNL_DTL_CD;
    }
  }

  const view = grdMainRef.value?.getView();
  if (view) {
    const svPdCds = view.columnByName('sellChnlCd');
    if (svPdCds) {
      svPdCds.options = currentCodes.value.SELL_CHNL_DTL_CD;
      svPdCds.labels = currentCodes.value.SELL_CHNL_DTL_CD?.map((item) => (item.codeName));
      svPdCds.values = currentCodes.value.SELL_CHNL_DTL_CD?.map((item) => (item.codeId));
      svPdCds.lookupDisplay = true;
    }
  }
}

async function initGridRows() {
  // console.log('WwpdcCompositionMgtMPrice - initGridRows - currentInitData.value: ', currentInitData.value);
  const view = grdMainRef.value?.getView();
  if (!view) {
    return;
  }
  // console.log('currentInitData.value[prcfd] : ', currentInitData.value[prcfd]);
  if (currentInitData.value[prcd] && currentInitData.value[prcfd]) {
    // 기준가 정보
    const stdRows = await getPropInfosToGridRows(
      currentInitData.value[prcd],
      metaInfos.value,
      prcd,
      [pdConst.PRC_STD_ROW_ID, pdConst.PRC_DETAIL_ID],
    );
    // 선택변수/최종가
    const rows = cloneDeep(await getPropInfosToGridRows(
      currentInitData.value[prcfd],
      metaInfos.value,
      prcfd,
      defaultFields.value,
    ));
    rows?.forEach((row) => {
      const stdRow = stdRows?.find((item) => item.pdPrcDtlId === row.pdPrcDtlId);
      row = pdMergeBy(row, stdRow);
      row[pdConst.PRC_STD_ROW_ID] = row[pdConst.PRC_STD_ROW_ID] ?? row.pdPrcDtlId;
      row[pdConst.PRC_FNL_ROW_ID] = row[pdConst.PRC_FNL_ROW_ID] ?? row.pdPrcFnlDtlId;
    });
    // console.log('WwpdcCompositionMgtMPrice - initGridRows - rows : ', rows);
    await setPdGridRows(view, rows, pdConst.PRC_FNL_ROW_ID, defaultFields.value, true);
  } else {
    view.getDataSource().clearRows();
  }
  gridRowCount.value = getGridRowCount(view);
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  // console.log('priceStdRef.value : ', priceStdRef.value);
  const savFields = await pricePrcRef.value.getSaveFields();
  // console.log('savFields : ', savFields);
  const rowItem = cloneDeep(savFields?.reduce((rtn, item) => {
    rtn[item.colNm] = item.initValue;
    return rtn;
  }, {}));
  rowItem[pdConst.PRC_STD_ROW_ID] = stringUtil.getUid('STD');
  rowItem[pdConst.PRC_FNL_ROW_ID] = stringUtil.getUid('FNL');
  // console.log('rowItem : ', rowItem);
  gridUtil.insertRowAndFocus(view, 0, rowItem);
  gridRowCount.value = getGridRowCount(view);
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

async function fetchData() {
  if (isEmpty(metaInfos.value)) {
  // console.log('WwpdcCompositionMgtMPrice - fetchData - currentCodes.value 1: ', currentCodes.value);
    const res = await dataService.get('/sms/common/product/meta-properties', { params: { pdPrcTpCd: pdConst.PD_PRC_TP_CD_COMPOSITION } });
    if (isEmpty(res.data)) {
      return;
    }
    metaInfos.value = res.data;
    // console.log('WwpdcCompositionMgtMPrice - fetchData - metaInfos.value : ', metaInfos.value);
    const codeNames = await getPdMetaToCodeNames(metaInfos.value, currentCodes.value);
    if (!isEmpty(codeNames)) {
    // console.log('WwpdcCompositionMgtMPrice - fetchData - codeNames : ', codeNames);
      try {
        currentCodes.value = pdMergeBy(currentCodes.value, await codeUtil.getMultiCodes(...codeNames));
      } catch (e) {
        console.log(e);
      // 공통코드 없는 에러 때문에 임시 - 추후 Try catch 삭제
      }
    }
  }
}

async function initProps() {
  const { pdCd, initData, codes } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = cloneDeep(initData);
  currentCodes.value = cloneDeep(pdMergeBy(currentCodes.value, codes));
  priceFieldData.value[pdConst.TBL_PD_PRC_DTL] = [];
  priceFieldData.value[pdConst.TBL_PD_PRC_DTL]
    .push({ pdExtsPrpGrpCd: pdConst.PD_PRP_GRP_CD_CMN, pdCd: currentPdCd.value });
  // console.log(`WwpdcCompositionMgtMPriceStd - initProps - pdCd : ${currentPdCd.value}
  // , initData : `, currentInitData.value);
  await setChannels();
  await fetchData();
}

await initProps();

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = cloneDeep(val); resetInitData(); }, { deep: true });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrid(data, view) {
  const { fields, columns } = await getPdMetaToGridInfos(
    metaInfos.value,
    [pdConst.PD_PRC_TP_CD_COMPOSITION],
    currentCodes.value,
    readonlyFields.value,
  );
  // console.log('WwpdcCompositionMgtMPriceStd - initGr id - columns : ', columns);
  // Grid 내부키 - '신규 Row 추가' 대응
  fields.push({ fieldName: pdConst.PRC_STD_ROW_ID });
  fields.push({ fieldName: pdConst.PRC_FNL_ROW_ID });
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = false;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;

  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    // 날짜값 조정
    await setGridDateFromTo(view, grid, itemIndex, fieldIndex, 'vlStrtDtm', 'vlEndDtm');
  };

  view.onCellClicked = async (g, { dataRow }) => {
    // console.log('clicekd : ', dataRow);
    if (dataRow >= 0) {
      const prcdValues = await getGridRowsToSavePdProps(
        [gridUtil.getRowValue(g, dataRow)],
        metaInfos.value,
        prcd,
        [],
        defaultFields.value,
      );
      const prcfdValues = await getGridRowsToSavePdProps(
        [gridUtil.getRowValue(g, dataRow)],
        metaInfos.value,
        prcfd,
        [],
        defaultFields.value,
      );
      priceFieldData.value[prcd] = prcdValues[prcd]?.[0];
      priceFieldData.value[prcfd] = prcfdValues[prcfd]?.[0];
    }
  };
  await resetInitData();
  await init();
}

</script>
