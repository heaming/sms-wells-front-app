<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebFeeStep - 수수료 일정 관련 stepper
3. 작성자 : mj
4. 작성일 : 2023.05.03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 네이게이션 전용 스텝퍼
****************************************************************************************************
--->
<template>
  <kw-stepper
    v-model="stepInitNum"
    header-nav
    heading-text
    alternative-labels
    @update:model-value="onClickStep()"
  >
    <template
      v-for="(item, index) in stepList"
      :key="index"
    >
      <kw-step
        :header-nav="item.stat !== 'x' && item.useYn === 'Y'"
        :prefix="index+1"
        :name="item.feeSchdLvCd"
        :title="item.feeSchdLvNm"
        :tooltip="$t('MSG_TXT_CLICK_PRGS', [item.feeSchdLvNm])"
        :done="item.stat === 'done'"
        :done-icon="item.doneIcon"
        :active-icon="item.activeIcon"
      />
    </template>
  </kw-stepper>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService } from 'kw-lib';

const props = defineProps({
  baseYm: { type: String, default: null },
  feeSchdTpCd: { type: String, default: null },
  feeTcntDvCd: { type: String, default: null },
  coCd: { type: String, default: null },
});
const emits = defineEmits([
  'clickStep',
]);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const stepInitNum = ref('');
const stepList = ref([]);
const dataService = useDataService();

async function onClickStep() {
  emits('clickStep', stepInitNum.value);
}

async function initProps() {
  console.log(props);
  const feeSchdId = `${props.baseYm}${props.feeSchdTpCd}${props.feeTcntDvCd}${props.coCd}`;
  // api호출
  const { data } = await dataService.get(`/sms/common/fee/schedules/step-navi/${feeSchdId}`);
  stepList.value = data;
  stepInitNum.value = data.find((row) => row.stat === 'do').feeSchdLvCd;
}

await initProps();
</script>
