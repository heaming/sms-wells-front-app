<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaEngineerAllowancePerfAgrgRegP 엔지니어 수당 생성관리-실적집계
3. 작성자 : seoin.jeon
4. 작성일 : 2023.02.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 엔지니어 수당 생성관리-실적집계
****************************************************************************************************
--->
<template>
  <kw-popup
    size="sm"
  >
    <kw-form
      :cols="1"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PERF_YM')"
        >
          <p>{{ params.perfYm.substring(0,4)+'-'+params.perfYm.substring(4) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_RSB_TP')"
        >
          <p>{{ params.rsbTp==='E'?$t('MSG_TXT_EGER'):$t('MSG_TXT_ADMIN') }}</p>
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
import { useDataService, useGlobal, useModal } from 'kw-lib';
import dayjs from 'dayjs';

const { cancel, ok } = useModal();
const { t } = useI18n();
const { confirm, alert, notify } = useGlobal();
const dataService = useDataService();
const props = defineProps({
  perfYm: { // 실적년월
    type: String,
    required: true,
  },
  rsbTp: { // 직책유형 : 엔지니어(E), 관리자(M)
    type: String,
    required: true,
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs().format('YYYYMM');
const params = ref({
  perfYm: props.perfYm,
  rsbTp: props.rsbTp,
});

async function onClickCancel() {
  cancel();
}

async function onClickSave() {
  // 현재년월에는 일 30분씩 배치가 돌고 있기 때문에 배치 호출 못하게 우선 막음.
  if (now === params.value.perfYm) {
    alert('집계가 가능한 실적년월이 아닙니다.');
    return;
  }

  if (!await confirm(t('MSG_ALT_AGRG'))) { return; }
  const response = await dataService.post('/sms/wells/fee/eger-allowances/aggregates', params.value, { timeout: 500000 });
  ok(true);
  if (response.data === 'Ended OK') notify(t('MSG_ALT_AGRG_FSH')); // 집계 되었습니다.
  else if (response.data === 'Ended Not OK') notify(t('MSG_ALT_AGRG_FAIL')); // 집계가 실패 되었습니다.
}
</script>
