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
- 파트너 정보
****************************************************************************************************
--->
<template>
  <wwcta-contract-settlement-agree-item
    :title="'파트너 확인'"
  >
    <kw-item-section class="pt20">
      <kw-form>
        <kw-form-item label="파트너">
          <p>{{ prtnr.prtnrKnm || '' }}</p>
        </kw-form-item>
        <kw-form-item label="센터">
          <p>{{ prtnr.dgr3LevlOgNm || '' }}</p>
        </kw-form-item>
        <kw-form-item label="휴대전화번호">
          <p>{{ phoneNumber }}</p>
        </kw-form-item>
        <kw-form-item label="주소">
          <p> {{ `${prtnr.adr || ''} ${prtnr.adrDtl || ''}` }}</p>
        </kw-form-item>
      </kw-form>
    </kw-item-section>
  </wwcta-contract-settlement-agree-item>
</template>

<script setup>
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';

const props = defineProps({
  prtnr: { type: Object, default: undefined },
});

const phoneNumber = computed(() => {
  if (!props.prtnr) { return ''; }
  const { prtnrCralLocaraTno, prtnrCralIdvTno } = props.prtnr;
  if (!prtnrCralLocaraTno || !prtnrCralIdvTno) { return ''; }
  return `${prtnrCralLocaraTno}-****-${prtnrCralIdvTno}`;
});
</script>
