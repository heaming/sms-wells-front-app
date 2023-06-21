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
- 현금 영수증 발급
****************************************************************************************************
--->
<template>
  <wwcta-contract-settlement-agree-item
    v-if="modelValue"
    ref="topRef"
    :title="'현금영수증등록'"
  >
    <kw-item-section class="pt20">
      <kw-form
        ref="frmRef"
        class="column gap-lg"
      >
        <kw-checkbox
          :model-value="changeTarget"
          class="self-start"
          label="대상변경"
          boolean-value
          @update:model-value="notifyWIP"
        />
        <kw-input
          v-model="cstKnm"
          label="대상자명"
          :disable="!changeTarget"
        />
        <kw-select
          v-model="cssrIsDvCd"
          label="인증방법"
          :options="codes.CSSR_IS_DV_CD"
          :disable="!changeTarget"
        />
        <kw-input
          v-if="cssrIsDvCd"
          v-model="cssrIsNo"
          label="인증번호"
          :disable="!changeTarget"
        />
      </kw-form>
    </kw-item-section>
  </wwcta-contract-settlement-agree-item>
</template>

<script setup>
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';
import { codeUtil, notify } from 'kw-lib';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    validator: (val) => isReactive(val),
  },
});

const exposed = {};
defineExpose(exposed);

const { cstKnm, cssrIsDvCd, cssrIsNo } = toRefs(props.modelValue);

const codes = await codeUtil.getMultiCodes(
  'CSSR_IS_DV_CD',
);

const changeTarget = ref(false);

/* 삭제예정 */
function notifyWIP() {
  notify('협의중');
}

function scrollTo(ref) {
  const el = ref.value.$el;
  if (el) { el.scrollIntoView(true); }
}

const topRef = ref();
const frmRef = ref();

async function validate() {
  if (!props.modelValue) { return true; }
  if (!changeTarget) { return true; }
  const valid = await frmRef.value.validate();
  if (!valid) { scrollTo(frmRef); }
  return valid;
}

exposed.ref = topRef;
exposed.validate = validate;

</script>
