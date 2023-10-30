<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID :WwbncBondCounselM
3. 작성자 : sunghun.choi
4. 작성일 : 2023.02.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 채권상담 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs
      v-model="selectedTab"
    >
      <kw-tab
        name="tab1"
        :label="$t('MSG_TXT_CST_LIST')"
      />
      <kw-tab
        name="tab2"
        :label="$t('MSG_TXT_CNTR_LIST')"
      />
      <kw-tab
        name="tab3"
        :label="$t('MSG_TXT_CST_SRCH')"
      />
      <kw-tab
        name="tab4"
        :label="$t('MSG_TXT_PROM_CST_SRCH')"
      />
    </kw-tabs>
    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="tab1">
        <wwbnc-bond-counsel-m-customer />
      </kw-tab-panel>
      <kw-tab-panel name="tab2">
        <wwbnc-bond-counsel-m-contract />
      </kw-tab-panel>
      <kw-tab-panel name="tab3">
        <wwbnc-bond-counsel-m-customer-search
          v-model:cellphone="params.cellphone"
          v-model:search-yn="params.searchYn"
        />
      </kw-tab-panel>
      <kw-tab-panel name="tab4">
        <zwbnc-bond-counsel-m-promise-customer />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
  <div class="call-center">
    <div class="call-center-inner">
      <div
        class="row"
        style="width: 1267px;"
      >
        <!-- rev:230802 class w420 추가 // -->
        <div class="column mr60 w420">
          <p class="call-center-text">
            {{ searchParams.prtnrNm }}({{ searchParams.prtnrNo }})
          </p>
          <!-- rev:230802 추가 -->
          <div class="q-space" />
          <!-- // rev:230802 추가 -->
          <kw-option-group
            v-model="searchParams.tno"
            type="radio"
            :options="[tnoInfo.tno1, tnoInfo.tno2, tnoInfo.tno3]"
            class="call-center-radio"
          />
        </div>
        <!-- rev:230802 추가 -->
        <div class="q-space" />
        <!-- // rev:230802 추가 -->
        <!-- rev:230802 class w98추가 // -->
        <div
          class="column mr60 w98"
        >
          <p class="call-center-text">
            {{ baseParams.sysCALL_sCTI_INFO1 }}
          </p>
          <!-- rev:230802 추가 -->
          <div class="q-space" />
          <!-- // rev:230802 추가 -->
          <p class="call-center-text mt24">
            {{ searchParams.inputPhone }}
          </p>
        </div>
        <!-- rev:230802 추가 -->
        <div class="q-space" />
        <!-- // rev:230802 추가 -->
        <!-- rev:230802 class w112 추가 // -->
        <div
          class="column mr60 w112"
        >
          <p class="call-center-text">
            {{ baseParams.sysCALLSetMsg }}
          </p>
          <!-- rev:230802 추가 -->
          <div class="q-space" />
          <!-- // rev:230802 추가 -->
          <p class="call-center-text mt24">
            {{ $t('MSG_TXT_PASG_HH') }} {{ timer.timeStr }}
          </p>
        </div>

        <div class="column relative-position">
          <div class="row justify-end">
            <!-- 비활성화 시 kw-btn 안에 disable 추가 -->
            <kw-btn
              :label="$t('MSG_TXT_EDUC')"
              dense
              class="call-center-small-btn"
              :disable="restTypeYn === 1"
              @click="onClickSysCALLNotReadyCall(1)"
            />
            <kw-btn
              :label="$t('MSG_TXT_BIZ_NTC')"
              dense
              class="call-center-small-btn ml4"
              :disable="restTypeYn === 1"
              @click="onClickSysCALLNotReadyCall(5)"
            />
            <kw-btn
              :label="$t('MSG_TXT_METG')"
              dense
              class="call-center-small-btn ml4"
              :disable="restTypeYn === 1"
              @click="onClickSysCALLNotReadyCall(3)"
            />
            <kw-btn
              :label="$t('MSG_TXT_MTR_SEA2')"
              dense
              class="call-center-small-btn ml4"
              :disable="restTypeYn === 1"
              @click="onClickSysCALLNotReadyCall(6)"
            />
            <kw-btn
              :label="$t('MSG_TXT_REST2')"
              dense
              class="call-center-small-btn ml4"
              :disable="restTypeYn === 1"
              @click="onClickSysCALLNotReadyCall(4)"
            />
            <kw-btn
              :label="$t('MSG_TXT_MEL')"
              dense
              class="call-center-small-btn ml4"
              :disable="restTypeYn === 1"
              @click="onClickSysCALLNotReadyCall(2)"
            />
            <!-- // 비활성화 시 kw-btn 안에 disable 추가 -->
          </div>
          <div class="row mt8">
            <!-- 비활성화 시 kw-btn 안에 disable 추가 -->
            <kw-btn
              :label="$t('MSG_TXT_CUT')"
              icon="cellphone_off"
              dense
              class="call-center-icon-btn"
              :disable="cutYn === 1"
              @click="onClickButtonChange('cut')"
            />
            <kw-separator
              spaced
              vertical
              inset
              class="mx20 my3"
            />
            <kw-btn
              :label="$t('MSG_TXT_PENDING')"
              icon="pause"
              dense
              class="call-center-icon-btn"
              :disable="standByYn === 1"
              @click="onClickButtonChange('standBy')"
            />
            <kw-separator
              spaced
              vertical
              inset
              class="mx20 my3"
            />
            <kw-btn
              :label="$t('MSG_TXT_REST2')"
              icon="break"
              dense
              class="call-center-icon-btn"
              :disable="restYn === 1"
              @click="onClickButtonChange('rest')"
            />
            <kw-separator
              spaced
              vertical
              inset
              class="mx20 my3"
            />
            <kw-btn
              :label="$t('MSG_TXT_CALL')"
              icon="cellphone"
              dense
              class="call-center-icon-btn"
              :disable="crncyYn === 1"
              @click="onClickPhoneYn('Y')"
            />
            <kw-separator
              spaced
              vertical
              inset
              class="mx20 my3"
            />
            <kw-btn
              :label="$t('MSG_TIT_HOLDON')"
              icon="holding"
              dense
              class="call-center-icon-btn"
              :disable="holdingYn === 1"
              @click="onClickButtonChange('holding')"
            />
            <kw-separator
              spaced
              vertical
              inset
              class="mx20 my3"
            />
            <kw-btn
              :label="$t('MSG_TXT_RSTRCT')"
              icon="release"
              dense
              class="call-center-icon-btn call-center-icon-btn--active"
              :disable="releaseHoldingYn === 1"
              @click="onClickButtonChange('releaseHolding')"
            />
            <!-- // 비활성화 시 kw-btn 안에 disable 추가 -->
          </div>
          <!--  [걸기]버튼 클릭 시 팝업 -->
          <template v-if="searchParams.phoneYn === 'Y'">
            <div class="outgoing-call-box">
              <kw-btn
                icon="cellphone"
                borderless
              />
              <kw-input
                v-model="searchParams.phone"
                :maxlength="11"
                regex="num"
                class="ml8 w140"
                dense
              />
              <kw-btn
                :label="$t('MSG_TXT_CALL')"
                class="ml8 kw-btn--bg"
                dense
                secondary
                @click="onClickSysCALLMakeCall(searchParams.phone)"
              />
              <kw-btn
                class="ml12"
                icon="close"
                borderless
                @click="onClickPhoneYn('N')"
              />
            </div>
          </template>
          <!-- // [걸기]버튼 클릭 시 팝업 -->
        </div>
      </div>
      <div class="row">
        <kw-btn
          outlined
          dense
          :label="$t('MSG_TXT_CALLBK')"
          border-color="bg-white"
          class="call-center-btn"
          @click="onClickBncCallBack"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { modal, useDataService, cti, alert } from 'kw-lib';
import dayjs from 'dayjs';

import ZwbncBondCounselMPromiseCustomer from '~sms-common/bond/pages/consultation/ZwbncBondCounselMPromiseCustomer.vue';
import WwbncBondCounselMCustomerSearch from './WwbncBondCounselMCustomerSearch.vue';
import WwbncBondCounselMCustomer from './WwbncBondCounselMCustomer.vue';
import WwbncBondCounselMContract from './WwbncBondCounselMContract.vue';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectedTab = ref('tab1');
const params = ref({});
const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();

const searchParams = ref({
  callbackData0101: '4833',
  callbackData0102: '4886',
  callbackData0103: '4939',
  queueId: '4833',
  prtnrNo: userInfo.employeeIDNumber,
  prtnrNm: userInfo.userName,
  ogTpCd: userInfo.ogTpCd,
  phone: '',
  phoneYn: 'N',
  inputPhone: '',

  sFlagC1: false,
  inlnNo: '',
  tno: '',
});

//= ===========================================================================
//* ** 전역 변수 영역 시작(prefix 프로그램ID) ***
//= ===========================================================================
const baseParams = ref({
  sysCALL_CTI_SERVER_IP: '', // IPCC 서버 IP 01
  sysCALL_CTI_SERVER_PORT: '', // IPCC 서버 PORT
  sysCALL_CTI_SERVER_IP_SAL: '', // IPCC 서버 IP 02

  // sysCALL_sStation: '5<%=S_KFPBID%>', // 내선번호(관리 되어야 함)) -> 내선번호 = 5 + 내선번호4자리, 인입큐번호 = 7 + 내선번호4자리
  // sysCALL_sAgent: '<%=S_KFUSID%>', // 상담원ID(관리 되어야 함))

  // 테스트용
  sysCALL_sStation: '54833', //= ==========반드시 주석 달아야 함
  // if("<%=S_KFUSID%>"  == "37529") {
  sysCALL_sAgent: 'k4833', //= ==========반드시 주석 달아야
  // }
  sysCALL_sPassword: '', // 비밀번호
  sysCALL_sCallStTime: '', // 통화시작시간
  sysCALL_sCallEdTime: '', // 통화종료시간
  sysCALL_sCTI_CID_NO: '', // 발신번호
  sysCALL_sCTI_INFO1: '', // 전환/3자 통화시 넘길 데이터1 (고객ID)
  sysCALL_sCTI_INFO2: '', // 전환/3자 통화시 넘길 데이터2 (상담중 넘길경우 상담번호)
  sysCALL_sInitFg: 'Y', // 로그인 후 초기화 여부
  // sysCALL_s_state
  // 1: 전화 걸기시도 상태
  // 2: 전화 연결 상태(전화나간경우)
  // 3: 전화 연결 상태(전화들어온경우)
  // 4: 전화 받기시도 상태
  // 5: 보류 시도 상태
  // 6: 보류 해제시도 상태
  // 7: 전환 시도 상태
  // 8: 전환 연결된 상태
  // 9: 삼자 시도 상태
  // 10:삼자 연결된 상태
  // 11:내가 전화를 끊은경우:eventerror 발생함으로 내가전화를 끊은 경우에는 에러무시함
  sysCALL_s_state: '', // 이전 콜 상태
  sysCALL_cur_state: '', // 현재 콜 상태
  // 현재 선택된 전화번호
  // - 2022.06 콜시스템 교체 시 전화번호 3개 중 1개를 선택하는 것으로 변경이 되어서
  //   해당 전화번호를 소프트폰에 전달하기 위해 추가함
  // - 2022.06.23 정찬영
  sysCALL_tel_no1: '',
  sysCALL_tel_no2: '',
  sysCALL_tel_no3: '',
  sysCALL_idx: '1', // 현재 선택된 전화번호 인덱스 - sys1110.jsp 가 전화 올때마다 리셋되서 수정함

  sReasonCd_IPCC: 0,
  sysCALLSetMsg: '',

  refId: '', // CALL_REF_ID

  sys1100_startdate: '', // 최초 인입날짜
  sys1100_starttime: '', // 최초 인입시간
  sys1100_sCtype: '', // 콜타입

  cnslSaveStat: 'N', // 삼담저장상태

  //----------------------------------------------------------------------------
  // 전역변수 선언 : 고객 데이터
  //----------------------------------------------------------------------------
  sys1100_sLCGUBN: '', // 업무구분(L10:Wells-할부,E10:빨간펜,E30:전집,E31:창의융합,E32:창의융합(단독),E33:화상)
  sys1100_sLCGOOD: '', // 빨간펜 상품구분(S:스마트빨간펜,K:키즈/누리 스마트빨간펜,R:스페셜스빨,L:스마트라이브러리,Q:스마트라이브러리 프리패스,P:스마트화상,J:스페셜화상,A:AI수학(프리패스),I:AI화상,M:도요새영어,C:도요새중국어)
  sys1100_sLCYEAR: '', // 계약번호1
  sys1100_sLCCODE: '', // 계약번호2
  sys1100_sLCSEQN: '', // 계약번호3
  sys1100_sLCKKEY: '', // 교원키

  sys1100_sKWSKEY: '', // 세이프키
});

const cutYn = ref(1);// 끊기
const standByYn = ref(0);// 대기
const restYn = ref(0);// 휴식
const restTypeYn = ref(1);// 휴식 유형
const crncyYn = ref(0);// 걸기
const holdingYn = ref(0);// 보류
const releaseHoldingYn = ref(0);// 해제

const tnoInfo = ref({});

const timer = ref({
  timeStr: '00:00:00',
  hour: 0,
  min: 0,
  sec: 0,
  timer: '',
  time: 0,
});

const dataParams = ref({
  ext: '',
});

function init() {
  timer.value.timeStr = '00:00:00';
  timer.value.time = 0;
}

function timerStop() {
  clearInterval(timer.value.timer);
  init();
}

function timerStart() {
  if (timer.value.time === 0) {
    init();
  }

  timer.value.timer = setInterval(() => {
    timer.value.time += 1;

    timer.value.min = Math.floor(timer.value.time / 60);
    timer.value.hour = Math.floor(timer.value.min / 60);
    timer.value.sec = timer.value.time % 60;
    timer.value.min %= 60;

    let th = timer.value.hour;
    let tm = timer.value.min;
    let ts = timer.value.sec;
    if (th < 10) {
      th = `0${timer.value.hour}`;
    }
    if (tm < 10) {
      tm = `0${timer.value.min}`;
    }
    if (ts < 10) {
      ts = `0${timer.value.sec}`;
    }

    timer.value.timeStr = `${th}:${tm}:${ts}`;
  }, 1000);
}

function onClickPhoneYn(type) {
  searchParams.value.phone = searchParams.value.tno;
  searchParams.value.phoneYn = type;
}

// TODO: 콜백 조회 팝업
async function onClickBncCallBack() {
  const { result, payload } = await modal({
    component: 'ZwbncCallbackP',
    componentProps: {
      callbackData0101: searchParams.value.callbackData0101,
      callbackData0102: searchParams.value.callbackData0102,
      callbackData0103: searchParams.value.callbackData0103,
      queueId: searchParams.value.queueId,
    },
  });

  if (result) {
    selectedTab.value = 'tab3';
    params.value.cellphone = payload.telNo;
    params.value.searchYn = 'Y';
  }
}

function sysCALLUserState(state) {
  baseParams.value.sysCALL_s_state = state;
  baseParams.value.sysCALL_cur_state = state;
}

/**
 * 전화받기 응답을 한 경우
 */
function sysCALLOnSuccessCall() {
  sysCALLUserState('3');
  // cti.top.frmTop.sys1110_changeToWork();
  // cti.top.sys1100_onAnswer_Success();

  cutYn.value = 0; // 끊기
  standByYn.value = 1; // 대기
  restYn.value = 1; // 휴식
  restTypeYn.value = 1; // 휴식 유형
  crncyYn.value = 1; // 걸기
  holdingYn.value = 0; // 보류
  releaseHoldingYn.value = 1; // 해제
}

/**
 * 상태 변경 - 후처리 상태 (afterWork())
 */
function sysCALLAfterWork() {
  cti.NXApi.command({
    cmd: 'setfeatureagentstatus',
    mode: cti.NXConst.AFTERCALLWORK,
    id: baseParams.value.sysCALL_sAgent,
    part: '401',
    group: '400',
    reasoncode: 0,
    workmode: 0,
  }).then((response) => {
    if (response.result !== 1) {
      // alert(JSON.stringify(response));
    }
  });
}

// server close
function ctiClose() {
  cti.NXApi.close().then((response) => {
    if (response.result !== 1) {
      // alert(JSON.stringify(response));
    } else {
      // eslint-disable-next-line no-use-before-define
      startClient();
      // eslint-disable-next-line no-use-before-define
      ctiConnect();
    }
  });
}

/**
 * 콜/녹취장비 로그아웃 함수
 */
function onClickSysCALLOnLogoutCall() {
  cti.NXApi.command({
    cmd: 'setfeatureagentstatus',
    mode: cti.NXConst.LOGOFF,
    id: baseParams.value.sysCALL_sAgent,
    part: '401',
    group: '400',
    reasoncode: 0,
    workmode: 1,
  }).then((response) => {
    if (response.result !== 1) {
      // alert(JSON.stringify(response));
      return;
    }
    ctiClose();
  });
}

/**
 * 전화받기 화면을 보여주는 함수
 */
function sysCALLShowRingPage(bVal) {
  const param = {};
  param.open_yn = bVal;
  param.cti_cid_no = baseParams.value.sysCALL_sCTI_CID_NO; // 발신번호
  param.cti_info1 = baseParams.value.sysCALL_sCTI_INFO1; // 전환용 정보1
  param.cti_info2 = baseParams.value.sysCALL_sCTI_INFO2; // 전환용 정보2

  // cti.top.sys1100_showRingPage(param);
}

/**
 * 다른 jsp에서 sysCALL_sInitFg 변수값 세팅
 */
function sysCALLSetInitFg(initFg) {
  baseParams.value.sysCALL_sInitFg = initFg;
}

/**
 * 장비로그인 실패시 호출되는 함수
 * 실패메시지 출력후, 윈도우를 종료시킨다.
 */
function sysCALLOnLoginCallFail() {
  /* let msg = '';
  msg += ('CTI서버  로그인에 실패 하였습니다.');
  alert(msg); */

  // cti.top.sys1100_setLogoutTran(); // 로그인 실패시 종료한다.
  onClickSysCALLOnLogoutCall();
}

function sysCALLSetLoginCall2() {
  cti.NXApi.command({
    cmd: 'setfeatureagentstatus',
    mode: cti.NXConst.LOGOFF,
    id: baseParams.value.sysCALL_sAgent,
    part: '401',
    group: '400',
    reasoncode: 100,
    workmode: 1,
  }).then((response) => {
    if (response.result !== 1) {
      return false;
    }
    setTimeout(() => { sysCALLOnLoginCallFail(); }, 300);
  });
}
/**
 * 콜/녹취장비 로그인 함수
 */
function sysCALLSetLoginCall() {
  cti.NXApi.command({
    cmd: 'setfeatureagentstatus',
    mode: cti.NXConst.LOGON,
    id: baseParams.value.sysCALL_sAgent,
    part: '401',
    group: '400',
    reasoncode: 0,
    workmode: 1,
  }).then((response) => {
    if (response.result !== 1) {
      if (response.result === 2025) {
        sysCALLSetLoginCall2();
      } else if (response.result === 5004) {
        // alert(JSON.stringify(response));
      } else {
        // alert(JSON.stringify(response));
      }
    }

    //
  });
}

/**
 * CTIServer Connect
 */
function ctiConnect() {
  const txtDn = baseParams.value.sysCALL_sStation;
  const txtLink = '';
  let iReturn = -1;
  cti.NXApi.connect({
    url: [baseParams.value.sysCALL_CTI_SERVER_IP, baseParams.value.sysCALL_CTI_SERVER_IP_SAL],
    linkType: txtLink,
    defaultPbx: 0,
    appName: '',
    useLog: false, // log 사용시 true
    // cubeCharset: "euc-kr",
    loglevel: 3, // loglevel 2 아래 -> heartbeat 패킷 보이지않음
    deviceNumber: txtDn,
    watchInterval: 500,
    maxIntervalCount: 10,
  }).then((response) => {
    if (response.result !== 1) {
      if (response.result === 2025) {
        // logOn();
        iReturn = 1;
        return;
      }
      // alert(JSON.stringify(response));
      return;
    }

    // 자동로그인
    // logOn();
    setTimeout(() => { sysCALLSetLoginCall(); }, 1000);
  });
  return iReturn;
}

/**
 * 상태변경 - 대기상태
 */
function onClickSysCALLReadyCall() {
  cti.NXApi.command({
    cmd: 'setfeatureagentstatus',
    mode: cti.NXConst.READY,
    id: baseParams.value.sysCALL_sAgent,
    reasoncode: 0,
  }).then((response) => {
    if (response.result !== 1) {
      // alert(JSON.stringify(response));
      return false;
    }
    baseParams.value.refId = '';
  });
  return true;
}

/**
 * 상태변경 - 휴식상태
 */
function onClickSysCALLNotReadyCall(sReasonCd) {
  cutYn.value = 1; // 끊기
  standByYn.value = 0; // 대기
  restYn.value = 0; // 휴식
  restTypeYn.value = 0; // 휴식 유형
  crncyYn.value = 0; // 걸기
  holdingYn.value = 1; // 보류
  releaseHoldingYn.value = 1; // 해제

  if (sReasonCd === '1') baseParams.value.sReasonCd_IPCC = '1'; // 교육
  else if (sReasonCd === '2') baseParams.value.sReasonCd_IPCC = '13'; // 식사
  else if (sReasonCd === '3') baseParams.value.sReasonCd_IPCC = '2'; // 미팅
  else if (sReasonCd === '4') baseParams.value.sReasonCd_IPCC = '17'; // 휴식
  else if (sReasonCd === '5') baseParams.value.sReasonCd_IPCC = '19'; // 업무공지
  else if (sReasonCd === '6') baseParams.value.sReasonCd_IPCC = '20'; // 자료검색

  cti.NXApi.command({
    cmd: 'setfeatureagentstatus',
    mode: cti.NXConst.NOTREADY,
    id: baseParams.value.sysCALL_sAgent,
    part: '401',
    group: '400',
    reasoncode: sReasonCd,
    workmode: 1,
  }).then((response) => {
    if (response.result !== 1) {
      return false;
    }
  });

  return true;
}

/**
 * 전체 불가능
 */
function sys1110DisableAll() {
  cutYn.value = 0; // 끊기
  standByYn.value = 1; // 대기
  restYn.value = 1; // 휴식
  restTypeYn.value = 1; // 휴식 유형
  crncyYn.value = 1; // 걸기
  holdingYn.value = 0; // 보류
  releaseHoldingYn.value = 1; // 해제
}

/**
 * 상태변경 - 보류상태 : 멜로디 ON
 */
function onClickSysCALLHoldCall() {
  cti.NXApi.command({
    cmd: 'holdcall',
  }).then((response) => {
    if (response.result !== 1) {
      // alert(JSON.stringify(response));
      return false;
    }
  });

  return true;
}

/**
 * 상태변경 - 해제상태 : 멜로디 OFF
 */
function onClickSysCALLRetriveCall() {
  cti.NXApi.command({
    cmd: 'retrievecall',
  }).then((response) => {
    if (response.result !== 1) {
      // alert(JSON.stringify(response));
      return false;
    }
  });
  return true;
}
/**
 * 현재 연결중인 호에서 상담원의 연결만 종료함
 */
function sysCALLClearConnection() {
  searchParams.value.sFlagC1 = false;
  sysCALLUserState('11'); // 내가 전화 끊음

  cti.NXApi.command({
    cmd: 'clearconnection',
  }).then((response) => {
    if (response.result !== 1) {
      // alert(JSON.stringify(response));
    }
  });
}

// 버튼 활성화
function onClickButtonChange(flag) {
  if (flag === 'cut') {
    cutYn.value = 1; // 끊기
    standByYn.value = 0; // 대기
    restYn.value = 0; // 휴식
    restTypeYn.value = 1; // 휴식 유형
    crncyYn.value = 0; // 걸기
    holdingYn.value = 1; // 보류
    releaseHoldingYn.value = 1; // 해제
    sysCALLClearConnection();
  } else if (flag === 'standBy') {
    cutYn.value = 1; // 끊기
    standByYn.value = 1; // 대기
    restYn.value = 0; // 휴식
    restTypeYn.value = 1; // 휴식 유형
    crncyYn.value = 1; // 걸기
    holdingYn.value = 1; // 보류
    releaseHoldingYn.value = 1; // 해제
    onClickSysCALLReadyCall();
  } else if (flag === 'rest') {
    cutYn.value = 1; // 끊기
    standByYn.value = 1; // 대기
    restYn.value = 0; // 휴식
    restTypeYn.value = 0; // 휴식 유형
    crncyYn.value = 1; // 걸기
    holdingYn.value = 1; // 보류
    releaseHoldingYn.value = 1; // 해제
  } else if (flag === 'crncy') {
    cutYn.value = 0; // 끊기
    standByYn.value = 1; // 대기
    restYn.value = 1; // 휴식
    restTypeYn.value = 1; // 휴식 유형
    crncyYn.value = 1; // 걸기
    holdingYn.value = 0; // 보류
    releaseHoldingYn.value = 0; // 해제
  } else if (flag === 'holding') {
    cutYn.value = 1; // 끊기
    standByYn.value = 1; // 대기
    restYn.value = 1; // 휴식
    restTypeYn.value = 1; // 휴식 유형
    crncyYn.value = 1; // 걸기
    holdingYn.value = 1; // 보류
    releaseHoldingYn.value = 0; // 해제
    onClickSysCALLHoldCall();
  } else if (flag === 'releaseHolding') {
    cutYn.value = 0; // 끊기
    standByYn.value = 1; // 대기
    restYn.value = 1; // 휴식
    restTypeYn.value = 1; // 휴식 유형
    crncyYn.value = 1; // 걸기
    holdingYn.value = 0; // 보류
    releaseHoldingYn.value = 1; // 해제
    onClickSysCALLRetriveCall();
  }
}

/**
 * 전화 걸기
 */
function onClickSysCALLMakeCall(sTelNo) {
  if (searchParams.value.phoneYn === 'Y' && searchParams.value.phone === '') {
    alert(t('MSG_ALT_TEL_NO_IN2'));
    return;
  }

  onClickButtonChange('crncy');

  searchParams.value.phoneYn = 'N';
  searchParams.value.inputPhone = searchParams.value.phone;
  sys1110DisableAll();
  // cti.top.frmTop.sys1110_enableClearCall();
  // cti.top.frmTop.sys1110_enableHoldCall(); // 걸기시 보류 가능하도록 : 이민영과장 요청 - 2007.11.30
  // cti.top.frmTop.sys1110_enableTransferCall(); // 걸기시 전환 가능하도록 : 이민영과장 요청 - 2007.11.30
  // cti.top.frmTop.sys1110_cancel_timer(); // 타이머 정지
  timerStop(); // 통화 경과시간 타이머 stop

  let dialNo = sTelNo.replace(/[^0-9]/g, '');
  // if (dialNo.length > 4) {
  //  dialNo = dialNo;
  // }

  baseParams.value.sysCALL_sCTI_CID_NO = dialNo; // 하단 발신번호를 보여주기 위하여 추가함 - 정찬영 - 2022.08.18 정찬영
  dialNo = baseParams.value.sysCALL_tel_no3 + dialNo;
  // called - 발신 시 번호(메인1/추가2/추가3) + 수신전화번호 로 발신
  //  -> 메인1(4800), 수신번호(01012341234) 인 경우
  //  -> 480001012341234 로 하게되면 발신번호 02-2198-4800으로 01012341234가 수신하게됨
  cti.NXApi.command({
    cmd: 'makecall',
    called: dialNo,
    uui: '',
    uei: '',
    ci: '',
  }).then((response) => {
    if (response.result !== 1) {
      // alert(JSON.stringify(response));
      return false;
    }
    baseParams.value.refId = '';
  });

  return true;
}

/**
 * 전화 받기
 */
function sysCALLAnswerCall() {
  sysCALLUserState('4');
  console.log('answer  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  cti.NXApi.command({
    cmd: 'answercall',
  }).then((response) => {
    console.log(`answercall result:${JSON.stringify(response)}`);
    if (response.result !== 1) {
      alert(JSON.stringify(response));
    }
  });
}

// TODO: 전화받기 팝업
async function onClickPhoneCallReceive(tNo) {
  const { result } = await modal({
    component: 'ZwbncCounselPhoneCallReceiveP',
    componentProps: { tNo },
  });

  if (result) {
    sysCALLAnswerCall();
  }
}

/**
 * 전역변수 값 초기화(전화받기에서만 초기화)
 */
function sys1100SetInitValue() {
  baseParams.sys1100_sLCGUBN = ''; // 업무구분(L10:Wells-할부,E10:빨간펜,E30:전집,E31:창의융합,E32:창의융합(단독),E33:화상)
  baseParams.sys1100_sLCGOOD = ''; // 빨간펜 상품구분(S:스마트빨간펜,K:키즈/누리 스마트빨간펜,R:스페셜스빨,L:스마트라이브러리,Q:스마트라이브러리 프리패스,P:스마트화상,J:스페셜화상,A:AI수학(프리패스),I:AI화상,M:도요새영어,C:도요새중국어)
  baseParams.sys1100_sLCYEAR = ''; // 계약번호1
  baseParams.sys1100_sLCCODE = ''; // 계약번호2
  baseParams.sys1100_sLCSEQN = ''; // 계약번호3
  baseParams.sys1100_sLCKKEY = ''; // 교원키
  baseParams.sys1100_sKWSKEY = '';

  // frmTop.sys1110_setTelInfo(frmCall.sysCALL_idx);
}

/**
 * 녹취ID 조회
 */
async function recId() {
  searchParams.value.inlnNo = baseParams.value.sysCALL_sStation;
  const res = await dataService.get('/sms/wells/bond/bond-counsel/rec-id', { params: searchParams.value });
  if (res.data === 90 || res.data === 91 || res.data === 92 || res.data === 99) {
    alert(t('MSG_ALT_RDG_KEY_VAL_INQR'));
  } else {
    baseParams.value.refId = res.data; // 녹취키값
  }
}

async function startClient() {
  // const txtDn = baseParams.value.sysCALL_sStation;
  // const txtLink = 4;
  cti.NXApi.setEvent((json) => {
    baseParams.value.sysCALL_cur_state = json.event;
    switch (json.event) {
      case cti.NXEvent.LOGGEDON: // 로그인 되었을때
        // 대기, 휴식, 걸기 가능한 상태로 설정
        sysCALLSetInitFg('N');
        // cti.top.frmTop.sys1110_enableReadyCall();
        // cti.top.frmTop.sys1110_enableRestCall();
        // cti.top.frmTop.sys1110_enableMakeCall();
        standByYn.value = 0; // 대기
        restYn.value = 0; // 휴식
        crncyYn.value = 0; // 걸기
        sys1100SetInitValue();
        // top.sys1100_resize('TODO_CLOSE');

        // 상담원이 로그인하였을 때 발생하는 이벤트
        // cti.top.frmBottom.sys1130_setMsg('OnEventLogin 로그인 중');
        baseParams.value.sysCALLSetMsg = 'OnEventLogin 로그인 중';
        break;
      case cti.NXEvent.LOGGEDOFF:
        // 상담원이 로그 아웃 하였을 때 발생하는 이벤트
        // cti.top.frmBottom.sys1130_setMsg('OnEventLogout CTI 로그인 필요');
        baseParams.value.sysCALLSetMsg = 'OnEventLogout CTI 로그인 필요';
        break;
      case cti.NXEvent.READY:
        // 상담원이 대기하였을 때 발생하는 이벤트
        // cti.top.frmBottom.sys1130_setMsg('OnEventReady 대기 중');
        baseParams.value.sysCALLSetMsg = 'OnEventReady 대기 중';

        // top.frmTop.sys1110_changeToReady(); // 무한루프라서 이렇게하면 안됨
        // cti.top.frmTop.sys1110_disableClearCall(); // 끊기 불가능
        // cti.top.frmTop.sys1110_disableReadyCall(); // 대기 불가능
        // cti.top.frmTop.sys1110_enableRestCall(); // 휴식 가능
        // cti.top.frmTop.sys1110_disableMakeCall(); // 걸기 불가능
        // cti.top.frmTop.sys1110_disableHoldCall(); // 보류 불가능
        // cti.top.frmTop.sys1110_disableRetryCall(); // 해제 불가능
        // cti.top.frmTop.sys1110_disableTransferCall(); // 전환 불가능

        cutYn.value = 1; // 끊기
        standByYn.value = 1; // 대기
        restYn.value = 0; // 휴식
        restTypeYn.value = 1; // 휴식 유형
        crncyYn.value = 1; // 걸기
        holdingYn.value = 1; // 보류
        releaseHoldingYn.value = 1; // 해제

        break;
      case cti.NXEvent.NOTREADY:
        // 상담원이 휴식상태로 변경되었을 때 발생하는 이벤트
        // cti.top.frmBottom.sys1130_setMsg('OnEventNotReady 휴식 중');
        baseParams.value.sysCALLSetMsg = 'OnEventNotReady 휴식 중';
        break;
      case cti.NXEvent.AFTERCALLWORK:
        timerStop();
        // 상담원이 후처리 상태로 들어갔을 때 발생하는 이벤트
        // cti.top.frmBottom.sys1130_setMsg('OnEventACW 후처리 중');
        baseParams.value.sysCALLSetMsg = 'OnEventACW 후처리 중';

        cutYn.value = 1; // 끊기
        standByYn.value = 0; // 대기
        restYn.value = 0; // 휴식
        restTypeYn.value = 1; // 휴식 유형
        crncyYn.value = 0; // 걸기
        holdingYn.value = 1; // 보류
        releaseHoldingYn.value = 1; // 해제
        // cti.top.frmTop.sys1110_changeToAfterwork();

        break;
      case cti.NXEvent.CONFERENCED:

        break;
      case cti.NXEvent.DELIVERED: // 4
        // 상담원 전화기가 Busy 상태가 될 때 발생하는 이벤트 (Delivered Event 발생 시 함께 발생됨)
        // cti.top.frmBottom.sys1130_setMsg('OnEventBusy Busy');

        baseParams.value.sysCALLSetMsg = 'OnEventBusy Busy';

        if (json.ctype === 11) {
          // INBOUND
          // 전화기에 벨이 울릴 시(콜이 도착했을 때) 발생되는 이벤트(Inbound)
          // cti.top.frmBottom.sys1130_setMsg('DELIVERED 벨 울림');
          baseParams.value.sysCALLSetMsg = 'DELIVERED 벨 울림';
          try {
            const ani = json.otherparty.trim(); // ani - 고객전화번호

            baseParams.value.sysCALL_sCTI_CID_NO = ani;
            // 전환 정보를 초기화 함 : 인바운드
            baseParams.value.sysCALL_sCTI_INFO1 = 'INBOUND';
            baseParams.value.sysCALL_sCTI_INFO2 = 'INBOUND';
            // baseParams.value.refId = json.callrefid; // 녹취 키
            baseParams.value.sys1100_sCtype = 'I';

            baseParams.value.sys1100_startdate = now.format('YYYYMMDDHHmmss').substring(0, 8); // 최초인입일자
            baseParams.value.sys1100_starttime = now.format('YYYYMMDDHHmmss').substring(8, 14); // 최초인입시간

            sysCALLShowRingPage(true);

            const anynum = baseParams.value.sysCALL_sCTI_CID_NO;
            // cti.top.frmBottom.sys1130_setAnynum(anynum); // 하단 전화번호
            searchParams.value.inputPhone = anynum;
            onClickPhoneCallReceive(anynum);
          } catch (e) {
            alert(t('MSG_ALT_TEL_PRB_OC', [e]));
          }
        } else if (json.ctype === 22) {
          // OUTBOUND
          // 발신 통화 시 상대편 전화기에 벨이 울릴 경우 발생되는 이벤트
          // cti.top.frmBottom.sys1130_setMsg('OnEventDeliveredOut 상대편 벨 울림');
          baseParams.value.sysCALLSetMsg = 'OnEventDeliveredOut 상대편 벨 울림';
          baseParams.value.sysCALL_sCTI_INFO1 = 'OUTBOUND';
          baseParams.value.sysCALL_sCTI_INFO2 = 'OUTBOUND'; // else if(cidData.charAt(0)=="O") end
          // baseParams.value.refId = json.callrefid;// 녹취 RefID
          baseParams.value.sys1100_sCtype = 'O';

          const anynum = baseParams.value.sysCALL_sCTI_CID_NO;
          // cti.top.frmBottom.sys1130_setAnynum(anynum); // 하단 전화번호
          searchParams.value.inputPhone = anynum;
        } else if (json.ctype === 3) {
          // INTERNAL 내선통화
        } else if (json.ctype === 4) {
          // CONSULT
        } else if (json.ctype === 5) {
          // TRANSFER
        } else if (json.ctype === 6) {
          // CONFERENCE
        }

        break;

      case cti.NXEvent.CONNECTIONCLEARED:

        // 현재 연결되어 있는 Connection이 종료되었을 때 발생되는 이벤트
        if (json.monitorparty === json.otherparty) { // 내콜이 종료 되었을때
          // cti.top.frmBottom.sys1130_setMsg('OnEventCallCleared 통화 종료');
          baseParams.value.sysCALLSetMsg = 'OnEventCallCleared 통화 종료';
          sysCALLShowRingPage(false);
          timerStop(); // 통화 경과시간 타이머 stop
          timerStart(); // 통화 경과시간 타이머 start
          // cti.top.frmTop.sys1110_cancel_timer(); // 경과시간 타이머 stop
          // cti.top.frmTop.sys1110_Afterwork_timer(); // 경과시간 타이머 start
          // cti.top.frmTop.sys1110_changeToAfterwork(); // 상단 전화버튼처리

          cutYn.value = 1; // 끊기
          standByYn.value = 0; // 대기
          restYn.value = 0; // 휴식
          restTypeYn.value = 1; // 휴식 유형
          crncyYn.value = 0; // 걸기
          holdingYn.value = 1; // 보류
          releaseHoldingYn.value = 1; // 해제
          sysCALLAfterWork();
        }

        break;
      case cti.NXEvent.ESTABLISHED:

        // 전화기에 울리던 콜이 Connection이 연결되었을 때 발생되는 이벤트
        // cti.top.frmBottom.sys1130_setMsg('OnEventEstablished 통화 중');
        baseParams.value.sysCALLSetMsg = 'OnEventEstablished 통화 중';

        if (baseParams.value.sysCALL_s_state === '4') { // 전화받기시도 상태인 경우
          sysCALLOnSuccessCall();
        } else {
          sysCALLUserState('2'); // 전화 걸기시 성공상태로 설정
          // cti.top.frmTop.sys1110_changeToWork(); // 전화를 한경우
          cutYn.value = 0; // 끊기
          standByYn.value = 1; // 대기
          restYn.value = 1; // 휴식
          restTypeYn.value = 1; // 휴식 유형
          crncyYn.value = 1; // 걸기
          holdingYn.value = 0; // 보류
          releaseHoldingYn.value = 1; // 해제
        }

        // cti.top.frmTop.sys1110_cancel_hold_timer(); // 2015.08.20 정찬영 추가 - 경과시간 타이머 stop
        // cti.top.frmTop.sys1110_start_call_timer(); // 2015.08.20 정찬영 추가 - 통화 경과시간 타이머 start
        timerStop(); // 통화 경과시간 타이머 stop
        timerStart(); // 통화 경과시간 타이머 start
        //-----------------------------------------------------------------
        // - 녹취 키값 조회 - 녹취 키값을 CTI에서 받을 수 없어서
        //   키값을 녹취 인터페이스로 요청하도록 구현함
        // http://10.1.73.14:8088?type=get&cmd=callkeyap&ext=51101
        // type : get 고정, cmd : callkeyap 고정, ext : 내선번호 가변

        dataParams.value.ext = baseParams.value.sysCALL_sStation; // 내선번호

        recId();

        break;
      case cti.NXEvent.ORIGINATED:// 10
        // 호(Call)가 Device로부터 시도되고 있는 상태. 예를 들어 사용자가 전화번호를 누르면 발생한다.
        break;
      case cti.NXEvent.DIVERTED://
        // 호를 다른 device(전화기)로 넘겼을 때 발생하는 이벤트

        break;
      case cti.NXEvent.RETRIEVED:
        // 전화기에 연결된 콜이 Hold상태에서 Active상태로 변경되었을 때 발생되는 이벤트
        // cti.top.frmBottom.sys1130_setMsg('OnEventRetrieved 보류해제');
        baseParams.value.sysCALLSetMsg = 'OnEventRetrieved 보류해제';
        // cti.top.frmTop.sys1110_cancel_hold_timer(); // 2015.08.20 정찬영 추가 - 보류 경과시간 타이머 stop
        // cti.top.frmTop.sys1110_show_call_timer(); // 2015.08.20 정찬영 추가 - 통화 경과시간 타이머 start
        timerStop(); // 통화 경과시간 타이머 stop
        timerStart(); // 통화 경과시간 타이머 start

        break;
      case cti.NXEvent.HELD:
        // 전화기에 연결된 콜이 Active상태에서 Hold상태로 변경되었을 때 발생되는 이벤트
        // cti.top.frmBottom.sys1130_setMsg('OnEventHeld 보류');
        baseParams.value.sysCALLSetMsg = 'OnEventHeld 보류';
        // cti.top.frmTop.sys1110_cancel_hold_timer(); // 2015.08.20 정찬영 추가 - 보류 경과시간 타이머 stop
        // cti.top.frmTop.sys1110_start_hold_timer(); // 2015.08.20 정찬영 추가 - 보류 경과시간 타이머 start
        timerStop(); // 통화 경과시간 타이머 stop
        timerStart(); // 통화 경과시간 타이머 start

        break;
      case cti.NXEvent.SERVICEINITATED:
        // Device가 Off-hook 상태이거나 Off-hook 상태로 처리되고 있는 상태. (수화기를 든 상태)
        break;
      case cti.NXEvent.TRANSFERRED:
        // 협의중인 Call이 종료하고 Call을 다른 사람에게 전환
        // KCCS는 호전환 기능은 없고 콜백으로 전환 시에만 TRANSFERRED 이벤트가 발생함.
        // 콜백으로 전환되는 경우는 상담원이 전화를 받지 못한 경우이므로
        // 후처리 상태가 아닌 대기 상태로 유지하도록함.
        //  <- 콜백으로 호전환 시 CTI서버에서 대기 이벤트가 발생하므로 전화받기 팝업만 닫음
        // cti.top.frmBottom.sys1130_setMsg('TRANSFERRED 전환');
        baseParams.value.sysCALLSetMsg = 'TRANSFERRED 전환';
        sysCALLShowRingPage(false);
        timerStop(); // 통화 경과시간 타이머 stop
        timerStart(); // 통화 경과시간 타이머 start
        // top.frmTop.sys1110_cancel_timer(); //경과시간 타이머 stop
        // top.frmTop.sys1110_Afterwork_timer();         //경과시간 타이머 start
        // top.frmTop.sys1110_changeToAfterwork();   // 상단 전화버튼처리
        // sysCALL_afterWork();

        break;
      case cti.NXEvent.CUBEDOWN:
        // 서버와의 소켓 연결이 비정상적으로 끊어진 경우 발생되는 이벤트
        // cti.top.frmBottom.sys1130_setMsg('OnEventSocketClose 서버소켓종료');
        baseParams.value.sysCALLSetMsg = 'OnEventSocketClose 서버소켓종료';

        break;
    }
  });
}

async function fetchData() {
  const response = await dataService.get('/sms/wells/bond/bond-counsel/user-info', { params: searchParams.value });
  tnoInfo.value = response.data;
  searchParams.value.tno = tnoInfo.value.tno1;
  // onClickSysCALLOnLogoutCall();
  startClient();
  ctiConnect();
}

onMounted(async () => {
  if (window.location.href.includes('localhost')) {
    baseParams.value.sysCALL_CTI_SERVER_IP = 'ws://10.1.73.10:9800';
    baseParams.value.sysCALL_CTI_SERVER_PORT = '9800';
  } else {
    baseParams.value.sysCALL_CTI_SERVER_IP = 'wss://ipccp.kyowon.co.kr:9801';
    baseParams.value.sysCALL_CTI_SERVER_PORT = '9801';
  }

  fetchData();
});

</script>

<style lang="scss" scoped>
.kw-page__content-container {
  position: relative !important;
}

.call-center {
  position: sticky;
  width: 100%;
  bottom: 0;
  min-width: 1480px;
  z-index: 10;

  // rev:230721 z-index 추가//

  &-inner {
    display: flex;
    justify-content: space-between;
    left: 0;
    bottom: 0;
    padding: 20px 40px;
    box-sizing: border-box;
    background-color: $secondary;
    align-items: center;

    ::v-deep(.kw-btn) {
      background-color: transparent;

      &.call-center-small-btn {
        min-height: 20px;
        font-size: 12px;
        padding: 2px 8px;

        // rev:230802 스타일 변경 line-height:1 -> 0.9 변경
        line-height: 0.9;
        font-weight: normal;
        background-color: rgb(0 0 0 / 20%);
        opacity: 1 !important;

        &.q-btn {
          &::before {
            background: inherit;
          }
        }

        .q-btn__content {
          color: #fff;
        }

        &.kw-btn--outlined::after {
          border: 1px solid #4f5a8d;
        }

        &.disabled {
          background-color: rgb(0 0 0 / 20%);
          opacity: 0.4 !important;
        }
      }

      &.call-center-icon-btn {
        width: 42px;
        padding: 0 8px;

        &::after {
          border: none;
        }

        &.q-btn {
          &::before {
            background: inherit;
          }
        }

        .q-icon {
          opacity: 1;
        }

        .q-btn__content {
          color: #fff;
        }

        &.disabled {
          .q-icon {
            color: #fff !important;
            opacity: 0.4;
          }

          .q-btn__content {
            color: rgb(255 255 255 / 40%);
          }
        }
      }

      &.call-center-btn {
        width: 100px;
        padding: 0;

        .q-btn__content {
          color: rgb(255 255 255 / 90%);
          word-break: keep-all;
        }
      }

      .q-btn__content {
        flex-direction: column;
        color: $bg-white;
      }

      .q-icon {
        margin-right: 0;
        color: $bg-white !important;
      }
    }

    ::v-deep(.kw-separator) {
      background-color: rgb(255 255 255 / 10%);
    }
  }

  ::v-deep(.kw-option-group--radio) {
    &.call-center-radio {
      margin-top: 24px;

      .q-field__control {
        min-height: 20px;
        height: 20px;
      }

      .q-field__native {
        min-height: 20px;
        height: 20px;
        color: #fff;
        line-height: 1;
      }

      .q-radio__inner {
        min-width: 18px;
        width: 18px;
        height: 18px;
        font-size: 18px;
      }

      .q-radio__label {
        font-size: 14px;
        line-height: 1.43;
      }

      .q-radio__bg {
        width: 18px;
        height: 18px;
        background-size: 18px;
      }

      .q-radio__inner--falsy {
        & ~ .q-radio__label {
          font-weight: 500;
          color: #fff;
        }

        & ~ .q-radio__label:hover {
          font-weight: 500;
          color: #fff;
        }
      }
    }
  }

  &-text {
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    line-height: 1.43;
  }

  // rev:230628 css 변경

  .call-center-popup {
    position: absolute;
    width: 810px;
    padding: 16px 30px 20px;
    border: 1px solid $secondary;
    bottom: 103px;
    right: 40px;
    background: $bg-white;
  }

  // // rev:230628 css 변경
  .outgoing-call-box {
    position: absolute;
    left: 92px;
    display: flex;
    padding: 15px 20px;
    background-color: #263060;
    border: 1px solid #747dac;
    box-shadow: 4px 5px 5px 0 rgb(0 0 0 / 16%);

    .kw-input {
      background: $bg-white;
    }

    ::v-deep(.kw-btn) {
      &.kw-btn--bg {
        background-color: $bg-white;

        .q-btn__content {
          color: $black-btn-line;
        }
      }
    }
  }
}
</style>
