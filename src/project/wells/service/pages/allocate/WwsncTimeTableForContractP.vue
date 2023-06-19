<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [WSNC] allocate(배정관리)
2. 프로그램 ID : WwsncTimeTableForContractP - 타임테이블 조회(판매)
3. 작성자 : gs.piit122 김동엽
4. 작성일 : 2023-06-06
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- W-SV-U-0062M01
- 판매 설치 접수 시 방문할 일자 및 시간을 선택한다.
****************************************************************************************************
-->
<template>
  <kw-popup size="xl">
    <!-- To. 개발  window popup width size: 940px  -->
    <h1>엔지니어 Time table</h1>
    <div class="normal-area normal-area--button-set-bottom pt30 mt15 w860">
      <!--      <p>{{ data.sellDate }}</p>-->
      <!--      <p>{{ data.sellTime }}</p>-->
      <!--      <p>{{ data.cntrNo }}</p>-->
      <p class="kw-font--14">
        서비스 방문 희망일자를 선택하세요
      </p>
      <div class="row items-center q-gutter-sm">
        <div class="col">
          <h3 class="mt30">
            날짜선택
            <ul class="kw-notification">
              <li>
                방문요일 : {{ data.psicDatas.vstDowVal }}
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
                            colspan="7"
                            class="datepicker-title"
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
                            colspan="5"
                            class="datepicker-switch"
                          >
                            {{ searchParams.baseYm.substring(0, 4) }}{{ $t('MSG_TXT_YEAR' /*년*/)
                            }}&nbsp;
                            {{ searchParams.baseYm.substring(4) }}{{ $t('MSG_TXT_MON' /*월*/) }}
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
                            :data-date="getYmdText(getDayCnt(weekIdx, dayIdx))"
                            :class="{ 'day old': /*비활성화*/ isOpacity(getDayCnt(weekIdx, dayIdx)),
                                      'day today': /*오늘*/isToday(getDayCnt(weekIdx, dayIdx)),
                                      'day sunday': /*휴일*/isHoliday(getDayCnt(weekIdx, dayIdx)),
                            }"

                            @click="onClickCalendar($event, weekIdx, dayIdx)"
                          >
                            {{ getDayText(getDayCnt(weekIdx, dayIdx)) }}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <th
                            colspan="7"
                            class="today"
                            style="display: none;"
                          >
                            오늘
                          </th>
                        </tr><tr>
                          <th
                            colspan="7"
                            class="clear"
                            style="display: none;"
                          >
                            삭제
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <!--######################## 달력 #########################-->
          </div>
        </div>
        <div class="col">
          <h3 class="mt30">
            엔지니어 정보
          </h3>
          <div class="border-box pa30 mt20">
            <div class="row">
              <div class="col">
                <div class="row items-center">
                  <h3>
                    {{ data.psicDatas.prtnrKnm }}
                  </h3>
                  <kw-chip
                    class="ml8"
                    color="primary"
                    label="엔지니어"
                    square
                    text-color="primary"
                  />
                </div>
                <div class="column mt12">
                  <p class="kw-font--14">
                    {{ data.psicDatas.ogNm }}
                  </p>
                  <div class="row items-center">
                    <p class="kw-font--14">
                      {{ data.psicDatas.cralLocaraTno }}-{{ data.psicDatas.mexnoEncr }}-{{
                        data.psicDatas.cralIdvTno }}
                    </p>
                    <!--                    <kw-btn
                      borderless
                      class="ml4"
                      icon="sms_24"
                      style="font-size: 24px;"
                    />-->
                  </div>
                  <div class="row items-center">
                    <p class="kw-font--14">
                      {{ data.psicDatas.locaraTno }}-{{ data.psicDatas.exnoEncr }}-{{
                        data.psicDatas.idvTno }}
                    </p>
                    <!--                    <kw-btn
                      borderless
                      class="ml4"
                      icon="sms_24"
                      style="font-size: 24px;"
                    />-->
                  </div>
                </div>
              </div>
              <kw-avatar size="60px">
                <img
                  alt="profile"
                  src="node_modules/kw-lib/src/assets/images/example_profile.png"
                >
              </kw-avatar>
            </div>

            <kw-separator />
            <div class="row">
              <div class="col">
                <div class="row items-center">
                  <h3>
                    {{ data.psicDatas.prtnrKnm2 }}
                  </h3>
                  <kw-chip
                    class="ml8"
                    color="primary"
                    label="매니저"
                    square
                    text-color="primary"
                  />
                </div>
                <div class="column mt12">
                  <div class="row items-center">
                    <p class="kw-font--14">
                      {{ data.psicDatas.sjHp1 }}-{{ data.psicDatas.sjHp2 }}-{{ data.psicDatas.sjHp3 }}
                    </p>
                    <!-- <kw-btn
                    icon="sms_24"
                    borderless
                    style="font-size: 24px;"
                    class="ml4"
                  /> -->
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
            지역등급
          </h3>
          <div class="row items-center h76 mt20 text-center">
            <h1 class="col">
              {{ data.psicDatas.degNm }}
            </h1>
          </div>
        </div>
        <kw-separator
          spaced="20px"
          vertical
        />
        <div class="col">
          <h3 class="mt0">
            접수현황
          </h3>
          <ul class="kw-state-list kw-state-list--second-line pt20 px0 pb0">
            <li class="kw-state-list__item">
              <p class="kw-state-list__top">
                설치
              </p>
              <p class="kw-state-list__num">
                {{ data.psicDatas.instCnt }}
              </p>
            </li>
            <li class="kw-state-list__item">
              <p class="kw-state-list__top">
                A/S
              </p>
              <p class="kw-state-list__num">
                {{ data.psicDatas.asCnt }}
              </p>
            </li>
            <li class="kw-state-list__item">
              <p class="kw-state-list__top">
                B/S
              </p>
              <p class="kw-state-list__num">
                {{ data.psicDatas.bsCnt }}
              </p>
            </li>
          </ul>
        </div>
      </div>
      <ul v-if="data.sidingYn === 'Y' ">
        <kw-separator />
        <li v-if="data.lcst09 === '03'">
          <font size="4px">
            선택하신 모종 배송일자는 {{ dayjs(data.sellDate).format('YYYY년 MM월 DD일') }} 입니다. <br>
            배송시간은 방문 전 웰스매니저가 별도 연락드릴 예정입니다.<br>
            파종 예정일은 {{ dayjs(data.sowDay).format('YYYY년 MM월 DD일') }} 로
            파종 전 취소 시 별도의 위약금 없이 전액 환불 되며, 파종 후 취소 시 환불이 불가합니다. <br>
            모종 취소에 대한 자세한 사항은 고객센터(1588-4113)로 문의 주시기 바랍니다.<br>
            감사합니다.
          </font>
        </li>
        <li v-else-if="data.lcst09 === '02'">
          <font size="4px">
            선택하신 모종 배송일자는 {{ dayjs(data.sellDate).format('YYYY년 MM월 DD일') }} 입니다. <br>
            배송시간은 방문 전 웰스매니저가 별도 연락드릴 예정입니다.<br>
            파종 예정일은 {{ dayjs(data.sowDay).format('YYYY년 MM월 DD일') }}로 파종 전 취소 시 별도의 위약금 없이 전액 환불 되며,
            파종 후 취소 시 환불이 불가합니다. <br>
            모종 취소에 대한 자세한 사항은 고객센터(1588-4113)로 문의 주시기 바랍니다.<br>
            감사합니다.
          </font>
        </li>
        <li v-else>
          <font size="4px">
            선택하신 모종 배송일자는 {{ dayjs(data.sellDate).format('YYYY년 MM월 DD일') }} 입니다. <br>
            배송시간은 방문 전 웰스매니저가 별도 연락드릴 예정입니다.<br>
            모종 발송일은 {{ dayjs(data.sowDay).format('YYYY년 MM월 DD일') }} 입니다. <br>
            모종 발송 후 취소 시 환불이 불가합니다. <br>
            모종 취소에 대한 자세한 사항은 고객센터(1588-4113)로 문의 주시기 바랍니다.<br>
            감사합니다.
          </font>
        </li>
      </ul>
      <ul
        v-else-if="selectedDay === nextDay && (toInteger(currentTime) < 800 ||
          toInteger(currentTime) > 1800)"
      >
        <kw-separator />
        <li>
          <kw-separator />
          <font size="4px">
            [접수마감]<br>내일 접수는 마감되었습니다.  <br> 익일이후 날짜에 방문예약 바랍니다.
          </font>
        </li>
      </ul>
      <ul
        v-else-if="(data.chnlDvCd === 'K' || data.chnlDvCd === 'P'|| data.chnlDvCd === 'W') &&
          data.psicDatas.vstPos
          === '해당일 방문불가' "
      >
        <kw-separator />
        <li>
          <font size="4px">
            <br>해당 일자는 <br>타임테이블 스케쥴 배정 완료되어 <br>배정 가능일자 확인 후 배정 바랍니다.<br><br>감사합니다.
          </font>
        </li>
      </ul>
      <ul v-else-if="data.psicDatas.rsbDvCd === '10' ">
        <kw-separator />
        <li>
          <font size="4px">
            방문시간 예약접수는 마감되었습니다.<br><br>
            단, 방문시간 미확정 접수는 가능하오니, 접수를<br><br>
            원할 경우 아래 “대기접수“ 버튼을 눌러주세요.<br><br>
            접수 후 담당 서비스엔지니어가 방문 가능시간을 <br><br>
            확인하여 연락 드리도록 하겠습니다.<br><br>
          </font>(방문시간 예약접수가 필요한 경우 다른 날짜를 선택해 주세요.)
        </li>
      </ul>
      <ul v-else-if="disableDays.includes(selectedDay)">
        <li>
          <font size="4px">
            [접수불가]<br><br>해당 날짜는 방문예약이 마감되었습니다.
          </font>
        </li>
      </ul>
      <!--################################-->
      <ul v-else>
        <li
          v-if="data.psicDatas.rstrCndtUseYn === 'Y' && data.psicDatas.vstPos ===
            '방문가능' "
        >
          <h3>
            시간선택
            <ul class="kw-notification">
              <li>*()접수가능 건수</li>
            </ul>
          </h3>
          <div class="row justify-between items-center mt20">
            <p class="kw-font--14">
              정확한 방문시간은 엔지니어가 사전 연락 드리겠습니다.
            </p>
            <ul class="reservation-state">
              <li class="kw-font--14">
                예약가능
              </li>
              <li class="kw-font--14">
                선택
              </li>
              <li class="kw-font--14">
                예약완료
              </li>
            </ul>
          </div>
          <!--
            div.col
            - 선택 : select 클래스 추가
            - 예약가능: default(클래스 추가 없음)
            - 예약완료: disable 클래스 추가
          -->
          <div
            class="row reservation-select q-gutter-x-sm"
          >
            <div
              :class="{ 'col select': clickedBtn === '0', 'col default': clickedBtn === '1' || clickedBtn === '', }"
              @click="onClickAm"
            >
              <h3>
                오전 <span class="ml4">({{ data.amShowVar }})</span>
              </h3>
              <p class="mt4">
                09:00 ~ 12:50
              </p>
            </div>
            <!--------------------------------------------------->
            <div
              :class="{ 'col select': clickedBtn === '1', 'col default': clickedBtn === '0' || clickedBtn === '', }"
              @click="onClickPm"
            >
              <h3>
                오후 <span class="ml4">({{ data.pmShowVar }})</span>
              </h3>
              <p class="mt4">
                14:00 ~ 17:50
              </p>
            </div>
          </div>
        </li>
      </ul>

      <div
        v-if="data.psicDatas.udsnUseYn === 'Y' &&
          data.psicDatas.vstPos=== '방문가능' &&
          data.psicDatas.rsbDvCd === '10' "
        class="row reservation-select q-gutter-x-sm"
      >
        <div
          :class="{ 'col select': clickedBtn === '1',
                    'col default': clickedBtn === '0' || clickedBtn === '',
          }"
          @click="onClickWait"
        >
          <h3>대기접수</h3>
        </div>
      </div>

      <div
        v-if="data.sidingYn !== 'Y' &&
          data.svDvCd !== '4' &&
          (data.chnlDvCd === 'K' || data.chnlDvCd === 'P')
        "
      >
        <kw-separator />
        <h3>엔지니어 전달메모</h3>
        <kw-input
          v-model.trim="data.egerMemo"
          class="mt20 mb18"
          counter
          maxlength="500"
          type="textarea"
        />
      </div>

      <div class="button-set--bottom row justify-center">
        <kw-btn
          label="취소"
          negative
          @click="onClickCancel"
        />
        <kw-btn
          class="ml8"
          label="저장"
          primary
          @click="onClickSave"
        />
      </div>
    </div>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { notify, useDataService, useModal /* , alert */ } from 'kw-lib';
import dayjs from 'dayjs';
// eslint-disable-next-line no-unused-vars
import { cloneDeep, toInteger } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { ok, cancel } = useModal();

const DATE_FORMAT_YM = 'YYYYMM';
const DATE_FORMAT_YMD = 'YYYYMMDD';

const props = defineProps({
  baseYm: { type: String, default: '' },
  userId: { type: String, default: '' },
  chnlDvCd: { type: String, default: '' },
  inflwChnl: { type: String, default: '' },
  svDvCd: { type: String, default: '' },
  sellDate: { type: String, default: '' },
  svBizDclsfCd: { type: String, default: '' },
  basePdCd: { type: String, default: '' },
  wrkDt: { type: String, default: '' },
  dataStatCd: { type: String, default: '' },
  returnUrl: { type: String, default: '' },
  mkCo: { type: String, default: '' },
  cntrNo: { type: String, default: '' },
  cntrSn: { type: String, default: '' },
  seq: { type: String, default: '' },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// if (props.baseYm === '') alert('baseYm');
// if (props.chnlDvCd === '') alert('chnlDvCd');
// if (props.svDvCd === '') alert('svDvCd');
// if (props.sellDate === '') alert('sellDate');
// if (props.svBizDclsfCd === '') alert('svBizDclsfCd');
// if (props.inflwChnl === '') alert('inflwChnl');
// if (props.basePdCd === '') alert('basePdCd');
// if (props.wrkDt === '') alert('wrkDt');
// if (props.dataStatCd === '') alert('dataStatCd');
// if (props.returnUrl === '') alert('returnUrl');
// if (props.mkCo === '') alert('mkCo');
// if (props.cntrNo === '') alert('cntrNo');
// if (props.cntrSn === '') alert('cntrSn');
// if (props.seq === '') alert('seq');

const currentDay = dayjs().format('YYYYMMDD');
const currentTime = dayjs().format('HHmm');
const nextDay = dayjs().add(1, 'day').format('YYYYMMDD');

// console.log('currentDay=', currentDay);
// console.log('currentTime=', currentTime);
// console.log('nextDay=', nextDay);

const selectedDay = ref('');
const schedules = ref([]);
const scheduleInfo = ref({
  weekCnt: 0,
  dayCnt: 7,
});

const clickedBtn = ref(''); // 0:오전, 1:오후

const enableDays = ref([]);
const disableDays = ref([]);
const timeConstMsg = ref([]);

const searchParams = ref({
  baseYm: props.baseYm,
  userId: props.userId,
  chnlDvCd: props.chnlDvCd,
  svDvCd: props.svDvCd,
  sellDate: props.sellDate,
  svBizDclsfCd: props.svBizDclsfCd,
  inflwChnl: props.inflwChnl,
  basePdCd: props.basePdCd,
  wrkDt: props.wrkDt,
  dataStatCd: props.dataStatCd,
  returnUrl: props.returnUrl,
  mkCo: props.mkCo,
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  seq: props.seq,
});
if (searchParams.value.chnlDvCd === 'K' && searchParams.value.inflwChnl === '') { // KSS
  searchParams.value.inflwChnl = '3';
}

if (searchParams.value.chnlDvCd === 'C' && searchParams.value.inflwChnl === '') { // CubigCC
  searchParams.value.inflwChnl = '1';
}

console.group('searchParams');
console.log(`baseYm: ${searchParams.value.baseYm}`);
console.log(`userId: ${searchParams.value.userId}`);
console.log(`chnlDvCd: ${searchParams.value.chnlDvCd}`);
console.log(`svDvCd: ${searchParams.value.svDvCd}`);
console.log(`sellDate: ${searchParams.value.sellDate}`);
console.log(`svBizDclsfCd: ${searchParams.value.svBizDclsfCd}`);
console.log(`inflwChnl: ${searchParams.value.inflwChnl}`);
console.log(`basePdCd: ${searchParams.value.basePdCd}`);
console.log(`wrkDt: ${searchParams.value.wrkDt}`);
console.log(`dataStatCd: ${searchParams.value.dataStatCd}`);
console.log(`returnUrl: ${searchParams.value.returnUrl}`);
console.log(`mkCo: ${searchParams.value.mkCo}`);
console.log(`cntrNo: ${searchParams.value.cntrNo}`);
console.log(`cntrSn: ${searchParams.value.cntrSn}`);
console.log(`seq: ${searchParams.value.seq}`);
console.groupEnd();

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
  dataStatCd: '',
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
  psicDatas: [],
  days: [],
  arrSm: [],
  arrAm: [],
  arrPm1: [],
  arrPm2: [],
  arrNt: [],
  amWrkCnt: 0,
  pmWrkCnt: 0,
  amAlloCnt: 0,
  pmAlloCnt: 0,
  totalAbleCnt: 0,
  totalMaxAbleCnt: 0,
  amShowVar: 0,
  pmShowVar: 0,
  egerMemo: '',
  seq: 0,
  prtnrNo: '',
  ogTpCd: '',
});

function getCurrentDate() {
  return dayjs(`${searchParams.value.baseYm}01`).format(DATE_FORMAT_YM);
}

// eslint-disable-next-line no-unused-vars
let cachedParams;
async function getTimeTables() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/service/time-tables/sales', { params:
   { ...cachedParams,
   } });

  data.value = res.data;
  enableDays.value = [];
  disableDays.value = [];
  timeConstMsg.value = [];

  // console.log(JSON.stringify(data.value));

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
  // data.value.psicDatas = {
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
  // data.value.psicDatas.rsbDvCd = '0';
  // data.value.arrAm = [
  //   { time: '09:00', cnt: '1', ablYn: 'N' },
  //   { time: '09:10', cnt: '0', ablYn: 'N' },
  //   { time: '09:20', cnt: '0', ablYn: 'N' },
  //   { time: '09:30', cnt: '0', ablYn: 'N' },
  //   { time: '09:40', cnt: '0', ablYn: 'N' },
  //   { time: '09:50', cnt: '0', ablYn: 'N' },
  //   { time: '10:00', cnt: '0', ablYn: 'N' },
  //   { time: '10:10', cnt: '0', ablYn: 'N' },
  //   { time: '10:20', cnt: '0', ablYn: 'N' },
  //   { time: '10:30', cnt: '0', ablYn: 'N' },
  //   { time: '10:40', cnt: '0', ablYn: 'N' },
  //   { time: '10:50', cnt: '0', ablYn: 'N' },
  //   { time: '11:00', cnt: '0', ablYn: 'N' },
  //   { time: '11:10', cnt: '0', ablYn: 'N' },
  //   { time: '11:20', cnt: '0', ablYn: 'N' },
  //   { time: '11:30', cnt: '0', ablYn: 'N' },
  //   { time: '11:40', cnt: '0', ablYn: 'N' },
  //   { time: '11:50', cnt: '0', ablYn: 'N' },
  //   { time: '12:00', cnt: '1', ablYn: 'N' },
  //   { time: '12:10', cnt: '0', ablYn: 'N' },
  //   { time: '12:20', cnt: '0', ablYn: 'N' },
  //   { time: '12:30', cnt: '0', ablYn: 'N' },
  //   { time: '12:40', cnt: '0', ablYn: 'N' },
  //   { time: '12:50', cnt: '0', ablYn: 'N' },
  //   { time: '13:00', cnt: '0', ablYn: 'N' },
  //   { time: '13:10', cnt: '0', ablYn: 'N' },
  //   { time: '13:20', cnt: '0', ablYn: 'N' },
  //   { time: '13:30', cnt: '0', ablYn: 'N' },
  //   { time: '13:40', cnt: '0', ablYn: 'N' },
  //   { time: '13:50', cnt: '0', ablYn: 'N' },
  // ];
  // data.value.arrPm1 = [
  //   { time: '14:00', cnt: '0', ablYn: 'N' },
  //   { time: '14:10', cnt: '0', ablYn: 'N' },
  //   { time: '14:20', cnt: '0', ablYn: 'N' },
  //   { time: '14:30', cnt: '0', ablYn: 'N' },
  //   { time: '14:40', cnt: '1', ablYn: 'N' },
  //   { time: '14:50', cnt: '0', ablYn: 'N' },
  //   { time: '15:00', cnt: '0', ablYn: 'N' },
  //   { time: '15:10', cnt: '0', ablYn: 'N' },
  //   { time: '15:20', cnt: '0', ablYn: 'N' },
  //   { time: '15:30', cnt: '0', ablYn: 'N' },
  //   { time: '15:40', cnt: '0', ablYn: 'N' },
  //   { time: '15:50', cnt: '0', ablYn: 'N' },
  //   { time: '16:00', cnt: '0', ablYn: 'N' },
  //   { time: '16:10', cnt: '0', ablYn: 'N' },
  //   { time: '16:20', cnt: '0', ablYn: 'N' },
  //   { time: '16:30', cnt: '0', ablYn: 'N' },
  //   { time: '16:40', cnt: '3', ablYn: 'N' },
  //   { time: '16:50', cnt: '0', ablYn: 'N' },
  //   { time: '17:00', cnt: '0', ablYn: 'N' },
  //   { time: '17:10', cnt: '0', ablYn: 'N' },
  //   { time: '17:20', cnt: '0', ablYn: 'N' },
  //   { time: '17:30', cnt: '0', ablYn: 'N' },
  //   { time: '17:40', cnt: '0', ablYn: 'N' },
  //   { time: '17:50', cnt: '0', ablYn: 'N' }];
  // data.value.arrPm2 = [{ time: '18:00', cnt: '1', ablYn: 'N' }];
  // data.value.psicDatas.rstrCndtUseYn = 'N';
  // data.value.psicDatas.udsnUseYn = 'Y';
  // data.value.psicDatas.vstPos = '방문가능';
  // data.value.psicDatas.rsbDvCd = '10';

  // test
  //---------------------------------------------------------------

  // 모종이라면
  if (data.value.sidingYn === 'Y') {
    // abledDays
    data.value.sidingDays.forEach((item) => {
      enableDays.value.push(item.ablDays);
      console.log('ablDays', item.ablDays);
    });

    // ddd_abledays
    if (data.value.disableDays.length > 0) {
      data.value.disableDays.forEach((item) => {
        disableDays.value.push(item.disableFuldays);
        console.log('disableDays', item.disableFuldays, item.tcMsg);
      });
    }
  } else {
    // abledDays
    data.value.disableDays.forEach((item) => {
      disableDays.value.push(item.disableFuldays);
      console.log('disableDays', item.disableFuldays, item.tcMsg);
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
  const amAbleCnt = toInteger(data.value.psicDatas.amWrkCnt);
  const pmAbleCnt = toInteger(data.value.psicDatas.pmWrkCnt);
  data.value.arrAm.forEach((item) => {
    data.value.amWrkCnt += toInteger(item.cnt);
  });
  data.value.arrPm1.forEach((item) => {
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

  schedules.value = data.value.days;
  scheduleInfo.value.weekCnt = schedules.value.length / scheduleInfo.value.dayCnt;
}

function getYmdText(dayCnt) {
  return schedules.value[dayCnt - 1]?.baseY
    .concat(schedules.value[dayCnt - 1]?.baseMm)
    .concat(schedules.value[dayCnt - 1]?.baseD);
}

function isHoliday(dayCnt) {
  return schedules.value[dayCnt - 1]?.dfYn === 'Y' || schedules.value[dayCnt - 1]?.phldYn === 'Y';
}

//---------------------------------------------------
function enableAllTheseDays(inDate, isNotifyMessage) {
  if (data.value.sidingDays.find((item) => item.ablDays.replace(/-/g, '') === inDate)) {
    if (data.value.disableDays.find((item) => item.disableFuldays.replace(/-/g, '') === inDate)) {
      if (isNotifyMessage) notify('접수제한');
      return 'N';
    }
    return 'Y';
  }
  return 'N';
}
//---------------------------------------------------
// eslint-disable-next-line no-unused-vars
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
    if (isNotifyMessage) notify('2개월 접수제한');
    return 'N';
  }
  return 'Y';
}
//---------------------------------------------------
// eslint-disable-next-line no-unused-vars
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
    if (isNotifyMessage) notify('2개월 접수제한');
    return 'N';
  }
  return 'Y';
}
//---------------------------------------------------
// eslint-disable-next-line no-unused-vars
function isEnable(dayCnt, isNotifyMessage) {
  // console.group('isEnable');
  const pointedDate = getYmdText(dayCnt).replace(/-/g, '');

  if (data.value.sidingYn === 'Y') {
    return enableAllTheseDays(pointedDate, isNotifyMessage);
  }

  if (data.value.svDvCd === '4') {
    return homecareAllTheseDays(pointedDate, isNotifyMessage);
  }
  return disableAllTheseDays(pointedDate, isNotifyMessage);
}

// eslint-disable-next-line no-unused-vars
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
  selectedDay.value = getYmdText(dayCnt);

  if (((searchParams.value.chnlDvCd === 'W' || searchParams.value.chnlDvCd === 'P') && selectedDay.value
  === currentDay) || (searchParams.value.chnlDvCd === 'K' && searchParams.value.svDvCd === '1'
  && selectedDay.value === currentDay)) {
    notify('당일날짜는 선택불가 합니다');
    return;
  }

  if (selectedDay.value < currentDay) {
    notify('날짜를 오늘 이후로 선택하여 주십시오');
    return;
  }
  // 의미없음
  // if (searchParams.value.chnlDvCd === 'C' // CubicCC
  //   || searchParams.value.chnlDvCd === 'W' // 웰스
  //   || searchParams.value.chnlDvCd === 'P' //  K-MEMBERS
  // )  {
  //
  // }

  const enable = isEnable(dayCnt, true);
  // console.log('enable', enable);

  // if (enable === 'N') {
  //   notify('당일날짜는 선택불가 합니다');
  // }

  // 선택 불가 확인
  if (enable === 'Y') {
    console.log('선택 시 active 처리');
    document.querySelectorAll('tr.calendar-date > td').forEach((element) => {
      element.classList.remove('active');
    });
    $event.target.classList.toggle('active');
    // 선택 시 active 처리

    // 의미없음
    // if (searchParams.value.chnlDvCd === 'K' // KSS
    //   || searchParams.value.chnlDvCd === 'I' // 엔지니어
    //   || searchParams.value.chnlDvCd === 'E' //  엔지니어
    //   || searchParams.value.chnlDvCd === 'M' //  매니저
    // ) {
    searchParams.value.sellDate = selectedDay;
    await getTimeTables();
    // }
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
  // console.log('totalMaxAbleCnt', data.value.totalMaxAbleCnt);
  // console.log('totalAbleCnt', data.value.totalAbleCnt);
  // console.log('tWrkCnt', toInteger(data.value.psicDatas.tWrkCnt));
  // console.log('amAlloCnt', data.value.amAlloCnt);
  let time = '';
  if (data.value.totalMaxAbleCnt > 0 && data.value.amAlloCnt > 0
                && data.value.amAlloCnt >= toInteger(data.value.psicDatas.tWrkCnt)) {
    time = '0910';
  } else if (data.value.totalMaxAbleCnt > 0 && data.value.amAlloCnt > 0
                && data.value.totalAbleCnt >= toInteger(data.value.psicDatas.tWrkCnt)
                && data.value.totalAbleCnt === toInteger(data.value.psicDatas.tWrkCnt)) {
    time = '0910';
  } else {
    time = '';
  }
  data.value.sellTime = time;
}
async function onClickPm() {
  clickedBtn.value = '1';
  // console.log('totalMaxAbleCnt', data.value.totalMaxAbleCnt);
  // console.log('totalAbleCnt', data.value.totalAbleCnt);
  // console.log('tWrkCnt', toInteger(data.value.psicDatas.tWrkCnt));
  // console.log('pmAlloCnt', data.value.pmAlloCnt);
  let time = '';
  if (data.value.totalMaxAbleCnt > 0
      && data.value.pmAlloCnt > 0
      && data.value.pmAlloCnt >= toInteger(data.value.psicDatas.tWrkCnt)) {
    time = '1410';
  } else if (data.value.totalMaxAbleCnt > 0
            && data.value.pmAlloCnt > 0
            && data.value.totalAbleCnt >= toInteger(data.value.psicDatas.tWrkCnt)
            && data.value.totalAbleCnt === toInteger(data.value.psicDatas.tWrkCnt)) {
    time = '1410';
  } else {
    time = '';
  }
  console.log(time);
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

  // if (data.value.sellTime === '') {
  //   alert('시간을 선택해주세요');
  //   return;
  // }

  const sendData = {
    inChnlDvCd: data.value.chnlDvCd,
    asIstOjNo: searchParams.value.seq,
    svBizHclsfCd: searchParams.value.svDvCd,
    rcpdt: data.value.wrkDt,
    dtaStatCd: searchParams.value.dataStatCd,
    svBizDclsfCd: searchParams.value.svBizDclsfCd,
    urgtYn: 'N',
    vstRqdt: searchParams.value.sellDate,
    vstAkHh: data.value.sellTime,
    smsFwYn: 'N',
    cnslMoCn: data.value.egerMemo,
    ogTpCd: data.value.ogTpCd, // 엔지니어 조직유형
    ichrPrtnrNo: data.value.prtnrNo, // 엔지니어 파트너번호
    cntrNo: searchParams.value.cntrNo,
    cntrSn: searchParams.value.cntrSn,
    // #####################################################
    inflwChnl: searchParams.value.inflwChnl,
    pdGdCd: 'A',
    userId: searchParams.value.userId, // 로그인한 사용자
    rcpOgTpCd: data.value.rcpOgTpCd, // 로그인한 사용자 조직유형

  };
  await dataService.post('/sms/wells/service/installation-works', sendData);
  notify(t('MSG_ALT_SAVE_DATA'));
  ok(sendData);
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

// ::v-deep(.kw-date) {
//   &.reservation-datepicker {
//     padding: 26px 0;

//     .datepicker.datepicker-inline {
//       table {
//         width: 100%;

//         // thead 공통
//         thead {
//           tr:nth-child(2) {
//             th.prev {
//               width: 100%;
//               height: 100%;
//               color: transparent;
//               display: inline-block;
//               background: url(node_modules/kw-lib/src/assets/icons/arrow_left.svg) center no-repeat;
//               background-size: 16px 16px;
//             }

//             th.next {
//               width: 100%;
//               height: 100%;
//               color: transparent;
//               display: inline-block;
//               background: url(node_modules/kw-lib/src/assets/icons/arrow_right.svg) center no-repeat;
//               background-size: 16px 16px;
//             }

//             th.datepicker-switch {
//               width: auto;
//               font-size: 18px;
//               height: 26px;
//               font-weight: 500;
//               line-height: 1.33;
//             }
//           }

//           tr:nth-child(3) {
//             .dow {
//               font-size: 12px;
//               font-weight: normal;
//               line-height: 1.67;

//               &:is(:first-child) {
//                 color: $error;
//               }
//             }
//           }
//         }

//         tr td.day {
//           &.old,
//           &.new {
//             opacity: 0.3;
//           }

//           &.sunday {
//             color: $error;

//             &.old,
//             &.new {
//               color: $error;
//             }
//           }

//           &.saturday {
//             color: $black1 !important;
//           }
//         }
//       }

//       table tr td.active.active,
//       table tr td span.active.active,
//       table tr td.active.disabled.active,
//       table tr td span.active.disabled.active,
//       table tr td.active.disabled:active,
//       table tr td span.active.disabled:active,
//       table tr td.active.disabled:hover.active,
//       table tr td span.active.disabled:hover.active,
//       table tr td.active.disabled:hover:active,
//       table tr td span.active.disabled:hover:active,
//       table tr td.active:active,
//       table tr td span.active:active,
//       table tr td.active:hover.active,
//       table tr td span.active:hover.active,
//       table tr td.active:hover:active,
//       table tr td span.active:hover:active {
//         background-color: $primary;
//         color: $bg-white;
//         text-shadow: none;
//       }

//       .datepicker-days {
//         width: 100%;
//         display: flex;
//         justify-content: center;

//         table {
//           margin: -12px;
//           border-spacing: 12px 4px;
//           table-layout: fixed;

//           thead {
//             tr:nth-child(3) {
//               margin-top: -4px;
//             }
//           }

//           tbody {
//             margin-top: -4px;

//             tr td {
//               position: relative;
//               border-radius: 100%;
//               font-size: 14px;
//               font-weight: normal;
//               line-height: 1.43;
//             }
//           }
//         }
//       }
//     }
//   }
// }
</style>
