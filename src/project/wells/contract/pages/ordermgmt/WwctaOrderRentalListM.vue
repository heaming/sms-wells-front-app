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
        <kw-tabs v-model="selectedRntlTab">
          <!-- 일반조회 -->
          <kw-tab
            name="rntlGeneral"
            :label="$t('MSG_TXT_GE')+$t('MSG_TXT_SRCH')"
          />
          <!-- 계약번호 조회 -->
          <kw-tab
            name="rntlCntrNo"
            :label="$t('MSG_TXT_CNTR_NO')+' '+$t('MSG_TXT_SRCH')"
          />
          <!-- 고객번호 조회 -->
          <kw-tab
            name="rntlCstNo"
            :label="$t('MSG_TXT_CST_NO')+' '+$t('MSG_TXT_SRCH')"
          />
          <!-- 설치자 정보 조회 -->
          <kw-tab
            name="rntlInstrInfo"
            :label="$t('MSG_TXT_INSTR_INFO')+' '+$t('MSG_TXT_SRCH')"
          >
            <kw-tooltip>
              {{ $t('MSG_TXT_INSTR_INFO')+' '+$t('MSG_TXT_SRCH') }}
            </kw-tooltip>
          </kw-tab>
        </kw-tabs>
        <kw-tab-panels v-model="selectedRntlTab">
          <!-- 일반 조회 -->
          <kw-tab-panel name="rntlGeneral">
            <wwcta-order-rental-contract-list-m
              :ref="(vm) => tabRefs.page = vm"
            />
          </kw-tab-panel>
          <!-- 계약번호 조회 -->
          <kw-tab-panel name="rntlCntrNo">
            <wwcta-order-rental-contract-no-list-m
              :ref="(vm) => tabRefs.page = vm"
            />
          </kw-tab-panel>
          <!-- 계약고객번호 조회 -->
          <kw-tab-panel name="rntlCstNo">
            <wwcta-order-rental-contractor-list-m
              :ref="(vm) => tabRefs.page = vm"
            />
          </kw-tab-panel>
          <!-- 설치자 정보 조회 -->
          <kw-tab-panel name="rntlInstrInfo">
            <wwcta-order-rental-installer-list-m
              :ref="(vm) => tabRefs.page = vm"
            />
          </kw-tab-panel>
        </kw-tab-panels>
      </kw-tab-panel>
      <kw-tab-panel name="membership">
        <kw-tabs v-model="selectedMmbrTab">
          <!-- 일반조회 -->
          <kw-tab
            name="mmbrGeneral"
            :label="$t('MSG_TXT_GE')+$t('MSG_TXT_SRCH')"
          />
          <!-- 계약번호 조회 -->
          <kw-tab
            name="mmbrCntrNo"
            :label="$t('MSG_TXT_CNTR_NO')+' '+$t('MSG_TXT_SRCH')"
          />
          <!-- 개인정보 조회 -->
          <kw-tab
            name="mmbrPersInfo"
            :label="$t('MSG_TXT_PRVCY')+' '+$t('MSG_TXT_SRCH')"
          />
        </kw-tabs>
        <kw-tab-panels v-model="selectedMmbrTab">
          <!-- 일반 조회 -->
          <kw-tab-panel name="mmbrGeneral">
            <wwcta-membership-contract-list-m
              :ref="(vm) => tabRefs.page = vm"
            />
          </kw-tab-panel>
          <!-- 계약번호 조회 -->
          <kw-tab-panel name="mmbrCntrNo">
            <wwcta-membership-contract-no-list-m
              :ref="(vm) => tabRefs.page = vm"
            />
          </kw-tab-panel>
          <!-- 개인정보 조회 -->
          <kw-tab-panel name="mmbrPersInfo">
            <wwcta-membership-contractor-list-m
              :ref="(vm) => tabRefs.page = vm"
            />
          </kw-tab-panel>
        </kw-tab-panels>
      </kw-tab-panel>
      <kw-tab-panel name="singlePayment">
        <kw-tabs v-model="selectedSpayTab">
          <!-- 일반조회 -->
          <kw-tab
            name="spayGeneral"
            :label="$t('MSG_TXT_GE')+$t('MSG_TXT_SRCH')"
          />
          <!-- 계약번호 조회 -->
          <kw-tab
            name="spayCntrNo"
            :label="$t('MSG_TXT_CNTR_NO')+' '+$t('MSG_TXT_SRCH')"
          />
          <!-- 개인정보 조회 -->
          <kw-tab
            name="spayPersInfo"
            :label="$t('MSG_TXT_PRVCY')+' '+$t('MSG_TXT_SRCH')"
          />
        </kw-tabs>
        <kw-tab-panels v-model="selectedSpayTab">
          <!-- 일반 조회 -->
          <kw-tab-panel name="spayGeneral">
            <wwcta-single-payment-contract-list-m
              :ref="(vm) => tabRefs.page = vm"
            />
          </kw-tab-panel>
          <!-- 계약번호 조회 -->
          <kw-tab-panel name="spayCntrNo">
            <wwcta-single-payment-contract-no-list-m
              :ref="(vm) => tabRefs.page = vm"
            />
          </kw-tab-panel>
          <!-- 개인정보 조회 -->
          <kw-tab-panel name="spayPersInfo">
            <wwcta-single-payment-contractor-list-m
              :ref="(vm) => tabRefs.page = vm"
            />
          </kw-tab-panel>
        </kw-tab-panels>
      </kw-tab-panel>
      <kw-tab-panel name="regularDelivery">
        <kw-tabs v-model="selectedRglrDlvrTab">
          <!-- 일반조회 -->
          <kw-tab
            name="rglrDlvrGeneral"
            :label="$t('MSG_TXT_GE')+$t('MSG_TXT_SRCH')"
          />
          <!-- 계약번호 조회 -->
          <kw-tab
            name="rglrDlvrCntrNo"
            :label="$t('MSG_TXT_CNTR_NO')+' '+$t('MSG_TXT_SRCH')"
          />
        </kw-tabs>
        <kw-tab-panels v-model="selectedRglrDlvrTab">
          <!-- 일반 조회 -->
          <kw-tab-panel name="rglrDlvrGeneral">
            <wwcta-order-regular-shipping-list-m
              :ref="(vm) => tabRefs.page = vm"
            />
          </kw-tab-panel>
          <!-- 계약번호 조회 -->
          <kw-tab-panel name="rglrDlvrCntrNo">
            <wwcta-order-regular-shipping-contract-no-list-m
              :ref="(vm) => tabRefs.page = vm"
            />
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
import WwctaOrderRentalInstallerListM from './WwctaOrderRentalInstallerListM.vue';
import WwctaMembershipContractListM from './WwctaMembershipContractListM.vue';
import WwctaMembershipContractNoListM from './WwctaMembershipContractNoListM.vue';
import WwctaMembershipContractorListM from './WwctaMembershipContractorListM.vue';
import WwctaSinglePaymentContractListM from './WwctaSinglePaymentContractListM.vue';
import WwctaSinglePaymentContractNoListM from './WwctaSinglePaymentContractNoListM.vue';
import WwctaSinglePaymentContractorListM from './WwctaSinglePaymentContractorListM.vue';
import WwctaOrderRegularShippingListM from './WwctaOrderRegularShippingListM.vue';
import WwctaOrderRegularShippingContractNoListM from './WwctaOrderRegularShippingContractNoListM.vue';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const tabRefs = reactive({});
const selectedTab = ref('rental'); // 주문상세(렌탈)
const selectedRntlTab = ref('rntlGeneral'); // 렌탈(일반조회)
const selectedMmbrTab = ref('mmbrGeneral'); // 멤버쉽(일반조회)
const selectedSpayTab = ref('spayGeneral'); // 일시불(일반조회)
const selectedRglrDlvrTab = ref('rglrDlvrGeneral'); // 정기배송(일반조회)

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
<style scoped>
</style>
