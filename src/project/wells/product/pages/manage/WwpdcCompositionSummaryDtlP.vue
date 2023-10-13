<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcCompositionSummaryDtlP - 판매상품 관리 - 복합상품 요약조회
                ( Z-PD-U-0021P01 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.04.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 판매상품 관리 - 복합상품 요약조회
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
        <!-- 등록일 -->
        <span>{{ $t('MSG_TXT_RGST_DT') }} {{ stringUtil.getDateFormat(pdInfo.fstRgstDtm) }}
          /  {{ pdInfo.fstRgstUsrNm }}</span><span>
          <!-- 최종수정일  -->
          {{ $t('MSG_TXT_L_UPDATED') }} {{ stringUtil.getDateFormat(pdInfo.fnlMdfcDtm) }}
          / {{ pdInfo.fnlMdfcUsrNm }}</span>
      </p>
    </h2>
    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <!-- 판매채널 -->
        <kw-form-item :label="$t('MSG_TXT_SEL_CHNL')">
          <p>
            {{ getCodeNames(codes, pdInfo.avlChnlId, 'SELL_CHNL_DTL_CD') }}
          </p>
        </kw-form-item>
        <!-- 판매여부 -->
        <kw-form-item :label="$t('MSG_TXT_SLE_YN')">
          <p>
            {{ pdInfo.sellYn }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 판매기간 -->
        <kw-form-item :label="$t('MSG_TXT_PRDT_SLE_PRD')">
          <p v-if="pdInfo.sellStrtdt || pdInfo.sellEnddt">
            {{ stringUtil.getDateFormat(pdInfo.sellStrtdt) }} ~ {{ stringUtil.getDateFormat(pdInfo.sellEnddt) }}
          </p>
        </kw-form-item>
        <!-- 합포장여부 -->
        <kw-form-item :label="$t('TXT_MSG_MPAC_YN')">
          <p>
            {{ pdInfo.mpacYn }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 재고관리 대상여부 -->
        <kw-form-item :label="$t('TXT_MSG_STOC_MNGT_OJ_YN')">
          <p>
            {{ pdInfo.stocMngtOjYn }}
          </p>
        </kw-form-item>
        <!-- 통화명 -->
        <kw-form-item :label="$t('MSG_TXT_CUR_NAME')">
          <p>
            {{ getCodeNames(codes, pdInfo.crncyDvCd, 'CRNCY_DV_CD') }}
          </p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-grid
      ref="grdStandardRef"
      name="grdStandardMain"
      :visible-rows="3"
      @init="initStandardGrid"
    />
    <kw-separator />
    <kw-grid
      ref="grdMainRef"
      class="mt40"
      name="grdMain"
      :visible-rows="5"
      @init="initGrid"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, stringUtil, getComponentType, useModal } from 'kw-lib';
import pdConst from '~sms-common/product/constants/pdConst';
import { getCodeNames } from '~sms-common/product/utils/pdUtil';

const props = defineProps({
  pdCd: { type: String, default: null }, // 상품코드
});

const dataService = useDataService();
const { t } = useI18n();
const { cancel } = useModal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdStandardRef = ref(getComponentType('KwGrid'));
const grdMainRef = ref(getComponentType('KwGrid'));

const currentPdCd = ref();
const pdInfo = ref({});
const pdRels = ref([]);
const pdPrcs = ref([]);
const codes = await codeUtil.getMultiCodes(
  'SELL_CHNL_DTL_CD',
  'SELL_TP_CD',
  'STPL_PRD_CD',
  'RENTAL_DSC_DV_CD',
  'CRNCY_DV_CD',
);

// 데이터 불러오기
async function fetchData() {
  // 상품 기본정보
  const resPd = await dataService.get(`/sms/common/product/${currentPdCd.value}`).catch(() => {
    cancel();
  });
  if (!resPd || !resPd.data) return;
  pdInfo.value = resPd.data?.product;

  // 연결상품 정보
  const resRel = await dataService.get(`/sms/common/product/relations/products/${currentPdCd.value}`);
  pdRels.value = resRel.data;

  // 가격정보
  const resPrc = await dataService.get(`/sms/common/product/prices/products/${currentPdCd.value}`);
  pdPrcs.value = resPrc.data?.prices;
}

// 그리드 초기 데이터 설정
async function initGridRows() {
  if (pdRels.value && pdRels.value.length) {
    const standardView = grdStandardRef.value?.getView();
    if (standardView) {
      standardView.getDataSource().setRows(pdRels.value
        .filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_C_TO_P));
      standardView.displayOptions.rowHeight = -1;
    }
  }
  const view = grdMainRef.value?.getView();
  if (view) {
    view.getDataSource().setRows(pdPrcs.value);
  }
}

// Props 데이터 설정
async function initProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  if (currentPdCd.value) {
    await fetchData();
  }
}

await initProps();

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------
async function initStandardGrid(data, view) {
  const columns = [
    // 적용시작일자
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRTDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 적용종료일자
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_ENDDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 기준상품 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_STD_TYPE'), width: '140' },
    // 기준상품명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '150' },
    // 기준상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '100', styleName: 'text-center' },
    // 연결상품
    { fieldName: 'stdRelProducts',
      header: t('MSG_TXT_REL_PRDT'),
      width: '220',
      styleName: 'multiline',
      displayCallback(grid, index) {
        const { stdRelProducts } = grid.getValues(index.itemIndex);
        return stdRelProducts;
      } },
    // 판매유형
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: pdConst.REL_PD_ID });
  fields.push({ fieldName: pdConst.PD_REL_TP_CD });
  fields.push({ fieldName: pdConst.REL_OJ_PD_CD });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}

async function initGrid(data, view) {
  const columns = [
    // 판매채널
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_CHNL'), width: '90', styleName: 'text-center', options: codes.SELL_CHNL_DTL_CD },
    // 기준상품코드
    { fieldName: 'basePdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '110', styleName: 'text-center' },
    // 기준상품명
    { fieldName: 'basePdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '206' },
    // 판매유형
    { fieldName: 'baseSellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '90', styleName: 'text-center', options: codes.SELL_TP_CD },
    // LV.1(SVC명)
    { fieldName: 'svPdNm', header: t('MSG_TXT_PD_FEE_LV1'), width: '150' },
    // LV.2(약정주기)
    { fieldName: 'stplPrdCd', header: t('MSG_TXT_PD_COM_PERI_LV2'), width: '100', styleName: 'text-center', options: codes.STPL_PRD_CD },
    // (랜탈)할인구분
    { fieldName: 'rentalDscDvCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '80', styleName: 'text-center', options: codes.RENTAL_DSC_DV_CD },
    // 최종가격
    { fieldName: 'fnlVal', header: t('MSG_TXT_PD_FNL_PRC'), width: '120', styleName: 'text-right', numberFormat: '#,##0.##', dataType: 'number' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  initGridRows();
}

</script>
<style lang="scss">
.multiline {
  word-break: break-word;
  white-space: pre;
}
</style>
