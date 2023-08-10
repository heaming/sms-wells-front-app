<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfActivityGoodsDeductionInformationDtlP - 활동물품관리-공제정보
3. 작성자 : jisung you
4. 작성일 : 2023.07.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-활동물품관리-공제정보
****************************************************************************************************
--->
<template>
  <kw-popup
    size="lg"
  >
    <kw-grid
      ref="grdPopupRef"
      :visible-rows="10"
      @init="initGrdPopup"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid, useDataService, useMeta } from 'kw-lib';

const { getUserInfo } = useMeta();
const userInfo = getUserInfo();
const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdPopupRef = ref(getComponentType('KwGrid'));
async function fetchData() {
  const cachedParams = {
    ogTpCd: userInfo.ogTpCd,
  };

  const res = await dataService.get('/sms/wells/competence/business/activity/deductionItemization', { params: cachedParams });
  const view = grdPopupRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdPopup = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'feeDdtnDstAmt', dataType: 'number' },
    { fieldName: 'feeDdtnOcDt' },
    { fieldName: 'actiGdsNm' },
    { fieldName: 'aplcDt' },

  ];

  const columns = [
    { fieldName: 'feeDdtnOcDt', header: t('MSG_TXT_DDTN_YR_MM'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'actiGdsNm', header: t('MSG_TXT_ITEM'), width: '200', styleName: 'text-left' },
    { fieldName: 'feeDdtnDstAmt', header: t('MSG_TXT_DDCTAM'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'aplcDt', header: t('MSG_TXT_APL_DATE'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

onMounted(async () => {
  await fetchData();
});
</script>
