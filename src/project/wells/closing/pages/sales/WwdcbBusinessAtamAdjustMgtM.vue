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
          v-permission:download
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
          v-permission:update
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
          v-permission:create
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
// 조회
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
    res = await dataService.get('/sms/wells/closing/business-atam-adjusts/detail', { params: cachedParams, timeout: 180000 });
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

// 조회 버튼 클릭
async function onClickSearch() {
  await fetchData();
}

// 엑셀 다운로드 버튼 클릭
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
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD }, // 판매유형코드
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '120', styleName: 'text-center', options: codes.SELL_TP_DTL_CD }, // 판매유형상세
    { fieldName: 'dgCstId', header: t('MSG_TXT_RPRS_CUST_NO'), width: '120', styleName: 'text-center' }, // 대표고객ID
    { fieldName: 'dgCstNm', header: t('MSG_TXT_DG_CST_CD_NM'), width: '120', styleName: 'text-center' }, /* 대표고객명 */
    { fieldName: 'sapPdDvNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '170', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'baseYm', header: t('MSG_TXT_BASE_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 기준년월
    { fieldName: 'slBndAlrpyAmt',
      header: t('MSG_TXT_BND_ALRPY_AMT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 채권반제금액
    { fieldName: 'slBndAlrpySlipTrsNo', header: t('MSG_TXT_SLIP_TRS_NO'), width: '120', styleName: 'text-right' }, // 매출채권반제전표전송번호
    { fieldName: 'sapAlrpySlpno', header: t('MSG_TXT_ALRPY_SLIP_NO'), width: '120', styleName: 'text-right' }, // SAP반제전표번호
    { fieldName: 'dpBlam',
      header: t('MSG_TXT_ALRPY_AFT_DP_BLAM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 반제 후 입금잔액
    { fieldName: 'ucAmt',
      header: t('MSG_TXT_ALRPY_AFT_BND_BLAM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 매출채권잔액
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
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD }, // 판매유형코드
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '120', styleName: 'text-center', options: codes.SELL_TP_DTL_CD }, // 판매유형상세
    { fieldName: 'sapPdDvNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '170', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'dgCstId', header: t('MSG_TXT_RPRS_CUST_NO'), width: '120', styleName: 'text-center' }, // 대표고객ID
    { fieldName: 'dgCstNm', header: t('MSG_TXT_DG_CST_CD_NM'), width: '120', styleName: 'text-center' }, /* 대표고객명 */
    { fieldName: 'baseYm', header: t('MSG_TXT_BASE_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 기준년월
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '120', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '80' }, // 고객명
    { fieldName: 'slBndAlrpyDt', header: t('MSG_TXT_BND_ALRPY_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 채권반제일자
    { fieldName: 'slBndAlrpyAmt',
      header: t('MSG_TXT_BND_ALRPY_AMT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 채권반제금액
    { fieldName: 'slBndAlrpySlipTrsNo', header: t('MSG_TXT_SLIP_TRS_NO'), width: '120', styleName: 'text-center' }, // 매출채권반제전표전송번호
    { fieldName: 'sapAlrpySlpno', header: t('MSG_TXT_ALRPY_SLIP_NO'), width: '120', styleName: 'text-center' }, // SAP반제전표번호
    { fieldName: 'rveNo', header: t('MSG_TXT_RVE_NO'), width: '100', styleName: 'text-center' }, // 수납번호
    { fieldName: 'rveSn', header: t('MSG_TXT_RVE_SN'), width: '120', styleName: 'text-center' }, // 수납일련번호
    { fieldName: 'dpClDt', header: t('MSG_TXT_RVE_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 수납일자 - 입금마감일자
    { fieldName: 'rveAmt', header: t('MSG_TXT_RVE_AMT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 수납금액
    { fieldName: 'sapDpSlpno', header: t('MSG_TXT_DP_SLIP_NO'), width: '120', styleName: 'text-center' }, // SAP입금전표번호
    { fieldName: 'dpBlam',
      header: t('MSG_TXT_ALRPY_AFT_DP_BLAM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 반제 후 입금잔액
    { fieldName: 'slRcogDt', header: t('MSG_TXT_BND_OC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 채권발생일자
    { fieldName: 'slBndOcAmt', header: t('MSG_TXT_BND_OC_AMT'), width: '120', styleName: 'text-right', dataType: 'number' }, // 채권발생금액
    { fieldName: 'sapSlSlpno', header: t('MSG_TXT_SL_SLIP_NO'), width: '120', styleName: 'text-center' }, // SAP매출전표번호
    { fieldName: 'ucAmt',
      header: t('MSG_TXT_ALRPY_AFT_BND_BLAM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 매출채권잔액
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

  view.columnByName('sellTpCd').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.columnByName('slBndAlrpyAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('dpBlam').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('ucAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });

  view.layoutByColumn('sellTpCd').summaryUserSpans = [{ colspan: 8 }];
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

const selectDpKndCd = { // 조회구분
  options: [{ codeId: '1', codeName: t('MSG_TXT_SNGL_PMNT') }, { codeId: '2', codeName: t('MSG_TXT_SPAY_EXCP') }, { codeId: '5', codeName: t('MSG_TXT_DLQ_ADAMT') }],
};

const selectAgrgDv = { // 집계구분
  options: [{ codeId: '1', codeName: t('MSG_TXT_AGRG') }, { codeId: '2', codeName: t('MSG_TXT_DTL') }],
};
</script>
