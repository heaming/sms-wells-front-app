<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : fragment
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-12-02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 세금계산서 정보
****************************************************************************************************
--->
<template>
  <wwcta-contract-settlement-agree-item
    :title="'세금계산서'"
    default-opened
    hide-expand-icon
  >
    <kw-item-section class="pt20">
      <kw-form
        ref="frmRef"
        class="pt8 column gap-lg"
      >
        <kw-field-wrap
          label="사업자번호"
        >
          {{ txinvRcpBaseIz.bzrno?.replace(/(\d{3})(\d{2})(\d+)/g, '$1-$2-$3') }}
        </kw-field-wrap>
        <kw-input
          v-model="txinvRcpBaseIz.dlpnrPsicNm"
          label="담당자명"
          rules="required"
        />
        <kw-input
          v-model:tel-no0="txinvRcpBaseIz.locaraTno"
          v-model:tel-no1="txinvRcpBaseIz.exnoEncr"
          v-model:tel-no2="txinvRcpBaseIz.idvTno"
          label="전화번호"
          mask="telephone"
          rules="telephone|required"
        />
        <kw-input
          v-model="txinvRcpBaseIz.emadr"
          label="이메일주소"
          rules="email|required"
        />
        <kw-select
          v-model="txinvRcpBaseIz.txinvPblD"
          label="발행일자"
          :options="codes.DLPNR_PBL_D_SE_CD"
          rules="required"
        />
      </kw-form>
    </kw-item-section>
  </wwcta-contract-settlement-agree-item>
</template>

<script setup>
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';
import { useCtCode } from '~sms-common/contract/composable';

const props = defineProps({
  modelValue: { type: Object, required: true },
});

const emit = defineEmits(['update:model-value']);

const { codes } = await useCtCode('DLPNR_PBL_D_SE_CD');

const txinvRcpBaseIz = ref(props.modelValue);

watchEffect(() => {
  if (props.modelValue !== txinvRcpBaseIz.value) {
    txinvRcpBaseIz.value = {
      ...txinvRcpBaseIz.value,
      ...props.modelValue,
    };
  }
  emit('update:model-value', txinvRcpBaseIz.value);
});

console.log(props);

</script>
