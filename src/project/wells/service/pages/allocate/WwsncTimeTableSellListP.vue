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
                방문요일 : 월화수목금토
              </li>
            </ul>
          </h3>
          <div class="border-box mt20 px35 py0 row justify-center">
            <!--            <kw-date
              class="reservation-datepicker"
              style="width: 268px; height: 295px;"
            />-->
            <!--######################## 달력 #########################-->
            <table class="calendar">
              <colgroup>
                <col
                  v-for="i in [0, 1, 2, 3, 4, 5, 6]"
                  :key="i"
                >
              </colgroup>

              <tr class="calendar-days">
                <th class="kw-fc--accent">
                  {{ $t('MSG_TXT_SUN' /*일*/) }}
                </th>
                <th>{{ $t('MSG_TXT_MON' /*월*/) }}</th>
                <th>{{ $t('MSG_TXT_TUE_ABB'/*화*/) }}</th>
                <th>{{ $t('MSG_TXT_WED_ABB'/*수*/) }}</th>
                <th>{{ $t('MSG_TXT_THU_ABB'/*목*/) }}</th>
                <th>{{ $t('MSG_TXT_FRI_ABB'/*금*/) }}</th>
                <th>{{ $t('MSG_TXT_SAT_ABB'/*토*/) }}</th>
              </tr>
              <tr
                v-for="weekIdx of scheduleInfo.weekCnt"
                :key="weekIdx"
                class="calendar-date"
              >
                <td
                  v-for="dayIdx of scheduleInfo.dayCnt"
                  :key="weekIdx * 0 + dayIdx"
                  @click="onClickCalendar($event)"
                >
                  <span
                    :class="{ 'calendar-inactive-date': /*비활성화*/ isOpacity(getDayCnt(weekIdx, dayIdx)),
                              'calendar-current-date': /*오늘*/isToday(getDayCnt(weekIdx, dayIdx)),
                              'holiday': /*휴일*/isHoliday(getDayCnt(weekIdx, dayIdx)) }"
                  >
                    {{ getDayText(getDayCnt(weekIdx, dayIdx)) }}
                  </span>
                </td>
              </tr>
            </table>
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
                    김교원
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
                    하남지점
                  </p>
                  <div class="row items-center">
                    <p class="kw-font--14">
                      010-1234-5678
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
                      032-1234-5678
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
                  src="node_modules/kw-lib/src/assets/images/example_profile.png"
                >
              </kw-avatar>
            </div>

            <kw-separator />
            <div class="row">
              <div class="col">
                <div class="row items-center">
                  <h3>
                    박교원
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
                      010-1234-5678
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
              B-평일-12
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
                0
              </p>
            </li>
            <li class="kw-state-list__item">
              <p class="kw-state-list__top">
                A/S
              </p>
              <p class="kw-state-list__num">
                0
              </p>
            </li>
            <li class="kw-state-list__item">
              <p class="kw-state-list__top">
                A/S
              </p>
              <p class="kw-state-list__num">
                0
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
// import { useDataService/* , useModal, alert */ } from 'kw-lib';
import dayjs from 'dayjs';
// import { cloneDeep } from 'lodash-es';
// const dataService = useDataService();

// const DATE_FORMAT_YM = 'YYYYMM';
const DATE_FORMAT_YMD = 'YYYYMMDD';

const props = defineProps({
  baseYm: { type: String, default: '' },
  chnlDvCd: { type: String, default: '' },
  svDvCd: { type: String, default: '' },
  sellDate: { type: String, default: '' },
  svBizDclsfCd: { type: String, default: '' },
  inGb: { type: String, default: '' },
  basePdCd: { type: String, default: '' },
  wrkDt: { type: String, default: '' },
  dataStatCd: { type: String, default: '' },
  returnUrl: { type: String, default: '' },
  userId: { type: String, default: '' },
  mkCo: { type: String, default: '' },
  cntrNo: { type: String, default: '' },
  cntrSn: { type: String, default: '' },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const schedules = ref([]);
const scheduleInfo = ref({
  weekCnt: 0,
  dayCnt: 7,
});

const searchParams = ref({
  baseYm: props.baseYm,
  chnlDvCd: props.chnlDvCd,
  svDvCd: props.svDvCd,
  sellDate: props.sellDate,
  svBizDclsfCd: props.svBizDclsfCd,
  inGb: props.inGb,
  basePdCd: props.basePdCd,
  wrkDt: props.wrkDt,
  dataStatCd: props.dataStatCd,
  returnUrl: props.returnUrl,
  userId: props.userId,
  mkCo: props.mkCo,
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
});

// let cachedParams;
async function getTimeTables() {
  /* cachedParams = cloneDeep(searchParams.value);
  const res1 = await dataService.get('/sms/wells/service/time-tables/sales', { params:
   { ...cachedParams,
   } }); */

  const res = {
    data: {
      dowDvCd: null,
      svBizDclsfCd: '1110',
      inGb: '1',
      chnlDvCd: 'K',
      svDvCd: null,
      cntrNo: 'W20220137399',
      cntrSn: '1',
      sellDate: '20230601',
      empId: null,
      curDateTimeString: '20230613',
      wrkDt: null,
      dataStatCd: '1',
      basePdCd: 'WP01120367',
      lcst09: null,
      newAdrZip: '07333',
      userId: '27536',
      sowDay: null,
      returnurl: null,
      mkCo: null,
      // left_info
      offDays: [
        '2023041727536', '2023042127536', '2023042227536', '2023042627536', '2023042727536',
        '2023042827536', '2023042927536', '2023043027536', '2023050127536', '2023051827536',
        '2023052927536', '2023061827536', '2023062827536', '2023070927536', '2023072427536',
        '2023082027536', '2023082127536', '2023091327536', '2023091427536', '2023101127536',
        '2023102227536', '2023110227536', '2023110327536', '2023111927536', '2023120427536',
        '2023122027536', '2023122827536', '2023010727536', '2023012227536', '2023020527536',
        '2023021127536', '2023021927536', '2023031427536', '2023032527536', '2023040827536',
        '2023042327536', '2023051127536', '2023053027536', '2023060727536', '2023062527536',
      ],
      psicDataDvos: [
        {
          ac021EmpId: '621303',
          ac021EmpNm: '정민희',
          ac025EmpOr: '110',
          ac112AdmCd: '11',
          ac125DeptCd: 'KH210',
          ac125DeptNm: '상동지국',
          ac146LocalGb: 'A073',
          ac146Sat13WrkYn: 'N',
          ac146TtbUse: 'Y',
          ac146UaUse: 'Y',
          ac146VstCycl: '월화수목금토',
          ac221CfrmDt: '20230601',
          amWrkCnt: '6',
          asCnt: '0',
          bsCnt: '0',
          co160Days: '5',
          co160OffdayGb: 'N',
          cralIdvTno: '9915',
          cralLocaraTno: '010',
          degNm: 'A-평일-14',
          empPic: 'http://kiwi-m.kyowon.co.kr/KIWI-M/upload_file/upload_file/621303.jpg',
          exnoEncr: '05yOz0YKOjie7oAp3ng5aw==',
          idvTno: '1127',
          instCnt: '0',
          iscgubNm: null,
          isjmcdNm: '엔지니어',
          locaraTno: '032',
          mexnoEncr: '9182',
          pmWrkCnt: '8',
          sjHp1: null,
          sjHp2: null,
          sjHp3: null,
          twrkCnt: '1',
          vstPos: '방문가능',
        },
      ],
      assignTimeDvos: [
        { vstDt: null, empId: null, tm: '090000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '1', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '091000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '2', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '092000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '3', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '093000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '4', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '094000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '5', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '095000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '6', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '100000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '7', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '101000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '8', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '102000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '9', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '103000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '10', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '104000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '11', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '105000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '12', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '110000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '13', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '111000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '14', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '112000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '15', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '113000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '16', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '114000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '17', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '115000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '18', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '120000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '19', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '121000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '20', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '122000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '21', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '123000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '22', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '124000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '23', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '125000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '24', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '130000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '25', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '131000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '26', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '132000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '27', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '133000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '28', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '134000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '29', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '135000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '30', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '140000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '31', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '141000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '32', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '142000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '33', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '143000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '34', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '144000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '35', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '145000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '36', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '150000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '37', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '151000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '38', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '152000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '39', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '153000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '40', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '154000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '41', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '155000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '42', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '160000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '43', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '161000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '44', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '162000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '45', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '163000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '46', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '164000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '47', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '165000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '48', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '170000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '49', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '171000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '50', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '172000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '51', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '173000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '52', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '174000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '53', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '175000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '54', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
        { vstDt: null, empId: null, tm: '180000', wrkCnt: 0, wrkTCnt: 0, wrkCCnt: 0, wrkTChk: null, wrkTRn: 0, wrkNextChk: -1, wrkNextChk2: -1, wrkChk2: 'N', wrkChk1Rn: '55', empTWrkCnt: 0, degWrkCnt: null, twrkCnt: 1 },
      ],
      // list2
      disableDayDvos: [
        { disableDay: '2023-10-1', disableFulday: '2023-10-01', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-10-15', disableFulday: '2023-10-15', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-10-22', disableFulday: '2023-10-22', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-10-29', disableFulday: '2023-10-29', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-10-3', disableFulday: '2023-10-03', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-10-8', disableFulday: '2023-10-08', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-10-9', disableFulday: '2023-10-09', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-11-12', disableFulday: '2023-11-12', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-11-19', disableFulday: '2023-11-19', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-11-26', disableFulday: '2023-11-26', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-11-5', disableFulday: '2023-11-05', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-12-10', disableFulday: '2023-12-10', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-12-3', disableFulday: '2023-12-03', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-6-18', disableFulday: '2023-06-18', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-6-25', disableFulday: '2023-06-25', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-7-16', disableFulday: '2023-07-16', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-7-2', disableFulday: '2023-07-02', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-7-23', disableFulday: '2023-07-23', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-7-30', disableFulday: '2023-07-30', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-7-9', disableFulday: '2023-07-09', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-8-13', disableFulday: '2023-08-13', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-8-15', disableFulday: '2023-08-15', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-8-20', disableFulday: '2023-08-20', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-8-27', disableFulday: '2023-08-27', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-8-6', disableFulday: '2023-08-06', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-9-10', disableFulday: '2023-09-10', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-9-17', disableFulday: '2023-09-17', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-9-24', disableFulday: '2023-09-24', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-9-28', disableFulday: '2023-09-28', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-9-29', disableFulday: '2023-09-29', tcMsg: '법정휴무일 또는 회사휴무' },
        { disableDay: '2023-9-3', disableFulday: '2023-09-03', tcMsg: '법정휴무일 또는 회사휴무' },
      ],
      arrSm: [],
      arrAm: [
        { time: '09:00', cnt: '0', ablYn: 'N' },
        { time: '09:10', cnt: '0', ablYn: 'N' },
        { time: '09:20', cnt: '0', ablYn: 'N' },
        { time: '09:30', cnt: '0', ablYn: 'N' },
        { time: '09:40', cnt: '0', ablYn: 'N' },
        { time: '09:50', cnt: '0', ablYn: 'N' },
        { time: '10:00', cnt: '0', ablYn: 'N' },
        { time: '10:10', cnt: '0', ablYn: 'N' },
        { time: '10:20', cnt: '0', ablYn: 'N' },
        { time: '10:30', cnt: '0', ablYn: 'N' },
        { time: '10:40', cnt: '0', ablYn: 'N' },
        { time: '10:50', cnt: '0', ablYn: 'N' },
        { time: '11:00', cnt: '0', ablYn: 'N' },
        { time: '11:10', cnt: '0', ablYn: 'N' },
        { time: '11:20', cnt: '0', ablYn: 'N' },
        { time: '11:30', cnt: '0', ablYn: 'N' },
        { time: '11:40', cnt: '0', ablYn: 'N' },
        { time: '11:50', cnt: '0', ablYn: 'N' },
        { time: '12:00', cnt: '0', ablYn: 'N' },
        { time: '12:10', cnt: '0', ablYn: 'N' },
        { time: '12:20', cnt: '0', ablYn: 'N' },
        { time: '12:30', cnt: '0', ablYn: 'N' },
        { time: '12:40', cnt: '0', ablYn: 'N' },
        { time: '12:50', cnt: '0', ablYn: 'N' },
        { time: '13:00', cnt: '0', ablYn: 'N' },
        { time: '13:10', cnt: '0', ablYn: 'N' },
        { time: '13:20', cnt: '0', ablYn: 'N' },
        { time: '13:30', cnt: '0', ablYn: 'N' },
        { time: '13:40', cnt: '0', ablYn: 'N' },
        { time: '13:50', cnt: '0', ablYn: 'N' },
      ],
      arrPm1: [
        { time: '14:00', cnt: '0', ablYn: 'N' },
        { time: '14:10', cnt: '0', ablYn: 'N' },
        { time: '14:20', cnt: '0', ablYn: 'N' },
        { time: '14:30', cnt: '0', ablYn: 'N' },
        { time: '14:40', cnt: '0', ablYn: 'N' },
        { time: '14:50', cnt: '0', ablYn: 'N' },
        { time: '15:00', cnt: '0', ablYn: 'N' },
        { time: '15:10', cnt: '0', ablYn: 'N' },
        { time: '15:20', cnt: '0', ablYn: 'N' },
        { time: '15:30', cnt: '0', ablYn: 'N' },
        { time: '15:40', cnt: '0', ablYn: 'N' },
        { time: '15:50', cnt: '0', ablYn: 'N' },
        { time: '16:00', cnt: '0', ablYn: 'N' },
        { time: '16:10', cnt: '0', ablYn: 'N' },
        { time: '16:20', cnt: '0', ablYn: 'N' },
        { time: '16:30', cnt: '0', ablYn: 'N' },
        { time: '16:40', cnt: '0', ablYn: 'N' },
        { time: '16:50', cnt: '0', ablYn: 'N' },
        { time: '17:00', cnt: '0', ablYn: 'N' },
        { time: '17:10', cnt: '0', ablYn: 'N' },
        { time: '17:20', cnt: '0', ablYn: 'N' },
        { time: '17:30', cnt: '0', ablYn: 'N' },
        { time: '17:40', cnt: '0', ablYn: 'N' },
        { time: '17:50', cnt: '0', ablYn: 'N' },
      ],
      arrPm2: [
        { time: '18:00', cnt: '0', ablYn: 'N' },
      ],
    },
  };

  console.log(res.data);
  console.log('dowDvCd: ', res.data.dowDvCd);
  console.log('svBizDclsfCd: ', res.data.svBizDclsfCd);
  console.log('inGb: ', res.data.inGb);
  console.log('chnlDvCd: ', res.data.chnlDvCd);
  console.log('svDvCd: ', res.data.svDvCd);
  console.log('cntrNo: ', res.data.cntrNo);
  console.log('cntrSn: ', res.data.cntrSn);
  console.log('sellDate: ', res.data.sellDate);
  console.log('empId: ', res.data.empId);
  console.log('offDays: ', res.data.offDays);
  console.log('curDateTimeString: ', res.data.curDateTimeString);
  console.log('wrkDt: ', res.data.wrkDt);
  console.log('dataStatCd: ', res.data.dataStatCd);
  console.log('basePdCd: ', res.data.basePdCd);
  console.log('lcst09: ', res.data.lcst09);
  console.log('newAdrZip: ', res.data.newAdrZip);
  console.log('userId: ', res.data.userId);
  console.log('sowDay: ', res.data.sowDay);
  console.log('returnurl: ', res.data.returnurl);
  console.log('mkCo: ', res.data.mkCo);

  console.log('sidingDayDvos: ', res.data.sidingDayDvos);
  console.log('disableDayDvos: ', res.data.disableDayDvos);
  console.log('psicDataDvos: ', res.data.psicDataDvos);
  console.log('assignTimeDvos: ', res.data.assignTimeDvos);
  console.log('offDays: ', res.data.offDays);

  console.log('arrSm: ', res.data.arrSm);
  console.log('arrAm: ', res.data.arrAm);
  console.log('arrPm1: ', res.data.arrPm1);
  console.log('arrPm2: ', res.data.arrPm2);
  console.log('arrNt: ', res.data.arrNt);

  schedules.value = res.data;
  // scheduleInfo.value.weekCnt = schedules.value.length / scheduleInfo.value.dayCnt;
}

function onClickCalendar($event) {
  document.querySelectorAll('tr.calendar-date > td > span').forEach((element) => {
    element.classList.remove('calendar-selected-date');
  });
  $event.target.classList.toggle('calendar-selected-date');
}

function isHoliday(dayCnt) {
  return schedules.value[dayCnt - 1]?.dfYn === 'Y' || schedules.value[dayCnt - 1]?.phldYn === 'Y';
}

function isOpacity(dayCnt) {
  return !(schedules.value[dayCnt - 1]?.baseMm === searchParams.value.baseYm.substring(4));
}

function isToday(dayCnt) {
  if (!schedules.value[dayCnt - 1]) return false;
  const { baseY, baseMm, baseD } = schedules.value[dayCnt - 1];
  return `${baseY}${baseMm}${baseD}` === dayjs().format(DATE_FORMAT_YMD);
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
