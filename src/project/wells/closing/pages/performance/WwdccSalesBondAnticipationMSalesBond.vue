<!----adamt
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccSalesBondAnticipationMSalesBond - 매출채권/선수금 현황 - 매출채권 // W-CL-U-0058M06
3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.03.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매출채권/선수금 현황 - 매출채권 프로그램
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="3"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_BASE_YM')"
      >
        <kw-date-picker
          v-model="searchParams.slClYm"
          type="month"
          rules="date_range_months:1"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_AGRG_DV')">
        <kw-option-group
          v-model="searchParams.agrgDv"
          type="radio"
          :options="selectAgrgDv.options"
          @change="onChangeAggregateDivide"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
        <kw-select
          v-model="searchParams.sellTpCd"
          :options="codes.SELL_TP_CD.filter((v) => ['1', '2', '3', '6', '9'].includes(v.codeId))"
          @change="onChangeBusinessDivide"
        />
        <kw-select
          v-if="searchParams.sellTpCd === '1'"
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '11' || v.codeId === '12' || v.codeId === '13')"
          first-option="all"
          first-option-value="ALL"
        />
        <kw-select
          v-if="searchParams.sellTpCd === '2'"
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '21' || v.codeId === '22' || v.codeId === '23' ||
            v.codeId === '24' || v.codeId === '25'|| v.codeId === '26')"
          @change="onChangeSellTpDtlCd"
        />
        <kw-select
          v-if="searchParams.sellTpCd === '3'"
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '31' || v.codeId === '32'
            || v.codeId === '33' || v.codeId === '34')"
          first-option="all"
          first-option-value="ALL"
        />
        <kw-select
          v-if="searchParams.sellTpCd === '6'"
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => v.codeId === '61' || v.codeId === '62' || v.codeId === '63')"
          first-option="all"
          first-option-value="ALL"
        />
        <kw-select
          v-if="searchParams.sellTpCd === '9'"
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter(v => v.codeId === 'ALL')"
          first-option="all"
          first-option-value="ALL"
        />
      </kw-search-item><!--판매유형상세-->

      <kw-search-item :label="$t('MSG_TXT_SEL_CHNL')">
        <kw-select
          v-model="searchParams.sellChnlDtl"
          :options="codes.SELL_CHNL_DTL_CD"
          first-option="all"
          first-option-value="ALL"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
        <kw-input
          v-model.trim="searchParams.cntr"
          icon="search_24"
          :disable="isDisable"
          @click-icon="onClickIcon"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_SAP_PD_DV_CD_NM')">
        <kw-select
          v-model="searchParams.sapPdDvCd"
          :options="sapPdDv"
          option-value="codeId"
          option-label="codeName"
          first-option="all"
          first-option-value="ALL"
        /><!--SAP상품구분코드명-->
      </kw-search-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalCount" />
        <span
          class="ml8"
        >
          {{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        icon="report"
        dense
        secondary
        :label="$t('MSG_TXT_RPT_BRWS')"
        @click="onClickOpenReport"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        icon="download_on"
        :disable="totalCount === 0"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      v-show="isGridSix"
      ref="grdSixRef"
      name="grdSix"
      :visible-rows="10"
      @init="initGrdSix"
    />
    <kw-grid
      v-show="isGridSeven"
      ref="grdSevenRef"
      name="grdSeven"
      :visible-rows="10"
      @init="initGrdSeven"
    />
    <kw-grid
      v-show="isGridEight"
      ref="grdEightRef"
      name="grdEight"
      :visible-rows="10"
      @init="initGrdEight"
    />
    <kw-grid
      v-show="isGridNine"
      ref="grdNineRef"
      name="grdNine"
      :visible-rows="10"
      @init="initGrdNine"
    />
    <kw-grid
      v-show="isGridFive"
      ref="grdFiveRef"
      name="grdFive"
      :visible-rows="10"
      @init="initGrdFive"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, gridUtil, useDataService, useGlobal, defineGrid } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { modal } = useGlobal();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// 검색조건 - 판매채널
const sapPdDv = (await dataService.get('/sms/wells/closing/performance/overdue-penalty/code'))
  .data.map((v) => ({ codeId: v.sapPdDvCd, codeName: v.sapPdDvNm }));
const grdFiveRef = ref(getComponentType('KwGrid'));
const grdSixRef = ref(getComponentType('KwGrid'));
const grdSevenRef = ref(getComponentType('KwGrid'));
const grdEightRef = ref(getComponentType('KwGrid'));
const grdNineRef = ref(getComponentType('KwGrid'));

const isSelectDisable = ref(true);
const isDisable = ref(true);
const isGridSix = ref(false);
const isGridSeven = ref(false);
const isGridEight = ref(false);
const isGridNine = ref(false);
const isGridFive = ref(true);

const totalCount = ref(0);

let cachedParams;
const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD', // 판매유형
  // 'PD_DTL_CD', 없음
  'SELL_TP_DTL_CD', // 판매유형
  'SELL_CHNL_DTL_CD', // 판매채널
);

const searchParams = ref({
  slClYm: dayjs().add(-1, 'M').format('YYYYMM'),
  agrgDv: '1', // 집계구분
  sellTpCd: '1', // 업무구분 (판매유형)
  sellTpDtlCd: 'ALL', // 판매유형상세
  sellChnlDtl: 'ALL', // 판매채널
  cntr: '',
  sapPdDvCd: 'ALL', // SAP상품구분코드
});

async function fetchData() {
  const { sellTpCd } = searchParams.value;
  const { agrgDv } = searchParams.value;
  const { sellTpDtlCd } = searchParams.value;
  let res;
  debugger;
  if (sellTpCd === '1') {
    if (agrgDv === '1') {
      res = await dataService.get('/sms/wells/closing/performance/sales-bond/aggregate', { params: cachedParams });
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      res = await dataService.get('/sms/wells/closing/performance/sales-bond/order-date', { params: cachedParams });
    }
  } else if (sellTpCd === '2' && (sellTpDtlCd === '21' || sellTpDtlCd === '23')) {
    // 렌탈
    if (agrgDv === '1') {
      res = await dataService.get('/sms/wells/closing/performance/sales-bond/rental-aggregate', { params: cachedParams });
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      res = await dataService.get('/sms/wells/closing/performance/sales-bond/rental-day-perOrder', { params: cachedParams });
    }
  } else if (sellTpCd === '2' && (sellTpDtlCd === '22' || sellTpDtlCd === '24')) {
    // 리스
    if (agrgDv === '1') {
      res = await dataService.get('/sms/wells/closing/performance/sales-bond/lease-aggregate', { params: cachedParams });
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      res = await dataService.get('/sms/wells/closing/performance/sales-bond/lease-day-perOrder', { params: cachedParams });
    }
  } else if (sellTpCd === '3') {
    // 멤버십
    if (agrgDv === '1') {
      res = await dataService.get('/sms/wells/closing/performance/sales-bond/member-aggregate', { params: cachedParams });
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      res = await dataService.get('/sms/wells/closing/performance/sales-bond/member-day-perOrder', { params: cachedParams });
    }
  } else if (sellTpCd === '6') {
    // 정기배송
    if (agrgDv === '1') {
      res = await dataService.get('/sms/wells/closing/performance/sales-bond/regular-delivery-aggregate', { params: cachedParams });
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      res = await dataService.get('/sms/wells/closing/performance/sales-bond/regular-delivery-day-perOrder', { params: cachedParams });
    }
  }

  const salesBond = res.data;
  totalCount.value = salesBond.length;

  let mainView;
  if (sellTpCd === '1') {
    mainView = grdFiveRef.value.getView();
  } else if (sellTpCd === '2' && (sellTpDtlCd === '21' || sellTpDtlCd === '23')) {
    mainView = grdSixRef.value.getView();
  } else if (sellTpCd === '2' && (sellTpDtlCd === '22' || sellTpDtlCd === '24')) {
    mainView = grdSevenRef.value.getView();
  } else if (sellTpCd === '3') {
    mainView = grdEightRef.value.getView();
  } else if (sellTpCd === '6') {
    mainView = grdNineRef.value.getView();
  }

  mainView.getDataSource().setRows(salesBond);
  mainView.resetCurrent();
}

async function onChangeChechOption() {
  const { agrgDv } = searchParams.value; // 집계구분
  const { sellTpCd } = searchParams.value; // 업무구분
  const { sellTpDtlCd } = searchParams.value; // 업무구분
  // const { mlgBtdPrpdAmt } = searchParams.value; // 포인트 조회

  isGridFive.value = false;
  isGridSix.value = false;
  isGridSeven.value = false;
  isGridEight.value = false;
  isGridNine.value = false;

  if (agrgDv === '3') {
    isDisable.value = false;
  } else {
    isDisable.value = true;
  }

  if (sellTpCd === '1') {
    isGridFive.value = true;
  } else if (sellTpCd === '2' && (sellTpDtlCd === '21' || sellTpDtlCd === '23')) {
    isGridSix.value = true;
  } else if (sellTpCd === '2' && (sellTpDtlCd === '22' || sellTpDtlCd === '24')) {
    isGridSeven.value = true;
  } else if (sellTpCd === '3') {
    isGridEight.value = true;
  } else if (sellTpCd === '6') {
    isGridNine.value = true;
  }
}
async function onClickIcon() {
  const { dtlCntr } = searchParams.value;
  const res = await modal({
    component: 'WwctaContractNumberListP',
    componentProps: { dtlCntr },
  });

  if (res.result) {
    // res.result
  }
}

async function onClickSearch() {
  debugger;
  cachedParams = cloneDeep(searchParams.value);
  fetchData();
}

async function onChangeAgrgDiv() {
  const { agrgDv } = searchParams.value;
  const { sellTpCd } = searchParams.value;
  const { sellTpDtlCd } = searchParams.value;

  if (sellTpCd === '1') {
    const view = grdFiveRef.value.getView();
    if (agrgDv === '1') {
      view.columnByName('slClYm').visible = true;
      view.columnByName('perfDt').visible = false;
      view.columnByName('sellTpCd').visible = false;
      view.columnByName('sellTpDtlCd').visible = false;
      view.columnByName('sapPdDvCd').visible = false;
      view.columnByName('cntrNo').visible = false;
      view.columnByName('cstKnm').visible = false;
      view.columnByName('basePdCd').visible = false;
      view.columnByName('pdNm').visible = false;
      view.columnByName('slRcogDt').visible = false;

      view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 2 }];
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      view.columnByName('slClYm').visible = false;
      view.columnByName('perfDt').visible = true;
      view.columnByName('sellTpCd').visible = true;
      view.columnByName('sellTpDtlCd').visible = true;
      view.columnByName('sapPdDvCd').visible = true;
      view.columnByName('cntrNo').visible = true;
      view.columnByName('cstKnm').visible = true;
      view.columnByName('basePdCd').visible = true;
      view.columnByName('pdNm').visible = true;
      view.columnByName('slRcogDt').visible = true;

      view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 7 }];
    }
  } else if (sellTpCd === '2' && (sellTpDtlCd === '21' || sellTpDtlCd === '23')) {
    const view = grdSixRef.value.getView();
    if (agrgDv === '1') {
      view.columnByName('slClYm').visible = true;
      view.columnByName('perfDt').visible = false;
      view.columnByName('sellTpCd').visible = false;
      view.columnByName('sellTpDtlCd').visible = false;
      view.columnByName('sapPdDvCd').visible = false;
      view.columnByName('cntrNo').visible = false;
      view.columnByName('cstKnm').visible = false;
      view.columnByName('basePdCd').visible = false;
      view.columnByName('pdNm').visible = false;
      view.columnByName('slRcogDt').visible = false;

      view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 2 }];
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      view.columnByName('slClYm').visible = false;
      view.columnByName('perfDt').visible = true;
      view.columnByName('sellTpCd').visible = true;
      view.columnByName('sellTpDtlCd').visible = true;
      view.columnByName('sapPdDvCd').visible = true;
      view.columnByName('cntrNo').visible = true;
      view.columnByName('cstKnm').visible = true;
      view.columnByName('basePdCd').visible = true;
      view.columnByName('pdNm').visible = true;
      view.columnByName('slRcogDt').visible = true;

      view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 7 }];
    }
  } else if (sellTpCd === '2' && (sellTpDtlCd === '22' || sellTpDtlCd === '24')) {
    const view = grdSevenRef.value.getView();
    if (agrgDv === '1') {
      view.columnByName('slClYm').visible = true;
      view.columnByName('perfDt').visible = false;
      view.columnByName('sellTpCd').visible = false;
      view.columnByName('sellTpDtlCd').visible = false;
      view.columnByName('sapPdDvCd').visible = false;
      view.columnByName('cntrNo').visible = false;
      view.columnByName('cstKnm').visible = false;
      view.columnByName('basePdCd').visible = false;
      view.columnByName('pdNm').visible = false;
      view.columnByName('slRcogDt').visible = false;

      view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 2 }];
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      view.columnByName('slClYm').visible = false;
      view.columnByName('perfDt').visible = true;
      view.columnByName('sellTpCd').visible = true;
      view.columnByName('sellTpDtlCd').visible = true;
      view.columnByName('sapPdDvCd').visible = true;
      view.columnByName('cntrNo').visible = true;
      view.columnByName('cstKnm').visible = true;
      view.columnByName('basePdCd').visible = true;
      view.columnByName('pdNm').visible = true;
      view.columnByName('slRcogDt').visible = true;

      view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 7 }];
    }
  } else if (sellTpCd === '3') {
    const view = grdEightRef.value.getView();
    if (agrgDv === '1') {
      view.columnByName('slClYm').visible = true;
      view.columnByName('perfDt').visible = false;
      view.columnByName('sellTpCd').visible = false;
      view.columnByName('sellTpDtlCd').visible = false;
      view.columnByName('sapPdDvCd').visible = false;
      view.columnByName('cntrNo').visible = false;
      view.columnByName('cstKnm').visible = false;
      view.columnByName('basePdCd').visible = false;
      view.columnByName('pdNm').visible = false;
      view.columnByName('slRcogDt').visible = false;

      view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 2 }];
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      view.columnByName('slClYm').visible = false;
      view.columnByName('perfDt').visible = true;
      view.columnByName('sellTpCd').visible = true;
      view.columnByName('sellTpDtlCd').visible = true;
      view.columnByName('sapPdDvCd').visible = true;
      view.columnByName('cntrNo').visible = true;
      view.columnByName('cstKnm').visible = true;
      view.columnByName('basePdCd').visible = true;
      view.columnByName('pdNm').visible = true;
      view.columnByName('slRcogDt').visible = true;

      view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 7 }];
    }
  } else if (sellTpCd === '6') {
    const view = grdNineRef.value.getView();
    if (agrgDv === '1') {
      view.columnByName('slClYm').visible = true;
      view.columnByName('perfDt').visible = false;
      view.columnByName('sellTpCd').visible = false;
      view.columnByName('sellTpDtlCd').visible = false;
      view.columnByName('sapPdDvCd').visible = false;
      view.columnByName('cntrNo').visible = false;
      view.columnByName('cstKnm').visible = false;
      view.columnByName('basePdCd').visible = false;
      view.columnByName('pdNm').visible = false;
      view.columnByName('slRcogDt').visible = false;

      view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 2 }];
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      view.columnByName('slClYm').visible = false;
      view.columnByName('perfDt').visible = true;
      view.columnByName('sellTpCd').visible = true;
      view.columnByName('sellTpDtlCd').visible = true;
      view.columnByName('sapPdDvCd').visible = true;
      view.columnByName('cntrNo').visible = true;
      view.columnByName('cstKnm').visible = true;
      view.columnByName('basePdCd').visible = true;
      view.columnByName('pdNm').visible = true;
      view.columnByName('slRcogDt').visible = true;

      view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 7 }];
    }
  }
}

async function onChangeAggregateDivide() {
  onChangeChechOption();
  onChangeAgrgDiv();
  const { sellTpCd } = searchParams.value;
  if (sellTpCd === '3' || sellTpCd === '5') {
    isSelectDisable.value = false;
  } else {
    isSelectDisable.value = true;
  }
}

async function onChangeBusinessDivide() {
  onChangeChechOption();
  onChangeAgrgDiv();
}

async function onChangeSellTpDtlCd() {
  onChangeChechOption();
  onChangeAgrgDiv();
}

async function onClickExcelDownload() {
  let view;
  if (isGridFive.value === true) {
    view = grdFiveRef.value.getView();
  } else if (isGridSix.value === true) {
    view = grdSixRef.value.getView();
  } else if (isGridSeven.value === true) {
    view = grdSevenRef.value.getView();
  } else if (isGridEight.value === true) {
    view = grdEightRef.value.getView();
  } else if (isGridNine.value === true) {
    view = grdNineRef.value.getView();
  }
  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TIT_SL_BND_ATAM_PS')} - ${t('MSG_TIT_BZNS_ATAM')}`,
    timePostfix: true,
  });
}

async function onClickOpenReport() {
  // 공통 오즈 팝업 가져오면됨

}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdFive = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slClYm', header: t('MSG_TXT_PERF_YM'), width: '150', styleName: 'text-left' }, // 실적년월
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-left' }, // 실적일자
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-left' }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '130', styleName: 'text-center' }, // 판매유형상세
    { fieldName: 'sapPdDvCd', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-left' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '130', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-center' }, // 상품명
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '150', styleName: 'text-center' }, // 매출일자
    { fieldName: 'cwprep', header: t('MSG_TXT_FTRM_CRDOVR'), width: '150', styleName: 'text-right' }, // 전기이월
    { fieldName: 'cwwa111', header: t('MSG_TXT_NOM_SL'), width: '150', styleName: 'text-right' }, // 매출 - 정상매출
    { fieldName: 'cwwa121', header: t('MSG_TXT_CAN_SL'), width: '150', styleName: 'text-right' }, // 매출 - 취소매출
    { fieldName: 'cwwa14', header: t('MSG_TXT_FEE_SL'), width: '150', styleName: 'text-right' }, // 매출 - 수수료매출
    { fieldName: 'cwwa112', header: t('MSG_TXT_GCF_NOM'), width: '150', styleName: 'text-right' }, // 매출 - 상품권정상
    { fieldName: 'cwwa1221', header: t('MSG_TXT_GCF_CAN'), width: '150', styleName: 'text-right' }, // 매출 - 상품권취소
    { fieldName: 'sumMeAmt', header: t('MSG_TXT_SUM'), width: '150', styleName: 'text-right' }, // 매출 - 합계
    { fieldName: 'cwwa161', header: t('MSG_TXT_CNTRAM'), width: '150', styleName: 'text-right' }, // 매출대사 - 계약금
    { fieldName: 'cwwa181', header: t('MSG_TXT_INTAM'), width: '150', styleName: 'text-right' }, // 매출대사 - 할부금
    { fieldName: 'sumInAmt', header: t('MSG_TXT_SUM'), width: '150', styleName: 'text-right' }, // 매출대사 - 합계
    { fieldName: 'col1', header: `${t('MSG_TXT_DFA')}(-)`, width: '150', styleName: 'text-right' }, // 대손
    { fieldName: 'cwprop', header: t('MSG_TXT_EOT_PERID'), width: '150', styleName: 'text-right' }, // 기말기수
    { fieldName: 'cwwa201', header: t('MSG_TXT_CRP_PERID'), width: '150', styleName: 'text-right' }, // 법인기수
    { fieldName: 'cwwa182', header: t('MSG_TXT_GCF'), width: '150', styleName: 'text-right' }, // 상품권
    { fieldName: 'cwwa183', header: t('MSG_TXT_ETC_PRPD_RPLC'), width: '150', styleName: 'text-right' }, // 기타선수대체
    { fieldName: 'cwwa113', header: t('MSG_TXT_IND_TRD_NOM'), width: '150', styleName: 'text-right' }, // 사건거래정상
    { fieldName: 'cwwa123', header: t('MSG_TXT_IND_TRD_CAN'), width: '150', styleName: 'text-right' }, // 사건거래취소
    { fieldName: 'cwwa164', header: t('MSG_TXT_IND_TRD_DP'), width: '150', styleName: 'text-right' }, // 사건거래입금
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  const layoutSub = [
    'slClYm',
    'perfDt',
    'sellTpCd',
    'sellTpDtlCd',
    'sapPdDvCd',
    'cntrNo',
    'cstKnm',
    'basePdCd',
    'pdNm',
    'slRcogDt',
    'cwprep',
    {
      header: `${t('MSG_TXT_SL')}(+)`, /* 매출(+) */
      direction: 'horizontal',
      items: ['cwwa111', 'cwwa121', 'cwwa14', 'cwwa112', 'cwwa1221', 'sumMeAmt'],
    },
    {
      header: `${t('MSG_TXT_SL_CPRCNF')}(-)`, /* 매출대사(-) */
      direction: 'horizontal',
      items: ['cwwa161', 'cwwa181', 'sumInAmt'],
    },
    'col1',
    'cwprop',
    'cwwa201',
    'cwwa182',
    'cwwa183',
    'cwwa113',
    'cwwa123',
    'cwwa164',
  ];
  view.setColumnLayout(layoutSub);

  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 7 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
});

const initGrdSix = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slClYm', header: t('MSG_TXT_PERF_YM'), width: '150', styleName: 'text-left' }, // 실적년월
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-left' }, // 실적일자
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-left' }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '130', styleName: 'text-center' }, // 판매유형상세
    { fieldName: 'sapPdDvCd', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-left' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '130', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-center' }, // 상품명
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '150', styleName: 'text-center' }, // 매출일자
    { fieldName: 'w1Am01', header: t('MSG_TXT_FTRM_CRDOVR'), width: '150', styleName: 'text-right' }, // 전기이월
    { fieldName: 'w1Am05', header: t('MSG_TXT_NOM_SL'), width: '130', styleName: 'text-left' }, // 매출 - 정상매출
    { fieldName: 'w1Am06', header: t('MSG_TXT_CAN_SL'), width: '130', styleName: 'text-center' }, //  매출 - 취소매출
    { fieldName: 'w1Am08', header: t('MSG_TXT_SUM'), width: '130', styleName: 'text-left' }, //  매출 - 합계
    { fieldName: 'w1Am11', header: `${t('MSG_TXT_SL_CPRCNF')}(-)`, width: '180', styleName: 'text-right' }, // 매출대사(-)
    { fieldName: 'w1Am13', header: `${t('MSG_TXT_BOR_RES')}(+)`, width: '150', styleName: 'text-right' }, // 위약잔여(+)
    { fieldName: 'w1Am14', header: `${t('MSG_TXT_BOR_CTR')}(-)`, width: '150', styleName: 'text-right' }, // 위약조정(-)
    { fieldName: 'w1Cm34', header: `${t('MSG_TXT_PRPD_CV')}(+)`, width: '150', styleName: 'text-right' }, // 선수전환(+)
    { fieldName: 'w1Am15', header: `${t('MSG_TXT_DFA')}(-)`, width: '150', styleName: 'text-right' }, //  대손(-)
    { fieldName: 'w1Am16', header: t('MSG_TXT_UC_AMT'), width: '180', styleName: 'text-right' }, // 미수금액
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  const layoutMain = [
    'slClYm',
    'perfDt',
    'sellTpCd',
    'sellTpDtlCd',
    'sapPdDvCd',
    'cntrNo',
    'cstKnm',
    'basePdCd',
    'pdNm',
    'slRcogDt',
    'w1Am01',
    {
      header: `${t('MSG_TXT_SL')}(+)`, /* 매출(+) */
      direction: 'horizontal',
      items: ['w1Am05', 'w1Am06', 'w1Am08'],
    },
    'w1Am11',
    'w1Am13',
    'w1Am14',
    'w1Cm34',
    'w1Am15',
    'w1Am16',
  ];
  view.setColumnLayout(layoutMain);

  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 7 }];
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
  view.rowIndicator.visible = true;
});

const initGrdSeven = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slClYm', header: t('MSG_TXT_PERF_YM'), width: '150', styleName: 'text-left' }, // 실적년월
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-left' }, // 실적일자
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-left' }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '130', styleName: 'text-center' }, // 판매유형상세
    { fieldName: 'sapPdDvCd', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-left' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '130', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-center' }, // 상품명
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '150', styleName: 'text-center' }, // 매출일자
    { fieldName: 'w1Am01', header: t('MSG_TXT_FTRM_CRDOVR'), width: '150', styleName: 'text-right' }, // 전기이월
    { fieldName: 'w1Am04', header: t('MSG_TXT_PCAM_SL'), width: '150', styleName: 'text-right' }, // 원금매출
    { fieldName: 'w1Am07', header: t('MSG_TXT_INT_SL'), width: '150', styleName: 'text-right' }, // 이자매출
    { fieldName: 'w1Am58', header: t('MSG_TXT_SV_SL'), width: '150', styleName: 'text-right' }, // 서비스매출
    { fieldName: 'w1Am59', header: t('MSG_TXT_SUM'), width: '150', styleName: 'text-right' }, // 합계
    { fieldName: 'w1Am08', header: t('MSG_TXT_SL_CTR'), width: '150', styleName: 'text-right' }, // 매출조정
    { fieldName: 'w1Am11', header: t('MSG_TXT_SL_CPRCNF'), width: '150', styleName: 'text-right' }, // 매출대사
    { fieldName: 'w1Am15', header: t('MSG_TXT_DFA'), width: '150', styleName: 'text-right' }, // 대손
    { fieldName: 'w1Am12', header: t('MSG_TXT_UC_AMT'), width: '150', styleName: 'text-right' }, // 미수금액
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  const layoutThird = [
    'slClYm', 'perfDt', 'sellTpCd', 'sellTpDtlCd', 'sapPdDvCd', 'cntrNo', 'cstKnm', 'basePdCd', 'pdNm', 'slRcogDt', 'w1Am01',
    {
      header: `${t('MSG_TXT_SL')}(+)`, /* 매출(+) */
      direction: 'horizontal',
      items: ['w1Am04', 'w1Am07', 'w1Am58', 'w1Am59'],
    },
    'w1Am08',
    'w1Am11',
    'w1Am15',
    'w1Am12',
  ];
  view.setColumnLayout(layoutThird);

  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 7 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
});
const initGrdEight = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slClYm', header: t('MSG_TXT_PERF_YM'), width: '150', styleName: 'text-left' }, // 실적년월
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-left' }, // 실적일자
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-left' }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '130', styleName: 'text-center' }, // 판매유형상세
    { fieldName: 'sapPdDvCd', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-left' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '130', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-center' }, // 상품명
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '150', styleName: 'text-center' }, // 매출일자
    { fieldName: 'w1Am01', header: t('MSG_TXT_FTRM_CRDOVR'), width: '150', styleName: 'text-right' }, // 전기이월
    { fieldName: 'w1Am02', header: t('MSG_TXT_NOM_SL'), width: '150', styleName: 'text-center' }, // 원금매출
    { fieldName: 'w1Am03', header: t('MSG_TXT_CAN_SL'), width: '150', styleName: 'text-right' }, // 취소매출
    { fieldName: 'w1Am06', header: t('MSG_TXT_SUM'), width: '150', styleName: 'text-right' }, // 합계
    { fieldName: 'w1Am09', header: `${t('MSG_TXT_SL_CPRCNF')}(-)`, width: '150', styleName: 'text-right' }, // 매출대사
    { fieldName: 'w1Am15', header: `${t('MSG_TXT_DFA')}(-)`, width: '150', styleName: 'text-right' }, // 대손
    { fieldName: 'w1Am12', header: t('MSG_TXT_UC_AMT'), width: '150', styleName: 'text-right' }, // 미수금액
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  const layoutThird = [
    'slClYm', 'perfDt', 'sellTpCd', 'sellTpDtlCd', 'sapPdDvCd', 'cntrNo', 'cstKnm', 'basePdCd', 'pdNm', 'slRcogDt', 'w1Am01',
    {
      header: `${t('MSG_TXT_SL')}(+)`, /* 매출(+) */
      direction: 'horizontal',
      items: ['w1Am02', 'w1Am03', 'w1Am06'],
    },
    'w1Am09', 'w1Am15', 'w1Am12',
  ];
  view.setColumnLayout(layoutThird);
  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 7 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
});

const initGrdNine = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'slClYm', header: t('MSG_TXT_PERF_YM'), width: '150', styleName: 'text-left' }, // 실적년월
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-left' }, // 실적일자
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-left' }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '130', styleName: 'text-center' }, // 판매유형상세
    { fieldName: 'sapPdDvCd', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-left' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '130', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-center' }, // 상품명
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '150', styleName: 'text-center' }, // 매출일자
    { fieldName: 'w1Am01', header: t('MSG_TXT_FTRM_CRDOVR'), width: '150', styleName: 'text-right' }, // 전기이월
    { fieldName: 'w1Am19', header: `${t('MSG_TXT_SL')}(+)`, width: '130', styleName: 'text-center' }, // 매출
    { fieldName: 'w1Am29', header: `${t('MSG_TXT_SL_CPRCNF')}(-)`, width: '130', styleName: 'text-center' }, // 매출대사
    { fieldName: 'w1Am15', header: `${t('MSG_TXT_DFA')}(-)`, width: '150', styleName: 'text-right' }, // 대손
    { fieldName: 'w1Am99', header: t('MSG_TXT_UC_AMT'), width: '150', styleName: 'text-right' }, // 미수금액
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 7 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
});

const selectAgrgDv = { // 집계구분  - TODO.공통코드가 없는 관계로 임시로
  options: [{ codeId: '1', codeName: '집계' }, { codeId: '2', codeName: '일자별' }, { codeId: '3', codeName: '주문별' }, { codeId: '4', codeName: '가로계산식 틀린 회원' }],
};

onMounted(async () => {
  debugger;
  const view = grdFiveRef.value.getView();
  view.columnByName('perfDt').visible = false;
  view.columnByName('sellTpCd').visible = false;
  view.columnByName('sellTpDtlCd').visible = false;
  view.columnByName('sapPdDvCd').visible = false;
  view.columnByName('cntrNo').visible = false;
  view.columnByName('cstKnm').visible = false;
  view.columnByName('basePdCd').visible = false;
  view.columnByName('pdNm').visible = false;
  view.columnByName('slRcogDt').visible = false;

  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: 2 }];
});

</script>
