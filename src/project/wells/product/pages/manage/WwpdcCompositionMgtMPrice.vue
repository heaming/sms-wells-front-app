<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcCompositionMgtMPrice - 복합상품 등록/변경 - 가격정보
                ( Z-PD-U-0020M03 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.04.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 복합상품 등록/변경 - 가격정보 프로그램
****************************************************************************************************
--->
<template>
  <!-- 판매채널 -->
  <h3>{{ $t('MSG_TXT_SEL_CHNL') }}</h3>
  <kw-form
    ref="frmChannelRef"
    :cols="2"
    dense
    ignore-on-modified
  >
    <kw-form-row>
      <!-- 판매채널 -->
      <kw-form-item
        :label="$t('MSG_TXT_SEL_CHNL')"
        required
      >
        <kw-select
          ref="usedChannelRef"
          v-model="addChannelId"
          first-option="select"
          :options="usedChannelCds"
          rules="required"
          :label="$t('MSG_TXT_SEL_CHNL')"
        />
      </kw-form-item>
      <!-- 판매채널 -->
      <kw-form-item
        :label="$t('MSG_TXT_ACEPT_PERIOD')"
        required
      >
        <kw-date-range-picker
          v-model:from="vlStrtDtm"
          v-model:to="vlEndDtm"
          :label="$t('MSG_TXT_ACEPT_PERIOD')"
        />
      </kw-form-item>
    </kw-form-row>
  </kw-form>
  <kw-action-bottom class="my20">
    <kw-btn
      padding="12px"
      :label="$t('MSG_BTN_ADD')"
      @click="onClickAdd"
    />
  </kw-action-bottom>
  <kw-action-top class="mt30">
    <!-- 삭제 -->
    <kw-btn
      grid-action
      dense
      :label="$t('MSG_BTN_DEL')"
      :disable="gridRowCount === 0"
      @click="onClickRemove"
    />
    <kw-separator
      vertical
      inset
      spaced
    />
    <!-- 복사 -->
    <kw-btn
      :label="$t('MSG_BTN_CNTN_COPY')"
      grid-action
      dense
      :disable="gridRowCount === 0"
      @click="onClickRowCopy"
    />
  </kw-action-top>
  <!-- 가격 -->
  <kw-grid
    ref="grdMainRef"
    :need-context-menu="false"
    @init="initGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useGlobal, getComponentType, gridUtil, stringUtil, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty, omit, isEqual } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { getGridRowCount, setGridDateFromTo, getGridRowsToSavePdProps, getPdMetaToCodeNames, getPdMetaToGridInfos, getPropInfosToGridRows, pdMergeBy, setPdGridRows } from '~sms-common/product/utils/pdUtil';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData, init, getSaveData, isModifiedProps, validateProps,
});

const props = defineProps({
  pdCd: { type: String, default: null }, // 상품코드
  initData: { type: Object, default: null }, // 초기데이터
  codes: { type: Object, default: null }, // 공통코드
  readonly: { type: Boolean, default: false }, // 읽기전용 여부
});

const { t } = useI18n();
const dataService = useDataService();
const { modal, notify } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const defaultFields = ref(['verSn', pdConst.PRC_STD_ROW_ID, pdConst.PRC_FNL_ROW_ID,
  pdConst.PRC_DETAIL_ID, pdConst.PRC_DETAIL_FNL_ID, 'basePdTempSaveYn', 'basePdClsfNm', 'basePdNm', 'basePdCd', 'baseSellTpCd']);
const readonlyFields = ref(['pdCd', pdConst.PRC_DETAIL_ID, 'verSn', 'crncyDvCd']);
const prcd = pdConst.TBL_PD_PRC_DTL;
const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;
const currentPdCd = ref();
const currentInitData = ref(null);
const metaInfos = ref();
const removeObjects = ref([]);
const currentCodes = ref({});
const gridRowCount = ref(0);
const usedChannelCds = ref([]);
const addChannelId = ref();
const usedChannelRef = ref();
const vlStrtDtm = ref(now.format('YYYYMMDD'));
const vlEndDtm = ref('99991231');

const searchParams = ref({
  searchType: pdConst.PD_SEARCH_CODE,
  searchValue: null,
  selectType: pdConst.PD_SEARCH_SINGLE,
});

// 데이터 초기화
async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  usedChannelCds.value = [];
  addChannelId.value = '';
  vlStrtDtm.value = now.format('YYYYMMDD');
  vlEndDtm.value = '99991231';
  removeObjects.value = [];
  gridRowCount.value = 0;
  const view = grdMainRef.value?.getView();
  if (view) gridUtil.reset(view);
}

// 컴포넌트 초기화
async function init() {
  const view = grdMainRef.value?.getView();
  if (view) gridUtil.init(view);
}

// 저장 데이터
async function getSaveData() {
// 미수정시 초기값 그대로 반환.
  if (!(await isModifiedProps())) {
    return {
      [prcd]: currentInitData.value[prcd],
      [prcfd]: currentInitData.value[prcfd],
    };
  }

  const view = grdMainRef.value?.getView();
  const rowValues = gridUtil.getAllRowValues(view);
  const stdValues = await getGridRowsToSavePdProps(
    rowValues,
    metaInfos.value,
    prcd,
    [pdConst.PRC_STD_ROW_ID, pdConst.PRC_DETAIL_ID, 'basePdCd', 'vlStrtDtm', 'vlEndDtm'],
  );
  const fnlValues = await getGridRowsToSavePdProps(
    rowValues,
    metaInfos.value,
    prcfd,
    [...defaultFields.value, 'basePdCd', 'vlStrtDtm', 'vlEndDtm'],
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

// 수정 여부
async function isModifiedProps() {
  return gridUtil.isModified(grdMainRef.value.getView());
}

// 검증
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

// 데이터 초기화
async function resetInitData() {
  Object.assign(removeObjects.value, []);
  await setChannels();
  await initGridRows();
}

// 판매채널 선택
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
    usedChannelCds.value = props.codes?.SELL_CHNL_DTL_CD?.filter((item) => channels.indexOf(item.codeId) > -1);
  }

  const view = grdMainRef.value?.getView();
  if (view) {
    const sellChnlCd = view.columnByName('sellChnlCd');
    if (sellChnlCd) {
      sellChnlCd.options = currentCodes.value.SELL_CHNL_DTL_CD;
      sellChnlCd.labels = currentCodes.value.SELL_CHNL_DTL_CD?.map((item) => (item.codeName));
      sellChnlCd.values = currentCodes.value.SELL_CHNL_DTL_CD?.map((item) => (item.codeId));
      sellChnlCd.lookupDisplay = true;
    }
  }
}

// 행 추가
async function onClickAdd() {
  if (!(await usedChannelRef.value.validate())) {
    return;
  }

  const view = grdMainRef.value?.getView();
  const rowValues = gridUtil.getAllRowValues(view);
  if (rowValues.find((item) => item.sellChnlCd === addChannelId.value)?.basePdCd) {
    notify(t('MSG_ALT_ALREADY_RGST', [t('MSG_TXT_SEL_CHNL')]));
    return;
  }

  const products = currentInitData.value?.[pdConst.RELATION_PRODUCTS];
  if (await products) {
    const rows = cloneDeep(products
      ?.filter((svcItem) => svcItem[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_C_TO_P));
    rows.forEach((item) => {
      item.basePdTempSaveYn = item.tempSaveYn;
      item.basePdClsfNm = item.pdClsfNm;
      item.basePdNm = item.pdNm;
      item.basePdCd = item.pdCd;
      item.baseSellTpCd = item.sellTpCd;
      item.sellChnlCd = addChannelId.value;
      // item.vlStrtDtm = item.vlStrtDtm ? item.vlStrtDtm.substr(0, 8) : vlStrtDtm.value;
      // item.vlEndDtm = item.vlEndDtm ? item.vlEndDtm.substr(0, 8) : vlEndDtm.value;
      item.vlStrtDtm = vlStrtDtm.value;
      item.vlEndDtm = vlEndDtm.value;
      item.pdCd = '';
      item.verSn = '';
      item.pdPrcId = '';
      item[pdConst.PRC_STD_ROW_ID] = stringUtil.getUid('STD');
      item[pdConst.PRC_FNL_ROW_ID] = stringUtil.getUid('FNL');
      item[pdConst.PRC_DETAIL_ID] = '';
      item[pdConst.PRC_DETAIL_FNL_ID] = '';
    });
    if (rows && rows.length) {
      const data = view.getDataSource();
      await data.insertRows(0, rows);
      await gridUtil.focusCellInput(view, 0);
      gridRowCount.value = getGridRowCount(view);
      return;
    }
  }
  // 연결된 상품이 없습니다.
  notify(t('MSG_ALT_NO_LINK_PDS'));
}

// 행 복사
async function onClickRowCopy() {
  const view = grdMainRef.value.getView();
  const checkedRows = cloneDeep(gridUtil.getCheckedRowValues(view));
  if (checkedRows.length < 1) {
    // 데이터를 선택해주세요.
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  if (checkedRows.length > 1) {
    // 한 개만 선택해주세요.
    notify(t('MSG_ALT_SELT_ONE_ITEM'));
    return;
  }
  checkedRows.forEach((rowItem) => {
    rowItem[pdConst.PRC_STD_ROW_ID] = stringUtil.getUid('STD');
    rowItem[pdConst.PRC_FNL_ROW_ID] = stringUtil.getUid('FNL');
    rowItem[pdConst.PRC_DETAIL_ID] = '';
    rowItem[pdConst.PRC_DETAIL_FNL_ID] = '';
    rowItem.vlStrtDtm = '';
    rowItem.vlEndDtm = '';
  });
  await gridUtil.insertRowAndFocus(view, view.getCheckedRows()[0] + 1, checkedRows[0]);
  gridRowCount.value = getGridRowCount(view);
  // await data.insertRows(view.getSelectedRows().findLast() + 1, checkedRows);
}

// 기준상품 검색 팝업 호출
async function onClickStandardSchPopup(pdCd, rowId) {
  searchParams.value.searchValue = pdCd;
  const rtn = await modal({
    component: 'ZwpdcStandardPriceListP',
    componentProps: searchParams.value,
  });
  await updatePriceRow(rtn, rowId);
}

// 검색한 기준상품의 가격값 수정
async function updatePriceRow(rtn, rowId) {
  const view = grdMainRef.value?.getView();
  if (rtn.result && rtn.payload && rtn.payload.length) {
    const row = Array.isArray(rtn.payload) ? rtn.payload[0] : rtn.payload;
    const data = view.getDataSource();
    data.updateRow(rowId, omit(
      row,
      [...defaultFields.value, 'sellChnlCd', 'sellChnlCd', 'vlStrtDtm', 'vlEndDtm', 'pdCd', 'verSn', 'pdPrcId'],
    ));
  }
}

// 행 삭제
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

// 그리드 초기 데이터 설정
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
      const stdRow = stdRows?.find((item) => (row[pdConst.PRC_STD_ROW_ID]
                                                && item[pdConst.PRC_STD_ROW_ID] === row[pdConst.PRC_STD_ROW_ID])
                                              || (row.pdPrcDtlId && item.pdPrcDtlId === row.pdPrcDtlId));
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

// 데이터 불러오기
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

// Props 데이터 설정
async function initProps() {
  const { pdCd, initData, codes } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = cloneDeep(initData);
  currentCodes.value = cloneDeep(pdMergeBy(currentCodes.value, codes));
  // console.log(`WwpdcCompositionMgtMPriceStd - initProps - pdCd : ${currentPdCd.value}
  // , initData : `, currentInitData.value);
  await setChannels();
  await fetchData();
}

await initProps();

// 리얼그리드 표시 오류 대응 임시코드
onActivated(async () => {
  await initGridRows();
});

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => {
  if (!isEqual(currentInitData.value, val)) {
    currentInitData.value = cloneDeep(val);
    resetInitData();
  }
}, { deep: true });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
// const criteriaRule = 'values["sellChnlCd"] + value';
async function initGrid(data, view) {
  const pdColumns = [
    // 상태
    { fieldName: 'basePdTempSaveYn', header: t('MSG_TXT_STT'), width: '85', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD, editable: false },
    // 기준상품 분류
    { fieldName: 'basePdClsfNm', header: t('MSG_TXT_PD_STD_TYPE'), width: '171', editable: false },
    // 기준상품명
    { fieldName: 'basePdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '176', editable: false },
    // 기준상품코드
    { fieldName: 'basePdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '115', styleName: 'text-center', editable: false },
    // 판매유형
    { fieldName: 'baseSellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '87', styleName: 'text-center', options: props.codes?.SELL_TP_CD, editable: false },
    // 판매채널
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_CHNL'), width: '127', styleName: 'rg-button-link text-center', editable: false, options: currentCodes.value.SELL_CHNL_DTL_CD, renderer: { type: 'button' } },
    // 적용시작일자
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRTDT'), width: '127', styleName: 'text-center', editor: { type: 'date' }, rules: 'required' },
    // 적용종료일자
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_ENDDT'), width: '127', styleName: 'text-center', editor: { type: 'date' }, rules: 'required' },
    // 서비스명
    { fieldName: 'priceSchBtn',
      header: t('MSG_TXT_PRICE'),
      width: '40',
      editable: false,
      styleName: 'text-left rg-button-icon--search',
      editor: { maxLength: 10 },
      button: 'action',
    },
  ];
  const pdFields = pdColumns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  const { fields, columns } = await getPdMetaToGridInfos(
    metaInfos.value,
    [pdConst.PD_PRC_TP_CD_COMPOSITION],
    currentCodes.value,
    readonlyFields.value,
    [],
    ['pdPrcDtlId', 'pdPrcFnlDtlId'],
    ['basePdCd', 'sellChnlCd', 'sellTpCd', 'vlStrtDtm', 'vlEndDtm'],
  );
  // console.log('WwpdcCompositionMgtMPriceStd - initGr id - columns : ', columns);
  // Grid 내부키 - '신규 Row 추가' 대응
  fields.push({ fieldName: pdConst.PRC_STD_ROW_ID });
  fields.push({ fieldName: pdConst.PRC_FNL_ROW_ID });

  pdColumns.push(...columns);
  pdFields.push(...fields);

  data.setFields(pdFields);
  view.setColumns(pdColumns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;

  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    // 날짜값 조정
    await setGridDateFromTo(view, grid, itemIndex, fieldIndex, 'vlStrtDtm', 'vlEndDtm');
  };

  view.onCellButtonClicked = async (grid, { column, dataRow }) => {
    if (column === 'priceSchBtn') {
      const { basePdCd } = gridUtil.getRowValue(grid, dataRow);
      await onClickStandardSchPopup(basePdCd, dataRow);
    }
  };

  view.onCellItemClicked = async (grid, gridInfo) => {
    if (gridInfo.column === 'sellChnlCd') {
      const sellChnlCd = grid.getValue(gridInfo.dataRow, 'sellChnlCd');
      grid.checkRows(gridUtil.getAllRowValues(view)
        ?.filter((item) => item.sellChnlCd === sellChnlCd)
        ?.map(({ dataRow }) => (dataRow)), !grid.isCheckedRow(gridInfo.dataRow), false, false);
    }
  };

  await resetInitData();
  await init();
}

</script>
