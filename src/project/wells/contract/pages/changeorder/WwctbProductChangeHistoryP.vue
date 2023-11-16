<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : [W-SS-U-0101P03] WwctbProductChangeHistoryP - 계약유형 변경이력
3. 작성자 : yeongjoong.kim
4. 작성일 : 2023-08-03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품변경 등 계약변경으로 인해 발생된 건에 대한 이력을 조회한다.
- 해당 팝업 호출 시, 계약번호, 계약일련번호를 받을 수 있도록 한다.
****************************************************************************************************
-->
<template>
  <kw-popup
    size="3xl"
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalCount" />
      </template>
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      :visible-rows="10"
      @init="initGrid"
    />
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType } from 'kw-lib';

const dataService = useDataService();
const { t } = useI18n();

const props = defineProps({
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
const totalCount = ref(0);
const grdMainRef = ref(getComponentType('KwGrid'));

async function fetchData() {
  const { data } = await dataService.get('/sms/wells/contract/changeorder/product-change-histories', { params: { ...props } });
  totalCount.value = data.length;

  data.forEach((row) => {
    row.cntrNoSn = `${row.cntrNo}-${row.cntrSn}`;
  });

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(data);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'cntrChDt' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrChTpNm' },
    { fieldName: 'basePdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'svPrd' },
    { fieldName: 'stplPtrm' },
    { fieldName: 'cntrChAkCn' },

    { fieldName: 'cntrNoSn' },
  ];

  const columns = [
    { fieldName: 'cntrChDt', header: t('MSG_TXT_CH_DT2'), width: '90', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 변경일
    { fieldName: 'cntrNoSn', header: t('MSG_TXT_CNTR_DTL_NO'), width: '120', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cntrChTpNm', header: t('MSG_TXT_AFCH_TP_NM'), width: 'auto', styleName: 'text-left' }, // 변경유형명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: 'auto', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: 'auto', styleName: 'text-left' }, // 상품명
    { fieldName: 'svPrd',
      header: t('MSG_TXT_BS_CYC'),
      width: '70',
      styleName: 'text-center',
      displayCallback(g, index, val) {
        return val ? `${val}${t('MSG_TXT_MCNT')}` : ''; // 개월
      } }, // BS주기
    { fieldName: 'stplPtrm',
      header: t('MSG_TXT_DUTY_STPL'),
      width: '80',
      styleName: 'text-center',
      displayCallback(g, index, val) {
        return `${val}${t('MSG_TXT_YEAR')}`; // 년
      } }, // 의무약정
    { fieldName: 'cntrChAkCn', header: t('MSG_TXT_ETC_CH_ARTC'), width: '500', styleName: 'text-left' }, // 기타 변경사항
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
}

onMounted(async () => {
  await fetchData();
});
</script>
