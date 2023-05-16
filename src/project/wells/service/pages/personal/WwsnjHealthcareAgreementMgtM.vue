<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNJ
 2. 프로그램 ID : WwsnjHealthcareAgreementMgtM - 고객 헬스케어 동의서
 3. 작성자 : YeongJoong Kim
 4. 작성일 : 2023.05.12
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 고객 헬스케어 동의서 내용을 입력받아 저장
 ****************************************************************************************************
--->
<template>
  <kw-page no-header>
    <div class="scoped-application-wrap">
      <img
        src="http://kiwi-m.kyowon.co.kr/KIWI-W/images/back_img_v2.png"
        alt="wells 건강케어서비스 신청서"
        class="scoped-application-bg-image"
      >
      <kw-radio
        v-model="additionalCustomerServiceAgreementStatus"
        val="Y"
        class="scoped-application-agree"
      />
      <kw-radio
        v-model="additionalCustomerServiceAgreementStatus"
        val="N"
        class="scoped-application-disagree"
      />

      <kw-radio
        v-model="personalInformationAgreementStatus"
        val="Y"
        class="scoped-application-agree2"
      />
      <kw-radio
        v-model="personalInformationAgreementStatus"
        val="N"
        class="scoped-application-disagree2"
      />

      <p class="scoped-application-date">
        {{ dateNow }}
      </p>
      <kw-input
        v-model="consenterName"
        class="scoped-application-name"
        rules="required"
      />
      <kw-sign
        ref="refKwSign"
        :width="'302'"
        :height="'152'"
        :need-recent-sign="false"
        class="scoped-application-sign"
      />
      <div class="row justify-center scoped-application-bottom-box">
        <div class="row">
          <kw-btn
            label="신청취소"
            negative
            @click="onClickCancel"
          />
          <kw-btn
            label="신청완료"
            primary
            class="ml8"
            @click="onClickComplete"
          />
        </div>
      </div>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';

const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();
const now = dayjs();

const dateNow = ref(now.format('YYYY년 MM월 DD일'));

const refKwSign = ref();

const additionalCustomerServiceAgreementStatus = ref('N');
const personalInformationAgreementStatus = ref('N');
const consenterName = ref('');

const props = defineProps({
  cntrNo: {
    type: String,
    required: true,
  },
  cntrSn: {
    type: String,
    required: true,
  },
  customerServiceCode: {
    type: String,
    default: '01', // 고정
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

let consenterNameCache = '';
function onClickCancel() {
  refKwSign.value.reset();

  additionalCustomerServiceAgreementStatus.value = '';
  personalInformationAgreementStatus.value = '';
  consenterName.value = consenterNameCache;
}

async function onClickComplete() {
  const { cntrNo, cntrSn, customerServiceCode } = props;
  const data = {
    agreePersonName: consenterName.value,
    agreementImageContent: refKwSign.value.getSignData('image/jpeg'),
    cntrNo,
    cntrSn,
    customerServiceCode,
    customerServiceUseAgreeYn: additionalCustomerServiceAgreementStatus.value,
    personalInfoAgreeYn: personalInformationAgreementStatus.value,
  };
  await dataService.put('/sms/wells/service/healthcare-agreement', data);
  notify(t('MSG_ALT_PRGS_OK'));
}

onMounted(async () => {
  const { cntrNo, cntrSn, customerServiceCode } = props;
  const { data: { agreePersonName } } = await dataService.get('/sms/wells/service/healthcare-agreement', { params: { cntrNo, cntrSn, customerServiceCode } });

  consenterNameCache = agreePersonName ?? '';
  consenterName.value = agreePersonName ?? '';
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
</script>

<style lang="scss" scoped>
.scoped-application {
  &-wrap {
    position: relative;
  }

  &-bg-image {
    position: relative;
    z-index: 0;
    width: 1113px;
    height: 1503px;
    background: #f5f5f5;
  }

  &-agree {
    position: absolute;
    top: 371px;
    left: 815px;
  }

  &-disagree {
    position: absolute;
    top: 371px;
    left: 1000px;
  }

  &-agree2 {
    position: absolute;
    top: 984px;
    left: 807px;
  }

  &-disagree2 {
    position: absolute;
    top: 984px;
    left: 1000px;
  }

  &-wrap ::v-deep(.kw-radio .q-radio__bg) {
    background: url(~@assets/images/checkbox_off.svg)  no-repeat center;
  }

  &-wrap ::v-deep(.kw-radio .q-radio__inner--truthy .q-radio__bg) {
    background: url(~@assets/images/checkbox_on.svg)  no-repeat center;
  }

  &-date {
    position: absolute;
    top: 1193px;
    left: 495px;
    font-size: 20px;
    font-weight: bold;
  }

  &-name {
    position: absolute;
    top: 1223px;
    left: 812px;
    font-size: 20px;
    font-weight: bold;
    width: 167px;
  }

  &-sign {
    position: absolute;
    top: 1297px;
    left: 744px;
  }

  &-bottom-box {
    width: 1113px;
    background: #fff;
    padding: 20px 0;
    margin-top: -5px;
  }
}
</style>
