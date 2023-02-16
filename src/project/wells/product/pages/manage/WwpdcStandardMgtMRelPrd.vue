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
  <kw-action-top v-show="!props.readonly">
    <template #left>
      <!-- 교재/자재 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_MNL_MAT_SEL') }}</span>
      <kw-select
        v-model="materialSearchType"
        dense
        class="ml12 w120"
        :options="materialSelectItems"
      />
      <kw-input
        v-model="materialSearchValue"
        dense
        clearable
        icon="search"
        class="ml8 w250"
        @click-icon="onClickMaterialSchPopup"
      />
    </template>
    <!-- 삭제 -->
    <kw-btn
      grid-action
      :label="$t('MSG_BTN_DEL')"
      @click="onClickMaterialDelRows"
    />
  </kw-action-top>
  <kw-grid
    ref="grdMaterialRef"
    :visible-rows="3"
    @init="initMaterialGrid"
  />
  <!-- 서비스 -->
  <h3>{{ $t('MSG_TXT_SERVICE') }}</h3>
  <kw-action-top v-show="!props.readonly">
    <template #left>
      <!-- 서비스 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_SVC_SEL') }}</span>
      <kw-select
        v-model="serviceSearchType"
        dense
        class="ml12 w120"
        :options="serviceSelectItems"
      />
      <kw-input
        v-model="serviceSearchValue"
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
      :label="$t('MSG_BTN_DEL')"
      @click="onClickServiceDelRows"
    />
  </kw-action-top>
  <kw-grid
    ref="grdServiceRef"
    :visible-rows="3"
    @init="initServiceGrid"
  />
  <!-- 기준상품 관계설정 -->
  <h3>{{ $t('MSG_TXT_STD_PRD_SET_REL') }}</h3>
  <kw-action-top v-show="!props.readonly">
    <template #left>
      <!-- 기준상품 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_SEL_STD') }}</span>
      <!-- 관계구분 선택 -->
      <kw-select
        v-model="standardSearchType"
        dense
        class="ml12 w140"
        :options="standardSelectItems"
        :placeholder="$t('MSG_TXT_SEL_REL_TYPE')"
      />
      <kw-input
        v-model="standardSearchValue"
        dense
        clearable
        icon="search"
        class="ml8 w250"
        @click-icon="onClickStandardSchPopup"
      />
    </template>
    <!-- 삭제 -->
    <kw-btn
      v-show="!props.readonly"
      grid-action
      :label="$t('MSG_BTN_DEL')"
      @click="onClickStandardDelRows"
    />
  </kw-action-top>
  <kw-grid
    ref="grdStandardRef"
    :visible-rows="3"
    @init="initStandardGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { gridUtil, useGlobal, getComponentType } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import { pdMergeBy } from '~/modules/sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

/* eslint-disable no-use-before-define */
defineExpose({
  getSaveData, isModifiedProps, validateProps,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  codes: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
});

const { modal } = useGlobal();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMaterialRef = ref(getComponentType('KwGrid'));
const grdServiceRef = ref(getComponentType('KwGrid'));
const grdStandardRef = ref(getComponentType('KwGrid'));

const currentPdCd = ref();
const currentInitData = ref({});

const materialSelectItems = reactive([
  // 교재/자재명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_PD_BOK_MTR_NAME') },
  // 교재/자재코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_PROD_CD') },
]);

const serviceSelectItems = reactive([
  // 서비스명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_SVC_NAME') },
  // 서비스 코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_SVC_CODE') },
]);

const standardSelectItems = reactive([
  // 기준상품명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_PD_STD_NAME') },
  // 기준상품코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_PD_STD_CODE') },
]);

const materialSearchType = ref();
const materialSearchValue = ref();
const serviceSearchType = ref();
const serviceSearchValue = ref();
const standardSearchType = ref();
const standardSearchValue = ref();

const searchParams = ref({
  searchType: null,
  searchValue: null,
  pdTpCd: '',
});

async function getSaveData() {
  let rowValues = gridUtil.getAllRowValues(grdMaterialRef.value.getView());
  rowValues = pdMergeBy(rowValues, gridUtil.getAllRowValues(grdServiceRef.value.getView()));
  rowValues = pdMergeBy(rowValues, gridUtil.getAllRowValues(grdStandardRef.value.getView()));
  const rtnValues = { [pdConst.TBL_PD_REL]: rowValues ?? [] };
  // console.log('WwpdcStandardMgtMRelPrd - getSaveData - rtnValues : ', rtnValues);
  return rtnValues;
}

function isModifiedProps() {
  return true;
}

function validateProps() {
  return true;
}

async function insertCallbackRows(view, rtn, pdRelTpCd) {
  if (rtn.result) {
    if (Array.isArray(rtn.payload) && rtn.payload.length > 1) {
      const data = view.getDataSource();
      const rows = rtn.payload.map((item) => ({
        ...item, [pdConst.REL_OJ_PD_CD]: item.pdCd, [pdConst.PD_REL_TP_CD]: pdRelTpCd }));
      await data.insertRows(0, rows);
    } else if (rtn.payload.payload) {
      // TODO 삭제 필요
      const data = view.getDataSource();
      const rows = rtn.payload.payload.map((item) => ({
        ...item, [pdConst.REL_OJ_PD_CD]: item.pdCd, [pdConst.PD_REL_TP_CD]: pdRelTpCd }));
      await data.insertRows(0, rows);
    } else if (rtn.payload.checkedRows) {
      // TODO 삭제 필요
      const data = view.getDataSource();
      const rows = rtn.payload.checkedRows.map((item) => ({
        ...item, [pdConst.REL_OJ_PD_CD]: item.pdCd, [pdConst.PD_REL_TP_CD]: pdRelTpCd }));
      await data.insertRows(0, rows);
    } else {
      const row = Array.isArray(rtn.payload) ? rtn.payload[0] : rtn.payload;
      row[pdConst.PD_REL_TP_CD] = pdRelTpCd;
      row[pdConst.REL_OJ_PD_CD] = row.pdCd;
      await gridUtil.insertRowAndFocus(view, 0, row);
    }
  }
}

async function deleteCheckedRows(view) {
  gridUtil.deleteCheckedRows(view);
}

async function onClickMaterialSchPopup() {
  const view = grdMaterialRef.value.getView();
  searchParams.value.searchType = materialSearchType.value;
  searchParams.value.searchValue = materialSearchValue.value;
  // searchParams.value.pdTpCd = pdConst.PD_TP_CD_MATERIAL;
  const rtn = await modal({
    component: 'ZpdcMaterialsSelectP',
    componentProps: searchParams.value,
  });
  await insertCallbackRows(view, rtn, pdConst.PD_REL_TP_CD_P_TO_PD);
}

async function onClickServiceSchPopup() {
  const view = grdServiceRef.value.getView();
  searchParams.value.searchType = serviceSearchType.value;
  searchParams.value.searchValue = serviceSearchValue.value;
  searchParams.value.pdTpCd = pdConst.PD_TP_CD_SERVICE;
  const rtn = await modal({
    component: 'ZwpdcServiceSimpleListP',
    componentProps: searchParams.value,
  });
  await insertCallbackRows(view, rtn, pdConst.PD_REL_TP_CD_P_TO_S);
}

async function onClickStandardSchPopup() {
  const view = grdStandardRef.value.getView();
  searchParams.value.searchType = standardSearchType.value;
  searchParams.value.searchValue = standardSearchValue.value;
  searchParams.value.pdTpCd = pdConst.PD_TP_CD_STANDARD;
  const rtn = await modal({
    component: 'ZwpdcStandardSimpleListP',
    componentProps: searchParams.value,
  });
  await insertCallbackRows(view, rtn, pdConst.PD_REL_TP_CD_P_TO_P);
}

async function onClickMaterialDelRows() {
  const view = grdMaterialRef.value.getView();
  await deleteCheckedRows(view);
}

async function onClickServiceDelRows() {
  const view = grdServiceRef.value.getView();
  await deleteCheckedRows(view);
}

async function onClickStandardDelRows() {
  const view = grdStandardRef.value.getView();
  await deleteCheckedRows(view);
}

async function initGridRows() {
  const products = currentInitData.value[pdConst.RELATION_PRODUCTS];
  if (isEmpty(await products)) {
    return;
  }

  const materialView = grdMaterialRef.value?.getView();
  if (materialView) {
    materialView.getDataSource().setRows(products
      .filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_PD));
    materialView.resetCurrent();
  }

  const serviceView = grdServiceRef.value?.getView();
  if (serviceView) {
    serviceView.getDataSource().setRows(products
      .filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_S));
    serviceView.resetCurrent();
  }

  const standardView = grdStandardRef.value?.getView();
  if (standardView) {
    standardView.getDataSource().setRows(products
      .filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_P));
    standardView.resetCurrent();
  }
}

async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  await initGridRows();
}

await initProps();

watch(() => props.pdCd, () => { initProps(); });
watch(() => props.initData, () => { initProps(); }, { deep: true });

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------
async function initMaterialGrid(data, view) {
  const columns = [
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '105', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD },
    // 교재/자재 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_BOK_MTR_TYPE'), width: '201' },
    // 교재/자재명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_BOK_MTR_NAME'), width: '206' },
    // 제품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '85', styleName: 'text-center' },
    // 자재코드
    { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '87', styleName: 'text-center' },
    // 제품수량(개)
    { fieldName: 'aaa', header: t('MSG_TXT_PRD_COUNT_EA'), width: '87', styleName: 'text-center' },
    // 판매금액
    { fieldName: 'bbb', header: t('MSG_TXT_SALE_PRICE'), width: '107', styleName: 'text-center' },
    // 공급가액
    { fieldName: 'ccc', header: t('MSG_TXT_SUPPLY_AMOUNT'), width: '107', styleName: 'text-center' },
    // 부가세액
    { fieldName: 'ddd', header: t('MSG_TXT_VAT_AMOUNT'), width: '107', styleName: 'text-center' },
    // 안분비율(%)
    { fieldName: 'eee', header: t('MSG_TXT_PROPORTIONAL_DV_RT'), width: '107', styleName: 'text-center' },
    // 잔액산입
    { fieldName: 'fff', header: t('MSG_TXT_CHANGE_COUNTING'), width: '87', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: pdConst.REL_PD_ID });
  fields.push({ fieldName: pdConst.PD_REL_TP_CD });
  fields.push({ fieldName: pdConst.REL_OJ_PD_CD });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = false;
}

async function initServiceGrid(data, view) {
  // console.log('props.codes : ', props.codes.SV_VST_PRD_CD);
  const columns = [
    // 필수여부
    { fieldName: 'mndtSvYn', header: t('MSG_TXT_NCSR_YN'), width: '95', styleName: 'text-center' },
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '135', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD },
    // 서비스 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_SVC_CATG'), width: '371' },
    // 서비스명
    { fieldName: 'pdNm', header: t('MSG_TXT_SVC_NAME'), width: '306' },
    // 서비스코드
    { fieldName: 'pdCd', header: t('MSG_TXT_SVC_CODE'), width: '185', styleName: 'text-center' },
    // 주기단위/방문주기
    { fieldName: 'svVstPrdCd', header: t('MSG_TXT_PD_UNIT_VISIT_PERI'), width: '187', styleName: 'text-center', options: props.codes?.SV_VST_PRD_CD },
    // 주기단위/택배주기
    { fieldName: 'pcsvPrdCd', header: t('MSG_TXT_PD_UNIT_PARCEL_PERI'), width: '187', styleName: 'text-center', options: props.codes?.SV_VST_PRD_CD },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: pdConst.REL_PD_ID });
  fields.push({ fieldName: pdConst.PD_REL_TP_CD });
  fields.push({ fieldName: pdConst.REL_OJ_PD_CD });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = false;
}
async function initStandardGrid(data, view) {
  const columns = [
    // 관계구분
    { fieldName: 'relType', header: t('MSG_TXT_RELATION_CLSF'), width: '127', styleName: 'text-center' },
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '135', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD },
    // 기준상품 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_STD_TYPE'), width: '371' },
    // 기준상품명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '306' },
    // 기준상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '125', styleName: 'text-center' },
    // 판매유형
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '187', styleName: 'text-center', options: props.codes?.SELL_TP_CD },
    // 서비스명
    { fieldName: 'pdServiceNm', header: t('MSG_TXT_SVC_NAME'), width: '306' },
    // 서비스코드
    { fieldName: 'pdServiceCd', header: t('MSG_TXT_SVC_CODE'), width: '125' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: pdConst.REL_PD_ID });
  fields.push({ fieldName: pdConst.PD_REL_TP_CD });
  fields.push({ fieldName: pdConst.REL_OJ_PD_CD });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = false;

  await initGridRows();
}
</script>
