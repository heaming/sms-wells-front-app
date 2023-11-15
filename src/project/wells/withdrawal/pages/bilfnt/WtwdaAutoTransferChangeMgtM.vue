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
    <kw-action-top class="mb20">
      <template #left>
        <h3>
          {{ t('MSG_TXT_ELSG_VST_CH') }}
        </h3>
      </template>
      <kw-btn
        :label="t('MSG_BTN_CH')"
        @click="onClickChange()"
      />
    </kw-action-top>
    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <h3>
          {{ t('MSG_TXT_ELSG_LDSTC_CH') }}
        </h3>
      </template>
      <kw-btn
        :label="t('MSG_BTN_BIZTALK_SEND')"
        @click="onClickAlarmSend"
      />
    </kw-action-top>
    <kw-form :cols="2">
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_NOTAK_RCV_CST_NAME')"
          required
        >
          <kw-input
            v-model="inputParams.cstNm"
            :regex="/^[A-Z가-힣ㄱ-ㅎ]*$/i"
            :label="t('MSG_TXT_NOTAK_RCV_CST_NAME')"
            maxlength="15"
            :placeholder="t('MSG_TXT_INP')"
            rules="required"
          />
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_NOTAK_RCV_CST_NO')"
          required
        >
          <kw-input
            v-model:tel-no0="inputParams.cralLocaraTno"
            v-model:tel-no1="inputParams.mexnoGbencr"
            v-model:tel-no2="inputParams.cralIdvTno"
            :label="$t('MSG_TXT_NOTAK_RCV_CST_NO')"
            mask="telephone"
            :rules="'required|telephone'"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <ul class="kw-notification mt20">
      <li>{{ t('MSG_TXT_NOTAK_FW_CAN_IMP') }}</li>
    </ul>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
import { useDataService, modal, router, useGlobal, popupUtil } from 'kw-lib';
// eslint-disable-next-line no-unused-vars
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const dataService = useDataService();
const { notify } = useGlobal();

const { getters } = useStore();
// eslint-disable-next-line no-unused-vars
const { userId } = getters['meta/getUserInfo'];

const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const formRef = ref();

const inputParams = ref({
  cstNm: '',
  phone: '',
  cralLocaraTno: '', /* 휴대전화번호1 */
  mexnoGbencr: '', /* 휴대전화번호2 */
  cralIdvTno: '', /* 휴대전화번호3 */
});

const akChdt = now.format('YYYYMMDD');

const strDomain = window.location.host;

const visitCocnMshCh = `${strDomain}/tablet/#/withdrawal/ztwda-auto-transfer-payment-change?vstYn=Y&chRqrDvCd=2&aftnThpChYn=N&clctamMngtYn=N&akChdt=${akChdt}`; // 방문
// eslint-disable-next-line no-unused-vars
const elsgLdstcCh = `${strDomain}/tablet/#/withdrawal/ztwda-auto-transfer-payment-change?vstYn=N&chRqrDvCd=1&aftnThpChYn=N&clctamMngtYn=N&akChdt=${akChdt}`; // 원거리

async function onClickChange() {
  const query = {
    vstYn: 'Y',
    chRqrDvCd: '2',
    aftnThpChYn: 'N',
    clctamMngtYn: 'N',
    akChdt,
  };
  const url = visitCocnMshCh;

  const path = url.slice(url.indexOf('#') + 1);

  await router.push({ path, query });
}

// 알림톡 발송
async function onClickAlarmSend() {
  const deviceScreen = '/#/ns/ztwda-auto-transfer-payment-change?';
  const nsUrl = '/anonymous/login?deviceCheck=Y&redirectUrl=';

  const params = {
    vstYn: 'N',
    chRqrDvCd: '1',
    aftnThpChYn: 'N',
    clctamMngtYn: 'N',
    akChdt,
  };

  const query = deviceScreen + new URLSearchParams(params);

  const nsFullUrl = query;

  // chRqrDvCd 방문 : '2' (교원) / 원거리 : '1' (고객)
  if (!await formRef.value.validate()) { return; }
  inputParams.value = { ...inputParams.value,
    strDomain,
    nsUrl,
    nsFullUrl,
    chr3ChYn: 'N',
  };
  await dataService.post('sms/common/withdrawal/bilfnt/auto-transfer-change/notification-talk-send', inputParams.value);

  notify(t('MSG_ALT_BIZTALK_SEND_SUCCESS'));
}

onMounted(async () => {
  formRef.value.reset();
});

</script>
