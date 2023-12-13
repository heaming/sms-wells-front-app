<template>
  <wwcta-contract-settlement-agree-item
    :title="'정보제공 등 고객동의'"
    default-opened
  >
    <kw-list
      class="scoped-list"
    >
      <kw-item
        class="scoped-list__item scoped-list__item--total"
        :class="{'scoped-list__item--selected': agreeAll}"
      >
        <kw-item-section
          side
          center
        >
          <kw-checkbox
            :model-value="agreeAll"
            boolean-value
            @update:model-value="onChangeAgreeAll"
          />
        </kw-item-section>
        <kw-item-section>
          <kw-item-label font-weight="medium">
            전체 동의
          </kw-item-label>
        </kw-item-section>
      </kw-item>
      <kw-item
        v-for="(item) in innerAgrees"
        :key="`agree-item-${item.agAtcDvCd}`"
        class="scoped-list__item"
        :class="{'scoped-list__item--selected': item.agStatCd === AG_STAT_CD_AG}"
      >
        <kw-item-section
          side
          center
        >
          <kw-checkbox
            v-model="item.agStatCd"
            :true-value="AG_STAT_CD_AG"
            :false-value="AG_STAT_CD_REJ"
            :indeterminate-value="AG_STAT_CD_UNDEF"
            checked-icon="dialog_checked_on"
            unchecked-icon="dialog_checked_off"
            indeterminate-icon="dialog_checked_off"
          />
        </kw-item-section>
        <kw-item-section>
          <kw-item-label
            font-size="14px"
            class="ellipsis"
          >
            <span
              :class="{'text-accent': item.required}"
            >
              {{ item.required ? '[필수]' : '[선택]' }}
            </span>
            {{ item.name }}
            <kw-tooltip show-when-ellipsised>
              {{ item.name }}
            </kw-tooltip>
          </kw-item-label>
        </kw-item-section>
        <kw-item-section
          side
          center
        >
          <kw-btn
            v-if="codeTerms[item.agAtcDvCd]"
            borderless
            dense
            icon="arrow_stepper"
            @click="onClickShowTerms(item)"
          />
        </kw-item-section>
      </kw-item>
    </kw-list>
    <kw-btn
      secondary
      label="동의 관련 사항을 모두 확인하였습니다."
      class="mt20 full-width"
      @click="onClickConfirm"
    />
  </wwcta-contract-settlement-agree-item>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';

import { alert, modal } from 'kw-lib';
import { useCtCode } from '~sms-common/contract/composable';

const AG_ATC_DV_CD = 'AG_ATC_DV_CD';

const props = defineProps({
  agrees: { type: Array, default: undefined },
});

const emit = defineEmits(['confirm']);

const { getCodeName } = await useCtCode(AG_ATC_DV_CD);

const AG_STAT_CD_AG = '01';
const AG_STAT_CD_REJ = '02';
const AG_STAT_CD_UNDEF = '03';

const codeTerms = {
  111: {
    agAtcDvCd: '111', // [필수] 개인정보 수집 및 이용동의
    termsId: 'W007',
  },
};
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function onClickShowTerms(val) {
  // console.log(JSON.stringify(val, null, '\t'));
  await modal({
    component: 'ZmcsxCustomerTermsDtlP',
    componentProps: {
      termsGroupTypeCd: 'CT',
      termsTypeCd: 'CTA',
      termsId: codeTerms[val.agAtcDvCd]?.termsId,
    },
  });
}

function initialize(agrees) {
  return agrees.map((item) => ({
    ...item,
    required: item.mndtYn === 'Y',
    name: getCodeName(AG_ATC_DV_CD, item.agAtcDvCd),
  }));
}

const innerAgrees = ref(initialize(props.agrees));

const agreeAll = computed(() => {
  if (!Array.isArray(innerAgrees.value)) {
    return false;
  }
  return !innerAgrees.value.some((a) => a.agStatCd !== AG_STAT_CD_AG);
});

function onChangeAgreeAll(val) {
  if (!Array.isArray(innerAgrees.value)) {
    return;
  }
  innerAgrees.value.forEach((a) => { a.agStatCd = (val ? AG_STAT_CD_AG : AG_STAT_CD_REJ); });
}

function requiredButNotAgreeExist() {
  if (!Array.isArray(innerAgrees.value)) {
    return;
  }
  return innerAgrees.value.some((a) => {
    if (a.required && a.agStatCd !== AG_STAT_CD_AG) {
      alert(`[${a.name}] 동의 항목에 동의 해주세요.`);
      return true;
    }
    return false;
  });
}

function onClickConfirm() {
  if (requiredButNotAgreeExist()) { return; }

  emit('confirm', innerAgrees.value);
}

</script>

<style lang="scss" scoped>
@import "kw-lib/src/css/mixins";

.scoped-list {
  $-list-class: &;

  border: 1px solid #ddd;
  margin-top: 20px;

  &__item {
    $-item-class: &;

    padding: 6px 12px;
    margin: 4px 0;
    font-weight: 400;

    &:nth-of-type(2) {
      margin-top: 16px;
    }

    &:last-of-type {
      margin-bottom: 16px;
    }

    &--total {
      padding: 4px 12px;
      margin: 0;
      background-color: $bg-box;
    }

    &--selected {
      font-weight: 500;
    }
  }
}

</style>
