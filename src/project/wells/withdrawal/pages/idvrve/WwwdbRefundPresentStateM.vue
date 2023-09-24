<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID :  WmwdbRefundListM - 웰스환불현황 목록
3. 작성자 : sonkiseok
4. 작성일 : 2023.05.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 웰스 환불 현황 탭 목록
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs v-model="selectedTab">
      <kw-tab
        name="1"
        :label="$t('MSG_TXT_RFND_PS')"
      />
      <kw-tab
        name="2"
        :label="$t('MSG_TXT_CNTRAM_RFND_PS')"
      />
      <kw-tab
        name="3"
        :label="$t('MSG_TXT_ETC_ATAM_RFND_PS')"
      />
    </kw-tabs>
    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="1">
        <wwwdb-refund-list-m-current-state />
      </kw-tab-panel>
      <kw-tab-panel name="2">
        <wwwdb-refund-list-m-contract-amount />
      </kw-tab-panel>
      <kw-tab-panel name="3">
        <wwwdb-refund-list-m-etc-amount />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import WwwdbRefundListMCurrentState from './WwwdbRefundListMCurrentState.vue';
import WwwdbRefundListMContractAmount from './WwwdbRefundListMContractAmount.vue';
import WwwdbRefundListMEtcAmount from './WwwdbRefundListMEtcAmount.vue';

const selectedTab = ref('1');

</script>
