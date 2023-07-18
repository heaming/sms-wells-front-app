<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNA
2. 프로그램 ID : WwbncUnpaidGuideUrgentMgtM - 미납요금 안내/촉구 대상 관리
3. 작성자 :
4. 작성일 : 2023.06.26
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
        :label="$t('MSG_TIT_GUD_URGT_OJ')"
      />
      <kw-tab
        name="exclude"
        :label="$t('MSG_TIT_GUD_URGT_OJ_EXCD')"
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
          <wwbnc-unpaid-guide-urgent-mgt-m-object
            :ref="(vm) => tabRefs.object = vm"
          />
        </kw-tab-panel>
        />
        <kw-tab-panel name="exclude">
          <wwbnc-unpaid-guide-urgent-mgt-m-exclude
            :ref="(vm) => tabRefs.exclude = vm"
          />
        </kw-tab-panel>
      </kw-tab-panels>
    </kw-observer>
  </kw-page>
</template>
<script setup>
import WwbncUnpaidGuideUrgentMgtMExclude from './WwbncUnpaidGuideUrgentMgtMExclude.vue';
import WwbncUnpaidGuideUrgentMgtMObject from './WwbncUnpaidGuideUrgentMgtMObject.vue';

const tabRefs = reactive({});
const selectedTab = ref('object');
</script>
