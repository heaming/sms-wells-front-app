<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY
2. 프로그램 ID : WwpdcMaterialsSummaryDtlP - 교재/자재 관리 -요약조회 (W-PD-U-0032P01)
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 교재/자재 관리- 요약조회(팝업) 프로그램
****************************************************************************************************
--->
<template>
  <kw-popup size="lg">
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
      {{ $t('MSG_TXT_BAS_ATTR') }}
    </h3>
    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <!-- 제품분류 -->
        <kw-form-item :label="$t('MSG_TXT_PRDT_CLSF')">
          <p>{{ pdBas.pdClsfNm }} </p>
        </kw-form-item>
        <!-- 자재코드 -->
        <kw-form-item :label="$t('MSG_TXT_MATI_CD')">
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
    <h3>{{ grd3rdTit.codeName ?? t('MSG_TXT_REP_PROD') }}</h3>
    <kw-grid
      ref="grd3rdRef"
      :need-context-menu="false"
      :visible-rows="visibleRowCnt3"
      @init="initGrd3rd"
    />
    <kw-separator />
    <h3>{{ grd2ndTit.codeName ?? t('MSG_TXT_AVOID_EAT_ALONE') }}</h3>
    <kw-grid
      ref="grd2ndRef"
      :need-context-menu="false"
      :visible-rows="visibleRowCnt2"
      @init="initGrd2nd"
    />
    <kw-separator />
    <h3>{{ grd1stTit.codeName ?? t('MSG_TXT_AS_PART') }}</h3>
    <kw-grid
      ref="grd1stRef"
      :need-context-menu="false"
      :visible-rows="visibleRowCnt1"
      @init="initGrd1st"
    />

    <template #action />
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil, getComponentType, defineGrid, codeUtil, useModal } from 'kw-lib';
import pdConst from '~sms-common/product/constants/pdConst';
import { isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { cancel } = useModal();
const props = defineProps({
  pdCd: { type: String, required: true, default: '' },
});

const grd1stRef = ref(getComponentType('KwGrid'));
const grd2ndRef = ref(getComponentType('KwGrid'));
const grd3rdRef = ref(getComponentType('KwGrid'));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/product/materials';

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

const codes = await codeUtil.getMultiCodes('PDCT_REL_DV_CD');

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/${props.pdCd}`).catch(() => {
    cancel();
  });
  if (!res || !res.data) return;
  pdBas.value = res.data[pdConst.TBL_PD_BAS];
  pdRel.value = res.data[pdConst.TBL_PD_REL];
  PdEcomPrpDtl.value = res.data[pdConst.TBL_PD_ECOM_PRP_DTL];
  // 관리속성 - 판매제품
  PDCT.value = PdEcomPrpDtl.value.find((element) => element.pdExtsPrpGrpCd === 'PDCT');
  pdColoNm.value = PDCT.value?.pdPrpVal02 ?? '';
}

function showRowCnt(rowCnt) {
  if (rowCnt === 0) {
    return 1;
  }
  if (rowCnt > 0 && rowCnt <= 3) {
    return rowCnt;
  }
  return 3;
}

async function setData() {
  // Grid Header Binding
  grd1stTit.value = codes.PDCT_REL_DV_CD.find((v) => v.codeId === '14');
  grd2ndTit.value = codes.PDCT_REL_DV_CD.find((v) => v.codeId === '13');
  grd3rdTit.value = codes.PDCT_REL_DV_CD.find((v) => v.codeId === '06');

  // Grid Data Binding
  const relData = pdRel.value;
  if (isEmpty(relData)) return;
  if (isEmpty(grd1stRef.value)) return;

  const grd1DataProvider = grd1stRef.value.getView().getDataSource();
  const grd2DataProvider = grd2ndRef.value.getView().getDataSource();
  const grd3DataProvider = grd3rdRef.value.getView().getDataSource();

  grd1DataProvider.fillJsonData(relData.filter((v) => v.pdRelTpCd === '14'), { fillMode: 'set' });
  grd2DataProvider.fillJsonData(relData.filter((v) => v.pdRelTpCd === '13'), { fillMode: 'set' });
  grd3DataProvider.fillJsonData(relData.filter((v) => v.pdRelTpCd === '06'), { fillMode: 'set' });

  visibleRowCnt1.value = showRowCnt(grd1stRef.value.getView().getItemCount());
  visibleRowCnt2.value = showRowCnt(grd2ndRef.value.getView().getItemCount());
  visibleRowCnt3.value = showRowCnt(grd3rdRef.value.getView().getItemCount());
}

onMounted(async () => {
  await fetchData(props.pdCd);
  await setData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const columns = [
  // 적용시작일자
  { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRTDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
  // 적용종료일자
  { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_ENDDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
  { fieldName: 'pdRelTpCd', header: t('MSG_TXT_RELATION_CLSF'), width: '106', styleName: 'text-center', options: codes.PDCT_REL_DV_CD }, /* 관계구분 */
  { fieldName: 'pdClsfNm', header: t('MSG_TXT_CLSF'), width: '176', styleName: 'text-left' }, /* 분류 */
  { fieldName: 'pdNm', header: t('MSG_TIT_MATERIAL_NM'), width: '382', styleName: 'text-left' }, /* 교재/자재명 */
  { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '121' }, /* 자재코드 교재/제재코드 */
  { fieldName: 'modelNo', header: t('MSG_TXT_PD_MODEL_NO'), width: '152', styleName: 'text-center' }, /* 모델No */
  { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ABBR'), width: '226', styleName: 'text-left', visible: false }, /* 약어 */
  { fieldName: 'ostrCnrCd', header: t('MSG_TIT_SHIPPING_CENTER'), width: '214', styleName: 'text-left', visible: false }, /* 출고센터 */
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
  view.rowIndicator.visible = false;
  view.checkBar.visible = false;
});

const initGrd2nd = defineGrid((data, view) => {
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = false;
  view.checkBar.visible = false;
});

const initGrd3rd = defineGrid((data, view) => {
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = false;
  view.checkBar.visible = false;
});

</script>

<style scoped>
</style>
