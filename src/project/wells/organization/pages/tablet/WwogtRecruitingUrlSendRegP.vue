<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGB
2. 프로그램 ID : WwogtRecruitingUrlSendRegP - 플래너 업무등록 - URL 발송(태블릿)
3. 작성자 : 홍태기
4. 작성일 : 2023-03-10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 플래너 업무등록 - URL 발송(태블릿)
****************************************************************************************************
--->
<template>
  <kw-popup size="sm">
    <kw-form
      ref="frmMainRef"
      :cols="1"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_EMPL_NM')"
          required
        >
          <kw-input
            v-model="urlSendInfo.rcvrNm"
            :label="$t('MSG_TXT_EMPL_NM')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_MPNO')"
          required
        >
          <kw-input
            v-model="urlSendInfo.phoneNumber"
            :label="$t('MSG_TXT_MPNO')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_FRNR_YN')">
          <kw-checkbox v-model="urlSendInfo.frnrYn" />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <kw-btn
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
import { useModal, useDataService, getComponentType, useGlobal, useMeta } from 'kw-lib';
import { SMS_COMMON_URI } from '~sms-common/organization/constants/ogConst';
import { getPhoneNumber } from '~sms-common/organization/utils/ogUtil';
import dayjs from 'dayjs';

const now = dayjs();
const frmMainRef = ref(getComponentType('KwForm'));
const dataService = useDataService();

const { t } = useI18n();
const { notify } = useGlobal();
const { ok, cancel: onClickCancel } = useModal();
const { getUserInfo } = useMeta();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const { ogTpCd: userOgTpCd, employeeIDNumber } = getUserInfo();

const res = await dataService.get(`${SMS_COMMON_URI}/partners/${employeeIDNumber}-${userOgTpCd}/month/${now.format('YYYYMM')}`);
const { ogTpCd, ogId } = await res.data;

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
  debugger;
  const smsFwUrlNm = `/#/ns/zwogx-recruiting-reg?frnrYn=${urlSendInfo.value.frnrYn}`;
  const smsUrl = '/anonymous/login?redirectUrl=';
  const param = {
    rcvrNm: urlSendInfo.value.rcvrNm,
    prtnrNo: employeeIDNumber,
    ogId,
    ogTpCd,
    cralLocaraTno,
    mexnoEncr,
    cralIdvTno,
    smsFwUrlNm,
    smsUrl,
  };
  await dataService.post(`${SMS_COMMON_URI}/recruitings/url-send-info`, param);
  notify(t('MSG_ALT_SEND'));
  ok();
}
</script>
