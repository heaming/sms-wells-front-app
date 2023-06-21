<template>
  <kw-field-wrap
    :label="'유효기간'"
    required
    control-class="flex gap-xs"
  >
    <!-- 유효기간(월) -->
    <kw-select
      v-model="mm"
      class="fit"
      :label="$t('MSG_TXT_ANYTHING_EXPDT_YM', [t('MSG_TXT_MON')])"
      :options="codes.MM_CD"
      rules="required"
      @update:model-value="onUpdateModelValue"
    />
    <!-- 유효기간(년도) -->
    <kw-select
      v-model="yy"
      class="fit"
      :label="$t('MSG_TXT_ANYTHING_EXPDT_YM', [t('MSG_TXT_Y')])"
      :options="yearList"
      rules="required"
      @update:model-value="onUpdateModelValue"
    />
  </kw-field-wrap>
</template>

<script setup>
import { codeUtil } from 'kw-lib';
import dayjs from 'dayjs';

const props = defineProps({
  modelValue: { type: String, default: undefined },
});
const { t } = useI18n();
const emit = defineEmits(['update:model-value']);

const mm = ref('');
const yy = ref('');
const curYear = dayjs().year();
const yearList = Array.from({ length: 7 }) /* 7년 표기는 ZtwdbCreditCardApprovalM 에서 그리함 */
  .map((notUse, idx) => ({
    codeId: `${curYear + idx}`,
    codeName: `${curYear + idx}${t('MSG_TXT_YEAR')}`,
  }));

watch(() => props.modelValue, (value) => {
  if (value?.length !== 6) { return; }
  const year = value.substring(0, 4);
  const month = value.substring(4, 6);
  yy.value = year;
  mm.value = month;
});

function onUpdateModelValue() {
  if (!mm.value || !yy.value) {
    return;
  }
  emit('update:model-value', `${yy.value}${mm.value}`);
}

const codes = await codeUtil.getMultiCodes(
  'MM_CD',
);
</script>

<style lang="scss" scoped>
@import "kw-lib/src/css/mixins";

.scoped-item {
  $-root: &;

  & :deep(.kw-item__section) {
    &.q-item__section--side {
      min-width: 68px;
      padding-right: $spacing-xs;
    }

    &.q-item__section--main ~ .q-item__section--side {
      min-width: 44px;
      padding-right: 0;
    }
  }

  &__section-type {
    justify-content: flex-start;
    width: 68px;
    padding-right: $spacing-xs;
  }

  &__type {
    color: $black3;
    font-size: 14px;
    line-height: 24px !important; // quasat 부터 시작한 유구한 역사의 important.
    font-weight: normal;
    letter-spacing: normal;
  }

  &__section-main {
    justify-content: flex-start;
  }

  &__main {
    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;
    gap: $spacing-xs;
  }

  &__product-name {
    @include typo("body");
  }

  &__chips {
    display: flex;
    gap: $spacing-xxs;
  }

  &__section-price {
    justify-content: flex-start;
    flex: none;
    padding-left: $spacing-xs;
  }

  &__price {
    @include typo("body");

    font-weight: bold;
  }

  &__price-prev {
    @include typo("dense");

    color: $black3;
    text-decoration: line-through;
    text-align: right;
  }

  &__section-action {
    min-width: 44px;
    justify-content: flex-start;

    > .kw-btn {
      font-size: 24px;
    }
  }

  &--data-modifier {
    margin-top: 12px;

    :deep(.kw-item__section) {
      &.q-item__section--main:first-of-type {
        margin-left: 68px;
      }

      &.q-item__section--main:last-of-type {
        margin-right: 44px;
      }
    }
  }

  &__field-row {
    display: flex;
    flex-flow: row nowrap;
    gap: $spacing-xs;

    & > :where(.kw-field, .kw-field-wrap) {
      width: 100%;
    }
  }

  &--sub-content {
    margin-top: 16px;

    &.kw-item {
      min-height: unset;
    }

    #{$-root}__product-name {
      font-weight: normal;
    }

    #{$-root}__price {
      font-weight: normal;
    }
  }

  &__addon {
    margin-top: 16px;
    font-size: 14px;
    color: $black1;
    font-weight: normal;

    > .scoped-item__type {
      line-height: 20px !important;
      padding-right: $spacing-xs;
    }

    &::before {
      content: "";
      display: inline-block;
      margin-bottom: 5px;
      margin-right: 4.5px;
      width: 9px;
      height: 8.5px;
      border-left: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
    }
  }
}
</style>
