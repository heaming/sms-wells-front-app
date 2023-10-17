<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC (배정관리)
 2. 프로그램 ID : WwsncExpProductP - 예정부품(프로그램ID 채번예정)
 3. 작성자 : leeminwoo
 4. 작성일 : 2023.10.16
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 예정부품현황 팝업 (http://localhost:3000/#/service/wwsnc-exp-product)
 ****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
    title="예정부품"
    no-action
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalCount" />
      </template>
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      :visible-rows="10"
      @init="initGrdMain"
    />
  </kw-popup>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const baseUrl = '/sms/wells/service/exp-product';

const totalCount = ref(0);
let cachedParams;

const props = defineProps({
  cntrNo: {
    type: String,
    required: true,
    default: '',
  },
  cntrSn: {
    type: String,
    required: true,
    default: '',
  },
  cstSvAsnNo: {
    type: String,
    required: true,
    default: '',
  },
});

const searchParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  cstSvAsnNo: props.cstSvAsnNo,
});

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get(`${baseUrl}`, { params: { ...cachedParams } });
  totalCount.value = res.data.length;
  const list = res.data;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'puQty' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '150', styleName: 'text-center' }, // 자재코드
    { fieldName: 'pdNm', header: t('MSG_TXT_FLTR_NM'), width: '120', styleName: 'text-left' }, // 필터명
    { fieldName: 'puQty', header: t('MSG_TXT_QTY'), width: '40', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0' }, // 수량
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
