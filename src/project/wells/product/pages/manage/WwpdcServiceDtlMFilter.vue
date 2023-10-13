<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcServiceDtlMFilter - 서비스 관리 - 서비스 등록/변경 - 상품필터 교체조회
                ( W-PD-U-0043M04 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.04.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 서비스 등록/변경 - 상품필터 교체관리 프로그램
- Wells 특화
****************************************************************************************************
--->
<template>
  <!-- 교재/자재 -->
  <h3>{{ $t('MSG_TXT_PD_MNL_MAT') }}</h3>
  <kw-action-top>
    <!-- 정기B/S투입정보 상세/수정-->
    <kw-btn
      dense
      :disable="grdRowCount === 0"
      :label="$t('MSG_TXT_PD_SCH_BS_INFO')"
      @click="onClickBsInfos"
    />
  </kw-action-top>
  <kw-grid
    ref="grdMainRef"
    name="grdDtlFilterMain"
    @init="initGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { gridUtil, useGlobal, getComponentType } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import { getGridRowCount } from '~/modules/sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

/* eslint-disable no-use-before-define */
defineExpose({
  init, isModifiedProps, validateProps, resetData, getSaveData,
});

const props = defineProps({
  pdCd: { type: String, default: null }, // 상품코드
  initData: { type: Object, default: null }, // 초기데이터
  codes: { type: Object, default: null }, // 공통
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
const currentCodes = ref({});

// 수정여부
async function isModifiedProps() {
  return gridUtil.isModified(grdMainRef.value?.getView());
}

// 검증
async function validateProps() {
  return true;
}

// 정기B/S투입정보 상세/수정
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

// 컴포넌트 초기화
async function init() {
  const materialView = grdMainRef.value?.getView();
  if (materialView) gridUtil.init(materialView);
}

// 데이터 초기화
async function resetData() {
  currentPdCd.value = '';
  grdRowCount.value = 0;
  currentInitData.value = {};
  grdMainRef.value?.getView().getDataSource().clearRows();
  if (grdMainRef.value?.getView()) gridUtil.reset(grdMainRef.value.getView());
}

// 저장 데이터
async function getSaveData() {
  const subList = {};
  subList[pdConst.TBL_PD_REL] = [];
  const rowValues = gridUtil.getAllRowValues(grdMainRef.value.getView());
  subList[pdConst.TBL_PD_REL] = rowValues;
  subList[pdConst.RELATION_PRODUCTS] = rowValues;
  return subList;
}

// 그리드 초기 데이터 설정
async function initGridRows() {
  const products = cloneDeep(currentInitData.value?.[pdConst.RELATION_PRODUCTS]);
  // console.log('WwpdcServiceMgtMFlt - initGridRows - products : ', products);
  const view = grdMainRef.value?.getView();
  if (view) {
    view.getDataSource().clearRows();
    view.getDataSource().setRows(products // 상품-필터
      ?.filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_PD_TO_FL));
  }
  grdRowCount.value = getGridRowCount(view);
}

// Props 데이터 설정
async function initProps() {
  const { pdCd, initData, codes } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  currentCodes.value = codes;
}

await initProps();

// 리얼그리드 표시 오류 대응 임시코드
onActivated(async () => {
  await initGridRows();
});

watch(() => props.pdCd, (pdCd) => { currentPdCd.value = pdCd; });
watch(() => props.initData, (initData) => { currentInitData.value = initData; initGridRows(); }, { deep: true });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrid(data, view) {
  const columns = [
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '85', styleName: 'text-center', options: currentCodes.value.PD_TEMP_SAVE_CD },
    // 적용시작일자
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRTDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 적용종료일자
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_ENDDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 교재/자재 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_BOK_MTR_TYPE'), width: '230' },
    // 교재/자재명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_BOK_MTR_NAME'), width: '250' },
    // 제품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '120', styleName: 'text-center' },
    // 자재코드
    { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '180', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: pdConst.REL_PD_ID });
  fields.push({ fieldName: pdConst.PD_REL_TP_CD });
  fields.push({ fieldName: pdConst.REL_OJ_PD_CD });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  await initGridRows();
  await init();
}
</script>
<style scoped></style>
