<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncCustomerDtlP
3. 작성자 : sunghun.choi
4. 작성일 : 2023.02.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 채권상담 고객리스트 탭 고객상세팝업
- 채권상담 고객상세 정보를 조회
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--window-consult kw-popup--window-consult--style"
  >
    <div class="normal-area normal-area--two-column">
      <div
        class="normal-area--first-column col"
      >
        <kw-scroll-area
          style="height: calc(100vh - 40px);"
        >
          <div class="pr20">
            <h3 class="my0">
              {{ $t('MSG_TXT_CST_DTL') }}
            </h3>
            <kw-separator class="my8" />

            <kw-form
              dense
              :label-size="112"
              class="kw-form--small"
            >
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CNTR_NO')"
                >
                  <p>{{ customer.cntrNo }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_CST_NM')"
                >
                  <p>{{ customer.cstNm }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_BIRTH_DATE')"
                >
                  <p>{{ customer.bryyMmdd }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_MPNO')"
                >
                  <p class="w100">
                    {{ customer.mpno1 }}
                  </p>
                  <kw-btn
                    borderless
                    dense
                    icon="cellphone"
                    class="ml12"
                  />
                  <kw-btn
                    borderless
                    dense
                    icon="sms"
                    class="ml8"
                  />
                  <kw-btn
                    :label="$t('MSG_BTN_TEL_REJ')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_CST_NO')"
                >
                  <p>{{ customer.cstNo }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_SFK')"
                >
                  <p>{{ customer.sfk }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_BU_TP')"
                >
                  <p>{{ customer.buTp }}</p>
                </kw-form-item>
                <kw-form-item no-label>
                  <kw-btn
                    :label="$t('MSG_BTN_BU_NOTI')"
                    dense
                    secondary
                    class="kw-font-caption py2"
                    style="min-height: 20px;"
                  />
                  <kw-btn
                    :label="$t('MSG_BTN_CNTRT_INF_CH')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                  />
                  <kw-btn
                    :label="$t('MSG_BTN_ISTLC_INF_CH')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                  />
                  <kw-btn
                    :label="$t('MSG_BTN_VST_RGST')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                    @click="onClickVisit"
                  />
                </kw-form-item>
              </kw-form-row>
            </kw-form>

            <kw-separator class="my8" />

            <kw-form
              dense
              class="kw-form--small"
              :label-size="112"
            >
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_IST_NM')"
                >
                  <p>{{ customer.istllNm }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_TEL_NO')"
                >
                  <p class="w100">
                    {{ customer.tno }}
                  </p>
                  <kw-btn
                    borderless
                    dense
                    icon="cellphone"
                    class="ml12"
                  />
                  <kw-btn
                    :label="$t('MSG_BTN_TEL_REJ')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_MPNO')"
                >
                  <p class="w100">
                    {{ customer.mpno2 }}
                  </p>
                  <kw-btn
                    borderless
                    dense
                    icon="cellphone"
                    class="ml12"
                  />
                  <kw-btn
                    borderless
                    dense
                    icon="sms"
                    class="ml8"
                    style="font-size: 16px;"
                  />
                  <kw-btn
                    :label="$t('MSG_BTN_TEL_REJ')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CNTR_ADR')"
                  colspan="2"
                >
                  <p>{{ customer.cntrAdr }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_PRCH_PD_NM')"
                >
                  <p>{{ customer.prchPdNm }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_INST_ADDR')"
                  colspan="2"
                >
                  <p>{{ customer.istAdr }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_CRTL_MB_STAT')"
                >
                  <p>{{ customer.crtlMbStat }}</p>
                </kw-form-item>
              </kw-form-row>
            </kw-form>

            <kw-separator class="my8" />

            <kw-form
              dense
              class="kw-form--small"
              :label-size="112"
            >
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_RCP_D')"
                >
                  <p>
                    {{ customer.rcpD }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_INST_DT')"
                >
                  <p>
                    {{ customer.istD }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CAN_D')"
                >
                  <p>
                    {{ customer.canD }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_REQD_D')"
                >
                  <p>
                    {{ customer.reqdD }}
                  </p>
                </kw-form-item>
                <kw-form-item no-label>
                  <kw-btn
                    :label="$t('MSG_BTN_FNT_RS')"
                    dense
                    secondary
                    class="kw-font-caption py2"
                    style="min-height: 20px;"
                  />
                  <kw-btn
                    :label="$t('MSG_BTN_BIL_EXCD_RGST')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                  />
                  <kw-btn
                    :label="$t('MSG_BTN_CST_CARD_PRNT')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                    @click="onClickCustomerCardPrint"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_AUTO_FNT')"
                >
                  <p>{{ customer.aftn }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_FNT_DT')"
                >
                  <p>{{ customer.fntDt }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_FNT_STAT')"
                >
                  <p>{{ customer.fntStat }}</p>
                </kw-form-item>
              </kw-form-row>
            </kw-form>

            <kw-separator class="my8" />
            <kw-form
              dense
              class="kw-form--small"
              :label-size="112"
            >
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_SELLER_PERSON')"
                >
                  <p>
                    {{ customer.seller }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_SELLER_CTPLC')"
                >
                  <p class="w100">
                    {{ customer.sellerCtplc }}
                  </p>
                  <kw-btn
                    borderless
                    dense
                    icon="cellphone"
                    class="ml12"
                  />
                  <kw-btn
                    borderless
                    dense
                    icon="sms"
                    class="ml8"
                    style="font-size: 16px;"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_CLTN_D')"
                >
                  <p>
                    {{ customer.cltnD1 }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_DSMN')"
                >
                  <p>
                    {{ customer.dsmn }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_DSMN_CTPLC')"
                >
                  <p class="w100">
                    {{ customer.dsmnCtplc }}
                  </p>
                  <kw-btn
                    borderless
                    dense
                    icon="cellphone"
                    class="ml12"
                  />
                  <kw-btn
                    borderless
                    dense
                    icon="sms"
                    class="ml8"
                    style="font-size: 16px;"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_CLTN_D')"
                >
                  <p>
                    {{ customer.cltnD2 }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_BLG_BLD_STORE')"
                >
                  <p>{{ customer.blgBldStore }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_STORE_TNO')"
                >
                  <p class="w100">
                    {{ customer.storeTno }}
                  </p>
                  <kw-btn
                    borderless
                    dense
                    icon="cellphone"
                    class="ml12"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_ALNC_CD')"
                >
                  <p>{{ customer.alncCd }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_ALNC_NM')"
                >
                  <p>{{ customer.alncNm }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_ALNC_STAT')"
                >
                  <p>{{ customer.alncStat }}</p>
                </kw-form-item>
              </kw-form-row>
            </kw-form>

            <kw-separator class="my8" />

            <kw-form
              dense
              class="kw-form--small"
              :label-size="112"
            >
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_VT_AC')"
                >
                  <p>
                    {{ customer.vac }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_TF_DT')"
                >
                  <p>
                    {{ customer.tfDt }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_CLCTAM_ICHR')"
                >
                  <p>
                    {{ customer.clctamIchr }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_DBT_NFF')"
                >
                  <p>
                    {{ customer.dbtNff }}
                  </p>
                  <kw-btn
                    :label="$t('MSG_BTN_CB_INF_INQR_AK')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml12"
                    style="min-height: 20px;"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_LWM')"
                >
                  <p>
                    {{ customer.lwm }}
                  </p>
                </kw-form-item>
                <kw-form-item no-label>
                  <kw-btn
                    :label="$t('MSG_BTN_PTTN_CRT')"
                    dense
                    secondary
                    class="kw-font-caption py2"
                    style="min-height: 20px;"
                  />
                  <kw-btn
                    :label="$t('MSG_BTN_LWM_RGST')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                  />

                  <kw-btn
                    :label="$t('MSG_BTN_VT_DTL')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                  />
                  <kw-btn
                    :label="$t('MSG_BTN_DP_RGST')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item :label="$t('MSG_TXT_AUTH_RSG')">
                  <p>
                    {{ customer.authRsg }}
                  </p>
                </kw-form-item>
                <kw-form-item :label="$t('MSG_TXT_AUTH_RSG_EXCD')">
                  <p>
                    {{ customer.authRsgExcd }}
                  </p>
                  <kw-btn
                    :label="$t('MSG_BTN_EXCD_RGST')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_SL_STP')"
                >
                  <p>
                    {{ customer.slStp }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CLN_PSBL')"
                >
                  <p>{{ customer.clnPsbl1 }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_CLN_PRCS')"
                >
                  <p>{{ customer.clnPrcs1 }}</p>
                </kw-form-item>
                <kw-form-item no-label>
                  <kw-btn
                    :label="$t('MSG_BTN_TXINV')"
                    dense
                    secondary
                    class="kw-font-caption py2"
                    style="min-height: 20px;"
                  />
                </kw-form-item>
              </kw-form-row>
            </kw-form>

            <kw-separator class="my8" />

            <kw-form
              dense
              class="kw-form--small"
              :label-size="112"
            >
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_LWSC_BIL_AMT')"
                >
                  <p>
                    {{ customer.lwscBilAmt }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_LWSC_DP_AMT')"
                >
                  <p>
                    {{ customer.lwscDpAmt }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_LWSC_BLAM')"
                >
                  <p>
                    {{ customer.lwscBlam }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_UCAM_ADP')"
                >
                  <p>
                    {{ customer.ucamAdp }}
                  </p>
                </kw-form-item>
                <kw-form-item no-label>
                  <kw-btn
                    :label="$t('MSG_TXT_RSG_RGST')"
                    dense
                    secondary
                    class="kw-font-caption py2"
                    style="min-height: 20px;"
                  />
                  <kw-btn
                    :label="$t('MSG_BTN_SV_DTL')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                  />
                </kw-form-item>
              </kw-form-row>
            </kw-form>

            <kw-grid
              ref="grdMainRef"
              name="grdMain4"
              class="mt16"
              :visible-rows="5"
              @init="initGrdMain"
            />
            <kw-tabs
              v-model="selectedTab"
              class="mt16"
            >
              <kw-tab
                name="tab1"
                :label="$t('MSG_TXT_CNSL_HIST')"
              />
              <kw-tab
                name="tab2"
                :label="$t('MSG_TXT_NICESVC_CNSL_HIST')"
              />
              <kw-tab
                name="tab3"
                :label="$t('MSG_TXT_SMS_HIST')"
              />
              <kw-tab
                name="tab4"
                :label="$t('MSG_TXT_PROM_HIST')"
              />
              <kw-tab
                name="tab5"
                :label="$t('MSG_TXT_LWM_HIST')"
              />
              <kw-tab
                name="tab6"
                :label="$t('MSG_TXT_VST_HIST')"
              />
              <kw-tab
                name="tab7"
                :label="$t('MSG_TXT_DLGTN_ACTI_HIST')"
              />
              <kw-tab
                name="tab8"
                :label="$t('MSG_TXT_CST_CNR_CNSL_HIST')"
              />
            </kw-tabs>
            <kw-tab-panels v-model="selectedTab">
              <kw-tab-panel name="tab1">
                <wwbnc-customer-dtl-p-counsel-history />
              </kw-tab-panel>
              <kw-tab-panel name="tab2">
                <wwbna-counsel-wells-contract-list02 />
              </kw-tab-panel>
              <kw-tab-panel name="tab3">
                <zwbnc-customer-dtl-p-sms
                  :ref="(vm) => tabRefs.tab3 = vm"
                />
              </kw-tab-panel>
              <kw-tab-panel name="tab4">
                <zwbnc-customer-dtl-p-promise />
              </kw-tab-panel>
              <kw-tab-panel name="tab5">
                <zwbnc-customer-dtl-p-law-measure />
              </kw-tab-panel>
              <kw-tab-panel name="tab6">
                <zwbnc-customer-dtl-p-visit
                  ref="visitRef"
                />
              </kw-tab-panel>
              <kw-tab-panel name="tab7">
                <wwbna-counsel-wells-contract-list07 />
              </kw-tab-panel>
              <kw-tab-panel name="tab8">
                <zwbnc-customer-dtl-p-customer-center />
              </kw-tab-panel>
            </kw-tab-panels>
          </div>
        </kw-scroll-area>
      </div>
      <kw-separator
        vertical
        class="ml0 mr20"
      />
      <div class="normal-area--second-column col column no-wrap">
        <kw-scroll-area
          style="height: calc(100vh - 113px);"
        >
          <div class="pr20">
            <kw-input
              v-model="customer.unuitmCn"
              type="textarea"
              :rows="3"
              :placeholder="$t('MSG_TXT_UNUITM_IN')"
            />
            <div class="row justify-end full-size mt12">
              <kw-btn
                :label="$t('MSG_BTN_INTL')"
                secondary
                dense
                @click="onClickUnuitmCnReset"
              />
              <kw-btn
                :label="$t('MSG_BTN_SAVE')"
                primary
                dense
                class="ml8"
              />
            </div>

            <h4>{{ $t('MSG_TXT_CNSL_RGST') }}</h4>
            <kw-separator
              size="2"
              class="mt12 mb16 h2"
              color="black1"
            />

            <kw-form
              cols="1"
              dense
              :label-size="112"
            >
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CNSL_PH')"
                  required
                >
                  <!-- TODO: 코드관리 등록 안된 임시 소스 -->
                  <kw-select
                    v-model="customer.cnslPh"
                    :options="[ '인바운드','아웃바운드']"
                    dense
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CRNCY_RS')"
                  required
                >
                  <!-- TODO: 코드관리 등록 안된 임시 소스 -->
                  <kw-select
                    v-model="customer.crncyRs"
                    :options="[ '(성공)입금성공','(성공)입금약속','(성공)단순문의','(성공)입금거부(민원)'
                                ,'(성공)타인통화','(성공)기타','(실패)무응답','(실패)통화중','(실패)결번' ]"
                    dense
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CST_PRP')"
                  required
                >
                  <!-- TODO: 코드관리 등록 안된 임시 소스 -->
                  <kw-select
                    v-model="customer.cstPrp"
                    :options="['번호이상','주소이상','결번','미응답' ]"
                    dense
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_DPR')"
                >
                  <kw-input
                    v-model="customer.dpr"
                    dense
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CNSL_TP')"
                  required
                >
                  <!-- TODO: 코드관리 등록 안된 임시 소스 -->
                  <kw-select
                    v-model="customer.cnslTp"
                    :options="['전화','문자' ]"
                    dense
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CST_STAT')"
                  required
                >
                  <!-- TODO: 코드관리 등록 안된 임시 소스 -->
                  <kw-select
                    v-model="customer.cstStat"
                    :options="[ '분납','컨택불가','납부예정','납부거부' ]"
                    dense
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CLN_PSBL')"
                  required
                >
                  <!-- TODO: 코드관리 등록 안된 임시 소스 -->
                  <kw-select
                    v-model="customer.clnPsbl"
                    :options="[ '신규','상','중','하']"
                    dense
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CLN_PRCS')"
                  required
                >
                  <!-- TODO: 코드관리 등록 안된 임시 소스 -->
                  <kw-select
                    v-model="customer.clnPrcs"
                    :options="[ '전화문자','소송예정','소송접수','변론','판결','재산명시','압류접수'
                                ,'압류완료','경매접수','경매완료' ]"
                    dense
                  />
                </kw-form-item>
              </kw-form-row>
            </kw-form>
            <kw-list
              separator
              item-padding="20px 0"
              class="mt20"
            >
              <kw-expansion-item
                group="list-group"
                padding-target="header"
                expansion-icon-align="center"
                class="expansion-item--blue"
              >
                <template #header>
                  <kw-item-section>
                    <kw-item-label>
                      <span class="text-bold kw-font-pt18">{{ $t('MSG_TXT_PROM_RGST') }}</span>
                    </kw-item-label>
                  </kw-item-section>
                </template>
                <div class="pb20">
                  <kw-separator
                    size="2"
                    class="h2 mt0"
                    color="black1"
                  />
                  <kw-form
                    :label-size="100"
                    dense
                    cols="1"
                  >
                    <kw-form-row>
                      <kw-form-item
                        :label="$t('MSG_TXT_PROM_DTM')"
                        required
                      >
                        <div class="column">
                          <kw-date-picker
                            v-model="customer.promD"
                            dense
                            :placeholder="$t('MSG_TXT_SELT')"
                          />
                          <kw-time-picker
                            v-model="customer.promHh"
                            dense
                            class="mt8"
                          />
                        </div>
                      </kw-form-item>
                    </kw-form-row>
                    <kw-form-row>
                      <kw-form-item
                        :label="$t('MSG_TXT_PROM_TP')"
                        required
                      >
                        <!-- TODO: 코드관리 등록 안된 임시 소스 -->
                        <kw-select
                          v-model="customer.promTp"
                          :options="[ '입금약속','재컨택약속','기타약속','강제집행','변론기일','보정명령']"
                          dense
                          :placeholder="$t('MSG_TXT_SELT')"
                        />
                      </kw-form-item>
                    </kw-form-row>
                    <kw-form-row>
                      <kw-form-item
                        :label="$t('MSG_TXT_PROM_AMT')"
                        required
                      >
                        <kw-input
                          v-model="customer.promAmt"
                          dense
                        />
                      </kw-form-item>
                    </kw-form-row>
                  </kw-form>
                </div>
              </kw-expansion-item>
            </kw-list>

            <kw-input
              v-model="customer.cnslCn"
              type="textarea"
              :rows="10"
              :placeholder="$t('MSG_TXT_CNSL_IN')"
              class="mt12"
            />
          </div>
        </kw-scroll-area>
        <div class="pr20 column">
          <kw-separator spaced="20px" />
          <div class="row justify-end full-size ">
            <kw-btn
              :label="$t('MSG_BTN_INTL')"
              secondary
              dense
              @click="onClickCnslRgstReset"
            />
            <kw-btn
              :label="$t('MSG_BTN_SAVE')"
              primary
              dense
              class="ml8"
            />
          </div>
        </div>
      </div>
    </div>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

import ZwbncCustomerDtlPSms from '~sms-common/bond/pages/consultation/ZwbncCustomerDtlPSms.vue';
import ZwbncCustomerDtlPLawMeasure from '~sms-common/bond/pages/consultation/ZwbncCustomerDtlPLawMeasure.vue';
import ZwbncCustomerDtlPPromise from '~sms-common/bond/pages/consultation/ZwbncCustomerDtlPPromise.vue';
import ZwbncCustomerDtlPCustomerCenter from '~sms-common/bond/pages/consultation/ZwbncCustomerDtlPCustomerCenter.vue';
import ZwbncCustomerDtlPVisit from '~sms-common/bond/pages/consultation/ZwbncCustomerDtlPVisit.vue';
import WwbncCustomerDtlPCounselHistory from './WwbncCustomerDtlPCounselHistory.vue';

const { t } = useI18n();
const dataService = useDataService();
const { modal, notify } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  cstNo: {
    type: String,
    required: true,
  },

});

const grdMainRef = ref(getComponentType('KwGrid'));

const tabRefs = reactive({});

const selectedTab = ref('tab1');

const selectedGridRow = ref(null);

const visitRef = ref();

watch(selectedGridRow, (newValue) => {
  if (!newValue) {
    const view = grdMainRef.value.getView();
    view.clearCurrent();
  }
});

const customer = ref({});

let cachedParams;
const searchParams = ref({
  schBaseYm: '',
  schCstNo: props.cstNo,
  schCntrNo: '',
  schCntrSn: '',
});

async function fetchCustomerDetail() {
  const response = await dataService.get('/sms/wells/bond/bond-counsel/customer-details', { params: cachedParams });
  const details = response.data;
  const gridView = grdMainRef.value.getView();
  gridView.getDataSource().setRows(details);

  selectedGridRow.value = null;
  gridView.resetCurrent();
}

async function fetchData() {
  if (props.cstNo === '') {
    return;
  }
  const response = await dataService.get('/sms/wells/bond/bond-counsel/customer-detail', { params: cachedParams });
  customer.value = response.data;

  await fetchCustomerDetail();
}

// TODO: 특기사항 초기화 버튼 클릭 이벤트
async function onClickUnuitmCnReset() {
  customer.value.unuitmCn = '';
}

// TODO: 상담등록 초기화 버튼 클릭 이벤트
async function onClickCnslRgstReset() {
  customer.value.cnslPh = '';
  customer.value.crncyRs = '';
  customer.value.cstPrp = '';
  customer.value.dpr = '';
  customer.value.cnslTp = '';
  customer.value.cstStat = '';
  customer.value.clnPsbl = '';
  customer.value.clnPrcs = '';
  customer.value.promD = '';
  customer.value.promHh = '';
  customer.value.promTp = '';
  customer.value.promAmt = '';
  customer.value.cnslCn = '';
}

// TODO: 고객카드 출력 팝업
async function onClickCustomerCardPrint() {
  const apiUrl = '/sms-common/bond/pages/consultation';
  const templateId = 'MSG_TIT_CST_CARD_PRNT';
  await modal({
    component: 'ZwbncCustomerCardP',
    componentProps: { apiUrl, templateId },
  });
}

// TODO: 방문이력 관리 팝업
async function onClickVisit() {
  // TODO:고객번호, 고객명, 계약번호, 계약일련번호, 채권업무구분코드 전달필요
  const { cstNo } = '011014769';

  const { result: isChanged } = await modal({
    component: 'ZwbncVisitMgtP',
    componentProps: { cstNo },
  });

  if (isChanged) {
    notify(t('MSG_ALT_REGISTERED'));
    selectedTab.value = 'tab5';
    await visitRef.value.fetchData();
  }
}

onMounted(async () => {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'fnt' },
    { fieldName: 'taskDiv' },
    { fieldName: 'prdGrp' },
    { fieldName: 'goodsNm' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cstNm' },
    { fieldName: 'dlqMcnt' },
    { fieldName: 'authRsgDt' },
    { fieldName: 'ojAmt', dataType: 'number' },
    { fieldName: 'ojDp', dataType: 'number' },
    { fieldName: 'ojBlam', dataType: 'number' },
    { fieldName: 'totDlqAmt', dataType: 'number' },
    { fieldName: 'totDlqDp', dataType: 'number' },
    { fieldName: 'totDlqBlam', dataType: 'number' },
    { fieldName: 'mmChramAmt', dataType: 'number' },
    { fieldName: 'mmChramDp', dataType: 'number' },
    { fieldName: 'mmChramBlam', dataType: 'number' },
    { fieldName: 'dlqAddAmt', dataType: 'number' },
    { fieldName: 'dlqAddDp', dataType: 'number' },
    { fieldName: 'dlqAddBlam', dataType: 'number' },
    { fieldName: 'svCs', dataType: 'number' },
    { fieldName: 'svDp', dataType: 'number' },
    { fieldName: 'svBlam', dataType: 'number' },
    { fieldName: 'ucAmt', dataType: 'number' },
    { fieldName: 'ucDp', dataType: 'number' },
    { fieldName: 'ucBlam', dataType: 'number' },
    { fieldName: 'totDpAmt', dataType: 'number' },
    { fieldName: 'spmtSl', dataType: 'number' },
    { fieldName: 'pdLentLostLog', dataType: 'number' },
    { fieldName: 'vtAcDv' },
    { fieldName: 'vtAcBnk' },
    { fieldName: 'vtAcNo' },
    { fieldName: 'ccam', dataType: 'number' },
    { fieldName: 'lsfe', dataType: 'number' },
    { fieldName: 'rtlfe1', dataType: 'number' },
    { fieldName: 'rtlfeIstm1', dataType: 'number' },
    { fieldName: 'rtlfe2', dataType: 'number' },
    { fieldName: 'rtlfeIstm2', dataType: 'number' },
    { fieldName: 'dpr' },
    { fieldName: 'clctamIchr' },
    { fieldName: 'tfDt' },
    { fieldName: 'sfk' },
  ];

  const columns = [
    { fieldName: 'fnt', header: t('MSG_TXT_FNT'), width: '60', styleName: 'text-left', headerSummaries: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'taskDiv', header: t('MSG_TXT_TASK_DIV'), width: '80', styleName: 'text-left' },
    { fieldName: 'prdGrp', header: t('MSG_TXT_PRD_GRP'), width: '100', styleName: 'text-left' },
    { fieldName: 'goodsNm', header: t('MSG_TXT_GOODS_NM'), width: '190', styleName: 'text-left' },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), width: '120', styleName: 'text-left' },
    { fieldName: 'dlqMcnt', header: t('MSG_TXT_DLQ_MCNT'), width: '80', styleName: 'text-right' },
    { fieldName: 'authRsgDt', header: t('MSG_TXT_AUTH_RSG_DT'), width: '130', styleName: 'text-right' },
    { fieldName: 'ojAmt', header: t('MSG_TXT_OJ_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'ojDp', header: t('MSG_TXT_OJ_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'ojBlam', header: t('MSG_TXT_OJ_BLAM'), width: '110', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'totDlqAmt', header: t('MSG_TXT_TOT_DLQ_AMT'), width: '110', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'totDlqDp', header: t('MSG_TXT_TOT_DLQ_DP'), width: '110', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'totDlqBlam', header: t('MSG_TXT_TOT_DLQ_BLAM'), width: '110', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'mmChramAmt', header: t('MSG_TXT_MM_CHRAM_AMT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'mmChramDp', header: t('MSG_TXT_MM_CHRAM_DP'), width: '130', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'mmChramBlam', header: t('MSG_TXT_MM_CHRAM_BLAM'), width: '130', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'dlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '130', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'dlqAddDp', header: t('MSG_TXT_DLQ_ADD_DP'), width: '130', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'dlqAddBlam', header: t('MSG_TXT_DLQ_ADD_BLAM'), width: '130', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'svCs', header: t('MSG_TXT_SV_CS'), width: '130', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'svDp', header: t('MSG_TXT_SV_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'svBlam', header: t('MSG_TXT_SV_BLAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'ucAmt', header: t('MSG_TXT_UC_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'ucDp', header: t('MSG_TXT_UC_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'ucBlam', header: t('MSG_TXT_UC_BLAM'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'totDpAmt', header: t('MSG_TXT_TOT_DP_AMT'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'spmtSl', header: t('MSG_TXT_SPMT_SL'), width: '90', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'pdLentLostLog', header: t('MSG_TXT_PD_LENT_LOST_LOG'), width: '90', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'vtAcDv', header: t('MSG_TXT_VT_AC_DV'), width: '100', styleName: 'text-left' },
    { fieldName: 'vtAcBnk', header: t('MSG_TXT_VT_AC_BNK'), width: '120', styleName: 'text-left' },
    { fieldName: 'vtAcNo', header: t('MSG_TXT_VT_AC_NO'), width: '160', styleName: 'text-left' },
    { fieldName: 'ccam', header: t('MSG_TXT_CCAM'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'lsfe', header: t('MSG_TXT_LSFE'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rtlfe1', header: t('MSG_TXT_RTLFE1'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rtlfeIstm1', header: t('MSG_TXT_RTLFE_1_ISTM'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rtlfe2', header: t('MSG_TXT_RTLFE2'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rtlfeIstm2', header: t('MSG_TXT_RTLFE_2_ISTM'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'dpr', header: t('MSG_TXT_DPR'), styleName: 'text-right' },
    { fieldName: 'clctamIchr', header: t('MSG_TXT_CLCTAM_ICHR'), styleName: 'text-left' },
    { fieldName: 'tfDt', header: t('MSG_TXT_TF_DT'), styleName: 'text-center' },
    { fieldName: 'sfk', header: t('MSG_TXT_SFK'), styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.header.minRowHeight = 30;
  view.displayOptions.minTableRowHeight = 34;

  view.setHeaderSummaries({
    visible: true,
    items: [{ height: 40 }],
  });
  view.layoutByColumn('fnt').summaryUserSpans = [{ colspan: 8 }];
  view.layoutByColumn('vtAcDv').summaryUserSpans = [{ colspan: 3 }];
  view.layoutByColumn('dpr').summaryUserSpans = [{ colspan: 4 }];

  view.onCurrentRowChanged = (grid, oldRow, newRow) => {
    const rowData = gridUtil.getRowValue(grid, newRow);
    selectedGridRow.value = null;
    selectedGridRow.value = rowData;
  };

  view.onCellDblClicked = async (g, { dataRow }) => {
    const cntrDtlNo = g.getValue(dataRow, 'cntrDtlNo');
    if (cntrDtlNo) {
      await window.open(`/popup/#/wwbnc-same-customer-contract?cntrDtlNo=${cntrDtlNo}`, 'popup', 'width=1200, height=1100, menubar=no, location=no');
    }
  };
});

</script>

<style lang="scss" scoped>
.kw-popup.kw-popup--window-consult--style {
  width: 100%;
  max-width: 100% !important;
  box-shadow: none !important;
  border: none;
  padding: 0;

  ::v-deep(.kw-popup__header) {
    display: none;
    width: 100% !important;
  }

  ::v-deep(.kw-popup__content) {
    padding: 0;
    width: 100% !important;
    overflow: auto;
    min-height: 100vh;
  }
}

.expansion-item--blue {
  border: 1px solid $primary;
  padding: 0 20px;
  background: #eef6fe;

  &.q-expansion-item--expanded {
    box-shadow: 4px 10px 10px 0 rgb(0 0 0 / 8%);
  }

  .kw-field {
    &.kw-input,
    &.kw-select,
    &.kw-date-picker,
    &.kw-time-picker {
      background-color: #fff;
    }

    &.kw-date-picker,
    &.kw-time-picker {
      flex-basis: auto !important;
    }
  }
}

::v-deep(.q-btn--dense) {
  min-height: 1em !important;
}
</style>
