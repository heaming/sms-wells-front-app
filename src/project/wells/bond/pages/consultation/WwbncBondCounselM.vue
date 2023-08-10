<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID :WwbncBondCounselM
3. 작성자 : sunghun.choi
4. 작성일 : 2023.02.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 채권상담 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs
      v-model="selectedTab"
    >
      <kw-tab
        name="tab1"
        :label="$t('MSG_TXT_CST_LIST')"
      />
      <kw-tab
        name="tab2"
        :label="$t('MSG_TXT_CNTR_LIST')"
      />
      <kw-tab
        name="tab3"
        :label="$t('MSG_TXT_CST_SRCH')"
      />
      <kw-tab
        name="tab4"
        :label="$t('MSG_TXT_PROM_CST_SRCH')"
      />
    </kw-tabs>
    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="tab1">
        <wwbnc-bond-counsel-m-customer />
      </kw-tab-panel>
      <kw-tab-panel name="tab2">
        <wwbnc-bond-counsel-m-contract />
      </kw-tab-panel>
      <kw-tab-panel name="tab3">
        <wwbnc-bond-counsel-m-customer-search
          v-model:cellphone="params.cellphone"
          v-model:search-yn="params.searchYn"
        />
      </kw-tab-panel>
      <kw-tab-panel name="tab4">
        <zwbnc-bond-counsel-m-promise-customer />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
  <div class="call-center">
    <div class="call-center-inner">
      <div class="row">
        <div class="column mr60">
          <p class="call-center-text">
            홍길동(123456)
          </p>
          <kw-option-group
            :model-value="'02-111-1111'"
            type="radio"
            :options="['02-111-1111', '010-2222-2222', '010-222-2222']"
            class="call-center-radio"
          />
        </div>
        <div class="column mr60">
          <p class="call-center-text">
            아웃
          </p>
          <p class="call-center-text mt24">
            010-2222-2222
          </p>
        </div>
        <div class="column mr60">
          <p class="call-center-text">
            CTI 로그인 필요
          </p>
          <p class="call-center-text mt24">
            경과시간 00:00:00
          </p>
        </div>
        <div class="column relative-position">
          <div class="row justify-end">
            <!-- 비활성화 시 kw-btn 안에 disable 추가 -->
            <kw-btn
              label="교육"
              dense
              class="call-center-small-btn"
              disable
            />
            <kw-btn
              label="업무공지"
              dense
              class="call-center-small-btn ml4"
            />
            <kw-btn
              label="자료검색"
              dense
              class="call-center-small-btn ml4"
            />
            <kw-btn
              label="휴식"
              dense
              class="call-center-small-btn ml4"
            />
            <kw-btn
              label="식사"
              dense
              class="call-center-small-btn ml4"
            />
            <!-- // 비활성화 시 kw-btn 안에 disable 추가 -->
          </div>
          <div class="row mt8">
            <!-- 비활성화 시 kw-btn 안에 disable 추가 -->
            <kw-btn
              label="끊기"
              icon="cellphone_off"
              dense
              class="call-center-icon-btn"
              disable
            />
            <kw-separator
              spaced
              vertical
              inset
              class="mx20 my3"
            />
            <kw-btn
              label="대기"
              icon="pause"
              dense
              class="call-center-icon-btn"
            />
            <kw-separator
              spaced
              vertical
              inset
              class="mx20 my3"
            />
            <kw-btn
              label="휴식"
              icon="break"
              dense
              class="call-center-icon-btn"
            />
            <kw-separator
              spaced
              vertical
              inset
              class="mx20 my3"
            />
            <kw-btn
              label="걸기"
              icon="cellphone"
              dense
              class="call-center-icon-btn"
            />
            <kw-separator
              spaced
              vertical
              inset
              class="mx20 my3"
            />
            <kw-btn
              label="보류"
              icon="holding"
              dense
              class="call-center-icon-btn"
            />
            <kw-separator
              spaced
              vertical
              inset
              class="mx20 my3"
            />
            <kw-btn
              label="해제"
              icon="release"
              dense
              class="call-center-icon-btn call-center-icon-btn--active"
            />
            <!-- // 비활성화 시 kw-btn 안에 disable 추가 -->
          </div>
          <!--  [걸기]버튼 클릭 시 팝업 -->
          <!-- <div class="outgoing-call-box">
              <kw-btn
                icon="cellphone"
                borderless
              />
              <kw-input
                class="ml8 w140"
                dense
              />
              <kw-btn
                label="걸기"
                class="ml8 kw-btn--bg"
                dense
                secondary
              />
              <kw-btn
                class="ml12"
                icon="close"
                borderless
              />
            </div> -->
          <!-- // [걸기]버튼 클릭 시 팝업 -->
        </div>
      </div>
      <div class="row">
        <kw-btn
          outlined
          dense
          label="콜백 (0)"
          border-color="bg-white"
          class="call-center-btn"
          @click="onClickBncCallBack"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { modal } from 'kw-lib';

import ZwbncBondCounselMPromiseCustomer from '~sms-common/bond/pages/consultation/ZwbncBondCounselMPromiseCustomer.vue';
import WwbncBondCounselMCustomerSearch from './WwbncBondCounselMCustomerSearch.vue';
import WwbncBondCounselMCustomer from './WwbncBondCounselMCustomer.vue';
import WwbncBondCounselMContract from './WwbncBondCounselMContract.vue';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectedTab = ref('tab1');
const params = ref({});

const searchParams = ref({
  callbackData0101: '4833',
  callbackData0102: '4886',
  callbackData0103: '4939',
  queueId: '4833',
});

// TODO: 콜백 조회 팝업
async function onClickBncCallBack() {
  const { result, payload } = await modal({
    component: 'ZwbncCallbackP',
    componentProps: {
      callbackData0101: searchParams.value.callbackData0101,
      callbackData0102: searchParams.value.callbackData0102,
      callbackData0103: searchParams.value.callbackData0103,
      queueId: searchParams.value.queueId,
    },
  });

  if (result) {
    selectedTab.value = 'tab3';
    params.value.cellphone = payload.telNo;
    params.value.searchYn = 'Y';
  }
}
</script>

<style lang="scss" scoped>
.kw-page__content-container {
  position: relative !important;
}

.call-center {
  position: sticky;
  width: 100%;
  bottom: 0;
  min-width: 1480px;
  z-index: 10;

  &-inner {
    display: flex;
    justify-content: space-between;
    left: 0;
    bottom: 0;
    padding: 20px 40px;
    box-sizing: border-box;
    background-color: $secondary;
    align-items: center;

    ::v-deep(.kw-btn) {
      background-color: transparent;

      &.call-center-small-btn {
        min-height: 20px;
        font-size: 12px;
        padding: 2px 8px;
        line-height: 1;
        font-weight: normal;
        background-color: rgb(0 0 0 / 20%);
        opacity: 1 !important;

        &.q-btn {
          &::before {
            background: inherit;
          }
        }

        .q-btn__content {
          color: #fff;
        }

        &.kw-btn--outlined::after {
          border: 1px solid #4f5a8d;
        }

        &.disabled {
          background-color: rgb(0 0 0 / 20%);
          opacity: 0.4 !important;
        }
      }

      &.call-center-icon-btn {
        width: 42px;
        padding: 0 8px;

        &::after {
          border: none;
        }

        &.q-btn {
          &::before {
            background: inherit;
          }
        }

        .q-icon {
          opacity: 1;
        }

        .q-btn__content {
          color: #fff;
        }

        &.disabled {
          .q-icon {
            color: #fff !important;
            opacity: 0.4;
          }

          .q-btn__content {
            color: rgb(255 255 255 / 40%);
          }
        }
      }

      &.call-center-btn {
        width: 100px;
        padding: 0;

        .q-btn__content {
          color: rgb(255 255 255 / 90%);
          word-break: keep-all;
        }
      }

      .q-btn__content {
        flex-direction: column;
        color: $bg-white;
      }

      .q-icon {
        margin-right: 0;
        color: $bg-white !important;
      }
    }

    ::v-deep(.kw-separator) {
      background-color: rgb(255 255 255 / 10%);
    }
  }

  ::v-deep(.kw-option-group--radio) {
    &.call-center-radio {
      margin-top: 24px;

      .q-field__control {
        min-height: 20px;
        height: 20px;
      }

      .q-field__native {
        min-height: 20px;
        height: 20px;
        color: #fff;
        line-height: 1;
      }

      .q-radio__inner {
        min-width: 18px;
        width: 18px;
        height: 18px;
        font-size: 18px;
      }

      .q-radio__label {
        font-size: 14px;
        line-height: 1.43;
      }

      .q-radio__bg {
        width: 18px;
        height: 18px;
        background-size: 18px;
      }

      .q-radio__inner--falsy {
        & ~ .q-radio__label {
          font-weight: 500;
          color: #fff;
        }

        & ~ .q-radio__label:hover {
          font-weight: 500;
          color: #fff;
        }
      }
    }
  }

  &-text {
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    line-height: 1.43;
  }

  // rev:230628 css 변경

  .call-center-popup {
    position: absolute;
    width: 810px;
    padding: 16px 30px 20px;
    border: 1px solid $secondary;
    bottom: 103px;
    right: 40px;
    background: $bg-white;
  }

  // // rev:230628 css 변경
  .outgoing-call-box {
    position: absolute;
    left: 92px;
    display: flex;
    padding: 15px 20px;
    background-color: #263060;
    border: 1px solid #747dac;
    box-shadow: 4px 5px 5px 0 rgb(0 0 0 / 16%);

    .kw-input {
      background: $bg-white;
    }

    ::v-deep(.kw-btn) {
      &.kw-btn--bg {
        background-color: $bg-white;

        .q-btn__content {
          color: $black-btn-line;
        }
      }
    }
  }
}
</style>
