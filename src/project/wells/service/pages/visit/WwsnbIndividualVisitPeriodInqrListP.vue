<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [W-SV-U-0168P01] WwsnbIndividualVisitPeriodListP - 개인별 방문주기 조회
3. 작성자 : jungheejin
4. 작성일 : 2023.07.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 개인별 방문주기 조회 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    size="4xl"
    no-action
  >
    <kw-form
      :cols="4"
      dense
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CST_NO')">
          <p>{{ cntrNo }}-{{ cntrSn }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PRDT_NM')">
          <p>{{ pdNm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SVC_BETWEEN')">
          <p>{{ vstPrdNm }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <div class="grid-horizontal-wrap pb0">
      <div class="grid-horizontal-wrap__section">
        <h3>{{ $t('MSG_TXT_CST_VST_IZ') }}</h3>
        <kw-action-top>
          <template #left>
            <kw-paging-info
              :total-count="totalCountForCustomer.totalCount"
            />
          </template>
        </kw-action-top>
        <kw-grid
          ref="grdMainRef"
          :visible-rows="10"
          @init="initGrid1"
        />
      </div>
      <div class="grid-horizontal-wrap__section">
        <h3>{{ $t('MSG_TXT_MNGT_CST') }}</h3>
        <kw-action-top>
          <template #left>
            <kw-paging-info
              :total-count="totalCountForManagement.totalCount"
            />
          </template>
        </kw-action-top>
        <kw-grid
          ref="grdMainRef2"
          :visible-rows="10"
          @init="initGrid2"
        />
      </div>
    </div>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { defineGrid, getComponentType, useDataService } from 'kw-lib';
import { isEmpty } from 'lodash-es';

const grdMainRef = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));

const dataService = useDataService();
const { t } = useI18n();

const props = defineProps({
  cntrNo: {
    type: String,
    required: true,
    default: '',
  },
  cntrSn: {
    type: String,
    required: true,
    default: '',
  },
  pdNm: {
    type: String,
    required: true,
    default: '',
  },
  vstPrdNm: {
    type: String,
    required: true,
    default: '',
  },
});
const customerParam = ref({
  cntrNo: '',
  cntrSn: '',
  pdNm: '',
  vstPrdNm: '',
});

const totalCountForCustomer = ref({
  totalCount: 0,
});

const totalCountForManagement = ref({
  totalCount: 0,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const baseUrl = '/sms/wells/service/individual-visit-prd-inqr';

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/customer-visit-izs`, { params: { ...customerParam.value } });
  const list = res.data;

  totalCountForCustomer.value.totalCount = list.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function fetchData2() {
  const res = await dataService.get(`${baseUrl}/management-csts`, { params: { ...customerParam.value } });
  const list = res.data;

  totalCountForManagement.value.totalCount = list.length;

  const view = grdMainRef2.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function initProps() {
  console.log(props);
  const { cntrNo, cntrSn, pdNm, vstPrdNm } = props;
  customerParam.value.cntrNo = cntrNo;
  customerParam.value.cntrSn = cntrSn;
  customerParam.value.pdNm = pdNm;
  customerParam.value.vstPrdNm = vstPrdNm;
  if (!isEmpty(customerParam.value.cntrNo) && !isEmpty(customerParam.value.cntrSn)) {
    await fetchData();
    await fetchData2();
  }
}

onMounted(async () => {
  await initProps();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid1 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'vstNmnN' },
    { fieldName: 'istNmnN' },
    { fieldName: 'vstDuedt' },
    { fieldName: 'svBizDclsfNm' },
    { fieldName: 'filtChngLvCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'wkDt' },
    { fieldName: 'mtrCanDt' },
  ];

  const columns = [
    { fieldName: 'vstNmnN', header: t('MSG_TXT_VST_NMN'), width: '80', styleName: 'text-right' },
    { fieldName: 'istNmnN', header: t('MSG_TXT_INST_OVER'), width: '80', styleName: 'text-right' },
    { fieldName: 'vstDuedt', header: t('MSG_TXT_SCHD_DT'), datetimeFormat: 'date', width: '100', styleName: 'text-center' },
    { fieldName: 'svBizDclsfNm', header: t('MSG_TXT_WK_CLS'), width: '100', styleName: 'text-left' },
    {
      fieldName: 'filtChngLvCd',
      header: t('MSG_TXT_STEP'),
      width: '70',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        if (isEmpty(value) || value === '0' || value === '00') {
          return '';
        }
        return value;
      },
    },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_FLTR_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'wkDt', header: t('MSG_TXT_VST_DT'), width: '180', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'mtrCanDt', header: t('MSG_TXT_STP_DT'), width: '180', styleName: 'text-center', datetimeFormat: 'date' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'mngtYm' },
    { fieldName: 'mngrDvNm' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'mngerRglvlDvCd' },
    { fieldName: 'vstPrdNm' },
    { fieldName: 'svHshdNo' },
  ];
  const columns = [
    { fieldName: 'mngtYm', header: t('MSG_TXT_MGT_YNM'), width: '100', styleName: 'text-center' },
    { fieldName: 'mngrDvNm', header: t('MSG_TXT_DIV'), width: '80', styleName: 'text-center' },
    { fieldName: 'ogTpCd', header: t('MSG_TXT_BLG'), width: '80', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'mngerRglvlDvCd', header: t('MSG_TXT_RGLVL'), width: '80', styleName: 'text-center' },
    { fieldName: 'vstPrdNm', header: t('MSG_TXT_SVC_BETWEEN'), width: '80', styleName: 'text-center' },
    { fieldName: 'svHshdNo', header: t('MSG_TXT_HSHD_CD'), width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
