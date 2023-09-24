<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaAccountNetIncreaseRegP - M조직 계정 순증 관리 - 실적집계
3. 작성자 : haejin.lee
4. 작성일 : 2023.07.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- M조직 계정 순증 관리 - 실적집계
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
          :label="$t('MSG_TXT_ORDR')"
        >
          <p>{{ params.feeTcntDvCdTxt }}</p>
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
import { codeUtil, useDataService, useGlobal, useModal } from 'kw-lib';
import dayjs from 'dayjs';

const { cancel, ok } = useModal();
const { t } = useI18n();
// const { confirm, alert } = useGlobal();
const { confirm } = useGlobal();
const dataService = useDataService();
const props = defineProps({
  perfYm: { // 실적년월
    type: String,
    required: true,
  },
  feeTcntDvCd: { // 차수 : 01, 02
    type: String,
    required: true,
  },
});

const codes = await codeUtil.getMultiCodes(
  'FEE_TCNT_DV_CD',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const defaltDay = dayjs().add(-1, 'month').format('YYYYMM');
const params = ref({
  perfYm: props.perfYm,
  feeTcntDvCd: props.feeTcntDvCd,
  feeTcntDvCdTxt: codes.FEE_TCNT_DV_CD.find((v) => v.codeId === props.feeTcntDvCd).codeName,
});

async function onClickCancel() {
  cancel();
}

async function onClickSave() {
  console.log(defaltDay);
  /*
  if (defaltDay !== params.value.perfYm) {
    alert('집계가 가능한 실적년월이 아닙니다.');
    return;
  }
  */

  if (!await confirm(t('MSG_ALT_AGRG'))) { return; }
  const response = await dataService.post('/sms/wells/fee/account-net-increase/aggregates', params.value);
  if (response.data === 'S') ok(response.data);
}
</script>
