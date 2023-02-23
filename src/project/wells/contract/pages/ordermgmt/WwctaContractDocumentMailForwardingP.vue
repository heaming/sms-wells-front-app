<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaContractDocumentMailForwardingP - wells 계약서 메일 발송
3. 작성자 : sc
4. 작성일 : 2023.02.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
고객에게 계약서를 메일로 발송하기 위한 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--md"
  >
    <kw-form
      :cols="1"
    >
      <kw-form-row>
        <kw-form-item no-label>
          <zwcm-email-address
            v-model="params.emadr"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        negative
        dense
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickClose"
      />
      <kw-btn
        primary
        dense
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
import { useDataService, useGlobal, useModal } from 'kw-lib';
import ZwcmEmailAddress from '~common/components/ZwcmEmailAddress.vue';

const { confirm, notify } = useGlobal();
const { t } = useI18n();
const { cancel: onClickClose } = useModal();
const dataService = useDataService();
const props = defineProps({
  cntrNm: { type: String },
  cntrNo: { type: String },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const params = ref({
  cntrNm: props.cntrNm,
  cntrNo: props.cntrNo,
  emadr: '',
});

async function onClickSend() {
  if (await confirm(t('MSG_ALT_EML_FW_CONF', [params.value.cntrNm, params.value.emadr]))) {
    await dataService.post('/sms/wells/contract/contracts/send-emails', params.value);
    await notify(t('MSG_ALT_EML_FW_FSH'));
    onClickClose();
  }
}
</script>
