<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcServiceMgtMFlt - 서비스 관리 - 서비스 등록/변경 - 상품필터 교체관리 ( W-PD-U-0022M01 )
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
      dense
      :disable="grdRowCount === 0"
      :label="$t('MSG_BTN_DEL')"
    />
    <kw-separator
      spaced
      vertical
      inset
    />
    <!-- 정기B/S투입 필터/부품 연결 -->
    <kw-btn
      dense
      :label="$t('MSG_TXT_PD_SCH_BS_REL_PART')"
    />
    <!-- 정기B/S투입정보 -->
    <kw-btn
      dense
      :label="$t('MSG_TXT_PD_SCH_BS_INFO')"
    />
  </kw-action-top>
  <kw-grid
    ref="grdMainRef"
    @init="initGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { /* codeUtil, */ getComponentType, useGlobal, gridUtil } from 'kw-lib';
import { clone } from 'lodash-es';
import { getGridRowCount } from '~/modules/sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

/* eslint-disable no-use-before-define */
defineExpose({
  isModifiedProps, validateProps, resetData, getSaveData,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
});

const { t } = useI18n();
const { modal } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdRowCount = ref(0);
const currentPdCd = ref();
const currentInitData = ref({});
const searchParams = ref({
  searchType: null,
  searchValue: null,
});

const materialSelectItems = ref([
  // 교재/자재명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_PD_BOK_MTR_NAME') },
  // 교재/자재코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_PROD_CD') },
]);
// const codes = await codeUtil.getMultiCodes('PD_TEMP_SAVE_CD');

async function isModifiedProps() {
  return false;
}

async function validateProps() {
  return true;
}

async function resetData() {
  console.log('TODO restData');
}

async function getSaveData() {
  const subList = { saveFields: [] };
  return subList;
}

async function onClickMaterialSchPopup() {
  const view = grdMainRef.value.getView();
  const rtn = await modal({
    component: 'ZwpdcMaterialListP',
    componentProps: searchParams.value,
  });
  if (rtn.result) {
    if (Array.isArray(rtn.payload) && rtn.payload.length > 1) {
      const data = view.getDataSource();
      const rows = rtn.payload.map((item) => ({
        ...item, svPdCd: clone(currentPdCd.value) }));
      await data.insertRows(0, rows);
      await gridUtil.focusCellInput(view, 0);
    }
  }
  grdRowCount.value = getGridRowCount(view);
}

/* async function initGridRows() {
  const products = currentInitData.value?.[pdConst.RELATION_PRODUCTS];
  // console.log('WwpdcStandardMgtMRelPrd - initGridRows - products : ', products);
  const materialView = grdMainRef.value?.getView();
  if (materialView) {
    materialView.getDataSource().clearRows();
    materialView.getDataSource().setRows(products // 상품-필터
      ?.filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_PD_TO_FL));
    materialView.resetCurrent();
    grdRowCount.value = getGridRowCount(materialView);
  }
} */

async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  // await initGridRows();
}

await initProps();

watch(() => props.pdCd, (pdCd) => { currentPdCd.value = pdCd; });
watch(() => props.initData, (initData) => { currentInitData.value = initData; /* initGridRows(); */ }, { deep: true });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const columns = [
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_BOK_MTR_NAME'), width: '306' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: 'svPdCd' }); // 서비스 상품 코드
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = false;
}
</script>
<style scoped></style>
