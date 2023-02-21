<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwKakaotalkForwardingIzListP - 카카오톡 발송 내역
3. 작성자 : gs.piit193
4. 작성일 : 2023.02.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 계약관리 페이지 內 카카오 알림톡 확인하는 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--2xl"
    title="카카오톡 발송 내역"
  >
    <kw-grid
      ref="grdMainRef"
      :visible-rows="10"
      @init="initGrid"
    />
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CLOSE')"
        @click="onClickClose"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, useModal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const props = defineProps({
  mtPr: { type: String, required: true, default: '' },
  concDiv: { type: String, required: false, default: '' },
});
const { cancel } = useModal();

// @todo: update to 0 on api integration
let cachedParams;
const searchParams = ref({
  mtPr: props.mtPr,
  concDiv: props.concDiv,
  // concDiv: 'Wells18182',
  // concDiv: tempCodeList,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/kakaotalk-forwarding-itemizations', { params: cachedParams });

  // const { list: accounts } = res.data;
  console.log(res.data);

  const view = grdMainRef.value.getView();
  // view.getDataSource().setRows(accounts);
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

onMounted(async () => {
  await fetchData();
});

async function onClickClose() {
  cancel();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'recipientNum' },
    { fieldName: 'dateClientReq' },
    { fieldName: 'dateRslt' },
    { fieldName: 'reslCdCntn' },
    { fieldName: 'rplcSend' },
    { fieldName: 'msg' },
    { fieldName: 'userId' },
  ];

  const columns = [
    { fieldName: 'recipientNum', header: t('MSG_TXT_RECP_NO'), width: '147', styleName: 'text-center' }, // 수신번호
    { fieldName: 'dateClientReq', header: t('MSG_TXT_TRMT_DTM'), width: '236', styleName: 'text-center', datetimeFormat: 'datetime' }, // 전송일시
    { fieldName: 'dateRslt', header: t('MSG_TXT_RECEIVE_DTM'), width: '236', styleName: 'text-center', datetimeFormat: 'datetime' }, // 수신일시
    { fieldName: 'reslCdCntn', header: t('MSG_TXT_RSULT'), width: '171', styleName: 'text-left' }, // 결과
    { fieldName: 'rplcSend', header: t('MSG_TXT_RPLC'), width: '110', styleName: 'text-center' }, // 대체
    { fieldName: 'msg', header: t('MSG_TXT_MSG'), width: '368', styleName: 'text-left  ' }, // 메시지
    { fieldName: 'userId', header: t('MSG_TXT_SEND_USR'), width: '117', styleName: 'text-center' }, // 발신인
  ];

  const columnLayout = [
    'recipientNum',
    'dateClientReq',
    'dateRslt',
    'reslCdCntn',
    'rplcSend',
    'msg',
    'userId',
  ];

  view.setColumnLayout(columnLayout);
  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
