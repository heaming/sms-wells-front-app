<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbSnProcessingPsDetailP - S/N 처리현황 상세 팝업(K-W-SV-U-0078P01)
3. 작성자 : heymi.cho
4. 작성일 : 2023-08-30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
  >
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      @init="initGrid"
    />
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, defineGrid, getComponentType } from 'kw-lib';

const { t } = useI18n();
const dataService = useDataService();

const props = defineProps({
  svAsnNo: {
    type: String,
    default: () => '',
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/sn-processing-ps/pu-products', { params: { cstSvAsnNo: props.svAsnNo } });
  const services = res.data;
  totalCount.value = services.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(services);
}

onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pdNm' },
  ];

  const columns = [
    { fieldName: 'pdNm', header: t('MSG_TXT_FLTR_NM'), width: '80', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.header.minRowHeight = 30;
  view.displayOptions.minTableRowHeight = 34;
});
</script>
