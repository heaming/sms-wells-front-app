<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcCompositionDtlMRel - 기준상품 상세조회 - 연결상품( W-PD-U-0010M08 )
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
    ignore-on-modified
    @init="initMaterialGrid"
  />
  <!-- 서비스 -->
  <h3>{{ $t('MSG_TXT_SERVICE') }}</h3>
  <kw-grid
    ref="grdServiceRef"
    :visible-rows="3"
    ignore-on-modified
    @init="initServiceGrid"
  />
  <!-- 동시구매가능 기준상품 -->
  <h3>{{ $t('MSG_TXT_PD_PUR_SIM') }}</h3>
  <kw-grid
    ref="grdStandardRef"
    :visible-rows="3"
    ignore-on-modified
    @init="initStandardGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, gridUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import { getCodeNames } from '~/modules/sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  codes: { type: Object, default: null },
});

const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMaterialRef = ref(getComponentType('KwGrid'));
const grdServiceRef = ref(getComponentType('KwGrid'));
const grdStandardRef = ref(getComponentType('KwGrid'));

const currentPdCd = ref();
const currentInitData = ref({});

async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  if (grdMaterialRef.value?.getView()) gridUtil.reset(grdMaterialRef.value.getView());
  if (grdServiceRef.value?.getView()) gridUtil.reset(grdServiceRef.value.getView());
  if (grdStandardRef.value?.getView()) gridUtil.reset(grdStandardRef.value.getView());
  // console.log('WwpdcCompositionDtlMRel - resetData');
}

async function initGridRows() {
  // console.log('WwpdcCompositionDtlMRel - initGridRows - currentInitData.value : ', currentInitData.value);
  const products = currentInitData.value[pdConst.RELATION_PRODUCTS];
  if (isEmpty(await products)) {
    return;
  }
  const materialView = grdMaterialRef.value?.getView();
  if (materialView) {
    materialView.getDataSource().clearRows();
    materialView.getDataSource().setRows(products
      .filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_PD));
    materialView.resetCurrent();
  }

  const serviceView = grdServiceRef.value?.getView();
  if (serviceView) {
    serviceView.getDataSource().clearRows();
    serviceView.getDataSource().setRows(products
      .filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_S));
    serviceView.resetCurrent();
  }

  const standardView = grdStandardRef.value?.getView();
  if (standardView) {
    standardView.getDataSource().clearRows();
    standardView.getDataSource().setRows(products
      .filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_P));
    standardView.resetCurrent();
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

  view.checkBar.visible = false;
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

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
}
async function initStandardGrid(data, view) {
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

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
}

</script>
