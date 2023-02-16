<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMRelChg - 기준상품 등록/변경 - 연결상품 선택 - 교체상품( W-PD-U-0010M01 ) - 교체상품
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 연결상품 선택 - 교체상품 프로그램
****************************************************************************************************
--->
<template>
  <!-- 대체품 -->
  <h3>{{ $t('MSG_TXT_REP_PROD') }}</h3>
  <kw-action-top v-show="!props.readonly">
    <template #left>
      <!--  기준상품 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_SEL_STD') }}</span>
      <kw-select
        v-model="productSearchType"
        dense
        class="ml12 w120"
        :options="productSelectItems"
      />
      <kw-input
        v-model="productSearchValue"
        dense
        clearable
        icon="search"
        class="ml8 w250"
        @click-icon="onClickProductSchPopup"
      />
    </template>
    <kw-btn
      v-show="!props.readonly"
      grid-action
      :label="$t('MSG_BTN_DEL')"
      @click="onClickProductDelRows"
    />
  </kw-action-top>
  <kw-grid
    ref="grdChangePrdRef"
    :visible-rows="15"
    @init="initChangePrdGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { gridUtil, useGlobal, getComponentType } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';

/* eslint-disable no-use-before-define */
defineExpose({
  getSaveData, isModifiedProps, validateProps,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  codes: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
});

const { modal } = useGlobal();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdChangePrdRef = ref(getComponentType('KwGrid'));
const currentPdCd = ref();
const currentInitData = ref({});

const productSelectItems = reactive([
  // 기준상품명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_GOODS_NM') },
  // 기준상품코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_PROD_CD') },
]);

const productSearchType = ref();
const productSearchValue = ref();

const searchParams = ref({
  searchType: null,
  searchValue: null,
});

async function getSaveData() {
  const rowValues = gridUtil.getAllRowValues(grdChangePrdRef.value.getView());
  const rtnValues = { [pdConst.TBL_PD_REL]: rowValues ?? [] };
  // console.log('WwpdcStandardMgtMRelPrd - getSaveData - rtnValues : ', rtnValues);
  return rtnValues;
}

function isModifiedProps() {
  return true;
}

function validateProps() {
  return true;
}

async function insertCallbackRows(view, rtn, pdRelTpCd) {
  if (rtn.result) {
    if (Array.isArray(rtn.payload) && rtn.payload.length > 1) {
      const data = view.getDataSource();
      const rows = rtn.payload.map((item) => ({
        ...item, [pdConst.REL_OJ_PD_CD]: item.pdCd, [pdConst.PD_REL_TP_CD]: pdRelTpCd }));
      await data.insertRows(0, rows);
    } else {
      const row = Array.isArray(rtn.payload) ? rtn.payload[0] : rtn.payload;
      row[pdConst.PD_REL_TP_CD] = pdRelTpCd;
      row[pdConst.REL_OJ_PD_CD] = row.pdCd;
      await gridUtil.insertRowAndFocus(view, 0, row);
    }
  }
}

async function deleteCheckedRows(view) {
  gridUtil.deleteCheckedRows(view);
}

async function onClickProductSchPopup() {
  const view = grdChangePrdRef.value.getView();
  searchParams.value.searchType = productSearchType.value;
  searchParams.value.searchValue = productSearchValue.value;
  searchParams.value.pdTpCd = pdConst.PD_TP_CD_STANDARD;
  const rtn = await modal({
    component: 'ZwpdcStandardSimpleListP',
    componentProps: searchParams.value,
  });
  await insertCallbackRows(view, rtn, pdConst.PD_REL_TP_CD_CHANGE);
}

async function onClickProductDelRows() {
  const view = grdChangePrdRef.value.getView();
  await deleteCheckedRows(view);
}

async function initGridRows() {
  const products = currentInitData.value[pdConst.RELATION_PRODUCTS];
  if (isEmpty(await products)) {
    return;
  }
  const changeView = grdChangePrdRef.value?.getView();
  if (changeView) {
    changeView.getDataSource().setRows(products
      .filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_CHANGE));
    changeView.resetCurrent();
  }
}

async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  await initGridRows();
}

await initProps();

watch(() => props.pdCd, () => { initProps(); });
watch(() => props.initData, () => { initProps(); }, { deep: true });

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------
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
  fields.push({ fieldName: pdConst.REL_PD_ID });
  fields.push({ fieldName: pdConst.PD_REL_TP_CD });
  fields.push({ fieldName: pdConst.REL_OJ_PD_CD });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = false;

  await initGridRows();
}

</script>
