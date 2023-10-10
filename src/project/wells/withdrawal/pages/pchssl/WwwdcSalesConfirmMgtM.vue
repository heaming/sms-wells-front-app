<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDB
2. 프로그램 ID : WwwdcSalesConfirmMgtM - 매출인식현황 W-WD-U-0171M01
3. 작성자 : kimoon.lim
4. 작성일 : 2023.05.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
영업마감 - 매출관리 - 매출 확정 현황
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 매출인식일 -->
        <kw-search-item
          :label="t('MSG_TXT_SL_RCOG_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDate"
            v-model:to="searchParams.endDate"
          />
          <!-- rules="date_range_months:1" -->
        </kw-search-item>
        <!-- 판매유형 -->
        <kw-search-item
          :label="t('MSG_TXT_SEL_TYPE')"
        >
          <kw-option-group
            v-model="searchParams.cellTpCd"
            type="radio"
            :options="codes.SELL_TP_CD"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 판매채널 -->
        <kw-search-item
          :label="t('TXT_MSG_SELL_CHNL_CD')"
        >
          <kw-select
            v-model="searchParams.sellChnl"
            :options="codes.SELL_CHNL_DTL_CD"
            first-option="all"
          />
        </kw-search-item>

        <!-- 조직레벨 -->
        <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
          <!-- v-model:og-levl-dv-cd3="searchParams.dgr3LevlOgId" 설계서상x 임시제거 필요시추가 -->
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.dgr1LevlOgId"
            v-model:og-levl-dv-cd2="searchParams.dgr2LevlOgId"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.baseYm"
            :start-level="1"
            :end-level="2"
          />
        </kw-search-item>
        <!-- 매출인식구분 -->
        <kw-search-item
          :label="t('MSG_TXT_SL_RCOG_DV_CD')"
        >
          <kw-select
            v-model="searchParams.slRcogDv"
            first-option="all"
          />
          <!-- :options="코드값추가必(매출인식코드)" -->
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 계약상세번호 -->
        <kw-search-item :label="t('MSG_TXT_CNTR_DTL_NO')">
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :page-size="30"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
          />
          <!-- 단위:(원)-->
          <span class="ml8">{{ t('MSG_TXT_UNIT_COLON_WON') }} </span>
        </template>

        <!-- 엑셀다운 -->
        <kw-btn
          icon="download_on"
          secondary
          dense
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount===0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 렌탈 신규/철거 집계현황 -->
        <kw-btn
          :label="t('MSG_TXT_RENTAL_NW_REQD_AGRG_PS')"
          secondary
          dense
          :disable="true"
          @click="onClickMoveToPage"
        />
        <!-- 매출인식취소 -->
        <kw-btn
          :label="t('MSG_TXT_SL_RCOG_CAN')"
          secondary
          dense
          :disable="true"
          @click="onClickSalesRecognitionCancel"
        />
        <!-- 매출 재인식-->
        <kw-btn
          :label="t('MSG_TXT_SL_RE_RCOG')"
          secondary
          dense
          :disable="true"
          @click="onClickSalesRecognize"
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
// Initialize Component
// -------------------------------------------------------------------------------------------------

import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import { getComponentType, defineGrid, useGlobal, useMeta, gridUtil, codeUtil, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { currentRoute } = useRouter();
const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { getConfig, getUserInfo } = useMeta();
const { t } = useI18n();
const now = dayjs();
const apiUrl = '/sms/wells/withdrawal/pchssl/sales-confirm';
const { confirm, alert, notify } = useGlobal();
const { wkOjOgTpCd, ogTpCd } = getUserInfo();

const searchParams = ref({
  ogTpCd: wkOjOgTpCd === null ? ogTpCd : wkOjOgTpCd,
  cntrNo: '',
  cntrSn: '',
  cellTpCd: '1', // 업무구분 1~7 (기본:일시불)
  dgr1LevlOgId: '', // 조직레벨LV1
  dgr2LevlOgId: '', // 조직레벨LV2
  // dgr3LevlOgId: '', // 설계서상x
  startDate: now.format('YYYYMM01'), // 매출인식일 From
  endDate: now.format('YYYYMMDD'), // 매출인식일 To
  sellChnl: '', // 판매채널
  slRcogDv: '', // 판매인식구분
  baseYm: dayjs().format('YYYYMM'),
});

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD', // 업무구분(판매유형) - 라디오
  'SELL_CHNL_DV_CD', // 판매채널구분코드 - 내용상이
  '', // 매출인식구분
  'COD_PAGE_SIZE_OPTIONS',
  'SL_RCOG_PRD_DV_CD',
  'SL_RCOG_PRD_CD',
  'SELL_CHNL_DTL_CD', // 판매채널
);
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  const res = await dataService.get(`${apiUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  data.checkRowStates(true);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get(`${apiUrl}/excel-download`, { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

// 페이지 미완성으로 임시주석
async function onClickMoveToPage() {
  // 렌탈 신규 및 철거 집계현황 이동
  /* TODO: 렌탈 신규/철거 집계현황 페이지 미완성으로 주석 : 확인必 */
  // await currentRoute.push({
  //   path: '페-이-지-path',
  //   query: {},
  // });
}
async function validationCheck() {
  const view = grdMainRef.value.getView();
  const checkedRow = gridUtil.getCheckedRowValues(view);

  if (checkedRow.length > 0) {
    return false;
  }
  alert(t('MSG_ALT_NO_CHECK_DATA'));
  return true;
}
// 인식상태변경 function
async function changeState(state) {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  checkedRows.forEach((p1) => {
    p1.state = state;
  });
  await dataService.post(`${apiUrl}/change-state`, checkedRows);
}
// 매출인식취소 버튼
async function onClickSalesRecognitionCancel() {
  if (await validationCheck()) { return false; }
  if (await confirm(t('MSG_ALT_CHO_DTA_SL_RCOG_STAT_CAN'))) {
    // 매출인식상태 컬럼x 임시 처리 - 서비스 확인 必.

    await changeState('C'); // *임시 상태값 - 상태값(C: Cancel)
  }
}

// 매출 재인식
async function onClickSalesRecognize() {
  if (await validationCheck()) { return false; }
  // TODO: 인식상태코드 현재 없음. 추후 수정시 상태값 확인必
  await changeState('R'); // *임시 상태값 - 상태값(R: Recoginize)
  // console.log('매출 재인식: 서비스 UPDATE');
  notify(t('MSG_ALT_CHO_DTA_SL_RCOG_STAT_CH'));
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
/**
 * TODO: EDU와 동작구성 흡사.
 * 매출인식 재인식/인식시키는 화면 (매출확정 상태변경 화면 - 렌탈 신규/철거 집계현황 미완성)
 * ※
 * - cellTpCd - 230623 기준 조회되는 데이터 없어서 미기입시 데이터값 확인가능.
 * - ogTpCd - 조직레벨 코드 임시적으로 넣음. 설계서 변경에 따라 알맞는 값 기입 요청. ( 설계서상 설명없음.)
*/

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogCd' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'sellAmt', dataType: 'number' },
    { fieldName: 'rentalPtrm' },
    { fieldName: 'rentalTn' },
    { fieldName: 'crtErrCn' }, /* 오류 내역: 확인필요 */
    { fieldName: 'mmIstmAmt', dataType: 'number' },
    { fieldName: 'slAmt', dataType: 'number' },
    { fieldName: 'pvdaAmt', dataType: 'number' },
    { fieldName: 'useDt' },
    // { fieldName: 'rentalDc' },
    { fieldName: 'slRcogPrdCd' },
    { fieldName: 'slRcogPrdDvCd' },
    { fieldName: 'ostrDtm', dataType: 'date' },
    { fieldName: 'istDtm', dataType: 'date' },
    { fieldName: 'svDt', dataType: 'date' },
    { fieldName: 'cntrCanDtm', dataType: 'date' },
    { fieldName: 'slRcogDt', dataType: 'date' },
    { fieldName: 'fnlMdfcDtm', dataType: 'date' },
    { fieldName: 'fnlMdfcUsrId' },
    { fieldName: 'col10' },
  ];

  const columns = [
    { fieldName: 'ogCd',
      header: t('MSG_TXT_BLG'), // 소속
      width: '100',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100' }, // 번호
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100' }, // 성명
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100' }, // 고객명
    { fieldName: 'sellTpCd', header: t('MSG_TXT_TASK_DIV'), width: '96', options: codes.SELL_TP_CD }, // 업무구분
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '176', styleName: 'text-center' }, // 상품명
    { fieldName: 'sellAmt', header: t('MSG_TXT_SALE_PRICE'), width: '120', styleName: 'text-right', headerSummary: { numberFormat: '#,###', expression: 'sum' } }, // 판매금액
    { fieldName: 'rentalPtrm', header: t('MSG_TXT_RENT_PRD_MN'), width: '100', styleName: 'text-right' }, // 렌탈기간
    { fieldName: 'rentalTn', header: t('MSG_TXT_RENTAL_NMN'), width: '100', styleName: 'text-right' }, // 렌탈차월
    { fieldName: 'mmIstmAmt', header: t('MSG_TXT_MM_MPY_AMT'), width: '100', styleName: 'text-right', headerSummary: { numberFormat: '#,###', expression: 'sum' } }, // 월납부액
    { fieldName: 'slAmt', header: t('MSG_TXT_SLPRC'), width: '128', styleName: 'text-right', headerSummary: { numberFormat: '#,###', expression: 'sum' } }, // 매출액 -> 매출액(원)
    { fieldName: 'pvdaAmt', header: t('MSG_TXT_PVDA'), width: '128', styleName: 'text-right', headerSummary: { numberFormat: '#,###', expression: 'sum' } }, // 현할차금액 -> 현재가치할인차금
    { fieldName: 'useDt', header: t('MSG_TXT_USE_DAY'), width: '109', styleName: 'text-right' }, // 사용일수
    { fieldName: 'col10', header: t('MSG_TXT_SL_RCOG_STT'), width: '104', styleName: 'text-center' }, // 매출인식상태
    { fieldName: 'crtErrCn', header: t('MSG_TXT_ERR_IZ'), width: '104' }, // 오류내역
    { fieldName: 'slRcogPrdDvCd', header: t('MSG_TXT_SL_RCOG_BASE'), width: '110', options: codes.SL_RCOG_PRD_DV_CD }, // 매출인식기준
    { fieldName: 'slRcogPrdCd', header: t('MSG_TXT_SL_RCOG') + t('MSG_TXT_CYCL'), width: '120', options: codes.SL_RCOG_PRD_CD }, // 매출인식주기코드 -> 매출인식주기
    { fieldName: 'ostrDtm', header: t('MSG_TXT_OSTR_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 출고일자
    { fieldName: 'istDtm', header: t('MSG_TXT_IST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일자
    { fieldName: 'svDt', header: t('MSG_TXT_SV_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 서비스일자
    { fieldName: 'cntrCanDtm', header: t('MSG_TXT_CNTR_CAN_DTM'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 계약취소일자 -> 계약취소일시
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_RCOG') + t('MSG_TXT_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 매출인식일자 -> 매출인식일 -> 매출인식일자
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_CH_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 변경일자
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_MDFR'), width: '104' }, // 변경자
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.setHeaderSummaries({
    visible: true,
    items: [{ height: 40 }],
  });

  view.layoutByColumn('ogCd').summaryUserSpans = [{ colspan: 7 }];
  view.layoutByColumn('rentalPtrm').summaryUserSpans = [{ colspan: 3 }];
  view.layoutByColumn('useDt').summaryUserSpans = [{ colspan: 12 }];
});
</script>

<style scoped>
</style>
