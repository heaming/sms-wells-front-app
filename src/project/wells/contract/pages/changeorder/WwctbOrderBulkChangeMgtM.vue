<template>
  <kw-page>
    <kw-tabs v-model="selectedTab">
      <kw-tab
        name="rental"
        :label="$t('MSG_TXT_RENTAL')"
      />
      <kw-tab
        name="membership"
        :label="$t('MSG_TXT_MEM')"
      />
      <kw-tab
        name="payment"
        :label="$t('MSG_TXT_SNGL_PMNT')"
      />
    </kw-tabs>
    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="rental">
        <wwctb-order-bulk-change-mgt-m-rental />
      </kw-tab-panel>
      <kw-tab-panel name="membership">
        <wwctb-order-bulk-change-mgt-m-membership />
      </kw-tab-panel>
      <kw-tab-panel name="payment">
        <wwctb-single-payment-bulk-change-mgt-m />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import WwctbOrderBulkChangeMgtMRental from './WwctbOrderBulkChangeMgtMRental.vue';
import WwctbOrderBulkChangeMgtMMembership from './WwctbOrderBulkChangeMgtMMembership.vue';
import WwctbSinglePaymentBulkChangeMgtM from './WwctbSinglePaymentBulkChangeMgtM.vue';

const selectedTab = ref('rental');
</script>
