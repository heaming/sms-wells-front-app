<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfActivityGoodsFeeDeductionRegP - 활동물품관리-유니폼 수수료 공제
3. 작성자 : jisung you
4. 작성일 : 2023.07.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-활동물품관리-유니폼 수수료 공제
****************************************************************************************************
--->
<template>
  <kw-popup
    size="sm"
  >
    <kw-form
      ref="frmMainRef"
      :cols="1"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_DDTN_OC_DT')"
        >
          <kw-date-picker v-model="frmMainData.feeDdtnOcDt" />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <template
      #action
    >
      <kw-btn
        :label="$t('MSG_BTN_RGST')"
        primary
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useModal, getComponentType, useDataService, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { ok } = useModal();
const dataService = useDataService();
const { notify } = useGlobal();

const { t } = useI18n();
const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref(getComponentType('KwForm'));
const props = defineProps({
  checkedRows: { type: Array, default: () => [] },
});
console.log('props.checkedRows', props.checkedRows[0]);

const frmMainData = ref({
  feeDdtnOcDt: now.format('YYYYMMDD'),
});

function initialize(rowData) {
  return rowData.map((item) => ({
    ...item,
    feeDdtnOcDt: frmMainData.value.feeDdtnOcDt,
  }));
}

let cachedParams;

async function onClickSave() {
  const data = ref(initialize(props.checkedRows));
  cachedParams = cloneDeep(data.value);

  console.log('props.checkedRows', props.checkedRows);
  await dataService.post('/sms/wells/competence/business/activity/deductionItemization', cachedParams);
  notify(t('MSG_ALT_RGSTD'));
  ok();
}

</script>
