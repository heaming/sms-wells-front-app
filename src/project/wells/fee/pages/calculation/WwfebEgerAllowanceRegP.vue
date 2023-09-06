<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebEgerAllowanceRegP - 엔지니어 수당 생성관리-수당생성
3. 작성자 : haejin.lee
4. 작성일 : 2023.02.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 엔지니어 수당 생성관리-수당생성
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="sm"
  >
    <kw-form
      :cols="1"
      dense
    >
      <kw-form-row>
        <!-- 실적년월 -->
        <kw-form-item
          :label="$t('MSG_TXT_PERF_YM')"
          :required="isEmpty(props.perfYm)"
        >
          <p v-if="!isEmpty(props.perfYm)">
            {{ params?.perfYm ? stringUtil.getDateFormat(params?.perfYm).substring(0,7) : '' }}
          </p>
          <kw-date-picker
            v-if="isEmpty(props.perfYm)"
            v-model="params.perfYm"
            rules="required"
            type="month"
            :label="$t('MSG_TXT_PERF_YM')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row
        v-if="!isEmpty(params.rsbTp)"
      >
        <!-- 직책유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_RSB_TP')"
        >
          <p>{{ codes.RSB_DV_CD.find((v) => v.codeId === params.rsbTp).codeName }}</p>
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
        :label="$t('MSG_TXT_CRT')"
        @click="onClickCreate"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, useModal, codeUtil, stringUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';

const { cancel, ok } = useModal();
const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();

const props = defineProps({
  perfYm: { // 실적년월
    type: String,
    required: true,
  },
  rsbTp: { // 직책유형
    type: String,
    default: '',
  },
});
const params = ref({
  perfYm: props.perfYm,
  rsbTp: props.rsbTp,
  feeTcntDvCd: '02',
  feeCalcUnitTpCd: '601',
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const popupRef = ref();
const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
);
async function onClickCancel() {
  cancel();
}

async function onClickCreate() {
  // const response = await dataService.post('/sms/wells/fee/eger-allowances/creates', params.value);
  if (!await popupRef.value.validate()) { return; }
  await dataService.post(`/sms/common/fee/fee-calculation/${params.value.perfYm}-${params.value.feeTcntDvCd}-${params.value.feeCalcUnitTpCd}`);
  notify(t('MSG_ALT_SAVE_DATA'));
  ok(true);
}

</script>
