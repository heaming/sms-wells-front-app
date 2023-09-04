<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccProductAccountListM - 상품별 계정 현황 - W-CL-U-0032M01
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.04.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품별 계정 현황 조회
****************************************************************************************************
---->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.baseYmFrom"
            v-model:to="searchParams.baseYmTo"
            :label="$t('MSG_TXT_BASE_YM')"
            :model-value="searchParams.baseYmTo"
            type="month"
            rules="date_range_required"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD.filter((v) => ['2', '3', '6'].includes(v.codeId))"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_SELL_TP_DTL')">
          <kw-select
            v-if="searchParams.sellTpCd === '2'"
            v-model="searchParams.sellTpDtlCd"
            :options="codes.SELL_TP_DTL_CD.filter(v => v.userDfn02 === '2')"
            first-option="all"
            first-option-value="ALL"
          />
          <kw-select
            v-else-if="searchParams.sellTpCd === '3'"
            v-model="searchParams.sellTpDtlCd"
            :options="codes.SELL_TP_DTL_CD.filter(v => v.userDfn02 === '3')"
            first-option="all"
            first-option-value="ALL"
          />
          <kw-select
            v-else-if="searchParams.sellTpCd === '6'"
            v-model="searchParams.sellTpDtlCd"
            :options="codes.SELL_TP_DTL_CD.filter(v => v.userDfn02 === '6')"
            first-option="all"
            first-option-value="ALL"
          />
          <kw-select
            v-else-if="searchParams.sellTpCd === 'ALL'"
            v-model="searchParams.sellTpDtlCd"
            :options="codes.SELL_TP_DTL_CD.filter(v => v.codeId === 'ALL')"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
          <kw-option-group
            v-model="searchParams.inqrDv"
            type="radio"
            :options="selectInqrDv.options"
            @change="onSelectInqrDv"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_OG_TP')">
          <kw-select
            v-model="searchParams.ogTpCd"
            :options="codes.OG_TP_CD"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PRDT_CATE')">
          <zwpd-product-classification-select
            ref="productSelRef"
            v-model:product1-level="searchParams.prdtCateHigh"
            v-model:product2-level="searchParams.prdtCateMid"
            search-lvl="2"
            first-option="all"
            :is-show-keyword="false"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          icon="download_on"
          :disable="totalCount === 0"
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
          :label="$t('MSG_BTN_DTL_IZ_DLD')"
          :disable="totalCount === 0"
          secondary
          dense
          @click="onClickDetailExportView"
        />
      </kw-action-top>

      <kw-grid
        v-if="isShow"
        ref="grdTotalRef"
        name="grdTotal"
        :visible-rows="10"
        @init="initGrdTotal"
      />
      <kw-grid
        v-if="!isShow"
        ref="grdProductRef"
        name="grdProduct"
        :visible-rows="10"
        @init="initGrdProduct"
      />
      <kw-grid
        ref="grdExcelRef"
        hidden="true"
        name="grdExcel"
        @init="initGrdExcel"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZwpdProductClassificationSelect from '~sms-common/product/pages/standard/components/ZwpdProductClassificationSelect.vue';

const now = dayjs();
const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdTotalRef = ref(getComponentType('KwGrid'));
const grdProductRef = ref(getComponentType('KwGrid'));
const grdExcelRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);

const isShow = ref(true);

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'OG_TP_CD',
);
const searchParams = ref({
  baseYmFrom: now.subtract(1, 'month').format('YYYYMM'),
  baseYmTo: now.format('YYYYMM'),
  sellTpCd: 'ALL', // 판매유형
  sellTpDtlCd: 'ALL', // 판매유형상세
  inqrDv: '1', // 조회구분
  ogTpCd: 'ALL', // 조직유형
  prdtCateHigh: '', // 상품대분류
  prdtCateMid: '', // 상품중분류
});

async function onSelectInqrDv() {
  const { inqrDv } = searchParams.value;
  if (inqrDv === '1') {
    isShow.value = true;
  } else if (inqrDv === '2') {
    isShow.value = false;
  }
}

let cachedParams;
async function fetchData() {
  const { inqrDv } = searchParams.value;
  let res;
  if (inqrDv === '1') { // 집계
    res = await dataService.get('/sms/wells/closing/product-account/total', { params: cachedParams });
  } else if (inqrDv === '2') { // 상품
    res = await dataService.get('/sms/wells/closing/product-account/product', { params: cachedParams });
  }
  console.log(res.data);
  const productAccountList = res.data;
  totalCount.value = productAccountList.length;
  let mainView;
  if (isShow.value === true) {
    mainView = grdTotalRef.value.getView();
  } else if (isShow.value === false) {
    mainView = grdProductRef.value.getView();
  }
  mainView.getDataSource().setRows(productAccountList);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  await fetchData();
}

async function onClickExportView() {
  let view;
  if (isShow.value === true) {
    view = grdTotalRef.value.getView();
  } else if (isShow.value === false) {
    view = grdProductRef.value.getView();
  }
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

/** TODO : 엑셀 다운로드 컬럼 아직 정의가 안됨 */
async function onClickDetailExportView() {
  const view = grdExcelRef.value.getView();
  const response = await dataService.get('/sms/wells/closing/product-account/excel-download', { params: cachedParams });
  const dataSource = view.getDataSource();
  dataSource.addRows(response.data);

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

watch(() => searchParams.value.sellTpCd, async (val) => {
  if (!isEmpty(val)) {
    console.log('val:', val);
    searchParams.value.sellTpDtlCd = 'ALL';
  }
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdTotal = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_BASE_YM'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '120', styleName: 'text-center', options: codes.SELL_TP_DTL_CD },
    { fieldName: 'agrgCt1', header: t('MSG_TXT_CRDOVR'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt2', header: t('MSG_TXT_INFLW'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt3', header: t('MSG_TXT_EXPIRED'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt4', header: t('MSG_TXT_EXN'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt5', header: t('MSG_TXT_NINC'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt6', header: t('MSG_TXT_SUM'), width: '120', styleName: 'text-right', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });
  view.columnByName('baseYm').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.columnByName('agrgCt1').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt2').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt3').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt4').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt5').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt6').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });

  const layout1 = [
    'baseYm',
    'sellTpCd',
    'sellTpDtlCd',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'agrgCt1',
        'agrgCt2',
        'agrgCt3',
        'agrgCt4',
        'agrgCt5',
        'agrgCt6',
      ],
      header: {
        text: t('MSG_TXT_ACC_IZ'),
      },
    },
  ];
  view.setColumnLayout(layout1);

  view.layoutByColumn('baseYm').summaryUserSpans = [{ colspan: 3 }];
  view.rowIndicator.visible = true;
});

const initGrdProduct = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_BASE_YM'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '116', styleName: 'text-center', options: codes.SELL_TP_DTL_CD },
    { fieldName: 'pdHclsfId', header: t('MSG_TXT_PD_HCLSF'), width: '116', styleName: 'text-center' },
    { fieldName: 'pdMclsfId', header: t('MSG_TXT_PD_MCLSF'), width: '116', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '116', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '239', styleName: 'text-center' },
    { fieldName: 'agrgCt1', header: t('MSG_TXT_CRDOVR'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt2', header: t('MSG_TXT_INFLW'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt3', header: t('MSG_TXT_EXPIRED'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt4', header: t('MSG_TXT_EXN'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt5', header: t('MSG_TXT_NINC'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgCt6', header: t('MSG_TXT_SUM'), width: '120', styleName: 'text-right', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });
  view.columnByName('baseYm').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.columnByName('agrgCt1').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt2').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt3').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt4').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt5').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('agrgCt6').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });

  const layout1 = [
    'baseYm',
    'sellTpCd',
    'sellTpDtlCd',
    'pdHclsfId',
    'pdMclsfId',
    'pdCd',
    'pdNm',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'agrgCt1',
        'agrgCt2',
        'agrgCt3',
        'agrgCt4',
        'agrgCt5',
        'agrgCt6',
      ],
      header: {
        text: t('MSG_TXT_ACC_IZ'),
      },
    },
  ];
  view.setColumnLayout(layout1);

  view.layoutByColumn('baseYm').summaryUserSpans = [{ colspan: 7 }];
  view.rowIndicator.visible = true;
});

const initGrdExcel = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '100', styleName: 'text-center', options: codes.SELL_TP_DTL_CD },
    { fieldName: 'custClsCd', header: t('MSG_TXT_CST_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NAME'), width: '100', styleName: 'text-center' },
    { fieldName: 'newCustYn', header: t('MSG_TXT_NW_KWK_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_CST_AGE'), width: '100', styleName: 'text-center' },
    { fieldName: 'sexDvCd', header: t('MSG_TXT_CST_SEX'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogTpNm', header: t('MSG_TXT_BLG_OG'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BRCH_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SELL_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_SELLER_NAME'), width: '100', styleName: 'text-center' },
    { fieldName: 'ctntCstZip', header: t('MSG_TXT_CNTR_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'ojZip', header: t('MSG_TXT_IST_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdHclsfNm', header: t('MSG_TXT_PD_HCLSF_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdMclsfNm', header: t('MSG_TXT_PD_MCLSF_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'svPrd', header: t('MSG_TXT_SVC_BETWEEN'), width: '100', styleName: 'text-center' },
    { fieldName: 'vstPrdVal', header: t('MSG_TXT_VST_PRD'), width: '100', styleName: 'text-center' },
    { fieldName: 'dutyUseMcn', header: t('MSG_TXT_DUTY_PTRM'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrPtrm', header: t('MSG_TXT_CNTR_PTRM'), width: '100', styleName: 'text-center' },
    { fieldName: 'mmIstmAmt', header: t('MSG_TXT_RTLFE'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrPmotId', header: t('MSG_TXT_PMOT_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'rcpdt', header: t('MSG_TXT_RCP_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrDt', header: t('MSG_TXT_CNTRCT_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'rsgDt', header: t('MSG_TXT_RSG_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'reqdDt', header: t('MSG_TXT_REQD_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'exnDt', header: t('MSG_TXT_DUTY_EXN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrExnDt', header: t('MSG_TXT_CNTR_EXN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'dutyUseMcnYn', header: t('MSG_TXT_DUTY_PTRM_ADVT'), width: '100', styleName: 'text-center' },
    { fieldName: 'rentalTn', header: t('MSG_TXT_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'nomAccYn', header: t('MSG_TXT_NOM_ACC'), width: '100', styleName: 'text-center' }, // 여기까지 기준계약
    { fieldName: 'sellTpDtlCd2', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' },
    { fieldName: 'custClsCd2', header: t('MSG_TXT_CST_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrNo2', header: t('MSG_TXT_CNTR_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstKnm2', header: t('MSG_TXT_CST_NAME'), width: '100', styleName: 'text-center' },
    { fieldName: 'newCustYn2', header: t('MSG_TXT_NW_KWK_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstNo2', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'bryyMmdd2', header: t('MSG_TXT_CST_AGE'), width: '100', styleName: 'text-center' },
    { fieldName: 'sexDvCd2', header: t('MSG_TXT_CST_SEX'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogTpNm2', header: t('MSG_TXT_BLG_OG'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogCd2', header: t('MSG_TXT_BRCH_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo2', header: t('MSG_TXT_SELL_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNm2', header: t('MSG_TXT_SELLER_NAME'), width: '100', styleName: 'text-center' },
    { fieldName: 'ctntCstZip2', header: t('MSG_TXT_CNTR_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'ojZip2', header: t('MSG_TXT_IST_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdHclsfNm2', header: t('MSG_TXT_PD_HCLSF_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdMclsfNm2', header: t('MSG_TXT_PD_MCLSF_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdCd2', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm2', header: t('MSG_TXT_PRDT_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'svPrd2', header: t('MSG_TXT_SVC_BETWEEN'), width: '100', styleName: 'text-center' },
    { fieldName: 'vstPrdVal2', header: t('MSG_TXT_VST_PRD'), width: '100', styleName: 'text-center' },
    { fieldName: 'dutyUseMcn2', header: t('MSG_TXT_DUTY_PTRM'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrPtrm2', header: t('MSG_TXT_CNTR_PTRM'), width: '100', styleName: 'text-center' },
    { fieldName: 'mmIstmAmt2', header: t('MSG_TXT_RTLFE'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrPmotId2', header: t('MSG_TXT_PMOT_CN'), width: '100', styleName: 'text-center' },
    { fieldName: 'rcpdt2', header: t('MSG_TXT_RCP_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrDt2', header: t('MSG_TXT_CNTRCT_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'rsgDt2', header: t('MSG_TXT_RSG_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'reqdDt2', header: t('MSG_TXT_REQD_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'exnDt2', header: t('MSG_TXT_DUTY_EXN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrExnDt2', header: t('MSG_TXT_CNTR_EXN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'dutyUseMcnYn2', header: t('MSG_TXT_DUTY_PTRM_ADVT'), width: '100', styleName: 'text-center' },
    { fieldName: 'rentalTn2', header: t('MSG_TXT_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'nomAccYn2', header: t('MSG_TXT_NOM_ACC'), width: '100', styleName: 'text-center' }, // 여기까지 이전계약
    { fieldName: 'sellTpDtlCd3', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' },
    { fieldName: 'custClsCd3', header: t('MSG_TXT_CST_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrNo3', header: t('MSG_TXT_CNTR_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstKnm3', header: t('MSG_TXT_CST_NAME'), width: '100', styleName: 'text-center' },
    { fieldName: 'newCustYn3', header: t('MSG_TXT_NW_KWK_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstNo3', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'bryyMmdd3', header: t('MSG_TXT_CST_AGE'), width: '100', styleName: 'text-center' },
    { fieldName: 'sexDvCd3', header: t('MSG_TXT_CST_SEX'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogTpNm3', header: t('MSG_TXT_BLG_OG'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogCd3', header: t('MSG_TXT_BRCH_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo3', header: t('MSG_TXT_SELL_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNm3', header: t('MSG_TXT_SELLER_NAME'), width: '100', styleName: 'text-center' },
    { fieldName: 'ctntCstZip3', header: t('MSG_TXT_CNTR_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'ojZip3', header: t('MSG_TXT_IST_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdHclsfNm3', header: t('MSG_TXT_PD_HCLSF_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdMclsfNm3', header: t('MSG_TXT_PD_MCLSF_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdCd3', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm3', header: t('MSG_TXT_PRDT_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'svPrd3', header: t('MSG_TXT_SVC_BETWEEN'), width: '100', styleName: 'text-center' },
    { fieldName: 'vstPrdVal3', header: t('MSG_TXT_VST_PRD'), width: '100', styleName: 'text-center' },
    { fieldName: 'dutyUseMcn3', header: t('MSG_TXT_DUTY_PTRM'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrPtrm3', header: t('MSG_TXT_CNTR_PTRM'), width: '100', styleName: 'text-center' },
    { fieldName: 'mmIstmAmt3', header: t('MSG_TXT_RTLFE'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrPmotId3', header: t('MSG_TXT_PMOT_CN'), width: '100', styleName: 'text-center' },
    { fieldName: 'rcpdt3', header: t('MSG_TXT_RCP_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrDt3', header: t('MSG_TXT_CNTRCT_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'rsgDt3', header: t('MSG_TXT_RSG_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'reqdDt3', header: t('MSG_TXT_REQD_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'exnDt3', header: t('MSG_TXT_DUTY_EXN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrExnDt3', header: t('MSG_TXT_CNTR_EXN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'dutyUseMcnYn3', header: t('MSG_TXT_DUTY_PTRM_ADVT'), width: '100', styleName: 'text-center' },
    { fieldName: 'rentalTn3', header: t('MSG_TXT_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'nomAccYn3', header: t('MSG_TXT_NOM_ACC'), width: '100', styleName: 'text-center' }, // 여기까지 이후계약
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });

  const layout1 = [
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'sellTpDtlCd',
        'custClsCd',
        'cntrNo',
        'cstKnm',
        'newCustYn',
        'cstNo',
        'bryyMmdd',
        'sexDvCd',
        'ogTpNm',
        'ogCd',
        'prtnrNo',
        'prtnrNm',
        'ctntCstZip',
        'ojZip',
        'pdHclsfNm',
        'pdMclsfNm',
        'pdCd',
        'pdNm',
        'svPrd',
        'vstPrdVal',
        'dutyUseMcn',
        'cntrPtrm',
        'mmIstmAmt',
        'cntrPmotId',
        'rcpdt',
        'cntrDt',
        'rsgDt',
        'reqdDt',
        'exnDt',
        'cntrExnDt',
        'dutyUseMcnYn',
        'rentalTn',
        'nomAccYn',
      ],
      header: {
        text: t('MSG_TXT_BASE_CNTR'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'sellTpDtlCd2',
        'custClsCd2',
        'cntrNo2',
        'cstKnm2',
        'newCustYn2',
        'cstNo2',
        'bryyMmdd2',
        'sexDvCd2',
        'ogTpNm2',
        'ogCd2',
        'prtnrNo2',
        'prtnrNm2',
        'ctntCstZip2',
        'ojZip2',
        'pdHclsfNm2',
        'pdMclsfNm2',
        'pdCd2',
        'pdNm2',
        'svPrd2',
        'vstPrdVal2',
        'dutyUseMcn2',
        'cntrPtrm2',
        'mmIstmAmt2',
        'cntrPmotId2',
        'rcpdt2',
        'cntrDt2',
        'rsgDt2',
        'reqdDt2',
        'exnDt2',
        'cntrExnDt2',
        'dutyUseMcnYn2',
        'rentalTn2',
        'nomAccYn2',
      ],
      header: {
        text: t('MSG_TXT_BF_CNTR'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'sellTpDtlCd3',
        'custClsCd3',
        'cntrNo3',
        'cstKnm3',
        'newCustYn3',
        'cstNo3',
        'bryyMmdd3',
        'sexDvCd3',
        'ogTpNm3',
        'ogCd3',
        'prtnrNo3',
        'prtnrNm3',
        'ctntCstZip3',
        'ojZip3',
        'pdHclsfNm3',
        'pdMclsfNm3',
        'pdCd3',
        'pdNm3',
        'svPrd3',
        'vstPrdVal3',
        'dutyUseMcn3',
        'cntrPtrm3',
        'mmIstmAmt3',
        'cntrPmotId3',
        'rcpdt3',
        'cntrDt3',
        'rsgDt3',
        'reqdDt3',
        'exnDt3',
        'cntrExnDt3',
        'dutyUseMcnYn3',
        'rentalTn3',
        'nomAccYn3',
      ],
      header: {
        text: t('MSG_TXT_AF_CNTR'),
      },
    },
  ];
  view.setColumnLayout(layout1);
  view.rowIndicator.visible = false;
});

const selectInqrDv = { // 조회구분
  options: [{ codeId: '1', codeName: t('MSG_TXT_AGRG') }, { codeId: '2', codeName: t('MSG_TXT_PRDT') }],
};

</script>
