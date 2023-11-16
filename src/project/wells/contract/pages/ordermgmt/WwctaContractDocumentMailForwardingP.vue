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
    ignore-on-modified
    no-action
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
import { useGlobal, useDataService, useModal } from 'kw-lib';
import ZwcmEmailAddress from '~common/components/ZwcmEmailAddress.vue';
import { buildUrlForNoSession } from '~sms-common/contract/util';

const { notify, confirm, alert } = useGlobal();
const { t } = useI18n();
const { ok, cancel: onClickClose } = useModal();
const dataService = useDataService();
const props = defineProps({
  rcvrInfo: { type: [Object] },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const params = ref({
  rcvrInfo: props.rcvrInfo,
  emadr: '',
});

// 발송버튼 클릭 이벤트
async function onClickSend() {
  let rcvrInfoCntrNm = '';
  const rcvrInfoCnt = Number(params.value.rcvrInfo.length) - 1;
  if (rcvrInfoCnt > 0) {
    rcvrInfoCntrNm = `${params.value.rcvrInfo[0].cntrNm}외${rcvrInfoCnt}명`;
  } else {
    rcvrInfoCntrNm = params.value.rcvrInfo[0].cntrNm;
  }

  // 체크된 계약별 URL 생성 및 param 추가
  const promises = props.rcvrInfo.map((index) => (
    buildUrlForNoSession(
      undefined,
      'WwctaContractDocumentM',
      { cntrNo: index.cntrNo },
      true,
      false,
    )).then((paramUrl) => {
    index.pdfUrl = paramUrl;
  }));
  await Promise.all(promises);

  console.log(params);
  if (await confirm(t('MSG_ALT_EML_FW_CONF', [rcvrInfoCntrNm, params.value.emadr]))) {
    params.value.rcvrInfo.forEach((n) => {
      n.emadr = params.value.emadr;
    });
    console.log(params.value.rcvrInfo);
    await dataService.post('/sms/wells/contract/contracts/send-emails', params.value.rcvrInfo);
    ok();
    await notify(t('MSG_ALT_EML_FW_FSH'));
  }
}

onMounted(async () => {
  if (!params.value.rcvrInfo || params.value.rcvrInfo.length <= 0) {
    await alert('수신인 정보를 확인하세요.');
    onClickClose();
  }
});
</script>
