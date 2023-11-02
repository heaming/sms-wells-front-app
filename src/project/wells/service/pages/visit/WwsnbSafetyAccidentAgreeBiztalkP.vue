<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbSafetyAccidentAgreeBiztalkP - 안전사고 합의서 알림톡 발송
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2023.07.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 안전사고 합의서를 알림톡으로 발송하는 화면이다.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="lg"
  >
    <!-- 계약정보 -->
    <h3>{{ t('MSG_TXT_CNTR_INF') }}</h3>
    <kw-form
      ref="frmMainRef"
      cols="2"
    >
      <kw-form-row>
        <!-- 고객과의관계 -->
        <kw-form-item :label="$t('MSG_TXT_REL_WITH_CST')">
          <kw-select
            v-model="biztalkParams.fmlRelDvCd1"
            :options="codes.CST_REL_CD"
          />
        </kw-form-item>
        <!-- 직접입력(기타선택시) -->
        <kw-form-item :label="$t('MSG_TXT_DRT_IN')">
          <kw-input
            v-model="biztalkParams.etcCn1"
            :disable="biztalkParams.fmlRelDvCd1 !== '7'"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 합의자명 -->
        <kw-form-item :label="$t('MSG_TXT_MAAS_NM')">
          <kw-input
            v-model="biztalkParams.maasFnm"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 수신번호 -->
        <kw-form-item
          :label="$t('MSG_TXT_RECP_NO')"
          required
          colspan="2"
        >
          <zwcm-telephone-number
            v-model:tel-no1="telNos.telNo1"
            v-model:tel-no2="telNos.telNo2"
            v-model:tel-no3="telNos.telNo3"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <!-- 계좌정보 -->
    <h3>{{ t('MSG_TXT_AC_INF') }}</h3>
    <kw-form cols="2">
      <kw-form-row>
        <!-- 고객과의 관계 -->
        <kw-form-item :label="$t('MSG_TXT_REL_WITH_CST')">
          <kw-select
            v-model="biztalkParams.fmlRelDvCd2"
            :options="codes.CST_REL_CD"
          />
        </kw-form-item>
        <!-- 직접입력 -->
        <kw-form-item :label="$t('MSG_TXT_DRT_IN')">
          <kw-input
            v-model="biztalkParams.etcCn2"
            :disable="biztalkParams.fmlRelDvCd2 !== '7'"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 계좌번호 -->
        <kw-form-item :label="$t('MSG_TXT_AC_NO')">
          <kw-input
            v-model="biztalkParams.rfndAcnoEncr"
          />
        </kw-form-item>
        <!-- 은행명 -->
        <kw-form-item :label="$t('MSG_TXT_BNK_NM')">
          <kw-select
            v-model="biztalkParams.rfndBnkCd"
            :options="codes.BNK_CD_CD"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 계좌주 -->
        <kw-form-item
          :label="$t('MSG_TXT_ACOWN')"
        >
          <kw-input v-model="biztalkParams.rfndAcownNm" />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <div class="border-box pt20 mt20">
      <kw-action-top>
        <template #left>
          <h3>[Wells 안전사고 합의서]</h3>
        </template>
      </kw-action-top>
      <kw-separator
        class="kw-bc--black1"
        spaced="16px"
      />

      <!-- <div class="kw-font-body mt10">
        {{ templateCn }}
      </div> -->
      <!-- 템플리내용미리보기 -->
      <div
        v-for="(cn,idx) in templateCn"
        :key="idx"
        class="kw-font-body mt10"
      >
        {{ cn }}<br>
      </div>
    </div>

    <template #action>
      <!-- 취소 버튼 -->
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <!-- 발송 버튼 -->
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
import { useDataService, codeUtil, useGlobal, useModal } from 'kw-lib';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import { split } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const { notify } = useGlobal();
const { ok, cancel: onClickCancel } = useModal();
const props = defineProps({
  acdnRcpId: {
    type: String,
    required: true,
  },
  rcpdt: {
    type: String,
    required: true,
  },
  cstNm: {
    type: String,
    required: true,
  },
  pdNm: {
    type: String,
    required: true,
  },
  mpno: {
    type: String,
    required: true,
  },
  cntrNo: {
    type: String,
    required: true,
  },
  cntrSn: {
    type: String,
    required: true,
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref();
const codes = await codeUtil.getMultiCodes(
  'BNK_CD_CD',
  'CST_REL_CD',
);

const biztalkParams = ref({
  acdnRcpId: props.acdnRcpId,
  fmlRelDvCd1: '',
  etcCn1: '',
  fmlRelDvCd2: '',
  etcCn2: '',
  maasFnm: '',
  maasMpno: '',
  rfndAcnoEncr: '',
  rfndBnkCd: '',
  rfndAcownNm: '',
  rcpdt: props.rcpdt,
  url: 'https://wsm.kyowon.co.kr/s1/Uw5ccg', // 예시 url
  mpno: '',
  cstNm: props.cstNm, // 설치자명
  pdNm: props.pdNm, // 제품명
  cntrNo: props.cntrNo, // 계약번호
  cntrSn: props.cntrSn, // 계약일련번호
});

const telNos = ref({
  telNo1: '',
  telNo2: '',
  telNo3: '',
});
const templateCn = ref([]);
// 템플릿 내용 조회
async function getTemplateContent() {
  const res = await dataService.post('/sflex/common/common/templates/TMP_SNB_WELLS18387/previews', biztalkParams.value);
  templateCn.value = split(res.data, '\n');
}
// 발송버튼 클릭시
async function onClickSend() {
  if (!await frmMainRef.value.validate()) { return; }
  biztalkParams.value.rcpdt = (props.rcpdt).replaceAll('-', '');
  biztalkParams.value.cralLocaraTno = telNos.value.telNo1;
  biztalkParams.value.mexnoEncr = telNos.value.telNo2;
  biztalkParams.value.cralIdvTno = telNos.value.telNo3;
  biztalkParams.value.mpno = `${telNos.value.telNo1}${telNos.value.telNo2}${telNos.value.telNo3}`;
  // 저장.
  const res = await dataService.post('/sms/wells/service/safety-accidents/biztalk', biztalkParams.value);
  console.log(res.data);
  const payload = {
    successYn: 'Y',
  };
  ok(payload);
  notify(t('MSG_ALT_BIZTALK_SEND_SUCCESS')); // 알림톡이 발송되었습니다.
}

onMounted(async () => {
  await getTemplateContent();
});
</script>
