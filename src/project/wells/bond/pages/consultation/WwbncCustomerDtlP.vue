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
                  :label="$t('MSG_TXT_CNTR_DTL_NO')"
                >
                  <p>{{ customer.cntrNo }}-{{ customer.cntrSn }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_CST_NM')"
                >
                  <p>{{ customer.cstNm }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="customer.copnDvCd === '1' ? $t('MSG_TXT_BIRTH_DATE') : $t('MSG_TXT_ENTRP_NO')"
                >
                  <p v-if="customer.copnDvCd === '1'">
                    ({{ customer.sexDvNm }}){{ customer.bryyMmdd }}
                  </p>
                  <p v-if="customer.copnDvCd === '2'">
                    {{ customer.bzrno }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_MPNO')"
                >
                  <template v-if="customer.tnoCnt1 === '0'">
                    <p class="w100">
                      {{ customer.cntrCralLocaraTno }}-{{ customer.cntrMexnoEncr }}-{{ customer.cntrCralIdvTno }}
                    </p>
                  </template>
                  <template v-if="customer.tnoCnt1 === '1'">
                    <p
                      class="w100"
                      style="color: red;"
                    >
                      {{ customer.cntrCralLocaraTno }}-{{ customer.cntrMexnoEncr }}-{{ customer.cntrCralIdvTno }}
                    </p>
                  </template>
                  <kw-btn
                    borderless
                    dense
                    icon="cellphone"
                    class="ml12"
                  />
                  <kw-btn
                    v-permission:create
                    borderless
                    dense
                    icon="sms"
                    class="ml8"
                    @click="onClickMessageSend"
                  />
                  <kw-btn
                    v-permission:create
                    :label="$t('MSG_BTN_TEL_REJ')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                    @click="onClickTelephoneRej"
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
                  <p>{{ customer.buNotiTpCd }}</p>
                </kw-form-item>
                <kw-form-item no-label>
                  <kw-btn
                    v-permission:read
                    :label="$t('MSG_BTN_BU_NOTI')"
                    dense
                    secondary
                    class="kw-font-caption py2"
                    style="min-height: 20px;"
                    @click="onClickBurdenNotice"
                  />
                  <kw-btn
                    v-permission:create
                    :label="$t('MSG_BTN_CNTRT_INF_CH')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                    @click="onClickContractorInformationChange"
                  />
                  <kw-btn
                    v-permission:create
                    :label="$t('MSG_BTN_ISTLC_INF_CH')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                    @click="onClickContractDetail"
                  />
                  <kw-btn
                    v-permission:create
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
                  <p>{{ customer.rcgvpKnm }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_TEL_NO')"
                >
                  <template v-if="customer.tnoCnt2 === '0'">
                    <p class="w100">
                      {{ customer.istLocaraTno }}-{{ customer.istExnoEncr }}-{{ customer.istIdvTno }}
                    </p>
                  </template>
                  <template v-if="customer.tnoCnt2 === '1'">
                    <p
                      class="w100"
                      style="color: red;"
                    >
                      {{ customer.istLocaraTno }}-{{ customer.istExnoEncr }}-{{ customer.istIdvTno }}
                    </p>
                  </template>
                  <kw-btn
                    borderless
                    dense
                    icon="cellphone"
                    class="ml12"
                  />
                  <kw-btn
                    v-permission:create
                    :label="$t('MSG_BTN_TEL_REJ')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                    @click="onClickTelephoneRej"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_MPNO')"
                >
                  <template v-if="customer.tnoCnt3 === '0'">
                    <p class="w100">
                      {{ customer.istCralLocaraTno }}-{{ customer.istMexnoEncr }}-{{ customer.istCralIdvTno }}
                    </p>
                  </template>
                  <template v-if="customer.tnoCnt3 === '1'">
                    <p
                      class="w100"
                      style="color: red;"
                    >
                      {{ customer.istCralLocaraTno }}-{{ customer.istMexnoEncr }}-{{ customer.istCralIdvTno }}
                    </p>
                  </template>
                  <kw-btn
                    borderless
                    dense
                    icon="cellphone"
                    class="ml12"
                  />
                  <kw-btn
                    v-permission:create
                    borderless
                    dense
                    icon="sms"
                    class="ml8"
                    style="font-size: 16px;"
                    @click="onClickMessageSend"
                  />
                  <kw-btn
                    v-permission:create
                    :label="$t('MSG_BTN_TEL_REJ')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                    @click="onClickTelephoneRej"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CNTR_ADR')"
                  :colspan="2"
                >
                  <p>({{ customer.cntrSppZip }}){{ customer.cntrSppAdr }} {{ customer.cntrSppDtlAdr }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_PRCH_PD_NM')"
                >
                  <p>{{ customer.pdNm }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_INST_ADDR')"
                  :colspan="2"
                >
                  <p>({{ customer.istSppZip }}){{ customer.istSppAdr }} {{ customer.istSppDtlAdr }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_CRTL_MB_STAT')"
                >
                  <p>{{ customer.cntrDtlStatNm }}</p>
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
                    {{ customer.rcpDt }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_INST_DT')"
                >
                  <p>
                    {{ customer.istDt }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CAN_D')"
                >
                  <p>
                    {{ customer.canDt }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_REQD_D')"
                >
                  <p>
                    {{ customer.reqdDt }}
                  </p>
                </kw-form-item>
                <kw-form-item no-label>
                  <kw-btn
                    v-permission:read
                    :label="$t('MSG_BTN_FNT_RS')"
                    dense
                    secondary
                    class="kw-font-caption py2"
                    style="min-height: 20px;"
                    @click="onClickFundTransferResult"
                  />
                  <kw-btn
                    v-permission:create
                    :label="$t('MSG_BTN_BIL_EXCD_RGST')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                    @click="onClickBillingExcdRgst"
                  />
                  <kw-btn
                    v-permission:print
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
                  <p>({{ customer.bnk }}){{ customer.vtAc }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_FNT_DT')"
                >
                  <p>{{ customer.fntDt }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_FNT_STAT')"
                >
                  <p>{{ customer.mpyMthdTpNm }}</p>
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
                    {{ customer.plar }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_SELLER_CTPLC')"
                >
                  <p class="w100">
                    {{ customer.plarCralLocaraTno }}-{{ customer.plarMexnoEncr }}-{{ customer.plarCralIdvTno }}
                  </p>
                  <kw-btn
                    borderless
                    dense
                    icon="cellphone"
                    class="ml12"
                  />
                  <kw-btn
                    v-permission:create
                    borderless
                    dense
                    icon="sms"
                    class="ml8"
                    style="font-size: 16px;"
                    @click="onClickMessageSend"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_CLTN_D')"
                >
                  <p>
                    {{ customer.cltnDt }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_BRMGR')"
                >
                  <p>
                    {{ customer.dsmn }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_BRMGR_CTPLC')"
                >
                  <p class="w100">
                    {{ customer.dsmnCralLocaraTno }}-{{ customer.dsmnMexnoEncr }}-{{ customer.dsmnCralIdvTno }}
                  </p>
                  <kw-btn
                    borderless
                    dense
                    icon="cellphone"
                    class="ml12"
                  />
                  <kw-btn
                    v-permission:create
                    borderless
                    dense
                    icon="sms"
                    class="ml8"
                    style="font-size: 16px;"
                    @click="onClickMessageSend"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_CLTN_D')"
                >
                  <p>
                    {{ customer.cltnDt }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_BLG_BLD_STORE')"
                >
                  <p>{{ customer.bldNm }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_STORE_TNO')"
                >
                  <p class="w100">
                    {{ customer.bldLocaraTno }}-{{ customer.bldMexnoEncr }}-{{ customer.bldIdvTno }}
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
                    {{ customer.vacNo }}
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
                  :label="$t('MSG_TXT_CLCTAM_PSIC')"
                >
                  <p>
                    {{ customer.prtnrNm }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_DBT_NFF')"
                >
                  <p>
                    {{ customer.dfltDt }}
                  </p>
                  <kw-btn
                    v-permission:create
                    :label="$t('MSG_BTN_CB_INF_INQR_AK')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml12"
                    style="min-height: 20px;"
                    @click="onClickCbInformationAsk"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_LWM')"
                >
                  <p>
                    {{ customer.lwmMoCn }}
                  </p>
                </kw-form-item>
                <kw-form-item no-label>
                  <kw-btn
                    v-permission:create
                    :label="$t('MSG_BTN_PTTN_CRT')"
                    dense
                    secondary
                    class="kw-font-caption py2"
                    style="min-height: 20px;"
                    @click="onClickPetitionCreate"
                  />
                  <kw-btn
                    v-permission:create
                    :label="$t('MSG_BTN_LWM_RGST')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                    @click="onClickLawMeasure"
                  />

                  <kw-btn
                    v-permission:read
                    :label="$t('MSG_BTN_VT_DTL')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                    @click="onClickVirtualAccount"
                  />
                  <kw-btn
                    v-permission:create
                    :label="$t('MSG_BTN_DP_RGST')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                    @click="onClickDepositRegistration"
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
                    v-permission:create
                    :label="$t('MSG_BTN_EXCD_RGST')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                    @click="onClickExcdRgst"
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
                  <p>{{ customer.bndClnPsblDvCd }}</p>
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_CLN_PRCS')"
                >
                  <p>{{ customer.bndClnPrcsDvCd }}</p>
                </kw-form-item>
                <kw-form-item no-label>
                  <kw-btn
                    v-permission:read
                    :label="$t('MSG_BTN_TXINV')"
                    dense
                    secondary
                    class="kw-font-caption py2"
                    style="min-height: 20px;"
                    @click="onClickTaxInvoice"
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
                    {{ customer.lwmDpAmt }}
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
                    {{ customer.ucAmt }}
                  </p>
                </kw-form-item>
                <kw-form-item no-label>
                  <kw-btn
                    v-permission:create
                    :label="$t('MSG_TXT_RSG_RGST')"
                    dense
                    secondary
                    class="kw-font-caption py2"
                    style="min-height: 20px;"
                  />
                  <kw-btn
                    v-permission:read
                    :label="$t('MSG_BTN_SV_DTL')"
                    dense
                    secondary
                    class="kw-font-caption py2 ml4"
                    style="min-height: 20px;"
                    @click="onClickService"
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
                :label="$t('MSG_TXT_SMS_HIST')"
              />
              <kw-tab
                name="tab3"
                :label="$t('MSG_TXT_PROM_HIST')"
              />
              <kw-tab
                name="tab4"
                :label="$t('MSG_TXT_LWM_HIST')"
              />
              <kw-tab
                name="tab5"
                :label="$t('MSG_TXT_VST_HIST')"
              />
              <kw-tab
                name="tab6"
                :label="$t('MSG_TXT_DLGTN_ACTI_HIST')"
              />
              <kw-tab
                name="tab7"
                :label="$t('MSG_TXT_CST_CNR_CNSL_HIST')"
              />
            </kw-tabs>
            <kw-observer
              ref="obsTabRef"
              name="obsTab"
            >
              <kw-tab-panels v-model="selectedTab">
                <kw-tab-panel name="tab1">
                  <Wwbnc-customer-dtl-p-counsel-history
                    ref="historyRef"
                    v-model:cst-no="customer.cstNo"
                    v-model:cntr-no="customer.cntrNo"
                    v-model:cntr-sn="customer.cntrSn"
                  />
                </kw-tab-panel>
                <kw-tab-panel name="tab2">
                  <zwbnc-customer-dtl-p-sms
                    ref="smsRef"
                    v-model:cst-no="customer.cstNo"
                    v-model:cntr-no="customer.cntrNo"
                    v-model:cntr-sn="customer.cntrSn"
                  />
                </kw-tab-panel>
                <kw-tab-panel name="tab3">
                  <zwbnc-customer-dtl-p-promise
                    ref="promiseRef"
                    v-model:cst-no="customer.cstNo"
                    v-model:cntr-no="customer.cntrNo"
                    v-model:cntr-sn="customer.cntrSn"
                  />
                </kw-tab-panel>
                <kw-tab-panel name="tab4">
                  <zwbnc-customer-dtl-p-law-measure
                    ref="lawMeasureRef"
                    v-model:cst-no="customer.cstNo"
                    v-model:cntr-no="customer.cntrNo"
                    v-model:cntr-sn="customer.cntrSn"
                  />
                </kw-tab-panel>
                <kw-tab-panel name="tab5">
                  <zwbnc-customer-dtl-p-visit
                    ref="visitRef"
                    v-model:cst-no="customer.cstNo"
                    v-model:cntr-no="customer.cntrNo"
                    v-model:cntr-sn="customer.cntrSn"
                  />
                </kw-tab-panel>
                <kw-tab-panel name="tab6">
                  <zwbnc-customer-dtl-p-foster-counsel
                    ref="counselRef"
                    v-model:cst-no="customer.cstNo"
                    v-model:cntr-no="customer.cntrNo"
                    v-model:cntr-sn="customer.cntrSn"
                  />
                </kw-tab-panel>
                <kw-tab-panel name="tab7">
                  <zwbnc-customer-dtl-p-customer-center
                    ref="centerRef"
                    v-model:cst-no="customer.cstNo"
                    v-model:cntr-no="customer.cntrNo"
                    v-model:cntr-sn="customer.cntrSn"
                  />
                </kw-tab-panel>
              </kw-tab-panels>
            </kw-observer>
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
              v-model="customer.cnslUnuitmCn"
              type="textarea"
              :rows="3"
              :placeholder="$t('MSG_TXT_UNUITM_IN')"
              maxlength="600"
            />
            <div class="row justify-end full-size mt12">
              <kw-btn
                v-permission:create
                :label="$t('MSG_BTN_INTL')"
                secondary
                dense
                @click="onClickUnuitmCnReset"
              />
              <kw-btn
                v-permission:create
                :label="$t('MSG_BTN_SAVE')"
                primary
                dense
                class="ml8"
                @click="onClickUnuitmCnSave"
              />
            </div>

            <h4>{{ $t('MSG_TXT_CNSL_RGST') }}</h4>
            <kw-separator
              size="2"
              class="mt12 mb16 h2"
              color="black1"
            />

            <kw-form
              ref="frmMainRef"
              :cols="1"
              dense
              :label-size="112"
            >
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CNSL_PH')"
                  required
                >
                  <kw-select
                    v-model="customer.cnslPh"
                    :label="$t('MSG_TXT_CNSL_PH')"
                    :options="codes.TEL_CNSL_PH_CD"
                    dense
                    rules="required"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CRNCY_RS')"
                  required
                >
                  <kw-select
                    v-model="customer.crncyRs"
                    :label="$t('MSG_TXT_CRNCY_RS')"
                    :options="codes.TEL_CNSL_RS_CD"
                    dense
                    rules="required"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CST_PRP')"
                  required
                >
                  <kw-select
                    v-model="customer.cstPrp"
                    :label="$t('MSG_TXT_CST_PRP')"
                    :options="codes.CNSL_CST_PRP_CD"
                    dense
                    rules="required"
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
                  <kw-select
                    v-model="customer.bndCnslMtrDvCd"
                    :label="$t('MSG_TXT_CNSL_TP')"
                    :options="codes.BND_CNSL_MTR_DV_CD"
                    dense
                    rules="required"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CST_STAT')"
                  required
                >
                  <kw-select
                    v-model="customer.cstStat"
                    :label="$t('MSG_TXT_CST_STAT')"
                    :options="codes.BND_CNSL_CST_STAT_CD"
                    dense
                    rules="required"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CLN_PSBL')"
                  required
                >
                  <kw-select
                    v-model="customer.clnPsbl"
                    :label="$t('MSG_TXT_CLN_PSBL')"
                    :options="codes.BND_CLN_PSBL_DV_CD"
                    dense
                    rules="required"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_CLN_PRCS')"
                  required
                >
                  <kw-select
                    v-model="customer.clnPrcs"
                    :label="$t('MSG_TXT_CLN_PRCS')"
                    :options="codes.BND_CLN_PRCS_DV_CD"
                    dense
                    rules="required"
                  />
                </kw-form-item>
              </kw-form-row>
            </kw-form>
            <kw-list
              item-padding="16px 0"
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
                      <span class="text-bold kw-font-pt16">{{ $t('MSG_TXT_PROM_RGST') }}</span>
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
                    ref="frmSubRef"
                    :label-size="100"
                    dense
                    :cols="1"
                  >
                    <kw-form-row>
                      <kw-form-item
                        :label="$t('MSG_TXT_PROM_DTM')"
                        :required="isFlag === true"
                      >
                        <div class="column">
                          <kw-date-picker
                            v-model="customer.promDt"
                            :label="$t('MSG_TXT_PROM_DTM')"
                            dense
                            :placeholder="$t('MSG_TXT_SELT')"
                            :rules="{required: isFlag === true}"
                          />
                          <kw-time-picker
                            v-model="customer.promHh"
                            dense
                            class="mt8"
                            :rules="{required: isFlag === true}"
                          />
                        </div>
                      </kw-form-item>
                    </kw-form-row>
                    <kw-form-row>
                      <kw-form-item
                        :label="$t('MSG_TXT_PROM_TP')"
                        :required="isFlag === true"
                      >
                        <kw-select
                          v-model="customer.promTp"
                          :label="$t('MSG_TXT_PROM_TP')"
                          :options="codes.CLCTAM_PROM_TP_CD"
                          dense
                          :placeholder="$t('MSG_TXT_SELT')"
                          :rules="{required: isFlag === true}"
                        />
                      </kw-form-item>
                    </kw-form-row>
                    <kw-form-row>
                      <kw-form-item
                        :label="$t('MSG_TXT_PROM_AMT')"
                        :required="isFlag === true"
                      >
                        <kw-input
                          v-model="customer.promAmt"
                          :label="$t('MSG_TXT_PROM_AMT')"
                          dense
                          regex="num"
                          :rules="{required: isFlag === true}"
                          maxlength="20"
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
              :rows="9"
              :placeholder="$t('MSG_TXT_CNSL_IN')"
              class="mt12"
            />
          </div>
        </kw-scroll-area>
        <div class="pr20 column">
          <kw-separator spaced="20px" />
          <div class="row justify-end full-size ">
            <kw-btn
              v-permission:create
              :label="$t('MSG_BTN_INTL')"
              secondary
              dense
              @click="onClickCnslRgstReset"
            />
            <kw-btn
              v-permission:create
              :label="$t('MSG_BTN_SAVE')"
              primary
              dense
              class="ml8"
              @click="onClickCounselSave"
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
import { defineGrid, codeUtil, getComponentType, useDataService, gridUtil, useGlobal, confirm, popupUtil, stringUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

import ZwbncCustomerDtlPSms from '~sms-common/bond/pages/consultation/ZwbncCustomerDtlPSms.vue';
import ZwbncCustomerDtlPLawMeasure from '~sms-common/bond/pages/consultation/ZwbncCustomerDtlPLawMeasure.vue';
import ZwbncCustomerDtlPPromise from '~sms-common/bond/pages/consultation/ZwbncCustomerDtlPPromise.vue';
import ZwbncCustomerDtlPCustomerCenter from '~sms-common/bond/pages/consultation/ZwbncCustomerDtlPCustomerCenter.vue';
import ZwbncCustomerDtlPVisit from '~sms-common/bond/pages/consultation/ZwbncCustomerDtlPVisit.vue';
import ZwbncCustomerDtlPFosterCounsel from '~sms-common/bond/pages/consultation/ZwbncCustomerDtlPFosterCounsel.vue';
import WwbncCustomerDtlPCounselHistory from './WwbncCustomerDtlPCounselHistory.vue';

const { t } = useI18n();
const dataService = useDataService();
const { modal, notify } = useGlobal();
const obsTabRef = ref();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'TEL_CNSL_PH_CD',
  'TEL_CNSL_RS_CD',
  'CNSL_CST_PRP_CD',
  'BND_CNSL_CST_STAT_CD',
  'BND_CLN_PSBL_DV_CD',
  'BND_CLN_PRCS_DV_CD',
  'CLCTAM_PROM_TP_CD',
  'BND_CNSL_MTR_DV_CD',

);

const props = defineProps({
  cstNo: {
    type: String,
    default: null,
  },
  cntrNo: {
    type: String,
    default: null,
  },
  cntrSn: {
    type: String,
    default: null,
  },

});

const grdMainRef = ref(getComponentType('KwGrid'));
const selectedTab = ref('tab1');
const selectedGridRow = ref(null);
const historyRef = ref();
const smsRef = ref();
const promiseRef = ref();
const lawMeasureRef = ref();
const visitRef = ref();
const counselRef = ref();
const centerRef = ref();
const isFlag = ref();
const isFlag2 = ref('N');

popupUtil.registerCloseEvent();

watch(selectedGridRow, (newValue) => {
  if (!newValue) {
    const view = grdMainRef.value.getView();
    view.clearCurrent();
  }
});

watch(selectedTab, (newTab) => {
  if (newTab === 'tab1') {
    historyRef.value.fetchCounselHistory();
  }
  if (newTab === 'tab2') {
    smsRef.value.fetchData();
  }
  if (newTab === 'tab3') {
    promiseRef.value.fetchData();
  }
  if (newTab === 'tab4') {
    lawMeasureRef.value.fetchData();
  }
  if (newTab === 'tab5') {
    visitRef.value.fetchData();
  }
  if (newTab === 'tab6') {
    counselRef.value.fetchData();
  }
  if (newTab === 'tab7') {
    centerRef.value.fetchData();
  }
});

const customer = ref({});

const frmMainRef = ref(getComponentType('KwForm'));
const frmSubRef = ref(getComponentType('KwForm'));

let cachedParams;
const searchParams = ref({
  schBaseYm: '',
  schCstNo: props.cstNo,
  schCntrNo: props.cntrNo,
  schCntrSn: props.cntrSn,
});

let cachedSaveParams;
const saveUnuitmCnParams = ref({
  bndUnuitmId: '',
  bndCntrTpCd: '',
  bndBizDvCd: '',
  cstNo: '',
  cntrNo: '',
  cntrSn: '',
  clctnOjOgTpCd: '',
  clctnOjPrtnrNo: '',
  cnslUnuitmCn: '',
  cvcpCn: '',
});

const saveCounselParams = ref({
  telCnslId: '',
  bndCntrTpCd: '',
  bndBizDvCd: '',
  cstNo: '',
  cntrNo: '',
  cntrSn: '',
  clctnOjOgTpCd: '',
  clctnOjPrtnrNo: '',
  clctnOjPrtnrBzrno: '',
  clctamPrtnrNo: '',
  telCnslPhCd: '',
  bndCnslMtrDvCd: '',
  telCnslRsCd: '',
  cnslCstPrpCd: '',
  telCnslCn: '',
  bndClnPsblDvCd: '',
  bndCnslCstStatCd: '',
  bndClnPrcsDvCd: '',
  dpr: '',
  rdgId: '',
  promBooId: '',
  promDt: '',
  promHh: '',
  clctamPromTpCd: '',
  clnPromAmt: '',
  promCn: '',
  promFshYn: '',
});

async function fetchCustomerDetail() {
  const response = await dataService.get('/sms/wells/bond/bond-counsel/customer-details', { params: cachedParams });
  const details = response.data;

  const gridView = grdMainRef.value.getView();
  gridView.getDataSource().setRows(details);

  selectedGridRow.value = null;

  const res = await dataService.get('/sms/wells/bond/bond-counsel/counsel_registration', { params: cachedParams });
  if (!isEmpty(res.data.cnslPh)) {
    customer.value.cnslPh = res.data.cnslPh;
  }
  if (!isEmpty(res.data.crncyRs)) {
    customer.value.crncyRs = res.data.crncyRs;
  }
  if (!isEmpty(res.data.cstPrp)) {
    customer.value.cstPrp = res.data.cstPrp;
  }
  if (!isEmpty(res.data.dprNm)) {
    customer.value.dpr = res.data.dprNm;
  }
  if (!isEmpty(res.data.cnslTp)) {
    customer.value.bndCnslMtrDvCd = res.data.cnslTp;
  }
  if (!isEmpty(res.data.cstStat)) {
    customer.value.cstStat = res.data.cstStat;
  }
  if (!isEmpty(res.data.clnPsbl)) {
    customer.value.clnPsbl = res.data.clnPsbl;
  }
  if (!isEmpty(res.data.clnPrcs)) {
    customer.value.clnPrcs = res.data.clnPrcs;
  }
}

async function fetchData() {
  if (props.cstNo === '') {
    return;
  }
  const response = await dataService.get('/sms/wells/bond/bond-counsel/customer-detail', { params: cachedParams });
  customer.value = response.data;

  customer.value.lwscBilAmt = stringUtil.getNumberWithComma(customer.value.lwscBilAmt);
  customer.value.lwmDpAmt = stringUtil.getNumberWithComma(customer.value.lwmDpAmt);
  customer.value.lwscBlam = stringUtil.getNumberWithComma(customer.value.lwscBlam);
  customer.value.ucAmt = stringUtil.getNumberWithComma(customer.value.ucAmt);

  const res = await dataService.get('/sms/wells/bond/bond-counsel/unusual-articles', { params: cachedParams });
  customer.value.cnslUnuitmCn = res.data.cnslUnuitmCn;

  await fetchCustomerDetail();
}

// TODO: 특기사항 초기화 버튼 클릭 이벤트
async function onClickUnuitmCnReset() {
  customer.value.cnslUnuitmCn = '';
}

// TODO: 상담등록 초기화 버튼 클릭 이벤트
async function onClickCnslRgstReset() {
  customer.value.cnslPh = '';
  customer.value.crncyRs = '';
  customer.value.cstPrp = '';
  customer.value.dpr = '';
  customer.value.bndCnslMtrDvCd = '';
  customer.value.cstStat = '';
  customer.value.clnPsbl = '';
  customer.value.clnPrcs = '';
  customer.value.promDt = '';
  customer.value.promHh = '';
  customer.value.promTp = '';
  customer.value.promAmt = '';
  customer.value.cnslCn = '';
}

// TODO: 세금계산서
async function onClickTaxInvoice() {
  await popupUtil.open('/popup/#/contract/zwcta-tax-invoice-mgt', { width: 1292, height: 1100 }, false);
}

// TODO: 입금등록
async function onClickDepositRegistration() {
  await modal({
    component: 'ZwwdbDepositRegP',
    componentProps: customer.value,
  });
}

// TODO: 제외등록
async function onClickExcdRgst() {
  const { cstNo, cntrNo, cntrSn } = customer.value;
  await popupUtil.open(`/popup/#/bond/wwbnc-rental-resign-expected-mgt?cstNo=${cstNo}&cntrNo=${cntrNo}&cntrSn=${cntrSn}&cntrDtlNo=${cntrNo}-${cntrSn}`, { width: 1292, height: 1100 }, false);
}

// TODO: CB정보 조회요청
async function onClickCbInformationAsk() {
  // TODO: ZwbncCreditBureauInformationP 화면은 sfkVal으로 받고 있어서 추가
  // customer.value 를 통으로 넘기게 되어 있어 임시 소스임 수정 필요
  if (customer.value.sfk) {
    customer.value.sfkVal = customer.value.sfk;
  }
  await modal({
    component: 'ZwbncCreditBureauInformationP',
    componentProps: {
      cstNo: customer.value.cstNo,
      sfkVal: customer.value.sfk,
    },
  });
}

// TODO: 청구제외등록
async function onClickBillingExcdRgst() {
  await modal({
    component: 'ZwwdaBillingExcdRgstP',
    componentProps: customer.value,
  });
}

// TODO: 이체결과
async function onClickFundTransferResult() {
  const { cstNo, cntrNo, cntrSn } = customer.value;
  await popupUtil.open(`/popup/#/withdrawal/zwwda-create-itemization-mgt?cstNo=${cstNo}&cntrNo=${cntrNo}&cntrSn=${cntrSn}`, { width: 1292, height: 1100 }, false);
}

// TODO: 설치처정보변경
async function onClickContractDetail() {
  const { cstNo, cntrNo, cntrSn } = customer.value;
  await popupUtil.open(`/popup/#/service/wwsnb-installation-location-detail-mgt?cstNo=${cstNo}&cntrNo=${cntrNo}&cntrSn=${cntrSn}&cntrDtlNo=${cntrNo}-${cntrSn}`, { width: 1292, height: 1100 }, false);
}

// TODO: 계약자정보변경
async function onClickContractorInformationChange() {
  const { cstNo, copnDvCd, bzrno } = customer.value;
  await popupUtil.open(`/popup/#/customer/zwcsa-customer-mgt/zwcsa-indv-customer-mod?cstNo=${cstNo}&copnDvCd=${copnDvCd}&bzrno=${bzrno}`, { width: 1292, height: 1100 }, { cstNo, copnDvCd, bzrno }, false);
}

// TODO: 부담통보
async function onClickBurdenNotice() {
  const { cstNo, cntrNo, cntrSn } = customer.value;
  await popupUtil.open(`/popup/#/fee/zwdee-burden-deduction-notice-reg?cstNo=${cstNo}&cntrNo=${cntrNo}&cntrSn=${cntrSn}`, { width: 1292, height: 1100 }, false);
}

// TODO: 문자발송
async function onClickMessageSend() {
  await modal({
    component: 'ZwbncMessageSendP',
    componentProps: {
      listType: 'customer',
      dataList: customer.value,
      cntrType: 'i',
    },
  });
}

// TODO: 고객카드 출력 팝업
async function onClickCustomerCardPrint() {
  await modal({
    component: 'ZwbncCustomerCardP',
    componentProps: customer.value,
  });
}

// TODO: 전화거부
async function onClickTelephoneRej() {
  await modal({
    component: 'ZwbncCounselTelephoneRejMgtP',
    componentProps: customer.value,
  });
}

// TODO: 서비스 상세
async function onClickService() {
  await modal({
    component: 'WwbncServiceDtlP',
    componentProps: customer.value,
  });
}

// TODO: 법조치등록
async function onClickLawMeasure() {
  const { result: isChanged } = await modal({
    component: 'ZwbncLawMeasureMgtP',
    componentProps: customer.value,
  });

  if (isChanged) {
    selectedTab.value = 'tab4';
    await lawMeasureRef.value.fetchData();
  }
}

// TODO: 가상상세 목록 팝업
async function onClickVirtualAccount() {
  await modal({
    component: 'ZwbncVirtualAccountP',
    componentProps: customer.value,
  });
}

// TODO: 방문이력 관리 팝업
async function onClickVisit() {
  const { result: isChanged } = await modal({
    component: 'ZwbncVisitMgtP',
    componentProps: customer.value,
  });

  if (isChanged) {
    selectedTab.value = 'tab5';
    await visitRef.value.fetchData();
  }
}

// TODO: 소장 생성 팝업
async function onClickPetitionCreate() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  const dataParams = [];
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  checkedRows.forEach((obj) => {
    const cntrDtlNo = `${obj.cntrNo}-${obj.cntrSn}`;
    dataParams.push({
      baseYm: obj.baseYm,
      cntrDtlNo,
    });
  });

  const userObjects = ref(dataParams);

  await modal({
    component: 'ZwbncPetitionCreateP',
    componentProps: {
      userObjects: userObjects.value,
    },
  });
}

async function onClickUnuitmCnSave() {
  Object.assign(saveUnuitmCnParams.value, customer.value);

  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  cachedSaveParams = cloneDeep(saveUnuitmCnParams.value);

  const res = await dataService.post('/sms/wells/bond/bond-counsel/customer-detail/unuitmCn', cachedSaveParams);

  if (res.data) {
    console.log(res);
  }
}

async function onClickCounselSave() {
  saveCounselParams.value.cstNo = customer.value.cstNo;
  saveCounselParams.value.cntrNo = customer.value.cntrNo;
  saveCounselParams.value.cntrSn = customer.value.cntrSn;
  saveCounselParams.value.clctamPrtnrNo = customer.value.prtnrNo;

  saveCounselParams.value.telCnslPhCd = customer.value.cnslPh;
  saveCounselParams.value.telCnslRsCd = customer.value.crncyRs;
  saveCounselParams.value.cnslCstPrpCd = customer.value.cstPrp;
  saveCounselParams.value.dprNm = customer.value.dpr;
  saveCounselParams.value.bndCntrTpCd = '01';
  saveCounselParams.value.bndCnslMtrDvCd = customer.value.bndCnslMtrDvCd;
  saveCounselParams.value.bndCnslCstStatCd = customer.value.cstStat;
  saveCounselParams.value.bndClnPsblDvCd = customer.value.clnPsbl;
  saveCounselParams.value.bndClnPrcsDvCd = customer.value.clnPrcs;
  saveCounselParams.value.telCnslCn = customer.value.cnslCn;
  saveCounselParams.value.bndBizDvCd = customer.value.bndBizDvCd;

  saveCounselParams.value.promDt = customer.value.promDt;
  saveCounselParams.value.promHh = customer.value.promHh;
  saveCounselParams.value.clctamPromTpCd = customer.value.clctamPromTpCd;
  saveCounselParams.value.clnPromAmt = customer.value.clnPromAmt;
  saveCounselParams.value.promCn = customer.value.cnslCn;

  if (await frmMainRef.value.alertIfIsNotModified()) { return; }
  if (!await frmMainRef.value.validate()) { return; }
  if (isFlag2.value === 'Y') {
    if (!await frmSubRef.value.validate()) { return; }
  }
  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  cachedSaveParams = cloneDeep(saveCounselParams.value);
  const res = await dataService.post('/sms/wells/bond/bond-counsel/customer-detail/counsel', cachedSaveParams);

  if (res.data) {
    window.location.reload();
  }
}

onMounted(async () => {
  const targetFirst = document.querySelectorAll('.q-item');
  targetFirst.forEach((target) => target.addEventListener('click', () => {
    if (isFlag2.value === 'N') {
      isFlag2.value = 'Y';
      isFlag.value = true;
    } else {
      isFlag2.value = 'N';
      isFlag.value = false;
    }
  }));

  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ctt' },
    { fieldName: 'bndBizDvCd' },
    { fieldName: 'bndBizDvNm' },
    { fieldName: 'pdClsfNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'dlqMcn' },
    { fieldName: 'authRsgCnfmdt' },
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
    { fieldName: 'dlqAdamtBlam', dataType: 'number' },
    { fieldName: 'svCs', dataType: 'number' },
    { fieldName: 'svDp', dataType: 'number' },
    { fieldName: 'svBlam', dataType: 'number' },
    { fieldName: 'ucAmt', dataType: 'number' },
    { fieldName: 'ucDp', dataType: 'number' },
    { fieldName: 'ucBlam', dataType: 'number' },
    { fieldName: 'totDpAmt', dataType: 'number' },
    { fieldName: 'spmtSl', dataType: 'number' },
    { fieldName: 'lsRntf', dataType: 'number' },
    { fieldName: 'vacVncoDvCd' },
    { fieldName: 'bnkNm' },
    { fieldName: 'vacNo' },
    { fieldName: 'ccam', dataType: 'number' },
    { fieldName: 'lsfe', dataType: 'number' },
    { fieldName: 'rtlfe1', dataType: 'number' },
    { fieldName: 'rtlfeIstm1', dataType: 'number' },
    { fieldName: 'rtlfe2', dataType: 'number' },
    { fieldName: 'rtlfeIstm2', dataType: 'number' },
    { fieldName: 'dprNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrNm' },
    { fieldName: 'bndTfDt' },
    { fieldName: 'sfkVal' },
    { fieldName: 'cstNo' },
    { fieldName: 'baseYm' },
  ];

  const columns = [
    { fieldName: 'ctt', header: t('MSG_TXT_FNT'), width: '60', styleName: 'text-center', headerSummaries: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'bndBizDvCd', header: t('MSG_TXT_TASK_DIV'), width: '80', styleName: 'text-center', visible: false },
    { fieldName: 'bndBizDvNm', header: t('MSG_TXT_TASK_DIV'), width: '80', styleName: 'text-center' },
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRD_GRP'), width: '160', styleName: 'text-left' },
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '300', styleName: 'text-left' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '100', styleName: 'text-center', visible: false },
    {
      fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      styleName: 'text-center',
      width: '160',

      displayCallback(grid, index) {
        const { cntrNo: no1, cntrSn: no2 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}`;
        }
      },
    },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '80', styleName: 'text-center' },
    { fieldName: 'authRsgCnfmdt', header: t('MSG_TXT_AUTH_RSG_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
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
    { fieldName: 'dlqAdamtBlam', header: t('MSG_TXT_DLQ_ADD_BLAM'), width: '130', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'svCs', header: t('MSG_TXT_SV_CS'), width: '130', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'svDp', header: t('MSG_TXT_SV_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'svBlam', header: t('MSG_TXT_SV_BLAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'ucAmt', header: t('MSG_TXT_UC_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'ucDp', header: t('MSG_TXT_UC_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'ucBlam', header: t('MSG_TXT_UC_BLAM'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'totDpAmt', header: t('MSG_TXT_TOT_DP_AMT'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'spmtSl', header: t('MSG_TXT_SPMT_SL'), width: '90', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'lsRntf', header: t('MSG_TXT_PD_LENT_LOST_LOG'), width: '90', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'vacVncoDvCd', header: t('MSG_TXT_VT_AC_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'bnkNm', header: t('MSG_TXT_VT_AC_BNK'), width: '120', styleName: 'text-center' },
    { fieldName: 'vacNo', header: t('MSG_TXT_VT_AC_NO'), width: '160', styleName: 'text-center' },
    { fieldName: 'ccam', header: t('MSG_TXT_CCAM'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'lsfe', header: t('MSG_TXT_LSFE'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rtlfe1', header: t('MSG_TXT_RTLFE1'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rtlfeIstm1', header: t('MSG_TXT_RTLFE_1_ISTM'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rtlfe2', header: t('MSG_TXT_RTLFE2'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'rtlfeIstm2', header: t('MSG_TXT_RTLFE_2_ISTM'), styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } },
    { fieldName: 'dprNm', header: t('MSG_TXT_DPR'), styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: '', width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_CLCTAM_ICHR'), styleName: 'text-center' },
    { fieldName: 'bndTfDt', header: t('MSG_TXT_TF_DT'), styleName: 'text-center', width: '120', datetimeFormat: 'date' },
    { fieldName: 'sfkVal', header: t('MSG_TXT_SFK'), styleName: 'text-center', width: '150' },
    { fieldName: 'cstNo', header: '', width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'baseYm', header: '', width: '100', styleName: 'text-center', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.header.minRowHeight = 30;
  view.displayOptions.minTableRowHeight = 34;

  view.setFixedOptions({
    colCount: 6,
  });

  view.setHeaderSummaries({
    visible: true,
    items: [{ height: 40 }],
  });
  view.layoutByColumn('ctt').summaryUserSpans = [{ colspan: 11 }];
  view.layoutByColumn('vacVncoDvCd').summaryUserSpans = [{ colspan: 3 }];
  view.layoutByColumn('dprNm').summaryUserSpans = [{ colspan: 4 }];

  view.onCurrentRowChanged = (grid, oldRow, newRow) => {
    const rowData = gridUtil.getRowValue(grid, newRow);
    selectedGridRow.value = null;
    selectedGridRow.value = rowData;
  };

  view.onCellDblClicked = async (g, { dataRow }) => {
    const cstNo = g.getValue(dataRow, 'cstNo');
    const cntrNo = g.getValue(dataRow, 'cntrNo');
    const cntrSn = g.getValue(dataRow, 'cntrSn');
    const bndBizDvCd = g.getValue(dataRow, 'bndBizDvCd');
    if (cstNo) {
      await popupUtil.open(`/popup/#/wwbnc-same-customer-contract?cstNo=${cstNo}&cntrNo=${cntrNo}&cntrSn=${cntrSn}&bndBizDvCd=${bndBizDvCd}`, { width: 1292, height: 1100 }, false);
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
