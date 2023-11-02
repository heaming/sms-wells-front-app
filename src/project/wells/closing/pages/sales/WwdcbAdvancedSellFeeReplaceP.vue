<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbAdvancedSellFeeReplaceP - 선급판매수수료 비용 대체 관리 - 전표 생성
3. 작성자 : Kicheol Choi
4. 작성일 : 2023.06.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 선급판매수수료 비용 대체 관리 전표생성을 위한 팝업화면.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
    ignore-on-modified
  >
    <kw-form :cols="1">
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_COB_CD')">
          <p>{{ companyCode.codeId + "(" + companyCode.codeName + ")" }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_POSTING_DT')">
          <p>{{ stringUtil.getDateFormat(info.slipFtrmDt) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PIA_FEE_EOT_TOT')">
          <p>총 {{ textToNumberFormatter(info.feeOcAmt ?? 0) }}원</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CS_RPLC_TOT')">
          <p>총 {{ textToNumberFormatter(info.csRplcAmt ?? 0) }}원</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_SMRY')">
          <kw-input
            v-model="info.piaSellFeeSmry"
            :maxlength="4000"
            :readonly="info.dpSlpno !== null"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <template #action>
      <kw-btn
        v-permission:create
        primary
        :label="$t('MSG_BTN_SLIP_CRT')"
        :disable="info.dpSlpno !== null"
        @click="onSlipCreate()"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil } from 'kw-lib';
import { textToNumberFormatter } from '~sms-common/closing/utils/clUtil';

const dataService = useDataService();
const store = useStore();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const companyCode = ref({});
const info = ref({});

async function fetchData() {
  companyCode.value.codeId = store.getters['meta/getUserInfo'].companyCode;
  companyCode.value.codeName = store.getters['meta/getUserInfo'].companyName;

  const res = await dataService.get('/sms/wells/closing/advanced-fee-replace/info-pop', { params: { kwGrpCoCd: companyCode.value.codeId } });
  info.value = res.data;
}

async function onSlipCreate() {
  await dataService.put('/sms/wells/closing/advanced-fee-replace/slip-create', info.value);
}

onMounted(async () => {
  await fetchData();
});

</script>
