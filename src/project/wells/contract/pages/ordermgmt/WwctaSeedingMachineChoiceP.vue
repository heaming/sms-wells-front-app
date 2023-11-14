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
- props 로 계약 고객 번호와 모종기기 종류 코드를 받아서 계약자가 모종기기 결합 관계가 형성되지 않은 모종기기 계약 상세
목록을 조회하고, 단건을 선택하여 반환할 수 있다.
- deprecated: 상품선택시 먼저 기기 선택하도록 수정 됨.
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

import { alert, useDataService, useModal } from 'kw-lib';
import dayjs from 'dayjs';
import { useCtCode } from '~sms-common/contract/composable';

const props = defineProps({
  cntrNo: { type: String, default: undefined },
  cntrCstNo: { type: String, default: undefined },
  rglrSppMchnTpCd: { type: String, default: undefined },
});

const { ok, cancel } = useModal();
const dataService = useDataService();
const { t } = useI18n();
const { getCodeName } = await useCtCode('RGLR_SPP_MCHN_TP_CD');

const machinery = ref([]);
const machineOptions = computed(() => {
  if (!machinery.value) return [];

  return machinery.value.map((machine) => ({
    codeId: `${machine.cntrNo}-${machine.cntrSn}`,
    codeName: `${machine.pdNm
    } / ${
      machine.cntrNo}-${machine.cntrSn
    } / ${t('설치일')}:${dayjs(machine.istDt)
      .format('YYYY-MM-DD')} / ${getCodeName('RGLR_SPP_MCHN_TP_CD', machine.rglrSppMchnTpCd)}`,
  }));
});
const selected = ref(undefined);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function validateProps() {
  if (!props.cntrNo && !props.cntrCstNo) {
    await alert('기존 계약을 조회하기 위해 고객 정보가 필요합니다.');
    cancel();
  }
}

await validateProps();

async function fetchMachines() {
  const params = {
    cntrNo: props.cntrNo,
    cntrCstNo: props.cntrCstNo,
    rglrSppMchnTpCd: props.rglrSppMchnTpCd,
  };
  const response = await dataService.get('/sms/wells/contract/seeding/machinery', { params });
  machinery.value = response.data;
  if (machinery.value.length > 0 && machinery.value[0]) {
    selected.value = `${machinery.value[0].cntrNo}-${machinery.value[0].cntrSn}`;
  }
}

function onClickConfirm() {
  const selectedMachine = machinery.value.find((machine) => `${machine.cntrNo}-${machine.cntrSn}` === selected.value);
  ok(selectedMachine);
}

function onClickCancel() {
  cancel();
}

await fetchMachines();
</script>

<style scoped lang="scss">
:deep(.kw-option-group) {
  .kw-option-group__control {
    gap: $spacing-lg;
  }
}

</style>
