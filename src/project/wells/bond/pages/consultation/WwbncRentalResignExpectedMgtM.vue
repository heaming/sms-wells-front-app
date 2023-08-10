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
            :ref="(vm) => tabRefs.expected = vm"
          />
        </kw-tab-panel>
        />
        <kw-tab-panel name="confirm">
          <Wwbnc-rental-resign-expected-mgt-m-confirm
            :ref="(vm) => tabRefs.confirm = vm"
          />
        </kw-tab-panel>
        <kw-tab-panel name="resign">
          <Wwbnc-rental-resign-expected-mgt-m-resign
            :ref="(vm) => tabRefs.resign = vm"
          />
        </kw-tab-panel>
      </kw-tab-panels>
    </kw-observer>
  </kw-page>
</template>
<script setup>
import WwbncRentalResignExpectedMgtMExpected from './WwbncRentalResignExpectedMgtMExpected.vue';
import WwbncRentalResignExpectedMgtMConfirm from './WwbncRentalResignExpectedMgtMConfirm.vue';
import WwbncRentalResignExpectedMgtMResign from './WwbncRentalResignExpectedMgtMResign.vue';

const tabRefs = reactive({});
const selectedTab = ref('expected');
</script>
