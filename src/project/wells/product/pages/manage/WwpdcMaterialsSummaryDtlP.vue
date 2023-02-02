<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY
2. 프로그램 ID : WwpdcMaterialsSummaryDtlP - 교재/자재 관리 -요약조회 (W-PD-U-0032P01)
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 교재/자재 관리- 요약조회(팝업) 프로그램
****************************************************************************************************
--->
<template>
  <kw-popup size="lg">
    <kw-chip
      :label="pdBas.sellYn === 'Y' ? $t('MSG_TXT_PD_SELLING') : $t('MSG_TXT_PD_NOT_SELLING') "
      color="primary"
      outline
      class="ml0 mb8 pb2 pt1 px8 mt0"
    />

    <h2 class="h2-small">
      {{ pdBas.pdNm }}({{ pdBas.pdCd }})
      <p>
        <span>{{ $t('MSG_TXT_RGST_DT') }} {{ stringUtil.getDateFormat(pdBas.fstRgstDtm) }}
          /  {{ pdBas.fstRgstUsrNm }}</span>
        <span>
          {{ $t('MSG_TXT_L_UPDATED') }} {{ stringUtil.getDateFormat(pdBas.fnlMdfcDtm) }}
          / {{ pdBas.fnlMdfcUsrNm }}
        </span>
      </p>
    </h2>

    <!-- 기본속성 -->
    <h3 class="pt0 pb20">
      {{ $t('MSG_TXT_ATTRIBUTE') }}
    </h3>
    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <!-- 제품분류 ex. 대분류 > 중분류-->
        <kw-form-item :label="$t('MSG_TXT_PRDT_CLSF')">
          <p>{{ pdBas.pdHclsfNm }} > {{ pdBas.pdMclsfNm }}</p>
        </kw-form-item>
        <!-- 자재코드 -->
        <kw-form-item :label="$t('MSG_TXT_MATI_CODE')">
          <p>{{ pdBas.sapMatCd }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <!-- 모델NO -->
        <kw-form-item :label="$t('MSG_TXT_PD_MODEL_NO')">
          <p>{{ pdBas.modelNo }}</p>
        </kw-form-item>
        <!-- 모델색상 -->
        <kw-form-item :label="$t('MSG_TXT_MODEL_COLOR')">
          <p>{{ pdColoNm }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <!-- Grid Area -->
    <h3>{{ grd1stTit.codeName }}</h3>
    <kw-grid
      ref="grd1stRef"
      :visible-rows="visibleRowCnt1"
      @init="initGrd1st"
    />
    <kw-separator />
    <h3>{{ grd2ndTit.codeName }}</h3>
    <kw-grid
      ref="grd2ndRef"
      :visible-rows="visibleRowCnt2"
      @init="initGrd2nd"
    />
    <kw-separator />
    <h3>{{ grd3rdTit.codeName }}</h3>
    <kw-grid
      ref="grd3rdRef"
      :visible-rows="visibleRowCnt3"
      @init="initGrd3rd"
    />

    <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_CONFIRM')"
        @click="onClickConfirm"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil, useModal, getComponentType, defineGrid, codeUtil } from 'kw-lib';
import pdConst from '~sms-common/product/constants/pdConst';
import { isEmpty } from 'lodash-es';

const { ok } = useModal();
const dataService = useDataService();
const { t } = useI18n();
const props = defineProps({
  pdCd: { type: String, required: true, default: '' },
});

const grd1stRef = ref(getComponentType('KwGrid'));
const grd2ndRef = ref(getComponentType('KwGrid'));
const grd3rdRef = ref(getComponentType('KwGrid'));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/common/product/materials';

const pdBas = ref({}); // 상품기본
const PdEcomPrpDtl = ref([]); // 상품각사속성상세
const pdRel = ref([]); // 상품각사속성상세

const PDCT = ref({}); // 관리속성 - 학습관리
const pdColoNm = ref(''); // 모델색상

const grd1stTit = ref([]);
const grd2ndTit = ref([]);
const grd3rdTit = ref([]);
const visibleRowCnt1 = ref(1);
const visibleRowCnt2 = ref(1);
const visibleRowCnt3 = ref(1);

const codes = await codeUtil.getMultiCodes('PD_REL_TP_CD');

async function onClickConfirm() {
  ok();
}

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/${props.pdCd}`);
  pdBas.value = res.data[pdConst.TBL_PD_BAS];
  pdRel.value = res.data[pdConst.TBL_PD_REL];
  PdEcomPrpDtl.value = res.data[pdConst.TBL_PD_ECOM_PRP_DTL];
  // 관리속성 - 판매제품
  PDCT.value = PdEcomPrpDtl.value[1];
  pdColoNm.value = PDCT.value.pdPrpVal02 ?? '';

  console.log('pdRel', pdRel.value);
}

function showRowCnt(rowCnt) {
  if (rowCnt === 0) {
    return 1;
  } if (rowCnt > 0 && rowCnt <= 3) {
    return rowCnt;
  }
  return 3;
}

onMounted(async () => {
  await fetchData(props.pdCd);
  // eslint-disable-next-line no-use-before-define
  await setData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const columns = [
  { fieldName: 'pdRelTpCd', header: t('MSG_TXT_RELATION_CLSF'), width: '106', styleName: 'text-center', options: codes.PD_REL_TP_CD }, /* 관계구분 */
  { fieldName: 'pdClsfNm', header: t('MSG_TXT_CLSF'), width: '176', styleName: 'text-left' }, /* 분류 */
  { fieldName: 'pdNm', header: t('MSG_TIT_MATERIAL_NM'), width: '382', styleName: 'text-left' }, /* 교재/자재명 */
  { fieldName: 'sapPdctSclsrtStrcVal', header: t('MSG_TXT_MATI_CODE'), width: '121' }, /* 자재코드 교재/제재코드 */
  { fieldName: 'modelNo', header: t('MSG_TXT_MODEL_NO'), width: '152', styleName: 'text-center' }, /* 모델No */
  { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ABBR'), width: '226', styleName: 'text-left' }, /* 약어 */
  { fieldName: 'ostrCnrCd', header: t('MSG_TIT_SHIPPING_CENTER'), width: '214', styleName: 'text-left' }, /* 출고센터 */
  { fieldName: 'pdTpCd', header: t('MSG_TIT_PRDT_TYPE'), width: '214', visible: false }, /* 상품종류 */
  { fieldName: 'ojPdCd', header: t('MSG_TIT_TARGET_PRDT_CD'), width: '214', visible: false }, /* 대상상품코드 */
  { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FST_RGST_DTM'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', visible: false }, /* 등록일 */
  { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGST_USR'), width: '80', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true, visible: false }, /* 등록자 */
  { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_DTM'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', visible: false }, /* 최종수정일 */
  { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '80', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true, visible: false }, /* 최종수정자 */
  //   NameTag Parameter
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
  view.displayOptions.selectionStyle = 'singleRow';
});

const initGrd2nd = defineGrid((data, view) => {
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.checkBar.visible = false;
  view.displayOptions.selectionStyle = 'singleRow';
});

const initGrd3rd = defineGrid((data, view) => {
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.checkBar.visible = false;
  view.displayOptions.selectionStyle = 'singleRow';
});

async function setData() {
  // Grid Header Binding
  grd1stTit.value = codes.PD_REL_TP_CD.find((v) => v.codeId === '13');
  grd2ndTit.value = codes.PD_REL_TP_CD.find((v) => v.codeId === '14');
  grd3rdTit.value = codes.PD_REL_TP_CD.find((v) => v.codeId === '15');

  // Grid Data Binding
  const relData = pdRel.value;
  if (isEmpty(relData)) return;
  if (isEmpty(grd1stRef.value)) return;

  const grd1DataProvider = grd1stRef.value.getView().getDataSource();
  const grd2DataProvider = grd2ndRef.value.getView().getDataSource();
  const grd3DataProvider = grd3rdRef.value.getView().getDataSource();

  grd1DataProvider.fillJsonData(relData.filter((v) => v.pdRelTpCd === '13'), { fillMode: 'set' });
  grd2DataProvider.fillJsonData(relData.filter((v) => v.pdRelTpCd === '14'), { fillMode: 'set' });
  grd3DataProvider.fillJsonData(relData.filter((v) => v.pdRelTpCd === '15'), { fillMode: 'set' });

  visibleRowCnt1.value = showRowCnt(grd1stRef.value.getView().getItemCount());
  visibleRowCnt2.value = showRowCnt(grd2ndRef.value.getView().getItemCount());
  visibleRowCnt3.value = showRowCnt(grd3rdRef.value.getView().getItemCount());
}

</script>

<style scoped>
</style>
