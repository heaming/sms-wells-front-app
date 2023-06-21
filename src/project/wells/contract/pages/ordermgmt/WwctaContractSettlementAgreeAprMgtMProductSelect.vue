<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : fragment
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-06-19
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 주문 결제하기
- 계약의 총 금액 및 계약번호를 노출 하고, 주문 상품을 선택함.
****************************************************************************************************
--->
<template>
  <wwcta-contract-settlement-agree-item
    ref="topRef"
    hide-expand-icon
    expand-icon-toggle
    default-opened
  >
    <template #header>
      <kw-item-section>
        <kw-item-label
          font="subtitle"
          class="flex align-center justify-between text-black1"
          font-weight="500"
        >
          <slot name="title">
            {{ '주문결제하기' }}
          </slot>
          <div class="row items-center">
            <kw-btn
              borderless
              class="h16"
              icon="arrow_left"
              style="font-size: 16px;"
              @click="$refs.carousel.previous()"
            />
            <!-- rev:230511 수정 및 추가 -->
            <kw-btn
              class="mx8"
              borderless
            >
              <span class="mr2">{{ slide }}</span>/<span class="kw-fc--placeholder ml2">{{ slideData.length }}</span>
              <kw-menu
                title="주문상품 목록"
                fit
                behavior="dialog"
              >
                <kw-list class="pb16">
                  <!-- 활성화된 리스트에 curr 클래스 부여 -->
                  <kw-item class="curr">
                    <div class="scoped-list-wrap">
                      <p>렌탈</p>
                      <p class="ellipsis">
                        상품1
                      </p>
                      <p>미확정</p>
                    </div>
                  </kw-item>
                  <kw-item>
                    <div class="scoped-list-wrap">
                      <p>일시불</p>
                      <p class="ellipsis">
                        뭘 어떻게 쓰라는 걸까요?
                      </p>
                      <p>확정</p>
                    </div>
                  </kw-item>
                  <kw-item>
                    <div class="scoped-list-wrap">
                      <p>렌탈</p>
                      <p class="ellipsis">
                        상품명 상품명 상품명 상품명 상품명 상품명 상품명
                      </p>
                      <p>미확정</p>
                    </div>
                  </kw-item>
                  <kw-item>
                    <div class="scoped-list-wrap">
                      <p>리스</p>
                      <p class="ellipsis">
                        상품1
                      </p>
                      <p>미확정</p>
                    </div>
                  </kw-item>
                  <kw-item>
                    <div class="scoped-list-wrap">
                      <p>렌탈</p>
                      <p class="ellipsis">
                        상품1
                      </p>
                      <p>미확정</p>
                    </div>
                  </kw-item>
                </kw-list>
              </kw-menu>
            </kw-btn>
            <!-- // rev:230511 수정 및 추가 -->
            <kw-btn
              borderless
              class="h16"
              icon="arrow_right"
              style="font-size: 16px;"
              @click="$refs.carousel.next()"
            />
          </div>
        </kw-item-label>
      </kw-item-section>
    </template>
    <kw-form class="pt20">
      <kw-form-item label="최종결제금액">
        <p>{{ `${stringUtil.getNumberWithComma(totFnlAmt)}원` }}</p>
      </kw-form-item>
      <kw-form-item label="계약번호">
        <p>{{ contract.base.cntrNo }}</p>
      </kw-form-item>
    </kw-form>
  </wwcta-contract-settlement-agree-item>
</template>

<script setup>

import { stringUtil } from 'kw-lib';
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';

const props = defineProps({
  contract: {
    type: Object,
    required: true,
  },
  product: {
    type: Object,
    required: true,
    validator: (val) => isReactive(val),
  },
});

const totFnlAmt = computed(() => {
  const dtls = props.contract?.dtls || [];
  return dtls.reduce((acc, dtl) => (acc + (dtl.fnlAmt || 0)), 0);
});

const slideData = [{ name: '1' }];
const slide = '1';
</script>

<style lang="scss" scoped>
@import "kw-lib/src/css/mixins";

.scoped-list {
  $-list-class: &;

  border: 1px solid #ddd;
  margin-top: 20px;

  &__item {
    $-item-class: &;

    padding: 6px 12px;
    margin: 4px 0;
    font-weight: 400;

    &:nth-of-type(2) {
      margin-top: 16px;
    }

    &:last-of-type {
      margin-bottom: 16px;
    }

    &--total {
      padding: 4px 12px;
      margin: 0;
      background-color: $bg-box;
    }

    &--selected {
      font-weight: 500;
    }
  }
}

</style>
