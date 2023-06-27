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
              :class="{ 'calendar-inactive-date': /*비활성화*/ isOpacity(getDayCnt(weekIdx, dayIdx)),
                        'calendar-current-date': /*오늘*/isToday(getDayCnt(weekIdx, dayIdx)),
                        '': /*휴일*/isHoliday(getDayCnt(weekIdx, dayIdx)),
              }"
              :data-date="getYmdText(getDayCnt(weekIdx, dayIdx))"

              @click="onClickCalendar($event, weekIdx, dayIdx)"
            >
              <span>{{ getDayText(getDayCnt(weekIdx, dayIdx)) }}</span>
            </td>
          </tr>
          <!--          <tr class="calendar-date">
            <td>
              <span>1</span>
            </td>
            <td>
              <span>2</span>
            </td>
            <td>
              <span>3</span>
            </td>
            <td>
              <span>4</span>
            </td>
            <td>
              <span>5</span>
            </td>
            <td>
              <span>6</span>
            </td>
            <td>
              &lt;!&ndash; 비활성화 시 class: calendar-inactive-date 추가 &ndash;&gt;
              <span class="calendar-inactive-date">7</span>
              &lt;!&ndash; // 비활성화 시 class: calendar-inactive-date 추가 &ndash;&gt;
            </td>
          </tr>
          <tr class="calendar-date">
            <td>
              <span class="calendar-inactive-date">8</span>
            </td>
            <td>
              <span>9</span>
            </td>
            <td>
              &lt;!&ndash; 오늘 날짜 class: calendar-current-date 추가 &ndash;&gt;
              <span class="calendar-current-date">10</span>
              &lt;!&ndash; // 오늘 날짜 class: calendar-current-date 추가 &ndash;&gt;
            </td>
            <td>
              <span class="calendar-inactive-date">11</span>
            </td>
            <td>
              <span class="calendar-inactive-date">12</span>
            </td>
            <td>
              <span class="calendar-inactive-date">13</span>
            </td>
            <td>
              <span class="calendar-inactive-date">14</span>
            </td>
          </tr>
          <tr class="calendar-date">
            <td>
              <span class="calendar-inactive-date">15</span>
            </td>
            <td>
              <span>16</span>
            </td>
            <td>
              <span>17</span>
            </td>
            <td>
              <span>18</span>
            </td>
            <td>
              &lt;!&ndash; 선택된 날짜 class: calendar-selected-date 추가 &ndash;&gt;
              <span class="calendar-selected-date">19</span>
              &lt;!&ndash; 선택된 날짜 class: calendar-selected-date 추가 &ndash;&gt;
            </td>
            <td>
              <span>20</span>
            </td>
            <td>
              <span class="calendar-inactive-date">21</span>
            </td>
          </tr>
          <tr class="calendar-date">
            <td>
              <span class="calendar-inactive-date">22</span>
            </td>
            <td>
              <span class="calendar-inactive-date">23</span>
            </td>
            <td>
              <span class="calendar-inactive-date">24</span>
            </td>
            <td>
              <span>25</span>
            </td>
            <td>
              <span>26</span>
            </td>
            <td>
              <span>27</span>
            </td>
            <td>
              <span class="calendar-inactive-date">28</span>
            </td>
          </tr>
          <tr class="calendar-date">
            <td>
              <span class="calendar-inactive-date">29</span>
            </td>
            <td>
              <span>30</span>
            </td>
            <td>
              <span>31</span>
            </td>
            <td>
              <span class="calendar-inactive-date">1</span>
            </td>
            <td>
              <span class="calendar-inactive-date">2</span>
            </td>
            <td>
              <span class="calendar-inactive-date">3</span>
            </td>
            <td>
              <span class="calendar-inactive-date">4</span>
            </td>
          </tr>-->
        </table>
      </div>
    </div>

    <template #action>
      <kw-btn
        label="취소"
        negative
        @click="onClickCancel"
      />
      <kw-btn
        label="다음"
        primary
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
  offDays: [],
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
  return toInteger(schedules.value[dayCnt - 1]?.baseD);
}
function isToday(dayCnt) {
  if (!schedules.value[dayCnt - 1]) return false;
  const { baseY, baseMm, baseD } = schedules.value[dayCnt - 1];
  return `${baseY}${baseMm}${baseD}` === dayjs().format(DATE_FORMAT_YMD);
}
function isEnable(dayCnt, isNotifyMessage) {
  const pointedDate = getYmdText(dayCnt).replace(/-/g, '');
  return disableAllTheseDays(pointedDate, isNotifyMessage);
}

function isHoliday(dayCnt) {
  return schedules.value[dayCnt - 1]?.dfYn === 'Y' || schedules.value[dayCnt - 1]?.phldYn === 'Y';
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
  const res = await dataService.get('/sms/wells/service/time-tables/schd-cho', {
    params:
      {
        ...cachedParams,
      },
  });
  data.value = res.data;
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
  console.log($event, weekIdx, dayIdx);
}
async function onClickCancel() {
  cancel();
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
