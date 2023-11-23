<!--
 ***************************************************************************************************
 * 프로그램 개요
 ***************************************************************************************************
 1. 모듈 : 일자별 설치재고 현황
 2. 프로그램 ID : WwsnaInstallationStockPsByDayM
 3. 작성자 : heymi.cho
 4. 작성일 : 2023.11.08
 ***************************************************************************************************
 * 프로그램 설명
 ***************************************************************************************************
 - 일자별 설치재고 현황 (http://localhost:3000/#/service/wwsna-installation-stock-ps-by-day)
 ***************************************************************************************************
-->

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
import WwsnaInstallationStockPsByDayMCenter from './WwsnaInstallationStockPsByDayMCenter.vue';
import WwsnaInstallationStockPsByDayMPd from './WwsnaInstallationStockPsByDayMPd.vue';

const { t } = useI18n();

const tabs = [
  { name: 'center', label: t('MSG_TXT_CENTER_DIVISION'), index: 0, panel: WwsnaInstallationStockPsByDayMCenter }, // 전체
  { name: 'pdct', label: t('MSG_TXT_PDCT'), index: 1, panel: WwsnaInstallationStockPsByDayMPd }, // 필터
];

const currentTab = ref(tabs[0].name);
</script>
