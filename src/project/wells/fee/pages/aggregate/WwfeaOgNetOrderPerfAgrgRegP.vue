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
    class="kw-popup--sm"
  >
    <kw-form :cols="1">
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PERF_YM')">
          <p>{{ params.perfYm }}</p>
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
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, useModal } from 'kw-lib';

const { cancel, ok } = useModal();
const { t } = useI18n();
const { confirm } = useGlobal();
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
  dv: { // 생성(CR)/확정(CO) 구분
    type: String,
    required: true,
  },
});

const params = ref({
  perfYm: props.perfYm,
  ogTp: props.ogTp,
  dv: props.dv,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function onClickCancel() {
  cancel();
}

async function onClickCreate() {
  if (!await confirm(t('MSG_ALT_CREATED'))) { return; }
  const response = await dataService.post('/sms/wells/fee/og-netorders/aggregates', params.value);
  ok(response.data);
}

async function onClickConfirm() {
  // TODO: 수수료 미생성 시 클릭 : '시상수수료 생성을 진행 후 확정이 가능합니다.' 추가 필요
  if (!await confirm(t('MSG_ALT_DTRM'))) { return; }
  const response = await dataService.put('/sms/wells/fee/og-netorders', params.value);
  ok(response.data);
}
</script>
