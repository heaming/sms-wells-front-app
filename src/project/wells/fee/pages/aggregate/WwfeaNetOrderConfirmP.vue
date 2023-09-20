<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaNetOrderConfirmP - 월 순주문 집계 확정
3. 작성자 : min-kyu bae
4. 작성일 : 2023.06.15
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 월 순주문 집계 확정 팝업 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="sm"
  >
    <kw-form
      :cols="1"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PERF_YM')"
        >
          <p>{{ data.baseYm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_DIV')"
        >
          <p>{{ data.tcntDvTxt }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        negative
        @click="onClickCancel"
      />
      <kw-btn
        v-permission:update
        :label="$t('MSG_BTN_DTRM')"
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
import { useDataService, useGlobal, useModal } from 'kw-lib';

const { cancel, ok } = useModal();
const { confirm } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();

const props = defineProps({
  perfYm: {
    type: String,
    default: '',
  },
  feeTcntDvCd: {
    type: String,
    default: '',
  },
  tcntDvTxt: {
    type: String,
    default: '',
  },
});

const data = ref({
  baseYm: props.perfYm,
  perfYm: props.perfYm.replaceAll(/[^0-9]/g, ''),
  feeTcntDvCd: props.feeTcntDvCd,
  tcntDvTxt: props.tcntDvTxt,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function onClickCancel() {
  cancel();
}

/*
 *  Event - 수수료 집계정보 확정
 */
async function onClickSave() {
  if (!await confirm(t('MSG_ALT_DTRM'))) { return; }
  const response = await dataService.post('/sms/wells/fee/monthly-net/confirm', data.value);
  ok(response.data);
}

</script>
