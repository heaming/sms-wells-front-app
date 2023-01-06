<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMPrice - 기준상품 등록/변경 - 연결상품 선택 - 판매상품( W-PD-U-0010M01 )
3. 작성자 : gs.piit141
4. 작성일 : 2023.06.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 연결상품 선택 - 판매상품 프로그램
****************************************************************************************************
--->
<template>
  <!-- 교재/자재 -->
  <h3>{{ $t('MSG_TXT_PD_MNL_MAT') }}</h3>
  <kw-action-top>
    <template #left>
      <!-- 교재/자재 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_MNL_MAT_SEL') }}</span>
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
      :label="$t('MSG_BTN_RMV_FIL')"
    />
  </kw-action-top>
  <kw-grid
    :visible-rows="1"
    @init="initGrid"
  />
  <!-- 서비스 -->
  <h3>{{ $t('MSG_TXT_SERVICE') }}</h3>
  <kw-action-top>
    <template #left>
      <!-- 서비스 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_SVC_SEL') }}</span>
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
    @init="initGrid2"
  />
  <!-- 동시구매가능 기준상품 -->
  <h3>{{ $t('MSG_TXT_PD_PUR_SIM') }}</h3>
  <kw-action-top>
    <template #left>
      <!-- 기준상품 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_SEL_STD') }}</span>
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
      :label="$t('MSG_BTN_RMV_FIL')"
    />
  </kw-action-top>
  <kw-grid
    :visible-rows="1"
    @init="initGrid3"
  />
</template>
<script setup>

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
});

const { t } = useI18n();

const currentPdCd = ref();
const currentInitData = ref({});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
  ];

  const columns = [
    // 상태
    { fieldName: 'col1', header: t('MSG_TXT_STATUS'), width: '135', styleName: 'text-center' },
    // 교재/자재 분류
    { fieldName: 'col2', header: t('MSG_TXT_PD_BOK_MTR_TYPE'), width: '371' },
    // 교재/자재명
    { fieldName: 'col3', header: t('MSG_TXT_PD_BOK_MTR_NAME'), width: '306' },
    // 제품코드
    { fieldName: 'col4', header: t('MSG_TXT_PROD_CD'), width: '185', styleName: 'text-center ' },
    // 자재코드
    { fieldName: 'col5', header: t('MSG_TXT_MATI_CODE'), width: '187', styleName: 'text-center ' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = false;

  data.setRows([
    { col1: '임시저장', col2: '대분류 > 중분류', col3: '교재/자재명', col4: '상품코드', col5: '코드값' },
  ]);
}

function initGrid2(data, view) {
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
    // 필수여부
    { fieldName: 'col1', header: t('MSG_TXT_NCSR_YN'), width: '85', styleName: 'text-center' },
    // 상태
    { fieldName: 'col2', header: t('MSG_TXT_STATUS'), width: '135', styleName: 'text-center' },
    // 서비스 분류
    { fieldName: 'col3', header: t('MSG_TXT_SVC_CATG'), width: '371' },
    // 서비스명
    { fieldName: 'col4', header: t('MSG_TXT_SVC_NAME'), width: '306' },
    // 서비스코드
    { fieldName: 'col5', header: t('MSG_TXT_SVC_CODE'), width: '185', styleName: 'text-center ' },
    // 주기단위/방문주기
    { fieldName: 'col6', header: t('MSG_TXT_PD_UNIT_VISIT_PERI'), width: '187', styleName: 'text-center ' },
    // 주기단위/택배주기
    { fieldName: 'col7', header: t('MSG_TXT_PD_UNIT_PARCEL_PERI'), width: '187', styleName: 'text-center ' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = false;

  data.setRows([
    { col1: 'Y', col2: '임시저장', col3: '대분류 > 중분류', col4: '서비스명', col5: '서비스코드', col6: '주/1회', col7: '주/1회' },
  ]);
}
function initGrid3(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
  ];

  const columns = [
    // 상태
    { fieldName: 'col1', header: t('MSG_TXT_STATUS'), width: '135', styleName: 'text-center' },
    // 기준상품 분류
    { fieldName: 'col2', header: t('MSG_TXT_PD_STD_TYPE'), width: '371' },
    // 기준상품명
    { fieldName: 'col3', header: t('MSG_TXT_PD_STD_NAME'), width: '306' },
    // 기준상품코드
    { fieldName: 'col4', header: t('MSG_TXT_PD_STD_CODE'), width: '185', styleName: 'text-center ' },
    // 판매유형
    { fieldName: 'col5', header: t('MSG_TXT_SEL_TYPE'), width: '187', styleName: 'text-center ' },
    // 판매채널
    { fieldName: 'col6', header: t('MSG_TXT_SEL_CHNL'), width: '187', styleName: 'text-center ' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = false;

  data.setRows([
    { col1: '임시저장', col2: '대분류 > 중분류', col3: '기준상품명', col4: '상품코드', col5: '일시불', col6: '방판' },
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
