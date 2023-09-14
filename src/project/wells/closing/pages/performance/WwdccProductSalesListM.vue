<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbProductSalesListM - 상품별 매출현황
3. 작성자 : Kicheol Choi
4. 작성일 : 2023.09.11
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품별 매출현황 조회
****************************************************************************************************
---->
<template>
  <kw-page>
    <kw-tabs v-model="selectedTab">
      <kw-tab
        :name="selectedTabs[0]"
        :label="$t('MSG_TIT_SL_PS_AGRG')"
      />
      <kw-tab
        :name="selectedTabs[1]"
        :label="$t('MSG_TIT_SL_DTL_INQR')"
      />
    </kw-tabs>
    <kw-tab-panels :model-value="selectedTab">
      <kw-tab-panel :name="selectedTabs[0]">
        <wwdcc-product-sales-list-m-aggregate />
      </kw-tab-panel>
      <kw-tab-panel :name="selectedTabs[1]">
        <wwdcc-product-sales-list-m-detail />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import WwdccProductSalesListMAggregate from './WwdccProductSalesListMAggregate.vue';
import WwdccProductSalesListMDetail from './WwdccProductSalesListMDetail.vue';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectedTabs = ref(['aggregate', 'detail']);
const selectedTab = ref(selectedTabs.value[0]);

</script>
