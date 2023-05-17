<template>
  <kw-page>
    <kw-tabs v-model="selectedTab">
      <kw-tab
        name="rental"
        :label="$t('MSG_TXT_RECP_RENT')"
      />
      <kw-tab
        name="snglPayment"
        :label="$t('MSG_TXT_INSTALL')"
      />
      <kw-tab
        name="location"
        :label="$t('MSG_TXT_RECP_LMP_SUM_PMT')"
      />
    </kw-tabs>
    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="rental">
        <wwcta-receipt-bulk-upload-m-rental />
      </kw-tab-panel>
      <kw-tab-panel name="snglPayment">
        <wwcta-receipt-bulk-upload-m-single-payment />
      </kw-tab-panel>
      <kw-tab-panel name="location">
        <wwcta-receipt-bulk-upload-m-install-location />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import WwctaReceiptBulkUploadMRental from './WwctaReceiptBulkUploadMRental.vue';
import WwctaReceiptBulkUploadMInstallLocation from './WwctaReceiptBulkUploadMInstallLocation.vue';
import WwctaReceiptBulkUploadMSinglePayment from './WwctaReceiptBulkUploadMSinglePayment.vue';

const selectedTab = ref('rental');
</script>
