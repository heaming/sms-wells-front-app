<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbRentalBulkChangeMgtM - 렌탈 일괄변경 관리
3. 작성자 : gs.rahul.n / younuk.choi
4. 작성일 : 2023.04.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈 일괄변경 관리
****************************************************************************************************
--->
<template>
  <kw-search
    one-row
    :cols="2"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_PROCS_DV')"
        required
      >
        <kw-select
          v-model="searchParams.cntrChTpCd"
          :label="$t('MSG_TXT_PROCS_DV')"
          :options="codes.CNTR_CH_TP_CD"
          first-option="select"
          rules="required"
          @change="onChangeProcsDv"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CLSF_DET')"
        required
      >
        <kw-select
          v-model="searchParams.srchDiv"
          :options="[{codeId : '1', codeName:t('MSG_TXT_RFLT_YM')},
                     {codeId : '2', codeName:t('MSG_TXT_CNTR_DTL_NO')},]"
          rules="required"
        />
        <slot v-if="searchParams.srchDiv === '2'">
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :select-only-validation="false"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
            rules="required"
          />
        </slot>
        <slot v-else>
          <kw-date-picker
            v-model="searchParams.srchDt"
            :label="$t('MSG_TXT_RFLT_YM')"
            type="month"
            rules="required"
          />
        </slot>
      </kw-search-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="pageInfo.totalCount"
        />
        <!-- (단위: 원, 건, 개월) -->
        <span class="ml8">({{ $t('MSG_TXT_UNIT') }}:
          {{ $t('MSG_TXT_CUR_WON') }}, {{ $t('MSG_TXT_CNT') }}, {{ $t('MSG_TXT_MCNT') }})
        </span>
      </template>
      <!-- 일괄변경 등록 -->
      <kw-btn
        v-permission:create
        :label="$t('MSG_TXT_BTCH_CHNG_REG')"
        primary
        dense
        @click="onClickBatchChangeReg"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRefRental"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrdRental"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const now = dayjs();
const dataService = useDataService();
const grdMainRefRental = ref(getComponentType('KwGrid'));
const grdMainRentalView = computed(() => grdMainRefRental.value?.getView());
const { modal, alert } = useGlobal();

const codes = await codeUtil.getMultiCodes(
  'CNTR_CH_TP_CD', // 계약변경유형코드
  'BFSVC_BZS_DV_CD',
  'SPLY_BZS_DV_CD',
);
codes.CNTR_CH_TP_CD = codes.CNTR_CH_TP_CD.filter((v) => (v.codeId.indexOf('6') === 0 && v.codeId !== '619') || v.codeId === '711');

const searchParams = ref({
  cntrChTpCd: '', // 처리구분
  srchDiv: '1', // 검색구분
  srchDt: now.format('YYYYMM'), // 반영일자
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
});

const pageInfo = ref({
  totalCount: 0,
  pageSize: 10,
});

let cachedParams;

const gridLayout = ref({
  601: ['cntrDtlNo', 'cstKnm', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 렌탈취소원복(기본)
  604: ['cntrDtlNo', 'cstKnm', 'istYm', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 설치월면제
  605: ['cntrDtlNo', 'cstKnm', 'bfchDutyPtrmN', 'afchDutyPtrmN', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 의무기간
  607: ['cntrDtlNo', 'cstKnm', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 접수취소(기본)
  608: ['cntrDtlNo', 'cstKnm', 'ackmtPerfAmt', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 인정실적 금액변경
  609: ['cntrDtlNo', 'cstKnm', 'feeBaseAmt', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 수수료 기준가격변경
  611: ['cntrDtlNo', 'cstKnm', 'feeAckmtCt', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 수수료 인정건수 변경
  612: ['cntrDtlNo', 'cstKnm', 'rentalDscAmt', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 렌탈료DC 변경
  613: ['cntrDtlNo', 'cstKnm', 'istDt', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 미관리제품 설치일자 변경
  615: ['cntrDtlNo', 'cstKnm', 'pdctIdno', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 시리얼 번호 변경
  616: ['cntrDtlNo', 'cstKnm', 'stpStrtYm', 'stpEndYm', 'cralLocaraTno', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 법인 코로나 렌탈중지
  617: ['cntrDtlNo', 'cstKnm', 'stpCanYm', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 법인 코로나 렌탈중지 취소
  618: ['cntrDtlNo', 'cstKnm', 'feeFxamYn', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 수수료 정액여부 변경
  620: ['cntrDtlNo', 'cstKnm', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 렌탈 전월 취소(기본)
  621: ['cntrDtlNo', 'cstKnm', 'sdingAckmtPerfAmt', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // (모종)인정실적금액변경
  622: ['cntrDtlNo', 'cstKnm', 'sdingFeeBaseAmt', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // (모종)수수료기준가격변경
  623: ['cntrDtlNo', 'cstKnm', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 매출(BS) 중지 해제(기본)
  624: ['cntrDtlNo', 'cstKnm', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 포인트플러스 강제 맵핑(기본)
  625: ['cntrDtlNo', 'cstKnm', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // 플래너상조제휴 강제 맵핑(기본)
  626: ['cntrDtlNo', 'cstKnm', 'bfchFeeAckmtCt', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // (모종)수수료 인정건수 변경
  711: ['cntrDtlNo', 'cstKnm', 'bfsvcBzsDvCd', 'splyBzsDvCd', 'cntrChAkCn', 'fstRgstUsrNm', 'fstRgstDtm'], // BS업체구분값 변경
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

function onChangeProcsDv() {
  // grdMainRentalView.value.setColumnLayout(gridLayout.value[val]);
}

async function fetchData() {
  if (isEmpty(cachedParams)) return;

  const res = await dataService.get('/sms/wells/contract/changeorder/rental-bulk-change', { params: { ...cachedParams } });
  pageInfo.value.totalCount = res.data.length;
  const view = grdMainRefRental.value.getView();

  view.getDataSource().setRows(res.data);
  view.resetCurrent();

  grdMainRentalView.value.setColumnLayout(gridLayout.value[cachedParams.cntrChTpCd]);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}
// 일괄변경 등록 버튼 클릭
async function onClickBatchChangeReg() {
  const procsDv = searchParams.value.cntrChTpCd;
  const { result } = await modal({
    component: 'WwctbRentalBulkChangeMgtP',
    componentProps: { procsDv },
  });
  if (result) {
    if (isEmpty(searchParams.value.cntrChTpCd)) {
      alert(t('MSG_ALT_RECON_INQR_CNDT'));
      return;
    }
    await onClickSearch();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdRental = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' }, // [ 계약상세번호]
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '120', styleName: 'text-center' }, // [ 계약자정보]
    { fieldName: 'istYm', header: t('MSG_TXT_YR_INSTALLATION'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // [ 설치년월]
    { fieldName: 'bfchDutyPtrmN', header: t('MSG_TXT_DUTY_PTRM') + t('MSG_TXT_BFCH'), width: '100', styleName: 'text-right', dataType: 'number' }, // [ 의무기간 변경전]
    { fieldName: 'afchDutyPtrmN', header: t('MSG_TXT_DUTY_PTRM') + t('MSG_TXT_AFCH'), width: '100', styleName: 'text-right', dataType: 'number' }, // [ 의무기간 변경후]
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_ACKMT_PERF_AMT'), width: '120', styleName: 'text-right', dataType: 'number' }, // [ 인정실적금액]
    { fieldName: 'feeBaseAmt', header: t('MSG_TXT_FEE_BASE_AMT'), width: '120', styleName: 'text-right', dataType: 'number' }, // [ 수수료기준가격]
    { fieldName: 'feeAckmtCt', header: t('MSG_TXT_FEE_ACKMT_CNT'), width: '100', styleName: 'text-right', dataType: 'number' }, // [ 수수료인정건수]
    { fieldName: 'rentalDscAmt', header: `${t('MSG_TXT_RENTAL')}DC${t('MSG_TXT_AMT')}`, width: '120', styleName: 'text-right', dataType: 'number' }, // [렌탈할인금액]
    { fieldName: 'istDt', header: t('MSG_TXT_YR_INSTALLATION'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [ 설치일자]
    { fieldName: 'pdctIdno', header: t('MSG_TXT_CH') + t('MSG_TXT_SERIAL_NO'), width: '150', styleName: 'text-center' }, // [제품고유번호]
    { fieldName: 'stpStrtYm', header: `${t('MSG_TXT_STP_PRD')}(${t('MSG_TXT_STRT')})`, width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // [시작기간(중지시작년월)]
    { fieldName: 'stpEndYm', header: `${t('MSG_TXT_STP_PRD')}(${t('MSG_TXT_SHUTDOWN')})`, width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // [종료기간 (중지종료년월)]
    { fieldName: 'stpCanYm', header: `${t('MSG_TXT_STP')}${t('MSG_TXT_CANCEL_YM')}`, width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [중지취소년월]
    { fieldName: 'cralLocaraTno', header: t('MSG_TXT_RPLY') + t('MSG_TXT_CONTACT'), width: '150', styleName: 'text-center' }, // [ 휴대전화]
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_PD_FEE_FIX'), width: '100', styleName: 'text-center' }, // [ 수수료정액여부]
    { fieldName: 'sdingAckmtPerfAmt', header: t('MSG_TXT_ACKMT_PERF_AMT'), width: '120', styleName: 'text-right' }, // [ 인정실적금액]
    { fieldName: 'sdingFeeBaseAmt', header: t('MSG_TXT_FEE_BASE_AMT'), width: '120', styleName: 'text-right', dataType: 'number' }, // [ 수수료기준가격]
    { fieldName: 'bfchFeeAckmtCt', header: t('MSG_TXT_SDING') + t('MSG_TXT_FEE_ACKMT_CNT'), width: '120', styleName: 'text-center' }, // (모종)수수료 인정건수
    { fieldName: 'bfsvcBzsDvCd', header: t('MSG_TXT_CLSF_BS'), width: '120', styleName: 'text-center', options: codes.BFSVC_BZS_DV_CD.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId}-${v.codeName}` })) }, // [ BS업체구분코드]
    { fieldName: 'splyBzsDvCd', header: t('MSG_TXT_CLSF_BUS'), width: '120', styleName: 'text-center', options: codes.SPLY_BZS_DV_CD.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId}-${v.codeName}` })) }, // [ 조달업체구분코드]
    { fieldName: 'cntrChAkCn', header: t('MSG_TXT_NOTE'), width: '500', styleName: 'text-left' }, // [ 계약변경요청내용]
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '120', styleName: 'text-center' }, // [최초등록사용자명]
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), width: '140', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd hh:mm:ss' }, // [ 최초등록일시]
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.setColumnLayout(gridLayout.value[601]);
});
</script>
