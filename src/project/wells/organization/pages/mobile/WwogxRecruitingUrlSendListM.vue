<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGX
2. 프로그램 ID : WwogxRecruitingUrlSendListM - 플래너 업무등록 현황(모바일)
3. 작성자 : 김동석
4. 작성일 : 2023-01-25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 플래너 업무등록 현황(모바일)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="0"
      @search="onclickSearch"
    >
      <kw-search-item>
        <kw-date-range-picker
          v-model:from="searchParams.prcsStrtDt"
          v-model:to="searchParams.prcsEndDt"
          rules="date_range_months:1"
          class="mb20"
          grow
          :label="$t('MSG_TXT_WRTE_DT')"
        />
      </kw-search-item>
      <kw-search-item>
        <kw-date-range-picker
          v-model:from="searchParams.rcrtStrtDt"
          v-model:to="searchParams.rcrtEndDt"
          rules="date_range_months:1"
          grow
          :label="$t('MSG_TXT_RCRT_DT')"
          class="mb20"
        />
      </kw-search-item>
      <kw-search-item>
        <kw-option-group
          v-model="searchParams.apprGubun"
          :label="t('MSG_TXT_ITEM_NM')"
          option-value="value"
          option-label="name"
          type="radio"
          :options="apprvGubun"
          class="mb20"
          relues="required"
        />
      </kw-search-item>
      <kw-search-item>
        <kw-input
          :label="$t('MSG_TXT_EMPL_NM')"
        />
      </kw-search-item>
    </kw-search>
    <kw-separator
      divider
    />
    <div class="pa20">
      <kw-action-top class="mb12 kw-font-pt14">
        <template #left>
          <kw-paging-info :total-count="totalCount" />
        </template>
      </kw-action-top>
      <kw-separator
        divider
        :spaced="`false`"
        size="1px"
        class="kw-bc--black1 mb20"
      />

      <kw-list
        :items="items"
        clickable
        item-key="id"
      >
        <template
          v-for="(item, index) of resultList"
          :key="index"
        >
          <kw-item-section class="border-box pa16 mb12">
            <kw-form dense>
              <div class="row justify-between items-center">
                <p class="pt0 mb12">
                  {{ item.rcrtAprLvCdNm }}
                </p>
                <kw-chip
                  outline
                  class="mt2"
                  :class="item.rgstTpCd == '02' ? 'kw-fc--placeholder' : 'kw-fc--primary'"
                >
                  {{ item.rgstTpCdNm }}
                </kw-chip>
              </div>

              <h4 class="pt0 mb12">
                {{ `${item.prtnrKnm}(${item.prtnrNo})` }}
              </h4>
              <p>{{ `${item.orgNm}${item.orgCd}` }}</p>
              <p>{{ item.rrnoEncr }}</p>
              <p>{{ `${item.cralLocaraTno}-${item.mexnoEncr}-${item.cralIdvTno}` }}</p>
              <kw-separator
                divider
                :spaced="`false`"
                size="1px"
                class="mb12 mt12"
              />
              <p class="pt0">
                {{ item.urlSendNm }}
              </p>
              <kw-form-item :label="t('MSG_TIT_DRAT_DT')">
                <p>{{ stringUtil.getDateFormat(item.contractDt) }}</p>
              </kw-form-item>
              <kw-form-item :label="$t('MSG_TXT_CNTRCT_DT')">
                <p>{{ stringUtil.getDateFormat(item.contractDt) }}</p>
              </kw-form-item>
            </kw-form>
          </kw-item-section>
        </template>
      </kw-list>
    </div>

    <template #action>
      <kw-btn
        filled
        primary
        :label="t('MSG_BTN_RGST_URL_FW')"
        @click="onclickUrlSendPopup"
      />
    </template>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import { SMS_COMMON_URI } from '~sms-common/organization/constants/ogConst';

const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const resultList = ref();
const searchParams = ref({
  prcsStrtDt: undefined,
  prcsEndDt: undefined,
  rcrtStrtDt: undefined,
  rcrtEndDt: undefined,
  apprGubun: '50',
  prtnrKnm: undefined,
});

const apprvGubun = ref([
  {
    name: t('MSG_TXT_APR_TP'),
    value: '50',
  }, {
    name: t('MSG_TXT_RCRT_TP'),
    value: '10',
  },
]);

const totalCount = ref(0);

async function fetchData() {
  const res = await dataService.get(`${SMS_COMMON_URI}/recruitings/recruiting`, { params: { ...cachedParams } });
  const list = res.data;
  resultList.value = list;
  console.log(resultList.value);
  totalCount.value = list.length;
}

async function onclickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onclickUrlSendPopup() {
  console.log('a');
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
<style scoped lang="scss">
p {
  font-size: 14px;
}

</style>
