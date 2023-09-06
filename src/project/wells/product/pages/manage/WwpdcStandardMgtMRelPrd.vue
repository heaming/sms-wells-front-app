<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMRelPrd - 기준상품 등록/변경 - 연결상품 선택 - 판매상품( W-PD-U-0010M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 연결상품 선택 - 판매상품 프로그램
****************************************************************************************************
--->
<template>
  <!-- 교재/자재 -->
  <h3>{{ $t('MSG_TXT_PD_MNL_MAT') }}</h3>
  <kw-action-top>
    <template #left>
      <!-- 교재/자재 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_MNL_MAT_SEL') }}</span>
      <kw-select
        v-model="materialSearchType"
        dense
        class="ml12 w140"
        :options="materialSelectItems"
      />
      <kw-input
        v-model="materialSearchValue"
        maxlength="100"
        dense
        clearable
        icon="search"
        class="ml8 w250"
        @click-icon="onClickMaterialSchPopup"
      />
      <!-- 관계구분 선택 -->
      <kw-select
        ref="materialRelTypeRef"
        v-model="materialRelType"
        dense
        class="ml12 w140"
        :label="$t('MSG_TXT_SEL_REL_TYPE')"
        :options="codes.PD_PDCT_REL_DV_CD"
        rules="required"
      />
    </template>
    <!-- 삭제 -->
    <kw-btn
      grid-action
      dense
      :label="$t('MSG_BTN_DEL')"
      :disable="grdMaterialRowCount === 0"
      @click="onClickMaterialDelRows"
    />
  </kw-action-top>
  <kw-grid
    ref="grdMaterialRef"
    name="grdMgtRelMaterial"
    :visible-rows="3"
    @init="initMaterialGrid"
  />
  <!-- 서비스 -->
  <h3>{{ $t('MSG_TXT_SERVICE') }}</h3>
  <kw-action-top>
    <template #left>
      <!-- 서비스 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_SVC_SEL') }}</span>
      <kw-select
        v-model="serviceSearchType"
        dense
        class="ml8 w120"
        :options="serviceSelectItems"
      />
      <kw-input
        v-model="serviceSearchValue"
        maxlength="100"
        dense
        clearable
        icon="search"
        class="ml8 w250"
        @click-icon="onClickServiceSchPopup"
      />
    </template>
    <!-- 삭제 -->
    <kw-btn
      grid-action
      dense
      :label="$t('MSG_BTN_DEL')"
      :disable="grdServiceRowCount === 0"
      @click="onClickServiceDelRows"
    />
  </kw-action-top>
  <kw-grid
    ref="grdServiceRef"
    name="grdMgtRelService"
    :visible-rows="3"
    @init="initServiceGrid"
  />
  <!-- 기준상품 관계설정 -->
  <h3>{{ $t('MSG_TXT_STD_PRD_SET_REL') }}</h3>
  <kw-action-top>
    <template #left>
      <!-- 기준상품 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_SEL_STD') }}</span>
      <kw-select
        v-model="standardSearchType"
        dense
        class="ml12 w140"
        :options="standardSelectItems"
      />
      <kw-input
        v-model="standardSearchValue"
        maxlength="100"
        dense
        clearable
        icon="search"
        class="ml8 w250"
        @click-icon="onClickStandardSchPopup"
      />
      <!-- 관계구분 선택 -->
      <kw-select
        ref="standardRelTypeRef"
        v-model="standardRelType"
        dense
        class="ml8 w140"
        :label="$t('MSG_TXT_SEL_REL_TYPE')"
        :options="codes.BASE_PD_REL_DV_CD"
        :placeholder="$t('MSG_TXT_SEL_REL_TYPE')"
        rules="required"
      />
    </template>
    <!-- 삭제 -->
    <kw-btn
      grid-action
      dense
      :label="$t('MSG_BTN_DEL')"
      :disable="grdStandardRowCount === 0"
      @click="onClickStandardDelRows"
    />
  </kw-action-top>
  <kw-grid
    ref="grdStandardRef"
    name="grdMgtRelStandard"
    :visible-rows="3"
    @init="initStandardGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { gridUtil, stringUtil, useGlobal, getComponentType, codeUtil } from 'kw-lib';
import { isEmpty, uniqBy } from 'lodash-es';
import { getCodeNames, getGridRowCount, pdMergeBy, setPdGridRows, onCellEditRelProdPeriod, getOverPeriodByRelProd } from '~/modules/sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

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
const grdMaterialRef = ref(getComponentType('KwGrid'));
const grdServiceRef = ref(getComponentType('KwGrid'));
const grdStandardRef = ref(getComponentType('KwGrid'));
const grdMaterialRowCount = ref(0);
const grdServiceRowCount = ref(0);
const grdStandardRowCount = ref(0);

const currentPdCd = ref();
const currentInitData = ref({});
const materialRelTypeRef = ref();
const standardRelTypeRef = ref();

const codes = await codeUtil.getMultiCodes('BASE_PD_REL_DV_CD', 'PD_PDCT_REL_DV_CD');
const materialSelectItems = ref([
  // 교재/자재명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_PD_BOK_MTR_NAME') },
  // 교재/자재코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_MATERIAL_CD') },
]);

const serviceSelectItems = ref([
  // 서비스명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_SVC_NAME') },
  // 서비스 코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_SVC_CODE') },
]);

const standardSelectItems = ref([
  // 기준상품명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_PD_STD_NAME') },
  // 기준상품 코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_PD_STD_CODE') },
]);

const materialSearchType = ref(pdConst.PD_SEARCH_NAME);
const materialSearchValue = ref();
const materialRelType = ref(codes.PD_PDCT_REL_DV_CD?.[0].codeId);
const serviceSearchType = ref(pdConst.PD_SEARCH_NAME);
const serviceSearchValue = ref();
const standardRelType = ref();
const standardSearchType = ref(pdConst.PD_SEARCH_NAME);
const standardSearchValue = ref();

const searchParams = ref({
  searchType: null,
  searchValue: null,
  exceptPdCd: null,
  pdTpCd: '',
});

async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  if (grdMaterialRef.value?.getView()) gridUtil.reset(grdMaterialRef.value.getView());
  if (grdServiceRef.value?.getView()) gridUtil.reset(grdServiceRef.value.getView());
  if (grdStandardRef.value?.getView()) gridUtil.reset(grdStandardRef.value.getView());
}

async function init() {
  const materialView = grdMaterialRef.value?.getView();
  if (materialView) gridUtil.init(materialView);
  const serviceView = grdServiceRef.value?.getView();
  if (serviceView) gridUtil.init(serviceView);
  const standardView = grdStandardRef.value?.getView();
  if (standardView) gridUtil.init(standardView);
}

async function getSaveData() {
  let rowValues = gridUtil.getAllRowValues(grdMaterialRef.value.getView());
  rowValues = pdMergeBy(rowValues, gridUtil.getAllRowValues(grdServiceRef.value.getView()));
  rowValues = pdMergeBy(rowValues, gridUtil.getAllRowValues(grdStandardRef.value.getView()));
  const rtnValues = { [pdConst.TBL_PD_REL]: rowValues ?? [] };
  // console.log('WwpdcStandardMgtMRelPrd - getSaveData - rtnValues : ', rtnValues);
  return rtnValues;
}

async function isModifiedProps() {
  return gridUtil.isModified(grdMaterialRef.value?.getView())
          || gridUtil.isModified(grdServiceRef.value?.getView())
          || gridUtil.isModified(grdStandardRef.value?.getView());
}

async function validateProps() {
  let isValid = true;
  const materialView = grdMaterialRef.value?.getView();
  const serviceView = grdServiceRef.value?.getView();
  const standardView = grdStandardRef.value?.getView();

  // 필수값 체크
  isValid = await gridUtil.validate(materialView, {
    isChangedOnly: false,
  });
  if (isValid) {
    isValid = await gridUtil.validate(serviceView, {
      isChangedOnly: false,
    });
  }
  if (isValid) {
    isValid = await gridUtil.validate(standardView, {
      isChangedOnly: false,
    });
  }

  if (isValid) {
    const materialRows = gridUtil.getAllRowValues(materialView);
    if (materialRows.length) {
      // 안분비율
      const sumDivisionRate = materialRows.reduce((tot, item) => tot + Number(item.diviRat), 0);
      if (sumDivisionRate > 100) {
        // 안분비율 합이 100%를 넘을 수 없습니다.
        notify(t('MSG_ALT_DIV_RTE_OVER_PER'));
        isValid = false;
      }
    }
  }

  // 적용일자 중복 체크
  if (isValid) isValid = await isOverPeriodCheck(materialView);
  if (isValid) isValid = await isOverPeriodCheck(serviceView);
  if (isValid) isValid = await isOverPeriodCheck(standardView);
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

async function onClickMaterialSchPopup() {
  if (!(await materialRelTypeRef.value.validate())) {
    return;
  }
  const view = grdMaterialRef.value.getView();
  searchParams.value.searchType = materialSearchType.value;
  searchParams.value.searchValue = materialSearchValue.value;
  // searchParams.value.pdTpCd = pdConst.PD_TP_CD_MATERIAL;
  const rtn = await modal({
    component: 'ZwpdcMaterialListP',
    componentProps: searchParams.value,
  });
  await insertCallbackRows(view, rtn, materialRelType.value);
  grdMaterialRowCount.value = getGridRowCount(view);
}

async function onClickServiceSchPopup() {
  const view = grdServiceRef.value.getView();
  searchParams.value.searchType = serviceSearchType.value;
  searchParams.value.searchValue = serviceSearchValue.value;
  searchParams.value.pdTpCd = pdConst.PD_TP_CD_SERVICE;

  const materialCds = gridUtil.getAllRowValues(grdMaterialRef.value.getView())
    ?.reduce((rtn, item) => { rtn.push({ codeId: item.pdCd, codeName: item.pdNm }); return rtn; }, []);
  const filteredMaterialCds = materialCds.length ? uniqBy(materialCds, 'codeId') : [];
  const rtn = await modal({
    component: 'ZwpdcServiceSimpleListP',
    componentProps: { ...searchParams.value, relationCds: filteredMaterialCds },
  });
  await insertCallbackRows(view, rtn, pdConst.PD_REL_TP_CD_P_TO_S);
  grdServiceRowCount.value = getGridRowCount(view);
}

async function onClickStandardSchPopup() {
  if (!(await standardRelTypeRef.value.validate())) {
    return;
  }
  const view = grdStandardRef.value.getView();
  searchParams.value.searchType = pdConst.PD_SEARCH_NAME;
  searchParams.value.searchValue = standardSearchValue.value;
  searchParams.value.pdTpCd = pdConst.PD_TP_CD_STANDARD;
  searchParams.value.exceptPdCd = currentPdCd.value;
  const rtn = await modal({
    component: 'ZwpdcStandardSimpleListP',
    componentProps: searchParams.value,
  });
  await insertCallbackRows(view, rtn, standardRelType.value);
  grdStandardRowCount.value = getGridRowCount(view);
}

async function onClickMaterialDelRows() {
  const view = grdMaterialRef.value.getView();
  await deleteCheckedRows(view);
  grdMaterialRowCount.value = getGridRowCount(view);
}

async function onClickServiceDelRows() {
  const view = grdServiceRef.value.getView();
  await deleteCheckedRows(view);
  grdServiceRowCount.value = getGridRowCount(view);
}

async function onClickStandardDelRows() {
  const view = grdStandardRef.value.getView();
  await deleteCheckedRows(view);
  grdStandardRowCount.value = getGridRowCount(view);
}

async function initGridRows() {
  const products = currentInitData.value[pdConst.RELATION_PRODUCTS];
  // console.log('WwpdcStandardMgtMRelPrd - initGridRows - products : ', products);
  const materialView = grdMaterialRef.value?.getView();
  if (materialView) {
    const materialCodeValues = codes.PD_PDCT_REL_DV_CD
      .reduce((rtns, code) => { rtns.push(code.codeId); return rtns; }, []);
    const materialRows = products
      ?.filter((item) => materialCodeValues.includes(item[pdConst.PD_REL_TP_CD]));
    await setPdGridRows(materialView, materialRows, pdConst.REL_PD_ID, [], true);
    grdMaterialRowCount.value = getGridRowCount(materialView);
  }

  const serviceView = grdServiceRef.value?.getView();
  if (serviceView) {
    const serviceRows = products
      ?.filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_S);
    await setPdGridRows(serviceView, serviceRows, pdConst.REL_PD_ID, [], true);
    grdServiceRowCount.value = getGridRowCount(serviceView);
  }

  const standardView = grdStandardRef.value?.getView();
  if (standardView) {
    const standardCodeValues = codes.BASE_PD_REL_DV_CD
      .reduce((rtns, code) => { rtns.push(code.codeId); return rtns; }, []);
    const standardRows = products
      ?.filter((item) => standardCodeValues.includes(item[pdConst.PD_REL_TP_CD]));
    await setPdGridRows(standardView, standardRows, pdConst.REL_PD_ID, [], true);
    grdStandardRowCount.value = getGridRowCount(standardView);
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
  currentInitData.value = initData;
  initGridRows();
}, { deep: true });

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------
async function initMaterialGrid(data, view) {
  const columns = [
    // 관계구분
    { fieldName: 'pdRelTpCd', header: t('MSG_TXT_RELATION_CLSF'), width: '85', styleName: 'text-center', options: codes.PD_PDCT_REL_DV_CD, editable: false },
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '85', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD, editable: false },
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
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_BOK_MTR_TYPE'), width: '170', editable: false },
    // 교재/자재명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_BOK_MTR_NAME'), width: '200', editable: false },
    // 제품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '120', styleName: 'text-center', editable: false },
    // 자재코드
    { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '140', styleName: 'text-center', editable: false },
    // 배송회차
    { fieldName: 'sppTn',
      header: t('MSG_TXT_DELIVERY_NUM'),
      width: '87',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '##0', maxLength: 3, positiveOnly: true, maxLengthExceptComma: true },
      dataType: 'number',
    },
    // 제품수량(개)
    { fieldName: 'itmQty',
      header: t('MSG_TXT_PRD_COUNT_EA'),
      width: '87',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0', maxLength: 12, positiveOnly: true, maxLengthExceptComma: true },
      dataType: 'number',
    },
    // 판매금액
    { fieldName: 'fnlVal',
      header: t('MSG_TXT_SALE_PRICE'),
      width: '107',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0.##', maxLength: 12, positiveOnly: true, maxLengthExceptComma: true },
      dataType: 'number' },
    // 공급가액
    { fieldName: 'splAmt',
      header: t('MSG_TXT_SUPPLY_AMOUNT'),
      width: '107',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0.##', maxLength: 12, positiveOnly: true, maxLengthExceptComma: true },
      dataType: 'number' },
    // 부가세액
    { fieldName: 'vat',
      header: t('MSG_TXT_VAT_AMOUNT'),
      width: '107',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '#,##0.##', maxLength: 12, positiveOnly: true, maxLengthExceptComma: true },
      dataType: 'number' },
    // 안분비율(%)
    { fieldName: 'diviRat',
      header: t('MSG_TXT_PROPORTIONAL_DV_RT'),
      width: '107',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '##0', maxLength: 3, positiveOnly: true },
      dataType: 'number',
    },
    // 잔액산입
    { fieldName: 'blamInptYn',
      header: t('MSG_TXT_CHANGE_COUNTING'),
      width: '87',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: props.codes?.COD_YN },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: pdConst.REL_PD_ID });
  fields.push({ fieldName: pdConst.REL_OJ_PD_CD });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;
  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    await onCellEditRelProdPeriod(view, grid, itemIndex, row, fieldIndex);
  };
}

async function initServiceGrid(data, view) {
  // console.log('props.codes : ', props.codes.SV_VST_PRD_CD);
  const columns = [
    // 필수여부
    { fieldName: 'mndtSvYn', header: t('MSG_TXT_NCSR_YN'), width: '85', styleName: 'text-center', editable: false },
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '85', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD, editable: false },
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
    // 서비스 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_SVC_CATG'), width: '170', editable: false },
    // 서비스명
    { fieldName: 'pdNm', header: t('MSG_TXT_SVC_NAME'), width: '200', editable: false },
    // 서비스코드
    { fieldName: 'pdCd', header: t('MSG_TXT_SVC_CODE'), width: '120', styleName: 'text-center', editable: false },
    // 주기단위/방문주기
    { fieldName: 'svVstPrdCdSet',
      header: t('MSG_TXT_PD_UNIT_VISIT_PERI'),
      width: '187',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index) {
        const svPrdUnitCd = getCodeNames(props.codes?.SV_PRD_UNIT_CD, grid.getValue(index.itemIndex, 'svPrdUnitCd'));
        const svVstPrdCd = getCodeNames(props.codes?.SV_VST_PRD_CD, grid.getValue(index.itemIndex, 'svVstPrdCd'));
        if (svPrdUnitCd || svVstPrdCd) {
          return `${svPrdUnitCd} / ${svVstPrdCd}`;
        }
        return '';
      },
    },
    // 주기단위/택배주기
    { fieldName: 'pcsvPrdCdSet',
      header: t('MSG_TXT_PD_UNIT_PARCEL_PERI'),
      width: '180',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const svPrdUnitCd = getCodeNames(props.codes?.SV_PRD_UNIT_CD, grid.getValue(index.itemIndex, 'svPrdUnitCd'));
        const pcsvPrdCd = getCodeNames(props.codes?.SV_VST_PRD_CD, grid.getValue(index.itemIndex, 'pcsvPrdCd'));
        if (svPrdUnitCd || pcsvPrdCd) {
          return `${svPrdUnitCd} / ${pcsvPrdCd}`;
        }
        return '';
      },
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: pdConst.REL_PD_ID });
  fields.push({ fieldName: pdConst.PD_REL_TP_CD });
  fields.push({ fieldName: pdConst.REL_OJ_PD_CD });
  fields.push({ fieldName: 'svPrdUnitCd' });
  fields.push({ fieldName: 'svVstPrdCd' });
  fields.push({ fieldName: 'pcsvPrdCd' });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    await onCellEditRelProdPeriod(view, grid, itemIndex, row, fieldIndex);
  };
}
async function initStandardGrid(data, view) {
  const columns = [
    // 관계구분
    { fieldName: 'pdRelTpCd', header: t('MSG_TXT_RELATION_CLSF'), width: '85', styleName: 'text-center', options: codes.BASE_PD_REL_DV_CD, editable: false },
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '85', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD, editable: false },
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
    // 서비스명
    { fieldName: 'svPdNm',
      header: t('MSG_TXT_SVC_NAME'),
      width: '165',
      editable: true,
      styleName: 'text-left rg-button-icon--search',
      editor: { maxLength: 10 },
      button: 'action',
    },
    // 서비스코드
    { fieldName: 'svPdCd', header: t('MSG_TXT_SVC_CODE'), width: '120', editable: false, styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: pdConst.REL_PD_ID });
  fields.push({ fieldName: pdConst.REL_OJ_PD_CD });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;

  view.onCellButtonClicked = async (grid, { column, itemIndex }) => {
    if (column === 'svPdNm') {
      const svPdNm = grid.getValue(itemIndex, 'svPdNm');
      const { payload } = await modal({
        component: 'ZwpdcServiceListP',
        componentProps: { searchType: pdConst.PD_SEARCH_NAME, searchValue: svPdNm },
      });
      if (payload) {
        const row = Array.isArray(payload) ? payload[0] : payload;
        data.setValue(itemIndex, 'svPdNm', row.pdNm);
        data.setValue(itemIndex, 'svPdCd', row.pdCd);
      }
    }
  };
  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    await onCellEditRelProdPeriod(view, grid, itemIndex, row, fieldIndex);
  };

  await initGridRows();
  await init();
}
</script>
