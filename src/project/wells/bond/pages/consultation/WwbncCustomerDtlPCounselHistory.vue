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
import { useDataService, useGlobal, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const { modal } = useGlobal();

const props = defineProps({
  cstNo: {
    type: String,
    required: true,
  },
  cntrNo: {
    type: String,
    required: true,
  },
  cntrSn: {
    type: String,
    required: true,
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const searchParams = ref({
  schBaseYm: '',
  schCstNo: '',
  schCntrNo: '',
  schCntrSn: '',
});

const grdMainRef = ref();

async function fetchCounselHistory() {
  searchParams.value.schCstNo = props.cstNo;
  searchParams.value.schCntrNo = props.cntrNo;
  searchParams.value.schCntrSn = props.cntrSn;

  cachedParams = cloneDeep(searchParams.value);

  const response = await dataService.get('/sms/wells/bond/bond-counsel/counsel-history', { params: cachedParams });
  const historys = response.data;
  const gridView = grdMainRef.value.getView();
  gridView.getDataSource().setRows(historys);
}

defineExpose({
  fetchCounselHistory,
});

watch(() => props.cstNo, async (newVal) => {
  if (newVal) {
    fetchCounselHistory();
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'telCnslId' },
    { fieldName: 'inDt' },
    { fieldName: 'inIchr' },
    { fieldName: 'inIchrNm' },
    { fieldName: 'cnslPh' },
    { fieldName: 'crncyRs' },
    { fieldName: 'dprNm' },
    { fieldName: 'cnslCn' },

  ];
  const columns = [
    { fieldName: 'telCnslId', width: '200', styleName: 'text-center', visible: false },
    { fieldName: 'inDt', header: t('MSG_TXT_IN_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'inIchr', header: t('MSG_TXT_RGST_ICHR_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'inIchrNm', header: t('MSG_TXT_RGST_PSIC'), width: '90', styleName: 'text-center' },
    { fieldName: 'cnslPh', header: t('MSG_TXT_CNSL_PH'), width: '90', styleName: 'text-center' },
    { fieldName: 'crncyRs', header: t('MSG_TXT_CRNCY_RS'), width: '110', styleName: 'text-center' },
    { fieldName: 'dprNm', header: t('MSG_TXT_DPR_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'cnslCn', header: t('MSG_TXT_CNSL_CN'), styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;

  view.onCellDblClicked = async (g, clickData) => {
    if (clickData.cellType === 'data') {
      const { telCnslId } = gridUtil.getRowValue(g, clickData.itemIndex);
      if (telCnslId) {
        await modal({
          component: 'ZwbncCounselDtlP',
          componentProps: { telCnslId },
        });
      }
    }
  };
}
</script>
