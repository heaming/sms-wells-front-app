<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMPrice - 기준상품 등록/변경 - 연결상품 선택 - 교체상품( W-PD-U-0010M01 ) - 교체상품
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
  <kw-action-top>
    <template #left>
      <!--  제품 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_SELECT') }}</span>
      <kw-select
        dense
        class="ml12 w120"
      />
      <kw-input
        dense
        clearable
        icon="search"
        class="ml8 w250"
      />
    </template>
    <kw-btn
      grid-action
      :label="$t('MSG_BTN_DEL')"
    />
  </kw-action-top>
  <kw-grid
    :visible-rows="1"
    @init="initGrid"
  />
</template>
<script setup>

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
});

const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const currentPdCd = ref();
const currentInitData = ref({});

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
  ];

  const columns = [
    // 제품분류
    { fieldName: 'col1', header: t('MSG_TXT_PRDT_CLSF'), width: '260' },
    // 제품명
    { fieldName: 'col2', header: t('MSG_TXT_GOODS_NM'), width: '311' },
    // 제품코드
    { fieldName: 'col3', header: t('MSG_TXT_PROD_CD'), width: '163', styleName: 'text-center ' },
    // 자재코드
    { fieldName: 'col4', header: t('MSG_TXT_MATI_CODE'), width: '163', styleName: 'text-center ' },
    // 모델명
    { fieldName: 'col5', header: t('MSG_TXT_MDL_NM'), width: '229' },
    // 모델NO
    { fieldName: 'col6', header: t('MSG_TXT_PD_MODEL_NO'), width: '187', styleName: 'text-center ' },
    // 모델색상
    { fieldName: 'col7', header: t('MSG_TXT_MODEL_COLOR'), width: '187' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = false;

  data.setRows([
    { col1: '대분류 > 중분류', col2: '교재/자재명', col3: '제품코드값', col4: '자재코드값', col5: '모델명', col6: '입력값', col7: '입력값' },
  ]);
}

async function fetchData() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
}

await fetchData();

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; }, { deep: true });
</script>
