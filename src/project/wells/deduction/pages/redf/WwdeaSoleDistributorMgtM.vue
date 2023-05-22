<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DEA
2. 프로그램 ID : WwdeaSoleDistributorMgtM
3. 작성자 : daewon.kim
4. 작성일 : 2023.05.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 총판/B2B 되물림 생성/관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs v-model="selectedTab">
      <kw-tab
        :name="selectedTabs[0]"
        :label="t('MSG_TXT_REDF_CRT')"
      />
      <kw-tab
        :name="selectedTabs[1]"
        :label="t('MSG_TXT_REDF_MGT')"
      />
    </kw-tabs>
    <kw-tab-panels :model-value="selectedTab">
      <kw-tab-panel :name="selectedTabs[0]">
        <wwdea-sole-distributor-mgt-m-create
          ref="createRef"
        />
      </kw-tab-panel>
      <kw-tab-panel :name="selectedTabs[1]">
        <wwdea-sole-distributor-mgt-m-aggregate
          ref="aggregateRef"
        />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import WwdeaSoleDistributorMgtMCreate from './WwdeaSoleDistributorMgtMCreate.vue';
import WwdeaSoleDistributorMgtMAggregate from './WwdeaSoleDistributorMgtMAggregate.vue';

const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectedTabs = ref(['createRef', 'aggregateRef']);
const selectedTab = ref(selectedTabs.value[0]);
</script>
