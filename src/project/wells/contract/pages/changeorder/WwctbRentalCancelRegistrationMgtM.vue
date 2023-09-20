<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbRentalCancelRegistrationMgtM - 취소등록 > 렌탈 > 4.매출사항/5.취소사항
3. 작성자 : younuk.choi
4. 작성일 : 2023.07.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 취소등록 메뉴에서 include 하는 페이지
- TODO : OZ 레포트 / 분실손료 계산 / 복구클릭
****************************************************************************************************
--->
<template>
  <kw-list
    separator
    item-padding="20px 0"
  >
    <!-- 2. 계약자 정보 --------------------------------------------------------------------------->
    <kw-expansion-item
      padding-target="header"
      expansion-icon-align="center"
      expand-icon-class="kw-font-pt24"
    >
      <template #header>
        <kw-item-section>
          <kw-item-label>
            <span class="text-weight-medium kw-font-pt18">2. {{ t('MSG_TXT_CNTRT_INF') }}</span>
          </kw-item-label>
        </kw-item-section>
      </template>
      <div class="pb20">
        <kw-form cols="4">
          <kw-form-row>
            <!--고객명-->
            <kw-form-item :label="$t('MSG_TXT_CST_NM')">
              <p>{{ searchDetail.cntrCstKnm }}</p>
            </kw-form-item>
            <!--판매구분-->
            <kw-form-item :label="$t('MSG_TXT_SLS_CAT')">
              <p>{{ searchDetail.cntrGbn }}</p>
            </kw-form-item>
            <!--본부장-->
            <kw-form-item :label="$t('MSG_TXT_GNR_MNG')">
              <p>{{ searchDetail.hooPrtnrNm }}({{ searchDetail.hooPrtnrNo }})</p>
            </kw-form-item>
            <!--소속-->
            <kw-form-item :label="$t('MSG_TXT_BLG')">
              <p>{{ searchDetail.ogCd }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </div>
    </kw-expansion-item>

    <!-- 3. 계약상품 --------------------------------------------------------------------------->
    <kw-expansion-item
      padding-target="header"
      expansion-icon-align="center"
      expand-icon-class="kw-font-pt24"
    >
      <template #header>
        <kw-item-section>
          <kw-item-label>
            <span class="text-weight-medium kw-font-pt18">3. {{ t('MSG_TXT_CNTR_PD') }}</span>
          </kw-item-label>
        </kw-item-section>
      </template>
      <div class="pb20">
        <kw-form cols="4">
          <kw-form-row>
            <!--상품정보-->
            <kw-form-item :label="$t('MSG_TXT_PD_INF')">
              <p>{{ searchDetail.basePdCd }}</p>
            </kw-form-item>
            <!--의무-->
            <kw-form-item :label="$t('MSG_TXT_DUTY')">
              <p>{{ searchDetail.stplPtrm }}</p>
            </kw-form-item>
            <!--계약년월-->
            <kw-form-item :label="$t('MSG_TXT_CNTR_DATE')">
              <p>{{ stringUtil.getDateFormat(searchDetail.cntrCnfmDt) }}</p>
            </kw-form-item>
            <!--매출년월-->
            <kw-form-item :label="$t('MSG_TXT_SL_DT')">
              <p>{{ stringUtil.getDateFormat(searchDetail.cntrPdStrtdt) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!--등록비용-->
            <kw-form-item :label="$t('MSG_TXT_REG_FEE')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.rentalRgstCost??'') }}</p>
            </kw-form-item>
            <!--등록비할인-->
            <kw-form-item :label="$t('MSG_TXT_RGST_COST_DSC')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.cntramDscAmt??'') }}</p>
            </kw-form-item>
            <!--렌탈총액-->
            <kw-form-item :label="$t('MSG_TXT_RNTL_TOTAL')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.cntrTam??'') }}</p>
            </kw-form-item>
            <!--정상렌탈료-->
            <kw-form-item :label="$t('MSG_TXT_NOM')+$t('MSG_TXT_RTLFE')">
              <p>({{ stringUtil.getNumberWithComma(searchDetail.pdBaseAmt??'') }})</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!--렌탈 개월/금액 -->
            <kw-form-item :label="$t('MSG_TXT_RENTAL')+$t('MSG_TXT_MCNT')+'/'+$t('MSG_TXT_AMT')">
              <p>
                {{ searchDetail.cntrPtrm }}개월 /
                {{ stringUtil.getNumberWithComma(searchDetail.fnlAmt??'') }}
              </p>
            </kw-form-item>
            <!--렌탈 DC-->
            <kw-form-item :label="$t('MSG_TXT_RENTAL')+' DC'">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.dscAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!--재약정개월-->
            <kw-form-item :label="$t('MSG_TXT_RSTL')+$t('MSG_TXT_MCNT')">
              <p>{{ searchDetail.rstlPtrm }}</p>
            </kw-form-item>
            <!--재약정할인-->
            <kw-form-item :label="$t('MSG_TXT_RSTL')+$t('MSG_TXT_DSC')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.stplDscAmt??'') }}</p>
            </kw-form-item>
            <!--재약정기간-->
            <kw-form-item :label="$t('MSG_TXT_RSTL')+$t('MSG_TXT_PRD')">
              <p>
                {{ stringUtil.getDateFormat(searchDetail.stplStrtdt) }}
                ~
                {{ stringUtil.getDateFormat(searchDetail.stplEnddt) }}
              </p>
            </kw-form-item>
            <!--계약총액-->
            <kw-form-item
              :label="$t('MSG_TXT_CNTRCT_AMT')"
              hint="=렌탈총액"
            >
              <p>{{ stringUtil.getNumberWithComma(searchDetail.cntrTam??'') }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </div>
    </kw-expansion-item>
  </kw-list>

  <kw-list
    separator
    item-padding="20px 0"
  >
    <!-- 4. 매출사항 --------------------------------------------------------------------------->
    <kw-expansion-item
      padding-target="header"
      expansion-icon-align="center"
      expand-icon-class="kw-font-pt24"
      default-opened
    >
      <template #header>
        <kw-item-section>
          <kw-item-label>
            <span class="text-weight-medium kw-font-pt18">4. {{ t('MSG_TXT_SL_ARTC') }}</span>
          </kw-item-label>
        </kw-item-section>
      </template>
      <div class="pb20">
        <kw-form cols="4">
          <kw-form-row>
            <!-- row1 정상매출 -->
            <kw-form-item :label="$t('MSG_TXT_NOM_SL')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.nomSlAmt??'') }}</p>
            </kw-form-item>
            <!-- row1 렌탈일수 -->
            <kw-form-item :label="$t('MSG_TXT_RENTAL_DC')">
              <p>
                {{ searchDetail.cntrPasgDc }} /
                {{ searchDetail.rsgFshDt ? searchDetail.rsgFshDt.substr(6):'' }}
              </p>
            </kw-form-item>
            <!-- row1 교체일자 -->
            <kw-form-item :label="$t('MSG_TXT_CHNG_DT')">
              <p>{{ stringUtil.getDateFormat(searchDetail.chgDt) }}</p>
            </kw-form-item>
            <!-- row1 추가매출  -->
            <kw-form-item :label="$t('MSG_TXT_SPMT_SL')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.spmtSlAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row2 정상할인 -->
            <kw-form-item :label="$t('MSG_TXT_NOM_DSC')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.nomDscAmt??'') }}</p>
            </kw-form-item>
            <!-- row2 취소조정 -->
            <kw-form-item :label="$t('MSG_TXT_CAN_CTR')">
              <kw-input
                v-model="searchDetail.canCtrAmt"
                regex="num"
                maxlength="10"
                align="right"
              />
            </kw-form-item>
            <!--row2 부가서비스  -->
            <kw-form-item :label="$t('MSG_TXT_ADN_SV')">
              <p>{{ searchDetail.adnSvSpmtSlAmt }}</p>
            </kw-form-item>
            <!-- row2 추가할인 -->
            <kw-form-item :label="$t('MSG_TXT_SPMT_DSC')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.spmtDscAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator v-if="searchDetail.canCtrAmt > 0" />
          <kw-form-row v-if="searchDetail.canCtrAmt > 0">
            <!-- row2-1 조정요청자사번 -->
            <kw-form-item :label="$t('MSG_TXT_CTR')+$t('MSG_TXT_REQ_USER')+$t('MSG_TXT_EPNO')">
              <kw-input
                v-model="searchDetail.slCtrRqrId"
                maxlength="10"
                regex="num"
              />
            </kw-form-item>
            <!-- row2-1 조정사유 -->
            <kw-form-item
              :label="$t('MSG_TXT_CTR_RSON')"
              colspan="3"
            >
              <kw-input
                v-model="searchDetail.slCtrRmkCn"
                maxlength="1000"
              />
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row3 매출조정 -->
            <kw-form-item :label="$t('MSG_TXT_SL_CTR')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.slCtrAmt??'') }}</p>
            </kw-form-item>
            <!-- row3 매출금액 -->
            <kw-form-item :label="$t('MSG_TXT_SL_AMT')">
              <p class="kw-fc--accent">
                {{ stringUtil.getNumberWithComma(searchDetail.slSumAmt??'') }}
              </p>
            </kw-form-item>
            <!-- row3 매출VAT -->
            <kw-form-item :label="$t('MSG_TXT_SL_VAT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.slSumVat??'') }}</p>
            </kw-form-item>
            <!-- row3 매출누계 -->
            <kw-form-item :label="$t('MSG_TXT_SL_AGG_AMT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.slAggAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row4 당월원리금 -->
            <kw-form-item :label="$t('MSG_TXT_THM')+$t('MSG_TXT_PAIAM')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.thmPaiam??'') }}</p>
            </kw-form-item>
            <!-- row4 당월 서비스 -->
            <kw-form-item
              :label="$t('MSG_TXT_THM')+$t('MSG_TXT_SERVICE')"
              colspan="2"
            >
              <p>{{ stringUtil.getNumberWithComma(searchDetail.thmSvAmt??'') }}</p>
            </kw-form-item>
            <!-- row4 매출잔액 -->
            <kw-form-item :label="$t('MSG_TXT_SL_BLAM')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.slBlam??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row5 연체가산금 -->
            <kw-form-item :label="$t('MSG_TXT_DLQ_ADAMT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.btdDlqAddAmt??'') }}</p>
            </kw-form-item>
            <!-- row5 入 / 出 -->
            <kw-form-item label="入 / 出">
              <p>
                {{ stringUtil.getNumberWithComma(searchDetail.thmDlqAddDpSumAmt??'') }} /
                {{ stringUtil.getNumberWithComma(searchDetail.thmDlqAddRfndSumAmt??'') }}
              </p>
            </kw-form-item>
            <!-- row5 가산금조정 -->
            <kw-form-item
              :label="$t('MSG_TXT_ADD_AM')+$t('MSG_TXT_CTR')"
              hint="null"
            >
              <kw-input
                v-model="searchDetail.adCtrAmt"
                regex="num"
                maxlength="12"
              />
            </kw-form-item>
            <!-- row5 미수금(未) -->
            <kw-form-item :label="$t('MSG_TXT_UCAM')+'(未)'">
              <p>
                {{ stringUtil.getNumberWithComma(searchDetail.eotDlqAddAmt??'') }}
              </p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </div>
    </kw-expansion-item>
  </kw-list>

  <!-- 5. 취소사항 -->
  <kw-action-top class="mt30">
    <template #left>
      <h3>5. {{ t('MSG_TXT_CAN_ARTC') }}</h3>
    </template>
    <kw-btn
      v-show="searchDetail.cancelStatNm !== '취소등록'"
      v-permission:read
      :label="$t('MSG_TXT_CAN_ARTC')+' '+$t('MSG_TXT_SRCH')"
      negative
      dense
      @click="onClickSearchCancel"
    />
  </kw-action-top>
  <kw-form
    ref="frmMainRental"
    cols="3"
  >
    <kw-form-row>
      <!-- row1 요청일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_AK_DT')"
        required
      >
        <kw-date-picker
          v-model="searchDetail.rsgAplcDt"
          :label="$t('MSG_TXT_AK_DT')"
          rules="required"
        />
      </kw-form-item>
      <!-- row1 취소일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_CANC_DT')"
        required
      >
        <kw-date-picker
          v-model="searchDetail.rsgFshDt"
          :label="$t('MSG_TXT_CANC_DT')"
          rules="required"
        />
      </kw-form-item>
      <!-- row1 사용일수/등급 -->
      <kw-form-item :label="$t('MSG_TXT_USE_DAY')+'/'+$t('MSG_TXT_GD')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.useDays??'') }} DAY ({{ searchDetail.grade }}급)</p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- row2 이월선납잔액 -->
      <kw-form-item
        :label="$t('MSG_TXT_CRDOVR')+$t('MSG_TXT_PRM_BLAM')"
        hint="선납잔액기말금액?prmBtdAmt"
      >
        <p>{{ stringUtil.getNumberWithComma(searchDetail.prmBtdAmt??'') }}</p>
      </kw-form-item>
      <!-- row2 이월선수잔액 -->
      <kw-form-item
        :label="$t('MSG_TXT_CRDOVR')+$t('MSG_TXT_PRPD_BLAM')"
        hint="기말선수금?eotAtam"
      >
        <p>{{ stringUtil.getNumberWithComma(searchDetail.eotAtam??'') }}</p>
      </kw-form-item>
      <!-- row2 선수총액 -->
      <kw-form-item :label="$t('MSG_TXT_PRPD_TAM')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.totPrpdAmt??'') }}</p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- row3 매출입금 -->
      <kw-form-item :label="$t('MSG_TXT_SL_DP_AMT')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.slDpAmt??'') }}</p>
      </kw-form-item>
      <!-- row3 입금누계 -->
      <kw-form-item :label="$t('MSG_TXT_DP_AGG_AMT')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.slDpAggAmt??'') }}</p>
      </kw-form-item>
      <!-- row3 미수총액 -->
      <kw-form-item :label="$t('MSG_TXT_UC_TAM')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.ucAmt??'') }}</p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- row4 선납환불 -->
      <kw-form-item :label="$t('MSG_TXT_PRM_RFND_AMT')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.prmRfndAmt??'') }}</p>
      </kw-form-item>
      <!-- row4 선수환불 -->
      <kw-form-item :label="$t('MSG_TXT_PRPD_RFND')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.prpdRfndAmt??'') }}</p>
      </kw-form-item>
      <!-- row4 등록반환 -->
      <kw-form-item :label="$t('MSG_TXT_RGS')+$t('MSG_TXT_RTRN')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.rentalRgstCostRfndAmt??'') }}</p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- row5 원위약-렌탈잔여 -->
      <kw-form-item :label="$t('MSG_TXT_CUR_WON')+$t('MSG_TXT_BOR')+'-'+$t('MSG_TXT_RENTAL')+$t('MSG_TXT_REST')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.resRtlfeBorAmt??'') }}</p>
      </kw-form-item>
      <!-- row5 원위약-등록비 -->
      <kw-form-item :label="$t('MSG_TXT_CUR_WON')+$t('MSG_TXT_BOR')+'-'+$t('MSG_TXT_RGST_FEE')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.rgstCostDscBorAmt??'') }}</p>
      </kw-form-item>
      <!-- row5 원위약-할인금액 -->
      <kw-form-item :label="$t('MSG_TXT_CUR_WON')+$t('MSG_TXT_BOR')+'-'+$t('MSG_TXT_DSC_AMT')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.rentalDscBorAmt??'') }}</p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- row6 원위약-소모품 -->
      <kw-form-item :label="$t('MSG_TXT_CUR_WON')+$t('MSG_TXT_BOR')+'-'+$t('MSG_TXT_CSMB')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.csmbCostBorAmt??'') }}</p>
      </kw-form-item>
      <!-- row6 원위약-철거비 -->
      <kw-form-item :label="$t('MSG_TXT_CUR_WON')+$t('MSG_TXT_BOR')+'-'+$t('MSG_TXT_REQD_CS')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.reqdCsBorAmt??'') }}</p>
      </kw-form-item>
      <!-- row6 포인트 환불 -->
      <kw-form-item :label="$t('MSG_TXT_P')+' '+$t('MSG_TXT_RFND')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.pBorAmt??'') }}</p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- 위약금액 -->
      <kw-form-item :label="$t('MSG_TXT_CCAM')">
        <kw-input
          v-model="searchDetail.borAmt"
          regex="num"
          maxlength="10"
          align="right"
          :readonly="searchDetail.ccamExmptDvCd!=='4'"
        />
        <kw-btn
          :label="$t('MSG_TXT_CCAM_IZ_DOC')+' '+$t('MSG_BTN_VIEW')"
          secondary
          class="px12"
          icon="report"
          @click="onClickCcamView"
        />
      </kw-form-item>
      <!-- 분실손료 -->
      <kw-form-item :label="$t('MSG_TXT_PD_LENT_LOST_LOG')">
        <kw-btn
          :label="$t('MSG_TXT_CALCULATE')"
          secondary
          class="px12 mr8"
          @click="onClickCalculate"
        />
        <kw-input
          v-model="searchDetail.lsnt"
          regex="num"
          maxlength="10"
          align="right"
        />
      </kw-form-item>
      <!-- 소모품비 -->
      <kw-form-item :label="$t('MSG_TXT_CSMB_CS')">
        <kw-input
          v-model="searchDetail.csmbCostBorAmt2"
          regex="num"
          maxlength="10"
          align="right"
          :readonly="searchDetail.csmbCsExmptDvCd!=='4'"
        />
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- 위약면책 -->
      <kw-form-item
        :label="$t('MSG_TXT_BOR')+$t('MSG_TXT_EXEMPTION')"
        class="equal_division--2"
      >
        <kw-select
          v-model="searchDetail.ccamExmptDvCd"
          :options="codes.CCAM_EXMPT_DV_CD"
          first-option="select"
        />
        <kw-input
          v-model="inputDetail.sel1Text"
          class="w80"
          regex="num"
          maxlength="1"
          @update:model-value="onChangeTextforSelect('sel1')"
        />
      </kw-form-item>
      <!-- 취소유형 -->
      <kw-form-item
        :label="$t('MSG_TXT_CNCL_TP')"
        class="equal_division--2"
      >
        <kw-select
          v-model="searchDetail.cntrStatChRsonCd"
          :options="codes.CMN_STAT_CH_RSON_CD"
          first-option="select"
        />
        <kw-input
          v-model="inputDetail.sel2Text"
          class="w80"
          regex="num"
          maxlength="2"
          @update:model-value="onChangeTextforSelect('sel2')"
        />
      </kw-form-item>
      <!-- 철거 -->
      <kw-form-item :label="$t('MSG_TXT_REQD')">
        <kw-input
          v-model="searchDetail.reqdCsBorAmt2"
          regex="num"
          maxlength="10"
          align="right"
          :readonly="searchDetail.reqdCsExmptDvCd!=='4'"
        />
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- 소모/철거/복구 -->
      <kw-form-item
        :label="$t('MSG_TXT_CONSUMPTION')+'/'+$t('MSG_TXT_REQD')+'/'+$t('MSG_TXT_RECOVERY')"
        colspan="3"
      >
        <kw-select
          v-model="searchDetail.csmbCsExmptDvCd"
          :options="codes.CSMB_CS_EXMPT_DV_CD"
          first-option="select"
        />
        <kw-input
          v-model="inputDetail.sel3Text"
          class="w80"
          regex="num"
          maxlength="1"
          @update:model-value="onChangeTextforSelect('sel3')"
        />
        <kw-select
          v-model="searchDetail.reqdCsExmptDvCd"
          :options="codes.REQD_CS_EXMPT_DV_CD"
          first-option="select"
        />
        <kw-input
          v-model="inputDetail.sel4Text"
          class="w80"
          regex="num"
          maxlength="1"
          @update:model-value="onChangeTextforSelect('sel4')"
        />
        <kw-select
          v-model="searchDetail.reqdAkRcvryDvCd"
          :options="codes.REQD_RCVRY_DV_CD"
          first-option="select"
        />
        <kw-btn
          :label="$t('MSG_TXT_RECOVERY')"
          secondary
          class="mx12"
          @click="onClickTodo('복구')"
        />
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- 환불총액 -->
      <kw-form-item :label="$t('MSG_TXT_RFND_TOT_AMT')">
        <p class="kw-fc--accent">
          {{ stringUtil.getNumberWithComma(searchDetail.totRfndAmt??'') }}
        </p>
      </kw-form-item>
      <kw-form-item />
      <!-- 다건 정보 입력 -->
      <kw-form-item :label="$t('MSG_TXT_MULTI')+' '+$t('MSG_TXT_INF')+' '+$t('MSG_TXT_INP')">
        <kw-checkbox
          v-model="searchDetail.bulkApplyYN"
          :label="$t('MSG_TXT_CANCEL_BULK_APPLY')"
          :false-value="N"
          :true-value="Y"
          :disable="props.sametype==='N'"
        />
      </kw-form-item>
    </kw-form-row>
  </kw-form>

  <div class="button-set--bottom">
    <!-- BTN Variation #2 : 취소등록 이후 or 이미 취소가 등록된 버튼 배열-->
    <div
      v-if="searchDetail.cancelStatNm === '취소등록'"
      class="button-set--bottom-right"
    >
      <kw-btn
        :label="$t('MSG_BTN_VAC')+$t('MSG_BTN_IS')"
        class="ml8"
        :disable="searchDetail.totRfndAmt>=0"
        @click="onClickVacIssue"
      />
      <kw-btn
        :label="$t('MSG_TXT_CARD')+$t('MSG_BTN_APPR')"
        class="ml8"
        @click="onClickTodo('카드승인')"
      />
      <!--철거접수-->
      <kw-btn
        :label="$t('MSG_TXT_REQD')+$t('MSG_BTN_RECEIPT')"
        class="ml8"
        @click="onClickRequidation"
      />
      <!--환불접수-->
      <kw-btn
        :label="$t('MSG_TXT_RFND')+$t('MSG_BTN_RECEIPT')"
        class="ml8"
        @click="onClickRefund"
      />
      <kw-btn
        :label="$t('MSG_TXT_RENTAL_RSG_CFDG')+$t('MSG_BTN_VIEW')"
        class="ml8"
        icon="report"
        @click="onClickTodo('렌탈계약해지확인서 보기')"
      />
      <!--삭제-->
      <kw-btn
        v-permission:delete
        :label="$t('MSG_BTN_DEL')"
        class="ml8"
        @click="onClickDelete"
      />
    </div>
    <!-- // BTN Variation #1 : 취소등록 이전 버튼 배열  -->
    <div
      v-else
      class="button-set--bottom-right"
    >
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        class="ml8"
        @click="onClickCancel"
      />
      <kw-btn
        v-permission:create
        :label="$t('MSG_BTN_SAVE')"
        class="ml8"
        primary
        @click="onClickSave"
      />
    </div>
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, stringUtil, store, useDataService, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty, isEqual } from 'lodash';

const { t } = useI18n();
const dataService = useDataService();
const frmMainRental = ref(getComponentType('KwForm'));
const { notify, modal } = useGlobal();
const { companyCode } = store.getters['meta/getUserInfo'];

const codes = await codeUtil.getMultiCodes(
  'CCAM_EXMPT_DV_CD', // 위약금면책구분코드
  'CMN_STAT_CH_RSON_CD', // 공통상태변경사유코드
  'CSMB_CS_EXMPT_DV_CD', // 소모품비용면책구분코드
  'REQD_CS_EXMPT_DV_CD', // 철거비용면책구분코드
  'REQD_RCVRY_DV_CD', // 철거복구구분코드
);

const emits = defineEmits([
  'update:modelValue',
  'searchdetail',
  'savedetail',
  'removedetail',
  'deletecancel',
]);

const props = defineProps({
  childDetail: { type: Object, required: true },
  sametype: { type: String, required: true },
});

const searchDetail = reactive(props.childDetail);
const inputDetail = ref({
  reqDt: '',
  cancelDt: '',
});

codes.CCAM_EXMPT_DV_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
codes.CMN_STAT_CH_RSON_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
codes.CSMB_CS_EXMPT_DV_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
codes.REQD_CS_EXMPT_DV_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// SELECTBOX 를 선택하기 위한 TEXT 입력 이벤트
function onChangeTextforSelect(div) {
  if (div === 'sel1') {
    if (codes.CCAM_EXMPT_DV_CD.findIndex((v) => v.codeId === inputDetail.value.sel1Text) >= 0) {
      searchDetail.ccamExmptDvCd = inputDetail.value.sel1Text;
    } else {
      searchDetail.ccamExmptDvCd = '';
    }
  } else if (div === 'sel2') {
    if (codes.CMN_STAT_CH_RSON_CD.findIndex((v) => v.codeId === inputDetail.value.sel2Text) >= 0) {
      searchDetail.cntrStatChRsonCd = inputDetail.value.sel2Text;
    } else {
      searchDetail.cntrStatChRsonCd = '';
    }
  } else if (div === 'sel3') {
    if (codes.CSMB_CS_EXMPT_DV_CD.findIndex((v) => v.codeId === inputDetail.value.sel3Text) >= 0) {
      searchDetail.csmbCsExmptDvCd = inputDetail.value.sel3Text;
    } else {
      searchDetail.csmbCsExmptDvCd = '';
    }
  } else if (div === 'sel4') {
    if (codes.REQD_CS_EXMPT_DV_CD.findIndex((v) => v.codeId === inputDetail.value.sel4Text) >= 0) {
      searchDetail.reqdCsExmptDvCd = inputDetail.value.sel4Text;
    } else {
      searchDetail.reqdCsExmptDvCd = '';
    }
  }
}

// 위약금 내역서 보기
function onClickCcamView() {
  // 위약금 내역서 보기 : 해당 계약번호에 대한 '위약금 내역' OZ뷰 팝업을 호출 합니다.
  notify('TODO : 위약금 내역서 OZ뷰 호출 ');
}

// 분실손료 계산
function onClickCalculate() {
  // 분실손료 : '계산'버튼을 클릭하면 입력란에 계산된 금액이 표시 됩니
  notify('TODO : 분실손료 계산 ');
}

// 5. 취소사항 > 취소사항 조회 클릭
async function onClickSearchCancel() {
  if (!await frmMainRental.value.validate()) { return; }

  emits('searchdetail', {
    cntrStatChRsonCd: searchDetail.cntrStatChRsonCd,
    reqDt: searchDetail.rsgAplcDt,
    cancelDt: searchDetail.rsgFshDt,
    adCtrAmt: searchDetail.adCtrAmt,
    canCtrAmt: searchDetail.canCtrAmt,
    // lsnt: searchDetail.lsnt ?? 0,
    // borAmt: (searchDetail.ccamExmptDvCd !== '4') ? 0 : (searchDetail.borAmt ?? 0),
  });
}

function onClickSave() {
  if (isEmpty(searchDetail.canCtrAmt)) {
    searchDetail.slCtrRqrId = '';
    searchDetail.slCtrRmkCn = '';
  }

  if (searchDetail.ccamExmptDvCd !== '4') searchDetail.borAmt = 0;
  if (searchDetail.csmbCsExmptDvCd !== '4') searchDetail.csmbCostBorAmt2 = 0;
  if (searchDetail.reqdCsExmptDvCd !== '4') searchDetail.reqdCsBorAmt2 = 0;

  emits('savedetail');
}

function onClickCancel() {
  emits('removedetail');
}

function onClickDelete() {
  emits('deletecancel');
}

async function onClickVacIssue() {
  // 1. 대면/비대면 선택
  const btns = [{ label: '대면발급', returnText: 'Face' },
    { label: '비대면발급', returnText: 'NonFace' }];

  const { result, payload } = await modal({
    component: 'ZwctaComfirmMgmtP',
    componentProps: { contents: '가상계좌 발급 방법을 선택하여 주세요.',
      isCancel: true,
      isOk: false,
      btns },
  });

  if (result) {
    // 2. 수납요청번호 생성
    const revAkNoParam = {};

    revAkNoParam.cntrNo = searchDetail.cntrNo;
    revAkNoParam.cntrSn = searchDetail.cntrSn;
    revAkNoParam.cstNo = searchDetail.cntrCstNo;
    revAkNoParam.dpTpCd = '0102';// 입금구분코드
    revAkNoParam.rveAkMthdCd = (isEqual(payload, 'Face')) ? '01' : '02'; // 수납요청방식코드 01:대면, 02:비대면
    revAkNoParam.rveAkPhCd = '06'; // 수납요청경로코드 05:판매-카드, 06:판매-계좌
    revAkNoParam.askAmt = searchDetail.totRfndAmt;
    const res = await dataService.get('/sms/wells/contract/changeorder/cancel/receive-ask-no', { params: revAkNoParam });

    if (!isEmpty(res.data)) {
      // 3. 가상계좌 팝업 호출
      const rveAkNo = res.data.receiveAskNumber;
      console.log(rveAkNo);

      const component = (isEqual(payload, 'Face')) ? 'ZwwdbIndvVirtualAccountIssueMgtP'
        : 'ZwwdbIndvVirtualAccountNoContactIssueMgtP';

      const popRes = await modal({
        component,
        componentProps: { rveAkNo, kwGrpCoCd: companyCode },
      });

      if (popRes) {
        console.log(popRes);
      }
    }
  }
}

async function onClickRequidation() {
  await modal({
    component: 'WwsncTimeTableForContractP',
    componentProps: {
      baseYm: dayjs().format('YYYYMM'), // 달력 초기 월
      chnlDvCd: 'K', // W: 웰스, K: KSS, C: CubicCC, P: K-MEMBERS, I || E: 엔지니어, M: 매니저
      svDvCd: '1', // 1:설치, 2:BS, 3:AS, 4:홈케어
      sellDate: searchDetail.cntrCnfmDt, // // 판매일자
      svBizDclsfCd: '3420', // TODO 확인/
      mtrStatCd: '3',
      cntrNo: searchDetail.cntrNo,
      cntrSn: searchDetail.cntrSn,
    },
  });
}

async function onClickRefund() {
  const { cntrNo, cntrSn } = searchDetail;
  await modal({
    component: 'WwwdbRefundApplicationRegP',
    componentProps: { cntrNo, cntrSn },
  });
}

async function onClickTodo(param) {
  notify(`TODO: ${param} 준비 중`);
}

watch(searchDetail, (val) => {
  emits('update:modelValue', val);
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
</script>

<style scoped lang="scss">
.kw-form-row + .kw-separator {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
</style>
