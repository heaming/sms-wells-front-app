<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : fragment
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-06-12
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 주문 상품 정보
- WctaContractRegService.selectProductInfos , selectContractStlmRels 참고
- 계약일련번호 목록 가져오는 것  + 계약번호 + 계약일련번호 로 부터 결재 관계 목록 가져오는 것.
- 주문번호, 계약일련번호 내 최종금액, 상품명, 계약결제관계 테이블로 부터 입금유형코드(DP_TP_CD) 와 결제금액 쌍
- {cntrSn: {pdNm, fnlAmt, stlmRels: [{dpTpCd, stlmAmt}] }}
- 다만 stlmRels 표기 할 떄,
  dpTpCd in (0101:개별수납(가상계좌) 0201:개별수납(신용카드)) 의 stlmAmt 합을 일시불
  dpTpCd in (0102(계좌자동이체) 0203(카드자동이체)) 의 stlmAmt 합으로 월할부금의 총액
  으로 가장 마지막에 표시
****************************************************************************************************
--->
<template>
  <wwcta-contract-settlement-agree-item
    ref="topRef"
    title="주문결제하기"
    hide-expand-icon
    expand-icon-toggle
    default-opened
  >
    <kw-form class="pt20">
      <kw-form-item label="최종결제금액">
        <p>{{ `${stringUtil.getNumberWithComma(product.fnlAmt || 0)}원` }}</p>
      </kw-form-item>
      <kw-form-item label="계약번호">
        <p>{{ `${product.cntrNo}${product.cntrSn ? '-' + product.cntrSn : ''}` }}</p>
      </kw-form-item>
    </kw-form>
  </wwcta-contract-settlement-agree-item>
  <wwcta-contract-settlement-agree-item
    title="주문상품정보"
    expand-icon-toggle
    default-opened
  >
    <kw-expansion-item
      :label="product.pdNm"
      default-opened
    >
      <kw-form
        class="kw-bc--bg-box pa16"
        dense
        align-content="right"
      >
        <kw-form-item label="의무기간">
          <p>
            {{ `${product.duty}개월` }}
          </p>
        </kw-form-item>
        <kw-form-item label="등록비">
          <p>
            0원
          </p>
        </kw-form-item>
        <kw-form-item label="방문주기">
          <p>
            3개월
          </p>
        </kw-form-item>
        <kw-form-item label="월 렌탈료">
          <p>
            {{ stringUtil.getNumberWithComma(14900) + '원' }}
          </p>
        </kw-form-item>
        <kw-form-item label="프로모션">
          <p>
            14,900원
          </p>
        </kw-form-item>
      </kw-form>
    </kw-expansion-item>
  </wwcta-contract-settlement-agree-item>
</template>

<script setup>
import { stringUtil } from 'kw-lib';
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';

/* eslint-disable-next-line */
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

</script>

<style lang="scss" scoped>
.keep-all {
  word-break: keep-all;
}

:deep(.scoped-hp-unset-min-height) {
  min-height: auto !important;
}
</style>
