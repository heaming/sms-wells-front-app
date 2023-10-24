<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaSeedingMachineChoiceP - 모종기기 선택 팝업
3. 작성자 : 박주형
4. 작성일 : 2023.05.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- props 로 계약 고객 번호와 모종기기 종류 코드를 받아서 계약자가 모종기기 결합 관계가 형성되지 않은 모종기기목록을
조회하고, 단건을 선택하여 반환할 수 있다.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
  >
    <kw-option-group
      v-model="selected"
      type="radio"
      :options="machineOptions"
      vertical
    />
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <kw-btn
        primary
        :label="$t('MSG_BTN_CONFIRM')"
        @click="onClickConfirm"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useDataService, useModal } from 'kw-lib';
import dayjs from 'dayjs';

const props = defineProps({
  cntrCstNo: { type: String, required: true },
  rglrSppMchnTpCd: { type: String, required: true },
});

const { ok, cancel } = useModal();
const dataService = useDataService();
const { t } = useI18n();

const machinery = ref([]);
const machineOptions = computed(() => {
  if (!machinery.value) return [];

  return machinery.value.map((machine) => ({
    codeId: `${machine.cntrNo}-${machine.cntrSn}`,
    codeName: `${machine.pdNm
    } / ${
      machine.cntrNo}-${machine.cntrSn
    } / ${t('설치일')}:${dayjs(machine.istDt)
      .format('YYYY-MM-DD')} / ${machine.posQty}`,
  }));
});
const selected = ref(undefined);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchMachines() {
  const params = {
    cntrCstNo: props.cntrCstNo,
    rglrSppMchnTpCd: props.rglrSppMchnTpCd,
  };
  const response = await dataService.get('/sms/wells/contract/seeding/machinery', { params });
  machinery.value = response.data;
  if (machinery.value.length > 0) {
    selected.value = machinery.value[0].pdCd;
  }
}

function onClickConfirm() {
  const seletedMachine = machinery.value.find((machine) => `${machine.cntrNo}-${machine.cntrSn}` === selected.value);
  ok(seletedMachine);
}

function onClickCancel() {
  cancel();
}

await fetchMachines();
</script>
<style scoped lang="scss">
::v-deep(.kw-option-group) {
  .kw-option-group__control {
    gap: $spacing-lg;
  }
}

</style>
