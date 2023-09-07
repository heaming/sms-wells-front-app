<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbSalesPerformanceListM - 매출실적 현황 - W-CL-U-0038M01
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.03.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매출실적 현황 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs
      v-model="selectedTab"
    >
      <kw-tab
        name="mainTab"
        :label="$t('MSG_TIT_SPAY_EXCP')"
      />
      <kw-tab
        name="detailTab"
        :label="$t('MSG_TIT_SPAY')"
      />
    </kw-tabs>
    <kw-tab-panels
      v-model="selectedTab"
    >
      <kw-tab-panel name="mainTab">
        <kw-search
          one-row
          :cols="2"
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_CNTR_DTL_NO')"
              required
            >
              <zctz-contract-detail-number
                v-model:cntr-no="searchParams.cntrNo"
                v-model:cntr-sn="searchParams.cntrSn"
                :label="$t('MSG_TXT_CNTR_DTL_NO')"
                rules="required"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_SL_Y')"
            >
              <kw-date-range-picker
                v-model:from="searchParams.baseYearFrom"
                v-model:to="searchParams.baseYearTo"
                type="year"
                rules="date_range_months:1"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <template #left>
              <h3 class="mb0">
                {{ $t('MSG_TXT_BASIC_INFO') }}
              </h3>
            </template>
            <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
          </kw-action-top>

          <kw-form
            v-show="isShowRental"
            :cols="4"
            align-content="left"
            dense
          >
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_TASK_DIV')"
              >
                <p>{{ baseInformationRental.sellTpDtlCd }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CNTR_DTL_NO')"
              >
                <p>{{ baseInformationRental.cntrDtlNo }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CST_NM')"
              >
                <p>{{ baseInformationRental.cstKnm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_PD_INF')"
              >
                <p>{{ baseInformationRental.pdNm }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_EXN_TP')"
              >
                <p>{{ baseInformationRental.lcmgu2Nm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ALNC_DV')"
              >
                <p>{{ baseInformationRental.lcetc8Nm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ATT_RCPDT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationRental.cntrDt) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_SL_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationRental.slRcogDt) }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_CANC_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationRental.canDt) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_FSH_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationRental.fshDt) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_REDF_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationRental.redfDt) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ADSB_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationRental.adsbDt) }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_PD_DC_CLASS')"
              >
                <p>{{ baseInformationRental.lcgub3 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_FNT_INF_D')"
              >
                <p>{{ baseInformationRental.sellDscDvCd }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_RGST_CS_DSC')"
              >
                <p>
                  {{ baseInformationRental.rentalRgstCost }}
                </p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_RTLFE1_MCNT_WON')"
              >
                <p>
                  {{ baseInformationRental.rentalPtrm }}
                </p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_SL_AGG_AMT')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationRental.slAggAmt)) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DSC_AGG_AMT')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationRental.dscAggAmt)) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CTR_AGG_AMT')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationRental.ctrAggAmt)) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DP_AGG_AMT')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationRental.slDpAggAmt)) }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_UC_AMT')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationRental.thmUcBlam)) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DLQ_AMT')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationRental.thmOcDlqAmt)) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_SL_STP')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationRental.slStpAmt)) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ADD_AMT')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationRental.eotDlqAddAmt)) }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_DFA_AMT')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationRental.dfaProcsAmt)) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DFA_DP_AMT')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationRental.dfaAmt)) }}</p>
              </kw-form-item>
            </kw-form-row>
          </kw-form>

          <kw-form
            v-show="isShowLease"
            :cols="4"
            align-content="left"
            dense
          >
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_TASK_DIV')"
              >
                <p>{{ baseInformationLease.sellTpDtlCd }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CNTR_DTL_NO')"
              >
                <p>{{ baseInformationLease.cntrDtlNo }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CST_NM')"
              >
                <p>{{ baseInformationLease.cstKnm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_PD_INF')"
              >
                <p>{{ baseInformationLease.pdNm }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_EXN_TP')"
              >
                <p>{{ baseInformationLease.lcmgu2Nm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ALNC_DV')"
              >
                <p>{{ baseInformationLease.lcetc8Nm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ATT_RCPDT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationLease.cntrDt) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_SL_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationLease.slRcogDt) }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_CANC_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationLease.canDt) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_FSH_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationLease.fshDt) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_REDF_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationLease.redfDt) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ADSB_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationLease.adsbDt) }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_PD_DC_CLASS')"
              >
                <p>{{ baseInformationLease.lcgub3 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_FNT_INF_D')"
              >
                <p>{{ baseInformationLease.sellDscDvCd }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_RGST_CS_DSC')"
              >
                <p>
                  {{ baseInformationLease.rentalRgstCost }}
                </p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_RTLFE1_MCNT_WON')"
              >
                <p>
                  {{ baseInformationLease.rentalPtrm }}
                </p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_SL_AGG_AMT')"
              >
                <p>{{ baseInformationLease.slAggAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DSC_AGG_AMT')"
              >
                <p>{{ baseInformationLease.dscAggAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CTR_AGG_AMT')"
              >
                <p>{{ baseInformationLease.ctrAggAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DP_AGG_AMT')"
              >
                <p>{{ baseInformationLease.slDpAggAmt }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_UC_AMT')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationLease.thmUcBlam)) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DLQ_AMT')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationLease.thmOcDlqAmt)) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_SL_STP')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationLease.slStpAmt)) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ADD_AMT')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationLease.eotDlqAddAmt)) }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_DFA_AMT')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationLease.dfaProcsAmt)) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DFA_DP_AMT')"
              >
                <p>{{ stringUtil.getNumberWithComma(toInteger(baseInformationLease.dfaAmt)) }}</p>
              </kw-form-item>
            </kw-form-row>
          </kw-form>

          <kw-form
            v-show="isShowMembership"
            :cols="4"
            align-content="left"
            dense
          >
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_TASK_DIV')"
              >
                <p>{{ baseInformationMembership.sellTpDtlCd }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CNTR_DTL_NO')"
              >
                <p>{{ baseInformationMembership.cntrDtlNo }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CST_NM')"
              >
                <p>{{ baseInformationMembership.cstKnm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_PD_INF')"
              >
                <p>{{ baseInformationMembership.pdNm }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_FNT_INF')"
              >
                <p>{{ baseInformationMembership.sellDscDvCd }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CNTR_DATE')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationMembership.cntrDt) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CNFM_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationMembership.slRcogDt) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CANC_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationMembership.canDt) }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_J_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationMembership.fshDt) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_WDWAL_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationMembership.redfDt) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_FSH_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationMembership.adsbDt) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_MM_SSPCS')"
              >
                <p>{{ baseInformationMembership.rentalRgstCost }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_DSC_AMT')"
              >
                <p>{{ baseInformationMembership.dscAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_SL_AGG_AMT')"
              >
                <p>{{ baseInformationMembership.slAggAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DSC_AGG_AMT')"
              >
                <p>{{ baseInformationMembership.dscAggAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CTR_AGG_AMT')"
              >
                <p>{{ baseInformationMembership.ctrAggAmt }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_DP_AGG_AMT')"
              >
                <p>{{ baseInformationMembership.slDpAggAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_UC_AMT')"
              >
                <p>{{ baseInformationMembership.thmUcBlam }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DLQ_AMT_ADAMT')"
              >
                <p>{{ baseInformationMembership.thmOcDlqAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DFA_AMT')"
              >
                <p>{{ baseInformationMembership.dfaProcsAmt }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_DFA_DP_AMT')"
              >
                <p>{{ baseInformationMembership.dfaAmt }}</p>
              </kw-form-item>
            </kw-form-row>
          </kw-form>

          <kw-form
            v-show="isShowRegular"
            :cols="4"
            align-content="left"
            dense
          >
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_TASK_DIV')"
              >
                <p>{{ baseInformationRegular.sellTpDtlCd }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CNTR_DTL_NO')"
              >
                <p>{{ baseInformationRegular.cntrDtlNo }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CST_NM')"
              >
                <p>{{ baseInformationRegular.cstKnm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_RCPDT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationRegular.cntrDt) }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_SL_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationRegular.slRcogDt) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_PKG_INF')"
              >
                <p>{{ baseInformationRegular.pdNm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_MCHN_INF')"
              >
                <p>{{ baseInformationRegular.lcck04 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CANC_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationRegular.canDt) }}</p>
              </kw-form-item>
            </kw-form-row><kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_SPP_DT')"
              >
                <p>{{ stringUtil.getDateFormat(baseInformationRegular.sppDtm) }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_FNT_INF')"
              >
                <p>{{ baseInformationRegular.sellDscDvCd }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_SL_AGG_AMT')"
              >
                <p>{{ baseInformationRegular.slAggAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DSC_AGG_AMT')"
              >
                <p>{{ baseInformationRegular.dscAggAmt }}</p>
              </kw-form-item>
            </kw-form-row><kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_CTR_AGG_AMT')"
              >
                <p>{{ baseInformationRegular.ctrAggAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DP_AGG_AMT')"
              >
                <p>{{ baseInformationRegular.slDpAggAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_UC_AMT')"
              >
                <p>{{ baseInformationRegular.thmUcBlam }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_BIL_UC_AMT')"
              >
                <p>{{ baseInformationRegular.eotUcAmt }}</p>
              </kw-form-item>
            </kw-form-row><kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_DLQ_AMT')"
              >
                <p>{{ baseInformationRegular.thmOcDlqAmt }}</p>
              </kw-form-item>
            </kw-form-row>
          </kw-form>

          <kw-separator />

          <h3 class="mb0">
            {{ $t('MSG_TXT_SL_PERF_MCBY') }}
          </h3>

          <kw-action-top>
            <template #left>
              <kw-paging-info
                v-model:page-index="pageInfo.pageIndex"
                v-model:page-size="pageInfo.pageSize"
                :total-count="pageInfo.totalCount"
                :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
                @change="fetchSalesData"
              />
            </template>
            <kw-btn
              icon="download_on"
              :disable="pageInfo.totalCount === 0"
              dense
              secondary
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              @click="onClickExportView"
            />
            <kw-separator
              vertical
              inset
              spaced
            />
            <kw-btn
              dense
              secondary
              :label="$t('MSG_BTN_CCAM_ET')"
              @click="onClickCcamEt"
            />
            <kw-btn
              dense
              secondary
              :label="$t('MSG_BTN_PRM_ET')"
              @click="onClickPrmEt"
            />
            <kw-separator
              vertical
              inset
              spaced
            />
            <kw-btn
              :label="$t('MSG_BTN_DP_RFND_IZ_INQR')"
              primary
              dense
              @click="onClickDpRfndIz"
            />
          </kw-action-top>

          <kw-grid
            v-show="isShowRental"
            ref="grdRentalRef"
            name="grdRental"
            :visible-rows="pageInfo.pageSize - 1"
            @init="initGrdRental"
          />
          <kw-grid
            v-show="isShowLease"
            ref="grdLeaseRef"
            name="grdLease"
            :visible-rows="pageInfo.pageSize - 1"
            @init="initGrdLease"
          />
          <kw-grid
            v-show="isShowMembership"
            ref="grdMembershipRef"
            name="grdMembership"
            :visible-rows="pageInfo.pageSize - 1"
            @init="initGrdMembership"
          />
          <kw-grid
            v-show="isShowRegular"
            ref="grdRegularRef"
            name="grdRegular"
            :visible-rows="pageInfo.pageSize - 1"
            @init="initGrdRegular"
          />
        </div>
        <kw-pagination
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @change="fetchSalesData"
        />
      </kw-tab-panel>
      <kw-tab-panel name="detailTab">
        <!-- <wwdcb-sales-performance-list-m-single-payment
          v-model:selected-link-id="selectedLinkId"
        /> -->
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService, useMeta, useGlobal, stringUtil, notify } from 'kw-lib';
import { cloneDeep, toInteger } from 'lodash-es';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
// import WwdcbSalesPerformanceListMSinglePayment from './WwdcbSalesPerformanceListMSinglePayment.vue';

const selectedTab = ref('mainTab');
const now = dayjs();
const { t } = useI18n();
const { modal } = useGlobal();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();
const router = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRentalRef = ref(getComponentType('KwGrid'));
const grdLeaseRef = ref(getComponentType('KwGrid'));
const grdMembershipRef = ref(getComponentType('KwGrid'));
const grdRegularRef = ref(getComponentType('KwGrid'));

const isShowRental = ref(true);
const isShowLease = ref(false);
const isShowMembership = ref(false);
const isShowRegular = ref(false);

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약상세번호
  baseYearFrom: now.format('YYYY'),
  baseYearTo: now.format('YYYY'),
});

const baseInfo = ref({});
const baseInformationRental = ref({});
const baseInformationLease = ref({});
const baseInformationMembership = ref({});
const baseInformationRegular = ref({});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
async function fetchRentalData() {
  const res = await dataService.get('/sms/wells/closing/sales-performance/rental', { params: cachedParams });
  baseInformationRental.value = res.data;
}

async function fetchLeaseData() {
  const res = await dataService.get('/sms/wells/closing/sales-performance/lease', { params: cachedParams });
  baseInformationLease.value = res.data;
}

async function fetchMembershipData() {
  const res = await dataService.get('/sms/wells/closing/sales-performance/membership', { params: cachedParams });
  console.log(res.data);
  baseInformationMembership.value = res.data;
}

async function fetchRegularData() {
  const res = await dataService.get('/sms/wells/closing/sales-performance/regular', { params: cachedParams });
  console.log(res.data);
  baseInformationRegular.value = res.data;
}

async function fetchRentalListData() {
  const res = await dataService.get('/sms/wells/closing/sales-performance/rental/paging', { params: { ...cachedParams, ...pageInfo.value } });
  console.log('list:', res.data);
  const { list: mainList, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdRentalRef.value.getView();
  view.getDataSource().setRows(mainList);
  view.resetCurrent();
}

async function fetchLeaseListData() {
  const res = await dataService.get('/sms/wells/closing/sales-performance/lease/paging', { params: { ...cachedParams, ...pageInfo.value } });
  console.log('list:', res.data);
  const { list: mainList, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdLeaseRef.value.getView();
  view.getDataSource().setRows(mainList);
  view.resetCurrent();
}

async function fetchMembershipListData() {
  const res = await dataService.get('/sms/wells/closing/sales-performance/membership/paging', { params: { ...cachedParams, ...pageInfo.value } });
  console.log('list:', res.data);
  const { list: mainList, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMembershipRef.value.getView();
  view.getDataSource().setRows(mainList);
  view.resetCurrent();
}

async function fetchRegularListData() {
  const res = await dataService.get('/sms/wells/closing/sales-performance/regular/paging', { params: { ...cachedParams, ...pageInfo.value } });
  console.log('list:', res.data);
  const { list: mainList, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdRegularRef.value.getView();
  view.getDataSource().setRows(mainList);
  view.resetCurrent();
}

async function fetchBaseData() {
  const res = await dataService.get('/sms/wells/closing/sales-performance/base-information', { params: cachedParams });
  console.log('res.data:', res.data);
  baseInfo.value = res.data;
  console.log('baseInfo.value.sellTpDtlCd:', baseInfo.value.sellTpDtlCd);
  if (baseInfo.value.sellTpDtlCd === '21' || baseInfo.value.sellTpDtlCd === '23') { // 렌탈
    isShowRental.value = true;
    isShowLease.value = false;
    isShowMembership.value = false;
    isShowRegular.value = false;
    await fetchRentalData();
    await fetchRentalListData();
  } else if (baseInfo.value.sellTpDtlCd === '22' || baseInfo.value.sellTpDtlCd === '24' || baseInfo.value.sellTpDtlCd === '25' || baseInfo.value.sellTpDtlCd === '26') { // 리스
    isShowRental.value = false;
    isShowLease.value = true;
    isShowMembership.value = false;
    isShowRegular.value = false;
    await fetchLeaseData();
    await fetchLeaseListData();
  } else if (baseInfo.value.sellTpDtlCd === '31' || baseInfo.value.sellTpDtlCd === '32' || baseInfo.value.sellTpDtlCd === '33') { // 멤버십
    isShowRental.value = false;
    isShowLease.value = false;
    isShowMembership.value = true;
    isShowRegular.value = false;
    await fetchMembershipData();
    await fetchMembershipListData();
  } else if (baseInfo.value.sellTpDtlCd === '61' || baseInfo.value.sellTpDtlCd === '62' || baseInfo.value.sellTpDtlCd === '63') { // 정기배송
    isShowRental.value = false;
    isShowLease.value = false;
    isShowMembership.value = false;
    isShowRegular.value = true;
    await fetchRegularData();
    await fetchRegularListData();
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchBaseData();
}

async function onClickExportView() {
  console.log('baseInfo.value.sellTpCd:', baseInfo.value.sellTpCd);
  if (baseInfo.value.sellTpDtlCd === '21' || baseInfo.value.sellTpDtlCd === '23') { // 렌탈
    const view = grdRentalRef.value.getView();
    const response = await dataService.get('/sms/wells/closing/sales-performance/rental/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
      exportData: response.data,
    });
  } else if (baseInfo.value.sellTpDtlCd === '22' || baseInfo.value.sellTpDtlCd === '24' || baseInfo.value.sellTpDtlCd === '25' || baseInfo.value.sellTpDtlCd === '26') { // 리스
    const view = grdLeaseRef.value.getView();
    const response = await dataService.get('/sms/wells/closing/sales-performance/lease/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
      exportData: response.data,
    });
  } else if (baseInfo.value.sellTpDtlCd === '31' || baseInfo.value.sellTpDtlCd === '32' || baseInfo.value.sellTpDtlCd === '33') { // 멤버십
    const view = grdMembershipRef.value.getView();
    const response = await dataService.get('/sms/wells/closing/sales-performance/membership/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
      exportData: response.data,
    });
  } else if (baseInfo.value.sellTpDtlCd === '61' || baseInfo.value.sellTpDtlCd === '62' || baseInfo.value.sellTpDtlCd === '63') { // 정기배송
    const view = grdRegularRef.value.getView();
    const response = await dataService.get('/sms/wells/closing/sales-performance/regular/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
      exportData: response.data,
    });
  }
}

async function onClickCcamEt() {
  await modal({
    component: 'WwdcbPenaltyEstimateDtlP',
  });
}

async function onClickPrmEt() {
  // 선납예상 버튼
  if (searchParams.value.cntrNo === '') {
    // 검색버튼 클릭 후 버튼 클릭 바랍니다.
    await notify(t('MSG_ALT_SRCH_AFTER_BTN_CLICK'));
    return; // 계약상세번호 없을 시 false 반환
  }
  await modal({
    component: 'WwdcPrepaymentEstimateAmountListP',
    componentProps: {
      cntrNo: searchParams.value.cntrNo,
      cntrSn: searchParams.value.cntrSn,
    },
  });
}

// 통합입금대사현황(Z-WD-U-0051M01) 페이지 이동
async function onClickDpRfndIz() {
  await router.push({
    path: '/withdrawal/zwwdb-integrate-deposit-compare',
    query: {
      cntrNo: searchParams.value.cntrNo,
      cntrSn: searchParams.value.cntrSn,
    },
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdRental = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'slClYm',
      header: t('MSG_TXT_SL_YM'),
      styleName: 'rg-button-link text-center',
      renderer: { type: 'button' },
      displayCallback(grid, index, value) {
        let tmp = '';
        tmp += value.substr(0, 4);
        tmp += '-';
        tmp += value.substr(4, 2);

        return tmp;
      } },
    { fieldName: 'slStpYn', header: t('MSG_TXT_SL_STP'), width: '100', styleName: 'text-center' },
    { fieldName: 'rentalTn', header: t('MSG_TXT_RENTAL_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'prmMcn', header: t('MSG_TXT_PRM_MCNT'), width: '100', styleName: 'text-center' },
    { fieldName: 'lcam16', header: t('MSG_TXT_RENTAL_SL'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'lcam4446', header: t('MSG_TXT_CCAM'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'lciamt', header: t('MSG_TXT_RENTAL_DP'), width: '100', styleName: 'rg-button-link text-right', renderer: { type: 'button' }, dataType: 'number', numberFormat: '#,###,###' },
    { fieldName: 'lcam3t', header: t('MSG_TXT_PRPD_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmUcBlam', header: t('MSG_TXT_UC_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmOcDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCN'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'btdDlqAddAmt', header: t('MSG_TXT_BTD_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmOcDlqAddAmt', header: t('MSG_TXT_OCCR_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmCtrDlqAddAmt', header: t('MSG_TXT_DDCTAM'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmDlqDpSumAmt', header: t('MSG_TXT_DP_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmDlqRfndSumAmt', header: t('MSG_TXT_RFND_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'eotDlqAddAmt', header: t('MSG_TXT_EOT_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'lcam96', header: t('MSG_TXT_SL_STP_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (grid, { column, itemIndex }) => {
    const { cntrDtlNo, slClYm } = grid.getValues(itemIndex);
    if (column === 'slClYm') {
      await modal({
        component: 'WwdcbRentalSalesDetailP',
        componentProps: { slClYm, cntrDtlNo },
      });
    }
    if (column === 'lciamt') {
      await modal({
        component: 'ZwwdbDepositPerformanceIzListP',
        componentProps: { cntrNo: 'W20207661745', perfDt: '20230220' },
      });
    }
  };

  const layout1 = [
    'cntrDtlNo',
    'slClYm',
    'slStpYn',
    'rentalTn',
    'prmMcn',
    'lcam16',
    'lcam4446',
    'lciamt',
    'lcam3t',
    'thmUcBlam',
    'thmOcDlqAmt',
    'dlqMcn',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'btdDlqAddAmt',
        'thmOcDlqAddAmt',
        'thmCtrDlqAddAmt',
        'thmDlqDpSumAmt',
        'thmDlqRfndSumAmt',
        'eotDlqAddAmt',
      ],
      header: {
        text: t('MSG_TXT_ADD_AM'),
      },
    },
    'lcam96',
  ];
  view.setColumnLayout(layout1);

  view.rowIndicator.visible = true;
});

const initGrdLease = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'slClYm',
      header: t('MSG_TXT_SL_YM'),
      styleName: 'rg-button-link text-center',
      renderer: { type: 'button' },
      displayCallback(grid, index, value) {
        let tmp = '';
        tmp += value.substr(0, 4);
        tmp += '-';
        tmp += value.substr(4, 2);

        return tmp;
      } },
    { fieldName: 'slStpYn', header: t('MSG_TXT_SL_STP'), width: '100', styleName: 'text-center' },
    { fieldName: 'rentalTn', header: t('MSG_TXT_RENTAL_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'prmMcn', header: t('MSG_TXT_PRM_MCNT'), width: '100', styleName: 'text-center' },
    { fieldName: 'lcam16', header: t('MSG_TXT_RENTAL_SL'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'lcam4446', header: t('MSG_TXT_CCAM'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'lciamt', header: t('MSG_TXT_RENTAL_DP'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'lcam3t', header: t('MSG_TXT_PRPD_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmUcBlam', header: t('MSG_TXT_UC_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmOcDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCN'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'btdDlqAddAmt', header: t('MSG_TXT_BTD_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmOcDlqAddAmt', header: t('MSG_TXT_OCCR_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmCtrDlqAddAmt', header: t('MSG_TXT_DDCTAM'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmDlqDpSumAmt', header: t('MSG_TXT_DP_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmDlqRfndSumAmt', header: t('MSG_TXT_RFND_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'eotDlqAddAmt', header: t('MSG_TXT_EOT_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'lcam96', header: t('MSG_TXT_SL_STP_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (grid, { column, itemIndex }) => {
    const { cntrDtlNo, slClYm } = grid.getValues(itemIndex);
    if (column === 'slClYm') {
      await modal({
        component: 'WwdcbLeaseSalesDetailP',
        componentProps: { slClYm, cntrDtlNo },
      });
    }
    if (column === 'lciamt') {
      await modal({
        component: 'ZwwdbDepositPerformanceIzListP',
        componentProps: { cntrNo: 'W20207661745', perfDt: '20230220' },
      });
    }
  };

  const layout1 = [
    'cntrDtlNo',
    'slClYm',
    'slStpYn',
    'rentalTn',
    'prmMcn',
    'lcam16',
    'lcam4446',
    'lciamt',
    'lcam3t',
    'thmUcBlam',
    'thmOcDlqAmt',
    'dlqMcn',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'btdDlqAddAmt',
        'thmOcDlqAddAmt',
        'thmCtrDlqAddAmt',
        'thmDlqDpSumAmt',
        'thmDlqRfndSumAmt',
        'eotDlqAddAmt',
      ],
      header: {
        text: t('MSG_TXT_ADD_AM'),
      },
    },
    'lcam96',
  ];
  view.setColumnLayout(layout1);

  view.rowIndicator.visible = true;
});

const initGrdMembership = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'slClYm',
      header: t('MSG_TXT_SL_YM'),
      styleName: 'rg-button-link text-center',
      renderer: { type: 'button' },
      displayCallback(grid, index, value) {
        let tmp = '';
        tmp += value.substr(0, 4);
        tmp += '-';
        tmp += value.substr(4, 2);

        return tmp;
      } },
    { fieldName: 'rentalTn', header: t('MSG_TXT_J_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'lcmgub', header: t('MSG_TXT_MNGT_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'thmSlSumAmt', header: t('MSG_TXT_MSH_SL'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'lciamt', header: t('MSG_TXT_MSH_DP'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'eotAtam', header: t('MSG_TXT_PRPD_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmOcDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'btdDlqAddAmt', header: t('MSG_TXT_BTD_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmOcDlqAddAmt', header: t('MSG_TXT_OCCR_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmCtrDlqAddAmt', header: t('MSG_TXT_DDCTAM'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmDlqDpSumAmt', header: t('MSG_TXT_DP_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmDlqRfndSumAmt', header: t('MSG_TXT_RFND_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'eotDlqAddAmt', header: t('MSG_TXT_EOT_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (grid, { column, itemIndex }) => {
    const { cntrDtlNo, slClYm } = grid.getValues(itemIndex);
    if (column === 'slClYm') {
      await modal({
        component: 'WwdcbMembershipSalesDetailP',
        componentProps: { slClYm, cntrDtlNo },
      });
    }
    if (column === 'lciamt') {
      await modal({
        component: 'ZwwdbDepositPerformanceIzListP',
        componentProps: { cntrNo: 'W20207661745', perfDt: '20230220' },
      });
    }
  };

  const layout1 = [
    'cntrDtlNo',
    'slClYm',
    'rentalTn',
    'lcmgub',
    'thmSlSumAmt',
    'lciamt',
    'eotAtam',
    'thmOcDlqAmt',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'btdDlqAddAmt',
        'thmOcDlqAddAmt',
        'thmCtrDlqAddAmt',
        'thmDlqDpSumAmt',
        'thmDlqRfndSumAmt',
      ],
      header: {
        text: t('MSG_TXT_ADD_AMT'),
      },
    },
    'eotDlqAddAmt',
  ];
  view.setColumnLayout(layout1);

  view.rowIndicator.visible = true;
});

const initGrdRegular = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'slClYm',
      header: t('MSG_TXT_SL_YM'),
      styleName: 'rg-button-link text-center',
      renderer: { type: 'button' },
      displayCallback(grid, index, value) {
        let tmp = '';
        tmp += value.substr(0, 4);
        tmp += '-';
        tmp += value.substr(4, 2);

        return tmp;
      } },
    { fieldName: 'rentalTn', header: t('MSG_TXT_PRGS_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'slStpYn', header: t('MSG_TXT_SL_YM'), width: '100', styleName: 'rg-button-link text-center', renderer: { type: 'button' } },
    { fieldName: 'thmSlSumAmt', header: t('MSG_TXT_SL_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmAtamDpAmt', header: t('MSG_TXT_DP_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'eotAtam', header: t('MSG_TXT_PRPD_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmUcBlam', header: t('MSG_TXT_UC_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmOcDlqAmt', header: t('MSG_TXT_BIL_UC'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'eotDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (grid, { column, itemIndex }) => {
    const { cntrDtlNo, slClYm } = grid.getValues(itemIndex);
    if (column === 'slClYm') {
      await modal({
        component: 'WwdcbRegularShippingSalesDtlP',
        componentProps: { slClYm, cntrDtlNo },
      });
    }
    if (column === 'thmAtamDpAmt') {
      await modal({
        component: 'ZwwdbDepositPerformanceIzListP',
        componentProps: { cntrNo: 'W20207661745', perfDt: '20230220' },
      });
    }
  };

  view.rowIndicator.visible = true;
});
</script>
