<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwcteConfirmApprovalDividePsicListP - 확인 승인 분류 PIC 목록

3. 작성자 : gs.bhavesh.n
4. 작성일 : 2023.01.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-확인 승인 분류 PIC 목록

****************************************************************************************************
--->

<template>
  <kw-popup
    class="kw-popup--3xl"
  >
    <h3>요청내역</h3>
    <kw-grid
      ref="grdMainRef1"
      :visible-rows="2"
      class="mt20"
      @init="initGrid"
    />
    <h3>구매내역</h3>
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="10"
        />
        <span class="ml8">(단위:원)</span>
      </template>
    </kw-action-top>
    <kw-grid
      ref="grdMainRef2"
      :visible-rows="10"
      class="mt20"
      @init="initGrid2"
    />
    <template #action>
      <kw-btn
        :label="$t('MSG_BTN_POP_CLOSE')"
        primary
        @click="onClickClose"
      />
    </template>
  </kw-popup>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// ------------------------------------------------------------------------------------------------

import { useModal, getComponentType, defineGrid } from 'kw-lib';

const { cancel: onClickClose } = useModal();
const { t } = useI18n();

const grdMainRef1 = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'appRequest' },
    { fieldName: 'request' },
    { fieldName: 'picNm' },
    { fieldName: 'reqDt' },
    { fieldName: 'appStatus' },
  ];

  const columns = [
    { fieldName: 'appRequest', header: t('MSG_TXT_APR_REQ_CAT'), width: '360' },
    { fieldName: 'request', header: t('MSG_TXT_RQST'), width: '116', styleName: 'text-center' },
    { fieldName: 'picNm', header: t('MSG_TXT_PIC'), width: '160', styleName: 'text-center' },
    { fieldName: 'reqDt', header: t('MSG_TXT_SEND_DTM'), width: '197', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'appStatus', header: t('MSG_TXT_APPR_STS'), width: '116', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { appRequest: '중장기연체고객-법인', request: '요청(1)', picNm: '김교원, 박웰스', reqDt: '2022-08-31  18:19:56', appStatus: 'Y' },
  ]);
});

const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'contNum' },
    { fieldName: 'contNm' },
    { fieldName: 'custGrd' },
    { fieldName: 'custNm  ' },
    { fieldName: 'instAddr' },
    { fieldName: 'prodNm' },
    { fieldName: 'instDt' },
    { fieldName: 'usage' },
    { fieldName: 'rentRd' },
    { fieldName: 'odAmt' },
  ];

  const columns = [
    { fieldName: 'contNum', header: t('MSG_TXT_CNTR_NO'), width: '165', styleName: 'text-center' },
    { fieldName: 'contNm', header: t('MSG_TXT_CNTOR_NM'), width: '165', styleName: 'text-center' },
    { fieldName: 'custGrd', header: t('MSG_TXT_CST_GRD'), width: '165', styleName: 'text-center' },
    { fieldName: 'custNm', header: t('MSG_TXT_CNTOR_NM'), width: '165', styleName: 'text-center' },
    { fieldName: 'instAddr', header: t('MSG_TXT_INST_ADDR'), width: '420' },
    { fieldName: 'prodNm', header: t('MSG_TXT_PD_NM'), width: '338' },
    { fieldName: 'instDt', header: t('MSG_TXT_INST_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'usage', header: t('MSG_TXT_USG'), width: '150', styleName: 'text-center' },
    { fieldName: 'rentRd', header: t('MSG_TXT_RENT_RD'), width: '150', styleName: 'text-center' },
    { fieldName: 'odAmt', header: t('MSG_TXT_OD_MON_PER_AMT'), width: '150', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { contNum: '2019-0001234', contNm: '올뎃파크', custGrd: '-', custNm: '올뎃파크', instAddr: '경북 문정시 가은읍 왕능길 112 문경에코알라', prodNm: '안마의자(KW-H05B1)', instDt: '2022-09-03', usage: '관리', rentRd: '43', odAmt: '1/68,900' },
    { contNum: '2019-0001234', contNm: '올뎃파크', custGrd: '-', custNm: '올뎃파크', instAddr: '경북 문정시 가은읍 왕능길 112 문경에코알라', prodNm: '안마의자(KW-H05B1)', instDt: '2022-09-03', usage: '관리', rentRd: '43', odAmt: '1/68,900' },
    { contNum: '2019-0001234', contNm: '올뎃파크', custGrd: '-', custNm: '올뎃파크', instAddr: '경북 문정시 가은읍 왕능길 112 문경에코알라', prodNm: '안마의자(KW-H05B1)', instDt: '2022-09-03', usage: '관리', rentRd: '43', odAmt: '1/68,900' },
    { contNum: '2019-0001234', contNm: '올뎃파크', custGrd: '-', custNm: '올뎃파크', instAddr: '경북 문정시 가은읍 왕능길 112 문경에코알라', prodNm: '안마의자(KW-H05B1)', instDt: '2022-09-03', usage: '관리', rentRd: '43', odAmt: '1/68,900' },
    { contNum: '2019-0001234', contNm: '올뎃파크', custGrd: '-', custNm: '올뎃파크', instAddr: '경북 문정시 가은읍 왕능길 112 문경에코알라', prodNm: '안마의자(KW-H05B1)', instDt: '2022-09-03', usage: '관리', rentRd: '43', odAmt: '1/68,900' },
    { contNum: '2019-0001234', contNm: '올뎃파크', custGrd: '-', custNm: '올뎃파크', instAddr: '경북 문정시 가은읍 왕능길 112 문경에코알라', prodNm: '안마의자(KW-H05B1)', instDt: '2022-09-03', usage: '관리', rentRd: '43', odAmt: '1/68,900' },
    { contNum: '2019-0001234', contNm: '올뎃파크', custGrd: '-', custNm: '올뎃파크', instAddr: '경북 문정시 가은읍 왕능길 112 문경에코알라', prodNm: '안마의자(KW-H05B1)', instDt: '2022-09-03', usage: '관리', rentRd: '43', odAmt: '1/68,900' },
    { contNum: '2019-0001234', contNm: '올뎃파크', custGrd: '-', custNm: '올뎃파크', instAddr: '경북 문정시 가은읍 왕능길 112 문경에코알라', prodNm: '안마의자(KW-H05B1)', instDt: '2022-09-03', usage: '관리', rentRd: '43', odAmt: '1/68,900' },
    { contNum: '2019-0001234', contNm: '올뎃파크', custGrd: '-', custNm: '올뎃파크', instAddr: '경북 문정시 가은읍 왕능길 112 문경에코알라', prodNm: '안마의자(KW-H05B1)', instDt: '2022-09-03', usage: '관리', rentRd: '43', odAmt: '1/68,900' },
    { contNum: '2019-0001234', contNm: '올뎃파크', custGrd: '-', custNm: '올뎃파크', instAddr: '경북 문정시 가은읍 왕능길 112 문경에코알라', prodNm: '안마의자(KW-H05B1)', instDt: '2022-09-03', usage: '관리', rentRd: '43', odAmt: '1/68,900' },
  ]);
});
</script>
<style scoped>
</style>
