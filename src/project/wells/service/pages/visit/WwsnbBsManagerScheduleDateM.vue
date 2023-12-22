<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNB (방문관리)
 2. 프로그램 ID : WwsncBsManagerScheduleDateM - BS관리일정조회
 3. 작성자 : 홍세기
 4. 작성일 : 2023.06.01
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - KSS에서 넘어온화면
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs v-model="selectedTab">
      <kw-tab
        name="dailyTab"
        :label="$t('MSG_TXT_BY_DAY')"
      />
      <kw-tab
        name="weekTab"
        :label="$t('MSG_TXT_BY_WEEK')"
      />
    </kw-tabs>

    <kw-tab-panels :model-value="selectedTab">
      <!-- 일자별 TAB -->
      <kw-tab-panel name="dailyTab">
        <wwsnc-bs-manager-schedule-daily
          :v-model:init-data="currentInitData"
          :prtnr-no="props.prtnrNo"
          :prtnr-knm="props.prtnrKnm"
          :og-id="props.ogId"
          :from-date="props.fromDate"
          :to-date="props.toDate"
        />
      </kw-tab-panel>
      <!-- 주차별 TAB -->
      <kw-tab-panel name="weekTab">
        <wwsnc-bs-manager-schedule-week />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { isEmpty } from 'lodash-es';
import wwsncBsManagerScheduleDaily from './WwsnbBsManagerScheduleDateDaily.vue';
import wwsncBsManagerScheduleWeek from './WwsnbBsManagerScheduleDateWeek.vue';

const props = defineProps({
  tabValue: { type: String, default: '' },
  prtnrNo: { type: String, default: '' },
  prtnrKnm: { type: String, default: '' },
  ogId: { type: String, default: '' },
  fromDate: { type: String, default: '' },
  toDate: { type: String, default: '' },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectedTab = ref('dailyTab');

onMounted(async () => {
  const { tabValue } = props;
  selectedTab.value = isEmpty(tabValue) ? 'dailyTab' : tabValue;
});
</script>
