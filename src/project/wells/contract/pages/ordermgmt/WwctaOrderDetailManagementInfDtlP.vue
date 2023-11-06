<!-- window.open 너비 1292px이상 설정 요망 -->
<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaOrderDetailManagementInfDtlP - wells 주문 상세 조회(판매정보)
3. 작성자 : jihoon.kim
4. 작성일 : 2023.05.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0075] - 판매정보 조회 화면
****************************************************************************************************
--->
<template>
  <kw-action-top class="mt30">
    <!-- 위약금 예상 -->
    <kw-btn
      v-permission:read
      dense
      secondary
      :label="$t('MSG_BTN_CCAM_ET')"
      @click="onClickCcamEt"
    />
    <!-- 프로모션 -->
    <kw-btn
      v-permission:read
      dense
      secondary
      :label="$t('MSG_BTN_PMOT')"
      @click="onClickPmot"
    />
    <!-- 연관계약리스트 -->
    <kw-btn
      v-permission:read
      dense
      secondary
      :label="$t('MSG_BTN_RLTD_CNTR_LIST')"
      @click="onClickRltdCntrList"
    />
  </kw-action-top>
  <kw-form
    :cols="2"
    dense
    class="mt20"
  >
    <kw-form-row>
      <!-- 계약일 -->
      <kw-form-item
        :label="$t('MSG_TXT_CNTRCT_DT')"
      >
        <p>{{ stringUtil.getDateFormat(frmMainData.cntrDt) }}</p>
      </kw-form-item>
      <!-- 상품명 -->
      <kw-form-item
        :label="$t('MSG_TXT_PRDT_NM')"
      >
        <p>{{ frmMainData.pdNm }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <!-- 설치일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_IST_DT')"
      >
        <p>{{ stringUtil.getDateFormat(frmMainData.istDt) }}</p>
      </kw-form-item>
      <!-- 판매유형 -->
      <kw-form-item
        :label="$t('MSG_TXT_SEL_TYPE')"
      >
        <p>{{ frmMainData.sellTpNm }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <!-- 할인구분 -->
      <kw-form-item
        :label="$t('MSG_TXT_PD_DC_CLASS')"
      >
        <p>{{ frmMainData.dscDvNm }}</p>
      </kw-form-item>
      <!-- 할인유형 -->
      <kw-form-item
        :label="$t('MSG_TXT_DISC_CODE')"
      >
        <p>{{ frmMainData.sellDscrNm }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <!-- 약정기간 -->
      <kw-form-item
        :label="$t('MSG_TXT_CONTRACT_PERI')"
      >
        <p>{{ frmMainData.stplPtrm }}</p>
      </kw-form-item>
      <!-- 주기/용도 -->
      <kw-form-item
        :label="$t('MSG_TXT_PRD_USWY')"
      >
        <p>{{ frmMainData.prd+'/'+frmMainData.uswy }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <!-- 무상A/S -->
      <kw-form-item
        :label="$t('MSG_TXT_FRISU_AS')"
      >
        <p>{{ frmMainData.frisuAS }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <!-- 소속코드 -->
      <kw-form-item
        :label="$t('MSG_TXT_BLG_CD')"
      >
        <p>{{ frmMainData.sellPrtnrBlgCd+'('+frmMainData.sellPrtnrBlgNm+')' }}</p>
      </kw-form-item>
      <!-- 성명 -->
      <kw-form-item
        :label="$t('MSG_TXT_EMPL_NM')"
      >
        <p>{{ frmMainData.sellPrtnrNm+'('+frmMainData.sellPrtnrNo+')' }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <!-- 기변일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_MCHN_DT')"
      >
        <p>{{ stringUtil.getDateFormat(frmMainData.chdvcDt) }}</p>
      </kw-form-item>
      <!-- 상대코드 -->
      <kw-form-item
        :label="$t('MSG_TXT_PTY_CD')"
      >
        <p>{{ frmMainData.ptyCd }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <!-- 제휴상대코드 -->
      <kw-form-item
        :label="$t('MSG_TXT_ALNC_PTY_CD')"
      >
        <p>{{ frmMainData.alncPtyCd }}</p>
      </kw-form-item>
      <!-- 기타사항 -->
      <kw-form-item
        :label="$t('MSG_TXT_MISC')"
      >
        <p>{{ frmMainData.etcArtc }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <!-- 교체일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_CHNG_DT')"
      >
        <p>{{ stringUtil.getDateFormat(frmMainData.chngDt) }}</p>
      </kw-form-item>
      <!-- 철거일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_DEM_DT')"
      >
        <p>{{ stringUtil.getDateFormat(frmMainData.reqdDt) }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <!-- 취소일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_CANC_DT')"
      >
        <p>{{ stringUtil.getDateFormat(frmMainData.canDt) }}</p>
      </kw-form-item>
      <!-- 중지일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_STP_DT')"
      >
        <p>{{ stringUtil.getDateFormat(frmMainData.svStpDt) }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <!-- 멤버십 가입 -->
      <kw-form-item
        :label="$t('MSG_TXT_MSH_SUBS')"
      >
        <p>{{ stringUtil.getDateFormat(frmMainData.mshJoinDt) }}</p>
      </kw-form-item>
      <!-- 멤버십 탈퇴 -->
      <kw-form-item
        :label="$t('MSG_TXT_MSH_WTD')"
      >
        <p>{{ stringUtil.getDateFormat(frmMainData.mshWdwalDt) }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <!-- 담당 웰스매니저 -->
      <kw-form-item
        :label="$t('MSG_TXT_PSIC_WELLS_MANAGER')"
      >
        <p>{{ frmMainData.ichrWelsMngerNm }}</p>
      </kw-form-item>
      <!-- 설치방법 -->
      <kw-form-item
        :label="$t('MSG_TXT_INST_MTHD')"
      >
        <p>{{ frmMainData.istMthNm }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <!-- 의무약정개월 -->
      <kw-form-item
        :label="$t('MSG_TXT_DUTY_STPL_MCNT')"
      >
        <p>{{ frmMainData.dutyStplMcnt }}</p>
      </kw-form-item>
      <!-- 등록비용(원) -->
      <kw-form-item
        :label="$t('MSG_TXT_REG_FEE')"
      >
        <p>{{ frmMainData.rgstCs+$t('MSG_TXT_CUR_WON') }}</p>
      </kw-form-item>
    </kw-form-row>
    <kw-form-row>
      <!-- 렌탈총액(원) -->
      <kw-form-item
        :label="$t('MSG_TXT_RNTL_TOTAL')"
      >
        <p>{{ frmMainData.rentalTam+$t('MSG_TXT_CUR_WON') }}</p>
      </kw-form-item>
      <!-- 인정실적(원) -->
      <kw-form-item
        :label="$t('MSG_TXT_PD_ACC_RSLT')"
      >
        <p>{{ frmMainData.ackmtPerfAmt+$t('MSG_TXT_CUR_WON') }}</p>
      </kw-form-item>
    </kw-form-row>
  </kw-form>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, stringUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
// const { t } = useI18n();
const { modal } = useGlobal();
const props = defineProps({
  cntrNo: { type: String, required: true, default: '' },
  cntrSn: { type: String, required: true, default: '' },
  sellTpCd: { type: String, required: true, default: '' },
});
const isVacInfo = ref();

let cachedParams;
const searchParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  sellTpCd: props.sellTpCd,
});

const frmMainData = ref({
  cntrDt: '', // 계약일
  pdNm: '', // 상품명
  pdCd: '', // 상품코드
  pdQty: '', // 상품수량
  istDt: '', // 설치일자
  sellTpNm: '', // 계약구분명(판매유형코드명)
  dscDvNm: '', // 할인구분(판매할인구분코드)
  dscTpNm: '', // 할인유형명
  stplPtrm: '', // 약정기간
  prd: '', // 주기
  uswy: '', // 용도(용도구분)
  frisuAs: '', // 무상A/S
  sellPrtnrBlgCd: '', // 판매자소속코드
  sellPrtnrBlgNm: '', // 판매자소속명
  sellPrtnrBlgBrmgrNm: '', // 판매자소속지점장명
  sellPrtnrNm: '', // 판매자성명
  sellPrtnrNo: '', // 판매파트너번호
  chdvcDt: '', // 기변일자
  ptyCd: '', // 상태코드
  alncPtyCd: '', // 제휴상태코드
  etcArtc: '', // 기타사항
  chngDt: '', // 교체일자
  reqdDt: '', // 철거일자
  canDt: '', // 취소일자
  svStpDt: '', // 서비스중지일자
  mshJoinDt: '', // 멤버십가입
  mshWdwalDt: '', // 멤버십탈퇴
  ichrWelsMngerNm: '', // 담당웰스매니저명
  istMthCd: '', // 설치방법코드
  istMthNm: '', // 설치방법명
  dutyStplMcnt: '', // 의무약정개월
  rgstCs: '', // 등록비용
  rentalTam: '', // 렌탈총액
  ackmtPerfAmt: '', // 인정실적금액
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// 위약금예상 팝업 호출
async function onClickCcamEt() {
  // await alert('위약금예상 팝업은 개발예정입니다.');
  const searchPopupParams = {
    cntrNo: searchParams.value.cntrNo,
    cntrSn: searchParams.value.cntrSn,
  };

  await modal({
    component: 'WwctaEstimateCcamDtlP', // 위약금예상 조회
    componentProps: searchPopupParams,
    draggable: true,
    window: true,
    windowFeatures: { width: 1300, height: 1080 },
  });
}

// 프로모션 팝업 호출
async function onClickPmot() {
  // await alert('프로모션 팝업은 개발예정입니다.');
  const searchPopupParams = {
    cntrNo: searchParams.value.cntrNo,
    cntrSn: searchParams.value.cntrSn,
  };

  await modal({
    component: 'WwctaOrderDetailMngtInfPmotListP', // 프로모션
    componentProps: searchPopupParams,
  });
}

// 연관계약리스트 팝업 호출
async function onClickRltdCntrList() {
  const searchPopupParams = {
    cntrNo: searchParams.value.cntrNo,
    cntrSn: searchParams.value.cntrSn,
  };

  await modal({
    component: 'WwctaRelatedContractListP', // 연관계약리스트 팝업
    componentProps: searchPopupParams,
  });
}

// wells 주문 상세(판매내역)
async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/contracts/order-details/management-information', { params: cachedParams });
  console.log(res.data);

  isVacInfo.value = false;
  if (res.data.length > 0) {
    frmMainData.value.cntrDt = res.data[0].cntrDt; // 계약일
    frmMainData.value.pdNm = res.data[0].pdNm; // 상품명
    frmMainData.value.pdCd = res.data[0].pdCd; // 상품코드
    frmMainData.value.istDt = res.data[0].istDt; // 설치일자
    frmMainData.value.sellTpNm = res.data[0].sellTpNm; // 계약구분명(판매유형코드명)
    frmMainData.value.dscDvNm = res.data[0].dscDvNm; // 할인구분(판매할인구분코드)
    frmMainData.value.dscTpNm = res.data[0].dscTpNm; // 할인유형명
    frmMainData.value.stplPtrm = res.data[0].stplPtrm; // 약정기간
    frmMainData.value.prd = res.data[0].prd; // 주기
    frmMainData.value.uswy = res.data[0].uswy; // 용도(용도구분)
    frmMainData.value.frisuAS = res.data[0].frisuAS; // 무상A/S
    frmMainData.value.sellPrtnrBlgCd = res.data[0].sellPrtnrBlgCd; // 판매자소속코드
    frmMainData.value.sellPrtnrBlgNm = res.data[0].sellPrtnrBlgNm; // 판매자소속명
    frmMainData.value.sellPrtnrBlgBrmgrNm = res.data[0].sellPrtnrBlgBrmgrNm; // 판매자소속지점장명
    frmMainData.value.sellPrtnrNm = res.data[0].sellPrtnrNm; // 판매자성명
    frmMainData.value.sellPrtnrNo = res.data[0].sellPrtnrNo; // 판매파트너번호
    frmMainData.value.chdvcDt = res.data[0].chdvcDt; // 기변일자
    frmMainData.value.ptyCd = res.data[0].ptyCd; // 상태코드
    frmMainData.value.alncPtyCd = res.data[0].alncPtyCd; // 제휴상태코드
    frmMainData.value.etcArtc = res.data[0].etcArtc; // 기타사항
    frmMainData.value.chngDt = res.data[0].chngDt; // 교체일자
    frmMainData.value.reqdDt = res.data[0].reqdDt; // 철거일자
    frmMainData.value.canDt = res.data[0].canDt; // 취소일자
    frmMainData.value.svStpDt = res.data[0].svStpDt; // 중지일자
    frmMainData.value.mshJoinDt = res.data[0].mshJoinDt; // 멤버십가입
    frmMainData.value.mshWdwalDt = res.data[0].mshWdwalDt; // 멤버십탈퇴
    frmMainData.value.ichrWelsMngerNm = res.data[0].ichrWelsMngerNm; // 담당웰스매니저명
    frmMainData.value.istMthCd = res.data[0].istMthCd; // 설치방법코드
    frmMainData.value.istMthNm = res.data[0].istMthNm; // 설치방법명
    frmMainData.value.dutyStplMcnt = res.data[0].dutyStplMcnt; // 의무약정개월
    frmMainData.value.rgstCs = stringUtil.getNumberWithComma(Number(res.data[0].rgstCs), 0); // 등록비용
    frmMainData.value.rentalTam = stringUtil.getNumberWithComma(Number(res.data[0].rentalTam), 0); // 렌탈총액
    frmMainData.value.ackmtPerfAmt = stringUtil.getNumberWithComma(Number(res.data[0].ackmtPerfAmt), 0); // 인정실적금액
  } else {
    frmMainData.value.cntrDt = ''; // 계약일
    frmMainData.value.pdNm = ''; // 상품명
    frmMainData.value.pdCd = ''; // 상품코드
    frmMainData.value.istDt = ''; // 설치일자
    frmMainData.value.sellTpNm = ''; // 계약구분명(판매유형코드명)
    frmMainData.value.dscDvNm = ''; // 할인구분(판매할인구분코드)
    frmMainData.value.dscTpNm = ''; // 할인유형명
    frmMainData.value.stplPtrm = ''; // 약정기간
    frmMainData.value.prd = ''; // 주기
    frmMainData.value.uswy = ''; // 용도(용도구분)
    frmMainData.value.frisuAS = ''; // 무상A/S
    frmMainData.value.sellPrtnrBlgCd = ''; // 판매자소속코드
    frmMainData.value.sellPrtnrBlgNm = ''; // 판매자소속명
    frmMainData.value.sellPrtnrBlgBrmgrNm = ''; // 판매자소속지점장명
    frmMainData.value.sellPrtnrNm = ''; // 판매자성명
    frmMainData.value.sellPrtnrNo = ''; // 판매파트너번호
    frmMainData.value.chdvcDt = ''; // 기변일자
    frmMainData.value.ptyCd = ''; // 상태코드
    frmMainData.value.alncPtyCd = ''; // 제휴상태코드
    frmMainData.value.etcArtc = ''; // 기타사항
    frmMainData.value.chngDt = ''; // 교체일자
    frmMainData.value.reqdDt = ''; // 철거일자
    frmMainData.value.canDt = ''; // 취소일자
    frmMainData.value.svStpDt = ''; // 중지일자
    frmMainData.value.mshJoinDt = ''; // 멤버십가입
    frmMainData.value.mshWdwalDt = ''; // 멤버십탈퇴
    frmMainData.value.ichrWelsMngerNm = ''; // 담당웰스매니저명
    frmMainData.value.istMthCd = ''; // 설치방법코드
    frmMainData.value.istMthNm = ''; // 설치방법명
    frmMainData.value.dutyStplMcnt = ''; // 의무약정개월
    frmMainData.value.rgstCs = ''; // 등록비용
    frmMainData.value.rentalTam = ''; // 렌탈총액
    frmMainData.value.ackmtPerfAmt = ''; // 인정실적금액
  }
}

// 계약번호, 계약일련번호 세팅 (부모창에서 호출)
async function setDatas(cntrNo, cntrSn, sellTpCd) {
  searchParams.value.cntrNo = cntrNo;
  searchParams.value.cntrSn = cntrSn;
  searchParams.value.sellTpCd = sellTpCd;
  console.log(`cntrNo : ${cntrNo}`);
  console.log(`cntrSn : ${cntrSn}`);
  console.log(`sellTpCd : ${sellTpCd}`);

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
