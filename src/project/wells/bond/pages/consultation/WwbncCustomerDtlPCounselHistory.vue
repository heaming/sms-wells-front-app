<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncCustomerDtlPCounselHistory
3. 작성자 : sunghun.choi
4. 작성일 : 2023.02.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 채권상담 고객리스트 탭 고객상세팝업 상담이력 탭
- 채권상담 고객상세에 상담이력 정보를 조회
****************************************************************************************************
--->
<template>
  <kw-grid
    ref="grdMainRef"
    name="grdMain5"
    :visible-rows="5"
    class="mt16"
    @init="initGrdMain"
  />
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const props = defineProps({
  cstNo: {
    type: String,
    required: true,
  },

});

let cachedParams;
const searchParams = ref({
  schBaseYm: '',
  schCstNo: props.cstNo,
  schCntrNo: '',
  schCntrSn: '',
});

const grdMainRef = ref();

async function fetchCounselHistory() {
  const response = await dataService.get('/sms/wells/bond/bond-counsel/counsel-history', { params: cachedParams });
  const historys = response.data;
  const gridView = grdMainRef.value.getView();
  gridView.getDataSource().setRows(historys);
}

onMounted(async () => {
  cachedParams = cloneDeep(searchParams.value);
  await fetchCounselHistory();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'inDt' },
    { fieldName: 'inIchr' },
    { fieldName: 'inIchrNm' },
    { fieldName: 'cnslPh' },
    { fieldName: 'crncyRs' },
    { fieldName: 'dprNm' },
    { fieldName: 'cnslCn' },

  ];

  const columns = [
    { fieldName: 'inDt', header: t('MSG_TXT_IN_DT'), width: '200', styleName: 'text-center' },
    { fieldName: 'inIchr', header: t('MSG_TXT_IN_ICHR'), width: '100', styleName: 'text-center' },
    { fieldName: 'inIchrNm', header: t('MSG_TXT_IN_ICHR_NM'), width: '90', styleName: 'text-left' },
    { fieldName: 'cnslPh', header: t('MSG_TXT_CNSL_PH'), width: '90', styleName: 'text-center' },
    { fieldName: 'crncyRs', header: t('MSG_TXT_CRNCY_RS'), width: '110', styleName: 'text-left' },
    { fieldName: 'dprNm', header: t('MSG_TXT_DPR_NM'), width: '120' },
    { fieldName: 'cnslCn', header: t('MSG_TXT_CNSL_CN'), styleName: 'text-cenleftter' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
}
</script>
