<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaCorporationCustomerPsListM - wells 법인(사업자) 고객현황(일시불 및 렌탈)
3. 작성자 : JSY
4. 작성일 : 2023.02.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- wells 법인(사업자) 고객현황(일시불 및 렌탈) 화면
****************************************************************************************************
--->
<template>
  <kw-page
    @load="onLoad"
  >
    <kw-search
      :modified-targets="['grdMain']"
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            :v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PERF_DV')"
        >
          <kw-option-group
            v-model="searchParams.perfGbn"
            type="radio"
            :options="[{codeId: '1', codeName:$t('MSG_TXT_DP_PERF')},{codeId:'2',codeName:$t('MSG_TXT_PD_ACC_RSLT')}]"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_EMPL_DV')"
        >
          <kw-option-group
            v-model="searchParams.empGbn"
            type="radio"
            :options="[{codeId: '', codeName:$t('MSG_TXT_ALL')},{codeId:'1',codeName:$t('MSG_TXT_EMP_PRCH')}]"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CNCL_DV')"
        >
          <kw-option-group
            v-model="searchParams.canGbn"
            type="radio"
            :options="[{codeId: '', codeName:$t('MSG_TXT_ALL')},{codeId:'N',codeName:$t('MSG_TXT_EXCLD_CANC')}]"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_LOOKUP_PERIOD')"
          required
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.dateGbn"
            :options="[
              {codeId: '1', codeName:$t('MSG_TIT_RECPETN_DT')},
              {codeId:'2',codeName:$t('MSG_TXT_INST_DT')},
              {codeId:'3',codeName:$t('MSG_TXT_RENTAL_NMN')},
            ]"
            rules="required"
          />
          <kw-date-range-picker
            v-if="searchParams.dateGbn!=3"
            v-model:from="searchParams.fromDate"
            v-model:to="searchParams.toDate"
            rules="date_range_required|date_range_months:1"
          />
          <kw-input
            v-if="searchParams.dateGbn==3"
            v-model="searchParams.fromRental"
            rules="required"
          />
          <span>~</span>
          <kw-input
            v-if="searchParams.dateGbn==3"
            v-model="searchParams.toRental"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PRDT_CATE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.pdHclsf"
            :options="hclsfs"
            first-option="all"
            @change="onHclsfChanged"
          />
          <kw-select
            v-model="searchParams.pdMclsf"
            :options="mclsfs"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('TXT_MSG_PD_CD')"
        >
          <kw-input
            v-model="searchParams.pdCd"
            :placeholder="t('1234')"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PRDT_NM')"
          :placeholder="t('MSG_TXT_INP')"
        >
          <kw-input
            v-model="searchParams.pdNm"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CST_DV')"
        >
          <kw-option-group
            v-model="searchParams.cstrGbn"
            type="radio"
            :options="[
              {codeId: '', codeName:$t('MSG_TXT_ALL')},
              {codeId:'1',codeName:$t('MSG_TXT_INDV')},
              {codeId:'2',codeName:$t('MSG_TXT_CRP')},
            ]"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_FNT_DV')"
        >
          <kw-select
            v-model="searchParams.fntGbn"
            :options="codes.FNT_DV_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_OG_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.fromogCd"
            :placeholder="t('A000000')"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.toOgCd"
            :placeholder="t('9999999')"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PRTNR_NO')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            :placeholder="t('MSG_TXT_INP')"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('TXT_MSG_FEE_ICT_OJ_YN')"
        >
          <kw-option-group
            v-model="searchParams.incentiveGbn"
            type="radio"
            :options="[{codeId: '', codeName:$t('MSG_TXT_ALL')},{codeId:'Y',codeName:$t('MSG_TXT_ICT_OJ')}]"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_BZ_ITM')"
        >
          <kw-input
            v-model="searchParams.dlpnrItemNm"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_BZCL')"
        >
          <kw-input
            v-model="searchParams.dlpnrBzclNm"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>

        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondry
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="1"
        @init="initGrid"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useMeta, getComponentType, gridUtil, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty, uniqBy } from 'lodash-es';

const dataService = useDataService();

const { getConfig } = useMeta();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'FNT_DV_CD',
);

const hclsfs = ref([]);
const mclsfs = ref([]);

const now = dayjs();

let cachedParams;
const searchParams = ref({
  sellTpCd: '',
  perfGbn: '1',
  empGbn: '',
  canGbn: '',
  dateGbn: '',
  fromDate: now.startOf('month').format('YYYYMMDD'),
  toDate: now.format('YYYYMMDD'),
  fromRental: '',
  toRental: '',
  pdHclsf: '',
  pdMclsf: '',
  pdCd: '',
  pdNm: '',
  cstrGbn: '2',
  fntGbn: '',
  fromogCd: '',
  toOgCd: '',
  prtnrNo: '',
  incentiveGbn: '',
  dlpnrItemNm: '',
  dlpnrBzclNm: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function onLoad() {
  const responses = await dataService.get('/sms/wells/contract/product-standards/high-levels');

  const initHclsfs = [];

  responses.data.forEach((v) => {
    if (!isEmpty(v.gnrCd)) initHclsfs.push({ codeId: v.pdClsfId, codeName: v.pdClsfNm });
  });
  hclsfs.value = uniqBy(initHclsfs, 'codeId');
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/corporates/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(details);
  view.resetCurrent();
}

async function onClickSearch() {
  if (searchParams.value.dateGbn === '3') {
    if (parseInt(searchParams.value.toRental, 10) - parseInt(searchParams.value.fromRental, 10) > 3) {
      alert(t('MSG_ALT_INP_RENTAL_3_MONTH'));
      return false;
    }
  }

  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/contract/contracts/corporates/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'corporationCustomerPsList',
    timePostfix: true,
    exportData: res.data,
  });
}

async function onHclsfChanged() {
  const responses = await dataService.get('/sms/wells/contract/product-standards/mid-levels', { params: {
    pdHclsf: searchParams.value.pdHclsf,
  } });

  const initMclsfs = [];

  responses.data.forEach((v) => {
    if (!isEmpty(v.gnrCd)) initMclsfs.push({ codeId: v.pdClsfId, codeName: v.pdClsfNm });
  });
  mclsfs.value = uniqBy(initMclsfs, 'codeId');
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'sellTpNm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'copnDvCd' },
    { fieldName: 'bzrno' },
    { fieldName: 'bryy' },
    { fieldName: 'txnTpCd' },
    { fieldName: 'adrZip' },
    { fieldName: 'adr' },
    { fieldName: 'dtlAdr' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'cntrTpCd' },
    { fieldName: 'basePdCd' },
    { fieldName: 'pdAbbrNm' },
    { fieldName: 'pdMclsfNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'svPrd' },
    { fieldName: 'fnlPdUswyCd' },
    { fieldName: 'bznsSpptOgCd' },
    { fieldName: 'ogUpbrngPrtnrNo' },
    { fieldName: 'bznsSpptPrtnrKnm' },
    { fieldName: 'ackmtPerfAmt' },
    { fieldName: 'cntrAmt' },
    { fieldName: 'fnlAmt' },
    { fieldName: 'discountAmt' },
    { fieldName: 'pdBaseAmt' },
    { fieldName: 'recapDutyPtrmN' },
    { fieldName: 'etrcnt' },
    { fieldName: 'txinvPblYn' },
    { fieldName: 'txinvPblTpCd' },
    { fieldName: 'emadr' },
    { fieldName: 'mpyMthdTpCd' },
    { fieldName: 'mpyMthdTpNm' },
    { fieldName: 'mpyBsdt' },
    { fieldName: 'slDt' },
    { fieldName: 'canDt' },
    { fieldName: 'fulpyDt' },
    { fieldName: 'cntrPdStrtdt' },
    { fieldName: 'cntrPdEnddt' },
    { fieldName: 'prmEndMm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'dgr1LevlOgCd' },
    { fieldName: 'dgr2LevlOgCd' },
    { fieldName: 'ogCd' },
    { fieldName: 'dgr3LevlDgPrtnrNo' },
    { fieldName: 'dgr3LevlDgPrtnrNm' },
    { fieldName: 'bldNm' },
    { fieldName: 'dscApyTpCd' },
    { fieldName: 'dscApyDtlCd' },
    { fieldName: 'chdvcYn' },
    { fieldName: 'rernt' },
    { fieldName: 'nw' },
    { fieldName: 'discSys' },
    { fieldName: 'dlpnrBzclNm' },
    { fieldName: 'dlpnrItemNm' },
    { fieldName: 'reqdDt' },
    { fieldName: 'chdvcCntrNo' },
    { fieldName: 'chdvcCntrStlmFshDtm' },
    { fieldName: 'chdvcCntrCanDtm' },
    { fieldName: 'chdvcBasePdCd' },
    { fieldName: 'chdvcPdNm' },
    { fieldName: 'chdvcSellRate' },
    { fieldName: 'chdvcSellAmt' },
    { fieldName: 'pointDt' },
    { fieldName: 'pointAmt' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'pkgPdCd' },
    { fieldName: 'pkgPdNm' },
    { fieldName: 'pmotCd' },
    { fieldName: 'pmotDesc' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fstRgstUsrNm' },
    { fieldName: 'fstRgstDt' },
    { fieldName: 'fstRgstTm' },
    { fieldName: 'fnlMdfcUsrId' },
    { fieldName: 'fnlMdfcDt' },
    { fieldName: 'fnlMdfcTm' },
  ];

  const columns = [
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TASK_TYPE'), width: '112', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '145', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTRT'), width: '112', styleName: 'text-center' },
    { fieldName: 'copnDvCd', header: t('MSG_TXT_CNTRT_GBN'), width: '112', styleName: 'text-center' },
    { fieldName: 'bzrno', header: t('MSG_TXT_CRNO'), width: '145', styleName: 'text-center' },
    { fieldName: 'bryy', header: t('MSG_TXT_BIRTH_DATE'), width: '112', styleName: 'text-center' },
    { fieldName: 'txnTpCd', header: t('MSG_TXT_TXN_TP'), width: '112', styleName: 'text-center' },
    { fieldName: 'adrZip', header: t('MSG_TXT_ZIP'), width: '112', styleName: 'text-center' },
    { fieldName: 'adr', header: t('MSG_TXT_ADDR'), width: '281', styleName: 'text-left' },
    { fieldName: 'dtlAdr', header: t('MSG_TXT_DETAIL_ADDR'), width: '281', styleName: 'text-left' },
    { fieldName: 'sellTpCd', header: t('TXT_MSG_SELL_TP_CD'), width: '112', styleName: 'text-center' },
    { fieldName: 'cntrTpCd', header: t('MSG_TXT_SLS_CAT'), width: '112', styleName: 'text-center' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '145', styleName: 'text-left' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ABBR'), width: '112', styleName: 'text-center' },
    { fieldName: 'pdMclsfNm', header: t('MSG_TXT_PRDT_CATE'), width: '112', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '281', styleName: 'text-left' },
    { fieldName: 'svPrd', header: t('MSG_TXT_MNGT_PRD'), width: '112', styleName: 'text-right' },
    { fieldName: 'fnlPdUswyCd', header: t('MSG_TXT_USWY_DV'), width: '112', styleName: 'text-right' },
    { fieldName: 'bznsSpptOgCd', header: t('MSG_TXT_OG_CD'), width: '121', styleName: 'text-center' },
    { fieldName: 'ogUpbrngPrtnrNo', header: t('MSG_TXT_EPNO'), width: '121', styleName: 'text-center' },
    { fieldName: 'bznsSpptPrtnrKnm', header: t('MSG_TXT_PIC'), width: '120', styleName: 'text-center' },

    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_ACKMT_PERF_AMT'), width: '125', styleName: 'text-right' },
    { fieldName: 'cntrAmt', header: t('MSG_TXT_RENT_RGST_FEE'), width: '125', styleName: 'text-right' },
    { fieldName: 'fnlAmt', header: t('MSG_TXT_RNTL_TOTAL'), width: '125', styleName: 'text-right' },
    { fieldName: 'discountAmt', header: t('MSG_TXT_RTLFE_DSC_RFLT'), width: '125', styleName: 'text-right' },
    { fieldName: 'pdBaseAmt', header: t('MSG_TXT_RTLFE'), width: '125', styleName: 'text-right' },
    { fieldName: 'recapDutyPtrmN', header: t('MSG_TXT_LCK_IN_PRD_MN'), width: '125', styleName: 'text-right' },
    { fieldName: 'etrcnt', header: t('MSG_TXT_RENTAL_NMN'), width: '125', styleName: 'text-right' },

    { fieldName: 'txinvPblYn', header: t('MSG_TXT_TXINV_YN'), width: '121', styleName: 'text-center' },
    { fieldName: 'txinvPblTpCd', header: t('MSG_TXT_ISSUANCE_CLAR'), width: '121', styleName: 'text-center' },
    { fieldName: 'emadr', header: t('MSG_TXT_EMAIL'), width: '227', styleName: 'text-left' },
    { fieldName: 'mpyMthdTpCd', header: t('MSG_TXT_FNT_DV'), width: '121', styleName: 'text-center' },
    { fieldName: 'mpyMthdTpNm', header: t('MSG_TXT_FNT_DV_NM'), width: '121', styleName: 'text-center' },
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FTD'), width: '120', styleName: 'text-right' },
    { fieldName: 'slDt', header: t('MSG_TXT_DT_OF_SALE'), width: '125', styleName: 'text-center' },
    { fieldName: 'canDt', header: t('MSG_TXT_CAN_D'), width: '125', styleName: 'text-center' },
    { fieldName: 'fulpyDt', header: t('MSG_TXT_EXP_DT'), width: '125', styleName: 'text-center' },
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_MEM_SIGNUP'), width: '121', styleName: 'text-center' },
    { fieldName: 'cntrPdEnddt', header: t('MSG_TXT_MEM_WTDR_DT'), width: '121', styleName: 'text-center' },
    { fieldName: 'prmEndMm', header: t('MSG_TXT_RGLR_END_DT'), width: '120', styleName: 'text-center' },

    { fieldName: 'prtnrNo', header: t('MSG_TIT_PRTNR_NO'), width: '121', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PTNR_NAME'), width: '121', styleName: 'text-center' },
    { fieldName: 'dgr1LevlOgCd', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '120', styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '120', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'dgr3LevlDgPrtnrNo', header: t('MSG_TXT_BRMGR_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'dgr3LevlDgPrtnrNm', header: t('MSG_TXT_BRMGR_FNM'), width: '120', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '159', styleName: 'text-left' },
    { fieldName: 'dscApyTpCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '125', styleName: 'text-center' },
    { fieldName: 'dscApyDtlCd', header: t('MSG_TXT_EVENT_TP'), width: '125', styleName: 'text-center' },
    { fieldName: 'chdvcYn', header: t('MSG_TXT_MCHN_CH'), width: '125', styleName: 'text-center' },

    { fieldName: 'rernt', header: t('MSG_TXT_RE_RENTAL_YN'), width: '121', styleName: 'text-center' },
    { fieldName: 'nw', header: t('MSG_TXT_NEW_YN'), width: '121', styleName: 'text-center' },
    { fieldName: 'discSys', header: t('MSG_TXT_DSC_SYST'), width: '125', styleName: 'text-center' },
    { fieldName: 'dlpnrBzclNm', header: t('MSG_TXT_BZCL'), width: '159', styleName: 'text-left' },
    { fieldName: 'dlpnrItemNm', header: t('MSG_TXT_DLPNR_ITEM'), width: '159', styleName: 'text-left ' },
    { fieldName: 'reqdDt', header: t('MSG_TXT_REQD_D'), width: '125', styleName: 'text-center' },
    { fieldName: 'chdvcCntrNo', header: t('MSG_TXT_CNTR_NO'), width: '145', styleName: 'text-center' },
    { fieldName: 'chdvcCntrStlmFshDtm', header: t('MSG_TXT_DT_OF_SALE'), width: '121', styleName: 'text-center' },
    { fieldName: 'chdvcCntrCanDtm', header: t('MSG_TXT_CAN_D'), width: '121', styleName: 'text-center' },
    { fieldName: 'chdvcBasePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '112', styleName: 'text-center' },
    { fieldName: 'chdvcPdNm', header: t('MSG_TXT_PRDT_NM'), width: '281', styleName: 'text-left' },
    { fieldName: 'chdvcSellRate', header: t('MSG_TXT_APPLY_RT'), width: '121', styleName: 'text-center' },
    { fieldName: 'chdvcSellAmt', header: t('MSG_TXT_RTLFE'), width: '112', styleName: 'text-center' },

    { fieldName: 'pointDt', header: t('MSG_TXT_POINT_APPLY_DT'), width: '125', styleName: 'text-center' },
    { fieldName: 'pointAmt', header: t('MSG_TXT_POINT_DP'), width: '125', styleName: 'text-right' },
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '125', styleName: 'text-center' },
    { fieldName: 'pkgPdCd', header: t('MSG_TXT_PKG_PD_GRD'), width: '125', styleName: 'text-center' },
    { fieldName: 'pkgPdNm', header: t('MSG_TXT_PKG_PD_NM'), width: '125', styleName: 'text-center' },
    { fieldName: 'pmotCd', header: t('MSG_TXT_PMOT_CD'), width: '125', styleName: 'text-center' },
    { fieldName: 'pmotDesc', header: t('MSG_TXT_PMOT_CNTNTS'), width: '200', styleName: 'text-left' },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_IN_ICHR'), width: '125', styleName: 'text-center' },
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_IN_ICHR_NM'), width: '125', styleName: 'text-center' },
    { fieldName: 'fstRgstDt', header: t('MSG_TXT_RGST_DT'), width: '125', styleName: 'text-center' },
    { fieldName: 'fstRgstTm', header: t('MSG_TXT_RGST_HH'), width: '125', styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_MDFC_ICHR'), width: '125', styleName: 'text-center' },
    { fieldName: 'fnlMdfcDt', header: t('MSG_TXT_MDFC_DT'), width: '125', styleName: 'text-center' },
    { fieldName: 'fnlMdfcTm', header: t('MSG_TXT_FERT_TM'), width: '125', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.checkBar.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'sellTpNm', 'cntrNo',
    {
      header: t('MSG_TXT_CNTRT'),
      direction: 'horizontal',
      items: ['cstKnm', 'copnDvCd', 'bzrno', 'bryy', 'txnTpCd', 'adrZip', 'adr', 'dtlAdr', 'sellTpCd', 'cntrTpCd', 'basePdCd', 'pdAbbrNm', 'pdMclsfNm', 'pdNm', 'svPrd', 'fnlPdUswyCd'],
    },
    {
      header: t('MSG_TXT_WELS_MNGER'),
      direction: 'horizontal',
      items: ['bznsSpptOgCd', 'ogUpbrngPrtnrNo', 'bznsSpptPrtnrKnm'],
    },
    'ackmtPerfAmt', 'cntrAmt', 'fnlAmt', 'discountAmt', 'pdBaseAmt', 'recapDutyPtrmN', 'etrcnt',
    {
      header: t('MSG_BTN_TXINV'),
      direction: 'horizontal',
      items: ['txinvPblYn', 'txinvPblTpCd', 'emadr'],
    },
    {
      header: t('MSG_TXT_FNT'),
      direction: 'horizontal',
      items: ['mpyMthdTpCd', 'mpyMthdTpNm', 'mpyBsdt'],

    },
    'slDt', 'canDt', 'fulpyDt',
    {
      header: t('MSG_TXT_MEMBERSHIP'),
      direction: 'horizontal',
      items: ['cntrPdStrtdt', 'cntrPdEnddt', 'prmEndMm'],

    },
    {
      header: t('MSG_TXT_PRTNR'),
      direction: 'horizontal',
      items: ['prtnrNo', 'prtnrKnm', 'dgr1LevlOgCd', 'dgr2LevlOgCd', 'ogCd', 'dgr3LevlDgPrtnrNo', 'dgr3LevlDgPrtnrNm'],

    },
    'bldNm', 'dscApyTpCd', 'dscApyDtlCd', 'chdvcYn',
    {
      header: t('MSG_TXT_CNTRT'),
      direction: 'horizontal',
      items: ['rernt', 'nw'],

    },
    'discSys', 'dlpnrBzclNm', 'dlpnrItemNm', 'reqdDt',
    {
      header: t('기변이전 정보'),
      direction: 'horizontal',
      items: ['chdvcCntrNo', 'chdvcCntrStlmFshDtm', 'chdvcCntrCanDtm', 'chdvcBasePdCd', 'chdvcPdNm', 'chdvcSellRate', 'chdvcSellAmt'],

    },
    'pointDt', 'pointAmt', 'cntrCstNo', 'pkgPdCd', 'pkgPdNm', 'pmotCd', 'pmotDesc', 'fstRgstUsrId', 'fstRgstUsrNm', 'fstRgstDt', 'fstRgstTm', 'fnlMdfcUsrId', 'fnlMdfcDt', 'fnlMdfcTm',

  ]);
}
</script>
<style scoped>
</style>
