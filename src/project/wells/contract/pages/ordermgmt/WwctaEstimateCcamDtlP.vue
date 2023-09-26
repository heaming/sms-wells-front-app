<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaEstimateCcamDtlP - 계약상세정보 관리정보탭(위약금 예상)
3. 작성자 : jihoon.kim
4. 작성일 : 2023.06.05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0075] - 위약금 예상 조회 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
    ignore-on-modified
    no-action
    title="위약금예상조회"
  >
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 기준년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.slClYm"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <kw-action-top class="mb20">
      <template #left>
        <!-- 선납사항(회차) -->
        <h3>{{ $t('MSG_TXT_PRM_ARTC')+'('+frmMainData.prmTn+$t('MSG_TXT_ORDERSELECT_TITLE')+')' }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">(단위:원)</span>
    </kw-action-top>
    <kw-form
      :cols="2"
    >
      <kw-form-row>
        <!-- 선납개월 -->
        <kw-form-item
          :label="$t('MSG_TXT_PRM_MCNT')"
        >
          <kw-input
            v-model="frmMainData.prmMcn"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 선납기간 -->
        <kw-form-item
          :label="$t('MSG_TXT_PRM_PTRM')"
        >
          <kw-date-range-picker
            v-model:from="frmMainData.prmStrtYymm"
            v-model:to="frmMainData.prmEndYymm"
            placeholder=""
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 월렌탈료/할인금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_MM_RTLFE')+'/'+$t('MSG_TXT_DSC_AMT')"
          :colspan="2"
        >
          <kw-input
            v-model="frmMainData.rentalAmt"
            class="w410"
            align="right"
            placeholder=""
            readonly
          />
          <ul class="kw-notification">
            <li>
              <span>월렌탈료(선납할인적용) / 할인금액(1개월 기준)</span>
            </li>
          </ul>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 할인 총 금액(선납기간기준) -->
        <kw-form-item
          :label="$t('MSG_TXT_DSC_TOT_AMT')+'('+$t('MSG_TXT_PRM_PTRM_BASE')+')'"
        >
          <kw-input
            v-model="frmMainData.prmDscAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 선납 예상 총 금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_PRM_ET_TOT_AMT')"
        >
          <kw-input
            v-model="frmMainData.totPrmAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <!-- 매출사항(차월) -->
        <h3>{{ $t('MSG_TXT_SL_ARTC')+'('+frmMainData.rentalTn+$t('MSG_TXT_NMN')+')' }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">(단위:원)</span>
    </kw-action-top>
    <kw-form
      :cols="3"
    >
      <kw-form-row>
        <!-- 정상매출 -->
        <kw-form-item
          :label="$t('MSG_TXT_NOM_SL')"
        >
          <kw-input
            v-model="frmMainData.nomSlAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 렌탈일수 -->
        <kw-form-item
          :label="$t('MSG_TXT_RENTAL_DC')"
        >
          <kw-input
            v-model="frmMainData.rentalDc"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 교체일자 -->
        <kw-form-item
          :label="$t('MSG_TXT_CHNG_DT')"
        >
          <kw-input
            v-model="frmMainData.rplmDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 추가매출 -->
        <kw-form-item
          :label="$t('MSG_TXT_SPMT_SL')"
        >
          <kw-input
            v-model="frmMainData.spmtSlAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 정상할인 -->
        <kw-form-item
          :label="$t('MSG_TXT_NOM_DSC')"
        >
          <kw-input
            v-model="frmMainData.nomDscAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 취소조정 -->
        <kw-form-item
          :label="$t('MSG_TXT_CAN_CTR')"
        >
          <kw-input
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 부가서비스 -->
        <kw-form-item
          :label="$t('MSG_TXT_ADN_SV')"
        >
          <kw-input
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 추가할인 -->
        <kw-form-item
          :label="$t('MSG_TXT_SPMT_DSC')"
        >
          <kw-input
            v-model="frmMainData.spmtDscAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 매출조정 -->
        <kw-form-item
          :label="$t('MSG_TXT_SL_CTR')"
        >
          <kw-input
            v-model="frmMainData.slCtrAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 매출금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_SL_AMT')"
        >
          <kw-input
            v-model="frmMainData.thmSlSumAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 매출VAT -->
        <kw-form-item
          :label="$t('MSG_TXT_SL_VAT')"
        >
          <kw-input
            v-model="frmMainData.slSumVat"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 매출누계 -->
        <kw-form-item
          :label="$t('MSG_TXT_SL_AGG')"
        >
          <kw-input
            v-model="frmMainData.slAggAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 할인누계 -->
        <kw-form-item
          :label="$t('MSG_TXT_DSC_AGG')"
        >
          <kw-input
            v-model="frmMainData.dscAggAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 조정누계 -->
        <kw-form-item
          :label="$t('MSG_TXT_CTR_AGG')"
        >
          <kw-input
            v-model="frmMainData.ctrAggAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 매출잔액 -->
        <kw-form-item
          :label="$t('MSG_TXT_SL_BLAM')"
        >
          <kw-input
            v-model="frmMainData.thmUcBlam"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-form
      :cols="3"
    >
      <kw-form-row>
        <!-- 할인누계 -->
        <kw-form-item
          :label="$t('MSG_TXT_DSC_AGG')"
        >
          <kw-input
            v-model="frmMainData.btdDlqAddAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 入 -->
        <kw-form-item
          label="入"
        >
          <kw-input
            v-model="frmMainData.thmDlqAddDpSumAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 出 -->
        <kw-form-item
          label="出"
        >
          <kw-input
            v-model="frmMainData.thmDlqAddRfndSumAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 조정 -->
        <kw-form-item
          :label="$t('MSG_TXT_CTR')"
        >
          <kw-input
            v-model="frmMainData.thmCtrDlqAddAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 미수금(未) -->
        <kw-form-item
          :label="$t('MSG_TXT_UCAM_UC')"
        >
          <kw-input
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <!-- 위약금예상 -->
        <h3>{{ $t('MSG_TXT_CCAM_ET') }}</h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">(단위:원)</span>
    </kw-action-top>
    <kw-search
      one-row
      :cols="2"
      @search="onClickEstimateCcamSearch"
    >
      <kw-search-row>
        <!-- 취소예정일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_CAN_EXP_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.rqdt"
            :label="$t('MSG_TXT_CAN_EXP_DT')"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <kw-form
      :cols="3"
      class="mt30"
    >
      <kw-form-row>
        <!-- 잔여렌탈료 -->
        <kw-form-item
          :label="$t('MSG_TXT_RES_RTLFE')"
        >
          <kw-input
            v-model="frmMainData.resRtlfeBorAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 등록비할인 -->
        <kw-form-item
          :label="$t('MSG_TXT_RGST_COST_DSC')"
        >
          <kw-input
            v-model="frmMainData.rgstCostDscBorAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 할인금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_DSC_AMT')"
        >
          <kw-input
            v-model="frmMainData.rentalDscBorAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 소모품비 -->
        <kw-form-item
          :label="$t('MSG_TXT_CSMB_CS')"
        >
          <kw-input
            v-model="frmMainData.csmbCostBorAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 재약정 -->
        <kw-form-item
          :label="$t('MSG_TXT_RSTL')"
        >
          <kw-input
            v-model="frmMainData.rstlBorAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 사용포인트 -->
        <kw-form-item
          :label="$t('MSG_TXT_USE_P')"
        >
          <kw-input
            v-model="frmMainData.pBorAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 위약금철거비 -->
        <kw-form-item
          :label="$t('MSG_TXT_CCAM_REQD_CS')"
        >
          <kw-input
            v-model="frmMainData.reqdCsBorAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 위약금총액 -->
        <kw-form-item
          :label="$t('MSG_TXT_CCAM_TOT_AMT')"
        >
          <kw-input
            v-model="frmMainData.borAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <ul class="kw-notification mt20">
      <li>
        <span class="kw-fc--primary">단순 위약금 예상조회(취소일까지 렌탈료 및 추가할인금액 제외)로 실제 취소 시 정산금액에 차이가 있을 수 있습니다.</span>
      </li>
    </ul>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, notify, stringUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();

const props = defineProps({
  cntrNo: { type: String, required: true, default: '' }, // 계약번호
  cntrSn: { type: String, required: true, default: '' }, // 계약일련번호
});

let cachedParams;
const searchParams = ref({
  cntrNo: props.cntrNo, // 계약번호
  cntrSn: props.cntrSn, // 계약일련번호
  slClYm: '', // 기준년월
  rqdt: '', // 취소예정일자
});

const frmMainData = ref({
  // 1.선납사항(회차)-
  prmTn: '', // 선납회차
  prmMcn: '', // 선납개월수
  prmDscr: '', // 선납할인율
  rentalAmt: '', // 월렌탈료(렌탈금액)
  rentalDscAmt: '', // 할인금액(렌탈할인금액)
  prmStrtYymm: '', // 선납기간-시작년월
  prmEndYymm: '', // 선납기간-종료년월
  prmDscAmt: '', // 할인 총 금액(선납기간기준)
  totPrmAmt: '', // 선납예상총금액

  // 2.매출사항(차월)-
  rentalTn: '', // 렌탈회차
  nomSlAmt: '', // 정상매출금액
  rentalDc: '', // 렌탈일수
  slDc: '', // 매출일수
  rplmDt: '', // 교체일자
  spmtSlAmt: '', // 추가매출금액
  nomDscAmt: '', // 정상할인금액
  spmtDscAmt: '', // 추가할인금액
  slCtrAmt: '', // 매출조정금액
  thmSlSumAmt: '', // 당월매출합계금액
  slSumVat: '', // 매출합계부가가치세
  slAggAmt: '', // 매출누계금액
  dscAggAmt: '', // 할인누계
  ctrAggAmt: '', // 조정누계
  thmUcBlam: '', // 매출잔액
  btdDlqAddAmt: '', // 연체가산금
  thmDlqAddDpSumAmt: '', // 입(入)
  thmDlqAddRfndSumAmt: '', // 출(出)
  thmCtrDlqAddAmt: '', // 조정
  // thmUcBlam: '', // 미수금

  // 3.위약금예상-
  resRtlfeBorAmt: '', // 잔여렌탈료
  rgstCostDscBorAmt: '', // 등록비할인
  rentalDscBorAmt: '', // 할인금액
  csmbCostBorAmt: '', // 소모품비
  rstlBorAmt: '', // 재약정
  pBorAmt: '', // 사용포인트
  reqdCsBorAmt: '', // 위약금철거비
  borAmt: '', // 위약금총액
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/prepayment-sales-info', { params: cachedParams });
  console.log(res.data);

  if (res.data.length === 0) {
    await notify(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }

  if (res.data.length > 0) {
    // 1.선납사항(회차)-
    frmMainData.value.prmTn = res.data[0].prmTn; // 선납회차
    frmMainData.value.prmMcn = res.data[0].prmMcn; // 선납개월수
    frmMainData.value.prmStrtYymm = res.data[0].prmStrtYymm; // 선납기간-시작년월
    frmMainData.value.prmEndYymm = res.data[0].prmEndYymm; // 선납기간-종료년월
    frmMainData.value.rentalAmt = `${stringUtil.getNumberWithComma(Number(res.data[0].rentalAmt), 0)}/${stringUtil.getNumberWithComma(Number(res.data[0].rentalDscAmt), 0)}`; // 월렌탈료/렌탈할인금액
    frmMainData.value.prmDscAmt = stringUtil.getNumberWithComma(Number(res.data[0].prmDscAmt), 0); // 할인 총 금액(선납기간기준)
    frmMainData.value.totPrmAmt = stringUtil.getNumberWithComma(Number(res.data[0].totPrmAmt), 0); // 선납예상총금액

    // 2.매출사항(차월)-
    frmMainData.value.rentalTn = res.data[0].rentalTn; // 렌탈회차
    frmMainData.value.nomSlAmt = stringUtil.getNumberWithComma(Number(res.data[0].nomSlAmt), 0); // 정상매출금액
    frmMainData.value.rentalDc = res.data[0].rentalDc; // 렌탈일수
    frmMainData.value.slDc = res.data[0].slDc; // 매출일수
    frmMainData.value.rplmDt = res.data[0].rplmDt; // 교체일자
    frmMainData.value.spmtSlAmt = stringUtil.getNumberWithComma(Number(res.data[0].spmtSlAmt), 0); // 추가매출금액
    frmMainData.value.nomDscAmt = stringUtil.getNumberWithComma(Number(res.data[0].nomDscAmt), 0); // 정상할인금액
    // 취소조정
    // 부가서비스
    frmMainData.value.spmtDscAmt = stringUtil.getNumberWithComma(Number(res.data[0].spmtDscAmt), 0); // 추가할인금액
    frmMainData.value.slCtrAmt = stringUtil.getNumberWithComma(Number(res.data[0].slCtrAmt), 0); // 매출조정금액
    frmMainData.value.thmSlSumAmt = stringUtil.getNumberWithComma(Number(res.data[0].thmSlSumAmt), 0); // 당월매출합계금액
    frmMainData.value.slSumVat = stringUtil.getNumberWithComma(Number(res.data[0].slSumVat), 0); // 매출합계부가가치세
    frmMainData.value.slAggAmt = stringUtil.getNumberWithComma(Number(res.data[0].slAggAmt), 0); // 매출누계금액
    frmMainData.value.dscAggAmt = stringUtil.getNumberWithComma(Number(res.data[0].dscAggAmt), 0); // 할인누계
    frmMainData.value.ctrAggAmt = stringUtil.getNumberWithComma(Number(res.data[0].ctrAggAmt), 0); // 조정누계
    frmMainData.value.thmUcBlam = stringUtil.getNumberWithComma(Number(res.data[0].thmUcBlam), 0); // 매출잔액
    frmMainData.value.btdDlqAddAmt = stringUtil.getNumberWithComma(Number(res.data[0].btdDlqAddAmt), 0); // 연체가산금
    frmMainData.value.thmDlqAddDpSumAmt = stringUtil.getNumberWithComma(Number(res.data[0].thmDlqAddDpSumAmt), 0); // 입
    // eslint-disable-next-line max-len
    frmMainData.value.thmDlqAddRfndSumAmt = stringUtil.getNumberWithComma(Number(res.data[0].thmDlqAddRfndSumAmt), 0); // 출
    frmMainData.value.thmCtrDlqAddAmt = stringUtil.getNumberWithComma(Number(res.data[0].thmCtrDlqAddAmt), 0); // 조정
  }
}

async function fetchEstimateCcamData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/estimate-cancellationFees', { params: cachedParams });
  console.log(res.data);

  // console.log(res.data.length);
  // if (res.data.length > 0) {
  frmMainData.value.resRtlfeBorAmt = stringUtil.getNumberWithComma(Number(res.data.resRtlfeBorAmt), 0);
  frmMainData.value.rgstCostDscBorAmt = stringUtil.getNumberWithComma(Number(res.data.rgstCostDscBorAmt), 0);
  frmMainData.value.rentalDscBorAmt = stringUtil.getNumberWithComma(Number(res.data.rentalDscBorAmt), 0);
  frmMainData.value.csmbCostBorAmt = stringUtil.getNumberWithComma(Number(res.data.csmbCostBorAmt), 0);
  frmMainData.value.rstlBorAmt = stringUtil.getNumberWithComma(Number(res.data.rstlBorAmt), 0); // 재약정
  frmMainData.value.pBorAmt = stringUtil.getNumberWithComma(Number(res.data.pBorAmt), 0); // 사용포인트
  frmMainData.value.reqdCsBorAmt = stringUtil.getNumberWithComma(Number(res.data.reqdCsBorAmt), 0); // 위약금철거비
  frmMainData.value.borAmt = stringUtil.getNumberWithComma(Number(res.data.borAmt), 0); // 위약금총액
  // }
}

async function onClickSearch() {
  await fetchData();
}

async function onClickEstimateCcamSearch() {
  await fetchEstimateCcamData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
</script>
