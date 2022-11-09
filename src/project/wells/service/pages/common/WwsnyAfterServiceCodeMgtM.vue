<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNY (기준정보)
2. 프로그램 ID : WwsnyAfterServiceCodeMgtM - AS 코드관리
3. 작성자 : gs.piit122
4. 작성일 : 2022.11.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- AS코드관리 (http://localhost:3000/#/service/wwsny-after-service-code-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_PD_GRP')">
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            first-option-label="- 전체 -"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PD_NM')">
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            first-option-label="- 전체 -"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PD_NM')">
          <kw-option-group
            v-model="searchParams.pdGrpCd"
            type="checkbox"
            :options="codes.PD_GRP_CD"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_SV_TP')">
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            first-option-label="- 전체 -"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_SV_TP')">
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            first-option-label="- 전체 -"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_MDFC_DTM')">
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :min-date="minDate"
            :max-date="maxDate"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil } from 'kw-lib';
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = ref({
  pdGrpCd: '',
});

const codes = await codeUtil.getMultiCodes(
  'PD_GRP_CD',
);

async function onClickSearch() {
  console.log(codes);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
</script>
