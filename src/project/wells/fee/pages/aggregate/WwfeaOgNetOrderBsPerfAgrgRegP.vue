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
const { confirm } = useGlobal();
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

const params = ref({
  perfYm: props.perfYm,
  ogTpCd: props.ogTpCd,
  feeTcntDvCd: props.feeTcntDvCd,
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

async function onClickSave() {
  if (!await confirm(t('MSG_ALT_AGRG'))) { return; }
  const response = dataService.post('/sms/wells/fee/organization-netorders/bs-aggregates', params.value);
  ok(response.data);
}
</script>
