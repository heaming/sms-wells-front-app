<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcCompositionMgtMRel - 기준상품 등록/변경 - 연결상품 선택 ( W-PD-U-0010M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 연결상품 선택 프로그램
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
      dense
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
      dense
      :label="$t('MSG_BTN_DEL')"
      @click="onClickServiceDelRows"
    />
  </kw-action-top>
  <kw-grid
    ref="grdServiceRef"
    :visible-rows="3"
    @init="initServiceGrid"
  />
  <!-- 동시구매가능 기준상품 -->
  <h3>{{ $t('MSG_TXT_PD_PUR_SIM') }}</h3>
  <kw-action-top v-show="!props.readonly">
    <template #left>
      <!-- 기준상품 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_SEL_STD') }}</span>
      <kw-select
        v-model="standardSearchType"
        dense
        class="ml12 w120"
        :options="standardSelectItems"
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
      dense
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
import { isEmpty, cloneDeep } from 'lodash-es';
import { getGridRowCount, pdMergeBy, getCodeNames } from '~/modules/sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

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

const { modal } = useGlobal();
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

const materialSearchType = ref(pdConst.PD_SEARCH_NAME);
const materialSearchValue = ref();
const serviceSearchType = ref(pdConst.PD_SEARCH_NAME);
const serviceSearchValue = ref();
const standardSearchType = ref(pdConst.PD_SEARCH_NAME);
const standardSearchValue = ref();

const searchParams = ref({
  searchType: null,
  searchValue: null,
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
  if (materialView) await gridUtil.init(materialView);
  const serviceView = grdServiceRef.value?.getView();
  if (serviceView) await gridUtil.init(serviceView);
  const standardView = grdStandardRef.value?.getView();
  if (standardView) await gridUtil.init(standardView);
}

async function getSaveData() {
  let rowValues = gridUtil.getAllRowValues(grdMaterialRef.value.getView());
  rowValues = pdMergeBy(rowValues, gridUtil.getAllRowValues(grdServiceRef.value.getView()));
  rowValues = pdMergeBy(rowValues, gridUtil.getAllRowValues(grdStandardRef.value.getView()));
  const rtnValues = { [pdConst.TBL_PD_REL]: rowValues ?? [] };
  if (rtnValues[pdConst.TBL_PD_REL]) {
    rtnValues[pdConst.RELATION_PRODUCTS] = cloneDeep(rtnValues[pdConst.TBL_PD_REL]);
  }
  return rtnValues;
}

async function isModifiedProps() {
  return gridUtil.isModified(grdMaterialRef.value?.getView())
          || gridUtil.isModified(grdServiceRef.value?.getView())
          || gridUtil.isModified(grdStandardRef.value?.getView());
}

async function validateProps() {
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
  await gridUtil.confirmDeleteCheckedRows(view);
}

async function onClickMaterialSchPopup() {
  const view = grdMaterialRef.value.getView();
  searchParams.value.searchType = materialSearchType.value;
  searchParams.value.searchValue = materialSearchValue.value;
  const rtn = await modal({
    component: 'ZwpdcMaterialListP',
    componentProps: searchParams.value,
  });
  await insertCallbackRows(view, rtn, pdConst.PD_REL_TP_CD_P_TO_PD);
  grdMaterialRowCount.value = getGridRowCount(view);
}

async function onClickServiceSchPopup() {
  const view = grdServiceRef.value.getView();
  searchParams.value.searchType = serviceSearchType.value;
  searchParams.value.searchValue = serviceSearchValue.value;
  const rtn = await modal({
    component: 'ZwpdcServiceSimpleListP',
    componentProps: searchParams.value,
  });
  await insertCallbackRows(view, rtn, pdConst.PD_REL_TP_CD_P_TO_S);
  grdServiceRowCount.value = getGridRowCount(view);
}

async function onClickStandardSchPopup() {
  const view = grdStandardRef.value.getView();
  searchParams.value.searchType = standardSearchType.value;
  searchParams.value.searchValue = standardSearchValue.value;
  const rtn = await modal({
    component: 'ZwpdcStandardSimpleListP',
    componentProps: searchParams.value,
  });
  await insertCallbackRows(view, rtn, pdConst.PD_REL_TP_CD_P_TO_P);
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
  if (isEmpty(await products)) {
    return;
  }
  // console.log('WwpdcCompositionMgtMRel - initGridRows - products : ', products);
  const materialView = grdMaterialRef.value?.getView();
  if (materialView) {
    materialView.getDataSource().clearRows();
    materialView.getDataSource().setRows(products
      .filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_PD));
    materialView.resetCurrent();
    grdMaterialRowCount.value = getGridRowCount(materialView);
  }

  const serviceView = grdServiceRef.value?.getView();
  if (serviceView) {
    serviceView.getDataSource().clearRows();
    serviceView.getDataSource().setRows(products
      .filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_S));
    serviceView.resetCurrent();
    grdServiceRowCount.value = getGridRowCount(serviceView);
  }

  const standardView = grdStandardRef.value?.getView();
  if (standardView) {
    standardView.getDataSource().clearRows();
    standardView.getDataSource().setRows(products
      .filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_P));
    standardView.resetCurrent();
    grdStandardRowCount.value = getGridRowCount(standardView);
  }
}

async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = cloneDeep(initData);
}

await initProps();

watch(() => props.pdCd, (pdCd) => { currentPdCd.value = pdCd; });
watch(() => props.initData, (initData) => {
  currentInitData.value = cloneDeep(initData);
  initGridRows();
}, { deep: true });

onMounted(async () => {
  await initGridRows();
});

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------
async function initMaterialGrid(data, view) {
  const columns = [
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '135', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD },
    // 교재/자재 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_BOK_MTR_TYPE'), width: '371' },
    // 교재/자재명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_BOK_MTR_NAME'), width: '306' },
    // 상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '185', styleName: 'text-center' },
    // 학습/전집/기기구분
    { fieldName: 'lrnnCocnMchnTpCd', header: t('MSG_TXT_PD_LRN_COLLE_DV_TYP'), width: '187', styleName: 'text-center', options: props.codes?.LRNN_COCN_MCHN_TP_CD },
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
    // 회수/기본주기/주기단위
    { fieldName: 'lrnnSet',
      header: t('MSG_TXT_PD_RECAL_DUR_UNIT'),
      width: '187',
      styleName: 'text-center',
      options: props.codes?.SV_VST_PRD_CD,
      displayCallback(grid, index) {
        const lrnnTotTms = grid.getValue(index.itemIndex, 'lrnnTotTms');
        const lrnnSvPrd = grid.getValue(index.itemIndex, 'lrnnSvPrd');
        const lrnnSvPrdUnitCd = getCodeNames(props.codes, grid.getValue(index.itemIndex, 'lrnnSvPrdUnitCd'), 'LRNN_SV_PRD_UNIT_CD');
        if (lrnnTotTms || lrnnSvPrd || lrnnSvPrdUnitCd) {
          return `${lrnnTotTms}/${lrnnSvPrd}/${lrnnSvPrdUnitCd}`;
        }
        return '';
      },
    },
    // 학습시간+학습시간단위
    { fieldName: 'lrnnSet2',
      header: t('MSG_TXT_PD_LRN_TME_N_UNT'),
      width: '187',
      styleName: 'text-center',
      options: props.codes?.SV_PRD_UNIT_CD,
      displayCallback(grid, index) {
        const lrnnHh = grid.getValue(index.itemIndex, 'lrnnHh');
        const lrnnHhUnitCd = getCodeNames(props.codes, grid.getValue(index.itemIndex, 'lrnnHhUnitCd'), 'LRNN_HH_UNIT_CD');
        if (lrnnHh || lrnnHhUnitCd) {
          return `${lrnnHh}+${lrnnHhUnitCd}`;
        }
        return '';
      },
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: pdConst.REL_PD_ID });
  fields.push({ fieldName: pdConst.PD_REL_TP_CD });
  fields.push({ fieldName: pdConst.REL_OJ_PD_CD });
  // 회수
  fields.push({ fieldName: 'lrnnTotTms' });
  // 기본주기
  fields.push({ fieldName: 'lrnnSvPrd' });
  // 주기단위
  fields.push({ fieldName: 'lrnnSvPrdUnitCd' });
  // 학습시간
  fields.push({ fieldName: 'lrnnHh' });
  // 학습시간단위
  fields.push({ fieldName: 'lrnnHhUnitCd' });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = false;
}

async function initStandardGrid(data, view) {
  // console.log('props.codes?.SELL_CHNL_DV_CD : ', props.codes?.SELL_CHNL_DTL_CD);
  const columns = [
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '135', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD },
    // 기준상품 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_STD_TYPE'), width: '371' },
    // 기준상품명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '306' },
    // 기준상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '185', styleName: 'text-center' },
    // 판매유형
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '187', styleName: 'text-center', options: props.codes?.SELL_TP_CD },
    // 판매채널
    { fieldName: 'channelId', header: t('MSG_TXT_SEL_CHNL'), width: '187', styleName: 'text-center', options: props.codes?.SELL_CHNL_DTL_CD },
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
</script>
