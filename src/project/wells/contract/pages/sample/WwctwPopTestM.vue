<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTW
2. 프로그램 ID : WwctwPopTestM - 팝업 테스트
3. 작성자 : sc
4. 작성일 : 2023.02.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 팝업 테스트 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="result-area">
      <kw-list
        item-padding="4px 0"
      >
        <kw-expansion-item
          v-for="(pop, idx) in pops"
          :key="`expansion-${idx}`"
          group="test-item"
          :label="pop.title"
          header-class="text-bold kw-font-subtitle bg-bg-box px8"
          block-inherit-padding
        >
          <zctz-popup-test-item
            :popup="pop.pname"
            :params="pop.param"
          />
        </kw-expansion-item>
      </kw-list>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import ZctzPopupTestItem from '~sms-common/contract/components/ZctzPopupTestItem.vue';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const pops = [
  {
    pname: 'WwctaCapsuleSeedingChoiceP',
    title: '캡슐/모종 선택 팝업',
    param: {
      basePdCd: 'WP01160135',
      rglrSppMchnTpCd: '1',
      rglrSppPrcDvCd: '4',
    },
  },
  {
    pname: 'WwctaSeedingMachineChoiceP',
    title: '모종기기선택',
    param: {
      cntrCstNo: '040883641',
      rglrSppMchnTpCd: '1',
    },
  },
  {
    pname: 'WwctaContractNumberListP',
    title: '계약번호 조회(wells)',
    param: {
      cntrCstKnm: '김계약',
      lrnnCstKnm: '',
      cralLocaraTno: '',
      mexnoEncr: '',
      cralIdvTno: '',
      cntrCstNo: '',
      cntrNo: '',
      cntrSn: '',
    },
  },
  {
    pname: 'WwctaHomeCareMgtP',
    title: 'wells 홈케어 관리',
    param: {
      cntrs: [
        {
          cntrNo: 'W20225866263',
          cntrSn: 1,
        },
        {
          cntrNo: 'W20225964208',
          cntrSn: 1,
        },
      ],
    },
  },
  {
    pname: 'WwctaContractDocumentMailForwardingP',
    title: 'wells 계약서 메일 발송',
    param: {
      rcvrInfo: [{
        cntrNm: '김계약',
        cntrNo: 'E12345678901',
        cntrSn: '2',
        rstlYn: 'Y',
      }, {
        cntrNm: '김계약',
        cntrNo: 'E12345678902',
        cntrSn: '1',
        rstlYn: 'N',
      }],
    },
  },
  {
    pname: 'WwctaRestipulationTargetCstListP',
    title: '재약정 대상고객 조회 W-SS-U-0022P01',
    param: {
      cntrNo: '',
    },
  },
  {
    pname: 'WwctaBelongPartnerChoiceListP',
    title: '소속 파트너 선택 W-SS-U-0022P02',
    param: {
      dsmnPrtnrNo: '967179',
      ogTpCd: 'W01',
    },
  },
  {
    pname: 'WwctaOnePlusOneContractListP',
    title: '1+1 대상계약 조회 W-SS-U-0022P04',
    param: {
      cntrNo: '',
    },
  },
  {
    pname: 'WwctaCapsuleSeedingMgtP',
    title: '캡슐/모종 선택 팝업 W-SS-U-0022P05',
    param: {
      prdtType: 'S',
      prdtCnt: 12,
      prdtList: [{ prdtId: 'A', prdtNm: '비타민다채' }, { prdtId: 'B', prdtNm: '청경채' }],
    },
  },
  {
    pname: 'WwctaMachineChangeCustomerDtlP',
    title: '기기변경 고객조회 W-SS-U-0022P03',
    param: {
      baseCntrNo: 'W20230000701',
      baseCntrSn: '1',
      cstNo: '040166791',
      indvCrpDv: '1',
      pdCd: 'WP01200008',
      dscDv: '',
      dscTp: '',
      sellTpCd: '1',
      alncmpCd: '',
      rgstMdfcDv: '2',
    },
  },
  {
    pname: 'WwctaMshRstlOjCstListP',
    title: '재약정/멤버십 조회결과 팝업 W-SS-U-0022P01 ',
    param: {},
  },
  {
    pname: 'ZwctaTaxInvoiceBundleListP',
    title: '세금계산서 묶음 리스트 Z-SS-U-0009P01 ',
    param: {
      txinvId: '20220213059679',
    },
  },
  {
    pname: 'ZwctaDealingPartnerListP',
    title: '곧급받는자 조회 Z-SS-U-0009P02 ',
    param: {},
  },
  {
    pname: 'ZwctaTaxInvoiceApplicationDtlModP',
    title: '세금계산서 신청 상세 수정 Z-SS-U-0009P04 ',
    param: {
      txinvId: '20221229000125',
      dtlSn: '1',
    },
  },
  {
    pname: 'WwctaOrderDetailP',
    title: 'wells 주문 상세 조회 W-SS-U-0092P01 ',
    param: {
      cntrNo: 'W20155005919',
      cntrSn: '1',
    },
  },
  {
    pname: 'WwctaVirtualAccountDocumentMailForwardingP',
    title: '가상계좌 메일발송 W-SS-U-0092P17',
    param: {
      mailAddr: 'rhldwkdgo@naver.com', /* 메일주소 */
      vacBnkNm: '신한은행', /* 가상계좌은행명 */
      vacNo: '123-12-12345', /* 가상계좌번호 */
      vacGbn: 'S', /* 가상계좌구분. 셰틀뱅크(S),KICC(K) */
      custNm: '김고객', /* 고객명 */
    },
  },
  {
    pname: 'WwctbPartnerModP',
    title: '판매자 변경 W-SS-U-0101P02',
    param: {
      cntrNo: 'W20234900033',
      cntrSn: '1',
    },
  },
  {
    pname: 'WwctaVirtualAccountMessageForwardingP',
    title: '주문상세페이지 내부 팝업_가상계좌 메세지 보내기 W-SS-U-0092P15',
    param: {
      cntrNo: 'W20155005919',
      cntrSn: '1',
      cralTno: '01012345678',
      rcgvpTno: '01087654321',
    },
  },
  {
    pname: 'WwctbProductChangeHistoryP',
    title: '계약유형 변경이력 W-SS-U-0101P03',
    param: {
      cntrNo: '',
      cntrSn: '',
    },
  },
  {
    pname: 'WwctaRentalMultiCasePrchsDscChoP',
    title: '렌탈 다건구매 할인 W-SS-U-0022P06',
    param: {
      rentals: [{
        pdCd: 'pdCd0',
        pdNm: '홈카페[WN920ZBA] 0',
        fnlAmt: 66000,
      },
      {
        pdCd: 'pdCd1',
        pdNm: '홈카페[WN920ZBA] 1',
        fnlAmt: 66000,
      },
      {
        pdCd: 'pdCd2',
        pdNm: '홈카페[WN920ZBA] 2',
        fnlAmt: 66000,
      },
      {
        pdCd: 'pdCd3',
        pdNm: '홈카페[WN920ZBA] 3',
        fnlAmt: 66000,
      },
      {
        pdCd: 'pdCd4',
        pdNm: '홈카페[WN920ZBA] 4',
        fnlAmt: 66000,
      },
      {
        pdCd: 'pdCd5',
        pdNm: '홈카페[WN920ZBA] 5',
        fnlAmt: 66000,
      },
      ],
    },
  },
  {
    pname: 'WwctaContractStatusInstallationContractSppRegP',
    title: '계약현황관리 설치/배정리스트',
    param: {
      cntrNo: '',
    },
  },
];
</script>
