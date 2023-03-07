<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID :WwbncBondCounselM
3. 작성자 : sunghun.choi
4. 작성일 : 2023.02.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 채권상담 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs v-model="selectedTab">
      <kw-tab
        name="tab1"
        :label="$t('MSG_TXT_CST_LIST')"
      />
      <kw-tab
        name="tab2"
        :label="$t('MSG_TXT_CNTR_LIST')"
      />
      <kw-tab
        name="tab3"
        :label="$t('MSG_TXT_CST_SRCH')"
      />
      <kw-tab
        name="tab4"
        :label="$t('MSG_TXT_PROM_CST_SRCH')"
      />
    </kw-tabs>
    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="tab1">
        <wwbnc-bond-counsel-m-customer
          :ref="(vm) => tabRefs.tab1 = vm"
          v-model:items-checked="itemsChecked.tab1"
        />
      </kw-tab-panel>
      <kw-tab-panel name="tab2">
        <wwbnc-bond-counsel-m-contract
          :ref="(vm) => tabRefs.tab2 = vm"
          v-model:items-checked="itemsChecked.tab2"
        />
      </kw-tab-panel>
      <kw-tab-panel name="tab3">
        <wwbnc-bond-counsel-m-customer-search
          :ref="(vm) => tabRefs.tab3 = vm"
          v-model:items-checked="itemsChecked.tab3"
        />
      </kw-tab-panel>
      <kw-tab-panel name="tab4">
        <zwbnc-bond-counsel-m-promise-customer
          :ref="(vm) => tabRefs.tab4 = vm"
          v-model:items-checked="itemsChecked.tab4"
        />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import ZwbncBondCounselMPromiseCustomer from '~sms-common/bond/pages/consultation/ZwbncBondCounselMPromiseCustomer.vue';
import WwbncBondCounselMCustomerSearch from './WwbncBondCounselMCustomerSearch.vue';
import WwbncBondCounselMCustomer from './WwbncBondCounselMCustomer.vue';
import WwbncBondCounselMContract from './WwbncBondCounselMContract.vue';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const tabRefs = reactive({});
const selectedTab = ref('tab1');
const itemsChecked = reactive({ page: false, link: false });

</script>
