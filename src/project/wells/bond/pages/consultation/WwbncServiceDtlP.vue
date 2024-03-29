<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncServiceDtlP - 서비스 상세 - W-BN-U-0033P21
3. 작성자 : songmi.in
4. 작성일 : 2023.05.15 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 서비스 상세내역 조회
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
    no-action
    class="kw-popup--window-consult--style"
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
      </template>
      <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>

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
  cntrNo: {
    type: String,
    default: () => '',
  },
  cntrSn: {
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
  const res = await dataService.get('/sms/wells/bond/services', { params: props });
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
  const columns = [
    { fieldName: 'sepIstCsDtlNm', header: t('MSG_TXT_TYPE'), width: '160', styleName: 'text-center' },
    { fieldName: 'vstFshDtHh', header: t('MSG_TXT_PRCSDT'), width: '235', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'asCausNm', header: t('MSG_TXT_PROCS_CN'), width: '160', styleName: 'text-left' },
    { fieldName: 'bilOjAmt', header: t('MSG_TXT_SV_CS'), width: '160', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'dpSumAmt', header: t('MSG_TXT_DP'), width: '160', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'blam', header: t('MSG_TXT_BLAM'), width: '160', styleName: 'rg-button-link text-right', dataType: 'number', numberFormat: '#,##0', renderer: { type: 'button' }, preventCellItemFocus: true },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.header.minRowHeight = 30;
  view.displayOptions.minTableRowHeight = 34;
});

</script>
