<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaVirtualAccountMessageForwardingP - 주문상세페이지 내부 팝업 가상계좌 메세지 보내기
3. 작성자 : Myoungbin Joo
4. 작성일 : 2023.05.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 주문상세페이지 내부 팝업 가상계좌 메세지 보내기 화면
****************************************************************************************************
--->
<template>
  <kw-popup size="md">
    <kw-observer ref="obsMainRef">
      <kw-form :cols="1">
        <kw-form-row>
          <!-- 수신인 -->
          <kw-form-item
            :label="t('MSG_TXT_RCPT_USR')"
            required
          >
            <kw-option-group
              v-model="fieldParam.gubun"
              type="radio"
              rules="required"
              :name="t('MSG_TXT_RCPT_USR')"
              :options="gubunOption"
              @change="onChange"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 휴대전화번호 -->
          <kw-form-item
            :label="t('MSG_TXT_CRAL_NO')"
            required
          >
            <zwcm-telephone-number
              v-model:tel-no1="fieldParam.cralLocaraTno"
              v-model:tel-no2="fieldParam.mexnoEncr"
              v-model:tel-no3="fieldParam.cralIdvTno"
              :tel-no1-clearable="false"
              :name="t('MSG_TXT_CRAL_NO')"
              required
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item no-label>
            <kw-input
              v-model="fieldParam.template"
              type="textarea"
              maxlength="4000"
              :rows="10"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </kw-observer>
    <template #action>
      <kw-btn
        negative
        :label="t('MSG_BTN_CANCEL')"
        @click="cancel()"
      />
      <kw-btn
        primary
        :label="t('MSG_BTN_SEND_MSG')"
        @click="onClickSend"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useModal, useDataService, useGlobal } from 'kw-lib';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import { cloneDeep, isEmpty } from 'lodash-es';

const { confirm, alert, notify } = useGlobal();
const { cancel, ok } = useModal();
const { t } = useI18n();
const dataService = useDataService();

const obsMainRef = ref();
const gubunOption = [{ codeId: 'A', codeName: t('MSG_TXT_INSTR') }, { codeId: 'B', codeName: t('MSG_TXT_CNTRT') }];

const props = defineProps({
  cntrNo: { type: String, required: true, default: '' }, // 계약번호
  cntrSn: { type: String, required: false, default: '' }, // 계약일련번호
  cralTno: { type: String, required: false, default: '' }, // 계약자 전화번호
  rcgvpTno: { type: String, required: false, default: '' }, // 설치(배송정보) 휴대전화번호
});

const fieldParam = ref({
  templateId: 'TMP_CTA_VIRTUAL_ACCOUNT_GUIDE', // templateId
  cralLocaraTno: '', // 휴대전화 통신사번호
  mexnoEncr: '', // 휴대전화 중간번호
  cralIdvTno: '', // 휴대전화 끝번호
  cntrNo: props.cntrNo, // 계약번호
  cntrSn: props.cntrSn, // 계약일련번호
  cstNm: '', // 고객명
  cstNo: '',
  vacBnkNm: '', // 은행명
  vacNo: '', // 가상계좌번호
  template: '', // template
  msgTit: '[웰스] 가상계좌 안내',
  gubun: '',
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// onClickSend: SMS 보내기
async function onClickSend() {
  if (isEmpty(fieldParam.value.cntrNo)) {
    alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_CNTR_NO')]));
    return false;
  }
  if (isEmpty(fieldParam.value.cntrSn)) {
    alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_CNTR_SN')]));
    return false;
  }
  if (isEmpty(fieldParam.value.vacBnkNm)) {
    alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_BNK_NM')]));
    return false;
  }
  if (isEmpty(fieldParam.value.cstNo)) {
    alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_CST_NO')]));
    return false;
  }

  if (await obsMainRef.value.alertIfIsNotModified()) { return; }
  if (!await obsMainRef.value.validate()) { return; }
  if (!await confirm(t('MSG_ALT_WANT_SEND'))) { return; }

  const param = cloneDeep(fieldParam.value);

  await dataService.post('/sms/wells/contract/contracts/order-details/virtual-account-message', param);
  ok();
  notify(t('MSG_ALT_SEND'));
}

// fetchData: 데이터 가져오기
async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/order-details/virtual-account-message', { params: fieldParam.value });

  fieldParam.value.cstNm = res.data.cstNm;
  fieldParam.value.cstNo = res.data.cstNo; // 고객번호
  fieldParam.value.template = res.data.template; // 템플릿
  fieldParam.value.vacNo = res.data.vacNo; // 가상계좌번호
  fieldParam.value.vacBnkNm = res.data.vacBnkNm; // 가상계좌은행명
  obsMainRef.value.init();

  if (isEmpty(fieldParam.value.vacNo)) {
    alert(t('MSG_ALT_NOT_EXIST', [t('MSG_TXT_VT_AC_NO')]));
    cancel();
  }
}

async function onChange() {
  if (fieldParam.value.gubun === 'A') {
    fieldParam.value.cralLocaraTno = props.cralTno.split('-')[0];
    fieldParam.value.mexnoEncr = props.cralTno.split('-')[1];
    fieldParam.value.cralIdvTno = props.cralTno.split('-')[2];
  } else {
    fieldParam.value.cralLocaraTno = props.rcgvpTno.split('-')[0];
    fieldParam.value.mexnoEncr = props.rcgvpTno.split('-')[1];
    fieldParam.value.cralIdvTno = props.rcgvpTno.split('-')[2];
  }
}

// onMounted: init
onMounted(async () => {
  await fetchData();
});

/*
const tempText = ref(`
안녕하세요 웰스입니다.
요청하신 가상계좌 안내드립니다.

▶ 고객명 : 김고객
▶ 계약번호 : 2023-1234567-12

▶ 가상계좌 : (Undefined) Undefined

안내 계좌로 입금부탁드립니다.

감사합니다.
`);
*/
</script>
