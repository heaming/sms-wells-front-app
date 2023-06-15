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
      cntrNm: 'TEST',
      cntrNo: 'E12345678900',
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
];
</script>
