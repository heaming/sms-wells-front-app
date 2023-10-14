<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSD
2. 프로그램 ID : WpsdExcellentDivisionBaseMgtM
3. 작성자 : Park Yesol
4. 작성일 : 2023.09.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 우수사업부 기준관리
****************************************************************************************************
-->

<template>
  <kw-page>
    <kw-tabs
      v-model="selectedTab"
    >
      <kw-tab
        name="pd"
        :label="t('MSG_TXT_PD_BASE_MNGT')"
      />
      <kw-tab
        name="evl"
        :label="t('MSG_TXT_EVL_BASE_MNGT')"
      />
      <kw-tab
        name="trg"
        :label="t('MSG_TXT_TRG_BASE_MNGT')"
      />
    </kw-tabs>
    <kw-tab-panels
      :model-value="selectedTab"
    >
      <kw-tab-panel name="pd">
        <WwpsdExcellentDivisionPdBaseMgtM />
      </kw-tab-panel>
      <kw-tab-panel name="evl">
        <WwpsdExcellentDivisionEvlBaseMgtM />
      </kw-tab-panel>
      <kw-tab-panel name="trg">
        <WwpsdExcellentDivisionTrgBaseMgtM />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import WwpsdExcellentDivisionPdBaseMgtM from './WwpsdExcellentDivisionPdBaseMgtM.vue';
import WwpsdExcellentDivisionEvlBaseMgtM from './WwpsdExcellentDivisionEvlBaseMgtM.vue';
import WwpsdExcellentDivisionTrgBaseMgtM from './WwpsdExcellentDivisionTrgBaseMgtM.vue';

const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectedTab = ref('pd');

</script>
