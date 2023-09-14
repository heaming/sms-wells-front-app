<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDB/idvrve
2. 프로그램 ID : WwwdbDepositAggregateMaterialListM - W-WD-U-0144M01
3. 작성자 : kimoon.lim
4. 작성일 : 2023.06.12
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 입출금>개별수납> 입금집계자료
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="3"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 업무구분 -->
        <kw-search-item :label="$t('MSG_TXT_TASK_DIV')">
          <kw-option-group
            v-model="searchParams.dvCd"
            type="radio"
            :options="dvCode.value"
          />
        </kw-search-item>

        <!-- 입금유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_DP_TP')"
        >
          <kw-select
            v-model="searchParams.dpTpCd"
            first-option="all"
            first-option-value="ALL"
            :options="codes.DP_TP_CD"
          />
        </kw-search-item>

        <!-- 기준년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.searchDt"
            rules="required"
            type="month"
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
          <span class="ml8">{{ t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
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
import { stringUtil, defineGrid, getComponentType, gridUtil, codeUtil, useDataService, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const dvCode = [];
const now = dayjs();
const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const apiUrl = '/sms/wells/withdrawal/idvrve/deposit-aggregate-materials';
const searchParams = ref({
  dvCd: '1', /* 업무구분 */
  searchDt: now.format('YYYYMM'),
  dpTpCd: 'ALL',
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'DP_TP_CD',
);
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
let cachedParams2;
const totalParams = ref({});
// spayPer: 0,
// rtlsPer: 0,
// mbmsPer: 0,
// coIstPer: 0,
// mngtPer: 0,
// rglrPer: 0,
// filtPer: 0,
// tot: 0,
// };

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get(`${apiUrl}/paging`, { params: cachedParams });
  const res2 = await dataService.get(`${apiUrl}/total`, { params: cachedParams2 });
  const { list: pages, pageInfo: pagingResult } = res.data;
  totalParams.value = res2.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);
  // view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  data.checkRowStates(true);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);
  cachedParams2 = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${apiUrl}/excel-download`, { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName, // 입금
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
/* 조회용 가데이터 2023.02 */
/**
 * TODO: 입금유형에 따라 판매유형에 입금금액을 분류하여 집계하는 화면입니다.
 *
 * 조회조건
 * 업무구분 - 입금 : 입금일자 // 실적 : 수납일자 기준
 * 기준년월 - 입금/수납일자 기준적용
 *
 */

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dvNm' },
    { fieldName: 'dpTpCd' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'totRowNum' },
    { fieldName: 'spayAmt', dataType: 'number' },
    { fieldName: 'rtlsAmt', dataType: 'number' },
    { fieldName: 'mbmsAmt', dataType: 'number' },
    { fieldName: 'coIstAmt', dataType: 'number' },
    { fieldName: 'mngtAmt', dataType: 'number' },
    { fieldName: 'rglrAmt', dataType: 'number' },
    { fieldName: 'filtAmt', dataType: 'number' },
    { fieldName: 'totAmt', dataType: 'number' },
    { fieldName: 'totRat' },
  ];

  const columns = [
    { fieldName: 'dvNm',
      header: t('MSG_TXT_DIV'), // 구분(공통,렌탈)
      width: '150',
      styleName: 'text-center',
      headerSummary: [{
        styleName: 'text-center',
        text: t('MSG_TXT_SUM'),
      }, {
        styleName: 'text-center',
        text: t('MSG_TXT_RAT'),
      }],
    },
    { fieldName: 'dpTpCd', header: t('MSG_TXT_DP_TP'), width: '153', options: codes.DP_TP_CD }, // 입금유형
    { fieldName: 'spayAmt',
      header: t('MSG_TXT_SNGL_PMNT'), // 할부 -> 일시불
      width: '170',
      styleName: 'text-right',
      headerSummary: [{
        numberFormat: '#,##0',
        valueCallback() {
          return Number(totalParams.value.totSpay);
        },
      },
      {
        numberFormat: '#.##',
        valueCallback() {
          return Number(totalParams.value.spayPer);
        },
      }],
    },
    { fieldName: 'rtlsAmt',
      header: t('MSG_TXT_RENT_LEAS'), // 장기할부 -> 렌탈/리스
      width: '170',
      styleName: 'text-right',
      headerSummary: [{
        numberFormat: '#,##0',
        valueCallback() {
          return Number(totalParams.value.totRtls);
        },
      },
      {
        numberFormat: '#.##',
        valueCallback() {
          return Number(totalParams.value.rtlsPer);
        },
      }],
    },
    { fieldName: 'mbmsAmt',
      header: t('MSG_TXT_MEMBERSHIP'), // 렌탈 -> 멤버십
      width: '170',
      styleName: 'text-right',
      headerSummary: [{
        numberFormat: '#,##0',
        valueCallback() {
          return Number(totalParams.value.totMbms);
        },
      },
      {
        numberFormat: '#.##',
        valueCallback() {
          return Number(totalParams.value.mbmsPer);
        },
      }],
    },
    { fieldName: 'coIstAmt',
      header: t('MSG_TXT_CO_IST'), // 금융리스 -> 회사설치
      width: '170',
      editor: {
        type: 'number',
      },
      styleName: 'text-right',
      headerSummary: [{
        numberFormat: '#,##0',
        valueCallback() {
          return Number(totalParams.value.totCoIst);
        },
      },
      {
        numberFormat: '#.##',
        valueCallback() {
          return Number(totalParams.value.coIstPer);
        },
      }],
    },
    { fieldName: 'mngtAmt',
      header: t('MSG_TXT_KEEP_MNGT'), // 환경리스 -> 유지관리
      width: '170',
      styleName: 'text-right',
      headerSummary: [{
        numberFormat: '#,##0',
        valueCallback() {
          return Number(totalParams.value.totMngt);
        },
      },
      {
        numberFormat: '#.##',
        valueCallback() {
          return Number(totalParams.value.mngtPer);
        },
      }],
    },
    { fieldName: 'rglrAmt',
      header: t('MSG_TXT_REG_DLVR'), // 멤버십 -> 정기배송
      width: '170',
      styleName: 'text-right',
      headerSummary: [{
        numberFormat: '#,##0',
        valueCallback() {
          return Number(totalParams.value.totRglr);
        },
      },
      {
        numberFormat: '#.##',
        valueCallback() {
          return Number(totalParams.value.rglrPer);
        },
      }],
    },
    { fieldName: 'filtAmt',
      header: t('MSG_TXT_FLTR'), // 정기배송 -> 필터
      width: '170',
      styleName: 'text-right',
      headerSummary: [{
        numberFormat: '#,##0',
        valueCallback() {
          return Number(totalParams.value.totFilt);
        },
      },
      {
        numberFormat: '#.##',
        valueCallback() {
          return Number(totalParams.value.filtPer);
        },
      }],
    },
    { fieldName: 'totAmt',
      header: t('MSG_TXT_AMT_SUM'), // 계(금액) -> 금액(합계)
      width: '170',
      styleName: 'text-right',
      headerSummary: [{
        numberFormat: '#,##0',
        valueCallback() {
          return Number(totalParams.value.tot);
        },
      },
      {
        numberFormat: '#.##',
        valueCallback() { // + value
          return Number(totalParams.value.spayPer)
               + Number(totalParams.value.rtlsPer)
               + Number(totalParams.value.mbmsPer)
               + Number(totalParams.value.coIstPer)
               + Number(totalParams.value.mngtPer)
               + Number(totalParams.value.rglrPer)
               + Number(totalParams.value.filtPer);
        },
      }],
    },
    { fieldName: 'totRat',
      header: t('MSG_TXT_AMT_PER'), // 계(%)
      width: '170',
      numberFormat: '#.##',
      styleName: 'text-right',
      displayCallback(g, index) {
        const { spayAmt, rtlsAmt, mbmsAmt, coIstAmt, mngtAmt, rglrAmt, filtAmt } = g.getValues(index.itemIndex);
        return stringUtil.getNumberWithComma(Number((spayAmt
                    + rtlsAmt
                    + mbmsAmt
                    + coIstAmt
                    + mngtAmt
                    + rglrAmt
                    + filtAmt) / totalParams.value.tot) * 100, 2);
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setHeaderSummaries({
    visible: true,
    items: [{ height: 40 }, { height: 40 }],
  });

  view.layoutByColumn('dvNm').summaryUserSpans = [{ colspan: 2 }, { colspan: 2 }];
});

onMounted(async () => {
  dvCode.value = [
    { codeId: '1', codeName: t('MSG_TXT_DP') },
    { codeId: '2', codeName: t('MSG_TXT_PERF') },
  ];
});
</script>
