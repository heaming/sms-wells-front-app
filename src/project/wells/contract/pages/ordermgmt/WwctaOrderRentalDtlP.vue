<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaOrderRentalDtlP - 주문상세조회/관리(렌탈-상세)
3. 작성자 : jihoon.kim
4. 작성일 : 2023.04.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈 주문정보 상세 팝업 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="3xl"
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
        <!-- 등급구분 -->
        <kw-form-item :label="$t('MSG_TXT_GRD_DV')">
          <kw-input
            v-model="frmMainData.levels"
            placeholder=""
            readonly
          />
        </kw-form-item>
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
      </kw-form-row>

      <kw-form-row>
        <!-- 주문구분 -->
        <kw-form-item :label="$t('MSG_TXT_ORD_DV')">
          <kw-input
            v-model="frmMainData.sellInflwChnlDtlNm"
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
        <!-- 조직구분 -->
        <kw-form-item :label="$t('MSG_TXT_OG_DV')">
          <!-- 조직구분코드 -->
          <kw-input
            v-model="frmMainData.alncPrtnrDrmDvCd"
            placeholder=""
            readonly
          />
          <!-- 조직구분명 -->
          <kw-input
            v-model="frmMainData.alncPrtnrDrmDvNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 관계구분 -->
        <kw-form-item :label="$t('MSG_TXT_RELATION_CLSF')">
          <kw-input
            v-model="frmMainData.cntrtRelNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <!-- 주문입력구분 -->
        <kw-form-item :label="$t('MSG_TXT_ORD_INP_DV')">
          <kw-input
            v-model="frmMainData.lcck07"
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
        <!-- 총판대면 -->
        <kw-form-item :label="$t('MSG_TXT_DIST_FACE_TO_FACE')">
          <kw-input
            v-model="frmMainData.ftfDvCd"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 직원 판매유형 -->
        <kw-form-item :label="$t('MSG_TXT_EMPL_SELL_TYPE')">
          <kw-input
            v-model="frmMainData.lcet10"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 파트너 -->
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
        <!-- 관계구분 -->
        <kw-form-item :label="$t('MSG_TXT_RELATION_CLSF')">
          <kw-input
            v-model="frmMainData.cntrtRelNm"
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
        <!-- 사업자등록/주민번호 -->
        <kw-form-item :label="$t('MSG_TXT_CRNO_RRNO')">
          <kw-input
            v-model="frmMainData.bryyBzrno"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 계약자 휴대전화번호 -->
        <kw-form-item :label="$t('MSG_TXT_CNTRT_CPHON_NO')">
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
        <!-- 설치 요청일 -->
        <kw-form-item :label="$t('MSG_TXT_INST_REQ_DATE')">
          <kw-input
            v-model="frmMainData.istAkDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 설치처 우편번호 -->
        <kw-form-item :label="$t('MSG_TXT_ISTLC_ZIP')">
          <kw-input
            v-model="frmMainData.istAdrZip"
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
            v-model="frmMainData.istRnadr"
            placeholder=""
            readonly
          />
          <!-- 설치처 주소(상세주소) -->
          <kw-input
            v-model="frmMainData.istRdadr"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <!-- 상품정보 -->
        <h3 class="mb20">
          {{ $t('MSG_TXT_PD_INF') }}
        </h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">(단위:원,개월)</span>
    </kw-action-top>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 상품분류 -->
        <kw-form-item :label="$t('MSG_TXT_PRDT_CATE')">
          <kw-input
            v-model="frmMainData.pdClsfNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 상품유형 -->
        <kw-form-item :label="$t('MSG_TXT_PRDT_TYPE')">
          <kw-input
            v-model="frmMainData.pdTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 상품코드/상품명/수량 -->
        <kw-form-item
          :label="$t('MSG_TXT_PRDT_CODE')+'/'+$t('MSG_TXT_PRDT_NM')+'/'+$t('MSG_TXT_QTY')"
          :colspan="2"
        >
          <!-- 상품코드 -->
          <kw-input
            v-model="frmMainData.basePdCd"
            placeholder=""
            readonly
          />
          <!-- 상품명 -->
          <kw-input
            v-model="frmMainData.pdNm"
            placeholder=""
            readonly
          />
          <!-- 수량 -->
          <kw-input
            v-model="frmMainData.pdQty"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <!-- 렌탈등록비 -->
        <kw-form-item :label="$t('MSG_TXT_RENT_RGST_FEE')">
          <kw-input
            v-model="frmMainData.cntrCtrAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 렌탈기간 -->
        <kw-form-item :label="$t('MSG_TXT_RENT_PRD_MN')">
          <kw-input
            v-model="frmMainData.cntrPtrm"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 렌탈 총금액(원) -->
        <kw-form-item :label="$t('MSG_TXT_RNTL_TOT_AMT')">
          <kw-input
            v-model="frmMainData.rentalTam"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 계약 총금액(원) -->
        <kw-form-item :label="$t('MSG_TXT_CNTL_TOT_AMT')">
          <kw-input
            v-model="frmMainData.cntrTam"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <!-- 총판매제품 -->
        <kw-form-item :label="$t('MSG_TXT_TOT_SELL_PDCT')">
          <kw-input
            v-model="frmMainData.fnlPdCd"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 최종판매제품 명 -->
        <kw-form-item
          :label="$t('MSG_TXT_FNL_SELL_PDCT_NM')"
          :colspan="2"
        >
          <kw-input
            v-model="frmMainData.fnlPdNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 렌탈기간1(개월) -->
        <kw-form-item :label="$t('MSG_TXT_RENT_PRD_MN')+'1('+$t('MSG_TXT_MCNT')+')'">
          <kw-input
            v-model="frmMainData.rentalPtrm"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 렌탈료1(원) -->
        <kw-form-item :label="$t('MSG_TXT_RTLFE1')">
          <kw-input
            v-model="frmMainData.rentalAmt1"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 렌탈기간2(개월) -->
        <kw-form-item :label="$t('MSG_TXT_RENT_PRD_MN')+'2('+$t('MSG_TXT_MCNT')+')'">
          <kw-input
            v-model="frmMainData.rentalPtrm2"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 렌탈료2(원) -->
        <kw-form-item :label="$t('MSG_TXT_RTLFE2')">
          <kw-input
            v-model="frmMainData.rentalAmt2"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 등록할인(원) -->
        <kw-form-item :label="$t('MSG_TXT_RGST_DSC')">
          <kw-input
            v-model="frmMainData.cntrCtrAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 렌탈할인1 -->
        <kw-form-item :label="$t('MSG_TXT_RNTL_DSC_1')">
          <kw-input
            v-model="frmMainData.rentalDscAmt1"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 렌탈할인2 -->
        <kw-form-item :label="$t('MSG_TXT_RNTL_DSC_2')">
          <kw-input
            v-model="frmMainData.rentalDscAmt2"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 의무기간 -->
        <kw-form-item :label="$t('MSG_TXT_DUTY_PTRM')">
          <kw-input
            v-model="frmMainData.recapDutyPtrmN"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 리스구분 -->
        <kw-form-item :label="$t('MSG_TXT_LEASE_DV')">
          <kw-input
            v-model="frmMainData.leaseDvNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
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
        <!-- 할인제도(제렌탈/1+1) -->
        <kw-form-item :label="$t('MSG_TXT_DSC_SYST')+'('+$t('MSG_TXT_RE_RENTAL')+'/1+1)'">
          <kw-input
            v-model="frmMainData.dscPmotCd"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 관리/방문/택배주기 -->
        <kw-form-item :label="$t('MSG_TXT_MGT_VST_PARCEL_PERI')">
          <kw-input
            v-model="frmMainData.svPrdInfo"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 기변 여부 -->
        <kw-form-item :label="$t('MSG_TXT_CHDVC_YN')">
          <kw-input
            v-model="frmMainData.lcetc7"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 기변 상태코드 -->
        <kw-form-item :label="$t('MSG_TXT_CHDVC_STT_CD')">
          <kw-input
            v-model="frmMainData.ojCntrDtlNo"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 1+1 연계코드 -->
        <kw-form-item :label="$t('MSG_TXT_1PLUS1_LK_CD')">
          <kw-input
            v-model="frmMainData.bogoCd"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 1+1 이전상품 -->
        <kw-form-item :label="$t('MSG_TXT_1PLUS1_CHNG_PREV_PRDT')">
          <!-- 1+1 이전상품 -->
          <kw-input
            v-model="frmMainData.bogoPdCd"
            placeholder=""
            readonly
          />
          <!-- 1+1 이전상품명 -->
          <kw-input
            v-model="frmMainData.bogoPdNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 기변이전상품 -->
        <kw-form-item :label="$t('MSG_TXT_CHNG_PREV_PRDT')">
          <!-- 기변이전상품 -->
          <kw-input
            v-model="frmMainData.ojBasePdCd"
            placeholder=""
            readonly
          />
          <!-- 기변이전상품명 -->
          <kw-input
            v-model="frmMainData.ojPdNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 기변유형 -->
        <kw-form-item :label="$t('MSG_TXT_CHDVC_TP')">
          <!-- 기변유형코드 -->
          <kw-input
            v-model="frmMainData.mchnChTpCd"
            placeholder=""
            readonly
          />
          <!-- 기변유형코드명 -->
          <kw-input
            v-model="frmMainData.mchnChTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 기변 실적율(%) -->
        <kw-form-item :label="$t('MSG_TXT_CHNG_PFR_RAT')">
          <kw-input
            v-model="frmMainData.mchnCpspApyr"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 결합구분 -->
        <kw-form-item :label="$t('MSG_TXT_COMBI_DV')">
          <kw-input
            v-model="frmMainData.combiNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 재약정할인 -->
        <kw-form-item :label="$t('MSG_TXT_RSTL_DSC')">
          <kw-input
            v-model="frmMainData.stplDscAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 정상차액 -->
        <kw-form-item :label="$t('MSG_TXT_NOM_DIFF')">
          <kw-input
            v-model="frmMainData.rentalDscDfam"
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
        <!-- 서비스료 -->
        <kw-form-item :label="$t('MSG_TXT_PD_SVC_FEE')">
          <kw-input
            v-model="frmMainData.svAmt"
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
        <!-- 프로모션 -->
        <h3 class="mb20">
          {{ $t('MSG_TXT_PMOT') }}
        </h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">(단위:원,개월)</span>
    </kw-action-top>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 프로모션번호 -->
        <kw-form-item :label="$t('MSG_TXT_PMOT_NO')">
          <kw-input
            v-model="frmMainData.pmotCd"
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
        <!-- 할인개월 -->
        <kw-form-item
          :label="$t('MSG_TXT_DSC_MCNT')"
        >
          <kw-input
            v-model="frmMainData.pmotFvrMcn"
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
            v-model="frmMainData.pmotFvrAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 프로모션 무료개월 -->
        <kw-form-item :label="$t('MSG_TXT_FRE_MCNT')">
          <kw-input
            v-model="frmMainData.frisuBfsvcPtrmN"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 설치월 면제 -->
        <kw-form-item
          :label="$t('MSG_TXT_INST_MON_EXMP')"
        >
          <kw-input
            v-model="frmMainData.lcflg3"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 연관상품조회 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_RELT_PRDT_SELT') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 연관상품조회 -->
        <kw-form-item :label="$t('MSG_TXT_RELT_PRDT_SELT')">
          <kw-btn
            v-permission:read
            secondary
            padding="12px"
            :label="$t('MSG_TXT_RELT_PRDT_SELT')"
            @click="onClickSearchReltPrdt"
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
        <!-- 연계주문번호 -->
        <kw-form-item :label="$t('MSG_TXT_CONN')+$t('MSG_TXT_ORD_NO')">
          <kw-input
            v-model="frmMainData.alncmpCntrDrmVal"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 제휴상태 -->
        <kw-form-item :label="$t('MSG_TXT_ALNC_STAT')">
          <kw-input
            v-model="frmMainData.alncStatTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 제휴파트너 -->
        <kw-form-item :label="$t('MSG_TXT_ALNC_PRTNR')">
          <kw-input
            v-model="frmMainData.alncmpPrtnrNo"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 백점이 여부 -->
        <kw-form-item :label="$t('MSG_TXT_HDDM_YN')">
          <kw-input
            v-model="frmMainData.lcetc6"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 행사코드 -->
        <kw-form-item
          :label="$t('MSG_TXT_EV_CD')"
          :colspan="2"
        >
          <!-- 행사코드 -->
          <kw-input
            v-model="frmMainData.sellEvCd"
            placeholder=""
            readonly
          />
          <!-- 행사코드명 -->
          <kw-input
            v-model="frmMainData.sellEvNm"
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
    <kw-action-top class="mb20">
      <template #left>
        <!-- 부가정보 -->
        <h3 class="mb20">
          {{ $t('MSG_TXT_ADN_INF') }}
        </h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">(단위:원,개월)</span>
    </kw-action-top>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 명의변경구분 -->
        <kw-form-item :label="$t('MSG_TXT_TFTL_DV')">
          <kw-input
            v-model="frmMainData.cntrChDtlRsonCd"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 기기변경여부 -->
        <kw-form-item :label="$t('MSG_TXT_MCHN_CH_YN')">
          <kw-input
            v-model="frmMainData.mchnChYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 재약정 여부 -->
        <kw-form-item :label="$t('MSG_TXT_RECOMMITMENT')">
          <kw-input
            v-model="frmMainData.rstlYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 제품교체이전차월 -->
        <kw-form-item :label="$t('MSG_TXT_PDCT_CHNG_PREV_NMN')">
          <kw-input
            v-model="frmMainData.pdChBfNmnN"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 부가서비스 여부 -->
        <kw-form-item :label="$t('MSG_TXT_ADN_SV_YN')">
          <kw-input
            v-model="frmMainData.adnSvYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 선납 적용구분 -->
        <kw-form-item :label="$t('MSG_TXT_PRM_APY_DV')">
          <kw-input
            v-model="frmMainData.prmApyDvCd"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 포인트몰지급금액 -->
        <kw-form-item :label="$t('MSG_TXT_PNT_MALL_DSB_AMT')">
          <kw-input
            v-model="frmMainData.lcet15"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 빨간펜포인트 적용일 -->
        <kw-form-item :label="$t('MSG_TXT_RDP')+$t('MSG_TXT_POINT_APPLY_DT')">
          <kw-input
            v-model="frmMainData.lcrpmn"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 빨간펜포인트 적용금액 -->
        <kw-form-item :label="$t('MSG_TXT_RDP_PNT_APY_AMT')">
          <kw-input
            v-model="frmMainData.lcrpam"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 이체정보 -->
        <kw-form-item :label="$t('MSG_TXT_FNT_INF')">
          <!-- 이체정보 자동이체-->
          <kw-input
            v-model="frmMainData.mpyMthdTpNm"
            placeholder=""
            readonly
          />
          <!-- 이체정보 은행/카드사-->
          <kw-input
            v-model="frmMainData.stlmFnit"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 계좌/카드번호 -->
        <kw-form-item :label="$t('MSG_TXT_AC_CDNO')">
          <kw-input
            v-model="frmMainData.aftnInf"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 예금/카드주 명 -->
        <kw-form-item :label="$t('MSG_TXT_ACHLDR_CDONR_NM')">
          <kw-input
            v-model="frmMainData.aftnOwrKnm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 이체일 -->
        <kw-form-item :label="$t('MSG_TXT_FTD')">
          <kw-input
            v-model="frmMainData.mpyBsdt"
            align="right"
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
        <!-- 의뢰일 -->
        <kw-form-item :label="$t('MSG_TXT_REQ_DT')">
          <kw-input
            v-model="frmMainData.vstRqdt"
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
        <!-- 예정일 -->
        <kw-form-item :label="$t('MSG_TXT_DUEDT')">
          <kw-input
            v-model="frmMainData.sppDuedt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 설치일 -->
        <kw-form-item :label="$t('MSG_TXT_INST_DT')">
          <kw-input
            v-model="frmMainData.istDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 철거요청일 -->
        <kw-form-item :label="$t('MSG_TXT_REQD_RQDT')">
          <kw-input
            v-model="frmMainData.pdctReqdRqdt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 철거일 -->
        <kw-form-item :label="$t('MSG_TXT_REQD_D')">
          <kw-input
            v-model="frmMainData.lcremy"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 취소일 -->
        <kw-form-item :label="$t('MSG_TXT_CAN_D')">
          <kw-input
            v-model="frmMainData.lccany"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 무료체험여부 -->
        <kw-form-item :label="$t('MSG_TXT_FRE_EXPN_YN')">
          <kw-input
            v-model="frmMainData.frisuYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 체험일 -->
        <kw-form-item :label="$t('MSG_TXT_EXPN_DT')">
          <kw-input
            v-model="frmMainData.freExpnCnfmStrtdt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 체험확정여부 -->
        <kw-form-item :label="$t('MSG_TXT_EXPN_DTRM_YN')">
          <kw-input
            v-model="frmMainData.freExpnCnfmYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 체험확정일 -->
        <kw-form-item :label="$t('MSG_TXT_EXPN_DTRM_DT')">
          <kw-input
            v-model="frmMainData.freExpnCnfmDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 만료일 -->
        <kw-form-item :label="$t('MSG_TXT_EXP_DT')">
          <kw-input
            v-model="frmMainData.cntrPdEnddt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 만료회수일 -->
        <kw-form-item :label="$t('MSG_TXT_EXN_CLN_DT')">
          <kw-input
            v-model="frmMainData.exnReqdDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <!-- 실적사항 -->
        <h3 class="mb20">
          {{ $t('MSG_TXT_PERF_ARTC') }}
        </h3>
      </template>
      <span class="kw-fc--black3 text-weight-regular">(단위:월)</span>
    </kw-action-top>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 인정률(%) -->
        <kw-form-item
          :label="$t('MSG_TXT_ACKMT_RAT')"
        >
          <kw-input
            v-model="frmMainData.ackmtPerfRt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 인정금액 -->
        <kw-form-item
          :label="$t('MSG_TXT_RECOG_AMT')"
        >
          <kw-input
            v-model="frmMainData.ackmtPerfAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 인정건수 -->
        <kw-form-item
          :label="$t('MSG_TXT_PD_ACC_CNT')"
        >
          <kw-input
            v-model="frmMainData.ackmtPerfCt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 예약여부 -->
        <kw-form-item
          :label="$t('MSG_TXT_RSV_YN')"
        >
          <kw-input
            v-model="frmMainData.booSellYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 수수료정액여부 -->
        <kw-form-item :label="$t('MSG_TXT_PD_FEE_FIX')">
          <kw-input
            v-model="frmMainData.feeFxamYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 수수료기준금액 -->
        <kw-form-item :label="$t('MSG_TXT_FEE_BASE_AMT')">
          <kw-input
            v-model="frmMainData.feeAckmtBaseAmt"
            align="right"
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
        <!-- 참고사항 -->
        <kw-form-item
          :label="$t('MSG_TXT_REFER_ARTC')"
          :colspan="2"
        >
          <kw-input
            v-model="frmMainData.istAkArtcMoCn"
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
        <!-- 컨택업체 -->
        <kw-form-item :label="$t('MSG_TXT_CTT_BZS')">
          <kw-input
            v-model="frmMainData.lcpgubNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 고객생년(YY) -->
        <kw-form-item :label="$t('MSG_TXT_CST_BRYY')">
          <kw-input
            v-model="frmMainData.bryy"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 마케팅 동의 -->
        <kw-form-item :label="$t('MSG_TXT_MAKT_AG')">
          <kw-input
            v-model="frmMainData.z13Yn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 제3자동의 -->
        <kw-form-item :label="$t('MSG_TXT_THP_AG')">
          <kw-input
            v-model="frmMainData.z15Yn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 제3자동의(피버) -->
        <kw-form-item :label="$t('MSG_TXT_THP_AG_FEV')">
          <kw-input
            v-model="frmMainData.w22Yn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 정보수집 동의 -->
        <kw-form-item :label="$t('MSG_TXT_INF_CLCT_AG')">
          <kw-input
            v-model="frmMainData.z11Yn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 설치사항 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_INST_ARTC') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 의뢰구분 -->
        <kw-form-item :label="$t('MSG_TXT_REQ_DV')">
          <kw-input
            v-model="frmMainData.sppMthdTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 사용전력 -->
        <kw-form-item :label="$t('MSG_TXT_USE_ELECT')">
          <kw-input
            v-model="frmMainData.useElectTpCd"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 수압유무 -->
        <kw-form-item :label="$t('MSG_TXT_WPRS_YN')">
          <kw-input
            v-model="frmMainData.wprsItstTpNm"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 수질구분 -->
        <kw-form-item :label="$t('MSG_TXT_WAT_QTY_DV')">
          <kw-input
            v-model="frmMainData.srcwtTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 수질검사 -->
        <kw-form-item :label="$t('MSG_TXT_WAT_QTY_INSP')">
          <kw-input
            v-model="frmMainData.wtqltyTstYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 설치장소 -->
        <kw-form-item :label="$t('MSG_TXT_INST_PLAC')">
          <kw-input
            v-model="frmMainData.lcchk8"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 설치옵션 -->
        <kw-form-item :label="$t('MSG_TXT_INST_OPT')">
          <kw-input
            v-model="frmMainData.wrfrIstMthNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 무상복구사용 -->
        <kw-form-item :label="$t('MSG_TXT_FRISU_RCVRY_USE')">
          <kw-input
            v-model="frmMainData.frisuRcvryTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 운송장 번호 -->
        <kw-form-item :label="$t('MSG_TXT_WAYBILL_NO')">
          <kw-input
            v-model="frmMainData.sppOrdNo"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- SN번호 -->
        <kw-form-item :label="$t('MSG_TXT_SN_NO')">
          <kw-input
            v-model="frmMainData.pdctIdno"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 사은품 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_FGPT') }}
    </h3>
    <kw-form :cols="2">
      <kw-form-row>
        <!-- 1. 상품코드/상품명/수량 -->
        <kw-form-item :label="'1.'+$t('MSG_TXT_PRDT_CODE')+'/'+$t('MSG_TXT_PRDT_NM')+'/'+$t('MSG_TXT_QTY')">
          <!-- 상품코드 -->
          <kw-input
            v-model="frmMainData.fgpt1PdCd"
            placeholder=""
            readonly
          />
          <!-- 상품명 -->
          <kw-input
            v-model="frmMainData.fgpt1PdNm"
            placeholder=""
            readonly
          />
          <!-- 수량 -->
          <kw-input
            v-model="frmMainData.fgpt1Qty"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 2. 상품코드/상품명/수량 -->
        <kw-form-item :label="'2.'+$t('MSG_TXT_PRDT_CODE')+'/'+$t('MSG_TXT_PRDT_NM')+'/'+$t('MSG_TXT_QTY')">
          <!-- 상품코드 -->
          <kw-input
            v-model="frmMainData.fgpt2PdCd"
            placeholder=""
            readonly
          />
          <!-- 상품명 -->
          <kw-input
            v-model="frmMainData.fgpt2PdNm"
            placeholder=""
            readonly
          />
          <!-- 수량 -->
          <kw-input
            v-model="frmMainData.fgpt2Qty"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 3. 상품코드/상품명/수량 -->
        <kw-form-item :label="'3.'+$t('MSG_TXT_PRDT_CODE')+'/'+$t('MSG_TXT_PRDT_NM')+'/'+$t('MSG_TXT_QTY')">
          <!-- 상품코드 -->
          <kw-input
            v-model="frmMainData.fgpt3PdCd"
            placeholder=""
            readonly
          />
          <!-- 상품명 -->
          <kw-input
            v-model="frmMainData.fgpt3PdNm"
            placeholder=""
            readonly
          />
          <!-- 수량 -->
          <kw-input
            v-model="frmMainData.fgpt3Qty"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 4. 상품코드/상품명/수량 -->
        <kw-form-item :label="'4.'+$t('MSG_TXT_PRDT_CODE')+'/'+$t('MSG_TXT_PRDT_NM')+'/'+$t('MSG_TXT_QTY')">
          <!-- 상품코드 -->
          <kw-input
            v-model="frmMainData.fgpt4PdCd"
            placeholder=""
            readonly
          />
          <!-- 상품명 -->
          <kw-input
            v-model="frmMainData.fgpt4PdNm"
            placeholder=""
            readonly
          />
          <!-- 수량 -->
          <kw-input
            v-model="frmMainData.fgpt4Qty"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 5. 상품코드/상품명/수량 -->
        <kw-form-item :label="'5.'+$t('MSG_TXT_PRDT_CODE')+'/'+$t('MSG_TXT_PRDT_NM')+'/'+$t('MSG_TXT_QTY')">
          <!-- 상품코드 -->
          <kw-input
            v-model="frmMainData.fgpt5PdCd"
            placeholder=""
            readonly
          />
          <!-- 상품명 -->
          <kw-input
            v-model="frmMainData.fgpt5PdNm"
            placeholder=""
            readonly
          />
          <!-- 수량 -->
          <kw-input
            v-model="frmMainData.fgpt5Qty"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 6. 상품코드/상품명/수량 -->
        <kw-form-item :label="'6.'+$t('MSG_TXT_PRDT_CODE')+'/'+$t('MSG_TXT_PRDT_NM')+'/'+$t('MSG_TXT_QTY')">
          <!-- 상품코드 -->
          <kw-input
            v-model="frmMainData.fgpt6PdCd"
            placeholder=""
            readonly
          />
          <!-- 상품명 -->
          <kw-input
            v-model="frmMainData.fgpt6PdNm"
            placeholder=""
            readonly
          />
          <!-- 수량 -->
          <kw-input
            v-model="frmMainData.fgpt6Qty"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 7. 상품코드/상품명/수량 -->
        <kw-form-item :label="'7.'+$t('MSG_TXT_PRDT_CODE')+'/'+$t('MSG_TXT_PRDT_NM')+'/'+$t('MSG_TXT_QTY')">
          <!-- 상품코드 -->
          <kw-input
            v-model="frmMainData.fgpt7PdCd"
            placeholder=""
            readonly
          />
          <!-- 상품명 -->
          <kw-input
            v-model="frmMainData.fgpt7PdNm"
            placeholder=""
            readonly
          />
          <!-- 수량 -->
          <kw-input
            v-model="frmMainData.fgpt7Qty"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 8. 상품코드/상품명/수량 -->
        <kw-form-item :label="'8.'+$t('MSG_TXT_PRDT_CODE')+'/'+$t('MSG_TXT_PRDT_NM')+'/'+$t('MSG_TXT_QTY')">
          <!-- 상품코드 -->
          <kw-input
            v-model="frmMainData.fgpt8PdCd"
            placeholder=""
            readonly
          />
          <!-- 상품명 -->
          <kw-input
            v-model="frmMainData.fgpt8PdNm"
            placeholder=""
            readonly
          />
          <!-- 수량 -->
          <kw-input
            v-model="frmMainData.fgpt8Qty"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row
        :cols="4"
      >
        <!-- 송장출력일 -->
        <kw-form-item
          :label="$t('MSG_TXT_IVC_PRNT_DT')"
          :colspan="1"
        >
          <kw-input
            v-model="frmMainData.lcrept"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 선물선택 -->
        <kw-form-item :label="$t('MSG_TXT_GIFT_SELT')">
          <!-- 선물선택 코드 -->
          <kw-input
            v-model="frmMainData.lcck06"
            placeholder=""
            readonly
          />
          <!-- 선물선택 코드명 -->
          <kw-input
            v-model="frmMainData.lcck06Nm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
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
import { useDataService, useGlobal, useModal, codeUtil, stringUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { alert, modal } = useGlobal();
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
  levels: '', // 등급구분
  cntrCstNo: '', // 고객번호
  safekey: '', // 세이프키(SAFE-KEY)
  sellInflwChnlDtlNm: '', // 주문구분
  copnDvNm: '', // 고객구분
  alncPrtnrDrmDvCd: '', // 조직구분
  alncPrtnrDrmDvNm: '', // 조직구분명
  cntrtRelNm: '', // 관계구분
  lcck07: '', // 주문입력구분
  dgr3LevlOgId: '', // 조직코드
  dgr3LevlDgPrtnrNo: '', // 지점 - 지점장
  dgr3LevlDgPrtnrNm: '', // 지점 - 지점장명
  ftfDvCd: '', // 총판대면
  lcet10: '', // 직원 판매유형
  sellPrtnrNo: '', // 파트너-번호
  prtnrKnm: '', // 파트너-이름
  sellPrtnrCralTno: '', // 파트너 휴대전화번호
  cralLocaraTno: '', // 파트너 휴대지역전화번호
  mexnoEncr: '', // 파트너 휴대전화국번호암호화
  cralIdvTno: '', // 파트너 휴대개별전화번호
  fstRgstDt: '', // 등록일시-일자
  fstRgstTm: '', // 등록일시-시간
  fstRgstUsrId: '', // 업무담당
  fstRgstUsrNm: '', // 업무담당 명
  fstRgstPrgId: '', // 등록프로그램
  cstKnm: '', // 계약자 명
  bryyBzrno: '', // 사업자등록/주민번호
  cntrCralTno: '', // 계약자 휴대전화번호
  cntrCralLocaraTno: '', // 계약자 휴대지역전화번호
  cntrMexnoEncr: '', // 계약자 휴대전화국번호암호화
  cntrCralIdvTno: '', // 계약자 휴대개별전화번호
  adrZip: '', // 계약자 우편번호
  cntrCstRnadr: '', // 계약자 주소(기준주소)
  cntrCstRdadr: '', // 계약자 주소(상세주소)
  rcgvpKnm: '', // 설치정보-설치자명
  istCralTno: '', // 설치자 휴대전화번호
  istCralLocaraTno: '', // 설치자 휴대지역전화번호
  istMexnoEncr: '', // 설치자 휴대전화국번호암호화
  istCralIdvTno: '', // 설치자 휴대개별전화번호
  istAkDt: '', // 설치 요청일
  istAdrZip: '', // 설치처 우편번호
  istRnadr: '', // 설치자 주소(기준주소)
  istRdadr: '', // 설치자 주소(상세주소)
  pdClsfNm: '', // 상품 분류
  pdTpNm: '', // 상품유형
  basePdCd: '', // 상품코드
  pdNm: '', // 상품명
  pdQty: '', // 수량
  cntrAmt: '', // 렌탈 등록비
  cntrPtrm: '', // 렌탈기간
  rentalTam: '', // 렌탈 총금액(원)
  cntrTam: '', // 계약 총금액(원)
  fnlPdCd: '', // 총판매제품
  fnlPdNm: '', // 최종판매제품 명
  rentalPtrm: '', // 렌탈기간1(개월)
  rentalAmt1: '', // 렌탈료1(원)
  rentalPtrm2: '', // 렌탈기간2(개월)
  rentalAmt2: '', // 렌탈료2
  cntrCtrAmt: '', // 등록할인(원)
  ctrVal: '', // 렌탈할인1
  rentalDscAmt2: '', // 렌탈할인2
  recapDutyPtrmN: '', // 의무기간
  leaseDvNm: '', // 렌탈/리스 구분
  sellDscDvCd: '', // 할인적용구분
  sellDscDvNm: '', // 할인적용구분명
  sellDscTpCd: '', // 할인적용상세
  sellDscTpNm: '', // 할인적용상세명
  dscPmotCd: '', // 할인제도
  svPrdInfo: '', // 관리/방문/택배 주기
  lcetc7: '', // 기변 여부
  ojCntrDtlNo: '', // 기변 상대코드
  bogoCd: '', // 1+1 연계코드
  bogoPdCd: '', // 1+1 이전상품
  bogoPdNm: '', // 1+1 이전상품명
  ojBasePdCd: '', // 기변이전상품
  ojPdNm: '', // 기변이전상품명
  mchnChTpCd: '', // 기변유형코드
  mchnChTpNm: '', // 기변유형코드명
  mchnCpspApyr: '', // 기변 실적율(%)
  combiNm: '', // 결합구분
  stplDscAmt: '', // 재약정할인
  rentalDscDfam: '', // 정상차액
  svTpNm: '', // 용도구분
  svAmt: '', // 서비스료
  pmotCd: '', // 프로모션번호
  pmotTpNm: '', // 프로모션유형
  pmotFvrMcn: '', // 프로모션 할인개월
  pmotFvrAmt: '', // 프로모션 할인금액
  frisuBfsvcPtrmN: '', // 프로모션 무료개월
  lcflg3: '', // 설치월 면제
  connPdView: '', // 연관상품조회
  alncmpCntrDrmVal: '', // 연계주문번호
  alncStatTpNm: '', // 제휴상태
  alncmpPrtnrNo: '', // 제휴 파트너
  lcetc6: '', // 백점이 여부
  sellEvCd: '', // 행사코드
  sellEvNm: '', // 행사코드명
  alncmpCd: '', // 제휴업체코드
  alncmpNm: '', // 제휴업체코드명
  cntrChDtlRsonCd: '', // 명의변경구분
  mchnChYn: '', // 기기변경여부
  rstlYn: '', // 재약정 여부
  pdChBfNmnN: '', // 제품교체이전 차월
  adnSvYn: '', // 부가서비스 여부
  prmApyDvCd: '', // 선납 적용구분
  lcet15: '', // 포인트몰 지급금액
  lcrpmn: '', // 빨간펜포인트 적용일
  lcrpam: '', // 빨간펜 포인트 적용금액
  mpyMthdTpNm: '', // 이체정보-자동이체
  stlmFnit: '', // 이체정보-결제금융기관
  aftnInf: '', // 이체정보-카드/계좌
  aftnOwrKnm: '', // 예금/카드주 명
  mpyBsdt: '', // 이체일
  cntrRcpFshDt: '', // 접수일
  vstRqdt: '', // 의뢰일
  slDt: '', // 매출일
  sppDuedt: '', // 예정일
  istDt: '', // 설치일
  pdctReqdRqdt: '', // 철거요청일
  lcremy: '', // 철거일
  lccany: '', // 취소일
  frisuYn: '', // 무료체험 여부
  freExpnCnfmStrtdt: '', // 체험일
  freExpnCnfmYn: '', // 체험확정 여부
  freExpnCnfmDt: '', // 체험확정일
  cntrPdEnddt: '', // 만료일
  exnReqdDt: '', // 만료회수일
  ackmtPerfRt: '', // 인정률(%)
  ackmtPerfAmt: '', // 인정금액
  ackmtPerfCt: '', // 인정건수
  booSellYn: '', // 예약여부
  feeFxamYn: '', // 수수료정액여부
  feeAckmtBaseAmt: '', // 수수료기준금액
  istAkArtcMoCn: '', // 참고사항
  sconCn: '', // 특약내용
  cttRsCd: '', // 컨택코드
  cttRsNm: '', // 컨택내용
  lcpgubNm: '', // 컨택업체
  bryy: '', // 고객생년(YY)
  z13Yn: '', // 마케팅 동의
  z15Yn: '', // 제3자동의
  w22Yn: '', // 제3자동의(피버)
  z11Yn: '', // 정보수집 동의
  sppMthdTpNm: '', // 의뢰구분
  useElectTpCd: '', // 사용전력
  wprsItstTpNm: '', // 수압유무
  srcwtTpNm: '', // 수질구분
  wtqltyTstYn: '', // 수질검사
  lcchk8: '', // 설치장소
  wrfrIstMthNm: '', // 설치옵션
  frisuRcvryTpNm: '', // 무상복구사용
  sppOrdNo: '', // 운송장 번호
  pdctIdno: '', // S N 번호
  fgpt1PdCd: '', // 1.상품코드
  fgpt1PdNm: '', // 1.상품명
  fgpt1Qty: '', // 1.수량
  fgpt2PdCd: '', // 2.상품코드
  fgpt2PdNm: '', // 2.상품명
  fgpt2Qty: '', // 2.수량
  fgpt3PdCd: '', // 3.상품코드
  fgpt3PdNm: '', // 3.상품명
  fgpt3Qty: '', // 3.수량
  fgpt4PdCd: '', // 4.상품코드
  fgpt4PdNm: '', // 4.상품명
  fgpt4Qty: '', // 4.수량
  fgpt5PdCd: '', // 5.상품코드
  fgpt5PdNm: '', // 5.상품명
  fgpt5Qty: '', // 6.수량
  fgpt6PdCd: '', // 6.상품코드
  fgpt6PdNm: '', // 6.상품명
  fgpt6Qty: '', // 6.수량
  fgpt7PdCd: '', // 7.상품코드
  fgpt7PdNm: '', // 7.상품명
  fgpt7Qty: '', // 7.수량
  fgpt8PdCd: '', // 8.상품코드
  fgpt8PdNm: '', // 8.상품명
  fgpt8Qty: '', // 8.수량
  lcrept: '', // 송장출력일
  lcck06: '', // 선물선택 코드
  lcck06Nm: '', // 선물선택 코드명
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function onClickSearchReltPrdt() {
  const paramCntrNo = String(frmMainData.value.cntrDtlNo).split('-')[0];
  const paramCntrSn = String(frmMainData.value.cntrDtlNo).split('-')[1];

  await modal({
    component: 'WwctaLinkProductListP',
    componentProps: { cntrNo: paramCntrNo, cntrSn: paramCntrSn },
  });
}

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  res = await dataService.post('/sms/wells/contract/contracts/order-detail-mngt/rentals/paging', { ...cachedParams, ...pageInfo.value });

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
    frmMainData.value.levels = pages[0].levels; // 등급구분
    frmMainData.value.cntrCstNo = pages[0].cntrCstNo; // 고객번호
    frmMainData.value.safekey = pages[0].safekey; // 세이프키(SAFE-KEY)
    frmMainData.value.sellInflwChnlDtlNm = pages[0].sellInflwChnlDtlNm; // 주문구분
    frmMainData.value.copnDvNm = pages[0].copnDvNm; // 고객구분
    frmMainData.value.alncPrtnrDrmDvCd = pages[0].alncPrtnrDrmDvCd; // 조직구분
    frmMainData.value.alncPrtnrDrmDvNm = pages[0].alncPrtnrDrmDvNm; // 조직구분명
    frmMainData.value.cntrtRelNm = pages[0].cntrtRelNm; // 관계구분
    frmMainData.value.lcck07 = pages[0].lcck07; // 주문입력구분
    frmMainData.value.dgr3LevlOgId = pages[0].dgr3LevlOgId; // 조직코드
    frmMainData.value.dgr3LevlDgPrtnrNo = pages[0].dgr3LevlDgPrtnrNo; // 지점 - 지점장
    frmMainData.value.dgr3LevlDgPrtnrNm = pages[0].dgr3LevlDgPrtnrNm; // 지점 - 지점장명
    frmMainData.value.ftfDvCd = pages[0].ftfDvCd; // 총판대면
    frmMainData.value.lcet10 = pages[0].lcet10; // 직원 판매유형
    frmMainData.value.sellPrtnrNo = pages[0].sellPrtnrNo; // 파트너-번호
    frmMainData.value.prtnrKnm = pages[0].prtnrKnm; // 파트너-이름
    const { cralLocaraTno } = pages[0];
    const { mexnoEncr } = pages[0];
    const { cralIdvTno } = pages[0];
    frmMainData.value.sellPrtnrCralTno = !isEmpty(cralLocaraTno) && !isEmpty(mexnoEncr) && !isEmpty(cralIdvTno) ? `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}` : ''; // 파트너-휴대전화번호
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
      frmMainData.value.bryyBzrno = stringUtil.getDateFormat(pages[0].bryyBzrno);
    } else if (pages[0].copnDvCd === '2') { // 사업자등록번호
      // 사업자등록번호 3-2-5 형식으로 표시
      if (!isEmpty(pages[0].bryyBzrno) && pages[0].bryyBzrno.length === 10) {
        frmMainData.value.bryyBzrno = `${pages[0].bryyBzrno.substr(0, 3)}-${pages[0].bryyBzrno.substr(3, 2)}-${pages[0].bryyBzrno.substr(5, 5)}`;
      }
    }
    const { cntrCralLocaraTno } = pages[0];
    const { cntrMexnoEncr } = pages[0];
    const { cntrCralIdvTno } = pages[0];
    frmMainData.value.cntrCralTno = !isEmpty(cntrCralLocaraTno) && !isEmpty(cntrMexnoEncr) && !isEmpty(cntrCralIdvTno) ? `${cntrCralLocaraTno}-${cntrMexnoEncr}-${cntrCralIdvTno}` : ''; // 계약자-휴대전화번호
    frmMainData.value.adrZip = pages[0].adrZip; // 계약자 우편번호
    frmMainData.value.cntrCstRnadr = pages[0].cntrCstRnadr; // 계약자 주소(기준주소)
    frmMainData.value.cntrCstRdadr = pages[0].cntrCstRdadr; // 계약자 주소(상세주소)
    // -------------------------------------------------------------------------------------------------
    // 설치처 정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.rcgvpKnm = pages[0].rcgvpKnm; // 설치정보-설치자명
    const { istCralLocaraTno, istMexnoEncr, istCralIdvTno } = pages[0]; // 설치자 휴대지역전화번호
    if (!isEmpty(istCralLocaraTno) && isEmpty(istMexnoEncr) && !isEmpty(istCralIdvTno)) {
      frmMainData.value.istCralTno = `${istCralLocaraTno}--${istCralIdvTno}`;
    } else {
      frmMainData.value.istCralTno = isEmpty(istCralLocaraTno) && isEmpty(istMexnoEncr) && isEmpty(istCralIdvTno) ? '' : `${istCralLocaraTno}-${istMexnoEncr}-${istCralIdvTno}`; // 설치(배송정보) 휴대전화번호
    }
    frmMainData.value.istAkDt = pages[0].istAkDt; // 설치 요청일
    frmMainData.value.istAdrZip = pages[0].istAdrZip; // 설치처 우편번호
    frmMainData.value.istRnadr = pages[0].istRnadr; // 설치자 주소(기준주소)
    frmMainData.value.istRdadr = pages[0].istRdadr; // 설치자 주소(상세주소)
    // -------------------------------------------------------------------------------------------------
    // 상품 정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.pdClsfNm = pages[0].pdClsfNm; // 상품 분류
    frmMainData.value.pdTpNm = pages[0].pdTpNm; // 상품유형
    frmMainData.value.basePdCd = pages[0].basePdCd; // 상품코드
    frmMainData.value.pdNm = pages[0].pdNm; // 상품명
    frmMainData.value.pdQty = pages[0].pdQty; // 수량
    frmMainData.value.cntrAmt = stringUtil.getNumberWithComma(Number(pages[0].cntrAmt), 0); // 렌탈 등록비
    frmMainData.value.cntrPtrm = pages[0].cntrPtrm; // 렌탈기간
    frmMainData.value.rentalTam = stringUtil.getNumberWithComma(Number(pages[0].rentalTam), 0); // 렌탈 총금액(원)
    frmMainData.value.cntrTam = stringUtil.getNumberWithComma(Number(pages[0].cntrTam), 0); // 계약 총금액(원)
    frmMainData.value.fnlPdCd = pages[0].fnlPdCd; // 총판매제품
    frmMainData.value.fnlPdNm = pages[0].fnlPdNm; // 최종판매제품 명
    frmMainData.value.rentalPtrm = pages[0].rentalPtrm; // 렌탈기간1(개월)
    frmMainData.value.rentalAmt1 = stringUtil.getNumberWithComma(Number(pages[0].rentalAmt1), 0); // 렌탈료1(원)
    frmMainData.value.rentalPtrm2 = pages[0].rentalPtrm2; // 렌탈기간2(개월)
    frmMainData.value.rentalAmt2 = stringUtil.getNumberWithComma(Number(pages[0].rentalAmt2), 0); // 렌탈료2
    frmMainData.value.cntrCtrAmt = stringUtil.getNumberWithComma(Number(pages[0].cntrCtrAmt), 0); // 등록할인(원)
    frmMainData.value.ctrVal = pages[0].ctrVal; // 렌탈할인1
    frmMainData.value.rentalDscAmt2 = pages[0].rentalDscAmt2; // 렌탈할인2
    frmMainData.value.recapDutyPtrmN = pages[0].recapDutyPtrmN; // 의무기간
    frmMainData.value.leaseDvNm = pages[0].leaseDvNm; // 렌탈/리스 구분
    frmMainData.value.sellDscDvCd = pages[0].sellDscDvCd; // 할인적용구분
    frmMainData.value.sellDscDvNm = pages[0].sellDscDvNm; // 할인적용구분명
    frmMainData.value.sellDscTpCd = pages[0].sellDscTpCd; // 할인적용상세
    frmMainData.value.sellDscTpNm = pages[0].sellDscTpNm; // 할인적용상세명
    frmMainData.value.dscPmotCd = pages[0].dscPmotCd; // 할인제도
    frmMainData.value.svPrdInfo = pages[0].svPrdInfo; // 관리/방문/택배 주기
    frmMainData.value.lcetc7 = pages[0].lcetc7; // 기변 여부
    frmMainData.value.ojCntrDtlNo = pages[0].ojCntrDtlNo; // 기변 상대코드
    frmMainData.value.bogoCd = pages[0].bogoCd; // 1+1 연계코드
    frmMainData.value.bogoPdCd = pages[0].bogoPdCd; // 1+1 이전상품
    frmMainData.value.bogoPdNm = pages[0].bogoPdNm; // 1+1 이전상품명
    frmMainData.value.ojBasePdCd = pages[0].ojBasePdCd; // 기변이전상품
    frmMainData.value.ojPdNm = pages[0].ojPdNm; // 기변이전상품명
    frmMainData.value.mchnChTpCd = pages[0].mchnChTpCd; // 기변유형코드
    frmMainData.value.mchnChTpNm = pages[0].mchnChTpNm; // 기변유형코드명
    frmMainData.value.mchnCpspApyr = pages[0].mchnCpspApyr; // 기변 실적율(%)
    frmMainData.value.combiNm = pages[0].combiNm; // 결합구분
    frmMainData.value.stplDscAmt = stringUtil.getNumberWithComma(Number(pages[0].stplDscAmt), 0); // 재약정할인
    frmMainData.value.rentalDscDfam = stringUtil.getNumberWithComma(Number(pages[0].rentalDscDfam), 0); // 정상차액
    frmMainData.value.svTpNm = pages[0].svTpNm; // 용도구분
    frmMainData.value.svAmt = pages[0].svAmt; // 서비스료
    // -------------------------------------------------------------------------------------------------
    // 프로모션
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.pmotCd = pages[0].pmotCd; // 프로모션번호
    frmMainData.value.pmotTpNm = pages[0].pmotTpNm; // 프로모션유형
    frmMainData.value.pmotFvrMcn = pages[0].pmotFvrMcn; // 프로모션 할인개월
    frmMainData.value.pmotFvrAmt = stringUtil.getNumberWithComma(Number(pages[0].pmotFvrAmt), 0); // 프로모션 할인금액
    frmMainData.value.frisuBfsvcPtrmN = pages[0].frisuBfsvcPtrmN; // 프로모션 무료개월
    frmMainData.value.lcflg3 = pages[0].lcflg3; // 설치월 면제
    // -------------------------------------------------------------------------------------------------
    // 제휴정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.alncmpCntrDrmVal = pages[0].alncmpCntrDrmVal; // 연계주문번호
    frmMainData.value.alncStatTpNm = pages[0].alncStatTpNm; // 제휴상태
    frmMainData.value.alncmpPrtnrNo = pages[0].alncmpPrtnrNo; // 제휴 파트너
    frmMainData.value.lcetc6 = pages[0].lcetc6; // 백점이 여부
    frmMainData.value.sellEvCd = pages[0].sellEvCd; // 행사코드
    frmMainData.value.sellEvNm = pages[0].sellEvNm; // 행사코드명
    frmMainData.value.alncmpCd = pages[0].alncmpCd; // 제휴업체코드
    frmMainData.value.alncmpNm = pages[0].alncmpNm; // 제휴업체코드명
    // -------------------------------------------------------------------------------------------------
    // 부가정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.cntrChDtlRsonCd = pages[0].cntrChDtlRsonCd; // 명의변경구분
    frmMainData.value.mchnChYn = pages[0].mchnChYn; // 기기변경여부
    frmMainData.value.rstlYn = pages[0].rstlYn; // 재약정 여부
    frmMainData.value.pdChBfNmnN = pages[0].pdChBfNmnN; // 제품교체이전 차월
    frmMainData.value.adnSvYn = pages[0].adnSvYn; // 부가서비스 여부
    frmMainData.value.prmApyDvCd = pages[0].prmApyDvCd; // 선납 적용구분
    frmMainData.value.lcet15 = stringUtil.getNumberWithComma(Number(pages[0].lcet15), 0); // 포인트몰 지급금액
    frmMainData.value.lcrpmn = pages[0].lcrpmn; // 빨간펜포인트 적용일
    frmMainData.value.lcrpam = stringUtil.getNumberWithComma(Number(pages[0].lcrpam), 0); // 빨간펜포인트 적용금액
    frmMainData.value.mpyMthdTpNm = pages[0].mpyMthdTpNm; // 이체정보-자동이체
    frmMainData.value.stlmFnit = pages[0].stlmFnit; // 이체정보-결제금융기관
    frmMainData.value.aftnInf = pages[0].aftnInf; // 이체정보-카드/계좌
    frmMainData.value.aftnOwrKnm = pages[0].aftnOwrKnm; // 예금/카드주 명
    frmMainData.value.mpyBsdt = pages[0].mpyBsdt; // 이체일
    // -------------------------------------------------------------------------------------------------
    // 처리일
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.cntrRcpFshDt = pages[0].cntrRcpFshDt; // 접수일
    frmMainData.value.vstRqdt = pages[0].vstRqdt; // 의뢰일
    frmMainData.value.slDt = pages[0].slDt; // 매출일
    frmMainData.value.sppDuedt = pages[0].sppDuedt; // 예정일
    frmMainData.value.istDt = pages[0].istDt; // 설치일
    frmMainData.value.pdctReqdRqdt = pages[0].pdctReqdRqdt; // 철거요청일
    frmMainData.value.lcremy = pages[0].lcremy; // 철거일
    frmMainData.value.lccany = pages[0].lccany; // 취소일
    frmMainData.value.frisuYn = pages[0].frisuYn; // 무료체험 여부
    frmMainData.value.freExpnCnfmStrtdt = pages[0].freExpnCnfmStrtdt; // 체험일
    frmMainData.value.freExpnCnfmYn = pages[0].freExpnCnfmYn; // 체험확정 여부
    frmMainData.value.freExpnCnfmDt = pages[0].freExpnCnfmDt; // 체험확정일
    frmMainData.value.cntrPdEnddt = pages[0].cntrPdEnddt; // 만료일
    frmMainData.value.exnReqdDt = pages[0].exnReqdDt; // 만료회수일
    // -------------------------------------------------------------------------------------------------
    // 실적사항
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.ackmtPerfRt = pages[0].ackmtPerfRt; // 인정률(%)
    frmMainData.value.ackmtPerfAmt = stringUtil.getNumberWithComma(Number(pages[0].ackmtPerfAmt), 0); // 인정금액
    frmMainData.value.ackmtPerfCt = pages[0].ackmtPerfCt; // 인정건수
    frmMainData.value.booSellYn = pages[0].booSellYn; // 예약여부
    frmMainData.value.feeFxamYn = pages[0].feeFxamYn; // 수수료정액여부
    frmMainData.value.feeAckmtBaseAmt = stringUtil.getNumberWithComma(Number(pages[0].feeAckmtBaseAmt), 0); // 수수료기준금액
    // -------------------------------------------------------------------------------------------------
    // 참고사항
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.istAkArtcMoCn = pages[0].istAkArtcMoCn; // 참고사항
    frmMainData.value.sconCn = pages[0].sconCn; // 특약내용
    frmMainData.value.cttRsCd = pages[0].cttRsCd; // 컨택코드
    frmMainData.value.cttRsNm = pages[0].cttRsNm; // 컨택내용
    frmMainData.value.lcpgubNm = pages[0].lcpgubNm; // 컨택업체
    frmMainData.value.bryy = pages[0].bryy; // 고객생년(YY)
    frmMainData.value.z13Yn = pages[0].z13Yn; // 마케팅 동의
    frmMainData.value.z15Yn = pages[0].z15Yn; // 제3자동의
    frmMainData.value.w22Yn = pages[0].w22Yn; // 제3자동의(피버)
    frmMainData.value.z11Yn = pages[0].z11Yn; // 정보수집 동의
    // -------------------------------------------------------------------------------------------------
    // 설치사항
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.sppMthdTpNm = pages[0].sppMthdTpNm; // 의뢰구분
    frmMainData.value.useElectTpCd = pages[0].useElectTpCd; // 사용전력
    frmMainData.value.wprsItstTpNm = pages[0].wprsItstTpNm; // 수압유무
    frmMainData.value.srcwtTpNm = pages[0].srcwtTpNm; // 수질구분
    frmMainData.value.wtqltyTstYn = pages[0].wtqltyTstYn; // 수질검사
    frmMainData.value.lcchk8 = pages[0].lcchk8; // 설치장소
    frmMainData.value.wrfrIstMthNm = pages[0].wrfrIstMthNm; // 설치옵션
    frmMainData.value.frisuRcvryTpNm = pages[0].frisuRcvryTpNm; // 무상복구사용
    frmMainData.value.sppOrdNo = pages[0].sppOrdNo; // 운송장 번호
    frmMainData.value.pdctIdno = pages[0].pdctIdno; // S N 번호
    // -------------------------------------------------------------------------------------------------
    // 사은품
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.fgpt1PdCd = pages[0].fgpt1PdCd; // 1.상품코드
    frmMainData.value.fgpt1PdNm = pages[0].fgpt1PdNm; // 1.상품명
    frmMainData.value.fgpt1Qty = pages[0].fgpt1Qty; // 1.수량
    frmMainData.value.fgpt2PdCd = pages[0].fgpt2PdCd; // 2.상품코드
    frmMainData.value.fgpt2PdNm = pages[0].fgpt2PdNm; // 2.상품명
    frmMainData.value.fgpt2Qty = pages[0].fgpt2Qty; // 2.수량
    frmMainData.value.fgpt3PdCd = pages[0].fgpt3PdCd; // 3.상품코드
    frmMainData.value.fgpt3PdNm = pages[0].fgpt3PdNm; // 3.상품명
    frmMainData.value.fgpt3Qty = pages[0].fgpt3Qty; // 3.수량
    frmMainData.value.fgpt4PdCd = pages[0].fgpt4PdCd; // 4.상품코드
    frmMainData.value.fgpt4PdNm = pages[0].fgpt4PdNm; // 4.상품명
    frmMainData.value.fgpt4Qty = pages[0].fgpt4Qty; // 4.수량
    frmMainData.value.fgpt5PdCd = pages[0].fgpt5PdCd; // 5.상품코드
    frmMainData.value.fgpt5PdNm = pages[0].fgpt5PdNm; // 5.상품명
    frmMainData.value.fgpt5Qty = pages[0].fgpt5Qty; // 5.수량
    frmMainData.value.fgpt6PdCd = pages[0].fgpt6PdCd; // 6.상품코드
    frmMainData.value.fgpt6PdNm = pages[0].fgpt6PdNm; // 6.상품명
    frmMainData.value.fgpt6Qty = pages[0].fgpt6Qty; // 6.수량
    frmMainData.value.fgpt7PdCd = pages[0].fgpt7PdCd; // 7.상품코드
    frmMainData.value.fgpt7PdNm = pages[0].fgpt7PdNm; // 7.상품명
    frmMainData.value.fgpt7Qty = pages[0].fgpt7Qty; // 7.수량
    frmMainData.value.fgpt8PdCd = pages[0].fgpt8PdCd; // 8.상품코드
    frmMainData.value.fgpt8PdNm = pages[0].fgpt8PdNm; // 8.상품명
    frmMainData.value.fgpt8Qty = pages[0].fgpt8Qty; // 8.수량
    frmMainData.value.lcrept = pages[0].lcrept; // 송장출력일
    frmMainData.value.lcck06 = pages[0].lcck06; // 선물선택 코드
    frmMainData.value.lcck06Nm = pages[0].lcck06Nm; // 선물선택 코드명
  }
}

onMounted(async () => {
  await fetchData();
});

async function onClickConfirm() {
  cancel();
}
</script>
<style scoped>
</style>
