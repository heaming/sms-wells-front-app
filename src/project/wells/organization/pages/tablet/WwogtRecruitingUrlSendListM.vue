<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGT
2. 프로그램 ID : WwogtRecruitingUrlSendListM - 플래너 업무등록 현황(모바일)
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
      :cols="2"
      @search="onclickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_WRTE_DT')">
          <kw-date-range-picker
            v-model:from="searchParams.prcsStrtDt"
            v-model:to="searchParams.prcsEndDt"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_RCRT_DT')">
          <kw-date-range-picker
            v-model:from="searchParams.rcrtStrtDt"
            v-model:to="searchParams.rcrtEndDt"
            rules="date_range_months:1"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_DIV')">
          <kw-btn-toggle
            v-model="searchParams.apprGubun"
            :label="t('MSG_TXT_DIV')"
            option-value="value"
            option-label="name"
            :options="apprvGubun"
            gap="0px"
            :dense="true"
            grow
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_EMPL_NM')">
          <kw-input v-model="searchParams.prtnrKnm" />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="pa40">
      <kw-action-top class="mb18">
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
      </kw-action-top>

      <template
        v-for="(item, index) of resultList"
        :key="index"
      >
        <div class="row justify-between">
          <div class="col border-box mb20 mx20">
            <div class="row justify-between item-center">
              <p class="kw-fc--black2 kw-font-pt14">
                {{ item.rcrtAprLvCdNm }} {{ index }}
              </p>
              <kw-chip
                :label="item.rgstTpCd === '01' ? t('MSG_TXT_NEW') : t('MSG_TXT_RETR')"
                :color="item.rgstTpCd === '01' ? 'placeholder' : 'primary'"
                outline
              />
            </div>
            <h3 class="mt20 mb12">
              {{ `${item.prtnrKnm}(${item.prtnrNo})` }}
            </h3>
            <p class="kw-font-pt14">
              {{ `${item.orgNm}${item.orgCd}` }}
            </p>
            <p class="kw-font-pt14">
              {{ item.rrnoEncr }}
            </p>
            <p class="kw-font-pt14">
              {{ `${item.cralLocaraTno}-${item.mexnoEncr}-${item.cralIdvTno}` }}
            </p>
            <kw-separator class="my20" />
            <p class="kw-font-pt14">
              {{ item.urlSendNm }}
            </p>

            <kw-form
              dense
              :label-size="60"
            >
              <kw-form-item :label="$t('MSG_TIT_DRAT_DT')">
                <p class="kw-font-pt14 text-weight-regular">
                  2022-08-15{{ stringUtil.getDateFormat(item.contractDt) }}
                </p>
              </kw-form-item>
              <kw-form-item :label="t('MSG_TXT_CNTRCT_DT')">
                <p class="kw-font-pt14 text-weight-regular">
                  2022-08-15 {{ stringUtil.getDateFormat(item.contractDt) }}
                </p>
              </kw-form-item>
            </kw-form>
          </div>
          <!-- <div
            v-else
            class="col border-box mb20 mx20"
          >
            <div class="row justify-between item-center">
              <p class="kw-fc--black2 kw-font-pt14">
                최종확정 {{ item.rcrtAprLvCdNm }} {{ index }}
              </p>
              <kw-chip
                :label="item.rgstTpCd === '01' ? t('MSG_TXT_NEW') : t('MSG_TXT_RETR')"
                :color="item.rgstTpCd === '01' ? 'placeholder' : 'primary'"
                outline
              />
            </div>
            <h3 class="mt20 mb12">
              남궁교원(1234567)
              {{ `${item.prtnrKnm}(${item.prtnrNo})` }}
            </h3>
            <p class="kw-font-pt14">
              강남센터 B010160
              {{ `${item.orgNm}(${item.prtnrNo})` }}
            </p>
            <p class="kw-font-pt14">
              20221224 - 2******
              {{ item.rrnoEncr }}
            </p>
            <p class="kw-font-pt14">
              010-9000-8000
            </p>
            <kw-separator class="my20" />
            <p class="kw-font-pt14">
              김발송(1234567) {{ item.urlSendNm }}
            </p>

            <kw-form
              dense
              :label-size="60"
            >
              <kw-form-item :label="$t('MSG_TIT_DRAT_DT')">
                <p class="kw-font-pt14 text-weight-regular">
                  2022-08-15{{ stringUtil.getDateFormat(item.contractDt) }}
                </p>
              </kw-form-item>
              <kw-form-item :label="t('MSG_TXT_CNTRCT_DT')">
                <p class="kw-font-pt14 text-weight-regular">
                  2022-08-15 {{ stringUtil.getDateFormat(item.contractDt) }}
                </p>
              </kw-form-item>
            </kw-form>
          </div> -->
        </div>
      </template>
    </div>
    <template #action>
      <div class="tablet-action-left" />
      <div class="tablet-action-right">
        <kw-btn
          primary
          label="등록 URL 발송"
        />
      </div>
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
const totalCount = ref(0);
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

async function fetchData() {
  const res = await dataService.get(`${SMS_COMMON_URI}/recruitings/recruiting`, { params: { ...cachedParams } });
  const list = res.data;
  resultList.value = list;
  totalCount.value = resultList.length;
}

async function onclickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
</script>
