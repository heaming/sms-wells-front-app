<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbSinglePaymentBulkChangeMgtM - 일시불 일괄변경 관리
3. 작성자 : hyeonjong.ra
4. 작성일 : 2023.04.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0113M03] 일시불 일괄변경 관리
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="2"
    one-row
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- 계약상세번호 -->
      <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
          @selected="onClickSelectCntrno"
        />
      </kw-search-item>
      <!-- 반영일 -->
      <kw-search-item :label="$t('MSG_TXT_RFLCTN_DT')">
        <kw-date-picker
          v-model="searchParams.rfDt"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalCount" />
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
      ref="grdMainRef"
      :visible-rows="10"
      @init="initGrdMain"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, useGlobal, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const { alert, modal } = useGlobal();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'DP_TP_CD',
);
const grdMainRef = ref(getComponentType('KwGrid'));

const totalCount = ref(0);

let cachedParams;
const searchParams = ref({
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  rfDt: '', // 반영일자
});

// 검색조건 : 계약상세번호
async function onClickSelectCntrno(cntrNo, cntrSn) {
  searchParams.value.cntrNo = cntrNo;
  searchParams.value.cntrSn = cntrSn;
}

// 조회
async function fetchData() {
  cachedParams = { ...cachedParams };

  const res = await dataService.get('/sms/wells/contract/changeorder/singlepayment-bulk-changes', { params: cachedParams });

  totalCount.value = res.data.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

// 조회버튼 클릭
async function onClickSearch() {
  if (isEmpty(searchParams.value.cntrNo) && isEmpty(searchParams.value.rfDt)) {
    alert(t('MSG_ALT_SRCH_CNDT_NEED_ONE'));
    return;
  }

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 일괄변경 등록 버튼 클릭
async function onClickBatchChangeReg() {
  const { result } = await modal({
    component: 'WwctbSinglePaymentBulkChangeMgtP',
    // componentProps: { apiUrl, templateId, extraData },
  });
  if (result) {
    await onClickSearch();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // [계약상세번호] 계약번호
    { fieldName: 'cntrSn' }, // [계약상세번호] 계약일련번호
    { fieldName: 'cstKnm' }, // [계약자명] 고객한글명
    { fieldName: 'rveCd' }, // [수납코드]
    { fieldName: 'pyerNo' }, // 납부자번호
    { fieldName: 'basePdCd' }, // [상품코드]
    { fieldName: 'pdNm' }, // [상품명]
    { fieldName: 'cntrRcpFshDtm' }, // [접수일] 계약접수완료일시
    { fieldName: 'istDt' }, // [설치일] 설치일자
    { fieldName: 'cntrCanDt' }, // [취소일] 계약취소일자
    { fieldName: 'cpsDt' }, // [보상일] 보상일자
    { fieldName: 'sppDuedt' }, // [예정일] 배송예정일자
    { fieldName: 'canPerfDt' }, // [실적취소일]
    { fieldName: 'reqdDt' }, // [kiwi철거일] 철거일자
    { fieldName: 'cttRsCd' }, // 컨택결과코드
    { fieldName: 'cttRsNm' }, // [컨택명] 컨택결과명
    { fieldName: 'booSellYn' }, // [예약여부]
    { fieldName: 'booSellTpCd' }, // 예약판매유형코드
    { fieldName: 'booSellTpNm' }, // 예약판매유형명
    { fieldName: 'feeAckmtCt', dataType: 'number' }, // [인정건수] 수수료인정건수
    { fieldName: 'ackmtPerfAmt', dataType: 'number' }, // [인정금액] 인정실적금액
    { fieldName: 'ackmtPerfRt' }, // [인정율(%)] 인정실적율
    { fieldName: 'feeAckmtBaseAmt', dataType: 'number' }, // [기준수수료] 수수료인정기준금액
    { fieldName: 'feeFxamYn' }, // [정액여부] 수수료정액여부
    { fieldName: 'dpTpCd' }, // [할부이체] 입금유형코드
    { fieldName: 'bfsvcBzsDvCd' }, // [할부실적] BS업체구분코드
    { fieldName: 'mmbsDpTpCd' }, // [멤버십이체] 입금유형코드
    { fieldName: 'copnDvYn' }, // [멤버십원장]
    { fieldName: 'frisuBfsvcPtrmN', dataType: 'number' }, // [무상멤버십] 무상BS기간수
    { fieldName: 'frisuAsPtrmN', dataType: 'number' }, // [무상A/S] 무상AS기간수
    { fieldName: 'sellEvCd' }, // [행사코드] 판매행사코드
    { fieldName: 'rgstDtm' }, // [등록일]
    { fieldName: 'rgstUsrId' }, // 등록자ID
    { fieldName: 'rgstUsrNm' }, // [등록자]
    { fieldName: 'mdfcDtm' }, // [최종수정일]
    { fieldName: 'mdfcUsrId' }, // 수정자ID
    { fieldName: 'mdfcUsrNm' }, // [최종수정자]
  ];

  const columns = [
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '152',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    }, // [계약상세번호]
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '117', styleName: 'text-center' }, // [계약자명]
    { fieldName: 'rveCd', header: t('MSG_TXT_RVE_CD'), width: '117', styleName: 'text-center' }, // [수납코드]
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '117', styleName: 'text-center' }, // [상품코드]
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '264' }, // [상품명]
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_RCP_D'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // [접수일] 계약접수완료일시
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // [설치일] 설치일자
    { fieldName: 'cntrCanDt', header: t('MSG_TXT_CAN_D'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // [취소일] 계약취소일자
    { fieldName: 'cpsDt', header: t('MSG_TXT_COMP_D'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // [보상일] 보상일자
    { fieldName: 'sppDuedt', header: t('MSG_TXT_DUEDT'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // [예정일] 배송예정일자
    { fieldName: 'canPerfDt', header: t('MSG_TXT_PRFMC_CNCL_DT'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // [실적취소일]
    { fieldName: 'reqdDt', header: `KIWI${t('MSG_TXT_REQD_D')}`, width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // [kiwi철거일] 철거일자
    { fieldName: 'cttRsNm', header: t('MSG_TXT_CNTCT_NM'), width: '264' }, // [컨택명] 컨택결과명
    { fieldName: 'booSellYn', header: t('MSG_TXT_RSV_YN'), width: '117', styleName: 'text-center' }, // [예약여부]
    { fieldName: 'feeAckmtCt', header: t('MSG_TXT_PD_ACC_CNT'), width: '117', styleName: 'text-right' }, // [인정건수] 수수료인정건수
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_RECOG_AMT_KRW'), width: '117', styleName: 'text-right' }, // [인정금액] 인정실적금액
    { fieldName: 'ackmtPerfRt', header: `${t('MSG_TXT_RECOG_RT')}(%)`, width: '117', styleName: 'text-right' }, // [인정율(%)] 인정실적율
    { fieldName: 'feeAckmtBaseAmt', header: `${t('MSG_TXT_PD_STD_FEE')}(${t('MSG_TXT_CUR_WON')})`, width: '131', styleName: 'text-right' }, // [기준수수료] 수수료인정기준금액
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_FXAM_YN'), width: '117', styleName: 'text-center' }, // [정액여부] 수수료정액여부
    { fieldName: 'dpTpCd',
      header: t('MSG_TXT_ISTM_FNT'),
      width: '117',
      styleName: 'text-right',
      editor: { type: 'list' },
      options: codes.DP_TP_CD }, // [할부이체] 입금유형코드
    { fieldName: 'bfsvcBzsDvCd', header: t('MSG_TXT_INSTLMNT_PYMNT'), width: '117', styleName: 'text-right' }, // [할부실적] BS업체구분코드
    { fieldName: 'mmbsDpTpCd',
      header: t('MSG_TXT_MEMBRSHP_TRSFR'),
      width: '117',
      styleName: 'text-right',
      editor: { type: 'list' },
      options: codes.DP_TP_CD }, // [멤버십이체] 입금유형코드
    { fieldName: 'copnDvYn', header: t('MSG_TXT_MEMBRSHP_LGDR'), width: '117', styleName: 'text-center' }, // [멤버십원장]
    { fieldName: 'frisuBfsvcPtrmN', header: t('MSG_TXT_FRISU_MSH'), width: '117', styleName: 'text-right' }, // [무상멤버십] 무상BS기간수
    { fieldName: 'frisuAsPtrmN', header: t('MSG_TXT_FRISU_AS'), width: '117', styleName: 'text-right' }, // [무상A/S] 무상AS기간수
    { fieldName: 'sellEvCd', header: t('MSG_TXT_EV_CD'), width: '117', styleName: 'text-center' }, // [행사코드] 판매행사코드
    { fieldName: 'rgstDtm', header: t('MSG_TXT_RGST_DT'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // [등록일]
    { fieldName: 'rgstUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '117', styleName: 'text-center' }, // [등록자]
    { fieldName: 'mdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // [최종수정일]
    { fieldName: 'mdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '117', styleName: 'text-center' }, // [최종수정자]
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
