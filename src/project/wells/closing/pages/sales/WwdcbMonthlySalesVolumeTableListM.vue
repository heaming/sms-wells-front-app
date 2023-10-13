<!----
****************************************************************************************************
1. 모듈 : DVB
2. 프로그램 ID : WwdcbMonthlySalesVolumeTableListM - 월 매출수량 집계표   / W-CL-U-0111M01
3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.03.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 월 매출수량 집계표 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_TASK_DIV')"
          required
        >
          <kw-option-group
            v-model="searchParams.sellTpCd"
            type="radio"
            :options="businessDivideCodes"
            rules="required"
            :label="$t('MSG_TXT_TASK_DIV')"
            @change="onChangeBusinessDivide"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SL_DT')"
          required
          rules="required"
        >
          <kw-date-range-picker
            v-model:from="searchParams.slStartDt"
            v-model:to="searchParams.slEndDt"
            rules="date_range_required|date_range_months:1"
            :label="$t('MSG_TXT_SL_DT')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MDLV_DV')"
        >
          <kw-select
            v-model="searchParams.sppMthdTpCd"
            :options="makeADeliveryDivideCode"
            :label="$t('MSG_TXT_MDLV_DV')"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('TXT_MSG_SELL_CHNL_CD')"
        >
          <kw-select
            v-model="searchParams.sellInflwChnlDtlCd"
            :options="codes.SELL_CHNL_DTL_CD"
            :label="$t('TXT_MSG_SELL_CHNL_CD')"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_INDI_CORP_GUBUN')"
        >
          <kw-select
            v-model="searchParams.copnDvCd"
            :options="codes.INDV_CRP_CNTR_DV_CD"
            :label="$t('MSG_TXT_INDI_CORP_GUBUN')"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-show="isChangeGridMain"
            :total-count="totalMainCount"
          />
          <kw-paging-info
            v-show="isChangeGridSub"
            :total-count="totalSubCount"
          />
        </template>
        <kw-btn
          v-show="isChangeGridMain"
          v-permission:download
          icon="download_on"
          dense
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalMainCount === 0"
          @click="onClickExcelDownload('main')"
        />
        <kw-btn
          v-show="isChangeGridSub"
          v-permission:download
          icon="download_on"
          dense
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalSubCount === 0"
          @click="onClickExcelDownload('sub')"
        />
      </kw-action-top>

      <kw-grid
        v-show="isChangeGridMain"
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrdMain"
      />
      <kw-grid
        v-show="isChangeGridSub"
        ref="grdSubRef"
        name="grdSub"
        :visible-rows="10"
        @init="initGrdSub"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Initialize Component
// -------------------------------------------------------------------------------------------------
import { defineGrid, codeUtil, useDataService, getComponentType, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import { getBusinessDivideCodes } from '~/modules/sms-common/closing/utils/clUtil';

const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const businessDivideCodes = await getBusinessDivideCodes();
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const isChangeGridMain = ref(true);
const isChangeGridSub = ref(false);
const totalMainCount = ref(0);
const totalSubCount = ref(0);
const searchParams = ref({
  sellTpCd: '1',
  slStartDt: dayjs().format('YYYYMMDD'),
  slEndDt: dayjs().format('YYYYMMDD'),
  sppMthdTpCd: '',
  sellInflwChnlDtlCd: '',
  copnDvCd: '',
});

const codes = await codeUtil.getMultiCodes(
  'SELL_CHNL_DTL_CD', // 판매채널
  'SPP_MTHD_TP_CD',
  'INDV_CRP_CNTR_DV_CD',
);

const makeADeliveryDivideCode = codes.SPP_MTHD_TP_CD.filter((v) => ['1', '2'].includes(v.codeId));

async function fetchData() {
  const { sellTpCd } = searchParams.value;
  const view = sellTpCd === '1' ? grdMainRef.value.getView() : grdSubRef.value.getView();
  let res;
  if (sellTpCd === '1') {
    res = await dataService.get('/sms/wells/closing/sales/rental', { params: cachedParams });
    totalMainCount.value = res.data.length;
  } else if (sellTpCd === '2') {
    res = await dataService.get('/sms/wells/closing/sales/payment', { params: cachedParams });
    totalSubCount.value = res.data.length;
  }
  view.getDataSource().setRows(res.data);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  fetchData();
}

async function onChangeBusinessDivide() {
  const { sellTpCd } = searchParams.value;

  isChangeGridMain.value = false;
  isChangeGridSub.value = false;
  if (sellTpCd === '1') {
    isChangeGridMain.value = true;
  } else if (sellTpCd === '2') {
    isChangeGridSub.value = true;
  }
}

async function onClickExcelDownload(gridGb) {
  const view = gridGb === 'main' ? grdMainRef.value.getView() : grdSubRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: gridGb === 'main' ? `${currentRoute.value.meta.menuName}_${t('MSG_TXT_RENTAL')}` : `${currentRoute.value.meta.menuName}_${t('MSG_TXT_LUMP_SUM_INST')}`,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_PD_CD'), width: '200', styleName: 'text-center', footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } }, // SAP상품코드
    { fieldName: 'matPdCd', header: t('MSG_TXT_RVPY_CD'), width: '190', styleName: 'text-center' }, // 수불코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '190', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '300', styleName: 'text-left' }, // 상품명
    { fieldName: 'svPdTpCd', header: t('MSG_TXT_USWY_DV'), width: '150', styleName: 'text-center' }, // 용도구분
    { fieldName: 'cnt', header: t('MSG_TXT_CT_CASE'), width: '149', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } }, // 건수(건)

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setFooters({
    visible: true,
    items: [
      { height: 42 },
    ],
  });
  view.layoutByColumn('sapMatCd').footerUserSpans = [{ colspan: 5 }];
});

const initGrdSub = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_PD_CD'), width: '200', styleName: 'text-center', footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } }, // SAP상품코드
    { fieldName: 'matPdCd', header: t('MSG_TXT_RVPY_CD'), width: '190', styleName: 'text-center' }, // 수불코드
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '190', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '300', styleName: 'text-left' }, // 상품명
    { fieldName: 'tot', header: t('MSG_TXT_ALL'), width: '180', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } }, // 전체
    { fieldName: 'stlmTpCd1', header: t('MSG_TXT_FULPY'), width: '149', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } }, // 완불
    { fieldName: 'stlmTpCd2', header: t('MSG_TXT_ISTM'), width: '149', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } }, // 환불
  ];

  const layouts = [
    {
      header: t('MSG_TXT_PRDT_CODE'), /* 상품코드 */
      direction: 'horizontal',
      items: ['sapMatCd', 'matPdCd', 'basePdCd'],
    },
    'pdNm',
    {
      header: t('MSG_TXT_CT_CASE'), /* 건수(건) */
      direction: 'horizontal',
      items: ['tot', 'stlmTpCd1', 'stlmTpCd2'],
    },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout(layouts);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setFooters({
    visible: true,
    items: [
      { height: 42 },
    ],
  });
  view.layoutByColumn('sapMatCd').footerUserSpans = [{ colspan: 4 }];
});

</script>
