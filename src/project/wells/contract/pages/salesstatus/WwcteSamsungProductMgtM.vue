<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteSamsungProductMgtM - 삼성전자 상품관리
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.04.03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 삼성전자 상품관리(확정일) 화면
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
          :test="testReactive"
        />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import WwcteSamsungProductMgtMNotInstalled
  from '~sms-wells/contract/pages/salesstatus/WwcteSamsungProductMgtMNotInstalled.vue';
import WwcteSamsungProductMgtMShipping
  from '~sms-wells/contract/pages/salesstatus/WwcteSamsungProductMgtMShipping.vue';
import WwcteSamsungProductMgtMBookingDate
  from '~sms-wells/contract/pages/salesstatus/WwcteSamsungProductMgtMBookingDate.vue';
import WwcteSamsungProductMgtMConfirmDate
  from '~sms-wells/contract/pages/salesstatus/WwcteSamsungProductMgtMConfirmDate.vue';
import WwcteSamsungProductMgtMFreeAs
  from '~sms-wells/contract/pages/salesstatus/WwcteSamsungProductMgtMFreeAs.vue';

const { t } = useI18n();

const tabs = [
  {
    name: 'notInstalled',
    label: t('MSG_TXT_NOT_INSTL'),
    panel: WwcteSamsungProductMgtMNotInstalled,
  },
  { name: 'shipping', label: t('MSG_TXT_DLVRY'), panel: WwcteSamsungProductMgtMShipping },
  { name: 'confirmDate', label: t('MSG_TXT_DTRM_DATE'), panel: WwcteSamsungProductMgtMConfirmDate },
  { name: 'bookingDate', label: t('MSG_TXT_RSV_DATE'), panel: WwcteSamsungProductMgtMBookingDate },
  { name: 'freeAS', label: `${t('MSG_TXT_FREE')} A/S`, panel: WwcteSamsungProductMgtMFreeAs },
];

const currentTab = ref(tabs[3].name);

</script>
