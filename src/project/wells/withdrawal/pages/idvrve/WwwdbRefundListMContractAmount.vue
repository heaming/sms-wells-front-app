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
        >
          <!-- required -->
          <kw-date-range-picker
            v-model:from="searchParams.perfDtStartDay"
            v-model:to="searchParams.perfDtEndDay"
            :label="t('MSG_TXT_PERF_DT')"
          />
          <!-- rules="date_range_required|date_range_months:1" -->
        </kw-search-item>
        <!-- 업무구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_TASK_DIV')"
        >
          <!-- wells 계약서유형코드 1.일시불(환경가전), 2.일시불(BH), 3.렌탈, 4.멤버십, 5.홈케어서비, 6.모종일시불, 7.정기배송, 8.장기할부, 9.리스 -->
          <kw-select
            v-model="searchParams.cntrwTpCd"
            :options="optionsSort"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <!-- 출력구분 -->
      <!--
      <kw-search-row>
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
    -->
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
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.blngAmt)) }}{{ t('MSG_TXT_CUR_WON') }}
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
              {{ t('MSG_TXT_WELS') }}: {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.tkMrntBltfSum)) }},
              {{ t('MSG_TXT_HOME_CARE') }}: {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.tkHcrBltfSum))
              }}
            </p>
          </kw-form-item>
          <!-- 인수전금 계 -->
          <kw-form-item :label="$t('MSG_TXT_TK_BLTF_SUM')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.tkBltfResultSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 할부전금(웰스) -->
          <kw-form-item :label="$t('MSG_TXT_ISTM_BLTF_WELS')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.istmBltfSum)) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 할부전금 계 -->
          <kw-form-item :label="$t('MSG_TXT_ISTM_BLTF_SUM')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.istmBltfResultSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 지연 이자 -->
          <kw-form-item :label="$t('MSG_TXT_PSP_INT')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.rfndDsbPspIntSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- K 포인트 -->
          <kw-form-item :label="$t('MSG_TXT_K_PNT')">
            <p>
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.pointSum)) }}
              {{ t('MSG_TXT_CUR_WON') }}
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
              {{ stringUtil.getNumberWithComma(toInteger(aggregationStatus.rfTotalSum)) }}{{ t('MSG_TXT_CUR_WON') }}
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

const optionsSort = [
  { codeId: '1', codeName: t('MSG_TXT_WELS') }, // 웰스
  { codeId: '2', codeName: t('MSG_TXT_HOME_CARE') }, // 홈케어
];

const aggregationStatus = ref({
  // cashRfndDsbAmtSum: 0,
  // bcCardRfndDsbAmtSum: 0,
  // kbCardRfndDsbAmtSum: 0,
  // ssCardRfndDsbAmtSum: 0,
  // hnCardRfndDsbAmtSum: 0,
  // shCardRfndDsbAmtSum: 0,
  // ltCardRfndDsbAmtSum: 0,
  // hdCardRfndDsbAmtSum: 0,
  // nhCardRfndDsbAmtSum: 0,
  // ydCardRfndDsbAmtSum: 0,
  // cardRfndDdtnAmtSum: 0,
  // cashCardRfndDdtnAmtSum: 0,
  // cardRfndDsbAmtSum: 0,
  // rfndDsbPspIntSum: 0,
  // rfndBltfSum: 0,
  // rfTotalSum: 0,

  cashRfndDsbAmtSum: 0, // 현금 환불지급금액 합
  bcCardRfndDsbAmtSum: 0, // BC 환불지급금액 합계
  kbCardRfndDsbAmtSum: 0, // KB 환불지급금액 합계
  ssCardRfndDsbAmtSum: 0, // 삼성 환불지급금액 합계
  hnCardRfndDsbAmtSum: 0, // 하나 환불지급금액 합계
  shCardRfndDsbAmtSum: 0, // 신한 환불지급금액 합계
  ltCardRfndDsbAmtSum: 0, // 롯데 환불지급금액 합계
  hdCardRfndDsbAmtSum: 0, // 현대 환불지급금액 합계
  nhCardRfndDsbAmtSum: 0, // 농협 환불지급금액 합계
  ydCardRfndDsbAmtSum: 0, // 여민동락 환불지급금액 합계
  cardRfndDdtnAmtSum: 0, // 카드 공제(환불공제금액 합계)
  blngAmt: 0, /* 확인 필요: 회사귀속 */
  cashCardRfndDdtnAmtSum: 0, // 현금계(현금 환불공제금액 합계 + 카드 공제(환불공제금액 합계))
  cardRfndDsbAmtSum: 0, // 카드 (환불지급금액) 합계
  tkMrntBltfSum: 0, /* 확인 필요: 인수 전금 웰스: 홈케어: */
  tkHcrBltfSum: 0,
  tkBltfResultSum: 0, /* 확인 필요: 인수 전금 계 */
  istmBltfSum: 0, /* 확인 필요: 할부전금(웰스)  */
  istmBltfResultSum: 0, /* 확인 필요: 할부전금계 = 인수전금 합계 + 할부전금 합계  */
  rfndDsbPspIntSum: 0, // 지연이자 합계
  pointSum: 0, /* 확인 필요:K 포인트 */
  rfndBltfSum: 0, /* 확인 필요:전금합계 */
  rfTotalSum: 0, /* 확인 필요:환불 총계 */
});

const searchParams = ref({
  startDay: now.format('YYYYMM01'), // 처리일자.시작일
  endDay: now.format('YYYYMMDD'), // 처리일자.종료일
  perfDtStartDay: '', // 실적일자.시작일
  perfDtEndDay: '', // 실적일자.종료일
  cntrwTpCd: '', // 업무구분
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

// 조회 버튼
async function onClickSearch() {
  grdMainRef2.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
  await fetchData2();
}

// 리포트 보기 버튼
async function onClickReportView() {
  // TODO: OZ REPORT 개발중..
  await notify(t('MSG_ALT_DEVELOPING'));
  // await openReportPopup('/eformsample.ozr', '/eformsample.odi', JSON.stringify({ param1: 'test1', param2: 'test2'}));
}

// 엑셀 다운로드 버튼
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
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
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
      header: t('MSG_TXT_CNTR_DTL_NO'), // 계약상세번호
      width: '130',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      },
    },
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'), // 고객명
      width: '80',
      styleName: 'text-center',
      headerSummary: {
        styleName: 'text-right',
        numberFormat: '#,###',
        valueCallback() {
          return `총 ${Number(summaryParams.cntCstKnm)}건`;
        },
      },
    },
    { fieldName: 'rfndRveDt', header: t('MSG_TXT_PRCSDT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 처리일자
    { fieldName: 'rfndPerfDt', header: t('MSG_TXT_PERF_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 실적일자
    { fieldName: 'cntrwTpCd', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center', options: codes.CNTRW_TP_CD }, // 업무구분
    { fieldName: 'tmp1', header: t('MSG_TXT_PRNT_DV'), width: '100', styleName: 'text-center', options: codes.CNTRW_TP_CD }, // 확인필요.출력구분
    { fieldName: 'sellAmt',
      header: t('MSG_TXT_SALE_PRICE'), // 판매금액
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        styleName: 'text-right',
        numberFormat: '#,###',
        valueCallback() {
          return Number(summaryParams.totSellAmt);
        },
      },
    },
    { fieldName: 'dsbAmt',
      header: t('MSG_TXT_DSB_AMT'), // 지급금액
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        styleName: 'text-right',
        numberFormat: '#,###',
        valueCallback() {
          return Number(summaryParams.totDsbAmt);
        },
      },
    },
    { fieldName: 'rfndDsbAmt',
      header: t('MSG_TXT_RFND_AMT'), // 환불금액
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        styleName: 'text-right',
        numberFormat: '#,###',
        valueCallback() {
          return Number(summaryParams.totRfndDsbAmt);
        },
      } },
    { fieldName: 'rfndDsbPspInt',
      header: t('MSG_TXT_PSP_INT'), // 지연이자
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        styleName: 'text-right',
        numberFormat: '#,###',
        valueCallback() {
          return Number(summaryParams.totRfndDsbPspInt);
        },
      },
    },
    { fieldName: 'cardRfndFee',
      header: t('MSG_TXT_CARD_FEE'), // 카드수수료
      width: '100',
      styleName: 'text-right',
      headerSummary: {
        styleName: 'text-right',
        numberFormat: '#,###',
        valueCallback() {
          return Number(summaryParams.totCardRfndFee);
        },
      },
    },
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
});
</script>
