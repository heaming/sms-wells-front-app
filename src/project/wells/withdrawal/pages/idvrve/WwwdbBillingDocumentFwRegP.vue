<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : idvrve
2. 프로그램 ID : WwwdbBillingDocumentFwRegP - 청구서 발송
3. 작성자 : heungjun.lee
4. 작성일 : 2023.02.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 청구서를 발송한다.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
    :title="t('MSG_TIT_BILDC_FW')"
  >
    <!-- title="청구서 발송" -->
    <h3>{{ t('CST_INF_IN') }}</h3>
    <!-- <h3>고객 정보</h3> -->
    <kw-observer ref="obsRef">
      <kw-form :cols="1">
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_FW_TP')"
          >
            <!-- label="발송유형" -->
            <kw-option-group
              v-model="sendMainData.bildcFwTpCd"
              type="radio"
              :options="codes.BILDC_FW_TP_CD"
              @change="fetchData"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            v-if="sendMainData.bildcFwTpCd === 'K'"
            :label="t('MSG_TXT_DSPH_NO')"
          >
            <!-- label="발신번호" -->
            <!-- <kw-input v-model="sendMainData.callback" /> -->
            <zwcm-telephone-number
              v-model:tel-no1="telNos.telNo1"
              v-model:tel-no2="telNos.telNo2"
              v-model:tel-no3="telNos.telNo3"
              required
            />
          </kw-form-item>
          <kw-form-item
            v-else
            :label="t('MSG_TXT_DSPTR_EML')"
          >
            <!-- label="발신자 이메일" -->
            <zwcm-email-address
              v-model="sendMainData.toMail"
              readonly
              required
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            v-if="sendMainData.bildcFwTpCd === 'K'"
            :label="t('MSG_TXT_RECP_NO')"
          >
            <!-- label="수신번호" -->
            <zwcm-telephone-number
              v-model:tel-no1="telNos2.telNo1"
              v-model:tel-no2="telNos2.telNo2"
              v-model:tel-no3="telNos2.telNo3"
              required
            />
          <!-- <kw-input v-model="sendMainData.destInfo" /> -->
          </kw-form-item>
          <kw-form-item
            v-else
            :label="t('MSG_TXT_RCVR_EML')"
          >
            <!-- label="수신자 이메일" -->
            <zwcm-email-address
              v-model="sendMainData.fromMail"
              required
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </kw-observer>
    <kw-separator />
    <h3>{{ t('MSG_TXT_DSPH_IZ') }}</h3>
    <!-- <h3>발신 내역</h3> -->
    <kw-grid
      ref="grdPageRef"
      :visible-rows="5"
      @init="initGrid"
    />

    <template #action>
      <!-- <kw-btn
        negative
        :label="t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      /> -->
      <!-- label="취소" -->
      <kw-btn
        primary
        :label="t('MSG_BTN_SEND')"
        @click="onClickSend"
      />
      <!-- label="발송" -->
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, defineGrid, getComponentType, useDataService, useModal, notify } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import ZwcmEmailAddress from '~common/components/ZwcmEmailAddress.vue';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';

const dataService = useDataService();
const { t } = useI18n();
const { ok } = useModal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
console.log(userInfo.email);

const grdPageRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'BILDC_FW_TP_CD',
);

const props = defineProps({
  bildcPblNo: {
    type: String,
    default: null,
  },
  bildcPblSn: {
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

const obsRef = ref();

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

let paramData;
async function onClickSend() {
  console.log(sendMainData.value.toMail);

  if (!await obsRef.value.validate()) { return; }

  if (await obsRef.value.alertIfIsNotModified()) { return; }

  sendMainData.value.destInfo = telNos.value.telNo1 + telNos.value.telNo2 + telNos.value.telNo3;
  sendMainData.value.callback = telNos2.value.telNo1 + telNos2.value.telNo2 + telNos2.value.telNo3;

  paramData = cloneDeep(sendMainData.value);

  await dataService.post('/sms/wells/withdrawal/idvrve/billing-document-orders/forwardings', paramData);

  notify(t('MSG_ALT_SAVE_DATA')); // 메시지 자원 수정 필요

  ok();
}

let cachedParams;

async function fetchData() {
  cachedParams = cloneDeep(sendMainData.value);

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/billing-document-orders/forwardings', { params: cachedParams });
  console.log(res.data);

  const list = res.data;

  const view = grdPageRef.value.getView();

  const data = view.getDataSource();
  data.checkRowStates(false);
  data.setRows(list);

  data.checkRowStates(true);
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

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'bildcFwTpCd' },
    { fieldName: 'bildcFwDtm' },
    { fieldName: 'callback' },
    { fieldName: 'recipientNum' },
  ];

  const columns = [
    { fieldName: 'bildcFwTpCd',
      header: t('MSG_TXT_FW_TP'),
      // , header: '발송유형'
      width: '150',
      styleName: 'text-center',
      options: codes.BILDC_FW_TP_CD },
    { fieldName: 'callback',
      header: t('MSG_TXT_SEND'),
      // header: '발신',
      width: '150',
      styleName: 'text-center',
      // displayCallback(grid, index, value) {
      //   let tmp = '';
      //   tmp += value.substr(0, 3);
      //   tmp += '-';
      //   tmp += value.substr(3, 4);
      //   tmp += '-';
      //   tmp += value.substr(4, 4);
      //   return tmp;
      // }
    },
    { fieldName: 'recipientNum',
      header: t('MSG_TXT_RECP'),
      // header: '수신',
      width: '150',
      styleName: 'text-center',
    },
    { fieldName: 'bildcFwDtm',
      header: t('MSG_TXT_FW_DT'),
      // , header: '발송일시'
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'date' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
