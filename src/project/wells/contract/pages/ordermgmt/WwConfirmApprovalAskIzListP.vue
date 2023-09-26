<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwConfirmApprovalAskIzListP - 확정 승인 요청 내역 (팝업)
3. 작성자 : Myoungbin Joo
4. 작성일 : 2023.03.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 확정 승인 요청 내역과 구매 내역을 조회한다.
****************************************************************************************************
--->

<template>
  <kw-popup
    size="2xl"
  >
    <h3>
      {{ t('MSG_TXT_RQS_IZ') }}
    </h3>
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalMainCount" />
      </template>
      <kw-btn
        v-permission:read
        primary
        dense
        :label="$t('MSG_BTN_RNTL_PRCH_IZ')"
        @click="onclickShowHide"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="4"
      @init="initGrdMain"
    />
    <div v-show="isShow">
      <h3>{{ t('MSG_TXT_PRCH_IZ') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalSubCount" />
        </template>
        <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
      </kw-action-top>
      <kw-grid
        ref="grdSubRef"
        name="grdSub"
        :visible-rows="3"
        @init="initSubGrid"
      />
    </div>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, defineGrid } from 'kw-lib';

const { t } = useI18n();
const dataService = useDataService();

const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));

const totalMainCount = ref(0);
const totalSubCount = ref(0);
const isShow = ref(false);

const props = defineProps({
  cntrNo: {
    type: String,
    required: true,
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  const mainRes = await dataService.get('/sms/wells/contract/contracts/approval-requests', { params: { cntrNo: props.cntrNo } });
  const mainList = mainRes.data;

  const mainView = grdMainRef.value.getView();
  mainView.getDataSource().setRows(mainList);
  mainView.resetCurrent();

  totalMainCount.value = mainList.length;

  const subRes = await dataService.get('/sms/wells/contract/contracts/approval-requests/order-histories', { params: { cntrNo: props.cntrNo } });
  const subList = subRes.data;

  const subView = grdSubRef.value.getView();
  subView.getDataSource().setRows(subList);
  subView.resetCurrent();

  totalMainCount.value = mainList.length;
  totalSubCount.value = subList.length;
}

function onclickShowHide() {
  isShow.value = !isShow.value;
  return isShow.value;
}

onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    /* { fieldName: 'col1' }, */
    { fieldName: 'cntrAprAkDvCdNm' },
    { fieldName: 'cntrAprFwDvNm' },
    { fieldName: 'rqrNm' },
    { fieldName: 'sendDttm' },
    { fieldName: 'aprvYn' },
    { fieldName: 'aprvNm' },
    { fieldName: 'aprvDttm' },
    { fieldName: 'cancYn' },
  ];

  const columns = [
    /* { fieldName: 'col1', header: '요청순번', width: '78', styleName: 'text-center' }, */
    { fieldName: 'cntrAprAkDvCdNm', header: t('MSG_TXT_APR_REQ_CAT'), width: '301', styleName: 'text-center' },
    { fieldName: 'cntrAprFwDvNm', header: t('MSG_TXT_RQST'), width: '78', styleName: 'text-center' },
    { fieldName: 'rqrNm', header: t('MSG_TXT_PIC'), width: '236', styleName: 'text-center' },
    { fieldName: 'sendDttm', header: t('MSG_TXT_SEND_DTM'), width: '236', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'aprvYn', header: t('MSG_TXT_APPR_STS'), width: '78', styleName: 'text-center' },
    { fieldName: 'aprvNm', header: t('MSG_TXT_APPROVER'), width: '78', styleName: 'text-center' },
    { fieldName: 'aprvDttm', header: t('MSG_TXT_APPR_DTM'), width: '236', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'cancYn', header: t('MSG_TXT_CNCL_YN'), width: '78', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
});

const initSubGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'cstGdNm' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'adr' },
    { fieldName: 'pdNm' },
    { fieldName: 'istDt' },
    { fieldName: 'useDiv' },
    { fieldName: 'apyTn' },
    { fieldName: 'dlqInfo' },

  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '147', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTR_CST_NM'), width: '135', styleName: 'text-center' },
    { fieldName: 'cstGdNm', header: t('MSG_TXT_CST_GRD'), width: '94', styleName: 'text-center' },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_INST_CST_NM'), width: '135', styleName: 'text-center' },
    { fieldName: 'adr', header: t('MSG_TXT_INST_ADDR'), width: '482', styleName: 'text-left' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '246', styleName: 'text-left' },
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '135', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'useDiv', header: t('MSG_TXT_USG'), width: '78', styleName: 'text-center' },
    { fieldName: 'apyTn', header: t('MSG_TXT_RNTL_SN'), width: '78', styleName: 'text-center' },
    { fieldName: 'dlqInfo', header: t('MSG_TXT_DLQ_MCNT_AMT'), width: '135', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
});
</script>
