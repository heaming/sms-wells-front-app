<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDCC
2. 프로그램 ID : WwdccSalesPerformM - 매출실적현황 탭(W-CL-U-0038M01)
3. 작성자 : gugyeongu
4. 작성일 : 2023.08.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매출실적현황 현황 탭 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs
      v-model="selectedTab"
    >
      <kw-tab
        name="singlePaymentExcept"
        :label="$t('MSG_TIT_SPAY_EXCP')"
      />
      <kw-tab
        name="singlePayment"
        :label="$t('MSG_TIT_SPAY')"
      />
    </kw-tabs>
    <kw-observer
      ref="obsTabRef"
      name="obsTab"
    >
      <kw-tab-panels
        v-model="selectedTab"
        keep-alive
      >
        <kw-tab-panel name="singlePaymentExcept">
          <wwdcc-sales-perform-m-single-payment-except
            :ref="(vm) => tabRefs.prpSalesBond = vm"
          />
        </kw-tab-panel>
        <kw-tab-panel name="singlePayment">
          <wwdcc-sales-perform-m-single-payment
            :ref="(vm) => tabRefs.prpDelinquentAdamt = vm"
          />
        </kw-tab-panel>
      </kw-tab-panels>
    </kw-observer>
  </kw-page>
</template>
<script setup>
import WwdccSalesPerformMSinglePaymentExcept from './WwdccSalesPerformMSinglePaymentExcept.vue';
import WwdccSalesPerformMSinglePayment from './WwdccSalesPerformMSinglePayment.vue';

const tabRefs = reactive({});
const selectedTab = ref('singlePaymentExcept');
</script>
