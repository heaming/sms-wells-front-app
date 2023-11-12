<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : idvrve
2. 프로그램 ID : WwwdbDepositAggregateDtlServiceCenterM - 입금집계상세현황_서비스센터
3. 작성자 : heungjun.lee
4. 작성일 : 2023.06.15
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 입금집계상세현황_서비스센터 목록 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <!-- rev:230420 kw-search 전반적인 수정 -->
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_BIL_DT')"
          required
        >
          <!-- label="청구일자" -->
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="t('MSG_TXT_BIL_DT')"
            rules="date_range_required|date_range_months:1"
            @change="onChangeEngineer"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_SRVC_CNTR')"
        >
          <!-- label="서비스 센터" -->
          <kw-select
            v-model="searchParams.ogId"
            first-option="all"
            :options="centerOptions"
          />
        </kw-search-item>
        <!-- <wwsn-engineer-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
          use-og-level="1"
          :use-partner="false"
          dgr1-levl-og-first-option="all"
          dgr1-levl-og-label="ogCdNm"
        /> -->

        <kw-search-item
          :label="t('MSG_TXT_CPRCNF_PROCS')"
        >
          <!-- label="대사처리" -->
          <kw-select
            v-model="searchParams.useYn"
            first-option="all"
            :options="codes.FSH_YN"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_PMT_TYP')"
        >
          <!-- label="결제유형" -->
          <kw-option-group
            v-model="searchParams.stlmDvCd"
            type="radio"
            :options="STLM_DV_CD"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <!-- //rev:230420 kw-search 전반적인 수정 -->

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
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
          <!-- (단위 : 원) -->
        </template>

        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <!-- label="엑셀 다운로드" -->
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          :label="t('MSG_BTN_APLC_RFND')"
          secondary
          dense
          @click="onClickRefundRegP"
        />
        <!-- label="환불신청" -->
        <kw-btn
          v-permission:read
          :label="t('MSG_BTN_CARD_SL_SLIP')"
          secondary
          dense
          @click="onClickPageMove('zwwdb-card-sales-slip-bulk-print')"
        />
        <!-- label="카드매출전표" -->
        <kw-btn
          v-permission:read
          :label="t('MSG_BTN_CASH_RCP')"
          secondary
          dense
          @click="onClickPageMove('zwwdc-cash-sales-receipt-approval-state')"
        />
        <!-- label="현금영수증" -->
        <kw-btn
          v-permission:read
          :label="t('MSG_BTN_TXINV')"
          secondary
          dense
          @click="onClickPageMove('../contract/zwcta-tax-invoice-mgt')"
        />
        <!-- label="세금계산서" -->
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
import { defineGrid, codeUtil, useMeta, useDataService, getComponentType, gridUtil, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
// import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';

const router = useRouter();
const { modal, notify } = useGlobal();
const { getConfig } = useMeta();
const now = dayjs();
const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'FSH_YN', // 완료여부
  'STLM_DV_CD', // 결제구분코드
  'SV_BIZ_DCLSF_CD', // 서비스유형
  'SELL_TP_CD', // 고객구분
  'ISCMP_CD', // 결제처
);

// const { companyCode } = store.getters['meta/getUserInfo'];

const centerOptions = ref();

const STLM_DV_CD = codes.STLM_DV_CD.filter((e) => ['01', '02', '03'].includes(e.codeId));

const grdMainRef = ref(getComponentType('KwGrid'));

const searchParams = ref({
  ogId: '', // 센터코드
  startDt: now.add(-1, 'M').add(1, 'd').format('YYYYMMDD'), // 시작일
  endDt: now.format('YYYYMMDD'), // 종료일
  useYn: '', // 사용여부
  stlmDvCd: codes.STLM_DV_CD[0].codeId, // 결제유형

});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

let cachedParams;

// 조회
async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/deposit-aggregate-service/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  pages.forEach((p1) => {
    p1.cralLocaraTno = p1.cralLocaraTno + p1.mexnoEncr + p1.cralIdvTno;
  });

  const view = grdMainRef.value.getView();

  const data = view.getDataSource();
  data.checkRowStates(false);
  data.setRows(pages);

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);

  data.checkRowStates(true);

  view.layoutByColumn('vstFshDt').groupFooterUserSpans = [{ colspan: 10 }];
  view.layoutByColumn('vstFshDt').footerUserSpans = [{ colspan: 10 }];

  view.groupPanel.visible = false;

  view.groupBy(['ogNm']);

  view.rowGroup.expandedAdornments = 'footer';
}

// 합계
let bilAmtTot = 0;
let dpSumAmtTot = 0;
async function fetchSumData() {
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/deposit-aggregate-service/total-sum', { params: cachedParams });

  bilAmtTot = Number(res.data.bilAmtTot);
  dpSumAmtTot = Number(res.data.dpSumAmtTot);
}

// 조회 버튼
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await fetchSumData();
  await fetchData();
}

async function onClickRefundRegP() {
  const view = grdMainRef.value.getView();

  const checkItem = gridUtil.getCheckedRowValues(view);
  if (checkItem.length === 0) return notify(t('MSG_ALT_NO_CHECK_DATA')); // 선택된 데이터가 없습니다.
  const { result } = await modal({
    component: 'WwwdbServiceRefundRegP',
    componentProps: { checkItem },
  });

  if (result) {
    console.log('checkItem', checkItem);
  }
}

// 화면 이동
async function onClickPageMove(component) {
  router.push({
    path: component,
  });
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/deposit-aggregate-service/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 조직 내역 조회
async function onChangeEngineer() {
  const res = await dataService.get(
    '/sms/wells/withdrawal/idvrve/deposit-aggregate-service/center-code',
    { params: searchParams.value },
  );

  centerOptions.value = res.data;
}

onChangeEngineer();
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [

    { fieldName: 'vstFshDt' }, /* 설치일자 */
    { fieldName: 'dpDtm' }, /* 입금일자 */
    { fieldName: 'ogId' }, /* 센터 id */
    { fieldName: 'ogNm' }, /* 센터명 */
    { fieldName: 'ichrPrtnrNo' }, /* 담당파트너번호 */
    { fieldName: 'prtnrKnm' }, /* 담당파트너명 */
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrCstNo' }, /* 고객번호 */
    { fieldName: 'cstKnm' }, /* 고객명 */
    { fieldName: 'cralLocaraTno' }, /* 휴대폰 앞자리 */
    { fieldName: 'mexnoEncr' }, /* 휴대폰 중간자리 */
    { fieldName: 'cralIdvTno' }, /* 휴대폰 끝자리 */
    { fieldName: 'pdCd' }, /* 상품코드 */
    { fieldName: 'pdNm' }, /* 제품명 */
    { fieldName: 'sellTpCd' }, /* 고객구분 */
    { fieldName: 'svBizDclsfCd' }, /* 고객서비스as설치배정내역 */ /* 서비스유형 */
    { fieldName: 'bilAmt', dataType: 'number' }, /* 청구금액 */
    { fieldName: 'dpSumAmt', dataType: 'number' }, /* 대사금액 */
    { fieldName: 'stlmDvCd' }, /* 결제구분코드 */
    { fieldName: 'stlmDvNo' }, /* 입금번호 */
    { fieldName: 'iscmpCd' }, /* 결제처 */
    { fieldName: 'cardAprno' }, /* 승인번호 */
    { fieldName: 'taxBll' }, /* 세금계산서 */

    // 팝업전달용
    { fieldName: 'crcdonrNm' }, /* 카드주 */
    { fieldName: 'crcdnoEncr' }, /* 카드번호 */
    { fieldName: 'crdcdExpdtYm' },
    { fieldName: 'istmMcn' },
    { fieldName: 'vacNo' },
    { fieldName: 'vacBnkCd' },
    { fieldName: 'itgDpNo' },
    { fieldName: 'csBilNo' },
    { fieldName: 'cstSvAsnNo' },
  ];

  const columns = [
    { fieldName: 'vstFshDt',
      header: t('MSG_TXT_BIL_DT'),
      // '청구일자',
      width: '120',
      styleName: 'text-center',
      datetimeFormat: 'date',
      groupFooter: {
        styleName: 'text-center',
        text: t('MSG_TXT_SBSUM'), // 소계
      },
      footer: {
        text: t('MSG_TXT_SUM'),
        // text: t('합계'),
        styleName: 'text-center',
      },
    },
    { fieldName: 'dpDtm',
      header: t('MSG_TXT_DP_DT'),
      // '입금일자',
      width: '120',
      styleName: 'text-center',
      datetimeFormat: 'date' },
    { fieldName: 'ogNm',
      header: t('MSG_TXT_CENTER_DIVISION'),
      // '센터',
      width: '80',
      styleName: 'text-left',
      groupFooter: {
        styleName: 'text-right',
      },
    },
    { fieldName: 'prtnrKnm',
      header: t('MSG_TXT_EGER'),
      // '엔지니어',
      width: '80',
      styleName: 'text-center' },
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      // '계약상세번호',
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'cntrCstNo',
      header: t('MSG_TXT_CST_NO'),
      // '고객번호',
      width: '120',
      styleName: 'text-center' },
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'),
      // '고객명',
      width: '80',
      styleName: 'text-center' },

    { fieldName: 'cralLocaraTno',
      header: t('MSG_TXT_TEL_NO'),
      // '전화번호',
      width: '113',
      styleName: 'text-center' },
    { fieldName: 'pdNm',
      header: t('MSG_TXT_GOODS_NM'),
      // '제품명',
      width: '120',
      styleName: 'text-left' },
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_CST_DV'),
      // '고객구분',
      width: '80',
      options: codes.SELL_TP_CD,
      styleName: 'text-left' },

    { fieldName: 'svBizDclsfCd',
      header: t('MSG_TXT_SV_TP'),
      // '서비스유형',
      width: '119',
      options: codes.SV_BIZ_DCLSF_CD,
      styleName: 'text-left' },
    { fieldName: 'bilAmt',
      header: t('MSG_TXT_BIL_AMT'),
      // '청구금액',
      width: '100',
      numberFormat: '#,##0',
      styleName: 'text-right',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
        // valueCallback() {
        //   return bilAmtTot;
        // },
      },
      footer: { expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return bilAmtTot;
        } },
    },
    { fieldName: 'dpSumAmt',
      header: t('MSG_TXT_CPRCNF_AMT'),
      // '대사금액',
      numberFormat: '#,##0',
      width: '100',
      styleName: 'text-right',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
        // valueCallback() {
        //   return dpSumAmtTot;
        // },
      },
      footer: { expression: 'sum',
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback() {
          return dpSumAmtTot;
        } },
    },
    { fieldName: 'stlmDvCd',
      header: t('MSG_TXT_PMT_TYP'),
      // '결제유형',
      width: '100',
      options: codes.STLM_DV_CD,
      styleName: 'text-left' },
    { fieldName: 'iscmpCd',
      header: t('MSG_TXT_PYPLC'),
      // '결제처',
      options: codes.ISCMP_CD,
      width: '100',
      styleName: 'text-left' },

    { fieldName: 'stlmDvNo',
      header: t('MSG_TXT_DP_NO'),
      // '입금번호',
      width: '140',
      styleName: 'text-center' },
    { fieldName: 'cardAprno',
      header: t('MSG_TXT_APR_NO'),
      // '승인번호',
      width: '100',
      styleName: 'text-left' },

    { fieldName: 'taxBll',
      header: t('MSG_TXT_TXINV'),
      // '세금계산서',
      width: '100',
      styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.checkBar.exclusive = true;

  view.setFooters({ visible: true, items: [{ height: 40 }] });

  view.setColumnLayout([
    'vstFshDt', 'dpDtm', // single
    {
      header: t('MSG_TXT_CENTER_DIVISION') + t('MSG_TXT_INF'), // colspan title   // 센터정보
      direction: 'horizontal', // merge type
      items: ['ogNm', 'prtnrKnm'],
    },
    {
      header: t('MSG_TXT_CUSTOMER') + t('MSG_TXT_INF'), // 고객정보
      direction: 'horizontal',
      items: ['cntrNo', 'cntrCstNo', 'cstKnm', 'cralLocaraTno', 'pdNm', 'sellTpCd', 'svBizDclsfCd'],
    },
    {
      header: t('MSG_TXT_STLM') + t('MSG_TXT_INF'), // 결제정보
      direction: 'horizontal',
      items: ['bilAmt', 'dpSumAmt', 'stlmDvCd', 'iscmpCd', 'stlmDvNo', 'cardAprno', 'taxBll'],
    },
  ]);
});

</script>
<style scoped>
</style>
