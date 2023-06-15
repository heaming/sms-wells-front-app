<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [WSNC] allocate(배정관리)
2. 프로그램 ID : WwsncTimeTableSellListP - 타임테이블 조회(판매)
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
      <p class="kw-font--14">
        서비스 방문 희망일자를 선택하세요
      </p>
      <div class="row items-center q-gutter-sm">
        <div class="col">
          <h3 class="mt30">
            날짜선택
            <ul class="kw-notification">
              <li>
                방문요일 : {{ psicDataDvos.ac146VstCycl }}
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
                    {{ psicDataDvos.ac021EmpNm }}
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
                    {{ psicDataDvos.ac125DeptNm }}
                  </p>
                  <div class="row items-center">
                    <p class="kw-font--14">
                      {{ psicDataDvos.cralLocaraTno }}-{{ psicDataDvos.mexnoEncr }}-{{ psicDataDvos.cralIdvTno }}
                    </p>
                    <kw-btn
                      borderless
                      class="ml4"
                      icon="sms_24"
                      style="font-size: 24px;"
                    />
                  </div>
                  <div class="row items-center">
                    <p class="kw-font--14">
                      {{ psicDataDvos.locaraTno }}-{{ psicDataDvos.exnoEncr }}-{{ psicDataDvos.idvTno }}
                    </p>
                    <kw-btn
                      borderless
                      class="ml4"
                      icon="sms_24"
                      style="font-size: 24px;"
                    />
                  </div>
                </div>
              </div>
              <kw-avatar size="60px">
                <img
                  alt="profile"
                  src="{{ psicDataDvos.empPic }}"
                >
              </kw-avatar>
            </div>

            <kw-separator />
            <div class="row">
              <div class="col">
                <div class="row items-center">
                  <h3>
                    {{ psicDataDvos.ac021EmpNm1 }}
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
                      {{ psicDataDvos.sjHp1 }}-{{ psicDataDvos.sjHp2 }}-{{ psicDataDvos.sjHp3 }}
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
              {{ psicDataDvos.degNm }}
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
                {{ psicDataDvos.instCnt }}
              </p>
            </li>
            <li class="kw-state-list__item">
              <p class="kw-state-list__top">
                A/S
              </p>
              <p class="kw-state-list__num">
                {{ psicDataDvos.asCnt }}
              </p>
            </li>
            <li class="kw-state-list__item">
              <p class="kw-state-list__top">
                B/S
              </p>
              <p class="kw-state-list__num">
                {{ psicDataDvos.bsCnt }}
              </p>
            </li>
          </ul>
        </div>
      </div>
      <kw-separator />
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
      <div class="row reservation-select q-gutter-x-sm">
        <!--
        div.col
        - 선택 : select 클래스 추가
        - 예약가능: default(클래스 추가 없음)
        - 예약완료: disable 클래스 추가
      -->
        <div class="col select">
          <h3>
            오전 <span class="ml4">(4)</span>
          </h3>
          <p class="mt4">
            09:00 ~ 12:50
          </p>
        </div>
        <div class="col disable">
          <h3>
            오후 <span class="ml4">(8)</span>
          </h3>
          <p class="mt4">
            4:00 ~ 17:50
          </p>
        </div>
      </div>
      <kw-separator />
      <h3>엔지니어 전달메모</h3>
      <kw-input
        class="mt20 mb18"
        counter
        maxlength="500"
        type="textarea"
      />
      <div class="button-set--bottom row justify-center">
        <kw-btn
          label="취소"
          negative
        />
        <kw-btn
          class="ml8"
          label="저장"
          primary
        />
      </div>
    </div>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService/* , useModal, alert */, notify } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, toInteger } from 'lodash-es';

const dataService = useDataService();

const DATE_FORMAT_YM = 'YYYYMM';
const DATE_FORMAT_YMD = 'YYYYMMDD';

const props = defineProps({
  baseYm: { type: String, default: '' },
  userId: { type: String, default: '' },
  chnlDvCd: { type: String, default: '' },
  svDvCd: { type: String, default: '' },
  sellDate: { type: String, default: '' },
  svBizDclsfCd: { type: String, default: '' },
  inflwChnl: { type: String, default: '' },
  basePdCd: { type: String, default: '' },
  wrkDt: { type: String, default: '' },
  dataStatCd: { type: String, default: '' },
  returnUrl: { type: String, default: '' },
  mkCo: { type: String, default: '' },
  cntrNo: { type: String, default: '' },
  cntrSn: { type: String, default: '' },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const today = dayjs().format('YYYYMMDD');
const selectedDay = ref('');
const schedules = ref([]);
const scheduleInfo = ref({
  weekCnt: 0,
  dayCnt: 7,
});

const sidingDayDvos = ref([]);
const disableDayDvos = ref([]);
const psicDataDvos = ref({});
const assignTimeDvos = ref([]);

const ableDays = ref([]);
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
});

const sidingYn = ref('N'); // 모종여부
const spayYn = ref('N'); // 일시불여부

function getCurrentDate() {
  return dayjs(`${searchParams.value.baseYm}01`).format(DATE_FORMAT_YM);
}

let cachedParams;
async function getTimeTables() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/service/time-tables/sales', { params:
   { ...cachedParams,
   } });
  /* const res = {
    data: {
      svBizDclsfCd: '1110',
      chnlDvCd: 'K',
      svDvCd: '1',
      cntrNo: 'W20220137399',
      cntrSn: '1',
      sellDate: '20230601',
      curDateTimeString: '20230615',
      wrkDt: '',
      dataStatCd: '1',
      basePdCd: 'WP01120367',
      lcst09: '',
      newAdrZip: '07333',
      userId: '27536',
      sowDay: '',
      returnurl: '',
      mkCo: '',
      sidingYn: 'N', // 모종여부
      spayYn: 'Y', // 일시불여부
      offDays: [
        { hsOffDays: '20230628621303' },
      ],
      sidingDayDvos: [
        // { ablDays: '2023-6-17', sumCnt: '500' },
        // { ablDays: '2023-6-19', sumCnt: '500' },
        // { ablDays: '2023-6-20', sumCnt: '500' },
        // { ablDays: '2023-6-21', sumCnt: '500' },
        // { ablDays: '2023-6-22', sumCnt: '500' },
        // { ablDays: '2023-6-23', sumCnt: '500' },
        // { ablDays: '2023-6-24', sumCnt: '500' },
      ],
      disableDayDvos: [
        {
          disableDays: '2023-10-1',
          disableFuldays: '2023-10-01',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-10-15',
          disableFuldays: '2023-10-15',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-10-22',
          disableFuldays: '2023-10-22',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-10-29',
          disableFuldays: '2023-10-29',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-10-3',
          disableFuldays: '2023-10-03',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-10-8',
          disableFuldays: '2023-10-08',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-10-9',
          disableFuldays: '2023-10-09',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-11-12',
          disableFuldays: '2023-11-12',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-11-19',
          disableFuldays: '2023-11-19',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-11-26',
          disableFuldays: '2023-11-26',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-11-5',
          disableFuldays: '2023-11-05',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-12-10',
          disableFuldays: '2023-12-10',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-12-3',
          disableFuldays: '2023-12-03',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-6-18',
          disableFuldays: '2023-06-18',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-6-25',
          disableFuldays: '2023-06-25',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-7-16',
          disableFuldays: '2023-07-16',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-7-2',
          disableFuldays: '2023-07-02',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-7-23',
          disableFuldays: '2023-07-23',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-7-30',
          disableFuldays: '2023-07-30',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-7-9',
          disableFuldays: '2023-07-09',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-8-13',
          disableFuldays: '2023-08-13',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-8-15',
          disableFuldays: '2023-08-15',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-8-20',
          disableFuldays: '2023-08-20',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-8-27',
          disableFuldays: '2023-08-27',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-8-6',
          disableFuldays: '2023-08-06',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-9-10',
          disableFuldays: '2023-09-10',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-9-17',
          disableFuldays: '2023-09-17',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-9-24',
          disableFuldays: '2023-09-24',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-9-28',
          disableFuldays: '2023-09-28',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-9-29',
          disableFuldays: '2023-09-29',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
        {
          disableDays: '2023-9-3',
          disableFuldays: '2023-09-03',
          tcMsg: '법정휴무일 또는 회사휴무',
        },
      ],
      psicDataDvos: {
        ac021EmpId: '621303',
        empPic: 'http://kiwi-m.kyowon.co.kr/KIWI-M/upload_file/upload_file/621303.jpg',
        ac221CfrmDt: '20230601',
        ac125DeptNm: '상동지국',
        ac125DeptCd: 'KH210',
        ac021EmpNm: '정민희',
        degNm: 'A-평일-14',
        amWrkCnt: '6',
        pmWrkCnt: '8',
        ac025EmpOr: '110',
        locaraTno: '032',
        exnoEncr: '504',
        idvTno: '1127',
        cralLocaraTno: '010',
        mexnoEncr: '9182',
        cralIdvTno: '9915',
        isjmcdNm: '엔지니어',
        ac146VstCycl: '월화수목금토',
        vstPos: '방문가능',
        ac146TtbUse: 'Y',
        ac146UaUse: 'Y',
        ac146LocalGb: 'A073',
        ac146Sat13WrkYn: 'N',
        co160OffdayGb: 'N',
        co160Days: '5',
        ac112AdmCd: '11',
        instCnt: '3',
        bsCnt: '1',
        asCnt: '2',
        twrkCnt: '1',
        ac021EmpNm1: '박정민',
        sjHp1: '010',
        sjHp2: '8523',
        sjHp3: '7828',
      },
      assignTimeDvos: [
        {
          tm: '090000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '1',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '091000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '2',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '092000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '3',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '093000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '4',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '094000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '5',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '095000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '6',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '100000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '7',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '101000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '8',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '102000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '9',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '103000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '10',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '104000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '11',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '105000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '12',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '110000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '13',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '111000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '14',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '112000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '15',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '113000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '16',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '114000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '17',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '115000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '18',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '120000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '19',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '121000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '20',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '122000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '21',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '123000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '22',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '124000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '23',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '125000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '24',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '130000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '25',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '131000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '26',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '132000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '27',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '133000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '28',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '134000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '29',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '135000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '30',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '140000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '31',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '141000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '32',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '142000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '33',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '143000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '34',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '144000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '35',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '145000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '36',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '150000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '37',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '151000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '38',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '152000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '39',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '153000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '40',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '154000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '41',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '155000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '42',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '160000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '43',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '161000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '44',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '162000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '45',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '163000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '46',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '164000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '47',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '165000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '48',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '170000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '49',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '171000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '50',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '172000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '51',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '173000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '52',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '174000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '53',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '175000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '54',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
        {
          tm: '180000',
          wrkCnt: '0',
          wrkTCnt: '0',
          wrkCCnt: '0',
          wrkTRn: '0',
          wrkNextChk: '-1',
          wrkNextChk2: '-1',
          wrkChk2: 'N',
          wrkChk1Rn: '55',
          empTWrkCnt: '0',
          twrkCnt: '1',
        },
      ],
      days: [
        {
          baseY: '2023',
          baseMm: '05',
          baseD: '28',
          dowDvCd: '1',
          dfYn: 'Y',
          phldYn: 'Y',
        },
        {
          baseY: '2023',
          baseMm: '05',
          baseD: '29',
          dowDvCd: '2',
          dfYn: 'Y',
          rmkCn: '대체공휴',
        },
        {
          baseY: '2023',
          baseMm: '05',
          baseD: '30',
          dowDvCd: '3',
        },
        {
          baseY: '2023',
          baseMm: '05',
          baseD: '31',
          dowDvCd: '4',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '01',
          dowDvCd: '5',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '02',
          dowDvCd: '6',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '03',
          dowDvCd: '7',
          dfYn: 'Y',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '04',
          dowDvCd: '1',
          dfYn: 'Y',
          phldYn: 'Y',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '05',
          dowDvCd: '2',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '06',
          dowDvCd: '3',
          dfYn: 'Y',
          phldYn: 'Y',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '07',
          dowDvCd: '4',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '08',
          dowDvCd: '5',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '09',
          dowDvCd: '6',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '10',
          dowDvCd: '7',
          dfYn: 'Y',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '11',
          dowDvCd: '1',
          dfYn: 'Y',
          phldYn: 'Y',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '12',
          dowDvCd: '2',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '13',
          dowDvCd: '3',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '14',
          dowDvCd: '4',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '15',
          dowDvCd: '5',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '16',
          dowDvCd: '6',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '17',
          dowDvCd: '7',
          dfYn: 'Y',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '18',
          dowDvCd: '1',
          dfYn: 'Y',
          phldYn: 'Y',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '19',
          dowDvCd: '2',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '20',
          dowDvCd: '3',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '21',
          dowDvCd: '4',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '22',
          dowDvCd: '5',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '23',
          dowDvCd: '6',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '24',
          dowDvCd: '7',
          dfYn: 'Y',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '25',
          dowDvCd: '1',
          dfYn: 'Y',
          phldYn: 'Y',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '26',
          dowDvCd: '2',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '27',
          dowDvCd: '3',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '28',
          dowDvCd: '4',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '29',
          dowDvCd: '5',
        },
        {
          baseY: '2023',
          baseMm: '06',
          baseD: '30',
          dowDvCd: '6',
        },
        {
          baseY: '2023',
          baseMm: '07',
          baseD: '01',
          dowDvCd: '7',
          dfYn: 'Y',
        },
      ],
      arrSm: [],
      arrAm: [
        {
          time: '09:00',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '09:10',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '09:20',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '09:30',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '09:40',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '09:50',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '10:00',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '10:10',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '10:20',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '10:30',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '10:40',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '10:50',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '11:00',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '11:10',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '11:20',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '11:30',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '11:40',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '11:50',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '12:00',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '12:10',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '12:20',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '12:30',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '12:40',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '12:50',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '13:00',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '13:10',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '13:20',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '13:30',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '13:40',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '13:50',
          cnt: '0',
          ablYn: 'N',
        },
      ],
      arrPm1: [
        {
          time: '14:00',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '14:10',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '14:20',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '14:30',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '14:40',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '14:50',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '15:00',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '15:10',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '15:20',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '15:30',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '15:40',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '15:50',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '16:00',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '16:10',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '16:20',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '16:30',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '16:40',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '16:50',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '17:00',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '17:10',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '17:20',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '17:30',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '17:40',
          cnt: '0',
          ablYn: 'N',
        },
        {
          time: '17:50',
          cnt: '0',
          ablYn: 'N',
        },
      ],
      arrPm2: [
        {
          time: '18:00',
          cnt: '0',
          ablYn: 'N',
        },
      ],
      arrNt: [],
    },
  }; */

  // 모종여부(from query selectProduct)
  sidingYn.value = res.data.sidingYn;
  spayYn.value = res.data.spayYn;

  sidingDayDvos.value = res.data.sidingDayDvos; // list2
  disableDayDvos.value = res.data.disableDayDvos; // diabledays
  psicDataDvos.value = res.data.psicDataDvos; // left_info
  assignTimeDvos.value = res.data.assignTimeDvos; // list1

  // console.log(JSON.stringify(res.data));

  // console.log('dowDvCd: ', res.data.dowDvCd);
  // console.log('svBizDclsfCd: ', res.data.svBizDclsfCd);
  // console.log('inflwChnl: ', res.data.inflwChnl);
  // console.log('chnlDvCd: ', res.data.chnlDvCd);
  // console.log('svDvCd: ', res.data.svDvCd);
  // console.log('cntrNo: ', res.data.cntrNo);
  // console.log('cntrSn: ', res.data.cntrSn);
  // console.log('sellDate: ', res.data.sellDate);
  // console.log('empId: ', res.data.empId);
  // console.log('offDays: ', res.data.offDays);
  // console.log('curDateTimeString: ', res.data.curDateTimeString);
  // console.log('wrkDt: ', res.data.wrkDt);
  // console.log('dataStatCd: ', res.data.dataStatCd);
  // console.log('basePdCd: ', res.data.basePdCd);
  // console.log('lcst09: ', res.data.lcst09);
  // console.log('newAdrZip: ', res.data.newAdrZip);
  // console.log('userId: ', res.data.userId);
  // console.log('sowDay: ', res.data.sowDay);
  // console.log('returnurl: ', res.data.returnurl);
  // console.log('mkCo: ', res.data.mkCo);

  // console.log('sidingDayDvos: ', sidingDayDvos.value);
  // console.log('disableDayDvos: ', disableDayDvos.value);
  // console.log('psicDataDvos: ', psicDataDvos.value);
  // console.log('assignTimeDvos: ', assignTimeDvos.value);
  // console.log('offDays: ', res.data.offDays);

  // console.log('arrSm: ', res.data.arrSm);
  // console.log('arrAm: ', res.data.arrAm);
  // console.log('arrPm1: ', res.data.arrPm1);
  // console.log('arrPm2: ', res.data.arrPm2);
  // console.log('arrNt: ', res.data.arrNt);

  // -----------------------------------------------------------------------------------------------
  // const satWrkYn = res.data.psicDataDvos.ac146Sat13WrkYn;
  // const offDayGb = res.data.psicDataDvos.co160OffdayGb;
  // const coDays = res.data.psicDataDvos.co160Days;
  // const admCd = res.data.psicDataDvos.ac112AdmCd;
  // const hpNum = res.data.psicDataDvos.hp;
  // const sjHpNum = res.data.psicDataDvos.sjHp1 + res.data.psicDataDvos.sjHp2 + res.data.psicDataDvos.sjHp3;
  // -----------------------------------------------------------------------------------------------
  // const ttbUse = res.data.psicDataDvos.ac146TtbUse;
  // const uaUse = res.data.psicDataDvos.ac146UaUse;
  // const { vstPos } = res.data.psicDataDvos;
  // const empOr = res.data.psicDataDvos.ac025EmpOr;
  // const amWrkCnt = 0;
  // const pmWrkCnt = 0;
  // const amAbleCnt = res.data.psicDataDvos.amWrkCnt;
  // const pmAbleCnt = res.data.psicDataDvos.pmWrkCnt;
  // const wrkCnt = res.data.psicDataDvos.tWrkCnt;
  // console.log('ttbUse: ', ttbUse);
  // console.log('uaUse: ', uaUse);
  // console.log('vstPos: ', vstPos);
  // console.log('empOr: ', empOr);
  // console.log('amWrkCnt: ', amWrkCnt);
  // console.log('pmWrkCnt: ', pmWrkCnt);
  // console.log('amAbleCnt: ', amAbleCnt);
  // console.log('pmAbleCnt: ', pmAbleCnt);
  // console.log('wrkCnt: ', wrkCnt);
  // -----------------------------------------------------------------------------------------------

  // 모종이라면
  if (sidingYn === 'Y') {
    // list2
    ableDays.value = sidingDayDvos.value.map((item) => ({
      ablDays: item.ablDays,
    }));
    disableDays.value = disableDayDvos.value.map((item) => ({
      disableDays: item.disableDays,
    }));
  } else {
    ableDays.value = disableDayDvos.value.map((item) => ({
      disableDays: item.disableDays,
    }));
    timeConstMsg.value = disableDayDvos.value.map((item) => ({
      tcMsg: item.tcMsg,
    }));
  }

  // console.log('ableDays: ', JSON.stringify(ableDays.value));
  // console.log('disableDays: ', JSON.stringify(disableDays.value));
  // console.log('timeConstMsg: ', JSON.stringify(timeConstMsg.value));

  schedules.value = res.data.days;
  scheduleInfo.value.weekCnt = schedules.value.length / scheduleInfo.value.dayCnt;
  // console.log('schedules.value: ', schedules.value);
  // console.log('schedules.value.length: ', schedules.value.length);
  // console.log('scheduleInfo.value.weekCnt: ', scheduleInfo.value.weekCnt);
  // console.log('scheduleInfo.value.dayCnt: ', scheduleInfo.value.dayCnt);
}

function getYmdText(dayCnt) {
  return schedules.value[dayCnt - 1]?.baseY
    .concat(schedules.value[dayCnt - 1]?.baseMm)
    .concat(schedules.value[dayCnt - 1]?.baseD);
}

function isHoliday(dayCnt) {
  return schedules.value[dayCnt - 1]?.dfYn === 'Y' || schedules.value[dayCnt - 1]?.phldYn === 'Y';
}

function isAble(dayCnt, isNotifyMessage) {
  // if (searchParams.value.chnlDvCd === 'K' // KSS
  //   || searchParams.value.chnlDvCd === 'I' // 엔지니어
  //   || searchParams.value.chnlDvCd === 'E' //  엔지니어
  //   || searchParams.value.chnlDvCd === 'M' //  매니저
  // ) {

  const date = getYmdText(dayCnt);

  if (sidingYn === 'Y') {
    console.log('isAble > ableAllTheseDays', date);
  } else if (searchParams.value.svDvCd === '4') {
    console.log('isAble > homecareAllTheseDays', date);
  } else {
    console.log('isAble > disableAllTheseDays', date);

    if (isNotifyMessage) notify('!');
    return true;
  }
  return true;
}

function isOpacity(dayCnt) {
  const checkAble = isAble(dayCnt, false);
  if (!checkAble) {
    console.log('isOpacity > checkAble');
    return !checkAble;
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

  // console.log(`weekIdx= ${weekIdx}`, `dayIdx=${dayIdx}`);
  // console.log(isOpacity(dayCnt));
  // console.log(isToday(dayCnt));
  // console.log(isHoliday(dayCnt));
  // console.log(getYmdText(dayCnt));
  // console.log(`chnlDvCd(gbCd)=${searchParams.value.chnlDvCd}`);
  // console.log(`svDvCd(dataGb or wrkGb)=${searchParams.value.svDvCd}`);
  // console.log(`today=${today}`);
  // console.log(`selected Day=${selectedDay.value}`);
  // console.log(`searchParams.value.cntrNo=${searchParams.value.cntrNo}`);
  // console.log(`searchParams.value.sellDate=${searchParams.value.sellDate}`);

  if (((searchParams.value.chnlDvCd === 'W' || searchParams.value.chnlDvCd === 'P') && selectedDay.value
  === today) || (searchParams.value.chnlDvCd === 'K' && searchParams.value.svDvCd === '1'
  && selectedDay.value === today)) {
    notify('당일날짜는 선택불가 합니다');
    return;
  }

  if (selectedDay.value < today) {
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

  // 선택 불가
  if (!isAble(dayCnt, true)) {
    return;
  }

  // 선택 시 active 처리
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

// console.log(onClickCalendar);
// console.log(isHoliday);
// console.log(isOpacity);
// console.log(isToday);
// console.log(getDayCnt);
// console.log(getDayText);

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
