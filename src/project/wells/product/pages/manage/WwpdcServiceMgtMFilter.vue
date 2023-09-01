<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcServiceMgtMFlt - 서비스 관리 - 서비스 등록/변경 - 상품필터 교체관리
                ( W-PD-U-0043M02 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 서비스 등록/변경 - 상품필터 교체관리 프로그램
- Wells 특화
- 2023.01.06 - Sprint #4 개발예정
****************************************************************************************************
--->
<template>
  <!-- 교재/자재 -->
  <h3>{{ $t('MSG_TXT_PD_MNL_MAT') }}</h3>
  <kw-action-top>
    <template #left>
      <!--  제품 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_SELECT') }}</span>
      <kw-select
        v-model="searchParams.searchType"
        dense
        class="ml12 w140"
        :options="materialSelectItems"
      />
      <kw-input
        v-model="searchParams.searchValue"
        maxlength="100"
        dense
        clearable
        icon="search"
        class="ml8 w250"
        @click-icon="onClickMaterialSchPopup"
      />
    </template>
    <kw-btn
      grid-action
      dense
      :disable="grdRowCount === 0"
      :label="$t('MSG_BTN_DEL')"
      @click="onClickRemoveRows"
    />
    <kw-separator
      spaced
      vertical
      inset
    />
    <!-- 정기B/S투입 필터/부품 연결 -->
    <kw-btn
      dense
      :disable="!currentPdCd || grdRowCount === 0"
      :label="$t('MSG_TXT_PD_SCH_BS_REL_PART')"
      @click="onClickBsConnect"
    />
    <!-- 정기B/S투입정보 -->
    <kw-btn
      dense
      :disable="grdRowCount === 0"
      :label="$t('MSG_TXT_PD_SCH_BS_INFO')"
      @click="onClickBsInfos"
    />
  </kw-action-top>
  <kw-grid
    ref="grdMainRef"
    name="grdMgtFilterMain"
    @init="initGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { gridUtil, stringUtil, codeUtil, getComponentType, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty, isEqual } from 'lodash-es';
import { getGridRowCount, setPdGridRows, onCellEditRelProdPeriod, getOverPeriodByRelProd } from '~/modules/sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

/* eslint-disable no-use-before-define */
defineExpose({
  init, isModifiedProps, validateProps, resetData, getSaveData,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
});

const { t } = useI18n();
const { notify, modal } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdRowCount = ref(0);
const currentPdCd = ref();
const currentInitData = ref({});
const searchParams = ref({
  searchType: pdConst.PD_SEARCH_NAME,
  searchValue: null,
});

const materialSelectItems = ref([
  // 교재/자재명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_PD_BOK_MTR_NAME') },
  // 교재/자재코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_MATERIAL_CD') },
]);
const codes = await codeUtil.getMultiCodes('PD_TEMP_SAVE_CD');

async function isModifiedProps() {
  return gridUtil.isModified(grdMainRef.value?.getView());
}

async function validateProps() {
  let isValid = true;
  const view = grdMainRef.value?.getView();

  // 필수값 체크
  isValid = await gridUtil.validate(view, {
    isChangedOnly: false,
  });

  // 적용일자 중복 체크
  if (isValid) {
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
  }
  return isValid;
}

async function init() {
  const materialView = grdMainRef.value?.getView();
  if (materialView) gridUtil.init(materialView);
}

async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  searchParams.value.searchType = pdConst.PD_SEARCH_NAME;
  grdRowCount.value = 0;
  if (grdMainRef.value?.getView()) gridUtil.reset(grdMainRef.value.getView());
}

async function getSaveData() {
  const subList = {};
  subList[pdConst.TBL_PD_REL] = [];
  const rowValues = gridUtil.getAllRowValues(grdMainRef.value.getView());
  subList[pdConst.TBL_PD_REL] = rowValues;
  subList[pdConst.RELATION_PRODUCTS] = rowValues;
  return subList;
}

async function onClickRemoveRows() {
  const view = grdMainRef.value.getView();
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

async function onClickBsConnect() {
  const view = grdMainRef.value.getView();
  if (!view.getCheckedRows().length) {
    notify(t('MSG_ALT_SELECT_ONE_ROW', [t('MSG_TXT_PD_SCH_BS_REL_PART')]));
    return;
  }
  if (view.getCheckedRows().length > 1) {
    notify(t('MSG_ALT_SELT_ONE_ITEM'));
    return;
  }
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkedRows[0][pdConst.REL_PD_ID])) {
    // 신규 입력한 항목은 저장 후 연결 가능합니다.
    notify(t('MSG_ALT_NO_SAVE_NO_CONN'));
    return;
  }

  await modal({
    component: 'WwpdcRoutineBsConnListP',
    componentProps: { svPdCd: currentPdCd.value,
      pdctPdCd: checkedRows[0].pdCd,
      svPdNm: currentInitData.value[pdConst.TBL_PD_BAS].pdNm,
      pdctPdNm: checkedRows[0].pdNm,
    },
  });
}

async function onClickBsInfos() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  // [정기B/S투입정보] 하려는 데이터는 선택하세요!
  if (!checkedRows.length) {
    notify(t('MSG_ALT_SELECT_ONE_ROW', [t('MSG_TXT_PD_SCH_BS_INFO')]));
    return;
  }

  // 데이터를 한 개만 선택해 주세요.
  if (checkedRows.length > 1) {
    notify(t('MSG_ALT_SELT_ONE_ITEM'));
    return;
  }

  await modal({
    component: 'WwpdcRoutineBsInputListP',
    componentProps: { svPdCd: currentPdCd.value,
      pdctPdCd: checkedRows[0].pdCd,
      svPdNm: currentInitData.value[pdConst.TBL_PD_BAS].pdNm,
      pdctPdNm: checkedRows[0].pdNm,
    },
  });
}

async function onClickMaterialSchPopup() {
  const view = grdMainRef.value.getView();
  const rtn = await modal({
    component: 'ZwpdcMaterialListP',
    componentProps: searchParams.value,
  });

  if (isEmpty(rtn) || !rtn.result || isEmpty(rtn.payload) || rtn.payload.length < 1) {
    return;
  }
  const currentTime = dayjs().format('YYYYMMDDHHmmss');
  const data = view.getDataSource();
  const insertRows = Array.isArray(rtn.payload) ? rtn.payload : [rtn.payload];

  let lastRow = 0;
  insertRows.forEach((row) => {
    row[pdConst.REL_PD_ID] = stringUtil.getUid('REL_TMP');
    row[pdConst.PD_REL_TP_CD] = pdConst.PD_REL_TP_CD_PD_TO_FL;
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
  grdRowCount.value = getGridRowCount(view);
}

async function initGridRows() {
  const products = cloneDeep(currentInitData.value?.[pdConst.RELATION_PRODUCTS]);
  // console.log('WwpdcServiceMgtMFlt - initGridRows - products : ', products);
  const materialView = grdMainRef.value?.getView();
  if (products && materialView) {
    const materialRows = products.filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_PD_TO_FL);
    await setPdGridRows(materialView, materialRows, pdConst.REL_PD_ID, [], true);
    grdRowCount.value = getGridRowCount(materialView);
  } else {
    materialView.getDataSource().clearRows();
  }
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
  if (!isEqual(currentInitData.value, initData)) {
    currentInitData.value = initData;
    initGridRows();
  }
}, { deep: true });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrid(data, view) {
  const columns = [
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '80', styleName: 'text-center', options: codes.PD_TEMP_SAVE_CD, editable: false },
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
    // 교재/자재 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_BOK_MTR_TYPE'), width: '230', editable: false },
    // 교재/자재명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_BOK_MTR_NAME'), width: '250', editable: false },
    // 제품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '120', styleName: 'text-center', editable: false },
    // 자재코드
    { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '180', styleName: 'text-center', editable: false },
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
<style scoped></style>
