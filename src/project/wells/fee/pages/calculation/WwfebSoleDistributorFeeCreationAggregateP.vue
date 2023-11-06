<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebSoleDistributorFeeCreationAggregateP - 총판 수수료 생성관리 -> 집계
3. 작성자 : mj
4. 작성일 : 2023.04.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 수수료 관리 -> 집계 버튼클릭시 나오는 팝업이다.
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="sm"
  >
    <kw-form :cols="1">
      <kw-form-row>
        <!-- 실적년월 -->
        <kw-form-item
          :label="$t('MSG_TXT_PERF_YM')"
        >
          <p>{{ regData.perfYm.substring(0,4) + '-' + regData.perfYm.substring(4) }}</p>
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
        :label="$t('MSG_BTN_AGRG')"
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
  perfYm: props.perfYm,
  feeTcntDvCd: props.feeTcntDvCd, // default 2차수
});
// 취소
async function onClickCancel() {
  cancel();
}
// 집계
async function onClickCreate() {
  if (!await popupRef.value.validate()) { return; }

  await dataService.post('/sms/wells/fee/sole-distributor/aggregate', { perfYm: regData.value.perfYm, feeTcntDvCd: regData.value.feeTcntDvCd });
  ok(true);
  notify(t('MSG_ALT_AGRG_FSH')); // 집계되었습니다.
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
