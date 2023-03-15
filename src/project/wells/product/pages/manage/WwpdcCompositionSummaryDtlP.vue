<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcCompositionSummaryDtlP - 판매상품 관리 - 서비스 요약조회 ( Z-PD-U-0042P01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 서비스 관리 - 서비스 요약조회
****************************************************************************************************
--->
<template>
  <kw-popup size="xl">
    <kw-chip
      v-if="pdInfo.sellYn === 'Y'"
      :label="$t('MSG_TXT_PD_SELLING')"
      color="primary"
      outline
      class="ml0 mb8 mt0"
    />
    <h2 class="h2-small mb30">
      {{ pdInfo.pdNm }}({{ pdInfo.pdCd }})
      <p>
        <span>{{ $t('MSG_TXT_RGST_DT') }} {{ stringUtil.getDateFormat(pdInfo.fstRgstDtm) }}
          /  {{ pdInfo.fstRgstUsrNm }}</span><span>
          {{ $t('MSG_TXT_L_UPDATED') }} {{ stringUtil.getDateFormat(pdInfo.fnlMdfcDtm) }}
          / {{ pdInfo.fnlMdfcUsrNm }}</span>
      </p>
    </h2>
    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <!-- 판매기간 -->
        <kw-form-item :label="$t('MSG_TXT_PRDT_SLE_PRD')">
          <p v-if="pdInfo.sellStrtdt || pdInfo.sellEnddt">
            {{ stringUtil.getDateFormat(pdInfo.sellStrtdt) }} ~ {{ stringUtil.getDateFormat(pdInfo.sellEnddt) }}
          </p>
        </kw-form-item>
        <!-- 상품분류 -->
        <kw-form-item :label="$t('MSG_TXT_PRDT_CATE')">
          <p v-if="pdInfo.pdHclsfId || pdInfo.pdMclsfId || pdInfo.pdLclsfId">
            {{ getCodeNames(codes, pdInfo.pdHclsfId, 'clsfCodes') }}
            <slot v-if="pdInfo.pdMclsfId">
              {{ ' > ' }}
            </slot>
            {{ getCodeNames(codes, pdInfo.pdMclsfId, 'clsfCodes') }}
            <slot v-if="pdInfo.pdLclsfId">
              {{ ' > ' }}
            </slot>
            {{ getCodeNames(codes, pdInfo.pdLclsfId, 'clsfCodes') }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 판매채널 -->
        <kw-form-item :label="$t('MSG_TXT_SEL_CHNL')">
          <p>
            {{ getCodeNames(codes, pdInfo.avlChnlId, 'SELL_CHNL_DTL_CD') }}
          </p>
        </kw-form-item>
        <!-- 대상연령 -->
        <kw-form-item :label="$t('MSG_TXT_LRNN_AGE')">
          <p>
            {{ getCodeNames(codes, pdInfo.lrnnAgeUnitCd, 'OJ_AGE_UNIT_CD') }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 부가가치세 유형 -->
        <kw-form-item :label="$t('MSG_TXT_VAT_TYPE')">
          <p>
            {{ getCodeNames(codes, pdInfo.vatTpCd, 'VAT_TP_CD') }}
          </p>
        </kw-form-item>
        <!-- 컨텐츠 선택 제한유무 -->
        <kw-form-item :label="$t('MSG_TXT_CONTS_SEL_STOP_YN')">
          <p>
            {{ getCodeNames(codes, pdInfo.cntsChoLmYn, 'COD_YN') }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 컨텐츠 선택개수 -->
        <kw-form-item :label="$t('MSG_TXT_CONTS_SEL_CNT')">
          <p>
            {{ pdInfo.cntsChoQty }}
          </p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-grid
      ref="grdMaterialRef"
      :visible-rows="1"
      class="mb20"
      @init="initMaterialGrid"
    />
    <kw-grid
      ref="grdServiceRef"
      :visible-rows="1"
      class="mb20"
      @init="initServiceGrid"
    />
    <kw-grid
      ref="grdCompositionRef"
      :visible-rows="1"
      class="mb20"
      @init="initCompositionGrid"
    />
    <kw-separator />
    <kw-action-top class="mt40">
      <span class="kw-fc---black3 text-weight-regular">({{ $t('MSG_TXT_UNIT') }} : {{ $t('MSG_TXT_CUR_WON') }})</span>
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      :visible-rows="5"
      @init="initGrid"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, stringUtil, getComponentType } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { getCodeNames } from '~sms-common/product/utils/pdUtil';

const props = defineProps({
  pdCd: { type: String, default: null },
});

const dataService = useDataService();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMaterialRef = ref(getComponentType('KwGrid'));
const grdServiceRef = ref(getComponentType('KwGrid'));
const grdCompositionRef = ref(getComponentType('KwGrid'));
const grdMainRef = ref(getComponentType('KwGrid'));

const currentPdCd = ref();
const pdInfo = ref({});
const pdRels = ref([]);
const pdPrcs = ref([]);
const codes = await codeUtil.getMultiCodes(
  'COD_YN',
  'SELL_CHNL_DTL_CD',
  'OJ_AGE_UNIT_CD',
  'DSC_APY_DTL_CD',
  'VAT_TP_CD',
  'GRY_CD',
);
codes.COD_YN.map((item) => {
  item.codeName = item.codeId;
  item.changed = true;
  return item;
});

async function fetchData() {
  const resPd = await dataService.get(`/sms/common/product/${currentPdCd.value}`);
  pdInfo.value = resPd.data?.product;

  const resRel = await dataService.get(`/sms/common/product/relations/products/${currentPdCd.value}`, { params: { } });
  pdRels.value = resRel.data;

  const resPrc = await dataService.get('/sms/common/product/prices', { params: { pdTpCd: pdConst.PD_TP_CD_COMPOSITION, pdCd: currentPdCd.value } });
  pdPrcs.value = resPrc.data;

  const resCls = await dataService.get('/sms/common/product/classifications', { params: { hgrPdClsfId: '', pdTpCd: pdConst.PD_TP_CD_COMPOSITION } });
  codes.clsfCodes = resCls.data?.map((item) => ({ ...item, codeId: item.pdClsfId, codeName: item.pdClsfNm }), []);
  // console.log(codes.clsfCodes);
}

async function initGridRows() {
  const products = pdRels.value;
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

  const compositionView = grdCompositionRef.value?.getView();
  if (compositionView) {
    compositionView.getDataSource().setRows(products
      .filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_P));
    compositionView.resetCurrent();
  }

  const view = grdMainRef.value?.getView();
  if (view) {
    view.getDataSource().setRows(pdPrcs.value);
    view.resetCurrent();
  }
}

async function initProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  if (currentPdCd.value) {
    await fetchData();
  }
}

await initProps();

watch(() => props.pdCd, (pdCd) => { currentPdCd.value = pdCd; fetchData(); });

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------
async function initMaterialGrid(data, view) {
  const columns = [
    // 교재/자재 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_BOK_MTR_TYPE'), width: '201' },
    // 교재/자재명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_BOK_MTR_NAME'), width: '206' },
    // 상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '185', styleName: 'text-center' },
    // 학습/전집/기기구분
    { fieldName: 'lrnColleDvTyp', header: t('MSG_TXT_PD_LRN_COLLE_DV_TYP'), width: '287', styleName: 'text-center' },
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
    // 서비스 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_SVC_CATG'), width: '201' },
    // 서비스명
    { fieldName: 'pdNm', header: t('MSG_TXT_SVC_NAME'), width: '156' },
    // 서비스코드
    { fieldName: 'pdCd', header: t('MSG_TXT_SVC_CODE'), width: '155', styleName: 'text-center' },
    // 회수/기본주기 / 주기단위
    { fieldName: 'recalDurUnit', header: t('MSG_TXT_PD_RECAL_DUR_UNIT'), width: '187', styleName: 'text-center', options: codes.SV_VST_PRD_CD },
    // 학습시간+학습시간단위
    { fieldName: 'lrnTmeUnt', header: t('MSG_TXT_PD_LRN_TME_N_UNT'), width: '187', styleName: 'text-center' },
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
async function initCompositionGrid(data, view) {
  const columns = [
    // 기준상품 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_STD_TYPE'), width: '201' },
    // 기준상품명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '206' },
    // 기준상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '185', styleName: 'text-center' },
    // 판매유형
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '157', styleName: 'text-center', options: codes.SELL_TP_CD },
    // 판매채널
    { fieldName: 'channelId', header: t('MSG_TXT_SEL_CHNL'), width: '187', styleName: 'text-center', options: codes.SELL_CHNL_DTL_CD },
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

async function initGrid(data, view) {
  const columns = [
    // 판매채널
    { fieldName: 'avlChnlId', header: t('MSG_TXT_SEL_CHNL'), width: '178', options: codes.SELL_CHNL_DTL_CD },
    // 적용시작일
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRT_DAY'), width: '87', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 적용종료일
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_END_DAY'), width: '87', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 할인유형
    { fieldName: 'dscCd', header: t('MSG_TXT_DISC_CODE'), width: '120', styleName: 'text-right', options: codes.DSC_APY_DTL_CD },
    // 학년구분(대상학년?)
    { fieldName: 'lrnnGryCd', header: t('MSG_TXT_CLASS_TYPE'), width: '120', styleName: 'text-right', options: codes.GRY_CD },
    // 최종가격
    { fieldName: 'fnlVal', header: t('MSG_TXT_PD_FNL_PRC'), width: '120', styleName: 'text-right', numberFormat: '#,##0.##', dataType: 'number' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  initGridRows();
}

</script>
<style scoped></style>
