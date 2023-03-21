<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaOrderRentalListM - wells 렌탈 판매 상세내역 조회
3. 작성자 : jihoon.kim
4. 작성일 : 2023.03.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0061] - 렌탈에 대한 주문 상세내역 (to-be 에서는 통합 주문 상세 내역으로 구현)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs v-model="selectedTab">
      <!-- 렌탈 -->
      <kw-tab
        name="rental"
        :label="$t('MSG_TXT_RENTAL')"
      />
      <!-- 멤버쉽 -->
      <kw-tab
        name="membership"
        :label="$t('MSG_TXT_MEMBERSHIP')"
      />
      <!-- 일시불 -->
      <kw-tab
        name="singlePayment"
        :label="$t('MSG_TXT_SNGL_PMNT')"
      />
      <!-- 정기배송 -->
      <kw-tab
        name="regularDelivery"
        :label="$t('MSG_TXT_REG_DLVR')"
      />
    </kw-tabs>
    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="rental">
        <kw-tabs v-model="selectedSubTab">
          <!-- 일반조회 -->
          <kw-tab
            name="generalSearch"
            :label="$t('MSG_TXT_GE')+$t('MSG_TXT_SRCH')"
          />
          <!-- 계약번호 조회 -->
          <kw-tab
            name="contractNumberSearch"
            :label="$t('MSG_TXT_CNTR_NO')+' '+$t('MSG_TXT_SRCH')"
          />
          <!-- 고객번호 조회 -->
          <kw-tab
            name="customerNumberSearch"
            :label="$t('MSG_TXT_CST_NO')+' '+$t('MSG_TXT_SRCH')"
          />
          <!-- 설치자 정보 조회 -->
          <kw-tab
            name="installerInformationSearch"
            :label="$t('MSG_TXT_INSTR_INFO')+' '+$t('MSG_TXT_SRCH')"
          />
        </kw-tabs>
        <kw-tab-panels v-model="selectedSubTab">
          <!-- 일반 조회 -->
          <kw-tab-panel name="generalSearch">
            <wwcta-order-rental-contract-list-m />
          </kw-tab-panel>
          <!-- 계약번호 조회 -->
          <kw-tab-panel name="contractNumberSearch">
            <wwcta-order-rental-contract-No-list-m />
          </kw-tab-panel>
          <!-- 계약고객번호 조회 -->
          <kw-tab-panel name="customerNumberSearch">
            <wwcta-order-rental-contractor-list-m />
          </kw-tab-panel>
        </kw-tab-panels>
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import WwctaOrderRentalContractListM from './WwctaOrderRentalContractListM.vue';
import WwctaOrderRentalContractNoListM from './WwctaOrderRentalContractNoListM.vue';
import WwctaOrderRentalContractorListM from './WwctaOrderRentalContractorListM.vue';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// const tabRefs = reactive({});
// const itemsChecked = reactive({ page: false, link: false });
const selectedTab = ref('rental');
const selectedSubTab = ref('generalSearch');

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
<style scoped>
</style>
