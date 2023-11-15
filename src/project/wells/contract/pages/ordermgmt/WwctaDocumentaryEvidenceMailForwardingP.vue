<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaDocumentaryEvidenceMailForwardingP
3. 작성자 : Myoungbin Joo
4. 작성일 : 2023.06.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 계약서 메일발송 W-SS-U-0092P16
****************************************************************************************************
--->
<template>
  <kw-popup
    size="lg"
  >
    <kw-observer ref="obsMainRef">
      <kw-form
        :cols="2"
      >
        <kw-form-row>
          <!-- 기간 -->
          <kw-form-item
            :label="t('MSG_TXT_PRD')"
            required
            :colspan="2"
          >
            <kw-date-range-picker
              v-model:from="fieldParams.firstDt"
              v-model:to="fieldParams.lastDt"
              disable
              :label="t('MSG_TXT_PRD')"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 발행일자 -->
          <kw-form-item
            :label="t('MSG_TXT_PBL_DT')"
            required
          >
            <kw-date-picker
              v-model="fieldParams.pblDt"
              :label="t('MSG_TXT_PBL_DT')"
              rules="required"
            />
          </kw-form-item>
          <!-- 고객명 -->
          <kw-form-item
            :label="t('MSG_TXT_CST_NM')"
            required
          >
            <kw-input
              v-model="fieldParams.cstKnm"
              :label="t('MSG_TXT_CST_NM')"
              rules="required|"
              maxlength="30"
            />
          </kw-form-item>
        </kw-form-row>
        <slot v-if="props.isPrntYn === 'N'">
          <kw-form-row>
            <!-- 이메일 -->
            <kw-form-item
              :colspan="2"
              :label="t('MSG_TXT_EMAIL')"
              required
            >
              <zwcm-email-address
                v-model="fieldParams.recpMail"
                :label="t('MSG_TXT_EMAIL')"
                required
              />
            </kw-form-item>
          </kw-form-row>
        </slot>
      </kw-form>
    </kw-observer>
    <template #action>
      <kw-btn
        negative
        :label="t('MSG_BTN_CANCEL')"
        @click="cancel"
      />
      <!-- 발송 -->
      <slot v-if="props.isPrntYn === 'N'">
        <kw-btn
          primary
          :label="t('MSG_BTN_SEND')"
          @click="onClickSendEmail"
        />
      </slot>
      <!-- 발행(출력) -->
      <slot v-else-if="props.isPrntYn === 'Y'">
        <kw-btn
          primary
          :label="t('MSG_BTN_PBL_PRNT')"
          @click="onClickSendEmail"
        />
      </slot>
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useModal, getComponentType, useGlobal } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';

import dayjs from 'dayjs';
import ZwcmEmailAddress from '~common/components/ZwcmEmailAddress.vue';

const dataService = useDataService();
const now = dayjs();

const { t } = useI18n();
const { ok, cancel } = useModal();
const { alert, notify, confirm } = useGlobal();

const obsMainRef = ref(getComponentType('KwObserver'));

const props = defineProps({
  docDvCd: { type: String, required: false, default: '' },
  cstList: { type: Array, default: () => [] },
  cntrList: { type: Array, default: () => [] },
  isPrntYn: { type: String, required: false, default: '' },
  cntrCstKnm: { type: String, required: false, default: '' },
});

const fieldParams = ref({
  docDvCd: props.docDvCd,
  firstDt: now.startOf('year').format('YYYYMMDD'),
  lastDt: now.endOf('year').format('YYYYMMDD'),
  pblDt: now.format('YYYYMMDD'),
  recpMail: '',
  cstKnm: '',
  cstGubun: '',
  title: '',
  titleStr: '',
  startDt: now.startOf('year').format('YYYY년MM월DD일'),
  endDt: now.endOf('year').format('YYYY년MM월DD일'),
  cstList: [],
});

let cachedFieldParams;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchCstNm() {
  let paramList = [];

  if (isEmpty(props.cntrList)) {
    paramList = props.cstList;
    fieldParams.value.cstGubun = '2';
  } else {
    paramList = props.cntrList;
    fieldParams.value.cstGubun = '1';
  }

  paramList.forEach((row) => {
    fieldParams.value.cstList.push({
      cntrDtlNo: row.cntrNoFull,
      cntrNo: row.cntrNoFull.split('-')[0],
      cntrSn: row.cntrNoFull.split('-')[1],
    });
  });

  fieldParams.value.cstKnm = props.cntrCstKnm;
  obsMainRef.value.init();
}

async function onClickSendEmail() {
  if (props.isPrntYn === 'Y') {
    // 발행일시와 고객명을 반환한다.
    const payload = { pblcSearchSttDt: fieldParams.value.pblDt,
      custNm: fieldParams.value.cstKnm };
    ok(payload);
  } else if (props.isPrntYn === 'N') {
    const { docDvCd } = fieldParams.value;

    cachedFieldParams = cloneDeep(fieldParams.value);

    if (await obsMainRef.value.alertIfIsNotModified()) { return; }
    if (!await obsMainRef.value.validate()) { return; }

    // 리스트 체크
    if (isEmpty(fieldParams.value.cstList)) {
      alert(t('MSG_ALT_INVAILD_ORD_LIST'));
      return;
    }
    // 발송구분 체크
    if (isEmpty(docDvCd) || (docDvCd !== '1' && docDvCd !== '2' && docDvCd !== '3' && docDvCd !== '4')) {
      alert(t('MSG_ALT_INVAILD_FW_DV'));
      return;
    }

    if (!await confirm(t('MSG_ALT_WANT_SEND'))) { return; }

    await dataService.post('/sms/wells/contract/contracts/order-details/documentary-evidence-mails', cachedFieldParams);
    notify(t('MSG_ALT_EML_FW_FSH'));
  }
}

onMounted(async () => {
  fetchCstNm();
});
</script>
