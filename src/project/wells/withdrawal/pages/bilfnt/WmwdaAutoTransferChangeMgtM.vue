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
      <!-- <div class="mt20 row">
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
      </div> -->
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
    <kw-form
      ref="formRef"
    >
      <div class="pa20">
        <h3>{{ t('MSG_TXT_ELSG_LDSTC_CH') }}</h3>
        <!-- <div class="mt20 row">
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
        </div> -->
        <h4>{{ t('MSG_TXT_NOTAK_RCV_CST_NAME') }}</h4>
        <kw-input
          v-model.trim="inputParams.cstNm"
          :regex="/^[A-Z가-힣ㄱ-ㅎ]*$/i"
          :label="t('MSG_TXT_NOTAK_RCV_CST_NAME')"
          :placeholder="t('MSG_TXT_INP')"
          grow
          class="mt20"
          maxlength="15"
          rules="required"
        />
        <h4>{{ t('MSG_TXT_NOTAK_RCV_CST_NO') }}</h4>
        <kw-input
          v-model:tel-no0="inputParams.cralLocaraTno"
          v-model:tel-no1="inputParams.mexnoGbencr"
          v-model:tel-no2="inputParams.cralIdvTno"
          :label="$t('MSG_TXT_NOTAK_RCV_CST_NO')"
          mask="telephone"
          rules="telephone|required"
          class="mt20"
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
    </kw-form>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
import { useDataService, router, useGlobal, popupUtil } from 'kw-lib';
// eslint-disable-next-line no-unused-vars
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const dataService = useDataService();
// eslint-disable-next-line no-unused-vars
const { alert, notify } = useGlobal();

const { getters } = useStore();
// eslint-disable-next-line no-unused-vars
const { userId } = getters['meta/getUserInfo'];

const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const formRef = ref();

const akChdt = now.format('YYYYMMDD');

const inputParams = ref({
  cstNm: '',
  phone: '',
  cralLocaraTno: '', /* 휴대전화번호1 */
  mexnoGbencr: '', /* 휴대전화번호2 */
  cralIdvTno: '', /* 휴대전화번호3 */
});

const strDomain = window.location.host;

const visitCocnMshCh = `${strDomain}/mobile/#/withdrawal/zmwda-auto-transfer-payment-change?vstYn=Y&chRqrDvCd=2&aftnThpChYn=N&clctamMngtYn=N&akChdt=${akChdt}`;
// eslint-disable-next-line no-unused-vars
const elsgLdstcCh = `${strDomain}/mobile/#/withdrawal/zmwda-auto-transfer-payment-change?vstYn=N&chRqrDvCd=1&aftnThpChYn=N&clctamMngtYn=N&akChdt=${akChdt}`;

async function onClickChange() {
  const url = visitCocnMshCh;
  const query = {
    vstYn: 'Y',
    chRqrDvCd: '2',
    aftnThpChYn: 'N',
    clctamMngtYn: 'N',
    akChdt,
  };
  const path = url.slice(url.indexOf('#') + 1);

  await router.push({ path, query });
}

// 알림톡 발송
async function onClickAlarmSend() {
  const deviceScreen = '/#/ns/zmwda-auto-transfer-payment-change?';
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

<style scoped lang="scss">

</style>
