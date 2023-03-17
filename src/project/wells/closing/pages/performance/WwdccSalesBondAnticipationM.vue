<!----
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccSalesBondAnticipationM

3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.03.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매출채권/선수금 현황
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs
      v-model="selectedTab"
    >
      <kw-tab
        name="tapOverdueQenaltyList"
        :label="$t('MSG_TIT_BZNS_ATAM')"
      />
      <kw-tab
        name="tapSalesBondList"
        :label="$t('MSG_TIT_SL_BND')"
      />
      <kw-tab
        name="tapDelinquentAdditionalChargesList"
        :label="$t('MSG_TIT_DLQ_ADAMT')"
      />
    </kw-tabs>
    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="tapOverdueQenaltyList">
        <wwdcc-sales-bond-anticipation-m-overdue-qenalty-list-m
          v-model:selected-link-id="selectedLinkId"
        />
      </kw-tab-panel>
      <kw-tab-panel name="tapSalesBondList">
        <wwdcc-sales-bond-anticipation-m-sales-bond-list-m
          v-model:selected-link-id="selectedLinkId"
        />
      </kw-tab-panel>
      <kw-tab-panel name="tapDelinquentAdditionalChargesList">
        <wwdcc-sales-bond-anticipation-m-delinquent-additional-charges-list-m
          v-model:selected-link-id="selectedLinkId"
        />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import WwdccSalesBondAnticipationMOverdueQenaltyListM from './WwdccSalesBondAnticipationMOverdueQenaltyListM.vue';
import WwdccSalesBondAnticipationMSalesBondListM from './WwdccSalesBondAnticipationMSalesBondListM.vue';
import WwdccSalesBondAnticipationMDelinquentAdditionalChargesListM from './WwdccSalesBondAnticipationMDelinquentAdditionalChargesListM.vue';

const selectedTab = ref('tapOverdueQenaltyList');
const selectedLinkId = ref(null);

</script>
