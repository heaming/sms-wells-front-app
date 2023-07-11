<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaReceiptBulkUploadMRental - 대량 접수자료 업로드
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.04.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 대량 접수자료 업로드
****************************************************************************************************
--->
<template>
  <h3>렌탈 접수자료 업로드</h3>
  <kw-action-top>
    <template #left>
      <kw-paging-info
        :total-count="pageInfo.totalCount"
      />
    </template>
    <kw-btn
      icon="upload_on"
      dense
      secondary
      label="엑셀업로드"
      @click="onClickExcelUpload"
    />
    <kw-separator
      vertical
      inset
      spaced
    />
    <kw-btn
      dense
      secondary
      label="업로드 코드 확인"
      @click="onClickCheckCode"
    />
    <kw-separator
      vertical
      inset
      spaced
    />
    <kw-btn
      dense
      primary
      label="등록"
      @click="onClickConfirm"
    />
  </kw-action-top>
  <kw-grid
    ref="grdRef"
    name="grdRental"
    :visible-rows="visibleRows"
    @init="initGrd"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, modal } from 'kw-lib';
import useGridDataModel from '~sms-common/contract/composable/useGridDataModel';

const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
// const grdView = computed(() => grdRef.value?.getView());
// const grdData = computed(() => grdRef.value?.getData());
const pageInfo = ref({
  totalCount: 0,
});
const visibleRows = computed(() => Math.min(Math.max(pageInfo.value.totalCount, 1), 5));
let gridDataModel;
function onClickConfirm() {
}

function onClickCheckCode() {
}

async function onClickExcelUpload() {
  const { result, payload } = await modal({
    component: 'ZctzExcelUploadP',
    componentProps: {
      columns: gridDataModel.columns,
    },
  });
  if (result) {
    console.log(payload);
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd = defineGrid((data, view) => {
  gridDataModel = useGridDataModel(view, {
    col1: { label: t('MSG_TXT_REG_FILE'), width: 133, classes: 'text-center' },
    col2: { label: t('MSG_TXT_RGST_DT'), width: 146, classes: 'text-center', datetimeFormat: 'date' },
    col3: { label: t('MSG_TXT_FST_RGST_USR'), width: 146, classes: 'text-center' },
    col4: { label: t('MSG_TXT_RGR_EMPNO'), width: 146, classes: 'text-center' },
    col5: { label: t('MSG_TXT_PRDT_CODE'), width: 128, classes: 'text-center' },
    col6: { label: t('MSG_TXT_PRDT_NM'), width: 290, classes: 'text-left' },
    col7: { label: t('MSG_TXT_RCP_D'), width: 128, classes: 'text-center', datetimeFormat: 'date' },
    col8: { label: t('MSG_TXT_CNTOR_NM'), width: 128, classes: 'text-center' },
    col9: { label: t('MSG_TXT_RGST_FEE'), width: 128, classes: 'text-right' },
    col10: { label: t('MSG_TXT_VAR_MNTHS'), width: 128, classes: 'text-center' },
    col11: { label: t('MSG_TXT_STL_DV'), width: 128, classes: 'text-center' },
    col12: { label: t('MSG_TXT_BIRTH_DATE'), width: 128, classes: 'text-center', datetimeFormat: 'date' },
    col13: { label: t('MSG_TXT_GENDER_MF'), width: 128, classes: 'text-center' },
    col14: { label: t('MSG_TXT_MPNO'), width: 128, classes: 'text-center' },
    col15: { label: t('MSG_TXT_ZIP'), width: 128, classes: 'text-center' },
    col16: { label: t('MSG_TXT_ADDR'), width: 275, classes: 'text-left' },
    col17: { label: `${t('MSG_TXT_FGPT')}1`, width: 128, classes: 'text-center' },
    col18: { label: `${t('MSG_TXT_FGPT')}2`, width: 128, classes: 'text-center' },
    col19: { label: `${t('MSG_TXT_FGPT')}3`, width: 128, classes: 'text-center' },
    col20: { label: t('MSG_TXT_SUSC_ORD_NO'), width: 128, classes: 'text-center' },
  });
  view.rowIndicator.visible = true;
});

</script>
