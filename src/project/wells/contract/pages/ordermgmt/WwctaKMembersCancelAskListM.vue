<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaKMembersCancelAskListM - wells K멤버스 취소 요청 목록 조회
3. 작성자 : jihoon.kim
4. 작성일 : 2023.03.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0133] - k멤버스몰 내 구입제품에 대한 취소현황 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 취소일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_CANC_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.cntrChRcpStrtDtm"
            v-model:to="searchParams.cntrChRcpFinsDtm"
            rules="date_range_required|date_range_months:1"
            :label="$t('MSG_TXT_CANC_DT')"
          />
        </kw-search-item>
        <!-- 계약상세번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            class="w275"
            icon="search"
            disable-popup="false"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
          />
        </kw-search-item>
        <!-- 상태 -->
        <kw-search-item :label="$t('MSG_TXT_STT')">
          <kw-select
            v-model="searchParams.statCd"
            :options="[{ codeId: '00', codeName: '미확정건' },
                       { codeId: '01', codeName: 'K멤버스 전달완료' }]"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="pageInfo.totalCount" />
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const dataService = useDataService();
const { t } = useI18n();

let cachedParams;
const now = dayjs();
const searchParams = ref({
  cntrChRcpStrtDtm: now.startOf('month').format('YYYYMMDD'),
  cntrChRcpFinsDtm: now.format('YYYYMMDD'),
  cntrNo: '',
  cntrSn: '',
  statCd: '',
});
const pageInfo = ref({
  totalCount: 0,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/contracts/kmembers-cancel-ask', { params: cachedParams });

  // const { list: accounts } = res.data;
  // console.log(res.data);

  const view = grdMainRef.value.getView();
  // view.getDataSource().setRows(accounts);
  view.getDataSource().setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

onMounted(async () => {
  // await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cstKnm' }, // 계약자명
    { fieldName: 'rsgAplcDt' }, // 취소요청일자
    { fieldName: 'rsgFshDt' }, // 취소일자
    { fieldName: 'mlgResAmt', dataType: 'number' }, // 잔여포인트
    { fieldName: 'procsYn' }, // 전달여부
    { fieldName: 'kmbrsProcsBsdt' }, // 처리기준일자
    { fieldName: 'trsDt' }, // 전송일자
    { fieldName: 'rcpDt' }, // 확정일자
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '132', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '127', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '96', styleName: 'text-center' }, // 계약자명
    { fieldName: 'rsgAplcDt', header: t('MSG_TXT_CANC_RQDT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 취소 요청일자
    { fieldName: 'rsgFshDt', header: t('MSG_TXT_CANC_DT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 취소일자
    { fieldName: 'mlgResAmt', header: t('MSG_TXT_RES_P'), width: '96', styleName: 'text-right' }, // 잔여포인트
    { fieldName: 'procsYn', header: t('MSG_TXT_DLVR_YN'), width: '76', styleName: 'text-center' }, // 전달여부
    { fieldName: 'kmbrsProcsBsdt', header: t('MSG_TXT_PROCS_BASE_DT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 처리기준일자
    { fieldName: 'trsDt', header: t('MSG_TXT_TRS_DT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 전송일자
    { fieldName: 'rcpDt', header: t('MSG_TXT_CNFM_DT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 확정일자
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});
</script>
<style scoped>
</style>
