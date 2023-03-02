<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEE
2. 프로그램 ID : WwfeeIndividualFeeDetailListP - 수수료 개인별 상세조회(공통)-건수확인
3. 작성자 : seoin.jeon
4. 작성일 : 2023.02.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 개인별 상세조회(공통)-건수확인
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
        <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
      </template>

      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="10"
      @init="initGrdMain"
    />
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, gridUtil } from 'kw-lib';

const dataService = useDataService();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);

const props = defineProps({
  perfYm: { // 실적년월
    type: String,
    required: true,
  },
  no: { // 번호
    type: String,
    required: true,
  },
});

const params = ref({
  perfYm: props.perfYm,
  no: props.no,
});

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/individual-fees/details', params.value);

  totalCount.value = res.data.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: '실적상세',
    timePostfix: true,
  });
}

onMounted(async () => {
  fetchData();
});
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
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '119', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_EMPL_NM'), width: '121', styleName: 'text-left' },
    { fieldName: 'col3', header: t('MSG_TXT_ATT_RCPDT'), width: '119', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_SL_DT'), width: '119', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_CNTR_NO'), width: '119', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_PD_IZ'), width: '239', styleName: 'text-left' },
    { fieldName: 'col7', header: t('MSG_TXT_CST_NM'), width: '119', styleName: 'text-left' },
    { fieldName: 'col8', header: t('MSG_TXT_SLS_CAT'), width: '119', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_PD_ACC_CNT'), width: '119', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_BFSVC_ACKMT_CT'), width: '119', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_ENVR_ELHM') + t('MSG_TXT_RENTAL'), width: '119', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_ENVR_ELHM') + t('MSG_TXT_SNGL_PMNT'), width: '119', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_ENVR_ELHM') + t('MSG_TXT_FXAM'), width: '119', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});
</script>
