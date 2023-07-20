<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncRentalResignExpectedMgtM - 직권해지관리
3. 작성자 : gilyong.han
4. 작성일 : 2023.07.18
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs
      v-model="selectedTab"
    >
      <kw-tab
        name="expected"
        :label="$t('MSG_TIT_RENTAL_RSG_EXP')"
      />
      <kw-tab
        name="confirm"
        :label="$t('MSG_TIT_RENTAL_RSG_CNFM')"
      />
      <kw-tab
        name="resign"
        :label="$t('MSG_TIT_RGLR_SPP_RSG')"
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
        <kw-tab-panel name="expected">
          <Wwbnc-rental-resign-expected-mgt-m-expected
            :ref="(vm) => tabRefs.object = vm"
          />
        </kw-tab-panel>
        <!-- />
        <kw-tab-panel name="confirm">
          <wwbnc-unpaid-guide-urgent-mgt-m-exclude
            :ref="(vm) => tabRefs.exclude = vm"
          />
        </kw-tab-panel>
        <kw-tab-panel name="resign">
          <wwbnc-unpaid-guide-urgent-mgt-m-exclude
            :ref="(vm) => tabRefs.exclude = vm"
          />
        </kw-tab-panel> -->
      </kw-tab-panels>
    </kw-observer>
  </kw-page>
</template>
<script setup>
import WwbncRentalResignExpectedMgtMExpected from './WwbncRentalResignExpectedMgtMExpected.vue';
// import WwbncUnpaidGuideUrgentMgtMObject from './WwbncUnpaidGuideUrgentMgtMObject.vue';

const tabRefs = reactive({});
const selectedTab = ref('expected');
</script>
