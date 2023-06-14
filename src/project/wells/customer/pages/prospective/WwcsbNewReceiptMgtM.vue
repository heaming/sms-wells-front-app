<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 고객 - 가망고객관리(CSB)
2. 프로그램 ID : WwcsbNewReceiptMgtM.vue - 신규접수 배정관리 (W-CU-U-0030M01, W-CU-U-0030M02, W-CU-U-0030M03) Outer Frame
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객 >> 가망고객 >> 신규접수 배정관리 프로그램 (Outer Frame Page)
****************************************************************************************************
#1. 각 Tab 영역의 vue File을 감싸는 Outer Frame.
#2. W-CU-U-0030M01(receiptTab): 접수조회, WwcsbNewReceiptMgtMReceipt
    W-CU-U-0030M02(assignTab): 배정조회, WwcsbNewReceiptMgtMAssign
    W-CU-U-0030M03(totalTab): 집계, WwcsbNewReceiptMgtMTotal
--->
<template>
  <kw-page>
    <kw-tabs v-model="selectedTab">
      <kw-tab
        name="receiptTab"
        :label="$t('MSG_TXT_RECEIPT_SRCH')"
      />
      <kw-tab
        name="assignTab"
        :label="$t('MSG_TIT_ASSIGN_SRCH')"
      />
      <kw-tab
        name="totalTab"
        :label="$t('MSG_TXT_AGRG')"
      />
    </kw-tabs>

    <kw-tab-panels :model-value="selectedTab">
      <!-- 접수조회 TAB -->
      <kw-tab-panel name="receiptTab">
        <wwcsb-new-receipt-mgt-m-receipt />
      </kw-tab-panel>
      <!-- 배정조회 TAB -->
      <kw-tab-panel name="assignTab">
        <wwcsb-new-receipt-mgt-m-assign />
      </kw-tab-panel>
      <!-- 집계 TAB -->
      <kw-tab-panel name="totalTab">
        <wwcsb-new-receipt-mgt-m-total />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { isEmpty } from 'lodash-es';
import wwcsbNewReceiptMgtMReceipt from './WwcsbNewReceiptMgtMReceipt.vue';
import wwcsbNewReceiptMgtMAssign from './WwcsbNewReceiptMgtMAssign.vue';
import wwcsbNewReceiptMgtMTotal from './WwcsbNewReceiptMgtMTotal.vue';

const props = defineProps({
  tabValue: { type: String, default: 'receiptTab' },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectedTab = ref('receiptTab');

onMounted(async () => {
  const { tabValue } = props;
  selectedTab.value = isEmpty(tabValue) ? 'receiptTab' : tabValue;
});
</script>
