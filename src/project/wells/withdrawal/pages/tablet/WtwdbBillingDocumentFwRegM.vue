<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : idvrve
2. 프로그램 ID : WtwdbBillingDocumentFwTabletRegM - 청구서 발송 태블릿
3. 작성자 : heungjun.lee
4. 작성일 : 2023.02.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 청구서 관리 조회
****************************************************************************************************
--->

<template>
  <kw-page>
    <!-- 발송유형 -->
    <h3 class="mb20">
      {{ t('MSG_TXT_FW_TP') }}
    </h3>

    <kw-form
      ref="frmMainRef"
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item>
          <kw-btn-toggle
            v-model="sendMainData.bildcFwTpCd"
            :options="codes.BILDC_FW_TP_CD"
            :dense="false"
            gap="0"
            grow
            @change="fetchData"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- label="발신번호" -->
        <kw-form-item
          v-if="sendMainData.bildcFwTpCd === 'K'"
          :label="t('MSG_TXT_DSPH_NO')"
          required
        >
          <zwcm-telephone-number
            v-model:tel-no1="telNos.telNo1"
            v-model:tel-no2="telNos.telNo2"
            v-model:tel-no3="telNos.telNo3"
            required
          />
        </kw-form-item>
        <!-- label="발신자" -->
        <kw-form-item
          v-else
          :label="t('MSG_TXT_DSPTR')"
          required
        >
          <zwcm-email-address
            v-model="sendMainData.toMail"
            required
            readonly
          />
        </kw-form-item>
        <!-- label="수신번호" -->
        <kw-form-item
          v-if="sendMainData.bildcFwTpCd === 'K'"
          :label="t('MSG_TXT_RECP_NO')"
          required
        >
          <zwcm-telephone-number
            v-model:tel-no1="telNos2.telNo1"
            v-model:tel-no2="telNos2.telNo2"
            v-model:tel-no3="telNos2.telNo3"
            required
          />
        </kw-form-item>
        <!-- label="수신자" -->
        <kw-form-item
          v-else
          :label="t('MSG_TXT_RECP_USR')"
        >
          <zwcm-email-address
            v-model="sendMainData.fromMail"
            required
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />

    <!-- 발신 내역 -->
    <h3>
      {{ t('MSG_TXT_DSPH_IZ') }}
    </h3>

    <kw-list
      :items="items"
      separator
      item-padding="16px 0"
    >
      <template #item="{ item }">
        <kw-item-section>
          <kw-form
            dense
          >
            <kw-form
              dense
            >
              <kw-form-item label="발송일시">
                <p>{{ item.bildcFwDtm }}</p>
              </kw-form-item>
              <!-- label="발송유형" -->
              <kw-form-item
                :label="t('MSG_TXT_FW_TP')"
              >
                <p>{{ item.bildcFwTpCd }}</p>
              </kw-form-item>
              <!-- label="발신" -->
              <kw-form-item
                :label="t('MSG_TXT_DSPTR')"
              >
                <p>{{ item.callback }}</p>
              </kw-form-item>
              <!-- label="수신" -->
              <kw-form-item
                :label="t('MSG_TXT_RECP_USR')"
              >
                <p>{{ item.recipientNum }}</p>
              </kw-form-item>
            </kw-form>
          </kw-form>
        </kw-item-section>
      </template>
    </kw-list>

    <template #action>
      <div class="tablet-action-left">
        <!-- label="이전" -->
        <kw-btn
          secondary
          :label="t('MSG_BTN_CANCEL')"
          @click="onClickBefore"
        />
      </div>
      <!-- label="발송" -->
      <div class="tablet-action-right">
        <kw-btn
          primary
          :label="t('MSG_BTN_SEND')"
          @click="onClickSend"
        />
      </div>
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, notify, useDataService, confirm } from 'kw-lib';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import ZwcmEmailAddress from '~common/components/ZwcmEmailAddress.vue';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const router = useRouter();
const dataService = useDataService();
const { t } = useI18n();
const { getters } = useStore();
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
const userInfo = getters['meta/getUserInfo'];

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

const telNos = ref({
  telNo1: '',
  telNo2: '',
  telNo3: '',
});

const telNos2 = ref({
  telNo1: '',
  telNo2: '',
  telNo3: '',
});

// 이전 버튼 클릭
async function onClickBefore() {
  await router.push(
    {
      path: '/withdrawal/wtwdb-billing-document-mgt',
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
  console.log(res.data);

  const list = res.data;

  list.forEach((data) => {
    if (data.bildcFwDtm) {
      data.bildcFwDtm = dayjs(data.bildcFwDtm).format('YYYY-MM-DD');
    }

    data.bildcFwTpCd = data.bildcFwTpCd === 'K' ? t('MSG_TXT_KAKAO_NOTAK') : t('MSG_TXT_EMAIL');
  });

  items.value = list;

  console.log(items.value);
}

let paramData;
async function onClickSend() {
  if (!await frmMainRef.value.validate()) { return; }
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }

  if (await confirm(t('MSG_ALT_WANT_SEND?'))) {
    sendMainData.value.destInfo = telNos.value.telNo1 + telNos.value.telNo2 + telNos.value.telNo3;
    sendMainData.value.callback = telNos2.value.telNo1 + telNos2.value.telNo2 + telNos2.value.telNo3;

    // if (sendMainData.value.bildcFwTpCd === 'K') {
    //   if (!telNos.value.telNo1 || !telNos.value.telNo2 || !telNos.value.telNo3) {
    //     await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_DSPH_NO')]));
    //     return;
    //   }

    //   if (!telNos2.value.telNo1 || !telNos2.value.telNo2 || !telNos2.value.telNo3) {
    //     await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_RECP_NO')]));
    //     return;
    //   }
    // } else {
    // // eslint-disable-next-line no-lonely-if
    //   if (!sendMainData.value.toMail) {
    //     await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_DSPTR_EML')]));
    //     return;
    //   }
    //   if (!sendMainData.value.fromMail) {
    //     await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_RCVR_EML')]));
    //     return;
    //   }

    // if (!sendMainData.value.fromMail) {
    //   await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_RCVR_EML')]));
    //   return;
    // }

    // if (!sendMainData.value.toMail) {
    //   await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_DSPTR_EML')]));
    //   return;
    // }
    // }

    paramData = cloneDeep(sendMainData.value);

    await dataService.post('/sms/wells/withdrawal/idvrve/billing-document-orders/forwardings', paramData);

    notify(t('MSG_ALT_SAVE_DATA')); // 메시지 자원 수정 필요

    await fetchData();
  }
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
