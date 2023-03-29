<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbHoldingCustomerPsListM - 보류고객현황 화면
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.03.29
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 보류고객현황 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_CNTR_PTRM')">
          <kw-date-range-picker
            :label="$t('MSG_TXT_CNTR_PTRM')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_DIV')">
          <kw-select
            :label="$t('MSG_TXT_DIV')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_CNTR_NO')">
          <kw-input
            :label="$t('MSG_TXT_CNTR_NO')"
            icon="search"
            clearable
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="156" />
        </template>
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrdMain"
      />
      <h3>{{ t('MSG_TXT_CNT_DTL') }}</h3>
      <kw-input
        v-model="textarea"
        type="textarea"
        :rows="3"
        readonly
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid } from 'kw-lib';

const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const textarea = ref(`1. 김교원
2. 비데(BN150RWA), 렌탈료 8900
`);
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_GNR_MNG'), width: '100', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_RCPDT'), width: '120', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_CNTR_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_CST_NM'), width: '100' },
    { fieldName: 'col6', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_CTT_CNTN'), width: '410', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_DTL_BRWS'), width: '145', styleName: 'text-center', renderer: { type: 'button' } },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  data.setRows([
    { col1: 'Z950020', col2: '티앤씨', col3: '2022-12-12', col4: 'W2022-1234567-12', col5: '김교원', col6: '안마블랙브라운557PRA', col7: '91 고객이 계약을 취소하고자함. 고객과 신속히 재접촉요망!', col8: '상세보기' },
    { col1: 'Z950020', col2: '티앤씨', col3: '2022-12-12', col4: 'W2022-1234567-12', col5: '김교원', col6: '안마블랙브라운557PRA', col7: '91 고객이 계약을 취소하고자함. 고객과 신속히 재접촉요망!', col8: '상세보기' },
    { col1: 'Z950020', col2: '티앤씨', col3: '2022-12-12', col4: 'W2022-1234567-12', col5: '김교원', col6: '안마블랙브라운557PRA', col7: '91 고객이 계약을 취소하고자함. 고객과 신속히 재접촉요망!', col8: '상세보기' },
    { col1: 'Z950020', col2: '티앤씨', col3: '2022-12-12', col4: 'W2022-1234567-12', col5: '김교원', col6: '안마블랙브라운557PRA', col7: '91 고객이 계약을 취소하고자함. 고객과 신속히 재접촉요망!', col8: '상세보기' },
    { col1: 'Z950020', col2: '티앤씨', col3: '2022-12-12', col4: 'W2022-1234567-12', col5: '김교원', col6: '안마블랙브라운557PRA', col7: '91 고객이 계약을 취소하고자함. 고객과 신속히 재접촉요망!', col8: '상세보기' },
    { col1: 'Z950020', col2: '티앤씨', col3: '2022-12-12', col4: 'W2022-1234567-12', col5: '김교원', col6: '안마블랙브라운557PRA', col7: '91 고객이 계약을 취소하고자함. 고객과 신속히 재접촉요망!', col8: '상세보기' },
    { col1: 'Z950020', col2: '티앤씨', col3: '2022-12-12', col4: 'W2022-1234567-12', col5: '김교원', col6: '안마블랙브라운557PRA', col7: '91 고객이 계약을 취소하고자함. 고객과 신속히 재접촉요망!', col8: '상세보기' },
    { col1: 'Z950020', col2: '티앤씨', col3: '2022-12-12', col4: 'W2022-1234567-12', col5: '김교원', col6: '안마블랙브라운557PRA', col7: '91 고객이 계약을 취소하고자함. 고객과 신속히 재접촉요망!', col8: '상세보기' },
    { col1: 'Z950020', col2: '티앤씨', col3: '2022-12-12', col4: 'W2022-1234567-12', col5: '김교원', col6: '안마블랙브라운557PRA', col7: '91 고객이 계약을 취소하고자함. 고객과 신속히 재접촉요망!', col8: '상세보기' },
    { col1: 'Z950020', col2: '티앤씨', col3: '2022-12-12', col4: 'W2022-1234567-12', col5: '김교원', col6: '안마블랙브라운557PRA', col7: '91 고객이 계약을 취소하고자함. 고객과 신속히 재접촉요망!', col8: '상세보기' },
  ]);
});
</script>
<style scoped lang="scss">
::v-deep(.kw-field.q-field--readonly) {
  .q-field__control {
    background-color: #fff;
  }

  .q-field__native {
    color: #222;
  }
}
</style>
