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
            rules="required"
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
            :options="codes.SELL_TP_DTL_CD.filter(v => v.codeId === '21' || v.codeId === '22' || v.codeId === '23'
              || v.codeId === '24' || v.codeId === '25' || v.codeId === '26')"
            first-option="all"
            first-option-value="ALL"
          />
          <kw-select
            v-else-if="searchParams.sellTpCd === '3'"
            v-model="searchParams.sellTpDtlCd"
            :options="codes.SELL_TP_DTL_CD.filter(v => v.codeId === '32' || v.codeId === '31' || v.codeId === '33')"
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
          <kw-select
            v-else
            v-model="searchParams.sellTpDtlCd"
            :options="codes.SELL_TP_DTL_CD"
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
import { cloneDeep } from 'lodash-es';
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
  });
}

/** TODO : 엑셀 다운로드 컬럼 아직 정의가 안됨 */
async function onClickDetailExportView() {
  const view = grdExcelRef.value.getView();
  const response = await dataService.get('/sms/wells/closing/product-account/excel-download', { params: cachedParams });
  const dataSource = view.getDataSource();
  dataSource.checkRowStates(false);
  dataSource.addRows(response.data);
  dataSource.checkRowStates(true);

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}
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
        height: 40,
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
        height: 40,
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
    { fieldName: 'col1', header: t('MSG_TXT_SELL_TP_DTL'), width: '100', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_CST_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_CST_NAME'), width: '100', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_NW_KWK_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_KWK'), width: '100', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_CST_AGE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_CST_SEX'), width: '100', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_BLG_OG'), width: '100', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_BRCH_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_SELL_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_SELLER_NAME'), width: '100', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_CNTR_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_IST_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_PDGRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_PRDT_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_SVC_BETWEEN'), width: '100', styleName: 'text-center' },
    { fieldName: 'col19', header: t('MSG_TXT_VST_PRD'), width: '100', styleName: 'text-center' },
    { fieldName: 'col20', header: t('MSG_TXT_DUTY_PTRM'), width: '100', styleName: 'text-center' },
    { fieldName: 'col21', header: t('MSG_TXT_CNTR_PTRM'), width: '100', styleName: 'text-center' },
    { fieldName: 'col22', header: t('MSG_TXT_RTLFE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col23', header: t('MSG_TXT_PMOT_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'col24', header: t('MSG_TXT_RCP_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col25', header: t('MSG_TXT_CNTRCT_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col26', header: t('MSG_TXT_RSG_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col27', header: t('MSG_TXT_REQD_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col28', header: t('MSG_TXT_DUTY_EXN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col29', header: t('MSG_TXT_CNTR_EXN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col30', header: t('MSG_TXT_DUTY_PTRM_ADVT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col31', header: t('MSG_TXT_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'col32', header: t('MSG_TXT_NOM_ACC'), width: '100', styleName: 'text-center' }, // 여기까지 기준계약
    { fieldName: 'col33', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' },
    { fieldName: 'col34', header: t('MSG_TXT_CST_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'col35', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'col36', header: t('MSG_TXT_CST_NAME'), width: '100', styleName: 'text-center' },
    { fieldName: 'col37', header: t('MSG_TXT_NW_KWK_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'col38', header: t('MSG_TXT_KWK'), width: '100', styleName: 'text-center' },
    { fieldName: 'col39', header: t('MSG_TXT_CST_AGE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col40', header: t('MSG_TXT_CST_SEX'), width: '100', styleName: 'text-center' },
    { fieldName: 'col41', header: t('MSG_TXT_BLG_OG'), width: '100', styleName: 'text-center' },
    { fieldName: 'col42', header: t('MSG_TXT_BRCH_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'col43', header: t('MSG_TXT_SELL_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'col44', header: t('MSG_TXT_SELLER_NAME'), width: '100', styleName: 'text-center' },
    { fieldName: 'col45', header: t('MSG_TXT_CNTR_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'col46', header: t('MSG_TXT_IST_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'col47', header: t('MSG_TXT_PDGRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'col48', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col49', header: t('MSG_TXT_PRDT_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'col50', header: t('MSG_TXT_SVC_BETWEEN'), width: '100', styleName: 'text-center' },
    { fieldName: 'col51', header: t('MSG_TXT_VST_PRD'), width: '100', styleName: 'text-center' },
    { fieldName: 'col52', header: t('MSG_TXT_DUTY_PTRM'), width: '100', styleName: 'text-center' },
    { fieldName: 'col53', header: t('MSG_TXT_CNTR_PTRM'), width: '100', styleName: 'text-center' },
    { fieldName: 'col54', header: t('MSG_TXT_RTLFE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col55', header: t('MSG_TXT_PMOT_CN'), width: '100', styleName: 'text-center' },
    { fieldName: 'col56', header: t('MSG_TXT_RCP_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col57', header: t('MSG_TXT_CNTRCT_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col58', header: t('MSG_TXT_RSG_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col59', header: t('MSG_TXT_REQD_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col60', header: t('MSG_TXT_DUTY_EXN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col61', header: t('MSG_TXT_CNTR_EXN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col62', header: t('MSG_TXT_DUTY_PTRM_ADVT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col63', header: t('MSG_TXT_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'col64', header: t('MSG_TXT_NOM_ACC'), width: '100', styleName: 'text-center' }, // 여기까지 이전계약
    { fieldName: 'col65', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' },
    { fieldName: 'col66', header: t('MSG_TXT_CST_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'col67', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'col68', header: t('MSG_TXT_CST_NAME'), width: '100', styleName: 'text-center' },
    { fieldName: 'col69', header: t('MSG_TXT_NW_KWK_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'col70', header: t('MSG_TXT_KWK'), width: '100', styleName: 'text-center' },
    { fieldName: 'col71', header: t('MSG_TXT_CST_AGE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col72', header: t('MSG_TXT_CST_SEX'), width: '100', styleName: 'text-center' },
    { fieldName: 'col73', header: t('MSG_TXT_BLG_OG'), width: '100', styleName: 'text-center' },
    { fieldName: 'col74', header: t('MSG_TXT_BRCH_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'col75', header: t('MSG_TXT_SELL_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'col76', header: t('MSG_TXT_SELLER_NAME'), width: '100', styleName: 'text-center' },
    { fieldName: 'col77', header: t('MSG_TXT_CNTR_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'col78', header: t('MSG_TXT_IST_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'col79', header: t('MSG_TXT_PDGRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'col80', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col81', header: t('MSG_TXT_PRDT_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'col82', header: t('MSG_TXT_SVC_BETWEEN'), width: '100', styleName: 'text-center' },
    { fieldName: 'col83', header: t('MSG_TXT_VST_PRD'), width: '100', styleName: 'text-center' },
    { fieldName: 'col84', header: t('MSG_TXT_DUTY_PTRM'), width: '100', styleName: 'text-center' },
    { fieldName: 'col85', header: t('MSG_TXT_CNTR_PTRM'), width: '100', styleName: 'text-center' },
    { fieldName: 'col86', header: t('MSG_TXT_RTLFE'), width: '100', styleName: 'text-center' },
    { fieldName: 'col87', header: t('MSG_TXT_PMOT_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'col88', header: t('MSG_TXT_RCP_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col89', header: t('MSG_TXT_CNTRCT_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col90', header: t('MSG_TXT_RSG_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col91', header: t('MSG_TXT_REQD_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col92', header: t('MSG_TXT_DUTY_EXN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col93', header: t('MSG_TXT_CNTR_EXN_D'), width: '100', styleName: 'text-center' },
    { fieldName: 'col94', header: t('MSG_TXT_DUTY_PTRM_ADVT'), width: '100', styleName: 'text-center' },
    { fieldName: 'col95', header: t('MSG_TXT_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'col96', header: t('MSG_TXT_NOM_ACC'), width: '100', styleName: 'text-center' }, // 여기까지 이후계약
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  const layout1 = [
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'col1',
        'col2',
        'col3',
        'col4',
        'col5',
      ],
      header: {
        text: t('MSG_TXT_BASE_CNTR'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'col6',
        'col7',
        'col8',
        'col9',
        'col10',
      ],
      header: {
        text: t('MSG_TXT_BF_CNTR'),
      },
    },
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'col11',
        'col12',
        'col13',
        'col14',
        'col15',
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
