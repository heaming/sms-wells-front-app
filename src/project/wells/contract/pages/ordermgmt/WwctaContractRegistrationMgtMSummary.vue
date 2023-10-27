<template>
  <kw-scroll-area
    visible
  >
    <div class="px40">
      <h2 class="pt5 row items-center">
        <span>{{ cntrNo }}</span>
        <kw-chip
          label="임시저장"
          color="placeholder"
          outline
          class="ml8"
        />
      </h2>
      <kw-list
        class="like-vertical-stepper"
        separator
      >
        <kw-expansion-item
          v-for="(curStep, index) in steps"
          :ref="(el) => sideStepRefs[curStep.name] = el"
          :key="`side-item-${index}`"
          :default-opened="index === 0"
          class="like-vertical-stepper__step"
          header-class="h24"
          :class="{
            'like-vertical-stepper__step--active': curStep.name === currentStepName,
            'like-vertical-stepper__step--checked': curStep.done.value,
          }"
          expand-icon="none"
        >
          <template #header>
            <kw-item-section
              side
              class="pr4"
            >
              <kw-avatar
                class="like-vertical-stepper__step-icon"
                :icon="curStep.done.value ? 'checked_stepper' : undefined"
              >
                {{ curStep.done.value ? undefined : index + 1 }}
              </kw-avatar>
            </kw-item-section>
            <kw-item-section>
              <kw-item-label>
                {{ curStep?.title || '' }}
              </kw-item-label>
            </kw-item-section>
          </template>
          <template
            v-if="index === 0"
          >
            <div class="like-vertical-stepper__step-content">
              <ul class="card-text">
                <li>
                  <p>계약유형</p>
                  <span>{{ getCodeName('CNTR_TP_CD', summary.cntrBas?.cntrTpCd) }}</span>
                </li>
                <li>
                  <p>계약자</p>
                  <span>{{ summary.customer?.cstKnm }}</span>
                </li>
                <li>
                  <p>판매채널</p>
                  <span>{{ getCodeName('SELL_CHNL_DTL_CD', summary.cntrBas?.sellInflwChnlDtlCd) }}</span>
                </li>
              </ul>
            </div>
          </template>
          <template
            v-else-if="index === 1"
          >
            <div class="like-vertical-stepper__step-content">
              <ul class="card-text">
                <template
                  v-for="(pd, i) in summary.cntrDtls"
                  :key="i"
                >
                  <li>
                    <p>상품영</p>
                    <span>{{ pd.cstBasePdAbbrNm || pd.pdNm || '' }}</span>
                  </li>
                  <li>
                    <p>판매유형</p>
                    <span v-if="pd.sellTpCd">{{ getCodeName('SELL_TP_CD', pd.sellTpCd) }}</span>
                    <span v-if="pd.sellTpDtlCd"> - {{ getCodeName('SELL_TP_DTL_CD', pd.sellTpDtlCd) }}</span>
                  </li>
                </template>
              </ul>
            </div>
          </template>
          <template
            v-else-if="index === 2"
          >
            <div class="like-vertical-stepper__step-content">
              <ul class="card-text">
                <li>
                  <p>결제유형</p>
                  <span>{{ rveTpCdNms }}</span>
                </li>
                <li>
                  <p>결제방법</p>
                  <span>{{ dpTpCdNms }}</span>
                </li>
              </ul>
            </div>
          </template>
        </kw-expansion-item>
      </kw-list>
      <div class="contract-summary">
        <div class="card-text">
          <ul class="card-text card-text--bigger card-text--between">
            <li>
              <p>
                등록금(계약금)
              </p>
              <span class="text-bold kw-font-pt20">
                {{ getNumberWithComma(totalSpayAmt) }}
              </span>
            </li>
          </ul>
          <kw-separator class="my16" />
          <ul class="card-text card-text--bigger card-text--between">
            <li>
              <p>
                월납부금
              </p>
              <span class="text-bold kw-font-pt20">
                {{ getNumberWithComma(totalAftnAmt) }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </kw-scroll-area>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useCtCode } from '~sms-common/contract/composable';
import { getNumberWithComma } from '~sms-common/contract/util';
import {
  getAftnAmt,
  getAftnAmtByCntrDtl,
  getSpayAmt,
  getSpayAmtByCntrDtl,
} from '~sms-wells/contract/utils/CtPriceUtil';

const props = defineProps({
  cntrNo: { type: String, default: undefined },
  steps: { type: Array, default: () => [] },
  step: { type: String, default: undefined },
  bas: { type: Object, default: undefined },
  summary: { type: Object, default: undefined },
});

const { getCodeName } = await useCtCode(
  'CNTR_TP_CD',
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'SELL_CHNL_DTL_CD',
  'RVE_DV_CD',
  'DP_TP_CD',
);

// const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const sideStepRefs = reactive({});
// const summary = ref({});

const currentStepName = ref('1');

// async function fetchSummary() {
//   await nextTick();
//   if (!props.cntrNo) { return; }
//   const { data } = await dataService.get('sms/wells/contract/contracts/summaries', {
//     params: { cntrNo: props.cntrNo },
//   });
//   summary.value = data;
// }

watch(() => props.step, () => {
  if (sideStepRefs[props.step]) {
    sideStepRefs[props.step].show();
  }
});

// function calcSpayAmt(cntrDtl) {
//   const { finalPrice, rglrSppPrmMcn } = cntrDtl;
//   let spayAmt;
//   if (finalPrice) {
//     const pdBas = { rglrSppPrmMcn };
//     spayAmt = getSpayAmt(pdBas, finalPrice);
//   } else {
//     spayAmt = getSpayAmtByCntrDtl(cntrDtl);
//   }
//   return Number(spayAmt) || 0;
// }

const totalSpayAmt = computed(() => {
  const { cntrDtls } = props.summary;
  if (!cntrDtls?.length) {
    return 0;
  }
  return cntrDtls.reduce((sum, cntrDtl) => {
    const { finalPrice, rglrSppPrmMcn, appliedPromotions } = cntrDtl;
    let added;
    if (finalPrice) {
      const pdBas = { rglrSppPrmMcn };
      added = getSpayAmt(pdBas, finalPrice, appliedPromotions);
    } else {
      added = getSpayAmtByCntrDtl(cntrDtl);
    }
    return (sum + (Number(added) || 0));
  }, 0);
});

const totalAftnAmt = computed(() => {
  const { cntrDtls } = props.summary;
  if (!cntrDtls?.length) {
    return 0;
  }
  return cntrDtls.reduce((sum, cntrDtl) => {
    const { finalPrice, appliedPromotions } = cntrDtl;
    let added;
    if (finalPrice) {
      added = getAftnAmt(finalPrice, appliedPromotions);
    } else {
      added = getAftnAmtByCntrDtl(cntrDtl);
    }
    return (sum + (Number(added) || 0));
  }, 0);
});

const rveTpCdNms = computed(() => {
  const { cntrDtls } = props.summary;
  if (!cntrDtls?.length) {
    return '';
  }
  const codeIdSet = new Set();
  cntrDtls.forEach((cntrDtl) => {
    const { sellTpCd, cntrAmt, fnlAmt } = cntrDtl;
    if (sellTpCd === '1' && fnlAmt > 0) {
      codeIdSet.add('01');
      /* TODO 멤버십 회비 추가 후 추가할 것 */
    }
    if (sellTpCd === '2' && cntrAmt > 0) {
      codeIdSet.add('01');
    }
    if (sellTpCd === '2' && fnlAmt > 0) {
      codeIdSet.add('03');
    }
    if (sellTpCd === '3' && fnlAmt > 0) {
      codeIdSet.add('03');
    }
    if (sellTpCd === '6' && cntrAmt > 0) {
      codeIdSet.add('01');
    }
    if (sellTpCd === '6' && fnlAmt > 0) {
      codeIdSet.add('03');
    }
  });
  const nms = [];
  codeIdSet.forEach((codeId) => {
    nms.push(getCodeName('RVE_DV_CD', codeId));
  });
  return nms.join(', ');
});

const dpTpCdNms = computed(() => {
  const { cntrDtls } = props.summary;
  if (!cntrDtls?.length) {
    return '';
  }
  const codeIdSet = new Set();
  cntrDtls.forEach((cntrDtl) => {
    const { dpTpCdIdrv, dpTpCdMsh, dpTpCdAftn, stlmRels } = cntrDtl;
    if (dpTpCdIdrv) { codeIdSet.add(dpTpCdIdrv); }
    if (dpTpCdMsh) { codeIdSet.add(dpTpCdMsh); }
    if (dpTpCdAftn) { codeIdSet.add(dpTpCdAftn); }

    if (stlmRels?.length) {
      stlmRels.forEach((stlmRel) => {
        const { dpTpCd } = stlmRel;
        if (dpTpCd) { codeIdSet.add(dpTpCd); }
      });
    }
  });
  const nms = [];
  codeIdSet.forEach((codeId) => {
    nms.push(getCodeName('DP_TP_CD', codeId));
  });
  return nms.join(', ');
});

</script>

<style lang="scss" scoped>
.contract-summary {
  padding: 20px;
  background: rgb(47 138 243 / 10%);
}
</style>
