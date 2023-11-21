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
      <kw-form-item
        v-if="product.sellTpCd === '1'"
        :label="'최종결제금액'"
      >
        <p>{{ `${stringUtil.getNumberWithComma(product.cntrTam || 0)}원` }}</p>
      </kw-form-item>
      <kw-form-item label="계약상세번호">
        <p>{{ `${product.cntrNo}${product.cntrSn ? '-' + product.cntrSn : ''}` }}</p>
      </kw-form-item>
    </kw-form>
  </wwcta-contract-settlement-agree-item>
  <wwcta-contract-settlement-agree-item
    title="주문상품정보"
    hide-expand-icon
    expand-icon-toggle
    default-opened
  >
    <kw-expansion-item
      :label="product.pdNm"
      default-opened
    >
      <kw-form
        class="kw-bc--bg-box pa16"
        align-content="right"
        dense
      >
        <kw-form-item
          v-for="(productInfo) in productInfos"
          :key="`product-info-${productInfo.label}`"
          :label="productInfo.label"
        >
          <span class="text-dense text-weight-regular">
            {{ productInfo.value }}
          </span>
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

const labelForFnlAmt = computed(() => {
  const sellTpCd = props.product?.sellTpCd;
  if (sellTpCd === '1') {
    return '상품금액';
  }
  if (sellTpCd === '2') {
    return '월 렌탈료';
  }
  if (sellTpCd === '3') {
    return '멤버쉽 회비';
  }
  if (sellTpCd === '6') {
    return '정상가';
  }
  return '최종결제금액';
});

const productInfos = computed(() => {
  const infos = [];
  if (!props.product) {
    return infos;
  }
  const {
    sellTpCd,
    sellTpDtlCd,
    stplPtrm,
    cntrPtrm,
    fnlAmt,
    sellAmt,
    dscAmt,
    cntrAmt,
    svPrd,
  } = props.product;

  if (sellTpCd === '1') { /* 일시불 */
    infos.push({ label: labelForFnlAmt.value, value: `${stringUtil.getNumberWithComma(fnlAmt || 0)}원` });
    infos.push({ label: '정상가', value: `${stringUtil.getNumberWithComma(sellAmt || 0)}원` });
    infos.push({ label: '할인가', value: `${stringUtil.getNumberWithComma(dscAmt || 0)}원` });
    if (cntrPtrm && Number(cntrPtrm) > 0) {
      infos.push({ label: '유상멤버십', value: `${stringUtil.getNumberWithComma(cntrPtrm || 0)}개월` });
    }
  }
  if (sellTpCd === '2') { /* 렌탈 */
    if (stplPtrm) {
      infos.push({ label: '의무기간', value: `${stplPtrm}개월` });
    }
    infos.push({ label: labelForFnlAmt.value, value: `${stringUtil.getNumberWithComma(fnlAmt || 0)}원` });
    infos.push({ label: '등록비', value: `${stringUtil.getNumberWithComma(cntrAmt || 0)}원` });
    if (svPrd) {
      infos.push({ label: '방문주기', value: `${svPrd}개월` });
    }
    infos.push({ label: '프로모션', value: '' }); /* TODO */
  }
  if (sellTpCd === '3') { /* 멤버십 */
    if (svPrd) {
      infos.push({ label: '방문주기', value: `${svPrd}개월` });
    }
    infos.push({ label: labelForFnlAmt.value, value: `${stringUtil.getNumberWithComma(fnlAmt || 0)}원` });
  }
  if (sellTpCd === '6') { /* 정기배송 */
    infos.push({ label: labelForFnlAmt.value, value: `${stringUtil.getNumberWithComma(fnlAmt || 0)}원` });
    if (svPrd) {
      infos.push({ label: '방문주기', value: `${svPrd}개월` });
    }
  }
  switch (sellTpDtlCd) {
    case '12': /* 홈케어 */
    case '33': /* 홈케어멤버십 */
      infos.push({ label: '추가정보1', value: '' });
      infos.push({ label: '추가정보2', value: '' });
      infos.push({ label: '브랜드', value: '' });
  }
  return infos;
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
