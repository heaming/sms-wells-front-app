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
        class="ml12 w120"
        :options="materialSelectItems"
      />
      <kw-input
        v-model="searchParams.searchValue"
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
      :disable="!currentPdCd || grdRowCount === 0"
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
import { gridUtil, codeUtil, getComponentType, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import { getAlreadyItems, getGridRowCount } from '~/modules/sms-common/product/utils/pdUtil';
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
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_PROD_CD') },
]);
const codes = await codeUtil.getMultiCodes('PD_TEMP_SAVE_CD');

async function isModifiedProps() {
  return gridUtil.isModified(grdMainRef.value?.getView());
}

async function validateProps() {
  return true;
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
  await gridUtil.confirmDeleteCheckedRows(view);
  grdRowCount.value = getGridRowCount(view);
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
  if (!view.getCheckedRows().length) {
    notify(t('MSG_ALT_SELECT_ONE_ROW', [t('MSG_TXT_PD_SCH_BS_INFO')]));
    return;
  }
  if (view.getCheckedRows().length > 1) {
    notify(t('MSG_ALT_SELT_ONE_ITEM'));
    return;
  }
  const checkedRows = gridUtil.getCheckedRowValues(view);
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
  if (rtn.result) {
    console.log('rtn.payload : ', rtn.payload);
    if (Array.isArray(rtn.payload) && rtn.payload.length > 1) {
      const data = view.getDataSource();
      const rows = rtn.payload.map((item) => ({
        ...item,
        [pdConst.REL_OJ_PD_CD]: item.pdCd,
        [pdConst.PD_REL_TP_CD]: pdConst.PD_REL_TP_CD_PD_TO_FL }));
      const okRows = await getCheckAndNotExistRows(view, rows);
      if (okRows && okRows.length) {
        await data.insertRows(0, okRows);
        await gridUtil.focusCellInput(view, 0);
      }
    } else {
      const row = Array.isArray(rtn.payload) ? rtn.payload[0] : rtn.payload;
      row[pdConst.REL_OJ_PD_CD] = row.pdCd;
      row[pdConst.PD_REL_TP_CD] = pdConst.PD_REL_TP_CD_PD_TO_FL;
      const okRows = await getCheckAndNotExistRows(view, [row]);
      if (okRows && okRows.length) {
        await gridUtil.insertRowAndFocus(view, 0, okRows[0]);
      }
    }
  }
  grdRowCount.value = getGridRowCount(view);
}

async function getCheckAndNotExistRows(view, rows) {
  const alreadyItems = getAlreadyItems(view, rows, 'pdCd');
  if (rows.length === alreadyItems.length) {
    notify(t('MSG_ALT_ALREADY_RGST', [t('MSG_TXT_PRDT')]));
    return [];
  }
  if (alreadyItems.length > 0) {
    if (alreadyItems.length === 1) {
      notify(t('MSG_ALT_ALREADY_RGST_CUT', [alreadyItems[0].pdCd]));
    } else {
      notify(t('MSG_ALT_ALREADY_RGST_CUT', [t('MSG_TXT_EXID_CNT', [alreadyItems[0].pdCd, alreadyItems.length - 1])]));
    }
    const alreadyPdCds = alreadyItems.reduce((rtns, item) => { rtns.push(item.pdCd); return rtns; }, []);
    return rows.reduce((rtns, item) => {
      if (!alreadyPdCds.includes(item.pdCd)) {
        rtns.push(item);
      }
      return rtns;
    }, []);
  }
  return rows;
}

async function initGridRows() {
  const products = cloneDeep(currentInitData.value?.[pdConst.RELATION_PRODUCTS]);
  // console.log('WwpdcServiceMgtMFlt - initGridRows - products : ', products);
  const materialView = grdMainRef.value?.getView();
  if (materialView) {
    materialView.getDataSource().clearRows();
    materialView.getDataSource().setRows(products // 상품-필터
      ?.filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_PD_TO_FL));
    materialView.resetCurrent();
    grdRowCount.value = getGridRowCount(materialView);
  }
}

async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
}

await initProps();

watch(() => props.pdCd, (pdCd) => { currentPdCd.value = pdCd; });
watch(() => props.initData, (initData) => { currentInitData.value = initData; initGridRows(); }, { deep: true });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrid(data, view) {
  const columns = [
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '135', styleName: 'text-center', options: codes.PD_TEMP_SAVE_CD },
    // 교재/자재 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_BOK_MTR_TYPE'), width: '371' },
    // 교재/자재명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_BOK_MTR_NAME'), width: '306' },
    // 제품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '185', styleName: 'text-center' },
    // 자재코드
    { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '187', styleName: 'text-center' },
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
  await init();
}
</script>
<style scoped></style>
