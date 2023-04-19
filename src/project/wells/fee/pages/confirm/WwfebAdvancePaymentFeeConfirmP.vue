<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebAdvancePaymentFeeConfirmP - wells 수수료 생성관리-선급판매수수료 확정
3. 작성자 : mj
4. 작성일 : 2023.04.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
wells 수수료 생성관리-선급판매수수료 확정
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="sm"
  >
    <kw-form :cols="1">
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PERF_YM')"
        >
          <kw-date-picker
            v-model="regData.baseYm"
            rules="required"
            type="month"
            :label="$t('MSG_TXT_PERF_YM')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_RSB_TP')"
          align-content="left"
        >
          <p>{{ regData.type }}</p>
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
        :label="$t('MSG_BTN_DTRM')"
        primary
        @click="onClickConfirm"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useModal, useDataService, useGlobal } from 'kw-lib';

const { cancel, ok } = useModal();
const { notify } = useGlobal();

const { t } = useI18n();
const props = defineProps({
  type: {
    type: String,
    default: '',
  },
  baseYm: {
    type: String,
    default: '',
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const popupRef = ref();
const dataService = useDataService();
const regData = ref({
  type: props.type,
  baseYm: props.baseYm,
});
// 취소
async function onClickCancel() {
  cancel();
}
// 확정
async function onClickConfirm() {
  if (!await popupRef.value.validate()) { return; }
  const res = await dataService.post('API정의안됨', { regData });
  const { key: rtnKey } = res.data;
  notify(t('MSG_ALT_SAVE_DATA'));
  ok(true, { rtnKey });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
