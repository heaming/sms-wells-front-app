<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbBusinessAtamAdjustMgtM - 영업선수금 정산 관리 - W-CL-U-0034M01
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.05.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 영업선수금 정산 관리
****************************************************************************************************
---->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="$t('MSG_TXT_BASE_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_DV')"
        >
          <kw-option-group
            v-model="searchParams.dpKndCd"
            type="radio"
            :options="selectDpKndCd.options"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_AGRG_DV')"
        >
          <kw-option-group
            v-model="searchParams.searchGubun"
            type="radio"
            :options="selectAgrgDv.options"
            @change="onSelectSearchGubun"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SAP_SLIP_NO')"
        >
          <kw-input
            v-model="searchParams.sapAlrpySlpno"
            :maxlength="15"
            regex="alpha_num"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SAP_PD_DV_CD_NM')"
        >
          <kw-select
            v-model="searchParams.sapPdDvCd"
            :options="optionList"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
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
          spaced
          vertical
          inset
        />
        <kw-btn
          :disable="searchParams.searchGubun==='2'"
          secondary
          dense
          :label="$t('MSG_BTN_SLIP_INTLZ')"
          @click="onClickSlipIntlz"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          :disable="searchParams.searchGubun==='2'"
          primary
          dense
          :label="$t('MSG_BTN_SLIP_CRT')"
          @click="onClickSlipCrt"
        />
      </kw-action-top>

      <kw-grid
        v-if="isShowGrd"
        ref="grdTotalRef"
        name="grdTotal"
        :visible-rows="9"
        @init="initGrdTotal"
      />
      <kw-grid
        v-if="!isShowGrd"
        ref="grdDetailRef"
        name="grdDetail"
        :visible-rows="9"
        @init="initGrdDetail"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const now = dayjs();
const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();
const { modal, alert, notify } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdTotalRef = ref(getComponentType('KwGrid'));
const grdDetailRef = ref(getComponentType('KwGrid'));

const totalCount = ref(0);
const isShowGrd = ref(true);

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
);

const codeLists = await dataService.get('/sms/wells/closing/business-atam-adjusts/codes');
const optionList = codeLists.data;

const searchParams = ref({
  baseYm: now.format('YYYYMM'), // 기준년월
  dpKndCd: '1', // 조회구분
  searchGubun: '1', // 집계구분
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약상세번호
  sapAlrpySlpno: '', // SAP전표번호
  sapPdDvCd: 'ALL',
});

let cachedParams;
async function fetchData() {
  const { searchGubun } = searchParams.value;
  if (searchGubun === '1') { // 집계
    isShowGrd.value = true;
  } else if (searchGubun === '2') { // 상세
    isShowGrd.value = false;
  }
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);

  let res;
  console.log('searchGubun:', searchGubun);
  if (searchGubun === '1') { // 집계
    res = await dataService.get('/sms/wells/closing/business-atam-adjusts/total', { params: cachedParams });
  } else if (searchGubun === '2') { // 상세
    res = await dataService.get('/sms/wells/closing/business-atam-adjusts/detail', { params: cachedParams });
  }

  console.log(res.data);
  const mainList = res.data;
  totalCount.value = mainList.length;
  let mainView;
  if (isShowGrd.value === true) {
    mainView = grdTotalRef.value.getView();
  } else if (isShowGrd.value === false) {
    mainView = grdDetailRef.value.getView();
  }

  mainView.getDataSource().setRows(mainList);
}

async function onClickSearch() {
  await fetchData();
}

async function onClickExportView() {
  let view;
  if (isShowGrd.value === true) {
    view = grdTotalRef.value.getView();
  } else if (isShowGrd.value === false) {
    view = grdDetailRef.value.getView();
  }
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

// 전표 초기화 버튼 클릭
async function onClickSlipIntlz() {
  const view = grdTotalRef.value.getView();
  let res;
  const chkDataRows = gridUtil.getCheckedRowValues(view);
  if (chkDataRows.length === 0) {
    res = await modal({
      component: 'WwdcbSlipModP',
    });
  } else {
    const result = gridUtil.getCurrentRowValue(view);
    const { sapAlrpySlpno } = result;
    res = await modal({
      component: 'WwdcbSlipModP',
      componentProps: { sapAlrpySlpno },
    });
  }

  // 리턴값을 체크한 후 재조회
  if (res.result) fetchData();
}

// 전표생성 버튼 클릭
async function onClickSlipCrt() {
  let view;
  if (isShowGrd.value === true) {
    view = grdTotalRef.value.getView();
  } else if (isShowGrd.value === false) {
    view = grdDetailRef.value.getView();
  }

  const chkDataRows = gridUtil.getCheckedRowValues(view);
  if (chkDataRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  let chk = 0;
  for (let i = 0; i < chkDataRows.length; i += 1) {
    if (!isEmpty(chkDataRows[i].slBndAlrpySlipTrsNo)) {
      chk += 1;
    }
  }
  if (chk > 0) {
    await alert(t('MSG_ALT_SLIP_CRT_DTA_INC')); // 이미 전표가 생성된 데이터가 포함되어 있습니다.
    return false;
  }
  // console.log('팝업으로 보내는 데이터:', chkDataRows);
  const res = await modal({
    component: 'WwdcbSlipCreateP',
    componentProps: { chkDataRows },
  });

  // 리턴값을 체크한 후 재조회
  if (res.result) fetchData();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdTotal = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '120', styleName: 'text-center', options: codes.SELL_TP_DTL_CD },
    { fieldName: 'dgCstId', header: t('MSG_TXT_RPRS_CUST_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'sapPdDvNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '170', styleName: 'text-center' },
    { fieldName: 'baseYm', header: t('MSG_TXT_BASE_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'slBndAlrpyAmt',
      header: t('MSG_TXT_BND_ALRPY_AMT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'slBndAlrpySlipTrsNo', header: t('MSG_TXT_SLIP_TRS_NO'), width: '120', styleName: 'text-right' },
    { fieldName: 'sapAlrpySlpno', header: t('MSG_TXT_ALRPY_SLIP_NO'), width: '120', styleName: 'text-right' },
    { fieldName: 'dpBlam',
      header: t('MSG_TXT_ALRPY_AFT_DP_BLAM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'ucAmt',
      header: t('MSG_TXT_ALRPY_AFT_BND_BLAM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
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

  view.columnByName('sellTpCd').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.columnByName('slBndAlrpyAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('dpBlam').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('ucAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });

  view.layoutByColumn('sellTpCd').summaryUserSpans = [{ colspan: 5 }];

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

const initGrdDetail = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '120', styleName: 'text-center', options: codes.SELL_TP_DTL_CD },
    { fieldName: 'sapPdDvNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '170', styleName: 'text-center' },
    { fieldName: 'dgCstId', header: t('MSG_TXT_RPRS_CUST_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'baseYm', header: t('MSG_TXT_BASE_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '80' },
    { fieldName: 'slBndAlrpyDt', header: t('MSG_TXT_BND_ALRPY_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'slBndAlrpyAmt',
      header: t('MSG_TXT_BND_ALRPY_AMT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'slBndAlrpySlipTrsNo', header: t('MSG_TXT_SLIP_TRS_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'sapAlrpySlpno', header: t('MSG_TXT_ALRPY_SLIP_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'rveNo', header: t('MSG_TXT_RVE_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'rveSn', header: t('MSG_TXT_RVE_SN'), width: '120', styleName: 'text-center' },
    { fieldName: 'dpClDt', header: t('MSG_TXT_RVE_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'rveAmt', header: t('MSG_TXT_RVE_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'sapDpSlpno', header: t('MSG_TXT_DP_SLIP_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'dpBlam',
      header: t('MSG_TXT_ALRPY_AFT_DP_BLAM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'slRcogDt', header: t('MSG_TXT_BND_OC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'slBndOcAmt', header: t('MSG_TXT_BND_OC_AMT'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'sapSlSlpno', header: t('MSG_TXT_SL_SLIP_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'ucAmt',
      header: t('MSG_TXT_ALRPY_AFT_BND_BLAM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },

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

  view.columnByName('sellTpCd').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.columnByName('slBndAlrpyAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('dpBlam').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('ucAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });

  view.layoutByColumn('sellTpCd').summaryUserSpans = [{ colspan: 8 }];
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

const selectDpKndCd = { // 조회구분
  options: [{ codeId: '1', codeName: '일시불' }, { codeId: '2', codeName: '일시불외' }, { codeId: '5', codeName: '연체가산금' }],
};

const selectAgrgDv = { // 집계구분
  options: [{ codeId: '1', codeName: '집계' }, { codeId: '2', codeName: '상세' }],
};
</script>
