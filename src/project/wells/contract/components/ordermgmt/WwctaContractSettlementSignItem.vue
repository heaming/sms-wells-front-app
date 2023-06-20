<template>
  <kw-item class="pa20">
    <kw-item-section>
      <kw-item-label
        font="body"
        font-weight="500"
        class="pb12"
      >
        {{ description }}
      </kw-item-label>
      <kw-sign
        ref="signRef"
      />
      <kw-btn
        stretch
        secondary
        class="mt20"
        @click="onClickConfirm"
      >
        {{ confirmLabel }}
      </kw-btn>
    </kw-item-section>
  </kw-item>
</template>

<script setup>
import { getComponentType, notify } from 'kw-lib';
import { warn } from 'vue';

const props = defineProps({
  description: { type: String, default: undefined },
  emptyAlert: { type: [Boolean, String], default: false },
  confirmLabel: { type: String, default: '모두 확인하였습니다.' },
});

const emit = defineEmits(['confirm']);

const signRef = ref(getComponentType('KwSign'));

const defaultEmptyMsg = '전자서명이 완료되지 않았습니다. 전자서명 항목에 체크해 주세요.';

function onClickConfirm() {
  if (!signRef.value) {
    warn('KwSign component is not mounted.');
    return;
  }
  if (!signRef.value.isSignExist && props.emptyAlert !== false) {
    notify(props.emptyAlert.length ? props.emptyAlert : defaultEmptyMsg);
    return;
  }
  emit('confirm', signRef.value.getSignData());
}

</script>
