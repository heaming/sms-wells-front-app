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

import WwctbRentalCancelPresentStateMgtM from './WwctbRentalCancelPresentStateMgtM.vue';
import WwctbRegularShippingCancelPresentStateMgtM from './WwctbRegularShippingCancelPresentStateMgtM.vue';
import WwctbMembershipCancelPresentStateMgtM from './WwctbMembershipCancelPresentStateMgtM.vue';

const { t } = useI18n();

const tabs = [
  {
    name: 'rental',
    label: `${t('MSG_TXT_RENTAL')} ${t('MSG_TXT_CANCEL_STATE')}`,
    panel: WwctbRentalCancelPresentStateMgtM,
  },
  {
    name: 'regularShipping',
    label: `${t('MSG_TXT_REG_DLVR')} ${t('MSG_TXT_CANCEL_STATE')}`,
    panel: WwctbRegularShippingCancelPresentStateMgtM,
  },
  {
    name: 'membership',
    label: `${t('MSG_TXT_MEMBERSHIP')} ${t('MSG_TXT_CANCEL_STATE')}`,
    panel: WwctbMembershipCancelPresentStateMgtM,
  },
];

const currentTab = ref(tabs[0].name);

</script>
