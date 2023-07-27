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
          v-model="changeTarget"
          class="self-start"
          label="대상변경"
          boolean-value
          @update:model-value="onChangeChangeTarget"
        />
        <kw-input
          v-model="cstKnm"
          label="대상자명"
          rules="required"
          :readonly="!changeTarget"
          :validate-on-value-update="false"
        />
        <kw-select
          v-model="cssrIsDvCd"
          label="인증방법"
          rules="required"
          :readonly="!changeTarget"
          :options="codes.CSSR_IS_DV_CD"
          :validate-on-value-update="false"
          @change="onChangeCssrIsDvCd"
        />
        <kw-input
          v-if="cssrIsDvCd === '1'"
          v-model="cssrIsNo"
          label="카드번호"
          mask="####-####-####-####"
          unmasked-value
          rules="required|min:14"
          :readonly="!changeTarget"
          :validate-on-value-update="false"
        />
        <kw-input
          v-if="cssrIsDvCd === '3'"
          v-model="cssrIsNo"
          label="사업자번호"
          rules="required|length:10"
          :maxlength="10"
          :readonly="!changeTarget"
          :validate-on-value-update="false"
        />
        <kw-input
          v-if="cssrIsDvCd === '4'"
          v-model="cssrIsNo"
          label="휴대전화번호"
          mask="###-####-####"
          unmasked-value
          :readonly="!changeTarget"
          :validate-on-value-update="false"
        />
      </kw-form>
    </kw-item-section>
  </wwcta-contract-settlement-agree-item>
</template>

<script setup>
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';
import { codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import { scrollIntoView } from '~sms-common/contract/util';

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
const initialValue = cloneDeep(props.modelValue);

function onChangeChangeTarget(val) {
  if (val === true) {
    cstKnm.value = '';
    cssrIsDvCd.value = undefined;
    cssrIsNo.value = '';
  }
  if (val === false) {
    cstKnm.value = initialValue.cstKnm;
    cssrIsDvCd.value = initialValue.cssrIsDvCd;
    cssrIsNo.value = initialValue.cssrIsNo;
  }
}

function onChangeCssrIsDvCd() {
  if (changeTarget.value) {
    cssrIsNo.value = '';
  }
}

const topRef = ref();
const frmRef = ref();

async function validate() {
  if (!props.modelValue) { return true; }
  if (!changeTarget) { return true; }
  const valid = await frmRef.value.validate();
  if (!valid) { scrollIntoView(frmRef); }
  return valid;
}

exposed.ref = topRef;
exposed.validate = validate;

</script>
