<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : [W-SV-U-0216M01] WwsnyCalendarMgtM - Calendar 관리
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
      v-permission:read
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
            :label="$t('기준년월')"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('서비스센터')"
          required
        >
          <kw-select
            v-model="searchParams.serviceCenter"
            :emit-value="false"
            :options="customCodes.SERVICE_CENTER"
            option-value="ogCd"
            option-label="ogNm"
            rules="required"
            :label="$t('서비스센터')"
            @update:model-value="onItemChanged"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <div class="row justify-end mt30 align-center">
        <p class="calendar-legend">
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
            <!-- [23.0308] 공휴일 및 일요일인 경우 holiday 클래스 추가 -->
            <!-- [23.0308] 당일인 경우 날짜에 today 클래스 추가  -->
            <div
              v-for="dayIdx of calendarInfo.dayCnt"
              :key="weekIdx*0 + dayIdx"
              class="calendar-weeks__day"
              :class="{
                opacity: isOpacity(((weekIdx - 1) * calendarInfo.dayCnt) + dayIdx),
                holiday: isHoliday(((weekIdx - 1) * calendarInfo.dayCnt) + dayIdx),
                today: isToday(((weekIdx - 1) * calendarInfo.dayCnt) + dayIdx)
              }"
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
import { useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty, toInteger } from 'lodash-es';

const dataService = useDataService();
const { notify, modal } = useGlobal();
const { t } = useI18n();
const { getUserInfo } = useMeta();
const sessionUserInfo = getUserInfo();
const HOLIDAY_TEXT = 'holiday';

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
  serviceCenterOgId: '',
  serviceCenterCd: '',
  serviceCenter: undefined,
  // serviceCenter: { ogCd: '', ogId: '선택' },
});

/*
 *  Custom Code setting
 */
const customCodes = {
  SERVICE_CENTER: [], // 서비스센터
};

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

/*
 * 휴일근무 지정자인지 체크하기 위한 funciton
 */
function isHolidaySetter() {
  // return sessionUserInfo.employeeIDNumber === '999999';
  return sessionUserInfo.baseRleCd === 'W1560'; // 휴무일지정자
}

/*
 * 휴일근무 지정자가 edit 가능한지 체크하기 위한 funciton
 * (서비스센터를 '휴무일지정'으로 했을 경우 edit 가능)
 */
function isHolidaySetable() {
  return (isHolidaySetter() && searchParams.value.serviceCenter.ogId === HOLIDAY_TEXT);
}

/*
 * 서비스센터 조회
 */
async function getServiceCenter() {
  const res = await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: isHolidaySetter() ? 'N' : 'Y' } });
  customCodes.SERVICE_CENTER = res.data;

  // cherro test
  if (isHolidaySetter()) {
    customCodes.SERVICE_CENTER.unshift({ ogCd: HOLIDAY_TEXT, ogNm: '휴무일지정', ogId: HOLIDAY_TEXT });
  }

  if (customCodes.SERVICE_CENTER.length > 0) {
    searchParams.value.serviceCenter = customCodes.SERVICE_CENTER[0];
  }
}
await getServiceCenter();

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
  return calendarList.value[dayCnt - 1]?.bndtWrkPsicNm ?? '';
}

/*
 *  Calendar 조회년월인지 판단하기 위한 function
 */
function isOpacity(dayCnt) {
  return !(calendarList.value[dayCnt - 1]?.baseMm === cachedParams.baseYm.substr(4, 2));
}

/*
 *  Holiday 판단을 위한 function
 */
function isHoliday(dayCnt) {
  // calendarList.value[dayCnt - 1].dfYn; // 휴무 여부
  // calendarList.value[dayCnt - 1].phldYn; // 공휴일 여부
  return (calendarList.value[dayCnt - 1].phldYn === 'Y');
}

function isToday(dayCnt) {
  const strDate = `${calendarList.value[dayCnt - 1].baseY}${calendarList.value[dayCnt - 1].baseMm}${calendarList.value[dayCnt - 1].baseD}`;
  return (dayjs().format('YYYYMMDD') === strDate);
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
  // if (isEmpty(searchParams.value.serviceCenter.ogCd)) {
  //   alert(t('MSG_VAL_REQUIRED', [t('서비스센터')]));
  //   return;
  // }

  // if (!isHolidaySetter()) {
  //   searchParams.value.serviceCenterCd = searchParams.value.serviceCenter.ogCd;
  //   searchParams.value.serviceCenterOgId = searchParams.value.serviceCenter.ogId;
  // }
  searchParams.value.serviceCenterCd = searchParams.value.serviceCenter.ogCd;
  searchParams.value.serviceCenterOgId = searchParams.value.serviceCenter.ogId;
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
  const {
    svCnrOgCd,
    svCnrOgId,
    baseY,
    baseMm,
    baseD,
    dfYn,
    ogTpCd,
    bndtWrkPsicNo,
    rmkCn,
  } = calendarList.value[dayCnt - 1];
  const { result: isChanged } = await modal({
    component: 'WwsnyCalendarRegP',
    componentProps: {
      svCnrOgCd,
      svCnrOgId,
      baseY,
      baseMm,
      baseD,
      dfYn,
      ogTpCd,
      bndtWrkPsicNo,
      rmkCn,
      isHolidaySetter,
      isHolidaySetable,
    },
  });

  if (isChanged) {
    await notify(t('MSG_ALT_SAVE_DATA'));
    await getCalendarMgt();
  }
}

/*
 * KwSelect 의 Object required rule 적용이 안되므로 방어 코딩
 */
function onItemChanged() {
  if (isEmpty(searchParams.value.serviceCenter.ogCd)) {
    searchParams.value.serviceCenter = undefined;
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

// start [23.0308] 기획 디자인 수정사항 반영
.calendar-day {
  display: flex;
  width: 100%;

  li {
    flex: 1 1 auto;
    text-align: center;
    padding: 11px 12px;
    font-size: 14px;
    font-weight: 400;
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
    text-align: right;

    // [23.0308] holiday case 추가
    &.opacity {
      cursor: not-allowed;

      > * {
        opacity: 0.3;
      }
    }

    &.holiday {
      .calendar-weeks__num {
        color: $error;
      }
    }

    &.today {
      .calendar-weeks__num {
        position: relative;

        &::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 28px;
          height: 28px;
          border-radius: 100%;
          background-color: rgba($primary, 0.1);
        }
      }
    }

    // // end [23.0308] holiday case 추가
  }

  &__num {
    display: inline-block;
    width: 20px;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
    text-align: center;
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
    text-align: left;
    font-size: 0;

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
        margin-right: 4px;
        width: 4px;
        height: 20px;
      }
    }

    &:first-of-type {
      .kw-font--14::before {
        background-color: $error;
      }
    }

    &:nth-of-type(2) {
      .kw-font--14::before {
        background-color: $primary;
      }
    }

    &:last-of-type {
      .kw-font--14::before {
        background-color: $placeholder;
      }
    }
  }
}

// end [23.0308] 기획 디자인 수정사항 반영

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
