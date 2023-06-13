<template>
  <kw-page>
    <div class="result-area">
      <kw-action-top>
        <kw-btn
          dense
          secondary
          label="입고 미승인상세현황"
          @click="onClickCustomers"
        />
      </kw-action-top>
      <kw-form>
        <kw-form-row :cols="3">
          <kw-form-item :label="$t('MSG_TXT_CNTR_NO')">
            <kw-input
              v-model="customerData.cntrNo"
              disable
            />
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_CNTR_SN')">
            <kw-input
              v-model="customerData.cntrSn"
              disable
            />
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_CST_NM')">
            <kw-input
              v-model="customerData.cstNm"
              disable
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row :cols="3">
          <kw-form-item :label="$t('MSG_TXT_ZIP')">
            <kw-input
              v-model="customerData.newAdrZip"
              disable
            />
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_RNADR')">
            <kw-input
              v-model="customerData.rnadr"
              disable
            />
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_RDADR')">
            <kw-input
              v-model="customerData.rdadr"
              disable
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row :cols="3">
          <kw-form-item :label="$t('MSG_TXT_LOCARA_TNO')">
            <kw-input
              v-model="customerData.locaraTno"
              disable
            />
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_EXNO_ENCR')">
            <kw-input
              v-model="customerData.exnoEncr"
              disable
            />
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_IDV_TNO')">
            <kw-input
              v-model="customerData.idvTno"
              disable
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row :cols="3">
          <kw-form-item :label="$t('MSG_TXT_CRAL_LOCARA_TNO')">
            <kw-input
              v-model="customerData.cralLocaraTno"
              disable
            />
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_MEXNO')">
            <kw-input
              v-model="customerData.mexnoEncr"
              disable
            />
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_CRAL_IDV_TNO')">
            <kw-input
              v-model="customerData.cralIdvTno"
              disable
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row :cols="3">
          <kw-form-item :label="$t('MSG_TXT_IST_DT')">
            <kw-input
              v-model="customerData.istDt"
              disable
            />
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_SEL_TYPE')">
            <kw-input
              v-model="customerData.sellTpCd"
              disable
            />
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_PRDT_CODE')">
            <kw-input
              v-model="customerData.pdCd"
              disable
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row :cols="3">
          <kw-form-item :label="$t('MSG_TXT_SNNO')">
            <kw-input
              v-model="customerData.bcNo"
              disable
            />
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_SV_STP_DT')">
            <kw-input
              v-model="customerData.svStpDt"
              disable
            />
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_DUTY_USE_MCNT_N')">
            <kw-input
              v-model="customerData.recapDutyPtrmN"
              disable
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row :cols="3">
          <kw-form-item :label="$t('MSG_TXT_FRISU_SV_MCN')">
            <kw-input
              v-model="customerData.frisuAsPtrmN"
              disable
            />
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_FRISU_B_SV_MCN')">
            <kw-input
              v-model="customerData.frisuBfsvcPtrmN"
              disable
            />
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_CHK_PRD')">
            <kw-input
              v-model="customerData.cycleCode"
              disable
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </div>
  </kw-page>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useGlobal } from 'kw-lib';

const { modal } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const customerData = ref({
  cntrNo: '',
  cntrSn: '',
  cstNm: '',
  newAdrZip: '',
  rnadr: '',
  rdadr: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
  locaraTno: '',
  exnoEncr: '',
  idvTno: '',
  istDt: '',
  sellTpCd: '',
  pdCd: '',
  bcNo: '',
  svStpDt: '',
  recapDutyPtrmN: '',
  frisuAsPtrmN: '',
  frisuBfsvcPtrmN: '',
  cycleCode: '',
});

// const storeData = ref({
//   strWareNo: '',
//   itmPdCd: '',
// });

async function onClickCustomers() {
  const strWareNo = '302548';
  const itmPdCd = 'WM07104750';

  const { result, payload } = await modal({
    component: 'WwsnaStoreNaprvStateDtlP',
    componentProps: { strWareNo, itmPdCd },
  });

  if (result) {
    payload.value.strWareNo = payload.value.strWareNo ?? '302548';
    payload.value.itmPdCd = payload.value.itmPdCd ?? 'WM07104750';
  }

  // if (result) {
  //   customerData.value.cntrNo = payload.cntrNo ?? '';
  //   customerData.value.cntrSn = payload.cntrSn ?? '';
  //   customerData.value.cstNm = payload.cstNm ?? '';
  //   customerData.value.newAdrZip = payload.newAdrZip ?? '';
  //   customerData.value.rnadr = payload.rnadr ?? '';
  //   customerData.value.rdadr = payload.rdadr ?? '';
  //   customerData.value.cralLocaraTno = payload.cralLocaraTno ?? '';
  //   customerData.value.mexnoEncr = payload.mexnoEncr ?? '';
  //   customerData.value.cralIdvTno = payload.cralIdvTno ?? '';
  //   customerData.value.locaraTno = payload.locaraTno ?? '';
  //   customerData.value.exnoEncr = payload.exnoEncr ?? '';
  //   customerData.value.idvTno = payload.idvTno ?? '';
  //   customerData.value.istDt = payload.istDt ?? '';
  //   customerData.value.sellTpCd = payload.sellTpCd ?? '';
  //   customerData.value.pdCd = payload.pdCd ?? '';
  //   customerData.value.bcNo = payload.bcNo ?? '';
  //   customerData.value.svStpDt = payload.svStpDt ?? '';
  //   customerData.value.recapDutyPtrmN = payload.recapDutyPtrmN ?? '';
  //   customerData.value.frisuAsPtrmN = payload.frisuAsPtrmN ?? '';
  //   customerData.value.frisuBfsvcPtrmN = payload.frisuBfsvcPtrmN ?? '';
  //   customerData.value.cycleCode = payload.cycleCode ?? '';
  // }
}

</script>
