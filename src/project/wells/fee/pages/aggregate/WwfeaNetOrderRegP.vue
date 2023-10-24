<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaNetOrderRegP - 월 순주문 집계-순주문 집계
3. 작성자 : min-kyu bae
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 월 순주문 집계 등록 팝업 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="sm"
  >
    <kw-form
      :cols="1"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PERF_YM')"
        >
          <p>{{ stringUtil.getDateFormat(data.perfYm, 'yyyy-MM').substring(0,7) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_DIV')"
        >
          <p>{{ data.tcntDvTxt }}</p>
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
        v-permission:create
        :label="$t('MSG_BTN_AGRG')"
        primary
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, useModal, codeUtil, stringUtil } from 'kw-lib';

const { cancel, ok } = useModal();
const { confirm } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'FEE_TCNT_DV_CD',
);

const props = defineProps({
  perfYm: {
    type: String,
    default: '',
  },
  feeTcntDvCd: {
    type: String,
    default: '',
  },
});

const data = ref({
  perfYm: props.perfYm,
  feeTcntDvCd: props.feeTcntDvCd,
  tcntDvTxt: codes.FEE_TCNT_DV_CD.find((v) => v.codeId === props.feeTcntDvCd).codeName,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function onClickCancel() {
  cancel();
}

/*
 *  Event - 수수료 집계정보 생성
 */
async function onClickSave() {
  if (!await confirm(t('MSG_ALT_AGRG'))) { return; }
  const response = await dataService.post('/sms/wells/fee/monthly-net/aggregations', data.value);
  if (response.data === 'S') ok(response.data);
}

</script>
