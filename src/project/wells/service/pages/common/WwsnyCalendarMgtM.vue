<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnyCalendarMgtM - Calendar 관리
3. 작성자 : juno.cha
4. 작성일 : 2023.01.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- Calendar 관리 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('기준년월')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('서비스센터')"
          required
        >
          <kw-select
            v-model="searchParams.serviceCenterCd"
            :options="['B','C']"
            first-option="select"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <div class="row justify-end mt30 align-center">
        <p class="calendar-legend ">
          {{ $t('휴무') }}
        </p>
        <p class="calendar-legend calendar-legend--blue">
          {{ $t('당직자') }}
        </p>
        <p class="calendar-legend calendar-legend--grey">
          {{ $t('비고사항') }}
        </p>
      </div>
      <div class="column mt12">
        <ul class="calendar-day">
          <li
            v-for="day in ['일','월','화','수','목','금','토']"
            :key="day"
          >
            {{ day }}
          </li>
        </ul>
        <div class="calendar-weeks">
          <div
            v-for="weekIdx of calendarInfo.weekCnt"
            :key="weekIdx"
            class="calendar-weeks__week"
          >
            <!-- 전월 익월 포함된 날짜인 경우 opacity 클래스 추가 -->
            <div
              v-for="dayIdx of calendarInfo.dayCnt"
              :key="weekIdx*0 + dayIdx"
              class="calendar-weeks__day"
              :class="{ opacity: isOpacity(((weekIdx - 1) * calendarInfo.dayCnt) + dayIdx) }"
              @dblclick="onDbClickCalendar(((weekIdx - 1) * calendarInfo.dayCnt) + dayIdx)"
            >
              <!-- day 클릭시 팝업페이지-->
              <p class="calendar-weeks__num">
                {{ getDayText(((weekIdx - 1) * calendarInfo.dayCnt) + dayIdx) }}
              </p>
              <ul class="calendar-weeks__infos">
                <!-- 휴무 -->
                <li class="calendar-weeks__info">
                  <p
                    v-if="calendarList[((weekIdx - 1) * calendarInfo.dayCnt) + dayIdx - 1]?.dfYn === 'Y'"
                    class="kw-font--14"
                  >
                    {{ ' ' + $t('휴무') }}
                  </p>
                </li>
                <!-- 당직자 -->
                <li class="calendar-weeks__info">
                  <p
                    v-if="!isEmpty(calendarList[((weekIdx - 1) * calendarInfo.dayCnt) + dayIdx - 1]?.bndtWrkPsicNo)"
                    class="kw-font--14"
                  >
                    {{ ' ' + $t('당직자') }}:  <span class="ml4">
                      {{ getBndtWrkPsicNo(((weekIdx - 1) * calendarInfo.dayCnt) + dayIdx) }}
                    </span>
                  </p>
                </li>
                <!-- 비고사항 -->
                <li class="calendar-weeks__info">
                  <p
                    v-if="!isEmpty(calendarList[((weekIdx - 1) * calendarInfo.dayCnt) + dayIdx - 1]?.rmkCn)"
                    class="kw-font--14"
                  >
                    {{ getRmkCnText(((weekIdx - 1) * calendarInfo.dayCnt) + dayIdx) }}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty, toInteger } from 'lodash-es';

const dataService = useDataService();
const { notify, modal/* , alert */ } = useGlobal();
const { t } = useI18n();

const calendarList = ref([]);
const calendarInfo = ref({
  weekCnt: 0,
  dayCnt: 7,
});

/*
 *  Search Parameter
 */
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  serviceCenterCd: 'B',
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

/*
 *  Search - 고정방문 관리 조회
 */
let cachedParams;
async function getCalendarMgt() {
  const res = await dataService.get('/sms/wells/service/calendars', { params: { ...cachedParams } });
  calendarList.value = res.data;

  // 조회 후 calendar setting
  calendarInfo.value.weekCnt = calendarList.value.length / 7;
}

/*
 *  Calendar 날짜를 가져오기 위한 function
 */
function getDayText(dayCnt) {
  return toInteger(calendarList.value[dayCnt - 1]?.baseD);
}

/*
 *  Calendar 비고를 가져오기 위한 function
 */
function getRmkCnText(dayCnt) {
  const rmkCn = calendarList.value[dayCnt - 1]?.rmkCn ?? '';
  const div = !isEmpty(rmkCn) ? ' ' : '';
  return `${div}${rmkCn}`;
}

/*
 *  Calendar 당직자를 가져오기 위한 function
 */
function getBndtWrkPsicNo(dayCnt) {
  return calendarList.value[dayCnt - 1]?.bndtWrkPsicNo ?? '';
}

/*
 *  Calendar 조회년월인지 판단하기 위한 function
 */
function isOpacity(dayCnt) {
  return !(calendarList.value[dayCnt - 1]?.baseMm === cachedParams.baseYm.substr(4, 2));
}

// function isDf(dayCnt) {
//   if (calendarList.value[dayCnt - 1]?.dfYn === 'Y') {
//     return true;
//   }
//   return false;
// }

// function isRmkCn(dayCnt) {
//   return !isEmpty(calendarList.value[dayCnt - 1]?.rmkCn);
// }

/*
 *  Event - 조회 버튼 클릭
 */
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await getCalendarMgt();
}

/*
 *  Event - Calendar 더블 클릭
 */
async function onDbClickCalendar(dayCnt) {
  // const { result: isChanged } = await modal({
  //   component: 'WwsnyCalendarRegP',
  //   componentProps: {
  //     svCnrOgId: calendarList.value[dayCnt - 1]?.svCnrOgId,
  //     baseY: calendarList.value[dayCnt - 1]?.baseY,
  //     baseMm: calendarList.value[dayCnt - 1]?.baseMm,
  //     baseD: calendarList.value[dayCnt - 1]?.baseD,
  //     dfYn: calendarList.value[dayCnt - 1]?.dfYn,
  //     bndtWrkPsicNo: calendarList.value[dayCnt - 1]?.bndtWrkPsicNo,
  //     rmkCn: calendarList.value[dayCnt - 1]?.rmkCn,
  //   },
  // });
  const { svCnrOgId, baseY, baseMm, baseD, dfYn, bndtWrkPsicNo, rmkCn } = calendarList.value[dayCnt - 1];
  const { result: isChanged } = await modal({
    component: 'WwsnyCalendarRegP',
    componentProps: {
      svCnrOgId,
      baseY,
      baseMm,
      baseD,
      dfYn,
      bndtWrkPsicNo,
      rmkCn,
    },
  });

  if (isChanged) {
    await notify(t('MSG_ALT_SAVE_DATA'));
    await getCalendarMgt();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
<style scoped lang="scss">
ul {
  padding: 0;
  margin: 0;

  li {
    list-style: none;
  }
}

.calendar-day {
  display: flex;
  width: 100%;

  li {
    flex: 1 1 auto;
    text-align: center;
    padding: 11px 12px;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.43;
    background-color: $bg-box;
    border: 1px solid $line-bg;

    &:not(:first-child) {
      border-left: none;
    }

    &:first-child {
      color: $error;
    }
  }
}

.calendar-weeks {
  width: 100%;

  &__week {
    display: flex;
    border-left: 1px solid $line-bg;
  }

  &__day {
    width: calc(100% / 7);
    padding: 16px 12px 12px;
    border-bottom: 1px solid $line-bg;
    border-right: 1px solid $line-bg;
    cursor: pointer;

    &.opacity {
      cursor: not-allowed;

      .calendar-weeks__num {
        color: $placeholder;
      }

      .calendar-weeks__infos {
        opacity: 0.3;
      }
    }
  }

  &__num {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
    text-align: right;
  }

  &__infos {
    margin-top: 16px;
    display: grid;
    grid-template-rows: repeat(3, 20px);
    row-gap: 6px;
  }

  &__info {
    width: inherit;
    vertical-align: middle;

    .kw-font--14 {
      width: 100%;
      color: $black2;
      height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      word-wrap: break-word;
      display: -webkit-box; /* stylelint-disable-line */
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;

      &::before {
        content: "";
        display: inline-block;
        vertical-align: middle;
        margin-left: 4px;
        width: 4px;
        height: 20px;
      }
    }

    &:first-child {
      .kw-font--14::before {
        background-color: $error;
      }
    }

    &:nth-child(2) {
      .kw-font--14::before {
        background-color: $primary;
      }
    }

    &:last-child {
      .kw-font--14::before {
        background-color: $placeholder;
      }
    }
  }
}

.calendar-legend {
  position: relative;
  margin-left: 12px;
  padding-left: 12px;
  font-size: 14px;
  line-height: 1.43;
  color: #777;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background-color: #ed1941;
  }

  &--blue {
    &::before {
      background-color: #2f8af3;
    }
  }

  &--grey {
    &::before {
      background-color: #999;
    }
  }
}
</style>
