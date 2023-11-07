<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [WSNC] allocate(배정관리)
2. 프로그램 ID : WwsncTimeTableForCustomerCenterM - 타임테이블 조회(CustomerCenter)
3. 작성자 : gs.piit122 김동엽
4. 작성일 : 2023-07-03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- W-SV-U-0034M01
- 고객센터 A/S 접수 시 방문할 일자 및 시간을 선택한다.
****************************************************************************************************
-->
<template>
  <kw-page :title="props.title === '' ? $t('MSG_TIT_TIME_TABLE') + $t('MSG_TXT_SRCH') : props.title ">
    <h1>{{ $t('MSG_TIT_EGER_TIME_TABLE') /*엔지니어 Time table*/ }}</h1>
    <div class="normal-area normal-area--button-set-bottom pt30 mt15 w940">
      <p class="kw-font--14">
        {{ $t('MSG_TXT_CHO_SV_VST_HOP_DT') /*서비스 방문 희망일자를 선택하세요*/ }}
      </p>
      <div class="row items-center q-gutter-sm">
        <div class="col">
          <h3 class="mt30">
            {{ $t('MSG_TXT_CHO_DT') /*날짜선택*/ }}
            <ul class="kw-notification">
              <li>
                {{ $t('MSG_TXT_VST_DOW') /*방문요일*/ }} : {{ data.psic.vstDowVal }}
              </li>
            </ul>
          </h3>
          <div class="border-box mt20 px35 py0 row justify-center">
            <!--######################## 달력 #########################-->
            <div
              class="kw-date reservation-datepicker"
              style="width: 268px; height: 295px;"
            >
              <div class="kw-date__container">
                <div class="datepicker datepicker-inline">
                  <div
                    class="datepicker-days"
                    style=""
                  >
                    <table class="table-condensed">
                      <thead>
                        <tr>
                          <th
                            class="datepicker-title"
                            colspan="7"
                            style="display: none;"
                          />
                        </tr>
                        <tr>
                          <th
                            class="prev"
                            @click="onClickPrevMonth"
                          >
                            «
                          </th>
                          <th
                            class="datepicker-switch"
                            colspan="5"
                          >
                            {{ searchParams.baseYm.substring(0, 4) + $t('MSG_TXT_YEAR' /*년*/)
                            }}&nbsp;
                            {{ searchParams.baseYm.substring(4) + $t('MSG_TXT_MON' /*월*/) }}
                          </th>
                          <th
                            class="next"
                            @click="onClickNextMonth"
                          >
                            »
                          </th>
                        </tr>
                        <tr>
                          <th class="dow">
                            {{ $t('MSG_TXT_SUN' /*일*/) }}
                          </th>
                          <th class="dow">
                            {{ $t('MSG_TXT_MON' /*월*/) }}
                          </th>
                          <th class="dow">
                            {{ $t('MSG_TXT_TUE_ABB'/*화*/) }}
                          </th>
                          <th class="dow">
                            {{ $t('MSG_TXT_WED_ABB'/*수*/) }}
                          </th>
                          <th class="dow">
                            {{ $t('MSG_TXT_THU_ABB'/*목*/) }}
                          </th>
                          <th class="dow">
                            {{ $t('MSG_TXT_FRI_ABB'/*금*/) }}
                          </th>
                          <th class="dow">
                            {{ $t('MSG_TXT_SAT_ABB'/*토*/) }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="weekIdx of scheduleInfo.weekCnt"
                          :key="weekIdx"
                          class="calendar-date"
                        >
                          <td
                            v-for="dayIdx of scheduleInfo.dayCnt"
                            :key="weekIdx * 0 + dayIdx"
                            :class="{ 'day old': /*비활성화*/ isOpacity(getDayCnt(weekIdx, dayIdx)),
                                      'day today': /*오늘*/isToday(getDayCnt(weekIdx, dayIdx)),
                                      'day sunday': /*휴일*/isHoliday(getDayCnt(weekIdx, dayIdx)),
                            }"
                            :data-date="getYmdText(getDayCnt(weekIdx, dayIdx))"
                            style="cursor: pointer;"

                            @click="onClickCalendar($event, weekIdx, dayIdx)"
                          >
                            {{ getDayText(getDayCnt(weekIdx, dayIdx)) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <!--######################## 달력 ##########################-->
          </div>
        </div>
        <div class="col">
          <h3 class="mt30">
            {{ $t('MSG_TXT_EGER') /*엔지니어*/ }} {{ $t('MSG_TXT_INF') /*정보*/ }}
          </h3>
          <div class="border-box pa30 mt20">
            <div class="row">
              <div class="col">
                <div class="row items-center">
                  <h3>
                    {{ data.psic.prtnrKnm }}
                  </h3>
                  <kw-chip
                    :label="data.psic.rolDvNm"
                    class="ml8"
                    color="primary"
                    square
                    text-color="primary"
                  />
                </div>
                <div class="column mt12">
                  <p class="kw-font--14">
                    {{ data.psic.ogNm }}
                  </p>
                  <div class="row items-center">
                    <p
                      class="kw-font--14"
                    >
                      {{ data.psic.cralLocaraTno }}-{{ data.psic.mexnoEncr }}-{{
                        data.psic.cralIdvTno }}
                    </p>
                    <kw-btn
                      borderless
                      class="ml4"
                      icon="cellphone"
                      style="font-size: 24px;"
                      @click="clickCell('clickHp')"
                    />
                    <kw-btn
                      borderless
                      class="ml4"
                      icon="sms_24"
                      style="font-size: 24px;"
                      @click="clickCell('clickSms')"
                    />
                  </div>
                  <div class="row items-center">
                    <p
                      class="kw-font--14"
                    >
                      {{ data.psic.locaraTno }}-{{ data.psic.exnoEncr }}-{{
                        data.psic.idvTno }}
                    </p>
                    <kw-btn
                      borderless
                      class="ml4"
                      icon="cellphone"
                      style="font-size: 24px;"
                      @click="clickCell('clickTel')"
                    />
                  </div>
                </div>
              </div>
              <kw-avatar size="60px">
                <img
                  :src="'https://kportal.kyowon.co.kr/myoffice/Common/ezCommon_InterFace.aspx?TYPE=ENGINEER&FILENAME=' +
                    data.psic.empPic"
                  alt="profile"
                >
              </kw-avatar>
            </div>

            <kw-separator />
            <div class="row">
              <div class="col">
                <div class="row items-center">
                  <h3>
                    {{ data.psic.prtnrKnm2 }}
                  </h3>
                  <kw-chip
                    :label="$t('MSG_TXT_MANAGER')"
                    class="ml8"
                    color="primary"
                    square
                    text-color="primary"
                  />
                </div>
                <div class="column mt12">
                  <div class="row items-center">
                    <p
                      class="kw-font--14"
                    >
                      {{ data.psic.sjHp1 }}-{{ data.psic.sjHp2 }}-{{ data.psic.sjHp3 }}
                    </p>
                    <kw-btn
                      borderless
                      class="ml4"
                      icon="cellphone"
                      style="font-size: 24px;"
                      @click="clickCell('clickCenterHp')"
                    />
                    <kw-btn
                      borderless
                      class="ml4"
                      icon="sms_24"
                      style="font-size: 24px;"
                      @click="clickCell('clickCenterSms')"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row kw-bc--bg-white mt30">
        <div class="col-3">
          <h3 class="mt0">
            {{ $t('MSG_TXT_LOCARA_GD') /*지역등급*/ }}
          </h3>
          <div class="row items-center h76 mt20 text-center">
            <h1 class="col">
              {{ data.psic.degNm }}
            </h1>
          </div>
        </div>
        <kw-separator
          spaced="20px"
          vertical
        />
        <div class="col">
          <h3 class="mt0">
            {{ $t('MSG_TXT_RCP_PS') /*접수현황*/ }}
          </h3>
          <ul class="kw-state-list kw-state-list--second-line pt20 px0 pb0">
            <li class="kw-state-list__item">
              <p class="kw-state-list__top">
                {{ $t('MSG_BTN_INSTL') /*설치*/ }}
              </p>
              <p class="kw-state-list__num">
                {{ data.psic.instCnt }}
              </p>
            </li>
            <li class="kw-state-list__item">
              <p class="kw-state-list__top">
                A/S
              </p>
              <p class="kw-state-list__num">
                {{ data.psic.asCnt }}
              </p>
            </li>
            <li class="kw-state-list__item">
              <p class="kw-state-list__top">
                B/S
              </p>
              <p class="kw-state-list__num">
                {{ data.psic.bsCnt }}
              </p>
            </li>
          </ul>
        </div>
      </div>
      <kw-separator />
      <ul v-if="data.sidingYn === 'Y' ">
        <kw-separator />
        <li v-if="data.lcst09 === '03'">
          <font size="4px">
            <!--            선택하신 모종 배송일자는 {{ dayjs(data.sellDate).format('YYYY년 MM월 DD일') }} 입니다. <br>
            배송시간은 방문 전 웰스매니저가 별도 연락드릴 예정입니다.<br>
            파종 예정일은 {{ dayjs(data.sowDay).format('YYYY년 MM월 DD일') }} 로
            파종 전 취소 시 별도의 위약금 없이 전액 환불 되며, 파종 후 취소 시 환불이 불가합니다. <br>
            모종 취소에 대한 자세한 사항은 고객센터(1588-4113)로 문의 주시기 바랍니다.<br>
            감사합니다.-->
            {{ $t('MSG_TXT_TIMETABLE_SIDING_SPP_DT_GUD1', [dayjs(data.sellDate).format('YYYY년 MM월 DD일'),
                                                           dayjs(data.sowDay).format('YYYY년 MM월 DD일')]) }}
          </font>
        </li>
        <li v-else-if="data.lcst09 === '02'">
          <font size="4px">
            <!--            선택하신 모종 배송일자는 {{ dayjs(data.sellDate).format('YYYY년 MM월 DD일') }} 입니다. <br>
            배송시간은 방문 전 웰스매니저가 별도 연락드릴 예정입니다.<br>
            파종 예정일은 {{ dayjs(data.sowDay).format('YYYY년 MM월 DD일') }}로 파종 전 취소 시 별도의 위약금 없이 전액 환불 되며,
            파종 후 취소 시 환불이 불가합니다. <br>
            모종 취소에 대한 자세한 사항은 고객센터(1588-4113)로 문의 주시기 바랍니다.<br>
            감사합니다.-->

            {{ $t('MSG_TXT_TIMETABLE_SIDING_SPP_DT_GUD2', [dayjs(data.sellDate).format('YYYY년 MM월 DD일'),
                                                           dayjs(data.sowDay).format('YYYY년 MM월 DD일')]) }}
          </font>
        </li>
        <li v-else>
          <font size="4px">
            <!--            선택하신 모종 배송일자는 {{ dayjs(data.sellDate).format('YYYY년 MM월 DD일') }} 입니다. <br>
            배송시간은 방문 전 웰스매니저가 별도 연락드릴 예정입니다.<br>
            모종 발송일은 {{ dayjs(data.sowDay).format('YYYY년 MM월 DD일') }} 입니다. <br>
            모종 발송 후 취소 시 환불이 불가합니다. <br>
            모종 취소에 대한 자세한 사항은 고객센터(1588-4113)로 문의 주시기 바랍니다.<br>
            감사합니다.-->
            {{ $t('MSG_TXT_TIMETABLE_SIDING_SPP_DT_GUD3', [dayjs(data.sellDate).format('YYYY년 MM월 DD일'),
                                                           dayjs(data.sowDay).format('YYYY년 MM월 DD일')]) }}
          </font>
        </li>
      </ul>
      <ul
        v-else-if="data.sellDate === nextDay && (toInteger(currentTime) < 800 ||
          toInteger(currentTime) > 1800)"
      >
        <kw-separator />
        <li>
          <kw-separator />
          <font size="4px">
            [{{ $t('MSG_BTN_RECEIPT') + $t('MSG_TXT_DDLN') /*접수마감*/
            }}]<br>{{ $t('MSG_TXT_TMOR_RCP_CL' /*내일 접수는 마감되었습니다*/) }}<br>
            {{ $t('MSG_TXT_NEXTDAY_AF_DT_VST_BOO' /*익일이후 날짜에 방문예약 바랍니다.*/) }}
          </font>
        </li>
      </ul>
      <ul
        v-else-if="data.psic.vstPos === '해당일 방문불가'"
      >
        <kw-separator />
        <li>
          <font size="4px">
            {{ $t('MSG_TXT_ASN_FSH_PSB_DT_CONF'
            /*해당 일자는
             타임테이블 스케쥴 배정 완료되어
             배정 가능일자 확인 후 배정 바랍니다.감사합니다.*/) }}
          </font>
        </li>
      </ul>
      <ul
        v-else-if="data.psic.rsbDvCd === 'W0604' // 직책(AC025_EMP_OR) = 10 센터장, 직책(RSB_DV_CD) = W0604 센터장
        "
      >
        <kw-separator />
        <li>
          {{ $t('MSG_TXT_STNB_RCP_PRGS') }}
          <!--          <font size="4px">
            방문시간 예약접수는 마감되었습니다.<br><br>
            단, 방문시간 미확정 접수는 가능하오니, 접수를<br><br>
            원할 경우 아래 “대기접수“ 버튼을 눌러주세요.<br><br>
            접수 후 담당 서비스엔지니어가 방문 가능시간을 <br><br>
            확인하여 연락 드리도록 하겠습니다.<br><br>
          </font>(방문시간 예약접수가 필요한 경우 다른 날짜를 선택해 주세요.)-->
        </li>
      </ul>
      <ul v-else>
        <li
          v-if="data.psic.rstrCndtUseYn === 'Y' && data.psic.vstPos ===
            '방문가능' "
        >
          <h3>
            {{ $t('MSG_TXT_TIME') + $t('MSG_TXT_SELT') /*시간선택*/ }}
            <ul class="kw-notification">
              <li>*() {{ $t('MSG_TXT_RCP_PSB') /*접수가능*/ + ' ' + $t('MSG_TXT_COUNT') /*건수*/ }}</li>
            </ul>
          </h3>
          <div class="row justify-between items-center mt20">
            <p class="kw-font--14">
              {{ $t('MSG_TXT_VST_PRR_CTNT' /*정확한 방문시간은 엔지니어가 사전 연락 드리겠습니다.*/) }}
            </p>
            <ul class="reservation-state">
              <li class="kw-font--14">
                {{ $t('MSG_TXT_AVBL_ON') /*예약가능*/ }}
              </li>
              <li class="kw-font--14">
                {{ $t('MSG_BTN_SELT') /*선택*/ }}
              </li>
              <li class="kw-font--14">
                {{ $t('MSG_BTN_RSV') /*예약*/ + $t('MSG_BTN_COMP') /*완료*/ }}
              </li>
            </ul>
          </div>
          <div
            class="row reservation-select q-gutter-x-sm"
          >
            <div
              :class="{ 'col select': clickedBtn === '0', 'col default': clickedBtn === '1' || clickedBtn === '', }"
              @click="onClickAm"
            >
              <h3>
                {{ $t('MSG_TXT_AM') /*오전*/ }} <span class="ml4">({{ data.amShowVar }})</span>
              </h3>
              <p class="mt4">
                09:00 ~ 12:50
              </p>
            </div>
            <div
              :class="{ 'col select': clickedBtn === '1', 'col default': clickedBtn === '0' || clickedBtn === '', }"
              @click="onClickPm"
            >
              <h3>
                {{ $t('MSG_TXT_PM') /*오후*/ }} <span class="ml4">({{ data.pmShowVar }})</span>
              </h3>
              <p class="mt4">
                14:00 ~ 17:50
              </p>
            </div>
          </div>
        </li>
      </ul>
      <div
        v-if="data.psic.udsnUseYn === 'Y' && // 미지정사용여부
          data.psic.vstPos=== '방문가능' &&
          data.psic.rsbDvCd === 'W0604' // 직책(AC025_EMP_OR) = 10 센터장, 직책(RSB_DV_CD) = W0604 센터장
        "
        class="row reservation-select q-gutter-x-sm"
      >
        <div
          :class="{ 'col select': clickedBtn === '1',
                    'col default': clickedBtn === '0' || clickedBtn === '',
          }"
          @click="onClickWait"
        >
          <h3>{{ $t('MSG_TXT_PENDING') + $t('MSG_BTN_RECEIPT') /*대기접수*/ }}</h3>
        </div>
      </div>
      <div
        v-if="data.sidingYn !== 'Y' &&
          data.svDvCd !== '4' &&
          (data.chnlDvCd === 'K' || data.chnlDvCd === 'P')
        "
      >
        <kw-separator />
        <h3>
          {{ $t('MSG_TXT_EGER') + ' ' + $t('MSG_BTN_TRMS') + $t('MSG_TXT_MEMO') /*엔지니어 전달 메모
        */ }}
        </h3>
        <kw-input
          v-model.trim="data.egerMemo"
          :disable="data.psic.vstPos === '해당일 방문불가'"
          class="mt20 mb18"
          counter
          maxlength="500"
          type="textarea"
        />
      </div>
      <div class="button-set--bottom row justify-center">
        <kw-btn
          :label="$t('MSG_BTN_CANCEL')"
          negative
          @click="onClickCancel"
        />
        <kw-btn
          :disable="data.psic.vstPos === '해당일 방문불가'"
          :label="$t('MSG_BTN_SAVE')"
          class="ml8"
          primary
          @click="onClickSave"
        />
      </div>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { notify, useDataService, useModal } from 'kw-lib';
import dayjs from 'dayjs';

import { cloneDeep, toInteger } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { ok, cancel } = useModal();

const DATE_FORMAT_YM = 'YYYYMM';
const DATE_FORMAT_YMD = 'YYYYMMDD';

const props = defineProps({
  baseYm: { type: String, default: '' },
  chnlDvCd: { type: String, default: '' },
  inflwChnl: { type: String, default: '' },
  svDvCd: { type: String, default: '' },
  sellDate: { type: String, default: '' },
  svBizDclsfCd: { type: String, default: '' },
  basePdCd: { type: String, default: '' },
  wrkDt: { type: String, default: '' },
  mtrStatCd: { type: String, default: '' },
  returnUrl: { type: String, default: '' },
  mkCo: { type: String, default: '' },
  cntrNo: { type: String, default: '' },
  cntrSn: { type: String, default: '' },
  seq: { type: String, default: '' },
  title: { type: String, default: '' },
  newAdrZip: { type: String, default: '' },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const currentTime = dayjs().format('HHmm');
const nextDay = dayjs().add(1, 'day').format('YYYYMMDD');

const schedules = ref([]);
const scheduleInfo = ref({
  weekCnt: 0,
  dayCnt: 7,
});
let cachedParams;
const clickedBtn = ref(''); // 0:오전, 1:오후

const disableDays = ref([]);

const searchParams = ref({});
new Map(Object.entries(props)).forEach((item, field) => {
  searchParams.value[field] = item;
});
if (searchParams.value.chnlDvCd === 'K' && searchParams.value.inflwChnl === '') { // KSS
  searchParams.value.inflwChnl = '3';
}

if (searchParams.value.chnlDvCd === 'C' && searchParams.value.inflwChnl === '') { // CubigCC
  searchParams.value.inflwChnl = '1';
}
const data = ref({
  svBizDclsfCd: '',
  chnlDvCd: '',
  svDvCd: '',
  cntrNo: '',
  cntrSn: '',
  sellDate: '',
  sellTime: '',
  curDateTimeString: '',
  wrkDt: '',
  mtrStatCd: '',
  basePdCd: '',
  lcst09: '',
  newAdrZip: '',
  userId: '',
  rcpOgTpCd: '',
  sowDay: '',
  returnUrl: '',
  mkCo: '',
  sidingYn: '',
  spayYn: '',
  offDays: [],
  sidingDays: [],
  disableDays: [],
  psic: [],
  days: [],
  smTimes: [],
  amTimes: [],
  pmTimes1: [],
  pmTimes2: [],
  ntTimes: [],
  amWrkCnt: 0,
  pmWrkCnt: 0,
  amAlloCnt: 0,
  pmAlloCnt: 0,
  totalAbleCnt: 0,
  totalMaxAbleCnt: 0,
  amShowVar: 0,
  pmShowVar: 0,
  egerMemo: '',
  seq: '',
  cstSvAsnNo: '',
  prtnrNo: '',
  ogTpCd: '',
});

function getCurrentDate() {
  return dayjs(`${searchParams.value.baseYm}01`).format(DATE_FORMAT_YM);
}

async function getTimeTables() {
  console.log(searchParams.value);

  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get(
    '/sms/wells/service/time-tables/time-assign',
    { params: { ...cachedParams } },
  );

  data.value = res.data;
  disableDays.value = [];
  clickedBtn.value = '';
  data.value.sellTime = '';

  console.log(data.value);

  //---------------------------------------------------------------
  // test
  // data.value.lcst09 = '09';
  // data.value.spayYn = 'N';
  // data.value.sowDay = '20230621';
  // data.value.offDays = [{ hsOffDays: '20230628621303' }];
  // data.value.sidingYn = 'N';
  // data.value.sidingDays = [
  //   { ablDays: '2023-06-17', sumCnt: '500', w3th: '20230617', sowDay: '20230617' },
  //   { ablDays: '2023-06-19', sumCnt: '500', w3th: '20230619', sowDay: '20230619' },
  //   { ablDays: '2023-06-20', sumCnt: '500', w3th: '20230620', sowDay: '20230620' },
  //   { ablDays: '2023-06-22', sumCnt: '500', w3th: '20230622', sowDay: '20230622' },
  //   { ablDays: '2023-06-23', sumCnt: '500', w3th: '20230623', sowDay: '20230623' },
  //   { ablDays: '2023-06-24', sumCnt: '500', w3th: '20230624', sowDay: '20230624' },
  // ];
  // data.value.disableDays = [
  //   { disableFuldays: '2023-06-23', tcMsg: '111법정휴무일 또는 회사휴무' },
  //   { disableFuldays: '2023-06-29', tcMsg: '222법정휴무일 또는 회사휴무' },
  // ];
  // data.value.psic = {
  //   prtnrNo: '36870',
  //   sellDate: '20230616',
  //   iscgubNm: '2급 중',
  //   rolDvNm: '엔지니어',
  //   sjHp1: '010',
  //   sjHp2: '5774',
  //   sjHp3: '7039',
  //   rpbLocaraCd: '243',
  //   ogNm: '하남서비스센터',
  //   ogId: 'OGO198500002397',
  //   prtnrKnm2: '정민수',
  //   vstDowVal: '월화수목금토',
  //   instCnt: '3',
  //   bsCnt: '0',
  //   asCnt: '0',
  //   satWrkYn: 'N',
  //   dfYn: 'N',
  //   dowDvCd: '6',
  //   fr2pLgldCd: '41',
  //   rstrCndtUseYn: 'Y',
  //   udsnUseYn: 'Y',
  //   vstPos: '방문가능',
  //   rsbDvCd: 'W0602',
  //   empPic: 'http://kiwi-m.kyowon.co.kr/KIWI-M/upload_file/upload_file/36870.jpg',
  //   locaraTno: '031',
  //   exnoEncr: '793',
  //   idvTno: '9351',
  //   cralLocaraTno: '010',
  //   mexnoEncr: '5774',
  //   cralIdvTno: '0110',
  //   twrkCnt: '1',
  // };
  // data.value.psic.rsbDvCd = '0';
  // data.value.amTimes = [
  //   { time: '09:00', cnt: '1', enableYn: 'N' },
  //   { time: '09:10', cnt: '0', enableYn: 'N' },
  //   { time: '09:20', cnt: '0', enableYn: 'N' },
  //   { time: '09:30', cnt: '0', enableYn: 'N' },
  //   { time: '09:40', cnt: '0', enableYn: 'N' },
  //   { time: '09:50', cnt: '0', enableYn: 'N' },
  //   { time: '10:00', cnt: '0', enableYn: 'N' },
  //   { time: '10:10', cnt: '0', enableYn: 'N' },
  //   { time: '10:20', cnt: '0', enableYn: 'N' },
  //   { time: '10:30', cnt: '0', enableYn: 'N' },
  //   { time: '10:40', cnt: '0', enableYn: 'N' },
  //   { time: '10:50', cnt: '0', enableYn: 'N' },
  //   { time: '11:00', cnt: '0', enableYn: 'N' },
  //   { time: '11:10', cnt: '0', enableYn: 'N' },
  //   { time: '11:20', cnt: '0', enableYn: 'N' },
  //   { time: '11:30', cnt: '0', enableYn: 'N' },
  //   { time: '11:40', cnt: '0', enableYn: 'N' },
  //   { time: '11:50', cnt: '0', enableYn: 'N' },
  //   { time: '12:00', cnt: '1', enableYn: 'N' },
  //   { time: '12:10', cnt: '0', enableYn: 'N' },
  //   { time: '12:20', cnt: '0', enableYn: 'N' },
  //   { time: '12:30', cnt: '0', enableYn: 'N' },
  //   { time: '12:40', cnt: '0', enableYn: 'N' },
  //   { time: '12:50', cnt: '0', enableYn: 'N' },
  //   { time: '13:00', cnt: '0', enableYn: 'N' },
  //   { time: '13:10', cnt: '0', enableYn: 'N' },
  //   { time: '13:20', cnt: '0', enableYn: 'N' },
  //   { time: '13:30', cnt: '0', enableYn: 'N' },
  //   { time: '13:40', cnt: '0', enableYn: 'N' },
  //   { time: '13:50', cnt: '0', enableYn: 'N' },
  // ];
  // data.value.pmTimes1 = [
  //   { time: '14:00', cnt: '0', enableYn: 'N' },
  //   { time: '14:10', cnt: '0', enableYn: 'N' },
  //   { time: '14:20', cnt: '0', enableYn: 'N' },
  //   { time: '14:30', cnt: '0', enableYn: 'N' },
  //   { time: '14:40', cnt: '1', enableYn: 'N' },
  //   { time: '14:50', cnt: '0', enableYn: 'N' },
  //   { time: '15:00', cnt: '0', enableYn: 'N' },
  //   { time: '15:10', cnt: '0', enableYn: 'N' },
  //   { time: '15:20', cnt: '0', enableYn: 'N' },
  //   { time: '15:30', cnt: '0', enableYn: 'N' },
  //   { time: '15:40', cnt: '0', enableYn: 'N' },
  //   { time: '15:50', cnt: '0', enableYn: 'N' },
  //   { time: '16:00', cnt: '0', enableYn: 'N' },
  //   { time: '16:10', cnt: '0', enableYn: 'N' },
  //   { time: '16:20', cnt: '0', enableYn: 'N' },
  //   { time: '16:30', cnt: '0', enableYn: 'N' },
  //   { time: '16:40', cnt: '3', enableYn: 'N' },
  //   { time: '16:50', cnt: '0', enableYn: 'N' },
  //   { time: '17:00', cnt: '0', enableYn: 'N' },
  //   { time: '17:10', cnt: '0', enableYn: 'N' },
  //   { time: '17:20', cnt: '0', enableYn: 'N' },
  //   { time: '17:30', cnt: '0', enableYn: 'N' },
  //   { time: '17:40', cnt: '0', enableYn: 'N' },
  //   { time: '17:50', cnt: '0', enableYn: 'N' }];
  // data.value.pmTimes2 = [{ time: '18:00', cnt: '1', enableYn: 'N' }];
  // data.value.psic.rstrCndtUseYn = 'N';
  // data.value.psic.udsnUseYn = 'Y';
  // data.value.psic.vstPos = '방문가능';
  // data.value.psic.rsbDvCd = '10';

  // test
  //---------------------------------------------------------------

  // 모종이라면
  if (data.value.sidingYn === 'Y') {
    // ddd_abledays
    if (data.value.disableDays.length > 0) {
      data.value.disableDays.forEach((item) => {
        disableDays.value.push(item.disableFuldays);
      });
    }
  } else {
    // abledDays
    data.value.disableDays.forEach((item) => {
      disableDays.value.push(item.disableFuldays);
    });
  }

  data.value.amWrkCnt = 0; // am_wrk_cnt
  data.value.pmWrkCnt = 0; // pm_wrk_cnt
  data.value.amAlloCnt = 0; // am_allo_cnt
  data.value.pmAlloCnt = 0; // pm_allo_cnt
  data.value.totalAbleCnt = 0; // total_able_cnt
  data.value.totalMaxAbleCnt = 0; // total_max_able_cnt
  data.value.amShowVar = 0; // am_show_var
  data.value.pmShowVar = 0; // pm_show_var
  const amAbleCnt = toInteger(data.value.psic.amWrkCnt);
  const pmAbleCnt = toInteger(data.value.psic.pmWrkCnt);

  data.value.amTimes.forEach((item) => {
    data.value.amWrkCnt += toInteger(item.cnt);
  });
  data.value.pmTimes1.forEach((item) => {
    data.value.pmWrkCnt += toInteger(item.cnt);
  });

  data.value.amAlloCnt = amAbleCnt - data.value.amWrkCnt < 0 ? 0 : amAbleCnt - data.value.amWrkCnt;
  data.value.pmAlloCnt = pmAbleCnt - data.value.pmWrkCnt < 0 ? 0 : pmAbleCnt - data.value.pmWrkCnt;

  data.value.totalAbleCnt = data.value.amAlloCnt + data.value.pmAlloCnt;
  data.value.totalMaxAbleCnt = amAbleCnt + pmAbleCnt - data.value.amWrkCnt + data.value.pmWrkCnt;

  data.value.amShowVar = data.value.amAlloCnt;
  if (data.value.totalMaxAbleCnt < data.value.amAlloCnt) {
    data.value.amShowVar = data.value.totalMaxAbleCnt;
  } else {
    data.value.amShowVar = data.value.amAlloCnt;
  }

  data.value.pmShowVar = data.value.pmAlloCnt;
  if (data.value.totalMaxAbleCnt < data.value.pmAlloCnt) {
    data.value.pmShowVar = data.value.totalMaxAbleCnt;
  } else {
    data.value.pmShowVar = data.value.pmAlloCnt;
  }

  clickedBtn.value = '';

  schedules.value = data.value.days;
  scheduleInfo.value.weekCnt = schedules.value.length / scheduleInfo.value.dayCnt;

  setTimeout(() => {
    document.querySelectorAll(`tr.calendar-date > td[data-date='${data.value.sellDate}']`)[0].classList.add('active');
  }, 10);
}

function getYmdText(dayCnt) {
  return schedules.value[dayCnt - 1]?.baseY
    .concat(schedules.value[dayCnt - 1]?.baseMm)
    .concat(schedules.value[dayCnt - 1]?.baseD);
}

function isHoliday(dayCnt) {
  return schedules.value[dayCnt - 1]?.dfYn === 'Y' || schedules.value[dayCnt - 1]?.phldYn === 'Y';
}

function enableAllTheseDays(inDate, isNotifyMessage) {
  // 모종 가능할 일자 중에
  if (data.value.sidingDays.find((item) => item.ablDays.replace(/-/g, '') === inDate)) {
    // 엔지니어 배정 불가능한 날짜이면
    if (data.value.disableDays.find((item) => item.disableFuldays.replace(/-/g, '') === inDate)) {
      if (isNotifyMessage) notify(`${t('MSG_BTN_RECEIPT' /* 접수 */)}${t('MSG_TXT_LIMIT' /* 제한 */)}`); // 접수제한;
      return 'N';
    }
    return 'Y';
  }
  return 'N';
}

function homecareAllTheseDays(inDate, isNotifyMessage) {
  const today = dayjs().format('YYYYMMDD');
  const twoMonth = dayjs(`${today.substr(0, 6)}01`).add(4, 'month').format('YYYYMMDD');
  const isFind = data.value.disableDays.find((item) => item.disableFuldays.replace(/-/g, '')
    === inDate);
  if (isFind) {
    const message = isFind.tcMsg;
    if (isNotifyMessage) notify(message, message);
    return 'N';
  }

  if (inDate >= twoMonth) {
    /* 2개월 접수제한 */
    if (isNotifyMessage) notify(`2${t('MSG_TXT_MCNT'/* 개월 */)} ${t('MSG_BTN_RECEIPT' /* 접수 */)}${t('MSG_TXT_LIMIT' /* 제한 */)}`);
    return 'N';
  }
  return 'Y';
}

function disableAllTheseDays(inDate, isNotifyMessage) {
  const today = dayjs().format('YYYYMMDD');
  const twoMonth = dayjs(`${today.substr(0, 6)}01`).add(4, 'month').format('YYYYMMDD');
  const isFind = data.value.disableDays.find((item) => item.disableFuldays.replace(/-/g, '')
    === inDate);
  if (isFind) {
    const message = isFind.tcMsg;
    if (isNotifyMessage) notify(message, message);
    return 'N';
  }
  if (inDate > twoMonth) {
    if (isNotifyMessage) notify(`2${t('MSG_TXT_MCNT'/* 개월 */)} ${t('MSG_BTN_RECEIPT' /* 접수 */)}${t('MSG_TXT_LIMIT' /* 제한 */)}`);
    return 'N';
  }
  return 'Y';
}

function isEnable(dayCnt, isNotifyMessage) {
  // console.group('isEnable');
  const pointedDate = getYmdText(dayCnt).replace(/-/g, '');

  // 모종
  if (data.value.sidingYn === 'Y') {
    return enableAllTheseDays(pointedDate, isNotifyMessage);
  }

  // 홈케어
  if (data.value.svDvCd === '4') {
    return homecareAllTheseDays(pointedDate, isNotifyMessage);
  }
  return disableAllTheseDays(pointedDate, isNotifyMessage);
}

function isOpacity(dayCnt) {
  const enable = isEnable(dayCnt, false);
  if (enable === 'N') {
    return true;
  }
  return !(schedules.value[dayCnt - 1]?.baseMm === searchParams.value.baseYm.substring(4));
}

function isToday(dayCnt) {
  if (!schedules.value[dayCnt - 1]) return false;
  const { baseY, baseMm, baseD } = schedules.value[dayCnt - 1];
  return `${baseY}${baseMm}${baseD}` === dayjs().format(DATE_FORMAT_YMD);
}

function getDayCnt(weekIdx, dayIdx) {
  return ((weekIdx - 1) * scheduleInfo.value.dayCnt) + dayIdx;
}

function getDayText(dayCnt) {
  return toInteger(schedules.value[dayCnt - 1]?.baseD);
}

async function onClickCalendar($event, weekIdx, dayIdx) {
  const dayCnt = getDayCnt(weekIdx, dayIdx);
  const selectedDay = getYmdText(dayCnt);
  const today = dayjs().format('YYYYMMDD');

  if (
    // (웰스이거나 kmembers) 그리고 오늘
    ((searchParams.value.chnlDvCd === 'W' || searchParams.value.chnlDvCd === 'P') && selectedDay === today)
    // kss 이고 홈케어 그리고 오늘
    || (searchParams.value.chnlDvCd === 'K' && searchParams.value.svDvCd === '4' && selectedDay === today)) {
    /* 웰스, 매니저, KSS 홈케어는 당일날짜 선택불가 합니다 */
    notify(t('MSG_TXT_TODAY_SELECT_DEGREE' /* 당일날짜 선택불가 합니다 */));
    return;
  }

  if (selectedDay < today) {
    /* 날짜를 오늘 이후로 선택하여 주십시오 */
    notify(t('MSG_ALT_TD_AF'));
    return;
  }

  const enable = isEnable(dayCnt, true);

  // 선택 불가 확인
  if (enable === 'Y') {
    searchParams.value.sellDate = selectedDay;
    await getTimeTables();
    document.querySelectorAll('tr.calendar-date > td > span').forEach((element) => {
      element.classList.remove('calendar-selected-date');
    });
    $event.target.classList.toggle('calendar-selected-date');
    document.querySelectorAll('tr.calendar-date > td').forEach((element) => {
      element.classList.remove('active');
    });
    $event.target.classList.toggle('active');
  }
}

async function onClickPrevMonth() {
  const currentDate = getCurrentDate();
  if (dayjs().diff(currentDate, 'month') > 5) return;
  searchParams.value.baseYm = dayjs(getCurrentDate()).subtract(1, 'month').format(DATE_FORMAT_YM);
  await getTimeTables();
}

async function onClickNextMonth() {
  searchParams.value.baseYm = dayjs(getCurrentDate()).add(1, 'month').format(DATE_FORMAT_YM);
  await getTimeTables();
}

async function onClickAm() {
  clickedBtn.value = '0';
  let time = '';
  if (data.value.totalMaxAbleCnt > 0 && data.value.amAlloCnt > 0
                && data.value.amAlloCnt >= toInteger(data.value.psic.tWrkCnt)) {
    time = '0910';
  } else if (data.value.totalMaxAbleCnt > 0 && data.value.amAlloCnt > 0
                && data.value.totalAbleCnt >= toInteger(data.value.psic.tWrkCnt)
                && data.value.totalAbleCnt === toInteger(data.value.psic.tWrkCnt)) {
    time = '0910';
  } else {
    time = '';
  }
  data.value.sellTime = time;
}

async function onClickPm() {
  clickedBtn.value = '1';
  let time = '';
  if (data.value.totalMaxAbleCnt > 0
      && data.value.pmAlloCnt > 0
      && data.value.pmAlloCnt >= toInteger(data.value.psic.tWrkCnt)) {
    time = '1410';
  } else if (data.value.totalMaxAbleCnt > 0
            && data.value.pmAlloCnt > 0
            && data.value.totalAbleCnt >= toInteger(data.value.psic.tWrkCnt)
            && data.value.totalAbleCnt === toInteger(data.value.psic.tWrkCnt)) {
    time = '1410';
  } else {
    time = '';
  }
  data.value.sellTime = time;
}

async function onClickWait() {
  clickedBtn.value = '1';
  data.value.sellTime = '0200';
}

async function onClickCancel() {
  cancel();
}

async function onClickSave() {
  // 일시불 모종
  if (data.value.spayYn === 'Y') {
    data.value.sellTime = '0100';
  }

  if (data.value.sellTime === '') {
    notify(`${t('MSG_ALT_IS_SELCT', [t('MSG_TXT_TIME')])}` /* 시간을 선택해주세요 */);
    return;
  }

  if (data.value.sellDate === dayjs().format('YYYYMMDD')
    && parseInt(data.value.sellTime, 10) <= (parseInt(`${dayjs().format('HHmm')}`, 10) + 100)
  ) {
    if (data.value.sellTime !== '0100'
      && data.value.sellTime !== '0200'
      && data.value.sellTime !== '0300'
      && data.value.sellTime !== '0400') {
      notify(t('MSG_TXT_CRTL_HH_AF_CHO' /* 현재 이후시간을 선택하여 주세요 */));
      return;
    }
  }

  if (data.value.sellDate === dayjs().format('YYYYMMDD')
    && (data.value.sellTime === '0100' || data.value.sellTime === '0200' || data.value.sellTime === '0300' || data.value.sellTime === '0400')
  ) {
    if (data.value.sellTime === '0100'
      && parseInt(dayjs().format('HHmm'), 10) > 1200) {
      notify(t('MSG_TXT_NASN_FRNN_HH_ASN_IMP') /* 미배정 오전 시간을 배정할 수 없습니다. */);
      return;
    }
    if (data.value.sellTime === '0200'
      && parseInt(dayjs().format('HHmm'), 10) > 1600) {
      notify(t('MSG_TXT_NASN_AFNN_1HH_ASN_IMP') /* 미배정 오후1 시간을 배정할 수 없습니다. */);
      return;
    }
  }

  /* let url = searchParams.value.returnUrl;
  url += `?svBizHclsfCd=${searchParams.value.svDvCd}`;
  url += `&rcpdt=${data.value.wrkDt}`;
  url += `&mtrStatCd=${searchParams.value.mtrStatCd}`;
  url += `&vstRqdt=${searchParams.value.sellDate}`;
  url += `&vstAkHh=${data.value.sellTime}`;
  url += `&cnslMoCn=${data.value.egerMemo}`;
  url += `&ogTpCd=${data.value.ogTpCd}`;
  url += `&ichrPrtnrNo=${data.value.prtnrNo}`;
  url += `&userId=${data.value.userId}`;
  url += `&rcpOgTpCd=${data.value.rcpOgTpCd}`;
  url += `&cntrNo=${searchParams.value.cntrNo}`;
  window.location.href = url; */
  // window.opener?.postMessage(data.value);
  data.value.action = 'save';
  window.opener?.postMessage(JSON.stringify(data.value), searchParams.value.returnUrl);
  ok();
}

async function clickCell(action) {
  data.value.action = action;
  window.opener?.postMessage(JSON.stringify(data.value.psic), searchParams.value.returnUrl);
}

onMounted(async () => {
  await getTimeTables();
});

</script>
<style lang="scss" scoped>
h3 {
  margin: 0;
}

.column.mt12 {
  & > .kw-font--14 + .row.items-center {
    margin-top: 4px;
  }

  .row.items-center + .row.items-center {
    margin-top: 4px;
  }
}

::v-deep(.kw-date) {
  margin: 0;

  .kw-date__container {
    width: 100%;

    .datepicker-days,
    .datepicker-months,
    .datepicker-years {
      width: 100%;
      text-align: center;

      .table-condensed {
        display: inline-table;
        vertical-align: top;
        margin-top: 13px;
      }
    }

    .datepicker-months,
    .datepicker-years {
      padding: 0 45px;
    }
  }

  .datepicker {
    &.datepicker-inline {
      width: 100%;

      table tbody td {
        // : 6px 2px;
        width: 40px;
        height: 32px;
        border: 6px solid #fff;
        border-top-width: 2px;
        border-bottom-width: 2px;
        z-index: 0;

        &.today {
          border: 6px solid #fff !important;
          border-top-width: 2px !important;
          border-bottom-width: 2px !important;
        }
      }
    }
  }
}

.reservation-state {
  margin: 0;
  padding: 0;
  display: flex;
  column-gap: 12px;
  list-style: none;

  .kw-font--14 {
    position: relative;
    padding-left: 12px;
    color: #777;

    &:not(:first-child) {
      &::before {
        border: none;
      }
    }

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      background-color: #fff;
      border: 1px solid $line-stroke;
    }

    &:nth-child(2) {
      &::before {
        background-color: $primary;
      }
    }

    &:nth-child(3) {
      &::before {
        background-color: $line-line;
      }
    }
  }
}

.reservation-select {
  margin-top: 20px;

  .col {
    padding: 18px 0;
    border: 1px solid $line-stroke;
    text-align: center;
    cursor: pointer;

    h3 {
      margin-top: 0;
      justify-content: center;
      color: currentcolor;
    }

    &.select {
      background-color: $primary;
      color: $bg-white;
      border: none;
    }

    &.disable {
      background-color: $line-line;
      color: $bg-white;
      border: none;
      cursor: not-allowed;
    }
  }
}
</style>
