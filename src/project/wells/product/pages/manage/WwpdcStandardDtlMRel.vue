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
    name="grdDtlRelMaterial"
    :visible-rows="3"
    ignore-on-modified
    @init="initMaterialGrid"
  />
  <!-- 서비스 -->
  <h3>{{ $t('MSG_TXT_SERVICE') }}</h3>
  <kw-grid
    ref="grdServiceRef"
    name="grdDtlRelService"
    :visible-rows="3"
    ignore-on-modified
    @init="initServiceGrid"
  />
  <!-- 기준상품 관계설정 -->
  <h3>{{ $t('MSG_TXT_STD_PRD_SET_REL') }}</h3>
  <kw-grid
    ref="grdStandardRef"
    name="grdDtlRelStandard"
    :visible-rows="3"
    ignore-on-modified
    @init="initStandardGrid"
  />

  <!-- 대체품 -->
  <h3>{{ $t('MSG_TXT_REP_PROD') }}</h3>
  <kw-grid
    ref="grdChangePrdRef"
    name="grdDtlRelChangePrd"
    :visible-rows="3"
    ignore-on-modified
    @init="initChangePrdGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, codeUtil, gridUtil } from 'kw-lib';
import { getCodeNames } from '~/modules/sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData, onClickSearch,
});

const props = defineProps({
  pdCd: { type: String, default: null }, // 상품코드
  initData: { type: Object, default: null }, // 초기데이터
  codes: { type: Object, default: null }, // 공통코드
});

const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMaterialRef = ref(getComponentType('KwGrid'));
const grdServiceRef = ref(getComponentType('KwGrid'));
const grdStandardRef = ref(getComponentType('KwGrid'));
const grdChangePrdRef = ref(getComponentType('KwGrid'));

const currentPdCd = ref();
const currentInitData = ref({});
const codes = await codeUtil.getMultiCodes('BASE_PD_REL_DV_CD', 'PD_PDCT_REL_DV_CD');

// 데이터 초기화
async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  if (grdMaterialRef.value?.getView()) gridUtil.reset(grdMaterialRef.value.getView());
  if (grdServiceRef.value?.getView()) gridUtil.reset(grdServiceRef.value.getView());
  if (grdStandardRef.value?.getView()) gridUtil.reset(grdStandardRef.value.getView());
  if (grdChangePrdRef.value?.getView()) gridUtil.reset(grdChangePrdRef.value.getView());
}

// 조회
async function onClickSearch() {
  await initGridRows();
}

// 그리드 초기 데이터 설정
async function initGridRows() {
  const products = currentInitData.value[pdConst.RELATION_PRODUCTS];
  const materialView = grdMaterialRef.value?.getView();
  if (materialView) {
    materialView.getDataSource().clearRows();
    const materialCodeValues = codes.PD_PDCT_REL_DV_CD
      .reduce((rtns, code) => { rtns.push(code.codeId); return rtns; }, []);
    const materialRows = products
      ?.filter((item) => materialCodeValues.includes(item[pdConst.PD_REL_TP_CD]));
    materialView.getDataSource().setRows(materialRows);
  }

  const serviceView = grdServiceRef.value?.getView();
  if (serviceView) {
    serviceView.getDataSource().clearRows();
    const serviceRows = products
      ?.filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_S);
    serviceView.getDataSource().setRows(serviceRows);
  }

  const standardView = grdStandardRef.value?.getView();
  if (standardView) {
    standardView.getDataSource().clearRows();
    const standardCodeValues = codes.BASE_PD_REL_DV_CD
      .reduce((rtns, code) => { rtns.push(code.codeId); return rtns; }, []);
    const standardRows = products
      ?.filter((item) => standardCodeValues.includes(item[pdConst.PD_REL_TP_CD]));
    standardView.getDataSource().setRows(standardRows);
  }

  const changeView = grdChangePrdRef.value?.getView();
  if (changeView) {
    changeView.getDataSource().clearRows();
    const changeRows = products
      ?.filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_CHANGE);
    changeView.getDataSource().setRows(changeRows);
  }
}

// Props 데이터 설정
async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
}

await initProps();

// 리얼그리드 표시 오류 대응 임시코드
onActivated(async () => {
  await initGridRows();
});

watch(() => props.pdCd, (pdCd) => { currentPdCd.value = pdCd; });
watch(() => props.initData, (initData) => { currentInitData.value = initData; initGridRows(); }, { deep: true });

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------
async function initMaterialGrid(data, view) {
  const columns = [
    // 관계구분
    { fieldName: 'pdRelTpCd', header: t('MSG_TXT_RELATION_CLSF'), width: '85', styleName: 'text-center', options: codes.PD_PDCT_REL_DV_CD },
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '80', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD },
    // 적용시작일자
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRTDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 적용종료일자
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_ENDDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 교재/자재 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_BOK_MTR_TYPE'), width: '170' },
    // 교재/자재명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_BOK_MTR_NAME'), width: '200' },
    // 제품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '120', styleName: 'text-center' },
    // 자재코드
    { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '140', styleName: 'text-center' },
    // 배송회차
    { fieldName: 'sppTn',
      header: t('MSG_TXT_DELIVERY_NUM'),
      width: '87',
      styleName: 'text-right',
      dataType: 'number',
    },
    // 제품수량(개)
    { fieldName: 'itmQty',
      header: t('MSG_TXT_PRD_COUNT_EA'),
      width: '87',
      styleName: 'text-right',
      dataType: 'number',
    },
    // 판매금액
    { fieldName: 'fnlVal', header: t('MSG_TXT_SALE_PRICE'), width: '107', styleName: 'text-right', dataType: 'number' },
    // 공급가액
    { fieldName: 'splAmt', header: t('MSG_TXT_SUPPLY_AMOUNT'), width: '107', styleName: 'text-right', dataType: 'number' },
    // 부가세액
    { fieldName: 'vat', header: t('MSG_TXT_VAT_AMOUNT'), width: '107', styleName: 'text-right', dataType: 'number' },
    // 안분비율(%)
    { fieldName: 'diviRat',
      header: t('MSG_TXT_PROPORTIONAL_DV_RT'),
      width: '107',
      styleName: 'text-right',
      dataType: 'number',
    },
    // 잔액산입
    { fieldName: 'blamInptYn', header: t('MSG_TXT_CHANGE_COUNTING'), width: '87', styleName: 'text-center', editor: { type: 'list' }, options: props.codes?.COD_YN },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}

async function initServiceGrid(data, view) {
  const columns = [
    // 필수여부
    { fieldName: 'mndtSvYn', header: t('MSG_TXT_NCSR_YN'), width: '85', styleName: 'text-center' },
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '80', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD },
    // 적용시작일자
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRTDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 적용종료일자
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_ENDDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 서비스 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_SVC_CATG'), width: '170' },
    // 서비스명
    { fieldName: 'pdNm', header: t('MSG_TXT_SVC_NAME'), width: '200' },
    // 서비스코드
    { fieldName: 'pdCd', header: t('MSG_TXT_SVC_CODE'), width: '140', styleName: 'text-center' },
    // 주기단위/방문주기
    { fieldName: 'svVstPrdCdSet',
      header: t('MSG_TXT_PD_UNIT_VISIT_PERI'),
      width: '187',
      styleName: 'text-center',
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
      width: '187',
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
  fields.push({ fieldName: 'svPrdUnitCd' });
  fields.push({ fieldName: 'svVstPrdCd' });
  fields.push({ fieldName: 'pcsvPrdCd' });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}
async function initStandardGrid(data, view) {
  const columns = [
    // 관계구분
    { fieldName: 'pdRelTpCd', header: t('MSG_TXT_RELATION_CLSF'), width: '85', styleName: 'text-center', options: codes.BASE_PD_REL_DV_CD },
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '80', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD },
    // 적용시작일자
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRTDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 적용종료일자
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_ENDDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 기준상품 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_STD_TYPE'), width: '170' },
    // 기준상품명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '200' },
    // 기준상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '120', styleName: 'text-center' },
    // 판매유형
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '140', styleName: 'text-center', options: props.codes?.SELL_TP_CD },
    // 서비스명
    { fieldName: 'svPdNm', header: t('MSG_TXT_SVC_NAME'), width: '200' },
    // 서비스코드
    { fieldName: 'svPdCd', header: t('MSG_TXT_SVC_CODE'), width: '120' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}

async function initChangePrdGrid(data, view) {
  const columns = [
    // 적용시작일자
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRTDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 적용종료일자
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_ENDDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 기준상품 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_STD_TYPE'), width: '170' },
    // 기준상품명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '200' },
    // 기준상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '140', styleName: 'text-center' },
    // 판매유형
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '140', styleName: 'text-center', options: props.codes?.SELL_TP_CD },
    // 판매기간
    { fieldName: 'sellDurtion', header: t('MSG_TXT_PRDT_SLE_PRD'), width: '187', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}

</script>
