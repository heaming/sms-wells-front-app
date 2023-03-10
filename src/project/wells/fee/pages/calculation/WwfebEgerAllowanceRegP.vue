<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebEgerAllowanceRegP - 엔지니어 수당 생성관리-수당생성
3. 작성자 : haejin.lee
4. 작성일 : 2023.02.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 엔지니어 수당 생성관리-수당생성
****************************************************************************************************
--->
<template>
  <kw-popup
    size="sm"
  >
    <kw-form
      :cols="1"
      dense
    >
      <kw-form-row>
        <!-- 실적년월 -->
        <kw-form-item
          :label="$t('MSG_TXT_PERF_YM')"
        >
          <p>{{ params.param1 }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 직책유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_RSB_TP')"
        >
          <p>{{ params.param2 }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_TXT_CANCEL')"
        @click="onClickCancel"
      />
      <kw-btn
        primary
        :label="$t('MSG_TXT_CRT')"
        @click="onClickCreate"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, useModal } from 'kw-lib';

const { cancel, ok } = useModal();
const { t } = useI18n();
const { confirm } = useGlobal();
const dataService = useDataService();

const props = defineProps({
  param1: { // 실적년월
    type: String,
    required: true,
  },
  param2: { // 직책유형
    type: String,
    required: true,
  },
});

const params = ref({
  param1: props.param1,
  param2: props.param2,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function onClickCancel() {
  cancel();
}

async function onClickCreate() {
  if (!await confirm(t('MSG_ALT_CREATED'))) { return; }
  const response = await dataService.post('/sms/wells/fee/eger-allowances/creates', params.value);
  ok(response.data);
}

</script>
