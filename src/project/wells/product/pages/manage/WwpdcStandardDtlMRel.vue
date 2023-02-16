<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardDtlMRel - 기준상품 상세조회 - 연결상품( W-PD-U-0010M08 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 상세조회 - 연결상품 프로그램
****************************************************************************************************
--->
<template>
  <!-- 교재/자재 -->
  <h3>{{ $t('MSG_TXT_PD_MNL_MAT') }}</h3>
  <kw-grid
    ref="grdMaterialRef"
    :visible-rows="3"
    @init="initMaterialGrid"
  />
  <!-- 서비스 -->
  <h3>{{ $t('MSG_TXT_SERVICE') }}</h3>
  <kw-grid
    ref="grdServiceRef"
    :visible-rows="3"
    @init="initServiceGrid"
  />
  <!-- 동시구매가능 기준상품 -->
  <h3>{{ $t('MSG_TXT_PD_PUR_SIM') }}</h3>
  <kw-grid
    ref="grdStandardRef"
    :visible-rows="3"
    @init="initStandardGrid"
  />

  <!-- 대체품 -->
  <h3>{{ $t('MSG_TXT_REP_PROD') }}</h3>
  <kw-grid
    ref="grdChangePrdRef"
    :visible-rows="3"
    @init="initChangePrdGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import { pdMergeBy } from '~/modules/sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  codes: { type: Object, default: null },
});

const { t } = useI18n();

const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMaterialRef = ref(getComponentType('KwGrid'));
const grdServiceRef = ref(getComponentType('KwGrid'));
const grdStandardRef = ref(getComponentType('KwGrid'));
const grdChangePrdRef = ref(getComponentType('KwGrid'));

const currentPdCd = ref();
const currentInitData = ref({});

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

  const changeView = grdChangePrdRef.value?.getView();
  if (changeView) {
    changeView.getDataSource().setRows(products
      .filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_CHANGE));
    changeView.resetCurrent();
  }
}

async function fetchData() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  if (currentPdCd.value) {
    const res = await dataService.get(`/sms/common/product/relations/products/${currentPdCd.value}`, { params: { } });
    currentInitData.value = pdMergeBy(initData, { [pdConst.RELATION_PRODUCTS]: res.data });
    // console.log('WwpdcStandardDtlMRel - fetchData - res : ', res);
  } else {
    currentInitData.value = initData;
  }
  await initGridRows();
}

async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  if (currentPdCd.value) {
    await fetchData();
  }
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
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '135', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD },
    // 교재/자재 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_BOK_MTR_TYPE'), width: '371' },
    // 교재/자재명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_BOK_MTR_NAME'), width: '306' },
    // 제품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '185', styleName: 'text-center' },
    // 자재코드
    { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '187', styleName: 'text-center' },
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
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
}

async function initServiceGrid(data, view) {
  // console.log('props.codes : ', props.codes);
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
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
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
    // 판매채널
    { fieldName: 'channelId', header: t('MSG_TXT_SEL_CHNL'), width: '187', styleName: 'text-center', options: props.codes?.SELL_CHNL_DV_CD },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
}

async function initChangePrdGrid(data, view) {
  const columns = [
    // 기준상품 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_STD_TYPE'), width: '371' },
    // 기준상품명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '306' },
    // 기준상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '185', styleName: 'text-center' },
    // 판매유형
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '187', styleName: 'text-center', options: props.codes?.SELL_TP_CD },
    // 판매기간
    { fieldName: 'sellDurtion', header: t('MSG_TXT_PRDT_SLE_PRD'), width: '187', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  await initGridRows();
}
</script>
