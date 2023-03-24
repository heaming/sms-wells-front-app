<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcServiceDtlMFilter - 서비스 관리 - 서비스 등록/변경 - 상품필터 교체조회
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
  <kw-grid
    ref="grdMainRef"
    name="grdMain"
    @init="initGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { gridUtil, codeUtil, getComponentType } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
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
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const currentPdCd = ref();
const currentInitData = ref({});

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

async function initGridRows() {
  const products = cloneDeep(currentInitData.value?.[pdConst.RELATION_PRODUCTS]);
  // console.log('WwpdcServiceMgtMFlt - initGridRows - products : ', products);
  const materialView = grdMainRef.value?.getView();
  if (materialView) {
    materialView.getDataSource().clearRows();
    materialView.getDataSource().setRows(products // 상품-필터
      ?.filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_PD_TO_FL));
    materialView.resetCurrent();
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
    { fieldName: 'partPdCd', header: t('MSG_TXT_MATI_CD'), width: '187', styleName: 'text-center' },
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
