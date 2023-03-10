<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WtwdaAutoTransferChangeMgtM - 자동이체 변경신청(테블릿) (W-MT-U-0178M01)
3. 작성자 : donghyun.yoo
4. 작성일 : 2023.03.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
자동이체 변경 신청서 작성 화면 연결
****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="border-box">
      <h3 class="mb20">
        {{ t('MSG_TXT_ELSG_VST_CH') }}
      </h3>
      <kw-field-wrap>
        <kw-input
          class="kw-grow"
          readonly
          :placeholder="visitCocnMshCh"
        />
        <kw-btn
          :label="t('MSG_BTN_CNTN_COPY')"
          class="ml8"

          @click="onClickUrlCopy(1)"
        />
        <kw-btn
          :label="t('MSG_BTN_CH')"
          class="ml8"
          @click="onClickChange(1)"
        />
      </kw-field-wrap>
    </div>
    <div class="border-box mt20">
      <h3 class="mb20">
        {{ t('MSG_TXT_ELSG_LDSTC_CH') }}
      </h3>
      <kw-field-wrap>
        <kw-input
          class="kw-grow"
          readonly
          :placeholder="elsgLdstcCh"
        />
        <kw-btn
          :label="t('MSG_BTN_CNTN_COPY')"
          class="ml8"
          @click="onClickUrlCopy(2)"
        />
        <kw-btn
          :label="t('MSG_BTN_CH')"
          class="ml8"
          @click="onClickChange(2)"
        />
      </kw-field-wrap>

      <kw-separator />

      <kw-form :cols="2">
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_NOTAK_RCV_CST_NAME')"
          >
            <kw-input
              v-model="inputParams.name"
              maxlength="15"
              :placeholder="t('MSG_TXT_INP')"
            />
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_NOTAK_RCV_CST_NO')"
          >
            <kw-input
              v-model="inputParams.phone"
              maxlength="11"
              placeholder="01012345678"
            />
            <kw-btn
              :label="t('MSG_BTN_BIZTALK_SEND')"
              class="ml8"
              @click="onClickAlarmSend"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <ul class="kw-notification mt20">
        <li>{{ t('MSG_TXT_NOTAK_FW_CAN_IMP') }}</li>
      </ul>
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
import { modal, router, useGlobal } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { notify } = useGlobal();

const { getters } = useStore();
const { userId } = getters['meta/getUserInfo'];

const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const inputParams = ref({
  name: '',
  phone: '',
});

const akChdt = now.format('YYYYMMDD');

const strDomain = window.location.host;

const visitCocnMshCh = `${strDomain}/#/withdrawal/ztwda-auto-transfer-payment-change`; // 방문
const elsgLdstcCh = `${strDomain}/#/withdrawal/ztwda-auto-transfer-payment-change`; // 원거리 차이가 없음

async function onClickUrlCopy(no) {
  if (no === 1) {
    navigator.clipboard.writeText(visitCocnMshCh);
  } else {
    navigator.clipboard.writeText(elsgLdstcCh);
  }
  notify(t('MSG_ALT_COPY_DATA'));
}

async function onClickChange(no) {
  const query = {
    vstYn: no === 1 ? 'Y' : 'N',
    chRqrDvCd: no === 1 ? '20' : '10',
    aftnThpChYn: 'N',
    clctamMngtYn: 'N',
    cntrChPrtnrNo: no === 1 ? userId : '',
    akChdt,
  };
  const url = no === 1 ? visitCocnMshCh : elsgLdstcCh;

  const path = url.slice(url.indexOf('#') + 1);

  await router.push({ path, query });
}

async function onClickAlarmSend() {
  const regex = /^\d{3}?\d{3,4}?\d{4}$/;
  const regexResult = regex.test(inputParams.value.phone);

  if (!regexResult || isEmpty(inputParams.value.name)) {
    notify(t('MSG_ALT_NAME_NO_IN'));
    return;
  }
  // chRqrDvCd 방문 : '20' (교원) / 원거리 : '10' (고객)
  // notify(t('MSG_ALT_BIZTALK_SEND_SUCCESS'));
  notify(t('MSG_ALT_BIZTALK_SEND_SUCCESS'));

  const query = {
    vstYn: 'N',
    chRqrDvCd: '10',
    aftnThpChYn: 'N',
    clctamMngtYn: 'N',
    cntrChPrtnrNo: '',
    akChdt,
  };
  const url = elsgLdstcCh;

  const path = url.slice(url.indexOf('#') + 1);
  await router.push({ path, query });
}

</script>
