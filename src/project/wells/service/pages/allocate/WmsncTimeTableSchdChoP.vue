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
  <kw-popup :title="'타임테이블 일정선택'">
    <div class="px20 pt20">
      <div class="row full-width justify-center items-center">
        <kw-btn
          icon="arrow_left_24"
          class="kw-font-pt24"
          borderless
        />
        <p class="text-weight-bold mx20 row justify-between kw-font-pt18 w106">
          <span>2023년</span>
          <span>01월</span>
        </p>

        <kw-btn
          icon="arrow_right_24"
          class="kw-font-pt24"
          borderless
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
              일
            </th>
            <th>월</th>
            <th>화</th>
            <th>수</th>
            <th>목</th>
            <th>금</th>
            <th>토</th>
          </tr>

          <tr class="calendar-date">
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
              <!-- 비활성화 시 class: calendar-inactive-date 추가 -->
              <span class="calendar-inactive-date">7</span>
              <!-- // 비활성화 시 class: calendar-inactive-date 추가 -->
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
              <!-- 오늘 날짜 class: calendar-current-date 추가 -->
              <span class="calendar-current-date">10</span>
              <!-- // 오늘 날짜 class: calendar-current-date 추가 -->
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
              <!-- 선택된 날짜 class: calendar-selected-date 추가 -->
              <span class="calendar-selected-date">19</span>
              <!-- 선택된 날짜 class: calendar-selected-date 추가 -->
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
          </tr>
        </table>
      </div>
    </div>

    <template #action>
      <kw-btn
        negative
        label="취소"
      />
      <kw-btn
        primary
        label="다음"
      />
    </template>
  </kw-popup>
</template>

<script setup>
</script>

<style scoped lang="scss">
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
