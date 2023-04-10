<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMPriceVal - 기준상품 등록/변경- 가격정보 - 선택변수 등록 (  )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경- 가격정보 - 선택변수 등록 프로그램
****************************************************************************************************
--->
<template>
  <div class="normal-area">
    <!-- 선택변수 등록 -->
    <h3>{{ $t('MSG_TXT_PD_REG_SEL_VAR') }}</h3>
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
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-form
      ref="frmVariableRef"
      :cols="2"
      dense
    >
      <kw-form-row>
        <!-- 선택변수 -->
        <kw-form-item :label="$t('MSG_TXT_PD_SEL_VAL')">
          <kw-option-group
            v-model="checkedSelVals"
            type="checkbox"
            :options="selectionVariables"
            @update:model-value="resetVisibleChannelColumns"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
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
import { useDataService, stringUtil, gridUtil, getComponentType, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { getGridRowCount, setPdGridRows, pdMergeBy, getGridRowsToSavePdProps, getPropInfosToGridRows, getPdMetaToGridInfos } from '~sms-common/product/utils/pdUtil';

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
const dataService = useDataService();
const { notify } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const frmChannelRef = ref();
const frmVariableRef = ref();

const prcd = pdConst.TBL_PD_PRC_DTL;
const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;
const prumd = pdConst.TBL_PD_DSC_PRUM_DTL;
const defaultFields = ref([pdConst.PRC_STD_ROW_ID, pdConst.PRC_FNL_ROW_ID,
  pdConst.PRC_DETAIL_ID, pdConst.PRC_DETAIL_FNL_ID]);
const currentPdCd = ref();
const currentInitData = ref(null);
const currentMetaInfos = ref();
const currentSellTpCd = ref();
const usedChannelCds = ref([]);
const addChannelId = ref();
const usedChannelRef = ref();
const checkedSelVals = ref([]);
const selectionVariables = ref([]);
const removeObjects = ref([]);
const gridRowCount = ref(0);

async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  usedChannelCds.value = [];
  addChannelId.value = '';
  removeObjects.value = [];
  gridRowCount.value = 0;
  frmChannelRef.value.reset();
  frmVariableRef.value.reset();
  grdMainRef.value?.getView().getDataSource().clearRows();
  if (grdMainRef.value?.getView()) gridUtil.reset(grdMainRef.value.getView());
}

async function init() {
  if (grdMainRef.value?.getView()) gridUtil.init(grdMainRef.value.getView());
  frmChannelRef.value.init();
  frmVariableRef.value.init();
}

async function getSaveData() {
  const view = grdMainRef.value.getView();
  const outKeys = view.getColumns().filter((item) => !item.editable).reduce((rtn, item) => {
    rtn.push(item.fieldName);
    return rtn;
  }, []); /* 그리드에서 수정항목이 아닌 경우 제외 */
  const rowValues = gridUtil.getAllRowValues(view);
  // console.log('WwpdcStandardMgtMPriceVal - getSaveData - rowValues 1  : ', rowValues);
  const rtnValues = await getGridRowsToSavePdProps(
    rowValues,
    currentMetaInfos.value,
    prcfd,
    ['sellChnlCd', 'pdCd', ...defaultFields.value],
    outKeys,
  );
  // console.log('WwpdcStandardMgtMPriceVal - getSaveData - rtnValues 2 : ', rtnValues);
  if (removeObjects.value.length) {
    rtnValues[pdConst.REMOVE_ROWS] = cloneDeep(removeObjects.value);
  }
  rtnValues[prumd] = checkedSelVals.value.reduce((rtn, item) => {
    if (item) {
      rtn.push({ pdCd: currentPdCd.value, pdDscPrumPrpVal01: item });
    }
    return rtn;
  }, []);
  // console.log('WwpdcStandardMgtMPriceVal - getSaveData - rtnValues2 : ', rtnValues);
  return rtnValues;
}

async function isModifiedProps() {
  return gridUtil.isModified(grdMainRef.value.getView()) || frmVariableRef.value.isModified();
}

async function validateProps() {
  const rtn = gridUtil.validate(grdMainRef.value.getView(), {
    isChangedOnly: false,
  });
  if (rtn && !gridRowCount.value) {
    await notify(t('MSG_ALT_ADD_SOME_ITEM', [t('MSG_TXT_PRICE_INFO')]));
    return false;
  }
  return rtn;
}

async function resetInitData() {
  // 판매유형
  const sellTpCd = currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd;
  if (sellTpCd !== currentSellTpCd.value) {
    currentSellTpCd.value = sellTpCd;
    await fetchSelVarData();
  }

  // 기본 속성에서 등록 채널 목록
  const channels = currentInitData.value?.[pdConst.TBL_PD_DTL]
    ?.reduce((rtn, item) => {
      if (item.avlChnlId) {
        rtn.push(item.avlChnlId);
      }
      return rtn;
    }, [])
    ?.join(',');
  // console.log(' channels : ', channels);
  if (channels) {
    usedChannelCds.value = props.codes?.SELL_CHNL_DTL_CD?.filter((item) => channels.indexOf(item.codeId) > -1);
  }
  const checkedVals = currentInitData.value?.[prumd]?.reduce((rtn, item) => {
    if (item.pdDscPrumPrpVal01) {
      rtn.push(item.pdDscPrumPrpVal01);
    }
    return rtn;
  }, []);
  if (checkedVals && checkedVals.length) {
    selectionVariables.value?.forEach((item, idx) => {
      checkedSelVals.value[idx] = checkedVals.includes(item.codeId) ? item.codeId : null;
    });
  }
  await initGridRows();
}

async function initGridRows() {
  removeObjects.value = [];
  const view = grdMainRef.value?.getView();
  if (isEmpty(view)) {
    return;
  }
  if (await currentInitData.value[prcfd]) {
    // 기준가 정보
    const stdRows = cloneDeep(
      await getPropInfosToGridRows(
        currentInitData.value?.[prcd],
        currentMetaInfos.value,
        prcd,
        [pdConst.PRC_STD_ROW_ID],
      ),
    );
    // 선택변수/최종가
    const rows = cloneDeep(await getPropInfosToGridRows(
      currentInitData.value?.[prcfd],
      currentMetaInfos.value,
      prcfd,
      defaultFields.value,
    ));
    rows?.map((row) => {
      row[pdConst.PRC_FNL_ROW_ID] = row[pdConst.PRC_FNL_ROW_ID] ?? row.pdPrcFnlDtlId;
      row[pdConst.PRC_STD_ROW_ID] = row[pdConst.PRC_STD_ROW_ID] ?? row.pdPrcDtlId;
      const stdRow = stdRows?.find((item) => (row[pdConst.PRC_STD_ROW_ID]
                                                && item[pdConst.PRC_STD_ROW_ID] === row[pdConst.PRC_STD_ROW_ID])
                                            || (row.pdPrcDtlId && item.pdPrcDtlId === row.pdPrcDtlId));
      // console.log('const stdRow : ', row);
      row = pdMergeBy(row, stdRow);
      if (isEmpty(row[pdConst.PRC_STD_ROW_ID])) row[pdConst.PRC_STD_ROW_ID] = row.pdPrcDtlId;
      // console.log('WwpdcStandardMgtMPriceVal - initGridRows - row : ', row);
      row.sellTpCd = currentSellTpCd.value;
      // console.log('WwpdcStandardMgtMPriceVal - initGridRows - row : ', row);
      return row;
    });
    await setPdGridRows(view, rows, pdConst.PRC_FNL_ROW_ID, defaultFields.value, true);
  }
  gridRowCount.value = getGridRowCount(view);
}

async function onClickAdd() {
  if (!(await usedChannelRef.value.validate())) {
    return;
  }
  const view = grdMainRef.value.getView();
  if (await currentInitData.value[prcd]) {
    const rowValues = gridUtil.getAllRowValues(grdMainRef.value.getView());
    const stdRows = cloneDeep(
      await getPropInfosToGridRows(
        currentInitData.value?.[prcd],
        currentMetaInfos.value,
        prcd,
        [pdConst.PRC_STD_ROW_ID],
      ),
    // 기존에 추가된 ROW가 없는 행만 추가
    );
    // console.log('rowValues : ', rowValues);
    // console.log('stdRows : ', stdRows);
    const data = view.getDataSource();
    let channelIndex = rowValues.findIndex((gridRow) => addChannelId.value === gridRow.sellChnlCd);
    if (stdRows && stdRows.length) {
      stdRows.forEach((row, idx) => {
        row.sellChnlCd = addChannelId.value;
        row[pdConst.PRC_FNL_ROW_ID] = stringUtil.getUid('FNL');
        row[pdConst.PRC_DETAIL_FNL_ID] = '';
        row.pdPrcDtlIdRefVp = row.pdPrcDtlId;
        row.sellTpCd = currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd;
        // 정액정률구분 디폴트 - '정액'
        row.cndtFxamFxrtDvCd = '01';
        if (channelIndex < 0) {
          channelIndex = 0;
        }
        // 동일 채널이 존재하면, 동일 기준가격이 존재하는지 확인하고, 없으면 해당 위치에 Insert
        // const alradyRow = rowValues.findIndex((gridRow) => addChannelId.value === gridRow.sellChnlCd
        //   && gridRow[pdConst.PRC_STD_ROW_ID] === row[pdConst.PRC_STD_ROW_ID]);
        // if (alradyRow < 0) {
        data.insertRow(channelIndex + idx, row);
        // }
      });
      view.resetCurrent();
      gridUtil.focusCellInput(view, channelIndex);
    }
  }
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

async function fetchSelVarData() {
  const sellTpCd = currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd;
  const res = await dataService.get('/sms/common/product/type-variables', { params: { sellTpCd } });
  // console.log('selectionVariables.value : ', selectionVariables.value);
  selectionVariables.value = res.data;
}

async function resetVisibleChannelColumns() {
  // console.log('checkedSelVals : ', checkedSelVals.value);
  selectionVariables.value.forEach((field) => {
    const view = grdMainRef.value.getView();
    const column = view.columnByName(field.colNm);
    if (column) {
      if (checkedSelVals.value && checkedSelVals.value.includes(field.colNm)) {
        column.visible = true;
      } else {
        column.visible = false;
      }
    }
  });
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
async function initGrid(data, view) {
  const { metaInfos } = props;
  currentMetaInfos.value = metaInfos;
  const basicColNms = currentMetaInfos.value
    ?.filter((item) => item.pdPrcMetaTpCd === pdConst.PD_PRC_TP_CD_BASIC)
    ?.reduce((rtn, item) => { rtn.push(item.colNm); return rtn; }, []);
  // console.log('basicColNms : ', basicColNms);
  const readonlyFields = ['sellChnlCd', ...basicColNms];
  // console.log('currentMetaInfos.value : ', currentMetaInfos.value);
  // console.log(props.codes);
  const { fields, columns } = await getPdMetaToGridInfos(
    currentMetaInfos.value,
    [pdConst.PD_PRC_TP_CD_BASIC,
      pdConst.PD_PRC_TP_CD_VARIABLE],
    props.codes,
    readonlyFields,
    [],
    defaultFields.value,
  );
  columns.map((item) => {
    if (item.fieldName === 'svPdCd') {
      item.options = props.codes.svPdCd;
    }
    return item;
  });
  data.setFields(fields);
  // 판매채널을 제일 앞으로
  view.setColumns(columns.sort((item) => (item.fieldName === 'sellChnlCd' ? -1 : 0)));
  view.checkBar.visible = true;
  view.rowIndicator.visible = false;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;

  view.setFixedOptions({ colCount: 6 });

  // 조정 값 초기화
  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    const changedFieldName = grid.getColumn(fieldIndex).fieldName;
    if (changedFieldName === 'cndtFxamFxrtDvCd') {
      view.setValue(itemIndex, 'cndtDscPrumVal', 0);
      view.resetCurrent();
    } else if (changedFieldName === 'cndtDscPrumVal') {
      const fixDvCd = grid.getValue(itemIndex, 'cndtFxamFxrtDvCd');
      const fixValue = grid.getValue(itemIndex, 'cndtDscPrumVal');
      if (fixDvCd === '01') {
        const basePrc = grid.getValue(itemIndex, 'ccamBasePrc');
        if (fixValue > basePrc) {
          /* {0}값이 {1}보다 큽니다. */
          notify(t('MSG_ALT_A_IS_GREAT_THEN_B', [
            `${grid.columnByName('cndtDscPrumVal').header.text}(${fixValue})`,
            `${grid.columnByName('ccamBasePrc').header.text}(${basePrc})`]));
          view.setValue(itemIndex, 'cndtDscPrumVal', 0);
          view.resetCurrent();
        }
      } else if (fixDvCd === '02') {
        if (fixValue < -100) {
          /* {0}값이 {1}보다 작습니다. */
          notify(t('MSG_ALT_A_IS_LESS_THEN_B', [
            grid.columnByName('cndtDscPrumVal').header.text,
            '-100%']));
          view.setValue(itemIndex, 'cndtDscPrumVal', 0);
          view.resetCurrent();
        }
      }
    }
  };
  await resetInitData();
  await init();
  // 그리드 마운트 시점과 컴포넌트 마운트 시점 불일지로 아래 로직 추가
  await resetVisibleChannelColumns();
}
</script>
