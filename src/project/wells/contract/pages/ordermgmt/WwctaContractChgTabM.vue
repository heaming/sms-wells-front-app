<!--
계약자 명의변경
-->

<template>
  <kw-page>
    <kw-tabs
      v-model="selectedTab"
    >
      <kw-tab
        name="1"
        :label="$t('MSG_TXT_CON_NM_CH_ST' ,null , '계약자 명의변경 현황')"
        size="15"
      />
      <kw-tab
        name="2"
        :label="$t('MSG_TXT_CON_NM_CH' ,null , '계약자 명의변경')"
      />
    </kw-tabs>

    <kw-tab-panels
      :model-value="selectedTab"
    >
      <kw-tab-panel name="1">
        <wwcta-contract-chg-mgt-list-m />
      </kw-tab-panel>
      <kw-tab-panel name="2">
        <wwcta-contract-chg-list-m />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>
import WwctaContractChgMgtListM from './WwctaContractChgMgtListM.vue';
import WwctaContractChgListM from './WwctaContractChgListM.vue';

const selectedTab = ref('1');

</script>
