<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID :  WmwdbRefundListMEtcAmount - 기타 선수금 환불현황 W-WD-U-0130M03
3. 작성자 : sonkiseok
4. 작성일 : 2023.04.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- PGE_WDB_00098
- 기타 선수금 환불 현황을 조회 합니다.
****************************************************************************************************
--->
<template>
  <kw-tab-panel name="3">
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
        <!-- 환불구분 -->
        <!-- 코드 확인 필요 -->
        <kw-search-item
          :label="t('MSG_TXT_CLSF_REFUND')"
        >
          <kw-option-group
            v-model="searchParams.rfndDv"
            type="radio"
            :options="customCodes.RFND_DV_CD"
          />
          <!-- :model-value="'정상'" -->
          <!-- :options="['정상', '귀속']" -->
        </kw-search-item>
      </kw-search-row>
      <!-- 불완전판매여부 -->
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_ICPT_SELL_YN')">
          <kw-select
            v-model="searchParams.icptSellYn"
            first-option="all"
            first-option-value="ALL"
            :options="customCodes.ICPT_SELL_CD"
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
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <!-- 리포트보기 -->
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
        ref="grdMainRef3"
        name="grdMain3"
        :visible-rows="pageInfo.pageSize - 1"
        @init="initGrdMain3"
      />
      <kw-action-top class="mt30">
        <template #left>
          <!-- 집계현황 -->
          <h3>{{ t('MSG_TXT_AGRG_PS') }}</h3>
        </template>
        <!-- 단위:원 -->
        <span class="kw-fc--black3 text-weight-regular ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
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
              {{ stringUtil.getNumberWithComma(aggregationStatus.cashRfndDsbAmtSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 비씨카드 -->
          <kw-form-item :label="$t('MSG_TXT_BC_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.bcCardRfndDsbAmtSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 국민카드 -->
          <kw-form-item :label="$t('MSG_TXT_KB_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.kbCardRfndDsbAmtSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 삼성카드 -->
          <kw-form-item :label="$t('MSG_TXT_SS_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.ssCardRfndDsbAmtSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 하나카드 -->
          <kw-form-item :label="$t('MSG_TXT_HN_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.hnCardRfndDsbAmtSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 신한카드 -->
          <kw-form-item :label="$t('MSG_TXT_SH_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.shCardRfndDsbAmtSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 롯데카드 -->
          <kw-form-item :label="$t('MSG_TXT_LT_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.ltCardRfndDsbAmtSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 현대카드 -->
          <kw-form-item :label="$t('MSG_TXT_HD_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.hdCardRfndDsbAmtSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- NH농협 -->
          <kw-form-item :label="$t('MSG_TXT_NH_CARD')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.nhCardRfndDsbAmtSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 여민동락 -->
          <kw-form-item :label="$t('MSG_TXT_YD')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.ydCardRfndDsbAmtSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 카드 공제 -->
          <kw-form-item
            :label="$t('MSG_TXT_CARD_DDTN')">
            <!-- :colspan="2" -->
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.cardRfndDdtnAmtSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 현금계(현금+카드공제) -->
          <kw-form-item :label="$t('MSG_TXT_CSH_CARD_DDTN')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.cashCardRfndDdtnAmtSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 카드 합계 -->
          <kw-form-item :label="$t('MSG_TXT_CARD_SUM')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.cardRfndDsbAmtSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="$t('웰스 인수 전금')">
            <p>
              0{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <kw-form-item :label="$t('웰스 할부 전금')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.welsIstmBltf) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <kw-form-item :label="$t('웰스 렌탈 전금')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.welsRentalBltf) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <kw-form-item :label="$t('웰스 멤버 전금')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.welsMmbrBltf) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 지연 이자 -->
          <kw-form-item :label="$t('MSG_TXT_PSP_INT')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.rfndDsbPspIntSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <kw-form-item :label="$t('K 머니')">
            <p>
              0{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 전금 합계 -->
          <kw-form-item :label="$t('MSG_TXT_BLTF_SUM')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.rfndBltfSum) }}{{ t('MSG_TXT_CUR_WON') }}
            </p>
          </kw-form-item>
          <!-- 환불 총계 -->
          <kw-form-item :label="$t('MSG_TXT_RFND_TOT')">
            <p>
              {{ stringUtil.getNumberWithComma(aggregationStatus.rfTotalSum) }}{{ t('MSG_TXT_CUR_WON') }}
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

import { codeUtil, defineGrid, getComponentType, stringUtil, gridUtil, useDataService, useGlobal } from 'kw-lib'; // codeUtil
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();

const { currentRoute } = useRouter();
const apiUrl = '/sms/wells/withdrawal/idvrve/etc-amount-refunds';
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10, // Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const totalParams = ref({});
let cachedParams;
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef3 = ref(getComponentType('KwGrid'));
const now = dayjs();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 페이징 옵션
  'CNTRW_TP_CD', // 업무구분
  'SELL_TP_DTL_CD', // 판매유형상세코드'
  'RFND_TP_CD',
);

const customCodes = {
  // 환불 구분
  RFND_DV_CD: [{ codeId: '1', codeName: t('MSG_TXT_NOM') }, { codeId: '2', codeName: t('MSG_TXT_BLNG') }],
  // Y , N 구분값에 따라 불완전판매여부 확인
  ICPT_SELL_CD: [{ codeId: 'Y', codeName: t('MSG_TXT_ICPT_SELL_EXCD') }, { codeId: 'N', codeName: t('MSG_TXT_ICPT_SELL_CHO') }],
  ICPT_SELL_YN: [{ codeId: 'Y', codeName: t('완전판매') }, { codeId: 'N', codeName: t('불완전판매') }],
};

// const codes = await codeUtil.getMultiCodes(
//   'COD_PAGE_SIZE_OPTIONS', // 페이징 옵션
//   'CNTRW_TP_CD', // 업무구분
// );

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
  welsIstmBltf: 0,
  welsRentalBltf: 0,
  welsMmbrBltf: 0,
  rfndDsbPspIntSum: 0,
  rfndBltfSum: 0,
  rfTotalSum: 0,
});

const searchParams = ref({
  startDay: now.format('YYYYMM01'), // 처리일자.시작일
  endDay: now.format('YYYYMMDD'), // 처리일자.종료일
  perfDtStartDay: now.format('YYYYMM01'), // 실적일자.시작일
  perfDtEndDay: now.format('YYYYMMDD'), // 실적일자.종료일
  rfndDv: '1', // 환불구분 (정상:1, 귀속:2)
  icptSellYn: 'ALL', // 불완전판매여부
});

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const response = await dataService.get(`${apiUrl}/paging`, { params: cachedParams });
  const responseSummary = await dataService.get(`${apiUrl}/summary`, { params: cachedParams });
  totalParams.value = responseSummary.data;

  const { list: refundCases, pageInfo: pagingResult } = response.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef3.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(refundCases);
  dataSource.checkRowStates(true);
}
async function fetchData2() {
  // aggregationStatus.value = []; // 집계 현황 초기화

  const response = await dataService.get(`${apiUrl}/aggregate`, { params: searchParams.value });
  if (!response.data) {
    return false;
  }
  Object.assign(aggregationStatus.value, response.data);
  // console.log('etc aggregationStatus.value', aggregationStatus.value);
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
  // aggregationStatus.value.cashCardRfndDdtnAmtSum = response.data.cashCardRfndDdtnAmtSum;
  // aggregationStatus.value.cardRfndDsbAmtSum = response.data.cardRfndDsbAmtSum;
  // /* 확인필요 : 웰스 인수 전금 */
  // /* 확인필요 : 웰스 할부 전금 */
  // /* 확인필요 : 웰스 렌탈 전금 */
  // /* 확인필요 : 웰스 멤버 전금 */
  // aggregationStatus.value.rfndDsbPspIntSum = response.data.rfndDsbPspIntSum; // 지연이자 합계
  // // 확인 필요: k머니 합계
  // /* 확인 필요: 전금합계 */
  // /* 확인 필요: 환불 총계 */
}

async function onClickSearch() {
  grdMainRef3.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  aggregationStatus.value.cashRfndDsbAmtSum = 0;
  aggregationStatus.value.bcCardRfndDsbAmtSum = 0;
  aggregationStatus.value.kbCardRfndDsbAmtSum = 0;
  aggregationStatus.value.ssCardRfndDsbAmtSum = 0;
  aggregationStatus.value.hnCardRfndDsbAmtSum = 0;
  aggregationStatus.value.shCardRfndDsbAmtSum = 0;
  aggregationStatus.value.ltCardRfndDsbAmtSum = 0;
  aggregationStatus.value.hdCardRfndDsbAmtSum = 0;
  aggregationStatus.value.nhCardRfndDsbAmtSum = 0;
  aggregationStatus.value.ydCardRfndDsbAmtSum = 0;
  aggregationStatus.value.cardRfndDdtnAmtSum = 0;
  aggregationStatus.value.cashCardRfndDdtnAmtSum = 0;
  aggregationStatus.value.cardRfndDsbAmtSum = 0;
  aggregationStatus.value.welsIstmBltf = 0;
  aggregationStatus.value.welsRentalBltf = 0;
  aggregationStatus.value.welsMmbrBltf = 0;
  aggregationStatus.value.rfndDsbPspIntSum = 0;
  aggregationStatus.value.rfndBltfSum = 0;
  aggregationStatus.value.rfTotalSum = 0;

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
  const view = grdMainRef3.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain3 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'cstEnm' }, // 고객명-영문
    { fieldName: 'rfndRveDt', dataType: 'date' }, // 처리일자
    { fieldName: 'rfndPerfDt', dataType: 'date' }, // 실적일자
    { fieldName: 'bizDv' }, // 업무구분
    { fieldName: 'dpDv' }, // 입금종류 , 20230723_조건부명시모호
    { fieldName: 'rfndDv' }, // 환불구분
    { fieldName: 'icptSellDv' }, // 불완전판매구분
    { fieldName: 'sellAmt', dataType: 'number' }, // 판매금액
    { fieldName: 'dsbAmt', dataType: 'number' }, // 지급금액
    { fieldName: 'rfndDsbAmt', dataType: 'number' }, // 환불금액
    { fieldName: 'rfndDsbPspInt', dataType: 'number' }, // 지연이자
    { fieldName: 'cardRfndFee', dataType: 'number' }, // 카드수수료
    { fieldName: 'cshCardRfndFnitCd' }, // 은행/카드사
    { fieldName: 'cardRfndCrcdnoEncr' }, /* 카드번호 */
    { fieldName: 'cshRfndAcnoEncr' }, /* 계좌번호 */
    { fieldName: 'cshCardRfndAcnoCrcdnoEncr' }, // 계좌/카드번호
    { fieldName: 'cshRfndAcownNm' }, // 예금주
    { fieldName: 'istmMcn' }, // 확인필요.할부개월
    { fieldName: 'cardRfndCrdcdAprno' }, // 승인번호
  ];

  const columns = [
    { fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '130',
      styleName: 'text-left',
      headerSummary: [{
        styleName: 'text-center',
        text: t('MSG_TXT_SUM'),
      }],
    }, // 계약상세번호
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'),
      width: '80',
      styleName: 'text-left',
      headerSummary: [{
        numberFormat: '#,##0',
        valueCallback() {
          return `${Number(totalParams.value.cntCstKnm)}건`;
        },
      }],
    }, // 고객명
    { fieldName: 'rfndRveDt', header: t('MSG_TXT_PRCSDT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 처리일자
    { fieldName: 'rfndPerfDt', header: t('MSG_TXT_PERF_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 실적일자
    { fieldName: 'bizDv', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' }, // 업무구분
    { fieldName: 'dpDv', header: t('MSG_TXT_DP_KND'), width: '100', styleName: 'text-left', options: codes.RFND_TP_CD }, // 입금종류 확인필요
    { fieldName: 'rfndDv', header: t('MSG_TXT_CLSF_REFUND'), width: '100', styleName: 'text-center', options: customCodes.RFND_DV_CD }, // 환불구분
    { fieldName: 'icptSellDv', header: t('MSG_TXT_ICPT_SELL_DV'), width: '120', styleName: 'text-left', options: customCodes.ICPT_SELL_YN }, // 불완전판매구분
    { fieldName: 'sellAmt',
      header: t('MSG_TXT_SALE_PRICE'),
      width: '100',
      styleName: 'text-right',
      headerSummary: [{
        numberFormat: '#,##0',
        valueCallback() {
          return Number(totalParams.value.totSellAmt);
        },
      }],
    }, // 판매금액
    { fieldName: 'dsbAmt',
      header: t('MSG_TXT_DSB_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: [{
        numberFormat: '#,##0',
        valueCallback() {
          return Number(totalParams.value.totDsbAmt);
        },
      }],
    }, // 지급금액
    {
      fieldName: 'rfndDsbAmt',
      header: t('MSG_TXT_RFND_AMT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: [{
        numberFormat: '#,##0',
        valueCallback() {
          return Number(totalParams.value.totRfndDsbAmt);
        },
      }] }, // 환불금액
    {
      fieldName: 'rfndDsbPspInt',
      header: t('MSG_TXT_PSP_INT'),
      width: '100',
      styleName: 'text-right',
      headerSummary: [{
        numberFormat: '#,##0',
        valueCallback() {
          return Number(totalParams.value.totRfndDsbPspInt);
        },
      }],
    }, // 지연이자
    { fieldName: 'cardRfndFee',
      header: t('MSG_TXT_CARD_FEE'),
      width: '100',
      styleName: 'text-right',
      headerSummary: [{
        numberFormat: '#,##0',
        valueCallback() {
          return Number(totalParams.value.totCardRfndFee);
        },
      }],
    }, // 카드수수료
    { fieldName: 'cshCardRfndFnitCd', header: t('MSG_TXT_BNK_CDCO'), width: '104', styleName: 'text-left' }, // 은행/카드사
    { fieldName: 'cshCardRfndAcnoCrcdnoEncr', header: t('MSG_TXT_AC_CDNO'), width: '180', styleName: 'text-left' }, // 계좌/카드번호
    { fieldName: 'cshRfndAcownNm', header: t('MSG_TXT_ACHLDR'), width: '100', styleName: 'text-center' }, // 예금주
    { fieldName: 'istmMcn', header: t('MSG_TXT_ISTM_MCNT'), width: '100', styleName: 'text-center' }, // 할부개월
    { fieldName: 'cardRfndCrdcdAprno', header: t('MSG_TXT_APR_NO'), width: '104', styleName: 'text-center' }, // 승인번호
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setHeaderSummaries({
    visible: true,
    items: [{ height: 40 }],
  });

  view.layoutByColumn('cntrDtlNo').summaryUserSpans = [{ colspan: 2 }];

  view.setColumnLayout([
    'cntrDtlNo',
    'cstKnm',
    'rfndRveDt',
    'rfndPerfDt',
    'bizDv',
    'dpDv',
    'rfndDv',
    'icptSellDv',
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
  //   { cntrNoSn: '2022-6008136', cstKnm: '정영순', fnlMdfcDtm: '20220830', perfDt: '20220830', cntrwTpCd: '웰스', tmp1: '할부', tmp3: '정상', baseCntrNo: '완전판매', sellAmt: '145000', tmp2: '145000', rfndDsbAmt: '145,000', rfndDsbPspInt: '0', cardRfndFee: '0', cshCardRfndFnitCd: '신한카드', cshCardRfndAcnoCrcdnoEncr: '111111111111', cshRfndAcownNm: '김온달', istmMcn: '12', cardRfndCrdcdAprno: '1111111' },
  // ]);
});
</script>
