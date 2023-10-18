<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID :  WmwdbRefundListMContractAmount - 계약금 환불현황 W-WD-U-0130M02
3. 작성자 : sonkiseok
4. 작성일 : 2023.04.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- PGE_WDB_00097
- 계약금 환불 현황을 조회 합니다.
****************************************************************************************************
--->
<template>
  <kw-tab-panel name="2">
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 처리일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRCSDT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDay"
            v-model:to="searchParams.endDay"
            rules="date_range_required|date_range_months:1"
            :label="$t('MSG_TXT_PRCSDT')"
          />
        </kw-search-item>
        <!-- 실적일자 -->
        <kw-search-item
          :label="t('MSG_TXT_PERF_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.perfDtStartDay"
            v-model:to="searchParams.perfDtEndDay"
            rules="date_range_required|date_range_months:1"
            :label="t('MSG_TXT_PERF_DT')"
          />
        </kw-search-item>
        <!-- 업무구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_TASK_DIV')"
        >
          <!-- wells 계약서유형코드 1.일시불(환경가전), 2.일시불(BH), 3.렌탈, 4.멤버십, 5.홈케어서비, 6.모종일시불, 7.정기배송, 8.장기할부, 9.리스 -->
          <kw-select
            v-model="searchParams.cntrwTpCd"
            :options="codes.CNTRW_TP_CD.filter(v => v.codeId==='3' || v.codeId ==='5')"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 출력구분 -->
        <!-- 코드값 확인 필요. 추후 코드로 변경 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRNT_DV')"
        >
          <kw-option-group
            v-model="searchParams.prntDv"
            :model-value="'센터'"
            type="radio"
            :options="['센터', '신용']"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <!-- 환불내역 -->
      <h3>{{ $t('MSG_TXT_RFND_IZ') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
          <!-- (단위:원) -->
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <!-- 리포트 보기 -->
        <kw-btn
          v-permission:print
          icon="report"
          dense
          secondary
          :label="$t('MSG_BTN_RPT_BRWS')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickReportView"
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="excel"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef2"
        name="grdMain2"
        :visible-rows="pageInfo.pageSize - 1"
        @init="initGrdMain2"
      />

      <kw-action-top class="mt30">
        <template #left>
          <!-- 집계현황 -->
          <h3>{{ t('MSG_TXT_AGRG_PS') }}</h3>
        </template>
        <!-- 단위:원 -->
        <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>

      <kw-form
        :cols="4"
        dense
        align-content="right"
      >
        <kw-form-row>
          <!-- 현금 -->
          <kw-form-item :label="$t('MSG_TXT_CASH')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.cashRfndDsbAmtSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 비씨카드 -->
          <kw-form-item :label="$t('MSG_TXT_BC_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.bcCardRfndDsbAmtSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 국민카드 -->
          <kw-form-item :label="$t('MSG_TXT_KB_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.kbCardRfndDsbAmtSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 삼성카드 -->
          <kw-form-item :label="$t('MSG_TXT_SS_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.ssCardRfndDsbAmtSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 하나카드 -->
          <kw-form-item :label="$t('MSG_TXT_HN_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.hnCardRfndDsbAmtSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 신한카드 -->
          <kw-form-item :label="$t('MSG_TXT_SH_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.shCardRfndDsbAmtSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 롯데카드 -->
          <kw-form-item :label="$t('MSG_TXT_LT_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.ltCardRfndDsbAmtSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 현대카드 -->
          <kw-form-item :label="$t('MSG_TXT_HD_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.hdCardRfndDsbAmtSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- NH농협 -->
          <kw-form-item :label="$t('MSG_TXT_NH_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.nhCardRfndDsbAmtSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 여민동락 -->
          <kw-form-item :label="$t('MSG_TXT_YD')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.ydCardRfndDsbAmtSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 카드 공제 -->
          <kw-form-item :label="$t('MSG_TXT_CARD_DDTN')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.cardRfndDdtnAmtSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 회사 귀속 -->
          <kw-form-item :label="$t('MSG_TXT_CO_BLNG')">
            <p>
              0{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 현금계(현금+카드공제) -->
          <kw-form-item :label="$t('MSG_TXT_CSH_CARD_DDTN')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.cashCardRfndDdtnAmtSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 카드 합계 -->
          <kw-form-item :label="$t('MSG_TXT_CARD_SUM')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.cardRfndDsbAmtSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 인수 전금 -->
          <kw-form-item :label="$t('MSG_TXT_TK_BLTF')">
            <!-- 웰스:0, 홈케어:0 -->
            <p>
              {{ t('MSG_TXT_WELS') }}: {{ }}, {{ t('MSG_TXT_HOME_CARE') }}: {{ }}
            </p>
          </kw-form-item>
          <!-- 인수전금 계 -->
          <kw-form-item :label="$t('MSG_TXT_TK_BLTF_SUM')">
            <p>
              0{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 할부전금(웰스) -->
          <kw-form-item :label="$t('MSG_TXT_ISTM_BLTF_WELS')">
            <p>
              0{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 할부전금 계 -->
          <kw-form-item :label="$t('MSG_TXT_ISTM_BLTF_SUM')">
            <p>
              0{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 지연 이자 -->
          <kw-form-item :label="$t('MSG_TXT_PSP_INT')">
            <p>
              0{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- K 포인트 -->
          <kw-form-item :label="$t('MSG_TXT_K_PNT')">
            <p>
              0{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 전금 합계 -->
          <kw-form-item :label="$t('MSG_TXT_BLTF_SUM')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.rfndBltfSum)) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 환불 총계 -->
          <kw-form-item :label="$t('MSG_TXT_RFND_TOT')">
            <p>
              {{stringUtil.getNumberWithComma(toInteger(aggregationStatus.cardRfndDsbAmtSum +
                aggregationStatus.cashRfndDsbAmtSum)) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </div>
  </kw-tab-panel>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, stringUtil } from 'kw-lib';
import { cloneDeep, toInteger } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();

const { currentRoute } = useRouter();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 페이징 옵션
  'CNTRW_TP_CD', // 업무구분
  'SELL_TP_DTL_CD', // 판매유형상세코드'
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});
const grdMainRef2 = ref(getComponentType('KwGrid'));
const now = dayjs();
const apiUrl = '/sms/wells/withdrawal/idvrve/contract-refunds';

const aggregationStatus = ref({
  cashRfndDsbAmtSum: 0,
  bcCardRfndDsbAmtSum: 0,
  kbCardRfndDsbAmtSum: 0,
  ssCardRfndDsbAmtSum: 0,
  hnCardRfndDsbAmtSum: 0,
  shCardRfndDsbAmtSum: 0,
  ltCardRfndDsbAmtSum: 0,
  hdCardRfndDsbAmtSum: 0,
  nhCardRfndDsbAmtSum: 0,
  ydCardRfndDsbAmtSum: 0,
  cardRfndDdtnAmtSum: 0,
  cashCardRfndDdtnAmtSum: 0,
  cardRfndDsbAmtSum: 0,
  rfndDsbPspIntSum: 0,
  rfndBltfSum: 0,
});

const searchParams = ref({
  startDay: now.format('YYYYMM01'), // 처리일자.시작일
  endDay: now.format('YYYYMMDD'), // 처리일자.종료일
  perfDtStartDay: now.format('YYYYMM01'), // 실적일자.시작일
  perfDtEndDay: now.format('YYYYMMDD'), // 실적일자.종료일
  cntrwTpCd: 'ALL', // 업무구분
  prntDv: '', // 출력구분. table column 확인필요.
});

let cachedParams;
let summaryParams;
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const response = await dataService.get(`${apiUrl}/paging`, { params: cachedParams });
  const headerSummary = await dataService.get(`${apiUrl}/summary`, { params: cachedParams });
  summaryParams = headerSummary.data;
  console.log(summaryParams);
  const { list: refundCases, pageInfo: pagingResult } = response.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef2.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(refundCases);
  dataSource.checkRowStates(true);
}
async function fetchData2() {
  // aggregationStatus.value = []; // 집계 현황 초기화
  const response = await dataService.get(`${apiUrl}/aggregate`, { params: searchParams.value });
  Object.assign(aggregationStatus.value, response.data);
  // console.log('contrct aggregationStatus.value', aggregationStatus.value);
  // 테이블 변경으로 아직 확인되지 않은 값들에 대한 인식을 위해 삭제하지 않고 주석 처리 했습니다.
  // aggregationStatus.value.cashRfndDsbAmtSum = response.data.cashRfndDsbAmtSum;
  // aggregationStatus.value.bcCardRfndDsbAmtSum = response.data.bcCardRfndDsbAmtSum;
  // aggregationStatus.value.kbCardRfndDsbAmtSum = response.data.kbCardRfndDsbAmtSum;
  // aggregationStatus.value.ssCardRfndDsbAmtSum = response.data.ssCardRfndDsbAmtSum;
  // aggregationStatus.value.hnCardRfndDsbAmtSum = response.data.hnCardRfndDsbAmtSum;
  // aggregationStatus.value.shCardRfndDsbAmtSum = response.data.shCardRfndDsbAmtSum;
  // aggregationStatus.value.ltCardRfndDsbAmtSum = response.data.ltCardRfndDsbAmtSum;
  // aggregationStatus.value.hdCardRfndDsbAmtSum = response.data.hdCardRfndDsbAmtSum;
  // aggregationStatus.value.nhCardRfndDsbAmtSum = response.data.nhCardRfndDsbAmtSum;
  // aggregationStatus.value.ydCardRfndDsbAmtSum = response.data.ydCardRfndDsbAmtSum;
  // aggregationStatus.value.cardRfndDdtnAmtSum = response.data.cardRfndDdtnAmtSum;
  // /* 확인 필요: 회사귀속 */
  // aggregationStatus.value.cashCardRfndDdtnAmtSum = response.data.cashCardRfndDdtnAmtSum;
  // aggregationStatus.value.cardRfndDsbAmtSum = response.data.cardRfndDsbAmtSum;
  // /* 확인 필요: 인수 전금 웰스: 홈케어: */
  // /* 확인 필요: 인수 전금 계 */
  // /* 확인 필요: 할부전금(웰스)  */
  // /* 확인 필요: 할부전금계 = 인수전금 합계 + 할부전금 합계  */
  // aggregationStatus.value.rfndDsbPspIntSum = response.data.rfndDsbPspIntSum; // 지연이자 합계
  // /* 확인 필요:K 포인트 */
  // /* 확인 필요:전금합계 */
  // /* 확인 필요:환불 총계 */
}

async function onClickSearch() {
  grdMainRef2.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
  await fetchData2();
}

async function onClickReportView() {
  // TODO: OZ REPORT 개발중..
  await notify(t('MSG_ALT_DEVELOPING'));
  // await openReportPopup('/eformsample.ozr', '/eformsample.odi', JSON.stringify({ param1: 'test1', param2: 'test2'}));
}

async function onClickExcelDownload() {
  const response = await dataService.get(`${apiUrl}/excel-download`, { params: cachedParams });
  const view = grdMainRef2.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'rfndRveDt', dataType: 'date' }, // 처리일자
    { fieldName: 'rfndPerfDt', dataType: 'date' }, // 실적일자
    { fieldName: 'cntrwTpCd' }, // 업무구분
    { fieldName: 'tmp1' }, // 출력구분 - ※조회조건 확인필요.
    { fieldName: 'sellAmt', dataType: 'number' }, // 판매금액
    { fieldName: 'dsbAmt', dataType: 'number' }, // 지급금액
    { fieldName: 'rfndDsbAmt', dataType: 'number' }, // 환불금액
    { fieldName: 'rfndDsbPspInt', dataType: 'number' }, // 지연이자
    { fieldName: 'cardRfndFee', dataType: 'number' }, // 카드수수료
    { fieldName: 'cshCardRfndFnitCd' }, // 은행/카드사
    { fieldName: 'cshCardRfndAcnoCrcdnoEncr' }, // 계좌/카드번호
    { fieldName: 'cshRfndAcownNm' }, // 예금주
    { fieldName: 'istmMcn' }, // 확인필요.할부개월
    { fieldName: 'cardRfndCrdcdAprno' }, // 승인번호
  ];

  const columns = [
    { fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '130',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    }, // 계약상세번호
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'),
      width: '80',
      styleName: 'text-center',
      headerSummary: {
        styleName: 'text-right',
        numberFormat: '#,###',
        valueCallback() {
          return `총 ${Number(summaryParams.cntCstKnm)}건`;
        },
      },
    }, // 고객명
    { fieldName: 'rfndRveDt', header: t('MSG_TXT_PRCSDT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 처리일자
    { fieldName: 'rfndPerfDt', header: t('MSG_TXT_PERF_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 실적일자
    { fieldName: 'cntrwTpCd', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center', options: codes.CNTRW_TP_CD }, // 업무구분
    { fieldName: 'tmp1', header: t('MSG_TXT_PRNT_DV'), width: '100', styleName: 'text-center', options: codes.CNTRW_TP_CD }, // 확인필요.출력구분
    { fieldName: 'sellAmt',
      header: t('MSG_TXT_SALE_PRICE'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        styleName: 'text-right',
        numberFormat: '#,###',
        valueCallback() {
          return Number(summaryParams.totSellAmt);
        },
      },
    }, // 판매금액
    { fieldName: 'dsbAmt',
      header: t('MSG_TXT_DSB_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        styleName: 'text-right',
        numberFormat: '#,###',
        valueCallback() {
          return Number(summaryParams.totDsbAmt);
        },
      },
    }, // 지급금액
    { fieldName: 'rfndDsbAmt',
      header: t('MSG_TXT_RFND_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        styleName: 'text-right',
        numberFormat: '#,###',
        valueCallback() {
          return Number(summaryParams.totRfndDsbAmt);
        },
      } }, // 환불금액
    { fieldName: 'rfndDsbPspInt',
      header: t('MSG_TXT_PSP_INT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        styleName: 'text-right',
        numberFormat: '#,###',
        valueCallback() {
          return Number(summaryParams.totRfndDsbPspInt);
        },
      },
    }, // 지연이자
    { fieldName: 'cardRfndFee',
      header: t('MSG_TXT_CARD_FEE'),
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        styleName: 'text-right',
        numberFormat: '#,###',
        valueCallback() {
          return Number(summaryParams.totCardRfndFee);
        },
      },
    }, // 카드수수료
    { fieldName: 'cshCardRfndFnitCd', header: t('MSG_TXT_BNK_CDCO'), width: '104', styleName: 'text-center' }, // 은행/카드사
    { fieldName: 'cshCardRfndAcnoCrcdnoEncr', header: t('MSG_TXT_AC_CDNO'), width: '180', styleName: 'text-left' }, // 계좌/카드번호
    { fieldName: 'cshRfndAcownNm', header: t('MSG_TXT_ACHLDR'), width: '100', styleName: 'text-center' }, // 예금주
    { fieldName: 'istmMcn', header: t('MSG_TXT_ISTM_MCNT'), width: '100', styleName: 'text-center' }, // 할부개월
    { fieldName: 'cardRfndCrdcdAprno', header: t('MSG_TXT_APR_NO'), width: '104', styleName: 'text-center' }, // 승인번호
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };

  view.layoutByColumn('cntrDtlNo').summaryUserSpans = [{ colspan: 1 }];
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        // styleName: 'blue-column', //  개별 css 스타일 적용 필요시
        height: 40,
      },
    ],
  });
  // view.layoutByColumn('cntrDltNo').summaryUserSpans = [{ colspan: 1 }];
  view.setColumnLayout([
    'cntrDtlNo',
    'cstKnm',
    'rfndRveDt',
    'rfndPerfDt',
    'cntrwTpCd',
    'tmp1',
    'sellAmt',
    {
      // 환불 내역
      header: t('MSG_TXT_RFND_IZ'),
      direction: 'horizontal',
      items: ['dsbAmt', 'rfndDsbAmt', 'rfndDsbPspInt', 'cardRfndFee', 'cshCardRfndFnitCd', 'cshCardRfndAcnoCrcdnoEncr', 'cshRfndAcownNm', 'istmMcn', 'cardRfndCrdcdAprno'],
    },
  ]);

  // data.setRows([
  // eslint-disable-next-line max-len
  //   { cntrNoSn: '20226008136', cstKnm: '정영순', fnlMdfcDtm: '20220830', perfDt: '20220830', cntrwTpCd: '웰스', tmp1: '센터', sellAmt: '547000', tmp2: '547000', rfndDsbAmt: '547000', rfndDsbPspInt: '0', cardRfndFee: '0', cshCardRfndFnitCd: '신한은행', cshCardRfndAcnoCrcdnoEncr: '111111111111', cshRfndAcownNm: '김온달', istmMcn: '12', cardRfndCrdcdAprno: '1111111' },
  // eslint-disable-next-line max-len
  //   { cntrNoSn: '20226008136', cstKnm: '정영순', fnlMdfcDtm: '20220830', perfDt: '20220830', cntrwTpCd: '웰스', tmp1: '센터', sellAmt: '547000', tmp2: '547000', rfndDsbAmt: '547000', rfndDsbPspInt: '0', cardRfndFee: '0', cshCardRfndFnitCd: '신한은행', cshCardRfndAcnoCrcdnoEncr: '111111111111', cshRfndAcownNm: '김온달', istmMcn: '12', cardRfndCrdcdAprno: '1111111' },
  // eslint-disable-next-line max-len
  //   { cntrNoSn: '20226008136', cstKnm: '정영순', fnlMdfcDtm: '20220830', perfDt: '20220830', cntrwTpCd: '웰스', tmp1: '센터', sellAmt: '547000', tmp2: '547000', rfndDsbAmt: '547000', rfndDsbPspInt: '0', cardRfndFee: '0', cshCardRfndFnitCd: '신한은행', cshCardRfndAcnoCrcdnoEncr: '111111111111', cshRfndAcownNm: '김온달', istmMcn: '12', cardRfndCrdcdAprno: '1111111' },
  // eslint-disable-next-line max-len
  //   { cntrNoSn: '20226008136', cstKnm: '정영순', fnlMdfcDtm: '20220830', perfDt: '20220830', cntrwTpCd: '웰스', tmp1: '센터', sellAmt: '547000', tmp2: '547000', rfndDsbAmt: '547000', rfndDsbPspInt: '0', cardRfndFee: '0', cshCardRfndFnitCd: '신한은행', cshCardRfndAcnoCrcdnoEncr: '111111111111', cshRfndAcownNm: '김온달', istmMcn: '12', cardRfndCrdcdAprno: '1111111' },
  // eslint-disable-next-line max-len
  //   { cntrNoSn: '20226008136', cstKnm: '정영순', fnlMdfcDtm: '20220830', perfDt: '20220830', cntrwTpCd: '웰스', tmp1: '센터', sellAmt: '547000', tmp2: '547000', rfndDsbAmt: '547000', rfndDsbPspInt: '0', cardRfndFee: '0', cshCardRfndFnitCd: '신한은행', cshCardRfndAcnoCrcdnoEncr: '111111111111', cshRfndAcownNm: '김온달', istmMcn: '12', cardRfndCrdcdAprno: '1111111' },
  // eslint-disable-next-line max-len
  //   { cntrNoSn: '20226008136', cstKnm: '정영순', fnlMdfcDtm: '20220830', perfDt: '20220830', cntrwTpCd: '웰스', tmp1: '센터', sellAmt: '547000', tmp2: '547000', rfndDsbAmt: '547000', rfndDsbPspInt: '0', cardRfndFee: '0', cshCardRfndFnitCd: '신한은행', cshCardRfndAcnoCrcdnoEncr: '111111111111', cshRfndAcownNm: '김온달', istmMcn: '12', cardRfndCrdcdAprno: '1111111' },
  // eslint-disable-next-line max-len
  //   { cntrNoSn: '20226008136', cstKnm: '정영순', fnlMdfcDtm: '20220830', perfDt: '20220830', cntrwTpCd: '웰스', tmp1: '센터', sellAmt: '547000', tmp2: '547000', rfndDsbAmt: '547000', rfndDsbPspInt: '0', cardRfndFee: '0', cshCardRfndFnitCd: '신한은행', cshCardRfndAcnoCrcdnoEncr: '111111111111', cshRfndAcownNm: '김온달', istmMcn: '12', cardRfndCrdcdAprno: '1111111' },
//  ]);
});
</script>
