<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcPropRelationDtlM - 교재/자재 - 연결상품 조회(TAB) (W-PD-U-0031M02)
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 >> 교재/자재 >> 연결상품 프로그램
****************************************************************************************************
--->
<template>
  <h3>{{ grd3rdTit.codeName }}</h3>
  <kw-grid
    ref="grd3rdRef"
    :need-context-menu="false"
    :visible-rows="visibleRowCnt"
    @init="initGrd3rd"
  />
  <!-- <kw-separator /> -->
  <h3>{{ grd2ndTit.codeName }}</h3>
  <kw-grid
    ref="grd2ndRef"
    :need-context-menu="false"
    :visible-rows="visibleRowCnt"
    @init="initGrd2nd"
  />
  <!-- <kw-separator /> -->
  <h3>{{ grd1stTit.codeName }}</h3>
  <kw-grid
    ref="grd1stRef"
    :need-context-menu="false"
    :visible-rows="visibleRowCnt"
    @init="initGrd1st"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';

/* eslint-disable no-use-before-define */
defineExpose({ validateProps });

const { t } = useI18n();
const grd1stRef = ref(getComponentType('KwGrid'));
const grd2ndRef = ref(getComponentType('KwGrid'));
const grd3rdRef = ref(getComponentType('KwGrid'));

const props = defineProps({
  pdTpCd: { type: String, required: true },
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  codes: { type: Object, default: null },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes('PDCT_REL_DV_CD');

const visibleRowCnt = ref(3);
const grd1stTit = ref([]);
const grd2ndTit = ref([]);
const grd3rdTit = ref([]);

async function validateProps() {
  const validOk = true;
  return validOk;
}

const currentCodes = ref({});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const columns = [
  // 상태
  { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '85', styleName: 'text-center', options: currentCodes.value.PD_TEMP_SAVE_CD },
  // 적용시작일자
  { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRTDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
  // 적용종료일자
  { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_ENDDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
  { fieldName: 'pdRelTpCd', header: t('MSG_TXT_RELATION_CLSF'), width: '106', styleName: 'text-center', options: codes.PDCT_REL_DV_CD }, /* 관계구분 */
  { fieldName: 'pdClsfNm', header: t('MSG_TXT_CLSF'), width: '176', styleName: 'text-left' }, /* 분류 */
  { fieldName: 'pdNm', header: t('MSG_TIT_MATERIAL_NM'), width: '382', styleName: 'text-left' }, /* 교재/자재명 */
  { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '121', styleName: 'text-center' }, /* 자재코드 교재/제재코드 */
  { fieldName: 'modelNo', header: t('MSG_TXT_PD_MODEL_NO'), width: '152', styleName: 'text-center' }, /* 모델No */
  { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ABBR'), width: '226', styleName: 'text-left' }, /* 약어 */
  { fieldName: 'ostrCnrCd', header: t('MSG_TIT_SHIPPING_CENTER'), width: '214', styleName: 'text-left' }, /* 출고센터 */
  { fieldName: 'pdTpCd', header: t('MSG_TIT_PRDT_TYPE'), width: '214', visible: false }, /* 상품종류 */
  { fieldName: 'ojPdCd', header: t('MSG_TIT_TARGET_PRDT_CD'), width: '214', visible: false }, /* 대상상품코드 */
  { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', visible: false }, /* 등록일 */
  { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGST_USR'), width: '80', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true, visible: false }, /* 등록자 */
  { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', visible: false }, /* 최종수정일 */
  { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '80', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true, visible: false }, /* 최종수정자 */
  { fieldName: 'fstRgstUsrId', header: 'RGST_ID', width: '50', visible: false },
  { fieldName: 'fnlMdfcUsrId', header: 'MDFC_ID', width: '50', visible: false },
];

const initGrd1st = defineGrid((data, view) => {
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.checkBar.visible = false;
});

const initGrd2nd = defineGrid((data, view) => {
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.checkBar.visible = false;
});

const initGrd3rd = defineGrid((data, view) => {
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.checkBar.visible = false;
});

async function setData() {
  // Grid Header Binding (06: 대체, 13: 혼식, 14: AS)
  grd1stTit.value = codes.PDCT_REL_DV_CD.find((v) => v.codeId === '14');
  grd2ndTit.value = codes.PDCT_REL_DV_CD.find((v) => v.codeId === '13');
  grd3rdTit.value = codes.PDCT_REL_DV_CD.find((v) => v.codeId === '06');

  const relData = props.initData[pdConst.TBL_PD_REL];
  if (isEmpty(relData)) return;
  if (isEmpty(grd1stRef.value)) return;

  const grd1DataProvider = grd1stRef.value.getView().getDataSource();
  const grd2DataProvider = grd2ndRef.value.getView().getDataSource();
  const grd3DataProvider = grd3rdRef.value.getView().getDataSource();

  grd1DataProvider.fillJsonData(relData.filter((v) => v.pdRelTpCd === '14'), { fillMode: 'set' });
  grd2DataProvider.fillJsonData(relData.filter((v) => v.pdRelTpCd === '13'), { fillMode: 'set' });
  grd3DataProvider.fillJsonData(relData.filter((v) => v.pdRelTpCd === '06'), { fillMode: 'set' });

  currentCodes.value = props?.value?.codes;
}

onMounted(async () => {
  setData();
});

watch(() => props.initData, setData, { deep: true });

</script>
<style scoped></style>
