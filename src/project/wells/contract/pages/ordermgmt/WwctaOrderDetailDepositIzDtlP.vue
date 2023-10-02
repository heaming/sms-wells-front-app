<!-- eslint-disable max-len -->
<!-- window.open 너비 1292px이상 설정 요망
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaOrderDetailDepositIzDtlP - wells 주문 상세 조회
3. 작성자 : jihoon.kim
4. 작성일 : 2023.05.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0075] - 입금내역 조회 화면
****************************************************************************************************
--->
<template>
  <kw-action-top class="mt30">
    <!-- 입금 -->
    <kw-btn
      v-permission:read
      dense
      secondary
      :label="$t('MSG_BTN_DP')"
      @click="onClickDepositRgst"
    />
    <!-- 선납 -->
    <kw-btn
      v-if="isSearchPrepaymentVisible"
      v-permission:read
      dense
      secondary
      :label="$t('MSG_BTN_PRM')"
      @click="onClickPrepayment"
    />
    <!-- 입금상세정보 -->
    <kw-btn
      v-permission:read
      dense
      secondary
      :label="$t('MSG_BTN_DP_DTL_INF')"
      @click="onClickDpDtlInf"
    />
  </kw-action-top>
  <kw-form
    :cols="2"
    dense
    class="mt20"
  >
    <!-- 렌탈/멤버쉽 -->
    <slot v-if="searchParams.sellTpCd === '2' || searchParams.sellTpCd === '3'">
      <kw-form-row>
        <!-- 렌탈, 멤버십료1 -->
        <kw-form-item
          :label="$t('MSG_TXT_RNTL_MSH_CHRAM_1')"
        >
          <p>
            {{ frmMainData.rentalMsh1Cost+$t('MSG_TXT_CUR_WON')
              +'('+frmMainData.rental1Ptrm+$t('MSG_TXT_MCNT')+')' }}
          </p>
        </kw-form-item>
        <!-- 렌탈, 멤버십료2 -->
        <kw-form-item
          :label="$t('MSG_TXT_RNTL_MSH_CHRAM_2')"
        >
          <p>{{ frmMainData.rentalMsh2Cost+$t('MSG_TXT_MON')+'('+frmMainData.rental2Ptrm+$t('MSG_TXT_MCNT')+')' }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 추가매출 -->
        <kw-form-item
          :label="$t('MSG_TXT_SPMT_SL')"
        >
          <p>{{ frmMainData.spmtSlAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
        <!-- 추가할인 -->
        <kw-form-item
          :label="$t('MSG_TXT_SPMT_DSC')"
        >
          <p>{{ frmMainData.spmtDscAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 매출일자 -->
        <kw-form-item
          :label="$t('MSG_TXT_SL_DT')"
        >
          <p>{{ stringUtil.getDateFormat(frmMainData.slDt) }}</p>
        </kw-form-item>
        <!-- 매출금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_SL_AMT')"
        >
          <p>{{ frmMainData.slAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 선수금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_PRPD_AMT')"
        >
          <p>{{ frmMainData.prpdAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
        <!-- 미수금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_UC_AMT')"
        >
          <p>{{ frmMainData.ucAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 연체금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_DLQ_AMT')"
        >
          <p>{{ frmMainData.dlqAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
        <!-- 매출중지금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_SL_STP_AMT')"
        >
          <p>{{ frmMainData.slStpAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 예상멤버십 금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_EST_MSH_AMT')"
        >
          <p>{{ frmMainData.etMshAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
      </kw-form-row>
    </slot>
    <!-- 일시불 -->
    <slot v-if="searchParams.sellTpCd === '1'">
      <kw-form-row>
        <!-- 판매금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_SALE_PRICE')"
        >
          <p>{{ frmMainData.sellAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
        <!-- 월할부금/할부개월 -->
        <kw-form-item
          :label="$t('MSG_TXT_MM_INTAM')+'/'+$t('MSG_TXT_ISTM_MCNT')"
        >
          <p>{{ frmMainData.mmIstmAmt+$t('MSG_TXT_CUR_WON')+'('+frmMainData.istmMcn+$t('MSG_TXT_MCNT')+')' }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 청약금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_SUBSC_AMT')"
        >
          <p>{{ frmMainData.subscAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
        <!-- 할부금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_ISTM_AMT')"
        >
          <p>{{ frmMainData.istmAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 현금잔액 -->
        <kw-form-item
          :label="$t('MSG_TXT_CSH_BLAM')"
        >
          <p>{{ frmMainData.istmPcamAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
        <!-- 미수금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_UC_AMT')"
        >
          <p>{{ frmMainData.ucAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 여신한도 사용/총액 -->
        <kw-form-item
          :label="$t('MSG_TXT_LD_LIM_USE')+'/'+$t('MSG_TXT_TAM')"
        >
          <p>{{ frmMainData.ldLimUse+$t('MSG_TXT_CUR_WON')+'/'+ frmMainData.ldLimTam+$t('MSG_TXT_CUR_WON') }}</p>
          <kw-separator
            vertical
            spaced="10px"
            size="0"
          />
        </kw-form-item>
        <!-- 여신한도 잔액 -->
        <kw-form-item
          :label="$t('MSG_TXT_LD_LIM_BLAM')"
        >
          <p>{{ frmMainData.ldLimBlam+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
      </kw-form-row>
    </slot>
    <!-- 정기배송 -->
    <slot v-if="searchParams.sellTpCd === '6'">
      <kw-form-row>
        <!-- 판매금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_SALE_PRICE')"
        >
          <p>
            {{ frmMainData.sellAmt+$t('MSG_TXT_CUR_WON')
              +'('+$t('MSG_TXT_PCSV_SPMT')+': '+frmMainData.pcsvSpmt+$t('MSG_TXT_CUR_WON')+')' }}
          </p>
        </kw-form-item>
        <!-- 판매총액 -->
        <kw-form-item
          :label="$t('MSG_TXT_SELL_TOT_AMT')"
        >
          <p>{{ frmMainData.sellTam+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 할인금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_DSC_AMT')"
        >
          <p>{{ frmMainData.dscAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
        <!-- 추가할인 -->
        <kw-form-item
          :label="$t('MSG_TXT_SPMT_DSC')"
        >
          <p>{{ frmMainData.spmtDsc+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 월 청구(납입)금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_MM_BIL_PY_AMT')"
        >
          <p>{{ frmMainData.mmBilPyAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
        <!-- 주기 -->
        <kw-form-item
          :label="$t('MSG_TXT_CYCL')"
        >
          <p>{{ frmMainData.svPrd+$t('MSG_TXT_MCNT') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 연체금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_DLQ_AMT')"
        >
          <p>{{ frmMainData.dlqAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
        <!-- 미수금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_UC_AMT')"
        >
          <p>{{ frmMainData.ucAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 선수금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_PRPD_AMT')"
        >
          <p>{{ frmMainData.prpdAmt+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
        <!-- 청구미수 -->
        <kw-form-item
          :label="$t('MSG_TXT_BIL_UC')"
        >
          <p>{{ frmMainData.bilUc+$t('MSG_TXT_CUR_WON') }}</p>
        </kw-form-item>
      </kw-form-row>
    </slot>
  </kw-form>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, stringUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { notify, modal } = useGlobal();
const props = defineProps({
  cntrNo: { type: String, required: true, default: '' },
  cntrSn: { type: String, required: true, default: '' },
  sellTpCd: { type: String, required: true, default: '' },
  cntrCstNo: { type: String, required: false, default: '' },
});

let cachedParams;
const searchParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  sellTpCd: props.sellTpCd,
  cntrCstNo: props.cntrCstNo,
});

const frmMainData = ref({
  rentalMsh1Cost: '', // 렌탈,멤버십료1
  rental1Ptrm: '', // 렌탈기간1
  rentalMsh2Cost: '', // 렌탈,멤버십료2
  rental2Ptrm: '', // 렌탈기간2
  spmtSlAmt: '', // 추가매출
  spmtDscAmt: '', // 추가할인
  slDt: '', // 매출일자
  slAmt: '', // 매출금액
  prpdAmt: '', // 선수금액
  ucAmt: '', // 미수금액
  dlqAmt: '', // 연체금액
  slStpAmt: '', // 매출중지금액
  etMshAmt: '', // 예상멤버십 금액

  sellAmt: '', // 판매금액
  mmIstmAmt: '', // 월할부금
  istmMcn: '', // 할부개월
  subscAmt: '', // 청약금액
  istmAmt: '', // 할부금액
  istmPcamAmt: '', // 현금잔액
  ldLimUse: '', // 여신한도 사용
  ldLimTam: '', // 여신한도 총액
  ldLimBlam: '', // 여신한도 잔액

  sellTam: '', // 최종금액(판매총액)
  dscAmt: '', // 할인금액
  spmtDsc: '', // 판매할인조정금액(추가할인)
  mmBilPyAmt: '', // 월 청구(납입)금액
  svPrd: '', // 서비스주기(주기)
  bilUc: '', // 기말미수금액(청구미수)
  pcsvSpmt: '', // 택배추가
  prtnrKnm: '', // 판매자성명
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const isSearchPrepaymentVisible = ref(true); // 선납버튼

// 입금등록 버튼 팝업 호출
async function onClickDepositRgst() {
  // await alert('입금내역 팝업은 개발예정입니다.');
  const searchPopupParams = {
    cntrNo: searchParams.value.cntrNo,
    cntrSn: searchParams.value.cntrSn,
    prtnrKnm: frmMainData.value.prtnrKnm,
  };

  await modal({
    component: 'WwctaOrderDetailDepositRgstMgtP', // 입금등록
    componentProps: searchPopupParams,
  });
}

// 선납버튼 팝업 호출
async function onClickPrepayment() {
  // 선납예상 버튼
  if (searchParams.value.cntrNo === '') {
    // 검색버튼 클릭 후 버튼 클릭 바랍니다.
    await notify(t('MSG_ALT_SRCH_AFTER_BTN_CLICK'));
    return; // 계약상세번호 없을 시 false 반환
  }
  await modal({
    component: 'WwdcPrepaymentEstimateAmountListP', // 선납예상금액 조회(청구이체)
    componentProps: {
      cntrNo: searchParams.value.cntrNo,
      cntrSn: searchParams.value.cntrSn,
    },
  });
}

// 입금상세정보버튼 팝업 호출
async function onClickDpDtlInf() {
  const searchPopupParams = {
    cntrNo: searchParams.value.cntrNo,
    cntrSn: searchParams.value.cntrSn,
    cntrCstNo: searchParams.value.cntrCstNo,
  };

  await modal({
    component: 'WwctaTradeSpecificationSheetListP', // 거래명세서 목록 조회
    componentProps: searchPopupParams,
    window: true,
    windowFeatures: { width: 1300, height: 700 },
  });
}

// wells 주문 상세(판매내역)
async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/contracts/order-details/deposit-itemization', { params: cachedParams });
  console.log(res.data);

  if (!isEmpty(res.data.searchRentalDepositIzResList)
   && res.data.searchRentalDepositIzResList.length > 0) {
    // eslint-disable-next-line max-len
    frmMainData.value.rentalMsh1Cost = stringUtil.getNumberWithComma(Number(res.data.searchRentalDepositIzResList[0].rentalMsh1Cost), 0); // 렌탈,멤버십료1
    frmMainData.value.rental1Ptrm = res.data.searchRentalDepositIzResList[0].rental1Ptrm; // 렌탈기간1
    // eslint-disable-next-line max-len
    frmMainData.value.rentalMsh2Cost = stringUtil.getNumberWithComma(Number(res.data.searchRentalDepositIzResList[0].rentalMsh2Cost), 0); // 렌탈,멤버십료2
    frmMainData.value.rental2Ptrm = res.data.searchRentalDepositIzResList[0].rental2Ptrm; // 렌탈기간2
    // eslint-disable-next-line max-len
    frmMainData.value.spmtSlAmt = stringUtil.getNumberWithComma(Number(res.data.searchRentalDepositIzResList[0].spmtSlAmt), 0); // 추가매출
    // eslint-disable-next-line max-len
    frmMainData.value.spmtDscAmt = stringUtil.getNumberWithComma(Number(res.data.searchRentalDepositIzResList[0].spmtDscAmt), 0); // 추가할인
    frmMainData.value.slDt = res.data.searchRentalDepositIzResList[0].slDt; // 매출일자
    // eslint-disable-next-line max-len
    frmMainData.value.slAmt = stringUtil.getNumberWithComma(Number(res.data.searchRentalDepositIzResList[0].slAmt), 0); // 매출금액
    // eslint-disable-next-line max-len
    frmMainData.value.prpdAmt = stringUtil.getNumberWithComma(Number(res.data.searchRentalDepositIzResList[0].prpdAmt), 0); // 선수금액
    // eslint-disable-next-line max-len
    frmMainData.value.ucAmt = stringUtil.getNumberWithComma(Number(res.data.searchRentalDepositIzResList[0].ucAmt), 0); // 미수금액
    // eslint-disable-next-line max-len
    frmMainData.value.dlqAmt = stringUtil.getNumberWithComma(Number(res.data.searchRentalDepositIzResList[0].dlqAmt), 0); // 연체금액
    // eslint-disable-next-line max-len
    frmMainData.value.slStpAmt = stringUtil.getNumberWithComma(Number(res.data.searchRentalDepositIzResList[0].slStpAmt), 0); // 매출중지금액
    // eslint-disable-next-line max-len
    frmMainData.value.etMshAmt = stringUtil.getNumberWithComma(Number(res.data.searchRentalDepositIzResList[0].etMshAmt), 0); // 예상멤버십 금액
    frmMainData.value.prtnrKnm = res.data.searchRentalDepositIzResList[0].prtnrKnm; // 판매자성명
  } else if (!isEmpty(res.data.searchMembershipDepositIzResList)
          && res.data.searchMembershipDepositIzResList.length > 0) {
    // eslint-disable-next-line max-len
    frmMainData.value.rentalMsh1Cost = stringUtil.getNumberWithComma(Number(res.data.searchMembershipDepositIzResList[0].rentalMsh1Cost), 0); // 렌탈,멤버십료1
    frmMainData.value.rental1Ptrm = res.data.searchMembershipDepositIzResList[0].rental1Ptrm; // 렌탈기간1
    // eslint-disable-next-line max-len
    frmMainData.value.rentalMsh2Cost = stringUtil.getNumberWithComma(Number(res.data.searchMembershipDepositIzResList[0].rentalMsh2Cost), 0); // 렌탈,멤버십료2
    frmMainData.value.rental2Ptrm = res.data.searchMembershipDepositIzResList[0].rental2Ptrm; // 렌탈기간2
    // eslint-disable-next-line max-len
    frmMainData.value.spmtSlAmt = stringUtil.getNumberWithComma(Number(res.data.searchMembershipDepositIzResList[0].spmtSlAmt), 0); // 추가매출
    // eslint-disable-next-line max-len
    frmMainData.value.spmtDscAmt = stringUtil.getNumberWithComma(Number(res.data.searchMembershipDepositIzResList[0].spmtDscAmt), 0); // 추가할인
    frmMainData.value.slDt = res.data.searchMembershipDepositIzResList[0].slDt; // 매출일자
    // eslint-disable-next-line max-len
    frmMainData.value.slAmt = stringUtil.getNumberWithComma(Number(res.data.searchMembershipDepositIzResList[0].slAmt), 0); // 매출금액
    // eslint-disable-next-line max-len
    frmMainData.value.prpdAmt = stringUtil.getNumberWithComma(Number(res.data.searchMembershipDepositIzResList[0].prpdAmt), 0); // 선수금액
    // eslint-disable-next-line max-len
    frmMainData.value.ucAmt = stringUtil.getNumberWithComma(Number(res.data.searchMembershipDepositIzResList[0].ucAmt), 0); // 미수금액
    // eslint-disable-next-line max-len
    frmMainData.value.dlqAmt = stringUtil.getNumberWithComma(Number(res.data.searchMembershipDepositIzResList[0].dlqAmt), 0); // 연체금액
    // eslint-disable-next-line max-len
    frmMainData.value.slStpAmt = stringUtil.getNumberWithComma(Number(res.data.searchMembershipDepositIzResList[0].slStpAmt), 0); // 매출중지금액
    // eslint-disable-next-line max-len
    frmMainData.value.etMshAmt = stringUtil.getNumberWithComma(Number(res.data.searchMembershipDepositIzResList[0].etMshAmt), 0); // 예상멤버십 금액
    frmMainData.value.prtnrKnm = res.data.searchMembershipDepositIzResList[0].prtnrKnm; // 판매자성명
  } else if (!isEmpty(res.data.searchSpayCntrtDepositIzResList)
          && res.data.searchSpayCntrtDepositIzResList.length > 0) {
    // eslint-disable-next-line max-len
    frmMainData.value.sellAmt = stringUtil.getNumberWithComma(Number(res.data.searchSpayCntrtDepositIzResList[0].sellAmt), 0); // 판매금액
    // eslint-disable-next-line max-len
    frmMainData.value.mmIstmAmt = stringUtil.getNumberWithComma(Number(res.data.searchSpayCntrtDepositIzResList[0].mmIstmAmt), 0); // 월할부금
    // eslint-disable-next-line max-len
    frmMainData.value.istmMcn = stringUtil.getNumberWithComma(Number(res.data.searchSpayCntrtDepositIzResList[0].istmMcn), 0); // 할부개월
    // eslint-disable-next-line max-len
    frmMainData.value.subscAmt = stringUtil.getNumberWithComma(Number(res.data.searchSpayCntrtDepositIzResList[0].subscAmt), 0); // 청약금액
    // eslint-disable-next-line max-len
    frmMainData.value.istmAmt = stringUtil.getNumberWithComma(Number(res.data.searchSpayCntrtDepositIzResList[0].istmAmt), 0); // 할부금액
    // eslint-disable-next-line max-len
    frmMainData.value.istmPcamAmt = stringUtil.getNumberWithComma(Number(res.data.searchSpayCntrtDepositIzResList[0].istmPcamAmt), 0); // 현금잔액
    // eslint-disable-next-line max-len
    frmMainData.value.ucAmt = stringUtil.getNumberWithComma(Number(res.data.searchSpayCntrtDepositIzResList[0].ucAmt), 0); // 미수금액
    // eslint-disable-next-line max-len
    frmMainData.value.ldLimUseTam = stringUtil.getNumberWithComma(Number(res.data.searchSpayCntrtDepositIzResList[0].sellAmt), 0); // 여신한도 사용/총액
    // eslint-disable-next-line max-len
    frmMainData.value.ldLimBlam = stringUtil.getNumberWithComma(Number(res.data.searchSpayCntrtDepositIzResList[0].sellAmt), 0); // 여신한도 잔액
    frmMainData.value.prtnrKnm = res.data.searchSpayCntrtDepositIzResList[0].prtnrKnm; // 판매자성명
  } else if (!isEmpty(res.data.searchRegularShippingsDepositIzResList)
          && res.data.searchRegularShippingsDepositIzResList.length > 0) {
    // eslint-disable-next-line max-len
    frmMainData.value.sellAmt = stringUtil.getNumberWithComma(Number(res.data.searchRegularShippingsDepositIzResList[0].sellAmt), 0); // 판매금액
    // eslint-disable-next-line max-len
    frmMainData.value.sellTam = stringUtil.getNumberWithComma(Number(res.data.searchRegularShippingsDepositIzResList[0].sellTam), 0); // 최종금액(판매총액)
    // eslint-disable-next-line max-len
    frmMainData.value.dscAmt = stringUtil.getNumberWithComma(Number(res.data.searchRegularShippingsDepositIzResList[0].dscAmt), 0); // 할인금액
    // eslint-disable-next-line max-len
    frmMainData.value.spmtDsc = stringUtil.getNumberWithComma(Number(res.data.searchRegularShippingsDepositIzResList[0].spmtDsc), 0); // 판매할인조정금액(추가할인)
    // eslint-disable-next-line max-len
    frmMainData.value.mmBilPyAmt = stringUtil.getNumberWithComma(Number(res.data.searchRegularShippingsDepositIzResList[0].mmBilPyAmt), 0); // 월 청구(납입)금액
    frmMainData.value.svPrd = res.data.searchRegularShippingsDepositIzResList[0].svPrd; // 서비스주기(주기)
    // eslint-disable-next-line max-len
    frmMainData.value.dlqAmt = stringUtil.getNumberWithComma(Number(res.data.searchRegularShippingsDepositIzResList[0].dlqAmt), 0); // 당월발생연체금액(연체금액)
    // eslint-disable-next-line max-len
    frmMainData.value.ucAmt = stringUtil.getNumberWithComma(Number(res.data.searchRegularShippingsDepositIzResList[0].ucAmt), 0); // 당월미수잔액
    // eslint-disable-next-line max-len
    frmMainData.value.prpdAmt = stringUtil.getNumberWithComma(Number(res.data.searchRegularShippingsDepositIzResList[0].prpdAmt), 0); // 기말선수금(선수금액)
    // eslint-disable-next-line max-len
    frmMainData.value.bilUc = stringUtil.getNumberWithComma(Number(res.data.searchRegularShippingsDepositIzResList[0].bilUc), 0); // 기말미수금액(청구미수)
    // eslint-disable-next-line max-len
    frmMainData.value.pcsvSpmt = stringUtil.getNumberWithComma(Number(res.data.searchRegularShippingsDepositIzResList[0].pcsvSpmt), 0); // 택배추가
    frmMainData.value.prtnrKnm = res.data.searchRegularShippingsDepositIzResList[0].prtnrKnm; // 판매자성명
  } else {
    frmMainData.value.rentalMsh1Cost = '';
    frmMainData.value.rental1Ptrm = '';
    frmMainData.value.rentalMsh2Cost = '';
    frmMainData.value.rental2Ptrm = '';
    frmMainData.value.spmtSlAmt = '';
    frmMainData.value.spmtDscAmt = '';
    frmMainData.value.slDt = '';
    frmMainData.value.slAmt = '';
    frmMainData.value.prpdAmt = '';
    frmMainData.value.ucAmt = '';
    frmMainData.value.dlqAmt = '';
    frmMainData.value.slStpAmt = '';
    frmMainData.value.etMshAmt = '';

    frmMainData.value.sellAmt = '';
    frmMainData.value.mmIstmAmt = '';
    frmMainData.value.istmMcn = '';
    frmMainData.value.subscAmt = '';
    frmMainData.value.istmAmt = '';
    frmMainData.value.istmPcamAmt = '';
    frmMainData.value.ldLimUse = '';
    frmMainData.value.ldLimTam = '';
    frmMainData.value.ldLimBlam = '';

    frmMainData.value.sellTam = '';
    frmMainData.value.dscAmt = '';
    frmMainData.value.spmtDsc = '';
    frmMainData.value.mmBilPyAmt = '';
    frmMainData.value.svPrd = '';
    frmMainData.value.dlqAmt = '';
    frmMainData.value.ucAmt = '';
    frmMainData.value.prpdAmt = '';
    frmMainData.value.bilUc = '';
    frmMainData.value.pcsvSpmt = '';

    frmMainData.value.prtnrKnm = '';
  }
  // 여신한도조회
  const totalMisuAmt = ref(0); // 총미수금액
  const isMsgcr = ref(false); // 안마의자여부
  const maxRoanMisuAmt = ref('3000000'); // 여신한도총액

  if (!isEmpty(res.data.searchLendingLimitDepositIzResList)
   && res.data.searchLendingLimitDepositIzResList.length > 0) {
    res.data.searchLendingLimitDepositIzResList.forEach((obj) => {
      totalMisuAmt.value += isEmpty(Number(obj.ucAmt)) ? 0 : Number(obj.ucAmt);
      // 안마의자 체크
      if (['03003001001', '03003003'].includes(obj.refPdClsfVal)) {
        isMsgcr.value = true;
      }
      if (searchParams.value.cntrNo === obj.cntrNo && searchParams.value.cntrSn === obj.cntrSn) {
        frmMainData.value.ucAmt = obj.ucAmt;
      }
      if (['015010423', '008603459', '015014374', '010159754', '015058880', '014748771'].includes(obj.cntrCstNo)) {
        maxRoanMisuAmt.value += Number(3300000);
      }
      if (['015006891', '013779261', '014111286'].includes(obj.cntrCstNo)) {
        maxRoanMisuAmt.value += Number(6600000);
      }
    });
    // 안마의자 예외처리
    if (isMsgcr.value === true) {
      maxRoanMisuAmt.value += Number(4000000);
    }

    frmMainData.value.ldLimTam = stringUtil.getNumberWithComma(Number(maxRoanMisuAmt.value), 0); // 여신한도 총액
    frmMainData.value.ldLimUse = stringUtil.getNumberWithComma(Number(totalMisuAmt.value), 0); // 여신한도 사용
    // eslint-disable-next-line max-len
    frmMainData.value.ldLimBlam = stringUtil.getNumberWithComma(Number(maxRoanMisuAmt.value) - Number(totalMisuAmt.value), 0); // 여신한도 잔액
  }
}

// 계약번호, 계약일련번호 세팅 (부모창에서 호출)
async function setDatas(cntrNo, cntrSn, sellTpCd, cntrCstNo) {
  searchParams.value.cntrNo = cntrNo;
  searchParams.value.cntrSn = cntrSn;
  searchParams.value.sellTpCd = sellTpCd;
  searchParams.value.cntrCstNo = cntrCstNo;

  console.log(`cntrNo : ${cntrNo}`);
  console.log(`cntrSn : ${cntrSn}`);
  console.log(`sellTpCd : ${sellTpCd}`);
  console.log(`cntrCstNo : ${cntrCstNo}`);

  // 정기배송(판매유형코드: '6')일 경우 선납버튼 Visible false
  if (sellTpCd === '6') {
    isSearchPrepaymentVisible.value = false;
  } else {
    isSearchPrepaymentVisible.value = true;
  }

  await fetchData();
}

// 외부에서 사용할 수 있도록 노출 선언
defineExpose({
  setDatas,
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
<style scoped>
</style>
