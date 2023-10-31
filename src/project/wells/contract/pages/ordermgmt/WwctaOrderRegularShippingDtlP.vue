<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaOrderRegularShippingDtlP -주문상세조회/관리(정기배송-상세)
3. 작성자 : jihoon.kim
4. 작성일 : 2023.04.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 정기배송 주문정보 상세 팝업 화면
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
        <!-- 고객구분 -->
        <kw-form-item :label="$t('MSG_TXT_CST_DV')">
          <kw-input
            v-model="frmMainData.copnDvNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 판매구분 -->
        <kw-form-item :label="$t('MSG_TXT_SLS_CAT')">
          <kw-input
            v-model="frmMainData.sellInflwChnlDtlNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 직원구분 -->
        <kw-form-item :label="$t('MSG_TXT_EMPL_DV')">
          <kw-input
            v-model="frmMainData.empDvVal"
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
        <!-- SAFE-KEY -->
        <kw-form-item label="SAFE-KEY">
          <kw-input
            v-model="frmMainData.safekey"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 등급정보 -->
        <kw-form-item :label="$t('MSG_TXT_GRD_INF')">
          <kw-input
            v-model="frmMainData.levelsNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 수납정보 -->
        <kw-form-item :label="$t('MSG_TXT_RVE_INF')">
          <kw-input
            v-model="frmMainData.rveCd"
            placeholder=""
            readonly
          />
          <kw-input
            v-model="frmMainData.rveNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_PRTNR')">
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
        <!-- 파트너 휴대전화번호 -->
        <kw-form-item :label="$t('MSG_TXT_PRTNR_MPNO')">
          <kw-input
            v-model="frmMainData.sellPrtnrCralTno"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 조직코드 -->
        <kw-form-item :label="$t('MSG_TXT_OG_CD')">
          <kw-input
            v-model="frmMainData.dgr3LevlOgId"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 지점 -->
        <kw-form-item :label="$t('MSG_TXT_BRANCH')">
          <!-- 지점 지점장 -->
          <kw-input
            v-model="frmMainData.dgr3LevlDgPrtnrNo"
            placeholder=""
            readonly
          />
          <!-- 지점 지점장명 -->
          <kw-input
            v-model="frmMainData.dgr3LevlDgPrtnrNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 등록일시 -->
        <kw-form-item :label="$t('MSG_TXT_RGST_DTM')">
          <!-- 등록일시 일자-->
          <kw-input
            v-model="frmMainData.fstRgstDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
          <!-- 등록일시 시간-->
          <kw-input
            v-model="frmMainData.fstRgstTm"
            mask="##:##:##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 업무담당 -->
        <kw-form-item :label="$t('MSG_TXT_BIZ_ICHR')">
          <kw-input
            v-model="frmMainData.fstRgstUsrId"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 업무담당명 -->
        <kw-form-item :label="$t('MSG_TXT_BIZ_ICHR_NM')">
          <kw-input
            v-model="frmMainData.fstRgstUsrNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 등록프로그램 -->
        <kw-form-item :label="$t('MSG_TXT_FST_RGST_PRG')">
          <kw-input
            v-model="frmMainData.fstRgstPrgId"
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
            v-model="frmMainData.cstNo"
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
            v-model="frmMainData.adrZip"
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
            v-model="frmMainData.cntrCstRnadr"
            placeholder=""
            readonly
          />
          <!-- 계약자 주소(상세주소) -->
          <kw-input
            v-model="frmMainData.cntrCstRdadr"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 배송처 정보 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_DLVR_INF') }}
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
            v-model="frmMainData.shpadrCralTno"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 설치처 우편번호 -->
        <kw-form-item :label="$t('MSG_TXT_ISTLC_ZIP')">
          <kw-input
            v-model="frmMainData.shpadrAdrZip"
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
            v-model="frmMainData.shpadrRnadr"
            placeholder=""
            readonly
          />
          <!-- 설치처 주소(상세주소) -->
          <kw-input
            v-model="frmMainData.shpadrRdadr"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 기기 정보 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_MCHN_INF') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 기기정보 -->
        <kw-form-item :label="$t('MSG_TXT_MCHN_INF')">
          <kw-input
            v-model="frmMainData.mchnSellTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 기기주문번호 -->
        <kw-form-item :label="$t('MSG_TXT_MCHN_ORD_NO')">
          <kw-input
            v-model="frmMainData.mchnCntrNo"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 기기주문자 명 -->
        <kw-form-item :label="$t('MSG_TXT_MCHN_ORDR_NM')">
          <kw-input
            v-model="frmMainData.mchnRcgvpKnm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 기기상품 -->
        <kw-form-item :label="$t('MSG_TXT_MCHN_PRDT')">
          <kw-input
            v-model="frmMainData.mchnPdCd"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 기기명 -->
        <kw-form-item :label="$t('MSG_TXT_MCHN_NM')">
          <kw-input
            v-model="frmMainData.mchnPdNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 기기용도 -->
        <kw-form-item :label="$t('MSG_TXT_MCHN_USWY')">
          <kw-input
            v-model="frmMainData.mchnSvTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 기기주기 -->
        <kw-form-item :label="$t('MSG_TXT_MCHN_PRD')">
          <kw-input
            v-model="frmMainData.mchnSvPrd"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 기기종류 -->
        <kw-form-item :label="$t('MSG_TXT_MCHN_KND')">
          <kw-input
            v-model="frmMainData.mchnPdMclsfNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 기기구분 -->
        <kw-form-item :label="$t('MSG_TXT_MCHN_DV')">
          <kw-input
            v-model="frmMainData.mchnPdLclsfNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-form>
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
    </kw-form>
    <kw-grid
      ref="grdMainRef"
      name="grdMainRef"
      :visible-rows="10"
      @init="initGrid"
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
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 제품선택유형 -->
        <kw-form-item :label="$t('MSG_TXT_PRDT_SELT_TYPE')">
          <kw-input
            v-model="frmMainData.pdTpCm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 의무기간 -->
        <kw-form-item :label="$t('MSG_TXT_DUTY_PTRM')">
          <kw-input
            v-model="frmMainData.stplPtrm"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 계약기간 -->
        <kw-form-item :label="$t('MSG_TXT_CNTR_PTRM')">
          <kw-input
            v-model="frmMainData.cntrPtrm"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 월청구액 -->
        <kw-form-item :label="$t('MSG_TXT_MM_BIL_AMT')">
          <kw-input
            v-model="frmMainData.mmBilAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 판매가격 -->
        <kw-form-item :label="$t('MSG_TXT_SLE_PRC')">
          <kw-input
            v-model="frmMainData.fnlAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 공급가 -->
        <kw-form-item :label="$t('MSG_TXT_SPLPRC')">
          <kw-input
            v-model="frmMainData.sellAmt"
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
      </kw-form-row>
      <kw-form-row>
        <!-- 계약총액 -->
        <kw-form-item :label="$t('MSG_TXT_CNTRCT_AMT')">
          <kw-input
            v-model="frmMainData.cntrAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 제품정상가격 -->
        <kw-form-item :label="$t('MSG_TXT_PDCT_NOM_PRC')">
          <kw-input
            v-model="frmMainData.pdBaseAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 인정 실적율 -->
        <kw-form-item :label="$t('MSG_TXT_ACKMT_PFR')">
          <kw-input
            v-model="frmMainData.ackmtPerfRt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 인정 실적액 -->
        <kw-form-item :label="$t('MSG_TXT_PD_ACC_RSLT_AMT')">
          <kw-input
            v-model="frmMainData.ackmtPerfAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 할인개월 -->
        <kw-form-item
          :label="$t('MSG_TXT_DSC_MCNT')"
        >
          <kw-input
            v-model="frmMainData.dscMcn"
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
            v-model="frmMainData.ctrAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 계약자 기준배송처 관계 -->
        <kw-form-item :label="$t('MSG_TXT_CNTRT_BASE_DLVR_RLT')">
          <kw-input
            v-model="frmMainData.cntrtRelNm"
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
        <!-- 스폐셜 구분 -->
        <kw-form-item :label="$t('MSG_TXT_SPEC_DV')">
          <kw-input
            v-model="frmMainData.spcYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 배송주기 -->
        <kw-form-item :label="$t('MSG_TXT_SPP_PRD')">
          <kw-input
            v-model="frmMainData.svPrd"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 배송일자 -->
        <kw-form-item :label="$t('MSG_TXT_SPP_DT')">
          <kw-input
            v-model="frmMainData.sppFshDt"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 배송구분 -->
        <kw-form-item :label="$t('TXT_MSG_SPP_DV_CD')">
          <kw-input
            v-model="frmMainData.sppMthdTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 청구구분 -->
        <kw-form-item :label="$t('MSG_TXT_BIL_DV')">
          <kw-input
            v-model="frmMainData.rglrSppBilDvNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 자동이체 -->
        <kw-form-item :label="$t('MSG_TXT_AUTO_FNT')">
          <kw-input
            v-model="frmMainData.mpyMthdTpNm"
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
      </kw-form-row>
      <kw-form-row>
        <!-- 무료개월 -->
        <kw-form-item :label="$t('MSG_TXT_FRE_MCNT')">
          <kw-input
            v-model="frmMainData.frisuBfsvcPtrmN"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 무료회수 -->
        <kw-form-item :label="$t('MSG_TXT_FRE_CLN')">
          <kw-input
            v-model="frmMainData.lcmcnt"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 가격유형 -->
        <kw-form-item :label="$t('MSG_TXT_PRC_TP')">
          <kw-input
            v-model="frmMainData.lcck05Nm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 프로모션 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_PMOT') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 프로모션명 -->
        <kw-form-item :label="$t('MSG_TXT_PMOT_NM')">
          <kw-input
            v-model="frmMainData.pmotNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 프로모션유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_PMOT_TP')"
        >
          <kw-input
            v-model="frmMainData.pmotTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 제휴정보 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_ALNC_INF') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 제휴상태 -->
        <kw-form-item :label="$t('MSG_TXT_ALNC_STAT')">
          <kw-input
            v-model="frmMainData.alncStatTpCd"
            placeholder=""
            readonly
          />
          <kw-input
            v-model="frmMainData.alncStatTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 제휴업체 -->
        <kw-form-item
          :label="$t('MSG_TXT_ALNC_BZS')"
          :colspan="2"
        >
          <!-- 제휴업체코드 -->
          <kw-input
            v-model="frmMainData.alncmpCd"
            class="w95"
            placeholder=""
            readonly
          />
          <!-- 제휴업체코드명 -->
          <kw-input
            v-model="frmMainData.alncmpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 접수기준 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_RCPT_BASE') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 패키지 여부 -->
        <kw-form-item :label="$t('MSG_TXT_PKG_YN')">
          <kw-input
            v-model="frmMainData.rcpPkgYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 패키지 코드 -->
        <kw-form-item :label="$t('MSG_TXT_PKG_CD')">
          <kw-input
            v-model="frmMainData.rcpPkgCd"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 현재기준 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_CRNT_BASE') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 현재패키지 여부 -->
        <kw-form-item :label="$t('MSG_TXT_CRNT_PKG_YN')">
          <kw-input
            v-model="frmMainData.pkgYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 패키지 가격적용 -->
        <kw-form-item :label="$t('MSG_TXT_PKG_PRC_APY')">
          <kw-input
            v-model="frmMainData.pkgPrcApy"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 패키지 군 -->
        <kw-form-item :label="$t('MSG_TXT_PKG_GRP')">
          <kw-input
            v-model="frmMainData.pkgclsfNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 현재패키지 번호 -->
        <kw-form-item :label="$t('MSG_TXT_CRNT_PKG_NO')">
          <kw-input
            v-model="frmMainData.pkgCd"
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
            v-model="frmMainData.cntrRcpFshDt"
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
        <!-- 최초배송일 -->
        <kw-form-item :label="$t('MSG_TXT_FST_SPP_D')">
          <kw-input
            v-model="frmMainData.fstSppFshDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 매출일 -->
        <kw-form-item :label="$t('MSG_TXT_DT_OF_SALE')">
          <kw-input
            v-model="frmMainData.slDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 해약요청일 -->
        <kw-form-item :label="$t('MSG_TXT_CLTN_AK_D')">
          <kw-input
            v-model="frmMainData.cltnRqdt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 해약일 -->
        <kw-form-item :label="$t('MSG_TXT_CLTN_D')">
          <kw-input
            v-model="frmMainData.reqdDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 해약유형 -->
        <kw-form-item :label="$t('MSG_TXT_CLTN_TP')">
          <kw-input
            v-model="frmMainData.cltnCntrDtlStatNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 배송기준년월 -->
        <kw-form-item :label="$t('MSG_TXT_SPP_BASE_YM')">
          <kw-input
            v-model="frmMainData.sppFshM"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 배송기준횟수 -->
        <kw-form-item :label="$t('MSG_TXT_SPP_STD_TMS')">
          <kw-input
            v-model="frmMainData.lcscnt"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 확정유무 -->
        <kw-form-item :label="$t('MSG_TXT_CNFM_EYN')">
          <kw-input
            v-model="frmMainData.cntrCnfmYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 주문확정여부 -->
        <kw-form-item :label="$t('MSG_TXT_ORDR_DTRM_YN')">
          <kw-input
            v-model="frmMainData.ordCnfmYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 주문확정일시 -->
        <kw-form-item :label="$t('MSG_TXT_ORDR_CNFM_DTM')">
          <!-- 주문확정일시 - 일자 -->
          <kw-input
            v-model="frmMainData.cntrCnfmDt"
            placeholder=""
            readonly
          />
          <!-- 주문확정일시 - 시간 -->
          <kw-input
            v-model="frmMainData.cntrCnfmTm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 일 매출확정 -->
        <kw-form-item :label="$t('MSG_TXT_D_SL_CNFM')">
          <kw-input
            v-model="frmMainData.slDt"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 일 매출확정일시 -->
        <kw-form-item :label="$t('MSG_TXT_D_SL_CNFM_DTM')">
          <kw-input
            v-model="frmMainData.slTm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 체험유무 -->
        <kw-form-item :label="$t('MSG_TXT_EXPN_EYN')">
          <kw-input
            v-model="frmMainData.frisuYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 참고사항 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_REFER_ARTC') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 컨택내용 -->
        <kw-form-item
          :label="$t('MSG_TXT_CTT_CNTN')"
          :colspan="2"
        >
          <!-- 컨택코드 -->
          <kw-input
            v-model="frmMainData.cttRsCd"
            placeholder=""
            readonly
          />
          <!-- 컨택내용 -->
          <kw-input
            v-model="frmMainData.cttRsNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 특약내용 -->
        <kw-form-item
          :label="$t('MSG_TXT_SPEC_CNTR_CNTN')"
          :colspan="2"
        >
          <kw-input
            v-model="frmMainData.sconCn"
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
import { defineGrid, getComponentType, useDataService, useGlobal, useModal, codeUtil, stringUtil, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { alert } = useGlobal();
const { cancel } = useModal();
const props = defineProps({
  cntrNo: { type: String, required: true, default: '' },
  cntrSn: { type: String, required: false, default: '' },
  sellTpCd: { type: String, required: false, default: '' },
});

let cachedParams;
const searchParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  sellTpCd: props.sellTpCd,
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
  copnDvNm: '', // 고객구분
  sellInflwChnlDtlNm: '', // 판매구분
  empDvVal: '', // 직원구분
  cntrCstNo: '', // 고객번호
  safekey: '', // 세이프키(SAFE-KEY)
  levelsNm: '', // 등급정보
  rveCd: '', // 수납정보코드
  rveNm: '', // 수납정보코드명
  sellPrtnrNo: '', // 파트너-번호
  prtnrKnm: '', // 파트너-이름
  sellPrtnrCralTno: '', // 파트너 휴대전화번호
  cralLocaraTno: '', // 파트너 휴대지역전화번호
  mexnoEncr: '', // 파트너 휴대전화국번호암호화
  cralIdvTno: '', // 파트너 휴대개별전화번호
  dgr3LevlOgId: '', // 조직코드
  dgr3LevlDgPrtnrNo: '', // 지점 - 지점장
  dgr3LevlDgPrtnrNm: '', // 지점 - 지점장명
  fstRgstDt: '', // 등록일시-일자
  fstRgstTm: '', // 등록일시-시간
  fstRgstUsrId: '', // 업무담당
  fstRgstUsrNm: '', // 업무담당 명
  fstRgstPrgId: '', // 등록프로그램
  cstKnm: '', // 계약자 명
  cstNo: '', // 계약자사업/주민번호
  cntrCralTno: '', // 계약자 휴대전화번호
  cntrCralLocaraTno: '', // 계약자 휴대지역전화번호
  cntrMexnoEncr: '', // 계약자 휴대전화국번호암호화
  cntrCralIdvTno: '', // 계약자 휴대개별전화번호
  adrZip: '', // 계약자 우편번호
  cntrCstRnadr: '', // 계약자 주소(기준주소)
  cntrCstRdadr: '', // 계약자 주소(상세주소)
  rcgvpKnm: '', // 설치정보-설치자명
  shpadrCralTno: '', // 설치자 휴대전화번호
  shpadrCralLocaraTno: '', // 설치자 휴대지역전화번호
  shpadrMexnoEncr: '', // 설치자 휴대전화국번호암호화
  shpadrCralIdvTno: '', // 설치자 휴대개별전화번호
  shpadrAdrZip: '', // 설치처 우편번호
  shpadrRnadr: '', // 설치자 주소(기준주소)
  shpadrRdadr: '', // 설치자 주소(상세주소)
  mchnSellTpNm: '', // 기기정보
  mchnCntrNo: '', // 기기주문번호
  mchnRcgvpKnm: '', // 기기주문자 명
  mchnPdCd: '', // 기기상품
  mchnPdNm: '', // 기기상품명
  mchnSvTpNm: '', // 기기용도
  mchnSvPrd: '', // 기기주기
  mchnPdMclsfNm: '', // 기기종류
  mchnPdLclsfNm: '', // 기기구분
  pdQty: '', // 수량
  fnlVal: '', // 단가
  ctrVal: '', // 할인
  pdTpCm: '', // 제품선택유형
  stplPtrm: '', // 의무기간
  cntrPtrm: '', // 계약기간
  mmBilAmt: '', // 월청구액
  fnlAmt: '', // 판매가격
  sellAmt: '', // 공급가액
  vat: '', // 부가세
  cntrAmt: '', // 계약총액
  pdBaseAmt: '', // 제품정상가격
  ackmtPerfRt: '', // 인정실적율(%)
  ackmtPerfAmt: '', // 인정실적액
  dscMcn: '', // 할인개월
  ctrAmt: '', // 할인금액
  cntrtRelNm: '', // 계약자 기준배송처 관계
  svTpNm: '', // 용도구분
  spcYn: '', // 스폐셜 구분
  svPrd: '', // 배송주기
  sppFshDt: '', // 배송일자
  sppMthdTpNm: '', // 배송구분
  rglrSppBilDvNm: '', // 청구구분
  mpyMthdTpNm: '', // 자동이체
  txinvPblOjYn: '', // 세금계산서발행 여부
  frisuBfsvcPtrmN: '', // 무료개월
  lcmcnt: '', // 무료회수
  lcck05Nm: '', // 가격유형
  alncStatTpCd: '', // 제휴상태코드
  alncStatTpNm: '', // 제휴상태코드명
  alncmpCd: '', // 제휴업체코드
  alncmpNm: '', // 제휴업체코드명
  rcpPkgYn: '', // 패키지 여부
  rcpPkgCd: '', // 패키지 코드
  pkgYn: '', // 현재패키지 여부
  pkgPrcApy: '', // 패키지 가격적용
  pkgclsfNm: '', // 패키지 군
  pkgCd: '', // 현재패키지 번호
  cntrRcpFshDt: '', // 접수일
  sppDuedt: '', // 예정일
  fstSppFshDt: '', // 최초배송일
  istDt: '', // 매출일
  cltnRqdt: '', // 해약요청일
  reqdDt: '', // 해약일
  cltnCntrDtlStatNm: '', // 해약유형
  sppFshM: '', // 배송기준년월
  lcscnt: '', // 배송기준횟수
  cntrCnfmYn: '', // 확정유무
  ordCnfmYn: '', // 주문확정여부
  cntrCnfmDt: '', // 주문확정일시(일자)
  cntrCnfmTm: '', // 주문확정일시(시간)
  slDt: '', // 일 매출확정
  slTm: '', // 일 매출확정일시
  frisuYn: '', // 체험유무
  cttRsCd: '', // 컨택코드
  cttRsNm: '', // 컨택내용
  sconCn: '', // 특약내용
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  res = await dataService.post('/sms/wells/contract/contracts/order-detail-mngt/regular-shippings/paging', { ...cachedParams, ...pageInfo.value });

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
    frmMainData.value.copnDvNm = pages[0].copnDvNm; // 고객구분
    frmMainData.value.sellInflwChnlDtlNm = pages[0].sellInflwChnlDtlNm; // 판매구분
    frmMainData.value.empDvVal = pages[0].empDvVal; // 직원구분
    frmMainData.value.cntrCstNo = pages[0].cntrCstNo; // 고객번호
    frmMainData.value.safekey = pages[0].safekey; // 세이프키(SAFE-KEY)
    frmMainData.value.levelsNm = pages[0].levelsNm; // 등급정보
    frmMainData.value.rveCd = pages[0].rveCd; // 수납정보코드
    frmMainData.value.rveNm = pages[0].rveNm; // 수납정보코드명
    frmMainData.value.sellPrtnrNo = pages[0].sellPrtnrNo; // 파트너-번호
    frmMainData.value.prtnrKnm = pages[0].prtnrKnm; // 파트너-이름
    const { cralLocaraTno } = pages[0]; // 파트너 휴대지역전화번호
    const { mexnoEncr } = pages[0]; // 파트너 휴대전화국번호암호화
    const { cralIdvTno } = pages[0]; // 파트너 휴대개별전화번호
    frmMainData.value.sellPrtnrCralTno = !isEmpty(cralLocaraTno) && !isEmpty(mexnoEncr) && !isEmpty(cralIdvTno) ? `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}` : ''; // 파트너-휴대전화번호
    frmMainData.value.dgr3LevlOgId = pages[0].dgr3LevlOgId; // 조직코드
    frmMainData.value.dgr3LevlDgPrtnrNo = pages[0].dgr3LevlDgPrtnrNo; // 지점 - 지점장
    frmMainData.value.dgr3LevlDgPrtnrNm = pages[0].dgr3LevlDgPrtnrNm; // 지점 - 지점장명
    frmMainData.value.fstRgstDt = pages[0].fstRgstDt; // 등록일시-일자
    frmMainData.value.fstRgstTm = pages[0].fstRgstTm; // 등록일시-시간
    frmMainData.value.fstRgstUsrId = pages[0].fstRgstUsrId; // 업무담당
    frmMainData.value.fstRgstUsrNm = pages[0].fstRgstUsrNm; // 업무담당 명
    frmMainData.value.fstRgstPrgId = pages[0].fstRgstPrgId; // 등록프로그램
    // -------------------------------------------------------------------------------------------------
    // 계약자 정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.cstKnm = pages[0].cstKnm; // 계약자 명
    if (pages[0].copnDvCd === '1') { // 생년월일
      frmMainData.value.cstNo = stringUtil.getDateFormat(pages[0].cstNo);
    } else if (pages[0].copnDvCd === '2') { // 사업자등록번호
      // 사업자등록번호 3-2-5 형식으로 표시
      if (!isEmpty(pages[0].cstNo) && pages[0].cstNo.length === 10) {
        frmMainData.value.cstNo = `${pages[0].cstNo.substr(0, 3)}-${pages[0].cstNo.substr(3, 2)}-${pages[0].cstNo.substr(5, 5)}`;
      }
    }
    const { cntrCralLocaraTno, cntrMexnoEncr, cntrCralIdvTno } = pages[0]; // 계약자 휴대지역전화번호
    if (!isEmpty(cntrCralLocaraTno) && isEmpty(cntrMexnoEncr) && !isEmpty(cntrCralIdvTno)) {
      frmMainData.value.cntrCralTno = `${cntrCralLocaraTno}--${cntrCralIdvTno}`;
    } else {
      frmMainData.value.cntrCralTno = isEmpty(cntrCralLocaraTno) && isEmpty(cntrMexnoEncr) && isEmpty(cntrCralIdvTno) ? '' : `${cntrCralLocaraTno}-${cntrMexnoEncr}-${cntrCralIdvTno}`; // 계약자 휴대전화번호
    }
    frmMainData.value.adrZip = pages[0].adrZip; // 계약자 우편번호
    frmMainData.value.cntrCstRnadr = pages[0].cntrCstRnadr; // 계약자 주소(기준주소)
    frmMainData.value.cntrCstRdadr = pages[0].cntrCstRdadr; // 계약자 주소(상세주소)
    // -------------------------------------------------------------------------------------------------
    // 배송처 정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.rcgvpKnm = pages[0].rcgvpKnm; // 설치정보-설치자명
    const { shpadrCralLocaraTno, shpadrMexnoEncr, shpadrCralIdvTno } = pages[0]; // 설치자 휴대지역전화번호
    if (!isEmpty(shpadrCralLocaraTno) && isEmpty(shpadrMexnoEncr) && !isEmpty(shpadrCralIdvTno)) {
      frmMainData.value.shpadrCralTno = `${shpadrCralLocaraTno}--${shpadrCralIdvTno}`;
    } else {
      frmMainData.value.shpadrCralTno = isEmpty(shpadrCralLocaraTno) && isEmpty(shpadrMexnoEncr) && isEmpty(shpadrCralIdvTno) ? '' : `${shpadrCralLocaraTno}-${shpadrMexnoEncr}-${shpadrCralIdvTno}`; // 설치(배송정보) 휴대전화번호
    }
    frmMainData.value.shpadrAdrZip = pages[0].shpadrAdrZip; // 설치처 우편번호
    frmMainData.value.shpadrRnadr = pages[0].shpadrRnadr; // 설치자 주소(기준주소)
    frmMainData.value.shpadrRdadr = pages[0].shpadrRdadr; // 설치자 주소(상세주소)
    // -------------------------------------------------------------------------------------------------
    // 기기 정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.mchnSellTpNm = pages[0].mchnSellTpNm; // 기기정보
    frmMainData.value.mchnCntrNo = pages[0].mchnCntrNo; // 기기주문번호
    frmMainData.value.mchnRcgvpKnm = pages[0].mchnRcgvpKnm; // 기기주문자 명
    frmMainData.value.mchnPdCd = pages[0].mchnPdCd; // 기기상품
    frmMainData.value.mchnPdNm = pages[0].mchnPdNm; // 기기상품명
    frmMainData.value.mchnSvTpNm = pages[0].mchnSvTpNm; // 기기용도
    frmMainData.value.mchnSvPrd = pages[0].mchnSvPrd; // 기기주기
    frmMainData.value.mchnPdMclsfNm = pages[0].mchnPdMclsfNm; // 기기종류
    frmMainData.value.mchnPdLclsfNm = pages[0].mchnPdLclsfNm; // 기기구분
    // -------------------------------------------------------------------------------------------------
    // 상품 정보
    // -------------------------------------------------------------------------------------------------
    // frmMainData.value.pdQty = pages[0].pdQty; // 수량
    // frmMainData.value.fnlVal = pages[0].fnlVal; // 단가
    // frmMainData.value.ctrVal = pages[0].ctrVal; // 할인
    frmMainData.value.pdTpCm = pages[0].pdTpCm; // 제품선택유형
    frmMainData.value.stplPtrm = pages[0].stplPtrm; // 의무기간
    frmMainData.value.cntrPtrm = pages[0].cntrPtrm; // 계약기간
    frmMainData.value.mmBilAmt = stringUtil.getNumberWithComma(Number(pages[0].mmBilAmt), 0); // 월청구액
    frmMainData.value.fnlAmt = stringUtil.getNumberWithComma(Number(pages[0].fnlAmt), 0); // 판매가격
    frmMainData.value.sellAmt = stringUtil.getNumberWithComma(Number(pages[0].sellAmt), 0); // 공급가액
    frmMainData.value.vat = stringUtil.getNumberWithComma(Number(pages[0].vat), 0); // 부가세
    frmMainData.value.cntrAmt = stringUtil.getNumberWithComma(Number(pages[0].cntrAmt), 0); // 계약총액
    frmMainData.value.pdBaseAmt = stringUtil.getNumberWithComma(Number(pages[0].pdBaseAmt), 0); // 제품정상가격
    frmMainData.value.ackmtPerfRt = pages[0].ackmtPerfRt; // 인정실적율(%)
    frmMainData.value.ackmtPerfAmt = stringUtil.getNumberWithComma(Number(pages[0].ackmtPerfAmt), 0); // 인정실적액
    frmMainData.value.dscMcn = pages[0].dscMcn; // 할인개월
    frmMainData.value.ctrAmt = stringUtil.getNumberWithComma(Number(pages[0].ctrAmt), 0); // 할인금액
    frmMainData.value.cntrtRelNm = pages[0].cntrtRelNm; // 계약자 기준배송처 관계
    frmMainData.value.svTpNm = pages[0].svTpNm; // 용도구분
    frmMainData.value.spcYn = pages[0].spcYn; // 스폐셜 구분
    frmMainData.value.svPrd = pages[0].svPrd; // 배송주기
    frmMainData.value.sppFshDt = pages[0].sppFshDt; // 배송일자
    frmMainData.value.sppMthdTpNm = pages[0].sppMthdTpNm; // 배송구분
    frmMainData.value.rglrSppBilDvNm = pages[0].rglrSppBilDvNm; // 청구구분
    frmMainData.value.mpyMthdTpNm = pages[0].mpyMthdTpNm; // 자동이체
    frmMainData.value.txinvPblOjYn = pages[0].txinvPblOjYn; // 세금계산서발행 여부
    frmMainData.value.mpyMthdTpNm = pages[0].mpyMthdTpNm; // 무료개월
    frmMainData.value.lcmcnt = pages[0].lcmcnt; // 무료회수
    frmMainData.value.lcck05Nm = pages[0].lcck05Nm; // 가격유형
    // -------------------------------------------------------------------------------------------------
    // 프로모션
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.pmotNm = pages[0].pmotNm; // 프로모션명
    frmMainData.value.pmotTpNm = pages[0].pmotTpNm; // 프로모션유형
    // -------------------------------------------------------------------------------------------------
    // 제휴정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.alncStatTpCd = pages[0].alncStatTpCd; // 제휴상태코드
    frmMainData.value.alncStatTpNm = pages[0].alncStatTpNm; // 제휴상태코드명
    frmMainData.value.alncmpCd = pages[0].alncmpCd; // 제휴업체코드
    frmMainData.value.alncmpNm = pages[0].alncmpNm; // 제휴업체코드명
    // -------------------------------------------------------------------------------------------------
    // 접수기준
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.rcpPkgYn = pages[0].rcpPkgYn; // 패키지 여부
    frmMainData.value.rcpPkgCd = pages[0].rcpPkgCd; // 패키지 코드
    // -------------------------------------------------------------------------------------------------
    // 현재기준
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.pkgYn = pages[0].pkgYn; // 현재패키지 여부
    frmMainData.value.pkgPrcApy = pages[0].pkgPrcApy; // 패키지 가격적용
    frmMainData.value.pkgclsfNm = pages[0].pkgclsfNm; // 패키지 군
    frmMainData.value.pkgCd = pages[0].pkgCd; // 현재패키지 번호
    // -------------------------------------------------------------------------------------------------
    // 처리일
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.cntrRcpFshDt = pages[0].cntrRcpFshDt; // 접수일
    frmMainData.value.sppDuedt = pages[0].sppDuedt; // 예정일
    frmMainData.value.fstSppFshDt = pages[0].fstSppFshDt; // 최초배송일
    frmMainData.value.istDt = pages[0].istDt; // 매출일
    frmMainData.value.cltnRqdt = pages[0].cltnRqdt; // 해약요청일
    frmMainData.value.reqdDt = pages[0].reqdDt; // 해약일
    frmMainData.value.cltnCntrDtlStatNm = pages[0].cltnCntrDtlStatNm; // 해약유형
    frmMainData.value.sppFshM = pages[0].sppFshM; // 배송기준년월
    frmMainData.value.lcscnt = pages[0].lcscnt; // 배송기준횟수
    frmMainData.value.cntrCnfmYn = pages[0].cntrCnfmYn; // 확정유무
    frmMainData.value.ordCnfmYn = pages[0].ordCnfmYn; // 주문확정여부
    frmMainData.value.cntrCnfmDt = pages[0].cntrCnfmDt; // 주문확정일시(일자)
    frmMainData.value.cntrCnfmTm = pages[0].cntrCnfmTm; // 주문확정일시(시간)
    frmMainData.value.slDt = pages[0].slDt; // 일 매출확정
    frmMainData.value.slTm = pages[0].slTm; // 일 매출확정일시
    frmMainData.value.frisuYn = pages[0].frisuYn; // 무료체험유무
    // -------------------------------------------------------------------------------------------------
    // 참고사항
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.cttRsCd = pages[0].cttRsCd; // 컨택코드
    frmMainData.value.cttRsNm = pages[0].cttRsNm; // 컨택내용
    frmMainData.value.sconCn = pages[0].sconCn; // 특약내용
  }

  res = await dataService.get('/sms/wells/contract/contracts/order-detail-mngt/regular-shippings/composition-products', { params: { ...cachedParams, ...pageInfo.value } });
  console.log(res.data);

  let totPdQty = 0;
  let totFnlVal = 0;
  let totCtrVal = 0;

  res.data.forEach((rowData) => {
    totPdQty += Number(rowData.pdQty);
    totFnlVal = Number(rowData.totAmt);
    totCtrVal = Number(rowData.totDscAmt);
  });

  frmMainData.value.pdQty = stringUtil.getNumberWithComma(Number(totPdQty), 0);
  frmMainData.value.fnlVal = stringUtil.getNumberWithComma(Number(totFnlVal), 0);
  frmMainData.value.ctrVal = stringUtil.getNumberWithComma(Number(totCtrVal), 0);

  // view.getDataSource().setRows(accounts);
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
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
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'basePdCd' }, // 상품코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'pdQty' }, // 수량
    { fieldName: 'fnlVal', dataType: 'number' }, // 단가
    { fieldName: 'ctrVal', dataType: 'number' }, // 할인
    { fieldName: 'hgrPdCd' }, // 패키지 코드
    { fieldName: 'verSn' }, // 패키지 가격 차수
  ];

  const columns = [
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '170', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '358', styleName: 'text-left' }, // 상품명
    { fieldName: 'pdQty', header: t('MSG_TXT_QTY'), width: '76', styleName: 'text-right' }, // 수량
    { fieldName: 'fnlVal', header: t('MSG_TXT_UPRC'), width: '158', styleName: 'text-right' }, // 단가
    { fieldName: 'ctrVal', header: t('MSG_TXT_DSC'), width: '158', styleName: 'text-right' }, // 할인
    { fieldName: 'hgrPdCd', header: t('MSG_TXT_PKG_CD'), width: '158', styleName: 'text-center' }, // 패키지 코드
    { fieldName: 'verSn', header: `${t('MSG_TXT_PKG_PRC')} ${t('MSG_TXT_ORDR')}`, width: '158', styleName: 'text-right' }, // 패키지가격 차수
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
