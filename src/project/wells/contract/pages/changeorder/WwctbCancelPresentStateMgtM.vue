<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbCancelPresentStateMgtM - 취소현황
3. 작성자 : younuk.choi
4. 작성일 : 2023.06.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 취소현황 (탭)
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

import WwctbRentalCancelPresentStateListM from './WwctbRentalCancelPresentStateListM.vue';
import WwctbRegularShippingCancelPresentStateListM from './WwctbRegularShippingCancelPresentStateListM.vue';
import WwctbSinglePaymentCancelPresentStateListM from './WwctbSinglePaymentCancelPresentStateListM.vue';
import WwctbMembershipCancelPresentStateListM from './WwctbMembershipCancelPresentStateListM.vue';

const { t } = useI18n();

const tabs = [
  {
    name: 'rental',
    label: `${t('MSG_TXT_RENTAL')} ${t('MSG_TXT_CANCEL_STATE')}`,
    panel: WwctbRentalCancelPresentStateListM,
  },
  {
    name: 'regularShipping',
    label: `${t('MSG_TXT_REG_DLVR')} ${t('MSG_TXT_CANCEL_STATE')}`,
    panel: WwctbRegularShippingCancelPresentStateListM,
  },
  {
    name: 'single',
    label: `${t('MSG_TIT_SPAY')} ${t('MSG_TXT_CANCEL_STATE')}`,
    panel: WwctbSinglePaymentCancelPresentStateListM,
  },
  {
    name: 'membership',
    label: `${t('MSG_TXT_MEMBERSHIP')} ${t('MSG_TXT_CANCEL_STATE')}`,
    panel: WwctbMembershipCancelPresentStateListM,
  },
];

const currentTab = ref(tabs[0].name);

</script>
