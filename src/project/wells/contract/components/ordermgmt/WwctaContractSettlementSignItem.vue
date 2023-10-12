<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : 고객 동의 화면에서 반복되는 레이아웃이 귀찮아서 만든 컴포넌트
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-06-13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객 동의 화면에서 반복되는 레이아웃이 귀찮아서 만든 컴포넌트
- 너비를 초기 너비에 맞추어 늘려주기도 함.
****************************************************************************************************
--->
<template>
  <kw-item class="pa20">
    <kw-item-section>
      <slot name="top">
        <kw-item-label
          font="body"
          font-weight="500"
          class="pb12"
        >
          {{ description }}
        </kw-item-label>
      </slot>

      <zctz-sign
        ref="signRef"
        :empty-alert="emptyAlert"
      />

      <slot name="bottom">
        <kw-btn
          v-if="!hideConfirm"
          stretch
          secondary
          class="mt20"
          @click="onClickConfirm"
        >
          {{ confirmLabel }}
        </kw-btn>
      </slot>
    </kw-item-section>
  </kw-item>
</template>

<script setup>
import ZctzSign from '~sms-common/contract/components/ZctzSign.vue';

defineProps({
  description: { type: String, default: undefined },
  emptyAlert: { type: [Boolean, String], default: false },
  hideConfirm: Boolean,
  confirmLabel: { type: String, default: '모두 확인하였습니다.' },
});

const emit = defineEmits(['confirm']);

const exposed = {};
defineExpose(exposed);

const signRef = ref();

function getSignData() {
  return signRef.value.getSignData();
}

function onClickConfirm() {
  const data = getSignData();
  if (data) {
    emit('confirm', data);
  }
}

exposed.signRef = signRef;
exposed.getSignData = getSignData;

</script>
