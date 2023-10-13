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
E0117: 선급판매수수료 확정
W0121: 선급판매수수료 확정
W0222 :선급판매수수료 확정
W0319: 선급판매수수료 확정
가 진행중 상태일때만 사용가능
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
          <p>
            {{ regData?.baseYm ? stringUtil.getDateFormat(regData?.baseYm).substring(0,7) : '' }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 수수료 일정 유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_RSB_TP')"
        >
          <p>
            {{ codes.FEE_SCHD_TP_CD.find((v) => v.codeId === regData?.feeSchdTpCd)?.codeName }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 차수-->
        <kw-form-item
          :label="$t('MSG_TXT_ORDR')"
        >
          <p>
            {{ codes.FEE_TCNT_DV_CD.find((v) => v.codeId === regData?.feeTcntDvCd)?.codeName }}
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
import { useModal, useDataService, useGlobal, codeUtil, stringUtil } from 'kw-lib';

const { cancel, ok } = useModal();
const { notify } = useGlobal();
const { t } = useI18n();
const props = defineProps({
  feeSchdId: { // baseYm + feeSchdTpCd + feeTcntDvCd + coCd
    type: String,
    required: true,
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const popupRef = ref();
const dataService = useDataService();
const codes = await codeUtil.getMultiCodes(
  'FEE_SCHD_LV_CD',
  'FEE_SCHD_TP_CD',
  'RSB_DV_CD',
  'FEE_TCNT_DV_CD',
);
const regData = ref({
  feeSchdId: props.feeSchdId,
  baseYm: props.feeSchdId.substr(0, 6),
  feeSchdTpCd: props.feeSchdId.substr(6, 3),
  feeTcntDvCd: props.feeSchdId.substr(9, 2),
  coCd: props.feeSchdId.substr(11, 4),
});
const presentStep = ref([{
  feeSchdId: '',
  feeSchdLvCd: '',
  feeSchdLvNm: '',
  feeSchdLvDgPsicId: '',
  feeSchdLvSubpId: '',
  lvFshPrgUseYn: '',
  feeCrtMarkYn: '',
  canPsbYn: '',
  feeSchdLvStatCd: '',
}]);
// 진행중 단계 조회
async function fetchStepStatus() {
  const { data } = await dataService.get('/sms/common/fee/schedules/present-step', {
    params: {
      baseYm: regData.value.baseYm,
      feeSchdTpCd: regData.value.feeSchdTpCd,
      feeTcntDvCd: regData.value.feeTcntDvCd,
      coCd: regData.value.coCd,
    },
  });
  presentStep.value = data;
}
// 수수료 일정 단계 상태 변경
async function confirmStat(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  ok(true);
  notify(t('MSG_TXT_CRDCD_STLM_FSH'));
}
// 취소
async function onClickCancel() {
  cancel();
}
// 생성
async function onClickConfirm() {
  if (!await popupRef.value.validate()) { return; }
  const useLevels = codes.FEE_SCHD_LV_CD.filter((v) => v.userDfn03 === 'PIA'); // 선급판매 단계
  if (!presentStep.value.some((v) => useLevels.map((x) => x.codeId).includes(v.feeSchdLvCd))) {
    notify(t('MSG_ALT_CANNOT_PAY_CONF')); // 선급판매 수수료 확정이 불가능한 단계입니다.
    return;
  }
  const { feeSchdId, feeSchdLvCd } = presentStep.value.find(
    (v) => useLevels.map((x) => x.codeId).includes(v.feeSchdLvCd),
  );
  await confirmStat(feeSchdId, feeSchdLvCd, '03');
}

onMounted(async () => {
  fetchStepStatus();
});
</script>
