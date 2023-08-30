<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMPriceCopy - 기준상품 등록/변경 - 가격정보 - 일괄복사
                ( W-PD-U-0010M09 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.08.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 가격정보 - 일괄복사 등록 프로그램
****************************************************************************************************
--->
<template>
  <!-- 일괄복사 -->
  <h3>{{ $t('MSG_TXT_BLK_COPY') }}</h3>
  <kw-action-top>
    <kw-btn
      v-show="!props.readonly"
      :label="$t('MSG_BTN_DEL')"
      grid-action
      secondary
      dense
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
      secondary
      dense
      :disable="gridRowCount === 0"
      @click="onClickRowCopy"
    />
    <!-- 반영 -->
    <kw-btn
      :label="$t('MSG_BTN_REFLECTION')"
      secondary
      dense
      :disable="gridRowCount === 0"
      @click="onClickApply"
    />
  </kw-action-top>
  <ul class="filter-box justify-between mb12">
    <li class="filter-box__item">
      <p class="filter-box__item-label">
        <!-- 판매채널 -->
        {{ $t('MSG_TXT_SEL_CHNL') }}
      </p>
      <kw-select
        ref="copyChannelRef"
        v-model="copyChannel"
        dense
        first-option="all"
        class="w250"
        :options="usedChannelCds"
        rules="required"
        @update:model-value="onUpdateSellChannel"
      />
      <kw-select
        v-model="applyStartDate"
        dense
        first-option="all"
        class="w250"
        :options="channelApplyStartDates"
      />
      <kw-btn
        :disable="!copyChannel"
        :label="$t('MSG_BTN_GET')"
        dense
        @click="onClickGet"
      />
    </li>
  </ul>
  <kw-grid
    ref="grdMainRef"
    :visible-rows="10"
    :need-context-menu="false"
    ignore-on-modified
    @init="initGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { gridUtil, useDataService, getComponentType, useGlobal, stringUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { pdMergeBy, resetVisibleGridColumns, getGridRowCount, getPropInfosToGridRows, getGridRowsToSavePdProps, getPdMetaToGridInfos } from '~sms-common/product/utils/pdUtil';

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

const emits = defineEmits([
  'applyData',
]);

const dataService = useDataService();
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
const feeVariables = ref([]);
const gridRowCount = ref(0);
const currentSellTpCd = ref(null);
const selectionVariables = ref([]);
const copyChannelRef = ref();
const copyChannel = ref();
const usedChannelCds = ref([]);
const applyStartDate = ref();
const channelApplyStartDates = ref([]);
const isModified = ref(false);

async function resetData() {
  isModified.value = false;
  currentPdCd.value = '';
  currentInitData.value = {};
  gridRowCount.value = 0;
  copyChannel.value = null;
  usedChannelCds.value = [];
  applyStartDate.value = null;
  channelApplyStartDates.value = [];
  grdMainRef.value?.getView().getDataSource().clearRows();
  if (grdMainRef.value?.getView()) gridUtil.reset(grdMainRef.value.getView());
}

async function init() {
  if (grdMainRef.value?.getView()) gridUtil.init(grdMainRef.value.getView());
}

async function getSaveData() {
  const view = grdMainRef.value.getView();
  const outKeys = view.getColumns().filter((item) => !item.editable).reduce((rtn, item) => {
    rtn.push(item.fieldName);
    return rtn;
  }, []); /* 그리드에서 수정항목이 아닌 경우 제외 */
  const rowValues = gridUtil.getAllRowValues(view);
  const rtnValues = await getGridRowsToSavePdProps(
    rowValues,
    currentMetaInfos.value,
    prcfd,
    defaultFields.value,
    outKeys,
  );
  // console.log('WwpdcStandardMgtMPriceCopy - getSaveData - rtnValues : ', rtnValues);
  grdMainRef.value?.getView().getDataSource().clearRows();
  gridUtil.reset(grdMainRef.value.getView());
  return rtnValues;
}

async function isModifiedProps() {
  return isModified.value;
}

async function validateProps() {
  return true;
}

async function initGridRows() {
  const view = grdMainRef.value?.getView();
  if (isEmpty(view)) {
    return;
  }

  // 기본 속성에서 등록 채널 목록
  const fnlChannels = currentInitData.value?.[prcfd]?.reduce((rtn, item) => {
    if (!rtn.includes(item.sellChnlCd)) {
      rtn.push(item.sellChnlCd);
    }
    return rtn;
  }, []);
  if (fnlChannels.length) {
    usedChannelCds.value = props.codes?.SELL_CHNL_DTL_CD
      ?.filter((item) => fnlChannels.includes(item.codeId));
  }
  // console.log('usedChannelCds.value : ', usedChannelCds.value);

  // Grid visible 초기화
  resetVisibleGridColumns(currentMetaInfos.value, prcfd, view);

  // 선택된 선택변수 Visible 적용 ( 선택변수값 = Grid Filed명 )
  await resetVisibleChannelColumns();

  // 수수료 변수 visible 적용
  // console.log('feeVariables.value : ', feeVariables.value);
  feeVariables.value?.forEach((item) => {
    const column = view.columnByName(item.codeId);
    if (column) {
      column.visible = true;
    }
  });
  gridRowCount.value = getGridRowCount(view);
}

// 선택변수 Visible 적용 ( 선택변수값 = Grid Filed명 )
async function resetVisibleChannelColumns() {
  // 선택변수 전체(판매유형)
  await fetchSelectVariableData();
  if (!selectionVariables.value?.length) {
    // 선택변수가 없으면 초기화
    return;
  }

  // 선택된 선택변수
  const checkedVals = currentInitData.value?.[prumd]?.reduce((rtn, item) => {
    if (item.pdDscPrumPrpVal01) {
      // 선택변수 DB 값은 대문자
      rtn.push(item.pdDscPrumPrpVal01);
    }
    return rtn;
  }, []);

  selectionVariables.value.forEach((field) => {
    const view = grdMainRef.value.getView();
    const column = view.columnByName(field.codeId);
    if (column) {
      if (checkedVals && checkedVals.includes(field.colNm)) {
        column.visible = true;
      } else {
        column.visible = false;
      }
    }
  });
}

async function onUpdateSellChannel() {
  channelApplyStartDates.value = currentInitData.value?.[prcfd]
    ?.reduce((rtn, item) => {
      if (copyChannel.value === item.sellChnlCd) {
        const vlStartDtm = currentInitData.value?.[prcd]
          ?.find((std) => std[pdConst.PRC_STD_ROW_ID] === item[pdConst.PRC_STD_ROW_ID])?.vlStrtDtm;
        const vlStrtDtmCode = { codeId: vlStartDtm, codeName: stringUtil.getDateFormat(vlStartDtm) };
        if (!rtn.includes(vlStrtDtmCode)) {
          rtn.push(vlStrtDtmCode);
        }
      }
      return rtn;
    }, []);
}

// 선택변수
async function fetchSelectVariableData() {
  const sellTpCd = currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd;
  // console.log('sellTpCd : ', sellTpCd);
  if (sellTpCd && (isEmpty(currentSellTpCd.value) || sellTpCd !== currentSellTpCd.value)) {
    currentSellTpCd.value = sellTpCd;
    // 선택변수
    const typeRes = await dataService.get('/sms/common/product/type-variables', { params: { sellTpCd } });
    selectionVariables.value = typeRes.data?.filter((item) => item.choFxnDvCd === pdConst.CHO_FXN_DV_CD_CHOICE);

    // 수수료 선택변수
    const typeRes2 = await dataService.get('/sms/common/product/type-variables', { params: { sellTpCd, choFxnDvCd: pdConst.CHO_FXN_DV_CD_FEE } });
    feeVariables.value = cloneDeep(typeRes2.data);
  }
}

// 가져오기
async function onClickGet() {
  if (!(await copyChannelRef.value.validate())) {
    return;
  }
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
    const rows = cloneDeep(await getPropInfosToGridRows(
      currentInitData.value?.[prcfd],
      currentMetaInfos.value,
      prcfd,
      [...defaultFields.value, 'prcBefAdj'],
    ));
    const dataSource = view.getDataSource();
    rows?.forEach((row) => {
      row[pdConst.PRC_STD_ROW_ID] = row[pdConst.PRC_STD_ROW_ID] ?? row.pdPrcDtlId;
      const stdRow = stdRows?.find((item) => (row[pdConst.PRC_STD_ROW_ID]
                                              && item[pdConst.PRC_STD_ROW_ID] === row[pdConst.PRC_STD_ROW_ID])
                                          || (row.pdPrcDtlId && item.pdPrcDtlId === row.pdPrcDtlId));
      // 채널, 적용일 조건에 맞는 데이터만 가져온다.
      if ((copyChannel.value === row.sellChnlCd && isEmpty(applyStartDate.value))
          || (copyChannel.value === row.sellChnlCd && applyStartDate.value === stdRow.vlStrtDtm)) {
        row = pdMergeBy(row, stdRow);
        row[pdConst.PRC_FNL_ROW_ID] = stringUtil.getUid('FNL');
        row[pdConst.PRC_DETAIL_FNL_ID] = '';
        if (isEmpty(row[pdConst.PRC_STD_ROW_ID])) row[pdConst.PRC_STD_ROW_ID] = row.pdPrcDtlId;
        // console.log('WwpdcStandardMgtMPriceCopy - initGridRows - row : ', row);
        row.sellTpCd = currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd;
        dataSource.insertRow(gridRowCount.value, row);
      }
    });
  }
  gridRowCount.value = getGridRowCount(view);
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  await gridUtil.deleteCheckedRows(view);
  gridRowCount.value = getGridRowCount(view);
}

/* async function onClickAdd() {
  const view = grdMainRef.value.getView();
  const data = view.getDataSource();
  data.insertRow(gridRowCount.value, {});
  gridRowCount.value = getGridRowCount(view);
} */

async function onClickRowCopy() {
  const view = grdMainRef.value.getView();
  const data = view.getDataSource();
  const checkedRows = cloneDeep(gridUtil.getCheckedRowValues(view));
  if (checkedRows.length < 1) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  checkedRows.forEach((rowItem) => {
    rowItem[pdConst.PRC_FNL_ROW_ID] = stringUtil.getUid('FNL');
    rowItem[pdConst.PRC_DETAIL_FNL_ID] = '';
    data.insertRow(gridRowCount.value, rowItem);
    gridRowCount.value += 1;
  });
}

// 반영
async function onClickApply() {
  const view = grdMainRef.value?.getView();
  gridRowCount.value = getGridRowCount(view);
  if (!gridRowCount.value) {
    // 변경된 내용이 없습니다.
    notify(t('MSG_ALT_NO_CHG_CNTN'));
  } else {
    emits('applyData');
    isModified.value = true;
  }
}

async function onCellEditValue(grid, itemIndex, changedFieldName) {
  if (['cndtFxamFxrtDvCd', 'cndtDscPrumVal'].includes(changedFieldName) || isEmpty(changedFieldName)) {
    await onCellEditBaseValue(grid, itemIndex, changedFieldName);
    await setCountBeforePrice(grid, itemIndex);
  } else if (changedFieldName === 'ctrVal') {
    await setFinalVal(grid, itemIndex);
  }
}

// 조정가 적용(소스 동기화시켜 주세요!: WwpdcStandardMgtMPriceVal.vue, WwpdcStandardMgtMPriceCopy.vue )
async function onCellEditBaseValue(grid, itemIndex, changedFieldName) {
  if (changedFieldName === 'cndtFxamFxrtDvCd') {
    grid.setValue(itemIndex, 'cndtDscPrumVal', 0);
  } else if (changedFieldName === 'cndtDscPrumVal' || isEmpty(changedFieldName)) {
    const fixDvCd = grid.getValue(itemIndex, 'cndtFxamFxrtDvCd');
    const fixValue = grid.getValue(itemIndex, 'cndtDscPrumVal');
    if (fixDvCd === '01') {
      const basVal = grid.getValue(itemIndex, 'basVal');
      if (fixValue > basVal) {
        /* {0}값이 {1}보다 큽니다. */
        notify(t('MSG_ALT_A_IS_GREAT_THEN_B', [
          `${grid.columnByName('cndtDscPrumVal').header.text}(${fixValue})`,
          `${grid.columnByName('basVal').header.text}(${basVal})`]));
        grid.setValue(itemIndex, 'cndtDscPrumVal', 0);
      }
    } else if (fixDvCd === '02') {
      if (fixValue < -100) {
        /* {0}값이 {1}보다 작습니다. */
        notify(t('MSG_ALT_A_IS_LESS_THEN_B', [
          grid.columnByName('cndtDscPrumVal').header.text,
          '-100%']));
        grid.setValue(itemIndex, 'cndtDscPrumVal', 0);
      }
    }
  }
}

// 할인적용가격 계산
function setCountBeforePrice(grid, itemIndex) {
  const basVal = grid.getValue(itemIndex, 'basVal');
  const fixDvCd = grid.getValue(itemIndex, 'cndtFxamFxrtDvCd');
  const cndtDscPrumVal = grid.getValue(itemIndex, 'cndtDscPrumVal');
  const ctrVal = grid.getValue(itemIndex, 'ctrVal');
  // 저장전 할인적용가격, 최종가 재계산
  // 조정 전 가격 ( 01: 정액, 02: 정률)
  if (isEmpty(fixDvCd) || fixDvCd === '01') {
    // 할인적용가격 = 기본가 + 조정가
    grid.setValue(itemIndex, 'prcBefAdj', basVal + Number(cndtDscPrumVal ?? 0));
  } else if (fixDvCd === '02') {
    // 할인적용가격 = 기본가 + 조정률
    const calPrc = Math.round((basVal * Number(cndtDscPrumVal ?? 0)) / 100, 2);
    grid.setValue(itemIndex, 'prcBefAdj', Number(basVal ?? 0) + calPrc);
  }
  // 최종가
  const prcBefAdj = grid.getValue(itemIndex, 'prcBefAdj');
  grid.setValue(itemIndex, 'fnlVal', Number(prcBefAdj ?? 0) + Number(ctrVal ?? 0));
}

// 최종가 조정(소스 동기화시켜 주세요!: WwpdcStandardMgtMPriceFnl.vue, WwpdcStandardMgtMPriceCopy.vue)
async function setFinalVal(grid, itemIndex) {
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
    grid.setValue(itemIndex, 'ctrVal', ctrVal);
  }
  // 조정 전 가격 = 조정전가격 - 조정가
  fnlVal = prcBefAdj + ctrVal;
  grid.setValue(itemIndex, 'fnlVal', fnlVal);
}

async function initProps() {
  const { pdCd, initData, metaInfos } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  currentMetaInfos.value = metaInfos;
}

await initProps();

onActivated(async () => {
  // TODO 탭사용시 그리드 사라짐 문제로 아래 코드 임시조치
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
  // const valColNms = currentMetaInfos.value
  //   ?.filter((item) => item.pdPrcMetaTpCd === pdConst.PD_PRC_TP_CD_VARIABLE)
  //   ?.reduce((rtn, item) => { rtn.push(item.colNm); return rtn; }, []);
  // const fnlColNms = currentMetaInfos.value
  //   ?.filter((item) => item.pdPrcMetaTpCd === pdConst.PD_PRC_TP_CD_FINAL)
  //   ?.reduce((rtn, item) => { rtn.push(item.colNm); return rtn; }, []);
  const readonlyFields = [...basicColNms, 'fnlVal'];

  const { fields, columns } = await getPdMetaToGridInfos(
    currentMetaInfos.value,
    [pdConst.PD_PRC_TP_CD_BASIC,
      pdConst.PD_PRC_TP_CD_VARIABLE,
      pdConst.PD_PRC_TP_CD_FINAL,
      pdConst.PD_PRC_TP_CD_FEE],
    props.codes,
    readonlyFields,
    ['cndtFxamFxrtDvCd', 'cndtDscPrumVal', 'fxamFxrtDvCd', 'ctrVal'],
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

  const prcBeforAdjIndex = columns.findIndex((item) => item.fieldName === 'ctrVal');
  columns.splice(prcBeforAdjIndex, 0, prcBeforAdj);
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
  view.editOptions.editWhenFocused = false;

  view.setFixedOptions({ colCount: 6 });

  // 조정 값 초기화
  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    const changedFieldName = grid.getDataSource().getOrgFieldNames()[fieldIndex];
    // console.log('changedFieldName : ', changedFieldName);
    await onCellEditValue(grid, itemIndex, changedFieldName);
  };

  // 붙여넣기 시,  전체 조정
  view.onPasted = async (grid) => {
    gridUtil.getAllRowValues(view).forEach((item) => {
      onCellEditValue(grid, item.dataRow);
    });
  };

  await initGridRows();
  await init();
}

</script>
