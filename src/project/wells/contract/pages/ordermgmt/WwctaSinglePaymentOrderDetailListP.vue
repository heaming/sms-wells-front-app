<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaSinglePaymentOrderDetailListP -주문상세조회/관리(일시불-상세)
3. 작성자 : jihoon.kim
4. 작성일 : 2023.04.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 일시불 주문정보 상세 팝업 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="4xl"
    ignore-on-modified
    no-action
  >
    <!-- 주문정보 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_ODER_INF') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 계약상세번호 -->
        <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <kw-input
            v-model="frmMainData.cntrDtlNo"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 주문구분 -->
        <kw-form-item :label="$t('MSG_TXT_ORD_DV')">
          <kw-input
            v-model="frmMainData.ordDv"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 고객구분 -->
        <kw-form-item :label="$t('MSG_TXT_CST_DV')">
          <kw-input
            v-model="frmMainData.copnDvNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 등급정보 -->
        <kw-form-item :label="$t('MSG_TXT_GRD_INF')">
          <kw-input
            v-model="frmMainData.cstGdNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 고객번호 -->
        <kw-form-item :label="$t('MSG_TXT_CST_NO')">
          <kw-input
            v-model="frmMainData.cntrCstNo"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 지점 -->
        <kw-form-item :label="$t('MSG_TXT_BRANCH')">
          <kw-input
            v-model="frmMainData.dgr3LevlDgPrtnrNo"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 조직구분 -->
        <kw-form-item :label="$t('MSG_TXT_OG_DV')">
          <kw-input
            v-model="frmMainData.ogTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 조직코드 -->
        <kw-form-item :label="$t('MSG_TXT_OG_CD')">
          <kw-input
            v-model="frmMainData.ogCd"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 파트너 유형 -->
        <kw-form-item :label="$t('MSG_TXT_PRTNR_TP')">
          <kw-input
            v-model="frmMainData.sellInflwChnlDtlCd"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 파트너 사번 -->
        <kw-form-item :label="$t('MSG_TXT_PRTNR_EMP_NO')">
          <!-- 파트너 번호 -->
          <kw-input
            v-model="frmMainData.sellPrtnrNo"
            placeholder=""
            readonly
          />
          <!-- 파트너 이름 -->
          <kw-input
            v-model="frmMainData.prtnrKnm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 접수일 -->
        <kw-form-item :label="$t('MSG_TXT_RCP_D')">
          <kw-input
            v-model="frmMainData.cntrRcpFshDtm"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 등록일 -->
        <kw-form-item :label="$t('MSG_TXT_RGST_DT')">
          <kw-input
            v-model="frmMainData.fstRgstDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 계약자 정보 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_CNTRT_INF') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 계약자명 -->
        <kw-form-item :label="$t('MSG_TXT_CNTOR_NM')">
          <kw-input
            v-model="frmMainData.cstKnm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 계약자사업/주민번호 -->
        <kw-form-item :label="$t('MSG_TXT_CNTRT_BZ_RRNO')">
          <kw-input
            v-model="frmMainData.rnmno"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 계약자 휴대전화번호 -->
        <kw-form-item :label="$t('MSG_TXT_CNTRR_VAC_PH_NO')">
          <kw-input
            v-model="frmMainData.cntrCralTno"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 계약자 우편번호 -->
        <kw-form-item :label="$t('MSG_TXT_CNTRT_ZIP')">
          <kw-input
            v-model="frmMainData.newAdrZip"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 계약자 주소 -->
        <kw-form-item
          :label="$t('MSG_TXT_CNTRT_ADDR')"
          :colspan="3"
        >
          <!-- 계약자 주소(기준주소) -->
          <kw-input
            v-model="frmMainData.rnadr"
            placeholder=""
            readonly
          />
          <!-- 계약자 주소(상세주소) -->
          <kw-input
            v-model="frmMainData.rdadr"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 설치처 정보 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_ISTLC_INF') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 설치자 명 -->
        <kw-form-item :label="$t('MSG_TXT_IST_NM')">
          <kw-input
            v-model="frmMainData.rcgvpKnm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 설치처 휴대전화번호 -->
        <kw-form-item :label="$t('MSG_TXT_ISTLC_MPNO')">
          <kw-input
            v-model="frmMainData.istCralTno"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 설치처 우편번호 -->
        <kw-form-item :label="$t('MSG_TXT_ISTLC_ZIP')">
          <kw-input
            v-model="frmMainData.istlcAdrZip"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 설치처 주소 -->
        <kw-form-item
          :label="$t('MSG_TXT_ISTLC_ADDR')"
          :colspan="3"
        >
          <!-- 설치처 주소(기준주소) -->
          <kw-input
            v-model="frmMainData.istlcAdr"
            placeholder=""
            readonly
          />
          <!-- 설치처 주소(상세주소) -->
          <kw-input
            v-model="frmMainData.istlcDadr"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 상품정보 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_PD_INF') }}
    </h3>
    <kw-action-top class="mb20">
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @change="fetchData"
        />
      </template>
      <span class="kw-fc--black3 text-weight-regular"> (단위:원)</span>
    </kw-action-top>
    <kw-grid
      ref="grdCompositionProducts"
      name="grdCompositionProducts"
      :visible-rows="pageInfo.totalCount"
      @init="initGridCompositionProducts"
    />
    <kw-separator />
    <kw-grid
      ref="grdFreeGiftInformation"
      name="grdFreeGiftInformation"
      :visible-rows="pageInfo.totalCount"
      style="width: 100%;"
      @init="initGridFreeGiftInformation"
    />
    <table class="kw-table--normal mt30">
      <colgroup>
        <col style="width: 25%;">
        <col style="width: 25%;">
        <col style="width: 25%;">
        <col style="width: 25%;">
        <col style="width: 25%;">
      </colgroup>
      <tbody>
        <tr>
          <!-- 총합 -->
          <th rowspan="2">
            {{ $t('MSG_TXT_TOTAL_SUM') }}
          </th>
          <!-- 수량 -->
          <th>{{ $t('MSG_TXT_QTY') }}</th>
          <!-- 단가 -->
          <th>{{ $t('MSG_TXT_UPRC') }}</th>
          <!-- 할인 -->
          <th>{{ $t('MSG_TXT_DSC') }}</th>
        </tr>
        <tr>
          <td class="text-right">
            {{ frmMainData.pdQty }}
          </td>
          <td class="text-right">
            {{ frmMainData.fnlVal }}
          </td>
          <td class="text-right">
            {{ frmMainData.ctrVal }}
          </td>
        </tr>
      </tbody>
    </table>
    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <!-- 금액정보 -->
        <h3 class="mb20">
          {{ $t('MSG_TXT_AMT_INF') }}
        </h3>
      </template>
      <span>(단위: 원, 개월)</span>
    </kw-action-top>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 할인구분 -->
        <kw-form-item :label="$t('MSG_TXT_PD_DC_CLASS')">
          <!-- 할인구분코드 -->
          <kw-input
            v-model="frmMainData.sellDscDvCd"
            placeholder=""
            readonly
          />
          <!-- 할인구분코드명-->
          <kw-input
            v-model="frmMainData.sellDscDvNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 할인유형 -->
        <kw-form-item :label="$t('MSG_TXT_DISC_CODE')">
          <!-- 할인유형코드-->
          <kw-input
            v-model="frmMainData.sellDscTpCd"
            placeholder=""
            readonly
          />
          <!-- 할인유형코드명-->
          <kw-input
            v-model="frmMainData.sellDscTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 관리주기-->
        <kw-form-item :label="$t('MSG_TXT_MNGT_PRD')">
          <kw-input
            v-model="frmMainData.svPrd"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 용도구분 -->
        <kw-form-item :label="$t('MSG_TXT_USWY_DV')">
          <kw-input
            v-model="frmMainData.svTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 제휴업체 -->
        <kw-form-item
          :label="$t('MSG_TXT_ALNC_BZS')"
          :colspan="2"
        >
          <!-- 제휴업체코드 -->
          <kw-input
            v-model="frmMainData.alncmpCd"
            :placeholder="$t('MSG_TXT_ALNC_CD')"
            readonly
          />
          <!-- 제휴업체코드명 -->
          <kw-input
            v-model="frmMainData.alncmpNm"
            :placeholder="$t('MSG_TXT_ALNC_CD_NM')"
            readonly
          />
        </kw-form-item>
        <!-- 행사코드 -->
        <kw-form-item
          :label="$t('MSG_TXT_EV_CD')"
          :colspan="2"
        >
          <!-- 행사코드 -->
          <kw-input
            v-model="frmMainData.sellEvCd"
            :placeholder="$t('MSG_TXT_EV_CD')"
            readonly
          />
          <!-- 행사코드명 -->
          <kw-input
            v-model="frmMainData.sellEvNm"
            :placeholder="$t('MSG_TXT_EV_CD_NM')"
            readonly
          />
        </kw-form-item>
        <!-- 패키지주문 -->
        <kw-form-item :label="$t('MSG_TXT_PKG_ORD_NO')">
          <kw-input
            v-model="frmMainData.pkgOrdNo"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 프로모션구분 -->
        <kw-form-item :label="$t('MSG_TXT_PMOT_DV')">
          <kw-input
            v-model="frmMainData.pmotTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 판매금액 -->
        <kw-form-item :label="$t('MSG_TXT_SLE_PRC')">
          <kw-input
            v-model="frmMainData.fnlAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 부가세 -->
        <kw-form-item :label="$t('MSG_TXT_VAT')">
          <kw-input
            v-model="frmMainData.vat"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 공급가액 -->
        <kw-form-item :label="$t('MSG_TXT_SUPPLY_AMOUNT')">
          <kw-input
            v-model="frmMainData.sellAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 수수료액 -->
        <kw-form-item :label="$t('MSG_TXT_FEE_AMT')">
          <kw-input
            v-model="frmMainData.istmIntAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 계약총액 -->
        <kw-form-item :label="$t('MSG_TXT_CNTRCT_AMT')">
          <kw-input
            v-model="frmMainData.fnlAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 청약금 -->
        <kw-form-item :label="$t('MSG_TXT_SBSCM')">
          <kw-input
            v-model="frmMainData.cntrAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 인수금 -->
        <kw-form-item :label="$t('MSG_TXT_TK_AMT')">
          <kw-input
            v-model="frmMainData.tkAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 법인미수금액 -->
        <kw-form-item :label="$t('MSG_TXT_CRP_UC_AMT')">
          <kw-input
            v-model="frmMainData.crpUcAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 제휴수수료 -->
        <kw-form-item :label="$t('MSG_TXT_ALNC_FEE')">
          <kw-input
            v-model="frmMainData.alncFee"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 현금잔액 -->
        <kw-form-item :label="$t('MSG_TXT_CSH_BLAM')">
          <kw-input
            v-model="frmMainData.lcjAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 할부 -->
        <kw-form-item :label="$t('MSG_TXT_ISTM')">
          <kw-input
            v-model="frmMainData.istmMcn"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 할부금액 -->
        <kw-form-item :label="$t('MSG_TXT_ISTM_AMT')">
          <kw-input
            v-model="frmMainData.mmIstmAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 인정 실적액 -->
        <kw-form-item :label="$t('MSG_TXT_PD_ACC_RSLT_AMT')">
          <kw-input
            v-model="frmMainData.ackmtPerfAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 인정건수 -->
        <kw-form-item :label="$t('MSG_TXT_PD_ACC_CNT')">
          <kw-input
            v-model="frmMainData.ackmtPerfCt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 수수료 기준금액 -->
        <kw-form-item :label="$t('MSG_TXT_FEE_ACKMT_BASE_AMT')">
          <kw-input
            v-model="frmMainData.feeAckmtBaseAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 정액여부 -->
        <kw-form-item :label="$t('MSG_TXT_FXAM_YN')">
          <kw-input
            v-model="frmMainData.feeFxamYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 할부이체 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_ISTM_FNT') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 이체구분 -->
        <kw-form-item :label="$t('MSG_TXT_FNT_DV')">
          <kw-input
            v-model="frmMainData.dpTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 항목구분 -->
        <kw-form-item :label="$t('MSG_TXT_ATC_DV')">
          <kw-input
            v-model="frmMainData.bnkCocdNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 계좌/카드번호 -->
        <kw-form-item :label="$t('MSG_TXT_AC_CDNO')">
          <kw-input
            v-model="frmMainData.acnoCrcdnoEncr"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 이체일_계약자명 -->
        <kw-form-item :label="$t('MSG_TXT_FTD_CNTOR_NM')">
          <kw-input
            v-model="frmMainData.mpyBsdtOwrKnm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 멤버십 정보 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_MSH_INF') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 무상멤버십 -->
        <kw-form-item :label="$t('MSG_TXT_FRISU_MSH')">
          <kw-input
            v-model="frmMainData.frisuBfsvcPtrmN"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 무상 A/S -->
        <kw-form-item :label="$t('MSG_TXT_FRISU_AS')">
          <kw-input
            v-model="frmMainData.frisuAsPtrmN"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 유상멤버십 여부 -->
        <kw-form-item :label="$t('MSG_TXT_RECAP_MSH_YN')">
          <kw-input
            v-model="frmMainData.recapDutyYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 멤버십 이체 -->
        <kw-form-item :label="$t('MSG_TXT_MEMBRSHP_TRSFR')">
          <kw-input
            v-model="frmMainData.mshFntDv"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 처리일 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_PROCS_DT') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 접수일 -->
        <kw-form-item :label="$t('MSG_TXT_RCP_D')">
          <kw-input
            v-model="frmMainData.cntrRcpFshDtm"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 의뢰일 -->
        <kw-form-item :label="$t('MSG_TXT_REQ_DT')">
          <kw-input
            v-model="frmMainData.vstRqdt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 예정일 -->
        <kw-form-item :label="$t('MSG_TXT_DUEDT')">
          <kw-input
            v-model="frmMainData.sppDuedt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 설치일 -->
        <kw-form-item :label="$t('MSG_TXT_INST_DT')">
          <kw-input
            v-model="frmMainData.istDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 취소일 -->
        <kw-form-item :label="$t('MSG_TXT_CAN_D')">
          <kw-input
            v-model="frmMainData.canDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 보상일 -->
        <kw-form-item :label="$t('MSG_TXT_COMP_D')">
          <kw-input
            v-model="frmMainData.cpsDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 기타정보 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_ETC_INF') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 예약여부 -->
        <kw-form-item :label="$t('MSG_TXT_RSV_YN')">
          <kw-input
            v-model="frmMainData.booSellYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 무상멤버십 고객여부 -->
        <kw-form-item :label="$t('MSG_TXT_FRISU_MSH')+' '+$t('MSG_TXT_CST_YN')">
          <kw-input
            v-model="frmMainData.frisuMshCrtYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 무료체험여부 -->
        <kw-form-item :label="$t('MSG_TXT_FRE_EXPN_YN')">
          <kw-input
            v-model="frmMainData.frisuYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 무료체험일 -->
        <kw-form-item :label="$t('MSG_TXT_FRE_EXPN_DT')">
          <kw-input
            v-model="frmMainData.freExpnCnfmDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 기기변경 -->
        <kw-form-item :label="$t('MSG_TXT_MCHN_CH')">
          <kw-input
            v-model="frmMainData.chkChdvcRernt"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 의뢰구분 -->
        <kw-form-item :label="$t('MSG_TXT_REQ_DV')">
          <kw-input
            v-model="frmMainData.sppMthdTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 컨택코드 -->
        <kw-form-item :label="$t('MSG_TXT_CTT_CD')">
          <kw-input
            v-model="frmMainData.cttTpCd"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 상변유형 -->
        <kw-form-item :label="$t('MSG_TXT_STAT_CH_TP')">
          <kw-input
            v-model="frmMainData.pdChTp"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 특약정보 -->
        <kw-form-item :label="$t('MSG_TXT_SPEC_CNTR_INF')">
          <kw-input
            v-model="frmMainData.sconCn"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 세금계산서발행 여부 -->
        <kw-form-item :label="$t('MSG_TXT_TXINV_PBL_YN')">
          <kw-input
            v-model="frmMainData.txinvPblOjYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 현금영수증 -->
        <kw-form-item :label="$t('MSG_TXT_CASH_RCP')">
          <kw-input
            v-model="frmMainData.cssrIsNo"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 매변유형 -->
        <kw-form-item :label="$t('MSG_TXT_SL_CH_TP')">
          <kw-input
            v-model="frmMainData.slChTp"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 택배송장출력일 -->
        <kw-form-item :label="$t('MSG_TXT_PCSV_IVC_PRNT_DT')">
          <kw-input
            v-model="frmMainData.sppIvcCrtDt"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 사은품송장 출력여부 -->
        <kw-form-item :label="$t('MSG_TXT_FGPT_IVC_PRNT_YN')">
          <kw-input
            v-model="frmMainData.sppIvcCrtYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 우선이관 -->
        <kw-form-item :label="$t('MSG_TXT_PROT_TF')">
          <kw-input
            v-model="frmMainData.urgtOjYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 운송장 번호 -->
        <kw-form-item :label="$t('MSG_TXT_WAYBILL_NO')">
          <kw-input
            v-model="frmMainData.sppIvcNo"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
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
import { defineGrid, getComponentType, useDataService, useGlobal, useModal, codeUtil, stringUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { alert } = useGlobal();
const { cancel } = useModal();
const props = defineProps({
  cntrNo: { type: String, required: true, default: '' },
  cntrSn: { type: String, required: false, default: '' },
});

let cachedParams;
const searchParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  // 환경변수에서 기본설정값 받아오는 코드 현재 CFG_CMZ_DEFAULT_PAGE_SIZE 기본값:10
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

const frmMainData = ref({
  cntrDtlNo: '', // 계약상세번호
  ordDv: '', // 주문구분
  copnDvNm: '', // 고객구분
  cstGdNm: '', // 등급정보
  cntrCstNo: '', // 고객번호
  dgr3LevlDgPrtnrNo: '', // 지점
  ogTpNm: '', // 조직구분
  ogCd: '', // 조직코드
  sellInflwChnlDtlCd: '', // 파트너 유형
  sellPrtnrNo: '', // 파트너-번호
  prtnrKnm: '', // 파트너-이름
  cntrRcpFshDtm: '', // 접수일
  fstRgstDt: '', // 등록일
  cstKnm: '', // 계약자 명
  rnmno: '', // 계약자사업/주민번호
  cntrCralTno: '', // 계약자 휴대전화번호
  cralLocaraTno: '', // 계약자 휴대지역전화번호
  mexnoEncr: '', // 계약자 휴대전화국번호암호화
  cralIdvTno: '', // 계약자 휴대개별전화번호
  adrZip: '', // 계약자 우편번호
  cntrCstRnadr: '', // 계약자 주소(기준주소)
  cntrCstRdadr: '', // 계약자 주소(상세주소)
  rcgvpKnm: '', // 설치정보-설치자명
  istCralTno: '', // 설치자 휴대전화번호
  istCralLocaraTno: '', // 설치자 휴대지역전화번호
  istMexnoEncr: '', // 설치자 휴대전화국번호암호화
  istCralIdvTno: '', // 설치자 휴대개별전화번호
  istAdrZip: '', // 설치처 우편번호
  istRnadr: '', // 설치자 주소(기준주소)
  istRdadr: '', // 설치자 주소(상세주소)
  pdQty: '', // 수량
  fnlVal: '', // 단가
  ctrVal: '', // 할인
  sellDscDvCd: '', // 할인구분코드
  sellDscDvNm: '', // 할인구분코드명
  sellDscTpCd: '', // 할인유형코드
  sellDscTpNm: '', // 할인유형코드명
  svPrd: '', // 관리주기
  svTpNm: '', // 용도구분
  alncmpCd: '', // 제휴업체코드
  alncmpNm: '', // 제휴업체코드명
  sellEvCd: '', // 행사코드
  sellEvNm: '', // 행사코드명
  pkgOrdNo: '', // 패키지주문
  pmotTpNm: '', // 프로모션구분
  fnlAmt: '', // 계약총액
  cntrAmt: '', // 청약금
  tkAmt: '', // 인수금
  crpUcAmt: '', // 법인미수금액
  // crpUcAmt: '', // 판매가격
  vat: '', // 부가세
  sellAmt: '', // 공급가액
  istmIntAmt: '', // 수수료액
  alncFee: '', // 제휴수수료
  lcjAmt: '', // 현금잔액
  istmMcn: '', // 할부
  mmIstmAmt: '', // 할부금액
  ackmtPerfAmt: '', // 인정실적액
  ackmtPerfCt: '', // 인정건수
  feeAckmtBaseAmt: '', // 수수료 기준금액
  feeFxamYn: '', // 정액여부
  dpTpNm: '', // 이체구분
  bnkCocdNm: '', // 항목구분
  acnoCrcdnoEncr: '', // 계좌/카드번호
  mpyBsdtOwrKnm: '', // 이체일_계약자명
  frisuBfsvcPtrmN: '', // 무상멤버십
  frisuAsPtrmN: '', // 무상 A/S
  recapDutyYn: '', // 유상멤버십 여부
  mshFntDv: '', // 멤버십 이체
  vstRqdt: '', // 의뢰일
  sppDuedt: '', // 예정일
  istDt: '', // 설치일
  canDt: '', // 취소일
  icpsDttDt: '', // 보상일
  booSellYn: '', // 예약여부
  frisuMshCrtYn: '', // 무상멤버십 고객여부
  frisuYn: '', // 무료체험여부
  freExpnCnfmDt: '', // 무료체험일
  chkChdvcRernt: '', // 기기변경
  sppMthdTpNm: '', // 의뢰구분
  cttTpCd: '', // 컨택코드
  pdChTp: '', // 상변유형
  sconCn: '', // 특약정보
  txinvPblOjYn: '', // 세금계산서발행 여부
  cssrIsNo: '', // 현금영수증
  slChTp: '', // 매변유형
  sppIvcCrtDt: '', // 택배송장출력일
  sppIvcCrtYn: '', // 사은품송장 출력여부
  urgtOjYn: '', // 우선이관
  sppIvcNo: '', // 운송장 번호
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdCompositionProducts = ref(getComponentType('KwGrid'));
const grdFreeGiftInformation = ref(getComponentType('KwGrid'));

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  res = await dataService.post('/sms/wells/contract/contracts/order-detail-mngt/singlepayments/paging', { ...cachedParams, ...pageInfo.value });

  console.log(res.data);
  const { list: pages, pageInfo: pagingResult } = res.data;
  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }
  pageInfo.value = pagingResult;
  console.log(pages.length);

  if (pages.length > 0) {
    // -------------------------------------------------------------------------------------------------
    // 주문정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.cntrDtlNo = pages[0].cntrDtlNo; // 계약상세번호
    frmMainData.value.ordDv = pages[0].ordDv; // 주문구분
    frmMainData.value.copnDvNm = pages[0].copnDvNm; // 고객구분
    frmMainData.value.cstGdNm = pages[0].cstGdNm; // 등급정보
    frmMainData.value.cntrCstNo = pages[0].cntrCstNo; // 고객번호
    frmMainData.value.dgr3LevlDgPrtnrNo = pages[0].dgr3LevlDgPrtnrNo; // 지점
    frmMainData.value.ogTpNm = pages[0].ogTpNm; // 조직구분
    frmMainData.value.ogCd = pages[0].ogCd; // 조직코드
    frmMainData.value.sellInflwChnlDtlCd = pages[0].sellInflwChnlDtlCd; // 파트너 유형
    frmMainData.value.sellPrtnrNo = pages[0].sellPrtnrNo; // 파트너-번호
    frmMainData.value.prtnrKnm = pages[0].prtnrKnm; // 파트너-이름
    frmMainData.value.cntrRcpFshDtm = pages[0].cntrRcpFshDtm; // 접수일
    frmMainData.value.fstRgstDt = pages[0].fstRgstDt; // 등록일
    // -------------------------------------------------------------------------------------------------
    // 계약자 정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.cstKnm = pages[0].cstKnm; // 계약자 명
    if (pages[0].copnDvCd === '1') { // 생년월일
      frmMainData.value.rnmno = stringUtil.getDateFormat(pages[0].rnmno);
    } else if (pages[0].copnDvCd === '2') { // 사업자등록번호
      // 사업자등록번호 3-2-5 형식으로 표시
      if (!isEmpty(pages[0].rnmno) && pages[0].rnmno.length === 10) {
        frmMainData.value.rnmno = `${pages[0].rnmno.substr(0, 3)}-${pages[0].rnmno.substr(3, 2)}-${pages[0].rnmno.substr(5, 5)}`;
      }
    } // 계약자사업/주민번호
    const { cralLocaraTno } = pages[0];
    const { mexnoEncr } = pages[0];
    const { cralIdvTno } = pages[0];
    frmMainData.value.cntrCralTno = !isEmpty(cralLocaraTno) && !isEmpty(mexnoEncr) && !isEmpty(cralIdvTno) ? `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}` : ''; // 계약자-휴대전화번호
    frmMainData.value.newAdrZip = pages[0].newAdrZip; // 계약자 우편번호
    frmMainData.value.rnadr = pages[0].rnadr; // 계약자 주소(기준주소)
    frmMainData.value.rdadr = pages[0].rdadr; // 계약자 주소(상세주소)
    // -------------------------------------------------------------------------------------------------
    // 설치처 정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.rcgvpKnm = pages[0].rcgvpKnm; // 설치정보-설치자명
    const { istlcCralLocaraTno, istlcMexnoEncr, istlcCralIdvTno } = pages[0]; // 설치자 휴대지역전화번호
    if (!isEmpty(istlcCralLocaraTno) && isEmpty(istlcMexnoEncr) && !isEmpty(istlcCralIdvTno)) {
      frmMainData.value.istCralTno = `${istlcCralLocaraTno}--${istlcCralIdvTno}`;
    } else {
      frmMainData.value.istCralTno = isEmpty(istlcCralLocaraTno) && isEmpty(istlcMexnoEncr) && isEmpty(istlcCralIdvTno) ? '' : `${istlcCralLocaraTno}-${istlcMexnoEncr}-${istlcCralIdvTno}`; // 설치(배송정보) 휴대전화번호
    }
    frmMainData.value.istlcAdrZip = pages[0].istlcAdrZip; // 설치처 우편번호
    frmMainData.value.istlcAdr = pages[0].istlcAdr; // 설치자 주소(기준주소)
    frmMainData.value.istlcDadr = pages[0].istlcDadr; // 설치자 주소(상세주소)
    // -------------------------------------------------------------------------------------------------
    // 상품 정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.pdQty = pages[0].pdQty; // 수량
    frmMainData.value.fnlVal = pages[0].fnlVal; // 단가
    frmMainData.value.ctrVal = pages[0].ctrVal; // 할인
    // -------------------------------------------------------------------------------------------------
    // 금액정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.sellDscDvCd = pages[0].sellDscDvCd; // 할인구분코드
    frmMainData.value.sellDscDvNm = pages[0].sellDscDvNm; // 할인구분코드명
    frmMainData.value.sellDscTpCd = pages[0].sellDscTpCd; // 할인유형코드
    frmMainData.value.sellDscTpNm = pages[0].sellDscTpNm; // 할인유형코드명
    frmMainData.value.svPrd = pages[0].svPrd; // 관리주기
    frmMainData.value.svTpNm = pages[0].svTpNm; // 용도구분
    frmMainData.value.alncmpCd = pages[0].alncmpCd; // 제휴업체코드
    frmMainData.value.alncmpNm = pages[0].alncmpNm; // 제휴업체코드명
    frmMainData.value.sellEvCd = pages[0].sellEvCd; // 행사코드
    frmMainData.value.sellEvNm = pages[0].sellEvNm; // 행사코드명
    frmMainData.value.pkgOrdNo = pages[0].pkgOrdNo; // 패키지주문
    frmMainData.value.pmotTpNm = pages[0].pmotTpNm; // 프로모션구분
    frmMainData.value.fnlAmt = stringUtil.getNumberWithComma(Number(pages[0].fnlAmt), 0); // 판매가격
    frmMainData.value.vat = stringUtil.getNumberWithComma(Number(pages[0].vat), 0); // 부가세
    frmMainData.value.sellAmt = stringUtil.getNumberWithComma(Number(pages[0].sellAmt), 0); // 공급가액
    frmMainData.value.istmIntAmt = stringUtil.getNumberWithComma(Number(pages[0].istmIntAmt), 0); // 수수료액
    frmMainData.value.fnlAmt = stringUtil.getNumberWithComma(Number(pages[0].fnlAmt), 0); // 계약총액
    frmMainData.value.cntrAmt = stringUtil.getNumberWithComma(Number(pages[0].cntrAmt), 0); // 청약금
    frmMainData.value.tkAmt = stringUtil.getNumberWithComma(Number(pages[0].tkAmt), 0); // 인수금
    frmMainData.value.crpUcAmt = stringUtil.getNumberWithComma(Number(pages[0].crpUcAmt), 0); // 법인미수금액
    frmMainData.value.alncFee = stringUtil.getNumberWithComma(Number(pages[0].alncFee), 0); // 제휴수수료
    frmMainData.value.lcjAmt = stringUtil.getNumberWithComma(Number(pages[0].lcjAmt), 0); // 현금잔액
    frmMainData.value.istmMcn = stringUtil.getNumberWithComma(Number(pages[0].istmMcn), 0); // 할부
    frmMainData.value.mmIstmAmt = stringUtil.getNumberWithComma(Number(pages[0].mmIstmAmt), 0); // 할부금액
    frmMainData.value.ackmtPerfAmt = stringUtil.getNumberWithComma(Number(pages[0].ackmtPerfAmt), 0); // 인정실적액
    frmMainData.value.ackmtPerfCt = pages[0].ackmtPerfCt; // 인정건수
    frmMainData.value.feeAckmtBaseAmt = stringUtil.getNumberWithComma(Number(pages[0].feeAckmtBaseAmt), 0); // 수수료 기준금액
    frmMainData.value.feeFxamYn = pages[0].feeFxamYn; // 정액여부
    // -------------------------------------------------------------------------------------------------
    // 할부이체
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.dpTpNm = pages[0].dpTpNm; // 이체구분
    frmMainData.value.bnkCocdNm = pages[0].bnkCocdNm; // 항목구분
    frmMainData.value.acnoCrcdnoEncr = pages[0].acnoCrcdnoEncr; // 계좌/카드번호
    frmMainData.value.mpyBsdtOwrKnm = pages[0].mpyBsdtOwrKnm; // 이체일_계약자명
    // -------------------------------------------------------------------------------------------------
    // 멤버쉽 정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.frisuBfsvcPtrmN = pages[0].frisuBfsvcPtrmN; // 무상멤버십
    frmMainData.value.frisuAsPtrmN = pages[0].frisuAsPtrmN; // 무상 A/S
    frmMainData.value.recapDutyYn = pages[0].recapDutyYn; // 유상멤버십 여부
    frmMainData.value.mshFntDv = pages[0].mshFntDv; // 멤버십 이체
    // -------------------------------------------------------------------------------------------------
    // 처리일
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.cntrRcpFshDtm = pages[0].cntrRcpFshDtm; // 접수일
    frmMainData.value.vstRqdt = pages[0].vstRqdt; // 의뢰일
    frmMainData.value.sppDuedt = pages[0].sppDuedt; // 예정일
    frmMainData.value.istDt = pages[0].istDt; // 설치일
    frmMainData.value.canDt = pages[0].canDt; // 취소일
    frmMainData.value.icpsDttDt = pages[0].icpsDttDt; // 보상일
    // -------------------------------------------------------------------------------------------------
    // 기타정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.booSellYn = pages[0].booSellYn; // 예약여부
    frmMainData.value.frisuMshCrtYn = pages[0].frisuMshCrtYn; // 무상멤버십 고객여부
    frmMainData.value.frisuYn = pages[0].frisuYn; // 무료체험여부
    frmMainData.value.freExpnCnfmDt = pages[0].freExpnCnfmDt; // 무료체험일
    frmMainData.value.chkChdvcRernt = pages[0].chkChdvcRernt; // 기기변경
    frmMainData.value.sppMthdTpNm = pages[0].sppMthdTpNm; // 의뢰구분
    frmMainData.value.cttTpCd = pages[0].cttTpCd; // 컨택코드
    frmMainData.value.pdChTp = pages[0].pdChTp; // 상변유형
    frmMainData.value.sconCn = pages[0].sconCn; // 특약정보
    frmMainData.value.txinvPblOjYn = pages[0].txinvPblOjYn; // 세금계산서발행 여부
    frmMainData.value.cssrIsNo = pages[0].cssrIsNo; // 현금영수증
    frmMainData.value.slChTp = pages[0].slChTp; // 매변유형
    frmMainData.value.sppIvcCrtDt = pages[0].sppIvcCrtDt; // 택배송장출력일
    frmMainData.value.sppIvcCrtYn = pages[0].sppIvcCrtYn; // 사은품송장 출력여부
    frmMainData.value.urgtOjYn = pages[0].urgtOjYn; // 우선이관
    frmMainData.value.sppIvcNo = pages[0].sppIvcNo; // 운송장 번호
  }

  // 주문상세조회/관리 -복합상품목록
  res = await dataService.get('/sms/wells/contract/contracts/order-detail-mngt/regular-shippings/composition-products', { params: { ...cachedParams } });

  const viewCompositionProducts = grdCompositionProducts.value.getView();
  // view.getDataSource().setRows(accounts);
  viewCompositionProducts.getDataSource().setRows(res.data);
  pageInfo.value.totalCount = viewCompositionProducts.getItemCount();
  viewCompositionProducts.resetCurrent();

  // 주문상세조회/관리 -사은품 정보
  res = await dataService.get('/sms/wells/contract/contracts/order-detail-mngt/singlepayments/free-gift-information', { params: { ...cachedParams } });

  const viewFreeGiftInformation = grdFreeGiftInformation.value.getView();
  // view.getDataSource().setRows(accounts);
  viewFreeGiftInformation.getDataSource().setRows(res.data);
  pageInfo.value.totalCount = viewFreeGiftInformation.getItemCount();
  viewFreeGiftInformation.resetCurrent();
}

onMounted(async () => {
  await fetchData();
});

async function onClickConfirm() {
  cancel();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridCompositionProducts = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pdNm' }, // 상품정보
    { fieldName: 'pdQty' }, // 상품수량
    { fieldName: 'fnlVal' }, // 단가
    { fieldName: 'ctrVal' }, // 할인
    { fieldName: 'pdClsfNm' }, // 상품분류명
  ];
  const columns = [
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_INF'), width: '333', styleName: 'text-left' }, // 상품정보
    { fieldName: 'pdQty', header: t('MSG_TXT_PROD_QUANT'), width: '76', styleName: 'text-right' }, // 상품수량
    { fieldName: 'fnlVal', header: t('MSG_TXT_UPRC'), width: '158', styleName: 'text-right' }, // 단가
    { fieldName: 'ctrVal', header: t('MSG_TXT_DSC'), width: '158', styleName: 'text-right' }, // 할인
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_CATE'), width: '354', styleName: 'text-left' }, // 상품분류명
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGridFreeGiftInformation = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'fgptPdCd' }, // 사은품 상품코드
    { fieldName: 'fgptQty' }, // 사은품수량
  ];
  const columns = [
    { fieldName: 'fgptPdCd', header: t('MSG_TXT_FGPT'), width: '333', styleName: 'text-left' }, // 사은품 상품코드
    { fieldName: 'fgptQty', header: t('MSG_TXT_FGPT_QTY'), width: '76', styleName: 'text-right' }, // 사은품수량
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
