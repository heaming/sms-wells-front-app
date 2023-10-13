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
  <!-- 기준가(고정변수) 등록 -->
  <h3>{{ $t('MSG_TXT_PD_STD_PRC_FIX_VAL') }}</h3>
  <!-- v-model:init-data="priceFieldData" -->
  <zwpdc-prop-meta
    ref="priceStdRef"
    v-model:pd-cd="currentPdCd"
    v-model:init-data="priceFieldData"
    v-model:codes="currentCodes"
    :pd-prc-tp-cd="pdConst.PD_PRC_TP_CD_BASIC"
    :readonly-fields="readonlyFields"
    :use-rule="false"
    ignore-on-modified
  />
  <kw-action-bottom class="my20">
    <!-- 추가 -->
    <kw-btn
      v-show="!props.readonly"
      padding="12px"
      :label="$t('MSG_BTN_ADD')"
      @click="onClickAdd(true)"
    />
  </kw-action-bottom>
  <kw-action-top>
    <!-- 삭제 -->
    <kw-btn
      :label="$t('MSG_BTN_DEL')"
      grid-action
      dense
      :disable="gridRowCount === 0"
      @click="onClickRemove"
    />
    <kw-separator
      vertical
      inset
      spaced
    />
    <!-- 행추가 -->
    <kw-btn
      v-show="!props.readonly"
      :label="$t('MSG_BTN_ROW_ADD')"
      grid-action
      dense
      @click="onClickAdd(false)"
    />
  </kw-action-top>
  <kw-grid
    ref="grdMainRef"
    :visible-rows="5"
    :need-context-menu="false"
    @init="initGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal, gridUtil, stringUtil, getComponentType } from 'kw-lib';
import { cloneDeep, isEmpty, uniqBy } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdcPropMeta from '~sms-common/product/pages/manage/components/ZwpdcPropMeta.vue';
import { setGridDateFromTo, getGridRowCount, setPdGridRows, getGridRowsToSavePdProps, getPropInfosToGridRows, getPdMetaToGridInfos, pdMergeBy, isDuplicateGridRows } from '~sms-common/product/utils/pdUtil';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData, init, getSaveData, isModifiedProps, validateProps,
});

const props = defineProps({
  pdCd: { type: String, default: null }, // 상품코드
  initData: { type: Object, default: null }, // 초기데이터
  metaInfos: { type: Object, default: null }, // 가격 메타정보
  codes: { type: Object, default: null }, // 공통코드
  readonly: { type: Boolean, default: false }, // 읽기전용 여부
});

const { t } = useI18n();
const { notify } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const readonlyFields = ref(['pdCd', pdConst.PRC_DETAIL_ID, 'verSn']);
const prcd = pdConst.TBL_PD_PRC_DTL;
const priceStdRef = ref();
const currentPdCd = ref();
const currentInitData = ref(null);
const priceFieldData = ref({});
const currentMetaInfos = ref();
const removeObjects = ref([]);
const currentCodes = ref({});
const gridRowCount = ref(0);

// 데이터 초기화
async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  removeObjects.value = [];
  gridRowCount.value = 0;
  grdMainRef.value?.getView().getDataSource().clearRows();
  if (grdMainRef.value?.getView()) gridUtil.reset(grdMainRef.value.getView());
}

// 컴포넌트 초기화
async function init() {
  if (grdMainRef.value?.getView()) gridUtil.init(grdMainRef.value.getView());
}

// 저장 데이터
async function getSaveData() {
  const rowValues = gridUtil.getAllRowValues(grdMainRef.value.getView());
  const rtnValues = await getGridRowsToSavePdProps(
    rowValues,
    currentMetaInfos.value,
    pdConst.TBL_PD_PRC_DTL,
    [pdConst.PRC_STD_ROW_ID],
  );
  if (removeObjects.value.length) {
    rtnValues[pdConst.REMOVE_ROWS] = cloneDeep(removeObjects.value);
  }
  // console.log('WwpdcStandardMgtMPriceStd - getSaveData - rtnValues : ', rtnValues);
  return rtnValues;
}

// 수정여부
async function isModifiedProps() {
  return gridUtil.isModified(grdMainRef.value.getView());
}

// 검증
async function validateProps() {
  const view = grdMainRef.value.getView();
  const rtn = gridUtil.validate(view, {
    isChangedOnly: false,
  });
  if (rtn && !gridRowCount.value) {
    // {기준가} 항목을 추가하세요.
    notify(t('MSG_ALT_ADD_SOME_ITEM', [t('MSG_TXT_STD_PRICE')]));
    return false;
  }

  // 중복체크
  const outKeys = ['stdRowId', 'rowState', 'dataRow', 'verSn', 'pdPrcDtlId'];
  if (isDuplicateGridRows(view, null, outKeys)) {
    // 체크된 기준가 항목이 중복되었습니다.
    notify(t('MSG_ALT_CHK_SOME_ITEM_DUP', [t('MSG_TXT_STD_PRICE')]));
    return;
  }
  return rtn;
}

// 그리드 초기 데이터 설정
async function initGridRows() {
  removeObjects.value = [];
  const view = grdMainRef.value?.getView();
  if (isEmpty(view)) {
    return;
  }
  priceFieldData.value[prcd] = {
    pdExtsPrpGrpCd: 'PRC',
    // 통화명
    crncyDvCd: currentInitData.value[pdConst.TBL_PD_BAS]?.crncyDvCd,
    // 판매유형
    sellTpCd: currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd,
  };
  const currentSellTpCd = currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd;
  priceFieldData.value[pdConst.TBL_PD_BAS] = {
    // 판매유형
    sellTpCd: currentSellTpCd,
  };
  if (await currentInitData.value?.[prcd]) {
    const rows = cloneDeep(await getPropInfosToGridRows(
      currentInitData.value?.[prcd],
      currentMetaInfos.value,
      prcd,
      [pdConst.PRC_STD_ROW_ID, pdConst.PRC_DETAIL_ID],
    ));
    rows?.map((row) => {
      row[pdConst.PRC_STD_ROW_ID] = row[pdConst.PRC_STD_ROW_ID] ?? row.pdPrcDtlId;
      row.sellTpCd = currentSellTpCd;
      return row;
    });
    // console.log('Rows : ', rows);
    await setPdGridRows(view, rows, pdConst.PRC_STD_ROW_ID, [pdConst.PRC_STD_ROW_ID, pdConst.PRC_DETAIL_ID]);
    // console.log('WwpdcStandardMgtMPriceStd - initGridRows - rows : ', rows);
  }

  const products = currentInitData.value?.[pdConst.RELATION_PRODUCTS];
  if (await products) {
    const relServices = products
      ?.filter((svcItem) => svcItem[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_S)?.map(({ pdNm, pdCd }) => ({
        codeId: pdCd, codeName: pdNm,
      }));
    const services = uniqBy(relServices, 'codeId');
    if (services && services.length) {
      currentCodes.value.svPdCd = services;
    }

    // console.log('currentCodes.value.svPdCd : ', currentCodes.value.svPdCd);
    const nameFields = await priceStdRef.value.getNameFields();
    if (nameFields.svPdCd) {
      nameFields.svPdCd.codes = currentCodes.value.svPdCd;
    }
    const svPdCds = view.columnByName('svPdCd');
    svPdCds.options = currentCodes.value.svPdCd;
    svPdCds.labels = currentCodes.value.svPdCd?.map((item) => (item.codeName));
    svPdCds.values = currentCodes.value.svPdCd?.map((item) => (item.codeId));
    svPdCds.lookupDisplay = true;
    // console.log('svPdCds.labels : ', svPdCds.labels);
  }
  gridRowCount.value = getGridRowCount(view);
}

// 채널 추가
async function onClickAdd(isForm) {
  const view = grdMainRef.value.getView();
  // console.log('priceStdRef.value : ', priceStdRef.value);
  const savFields = await priceStdRef.value.getSaveFields();
  const rowItem = isForm ? cloneDeep(savFields?.reduce((rtn, item) => {
    rtn[item.colNm] = item.initValue;
    return rtn;
  }, {})) : {
    // 통화명
    crncyDvCd: currentInitData.value[pdConst.TBL_PD_BAS]?.crncyDvCd,
    // 판매유형
    sellTpCd: currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd,
  };
  rowItem[pdConst.PRC_STD_ROW_ID] = stringUtil.getUid('STD');
  rowItem[pdConst.PRC_DETAIL_ID] = '';
  // console.log('rowItem : ', rowItem);
  await gridUtil.insertRowAndFocus(view, 0, rowItem);
  gridRowCount.value = getGridRowCount(view);
}

// 삭제
async function onClickRemove() {
  const view = grdMainRef.value.getView();
  const deletedRowValues = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRowValues && deletedRowValues.length) {
    removeObjects.value.push(...deletedRowValues.reduce((rtn, item) => {
      if (item[pdConst.PRC_STD_ROW_ID]) {
        rtn.push({ [pdConst.PRC_STD_ROW_ID]: item[pdConst.PRC_STD_ROW_ID] });
      }
      return rtn;
    }, []));
  }
  gridRowCount.value = getGridRowCount(view);
}

// Props 데이터 설정
async function initProps() {
  const { pdCd, initData, metaInfos, codes } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  currentMetaInfos.value = metaInfos;
  currentCodes.value = cloneDeep(pdMergeBy(currentCodes.value, codes));
  priceFieldData.value[pdConst.TBL_PD_PRC_DTL] = [];
  priceFieldData.value[pdConst.TBL_PD_PRC_DTL]
    .push({ pdExtsPrpGrpCd: pdConst.PD_PRP_GRP_CD_CMN, pdCd: currentPdCd.value });
  // console.log(`WwpdcStandardMgtMPriceStd - initProps - pdCd : ${currentPdCd.value}
  // , initData : `, currentInitData.value);
}

await initProps();

// 리얼그리드 표시 오류 대응 임시코드
onActivated(async () => {
  await initGridRows();
});

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => {
  currentInitData.value = val;
  initGridRows();
}, { deep: true });

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
  columns.map((item) => {
    if (item.fieldName === 'svPdCd') {
      item.editor = 'list';
      item.options = currentCodes.value.svPdCd;
      item.styleName = 'text-left';
      item.width = '300';
    }
    return item;
  });
  // console.log('WwpdcStandardMgtMPriceStd - initGr id - columns : ', columns);
  // Grid 내부키 - '신규 Row 추가' 대응
  fields.push({ fieldName: pdConst.PRC_STD_ROW_ID });
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;

  view.setFixedOptions({ colCount: 5 });

  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    // 날짜값 조정
    await setGridDateFromTo(view, grid, itemIndex, fieldIndex, 'vlStrtDtm', 'vlEndDtm');
  };

  view.onCellClicked = async (g, { dataRow }) => {
    if (dataRow >= 0) {
      const prcdValues = await getGridRowsToSavePdProps(
        [gridUtil.getRowValue(g, dataRow)],
        currentMetaInfos.value,
        prcd,
        [],
        [pdConst.PRC_DETAIL_ID, pdConst.PRC_STD_ROW_ID],
      );
      priceFieldData.value[prcd] = prcdValues[prcd]?.[0];
    }
  };

  await initGridRows();
  await init();
}
</script>
