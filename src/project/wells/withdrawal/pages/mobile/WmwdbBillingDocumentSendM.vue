<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : mobile
2. 프로그램 ID : WmwdbBillingDocumentSendM - 청구서 발송 모바일
3. 작성자 : sojeong.Shin
4. 작성일 : 2023.03.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 청구서 관리 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="px20 pt20">
      <!-- label="발송유형" -->
      <kw-btn-toggle
        v-model="sendMainData.bildcFwTpCd"
        :label="t('MSG_TXT_FW_TP')"
        :options="codes.BILDC_FW_TP_CD"
        gap="0px"
        :dense="false"
        grow
        class="mb20"
        @change="fetchData"
      />

      <kw-form
        ref="frmMainRef"
      >
        <!-- label="발신번호" -->
        <kw-input
          v-if="sendMainData.bildcFwTpCd === 'K'"
          v-model="sendMainData.destInfo"
          type="text"
          mask="###########"
          rules="length:11"
          :label="t('MSG_TXT_DSPH_NO')"
          required
          clearable
          class="mb20"
        />
        <!-- label="수신번호" -->
        <kw-input
          v-if="sendMainData.bildcFwTpCd === 'K'"
          v-model="sendMainData.callback"
          type="text"
          mask="###########"
          rules="length:11"
          :label="t('MSG_TXT_RECP_NO')"
          required
          clearable
          class="mb20"
        />

        <!-- <kw-form-item
        v-if="sendMainData.bildcFwTpCd !== 'K'"
        :label="t('MSG_TXT_DSPTR')"
        required
        /> -->

        <!-- label="발신자" -->
        <zwcm-email-address
          v-if="sendMainData.bildcFwTpCd !== 'K'"
          v-model="sendMainData.toMail"
          :label="t('MSG_TXT_DSPTR')"
          required
          readonly
          class="mb20"
        />

        <!-- <kw-form-item
        v-if="sendMainData.bildcFwTpCd !== 'K'"
        :label="t('MSG_TXT_RECP_USR')"
        required
        /> -->

        <!-- label="수신자" -->
        <zwcm-email-address
          v-if="sendMainData.bildcFwTpCd !== 'K'"
          v-model="sendMainData.fromMail"
          :label="t('MSG_TXT_RECP_USR')"
          required
          class="mb20"
        />
      </kw-form>
    </div>
    <!-- //rev:230608 카카오 알림톡일경우 -->
    <kw-separator
      divider
    />
    <div class="pa20">
      <h3>{{ t('MSG_TXT_DSPH_IZ') }}</h3>
      <!-- <h3>발신 내역</h3> -->
      <div class="py20">
        <kw-list
          :items="items"
          separator
        >
          <template #item="{ item }">
            <kw-item-section>
              <p class="pb8 kw-font-body">
                {{ item.bildcFwDtm }}
              </p>
              <kw-form dense>
                <!-- label="발송유형" -->
                <kw-form-item :label="t('MSG_TXT_FW_TP')">
                  <p class="kw-font-pt14">
                    {{ item.bildcFwTpCd }}
                  </p>
                </kw-form-item>
                <!-- label="발신자" -->
                <kw-form-item :label="t('MSG_TXT_DSPTR')">
                  <p class="kw-font-pt14">
                    {{ item.callback }}
                  </p>
                </kw-form-item>
                <!-- label="수신자" -->
                <kw-form-item :label="t('MSG_TXT_RECP_USR')">
                  <p class="kw-font-pt14">
                    {{ item.recipientNum }}
                  </p>
                </kw-form-item>
              </kw-form>
            </kw-item-section>
          </template>
        </kw-list>
      </div>
    </div>
    <template #action>
      <!-- label="취소" -->
      <kw-btn
        filled
        negative
        :label="t('MSG_BTN_CANCEL')"
        @click="onClickCancell"
      />
      <!-- label="발송" -->
      <kw-btn
        filled
        primary
        :label="t('MSG_BTN_SEND')"
        @click="onClickSend"
      />
    </template>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, confirm, router, useDataService } from 'kw-lib';
// import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import ZwcmEmailAddress from '~common/components/ZwcmEmailAddress.vue';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { getters } = useStore();
const dataService = useDataService();
const { t } = useI18n();
const userInfo = getters['meta/getUserInfo'];

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  searchCstFnm: {
    type: String,
    default: null,
  },
  searchBildcWrteDt: {
    type: String,
    default: null,
  },
  bildcPblNo: {
    type: String,
    default: null,
  },
  cstFnm: {
    type: String,
    default: null,
  },
  pdNm: {
    type: String,
    default: null,
  },
  pdQtySum: {
    type: String,
    default: null,
  },
  pdSellAmtSum: {
    type: String,
    default: null,
  },

});

const frmMainRef = ref();

const codes = await codeUtil.getMultiCodes(
  'BILDC_FW_TP_CD',
);

const sendMainData = ref({
  bildcPblNo: '',
  bildcFwTpCd: 'K',
  cstFnm: '',
  pdNm: '',
  pdQtySum: '',
  pdSellAmtSum: '',
  destInfo: '', // 받는사람
  callback: '', // 보내는사람
  fromMail: '',
  toMail: userInfo.email,

});

const items = ref([]);

// 취소 버튼 클릭
async function onClickCancell() {
  await router.push(
    {
      path: '/withdrawal/wmwdb-billing-document-mgt',
      query: {
        searchCstFnm: props.searchCstFnm, // 조회조건
        searchBildcWrteDt: props.searchBildcWrteDt, // 조회조건
      },
    },
  );
}

let cachedParams;

async function fetchData() {
  cachedParams = cloneDeep(sendMainData.value);

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/billing-document-orders/forwardings', { params: cachedParams });

  const list = res.data;

  list.forEach((data) => {
    if (data.bildcFwDtm) {
      data.bildcFwDtm = dayjs(data.bildcFwDtm).format('YYYY-MM-DD');
    }

    data.bildcFwTpCd = data.bildcFwTpCd === 'K' ? t('MSG_TXT_KAKAO_NOTAK') : t('MSG_TXT_EMAIL');
  });

  items.value = list;
}

let paramData;
async function onClickSend() {
  if (!await frmMainRef.value.validate()) { return; }
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }

  if (!await confirm(t('MSG_ALT_WANT_SEND'))) { return; }

  paramData = cloneDeep(sendMainData.value);

  await dataService.post('/sms/wells/withdrawal/idvrve/billing-document-orders/forwardings', paramData);

  await fetchData();
}

async function initProps() {
  const { bildcPblNo, cstFnm, pdNm, pdQtySum, pdSellAmtSum } = props;

  sendMainData.value.bildcPblNo = bildcPblNo;
  sendMainData.value.cstFnm = cstFnm;
  sendMainData.value.pdNm = pdNm;
  sendMainData.value.pdQtySum = pdQtySum;
  sendMainData.value.pdSellAmtSum = pdSellAmtSum;

  if (sendMainData.value.bildcPblNo) {
    await fetchData();
  }
}

onMounted(async () => {
  await initProps();
});

</script>
