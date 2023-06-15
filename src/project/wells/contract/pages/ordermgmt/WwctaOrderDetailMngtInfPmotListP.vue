<template>
  <kw-popup
    size="md"
  >
    <!-- 1. 프로모션 -->
    <h3>{{ '1.'+$t('MSG_TXT_PMOT') }}</h3>
    <kw-form>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount1"
          />
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="1"
        @init="initGridMainList"
      />
    </kw-form>
    <!-- 2. 사은품 -->
    <h3>{{ '2.'+$t('MSG_TXT_FGPT') }}</h3>
    <kw-form>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount2"
          />
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdDetailRef"
        name="grdDetail"
        :visible-rows="1"
        @init="initGridDetailList"
      />
    </kw-form>
    <template #action>
      <!-- 닫기 -->
      <kw-btn
        negative
        :label="$t('MSG_BTN_CLOSE')"
        @click="onClickClose"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, useModal } from 'kw-lib';

const dataService = useDataService();
const { t } = useI18n();
const { cancel } = useModal();

const totalCount1 = ref(0);
const totalCount2 = ref(0);

const props = defineProps({
  cntrNo: { type: String, required: true, default: '' },
  cntrSn: { type: String, required: true, default: '' },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdDetailRef = ref(getComponentType('KwGrid'));

async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/order-details/apply-promotions', { params: props });

  totalCount1.value = res.data.searchCntrPmotResList.length;
  totalCount2.value = res.data.searchFgptCntrResList.length;

  const view1 = grdMainRef.value.getView();
  view1.getDataSource().setRows(res.data.searchCntrPmotResList);
  view1.resetCurrent();

  const view2 = grdDetailRef.value.getView();
  view2.getDataSource().setRows(res.data.searchFgptCntrResList);
  view2.resetCurrent();
}

async function onClickClose() {
  cancel();
}

onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMainList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pmotCd' }, // 프로모션
    { fieldName: 'pmotNm' }, // 프로모션명
    { fieldName: 'pmotTpCd' }, // 사은품유형
    { fieldName: 'pmotTpNm' }, // 사은품유형명
  ];

  const columns = [
    { fieldName: 'pmotNm', header: t('MSG_TXT_PMOT_NM'), width: 100, styleName: 'text-left' }, // 프로모션명
    { fieldName: 'pmotTpNm', header: t('MSG_TXT_FGPT_TP'), width: 100, styleName: 'text-left' }, // 사은품유형명
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGridDetailList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'fgptPdCd' }, // 사은품상품코드
    { fieldName: 'pdNm' }, // 사은품명(상품명)
    { fieldName: 'fgptQty' }, // 사은품수량
  ];

  const columns = [
    { fieldName: 'pdNm', header: t('MSG_TXT_FGPT_NM'), width: 100, styleName: 'text-left' }, // 사은품명(상품명)
    { fieldName: 'fgptQty', header: t('MSG_TXT_QTY'), width: 100, styleName: 'text-left' }, // 사은품수량
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
