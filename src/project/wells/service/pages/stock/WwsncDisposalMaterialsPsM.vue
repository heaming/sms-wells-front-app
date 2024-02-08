<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : WwsncDisposalMaterialsPsM(매각자재현황 - 매각자재 관리 현황(일자별) / 회수자재 집계(창고별))
3. 작성자 : heymi.cho
4. 작성일 : 2024.02.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매각자재현황 (전체) (http://localhost:3000/#/service/wwsnc-disposal-materials-ps)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs
      v-model="currentTab"
    >
      <kw-tab
        v-for="tab in tabs"
        :key="`tab-${tab.name}`"
        :name="tab.name"
        :label="tab.label"
      />
    </kw-tabs>

    <kw-tab-panels
      v-model="currentTab"
    >
      <kw-tab-panel
        v-for="tab in tabs"
        :key="`tab-panel-${tab.name}`"
        :name="tab.name"
      >
        <component
          :is="tab.panel"
        />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import WwsnaDisposalMaterialsPsListM from './WwsnaDisposalMaterialsPsListM.vue';
import WwsnaCollectionMaterialsAgrgM from './WwsnaCollectionMaterialsAgrgM.vue';

const { t } = useI18n();

/*
* Tabs
*/
const tabs = [
  { name: 'byDay', label: t('MSG_TXT_BY_DAY'), index: 0, panel: WwsnaDisposalMaterialsPsListM }, // 전체
  { name: 'byWarehouse', label: t('MSG_TXT_BY_WAREHOUSE'), index: 1, panel: WwsnaCollectionMaterialsAgrgM }, // 필터
];
const currentTab = ref(tabs[0].name); // 현재 탭페이지

</script>
<style scoped>
</style>
