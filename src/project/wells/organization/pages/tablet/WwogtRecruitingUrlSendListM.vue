<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGB
2. 프로그램 ID : WwogtRecruitingUrlSendListM - 플래너 업무등록 현황(태블릿)
3. 작성자 : 한용희
4. 작성일 : 2023-03-24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 플래너 업무등록 현황(태블릿)
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
            v-model:from="searchParams.writeStrtDt"
            v-model:to="searchParams.writeEndDt"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_RCRT_DT')">
          <kw-date-range-picker
            v-model:from="searchParams.rcrtStrtDt"
            v-model:to="searchParams.rcrtEndDt"
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
          <div class="col border-box mb20">
            <div class="row justify-between item-center">
              <p class="kw-fc--black2 kw-font-pt14">
                {{ item.rcrtAprLvCdNm }}
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
                  {{ stringUtil.getDateFormat(item.writeDt) }}
                </p>
              </kw-form-item>
              <kw-form-item :label="t('MSG_TXT_CNTRCT_DT')">
                <p class="kw-font-pt14 text-weight-regular">
                  {{ stringUtil.getDateFormat(item.contractDt) }}
                </p>
              </kw-form-item>
            </kw-form>
          </div>
        </div>
      </template>
    </div>

    <template #action>
      <div class="tablet-action-left" />
      <div class="tablet-action-right">
        <kw-btn
          primary
          :label="t('MSG_BTN_RGST_URL_FW')"
          @click="onClickUrlSend"
        />
      </div>
    </template>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import { SMS_COMMON_URI } from '~sms-common/organization/constants/ogConst';
import { setPhoneNumber } from '~sms-common/organization/utils/ogUtil';

const { t } = useI18n();
const { modal, notify } = useGlobal();
const dataService = useDataService();
const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const totalCount = ref(0);
const resultList = ref({});
const searchParams = ref({
  writeStrtDt: undefined,
  writeEndDt: undefined,
  rcrtStrtDt: undefined,
  rcrtEndDt: undefined,
  apprGubun: '50',
  prtnrKnm: undefined,
  ogTpCd: userInfo.ogTpCd,
  ogId: userInfo.ogId,
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
  resultList.value = list.filter((obj) => {
    obj.rrno = `${obj.rrnoFrpsnVal}-${obj.rrnoEncr}`;
    obj.phoneNumber = setPhoneNumber(`${obj.cralLocaraTno}${obj.mexnoEncr}${obj.cralIdvTno}`);
    return obj;
  });
  totalCount.value = resultList.length;
}

// 조회
async function onclickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  resultList.value = {};
  await fetchData();
}

// 리쿠르팅 등록 URL 발송
async function onClickUrlSend() {
  const { result: isChanged } = await modal({
    component: 'WwogtRecruitingUrlSendRegP',
    componentProps: { undefined },
  });

  if (isChanged) {
    notify(t('MSG_ALT_SEND'));
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
