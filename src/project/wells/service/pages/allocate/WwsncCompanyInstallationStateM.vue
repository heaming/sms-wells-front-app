<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : WwsncCompanyInstallationStateM(회사설치(8888코드)현황)
3. 작성자 : heymi.cho
4. 작성일 : 2023.05.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 회사설치 (8888코드) 현황 (http://localhost:3000/#/service/wwsnc-as-charge-transfer-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈', '설치관리', '설치현황', '회사설치(8888코드) 현황']" />
    </template>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
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
import WwsncCompanyInstallationStateMAll from './WwsncCompanyInstallationStateMAll.vue';
import WwsncCompanyInstallationStateMFltr from './WwsncCompanyInstallationStateMFltr.vue';
import WwsncCompanyInstallationStateMSubMat from './WwsncCompanyInstallationStateMSubMat.vue';
import WwsncCompanyInstallationStateMPs from './WwsncCompanyInstallationStateMPs.vue';

const { t } = useI18n();

/*
* Tabs
*/
const tabs = [
  { name: 'all', label: t('MSG_TXT_ALL'), index: 0, panel: WwsncCompanyInstallationStateMAll }, // 전체
  { name: 'filters', label: t('MSG_TXT_FLTR'), index: 1, panel: WwsncCompanyInstallationStateMFltr }, // 필터
  { name: 'submat', label: t('MSG_TXT_SUBMAT'), index: 2, panel: WwsncCompanyInstallationStateMSubMat }, // 부자재
  { name: 'state', label: t('MSG_TXT_PS'), index: 3, panel: WwsncCompanyInstallationStateMPs }, // 현황
];
const currentTab = ref(tabs[0].name); // 현재 탭페이지

</script>
<style scoped>
</style>
