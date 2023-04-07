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
              <kw-input
                v-model="searchParams.cntrDtlNo"
                :label="$t('MSG_TXT_CNTR_DTL_NO')"
                icon="search"
                clearable
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
            v-show="isShow1"
            :cols="4"
            align-content="left"
            dense
          >
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_TASK_DIV')"
              >
                <p>{{ baseInformationRental.sellTpCd }}</p>
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
                <p>{{ baseInformationRental.col5 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ALNC_DV')"
              >
                <p>{{ baseInformationRental.col6 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ATT_RCPDT')"
              >
                <p>{{ baseInformationRental.cntrRcpFshDtm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_SL_DT')"
              >
                <p>{{ baseInformationRental.slDt }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_CANC_DT')"
              >
                <p>{{ baseInformationRental.cntrCanDtm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_FSH_DT')"
              >
                <p>{{ baseInformationRental.col10 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_REDF_DT')"
              >
                <p>{{ baseInformationRental.redfDt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ADSB_DT')"
              >
                <p>{{ baseInformationRental.adsbDt }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_PD_DC_CLASS')"
              >
                <p>{{ baseInformationRental.dscTpCd }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_FNT_INF_D')"
              >
                <p>{{ baseInformationRental.dpTpCd }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_RGST_CS_DSC')"
              >
                <p>{{ baseInformationRental.rentalRgstCost }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_RTLFE1_MCNT_WON')"
              >
                <p>{{ baseInformationRental.rentalPtrm }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_SL_AGG_AMT')"
              >
                <p>{{ baseInformationRental.slAggAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DSC_AGG_AMT')"
              >
                <p>{{ baseInformationRental.col18 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CTR_AGG_AMT')"
              >
                <p>{{ baseInformationRental.col19 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DP_AGG_AMT')"
              >
                <p>{{ baseInformationRental.slDpAggAmt }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_UC_AMT')"
              >
                <p>{{ baseInformationRental.col21 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DLQ_AMT')"
              >
                <p>{{ baseInformationRental.thmOcDlqAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_SL_STP')"
              >
                <p>{{ baseInformationRental.col23 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ADD_AMT')"
              >
                <p>{{ baseInformationRental.eotDlqAddAmt }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_DFA_AMT')"
              >
                <p>{{ baseInformationRental.dfaAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DFA_DP_AMT')"
              >
                <p>{{ baseInformationRental.dfaDpAmt }}</p>
              </kw-form-item>
            </kw-form-row>
          </kw-form>

          <kw-form
            v-show="isShow2"
            :cols="4"
            align-content="left"
            dense
          >
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_TASK_DIV')"
              >
                <p>{{ baseInformationMembership.sellTpCd }}</p>
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
                <p>{{ baseInformationMembership.dpTpCd }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CNTR_DATE')"
              >
                <p>{{ baseInformationMembership.cntrDt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CNFM_DT')"
              >
                <p>{{ baseInformationMembership.cntrCnfmDtm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CANC_DT')"
              >
                <p>{{ baseInformationMembership.cntrCanDtm }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_J_DT')"
              >
                <p>{{ baseInformationMembership.col9 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_WDWAL_DT')"
              >
                <p>{{ baseInformationMembership.col10 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_FSH_DT')"
              >
                <p>{{ baseInformationMembership.col11 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_MM_SSPCS')"
              >
                <p>{{ baseInformationMembership.sellAmt }}</p>
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
                <p>{{ baseInformationMembership.col15 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CTR_AGG_AMT')"
              >
                <p>{{ baseInformationMembership.col16 }}</p>
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
                <p>{{ baseInformationMembership.dfaAmt }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_DFA_DP_AMT')"
              >
                <p>{{ baseInformationMembership.dfaDpAmt }}</p>
              </kw-form-item>
            </kw-form-row>
          </kw-form>

          <kw-form
            v-show="isShow3"
            :cols="4"
            align-content="left"
            dense
          >
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_TASK_DIV')"
              >
                <p>{{ baseInformationRegular.sellTpCd }}</p>
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
                <p>{{ baseInformationRegular.cntrRcpFshDtm }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_SL_DT')"
              >
                <p>{{ baseInformationRegular.slDt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_PKG_INF')"
              >
                <p>{{ baseInformationRegular.col6 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_MCHN_INF')"
              >
                <p>{{ baseInformationRegular.col7 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CANC_DT')"
              >
                <p>{{ baseInformationRegular.col8 }}</p>
              </kw-form-item>
            </kw-form-row><kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_SPP_DT')"
              >
                <p>{{ baseInformationRegular.sppDtm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_FNT_INF')"
              >
                <p>{{ baseInformationRegular.dpTpCd }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_SL_AGG_AMT')"
              >
                <p>{{ baseInformationRegular.slAggAmt }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DSC_AGG_AMT')"
              >
                <p>{{ baseInformationRegular.col12 }}</p>
              </kw-form-item>
            </kw-form-row><kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_CTR_AGG_AMT')"
              >
                <p>{{ baseInformationRegular.col13 }}</p>
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
                <p>{{ baseInformationRegular.col16 }}</p>
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
            />
          </kw-action-top>

          <kw-grid
            v-show="isShow1"
            ref="grdMainRef1"
            name="grdMain1"
            :visible-rows="pageInfo.pageSize - 1"
            @init="initGridMain1"
          />
          <kw-grid
            v-show="isShow2"
            ref="grdMainRef2"
            name="grdMain2"
            :visible-rows="pageInfo.pageSize - 1"
            @init="initGridMain2"
          />
          <kw-grid
            v-show="isShow3"
            ref="grdMainRef3"
            name="grdMain3"
            :visible-rows="pageInfo.pageSize - 1"
            @init="initGridMain3"
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
        <wwdcb-sales-performance-list-m-single-payment
          v-model:selected-link-id="selectedLinkId"
        />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService, useMeta, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import WwdcbSalesPerformanceListMSinglePayment from './WwdcbSalesPerformanceListMSinglePayment.vue';

const selectedTab = ref('mainTab');
const now = dayjs();
const { t } = useI18n();
const { modal } = useGlobal();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef1 = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));
const grdMainRef3 = ref(getComponentType('KwGrid'));

const isShow1 = ref(true);
const isShow2 = ref(false);
const isShow3 = ref(false);

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  cntrDtlNo: '',
  baseYearFrom: now.format('YYYY'),
  baseYearTo: now.format('YYYY'),
});

const baseInfo = ref({});
const baseInformationRental = ref({});
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
  const view = grdMainRef1.value.getView();
  view.getDataSource().setRows(mainList);
  view.resetCurrent();
}

async function fetchMembershipListData() {
  const res = await dataService.get('/sms/wells/closing/sales-performance/membership/paging', { params: { ...cachedParams, ...pageInfo.value } });
  console.log('list:', res.data);
  const { list: mainList, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef2.value.getView();
  view.getDataSource().setRows(mainList);
  view.resetCurrent();
}

async function fetchRegularListData() {
  const res = await dataService.get('/sms/wells/closing/sales-performance/regular/paging', { params: { ...cachedParams, ...pageInfo.value } });
  console.log('list:', res.data);
  const { list: mainList, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef3.value.getView();
  view.getDataSource().setRows(mainList);
  view.resetCurrent();
}

async function fetchBaseData() {
  const res = await dataService.get('/sms/wells/closing/sales-performance/base-information', { params: cachedParams });
  console.log('res.data:', res.data);
  baseInfo.value = res.data;
  // console.log('baseInfo.sellTpCd:', baseInfo.value.sellTpCd);
  if (baseInfo.value.sellTpCd === '2') { // 렌탈, 리스
    isShow1.value = true;
    isShow2.value = false;
    isShow3.value = false;
    await fetchRentalData();
    await fetchRentalListData();
  } else if (baseInfo.value.sellTpCd === '3') { // 멤버십
    isShow1.value = false;
    isShow2.value = true;
    isShow3.value = false;
    await fetchMembershipData();
    await fetchMembershipListData();
  } else if (baseInfo.value.sellTpCd === '6') { // 정기배송
    isShow1.value = false;
    isShow2.value = false;
    isShow3.value = true;
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
  if (baseInfo.value.sellTpCd === '2') {
    const view = grdMainRef1.value.getView();
    const response = await dataService.get('/sms/wells/closing/sales-performance/rental/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
      exportData: response.data,
    });
  } else if (baseInfo.value.sellTpCd === '3') {
    const view = grdMainRef2.value.getView();
    const response = await dataService.get('/sms/wells/closing/sales-performance/membership/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
      exportData: response.data,
    });
  } else if (baseInfo.value.sellTpCd === '6') {
    const view = grdMainRef3.value.getView();
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
  console.log('선납예상 팝업 추가');
  // const cntrDtlNo = baseInformation.value.col2;
  // await modal({
  //  component: 'WwwdcPrepaymentEstimateAmountListP',
  //  componentProps: { cntrDtlNo },
  // });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMain1 = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_YM'), styleName: 'rg-button-link text-center', renderer: { type: 'button' } },
    { fieldName: 'cntrDtlStatCd', header: t('MSG_TXT_SL_STP'), width: '100', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_MNGT_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'prmMcn', header: t('MSG_TXT_PRM_MCNT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'thmSlSumAmt', header: t('MSG_TXT_BIL_AMT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col8', header: t('MSG_TXT_CCAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col9', header: t('MSG_TXT_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'eotAtam', header: t('MSG_TXT_PRPD_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'thmUcBlam', header: t('MSG_TXT_UC_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'thmOcDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'btdDlqAddAmt', header: t('MSG_TXT_OCCR_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'thmOcDlqAddAmt', header: t('MSG_TXT_DDCTAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'thmCtrDlqAddAmt', header: t('MSG_TXT_DP_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'thmDlqDpSumAmt', header: t('MSG_TXT_RFND_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'thmDlqRfndSumAmt', header: t('MSG_TXT_EOT_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'eotDlqAddAmt', header: t('MSG_TXT_SL_STP_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (grid, { column }) => {
    const current = view.getCurrent();
    const dataProvider = view.getDataSource();
    const slDt = dataProvider.getValue(current.dataRow, 'slDt');
    if (column === 'slDt') {
      if (baseInfo.value.sellTpCd === '2') { // 렌탈, 리스
        await modal({
          component: 'WwdcbRentalSalesDetailP', // TODOL 조건 추가하기(리스 : WwdcbLeaseSalesDetailP)
          componentProps: { slDt },
        });
      } else if (baseInfo.value.sellTpCd === '3') { // 멤버십
        await modal({
          component: 'WwdcbMembershipSalesDetailP',
          componentProps: { slDt },
        });
      } else if (baseInfo.value.sellTpCd === '6') { // 정기배송
        await modal({
          component: '',
          componentProps: { slDt },
        });
      }
    }
  };

  const layout1 = [
    'cntrDtlNo',
    'slDt',
    'cntrDtlStatCd',
    'col4',
    'col5',
    'prmMcn',
    'thmSlSumAmt',
    'col8',
    'col9',
    'eotAtam',
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

const initGridMain2 = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_YM'), width: '100', styleName: 'rg-button-link text-center', renderer: { type: 'button' } },
    { fieldName: 'col3', header: t('MSG_TXT_J_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_MNGT_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'thmSlSumAmt', header: t('MSG_TXT_MSH_SL'), width: '100', styleName: 'text-center' },
    { fieldName: 'thmAtamDpAmt', header: t('MSG_TXT_MSH_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'eotAtam', header: t('MSG_TXT_PRPD_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'thmOcDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'btdDlqAddAmt', header: t('MSG_TXT_BTD_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'thmOcDlqAddAmt', header: t('MSG_TXT_OCCR_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'thmCtrDlqAddAmt', header: t('MSG_TXT_DDCTAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'thmDlqDpSumAmt', header: t('MSG_TXT_DP_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'thmDlqRfndSumAmt', header: t('MSG_TXT_RFND_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'eotDlqAddAmt', header: t('MSG_TXT_EOT_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (grid, { column }) => {
    const current = view.getCurrent();
    const dataProvider = view.getDataSource();
    const slDt = dataProvider.getValue(current.dataRow, 'slDt');
    if (column === 'slDt') {
      await modal({
        component: 'WwdcbMembershipSalesDetailP',
        componentProps: { slDt },
      });
    }
  };

  const layout1 = [
    'cntrDtlNo',
    'slDt',
    'col3',
    'col4',
    'thmSlSumAmt',
    'thmAtamDpAmt',
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

const initGridMain3 = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_PRGS_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_YM'), width: '100', styleName: 'rg-button-link text-center', renderer: { type: 'button' } },
    { fieldName: 'col4', header: t('MSG_TXT_SL_STP'), width: '100', styleName: 'text-center' },
    { fieldName: 'thmSlSumAmt', header: t('MSG_TXT_SL_AMT'), width: '100', styleName: 'text-center' },
    { fieldName: 'thmAtamDpAmt', header: t('MSG_TXT_DP_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'eotAtam', header: t('MSG_TXT_PRPD_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'thmUcBlam', header: t('MSG_TXT_UC_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col8', header: t('MSG_TXT_BIL_UC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'thmOcDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (grid, { column }) => {
    const current = view.getCurrent();
    const dataProvider = view.getDataSource();
    const slDt = dataProvider.getValue(current.dataRow, 'slDt');
    if (column === 'slDt') {
      await modal({
        component: '',
        componentProps: { slDt },
      });
    }
  };

  view.rowIndicator.visible = true;
});
</script>
