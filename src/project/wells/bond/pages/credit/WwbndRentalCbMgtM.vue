<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WBND
2. 프로그램 ID : WwbndRentalCbMgtM - 렌탈 CB 관리
3. 작성자 : gilyong.han
4. 작성일 : 2023.03.24
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
        name="object"
        :label="$t('MSG_TIT_RENTAL_CB_OBJECT')"
      />
      <kw-tab
        name="hist"
        :label="$t('MSG_TIT_RENTAL_CB_DLQ_HIST_INQR')"
      />
      <kw-tab
        name="talk"
        :label="$t('MSG_TIT_RENTAL_CB_NOTAK_FW_EXCD')"
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
        <kw-tab-panel name="object">
          <wwbnd-rental-cb-mgt-m-object
            :ref="(vm) => tabRefs.object = vm"
          />
        </kw-tab-panel>
        <kw-tab-panel name="hist">
          <wwbnd-rental-cb-mgt-m-history
            :ref="(vm) => tabRefs.talk = vm"
          />
        </kw-tab-panel> />
        <kw-tab-panel name="talk">
          <wwbnd-rental-cb-mgt-m-talk
            :ref="(vm) => tabRefs.talk = vm"
          />
        </kw-tab-panel>
      </kw-tab-panels>
    </kw-observer>
  </kw-page>
</template>
<script setup>
import WwbndRentalCbMgtMObject from './WwbndRentalCbMgtMObject.vue';
import WwbndRentalCbMgtMHistory from './WwbndRentalCbMgtMHistory.vue';
import WwbndRentalCbMgtMTalk from './WwbndRentalCbMgtMTalk.vue';

const tabRefs = reactive({});
const selectedTab = ref('object');
</script>
