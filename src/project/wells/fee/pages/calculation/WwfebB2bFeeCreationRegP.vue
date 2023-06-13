<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebB2bFeeCreationRegP - B2B 수수료 생성관리 -> 수수료 생성
3. 작성자 : mj
4. 작성일 : 2023.04.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- B2B 수수료 관리 -> 수수료 생성 버튼클릭시 나오는 팝업이다.
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
            v-model="regData.perfYm"
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
import { useModal, useDataService, useGlobal } from 'kw-lib';

const { cancel, ok } = useModal();
const { notify } = useGlobal();

const { t } = useI18n();
const props = defineProps({
  perfYm: {
    type: String,
    default: '',
  },
  feeTcntDvCd: {
    type: String,
    default: '02',
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const popupRef = ref();
const dataService = useDataService();
const regData = ref({
  feeCalcUnitTpCd: '401', // B2B 수수료
  feeTcntDvCd: props.feeTcntDvCd, // defulat 2차수
  perfYm: props.perfYm,
});
// 취소
async function onClickCancel() {
  cancel();
}
// 생성
async function onClickCreate() {
  if (!await popupRef.value.validate()) { return; }

  await dataService.post(`/sms/common/fee/fee-calculation/${regData.value.perfYm}-${regData.value.feeTcntDvCd}-${regData.value.feeCalcUnitTpCd}`);
  notify(t('MSG_ALT_CRT_FSH')); // 생성되었습니다.
  ok(true);
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
