<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCA
2. 프로그램 ID : WwdcaMembershipCheckM - 멤버십 확정 체크리스트
3. 작성자 : Kicheol Choi
4. 작성일 : 2023.04.03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 멤버십 확정 체크리스트
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs v-model="selectedTab">
      <kw-tab
        :name="selectedTabs[0]"
        :label="$t('MSG_TIT_CHECK_LIST_BEFORE')"
      />
      <kw-tab
        :name="selectedTabs[1]"
        :label="$t('MSG_TIT_CHECK_LIST_AFTER')"
      />
    </kw-tabs>
    <kw-tab-panels :model-value="selectedTab">
      <kw-tab-panel :name="selectedTabs[0]">
        <wwdca-membership-check-m-before
          ref="cmpBeforeRef"
        />
      </kw-tab-panel>
      <kw-tab-panel :name="selectedTabs[1]">
        <wwdca-membership-check-m-after
          ref="cmpAfterRef"
        />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import WwdcaMembershipCheckMBefore from './WwdcaMembershipCheckMBefore.vue';
import WwdcaMembershipCheckMAfter from './WwdcaMembershipCheckMAfter.vue';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectedTabs = ref(['before', 'after']);
const selectedTab = ref(selectedTabs.value[0]);

</script>
