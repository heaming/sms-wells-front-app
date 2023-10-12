<template>
  <kw-expansion-item
    class="scoped-expansion-item"
    :class="{'text-strike': !applied}"
    header-class="scoped-item scoped-expansion-item__header"
    :expand-icon-toggle="!pmotFreeGiftsExist"
    expand-icon-class="hidden"
    default-opened
  >
    <template #header>
      <kw-item-section side />
      <kw-item-section>
        <div class="row no-wrap items-center gap-xs">
          <kw-chip
            :label="'프로모션'"
            outline
            color="primary"
          />
          <div
            class="grow ellipsis pr8 hp-w1"
          >
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black1"
            >
              {{ promotion.pmotNm }}
            </kw-item-label>
            <kw-tooltip show-when-ellipsised>
              {{ promotion.pmotNm }} {{ promotion.pmotCd }}
            </kw-tooltip>
          </div>
          <div
            v-if="promotion.dscApyMcnt"
            class="row"
          >
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black3"
            >
              할인개월
            </kw-item-label>
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black1 ml8"
            >
              {{ `${promotion.dscApyMcnt}개월` }}
            </kw-item-label>
          </div>
          <div
            v-if="promotion.dscApyAmt"
            class="row"
          >
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black3"
            >
              할인금액
            </kw-item-label>
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black1 ml8"
            >
              {{ `${promotion.dscApyAmt}원` }}
            </kw-item-label>
          </div>
          <div
            v-if="promotion.freeMcnt"
            class="row"
          >
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black3"
            >
              무료개월
            </kw-item-label>
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black1 ml8"
            >
              {{ `${promotion.freeMcnt}개월` }}
            </kw-item-label>
          </div>
          <div
            v-if="promotion.rentalFxam"
            class="row"
          >
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black3"
            >
              할인판매가
            </kw-item-label>
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black1 ml8"
            >
              {{ `${promotion.rentalFxam}원` }}
            </kw-item-label>
          </div>
          <div
            v-if="pmotFreeGiftsExist"
            class="row"
          >
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black3"
            >
              사은품
            </kw-item-label>
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black1 ml8 "
            >
              {{ `${promotion.pmotFreeGifts?.length}건` }}
            </kw-item-label>
          </div>
        </div>
      </kw-item-section>
      <kw-item-section side>
        <kw-btn
          v-if="promotion.pmotNapdPsbYn === 'Y'"
          borderless
          :icon="applied ? 'close_24' :'retry' "
          class="w24 kw-font-pt24"
          @click="onTogglePromotion"
        />
      </kw-item-section>
    </template>
    <kw-item
      v-for="(frg, idx) in promotion.pmotFreeGifts"
      :key="`pmot-free-gift-${frg.fgptCd}-${idx}`"
      class="scoped-item scoped-item--free-gift"
    >
      <kw-item-section class="row">
        <div class="row no-wrap items-center gap-xs">
          <kw-separator
            class=""
            vertical
            size="8px"
            color="lime-1"
            :spaced="false"
          />
          <div
            class="row grow ellipsis pr8 hp-w1"
          >
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black3"
            >
              {{ '사은품' }}
            </kw-item-label>
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black1 ml8 ellipsis"
            >
              {{ frg.fgptNm ?? frg.fgptCd }}
            </kw-item-label>
          </div>
          <div
            v-if="frg.fgptQty"
            class="row"
          >
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black3"
            >
              {{ '상품수' }}
            </kw-item-label>
            <kw-item-label
              font="dense"
              font-weight="normal"
              class="kw-fc--black1 ml8 "
            >
              {{ `${frg.fgptQty}개` }}
            </kw-item-label>
          </div>
        </div>
      </kw-item-section>
    </kw-item>
  </kw-expansion-item>
</template>

<script setup>
const props = defineProps({
  promotion: { type: Object, required: true },
});
const emit = defineEmits(['change-applied']);

const applied = ref(props.promotion?.applied ?? true); /* 프로모션적용여부 */

watch(() => props.promotion?.applied, (val) => {
  applied.value = val;
});
const pmotFreeGiftsExist = computed(() => !!props.promotion.pmotFreeGifts?.length);

function onTogglePromotion() {
  applied.value = !applied.value;
  emit('change-applied', applied.value);
}

</script>

<style lang="scss" scoped>
@import "kw-lib/src/css/mixins";

.scoped-item {
  $-left-side-width: 68px;
  $-right-side-width: 44px;

  & :deep(> .kw-item__section) {
    &.q-item__section--side {
      min-width: $-left-side-width;
      padding-right: $spacing-xs;
    }

    &.q-item__section--main ~ .q-item__section--side {
      min-width: $-right-side-width;
      padding-right: 0;
    }

    &.q-item__section:first-of-type {
      &.q-item__section--main {
        margin-left: $-left-side-width;
      }
    }

    &.q-item__section:last-of-type {
      &.q-item__section--main {
        margin-right: $-right-side-width;
      }
    }
  }

  &--free-gift {
    min-height: 30px;
  }
}

.scoped-expansion-item {
  $-left-side-width: 68px;
  $-right-side-width: 44px;

  & :deep(.scoped-expansion-item__header) {
    &.scoped-item {
      > .kw-item__section {
        &.q-item__section--side {
          min-width: $-left-side-width;
          padding-right: $spacing-xs;
        }

        &.q-item__section--main ~ .q-item__section--side {
          min-width: $-right-side-width;
          padding-right: 0;
        }

        &.q-item__section:first-of-type {
          &.q-item__section--main {
            margin-left: $-left-side-width;
          }
        }

        &.q-item__section:last-of-type {
          &.q-item__section--main {
            margin-right: $-right-side-width;
          }
        }
      }
    }
  }
}
</style>
