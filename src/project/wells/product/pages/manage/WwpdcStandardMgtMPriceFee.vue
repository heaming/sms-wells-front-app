<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMPriceFee - 기준상품 등록/변경 - 가격정보 - 수수료 등록 ( W-PD-U-0010M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 가격정보 - 수수료 등록 프로그램
****************************************************************************************************
--->
<template>
  <!-- 수수료 등록 -->
  <h3>{{ $t('MSG_TXT_PD_REG_FEE') }}</h3>
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
  </kw-action-top>
  <ul class="filter-box justify-between mb12">
    <li class="filter-box__item">
      <p class="filter-box__item-label">
        <!-- 판매채널 -->
        {{ $t('MSG_TXT_SEL_CHNL') }}
      </p>
      <kw-select
        v-model="filterChannel"
        dense
        first-option="all"
        class="w250"
        :options="usedChannelCds"
        @update:model-value="onUpdateSellChannel"
      />
    </li>
  </ul>
  <kw-grid
    ref="grdMainRef"
    :visible-rows="10"
    :need-context-menu="false"
    @init="initGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { gridUtil, useDataService, getComponentType } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { resetVisibleGridColumns, getGridRowCount, setPdGridRows, pdMergeBy, getGridRowsToSavePdProps, getPropInfosToGridRows, getPdMetaToGridInfos } from '~sms-common/product/utils/pdUtil';

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

const dataService = useDataService();
const { t } = useI18n();

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
const removeObjects = ref([]);
const gridRowCount = ref(0);
const currentSellTpCd = ref(null);
const usedChannelCds = ref([]);
const filterChannel = ref();
const sellChannelFilterCond = ref();

async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  removeObjects.value = [];
  gridRowCount.value = 0;
  usedChannelCds.value = [];
  filterChannel.value = null;
  sellChannelFilterCond.value = null;
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
  if (removeObjects.value.length) {
    rtnValues[pdConst.REMOVE_ROWS] = cloneDeep(removeObjects.value);
  }
  // console.log('WwpdcStandardMgtMPriceFee - getSaveData - rtnValues : ', rtnValues);
  return rtnValues;
}

async function isModifiedProps() {
  return gridUtil.isModified(grdMainRef.value.getView());
}

async function validateProps() {
  const rtn = gridUtil.validate(grdMainRef.value.getView(), {
    isChangedOnly: false,
  });
  return rtn;
}

async function initGridRows() {
  removeObjects.value = [];
  const view = grdMainRef.value?.getView();
  if (isEmpty(view)) {
    return;
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
    sellChannelFilterCond.value = usedChannelCds.value.map((v) => ({ name: v.codeId, criteria: `value = '${v.codeId}'` }));
    // 판매채널 필터
    if (sellChannelFilterCond.value) {
      view.setColumnFilters('sellChnlCd', sellChannelFilterCond.value, true);
    }
  }

  // 상품 선택변수
  const checkedVals = currentInitData.value?.[prumd]?.reduce((rtn, item) => {
    if (item.pdDscPrumPrpVal01) {
      rtn.push(item.pdDscPrumPrpVal01);
    }
    return rtn;
  }, []);
  // Grid visible 초기화
  resetVisibleGridColumns(currentMetaInfos.value, pdConst.PD_PRC_TP_CD_FINAL, view);

  await fetchFeeVariableData();
  // 상품 선택변수 visible 적용
  if (checkedVals && checkedVals.length) {
    checkedVals.forEach((fieldName) => {
      const column = view.columnByName(fieldName);
      if (column) {
        column.visible = true;
      }
    });
  }
  // 수수료 변수 visible 적용
  feeVariables.value?.forEach((item) => {
    const column = view.columnByName(item.codeId);
    if (column) {
      column.visible = true;
    }
  });

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
      defaultFields.value,
    ));
    rows?.map((row) => {
      row[pdConst.PRC_STD_ROW_ID] = row[pdConst.PRC_STD_ROW_ID] ?? row.pdPrcDtlId;
      const stdRow = stdRows?.find((item) => (row[pdConst.PRC_STD_ROW_ID]
                                                && item[pdConst.PRC_STD_ROW_ID] === row[pdConst.PRC_STD_ROW_ID])
                                            || (row.pdPrcDtlId && item.pdPrcDtlId === row.pdPrcDtlId));
      row = pdMergeBy(row, stdRow);
      row[pdConst.PRC_FNL_ROW_ID] = row[pdConst.PRC_FNL_ROW_ID] ?? row.pdPrcFnlDtlId;
      if (isEmpty(row[pdConst.PRC_STD_ROW_ID])) row[pdConst.PRC_STD_ROW_ID] = row.pdPrcDtlId;
      // console.log('WwpdcStandardMgtMPriceFee - initGridRows - row : ', row);
      row.sellTpCd = currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd;
      return row;
    });
    // console.log('Fee Rows : ', rows);
    await setPdGridRows(view, rows, pdConst.PRC_FNL_ROW_ID, defaultFields.value, true);
  } else {
    view.getDataSource().clearRows();
  }
  gridRowCount.value = getGridRowCount(view);
  await onUpdateSellChannel();
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

// 수수료 선택변수
async function fetchFeeVariableData() {
  const sellTpCd = currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd;
  if (sellTpCd && (isEmpty(currentSellTpCd.value) || sellTpCd !== currentSellTpCd.value)) {
    currentSellTpCd.value = sellTpCd;
    const typeRes = await dataService.get('/sms/common/product/type-variables', { params: { sellTpCd, choFxnDvCd: pdConst.CHO_FXN_DV_CD_FEE } });
    feeVariables.value = typeRes.data;
  }
}

async function onUpdateSellChannel() {
  const view = grdMainRef.value.getView();
  view.activateAllColumnFilters('sellChnlCd', false);
  if (filterChannel.value) {
    view.activateColumnFilters('sellChnlCd', [filterChannel.value], true);
  }
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
  const valColNms = currentMetaInfos.value
    ?.filter((item) => item.pdPrcMetaTpCd === pdConst.PD_PRC_TP_CD_VARIABLE)
    ?.reduce((rtn, item) => { rtn.push(item.colNm); return rtn; }, []);
  const fnlColNms = currentMetaInfos.value
    ?.filter((item) => item.pdPrcMetaTpCd === pdConst.PD_PRC_TP_CD_FINAL)
    ?.reduce((rtn, item) => { rtn.push(item.colNm); return rtn; }, []);
  const readonlyFields = ['sellChnlCd', 'fnlVal', ...basicColNms, ...valColNms, ...fnlColNms];

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

  columns.map((item) => {
    if (item.fieldName === 'svPdCd') {
      item.styleName = 'text-left';
      item.options = props.codes.svPdCd;
    } else if (item.fieldName === 'sellChnlCd') {
      item.autoFilter = false;
    }
    return item;
  });
  data.setFields(fields);
  view.setColumns(columns.sort((item) => (item.fieldName === 'sellChnlCd' ? -1 : 0)));
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;

  view.setFixedOptions({ colCount: 6 });

  await initGridRows();
  await init();
}

</script>
