<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaMachineChangeCustomerDtlP - 기기변경 고객조회
3. 작성자 : younuk.choi
4. 작성일 : 2023.04.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 기기변경을 수행할 건을 조회하고, 제약 및 실적적용율 등을 계산하여 통합계약에 사용
****************************************************************************************************
--->

<template>
  <kw-popup
    size="md"
    :title="$t('MSG_TXT_MCHN_CH')"
    ignore-on-modified
  >
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
          colspan="2"
          required
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
            class="w190"
            rules="required"
            @selected="onClickSearch"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-separator />
    <kw-form
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CST_NM')">
          <p>{{ frmMainData.cstKnm }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SEL_TYPE')">
          <p>{{ frmMainData.sellTpCd }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_INST_DT')">
          <p>{{ frmMainData.istDt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ACL_APYR')">
          <p>{{ frmMainData.finalPerfRtTxt }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DUTY_PTRM')">
          <p>{{ frmMainData.recapDutyPtrmNTxt }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CANC_DT')">
          <p>{{ frmMainData.reqdDt }}</p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ADDR')"
          :colspan="2"
        >
          <p>{{ frmMainData.adr }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_REFER_ARTC')">
          <p>{{ frmMainData.resultMessage }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CLN_YN')">
          <kw-option-group
            v-model="frmMainData.clnYn"
            type="radio"
            :options="CLN_CD"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <kw-btn
        primary
        :label="$t('MSG_BTN_CONFIRM')"
        @click="onClickConfirm"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useModal } from 'kw-lib';
import { isNull, cloneDeep } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const dataService = useDataService();
const { ok, cancel: onClickCancel } = useModal();
const CLN_CD = [
  { codeId: 'Y', codeName: t('MSG_TXT_MYCO_CLN') },
  { codeId: 'N', codeName: t('MSG_TXT_MYCO_NCLT') },
];

const props = defineProps({
  baseCntrNo: { type: String, default: '' }, // 현재 진행중인 계약번호
  baseCntrSn: { type: String, default: '' }, // 현재 진행중인 계약일련번호
  cstNo: { type: String, required: true, default: '' }, // 계약자 고객번호
  indvCrpDv: { type: String, required: true, default: '' }, // 법인격구분코드(1.개인, 2.법인)
  pdCd: { type: String, required: true, default: '' }, // 기준상품코드
  dscDv: { type: String, default: '' }, // 할인적용유형코드
  dscTp: { type: String, default: '' }, // 할인적용상세코드
  sellTpCd: { type: String, required: true, default: '' }, // 판매유형코드
  alncmpCd: { type: String, default: '' }, // 제휴사코드
  rgstMdfcDv: { type: String, required: true, default: '' }, // 등록/수정여부(1.등록, 2.수정)
});

const searchParams = ref({
  baseCntrNo: props.baseCntrNo,
  baseCntrSn: props.baseCntrSn,
  cstNo: props.cstNo,
  indvCrpDv: props.indvCrpDv,
  pdCd: props.pdCd,
  dscDv: props.dscDv,
  dscTp: props.dscTp,
  sellTpCd: props.sellTpCd,
  alncmpCd: props.alncmpCd,
  rgstMdfcDv: props.rgstMdfcDv,
  cntrNo: '',
  cntrSn: '',
});

const frmMainData = ref({
  workFlag: '', // 기기변경유형
  resultDvCheck: '', // 결과구분CHECK
  resultMessage: '', // 결과MSG
  finalPerfRt: '', // 최종실적율
  cntrNo: '', // 기변 계약번호
  cntrSn: '', // 기변 계약일련번호
  ptyCopnDvCd: '', // 상대법인격구분코드
  pdCd: '', // 기변상품코드
  recapDutyPtrmN: '', // 의무기간 수(월)
  adr: '', // 주소 (기본주소+상세주소)
  sellTpCd: '', // 기기변경대상 판매유형코드
  cstKnm: '', // 기기변경대상 계약고객명
  istDt: '', // 기기변경대상 설치일자
  reqdDt: '', // 기기변경대상 취소일자(철거일자)
  clnYn: '', // 회수여부
  finalPerfRtTxt: '', // 최종실적율(+단위)
  recapDutyPtrmNTxt: '', // 의무기간 수(+단위)
  // 사용안함
  rentalNmnN: '', // 렌탈차월
  rerntPsbDt: '', // 재렌탈가능일
  stplDutyStrtDt: '', // 약정의무시작일
  stplDutyEndDt: '', // 약정의무종료일
  rstlDutyStrtDt: '', // 재약정의무시작일
  rstlDutyEndDt: '', // 재약정의무종료일
  ownrsExnDt: '', // 소유권이전종료일
  dlqAmt: '', // 연체금액
  ucAmt: '', // 미수금액
});

const returnData = ref({
  cntrNo: '', // 기변 계약번호
  cntrSn: '', // 기변 계약일련번호
  cstKnm: '', // 기기변경대상 계약고객명
  sellTpCd: '', // 기기변경대상 판매유형코드
  istDt: '', // 기기변경대상 설치일자
  finalPerfRt: '', // 최종실적율
  recapDutyPtrmN: '', // 의무기간 수(월)
  reqdDt: '', // 기기변경대상 취소일자(철거일자)
  adr: '', // 주소 (기본주소+상세주소)
  ptyCopnDvCd: '', // 상대법인격구분코드
  workFlag: '', // 기기변경유형
  pdCd: '', // 기변상품코드
  resultDvCheck: '', // 결과구분CHECK
  clnYn: '', // 회수여부
});

let cachedParams;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  frmMainData.value = {};
  returnData.value = {};
  cachedParams = cloneDeep(searchParams.value);

  const res = await dataService.get('/sms/wells/contract/contracts/machine-changes', { params: { ...cachedParams } });
  console.log(res.data);

  frmMainData.value.workFlag = res.data.workFlag;
  frmMainData.value.resultDvCheck = res.data.resultDvCheck;
  frmMainData.value.resultMessage = res.data.resultMessage;
  frmMainData.value.cntrNo = res.data.cntrNo;
  frmMainData.value.cntrSn = res.data.cntrSn;
  frmMainData.value.ptyCopnDvCd = res.data.ptyCopnDvCd;
  frmMainData.value.pdCd = res.data.pdCd;
  frmMainData.value.adr = res.data.adr;
  frmMainData.value.sellTpCd = res.data.sellTpCd;
  frmMainData.value.cstKnm = res.data.cstKnm;
  frmMainData.value.istDt = res.data.istDt;
  frmMainData.value.reqdDt = res.data.reqdDt;
  frmMainData.value.finalPerfRt = res.data.finalPerfRt;
  frmMainData.value.recapDutyPtrmN = res.data.recapDutyPtrmN;

  if (!isNull(res.data.recapDutyPtrmN)) {
    frmMainData.value.recapDutyPtrmNTxt = `${res.data.recapDutyPtrmN}${t('MSG_TXT_MCNT')}`;
  }
  if (!isNull(res.data.recapDutyPtrmN)) {
    frmMainData.value.finalPerfRtTxt = `${res.data.finalPerfRt}%`;
  }

  // 사용안함
  frmMainData.value.rentalNmnN = res.data.rentalNmnN;
  frmMainData.value.rerntPsbDt = res.data.rerntPsbDt;
  frmMainData.value.stplDutyStrtDt = res.data.stplDutyStrtDt;
  frmMainData.value.stplDutyEndDt = res.data.stplDutyEndDt;
  frmMainData.value.rstlDutyStrtDt = res.data.rstlDutyStrtDt;
  frmMainData.value.rstlDutyEndDt = res.data.rstlDutyEndDt;
  frmMainData.value.ownrsExnDt = res.data.ownrsExnDt;
  frmMainData.value.dlqAmt = res.data.dlqAmt;
  frmMainData.value.ucAmt = res.data.ucAmt;
}

async function onClickSearch() {
  await fetchData();
}

async function onClickConfirm() {
  returnData.value = {};

  returnData.value.cntrNo = frmMainData.value.cntrNo;
  returnData.value.cntrSn = frmMainData.value.cntrSn;
  returnData.value.cstKnm = frmMainData.value.cstKnm;
  returnData.value.sellTpCd = frmMainData.value.sellTpCd;
  returnData.value.istDt = frmMainData.value.istDt;
  returnData.value.finalPerfRt = frmMainData.value.finalPerfRt;
  returnData.value.recapDutyPtrmN = frmMainData.value.recapDutyPtrmN;
  returnData.value.reqdDt = frmMainData.value.reqdDt;
  returnData.value.adr = frmMainData.value.adr;
  returnData.value.ptyCopnDvCd = frmMainData.value.ptyCopnDvCd;
  returnData.value.workFlag = frmMainData.value.workFlag;
  returnData.value.pdCd = frmMainData.value.pdCd;
  returnData.value.resultDvCheck = frmMainData.value.resultDvCheck;
  returnData.value.clnYn = frmMainData.value.clnYn;

  ok(returnData.value);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
