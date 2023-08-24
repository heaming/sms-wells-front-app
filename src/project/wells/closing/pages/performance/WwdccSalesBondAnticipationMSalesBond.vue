<!----adamt
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccSalesBondAnticipationMSalesBond - 매출채권/선수금 현황 - 매출채권 // W-CL-U-0058M06
3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.03.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매출채권/선수금 현황 - 매출채권 프로그램
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="3"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_BASE_YM')">
        <kw-date-picker
          v-model="searchParams.slClYm"
          type="month"
          rules="date_range_months:1"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_AGRG_DV')"
        :colspan="2"
      >
        <kw-option-group
          v-model="searchParams.agrgDv"
          type="radio"
          :options="aggregateDivide"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
        <kw-select
          v-model="searchParams.sellTpCd"
          :options="filteredCodes.SELL_TP_CD"
        />
        <kw-select
          v-model="searchParams.sellTpDtlCd"
          :options="dynamicChangeCodes.SELL_TP_DTL_CD"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SEL_CHNL')">
        <kw-select
          v-model="searchParams.sellChnlDtl"
          :options="codes.SELL_CHNL_DTL_CD"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
          :name="$t('MSG_TXT_CNTR_DTL_NO')"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_SAP_PD_DV_CD_NM')">
        <kw-select
          v-model="searchParams.sapPdDvCd"
          :options="sapPdDv"
          first-option="all"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalCount" />
        <span
          class="ml8"
        >
          {{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        icon="report"
        :label="$t('MSG_TXT_RPT_BRWS')"
        dense
        secondary
        @click="onClickOpenReport"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        icon="download_on"
        :disable="totalCount === 0"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdSalesBondRef"
      :total-count="totalCount"
      name="grdSalesBond"
      @init="initSalesBondGrid"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, gridUtil, useDataService, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import { getAggregateDivide, textToNumberFormatter, getSellTpCd, getSellTpDtlCd } from '~/modules/sms-common/closing/utils/clUtil';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const searchParams = ref({
  slClYm: dayjs().format('YYYYMM'),
  agrgDv: '1', // 집계구분
  sellTpCd: '1', // 업무구분 (판매유형)
  sellTpDtlCd: '', // 판매유형상세
  sellChnlDtl: '', // 판매채널
  cntrNo: '',
  cntrSn: '',
  sapPdDvCd: '', // SAP상품구분코드
});

const grdSalesBondRef = ref(getComponentType('KwGrid'));

const sapPdDv = (await dataService.get('/sms/wells/closing/performance/overdue-penalty/code'))
  .data.map((v) => ({ codeId: v.sapPdDvCd, codeName: v.sapPdDvNm }));
const aggregateDivide = await getAggregateDivide();
const totalCount = ref(0);
const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD', // 판매유형
  'SELL_TP_DTL_CD', // 판매유형
  'SELL_CHNL_DTL_CD', // 판매채널
);
const customCodes = ref({ SELL_TP_CD: await getSellTpCd(), SELL_TP_DTL_CD: await getSellTpDtlCd() });
const filteredCodes = ref({ SELL_TP_CD: customCodes.value.SELL_TP_CD.filter((obj) => ['1', '2', '3', '6', '10'].includes(obj.codeId)) });
const dynamicChangeCodes = ref({ SELL_TP_DTL_CD: customCodes.value.SELL_TP_DTL_CD.filter(
  (obj) => (obj.userDfn02 === searchParams.value.sellTpCd),
) });

async function setGridColumnLayoutType1(data, view) { // 일시불
  console.log('setGridColumnLayoutType1');
  if (!view) {
    view = grdSalesBondRef.value.getView();
  }
  if (!data) {
    data = view.getDataSource();
  }
  view.setColumnLayout();
  const columns = [
    { fieldName: 'slClYm', header: t('MSG_TXT_PERF_YM'), width: '150', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 실적년월
    { fieldName: 'slClDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-center', dataType: 'date' }, // 실적일자
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-center', options: codes.SELL_TP_CD }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '150', styleName: 'text-center', options: codes.SELL_TP_DTL_CD }, // 판매유형상세
    { fieldName: 'sapPdAtcNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '130', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-center' }, // 상품명
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '150', styleName: 'text-center', dataType: 'date' }, // 매출일자
    { fieldName: 'preTotUcAmt', header: t('MSG_TXT_FTRM_CRDOVR'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 전기이월

    { fieldName: 'nomSlAmt', header: t('MSG_TXT_NOM_SL'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 매출 - 정상매출
    { fieldName: 'canSlAmt', header: t('MSG_TXT_CAN_SL'), width: '150', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0' }, //  매출 - 취소매출
    { fieldName: 'feeSlAmt', header: t('MSG_TXT_FEE_SL'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, //  매출 - 수수료매출
    { fieldName: 'boutNorSlAmt', header: t('MSG_TXT_GCF_NOM'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, //  매출 - 상품권정상
    { fieldName: 'boutCanSlAmt', header: t('MSG_TXT_GCF_CAN'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, //  매출 - 상품권취소
    { fieldName: 'totSlAmt', header: t('MSG_TXT_SUM'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, //  매출 - 합계

    { fieldName: 'cntrDpAmt', header: t('MSG_TXT_CNTRAM'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 매출대사 - 계약금
    { fieldName: 'instDpAmt', header: t('MSG_TXT_INTAM'), width: '180', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0' }, //  매출대사 - 할부금
    { fieldName: 'totDpAmt', header: t('MSG_TXT_SUM'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, //  매출대사 - 합계

    { fieldName: 'dfaProcsAmt', header: `${t('MSG_TXT_DFA')}(-)`, width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 대손
    { fieldName: 'eotUcAmt', header: t('MSG_TXT_EOT_UC'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 기말미수
    { fieldName: 'crpUcAmt', header: t('MSG_TXT_CRP_UC'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 법인미수
    { fieldName: 'boutDpAmt', header: t('MSG_TXT_GCF'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 상품권
    { fieldName: 'etcDpAmt', header: t('MSG_TXT_ETC_PRPD_RPLC'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, //  기타선수대체
    { fieldName: 'interContNomSlAmt', header: t('MSG_TXT_IND_TRD_NOM'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 사건거래정상
    { fieldName: 'interContCanSlAmt', header: t('MSG_TXT_IND_TRD_CAN'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 사건거래취소
    { fieldName: 'interContDpAmt', header: t('MSG_TXT_IND_TRD_DP'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 사건거래입금
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  const layoutMain = [
    'slClYm',
    'slClDt',
    'sellTpCd',
    'sellTpDtlCd',
    'sapPdAtcNm',
    'cntrNo',
    'cstKnm',
    'basePdCd',
    'pdNm',
    'slRcogDt',
    'preTotUcAmt',
    {
      header: `${t('MSG_TXT_SL')}(+)`, /* 매출(+) */
      direction: 'horizontal',
      items: ['nomSlAmt', 'canSlAmt', 'feeSlAmt', 'boutNorSlAmt', 'boutCanSlAmt', 'totSlAmt'],
    },
    {
      header: `${t('MSG_TXT_SL_CPRCNF')}(-)`, /* 매출대사(-) */
      direction: 'horizontal',
      items: ['cntrDpAmt', 'instDpAmt', 'totDpAmt'],
    },
    'dfaProcsAmt',
    'eotUcAmt',
    'crpUcAmt',
    'boutDpAmt',
    'etcDpAmt',
    'interContNomSlAmt',
    'interContCanSlAmt',
    'interContDpAmt',
  ];
  if (searchParams.value.agrgDv === '1') {
    layoutMain.splice(1, 9);
  }
  console.log(`layoutMain: ${layoutMain}`);
  view.setColumnLayout(layoutMain);

  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: (searchParams.value.agrgDv === '1') ? 1 : 10 }];
  console.log(`summaryUserSpans: ${(searchParams.value.agrgDv === '1')}`);
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
}
async function setGridColumnLayoutType2(data, view) { // 렌탈
  if (!view) {
    view = grdSalesBondRef.value.getView();
  }
  if (!data) {
    data = view.getDataSource();
  }
  view.setColumnLayout();
  const columns = [
    { fieldName: 'slClYm', header: t('MSG_TXT_PERF_YM'), width: '150', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 실적년월
    { fieldName: 'slClDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-center', dataType: 'date' }, // 실적일자
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-center', options: codes.SELL_TP_CD }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '130', styleName: 'text-center', options: codes.SELL_TP_DTL_CD }, // 판매유형상세
    { fieldName: 'sapPdAtcNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '130', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-center' }, // 상품명
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '150', styleName: 'text-center', dataType: 'date' }, // 매출일자
    { fieldName: 'preTotUcAmt', header: t('MSG_TXT_FTRM_CRDOVR'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 전기이월
    { fieldName: 'nomSlAmt', header: t('MSG_TXT_NOM_SL'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 매출 - 정상매출
    { fieldName: 'canSlAmt', header: t('MSG_TXT_CAN_SL'), width: '130', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0' }, //  매출 - 취소매출
    { fieldName: 'totSlAmt', header: t('MSG_TXT_SUM'), width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, //  매출 - 합계
    { fieldName: 'totDpAmt', header: `${t('MSG_TXT_SL_CPRCNF')}(-)`, width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 매출대사(-)
    { fieldName: 'borRemAmt', header: `${t('MSG_TXT_BOR_RES')}(+)`, width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 위약잔여(+)
    { fieldName: 'borAdjAmt', header: `${t('MSG_TXT_BOR_CTR')}(-)`, width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 위약조정(-)
    { fieldName: 'dpCngAmt', header: `${t('MSG_TXT_PRPD_CV')}(+)`, width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 선수전환(+)
    { fieldName: 'dfaProcsAmt', header: `${t('MSG_TXT_DFA')}(-)`, width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, //  대손(-)
    { fieldName: 'totUcAmt', header: t('MSG_TXT_UC_AMT'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 미수금액
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  const layoutMain = [
    'slClYm',
    'slClDt',
    'sellTpCd',
    'sellTpDtlCd',
    'sapPdAtcNm',
    'cntrNo',
    'cstKnm',
    'basePdCd',
    'pdNm',
    'slRcogDt',
    'preTotUcAmt',
    {
      header: `${t('MSG_TXT_SL')}(+)`, /* 매출(+) */
      direction: 'horizontal',
      items: ['nomSlAmt', 'canSlAmt', 'totSlAmt'],
    },
    'totDpAmt',
    'borRemAmt',
    'borAdjAmt',
    'dpCngAmt',
    'dfaProcsAmt',
    'totUcAmt',
  ];
  if (searchParams.value.agrgDv === '1') {
    layoutMain.splice(1, 9);
  }
  view.setColumnLayout(layoutMain);

  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: (searchParams.value.agrgDv === '1') ? 1 : 10 }];
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
}
async function setGridColumnLayoutType3(data, view) { // 멤버십
  if (!view) {
    view = grdSalesBondRef.value.getView();
  }
  if (!data) {
    data = view.getDataSource();
  }
  view.setColumnLayout();
  const columns = [
    { fieldName: 'slClYm', header: t('MSG_TXT_PERF_YM'), width: '150', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 실적년월
    { fieldName: 'slClDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-center', dataType: 'date' }, // 실적일자
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-center', options: codes.SELL_TP_CD }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '130', styleName: 'text-center', options: codes.SELL_TP_DTL_CD }, // 판매유형상세
    { fieldName: 'sapPdAtcNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '130', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-center' }, // 상품명
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '150', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0' }, // 매출일자
    { fieldName: 'preTotUcAmt', header: t('MSG_TXT_FTRM_CRDOVR'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 전기이월
    { fieldName: 'nomSlAmt', header: t('MSG_TXT_NOM_SL'), width: '150', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0' }, // 정상매출
    { fieldName: 'canSlAmt', header: t('MSG_TXT_CAN_SL'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 취소매출
    { fieldName: 'totSlAmt', header: t('MSG_TXT_SUM'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 합계
    { fieldName: 'totDpAmt', header: `${t('MSG_TXT_SL_CPRCNF')}(-)`, width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 매출대사
    { fieldName: 'dfaProcsAmt', header: `${t('MSG_TXT_DFA')}(-)`, width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 대손
    { fieldName: 'totUcAmt', header: t('MSG_TXT_UC_AMT'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 미수금액
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  const layoutMain = [
    'slClYm', 'slClDt', 'sellTpCd', 'sellTpDtlCd', 'sapPdAtcNm', 'cntrNo', 'cstKnm', 'basePdCd', 'pdNm', 'slRcogDt', 'preTotUcAmt',
    {
      header: `${t('MSG_TXT_SL')}(+)`, /* 매출(+) */
      direction: 'horizontal',
      items: ['nomSlAmt', 'canSlAmt', 'totSlAmt'],
    },
    'totDpAmt', 'dfaProcsAmt', 'totUcAmt',
  ];
  if (searchParams.value.agrgDv === '1') {
    layoutMain.splice(1, 9);
  }
  view.setColumnLayout(layoutMain);
  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: (searchParams.value.agrgDv === '1') ? 1 : 10 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
}
async function setGridColumnLayoutType4(data, view) { // 정기배송
  if (!view) {
    view = grdSalesBondRef.value.getView();
  }
  if (!data) {
    data = view.getDataSource();
  }
  view.setColumnLayout();
  const columns = [
    { fieldName: 'slClYm', header: t('MSG_TXT_PERF_YM'), width: '150', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 실적년월
    { fieldName: 'slClDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-center', dataType: 'date' }, // 실적일자
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-center', options: codes.SELL_TP_CD }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '130', styleName: 'text-center', options: codes.SELL_TP_DTL_CD }, // 판매유형상세
    { fieldName: 'sapPdAtcNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '130', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-center' }, // 상품명
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '150', styleName: 'text-center', dataType: 'date' }, // 매출일자
    { fieldName: 'preTotUcAmt', header: t('MSG_TXT_FTRM_CRDOVR'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 전기이월
    { fieldName: 'totSlAmt', header: `${t('MSG_TXT_SL')}(+)`, width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 매출
    { fieldName: 'totDpAmt', header: `${t('MSG_TXT_SL_CPRCNF')}(-)`, width: '130', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 매출대사
    { fieldName: 'dfaProcsAmt', header: `${t('MSG_TXT_DFA')}(-)`, width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 대손
    { fieldName: 'totUcAmt', header: t('MSG_TXT_UC_AMT'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 미수금액
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: (searchParams.value.agrgDv === '1') ? 1 : 10 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
}
async function setGridColumnLayoutType5(data, view) { // 리스/할부
  if (!view) {
    view = grdSalesBondRef.value.getView();
  }
  if (!data) {
    data = view.getDataSource();
  }
  view.setColumnLayout();
  const columns = [
    { fieldName: 'slClYm', header: t('MSG_TXT_PERF_YM'), width: '150', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 실적년월
    { fieldName: 'slClDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-center', dataType: 'date' }, // 실적일자
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-center', options: codes.SELL_TP_CD }, // 판매유형
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '130', styleName: 'text-center', options: codes.SELL_TP_DTL_CD }, // 판매유형상세
    { fieldName: 'sapPdAtcNm', header: t('MSG_TXT_SAP_PD_DV_CD_NM'), width: '130', styleName: 'text-center' }, // SAP상품구분코드명
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '130', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '130', styleName: 'text-center' }, // 상품명
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '150', styleName: 'text-center', dataType: 'date' }, // 매출일자
    { fieldName: 'preTotUcAmt', header: t('MSG_TXT_FTRM_CRDOVR'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 전기이월
    { fieldName: 'oriSlAmt', header: t('MSG_TXT_PCAM_SL'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 원금매출
    { fieldName: 'itrSlAmt', header: t('MSG_TXT_INT_SL'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 이자매출
    { fieldName: 'svcSlAmt', header: t('MSG_TXT_SV_SL'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 서비스매출
    { fieldName: 'totSlAmt', header: t('MSG_TXT_SUM'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 합계
    { fieldName: 'slAdjAmt', header: t('MSG_TXT_SL_CTR'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 매출조정
    { fieldName: 'totDpAmt', header: t('MSG_TXT_SL_CPRCNF'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 매출대사
    { fieldName: 'dfaProcsAmt', header: t('MSG_TXT_DFA'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 대손
    { fieldName: 'totUcAmt', header: t('MSG_TXT_UC_AMT'), width: '150', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 미수금액
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  const layoutMain = [
    'slClYm', 'slClDt', 'sellTpCd', 'sellTpDtlCd', 'sapPdAtcNm', 'cntrNo', 'cstKnm', 'basePdCd', 'pdNm', 'slRcogDt', 'preTotUcAmt',
    {
      header: `${t('MSG_TXT_SL')}(+)`, /* 매출(+) */
      direction: 'horizontal',
      items: ['oriSlAmt', 'itrSlAmt', 'svcSlAmt', 'totSlAmt'],
    },
    'slAdjAmt',
    'totDpAmt',
    'dfaProcsAmt',
    'totUcAmt',
  ];
  if (searchParams.value.agrgDv === '1') {
    layoutMain.splice(1, 9);
  }
  view.setColumnLayout(layoutMain);

  view.layoutByColumn('slClYm').summaryUserSpans = [{ colspan: (searchParams.value.agrgDv === '1') ? 1 : 10 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
}

async function setGridHeader() {
  if (searchParams.value.sellTpCd === '1') { // 일시불
    await setGridColumnLayoutType1();
  } else if (searchParams.value.sellTpCd === '2') { // 렌탈
    await setGridColumnLayoutType2();
  } else if (searchParams.value.sellTpCd === '3') { // 멤버십
    await setGridColumnLayoutType3();
  } else if (searchParams.value.sellTpCd === '6') { // 정기배송
    await setGridColumnLayoutType4();
  } else if (searchParams.value.sellTpCd === '99') { // 리스/할부
    await setGridColumnLayoutType5();
  }
}
async function setHeaderSummary1(view, salesBond) {
  view.columnByName('preTotUcAmt').headerSummary.text = textToNumberFormatter(salesBond.preTotUcAmt);
  view.columnByName('nomSlAmt').headerSummary.text = textToNumberFormatter(salesBond.nomSlAmt);
  view.columnByName('canSlAmt').headerSummary.text = textToNumberFormatter(salesBond.canSlAmt);
  view.columnByName('feeSlAmt').headerSummary.text = textToNumberFormatter(salesBond.feeSlAmt);
  view.columnByName('boutNorSlAmt').headerSummary.text = textToNumberFormatter(salesBond.boutNorSlAmt);
  view.columnByName('boutCanSlAmt').headerSummary.text = textToNumberFormatter(salesBond.boutCanSlAmt);
  view.columnByName('cntrDpAmt').headerSummary.text = textToNumberFormatter(salesBond.cntrDpAmt);
  view.columnByName('instDpAmt').headerSummary.text = textToNumberFormatter(salesBond.instDpAmt);
  view.columnByName('totDpAmt').headerSummary.text = textToNumberFormatter(salesBond.totDpAmt);
  view.columnByName('dfaProcsAmt').headerSummary.text = textToNumberFormatter(salesBond.dfaProcsAmt);
  view.columnByName('eotUcAmt').headerSummary.text = textToNumberFormatter(salesBond.eotUcAmt);
  view.columnByName('crpUcAmt').headerSummary.text = textToNumberFormatter(salesBond.crpUcAmt);
  view.columnByName('boutDpAmt').headerSummary.text = textToNumberFormatter(salesBond.boutDpAmt);
  view.columnByName('etcDpAmt').headerSummary.text = textToNumberFormatter(salesBond.etcDpAmt);
  view.columnByName('interContNomSlAmt').headerSummary.text = textToNumberFormatter(salesBond.interContNomSlAmt);
  view.columnByName('interContCanSlAmt').headerSummary.text = textToNumberFormatter(salesBond.interContCanSlAmt);
  view.columnByName('interContDpAmt').headerSummary.text = textToNumberFormatter(salesBond.interContDpAmt);
}
async function setHeaderSummary2(view, salesBond) {
  view.columnByName('preTotUcAmt').headerSummary.text = textToNumberFormatter(salesBond.preTotUcAmt);
  view.columnByName('nomSlAmt').headerSummary.text = textToNumberFormatter(salesBond.nomSlAmt);
  view.columnByName('canSlAmt').headerSummary.text = textToNumberFormatter(salesBond.canSlAmt);
  view.columnByName('totSlAmt').headerSummary.text = textToNumberFormatter(salesBond.totSlAmt);
  view.columnByName('totDpAmt').headerSummary.text = textToNumberFormatter(salesBond.totDpAmt);
  view.columnByName('borRemAmt').headerSummary.text = textToNumberFormatter(salesBond.borRemAmt);
  view.columnByName('borAdjAmt').headerSummary.text = textToNumberFormatter(salesBond.borAdjAmt);
  view.columnByName('dpCngAmt').headerSummary.text = textToNumberFormatter(salesBond.dpCngAmt);
  view.columnByName('dfaProcsAmt').headerSummary.text = textToNumberFormatter(salesBond.dfaProcsAmt);
  view.columnByName('totUcAmt').headerSummary.text = textToNumberFormatter(salesBond.totUcAmt);
}
async function setHeaderSummary3(view, salesBond) {
  view.columnByName('preTotUcAmt').headerSummary.text = textToNumberFormatter(salesBond.preTotUcAmt);
  view.columnByName('nomSlAmt').headerSummary.text = textToNumberFormatter(salesBond.nomSlAmt);
  view.columnByName('canSlAmt').headerSummary.text = textToNumberFormatter(salesBond.canSlAmt);
  view.columnByName('totSlAmt').headerSummary.text = textToNumberFormatter(salesBond.totSlAmt);
  view.columnByName('totDpAmt').headerSummary.text = textToNumberFormatter(salesBond.totDpAmt);
  view.columnByName('dfaProcsAmt').headerSummary.text = textToNumberFormatter(salesBond.dfaProcsAmt);
  view.columnByName('totUcAmt').headerSummary.text = textToNumberFormatter(salesBond.totUcAmt);
}
async function setHeaderSummary4(view, salesBond) {
  view.columnByName('preTotUcAmt').headerSummary.text = textToNumberFormatter(salesBond.preTotUcAmt);
  view.columnByName('totSlAmt').headerSummary.text = textToNumberFormatter(salesBond.totSlAmt);
  view.columnByName('totDpAmt').headerSummary.text = textToNumberFormatter(salesBond.totDpAmt);
  view.columnByName('dfaProcsAmt').headerSummary.text = textToNumberFormatter(salesBond.dfaProcsAmt);
  view.columnByName('totUcAmt').headerSummary.text = textToNumberFormatter(salesBond.totUcAmt);
}
async function setHeaderSummary5(view, salesBond) {
  view.columnByName('preTotUcAmt').headerSummary.text = textToNumberFormatter(salesBond.preTotUcAmt);
  view.columnByName('oriSlAmt').headerSummary.text = textToNumberFormatter(salesBond.oriSlAmt);
  view.columnByName('itrSlAmt').headerSummary.text = textToNumberFormatter(salesBond.itrSlAmt);
  view.columnByName('svcSlAmt').headerSummary.text = textToNumberFormatter(salesBond.svcSlAmt);
  view.columnByName('totSlAmt').headerSummary.text = textToNumberFormatter(salesBond.totSlAmt);
  view.columnByName('slAdjAmt').headerSummary.text = textToNumberFormatter(salesBond.slAdjAmt);
  view.columnByName('totDpAmt').headerSummary.text = textToNumberFormatter(salesBond.totDpAmt);
  view.columnByName('dfaProcsAmt').headerSummary.text = textToNumberFormatter(salesBond.dfaProcsAmt);
  view.columnByName('totUcAmt').headerSummary.text = textToNumberFormatter(salesBond.totUcAmt);
}

async function setHeaderSummary(salesBond) {
  const view = grdSalesBondRef.value.getView();
  view.columnByName('slClYm').headerSummary.text = t('MSG_TXT_SUM');
  if (searchParams.value.sellTpCd === '1') { // 일시불
    await setHeaderSummary1(view, salesBond);
  } else if (searchParams.value.sellTpCd === '2') { // 렌탈
    await setHeaderSummary2(view, salesBond);
  } else if (searchParams.value.sellTpCd === '3') { // 멤버십
    await setHeaderSummary3(view, salesBond);
  } else if (searchParams.value.sellTpCd === '6') { // 정기배송
    await setHeaderSummary4(view, salesBond);
  } else if (searchParams.value.sellTpCd === '99') { // 리스/할부
    await setHeaderSummary5(view, salesBond);
  }
  view.columnByName('slClYm').headerSummary.styleName = 'text-center';
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/closing/performance/sales-bond', { params: cachedParams });
  const salesBonds = res.data;
  totalCount.value = salesBonds.length - 1; // 총계 가지고 오기 때문에 그 부분 제외

  if (!isEmpty(salesBonds) && salesBonds[0].slClYm === '총      계') {
    await setHeaderSummary(salesBonds[0]);
    salesBonds.shift();
  }

  const view = grdSalesBondRef.value.getView();
  view.getDataSource().setRows(salesBonds);
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await setGridHeader();
  totalCount.value = 0;
  fetchData();
}

async function onClickOpenReport() {
  // TODO: 공통 팝업 호출 정보 설계 확인 중
  /*
  https://kyowon.atlassian.net/wiki/spaces/ForKUS/pages
  /69500965/OZ#1.-%EC%97%85%EB%AC%B4-%ED%99%94%EB%A9%B4%EC%97%90%EC%84%9C-%EB%A6%AC%ED%8F%AC%ED%8A%B8-%ED%98%B8%EC%B6%9C
  */
}
async function onClickExcelDownload() {
  const view = grdSalesBondRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

watch(() => searchParams.value.sellTpCd, async (sellTpCd) => {
  dynamicChangeCodes.value.SELL_TP_DTL_CD = customCodes.value.SELL_TP_DTL_CD.filter(
    (obj) => (obj.userDfn02 === sellTpCd),
  );
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initSalesBondGrid = defineGrid(async (data, view) => {
  await setGridColumnLayoutType1(data, view);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
