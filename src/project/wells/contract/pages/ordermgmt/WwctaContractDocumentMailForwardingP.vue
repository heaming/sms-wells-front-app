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
import { isEmpty } from 'lodash-es';
import ZwcmEmailAddress from '~common/components/ZwcmEmailAddress.vue';
import { buildUrlForNoSession, getSystemOrigin } from '~sms-common/contract/util';

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
  const { rstlYn } = params.value.rcvrInfo[0]; // 재약정 여부

  // console.log(`rsvrInfo = ${params.value.rcvrInfo[0]}`);
  // console.log(`rstlYn = ${rstlYn}`);

  if (rcvrInfoCnt > 0) {
    rcvrInfoCntrNm = `${params.value.rcvrInfo[0].cntrNm}외${rcvrInfoCnt}명`;
  } else {
    rcvrInfoCntrNm = params.value.rcvrInfo[0].cntrNm;
  }

  const paramOrigin = getSystemOrigin(import.meta.env.MODE === 'prd' || import.meta.env.MODE === 'production'
    ? 'cswl' : import.meta.env.MODE); // 대외링크오리진(운영) = cswl, 그외에는 해당시스템에 맞는 오리진을 생성(개발, 검증)
  console.log(paramOrigin);
  if (rstlYn === 'N') { // 신규/변경 메일 URL 생성
  // 체크된 계약별 URL 생성 및 param 추가
    const promises = props.rcvrInfo.map((index) => (
      buildUrlForNoSession(
        paramOrigin,
        'WwctaContractDocumentM',
        { cntrNo: index.cntrNo },
        true,
        true,
      )).then((paramUrl) => {
      index.pdfUrl = paramUrl;
    }));
    await Promise.all(promises);
  }

  if (rstlYn === 'Y') { // 재약정 메일 URL 생성
    const promises = props.rcvrInfo.map((index) => (
      buildUrlForNoSession(
        paramOrigin,
        'WwctaForwardingContractM',
        {
          cntrNo: index.cntrNo,
          cntrSn: index.cntrSn,
          rptId: 'RP002',
          cntrTempSaveDt: isEmpty(index.stplCnfmDt) ? '' : index.stplCnfmDt,
          stplTn: isEmpty(index.stplTn) ? '' : index.stplTn,
        },
        true,
        true,
      )).then((paramUrl) => {
      index.pdfUrl = paramUrl;
    }));
    await Promise.all(promises);
  }

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
