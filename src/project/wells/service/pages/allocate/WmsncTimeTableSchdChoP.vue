<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [WSNC] allocate(배정관리)
2. 프로그램 ID : WmsncTimeTableSchdChoP - 타임테이블 일정선택
3. 작성자 : gs.piit122 김동엽
4. 작성일 : 2023-06-26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- W-MP-U-0186P01
- 고객 약속변경, 신규방문을 위한 일정 선택 시 방문할 일자를 선택한다.
****************************************************************************************************
-->
<template>
  <kw-popup>
    <div class="px20 pt20">
      <div class="row full-width justify-center items-center">
        <kw-btn
          borderless
          class="kw-font-pt24"
          icon="arrow_left_24"
          :v-show="
            (data.chnlDvCd !== 'S' && data.svDvCd !== '3') ||
              (data.svBizDclsfCd === '4130' || data.svDvCd === '3' /*3:A/S*/) "
          @click="onClickPrevMonth"
        />
        <p class="text-weight-bold mx20 row justify-between kw-font-pt18 w106">
          <span>{{ searchParams.baseYm.substring(0, 4) }}{{ $t('MSG_TXT_YEAR' /*년*/)
          }}&nbsp;</span>
          <span>{{ searchParams.baseYm.substring(4) }}{{ $t('MSG_TXT_MON' /*월*/) }}</span>
        </p>
        <kw-btn
          borderless
          class="kw-font-pt24"
          icon="arrow_right_24"
          :v-show="
            (data.chnlDvCd !== 'S' && data.svDvCd !== '3') ||
              (data.svBizDclsfCd === '4130' /*4130:환경점검*/ || data.svDvCd === '3' ) "
          @click="onClickNextMonth"
        />
      </div>
      <div class="row full-width justify-center items-center">
        <table class="calendar">
          <colgroup>
            <col
              width="14.3%"
            >
            <col
              width="14.3%"
            >
            <col
              width="14.3%"
            >
            <col
              width="14.3%"
            >
            <col
              width="14.3%"
            >
            <col
              width="14.3%"
            >
            <col
              width="14.3%"
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
              :data-date="getYmdText(getDayCnt(weekIdx, dayIdx))"

              @click="onClickCalendar($event, weekIdx, dayIdx)"
            >
              <span
                style="cursor: pointer;"
                :class="{ 'calendar-inactive-date': /*비활성화*/ isOpacity(getDayCnt(weekIdx, dayIdx)),
                          'calendar-current-date': /*오늘*/isToday(getDayCnt(weekIdx, dayIdx)),
                }"
              >{{ getDayText(getDayCnt(weekIdx, dayIdx)) }}</span><br>
              <!--<span
                :class="{'calendar-info-mark calendar-info-mark&#45;&#45;blue' :
                getSumCnt(getDayCnt(weekIdx, dayIdx)) > 0}"
              >{{ getSumCnt(getDayCnt(weekIdx, dayIdx)) }}</span>-->
            </td>
          </tr>
        </table>
      </div>
      <!--      <div
        class="row full-width justify-center items-center"
      >
        {{ data.sidingYn === 'Y' ? "모종 / 배정" : "" }}
      </div>-->
    </div>

    <template #action>
      <kw-btn
        label="취소"
        negative
        @click="onClickCancel"
      />
      <kw-btn
        v-show="isShowButton()"
        label="다음"
        primary
        @click="next()"
      />
      <kw-btn
        v-show="!isShowButton()"
        label="선택"
        primary
        @click="ok(data.sellDate)"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { cloneDeep, toInteger } from 'lodash-es';
import { notify, useDataService, useModal } from 'kw-lib';

// eslint-disable-next-line no-unused-vars
const { t } = useI18n();
// eslint-disable-next-line no-unused-vars
const { ok, cancel } = useModal();
const dataService = useDataService();
const DATE_FORMAT_YM = 'YYYYMM';
const DATE_FORMAT_YMD = 'YYYYMMDD';
const props = defineProps({
  baseYm: { type: String, default: dayjs().format('YYYYMM') },
  cntrNo: { type: String, default: '' },
  cntrSn: { type: String, default: '' },
  chnlDvCd: { type: String, default: '' },
  sellDate: { type: String, default: '' },
  svDvCd: { type: String, default: '' },
  svBizDclsfCd: { type: String, default: '' },
  prtnrNo: { type: String, default: '' },
  ordDt: { type: String, default: '' },
  ordSeq: { type: String, default: '' },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = ref({});
new Map(Object.entries(props)).forEach((item, field) => {
  searchParams.value[field] = item;
});

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
  sidingYn: '',
  spayYn: '',
  sidingDays: [],
  disableDays: [],
  days: [],
  seq: '',
  cstSvAsnNo: '',
  prtnrNo: '',
  ogTpCd: '',
});

const schedules = ref([]);
const scheduleInfo = ref({
  weekCnt: 0,
  dayCnt: 7,
});
function getCurrentDate() {
  return dayjs(`${searchParams.value.baseYm}01`).format(DATE_FORMAT_YM);
}
function enableAllTheseDays(inDate, isNotifyMessage) {
  // 모종 가능할 일자 중에
  if (data.value.sidingDays.find((item) => item.ablDays.replace(/-/g, '') === inDate)) {
    // 엔지니어 배정 불가능한 날짜이면
    if (data.value.disableDays.find((item) => item.disableFuldays.replace(/-/g, '') === inDate)) {
      if (isNotifyMessage) notify('접수제한');
      return 'N';
    }
    return 'Y';
  }
  return 'N';
}
function disableAllTheseDays(inDate, isNotifyMessage) {
  const isFind = data.value.disableDays.find((item) => item.disableFuldays.replace(/-/g, '')
    === inDate);
  if (isFind) {
    const message = isFind.tcMsg;
    if (isNotifyMessage) notify(message, message);
    return 'N';
  }
  return 'Y';
}
function getYmdText(dayCnt) {
  return schedules.value[dayCnt - 1]?.baseY
    .concat(schedules.value[dayCnt - 1]?.baseMm)
    .concat(schedules.value[dayCnt - 1]?.baseD);
}
function getDayCnt(weekIdx, dayIdx) {
  return ((weekIdx - 1) * scheduleInfo.value.dayCnt) + dayIdx;
}
function getDayText(dayCnt) {
  return `${toInteger(schedules.value[dayCnt - 1]?.baseD)}`;
}
function isToday(dayCnt) {
  if (!schedules.value[dayCnt - 1]) return false;
  const { baseY, baseMm, baseD } = schedules.value[dayCnt - 1];
  return `${baseY}${baseMm}${baseD}` === dayjs().format(DATE_FORMAT_YMD);
}
function isEnable(dayCnt, isNotifyMessage) {
  const pointedDate = getYmdText(dayCnt).replace(/-/g, '');
  if (data.value.sidingYn === 'Y') {
    return enableAllTheseDays(pointedDate, isNotifyMessage);
  }
  return disableAllTheseDays(pointedDate, isNotifyMessage);
}
// eslint-disable-next-line no-unused-vars
function getSumCnt(dayCnt) {
  const pointedDate = getYmdText(dayCnt).replace(/-/g, '');
  const isFind = data.value.sidingDays.find((item) => item.ablDays.replace(/-/g, '')
    === pointedDate);
  if (isFind) {
    return isFind.sumCnt;
  }
  return 0;
}
function isOpacity(dayCnt) {
  const enable = isEnable(dayCnt, false);
  if (enable === 'N') {
    return true;
  }
  return !(schedules.value[dayCnt - 1]?.baseMm === searchParams.value.baseYm.substring(4));
}

let cachedParams;
async function getTimeTables() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/service/time-tables/schd-cho', { params: { ...cachedParams } });
  data.value = res.data;

  //------------------------------------------------------------------------------------------------
  // data.value.sidingYn = 'Y';
  // data.value.sidingDays = [
  //   { ablDays: '2023-06-17', sumCnt: '5', w3th: '20230617', sowDay: '20230617' },
  //   { ablDays: '2023-06-19', sumCnt: '5', w3th: '20230619', sowDay: '20230619' },
  //   { ablDays: '2023-06-20', sumCnt: '5', w3th: '20230620', sowDay: '20230620' },
  //   { ablDays: '2023-06-22', sumCnt: '5', w3th: '20230622', sowDay: '20230622' },
  //   { ablDays: '2023-06-23', sumCnt: '5', w3th: '20230623', sowDay: '20230623' },
  //   { ablDays: '2023-06-24', sumCnt: '5', w3th: '20230624', sowDay: '20230624' },
  //   { ablDays: '2023-06-29', sumCnt: '5', w3th: '20230627', sowDay: '20230627' },
  // ];
  // data.value.disableDays = [{ disableDays: null,
  //   disableFuldays: '2023-06-29',
  //   tcMsg:
  // '법정휴무일 또는 회사휴무' }];
  // data.value.disableDays = [];

  // data.value.sidingYn = 'Y';
  // data.value.chnlDvCd = 'M';
  // data.value.svDvCd = '2';

  //------------------------------------------------------------------------------------------------
  schedules.value = data.value.days;
  scheduleInfo.value.weekCnt = schedules.value.length / scheduleInfo.value.dayCnt;
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
async function onClickCalendar($event, weekIdx, dayIdx) {
  const dayCnt = getDayCnt(weekIdx, dayIdx);
  const selectedDay = getYmdText(dayCnt);

  if (data.value.chnlDvCd === 'M') {
  // 매니저
    if (toInteger(selectedDay) <= toInteger(dayjs().format('YYYYMMDD'))) {
      notify('날짜를 익일이후로 선택하여 주십시오');
      return;
    }
    if (data.value.disableDays) {
      const isFind = data.value.disableDays.find((item) => item.disableFuldays.replace(/-/g, '')
      === selectedDay);
      if (isFind) {
        notify(isFind.tcMsg);
        return;
      }
    }
  } else {
  // 매니저가 아니면

    if (toInteger(selectedDay) < toInteger(dayjs().format('YYYYMMDD'))) {
      notify('날짜를 오늘이후로 선택하여 주십시오');
      return;
    }

    if (data.value.chnlDvCd === 'S'
      && data.value.svBizDclsfCd !== '4130' /* 4130:환경점검 */
      && data.value.svDvCd !== '3' /* 3:A/S */
      && toInteger(dayjs().format('MM')) !== toInteger(dayjs(selectedDay).format('MM'))
    ) {
      notify('익월 선택이 불가합니다.');
      return;
    }

    if (data.value.disableDays) {
      const isFind = data.value.disableDays.find((item) => item.disableFuldays.replace(/-/g, '')
      === selectedDay);
      if (isFind) {
        notify(isFind.tcMsg);
        return;
      }
    }
  }

  data.value.sellDate = selectedDay;

  document.querySelectorAll('tr.calendar-date > td > span').forEach((element) => {
    element.classList.remove('calendar-selected-date');
  });
  $event.target.classList.toggle('calendar-selected-date');
}
async function onClickCancel() {
  cancel();
}
function isShowButton() {
  // true: 타임테이블 시간 선택으로 이동
  // false: 부모창에게 값 전달
  if (data.value.chnlDvCd === 'M') {
    return true; // 다음
  }
  if (data.value.sidingYn === 'Y') {
    if (data.value.svDvCd === '2') {
      return false; // 선택
    }
    return true; // 다음
  }
  if (data.value.chnlDvCd === 'S' || data.value.chnlDvCd === 'B') {
    return false;// 선택
  }
  return true; // 다음
}

function next() {
  notify('타임테이블 시간선택 이동');
}

onMounted(async () => {
  await getTimeTables();
});
</script>

<style lang="scss" scoped>
.calendar {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;

  &-days {
    border-bottom: 1px solid $line-bg;
    height: 33px;

    th {
      vertical-align: top;
      font-weight: 400;
      font-size: 14px;
      color: $black3;
    }
  }

  &-date {
    height: 86px;
    border-bottom: 1px solid $line-bg;

    &:last-of-type {
      border-bottom: none;
    }

    td {
      vertical-align: top;
      padding: 4px 6px;

      &:first-of-type > span {
        color: $error;
      }

      & > span {
        position: relative;
        display: inline-block;
        width: 28px;
        height: 28px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 16px;
        text-align: center;
        font-weight: 500;

        &.calendar-current-date::before,
        &.calendar-selected-date::before {
          content: "";
          position: absolute;
          width: 28px;
          height: 28px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 28px;
          z-index: -1;
        }

        &.calendar-current-date::before {
          background-color: #2f8af3;
          opacity: 0.1;
        }

        &.calendar-selected-date {
          color: #fff;
        }

        &.calendar-selected-date::before {
          background-color: $primary;
        }
      }
    }
  }

  &-inactive-date {
    opacity: 0.3;
  }

  &-info-mark {
    font-size: 14px;
    display: block;
    color: $black2;

    &::before {
      content: "";
      display: inline-block;
      vertical-align: 4px;
      margin-right: 4px;
      width: 4px;
      height: 4px;
      background: $accent;
    }

    &.calendar-info-mark--blue {
      &::before {
        background: $primary;
      }
    }
  }
}

.info-tags {
  display: flex;
  justify-content: flex-end;
  width: auto;
  color: $black3;

  &-title {
    margin-right: 12px;
    font-size: 14px;
    font-weight: normal;
    line-height: 1.43;

    &::before {
      content: "";
      display: inline-block;
      margin-right: 4px;
      width: 8px;
      height: 8px;
      vertical-align: 2px;
      background: $primary;
    }

    &:last-of-type {
      margin-right: 0;
    }

    &.info-tags-title-red {
      &::before {
        background: $accent;
      }
    }

    &.info-tags-title-light-blue {
      &::before {
        background: rgb(47 138 243 / 10%);
      }
    }
  }
}

</style>
