<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaOgNetOrderPerfAgrgRegP 조직별 수수료 순주문 관리-순주문 생성
3. 작성자 : seoin.jeon
4. 작성일 : 2023.02.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 조직별 수수료 순주문 관리-순주문 생성
****************************************************************************************************
--->
<template>
  <kw-popup
    size="sm"
  >
    <kw-form :cols="1">
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PERF_YM')">
          <p>{{ params.perfYm.substring(0,4) }}-{{ params.perfYm.substring(4) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_OG_TP')">
          <p>{{ codes.OG_TP_CD.find((v) => v.codeId === params?.ogTpCd)?.codeName }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ORDR')">
          <p>{{ codes.FEE_TCNT_DV_CD.find((v) => v.codeId === params?.feeTcntDvCd)?.codeName }}</p>
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
        v-if="params.dv==='CR'"
        primary
        :label="$t('MSG_TXT_CRT')"
        @click="onClickCreate"
      />
      <kw-btn
        v-if="params.dv==='CO'"
        primary
        :label="$t('MSG_TXT_DTRM')"
        @click="onClickConfirm"
      />
      <kw-btn
        v-if="params.dv==='CC'"
        primary
        :label="$t('MSG_TXT_CNFM_CAN')"
        @click="onClickConfirmCancel"
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
  ogTp: { // 조직유형(P/M/H)
    type: String,
    required: true,
  },
  dv: { // 생성(CR)/확정(CO)/확정취소(CC) 구분
    type: String,
    required: true,
  },
  feeTcntDvCd: { // 수수료차수구분코드
    type: String,
    required: true,
  },
  perfAgrgCrtDvCd: { // 실적생성구분코드
    type: String,
    required: true,
  },
});

const params = ref({
  perfYm: props.perfYm,
  ogTpCd: props.ogTp,
  dv: props.dv,
  feeTcntDvCd: props.feeTcntDvCd,
  perfAgrgCrtDvCd: props.perfAgrgCrtDvCd,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'FEE_TCNT_DV_CD',
  'OG_TP_CD',
);

async function onClickCancel() {
  cancel();
}

async function onClickCreate() {
  if (!await confirm(t('MSG_ALT_CREATED'))) { return; }
  const response = await dataService.post('/sms/wells/fee/organization-netorders/aggregates', params.value);
  if (response.data === 'S') ok(true);
}

async function onClickConfirm() {
  if (!await confirm(t('MSG_ALT_DTRM'))) { return; }
  await dataService.put('/sms/wells/fee/organization-netorders', params.value);
  notify(t('MSG_ALT_CNFM')); // 확정되었습니다.
  ok(true);
}

async function onClickConfirmCancel() {
  if (!await confirm(t('MSG_ALT_WANT_CANCEL_DTRM'))) { return; }
  await dataService.put('/sms/wells/fee/organization-netorders', params.value);
  notify(t('MSG_ALT_CNFM_CANCEL_CONF')); // 확정취소 되었습니다.
  ok(true);
}
</script>
