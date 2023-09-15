<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaFeeMeetingAttendanceRegP - 수수료 생성관리-미팅참석집계(wells)
3. 작성자 : gs.piit150
4. 작성일 : 2023.07.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 생성관리-미팅참석집계(wells) 팝업 화면
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
        <!-- 조직유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_OG_TP')"
        >
          <p>{{ data.ogTpCdTxt }}</p>
        </kw-form-item>
        <!-- 조직유형 -->
      </kw-form-row>
      <kw-form-row>
        <!-- 실적년월 -->
        <kw-form-item
          :label="$t('MSG_TXT_PERF_YM')"
        >
          <p>{{ data.perfYmTxt }}</p>
        </kw-form-item>
        <!-- 실적년월 -->
      </kw-form-row>
      <kw-form-row>
        <!-- 작업구분 -->
        <kw-form-item
          :label="$t('MSG_TXT_ORDR')"
        >
          <p>{{ data.feeTcntDvCdTxt }}</p>
        </kw-form-item>
        <!-- 작업구분 -->
      </kw-form-row>
    </kw-form>

    <template #action>
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        negative
        @click="onClickCancel"
      />
      <kw-btn
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
import { useDataService, useGlobal, useModal } from 'kw-lib';

const { cancel, ok } = useModal();
const { confirm } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();

const props = defineProps({
  ogTpCd: {
    type: String,
    default: '',
  },
  ogTpCdTxt: {
    type: String,
    default: '',
  },
  perfYm: {
    type: String,
    default: '',
  },
  feeTcntDvCd: {
    type: String,
    default: '',
  },
  feeTcntDvCdTxt: {
    type: String,
    default: '',
  },
  rsbTpCd: {
    type: String,
    default: '',
  },
  perfYmTxt: {
    type: String,
    default: '',
  },
});

const data = ref({
  ogTpCd: props.ogTpCd,
  ogTpCdTxt: props.ogTpCdTxt,
  perfYm: props.perfYm,
  feeTcntDvCd: props.feeTcntDvCd,
  feeTcntDvCdTxt: props.feeTcntDvCdTxt,
  rsbTpCd: props.rsbTpCd,
  perfYmTxt: props.perfYmTxt,
  saveUrl: '',
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function onClickCancel() {
  cancel();
}

async function onClickSave() {
  if (!await confirm(t('MSG_ALT_AGRG'))) { return; }

  const response = await dataService.post('/sms/wells/fee/fee-meeting-attendances', data.value);

  ok(response.data);
}
</script>
