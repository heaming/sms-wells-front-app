<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebSoleDistributorFeeCreationRegP - 총판 수수료 생성관리 -> 수수료 생성
3. 작성자 : mj
4. 작성일 : 2023.04.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 수수료 관리 -> 수수료 생성 버튼클릭시 나오는 팝업이다.
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
          :required="isEmpty(props.perfYm)"
        >
          <p v-if="!isEmpty(props.perfYm)">
            {{ regData?.perfYm ? stringUtil.getDateFormat(regData?.perfYm).substring(0,7) : '' }}
          </p>
          <kw-date-picker
            v-if="isEmpty(props.perfYm)"
            v-model="regData.perfYm"
            rules="required"
            type="month"
            :label="$t('MSG_TXT_PERF_YM')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ORDR')"
          :required="isEmpty(props.feeTcntDvCd)"
        >
          <p v-if="!isEmpty(props.feeTcntDvCd)">
            {{ codes.FEE_TCNT_DV_CD.find((v) => v.codeId === regData?.feeTcntDvCd)?.codeName }}
          </p>
          <kw-select
            v-if="isEmpty(props.feeTcntDvCd)"
            v-model="regData.feeTcntDvCd"
            :options="codes.FEE_TCNT_DV_CD"
            rules="required"
            first-option="select"
            :label="$t('MSG_TXT_ORDR')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PRGS_STATUS')"
        >
          <p>
            {{ calculationFeeStatus }}
          </p>
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
import { useModal, useDataService, useGlobal, stringUtil, codeUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';

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
    default: '',
  },
  ogTpCd: {
    type: String,
    default: '',
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'FEE_TCNT_DV_CD',
);
const popupRef = ref();
const dataService = useDataService();
const regData = ref({
  perfYm: props.perfYm,
  feeTcntDvCd: props.feeTcntDvCd,
  feeCalcUnitTpCd: '501', // 총판수수료
});
const deductionData = ref({
  ogTpCd: props.ogTpCd,
  ddtnYm: props.perfYm,
  feeTcntDvCd: (isEmpty(props.feeTcntDvCd) ? '02' : props.feeTcntDvCd),
  rsbDvCd: '',
});
const calculationFeeStatus = ref('');
// 취소
async function onClickCancel() {
  cancel();
}
/* 수수료계산진행상태 체크 - 두번째 이상 */
async function checkFeeCalcPrtcContStatus(feeCalcPrtcId) {
  const res = await dataService.get(`/sms/common/fee/fee-calc-prtc-hist/fee-calc-prtc-status/${feeCalcPrtcId}`);

  if (res.data.feeCalcPrtcStatCd === '01') {
    calculationFeeStatus.value = res.data.calculationFeeStatusString;
    setTimeout(async () => await checkFeeCalcPrtcContStatus(feeCalcPrtcId), 1000);
  }
}

/* 수수료계산진행상태 체크 - 최초 */
async function checkFeeCalcPrtcStatus() {
  const res = await dataService.get(`/sms/common/fee/fee-calc-prtc-hist/fee-calc-prtc-first-status/${regData.value.perfYm}-${regData.value.feeTcntDvCd}-${regData.value.feeCalcUnitTpCd}`);

  if (res.data.feeCalcPrtcStatCd === '01') {
    calculationFeeStatus.value = res.data.calculationFeeStatusString;
    setTimeout(async () => await checkFeeCalcPrtcContStatus(res.data.feeCalcPrtcId), 1000);
  }
}
// 수수료생성 생성 & 가지급금 생성
async function onClickCreate() {
  if (!await popupRef.value.validate()) { return; }

  await Promise.all([
    dataService.post(`/sms/common/fee/fee-calculation/${regData.value.perfYm}-${regData.value.feeTcntDvCd}-${regData.value.feeCalcUnitTpCd}`, null, { timeout: 5 * 60 * 1000 }),
    setTimeout(() => checkFeeCalcPrtcStatus(), 1000),
  ]);

  calculationFeeStatus.value = '환수되물림 데이터 반영 중';
  await dataService.post('/sms/common/fee/fee-pnpyam-deductions', deductionData.value);
  ok(true);
  notify(t('MSG_ALT_CRT_FSH')); // 생성되었습니다.
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
