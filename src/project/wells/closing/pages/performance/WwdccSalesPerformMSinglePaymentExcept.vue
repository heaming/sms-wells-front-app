<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDCC
2. 프로그램 ID : WwdccSalesPerformMSinglePaymentExcept - 매출실적현황 > 일시불외(W-CL-U-0038M01)
3. 작성자 : gugyeongu
4. 작성일 : 2023.08.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- WELLS 매출실적현황(일시불 외) 현황을 보여준다.
****************************************************************************************************
--->
<template>
  <kw-tab-panels
    model-value="1"
  >
    <kw-tab-panel name="1">
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
              v-model:from="searchParams.fromSlClYy"
              v-model:to="searchParams.toSlClYy"
              type="year"
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
          <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
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
              <p>
                {{ singlePaymentDetail.sellTpCdNm }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CNTR_DTL_NO')"
            >
              <p>
                {{ singlePaymentDetail.cntrDtlNo }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CST_NM')"
            >
              <p>
                {{ singlePaymentDetail.cstKnm }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_PD_INF')"
            >
              <p>
                ( {{ singlePaymentDetail.pdCd }} ){{ singlePaymentDetail.pdNm }} /
                {{ singlePaymentDetail.svPrd }}{{ t('MSG_TXT_MCNT') }}{{ singlePaymentDetail.svTbCdNm }}
              </p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_EXN_TP')"
            >
              <p>
                {{ singlePaymentDetail.exnTp }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_ALNC_DV')"
            >
              <p>
                {{ singlePaymentDetail.alncmpCdNm }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_ATT_RCPDT')"
            >
              <p>
                {{ stringUtil.getDateFormat(singlePaymentDetail.cntrDt) }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_SL_DT')"
            >
              <p>
                {{ stringUtil.getDateFormat(singlePaymentDetail.lcsleDt) }}
              </p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_CANC_DT')"
            >
              <p>
                {{ stringUtil.getDateFormat(singlePaymentDetail.canDt) }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_FSH_DT')"
            >
              <p>
                {{ stringUtil.getDateFormat(singlePaymentDetail.fshDt) }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_REDF_DT')"
            >
              <p>
                {{ stringUtil.getDateFormat(singlePaymentDetail.redfDt) }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_ADSB_DT')"
            >
              <p>
                {{ stringUtil.getDateFormat(singlePaymentDetail.adsbDt) }}
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_PD_DC_CLASS')"
            >
              <p>
                {{ singlePaymentDetail.sellDscDvCdNm }}({{ singlePaymentDetail.sellDscDvCd }})/
                {{ singlePaymentDetail.stplPtrm }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_FNT_INF_D')"
            >
              <p>
                {{ singlePaymentDetail.dpTpCd }}
                {{ singlePaymentDetail.mpyBsdt }}/{{ singlePaymentDetail.fnitAprRsCd }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_RGST_CS_DSC')"
            >
              <p>
                {{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.rentalRgstCost)) }}
                ({{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.dscAmt)) }}){{ t('MSG_TXT_DSC') }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_RTLFE1_MCNT_WON')"
            >
              <p>
                {{ singlePaymentDetail.rentalPtrm }}{{ t('MSG_TXT_MCNT') }}/
                {{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.rentalAmt)) }}{{ t('MSG_TXT_CUR_WON') }}
                {{ singlePaymentDetail.rentalDscAmt }}
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_SL_AGG_AMT')"
            >
              <p>
                {{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.slAggAmt)) }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_DSC_AGG_AMT')"
            >
              <p>
                {{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.sumDscAggAmt)) }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CTR_AGG_AMT')"
            >
              <p>
                {{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.sumCtrAggAmt)) }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_DP_AGG_AMT')"
            >
              <p>
                {{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.slDpAggAmt)) }}
              </p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_UC_AMT')"
            >
              <p>
                {{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.eotUcAmt)) }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_DLQ_AMT')"
            >
              <p>
                {{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.eotDlqAmt)) }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_SL_STP')"
            >
              <p>
                {{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.slStpAmt)) }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_ADD_AMT')"
            >
              <p>
                {{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.eotDlqAddAmt)) }}
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_DFA_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.dfaAmt)) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_DFA_DP_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.dfaDpAmt)) }}</p>
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
              <p>{{ singlePaymentDetail.sellTpCdNm }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CNTR_DTL_NO')"
            >
              <p>{{ singlePaymentDetail.cntrDtlNo }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CST_NM')"
            >
              <p>{{ singlePaymentDetail.cstKnm }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_PD_INF')"
            >
              <p>
                ( {{ singlePaymentDetail.pdCd }} ){{ singlePaymentDetail.pdNm }} /
                {{ singlePaymentDetail.svPrd }}{{ t('MSG_TXT_MCNT') }}{{ singlePaymentDetail.svTbCdNm }}
              </p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_FNT_INF')"
            >
              <p>
                {{ singlePaymentDetail.dpTpCd }}
                {{ singlePaymentDetail.mpyBsdt }}/{{ singlePaymentDetail.fnitAprRsCd }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CNTR_DATE')"
            >
              <p>{{ stringUtil.getDateFormat(singlePaymentDetail.cntrDt) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CNFM_DT')"
            >
              <p>{{ stringUtil.getDateFormat(singlePaymentDetail.cntrCnfmDt) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CANC_DT')"
            >
              <p>{{ stringUtil.getDateFormat(singlePaymentDetail.cntrCanDt) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_J_DT')"
            >
              <p>{{ stringUtil.getDateFormat(singlePaymentDetail.jDt) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_WDWAL_DT')"
            >
              <p>{{ stringUtil.getDateFormat(singlePaymentDetail.mshWdwalDt) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_FSH_DT')"
            >
              <p>{{ stringUtil.getDateFormat(singlePaymentDetail.fshDt) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_MM_SSPCS')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.rentalRgstCost)) }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_DSC_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.dscAmt)) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_SL_AGG_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.slAggAmt)) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_DSC_AGG_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.dscAggAmt)) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CTR_AGG_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.ctrAggAmt)) }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_DP_AGG_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.slDpAggAmt)) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_UC_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.eotUcAmt)) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_DLQ_AMT_ADAMT')"
            >
              <p>
                {{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.eotDlqAmt)) }}/
                {{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.eotDlqAddAmt)) }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_DFA_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.dfaAmt)) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_DFA_DP_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.dfaDpAmt)) }}</p>
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
              <p>{{ singlePaymentDetail.sellTpCdNm }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CNTR_DTL_NO')"
            >
              <p>{{ singlePaymentDetail.cntrDtlNo }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CST_NM')"
            >
              <p>{{ singlePaymentDetail.cstKnm }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_RCPDT')"
            >
              <p>{{ stringUtil.getDateFormat(singlePaymentDetail.cntrDt) }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_SL_DT')"
            >
              <p>{{ stringUtil.getDateFormat(singlePaymentDetail.slRcogDt) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_PKG_INF')"
            >
              <p>
                {{ singlePaymentDetail.pglrSppPrcDvCd }}{{ singlePaymentDetail.pkgCd }}{{ singlePaymentDetail.pkgNm }}/
                {{ singlePaymentDetail.pkgTpNm }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_MCHN_INF')"
            >
              <p>{{ singlePaymentDetail.lcJcnam }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CANC_DT')"
            >
              <p>{{ stringUtil.getDateFormat(singlePaymentDetail.canDt) }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_SPP_DT')"
            >
              <p>{{ stringUtil.getDateFormat(singlePaymentDetail.sppDtm) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_FNT_INF')"
            >
              <p>
                {{ singlePaymentDetail.dpTpCd }}
                {{ singlePaymentDetail.mpyBsdt }}/{{ singlePaymentDetail.fnitAprRsCd }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_SL_AGG_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.slAggAmt)) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_DSC_AGG_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.dscAggAmt)) }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_CTR_AGG_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.ctrAggAmt)) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_DP_AGG_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.slDpAggAmt)) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_UC_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.eotUcAmt)) }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_BIL_UC_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.mmIstmPcamAmt)) }}</p>
            </kw-form-item>
          </kw-form-row><kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_DLQ_AMT')"
            >
              <p>{{ stringUtil.getNumberWithComma(toInteger(singlePaymentDetail.thmOcDlqAmt)) }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>

        <kw-separator />

        <h3>{{ $t('MSG_TXT_SL_PERF_MCBY') }}</h3>

        <kw-action-top>
          <template #left>
            <kw-paging-info
              v-model:page-index="pageInfo.pageIndex"
              v-model:page-size="pageInfo.pageSize"
              :total-count="pageInfo.totalCount"
              :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
              @change="fetchDetailsData"
            />
            <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
          </template>

          <kw-btn
            v-permission:download
            icon="download_on"
            dense
            secondary
            :label="$t('MSG_BTN_EXCEL_DOWN')"
            :disable="pageInfo.totalCount === 0"
            @click="onClickExcelDownload"
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
          ref="grdSinglePaymentExceptRef"
          name="grdSinglePaymentExcept"
          :visible-rows="pageInfo.visibleRows"
          :page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @init="initGrdSinglePaymentExcept"
        />

        <kw-pagination
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @change="fetchDetailsData"
        />
      </div>
    </kw-tab-panel>
  </kw-tab-panels>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { gridUtil, codeUtil, getComponentType, useGlobal, useMeta, useDataService, defineGrid, stringUtil } from 'kw-lib';
import { cloneDeep, isEmpty, toInteger } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const { getConfig } = useMeta();
const { modal, notify } = useGlobal();
const { currentRoute } = useRouter();
const dataService = useDataService();
const router = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);
const grdSinglePaymentExceptRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  cntrNo: '',
  cntrSn: '',
  fromSlClYy: '',
  toSlClYy: '',
  slClYm: '',
});
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const singlePaymentDetail = ref({});
const isShowRental = ref(false);
const isShowMembership = ref(false);
const isShowRegular = ref(false);

async function fetchDetailData(slClYm, sellTpCd) {
  cachedParams.slClYm = slClYm;
  cachedParams.cntrDtlNo = `${cachedParams.cntrNo}${cachedParams.cntrSn}`;
  let res = null;
  isShowRental.value = false;
  isShowMembership.value = false;
  isShowRegular.value = false;
  if (sellTpCd === '2') {
    res = await dataService.get('/sms/wells/closing/rental-sales-detail', { params: cachedParams });
    isShowRental.value = true;
  } else if (sellTpCd === '3') {
    res = await dataService.get('/sms/wells/closing/membership-sales-detail', { params: cachedParams });
    isShowMembership.value = true;
  } else if (sellTpCd === '6') {
    res = await dataService.get('/sms/wells/closing/regular-shipping-detail', { params: cachedParams });
    isShowRegular.value = true;
  }
  singlePaymentDetail.value = res.data;
  if (!isEmpty(singlePaymentDetail.value.mpyBsdt)) {
    singlePaymentDetail.value.mpyBsdt += t('MSG_TXT_D');
  }
  if (!isEmpty(singlePaymentDetail.value.rentalDscAmt) && singlePaymentDetail.value.rentalDscAmt > 0) {
    singlePaymentDetail.value.rentalDscAmt += t('MSG_TXT_WON_DSC');
  } else {
    singlePaymentDetail.value.rentalDscAmt = '';
  }
  if (!isEmpty(singlePaymentDetail.value.pkgCd)) {
    singlePaymentDetail.value.pkgCd = `(${singlePaymentDetail.value.pkgCd})`;
  }
}

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/closing/sales-performs/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: singlePayments, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdSinglePaymentExceptRef.value.getView();
  view.getDataSource().setRows(singlePayments);

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  if (!isEmpty(singlePayments) && pageInfo.value.pageIndex === 1) {
    await fetchDetailData(singlePayments[0].slClYm, singlePayments[0].sellTpCd);
  }
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  fetchData();
}

async function onClickExcelDownload() {
  const view = grdSinglePaymentExceptRef.value.getView();

  const res = await dataService.get('/sms/wells/closing/sales-performs/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickCcamEt() {
  await modal({
    component: 'WwdccSalesPerformPenaltyP',
    componentProps: {
      cntrNo: searchParams.value.cntrNo,
      cntrSn: searchParams.value.cntrSn,
    },
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
const initGrdSinglePaymentExcept = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'sellTpCd', visible: false },
    { fieldName: 'islease', visible: false },
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '169',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'slClYm',
      header: t('MSG_TXT_SL_YM'),
      width: '100',
      styleName: 'text-center, rg-button-link',
      dataType: 'date',
      datetimeFormat: 'yyyy-MM',
      renderer: { type: 'button', hideWhenEmpty: false },
    },
    { fieldName: 'slStpYn', header: t('MSG_TXT_SL_STP'), width: '100', styleName: 'text-center' },
    { fieldName: 'rentalTn', header: t('MSG_TXT_RENTAL_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'slCtrDvCd', header: t('MSG_TXT_MNGT_DV'), width: '100', styleName: 'text-left' },
    { fieldName: 'prmMcn', header: t('MSG_TXT_PRM_MCNT'), width: '100', styleName: 'text-center' },
    { fieldName: 'thmSlSumAmt', header: t('MSG_TXT_BIL_AMT'), width: '134', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'borAmt', header: t('MSG_TXT_CCAM'), width: '134', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'dpAmt',
      header: t('MSG_TXT_DP'),
      width: '134',
      styleName: 'text-center, rg-button-link',
      renderer: { type: 'button', hideWhenEmpty: false },
      dataType: 'number',
      numberFormat: '#,##0' },
    { fieldName: 'eotAtam', header: t('MSG_TXT_PRPD_AMT'), width: '100', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'eotUcAmt', header: t('MSG_TXT_UC_AMT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'eotDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '90', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '90', styleName: 'text-right' },
    { fieldName: 'btdDlqAddAmt', header: t('MSG_TXT_BTD_AMT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'thmOcDlqAddAmt', header: t('MSG_TXT_OCCR_AMT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'thmCtrDlqAddAmt', header: t('MSG_TXT_DDCTAM'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'thmDlqAddDpSumAmt', header: t('MSG_TXT_DP_AMT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'thmDlqAddRfndSumAmt', header: t('MSG_TXT_RFND_AMT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'eotDlqAddAmt', header: t('MSG_TXT_EOT_AMT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'slStpAmt', header: t('MSG_TXT_SL_STP_AMT'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'cntrNo', 'slClYm', 'slStpYn', 'rentalTn', 'slCtrDvCd', 'prmMcn', 'thmSlSumAmt', 'borAmt', 'dpAmt', 'eotAtam', 'eotUcAmt', 'eotDlqAmt', 'dlqMcn', // single
    {
      header: t('MSG_TXT_ADD_AM'), // colspan title
      direction: 'horizontal', // merge type
      items: ['btdDlqAddAmt', 'thmOcDlqAddAmt', 'thmCtrDlqAddAmt', 'thmDlqAddDpSumAmt', 'thmDlqAddRfndSumAmt', 'eotDlqAddAmt'],
    },
    'slStpAmt',
  ]);

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    if (column === 'slClYm') {
      const { sellTpCd, islease, slClYm } = gridUtil.getRowValue(g, dataRow);
      let callComponent = '';
      if (sellTpCd === '2') {
        if (islease === 'N') {
          callComponent = 'WwdccSalesPerformMRentalP';
        } else if (islease === 'Y') {
          callComponent = 'WwdcbLeaseSalesDetailP';
        }
      } else if (sellTpCd === '3') {
        callComponent = 'WwdcbMembershipSalesDetailP';
      } else if (sellTpCd === '6') {
        callComponent = 'WwdcbRegularShippingSalesDtlP';
      }
      await modal({
        component: callComponent,
        componentProps: { cntrDtlNo: `${cachedParams.cntrNo}${cachedParams.cntrSn}`, cntrNo: cachedParams.cntrNo, cntrSn: cachedParams.cntrSn, slClYm },
      });
    } else if (column === 'dpAmt') {
      await modal({
        component: 'ZwwdbDepositPerformanceIzListP',
        componentProps: { cntrNo: cachedParams.cntrNo },
      });
    }
  };
});

</script>

<style scoped>
</style>
