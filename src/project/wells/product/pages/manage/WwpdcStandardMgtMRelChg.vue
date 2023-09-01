<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMRelChg - 기준상품 등록/변경 - 연결상품 선택 - 교체상품( W-PD-U-0010M01 ) - 교체상품
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 연결상품 선택 - 교체상품 프로그램
****************************************************************************************************
--->
<template>
  <!-- 대체품 -->
  <h3>{{ $t('MSG_TXT_REP_PROD') }}</h3>
  <kw-action-top>
    <template #left>
      <!--  기준상품 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_SEL_STD') }}</span>
      <kw-select
        v-model="productSearchType"
        dense
        class="ml12 w140"
        :options="productSelectItems"
      />
      <kw-input
        v-model="productSearchValue"
        maxlength="100"
        dense
        clearable
        icon="search"
        class="ml8 w250"
        @click-icon="onClickProductSchPopup"
      />
    </template>
    <kw-btn
      grid-action
      dense
      :label="$t('MSG_BTN_DEL')"
      :disable="grdChangeRowCount === 0"
      @click="onClickProductDelRows"
    />
  </kw-action-top>
  <kw-grid
    ref="grdChangePrdRef"
    name="grdMgtRelChange"
    :visible-rows="15"
    @init="initChangePrdGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { gridUtil, stringUtil, useGlobal, getComponentType } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { onCellEditRelProdPeriod, getGridRowCount, setPdGridRows, getOverPeriodByRelProd } from '~sms-common/product/utils/pdUtil';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData, init, getSaveData, isModifiedProps, validateProps,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  codes: { type: Object, default: null },
});

const { notify, modal } = useGlobal();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdChangePrdRef = ref(getComponentType('KwGrid'));
const grdChangeRowCount = ref(0);
const currentPdCd = ref();
const currentInitData = ref({});
const productSelectItems = ref([
  // 기준상품명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_GOODS_NM') },
  // 기준상품코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_PROD_CD') },
]);

const productSearchType = ref(pdConst.PD_SEARCH_NAME);
const productSearchValue = ref();

const searchParams = ref({
  searchType: null,
  searchValue: null,
});

async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  if (grdChangePrdRef.value?.getView()) gridUtil.reset(grdChangePrdRef.value.getView());
}

async function init() {
  if (grdChangePrdRef.value?.getView()) gridUtil.init(grdChangePrdRef.value.getView());
}

async function getSaveData() {
  const rowValues = gridUtil.getAllRowValues(grdChangePrdRef.value.getView());
  const rtnValues = { [pdConst.TBL_PD_REL]: rowValues ?? [] };
  // console.log('WwpdcStandardMgtMRelPrd - getSaveData - rtnValues : ', rtnValues);
  return rtnValues;
}

async function isModifiedProps() {
  return gridUtil.isModified(grdChangePrdRef.value?.getView());
}

async function validateProps() {
  let isValid = true;
  const view = grdChangePrdRef.value?.getView();

  // 필수값 체크
  isValid = await gridUtil.validate(view, {
    isChangedOnly: false,
  });

  // 적용일자 중복 체크
  if (isValid) isValid = await isOverPeriodCheck(view);

  return isValid;
}

async function isOverPeriodCheck(view) {
  let isValid = true;
  const rowValues = gridUtil.getAllRowValues(view);
  if (rowValues.length < 1) {
    return isValid;
  }
  let dupItem;
  await Promise.all(rowValues.map(async (item1) => {
    if (isValid) {
      dupItem = (await getOverPeriodByRelProd(view, item1));
      if (dupItem) {
        isValid = false;
      }
    }
  }));
  if (!isValid) {
    notify(t('MSG_ALT_EXIST_DUP_RANGE_PD', [dupItem]));
  }
  return isValid;
}

async function insertCallbackRows(view, rtn, pdRelTpCd) {
  if (isEmpty(rtn) || !rtn.result || isEmpty(rtn.payload) || rtn.payload.length < 1) {
    return;
  }
  const currentTime = dayjs().format('YYYYMMDDHHmmss');
  const data = view.getDataSource();
  const insertRows = Array.isArray(rtn.payload) ? rtn.payload : [rtn.payload];

  let lastRow = 0;
  insertRows.forEach((row) => {
    row[pdConst.REL_PD_ID] = stringUtil.getUid('REL_TMP');
    row[pdConst.PD_REL_TP_CD] = pdRelTpCd;
    row[pdConst.REL_OJ_PD_CD] = row.pdCd;
    const rowValues = gridUtil.getAllRowValues(view);
    let isValid = false;
    const alreadyPdCdRows = rowValues.filter((item) => item[pdConst.REL_OJ_PD_CD] === row[pdConst.REL_OJ_PD_CD]);
    if (alreadyPdCdRows && alreadyPdCdRows.length) {
      const lastVlEndDtm = alreadyPdCdRows.reduce((maxDt, item) => {
        maxDt = Number(item.vlEndDtm) > maxDt ? Number(item.vlEndDtm) : maxDt;
        return maxDt;
      }, 0);
      if (currentTime > lastVlEndDtm) {
        isValid = true;
      }
      lastRow = alreadyPdCdRows[0].dataRow;
    } else {
      isValid = true;
      lastRow = 0;
    }
    if (isValid) {
      row.vlStrtDtm = currentTime;
      row.vlEndDtm = 99991231235959;
    }
    data.insertRow(lastRow, row);
  });
}

async function deleteCheckedRows(view) {
  const checkedRows = view.getCheckedRows();
  if (checkedRows.length === 0) {
    // 데이터를 선택해주세요.
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  const removeCreateRows = [];
  let isDbDataRemove = false;
  await Promise.all(checkedRows.map(async (row) => {
    const item = gridUtil.getRowValue(view, row);
    if (item.rowState === 'created' || isEmpty(item[pdConst.REL_PD_ID]) || item[pdConst.REL_PD_ID].startsWith('REL_TMP')) {
      removeCreateRows.push(row);
    } else {
      isDbDataRemove = true;
      // const endSetTime = dayjs().subtract(1, 'second').format('YYYYMMDDHHmmss');
      // view.setValue(row, 'vlEndDtm', endSetTime);
    }
  }));
  if (removeCreateRows.length) {
    view.getDataSource().removeRows(removeCreateRows);
  }
  if (isDbDataRemove) {
    notify(t('MSG_ALT_PD_REL_NO_REMOVE'));
  }

  view.setAllCheck(false, true);
  view.clearCurrent();
}

async function onClickProductSchPopup() {
  const view = grdChangePrdRef.value.getView();
  searchParams.value.searchType = productSearchType.value;
  searchParams.value.searchValue = productSearchValue.value;
  searchParams.value.pdTpCd = pdConst.PD_TP_CD_STANDARD;
  const rtn = await modal({
    component: 'ZwpdcStandardSimpleListP',
    componentProps: searchParams.value,
  });
  await insertCallbackRows(view, rtn, pdConst.PD_REL_TP_CD_CHANGE);
  grdChangeRowCount.value = getGridRowCount(view);
}

async function onClickProductDelRows() {
  const view = grdChangePrdRef.value.getView();
  await deleteCheckedRows(view);
  grdChangeRowCount.value = getGridRowCount(view);
}

async function initGridRows() {
  const products = currentInitData.value[pdConst.RELATION_PRODUCTS];
  if (isEmpty(await products)) {
    return;
  }
  const changeView = grdChangePrdRef.value?.getView();
  if (changeView) {
    const changeRows = products
      ?.filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_CHANGE);
    await setPdGridRows(changeView, changeRows, pdConst.REL_PD_ID, [], true);
  }
  grdChangeRowCount.value = getGridRowCount(changeView);
}

async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
}

await initProps();

onActivated(async () => {
  await initGridRows();
});

watch(() => props.pdCd, (pdCd) => { currentPdCd.value = pdCd; });
watch(() => props.initData, (initData) => {
  currentInitData.value = initData;
  initGridRows();
}, { deep: true });

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------
async function initChangePrdGrid(data, view) {
  const columns = [
    // 적용시작일자
    { fieldName: 'vlStrtDtm',
      header: t('MSG_TXT_APY_STRTDT'),
      width: '190',
      editor: { type: 'date' },
      dataType: 'datetime',
      datetimeFormat: 'datetime',
      styleName: 'text-center',
      rules: 'required',
      editable: true,
    },
    // 적용종료일자
    { fieldName: 'vlEndDtm',
      header: t('MSG_TXT_APY_ENDDT'),
      width: '190',
      editor: { type: 'date' },
      dataType: 'datetime',
      datetimeFormat: 'datetime',
      styleName: 'text-center',
      rules: 'required',
      editable: true,
    },
    // 기준상품 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_STD_TYPE'), width: '170', editable: false },
    // 기준상품명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '200', editable: false },
    // 기준상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '120', styleName: 'text-center', editable: false },
    // 판매유형
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '140', styleName: 'text-center', options: props.codes?.SELL_TP_CD, editable: false },
    // 판매기간
    { fieldName: 'sellDurtion', header: t('MSG_TXT_PRDT_SLE_PRD'), width: '180', styleName: 'text-center', editable: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: pdConst.REL_PD_ID });
  fields.push({ fieldName: pdConst.PD_REL_TP_CD });
  fields.push({ fieldName: pdConst.REL_OJ_PD_CD });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    await onCellEditRelProdPeriod(view, grid, itemIndex, row, fieldIndex);
  };

  await initGridRows();
  await init();
}

</script>
