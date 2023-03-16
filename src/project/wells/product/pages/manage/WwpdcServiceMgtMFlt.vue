<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcServiceMgtMFlt - 서비스 관리 - 서비스 등록/변경 - 상품필터 교체관리 ( W-PD-U-0022M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 서비스 등록/변경 - 상품필터 교체관리 프로그램
- Wells 특화
- 2023.01.06 - Sprint #4 개발예정
****************************************************************************************************
--->
<template>
  <!-- 교재/자재 -->
  <h3>{{ $t('MSG_TXT_PD_MNL_MAT') }}</h3>
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
      dense
      :label="$t('MSG_BTN_DEL')"
    />
    <kw-separator
      spaced
      vertical
      inset
    />
    <!-- 정기B/S투입 필터/부품 연결 -->
    <kw-btn
      dense
      :label="$t('MSG_TXT_PD_SCH_BS_REL_PART')"
    />
    <!-- 정기B/S투입정보 -->
    <kw-btn
      dense
      :label="$t('MSG_TXT_PD_SCH_BS_INFO')"
    />
  </kw-action-top>
  <kw-grid
    :visible-rows="1"
    @init="initGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
/* eslint-disable no-use-before-define */
defineExpose({
  isModifiedProps, validateProps, resetData, getSaveData,
});

const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function isModifiedProps() {
  return false;
}

async function validateProps() {
  return true;
}

async function resetData() {
  console.log('TODO restData');
}

async function getSaveData() {
  const subList = { saveFields: [] };
  return subList;
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
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
    { fieldName: 'col4', header: t('MSG_TXT_MATI_CD'), width: '163', styleName: 'text-center ' },
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
</script>
