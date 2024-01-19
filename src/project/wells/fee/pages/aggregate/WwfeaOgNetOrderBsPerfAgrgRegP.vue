<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaOgNetOrderBsPerfAgrgRegP 조직별 수수료 순주문 관리-BS실적 집계
3. 작성자 : seoin.jeon
4. 작성일 : 2023.02.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 조직별 수수료 순주문 관리-BS실적 집계
****************************************************************************************************
--->
<template>
  <kw-popup
    size="sm"
  >
    <kw-form :cols="1">
      <kw-form-row>
        <!-- 실적년월 -->
        <kw-form-item :label="$t('MSG_TXT_PERF_YM')">
          <p>{{ params.perfYm.substring(0,4) }}-{{ params.perfYm.substring(4) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 조직유형 -->
        <kw-form-item :label="$t('MSG_TXT_OG_TP')">
          <p>{{ codes.OG_TP_CD.find((v) => v.codeId === params?.ogTpCd)?.codeName }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 차수 -->
        <kw-form-item :label="$t('MSG_TXT_ORDR')">
          <p>{{ codes.FEE_TCNT_DV_CD.find((v) => v.codeId === params?.feeTcntDvCd)?.codeName }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PRGS_STATUS')"
        >
          <p>
            {{ perfAgrgStatus }}
          </p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <!-- 취소 -->
      <kw-btn
        negative
        :label="$t('MSG_TXT_CANCEL')"
        @click="onClickCancel"
      />
      <!-- 집계 -->
      <kw-btn
        v-permission:create
        primary
        :label="$t('MSG_TXT_AGRG')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, useModal, codeUtil } from 'kw-lib';

const { cancel, ok } = useModal();
const { t } = useI18n();
const { confirm, notify } = useGlobal();
const dataService = useDataService();

const props = defineProps({
  perfYm: { // 실적년월
    type: String,
    required: true,
  },
  ogTpCd: { // 조직유형코드
    type: String,
    required: true,
  },
  feeTcntDvCd: { // 수수료차수구분코드
    type: String,
    required: true,
  },
});

// 조회조건
const params = ref({
  perfYm: props.perfYm,
  ogTpCd: props.ogTpCd,
  feeTcntDvCd: props.feeTcntDvCd,
  perfAgrgCrtDvCd: props.ogTpCd === 'W02' ? '201' : '301',
});
const perfAgrgStatus = ref('');

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'FEE_TCNT_DV_CD',
  'OG_TP_CD',
);

// 취소
async function onClickCancel() {
  cancel();
}
/* 실적집계진행상태 체크 - 두번째 이상 */
async function checkPerfAgrgPrtcContStatus(perfAgrgPrtcId) {
  const res = await dataService.get(`/sms/common/fee/perf-agrg-prtc-hist/perf-agrg-prtc-status/${perfAgrgPrtcId}`, { spinner: false });

  if (res.data.perfAgrgPrtcStatCd === '01') {
    perfAgrgStatus.value = res.data.perfAgrgStatusString;
    setTimeout(async () => await checkPerfAgrgPrtcContStatus(perfAgrgPrtcId), 1000);
  }
}

/* 실적집계진행상태 체크 - 최초, 배치를 호출하고 실행ID가 변경될 때까지 반복 */
async function checkPerfAgrgPrtcStatus(beforePerfAgrgPrtcId = undefined) {
  const res = await dataService.get(`/sms/common/fee/perf-agrg-prtc-hist/perf-agrg-prtc-first-status/${params.value.perfYm}-${params.value.feeTcntDvCd}-02-${params.value.perfAgrgCrtDvCd}`, { spinner: false });

  if (beforePerfAgrgPrtcId === undefined || beforePerfAgrgPrtcId === res.data.perfAgrgPrtcId) {
    setTimeout(async () => await checkPerfAgrgPrtcStatus(res.data.perfAgrgPrtcId), 1000);
  } else if (beforePerfAgrgPrtcId !== res.data.perfAgrgPrtcId) {
    if (res.data.perfAgrgPrtcStatCd === '01') {
      perfAgrgStatus.value = res.data.perfAgrgStatusString;
      setTimeout(async () => await checkPerfAgrgPrtcContStatus(res.data.perfAgrgPrtcId), 1000);
    }
  }
}
// 집계
async function onClickSave() {
  if (!await confirm(t('MSG_ALT_AGRG'))) { return; }

  perfAgrgStatus.value = '실적집계 호출 중';
  // params.value.perfAgrgCrtDvCd = params.value.ogTpCd === 'W02' ? '201' : '301';
  const [response] = await Promise.all([
    dataService.post('/sms/wells/fee/bs-fees', params.value, { timeout: 600000 }),
    checkPerfAgrgPrtcStatus(undefined),
  ]);

  ok(true);
  if (response.data === 'Ended OK') notify(t('MSG_ALT_AGRG_FSH')); // 집계 되었습니다.
  else if (response.data === 'Ended Not OK') notify(t('MSG_ALT_AGRG_FAIL')); // 집계가 실패 되었습니다.
}
</script>
