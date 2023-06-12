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
import { useDataService/* , useModal, alert */ } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();

// const DATE_FORMAT_YM = 'YYYYMM';
const DATE_FORMAT_YMD = 'YYYYMMDD';

const props = defineProps({
  // baseYm: { type: String, default: '' },
  // cntrNo: { type: String, default: '' },
  // basePdCd: { type: String, default: '' },
  // prtnrNo: { type: String, default: '' },
  // prevTag: { type: String, default: '' },
  // svDvCd: { type: String, default: '' },
  // svBizDclsfCd: { type: String, default: '' },
  // sellDAte: { type: String, default: '' },

  baseYm: { type: String, default: '' },
  prevTag: { type: String, default: '' },
  chnlDvCd: { type: String, default: '' },
  svDvCd: { type: String, default: '' },
  prtnrNo: { type: String, default: '' },
  sellDate: { type: String, default: '' },
  ordSeq: { type: String, default: '' },
  svBizDclsfCd: { type: String, default: '' },
  newAdrZip: { type: String, default: '' },
  cntrNo: { type: String, default: '' },
  cntrSn: { type: String, default: '' },
  sidingCd: { type: String, default: '' },
  inGb: { type: String, default: '' },
  basePdCd: { type: String, default: '' },
  wrkDt: { type: String, default: '' },
  seq: { type: String, default: '' },
  dtaStatCd: { type: String, default: '' },
  returnUrl: { type: String, default: '' },
  userId: { type: String, default: '' },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const schedules = ref([]);
const scheduleInfo = ref({
  weekCnt: 0,
  dayCnt: 7,
});

let cachedParams;
const searchParams = ref({
  // baseYm: props.baseYm,
  // prtnrNo: props.prtnrNo,
  // prevTag: props.prevTag,
  // svDvCd: props.svDvCd, // dataGb
  // dataStus: props.dataStus,
  // cntrNo: props.cntrNo,
  // gdsCd: props.gdsCd,
  // svBizDclsfCd: props.svBizDclsfCd,
  // sellDate: props.sellDate,
  baseYm: props.baseYm,
  prevTag: props.prevTag,
  chnlDvCd: props.chnlDvCd,
  svDvCd: props.svDvCd,
  prtnrNo: props.prtnrNo,
  sellDate: props.sellDate,
  ordSeq: props.ordSeq,
  svBizDclsfCd: props.svBizDclsfCd,
  newAdrZip: props.newAdrZip,
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  sidingCd: props.sidingCd,
  inGb: props.inGb,
  basePdCd: props.basePdCd,
  wrkDt: props.wrkDt,
  seq: props.seq,
  dtaStatCd: props.dtaStatCd,
  returnUrl: props.returnUrl,
  userId: props.userId,
});

async function getTimeTables() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  const res = await dataService.get('/sms/wells/service/time-table/time-assign-sales', { params: { ...cachedParams,
  } });
  console.log(res.data);
  schedules.value = res.data;
  scheduleInfo.value.weekCnt = schedules.value.length / scheduleInfo.value.dayCnt;
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
