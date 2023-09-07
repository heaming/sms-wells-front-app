<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WCTA
2. 프로그램 ID : WwctaVirtualAccountDocumentMailForwardingP - 가상계좌 메일발송
3. 작성자 : hyeonjong.ra
4. 작성일 : 2023.06.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0092P17] - 관리정보 탭 화면에서 가상계좌 정보를 '메일발송'버튼 클릭시 호출되는 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
    ignore-on-modified
  >
    <kw-form :cols="1">
      <kw-form-row>
        <kw-form-item no-label>
          <zwcm-email-address
            v-model="mailAddr"
            required
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <!-- 취소 -->
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="cancel()"
      />
      <!-- 발송 -->
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
import { useModal, useGlobal, useDataService, notify } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import ZwcmEmailAddress from '~common/components/ZwcmEmailAddress.vue';

const { cancel, ok } = useModal();
const { confirm, alert } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();

const props = defineProps({
  mailAddr: { // 메일주소
    type: String,
    default: null,
  },
  vacBnkNm: { // 가상계좌은행명
    type: String,
    default: null,
  },
  vacNo: { // 가상계좌번호
    type: String,
    default: null,
  },
  vacGbn: { // 가상계좌구분. 셰틀뱅크(S),KICC(K)
    type: String,
    default: null,
  },
  custNm: { // 고객명
    type: String,
    default: null,
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const mailAddr = ref('');

async function onClickSend() {
  if (isEmpty(mailAddr.value)) {
    await alert(t('MSG_TXT_ENTR_EMAIL'));
    return;
  }

  // [{0}]님에게 메일을 발송하겠습니까?[{1}]
  if (await confirm(t('MSG_ALT_EML_FW_CONF', [props.custNm, mailAddr.value]))) {
    const params = {
      mailAddr: mailAddr.value,
      vacBnkNm: props.vacBnkNm,
      vacNo: props.vacNo,
      vacGbn: props.vacGbn,
      custNm: props.custNm,
    };
    await dataService.post('/sms/wells/contract/contracts/order-details/virtual-account-document', params);
    ok();
    notify(t('MSG_ALT_EML_FW_FSH')); // 메일 발송이 완료되었습니다.
  }
}

onMounted(async () => {
  if (!isEmpty(props.mailAddr)) {
    mailAddr.value = props.mailAddr;
  }
});

</script>
