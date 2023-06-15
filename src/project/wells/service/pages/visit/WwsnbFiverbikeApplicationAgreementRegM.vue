<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNB (방문관리)
 2. 프로그램 ID : WwsnbFiverbikeApplicationAgreementModM - 피버바이크 신청동의서 화면
 3. 작성자 : yeonghwa.cheon
 4. 작성일 : 2023.06.01
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 온라인 강의 구독 중 피버바이크 동의서 신청시 개인정보 제3자 제공 동의 여부를 관리하는 화면.
 ************************************************************ ****************************************
--->
<template>
  <kw-page no-header>
    <div class="scoped-application-wrap">
      <img
        src="~~@assets/images/fever_bike_back.jpg"
        alt="wells 피버바이크 신청동의서"
        class="scoped-application-bg-image"
      >
      <kw-radio
        v-model="data.agreeYn"
        val="Y"
        class="scoped-application-agree"
        :disable="isDisabled"
      />
      <kw-radio
        v-model="data.agreeYn"
        val="N"
        class="scoped-application-disagree"
        :disable="isDisabled"
      />
      <p class="scoped-application-year">
        {{ data.year }}
      </p>
      <p class="scoped-application-month">
        {{ data.month }}
      </p>
      <p class="scoped-application-day">
        {{ data.date }}
      </p>
      <kw-input
        v-model="data.custNm"
        class="scoped-application-name"
        :disable="isDisabled"
      />
      <kw-sign
        ref="refKwSign"
        :width="'302'"
        :height="'152'"
        class="scoped-application-sign"
        :need-recent-sign="false"
        :disable="isDisabled"
      />
      <div class="row justify-center scoped-application-bottom-box">
        <div class="row">
          <!-- 신청취소 -->
          <kw-btn
            :label="$t('MSG_BTN_APPL_CNCL')"
            negative
            @click="onClickCancel"
          />
          <!-- 신청완료 -->
          <kw-btn
            :label="$t('MSG_BTN_APPL_CPLT')"
            primary
            class="ml8"
            :disable="isDisabled"
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
import {
  useDataService,
  useGlobal,
} from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';

const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();

const props = defineProps({
  cntrNo: {
    type: String,
    default: 'W20225601183', // 테스트데이터? W20225562817 (있는거), W20225601183(없는거)
  },
  cntrSn: {
    type: String,
    default: '1',
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs().format('YYMMDD');
const refKwSign = ref();

const isDisabled = ref(false);
const data = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  agreeYn: '',
  custNm: '',
  signImage: '',
  year: '',
  month: '',
  date: '',
});

// const recentSignSrc = computed(() => {
//   if (isEmpty(recentSign.value)) return undefined;
//   return `data:image/png;base64,${recentSign.value}`;
// });

function onClickCancel() {
  console.log(data);
}

async function onClickComplete() {
  if (data.value.agreeYn === '') {
    notify(t('MSG_ALT_PIF_THP_AG')); // 개인정보 제3자 제공에 동의 체크해주세요!
    return;
  }

  if (isEmpty(data.value.custNm.trim())) {
    notify(t('MSG_ALT_ENTR_AG_NM')); // 동의자(본인) 이름을 입력해주세요.
    return;
  }

  if (!refKwSign.value.isSignExist) {
    notify(t('MSG_ALT_SIGN')); // 서명해주세요.
    return;
  }
  data.value.signImage = refKwSign.value.getSignData('image/jpeg');
  await dataService.post('/sms/wells/service/fiverbike-application-agreement', data.value);
  notify(t('MSG_ALT_PRGS_OK'));
}

onMounted(async () => {
  const res = (await dataService.get('/sms/wells/service/fiverbike-application-agreement', { params: data.value })).data;
  if (!res.agreeCstNm) {
    data.value.custNm = res.custNm;
    data.value.year = `${now.substring(0, 2)}`;
    data.value.month = `${now.substring(2, 4)}`;
    data.value.date = `${now.substring(4, 6)}`;
    isDisabled.value = false;
    return;
  }
  debugger;
  data.value.agreeYn = res.agreeYn;
  data.value.custNm = res.agreeCstNm;
  data.value.year = `${(res.agreeDate).substring(0, 2)}`;
  data.value.month = `${(res.agreeDate).substring(2, 4)}`;
  data.value.date = `${(res.agreeDate).substring(4, 6)}`;
  refKwSign.value.recentSignSrc = res.signImage;
  isDisabled.value = true;
});

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
    height: 1573px;
    background: #f5f5f5;
  }

  &-agree {
    position: absolute;
    top: 465px;
    left: 804px;
  }

  &-disagree {
    position: absolute;
    top: 465px;
    left: 989px;
  }

  &-wrap ::v-deep(.kw-radio .q-radio__bg) {
    background: url(node_modules/kw-lib/src/assets/images/checkbox_off.svg) no-repeat center;
  }

  &-wrap ::v-deep(.kw-radio .q-radio__inner--truthy .q-radio__bg) {
    background: url(node_modules/kw-lib/src/assets/images/checkbox_on.svg) no-repeat center;
  }

  &-year {
    position: absolute;
    top: 1036px;
    left: 408px;
    font-size: 20px;
    font-weight: bold;
  }

  &-month {
    position: absolute;
    top: 1036px;
    left: 538px;
    font-size: 20px;
    font-weight: bold;
  }

  &-day {
    position: absolute;
    top: 1036px;
    left: 644px;
    font-size: 20px;
    font-weight: bold;
  }

  &-name {
    position: absolute;
    top: 1127px;
    left: 783px;
    font-size: 20px;
    font-weight: bold;
    width: 190px;
  }

  &-sign {
    position: absolute;
    top: 1260px;
    left: 745px;
  }

  &-bottom-box {
    width: 1113px;
    background: #fff;
    padding: 0 0 20px;
    margin-top: -5px;
  }
}
</style>
