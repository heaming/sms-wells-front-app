<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WmwdaAutoTransferChangeMgtM - 자동이체 변경신청(모바일) (W-MP-U-0178M01)
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
    <div class="pa20">
      <h3>{{ t('MSG_TXT_ELSG_VST_CH') }}</h3>
      <div class="mt20 row">
        <kw-input
          :placeholder="visitCocnMshCh"
          grow
          readonly
        />
        <kw-btn
          :label="t('MSG_BTN_CNTN_COPY')"
          secondary
          border-color="black-btn-line ml8"
          @click="onClickUrlCopy(1)"
        />
      </div>
      <div class="mt20">
        <kw-btn
          :label="t('MSG_BTN_CH')"
          secondary
          class="full-width"
          border-color="black-btn-line"
          @click="onClickChange()"
        />
      </div>
    </div>
    <kw-separator
      divider
      :spaced="`false`"
      size="8px"
    />
    <div class="pa20">
      <h3>{{ t('MSG_TXT_ELSG_LDSTC_CH') }}</h3>
      <div class="mt20 row">
        <kw-input
          :placeholder="elsgLdstcCh"
          grow
          readonly
        />
        <kw-btn
          :label="t('MSG_BTN_CNTN_COPY')"
          secondary
          border-color="black-btn-line ml8"
          @click="onClickUrlCopy(2)"
        />
      </div>
      <h4>{{ t('MSG_TXT_NOTAK_RCV_CST_NAME') }}</h4>
      <kw-input
        v-model.trim="inputParams.name"
        :placeholder="t('MSG_TXT_INP')"
        grow
        class="mt20"
        maxlength="15"
      />
      <h4>{{ t('MSG_TXT_NOTAK_RCV_CST_NO') }}</h4>
      <kw-input
        v-model="inputParams.phone"
        placeholder="01012345678"
        grow
        class="mt20"
        maxlength="11"
      />
      <ul class="kw-notification mt20">
        <li>{{ t('MSG_TXT_NOTAK_FW_CAN_IMP') }}</li>
      </ul>

      <div class="mt20">
        <kw-btn
          :label="t('MSG_BTN_BIZTALK_SEND')"
          secondary
          class="full-width"
          border-color="black-btn-line"
          @click="onClickAlarmSend"
        />
      </div>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { router, useGlobal } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { alert, notify } = useGlobal();

const { getters } = useStore();
const { userId } = getters['meta/getUserInfo'];

const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const akChdt = now.format('YYYYMMDD');

const inputParams = ref({
  name: '',
  phone: '',
});

const strDomain = window.location.host;

const visitCocnMshCh = `${strDomain}/#/withdrawal/zmwda-auto-transfer-payment-change`;
const elsgLdstcCh = `${strDomain}/#/withdrawal/zmwda-auto-transfer-payment-change`;

async function onClickUrlCopy(no) {
  if (no === 1) {
    navigator.clipboard.writeText(visitCocnMshCh);
  } else {
    navigator.clipboard.writeText(elsgLdstcCh);
  }
  notify(t('MSG_ALT_COPY_DATA'));
}

async function onClickChange() {
  const url = visitCocnMshCh;
  const query = {
    vstYn: 'Y',
    chRqrDvCd: '20',
    aftnThpChYn: 'N',
    clctamMngtYn: 'N',
    cntrChPrtnrNo: userId,
    akChdt,
  };
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
  await alert(t('준비중입니다.'));
  notify(t('MSG_ALT_BIZTALK_SEND_SUCCESS'));

  const url = visitCocnMshCh;

  const query = {
    vstYn: 'N',
    chRqrDvCd: '10',
    aftnThpChYn: 'N',
    clctamMngtYn: 'N',
    cntrChPrtnrNo: '',
    akChdt,
  };
  const path = url.slice(url.indexOf('#') + 1);

  await router.push({ path, query });
}

</script>

<style scoped lang="scss">

</style>
