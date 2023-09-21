<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : DCB
 2. 프로그램 ID : WwdcbLeaseSalesControlCanAgrgM - 리스 매출조정/취소 집계 - W-CL-U-0053M02
 3. 작성자 : kimsd
 4. 작성일 : 2023.07.20
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 리스 매출조정/취소 집계 (http://localhost:3000/#/closing/wwdcb-lease-sales-control-can-agrg)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_DIV')"
          required
        >
          <kw-option-group
            v-model="searchParams.sellTpDtlCd"
            :label="$t('MSG_TXT_DIV')"
            type="radio"
            :options="rental"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-btn
          v-permission:download
          icon="download_on"
          :disable="pageInfo.totalCount === 0"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExportView"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const now = dayjs();
const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const grdMainRef = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes('SELL_TP_DTL_CD', 'COD_PAGE_SIZE_OPTIONS');
const rental = codes.SELL_TP_DTL_CD.filter((p1) => ['22', '24', '25', '26'].includes(p1.codeId));

const searchParams = ref({
  sellTpDtlCd: '22',
  perfYm: now.format('YYYYMM'),
});

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/closing/cancel-bor-control/paging', { params: { ...cachedParams, ...pageInfo.value } });
  console.log(res.data);
  const { list: state, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
}

/*
 *  Search - 조회
 */
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExportView() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/closing/cancel-bor-control/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Gri
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'perfYm', styleName: 'text-center', header: t('MSG_TXT_PERF_YM'), width: '92', datetimeFormat: 'yyyy-MM' }, // 실적년월
    { fieldName: 'cntrDtlSn', styleName: 'text-center', header: t('MSG_TXT_CNTR_DTL_NO'), width: '182' }, // 계약상세번호
    { fieldName: 'canDtm', styleName: 'text-center', header: t('MSG_TXT_CANC_DT'), width: '170', datetimeFormat: 'date' }, // 취소일자
    { fieldName: 'slCtrAmt', header: t('MSG_TXT_SL_CTR'), width: '150', styleName: 'text-right', dataType: 'number' }, // 매출조정
    { fieldName: 'slCanAmt', header: `${t('MSG_TXT_CAN_CTR')}(${t('MSG_TXT_CAN_RES_SLPRC_INC')})`, width: '230', styleName: 'text-right', dataType: 'number' }, // 취소조정(취소 잔여 매출액 포함)
    { fieldName: 'leaseSlCtrAmt', header: t('MSG_TXT_CTR_PCAM'), width: '150', styleName: 'text-right', dataType: 'number' }, // 조정원금
    { fieldName: 'leaseSlCanAmt', header: t('MSG_TXT_CTR_INT'), width: '230', styleName: 'text-right', dataType: 'number' }, // 조정이자
    { fieldName: 'ctrPvdaAmt', header: t('MSG_TXT_RSG_PCAM'), width: '150', styleName: 'text-right', dataType: 'number' }, // 해지원금
    { fieldName: 'canPvdaAmt', header: t('MSG_TXT_RSG_INT'), width: '230', styleName: 'text-right', dataType: 'number' }, // 해지이자
    { fieldName: 'ctrTp', styleName: 'text-center', header: t('MSG_TXT_CTR_TP'), width: '150' }, // 조정유형
    { fieldName: 'slCtrRmkCn', styleName: 'text-left', header: t('MSG_TXT_CAN_CTR_RSON'), width: '300' }, // 취소조정사유
    { fieldName: 'pdNm', styleName: 'text-left', header: t('MSG_TXT_PRDT_NM'), width: '220' }, // 상품명
    { fieldName: 'statChRsonNm', styleName: 'text-center', header: t('MSG_TXT_CAN_RSON'), width: '220' }, // 취소사유
    { fieldName: 'eotBorAmt', header: t('MSG_TXT_FNL_CCAM'), width: '150', styleName: 'text-right', dataType: 'number' }, // 최종위약금
    { fieldName: 'eotDlqAmt', header: t('MSG_TXT_FNL_DLQ_AMT'), width: '150', styleName: 'text-right', dataType: 'number' }, // 최종연체금
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

  view.columnByName('perfYm').setHeaderSummaries({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.columnByName('slCtrAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('slCanAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('leaseSlCtrAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('leaseSlCanAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('ctrPvdaAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('canPvdaAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('eotDlqAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.columnByName('eotBorAmt').setHeaderSummaries({ numberFormat: '#,##0', expression: 'sum' });
  view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 3 }];
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
