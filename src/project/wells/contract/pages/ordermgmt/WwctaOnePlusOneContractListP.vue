<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaOnePlusOneContractListP - 1+1 대상계약 조회
3. 작성자 : gs.piit159
4. 작성일 : 2023.03.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 1+1 대상계약을 조회하기 위한 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
      </template>
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="10"
      @init="initGrid"
    />
    <template #action>
      <kw-btn
        :label="$t('MSG_BTN_CLOSE')"
        primary
        @click="onClickClose"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService, useModal } from 'kw-lib';

const dataService = useDataService();
const { t } = useI18n();
const { ok, cancel: onClickClose } = useModal();
const totalCount = ref(0);
const props = defineProps({
  cntrNo: { type: String, required: true },
  pdCd: { type: String, required: true },
});
const grdMainRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  const { data } = await dataService.get('/sms/wells/contract/contracts/oneplusone-contracts', { params: props });
  totalCount.value = data.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(data);
  view.resetCurrent();
}

/* async function isAvailableOneplusone(row) {
  const { data } = await dataService.get('/sms/wells/contract/contracts/oneplusone-contracts/check', { params: row });
  return data;
} */

onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cstKnm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'pdNm' },
    { fieldName: 'basePdCd' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
  ];

  const columns = [
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: 100 },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: 100, styleName: 'text-center' },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: 100, styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: 100 },
    { fieldName: 'basePdCd', header: t('TXT_MSG_PD_CD'), width: 100, styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_CANC_DT'), width: 100, styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_KEEP_PTRM'), width: 100, styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellDblClicked = async (grid, { dataRow, cellType }) => {
    const row = gridUtil.getRowValue(grid, dataRow);
    if (cellType === 'data') {
      ok(row);
      /* if (await isAvailableOneplusone(row)) {
        ok(row);
      } */
    }
  };
});
</script>
