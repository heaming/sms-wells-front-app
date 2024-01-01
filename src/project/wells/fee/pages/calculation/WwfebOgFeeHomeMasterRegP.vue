<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebOgFeeHomeMasterRegP - 홈마스터 수수료 생성관리 -> 수수료 생성
3. 작성자 : mj
4. 작성일 : 2023.04.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- ? 수수료 수수료 관리 -> 수수료 생성 버튼클릭시 나오는 팝업이다.
// 수수료 생성 버튼
async function onClickCreate() {
  // 조회후 진행
  const { result: isChanged } = await modal({
    component: 'WwfebOgFeeHomeMasterRegP',
    componentProps: {
      perfYm: searchParams.value.perfYm
    },
  });
  if (isChanged) {
    fetchData();
  }
}
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
          :label="$t('MSG_TXT_RSB_TP')"
          :required="isEmpty(props.feeCalcUnitTpCd)"
        >
          <p v-if="!isEmpty(props.feeCalcUnitTpCd)">
            {{ codes.FEE_CALC_UNIT_TP_CD.find((v) => v.codeId === regData?.feeCalcUnitTpCd)?.codeName }}
          </p>
          <kw-select
            v-if="isEmpty(props.feeCalcUnitTpCd)"
            v-model="regData.feeCalcUnitTpCd"
            :options="codes.FEE_CALC_UNIT_TP_CD.filter((v) => v.userDfn03 === 'W03')"
            rules="required"
            first-option="select"
            :label="$t('MSG_TXT_RSB_TP')"
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
import { useModal, useDataService, useGlobal, codeUtil, stringUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';

const { cancel, ok } = useModal();
const { notify } = useGlobal();

const { t } = useI18n();
const props = defineProps({
  perfYm: {
    type: String,
    default: '',
  },
  feeCalcUnitTpCd: {
    type: String,
    default: '',
  },
  feeTcntDvCd: {
    type: String,
    default: '',
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'FEE_CALC_UNIT_TP_CD',
  'FEE_TCNT_DV_CD',
);
const popupRef = ref();
const dataService = useDataService();
const regData = ref({
  feeCalcUnitTpCd: props.feeCalcUnitTpCd,
  feeTcntDvCd: props.feeTcntDvCd,
  perfYm: props.perfYm,
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
// 생성
async function onClickCreate() {
  if (!await popupRef.value.validate()) { return; }
  await Promise.all([
    dataService.post(`/sms/common/fee/fee-calculation/${regData.value.perfYm}-${regData.value.feeTcntDvCd}-${regData.value.feeCalcUnitTpCd}`, null, { timeout: 5 * 60 * 1000 }),
    setTimeout(() => checkFeeCalcPrtcStatus(), 1000),
  ]);

  ok(true);
  notify(t('MSG_ALT_CRT_FSH')); // 생성되었습니다.
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
