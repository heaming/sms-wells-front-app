<template>
  <kw-expansion-item
    class="scoped-item"
    :header-class="mergedHeaderClass"
    expand-icon-class="hidden"
    :expand-icon-toggle="expandIconToggle"
    :default-opened="defaultOpened"
  >
    <template #header="scoped">
      <slot
        name="header"
        v-bind="scoped"
      >
        <kw-item-section>
          <kw-item-label
            font="subtitle"
            class="flex align-center justify-between text-black1"
            font-weight="500"
          >
            <slot name="title">
              {{ title }}
            </slot>
            <kw-btn
              v-if="isExistExpandBtn"
              borderless
              :class="mergedExpandIconClass"
              :icon="expandIcon"
            />
          </kw-item-label>
          <kw-item-label
            v-if="isExistDescription"
            font="dense"
            font-weight="400"
            class="text-black2 pt8"
          >
            <slot name="description">
              {{ description }}
            </slot>
          </kw-item-label>
        </kw-item-section>
      </slot>
    </template>
    <slot />
  </kw-expansion-item>
</template>

<script setup>

import { normalizeClass } from 'vue';

const props = defineProps({
  title: { type: String, default: undefined },
  description: { type: String, default: undefined },
  hideExpandIcon: Boolean,
  expandIcon: { type: String, default: 'arrow_down_24' },
  expandIconClass: { type: String, default: undefined },
  expandIconToggle: Boolean,
  defaultOpened: Boolean,
  headerClass: { type: [Object, Array, String], default: undefined },
});

const slots = useSlots();

const isExistDescription = computed(() => {
  if (props.description) { return true; }
  return props.description?.length || slots.description;
});

const mergedHeaderClass = computed(() => normalizeClass([props.headerClass, 'scoped-hp-unset-min-height']));

const mergedExpandIconClass = computed(() => {
  const clazz = ['kw-font-body'];
  if (props.hideExpandIcon) {
    clazz.push('hidden');
  }
  return normalizeClass([props.expandIconClass, clazz]);
});
const isExistExpandBtn = computed(() => true);
</script>

<style lang="scss" scoped>
:deep(.scoped-hp-unset-min-height) {
  min-height: auto !important;
}

:deep(.kw-item__section.q-item__section:has(.q-expansion-item__toggle-icon)) {
  padding-right: 0 !important; /* 고쳐줘 */
  padding-left: 0 !important;
}

.scoped-item {
  padding: 20px;
}
</style>
