<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 모듈 : withdrawal/idvrve
2. 프로그램 ID : WwwdbGiroOcrForwardingMgtM - 지로 OCR 발송 관리
3. 작성자 : heungjun.lee
4. 작성일 : 2023.01.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 지로 OCR 발송 관리 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs v-model="selectedTab">
      <kw-tab
        name="page"
        :label="$t('MSG_TXT_FW_OJ_MGT')"
      />
      <kw-tab
        name="link"
        :label="$t('MSG_TXT_PRNT_MGT')"
      />
    </kw-tabs>
    <kw-observer
      ref="obsTabRef"
    >
      <kw-tab-panels v-model="selectedTab">
        <kw-tab-panel name="page">
          <wwwdb-giro-ocr-fw-mgt-m-page />
        </kw-tab-panel>
        <kw-tab-panel name="link">
          <wwwdb-giro-ocr-fw-mgt-m-link />
        </kw-tab-panel>
      </kw-tab-panels>
    </kw-observer>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import WwwdbGiroOcrFwMgtMPage from './WwwdbGiroOcrForwardingMgtMPage.vue';
import WwwdbGiroOcrFwMgtMLink from './WwwdbGiroOcrForwardingMgtMLink.vue';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectedTab = ref('page');
const obsTabRef = ref();

</script>

<style scoped>
</style>
