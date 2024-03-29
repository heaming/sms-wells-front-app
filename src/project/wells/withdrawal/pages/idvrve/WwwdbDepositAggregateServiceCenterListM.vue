<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDB
2. 프로그램 ID : WwwdbDepositAggregateServiceCenterListM
3. 작성자 : eunsun.ha
4. 작성일 : 2023.06.14 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
입금집계현황_서비스센터
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_SV_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtSvDt"
            v-model:to="searchParams.endSvDt"
            :label="t('MSG_TXT_SV_DT')"
            rules="date_range_required|date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_SV_CNR')"
        >
          <kw-select
            v-model="searchParams.svCnr"
            :options="svCnrList"
            option-value="ogId"
            option-label="ogNm"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_EGER')"
        >
          <kw-input
            v-model="searchParams.prtnrKnm"
            icon="search"
            clearable
            @click-icon="onClickSearchPrtnrKnm"
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
          <span class="ml8">(단위: 원)</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          :label="t('MSG_BTN_EXCEL_DOWN')"
          :disabled="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="6"
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
import { codeUtil, useMeta, defineGrid, useDataService, getComponentType, gridUtil, modal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { getConfig } = useMeta();
const now = dayjs();
const { t } = useI18n();
const { currentRoute } = useRouter();
const apiUri = '/sms/wells/withdrawal/idvrve/aggregate-service-centers';
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);
const svCnrList = ref([]);
let cachedParams;

const searchParams = ref({
  strtSvDt: now.subtract(1, 'month').subtract(-1, 'day').format('YYYYMMDD'), // 서비스일자시작
  endSvDt: now.format('YYYYMMDD'), // 서비스일자종료
  svCnr: '', // 서비스 센터
  prtnrKnm: '', // 엔지니어 이름
});

const totalParams = ref({
  recapAmtTt: '', // 유상금액 총합계
  ctrAmtTt: '', // 조정금액 총합계
  adpBilSlAmtTt: '', // 합산청구-매출금액 총합계
  adpBilDpAmtTt: '', // 합산청구-입금액 총합계
  vacSlAmtTt: '', // 가상계좌-매출금액 총합계
  vacDpAmtTt: '', // 가상계좌-입금액 총합계
  cardSlAmtTt: '', // 카드-매출금액 총합계
  cardDpAmtTt: '', // 카드-입금액 총합계
  slAmtSumTt: '', // 매출금액 총합계
  dpAmtSumTt: '', // 입금액 총합계
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get(`${apiUri}/paging`, { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  data.checkRowStates(true);

  view.layoutByColumn('ogNm').groupFooterUserSpans = [{ colspan: 3 }];
  view.layoutByColumn('ogNm').footerUserSpans = [{ colspan: 3 }];

  view.groupPanel.visible = false;

  view.groupBy(['ogNm']);
  view.rowGroup.expandedAdornments = 'footer';
}

// 엔지니어 조회 팝업
async function onClickSearchPrtnrKnm() {
  const { result, payload } = await modal({ component: 'WwsndHumanResourcesListP' });
  if (result) {
    searchParams.value.prtnrKnm = payload[0].prtnrKnm;
  }
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${apiUri}/excel-download`, { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function fetchSvCnrList() {
  return await dataService.get(`${apiUri}/service-center`, { params: cloneDeep(searchParams.value) });
}

async function getSvCnrList() {
  const res = await fetchSvCnrList();
  svCnrList.value = res.data;
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  const totRes = await dataService.get(`${apiUri}/total`, { params: cachedParams });
  totalParams.value = totRes.data;
  await fetchData();
}

onMounted(async () => {
  await getSvCnrList();
});

let startYm = dayjs(searchParams.value.strtSvDt).format('YYYYMM');
let endYm = dayjs(searchParams.value.endSvDt).format('YYYYMM');
watch(() => [searchParams.value.strtSvDt, searchParams.value.endSvDt], (val) => {
  const chngStartYm = dayjs(val[0]).format('YYYYMM');
  const chngEndYm = dayjs(val[1]).format('YYYYMM');

  if (startYm !== chngStartYm || endYm !== chngEndYm) {
    getSvCnrList();
    startYm = chngStartYm;
    endYm = chngEndYm;
  }
}, { immediate: true });
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'recapAmt', dataType: 'number' },
    { fieldName: 'ctrAmt', dataType: 'number' },
    { fieldName: 'adpBilSlAmt', dataType: 'number' },
    { fieldName: 'adpBilDpAmt', dataType: 'number' },
    { fieldName: 'vacSlAmt', dataType: 'number' },
    { fieldName: 'vacDpAmt', dataType: 'number' },
    { fieldName: 'cardSlAmt', dataType: 'number' },
    { fieldName: 'cardDpAmt', dataType: 'number' },
    { fieldName: 'slAmtSum', dataType: 'number' },
    { fieldName: 'dpAmtSum', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'ogNm',
      header: t('MSG_TXT_CENTER_DIVISION'),
      width: '150',
      styleName: 'text-center',
      groupFooter: { text: t('MSG_TXT_SBSUM'), styleName: 'text-center' },
      footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PARTNER_NO'), width: '74.5', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EGER'), width: '74.5', styleName: 'text-left' },
    { fieldName: 'recapAmt',
      header: t('MSG_TXT_RECAP_AMT'),
      width: '89',
      styleName: 'text-right',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(totalParams.value.recapAmtTt);
        },
      } },
    { fieldName: 'ctrAmt',
      header: t('MSG_TXT_CTR_AMT'),
      width: '89',
      styleName: 'text-right',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(totalParams.value.ctrAmtTt);
        },
      } },
    { fieldName: 'adpBilSlAmt',
      header: t('MSG_TXT_SL_AMT'),
      width: '120',
      styleName: 'text-right',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(totalParams.value.adpBilSlAmtTt);
        },
      } },
    { fieldName: 'adpBilDpAmt',
      header: t('MSG_TXT_DEPOSIT_AMT'),
      width: '120',
      styleName: 'text-right',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(totalParams.value.adpBilDpAmtTt);
        },
      } },
    { fieldName: 'vacSlAmt',
      header: t('MSG_TXT_SL_AMT'),
      width: '120',
      styleName: 'text-right',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(totalParams.value.vacSlAmtTt);
        },
      } },
    { fieldName: 'vacDpAmt',
      header: t('MSG_TXT_DEPOSIT_AMT'),
      width: '120',
      styleName: 'text-right',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(totalParams.value.vacDpAmtTt);
        },
      } },
    { fieldName: 'cardSlAmt',
      header: t('MSG_TXT_SL_AMT'),
      width: '120',
      styleName: 'text-right',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(totalParams.value.cardSlAmtTt);
        },
      } },
    { fieldName: 'cardDpAmt',
      header: t('MSG_TXT_DEPOSIT_AMT'),
      width: '120',
      styleName: 'text-right',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(totalParams.value.cardDpAmtTt);
        },
      } },
    { fieldName: 'slAmtSum',
      header: t('MSG_TXT_SL_AMT'),
      width: '120',
      styleName: 'text-right',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(totalParams.value.slAmtSumTt);
        },
      } },
    { fieldName: 'dpAmtSum',
      header: t('MSG_TXT_DEPOSIT_AMT'),
      width: '120',
      styleName: 'text-right',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return Number(totalParams.value.dpAmtSumTt);
        },
      } },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true, items: [{ height: 40 }] });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'ogNm', 'prtnrNo', 'prtnrKnm', 'recapAmt', 'ctrAmt', // single
    {
      header: t('MSG_TXT_ADP_BIL'), // colspan title
      direction: 'horizontal', // merge type
      items: ['adpBilSlAmt', 'adpBilDpAmt'],
    },
    {
      header: t('MSG_TXT_VT_AC'),
      direction: 'horizontal',
      items: ['vacSlAmt', 'vacDpAmt'],
    },
    {
      header: t('MSG_TXT_CARD'),
      direction: 'horizontal',
      items: ['cardSlAmt', 'cardDpAmt'],
    },
    {
      header: t('MSG_TXT_SUM'),
      direction: 'horizontal',
      items: ['slAmtSum', 'dpAmtSum'],
    },

  ]);
});
</script>
