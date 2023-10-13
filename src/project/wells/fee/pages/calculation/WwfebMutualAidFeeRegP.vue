<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebMutualAidFeeRegP - 상조 수수료 관리 -> 수수료 생성
3. 작성자 : mj
4. 작성일 : 2023.04.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상조 수수료 관리 -> 수수료 생성 버튼클릭시 나오는 팝업이다.
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="sm"
  >
    <kw-form :cols="1">
      <kw-form-row>
        <!-- 기준일자 -->
        <kw-form-item
          :label="$t('MSG_TXT_PERF_YM')"
          :required="isEmpty(props.baseYm)"
        >
          <p v-if="!isEmpty(props.baseYm)">
            {{ regData?.baseYm ? stringUtil.getDateFormat(regData?.baseYm).substring(0,7) : '' }}
          </p>
          <kw-date-picker
            v-if="isEmpty(props.baseYm)"
            v-model="regData.baseYm"
            rules="required"
            type="month"
            :label="$t('MSG_TXT_PERF_YM')"
          />
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
        :label="$t('MSG_BTN_CNTN_CREATE')"
        primary
        @click="onClickCreate"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useModal, useDataService, useGlobal, stringUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';

const { cancel, ok } = useModal();
const { notify } = useGlobal();

const { t } = useI18n();
const props = defineProps({
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
  baseYm: props.baseYm,
});
// 취소
async function onClickCancel() {
  cancel();
}
// 생성
async function onClickCreate() {
  if (!await popupRef.value.validate()) { return; }
  await dataService.post('/sms/wells/fee/mutual-aid/create', { baseYm: regData.value.baseYm });
  ok(true);
  notify(t('MSG_ALT_SAVE_DATA'));
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
