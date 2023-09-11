<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaOrderMembershipDtlP -멤버쉽 주문정보 상세
3. 작성자 : jihoon.kim
4. 작성일 : 2023.04.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 멤버쉽 주문정보 상세 팝업 화면
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
        <!-- 주문구분 -->
        <kw-form-item :label="$t('MSG_TXT_ORD_DV')">
          <kw-input
            v-model="frmMainData.sellInflwChnlDtlNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 멤버십구분 -->
        <kw-form-item :label="$t('MSG_TXT_MSH_DV')">
          <kw-input
            v-model="frmMainData.mshDvNm"
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
      </kw-form-row>

      <kw-form-row>
        <!-- 등급구분 -->
        <kw-form-item :label="$t('MSG_TXT_GRD_DV')">
          <kw-input
            v-model="frmMainData.levelsnm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 원주문정보 -->
        <kw-form-item :label="$t('MSG_TXT_ORG_ODER_INF')">
          <kw-input
            v-model="frmMainData.ordCnfp"
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
        <!-- 조직코드 -->
        <kw-form-item :label="$t('MSG_TXT_OG_CD')">
          <kw-input
            v-model="frmMainData.dgr3LevlOgId"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
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
        <!-- 접수일 -->
        <kw-form-item :label="$t('MSG_TXT_RCP_D')">
          <kw-input
            v-model="frmMainData.cntrRcpFshDt"
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
      <kw-form-row>
        <!-- 우편 -->
        <kw-form-item :label="$t('MSG_TXT_PSTL')">
          <kw-input
            v-model="frmMainData.cntrwPosndTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 주문 -->
        <kw-form-item :label="$t('MSG_TXT_ODER')">
          <kw-input
            v-model="frmMainData.ordCnfp"
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
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 상품코드/상품명/수량 -->
        <kw-form-item
          :label="$t('MSG_TXT_PRDT_CODE')+'/'+$t('MSG_TXT_PRDT_NM')+'/'+$t('MSG_TXT_QTY')"
          :colspan="2"
        >
          <!-- 상품코드 -->
          <kw-input
            v-model="frmMainData.pdCd"
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
        <!-- 제조사 코드 -->
        <kw-form-item :label="$t('MSG_TXT_MAKER_CD')">
          <kw-input
            v-model="frmMainData.lcjejo"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 분류1 -->
        <kw-form-item :label="$t('MSG_TXT_CLSF')+'1'">
          <kw-input
            v-model="frmMainData.pdLclsfNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 분류2 -->
        <kw-form-item :label="$t('MSG_TXT_CLSF')+'2'">
          <kw-input
            v-model="frmMainData.pdDclsfNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 자동이체 정보 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_AUTO_FNT_INF') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 자동이체 구분 -->
        <kw-form-item :label="$t('MSG_TXT_AUTO_FNT_DV')">
          <kw-input
            v-model="frmMainData.mpyMthdTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 은행/카드사이체일 -->
        <kw-form-item :label="$t('MSG_TXT_BNK_CDCO')+$t('MSG_TXT_FTD')">
          <!-- 은행/카드사 -->
          <kw-input
            v-model="frmMainData.stlmFnit"
            placeholder=""
            readonly
          />
          <!-- 이체일 -->
          <kw-input
            v-model="frmMainData.mpyBsdt"
            mask="####-##-##"
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
        <!-- 카드 유효년월 -->
        <kw-form-item :label="$t('MSG_TXT_CARD')+$t('MSG_TXT_VL_YM')">
          <kw-input
            v-model="frmMainData.cardExpdtYm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 컨택 정보 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_CTT_INF') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 컨택일 -->
        <kw-form-item :label="$t('MSG_TXT_CTT_D')">
          <kw-input
            v-model="frmMainData.cttFshDt"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 컨택담당 -->
        <kw-form-item :label="$t('MSG_TXT_CTT_ICHR')">
          <kw-input
            v-model="frmMainData.cttRsNmUsrId"
            placeholder=""
            readonly
          />
        </kw-form-item>
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
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <!-- 금액정보 -->
        <h3 class="mb20">
          {{ $t('MSG_TXT_AMT_INF') }}
        </h3>
      </template>
      <span>(단위:원)</span>
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
        <!-- 관리주기 -->
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
        <!-- 회비구분 -->
        <kw-form-item :label="$t('MSG_TXT_SSPCS_DV')">
          <kw-input
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 회비 -->
        <kw-form-item :label="$t('MSG_TXT_SSPCS')">
          <kw-input
            v-model="frmMainData.pdBaseAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 납입방법 -->
        <kw-form-item :label="$t('MSG_TXT_PY_MTHD')">
          <kw-input
            v-model="frmMainData.stlmTpNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 할인금액 -->
        <kw-form-item :label="$t('MSG_TXT_DSC_AMT')">
          <kw-input
            v-model="frmMainData.dscAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 세금계산서 -->
        <kw-form-item :label="$t('MSG_TXT_TXINV')">
          <kw-input
            v-model="frmMainData.txinvPblOjYn"
            align="left"
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
    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <!-- 약정정보 -->
        <h3 class="mb20">
          {{ $t('MSG_TXT_STPL_INF') }}
        </h3>
      </template>
      <span>(단위:원)</span>
    </kw-action-top>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 일시불약정여부 -->
        <kw-form-item :label="$t('MSG_TXT_SPAY_STPL_YN')">
          <kw-input
            v-model="frmMainData.feeFxamYn"
            align="left"
            placeholder="Y"
            readonly
          />
        </kw-form-item>
        <!-- 무상고객 여부 -->
        <kw-form-item :label="$t('MSG_TXT_FRISU_CST_YN')">
          <kw-input
            v-model="frmMainData.frisuCstYn"
            align="left"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 약정개월 -->
        <kw-form-item :label="$t('MSG_TXT_STPL_MCNT')">
          <kw-input
            v-model="frmMainData.stplPtrm"
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
      </kw-form-row>
      <kw-form-row>
        <!-- 인정금액(원) -->
        <kw-form-item
          :label="$t('MSG_TXT_RECOG_AMT_KRW')"
        >
          <kw-input
            v-model="frmMainData.ackmtPerfAmt"
            align="right"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- 일자정보 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_DT_INF') }}
    </h3>
    <kw-form :cols="4">
      <kw-form-row>
        <!-- 신청일 -->
        <kw-form-item :label="$t('MSG_TXT_APPL_DATE')">
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
        <!-- 설치일 -->
        <kw-form-item :label="$t('MSG_TXT_INST_DT')">
          <kw-input
            v-model="frmMainData.istDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 가입일 -->
        <kw-form-item :label="$t('MSG_TXT_SUBS_DT')">
          <kw-input
            v-model="frmMainData.cntrTempSaveDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <!-- 확정일 -->
        <kw-form-item :label="$t('MSG_TXT_DTRM_DATE')">
          <kw-input
            v-model="frmMainData.cntrCnfmDt"
            mask="####-##-##"
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
        <!-- 취소일 -->
        <kw-form-item :label="$t('MSG_TXT_CAN_D')">
          <kw-input
            v-model="frmMainData.canDt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 취소유형 -->
        <kw-form-item :label="$t('MSG_TXT_CNCL_TP')">
          <kw-input
            v-model="frmMainData.cntrCanRsonNm"
            placeholder=""
            readonly
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <!-- 탈퇴일 -->
        <kw-form-item :label="$t('MSG_TXT_WTDR_DT')">
          <kw-input
            v-model="frmMainData.cntrPdEnddt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 방문일 -->
        <kw-form-item :label="$t('MSG_TXT_VISIT_DATE')">
          <kw-input
            v-model="frmMainData.vstDuedt"
            mask="####-##-##"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 방문차월 -->
        <kw-form-item :label="$t('MSG_TXT_VST_NMN')">
          <kw-input
            v-model="frmMainData.vstNmnN"
            placeholder=""
            readonly
          />
        </kw-form-item>
        <!-- 방문주기 -->
        <kw-form-item :label="$t('MSG_TXT_VST_PRD')">
          <kw-input
            v-model="frmMainData.svVstPrdCd"
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
  sellInflwChnlDtlNm: '', // 주문구분
  mshDvNm: '', // 멤버십구분
  cntrCstNo: '', // 고객번호
  levelsnm: '', // 등급구분
  ordCnfp: '', // 원주문정보
  sellPrtnrNo: '', // 파트너-번호
  prtnrKnm: '', // 파트너-이름
  dgr3LevlOgId: '', // 조직코드
  dgr3LevlDgPrtnrNo: '', // 지점 - 지점장
  dgr3LevlDgPrtnrNm: '', // 지점 - 지점장명
  cntrRcpFshDt: '', // 접수일
  fstRgstDt: '', // 등록일시-일자
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
  istAdrZip: '', // 설치처 우편번호
  istRnadr: '', // 설치자 주소(기준주소)
  istRdadr: '', // 설치자 주소(상세주소)
  cntrwPosndTpNm: '', // 우편
  pdCd: '', // 상품코드
  pdNm: '', // 상품명
  pdQty: '', // 수량
  lcjejo: '', // 제조사 코드
  pdLclsfNm: '', // 상품분류1
  pdDclsfNm: '', // 상품분류2
  mpyMthdTpNm: '', // 이체정보-자동이체
  stlmFnit: '', // 이체정보-은행/카드사
  mpyBsdt: '', // 이체일
  aftnInf: '', // 이체정보-계좌/카드번호
  cardExpdtYm: '', // 카드 유효년월
  cttFshDt: '', // 컨택일
  cttRsNmUsrId: '', // 컨택담당
  cttRsCd: '', // 컨택코드
  cttRsNm: '', // 컨택내용
  sellDscDvCd: '', // 할인구분-코드
  sellDscDvNm: '', // 할인구분-코드명
  sellDscTpCd: '', // 할인유형-코드명
  sellDscTpNm: '', // 할인유형-코드명
  svPrd: '', // 관리주기
  svTpNm: '', // 용도구분
  pdBaseAmt: '', // 회비
  stlmTpNm: '', // 납입방법
  dscAmt: '', // 할인금액
  txinvPblOjYn: '', // 세금계산서
  sconCn: '', // 특약내용
  feeFxamYn: '', // 일시불 약정여부
  frisuCstYn: '', // 무상고객 여부
  stplPtrm: '', // 약정개월
  ackmtPerfCt: '', // 인정건수
  ackmtPerfAmt: '', // 인정금액(원)
  sppDuedt: '', // 예정일
  istDt: '', // 설치일
  cntrTempSaveDt: '', // 가입일
  cntrCnfmDt: '', // 확정일
  cntrCnfmYn: '', // 확정유무
  canDt: '', // 취소일
  cntrCanRsonNm: '', // 취소유형
  cntrPdEnddt: '', // 탈퇴일
  vstDuedt: '', // 방문일
  vstNmnN: '', // 방문차월
  svVstPrdCd: '', // 방문주기
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  res = await dataService.get('/sms/wells/contract/contracts/order-detail-mngt/membership/paging', { params: { ...cachedParams, ...pageInfo.value } });

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
    frmMainData.value.sellInflwChnlDtlNm = pages[0].sellInflwChnlDtlNm; // 주문구분
    frmMainData.value.mshDvNm = pages[0].mshDvNm; // 멤버십구분
    frmMainData.value.cntrCstNo = pages[0].cntrCstNo; // 고객번호
    frmMainData.value.levelsnm = pages[0].levelsnm; // 등급구분
    frmMainData.value.ordCnfp = pages[0].ordCnfp; // 원주문정보
    frmMainData.value.sellPrtnrNo = pages[0].sellPrtnrNo; // 파트너-번호
    frmMainData.value.prtnrKnm = pages[0].prtnrKnm; // 파트너-이름
    frmMainData.value.dgr3LevlOgId = pages[0].dgr3LevlOgId; // 조직코드
    frmMainData.value.dgr3LevlDgPrtnrNo = pages[0].dgr3LevlDgPrtnrNo; // 지점 - 지점장
    frmMainData.value.dgr3LevlDgPrtnrNm = pages[0].dgr3LevlDgPrtnrNm; // 지점 - 지점장명
    frmMainData.value.cntrRcpFshDt = pages[0].cntrRcpFshDt; // 접수일
    frmMainData.value.alncPrtnrDrmDvCd = pages[0].alncPrtnrDrmDvCd; // 조직구분
    frmMainData.value.alncPrtnrDrmDvNm = pages[0].alncPrtnrDrmDvNm; // 조직구분명
    frmMainData.value.cntrtRelNm = pages[0].cntrtRelNm; // 관계구분
    frmMainData.value.fstRgstDt = pages[0].fstRgstDt; // 등록일시-일자
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
    // 배송처 정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.rcgvpKnm = pages[0].rcgvpKnm; // 설치정보-설치자명
    const { istCralLocaraTno, istMexnoEncr, istCralIdvTno } = pages[0]; // 설치자 휴대지역전화번호
    if (!isEmpty(istCralLocaraTno) && isEmpty(istMexnoEncr) && !isEmpty(istCralIdvTno)) {
      frmMainData.value.istCralTno = `${istCralLocaraTno}--${istCralIdvTno}`;
    } else {
      frmMainData.value.istCralTno = isEmpty(istCralLocaraTno) && isEmpty(istMexnoEncr) && isEmpty(istCralIdvTno) ? '' : `${istCralLocaraTno}-${istMexnoEncr}-${istCralIdvTno}`; // 설치(배송정보) 휴대전화번호
    }
    frmMainData.value.istAdrZip = pages[0].istAdrZip; // 설치처 우편번호
    frmMainData.value.istRnadr = pages[0].istRnadr; // 설치자 주소(기준주소)
    frmMainData.value.istRdadr = pages[0].istRdadr; // 설치자 주소(상세주소)
    frmMainData.value.cntrwPosndTpNm = pages[0].cntrwPosndTpNm; // 우편
    // -------------------------------------------------------------------------------------------------
    // 상품 정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.pdClsfNm = pages[0].pdClsfNm; // 상품 분류
    frmMainData.value.pdCd = pages[0].pdCd; // 상품코드
    frmMainData.value.pdNm = pages[0].pdNm; // 상품명
    frmMainData.value.pdQty = pages[0].pdQty; // 수량
    frmMainData.value.lcjejo = pages[0].lcjejo; // 제조사 코드
    frmMainData.value.pdLclsfNm = pages[0].pdLclsfNm; // 상품분류1
    frmMainData.value.pdDclsfNm = pages[0].pdDclsfNm; // 상품분류2
    // -------------------------------------------------------------------------------------------------
    // 자동이체정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.mpyMthdTpNm = pages[0].mpyMthdTpNm; // 이체정보-자동이체
    frmMainData.value.stlmFnit = pages[0].stlmFnit; // 이체정보-결제금융기관
    frmMainData.value.mpyBsdt = pages[0].mpyBsdt; // 이체일
    frmMainData.value.aftnInf = pages[0].aftnInf; // 이체정보-카드/계좌
    frmMainData.value.cardExpdtYm = pages[0].cardExpdtYm; // 카드 유효년월
    // -------------------------------------------------------------------------------------------------
    // 컨택 정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.cttFshDt = pages[0].cttFshDt; // 컨택일
    frmMainData.value.cttRsNmUsrId = pages[0].cttRsNmUsrId; // 컨택담당
    frmMainData.value.cttRsCd = pages[0].cttRsCd; // 컨택코드
    frmMainData.value.cttRsNm = pages[0].cttRsNm; // 컨택내용
    // -------------------------------------------------------------------------------------------------
    // 금액정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.sellDscDvCd = pages[0].sellDscDvCd; // 할인구분-코드
    frmMainData.value.sellDscDvNm = pages[0].sellDscDvNm; // 할인구분-코드명
    frmMainData.value.sellDscTpCd = pages[0].sellDscTpCd; // 할인유형-코드
    frmMainData.value.sellDscTpNm = pages[0].sellDscTpNm; // 할인유형-코드명
    frmMainData.value.svPrd = pages[0].svPrd; // 관리주기
    frmMainData.value.svTpNm = pages[0].svTpNm; // 용도구분
    frmMainData.value.pdBaseAmt = stringUtil.getNumberWithComma(Number(pages[0].pdBaseAmt), 0); // 회비
    frmMainData.value.stlmTpNm = pages[0].stlmTpNm; // 납입방법
    frmMainData.value.dscAmt = stringUtil.getNumberWithComma(Number(pages[0].dscAmt), 0); // 할인금액
    frmMainData.value.txinvPblOjYn = pages[0].txinvPblOjYn; // 세금계산서
    frmMainData.value.sconCn = pages[0].sconCn; // 특약내용
    // -------------------------------------------------------------------------------------------------
    // 약정정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.feeFxamYn = pages[0].feeFxamYn; // 일시불 약정여부
    frmMainData.value.frisuCstYn = pages[0].frisuCstYn; // 무상고객 여부
    frmMainData.value.stplPtrm = pages[0].stplPtrm; // 약정개월
    frmMainData.value.ackmtPerfCt = pages[0].ackmtPerfCt; // 인정건수
    frmMainData.value.ackmtPerfAmt = stringUtil.getNumberWithComma(Number(pages[0].ackmtPerfAmt), 0); // 인정금액(원)
    // -------------------------------------------------------------------------------------------------
    // 일자정보
    // -------------------------------------------------------------------------------------------------
    frmMainData.value.sppDuedt = pages[0].sppDuedt; // 예정일
    frmMainData.value.istDt = pages[0].istDt; // 설치일
    frmMainData.value.cntrTempSaveDt = pages[0].cntrTempSaveDt; // 가입일
    frmMainData.value.cntrCnfmDt = pages[0].cntrCnfmDt; // 확정일
    frmMainData.value.cntrCnfmYn = pages[0].cntrCnfmYn; // 확정유무
    frmMainData.value.canDt = pages[0].canDt; // 취소일
    frmMainData.value.cntrCanRsonNm = pages[0].cntrCanRsonNm; // 취소유형
    frmMainData.value.cntrPdEnddt = pages[0].cntrPdEnddt; // 탈퇴일
    frmMainData.value.vstDuedt = pages[0].vstDuedt; // 방문일
    frmMainData.value.vstNmnN = pages[0].vstNmnN; // 방문차월
    frmMainData.value.svVstPrdCd = pages[0].svVstPrdCd; // 방문주기
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
