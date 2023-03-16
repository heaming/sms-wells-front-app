<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGB
2. 프로그램 ID : WwogxRecruitingUrlSendRegP - 리쿠르팅 등록 URL발송
3. 작성자 : 홍태기
4. 작성일 : 2023-03-10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 리쿠르팅 등록 URL발송
****************************************************************************************************
--->
<template>
  <kw-popup>
    <div class="pa20">
      <kw-form
        ref="frmMainRef"
        :cols="1"
      >
        <kw-input
          :label="$t('MSG_TXT_EMPL_NM')"
          :placeholder="$t('MSG_TXT_EMPL_NM')"
          class=".kw-font-pt14 mb20"
        />
        <kw-input
          :label="$t('MSG_TXT_MPNO')"
          :placeholder="$t('MSG_TXT_MPNO')"
          class=".kw-font-pt14 mb20"
        />

        <kw-checkbox
          v-model="urlSendInfo.frnrYn"
          :label="$t('MSG_TXT_FRNR_YN')"
        />
      </kw-form>
    </div>
    <template #action>
      <kw-btn
        filled
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <kw-btn
        filled
        primary
        :label="$t('MSG_BTN_SEND')"
        @click="onClickSend"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useModal, useDataService, getComponentType, useGlobal } from 'kw-lib';
import { SMS_COMMON_URI } from '~sms-common/organization/constants/ogConst';
import { getPhoneNumber } from '~sms-common/organization/utils/ogUtil';

const frmMainRef = ref(getComponentType('KwForm'));
const dataService = useDataService();

const { t } = useI18n();
const { notify } = useGlobal();
const { ok, cancel: onClickCancel } = useModal();
const { getters } = useStore();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const userInfo = getters['meta/getUserInfo'];
console.log(userInfo);
const { ogTpCd } = userInfo;

const urlSendInfo = ref({
  rcvrNm: undefined,
  phoneNumber: undefined,
  frnrYn: 'N',
});

// URL 발송
async function onClickSend() {
  if (!await frmMainRef.value.validate()) { return; }

  const cralLocaraTno = getPhoneNumber(urlSendInfo.value.phoneNumber, 1);
  const mexnoEncr = getPhoneNumber(urlSendInfo.value.phoneNumber, 2);
  const cralIdvTno = getPhoneNumber(urlSendInfo.value.phoneNumber, 3);

  const smsFwUrlNm = `${window.location.origin}/#/ogmngt/zwogt-recruiting-reg?frnrYn=${urlSendInfo.value.frnrYn}`;

  const param = {
    rcvrNm: urlSendInfo.value.rcvrNm,
    ogTpCd,
    cralLocaraTno,
    mexnoEncr,
    cralIdvTno,
    smsFwUrlNm,
  };
  await dataService.post(`${SMS_COMMON_URI}/recruitings/url-send-info`, param);
  notify(t('MSG_ALT_SEND'));
  ok();
}
</script>
